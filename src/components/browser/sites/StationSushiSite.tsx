/**
 * StationSushiSite
 *
 * Mildred Gasketsworth's definitive guide to gas station sushi.
 * A 67-year-old retired insurance adjuster who reviews gas station
 * sushi with the gravitas of a Michelin food critic.
 *
 * Rating system: Pumps (1-5 gas pump emojis)
 * Over 400 stations reviewed across the midwest.
 * Two hospitalizations (unrelated, she claims).
 */

import { useState, useMemo } from 'react'
import type { SiteProps } from '../BrowserSiteContainer.js'
import { FILLER_SITES } from '../../../config/filler-sites.js'
import { StyledCard, Button } from '../../ui/shared/index.js'
import { useSiteContent, type SiteContentItem } from '../../../hooks/useSiteContent.js'

const site = FILLER_SITES.stationsushi

// ============================================================================
// Types & Data
// ============================================================================

interface SushiReview {
  id: string
  stationName: string
  stationNumber: string
  location: string
  pumpNumber: number
  date: string
  rating: number // 1-5 pumps
  title: string
  excerpt: string
  content: string[]
  sushiType: string
  price: string
  wouldReturnFor: string
  geraldNote?: string // references to her late husband
}

// Hardcoded SUSHI_REVIEWS removed -- DB is the sole source of truth

const SIDEBAR_STATS = {
  stationsReviewed: 412,
  milesdriven: 47892,
  hospitalizations: 2,
  averageRating: 3.2,
}

const ABOUT_TEXT = `My name is Mildred Gasketsworth. I am 67 years old. For forty-three years, I assessed insurance claims - hail damage, flood damage, the occasional "my neighbor's tree fell on my gazebo" situation. I was good at my work. Methodical. Thorough.

When I retired in 2019, my late husband Gerald (rest his soul) suggested I "find a hobby." Gerald meant gardening or perhaps book club. Instead, I found my calling: documenting the overlooked art form of gas station sushi.

Big Grocery wants you to believe that sushi requires refrigerated cases with humidity control, trained staff, and "food safety standards." I am here to tell you that sushi can thrive next to motor oil displays and lottery ticket machines. The people deserve to know.

I have been hospitalized twice. Both incidents were unrelated to my work, despite what certain medical professionals claim. Correlation is not causation. I learned that in insurance training.

Gerald passed in 2023. He supported my passion, though his support often took the form of deep sighs and the phrase "Mildred, please." I continue this work in his memory. He would hate that.

This is not a hobby. This is a service.`

// ============================================================================
// DB Adapters
// ============================================================================

/** Adapt a DB SiteContentItem to the local SushiReview interface */
function dbToSushiReview(item: SiteContentItem): SushiReview {
  const m = item.metadata || {}
  return {
    id: item.slug,
    stationName: m.stationName || item.subtitle || '',
    stationNumber: m.stationNumber || '',
    location: m.location || '',
    pumpNumber: m.pumpNumber || 0,
    date: m.date || new Date((item.publishedAt || item.createdAt) * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    rating: m.rating ?? 3,
    title: item.title,
    excerpt: item.summary || m.excerpt || '',
    content: Array.isArray(m.content) ? m.content : (item.body ? item.body.split('\n\n') : []),
    sushiType: m.sushiType || '',
    price: m.price || '',
    wouldReturnFor: m.wouldReturnFor || '',
    geraldNote: m.geraldNote,
  }
}

// ============================================================================
// Components
// ============================================================================

/**
 * Render pump rating (gas pump emojis)
 */
function PumpRating({ rating }: { rating: number }) {
  const pumps = '⛽'.repeat(rating)
  const empty = '○'.repeat(5 - rating)
  return (
    <span className="font-mono tracking-wider">
      {pumps}<span className="opacity-30">{empty}</span>
    </span>
  )
}

/**
 * Individual review card for the list view
 */
function SushiReviewCard({ review, onSelect }: { review: SushiReview; onSelect: () => void }) {
  return (
    <StyledCard
      variant="default"
      padding="md"
      borderRadius="md"
      shadow="md"
      onClick={onSelect}
      className="mb-4 cursor-pointer"
      bgColor="#ffffff"
      borderColor="#0891B2"
      textColor="#0F172A"
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs text-cyan-600">{review.date}</span>
        <PumpRating rating={review.rating} />
      </div>
      <h2 className="text-lg font-bold text-slate-800 mb-2 hover:text-cyan-700">
        {review.title}
      </h2>
      <div className="flex gap-2 text-xs text-slate-500 mb-2">
        <span>{review.stationName} {review.stationNumber}</span>
        <span>|</span>
        <span>Pump #{review.pumpNumber}</span>
      </div>
      <p className="text-sm text-gray-600 mb-3 italic">{review.excerpt}</p>
      <div className="flex justify-between items-center text-xs text-slate-400">
        <span>{review.sushiType}</span>
        <span className="font-semibold text-orange-600">{review.price}</span>
      </div>
      {review.geraldNote && (
        <div className="mt-2 pt-2 border-t border-slate-100 text-xs text-slate-400 italic">
          Gerald's corner: "{review.geraldNote.substring(0, 60)}..."
        </div>
      )}
    </StyledCard>
  )
}

/**
 * Full review view
 */
function FullReview({ review, onBack }: { review: SushiReview; onBack: () => void }) {
  return (
    <StyledCard
      variant="default"
      padding="lg"
      borderRadius="md"
      shadow="md"
      className="mb-4"
      bgColor="#ffffff"
      borderColor="#0891B2"
      textColor="#0F172A"
    >
      <Button
        variant="link"
        size="sm"
        textColor="#0891B2"
        onClick={onBack}
        className="mb-4"
      >
        ← Back to reviews
      </Button>

      {/* Header */}
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs text-cyan-600">{review.date}</span>
        <PumpRating rating={review.rating} />
      </div>
      <h1 className="text-2xl font-bold text-slate-800 mb-2">{review.title}</h1>

      {/* Station Info Box */}
      <StyledCard
        variant="default"
        padding="md"
        borderRadius="sm"
        shadow="none"
        className="mb-4"
        bgColor="#F0FDFA"
        borderColor="#99F6E4"
        textColor="#0F172A"
      >
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-slate-500">Station:</span>{' '}
            <span className="font-semibold">{review.stationName} {review.stationNumber}</span>
          </div>
          <div>
            <span className="text-slate-500">Location:</span>{' '}
            <span className="font-semibold">{review.location}</span>
          </div>
          <div>
            <span className="text-slate-500">Pump Number:</span>{' '}
            <span className="font-semibold">#{review.pumpNumber}</span>
          </div>
          <div>
            <span className="text-slate-500">Price:</span>{' '}
            <span className="font-semibold text-orange-600">{review.price}</span>
          </div>
          <div className="col-span-2">
            <span className="text-slate-500">Order:</span>{' '}
            <span className="font-semibold">{review.sushiType}</span>
          </div>
        </div>
      </StyledCard>

      {/* Review Content */}
      <div className="prose prose-slate max-w-none">
        {review.content.map((para, i) => (
          <p key={i} className="text-gray-700 mb-4 text-sm leading-relaxed">
            {para}
          </p>
        ))}
      </div>

      {/* Gerald's Corner */}
      {review.geraldNote && (
        <StyledCard
          variant="default"
          padding="md"
          borderRadius="sm"
          shadow="none"
          className="mt-6"
          bgColor="#FEF3C7"
          borderColor="#FCD34D"
          textColor="#78350F"
        >
          <p className="font-bold text-amber-800 mb-2">Gerald's Corner</p>
          <p className="text-amber-700 text-sm italic">"{review.geraldNote}"</p>
          <p className="text-amber-600 text-xs mt-2">- In loving memory of Gerald Gasketsworth (1954-2023)</p>
        </StyledCard>
      )}

      {/* Would Return For */}
      <div className="mt-4 pt-4 border-t border-slate-100">
        <p className="text-sm">
          <span className="font-semibold text-cyan-700">Would return for:</span>{' '}
          <span className="text-slate-600 italic">{review.wouldReturnFor}</span>
        </p>
      </div>
    </StyledCard>
  )
}

// ============================================================================
// Main Site
// ============================================================================

export function StationSushiSite({ siteId }: SiteProps) {
  // Fetch from DB -- no fallback, DB is the sole source of truth
  const { content: dbContent } = useSiteContent('stationsushi')

  const sushiReviews = useMemo(() => dbContent.map(dbToSushiReview), [dbContent])

  const [selectedReview, setSelectedReview] = useState<SushiReview | null>(null)
  const [showAbout, setShowAbout] = useState(false)

  return (
    <div className="min-h-full" style={{ background: '#F8FAFC' }}>
      {/* Header */}
      <header className="bg-gradient-to-r from-cyan-700 to-teal-600 text-white py-6 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">🍣</span>
            <div>
              <h1 className="text-2xl font-bold">{site?.name || 'Station Sushi Review'}</h1>
              <p className="text-cyan-100 text-sm italic">
                "Fine Dining at the Fuel Pump"
              </p>
            </div>
          </div>
          <nav className="flex gap-4 mt-4 text-sm">
            <button
              onClick={() => { setSelectedReview(null); setShowAbout(false); }}
              className="text-cyan-100 hover:text-white"
            >
              Reviews
            </button>
            <button
              onClick={() => { setSelectedReview(null); setShowAbout(true); }}
              className="text-cyan-100 hover:text-white"
            >
              About Mildred
            </button>
            <button className="text-cyan-100 hover:text-white">Rating System</button>
            <button className="text-cyan-100 hover:text-white">Contact (Limited)</button>
          </nav>
        </div>
      </header>

      {/* Announcement Bar */}
      <div className="bg-orange-100 border-b border-orange-200 py-2 px-4">
        <p className="text-center text-sm text-orange-800">
          ⛽ <strong>412 stations reviewed</strong> across the heartland |
          Big Grocery doesn't want you to see this |
          <span className="italic"> Gerald would disapprove</span>
        </p>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Reviews Column */}
          <div className="flex-1">
            {showAbout ? (
              <StyledCard
                variant="default"
                padding="lg"
                borderRadius="md"
                shadow="md"
                bgColor="#ffffff"
                borderColor="#0891B2"
                textColor="#0F172A"
              >
                <h2 className="text-xl font-bold text-slate-800 mb-4">About Mildred Gasketsworth</h2>
                <div className="flex gap-4 mb-4">
                  <div className="text-6xl">👵</div>
                  <div>
                    <p className="font-bold text-slate-800">Mildred Gasketsworth</p>
                    <p className="text-sm text-slate-600">Gas Station Sushi Critic</p>
                    <p className="text-xs text-slate-500">Retired Insurance Adjuster (43 years)</p>
                    <p className="text-xs text-slate-400">Widow of Gerald (1954-2023)</p>
                  </div>
                </div>
                <div className="text-sm text-gray-700 whitespace-pre-line">
                  {ABOUT_TEXT}
                </div>
                <StyledCard
                  variant="default"
                  padding="md"
                  borderRadius="sm"
                  shadow="none"
                  className="mt-4"
                  bgColor="#F0FDFA"
                  borderColor="#99F6E4"
                  textColor="#0F172A"
                >
                  <p className="font-bold text-cyan-800">Career Statistics</p>
                  <ul className="text-cyan-700 text-xs mt-2">
                    <li>• {SIDEBAR_STATS.stationsReviewed} gas stations reviewed</li>
                    <li>• {SIDEBAR_STATS.milesdriven.toLocaleString()} miles driven for research</li>
                    <li>• {SIDEBAR_STATS.hospitalizations} hospitalizations (unrelated)</li>
                    <li>• {SIDEBAR_STATS.averageRating}/5 average pump rating</li>
                    <li>• 1 husband lost (not to sushi, cardiac event)</li>
                    <li>• 0 regrets</li>
                  </ul>
                </StyledCard>
              </StyledCard>
            ) : selectedReview ? (
              <FullReview review={selectedReview} onBack={() => setSelectedReview(null)} />
            ) : (
              <>
                <StyledCard
                  variant="default"
                  padding="md"
                  borderRadius="md"
                  shadow="none"
                  className="mb-4"
                  bgColor="#F0FDFA"
                  borderColor="#99F6E4"
                  textColor="#0F172A"
                >
                  <p className="text-cyan-800 text-sm">
                    🍣 <strong>Latest:</strong> Flying J #847 achieves perfect 5-pump rating.
                    Big Mike from Tulsa witnesses my tears of joy. The pilgrimage continues.
                  </p>
                </StyledCard>
                {sushiReviews.map(review => (
                  <SushiReviewCard
                    key={review.id}
                    review={review}
                    onSelect={() => setSelectedReview(review)}
                  />
                ))}
              </>
            )}
          </div>

          {/* Sidebar */}
          <aside className="w-64 hidden md:block">
            {/* Rating System */}
            <StyledCard
              variant="default"
              padding="md"
              borderRadius="md"
              shadow="md"
              className="mb-4"
              bgColor="#ffffff"
              borderColor="#0891B2"
              textColor="#0F172A"
            >
              <h3 className="font-bold text-slate-800 mb-2">⛽ Pump Rating System</h3>
              <div className="text-xs space-y-1">
                <p><span className="font-mono">⛽⛽⛽⛽⛽</span> - Transcendent</p>
                <p><span className="font-mono">⛽⛽⛽⛽○</span> - Exceptional</p>
                <p><span className="font-mono">⛽⛽⛽○○</span> - Adequate</p>
                <p><span className="font-mono">⛽⛽○○○</span> - Disappointing</p>
                <p><span className="font-mono">⛽○○○○</span> - Hostile to joy</p>
              </div>
            </StyledCard>

            {/* Newsletter */}
            <StyledCard
              variant="default"
              padding="md"
              borderRadius="md"
              shadow="md"
              className="mb-4"
              bgColor="#ffffff"
              borderColor="#0891B2"
              textColor="#0F172A"
            >
              <h3 className="font-bold text-slate-800 mb-2">📬 The Pump Report</h3>
              <p className="text-xs text-gray-600 mb-2">
                Weekly reviews delivered to your inbox. My daughter Amanda says I have "too much time on my hands." Subscribe to prove her wrong.
              </p>
              <input
                type="email"
                placeholder="your@email.com"
                className="w-full px-2 py-1 text-sm border rounded mb-2"
              />
              <Button
                variant="primary"
                size="sm"
                width="full"
                backgroundColor="#0891B2"
                textColor="#ffffff"
              >
                Subscribe
              </Button>
            </StyledCard>

            {/* Gerald's Memory */}
            <StyledCard
              variant="default"
              padding="md"
              borderRadius="md"
              shadow="md"
              className="mb-4"
              bgColor="#FEF3C7"
              borderColor="#FCD34D"
              textColor="#78350F"
            >
              <h3 className="font-bold text-amber-800 mb-2">In Memoriam</h3>
              <p className="text-xs text-amber-700 italic">
                "Mildred, for the love of God, just eat at a restaurant."
              </p>
              <p className="text-xs text-amber-600 mt-2">
                - Gerald Gasketsworth, every day of our marriage (1978-2023)
              </p>
              <p className="text-xs text-amber-500 mt-2">
                He did not support my passion. But his skepticism fueled my determination. Rest well, Gerald.
              </p>
            </StyledCard>

            {/* Big Grocery Warning */}
            <StyledCard
              variant="default"
              padding="md"
              borderRadius="md"
              shadow="md"
              className="mb-4"
              bgColor="#FEF2F2"
              borderColor="#FCA5A5"
              textColor="#7F1D1D"
            >
              <h3 className="font-bold text-red-800 mb-2">⚠️ Big Grocery Alert</h3>
              <p className="text-xs text-red-700">
                The grocery store sushi industry does NOT want you to know that
                comparable sushi exists at your local fuel station. They have lobbied
                against my research. They have sent cease and desist letters (3).
                I will not be silenced.
              </p>
            </StyledCard>

            {/* Medical Disclaimer */}
            <StyledCard
              variant="default"
              padding="md"
              borderRadius="md"
              shadow="md"
              bgColor="#ffffff"
              borderColor="#E2E8F0"
              textColor="#64748B"
            >
              <h3 className="font-bold text-slate-500 mb-2">Medical Disclaimer</h3>
              <p className="text-xs text-slate-400">
                The author has been hospitalized twice following gas station sushi
                consumption. Both incidents were determined to be "unrelated" by the
                author, though not by her medical team. Consume at your own risk.
                The author's gastroenterologist, Dr. Patel, has formally requested
                to not be mentioned on this website.
              </p>
            </StyledCard>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-cyan-700 to-teal-600 text-cyan-100 py-4 px-4 text-center text-xs">
        <p>© 2026 {site?.name || 'Station Sushi Review'}. All rights reserved.</p>
        <p className="mt-1">
          Not affiliated with any gas station chain, sushi restaurant, or medical facility.
        </p>
        <p className="mt-1 italic">
          "The people's sushi critic" - Self-described
        </p>
      </footer>
    </div>
  )
}

export default StationSushiSite
