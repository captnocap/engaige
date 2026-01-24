# Filler Content Sites

Browser-accessible content sites for world-building and user entertainment.

---

## ⚠️ CRITICAL: Filler Site Quality Standards

**Every filler site MUST provide a complete, believable experience. No dead ends. No empty promises.**

### Rule 1: If It Looks Clickable, It MUST Work

- **NEVER** create UI elements that look interactive but do nothing
- Links must navigate somewhere (even if it's just another page of content)
- Buttons must respond with visual feedback or state changes
- If a user sees a clickable element, they WILL click it - don't disappoint them
- "Non-functional" form submissions should at least show a confirmation/error state

**Bad Example:**
```tsx
// ❌ DON'T: A link that goes nowhere
<a href="#">Read more →</a>
```

**Good Example:**
```tsx
// ✅ DO: Link to actual content
<a onClick={() => setSelectedArticle(article)}>Read more →</a>
```

### Rule 2: Show What You Claim

- If a thread says "847 comments" → **SHOW COMMENTS** (at least 5-10 representative ones)
- If a video says "1.2M views" → have a populated comment section to match
- If a listing says "32 reviews" → display some reviews
- Empty states are lies. Numbers without content break immersion instantly.

**Bad Example:**
```tsx
// ❌ DON'T: Promise content you won't show
<span>847 Comments</span>
// ...and then show zero comments
```

**Good Example:**
```tsx
// ✅ DO: Back up your claims
<span>{comments.length} Comments</span>
{comments.map(c => <Comment key={c.id} {...c} />)}
```

### Rule 3: Depth Over Shortcuts

- It's better to have 20 interconnected pages than 1 shallow page
- Cross-link content within the site (articles reference other articles)
- Create the feeling that you could browse forever
- The goal is "too real" - users should forget they're in a game

### Rule 4: Study the Reference Implementations

Before building a new filler site, **study these sites that got it right:**

- **WikiKnow** - Full articles with table of contents, citations, related links
- **VidTube** - Video pages with comments, replies, recommendations
- **Threadit** - Nested comment threads, voting, cross-post references

These set the bar. New sites should match or exceed their depth.

### Rule 5: Test Like a User

Before considering a site "done", click on EVERYTHING:
- Every link
- Every button
- Every interactive-looking element
- Every "see more" or "read more"

If anything feels broken or empty, it's not done.

---

## Overview

Eleven filler content sites provide browsable, lore-rich content that makes the game world feel alive:

| Site | Type | Description |
|------|------|-------------|
| **WikiKnow** | Wikipedia clone | Encyclopedic articles about absurd topics played completely straight |
| **Threadit** | Reddit clone | Forum threads with AITA posts, relationship drama, nested comments |
| **DailyBuzz** | News site | Satirical news articles mixing serious and absurd headlines |
| **VidTube** | YouTube clone | Video platform with comments, channels, and recommendations |
| **ForChan** | 4chan clone | Anonymous imageboard with greentext, replies, and chaotic energy |
| **VitalityRx** | Pharma ads | Fake medication advertising with ridiculous side effects |
| **NestFinder** | Real estate | Apartment listings with suspicious deals and red flags |
| **BargainBay** | Marketplace | Craigslist-style classifieds with questionable listings |
| **OddsOracle** | Prediction market | Polymarket-style betting on absurd local events and lore |
| **StrangerZone** | Random chat | Omegle-style anonymous stranger chat with lore characters |
| **WealthWisdom** | Financial advice | Satirical financial gurus with questionable investment tips |

## Architecture

### Centralized Configuration

All site names, URLs, and themes are defined in a single config file for easy renaming:

```
src/config/filler-sites.ts
```

**To rename a site:** Edit the config file and everything updates automatically:

```typescript
export const FILLER_SITES = {
  wiki: {
    id: 'wikiknow',        // ← Change this
    name: 'WikiKnow',       // ← And this
    url: 'www.wikiknow.fake',
    // ...
  },
  // ...
}
```

### File Structure

```
src/
├── config/
│   └── filler-sites.ts           # Centralized site config (names, themes, URLs)
│
├── components/browser/
│   ├── Browser.tsx               # URL mappings (SITE_URLS)
│   ├── BrowserSiteContainer.tsx  # Site routing (SITE_COMPONENTS)
│   └── sites/
│       ├── WikiKnowSite.tsx      # ~650 lines - Wikipedia clone
│       ├── ThreaditSite.tsx      # ~988 lines - Reddit clone
│       ├── DailyBuzzSite.tsx     # ~784 lines - News site
│       ├── VidTubeSite.tsx       # ~700 lines - YouTube clone
│       ├── ForChanSite.tsx       # ~750 lines - 4chan clone
│       ├── VitalityRxSite.tsx    # ~800 lines - Pharma advertising
│       ├── NestFinderSite.tsx    # ~750 lines - Real estate listings
│       ├── BargainBaySite.tsx    # ~650 lines - Classifieds marketplace
│       ├── OddsOracleSite.tsx    # ~700 lines - Prediction market
│       ├── StrangerZoneSite.tsx  # ~500 lines - Random chat
│       └── WealthWisdomSite.tsx  # ~750 lines - Financial advice
│
└── config/
    └── app-registry.ts           # Site definitions for browser homepage
```

---

## Site Details

### WikiKnow (Wikipedia Clone)

**URL:** `www.wikiknow.fake`

**Features:**
- Search bar with article matching
- Random Article button
- Table of Contents with section jumping
- Infobox sidebar with facts
- Citation footnotes (fake references)
- Related articles linking
- "Last edited" timestamps

**Sample Content:**
- Quantum Coffee Brewing
- The Great Meme War of 2019
- The Underground (venue)

**Theme:** Wikipedia blue (`#0645AD`), neutral grey background

---

### Threadit (Reddit Clone)

**URL:** `www.threadit.fake`

**Features:**
- Subreddit filtering
- Thread list with vote counts
- Thread detail view with full post
- Nested comment threads (recursive)
- Voting UI (visual, stored in component state)
- Flair tags (colored badges)
- Awards display
- Sort options (Hot, New, Top)

**Sample Content:**
- AITA quantum coffee roommate
- Relationship advice (partner obsessed with quantum physics)
- Local scene show cancellation
- AskThreadit weird venue stories

**Subreddits:** r/coffee, r/AmITheAsshole, r/relationship_advice, r/localscene, r/AskThreadit

**Theme:** Reddit orange (`#FF4500`), upvote/downvote colors

---

### DailyBuzz (News Site)

**URL:** `www.dailybuzz.fake`

**Features:**
- Breaking news ticker (rotating)
- Category tabs (All, Local, Tech, Entertainment, Politics, Opinion)
- Featured article hero card
- Article grid with thumbnails
- Read time estimates
- Author bylines
- Related stories sidebar
- Newsletter signup (non-functional)
- Weather widget

**Sample Content:**
- Band cancels show due to existential crisis
- Quantum cafe opens downtown
- City council meme ban
- Tech startup claims emotional AI
- Opinion: Phone detox experiment

**Theme:** News red (`#c41e3a`), bold headlines

---

### VidTube (YouTube Clone)

**URL:** `www.vidtube.fake`

**Features:**
- Video grid with thumbnails (emoji placeholders)
- Category pills for filtering
- Video player page with description
- Comment section with nested replies
- Like/dislike system
- Subscribe button
- Channel info display
- Recommended videos sidebar
- Live streams indicator

**Sample Content:**
- Quantum Coffee Machine unboxing
- Trust Fall Tim weekly fail compilation
- Velvet Algorithms music video
- Great Meme War documentary
- Chaotic Cooking episode
- Hartwell Building mystery investigation
- Live open mic stream from The Underground
- 10 hours of quantum coffee sounds

**Channels:** QuantumBrew, TrustFallTim, UndergroundVenues, TechExplained, ChaoticCooking, MidnightMystery, VelvetAlgorithms

**Theme:** YouTube red (`#FF0000`), dark player, light interface

---

### ForChan (4chan Clone)

**URL:** `www.forchan.fake`

**Features:**
- Board navigation
- Thread list with previews
- Thread view with all replies
- Greentext rendering (>lines styled green)
- Quote links (>>number styled red)
- Anonymous posting
- Tripcode support
- Sticky/locked indicators
- Reply form (non-functional)
- Image thumbnails (emoji placeholders)

**Sample Content:**
- /g/ Quantum Coffee Machine General
- /mu/ Velvet Algorithms appreciation
- /x/ Hartwell Building conspiracy
- /ck/ Quantum coffee setup
- /adv/ Roommate conflict
- /b/ Trust Fall Tim general

**Boards:** /b/ Random, /g/ Technology, /mu/ Music, /ck/ Food & Cooking, /x/ Paranormal, /sci/ Science & Math, /diy/ DIY, /adv/ Advice

**Theme:** Classic 4chan blue (`#eef2ff`), greentext color (`#789922`)

---

### VitalityRx (Pharmaceutical Advertising)

**URL:** `www.vitalityrx.fake`

**Features:**
- Medication grid with cards
- Detailed medication pages
- Clinical results statistics
- Patient testimonials
- Side effects (expandable)
- "Find a Doctor" CTA
- Professional medical aesthetic

**Sample Medications:**
1. **QUANTUMIL** - For Quantum Coffee Intolerance Syndrome
   - Side effects include "temporal displacement" and "becoming the coffee"
2. **SCROLLSTOP** - For Chronic Doomscrolling Disorder
   - Side effects include "noticing sunlight exists"
3. **PROCRASTA-NO** - For Chronic Task Avoidance Syndrome
   - Side effects include "actually doing the thing"
4. **NOCTURNIL** - For Revenge Bedtime Procrastination Disorder
   - Side effects include "waking up before your alarm"
5. **TEXTBACKIA** - For Selective Response Deficit Disorder
   - Side effects include "responding to messages in real-time"

**Theme:** Medical blue (`#2563EB`), clean pharmaceutical aesthetic

---

### NestFinder (Real Estate Listings)

**URL:** `www.nestfinder.fake`

**Features:**
- Listing grid with cards
- Search and filter controls
- Neighborhood filtering
- Price/bed filters
- Listing detail pages
- Image gallery (emoji placeholders)
- Amenities lists
- Agent contact forms
- Save/favorite listings
- Red flag warnings on suspicious listings

**Sample Listings:**
1. **2BR near The Underground** - $2,450/mo, normal listing
2. **$500 basement studio** - Suspicious deal with red flags
3. **Hartwell Building luxury condo** - References 2018 incident
4. **Room in quantum coffee house** - Must observe coffee daily
5. **3BR family home** - Standard for-sale listing
6. **Artist loft** - Converted warehouse
7. **Band house room** - Neon Requiem members as roommates
8. **Modern 2BR condo** - Just renovated

**Neighborhoods:** Downtown, Eastside, Financial District, Midtown, Riverside, Arts District, Near University, Westside

**Theme:** Real estate green (`#16a34a`), warm grey background

---

### BargainBay (Classifieds Marketplace)

**URL:** `www.bargainbay.fake`

**Features:**
- Category sidebar
- Listing grid with cards
- Search functionality
- Listing detail pages
- Message seller form
- Seller profiles with ratings
- Save/favorite listings
- Suspicious listing warnings

**Sample Listings:**
1. **Quantum Coffee Maker** - Seller admits defeat
2. **Free: Ex's stuff** - Emotional seller, pickup only
3. **Velvet Algorithms poster** - Rare collectible
4. **$500 "working" car** - Many red flags
5. **"Not haunted" mirror** - From near Hartwell Building
6. **Drum kit** - Ex-Neon Requiem drummer
7. **Coffee observation partner** - Services wanted
8. **Moving sale** - Furniture bundle
9. **Trust Fall training** - Trust Fall Tim offering lessons
10. **Missed connection** - Quantum Cafe romance

**Categories:** Electronics, Furniture, Vehicles, Free Stuff, Musical Instruments, Home & Garden, Clothing, Collectibles, Services, Missed Connections

**Theme:** Facebook-ish blue (`#0866ff`), clean marketplace aesthetic

---

### OddsOracle (Prediction Market)

**URL:** `www.oddsoracle.fake`

**Features:**
- Market grid with YES/NO prices
- Trading panel for buying shares
- Market comments section
- Resolved markets archive
- Portfolio tracking
- Category filtering
- Hot/trending market indicators

**Sample Markets:**
1. **Trust Fall Tim catches rate** - Will Tim successfully complete >80% of falls this month?
2. **Quantum Coffee FDA approval** - Will Quantum Coffee pass FDA safety review?
3. **Velvet Algorithms album** - Will they release by end of year?
4. **Hartwell Building reopening** - Will it reopen to public?
5. **Meme ban enforcement** - Will city council actually enforce the ban?
6. **The Underground closing** - Will Mars sell the venue?
7. **Neon Requiem reunion** - Will they get back together?
8. **Quantum Coffee prices** - Will prices exceed $15 per cup?
9. **Trust Fall Tim injury** - Will Tim injure himself this month?
10. **Local sports outcomes** - Various betting on local events

**Categories:** Local Events, Entertainment, Science, Politics, Sports, Crypto, Memes

**Theme:** Purple (`#8B5CF6`), dark background with green/red for YES/NO

---

### StrangerZone (Random Chat)

**URL:** `www.strangerzone.fake`

**Features:**
- Random stranger matching
- Interest tag selection
- Real-time text chat
- Stranger disconnect mechanics
- Skip/new chat buttons
- Typing indicators
- Online user counter
- Various stranger personalities

**Stranger Types:**
1. **Normal** - Standard "asl?" conversations
2. **Weird** - Creepy requests, quick disconnect
3. **Philosophical** - Deep conversations about existence
4. **Conspiracy** - Hartwell Building truthers
5. **Bot** - Spam bots with sketchy links
6. **Lore Characters** - NPCs discussing game world (music scene, quantum coffee, real estate)
7. **Flirty** - Looking for connections

**Lore Connections:**
- Strangers discuss Velvet Algorithms and The Underground
- Conspiracy theorists mention Hartwell Building
- Apartment hunters complain about NestFinder listings
- Music fans talk about local bands

**Theme:** Pink/red (`#e94560`), dark navy background

---

### WealthWisdom (Financial Advice)

**URL:** `www.wealthwisdom.fake`

**Features:**
- Featured wealth "gurus" with bios
- Article grid with categories
- Premium content indicators
- Course catalog
- Guru profile pages
- Email signup modal
- Category filtering
- Like counts and read times

**Featured Gurus:**
1. **Derek Moneysworth III** - "Wealth Manifestation Coach" - Self-made millionaire (inherited $2.1M)
2. **Crystal Abundance** - "Financial Spiritualist" - MoonPhase Trading™ creator
3. **Chad Sigmington** - "Alpha Investment Strategist" - Sigma grindset expert
4. **Patricia Pennysaver** - "Frugal Living Expert" - Retired at 38 (lives with parents)

**Sample Articles:**
- "Why Quantum Coffee Stocks Are the Next Big Thing"
- "17 Sigma Male Money Habits"
- "I Bought Property Near Hartwell Building - Here's What Happened"
- "How Trust Fall Tim Built a 6-Figure Business"
- "MoonPhase Trading: Why I Only Buy During Waxing Gibbous"
- "The Velvet Algorithms NFT Drop Analysis"
- "How Much Your Daily Latte Costs Over 47 Years"

**Courses:**
1. **Sigma Male Trading Masterclass** - $497
2. **Celestial Wealth Manifestation** - $333
3. **Extreme Frugality: Retire by 40** - $47

**Categories:** Investing, Crypto, Mindset, Real Estate, Side Hustles, Retirement

**Theme:** Green (`#10B981`), dark background with gold accents

---

## Shared Lore & Cross-References

All sites reference the same fictional universe:

**The Velvet Algorithms** - Band that appears in news, Reddit, Wikipedia, YouTube, ForChan, marketplace
**Quantum Coffee** - Topic across all platforms (science, drama, business, conspiracy)
**The Underground** - Venue mentioned in multiple contexts
**Trust Fall Tim** - Character with YouTube channel, Threadit fame, training services
**Hartwell Building** - Mystery referenced in news, paranormal discussions, real estate
**Neon Requiem** - Rival band, members selling drum kit
**Mars** - Underground venue owner, appears in multiple threads

---

## How to Access

1. Open the Browser window (NetScape)
2. Click on any site from the homepage
3. Or type the URL directly:
   - `www.wikiknow.fake`
   - `www.threadit.fake`
   - `www.dailybuzz.fake`
   - `www.vidtube.fake`
   - `www.forchan.fake`
   - `www.vitalityrx.fake`
   - `www.nestfinder.fake`
   - `www.bargainbay.fake`
   - `www.oddsoracle.fake`
   - `www.strangerzone.fake`
   - `www.wealthwisdom.fake`

---

## Adding New Content

To add new articles/threads/listings, edit the sample content arrays in each site file:

```typescript
// Example: In VidTubeSite.tsx
const SAMPLE_VIDEOS: Video[] = [
  {
    id: 'new_video',
    title: 'Your New Video',
    channel: 'ChannelName',
    // ...
  },
]
```

---

## Theme Colors Summary

| Site | Primary Color | Style |
|------|---------------|-------|
| WikiKnow | `#0645AD` | Clean, encyclopedic |
| Threadit | `#FF4500` | Reddit orange, card-based |
| DailyBuzz | `#c41e3a` | Bold news red |
| VidTube | `#FF0000` | YouTube red |
| ForChan | `#117743` | Classic imageboard blue |
| VitalityRx | `#2563EB` | Medical blue |
| NestFinder | `#16a34a` | Real estate green |
| BargainBay | `#0866ff` | Marketplace blue |
| OddsOracle | `#8B5CF6` | Dark purple, prediction market |
| StrangerZone | `#e94560` | Pink/red, anonymous chat |
| WealthWisdom | `#10B981` | Money green, financial advice |

---

## Future Enhancements

### Phase 2: Server-loaded content
- WebSocket handlers for content loading
- Content stored in `server/data/content/`
- Random article discovery
- Search across content

### Phase 3: NPC Integration
- NPCs post to Threadit, BargainBay
- NPC channels on VidTube
- NPCs appear in news articles
- Dynamic content based on game events

### Phase 4: RSS Integration
- DailyBuzz can pull real news feeds
- Mix fake lore with real headlines
- Configurable per-feed

---

## Related Files

- `src/config/filler-sites.ts` - Centralized site configuration
- `src/config/app-registry.ts` - Site definitions for browser
- `src/components/browser/Browser.tsx` - URL mappings
- `src/components/browser/BrowserSiteContainer.tsx` - Component routing
