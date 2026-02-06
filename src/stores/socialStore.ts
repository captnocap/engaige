/**
 * Social Feed Store
 *
 * Manages social media posts, likes, comments for MyFace and other platforms.
 * All data is fetched from the server via WebSocket. The database is the single
 * source of truth -- if the server returns nothing, the store stays empty.
 */

import { create } from 'zustand'
import { useWSStore } from './wsStore.js'

// Types
export interface SocialProfile {
  id: string
  name: string
  username: string
  avatar?: string
  bio?: string
  mood?: string
  moodEmoji?: string
  location?: string
  interests?: string[]
  music?: string
  topFriends?: string[] // IDs of top 8 friends
  profileSong?: string
  backgroundColor?: string
  textColor?: string
  isOnline?: boolean
  lastSeen?: string
  relationshipLevel?: 'stranger' | 'acquaintance' | 'friend' | 'close_friend' | 'best_friend' | 'romantic'
}

/**
 * Tracks who has viewed a post - critical for drama awareness system.
 * NPCs and players only know about posts they've actually "seen".
 */
export interface PostView {
  viewerId: string        // 'player' or npcId
  viewedAt: string        // ISO timestamp
  platform: string        // Where they saw it (feed, profile, notification)
}

export interface Post {
  id: string
  authorId: string
  author: SocialProfile
  content: string
  images?: string[]
  timestamp: string
  likes: string[] // User IDs who liked
  comments: Comment[]
  shares: number
  platform: 'myface' | 'chirp' | 'instasnap'

  // Awareness tracking - who has actually seen this post
  seenBy: PostView[]
}

export interface Comment {
  id: string
  authorId: string
  author: SocialProfile
  content: string
  timestamp: string
  likes: string[]
}

interface SocialState {
  // Data
  profiles: Record<string, SocialProfile>
  posts: Post[]
  playerProfile: SocialProfile

  // UI State
  isLoading: boolean

  // Actions
  initialize: () => Promise<void>
  likePost: (postId: string) => void
  unlikePost: (postId: string) => void
  addComment: (postId: string, content: string) => void
  likeComment: (postId: string, commentId: string) => void
  createPost: (content: string, images?: string[]) => void
  getProfile: (profileId: string) => SocialProfile | undefined
  getPostsByAuthor: (authorId: string) => Post[]
  getFeed: (platform?: string) => Post[]

  // Awareness tracking
  markPostAsSeen: (postId: string, viewerId: string, viewPlatform?: string) => void
  hasSeenPost: (postId: string, viewerId: string) => boolean
  getPostsSeenBy: (viewerId: string) => Post[]
  getUnseenPosts: (viewerId: string, platform?: string) => Post[]

  // NPC Content Creation (for drama automation)
  createNPCPost: (npcId: string, content: string, platform?: 'myface' | 'chirp' | 'instasnap', images?: string[]) => Post | null
  addNPCComment: (postId: string, npcId: string, content: string) => void
  addNPCLike: (postId: string, npcId: string) => void
  removeNPCLike: (postId: string, npcId: string) => void
}

/**
 * Default player profile shape -- minimal placeholder until the server
 * provides real player data. Keeps the store in a valid state on init.
 */
const DEFAULT_PLAYER_PROFILE: SocialProfile = {
  id: 'player',
  name: 'Player',
  username: 'Player',
  avatar: '👤',
  bio: '',
  isOnline: true,
}

// ============================================================================
// Server <-> Client data mapping helpers
// ============================================================================

/** Map a server profile object to the client SocialProfile shape */
function serverToClientProfile(p: any): SocialProfile {
  return {
    id: p.id,
    name: p.name || p.displayName || p.display_name || 'Unknown',
    username: p.username || p.handle || p.name || 'unknown',
    avatar: p.avatar || p.avatarEmoji || p.avatar_emoji || '👤',
    bio: p.bio || '',
    isOnline: p.isOnline ?? p.is_online ?? false,
  }
}

/** Map a server comment object to the client Comment shape */
function serverToClientComment(c: any): Comment {
  return {
    id: c.id,
    authorId: c.authorId || c.author_id,
    author: c.author
      ? serverToClientProfile(c.author)
      : {
          id: c.authorId || c.author_id,
          name: 'Unknown',
          username: 'unknown',
          avatar: '👤',
        },
    content: c.content,
    timestamp: typeof c.createdAt === 'number'
      ? new Date(c.createdAt * 1000).toISOString()
      : c.timestamp || c.created_at || new Date().toISOString(),
    likes: (c.likes || []).map((l: any) =>
      typeof l === 'string' ? l : l.likerId || l.liker_id
    ),
  }
}

/** Map a server PostWithDetails object to the client Post shape */
function serverToClientPost(serverPost: any): Post {
  const authorProfile: SocialProfile = serverPost.author
    ? serverToClientProfile(serverPost.author)
    : {
        id: serverPost.authorId || serverPost.author_id,
        name: 'Unknown',
        username: 'unknown',
        avatar: '👤',
      }

  return {
    id: serverPost.id,
    authorId: serverPost.authorId || serverPost.author_id,
    author: authorProfile,
    content: serverPost.content,
    images: serverPost.mediaUrls || serverPost.media_urls || serverPost.images || [],
    timestamp: typeof serverPost.createdAt === 'number'
      ? new Date(serverPost.createdAt * 1000).toISOString()
      : serverPost.timestamp || serverPost.created_at || new Date().toISOString(),
    likes: (serverPost.likes || []).map((l: any) =>
      typeof l === 'string' ? l : l.likerId || l.liker_id
    ),
    comments: (serverPost.comments || []).map((c: any) => serverToClientComment(c)),
    shares: serverPost.shares || serverPost.shareCount || 0,
    platform: serverPost.platform || 'myface',
    seenBy: serverPost.seenBy || [],
  }
}

// ============================================================================
// Store
// ============================================================================

export const useSocialStore = create<SocialState>()((set, get) => ({
  profiles: {},
  posts: [],
  playerProfile: DEFAULT_PLAYER_PROFILE,
  isLoading: false,

  /**
   * Initialize the social feed from the server via WebSocket.
   * If the server is unavailable or returns empty, the store stays empty.
   * The database is the single source of truth.
   */
  initialize: async () => {
    const { posts } = get()
    if (posts.length > 0) return // Already initialized

    set({ isLoading: true })

    try {
      const { request, connected } = useWSStore.getState()
      if (connected) {
        const feedResult = await request<any, { posts: any[] }>('social:getFeed', { limit: 50 })

        if (feedResult.posts && feedResult.posts.length > 0) {
          // Map server posts to client Post shape
          const mappedPosts = feedResult.posts.map(serverToClientPost)

          // Build profiles map exclusively from server-provided post authors
          const profileMap: Record<string, SocialProfile> = {}
          for (const post of feedResult.posts) {
            if (post.author && !profileMap[post.author.id]) {
              profileMap[post.author.id] = serverToClientProfile(post.author)
            }
          }

          set({ posts: mappedPosts, profiles: profileMap, isLoading: false })
          return
        }
      }
    } catch (err) {
      console.warn('[SocialStore] Server fetch failed, store will remain empty:', err)
    }

    // No server data available -- store stays empty, that is correct behavior
    set({ isLoading: false })
  },

  /**
   * Like a post as the player.
   * Performs an optimistic local update, then fires a WS request to the server.
   */
  likePost: (postId: string) => {
    // Optimistic local update
    set(state => ({
      posts: state.posts.map(post =>
        post.id === postId && !post.likes.includes('player')
          ? { ...post, likes: [...post.likes, 'player'] }
          : post
      ),
    }))

    // Send to server (fire and forget)
    try {
      const { request, connected } = useWSStore.getState()
      if (connected) {
        request('social:likePost', { postId, likerId: 'player', likerType: 'player' }).catch(() => {})
      }
    } catch { /* WS not available, local update already applied */ }
  },

  /**
   * Unlike a post as the player.
   * Performs an optimistic local update, then fires a WS request to the server.
   */
  unlikePost: (postId: string) => {
    // Optimistic local update
    set(state => ({
      posts: state.posts.map(post =>
        post.id === postId
          ? { ...post, likes: post.likes.filter(id => id !== 'player') }
          : post
      ),
    }))

    // Send to server (fire and forget)
    try {
      const { request, connected } = useWSStore.getState()
      if (connected) {
        request('social:unlikePost', { postId, likerId: 'player', likerType: 'player' }).catch(() => {})
      }
    } catch { /* WS not available, local update already applied */ }
  },

  /**
   * Add a comment to a post as the player.
   * Performs an optimistic local update, then fires a WS request to the server.
   */
  addComment: (postId: string, content: string) => {
    const { playerProfile } = get()
    const newComment: Comment = {
      id: `comment_${Date.now()}`,
      authorId: 'player',
      author: playerProfile,
      content,
      timestamp: new Date().toISOString(),
      likes: [],
    }

    // Optimistic local update
    set(state => ({
      posts: state.posts.map(post =>
        post.id === postId
          ? { ...post, comments: [...post.comments, newComment] }
          : post
      ),
    }))

    // Send to server (fire and forget)
    try {
      const { request, connected } = useWSStore.getState()
      if (connected) {
        request('social:addComment', { postId, content, authorId: 'player', authorType: 'player' }).catch(() => {})
      }
    } catch { /* WS not available, local update already applied */ }
  },

  likeComment: (postId: string, commentId: string) => {
    set(state => ({
      posts: state.posts.map(post =>
        post.id === postId
          ? {
              ...post,
              comments: post.comments.map(comment =>
                comment.id === commentId && !comment.likes.includes('player')
                  ? { ...comment, likes: [...comment.likes, 'player'] }
                  : comment
              ),
            }
          : post
      ),
    }))
  },

  /**
   * Create a new post as the player.
   * Performs an optimistic local update, then fires a WS request to the server.
   */
  createPost: (content: string, images?: string[]) => {
    const { playerProfile } = get()
    const newPost: Post = {
      id: `post_${Date.now()}`,
      authorId: 'player',
      author: playerProfile,
      content,
      images,
      timestamp: new Date().toISOString(),
      likes: [],
      comments: [],
      shares: 0,
      platform: 'myface',
      seenBy: [], // New posts start unseen - will be marked as seen when viewed
    }

    // Optimistic local update
    set(state => ({
      posts: [newPost, ...state.posts],
    }))

    // Send to server (fire and forget)
    try {
      const { request, connected } = useWSStore.getState()
      if (connected) {
        request('social:createPost', {
          content,
          images,
          authorId: 'player',
          authorType: 'player',
          platform: 'myface',
        }).catch(() => {})
      }
    } catch { /* WS not available, local update already applied */ }
  },

  getProfile: (profileId: string) => {
    const { profiles, playerProfile } = get()
    if (profileId === 'player') return playerProfile
    return profiles[profileId]
  },

  getPostsByAuthor: (authorId: string) => {
    return get().posts.filter(post => post.authorId === authorId)
  },

  getFeed: (platform?: string) => {
    const { posts } = get()
    return platform
      ? posts.filter(post => post.platform === platform)
      : posts
  },

  // ========================================================================
  // Awareness Tracking
  // ========================================================================

  markPostAsSeen: (postId: string, viewerId: string, viewPlatform?: string) => {
    const post = get().posts.find(p => p.id === postId)
    if (!post) return

    // Already seen by this viewer
    if (post.seenBy.some(v => v.viewerId === viewerId)) return

    const view: PostView = {
      viewerId,
      viewedAt: new Date().toISOString(),
      platform: viewPlatform || post.platform,
    }

    set(state => ({
      posts: state.posts.map(p =>
        p.id === postId
          ? { ...p, seenBy: [...p.seenBy, view] }
          : p
      ),
    }))
  },

  hasSeenPost: (postId: string, viewerId: string) => {
    const post = get().posts.find(p => p.id === postId)
    if (!post) return false
    return post.seenBy.some(v => v.viewerId === viewerId)
  },

  getPostsSeenBy: (viewerId: string) => {
    return get().posts.filter(p =>
      p.seenBy.some(v => v.viewerId === viewerId)
    )
  },

  getUnseenPosts: (viewerId: string, platform?: string) => {
    const { posts } = get()
    const filtered = platform
      ? posts.filter(p => p.platform === platform)
      : posts

    return filtered.filter(p =>
      !p.seenBy.some(v => v.viewerId === viewerId)
    )
  },

  // ========================================================================
  // NPC Content Creation (for drama automation)
  // ========================================================================

  createNPCPost: (npcId: string, content: string, platform?: 'myface' | 'chirp' | 'instasnap', images?: string[]) => {
    const { profiles } = get()

    // Try to find profile - handle both 'sarah' and 'npc_sarah' formats
    let profile = profiles[npcId] || profiles[`npc_${npcId}`]

    if (!profile) {
      console.warn(`[SocialStore] Cannot create post: NPC profile not found for ${npcId}`)
      return null
    }

    const newPost: Post = {
      id: `post_${Date.now()}_${npcId}`,
      authorId: profile.id,
      author: profile,
      content,
      images,
      timestamp: new Date().toISOString(),
      likes: [],
      comments: [],
      shares: 0,
      platform: platform || 'myface',
      seenBy: [], // New posts start unseen
    }

    set(state => ({
      posts: [newPost, ...state.posts],
    }))

    console.log(`[SocialStore] NPC ${profile.name} posted: "${content.substring(0, 50)}..."`)

    // Send to server (fire and forget)
    try {
      const { request, connected } = useWSStore.getState()
      if (connected) {
        request('social:createPost', {
          content,
          images,
          authorId: profile.id,
          authorType: 'npc',
          platform: platform || 'myface',
        }).catch(() => {})
      }
    } catch { /* WS not available, local update already applied */ }

    return newPost
  },

  addNPCComment: (postId: string, npcId: string, content: string) => {
    const { profiles } = get()

    // Try to find profile - handle both 'sarah' and 'npc_sarah' formats
    let profile = profiles[npcId] || profiles[`npc_${npcId}`]

    if (!profile) {
      console.warn(`[SocialStore] Cannot add comment: NPC profile not found for ${npcId}`)
      return
    }

    const newComment: Comment = {
      id: `comment_${Date.now()}_${npcId}`,
      authorId: profile.id,
      author: profile,
      content,
      timestamp: new Date().toISOString(),
      likes: [],
    }

    set(state => ({
      posts: state.posts.map(post =>
        post.id === postId
          ? { ...post, comments: [...post.comments, newComment] }
          : post
      ),
    }))

    console.log(`[SocialStore] NPC ${profile.name} commented on ${postId}: "${content.substring(0, 30)}..."`)

    // Send to server (fire and forget)
    try {
      const { request, connected } = useWSStore.getState()
      if (connected) {
        request('social:addComment', {
          postId,
          content,
          authorId: profile.id,
          authorType: 'npc',
        }).catch(() => {})
      }
    } catch { /* WS not available, local update already applied */ }
  },

  addNPCLike: (postId: string, npcId: string) => {
    const { profiles } = get()

    // Try to find profile - handle both 'sarah' and 'npc_sarah' formats
    let profile = profiles[npcId] || profiles[`npc_${npcId}`]

    if (!profile) {
      console.warn(`[SocialStore] Cannot add like: NPC profile not found for ${npcId}`)
      return
    }

    set(state => ({
      posts: state.posts.map(post =>
        post.id === postId && !post.likes.includes(profile!.id)
          ? { ...post, likes: [...post.likes, profile!.id] }
          : post
      ),
    }))

    // Send to server (fire and forget)
    try {
      const { request, connected } = useWSStore.getState()
      if (connected) {
        request('social:likePost', {
          postId,
          likerId: profile.id,
          likerType: 'npc',
        }).catch(() => {})
      }
    } catch { /* WS not available, local update already applied */ }
  },

  removeNPCLike: (postId: string, npcId: string) => {
    const { profiles } = get()

    // Try to find profile - handle both 'sarah' and 'npc_sarah' formats
    let profile = profiles[npcId] || profiles[`npc_${npcId}`]

    if (!profile) {
      return
    }

    set(state => ({
      posts: state.posts.map(post =>
        post.id === postId
          ? { ...post, likes: post.likes.filter(id => id !== profile!.id) }
          : post
      ),
    }))

    // Send to server (fire and forget)
    try {
      const { request, connected } = useWSStore.getState()
      if (connected) {
        request('social:unlikePost', {
          postId,
          likerId: profile!.id,
          likerType: 'npc',
        }).catch(() => {})
      }
    } catch { /* WS not available, local update already applied */ }
  },
}))

// ============================================================================
// Real-time event subscriptions from server
// ============================================================================

/**
 * Subscribe to live social events pushed from the server.
 * Runs once on module load in the browser. Uses the wsStore's subscribe
 * method to listen for server-pushed events and update the social feed
 * in real time.
 */
if (typeof window !== 'undefined') {
  let subscribed = false

  const setupSubscriptions = () => {
    if (subscribed) return
    const { subscribe, connected } = useWSStore.getState()
    if (!connected) return

    subscribed = true

    // A new post was created by another client or NPC on the server
    subscribe('social:postCreated', (msg) => {
      const postData = (msg.payload as any)?.post
      if (!postData) return

      const post = serverToClientPost(postData)
      // Avoid duplicating posts already in the store (from optimistic updates)
      useSocialStore.setState(state => {
        if (state.posts.some(p => p.id === post.id)) return state
        return { posts: [post, ...state.posts] }
      })
    })

    // A post was liked by another user
    subscribe('social:postLiked', (msg) => {
      const { postId, likerId } = (msg.payload as any) || {}
      if (!postId || !likerId) return

      useSocialStore.setState(state => ({
        posts: state.posts.map(p =>
          p.id === postId && !p.likes.includes(likerId)
            ? { ...p, likes: [...p.likes, likerId] }
            : p
        ),
      }))
    })

    // A post was unliked by another user
    subscribe('social:postUnliked', (msg) => {
      const { postId, likerId } = (msg.payload as any) || {}
      if (!postId || !likerId) return

      useSocialStore.setState(state => ({
        posts: state.posts.map(p =>
          p.id === postId
            ? { ...p, likes: p.likes.filter(id => id !== likerId) }
            : p
        ),
      }))
    })

    // A comment was added to a post
    subscribe('social:commentAdded', (msg) => {
      const { postId, comment } = (msg.payload as any) || {}
      if (!postId || !comment) return

      const clientComment = serverToClientComment(comment)
      useSocialStore.setState(state => ({
        posts: state.posts.map(p =>
          p.id === postId
            ? { ...p, comments: [...p.comments, clientComment] }
            : p
        ),
      }))
    })
  }

  // Listen for connection state changes and set up subscriptions when connected
  useWSStore.subscribe((state) => {
    if (state.connected) {
      setupSubscriptions()
    } else {
      // Allow re-subscription on reconnect
      subscribed = false
    }
  })

  // Also check if already connected at module load time
  setupSubscriptions()
}

// ============================================================================
// Selector hooks for convenience
// ============================================================================

export const usePosts = (platform?: string) => {
  const posts = useSocialStore(state => state.posts)
  return platform ? posts.filter(p => p.platform === platform) : posts
}

export const useProfile = (profileId: string) => {
  return useSocialStore(state => state.getProfile(profileId))
}

export const usePlayerProfile = () => {
  return useSocialStore(state => state.playerProfile)
}
