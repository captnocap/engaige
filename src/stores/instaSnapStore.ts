/**
 * InstaSnap Store
 *
 * Manages InstaSnap-specific features: stories, saved posts, hashtags.
 * Works alongside socialStore for posts/likes/comments.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { SocialProfile } from './socialStore.js'

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

  // Mock data initialization
  initialize: () => void
}

// ============================================================================
// Mock Data
// ============================================================================

const MOCK_PROFILES: Record<string, SocialProfile> = {
  'npc_sarah': {
    id: 'npc_sarah',
    name: 'Sarah',
    username: 'sarah.bear',
    avatar: '👧',
  },
  'npc_jake': {
    id: 'npc_jake',
    name: 'Jake',
    username: 'jake_the_snake',
    avatar: '🧑',
  },
  'npc_emily': {
    id: 'npc_emily',
    name: 'Emily',
    username: 'emily.melody',
    avatar: '👩',
  },
  'npc_luna': {
    id: 'npc_luna',
    name: 'Luna',
    username: 'lunastardust',
    avatar: '🌙',
  },
  'npc_alex': {
    id: 'npc_alex',
    name: 'Alex',
    username: 'alex.wonders',
    avatar: '🧑‍🎤',
  },
}

const createMockStories = (): InstaSnapStory[] => {
  const now = Date.now()
  const HOUR = 60 * 60 * 1000
  const DAY = 24 * HOUR

  return [
    {
      id: 'story_1',
      authorId: 'npc_sarah',
      authorType: 'npc',
      author: MOCK_PROFILES['npc_sarah'],
      mediaUrl: 'https://picsum.photos/seed/sarah1/400/700',
      mediaType: 'image',
      caption: 'golden hour vibes ✨',
      createdAt: new Date(now - 2 * HOUR).toISOString(),
      expiresAt: new Date(now + 22 * HOUR).toISOString(),
      viewCount: 42,
      viewedBy: ['npc_jake', 'npc_emily'],
    },
    {
      id: 'story_2',
      authorId: 'npc_sarah',
      authorType: 'npc',
      author: MOCK_PROFILES['npc_sarah'],
      mediaUrl: 'https://picsum.photos/seed/sarah2/400/700',
      mediaType: 'image',
      caption: 'coffee break ☕',
      createdAt: new Date(now - 1 * HOUR).toISOString(),
      expiresAt: new Date(now + 23 * HOUR).toISOString(),
      viewCount: 28,
      viewedBy: ['npc_emily'],
    },
    {
      id: 'story_3',
      authorId: 'npc_luna',
      authorType: 'npc',
      author: MOCK_PROFILES['npc_luna'],
      mediaUrl: 'https://picsum.photos/seed/luna1/400/700',
      mediaType: 'image',
      caption: 'crystals charged under the full moon 🔮',
      createdAt: new Date(now - 5 * HOUR).toISOString(),
      expiresAt: new Date(now + 19 * HOUR).toISOString(),
      viewCount: 89,
      viewedBy: ['npc_sarah', 'npc_emily', 'npc_alex'],
    },
    {
      id: 'story_4',
      authorId: 'npc_jake',
      authorType: 'npc',
      author: MOCK_PROFILES['npc_jake'],
      mediaUrl: 'https://picsum.photos/seed/jake1/400/700',
      mediaType: 'image',
      caption: 'new trick landed 🛹',
      createdAt: new Date(now - 8 * HOUR).toISOString(),
      expiresAt: new Date(now + 16 * HOUR).toISOString(),
      viewCount: 156,
      viewedBy: ['npc_sarah', 'npc_mike'],
    },
    {
      id: 'story_5',
      authorId: 'npc_emily',
      authorType: 'npc',
      author: MOCK_PROFILES['npc_emily'],
      mediaUrl: 'https://picsum.photos/seed/emily1/400/700',
      mediaType: 'image',
      caption: 'studio session 🎵',
      createdAt: new Date(now - 3 * HOUR).toISOString(),
      expiresAt: new Date(now + 21 * HOUR).toISOString(),
      viewCount: 67,
      viewedBy: ['npc_sarah', 'npc_alex'],
    },
  ]
}

const MOCK_HASHTAGS: TrendingHashtag[] = [
  { tag: 'photography', usageCount: 234, trendingScore: 0.95 },
  { tag: 'sunset', usageCount: 189, trendingScore: 0.88 },
  { tag: 'foodie', usageCount: 167, trendingScore: 0.82 },
  { tag: 'travel', usageCount: 156, trendingScore: 0.79 },
  { tag: 'aesthetic', usageCount: 143, trendingScore: 0.75 },
  { tag: 'vibes', usageCount: 128, trendingScore: 0.71 },
  { tag: 'coffee', usageCount: 112, trendingScore: 0.68 },
  { tag: 'nature', usageCount: 98, trendingScore: 0.64 },
  { tag: 'music', usageCount: 87, trendingScore: 0.60 },
  { tag: 'art', usageCount: 76, trendingScore: 0.56 },
]

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

      initialize: () => {
        const { stories } = get()
        if (stories.length > 0) return // Already initialized

        set({
          stories: createMockStories(),
          trendingHashtags: MOCK_HASHTAGS,
        })
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
