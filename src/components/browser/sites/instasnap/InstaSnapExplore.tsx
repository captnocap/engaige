/**
 * InstaSnap Explore
 *
 * Discovery page with search, trending hashtags, and content grid.
 */

import { useState } from 'react'
import { usePosts, useSocialStore } from '../../../../stores/socialStore.js'
import { useInstaSnapStore } from '../../../../stores/instaSnapStore.js'
import { INSTASNAP_THEME } from '../InstaSnapSite.js'

interface InstaSnapExploreProps {
  onViewProfile: (profileId: string) => void
  onViewPost: (postId: string) => void
}

type ExploreTab = 'forYou' | 'accounts' | 'tags' | 'places'

export function InstaSnapExplore({ onViewProfile, onViewPost }: InstaSnapExploreProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<ExploreTab>('forYou')
  const [isSearchFocused, setIsSearchFocused] = useState(false)

  const { getTrendingHashtags } = useInstaSnapStore()
  const { profiles } = useSocialStore()
  const posts = usePosts()
  const trendingHashtags = getTrendingHashtags(20)

  // Filter content based on search
  const filteredProfiles = searchQuery
    ? Object.values(profiles).filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.username.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : []

  const filteredHashtags = searchQuery
    ? trendingHashtags.filter(h =>
        h.tag.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : trendingHashtags

  // Show search results or explore grid
  const showSearchResults = isSearchFocused && searchQuery.length > 0

  return (
    <div style={{ background: INSTASNAP_THEME.cardBg }}>
      {/* Search Bar */}
      <div className="sticky top-0 z-10 p-3" style={{ background: INSTASNAP_THEME.cardBg }}>
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-lg"
          style={{ background: INSTASNAP_THEME.background }}
        >
          <span style={{ color: INSTASNAP_THEME.textMuted }}>🔍</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            placeholder="Search"
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: INSTASNAP_THEME.text }}
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('')
                setIsSearchFocused(false)
              }}
              style={{ color: INSTASNAP_THEME.textMuted }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Search Results or Explore Content */}
      {showSearchResults ? (
        <SearchResults
          query={searchQuery}
          profiles={filteredProfiles}
          hashtags={filteredHashtags}
          onViewProfile={onViewProfile}
          onSelectHashtag={(tag) => {
            setSearchQuery(`#${tag}`)
          }}
          onClose={() => {
            setSearchQuery('')
            setIsSearchFocused(false)
          }}
        />
      ) : (
        <>
          {/* Category Tabs */}
          <div className="flex gap-2 px-3 pb-3 overflow-x-auto">
            <CategoryPill
              label="For You"
              active={activeTab === 'forYou'}
              onClick={() => setActiveTab('forYou')}
            />
            <CategoryPill
              label="Accounts"
              active={activeTab === 'accounts'}
              onClick={() => setActiveTab('accounts')}
            />
            <CategoryPill
              label="Tags"
              active={activeTab === 'tags'}
              onClick={() => setActiveTab('tags')}
            />
            <CategoryPill
              label="Places"
              active={activeTab === 'places'}
              onClick={() => setActiveTab('places')}
            />
          </div>

          {/* Content Grid */}
          {activeTab === 'forYou' && (
            <ExploreGrid posts={posts} onViewPost={onViewPost} />
          )}

          {activeTab === 'accounts' && (
            <SuggestedAccounts
              profiles={Object.values(profiles)}
              onViewProfile={onViewProfile}
            />
          )}

          {activeTab === 'tags' && (
            <TrendingTags
              hashtags={trendingHashtags}
              onSelectTag={(tag) => setSearchQuery(`#${tag}`)}
            />
          )}

          {activeTab === 'places' && (
            <div className="p-8 text-center">
              <span className="text-5xl mb-4 block">📍</span>
              <p style={{ color: INSTASNAP_THEME.textMuted }}>
                Places coming soon
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ============================================================================
// Sub-components
// ============================================================================

interface CategoryPillProps {
  label: string
  active: boolean
  onClick: () => void
}

function CategoryPill({ label, active, onClick }: CategoryPillProps) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
        active ? 'text-white' : ''
      }`}
      style={{
        background: active ? INSTASNAP_THEME.text : INSTASNAP_THEME.background,
        color: active ? 'white' : INSTASNAP_THEME.text,
      }}
    >
      {label}
    </button>
  )
}

interface SearchResultsProps {
  query: string
  profiles: { id: string; name: string; username: string; avatar?: string }[]
  hashtags: { tag: string; usageCount: number }[]
  onViewProfile: (id: string) => void
  onSelectHashtag: (tag: string) => void
  onClose: () => void
}

function SearchResults({
  query,
  profiles,
  hashtags,
  onViewProfile,
  onSelectHashtag,
  onClose,
}: SearchResultsProps) {
  return (
    <div className="divide-y" style={{ borderColor: INSTASNAP_THEME.border }}>
      {/* Back/Cancel */}
      <div className="px-3 py-2">
        <button
          onClick={onClose}
          className="text-sm"
          style={{ color: INSTASNAP_THEME.primary }}
        >
          Cancel
        </button>
      </div>

      {/* Accounts Section */}
      {profiles.length > 0 && (
        <div className="py-2">
          <p
            className="px-4 py-2 text-sm font-semibold"
            style={{ color: INSTASNAP_THEME.text }}
          >
            Accounts
          </p>
          {profiles.slice(0, 5).map(profile => (
            <button
              key={profile.id}
              onClick={() => onViewProfile(profile.id)}
              className="flex items-center gap-3 px-4 py-2 w-full hover:bg-gray-50 transition-colors"
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                style={{ background: INSTASNAP_THEME.background }}
              >
                {profile.avatar || profile.name[0]}
              </div>
              <div className="text-left">
                <p
                  className="text-sm font-medium"
                  style={{ color: INSTASNAP_THEME.text }}
                >
                  {profile.username}
                </p>
                <p
                  className="text-xs"
                  style={{ color: INSTASNAP_THEME.textMuted }}
                >
                  {profile.name}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Hashtags Section */}
      {hashtags.length > 0 && (
        <div className="py-2">
          <p
            className="px-4 py-2 text-sm font-semibold"
            style={{ color: INSTASNAP_THEME.text }}
          >
            Tags
          </p>
          {hashtags.slice(0, 5).map(hashtag => (
            <button
              key={hashtag.tag}
              onClick={() => onSelectHashtag(hashtag.tag)}
              className="flex items-center gap-3 px-4 py-2 w-full hover:bg-gray-50 transition-colors"
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-lg border"
                style={{ borderColor: INSTASNAP_THEME.border }}
              >
                #
              </div>
              <div className="text-left">
                <p
                  className="text-sm font-medium"
                  style={{ color: INSTASNAP_THEME.text }}
                >
                  #{hashtag.tag}
                </p>
                <p
                  className="text-xs"
                  style={{ color: INSTASNAP_THEME.textMuted }}
                >
                  {hashtag.usageCount.toLocaleString()} posts
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No Results */}
      {profiles.length === 0 && hashtags.length === 0 && (
        <div className="p-8 text-center">
          <span className="text-4xl mb-2 block">🔍</span>
          <p style={{ color: INSTASNAP_THEME.textMuted }}>
            No results found for "{query}"
          </p>
        </div>
      )}
    </div>
  )
}

interface ExploreGridProps {
  posts: { id: string; images?: string[]; likes: string[]; comments: { id: string }[] }[]
  onViewPost: (id: string) => void
}

function ExploreGrid({ posts, onViewPost }: ExploreGridProps) {
  // Create a mixed grid layout (Instagram explore style)
  const gridItems = posts.slice(0, 30)

  return (
    <div className="grid grid-cols-3 gap-[2px]">
      {gridItems.map((post, index) => {
        // Every 5th item (starting from 0) is a large item spanning 2 rows
        const isLarge = index % 5 === 0

        return (
          <button
            key={post.id}
            onClick={() => onViewPost(post.id)}
            className={`relative group ${isLarge ? 'row-span-2' : ''}`}
            style={{ aspectRatio: isLarge ? '1/2' : '1/1' }}
          >
            <img
              src={post.images?.[0] || `https://picsum.photos/seed/${post.id}/400/${isLarge ? 800 : 400}`}
              alt=""
              className="w-full h-full object-cover"
              loading="lazy"
            />
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white font-semibold text-sm">
              <span>❤️ {post.likes.length}</span>
              <span>💬 {post.comments.length}</span>
            </div>
            {/* Multi-image indicator */}
            {post.images && post.images.length > 1 && (
              <div className="absolute top-2 right-2 text-white drop-shadow-lg">
                📑
              </div>
            )}
          </button>
        )
      })}
    </div>
  )
}

interface SuggestedAccountsProps {
  profiles: { id: string; name: string; username: string; avatar?: string; bio?: string }[]
  onViewProfile: (id: string) => void
}

function SuggestedAccounts({ profiles, onViewProfile }: SuggestedAccountsProps) {
  return (
    <div className="divide-y" style={{ borderColor: INSTASNAP_THEME.border }}>
      <p
        className="px-4 py-3 text-sm font-semibold"
        style={{ color: INSTASNAP_THEME.text }}
      >
        Suggested for You
      </p>
      {profiles.map(profile => (
        <button
          key={profile.id}
          onClick={() => onViewProfile(profile.id)}
          className="flex items-center gap-3 px-4 py-3 w-full hover:bg-gray-50 transition-colors"
        >
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
            style={{ background: INSTASNAP_THEME.background }}
          >
            {profile.avatar || profile.name[0]}
          </div>
          <div className="flex-1 text-left min-w-0">
            <p
              className="text-sm font-medium"
              style={{ color: INSTASNAP_THEME.text }}
            >
              {profile.username}
            </p>
            <p
              className="text-xs truncate"
              style={{ color: INSTASNAP_THEME.textMuted }}
            >
              {profile.name}
            </p>
            {profile.bio && (
              <p
                className="text-xs truncate mt-0.5"
                style={{ color: INSTASNAP_THEME.textMuted }}
              >
                {profile.bio}
              </p>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation()
              // Follow action would go here
            }}
            className="px-4 py-1.5 rounded-lg text-sm font-semibold text-white"
            style={{ background: INSTASNAP_THEME.primary }}
          >
            Follow
          </button>
        </button>
      ))}
    </div>
  )
}

interface TrendingTagsProps {
  hashtags: { tag: string; usageCount: number; trendingScore: number }[]
  onSelectTag: (tag: string) => void
}

function TrendingTags({ hashtags, onSelectTag }: TrendingTagsProps) {
  return (
    <div className="divide-y" style={{ borderColor: INSTASNAP_THEME.border }}>
      <p
        className="px-4 py-3 text-sm font-semibold"
        style={{ color: INSTASNAP_THEME.text }}
      >
        Trending
      </p>
      {hashtags.map((hashtag, index) => (
        <button
          key={hashtag.tag}
          onClick={() => onSelectTag(hashtag.tag)}
          className="flex items-center gap-3 px-4 py-3 w-full hover:bg-gray-50 transition-colors"
        >
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center text-lg font-bold"
            style={{
              background: INSTASNAP_THEME.background,
              color: INSTASNAP_THEME.textMuted,
            }}
          >
            #{index + 1}
          </div>
          <div className="flex-1 text-left">
            <p
              className="text-sm font-medium"
              style={{ color: INSTASNAP_THEME.text }}
            >
              #{hashtag.tag}
            </p>
            <p
              className="text-xs"
              style={{ color: INSTASNAP_THEME.textMuted }}
            >
              {hashtag.usageCount.toLocaleString()} posts
            </p>
          </div>
          {hashtag.trendingScore > 0.8 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-pink-100 text-pink-600">
              Trending
            </span>
          )}
        </button>
      ))}
    </div>
  )
}

export default InstaSnapExplore
