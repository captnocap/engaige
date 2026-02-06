/**
 * KernelPods Site
 *
 * A podcast platform where every show is somehow corn-adjacent or features
 * recurring lore characters. Clean podcast app aesthetic with episode listings,
 * ratings, reviews, and plenty of interconnected world-building.
 *
 * Features shows from Trust Fall Tim, Derek Observerson, Mildred Gasketsworth,
 * and mysterious anonymous hosts investigating the Hartwell Building.
 */

import { useState, useEffect, useRef, useMemo } from 'react'
import type { SiteProps } from '../BrowserSiteContainer.js'
import { StyledCard, Button } from '../../ui/shared/index.js'
import { useSiteContent, type SiteContentItem } from '../../../hooks/useSiteContent.js'

// ============================================================================
// Types & Data
// ============================================================================

interface Episode {
  id: string
  number: number
  title: string
  duration: string
  releaseDate: string
  description: string
  downloads: number
  hasTranscript?: boolean
}

interface Review {
  id: string
  author: string
  rating: number
  date: string
  content: string
}

interface Podcast {
  id: string
  title: string
  host: string
  hostBio: string
  coverEmoji: string
  category: 'true-crime' | 'lifestyle' | 'self-help' | 'business' | 'food' | 'conspiracy'
  rating: number
  totalDownloads: number
  reviewCount: number
  description: string
  tagline: string
  episodes: Episode[]
  reviews: Review[]
  featured?: boolean
}

const CATEGORIES = {
  'true-crime': { name: 'True Crime', icon: '🔍', color: '#7C3AED' },
  'lifestyle': { name: 'Lifestyle', icon: '☕', color: '#D97706' },
  'self-help': { name: 'Self-Help', icon: '🧘', color: '#059669' },
  'business': { name: 'Business', icon: '💼', color: '#2563EB' },
  'food': { name: 'Food', icon: '🍣', color: '#DC2626' },
  'conspiracy': { name: 'Conspiracy', icon: '👁️', color: '#7F1D1D' },
}

// (Hardcoded podcasts removed -- database is the sole source of truth)

// ============================================================================
// Components
// ============================================================================

/**
 * Star rating display component
 */
function StarRating({ rating }: { rating: number }) {
  const fullStars = Math.floor(rating)
  const hasHalf = rating % 1 >= 0.5
  return (
    <span className="text-yellow-500">
      {'★'.repeat(fullStars)}
      {hasHalf && '½'}
      <span className="text-gray-300">{'★'.repeat(5 - Math.ceil(rating))}</span>
      <span className="ml-1 text-sm text-gray-600">{rating.toFixed(1)}</span>
    </span>
  )
}

/**
 * Category badge component
 */
function CategoryBadge({ category }: { category: Podcast['category'] }) {
  const cat = CATEGORIES[category]
  return (
    <span
      className="text-xs px-2 py-0.5 rounded-full font-medium"
      style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
    >
      {cat.icon} {cat.name}
    </span>
  )
}

/**
 * Format download count for display
 */
function formatDownloads(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(0)}K`
  return num.toString()
}

/**
 * Podcast card for browse view
 */
function PodcastCard({
  podcast,
  onSelect,
}: {
  podcast: Podcast
  onSelect: () => void
}) {
  return (
    <StyledCard
      variant="default"
      padding="md"
      borderRadius="lg"
      shadow="md"
      onClick={onSelect}
      className="cursor-pointer hover:shadow-lg transition-shadow"
      bgColor="#ffffff"
      borderColor="#E5E7EB"
      textColor="#111827"
    >
      <div className="flex gap-4">
        <div
          className="w-20 h-20 rounded-lg flex items-center justify-center text-4xl flex-shrink-0"
          style={{ backgroundColor: `${CATEGORIES[podcast.category].color}15` }}
        >
          {podcast.coverEmoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-gray-900 truncate">{podcast.title}</h3>
            {podcast.featured && (
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full flex-shrink-0">
                Featured
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 truncate">{podcast.host}</p>
          <div className="flex items-center gap-2 mt-1">
            <StarRating rating={podcast.rating} />
            <span className="text-xs text-gray-400">({podcast.reviewCount})</span>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <CategoryBadge category={podcast.category} />
            <span className="text-xs text-gray-400">
              {formatDownloads(podcast.totalDownloads)} downloads
            </span>
          </div>
        </div>
      </div>
    </StyledCard>
  )
}

/**
 * Episode list item
 */
function EpisodeItem({
  episode,
  onSelect,
}: {
  episode: Episode
  onSelect: () => void
}) {
  return (
    <div
      onClick={onSelect}
      className="flex items-center gap-4 p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 cursor-pointer"
    >
      <button className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0 hover:bg-purple-700">
        <span className="text-white text-sm">▶</span>
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">EP {episode.number}</span>
          {episode.hasTranscript && (
            <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
              Transcript
            </span>
          )}
        </div>
        <h4 className="font-medium text-gray-900 truncate">{episode.title}</h4>
        <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
          <span>{episode.duration}</span>
          <span>{episode.releaseDate}</span>
          <span>{formatDownloads(episode.downloads)} plays</span>
        </div>
      </div>
    </div>
  )
}

/**
 * Review card component
 */
function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="border-b border-gray-100 last:border-0 py-3">
      <div className="flex items-center justify-between mb-1">
        <span className="font-medium text-gray-900">{review.author}</span>
        <span className="text-xs text-gray-400">{review.date}</span>
      </div>
      <div className="text-yellow-500 text-sm mb-2">
        {'★'.repeat(review.rating)}
        <span className="text-gray-300">{'★'.repeat(5 - review.rating)}</span>
      </div>
      <p className="text-sm text-gray-600">{review.content}</p>
    </div>
  )
}

/**
 * Podcast detail view
 */
function PodcastDetail({
  podcast,
  onBack,
  onSelectEpisode,
}: {
  podcast: Podcast
  onBack: () => void
  onSelectEpisode: (ep: Episode) => void
}) {
  const [activeTab, setActiveTab] = useState<'episodes' | 'reviews'>('episodes')

  return (
    <div>
      <Button
        variant="link"
        size="sm"
        textColor="#7C3AED"
        onClick={onBack}
        className="mb-4"
      >
        Back to Browse
      </Button>

      {/* Header */}
      <div className="flex gap-6 mb-6">
        <div
          className="w-32 h-32 rounded-xl flex items-center justify-center text-6xl flex-shrink-0"
          style={{ backgroundColor: `${CATEGORIES[podcast.category].color}15` }}
        >
          {podcast.coverEmoji}
        </div>
        <div className="flex-1">
          <CategoryBadge category={podcast.category} />
          <h1 className="text-2xl font-bold text-gray-900 mt-2">{podcast.title}</h1>
          <p className="text-gray-600">{podcast.host}</p>
          <div className="flex items-center gap-4 mt-2">
            <StarRating rating={podcast.rating} />
            <span className="text-sm text-gray-500">
              {podcast.reviewCount} reviews
            </span>
            <span className="text-sm text-gray-500">
              {formatDownloads(podcast.totalDownloads)} downloads
            </span>
          </div>
          <p className="text-sm text-gray-600 italic mt-2">"{podcast.tagline}"</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mb-6">
        <Button
          variant="primary"
          size="md"
          backgroundColor="#7C3AED"
          textColor="#ffffff"
          className="flex items-center gap-2"
        >
          <span>▶</span> Latest Episode
        </Button>
        <Button
          variant="outline"
          size="md"
          borderColor="#7C3AED"
          textColor="#7C3AED"
        >
          + Subscribe
        </Button>
        <Button
          variant="outline"
          size="md"
          borderColor="#E5E7EB"
          textColor="#6B7280"
        >
          Share
        </Button>
      </div>

      {/* Description */}
      <StyledCard
        variant="default"
        padding="md"
        borderRadius="lg"
        shadow="none"
        className="mb-6"
        bgColor="#F9FAFB"
        borderColor="#E5E7EB"
        textColor="#374151"
      >
        <h3 className="font-bold text-gray-900 mb-2">About</h3>
        <p className="text-sm">{podcast.description}</p>
        <div className="mt-3 pt-3 border-t border-gray-200">
          <h4 className="font-medium text-gray-900 text-sm mb-1">Host</h4>
          <p className="text-sm text-gray-600">{podcast.hostBio}</p>
        </div>
      </StyledCard>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-4">
        <button
          onClick={() => setActiveTab('episodes')}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'episodes'
              ? 'text-purple-600 border-b-2 border-purple-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Episodes ({podcast.episodes.length})
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'reviews'
              ? 'text-purple-600 border-b-2 border-purple-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Reviews ({podcast.reviews.length})
        </button>
      </div>

      {/* Content */}
      {activeTab === 'episodes' ? (
        <StyledCard
          variant="default"
          padding="none"
          borderRadius="lg"
          shadow="sm"
          bgColor="#ffffff"
          borderColor="#E5E7EB"
          textColor="#111827"
        >
          {podcast.episodes.map((ep) => (
            <EpisodeItem key={ep.id} episode={ep} onSelect={() => onSelectEpisode(ep)} />
          ))}
        </StyledCard>
      ) : (
        <div className="space-y-2">
          {podcast.reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * Episode detail view
 */
function EpisodeDetail({
  podcast,
  episode,
  onBack,
}: {
  podcast: Podcast
  episode: Episode
  onBack: () => void
}) {
  return (
    <div>
      <Button
        variant="link"
        size="sm"
        textColor="#7C3AED"
        onClick={onBack}
        className="mb-4"
      >
        Back to {podcast.title}
      </Button>

      <StyledCard
        variant="default"
        padding="lg"
        borderRadius="lg"
        shadow="md"
        bgColor="#ffffff"
        borderColor="#E5E7EB"
        textColor="#111827"
      >
        {/* Episode Header */}
        <div className="flex gap-4 mb-6">
          <div
            className="w-24 h-24 rounded-lg flex items-center justify-center text-4xl flex-shrink-0"
            style={{ backgroundColor: `${CATEGORIES[podcast.category].color}15` }}
          >
            {podcast.coverEmoji}
          </div>
          <div className="flex-1">
            <span className="text-xs text-gray-500">
              {podcast.title} - Episode {episode.number}
            </span>
            <h1 className="text-xl font-bold text-gray-900 mt-1">{episode.title}</h1>
            <div className="flex items-center gap-3 text-sm text-gray-500 mt-2">
              <span>{episode.duration}</span>
              <span>{episode.releaseDate}</span>
              <span>{formatDownloads(episode.downloads)} plays</span>
            </div>
          </div>
        </div>

        {/* Player Mock */}
        <div className="bg-gray-100 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-4">
            <button className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center hover:bg-purple-700">
              <span className="text-white text-lg">▶</span>
            </button>
            <div className="flex-1">
              <div className="h-2 bg-gray-200 rounded-full">
                <div className="h-2 bg-purple-600 rounded-full w-0"></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0:00</span>
                <span>{episode.duration}</span>
              </div>
            </div>
          </div>
          <div className="flex justify-center gap-4 mt-3">
            <button className="text-gray-500 text-sm hover:text-gray-700">⏪ 15s</button>
            <button className="text-gray-500 text-sm hover:text-gray-700">1x Speed</button>
            <button className="text-gray-500 text-sm hover:text-gray-700">15s ⏩</button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-6">
          <Button
            variant="outline"
            size="sm"
            borderColor="#E5E7EB"
            textColor="#6B7280"
          >
            Download
          </Button>
          <Button
            variant="outline"
            size="sm"
            borderColor="#E5E7EB"
            textColor="#6B7280"
          >
            Share
          </Button>
          {episode.hasTranscript && (
            <Button
              variant="outline"
              size="sm"
              borderColor="#E5E7EB"
              textColor="#6B7280"
            >
              View Transcript
            </Button>
          )}
        </div>

        {/* Description */}
        <div>
          <h3 className="font-bold text-gray-900 mb-2">Episode Description</h3>
          <p className="text-gray-600">{episode.description}</p>
        </div>
      </StyledCard>
    </div>
  )
}

/**
 * Top Charts sidebar
 */
function TopCharts({ onSelectPodcast }: { onSelectPodcast: (p: Podcast) => void }) {
  const topPodcasts = [...PODCASTS]
    .sort((a, b) => b.totalDownloads - a.totalDownloads)
    .slice(0, 5)

  return (
    <StyledCard
      variant="default"
      padding="md"
      borderRadius="lg"
      shadow="md"
      bgColor="#ffffff"
      borderColor="#E5E7EB"
      textColor="#111827"
    >
      <h3 className="font-bold text-gray-900 mb-3">Top Charts</h3>
      <div className="space-y-3">
        {topPodcasts.map((podcast, index) => (
          <div
            key={podcast.id}
            onClick={() => onSelectPodcast(podcast)}
            className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 -mx-2 rounded"
          >
            <span className="text-lg font-bold text-gray-300 w-6">{index + 1}</span>
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
              style={{ backgroundColor: `${CATEGORIES[podcast.category].color}15` }}
            >
              {podcast.coverEmoji}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 text-sm truncate">{podcast.title}</p>
              <p className="text-xs text-gray-500 truncate">{podcast.host}</p>
            </div>
          </div>
        ))}
      </div>
    </StyledCard>
  )
}

/**
 * Category filter buttons
 */
function CategoryFilter({
  activeCategory,
  onSelect,
}: {
  activeCategory: string | null
  onSelect: (cat: string | null) => void
}) {
  return (
    <div className="flex gap-2 flex-wrap mb-6">
      <button
        onClick={() => onSelect(null)}
        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
          activeCategory === null
            ? 'bg-purple-600 text-white'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        All
      </button>
      {Object.entries(CATEGORIES).map(([key, cat]) => (
        <button
          key={key}
          onClick={() => onSelect(key)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            activeCategory === key
              ? 'text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          style={activeCategory === key ? { backgroundColor: cat.color } : {}}
        >
          {cat.icon} {cat.name}
        </button>
      ))}
    </div>
  )
}

// ============================================================================
// DB Content Adapter
// ============================================================================

/**
 * Maps a DB SiteContentItem to the local Podcast interface.
 * Episodes, reviews, host info, and category are pulled from metadata.
 */
function dbToPodcast(item: SiteContentItem): Podcast {
  const m = item.metadata as Record<string, unknown> || {}
  return {
    id: item.slug || item.id,
    title: item.title || 'Untitled Podcast',
    host: (m.host ?? m.hostName ?? '') as string,
    hostBio: (m.hostBio ?? m.host_bio ?? '') as string,
    coverEmoji: item.thumbnailEmoji || (m.coverEmoji ?? m.cover_emoji ?? '🎙️') as string,
    category: (m.category ?? item.category ?? 'lifestyle') as Podcast['category'],
    rating: Number(m.rating ?? item.likeCount ?? 0),
    totalDownloads: Number(m.totalDownloads ?? m.total_downloads ?? item.viewCount ?? 0),
    reviewCount: Number(m.reviewCount ?? m.review_count ?? 0),
    description: item.summary || item.body || (m.description as string) || '',
    tagline: (m.tagline ?? '') as string,
    featured: item.isFeatured || (m.featured as boolean) || false,
    episodes: Array.isArray(m.episodes) ? (m.episodes as Episode[]) : [],
    reviews: Array.isArray(m.reviews) ? (m.reviews as Review[]) : [],
  }
}

// ============================================================================
// Main Site Component
// ============================================================================

export function KernelPodsSite({ path, onPathChange }: SiteProps) {
  const { content: dbContent } = useSiteContent('kernelpods')

  const podcasts = useMemo(() => dbContent.map(dbToPodcast), [dbContent])

  const [selectedPodcast, setSelectedPodcast] = useState<Podcast | null>(null)
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  // Track if we're updating from path (to avoid triggering onPathChange)
  const isUpdatingFromPath = useRef(false)

  // Parse path and update state when path changes (from browser back/forward)
  useEffect(() => {
    isUpdatingFromPath.current = true

    if (!path || path === '/') {
      // Homepage
      setSelectedPodcast(null)
      setSelectedEpisode(null)
    } else if (path.startsWith('/show/')) {
      // Show or episode path: /show/podcast-id or /show/podcast-id/episode/episode-id
      const pathParts = path.slice(6).split('/episode/')
      const podcastId = pathParts[0]
      const episodeId = pathParts[1] || null

      const podcast = podcasts.find((p) => p.id === podcastId)
      if (podcast) {
        setSelectedPodcast(podcast)
        if (episodeId) {
          const episode = podcast.episodes.find((e) => e.id === episodeId)
          setSelectedEpisode(episode || null)
        } else {
          setSelectedEpisode(null)
        }
      } else {
        // Podcast not found, go to homepage
        setSelectedPodcast(null)
        setSelectedEpisode(null)
      }
    } else if (path.startsWith('/episode/')) {
      // Direct episode path: /episode/episode-id (search all podcasts for the episode)
      const episodeId = path.slice(9)
      let foundPodcast: Podcast | null = null
      let foundEpisode: Episode | null = null

      for (const podcast of podcasts) {
        const episode = podcast.episodes.find((e) => e.id === episodeId)
        if (episode) {
          foundPodcast = podcast
          foundEpisode = episode
          break
        }
      }

      if (foundPodcast && foundEpisode) {
        setSelectedPodcast(foundPodcast)
        setSelectedEpisode(foundEpisode)
      } else {
        // Episode not found, go to homepage
        setSelectedPodcast(null)
        setSelectedEpisode(null)
      }
    }

    // Reset flag after state updates
    setTimeout(() => {
      isUpdatingFromPath.current = false
    }, 0)
  }, [path, podcasts])

  // Filter podcasts by category
  const filteredPodcasts = activeCategory
    ? podcasts.filter((p) => p.category === activeCategory)
    : podcasts

  // Handle navigation
  const handleSelectPodcast = (podcast: Podcast) => {
    if (isUpdatingFromPath.current) return
    setSelectedPodcast(podcast)
    setSelectedEpisode(null)
    onPathChange?.(`/show/${podcast.id}`)
  }

  const handleSelectEpisode = (episode: Episode) => {
    if (isUpdatingFromPath.current) return
    setSelectedEpisode(episode)
    onPathChange?.(`/show/${selectedPodcast?.id}/episode/${episode.id}`)
  }

  const handleBack = () => {
    if (isUpdatingFromPath.current) return
    if (selectedEpisode) {
      setSelectedEpisode(null)
      onPathChange?.(`/show/${selectedPodcast?.id}`)
    } else {
      setSelectedPodcast(null)
      onPathChange?.(null)
    }
  }

  return (
    <div className="min-h-full" style={{ background: '#F9FAFB' }}>
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-700 to-purple-900 text-white py-6 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-4xl">🌽</span>
              <div>
                <h1 className="text-2xl font-bold">KernelPods</h1>
                <p className="text-purple-200 text-sm">Where every story has a kernel of truth</p>
              </div>
            </div>
            <nav className="hidden md:flex gap-4 text-sm">
              <button
                onClick={() => {
                  setSelectedPodcast(null)
                  setSelectedEpisode(null)
                  onPathChange?.(null)
                }}
                className="text-purple-200 hover:text-white"
              >
                Browse
              </button>
              <button className="text-purple-200 hover:text-white">Library</button>
              <button className="text-purple-200 hover:text-white">Search</button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Main Column */}
          <div className="flex-1">
            {selectedEpisode && selectedPodcast ? (
              <EpisodeDetail
                podcast={selectedPodcast}
                episode={selectedEpisode}
                onBack={handleBack}
              />
            ) : selectedPodcast ? (
              <PodcastDetail
                podcast={selectedPodcast}
                onBack={handleBack}
                onSelectEpisode={handleSelectEpisode}
              />
            ) : (
              <>
                {/* Featured Banner */}
                <StyledCard
                  variant="default"
                  padding="lg"
                  borderRadius="lg"
                  shadow="md"
                  className="mb-6"
                  bgColor="linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)"
                  borderColor="transparent"
                  textColor="#ffffff"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-6xl">🎧</span>
                    <div>
                      <p className="text-purple-200 text-sm">Featured This Week</p>
                      <h2 className="text-xl font-bold">The 13th Floor: New Episode Out Now</h2>
                      <p className="text-purple-200 text-sm mt-1">
                        "The Hartwell Disappearances" - 847K downloads and counting
                      </p>
                      <Button
                        variant="primary"
                        size="sm"
                        backgroundColor="#ffffff"
                        textColor="#7C3AED"
                        className="mt-3"
                        onClick={() => handleSelectPodcast(podcasts[0])}
                      >
                        Listen Now
                      </Button>
                    </div>
                  </div>
                </StyledCard>

                {/* Category Filter */}
                <CategoryFilter
                  activeCategory={activeCategory}
                  onSelect={setActiveCategory}
                />

                {/* Podcast Grid */}
                <div className="space-y-4">
                  {filteredPodcasts.map((podcast) => (
                    <PodcastCard
                      key={podcast.id}
                      podcast={podcast}
                      onSelect={() => handleSelectPodcast(podcast)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Sidebar */}
          <aside className="w-72 hidden lg:block space-y-4">
            <TopCharts onSelectPodcast={handleSelectPodcast} />

            {/* Ad Card */}
            <StyledCard
              variant="default"
              padding="md"
              borderRadius="lg"
              shadow="md"
              bgColor="#FEF3C7"
              borderColor="#F59E0B"
              textColor="#78350F"
            >
              <p className="text-xs text-amber-600 mb-1">SPONSORED</p>
              <p className="font-bold text-amber-800">Quantum Coffee Co.</p>
              <p className="text-sm text-amber-700 mt-1">
                "The only coffee where observation matters."
              </p>
              <p className="text-xs text-amber-600 mt-2">$47/cup | Worth every penny - Derek</p>
            </StyledCard>

            {/* Network Notice */}
            <StyledCard
              variant="default"
              padding="md"
              borderRadius="lg"
              shadow="md"
              bgColor="#F3F4F6"
              borderColor="#E5E7EB"
              textColor="#374151"
            >
              <h3 className="font-bold text-gray-900 mb-2">KernelPods Network</h3>
              <p className="text-xs text-gray-600">
                KernelPods is a division of the .corn domain ecosystem. All podcasts
                are independently produced. Omnicorp Holdings has no editorial control
                over content. We are required to state this.
              </p>
              <p className="text-xs text-gray-400 mt-2 italic">
                "The corn connects us all."
              </p>
            </StyledCard>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-6 px-4 mt-8">
        <div className="max-w-5xl mx-auto text-center text-sm">
          <p className="font-bold text-white mb-2">KernelPods</p>
          <p>www.kernelpods.corn</p>
          <p className="mt-2">
            Podcasts for the corn-curious. News for the corn-convinced.
          </p>
          <div className="flex justify-center gap-4 mt-4 text-xs">
            <span>Terms of Service</span>
            <span>Privacy Policy</span>
            <span>Content Guidelines</span>
            <span>Advertise</span>
          </div>
          <p className="mt-4 text-xs text-gray-500">
            Not affiliated with Big Corn. We think.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default KernelPodsSite
