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

import { useState } from 'react'
import type { SiteProps } from '../BrowserSiteContainer.js'
import { FILLER_SITES } from '../../../config/filler-sites.js'
import { StyledCard, Button } from '../../ui/shared/index.js'

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

const LOCATIONS: Location[] = [
  // --- Hartwell Building ---
  {
    id: 'hartwell-building',
    name: 'Hartwell Building',
    type: 'Office Building',
    address: '100 Hartwell Plaza, Downtown',
    rating: 3.5,
    totalReviews: 847,
    hours: 'Varies by floor',
    hoursNote: 'Floor 7: Always open. Floor 13: N/A',
    streetViewStatus: 'unavailable',
    website: 'www.hartwellfiles.corn',
    streetViewNote: 'Image unavailable - camera malfunction. All 3 vehicles that attempted Street View imaging reported identical equipment failures at this location.',
    description: `Historic 47-story office building constructed in 1923 by architect Edmund Hartwell. Home to Omnicorp Holdings (floors 20-33), The Underground music venue (basement), and several insurance agencies of questionable legitimacy.

Notable for its Art Deco architecture, ornate lobby with original brass fixtures, and... unique floor numbering system. Building management asks that visitors refrain from asking about floor 13.

The 7th floor mirrors have been reported to show "things that aren't there." Maintenance claims this is a lighting issue.`,
    highlights: ['Historic Landmark', 'Art Deco Architecture', '24/7 Security', 'Basement Venue Access'],
    category: 'office',
    reviews: [
      { author: 'Mike T.', rating: 1, date: '2 weeks ago', text: "Couldn't find floor 13. Elevator skips from 12 to 14. Asked security and they pretended not to hear me. Tried to use the stairs - they skip it too somehow. 1 star.", helpful: 47 },
      { author: 'Sandra L.', rating: 4, date: '1 month ago', text: 'Time moves differently here. Went in for a 30-minute meeting, came out and 4 hours had passed. Not complaining, it felt like a full day of rest. Will visit again.', helpful: 23 },
      { author: 'Anonymous', rating: 5, date: '3 months ago', text: 'Found floor 13. Wish I hadnt. Great coffee shop in the lobby though.', helpful: 847 },
      { author: 'Janet K.', rating: 3, date: '2 months ago', text: 'The mirrors on floor 7 show things that arent there. Or maybe things that are there but shouldnt be. Either way, nice views from the rooftop.', helpful: 12 },
      { author: 'Building Inspector #7', rating: 2, date: '6 months ago', text: 'No violations found. Please stop calling.', helpful: 0 },
    ],
    popularTimes: {
      day: 'Wednesday',
      hours: [5, 8, 15, 95, 20, 25, 30, 45, 60, 70, 75, 80, 70, 60, 50, 45, 40, 35, 30, 25, 20, 15, 10, 8],
      anomaly: { hour: 3, note: 'Unusual activity spike at 3:33 AM every night. Building management has no comment.' },
    },
    directions: [
      { instruction: 'Head north on Main St toward 1st Ave', distance: '0.3 mi', duration: '2 min' },
      { instruction: 'Turn right onto Hartwell Plaza', distance: '0.1 mi', duration: '1 min' },
      { instruction: 'Destination will be on your left', distance: '', duration: '' },
      { instruction: 'Do not look directly at the 7th floor windows', distance: '', duration: '', isWeird: true },
    ],
    nearby: ['Quantum Brew Cafe', 'The Underground', 'Floor 13', 'Omnicorp Holdings'],
    specialNote: 'CornMaps cannot verify the existence of all floors in this building.',
  },

  // --- The Underground ---
  {
    id: 'the-underground',
    name: 'The Underground',
    type: 'Music Venue',
    address: 'Hartwell Building Basement, Downtown',
    rating: 4.7,
    totalReviews: 2847,
    hours: '10 PM - ???',
    hoursNote: 'Closing time is a suggestion. Ask Mars.',
    noiseLevel: 'Yes',
    streetViewStatus: 'available',
    website: 'www.bandsnotintown.corn',
    streetViewNote: 'Street View shows basement entrance. Interior imaging unavailable due to low light conditions and something blocking the camera that we prefer not to discuss.',
    description: `Legendary music venue in the basement of the Hartwell Building. Founded in 2015 by Marcus "Mars" Williams after discovering the unused space during urban exploration.

Known for hosting The Velvet Algorithms, Neon Requiem, DJ Probability, and approximately 847 noise complaints filed since opening. Building somehow still has all permits.

The venue maintains a strict "no phones during sets" policy. Mars knows everyone's name. How he knows is unclear.`,
    highlights: ['Live Music Nightly', 'No Phone Policy', 'Artist Wall', 'Mars Knows Your Name'],
    category: 'entertainment',
    reviews: [
      { author: 'Luna S.', rating: 5, date: '1 week ago', text: 'Mars knows everyones name. Creepy but appreciated. Best sound system in the city.', helpful: 156 },
      { author: 'Derek O.', rating: 5, date: '2 weeks ago', text: 'Saw a Velvet Algorithms show here. They played for 27 hours. I watched the whole thing. My wife is concerned.', helpful: 47 },
      { author: 'Kevin M.', rating: 3, date: '1 month ago', text: 'Great venue but why does Mars keep calling me "Small Kevin"? My name is just Kevin. I am average height.', helpful: 89 },
      { author: 'Neighbor (Floor 1)', rating: 1, date: '2 months ago', text: 'The bass. The endless bass. I have filed noise complaints. 847 of them. Nothing changes.', helpful: 12 },
      { author: 'Velvet Algorithms Fan', rating: 5, date: '3 months ago', text: 'Worth the hearing damage. Bring earplugs. Or dont. Let the sound consume you.', helpful: 34 },
    ],
    popularTimes: {
      day: 'Saturday',
      hours: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 30, 50, 80, 95],
      anomaly: { hour: 23, note: '847 noise complaints have been filed about this venue.' },
    },
    directions: [
      { instruction: 'Navigate to Hartwell Building', distance: '0.5 mi', duration: '5 min' },
      { instruction: 'Enter through alley entrance (not main lobby)', distance: '200 ft', duration: '1 min' },
      { instruction: 'Descend stairs. Keep descending. Trust the process.', distance: '???', duration: '???', isWeird: true },
      { instruction: 'When you see Mars, tell him your name. He already knows it.', distance: '', duration: '', isWeird: true },
    ],
    nearby: [
      'Hartwell Building', 'Noise Complaint Office #1', 'Noise Complaint Office #2',
      'Noise Complaint Office #3', 'Noise Complaint Office #4', 'Noise Complaint Office #5',
      'Noise Complaint Office #6', 'Noise Complaint Office #7', 'Noise Complaint Office #8',
      'Noise Complaint Office #9', 'Noise Complaint Office #10', 'Noise Complaint Office #11',
      'Noise Complaint Office #12', 'Noise Complaint Office #13',
    ],
    specialNote: '847 noise complaints on file. Building somehow still has all permits.',
  },

  // --- Quantum Brew Cafe ---
  {
    id: 'quantum-brew-cafe',
    name: 'Quantum Brew Cafe',
    type: 'Coffee Shop',
    address: '2847 Schrodinger Lane, Midtown',
    rating: 2.3,
    totalReviews: 47,
    hours: 'Opens when the quantum state collapses',
    hoursNote: 'Check website for probability of being open',
    streetViewStatus: 'available',
    website: 'www.quantumbrewblog.corn',
    streetViewNote: "Derek's car visible in parking lot. Note: Derek's car is visible in every Street View photo of this location taken over the past 3 years, regardless of date or time.",
    description: `The only cafe in the region serving authentic quantum-brewed coffee. Our proprietary Q-3000 brewing system uses quantum entanglement to achieve perfect molecular consistency.

Average cup price: $47. Worth it? The answer exists in a superposition until you drink it.

Regular customer Derek has posted over 40 5-star reviews from various "locations" - all showing his car in Street View.`,
    highlights: ['Quantum Brewing', 'Q-3000 Machine', 'Derek-Approved', 'Scientifically Questionable'],
    category: 'food',
    reviews: [
      { author: 'Derek O.', rating: 5, date: '1 day ago', text: 'Perfect as always. The wave function collapsed beautifully today. (Posted from Quantum Brew Cafe)' },
      { author: 'Derek O.', rating: 5, date: '3 days ago', text: 'Another transcendent cup. Jennifer would have loved this. (Posted from Quantum Brew - Midtown)' },
      { author: 'Derek O.', rating: 5, date: '1 week ago', text: 'Observation angle was perfect today. (Posted from Quantum Brew - Downtown)' },
      { author: 'Derek O.', rating: 5, date: '2 weeks ago', text: 'Mr. Whiskers and I agree: best quantum coffee in the multiverse. (Posted from Quantum Brew - Airport)' },
      { author: 'Sarah M.', rating: 1, date: '1 month ago', text: "Paid $47 for coffee. It tasted like regular coffee. The guy at the next table (Derek?) tried to explain wave functions to me for 45 minutes.", helpful: 234 },
      { author: 'Dr. Chen', rating: 2, date: '2 months ago', text: 'As a physicist, I can confirm none of this is how quantum mechanics works. The coffee is fine though.', helpful: 12 },
    ],
    popularTimes: {
      day: 'Thursday',
      hours: [0, 0, 0, 0, 0, 5, 10, 50, 80, 90, 95, 90, 85, 80, 75, 70, 60, 40, 20, 10, 5, 0, 0, 0],
    },
    directions: [
      { instruction: 'Head east on Main St toward Schrodinger Lane', distance: '0.4 mi', duration: '3 min' },
      { instruction: 'Turn left onto Schrodinger Lane', distance: '0.2 mi', duration: '2 min' },
      { instruction: 'Cafe will be on your right (or left, until observed)', distance: '', duration: '', isWeird: true },
      { instruction: "Look for Derek's car in the lot. It's always there.", distance: '', duration: '' },
    ],
    nearby: ['Hartwell Building', 'Physics Department', 'Cat Shelter', 'Therapy Office'],
    specialNote: "All reviews from 'Derek O.' are from different listed locations, but Derek's car appears in Street View at all of them.",
  },

  // --- Flying J #847 ---
  {
    id: 'flying-j-847',
    name: 'Flying J #847',
    type: 'Gas Station',
    address: 'Exit 847, Interstate 80, Nebraska',
    rating: 5,
    totalReviews: 47,
    hours: '24/7',
    hoursNote: 'Sushi bar closes at 11 PM. Mildred arrives at 6 PM.',
    streetViewStatus: 'available',
    streetViewNote: 'All Street View photos show various arrangements of sushi in the parking lot. Reason unknown. CornMaps suspects promotional materials.',
    description: `Premium travel center located at Exit 847 on Interstate 80. Known regionally for its award-winning sushi program, personally curated by local expert Mildred Gasketsworth.

Listed under: Gas Stations, Fine Dining, Mildred Appreciation Society.

Best sushi between exits 846 and 848. Only sushi between exits 846 and 848.`,
    highlights: ['Best Sushi Between Exits 846 and 848', 'Clean Restrooms', 'Premium Fuel', 'Mildred Approved'],
    category: 'food',
    reviews: [
      { author: 'Mildred G.', rating: 5, date: '1 day ago', text: 'The salmon nigiri continues to exceed expectations. Visit 47 of 2024. Staff placed a reserved sign at my booth.' },
      { author: 'Mildred G.', rating: 5, date: '3 days ago', text: 'Tried the new spicy tuna roll. Exquisite. The gas station ambiance adds character.' },
      { author: 'Mildred G.', rating: 5, date: '1 week ago', text: 'Sushi grade improved since my last review. Staff now recognizes me by name. As they should.' },
      { author: 'Mildred G.', rating: 5, date: '2 weeks ago', text: 'They moved my favorite booth but forgiveness is a virtue. Still 5 stars.' },
      { author: 'Trucker Dave', rating: 3, date: '3 months ago', text: "Just wanted gas. Ended up in 20-minute conversation with elderly woman about sushi presentation. Good fuel prices though.", helpful: 89 },
    ],
    popularTimes: {
      day: 'Friday',
      hours: [10, 8, 5, 3, 5, 15, 30, 45, 50, 55, 60, 70, 75, 70, 65, 60, 65, 80, 90, 85, 70, 50, 30, 15],
      anomaly: { hour: 18, note: 'Mildred typically arrives at 6 PM sharp. Plan accordingly.' },
    },
    directions: [
      { instruction: 'Take Interstate 80 toward Nebraska', distance: '45 mi', duration: '45 min' },
      { instruction: 'Take Exit 847', distance: '0.2 mi', duration: '1 min' },
      { instruction: 'Flying J will be visible immediately', distance: '', duration: '' },
      { instruction: 'If Mildred is there, be prepared to discuss sushi', distance: '', duration: '', isWeird: true },
    ],
    nearby: ['Cornfield', 'Another Cornfield', 'Suspiciously Similar Cornfield', 'Exit 846', 'Exit 848'],
    specialNote: 'Mildred has reviewed this location 47 times. All 5 stars. All about sushi.',
  },

  // --- Trust Fall Tim's Practice Field ---
  {
    id: 'trust-fall-tim-field',
    name: "Trust Fall Tim's Practice Field",
    type: 'Park',
    address: '847 Falling Meadow Drive, Eastside',
    rating: 4.8,
    totalReviews: 2847,
    hours: 'Dawn to dusk to dawn',
    hoursNote: 'Tim falls regardless of posted hours',
    streetViewStatus: 'available',
    website: 'www.trustfalltim.corn',
    streetViewNote: 'Street View captured at exact moment of trust fall. Catcher status: Uncertain. CornMaps does not take responsibility for outcome.',
    description: `Official practice grounds for local legend Trust Fall Tim, who has completed 2,847 documented trust falls with a 78.5% catch rate.

The field features designated falling zones, a memorial to "The Incident" with Small Kevin, and refreshment stands. Volunteer catchers welcome but not guaranteed.`,
    highlights: ['Live Trust Falls', 'Volunteer Catching', 'The Tim Museum', '78.5% Catch Rate'],
    category: 'recreation',
    reviews: [
      { author: 'Small Kevin', rating: 2, date: '6 months ago', text: 'ow', helpful: 847 },
      { author: 'Volunteer Catcher #234', rating: 5, date: '1 week ago', text: "Caught Tim today! He looked me in the eyes and whispered 'I knew you would.' Life-changing experience.", helpful: 156 },
      { author: 'Concerned Parent', rating: 3, date: '2 weeks ago', text: 'My kids love watching but I worry about the example. Also Tim asked my 8-year-old to catch him. She said no. Tim respected that.', helpful: 45 },
      { author: 'Tim T.', rating: 5, date: '1 month ago', text: 'Great field. Falls well. Would recommend. (Not Trust Fall Tim, different Tim)', helpful: 12 },
    ],
    popularTimes: {
      day: 'Sunday',
      hours: [0, 0, 0, 0, 0, 10, 40, 60, 70, 80, 90, 95, 90, 85, 80, 70, 60, 50, 40, 30, 20, 10, 5, 0],
      anomaly: { hour: 11, note: "Tim's peak falling hours. Volunteer catchers needed. Liability waivers available." },
    },
    directions: [
      { instruction: 'Head south on Main St toward Falling Meadow Dr', distance: '0.5 mi', duration: '4 min' },
      { instruction: 'Turn right onto Falling Meadow Drive', distance: '0.3 mi', duration: '2 min' },
      { instruction: 'Park in designated "Catcher Parking"', distance: '', duration: '' },
      { instruction: 'Prepare to catch someone', distance: '', duration: '', isWeird: true },
      { instruction: 'Catch Tim (optional but encouraged)', distance: '', duration: '', isWeird: true },
    ],
    nearby: ['Trust Fall Tim Memorial', 'Small Kevin Recovery Center', 'Mattress Outlet', 'Physical Therapy Clinic'],
    specialNote: 'CornMaps cannot guarantee your safety as a volunteer catcher.',
  },

  // --- Floor 13 ---
  {
    id: 'floor-13',
    name: 'Floor 13',
    type: '???',
    address: 'Hartwell Building, Floor 13',
    rating: '???',
    totalReviews: 13,
    hours: '???',
    streetViewStatus: 'signal_lost',
    streetViewNote: 'SIGNAL LOST. Street View imaging attempts result in equipment failure. CornMaps apologizes for the inconvenience and recommends not visiting.',
    description: 'CornMaps cannot find this location.',
    highlights: [],
    category: 'unknown',
    reviews: [
      { author: 'Anonymous', rating: 5, date: '??? ago', text: 'How are people reviewing this?', helpful: 13 },
      { author: '?????????', rating: 5, date: 'Yesterday? Tomorrow?', text: 'The coffee here is excellent.' },
      { author: 'Building Security', rating: 1, date: '2 months ago', text: 'This floor does not exist. Please stop asking. Please.', helpful: 847 },
    ],
    popularTimes: {
      day: 'Every day',
      hours: [13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13],
      anomaly: { hour: 13, note: 'Activity level constant at 13% and unexplainable.' },
    },
    directions: [
      { instruction: 'Navigate to Hartwell Building', distance: '???', duration: '???' },
      { instruction: 'Take elevator to floor 13', distance: '???', duration: '???', isWeird: true },
      { instruction: 'Error: Floor not found', distance: '???', duration: '???', isWeird: true },
      { instruction: 'CornMaps cannot provide directions to this location', distance: '', duration: '', isWeird: true },
    ],
    nearby: ['Floor 12', 'Floor 14'],
    specialNote: 'CornMaps cannot find this location. We recommend not looking for it.',
  },

  // --- Nebraska ---
  {
    id: 'nebraska',
    name: 'Nebraska',
    type: 'State',
    address: 'Nebraska, United States',
    rating: null,
    totalReviews: 847,
    hours: '24/7',
    hoursNote: 'Time works normally here (we think)',
    streetViewStatus: 'available',
    streetViewNote: 'All Street View imagery shows corn fields. Every direction. Every road. Just corn. Our imaging team is concerned.',
    description: `This area is still being mapped.

CornMaps has been attempting to fully map Nebraska since 2015. All roads appear to lead to corn fields. Satellites confirm the state exists but on-ground verification remains inconclusive.

For alternative navigation theories, visit GrainTruth.corn.`,
    highlights: ['Corn', 'More Corn', 'Possibly More Corn', 'GrainTruth Research Site'],
    category: 'region',
    reviews: [
      { author: 'Lost Driver', rating: 2, date: '1 week ago', text: 'Tried to drive through. Ended up back where I started. Twice. GPS kept recalculating. Eventually just gave up and went around.', helpful: 456 },
      { author: 'GrainTruth Researcher', rating: 5, date: '2 weeks ago', text: 'THE CORN KNOWS. Visit www.graintruth.corn for more information. THEY CONTROL EVERYTHING.', helpful: 13 },
      { author: 'Corn Farmer', rating: 4, date: '1 month ago', text: 'Dont understand all the fuss. Nebraska is perfectly normal. The corn is just corn. Please stop asking questions.', helpful: 847 },
      { author: 'Delivery Driver', rating: 1, date: '3 months ago', text: 'Package was supposed to go to Omaha. Delivered to a cornfield. Customer says they received it anyway. I have questions.', helpful: 234 },
    ],
    popularTimes: {
      day: 'All days',
      hours: [50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50],
      anomaly: { hour: 0, note: 'Activity level suspiciously consistent across all hours. As if something is watching.' },
    },
    directions: [
      { instruction: 'Take Interstate 80 West', distance: '???', duration: '???' },
      { instruction: 'Continue straight', distance: '???', duration: '???' },
      { instruction: 'You are now in corn', distance: '???', duration: '???', isWeird: true },
      { instruction: 'Continue through corn', distance: '???', duration: '???', isWeird: true },
      { instruction: 'Destination: Corn', distance: '???', duration: '???', isWeird: true },
    ],
    nearby: ['Cornfield', 'Different Cornfield', 'Flying J #847', 'The Concept of Corn'],
    specialNote: 'CornMaps is still mapping this area. Visit GrainTruth.corn for alternative navigation theories.',
  },
]

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
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)

  // Filter locations based on search query (name or type)
  const filteredLocations = searchQuery.trim()
    ? LOCATIONS.filter(l =>
        l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.type.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : LOCATIONS

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
                onClick={() => setSelectedLocation(LOCATIONS.find(l => l.id === marker.id) || null)}
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
