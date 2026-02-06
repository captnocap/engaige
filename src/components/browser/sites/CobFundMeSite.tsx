/**
 * CobFundMe Site
 *
 * GoFundMe parody - a crowdfunding site with increasingly questionable campaigns.
 * Features campaign cards with progress bars, donor comments, organizer profiles,
 * and "verified" badges that mean absolutely nothing.
 *
 * Integrates with existing world lore: Derek's quantum coffee obsession,
 * Trust Fall Tim's medical bills, The Underground venue, Floor 13 conspiracy,
 * Mildred's gas station sushi tour, and more.
 *
 * URL Routing:
 * - Homepage: path = null or '/'
 * - Campaign detail: path = '/campaign/{campaign-id}'
 * - Category filter: path = '/category/{category-name}'
 */

import { useState, useMemo } from 'react'
import type { SiteProps } from '../BrowserSiteContainer.js'
import { FILLER_SITES } from '../../../config/filler-sites.js'
import { useSiteContent, type SiteContentItem } from '../../../hooks/useSiteContent.js'

const site = FILLER_SITES.cobfundme

// ============================================================================
// URL Routing Helpers
// ============================================================================

/**
 * Route type representing the current view state.
 * - home: Main homepage with all campaigns
 * - campaign: Single campaign detail view
 * - category: Filtered view by category
 */
interface RouteState {
  view: 'home' | 'campaign' | 'category'
  id: string | null
}

/**
 * Parse the current path to determine the view and extract IDs.
 *
 * Supported routes:
 * - / or null -> homepage
 * - /campaign/{campaign-id} -> campaign detail
 * - /category/{category-name} -> filtered category view
 */
function parseRoute(path: string | null): RouteState {
  if (!path || path === '/') {
    return { view: 'home', id: null }
  }

  // Match /campaign/{campaign-id}
  const campaignMatch = path.match(/^\/campaign\/(.+)$/)
  if (campaignMatch) {
    return { view: 'campaign', id: campaignMatch[1] }
  }

  // Match /category/{category-name}
  const categoryMatch = path.match(/^\/category\/(.+)$/)
  if (categoryMatch) {
    return { view: 'category', id: categoryMatch[1] }
  }

  return { view: 'home', id: null }
}

/**
 * Find a campaign by its ID from the campaign list.
 */
function findCampaignById(id: string | null, campaigns: Campaign[]): Campaign | null {
  if (!id) return null
  return campaigns.find(c => c.id === id) || null
}

// ============================================================================
// Types
// ============================================================================

interface Donor {
  id: string
  name: string
  amount: number
  comment: string
  timestamp: string
  isAnonymous?: boolean
}

interface Update {
  id: string
  date: string
  title: string
  content: string
}

interface Organizer {
  name: string
  location: string
  campaignsCreated: number
  profileImage: string
  bio: string
  verified: boolean
  verifiedReason?: string
}

interface Campaign {
  id: string
  title: string
  organizer: Organizer
  goal: number
  raised: number
  donors: Donor[]
  category: 'Medical' | 'Emergency' | 'Memorial' | 'Dreams' | 'Suspicious'
  image: string
  story: string
  updates: Update[]
  shares: number
  daysActive: number
  verified: boolean
  verifiedBadge?: string
  featured?: boolean
  stuckProgress?: boolean
}

// (Hardcoded campaigns removed -- database is the sole source of truth)

// ============================================================================
// DB Adapter
// ============================================================================

/** Map a SiteContentItem from the DB to the local Campaign interface */
function dbToCampaign(item: SiteContentItem): Campaign {
  const m = item.metadata || {}
  return {
    id: item.slug,
    title: item.title,
    organizer: m.organizer ?? { name: 'Unknown', location: 'Unknown', campaignsCreated: 0, profileImage: '🌽', bio: '', verified: false },
    goal: m.goal ?? 0,
    raised: m.raised ?? 0,
    donors: (m.donors ?? []).map((d: any, i: number) => ({
      id: d.id ?? `d_${i}`,
      name: d.name ?? 'Anonymous',
      amount: d.amount ?? 0,
      comment: d.comment ?? '',
      timestamp: d.timestamp ?? '',
      isAnonymous: d.isAnonymous ?? d.is_anonymous ?? false,
    })),
    category: (item.category ?? m.category ?? 'Dreams') as Campaign['category'],
    image: item.thumbnailEmoji ?? m.image ?? '🌽',
    story: item.body ?? m.story ?? '',
    updates: (m.updates ?? []).map((u: any, i: number) => ({
      id: u.id ?? `u_${i}`,
      date: u.date ?? '',
      title: u.title ?? '',
      content: u.content ?? '',
    })),
    shares: m.shares ?? 0,
    daysActive: m.daysActive ?? m.days_active ?? 0,
    verified: m.verified ?? item.isFeatured ?? false,
    verifiedBadge: m.verifiedBadge ?? m.verified_badge ?? undefined,
    featured: m.featured ?? item.isPinned ?? false,
    stuckProgress: m.stuckProgress ?? m.stuck_progress ?? false,
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Calculate progress percentage, handling stuck campaigns
 */
function getProgressPercent(campaign: Campaign): number {
  if (campaign.stuckProgress) {
    // These campaigns are stuck at specific amounts
    return (campaign.raised / campaign.goal) * 100
  }
  return Math.min((campaign.raised / campaign.goal) * 100, 150) // Cap at 150% for display
}

/**
 * Format currency for display
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Get category badge color
 */
function getCategoryColor(category: Campaign['category']): { bg: string; text: string } {
  const colors = {
    Medical: { bg: '#DCFCE7', text: '#166534' },
    Emergency: { bg: '#FEE2E2', text: '#991B1B' },
    Memorial: { bg: '#E0E7FF', text: '#3730A3' },
    Dreams: { bg: '#FEF3C7', text: '#92400E' },
    Suspicious: { bg: '#F3F4F6', text: '#374151' },
  }
  return colors[category]
}

// ============================================================================
// Components
// ============================================================================

/**
 * Campaign card for browse/trending view
 */
function CampaignCard({
  campaign,
  onClick,
}: {
  campaign: Campaign
  onClick: () => void
}) {
  const progress = getProgressPercent(campaign)
  const categoryColor = getCategoryColor(campaign.category)

  return (
    <button
      onClick={onClick}
      className="bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow text-left w-full"
    >
      {/* Image area */}
      <div className="h-32 bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
        <span className="text-6xl">{campaign.image}</span>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Category and badges */}
        <div className="flex items-center gap-2 mb-2">
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{ backgroundColor: categoryColor.bg, color: categoryColor.text }}
          >
            {campaign.category}
          </span>
          {campaign.verified && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 flex items-center gap-1">
              <span>&#10003;</span> {campaign.verifiedBadge || 'Verified'}
            </span>
          )}
          {campaign.featured && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">
              Featured
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{campaign.title}</h3>

        {/* Progress bar */}
        <div className="mb-2">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.min(progress, 100)}%`,
                backgroundColor: progress >= 100 ? '#10B981' : '#22C55E',
              }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="flex justify-between text-sm">
          <div>
            <span className="font-bold text-green-600">{formatCurrency(campaign.raised)}</span>
            <span className="text-gray-500"> raised of {formatCurrency(campaign.goal)}</span>
          </div>
          <span className="text-gray-500">{campaign.donors.length} donors</span>
        </div>

        {/* Organizer */}
        <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
          <span className="text-lg">{campaign.organizer.profileImage}</span>
          <span>by {campaign.organizer.name}</span>
        </div>
      </div>
    </button>
  )
}

/**
 * Donor list item
 */
function DonorItem({ donor }: { donor: Donor }) {
  return (
    <div className="py-3 border-b border-gray-100 last:border-0">
      <div className="flex justify-between items-start mb-1">
        <span className="font-medium text-gray-900">
          {donor.isAnonymous ? 'Anonymous' : donor.name}
        </span>
        <span className="font-bold text-green-600">
          {donor.amount < 0 ? `-${formatCurrency(Math.abs(donor.amount))}` : formatCurrency(donor.amount)}
        </span>
      </div>
      <p className="text-sm text-gray-600 italic">"{donor.comment}"</p>
      <span className="text-xs text-gray-400">{donor.timestamp}</span>
    </div>
  )
}

/**
 * Campaign detail view
 */
function CampaignDetail({
  campaign,
  onBack,
}: {
  campaign: Campaign
  onBack: () => void
}) {
  const [activeTab, setActiveTab] = useState<'story' | 'updates' | 'donors'>('story')
  const progress = getProgressPercent(campaign)
  const categoryColor = getCategoryColor(campaign.category)

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-green-600 hover:text-green-700 mb-4"
      >
        <span>&#8592;</span> Back to campaigns
      </button>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="md:col-span-2">
          {/* Header image */}
          <div className="h-48 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center mb-4">
            <span className="text-8xl">{campaign.image}</span>
          </div>

          {/* Title and badges */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{ backgroundColor: categoryColor.bg, color: categoryColor.text }}
            >
              {campaign.category}
            </span>
            {campaign.verified && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 flex items-center gap-1">
                <span>&#10003;</span> {campaign.verifiedBadge || 'Verified'}
              </span>
            )}
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-4">{campaign.title}</h1>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-4">
            <div className="flex gap-6">
              {(['story', 'updates', 'donors'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-2 text-sm font-medium capitalize border-b-2 transition-colors ${
                    activeTab === tab
                      ? 'border-green-600 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab}
                  {tab === 'updates' && ` (${campaign.updates.length})`}
                  {tab === 'donors' && ` (${campaign.donors.length})`}
                </button>
              ))}
            </div>
          </div>

          {/* Tab content */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            {activeTab === 'story' && (
              <div className="prose prose-sm max-w-none">
                {campaign.story.split('\n\n').map((paragraph, i) => (
                  <p key={i} className="mb-4 text-gray-700 whitespace-pre-wrap">
                    {paragraph}
                  </p>
                ))}
              </div>
            )}

            {activeTab === 'updates' && (
              <div className="space-y-6">
                {campaign.updates.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No updates yet.</p>
                ) : (
                  campaign.updates.map((update) => (
                    <div key={update.id} className="border-l-4 border-green-500 pl-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-gray-900">{update.title}</span>
                        <span className="text-sm text-gray-500">{update.date}</span>
                      </div>
                      <p className="text-gray-700 text-sm">{update.content}</p>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'donors' && (
              <div>
                {campaign.donors.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No donors yet. Be the first!</p>
                ) : (
                  campaign.donors.map((donor) => <DonorItem key={donor.id} donor={donor} />)
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="md:col-span-1">
          {/* Donation box */}
          <div className="bg-white rounded-lg p-4 border border-gray-200 sticky top-4">
            {/* Progress */}
            <div className="mb-4">
              <div className="flex justify-between items-end mb-2">
                <div>
                  <span className="text-2xl font-bold text-green-600">
                    {formatCurrency(campaign.raised)}
                  </span>
                  <span className="text-gray-500 text-sm"> raised</span>
                </div>
                <span className="text-sm text-gray-500">
                  {Math.round(progress)}% of {formatCurrency(campaign.goal)}
                </span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(progress, 100)}%`,
                    backgroundColor: progress >= 100 ? '#10B981' : '#22C55E',
                  }}
                />
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-4 text-center">
              <div className="bg-gray-50 rounded p-2">
                <div className="font-bold text-gray-900">{campaign.donors.length}</div>
                <div className="text-xs text-gray-500">donors</div>
              </div>
              <div className="bg-gray-50 rounded p-2">
                <div className="font-bold text-gray-900">{campaign.shares.toLocaleString()}</div>
                <div className="text-xs text-gray-500">shares</div>
              </div>
            </div>

            {/* Donate buttons */}
            <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg mb-2 transition-colors">
              Donate Now
            </button>
            <button className="w-full border border-green-600 text-green-600 hover:bg-green-50 font-medium py-2 rounded-lg mb-4 transition-colors">
              Share
            </button>

            {/* Share buttons */}
            <div className="flex justify-center gap-3">
              {['Facebook', 'Twitter', 'Email', 'Copy'].map((platform) => (
                <button
                  key={platform}
                  className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-sm transition-colors"
                  title={`Share on ${platform}`}
                >
                  {platform[0]}
                </button>
              ))}
            </div>

            {/* Organizer */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <h3 className="font-bold text-gray-900 mb-3">Organizer</h3>
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-2xl">
                  {campaign.organizer.profileImage}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{campaign.organizer.name}</span>
                    {campaign.organizer.verified && (
                      <span className="text-xs text-green-600">&#10003;</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">{campaign.organizer.location}</p>
                  <p className="text-xs text-gray-500">
                    {campaign.organizer.campaignsCreated} campaigns created
                  </p>
                </div>
              </div>
              <p className="mt-3 text-sm text-gray-600">{campaign.organizer.bio}</p>
              {campaign.organizer.verified && campaign.organizer.verifiedReason && (
                <div className="mt-2 text-xs text-green-600 flex items-center gap-1">
                  <span>&#10003;</span> {campaign.organizer.verifiedReason}
                </div>
              )}
            </div>

            {/* Days active */}
            <div className="mt-4 text-center text-sm text-gray-500">
              Campaign active for {campaign.daysActive} days
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Main Site Component
// ============================================================================

export function CobFundMeSite({ siteId, path, onNavigate, onPathChange }: SiteProps) {
  // Database is the sole source of truth for campaign data
  const { content: dbContent } = useSiteContent('cobfundme')

  const campaigns = useMemo(() => dbContent.map(dbToCampaign), [dbContent])

  // Parse the current route to determine what view to show
  const route = useMemo(() => parseRoute(path), [path])

  // Find the selected campaign based on the route
  const selectedCampaign = useMemo(() => findCampaignById(route.id, campaigns), [route.id, campaigns])

  // Determine selected category from route or default to 'all'
  const selectedCategory = route.view === 'category' && route.id ? route.id : 'all'

  // Local UI state for search (not URL-based)
  const [searchQuery, setSearchQuery] = useState('')

  /**
   * Navigate to a campaign's detail page.
   * Updates the URL to /campaign/{campaign-id}
   */
  const navigateToCampaign = (campaign: Campaign) => {
    onPathChange(`/campaign/${campaign.id}`)
  }

  /**
   * Navigate back to the homepage.
   * Clears the path to show all campaigns.
   */
  const navigateToHome = () => {
    onPathChange(null)
  }

  /**
   * Navigate to a category filter view.
   * Updates the URL to /category/{category-name} or null for 'all'.
   */
  const navigateToCategory = (category: string) => {
    if (category === 'all') {
      onPathChange(null)
    } else {
      onPathChange(`/category/${category}`)
    }
  }

  // Filter campaigns based on category and search
  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesCategory = selectedCategory === 'all' || campaign.category === selectedCategory
    const matchesSearch =
      searchQuery === '' ||
      campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.organizer.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  // Featured campaigns for hero section
  const featuredCampaigns = campaigns.filter((c) => c.featured)

  // Render campaign detail view if a campaign is selected via URL
  if (route.view === 'campaign' && selectedCampaign) {
    return (
      <div className="min-h-full bg-gray-50 py-6 px-4">
        <CampaignDetail campaign={selectedCampaign} onBack={navigateToHome} />
      </div>
    )
  }

  return (
    <div className="min-h-full bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo - clickable to return to homepage */}
            <button onClick={navigateToHome} className="flex items-center gap-2 hover:opacity-80">
              <span className="text-3xl">{site?.icon || '🌽'}</span>
              <div className="text-left">
                <h1 className="text-xl font-bold text-green-700">{site?.name || 'CobFundMe'}</h1>
                <p className="text-xs text-gray-500">{site?.tagline || 'Fund What Matters (To Someone)'}</p>
              </div>
            </button>

            {/* Search */}
            <div className="flex-1 max-w-md mx-8">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search campaigns..."
                className="w-full px-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <button className="text-sm text-gray-600 hover:text-gray-800">How It Works</button>
              <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors">
                Start a Campaign
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero - Featured Campaigns */}
      {featuredCampaigns.length > 0 && (
        <section className="bg-gradient-to-br from-green-600 to-green-700 text-white py-8">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6">Featured Campaigns</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {featuredCampaigns.map((campaign) => (
                <button
                  key={campaign.id}
                  onClick={() => navigateToCampaign(campaign)}
                  className="bg-white/10 backdrop-blur rounded-lg p-4 text-left hover:bg-white/20 transition-colors"
                >
                  <div className="flex gap-4">
                    <div className="w-20 h-20 bg-white/20 rounded-lg flex items-center justify-center text-4xl">
                      {campaign.image}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold mb-1">{campaign.title}</h3>
                      <div className="text-sm opacity-80 mb-2">
                        {formatCurrency(campaign.raised)} raised of {formatCurrency(campaign.goal)}
                      </div>
                      <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-white rounded-full"
                          style={{ width: `${Math.min(getProgressPercent(campaign), 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Category filters */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex gap-2 overflow-x-auto">
            {['all', 'Medical', 'Emergency', 'Memorial', 'Dreams', 'Suspicious'].map((category) => (
              <button
                key={category}
                onClick={() => navigateToCategory(category)}
                className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
                  selectedCategory === category
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category === 'all' ? 'All Campaigns' : category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {selectedCategory === 'all'
              ? 'Trending Campaigns'
              : `${selectedCategory} Campaigns`}
          </h2>
          <span className="text-sm text-gray-500">{filteredCampaigns.length} campaigns</span>
        </div>

        {filteredCampaigns.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-6xl mb-4 block">🌽</span>
            <p className="text-gray-500">No campaigns found. Try a different search.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCampaigns.map((campaign) => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                onClick={() => navigateToCampaign(campaign)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🌽</span>
                <span className="font-bold">CobFundMe</span>
              </div>
              <p className="text-sm text-gray-400">
                The #1 crowdfunding platform for corn-related endeavors and other questionable campaigns since 2019.
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-3">Resources</h3>
              <ul className="text-sm text-gray-400 space-y-2">
                <li><button className="hover:text-white">How It Works</button></li>
                <li><button className="hover:text-white">Trust & Safety</button></li>
                <li><button className="hover:text-white">Pricing</button></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-3">Learn More</h3>
              <ul className="text-sm text-gray-400 space-y-2">
                <li><button className="hover:text-white">Success Stories</button></li>
                <li><button className="hover:text-white">Blog</button></li>
                <li><button className="hover:text-white">Careers</button></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-3">Support</h3>
              <ul className="text-sm text-gray-400 space-y-2">
                <li><button className="hover:text-white">Help Center</button></li>
                <li><button className="hover:text-white">Contact Us</button></li>
                <li><button className="hover:text-white">Report Fraud</button></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm text-gray-400">
            <p>2019-2026 CobFundMe, Inc. All rights reserved.</p>
            <p className="mt-1">
              "Verified" badges are awarded based on criteria that we made up. They do not indicate any actual verification of claims.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default CobFundMeSite
