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
  pages: [
    { path: '/browse', title: 'Browse MyFace Profiles', description: 'Discover new friends and browse profiles on MyFace', type: 'social', tags: ['browse', 'discover', 'profiles'] },
    { path: '/messages', title: 'MyFace Messages', description: 'Message your friends on MyFace', type: 'social', tags: ['messages', 'chat', 'dm'] },
    { path: '/dating', title: 'MyFace Dating', description: 'Find your special someone on MyFace Dating', type: 'social', tags: ['dating', 'romance', 'match'] },
  ],
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
  pages: [
    { path: '/explore', title: 'Explore InstaSnap', description: 'Discover trending photos and creators on InstaSnap', type: 'social', tags: ['explore', 'trending', 'discover'] },
    { path: '/stories', title: 'InstaSnap Stories', description: '24-hour stories from people you follow', type: 'social', tags: ['stories', 'ephemeral'] },
  ],
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
  pages: [
    // Threadits (communities)
    { path: '/t/QuantumCoffee', title: 't/QuantumCoffee - Threadit', description: 'The unofficial threadit for quantum coffee enthusiasts. Derek is a mod.', type: 'forum', tags: ['quantum coffee', 'derek', 'coffee'] },
    { path: '/t/HartwellBuilding', title: 't/HartwellBuilding - Threadit', description: 'Theories, sightings, and investigations into the Hartwell Building mystery', type: 'forum', tags: ['hartwell', 'floor 13', 'mystery', 'conspiracy'] },
    { path: '/t/TrustFallTim', title: 't/TrustFallTim - Threadit', description: 'Fan community for Trust Fall Tim. Fall statistics, meet-up planning, and The Incident discussions.', type: 'forum', tags: ['trust fall tim', 'fan', 'community'] },
    { path: '/t/LocalMusic', title: 't/LocalMusic - Threadit', description: 'Local music scene discussion. Velvet Algorithms updates, Underground shows, Neon Requiem memorials.', type: 'forum', tags: ['music', 'local', 'velvet algorithms', 'neon requiem', 'underground'] },
    { path: '/t/Cornfield', title: 't/Cornfield - Threadit', description: 'General discussion for Cornfield, KS residents and enthusiasts', type: 'forum', tags: ['local', 'cornfield', 'community'] },
    { path: '/t/AskThreadit', title: 't/AskThreadit - Threadit', description: 'Ask and answer thought-provoking questions on any topic', type: 'forum', tags: ['questions', 'discussion', 'community'] },
    // Needles (posts nested under threadits)
    { path: '/t/HartwellBuilding/n/theory_floor_13_is_a_dimensional_pocket', title: '[THEORY] Floor 13 is a dimensional pocket', description: 'Conspiracy theory about the missing Hartwell Building floor.', type: 'forum', tags: ['hartwell', 'floor 13', 'conspiracy', 'theory'], parent: '/t/HartwellBuilding' },
    { path: '/t/TrustFallTim/n/i_was_there_for_the_incident_ama', title: 'I was there for The Incident. AMA.', description: 'Eyewitness account of the infamous Trust Fall Tim incident.', type: 'forum', tags: ['trust fall tim', 'the incident', 'small kevin', 'ama'], parent: '/t/TrustFallTim' },
    { path: '/t/QuantumCoffee/n/dr_martinez_clarification_about_her_study', title: 'Dr. Martinez clarification about her study', description: 'Derek posts about Dr. Martinez repeatedly clarifying her study was NOT about coffee.', type: 'forum', tags: ['martinez study', 'quantum coffee', 'derek'], parent: '/t/QuantumCoffee' },
    { path: '/t/AskThreadit/n/whats_your_towns_open_secret', title: 'What\'s your town\'s open secret?', description: 'Viral thread about local secrets everyone knows but nobody talks about.', type: 'forum', tags: ['secrets', 'local', 'viral'], parent: '/t/AskThreadit' },
    { path: '/t/LocalMusic/n/mars_banned_another_wonderwall_requester', title: 'Mars banned another Wonderwall requester', description: 'The Underground owner permanently bans yet another person for requesting Wonderwall.', type: 'forum', tags: ['mars', 'underground', 'wonderwall', 'banned'], parent: '/t/LocalMusic' },
  ],
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
  pages: [
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
  pages: [
    // Boards
    { path: '/b', title: '/b/ - Random', description: 'The random board. Rules: none. Expectations: adjust accordingly.', type: 'forum', tags: ['random', 'memes'] },
    { path: '/g', title: '/g/ - Technology', description: 'Install Gentoo. Also quantum coffee machine debates.', type: 'forum', tags: ['technology', 'programming', 'hardware'] },
    { path: '/mu', title: '/mu/ - Music', description: 'Music discussion. Velvet Algorithms tier list threads every hour.', type: 'forum', tags: ['music', 'discussion'] },
    { path: '/ck', title: '/ck/ - Food & Cooking', description: 'How do I make pasta that doesn\'t taste like sadness?', type: 'forum', tags: ['food', 'cooking', 'recipes'] },
    { path: '/x', title: '/x/ - Paranormal', description: 'Paranormal discussion. Hartwell Building threads pinned permanently.', type: 'forum', tags: ['paranormal', 'conspiracy', 'hartwell building'] },
    { path: '/sci', title: '/sci/ - Science & Math', description: 'For the scientifically minded. Martinez study debates welcome.', type: 'forum', tags: ['science', 'math', 'physics'] },
    { path: '/diy', title: '/diy/ - Do It Yourself', description: 'You can probably fix that yourself, right?', type: 'forum', tags: ['diy', 'repair', 'projects'] },
    { path: '/adv', title: '/adv/ - Advice', description: 'Life lessons from anonymous strangers', type: 'forum', tags: ['advice', 'life', 'relationships'] },
    // Notable threads (nested under boards in actual site navigation)
    { path: '/g/thread/94817234', title: 'Quantum Coffee Machine General /qcg/', description: 'Sticky thread for quantum coffee machine discussion on /g/', type: 'forum', tags: ['quantum coffee', 'technology'], parent: '/g' },
    { path: '/x/thread/94812456', title: 'Hartwell Building - New Evidence', description: 'Anonymous claims cousin found sealed documents about the Hartwell incident', type: 'forum', tags: ['hartwell', 'conspiracy', 'paranormal'], parent: '/x' },
    { path: '/mu/thread/94815102', title: 'Velvet Algorithms Appreciation Thread', description: 'Discussion of the existential crisis show cancellation at The Underground', type: 'forum', tags: ['velvet algorithms', 'music', 'the underground'], parent: '/mu' },
  ],
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
  pages: [
    { path: '/product/quantum-coffee-maker', title: 'QuantumBrew Pro 3000 - Quantum Coffee Maker', description: 'The official quantum coffee maker. 847 entanglement settings. $299.99. Derek gave it 5 stars.', type: 'product', tags: ['quantum coffee', 'appliance', 'kitchen'] },
    { path: '/product/trust-fall-mat', title: 'Professional Trust Fall Safety Mat', description: 'The same mat Trust Fall Tim uses (when he remembers). 78.5% softer landings guaranteed.', type: 'product', tags: ['trust fall', 'safety', 'fitness'] },
    { path: '/product/floor-13-detector', title: 'Floor 13 EMF Detector', description: 'Detect anomalies in buildings with "missing" floors. 847 reviews, 4.7 stars.', type: 'product', tags: ['hartwell building', 'paranormal', 'detector'] },
    { path: '/deals', title: 'Amaize Deals', description: 'Today\'s best deals on Amaize. Kernel Prime members save extra.', type: 'product', tags: ['deals', 'savings', 'sale'] },
  ],
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
  pages: [
    { path: '/for-sale', title: 'Items For Sale - BargainBay', description: 'Browse items for sale in your area', type: 'product', tags: ['for sale', 'listings'] },
    { path: '/housing', title: 'Housing - BargainBay', description: 'Apartments and rooms for rent. Hartwell Building listings... questionable.', type: 'product', tags: ['housing', 'rent', 'apartments'] },
    { path: '/jobs', title: 'Jobs - BargainBay', description: 'Job listings. Omnicorp is always hiring.', type: 'product', tags: ['jobs', 'employment'] },
  ],
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
  pages: [
    { path: '/search', title: 'Search Listings - NestFinder', description: 'Search apartments and houses in your area', type: 'product', tags: ['search', 'listings', 'housing'] },
    { path: '/listing/hartwell-building-floor-7', title: 'Hartwell Building Floor 7 - NestFinder', description: 'Spacious office space. Great natural light (from unknown source). Mirrors included. $847/month.', type: 'product', tags: ['hartwell building', 'office', 'rent'] },
  ],
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
  pages: [
    { path: '/campaign/quantum-coffee-research', title: 'Fund Derek\'s Quantum Coffee Research', description: 'Help Derek prove quantum coffee is real science. $847 raised of $47,000 goal. Jennifer has declined to comment.', type: 'product', author: 'Derek', tags: ['quantum coffee', 'derek', 'research'] },
    { path: '/campaign/trust-fall-tim-medical', title: 'Trust Fall Tim Medical Fund', description: 'Help cover Tim\'s medical bills from the 21.5% of falls that weren\'t caught. Goal: $8,470.', type: 'product', author: 'Carol Henderson', tags: ['trust fall tim', 'medical', 'fundraiser'] },
    { path: '/campaign/save-the-underground', title: 'Save The Underground Venue', description: 'Help Mars keep the doors open. No Wonderwall requesters may donate.', type: 'product', author: 'Mars Williams', tags: ['the underground', 'music venue', 'fundraiser'] },
  ],
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
  pages: [
    { path: '/question/is-quantum-coffee-worth-47', title: 'Is quantum coffee worth $47 per cup?', description: 'I keep hearing about Qubit Coffee and people have strong opinions. Is it worth it or a scam?', type: 'forum', author: 'CuriousCaffeineConsumer', tags: ['quantum coffee', 'review', 'advice'] },
    { path: '/question/what-happened-to-floor-13-hartwell', title: 'What really happened to Floor 13 of the Hartwell Building?', description: 'The elevator skips it but there\'s a locked landing in the stairwell. Something is definitely there.', type: 'forum', author: 'HartwellTenant2019', tags: ['hartwell building', 'floor 13', 'mystery'] },
    { path: '/question/why-does-trust-fall-tim-do-it', title: 'Why does Trust Fall Tim keep doing trust falls?', description: 'Serious question. 2,847 falls. 21.5% failure rate. Multiple injuries. WHY?', type: 'forum', author: 'GenuinelyConcerned', tags: ['trust fall tim', 'psychology'] },
    { path: '/question/how-to-get-unbanned-underground', title: 'How do I get unbanned from The Underground?', description: 'I requested Wonderwall ONE TIME. It\'s been 3 years. Mars won\'t even look at me.', type: 'forum', author: 'Gary', tags: ['the underground', 'wonderwall', 'banned'] },
  ],
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
  pages: [
    { path: '/business/qubit-coffee', title: 'Qubit Coffee Reviews - HuskReviews', description: '$47 coffee shop in the Hartwell Building. Reviews range from "life-changing" to "expensive water."', type: 'blog', tags: ['quantum coffee', 'coffee shop', 'reviews'] },
    { path: '/business/the-underground', title: 'The Underground Reviews - HuskReviews', description: 'Music venue. 4.8 stars average. Minus 1 star for the Wonderwall ban according to Gary.', type: 'blog', tags: ['the underground', 'music venue', 'reviews'] },
    { path: '/business/hartwell-building-lobby-cafe', title: 'Hartwell Building Lobby Cafe Reviews - HuskReviews', description: 'Just a normal cafe. Nothing weird. Please don\'t ask about Floor 13.', type: 'blog', tags: ['hartwell building', 'cafe', 'reviews'] },
  ],
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
  pages: [
    { path: '/derek/quantum-coffee-calculator', title: 'derek/quantum-coffee-calculator - CobHub', description: 'Calculate optimal quantum entanglement ratios for coffee brewing. 847 stars. Derek\'s magnum opus.', type: 'wiki', author: 'derek', tags: ['quantum coffee', 'calculator', 'open source'] },
    { path: '/paranormal-patrol/floor-13-detector', title: 'paranormal-patrol/floor-13-detector - CobHub', description: 'Arduino project to detect hidden floors in buildings. Uses EMF sensors and existential dread.', type: 'wiki', author: 'paranormal-patrol', tags: ['hartwell building', 'floor 13', 'arduino'] },
    { path: '/trustfallstats/fall-tracker', title: 'trustfallstats/fall-tracker - CobHub', description: 'Open source trust fall tracking application. Logs fall attempts, catch rates, and injury severity.', type: 'wiki', author: 'trustfallstats', tags: ['trust fall tim', 'statistics', 'tracker'] },
  ],
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
  pages: [
    { path: '/show/quantum-coffee-confessions', title: 'Quantum Coffee Confessions - KernelPods', description: 'Weekly podcast about quantum coffee culture. Host: Derek. Guest: Usually just Derek.', type: 'entertainment', author: 'Derek', tags: ['quantum coffee', 'podcast', 'derek'] },
    { path: '/show/hartwell-files-podcast', title: 'The Hartwell Files Podcast - KernelPods', description: 'Deep dives into the Hartwell Building mystery. Floor 13 special episodes. 847 subscribers.', type: 'entertainment', tags: ['hartwell building', 'mystery', 'podcast'] },
    { path: '/show/trust-falls-with-tim', title: 'Trust Falls with Tim - KernelPods', description: 'Tim interviews people who caught him. And people who didn\'t. Emotional.', type: 'entertainment', author: 'Trust Fall Tim', tags: ['trust fall tim', 'interviews', 'podcast'] },
  ],
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
  pages: [
    { path: '/recipe/quantum-cornbread', title: 'Quantum Cornbread Recipe - CornHub', description: 'Cornbread made with quantum coffee. Derek\'s recipe. Jennifer rated it 1 star.', type: 'wiki', tags: ['cornbread', 'recipe', 'quantum coffee'] },
    { path: '/recipe/classic-corn-cob', title: 'Classic Corn on the Cob - CornHub', description: 'The classic. Butter, salt, perfection.', type: 'wiki', tags: ['corn', 'recipe', 'classic'] },
    { path: '/categories', title: 'Recipe Categories - CornHub', description: 'Browse corn recipes by category', type: 'wiki', tags: ['recipes', 'categories'] },
  ],
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
  pages: [
    { path: '/premium-ceiling', title: 'Premium Ceiling Fans - OnlyFans', description: 'Our exclusive collection of ceiling fans. Some with 8 blades. Some with 47.', type: 'product', tags: ['ceiling fan', 'premium'] },
    { path: '/desk-collection', title: 'Desk Fan Collection - OnlyFans', description: 'Keep cool at work with our desk fans. Quiet operation. Powerful airflow.', type: 'product', tags: ['desk fan', 'office'] },
  ],
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
  pages: [
    { path: '/tractors', title: 'Tractors - OnlyFarms', description: 'Browse our selection of new and used tractors', type: 'product', tags: ['tractors', 'farming'] },
    { path: '/combines', title: 'Combines - OnlyFarms', description: 'Combine harvesters for serious farmers', type: 'product', tags: ['combines', 'harvest'] },
  ],
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
  pages: [
    { path: '/chat', title: 'Start Chatting - StrangerZone', description: 'Connect with a random stranger now', type: 'social', tags: ['chat', 'random'] },
  ],
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
  pages: [
    { path: '/chat', title: 'Chat with cornGPT', description: 'Start a conversation with cornGPT, the AI assistant that knows everything about the .corn internet.', type: 'website', tags: ['chat', 'ai', 'conversation'] },
    { path: '/about', title: 'About cornGPT - CloseAI', description: 'Learn about cornGPT, the revolutionary AI from CloseAI. Trained on 847 petabytes of corn-adjacent data.', type: 'website', tags: ['about', 'closeai', 'ai'] },
    { path: '/modes', title: 'cornGPT Fun Modes', description: 'Enable special modes like "Cheat On My Test", "Dunk Screenshot Mode", "Corporate Buzzword Generator", and more.', type: 'website', tags: ['modes', 'features', 'fun'] },
  ],
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
  pages: [
    { path: '/market/trust-fall-tim-3000', title: 'Will Trust Fall Tim reach 3,000 falls?', description: 'Currently at 2,847 falls with 78.5% catch rate. Bet on whether Tim hits the milestone.', type: 'entertainment', tags: ['trust-fall-tim', 'prediction', 'betting'] },
    { path: '/market/floor-13-confirmed', title: 'Will Floor 13 be confirmed to exist?', description: 'The Hartwell Building mystery. Building management says no, the elevator says maybe.', type: 'entertainment', tags: ['hartwell', 'floor-13', 'conspiracy', 'betting'] },
    { path: '/market/derek-jennifer-reconciliation', title: 'Will Derek and Jennifer reconcile?', description: 'Jennifer left Derek over quantum coffee. Current odds: 8% YES. Derek remains optimistic.', type: 'entertainment', tags: ['derek', 'jennifer', 'relationship', 'betting'] },
    { path: '/market/gary-underground-unban', title: 'Will Gary get unbanned from The Underground?', description: 'Gary requested Wonderwall ONE TIME. Mars has maintained the ban for 3+ years. Current odds: 3% YES.', type: 'entertainment', tags: ['gary', 'wonderwall', 'underground', 'betting'] },
    { path: '/market/velvet-algorithms-hiatus-end', title: 'Will The Velvet Algorithms end their hiatus?', description: 'The electronic duo has been on meditation hiatus. Will they return to music?', type: 'entertainment', tags: ['velvet-algorithms', 'music', 'betting'] },
    { path: '/market/neon-requiem-reunion', title: 'Will Neon Requiem play a reunion show?', description: 'The post-punk legends broke up. Vex still sets up for practice. Will they reunite?', type: 'entertainment', tags: ['neon-requiem', 'reunion', 'music', 'betting'] },
  ],
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
  pages: [
    { path: '/place/hartwell-building', title: 'Hartwell Building - CornMaps', description: '123 Main St. 14 floors. Definitely not 15. Reviews mention the elevator acting strangely.', type: 'website', tags: ['hartwell building', 'directions'] },
    { path: '/place/the-underground', title: 'The Underground - CornMaps', description: 'Basement level, old Meridian Theater. No parking. No Wonderwall.', type: 'website', tags: ['the underground', 'directions'] },
    { path: '/place/qubit-coffee', title: 'Qubit Coffee - CornMaps', description: 'Hartwell Building Lobby. Open 8am-6pm. Closed during quantum maintenance.', type: 'website', tags: ['qubit coffee', 'quantum coffee', 'directions'] },
  ],
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
  pages: [
    { path: '/symptom-checker', title: 'Symptom Checker - CornMD', description: 'Enter your symptoms. We\'ll tell you it\'s corn-related.', type: 'website', tags: ['symptoms', 'diagnosis'] },
  ],
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
  pages: [
    { path: '/jobs', title: 'Corn Industry Jobs - LinkedCorn', description: 'Find your next opportunity in the corn industry', type: 'website', tags: ['jobs', 'career', 'corn'] },
  ],
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
  pages: [
    { path: '/directory', title: 'Browse Streams - Stalk', description: 'Find live streams to watch', type: 'entertainment', tags: ['streams', 'live', 'browse'] },
  ],
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
  pages: [
    { path: '/trial-847', title: 'Trial #847: The Breakthrough? - QuantumBrewBlog', description: 'Derek documents what he believes is his breakthrough trial. Jennifer\'s lawyer sent another letter.', type: 'blog', author: 'Derek', tags: ['quantum coffee', 'trial', 'experiment'] },
    { path: '/martinez-study-analysis', title: 'My Analysis of the Martinez Study - QuantumBrewBlog', description: 'Why Derek believes Dr. Martinez is wrong about her own research.', type: 'blog', author: 'Derek', tags: ['martinez study', 'analysis', 'quantum coffee'] },
  ],
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
  pages: [
    { path: '/the-incident', title: 'The Incident - TrustFallTim Fan Archive', description: 'Full documentation of The Incident involving Small Kevin. Viewer discretion advised.', type: 'blog', tags: ['the incident', 'small kevin', 'trust fall tim'] },
    { path: '/statistics', title: 'Trust Fall Statistics - TrustFallTim Fan Archive', description: '2,847 falls. 78.5% catch rate. Complete statistical analysis.', type: 'blog', tags: ['statistics', 'trust fall tim'] },
    { path: '/carols-perspective', title: 'Carol\'s Letters (Tim\'s Mom) - TrustFallTim Fan Archive', description: 'Collection of concerned blog posts from Tim\'s mother Carol.', type: 'blog', author: 'Carol Henderson', tags: ['carol', 'mom', 'concern'] },
  ],
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
  pages: [
    { path: '/floor-13', title: 'Floor 13: The Evidence - Hartwell Files', description: 'Complete documentation of the missing floor. Architectural surveys, witness accounts, elevator anomalies.', type: 'blog', tags: ['floor 13', 'evidence', 'hartwell building'] },
    { path: '/floor-7-mirrors', title: 'The Floor 7 Mirror Phenomenon - Hartwell Files', description: 'Reports of mirrors showing things that aren\'t there. Or aren\'t here. Or aren\'t anywhere.', type: 'blog', tags: ['floor 7', 'mirrors', 'hartwell building'] },
    { path: '/omnicorp-investigation', title: 'Who is Omnicorp Holdings? - Hartwell Files', description: 'Investigation into the mysterious corporation. Patricia from HR declined to comment.', type: 'blog', tags: ['omnicorp', 'investigation', 'hartwell building'] },
    { path: '/847-phenomenon', title: 'The 847 Phenomenon - Hartwell Files', description: 'Why does this number keep appearing? Trust Fall Tim: 2,847. Derek\'s trials: 847. Building address: 847 Main St.', type: 'blog', tags: ['847', 'numerology', 'pattern'] },
  ],
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
