/**
 * TaskbarNPCStrip
 *
 * Container for pinned NPC portrait row.
 * Reads pinned NPC IDs from osThemeStore and NPC data from npcStore.
 */

import { useNPCStore } from '../../../stores/npcStore.js'
import { useOSThemeStore } from '../../../stores/osThemeStore.js'
import { useConversationStore } from '../../../stores/conversationStore.js'
import { TaskbarNPCPortrait } from './TaskbarNPCPortrait.js'

interface TaskbarNPCStripProps {
  onOpenNPCConversation?: (npcId: string) => void
}

export function TaskbarNPCStrip({ onOpenNPCConversation }: TaskbarNPCStripProps) {
  const pinnedNPCIds = useOSThemeStore(s => s.taskbar.pinnedNPCIds)
  const showNPCStrip = useOSThemeStore(s => s.taskbar.showNPCStrip)
  const unpinNPC = useOSThemeStore(s => s.unpinNPC)
  const npcs = useNPCStore(s => s.npcs)
  const rawConversations = useConversationStore(s => s.conversations)
  const conversations = Array.isArray(rawConversations) ? rawConversations : []

  if (!showNPCStrip || !pinnedNPCIds || pinnedNPCIds.length === 0) return null

  // Get unread count per NPC by checking conversations where NPC is a participant
  const getUnreadForNPC = (npcId: string): number => {
    return conversations
      .filter(c => c.participants.some(p => p.id === npcId))
      .reduce((sum, c) => sum + c.unreadCount, 0)
  }

  const pinnedNPCs = pinnedNPCIds
    .map(id => npcs[id])
    .filter(Boolean)

  if (pinnedNPCs.length === 0) return null

  return (
    <div className="flex items-center gap-1.5">
      {pinnedNPCs.map(npc => (
        <TaskbarNPCPortrait
          key={npc.id}
          npc={npc}
          unreadCount={getUnreadForNPC(npc.id)}
          onOpenConversation={onOpenNPCConversation ? () => onOpenNPCConversation(npc.id) : undefined}
          onUnpin={() => unpinNPC(npc.id)}
        />
      ))}
    </div>
  )
}
