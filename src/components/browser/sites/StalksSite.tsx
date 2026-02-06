/**
 * Stalks Site
 *
 * Prediction market for .corn internet drama and lore debates.
 * Users bet Kernels (🌽) on outcomes of local drama, conspiracies, and events.
 *
 * URL Routing:
 * - Homepage: path = null or '/'
 * - Market detail: path = '/market/:slug'
 * - Category: path = '/category/:category'
 */

import { useState, useCallback, useMemo } from 'react'
import type { SiteComponentProps } from '../../../router/types.js'
import { useSiteContent, type SiteContentItem } from '../../../hooks/useSiteContent.js'

// ============================================================================
// Theme
// ============================================================================

const THEME = {
  bg: '#0d1117',
  bgCard: '#161b22',
  bgHover: '#1f2937',
  border: '#30363d',
  text: '#e6edf3',
  textMuted: '#8b949e',
  textDim: '#6e7681',
  accent: '#f0b429', // Golden corn color
  accentDim: '#b8860b',
  green: '#3fb950',
  greenBg: 'rgba(63, 185, 80, 0.15)',
  red: '#f85149',
  redBg: 'rgba(248, 81, 73, 0.15)',
  blue: '#58a6ff',
}

// ============================================================================
// Types
// ============================================================================

interface Market {
  slug: string
  title: string
  description: string
  category: MarketCategory
  yesPrice: number // 0-100 representing probability %
  volume: number // Total Kernels traded
  traders: number
  endDate: string
  resolution?: 'yes' | 'no' | null
  featured?: boolean
  hot?: boolean
  tags: string[]
}

type MarketCategory =
  | 'celebrities'
  | 'music'
  | 'hartwell'
  | 'quantum-coffee'
  | 'underground'
  | 'omnicorp'
  | 'general'

interface CategoryInfo {
  id: MarketCategory
  name: string
  icon: string
  description: string
}

// ============================================================================
// Data
// ============================================================================

const CATEGORIES: CategoryInfo[] = [
  { id: 'celebrities', name: 'Local Celebrities', icon: '⭐', description: 'Trust Fall Tim, Derek, Small Kevin, and more' },
  { id: 'music', name: 'Music Scene', icon: '🎸', description: 'Bands, venues, and the eternal Wonderwall question' },
  { id: 'hartwell', name: 'Hartwell Building', icon: '🏢', description: 'Floor 13, mirrors, and corporate mysteries' },
  { id: 'quantum-coffee', name: 'Quantum Coffee', icon: '☕', description: 'Is it real? Will Derek prove it? Find out.' },
  { id: 'underground', name: 'The Underground', icon: '🎤', description: 'Venue drama, bans, and booking chaos' },
  { id: 'omnicorp', name: 'Omnicorp Holdings', icon: '🏛️', description: 'What do they actually do?' },
  { id: 'general', name: 'General', icon: '🌽', description: 'Everything else in Cornfield' },
]

const MARKETS: Market[] = [
  // Featured / Hot markets
  {
    slug: 'trust-fall-tim-3000',
    title: 'Will Trust Fall Tim reach 3,000 documented falls by end of 2024?',
    description: 'Currently at 2,847 falls with a 78.5% catch rate. Tim shows no signs of stopping. The question is: can his body keep up?',
    category: 'celebrities',
    yesPrice: 72,
    volume: 84700,
    traders: 312,
    endDate: 'Dec 31, 2024',
    featured: true,
    hot: true,
    tags: ['trust-fall-tim', 'record', 'physical-feat'],
  },
  {
    slug: 'derek-jennifer-reconciliation',
    title: 'Will Derek and Jennifer reconcile before Derek\'s 1000th quantum coffee trial?',
    description: 'Jennifer left Derek over his quantum coffee obsession. Derek is currently on trial #847. Sources say Jennifer has blocked his number, but Derek remains "cautiously optimistic."',
    category: 'quantum-coffee',
    yesPrice: 8,
    volume: 23400,
    traders: 187,
    endDate: 'Open',
    featured: true,
    tags: ['derek', 'jennifer', 'relationship', 'quantum-coffee'],
  },
  {
    slug: 'floor-13-confirmed',
    title: 'Will the Hartwell Building\'s Floor 13 be officially confirmed to exist?',
    description: 'Building management insists there is no 13th floor. The elevator disagrees. Architectural records are "unavailable." This market resolves YES if any official documentation confirms Floor 13.',
    category: 'hartwell',
    yesPrice: 15,
    volume: 156000,
    traders: 847,
    endDate: 'Open',
    featured: true,
    hot: true,
    tags: ['hartwell', 'floor-13', 'conspiracy', 'mystery'],
  },
  {
    slug: 'velvet-algorithms-hiatus-end',
    title: 'Will The Velvet Algorithms end their meditation hiatus in 2024?',
    description: 'The electronic duo has been on "indefinite meditation hiatus" since their last existential crisis. Band members were last spotted at a silent retreat in the mountains.',
    category: 'music',
    yesPrice: 34,
    volume: 45200,
    traders: 203,
    endDate: 'Dec 31, 2024',
    tags: ['velvet-algorithms', 'music', 'hiatus'],
  },
  {
    slug: 'gary-underground-unban',
    title: 'Will Gary ever get unbanned from The Underground?',
    description: 'Gary requested Wonderwall ONE TIME in 2021. Mars has maintained the ban for 3+ years. Gary\'s petition has 12 signatures (3 are his own alts).',
    category: 'underground',
    yesPrice: 3,
    volume: 67800,
    traders: 445,
    endDate: 'Open',
    hot: true,
    tags: ['gary', 'wonderwall', 'underground', 'ban'],
  },
  {
    slug: 'neon-requiem-reunion',
    title: 'Will Neon Requiem play a reunion show?',
    description: 'The post-punk legends broke up in January 2024. Drummer Vex reportedly "still hasn\'t accepted it" and continues setting up for practice. Lead singer says "never" but was seen crying at old venue.',
    category: 'music',
    yesPrice: 28,
    volume: 89300,
    traders: 567,
    endDate: 'Open',
    tags: ['neon-requiem', 'reunion', 'music'],
  },
  {
    slug: 'small-kevin-redemption',
    title: 'Will Small Kevin achieve public redemption for "The Incident"?',
    description: 'Kevin Smallwood has been running a redemption blog since The Incident with Trust Fall Tim. Public opinion remains divided. His latest post "I\'ve Grown (Emotionally, Not Physically)" has 23 likes.',
    category: 'celebrities',
    yesPrice: 41,
    volume: 34500,
    traders: 198,
    endDate: 'Open',
    tags: ['small-kevin', 'the-incident', 'redemption'],
  },
  {
    slug: 'quantum-coffee-real-journal',
    title: 'Will Derek get published in a peer-reviewed scientific journal?',
    description: 'Derek has submitted his quantum coffee research to 47 journals. All have rejected it. He\'s now targeting "The Journal of Implausible Brewing" which has a 2% acceptance rate.',
    category: 'quantum-coffee',
    yesPrice: 2,
    volume: 12300,
    traders: 156,
    endDate: 'Open',
    tags: ['derek', 'quantum-coffee', 'science', 'publication'],
  },
  {
    slug: 'omnicorp-business-revealed',
    title: 'Will Omnicorp Holdings publicly reveal what they actually do?',
    description: 'Nobody knows what Omnicorp does. Patricia from HR says "synergy." The lobby has motivational posters about "leveraging core competencies." Their annual report is 200 pages of corporate buzzwords.',
    category: 'omnicorp',
    yesPrice: 5,
    volume: 234000,
    traders: 1203,
    endDate: 'Open',
    tags: ['omnicorp', 'mystery', 'corporate'],
  },
  {
    slug: 'wonderwall-requests-month',
    title: 'Over/Under 8.5 Wonderwall requests at The Underground this month?',
    description: 'Mars keeps a tally. Last month saw 12 requests and 12 new lifetime bans. The over has hit 7 of the last 8 months.',
    category: 'underground',
    yesPrice: 67,
    volume: 28900,
    traders: 234,
    endDate: 'End of month',
    tags: ['wonderwall', 'underground', 'over-under'],
  },
  {
    slug: 'martinez-quantum-coffee-endorsement',
    title: 'Will Dr. Martinez ever endorse quantum coffee brewing?',
    description: 'Dr. Elena Martinez has repeatedly clarified her paper was about subatomic particles, NOT beverages. Derek has sent her 847 emails. Her latest response was a restraining order.',
    category: 'quantum-coffee',
    yesPrice: 1,
    volume: 8700,
    traders: 89,
    endDate: 'Open',
    tags: ['martinez', 'quantum-coffee', 'science'],
  },
  {
    slug: 'hartwell-elevator-floor-13-button',
    title: 'Will a Floor 13 button appear in a Hartwell elevator?',
    description: 'Multiple tenants report the elevator "acting strangely" near where Floor 13 would be. One claims to have seen a button flicker into existence. Building management blamed "humidity."',
    category: 'hartwell',
    yesPrice: 22,
    volume: 78400,
    traders: 456,
    endDate: 'Open',
    hot: true,
    tags: ['hartwell', 'elevator', 'floor-13', 'paranormal'],
  },
  {
    slug: 'trust-fall-tim-catch-rate-80',
    title: 'Will Trust Fall Tim\'s catch rate exceed 80%?',
    description: 'Currently at 78.5%. Tim has been working on "trust optimization strategies" including only falling near people who look trustworthy. Critics call this "statistical manipulation."',
    category: 'celebrities',
    yesPrice: 45,
    volume: 56700,
    traders: 289,
    endDate: 'Dec 31, 2024',
    tags: ['trust-fall-tim', 'statistics', 'record'],
  },
  {
    slug: 'qubit-coffee-price-increase',
    title: 'Will Qubit Coffee raise prices above $50/cup?',
    description: 'Currently $47/cup. Owner claims "quantum ingredients are expensive." Derek says it\'s worth $100. Jennifer (his ex) says it\'s worth $0.',
    category: 'quantum-coffee',
    yesPrice: 56,
    volume: 19800,
    traders: 167,
    endDate: 'Dec 31, 2024',
    tags: ['qubit-coffee', 'price', 'business'],
  },
  {
    slug: 'carol-henderson-intervention',
    title: 'Will Carol Henderson stage an intervention for Tim?',
    description: 'Tim\'s mother Carol has been writing increasingly concerned blog posts. Her latest: "847 Reasons My Son Should Stop Falling." Family sources say an intervention is "being discussed."',
    category: 'celebrities',
    yesPrice: 38,
    volume: 23400,
    traders: 145,
    endDate: 'Open',
    tags: ['carol', 'trust-fall-tim', 'family', 'intervention'],
  },
]

const USER_BALANCE = 10000 // Starting Kernels

// ============================================================================
// DB Adapter
// ============================================================================

/**
 * Maps a SiteContentItem from the database to the local Market interface.
 * Uses metadata for market-specific fields like yesPrice, volume, traders, etc.
 */
function dbToMarket(item: SiteContentItem): Market {
  const m = item.metadata || {}
  return {
    slug: item.slug,
    title: item.title,
    description: item.body ?? item.summary ?? '',
    category: (m.category ?? item.category ?? 'general') as MarketCategory,
    yesPrice: m.yesPrice ?? m.yes_price ?? 50,
    volume: m.volume ?? item.viewCount ?? 0,
    traders: m.traders ?? item.commentCount ?? 0,
    endDate: m.endDate ?? m.end_date ?? 'Open',
    resolution: m.resolution ?? null,
    featured: item.isFeatured ?? m.featured ?? false,
    hot: m.hot ?? false,
    tags: item.tags.length > 0 ? item.tags : (m.tags ?? []),
  }
}

// ============================================================================
// Components
// ============================================================================

function Logo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span style={{ fontSize: '28px' }}>📈</span>
      <span style={{
        fontSize: '24px',
        fontWeight: 700,
        color: THEME.accent,
        letterSpacing: '-0.5px',
      }}>
        Stalks
      </span>
      <span style={{ fontSize: '20px' }}>🌽</span>
    </div>
  )
}

function KernelBalance({ balance }: { balance: number }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      padding: '8px 16px',
      background: THEME.bgCard,
      borderRadius: '8px',
      border: `1px solid ${THEME.border}`,
    }}>
      <span style={{ fontSize: '18px' }}>🌽</span>
      <span style={{
        fontWeight: 600,
        color: THEME.accent,
        fontFamily: 'monospace',
      }}>
        {balance.toLocaleString()}
      </span>
      <span style={{ color: THEME.textMuted, fontSize: '12px' }}>Kernels</span>
    </div>
  )
}

function PriceBar({ yesPrice }: { yesPrice: number }) {
  const noPrice = 100 - yesPrice
  return (
    <div style={{ display: 'flex', gap: '2px', height: '32px', borderRadius: '6px', overflow: 'hidden' }}>
      <button
        style={{
          flex: yesPrice,
          background: THEME.greenBg,
          border: 'none',
          color: THEME.green,
          fontWeight: 600,
          fontSize: '14px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '4px',
          transition: 'filter 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.2)'}
        onMouseLeave={e => e.currentTarget.style.filter = 'brightness(1)'}
      >
        Yes {yesPrice}¢
      </button>
      <button
        style={{
          flex: noPrice,
          background: THEME.redBg,
          border: 'none',
          color: THEME.red,
          fontWeight: 600,
          fontSize: '14px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '4px',
          transition: 'filter 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.2)'}
        onMouseLeave={e => e.currentTarget.style.filter = 'brightness(1)'}
      >
        No {noPrice}¢
      </button>
    </div>
  )
}

function MarketCard({ market, onClick }: { market: Market; onClick: () => void }) {
  const category = CATEGORIES.find(c => c.id === market.category)

  return (
    <div
      onClick={onClick}
      style={{
        background: THEME.bgCard,
        borderRadius: '12px',
        border: `1px solid ${THEME.border}`,
        padding: '16px',
        cursor: 'pointer',
        transition: 'border-color 0.15s, transform 0.15s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = THEME.accent
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = THEME.border
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '12px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{
              fontSize: '11px',
              padding: '2px 8px',
              background: THEME.bgHover,
              borderRadius: '4px',
              color: THEME.textMuted,
            }}>
              {category?.icon} {category?.name}
            </span>
            {market.hot && (
              <span style={{
                fontSize: '11px',
                padding: '2px 8px',
                background: 'rgba(248, 81, 73, 0.2)',
                borderRadius: '4px',
                color: THEME.red,
              }}>
                🔥 Hot
              </span>
            )}
          </div>
          <h3 style={{
            fontSize: '15px',
            fontWeight: 600,
            color: THEME.text,
            lineHeight: 1.4,
            margin: 0,
          }}>
            {market.title}
          </h3>
        </div>
      </div>

      {/* Price Bar */}
      <PriceBar yesPrice={market.yesPrice} />

      {/* Stats */}
      <div style={{
        display: 'flex',
        gap: '16px',
        marginTop: '12px',
        fontSize: '12px',
        color: THEME.textMuted,
      }}>
        <span>🌽 {(market.volume / 1000).toFixed(1)}K vol</span>
        <span>👥 {market.traders} traders</span>
        <span>⏰ {market.endDate}</span>
      </div>
    </div>
  )
}

function MarketDetail({ market, onBack }: { market: Market; onBack: () => void }) {
  const [betAmount, setBetAmount] = useState(100)
  const [betSide, setBetSide] = useState<'yes' | 'no'>('yes')
  const category = CATEGORIES.find(c => c.id === market.category)

  const potentialWin = betSide === 'yes'
    ? Math.floor(betAmount * (100 / market.yesPrice) - betAmount)
    : Math.floor(betAmount * (100 / (100 - market.yesPrice)) - betAmount)

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px' }}>
      {/* Back button */}
      <button
        onClick={onBack}
        style={{
          background: 'none',
          border: 'none',
          color: THEME.textMuted,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginBottom: '24px',
          padding: 0,
          fontSize: '14px',
        }}
      >
        ← Back to markets
      </button>

      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <span style={{
            fontSize: '12px',
            padding: '4px 10px',
            background: THEME.bgCard,
            borderRadius: '6px',
            color: THEME.textMuted,
            border: `1px solid ${THEME.border}`,
          }}>
            {category?.icon} {category?.name}
          </span>
          {market.hot && (
            <span style={{
              fontSize: '12px',
              padding: '4px 10px',
              background: 'rgba(248, 81, 73, 0.2)',
              borderRadius: '6px',
              color: THEME.red,
            }}>
              🔥 Hot
            </span>
          )}
        </div>
        <h1 style={{
          fontSize: '24px',
          fontWeight: 700,
          color: THEME.text,
          lineHeight: 1.3,
          margin: 0,
        }}>
          {market.title}
        </h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px' }}>
        {/* Main content */}
        <div>
          {/* Large price display */}
          <div style={{
            background: THEME.bgCard,
            borderRadius: '12px',
            border: `1px solid ${THEME.border}`,
            padding: '24px',
            marginBottom: '24px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '36px', fontWeight: 700, color: THEME.green }}>{market.yesPrice}%</div>
                <div style={{ color: THEME.textMuted, fontSize: '14px' }}>Yes</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '36px', fontWeight: 700, color: THEME.red }}>{100 - market.yesPrice}%</div>
                <div style={{ color: THEME.textMuted, fontSize: '14px' }}>No</div>
              </div>
            </div>
            <PriceBar yesPrice={market.yesPrice} />
          </div>

          {/* Description */}
          <div style={{
            background: THEME.bgCard,
            borderRadius: '12px',
            border: `1px solid ${THEME.border}`,
            padding: '24px',
            marginBottom: '24px',
          }}>
            <h3 style={{ color: THEME.text, margin: '0 0 12px 0', fontSize: '16px' }}>Description</h3>
            <p style={{ color: THEME.textMuted, lineHeight: 1.6, margin: 0 }}>
              {market.description}
            </p>
          </div>

          {/* Stats */}
          <div style={{
            background: THEME.bgCard,
            borderRadius: '12px',
            border: `1px solid ${THEME.border}`,
            padding: '24px',
          }}>
            <h3 style={{ color: THEME.text, margin: '0 0 16px 0', fontSize: '16px' }}>Market Stats</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              <div>
                <div style={{ color: THEME.textMuted, fontSize: '12px', marginBottom: '4px' }}>Volume</div>
                <div style={{ color: THEME.accent, fontWeight: 600, fontFamily: 'monospace' }}>
                  🌽 {market.volume.toLocaleString()}
                </div>
              </div>
              <div>
                <div style={{ color: THEME.textMuted, fontSize: '12px', marginBottom: '4px' }}>Traders</div>
                <div style={{ color: THEME.text, fontWeight: 600 }}>{market.traders}</div>
              </div>
              <div>
                <div style={{ color: THEME.textMuted, fontSize: '12px', marginBottom: '4px' }}>Closes</div>
                <div style={{ color: THEME.text, fontWeight: 600 }}>{market.endDate}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bet panel */}
        <div style={{
          background: THEME.bgCard,
          borderRadius: '12px',
          border: `1px solid ${THEME.border}`,
          padding: '24px',
          height: 'fit-content',
          position: 'sticky',
          top: '24px',
        }}>
          <h3 style={{ color: THEME.text, margin: '0 0 16px 0', fontSize: '16px' }}>Place Bet</h3>

          {/* Side selection */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <button
              onClick={() => setBetSide('yes')}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '8px',
                border: `2px solid ${betSide === 'yes' ? THEME.green : THEME.border}`,
                background: betSide === 'yes' ? THEME.greenBg : 'transparent',
                color: betSide === 'yes' ? THEME.green : THEME.textMuted,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              Yes {market.yesPrice}¢
            </button>
            <button
              onClick={() => setBetSide('no')}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '8px',
                border: `2px solid ${betSide === 'no' ? THEME.red : THEME.border}`,
                background: betSide === 'no' ? THEME.redBg : 'transparent',
                color: betSide === 'no' ? THEME.red : THEME.textMuted,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              No {100 - market.yesPrice}¢
            </button>
          </div>

          {/* Amount input */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', color: THEME.textMuted, fontSize: '12px', marginBottom: '6px' }}>
              Amount (Kernels)
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="number"
                value={betAmount}
                onChange={e => setBetAmount(Math.max(1, parseInt(e.target.value) || 0))}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '8px',
                  border: `1px solid ${THEME.border}`,
                  background: THEME.bg,
                  color: THEME.text,
                  fontSize: '16px',
                  fontFamily: 'monospace',
                }}
              />
              <button
                onClick={() => setBetAmount(USER_BALANCE)}
                style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: `1px solid ${THEME.border}`,
                  background: THEME.bgHover,
                  color: THEME.textMuted,
                  cursor: 'pointer',
                  fontSize: '12px',
                }}
              >
                Max
              </button>
            </div>
          </div>

          {/* Quick amounts */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
            {[10, 50, 100, 500].map(amt => (
              <button
                key={amt}
                onClick={() => setBetAmount(amt)}
                style={{
                  flex: 1,
                  padding: '8px',
                  borderRadius: '6px',
                  border: `1px solid ${THEME.border}`,
                  background: betAmount === amt ? THEME.bgHover : 'transparent',
                  color: THEME.textMuted,
                  cursor: 'pointer',
                  fontSize: '12px',
                }}
              >
                {amt}
              </button>
            ))}
          </div>

          {/* Potential win */}
          <div style={{
            padding: '12px',
            borderRadius: '8px',
            background: THEME.bg,
            marginBottom: '16px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: THEME.textMuted, fontSize: '13px' }}>Potential profit</span>
              <span style={{ color: THEME.green, fontWeight: 600, fontFamily: 'monospace' }}>
                +🌽 {potentialWin.toLocaleString()}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: THEME.textMuted, fontSize: '13px' }}>Payout if {betSide}</span>
              <span style={{ color: THEME.text, fontWeight: 600, fontFamily: 'monospace' }}>
                🌽 {(betAmount + potentialWin).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Submit button */}
          <button
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '8px',
              border: 'none',
              background: betSide === 'yes' ? THEME.green : THEME.red,
              color: '#fff',
              fontWeight: 600,
              fontSize: '16px',
              cursor: 'pointer',
              transition: 'filter 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.1)'}
            onMouseLeave={e => e.currentTarget.style.filter = 'brightness(1)'}
          >
            Bet {betAmount.toLocaleString()} 🌽 on {betSide.toUpperCase()}
          </button>

          <p style={{
            color: THEME.textDim,
            fontSize: '11px',
            textAlign: 'center',
            marginTop: '12px',
            lineHeight: 1.4,
          }}>
            Kernels have no real value. This is for entertainment only.
            Derek has lost 4,700 Kernels betting on quantum coffee validation.
          </p>
        </div>
      </div>
    </div>
  )
}

function CategoryFilter({
  selected,
  onSelect
}: {
  selected: MarketCategory | null
  onSelect: (category: MarketCategory | null) => void
}) {
  return (
    <div style={{
      display: 'flex',
      gap: '8px',
      flexWrap: 'wrap',
      marginBottom: '24px',
    }}>
      <button
        onClick={() => onSelect(null)}
        style={{
          padding: '8px 16px',
          borderRadius: '20px',
          border: `1px solid ${selected === null ? THEME.accent : THEME.border}`,
          background: selected === null ? 'rgba(240, 180, 41, 0.15)' : 'transparent',
          color: selected === null ? THEME.accent : THEME.textMuted,
          cursor: 'pointer',
          fontSize: '13px',
          fontWeight: 500,
          transition: 'all 0.15s',
        }}
      >
        All Markets
      </button>
      {CATEGORIES.map(cat => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          style={{
            padding: '8px 16px',
            borderRadius: '20px',
            border: `1px solid ${selected === cat.id ? THEME.accent : THEME.border}`,
            background: selected === cat.id ? 'rgba(240, 180, 41, 0.15)' : 'transparent',
            color: selected === cat.id ? THEME.accent : THEME.textMuted,
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 500,
            transition: 'all 0.15s',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span>{cat.icon}</span>
          {cat.name}
        </button>
      ))}
    </div>
  )
}

// ============================================================================
// Main Component
// ============================================================================

export function StalksSite({ path, onPathChange, onNavigateToUrl }: SiteComponentProps) {
  const { content: dbContent } = useSiteContent('stalks')
  const markets = useMemo(() => {
    if (dbContent.length > 0) return dbContent.map(dbToMarket)
    return MARKETS
  }, [dbContent])

  const [selectedCategory, setSelectedCategory] = useState<MarketCategory | null>(null)
  const [balance] = useState(USER_BALANCE)

  // Parse path
  const parsedPath = useMemo(() => {
    if (!path || path === '/') {
      return { view: 'home' as const, slug: null }
    }
    if (path.startsWith('/market/')) {
      const slug = path.slice('/market/'.length)
      return { view: 'market' as const, slug }
    }
    return { view: 'home' as const, slug: null }
  }, [path])

  const selectedMarket = useMemo(() => {
    if (parsedPath.view === 'market' && parsedPath.slug) {
      return markets.find(m => m.slug === parsedPath.slug) || null
    }
    return null
  }, [parsedPath, markets])

  const filteredMarkets = useMemo(() => {
    if (!selectedCategory) return markets
    return markets.filter(m => m.category === selectedCategory)
  }, [selectedCategory, markets])

  const featuredMarkets = useMemo(() => {
    return markets.filter(m => m.featured)
  }, [markets])

  const handleMarketClick = useCallback((market: Market) => {
    onPathChange(`/market/${market.slug}`)
  }, [onPathChange])

  const handleBack = useCallback(() => {
    onPathChange('/')
  }, [onPathChange])

  // Market detail view
  if (parsedPath.view === 'market' && selectedMarket) {
    return (
      <div style={{
        position: 'absolute',
        inset: 0,
        background: THEME.bg,
        color: THEME.text,
        overflow: 'auto',
      }}>
        <MarketDetail market={selectedMarket} onBack={handleBack} />
      </div>
    )
  }

  // Home view
  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      background: THEME.bg,
      color: THEME.text,
      overflow: 'auto',
    }}>
      {/* Header */}
      <header style={{
        borderBottom: `1px solid ${THEME.border}`,
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        background: THEME.bg,
        zIndex: 10,
      }}>
        <Logo />
        <KernelBalance balance={balance} />
      </header>

      {/* Main content */}
      <main style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Hero */}
        <div style={{
          background: `linear-gradient(135deg, ${THEME.bgCard} 0%, ${THEME.bg} 100%)`,
          borderRadius: '16px',
          border: `1px solid ${THEME.border}`,
          padding: '32px',
          marginBottom: '32px',
          textAlign: 'center',
        }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 700,
            marginBottom: '12px',
            background: `linear-gradient(90deg, ${THEME.accent}, ${THEME.green})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Bet on .corn Drama
          </h1>
          <p style={{ color: THEME.textMuted, fontSize: '16px', maxWidth: '600px', margin: '0 auto 20px' }}>
            Put your worthless Kernels where your mouth is. Predict the outcomes of local controversies,
            celebrity drama, and whether Floor 13 actually exists.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', fontSize: '14px' }}>
            <span style={{ color: THEME.textMuted }}>📊 {markets.length} markets</span>
            <span style={{ color: THEME.textMuted }}>🌽 {(markets.reduce((sum, m) => sum + m.volume, 0) / 1000000).toFixed(1)}M volume</span>
            <span style={{ color: THEME.textMuted }}>👥 {markets.reduce((sum, m) => sum + m.traders, 0).toLocaleString()} traders</span>
          </div>
        </div>

        {/* Featured markets */}
        <section style={{ marginBottom: '40px' }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: 600,
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <span>⭐</span> Featured Markets
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '16px',
          }}>
            {featuredMarkets.map(market => (
              <MarketCard
                key={market.slug}
                market={market}
                onClick={() => handleMarketClick(market)}
              />
            ))}
          </div>
        </section>

        {/* All markets */}
        <section>
          <h2 style={{
            fontSize: '18px',
            fontWeight: 600,
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <span>📈</span> All Markets
          </h2>

          <CategoryFilter selected={selectedCategory} onSelect={setSelectedCategory} />

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '16px',
          }}>
            {filteredMarkets.map(market => (
              <MarketCard
                key={market.slug}
                market={market}
                onClick={() => handleMarketClick(market)}
              />
            ))}
          </div>

          {filteredMarkets.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '48px',
              color: THEME.textMuted,
            }}>
              No markets in this category yet. Check back soon!
            </div>
          )}
        </section>

        {/* Footer */}
        <footer style={{
          marginTop: '48px',
          paddingTop: '24px',
          borderTop: `1px solid ${THEME.border}`,
          textAlign: 'center',
          color: THEME.textDim,
          fontSize: '12px',
        }}>
          <p style={{ marginBottom: '8px' }}>
            Stalks is a prediction market for entertainment purposes only.
          </p>
          <p style={{ marginBottom: '8px' }}>
            Kernels (🌽) have no monetary value. Derek lost 4,700 of them. Don't be like Derek.
          </p>
          <p>
            © 2024 Stalks • A subsidiary of Omnicorp Holdings (probably)
          </p>
        </footer>
      </main>
    </div>
  )
}

export default StalksSite
