/**
 * App Registry
 *
 * Central definition of all apps in engAIge.
 * Defines where each app exists (surfaces), who can reach you there (access levels),
 * and how messages are styled.
 *
 * This ensures consistency when the same app appears on multiple surfaces
 * (e.g., MySpace Chat in browser AND phone).
 */

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
// App Registry
// ============================================================================

export const APP_REGISTRY: Record<string, AppDefinition> = {
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
  // Social Media Apps
  // -------------------------------------------------------------------------

  'myface': {
    id: 'myface',
    name: 'MyFace',
    icon: '👤',
    iconImage: '/src/assets/icon-myface.png', // User uploaded
    description: 'The OG social network - profiles, Top 8, bulletins',
    surfaces: { phone: true, browser: true },
    category: 'social',
    accessLevel: 'stranger', // Public profiles
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
    accessLevel: 'stranger', // N/A for utility
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
  // Browser Sites (accessed through browser shell)
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
  // Filler Content Sites (browser accessible)
  // -------------------------------------------------------------------------

  'wikiknow': {
    id: 'wikiknow',
    name: 'WikiKnow',
    icon: '📖',
    description: 'The free encyclopedia that anyone can edit',
    surfaces: { browser: true },
    category: 'browser',
    accessLevel: 'stranger',
  },

  'threadit': {
    id: 'threadit',
    name: 'Threadit',
    icon: '🗣️',
    description: 'The front page of the fake internet',
    surfaces: { browser: true },
    category: 'browser',
    accessLevel: 'stranger',
  },

  'dailybuzz': {
    id: 'dailybuzz',
    name: 'DailyBuzz',
    icon: '📰',
    description: 'All the news that fits',
    surfaces: { browser: true },
    category: 'browser',
    accessLevel: 'stranger',
  },

  'vidtube': {
    id: 'vidtube',
    name: 'VidTube',
    icon: '▶️',
    description: 'Share and watch videos from around the world',
    surfaces: { browser: true },
    category: 'browser',
    accessLevel: 'stranger',
  },

  'forchan': {
    id: 'forchan',
    name: 'ForChan',
    icon: '🍀',
    description: 'Anonymous imageboard',
    surfaces: { browser: true },
    category: 'browser',
    accessLevel: 'stranger',
  },

  'vitalityrx': {
    id: 'vitalityrx',
    name: 'VitalityRx',
    icon: '💊',
    description: 'Medications for the Modern Age',
    surfaces: { browser: true },
    category: 'browser',
    accessLevel: 'stranger',
  },

  'nestfinder': {
    id: 'nestfinder',
    name: 'NestFinder',
    icon: '🏠',
    description: 'Find your perfect place',
    surfaces: { browser: true },
    category: 'browser',
    accessLevel: 'stranger',
  },

  'bargainbay': {
    id: 'bargainbay',
    name: 'BargainBay',
    icon: '🏷️',
    description: 'Local classifieds and marketplace',
    surfaces: { browser: true },
    category: 'browser',
    accessLevel: 'stranger',
  },

  'oddsoracle': {
    id: 'oddsoracle',
    name: 'OddsOracle',
    icon: '🎲',
    description: 'Prediction markets for everything',
    surfaces: { browser: true },
    category: 'browser',
    accessLevel: 'stranger',
  },

  'strangerzone': {
    id: 'strangerzone',
    name: 'StrangerZone',
    icon: '👤',
    description: 'Talk to random strangers',
    surfaces: { browser: true },
    category: 'browser',
    accessLevel: 'stranger',
  },

  'wealthwisdom': {
    id: 'wealthwisdom',
    name: 'WealthWisdom',
    icon: '💰',
    description: 'Financial advice from experts',
    surfaces: { browser: true },
    category: 'browser',
    accessLevel: 'stranger',
  },

  // -------------------------------------------------------------------------
  // Easter Egg Sites (Unhinged Deep Lore)
  // -------------------------------------------------------------------------

  'popuphell': {
    id: 'popuphell',
    name: 'FREE PRIZES!!!',
    icon: '🎉',
    description: 'YOU ARE THE 1000000th VISITOR!!!',
    surfaces: { browser: true },
    category: 'browser',
    accessLevel: 'stranger',
  },

  'millionpixels': {
    id: 'millionpixels',
    name: 'MillionPixels',
    icon: '🟦',
    description: 'Own a piece of fake internet history',
    surfaces: { browser: true },
    category: 'browser',
    accessLevel: 'stranger',
  },

  'quantumbrewblog': {
    id: 'quantumbrewblog',
    name: 'QuantumBrewBlog',
    icon: '☕',
    description: 'Observing coffee so you don\'t have to',
    surfaces: { browser: true },
    category: 'browser',
    accessLevel: 'stranger',
  },

  'hartwellfiles': {
    id: 'hartwellfiles',
    name: 'Hartwell Files',
    icon: '🏚️',
    description: 'The truth is in there',
    surfaces: { browser: true },
    category: 'browser',
    accessLevel: 'stranger',
  },

  'trustfalltim': {
    id: 'trustfalltim',
    name: 'TrustFallTim.corn',
    icon: '🙆‍♂️',
    description: 'The official unofficial fan archive',
    surfaces: { browser: true },
    category: 'browser',
    accessLevel: 'stranger',
  },

  'onlyfans': {
    id: 'onlyfans',
    name: 'OnlyFans',
    icon: '🌀',
    description: 'Premium fans for enthusiasts. Ceiling fans. Desk fans. What else?',
    surfaces: { browser: true },
    category: 'browser',
    accessLevel: 'stranger',
  },

  'bandsnotintown': {
    id: 'bandsnotintown',
    name: 'BandsNotInTown',
    icon: '🎫',
    description: 'Never see your favorite artists live',
    surfaces: { browser: true },
    category: 'browser',
    accessLevel: 'stranger',
  },

  // -------------------------------------------------------------------------
  // Unhinged Persona Sites
  // -------------------------------------------------------------------------

  'graintruth': {
    id: 'graintruth',
    name: 'GrainTruth',
    icon: '🌾',
    description: 'Dr. Helena Cryptwood\'s grain-based conspiracy archive',
    surfaces: { browser: true },
    category: 'browser',
    accessLevel: 'stranger',
  },

  'benchwatch': {
    id: 'benchwatch',
    name: 'BenchWatch',
    icon: '🪑',
    description: 'Greg Mantooth\'s forensic bench analysis',
    surfaces: { browser: true },
    category: 'browser',
    accessLevel: 'stranger',
  },

  'dominate': {
    id: 'dominate',
    name: 'DOMINATE',
    icon: '💪',
    description: 'Chad Thundercoach\'s high-intensity success system',
    surfaces: { browser: true },
    category: 'browser',
    accessLevel: 'stranger',
  },

  'stationsushi': {
    id: 'stationsushi',
    name: 'Station Sushi Review',
    icon: '🍣',
    description: 'Mildred Gasketsworth\'s gas station sushi reviews',
    surfaces: { browser: true },
    category: 'browser',
    accessLevel: 'stranger',
  },

  'truemoss': {
    id: 'truemoss',
    name: 'TrueMoss',
    icon: '🌿',
    description: 'Agatha Mosswell\'s independent moss research',
    surfaces: { browser: true },
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
// Helper Functions
// ============================================================================

/**
 * Get all apps available on a specific surface
 */
export function getAppsForSurface(surface: AppSurface): AppDefinition[] {
  return Object.values(APP_REGISTRY).filter((app) => app.surfaces[surface]);
}

/**
 * Get all messaging apps
 */
export function getMessagingApps(): AppDefinition[] {
  return Object.values(APP_REGISTRY).filter(
    (app) => app.category === 'messaging' || app.category === 'dating'
  );
}

/**
 * Get apps available for a given access level
 * (Returns apps where the required access level is <= the given level)
 */
export function getAppsForAccessLevel(level: AccessLevel): AppDefinition[] {
  const levelOrder: AccessLevel[] = ['stranger', 'acquaintance', 'friend', 'close_friend', 'partner'];
  const levelIndex = levelOrder.indexOf(level);

  return Object.values(APP_REGISTRY).filter((app) => {
    const appLevelIndex = levelOrder.indexOf(app.accessLevel);
    return appLevelIndex <= levelIndex;
  });
}

/**
 * Check if an NPC can contact player through a specific app based on relationship
 */
export function canContactViaApp(appId: string, relationshipLevel: AccessLevel): boolean {
  const app = APP_REGISTRY[appId];
  if (!app) return false;

  const levelOrder: AccessLevel[] = ['stranger', 'acquaintance', 'friend', 'close_friend', 'partner'];
  const requiredIndex = levelOrder.indexOf(app.accessLevel);
  const actualIndex = levelOrder.indexOf(relationshipLevel);

  return actualIndex >= requiredIndex;
}

/**
 * Get the app definition by ID
 */
export function getApp(appId: string): AppDefinition | undefined {
  return APP_REGISTRY[appId];
}

/**
 * Get all apps in a category
 */
export function getAppsByCategory(category: AppCategory): AppDefinition[] {
  return Object.values(APP_REGISTRY).filter((app) => app.category === category);
}

export default APP_REGISTRY;
