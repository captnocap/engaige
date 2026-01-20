// Flexible Image Generation System

## Overview

The image generation system supports any image generation provider through flexible payload templates. This allows you to configure custom providers with vastly different API structures (DALL-E, Stable Diffusion, Midjourney, ComfyUI, etc.).

## Key Features

- **Flexible Payload Templates**: Define custom JSON payloads for any provider
- **Automatic Image Compression**: Sharp-based compression to meet payload size limits
- **img2img Support**: Character reference images for consistency
- **Budget Tracking**: Per-request cost tracking
- **Provider-Specific Settings**: Different compression/quality settings per provider

## Architecture

### Database Schema

```sql
CREATE TABLE image_gen_providers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  base_url TEXT NOT NULL,
  api_key TEXT,
  is_active INTEGER DEFAULT 0,
  supports_img2img INTEGER DEFAULT 0,
  payload_template TEXT NOT NULL,     -- JSON with {placeholders}
  response_path TEXT NOT NULL,        -- Path to extract image URL
  cost_config TEXT,                   -- JSON cost configuration
  created_at INTEGER,
  updated_at INTEGER
);
```

### Payload Templates

Templates use `{placeholder}` syntax for dynamic values:

**DALL-E 3 Template:**
```json
{
  "model": "dall-e-3",
  "prompt": "{prompt}",
  "size": "{size}",
  "quality": "{quality}",
  "style": "{style}",
  "n": "{n}"
}
```

**Stable Diffusion Template:**
```json
{
  "text_prompts": [{"text": "{prompt}"}],
  "cfg_scale": {cfg_scale},
  "height": {height},
  "width": {width},
  "samples": {n},
  "steps": {steps}
}
```

**ComfyUI Template (Advanced):**
```json
{
  "prompt": {
    "3": {
      "inputs": {
        "text": "{prompt}",
        "seed": {seed},
        "steps": {steps},
        "cfg": {cfg_scale}
      }
    }
  }
}
```

### Response Paths

JSON path notation to extract the image URL from response:

- `"data.0.url"` → response.data[0].url
- `"artifacts.0.base64"` → response.artifacts[0].base64 (auto-converts to data URL)
- `"images.0"` → response.images[0]

## Available Parameters

When building payloads, these parameters are automatically provided:

| Parameter | Type | Description |
|-----------|------|-------------|
| `{prompt}` | string | Image generation prompt |
| `{size}` | string | Size format like "1024x1024" |
| `{width}` | number | Width in pixels |
| `{height}` | number | Height in pixels |
| `{quality}` | string | Quality setting ("standard", "hd") |
| `{style}` | string | Style setting ("vivid", "natural") |
| `{n}` | number | Number of images to generate |
| `{cfg_scale}` | number | Classifier-Free Guidance scale (SD) |
| `{steps}` | number | Number of inference steps (SD) |
| `{sampler}` | string | Sampler name (SD) |

## Image Compression

### Automatic Compression

All images sent to providers are automatically compressed:

```typescript
import { compressImageBuffer } from './services/image-compression.js';

const result = await compressImageBuffer(imageBuffer, {
  maxSizeKB: 4096,      // 4MB limit
  maxWidth: 2048,       // Max dimensions
  maxHeight: 2048,
  quality: 85,          // JPEG/WebP quality
  format: 'jpeg',       // Output format
});
```

### Provider-Specific Settings

```typescript
const compressionSettings = getProviderCompressionSettings('stable-diffusion-xl');
// Returns: { maxSizeKB: 10240, maxWidth: 2048, quality: 85, format: 'jpeg' }
```

### Adaptive Quality

If image exceeds size limit, compression automatically:
1. Reduces quality in 10-point increments (85 → 75 → 65 → ...)
2. Switches PNG to JPEG if needed
3. Reduces dimensions by 20% if quality hits minimum
4. Attempts up to 5 times to meet size requirement

## Configuration

### Adding a New Provider

```typescript
import { upsertImageGenProvider } from './services/image-gen-config.js';

upsertImageGenProvider({
  name: 'my-custom-provider',
  display_name: 'My Custom Provider',
  base_url: 'https://api.example.com/v1/generate',
  api_key: 'sk-...',
  is_active: true,
  supports_img2img: true,
  payload_template: JSON.stringify({
    prompt: "{prompt}",
    width: "{width}",
    height: "{height}",
    // ... your provider's parameters
  }),
  response_path: 'result.image_url',
  cost_config: {
    'default': 5,          // $0.05 per image
    '1024x1024': 4,        // $0.04 for standard size
    '1024x1024_hd': 8,     // $0.08 for HD
  },
});
```

### Setting Active Provider

```typescript
import { setActiveImageGenProvider } from './services/image-gen-config.js';

setActiveImageGenProvider('my-custom-provider');
```

### img2img Configuration

For providers supporting img2img, the reference image is automatically:
1. Fetched from URL
2. Compressed to meet provider limits
3. Converted to base64
4. Injected into payload

Different providers use different parameter names for reference images:
- `init_image` (Stable Diffusion)
- `image` (Some alternatives)
- `reference_image` (Others)

The system tries all common variations.

## Usage Examples

### Generate Image

```typescript
import { generateImage } from './services/image-generation-proxy.js';

const result = await generateImage(
  "A serene mountain landscape at sunset",
  {
    size: '1024x1024',
    quality: 'standard',
    style: 'artistic',
  }
);

console.log(result.imageUrl); // URL to generated image
```

### Generate with Character Reference (img2img)

```typescript
import { generateImageWithCharacterReference } from './services/image-generation-proxy.js';

const result = await generateImageWithCharacterReference(
  "Character standing in a futuristic city",
  "https://example.com/character-reference.jpg", // Reference image
  {
    referenceStrength: 0.7, // How closely to follow reference
  }
);
```

### Generate NPC Profile Portrait

```typescript
import { generateNPCProfilePortrait } from './services/image-generation-proxy.js';

const result = await generateNPCProfilePortrait({
  display_name: "Alex",
  gender: "nonbinary",
  age: 26,
  occupation: "Graphic Designer",
  aesthetic_style: "indie",
});

console.log(result.imageUrl);
console.log(result.promptUsed); // Actual prompt sent to API
```

## Cost Management

### Cost Configuration

Costs are defined per provider in cents (USD):

```typescript
{
  "cost_config": {
    "default": 5,                    // Default: $0.05
    "1024x1024": 4,                  // Specific size
    "1024x1024_standard": 4,         // Size + quality
    "1024x1024_hd": 8,               // HD quality
    "1792x1024_standard": 8          // Landscape
  }
}
```

### Budget Checking

```typescript
// Budget is automatically checked before image generation
const budgetCheck = checkBudgetAllows('image_generation', costCents);
if (!budgetCheck.allowed) {
  throw new Error(`Budget exceeded: ${budgetCheck.reason}`);
}
```

### Cost Logging

Every image generation is logged:

```typescript
logApiCost({
  provider: 'dall-e-3',
  model: 'dall-e-3',
  feature_category: 'image_generation',
  cost_cents: 4,
  request_metadata: {
    prompt: "...",
    size: "1024x1024",
    quality: "standard",
  },
});
```

## Default Providers

### DALL-E 3 (Pre-configured)

```typescript
{
  name: 'dall-e-3',
  base_url: 'https://api.openai.com/v1/images/generations',
  supports_img2img: false,
  payload_template: {
    "model": "dall-e-3",
    "prompt": "{prompt}",
    "size": "{size}",
    "quality": "{quality}",
    "style": "{style}",
    "n": "{n}"
  },
  response_path: 'data.0.url',
  cost_config: {
    "1024x1024_standard": 4,
    "1024x1024_hd": 8,
    "1792x1024_standard": 8,
    "1792x1024_hd": 12
  }
}
```

### Stable Diffusion XL (Pre-configured)

```typescript
{
  name: 'stable-diffusion-xl',
  base_url: 'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image',
  supports_img2img: true,
  payload_template: {
    "text_prompts": [{"text": "{prompt}"}],
    "cfg_scale": {cfg_scale},
    "height": {height},
    "width": {width},
    "samples": {n},
    "steps": {steps}
  },
  response_path: 'artifacts.0.base64',
  cost_config: {
    "default": 3
  }
}
```

## Advanced Examples

### Custom Provider with Complex Payload

```typescript
upsertImageGenProvider({
  name: 'comfyui-workflow',
  display_name: 'ComfyUI Workflow',
  base_url: 'http://localhost:8188/prompt',
  supports_img2img: true,
  payload_template: JSON.stringify({
    prompt: {
      "3": {
        class_type: "KSampler",
        inputs: {
          text: "{prompt}",
          seed: 42,
          steps: "{steps}",
          cfg: "{cfg_scale}",
          width: "{width}",
          height: "{height}"
        }
      }
    }
  }),
  response_path: 'outputs.0.images.0',
  cost_config: { default: 0 }, // Free local generation
});
```

## Files

- `server/src/services/image-generation-proxy.ts` - Main image generation service
- `server/src/services/image-gen-config.ts` - Provider configuration management
- `server/src/services/image-compression.ts` - Image compression with Sharp
- `server/src/db/index.ts` - Database schema for providers

## Best Practices

1. **Test Payloads**: Always test with small requests first
2. **Monitor Costs**: Set appropriate budget limits for image generation
3. **Compression**: Let automatic compression handle size limits
4. **Reference Images**: Use character references for consistent NPC appearance
5. **Error Handling**: Implement fallbacks for failed generations
6. **Quality vs Cost**: Balance quality settings with budget constraints

## Troubleshooting

### Image Generation Fails

1. Check payload template matches provider's API
2. Verify response_path extracts correct field
3. Check API key and base URL
4. Review provider's documentation for parameter names

### Payload Too Large

1. Image compression will attempt to reduce size automatically
2. Check `maxSizeKB` in compression settings
3. Consider reducing image dimensions
4. Switch from PNG to JPEG format

### Wrong Image Extracted

1. Verify `response_path` matches actual API response structure
2. Test with small request and log full response
3. Update path to match provider's response format
