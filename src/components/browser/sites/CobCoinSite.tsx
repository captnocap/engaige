/**
 * CobCoin Exchange Site - Cryptocurrency Exchange Parody
 *
 * A corn-based crypto trading platform featuring:
 * - Multiple fake cryptocurrencies (COB, KRNL, SILK, HUSK, TRUST)
 * - Live "price" charts that are obviously random
 * - Portfolio view showing massive losses
 * - "To The Moon" and "HODL" culture references
 * - Rug pull warnings everyone ignores
 * - Derek's quantum coffee budget lost to KRNL
 * - Trust Fall Tim's TRUST token disaster
 * - Hartwell Building 13th floor mining conspiracy
 *
 * Lore Connections:
 * - Derek invested his quantum coffee budget into KRNL (lost 84.7%)
 * - Trust Fall Tim launched TRUST token (crashed immediately)
 * - Omnicorp Holdings rumored to be accumulating HUSK
 * - 847 COB = 1 USD (the magic number)
 */

import { useState, useEffect, useRef, useMemo } from 'react'
import type { SiteProps } from '../BrowserSiteContainer.js'
import { FILLER_SITES } from '../../../config/filler-sites.js'
import { StyledCard, Button, Avatar, MetaRow } from '../../ui/shared/index.js'
import { useSiteContent, type SiteContentItem } from '../../../hooks/useSiteContent.js'

// Site config
const SITE = FILLER_SITES.cobcoin

// Types
interface Cryptocurrency {
  id: string
  symbol: string
  name: string
  price: number
  change24h: number
  change7d: number
  marketCap: string
  volume24h: string
  icon: string
  description: string
  launchDate: string
  isRugPull?: boolean
  rugPullWarning?: string
}

interface PortfolioHolding {
  symbol: string
  amount: number
  avgBuyPrice: number
  currentPrice: number
}

interface NewsItem {
  id: string
  title: string
  source: string
  timestamp: string
  sentiment: 'bullish' | 'bearish' | 'neutral' | 'scam'
  content: string
}

interface Comment {
  id: string
  author: string
  avatar: string
  timestamp: string
  content: string
  upvotes: number
  isDelusional: boolean
}

// Cryptocurrency data - all values are intentionally absurd
// Hardcoded CRYPTOCURRENCIES removed -- DB is the sole source of truth

// Portfolio holdings (showing massive losses)
const PORTFOLIO_HOLDINGS: PortfolioHolding[] = [
  { symbol: 'COB', amount: 84700, avgBuyPrice: 0.0847, currentPrice: 0.00118 },
  { symbol: 'KRNL', amount: 1000000, avgBuyPrice: 0.00028, currentPrice: 0.000047 },
  { symbol: 'SILK', amount: 50000, avgBuyPrice: 0.012, currentPrice: 0.0034 },
  { symbol: 'HUSK', amount: 25000, avgBuyPrice: 0.015, currentPrice: 0.0089 },
  { symbol: 'TRUST', amount: 8470000, avgBuyPrice: 0.001, currentPrice: 0.0000001 },
]

// News feed
// Hardcoded NEWS_ITEMS removed -- DB is the sole source of truth

// Delusional investor comments
// Hardcoded COMMENTS removed -- DB is the sole source of truth

// Trading pairs
const TRADING_PAIRS = [
  { base: 'COB', quote: 'CORN', price: 0.00118, change: -12.4 },
  { base: 'KRNL', quote: 'COB', price: 0.0398, change: -18.2 },
  { base: 'SILK', quote: 'COB', price: 2.88, change: +5.3 },
  { base: 'HUSK', quote: 'CORN', price: 0.0089, change: +3.2 },
  { base: 'TRUST', quote: 'COB', price: 0.000085, change: -99.2 },
  { base: 'POP', quote: 'CORN', price: 0.0023, change: -18.7 },
]

/**
 * Adapter: maps SiteContentItem to local Cryptocurrency interface.
 * Expects metadata to carry crypto-specific fields (symbol, price, change, etc.)
 */
function dbToCryptocurrency(item: SiteContentItem): Cryptocurrency {
  return {
    id: item.slug,
    symbol: item.metadata?.symbol ?? item.slug.toUpperCase(),
    name: item.title,
    price: item.metadata?.price ?? 0,
    change24h: item.metadata?.change24h ?? 0,
    change7d: item.metadata?.change7d ?? 0,
    marketCap: item.metadata?.marketCap ?? '$0',
    volume24h: item.metadata?.volume24h ?? '$0',
    icon: item.thumbnailEmoji ?? '🌽',
    description: item.body ?? item.summary ?? '',
    launchDate: item.metadata?.launchDate ?? 'Unknown',
    isRugPull: item.metadata?.isRugPull ?? false,
    rugPullWarning: item.metadata?.rugPullWarning,
  }
}

/**
 * Adapter: maps SiteContentItem to local NewsItem interface.
 * Uses contentType 'news' items from the cobcoin site.
 */
function dbToNewsItem(item: SiteContentItem): NewsItem {
  return {
    id: item.slug,
    title: item.title,
    source: item.metadata?.source ?? 'CobCoin News',
    timestamp: item.metadata?.timestamp ?? (item.publishedAt ? new Date(item.publishedAt).toLocaleString() : 'Unknown'),
    sentiment: item.metadata?.sentiment ?? 'neutral',
    content: item.body ?? item.summary ?? '',
  }
}

/**
 * Adapter: maps SiteContentItem to local Comment interface.
 * Uses contentType 'comment' items from the cobcoin site.
 */
function dbToComment(item: SiteContentItem): Comment {
  return {
    id: item.slug,
    author: item.metadata?.author ?? item.title,
    avatar: item.thumbnailEmoji ?? '🌽',
    timestamp: item.metadata?.timestamp ?? 'Unknown',
    content: item.body ?? item.summary ?? '',
    upvotes: item.likeCount ?? 0,
    isDelusional: item.metadata?.isDelusional ?? false,
  }
}

export function CobCoinSite({ siteId, onNavigate }: SiteProps) {
  // Fetch DB content for each content type -- no fallback, DB is the sole source of truth
  const { content: dbCryptos } = useSiteContent('cobcoin', { contentType: 'crypto' })
  const { content: dbNews } = useSiteContent('cobcoin', { contentType: 'news' })
  const { content: dbComments } = useSiteContent('cobcoin', { contentType: 'comment' })

  const cryptos = useMemo(() => dbCryptos.map(dbToCryptocurrency), [dbCryptos])

  const newsItems = useMemo(() => dbNews.map(dbToNewsItem), [dbNews])

  const comments = useMemo(() => dbComments.map(dbToComment), [dbComments])

  const [view, setView] = useState<'market' | 'portfolio' | 'trade' | 'news'>('market')
  const [selectedCrypto, setSelectedCrypto] = useState<Cryptocurrency | null>(null)
  const [chartData, setChartData] = useState<number[]>([])
  const [showRugPullModal, setShowRugPullModal] = useState(false)
  const [ignoredWarnings, setIgnoredWarnings] = useState<string[]>([])
  const chartRef = useRef<HTMLCanvasElement>(null)

  // Generate random chart data that trends downward
  useEffect(() => {
    const generateChartData = () => {
      const data: number[] = []
      let value = 100
      for (let i = 0; i < 50; i++) {
        // Mostly goes down with occasional small bumps
        const change = Math.random() > 0.3 ? -Math.random() * 5 : Math.random() * 2
        value = Math.max(5, value + change)
        data.push(value)
      }
      setChartData(data)
    }
    generateChartData()
    const interval = setInterval(generateChartData, 5000)
    return () => clearInterval(interval)
  }, [selectedCrypto])

  // Draw chart
  useEffect(() => {
    if (!chartRef.current || chartData.length === 0) return
    const canvas = chartRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    const padding = 20

    ctx.clearRect(0, 0, width, height)

    // Background
    ctx.fillStyle = '#0a0f1c'
    ctx.fillRect(0, 0, width, height)

    // Draw grid lines
    ctx.strokeStyle = '#1f2937'
    ctx.lineWidth = 1
    for (let i = 0; i < 5; i++) {
      const y = padding + (height - padding * 2) * (i / 4)
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(width - padding, y)
      ctx.stroke()
    }

    // Draw chart line
    const max = Math.max(...chartData)
    const min = Math.min(...chartData)
    const range = max - min || 1

    ctx.beginPath()
    ctx.strokeStyle = chartData[chartData.length - 1] < chartData[0] ? '#ef4444' : '#10b981'
    ctx.lineWidth = 2

    chartData.forEach((value, i) => {
      const x = padding + (width - padding * 2) * (i / (chartData.length - 1))
      const y = height - padding - ((value - min) / range) * (height - padding * 2)
      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    ctx.stroke()

    // Draw gradient fill
    const gradient = ctx.createLinearGradient(0, 0, 0, height)
    gradient.addColorStop(0, chartData[chartData.length - 1] < chartData[0] ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)')
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')

    ctx.lineTo(width - padding, height - padding)
    ctx.lineTo(padding, height - padding)
    ctx.closePath()
    ctx.fillStyle = gradient
    ctx.fill()
  }, [chartData])

  // Calculate portfolio value
  const portfolioValue = PORTFOLIO_HOLDINGS.reduce((sum, h) => sum + h.amount * h.currentPrice, 0)
  const portfolioCost = PORTFOLIO_HOLDINGS.reduce((sum, h) => sum + h.amount * h.avgBuyPrice, 0)
  const portfolioChange = ((portfolioValue - portfolioCost) / portfolioCost) * 100

  const formatPrice = (price: number) => {
    if (price < 0.00001) return price.toExponential(2)
    if (price < 0.01) return price.toFixed(6)
    if (price < 1) return price.toFixed(4)
    return price.toFixed(2)
  }

  const formatChange = (change: number) => {
    const sign = change >= 0 ? '+' : ''
    return `${sign}${change.toFixed(2)}%`
  }

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: '#0a0f1c', color: '#e5e7eb' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #0f1419 0%, #0a0f1c 100%)',
        borderBottom: '1px solid #1f2937',
        padding: '12px 20px',
      }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span style={{ fontSize: '28px' }}>🌽</span>
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: 'bold' }}>
                <span style={{ color: '#fbbf24' }}>Cob</span>
                <span style={{ color: '#10b981' }}>Coin</span>
                <span style={{ color: '#6b7280', fontSize: '14px', marginLeft: '8px' }}>Exchange</span>
              </h1>
              <p style={{ fontSize: '10px', color: '#6b7280' }}>
                www.cobcoin.corn | TO THE MOON (or the compost heap)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div style={{
              padding: '6px 12px',
              borderRadius: '6px',
              backgroundColor: portfolioChange >= 0 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
              border: `1px solid ${portfolioChange >= 0 ? '#10b981' : '#ef4444'}`,
            }}>
              <span style={{ fontSize: '11px', color: '#9ca3af' }}>Portfolio: </span>
              <span style={{ fontWeight: 'bold', color: portfolioChange >= 0 ? '#10b981' : '#ef4444' }}>
                ${portfolioValue.toFixed(2)} ({formatChange(portfolioChange)})
              </span>
            </div>
            <Button
              variant="primary"
              size="sm"
              backgroundColor="#fbbf24"
              textColor="#000"
            >
              Connect Wallet
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-2 mt-3">
          {(['market', 'portfolio', 'trade', 'news'] as const).map(tab => (
            <Button
              key={tab}
              variant={view === tab ? 'primary' : 'ghost'}
              size="sm"
              backgroundColor={view === tab ? '#10b981' : 'transparent'}
              textColor={view === tab ? '#000' : '#9ca3af'}
              onClick={() => setView(tab)}
              style={{ textTransform: 'capitalize' }}
            >
              {tab}
            </Button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Market Overview */}
        {view === 'market' && !selectedCrypto && (
          <div>
            {/* Market Stats Banner */}
            <div className="grid gap-3 mb-4" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
              <StyledCard bgColor="#1f2937" borderColor="#374151" padding="md" borderRadius="md">
                <p style={{ fontSize: '10px', color: '#6b7280' }}>Market Cap</p>
                <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#fbbf24' }}>$9.7M</p>
                <p style={{ fontSize: '10px', color: '#ef4444' }}>-23.4% (24h)</p>
              </StyledCard>
              <StyledCard bgColor="#1f2937" borderColor="#374151" padding="md" borderRadius="md">
                <p style={{ fontSize: '10px', color: '#6b7280' }}>24h Volume</p>
                <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#10b981' }}>$2.1M</p>
                <p style={{ fontSize: '10px', color: '#ef4444' }}>-45.7% (24h)</p>
              </StyledCard>
              <StyledCard bgColor="#1f2937" borderColor="#374151" padding="md" borderRadius="md">
                <p style={{ fontSize: '10px', color: '#6b7280' }}>Active Pairs</p>
                <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#8b5cf6' }}>847</p>
                <p style={{ fontSize: '10px', color: '#9ca3af' }}>All corn-based</p>
              </StyledCard>
              <StyledCard bgColor="#1f2937" borderColor="#374151" padding="md" borderRadius="md">
                <p style={{ fontSize: '10px', color: '#6b7280' }}>Rug Pulls Today</p>
                <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#ef4444' }}>3</p>
                <p style={{ fontSize: '10px', color: '#9ca3af' }}>Business as usual</p>
              </StyledCard>
            </div>

            {/* Cryptocurrency List */}
            <div className="mb-4">
              <h2 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>All Corn Assets</span>
                <span style={{ fontSize: '10px', color: '#6b7280', fontWeight: 'normal' }}>(Sorted by how much they hurt)</span>
              </h2>

              {/* Table Header */}
              <div className="grid gap-2" style={{ gridTemplateColumns: '40px 1fr 100px 100px 100px 100px', padding: '8px 12px', color: '#6b7280', fontSize: '11px' }}>
                <span>#</span>
                <span>Name</span>
                <span style={{ textAlign: 'right' }}>Price</span>
                <span style={{ textAlign: 'right' }}>24h %</span>
                <span style={{ textAlign: 'right' }}>7d %</span>
                <span style={{ textAlign: 'right' }}>Market Cap</span>
              </div>

              {/* Cryptocurrency Rows */}
              {cryptos.map((crypto, index) => (
                <StyledCard
                  key={crypto.id}
                  bgColor="#1f2937"
                  borderColor={crypto.isRugPull ? '#ef4444' : '#374151'}
                  hoverColor="#263341"
                  padding="md"
                  borderRadius="md"
                  interactive
                  onClick={() => {
                    if (crypto.isRugPull && !ignoredWarnings.includes(crypto.id)) {
                      setSelectedCrypto(crypto)
                      setShowRugPullModal(true)
                    } else {
                      setSelectedCrypto(crypto)
                    }
                  }}
                  style={{ marginBottom: '8px', position: 'relative' }}
                >
                  {crypto.isRugPull && (
                    <span style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      backgroundColor: '#ef4444',
                      color: '#fff',
                      fontSize: '9px',
                      fontWeight: 'bold',
                      padding: '2px 6px',
                      borderRadius: '4px',
                    }}>
                      RUG PULL WARNING
                    </span>
                  )}
                  <div className="grid items-center gap-2" style={{ gridTemplateColumns: '40px 1fr 100px 100px 100px 100px' }}>
                    <span style={{ color: '#6b7280', fontSize: '12px' }}>{index + 1}</span>
                    <div className="flex items-center gap-2">
                      <span style={{ fontSize: '24px' }}>{crypto.icon}</span>
                      <div>
                        <p style={{ fontWeight: 'bold', fontSize: '14px' }}>{crypto.name}</p>
                        <p style={{ fontSize: '11px', color: '#6b7280' }}>{crypto.symbol}</p>
                      </div>
                    </div>
                    <span style={{ textAlign: 'right', fontFamily: 'monospace', fontSize: '13px' }}>
                      ${formatPrice(crypto.price)}
                    </span>
                    <span style={{
                      textAlign: 'right',
                      color: crypto.change24h >= 0 ? '#10b981' : '#ef4444',
                      fontWeight: 'bold',
                      fontSize: '13px',
                    }}>
                      {formatChange(crypto.change24h)}
                    </span>
                    <span style={{
                      textAlign: 'right',
                      color: crypto.change7d >= 0 ? '#10b981' : '#ef4444',
                      fontWeight: 'bold',
                      fontSize: '13px',
                    }}>
                      {formatChange(crypto.change7d)}
                    </span>
                    <span style={{ textAlign: 'right', fontSize: '12px', color: '#9ca3af' }}>
                      {crypto.marketCap}
                    </span>
                  </div>
                </StyledCard>
              ))}
            </div>

            {/* Trading Pairs */}
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>
                Trading Pairs
              </h2>
              <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                {TRADING_PAIRS.map(pair => (
                  <StyledCard
                    key={`${pair.base}-${pair.quote}`}
                    bgColor="#1f2937"
                    borderColor="#374151"
                    hoverColor="#263341"
                    padding="md"
                    borderRadius="md"
                    interactive
                  >
                    <div className="flex items-center justify-between">
                      <span style={{ fontWeight: 'bold', fontSize: '13px' }}>
                        {pair.base}/{pair.quote}
                      </span>
                      <span style={{
                        color: pair.change >= 0 ? '#10b981' : '#ef4444',
                        fontSize: '12px',
                        fontWeight: 'bold',
                      }}>
                        {formatChange(pair.change)}
                      </span>
                    </div>
                    <p style={{ fontSize: '16px', fontFamily: 'monospace', marginTop: '4px' }}>
                      {formatPrice(pair.price)}
                    </p>
                  </StyledCard>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Crypto Detail View */}
        {view === 'market' && selectedCrypto && (
          <div>
            <Button
              variant="ghost"
              size="sm"
              textColor="#10b981"
              onClick={() => setSelectedCrypto(null)}
              style={{ marginBottom: '16px' }}
            >
              Back to Market
            </Button>

            <div className="flex items-center gap-4 mb-4">
              <span style={{ fontSize: '48px' }}>{selectedCrypto.icon}</span>
              <div>
                <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>
                  {selectedCrypto.name}
                  <span style={{ color: '#6b7280', fontSize: '16px', marginLeft: '8px' }}>
                    {selectedCrypto.symbol}
                  </span>
                </h1>
                <div className="flex items-center gap-4">
                  <span style={{ fontSize: '28px', fontFamily: 'monospace' }}>
                    ${formatPrice(selectedCrypto.price)}
                  </span>
                  <span style={{
                    color: selectedCrypto.change24h >= 0 ? '#10b981' : '#ef4444',
                    fontWeight: 'bold',
                  }}>
                    {formatChange(selectedCrypto.change24h)} (24h)
                  </span>
                </div>
              </div>
            </div>

            {/* Chart */}
            <StyledCard bgColor="#0a0f1c" borderColor="#374151" padding="md" borderRadius="lg" style={{ marginBottom: '16px' }}>
              <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>
                Price Chart (100% real-time data, definitely not random)
              </p>
              <canvas ref={chartRef} width={600} height={200} style={{ width: '100%', height: '200px' }} />
            </StyledCard>

            {/* Info Cards */}
            <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <StyledCard bgColor="#1f2937" borderColor="#374151" padding="md" borderRadius="md">
                <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>About</h3>
                <p style={{ fontSize: '12px', color: '#9ca3af', lineHeight: '1.6' }}>
                  {selectedCrypto.description}
                </p>
                <p style={{ fontSize: '11px', color: '#6b7280', marginTop: '8px' }}>
                  Launched: {selectedCrypto.launchDate}
                </p>
              </StyledCard>
              <StyledCard bgColor="#1f2937" borderColor="#374151" padding="md" borderRadius="md">
                <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>Statistics</h3>
                <div className="grid gap-2">
                  <div className="flex justify-between">
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>Market Cap</span>
                    <span style={{ fontSize: '12px' }}>{selectedCrypto.marketCap}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>24h Volume</span>
                    <span style={{ fontSize: '12px' }}>{selectedCrypto.volume24h}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>7d Change</span>
                    <span style={{ fontSize: '12px', color: selectedCrypto.change7d >= 0 ? '#10b981' : '#ef4444' }}>
                      {formatChange(selectedCrypto.change7d)}
                    </span>
                  </div>
                </div>
              </StyledCard>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button variant="primary" size="md" backgroundColor="#10b981" textColor="#000" style={{ flex: 1 }}>
                Buy {selectedCrypto.symbol}
              </Button>
              <Button variant="primary" size="md" backgroundColor="#ef4444" textColor="#fff" style={{ flex: 1 }}>
                Sell {selectedCrypto.symbol}
              </Button>
            </div>
          </div>
        )}

        {/* Portfolio View */}
        {view === 'portfolio' && (
          <div>
            {/* Portfolio Summary */}
            <StyledCard
              bgColor={portfolioChange >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'}
              borderColor={portfolioChange >= 0 ? '#10b981' : '#ef4444'}
              padding="lg"
              borderRadius="lg"
              style={{ marginBottom: '24px' }}
            >
              <p style={{ fontSize: '12px', color: '#9ca3af' }}>Total Portfolio Value</p>
              <p style={{ fontSize: '36px', fontWeight: 'bold', fontFamily: 'monospace' }}>
                ${portfolioValue.toFixed(2)}
              </p>
              <div className="flex items-center gap-4 mt-2">
                <span style={{ color: portfolioChange >= 0 ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>
                  {formatChange(portfolioChange)} All Time
                </span>
                <span style={{ color: '#ef4444', fontSize: '12px' }}>
                  (Loss: ${(portfolioCost - portfolioValue).toFixed(2)})
                </span>
              </div>
              <p style={{ fontSize: '11px', color: '#6b7280', marginTop: '8px' }}>
                Original Investment: ${portfolioCost.toFixed(2)} | Current: ${portfolioValue.toFixed(2)} | Pain Level: Extreme
              </p>
            </StyledCard>

            {/* Holdings */}
            <h2 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>Your Holdings (aka Bags)</h2>
            {PORTFOLIO_HOLDINGS.map(holding => {
              const crypto = cryptos.find(c => c.symbol === holding.symbol)
              const value = holding.amount * holding.currentPrice
              const cost = holding.amount * holding.avgBuyPrice
              const change = ((value - cost) / cost) * 100

              return (
                <StyledCard
                  key={holding.symbol}
                  bgColor="#1f2937"
                  borderColor="#374151"
                  padding="md"
                  borderRadius="md"
                  style={{ marginBottom: '8px' }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span style={{ fontSize: '28px' }}>{crypto?.icon}</span>
                      <div>
                        <p style={{ fontWeight: 'bold' }}>{crypto?.name}</p>
                        <p style={{ fontSize: '12px', color: '#6b7280' }}>
                          {holding.amount.toLocaleString()} {holding.symbol}
                        </p>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontWeight: 'bold', fontFamily: 'monospace' }}>
                        ${value.toFixed(2)}
                      </p>
                      <p style={{ fontSize: '12px', color: change >= 0 ? '#10b981' : '#ef4444' }}>
                        {formatChange(change)}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between mt-2 pt-2" style={{ borderTop: '1px solid #374151' }}>
                    <span style={{ fontSize: '11px', color: '#6b7280' }}>
                      Avg Buy: ${formatPrice(holding.avgBuyPrice)}
                    </span>
                    <span style={{ fontSize: '11px', color: '#6b7280' }}>
                      Current: ${formatPrice(holding.currentPrice)}
                    </span>
                    <span style={{ fontSize: '11px', color: '#ef4444' }}>
                      Loss: ${(cost - value).toFixed(2)}
                    </span>
                  </div>
                </StyledCard>
              )
            })}

            {/* Motivational Message */}
            <StyledCard bgColor="#374151" borderColor="#4b5563" padding="md" borderRadius="md" style={{ marginTop: '16px', textAlign: 'center' }}>
              <p style={{ fontSize: '14px', fontStyle: 'italic', color: '#9ca3af' }}>
                "HODL strong. These are just unrealized losses. You only lose when you sell."
              </p>
              <p style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>
                - Every CobCoin investor, probably
              </p>
            </StyledCard>
          </div>
        )}

        {/* Trade View */}
        {view === 'trade' && (
          <div>
            <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 1fr' }}>
              {/* Buy Panel */}
              <StyledCard bgColor="#1f2937" borderColor="#10b981" padding="lg" borderRadius="lg">
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#10b981', marginBottom: '16px' }}>
                  BUY (To The Moon)
                </h3>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '12px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>
                    Select Asset
                  </label>
                  <select style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '6px',
                    backgroundColor: '#0a0f1c',
                    border: '1px solid #374151',
                    color: '#e5e7eb',
                  }}>
                    {cryptos.map(c => (
                      <option key={c.id} value={c.id}>{c.symbol} - {c.name}</option>
                    ))}
                  </select>
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '12px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>
                    Amount
                  </label>
                  <input
                    type="number"
                    placeholder="0.00"
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '6px',
                      backgroundColor: '#0a0f1c',
                      border: '1px solid #374151',
                      color: '#e5e7eb',
                    }}
                  />
                </div>
                <Button variant="primary" size="md" width="full" backgroundColor="#10b981" textColor="#000">
                  BUY (YOLO)
                </Button>
                <p style={{ fontSize: '10px', color: '#6b7280', marginTop: '8px', textAlign: 'center' }}>
                  "Buy the dip" - It keeps dipping
                </p>
              </StyledCard>

              {/* Sell Panel */}
              <StyledCard bgColor="#1f2937" borderColor="#ef4444" padding="lg" borderRadius="lg">
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#ef4444', marginBottom: '16px' }}>
                  SELL (Paper Hands)
                </h3>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '12px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>
                    Select Asset
                  </label>
                  <select style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '6px',
                    backgroundColor: '#0a0f1c',
                    border: '1px solid #374151',
                    color: '#e5e7eb',
                  }}>
                    {PORTFOLIO_HOLDINGS.map(h => (
                      <option key={h.symbol} value={h.symbol}>{h.symbol} ({h.amount.toLocaleString()})</option>
                    ))}
                  </select>
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '12px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>
                    Amount to Sell
                  </label>
                  <input
                    type="number"
                    placeholder="0.00"
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '6px',
                      backgroundColor: '#0a0f1c',
                      border: '1px solid #374151',
                      color: '#e5e7eb',
                    }}
                  />
                </div>
                <Button variant="primary" size="md" width="full" backgroundColor="#ef4444" textColor="#fff">
                  SELL (Realize Loss)
                </Button>
                <p style={{ fontSize: '10px', color: '#6b7280', marginTop: '8px', textAlign: 'center' }}>
                  Are you sure? Diamond hands only!
                </p>
              </StyledCard>
            </div>

            {/* Trading Tips */}
            <StyledCard bgColor="#0f1419" borderColor="#374151" padding="md" borderRadius="md" style={{ marginTop: '16px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>Pro Trading Tips</h4>
              <ul style={{ fontSize: '12px', color: '#9ca3af', lineHeight: '1.8' }}>
                <li>Always buy high, sell low (we\'re not financial advisors)</li>
                <li>If it\'s going up, it will go down. If it\'s going down, it will go down more.</li>
                <li>847 is the magic number. We don\'t know why either.</li>
                <li>Never check the charts between 2 AM and 6 AM unless you want to cry.</li>
                <li>TRUST tokens are not a good investment. Tim told us to tell you that.</li>
              </ul>
            </StyledCard>
          </div>
        )}

        {/* News View */}
        {view === 'news' && (
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>
              Crypto News & Announcements
            </h2>

            {/* News Feed */}
            {newsItems.map(news => (
              <StyledCard
                key={news.id}
                bgColor="#1f2937"
                borderColor="#374151"
                padding="md"
                borderRadius="md"
                style={{ marginBottom: '12px' }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span style={{
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    backgroundColor: news.sentiment === 'bullish' ? '#10b981' :
                      news.sentiment === 'bearish' ? '#ef4444' :
                      news.sentiment === 'scam' ? '#8b5cf6' : '#6b7280',
                    color: '#fff',
                  }}>
                    {news.sentiment.toUpperCase()}
                  </span>
                  <span style={{ fontSize: '11px', color: '#6b7280' }}>{news.source}</span>
                  <span style={{ fontSize: '11px', color: '#4b5563' }}>|</span>
                  <span style={{ fontSize: '11px', color: '#6b7280' }}>{news.timestamp}</span>
                </div>
                <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px', lineHeight: '1.3' }}>
                  {news.title}
                </h3>
                <p style={{ fontSize: '12px', color: '#9ca3af', lineHeight: '1.6' }}>
                  {news.content}
                </p>
              </StyledCard>
            ))}

            {/* Community Comments */}
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginTop: '24px', marginBottom: '16px' }}>
              Community Sentiment (Mostly Delusional)
            </h2>

            {comments.map(comment => (
              <StyledCard
                key={comment.id}
                bgColor="#1f2937"
                borderColor={comment.isDelusional ? '#fbbf24' : '#374151'}
                padding="md"
                borderRadius="md"
                style={{ marginBottom: '12px' }}
              >
                <div className="flex items-start gap-3">
                  <Avatar size="md" initials={comment.avatar} bgColor="#374151" />
                  <div style={{ flex: 1 }}>
                    <div className="flex items-center gap-2 mb-1">
                      <span style={{ fontWeight: 'bold', fontSize: '13px' }}>{comment.author}</span>
                      {comment.isDelusional && (
                        <span style={{
                          fontSize: '9px',
                          padding: '1px 4px',
                          borderRadius: '3px',
                          backgroundColor: '#fbbf24',
                          color: '#000',
                        }}>
                          DIAMOND HANDS
                        </span>
                      )}
                      <span style={{ fontSize: '11px', color: '#6b7280' }}>{comment.timestamp}</span>
                    </div>
                    <p style={{ fontSize: '13px', color: '#e5e7eb', lineHeight: '1.5' }}>
                      {comment.content}
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <button style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '11px',
                        color: comment.upvotes >= 0 ? '#10b981' : '#ef4444',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                      }}>
                        {comment.upvotes >= 0 ? '🚀' : '📉'} {Math.abs(comment.upvotes)}
                      </button>
                      <button style={{
                        fontSize: '11px',
                        color: '#6b7280',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                      }}>
                        Reply
                      </button>
                    </div>
                  </div>
                </div>
              </StyledCard>
            ))}
          </div>
        )}
      </div>

      {/* Rug Pull Warning Modal */}
      {showRugPullModal && selectedCrypto?.isRugPull && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
          }}
        >
          <StyledCard
            bgColor="#1f2937"
            borderColor="#ef4444"
            borderWidth={3}
            padding="xl"
            borderRadius="xl"
            shadow="lg"
            style={{ maxWidth: '400px', width: '90%' }}
          >
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '64px', display: 'block', marginBottom: '16px' }}>
                {selectedCrypto.icon}
              </span>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#ef4444', marginBottom: '8px' }}>
                RUG PULL WARNING
              </h3>
              <p style={{ fontSize: '14px', color: '#e5e7eb', marginBottom: '16px' }}>
                {selectedCrypto.rugPullWarning}
              </p>
              <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '20px' }}>
                This token has lost 99.97% of its value. The developer (Trust Fall Tim) has been
                seen falling into bushes and hasn\'t responded to any messages.
              </p>
              <div className="flex gap-4">
                <Button
                  variant="primary"
                  size="md"
                  backgroundColor="#10b981"
                  textColor="#000"
                  style={{ flex: 1 }}
                  onClick={() => setShowRugPullModal(false)}
                >
                  Go Back (Smart)
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  backgroundColor="#ef4444"
                  textColor="#fff"
                  style={{ flex: 1 }}
                  onClick={() => {
                    setIgnoredWarnings([...ignoredWarnings, selectedCrypto.id])
                    setShowRugPullModal(false)
                  }}
                >
                  YOLO Anyway
                </Button>
              </div>
              <p style={{ fontSize: '10px', color: '#6b7280', marginTop: '12px' }}>
                By clicking "YOLO Anyway" you acknowledge that you are making a terrible decision
                and we told you so.
              </p>
            </div>
          </StyledCard>
        </div>
      )}

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
          CobCoin Exchange is not a registered securities exchange. All tokens are purely speculative and probably worthless.
          Past performance is not indicative of future results (but let\'s be honest, it probably is).
          847 COB = 1 USD | DYOR | NFA | WAGMI (maybe) | Not endorsed by Omnicorp Holdings (officially)
        </p>
      </div>
    </div>
  )
}

export default CobCoinSite
