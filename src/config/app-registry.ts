/**
 * App Registry
 *
 * Central definition of all apps in engAIge.
 * Defines where each app exists (surfaces), who can reach you there (access levels),
 * and how messages are styled.
 *
 * IMPORTANT: Browser sites get their metadata from site-manifests.ts (single source of truth).
 * Browser entries are auto-generated via getBrowserApps() - don't duplicate them here!
 *
 * This file defines:
 * - Phone apps (Messages, Spark, etc.)
 * - Desktop apps (Settings, Files, etc.)
 * - Apps that appear on MULTIPLE surfaces (MyFace appears on both phone AND browser)
 */

import type { SiteManifest } from '../router/types.js'

// ============================================================================
// Types
// ============================================================================

/**
 * Where an app can be accessed from
 */
export type AppSurface = 'phone' | 'browser' | 'desktop';

/**
 * Relationship level required to contact player through this app
 */
export type AccessLevel =
  | 'stranger'      // Anyone (public profiles, random DMs)
  | 'acquaintance'  // Met once, basic connection
  | 'friend'        // Regular friend level
  | 'close_friend'  // Inner circle
  | 'partner';      // Romantic relationship

/**
 * Message display variant for this app
 */
export type MessageVariant =
  | 'bubble'   // iMessage style - rounded bubbles, left/right alignment
  | 'block'    // MySpace/web style - rectangular, avatars visible, timestamps
  | 'compact'; // Discord/Slack style - dense, avatar left, content right

/**
 * App category for organization
 */
export type AppCategory =
  | 'messaging'     // Direct messaging apps
  | 'social'        // Social media platforms
  | 'dating'        // Dating apps
  | 'utility'       // Settings, files, etc.
  | 'entertainment' // Games, music, etc.
  | 'browser';      // Web browser and sites

/**
 * Definition of an app in the system
 */
export interface AppDefinition {
  id: string;
  name: string;
  icon: string; // Emoji or icon name
  iconImage?: string; // Optional path to high-res image icon
  description?: string;

  // Where does this app exist?
  surfaces: Partial<Record<AppSurface, boolean>>;

  // App behavior
  category: AppCategory;
  accessLevel: AccessLevel; // Who can contact you here
  messageVariant?: MessageVariant; // For messaging apps

  // Conversation settings
  conversationSettings?: {
    supportsGroupChat: boolean;
    supportsImages: boolean;
    supportsVoiceMessages: boolean;
    supportsReactions: boolean;
    showReadReceipts: boolean;
    showTypingIndicator: boolean;
  };

  // Visual theming
  theme?: {
    primaryColor: string;
    secondaryColor: string;
    bubbleColorSent?: string;
    bubbleColorReceived?: string;
  };
}

// ============================================================================
// Core Apps (Non-Browser)
// These are apps with special behavior beyond just being browser sites.
// ============================================================================

const CORE_APPS: Record<string, AppDefinition> = {
  // -------------------------------------------------------------------------
  // Messaging Apps
  // -------------------------------------------------------------------------

  'messages': {
    id: 'messages',
    name: 'Messages',
    icon: '💬',
    description: 'iMessage-style texting for close friends',
    surfaces: { phone: true },
    category: 'messaging',
    accessLevel: 'close_friend',
    messageVariant: 'bubble',
    conversationSettings: {
      supportsGroupChat: true,
      supportsImages: true,
      supportsVoiceMessages: true,
      supportsReactions: true,
      showReadReceipts: true,
      showTypingIndicator: true,
    },
    theme: {
      primaryColor: '#007AFF',
      secondaryColor: '#34C759',
      bubbleColorSent: '#007AFF',
      bubbleColorReceived: '#E9E9EB',
    },
  },

  'myface-chat': {
    id: 'myface-chat',
    name: 'MyFace Chat',
    icon: '✉️',
    description: 'MyFace messaging - available to all friends',
    surfaces: { phone: true, browser: true },
    category: 'messaging',
    accessLevel: 'friend',
    messageVariant: 'block',
    conversationSettings: {
      supportsGroupChat: false,
      supportsImages: true,
      supportsVoiceMessages: false,
      supportsReactions: false,
      showReadReceipts: false,
      showTypingIndicator: true,
    },
    theme: {
      primaryColor: '#003366',
      secondaryColor: '#FF6600',
    },
  },

  'chirp-dm': {
    id: 'chirp-dm',
    name: 'Chirp DMs',
    icon: '🐦',
    description: 'Direct messages on Chirp (Twitter clone)',
    surfaces: { phone: true, browser: true },
    category: 'messaging',
    accessLevel: 'acquaintance',
    messageVariant: 'compact',
    conversationSettings: {
      supportsGroupChat: true,
      supportsImages: true,
      supportsVoiceMessages: false,
      supportsReactions: true,
      showReadReceipts: true,
      showTypingIndicator: false,
    },
    theme: {
      primaryColor: '#1DA1F2',
      secondaryColor: '#14171A',
    },
  },

  'instasnap-dm': {
    id: 'instasnap-dm',
    name: 'InstaSnap DMs',
    icon: '📸',
    description: 'Direct messages on InstaSnap (Instagram clone)',
    surfaces: { phone: true, browser: true },
    category: 'messaging',
    accessLevel: 'acquaintance',
    messageVariant: 'bubble',
    conversationSettings: {
      supportsGroupChat: true,
      supportsImages: true,
      supportsVoiceMessages: true,
      supportsReactions: true,
      showReadReceipts: true,
      showTypingIndicator: true,
    },
    theme: {
      primaryColor: '#E1306C',
      secondaryColor: '#F77737',
      bubbleColorSent: '#3797F0',
      bubbleColorReceived: '#EFEFEF',
    },
  },

  'lovelink-chat': {
    id: 'lovelink-chat',
    name: 'LoveLink Chat',
    icon: '💕',
    description: 'Chat with your matches on LoveLink (dating app)',
    surfaces: { phone: true },
    category: 'dating',
    accessLevel: 'stranger', // Matched strangers can chat
    messageVariant: 'bubble',
    conversationSettings: {
      supportsGroupChat: false,
      supportsImages: true,
      supportsVoiceMessages: false,
      supportsReactions: true,
      showReadReceipts: true,
      showTypingIndicator: true,
    },
    theme: {
      primaryColor: '#FE3C72',
      secondaryColor: '#FF6B6B',
      bubbleColorSent: '#FE3C72',
      bubbleColorReceived: '#F0F0F0',
    },
  },

  // -------------------------------------------------------------------------
  // Social Apps (with phone presence)
  // -------------------------------------------------------------------------

  'myface': {
    id: 'myface',
    name: 'MyFace',
    icon: '👤',
    iconImage: '/src/assets/icon-myface.png',
    description: 'The OG social network - profiles, Top 8, bulletins',
    surfaces: { phone: true, browser: true },
    category: 'social',
    accessLevel: 'stranger',
  },

  'chirp': {
    id: 'chirp',
    name: 'Chirp',
    icon: '🐦',
    description: 'Microblogging - tweets, retweets, trending topics',
    surfaces: { phone: true, browser: true },
    category: 'social',
    accessLevel: 'stranger',
  },

  'instasnap': {
    id: 'instasnap',
    name: 'InstaSnap',
    icon: '📸',
    description: 'Photo sharing - grid profiles, stories, reels',
    surfaces: { phone: true, browser: true },
    category: 'social',
    accessLevel: 'stranger',
  },

  // -------------------------------------------------------------------------
  // Dating Apps
  // -------------------------------------------------------------------------

  'lovelink': {
    id: 'lovelink',
    name: 'LoveLink',
    icon: '💘',
    description: 'Dating app - swipe, match, chat',
    surfaces: { phone: true },
    category: 'dating',
    accessLevel: 'stranger',
  },

  'spark': {
    id: 'spark',
    name: 'Spark',
    icon: '🔥',
    description: 'Dating app - ignite a connection',
    surfaces: { phone: true },
    category: 'dating',
    accessLevel: 'stranger',
    theme: {
      primaryColor: '#FE3C72',
      secondaryColor: '#FF6B6B',
    },
  },

  'spark-chat': {
    id: 'spark-chat',
    name: 'Spark Chat',
    icon: '🔥',
    description: 'Chat with your Spark matches',
    surfaces: { phone: true },
    category: 'dating',
    accessLevel: 'stranger',
    messageVariant: 'bubble',
    conversationSettings: {
      supportsGroupChat: false,
      supportsImages: true,
      supportsVoiceMessages: false,
      supportsReactions: true,
      showReadReceipts: true,
      showTypingIndicator: true,
    },
    theme: {
      primaryColor: '#FE3C72',
      secondaryColor: '#FF6B6B',
      bubbleColorSent: '#FE3C72',
      bubbleColorReceived: '#F0F0F0',
    },
  },

  // -------------------------------------------------------------------------
  // Utility Apps
  // -------------------------------------------------------------------------

  'settings': {
    id: 'settings',
    name: 'Settings',
    icon: '⚙️',
    description: 'System settings and configuration',
    surfaces: { phone: true, desktop: true },
    category: 'utility',
    accessLevel: 'stranger',
  },

  'files': {
    id: 'files',
    name: 'Files',
    icon: '📁',
    description: 'File manager - photos, exports, NPC data',
    surfaces: { desktop: true },
    category: 'utility',
    accessLevel: 'stranger',
  },

  'wallet': {
    id: 'wallet',
    name: 'Wallet',
    icon: '💰',
    description: 'Budget tracking and API costs',
    surfaces: { desktop: true },
    category: 'utility',
    accessLevel: 'stranger',
  },

  'photos': {
    id: 'photos',
    name: 'Photos',
    icon: '🖼️',
    description: 'Photo gallery and memories',
    surfaces: { phone: true },
    category: 'utility',
    accessLevel: 'stranger',
  },

  'calendar': {
    id: 'calendar',
    name: 'Calendar',
    icon: '📅',
    description: 'Events, birthdays, hangouts',
    surfaces: { phone: true, desktop: true },
    category: 'utility',
    accessLevel: 'stranger',
  },

  // -------------------------------------------------------------------------
  // Browser Shell
  // -------------------------------------------------------------------------

  'browser': {
    id: 'browser',
    name: 'The Corn Cob',
    icon: '🌐',
    description: 'Web browser - access all sites',
    surfaces: { desktop: true },
    category: 'browser',
    accessLevel: 'stranger',
  },

  // -------------------------------------------------------------------------
  // Entertainment
  // -------------------------------------------------------------------------

  'music': {
    id: 'music',
    name: 'TuneBox',
    icon: '🎵',
    description: 'Music player - playlists, NPC favorites',
    surfaces: { phone: true, desktop: true },
    category: 'entertainment',
    accessLevel: 'stranger',
  },

  'games': {
    id: 'games',
    name: 'Games',
    icon: '🎮',
    description: 'Mini-games - challenge NPCs',
    surfaces: { phone: true, desktop: true },
    category: 'entertainment',
    accessLevel: 'stranger',
  },
};

// ============================================================================
// Browser App Generation
// ============================================================================

let browserAppsCache: Record<string, AppDefinition> | null = null;
let fullRegistryCache: Record<string, AppDefinition> | null = null;

/**
 * Generate browser app entries from site manifests.
 * This is called lazily when needed.
 */
function generateBrowserApps(manifests: SiteManifest[]): Record<string, AppDefinition> {
  const apps: Record<string, AppDefinition> = {};

  for (const manifest of manifests) {
    // Skip if already in CORE_APPS (e.g., myface has special phone presence)
    if (CORE_APPS[manifest.id]) {
      continue;
    }

    apps[manifest.id] = {
      id: manifest.id,
      name: manifest.name,
      icon: manifest.icon,
      iconImage: manifest.iconImage,
      description: manifest.homepage.description,
      surfaces: { browser: true },
      category: 'browser',
      accessLevel: 'stranger',
    };
  }

  return apps;
}

/**
 * Initialize the registry with site manifests.
 * Call this after site-manifests are loaded.
 */
export function initializeAppRegistry(manifests: SiteManifest[]): void {
  browserAppsCache = generateBrowserApps(manifests);
  fullRegistryCache = { ...CORE_APPS, ...browserAppsCache };
}

/**
 * Get the full app registry (core + browser apps).
 * Must call initializeAppRegistry first or provide manifests.
 */
export function getAppRegistry(manifests?: SiteManifest[]): Record<string, AppDefinition> {
  if (fullRegistryCache) {
    return fullRegistryCache;
  }

  if (manifests) {
    initializeAppRegistry(manifests);
    return fullRegistryCache!;
  }

  // Fallback: return just core apps
  console.warn('[AppRegistry] Not initialized. Call initializeAppRegistry() first for full registry.');
  return CORE_APPS;
}

// ============================================================================
// Legacy Export (for backwards compatibility)
// ============================================================================

/**
 * @deprecated Use getAppRegistry() instead for full registry.
 * This only returns core apps without auto-generated browser entries.
 */
export const APP_REGISTRY = CORE_APPS;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get all apps available on a specific surface
 */
export function getAppsForSurface(surface: AppSurface, manifests?: SiteManifest[]): AppDefinition[] {
  const registry = getAppRegistry(manifests);
  return Object.values(registry).filter((app) => app.surfaces[surface]);
}

/**
 * Get all messaging apps
 */
export function getMessagingApps(): AppDefinition[] {
  return Object.values(CORE_APPS).filter(
    (app) => app.category === 'messaging' || app.category === 'dating'
  );
}

/**
 * Get apps available for a given access level
 */
export function getAppsForAccessLevel(level: AccessLevel, manifests?: SiteManifest[]): AppDefinition[] {
  const registry = getAppRegistry(manifests);
  const levelOrder: AccessLevel[] = ['stranger', 'acquaintance', 'friend', 'close_friend', 'partner'];
  const levelIndex = levelOrder.indexOf(level);

  return Object.values(registry).filter((app) => {
    const appLevelIndex = levelOrder.indexOf(app.accessLevel);
    return appLevelIndex <= levelIndex;
  });
}

/**
 * Check if an NPC can contact player through a specific app based on relationship
 */
export function canContactViaApp(appId: string, relationshipLevel: AccessLevel, manifests?: SiteManifest[]): boolean {
  const registry = getAppRegistry(manifests);
  const app = registry[appId];
  if (!app) return false;

  const levelOrder: AccessLevel[] = ['stranger', 'acquaintance', 'friend', 'close_friend', 'partner'];
  const requiredIndex = levelOrder.indexOf(app.accessLevel);
  const actualIndex = levelOrder.indexOf(relationshipLevel);

  return actualIndex >= requiredIndex;
}

/**
 * Get the app definition by ID
 */
export function getApp(appId: string, manifests?: SiteManifest[]): AppDefinition | undefined {
  const registry = getAppRegistry(manifests);
  return registry[appId];
}

/**
 * Get all apps in a category
 */
export function getAppsByCategory(category: AppCategory, manifests?: SiteManifest[]): AppDefinition[] {
  const registry = getAppRegistry(manifests);
  return Object.values(registry).filter((app) => app.category === category);
}

export default APP_REGISTRY;
