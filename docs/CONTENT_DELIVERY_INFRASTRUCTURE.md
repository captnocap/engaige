# Content Delivery Infrastructure

Technical implementation of the content delivery system. Encrypted JSON on a free CDN.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        BUILD PIPELINE                            │
│  content/*.json → encrypt → public/*.enc → push to GitHub       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      CLOUDFLARE PAGES                            │
│  https://content.engaige.game/v1/*.enc                          │
│  - Free unlimited bandwidth                                      │
│  - Global CDN (300+ edge locations)                             │
│  - Auto-deploy on GitHub push                                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        GAME CLIENT                               │
│  fetch → decrypt (AES-256-GCM) → parse JSON → merge with game   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Hosting: Cloudflare Pages

**Cost: $0**

| Feature | Limit |
|---------|-------|
| Bandwidth | Unlimited |
| Requests | Unlimited |
| Sites | Unlimited |
| Build minutes | 500/month (plenty) |
| Storage | 25MB per file, 20k files |

### Setup

1. Create GitHub repo: `engaige-content`
2. Connect to Cloudflare Pages
3. Set build command: `bun run build`
4. Set output directory: `public`
5. Add custom domain: `content.engaige.game`

### Deployment Flow

```
git push → GitHub Actions → Build & Encrypt → Cloudflare Pages
```

---

## Encryption

### Algorithm

**AES-256-GCM** (Authenticated Encryption)
- 256-bit key
- 96-bit IV (random per file)
- 128-bit auth tag (integrity verification)
- Industry standard, fast, secure

### Key Management

```
┌─────────────────────────────────────────────────────────────────┐
│ MASTER KEY (32 bytes)                                           │
│ - Stored in GitHub Secrets (for build pipeline)                 │
│ - Embedded in game binary (obfuscated)                          │
│ - Rotated with major game versions                              │
└─────────────────────────────────────────────────────────────────┘
```

**Key Rotation Strategy:**
- Each major version can have a new key
- Old content re-encrypted with new key on rotation
- Game ships with current key only
- If key leaks, rotate with next update

### Encrypted File Format

```
┌──────────┬──────────┬───────────────────┬──────────┐
│ Version  │    IV    │    Ciphertext     │   Tag    │
│ (1 byte) │(12 bytes)│    (variable)     │(16 bytes)│
└──────────┴──────────┴───────────────────┴──────────┘
```

- **Version**: Encryption format version (for future changes)
- **IV**: Random initialization vector (unique per file)
- **Ciphertext**: Encrypted JSON content
- **Tag**: Authentication tag (verifies integrity)

### File Extension

Encrypted files use `.enc` extension:
```
manifest.json  →  manifest.enc
content/foo.json  →  content/foo.enc
```

---

## Repository Structure

```
engaige-content/
├── content/                    # Source content (unencrypted, git-ignored in public builds)
│   ├── sites/
│   │   ├── threadit/
│   │   │   ├── quantum-roommate-aita.json
│   │   │   └── trust-fall-tim-ama.json
│   │   ├── dailybuzz/
│   │   │   └── fda-quantum-ruling.json
│   │   └── ...
│   ├── events/
│   │   └── halloween-2026/
│   │       ├── manifest.json       # Event-specific manifest
│   │       ├── strangerzone-spooky.json
│   │       └── ...
│   └── story-arcs/
│       └── hartwell-revelation/
│           ├── 01-listing-appears.json
│           ├── 02-news-coverage.json
│           └── ...
│
├── schemas/                    # JSON schemas for validation
│   ├── meta.schema.json
│   ├── threadit-post.schema.json
│   ├── dailybuzz-article.schema.json
│   └── ...
│
├── scripts/
│   ├── build.ts               # Main build script
│   ├── encrypt.ts             # Encryption utilities
│   ├── validate.ts            # Schema validation
│   └── generate-manifest.ts   # Manifest generator
│
├── public/                     # Built output (encrypted)
│   └── v1/
│       ├── manifest.enc
│       ├── feed.enc
│       ├── sites/
│       │   └── threadit/
│       │       └── feed.enc
│       └── content/
│           ├── abc123.enc
│           └── ...
│
├── .github/
│   └── workflows/
│       └── deploy.yml          # CI/CD pipeline
│
├── package.json
├── tsconfig.json
└── README.md
```

---

## Build Pipeline

### Scripts

**scripts/encrypt.ts**
```typescript
import { createCipheriv, randomBytes } from 'crypto';

const ENCRYPTION_VERSION = 0x01;

export function encrypt(plaintext: string, key: Buffer): Buffer {
  const iv = randomBytes(12);  // 96-bit IV for GCM
  const cipher = createCipheriv('aes-256-gcm', key, iv);

  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final()
  ]);

  const tag = cipher.getAuthTag();

  // Format: [version(1)][iv(12)][ciphertext(n)][tag(16)]
  return Buffer.concat([
    Buffer.from([ENCRYPTION_VERSION]),
    iv,
    encrypted,
    tag
  ]);
}

export function decrypt(data: Buffer, key: Buffer): string {
  const version = data[0];
  if (version !== ENCRYPTION_VERSION) {
    throw new Error(`Unknown encryption version: ${version}`);
  }

  const iv = data.subarray(1, 13);
  const tag = data.subarray(-16);
  const ciphertext = data.subarray(13, -16);

  const decipher = createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);

  return Buffer.concat([
    decipher.update(ciphertext),
    decipher.final()
  ]).toString('utf8');
}
```

**scripts/build.ts**
```typescript
import { encrypt } from './encrypt';
import { validateContent } from './validate';
import { generateManifest } from './generate-manifest';
import { readdir, readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

const KEY = Buffer.from(process.env.CONTENT_ENCRYPTION_KEY!, 'hex');

async function build() {
  console.log('Building content...');

  // 1. Read all content files
  const contentFiles = await glob('content/**/*.json');

  // 2. Validate against schemas
  for (const file of contentFiles) {
    await validateContent(file);
  }

  // 3. Generate manifest
  const manifest = await generateManifest(contentFiles);

  // 4. Encrypt and write each file
  await mkdir('public/v1/content', { recursive: true });

  for (const file of contentFiles) {
    const content = await readFile(file, 'utf8');
    const encrypted = encrypt(content, KEY);
    const outPath = getOutputPath(file);
    await writeFile(outPath, encrypted);
  }

  // 5. Encrypt and write manifest
  const manifestEncrypted = encrypt(JSON.stringify(manifest), KEY);
  await writeFile('public/v1/manifest.enc', manifestEncrypted);

  // 6. Generate and encrypt per-site feeds
  await generateSiteFeeds(contentFiles, KEY);

  console.log(`Built ${contentFiles.length} content files`);
}

build().catch(console.error);
```

### GitHub Actions Workflow

**.github/workflows/deploy.yml**
```yaml
name: Deploy Content

on:
  push:
    branches: [main]
  workflow_dispatch:  # Manual trigger

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: oven-sh/setup-bun@v1
        with:
          bun-version: latest

      - name: Install dependencies
        run: bun install

      - name: Build and encrypt
        run: bun run build
        env:
          CONTENT_ENCRYPTION_KEY: ${{ secrets.CONTENT_ENCRYPTION_KEY }}

      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: engaige-content
          directory: public
```

---

## Game Client Integration

### Key Storage (Obfuscated)

The encryption key is embedded in the game binary, not stored as a plain string.

**Option 1: Environment variable at build time (Tauri)**
```rust
// src-tauri/src/main.rs
const CONTENT_KEY: &[u8; 32] = include_bytes!("../content_key.bin");
```

**Option 2: Derived from multiple sources**
```typescript
// Key is XOR of multiple values scattered through code
const PART_1 = [0x1a, 0x2b, ...];  // In file A
const PART_2 = [0x3c, 0x4d, ...];  // In file B
const PART_3 = [0x5e, 0x6f, ...];  // In file C

function getContentKey(): Uint8Array {
  return PART_1.map((b, i) => b ^ PART_2[i] ^ PART_3[i]);
}
```

**Option 3: WASM module**
```typescript
// Key derivation in compiled WASM (harder to reverse)
import { deriveKey } from './crypto.wasm';
const key = deriveKey();
```

### Decryption in TypeScript/Bun

**server/src/services/content-crypto.ts**
```typescript
import { createDecipheriv } from 'crypto';

const CONTENT_KEY = getContentKey();  // However we're storing it

export function decryptContent(encryptedData: Buffer): string {
  const version = encryptedData[0];
  if (version !== 0x01) {
    throw new Error(`Unknown content encryption version: ${version}`);
  }

  const iv = encryptedData.subarray(1, 13);
  const tag = encryptedData.subarray(-16);
  const ciphertext = encryptedData.subarray(13, -16);

  const decipher = createDecipheriv('aes-256-gcm', CONTENT_KEY, iv);
  decipher.setAuthTag(tag);

  return Buffer.concat([
    decipher.update(ciphertext),
    decipher.final()
  ]).toString('utf8');
}
```

### Fetch and Decrypt Flow

**server/src/services/content-feed.ts**
```typescript
import { decryptContent } from './content-crypto';

const CDN_BASE = 'https://content.engaige.game/v1';

export async function fetchManifest(): Promise<ContentManifest> {
  const response = await fetch(`${CDN_BASE}/manifest.enc`);
  const encrypted = Buffer.from(await response.arrayBuffer());
  const decrypted = decryptContent(encrypted);
  return JSON.parse(decrypted);
}

export async function fetchContent(id: string): Promise<ContentItem> {
  const response = await fetch(`${CDN_BASE}/content/${id}.enc`);
  const encrypted = Buffer.from(await response.arrayBuffer());
  const decrypted = decryptContent(encrypted);
  return JSON.parse(decrypted);
}
```

---

## Security Considerations

### What This Protects Against

| Threat | Protected? | Notes |
|--------|------------|-------|
| Casual browsing of CDN | ✅ Yes | Can't just open JSON in browser |
| Spoiler scrapers | ✅ Yes | Need to extract key from game |
| Content preview sites | ✅ Yes | Can't parse without game |
| Determined reverse engineers | ❌ No | Key is in client, can be extracted |
| Traffic sniffing | ✅ Yes | Content encrypted, HTTPS for transport |

### What This Does NOT Protect Against

- Someone decompiling the game to extract the key
- Memory dumping decrypted content
- Modifying the game to dump decrypted files

**That's fine.** The goal isn't DRM. It's:
1. Prevent casual spoiler browsing
2. Make data mining annoying enough most won't bother
3. Keep story surprises for players who want them

### Key Rotation

When key is compromised (or just periodically):

1. Generate new key
2. Update GitHub secret
3. Update game client (requires game update)
4. Re-run build pipeline (re-encrypts all content)
5. Old game versions can't read new content (acceptable)

---

## Cost Breakdown

| Service | Cost | Notes |
|---------|------|-------|
| Cloudflare Pages | $0 | Unlimited bandwidth |
| GitHub (repo + Actions) | $0 | Free tier sufficient |
| Domain name | ~$12/year | content.engaige.game |
| **Total** | **~$1/month** | Just the domain |

### Scaling

Even at scale, costs stay near zero:
- 10,000 players polling daily = ~10k requests/day = nothing for Cloudflare
- 1MB average content size = 10GB/day = free tier
- No compute costs (static files)

---

## Monitoring

### Cloudflare Analytics (Free)

- Request counts
- Bandwidth usage
- Geographic distribution
- Cache hit rates

### Build Status

- GitHub Actions shows build success/failure
- Discord/Slack webhook for notifications

---

## Content Authoring Workflow

### For Us (Content Authors)

1. **Create content** in `content/sites/{site}/{slug}.json`
2. **Validate locally**: `bun run validate`
3. **Preview** (optional): `bun run preview` serves decrypted locally
4. **Commit and push** to main branch
5. **Auto-deploy**: GitHub Actions encrypts and pushes to Cloudflare
6. **Verify**: Check Cloudflare Pages deployment status

### Content File Template

```json
{
  "meta": {
    "id": "unique-content-id",
    "site": "threadit",
    "type": "post",
    "publishedAt": "2026-01-25T00:00:00Z",
    "expiresAt": null,
    "tags": ["quantum-coffee", "drama"],
    "requires": []
  },
  "content": {
    "subreddit": "r/AmITheAsshole",
    "title": "AITA for unplugging my roommate's quantum coffee machine?",
    "author": "QuantumSkeptic847",
    "body": "So my roommate got into this quantum coffee thing...",
    "upvotes": 8472,
    "awards": ["gold", "helpful"],
    "comments": [
      {
        "author": "CoffeeObserver",
        "body": "YTA. You collapsed the wave function.",
        "upvotes": 2341
      }
    ]
  }
}
```

---

## Implementation Checklist

### Phase 1: Infrastructure Setup
- [ ] Create `engaige-content` GitHub repo
- [ ] Set up Cloudflare Pages project
- [ ] Configure custom domain
- [ ] Generate encryption key
- [ ] Add key to GitHub Secrets
- [ ] Write build scripts
- [ ] Write GitHub Actions workflow
- [ ] Test encrypt → deploy → fetch cycle

### Phase 2: Game Integration
- [ ] Add content key to game client (obfuscated)
- [ ] Implement `content-crypto.ts` decryption
- [ ] Implement `content-feed.ts` fetching
- [ ] Add settings UI for opt-in
- [ ] Implement local SQLite caching
- [ ] Test full flow

### Phase 3: Content Migration
- [ ] Define JSON schemas for each site type
- [ ] Create template files
- [ ] Migrate hardcoded content to content repo
- [ ] Set up validation in CI

### Phase 4: Go Live
- [ ] Initial content batch
- [ ] Announce to players
- [ ] Monitor analytics
- [ ] Iterate on content schedule

---

## Related Documentation

- [CONTENT_DELIVERY_SYSTEM.md](CONTENT_DELIVERY_SYSTEM.md) - High-level system design
- [WORLD_LORE.md](WORLD_LORE.md) - Content guidelines and lore bible
- [FILLER_SITES.md](FILLER_SITES.md) - Site schemas and quality standards
