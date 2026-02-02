/**
 * Site Manifests
 *
 * Declares all searchable content for each .corn site.
 * This is what Goober "crawls" to build its search index.
 *
 * Each site has:
 * - homepage: Title, description, keywords for the main domain
 * - pages: Array of internal pages/content (articles, profiles, products, etc.)
 *
 * When adding a new site or content to an existing site,
 * update this file and it will automatically be indexed by Goober.
 */

import type { SiteManifest, IndexablePage } from '../router/types.js'

// ============================================================================
// Social Media Sites
// ============================================================================

export const MYFACE_MANIFEST: SiteManifest = {
  domain: 'myface.corn',
  homepage: {
    title: 'MyFace - The OG Social Network',
    description: 'Connect with friends, customize your profile, share bulletins, and show off your Top 8. The original social network experience with that classic early 2000s vibe.',
    keywords: ['social network', 'friends', 'profile', 'top 8', 'bulletins', 'myspace'],
  },
  seoScore: 85,
  pages: [
    { path: '/browse', title: 'Browse MyFace Profiles', description: 'Discover new friends and browse profiles on MyFace', type: 'social', tags: ['browse', 'discover', 'profiles'] },
    { path: '/messages', title: 'MyFace Messages', description: 'Message your friends on MyFace', type: 'social', tags: ['messages', 'chat', 'dm'] },
    { path: '/dating', title: 'MyFace Dating', description: 'Find your special someone on MyFace Dating', type: 'social', tags: ['dating', 'romance', 'match'] },
  ],
}

export const INSTASNAP_MANIFEST: SiteManifest = {
  domain: 'instasnap.corn',
  homepage: {
    title: 'InstaSnap - Share Photos & Stories',
    description: 'Photo sharing platform with grid profiles, stories, and reels. Follow your favorite creators and share your life in pictures.',
    keywords: ['photos', 'stories', 'reels', 'instagram', 'social', 'images'],
  },
  seoScore: 85,
  pages: [
    { path: '/explore', title: 'Explore InstaSnap', description: 'Discover trending photos and creators on InstaSnap', type: 'social', tags: ['explore', 'trending', 'discover'] },
    { path: '/stories', title: 'InstaSnap Stories', description: '24-hour stories from people you follow', type: 'social', tags: ['stories', 'ephemeral'] },
  ],
}

export const THREADIT_MANIFEST: SiteManifest = {
  domain: 'threadit.corn',
  homepage: {
    title: 'Threadit - The Front Page of the Fake Internet',
    description: 'Dive into anything. Communities for every interest, upvotes, downvotes, and endless discussions on every topic imaginable.',
    keywords: ['forum', 'discussion', 'community', 'reddit', 'subreddit', 'threads'],
  },
  seoScore: 85,
  pages: [
    { path: '/r/QuantumCoffee', title: 'r/QuantumCoffee - Threadit', description: 'The unofficial subreddit for quantum coffee enthusiasts. Derek is a mod.', type: 'forum', tags: ['quantum coffee', 'derek', 'coffee'] },
    { path: '/r/HartwellBuilding', title: 'r/HartwellBuilding - Threadit', description: 'Theories, sightings, and investigations into the Hartwell Building mystery', type: 'forum', tags: ['hartwell', 'floor 13', 'mystery', 'conspiracy'] },
    { path: '/r/TrustFallTim', title: 'r/TrustFallTim - Threadit', description: 'Fan community for Trust Fall Tim. Fall statistics, meet-up planning, and The Incident discussions.', type: 'forum', tags: ['trust fall tim', 'fan', 'community'] },
    { path: '/r/LocalMusic', title: 'r/LocalMusic - Threadit', description: 'Local music scene discussion. Velvet Algorithms updates, Underground shows, Neon Requiem memorials.', type: 'forum', tags: ['music', 'local', 'velvet algorithms', 'neon requiem', 'underground'] },
    { path: '/r/Cornfield', title: 'r/Cornfield - Threadit', description: 'General discussion for Cornfield, KS residents and enthusiasts', type: 'forum', tags: ['local', 'cornfield', 'community'] },
    { path: '/t/floor_13_theory', title: '[THEORY] The Hartwell Building Floor 13 is a dimensional pocket', description: 'Conspiracy theory about the true nature of the missing floor. Evidence includes strange elevator behavior and the number 847.', type: 'forum', tags: ['hartwell', 'floor 13', 'conspiracy', 'theory'] },
  ],
}

// ============================================================================
// Content Sites
// ============================================================================

export const WIKIKNOW_MANIFEST: SiteManifest = {
  domain: 'wikiknow.corn',
  homepage: {
    title: 'WikiKnow - The Free Encyclopedia',
    description: 'The free encyclopedia that anyone can edit. Millions of articles on every topic, from quantum coffee to the Hartwell Building mystery.',
    keywords: ['wiki', 'encyclopedia', 'reference', 'articles', 'knowledge'],
  },
  seoScore: 90,
  pages: [
    // Core Lore Articles
    { path: '/wiki/Quantum_Coffee_Brewing', title: 'Quantum Coffee Brewing - WikiKnow', description: 'Controversial preparation method claiming to use quantum mechanics to enhance coffee extraction. Based on misinterpretation of the Martinez Study.', type: 'wiki', author: 'Various Contributors', tags: ['quantum coffee', 'coffee', 'pseudoscience', 'martinez study'] },
    { path: '/wiki/Hartwell_Building', title: 'Hartwell Building - WikiKnow', description: 'Historic 14-story building in downtown notable for its "missing" 13th floor, strange mirror phenomena on Floor 7, and connection to Omnicorp Holdings. Built 1923.', type: 'wiki', tags: ['hartwell building', 'floor 13', 'omnicorp', 'architecture', 'mystery'] },
    { path: '/wiki/Trust_Fall_Tim', title: 'Trust Fall Tim - WikiKnow', description: 'Timothy "Trust Fall Tim" Henderson, performance artist known for daily public trust falls since 2018. Has completed over 2,847 documented falls with 78.5% catch rate.', type: 'wiki', tags: ['trust fall tim', 'performance art', 'local celebrity'] },
    { path: '/wiki/The_Underground_(venue)', title: 'The Underground (venue) - WikiKnow', description: 'Experimental music venue run by Marcus "Mars" Williams. Known for hosting avant-garde performances and permanent bans for Wonderwall requests.', type: 'wiki', tags: ['the underground', 'music venue', 'mars', 'local music'] },
    { path: '/wiki/The_Velvet_Algorithms', title: 'The Velvet Algorithms - WikiKnow', description: 'Electronic music duo known for experimental sound and frequent show cancellations due to "existential crises." Currently on indefinite meditation hiatus.', type: 'wiki', tags: ['velvet algorithms', 'electronic music', 'experimental', 'band'] },
    { path: '/wiki/Neon_Requiem', title: 'Neon Requiem - WikiKnow', description: 'Post-punk band that broke up January 2024 after legendary final show at The Underground. Drummer Vex still hasn\'t accepted it.', type: 'wiki', tags: ['neon requiem', 'post-punk', 'band', 'vex'] },
    { path: '/wiki/The_Martinez_Study', title: 'The Martinez Study - WikiKnow', description: 'Physics paper by Dr. Elena Martinez, widely misinterpreted as validating quantum coffee brewing. Martinez has repeatedly clarified her paper was about subatomic particles, not beverages.', type: 'wiki', tags: ['martinez study', 'quantum', 'physics', 'misinterpretation'] },
    { path: '/wiki/Small_Kevin', title: 'Small Kevin - WikiKnow', description: 'Kevin Smallwood, forever associated with "The Incident" during one of Trust Fall Tim\'s falls. Height: 5\'6". Currently running a redemption blog.', type: 'wiki', tags: ['small kevin', 'the incident', 'trust fall tim'] },
    { path: '/wiki/Derek_(quantum_coffee_enthusiast)', title: 'Derek - WikiKnow', description: 'Local quantum coffee enthusiast and blogger. Divorced from Jennifer over his obsession. Has conducted 847 personal brewing trials.', type: 'wiki', tags: ['derek', 'quantum coffee', 'blogger'] },
    { path: '/wiki/Omnicorp_Holdings', title: 'Omnicorp Holdings - WikiKnow', description: 'Mysterious corporation headquartered in the Hartwell Building. Little is known about their actual business. Patricia works in HR.', type: 'wiki', tags: ['omnicorp', 'corporation', 'hartwell building', 'mystery'] },
  ],
}

export const DAILYBUZZ_MANIFEST: SiteManifest = {
  domain: 'dailybuzz.corn',
  homepage: {
    title: 'DailyBuzz - All The News That Fits',
    description: 'Breaking news, local stories, and everything in between. Your source for what\'s happening in Cornfield and beyond.',
    keywords: ['news', 'local', 'journalism', 'articles', 'breaking news'],
  },
  seoScore: 80,
  pages: [
    { path: '/article/quantum-cafe-opens', title: 'New Quantum Cafe Opens Downtown, Charges $47 Per Cup', description: 'Qubit Coffee opens in Hartwell Building with quantum brewing technology. Enthusiasts line up for hours; scientists remain skeptical.', type: 'news', author: 'Michael Torres', tags: ['quantum coffee', 'business', 'downtown', 'hartwell building'] },
    { path: '/article/trust-fall-record', title: 'Local Man Breaks Trust Fall Record with 2,847 Consecutive Falls', description: 'Trust Fall Tim achieves 78.5% catch rate over eight-year experiment. "The Incident" with Small Kevin remains controversial.', type: 'news', author: 'Amanda Price', tags: ['trust fall tim', 'record', 'local'] },
    { path: '/article/local-band-cancels-show', title: 'Local Band Cancels Show Due to "Ongoing Existential Crisis"', description: 'The Velvet Algorithms cite "fundamental questioning of musical purpose" as reason for cancellation at The Underground.', type: 'news', author: 'Sarah Chen', tags: ['velvet algorithms', 'music', 'the underground'] },
    { path: '/article/hartwell-elevator-malfunction', title: 'Hartwell Building Elevator Skips Floor 13 Again, Tenants Concerned', description: 'Third reported "glitch" this month. Building management insists floor 13 does not exist. Elevator disagrees.', type: 'news', author: 'James Wilson', tags: ['hartwell building', 'floor 13', 'mystery'] },
    { path: '/article/underground-bans-wonderwall', title: 'The Underground Issues 847th Wonderwall Ban', description: 'Gary becomes latest patron banned for requesting Oasis classic. Venue owner Mars unmoved by petition.', type: 'news', author: 'Sarah Chen', tags: ['the underground', 'wonderwall', 'gary', 'music'] },
    { path: '/article/neon-requiem-breakup', title: 'Neon Requiem Announces Breakup After "Final" Show', description: 'Post-punk legends call it quits. Drummer Vex reportedly "still setting up for next practice."', type: 'news', author: 'Sarah Chen', tags: ['neon requiem', 'music', 'breakup'] },
  ],
}

export const VIDTUBE_MANIFEST: SiteManifest = {
  domain: 'vidtube.corn',
  homepage: {
    title: 'VidTube - Broadcast Yourself',
    description: 'Share and watch videos from around the world. Upload your content, subscribe to channels, and discover trending videos.',
    keywords: ['video', 'streaming', 'youtube', 'upload', 'watch', 'creators'],
  },
  seoScore: 85,
  pages: [
    { path: '/watch/quantum_coffee_explained', title: 'I Tried $47 Quantum Coffee for 30 Days - Here\'s What Happened', description: 'Month-long experiment with quantum coffee from Qubit Coffee. Does it actually work?', type: 'video', author: 'ScienceBro', tags: ['quantum coffee', 'experiment', 'review'] },
    { path: '/watch/hartwell_floor_13', title: 'We Snuck Into the Hartwell Building\'s Missing Floor 13 (GONE WRONG)', description: 'Urban exploration of the mysterious missing floor. What we found will... actually it was mostly empty offices.', type: 'video', author: 'ParanormalPatrol', tags: ['hartwell building', 'floor 13', 'urban exploration'] },
    { path: '/watch/trust_fall_tim_best_fails', title: 'Trust Fall Tim\'s Most Epic Falls (21.5% Fail Rate Compilation)', description: 'Compilation of Trust Fall Tim\'s greatest misses including The Incident footage.', type: 'video', author: 'ViralMoments', tags: ['trust fall tim', 'compilation', 'fails'] },
    { path: '/watch/velvet_algorithms_live', title: 'The Velvet Algorithms - Full Set at The Underground (Before Hiatus)', description: 'Complete recording of their last show before the existential crisis hiatus.', type: 'video', author: 'UndergroundRecordings', tags: ['velvet algorithms', 'live', 'concert', 'the underground'] },
    { path: '/watch/neon_requiem_final_show', title: 'Neon Requiem - The Final Show (Full Concert)', description: 'The legendary last performance. Vex cried. We all cried.', type: 'video', author: 'UndergroundRecordings', tags: ['neon requiem', 'final show', 'concert'] },
    { path: '/trending', title: 'Trending on VidTube', description: 'The most popular videos on VidTube right now', type: 'video', tags: ['trending', 'popular'] },
  ],
}

export const FORCHAN_MANIFEST: SiteManifest = {
  domain: 'forchan.corn',
  homepage: {
    title: 'ForChan - Anonymous Imageboard',
    description: 'The stories and information posted here are artistic works of fiction. Anonymous imageboard for memes, discussions, and general chaos.',
    keywords: ['anonymous', 'imageboard', '4chan', 'memes', 'forum'],
  },
  seoScore: 40,
  pages: [
    { path: '/b/', title: '/b/ - Random', description: 'The random board. Rules: none. Expectations: adjust accordingly.', type: 'forum', tags: ['random', 'memes'] },
    { path: '/x/', title: '/x/ - Paranormal', description: 'Paranormal discussion. Hartwell Building threads pinned permanently.', type: 'forum', tags: ['paranormal', 'conspiracy', 'hartwell building'] },
    { path: '/mu/', title: '/mu/ - Music', description: 'Music discussion. Velvet Algorithms tier list threads every hour.', type: 'forum', tags: ['music', 'discussion'] },
  ],
}

// ============================================================================
// Commercial Sites
// ============================================================================

export const AMAIZE_MANIFEST: SiteManifest = {
  domain: 'amaize.corn',
  homepage: {
    title: 'Amaize - The Everything Corn Store',
    description: 'Shop millions of corn-related products with Kernel Prime delivery. From corn holders to quantum coffee makers, we have it all.',
    keywords: ['shopping', 'amazon', 'ecommerce', 'delivery', 'products'],
  },
  seoScore: 80,
  pages: [
    { path: '/product/quantum-coffee-maker', title: 'QuantumBrew Pro 3000 - Quantum Coffee Maker', description: 'The official quantum coffee maker. 847 entanglement settings. $299.99. Derek gave it 5 stars.', type: 'product', tags: ['quantum coffee', 'appliance', 'kitchen'] },
    { path: '/product/trust-fall-mat', title: 'Professional Trust Fall Safety Mat', description: 'The same mat Trust Fall Tim uses (when he remembers). 78.5% softer landings guaranteed.', type: 'product', tags: ['trust fall', 'safety', 'fitness'] },
    { path: '/product/floor-13-detector', title: 'Floor 13 EMF Detector', description: 'Detect anomalies in buildings with "missing" floors. 847 reviews, 4.7 stars.', type: 'product', tags: ['hartwell building', 'paranormal', 'detector'] },
    { path: '/deals', title: 'Amaize Deals', description: 'Today\'s best deals on Amaize. Kernel Prime members save extra.', type: 'product', tags: ['deals', 'savings', 'sale'] },
  ],
}

export const BARGAINBAY_MANIFEST: SiteManifest = {
  domain: 'bargainbay.corn',
  homepage: {
    title: 'BargainBay - Buy. Sell. Maybe Trust.',
    description: 'Local classifieds and marketplace. Find deals, sell your stuff, and hope the buyer actually shows up.',
    keywords: ['classifieds', 'marketplace', 'craigslist', 'buy', 'sell', 'local'],
  },
  seoScore: 65,
  pages: [
    { path: '/for-sale', title: 'Items For Sale - BargainBay', description: 'Browse items for sale in your area', type: 'product', tags: ['for sale', 'listings'] },
    { path: '/housing', title: 'Housing - BargainBay', description: 'Apartments and rooms for rent. Hartwell Building listings... questionable.', type: 'product', tags: ['housing', 'rent', 'apartments'] },
    { path: '/jobs', title: 'Jobs - BargainBay', description: 'Job listings. Omnicorp is always hiring.', type: 'product', tags: ['jobs', 'employment'] },
  ],
}

export const NESTFINDER_MANIFEST: SiteManifest = {
  domain: 'nestfinder.corn',
  homepage: {
    title: 'NestFinder - Find Your Perfect Place',
    description: 'Apartments, houses, and rooms for rent and sale. Search listings, schedule tours, and find your next home.',
    keywords: ['real estate', 'apartments', 'houses', 'rent', 'buy', 'housing'],
  },
  seoScore: 70,
  pages: [
    { path: '/search', title: 'Search Listings - NestFinder', description: 'Search apartments and houses in your area', type: 'product', tags: ['search', 'listings', 'housing'] },
    { path: '/listing/hartwell-building-floor-7', title: 'Hartwell Building Floor 7 - NestFinder', description: 'Spacious office space. Great natural light (from unknown source). Mirrors included. $847/month.', type: 'product', tags: ['hartwell building', 'office', 'rent'] },
  ],
}

export const COBFUNDME_MANIFEST: SiteManifest = {
  domain: 'cobfundme.corn',
  homepage: {
    title: 'CobFundMe - Fund What Matters (To Someone)',
    description: 'Crowdfunding for questionable campaigns since 2019. From medical bills to funding Derek\'s quantum coffee research.',
    keywords: ['crowdfunding', 'fundraiser', 'gofundme', 'donations', 'campaigns'],
  },
  seoScore: 55,
  pages: [
    { path: '/campaign/quantum-coffee-research', title: 'Fund Derek\'s Quantum Coffee Research', description: 'Help Derek prove quantum coffee is real science. $847 raised of $47,000 goal. Jennifer has declined to comment.', type: 'product', author: 'Derek', tags: ['quantum coffee', 'derek', 'research'] },
    { path: '/campaign/trust-fall-tim-medical', title: 'Trust Fall Tim Medical Fund', description: 'Help cover Tim\'s medical bills from the 21.5% of falls that weren\'t caught. Goal: $8,470.', type: 'product', author: 'Carol Henderson', tags: ['trust fall tim', 'medical', 'fundraiser'] },
    { path: '/campaign/save-the-underground', title: 'Save The Underground Venue', description: 'Help Mars keep the doors open. No Wonderwall requesters may donate.', type: 'product', author: 'Mars Williams', tags: ['the underground', 'music venue', 'fundraiser'] },
  ],
}

// ============================================================================
// Q&A and Reference Sites
// ============================================================================

export const ASKCORN_MANIFEST: SiteManifest = {
  domain: 'askcorn.corn',
  homepage: {
    title: 'AskCorn - Where Every Question Pops',
    description: 'Q&A site where questions range from technical programming help to increasingly unhinged philosophical debates.',
    keywords: ['questions', 'answers', 'qa', 'stackoverflow', 'help', 'programming'],
  },
  seoScore: 65,
  pages: [
    { path: '/question/is-quantum-coffee-worth-47', title: 'Is quantum coffee worth $47 per cup?', description: 'I keep hearing about Qubit Coffee and people have strong opinions. Is it worth it or a scam?', type: 'forum', author: 'CuriousCaffeineConsumer', tags: ['quantum coffee', 'review', 'advice'] },
    { path: '/question/what-happened-to-floor-13-hartwell', title: 'What really happened to Floor 13 of the Hartwell Building?', description: 'The elevator skips it but there\'s a locked landing in the stairwell. Something is definitely there.', type: 'forum', author: 'HartwellTenant2019', tags: ['hartwell building', 'floor 13', 'mystery'] },
    { path: '/question/why-does-trust-fall-tim-do-it', title: 'Why does Trust Fall Tim keep doing trust falls?', description: 'Serious question. 2,847 falls. 21.5% failure rate. Multiple injuries. WHY?', type: 'forum', author: 'GenuinelyConcerned', tags: ['trust fall tim', 'psychology'] },
    { path: '/question/how-to-get-unbanned-underground', title: 'How do I get unbanned from The Underground?', description: 'I requested Wonderwall ONE TIME. It\'s been 3 years. Mars won\'t even look at me.', type: 'forum', author: 'Gary', tags: ['the underground', 'wonderwall', 'banned'] },
  ],
}

export const HUSKREVIEWS_MANIFEST: SiteManifest = {
  domain: 'huskreviews.corn',
  homepage: {
    title: 'HuskReviews - Real Reviews. Real Unhinged.',
    description: 'Local business reviews from increasingly unhinged customers. Find the best (and worst) places in town.',
    keywords: ['reviews', 'business', 'yelp', 'local', 'restaurants', 'ratings'],
  },
  seoScore: 60,
  pages: [
    { path: '/business/qubit-coffee', title: 'Qubit Coffee Reviews - HuskReviews', description: '$47 coffee shop in the Hartwell Building. Reviews range from "life-changing" to "expensive water."', type: 'business', tags: ['quantum coffee', 'coffee shop', 'reviews'] },
    { path: '/business/the-underground', title: 'The Underground Reviews - HuskReviews', description: 'Music venue. 4.8 stars average. Minus 1 star for the Wonderwall ban according to Gary.', type: 'business', tags: ['the underground', 'music venue', 'reviews'] },
    { path: '/business/hartwell-building-lobby-cafe', title: 'Hartwell Building Lobby Cafe Reviews - HuskReviews', description: 'Just a normal cafe. Nothing weird. Please don\'t ask about Floor 13.', type: 'business', tags: ['hartwell building', 'cafe', 'reviews'] },
  ],
}

// ============================================================================
// Tech and Developer Sites
// ============================================================================

export const COBHUB_MANIFEST: SiteManifest = {
  domain: 'cobhub.corn',
  homepage: {
    title: 'CobHub - Where Every Commit is a Kernel of Truth',
    description: 'Code repository hosting for open source projects. Fork repos, submit pull requests, and collaborate on code.',
    keywords: ['code', 'github', 'git', 'repository', 'programming', 'open source'],
  },
  seoScore: 70,
  pages: [
    { path: '/derek/quantum-coffee-calculator', title: 'derek/quantum-coffee-calculator - CobHub', description: 'Calculate optimal quantum entanglement ratios for coffee brewing. 847 stars. Derek\'s magnum opus.', type: 'wiki', author: 'derek', tags: ['quantum coffee', 'calculator', 'open source'] },
    { path: '/paranormal-patrol/floor-13-detector', title: 'paranormal-patrol/floor-13-detector - CobHub', description: 'Arduino project to detect hidden floors in buildings. Uses EMF sensors and existential dread.', type: 'wiki', author: 'paranormal-patrol', tags: ['hartwell building', 'floor 13', 'arduino'] },
    { path: '/trustfallstats/fall-tracker', title: 'trustfallstats/fall-tracker - CobHub', description: 'Open source trust fall tracking application. Logs fall attempts, catch rates, and injury severity.', type: 'wiki', author: 'trustfallstats', tags: ['trust fall tim', 'statistics', 'tracker'] },
  ],
}

export const KERNELPODS_MANIFEST: SiteManifest = {
  domain: 'kernelpods.corn',
  homepage: {
    title: 'KernelPods - Where Every Story Has a Kernel of Truth',
    description: 'Podcast platform featuring shows on everything from true crime to quantum coffee conspiracy theories.',
    keywords: ['podcast', 'audio', 'shows', 'episodes', 'listen'],
  },
  seoScore: 55,
  pages: [
    { path: '/show/quantum-coffee-confessions', title: 'Quantum Coffee Confessions - KernelPods', description: 'Weekly podcast about quantum coffee culture. Host: Derek. Guest: Usually just Derek.', type: 'entertainment', author: 'Derek', tags: ['quantum coffee', 'podcast', 'derek'] },
    { path: '/show/hartwell-files-podcast', title: 'The Hartwell Files Podcast - KernelPods', description: 'Deep dives into the Hartwell Building mystery. Floor 13 special episodes. 847 subscribers.', type: 'entertainment', tags: ['hartwell building', 'mystery', 'podcast'] },
    { path: '/show/trust-falls-with-tim', title: 'Trust Falls with Tim - KernelPods', description: 'Tim interviews people who caught him. And people who didn\'t. Emotional.', type: 'entertainment', author: 'Trust Fall Tim', tags: ['trust fall tim', 'interviews', 'podcast'] },
  ],
}

// ============================================================================
// Parody and Meme Sites
// ============================================================================

export const CORNHUB_MANIFEST: SiteManifest = {
  domain: 'cornhub.corn',
  homepage: {
    title: 'CornHub - Free Corn Recipes',
    description: 'The world\'s largest collection of free corn recipes. What did you think it was? Corn on the cob, cornbread, popcorn, and more.',
    keywords: ['corn', 'recipes', 'cooking', 'food', 'cornbread'],
  },
  seoScore: 65,
  pages: [
    { path: '/recipe/quantum-cornbread', title: 'Quantum Cornbread Recipe - CornHub', description: 'Cornbread made with quantum coffee. Derek\'s recipe. Jennifer rated it 1 star.', type: 'wiki', tags: ['cornbread', 'recipe', 'quantum coffee'] },
    { path: '/recipe/classic-corn-cob', title: 'Classic Corn on the Cob - CornHub', description: 'The classic. Butter, salt, perfection.', type: 'wiki', tags: ['corn', 'recipe', 'classic'] },
    { path: '/categories', title: 'Recipe Categories - CornHub', description: 'Browse corn recipes by category', type: 'wiki', tags: ['recipes', 'categories'] },
  ],
}

export const ONLYFANS_MANIFEST: SiteManifest = {
  domain: 'onlyfans.corn',
  homepage: {
    title: 'OnlyFans - Premium Fans for Enthusiasts',
    description: 'The #1 destination for fan enthusiasts. Premium ceiling fans, desk fans, box fans, and oscillating fans. What did you think it was?',
    keywords: ['fans', 'ceiling fans', 'desk fans', 'cooling', 'appliances'],
  },
  seoScore: 50,
  pages: [
    { path: '/premium-ceiling', title: 'Premium Ceiling Fans - OnlyFans', description: 'Our exclusive collection of ceiling fans. Some with 8 blades. Some with 47.', type: 'product', tags: ['ceiling fan', 'premium'] },
    { path: '/desk-collection', title: 'Desk Fan Collection - OnlyFans', description: 'Keep cool at work with our desk fans. Quiet operation. Powerful airflow.', type: 'product', tags: ['desk fan', 'office'] },
  ],
}

export const ONLYFARMS_MANIFEST: SiteManifest = {
  domain: 'onlyfarms.corn',
  homepage: {
    title: 'OnlyFarms - Where Equipment Gets Exposed',
    description: 'Premium agricultural equipment marketplace. Tractors, combines, harvesters, and more. What did you think it was?',
    keywords: ['farming', 'tractors', 'agriculture', 'equipment', 'farm'],
  },
  seoScore: 50,
  pages: [
    { path: '/tractors', title: 'Tractors - OnlyFarms', description: 'Browse our selection of new and used tractors', type: 'product', tags: ['tractors', 'farming'] },
    { path: '/combines', title: 'Combines - OnlyFarms', description: 'Combine harvesters for serious farmers', type: 'product', tags: ['combines', 'harvest'] },
  ],
}

export const STRANGERZONE_MANIFEST: SiteManifest = {
  domain: 'strangerzone.corn',
  homepage: {
    title: 'StrangerZone - Talk to Strangers. Regret It Later.',
    description: 'Random anonymous chat with strangers. You never know who you\'ll meet - or what weird conversation awaits.',
    keywords: ['chat', 'anonymous', 'strangers', 'random', 'omegle'],
  },
  seoScore: 45,
  pages: [
    { path: '/chat', title: 'Start Chatting - StrangerZone', description: 'Connect with a random stranger now', type: 'social', tags: ['chat', 'random'] },
  ],
}

// ============================================================================
// Specialized Sites
// ============================================================================

export const GOOBER_MANIFEST: SiteManifest = {
  domain: 'goober.corn',
  homepage: {
    title: 'Goober - Search the Corn Internet',
    description: 'The search engine for the .corn internet. Find anything across all sites with full-text search and smart ranking.',
    keywords: ['search', 'google', 'find', 'search engine'],
  },
  seoScore: 95,
  pages: [],
}

export const CORNMAPS_MANIFEST: SiteManifest = {
  domain: 'cornmaps.corn',
  homepage: {
    title: 'CornMaps - Navigation With a Twist',
    description: 'Get directions to anywhere. Every destination has something slightly off about it. Trust the route. Maybe.',
    keywords: ['maps', 'directions', 'navigation', 'google maps', 'gps'],
  },
  seoScore: 70,
  pages: [
    { path: '/place/hartwell-building', title: 'Hartwell Building - CornMaps', description: '123 Main St. 14 floors. Definitely not 15. Reviews mention the elevator acting strangely.', type: 'website', tags: ['hartwell building', 'directions'] },
    { path: '/place/the-underground', title: 'The Underground - CornMaps', description: 'Basement level, old Meridian Theater. No parking. No Wonderwall.', type: 'website', tags: ['the underground', 'directions'] },
    { path: '/place/qubit-coffee', title: 'Qubit Coffee - CornMaps', description: 'Hartwell Building Lobby. Open 8am-6pm. Closed during quantum maintenance.', type: 'website', tags: ['qubit coffee', 'quantum coffee', 'directions'] },
  ],
}

export const CORNMD_MANIFEST: SiteManifest = {
  domain: 'cornmd.corn',
  homepage: {
    title: 'CornMD - Your Symptoms. Our Corn Expertise.',
    description: 'Medical symptom checker that somehow diagnoses everything as corn-related. Headache? Probably corn deficiency.',
    keywords: ['medical', 'symptoms', 'health', 'webmd', 'doctor'],
  },
  seoScore: 60,
  pages: [
    { path: '/symptom-checker', title: 'Symptom Checker - CornMD', description: 'Enter your symptoms. We\'ll tell you it\'s corn-related.', type: 'website', tags: ['symptoms', 'diagnosis'] },
  ],
}

export const LINKEDCORN_MANIFEST: SiteManifest = {
  domain: 'linkedcorn.corn',
  homepage: {
    title: 'LinkedCorn - Professional Corn Networking',
    description: 'The professional network for agricultural excellence. Connect with corn industry professionals and grow your career.',
    keywords: ['professional', 'networking', 'linkedin', 'jobs', 'career'],
  },
  seoScore: 65,
  pages: [
    { path: '/jobs', title: 'Corn Industry Jobs - LinkedCorn', description: 'Find your next opportunity in the corn industry', type: 'website', tags: ['jobs', 'career', 'corn'] },
  ],
}

export const STALK_MANIFEST: SiteManifest = {
  domain: 'stalk.corn',
  homepage: {
    title: 'Stalk - Watch Together. Grow Together.',
    description: 'Live streaming platform named after corn stalks, obviously. Watch gamers, musicians, and other creators live.',
    keywords: ['streaming', 'live', 'twitch', 'gaming', 'creators'],
  },
  seoScore: 55,
  pages: [
    { path: '/directory', title: 'Browse Streams - Stalk', description: 'Find live streams to watch', type: 'entertainment', tags: ['streams', 'live', 'browse'] },
  ],
}

export const CORNDR_MANIFEST: SiteManifest = {
  domain: 'corndr.corn',
  homepage: {
    title: 'Corndr - Where Corn Lovers Connect',
    description: 'Dating app for people in the corn industry and people who are just really into corn. Swipe right on your soulmate.',
    keywords: ['dating', 'tinder', 'romance', 'relationships', 'corn'],
  },
  seoScore: 45,
  pages: [],
}

// ============================================================================
// Blog Sites (Lore Characters)
// ============================================================================

export const QUANTUMBREWBLOG_MANIFEST: SiteManifest = {
  domain: 'quantumbrewblog.corn',
  homepage: {
    title: 'QuantumBrewBlog - Derek\'s Quantum Coffee Journey',
    description: 'Observing coffee so you don\'t have to. Derek documents his 847 trials of quantum brewing. Jennifer left him over this.',
    keywords: ['quantum coffee', 'derek', 'blog', 'coffee', 'obsession'],
  },
  seoScore: 55,
  pages: [
    { path: '/trial-847', title: 'Trial #847: The Breakthrough? - QuantumBrewBlog', description: 'Derek documents what he believes is his breakthrough trial. Jennifer\'s lawyer sent another letter.', type: 'blog', author: 'Derek', tags: ['quantum coffee', 'trial', 'experiment'] },
    { path: '/martinez-study-analysis', title: 'My Analysis of the Martinez Study - QuantumBrewBlog', description: 'Why Derek believes Dr. Martinez is wrong about her own research.', type: 'blog', author: 'Derek', tags: ['martinez study', 'analysis', 'quantum coffee'] },
  ],
}

export const TRUSTFALLTIM_MANIFEST: SiteManifest = {
  domain: 'trustfalltim.corn',
  homepage: {
    title: 'TrustFallTim.fan - The Official Unofficial Fan Archive',
    description: 'The complete archive of Trust Fall Tim\'s 2,847 documented falls. Includes The Incident footage (viewer discretion advised).',
    keywords: ['trust fall tim', 'fan site', 'archive', 'falls', 'the incident'],
  },
  seoScore: 55,
  pages: [
    { path: '/the-incident', title: 'The Incident - TrustFallTim Fan Archive', description: 'Full documentation of The Incident involving Small Kevin. Viewer discretion advised.', type: 'blog', tags: ['the incident', 'small kevin', 'trust fall tim'] },
    { path: '/statistics', title: 'Trust Fall Statistics - TrustFallTim Fan Archive', description: '2,847 falls. 78.5% catch rate. Complete statistical analysis.', type: 'blog', tags: ['statistics', 'trust fall tim'] },
    { path: '/carols-perspective', title: 'Carol\'s Letters (Tim\'s Mom) - TrustFallTim Fan Archive', description: 'Collection of concerned blog posts from Tim\'s mother Carol.', type: 'blog', author: 'Carol Henderson', tags: ['carol', 'mom', 'concern'] },
  ],
}

export const HARTWELLFILES_MANIFEST: SiteManifest = {
  domain: 'hartwellfiles.corn',
  homepage: {
    title: 'The Hartwell Files - The Truth Is In There',
    description: 'Conspiracy archive about the Hartwell Building. Floor 13, the mirrors on Floor 7, Omnicorp Holdings, and the number 847.',
    keywords: ['hartwell building', 'conspiracy', 'floor 13', 'mystery', 'omnicorp'],
  },
  seoScore: 50,
  pages: [
    { path: '/floor-13', title: 'Floor 13: The Evidence - Hartwell Files', description: 'Complete documentation of the missing floor. Architectural surveys, witness accounts, elevator anomalies.', type: 'blog', tags: ['floor 13', 'evidence', 'hartwell building'] },
    { path: '/floor-7-mirrors', title: 'The Floor 7 Mirror Phenomenon - Hartwell Files', description: 'Reports of mirrors showing things that aren\'t there. Or aren\'t here. Or aren\'t anywhere.', type: 'blog', tags: ['floor 7', 'mirrors', 'hartwell building'] },
    { path: '/omnicorp-investigation', title: 'Who is Omnicorp Holdings? - Hartwell Files', description: 'Investigation into the mysterious corporation. Patricia from HR declined to comment.', type: 'blog', tags: ['omnicorp', 'investigation', 'hartwell building'] },
    { path: '/847-phenomenon', title: 'The 847 Phenomenon - Hartwell Files', description: 'Why does this number keep appearing? Trust Fall Tim: 2,847. Derek\'s trials: 847. Building address: 847 Main St.', type: 'blog', tags: ['847', 'numerology', 'pattern'] },
  ],
}

// ============================================================================
// All Manifests Export
// ============================================================================

/**
 * All site manifests in one array.
 * Import this in site-registry or anywhere that needs all manifests.
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
  // Q&A
  ASKCORN_MANIFEST,
  HUSKREVIEWS_MANIFEST,
  // Tech
  COBHUB_MANIFEST,
  KERNELPODS_MANIFEST,
  // Parody
  CORNHUB_MANIFEST,
  ONLYFANS_MANIFEST,
  ONLYFARMS_MANIFEST,
  STRANGERZONE_MANIFEST,
  // Specialized
  GOOBER_MANIFEST,
  CORNMAPS_MANIFEST,
  CORNMD_MANIFEST,
  LINKEDCORN_MANIFEST,
  STALK_MANIFEST,
  CORNDR_MANIFEST,
  // Blogs
  QUANTUMBREWBLOG_MANIFEST,
  TRUSTFALLTIM_MANIFEST,
  HARTWELLFILES_MANIFEST,
]

/**
 * Get manifest by domain
 */
export function getManifestByDomain(domain: string): SiteManifest | undefined {
  const normalized = domain.toLowerCase().replace(/^www\./, '')
  return ALL_SITE_MANIFESTS.find(m => m.domain === normalized)
}

export default ALL_SITE_MANIFESTS
