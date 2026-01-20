/**
 * Dating Site Registry
 *
 * Defines all dating platforms with their themes, features, and niche filters.
 * Allows skinning the same core dating logic with different branding.
 */

export interface DatingSiteDefinition {
  id: string
  name: string
  icon: string
  tagline: string
  description?: string

  // Theming
  theme: {
    primaryColor: string
    accentColor: string
    gradientStart: string
    gradientEnd: string
    textOnPrimary: string
    cardBackground: string
    matchCelebrationEmoji: string
  }

  // UI Style
  browseStyle: 'swipe-cards' | 'grid' | 'list'

  // Niche Filtering - NPCs must match these to appear
  niche?: {
    requiredInterests?: string[]      // NPC must have at least one of these
    requiredTraits?: string[]         // Personality flags NPC must have
    excludeTraits?: string[]          // Personality flags that disqualify
    ageRange?: { min: number; max: number }
    genderFilter?: ('male' | 'female' | 'non-binary' | 'other')[]
  }

  // Features available on this platform
  features: {
    superLikes: boolean
    superLikesPerDay?: number
    iceBreakers: boolean
    iceBreakersPrompts?: string[]
    videoChat: boolean
    verifiedProfiles: boolean
    boostProfile: boolean
    seeWhoLikesYou: boolean
    rewindLastSwipe: boolean
  }

  // Where this dating site is accessible
  surfaces: {
    phone: boolean
    browser: boolean
  }

  // Associated chat app ID (for messaging matches)
  chatAppId?: string
}

/**
 * All dating sites in the game
 */
export const DATING_SITE_REGISTRY: Record<string, DatingSiteDefinition> = {
  // ============================================================================
  // Mainstream Dating Apps
  // ============================================================================

  spark: {
    id: 'spark',
    name: 'Spark',
    icon: '🔥',
    tagline: 'Ignite a connection',
    description: 'The #1 dating app. Swipe right to like, left to pass.',

    theme: {
      primaryColor: '#FE3C72',
      accentColor: '#FF6B6B',
      gradientStart: '#FE3C72',
      gradientEnd: '#FF8C5A',
      textOnPrimary: '#FFFFFF',
      cardBackground: '#FFFFFF',
      matchCelebrationEmoji: '🔥',
    },

    browseStyle: 'swipe-cards',

    features: {
      superLikes: true,
      superLikesPerDay: 1,
      iceBreakers: false,
      videoChat: false,
      verifiedProfiles: true,
      boostProfile: true,
      seeWhoLikesYou: false, // Premium feature
      rewindLastSwipe: false, // Premium feature
    },

    surfaces: {
      phone: true,
      browser: false,
    },

    chatAppId: 'spark-chat',
  },

  'myface-dating': {
    id: 'myface-dating',
    name: 'MyFace Dating',
    icon: '💕',
    tagline: 'Connect with people you may know',
    description: 'Find love among your extended network.',

    theme: {
      primaryColor: '#FF6600',
      accentColor: '#003366',
      gradientStart: '#FF6600',
      gradientEnd: '#FF8533',
      textOnPrimary: '#FFFFFF',
      cardBackground: '#FFFFFF',
      matchCelebrationEmoji: '💕',
    },

    browseStyle: 'grid',

    features: {
      superLikes: false,
      iceBreakers: true,
      iceBreakersPrompts: [
        "What's your favorite memory?",
        "If you could travel anywhere, where would it be?",
        "What song is stuck in your head right now?",
        "What's your ideal weekend look like?",
      ],
      videoChat: false,
      verifiedProfiles: false,
      boostProfile: false,
      seeWhoLikesYou: true, // Free on MyFace
      rewindLastSwipe: false,
    },

    surfaces: {
      phone: false,
      browser: true, // Built into MyFace site
    },

    chatAppId: 'myface-chat',
  },

  // ============================================================================
  // Niche Dating Sites
  // ============================================================================

  farmersonly: {
    id: 'farmersonly',
    name: 'FarmersOnly',
    icon: '🌾',
    tagline: "City folks just don't get it",
    description: 'Dating for those who love the rural life.',

    theme: {
      primaryColor: '#8B7355',
      accentColor: '#6B8E23',
      gradientStart: '#8B7355',
      gradientEnd: '#A0522D',
      textOnPrimary: '#FFFFFF',
      cardBackground: '#FFF8DC',
      matchCelebrationEmoji: '🤠',
    },

    browseStyle: 'list',

    niche: {
      requiredInterests: ['farming', 'outdoors', 'animals', 'nature', 'hiking', 'gardening', 'horses'],
    },

    features: {
      superLikes: false,
      iceBreakers: true,
      iceBreakersPrompts: [
        "What's your favorite thing about country living?",
        "Do you have any animals?",
        "Early bird or night owl?",
        "What's your favorite season on the farm?",
      ],
      videoChat: false,
      verifiedProfiles: false,
      boostProfile: false,
      seeWhoLikesYou: true,
      rewindLastSwipe: false,
    },

    surfaces: {
      phone: true,
      browser: true,
    },

    chatAppId: 'farmersonly-chat',
  },

  christianconnect: {
    id: 'christianconnect',
    name: 'ChristianConnect',
    icon: '✝️',
    tagline: 'Faith-based connections',
    description: 'Find someone who shares your faith.',

    theme: {
      primaryColor: '#4A90D9',
      accentColor: '#7B68EE',
      gradientStart: '#4A90D9',
      gradientEnd: '#6CA6CD',
      textOnPrimary: '#FFFFFF',
      cardBackground: '#F0F8FF',
      matchCelebrationEmoji: '🙏',
    },

    browseStyle: 'grid',

    niche: {
      requiredInterests: ['faith', 'church', 'spirituality', 'volunteering', 'community'],
    },

    features: {
      superLikes: false,
      iceBreakers: true,
      iceBreakersPrompts: [
        "What does faith mean to you?",
        "What's your favorite Bible verse?",
        "How do you spend your Sundays?",
        "What are you most grateful for?",
      ],
      videoChat: true,
      verifiedProfiles: true,
      boostProfile: false,
      seeWhoLikesYou: true,
      rewindLastSwipe: false,
    },

    surfaces: {
      phone: true,
      browser: true,
    },

    chatAppId: 'christianconnect-chat',
  },

  gamercrush: {
    id: 'gamercrush',
    name: 'GamerCrush',
    icon: '🎮',
    tagline: 'Find your player 2',
    description: 'Dating for gamers, by gamers.',

    theme: {
      primaryColor: '#9146FF',
      accentColor: '#00FF7F',
      gradientStart: '#9146FF',
      gradientEnd: '#6441A5',
      textOnPrimary: '#FFFFFF',
      cardBackground: '#1A1A2E',
      matchCelebrationEmoji: '🎮',
    },

    browseStyle: 'swipe-cards',

    niche: {
      requiredInterests: ['gaming', 'video games', 'esports', 'streaming', 'anime', 'comics', 'board games'],
    },

    features: {
      superLikes: true,
      superLikesPerDay: 3,
      iceBreakers: true,
      iceBreakersPrompts: [
        "What game are you playing right now?",
        "Console, PC, or both?",
        "What's your all-time favorite game?",
        "Co-op or competitive?",
      ],
      videoChat: true,
      verifiedProfiles: false,
      boostProfile: true,
      seeWhoLikesYou: false,
      rewindLastSwipe: true,
    },

    surfaces: {
      phone: true,
      browser: true,
    },

    chatAppId: 'gamercrush-chat',
  },
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get a dating site by ID
 */
export function getDatingSite(siteId: string): DatingSiteDefinition | undefined {
  return DATING_SITE_REGISTRY[siteId]
}

/**
 * Get all dating sites
 */
export function getAllDatingSites(): DatingSiteDefinition[] {
  return Object.values(DATING_SITE_REGISTRY)
}

/**
 * Get dating sites available on a specific surface
 */
export function getDatingSitesForSurface(surface: 'phone' | 'browser'): DatingSiteDefinition[] {
  return Object.values(DATING_SITE_REGISTRY).filter(site => site.surfaces[surface])
}

/**
 * Check if an NPC matches a dating site's niche requirements
 */
export function npcMatchesSiteNiche(
  npc: {
    interests?: string[]
    personality?: { traits?: Record<string, boolean> }
    age?: number
    gender?: string
  },
  site: DatingSiteDefinition
): boolean {
  if (!site.niche) return true // No niche = everyone qualifies

  const { requiredInterests, requiredTraits, excludeTraits, ageRange, genderFilter } = site.niche

  // Check required interests (must have at least one)
  if (requiredInterests && requiredInterests.length > 0) {
    const npcInterests = npc.interests?.map(i => i.toLowerCase()) || []
    const hasRequiredInterest = requiredInterests.some(ri =>
      npcInterests.some(ni => ni.includes(ri.toLowerCase()) || ri.toLowerCase().includes(ni))
    )
    if (!hasRequiredInterest) return false
  }

  // Check required traits
  if (requiredTraits && requiredTraits.length > 0) {
    const traits = npc.personality?.traits || {}
    const hasRequiredTrait = requiredTraits.some(t => traits[t])
    if (!hasRequiredTrait) return false
  }

  // Check excluded traits
  if (excludeTraits && excludeTraits.length > 0) {
    const traits = npc.personality?.traits || {}
    const hasExcludedTrait = excludeTraits.some(t => traits[t])
    if (hasExcludedTrait) return false
  }

  // Check age range
  if (ageRange && npc.age) {
    if (npc.age < ageRange.min || npc.age > ageRange.max) return false
  }

  // Check gender filter
  if (genderFilter && genderFilter.length > 0 && npc.gender) {
    if (!genderFilter.includes(npc.gender as 'male' | 'female' | 'non-binary' | 'other')) {
      return false
    }
  }

  return true
}

/**
 * Get dating sites an NPC qualifies for
 */
export function getDatingSitesForNPC(npc: {
  interests?: string[]
  personality?: { traits?: Record<string, boolean> }
  age?: number
  gender?: string
}): DatingSiteDefinition[] {
  return Object.values(DATING_SITE_REGISTRY).filter(site => npcMatchesSiteNiche(npc, site))
}
