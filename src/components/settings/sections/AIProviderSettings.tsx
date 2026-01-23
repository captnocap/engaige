import { useState, useEffect } from 'react'
import { useWSConnection } from '../../../stores/wsStore.js'
import { useAIProviders, useImageGenProviders, type AIProvider, type ImageGenProvider } from '../../../stores/aiProviderStore.js'
import { Select } from '../../ui/Select.js'
import VisionProxySettings from './VisionProxySettings.js'

function SettingsCard({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div
      className="rounded-lg"
      style={{
        background: 'var(--color-bgSecondary)',
        border: '1px solid var(--color-border)',
        padding: '24px',
      }}
    >
      <div className="mb-6">
        <div className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>
          {title}
        </div>
        {description && (
          <div className="text-sm mt-2" style={{ color: 'var(--color-textMuted)' }}>
            {description}
          </div>
        )}
      </div>
      {children}
    </div>
  )
}

export default function AIProviderSettings() {
  const { connected } = useWSConnection()
  const {
    providers: aiProviders,
    activeProvider: activeAIProvider,
    loading: aiLoading,
    error: aiError,
    fetchProviders: fetchAIProviders,
    fetchActive: fetchActiveAI,
    setActive: setActiveAI,
    test: testAI,
    update: updateAI,
  } = useAIProviders()

  const {
    providers: imageGenProviders,
    activeProvider: activeImageGenProvider,
    loading: imageGenLoading,
    error: imageGenError,
    fetchProviders: fetchImageGenProviders,
    fetchActive: fetchActiveImageGen,
    setActive: setActiveImageGen,
    test: testImageGen,
    update: updateImageGen,
    create: createImageGen,
  } = useImageGenProviders()

  const [testingProvider, setTestingProvider] = useState<string | null>(null)
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; latency_ms?: number; error?: string }>>({})
  const [editingProvider, setEditingProvider] = useState<AIProvider | ImageGenProvider | null>(null)
  const [editingType, setEditingType] = useState<'ai' | 'imageGen' | null>(null)
  const [showAddImageGen, setShowAddImageGen] = useState(false)

  // New image gen provider form state
  const [newImageGen, setNewImageGen] = useState({
    name: '',
    display_name: '',
    base_url: '',
    api_key: '',
    default_payload: '{\n  "model": "your-model-name",\n  "n": 1\n}',
    prompt_key: 'prompt',
    reference_images_key: '',
    response_path: 'data.0.url',
    cost_per_image: 5,
  })

  // Load providers on mount
  useEffect(() => {
    if (connected) {
      fetchAIProviders()
      fetchActiveAI()
      fetchImageGenProviders()
      fetchActiveImageGen()
    }
  }, [connected])

  const handleTest = async (type: 'ai' | 'imageGen', name: string) => {
    setTestingProvider(`${type}:${name}`)
    try {
      const result = type === 'ai' ? await testAI(name) : await testImageGen(name)
      setTestResults((prev) => ({ ...prev, [`${type}:${name}`]: result }))
    } catch (err: any) {
      setTestResults((prev) => ({ ...prev, [`${type}:${name}`]: { success: false, error: err.message } }))
    } finally {
      setTestingProvider(null)
    }
  }

  const handleSaveEdit = async () => {
    if (!editingProvider || !editingType) return

    try {
      if (editingType === 'ai') {
        await updateAI(editingProvider as AIProvider)
      } else {
        await updateImageGen(editingProvider as ImageGenProvider)
      }
      setEditingProvider(null)
      setEditingType(null)
    } catch (err: any) {
      alert(`Failed to save: ${err.message}`)
    }
  }

  const handleCreateImageGen = async () => {
    try {
      let parsedPayload: Record<string, any>
      try {
        parsedPayload = JSON.parse(newImageGen.default_payload)
      } catch {
        alert('Invalid JSON in payload')
        return
      }

      await createImageGen({
        name: newImageGen.name,
        display_name: newImageGen.display_name,
        base_url: newImageGen.base_url,
        api_key: newImageGen.api_key || undefined,
        default_payload: parsedPayload,
        prompt_key: newImageGen.prompt_key,
        reference_images_key: newImageGen.reference_images_key || undefined,
        response_path: newImageGen.response_path,
        cost_per_image: newImageGen.cost_per_image,
      })

      setShowAddImageGen(false)
      setNewImageGen({
        name: '',
        display_name: '',
        base_url: '',
        api_key: '',
        default_payload: '{\n  "model": "your-model-name",\n  "n": 1\n}',
        prompt_key: 'prompt',
        reference_images_key: '',
        response_path: 'data.0.url',
        cost_per_image: 5,
      })
    } catch (err: any) {
      alert(`Failed to create: ${err.message}`)
    }
  }

  if (!connected) {
    return (
      <div className="space-y-6">
        <SettingsCard title="AI Providers" description="Not connected to server">
          <div className="text-center py-8" style={{ color: 'var(--color-textMuted)' }}>
            Connect to the server to manage AI providers
          </div>
        </SettingsCard>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* AI Text Providers */}
      <SettingsCard title="AI Text Providers" description="Configure providers for NPC conversations and text generation">
        {aiLoading ? (
          <div className="text-center py-4" style={{ color: 'var(--color-textMuted)' }}>Loading...</div>
        ) : aiError ? (
          <div className="text-center py-4" style={{ color: 'var(--color-error)' }}>{aiError}</div>
        ) : (
          <div className="space-y-3">
            {aiProviders.map((provider) => (
              <div
                key={provider.id}
                className="p-4 rounded flex items-center justify-between"
                style={{
                  background: provider.is_active ? 'var(--color-primary)/10' : 'var(--color-bg)',
                  border: provider.is_active ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      background: provider.is_active ? 'var(--color-success)' : 'var(--color-textMuted)',
                    }}
                  />
                  <div>
                    <div className="font-medium" style={{ color: 'var(--color-text)' }}>
                      {provider.display_name}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
                      {provider.provider_type} • {provider.default_model}
                      {provider.api_key ? ' • Key set' : ' • No key'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {testResults[`ai:${provider.name}`] && (
                    <span
                      className="text-xs px-2 py-1 rounded"
                      style={{
                        background: testResults[`ai:${provider.name}`].success
                          ? 'var(--color-success)/20'
                          : 'var(--color-error)/20',
                        color: testResults[`ai:${provider.name}`].success
                          ? 'var(--color-success)'
                          : 'var(--color-error)',
                      }}
                    >
                      {testResults[`ai:${provider.name}`].success
                        ? `${testResults[`ai:${provider.name}`].latency_ms}ms`
                        : 'Failed'}
                    </span>
                  )}
                  <button
                    onClick={() => handleTest('ai', provider.name)}
                    disabled={testingProvider === `ai:${provider.name}`}
                    className="px-3 py-1 text-xs rounded"
                    style={{
                      background: 'var(--color-bgTertiary)',
                      color: 'var(--color-text)',
                      border: '1px solid var(--color-border)',
                    }}
                  >
                    {testingProvider === `ai:${provider.name}` ? '...' : 'Test'}
                  </button>
                  <button
                    onClick={() => {
                      setEditingProvider(provider)
                      setEditingType('ai')
                    }}
                    className="px-3 py-1 text-xs rounded"
                    style={{
                      background: 'var(--color-bgTertiary)',
                      color: 'var(--color-text)',
                      border: '1px solid var(--color-border)',
                    }}
                  >
                    Edit
                  </button>
                  {!provider.is_active && (
                    <button
                      onClick={() => setActiveAI(provider.name)}
                      className="px-3 py-1 text-xs rounded text-white"
                      style={{ background: 'var(--color-primary)' }}
                    >
                      Set Active
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </SettingsCard>

      {/* Image Generation Providers */}
      <SettingsCard title="Image Generation Providers" description="Configure providers for NPC image generation">
        {imageGenLoading ? (
          <div className="text-center py-4" style={{ color: 'var(--color-textMuted)' }}>Loading...</div>
        ) : imageGenError ? (
          <div className="text-center py-4" style={{ color: 'var(--color-error)' }}>{imageGenError}</div>
        ) : (
          <div className="space-y-3">
            {imageGenProviders.map((provider) => (
              <div
                key={provider.id}
                className="p-4 rounded flex items-center justify-between"
                style={{
                  background: provider.is_active ? 'var(--color-primary)/10' : 'var(--color-bg)',
                  border: provider.is_active ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      background: provider.is_active ? 'var(--color-success)' : 'var(--color-textMuted)',
                    }}
                  />
                  <div>
                    <div className="font-medium" style={{ color: 'var(--color-text)' }}>
                      {provider.display_name}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
                      ${(provider.cost_per_image / 100).toFixed(2)}/image
                      {provider.api_key ? ' • Key set' : ' • No key'}
                      {provider.reference_images_key ? ' • img2img' : ''}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {testResults[`imageGen:${provider.name}`] && (
                    <span
                      className="text-xs px-2 py-1 rounded"
                      style={{
                        background: testResults[`imageGen:${provider.name}`].success
                          ? 'var(--color-success)/20'
                          : 'var(--color-error)/20',
                        color: testResults[`imageGen:${provider.name}`].success
                          ? 'var(--color-success)'
                          : 'var(--color-error)',
                      }}
                    >
                      {testResults[`imageGen:${provider.name}`].success
                        ? `${testResults[`imageGen:${provider.name}`].latency_ms}ms`
                        : 'Failed'}
                    </span>
                  )}
                  <button
                    onClick={() => handleTest('imageGen', provider.name)}
                    disabled={testingProvider === `imageGen:${provider.name}`}
                    className="px-3 py-1 text-xs rounded"
                    style={{
                      background: 'var(--color-bgTertiary)',
                      color: 'var(--color-text)',
                      border: '1px solid var(--color-border)',
                    }}
                  >
                    {testingProvider === `imageGen:${provider.name}` ? '...' : 'Test'}
                  </button>
                  <button
                    onClick={() => {
                      setEditingProvider(provider)
                      setEditingType('imageGen')
                    }}
                    className="px-3 py-1 text-xs rounded"
                    style={{
                      background: 'var(--color-bgTertiary)',
                      color: 'var(--color-text)',
                      border: '1px solid var(--color-border)',
                    }}
                  >
                    Edit
                  </button>
                  {!provider.is_active && (
                    <button
                      onClick={() => setActiveImageGen(provider.name)}
                      className="px-3 py-1 text-xs rounded text-white"
                      style={{ background: 'var(--color-primary)' }}
                    >
                      Set Active
                    </button>
                  )}
                </div>
              </div>
            ))}

            <button
              onClick={() => setShowAddImageGen(true)}
              className="w-full py-3 rounded text-sm font-medium transition-colors"
              style={{
                background: 'var(--color-bgTertiary)',
                color: 'var(--color-primary)',
                border: '1px dashed var(--color-border)',
              }}
            >
              + Add Image Generation Provider
            </button>
          </div>
        )}
      </SettingsCard>

      {/* Vision Proxy Configuration */}
      <VisionProxySettings />

      {/* Edit Modal for AI Provider */}
      {editingProvider && editingType === 'ai' && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setEditingProvider(null)}
        >
          <div
            className="p-6 rounded-lg w-full max-w-md"
            style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
              Edit {(editingProvider as AIProvider).display_name}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>
                  API Key
                </label>
                <input
                  type="password"
                  value={(editingProvider as AIProvider).api_key || ''}
                  onChange={(e) =>
                    setEditingProvider({ ...editingProvider, api_key: e.target.value } as AIProvider)
                  }
                  placeholder="Enter API key"
                  className="w-full px-3 py-2 rounded"
                  style={{
                    background: 'var(--color-bgSecondary)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text)',
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>
                  Base URL
                </label>
                <input
                  type="text"
                  value={(editingProvider as AIProvider).base_url || ''}
                  onChange={(e) =>
                    setEditingProvider({ ...editingProvider, base_url: e.target.value } as AIProvider)
                  }
                  placeholder="https://api.openai.com/v1"
                  className="w-full px-3 py-2 rounded"
                  style={{
                    background: 'var(--color-bgSecondary)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text)',
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>
                  Default Model
                </label>
                <input
                  type="text"
                  value={(editingProvider as AIProvider).default_model}
                  onChange={(e) =>
                    setEditingProvider({ ...editingProvider, default_model: e.target.value } as AIProvider)
                  }
                  placeholder="gpt-4o"
                  className="w-full px-3 py-2 rounded"
                  style={{
                    background: 'var(--color-bgSecondary)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text)',
                  }}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setEditingProvider(null)}
                className="px-4 py-2 rounded text-sm"
                style={{
                  background: 'var(--color-bgTertiary)',
                  color: 'var(--color-text)',
                  border: '1px solid var(--color-border)',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 rounded text-sm text-white"
                style={{ background: 'var(--color-primary)' }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal for Image Gen Provider */}
      {editingProvider && editingType === 'imageGen' && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setEditingProvider(null)}
        >
          <div
            className="p-6 rounded-lg w-full max-w-lg max-h-[80vh] overflow-y-auto"
            style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
              Edit {(editingProvider as ImageGenProvider).display_name}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>
                  API Key
                </label>
                <input
                  type="password"
                  value={(editingProvider as ImageGenProvider).api_key || ''}
                  onChange={(e) =>
                    setEditingProvider({ ...editingProvider, api_key: e.target.value } as ImageGenProvider)
                  }
                  placeholder="Enter API key"
                  className="w-full px-3 py-2 rounded"
                  style={{
                    background: 'var(--color-bgSecondary)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text)',
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>
                  Base URL
                </label>
                <input
                  type="text"
                  value={(editingProvider as ImageGenProvider).base_url}
                  onChange={(e) =>
                    setEditingProvider({ ...editingProvider, base_url: e.target.value } as ImageGenProvider)
                  }
                  className="w-full px-3 py-2 rounded"
                  style={{
                    background: 'var(--color-bgSecondary)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text)',
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>
                  Default Payload (JSON)
                </label>
                <textarea
                  value={JSON.stringify((editingProvider as ImageGenProvider).default_payload, null, 2)}
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value)
                      setEditingProvider({ ...editingProvider, default_payload: parsed } as ImageGenProvider)
                    } catch {
                      // Invalid JSON, don't update
                    }
                  }}
                  rows={6}
                  className="w-full px-3 py-2 rounded font-mono text-sm"
                  style={{
                    background: 'var(--color-bgSecondary)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text)',
                  }}
                />
                <div className="text-xs mt-1" style={{ color: 'var(--color-textMuted)' }}>
                  All settings baked in. Prompt will be injected at runtime.
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>
                    Prompt Key
                  </label>
                  <input
                    type="text"
                    value={(editingProvider as ImageGenProvider).prompt_key}
                    onChange={(e) =>
                      setEditingProvider({ ...editingProvider, prompt_key: e.target.value } as ImageGenProvider)
                    }
                    className="w-full px-3 py-2 rounded"
                    style={{
                      background: 'var(--color-bgSecondary)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text)',
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>
                    Reference Images Key
                  </label>
                  <input
                    type="text"
                    value={(editingProvider as ImageGenProvider).reference_images_key || ''}
                    onChange={(e) =>
                      setEditingProvider({
                        ...editingProvider,
                        reference_images_key: e.target.value || undefined,
                      } as ImageGenProvider)
                    }
                    placeholder="imageDataUrls (optional)"
                    className="w-full px-3 py-2 rounded"
                    style={{
                      background: 'var(--color-bgSecondary)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text)',
                    }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>
                    Response Path
                  </label>
                  <input
                    type="text"
                    value={(editingProvider as ImageGenProvider).response_path}
                    onChange={(e) =>
                      setEditingProvider({ ...editingProvider, response_path: e.target.value } as ImageGenProvider)
                    }
                    placeholder="data.0.url"
                    className="w-full px-3 py-2 rounded"
                    style={{
                      background: 'var(--color-bgSecondary)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text)',
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>
                    Cost per Image (cents)
                  </label>
                  <input
                    type="number"
                    value={(editingProvider as ImageGenProvider).cost_per_image}
                    onChange={(e) =>
                      setEditingProvider({
                        ...editingProvider,
                        cost_per_image: parseFloat(e.target.value) || 0,
                      } as ImageGenProvider)
                    }
                    className="w-full px-3 py-2 rounded"
                    style={{
                      background: 'var(--color-bgSecondary)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text)',
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setEditingProvider(null)}
                className="px-4 py-2 rounded text-sm"
                style={{
                  background: 'var(--color-bgTertiary)',
                  color: 'var(--color-text)',
                  border: '1px solid var(--color-border)',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 rounded text-sm text-white"
                style={{ background: 'var(--color-primary)' }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Image Gen Provider Modal */}
      {showAddImageGen && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setShowAddImageGen(false)}
        >
          <div
            className="p-6 rounded-lg w-full max-w-lg max-h-[80vh] overflow-y-auto"
            style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
              Add Image Generation Provider
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>
                    Name (ID)
                  </label>
                  <input
                    type="text"
                    value={newImageGen.name}
                    onChange={(e) => setNewImageGen({ ...newImageGen, name: e.target.value })}
                    placeholder="my-model"
                    className="w-full px-3 py-2 rounded"
                    style={{
                      background: 'var(--color-bgSecondary)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text)',
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={newImageGen.display_name}
                    onChange={(e) => setNewImageGen({ ...newImageGen, display_name: e.target.value })}
                    placeholder="My Model"
                    className="w-full px-3 py-2 rounded"
                    style={{
                      background: 'var(--color-bgSecondary)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text)',
                    }}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>
                  Base URL
                </label>
                <input
                  type="text"
                  value={newImageGen.base_url}
                  onChange={(e) => setNewImageGen({ ...newImageGen, base_url: e.target.value })}
                  placeholder="https://api.example.com/v1/images/generations"
                  className="w-full px-3 py-2 rounded"
                  style={{
                    background: 'var(--color-bgSecondary)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text)',
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>
                  API Key
                </label>
                <input
                  type="password"
                  value={newImageGen.api_key}
                  onChange={(e) => setNewImageGen({ ...newImageGen, api_key: e.target.value })}
                  placeholder="Enter API key"
                  className="w-full px-3 py-2 rounded"
                  style={{
                    background: 'var(--color-bgSecondary)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text)',
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>
                  Default Payload (JSON)
                </label>
                <textarea
                  value={newImageGen.default_payload}
                  onChange={(e) => setNewImageGen({ ...newImageGen, default_payload: e.target.value })}
                  rows={6}
                  className="w-full px-3 py-2 rounded font-mono text-sm"
                  style={{
                    background: 'var(--color-bgSecondary)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text)',
                  }}
                />
                <div className="text-xs mt-1" style={{ color: 'var(--color-textMuted)' }}>
                  Define all model settings here. Prompt injected via prompt_key.
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>
                    Prompt Key
                  </label>
                  <input
                    type="text"
                    value={newImageGen.prompt_key}
                    onChange={(e) => setNewImageGen({ ...newImageGen, prompt_key: e.target.value })}
                    className="w-full px-3 py-2 rounded"
                    style={{
                      background: 'var(--color-bgSecondary)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text)',
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>
                    Reference Images Key
                  </label>
                  <input
                    type="text"
                    value={newImageGen.reference_images_key}
                    onChange={(e) => setNewImageGen({ ...newImageGen, reference_images_key: e.target.value })}
                    placeholder="imageDataUrls (optional)"
                    className="w-full px-3 py-2 rounded"
                    style={{
                      background: 'var(--color-bgSecondary)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text)',
                    }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>
                    Response Path
                  </label>
                  <input
                    type="text"
                    value={newImageGen.response_path}
                    onChange={(e) => setNewImageGen({ ...newImageGen, response_path: e.target.value })}
                    className="w-full px-3 py-2 rounded"
                    style={{
                      background: 'var(--color-bgSecondary)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text)',
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>
                    Cost per Image (cents)
                  </label>
                  <input
                    type="number"
                    value={newImageGen.cost_per_image}
                    onChange={(e) =>
                      setNewImageGen({ ...newImageGen, cost_per_image: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 rounded"
                    style={{
                      background: 'var(--color-bgSecondary)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text)',
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowAddImageGen(false)}
                className="px-4 py-2 rounded text-sm"
                style={{
                  background: 'var(--color-bgTertiary)',
                  color: 'var(--color-text)',
                  border: '1px solid var(--color-border)',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateImageGen}
                className="px-4 py-2 rounded text-sm text-white"
                style={{ background: 'var(--color-primary)' }}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
