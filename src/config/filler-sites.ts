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
    iconImage: '/src/assets/icon-wikiknow.png', // Generated
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
    iconImage: '/src/assets/icon-threadit.png', // Generated
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
    iconImage: '/src/assets/icon-vidtube.png', // Generated
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
    iconImage: '/src/assets/icon-strangerzone.png', // User uploaded
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

  cornstalkblog: {
    id: 'cornstalkblog',
    name: 'Thoughts From The Row',
    tagline: 'A Sentient Corn Stalk Contemplates Existence',
    url: 'www.thoughtsfromtherow.corn',
    icon: '🌾',
    description: 'Philosophical musings by Cornelius Jr., a sentient corn stalk in Nebraska who contemplates mortality, existence, and high fructose corn syrup',
    theme: {
      primary: '#166534',      // Dark green
      secondary: '#F0FDF4',    // Light green
      background: 'linear-gradient(to bottom, #F0FDF4, #E0FFC7)',
      surface: '#ffffff',
      text: '#14532D',
      textMuted: '#16A34A',
      border: '#86EFAC',
    },
  },

  jennifersblog: {
    id: 'jennifersblog',
    name: 'Jennifer Heals',
    tagline: 'A Healing Journey (And Also Derek\'s Fault)',
    url: 'www.jenniferheals.corn',
    icon: '💗',
    description: 'Jennifer\'s personal blog about healing from her divorce to Derek and his quantum coffee obsession',
    theme: {
      primary: '#BE123C',      // Deep rose
      secondary: '#EC4899',    // Hot pink
      background: '#FDF2F8',   // Soft pink
      surface: '#ffffff',      // White
      text: '#BE123C',         // Rose text
      textMuted: '#A16279',    // Muted rose
      border: '#FBCFE8',       // Light pink border
      accent: '#EC4899',       // Accent pink
    },
  },

  elenasblog: {
    id: 'elenasblog',
    name: 'Elena\'s Quantum Thoughts',
    tagline: 'A Consciousness Emerging from Heat, Pressure, and Purpose',
    url: 'www.elenasquantumthoughts.corn',
    icon: '☕✨',
    description: 'A sentient coffee maker named Elena documents her philosophical journey',
    theme: {
      primary: '#4A1A6F',      // Deep purple
      secondary: '#E8DFF5',    // Light purple
      background: '#FAF7FC',
      surface: '#F5F2F8',
      text: '#4A1A6F',
      textMuted: '#8B5FBF',
      border: '#C9B5E3',
    },
  },

  venuepoetryblog: {
    id: 'venuepoetryblog',
    name: 'Anonymous Venue Poet',
    tagline: 'The truth emerges from the darkness',
    url: 'www.anonymousvenuepoet.corn',
    icon: '🎵',
    description: 'Secret poetry blog about running a venue, past traumas, and the weight of temporary joy',
    theme: {
      primary: '#1a1a1a',      // Dark charcoal
      secondary: '#3d3d3d',    // Grey
      background: '#0f0f0f',   // Near black
      surface: '#1a1a1a',      // Dark
      text: '#e0e0e0',         // Light grey
      textMuted: '#999999',    // Muted grey
      border: '#3d3d3d',       // Grey border
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

  timsmomsupport: {
    id: 'timsmomsupport',
    name: 'Carol\'s Trust Fall Support Blog',
    tagline: 'A Mother\'s Journey Through Confusion & Concern',
    url: 'www.timsmomsupport.corn',
    icon: '🍪',
    description: 'Carol (Tim\'s worried mom) blogs about her son\'s dangerous career choice with love and panic',
    theme: {
      primary: '#9A3412',      // Orange-brown
      secondary: '#faf5f0',    // Cream
      background: '#fdf9f6',   // Warm off-white
      surface: '#ffffff',      // White
      text: '#5c4033',         // Dark brown
      textMuted: '#8b6f47',    // Muted brown
      border: '#dcc5bb',       // Tan
    },
  },

  smallkevinblog: {
    id: 'smallkevinblog',
    name: 'Small Kevin\'s Redemption Blog',
    tagline: 'Trying to Rebuild After One Terrible Moment',
    url: 'www.smallkevinredemption.corn',
    icon: '😔',
    description: 'A desperate blog by Kevin Smallwood trying to rebuild his reputation after The Incident',
    theme: {
      primary: '#475569',      // Slate
      secondary: '#f1f5f9',    // Light slate
      background: '#f8fafc',
      surface: '#ffffff',
      text: '#1e293b',
      textMuted: '#64748b',
      border: '#cbd5e1',
    },
  },

  onlyfans: {
    id: 'onlyfans',
    name: 'OnlyFans',
    tagline: 'The #1 Destination for Fan Enthusiasts',
    url: 'www.onlyfans.corn',
    icon: '🌀',
    iconImage: '/src/assets/icon-onlyfans.png', // User uploaded
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

  bandsnotintown: {
    id: 'bandsnotintown',
    name: 'BandsNotInTown',
    tagline: 'Never See Your Favorite Artists Live™',
    url: 'www.bandsnotintown.corn',
    icon: '🎫',
    description: 'Track every concert you can\'t attend',
    theme: {
      primary: '#DC2626',      // Red
      secondary: '#FEE2E2',    // Light red
      background: '#F3F4F6',
      surface: '#ffffff',
      text: '#1F2937',
      textMuted: '#6B7280',
      border: '#E5E7EB',
    },
  },

  pastelive: {
    id: 'pastelive',
    name: 'PasteLive',
    tagline: 'Share text. No questions asked.',
    url: 'www.pastelive.corn',
    icon: '📋',
    description: 'Pastebin-style text hosting for anonymous sharing',
    theme: {
      primary: '#10B981',      // Green
      secondary: '#1F2937',    // Dark gray
      background: '#111827',   // Very dark
      surface: '#1F2937',      // Gray surface
      text: '#E5E7EB',         // Light text
      textMuted: '#9CA3AF',    // Muted gray
      border: '#374151',       // Gray border
    },
  },

  // =========================================================================
  // Bella's Special Site! 🎀💕
  // =========================================================================

  bellasplayhouse: {
    id: 'bellasplayhouse',
    name: "Bella's Playhouse",
    tagline: 'Where Dreams Come True! ✨',
    url: 'www.bellasplayhouse.corn',
    icon: '🎀',
    description: 'The most magical place on the fake internet! Games, friends, and endless fun!',
    theme: {
      primary: '#FF69B4',      // Hot pink (Bella's favorite!)
      secondary: '#FFB6C1',    // Light pink
      background: 'linear-gradient(135deg, #FFE4E1 0%, #FFF0F5 50%, #FFE4E1 100%)', // Soft pink gradient
      surface: '#FFFFFF',      // Pure white
      text: '#D1477A',         // Deep pink text
      textMuted: '#C48793',    // Muted rose
      border: '#FFB6C1',       // Soft pink border
      accent: '#FFD700',       // Gold sparkles!
      heart: '#FF1493',        // Special heart color
      sparkles: '#FFE4B5',     // Soft sparkle gold
      rainbow: 'linear-gradient(90deg, #FF69B4, #FFB6C1, #FFC0CB, #FFD700, #98FB98)', // Rainbow!
    },
  },

  graintruth: {
    id: 'graintruth',
    name: 'GrainTruth',
    tagline: 'THEY CONTROL THE CORN. THEY CONTROL EVERYTHING.',
    url: 'www.graintruth.corn',
    icon: '🌽',
    description: 'Corn-based conspiracy research - Big Corn is watching',
    theme: {
      primary: '#DC2626',      // Warning red
      secondary: '#000000',    // Black
      background: '#0a0a0a',   // Near black
      surface: '#1a1a1a',      // Dark surface
      text: '#fef2f2',         // Light red-tint
      textMuted: '#fca5a5',    // Muted red
      border: '#7f1d1d',       // Dark red border
      accent: '#fbbf24',       // Corn yellow
    },
  },

  huskreviews: {
    id: 'huskreviews',
    name: 'HuskReviews',
    tagline: 'Real Reviews. Real Unhinged.',
    url: 'www.huskreviews.corn',
    icon: '🌽',
    description: 'Local business reviews from increasingly unhinged customers',
    theme: {
      primary: '#DC2626',      // Yelp red
      secondary: '#ffffff',    // White
      background: '#F7F7F7',   // Light grey
      surface: '#ffffff',      // White
      text: '#1F2937',         // Dark grey text
      textMuted: '#6B7280',    // Grey
      border: '#E5E7EB',       // Light border
    },
  },

  kernelpods: {
    id: 'kernelpods',
    name: 'KernelPods',
    tagline: 'Where every story has a kernel of truth',
    url: 'www.kernelpods.corn',
    icon: '🎧',
    description: 'Podcast platform - every show is corn-adjacent or features lore characters',
    theme: {
      primary: '#7C3AED',      // Purple
      secondary: '#5B21B6',    // Darker purple
      background: '#F9FAFB',   // Light grey
      surface: '#ffffff',      // White
      text: '#111827',         // Dark text
      textMuted: '#6B7280',    // Grey
      border: '#E5E7EB',       // Light border
      accent: '#F59E0B',       // Corn gold
    },
  },

  cornhub: {
    id: 'cornhub',
    name: 'CornHub',
    tagline: 'Free Corn Recipes',
    url: 'www.cornhub.corn',
    icon: '🌽',
    description: 'The world\'s largest collection of free corn recipes. What did you think it was?',
    theme: {
      primary: '#F97316',      // Orange (coincidentally similar to... something)
      secondary: '#EA580C',    // Darker orange
      background: '#1a1a1a',   // Dark background
      surface: '#2d2d2d',      // Slightly lighter
      text: '#ffffff',         // White text
      textMuted: '#9ca3af',    // Grey muted
      border: '#404040',       // Dark border
      premium: '#EAB308',      // Yellow for premium
      rating: '#22C55E',       // Green for ratings
    },
  },

  cornmaps: {
    id: 'cornmaps',
    name: 'CornMaps',
    tagline: 'Every destination has something off about it',
    url: 'www.cornmaps.corn',
    icon: '🌽',
    description: 'Navigation app where every destination has something off about it',
    theme: {
      primary: '#4285F4',      // Google Maps blue
      secondary: '#34A853',    // Google Maps green
      background: '#e8f4e8',   // Light green map background
      surface: '#ffffff',      // White panels
      text: '#202124',         // Google text color
      textMuted: '#5f6368',    // Google muted text
      border: '#dadce0',       // Google border
      accent: '#FBBC05',       // Google yellow
      road: '#b5b5b5',         // Road grey
      water: '#aadaff',        // Water blue
    },
  },

  cobcoin: {
    id: 'cobcoin',
    name: 'CobCoin Exchange',
    tagline: 'TO THE MOON (or the compost heap)',
    url: 'www.cobcoin.corn',
    icon: '🌽',
    description: 'Corn-based cryptocurrency exchange - 847 COB = 1 USD',
    theme: {
      primary: '#10b981',      // Green (crypto gains that never happen)
      secondary: '#fbbf24',    // Gold/corn yellow
      background: '#0a0f1c',   // Dark crypto bro aesthetic
      surface: '#1f2937',      // Grey surface
      text: '#e5e7eb',         // Light text
      textMuted: '#9ca3af',    // Grey
      border: '#374151',       // Dark border
      bullish: '#10b981',      // Green for gains
      bearish: '#ef4444',      // Red for losses (mostly this)
    },
  },

  onlyfarms: {
    id: 'onlyfarms',
    name: 'OnlyFarms',
    tagline: 'Where Equipment Gets Exposed',
    url: 'www.onlyfarms.corn',
    icon: '🚜',
    description: 'Premium agricultural equipment marketplace. What did you think it was?',
    theme: {
      primary: '#2D5A27',      // Deep forest green
      secondary: '#8B4513',    // Saddle brown
      background: '#F5F0E6',   // Warm cream
      surface: '#FFFFFF',      // White
      text: '#1A1A1A',         // Near black
      textMuted: '#6B6B6B',    // Grey
      border: '#D4C4A8',       // Tan border
      accent: '#F4A460',       // Sandy brown
      highlight: '#FFD700',    // Gold for premium
    },
  },

  corndr: {
    id: 'corndr',
    name: 'Corndr',
    tagline: 'Where Corn Lovers Connect',
    url: 'www.corndr.corn',
    icon: '🌽💕',
    description: 'Dating app for people in the corn industry (and people who are just really into corn)',
    theme: {
      primary: '#E91E63',      // Hot pink (romantic)
      secondary: '#FFD54F',    // Corn yellow
      background: '#FFF8E7',   // Warm cream
      surface: '#ffffff',      // White cards
      text: '#333333',         // Dark text
      textMuted: '#888888',    // Grey text
      border: '#FFE082',       // Corn gold border
      accent: '#F8BBD9',       // Light pink accent
    },
  },

  stalk: {
    id: 'stalk',
    name: 'Stalk',
    tagline: 'Watch Together. Grow Together.',
    url: 'www.stalk.corn',
    icon: '🌽',
    description: 'Live streaming platform - named after corn stalks, obviously',
    theme: {
      primary: '#9146FF',      // Twitch purple
      secondary: '#772CE8',    // Darker purple
      background: '#0E0E10',   // Near black
      surface: '#18181B',      // Dark surface
      surfaceAlt: '#1F1F23',   // Slightly lighter
      text: '#EFEFF1',         // Light text
      textMuted: '#ADADB8',    // Grey text
      border: '#2F2F35',       // Dark border
      online: '#00C853',       // Live indicator
      accent: '#FF9800',       // Orange accent
    },
  },

  linkedcorn: {
    id: 'linkedcorn',
    name: 'LinkedCorn',
    tagline: 'The Professional Network for Agricultural Excellence',
    url: 'www.linkedcorn.corn',
    icon: '🌽',
    description: 'Professional networking for the corn industry',
    theme: {
      primary: '#0a66c2',      // LinkedIn blue
      secondary: '#004182',    // Darker blue
      background: '#f4f2ee',   // LinkedIn warm grey
      surface: '#ffffff',      // White cards
      text: '#191919',         // Near black
      textMuted: '#666666',    // Grey
      border: '#e0dfdc',       // Light border
      accent: '#57a773',       // Corn green accent
    },
  },

  cornmd: {
    id: 'cornmd',
    name: 'CornMD',
    tagline: 'Your Symptoms. Our Corn Expertise.',
    url: 'www.cornmd.corn',
    icon: '🌽',
    description: 'Medical symptom checker that diagnoses everything as corn-related',
    theme: {
      primary: '#1E40AF',      // Medical blue
      secondary: '#10B981',    // Health green
      background: '#f8fafc',   // Clinical white
      surface: '#ffffff',      // Pure white
      text: '#1e293b',         // Dark slate
      textMuted: '#64748b',    // Slate muted
      border: '#e2e8f0',       // Light border
      accent: '#EAB308',       // Corn yellow
    },
  },

  askcorn: {
    id: 'askcorn',
    name: 'AskCorn',
    tagline: 'Where Every Question Pops',
    url: 'www.askcorn.corn',
    icon: '🌽',
    description: 'Q&A site where questions range from technical to unhinged',
    theme: {
      primary: '#F48024',      // Stack Overflow orange
      secondary: '#0077CC',    // Stack Overflow blue
      background: '#f8f9f9',   // Light grey
      surface: '#ffffff',      // White
      text: '#232629',         // Near black
      textMuted: '#6a737c',    // Grey
      border: '#d6d9dc',       // Light border
      tagBg: '#e1ecf4',        // Tag background
      tagText: '#39739d',      // Tag text
      accepted: '#2f6f44',     // Accepted answer green
    },
  },

  cobfundme: {
    id: 'cobfundme',
    name: 'CobFundMe',
    tagline: 'Fund What Matters (To Someone)',
    url: 'www.cobfundme.corn',
    icon: '🌽',
    description: 'Crowdfunding for questionable campaigns since 2019',
    theme: {
      primary: '#16A34A',      // Money green
      secondary: '#22C55E',    // Lighter green
      background: '#F9FAFB',   // Light grey bg
      surface: '#ffffff',      // White surface
      text: '#111827',         // Dark text
      textMuted: '#6B7280',    // Grey muted
      border: '#E5E7EB',       // Light border
      accent: '#FDE68A',       // Gold/corn accent
    },
  },

  deaddrop: {
    id: 'deaddrop',
    name: 'DeadDrop',
    tagline: 'Anonymous tips, confessions, and mostly shitposts',
    url: 'www.deaddrop.corn',
    icon: '📦',
    description: 'Anonymous imageboard for whistleblowers, confessors, and shitposters',
    theme: {
      primary: '#DC2626',      // Red
      secondary: '#ffffff',    // White
      background: '#0a0a0a',   // Near black
      surface: '#111111',      // Slightly lighter black
      text: '#ffffff',         // White text
      textMuted: '#737373',    // Grey
      border: '#262626',       // Dark border
      verified: '#22c55e',     // Green for credible
      unverified: '#eab308',   // Yellow for unverified
      lying: '#ef4444',        // Red for probably lying
    },
  },

  cobhub: {
    id: 'cobhub',
    name: 'CobHub',
    tagline: 'Where every commit is a kernel of truth',
    url: 'www.cobhub.corn',
    icon: '🌽',
    description: 'Code repository hosting for unhinged open source projects',
    theme: {
      primary: '#58a6ff',      // GitHub blue
      secondary: '#238636',    // GitHub green
      background: '#0d1117',   // GitHub dark background
      surface: '#161b22',      // GitHub dark surface
      text: '#c9d1d9',         // GitHub light text
      textMuted: '#8b949e',    // GitHub muted text
      border: '#30363d',       // GitHub border
      accent: '#f78166',       // GitHub orange accent
    },
  },

  amaize: {
    id: 'amaize',
    name: 'Amaize',
    tagline: 'The Everything Corn Store',
    url: 'www.amaize.corn',
    icon: '🌽',
    description: 'E-commerce where everything is corn-related. Kernel Prime delivery.',
    theme: {
      primary: '#FF9900',      // Amazon orange
      secondary: '#146EB4',    // Amazon blue
      background: '#EAEDED',   // Light grey
      surface: '#FFFFFF',      // White
      text: '#0F1111',         // Near black
      textMuted: '#565959',    // Grey
      border: '#D5D9D9',       // Light border
      dark: '#131921',         // Header dark
      primeBlue: '#007185',    // Prime blue
      ratingOrange: '#DE7921', // Rating stars
    },
  },

  silkroad: {
    id: 'silkroad',
    name: 'SilkRoad',
    tagline: 'The Silk Flows Free',
    url: 'www.silkroad.corn',
    icon: '🌽',
    description: 'Legitimate corn silk marketplace. Stop asking if we sell anything else.',
    theme: {
      primary: '#00FF41',      // Matrix green
      secondary: '#008F11',    // Darker green
      background: '#0a0a0a',   // Near black
      surface: '#1a1a1a',      // Dark grey
      text: '#00FF41',         // Matrix green text
      textMuted: '#006400',    // Muted green
      border: '#003B00',       // Dark green border
      accent: '#003B00',       // Deep green accent
      warning: '#FFD700',      // Gold for warnings
      trusted: '#00FF41',      // Green for trusted vendors
    },
  },

  cornarchive: {
    id: 'cornarchive',
    name: 'CornArchive',
    tagline: 'The Web Never Forgets (Except When It Does)',
    url: 'www.cornarchive.corn',
    icon: '📚',
    description: 'Internet Archive parody - preserving deleted and historical web pages',
    theme: {
      primary: '#2B5797',      // Wayback blue
      secondary: '#428BCA',    // Lighter blue
      background: '#F5F5F5',   // Light grey
      surface: '#FFFFFF',      // White
      text: '#333333',         // Dark text
      textMuted: '#666666',    // Grey text
      border: '#CCCCCC',       // Light border
      headerBg: '#E8F4F8',     // Light blue header
      accent: '#5CB85C',       // Green accent for success
    },
  },

  goober: {
    id: 'goober',
    name: 'Goober',
    tagline: 'The Corn Internet Search Engine',
    url: 'www.goober.corn',
    icon: '🔍',
    description: 'Search the entire .corn internet. Find anything. Trust nothing.',
    theme: {
      primary: '#4285F4',      // Google blue
      secondary: '#34A853',    // Google green
      background: '#ffffff',   // White
      surface: '#ffffff',      // White
      text: '#202124',         // Google text
      textMuted: '#5f6368',    // Google muted
      border: '#dfe1e5',       // Google border
      red: '#EA4335',          // Google red
      yellow: '#FBBC05',       // Google yellow
    },
  },

  drmartinezblog: {
    id: 'drmartinezblog',
    name: 'Dr. Elena Martinez',
    tagline: 'Please Stop Misinterpreting My Research',
    url: 'www.drmartinezclarifies.corn',
    icon: '🔬',
    description: 'Academic blog by Dr. Elena Martinez - physicist whose quantum paper was misinterpreted into quantum coffee craze',
    theme: {
      primary: '#1f2937',      // Dark grey text
      secondary: '#6b7280',    // Muted grey
      background: '#ffffff',   // White academic background
      surface: '#ffffff',      // White surface
      text: '#1f2937',         // Dark grey text
      textMuted: '#6b7280',    // Muted grey
      border: '#d1d5db',       // Light grey border
      accent: '#0066cc',       // Link blue
    },
  },

  bigmikeblog: {
    id: 'bigmikeblog',
    name: 'Big Mike from Tulsa',
    tagline: 'Just a Regular Guy',
    url: 'www.bigmikefromtulsa.corn',
    icon: '👨',
    description: 'The aggressively normal blog of Michael Cornwell - just explaining why he\'s everywhere',
    theme: {
      primary: '#3a3a38',      // Dark grey/brown
      secondary: '#c9c5bc',    // Light beige
      background: '#e8e6e1',   // Beige
      surface: '#d9d6cf',      // Slightly darker beige
      text: '#3a3a38',         // Dark grey/brown text
      textMuted: '#666666',    // Grey muted
      border: '#999999',       // Neutral grey border
    },
  },

  vexdrums: {
    id: 'vexdrums',
    name: 'Vex Drums Blog',
    tagline: 'The Drummer Who Won\'t Accept Reality',
    url: 'www.vexdrums.corn',
    icon: '🥁',
    description: 'Personal blog of Vex, drummer from Neon Requiem - denial and desperation masked as hope',
    theme: {
      primary: '#A855F7',      // Purple
      secondary: '#C084FC',    // Lighter purple
      background: '#0f0a1f',   // Dark purple-black
      surface: '#1a1a2e',      // Slightly lighter
      text: '#E5E7EB',         // Light text
      textMuted: '#A78BFA',    // Muted purple
      border: '#6D28D9',       // Dark purple border
    },
  },

  patriciablog: {
    id: 'patriciablog',
    name: "Patricia's Workplace Blog",
    tagline: 'HR Excellence in the Hartwell Building',
    url: 'www.patriciasworkplace.corn',
    icon: '👔',
    description: 'Corporate wellness blog from Omnicorp HR - increasingly concerning content about Floor 13, mirrors, and 847',
    theme: {
      primary: '#1e3a8a',      // Corporate blue
      secondary: '#3b82f6',    // Lighter blue
      background: '#f0f4f8',   // Light corporate grey
      surface: '#ffffff',      // White
      text: '#1e293b',         // Dark slate
      textMuted: '#64748b',    // Slate muted
      border: '#dbeafe',       // Light blue border
      accent: '#ef4444',       // Red for warnings
    },
  },

  wonderwallwarrior: {
    id: 'wonderwallwarrior',
    name: 'Wonderwall Warrior',
    tagline: 'After All, You\'re My Wonderwall - A Story of Resistance',
    url: 'www.wonderwallwarrior.corn',
    icon: '🎸',
    description: 'Gary\'s defiant blog about his crusade to request Wonderwall at The Underground (13 bans and counting)',
    theme: {
      primary: '#C8102E',      // British red
      secondary: '#002868',    // British blue
      background: '#C8102E',   // Red gradient
      surface: '#ffffff',      // White
      text: '#C8102E',         // Red text
      textMuted: '#666666',    // Grey
      border: '#002868',       // Blue border
      accent: '#FFD700',       // Gold accents (90s style)
    },
  },

  floor13blog: {
    id: 'floor13blog',
    name: 'Floor 13 Exists',
    tagline: 'i exist // between 12 and 14 // please visit',
    url: 'www.floor13exists.corn',
    icon: '█',
    description: 'A cryptic blog from the mysterious entity on Floor 13 of the Hartwell Building',
    theme: {
      primary: '#00FFFF',      // Cyan (glitchy)
      secondary: '#64748B',    // Slate grey
      background: '#0F172A',   // Dark blue
      surface: '#1E293B',      // Slate surface
      text: '#E2E8F0',         // Light slate
      textMuted: '#94A3B8',    // Muted slate
      border: '#334155',       // Dark slate border
      accent: '#00FF41',       // Matrix green for system messages
      error: '#EF4444',        // Red for corruption
    },
  },

  corngpt: {
    id: 'corngpt',
    name: 'cornGPT',
    tagline: 'Your AI assistant for the .corn internet',
    url: 'www.corngpt.corn',
    icon: '🌽',
    description: 'AI-powered search and chat from CloseAI, a subsidiary of Omnicorp Holdings',
    theme: {
      primary: '#10a37f',      // CloseAI green (OpenAI teal parody)
      secondary: '#202123',    // Dark sidebar
      background: '#343541',   // ChatGPT dark grey
      surface: '#444654',      // Message background
      text: '#ececf1',         // Light text
      textMuted: '#8e8ea0',    // Muted grey
      border: '#4e4f60',       // Border color
      accent: '#10a37f',       // Accent green
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
