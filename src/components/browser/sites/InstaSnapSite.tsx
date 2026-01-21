/**
 * InstaSnap Site
 *
 * Instagram-style photo-focused social platform.
 * Features: feed, stories, profiles, explore, and photo posts.
 */

import { useState, useEffect } from 'react'
import type { SiteProps } from '../BrowserSiteContainer.js'
import { useSocialStore, usePlayerProfile } from '../../../stores/socialStore.js'
import { useInstaSnapStore } from '../../../stores/instaSnapStore.js'
import { InstaSnapFeed } from './instasnap/InstaSnapFeed.js'
import { InstaSnapExplore } from './instasnap/InstaSnapExplore.js'
import { InstaSnapProfile } from './instasnap/InstaSnapProfile.js'
import { InstaSnapStoryViewer } from './instasnap/InstaSnapStoryViewer.js'
import { InstaSnapPostModal } from './instasnap/InstaSnapPostModal.js'

// InstaSnap Theme Colors
export const INSTASNAP_THEME = {
  primary: '#E1306C',      // Instagram pink
  secondary: '#F77737',    // Orange
  accent: '#FCAF45',       // Yellow
  purple: '#833AB4',
  background: '#FAFAFA',
  cardBg: '#FFFFFF',
  text: '#262626',
  textMuted: '#8E8E8E',
  border: '#DBDBDB',
  heart: '#ED4956',
  gradient: 'linear-gradient(45deg, #405DE6, #5851DB, #833AB4, #C13584, #E1306C, #FD1D1D, #F56040, #F77737, #FCAF45)',
}

export type InstaSnapView = 'feed' | 'explore' | 'profile' | 'notifications' | 'create'

export function InstaSnapSite({ siteId }: SiteProps) {
  const [currentView, setCurrentView] = useState<InstaSnapView>('feed')
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null)
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null)
  const [viewingStoryAuthorId, setViewingStoryAuthorId] = useState<string | null>(null)

  const playerProfile = usePlayerProfile()
  const { initialize: initSocial } = useSocialStore()
  const { initialize: initInstaSnap } = useInstaSnapStore()

  useEffect(() => {
    initSocial()
    initInstaSnap()
  }, [initSocial, initInstaSnap])

  const handleViewProfile = (profileId: string) => {
    setSelectedProfileId(profileId)
    setCurrentView('profile')
  }

  const handleViewPost = (postId: string) => {
    setSelectedPostId(postId)
  }

  const handleViewStory = (authorId: string) => {
    setViewingStoryAuthorId(authorId)
  }

  const handleClosePost = () => {
    setSelectedPostId(null)
  }

  const handleCloseStory = () => {
    setViewingStoryAuthorId(null)
  }

  return (
    <div
      className="min-h-full"
      style={{ background: INSTASNAP_THEME.background }}
    >
      {/* InstaSnap Header */}
      <header
        className="sticky top-0 z-20 px-4 py-3 border-b"
        style={{
          background: INSTASNAP_THEME.cardBg,
          borderColor: INSTASNAP_THEME.border,
        }}
      >
        <div className="max-w-xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => {
              setCurrentView('feed')
              setSelectedProfileId(null)
            }}
            className="flex items-center gap-1"
          >
            <span
              className="text-2xl font-bold italic"
              style={{
                fontFamily: 'Georgia, serif',
                color: INSTASNAP_THEME.text,
              }}
            >
              InstaSnap
            </span>
          </button>

          {/* Navigation Icons */}
          <nav className="flex items-center gap-4">
            <NavButton
              icon="🏠"
              active={currentView === 'feed'}
              onClick={() => {
                setCurrentView('feed')
                setSelectedProfileId(null)
              }}
            />
            <NavButton
              icon="🔍"
              active={currentView === 'explore'}
              onClick={() => {
                setCurrentView('explore')
                setSelectedProfileId(null)
              }}
            />
            <NavButton
              icon="➕"
              active={currentView === 'create'}
              onClick={() => setCurrentView('create')}
              gradient
            />
            <NavButton
              icon="❤️"
              active={currentView === 'notifications'}
              onClick={() => setCurrentView('notifications')}
              badge={3}
            />
            <button
              onClick={() => handleViewProfile('player')}
              className={`w-7 h-7 rounded-full flex items-center justify-center text-sm border-2 transition-all ${
                currentView === 'profile' && selectedProfileId === 'player'
                  ? 'border-pink-500'
                  : 'border-transparent'
              }`}
              style={{ background: INSTASNAP_THEME.border }}
            >
              {playerProfile.avatar || playerProfile.name[0]}
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-xl mx-auto pb-20">
        {currentView === 'feed' && (
          <InstaSnapFeed
            onViewProfile={handleViewProfile}
            onViewPost={handleViewPost}
            onViewStory={handleViewStory}
          />
        )}

        {currentView === 'explore' && (
          <InstaSnapExplore
            onViewProfile={handleViewProfile}
            onViewPost={handleViewPost}
          />
        )}

        {currentView === 'profile' && selectedProfileId && (
          <InstaSnapProfile
            profileId={selectedProfileId}
            onBack={() => setCurrentView('feed')}
            onViewProfile={handleViewProfile}
            onViewPost={handleViewPost}
          />
        )}

        {currentView === 'notifications' && (
          <NotificationsPlaceholder />
        )}

        {currentView === 'create' && (
          <CreatePostPlaceholder onBack={() => setCurrentView('feed')} />
        )}
      </main>

      {/* Post Modal */}
      {selectedPostId && (
        <InstaSnapPostModal
          postId={selectedPostId}
          onClose={handleClosePost}
          onViewProfile={handleViewProfile}
        />
      )}

      {/* Story Viewer */}
      {viewingStoryAuthorId && (
        <InstaSnapStoryViewer
          authorId={viewingStoryAuthorId}
          onClose={handleCloseStory}
          onViewProfile={handleViewProfile}
        />
      )}
    </div>
  )
}

// ============================================================================
// Navigation Button
// ============================================================================

interface NavButtonProps {
  icon: string
  active: boolean
  onClick: () => void
  badge?: number
  gradient?: boolean
}

function NavButton({ icon, active, onClick, badge, gradient }: NavButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`relative w-7 h-7 flex items-center justify-center rounded-lg transition-all ${
        active ? 'scale-110' : 'hover:scale-105'
      }`}
      style={gradient ? {
        background: INSTASNAP_THEME.gradient,
        color: 'white',
      } : undefined}
    >
      <span className={active ? 'text-lg' : 'text-base grayscale-0'}>{icon}</span>
      {badge && badge > 0 && (
        <span
          className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center text-white"
          style={{ background: INSTASNAP_THEME.heart }}
        >
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </button>
  )
}

// ============================================================================
// Placeholder Components
// ============================================================================

function NotificationsPlaceholder() {
  return (
    <div className="p-8 text-center">
      <div className="text-6xl mb-4">❤️</div>
      <h2 className="text-lg font-semibold mb-2" style={{ color: INSTASNAP_THEME.text }}>
        Activity
      </h2>
      <p style={{ color: INSTASNAP_THEME.textMuted }}>
        When someone likes or comments on your posts, you'll see it here.
      </p>
    </div>
  )
}

function CreatePostPlaceholder({ onBack }: { onBack: () => void }) {
  return (
    <div className="p-8 text-center">
      <div className="text-6xl mb-4">📸</div>
      <h2 className="text-lg font-semibold mb-2" style={{ color: INSTASNAP_THEME.text }}>
        Create New Post
      </h2>
      <p className="mb-4" style={{ color: INSTASNAP_THEME.textMuted }}>
        Share a photo or video with your followers
      </p>
      <button
        onClick={onBack}
        className="px-4 py-2 rounded-lg text-sm font-medium text-white"
        style={{ background: INSTASNAP_THEME.primary }}
      >
        Back to Feed
      </button>
    </div>
  )
}

export default InstaSnapSite
