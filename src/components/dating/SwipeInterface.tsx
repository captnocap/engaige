/**
 * SwipeInterface Component
 *
 * Tinder-style card stack with swipe gestures.
 * Handles the swipe animations and card management.
 */

import { useState, useRef, useCallback } from 'react'
import { DatingCard } from './DatingCard.js'
import type { NPC, NPCDatingProfile } from '../../stores/npcStore.js'
import type { DatingSiteDefinition } from '../../config/dating-registry.js'

export interface SwipeInterfaceProps {
  npcs: NPC[]
  getDatingProfile: (npcId: string) => NPCDatingProfile | undefined
  site: DatingSiteDefinition
  onSwipeRight: (npcId: string) => void
  onSwipeLeft: (npcId: string) => void
  onSuperLike?: (npcId: string) => void
  onViewProfile?: (npcId: string) => void
  onEmpty?: () => void
}

interface CardState {
  x: number
  y: number
  rotation: number
  isDragging: boolean
}

const SWIPE_THRESHOLD = 100 // Pixels needed to trigger swipe
const ROTATION_FACTOR = 0.1 // How much the card rotates while dragging

export function SwipeInterface({
  npcs,
  getDatingProfile,
  site,
  onSwipeRight,
  onSwipeLeft,
  onSuperLike,
  onViewProfile,
  onEmpty,
}: SwipeInterfaceProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [cardState, setCardState] = useState<CardState>({
    x: 0,
    y: 0,
    rotation: 0,
    isDragging: false,
  })
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | null>(null)
  const [showLikeIndicator, setShowLikeIndicator] = useState<'like' | 'pass' | null>(null)

  const containerRef = useRef<HTMLDivElement>(null)
  const dragStartRef = useRef({ x: 0, y: 0 })

  const currentNPC = npcs[currentIndex]
  const currentProfile = currentNPC ? getDatingProfile(currentNPC.id) : undefined
  const nextNPC = npcs[currentIndex + 1]
  const nextProfile = nextNPC ? getDatingProfile(nextNPC.id) : undefined

  const handleDragStart = useCallback((clientX: number, clientY: number) => {
    dragStartRef.current = { x: clientX, y: clientY }
    setCardState((prev) => ({ ...prev, isDragging: true }))
  }, [])

  const handleDragMove = useCallback((clientX: number, clientY: number) => {
    const deltaX = clientX - dragStartRef.current.x
    const deltaY = clientY - dragStartRef.current.y
    const rotation = deltaX * ROTATION_FACTOR

    setCardState({
      x: deltaX,
      y: deltaY,
      rotation,
      isDragging: true,
    })

    // Show indicators
    if (deltaX > 50) {
      setShowLikeIndicator('like')
    } else if (deltaX < -50) {
      setShowLikeIndicator('pass')
    } else {
      setShowLikeIndicator(null)
    }
  }, [])

  const handleDragEnd = useCallback(() => {
    const { x } = cardState

    if (x > SWIPE_THRESHOLD) {
      // Swipe right - Like
      handleSwipe('right')
    } else if (x < -SWIPE_THRESHOLD) {
      // Swipe left - Pass
      handleSwipe('left')
    } else {
      // Return to center
      setCardState({ x: 0, y: 0, rotation: 0, isDragging: false })
      setShowLikeIndicator(null)
    }
  }, [cardState.x])

  const handleSwipe = useCallback(
    (direction: 'left' | 'right') => {
      if (!currentNPC) return

      setExitDirection(direction)
      setShowLikeIndicator(null)

      // Animate card exit
      const exitX = direction === 'right' ? window.innerWidth : -window.innerWidth
      setCardState({
        x: exitX,
        y: 0,
        rotation: direction === 'right' ? 30 : -30,
        isDragging: false,
      })

      // After animation, move to next card
      setTimeout(() => {
        if (direction === 'right') {
          onSwipeRight(currentNPC.id)
        } else {
          onSwipeLeft(currentNPC.id)
        }

        setCurrentIndex((prev) => prev + 1)
        setCardState({ x: 0, y: 0, rotation: 0, isDragging: false })
        setExitDirection(null)

        // Check if we've run out of cards
        if (currentIndex + 1 >= npcs.length) {
          onEmpty?.()
        }
      }, 300)
    },
    [currentNPC, currentIndex, npcs.length, onSwipeRight, onSwipeLeft, onEmpty]
  )

  const handleLike = () => handleSwipe('right')
  const handlePass = () => handleSwipe('left')

  const handleSuperLike = () => {
    if (currentNPC && onSuperLike) {
      onSuperLike(currentNPC.id)
      handleSwipe('right')
    }
  }

  // Mouse events
  const onMouseDown = (e: React.MouseEvent) => {
    handleDragStart(e.clientX, e.clientY)
  }

  const onMouseMove = (e: React.MouseEvent) => {
    if (cardState.isDragging) {
      handleDragMove(e.clientX, e.clientY)
    }
  }

  const onMouseUp = () => {
    if (cardState.isDragging) {
      handleDragEnd()
    }
  }

  const onMouseLeave = () => {
    if (cardState.isDragging) {
      handleDragEnd()
    }
  }

  // Touch events
  const onTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    handleDragStart(touch.clientX, touch.clientY)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    if (cardState.isDragging) {
      const touch = e.touches[0]
      handleDragMove(touch.clientX, touch.clientY)
    }
  }

  const onTouchEnd = () => {
    if (cardState.isDragging) {
      handleDragEnd()
    }
  }

  // No more profiles
  if (!currentNPC || !currentProfile) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="text-6xl mb-4">{site.theme.matchCelebrationEmoji}</div>
        <h2 className="text-xl font-bold mb-2" style={{ color: site.theme.primaryColor }}>
          You've seen everyone!
        </h2>
        <p className="text-gray-500 max-w-xs">
          Check back later for new people or adjust your preferences to see more profiles.
        </p>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 flex flex-col relative overflow-hidden"
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
    >
      {/* Card Stack */}
      <div className="flex-1 relative mx-4 my-4">
        {/* Next card (behind) */}
        {nextNPC && nextProfile && (
          <DatingCard
            npc={nextNPC}
            datingProfile={nextProfile}
            site={site}
            variant="swipe"
            showActions={false}
            isStacked
            stackIndex={1}
          />
        )}

        {/* Current card */}
        <div
          className="absolute inset-0"
          style={{
            transform: `translateX(${cardState.x}px) translateY(${cardState.y}px) rotate(${cardState.rotation}deg)`,
            transition: cardState.isDragging ? 'none' : 'transform 0.3s ease',
            cursor: cardState.isDragging ? 'grabbing' : 'grab',
          }}
          onMouseDown={onMouseDown}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <DatingCard
            npc={currentNPC}
            datingProfile={currentProfile}
            site={site}
            variant="swipe"
            onLike={handleLike}
            onPass={handlePass}
            onSuperLike={site.features.superLikes ? handleSuperLike : undefined}
            onViewProfile={() => onViewProfile?.(currentNPC.id)}
            showActions={true}
          />

          {/* LIKE indicator */}
          <div
            className="absolute top-8 left-8 px-4 py-2 rounded border-4 text-2xl font-bold transform -rotate-12 transition-opacity"
            style={{
              borderColor: '#00ff00',
              color: '#00ff00',
              opacity: showLikeIndicator === 'like' ? 1 : 0,
            }}
          >
            LIKE
          </div>

          {/* NOPE indicator */}
          <div
            className="absolute top-8 right-8 px-4 py-2 rounded border-4 text-2xl font-bold transform rotate-12 transition-opacity"
            style={{
              borderColor: '#ff4458',
              color: '#ff4458',
              opacity: showLikeIndicator === 'pass' ? 1 : 0,
            }}
          >
            NOPE
          </div>
        </div>
      </div>

      {/* Bottom action bar (mobile) */}
      <div className="px-4 pb-4 flex justify-center items-center gap-6">
        {/* Undo button (if feature enabled) */}
        {site.features.rewindLastSwipe && (
          <button
            className="w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-lg"
            style={{
              background: 'white',
              border: '2px solid #ffb800',
              color: '#ffb800',
            }}
          >
            ↩️
          </button>
        )}

        {/* Pass */}
        <button
          onClick={handlePass}
          className="w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-lg transition-transform hover:scale-110 active:scale-95"
          style={{
            background: 'white',
            border: '2px solid #ff4458',
            color: '#ff4458',
          }}
        >
          ✕
        </button>

        {/* Super Like */}
        {site.features.superLikes && (
          <button
            onClick={handleSuperLike}
            className="w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-lg transition-transform hover:scale-110 active:scale-95"
            style={{
              background: 'white',
              border: '2px solid #00d4ff',
              color: '#00d4ff',
            }}
          >
            ⭐
          </button>
        )}

        {/* Like */}
        <button
          onClick={handleLike}
          className="w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-lg transition-transform hover:scale-110 active:scale-95"
          style={{
            background: 'white',
            border: `2px solid ${site.theme.primaryColor}`,
            color: site.theme.primaryColor,
          }}
        >
          ❤️
        </button>

        {/* Boost (if feature enabled) */}
        {site.features.boostProfile && (
          <button
            className="w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-lg"
            style={{
              background: 'white',
              border: '2px solid #a358df',
              color: '#a358df',
            }}
          >
            ⚡
          </button>
        )}
      </div>
    </div>
  )
}

export default SwipeInterface
