/**
 * InstaSnap Store
 *
 * Manages InstaSnap-specific features: stories, saved posts, hashtags.
 * Works alongside socialStore for posts/likes/comments.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { SocialProfile } from './socialStore.js'
import { useWSStore } from './wsStore.js'
import { useNPCStore } from './npcStore.js'

// ============================================================================
// Types
// ============================================================================

export interface InstaSnapStory {
  id: string
  authorId: string
  authorType: 'player' | 'npc'
  author: SocialProfile
  mediaUrl: string
  mediaType: 'image' | 'video'
  caption?: string
  filterApplied?: string
  createdAt: string // ISO timestamp
  expiresAt: string // ISO timestamp
  viewCount: number
  viewedBy: string[] // viewer IDs
}

export interface SavedPost {
  id: string
  postId: string
  saverId: string
  savedAt: string // ISO timestamp
  collectionName: string
}

export interface TrendingHashtag {
  tag: string
  usageCount: number
  trendingScore: number
}

// ============================================================================
// Store Interface
// ============================================================================

interface InstaSnapState {
  // Data
  stories: InstaSnapStory[]
  savedPosts: SavedPost[]
  trendingHashtags: TrendingHashtag[]
  viewedStoryIds: string[] // Stories the player has viewed

  // Actions - Stories
  addStory: (story: Omit<InstaSnapStory, 'id' | 'viewCount' | 'viewedBy'>) => InstaSnapStory
  markStoryViewed: (storyId: string, viewerId?: string) => void
  getActiveStories: () => InstaSnapStory[]
  getStoriesByAuthor: (authorId: string) => InstaSnapStory[]
  cleanExpiredStories: () => void
  hasViewedStory: (storyId: string) => boolean

  // Actions - Saved Posts
  savePost: (postId: string, collection?: string) => void
  unsavePost: (postId: string) => void
  isPostSaved: (postId: string) => boolean
  getSavedPosts: (collection?: string) => SavedPost[]
  getCollections: () => string[]

  // Actions - Hashtags
  addHashtagUsage: (tag: string) => void
  getTrendingHashtags: (limit?: number) => TrendingHashtag[]
  searchByHashtag: (tag: string) => string[] // Returns post IDs

  // Server data initialization
  initialize: () => Promise<void>
}

// ============================================================================
// Helpers
// ============================================================================

/** Map a server story to the client InstaSnapStory shape */
function serverToClientStory(s: any): InstaSnapStory {
  const npc = useNPCStore.getState().getNPC(s.author_id)
  const author: SocialProfile = npc
    ? { id: npc.id, name: npc.name, username: npc.username, avatar: npc.avatar }
    : { id: s.author_id, name: s.author_id, username: s.author_id, avatar: '\u{1F464}' }

  return {
    id: s.id,
    authorId: s.author_id,
    authorType: s.author_type || 'npc',
    author,
    mediaUrl: s.media_url,
    mediaType: s.media_type || 'image',
    caption: s.caption || undefined,
    filterApplied: s.filter_applied || undefined,
    createdAt: typeof s.created_at === 'number'
      ? new Date(s.created_at * 1000).toISOString()
      : s.created_at,
    expiresAt: typeof s.expires_at === 'number'
      ? new Date(s.expires_at * 1000).toISOString()
      : s.expires_at,
    viewCount: s.view_count || 0,
    viewedBy: [],
  }
}

// ============================================================================
// Store Implementation
// ============================================================================

export const useInstaSnapStore = create<InstaSnapState>()(
  persist(
    (set, get) => ({
      stories: [],
      savedPosts: [],
      trendingHashtags: [],
      viewedStoryIds: [],

      initialize: async () => {
        const { stories } = get()
        if (stories.length > 0) return // Already populated

        try {
          const { request, connected } = useWSStore.getState()
          if (!connected) return

          const result = await request<any, { stories: any[] }>('instasnap:getStories', {})
          if (result?.stories && result.stories.length > 0) {
            set({ stories: result.stories.map(serverToClientStory) })
          }
        } catch (err) {
          console.warn('[InstaSnap] Server fetch failed, store will remain empty:', err)
        }
      },

      // ========================================================================
      // Stories
      // ========================================================================

      addStory: (storyData) => {
        const newStory: InstaSnapStory = {
          ...storyData,
          id: `story_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          viewCount: 0,
          viewedBy: [],
        }

        set(state => ({
          stories: [newStory, ...state.stories],
        }))

        return newStory
      },

      markStoryViewed: (storyId: string, viewerId: string = 'player') => {
        set(state => {
          const updatedStories = state.stories.map(story => {
            if (story.id !== storyId) return story
            if (story.viewedBy.includes(viewerId)) return story

            return {
              ...story,
              viewCount: story.viewCount + 1,
              viewedBy: [...story.viewedBy, viewerId],
            }
          })

          const updatedViewedIds = viewerId === 'player' && !state.viewedStoryIds.includes(storyId)
            ? [...state.viewedStoryIds, storyId]
            : state.viewedStoryIds

          return {
            stories: updatedStories,
            viewedStoryIds: updatedViewedIds,
          }
        })
      },

      getActiveStories: () => {
        const now = new Date()
        return get().stories.filter(story => new Date(story.expiresAt) > now)
      },

      getStoriesByAuthor: (authorId: string) => {
        const now = new Date()
        return get().stories.filter(
          story => story.authorId === authorId && new Date(story.expiresAt) > now
        )
      },

      cleanExpiredStories: () => {
        const now = new Date()
        set(state => ({
          stories: state.stories.filter(story => new Date(story.expiresAt) > now),
        }))
      },

      hasViewedStory: (storyId: string) => {
        return get().viewedStoryIds.includes(storyId)
      },

      // ========================================================================
      // Saved Posts
      // ========================================================================

      savePost: (postId: string, collection: string = 'All Posts') => {
        const { savedPosts } = get()
        if (savedPosts.some(sp => sp.postId === postId)) return

        const newSaved: SavedPost = {
          id: `saved_${Date.now()}`,
          postId,
          saverId: 'player',
          savedAt: new Date().toISOString(),
          collectionName: collection,
        }

        set(state => ({
          savedPosts: [...state.savedPosts, newSaved],
        }))
      },

      unsavePost: (postId: string) => {
        set(state => ({
          savedPosts: state.savedPosts.filter(sp => sp.postId !== postId),
        }))
      },

      isPostSaved: (postId: string) => {
        return get().savedPosts.some(sp => sp.postId === postId)
      },

      getSavedPosts: (collection?: string) => {
        const { savedPosts } = get()
        return collection
          ? savedPosts.filter(sp => sp.collectionName === collection)
          : savedPosts
      },

      getCollections: () => {
        const { savedPosts } = get()
        const collections = new Set(savedPosts.map(sp => sp.collectionName))
        return Array.from(collections)
      },

      // ========================================================================
      // Hashtags
      // ========================================================================

      addHashtagUsage: (tag: string) => {
        const normalizedTag = tag.toLowerCase().replace(/^#/, '')

        set(state => {
          const existing = state.trendingHashtags.find(h => h.tag === normalizedTag)
          if (existing) {
            return {
              trendingHashtags: state.trendingHashtags.map(h =>
                h.tag === normalizedTag
                  ? { ...h, usageCount: h.usageCount + 1, trendingScore: Math.min(1, h.trendingScore + 0.01) }
                  : h
              ),
            }
          }

          return {
            trendingHashtags: [
              ...state.trendingHashtags,
              { tag: normalizedTag, usageCount: 1, trendingScore: 0.1 },
            ],
          }
        })
      },

      getTrendingHashtags: (limit: number = 10) => {
        return get().trendingHashtags
          .sort((a, b) => b.trendingScore - a.trendingScore)
          .slice(0, limit)
      },

      searchByHashtag: (_tag: string) => {
        // This would search posts - for now return empty
        // In production, this would query socialStore posts that contain the hashtag
        return []
      },
    }),
    {
      name: 'engaige-instasnap',
      version: 2,
      migrate: () => ({ stories: [], savedPosts: [], trendingHashtags: [], viewedStoryIds: [] }),
      partialize: (state) => ({
        stories: state.stories,
        savedPosts: state.savedPosts,
        trendingHashtags: state.trendingHashtags,
        viewedStoryIds: state.viewedStoryIds,
      }),
    }
  )
)

// ============================================================================
// Selector Hooks
// ============================================================================

export const useActiveStories = () => {
  const getActiveStories = useInstaSnapStore(state => state.getActiveStories)
  return getActiveStories()
}

export const useStoriesByAuthor = (authorId: string) => {
  const getStoriesByAuthor = useInstaSnapStore(state => state.getStoriesByAuthor)
  return getStoriesByAuthor(authorId)
}

export const useTrendingHashtags = (limit?: number) => {
  const getTrendingHashtags = useInstaSnapStore(state => state.getTrendingHashtags)
  return getTrendingHashtags(limit)
}

export const useIsPostSaved = (postId: string) => {
  return useInstaSnapStore(state => state.isPostSaved(postId))
}
