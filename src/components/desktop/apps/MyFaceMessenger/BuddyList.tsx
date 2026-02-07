/**
 * BuddyList
 *
 * AIM-style buddy list with grouped contacts (online/offline),
 * status indicators, activity lines, and unread badges.
 */

import { useState, useEffect } from 'react'
import { useNPCStore } from '../../../../stores/npcStore.js'
import {
  useConversationStore,
  useConversations,
} from '../../../../stores/conversationStore.js'
import { useSocialStore, usePlayerProfile } from '../../../../stores/socialStore.js'
import { MYFACE_COLORS, STATUS_COLORS, RELATIONSHIP_COLORS } from './constants.js'

interface BuddyListProps {
  onSelectNPC: (npcId: string) => void
}

export function BuddyList({ onSelectNPC }: BuddyListProps) {
  const npcs = useNPCStore(s => s.npcs)
  const isNPCOnline = useNPCStore(s => s.isNPCOnline)
  const conversations = useConversations('myspace')
  const { initialize } = useConversationStore()
  const getProfile = useSocialStore(s => s.getProfile)
  const playerProfile = usePlayerProfile()

  const [search, setSearch] = useState('')
  const [onlineOpen, setOnlineOpen] = useState(true)
  const [offlineOpen, setOfflineOpen] = useState(true)

  useEffect(() => {
    initialize()
  }, [initialize])

  // Filter NPCs: must be at least acquaintance and on myface
  const eligibleNPCs = Object.values(npcs).filter(npc => {
    const level = npc.relationship.level
    if (level === 'stranger') return false
    if (!npc.apps.some(a => (a.appId === 'myface' || a.appId === 'myface-chat') && a.isActive)) return false
    if (search && !npc.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  // Split into online/offline
  const onlineNPCs = eligibleNPCs.filter(npc => isNPCOnline(npc.id))
  const offlineNPCs = eligibleNPCs.filter(npc => !isNPCOnline(npc.id))

  // Sort by last message time
  const getLastMessageTime = (npcId: string) => {
    const convo = conversations.find(c => c.participants.some(p => p.id === npcId))
    return convo ? new Date(convo.updatedAt).getTime() : 0
  }

  onlineNPCs.sort((a, b) => getLastMessageTime(b.id) - getLastMessageTime(a.id))
  offlineNPCs.sort((a, b) => getLastMessageTime(b.id) - getLastMessageTime(a.id))

  // Get unread count for an NPC
  const getUnreadCount = (npcId: string) => {
    return conversations
      .filter(c => c.participants.some(p => p.id === npcId))
      .reduce((sum, c) => sum + c.unreadCount, 0)
  }

  return (
    <div className="h-full flex flex-col" style={{ background: MYFACE_COLORS.bg }}>
      {/* Player header */}
      <div
        className="flex items-center gap-2 px-3 py-2 shrink-0"
        style={{ background: MYFACE_COLORS.primary }}
      >
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm bg-white/20 text-white">
          {playerProfile?.avatar || '🧑'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-white font-bold text-sm truncate">
            {playerProfile?.name || 'You'}
          </div>
          <div className="text-white/60 text-[10px]">Online</div>
        </div>
      </div>

      {/* Search */}
      <div className="px-2 py-1.5 shrink-0" style={{ borderBottom: `1px solid ${MYFACE_COLORS.borderLight}` }}>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search contacts..."
          className="w-full px-2 py-1 text-xs rounded outline-none"
          style={{
            background: MYFACE_COLORS.bgSecondary,
            border: `1px solid ${MYFACE_COLORS.borderLight}`,
            color: MYFACE_COLORS.text,
          }}
        />
      </div>

      {/* Contact groups */}
      <div className="flex-1 overflow-y-auto">
        {/* Online group */}
        <GroupHeader
          label={`Online (${onlineNPCs.length})`}
          isOpen={onlineOpen}
          onToggle={() => setOnlineOpen(v => !v)}
        />
        {onlineOpen && onlineNPCs.map(npc => (
          <BuddyRow
            key={npc.id}
            npc={npc}
            isOnline={true}
            activity={getProfile(npc.id)?.mood || npc.occupation}
            unreadCount={getUnreadCount(npc.id)}
            onClick={() => onSelectNPC(npc.id)}
          />
        ))}

        {/* Offline group */}
        <GroupHeader
          label={`Offline (${offlineNPCs.length})`}
          isOpen={offlineOpen}
          onToggle={() => setOfflineOpen(v => !v)}
        />
        {offlineOpen && offlineNPCs.map(npc => {
          const profile = getProfile(npc.id)
          const lastSeen = profile?.lastSeen
            ? formatLastSeen(profile.lastSeen)
            : undefined
          return (
            <BuddyRow
              key={npc.id}
              npc={npc}
              isOnline={false}
              activity={lastSeen ? `Last seen ${lastSeen}` : npc.occupation}
              unreadCount={getUnreadCount(npc.id)}
              onClick={() => onSelectNPC(npc.id)}
            />
          )
        })}

        {eligibleNPCs.length === 0 && (
          <div className="text-center text-xs py-8" style={{ color: MYFACE_COLORS.textMuted }}>
            {search ? 'No contacts match your search' : 'No contacts yet'}
          </div>
        )}
      </div>
    </div>
  )
}

function GroupHeader({ label, isOpen, onToggle }: { label: string; isOpen: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center gap-1 px-3 py-1.5 text-[11px] font-bold cursor-pointer hover:bg-gray-50"
      style={{ color: MYFACE_COLORS.primary, borderBottom: `1px solid ${MYFACE_COLORS.borderLight}` }}
    >
      <span className="text-[9px]">{isOpen ? '▼' : '▶'}</span>
      {label}
    </button>
  )
}

interface BuddyRowProps {
  npc: import('../../../../stores/npcStore.js').NPC
  isOnline: boolean
  activity?: string
  unreadCount: number
  onClick: () => void
}

function BuddyRow({ npc, isOnline, activity, unreadCount, onClick }: BuddyRowProps) {
  const statusColor = isOnline ? STATUS_COLORS.online : STATUS_COLORS.offline
  const relationshipColor = RELATIONSHIP_COLORS[npc.relationship.level] || RELATIONSHIP_COLORS.stranger

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2 px-3 py-1.5 cursor-pointer hover:bg-blue-50 transition-colors"
      style={{ opacity: isOnline ? 1 : 0.7 }}
    >
      {/* Status dot */}
      <div className="w-2 h-2 rounded-full shrink-0" style={{ background: statusColor }} />

      {/* Avatar */}
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center text-sm shrink-0"
        style={{ background: '#e5e7eb', border: `2px solid ${relationshipColor}` }}
      >
        {npc.avatar}
      </div>

      {/* Name + activity */}
      <div className="flex-1 min-w-0 text-left">
        <div className="text-xs font-medium truncate" style={{ color: MYFACE_COLORS.primary }}>
          {npc.name}
        </div>
        {activity && (
          <div className="text-[10px] truncate" style={{ color: MYFACE_COLORS.textMuted }}>
            {activity}
          </div>
        )}
      </div>

      {/* Unread badge */}
      {unreadCount > 0 && (
        <div
          className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
          style={{ background: MYFACE_COLORS.accent }}
        >
          {unreadCount > 9 ? '9+' : unreadCount}
        </div>
      )}
    </button>
  )
}

function formatLastSeen(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const minutes = Math.floor(diffMs / 60000)
  const hours = Math.floor(diffMs / 3600000)
  const days = Math.floor(diffMs / 86400000)

  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
