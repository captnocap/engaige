import { useState, useEffect } from 'react'
import { useSettingsStore, type ContentRating } from '../../../stores/settingsStore.js'
import { useWSStore } from '../../../stores/wsStore.js'
import { SettingsCard } from '../components/SettingsCard.js'

// Rating options with descriptions
const RATING_OPTIONS: {
  value: ContentRating
  label: string
  description: string
  warning?: string
}[] = [
  {
    value: 'harsh',
    label: 'Harsh',
    description: 'Strictly platonic, all-ages appropriate. No romantic themes, flirting, or suggestive content.',
  },
  {
    value: 'strict',
    label: 'Strict',
    description: 'Romantic relationships allowed, but nothing sexual. Teen-appropriate interactions.',
  },
  {
    value: 'normal',
    label: 'Normal',
    description: 'Natural relationship progression with tasteful mature themes. Intimacy develops organically.',
  },
  {
    value: 'relaxed',
    label: 'Relaxed',
    description: 'Adult content allowed when contextually appropriate. NSFW images enabled.',
  },
  {
    value: 'none',
    label: 'None',
    description: 'No content restrictions whatsoever.',
    warning: 'May include explicit or offensive content.',
  },
]

export default function ContentRatingSettings() {
  const { contentRating, setContentRating } = useSettingsStore()
  const { request, connected } = useWSStore()
  const [showNoneConfirmation, setShowNoneConfirmation] = useState(false)
  const [pendingRating, setPendingRating] = useState<ContentRating | null>(null)
  const [syncing, setSyncing] = useState(false)

  // Sync with backend on mount
  useEffect(() => {
    if (connected) {
      syncFromBackend()
    }
  }, [connected])

  const syncFromBackend = async () => {
    try {
      const response = await request<void, { rating: ContentRating }>('guardrails:getRating')
      if (response && response.rating !== contentRating.rating) {
        setContentRating({ rating: response.rating })
      }
    } catch (err) {
      console.error('[ContentRating] Failed to sync from backend:', err)
    }
  }

  const handleRatingChange = async (newRating: ContentRating) => {
    // If selecting 'none', show confirmation dialog first
    if (newRating === 'none' && !contentRating.showNoneWarningAcknowledged) {
      setPendingRating(newRating)
      setShowNoneConfirmation(true)
      return
    }

    await applyRating(newRating)
  }

  const applyRating = async (newRating: ContentRating) => {
    setSyncing(true)

    try {
      // Update backend first
      if (connected) {
        await request<{ rating: ContentRating }, { rating: ContentRating; config: any }>(
          'guardrails:setRating',
          { rating: newRating }
        )
      }

      // Update local state
      setContentRating({ rating: newRating })
    } catch (err) {
      console.error('[ContentRating] Failed to set rating:', err)
    } finally {
      setSyncing(false)
    }
  }

  const confirmNoneRating = async () => {
    setShowNoneConfirmation(false)
    setContentRating({ showNoneWarningAcknowledged: true })
    if (pendingRating) {
      await applyRating(pendingRating)
      setPendingRating(null)
    }
  }

  const cancelNoneRating = () => {
    setShowNoneConfirmation(false)
    setPendingRating(null)
  }

  return (
    <div className="space-y-6">
      <SettingsCard
        title="Content Rating"
        description="Control NPC behavior, content generation, and what's visible in your game"
      >
        <div className="space-y-4">
          {RATING_OPTIONS.map((option) => (
            <label
              key={option.value}
              className="flex items-start gap-4 p-3 rounded-lg cursor-pointer transition-colors"
              style={{
                background:
                  contentRating.rating === option.value
                    ? 'var(--color-primary)/10'
                    : 'transparent',
                border:
                  contentRating.rating === option.value
                    ? '1px solid var(--color-primary)'
                    : '1px solid var(--color-border)',
              }}
            >
              <input
                type="radio"
                name="content-rating"
                value={option.value}
                checked={contentRating.rating === option.value}
                onChange={() => handleRatingChange(option.value)}
                disabled={syncing}
                className="mt-1 w-4 h-4 cursor-pointer"
                style={{
                  accentColor: 'var(--color-primary)',
                }}
              />
              <div className="flex-1">
                <div
                  className="font-semibold flex items-center gap-2"
                  style={{ color: 'var(--color-text)' }}
                >
                  {option.label}
                  {option.warning && (
                    <span
                      className="text-xs px-2 py-0.5 rounded"
                      style={{
                        background: 'var(--color-warning)/20',
                        color: 'var(--color-warning)',
                      }}
                    >
                      Warning
                    </span>
                  )}
                </div>
                <div
                  className="text-sm mt-1"
                  style={{ color: 'var(--color-textMuted)' }}
                >
                  {option.description}
                </div>
              </div>
            </label>
          ))}
        </div>
      </SettingsCard>

      {/* Info box about rating effects */}
      <div
        className="p-4 rounded-lg"
        style={{
          background: 'var(--color-info)/10',
          border: '1px solid var(--color-info)/30',
        }}
      >
        <div className="text-sm space-y-2" style={{ color: 'var(--color-info)' }}>
          <p className="font-semibold">Changing this setting affects:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>What NPCs can say and do</li>
            <li>What content is visible in feeds</li>
            <li>What images can be generated</li>
            <li>Available relationship types</li>
          </ul>
          <p className="mt-3 text-xs" style={{ color: 'var(--color-textMuted)' }}>
            Content generated under other settings may be hidden based on your current rating.
          </p>
        </div>
      </div>

      {/* Confirmation Dialog for 'none' rating */}
      {showNoneConfirmation && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ background: 'rgba(0, 0, 0, 0.7)' }}
        >
          <div
            className="p-6 rounded-lg max-w-md mx-4"
            style={{
              background: 'var(--color-bgSecondary)',
              border: '1px solid var(--color-border)',
            }}
          >
            <div
              className="text-lg font-semibold mb-4 flex items-center gap-2"
              style={{ color: 'var(--color-warning)' }}
            >
              Disable All Content Guardrails?
            </div>
            <div className="space-y-3 mb-6" style={{ color: 'var(--color-text)' }}>
              <p>This removes all content restrictions. NPCs may generate explicit, offensive, or disturbing content.</p>
              <ul className="list-disc list-inside text-sm space-y-1" style={{ color: 'var(--color-textMuted)' }}>
                <li>No content filtering</li>
                <li>No language restrictions</li>
                <li>No image safety filters</li>
                <li>All previously hidden content becomes visible</li>
              </ul>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelNoneRating}
                className="px-4 py-2 rounded transition-colors"
                style={{
                  background: 'var(--color-bgPrimary)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text)',
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmNoneRating}
                className="px-4 py-2 rounded transition-colors"
                style={{
                  background: 'var(--color-warning)',
                  color: 'var(--color-bgPrimary)',
                }}
              >
                Yes, I understand
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
