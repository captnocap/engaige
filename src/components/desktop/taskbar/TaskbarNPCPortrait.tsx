/**
 * TaskbarNPCPortrait
 *
 * Single NPC avatar with mood-color ring border and unread badge.
 * Hover shows popup, click opens conversation, right-click shows context menu.
 */

import { useState, useRef, useCallback } from 'react'
import type { NPC } from '../../../stores/npcStore.js'
import type { ContextMenuItem } from './types.js'
import { TaskbarNPCPopup } from './TaskbarNPCPopup.js'
import { ContextMenu } from '../../ui/ContextMenu.js'
import { useContextMenu } from '../../../hooks/useContextMenu.js'

interface TaskbarNPCPortraitProps {
  npc: NPC
  unreadCount: number
  onOpenConversation?: () => void
  onUnpin?: () => void
}

const MOOD_COLORS: Record<string, string> = {
  partner: '#ec4899',
  romantic_interest: '#f472b6',
  best_friend: '#a855f7',
  close_friend: '#22c55e',
  friend: '#3b82f6',
  acquaintance: '#9ca3af',
  stranger: '#4b5563',
}

export function TaskbarNPCPortrait({ npc, unreadCount, onOpenConversation, onUnpin }: TaskbarNPCPortraitProps) {
  const [showPopup, setShowPopup] = useState(false)
  const portraitRef = useRef<HTMLButtonElement>(null)
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const ctx = useContextMenu()

  const moodColor = MOOD_COLORS[npc.relationship.level] || MOOD_COLORS.stranger

  const handleMouseEnter = useCallback(() => {
    hoverTimerRef.current = setTimeout(() => {
      setShowPopup(true)
    }, 300)
  }, [])

  const handleMouseLeave = useCallback(() => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current)
      hoverTimerRef.current = null
    }
    // Don't close popup here - the popup manages its own closing via mouse tracking
  }, [])

  const contextItems: ContextMenuItem[] = [
    ...(onOpenConversation ? [{
      label: 'Message',
      onClick: () => onOpenConversation(),
    }] : []),
    ...(onUnpin ? [{
      label: 'Unpin from Taskbar',
      onClick: () => onUnpin(),
    }] : []),
  ]

  return (
    <>
      <button
        ref={portraitRef}
        onClick={() => setShowPopup(prev => !prev)}
        onContextMenu={ctx.show}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="
          relative w-8 h-8 rounded-full flex items-center justify-center
          transition-transform duration-150 hover:scale-110
          shrink-0
        "
        style={{
          border: `2px solid ${moodColor}`,
          boxShadow: `0 0 6px ${moodColor}40`,
        }}
      >
        {/* Avatar */}
        <span className="text-sm leading-none">{npc.avatar}</span>

        {/* Unread badge */}
        {unreadCount > 0 && (
          <span className="
            absolute -top-1 -right-1 min-w-[14px] h-[14px]
            rounded-full bg-red-500 text-white text-[8px] font-bold
            flex items-center justify-center px-0.5
          ">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Hover popup */}
      {showPopup && portraitRef.current && (
        <TaskbarNPCPopup
          npc={npc}
          anchorRect={portraitRef.current.getBoundingClientRect()}
          onClose={() => setShowPopup(false)}
          onOpenConversation={onOpenConversation}
        />
      )}

      {/* Context menu */}
      {ctx.visible && contextItems.length > 0 && (
        <ContextMenu
          items={contextItems}
          x={ctx.x}
          y={ctx.y}
          onClose={ctx.hide}
        />
      )}
    </>
  )
}
