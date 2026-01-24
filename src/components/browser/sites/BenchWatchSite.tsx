/**
 * BenchWatch Site
 *
 * A forensic bench review site by Greg Mantooth, retired CPA.
 * He reviews public benches with the same rigor he once applied
 * to corporate fraud investigations. Peak "this is my calling" energy.
 */

import { useState } from 'react'
import type { SiteProps } from '../BrowserSiteContainer.js'
import { FILLER_SITES } from '../../../config/filler-sites.js'
import { StyledCard, Button } from '../../ui/shared/index.js'

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

const BENCH_REVIEWS: BenchReview[] = [
  {
    id: 'memorial-park-lumbar-betrayal',
    title: 'The Memorial Park Bench: A Masterclass in Lumbar Betrayal',
    location: 'Memorial Park, Sector 7-G',
    date: 'January 19, 2026',
    mciScore: 23,
    excerpt: 'What the city calls "ergonomic seating" I call "spinal warfare." After 4 hours of comprehensive analysis, I can confirm this bench hates you.',
    content: [
      'I approached the Memorial Park bench at 0600 hours with my full assessment kit: portable cushion pressure gauge, lumbar curvature template, slat gap caliper, and the infrared thermometer I legally obtained from a veterinary supply website.',
      'Initial impressions were poor. The back angle—and I measured this seventeen times to be certain—is 97.3 degrees. The industry standard for lumbar support is 95-100 degrees, but this particular configuration creates what I call a "betrayal zone" at the L4-L5 vertebrae junction.',
      'The slat gaps of 1.2 inches are just wide enough to create pressure points, but not wide enough for adequate ventilation. This is not incompetence. This is INTENTIONAL.',
      'I have submitted a FOIA request to the Parks Department for the procurement documents. Someone approved this bench. Someone signed their name. I will find them.',
      'My ex-wife walked by during hour three of my assessment. She pretended not to see me. Classic Janet.',
      'VERDICT: This bench should be removed, melted down, and the metal used to create a monument to municipal negligence. The manufacturer, BenchCorp Industries, has been added to my watchlist.',
    ],
    tags: ['lumbar-crime', 'parks-department', 'foia-pending', 'benchcorp'],
    measurements: {
      slatWidth: '3.2 inches (substandard)',
      backAngle: '97.3 degrees (betrayal zone)',
      seatHeight: '17.5 inches (acceptable)',
      armrestPresent: false,
      materialGrade: 'Recycled composite (suspicious)',
    },
    fraudAlert: true,
  },
  {
    id: 'transit-bench-47-vindication',
    title: 'Downtown Transit Bench #47: They Said It Was Vandal-Proof. They Were Wrong.',
    location: 'Bus Stop 47, Commerce & 3rd',
    date: 'January 12, 2026',
    mciScore: 67,
    excerpt: 'After my third "unauthorized modification," the transit authority finally admitted what I\'ve been saying for 18 months: the armrest spacing was criminal.',
    content: [
      'For those following the Transit Bench #47 saga, I am pleased to report a partial victory. The Metropolitan Transit Authority has agreed to "review" their armrest specifications after my detailed 47-page complaint (one page per bench).',
      'The original configuration featured armrests every 24 inches—ostensibly to "prevent sleeping" but actually creating a torture device for anyone over 5\'8". I submitted photographic evidence of the resulting thigh bruising (my own) to the city council.',
      'Yes, I was banned from making modifications after the incident in 2024. But my third modification—a simple angle adjustment using equipment from my daughter\'s former orthodontist—was made at 3 AM and technically occurred in a gray area of the municipal code.',
      'The bench now scores a respectable 67 on the MCI, up from the original 31. The transit authority is claiming credit for the improvement. They know what I did. I know what I did. God knows what I did.',
      'IMPORTANT: The Phantom Sitter has left a fake 5-star review for this bench on multiple platforms. Do NOT trust any review praising the "vintage charm" of the original configuration. This is disinformation.',
    ],
    tags: ['transit-authority', 'vindication', 'unauthorized-modification', 'phantom-sitter-alert'],
    measurements: {
      slatWidth: '4.1 inches (adequate)',
      backAngle: '102 degrees (supportive)',
      seatHeight: '18 inches (optimal)',
      armrestPresent: true,
      materialGrade: 'Powder-coated steel (approved)',
    },
    phantomSitterAlert: true,
  },
  {
    id: 'city-hall-modern-art-disgrace',
    title: 'The Controversial "Modern Art" Bench at City Hall: Form Over Function, A National Disgrace',
    location: 'City Hall Plaza, Installation #3',
    date: 'January 5, 2026',
    mciScore: 8,
    excerpt: 'The city paid $47,000 for what is essentially a curved piece of granite that actively harms citizens. I have started a petition.',
    content: [
      'I need you to understand something. The City Council approved $47,000 of taxpayer money for a "sculptural seating installation" that scores an 8 on the Mantooth Comfort Index. EIGHT.',
      'The designer, who I will not name but whose address I have legally obtained through public records, claims the bench "challenges our preconceptions of rest." Let me challenge HIS preconceptions. Of lawsuits.',
      'The seating surface is CONVEX. It curves AWAY from you. You cannot sit on this bench without sliding forward. I timed it: average citizen slides off completely in 47 seconds. I stayed for three hours to gather statistically significant data.',
      'There is no back support because backs are "a social construct," according to the artist\'s statement. My chiropractor disagrees. So does my herniated disc.',
      'I have filed complaints with: the City Council, the Parks Commission, the Arts Board, the Better Business Bureau, the State Attorney General, and, in a moment of desperation, the FBI Art Crime Team. They all said this is "outside their jurisdiction." CONVENIENT.',
      'The petition to remove this monstrosity has 3,847 signatures. My ex-wife Janet signed it. We agree on nothing except this bench must be destroyed.',
    ],
    tags: ['modern-art', 'taxpayer-fraud', 'petition', 'fbi-no-response', 'janet-agrees'],
    measurements: {
      slatWidth: 'N/A (monolithic granite)',
      backAngle: 'N/A (no back support)',
      seatHeight: '14 inches (too low)',
      armrestPresent: false,
      materialGrade: 'Polished granite (hazardous when wet)',
    },
    fraudAlert: true,
  },
  {
    id: 'hidden-gem-riverside',
    title: 'The Riverside Hidden Gem: A Perfect 94 and Why the City is Hiding It',
    location: 'Riverside Trail, Mile Marker 2.3',
    date: 'December 28, 2025',
    mciScore: 94,
    excerpt: 'In 23 years of bench assessment, I have found ONE bench that approaches perfection. Naturally, it\'s unmarked and the city denies its existence.',
    content: [
      'At mile marker 2.3 on the Riverside Trail, hidden behind an overgrown lilac bush, sits the finest public seating apparatus I have encountered in my career.',
      'The slat width is 4.7 inches—nearly half an inch wider than standard. The back angle is 98.2 degrees, placing lumbar support in what I call the "golden zone." The wood grain indicates old-growth cedar, pre-1990 harvest. They do not make benches like this anymore.',
      'I contacted the Parks Department for installation records. They claim the bench "does not exist in their inventory." I sent photographs. They said the photographs "must be of private property." I sent GPS coordinates. They stopped responding.',
      'I believe this bench was installed during the 1987 municipal renovation and somehow escaped the Great Bench Purge of 2003, when the city replaced all wooden benches with the composite monstrosities we suffer today.',
      'I have been visiting this bench every Tuesday and Thursday at 7 AM for six months. I bring a blanket in winter. The homeless community has started calling me "Bench Greg." This is the closest I have felt to acceptance since Janet left.',
      'I will NOT disclose the exact location publicly. The Phantom Sitter is always watching.',
    ],
    tags: ['hidden-gem', 'conspiracy', 'old-growth-cedar', 'phantom-sitter-watching'],
    measurements: {
      slatWidth: '4.7 inches (exceptional)',
      backAngle: '98.2 degrees (golden zone)',
      seatHeight: '17.8 inches (ideal)',
      armrestPresent: true,
      materialGrade: 'Old-growth cedar (pre-1990)',
    },
  },
  {
    id: 'hospital-bench-hostile-architecture',
    title: 'St. Vincent\'s Hospital Bench: Hostile Architecture Meets Healthcare',
    location: 'St. Vincent\'s Hospital, Main Entrance',
    date: 'December 20, 2025',
    mciScore: 41,
    excerpt: 'A hospital—a place of HEALING—has installed anti-homeless armrests that also prevent comfortable sitting. The irony is not lost on me. Or my lawyer.',
    content: [
      'I spent 9 hours in the St. Vincent\'s waiting room last month (kidney stones, not relevant). This gave me ample time to assess their exterior seating situation.',
      'The main entrance features three benches with what the industry calls "hostile architecture"—central armrests designed to prevent lying down. What they don\'t tell you is these armrests also create sitting compartments of exactly 19 inches.',
      '19 INCHES. The average American hip width is 16.4 inches for men and 17.2 inches for women. This leaves, at maximum, 2.6 inches of clearance. Try sitting comfortably with 2.6 inches of clearance while your husband is having his gallbladder removed.',
      'I asked to speak with the hospital\'s facilities manager. He refused. I left my business card. He had security escort me to my car. I left seventeen business cards in various locations throughout the hospital.',
      'The board of directors will be receiving my 34-page assessment at their next meeting. I have confirmed the meeting time and location through public records. I will be attending. They cannot legally prevent me from attending. I have checked.',
    ],
    tags: ['hostile-architecture', 'healthcare', 'awaiting-board-meeting', 'security-escort'],
    measurements: {
      slatWidth: '3.8 inches (standard)',
      backAngle: '100 degrees (acceptable)',
      seatHeight: '18 inches (optimal)',
      armrestPresent: true,
      materialGrade: 'Aluminum (cold, unforgiving)',
    },
  },
  {
    id: 'the-phantom-sitter-strikes',
    title: 'URGENT: The Phantom Sitter Has Struck Again - Cemetery Hill Bench Compromised',
    location: 'Cemetery Hill Park, North Entrance',
    date: 'December 15, 2025',
    mciScore: 0,
    excerpt: 'I arrived for my scheduled assessment to find the bench had been REPLACED overnight. The Phantom Sitter\'s calling card was left at the scene. This is personal now.',
    content: [
      'At 0545 on December 15th, I arrived at Cemetery Hill Park for a routine bi-monthly assessment of bench CH-07. What I found chilled me to my core.',
      'The bench was gone. In its place: a new bench, clearly installed within the past 48 hours, with synthetic slats and chrome armrests. On the backrest, etched into the wood: a small "PS" inside a sitting figure silhouette.',
      'The Phantom Sitter.',
      'For those new to BenchWatch, the Phantom Sitter is my nemesis. They have been leaving fake reviews on Yelp, Google Maps, and TripAdvisor praising benches I have rated below 50. They have contacted the Parks Department claiming to be me. They have subscribed me to seventeen bench manufacturer mailing lists.',
      'This escalation—physical bench replacement—represents a new chapter in our conflict. They know my assessment schedule. They are watching me. But I am also watching them.',
      'The new bench is unratable until proper analysis can be conducted. I am assigning a precautionary MCI of 0. Trust nothing. The Phantom Sitter wants you comfortable. Comfort leads to complacency. Complacency is how they win.',
      'If you have any information about the identity of the Phantom Sitter, contact me through the secure form on this website. Use the code word: "ARMREST."',
    ],
    tags: ['phantom-sitter', 'nemesis', 'bench-replacement', 'investigation-ongoing', 'armrest'],
    measurements: {
      slatWidth: 'COMPROMISED',
      backAngle: 'COMPROMISED',
      seatHeight: 'COMPROMISED',
      armrestPresent: true,
      materialGrade: 'UNDER INVESTIGATION',
    },
    phantomSitterAlert: true,
  },
  {
    id: 'benchcorp-conspiracy',
    title: 'EXPOSÉ: BenchCorp Industries and the Great Municipal Bench Scandal of 2019',
    location: 'City-Wide Investigation',
    date: 'December 8, 2025',
    mciScore: 0,
    excerpt: 'After 3 years of FOIA requests, I can finally reveal: the city paid $340,000 for 47 benches that cost $89,000 to manufacture. Someone got rich. Someone got comfortable.',
    content: [
      'This is the article they do not want me to publish. But truth has no price. (Although I do accept donations.)',
      'In 2019, the City Parks Commission approved a contract with BenchCorp Industries for 47 "premium outdoor seating solutions" at $7,234 each. Total cost: $340,000.',
      'Through 147 FOIA requests, 23 phone calls to the manufacturer, and one very informative conversation with a recently terminated BenchCorp employee at a bar, I have obtained the actual manufacturing cost: $1,893 per unit.',
      'The markup was 282%. The benches themselves score an average MCI of 34. Someone approved this. Someone signed the purchase order. Someone received kickbacks. I have theories.',
      'The City Manager has declined to comment. The Parks Commissioner resigned in 2021 and now lives in Arizona, where I have confirmed they have excellent public seating (MCI average: 71). Coincidence?',
      'My lawyer has advised me to note that these are allegations based on publicly available documents and "that one conversation at O\'Malley\'s." I stand by my reporting.',
      'Janet, if you\'re reading this: THIS is why I couldn\'t make your mother\'s birthday dinner. Some things are bigger than family.',
    ],
    tags: ['benchcorp', 'municipal-fraud', 'foia-victory', 'arizona-connection', 'sorry-janet'],
    measurements: {
      slatWidth: 'VARIES (inconsistent quality)',
      backAngle: '95-103 degrees (no standardization)',
      seatHeight: '16-19 inches (lottery)',
      armrestPresent: false,
      materialGrade: 'Recycled composite (lowest bidder)',
    },
    fraudAlert: true,
  },
]

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
                {BENCH_REVIEWS.map(review => (
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
