import { ReactNode, CSSProperties } from 'react'

/**
 * Comprehensive StyledButton Component
 *
 * A highly customizable button component that supports multiple variants, sizes,
 * loading states, disabled states, icons, and full color control.
 *
 * Different sites use different button colors, so colors are NOT hardcoded.
 * All colors are passed as props for maximum flexibility.
 *
 * Usage:
 * <Button
 *   variant="primary"
 *   size="md"
 *   backgroundColor="#6B4C9A"
 *   textColor="white"
 *   onClick={() => console.log('Clicked')}
 * >
 *   Click me
 * </Button>
 */

export interface ButtonProps {
  // Content
  children: ReactNode
  type?: 'button' | 'submit' | 'reset'
  onClick?: () => void
  disabled?: boolean
  loading?: boolean

  // Appearance - Variant & Size
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline' | 'ghost' | 'link'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'

  // Colors - Full Control (NO Hardcoding)
  backgroundColor?: string
  textColor?: string
  borderColor?: string
  color?: string // Alias for backgroundColor

  // Interactive States
  hoverColor?: string      // Background color on hover
  activeColor?: string     // Background color when active/pressed
  hoverBgOpacity?: number  // 0-1, applies opacity to hover bg

  // Width Control
  width?: 'full' | 'auto' | string

  // Icon Support
  icon?: ReactNode
  iconPosition?: 'left' | 'right' | 'only'

  // Styling Overrides
  className?: string
  style?: CSSProperties

  // Accessibility
  title?: string
  ariaLabel?: string
}

/**
 * Size configuration - defines padding, font size, border radius
 * Each size is carefully balanced for visual hierarchy
 */
const SIZE_CONFIG = {
  xs: {
    padding: '0.25rem 0.75rem',
    fontSize: '0.75rem',
    borderRadius: '0.375rem',
    gap: '0.25rem',
    minHeight: '1.5rem',
  },
  sm: {
    padding: '0.375rem 0.875rem',
    fontSize: '0.875rem',
    borderRadius: '0.5rem',
    gap: '0.375rem',
    minHeight: '2rem',
  },
  md: {
    padding: '0.5rem 1rem',
    fontSize: '1rem',
    borderRadius: '0.5rem',
    gap: '0.5rem',
    minHeight: '2.5rem',
  },
  lg: {
    padding: '0.75rem 1.5rem',
    fontSize: '1.125rem',
    borderRadius: '0.625rem',
    gap: '0.625rem',
    minHeight: '3rem',
  },
  xl: {
    padding: '1rem 2rem',
    fontSize: '1.25rem',
    borderRadius: '0.75rem',
    gap: '0.75rem',
    minHeight: '3.5rem',
  },
}

/**
 * Default style presets for each variant
 * These provide base colors that can be overridden by props
 */
const VARIANT_DEFAULTS = {
  primary: {
    backgroundColor: '#3B82F6',
    textColor: '#FFFFFF',
    borderColor: 'transparent',
  },
  secondary: {
    backgroundColor: '#6B7280',
    textColor: '#FFFFFF',
    borderColor: 'transparent',
  },
  danger: {
    backgroundColor: '#EF4444',
    textColor: '#FFFFFF',
    borderColor: 'transparent',
  },
  success: {
    backgroundColor: '#10B981',
    textColor: '#FFFFFF',
    borderColor: 'transparent',
  },
  outline: {
    backgroundColor: 'transparent',
    textColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  ghost: {
    backgroundColor: 'transparent',
    textColor: '#6B7280',
    borderColor: 'transparent',
  },
  link: {
    backgroundColor: 'transparent',
    textColor: '#3B82F6',
    borderColor: 'transparent',
  },
}

/**
 * Helper function to convert hex color to rgba
 * Useful for creating hover effects with opacity
 */
function hexToRgba(hex: string, alpha: number): string {
  // Handle rgb/rgba that might already be passed
  if (hex.startsWith('rgb')) {
    return hex
  }

  // Remove # if present
  const cleanHex = hex.replace('#', '')

  // Parse hex
  const r = parseInt(cleanHex.substring(0, 2), 16)
  const g = parseInt(cleanHex.substring(2, 4), 16)
  const b = parseInt(cleanHex.substring(4, 6), 16)

  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

/**
 * Helper function to darken a color for hover effects
 */
function darkenColor(hex: string, amount: number = 0.1): string {
  // Handle rgb/rgba
  if (hex.startsWith('rgb')) {
    return hex
  }

  const cleanHex = hex.replace('#', '')
  let r = parseInt(cleanHex.substring(0, 2), 16)
  let g = parseInt(cleanHex.substring(2, 4), 16)
  let b = parseInt(cleanHex.substring(4, 6), 16)

  r = Math.max(0, Math.floor(r * (1 - amount)))
  g = Math.max(0, Math.floor(g * (1 - amount)))
  b = Math.max(0, Math.floor(b * (1 - amount)))

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

export function Button({
  children,
  type = 'button',
  onClick,
  disabled = false,
  loading = false,
  variant = 'primary',
  size = 'md',
  backgroundColor,
  textColor,
  borderColor,
  color,
  hoverColor,
  activeColor,
  hoverBgOpacity,
  width = 'auto',
  icon,
  iconPosition = 'left',
  className = '',
  style = {},
  title,
  ariaLabel,
}: ButtonProps) {
  // Resolve background color (color prop is alias for backgroundColor)
  const finalBgColor = backgroundColor || color
  const variantDefaults = VARIANT_DEFAULTS[variant]

  // Get the effective colors (props override variant defaults)
  const effectiveBgColor = finalBgColor || variantDefaults.backgroundColor
  const effectiveTextColor = textColor || variantDefaults.textColor
  const effectiveBorderColor = borderColor || variantDefaults.borderColor

  // Determine hover background color
  let hoverBgColor: string
  if (hoverColor) {
    hoverBgColor = hoverColor
  } else if (hoverBgOpacity !== undefined && effectiveBgColor !== 'transparent') {
    hoverBgColor = hexToRgba(effectiveBgColor, hoverBgOpacity)
  } else if (effectiveBgColor !== 'transparent' && variant !== 'ghost' && variant !== 'link') {
    // Default hover: darken by 10%
    hoverBgColor = darkenColor(effectiveBgColor, 0.1)
  } else {
    hoverBgColor = effectiveBgColor
  }

  // Determine active background color
  const effectiveActiveColor = activeColor || darkenColor(effectiveBgColor, 0.2)

  // Get size config
  const sizeConfig = SIZE_CONFIG[size]

  // Determine width style
  const widthStyle: CSSProperties =
    width === 'full'
      ? { width: '100%' }
      : width === 'auto'
        ? {}
        : { width }

  // Build base button styles
  const baseButtonStyle: CSSProperties = {
    ...sizeConfig,
    backgroundColor: effectiveBgColor,
    color: effectiveTextColor,
    border: effectiveBorderColor ? `2px solid ${effectiveBorderColor}` : 'none',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled || loading ? 0.6 : 1,
    transition: 'all 0.2s ease-in-out',
    fontWeight: 500,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    ...widthStyle,
    ...style,
  }

  // Build className for responsive and state-based classes
  const classes = [
    'button-styled',
    'font-medium',
    'transition-all',
    'duration-200',
    'ease-in-out',
    'outline-none',
    'focus:ring-2',
    'focus:ring-offset-1',
    disabled || loading ? 'cursor-not-allowed' : 'hover:scale-105 active:scale-95',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  // Handle icon-only variant
  const showOnlyIcon = iconPosition === 'only' && icon
  const displayChildren = showOnlyIcon ? null : children
  const displayIcon = icon

  // Create hover/active state handler with inline styles
  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && !loading) {
      ;(e.currentTarget as any).style.backgroundColor = hoverBgColor
    }
  }

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && !loading) {
      ;(e.currentTarget as any).style.backgroundColor = effectiveBgColor
    }
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && !loading && activeColor) {
      ;(e.currentTarget as any).style.backgroundColor = effectiveActiveColor
    }
  }

  const handleMouseUp = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && !loading) {
      ;(e.currentTarget as any).style.backgroundColor = hoverBgColor
    }
  }

  const handleFocus = (e: React.FocusEvent<HTMLButtonElement>) => {
    if (!disabled && !loading) {
      ;(e.currentTarget as any).style.boxShadow = `0 0 0 3px rgba(59, 130, 246, 0.1)`
    }
  }

  const handleBlur = (e: React.FocusEvent<HTMLButtonElement>) => {
    ;(e.currentTarget as any).style.boxShadow = 'none'
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={classes}
      style={baseButtonStyle}
      title={title || ariaLabel}
      aria-label={ariaLabel}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      {/* Loading Spinner */}
      {loading && (
        <span
          className="inline-block mr-2 w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
          style={{ animation: 'spin 1s linear infinite' }}
        />
      )}

      {/* Icon - Left Position */}
      {displayIcon && iconPosition === 'left' && (
        <span className="flex items-center justify-center" style={{ marginRight: sizeConfig.gap }}>
          {displayIcon}
        </span>
      )}

      {/* Main Content */}
      {displayChildren}

      {/* Icon - Right Position */}
      {displayIcon && iconPosition === 'right' && (
        <span className="flex items-center justify-center" style={{ marginLeft: sizeConfig.gap }}>
          {displayIcon}
        </span>
      )}

      {/* Icon - Only Position */}
      {showOnlyIcon && (
        <span className="flex items-center justify-center">
          {displayIcon}
        </span>
      )}

      {/* Spinner animation styles */}
      <style>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </button>
  )
}

export default Button
