import { useState, useEffect } from 'react'
import { useVisionProxy, type VisionProxyConfig } from '../../../stores/aiProviderStore.js'
import { useWSConnection } from '../../../stores/wsStore.js'
import { Select } from '../../ui/Select.js'

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

export default function VisionProxySettings() {
  const { connected } = useWSConnection()
  const { config, loading, fetchConfig, updateConfig } = useVisionProxy()
  const [localConfig, setLocalConfig] = useState<Partial<VisionProxyConfig>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (connected) {
      fetchConfig()
    }
  }, [connected])

  useEffect(() => {
    if (config) {
      setLocalConfig(config)
    }
  }, [config])

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateConfig(localConfig)
    } finally {
      setSaving(false)
    }
  }

  if (!connected) {
    return null
  }

  return (
    <SettingsCard title="Vision Proxy" description="Configure the model used to analyze images for NPCs that don't have native vision support">
      {loading ? (
        <div className="text-center py-4" style={{ color: 'var(--color-textMuted)' }}>Loading...</div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>
              Provider
            </label>
            <Select
              value={localConfig.provider || 'openai'}
              onChange={(val) => setLocalConfig({ ...localConfig, provider: val as any })}
              options={[
                { value: 'openai', label: 'OpenAI' },
                { value: 'openai-compatible', label: 'OpenAI Compatible' },
                { value: 'anthropic', label: 'Anthropic' },
              ]}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>
              Model
            </label>
            <input
              type="text"
              value={localConfig.model || ''}
              onChange={(e) => setLocalConfig({ ...localConfig, model: e.target.value })}
              placeholder="gpt-4o-mini"
              className="w-full px-3 py-2 rounded"
              style={{
                background: 'var(--color-bgSecondary)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text)',
              }}
            />
            <div className="text-xs mt-1" style={{ color: 'var(--color-textMuted)' }}>
              Must be a vision-capable model (e.g., gpt-4o-mini, gpt-4o, claude-sonnet-4-20250514)
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>
              API Key
            </label>
            <input
              type="password"
              value={localConfig.apiKey || ''}
              onChange={(e) => setLocalConfig({ ...localConfig, apiKey: e.target.value })}
              placeholder="Enter API key"
              className="w-full px-3 py-2 rounded"
              style={{
                background: 'var(--color-bgSecondary)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text)',
              }}
            />
          </div>
          {(localConfig.provider === 'openai-compatible') && (
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>
                Base URL
              </label>
              <input
                type="text"
                value={localConfig.baseUrl || ''}
                onChange={(e) => setLocalConfig({ ...localConfig, baseUrl: e.target.value })}
                placeholder="https://api.openai.com/v1"
                className="w-full px-3 py-2 rounded"
                style={{
                  background: 'var(--color-bgSecondary)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text)',
                }}
              />
            </div>
          )}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 rounded text-sm text-white"
              style={{ background: 'var(--color-primary)' }}
            >
              {saving ? 'Saving...' : 'Save Vision Proxy Config'}
            </button>
          </div>
          <div
            className="p-3 rounded text-sm"
            style={{
              background: 'var(--color-info)/10',
              border: '1px solid var(--color-info)/30',
              color: 'var(--color-info)',
            }}
          >
            When a user sends an image to an NPC whose model doesn't support vision, this proxy model will analyze the image and provide a description to the NPC.
          </div>
        </div>
      )}
    </SettingsCard>
  )
}
