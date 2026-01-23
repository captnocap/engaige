import { ReactNode, CSSProperties } from 'react'

export interface MetaRowItem {
  label?: string
  value: string
  icon?: ReactNode
  onClick?: () => void
}

export interface MetaRowProps {
  items: MetaRowItem[]
  separator?: string
  textSize?: 'xs' | 'sm' | 'md'
  textColor?: string
  mutedColor?: string
  gap?: string | number
  alignment?: 'left' | 'center' | 'right'
  direction?: 'row' | 'column'
  className?: string
  style?: CSSProperties
}

const TEXT_SIZE_CLASSES = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-base',
}

const ALIGNMENT_CLASSES = {
  left: 'justify-start',
  center: 'justify-center',
  right: 'justify-end',
}

const DIRECTION_CLASSES = {
  row: 'flex-row',
  column: 'flex-col',
}

export function MetaRow({
  items,
  separator = '•',
  textSize = 'sm',
  textColor,
  mutedColor,
  gap = '8px',
  alignment = 'left',
  direction = 'row',
  className = '',
  style = {},
}: MetaRowProps) {
  const gapValue = typeof gap === 'number' ? `${gap}px` : gap

  const containerStyle: CSSProperties = {
    display: 'flex',
    gap: gapValue,
    alignItems: direction === 'row' ? 'center' : 'flex-start',
    justifyContent: ALIGNMENT_CLASSES[alignment],
    flexDirection: direction === 'row' ? 'row' : 'column',
    ...style,
  }

  const textSizeClass = TEXT_SIZE_CLASSES[textSize]

  return (
    <div className={`${textSizeClass} ${className}`} style={containerStyle}>
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-1">
          {/* Icon (if provided) */}
          {item.icon && <span className="flex-shrink-0">{item.icon}</span>}

          {/* Label (if provided) */}
          {item.label && (
            <span
              style={{
                color: mutedColor || 'var(--color-textMuted)',
              }}
            >
              {item.label}
            </span>
          )}

          {/* Value */}
          <span
            onClick={item.onClick}
            style={{
              color: textColor || 'var(--color-text)',
              cursor: item.onClick ? 'pointer' : 'default',
              textDecoration: item.onClick ? 'underline' : 'none',
              opacity: item.onClick ? 1 : 1,
              transition: 'opacity 0.2s ease',
            }}
            className={item.onClick ? 'hover:opacity-70' : ''}
          >
            {item.value}
          </span>

          {/* Separator (if not last item and direction is row) */}
          {direction === 'row' && index < items.length - 1 && (
            <span
              style={{
                color: mutedColor || 'var(--color-textMuted)',
              }}
            >
              {separator}
            </span>
          )}
        </div>
      ))}
    </div>
  )
}
