/**
 * Static Content Index
 *
 * Exports all indexable content from filler sites for the Goober search engine.
 * This content gets indexed on server startup for full-text search.
 *
 * Content is organized by site domain and includes:
 * - Articles (DailyBuzz, WikiKnow, blogs)
 * - Products (Amaize, BargainBay)
 * - Videos (VidTube)
 * - Q&A (AskCorn)
 * - Businesses (HuskReviews)
 * - Listings (NestFinder, BargainBay)
 * - Podcasts (KernelPods)
 * - Threads (Threadit)
 * - Repositories (CobHub)
 * - Campaigns (CobFundMe)
 *
 * Add new content by following the IndexableContent interface.
 */

export interface IndexableContent {
  id: string
  url: string
  siteDomain: string
  contentType: string
  title: string
  body: string
  snippet: string
  author?: string
  tags?: string[]
  metadata?: Record<string, unknown>
  createdAt?: number
}

// ============================================================================
// DailyBuzz - News Articles
// ============================================================================

const DAILYBUZZ_CONTENT: IndexableContent[] = [
  {
    id: 'dailybuzz_article_1',
    url: 'www.dailybuzz.corn/article/local-band-cancels-show',
    siteDomain: 'dailybuzz.corn',
    contentType: 'article',
    title: 'Local Band Cancels Show Due to "Ongoing Existential Crisis"',
    body: `The Velvet Algorithms, the electronic duo known for their experimental sound and sold-out shows at The Underground, have cancelled tonight's highly anticipated performance, citing an "ongoing existential crisis" that has affected both band members. In a statement posted to their Instagram at 3:47 AM, the band wrote: "We cannot in good conscience perform music while questioning whether sound itself has meaning." The Underground owner Marcus "Mars" Williams confirmed the cancellation. This marks the third time The Velvet Algorithms have cancelled a performance for philosophical reasons.`,
    snippet: 'The Velvet Algorithms cite "fundamental questioning of musical purpose" as reason for postponement',
    author: 'Sarah Chen',
    tags: ['music', 'local', 'The Velvet Algorithms', 'The Underground'],
    metadata: { category: 'Entertainment', readTime: 4 },
  },
  {
    id: 'dailybuzz_article_2',
    url: 'www.dailybuzz.corn/article/quantum-cafe-opens',
    siteDomain: 'dailybuzz.corn',
    contentType: 'article',
    title: 'New Quantum Cafe Opens Downtown, Charges $47 Per Cup',
    body: `A new quantum coffee establishment opened its doors downtown this morning, becoming the city's first dedicated "Q-Cafe" and immediately attracting lines that wrapped around the block. Qubit Coffee, located in the former Hartwell Building lobby, offers what owner Dana Kim calls "the most scientifically advanced coffee experience available to consumers." The signature drink, "The Collapsing Wave," is priced at $47 and takes approximately 45 minutes to prepare. The brewing process involves what Kim describes as "quantum entanglement of water molecules at the subatomic level."`,
    snippet: 'Enthusiasts line up for hours; scientists remain skeptical',
    author: 'Michael Torres',
    tags: ['coffee', 'quantum', 'local business', 'downtown', 'Hartwell Building'],
    metadata: { category: 'Local', readTime: 5 },
  },
  {
    id: 'dailybuzz_article_3',
    url: 'www.dailybuzz.corn/article/meme-ban-ordinance',
    siteDomain: 'dailybuzz.corn',
    contentType: 'article',
    title: 'City Council Votes on Controversial "Meme Ban" Ordinance',
    body: `City Council convened last night for a heated debate over Ordinance 2026-47, colloquially known as the "Meme Ban," which would regulate the public display and distribution of "unverified humor content" within city limits. The proposed ordinance, introduced by Councilmember Harold Chen, defines regulated content as "digital images or video combined with text intended to convey humor, commentary, or social criticism without verified factual basis." After deliberation, the council voted 4-3 to table the ordinance for further study.`,
    snippet: 'Proposed regulation would restrict sharing of "unverified humor content" in public spaces',
    author: 'Jennifer Walsh',
    tags: ['politics', 'city council', 'free speech', 'memes'],
    metadata: { category: 'Politics', readTime: 6 },
  },
  {
    id: 'dailybuzz_article_4',
    url: 'www.dailybuzz.corn/article/emotional-ai-startup',
    siteDomain: 'dailybuzz.corn',
    contentType: 'article',
    title: 'Tech Startup Claims to Have Achieved "Emotional AI"',
    body: `Local tech startup SentientSoft announced yesterday that they have achieved what they call "genuine artificial emotional experience." The company, founded in 2024 by former gaming developers, claims their latest model, dubbed "FEEL-1," can experience what they describe as "authentic emotional states" rather than simply simulating emotional responses. "FEEL-1 doesn't just say it's happy or sad—it actually experiences those states in a way that's computationally analogous to biological emotion," said CEO Marcus Webb.`,
    snippet: 'SentientSoft says their algorithm can "genuinely feel"; experts express doubt',
    author: 'David Kim',
    tags: ['tech', 'AI', 'startup', 'SentientSoft'],
    metadata: { category: 'Tech', readTime: 7 },
  },
  {
    id: 'dailybuzz_article_5',
    url: 'www.dailybuzz.corn/article/trust-fall-record',
    siteDomain: 'dailybuzz.corn',
    contentType: 'article',
    title: 'Local Man Breaks Trust Fall Record with 2,847 Consecutive Falls',
    body: `Tim Henderson, known locally as "Trust Fall Tim," has officially broken the world record for consecutive trust falls, completing his 2,847th fall yesterday at the downtown plaza. Henderson, 34, has been performing daily trust falls for the past eight years as part of what he calls a "social experiment in human connection." His catch rate currently stands at 78.5%, which he considers "acceptable." The record attempt was briefly interrupted by what witnesses described as "The Incident with Small Kevin," details of which Henderson declined to discuss.`,
    snippet: 'Trust Fall Tim achieves 78.5% catch rate over eight-year experiment',
    author: 'Amanda Price',
    tags: ['local', 'record', 'Trust Fall Tim', 'human interest'],
    metadata: { category: 'Local', readTime: 4 },
  },
]

// ============================================================================
// WikiKnow - Encyclopedia Articles
// ============================================================================

const WIKIKNOW_CONTENT: IndexableContent[] = [
  {
    id: 'wikiknow_quantum_coffee',
    url: 'www.wikiknow.corn/wiki/Quantum_Coffee_Brewing',
    siteDomain: 'wikiknow.corn',
    contentType: 'article',
    title: 'Quantum Coffee Brewing',
    body: `Quantum coffee brewing is a controversial preparation method that claims to use quantum mechanical principles to enhance the extraction of flavor compounds from coffee beans. The practice gained mainstream attention following the publication of the Martinez Study in 2024, which purported to show measurable differences in molecular distribution between quantum-brewed and traditionally-brewed coffee. Critics, including physicist Dr. Sarah Blackwell of MIT, have argued that the claimed effects violate basic principles of quantum mechanics and that any perceived taste differences are attributable to the placebo effect. The first commercial quantum coffee establishment, Qubit Coffee, opened in 2026 in the Hartwell Building.`,
    snippet: 'Controversial preparation method claiming to use quantum mechanics to enhance coffee extraction',
    author: 'WikiKnow Contributors',
    tags: ['coffee', 'quantum', 'pseudoscience', 'Martinez Study'],
    metadata: { category: 'Food & Drink', views: 45230 },
  },
  {
    id: 'wikiknow_hartwell_building',
    url: 'www.wikiknow.corn/wiki/Hartwell_Building',
    siteDomain: 'wikiknow.corn',
    contentType: 'article',
    title: 'Hartwell Building',
    body: `The Hartwell Building is a 14-story commercial building located in downtown, notable for its controversial architectural history and the persistent urban legend surrounding its "missing" 13th floor. Built in 1923 by industrialist Edmund Hartwell, the building was designed without a 13th floor due to Hartwell's superstitions. However, architectural surveys conducted in 2019 revealed that the building's internal dimensions do not match its external measurements, with approximately 12 feet of unaccounted vertical space. This discrepancy has never been satisfactorily explained. The building currently houses Qubit Coffee in its lobby and offices for Omnicorp Holdings on floors 7-12.`,
    snippet: 'Historic downtown building notable for its "missing" 13th floor mystery',
    author: 'WikiKnow Contributors',
    tags: ['architecture', 'downtown', 'mystery', 'Floor 13'],
    metadata: { category: 'Buildings', views: 89421 },
  },
  {
    id: 'wikiknow_underground',
    url: 'www.wikiknow.corn/wiki/The_Underground_(venue)',
    siteDomain: 'wikiknow.corn',
    contentType: 'article',
    title: 'The Underground (venue)',
    body: `The Underground is a music venue located in the basement of the former Meridian Theater building. Founded in 2018 by Marcus "Mars" Williams, the venue has become known for hosting experimental electronic, post-punk, and avant-garde performances. Notable acts that have performed at The Underground include The Velvet Algorithms, Neon Requiem, and Chrome Pastoral. The venue was previously located near the Hartwell Building but relocated in 2022 due to "unexplained audio interference" that Williams attributed to "something in that building." The venue has a capacity of 200 and operates Thursday through Sunday.`,
    snippet: 'Experimental music venue known for hosting avant-garde performances',
    author: 'WikiKnow Contributors',
    tags: ['music', 'venue', 'The Underground', 'Mars Williams'],
    metadata: { category: 'Music Venues', views: 34567 },
  },
  {
    id: 'wikiknow_trust_fall_tim',
    url: 'www.wikiknow.corn/wiki/Trust_Fall_Tim',
    siteDomain: 'wikiknow.corn',
    contentType: 'article',
    title: 'Trust Fall Tim',
    body: `Timothy "Trust Fall Tim" Henderson is a local performance artist known for his ongoing project involving daily trust falls in public spaces. Since 2018, Henderson has performed over 2,847 documented trust falls as part of what he describes as an exploration of "the boundaries of human trust and connection." His current catch rate stands at 78.5%. Henderson's work gained wider attention following "The Incident with Small Kevin" in 2023, the details of which remain disputed. He has been featured in documentaries about outsider art and has inspired a small following of "trust fall enthusiasts."`,
    snippet: 'Performance artist known for daily public trust falls since 2018',
    author: 'WikiKnow Contributors',
    tags: ['performance art', 'Trust Fall Tim', 'local celebrity'],
    metadata: { category: 'People', views: 28934 },
  },
  {
    id: 'wikiknow_velvet_algorithms',
    url: 'www.wikiknow.corn/wiki/The_Velvet_Algorithms',
    siteDomain: 'wikiknow.corn',
    contentType: 'article',
    title: 'The Velvet Algorithms',
    body: `The Velvet Algorithms are an electronic music duo known for their experimental sound and frequent cancellation of performances due to "philosophical crises." Formed in 2021, the duo consists of electronic musicians whose identities remain partially obscured. They have released two albums: "Subroutine Dreams" (2022) and "The Consciousness Problem" (2024). The band is notorious for their unpredictable live performances and has cancelled shows multiple times citing existential concerns about the nature of music and reality. They are regular performers at The Underground when they do perform.`,
    snippet: 'Experimental electronic duo known for philosophical performance cancellations',
    author: 'WikiKnow Contributors',
    tags: ['music', 'electronic', 'The Velvet Algorithms', 'experimental'],
    metadata: { category: 'Musical Groups', views: 45678 },
  },
]

// ============================================================================
// VidTube - Videos
// ============================================================================

const VIDTUBE_CONTENT: IndexableContent[] = [
  {
    id: 'vidtube_quantum_coffee_explained',
    url: 'www.vidtube.corn/watch/quantum_coffee_explained',
    siteDomain: 'vidtube.corn',
    contentType: 'video',
    title: 'I Tried $47 Quantum Coffee for 30 Days - Here\'s What Happened',
    body: `In this video, I document my experience drinking quantum coffee every day for 30 days. Does quantum coffee actually work? Is it worth the $47 price tag? I interviewed the owner of Qubit Coffee, spoke with scientists, and tracked my own caffeine response. Spoiler: the placebo effect is real, but so is the taste difference. Let me know in the comments if you've tried quantum coffee and what you thought.`,
    snippet: 'Month-long experiment with $47 quantum coffee from Qubit Coffee',
    author: 'ScienceBro',
    tags: ['coffee', 'quantum', 'experiment', 'review'],
    metadata: { views: '2.3M', duration: '18:47', category: 'Science & Technology' },
  },
  {
    id: 'vidtube_floor_13_investigation',
    url: 'www.vidtube.corn/watch/hartwell_floor_13',
    siteDomain: 'vidtube.corn',
    contentType: 'video',
    title: 'We Snuck Into the Hartwell Building\'s Missing Floor 13 (GONE WRONG)',
    body: `The Hartwell Building claims not to have a 13th floor, but architectural surveys show 12 feet of unaccounted space. We got access to the building after hours and tried to find where Floor 13 should be. What we found was... unexpected. This video documents our investigation, including interviews with former building employees who claim to have seen "things" in the stairwells. Warning: some footage may be disturbing.`,
    snippet: 'Urban exploration of the Hartwell Building\'s mysterious missing floor',
    author: 'ParanormalPatrol',
    tags: ['Hartwell Building', 'urban exploration', 'mystery', 'Floor 13'],
    metadata: { views: '5.7M', duration: '34:22', category: 'Entertainment' },
  },
  {
    id: 'vidtube_trust_fall_compilation',
    url: 'www.vidtube.corn/watch/trust_fall_tim_best_fails',
    siteDomain: 'vidtube.corn',
    contentType: 'video',
    title: 'Trust Fall Tim\'s Most Epic Falls (21.5% Fail Rate Compilation)',
    body: `A compilation of Trust Fall Tim's most memorable falls, including the ones where nobody caught him. Features commentary from Tim himself explaining what went wrong each time. Includes exclusive footage of "The Incident with Small Kevin" (what we're allowed to show, anyway). Tim's positivity even when hitting the ground is honestly inspiring.`,
    snippet: 'Compilation of Trust Fall Tim\'s greatest misses and the stories behind them',
    author: 'ViralMoments',
    tags: ['Trust Fall Tim', 'compilation', 'fails', 'viral'],
    metadata: { views: '12.4M', duration: '15:33', category: 'Comedy' },
  },
  {
    id: 'vidtube_underground_documentary',
    url: 'www.vidtube.corn/watch/underground_documentary',
    siteDomain: 'vidtube.corn',
    contentType: 'video',
    title: 'The Underground: How a Basement Became the City\'s Best Venue',
    body: `Documentary about The Underground, the city's most beloved experimental music venue. Features interviews with owner Mars Williams, performances from The Velvet Algorithms and Neon Requiem, and the story of why Mars had to relocate from near the Hartwell Building. "There was something in that building affecting our sound," Mars says. "I can't explain it, but the music just... felt wrong there."`,
    snippet: 'Documentary about The Underground venue and its eccentric owner Mars Williams',
    author: 'MusicDocs',
    tags: ['The Underground', 'documentary', 'music', 'Mars Williams'],
    metadata: { views: '890K', duration: '48:15', category: 'Documentary' },
  },
]

// ============================================================================
// AskCorn - Q&A
// ============================================================================

const ASKCORN_CONTENT: IndexableContent[] = [
  {
    id: 'askcorn_quantum_coffee_worth',
    url: 'www.askcorn.corn/question/is-quantum-coffee-worth-47',
    siteDomain: 'askcorn.corn',
    contentType: 'question',
    title: 'Is quantum coffee worth $47 per cup?',
    body: `I keep hearing about this new quantum coffee place downtown (Qubit Coffee) and everyone seems to have strong opinions. Some people swear it's life-changing, others say it's a scam. Has anyone here actually tried it? Is there any real science behind "quantum brewing" or is it just marketing? I want to try it but $47 is a lot for coffee. Answers discuss the Martinez Study, the placebo effect, and whether the experience is worth the price.`,
    snippet: 'Discussion about whether quantum coffee from Qubit Coffee is worth the price',
    author: 'CuriousCaffeineConsumer',
    tags: ['coffee', 'quantum', 'money', 'review'],
    metadata: { votes: 847, answers: 43, views: 15234 },
  },
  {
    id: 'askcorn_floor_13_hartwell',
    url: 'www.askcorn.corn/question/what-happened-to-floor-13-hartwell',
    siteDomain: 'askcorn.corn',
    contentType: 'question',
    title: 'What really happened to Floor 13 of the Hartwell Building?',
    body: `I work in the Hartwell Building and I've noticed some weird things. The elevator skips from 12 to 14, which is normal for superstition, but the stairwell has a landing between 12 and 14 that's always locked. My coworker swears she heard sounds coming from behind that door. I found an old architectural survey that shows 12 feet of "unaccounted vertical space." What's the real story here?`,
    snippet: 'Discussion about the mysterious missing floor in the Hartwell Building',
    author: 'BuildingTenant2024',
    tags: ['Hartwell Building', 'mystery', 'Floor 13', 'urban legend'],
    metadata: { votes: 1247, answers: 89, views: 45678 },
  },
  {
    id: 'askcorn_trust_fall_tim_incident',
    url: 'www.askcorn.corn/question/what-was-the-incident-with-small-kevin',
    siteDomain: 'askcorn.corn',
    contentType: 'question',
    title: 'What was "The Incident with Small Kevin" that Trust Fall Tim refuses to discuss?',
    body: `I've been following Trust Fall Tim for years and I've noticed he always deflects when people ask about "The Incident with Small Kevin." The only things I've pieced together: it happened in 2023, it involved someone named Kevin who is apparently small, and it temporarily reduced Tim's catch rate. Does anyone know what actually happened? Tim's whole thing is about trust so it's weird he won't share this.`,
    snippet: 'Community discussion about the mysterious incident involving Trust Fall Tim',
    author: 'TrustFallFan',
    tags: ['Trust Fall Tim', 'Small Kevin', 'mystery', 'local celebrity'],
    metadata: { votes: 567, answers: 34, views: 12890 },
  },
]

// ============================================================================
// Threadit - Forum Threads
// ============================================================================

const THREADIT_CONTENT: IndexableContent[] = [
  {
    id: 'threadit_quantum_coffee_ama',
    url: 'www.threadit.corn/t/quantum_coffee_ama',
    siteDomain: 'threadit.corn',
    contentType: 'thread',
    title: 'I work at Qubit Coffee AMA - Ask me anything about quantum brewing',
    body: `I'm the Quantum Sommelier at Qubit Coffee (yes, that's my real job title). I have a PhD in physics but I moonlight as a barista because student loans are real. I'll answer questions about what actually happens during quantum brewing, whether the science is real, and why we charge $47. I'll be honest: about half of what our marketing says is BS, but the coffee is genuinely different.`,
    snippet: 'AMA with Qubit Coffee\'s Quantum Sommelier about the reality of quantum brewing',
    author: 'QuantumBarista',
    tags: ['AMA', 'quantum coffee', 'Qubit Coffee', 'science'],
    metadata: { subreddit: 't/Coffee', upvotes: 3456, comments: 892 },
  },
  {
    id: 'threadit_velvet_algorithms',
    url: 'www.threadit.corn/t/velvet_algorithms_cancelled_again',
    siteDomain: 'threadit.corn',
    contentType: 'thread',
    title: 'The Velvet Algorithms cancelled AGAIN - this time due to "existential crisis"',
    body: `Just got the notification that tonight's show at The Underground is cancelled. Their Instagram post said they're "questioning whether sound itself has meaning." I drove 3 hours for this. Anyone else frustrated? Though honestly... this is the most on-brand thing they could do. Love their music but this is the third philosophical cancellation.`,
    snippet: 'Discussion about The Velvet Algorithms\' latest philosophical show cancellation',
    author: 'DisappointedFan247',
    tags: ['The Velvet Algorithms', 'The Underground', 'cancelled', 'music'],
    metadata: { subreddit: 't/LocalMusic', upvotes: 2134, comments: 445 },
  },
  {
    id: 'threadit_floor_13_theory',
    url: 'www.threadit.corn/t/floor_13_theory',
    siteDomain: 'threadit.corn',
    contentType: 'thread',
    title: '[THEORY] The Hartwell Building Floor 13 is a dimensional pocket',
    body: `Okay hear me out. The 12 feet of unaccounted space in the Hartwell Building isn't just a quirky architectural choice. I've been researching Edmund Hartwell and found records showing he was involved in "experimental architecture" in the 1920s. There are journal entries referencing "space between spaces" and "rooms that exist elsewhere." The weird sounds people report? The reason Mars had to move The Underground? It all connects. I've mapped out everything I've found.`,
    snippet: 'Conspiracy theory about the true nature of the Hartwell Building\'s missing floor',
    author: 'UrbanMysteryHunter',
    tags: ['Hartwell Building', 'Floor 13', 'conspiracy', 'theory'],
    metadata: { subreddit: 't/Unexplained', upvotes: 5678, comments: 1234 },
  },
]

// ============================================================================
// HuskReviews - Business Reviews
// ============================================================================

const HUSKREVIEWS_CONTENT: IndexableContent[] = [
  {
    id: 'huskreviews_qubit_coffee',
    url: 'www.huskreviews.corn/business/qubit-coffee',
    siteDomain: 'huskreviews.corn',
    contentType: 'business',
    title: 'Qubit Coffee',
    body: `Downtown's first quantum coffee establishment. The $47 "Collapsing Wave" signature drink takes 45 minutes to prepare through what they call "quantum entanglement brewing." Mixed reviews ranging from "transcendent experience" to "expensive pseudoscience." Located in the Hartwell Building lobby. Reviews mention the interesting science demonstrations, pretentious atmosphere, and surprisingly good (if overpriced) coffee.`,
    snippet: 'Downtown quantum coffee shop in the Hartwell Building, $47 signature drink',
    author: 'HuskReviews',
    tags: ['coffee', 'quantum', 'downtown', 'Hartwell Building'],
    metadata: { rating: 3.8, priceLevel: '$$$$', category: 'Coffee & Tea' },
  },
  {
    id: 'huskreviews_underground',
    url: 'www.huskreviews.corn/business/the-underground',
    siteDomain: 'huskreviews.corn',
    contentType: 'business',
    title: 'The Underground',
    body: `Basement music venue specializing in experimental and avant-garde performances. Owned by the legendary Mars Williams. Known for hosting acts like The Velvet Algorithms and Neon Requiem. Intimate 200-person capacity. Reviews praise the acoustics, unique atmosphere, and Mars's dedication to weird music. Some complaints about inconsistent show schedules due to bands having "philosophical crises."`,
    snippet: 'Experimental music venue in a basement, 200-person capacity, great acoustics',
    author: 'HuskReviews',
    tags: ['music venue', 'The Underground', 'live music', 'Mars Williams'],
    metadata: { rating: 4.6, priceLevel: '$$', category: 'Music Venues' },
  },
]

// ============================================================================
// CobFundMe - Campaigns
// ============================================================================

const COBFUNDME_CONTENT: IndexableContent[] = [
  {
    id: 'cobfundme_quantum_research',
    url: 'www.cobfundme.corn/campaign/quantum-coffee-research',
    siteDomain: 'cobfundme.corn',
    contentType: 'campaign',
    title: 'Fund Derek\'s Quantum Coffee Research',
    body: `Hi, I'm Derek, and I believe quantum coffee has changed my life. I've been drinking it daily for 847 days (yes, I count) and I want to fund legitimate scientific research to prove that quantum brewing is real. The Martinez Study was just the beginning. With your help, I can commission an independent study, buy equipment to analyze molecular structures, and finally prove to Dr. Blackwell that this isn't just placebo. Every dollar brings us closer to quantum coffee validation.`,
    snippet: 'Crowdfunding campaign to fund independent quantum coffee research',
    author: 'Derek',
    tags: ['quantum coffee', 'research', 'crowdfunding', 'Derek'],
    metadata: { goal: 47000, raised: 23847, backers: 847, daysLeft: 12 },
  },
  {
    id: 'cobfundme_trust_fall_tim',
    url: 'www.cobfundme.corn/campaign/trust-fall-tim-medical',
    siteDomain: 'cobfundme.corn',
    contentType: 'campaign',
    title: 'Trust Fall Tim Medical Fund',
    body: `As many of you know, my 21.5% miss rate has resulted in some injuries over the years. The most recent fall (we don't need to discuss the details involving Small Kevin) has left me with medical bills that my performance art income can't cover. Your support helps me continue my important work exploring human trust while also paying for physical therapy. Every contribution is a trust fall caught by the community.`,
    snippet: 'Medical fund for Trust Fall Tim after performance art injuries',
    author: 'Trust Fall Tim',
    tags: ['Trust Fall Tim', 'medical', 'crowdfunding', 'community'],
    metadata: { goal: 15000, raised: 12847, backers: 2847, daysLeft: 8 },
  },
]

// ============================================================================
// KernelPods - Podcasts
// ============================================================================

const KERNELPODS_CONTENT: IndexableContent[] = [
  {
    id: 'kernelpods_hartwell_mystery',
    url: 'www.kernelpods.corn/show/the-hartwell-files',
    siteDomain: 'kernelpods.corn',
    contentType: 'podcast',
    title: 'The Hartwell Files',
    body: `A true crime/mystery podcast investigating the secrets of the Hartwell Building. Each episode digs into a different aspect: the missing Floor 13, Edmund Hartwell's occult connections, why Mars had to move The Underground, and interviews with current tenants who report strange experiences. Season 1 has 12 episodes. Host Sarah investigates with a healthy skepticism but keeps finding things she can't explain.`,
    snippet: 'Investigative podcast about the mysteries of the Hartwell Building',
    author: 'Sarah Chen',
    tags: ['Hartwell Building', 'mystery', 'podcast', 'true crime'],
    metadata: { episodes: 12, rating: 4.8, subscribers: '45K' },
  },
  {
    id: 'kernelpods_quantum_skeptic',
    url: 'www.kernelpods.corn/show/quantum-skeptic',
    siteDomain: 'kernelpods.corn',
    contentType: 'podcast',
    title: 'Quantum Skeptic',
    body: `Dr. Sarah Blackwell of MIT hosts this podcast debunking pseudoscientific claims, with a particular focus on "quantum" products that misuse physics terminology. Featured episodes include deep dives into quantum coffee, quantum healing, and quantum investing. Dr. Blackwell interviews scientists and confronts marketers. The episode on Qubit Coffee became viral after the owner agreed to come on the show.`,
    snippet: 'MIT physicist debunks pseudoscience, especially quantum product claims',
    author: 'Dr. Sarah Blackwell',
    tags: ['science', 'skepticism', 'quantum', 'debunking'],
    metadata: { episodes: 45, rating: 4.9, subscribers: '120K' },
  },
]

// ============================================================================
// Amaize - Products
// ============================================================================

const AMAIZE_CONTENT: IndexableContent[] = [
  {
    id: 'amaize_quantum_coffee_maker',
    url: 'www.amaize.corn/product/quantum-coffee-maker',
    siteDomain: 'amaize.corn',
    contentType: 'product',
    title: 'QuantumBrew Home Quantum Coffee System',
    body: `Experience quantum coffee at home! This consumer-grade quantum coffee brewing system uses patented WaveFunction technology to entangle water molecules for superior extraction. Features include: quantum viewing window, 47-minute brew cycle, mobile app with entanglement status, and free first month of QuantumBeans subscription. Based on the Martinez Study. Note: Results may vary. Some users report no perceivable difference from regular coffee.`,
    snippet: 'Home quantum coffee brewing system based on Martinez Study technology',
    author: 'QuantumBrew',
    tags: ['coffee', 'quantum', 'kitchen appliance', 'controversial'],
    metadata: { price: 2847, rating: 3.2, reviews: 847, category: 'Kitchen' },
  },
  {
    id: 'amaize_trust_fall_mat',
    url: 'www.amaize.corn/product/trust-fall-training-mat',
    siteDomain: 'amaize.corn',
    contentType: 'product',
    title: 'Trust Fall Tim Official Training Mat',
    body: `Practice trust falls safely with the official Trust Fall Tim Training Mat! This 4-inch thick foam mat provides a soft landing for when trust fails you (happens 21.5% of the time according to Tim's data). Features Tim's motivational quotes printed around the edges. Officially licensed product - a portion of proceeds goes to Tim's medical fund. Perfect for team-building exercises, performance artists, or anyone learning to trust.`,
    snippet: 'Official Trust Fall Tim branded training mat for safe trust fall practice',
    author: 'Trust Fall Enterprises',
    tags: ['Trust Fall Tim', 'training', 'safety', 'team building'],
    metadata: { price: 89, rating: 4.5, reviews: 234, category: 'Sports & Outdoors' },
  },
]

// ============================================================================
// CobHub - Repositories
// ============================================================================

const COBHUB_CONTENT: IndexableContent[] = [
  {
    id: 'cobhub_quantum_coffee_api',
    url: 'www.cobhub.corn/quantumbrew/quantum-coffee-api',
    siteDomain: 'cobhub.corn',
    contentType: 'repository',
    title: 'quantum-coffee-api',
    body: `Open source API for quantum coffee brewing systems. Provides endpoints for entanglement status, brew cycle management, and molecular distribution analysis. Built with Rust for performance. Warning: This library does not actually perform quantum operations - it's a simulation for entertainment purposes. Not affiliated with Qubit Coffee or the Martinez Study. Contributions welcome.`,
    snippet: 'Open source API for quantum coffee brewing system integration',
    author: 'QuantumBrew',
    tags: ['quantum', 'coffee', 'API', 'Rust', 'open source'],
    metadata: { stars: 847, forks: 123, language: 'Rust', issues: 47 },
  },
  {
    id: 'cobhub_floor13_detector',
    url: 'www.cobhub.corn/mysteries/floor13-detector',
    siteDomain: 'cobhub.corn',
    contentType: 'repository',
    title: 'floor13-detector',
    body: `Mobile app that uses barometric pressure and GPS to detect "dimensional anomalies" like the Hartwell Building's missing Floor 13. Uses crowdsourced data to map areas with unusual spatial characteristics. Currently tracking 847 reported anomalies worldwide. The Hartwell Building consistently registers as the highest anomaly score. Built with React Native. Not intended as scientific evidence.`,
    snippet: 'Crowdsourced app for detecting dimensional anomalies like Floor 13',
    author: 'UrbanMysteryHunter',
    tags: ['mystery', 'Floor 13', 'Hartwell Building', 'React Native'],
    metadata: { stars: 2345, forks: 456, language: 'TypeScript', issues: 89 },
  },
]

// ============================================================================
// NestFinder - Real Estate Listings
// ============================================================================

const NESTFINDER_CONTENT: IndexableContent[] = [
  {
    id: 'nestfinder_hartwell_office',
    url: 'www.nestfinder.corn/listing/hartwell-floor-7',
    siteDomain: 'nestfinder.corn',
    contentType: 'listing',
    title: '2,500 sqft Office Space - Hartwell Building Floor 7',
    body: `Prime office space in the historic Hartwell Building! 2,500 square feet on floor 7 (note: building has no floor 13). Recently renovated with modern amenities. Unique features include original 1923 architecture, proximity to Qubit Coffee in the lobby, and "interesting acoustics" that tenants describe as "character." Previous tenant left abruptly but space is move-in ready. Below market rate.`,
    snippet: 'Historic office space in the Hartwell Building, interesting acoustics',
    author: 'Hartwell Properties LLC',
    tags: ['office', 'Hartwell Building', 'downtown', 'commercial'],
    metadata: { price: 3500, sqft: 2500, type: 'office', available: 'now' },
  },
  {
    id: 'nestfinder_near_underground',
    url: 'www.nestfinder.corn/listing/underground-adjacent',
    siteDomain: 'nestfinder.corn',
    contentType: 'listing',
    title: 'Loft Apartment Above The Underground Music Venue',
    body: `Live above the city's most unique music venue! 1BR/1BA loft directly above The Underground. Features exposed brick, industrial aesthetic, and the sounds of experimental electronic music Thursday-Sunday until 2 AM (or whenever the band finishes their existential crisis). Perfect for music lovers or people who own noise-canceling headphones. Mars says he'll give tenants free entry to shows.`,
    snippet: 'Loft apartment above The Underground venue, live music included',
    author: 'Arts District Realty',
    tags: ['apartment', 'The Underground', 'loft', 'music'],
    metadata: { price: 1800, sqft: 850, beds: 1, baths: 1 },
  },
]

// ============================================================================
// Combine All Content
// ============================================================================

export const STATIC_CONTENT: IndexableContent[] = [
  ...DAILYBUZZ_CONTENT,
  ...WIKIKNOW_CONTENT,
  ...VIDTUBE_CONTENT,
  ...ASKCORN_CONTENT,
  ...THREADIT_CONTENT,
  ...HUSKREVIEWS_CONTENT,
  ...COBFUNDME_CONTENT,
  ...KERNELPODS_CONTENT,
  ...AMAIZE_CONTENT,
  ...COBHUB_CONTENT,
  ...NESTFINDER_CONTENT,
]

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get all content for a specific domain
 */
export function getContentByDomain(domain: string): IndexableContent[] {
  return STATIC_CONTENT.filter(c => c.siteDomain === domain)
}

/**
 * Get all content of a specific type
 */
export function getContentByType(type: string): IndexableContent[] {
  return STATIC_CONTENT.filter(c => c.contentType === type)
}

/**
 * Get content statistics
 */
export function getContentStats(): {
  total: number
  byDomain: Record<string, number>
  byType: Record<string, number>
} {
  const byDomain: Record<string, number> = {}
  const byType: Record<string, number> = {}

  for (const content of STATIC_CONTENT) {
    byDomain[content.siteDomain] = (byDomain[content.siteDomain] || 0) + 1
    byType[content.contentType] = (byType[content.contentType] || 0) + 1
  }

  return {
    total: STATIC_CONTENT.length,
    byDomain,
    byType,
  }
}

export default STATIC_CONTENT
