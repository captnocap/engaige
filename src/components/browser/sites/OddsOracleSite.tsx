/**
 * OddsOracle Site
 *
 * Prediction market / betting site parody for the engAIge browser.
 * Features absurd bets, fake odds, and questionable predictions.
 */

import { useState } from 'react'
import type { SiteProps } from '../BrowserSiteContainer.js'
import { FILLER_SITES } from '../../../config/filler-sites.js'

const site = FILLER_SITES.betting

// ============================================================================
// Types
// ============================================================================

interface Market {
  id: string
  question: string
  category: string
  yesPrice: number // 0-100 (cents, represents % chance)
  volume: string
  endDate: string
  description: string
  icon: string
  trending?: boolean
  hot?: boolean
  resolved?: 'yes' | 'no'
  comments: MarketComment[]
}

interface MarketComment {
  id: string
  author: string
  position: 'yes' | 'no' | 'none'
  content: string
  timestamp: string
  likes: number
}

// ============================================================================
// Sample Data
// ============================================================================

const CATEGORIES = [
  'All',
  'Local Events',
  'Entertainment',
  'Science',
  'Politics',
  'Sports',
  'Crypto',
  'Memes',
]

const SAMPLE_MARKETS: Market[] = [
  {
    id: 'mkt_1',
    question: 'Will Trust Fall Tim be caught before end of year?',
    category: 'Local Events',
    yesPrice: 12,
    volume: '$47.2K',
    endDate: 'Dec 31, 2024',
    description: `This market resolves YES if Trust Fall Tim (the guy who attempts trust falls at local venues) is successfully caught by the crowd at least once before December 31st, 2024.

Resolution criteria:
- Must be caught by at least 2 people
- Must be at a public venue
- Video evidence required
- Tim must confirm it counts

Current streak: 47 consecutive failures.`,
    icon: '🤸',
    trending: true,
    comments: [
      {
        id: 'c1',
        author: 'VenueRegular',
        position: 'no',
        content: 'I\'ve been going to The Underground for 2 years. Nobody is EVER going to catch this man. Free money on NO.',
        timestamp: '2 hours ago',
        likes: 45,
      },
      {
        id: 'c2',
        author: 'OptimistOllie',
        position: 'yes',
        content: 'Someone on Threadit is organizing a flash mob to catch him. This could be the one!',
        timestamp: '5 hours ago',
        likes: 23,
      },
      {
        id: 'c3',
        author: 'MarsTheOwner',
        position: 'none',
        content: 'As the owner of The Underground, I can confirm we have no plans to help him. But also please stop betting on things that happen at my venue.',
        timestamp: '1 day ago',
        likes: 189,
      },
    ],
  },
  {
    id: 'mkt_2',
    question: 'Will quantum coffee be proven "real" by a major university study?',
    category: 'Science',
    yesPrice: 34,
    volume: '$892.1K',
    endDate: 'Jun 30, 2025',
    description: `Resolves YES if a peer-reviewed study from a top 50 university confirms that quantum coffee brewing produces measurably different results from traditional brewing methods.

The Martinez Study (2021) showed preliminary results but has not been fully replicated. Several attempts are ongoing.

Note: "Different" must be statistically significant (p < 0.05). Taste tests alone do not count - must be measurable at molecular level.`,
    icon: '☕',
    hot: true,
    comments: [
      {
        id: 'c4',
        author: 'PhysicsPhD',
        position: 'yes',
        content: 'MIT is running a study right now. Preliminary results look promising. I\'m all in on YES.',
        timestamp: '3 hours ago',
        likes: 67,
      },
      {
        id: 'c5',
        author: 'SkepticalSally',
        position: 'no',
        content: 'This is literally just expensive placebo. Universities are wasting grant money. Easy NO.',
        timestamp: '6 hours ago',
        likes: 34,
      },
      {
        id: 'c6',
        author: 'QuantumBaristaGirl',
        position: 'yes',
        content: 'I work at a quantum cafe. The difference is REAL. You can literally taste it. Science will catch up.',
        timestamp: '1 day ago',
        likes: 156,
      },
    ],
  },
  {
    id: 'mkt_3',
    question: 'Will The Velvet Algorithms release new music in Q1 2025?',
    category: 'Entertainment',
    yesPrice: 67,
    volume: '$23.4K',
    endDate: 'Mar 31, 2025',
    description: `Resolves YES if The Velvet Algorithms release at least one new song (single, EP, or album) between January 1 and March 31, 2025.

The band has been on hiatus since their "existential crisis" incident in November. However, they were recently spotted at a recording studio.

Note: Remixes and live recordings do not count. Must be new original material.`,
    icon: '🎹',
    comments: [
      {
        id: 'c7',
        author: 'AlgorithmFan1',
        position: 'yes',
        content: 'They\'re definitely working on something. I saw them at Quantum Cafe last week and they looked inspired.',
        timestamp: '4 hours ago',
        likes: 28,
      },
      {
        id: 'c8',
        author: 'MusicIndustryInsider',
        position: 'yes',
        content: 'I have it on good authority they\'ve booked studio time for January. Take this info as you will.',
        timestamp: '2 days ago',
        likes: 89,
      },
    ],
  },
  {
    id: 'mkt_4',
    question: 'Will the Hartwell Building site remain undeveloped through 2025?',
    category: 'Local Events',
    yesPrice: 78,
    volume: '$156.7K',
    endDate: 'Dec 31, 2025',
    description: `Resolves YES if the former Hartwell Building site (100 Hartwell Plaza) remains an empty lot with no construction beginning through December 31, 2025.

A parking garage was announced but permits have been delayed repeatedly. Some say the site is "cursed." The city says it's just bureaucracy.

Construction beginning = any groundbreaking or foundation work starting.`,
    icon: '🏢',
    trending: true,
    comments: [
      {
        id: 'c9',
        author: 'LocalResident2018',
        position: 'yes',
        content: 'Nothing will ever be built there. The contractors know. Easy YES.',
        timestamp: '1 day ago',
        likes: 234,
      },
      {
        id: 'c10',
        author: 'RealEstateDev',
        position: 'no',
        content: 'I\'ve seen the permits moving through city hall. They\'re serious this time. NO is undervalued.',
        timestamp: '3 days ago',
        likes: 45,
      },
    ],
  },
  {
    id: 'mkt_5',
    question: 'Will QUANTUMIL receive FDA approval?',
    category: 'Science',
    yesPrice: 8,
    volume: '$12.3K',
    endDate: 'Dec 31, 2025',
    description: `Resolves YES if QUANTUMIL (the medication for "Quantum Coffee Intolerance Syndrome") receives FDA approval for any indication by end of 2025.

VitalityRx has submitted preliminary applications but the FDA has not commented publicly.

Note: This is about a real (fictional) pharmaceutical company. Do your own research.`,
    icon: '💊',
    comments: [
      {
        id: 'c11',
        author: 'PharmaWatcher',
        position: 'no',
        content: 'The FDA doesn\'t approve medications for conditions that aren\'t real. This is never happening.',
        timestamp: '1 week ago',
        likes: 89,
      },
      {
        id: 'c12',
        author: 'QuantumBeliever',
        position: 'yes',
        content: 'QCIS is REAL and people SUFFER. The FDA will recognize this eventually!',
        timestamp: '5 days ago',
        likes: 12,
      },
    ],
  },
  {
    id: 'mkt_6',
    question: 'City council meme ban: Will it pass before 2026?',
    category: 'Politics',
    yesPrice: 3,
    volume: '$8.9K',
    endDate: 'Dec 31, 2025',
    description: `Resolves YES if the city council passes any form of "meme regulation" legislation before 2026.

Councilman Henderson proposed a ban on "disruptive digital imagery" following the Great Meme War of 2019. The proposal has been tabled multiple times.

Any regulation counts - doesn't have to be a full ban.`,
    icon: '🏛️',
    comments: [
      {
        id: 'c13',
        author: 'MemeWarVeteran',
        position: 'no',
        content: 'They\'ve been trying to pass this for 5 years. The internet always wins. NO is free money.',
        timestamp: '2 days ago',
        likes: 156,
      },
    ],
  },
  {
    id: 'mkt_7',
    question: 'Will Neon Requiem outsell Velvet Algorithms in 2025?',
    category: 'Entertainment',
    yesPrice: 41,
    volume: '$34.2K',
    endDate: 'Dec 31, 2025',
    description: `Resolves YES if Neon Requiem has more total streaming plays than The Velvet Algorithms in calendar year 2025 across major platforms (Spotify, Apple Music, YouTube Music).

Currently VA leads but NR has been gaining momentum since the existential crisis incident.`,
    icon: '🎸',
    comments: [
      {
        id: 'c14',
        author: 'NeonRequiemFan',
        position: 'yes',
        content: 'NR has been grinding while VA was having breakdowns. Their time is NOW.',
        timestamp: '1 day ago',
        likes: 67,
      },
      {
        id: 'c15',
        author: 'AlgorithmFan1',
        position: 'no',
        content: 'VA has way more dedicated fans. One good release and they\'ll crush the competition.',
        timestamp: '1 day ago',
        likes: 45,
      },
    ],
  },
  {
    id: 'mkt_8',
    question: 'Will The Underground close permanently in 2025?',
    category: 'Local Events',
    yesPrice: 15,
    volume: '$67.8K',
    endDate: 'Dec 31, 2025',
    description: `Resolves YES if The Underground music venue permanently closes its doors in 2025.

Mars (the owner) has mentioned financial struggles but the venue has survived for 15 years. Recent shows have been well-attended.

Temporary closures for renovation do not count.`,
    icon: '🎸',
    comments: [
      {
        id: 'c16',
        author: 'MarsTheOwner',
        position: 'no',
        content: 'We\'re not going anywhere. Stop betting on my venue\'s death. Buy a drink instead.',
        timestamp: '3 hours ago',
        likes: 456,
      },
      {
        id: 'c17',
        author: 'UndergroundRegular',
        position: 'no',
        content: 'This venue has survived worse. Remember 2020? They\'ll be fine.',
        timestamp: '1 day ago',
        likes: 78,
      },
    ],
  },
  {
    id: 'mkt_9',
    question: 'Will anyone solve the Hartwell Building mystery on VidTube?',
    category: 'Entertainment',
    yesPrice: 22,
    volume: '$18.9K',
    endDate: 'Jun 30, 2025',
    description: `Resolves YES if a VidTube video definitively explains what happened at the Hartwell Building in 2018, with evidence that is widely accepted as credible.

"Widely accepted" = more than 70% positive reception and no successful debunking.

Midnight Mystery Files has been investigating but no conclusive evidence yet.`,
    icon: '🔍',
    comments: [
      {
        id: 'c18',
        author: 'MidnightMysteryFan',
        position: 'yes',
        content: 'MMF is getting close. Their last video had some really compelling evidence.',
        timestamp: '4 days ago',
        likes: 34,
      },
      {
        id: 'c19',
        author: 'SkepticalDebunker',
        position: 'no',
        content: 'There\'s nothing to solve. It was a gas leak. This will never resolve YES.',
        timestamp: '1 week ago',
        likes: 23,
      },
    ],
  },
  {
    id: 'mkt_10',
    question: 'Will "quantum" be added to the dictionary with coffee-related definition?',
    category: 'Memes',
    yesPrice: 5,
    volume: '$3.2K',
    endDate: 'Dec 31, 2025',
    description: `Resolves YES if any major English dictionary (Merriam-Webster, Oxford, Cambridge) adds a new definition of "quantum" specifically related to coffee brewing by end of 2025.

This would legitimize quantum coffee as a recognized phenomenon rather than just a marketing term.`,
    icon: '📚',
    hot: true,
    comments: [
      {
        id: 'c20',
        author: 'LinguistLarry',
        position: 'no',
        content: 'Dictionaries don\'t work this fast. Maybe in 2030. NO is the play.',
        timestamp: '2 weeks ago',
        likes: 67,
      },
    ],
  },
  // Resolved market example
  {
    id: 'mkt_resolved_1',
    question: 'Will Velvet Algorithms cancel their November show?',
    category: 'Entertainment',
    yesPrice: 100,
    volume: '$45.6K',
    endDate: 'Nov 15, 2024',
    description: 'This market has resolved YES. The Velvet Algorithms cancelled their November 15th show due to an "existential crisis."',
    icon: '🎹',
    resolved: 'yes',
    comments: [
      {
        id: 'cr1',
        author: 'WinnerWinner',
        position: 'yes',
        content: 'Called it! Those guys have been on the edge for months. Easy money.',
        timestamp: '1 month ago',
        likes: 234,
      },
    ],
  },
]

// ============================================================================
// Components
// ============================================================================

export function OddsOracleSite({ siteId }: SiteProps) {
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [balance] = useState(1000) // Fake balance
  const [showResolved, setShowResolved] = useState(false)

  const filteredMarkets = SAMPLE_MARKETS.filter((market) => {
    if (!showResolved && market.resolved) return false
    if (selectedCategory !== 'All' && market.category !== selectedCategory) return false
    return true
  })

  return (
    <div className="min-h-full" style={{ background: site.theme.background }}>
      {/* Header */}
      <header
        className="sticky top-0 z-10 px-6 py-3"
        style={{ background: site.theme.surface, borderBottom: `1px solid ${site.theme.border}` }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            onClick={() => setSelectedMarket(null)}
            className="flex items-center gap-2 hover:opacity-80"
          >
            <span className="text-2xl">{site.icon}</span>
            <span
              className="text-xl font-bold"
              style={{ color: site.theme.primary }}
            >
              {site.name}
            </span>
          </button>

          <div className="flex items-center gap-6">
            <input
              type="text"
              placeholder="Search markets..."
              className="px-4 py-2 rounded-lg text-sm w-64"
              style={{
                background: site.theme.background,
                border: `1px solid ${site.theme.border}`,
                color: site.theme.text,
              }}
            />
            <div
              className="px-4 py-2 rounded-lg flex items-center gap-2"
              style={{ background: site.theme.secondary, color: 'white' }}
            >
              <span>💰</span>
              <span className="font-bold">${balance.toLocaleString()}</span>
            </div>
            <button
              className="px-4 py-2 rounded-lg font-medium"
              style={{ background: site.theme.primary, color: 'white' }}
            >
              Deposit
            </button>
          </div>
        </div>
      </header>

      {selectedMarket ? (
        <MarketDetail
          market={selectedMarket}
          onBack={() => setSelectedMarket(null)}
        />
      ) : (
        <div className="max-w-6xl mx-auto px-6 py-6">
          {/* Categories */}
          <div className="flex items-center gap-4 mb-6 overflow-x-auto pb-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors"
                style={{
                  background: selectedCategory === cat ? site.theme.primary : site.theme.surface,
                  color: selectedCategory === cat ? 'white' : site.theme.text,
                  border: `1px solid ${selectedCategory === cat ? site.theme.primary : site.theme.border}`,
                }}
              >
                {cat}
              </button>
            ))}
            <label className="flex items-center gap-2 text-sm ml-auto" style={{ color: site.theme.textMuted }}>
              <input
                type="checkbox"
                checked={showResolved}
                onChange={(e) => setShowResolved(e.target.checked)}
              />
              Show resolved
            </label>
          </div>

          {/* Trending Banner */}
          <div
            className="p-4 rounded-xl mb-6"
            style={{ background: `linear-gradient(135deg, ${site.theme.primary}20, ${site.theme.secondary}20)` }}
          >
            <h2 className="font-bold mb-3 flex items-center gap-2" style={{ color: site.theme.text }}>
              🔥 Hot Markets
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {SAMPLE_MARKETS.filter(m => m.hot || m.trending).slice(0, 4).map((market) => (
                <button
                  key={market.id}
                  onClick={() => setSelectedMarket(market)}
                  className="flex-shrink-0 p-3 rounded-lg text-left w-64"
                  style={{ background: site.theme.surface }}
                >
                  <p className="text-sm font-medium line-clamp-2 mb-2" style={{ color: site.theme.text }}>
                    {market.icon} {market.question}
                  </p>
                  <div className="flex items-center justify-between">
                    <span
                      className="text-lg font-bold"
                      style={{ color: market.yesPrice > 50 ? site.theme.yes : site.theme.no }}
                    >
                      {market.yesPrice}¢ YES
                    </span>
                    <span className="text-xs" style={{ color: site.theme.textMuted }}>
                      {market.volume}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Markets Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMarkets.map((market) => (
              <MarketCard
                key={market.id}
                market={market}
                onClick={() => setSelectedMarket(market)}
              />
            ))}
          </div>

          {filteredMarkets.length === 0 && (
            <div className="text-center py-12">
              <p className="text-4xl mb-4">📊</p>
              <p style={{ color: site.theme.textMuted }}>No markets found</p>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <footer
        className="py-6 px-6 text-center text-xs mt-8"
        style={{
          background: site.theme.surface,
          borderTop: `1px solid ${site.theme.border}`,
          color: site.theme.textMuted,
        }}
      >
        <p className="mb-2">
          OddsOracle is for entertainment purposes only. All markets are fictional.
          Please gamble responsibly (with fake money on fake events).
        </p>
        <p>
          18+ only. Not available in jurisdictions where prediction markets are illegal (which is most of them).
        </p>
      </footer>
    </div>
  )
}

// ============================================================================
// Market Card Component
// ============================================================================

interface MarketCardProps {
  market: Market
  onClick: () => void
}

function MarketCard({ market, onClick }: MarketCardProps) {
  const noPrice = 100 - market.yesPrice

  return (
    <button
      onClick={onClick}
      className="p-4 rounded-xl text-left transition-all hover:shadow-lg"
      style={{
        background: site.theme.surface,
        border: `1px solid ${site.theme.border}`,
        opacity: market.resolved ? 0.7 : 1,
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{market.icon}</span>
          {market.trending && (
            <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ background: site.theme.primary, color: 'white' }}>
              Trending
            </span>
          )}
          {market.hot && (
            <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ background: '#f59e0b', color: 'white' }}>
              🔥 Hot
            </span>
          )}
          {market.resolved && (
            <span
              className="px-2 py-0.5 rounded text-xs font-medium"
              style={{
                background: market.resolved === 'yes' ? site.theme.yes : site.theme.no,
                color: 'white',
              }}
            >
              Resolved {market.resolved.toUpperCase()}
            </span>
          )}
        </div>
        <span className="text-xs" style={{ color: site.theme.textMuted }}>
          {market.category}
        </span>
      </div>

      <h3 className="font-medium mb-3" style={{ color: site.theme.text }}>
        {market.question}
      </h3>

      {/* Price Bar */}
      <div className="mb-3">
        <div className="flex rounded-lg overflow-hidden h-8">
          <div
            className="flex items-center justify-center text-sm font-bold text-white transition-all"
            style={{
              background: site.theme.yes,
              width: `${market.yesPrice}%`,
              minWidth: market.yesPrice > 0 ? '40px' : '0',
            }}
          >
            {market.yesPrice > 15 && `${market.yesPrice}¢`}
          </div>
          <div
            className="flex items-center justify-center text-sm font-bold text-white transition-all"
            style={{
              background: site.theme.no,
              width: `${noPrice}%`,
              minWidth: noPrice > 0 ? '40px' : '0',
            }}
          >
            {noPrice > 15 && `${noPrice}¢`}
          </div>
        </div>
        <div className="flex justify-between text-xs mt-1" style={{ color: site.theme.textMuted }}>
          <span>YES {market.yesPrice}¢</span>
          <span>NO {noPrice}¢</span>
        </div>
      </div>

      {/* Meta */}
      <div className="flex items-center justify-between text-xs" style={{ color: site.theme.textMuted }}>
        <span>Vol: {market.volume}</span>
        <span>Ends: {market.endDate}</span>
      </div>
    </button>
  )
}

// ============================================================================
// Market Detail Component
// ============================================================================

interface MarketDetailProps {
  market: Market
  onBack: () => void
}

function MarketDetail({ market, onBack }: MarketDetailProps) {
  const [betAmount, setBetAmount] = useState(10)
  const [betSide, setBetSide] = useState<'yes' | 'no'>('yes')
  const noPrice = 100 - market.yesPrice

  const potentialWin = betSide === 'yes'
    ? ((100 / market.yesPrice) * betAmount).toFixed(2)
    : ((100 / noPrice) * betAmount).toFixed(2)

  return (
    <div className="max-w-4xl mx-auto px-6 py-6">
      <button
        onClick={onBack}
        className="mb-6 text-sm hover:underline"
        style={{ color: site.theme.primary }}
      >
        ← Back to markets
      </button>

      <div className="flex gap-8">
        {/* Main Content */}
        <div className="flex-1">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">{market.icon}</span>
              {market.resolved && (
                <span
                  className="px-3 py-1 rounded-full text-sm font-bold"
                  style={{
                    background: market.resolved === 'yes' ? site.theme.yes : site.theme.no,
                    color: 'white',
                  }}
                >
                  RESOLVED {market.resolved.toUpperCase()}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold mb-2" style={{ color: site.theme.text }}>
              {market.question}
            </h1>
            <div className="flex items-center gap-4 text-sm" style={{ color: site.theme.textMuted }}>
              <span>{market.category}</span>
              <span>•</span>
              <span>Volume: {market.volume}</span>
              <span>•</span>
              <span>Ends: {market.endDate}</span>
            </div>
          </div>

          {/* Price Display */}
          <div
            className="p-6 rounded-xl mb-6"
            style={{ background: site.theme.surface, border: `1px solid ${site.theme.border}` }}
          >
            <div className="flex gap-8 mb-4">
              <div className="flex-1 text-center">
                <p className="text-4xl font-bold mb-1" style={{ color: site.theme.yes }}>
                  {market.yesPrice}¢
                </p>
                <p className="text-sm" style={{ color: site.theme.textMuted }}>YES</p>
              </div>
              <div className="flex-1 text-center">
                <p className="text-4xl font-bold mb-1" style={{ color: site.theme.no }}>
                  {noPrice}¢
                </p>
                <p className="text-sm" style={{ color: site.theme.textMuted }}>NO</p>
              </div>
            </div>

            {/* Price Bar */}
            <div className="flex rounded-lg overflow-hidden h-4">
              <div
                className="transition-all"
                style={{ background: site.theme.yes, width: `${market.yesPrice}%` }}
              />
              <div
                className="transition-all"
                style={{ background: site.theme.no, width: `${noPrice}%` }}
              />
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h2 className="font-bold mb-3" style={{ color: site.theme.text }}>
              Resolution Criteria
            </h2>
            <p
              className="text-sm whitespace-pre-wrap"
              style={{ color: site.theme.text }}
            >
              {market.description}
            </p>
          </div>

          {/* Comments */}
          <div>
            <h2 className="font-bold mb-4" style={{ color: site.theme.text }}>
              Discussion ({market.comments.length})
            </h2>
            <div className="space-y-4">
              {market.comments.map((comment) => (
                <div
                  key={comment.id}
                  className="p-4 rounded-lg"
                  style={{ background: site.theme.surface, border: `1px solid ${site.theme.border}` }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium" style={{ color: site.theme.text }}>
                      {comment.author}
                    </span>
                    {comment.position !== 'none' && (
                      <span
                        className="px-2 py-0.5 rounded text-xs font-medium"
                        style={{
                          background: comment.position === 'yes' ? `${site.theme.yes}20` : `${site.theme.no}20`,
                          color: comment.position === 'yes' ? site.theme.yes : site.theme.no,
                        }}
                      >
                        Holds {comment.position.toUpperCase()}
                      </span>
                    )}
                    <span className="text-xs" style={{ color: site.theme.textMuted }}>
                      {comment.timestamp}
                    </span>
                  </div>
                  <p className="text-sm mb-2" style={{ color: site.theme.text }}>
                    {comment.content}
                  </p>
                  <button className="text-xs flex items-center gap-1" style={{ color: site.theme.textMuted }}>
                    👍 {comment.likes}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Trade Panel */}
        <aside className="w-80 shrink-0">
          <div
            className="sticky top-20 p-6 rounded-xl"
            style={{ background: site.theme.surface, border: `1px solid ${site.theme.border}` }}
          >
            {market.resolved ? (
              <div className="text-center">
                <p className="text-lg font-bold mb-2" style={{ color: site.theme.text }}>
                  Market Resolved
                </p>
                <p
                  className="text-3xl font-bold"
                  style={{ color: market.resolved === 'yes' ? site.theme.yes : site.theme.no }}
                >
                  {market.resolved.toUpperCase()}
                </p>
              </div>
            ) : (
              <>
                <h3 className="font-bold mb-4" style={{ color: site.theme.text }}>
                  Place a Bet
                </h3>

                {/* Side Selection */}
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => setBetSide('yes')}
                    className="flex-1 py-3 rounded-lg font-bold transition-all"
                    style={{
                      background: betSide === 'yes' ? site.theme.yes : site.theme.background,
                      color: betSide === 'yes' ? 'white' : site.theme.text,
                      border: `2px solid ${betSide === 'yes' ? site.theme.yes : site.theme.border}`,
                    }}
                  >
                    YES {market.yesPrice}¢
                  </button>
                  <button
                    onClick={() => setBetSide('no')}
                    className="flex-1 py-3 rounded-lg font-bold transition-all"
                    style={{
                      background: betSide === 'no' ? site.theme.no : site.theme.background,
                      color: betSide === 'no' ? 'white' : site.theme.text,
                      border: `2px solid ${betSide === 'no' ? site.theme.no : site.theme.border}`,
                    }}
                  >
                    NO {noPrice}¢
                  </button>
                </div>

                {/* Amount */}
                <div className="mb-4">
                  <label className="text-sm mb-2 block" style={{ color: site.theme.textMuted }}>
                    Amount
                  </label>
                  <div className="flex items-center gap-2">
                    <span style={{ color: site.theme.text }}>$</span>
                    <input
                      type="number"
                      value={betAmount}
                      onChange={(e) => setBetAmount(Number(e.target.value))}
                      className="flex-1 px-3 py-2 rounded-lg text-right font-bold"
                      style={{
                        background: site.theme.background,
                        border: `1px solid ${site.theme.border}`,
                        color: site.theme.text,
                      }}
                    />
                  </div>
                  <div className="flex gap-2 mt-2">
                    {[10, 25, 50, 100].map((amount) => (
                      <button
                        key={amount}
                        onClick={() => setBetAmount(amount)}
                        className="flex-1 py-1 rounded text-xs"
                        style={{
                          background: site.theme.background,
                          border: `1px solid ${site.theme.border}`,
                          color: site.theme.text,
                        }}
                      >
                        ${amount}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Potential Win */}
                <div
                  className="p-3 rounded-lg mb-4"
                  style={{ background: site.theme.background }}
                >
                  <div className="flex justify-between text-sm mb-1">
                    <span style={{ color: site.theme.textMuted }}>Potential return</span>
                    <span className="font-bold" style={{ color: site.theme.text }}>
                      ${potentialWin}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: site.theme.textMuted }}>Profit if {betSide}</span>
                    <span
                      className="font-bold"
                      style={{ color: betSide === 'yes' ? site.theme.yes : site.theme.no }}
                    >
                      +${(Number(potentialWin) - betAmount).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Submit */}
                <button
                  className="w-full py-3 rounded-lg font-bold text-white"
                  style={{ background: betSide === 'yes' ? site.theme.yes : site.theme.no }}
                >
                  Buy {betSide.toUpperCase()}
                </button>

                <p className="text-xs text-center mt-3" style={{ color: site.theme.textMuted }}>
                  This is fake money. Relax.
                </p>
              </>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}

export default OddsOracleSite
