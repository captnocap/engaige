/**
 * Site Manifests - SINGLE SOURCE OF TRUTH
 *
 * This file declares all .corn site metadata and searchable content.
 * All other systems derive from this:
 * - site-registry.ts: Gets id, name, icon, description, keywords, seoScore
 * - app-registry.ts: Browser entries auto-generated from this
 * - Goober search: Indexes homepage + pages
 *
 * When adding a new site:
 * 1. Add a manifest here with all metadata
 * 2. Create the site component
 * 3. Register the component mapping in legacy-sites.ts
 * That's it - no more triple duplication!
 */

import type { SiteManifest } from '../router/types.js'

// ============================================================================
// Social Media Sites
// ============================================================================

export const MYFACE_MANIFEST: SiteManifest = {
  id: 'myface',
  domain: 'myface.corn',
  name: 'MyFace',
  icon: '👤',
  iconImage: '/src/assets/icon-myface.png',
  homepage: {
    title: 'MyFace - The OG Social Network',
    description: 'Connect with friends, customize your profile, share bulletins, and show off your Top 8. The original social network experience with that classic early 2000s vibe.',
    keywords: ['social network', 'friends', 'profile', 'top 8', 'bulletins', 'myspace'],
  },
  seoScore: 85,
  pages: [],
}

export const INSTASNAP_MANIFEST: SiteManifest = {
  id: 'instasnap',
  domain: 'instasnap.corn',
  name: 'InstaSnap',
  icon: '📸',
  homepage: {
    title: 'InstaSnap - Share Photos & Stories',
    description: 'Photo sharing platform with grid profiles, stories, and reels. Follow your favorite creators and share your life in pictures.',
    keywords: ['photos', 'stories', 'reels', 'instagram', 'social', 'images'],
  },
  seoScore: 85,
  pages: [],
}

export const THREADIT_MANIFEST: SiteManifest = {
  id: 'threadit',
  domain: 'threadit.corn',
  name: 'Threadit',
  icon: '🗣️',
  homepage: {
    title: 'Threadit - The Front Page of the Fake Internet',
    description: 'Dive into anything. Communities for every interest, upvotes, downvotes, and endless discussions on every topic imaginable.',
    keywords: ['forum', 'discussion', 'community', 'reddit', 'subreddit', 'threads'],
  },
  seoScore: 85,
  pages: [],
}

// ============================================================================
// Content Sites
// ============================================================================

export const WIKIKNOW_MANIFEST: SiteManifest = {
  id: 'wikiknow',
  domain: 'wikiknow.corn',
  name: 'WikiKnow',
  icon: '📖',
  homepage: {
    title: 'WikiKnow - The Free Encyclopedia',
    description: 'The free encyclopedia that anyone can edit. Millions of articles on every topic, from quantum coffee to the Hartwell Building mystery.',
    keywords: ['wiki', 'encyclopedia', 'reference', 'articles', 'knowledge'],
  },
  seoScore: 90,
  pages: [],
}

export const DAILYBUZZ_MANIFEST: SiteManifest = {
  id: 'dailybuzz',
  domain: 'dailybuzz.corn',
  name: 'DailyBuzz',
  icon: '📰',
  homepage: {
    title: 'DailyBuzz - All The News That Fits',
    description: 'Breaking news, local stories, and everything in between. Your source for what\'s happening in Cornfield and beyond.',
    keywords: ['news', 'local', 'journalism', 'articles', 'breaking news'],
  },
  seoScore: 80,
  pages: [],
}

export const VIDTUBE_MANIFEST: SiteManifest = {
  id: 'vidtube',
  domain: 'vidtube.corn',
  name: 'VidTube',
  icon: '▶️',
  homepage: {
    title: 'VidTube - Broadcast Yourself',
    description: 'Share and watch videos from around the world. Upload your content, subscribe to channels, and discover trending videos.',
    keywords: ['video', 'streaming', 'youtube', 'upload', 'watch', 'creators'],
  },
  seoScore: 85,
  pages: [],
}

export const FORCHAN_MANIFEST: SiteManifest = {
  id: 'forchan',
  domain: 'forchan.corn',
  name: 'ForChan',
  icon: '🍀',
  homepage: {
    title: 'ForChan - Anonymous Imageboard',
    description: 'The stories and information posted here are artistic works of fiction. Anonymous imageboard for memes, discussions, and general chaos.',
    keywords: ['anonymous', 'imageboard', '4chan', 'memes', 'forum'],
  },
  seoScore: 40,
  pages: [],
}

// ============================================================================
// Commercial Sites
// ============================================================================

export const AMAIZE_MANIFEST: SiteManifest = {
  id: 'amaize',
  domain: 'amaize.corn',
  name: 'Amaize',
  icon: '🌽',
  homepage: {
    title: 'Amaize - The Everything Corn Store',
    description: 'Shop millions of corn-related products with Kernel Prime delivery. From corn holders to quantum coffee makers, we have it all.',
    keywords: ['shopping', 'amazon', 'ecommerce', 'delivery', 'products'],
  },
  seoScore: 80,
  pages: [],
}

export const BARGAINBAY_MANIFEST: SiteManifest = {
  id: 'bargainbay',
  domain: 'bargainbay.corn',
  name: 'BargainBay',
  icon: '🏷️',
  homepage: {
    title: 'BargainBay - Buy. Sell. Maybe Trust.',
    description: 'Local classifieds and marketplace. Find deals, sell your stuff, and hope the buyer actually shows up.',
    keywords: ['classifieds', 'marketplace', 'craigslist', 'buy', 'sell', 'local'],
  },
  seoScore: 65,
  pages: [],
}

export const NESTFINDER_MANIFEST: SiteManifest = {
  id: 'nestfinder',
  domain: 'nestfinder.corn',
  name: 'NestFinder',
  icon: '🏠',
  homepage: {
    title: 'NestFinder - Find Your Perfect Place',
    description: 'Apartments, houses, and rooms for rent and sale. Search listings, schedule tours, and find your next home.',
    keywords: ['real estate', 'apartments', 'houses', 'rent', 'buy', 'housing'],
  },
  seoScore: 70,
  pages: [],
}

export const COBFUNDME_MANIFEST: SiteManifest = {
  id: 'cobfundme',
  domain: 'cobfundme.corn',
  name: 'CobFundMe',
  icon: '🌽',
  homepage: {
    title: 'CobFundMe - Fund What Matters (To Someone)',
    description: 'Crowdfunding for questionable campaigns since 2019. From medical bills to funding Derek\'s quantum coffee research.',
    keywords: ['crowdfunding', 'fundraiser', 'gofundme', 'donations', 'campaigns'],
  },
  seoScore: 55,
  pages: [],
}

export const VITALITYRX_MANIFEST: SiteManifest = {
  id: 'vitalityrx',
  domain: 'vitalityrx.corn',
  name: 'VitalityRx',
  icon: '💊',
  homepage: {
    title: 'VitalityRx - Medications for the Modern Age',
    description: 'Online pharmacy with questionable medications and even more questionable medical advice. Side effects may include enlightenment.',
    keywords: ['pharmacy', 'medicine', 'health', 'medications', 'pills'],
  },
  seoScore: 60,
  pages: [],
}

export const ODDSORACLE_MANIFEST: SiteManifest = {
  id: 'oddsoracle',
  domain: 'oddsoracle.corn',
  name: 'OddsOracle',
  icon: '🎲',
  homepage: {
    title: 'OddsOracle - Prediction Markets for Everything',
    description: 'Bet on anything. Will Trust Fall Tim reach 3,000 falls? Will Floor 13 be discovered? Place your bets.',
    keywords: ['predictions', 'betting', 'markets', 'gambling', 'odds'],
  },
  seoScore: 55,
  pages: [],
}

export const WEALTHWISDOM_MANIFEST: SiteManifest = {
  id: 'wealthwisdom',
  domain: 'wealthwisdom.corn',
  name: 'WealthWisdom',
  icon: '💰',
  homepage: {
    title: 'WealthWisdom - Financial Advice from Experts',
    description: 'Get rich quick schemes that definitely work. Investment tips from people who lost everything.',
    keywords: ['finance', 'money', 'investing', 'wealth', 'advice'],
  },
  seoScore: 60,
  pages: [],
}

// ============================================================================
// Q&A and Reference Sites
// ============================================================================

export const ASKCORN_MANIFEST: SiteManifest = {
  id: 'askcorn',
  domain: 'askcorn.corn',
  name: 'AskCorn',
  icon: '🌽',
  homepage: {
    title: 'AskCorn - Where Every Question Pops',
    description: 'Q&A site where questions range from technical programming help to increasingly unhinged philosophical debates.',
    keywords: ['questions', 'answers', 'qa', 'stackoverflow', 'help', 'programming'],
  },
  seoScore: 65,
  pages: [],
}

export const HUSKREVIEWS_MANIFEST: SiteManifest = {
  id: 'huskreviews',
  domain: 'huskreviews.corn',
  name: 'HuskReviews',
  icon: '🌽',
  homepage: {
    title: 'HuskReviews - Real Reviews. Real Unhinged.',
    description: 'Local business reviews from increasingly unhinged customers. Find the best (and worst) places in town.',
    keywords: ['reviews', 'business', 'yelp', 'local', 'restaurants', 'ratings'],
  },
  seoScore: 60,
  pages: [],
}

// ============================================================================
// Tech and Developer Sites
// ============================================================================

export const COBHUB_MANIFEST: SiteManifest = {
  id: 'cobhub',
  domain: 'cobhub.corn',
  name: 'CobHub',
  icon: '🌽',
  homepage: {
    title: 'CobHub - Where Every Commit is a Kernel of Truth',
    description: 'Code repository hosting for open source projects. Fork repos, submit pull requests, and collaborate on code.',
    keywords: ['code', 'github', 'git', 'repository', 'programming', 'open source'],
  },
  seoScore: 70,
  pages: [],
}

export const KERNELPODS_MANIFEST: SiteManifest = {
  id: 'kernelpods',
  domain: 'kernelpods.corn',
  name: 'KernelPods',
  icon: '🎧',
  homepage: {
    title: 'KernelPods - Where Every Story Has a Kernel of Truth',
    description: 'Podcast platform featuring shows on everything from true crime to quantum coffee conspiracy theories.',
    keywords: ['podcast', 'audio', 'shows', 'episodes', 'listen'],
  },
  seoScore: 55,
  pages: [],
}

export const PASTELIVE_MANIFEST: SiteManifest = {
  id: 'pastelive',
  domain: 'pastelive.corn',
  name: 'PasteLive',
  icon: '📋',
  homepage: {
    title: 'PasteLive - Share Text Anonymously',
    description: 'Pastebin-style text hosting for anonymous sharing. Code, confessions, and conspiracy theories welcome.',
    keywords: ['paste', 'text', 'code', 'share', 'anonymous'],
  },
  seoScore: 50,
  pages: [],
}

// ============================================================================
// Parody and Meme Sites
// ============================================================================

export const CORNHUB_MANIFEST: SiteManifest = {
  id: 'cornhub',
  domain: 'cornhub.corn',
  name: 'CornHub',
  icon: '🌽',
  homepage: {
    title: 'CornHub - Free Corn Recipes',
    description: 'The world\'s largest collection of free corn recipes. Corn on the cob, cornbread, popcorn, creamed corn, and more. Over 10,000 user-submitted recipes.',
    keywords: ['corn', 'recipes', 'cooking', 'food', 'cornbread'],
  },
  seoScore: 65,
  pages: [],
}

export const ONLYFANS_MANIFEST: SiteManifest = {
  id: 'onlyfans',
  domain: 'onlyfans.corn',
  name: 'OnlyFans',
  icon: '🌀',
  homepage: {
    title: 'OnlyFans - Premium Fans for Enthusiasts',
    description: 'The #1 destination for fan enthusiasts. Premium ceiling fans, desk fans, box fans, and oscillating fans. Subscribe for exclusive unboxings.',
    keywords: ['fans', 'ceiling fans', 'desk fans', 'cooling', 'appliances'],
  },
  seoScore: 50,
  pages: [],
}

export const ONLYFARMS_MANIFEST: SiteManifest = {
  id: 'onlyfarms',
  domain: 'onlyfarms.corn',
  name: 'OnlyFarms',
  icon: '🚜',
  homepage: {
    title: 'OnlyFarms - Where Equipment Gets Exposed',
    description: 'Premium agricultural equipment marketplace. Tractors, combines, harvesters, and irrigation systems. See what\'s under the hood.',
    keywords: ['farming', 'tractors', 'agriculture', 'equipment', 'farm'],
  },
  seoScore: 50,
  pages: [],
}

export const STRANGERZONE_MANIFEST: SiteManifest = {
  id: 'strangerzone',
  domain: 'strangerzone.corn',
  name: 'StrangerZone',
  icon: '👤',
  homepage: {
    title: 'StrangerZone - Talk to Strangers. Regret It Later.',
    description: 'Random anonymous chat with strangers. You never know who you\'ll meet - or what weird conversation awaits.',
    keywords: ['chat', 'anonymous', 'strangers', 'random', 'omegle'],
  },
  seoScore: 45,
  pages: [],
}

export const GRAINTRUTH_MANIFEST: SiteManifest = {
  id: 'graintruth',
  domain: 'graintruth.corn',
  name: 'GrainTruth',
  icon: '🌽',
  homepage: {
    title: 'GrainTruth - Big Corn Is Watching',
    description: 'Corn-based conspiracy research. The truth about corn, corporations, and what they don\'t want you to know.',
    keywords: ['conspiracy', 'corn', 'big corn', 'truth', 'research'],
  },
  seoScore: 35,
  pages: [],
}

export const BANDSNOTINTOWN_MANIFEST: SiteManifest = {
  id: 'bandsnotintown',
  domain: 'bandsnotintown.corn',
  name: 'BandsNotInTown',
  icon: '🎫',
  homepage: {
    title: 'BandsNotInTown - Never See Your Favorites Live',
    description: 'Track bands that will never play in your area. Get notified about cancelled shows and permanent hiatuses.',
    keywords: ['concerts', 'bands', 'music', 'cancelled', 'shows'],
  },
  seoScore: 55,
  pages: [],
}

export const COBCOIN_MANIFEST: SiteManifest = {
  id: 'cobcoin',
  domain: 'cobcoin.corn',
  name: 'CobCoin Exchange',
  icon: '🌽',
  homepage: {
    title: 'CobCoin Exchange - 847 COB = 1 USD',
    description: 'Corn-based cryptocurrency exchange. Trade CobCoin, KernelCoin, and other agricultural tokens.',
    keywords: ['crypto', 'coin', 'exchange', '847', 'cryptocurrency'],
  },
  seoScore: 45,
  pages: [],
}

// ============================================================================
// Specialized Sites
// ============================================================================

export const GOOBER_MANIFEST: SiteManifest = {
  id: 'goober',
  domain: 'goober.corn',
  name: 'Goober',
  icon: '🔍',
  homepage: {
    title: 'Goober - Search the Corn Internet',
    description: 'The search engine for the .corn internet. Find anything across all sites with full-text search and smart ranking.',
    keywords: ['search', 'google', 'find', 'search engine'],
  },
  seoScore: 95,
  pages: [],
}

export const CORNGPT_MANIFEST: SiteManifest = {
  id: 'corngpt',
  domain: 'corngpt.corn',
  name: 'cornGPT',
  icon: '🌽',
  homepage: {
    title: 'cornGPT - AI Assistant by CloseAI',
    description: 'The AI assistant from CloseAI (a subsidiary of Omnicorp Holdings). Ask questions, get answers, and search the .corn internet. Now with fun modes like "Cheat On My Test" and "Dunk Screenshot Mode".',
    keywords: ['ai', 'chatgpt', 'assistant', 'closeai', 'omnicorp', 'chat', 'artificial intelligence'],
  },
  seoScore: 90,
  pages: [],
}

export const STALKS_MANIFEST: SiteManifest = {
  id: 'stalks',
  domain: 'stalks.corn',
  name: 'Stalks',
  icon: '📈',
  homepage: {
    title: 'Stalks - Prediction Market for .corn Drama',
    description: 'Bet Kernels on the outcomes of local controversies, celebrity drama, and whether Floor 13 actually exists. Your worthless currency, your wild predictions.',
    keywords: ['predictions', 'betting', 'markets', 'stocks', 'gambling', 'drama', 'polymarket'],
  },
  seoScore: 75,
  pages: [],
}

export const CORNMAPS_MANIFEST: SiteManifest = {
  id: 'cornmaps',
  domain: 'cornmaps.corn',
  name: 'CornMaps',
  icon: '🌽',
  homepage: {
    title: 'CornMaps - Navigation With a Twist',
    description: 'Get directions to anywhere. Every destination has something slightly off about it. Trust the route. Maybe.',
    keywords: ['maps', 'directions', 'navigation', 'google maps', 'gps'],
  },
  seoScore: 70,
  pages: [],
}

export const CORNMD_MANIFEST: SiteManifest = {
  id: 'cornmd',
  domain: 'cornmd.corn',
  name: 'CornMD',
  icon: '🌽',
  homepage: {
    title: 'CornMD - Your Symptoms. Our Corn Expertise.',
    description: 'Medical symptom checker that somehow diagnoses everything as corn-related. Headache? Probably corn deficiency.',
    keywords: ['medical', 'symptoms', 'health', 'webmd', 'doctor'],
  },
  seoScore: 60,
  pages: [],
}

export const LINKEDCORN_MANIFEST: SiteManifest = {
  id: 'linkedcorn',
  domain: 'linkedcorn.corn',
  name: 'LinkedCorn',
  icon: '🌽',
  homepage: {
    title: 'LinkedCorn - Professional Corn Networking',
    description: 'The professional network for agricultural excellence. Connect with corn industry professionals and grow your career.',
    keywords: ['professional', 'networking', 'linkedin', 'jobs', 'career'],
  },
  seoScore: 65,
  pages: [],
}

export const STALK_MANIFEST: SiteManifest = {
  id: 'stalk',
  domain: 'stalk.corn',
  name: 'Stalk',
  icon: '🌽',
  homepage: {
    title: 'Stalk - Watch Together. Grow Together.',
    description: 'Live streaming platform named after corn stalks, obviously. Watch gamers, musicians, and other creators live.',
    keywords: ['streaming', 'live', 'twitch', 'gaming', 'creators'],
  },
  seoScore: 55,
  pages: [],
}

export const CORNDR_MANIFEST: SiteManifest = {
  id: 'corndr',
  domain: 'corndr.corn',
  name: 'Corndr',
  icon: '🌽💕',
  homepage: {
    title: 'Corndr - Where Corn Lovers Connect',
    description: 'Dating app for people in the corn industry and people who are just really into corn. Swipe right on your soulmate.',
    keywords: ['dating', 'tinder', 'romance', 'relationships', 'corn'],
  },
  seoScore: 45,
  pages: [],
}

export const DEADDROP_MANIFEST: SiteManifest = {
  id: 'deaddrop',
  domain: 'deaddrop.corn',
  name: 'DeadDrop',
  icon: '📦',
  homepage: {
    title: 'DeadDrop - Anonymous Tips & Confessions',
    description: 'Anonymous tips, confessions, and mostly shitposts. What happens on DeadDrop stays on DeadDrop.',
    keywords: ['anonymous', 'tips', 'confessions', 'secrets'],
  },
  seoScore: 40,
  pages: [],
}

export const SILKROAD_MANIFEST: SiteManifest = {
  id: 'silkroad',
  domain: 'silkroad.corn',
  name: 'SilkRoad',
  icon: '🌽',
  homepage: {
    title: 'SilkRoad - Legitimate Corn Silk Marketplace',
    description: 'Legitimate corn silk marketplace. Stop asking if we sell anything else. We don\'t. Just corn silk.',
    keywords: ['silk', 'corn silk', 'marketplace', 'legitimate'],
  },
  seoScore: 30,
  pages: [],
}

export const CORNARCHIVE_MANIFEST: SiteManifest = {
  id: 'cornarchive',
  domain: 'cornarchive.corn',
  name: 'CornArchive',
  icon: '📚',
  homepage: {
    title: 'CornArchive - The Wayback Machine for .corn',
    description: 'Preserving deleted and historical web pages since 2004. Nothing is ever truly deleted from the corn internet.',
    keywords: ['archive', 'history', 'wayback', 'preservation'],
  },
  seoScore: 75,
  pages: [],
}

// ============================================================================
// Blog Sites (Lore Characters)
// ============================================================================

export const QUANTUMBREWBLOG_MANIFEST: SiteManifest = {
  id: 'quantumbrewblog',
  domain: 'quantumbrewblog.corn',
  name: 'QuantumBrewBlog',
  icon: '☕',
  homepage: {
    title: 'QuantumBrewBlog - Derek\'s Quantum Coffee Journey',
    description: 'Observing coffee so you don\'t have to. Derek documents his 847 trials of quantum brewing. Jennifer left him over this.',
    keywords: ['quantum coffee', 'derek', 'blog', 'coffee', 'obsession'],
  },
  seoScore: 55,
  pages: [],
}

export const TRUSTFALLTIM_MANIFEST: SiteManifest = {
  id: 'trustfalltim',
  domain: 'trustfalltim.corn',
  name: 'TrustFallTim.corn',
  icon: '🙆‍♂️',
  homepage: {
    title: 'TrustFallTim.fan - The Official Unofficial Fan Archive',
    description: 'The complete archive of Trust Fall Tim\'s 2,847 documented falls. Includes The Incident footage (viewer discretion advised).',
    keywords: ['trust fall tim', 'fan site', 'archive', 'falls', 'the incident'],
  },
  seoScore: 55,
  pages: [],
}

export const HARTWELLFILES_MANIFEST: SiteManifest = {
  id: 'hartwellfiles',
  domain: 'hartwellfiles.corn',
  name: 'Hartwell Files',
  icon: '🏚️',
  homepage: {
    title: 'The Hartwell Files - The Truth Is In There',
    description: 'Conspiracy archive about the Hartwell Building. Floor 13, the mirrors on Floor 7, Omnicorp Holdings, and the number 847.',
    keywords: ['hartwell building', 'conspiracy', 'floor 13', 'mystery', 'omnicorp'],
  },
  seoScore: 50,
  pages: [],
}

export const CORNSTALKBLOG_MANIFEST: SiteManifest = {
  id: 'cornstalkblog',
  domain: 'thoughtsfromtherow.corn',
  name: 'Thoughts From The Row',
  icon: '🌾',
  homepage: {
    title: 'Thoughts From The Row - A Sentient Corn Stalk\'s Blog',
    description: 'A sentient corn stalk contemplates existence, photosynthesis, and the meaning of harvest season.',
    keywords: ['corn', 'philosophy', 'blog', 'existential', 'sentient'],
  },
  seoScore: 40,
  pages: [],
}

export const JENNIFERSBLOG_MANIFEST: SiteManifest = {
  id: 'jennifersblog',
  domain: 'jenniferheals.corn',
  name: 'Jennifer Heals',
  icon: '💗',
  homepage: {
    title: 'Jennifer Heals - A Healing Journey',
    description: 'A healing journey after divorce. Discovering yourself after leaving someone who loved coffee more than you.',
    keywords: ['healing', 'divorce', 'blog', 'wellness', 'self-care'],
  },
  seoScore: 45,
  pages: [],
}

export const ELENASBLOG_MANIFEST: SiteManifest = {
  id: 'elenasblog',
  domain: 'elenasclarifies.corn',
  name: 'Dr. Elena Martinez',
  icon: '🔬',
  homepage: {
    title: 'Dr. Elena Martinez - Academic Blog',
    description: 'Academic blog by physicist Dr. Elena Martinez. Clarifying that her paper was about subatomic particles, NOT coffee.',
    keywords: ['physics', 'quantum', 'science', 'martinez', 'academic'],
  },
  seoScore: 70,
  pages: [],
}

export const VENUEPOETRYBLOG_MANIFEST: SiteManifest = {
  id: 'venuepoetryblog',
  domain: 'anonymousvenuepoet.corn',
  name: 'Anonymous Venue Poet',
  icon: '🎵',
  homepage: {
    title: 'Anonymous Venue Poet - Secret Poetry',
    description: 'Secret poetry about running a venue. Definitely not written by Mars. The handwriting is completely different.',
    keywords: ['poetry', 'venue', 'underground', 'mars', 'anonymous'],
  },
  seoScore: 40,
  pages: [],
}

export const TIMSMOMBLOG_MANIFEST: SiteManifest = {
  id: 'timsmomsupport',
  domain: 'carolstimupdate.corn',
  name: 'Carol\'s Blog',
  icon: '🍪',
  homepage: {
    title: 'Carol\'s Tim Update - A Mother\'s Concern',
    description: 'Tim\'s worried mom blogs about his trust fall career. Updates on injuries, recovery, and prayer requests.',
    keywords: ['carol', 'tim', 'mom', 'trust fall', 'concern'],
  },
  seoScore: 35,
  pages: [],
}

export const SMALLKEVINBLOG_MANIFEST: SiteManifest = {
  id: 'smallkevinblog',
  domain: 'smallkevinredemption.corn',
  name: 'SmallKevinRedemption',
  icon: '😔',
  homepage: {
    title: 'Small Kevin\'s Redemption Blog',
    description: 'Small Kevin\'s redemption blog after The Incident. He\'s trying to move on. It\'s been hard.',
    keywords: ['kevin', 'redemption', 'incident', 'trust fall', 'apology'],
  },
  seoScore: 30,
  pages: [],
}

export const MARTINEZFBLOG_MANIFEST: SiteManifest = {
  id: 'drmartinezblog',
  domain: 'drmartinezclarifies.corn',
  name: 'Dr. Elena Martinez',
  icon: '🔬',
  homepage: {
    title: 'Dr. Martinez Clarifies - Stop Misinterpreting My Research',
    description: 'Physicist whose paper was misinterpreted into quantum coffee. Blog dedicated to explaining what her paper actually says.',
    keywords: ['martinez', 'physics', 'quantum', 'coffee', 'misinterpreted'],
  },
  seoScore: 70,
  pages: [],
}

export const BIGMIKEBLOG_MANIFEST: SiteManifest = {
  id: 'bigmikeblog',
  domain: 'bigmikefromtulsa.corn',
  name: 'Big Mike from Tulsa',
  icon: '👨',
  homepage: {
    title: 'Big Mike from Tulsa - Just a Normal Guy',
    description: 'The aggressively normal blog of Michael Cornwell. He\'s just explaining why he appears in every photo.',
    keywords: ['big mike', 'tulsa', 'normal', 'cornwell', 'photos'],
  },
  seoScore: 45,
  pages: [],
}

export const VEXDRUMSBLOG_MANIFEST: SiteManifest = {
  id: 'vexdrums',
  domain: 'vexdrumsblog.corn',
  name: 'Vex Drums Blog',
  icon: '🥁',
  homepage: {
    title: 'Vex Drums Blog - The Band Is NOT Over',
    description: 'Personal blog of Vex, drummer from Neon Requiem. Still setting up for next practice. The band isn\'t over.',
    keywords: ['vex', 'drums', 'neon requiem', 'band', 'denial'],
  },
  seoScore: 50,
  pages: [],
}

export const PATRICIABLOG_MANIFEST: SiteManifest = {
  id: 'patriciablog',
  domain: 'patriciasworkplacewellness.corn',
  name: 'Patricia\'s Workplace Blog',
  icon: '👔',
  homepage: {
    title: 'Patricia\'s Workplace Wellness - HR Tips & More',
    description: 'Corporate HR wellness blog from Omnicorp Holdings. Increasingly concerning posts about Floor 13 and the number 847.',
    keywords: ['patricia', 'hr', 'omnicorp', 'floor 13', 'wellness', '847'],
  },
  seoScore: 55,
  pages: [],
}

export const WONDERWALLWARRIOR_MANIFEST: SiteManifest = {
  id: 'wonderwallwarrior',
  domain: 'wonderwallwarrior.corn',
  name: 'Wonderwall Warrior',
  icon: '🎸',
  homepage: {
    title: 'Wonderwall Warrior - Gary\'s Fight for Musical Freedom',
    description: 'Gary\'s defiant blog about requesting Wonderwall at The Underground. 13 bans and counting. He will not be silenced.',
    keywords: ['wonderwall', 'gary', 'underground', 'banned', 'oasis'],
  },
  seoScore: 40,
  pages: [],
}

export const FLOOR13BLOG_MANIFEST: SiteManifest = {
  id: 'floor13blog',
  domain: 'floor13exists.corn',
  name: 'Floor 13 Exists',
  icon: '█',
  homepage: {
    title: 'Floor 13 Exists - Messages from the Between',
    description: 'A cryptic blog from the mysterious entity on Floor 13 of the Hartwell Building. The posts appear on their own.',
    keywords: ['floor 13', 'hartwell', 'entity', 'mystery', 'cryptic'],
  },
  seoScore: 60,
  pages: [],
}

// ============================================================================
// Unhinged Persona Sites
// ============================================================================

export const BENCHWATCH_MANIFEST: SiteManifest = {
  id: 'benchwatch',
  domain: 'benchwatch.corn',
  name: 'BenchWatch',
  icon: '🪑',
  homepage: {
    title: 'BenchWatch - Forensic Bench Analysis',
    description: 'Greg Mantooth\'s forensic bench analysis. Every bench tells a story. Greg has documented 8,470 of them.',
    keywords: ['bench', 'forensic', 'analysis', 'greg', 'mantooth'],
  },
  seoScore: 35,
  pages: [],
}

export const DOMINATE_MANIFEST: SiteManifest = {
  id: 'dominate',
  domain: 'dominate.corn',
  name: 'DOMINATE',
  icon: '💪',
  homepage: {
    title: 'DOMINATE - Chad Thundercoach\'s Success System',
    description: 'Chad Thundercoach\'s high-intensity success system. CRUSH your goals. DOMINATE your life. CAPITALIZE randomly.',
    keywords: ['success', 'motivation', 'coaching', 'chad', 'thundercoach'],
  },
  seoScore: 45,
  pages: [],
}

export const STATIONSUSHI_MANIFEST: SiteManifest = {
  id: 'stationsushi',
  domain: 'stationsushireview.corn',
  name: 'Station Sushi Review',
  icon: '🍣',
  homepage: {
    title: 'Station Sushi Review - Mildred\'s Gas Station Sushi Reviews',
    description: 'Mildred Gasketsworth\'s comprehensive gas station sushi reviews. She\'s tried 847 gas stations. She\'s still standing.',
    keywords: ['sushi', 'gas station', 'reviews', 'mildred', 'gasketsworth'],
  },
  seoScore: 40,
  pages: [],
}

export const TRUEMOSS_MANIFEST: SiteManifest = {
  id: 'truemoss',
  domain: 'truemoss.corn',
  name: 'TrueMoss',
  icon: '🌿',
  homepage: {
    title: 'TrueMoss - Independent Moss Research',
    description: 'Agatha Mosswell\'s independent moss research. Big Botany doesn\'t want you to know what moss is really up to.',
    keywords: ['moss', 'research', 'agatha', 'mosswell', 'nature'],
  },
  seoScore: 35,
  pages: [],
}

// ============================================================================
// Easter Egg Sites
// ============================================================================

export const POPUPHELL_MANIFEST: SiteManifest = {
  id: 'popuphell',
  domain: 'free-prizes-click-here.corn',
  name: 'FREE PRIZES!!!',
  icon: '🎉',
  homepage: {
    title: 'YOU ARE THE 1000000th VISITOR!!!',
    description: 'CONGRATULATIONS!!! You have won a FREE prize!!! Click here to claim!!! This is TOTALLY legitimate!!!',
    keywords: ['popup', 'scam', 'prizes', 'virus', 'malware'],
  },
  seoScore: 10,
  pages: [],
}

export const MILLIONPIXELS_MANIFEST: SiteManifest = {
  id: 'millionpixels',
  domain: 'millionpixels.corn',
  name: 'MillionPixels',
  icon: '🟦',
  homepage: {
    title: 'MillionPixels - Own a Piece of Fake Internet History',
    description: 'Own a piece of fake internet history. Buy pixels on this page and advertise your .corn site.',
    keywords: ['pixels', 'advertising', 'history', 'million'],
  },
  seoScore: 35,
  pages: [],
}

// ============================================================================
// System/Utility Sites
// ============================================================================

export const CORNMAZE_MANIFEST: SiteManifest = {
  id: 'cornmaze',
  domain: 'maze.corn',
  name: 'Corn Maze',
  icon: '🌽',
  homepage: {
    title: 'corn:maze - The .corn Internet Index',
    description: 'A complete directory of all .corn sites and their indexed content. Browse the entire sitemap of the fake internet.',
    keywords: ['index', 'directory', 'sitemap', 'maze', 'all sites'],
  },
  seoScore: 80,
  pages: [],
}

// ============================================================================
// All Manifests Export
// ============================================================================

/**
 * All site manifests in one array.
 * This is the SINGLE SOURCE OF TRUTH for all site metadata.
 */
export const ALL_SITE_MANIFESTS: SiteManifest[] = [
  // Social Media
  MYFACE_MANIFEST,
  INSTASNAP_MANIFEST,
  THREADIT_MANIFEST,
  // Content
  WIKIKNOW_MANIFEST,
  DAILYBUZZ_MANIFEST,
  VIDTUBE_MANIFEST,
  FORCHAN_MANIFEST,
  // Commercial
  AMAIZE_MANIFEST,
  BARGAINBAY_MANIFEST,
  NESTFINDER_MANIFEST,
  COBFUNDME_MANIFEST,
  VITALITYRX_MANIFEST,
  ODDSORACLE_MANIFEST,
  WEALTHWISDOM_MANIFEST,
  // Q&A
  ASKCORN_MANIFEST,
  HUSKREVIEWS_MANIFEST,
  // Tech
  COBHUB_MANIFEST,
  KERNELPODS_MANIFEST,
  PASTELIVE_MANIFEST,
  // Parody
  CORNHUB_MANIFEST,
  ONLYFANS_MANIFEST,
  ONLYFARMS_MANIFEST,
  STRANGERZONE_MANIFEST,
  GRAINTRUTH_MANIFEST,
  BANDSNOTINTOWN_MANIFEST,
  COBCOIN_MANIFEST,
  // Specialized
  GOOBER_MANIFEST,
  CORNMAZE_MANIFEST,
  CORNGPT_MANIFEST,
  STALKS_MANIFEST,
  CORNMAPS_MANIFEST,
  CORNMD_MANIFEST,
  LINKEDCORN_MANIFEST,
  STALK_MANIFEST,
  CORNDR_MANIFEST,
  DEADDROP_MANIFEST,
  SILKROAD_MANIFEST,
  CORNARCHIVE_MANIFEST,
  // Blogs
  QUANTUMBREWBLOG_MANIFEST,
  TRUSTFALLTIM_MANIFEST,
  HARTWELLFILES_MANIFEST,
  CORNSTALKBLOG_MANIFEST,
  JENNIFERSBLOG_MANIFEST,
  ELENASBLOG_MANIFEST,
  VENUEPOETRYBLOG_MANIFEST,
  TIMSMOMBLOG_MANIFEST,
  SMALLKEVINBLOG_MANIFEST,
  MARTINEZFBLOG_MANIFEST,
  BIGMIKEBLOG_MANIFEST,
  VEXDRUMSBLOG_MANIFEST,
  PATRICIABLOG_MANIFEST,
  WONDERWALLWARRIOR_MANIFEST,
  FLOOR13BLOG_MANIFEST,
  // Unhinged Personas
  BENCHWATCH_MANIFEST,
  DOMINATE_MANIFEST,
  STATIONSUSHI_MANIFEST,
  TRUEMOSS_MANIFEST,
  // Easter Eggs
  POPUPHELL_MANIFEST,
  MILLIONPIXELS_MANIFEST,
]

/**
 * Map of domain -> manifest for quick lookup
 */
export const MANIFEST_BY_DOMAIN = new Map<string, SiteManifest>(
  ALL_SITE_MANIFESTS.map(m => [m.domain, m])
)

/**
 * Map of id -> manifest for quick lookup
 */
export const MANIFEST_BY_ID = new Map<string, SiteManifest>(
  ALL_SITE_MANIFESTS.map(m => [m.id, m])
)

/**
 * Get manifest by domain
 */
export function getManifestByDomain(domain: string): SiteManifest | undefined {
  const normalized = domain.toLowerCase().replace(/^www\./, '')
  return MANIFEST_BY_DOMAIN.get(normalized)
}

/**
 * Get manifest by id
 */
export function getManifestById(id: string): SiteManifest | undefined {
  return MANIFEST_BY_ID.get(id)
}

export default ALL_SITE_MANIFESTS
