/**
 * Social Feed Store
 *
 * Manages social media posts, likes, comments for MyFace and other platforms.
 * Provides mock data for development and will connect to backend later.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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
  initialize: () => void
  likePost: (postId: string) => void
  unlikePost: (postId: string) => void
  addComment: (postId: string, content: string) => void
  likeComment: (postId: string, commentId: string) => void
  createPost: (content: string, images?: string[]) => void
  getProfile: (profileId: string) => SocialProfile | undefined
  getPostsByAuthor: (authorId: string) => Post[]
  getFeed: (platform?: string) => Post[]
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
}

// Mock posts for development
const MOCK_POSTS: Omit<Post, 'author'>[] = [
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

export const useSocialStore = create<SocialState>()(
  persist(
    (set, get) => ({
      profiles: {},
      posts: [],
      playerProfile: DEFAULT_PLAYER_PROFILE,
      isLoading: false,

      initialize: () => {
        const { posts } = get()
        if (posts.length > 0) return // Already initialized

        // Hydrate posts with author data
        const hydratedPosts = MOCK_POSTS.map(post => ({
          ...post,
          author: MOCK_PROFILES[post.authorId],
        }))

        set({
          profiles: MOCK_PROFILES,
          posts: hydratedPosts,
        })
      },

      likePost: (postId: string) => {
        set(state => ({
          posts: state.posts.map(post =>
            post.id === postId && !post.likes.includes('player')
              ? { ...post, likes: [...post.likes, 'player'] }
              : post
          ),
        }))
      },

      unlikePost: (postId: string) => {
        set(state => ({
          posts: state.posts.map(post =>
            post.id === postId
              ? { ...post, likes: post.likes.filter(id => id !== 'player') }
              : post
          ),
        }))
      },

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

        set(state => ({
          posts: state.posts.map(post =>
            post.id === postId
              ? { ...post, comments: [...post.comments, newComment] }
              : post
          ),
        }))
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
        }

        set(state => ({
          posts: [newPost, ...state.posts],
        }))
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
    }),
    {
      name: 'engaige-social',
      partialize: (state) => ({
        posts: state.posts,
        playerProfile: state.playerProfile,
      }),
    }
  )
)

// Selector hooks for convenience
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
