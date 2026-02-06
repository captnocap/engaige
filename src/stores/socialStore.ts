/**
 * Social Feed Store
 *
 * Manages social media posts, likes, comments for MyFace and other platforms.
 * Fetches data from server via WebSocket, falls back to mock data when server
 * returns empty or is unavailable.
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

// Mock NPC profiles for development
const MOCK_PROFILES: Record<string, SocialProfile> = {
  'npc_sarah': {
    id: 'npc_sarah',
    name: 'Sarah',
    username: 'xX_SarahBear_Xx',
    avatar: '👧',
    bio: '✨ living my best life ✨ photography | coffee | adventures',
    mood: 'excited',
    moodEmoji: '🎉',
    location: 'Los Angeles, CA',
    interests: ['photography', 'coffee', 'hiking', 'music'],
    music: 'currently obsessed with indie pop',
    topFriends: ['npc_jake', 'npc_emily', 'npc_mike'],
    backgroundColor: '#FFE4E1',
    textColor: '#8B4513',
    isOnline: true,
    relationshipLevel: 'friend',
  },
  'npc_jake': {
    id: 'npc_jake',
    name: 'Jake',
    username: 'JakeTheSnake99',
    avatar: '🧑',
    bio: 'gamer | skater | pizza enthusiast 🍕',
    mood: 'chill',
    moodEmoji: '😎',
    location: 'Austin, TX',
    interests: ['gaming', 'skateboarding', 'music', 'pizza'],
    music: 'punk rock forever',
    topFriends: ['npc_sarah', 'npc_mike'],
    backgroundColor: '#2F4F4F',
    textColor: '#00FF00',
    isOnline: false,
    lastSeen: '2 hours ago',
    relationshipLevel: 'acquaintance',
  },
  'npc_emily': {
    id: 'npc_emily',
    name: 'Emily',
    username: 'EmilyMelody',
    avatar: '👩',
    bio: '🎵 singer/songwriter | dreamer | cat mom 🐱',
    mood: 'creative',
    moodEmoji: '🎨',
    location: 'Nashville, TN',
    interests: ['music', 'songwriting', 'cats', 'poetry'],
    music: 'check out my new song on my profile!',
    topFriends: ['npc_sarah', 'npc_alex'],
    backgroundColor: '#E6E6FA',
    textColor: '#4B0082',
    isOnline: true,
    relationshipLevel: 'friend',
  },
  'npc_mike': {
    id: 'npc_mike',
    name: 'Mike',
    username: 'MikeD_Beats',
    avatar: '👨',
    bio: 'DJ | Producer | Night owl 🦉',
    mood: 'tired',
    moodEmoji: '😴',
    location: 'Miami, FL',
    interests: ['DJing', 'production', 'nightlife', 'vinyl'],
    music: 'house, techno, everything electronic',
    topFriends: ['npc_jake', 'npc_alex'],
    backgroundColor: '#1a1a2e',
    textColor: '#00FFFF',
    isOnline: false,
    lastSeen: '5 hours ago',
    relationshipLevel: 'stranger',
  },
  'npc_alex': {
    id: 'npc_alex',
    name: 'Alex',
    username: 'AlexWonders',
    avatar: '🧑‍🎤',
    bio: 'artist | free spirit | collector of sunsets 🌅',
    mood: 'peaceful',
    moodEmoji: '☮️',
    location: 'Portland, OR',
    interests: ['art', 'nature', 'meditation', 'travel'],
    music: 'ambient and lo-fi beats',
    topFriends: ['npc_emily', 'npc_mike'],
    backgroundColor: '#FFF8DC',
    textColor: '#556B2F',
    isOnline: true,
    relationshipLevel: 'acquaintance',
  },
  'npc_marcus': {
    id: 'npc_marcus',
    name: 'Marcus',
    username: 'MarcusNightOwl',
    avatar: '🦉',
    bio: 'late night thoughts | insomnia crew | 3am philosophy',
    mood: 'contemplative',
    moodEmoji: '🌙',
    location: 'Chicago, IL',
    interests: ['philosophy', 'night walks', 'jazz', 'coffee'],
    music: 'lo-fi beats to contemplate existence to',
    topFriends: ['npc_sarah', 'npc_luna'],
    backgroundColor: '#1a1a2e',
    textColor: '#9370DB',
    isOnline: false,
    lastSeen: 'online at 3am',
    relationshipLevel: 'acquaintance',
  },
  'npc_luna': {
    id: 'npc_luna',
    name: 'Luna',
    username: 'LunaStardust',
    avatar: '🌙',
    bio: '✨ vibes only ✨ astrology girlie | tarot reader | crystal collector',
    mood: 'mystical',
    moodEmoji: '🔮',
    location: 'Sedona, AZ',
    interests: ['astrology', 'tarot', 'crystals', 'yoga'],
    music: 'ethereal ambient and meditation sounds',
    topFriends: ['npc_emily', 'npc_marcus', 'npc_sarah'],
    backgroundColor: '#2d1b4e',
    textColor: '#E6E6FA',
    isOnline: true,
    relationshipLevel: 'friend',
  },
}

// Mock posts for development
// Note: seenBy is initially empty - posts become "seen" when viewed in feed
const MOCK_POSTS: Omit<Post, 'author'>[] = [
  // MyFace posts
  {
    id: 'post_1',
    authorId: 'npc_sarah',
    content: 'just got new pics up!! check my profile 📸 had the best photoshoot today omg',
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    likes: ['npc_jake', 'npc_emily'],
    comments: [
      {
        id: 'comment_1',
        authorId: 'npc_jake',
        author: MOCK_PROFILES['npc_jake'],
        content: 'fire pics!! 🔥',
        timestamp: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
        likes: ['npc_sarah'],
      },
    ],
    shares: 2,
    platform: 'myface',
    seenBy: [], // Likes/comments imply seeing - NPC awareness handled by awarenessStore
  },
  {
    id: 'post_2',
    authorId: 'npc_jake',
    content: 'who wants to hang out this weekend?? thinking skate park then pizza 🛹🍕',
    timestamp: new Date(Date.now() - 23 * 60 * 1000).toISOString(),
    likes: ['npc_mike'],
    comments: [],
    shares: 0,
    platform: 'myface',
    seenBy: [],
  },
  {
    id: 'post_3',
    authorId: 'npc_emily',
    content: 'new song on my profile!! tell me what u think! been working on this one for weeks 🎵✨',
    timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    likes: ['npc_sarah', 'npc_alex', 'npc_mike'],
    comments: [
      {
        id: 'comment_2',
        authorId: 'npc_sarah',
        author: MOCK_PROFILES['npc_sarah'],
        content: 'omg this is SO good!! ur voice is amazing 😍',
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        likes: ['npc_emily'],
      },
      {
        id: 'comment_3',
        authorId: 'npc_alex',
        author: MOCK_PROFILES['npc_alex'],
        content: 'beautiful vibes ✨ the bridge gave me chills',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        likes: ['npc_emily', 'npc_sarah'],
      },
    ],
    shares: 5,
    platform: 'myface',
    seenBy: [],
  },
  {
    id: 'post_4',
    authorId: 'npc_mike',
    content: 'last night was INSANE 🎧 dropped my new track and the crowd went crazy',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    likes: ['npc_jake'],
    comments: [],
    shares: 1,
    platform: 'myface',
    seenBy: [],
  },
  {
    id: 'post_5',
    authorId: 'npc_alex',
    content: 'caught the most beautiful sunset today 🌅 sometimes you just gotta stop and appreciate the little things',
    images: ['sunset.jpg'],
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    likes: ['npc_emily', 'npc_sarah'],
    comments: [
      {
        id: 'comment_4',
        authorId: 'npc_emily',
        author: MOCK_PROFILES['npc_emily'],
        content: 'this is stunning!! where is this?',
        timestamp: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
        likes: [],
      },
    ],
    shares: 3,
    platform: 'myface',
    seenBy: [],
  },
  // InstaSnap posts
  {
    id: 'insta_1',
    authorId: 'npc_sarah',
    content: 'golden hour never misses ✨ #goldenhour #photography #aesthetic',
    images: ['https://picsum.photos/seed/sarah_insta1/600/600'],
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    likes: ['npc_emily', 'npc_luna', 'npc_alex', 'npc_jake'],
    comments: [
      {
        id: 'insta_comment_1',
        authorId: 'npc_emily',
        author: MOCK_PROFILES['npc_emily'],
        content: 'obsessed with this!! 😍',
        timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        likes: ['npc_sarah'],
      },
      {
        id: 'insta_comment_2',
        authorId: 'npc_luna',
        author: MOCK_PROFILES['npc_luna'],
        content: 'the lighting is everything ✨',
        timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
        likes: ['npc_sarah', 'npc_emily'],
      },
    ],
    shares: 0,
    platform: 'instasnap',
    seenBy: [],
  },
  {
    id: 'insta_2',
    authorId: 'npc_luna',
    content: 'new moon, new intentions 🌙 what are you manifesting this month? #newmoon #manifestation #spirituality',
    images: ['https://picsum.photos/seed/luna_insta1/600/600'],
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    likes: ['npc_sarah', 'npc_emily', 'npc_alex'],
    comments: [
      {
        id: 'insta_comment_3',
        authorId: 'npc_alex',
        author: MOCK_PROFILES['npc_alex'],
        content: 'abundance and peace 🙏',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        likes: ['npc_luna'],
      },
    ],
    shares: 0,
    platform: 'instasnap',
    seenBy: [],
  },
  {
    id: 'insta_3',
    authorId: 'npc_jake',
    content: 'landed it finally 🛹 #skateboarding #kickflip #progress',
    images: ['https://picsum.photos/seed/jake_insta1/600/600'],
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    likes: ['npc_mike', 'npc_sarah'],
    comments: [
      {
        id: 'insta_comment_4',
        authorId: 'npc_mike',
        author: MOCK_PROFILES['npc_mike'],
        content: 'clean! 🔥',
        timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
        likes: ['npc_jake'],
      },
    ],
    shares: 0,
    platform: 'instasnap',
    seenBy: [],
  },
  {
    id: 'insta_4',
    authorId: 'npc_emily',
    content: 'studio vibes 🎵 new song dropping soon... #music #songwriter #studio #comingsoon',
    images: ['https://picsum.photos/seed/emily_insta1/600/600'],
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    likes: ['npc_sarah', 'npc_alex', 'npc_luna', 'npc_mike', 'npc_jake'],
    comments: [
      {
        id: 'insta_comment_5',
        authorId: 'npc_sarah',
        author: MOCK_PROFILES['npc_sarah'],
        content: 'CANT WAIT 😭😭',
        timestamp: new Date(Date.now() - 2.5 * 60 * 60 * 1000).toISOString(),
        likes: ['npc_emily'],
      },
      {
        id: 'insta_comment_6',
        authorId: 'npc_alex',
        author: MOCK_PROFILES['npc_alex'],
        content: 'your music is always so healing',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        likes: ['npc_emily', 'npc_sarah'],
      },
    ],
    shares: 0,
    platform: 'instasnap',
    seenBy: [],
  },
  {
    id: 'insta_5',
    authorId: 'npc_alex',
    content: 'morning light in the studio 🎨 #art #painting #morninglight #creative',
    images: ['https://picsum.photos/seed/alex_insta1/600/600'],
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    likes: ['npc_emily', 'npc_luna', 'npc_sarah'],
    comments: [
      {
        id: 'insta_comment_7',
        authorId: 'npc_luna',
        author: MOCK_PROFILES['npc_luna'],
        content: 'the energy in this photo ✨',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        likes: ['npc_alex'],
      },
    ],
    shares: 0,
    platform: 'instasnap',
    seenBy: [],
  },
  {
    id: 'insta_6',
    authorId: 'npc_marcus',
    content: '3am thoughts and city lights 🌃 #latenight #cityscape #insomnia #nightowl',
    images: ['https://picsum.photos/seed/marcus_insta1/600/600'],
    timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
    likes: ['npc_luna', 'npc_mike'],
    comments: [
      {
        id: 'insta_comment_8',
        authorId: 'npc_luna',
        author: MOCK_PROFILES['npc_luna'],
        content: 'the quiet hours hit different',
        timestamp: new Date(Date.now() - 9 * 60 * 60 * 1000).toISOString(),
        likes: ['npc_marcus'],
      },
    ],
    shares: 0,
    platform: 'instasnap',
    seenBy: [],
  },
]

// Player's default profile
const DEFAULT_PLAYER_PROFILE: SocialProfile = {
  id: 'player',
  name: 'Player',
  username: 'Player',
  avatar: '👤',
  bio: 'Living my best life!',
  mood: 'happy',
  moodEmoji: '😊',
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
      : MOCK_PROFILES[c.authorId || c.author_id] || {
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
    : MOCK_PROFILES[serverPost.authorId] || {
        id: serverPost.authorId,
        name: 'Unknown',
        username: 'unknown',
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
   * Initialize the social feed.
   * Attempts to fetch posts from the server via WebSocket first.
   * Falls back to MOCK data if the server is unavailable or returns empty.
   */
  initialize: async () => {
    const { posts } = get()
    if (posts.length > 0) return // Already initialized

    set({ isLoading: true })

    try {
      // Try fetching from server via WebSocket
      const { request, connected } = useWSStore.getState()
      if (connected) {
        const feedResult = await request<any, { posts: any[] }>('social:getFeed', { limit: 50 })

        if (feedResult.posts && feedResult.posts.length > 0) {
          // Map server posts to client Post shape
          const mappedPosts = feedResult.posts.map(serverToClientPost)

          // Build profiles map from post authors, seeded with mock profiles as fallback
          const profileMap: Record<string, SocialProfile> = { ...MOCK_PROFILES }
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
      console.warn('[SocialStore] Server fetch failed, using mock data:', err)
    }

    // Fallback to mock data when server is unavailable or returned no posts
    const hydratedPosts = MOCK_POSTS.map(post => ({
      ...post,
      author: MOCK_PROFILES[post.authorId],
    }))

    set({
      profiles: MOCK_PROFILES,
      posts: hydratedPosts,
      isLoading: false,
    })
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
