import { ReactNode } from 'react'

/**
 * Props for the SettingsCard component
 */
export interface SettingsCardProps {
  /** Title of the settings card */
  title: string
  /** Optional description shown below the title */
  description?: string
  /** Content to display inside the card */
  children: ReactNode
}

/**
 * SettingsCard Component
 *
 * A reusable card wrapper for settings groups. Provides consistent styling,
 * borders, and spacing. Uses CSS variables for theming.
 *
 * Usage:
 * ```tsx
 * <SettingsCard title="Display" description="Adjust display settings">
 *   <div>Your content here</div>
 * </SettingsCard>
 * ```
 */
export function SettingsCard({ title, description, children }: SettingsCardProps) {
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
