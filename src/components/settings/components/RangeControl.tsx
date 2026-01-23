/**
 * Props for the RangeControl component
 */
export interface RangeControlProps {
  /** Current value of the range */
  value: number
  /** Minimum value */
  min: number
  /** Maximum value */
  max: number
  /** Step increment (default: 1) */
  step?: number
  /** Default value used when reset button is clicked */
  defaultValue: number
  /** Optional unit to display after the value (e.g., '%', 'em') */
  unit?: string
  /** Callback when value changes */
  onChange: (value: number) => void
  /** Optional marks to display below the slider (key: value, value: label) */
  marks?: Record<number | string, string>
}

/**
 * RangeControl Component
 *
 * A flexible range slider with value display, reset button, and optional marks.
 * Uses CSS variables for theming. Suitable for any numeric input (brightness, volume, etc).
 *
 * Usage:
 * ```tsx
 * <RangeControl
 *   value={brightness}
 *   min={50}
 *   max={150}
 *   defaultValue={100}
 *   unit="%"
 *   onChange={(v) => setBrightness(v)}
 *   marks={{ 50: 'Darker', 100: 'Default', 150: 'Brighter' }}
 * />
 * ```
 */
export function RangeControl({
  value,
  min,
  max,
  step = 1,
  defaultValue,
  unit = '',
  onChange,
  marks,
}: RangeControlProps) {
  return (
    <div className="space-y-2">
      {/* Value display and reset button */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
          {value}
          {unit}
        </span>
        <button
          onClick={() => onChange(defaultValue)}
          className="text-xs hover:underline"
          style={{ color: 'var(--color-primary)' }}
        >
          Reset
        </button>
      </div>

      {/* Range slider input */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
      />

      {/* Optional marks/labels below slider */}
      {marks && (
        <div className="flex justify-between text-xs" style={{ color: 'var(--color-textMuted)' }}>
          {Object.entries(marks).map(([val, label]) => (
            <span key={val}>{label}</span>
          ))}
        </div>
      )}
    </div>
  )
}
