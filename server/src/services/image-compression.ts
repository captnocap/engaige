// Image compression service to handle payload size limits
// Ensures images stay within provider limits and optimizes for API requests

import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';

export interface CompressionOptions {
  maxSizeKB?: number; // Maximum file size in KB (default: 4096 = 4MB)
  maxWidth?: number; // Maximum width in pixels (default: 2048)
  maxHeight?: number; // Maximum height in pixels (default: 2048)
  quality?: number; // JPEG/WebP quality 0-100 (default: 85)
  format?: 'jpeg' | 'png' | 'webp'; // Output format (default: jpeg)
  stripMetadata?: boolean; // Remove EXIF data (default: true)
}

const DEFAULT_OPTIONS: Required<CompressionOptions> = {
  maxSizeKB: 4096, // 4MB default
  maxWidth: 2048,
  maxHeight: 2048,
  quality: 85,
  format: 'jpeg',
  stripMetadata: true,
};

/**
 * Compress an image buffer to meet size constraints
 * Automatically adjusts quality if needed to stay under maxSizeKB
 */
export async function compressImageBuffer(
  inputBuffer: Buffer,
  options: CompressionOptions = {}
): Promise<{
  buffer: Buffer;
  format: string;
  width: number;
  height: number;
  sizeKB: number;
  compressionRatio: number;
}> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  let image = sharp(inputBuffer);

  // Get metadata
  const metadata = await image.metadata();
  const originalSizeKB = inputBuffer.length / 1024;

  console.log(`[Image Compression] Original: ${metadata.width}x${metadata.height}, ${originalSizeKB.toFixed(2)}KB`);

  // Resize if exceeds max dimensions
  if (
    (metadata.width && metadata.width > opts.maxWidth) ||
    (metadata.height && metadata.height > opts.maxHeight)
  ) {
    image = image.resize(opts.maxWidth, opts.maxHeight, {
      fit: 'inside',
      withoutEnlargement: true,
    });
  }

  // Strip metadata if requested
  if (opts.stripMetadata) {
    image = image.withMetadata({
      orientation: metadata.orientation
    });
  }

  // Convert to target format
  let currentQuality = opts.quality;
  let outputBuffer: Buffer;
  let attempt = 0;
  const maxAttempts = 5;

  while (attempt < maxAttempts) {
    attempt++;

    // Apply format-specific compression
    if (opts.format === 'jpeg') {
      image = sharp(inputBuffer)
        .resize(opts.maxWidth, opts.maxHeight, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: currentQuality, mozjpeg: true });
    } else if (opts.format === 'webp') {
      image = sharp(inputBuffer)
        .resize(opts.maxWidth, opts.maxHeight, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: currentQuality });
    } else if (opts.format === 'png') {
      image = sharp(inputBuffer)
        .resize(opts.maxWidth, opts.maxHeight, { fit: 'inside', withoutEnlargement: true })
        .png({ compressionLevel: 9, effort: 10 });
    }

    outputBuffer = await image.toBuffer();
    const outputSizeKB = outputBuffer.length / 1024;

    console.log(`[Image Compression] Attempt ${attempt}: ${outputSizeKB.toFixed(2)}KB at quality ${currentQuality}`);

    // Check if we're under the limit
    if (outputSizeKB <= opts.maxSizeKB) {
      const finalMetadata = await sharp(outputBuffer).metadata();

      return {
        buffer: outputBuffer,
        format: opts.format,
        width: finalMetadata.width || 0,
        height: finalMetadata.height || 0,
        sizeKB: outputSizeKB,
        compressionRatio: originalSizeKB / outputSizeKB,
      };
    }

    // Still too large, reduce quality
    if (opts.format === 'png') {
      // PNG doesn't have quality, switch to JPEG
      opts.format = 'jpeg';
      currentQuality = 85;
      console.log('[Image Compression] PNG too large, switching to JPEG');
      continue;
    }

    // Reduce quality by 10 points each attempt
    currentQuality = Math.max(20, currentQuality - 10);

    if (currentQuality <= 20 && outputSizeKB > opts.maxSizeKB) {
      // At minimum quality, try reducing dimensions further
      opts.maxWidth = Math.floor(opts.maxWidth * 0.8);
      opts.maxHeight = Math.floor(opts.maxHeight * 0.8);
      currentQuality = 60; // Reset quality for smaller image
      console.log(`[Image Compression] Reducing dimensions to ${opts.maxWidth}x${opts.maxHeight}`);
    }
  }

  // If we still can't compress enough, return the last attempt
  console.warn('[Image Compression] Could not compress below size limit after max attempts');
  const finalMetadata = await sharp(outputBuffer!).metadata();

  return {
    buffer: outputBuffer!,
    format: opts.format,
    width: finalMetadata.width || 0,
    height: finalMetadata.height || 0,
    sizeKB: outputBuffer!.length / 1024,
    compressionRatio: originalSizeKB / (outputBuffer!.length / 1024),
  };
}

/**
 * Compress an image file
 */
export async function compressImageFile(
  inputPath: string,
  outputPath: string,
  options: CompressionOptions = {}
): Promise<{
  format: string;
  width: number;
  height: number;
  sizeKB: number;
  compressionRatio: number;
}> {
  const inputBuffer = readFileSync(inputPath);
  const result = await compressImageBuffer(inputBuffer, options);

  writeFileSync(outputPath, result.buffer);

  return {
    format: result.format,
    width: result.width,
    height: result.height,
    sizeKB: result.sizeKB,
    compressionRatio: result.compressionRatio,
  };
}

/**
 * Convert image URL to compressed base64 data URL
 * Useful for embedding images in API payloads
 */
export async function imageUrlToBase64(
  imageUrl: string,
  options: CompressionOptions = {}
): Promise<{
  dataUrl: string;
  mimeType: string;
  sizeKB: number;
}> {
  // Fetch image
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const inputBuffer = Buffer.from(arrayBuffer);

  // Compress
  const result = await compressImageBuffer(inputBuffer, options);

  const mimeType = `image/${result.format}`;
  const base64 = result.buffer.toString('base64');
  const dataUrl = `data:${mimeType};base64,${base64}`;

  return {
    dataUrl,
    mimeType,
    sizeKB: result.sizeKB,
  };
}

/**
 * Get optimal compression settings for a provider
 */
export function getProviderCompressionSettings(providerName: string): CompressionOptions {
  // Provider-specific limits
  const providerLimits: Record<string, CompressionOptions> = {
    'dall-e-3': {
      maxSizeKB: 4096, // 4MB
      maxWidth: 2048,
      maxHeight: 2048,
      quality: 90,
      format: 'png',
    },
    'stable-diffusion-xl': {
      maxSizeKB: 10240, // 10MB
      maxWidth: 2048,
      maxHeight: 2048,
      quality: 85,
      format: 'jpeg',
    },
    'midjourney': {
      maxSizeKB: 8192, // 8MB
      maxWidth: 4096,
      maxHeight: 4096,
      quality: 90,
      format: 'png',
    },
    default: {
      maxSizeKB: 4096, // 4MB safe default
      maxWidth: 2048,
      maxHeight: 2048,
      quality: 85,
      format: 'jpeg',
    },
  };

  return providerLimits[providerName] || providerLimits.default;
}

/**
 * Prepare image for API request (fetch, compress, convert to base64 if needed)
 */
export async function prepareImageForAPI(
  imageUrl: string,
  providerName: string,
  returnFormat: 'url' | 'base64' = 'url'
): Promise<string> {
  if (returnFormat === 'url') {
    // Some providers accept URLs directly, just return it
    return imageUrl;
  }

  // For base64, fetch and compress
  const compressionSettings = getProviderCompressionSettings(providerName);
  const { dataUrl } = await imageUrlToBase64(imageUrl, compressionSettings);

  return dataUrl;
}

export default {
  compressImageBuffer,
  compressImageFile,
  imageUrlToBase64,
  getProviderCompressionSettings,
  prepareImageForAPI,
};
