# AI Provider System

The AI Provider System allows users to configure multiple AI providers (OpenAI, Anthropic, local LM Studio) with one marked as the default. Providers are persisted to the database, ensuring configuration survives server restarts.

## Overview

### Key Features

- **Multiple Providers**: Configure OpenAI, Anthropic, and OpenAI-compatible (LM Studio) providers simultaneously
- **Persistence**: All provider configurations stored in SQLite (`user.db`)
- **Per-NPC Overrides**: Assign specific providers to individual NPCs
- **Backward Compatibility**: Legacy inline NPC configs still work
- **Connection Testing**: Validate provider connectivity before use

### Provider Resolution Order

When determining which AI provider to use for an NPC:

1. **`ai_provider_id`** - If the NPC has a provider reference, use that provider
2. **Inline Config** - If the NPC has `model_provider`, `model_name`, etc., use that (backward compat)
3. **Global Default** - Fall back to the active global provider

## Database Schema

### `ai_providers` Table (in `user.db`)

```sql
CREATE TABLE ai_providers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,           -- 'local', 'openai', 'anthropic', or custom
  display_name TEXT NOT NULL,          -- 'Local LM Studio', 'OpenAI', etc.
  provider_type TEXT NOT NULL,         -- 'openai' | 'openai-compatible' | 'anthropic'
  base_url TEXT,                       -- API endpoint URL
  api_key TEXT,                        -- API key (encrypted in future)
  default_model TEXT NOT NULL,         -- Default model name
  is_active INTEGER DEFAULT 0,         -- Only one active at a time
  is_enabled INTEGER DEFAULT 1,        -- Can be disabled without deletion
  cost_config TEXT,                    -- JSON: per-model cost rates
  supports_vision INTEGER DEFAULT 0,   -- Can analyze images
  supports_tools INTEGER DEFAULT 1,    -- Supports function calling
  max_context_tokens INTEGER,          -- Max context window size
  created_at INTEGER,
  updated_at INTEGER
);
```

### Pre-seeded Providers

On first startup, three providers are automatically created:

| Name | Type | Base URL | Default Model | Active |
|------|------|----------|---------------|--------|
| `local` | openai-compatible | `http://localhost:1234/v1` | gpt-4o | Yes |
| `openai` | openai | `https://api.openai.com/v1` | gpt-4o | No |
| `anthropic` | anthropic | `https://api.anthropic.com` | claude-sonnet-4-20250514 | No |

### NPC Table Addition

```sql
ALTER TABLE npcs ADD COLUMN ai_provider_id TEXT;
```

## Service API

### `server/src/services/ai-provider-config.ts`

```typescript
import {
  getActiveAIProvider,
  getAIProviderById,
  getAIProviderByName,
  getAllAIProviders,
  getEnabledAIProviders,
  upsertAIProvider,
  setActiveAIProvider,
  deleteAIProvider,
  setProviderEnabled,
  testProviderConnection,
  getProviderForNPC,
} from './services/ai-provider-config.js';
```

#### Get Active Provider

```typescript
const provider = getActiveAIProvider();
// Returns: AIProvider | null
```

#### Get All Providers

```typescript
const providers = getAllAIProviders();
// Returns: AIProvider[] (sorted by active status, then name)
```

#### Create/Update Provider

```typescript
const provider = upsertAIProvider({
  name: 'my-custom-provider',
  display_name: 'My Custom Provider',
  provider_type: 'openai-compatible',
  base_url: 'http://my-server:8080/v1',
  api_key: 'sk-...',
  default_model: 'llama-3-70b',
  supports_vision: true,
});
```

#### Set Active Provider

```typescript
// By name or ID
setActiveAIProvider('openai');
// or
setActiveAIProvider('provider-uuid-here');
```

#### Test Connection

```typescript
const result = await testProviderConnection(provider);
// Returns: { success: boolean, error?: string, latency_ms?: number }
```

#### Get Provider for NPC

```typescript
const provider = getProviderForNPC({
  ai_provider_id: npc.ai_provider_id,
  model_provider: npc.model_provider,
  model_name: npc.model_name,
  model_base_url: npc.model_base_url,
  model_api_key: npc.model_api_key,
});
```

## WebSocket API

All messages follow the standard WebSocket protocol with request-response correlation.

### Get All Providers

```json
{
  "type": "aiProvider:getAll",
  "id": "request-123"
}
```

Response:
```json
{
  "type": "response",
  "id": "request-123",
  "success": true,
  "payload": [
    {
      "id": "local",
      "name": "local",
      "display_name": "Local LM Studio",
      "provider_type": "openai-compatible",
      "base_url": "http://localhost:1234/v1",
      "default_model": "gpt-4o",
      "is_active": true,
      "is_enabled": true,
      "supports_vision": false,
      "supports_tools": true,
      "max_context_tokens": 128000
    }
  ]
}
```

### Get Active Provider

```json
{
  "type": "aiProvider:getActive",
  "id": "request-124"
}
```

### Create Provider

```json
{
  "type": "aiProvider:create",
  "id": "request-125",
  "payload": {
    "name": "custom-openai",
    "display_name": "Custom OpenAI Instance",
    "provider_type": "openai-compatible",
    "base_url": "http://my-server:8080/v1",
    "default_model": "llama-3-70b",
    "supports_vision": true
  }
}
```

### Update Provider

```json
{
  "type": "aiProvider:update",
  "id": "request-126",
  "payload": {
    "name": "openai",
    "api_key": "sk-new-key-here",
    "default_model": "gpt-4o-mini"
  }
}
```

### Delete Provider

```json
{
  "type": "aiProvider:delete",
  "id": "request-127",
  "payload": {
    "name": "custom-openai"
  }
}
```

### Set Active Provider

```json
{
  "type": "aiProvider:setActive",
  "id": "request-128",
  "payload": {
    "name": "anthropic"
  }
}
```

### Test Provider Connection

```json
{
  "type": "aiProvider:test",
  "id": "request-129",
  "payload": {
    "name": "openai"
  }
}
```

Response:
```json
{
  "type": "response",
  "id": "request-129",
  "success": true,
  "payload": {
    "success": true,
    "latency_ms": 234
  }
}
```

## Events

Provider changes emit events to the event bus:

| Event Type | Payload |
|------------|---------|
| `ai:provider_created` | `{ provider_id, provider_name, provider_type }` |
| `ai:provider_updated` | `{ provider_id, provider_name, fields_changed }` |
| `ai:provider_deleted` | `{ provider_id, provider_name }` |
| `ai:provider_activated` | `{ provider_id, provider_name, previous_provider_id?, previous_provider_name? }` |

## Backward Compatibility

### Legacy `configureAI()` Function

The `configureAI()` function in `ai.ts` still works but now persists to the database:

```typescript
// This still works - now updates the database
configureAI({
  provider: 'openai',
  model: 'gpt-4o',
  apiKey: 'sk-...',
});
```

### Legacy NPC Inline Config

NPCs with inline `model_provider`, `model_name`, etc. continue to work:

```typescript
// This NPC config still works
const npc = {
  model_provider: 'anthropic',
  model_name: 'claude-sonnet-4-20250514',
  model_api_key: 'sk-ant-...',
};

const config = getNPCConfig(npc);
// Returns the inline config
```

### Migration Path

1. **No migration required** - defaults seeded on first run
2. Existing NPCs with inline config continue to work
3. Gradually migrate NPCs to use `ai_provider_id` references
4. Inline config can be removed from NPCs after migration

## Best Practices

### Assigning Providers to NPCs

For premium/important NPCs, assign higher-quality providers:

```typescript
// High-value romantic interest uses Claude
updateNPC(npcId, {
  ai_provider_id: getAIProviderByName('anthropic')?.id,
});

// Background NPCs use cheaper local model
updateNPC(backgroundNpcId, {
  ai_provider_id: getAIProviderByName('local')?.id,
});
```

### Testing Before Activation

Always test a provider before setting it as active:

```typescript
const provider = getAIProviderByName('openai');
const result = await testProviderConnection(provider);

if (result.success) {
  setActiveAIProvider('openai');
} else {
  console.error('Provider test failed:', result.error);
}
```

### Handling Missing Providers

If a provider is deleted or disabled, the system falls back to the global default:

```typescript
// If NPC's assigned provider is deleted, they use global default
const config = getNPCConfig(npc);
// Returns global active provider if ai_provider_id points to deleted provider
```

## File Reference

| File | Purpose |
|------|---------|
| `server/src/db/index.ts` | Schema definition and seed data |
| `server/src/services/ai-provider-config.ts` | CRUD operations and business logic |
| `server/src/services/ai.ts` | Integration with AI generation |
| `server/src/routes/ai-providers.ts` | Route handlers |
| `server/src/network/ws-protocol.ts` | WebSocket message types |
| `server/src/network/ws-server.ts` | WebSocket handlers |
| `server/src/services/onboarding.ts` | Onboarding integration |
| `server/src/events/event-types.ts` | Event type definitions |
