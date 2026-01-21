/**
 * Filler Sites Configuration
 *
 * Centralized config for all filler content sites (WikiKnow, Threadit, DailyBuzz).
 * Change names here → updates everywhere automatically.
 *
 * When you get a wild hair and want to rename something, just edit this file!
 */

// ============================================================================
// Site Configurations
// ============================================================================

export const FILLER_SITES = {
  wiki: {
    id: 'wikiknow',
    name: 'WikiKnow',
    tagline: 'The free encyclopedia',
    url: 'www.wikiknow.corn',
    icon: '📖',
    description: 'The free encyclopedia that anyone can edit',
    theme: {
      primary: '#0645AD',      // Wikipedia blue links
      secondary: '#36c',       // Wikipedia darker blue
      background: '#f6f6f6',   // Wikipedia grey
      surface: '#ffffff',      // White content
      text: '#202122',         // Wikipedia text
      textMuted: '#72777d',    // Wikipedia muted
      border: '#a2a9b1',       // Wikipedia border
    },
  },

  reddit: {
    id: 'threadit',
    name: 'Threadit',
    tagline: 'The front page of the fake internet',
    url: 'www.threadit.corn',
    icon: '🗣️',
    description: 'Dive into anything',
    theme: {
      primary: '#FF4500',      // Reddit orange
      secondary: '#0079D3',    // Reddit blue
      background: '#DAE0E6',   // Reddit grey bg
      surface: '#ffffff',      // White cards
      text: '#1c1c1c',         // Reddit text
      textMuted: '#7c7c7c',    // Reddit muted
      border: '#ccc',          // Reddit border
      upvote: '#FF4500',       // Upvote orange
      downvote: '#7193FF',     // Downvote blue
    },
  },

  news: {
    id: 'dailybuzz',
    name: 'DailyBuzz',
    tagline: 'All the news that fits',
    url: 'www.dailybuzz.corn',
    icon: '📰',
    description: 'Breaking news, local stories, and everything in between',
    theme: {
      primary: '#c41e3a',      // News red
      secondary: '#1a1a1a',    // Black
      background: '#f4f4f4',   // Light grey
      surface: '#ffffff',      // White
      text: '#1a1a1a',         // Dark text
      textMuted: '#666666',    // Grey text
      border: '#e0e0e0',       // Light border
      accent: '#0066cc',       // Link blue
    },
  },

  video: {
    id: 'vidtube',
    name: 'VidTube',
    tagline: 'Broadcast Yourself',
    url: 'www.vidtube.corn',
    icon: '▶️',
    description: 'Share and watch videos from around the world',
    theme: {
      primary: '#FF0000',      // YouTube red
      secondary: '#f2f2f2',    // Light grey
      background: '#f9f9f9',   // Off-white
      surface: '#ffffff',      // White
      text: '#030303',         // Near black
      textMuted: '#606060',    // Grey
      border: '#e5e5e5',       // Light border
    },
  },

  imageboard: {
    id: 'forchan',
    name: 'ForChan',
    tagline: 'The stories and information posted here are artistic works of fiction',
    url: 'www.forchan.corn',
    icon: '🍀',
    description: 'Anonymous imageboard',
    theme: {
      primary: '#117743',      // 4chan green
      secondary: '#789922',    // Quote green
      background: '#eef2ff',   // Light blue-ish
      surface: '#d6daf0',      // Slightly darker
      text: '#000000',         // Black
      textMuted: '#666666',    // Grey
      border: '#b7c5d9',       // Blue-grey border
      headerBg: '#ADD8E6',     // Light blue header
      headerText: '#800000',   // Maroon
      postBg: '#d6daf0',       // Post background
      replyBg: '#d6daf0',      // Reply background
      greentext: '#789922',    // Greentext color
      quoteLink: '#d00',       // Quote link red
      name: '#117743',         // Name green
      tripcode: '#228854',     // Tripcode green
      subject: '#cc1105',      // Subject red
      postId: '#000080',       // Post ID blue
      inputBg: '#ffffff',      // Input background
      buttonBg: '#e0e0e0',     // Button background
      thumbnailBg: '#eee',     // Thumbnail background
      sticky: '#f00',          // Sticky red
      locked: '#789922',       // Locked green
      boardTitle: '#800000',   // Board title maroon
    },
  },

  pharmacy: {
    id: 'vitalityrx',
    name: 'VitalityRx',
    tagline: 'Medications for the Modern Age',
    url: 'www.vitalityrx.corn',
    icon: '💊',
    description: 'Pharmaceutical solutions for conditions you didn\'t know you had',
    theme: {
      primary: '#2563EB',      // Medical blue
      secondary: '#10B981',    // Green accent
      background: '#f8fafc',   // Light background
      surface: '#ffffff',      // White
      text: '#1e293b',         // Dark slate
      textMuted: '#64748b',    // Slate
      border: '#e2e8f0',       // Light slate border
    },
  },

  realestate: {
    id: 'nestfinder',
    name: 'NestFinder',
    tagline: 'Find Your Perfect Place',
    url: 'www.nestfinder.corn',
    icon: '🏠',
    description: 'Apartments, houses, and rooms for rent and sale',
    theme: {
      primary: '#16a34a',      // Real estate green
      secondary: '#0ea5e9',    // Blue accent
      background: '#f5f5f4',   // Warm grey
      surface: '#ffffff',      // White
      text: '#1c1917',         // Stone dark
      textMuted: '#78716c',    // Stone muted
      border: '#e7e5e4',       // Stone border
    },
  },

  marketplace: {
    id: 'bargainbay',
    name: 'BargainBay',
    tagline: 'Buy. Sell. Maybe Trust.',
    url: 'www.bargainbay.corn',
    icon: '🏷️',
    description: 'Local classifieds and marketplace',
    theme: {
      primary: '#0866ff',      // Facebook-ish blue
      secondary: '#00a400',    // Craigslist green
      background: '#f0f2f5',   // Light grey
      surface: '#ffffff',      // White
      text: '#050505',         // Near black
      textMuted: '#65676b',    // Grey
      border: '#dddfe2',       // Light border
    },
  },

  betting: {
    id: 'oddsoracle',
    name: 'OddsOracle',
    tagline: 'Predict Everything. Win Nothing.',
    url: 'www.oddsoracle.corn',
    icon: '🎲',
    description: 'Prediction markets for local events and absurd outcomes',
    theme: {
      primary: '#8B5CF6',      // Purple
      secondary: '#10B981',    // Green for YES
      background: '#0f0a1f',   // Dark purple bg
      surface: '#1a1328',      // Slightly lighter
      text: '#e5e7eb',         // Light text
      textMuted: '#9ca3af',    // Grey
      border: '#374151',       // Dark border
      yes: '#10B981',          // Green for YES
      no: '#EF4444',           // Red for NO
    },
  },

  strangerzone: {
    id: 'strangerzone',
    name: 'StrangerZone',
    tagline: 'Talk to Strangers. Regret It Later.',
    url: 'www.strangerzone.corn',
    icon: '👤',
    description: 'Random chat with anonymous strangers',
    theme: {
      primary: '#e94560',      // Pink/red
      secondary: '#16213e',    // Dark blue
      background: '#1a1a2e',   // Dark navy
      surface: '#16213e',      // Slightly lighter
      text: '#eeeeee',         // Light text
      textMuted: '#888888',    // Grey
      border: '#0f3460',       // Blue border
    },
  },

  wealthwisdom: {
    id: 'wealthwisdom',
    name: 'WealthWisdom',
    tagline: 'Financial Advice from People Who Definitely Know',
    url: 'www.wealthwisdom.corn',
    icon: '💰',
    description: 'Financial gurus, investment tips, and get-rich-quick schemes',
    theme: {
      primary: '#10B981',      // Green (money)
      secondary: '#F59E0B',    // Gold accent
      background: '#0a0f1c',   // Dark background
      surface: '#1f2937',      // Grey surface
      text: '#e5e7eb',         // Light text
      textMuted: '#9ca3af',    // Grey
      border: '#374151',       // Dark border
    },
  },

  // =========================================================================
  // Unhinged Easter Egg Sites
  // =========================================================================

  popuphell: {
    id: 'popuphell',
    name: 'FREE PRIZES CLICK HERE',
    tagline: 'YOU ARE THE 1000000th VISITOR!!!',
    url: 'www.free-prizes-click-here.corn',
    icon: '🎉',
    description: 'The most obnoxious popup trap site on the fake internet',
    theme: {
      primary: '#FF00FF',      // Magenta
      secondary: '#00FFFF',    // Cyan
      background: 'linear-gradient(135deg, #ff00ff, #00ffff, #ffff00)',
      surface: '#ffffff',
      text: '#000000',
      textMuted: '#666666',
      border: '#000000',
    },
  },

  millionpixels: {
    id: 'millionpixels',
    name: 'MillionPixels',
    tagline: 'Own a piece of fake internet history',
    url: 'www.millionpixels.corn',
    icon: '🟦',
    description: 'The Million Dollar Homepage, but weirder',
    theme: {
      primary: '#FFD700',      // Gold
      secondary: '#1a1a1a',    // Dark
      background: '#1a1a1a',
      surface: '#2a2a2a',
      text: '#ffffff',
      textMuted: '#888888',
      border: '#333333',
    },
  },

  quantumbrewblog: {
    id: 'quantumbrewblog',
    name: 'QuantumBrewBlog',
    tagline: 'Observing Coffee So You Don\'t Have To',
    url: 'www.quantumbrewblog.corn',
    icon: '☕',
    description: 'An obsessive blog about quantum coffee by a man named Derek',
    theme: {
      primary: '#92400E',      // Amber/brown
      secondary: '#FEF3C7',    // Light amber
      background: '#FEF7E6',
      surface: '#ffffff',
      text: '#78350F',
      textMuted: '#A16207',
      border: '#FDE68A',
    },
  },

  hartwellfiles: {
    id: 'hartwellfiles',
    name: 'The Hartwell Files',
    tagline: 'The truth is in there. Floor 7.',
    url: 'www.hartwellfiles.corn',
    icon: '🏚️',
    description: 'Conspiracy theory archive about the mysterious Hartwell Building',
    theme: {
      primary: '#DC2626',      // Red
      secondary: '#7F1D1D',    // Dark red
      background: '#0a0a0a',
      surface: '#1a1a1a',
      text: '#fafafa',
      textMuted: '#a1a1aa',
      border: '#3f3f46',
    },
  },

  trustfalltim: {
    id: 'trustfalltim',
    name: 'TrustFallTim.fan',
    tagline: 'The Official Unofficial Fan Archive',
    url: 'www.trustfalltim.corn',
    icon: '🙆‍♂️',
    description: 'Fan site dedicated to Trust Fall Tim',
    theme: {
      primary: '#EA580C',      // Orange
      secondary: '#FED7AA',    // Light orange
      background: '#FFF7ED',
      surface: '#ffffff',
      text: '#9A3412',
      textMuted: '#C2410C',
      border: '#FDBA74',
    },
  },

  onlyfans: {
    id: 'onlyfans',
    name: 'OnlyFans',
    tagline: 'The #1 Destination for Fan Enthusiasts',
    url: 'www.onlyfans.corn',
    icon: '🌀',
    description: 'Premium ceiling fans, desk fans, and more. What did you think it was?',
    theme: {
      primary: '#EC4899',      // Pink
      secondary: '#FDF2F8',    // Light pink
      background: '#FFF5F7',
      surface: '#ffffff',
      text: '#831843',
      textMuted: '#9D174D',
      border: '#FBCFE8',
    },
  },
} as const;

// ============================================================================
// Type Exports
// ============================================================================

export type FillerSiteKey = keyof typeof FILLER_SITES;
export type FillerSite = typeof FILLER_SITES[FillerSiteKey];

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get all filler site IDs for registration
 */
export function getFillerSiteIds(): string[] {
  return Object.values(FILLER_SITES).map(site => site.id);
}

/**
 * Get site config by ID
 */
export function getFillerSiteById(id: string): FillerSite | undefined {
  return Object.values(FILLER_SITES).find(site => site.id === id);
}

/**
 * Get URL mappings for Browser.tsx
 */
export function getFillerSiteUrls(): Record<string, string> {
  return Object.fromEntries(
    Object.values(FILLER_SITES).map(site => [site.id, site.url])
  );
}

export default FILLER_SITES;
