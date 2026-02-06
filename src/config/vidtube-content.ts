/**
 * VidTube Content Configuration
 *
 * Type definitions, UI categories, and helper functions for VidTube.
 * All video/channel content lives in the database -- no hardcoded data here.
 *
 * Thumbnails go in public/images/vidtube/
 */

// ============================================================================
// Types
// ============================================================================

export interface VideoComment {
  id: string
  author: string
  avatar: string
  content: string
  likes: number
  timestamp: string
  replies?: VideoComment[]
  isCreator?: boolean
}

export interface Video {
  id: string
  title: string
  channel: string
  channelAvatar: string
  channelVerified?: boolean
  /** Path to thumbnail image in public/images/vidtube/ (e.g., 'vid_1.jpg') */
  thumbnail?: string
  /** Emoji fallback if no thumbnail image */
  thumbnailEmoji: string
  views: string
  uploadedAt: string
  duration: string
  description: string
  likes: string
  dislikes: string
  comments: VideoComment[]
  category: string
  tags: string[]
  /**
   * Full transcript of the video for NPC consumption.
   * NPCs read this to "watch" the video and can discuss it.
   */
  transcript: string
}

export interface Channel {
  id: string
  name: string
  /** Path to avatar image in public/images/vidtube/channels/ (e.g., 'quantumbrew.jpg') */
  avatar?: string
  /** Emoji fallback if no avatar image */
  avatarEmoji: string
  subscribers: string
  verified?: boolean
  description: string
}

// ============================================================================
// Categories (static UI config -- not content data)
// ============================================================================

export const VIDTUBE_CATEGORIES = [
  'All',
  'Music',
  'Gaming',
  'News',
  'Live',
  'Science & Technology',
  'Education',
  'Entertainment',
  'Howto & Style',
  'Comedy',
]

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get thumbnail URL for a video
 * Returns image path if thumbnail exists, otherwise returns emoji
 */
export function getVideoThumbnail(video: Video): { type: 'image' | 'emoji', value: string } {
  if (video.thumbnail) {
    return { type: 'image', value: `/images/vidtube/${video.thumbnail}` }
  }
  return { type: 'emoji', value: video.thumbnailEmoji }
}

/**
 * Get channel avatar
 * Returns image path if avatar exists, otherwise returns emoji
 */
export function getChannelAvatar(channel: Channel): { type: 'image' | 'emoji', value: string } {
  if (channel.avatar) {
    return { type: 'image', value: `/images/vidtube/channels/${channel.avatar}` }
  }
  return { type: 'emoji', value: channel.avatarEmoji }
}
