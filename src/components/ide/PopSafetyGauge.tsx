/**
 * Pop-Safety Gauge - SVG semi-circular arc
 *
 * Visual indicator of program pop-safety score.
 * Green (80-100%), Yellow (40-79%), Red (0-39%).
 */

import { THEME } from './stalk-theme.js'

interface PopSafetyGaugeProps {
  score: number | null  // 0-1 or null if no analysis
  worstCase?: string
}

function getGaugeColor(score: number): string {
  if (score >= 0.8) return THEME.gaugeGreen
  if (score >= 0.4) return THEME.gaugeYellow
  return THEME.gaugeRed
}

function getLabel(score: number): string {
  if (score >= 0.8) return 'Pop-Safe'
  if (score >= 0.4) return 'Risky'
  return 'Dangerous'
}

export function PopSafetyGauge({ score, worstCase }: PopSafetyGaugeProps) {
  const displayScore = score ?? 1
  const color = getGaugeColor(displayScore)
  const label = score !== null ? getLabel(displayScore) : 'N/A'
  const percentage = Math.round(displayScore * 100)

  // SVG arc geometry
  const cx = 60
  const cy = 55
  const r = 40
  const startAngle = Math.PI       // 180 degrees (left)
  const endAngle = 0               // 0 degrees (right)
  const sweepAngle = startAngle - (startAngle - endAngle) * displayScore

  const startX = cx + r * Math.cos(startAngle)
  const startY = cy - r * Math.sin(startAngle)
  const endX = cx + r * Math.cos(sweepAngle)
  const endY = cy - r * Math.sin(sweepAngle)

  // Background arc (full semicircle)
  const bgStartX = cx + r * Math.cos(startAngle)
  const bgStartY = cy - r * Math.sin(startAngle)
  const bgEndX = cx + r * Math.cos(endAngle)
  const bgEndY = cy - r * Math.sin(endAngle)

  const largeArc = displayScore > 0.5 ? 1 : 0

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '8px',
      }}
      title={worstCase || label}
    >
      <svg width="120" height="70" viewBox="0 0 120 70">
        {/* Background arc */}
        <path
          d={`M ${bgStartX} ${bgStartY} A ${r} ${r} 0 1 1 ${bgEndX} ${bgEndY}`}
          fill="none"
          stroke={THEME.border}
          strokeWidth="6"
          strokeLinecap="round"
        />

        {/* Score arc */}
        {displayScore > 0.01 && (
          <path
            d={`M ${startX} ${startY} A ${r} ${r} 0 ${largeArc} 1 ${endX} ${endY}`}
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
          />
        )}

        {/* Score text */}
        <text
          x={cx}
          y={cy - 4}
          textAnchor="middle"
          fill={score !== null ? color : THEME.textMuted}
          fontSize="18"
          fontWeight="bold"
          fontFamily="'Fira Code', monospace"
        >
          {score !== null ? `${percentage}` : '--'}
        </text>

        {/* Label */}
        <text
          x={cx}
          y={cy + 12}
          textAnchor="middle"
          fill={THEME.textMuted}
          fontSize="9"
          fontFamily="'Fira Code', monospace"
        >
          {label}
        </text>
      </svg>
    </div>
  )
}
