/**
 * InstaSnap Profile
 *
 * Instagram-style profile page with grid layout.
 */

import { useState } from 'react'
import { useSocialStore, type Post } from '../../../../stores/socialStore.js'
import { useInstaSnapStore } from '../../../../stores/instaSnapStore.js'
import { INSTASNAP_THEME } from '../InstaSnapSite.js'

interface InstaSnapProfileProps {
  profileId: string
  onBack: () => void
  onViewProfile: (profileId: string) => void
  onViewPost: (postId: string) => void
}

type ProfileTab = 'posts' | 'reels' | 'saved' | 'tagged'

export function InstaSnapProfile({ profileId, onBack, onViewProfile, onViewPost }: InstaSnapProfileProps) {
  const [activeTab, setActiveTab] = useState<ProfileTab>('posts')

  const { getProfile, getPostsByAuthor, profiles } = useSocialStore()
  const { getStoriesByAuthor, getSavedPosts } = useInstaSnapStore()

  const profile = getProfile(profileId)
  const posts = getPostsByAuthor(profileId)
  const stories = getStoriesByAuthor(profileId)
  const savedPosts = getSavedPosts()

  const isOwnProfile = profileId === 'player'

  // Get follower counts (mock data for now)
  const stats = {
    posts: posts.length,
    followers: Math.floor(Math.random() * 5000) + 100,
    following: Math.floor(Math.random() * 500) + 50,
  }

  if (!profile) {
    return (
      <div className="p-8 text-center">
        <p style={{ color: INSTASNAP_THEME.textMuted }}>Profile not found</p>
        <button
          onClick={onBack}
          className="mt-4 text-sm"
          style={{ color: INSTASNAP_THEME.primary }}
        >
          Go back
        </button>
      </div>
    )
  }

  return (
    <div style={{ background: INSTASNAP_THEME.cardBg }}>
      {/* Profile Header */}
      <header className="px-4 py-4">
        {/* Username row with back button */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="text-xl"
            style={{ color: INSTASNAP_THEME.text }}
          >
            ←
          </button>
          <h1
            className="text-lg font-semibold"
            style={{ color: INSTASNAP_THEME.text }}
          >
            {profile.username}
          </h1>
          <button style={{ color: INSTASNAP_THEME.text }}>•••</button>
        </div>

        {/* Profile info */}
        <div className="flex gap-6">
          {/* Avatar */}
          <div className="shrink-0">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-3xl"
              style={{
                background: stories.length > 0 ? INSTASNAP_THEME.gradient : INSTASNAP_THEME.border,
                padding: '3px',
              }}
            >
              <div
                className="w-full h-full rounded-full flex items-center justify-center"
                style={{ background: INSTASNAP_THEME.cardBg }}
              >
                {profile.avatar || profile.name[0]}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex-1 flex items-center justify-around">
            <StatItem value={stats.posts} label="Posts" />
            <StatItem value={stats.followers} label="Followers" />
            <StatItem value={stats.following} label="Following" />
          </div>
        </div>

        {/* Bio */}
        <div className="mt-4">
          <p
            className="font-semibold text-sm"
            style={{ color: INSTASNAP_THEME.text }}
          >
            {profile.name}
          </p>
          {profile.bio && (
            <p
              className="text-sm mt-1"
              style={{ color: INSTASNAP_THEME.text }}
            >
              {profile.bio}
            </p>
          )}
          {profile.location && (
            <p
              className="text-sm mt-1"
              style={{ color: INSTASNAP_THEME.textMuted }}
            >
              📍 {profile.location}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-4">
          {isOwnProfile ? (
            <>
              <button
                className="flex-1 py-1.5 rounded-lg text-sm font-semibold border"
                style={{
                  color: INSTASNAP_THEME.text,
                  borderColor: INSTASNAP_THEME.border,
                }}
              >
                Edit Profile
              </button>
              <button
                className="flex-1 py-1.5 rounded-lg text-sm font-semibold border"
                style={{
                  color: INSTASNAP_THEME.text,
                  borderColor: INSTASNAP_THEME.border,
                }}
              >
                Share Profile
              </button>
            </>
          ) : (
            <>
              <button
                className="flex-1 py-1.5 rounded-lg text-sm font-semibold text-white"
                style={{ background: INSTASNAP_THEME.primary }}
              >
                Follow
              </button>
              <button
                className="flex-1 py-1.5 rounded-lg text-sm font-semibold border"
                style={{
                  color: INSTASNAP_THEME.text,
                  borderColor: INSTASNAP_THEME.border,
                }}
              >
                Message
              </button>
            </>
          )}
        </div>

        {/* Story Highlights (placeholder) */}
        {isOwnProfile && (
          <div className="flex gap-4 mt-4 overflow-x-auto pb-2">
            <div className="flex flex-col items-center shrink-0">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center border-2 border-dashed"
                style={{ borderColor: INSTASNAP_THEME.border }}
              >
                <span className="text-2xl" style={{ color: INSTASNAP_THEME.textMuted }}>+</span>
              </div>
              <span
                className="text-[11px] mt-1"
                style={{ color: INSTASNAP_THEME.text }}
              >
                New
              </span>
            </div>
          </div>
        )}
      </header>

      {/* Tabs */}
      <div
        className="flex border-t"
        style={{ borderColor: INSTASNAP_THEME.border }}
      >
        <TabButton
          icon="🔲"
          active={activeTab === 'posts'}
          onClick={() => setActiveTab('posts')}
        />
        <TabButton
          icon="🎬"
          active={activeTab === 'reels'}
          onClick={() => setActiveTab('reels')}
        />
        {isOwnProfile && (
          <TabButton
            icon="🔖"
            active={activeTab === 'saved'}
            onClick={() => setActiveTab('saved')}
          />
        )}
        <TabButton
          icon="👤"
          active={activeTab === 'tagged'}
          onClick={() => setActiveTab('tagged')}
        />
      </div>

      {/* Content */}
      <div className="min-h-[200px]">
        {activeTab === 'posts' && (
          <PostGrid posts={posts} onViewPost={onViewPost} />
        )}

        {activeTab === 'reels' && (
          <EmptyState icon="🎬" message="No reels yet" />
        )}

        {activeTab === 'saved' && isOwnProfile && (
          savedPosts.length > 0 ? (
            <SavedPostsGrid savedPosts={savedPosts} onViewPost={onViewPost} />
          ) : (
            <EmptyState icon="🔖" message="No saved posts yet" />
          )
        )}

        {activeTab === 'tagged' && (
          <EmptyState icon="👤" message="No tagged posts" />
        )}
      </div>
    </div>
  )
}

// ============================================================================
// Sub-components
// ============================================================================

interface StatItemProps {
  value: number
  label: string
}

function StatItem({ value, label }: StatItemProps) {
  const formatNumber = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
    return n.toString()
  }

  return (
    <div className="text-center">
      <p
        className="font-semibold text-lg"
        style={{ color: INSTASNAP_THEME.text }}
      >
        {formatNumber(value)}
      </p>
      <p
        className="text-sm"
        style={{ color: INSTASNAP_THEME.text }}
      >
        {label}
      </p>
    </div>
  )
}

interface TabButtonProps {
  icon: string
  active: boolean
  onClick: () => void
}

function TabButton({ icon, active, onClick }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-3 text-center transition-opacity ${
        active ? 'opacity-100' : 'opacity-50'
      }`}
      style={{
        borderBottom: active ? `1px solid ${INSTASNAP_THEME.text}` : 'none',
      }}
    >
      <span className="text-xl">{icon}</span>
    </button>
  )
}

interface PostGridProps {
  posts: Post[]
  onViewPost: (postId: string) => void
}

function PostGrid({ posts, onViewPost }: PostGridProps) {
  if (posts.length === 0) {
    return <EmptyState icon="📷" message="No posts yet" />
  }

  return (
    <div className="grid grid-cols-3 gap-[2px]">
      {posts.map(post => (
        <button
          key={post.id}
          onClick={() => onViewPost(post.id)}
          className="aspect-square relative group"
        >
          <img
            src={post.images?.[0] || `https://picsum.photos/seed/${post.id}/300/300`}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
          />
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white font-semibold">
            <span>❤️ {post.likes.length}</span>
            <span>💬 {post.comments.length}</span>
          </div>
          {/* Multiple images indicator */}
          {post.images && post.images.length > 1 && (
            <div className="absolute top-2 right-2 text-white drop-shadow-lg">
              📑
            </div>
          )}
        </button>
      ))}
    </div>
  )
}

interface SavedPostsGridProps {
  savedPosts: { postId: string }[]
  onViewPost: (postId: string) => void
}

function SavedPostsGrid({ savedPosts, onViewPost }: SavedPostsGridProps) {
  return (
    <div className="grid grid-cols-3 gap-[2px]">
      {savedPosts.map(saved => (
        <button
          key={saved.postId}
          onClick={() => onViewPost(saved.postId)}
          className="aspect-square relative group"
        >
          <img
            src={`https://picsum.photos/seed/${saved.postId}/300/300`}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="text-white text-2xl">🔖</span>
          </div>
        </button>
      ))}
    </div>
  )
}

interface EmptyStateProps {
  icon: string
  message: string
}

function EmptyState({ icon, message }: EmptyStateProps) {
  return (
    <div className="py-12 text-center">
      <div className="text-5xl mb-3">{icon}</div>
      <p style={{ color: INSTASNAP_THEME.textMuted }}>{message}</p>
    </div>
  )
}

export default InstaSnapProfile
