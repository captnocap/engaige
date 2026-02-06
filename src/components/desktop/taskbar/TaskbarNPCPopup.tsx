/**
 * TaskbarNPCPopup
 *
 * Hover popup showing NPC name, relationship bars, stats, and action buttons.
 */

import { useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import type { NPC } from '../../../stores/npcStore.js'

interface TaskbarNPCPopupProps {
  npc: NPC
  anchorRect: DOMRect
  onClose: () => void
  onOpenConversation?: () => void
}

function RelationshipBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-white/50 w-16 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-[10px] text-white/60 w-6 text-right">{value}</span>
    </div>
  )
}

const LEVEL_LABELS: Record<string, { label: string; color: string }> = {
  stranger: { label: 'Stranger', color: '#6b7280' },
  acquaintance: { label: 'Acquaintance', color: '#9ca3af' },
  friend: { label: 'Friend', color: '#3b82f6' },
  close_friend: { label: 'Close Friend', color: '#22c55e' },
  best_friend: { label: 'Best Friend', color: '#a855f7' },
  romantic: { label: 'Romantic', color: '#ec4899' },
}

export function TaskbarNPCPopup({ npc, anchorRect, onClose, onOpenConversation }: TaskbarNPCPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null)

  // Clamp popup within viewport after render
  useEffect(() => {
    if (!popupRef.current) return
    const el = popupRef.current
    const rect = el.getBoundingClientRect()
    if (rect.right > window.innerWidth - 8) {
      el.style.left = `${window.innerWidth - rect.width - 8}px`
    }
    if (rect.left < 8) {
      el.style.left = '8px'
    }
  })

  // Close when mouse leaves both the popup and the trigger
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!popupRef.current) return
      const popupRect = popupRef.current.getBoundingClientRect()

      // Expanded hit area that includes the gap between portrait and popup
      const buffer = 12
      const inPopup = (
        e.clientX >= popupRect.left - buffer &&
        e.clientX <= popupRect.right + buffer &&
        e.clientY >= popupRect.top - buffer &&
        e.clientY <= popupRect.bottom + buffer
      )
      const inAnchor = (
        e.clientX >= anchorRect.left - buffer &&
        e.clientX <= anchorRect.right + buffer &&
        e.clientY >= anchorRect.top - buffer &&
        e.clientY <= anchorRect.bottom + buffer
      )

      if (!inPopup && !inAnchor) {
        onClose()
      }
    }

    document.addEventListener('mousemove', handleMouseMove)
    return () => document.removeEventListener('mousemove', handleMouseMove)
  }, [anchorRect, onClose])

  const rel = npc.relationship
  const levelInfo = LEVEL_LABELS[rel.level] || LEVEL_LABELS.stranger

  const lastInteraction = rel.lastInteraction
    ? formatTimeAgo(new Date(rel.lastInteraction))
    : 'Never'

  return createPortal(
    <div
      ref={popupRef}
      className="
        fixed z-[9997] w-56
        bg-[#1a1a2e]/95 backdrop-blur-xl
        border border-white/10 rounded-xl shadow-2xl
        p-3 animate-in fade-in slide-in-from-bottom-2 duration-150
      "
      style={{
        left: anchorRect.left + anchorRect.width / 2 - 112,
        top: anchorRect.top - 8,
        transform: 'translateY(-100%)',
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <div className="text-xl">{npc.avatar}</div>
        <div>
          <div className="text-sm text-white/90 font-medium">{npc.name}</div>
          <div className="text-[10px] flex items-center gap-1">
            <span
              className="inline-block w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: levelInfo.color }}
            />
            <span style={{ color: levelInfo.color }}>{levelInfo.label}</span>
          </div>
        </div>
      </div>

      {/* Relationship Bars */}
      <div className="space-y-1.5 mb-2">
        <RelationshipBar label="Trust" value={rel.trust} color="#3b82f6" />
        <RelationshipBar label="Affinity" value={rel.affinity} color="#ec4899" />
        <RelationshipBar label="Familiarity" value={rel.familiarity} color="#a855f7" />
      </div>

      {/* Stats */}
      <div className="flex justify-between text-[10px] text-white/40 mb-2 pt-1 border-t border-white/8">
        <span>Messages: {rel.totalMessages}</span>
        <span>Last: {lastInteraction}</span>
      </div>

      {/* Actions */}
      {onOpenConversation && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onOpenConversation()
            onClose()
          }}
          className="
            w-full py-1.5 rounded-md text-xs font-medium
            bg-white/10 text-white/80 hover:bg-white/15
            transition-colors
          "
        >
          Open Chat
        </button>
      )}
    </div>,
    document.body,
  )
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
