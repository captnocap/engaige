/**
 * InstaSnap Story Viewer
 *
 * Fullscreen story viewing experience with progress bar and navigation.
 */

import { useState, useEffect, useCallback } from 'react'
import { useInstaSnapStore, type InstaSnapStory } from '../../../../stores/instaSnapStore.js'
import { INSTASNAP_THEME } from '../InstaSnapSite.js'

interface InstaSnapStoryViewerProps {
  authorId: string
  onClose: () => void
  onViewProfile: (profileId: string) => void
}

const STORY_DURATION = 5000 // 5 seconds per story

export function InstaSnapStoryViewer({ authorId, onClose, onViewProfile }: InstaSnapStoryViewerProps) {
  const { getStoriesByAuthor, markStoryViewed, getActiveStories } = useInstaSnapStore()

  // Get all active stories grouped by author for navigation
  const allActiveStories = getActiveStories()
  const authorIds = [...new Set(allActiveStories.map(s => s.authorId))]
  const currentAuthorIndex = authorIds.indexOf(authorId)

  // Get stories for current author
  const stories = getStoriesByAuthor(authorId)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const currentStory = stories[currentIndex]

  // Mark story as viewed when it becomes visible
  useEffect(() => {
    if (currentStory) {
      markStoryViewed(currentStory.id)
    }
  }, [currentStory?.id, markStoryViewed])

  // Progress timer
  useEffect(() => {
    if (isPaused || !currentStory) return

    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + (100 / (STORY_DURATION / 100))
        if (newProgress >= 100) {
          // Move to next story
          if (currentIndex < stories.length - 1) {
            setCurrentIndex(currentIndex + 1)
            return 0
          } else {
            // Move to next author or close
            if (currentAuthorIndex < authorIds.length - 1) {
              // This would need parent to handle switching authors
              onClose()
            } else {
              onClose()
            }
            return 100
          }
        }
        return newProgress
      })
    }, 100)

    return () => clearInterval(interval)
  }, [currentIndex, stories.length, isPaused, currentStory, currentAuthorIndex, authorIds.length, onClose])

  // Reset progress when story changes
  useEffect(() => {
    setProgress(0)
  }, [currentIndex])

  const goToPrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setProgress(0)
    } else if (currentAuthorIndex > 0) {
      // Go to previous author
      onClose()
    }
  }, [currentIndex, currentAuthorIndex, onClose])

  const goToNext = useCallback(() => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setProgress(0)
    } else if (currentAuthorIndex < authorIds.length - 1) {
      // Go to next author
      onClose()
    } else {
      onClose()
    }
  }, [currentIndex, stories.length, currentAuthorIndex, authorIds.length, onClose])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goToPrevious()
      if (e.key === 'ArrowRight') goToNext()
      if (e.key === 'Escape') onClose()
      if (e.key === ' ') {
        e.preventDefault()
        setIsPaused(prev => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [goToPrevious, goToNext, onClose])

  if (!currentStory) {
    return null
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0, 0, 0, 0.95)' }}
    >
      {/* Story Container */}
      <div
        className="relative w-full max-w-md h-full max-h-[90vh] mx-4"
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {/* Progress Bars */}
        <div className="absolute top-2 left-2 right-2 z-10 flex gap-1">
          {stories.map((story, index) => (
            <div
              key={story.id}
              className="flex-1 h-[2px] rounded overflow-hidden"
              style={{ background: 'rgba(255, 255, 255, 0.3)' }}
            >
              <div
                className="h-full transition-all"
                style={{
                  background: 'white',
                  width: index < currentIndex
                    ? '100%'
                    : index === currentIndex
                      ? `${progress}%`
                      : '0%',
                  transition: index === currentIndex ? 'width 0.1s linear' : 'none',
                }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-6 left-0 right-0 z-10 flex items-center justify-between px-3">
          <button
            onClick={() => onViewProfile(currentStory.authorId)}
            className="flex items-center gap-2"
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
              style={{ background: 'rgba(255, 255, 255, 0.2)' }}
            >
              {currentStory.author.avatar || currentStory.author.name[0]}
            </div>
            <div className="text-left">
              <p className="text-white text-sm font-medium">
                {currentStory.author.username}
              </p>
              <p className="text-white/60 text-xs">
                {formatTimeAgo(new Date(currentStory.createdAt))}
              </p>
            </div>
          </button>

          <div className="flex items-center gap-3">
            {isPaused && (
              <span className="text-white/60 text-xs">PAUSED</span>
            )}
            <button
              onClick={onClose}
              className="text-white text-2xl hover:opacity-80"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Story Content */}
        <div className="h-full rounded-lg overflow-hidden">
          <img
            src={currentStory.mediaUrl}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>

        {/* Caption */}
        {currentStory.caption && (
          <div className="absolute bottom-16 left-0 right-0 px-4">
            <p className="text-white text-center text-sm drop-shadow-lg">
              {currentStory.caption}
            </p>
          </div>
        )}

        {/* Navigation Areas */}
        <button
          className="absolute top-0 left-0 w-1/3 h-full cursor-pointer"
          onClick={goToPrevious}
          aria-label="Previous story"
        />
        <button
          className="absolute top-0 right-0 w-1/3 h-full cursor-pointer"
          onClick={goToNext}
          aria-label="Next story"
        />

        {/* Reply Input */}
        <div className="absolute bottom-4 left-4 right-4">
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-full"
            style={{ background: 'rgba(255, 255, 255, 0.1)' }}
          >
            <input
              type="text"
              placeholder="Send message..."
              className="flex-1 bg-transparent outline-none text-white text-sm placeholder-white/50"
            />
            <button className="text-lg">❤️</button>
            <button className="text-lg">📤</button>
          </div>
        </div>
      </div>

      {/* Close button (outside story) */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white/60 hover:text-white text-sm hidden md:block"
      >
        Press ESC to close
      </button>
    </div>
  )
}

// ============================================================================
// Helpers
// ============================================================================

function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor(diff / (1000 * 60))

  if (minutes < 60) return `${minutes}m`
  if (hours < 24) return `${hours}h`
  return '1d'
}

export default InstaSnapStoryViewer
