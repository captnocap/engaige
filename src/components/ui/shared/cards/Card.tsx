import React, { CSSProperties, ReactNode } from 'react'

/**
 * Shadow level definitions - maps to CSS box-shadow
 */
const SHADOW_LEVELS = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
} as const

/**
 * Default variants with base styling
 * Each variant can be overridden with custom props
 */
const VARIANT_DEFAULTS = {
  default: {
    bgColor: '#ffffff',
    borderColor: '#e5e7eb',
    hoverColor: '#f9fafb',
    textColor: '#1f2937',
  },
  dark: {
    bgColor: '#1f2937',
    borderColor: '#374151',
    hoverColor: '#111827',
    textColor: '#f3f4f6',
  },
  light: {
    bgColor: '#f3f4f6',
    borderColor: '#d1d5db',
    hoverColor: '#e5e7eb',
    textColor: '#374151',
  },
  transparent: {
    bgColor: 'transparent',
    borderColor: 'transparent',
    hoverColor: 'rgba(0, 0, 0, 0.05)',
    textColor: '#1f2937',
  },
  gradient: {
    bgColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderColor: 'transparent',
    hoverColor: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
    textColor: '#ffffff',
  },
} as const

type CardVariant = keyof typeof VARIANT_DEFAULTS
type ShadowLevel = keyof typeof SHADOW_LEVELS
type PaddingSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number | string

/**
 * Padding presets - can be overridden with custom values
 */
const PADDING_PRESETS: Record<Exclude<PaddingSize, number | string>, string> = {
  xs: '4px 8px',
  sm: '8px 12px',
  md: '12px 16px',
  lg: '16px 20px',
  xl: '24px 32px',
}

/**
 * Border radius presets - can be overridden with custom values
 */
const BORDER_RADIUS_PRESETS: Record<string, number> = {
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 20,
}

export interface StyledCardProps {
  /**
   * Visual variant preset
   * @default 'default'
   */
  variant?: CardVariant

  /**
   * Background color - overrides variant default
   * Accepts any CSS color value (hex, rgb, linear-gradient, etc.)
   */
  bgColor?: string

  /**
   * Border color - overrides variant default
   * Accepts any CSS color value
   */
  borderColor?: string

  /**
   * Hover background color - overrides variant default
   * Triggered on mouse over if onHover is provided
   */
  hoverColor?: string

  /**
   * Text color - applied to text content
   */
  textColor?: string

  /**
   * Border width in pixels
   * @default 1
   */
  borderWidth?: number

  /**
   * Padding around card content
   * Presets: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
   * Or pass any CSS padding value: '16px', '10px 20px', etc.
   * @default 'md'
   */
  padding?: PaddingSize

  /**
   * Border radius of the card
   * Presets: 'xs' (2px) | 'sm' (4px) | 'md' (8px) | 'lg' (12px) | 'xl' (16px) | 'full' (20px)
   * Or pass custom value: 6, '10px', etc.
   * @default 'md'
   */
  borderRadius?: keyof typeof BORDER_RADIUS_PRESETS | number | string

  /**
   * Shadow effect level
   * @default 'md'
   */
  shadow?: ShadowLevel

  /**
   * Card content
   */
  children?: ReactNode

  /**
   * Click handler
   */
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void

  /**
   * Mouse over handler
   */
  onMouseEnter?: (e: React.MouseEvent<HTMLDivElement>) => void

  /**
   * Mouse out handler
   */
  onMouseLeave?: (e: React.MouseEvent<HTMLDivElement>) => void

  /**
   * Tailwind classes for additional styling
   * Applied to the card element
   */
  className?: string

  /**
   * Inline styles - merged with computed styles
   * Takes precedence over component-generated styles
   */
  style?: CSSProperties

  /**
   * Enable transition animation on hover
   * @default true
   */
  enableTransition?: boolean

  /**
   * Transition duration in milliseconds
   * @default 200
   */
  transitionDuration?: number

  /**
   * Make card interactive (shows pointer cursor)
   * @default automatically determined by onClick prop
   */
  interactive?: boolean

  /**
   * Disabled state - reduces opacity and prevents interaction
   */
  disabled?: boolean

  /**
   * Optional border style
   * @default 'solid'
   */
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'none'
}

/**
 * StyledCard Component
 *
 * A flexible, highly customizable card component used across all browser sites.
 * Supports multiple visual variants, full color control, configurable spacing and borders.
 *
 * Usage:
 * ```tsx
 * <StyledCard variant="dark" padding="lg" borderRadius="lg" shadow="md">
 *   Card content here
 * </StyledCard>
 *
 * <StyledCard
 *   bgColor="#FF6600"
 *   borderColor="#FF6600"
 *   padding={16}
 *   borderRadius={8}
 *   onClick={handleClick}
 * >
 *   Custom card
 * </StyledCard>
 * ```
 */
export const StyledCard = React.forwardRef<HTMLDivElement, StyledCardProps>(
  (
    {
      variant = 'default',
      bgColor,
      borderColor,
      hoverColor,
      textColor,
      borderWidth = 1,
      padding = 'md',
      borderRadius = 'md',
      shadow = 'md',
      children,
      onClick,
      onMouseEnter,
      onMouseLeave,
      className = '',
      style = {},
      enableTransition = true,
      transitionDuration = 200,
      interactive = onClick !== undefined,
      disabled = false,
      borderStyle = 'solid',
    },
    ref
  ) => {
    // Get variant defaults
    const variantDefaults = VARIANT_DEFAULTS[variant]

    // Resolve padding value
    const resolvedPadding =
      typeof padding === 'string' && padding in PADDING_PRESETS
        ? PADDING_PRESETS[padding as keyof typeof PADDING_PRESETS]
        : padding

    // Resolve border-radius value
    let resolvedBorderRadius: string | number
    if (typeof borderRadius === 'string' && borderRadius in BORDER_RADIUS_PRESETS) {
      resolvedBorderRadius = BORDER_RADIUS_PRESETS[borderRadius]
    } else if (typeof borderRadius === 'number') {
      resolvedBorderRadius = borderRadius
    } else {
      resolvedBorderRadius = borderRadius
    }

    // Resolve shadow
    const resolvedShadow = SHADOW_LEVELS[shadow]

    // Resolve colors (custom overrides variant defaults)
    const finalBgColor = bgColor ?? variantDefaults.bgColor
    const finalBorderColor = borderColor ?? variantDefaults.borderColor
    const finalHoverColor = hoverColor ?? variantDefaults.hoverColor
    const finalTextColor = textColor ?? variantDefaults.textColor

    // Build computed styles
    const computedStyle: CSSProperties = {
      backgroundColor: finalBgColor,
      borderColor: finalBorderColor,
      borderWidth: borderWidth,
      borderStyle: borderStyle,
      borderRadius:
        typeof resolvedBorderRadius === 'number' ? `${resolvedBorderRadius}px` : resolvedBorderRadius,
      padding: typeof resolvedPadding === 'number' ? `${resolvedPadding}px` : resolvedPadding,
      boxShadow: resolvedShadow,
      color: finalTextColor,
      cursor: interactive || disabled ? (disabled ? 'not-allowed' : 'pointer') : 'default',
      opacity: disabled ? 0.5 : 1,
      transition: enableTransition
        ? `all ${transitionDuration}ms ease-in-out, background-color ${transitionDuration}ms ease-in-out, border-color ${transitionDuration}ms ease-in-out`
        : undefined,
      ...style,
    }

    const [isHovered, setIsHovered] = React.useState(false)

    const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!disabled && (interactive || hoverColor)) {
        setIsHovered(true)
        if (finalHoverColor && finalHoverColor !== finalBgColor) {
          e.currentTarget.style.backgroundColor = finalHoverColor
          if (borderColor !== 'transparent') {
            // Optionally brighten border on hover
            e.currentTarget.style.borderColor = finalHoverColor
          }
        }
      }
      onMouseEnter?.(e)
    }

    const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!disabled && isHovered) {
        setIsHovered(false)
        e.currentTarget.style.backgroundColor = finalBgColor
        e.currentTarget.style.borderColor = finalBorderColor
      }
      onMouseLeave?.(e)
    }

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!disabled) {
        onClick?.(e)
      }
    }

    return (
      <div
        ref={ref}
        className={className}
        style={computedStyle}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        role={onClick ? 'button' : undefined}
        aria-disabled={disabled}
        tabIndex={interactive && !disabled ? 0 : undefined}
      >
        {children}
      </div>
    )
  }
)

StyledCard.displayName = 'StyledCard'

export default StyledCard
