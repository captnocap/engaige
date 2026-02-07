/**
 * MessengerProfilePanel
 *
 * Right-side NPC profile panel in chat view. Shows avatar, mood, activity,
 * relationship stats, and interests - MySpace IM style.
 */

import { useNPC } from '../../../../stores/npcStore.js'
import { useProfile } from '../../../../stores/socialStore.js'
import { MYFACE_COLORS, STATUS_COLORS, RELATIONSHIP_COLORS, RELATIONSHIP_LABELS } from './constants.js'

interface MessengerProfilePanelProps {
  npcId: string
}

export function MessengerProfilePanel({ npcId }: MessengerProfilePanelProps) {
  const npc = useNPC(npcId)
  const profile = useProfile(npcId)

  if (!npc) return null

  const isOnline = profile?.isOnline ?? false
  const statusColor = isOnline ? STATUS_COLORS.online : STATUS_COLORS.offline
  const relationshipColor = RELATIONSHIP_COLORS[npc.relationship.level] || RELATIONSHIP_COLORS.stranger
  const relationshipLabel = RELATIONSHIP_LABELS[npc.relationship.level] || 'Stranger'

  return (
    <div
      className="h-full flex flex-col overflow-y-auto"
      style={{ background: MYFACE_COLORS.bgSecondary, borderLeft: `1px solid ${MYFACE_COLORS.border}` }}
    >
      {/* Avatar + Name + Status */}
      <div className="p-4 flex flex-col items-center text-center" style={{ borderBottom: `1px solid ${MYFACE_COLORS.borderLight}` }}>
        <div className="relative mb-2">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-3xl"
            style={{
              background: '#e5e7eb',
              border: `3px solid ${relationshipColor}`,
            }}
          >
            {npc.avatar}
          </div>
          <div
            className="absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white"
            style={{ background: statusColor }}
          />
        </div>
        <div className="font-bold text-sm" style={{ color: MYFACE_COLORS.primary }}>
          {npc.name}
        </div>
        <div className="text-xs" style={{ color: MYFACE_COLORS.textMuted }}>
          {isOnline ? 'Online' : 'Offline'}
        </div>
      </div>

      {/* Mood / Personal message (MSN style) */}
      {profile?.mood && (
        <div className="px-4 py-2" style={{ borderBottom: `1px solid ${MYFACE_COLORS.borderLight}` }}>
          <div className="text-xs italic text-center" style={{ color: MYFACE_COLORS.textMuted }}>
            {profile.moodEmoji && <span className="mr-1">{profile.moodEmoji}</span>}
            {profile.mood}
          </div>
        </div>
      )}

      {/* Activity line (Xfire style) */}
      <div className="px-4 py-2" style={{ borderBottom: `1px solid ${MYFACE_COLORS.borderLight}` }}>
        <div className="text-[10px] uppercase font-bold mb-1" style={{ color: MYFACE_COLORS.textMuted }}>
          Activity
        </div>
        <div className="text-xs" style={{ color: MYFACE_COLORS.text }}>
          {profile?.location || npc.occupation || 'Idle'}
        </div>
      </div>

      {/* Relationship badge + stats */}
      <div className="px-4 py-3" style={{ borderBottom: `1px solid ${MYFACE_COLORS.borderLight}` }}>
        <div className="flex items-center justify-center mb-2">
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
            style={{ background: relationshipColor }}
          >
            {relationshipLabel}
          </span>
        </div>

        <StatBar label="Trust" value={npc.relationship.trust} color="#3b82f6" />
        <StatBar label="Affinity" value={npc.relationship.affinity} color="#ec4899" />
        <StatBar label="Familiarity" value={npc.relationship.familiarity} color="#8b5cf6" />
      </div>

      {/* Interests */}
      {npc.interests.length > 0 && (
        <div className="px-4 py-3" style={{ borderBottom: `1px solid ${MYFACE_COLORS.borderLight}` }}>
          <div className="text-[10px] uppercase font-bold mb-1.5" style={{ color: MYFACE_COLORS.textMuted }}>
            Interests
          </div>
          <div className="flex flex-wrap gap-1">
            {npc.interests.map(interest => (
              <span
                key={interest}
                className="text-[10px] px-1.5 py-0.5 rounded"
                style={{ background: '#e5e7eb', color: MYFACE_COLORS.text }}
              >
                {interest}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Music */}
      {npc.music && (
        <div className="px-4 py-3">
          <div className="text-[10px] uppercase font-bold mb-1" style={{ color: MYFACE_COLORS.textMuted }}>
            Listening to
          </div>
          <div className="text-xs" style={{ color: MYFACE_COLORS.text }}>
            {npc.music}
          </div>
        </div>
      )}
    </div>
  )
}

function StatBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2 mb-1">
      <span className="text-[10px] w-16 text-right" style={{ color: MYFACE_COLORS.textMuted }}>
        {label}
      </span>
      <div className="flex-1 h-1.5 rounded-full bg-gray-200 overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${value}%`, background: color }}
        />
      </div>
      <span className="text-[10px] w-6" style={{ color: MYFACE_COLORS.textMuted }}>
        {value}
      </span>
    </div>
  )
}
