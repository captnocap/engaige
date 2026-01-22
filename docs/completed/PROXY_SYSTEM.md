# Vision & Image Generation Proxy System

## Overview

The proxy system allows NPCs to handle images (both receiving and generating) regardless of their underlying model's capabilities. This ensures users aren't limited by model choice and maintains immersion.

## Architecture

### 1. Model Capabilities Detection

**File**: `server/src/services/model-capabilities.ts`

Maintains a database of known model capabilities:
- Vision support (GPT-4o, Claude Sonnet, etc.)
- Image generation (DALL-E, Stable Diffusion)
- Context windows, token limits, etc.

Automatically detects capabilities with fuzzy matching for unknown models.

### 2. Vision Proxy

**File**: `server/src/services/vision-proxy.ts`

**How It Works:**
1. User sends image to NPC
2. System checks if NPC's model supports vision
3. If YES: Pass image directly to NPC's model
4. If NO: Route to vision proxy model (GPT-4o-mini by default)
5. Vision model analyzes image and returns description
6. Description is added to NPC's conversation context
7. NPC responds in their own voice using the description

**Budget Tracking:**
- Uses separate `vision_proxy` budget category (10% default)
- Tracks actual cost from vision model API response
- Vision calls are more expensive than text-only

**Configuration:**
```typescript
import { configureVisionProxy } from './services/vision-proxy.js';

configureVisionProxy({
  provider: 'openai',
  model: 'gpt-4o-mini',
  apiKey: 'sk-...',
});
```

**Example Flow:**
```
User: *shares photo of sunset* "Look at this view!"
   ↓
[System detects NPC uses llama-3.1-70b (no vision)]
   ↓
Vision Proxy (gpt-4o-mini): "The image shows a vibrant sunset
over an ocean, with orange and pink clouds..."
   ↓
NPC (llama-3.1-70b): "Wow, that sunset is absolutely gorgeous!
The colors are insane. Where is this?"
```

### 3. Image Generation Proxy

**File**: `server/src/services/image-generation-proxy.ts`

**How It Works:**
1. User requests NPC to generate image
2. NPC's model creates/refines image prompt (in their style)
3. System routes to image generation model (DALL-E 3 by default)
4. Image is generated
5. NPC responds about the image they "created"

**Budget Tracking:**
- Uses `image_generation` budget category ($20 fixed by default)
- Fixed costs per image (DALL-E 3: $0.04-$0.12)
- Tracks size, quality, and count

**Configuration:**
```typescript
import { configureImageGenProxy } from './services/image-generation-proxy.js';

configureImageGenProxy({
  provider: 'openai',
  model: 'dall-e-3',
  apiKey: 'sk-...',
});
```

**Example Flow:**
```
User: "Can you draw a picture of us at the beach?"
   ↓
NPC: [Refines prompt] "Two people relaxing on a sunny beach,
tropical setting, warm colors, summer vibes"
   ↓
Image Gen Proxy (DALL-E 3): *generates image*
   ↓
NPC: "Here's a little something I made for us! I tried to
capture that perfect summer day feeling 🌊☀️"
```

### 4. Reference Images & Character Consistency

**Database Schema:**

**NPCs:**
- `profile_image_url` - Main portrait (auto-generated during creation)
- `reference_images` - Additional reference photos (JSON array)
- `image_generation_prompt` - Base appearance description

**Players:**
- `avatar_url` - User's profile photo
- `reference_images` - User's photos for img2img
- `image_generation_prompt` - User's appearance description

**NPC Profile Generation:**
During NPC creation, system automatically:
1. Generates portrait based on traits (age, gender, occupation, personality)
2. Stores image URL and prompt used
3. Uses as reference for future image generations

**img2img Workflow:**
```typescript
// Generate scene with NPC using their reference image
const { imageUrl } = await generateImageWithCharacterReference(
  "Person sitting in a coffee shop",
  npc.profile_image_url,
  { referenceStrength: 0.5 }
);

// Generate scene with BOTH user and NPC
const { imageUrl } = await generateImageWithCharacterReference(
  "Two people having coffee together",
  npc.profile_image_url,
  {
    includeMultipleCharacters: true,
    additionalReferenceUrls: [player.avatar_url],
  }
);
```

**For DALL-E (no native img2img):**
- Vision proxy analyzes reference image
- Description incorporated into generation prompt
- Maintains character consistency through detailed descriptions

## Budget Categories

Updated budget allocations:

| Category | Default | Purpose |
|----------|---------|---------|
| Conversations | 35% | Direct NPC chat |
| NPC Generation | 15% | Creating NPCs |
| Autonomous Posts | 10% | Background NPC posts |
| Random Events | 10% | Unexpected interactions |
| **Vision Proxy** | **10%** | **Image analysis** |
| NPC Customization | 5% | Tweaking NPCs |
| **Image Generation** | **$20 fixed** | **Creating images** |
| Other | 15% | Misc operations |

## High-Level API

**File**: `server/src/services/npc-interaction.ts`

Simplified interface that handles proxying automatically:

```typescript
// Send message with image
const response = await sendMessageToNPC(
  npcId,
  "What do you think of this?",
  {
    imageUrl: "https://...",
    platform: "messaging",
  }
);
// Automatically uses vision proxy if needed

// Request image from NPC
const { imageUrl, npcResponse } = await requestNPCImage(
  npcId,
  "Draw us at the park",
  "custom"
);
// Automatically uses image gen proxy

// Check NPC capabilities
const capabilities = canNPCHandleImages(npcId);
// {
//   canReceiveImages: true,  // Always true (proxy!)
//   canGenerateImages: true, // Always true (proxy!)
//   usesVisionProxy: true,   // If model lacks vision
//   usesImageGenProxy: true  // If model lacks image gen
// }
```

## Cost Control

**Vision Proxy Costs:**
- GPT-4o-mini vision: ~$0.01-0.03 per image
- Claude Haiku vision: ~$0.01-0.02 per image
- Budget category prevents runaway spending

**Image Generation Costs:**
- DALL-E 3 (1024x1024 standard): $0.04
- DALL-E 3 (1024x1024 HD): $0.08
- Stable Diffusion: ~$0.03
- Fixed budget cap ($20/month default)

## Future Enhancements

1. **Local Vision Models**: LLaVA, CogVLM for zero-cost vision
2. **Local Image Gen**: Stable Diffusion XL locally
3. **Smart Caching**: Cache vision analysis for same images
4. **Reference Image Library**: Build library of NPC reference poses
5. **Style Transfer**: Apply NPC's aesthetic to any image
6. **Multi-person Scenes**: Generate group photos with multiple NPCs

## Example: Complete User Journey

```
1. User creates profile → Uploads selfie as reference image
2. NPC generated → Auto-generates profile portrait
3. User: "Hey, look at this sunset!" *shares photo*
   → Vision proxy analyzes → NPC responds naturally
4. User: "Can you draw us watching a sunset together?"
   → NPC refines prompt → Image gen proxy creates it
   → Uses both user & NPC reference images for consistency
5. NPC posts on social media → Auto-generates images using reference
```

## Key Benefits

✅ **No user limitations** - Any model can handle images
✅ **Budget conscious** - Separate tracking and limits
✅ **Character consistency** - Reference images persist identity
✅ **Immersion maintained** - NPCs respond in their voice
✅ **Cost transparent** - All proxy costs tracked and logged
✅ **Future-proof** - Easy to add new providers
