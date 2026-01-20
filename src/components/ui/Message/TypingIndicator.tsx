import { Avatar } from '../Shared'

interface TypingIndicatorProps {
  users: Array<{
    id: string
    name: string
    avatar?: string
  }>
  variant?: 'dots' | 'text' | 'avatar-dots'
  className?: string
}

export function TypingIndicator({
  users,
  variant = 'dots',
  className = '',
}: TypingIndicatorProps) {
  if (users.length === 0) return null

  const names = users.map(u => u.name)
  const displayText = getTypingText(names)

  return (
    <div className={`flex items-center gap-2 text-sm ${className}`}>
      {/* Avatar(s) for avatar-dots variant */}
      {variant === 'avatar-dots' && (
        <div className="flex -space-x-2">
          {users.slice(0, 3).map(user => (
            <Avatar
              key={user.id}
              src={user.avatar}
              alt={user.name}
              size="xs"
              fallback={user.name}
            />
          ))}
        </div>
      )}

      {/* Typing content */}
      {variant === 'text' ? (
        <span className="opacity-60 text-xs">{displayText}</span>
      ) : (
        <div className="flex items-center gap-1">
          <div className="flex gap-0.5">
            <TypingDot delay={0} />
            <TypingDot delay={150} />
            <TypingDot delay={300} />
          </div>
          {variant === 'avatar-dots' && users.length === 1 && (
            <span className="opacity-60 text-xs ml-1">{users[0].name}</span>
          )}
        </div>
      )}
    </div>
  )
}

function TypingDot({ delay }: { delay: number }) {
  return (
    <span
      className="w-1.5 h-1.5 rounded-full bg-current opacity-60"
      style={{
        animation: 'typing-bounce 1s ease-in-out infinite',
        animationDelay: `${delay}ms`,
      }}
    />
  )
}

function getTypingText(names: string[]): string {
  if (names.length === 0) return ''
  if (names.length === 1) return `${names[0]} is typing...`
  if (names.length === 2) return `${names[0]} and ${names[1]} are typing...`
  if (names.length === 3) return `${names[0]}, ${names[1]}, and ${names[2]} are typing...`
  return `${names[0]}, ${names[1]}, and ${names.length - 2} others are typing...`
}

// Messenger-style bubble typing indicator
export function TypingBubble({
  avatar,
  name,
  className = '',
}: {
  avatar?: string
  name: string
  className?: string
}) {
  return (
    <div className={`flex items-end gap-2 ${className}`}>
      <Avatar
        src={avatar}
        alt={name}
        size="sm"
        fallback={name}
      />
      <div
        className="px-4 py-3 rounded-[18px] rounded-bl-sm"
        style={{ background: 'var(--message-other-bg)' }}
      >
        <div className="flex gap-1">
          <TypingDot delay={0} />
          <TypingDot delay={150} />
          <TypingDot delay={300} />
        </div>
      </div>
    </div>
  )
}

// Discord-style typing indicator (shows at bottom of chat)
export function TypingBar({
  users,
  className = '',
}: {
  users: Array<{ id: string; name: string }>
  className?: string
}) {
  if (users.length === 0) return null

  const names = users.map(u => u.name)

  return (
    <div className={`flex items-center gap-2 px-4 py-1 text-xs ${className}`}>
      <div className="flex gap-0.5">
        <TypingDot delay={0} />
        <TypingDot delay={150} />
        <TypingDot delay={300} />
      </div>
      <span className="opacity-80">
        <strong>{names.slice(0, 3).join(', ')}</strong>
        {names.length > 3 && ` and ${names.length - 3} others`}
        {names.length === 1 ? ' is' : ' are'} typing...
      </span>
    </div>
  )
}
