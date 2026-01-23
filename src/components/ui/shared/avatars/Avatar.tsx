/**
 * UserAvatar Component
 *
 * A flexible, reusable avatar component supporting multiple sizes, shapes,
 * status indicators, badges, and custom styling across all sites.
 *
 * Used in: 18+ sites (MyFace, InstaSnap, VidTube, Threadit, WikiKnow, etc.)
 *
 * @example
 * // Basic with initials
 * <Avatar size="md" initials="AB" />
 *
 * @example
 * // With image and status
 * <Avatar
 *   size="lg"
 *   src="https://example.com/avatar.jpg"
 *   initials="AB"
 *   status="online"
 *   onClick={() => console.log('clicked')}
 * />
 *
 * @example
 * // With badge and custom colors
 * <Avatar
 *   size="md"
 *   initials="CD"
 *   badge={3}
 *   bgColor="#007bff"
 *   shape="rounded"
 *   border="2px solid #ffffff"
 * />
 */

import { CSSProperties } from 'react'

interface UserAvatarProps {
  /**
   * Avatar size
   * @default 'md'
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'

  /**
   * Image source URL. If not provided or fails to load, shows initials instead
   */
  src?: string | null

  /**
   * Fallback text (usually initials like "AB"). Shown when src is missing or fails.
   */
  initials?: string

  /**
   * Custom background color for the fallback initials container.
   * Can be any valid CSS color (hex, rgb, var(), etc.)
   * @default Uses theme color from CSS variable
   */
  bgColor?: string

  /**
   * Shape of the avatar
   * @default 'circle'
   */
  shape?: 'circle' | 'square' | 'rounded'

  /**
   * Border styling. Can be:
   * - true: Shows border with theme primary color
   * - false/undefined: No border
   * - string: Custom border style (e.g., "2px solid #ffffff")
   * @default false
   */
  border?: boolean | string

  /**
   * Optional notification badge showing a count
   */
  badge?: number

  /**
   * Status indicator dot with colored circle
   * @default 'none'
   */
  status?: 'online' | 'offline' | 'away' | 'none'

  /**
   * Click handler
   */
  onClick?: () => void

  /**
   * Additional CSS class names
   */
  className?: string

  /**
   * Inline styles for custom overrides
   */
  style?: CSSProperties

  /**
   * Alt text for the image (accessibility)
   * @default 'User avatar'
   */
  alt?: string
}

/**
 * Size to pixel mappings (Tailwind classes to px)
 */
const SIZE_MAPPINGS = {
  xs: { pixels: 24, tailwind: 'w-6 h-6', textSize: 'text-xs' },
  sm: { pixels: 32, tailwind: 'w-8 h-8', textSize: 'text-sm' },
  md: { pixels: 40, tailwind: 'w-10 h-10', textSize: 'text-base' },
  lg: { pixels: 48, tailwind: 'w-12 h-12', textSize: 'text-lg' },
  xl: { pixels: 64, tailwind: 'w-16 h-16', textSize: 'text-xl' },
}

/**
 * Status indicator colors - can be customized per theme
 */
const STATUS_COLORS = {
  online: 'var(--color-success, #22c55e)',
  offline: 'var(--color-textMuted, #9ca3af)',
  away: 'var(--color-warning, #f59e0b)',
  none: 'transparent',
}

/**
 * Badge position offsets based on size
 */
const BADGE_OFFSET = {
  xs: 'top-0 right-0 text-[8px]',
  sm: 'top-0 right-0 text-[9px]',
  md: 'top-0 right-0 text-[10px]',
  lg: '-top-1 -right-1 text-xs',
  xl: '-top-1 -right-1 text-sm',
}

/**
 * Status indicator size offsets based on avatar size
 */
const STATUS_SIZE = {
  xs: 'w-1.5 h-1.5',
  sm: 'w-2 h-2',
  md: 'w-2.5 h-2.5',
  lg: 'w-3 h-3',
  xl: 'w-4 h-4',
}

export function Avatar({
  size = 'md',
  src = null,
  initials = '?',
  bgColor,
  shape = 'circle',
  border = false,
  badge,
  status = 'none',
  onClick,
  className = '',
  style = {},
  alt = 'User avatar',
}: UserAvatarProps) {
  const sizeConfig = SIZE_MAPPINGS[size]

  // Build border classes/styles
  let borderStyle: CSSProperties | undefined
  if (border) {
    if (typeof border === 'string') {
      borderStyle = { border }
    } else {
      borderStyle = { border: `2px solid var(--color-primary, #007bff)` }
    }
  }

  // Shape classes
  const shapeClass = shape === 'circle' ? 'rounded-full' : shape === 'rounded' ? 'rounded-lg' : 'rounded-none'

  // Fallback background
  const fallbackBg = bgColor || 'var(--color-bgTertiary, #f3f4f6)'
  const fallbackText = 'var(--color-textMuted, #6b7280)'

  // Cursor style
  const cursorClass = onClick ? 'cursor-pointer' : ''
  const hoverClass = onClick ? 'hover:opacity-80 transition-opacity' : ''

  // Image load error handler
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.style.display = 'none'
    const fallback = e.currentTarget.nextElementSibling
    if (fallback) {
      fallback.classList.remove('hidden')
    }
  }

  const containerStyle: CSSProperties = {
    position: 'relative',
    display: 'inline-block',
    ...style,
  }

  const imageStyle: CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    ...borderStyle,
  }

  const fallbackStyle: CSSProperties = {
    display: src ? 'none' : 'flex',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: fallbackBg,
    color: fallbackText,
    fontWeight: 500,
    ...borderStyle,
  }

  return (
    <div className={`relative inline-block ${className}`} style={containerStyle}>
      {/* Main avatar container */}
      <div
        className={`${sizeConfig.tailwind} ${shapeClass} ${cursorClass} ${hoverClass} inline-flex overflow-hidden`}
        onClick={onClick}
      >
        {/* Image */}
        {src && (
          <img
            src={src}
            alt={alt}
            style={imageStyle}
            className={shapeClass}
            onError={handleImageError}
          />
        )}

        {/* Fallback: Initials */}
        <div
          className={`${sizeConfig.textSize} ${shapeClass} w-full h-full`}
          style={fallbackStyle}
        >
          {initials.slice(0, 2).toUpperCase()}
        </div>
      </div>

      {/* Status indicator */}
      {status !== 'none' && (
        <span
          className={`absolute bottom-0 right-0 ${STATUS_SIZE[size]} rounded-full ring-2 ring-white`}
          style={{
            backgroundColor: STATUS_COLORS[status],
          }}
          title={status}
        />
      )}

      {/* Badge */}
      {badge !== undefined && badge > 0 && (
        <span
          className={`absolute ${BADGE_OFFSET[size]} min-w-5 h-5 rounded-full flex items-center justify-center font-bold text-white bg-red-500 ring-2 ring-white`}
          style={{
            minWidth: size === 'xs' ? '18px' : size === 'sm' ? '20px' : '24px',
            height: size === 'xs' ? '18px' : size === 'sm' ? '20px' : '24px',
          }}
        >
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </div>
  )
}
