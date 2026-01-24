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

## Cryptographic Security

Two-layer protection:

| Layer | Purpose | Algorithm | Key Location |
|-------|---------|-----------|--------------|
| **Signing** | Authenticity (only we can publish) | Ed25519 | Private: our server, Public: game client |
| **Encryption** | Privacy (can't read ahead) | AES-256-GCM | Symmetric key in game client |

Even if someone extracts everything from the game client, they still can't forge content because our private signing key never leaves our build server.

### Why Both?

```
Signing alone:     Content readable, but tamper-proof
Encryption alone:  Content private, but forgeable if key extracted
Both:              Content private AND tamper-proof
```

---

## Signing (Ed25519)

### Key Pair

```
┌─────────────────────────────────────────────────────────────────┐
│ PRIVATE KEY (32 bytes)                                          │
│ - NEVER leaves our build server                                 │
│ - Stored in GitHub Secrets                                      │
│ - Used to sign content before upload                            │
│ - If compromised: generate new pair, ship game update           │
└─────────────────────────────────────────────────────────────────┘
                              ↓ derives
┌─────────────────────────────────────────────────────────────────┐
│ PUBLIC KEY (32 bytes)                                           │
│ - Embedded in game client                                       │
│ - Used to verify signatures                                     │
│ - Safe to expose (that's the point)                             │
└─────────────────────────────────────────────────────────────────┘
```

### Why Ed25519?

- Fast (signing and verification)
- Small signatures (64 bytes)
- Small keys (32 bytes)
- No padding oracle attacks
- Deterministic (same input = same signature)
- Industry standard (used by SSH, Signal, etc.)

### Signature Scope

We sign the **content hash**, not the raw content:

```
signature = Ed25519.sign(SHA256(content_json), private_key)
```

This keeps signatures small regardless of content size.

---

## Encryption (AES-256-GCM)

### Algorithm

**AES-256-GCM** (Authenticated Encryption)
- 256-bit key
- 96-bit IV (random per file)
- 128-bit auth tag (integrity verification)
- Industry standard, fast, secure

### Key Management

```
┌─────────────────────────────────────────────────────────────────┐
│ ENCRYPTION KEY (32 bytes)                                       │
│ - Stored in GitHub Secrets (for build pipeline)                 │
│ - Embedded in game binary (obfuscated)                          │
│ - Provides privacy, not authenticity                            │
│ - If extracted: attacker can READ but not FORGE                 │
└─────────────────────────────────────────────────────────────────┘
```

**Key Rotation Strategy:**
- Rotate with major game versions
- Old content re-encrypted with new key
- If key leaks, signature still protects authenticity

---

## Combined File Format

```
┌─────────────────────────────────────────────────────────────────┐
│                         ENCRYPTED ENVELOPE                       │
├──────────┬──────────┬───────────────────────────────┬──────────┤
│ Version  │    IV    │         Ciphertext            │   Tag    │
│ (1 byte) │(12 bytes)│         (variable)            │(16 bytes)│
└──────────┴──────────┴───────────────────────────────┴──────────┘
                                   │
                                   ▼ (after decryption)
┌─────────────────────────────────────────────────────────────────┐
│                         SIGNED PAYLOAD                           │
├──────────────┬──────────────────────────────────────────────────┤
│  Signature   │                    Content                        │
│  (64 bytes)  │                    (JSON)                         │
└──────────────┴──────────────────────────────────────────────────┘
```

**Flow:**
1. Build pipeline: `JSON → sign → prepend signature → encrypt → upload`
2. Game client: `download → decrypt → extract signature → verify → parse JSON`

### File Extension

Encrypted+signed files use `.enc` extension:
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

**scripts/crypto.ts**
```typescript
import { createCipheriv, createDecipheriv, randomBytes, createHash } from 'crypto';
import * as ed25519 from '@noble/ed25519';

const FORMAT_VERSION = 0x01;
const SIGNATURE_LENGTH = 64;

// ============================================================================
// SIGNING (Ed25519)
// ============================================================================

/**
 * Sign content with our private key
 * Only runs on build server - private key never in game client
 */
export async function signContent(content: string, privateKey: Uint8Array): Promise<Uint8Array> {
  const contentHash = createHash('sha256').update(content).digest();
  return await ed25519.signAsync(contentHash, privateKey);
}

/**
 * Verify content signature with public key
 * Runs in game client - public key is safe to embed
 */
export async function verifySignature(
  content: string,
  signature: Uint8Array,
  publicKey: Uint8Array
): Promise<boolean> {
  const contentHash = createHash('sha256').update(content).digest();
  return await ed25519.verifyAsync(signature, contentHash, publicKey);
}

// ============================================================================
// ENCRYPTION (AES-256-GCM)
// ============================================================================

/**
 * Encrypt signed content
 * Format: [version(1)][iv(12)][ciphertext(n)][tag(16)]
 */
export function encrypt(signedPayload: Buffer, key: Buffer): Buffer {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);

  const encrypted = Buffer.concat([
    cipher.update(signedPayload),
    cipher.final()
  ]);

  const tag = cipher.getAuthTag();

  return Buffer.concat([
    Buffer.from([FORMAT_VERSION]),
    iv,
    encrypted,
    tag
  ]);
}

/**
 * Decrypt to get signed payload
 */
export function decrypt(data: Buffer, key: Buffer): Buffer {
  const version = data[0];
  if (version !== FORMAT_VERSION) {
    throw new Error(`Unknown format version: ${version}`);
  }

  const iv = data.subarray(1, 13);
  const tag = data.subarray(-16);
  const ciphertext = data.subarray(13, -16);

  const decipher = createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);

  return Buffer.concat([
    decipher.update(ciphertext),
    decipher.final()
  ]);
}

// ============================================================================
// COMBINED OPERATIONS
// ============================================================================

/**
 * Sign and encrypt content (build pipeline)
 * Returns: encrypted([signature(64)][content])
 */
export async function signAndEncrypt(
  content: string,
  privateKey: Uint8Array,
  encryptionKey: Buffer
): Promise<Buffer> {
  // 1. Sign the content
  const signature = await signContent(content, privateKey);

  // 2. Create signed payload: [signature(64)][content]
  const signedPayload = Buffer.concat([
    Buffer.from(signature),
    Buffer.from(content, 'utf8')
  ]);

  // 3. Encrypt the signed payload
  return encrypt(signedPayload, encryptionKey);
}

/**
 * Decrypt and verify content (game client)
 * Throws if signature is invalid
 */
export async function decryptAndVerify(
  encryptedData: Buffer,
  publicKey: Uint8Array,
  encryptionKey: Buffer
): Promise<string> {
  // 1. Decrypt to get signed payload
  const signedPayload = decrypt(encryptedData, encryptionKey);

  // 2. Extract signature and content
  const signature = signedPayload.subarray(0, SIGNATURE_LENGTH);
  const content = signedPayload.subarray(SIGNATURE_LENGTH).toString('utf8');

  // 3. Verify signature
  const isValid = await verifySignature(content, signature, publicKey);
  if (!isValid) {
    throw new Error('CONTENT SIGNATURE INVALID - possible tampering or forgery');
  }

  return content;
}
```

**scripts/build.ts**
```typescript
import { signAndEncrypt } from './crypto';
import { validateContent } from './validate';
import { generateManifest } from './generate-manifest';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { glob } from 'glob';

// Keys from environment (GitHub Secrets)
const PRIVATE_KEY = Buffer.from(process.env.SIGNING_PRIVATE_KEY!, 'hex');
const ENCRYPTION_KEY = Buffer.from(process.env.CONTENT_ENCRYPTION_KEY!, 'hex');

async function build() {
  console.log('Building content...');
  console.log('  - Signing with Ed25519 (private key)');
  console.log('  - Encrypting with AES-256-GCM');

  // 1. Read all content files
  const contentFiles = await glob('content/**/*.json');
  console.log(`Found ${contentFiles.length} content files`);

  // 2. Validate against schemas
  for (const file of contentFiles) {
    await validateContent(file);
  }
  console.log('All files validated');

  // 3. Generate manifest
  const manifest = await generateManifest(contentFiles);

  // 4. Sign, encrypt, and write each file
  await mkdir('public/v1/content', { recursive: true });

  for (const file of contentFiles) {
    const content = await readFile(file, 'utf8');
    const encrypted = await signAndEncrypt(content, PRIVATE_KEY, ENCRYPTION_KEY);
    const outPath = getOutputPath(file);
    await writeFile(outPath, encrypted);
  }

  // 5. Sign, encrypt, and write manifest
  const manifestEncrypted = await signAndEncrypt(
    JSON.stringify(manifest),
    PRIVATE_KEY,
    ENCRYPTION_KEY
  );
  await writeFile('public/v1/manifest.enc', manifestEncrypted);

  // 6. Generate and encrypt per-site feeds
  await generateSiteFeeds(contentFiles, PRIVATE_KEY, ENCRYPTION_KEY);

  console.log(`Built ${contentFiles.length} content files`);
  console.log('All content signed and encrypted');
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

      - name: Build, sign, and encrypt
        run: bun run build
        env:
          SIGNING_PRIVATE_KEY: ${{ secrets.SIGNING_PRIVATE_KEY }}
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

### Decryption & Verification in Game Client

**server/src/services/content-crypto.ts**
```typescript
import { createDecipheriv, createHash } from 'crypto';
import * as ed25519 from '@noble/ed25519';

const FORMAT_VERSION = 0x01;
const SIGNATURE_LENGTH = 64;

// Our public key - safe to embed, used only for verification
// (Private key NEVER leaves build server)
const ENGAIGE_PUBLIC_KEY = new Uint8Array([
  // 32 bytes - populated at build time
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
]);

// Encryption key (obfuscated - see Key Storage section)
const ENCRYPTION_KEY = getObfuscatedKey();

/**
 * Decrypt and verify content from CDN
 * Throws if signature invalid (content forged or tampered)
 */
export async function decryptAndVerifyContent(encryptedData: Buffer): Promise<string> {
  // 1. Decrypt the envelope
  const version = encryptedData[0];
  if (version !== FORMAT_VERSION) {
    throw new Error(`Unknown format version: ${version}`);
  }

  const iv = encryptedData.subarray(1, 13);
  const tag = encryptedData.subarray(-16);
  const ciphertext = encryptedData.subarray(13, -16);

  const decipher = createDecipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
  decipher.setAuthTag(tag);

  const signedPayload = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final()
  ]);

  // 2. Extract signature and content
  const signature = signedPayload.subarray(0, SIGNATURE_LENGTH);
  const content = signedPayload.subarray(SIGNATURE_LENGTH).toString('utf8');

  // 3. Verify signature against our public key
  const contentHash = createHash('sha256').update(content).digest();
  const isValid = await ed25519.verifyAsync(signature, contentHash, ENGAIGE_PUBLIC_KEY);

  if (!isValid) {
    throw new Error(
      'CONTENT SIGNATURE INVALID\n' +
      'This content was not signed by engAIge servers.\n' +
      'Possible causes:\n' +
      '  - Content was tampered with\n' +
      '  - Content from unauthorized source\n' +
      '  - Corrupted download\n' +
      'This content will be rejected.'
    );
  }

  return content;
}
```

**Why this is secure:**

```
Attacker extracts from game:
  ✓ Public key (useless - can only verify, not sign)
  ✓ Encryption key (can decrypt, but...)

Attacker tries to forge content:
  ✗ Cannot sign without private key
  ✗ Game rejects content with invalid signature
  ✗ Private key is ONLY on our build server
```

### Fetch, Decrypt, and Verify Flow

**server/src/services/content-feed.ts**
```typescript
import { decryptAndVerifyContent } from './content-crypto';

const CDN_BASE = 'https://content.engaige.game/v1';

export async function fetchManifest(): Promise<ContentManifest> {
  const response = await fetch(`${CDN_BASE}/manifest.enc`);
  const encrypted = Buffer.from(await response.arrayBuffer());

  // Decrypt AND verify signature - throws if forged/tampered
  const decrypted = await decryptAndVerifyContent(encrypted);

  return JSON.parse(decrypted);
}

export async function fetchContent(id: string): Promise<ContentItem | null> {
  try {
    const response = await fetch(`${CDN_BASE}/content/${id}.enc`);
    const encrypted = Buffer.from(await response.arrayBuffer());

    // Decrypt AND verify signature - throws if forged/tampered
    const decrypted = await decryptAndVerifyContent(encrypted);

    return JSON.parse(decrypted);
  } catch (error) {
    if (error.message.includes('SIGNATURE INVALID')) {
      // Log security event - someone may be tampering
      console.error('SECURITY: Invalid content signature detected', { id });
      // Do NOT use this content
      return null;
    }
    throw error;
  }
}
```

**Security guarantee:** If `decryptAndVerifyContent` returns without throwing, the content is:
1. Decrypted correctly (AES key valid)
2. Signed by our private key (authenticity verified)
3. Unmodified since signing (integrity verified)

---

## Security Considerations

### Security Model

```
┌─────────────────────────────────────────────────────────────────┐
│                    WHAT ATTACKER CAN EXTRACT                     │
├─────────────────────────────────────────────────────────────────┤
│  From game client:                                               │
│    ✓ Public key (Ed25519)     - Can verify, cannot sign         │
│    ✓ Encryption key (AES)     - Can decrypt existing content    │
│                                                                  │
│  From CDN:                                                       │
│    ✓ Encrypted content        - Unreadable without game         │
├─────────────────────────────────────────────────────────────────┤
│                    WHAT ATTACKER CANNOT DO                       │
├─────────────────────────────────────────────────────────────────┤
│  ✗ Create forged content      - No private signing key          │
│  ✗ Modify existing content    - Signature verification fails    │
│  ✗ Inject malicious content   - Game rejects invalid signatures │
│  ✗ Man-in-the-middle CDN      - Signature verification fails    │
└─────────────────────────────────────────────────────────────────┘
```

### Threat Matrix

| Threat | Protected? | How |
|--------|------------|-----|
| Casual browsing of CDN | ✅ Yes | Encryption |
| Spoiler scrapers | ✅ Yes | Encryption |
| Content forgery | ✅ Yes | Signature verification |
| Malicious content injection | ✅ Yes | Signature verification |
| Man-in-the-middle attacks | ✅ Yes | Signature verification |
| CDN compromise | ✅ Yes | Signature verification |
| Replay old content | ⚠️ Partial | Timestamps in manifest |
| Reading content with extracted keys | ❌ No | Encryption key is extractable |
| Memory dumping decrypted content | ❌ No | Content must be decrypted to use |

### What This DOES Protect Against

1. **Content forgery** - Only we can sign content with our private key
2. **Tampering** - Any modification invalidates signature
3. **Injection attacks** - Malicious content rejected by verification
4. **CDN compromise** - Even if CDN is hacked, forged content rejected
5. **Casual browsing** - Content encrypted, can't just open in browser

### What This Does NOT Protect Against

1. **Reading content** - Determined attacker can extract encryption key and read
2. **Memory inspection** - Decrypted content exists in memory during use

**That's acceptable.** The critical protection is **authenticity**, not secrecy:
- Attacker CAN read content early (spoilers) - annoying but not dangerous
- Attacker CANNOT inject malicious content - this is the important part

### Key Rotation Scenarios

**If encryption key leaks:**
- Attacker can READ content (spoilers)
- Attacker still CANNOT forge content
- Low priority to rotate, but can do with game update

**If private signing key leaks (serious):**
- Attacker can CREATE forged content
- IMMEDIATE rotation required:
  1. Generate new Ed25519 key pair
  2. Update GitHub secret (private key)
  3. Ship game update (new public key)
  4. Re-sign all content
  5. Old game versions will reject new content (forces update)

### Key Generation

```bash
# Generate Ed25519 key pair (one-time setup)
# Uses @noble/ed25519 compatible format

import * as ed25519 from '@noble/ed25519';
import { randomBytes } from 'crypto';

const privateKey = randomBytes(32);
const publicKey = await ed25519.getPublicKeyAsync(privateKey);

console.log('SIGNING_PRIVATE_KEY=' + Buffer.from(privateKey).toString('hex'));
console.log('SIGNING_PUBLIC_KEY=' + Buffer.from(publicKey).toString('hex'));

# Generate AES-256 encryption key
const encryptionKey = randomBytes(32);
console.log('CONTENT_ENCRYPTION_KEY=' + encryptionKey.toString('hex'));
```

Store in GitHub Secrets:
- `SIGNING_PRIVATE_KEY` - Never expose anywhere else
- `CONTENT_ENCRYPTION_KEY` - Also in game client (obfuscated)

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
