/**
 * WealthWisdom Site - Financial advisor parody
 *
 * Features:
 * - Financial "gurus" with questionable advice
 * - Investment tips and strategies
 * - Crypto coverage
 * - Lore-connected financial content
 * - Market analysis and predictions
 * - "Courses" and premium content CTAs
 */

import { useState, useMemo } from 'react'
import type { SiteProps } from '../BrowserSiteContainer.js'
import { FILLER_SITES } from '../../../config/filler-sites.js'
import { SidebarAdWidget } from '../ads/index.js'
import { StyledCard, Button, Avatar, MetaRow } from '../../ui/shared/index.js'
import { useSiteContent, type SiteContentItem } from '../../../hooks/useSiteContent.js'

// Site config
const SITE = FILLER_SITES.wealthwisdom

// Types
interface Article {
  id: string
  title: string
  author: string
  authorTitle: string
  authorEmoji: string
  category: 'investing' | 'crypto' | 'mindset' | 'real-estate' | 'side-hustles' | 'retirement'
  readTime: number
  likes: number
  isPremium: boolean
  preview: string
  content: string[]
  tags: string[]
}

interface Course {
  id: string
  title: string
  instructor: string
  price: string
  originalPrice: string
  rating: number
  students: number
  emoji: string
  description: string
  modules: string[]
}

interface Guru {
  id: string
  name: string
  title: string
  emoji: string
  followers: string
  specialty: string
  quote: string
  credentials: string[]
}

// Sample gurus
const GURUS: Guru[] = [
  {
    id: 'derek',
    name: 'Derek Moneysworth III',
    title: 'Wealth Manifestation Coach',
    emoji: '🦅',
    followers: '2.3M',
    specialty: 'Passive Income & Mindset',
    quote: 'Your bank account is just a reflection of your vibration.',
    credentials: [
      'Self-made millionaire (inherited $2.1M)',
      'Author of "Rich Mind, Rich Life"',
      'TedX speaker (rejected by TED)',
      'Former crypto influencer',
    ],
  },
  {
    id: 'crystal',
    name: 'Crystal Abundance',
    title: 'Financial Spiritualist',
    emoji: '✨',
    followers: '890K',
    specialty: 'Manifestation & Abundance',
    quote: 'Money flows to those who align their chakras with their portfolios.',
    credentials: [
      'Certified Abundance Coach',
      'Energy healer (for finances)',
      'Creator of MoonPhase Trading™',
      'Host of "Attract Wealth" podcast',
    ],
  },
  {
    id: 'chad',
    name: 'Chad Sigmington',
    title: 'Alpha Investment Strategist',
    emoji: '🐺',
    followers: '1.5M',
    specialty: 'Sigma Grindset & Day Trading',
    quote: 'While they sleep, I analyze charts. While they party, I compound.',
    credentials: [
      'Wakes up at 3:47 AM',
      '847 day trading streak',
      'Author of "Lone Wolf Economics"',
      'Banned from r/wallstreetbets',
    ],
  },
  {
    id: 'patricia',
    name: 'Patricia Pennysaver',
    title: 'Frugal Living Expert',
    emoji: '🐿️',
    followers: '450K',
    specialty: 'Extreme Saving & FIRE',
    quote: 'A latte a day is $182,500 over 50 years with compound interest.',
    credentials: [
      'Retired at 38 (lives with parents)',
      'Hasn\'t bought new socks since 2015',
      'Excel spreadsheet influencer',
      'Owns 47 reusable grocery bags',
    ],
  },
]

// Sample articles
const ARTICLES: Article[] = [
  {
    id: 'quantum-coffee-investment',
    title: 'Why Quantum Coffee Stocks Are the Next Big Thing (I\'m All In)',
    author: 'Derek Moneysworth III',
    authorTitle: 'Wealth Manifestation Coach',
    authorEmoji: '🦅',
    category: 'investing',
    readTime: 8,
    likes: 2341,
    isPremium: false,
    preview: 'The quantum coffee revolution is here, and early investors are seeing 10x returns...',
    content: [
      'I\'ve been watching the quantum coffee space for months now, and I can confidently say this is the biggest investment opportunity since Bitcoin.',
      'For those who don\'t know, quantum coffee uses quantum entanglement to brew coffee that exists in multiple states simultaneously. You\'re not just drinking coffee - you\'re drinking probability itself.',
      'The lead company in this space, QuantumBrew Inc., has seen their stock rise 340% in the past quarter. And this is just the beginning.',
      'Here\'s why I\'m going all in:',
      '1. First-mover advantage in quantum beverages',
      '2. Patent portfolio worth billions',
      '3. The founder literally won a Nobel Prize (pending)',
      '4. Coffee consumption isn\'t going anywhere',
      'My prediction? $500/share by end of year. You heard it here first.',
      'Disclaimer: This is not financial advice. I just really like the stock. And the coffee.',
    ],
    tags: ['quantum coffee', 'stocks', 'investment', 'YOLO'],
  },
  {
    id: 'sigma-grindset',
    title: '17 Sigma Male Money Habits That Will Make You Uncomfortably Wealthy',
    author: 'Chad Sigmington',
    authorTitle: 'Alpha Investment Strategist',
    authorEmoji: '🐺',
    category: 'mindset',
    readTime: 12,
    likes: 8923,
    isPremium: false,
    preview: 'Beta males check their portfolios. Sigmas become the portfolio...',
    content: [
      'Listen up. I\'m about to drop knowledge that will separate you from the sheep.',
      'Habit #1: Wake up at 3:47 AM. Not 4 AM like betas. 3:47. The markets can feel your energy.',
      'Habit #2: Cold showers with ice made from your frozen tears of past losses.',
      'Habit #3: Never smile at gains. Acknowledging success is weakness.',
      'Habit #4: Walk away from conversations mid-sentence to check charts.',
      'Habit #5: Eat your meals standing up. Sitting is for people with "jobs."',
      'Habit #6: Replace friends with trading bots.',
      'Habit #7: Meditate on your net worth, not your feelings.',
      'Habit #8: Learn to read candlestick charts in your dreams.',
      'Habit #9: Never explain your positions. Explaining is beta behavior.',
      'Habit #10: Your morning routine should be longer than your actual work.',
      'The remaining 7 habits are in my premium course. Link in bio.',
      'Remember: While they\'re out having "fun," you\'re building generational wealth. Who\'s laughing now? Neither of us, because laughing is unproductive.',
    ],
    tags: ['sigma', 'grindset', 'mindset', 'wealth'],
  },
  {
    id: 'hartwell-real-estate',
    title: 'I Bought Property Near Hartwell Building - Here\'s What Happened',
    author: 'Patricia Pennysaver',
    authorTitle: 'Frugal Living Expert',
    authorEmoji: '🐿️',
    category: 'real-estate',
    readTime: 6,
    likes: 1203,
    isPremium: false,
    preview: 'The listing was suspiciously cheap. Now I know why...',
    content: [
      'As a frugal living expert, I\'m always looking for deals. When I saw a condo near the Hartwell Building for 60% below market value, I thought I struck gold.',
      'The realtor kept deflecting questions about "the 2018 incident." I assumed it was a plumbing issue.',
      'Fast forward three months:',
      '- My plants grow at 3x normal speed but only at night',
      '- My wifi connects to networks that don\'t exist',
      '- Sometimes my reflection moves before I do',
      '- The property value has dropped another 40%',
      'On the bright side, my utility bills are incredibly low because the lights turn themselves off whenever they "sense something."',
      'The real financial lesson here: Due diligence isn\'t just about comparables. Google the address. Check local news archives. Maybe visit at 3 AM.',
      'Would I recommend buying near Hartwell? Depends on your risk tolerance. And your tolerance for unexplained phenomena.',
      'Current ROI: -47% (but my rent is free because no one else will live here)',
    ],
    tags: ['real estate', 'hartwell building', 'frugal', 'mistake'],
  },
  {
    id: 'trust-fall-business',
    title: 'How Trust Fall Tim Built a 6-Figure Business From Nothing But Falling',
    author: 'Derek Moneysworth III',
    authorTitle: 'Wealth Manifestation Coach',
    authorEmoji: '🦅',
    category: 'side-hustles',
    readTime: 7,
    likes: 4521,
    isPremium: false,
    preview: 'He fell backwards into success - literally. Here\'s his story...',
    content: [
      'You\'ve seen him on VidTube. You\'ve read about him on Threadit. Trust Fall Tim is everywhere, and he\'s making bank.',
      'But here\'s what nobody talks about: Tim turned trust falls into a multi-platform business empire.',
      'Revenue streams:',
      '- VidTube ad revenue: $12K/month',
      '- Trust Fall Training courses: $8K/month',
      '- Corporate team building events: $15K/month',
      '- Merchandise ("I Caught Tim" t-shirts): $3K/month',
      '- BargainBay training services: $2K/month',
      'Total: $40K/month from FALLING BACKWARDS.',
      'The lesson? Find something you\'re passionate about, even if it\'s terrifying everyone around you.',
      'Tim\'s advice: "Everyone told me trust falls weren\'t a career. Now I fall from buildings and they clap."',
      'His next venture? NFTs of his best falls. I\'m already on the whitelist.',
    ],
    tags: ['trust fall tim', 'entrepreneur', 'side hustle', 'passive income'],
  },
  {
    id: 'moon-phase-trading',
    title: 'MoonPhase Trading: Why I Only Buy During Waxing Gibbous',
    author: 'Crystal Abundance',
    authorTitle: 'Financial Spiritualist',
    authorEmoji: '✨',
    category: 'investing',
    readTime: 9,
    likes: 1876,
    isPremium: true,
    preview: 'The moon affects tides. It affects your period. Why not your portfolio?',
    content: [
      '[PREMIUM CONTENT - Preview Only]',
      'Ancient civilizations knew something we\'ve forgotten: the moon governs all flows, including cash flow.',
      'After 3 years of backtesting my MoonPhase Trading strategy, I can confirm:',
      '- Waxing Gibbous: Best time to BUY (energy is building)',
      '- Full Moon: HOLD (too much chaotic energy)',
      '- Waning Crescent: SELL (release what no longer serves you)',
      '- New Moon: Set intentions and journal about money',
      'My portfolio has seen a 23% return using this method (results not typical, but typical results are for typical people).',
      'To unlock the full moon phase calendar, astrological chart analysis, and my personal crystal grid setup for maximum wealth attraction, join WealthWisdom Premium...',
    ],
    tags: ['moon', 'astrology', 'trading', 'spiritual'],
  },
  {
    id: 'velvet-nft',
    title: 'The Velvet Algorithms NFT Drop: Should You Ape In?',
    author: 'Chad Sigmington',
    authorTitle: 'Alpha Investment Strategist',
    authorEmoji: '🐺',
    category: 'crypto',
    readTime: 5,
    likes: 3298,
    isPremium: false,
    preview: 'This local band is launching NFTs. My analysis inside...',
    content: [
      'The Velvet Algorithms, a band from The Underground venue, just announced a 10,000 NFT collection.',
      'Here\'s my sigma analysis:',
      'BULLISH:',
      '- Strong local cult following',
      '- Mars (venue owner) is advising on the project',
      '- Unique art style (AI-generated album covers)',
      '- Discord has 8,000 members',
      'BEARISH:',
      '- Band might break up like Neon Requiem did',
      '- Roadmap includes "vibes" as a deliverable',
      '- Lead singer doesn\'t know what blockchain is',
      '- Floor price already 3x mint',
      'My verdict: Small bag. 0.5 ETH max. This is either going to zero or becoming the next BAYC. There is no in between.',
      'NFA DYOR WAGMI 🐺',
    ],
    tags: ['NFT', 'crypto', 'velvet algorithms', 'music'],
  },
  {
    id: 'latte-retirement',
    title: 'I Calculated How Much Your Daily Latte Costs Over 47 Years',
    author: 'Patricia Pennysaver',
    authorTitle: 'Frugal Living Expert',
    authorEmoji: '🐿️',
    category: 'retirement',
    readTime: 4,
    likes: 892,
    isPremium: false,
    preview: 'Spoiler: It\'s enough to buy a quantum coffee franchise.',
    content: [
      'Let\'s do the math that Big Coffee doesn\'t want you to see.',
      'One $6 latte per day:',
      '- Per week: $42',
      '- Per month: $180',
      '- Per year: $2,190',
      '- Over 47 years: $102,930',
      'BUT WAIT. With compound interest at 7%:',
      '- Over 47 years: $583,749.23',
      'That\'s right. Your morning coffee habit is costing you over HALF A MILLION DOLLARS.',
      'What could you do with $583,749.23?',
      '- Down payment on a house (not near Hartwell Building)',
      '- Start your own coffee business (ironic)',
      '- Buy 291,874 more coffees (bad choice)',
      '- Retire 8 years earlier',
      'My alternative: I wake up at 4 AM and photosynthesize energy from the sunrise. Free and vegan.',
      'Your move, coffee drinkers.',
    ],
    tags: ['frugal', 'coffee', 'retirement', 'compound interest'],
  },
  {
    id: 'underground-investment',
    title: 'Why I\'m Investing in Local Venues (Starting with The Underground)',
    author: 'Derek Moneysworth III',
    authorTitle: 'Wealth Manifestation Coach',
    authorEmoji: '🦅',
    category: 'investing',
    readTime: 6,
    likes: 1543,
    isPremium: true,
    preview: 'Live music is back. These venues are goldmines waiting to be discovered...',
    content: [
      '[PREMIUM CONTENT - Preview Only]',
      'The pandemic crushed live music. But here\'s what smart money sees: recovery plays.',
      'The Underground, run by the legendary Mars, has been packed every weekend.',
      'Why I\'m bullish on local venues:',
      '- Real estate is undervalued',
      '- Loyal customer base',
      '- Alcohol margins are insane',
      '- Live experiences can\'t be replicated digitally',
      'My thesis: Acquire equity in 3-5 local venues before the market catches on.',
      'To see my full venue investment thesis, Mars interview, and cash flow projections, join WealthWisdom Premium...',
    ],
    tags: ['venues', 'music', 'real estate', 'the underground'],
  },
]

// Sample courses
const COURSES: Course[] = [
  {
    id: 'sigma-trading',
    title: 'Sigma Male Trading Masterclass',
    instructor: 'Chad Sigmington',
    price: '$497',
    originalPrice: '$2,997',
    rating: 4.9,
    students: 12453,
    emoji: '🐺',
    description: 'Learn to trade like a lone wolf. No team. No emotions. Only gains.',
    modules: [
      'Module 1: Rejecting Social Constructs (and Stop Losses)',
      'Module 2: Chart Reading at 3:47 AM',
      'Module 3: The Grindset Mindset',
      'Module 4: Cutting Off Friends Who Don\'t Trade',
      'Module 5: Advanced Sigma Strategies',
      'BONUS: My Exact Morning Routine',
    ],
  },
  {
    id: 'moon-trading',
    title: 'Celestial Wealth Manifestation',
    instructor: 'Crystal Abundance',
    price: '$333',
    originalPrice: '$999',
    rating: 4.7,
    students: 8901,
    emoji: '🌙',
    description: 'Align your investments with the cosmos. Your birth chart is your trading chart.',
    modules: [
      'Module 1: Understanding Your Money Sign',
      'Module 2: Mercury Retrograde Protection',
      'Module 3: MoonPhase Trading Basics',
      'Module 4: Crystal Grid for Your Portfolio',
      'Module 5: Manifesting Gains Meditation',
      'BONUS: Personal Birth Chart Analysis',
    ],
  },
  {
    id: 'extreme-frugal',
    title: 'Extreme Frugality: Retire by 40',
    instructor: 'Patricia Pennysaver',
    price: '$47',
    originalPrice: '$197',
    rating: 4.5,
    students: 23421,
    emoji: '🐿️',
    description: 'Learn to save 90% of your income by eliminating joy.',
    modules: [
      'Module 1: Calculating the True Cost of Fun',
      'Module 2: 500 Free Date Ideas',
      'Module 3: Dumpster Diving for Beginners',
      'Module 4: The Art of Not Buying Things',
      'Module 5: Spreadsheet Templates for Everything',
      'BONUS: My 47-Year Savings Projection',
    ],
  },
]

// ============================================================================
// DB Adapter
// ============================================================================

/**
 * Maps a SiteContentItem from the database to the local Article interface.
 * Uses metadata for article-specific fields like author, authorTitle, category, content, etc.
 */
function dbToArticle(item: SiteContentItem): Article {
  const m = item.metadata || {}
  return {
    id: item.slug,
    title: item.title,
    author: m.author ?? m.Author ?? 'Unknown',
    authorTitle: m.authorTitle ?? m.author_title ?? '',
    authorEmoji: item.thumbnailEmoji ?? m.authorEmoji ?? m.author_emoji ?? '🦅',
    category: (m.category ?? item.category ?? 'investing') as Article['category'],
    readTime: m.readTime ?? m.read_time ?? 5,
    likes: item.likeCount ?? m.likes ?? 0,
    isPremium: m.isPremium ?? m.is_premium ?? false,
    preview: item.subtitle ?? item.summary ?? m.preview ?? '',
    content: Array.isArray(m.content) ? m.content : (item.body ? item.body.split('\n\n') : []),
    tags: item.tags.length > 0 ? item.tags : (m.tags ?? []),
  }
}

export function WealthWisdomSite({ siteId, onNavigate }: SiteProps) {
  const { content: dbContent } = useSiteContent('wealthwisdom')
  const articles = useMemo(() => {
    if (dbContent.length > 0) return dbContent.map(dbToArticle)
    return ARTICLES
  }, [dbContent])

  const [view, setView] = useState<'home' | 'article' | 'guru' | 'courses'>('home')
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  const [selectedGuru, setSelectedGuru] = useState<Guru | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [email, setEmail] = useState('')
  const [showSignupModal, setShowSignupModal] = useState(false)

  const categories = ['all', 'investing', 'crypto', 'mindset', 'real-estate', 'side-hustles', 'retirement']

  const filteredArticles = selectedCategory === 'all'
    ? articles
    : articles.filter(a => a.category === selectedCategory)

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'investing': '#10B981',
      'crypto': '#F59E0B',
      'mindset': '#8B5CF6',
      'real-estate': '#3B82F6',
      'side-hustles': '#EC4899',
      'retirement': '#6366F1',
    }
    return colors[category] || '#666'
  }

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: '#0a0f1c', color: '#e5e7eb' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1a1f2e 0%, #0a0f1c 100%)',
        borderBottom: '1px solid #1f2937',
        padding: '12px 20px',
      }}>
        <div className="flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => { setView('home'); setSelectedArticle(null); setSelectedGuru(null) }}
          >
            <span style={{ fontSize: '28px' }}>{SITE.icon}</span>
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: 'bold' }}>
                <span style={{ color: '#10B981' }}>Wealth</span>
                <span style={{ color: '#e5e7eb' }}>Wisdom</span>
              </h1>
              <p style={{ fontSize: '10px', color: '#6b7280' }}>
                {SITE.tagline}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant={view === 'courses' ? 'primary' : 'outline'}
              size="sm"
              backgroundColor={view === 'courses' ? '#10B981' : 'transparent'}
              textColor={view === 'courses' ? '#fff' : '#10B981'}
              borderColor="#10B981"
              onClick={() => setView('courses')}
            >
              Courses
            </Button>
            <Button
              variant="primary"
              size="sm"
              backgroundColor="#10B981"
              textColor="#fff"
              onClick={() => setShowSignupModal(true)}
            >
              Go Premium 💎
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {view === 'home' && (
          <div className="p-6">
            {/* Hero Banner */}
            <StyledCard
              bgColor="linear-gradient(135deg, #10B981 0%, #059669 100%)"
              borderColor="transparent"
              padding="lg"
              borderRadius="lg"
              shadow="md"
              style={{ marginBottom: '24px' }}
            >
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#fff', marginBottom: '8px' }}>
                🚀 Free Masterclass: "How I Made $47M in 30 Days"
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '16px' }}>
                Limited spots available. Learn the exact strategy I used (results not typical).
              </p>
              <Button
                variant="primary"
                size="md"
                backgroundColor="#fff"
                textColor="#10B981"
                onClick={() => setShowSignupModal(true)}
              >
                Register Now (Free)
              </Button>
            </StyledCard>

            {/* Featured Gurus */}
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>
                💫 Featured Wealth Experts
              </h3>
              <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
                {GURUS.map(guru => (
                  <StyledCard
                    key={guru.id}
                    variant="dark"
                    bgColor="#1f2937"
                    borderColor="#374151"
                    hoverColor="#263341"
                    textColor="#e5e7eb"
                    padding="md"
                    borderRadius="lg"
                    shadow="md"
                    interactive
                    onClick={() => { setSelectedGuru(guru); setView('guru') }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span style={{ fontSize: '32px' }}>{guru.emoji}</span>
                      <div>
                        <p style={{ fontWeight: 'bold', fontSize: '14px' }}>{guru.name}</p>
                        <p style={{ fontSize: '11px', color: '#9ca3af' }}>{guru.title}</p>
                      </div>
                    </div>
                    <p style={{ fontSize: '11px', color: '#6b7280', fontStyle: 'italic', marginBottom: '8px' }}>
                      "{guru.quote.slice(0, 60)}..."
                    </p>
                    <MetaRow
                      items={[
                        { value: `${guru.followers} followers`, icon: '👥' },
                        { value: guru.specialty },
                      ]}
                      separator="•"
                      textSize="xs"
                      textColor="#10B981"
                      mutedColor="#6b7280"
                    />
                  </StyledCard>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap mb-4">
              {categories.map(cat => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? 'primary' : 'outline'}
                  size="sm"
                  backgroundColor={selectedCategory === cat ? '#10B981' : 'transparent'}
                  textColor={selectedCategory === cat ? '#fff' : '#9ca3af'}
                  borderColor={selectedCategory === cat ? '#10B981' : '#374151'}
                  onClick={() => setSelectedCategory(cat)}
                  style={{ textTransform: 'capitalize' }}
                >
                  {cat.replace('-', ' ')}
                </Button>
              ))}
            </div>

            {/* Articles Grid */}
            <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
              {filteredArticles.map(article => (
                <StyledCard
                  key={article.id}
                  variant="dark"
                  bgColor="#1f2937"
                  borderColor="#374151"
                  hoverColor="#263341"
                  textColor="#e5e7eb"
                  padding="lg"
                  borderRadius="lg"
                  shadow="md"
                  interactive
                  onClick={() => { setSelectedArticle(article); setView('article') }}
                  style={{ position: 'relative' }}
                >
                  {article.isPremium && (
                    <span style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      backgroundColor: '#F59E0B',
                      color: '#000',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      padding: '2px 8px',
                      borderRadius: '4px',
                    }}>
                      PREMIUM 💎
                    </span>
                  )}
                  <span style={{
                    display: 'inline-block',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    backgroundColor: getCategoryColor(article.category),
                    color: '#fff',
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                  }}>
                    {article.category.replace('-', ' ')}
                  </span>
                  <h4 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '8px', lineHeight: '1.3' }}>
                    {article.title}
                  </h4>
                  <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '12px', lineHeight: '1.4' }}>
                    {article.preview}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar
                        size="sm"
                        initials={article.author.split(' ').map(n => n[0]).join('')}
                        bgColor="#374151"
                      />
                      <span style={{ fontSize: '11px', color: '#6b7280' }}>{article.author}</span>
                    </div>
                    <MetaRow
                      items={[
                        { value: `${article.readTime} min`, icon: '⏱️' },
                        { value: `${article.likes.toLocaleString()}`, icon: '❤️' },
                      ]}
                      separator="•"
                      textSize="xs"
                      textColor="#6b7280"
                      mutedColor="#6b7280"
                    />
                  </div>
                </StyledCard>
              ))}
            </div>
          </div>
        )}

        {view === 'article' && selectedArticle && (
          <div className="p-6" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <Button
              variant="ghost"
              size="sm"
              textColor="#10B981"
              onClick={() => { setView('home'); setSelectedArticle(null) }}
              style={{ marginBottom: '16px' }}
            >
              ← Back to Articles
            </Button>

            <span style={{
              display: 'inline-block',
              padding: '4px 12px',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: 'bold',
              backgroundColor: getCategoryColor(selectedArticle.category),
              color: '#fff',
              marginBottom: '12px',
              textTransform: 'uppercase',
            }}>
              {selectedArticle.category.replace('-', ' ')}
            </span>

            <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '16px', lineHeight: '1.2' }}>
              {selectedArticle.title}
            </h1>

            <div className="flex items-center gap-4 mb-6" style={{ borderBottom: '1px solid #374151', paddingBottom: '16px' }}>
              <div className="flex items-center gap-2">
                <Avatar
                  size="lg"
                  initials={selectedArticle.author.split(' ').map(n => n[0]).join('')}
                  bgColor="#374151"
                />
                <div>
                  <p style={{ fontWeight: 'bold', fontSize: '14px' }}>{selectedArticle.author}</p>
                  <p style={{ fontSize: '11px', color: '#6b7280' }}>{selectedArticle.authorTitle}</p>
                </div>
              </div>
              <MetaRow
                items={[
                  { value: `${selectedArticle.readTime} min read`, icon: '⏱️' },
                  { value: `${selectedArticle.likes.toLocaleString()}`, icon: '❤️' },
                ]}
                separator="•"
                textSize="sm"
                textColor="#6b7280"
                alignment="right"
                style={{ marginLeft: 'auto' }}
              />
            </div>

            <div style={{ lineHeight: '1.8', fontSize: '15px' }}>
              {selectedArticle.content.map((paragraph, i) => (
                <p key={i} style={{
                  marginBottom: '16px',
                  color: paragraph.startsWith('[PREMIUM') ? '#F59E0B' : '#e5e7eb',
                  fontWeight: paragraph.startsWith('[PREMIUM') ? 'bold' : 'normal',
                }}>
                  {paragraph}
                </p>
              ))}
            </div>

            {selectedArticle.isPremium && (
              <StyledCard
                bgColor="#1f2937"
                borderColor="#F59E0B"
                borderWidth={2}
                padding="lg"
                borderRadius="lg"
                textColor="#e5e7eb"
                style={{ marginTop: '24px', textAlign: 'center' }}
              >
                <p style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
                  💎 Unlock Full Article
                </p>
                <p style={{ color: '#9ca3af', marginBottom: '16px' }}>
                  Get access to this article and 500+ premium insights
                </p>
                <Button
                  variant="primary"
                  size="md"
                  backgroundColor="#F59E0B"
                  textColor="#000"
                  onClick={() => setShowSignupModal(true)}
                >
                  Go Premium - $9.99/month
                </Button>
              </StyledCard>
            )}

            <div style={{ marginTop: '24px' }}>
              <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>Tags:</p>
              <div className="flex gap-2 flex-wrap">
                {selectedArticle.tags.map(tag => (
                  <span
                    key={tag}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      backgroundColor: '#374151',
                      color: '#9ca3af',
                    }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {view === 'guru' && selectedGuru && (
          <div className="p-6" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <Button
              variant="ghost"
              size="sm"
              textColor="#10B981"
              onClick={() => { setView('home'); setSelectedGuru(null) }}
              style={{ marginBottom: '16px' }}
            >
              ← Back
            </Button>

            <StyledCard
              bgColor="#1f2937"
              borderColor="#374151"
              padding="lg"
              borderRadius="lg"
              shadow="md"
              style={{ marginBottom: '24px' }}
            >
              <div className="flex items-start gap-4">
                <span style={{ fontSize: '64px' }}>{selectedGuru.emoji}</span>
                <div>
                  <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '4px' }}>
                    {selectedGuru.name}
                  </h1>
                  <p style={{ color: '#10B981', marginBottom: '8px' }}>{selectedGuru.title}</p>
                  <MetaRow
                    items={[{ value: `${selectedGuru.followers} followers`, icon: '👥' }]}
                    textSize="sm"
                    textColor="#9ca3af"
                  />
                </div>
              </div>

              <StyledCard
                bgColor="#374151"
                borderColor="#10B981"
                borderWidth={0}
                padding="lg"
                borderRadius="md"
                textColor="#e5e7eb"
                style={{
                  fontSize: '18px',
                  fontStyle: 'italic',
                  marginTop: '20px',
                  borderLeft: '4px solid #10B981',
                }}
              >
                "{selectedGuru.quote}"
              </StyledCard>
            </StyledCard>

            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>
                Credentials & Achievements
              </h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {selectedGuru.credentials.map((cred, i) => (
                  <li key={i} style={{
                    padding: '8px 0',
                    borderBottom: '1px solid #374151',
                    fontSize: '14px',
                    color: '#9ca3af',
                  }}>
                    ✓ {cred}
                  </li>
                ))}
              </ul>
            </div>

            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>
              Articles by {selectedGuru.name.split(' ')[0]}
            </h3>
            <div className="grid gap-3">
              {articles.filter(a => a.author === selectedGuru.name).map(article => (
                <StyledCard
                  key={article.id}
                  bgColor="#1f2937"
                  borderColor="#374151"
                  hoverColor="#263341"
                  padding="md"
                  borderRadius="md"
                  interactive
                  onClick={() => { setSelectedArticle(article); setView('article') }}
                >
                  <p style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>{article.title}</p>
                  <MetaRow
                    items={[
                      { value: `${article.readTime} min`, icon: '⏱️' },
                      { value: `${article.likes.toLocaleString()}`, icon: '❤️' },
                    ]}
                    separator="•"
                    textSize="xs"
                    textColor="#6b7280"
                    mutedColor="#6b7280"
                  />
                </StyledCard>
              ))}
            </div>
          </div>
        )}

        {view === 'courses' && (
          <div className="p-6">
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
              📚 Premium Courses
            </h2>
            <p style={{ color: '#9ca3af', marginBottom: '24px' }}>
              Learn from the best (self-proclaimed) wealth experts
            </p>

            <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
              {COURSES.map(course => (
                <StyledCard
                  key={course.id}
                  bgColor="#1f2937"
                  borderColor="#374151"
                  padding="lg"
                  borderRadius="lg"
                  shadow="md"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span style={{ fontSize: '48px' }}>{course.emoji}</span>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: 'bold', lineHeight: '1.2' }}>
                        {course.title}
                      </h3>
                      <p style={{ fontSize: '12px', color: '#9ca3af' }}>by {course.instructor}</p>
                    </div>
                  </div>

                  <p style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '12px' }}>
                    {course.description}
                  </p>

                  <div style={{ marginBottom: '12px' }}>
                    <p style={{ fontSize: '11px', color: '#6b7280', marginBottom: '6px' }}>Modules:</p>
                    <ul style={{ fontSize: '11px', color: '#9ca3af', paddingLeft: '16px' }}>
                      {course.modules.slice(0, 3).map((mod, i) => (
                        <li key={i} style={{ marginBottom: '2px' }}>{mod}</li>
                      ))}
                      <li style={{ color: '#10B981' }}>+ {course.modules.length - 3} more...</li>
                    </ul>
                  </div>

                  <MetaRow
                    items={[
                      { value: `${course.rating}`, icon: '⭐' },
                      { value: `${course.students.toLocaleString()} students`, icon: '👥' },
                    ]}
                    separator="•"
                    textSize="sm"
                    textColor="#6b7280"
                    mutedColor="#6b7280"
                    style={{ marginBottom: '16px' }}
                  />

                  <div className="flex items-center justify-between">
                    <div>
                      <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#10B981' }}>
                        {course.price}
                      </span>
                      <span style={{
                        fontSize: '14px',
                        color: '#6b7280',
                        textDecoration: 'line-through',
                        marginLeft: '8px',
                      }}>
                        {course.originalPrice}
                      </span>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      backgroundColor="#10B981"
                      textColor="#fff"
                      onClick={() => setShowSignupModal(true)}
                    >
                      Enroll Now
                    </Button>
                  </div>
                </StyledCard>
              ))}
            </div>

            {/* Money back guarantee */}
            <StyledCard
              bgColor="#374151"
              borderColor="transparent"
              padding="md"
              borderRadius="md"
              style={{ marginTop: '24px', textAlign: 'center' }}
            >
              <p style={{ fontSize: '14px', marginBottom: '4px' }}>
                💰 30-Day Money Back Guarantee (if you can prove you didn't get rich)
              </p>
              <p style={{ fontSize: '11px', color: '#6b7280' }}>
                Terms: Must provide documentation of following advice exactly. Most refund requests denied.
              </p>
            </StyledCard>
          </div>
        )}
      </div>

      {/* Signup Modal */}
      {showSignupModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
          }}
          onClick={() => setShowSignupModal(false)}
        >
          <StyledCard
            bgColor="#1f2937"
            borderColor="#374151"
            padding="xl"
            borderRadius="xl"
            shadow="lg"
            style={{ maxWidth: '400px', width: '90%' }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px', textAlign: 'center' }}>
              🚀 Join WealthWisdom Premium
            </h3>
            <p style={{ color: '#9ca3af', textAlign: 'center', marginBottom: '20px', fontSize: '13px' }}>
              Get unlimited access to all articles, courses, and exclusive insights
            </p>

            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email"
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid #374151',
                backgroundColor: '#0a0f1c',
                color: '#fff',
                marginBottom: '12px',
                fontSize: '14px',
              }}
            />

            <Button
              variant="primary"
              size="md"
              width="full"
              backgroundColor="#10B981"
              textColor="#fff"
              style={{ marginBottom: '12px' }}
            >
              Start Free Trial
            </Button>

            <p style={{ fontSize: '10px', color: '#6b7280', textAlign: 'center' }}>
              By signing up, you agree to receive 47 emails per day about becoming rich.
              Unsubscribe anytime (we'll email you about that too).
            </p>
          </StyledCard>
        </div>
      )}

      {/* Sponsored Ads */}
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '24px 16px' }}>
        <SidebarAdWidget
          siteId="wealthwisdom"
          onNavigate={onNavigate}
          title="More Ways to Get Rich"
          count={2}
        />
      </div>

      {/* Footer */}
      <div style={{
        padding: '8px 16px',
        backgroundColor: '#0a0f1c',
        borderTop: '1px solid #1f2937',
        fontSize: '9px',
        color: '#4b5563',
        textAlign: 'center',
      }}>
        <p>
          Disclaimer: Nothing on WealthWisdom is financial advice. Past performance doesn't guarantee future results.
          Most people who try these strategies lose money. We are not responsible for your decisions.
          The gurus on this site may or may not be real. Their results are definitely not typical.
        </p>
      </div>
    </div>
  )
}

export default WealthWisdomSite
