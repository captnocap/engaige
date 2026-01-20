/**
 * Proxy Configuration Module
 *
 * Manages SOCKS5/HTTP proxy settings for all external requests.
 * The "screen door" - when enabled, all traffic goes through the proxy.
 */

export type ProxyType = 'socks5' | 'socks4' | 'http' | 'https';

export interface ProxyConfig {
  enabled: boolean;
  type: ProxyType;
  host: string;
  port: number;
  auth?: {
    username: string;
    password: string;
  };
}

// Default: proxy disabled
let currentConfig: ProxyConfig = {
  enabled: false,
  type: 'socks5',
  host: '127.0.0.1',
  port: 1080,
};

/**
 * Configure the proxy settings
 */
export function setProxyConfig(config: Partial<ProxyConfig>): void {
  currentConfig = { ...currentConfig, ...config };

  if (currentConfig.enabled) {
    console.log(`[Proxy] Enabled: ${currentConfig.type}://${currentConfig.host}:${currentConfig.port}`);
  } else {
    console.log('[Proxy] Disabled - direct connections');
  }
}

/**
 * Get current proxy configuration
 */
export function getProxyConfig(): ProxyConfig {
  return { ...currentConfig };
}

/**
 * Check if proxy is enabled
 */
export function isProxyEnabled(): boolean {
  return currentConfig.enabled;
}

/**
 * Enable proxy with current settings
 */
export function enableProxy(): void {
  currentConfig.enabled = true;
  console.log(`[Proxy] Enabled: ${currentConfig.type}://${currentConfig.host}:${currentConfig.port}`);
}

/**
 * Disable proxy (direct connections)
 */
export function disableProxy(): void {
  currentConfig.enabled = false;
  console.log('[Proxy] Disabled - direct connections');
}

export default {
  setProxyConfig,
  getProxyConfig,
  isProxyEnabled,
  enableProxy,
  disableProxy,
};
