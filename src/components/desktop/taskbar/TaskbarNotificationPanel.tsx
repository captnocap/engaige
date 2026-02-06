/**
 * TaskbarNotificationPanel
 *
 * Shows real game notifications: relationship milestones, NPC messages,
 * simulation events, etc. Persisted in a Zustand store.
 */

import { useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useNotificationStore, type GameNotification } from '../../../stores/notificationStore.js'

interface TaskbarNotificationPanelProps {
  anchorRect: DOMRect
  onClose: () => void
}

function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

const TYPE_ICONS: Record<GameNotification['type'], string> = {
  relationship: '💚',
  message: '💬',
  achievement: '🏆',
  system: '🔔',
  social: '📱',
}

function NotificationItem({ notification, onDismiss }: {
  notification: GameNotification
  onDismiss: () => void
}) {
  return (
    <div
      className={`
        px-3 py-2.5 flex gap-2.5 transition-colors hover:bg-white/5
        ${notification.read ? 'opacity-60' : ''}
      `}
    >
      <span className="text-base shrink-0 mt-0.5">
        {TYPE_ICONS[notification.type]}
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-sm text-white/85 leading-snug">{notification.title}</div>
        {notification.body && (
          <div className="text-xs text-white/45 leading-snug mt-0.5 line-clamp-2">{notification.body}</div>
        )}
        <div className="text-[10px] text-white/30 mt-1">
          {formatTimeAgo(new Date(notification.timestamp))}
        </div>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onDismiss() }}
        className="text-white/20 hover:text-white/50 text-xs shrink-0 mt-0.5"
        title="Dismiss"
      >
        ✕
      </button>
    </div>
  )
}

export function TaskbarNotificationPanel({ anchorRect, onClose }: TaskbarNotificationPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  const notifications = useNotificationStore(s => s.notifications)
  const markAllRead = useNotificationStore(s => s.markAllRead)
  const dismissNotification = useNotificationStore(s => s.dismiss)
  const clearAll = useNotificationStore(s => s.clearAll)

  // Mark all as read when panel opens
  useEffect(() => {
    markAllRead()
  }, [markAllRead])

  // Clamp panel within viewport after render
  useEffect(() => {
    if (!panelRef.current) return
    const el = panelRef.current
    const rect = el.getBoundingClientRect()
    if (rect.right > window.innerWidth - 8) {
      el.style.left = `${window.innerWidth - rect.width - 8}px`
    }
    if (rect.left < 8) {
      el.style.left = '8px'
    }
  })

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClick, true)
    return () => document.removeEventListener('mousedown', handleClick, true)
  }, [onClose])

  return createPortal(
    <div
      ref={panelRef}
      className="
        fixed z-[9998] w-80
        bg-[#1a1a2e]/95 backdrop-blur-xl
        border border-white/10 rounded-xl shadow-2xl
        animate-in fade-in slide-in-from-bottom-2 duration-150
        overflow-hidden
      "
      style={{
        left: anchorRect.left + anchorRect.width / 2 - 160,
        top: anchorRect.top - 8,
        transform: 'translateY(-100%)',
      }}
    >
      {/* Header */}
      <div className="px-3 pt-3 pb-2 flex items-center justify-between border-b border-white/8">
        <span className="text-sm font-medium text-white/90">Notifications</span>
        {notifications.length > 0 && (
          <button
            onClick={clearAll}
            className="text-[10px] text-white/40 hover:text-white/60 transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Notification list */}
      <div className="max-h-[360px] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="py-10 text-center">
            <div className="text-2xl mb-2">🔔</div>
            <div className="text-sm text-white/40">No notifications</div>
            <div className="text-xs text-white/25 mt-1">You're all caught up!</div>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {notifications.map(n => (
              <NotificationItem
                key={n.id}
                notification={n}
                onDismiss={() => dismissNotification(n.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}
