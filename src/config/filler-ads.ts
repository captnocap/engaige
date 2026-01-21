/**
 * Filler Ads Configuration
 *
 * Cross-linking advertisements between fake sites.
 * Each ad targets another site in the browser ecosystem.
 *
 * Ads should feel authentic to each site's context:
 * - News sites get pharma, finance, and real estate ads
 * - Reddit-style sites get sketchy sidebar ads
 * - Imageboards get even sketchier ads
 * - Specialty sites get contextual ads
 */

import { FILLER_SITES } from './filler-sites.js'

// ============================================================================
// Types
// ============================================================================

export interface FillerAd {
  id: string
  /** Site ID to navigate to when clicked */
  targetSiteId: string
  /** Headline text */
  headline: string
  /** Subtext/description */
  subtext?: string
  /** Emoji or icon */
  icon?: string
  /** Background color or gradient */
  background: string
  /** Text color */
  textColor: string
  /** Accent/highlight color */
  accentColor?: string
  /** Style variant */
  style: 'banner' | 'sidebar' | 'native' | 'popup' | 'sketchy'
  /** Tags for filtering which sites should show this ad */
  showOn: string[]
  /** Optional image URL (for future use) */
  imageUrl?: string
  /** Call to action text */
  cta?: string
  /** Whether this ad should look intentionally suspicious */
  isSketchy?: boolean
}

// ============================================================================
// Ad Definitions
// ============================================================================

export const FILLER_ADS: FillerAd[] = [
  // -------------------------------------------------------------------------
  // VitalityRx Ads (Pharmaceutical parody)
  // -------------------------------------------------------------------------
  {
    id: 'vitalityrx-quantumil',
    targetSiteId: 'vitalityrx',
    headline: 'Tired of Quantum Coffee Side Effects?',
    subtext: 'Ask your doctor about QUANTUMIL\u00ae - Now FDA Adjacent!',
    icon: '💊',
    background: 'linear-gradient(135deg, #2563EB 0%, #1d4ed8 100%)',
    textColor: '#ffffff',
    accentColor: '#10B981',
    style: 'banner',
    showOn: ['dailybuzz', 'wikiknow', 'threadit'],
    cta: 'Learn More',
  },
  {
    id: 'vitalityrx-existidol',
    targetSiteId: 'vitalityrx',
    headline: 'EXISTIDOL\u00ae',
    subtext: 'For when existential dread becomes clinically significant',
    icon: '🧠',
    background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)',
    textColor: '#ffffff',
    style: 'sidebar',
    showOn: ['dailybuzz', 'threadit', 'wikiknow'],
    cta: 'See If You Qualify',
  },
  {
    id: 'vitalityrx-scrollzac',
    targetSiteId: 'vitalityrx',
    headline: 'Can\'t Stop Scrolling?',
    subtext: 'SCROLLZAC\u00ae helps 4 out of 5 users close their apps*',
    icon: '📱',
    background: '#1e40af',
    textColor: '#ffffff',
    style: 'native',
    showOn: ['threadit', 'vidtube', 'instasnap'],
    cta: 'Take the Quiz',
  },

  // -------------------------------------------------------------------------
  // NestFinder Ads (Real Estate)
  // -------------------------------------------------------------------------
  {
    id: 'nestfinder-hartwell',
    targetSiteId: 'nestfinder',
    headline: 'Apartments Near The Underground!',
    subtext: 'Studios from $1,847/mo. Includes mysterious noises.',
    icon: '🏠',
    background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
    textColor: '#ffffff',
    style: 'banner',
    showOn: ['dailybuzz', 'threadit', 'bandsnotintown'],
    cta: 'View Listings',
  },
  {
    id: 'nestfinder-hartwell-building',
    targetSiteId: 'nestfinder',
    headline: 'Hartwell Building - Now Leasing!',
    subtext: 'Affordable units. Don\'t ask about floor 7.',
    icon: '🏚️',
    background: '#0f172a',
    textColor: '#ffffff',
    accentColor: '#ef4444',
    style: 'sidebar',
    showOn: ['hartwellfiles', 'dailybuzz', 'bargainbay'],
    cta: 'Apply Now',
    isSketchy: true,
  },
  {
    id: 'nestfinder-deal',
    targetSiteId: 'nestfinder',
    headline: 'Your Dream Home Awaits',
    subtext: 'Find apartments, houses, and rooms that definitely exist.',
    icon: '🔑',
    background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
    textColor: '#ffffff',
    style: 'native',
    showOn: ['wealthwisdom', 'dailybuzz'],
    cta: 'Search Now',
  },

  // -------------------------------------------------------------------------
  // BargainBay Ads (Marketplace)
  // -------------------------------------------------------------------------
  {
    id: 'bargainbay-quantum',
    targetSiteId: 'bargainbay',
    headline: 'Barely Used Quantum Coffee Maker - $500 OBO',
    subtext: '"My wife left me" - Posted 3 hours ago',
    icon: '☕',
    background: '#f8fafc',
    textColor: '#1e293b',
    accentColor: '#0866ff',
    style: 'native',
    showOn: ['threadit', 'dailybuzz', 'quantumbrewblog'],
    cta: 'View Listing',
  },
  {
    id: 'bargainbay-free',
    targetSiteId: 'bargainbay',
    headline: 'FREE: Ex\'s Stuff (Must Go Today)',
    subtext: 'Box of records, signed band poster, regrets',
    icon: '📦',
    background: 'linear-gradient(135deg, #00a400 0%, #008000 100%)',
    textColor: '#ffffff',
    style: 'sidebar',
    showOn: ['threadit', 'forchan', 'bandsnotintown'],
    cta: 'Claim Now',
  },
  {
    id: 'bargainbay-general',
    targetSiteId: 'bargainbay',
    headline: 'Local Deals Near You!',
    subtext: 'Buy. Sell. Maybe Trust.',
    icon: '🏷️',
    background: '#0866ff',
    textColor: '#ffffff',
    style: 'banner',
    showOn: ['dailybuzz', 'wikiknow'],
    cta: 'Browse Listings',
  },

  // -------------------------------------------------------------------------
  // WealthWisdom Ads (Financial Gurus)
  // -------------------------------------------------------------------------
  {
    id: 'wealthwisdom-passive',
    targetSiteId: 'wealthwisdom',
    headline: 'I Make $47,000/Month With This One Trick',
    subtext: 'Financial advisors HATE him',
    icon: '💰',
    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    textColor: '#ffffff',
    style: 'banner',
    showOn: ['dailybuzz', 'vidtube', 'threadit'],
    cta: 'Learn His Secret',
    isSketchy: true,
  },
  {
    id: 'wealthwisdom-manifest',
    targetSiteId: 'wealthwisdom',
    headline: 'Manifest Your Millions',
    subtext: 'Free masterclass from Chad Prosperity III',
    icon: '✨',
    background: 'linear-gradient(135deg, #F59E0B 0%, #d97706 100%)',
    textColor: '#1f2937',
    style: 'sidebar',
    showOn: ['dailybuzz', 'threadit', 'instasnap'],
    cta: 'Start Manifesting',
  },
  {
    id: 'wealthwisdom-crypto',
    targetSiteId: 'wealthwisdom',
    headline: 'Is CornCoin\u2122 the Next Bitcoin?',
    subtext: 'Top analysts say: "Maybe, who knows?"',
    icon: '🌽',
    background: '#0a0f1c',
    textColor: '#e5e7eb',
    accentColor: '#F59E0B',
    style: 'native',
    showOn: ['threadit', 'forchan', 'dailybuzz'],
    cta: 'Read Analysis',
  },

  // -------------------------------------------------------------------------
  // OddsOracle Ads (Betting/Predictions)
  // -------------------------------------------------------------------------
  {
    id: 'oddsoracle-tim',
    targetSiteId: 'oddsoracle',
    headline: 'Will Trust Fall Tim Be Caught?',
    subtext: 'Current odds: 78.5% NO | Bet now!',
    icon: '🎲',
    background: 'linear-gradient(135deg, #8B5CF6 0%, #7c3aed 100%)',
    textColor: '#ffffff',
    style: 'banner',
    showOn: ['trustfalltim', 'threadit', 'bandsnotintown'],
    cta: 'Place Your Bet',
  },
  {
    id: 'oddsoracle-velvet',
    targetSiteId: 'oddsoracle',
    headline: 'Will The Velvet Algorithms Reunite?',
    subtext: 'Market says: 23% YES | High volume!',
    icon: '🎸',
    background: '#0f0a1f',
    textColor: '#e5e7eb',
    accentColor: '#10B981',
    style: 'sidebar',
    showOn: ['bandsnotintown', 'dailybuzz', 'threadit'],
    cta: 'View Market',
  },
  {
    id: 'oddsoracle-general',
    targetSiteId: 'oddsoracle',
    headline: 'Predict Everything. Win Nothing.',
    subtext: 'The prediction market for local chaos',
    icon: '🔮',
    background: 'linear-gradient(135deg, #1a1328 0%, #0f0a1f 100%)',
    textColor: '#e5e7eb',
    style: 'native',
    showOn: ['dailybuzz', 'wealthwisdom', 'forchan'],
    cta: 'Start Predicting',
  },

  // -------------------------------------------------------------------------
  // OnlyFans Ads (The Fan Store)
  // -------------------------------------------------------------------------
  {
    id: 'onlyfans-summer',
    targetSiteId: 'onlyfans',
    headline: 'HOT Fans For Summer! 🔥',
    subtext: 'Ceiling fans, desk fans, tower fans - all premium!',
    icon: '🌀',
    background: 'linear-gradient(135deg, #EC4899 0%, #db2777 100%)',
    textColor: '#ffffff',
    style: 'banner',
    showOn: ['dailybuzz', 'threadit', 'bargainbay'],
    cta: 'Browse Fans',
  },
  {
    id: 'onlyfans-exclusive',
    targetSiteId: 'onlyfans',
    headline: 'Exclusive Fan Content',
    subtext: 'See our most powerful models... of fans',
    icon: '💨',
    background: '#FDF2F8',
    textColor: '#831843',
    style: 'sidebar',
    showOn: ['vitalityrx', 'wikiknow', 'nestfinder'],
    cta: 'View Collection',
  },
  {
    id: 'onlyfans-industrial',
    targetSiteId: 'onlyfans',
    headline: '3000 CFM Industrial Fan',
    subtext: 'The most powerful fan you\'ve ever experienced',
    icon: '🏭',
    background: '#1f2937',
    textColor: '#f9fafb',
    accentColor: '#EC4899',
    style: 'native',
    showOn: ['bargainbay', 'forchan'],
    cta: 'Feel the Power',
  },

  // -------------------------------------------------------------------------
  // QuantumBrewBlog Ads (Coffee Obsession)
  // -------------------------------------------------------------------------
  {
    id: 'quantumbrewblog-truth',
    targetSiteId: 'quantumbrewblog',
    headline: 'The TRUTH About Quantum Coffee',
    subtext: 'One man\'s 847-page investigation',
    icon: '☕',
    background: 'linear-gradient(135deg, #92400E 0%, #78350F 100%)',
    textColor: '#FEF3C7',
    style: 'sidebar',
    showOn: ['dailybuzz', 'threadit', 'wikiknow'],
    cta: 'Read the Blog',
  },
  {
    id: 'quantumbrewblog-martinez',
    targetSiteId: 'quantumbrewblog',
    headline: 'The Martinez Study: A Deep Dive',
    subtext: 'By Derek, who has read it 400 times',
    icon: '📊',
    background: '#FEF7E6',
    textColor: '#78350F',
    style: 'native',
    showOn: ['wikiknow', 'dailybuzz'],
    cta: 'Explore the Data',
  },

  // -------------------------------------------------------------------------
  // TrustFallTim.fan Ads
  // -------------------------------------------------------------------------
  {
    id: 'trustfalltim-stats',
    targetSiteId: 'trustfalltim',
    headline: '2,847 Falls. 0 Catches. 1 Legend.',
    subtext: 'The Official Trust Fall Tim Fan Archive',
    icon: '🙆\u200d♂️',
    background: 'linear-gradient(135deg, #EA580C 0%, #c2410c 100%)',
    textColor: '#ffffff',
    style: 'banner',
    showOn: ['oddsoracle', 'threadit', 'bandsnotintown'],
    cta: 'View Stats',
  },
  {
    id: 'trustfalltim-merch',
    targetSiteId: 'trustfalltim',
    headline: 'NEW: Trust Fall Tim Merch!',
    subtext: '"One Day" T-shirts now available',
    icon: '👕',
    background: '#FFF7ED',
    textColor: '#9A3412',
    style: 'sidebar',
    showOn: ['threadit', 'bargainbay'],
    cta: 'Shop Now',
  },

  // -------------------------------------------------------------------------
  // HartwellFiles Ads (Conspiracy)
  // -------------------------------------------------------------------------
  {
    id: 'hartwellfiles-truth',
    targetSiteId: 'hartwellfiles',
    headline: 'What\'s On Floor 7?',
    subtext: 'They don\'t want you to know. We have documents.',
    icon: '🏚️',
    background: '#0a0a0a',
    textColor: '#fafafa',
    accentColor: '#DC2626',
    style: 'sidebar',
    showOn: ['forchan', 'nestfinder', 'threadit'],
    cta: 'See the Evidence',
    isSketchy: true,
  },
  {
    id: 'hartwellfiles-timeline',
    targetSiteId: 'hartwellfiles',
    headline: 'The Hartwell Timeline: 1987-Present',
    subtext: '47 disappearances. 12 "accidents". 0 investigations.',
    icon: '📋',
    background: 'linear-gradient(135deg, #DC2626 0%, #7F1D1D 100%)',
    textColor: '#ffffff',
    style: 'native',
    showOn: ['forchan', 'dailybuzz'],
    cta: 'View Timeline',
    isSketchy: true,
  },

  // -------------------------------------------------------------------------
  // BandsNotInTown Ads (Concert FOMO)
  // -------------------------------------------------------------------------
  {
    id: 'bandsnotintown-velvet',
    targetSiteId: 'bandsnotintown',
    headline: 'The Velvet Algorithms: 47 Shows',
    subtext: 'None in your city. Ever. Track your FOMO.',
    icon: '🎫',
    background: 'linear-gradient(135deg, #DC2626 0%, #b91c1c 100%)',
    textColor: '#ffffff',
    style: 'banner',
    showOn: ['dailybuzz', 'threadit', 'instasnap'],
    cta: 'Feel the Pain',
  },
  {
    id: 'bandsnotintown-neon',
    targetSiteId: 'bandsnotintown',
    headline: 'Neon Requiem Tour 2026',
    subtext: 'Playing everywhere but here',
    icon: '🎸',
    background: '#1F2937',
    textColor: '#ffffff',
    accentColor: '#DC2626',
    style: 'sidebar',
    showOn: ['threadit', 'vidtube'],
    cta: 'Track Missed Shows',
  },

  // -------------------------------------------------------------------------
  // StrangerZone Ads
  // -------------------------------------------------------------------------
  {
    id: 'strangerzone-bored',
    targetSiteId: 'strangerzone',
    headline: 'Bored? Talk to Strangers!',
    subtext: 'Regret it later. It\'s tradition.',
    icon: '👤',
    background: 'linear-gradient(135deg, #e94560 0%, #16213e 100%)',
    textColor: '#eeeeee',
    style: 'sidebar',
    showOn: ['threadit', 'forchan', 'vidtube'],
    cta: 'Start Chat',
    isSketchy: true,
  },

  // -------------------------------------------------------------------------
  // PopupHell Ads (Intentionally Awful)
  // -------------------------------------------------------------------------
  {
    id: 'popuphell-winner',
    targetSiteId: 'popuphell',
    headline: '🎉 CONGRATULATIONS!!! 🎉',
    subtext: 'You are the 1,000,000th visitor! CLICK HERE!!!',
    icon: '🎁',
    background: 'linear-gradient(135deg, #FF00FF 0%, #00FFFF 50%, #FFFF00 100%)',
    textColor: '#000000',
    style: 'banner',
    showOn: ['forchan', 'bargainbay', 'strangerzone'],
    cta: 'CLAIM PRIZE',
    isSketchy: true,
  },
  {
    id: 'popuphell-virus',
    targetSiteId: 'popuphell',
    headline: '⚠️ YOUR COMPUTER HAS 47 VIRUSES ⚠️',
    subtext: 'Download FREE antivirus NOW before its too late!!!',
    icon: '🦠',
    background: '#ff0000',
    textColor: '#ffffff',
    style: 'sidebar',
    showOn: ['forchan'],
    cta: 'FIX NOW',
    isSketchy: true,
  },

  // -------------------------------------------------------------------------
  // MillionPixels Ads
  // -------------------------------------------------------------------------
  {
    id: 'millionpixels-block',
    targetSiteId: 'millionpixels',
    headline: 'Own a Piece of Fake Internet History',
    subtext: 'Pixel blocks from $1. Immortalize your brand.',
    icon: '🟦',
    background: '#1a1a1a',
    textColor: '#ffffff',
    accentColor: '#FFD700',
    style: 'native',
    showOn: ['dailybuzz', 'wealthwisdom', 'bargainbay'],
    cta: 'Buy Pixels',
  },

  // -------------------------------------------------------------------------
  // VidTube Ads
  // -------------------------------------------------------------------------
  {
    id: 'vidtube-subscribe',
    targetSiteId: 'vidtube',
    headline: 'Watch: "I Tried Quantum Coffee For 30 Days"',
    subtext: '2.4M views | Derek\'s Coffee Journey',
    icon: '▶️',
    background: 'linear-gradient(135deg, #FF0000 0%, #cc0000 100%)',
    textColor: '#ffffff',
    style: 'native',
    showOn: ['dailybuzz', 'threadit', 'quantumbrewblog'],
    cta: 'Watch Now',
  },

  // -------------------------------------------------------------------------
  // ForChan Ads (Maximum Sketch)
  // -------------------------------------------------------------------------
  {
    id: 'forchan-lurk',
    targetSiteId: 'forchan',
    headline: 'the stories posted here are works of fiction',
    subtext: 'only a fool would take anything here as fact',
    icon: '🍀',
    background: '#eef2ff',
    textColor: '#117743',
    style: 'native',
    showOn: ['threadit', 'strangerzone'],
    cta: 'Enter',
    isSketchy: true,
  },
]

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get ads that should appear on a specific site
 */
export function getAdsForSite(siteId: string): FillerAd[] {
  return FILLER_ADS.filter(ad => ad.showOn.includes(siteId))
}

/**
 * Get a random selection of ads for a site
 */
export function getRandomAdsForSite(siteId: string, count: number = 3): FillerAd[] {
  const ads = getAdsForSite(siteId)
  const shuffled = [...ads].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

/**
 * Get ads by style type
 */
export function getAdsByStyle(style: FillerAd['style']): FillerAd[] {
  return FILLER_ADS.filter(ad => ad.style === style)
}

/**
 * Get ads targeting a specific site
 */
export function getAdsTargetingSite(targetSiteId: string): FillerAd[] {
  return FILLER_ADS.filter(ad => ad.targetSiteId === targetSiteId)
}

/**
 * Get the display info for a target site
 */
export function getTargetSiteInfo(targetSiteId: string) {
  const site = Object.values(FILLER_SITES).find(s => s.id === targetSiteId)
  return site || null
}

export default FILLER_ADS
