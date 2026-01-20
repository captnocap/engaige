/**
 * MatchModal Component
 *
 * "It's a Match!" celebration modal.
 * Shown when player matches with an NPC.
 */

import { useEffect, useState } from 'react'
import type { NPC, NPCDatingProfile } from '../../stores/npcStore.js'
import type { DatingSiteDefinition } from '../../config/dating-registry.js'

export interface MatchModalProps {
  npc: NPC
  datingProfile: NPCDatingProfile
  site: DatingSiteDefinition
  playerAvatar?: string
  onSendMessage: () => void
  onKeepSwiping: () => void
}

export function MatchModal({
  npc,
  datingProfile,
  site,
  playerAvatar = '👤',
  onSendMessage,
  onKeepSwiping,
}: MatchModalProps) {
  const [showContent, setShowContent] = useState(false)
  const [showButtons, setShowButtons] = useState(false)

  useEffect(() => {
    // Staggered animation
    const timer1 = setTimeout(() => setShowContent(true), 100)
    const timer2 = setTimeout(() => setShowButtons(true), 600)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
    }
  }, [])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        background: `linear-gradient(135deg, ${site.theme.gradientStart}, ${site.theme.gradientEnd})`,
      }}
    >
      {/* Confetti/Sparkles Background Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              fontSize: `${Math.random() * 20 + 10}px`,
              opacity: Math.random() * 0.5 + 0.3,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${Math.random() * 2 + 1}s`,
            }}
          >
            {['✨', '💖', '💫', '🎉', site.theme.matchCelebrationEmoji][Math.floor(Math.random() * 5)]}
          </div>
        ))}
      </div>

      {/* Content */}
      <div
        className={`flex flex-col items-center transition-all duration-500 ${
          showContent ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
        }`}
      >
        {/* Header Text */}
        <h1
          className="text-4xl font-bold mb-8 text-center"
          style={{
            color: site.theme.textOnPrimary,
            textShadow: '0 2px 20px rgba(0,0,0,0.3)',
          }}
        >
          It's a Match! {site.theme.matchCelebrationEmoji}
        </h1>

        {/* Avatars */}
        <div className="flex items-center justify-center gap-8 mb-8">
          {/* Player Avatar */}
          <div
            className="w-32 h-32 rounded-full flex items-center justify-center text-6xl shadow-2xl ring-4"
            style={{
              background: 'white',
              ringColor: site.theme.textOnPrimary,
            }}
          >
            {playerAvatar}
          </div>

          {/* Heart in the middle */}
          <div
            className="text-5xl animate-bounce"
            style={{ animationDuration: '1s' }}
          >
            💕
          </div>

          {/* NPC Avatar */}
          <div
            className="w-32 h-32 rounded-full flex items-center justify-center text-6xl shadow-2xl ring-4"
            style={{
              background: 'white',
              ringColor: site.theme.textOnPrimary,
            }}
          >
            {datingProfile.photos[0] || npc.avatar}
          </div>
        </div>

        {/* Match name */}
        <p
          className="text-xl mb-2"
          style={{
            color: site.theme.textOnPrimary,
            opacity: 0.9,
          }}
        >
          You and <strong>{npc.name}</strong> liked each other!
        </p>

        {/* Tagline */}
        <p
          className="text-sm mb-8"
          style={{
            color: site.theme.textOnPrimary,
            opacity: 0.7,
          }}
        >
          Now's your chance to start a conversation
        </p>

        {/* Action Buttons */}
        <div
          className={`flex flex-col gap-3 w-64 transition-all duration-300 ${
            showButtons ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          {/* Send Message Button */}
          <button
            onClick={onSendMessage}
            className="w-full py-3 rounded-full font-bold text-lg shadow-lg transition-transform hover:scale-105 active:scale-95"
            style={{
              background: 'white',
              color: site.theme.primaryColor,
            }}
          >
            Send a Message
          </button>

          {/* Keep Swiping Button */}
          <button
            onClick={onKeepSwiping}
            className="w-full py-3 rounded-full font-bold text-lg transition-transform hover:scale-105 active:scale-95"
            style={{
              background: 'transparent',
              color: site.theme.textOnPrimary,
              border: `2px solid ${site.theme.textOnPrimary}`,
            }}
          >
            Keep Swiping
          </button>
        </div>

        {/* Ice breaker prompt (if available) */}
        {site.features.iceBreakers && datingProfile.promptAnswers && datingProfile.promptAnswers.length > 0 && (
          <div
            className={`mt-8 max-w-sm text-center transition-all duration-500 delay-300 ${
              showButtons ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <p
              className="text-xs mb-2 uppercase tracking-wide"
              style={{
                color: site.theme.textOnPrimary,
                opacity: 0.6,
              }}
            >
              Ice Breaker
            </p>
            <p
              className="text-sm italic"
              style={{
                color: site.theme.textOnPrimary,
                opacity: 0.8,
              }}
            >
              "{datingProfile.promptAnswers[0].prompt}"
              <br />
              <strong>"{datingProfile.promptAnswers[0].answer}"</strong>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default MatchModal
