/**
 * CornMaps Site (www.cornmaps.corn)
 *
 * A Google Maps parody navigation app where every destination has something off about it.
 *
 * Features:
 * - Blue/green map-style aesthetic with grid pattern background
 * - Location cards with ratings, hours, and "popular times" graphs
 * - Directions that don't quite make sense (with weird steps highlighted)
 * - Street View previews (described status: available, unavailable, signal_lost)
 * - User reviews with "helpful" counts
 * - "Areas of Interest" markers on map
 * - Integration with other lore sites (Hartwell Files, GrainTruth, etc.)
 *
 * Locations include:
 * - Hartwell Building: Office building with missing Floor 13, 3:33 AM activity spikes
 * - The Underground: Music venue with 847 noise complaints, "Mars knows your name"
 * - Quantum Brew Cafe: Derek's obsession, $47 coffee, car in every Street View
 * - Flying J #847: Gas station sushi, Mildred's 47 reviews
 * - Trust Fall Tim's Practice Field: 78.5% catch rate, "ow" review from Small Kevin
 * - Floor 13: Location that "cannot be found" but has reviews anyway
 * - Nebraska: State that's "still being mapped", all roads lead to corn
 */

import { useState, useMemo } from 'react'
import type { SiteProps } from '../BrowserSiteContainer.js'
import { FILLER_SITES } from '../../../config/filler-sites.js'
import { StyledCard, Button } from '../../ui/shared/index.js'
import { useSiteContent, type SiteContentItem } from '../../../hooks/useSiteContent.js'

const site = FILLER_SITES.cornmaps

// ============================================================================
// Types
// ============================================================================

/** User review for a location */
interface Review {
  author: string
  rating: number
  date: string
  text: string
  helpful?: number
}

/** Popular times data with optional anomaly note */
interface PopularTimes {
  day: string
  hours: number[] // 24 values (0-100 scale) for each hour
  anomaly?: { hour: number; note: string }
}

/** Single step in directions with optional "weird" flag */
interface DirectionStep {
  instruction: string
  distance: string
  duration: string
  isWeird?: boolean // Highlighted in amber when true
}

/** Full location data structure */
interface Location {
  id: string
  name: string
  type: string
  address: string
  rating: number | '???' | null
  totalReviews: number
  hours: string
  hoursNote?: string
  noiseLevel?: string
  streetViewStatus: 'available' | 'unavailable' | 'signal_lost'
  streetViewNote?: string
  description: string
  highlights: string[]
  reviews: Review[]
  popularTimes?: PopularTimes
  directions: DirectionStep[]
  nearby: string[]
  specialNote?: string
  category: string
  website?: string
}

// ============================================================================
// Location Data - All the weird places in the engAIge universe
// ============================================================================


// ============================================================================
// Helper Components
// ============================================================================

/**
 * Star rating display component
 * Renders filled stars, optional half star, and empty stars
 */
function StarRating({ rating, size = 'md' }: { rating: number | '???' | null; size?: 'sm' | 'md' }) {
  if (rating === null) return <span className="text-gray-400">No rating</span>
  if (rating === '???') return <span className="text-gray-400">??? stars</span>

  const fullStars = Math.floor(rating)
  const hasHalf = rating % 1 >= 0.5

  return (
    <div className={`flex items-center gap-1 ${size === 'sm' ? 'text-sm' : ''}`}>
      <span className="text-yellow-500">
        {'★'.repeat(fullStars)}
        {hasHalf && '½'}
        {'☆'.repeat(5 - fullStars - (hasHalf ? 1 : 0))}
      </span>
      <span className="text-gray-600">{rating}</span>
    </div>
  )
}

/**
 * Popular times bar chart component
 * Shows 24 bars for each hour with current hour highlighted
 */
function PopularTimesChart({ data, theme }: { data: PopularTimes; theme: typeof site.theme }) {
  const currentHour = new Date().getHours()

  return (
    <div className="mt-4">
      <h4 className="font-medium mb-2" style={{ color: theme.text }}>Popular times</h4>
      <p className="text-sm mb-2" style={{ color: theme.textMuted }}>{data.day}</p>
      <div className="flex items-end gap-0.5 h-16">
        {data.hours.map((value, hour) => (
          <div
            key={hour}
            className="flex-1 rounded-t transition-all"
            style={{
              height: `${Math.max(value, 5)}%`,
              backgroundColor:
                hour === currentHour ? theme.primary :
                (data.anomaly?.hour === hour) ? '#ef4444' : '#e5e7eb',
            }}
            title={`${hour}:00 - ${value}% busy`}
          />
        ))}
      </div>
      <div className="flex justify-between text-xs mt-1" style={{ color: theme.textMuted }}>
        <span>12am</span>
        <span>6am</span>
        <span>12pm</span>
        <span>6pm</span>
        <span>12am</span>
      </div>
      {data.anomaly && (
        <p className="text-xs mt-2 p-2 rounded bg-red-50 text-red-800">{data.anomaly.note}</p>
      )}
    </div>
  )
}

/**
 * Street View preview component
 * Shows status (available/unavailable/signal_lost) with note
 */
function StreetViewPreview({ location, theme }: { location: Location; theme: typeof site.theme }) {
  const statusConfig = {
    available: { bg: '#f0fdf4', color: '#166534', label: 'Street View', icon: '📷' },
    unavailable: { bg: '#fef3c7', color: '#92400e', label: 'Unavailable', icon: '🚫' },
    signal_lost: { bg: '#fef2f2', color: '#991b1b', label: 'SIGNAL LOST', icon: '📡' },
  }[location.streetViewStatus]

  return (
    <div className="rounded-lg overflow-hidden" style={{ border: `1px solid ${theme.border}` }}>
      <div
        className={`h-24 flex items-center justify-center ${location.streetViewStatus === 'signal_lost' ? 'animate-pulse' : ''}`}
        style={{ backgroundColor: statusConfig.bg }}
      >
        <div className="text-center">
          <span className="text-3xl">{statusConfig.icon}</span>
          <p className="text-xs mt-1 font-medium" style={{ color: statusConfig.color }}>
            {statusConfig.label}
          </p>
        </div>
      </div>
      {location.streetViewNote && (
        <p className="text-xs p-2" style={{ color: theme.textMuted }}>
          {location.streetViewNote}
        </p>
      )}
    </div>
  )
}

/**
 * Directions panel component
 * Shows numbered steps with "weird" steps highlighted in amber
 */
function DirectionsPanel({ location, theme }: { location: Location; theme: typeof site.theme }) {
  return (
    <div className="space-y-2">
      <h4 className="font-medium" style={{ color: theme.text }}>Directions</h4>
      {location.directions.map((step, i) => (
        <div
          key={i}
          className="flex gap-2 p-2 rounded"
          style={{
            backgroundColor: step.isWeird ? '#fef3c7' : theme.surface,
            border: step.isWeird ? '1px solid #f59e0b' : 'none',
          }}
        >
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
            style={{ backgroundColor: theme.primary, color: 'white' }}
          >
            {i + 1}
          </div>
          <div className="flex-1">
            <p className="text-sm" style={{ color: step.isWeird ? '#92400e' : theme.text }}>
              {step.instruction}
            </p>
            {(step.distance || step.duration) && (
              <p className="text-xs" style={{ color: theme.textMuted }}>
                {step.distance} {step.distance && step.duration && '•'} {step.duration}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Location card for search results list
 */
function LocationCard({
  location,
  onClick,
  theme
}: {
  location: Location
  onClick: () => void
  theme: typeof site.theme
}) {
  const categoryIcons: Record<string, string> = {
    food: '☕',
    entertainment: '🎵',
    recreation: '🏃',
    office: '🏢',
    unknown: '❓',
    region: '🌽',
  }

  return (
    <button
      onClick={onClick}
      className="w-full text-left p-3 rounded-lg hover:shadow-md transition-shadow"
      style={{ backgroundColor: theme.surface, border: `1px solid ${theme.border}` }}
    >
      <div className="flex gap-3">
        <div
          className="w-12 h-12 rounded flex items-center justify-center text-xl shrink-0"
          style={{ backgroundColor: theme.background }}
        >
          {categoryIcons[location.category] || '📍'}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium truncate text-sm" style={{ color: theme.text }}>
            {location.name}
          </h3>
          <p className="text-xs" style={{ color: theme.textMuted }}>{location.type}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <StarRating rating={location.rating} size="sm" />
            <span className="text-xs" style={{ color: theme.textMuted }}>
              ({location.totalReviews})
            </span>
          </div>
        </div>
      </div>
    </button>
  )
}

/**
 * Full location detail view with tabs (overview, reviews, directions)
 */
function LocationDetail({
  location,
  onBack,
  onNavigate,
  theme
}: {
  location: Location
  onBack: () => void
  onNavigate: (appId: string) => void
  theme: typeof site.theme
}) {
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews' | 'directions'>('overview')

  return (
    <div className="h-full overflow-y-auto">
      {/* Header */}
      <div
        className="sticky top-0 z-10 p-3"
        style={{ backgroundColor: theme.surface, borderBottom: `1px solid ${theme.border}` }}
      >
        <button
          onClick={onBack}
          className="text-sm mb-2 hover:underline"
          style={{ color: theme.primary }}
        >
          ← Back to search
        </button>
        <h2 className="text-lg font-bold" style={{ color: theme.text }}>{location.name}</h2>
        <p className="text-xs" style={{ color: theme.textMuted }}>{location.type}</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b" style={{ borderColor: theme.border }}>
        {(['overview', 'reviews', 'directions'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="flex-1 py-2 text-xs font-medium capitalize"
            style={{
              color: activeTab === tab ? theme.primary : theme.textMuted,
              borderBottom: activeTab === tab ? `2px solid ${theme.primary}` : '2px solid transparent',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-3 space-y-4">
        {activeTab === 'overview' && (
          <>
            <div className="flex items-center gap-3">
              <StarRating rating={location.rating} />
              <span style={{ color: theme.textMuted }}>{location.totalReviews} reviews</span>
            </div>
            {location.specialNote && (
              <div className="p-2 rounded text-sm bg-amber-50 border border-amber-300 text-amber-800">
                {location.specialNote}
              </div>
            )}
            <div>
              <h4 className="font-medium text-sm" style={{ color: theme.text }}>Hours</h4>
              <p className="text-sm" style={{ color: theme.text }}>{location.hours}</p>
              {location.hoursNote && (
                <p className="text-xs" style={{ color: theme.textMuted }}>{location.hoursNote}</p>
              )}
            </div>
            {location.noiseLevel && (
              <div>
                <h4 className="font-medium text-sm" style={{ color: theme.text }}>Noise Level</h4>
                <p className="text-sm" style={{ color: theme.text }}>{location.noiseLevel}</p>
              </div>
            )}
            <StreetViewPreview location={location} theme={theme} />
            <div>
              <h4 className="font-medium text-sm" style={{ color: theme.text }}>About</h4>
              <p className="text-xs whitespace-pre-wrap" style={{ color: theme.text }}>
                {location.description}
              </p>
            </div>
            {location.highlights.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {location.highlights.map((h, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-full text-xs"
                    style={{ backgroundColor: `${theme.primary}15`, color: theme.primary }}
                  >
                    {h}
                  </span>
                ))}
              </div>
            )}
            {location.popularTimes && <PopularTimesChart data={location.popularTimes} theme={theme} />}
            <div>
              <h4 className="font-medium text-sm mb-1" style={{ color: theme.text }}>Areas of Interest</h4>
              <div className="flex flex-wrap gap-1">
                {location.nearby.slice(0, 6).map((p, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded text-xs"
                    style={{ backgroundColor: theme.background, color: theme.textMuted }}
                  >
                    {p}
                  </span>
                ))}
                {location.nearby.length > 6 && (
                  <span className="text-xs" style={{ color: theme.textMuted }}>
                    +{location.nearby.length - 6} more
                  </span>
                )}
              </div>
            </div>
            {location.website && (
              <Button
                onClick={() => onNavigate(location.website?.replace('www.', '').replace('.corn', '') || '')}
                backgroundColor={theme.primary}
                textColor="white"
                width="full"
                size="sm"
              >
                Visit Website
              </Button>
            )}
          </>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <StarRating rating={location.rating} />
              <span className="text-sm" style={{ color: theme.textMuted }}>
                {location.totalReviews} reviews
              </span>
            </div>
            {location.reviews.map((r, i) => (
              <StyledCard key={i} bgColor={theme.surface} borderColor={theme.border} padding="sm">
                <div className="flex justify-between mb-1">
                  <span className="font-medium text-sm" style={{ color: theme.text }}>
                    {r.author}
                  </span>
                  <span className="text-xs" style={{ color: theme.textMuted }}>{r.date}</span>
                </div>
                <StarRating rating={r.rating} size="sm" />
                <p className="text-xs mt-1" style={{ color: theme.text }}>{r.text}</p>
                {r.helpful && r.helpful > 0 && (
                  <p className="text-xs mt-1" style={{ color: theme.textMuted }}>
                    {r.helpful} people found this helpful
                  </p>
                )}
              </StyledCard>
            ))}
          </div>
        )}

        {activeTab === 'directions' && <DirectionsPanel location={location} theme={theme} />}
      </div>
    </div>
  )
}

// ============================================================================
// DB → Local Adapter
// ============================================================================

/**
 * Maps a SiteContentItem from the database to the local Location interface.
 * Metadata stores all the complex nested data (reviews, directions, popularTimes, etc.)
 */
function dbToLocation(item: SiteContentItem): Location {
  const m = item.metadata || {}
  return {
    id: item.slug,
    name: item.title,
    type: m.type || item.contentType || '',
    address: m.address || '',
    rating: m.rating ?? null,
    totalReviews: item.commentCount || m.totalReviews || 0,
    hours: m.hours || '',
    hoursNote: m.hoursNote,
    noiseLevel: m.noiseLevel,
    streetViewStatus: m.streetViewStatus || 'unavailable',
    streetViewNote: m.streetViewNote,
    description: item.body || '',
    highlights: item.tags || [],
    reviews: (m.reviews || []) as Review[],
    popularTimes: m.popularTimes as PopularTimes | undefined,
    directions: (m.directions || []) as DirectionStep[],
    nearby: (m.nearby || []) as string[],
    specialNote: item.subtitle || m.specialNote,
    category: item.category || m.category || 'unknown',
    website: m.website,
  }
}

// ============================================================================
// Map Marker Configuration
// ============================================================================

const MAP_MARKERS = [
  { id: 'hartwell-building', icon: '🏢', x: '30%', y: '25%', label: 'Hartwell' },
  { id: 'the-underground', icon: '🎵', x: '32%', y: '35%', label: 'Underground' },
  { id: 'quantum-brew-cafe', icon: '☕', x: '50%', y: '50%', label: 'Quantum Brew' },
  { id: 'trust-fall-tim-field', icon: '🏃', x: '65%', y: '60%', label: "Tim's Field" },
  { id: 'flying-j-847', icon: '⛽', x: '75%', y: '25%', label: 'Flying J #847' },
  { id: 'floor-13', icon: '❓', x: '35%', y: '15%', label: '???' },
  { id: 'nebraska', icon: '🌽', x: '80%', y: '70%', label: 'Nebraska' },
]

// ============================================================================
// Main Component
// ============================================================================

export function CornMapsSite({ siteId, onNavigate }: SiteProps) {
  const { content: dbContent } = useSiteContent('cornmaps')

  const locations = useMemo(() => dbContent.map(dbToLocation), [dbContent])

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)

  // Filter locations based on search query (name or type)
  const filteredLocations = searchQuery.trim()
    ? locations.filter(l =>
        l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.type.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : locations

  return (
    <div className="h-full flex" style={{ backgroundColor: site.theme.background }}>
      {/* Sidebar Panel */}
      <div
        className="w-80 h-full flex flex-col shrink-0"
        style={{ backgroundColor: site.theme.surface, borderRight: `1px solid ${site.theme.border}` }}
      >
        {/* Header with Logo and Search */}
        <div className="p-3" style={{ borderBottom: `1px solid ${site.theme.border}` }}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">🌽</span>
            <h1 className="text-lg font-bold" style={{ color: site.theme.primary }}>
              {site.name}
            </h1>
          </div>
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-full"
            style={{ backgroundColor: site.theme.background, border: `1px solid ${site.theme.border}` }}
          >
            <span>🔍</span>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search CornMaps"
              className="flex-1 bg-transparent outline-none text-sm"
              style={{ color: site.theme.text }}
            />
          </div>
        </div>

        {/* Results or Detail View */}
        <div className="flex-1 overflow-hidden">
          {selectedLocation ? (
            <LocationDetail
              location={selectedLocation}
              onBack={() => setSelectedLocation(null)}
              onNavigate={onNavigate}
              theme={site.theme}
            />
          ) : (
            <div className="h-full overflow-y-auto p-3 space-y-2">
              <p className="text-xs" style={{ color: site.theme.textMuted }}>
                {filteredLocations.length} result{filteredLocations.length !== 1 ? 's' : ''}
              </p>
              {filteredLocations.map(l => (
                <LocationCard
                  key={l.id}
                  location={l}
                  onClick={() => setSelectedLocation(l)}
                  theme={site.theme}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Map Area */}
      <div className="flex-1 relative" style={{ backgroundColor: '#e8f4e8' }}>
        {/* Grid pattern background */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(34,197,94,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(34,197,94,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />

        {/* Zoom controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <button
            className="w-8 h-8 rounded shadow flex items-center justify-center text-lg"
            style={{ backgroundColor: site.theme.surface }}
          >
            +
          </button>
          <button
            className="w-8 h-8 rounded shadow flex items-center justify-center text-lg"
            style={{ backgroundColor: site.theme.surface }}
          >
            -
          </button>
        </div>

        {/* Map markers */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-full h-full max-w-lg max-h-80">
            {MAP_MARKERS.map(marker => (
              <button
                key={marker.id}
                onClick={() => setSelectedLocation(locations.find(l => l.id === marker.id) || null)}
                className="absolute flex flex-col items-center group"
                style={{ left: marker.x, top: marker.y, transform: 'translate(-50%, -50%)' }}
              >
                <span
                  className={`text-xl group-hover:scale-125 transition-transform ${
                    marker.id === 'floor-13' ? 'animate-pulse' : ''
                  }`}
                >
                  {marker.icon}
                </span>
                <span
                  className={`text-xs px-1 rounded shadow ${
                    marker.id === 'floor-13' ? 'bg-red-100 text-red-800' :
                    marker.id === 'nebraska' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-white'
                  }`}
                  style={{
                    color: marker.id.match(/floor|nebraska/) ? undefined : site.theme.text
                  }}
                >
                  {marker.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Attribution */}
        <div
          className="absolute bottom-2 right-2 text-xs px-2 py-1 rounded"
          style={{ backgroundColor: 'rgba(255,255,255,0.9)', color: site.theme.textMuted }}
        >
          Map data 2024 CornMaps | Accuracy not guaranteed
        </div>

        {/* Tagline */}
        <div
          className="absolute bottom-2 left-2 text-xs px-2 py-1 rounded"
          style={{ backgroundColor: 'rgba(255,255,255,0.9)', color: site.theme.textMuted }}
        >
          🌽 "Every destination has something off about it"
        </div>
      </div>
    </div>
  )
}

export default CornMapsSite
