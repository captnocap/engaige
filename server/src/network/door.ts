/**
 * The Door - Centralized External Request Handler
 *
 * ALL external HTTP requests go through this module.
 * When the "screen door" (proxy) is enabled, all traffic is routed through it.
 *
 * Usage:
 *   import { door } from '../network/door.js';
 *   const response = await door.fetch('https://api.openai.com/v1/...', { ... });
 */

import { SocksClient, type SocksClientOptions } from 'socks';
import * as tls from 'node:tls';
import * as http from 'node:http';
import * as https from 'node:https';
import { getProxyConfig, isProxyEnabled, type ProxyConfig } from './proxy-config.js';

// Request options that mirror fetch() options
export interface DoorRequestInit extends RequestInit {
  // Additional options can be added here if needed
}

/**
 * The main fetch function - all external requests go through here
 */
export async function doorFetch(
  url: string | URL,
  init?: DoorRequestInit
): Promise<Response> {
  const urlObj = typeof url === 'string' ? new URL(url) : url;

  if (!isProxyEnabled()) {
    // Direct connection - use native fetch
    return fetch(url, init);
  }

  const config = getProxyConfig();

  switch (config.type) {
    case 'socks5':
    case 'socks4':
      return await fetchViaSocks(urlObj, init, config);

    case 'http':
    case 'https':
      return await fetchViaHttpProxy(urlObj, init, config);

    default:
      console.warn(`[Door] Unknown proxy type: ${config.type}, using direct connection`);
      return fetch(url, init);
  }
}

/**
 * Fetch via SOCKS4/SOCKS5 proxy
 */
async function fetchViaSocks(
  url: URL,
  init: DoorRequestInit | undefined,
  config: ProxyConfig
): Promise<Response> {
  const isHttps = url.protocol === 'https:';
  const port = url.port ? parseInt(url.port) : (isHttps ? 443 : 80);

  // Create SOCKS connection
  const socksOptions: SocksClientOptions = {
    proxy: {
      host: config.host,
      port: config.port,
      type: config.type === 'socks5' ? 5 : 4,
    },
    command: 'connect',
    destination: {
      host: url.hostname,
      port: port,
    },
  };

  // Add auth if configured
  if (config.auth && config.type === 'socks5') {
    socksOptions.proxy.userId = config.auth.username;
    socksOptions.proxy.password = config.auth.password;
  }

  const { socket } = await SocksClient.createConnection(socksOptions);

  // For HTTPS, wrap socket with TLS
  const finalSocket = isHttps
    ? tls.connect({
        socket: socket,
        servername: url.hostname,
        rejectUnauthorized: true,
      })
    : socket;

  // Wait for TLS connection if needed
  if (isHttps) {
    await new Promise<void>((resolve, reject) => {
      (finalSocket as tls.TLSSocket).once('secureConnect', resolve);
      finalSocket.once('error', reject);
    });
  }

  // Build HTTP request
  const method = init?.method || 'GET';
  const headers = new Headers(init?.headers);

  // Ensure required headers
  if (!headers.has('Host')) {
    headers.set('Host', url.hostname);
  }
  if (!headers.has('Connection')) {
    headers.set('Connection', 'close');
  }

  // Build request line and headers
  const path = url.pathname + url.search;
  let request = `${method} ${path} HTTP/1.1\r\n`;

  headers.forEach((value, key) => {
    request += `${key}: ${value}\r\n`;
  });

  // Add body if present
  let body: string | Buffer | null = null;
  if (init?.body) {
    if (typeof init.body === 'string') {
      body = init.body;
    } else if (init.body instanceof ArrayBuffer) {
      body = Buffer.from(init.body);
    } else if (init.body instanceof Uint8Array) {
      body = Buffer.from(init.body);
    } else {
      body = String(init.body);
    }

    if (!headers.has('Content-Length')) {
      request += `Content-Length: ${Buffer.byteLength(body)}\r\n`;
    }
  }

  request += '\r\n';

  // Send request
  finalSocket.write(request);
  if (body) {
    finalSocket.write(body);
  }

  // Read response
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];

    finalSocket.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });

    finalSocket.on('end', () => {
      const responseData = Buffer.concat(chunks);
      const response = parseHttpResponse(responseData);
      resolve(response);
    });

    finalSocket.on('error', (err) => {
      reject(new Error(`[Door] SOCKS request failed: ${err.message}`));
    });

    // Timeout after 60 seconds
    setTimeout(() => {
      finalSocket.destroy();
      reject(new Error('[Door] SOCKS request timeout'));
    }, 60000);
  });
}

/**
 * Fetch via HTTP/HTTPS proxy (CONNECT method for HTTPS targets)
 */
async function fetchViaHttpProxy(
  url: URL,
  init: DoorRequestInit | undefined,
  config: ProxyConfig
): Promise<Response> {
  const isHttps = url.protocol === 'https:';
  const targetPort = url.port ? parseInt(url.port) : (isHttps ? 443 : 80);

  if (!isHttps) {
    // For HTTP targets, we can use the proxy directly
    // The proxy URL format changes the request
    const proxyUrl = `http://${config.host}:${config.port}`;

    const headers = new Headers(init?.headers);
    if (config.auth) {
      const authString = Buffer.from(`${config.auth.username}:${config.auth.password}`).toString('base64');
      headers.set('Proxy-Authorization', `Basic ${authString}`);
    }

    // For HTTP proxy, we send the full URL to the proxy
    return fetch(url.toString(), {
      ...init,
      headers,
    });
  }

  // For HTTPS targets, use CONNECT tunneling
  return new Promise((resolve, reject) => {
    const connectReq = http.request({
      host: config.host,
      port: config.port,
      method: 'CONNECT',
      path: `${url.hostname}:${targetPort}`,
      headers: config.auth
        ? {
            'Proxy-Authorization': `Basic ${Buffer.from(`${config.auth.username}:${config.auth.password}`).toString('base64')}`,
          }
        : {},
    });

    connectReq.on('connect', (res, socket) => {
      if (res.statusCode !== 200) {
        socket.destroy();
        reject(new Error(`[Door] HTTP proxy CONNECT failed: ${res.statusCode}`));
        return;
      }

      // Upgrade to TLS
      const tlsSocket = tls.connect({
        socket: socket,
        servername: url.hostname,
        rejectUnauthorized: true,
      });

      tlsSocket.once('secureConnect', async () => {
        // Now make the actual request over the TLS socket
        const method = init?.method || 'GET';
        const headers = new Headers(init?.headers);

        if (!headers.has('Host')) {
          headers.set('Host', url.hostname);
        }
        if (!headers.has('Connection')) {
          headers.set('Connection', 'close');
        }

        const path = url.pathname + url.search;
        let request = `${method} ${path} HTTP/1.1\r\n`;

        headers.forEach((value, key) => {
          request += `${key}: ${value}\r\n`;
        });

        let body: string | Buffer | null = null;
        if (init?.body) {
          if (typeof init.body === 'string') {
            body = init.body;
          } else if (init.body instanceof ArrayBuffer) {
            body = Buffer.from(init.body);
          } else if (init.body instanceof Uint8Array) {
            body = Buffer.from(init.body);
          } else {
            body = String(init.body);
          }

          if (!headers.has('Content-Length')) {
            request += `Content-Length: ${Buffer.byteLength(body)}\r\n`;
          }
        }

        request += '\r\n';

        tlsSocket.write(request);
        if (body) {
          tlsSocket.write(body);
        }

        const chunks: Buffer[] = [];

        tlsSocket.on('data', (chunk: Buffer) => {
          chunks.push(chunk);
        });

        tlsSocket.on('end', () => {
          const responseData = Buffer.concat(chunks);
          const response = parseHttpResponse(responseData);
          resolve(response);
        });

        tlsSocket.on('error', (err) => {
          reject(new Error(`[Door] HTTP proxy request failed: ${err.message}`));
        });
      });

      tlsSocket.on('error', (err) => {
        reject(new Error(`[Door] TLS handshake failed: ${err.message}`));
      });
    });

    connectReq.on('error', (err) => {
      reject(new Error(`[Door] CONNECT request failed: ${err.message}`));
    });

    connectReq.end();
  });
}

/**
 * Parse raw HTTP response into a Response object
 */
function parseHttpResponse(data: Buffer): Response {
  const text = data.toString();
  const headerEndIndex = text.indexOf('\r\n\r\n');

  if (headerEndIndex === -1) {
    throw new Error('[Door] Invalid HTTP response: no header terminator');
  }

  const headerSection = text.slice(0, headerEndIndex);
  const bodyStartIndex = headerEndIndex + 4;

  // Parse status line
  const lines = headerSection.split('\r\n');
  const statusLine = lines[0];
  const statusMatch = statusLine.match(/HTTP\/[\d.]+\s+(\d+)\s*(.*)/);

  if (!statusMatch) {
    throw new Error(`[Door] Invalid HTTP status line: ${statusLine}`);
  }

  const status = parseInt(statusMatch[1]);
  const statusText = statusMatch[2] || '';

  // Parse headers
  const headers = new Headers();
  for (let i = 1; i < lines.length; i++) {
    const colonIndex = lines[i].indexOf(':');
    if (colonIndex > 0) {
      const key = lines[i].slice(0, colonIndex).trim();
      const value = lines[i].slice(colonIndex + 1).trim();
      headers.append(key, value);
    }
  }

  // Extract body
  const body = data.slice(Buffer.byteLength(text.slice(0, bodyStartIndex)));

  return new Response(body, {
    status,
    statusText,
    headers,
  });
}

/**
 * Convenience export matching fetch signature
 */
export const door = {
  fetch: doorFetch,
};

export default door;
