/**
 * DatingCard Component
 *
 * Skinnable dating profile card that adapts to the dating site's theme.
 * Used in swipe interfaces and grid views.
 */

import { useState } from 'react'
import type { NPC, NPCDatingProfile } from '../../stores/npcStore.js'
import type { DatingSiteDefinition } from '../../config/dating-registry.js'

export interface DatingCardProps {
  npc: NPC
  datingProfile: NPCDatingProfile
  site: DatingSiteDefinition
  variant?: 'swipe' | 'grid' | 'list'
  onLike?: () => void
  onPass?: () => void
  onSuperLike?: () => void
  onViewProfile?: () => void
  showActions?: boolean
  isStacked?: boolean  // When true, adds depth effect for card stack
  stackIndex?: number  // Position in stack for offset
}

export function DatingCard({
  npc,
  datingProfile,
  site,
  variant = 'swipe',
  onLike,
  onPass,
  onSuperLike,
  onViewProfile,
  showActions = true,
  isStacked = false,
  stackIndex = 0,
}: DatingCardProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [showFullBio, setShowFullBio] = useState(false)

  const photos = datingProfile.photos
  const hasMultiplePhotos = photos.length > 1

  const nextPhoto = () => {
    if (currentPhotoIndex < photos.length - 1) {
      setCurrentPhotoIndex(currentPhotoIndex + 1)
    }
  }

  const prevPhoto = () => {
    if (currentPhotoIndex > 0) {
      setCurrentPhotoIndex(currentPhotoIndex - 1)
    }
  }

  // Stack offset for depth effect
  const stackOffset = isStacked ? stackIndex * 4 : 0
  const stackScale = isStacked ? 1 - stackIndex * 0.02 : 1
  const stackOpacity = isStacked && stackIndex > 0 ? 0.8 : 1

  if (variant === 'grid') {
    return (
      <GridCard
        npc={npc}
        datingProfile={datingProfile}
        site={site}
        onViewProfile={onViewProfile}
      />
    )
  }

  if (variant === 'list') {
    return (
      <ListCard
        npc={npc}
        datingProfile={datingProfile}
        site={site}
        onViewProfile={onViewProfile}
        onLike={onLike}
      />
    )
  }

  // Swipe card variant (default)
  return (
    <div
      className="absolute inset-0 rounded-xl overflow-hidden shadow-2xl cursor-pointer select-none"
      style={{
        background: site.theme.cardBackground,
        transform: `translateY(${stackOffset}px) scale(${stackScale})`,
        opacity: stackOpacity,
        zIndex: 10 - stackIndex,
        transition: 'transform 0.3s ease, opacity 0.3s ease',
      }}
      onClick={onViewProfile}
    >
      {/* Photo Section */}
      <div className="relative h-[70%] bg-gray-900">
        {/* Current Photo */}
        <div className="absolute inset-0 flex items-center justify-center text-[120px]">
          {photos[currentPhotoIndex] || npc.avatar}
        </div>

        {/* Photo Navigation Overlay */}
        {hasMultiplePhotos && (
          <>
            {/* Left tap area */}
            <div
              className="absolute left-0 top-0 bottom-0 w-1/3 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation()
                prevPhoto()
              }}
            />
            {/* Right tap area */}
            <div
              className="absolute right-0 top-0 bottom-0 w-1/3 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation()
                nextPhoto()
              }}
            />
            {/* Photo indicators */}
            <div className="absolute top-3 left-0 right-0 flex justify-center gap-1 px-3">
              {photos.map((_, index) => (
                <div
                  key={index}
                  className="h-1 flex-1 rounded-full transition-colors"
                  style={{
                    background:
                      index === currentPhotoIndex
                        ? site.theme.primaryColor
                        : 'rgba(255,255,255,0.4)',
                    maxWidth: '60px',
                  }}
                />
              ))}
            </div>
          </>
        )}

        {/* Gradient overlay for text readability */}
        <div
          className="absolute bottom-0 left-0 right-0 h-32"
          style={{
            background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
          }}
        />

        {/* Name and basic info */}
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <div className="flex items-baseline gap-2">
            <h2 className="text-2xl font-bold">{npc.name}</h2>
            <span className="text-xl opacity-80">{npc.age}</span>
          </div>
          <p className="text-sm opacity-70 flex items-center gap-1">
            <span>📍</span> {npc.location}
          </p>
        </div>
      </div>

      {/* Info Section */}
      <div className="h-[30%] p-4 flex flex-col" style={{ color: '#333' }}>
        {/* Bio */}
        <p
          className={`text-sm leading-relaxed ${showFullBio ? '' : 'line-clamp-2'}`}
          onClick={(e) => {
            e.stopPropagation()
            setShowFullBio(!showFullBio)
          }}
        >
          {datingProfile.bio}
        </p>

        {/* Looking for */}
        <p className="text-xs mt-2 opacity-60">
          Looking for: {datingProfile.lookingFor}
        </p>

        {/* Action Buttons */}
        {showActions && (
          <div className="flex justify-center items-center gap-4 mt-auto pt-2">
            {/* Pass Button */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                onPass?.()
              }}
              className="w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-lg transition-transform hover:scale-110 active:scale-95"
              style={{
                background: 'white',
                border: '2px solid #ff4458',
                color: '#ff4458',
              }}
            >
              ✕
            </button>

            {/* Super Like Button (if enabled) */}
            {site.features.superLikes && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onSuperLike?.()
                }}
                className="w-11 h-11 rounded-full flex items-center justify-center text-lg shadow-lg transition-transform hover:scale-110 active:scale-95"
                style={{
                  background: 'white',
                  border: '2px solid #00d4ff',
                  color: '#00d4ff',
                }}
              >
                ⭐
              </button>
            )}

            {/* Like Button */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                onLike?.()
              }}
              className="w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-lg transition-transform hover:scale-110 active:scale-95"
              style={{
                background: 'white',
                border: `2px solid ${site.theme.primaryColor}`,
                color: site.theme.primaryColor,
              }}
            >
              ❤️
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// Grid Card Variant
// ============================================================================

interface GridCardProps {
  npc: NPC
  datingProfile: NPCDatingProfile
  site: DatingSiteDefinition
  onViewProfile?: () => void
}

function GridCard({ npc, datingProfile, site, onViewProfile }: GridCardProps) {
  return (
    <button
      onClick={onViewProfile}
      className="relative rounded-lg overflow-hidden aspect-[3/4] shadow-md transition-transform hover:scale-105 hover:shadow-xl text-left"
      style={{ background: site.theme.cardBackground }}
    >
      {/* Photo */}
      <div className="absolute inset-0 flex items-center justify-center text-6xl bg-gray-100">
        {datingProfile.photos[0] || npc.avatar}
      </div>

      {/* Gradient overlay */}
      <div
        className="absolute bottom-0 left-0 right-0 h-24"
        style={{
          background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
        }}
      />

      {/* Info */}
      <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
        <div className="flex items-baseline gap-1">
          <span className="font-bold">{npc.name}</span>
          <span className="text-sm opacity-80">{npc.age}</span>
        </div>
        <p className="text-xs opacity-70 truncate">{npc.location}</p>
      </div>

      {/* Online indicator */}
      <div
        className="absolute top-2 right-2 w-3 h-3 rounded-full"
        style={{
          background: '#00ff00',
          boxShadow: '0 0 4px #00ff00',
        }}
      />
    </button>
  )
}

// ============================================================================
// List Card Variant
// ============================================================================

interface ListCardProps {
  npc: NPC
  datingProfile: NPCDatingProfile
  site: DatingSiteDefinition
  onViewProfile?: () => void
  onLike?: () => void
}

function ListCard({ npc, datingProfile, site, onViewProfile, onLike }: ListCardProps) {
  return (
    <div
      className="flex items-center gap-4 p-4 rounded-lg transition-colors hover:bg-black/5"
      style={{
        background: site.theme.cardBackground,
        borderBottom: '1px solid rgba(0,0,0,0.1)',
      }}
    >
      {/* Avatar */}
      <button
        onClick={onViewProfile}
        className="w-16 h-16 rounded-full flex items-center justify-center text-3xl bg-gray-100 shrink-0"
      >
        {datingProfile.photos[0] || npc.avatar}
      </button>

      {/* Info */}
      <button onClick={onViewProfile} className="flex-1 min-w-0 text-left">
        <div className="flex items-baseline gap-2">
          <span className="font-bold" style={{ color: '#333' }}>
            {npc.name}
          </span>
          <span className="text-sm text-gray-500">{npc.age}</span>
        </div>
        <p className="text-sm text-gray-600 truncate">{datingProfile.bio}</p>
        <p className="text-xs text-gray-400">{npc.location}</p>
      </button>

      {/* Like button */}
      {onLike && (
        <button
          onClick={onLike}
          className="w-10 h-10 rounded-full flex items-center justify-center text-lg transition-transform hover:scale-110"
          style={{
            background: site.theme.primaryColor,
            color: site.theme.textOnPrimary,
          }}
        >
          ❤️
        </button>
      )}
    </div>
  )
}

export default DatingCard
