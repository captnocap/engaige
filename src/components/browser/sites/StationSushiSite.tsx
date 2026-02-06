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

const SUSHI_REVIEWS: SushiReview[] = [
  {
    id: 'loves-travel-stop-omaha',
    stationName: "Love's Travel Stop",
    stationNumber: '#4892',
    location: 'Exit 432, Omaha, Nebraska',
    pumpNumber: 7,
    date: 'January 18, 2026',
    rating: 5,
    title: "Love's Travel Stop, Omaha: The Unexpected Umami Journey",
    excerpt: 'In forty-three years of insurance adjusting, I never encountered a claim as bold as this California roll. A revelation wrapped in seaweed.',
    sushiType: 'California Roll Combo (6pc) + Spicy Tuna Roll (6pc)',
    price: '$8.99',
    wouldReturnFor: 'The transcendent wasabi packet, clearly imported from somewhere that takes wasabi seriously',
    content: [
      'One does not simply stumble upon greatness. Sometimes, greatness finds you at Pump 7, between the diesel lanes and a man selling decorative gourds from his truck bed.',
      'The presentation was, dare I say, bouleversant. The plastic clamshell container caught the fluorescent light at precisely the angle that made the imitation crab glisten like dawn over the Pacific. I photographed it next to the pump number for posterity.',
      'Upon first bite, I detected notes of cucumber that spoke of a vegetable garden long forgotten, perhaps in a simpler time. The rice, while possessing the structural integrity of wet cement, had a certain je ne sais quoi that reminded me of Gerald\'s aunt\'s church basement potlucks.',
      'The wasabi packet - and I do not say this lightly - achieved what I can only describe as a "controlled nasal event." Tears streamed down my face, though whether from the wasabi or the beauty of the moment, I cannot say.',
      'The ginger, pink as a prairie sunset, cleansed my palate between bites with all the grace of a palette knife through peanut butter.',
      'I lingered at Pump 7 for forty-five minutes, savoring each morsel. The attendant asked if I needed assistance. I told him I was documenting history.'
    ],
    geraldNote: 'Gerald would have called this "fish from a gas station, Mildred." But Gerald ate at Applebee\'s voluntarily. Rest his soul.'
  },
  {
    id: 'shell-station-4447',
    stationName: 'Shell',
    stationNumber: '#4447',
    location: 'Exit 89, Interstate 80, Iowa',
    pumpNumber: 3,
    date: 'January 12, 2026',
    rating: 4,
    title: 'Shell Station #4447, Exit 89: A Surprisingly Nuanced California Roll Experience',
    excerpt: 'Between the automotive additives and the beef jerky display, I discovered what I can only describe as a piccolo masterpiece of rice and imitation crab.',
    sushiType: 'Premium California Roll (8pc)',
    price: '$7.49',
    wouldReturnFor: 'The avocado, which showed remarkable restraint in its browning',
    content: [
      'I arrived at Shell #4447 at precisely 2:47 PM, having triangulated this location based on reports from fellow enthusiasts in my Facebook group "Midwest Petroleum Sushi Aficionados" (287 members, highly vetted).',
      'The refrigeration unit hummed a B-flat, which I took as an auspicious sign. The temperature display read 38 degrees Fahrenheit - technically within acceptable parameters, though I would have preferred 36.',
      'The sushi rested beside the string cheese and the energy drinks, like a diamond among costume jewelry. The "sell by" date was a mere 47 hours hence. Practically fresh from the sea, if the sea were in New Jersey and the fish were surimi.',
      'I consumed my repast at the outdoor seating area - a concrete parking bumper that offered surprisingly adequate lumbar support. A passing trucker gave me a concerned look. I gave him a knowing nod. He does not understand the mission.',
      'The soy sauce packet required the grip strength I developed during my years assessing hail damage claims. A small price for authenticity.',
      'One pump deducted for the absence of chopsticks. I was forced to use a coffee stirrer, which, while functional, lacked the ceremonial gravitas the moment deserved.'
    ]
  },
  {
    id: 'seven-eleven-route-9',
    stationName: '7-Eleven',
    stationNumber: '#12847',
    location: 'Route 9, Cedar Rapids, Iowa',
    pumpNumber: 2,
    date: 'January 5, 2026',
    rating: 1,
    title: 'The 7-Eleven on Route 9: Where Dreams of Spicy Tuna Die',
    excerpt: 'I have seen things in my career. Tornado damage. Flood claims. A man who tried to file a claim for "emotional distress from a haunted refrigerator." Nothing prepared me for this.',
    sushiType: 'Spicy Tuna Roll (6pc)',
    price: '$6.99',
    wouldReturnFor: 'Absolutely nothing. I have removed this location from my mapping software.',
    content: [
      'There are moments in life that test one\'s commitment to their calling. January 5th, 2026, was mine.',
      'The spicy tuna roll sat alone in the refrigerated case, orphaned beside a container of fruit that had clearly given up on life. I should have heeded the warning.',
      'The rice had achieved a texture I can only describe as "post-rigor." It crumbled not with the delicate separation of properly prepared sushi, but with the resigned collapse of a condemned building.',
      'The "spicy" component appeared to be generic hot sauce applied with the precision of a garden sprinkler. It pooled in the container like accusations.',
      'I detected no tuna. What I detected was a protein of indeterminate origin that seemed to resent its circumstances. We had that in common.',
      'The wasabi was absent. The ginger was present but appeared to be weeping. Or perhaps that was condensation. In this establishment, one cannot be certain.',
      'I left my review card with the night clerk, a young man named Travis who seemed genuinely confused by the concept of "constructive criticism." I wish him well in his journey.'
    ],
    geraldNote: 'Gerald\'s brother ate gas station sushi once in 1987 and was "never the same," according to family legend. After today, I understand.'
  },
  {
    id: 'quiktrip-premium-combo',
    stationName: 'QuikTrip',
    stationNumber: '#789',
    location: 'Highway 71, Kansas City, Missouri',
    pumpNumber: 12,
    date: 'December 28, 2025',
    rating: 4,
    title: 'QuikTrip Premium Sushi Combo: Gerald Would Have Loved This (He\'s Deceased)',
    excerpt: 'Standing at Pump 12, I was overcome with a profound sense that my late husband\'s spirit was with me. Not literally. Gerald is very deceased. But his skepticism lives on.',
    sushiType: 'Premium Combo: California Roll + Shrimp Tempura Roll (12pc)',
    price: '$11.99',
    wouldReturnFor: 'The surprisingly competent shrimp tempura, which retained some textural memory of crispness',
    content: [
      'Gerald passed three years ago. Heart attack. Ironic, given his constant warnings about "food that shouldn\'t exist." He meant my gas station sushi, specifically.',
      'I dedicate this review to his memory, not because he would have appreciated it - he absolutely would not have - but because marriage is about proving points even after one party has departed this mortal coil.',
      'The QuikTrip Premium Combo represents everything Big Grocery fears: accessible, affordable, and positioned strategically next to the roller grill hot dogs. This is democratic gastronomy.',
      'The tempura shrimp, while clearly having lost its battle with humidity hours prior, retained a certain soggy dignity. I have seen worse at establishments with tablecloths.',
      'The California roll was textbook - and I mean that literally, as I am writing a textbook on petroleum-adjacent cuisine (self-publishing, Spring 2026).',
      'I stood at Pump 12 for the entire meal, as is my custom. A woman asked if I was "okay." I explained I was conducting research. She walked away faster than was strictly necessary.',
      'Four pumps. Gerald would have given it zero. But Gerald also thought Olive Garden was "too exotic." We contained multitudes.'
    ],
    geraldNote: 'Gerald once said, "Mildred, if you die from gas station sushi, I\'m not paying for a fancy casket." Well, Gerald, jokes on you. You went first. And I\'m still eating sushi at Pump 12.'
  },
  {
    id: 'caseys-general-store',
    stationName: "Casey's General Store",
    stationNumber: '#3391',
    location: 'Main Street, Small Town, Nebraska',
    pumpNumber: 4,
    date: 'December 19, 2025',
    rating: 3,
    title: "Casey's Conundrum: When Pizza People Attempt Raw Fish",
    excerpt: 'Casey\'s is beloved for its pizza. Their venture into sushi is like watching a Methodist church attempt a Diwali celebration. Earnest, but confused.',
    sushiType: 'Rainbow Roll (8pc)',
    price: '$9.49',
    wouldReturnFor: 'The pizza. Never the sushi. But perhaps the sushi again, for science.',
    content: [
      'Casey\'s General Store is a midwest institution, known primarily for breakfast pizza and surprisingly adequate fountain drinks. Their entry into the sushi market is what we in the insurance industry call a "calculated risk." In my professional opinion, they miscalculated.',
      'The Rainbow Roll presented itself with all the colors promised, though the "rainbow" appeared to have weathered a storm. The fish draped over the roll like tiny, tired blankets.',
      'I detected salmon, tuna, and what I believe was meant to be yellowtail. Each fish seemed to be having a private crisis about its life choices. I related to them.',
      'The rice achieved adequacy - not the excellence of Love\'s Travel Stop, but a respectful mediocrity that speaks to Midwestern values.',
      'I consumed this roll in my vehicle (a 2019 Honda CR-V with 67,000 miles, excellent for sushi consumption due to cup holder placement) while watching a teenager fail to parallel park for fourteen minutes. Life, like sushi, requires patience.',
      'Three pumps. Casey\'s should stick to what they know. But I applaud the ambition. In the gas station sushi community, we reward effort.'
    ]
  },
  {
    id: 'bp-industrial-district',
    stationName: 'BP',
    stationNumber: '#8829',
    location: 'Industrial District, Des Moines, Iowa',
    pumpNumber: 9,
    date: 'December 10, 2025',
    rating: 2,
    title: 'BP #8829: An Exercise in Disappointment and Personal Growth',
    excerpt: 'I entered with expectations. I left with wisdom. Also, mild gastrointestinal discomfort (unrelated, probably).',
    sushiType: 'Veggie Roll + Side of Edamame',
    price: '$7.99',
    wouldReturnFor: 'Directions to a different BP',
    content: [
      'The Industrial District BP is surrounded by warehouses, a tire recycling facility, and what I can only describe as "aggressive infrastructure." It is not where one expects to find sushi. It is not where one should find sushi.',
      'The veggie roll contained cucumber, avocado, and an unidentified orange substance that may have been carrot or may have been existential dread manifested as vegetable.',
      'The edamame was room temperature in the way that suggests it was once frozen, then refrigerated, then forgotten, then remembered at an inopportune moment. We have all been this edamame.',
      'I sat on a stack of pallets near Pump 9, as there was no proper seating. A forklift operator waved. I waved back. In the Industrial District, we are all comrades.',
      'Two pumps, and I am being generous because the attendant, Marlene, remembered me from my previous visit eight months ago. "Oh, you\'re the sushi lady," she said. I have been called worse by family members.',
      'This location has been flagged in my database for required improvement before re-review. I have left a detailed comment card. Marlene promised to pass it along to "whoever handles that." I have doubts.'
    ],
    geraldNote: 'Gerald once refused to stop at a gas station because it "looked sad." Gerald, this BP would have destroyed you. Sometimes I miss your fear of adventure. Usually I do not.'
  },
  {
    id: 'flying-j-truck-stop',
    stationName: 'Flying J Travel Center',
    stationNumber: '#847',
    location: 'Interstate 29, Sioux City, Iowa',
    pumpNumber: 15,
    date: 'November 29, 2025',
    rating: 5,
    title: 'Flying J #847: A Trucker\'s Paradise, A Sushi Pilgrim\'s Mecca',
    excerpt: 'I wept openly at Pump 15. A trucker named Big Mike offered me a napkin. I declined. These tears were earned.',
    sushiType: 'Deluxe Sashimi Combo + Philadelphia Roll (16pc)',
    price: '$14.99',
    wouldReturnFor: 'Everything. I would drive 300 miles for this. I have driven 300 miles for this. Twice.',
    content: [
      'The Flying J Travel Center on Interstate 29 is a cathedral of petroleum and possibility. When I pulled into the parking lot, I felt something I had not felt since Gerald surprised me with a trip to Branson in 2018: hope.',
      'The sushi display case was extensive - six varieties, each with visible sell-by dates posted with transparency I can only describe as "revolutionary." This is how Big Grocery loses: through honesty.',
      'The sashimi - and I use this term deliberately - achieved a freshness that defied both logic and geography. We are 1,200 miles from any ocean. And yet.',
      'The Philadelphia Roll demonstrated perfect cream cheese distribution, each slice revealing that iconic spiral of dairy and smoked salmon that has launched a thousand debates about sushi authenticity. I take no position. I simply eat.',
      'A trucker at the adjacent pump, who identified himself as Big Mike from Tulsa, inquired about my meal. I explained my mission. He nodded solemnly and said, "My ex-wife did something like this, but with Cracker Barrel locations." Big Mike understood.',
      'Five pumps. Full marks. I have added Flying J #847 to my "Essential Midwest Petroleum Sushi" list, which currently features seven locations. I am planning a pilgrimage route for spring 2026.',
      'I remained at Pump 15 for seventy-three minutes. No one asked me to leave. This is the Flying J difference.'
    ],
    geraldNote: 'Gerald never understood why I couldn\'t just "eat sushi at a restaurant like a normal person." Gerald, wherever you are, I want you to know: they don\'t photograph their sushi next to pump numbers at restaurants. Where is the authenticity? Where is the SOUL?'
  },
  {
    id: 'mobil-first-hospitalization',
    stationName: 'Mobil',
    stationNumber: '#2291',
    location: 'Highway 30, Grand Island, Nebraska',
    pumpNumber: 6,
    date: 'September 15, 2024',
    rating: 3,
    title: 'Mobil #2291: The Incident That Taught Me Resilience (Medical Records Available Upon Request)',
    excerpt: 'What happened at this Mobil is between me, my gastroenterologist, and God. The sushi itself was adequate. The aftermath was a learning experience.',
    sushiType: 'Eel Avocado Roll (6pc)',
    price: '$8.99',
    wouldReturnFor: 'I have returned. Twice. My doctor describes this as "concerning." I describe it as "commitment."',
    content: [
      'I want to be clear: the hospitalization was unrelated to the sushi. Probably. The timing was coincidental. My gastroenterologist, Dr. Patel, has a different opinion, but Dr. Patel also thinks I should "reconsider my hobby." We agree to disagree.',
      'The eel avocado roll at Mobil #2291 was ambitious. Eel is not commonly found at gas stations, and for good reason. It requires a certain... infrastructure. This Mobil did not have that infrastructure. But they tried.',
      'The eel had a texture I will describe as "contemplative." It required significant jaw effort. I viewed this as exercise.',
      'The avocado was present and accounted for, if perhaps past its social prime. Green, with notes of brown. A late-stage avocado. Still dignified.',
      'Approximately four hours after consumption, I experienced what I will diplomatically call "gastric discord." This continued for thirty-seven hours. I maintained detailed notes, as is my practice.',
      'The subsequent hospital visit was brief - overnight observation, IV fluids, and a lecture from a young ER doctor who clearly did not appreciate the nuance of my work.',
      'Three pumps. I deduct points for the aftermath but award them back for the bold menu selection. Risk-taking should be rewarded in the petroleum sushi industry.',
      'I have since returned to this location twice. Both times, the sushi was acceptable. The first time was clearly an anomaly. Or my constitution has strengthened. Either way: progress.'
    ],
    geraldNote: 'Gerald would have said "I told you so" approximately four hundred times during my hospitalization. In his absence, my daughter Amanda filled this role admirably. The Gasketsworth tradition continues.'
  }
]

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
  // Fetch from DB with fallback to hardcoded data
  const { content: dbContent } = useSiteContent('stationsushi')

  const sushiReviews = useMemo(() => {
    if (dbContent.length > 0) return dbContent.map(dbToSushiReview)
    return SUSHI_REVIEWS
  }, [dbContent])

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
