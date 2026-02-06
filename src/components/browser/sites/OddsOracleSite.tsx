/**
 * OddsOracle Site
 *
 * Prediction market / betting site parody for the engAIge browser.
 * Features absurd bets, fake odds, and questionable predictions.
 */

import { useState, useMemo } from 'react'
import type { SiteProps } from '../BrowserSiteContainer.js'
import { FILLER_SITES } from '../../../config/filler-sites.js'
import { SidebarAdWidget } from '../ads/index.js'
import { useSiteContent, type SiteContentItem } from '../../../hooks/useSiteContent.js'

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

// Hardcoded SAMPLE_MARKETS removed -- DB is the sole source of truth

// ============================================================================
// Components
// ============================================================================

/**
 * Adapter: maps SiteContentItem to local Market interface.
 * Expects metadata to carry market-specific fields (yesPrice, volume, endDate, comments, etc.)
 */
function dbToMarket(item: SiteContentItem): Market {
  return {
    id: item.slug,
    question: item.title,
    category: item.category ?? item.metadata?.category ?? 'Uncategorized',
    yesPrice: item.metadata?.yesPrice ?? 50,
    volume: item.metadata?.volume ?? '$0',
    endDate: item.metadata?.endDate ?? 'TBD',
    description: item.body ?? item.summary ?? '',
    icon: item.thumbnailEmoji ?? '📊',
    trending: item.metadata?.trending ?? false,
    hot: item.metadata?.hot ?? item.isFeatured ?? false,
    resolved: item.metadata?.resolved,
    comments: (item.metadata?.comments ?? []).map((c: any, i: number) => ({
      id: c.id ?? `c_${i}`,
      author: c.author ?? 'Anonymous',
      position: c.position ?? 'none',
      content: c.content ?? '',
      timestamp: c.timestamp ?? 'Unknown',
      likes: c.likes ?? 0,
    })),
  }
}

export function OddsOracleSite({ siteId, onNavigate }: SiteProps) {
  // Fetch from DB -- no fallback, DB is the sole source of truth
  const { content: dbContent } = useSiteContent('oddsoracle')

  const markets = useMemo(() => dbContent.map(dbToMarket), [dbContent])

  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [balance] = useState(1000) // Fake balance
  const [showResolved, setShowResolved] = useState(false)

  const filteredMarkets = markets.filter((market) => {
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
              {markets.filter(m => m.hot || m.trending).slice(0, 4).map((market) => (
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

          {/* Sponsored */}
          <div className="mt-6">
            <SidebarAdWidget
              siteId="oddsoracle"
              onNavigate={onNavigate}
              title="Sponsored"
              count={2}
            />
          </div>
        </aside>
      </div>
    </div>
  )
}

export default OddsOracleSite
