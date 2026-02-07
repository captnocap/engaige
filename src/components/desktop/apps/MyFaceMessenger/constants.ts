/**
 * MyFace Messenger - Shared Constants
 *
 * Colors, status mappings, and configuration shared across all messenger components.
 */

import type { MessageStyleConfig } from '../../../ui/Message'

// MyFace brand colors (matches MyFaceSite.tsx)
export const MYFACE_COLORS = {
  primary: '#003366',
  accent: '#FF6600',
  bg: '#ffffff',
  bgSecondary: '#f0f4f8',
  border: '#cccccc',
  borderLight: '#e5e7eb',
  text: '#333333',
  textMuted: '#6b7280',
} as const

// Online/offline status indicator colors
export const STATUS_COLORS: Record<string, string> = {
  online: '#22c55e',
  away: '#eab308',
  busy: '#ef4444',
  offline: '#9ca3af',
}

// Relationship level → ring color (matches TaskbarNPCPortrait MOOD_COLORS)
export const RELATIONSHIP_COLORS: Record<string, string> = {
  partner: '#ec4899',
  romantic_interest: '#f472b6',
  best_friend: '#a855f7',
  close_friend: '#22c55e',
  friend: '#3b82f6',
  acquaintance: '#94a3b8',
  stranger: '#64748b',
}

// Relationship level display labels
export const RELATIONSHIP_LABELS: Record<string, string> = {
  partner: 'Partner',
  romantic_interest: 'Crush',
  best_friend: 'Best Friend',
  close_friend: 'Close Friend',
  friend: 'Friend',
  acquaintance: 'Acquaintance',
  stranger: 'Stranger',
}

// Message thread style config for the messenger (2000s IM flat style)
export const MESSENGER_MESSAGE_CONFIG: MessageStyleConfig = {
  variant: 'myspace',
  layout: 'flat',
  alignment: 'left',
  showAvatar: true,
  showTimestamp: true,
  showStatus: false,
  showReadReceipts: false,
  showReactions: false,
  showUsername: true,
  groupByTime: true,
  groupTimeWindow: 5 * 60 * 1000, // 5 min grouping for IM feel
  avatarSize: 'sm',
  timestampFormat: 'relative',
  currentUserId: 'player',
}
