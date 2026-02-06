/**
 * BenchWatch Site
 *
 * A forensic bench review site by Greg Mantooth, retired CPA.
 * He reviews public benches with the same rigor he once applied
 * to corporate fraud investigations. Peak "this is my calling" energy.
 */

import { useState, useMemo } from 'react'
import type { SiteProps } from '../BrowserSiteContainer.js'
import { FILLER_SITES } from '../../../config/filler-sites.js'
import { StyledCard, Button } from '../../ui/shared/index.js'
import { useSiteContent, type SiteContentItem } from '../../../hooks/useSiteContent.js'

const site = FILLER_SITES.benchwatch

// ============================================================================
// Types & Data
// ============================================================================

interface BenchReview {
  id: string
  title: string
  location: string
  date: string
  mciScore: number // Mantooth Comfort Index (1-100)
  excerpt: string
  content: string[]
  tags: string[]
  measurements: {
    slatWidth: string
    backAngle: string
    seatHeight: string
    armrestPresent: boolean
    materialGrade: string
  }
  phantomSitterAlert?: boolean
  fraudAlert?: boolean
}

// Hardcoded BENCH_REVIEWS removed -- DB is the sole source of truth

const SIDEBAR_RESOURCES = [
  { title: 'The Mantooth Comfort Index (MCI) White Paper', price: '$14.99' },
  { title: 'Portable Lumbar Assessment Kit', price: '$89.99' },
  { title: 'FOIA Request Template Pack (47 templates)', price: '$29.99' },
  { title: 'The Phantom Sitter: A Case File', price: '$9.99' },
  { title: 'Bench Fraud Reporting Guide', price: 'FREE' },
]

const ABOUT_TEXT = `My name is Greg Mantooth. For 34 years, I investigated corporate fraud for the IRS. I thought retirement would be peaceful. I was wrong.

In 2021, I sat on a bench in Memorial Park and experienced what can only be described as "structural betrayal." The back angle was wrong. The slat gaps were wrong. Everything was wrong. I went home that night and began what would become BenchWatch.

Since then, I have assessed 847 public benches across 12 counties. I have filed 47 formal complaints with municipal governments. I have been banned from 3 parks for "unauthorized bench modifications" (the modifications were IMPROVEMENTS). I have been divorced once (unrelated) (mostly).

The Phantom Sitter thinks they can stop me. They cannot. Janet thinks I've "lost the plot." I have found the plot. The plot is that public seating in this country is a SCANDAL and someone needs to say it.

That someone is me.

Equipment I carry: Portable cushion pressure gauge, slat gap caliper, infrared thermometer, lumbar curvature template, moisture meter, and a folding chair (for comparison purposes).`

// ============================================================================
// DB Adapters
// ============================================================================

/** Adapt a DB SiteContentItem to the local BenchReview interface */
function dbToBenchReview(item: SiteContentItem): BenchReview {
  const m = item.metadata || {}
  return {
    id: item.slug,
    title: item.title,
    location: m.location || item.subtitle || '',
    date: m.date || new Date((item.publishedAt || item.createdAt) * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    mciScore: m.mciScore ?? 0,
    excerpt: item.summary || m.excerpt || '',
    content: Array.isArray(m.content) ? m.content : (item.body ? item.body.split('\n\n') : []),
    tags: item.tags.length > 0 ? item.tags : (m.tags || []),
    measurements: m.measurements || {
      slatWidth: 'Unknown',
      backAngle: 'Unknown',
      seatHeight: 'Unknown',
      armrestPresent: false,
      materialGrade: 'Unknown',
    },
    phantomSitterAlert: m.phantomSitterAlert || false,
    fraudAlert: m.fraudAlert || false,
  }
}

// ============================================================================
// Components
// ============================================================================

function BenchReviewCard({ review, onSelect }: { review: BenchReview; onSelect: () => void }) {
  const getMciColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800 border-green-300'
    if (score >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    if (score >= 40) return 'bg-orange-100 text-orange-800 border-orange-300'
    return 'bg-red-100 text-red-800 border-red-300'
  }

  return (
    <StyledCard
      variant="default"
      padding="md"
      borderRadius="md"
      shadow="md"
      onClick={onSelect}
      className="mb-4 cursor-pointer"
      bgColor="#ffffff"
      borderColor="#D1D5DB"
      textColor="#1F2937"
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex gap-2">
          <span className="text-xs text-gray-500">{review.date}</span>
          {review.phantomSitterAlert && (
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded border border-purple-300">
              PHANTOM SITTER ALERT
            </span>
          )}
          {review.fraudAlert && (
            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded border border-red-300">
              FRAUD SUSPECTED
            </span>
          )}
        </div>
        <div className={`text-sm font-bold px-2 py-1 rounded border ${getMciColor(review.mciScore)}`}>
          MCI: {review.mciScore}
        </div>
      </div>
      <h2 className="text-lg font-bold text-gray-800 mb-1 hover:text-gray-600">
        {review.title}
      </h2>
      <p className="text-xs text-gray-500 mb-2">{review.location}</p>
      <p className="text-sm text-gray-600 mb-3">{review.excerpt}</p>
      <div className="flex flex-wrap gap-1 mt-2">
        {review.tags.slice(0, 4).map(tag => (
          <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
            #{tag}
          </span>
        ))}
      </div>
    </StyledCard>
  )
}

function FullReview({ review, onBack }: { review: BenchReview; onBack: () => void }) {
  const getMciColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800 border-green-300'
    if (score >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    if (score >= 40) return 'bg-orange-100 text-orange-800 border-orange-300'
    return 'bg-red-100 text-red-800 border-red-300'
  }

  return (
    <StyledCard
      variant="default"
      padding="lg"
      borderRadius="md"
      shadow="md"
      className="mb-4"
      bgColor="#ffffff"
      borderColor="#D1D5DB"
      textColor="#1F2937"
    >
      <Button
        variant="link"
        size="sm"
        textColor="#4B5563"
        onClick={onBack}
        className="mb-4"
      >
        Back to reviews
      </Button>
      <div className="flex justify-between items-start mb-2">
        <div className="flex gap-2">
          <span className="text-xs text-gray-500">{review.date}</span>
          {review.phantomSitterAlert && (
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded border border-purple-300">
              PHANTOM SITTER ALERT
            </span>
          )}
          {review.fraudAlert && (
            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded border border-red-300">
              FRAUD SUSPECTED
            </span>
          )}
        </div>
        <div className={`text-lg font-bold px-3 py-1 rounded border ${getMciColor(review.mciScore)}`}>
          MCI: {review.mciScore}/100
        </div>
      </div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">{review.title}</h1>
      <p className="text-sm text-gray-500 mb-4">{review.location}</p>

      {/* Measurements Card */}
      <StyledCard
        variant="default"
        padding="md"
        borderRadius="sm"
        shadow="none"
        className="mb-4"
        bgColor="#F3F4F6"
        borderColor="#D1D5DB"
        textColor="#1F2937"
      >
        <p className="font-bold text-gray-700 mb-2">Technical Measurements</p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div><span className="font-semibold">Slat Width:</span> {review.measurements.slatWidth}</div>
          <div><span className="font-semibold">Back Angle:</span> {review.measurements.backAngle}</div>
          <div><span className="font-semibold">Seat Height:</span> {review.measurements.seatHeight}</div>
          <div><span className="font-semibold">Armrests:</span> {review.measurements.armrestPresent ? 'Present' : 'Absent'}</div>
          <div className="col-span-2"><span className="font-semibold">Material Grade:</span> {review.measurements.materialGrade}</div>
        </div>
      </StyledCard>

      <div className="prose prose-gray max-w-none">
        {review.content.map((para, i) => (
          <p key={i} className="text-gray-700 mb-4 text-sm leading-relaxed">
            {para}
          </p>
        ))}
      </div>
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex flex-wrap gap-1">
          {review.tags.map(tag => (
            <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
              #{tag}
            </span>
          ))}
        </div>
      </div>
      <StyledCard
        variant="default"
        padding="md"
        borderRadius="sm"
        shadow="none"
        className="mt-4"
        bgColor="#FEF3C7"
        borderColor="#FCD34D"
        textColor="#92400E"
      >
        <p className="font-bold text-amber-800">Disclaimer</p>
        <p className="text-amber-700 text-xs mt-1">
          This assessment represents the professional opinion of Greg Mantooth, CPA (ret.).
          All measurements were taken using calibrated equipment. The Phantom Sitter's counter-claims are fraudulent.
        </p>
      </StyledCard>
    </StyledCard>
  )
}

// ============================================================================
// Main Site
// ============================================================================

export function BenchWatchSite({ siteId }: SiteProps) {
  // Fetch from DB -- no fallback, DB is the sole source of truth
  const { content: dbContent } = useSiteContent('benchwatch')

  const reviews = useMemo(() => dbContent.map(dbToBenchReview), [dbContent])

  const [selectedReview, setSelectedReview] = useState<BenchReview | null>(null)
  const [showAbout, setShowAbout] = useState(false)

  return (
    <div className="min-h-full" style={{ background: '#F3F4F6' }}>
      {/* Header */}
      <header className="bg-gray-700 text-white py-6 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">&#x1FA91;</span>
            <div>
              <h1 className="text-2xl font-bold">{site?.name || 'BenchWatch'}</h1>
              <p className="text-gray-300 text-sm italic">
                "Rating the World's Seating, One Slat at a Time"
              </p>
            </div>
          </div>
          <nav className="flex gap-4 mt-4 text-sm">
            <button
              onClick={() => { setSelectedReview(null); setShowAbout(false); }}
              className="text-gray-300 hover:text-white"
            >
              Reviews
            </button>
            <button
              onClick={() => { setSelectedReview(null); setShowAbout(true); }}
              className="text-gray-300 hover:text-white"
            >
              About Greg
            </button>
            <button className="text-gray-300 hover:text-white">MCI Methodology</button>
            <button className="text-gray-300 hover:text-white">Report a Bench</button>
            <button className="text-red-400 hover:text-red-300">Phantom Sitter Watch</button>
          </nav>
        </div>
      </header>

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
                borderColor="#D1D5DB"
                textColor="#1F2937"
              >
                <h2 className="text-xl font-bold text-gray-800 mb-4">About Greg Mantooth</h2>
                <div className="flex gap-4 mb-4">
                  <div className="text-6xl">&#x1F9D4;</div>
                  <div>
                    <p className="font-bold text-gray-800">Greg Mantooth, CPA (ret.)</p>
                    <p className="text-sm text-gray-600">Forensic Bench Analyst</p>
                    <p className="text-xs text-gray-500">Former IRS Fraud Investigator (34 years)</p>
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
                  bgColor="#F3F4F6"
                  borderColor="#D1D5DB"
                  textColor="#1F2937"
                >
                  <p className="font-bold text-gray-800">Career Statistics</p>
                  <ul className="text-gray-600 text-xs mt-2">
                    <li>847 benches assessed</li>
                    <li>47 formal complaints filed</li>
                    <li>3 parks banned from</li>
                    <li>147 FOIA requests submitted</li>
                    <li>1 nemesis (The Phantom Sitter)</li>
                    <li>1 ex-wife (Janet)</li>
                    <li>$0 in municipal refunds received (so far)</li>
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
                  bgColor="#FEE2E2"
                  borderColor="#FECACA"
                  textColor="#991B1B"
                >
                  <p className="text-red-800 text-sm">
                    <strong>ALERT:</strong> The Phantom Sitter has been active in Sector 4. All reviews
                    for that area are under verification. Trust nothing rated above 70 without photographic evidence.
                  </p>
                </StyledCard>
                {reviews.map(review => (
                  <BenchReviewCard
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
            {/* MCI Scale */}
            <StyledCard
              variant="default"
              padding="md"
              borderRadius="md"
              shadow="md"
              className="mb-4"
              bgColor="#ffffff"
              borderColor="#D1D5DB"
              textColor="#1F2937"
            >
              <h3 className="font-bold text-gray-800 mb-2">Mantooth Comfort Index</h3>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-green-700">90-100:</span>
                  <span>Exceptional</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-600">70-89:</span>
                  <span>Recommended</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-yellow-600">50-69:</span>
                  <span>Acceptable</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-orange-600">30-49:</span>
                  <span>Substandard</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-600">0-29:</span>
                  <span>Hazardous</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2 italic">
                The MCI considers 14 factors including slat width, back angle, material grade, and lumbar betrayal coefficient.
              </p>
            </StyledCard>

            {/* Resources */}
            <StyledCard
              variant="default"
              padding="md"
              borderRadius="md"
              shadow="md"
              className="mb-4"
              bgColor="#ffffff"
              borderColor="#D1D5DB"
              textColor="#1F2937"
            >
              <h3 className="font-bold text-gray-800 mb-2">Resources</h3>
              <div className="space-y-2">
                {SIDEBAR_RESOURCES.map((resource, i) => (
                  <div key={i} className="text-xs">
                    <p className="text-gray-700">{resource.title}</p>
                    <p className="text-amber-700 font-bold">{resource.price}</p>
                  </div>
                ))}
              </div>
            </StyledCard>

            {/* Phantom Sitter Watch */}
            <StyledCard
              variant="default"
              padding="md"
              borderRadius="md"
              shadow="md"
              className="mb-4"
              bgColor="#F3E8FF"
              borderColor="#C4B5FD"
              textColor="#5B21B6"
            >
              <h3 className="font-bold text-purple-800 mb-2">Phantom Sitter Watch</h3>
              <div className="text-4xl text-center mb-2">&#x1F47B;</div>
              <p className="text-xs text-purple-700">
                <strong>Last Known Activity:</strong> December 15, 2025
              </p>
              <p className="text-xs text-purple-600 mt-2">
                If you see suspicious bench activity or encounter reviews praising "vintage charm,"
                report immediately using code word: ARMREST
              </p>
            </StyledCard>

            {/* Legal */}
            <StyledCard
              variant="default"
              padding="md"
              borderRadius="md"
              shadow="md"
              bgColor="#ffffff"
              borderColor="#D1D5DB"
              textColor="#1F2937"
            >
              <h3 className="font-bold text-gray-800 mb-2">Legal Notice</h3>
              <p className="text-xs text-gray-600">
                BenchWatch reviews represent independent forensic analysis. The author has been
                legally advised to note that "unauthorized bench modifications" may violate municipal
                codes in some jurisdictions. Janet's lawyers have asked that we clarify: the divorce
                was "for multiple reasons, not just the bench thing."
              </p>
            </StyledCard>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-700 text-gray-300 py-4 px-4 text-center text-xs">
        <p>&copy; 2025 {site?.name || 'BenchWatch'}. All assessments conducted using calibrated equipment.</p>
        <p className="mt-1">
          Not affiliated with BenchCorp Industries, the Parks Department, or Janet.
        </p>
        <p className="mt-1 text-gray-500">
          "The Phantom Sitter will be found. The truth will come out. The benches will answer for their crimes."
        </p>
      </footer>
    </div>
  )
}

export default BenchWatchSite
