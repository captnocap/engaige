interface AvatarProps {
  src?: string | null
  alt?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  fallback?: string
  online?: boolean
  border?: boolean
  borderColor?: string
}

const SIZES = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-xl',
}

export function Avatar({
  src,
  alt = 'Avatar',
  size = 'md',
  className = '',
  fallback,
  online,
  border = false,
  borderColor,
}: AvatarProps) {
  const initials = fallback
    ? fallback.slice(0, 2).toUpperCase()
    : alt.slice(0, 2).toUpperCase()

  const sizeClass = SIZES[size]

  return (
    <div className={`relative inline-block ${className}`}>
      {src ? (
        <img
          src={src}
          alt={alt}
          className={`${sizeClass} rounded-full object-cover ${border ? 'ring-2' : ''}`}
          style={border ? { '--tw-ring-color': borderColor || 'var(--color-primary)' } as any : undefined}
          onError={(e) => {
            // Fallback to initials on load error
            e.currentTarget.style.display = 'none'
            e.currentTarget.nextElementSibling?.classList.remove('hidden')
          }}
        />
      ) : null}
      <div
        className={`${sizeClass} rounded-full flex items-center justify-center font-medium ${src ? 'hidden' : ''} ${border ? 'ring-2' : ''}`}
        style={{
          background: 'var(--color-bgTertiary)',
          color: 'var(--color-textMuted)',
          ...(border ? { '--tw-ring-color': borderColor || 'var(--color-primary)' } as any : {}),
        }}
      >
        {initials}
      </div>

      {online !== undefined && (
        <span
          className={`absolute bottom-0 right-0 block rounded-full ring-2 ${
            size === 'xs' || size === 'sm' ? 'w-2 h-2' : 'w-3 h-3'
          }`}
          style={{
            background: online ? 'var(--color-success)' : 'var(--color-textMuted)',
            '--tw-ring-color': 'var(--color-bg)',
          } as any}
        />
      )}
    </div>
  )
}
