export function RangeControl({
  value,
  min,
  max,
  step = 1,
  defaultValue,
  unit = '',
  onChange,
  marks,
}: {
  value: number
  min: number
  max: number
  step?: number
  defaultValue: number
  unit?: string
  onChange: (value: number) => void
  marks?: Record<number | string, string>
}) {
  return (
    <div className="space-y-2">
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

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
      />

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
