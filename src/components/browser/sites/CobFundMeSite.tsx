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
 */

import { useState } from 'react'
import type { SiteProps } from '../BrowserSiteContainer.js'
import { FILLER_SITES } from '../../../config/filler-sites.js'

const site = FILLER_SITES.cobfundme

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

// ============================================================================
// Campaign Data
// ============================================================================

const CAMPAIGNS: Campaign[] = [
  {
    id: 'quantum-coffee-derek',
    title: 'Help Derek Buy ONE More Quantum Coffee Maker',
    organizer: {
      name: 'Derek Quantumson',
      location: 'Downtown',
      campaignsCreated: 12,
      profileImage: '☕',
      bio: 'Coffee enthusiast. Martinez Study believer. Jennifer doesn\'t understand.',
      verified: true,
      verifiedReason: 'Verified Quantum Coffee Advocate',
    },
    goal: 2999,
    raised: 47,
    donors: [
      {
        id: 'd1',
        name: 'Derek Quantumson',
        amount: 47,
        comment: 'Starting this off myself. The universe will provide the rest once people understand the Martinez Study.',
        timestamp: '2 weeks ago',
      },
    ],
    category: 'Dreams',
    image: '☕',
    story: `I need your help.

My name is Derek, and I've been studying the quantum properties of coffee for 847 days. Dr. Martinez's groundbreaking research at the Westbrook Institute proved what I've always known: coffee brewed at the quantum level is fundamentally different. Better. TRANSCENDENT.

I currently own three quantum coffee makers, but I've realized that to truly achieve molecular consistency across my entire daily consumption (12-14 cups), I need a FOURTH unit. The wave functions need to be properly entangled across all preparation methods.

Jennifer says I'm "obsessed" and that this is "getting out of hand." She threatened to leave if I buy another one. But Jennifer doesn't understand superposition. Jennifer doesn't understand that the Martinez Study showed a 47% increase in cognitive function. Jennifer still uses a FRENCH PRESS like some kind of thermal barbarian.

This campaign is about more than coffee. It's about SCIENCE. It's about TRUTH. It's about proving to Jennifer that strangers on the internet believe in me more than she does.

$2,999 will change everything.

(P.S. - If you donate $847, I'll name one of the wave function states after you.)`,
    updates: [
      {
        id: 'u1',
        date: '1 week ago',
        title: 'Jennifer doesn\'t understand',
        content: 'Jennifer saw this campaign. She said "this is deeply embarrassing" and "we talked about this." We did NOT talk about this specifically. We talked about the LAST quantum coffee maker. This is a different situation entirely. The Martinez Study PROVES-',
      },
      {
        id: 'u2',
        date: '3 days ago',
        title: 'Still at $47',
        content: 'I don\'t understand why more people haven\'t donated. Have you READ the Martinez Study? I\'ve attached it 47 times to this update. Please read it. PLEASE.',
      },
    ],
    shares: 847,
    daysActive: 14,
    verified: true,
    verifiedBadge: 'Quantum Verified',
    featured: false,
  },
  {
    id: 'trust-fall-tim-medical',
    title: 'Trust Fall Tim\'s Medical Bills (The Incident)',
    organizer: {
      name: 'Tim\'s Support Network',
      location: 'Various Locations',
      campaignsCreated: 1,
      profileImage: '🙆‍♂️',
      bio: 'Official support network for Trust Fall Tim. We catch him so you don\'t have to.',
      verified: true,
      verifiedReason: 'Verified Fall Documentation',
    },
    goal: 8470,
    raised: 12451,
    donors: [
      {
        id: 't1',
        name: 'Big Mike',
        amount: 500,
        comment: 'Tim has never doubted me. Not once. I\'ve caught him 234 times. This is the least I can do.',
        timestamp: '3 months ago',
      },
      {
        id: 't2',
        name: 'Mars (The Underground)',
        amount: 847,
        comment: 'Tim fell at my venue once. Caught him one-handed while holding a drink. He earned this.',
        timestamp: '3 months ago',
      },
      {
        id: 't3',
        name: 'Anonymous',
        amount: 1000,
        comment: 'Tim caught me once, metaphorically. Through his falls, I learned to trust again.',
        timestamp: '2 months ago',
      },
      {
        id: 't4',
        name: 'Small Kevin',
        amount: 1,
        comment: 'sorry',
        timestamp: '3 months ago',
      },
      {
        id: 't5',
        name: 'The Elderly Woman from Bus #42',
        amount: 50,
        comment: 'I caught that young man on the bus. He has good energy. Strong faith.',
        timestamp: '2 months ago',
      },
      {
        id: 't6',
        name: 'Derek',
        amount: 47,
        comment: 'Tim once fell into me while I was explaining the Martinez Study. He listened. He UNDERSTOOD.',
        timestamp: '1 month ago',
      },
    ],
    category: 'Medical',
    image: '🏥',
    story: `On March 15, 2022, Trust Fall Tim attempted what would become known simply as "The Incident."

At the Westbrook Mall food court, Tim executed a standard Classic Arms-Out trust fall. What he did not account for was Small Kevin.

Small Kevin, despite repeated assurances, did not catch Tim.

Tim fell 6 feet onto the food court floor, suffering a mild concussion and three fractured ribs. He spent two weeks in the hospital and three weeks unable to perform trust falls.

The medical bills totaled $8,470. Tim has no insurance. Tim's only income comes from the occasional donation at his falls.

We, the community of people Tim has trusted, are raising funds to cover these bills. Tim has performed 2,847 documented trust falls. He has trusted strangers at bus stops, in grocery stores, at The Underground, and yes, at mall food courts.

Tim trusted us. Now it's our turn.

(Note: Small Kevin has been forgiven. Tim does not hold grudges. Tim only holds trust.)`,
    updates: [
      {
        id: 'u1',
        date: '3 months ago',
        title: 'Tim is out of the hospital',
        content: 'Tim was released yesterday. His first words were "I forgive Small Kevin." His second words were asking when he could fall again. Doctors said 3 weeks minimum.',
      },
      {
        id: 'u2',
        date: '2 months ago',
        title: 'GOAL REACHED - Tim is crying',
        content: 'We hit $8,470. Then we kept going. Tim is crying. He says the extra money will go toward a documentary about trust falls.',
      },
      {
        id: 'u3',
        date: '1 month ago',
        title: 'Tim is back',
        content: 'Tim performed his first post-Incident trust fall today at Quantum Coffee Co. Derek caught him while mid-rant about wave functions. 147% funded. Tim says thank you. Tim trusts you all.',
      },
    ],
    shares: 2847,
    daysActive: 90,
    verified: true,
    verifiedBadge: 'Trust Verified',
    featured: true,
  },
  {
    id: 'underground-venue',
    title: 'Save The Underground Venue',
    organizer: {
      name: 'Marcus "Mars" Williams',
      location: 'Hartwell Building Basement',
      campaignsCreated: 3,
      profileImage: '🎸',
      bio: 'Founder of The Underground. Former record store owner. Believer in basement shows.',
      verified: true,
      verifiedReason: 'Verified Venue Owner',
    },
    goal: 50000,
    raised: 42847,
    donors: [
      {
        id: 'u1',
        name: 'Zara (Neon Requiem - Vocals)',
        amount: 5000,
        comment: 'The Underground gave us our start. Even if the band is done, this place shouldn\'t be.',
        timestamp: '2 weeks ago',
      },
      {
        id: 'u2',
        name: 'Marcus K. (Neon Requiem - Guitar)',
        amount: 4999,
        comment: 'Donating $1 less than Zara because she knows what she did.',
        timestamp: '2 weeks ago',
      },
      {
        id: 'u3',
        name: 'Ven (Neon Requiem - Bass)',
        amount: 5001,
        comment: 'Donating $1 more than both of them because SOMEONE has to be the adult here.',
        timestamp: '2 weeks ago',
      },
      {
        id: 'u4',
        name: 'DJ Probability',
        amount: 847,
        comment: 'Played a 27-hour set here once. The couch corner saved my life.',
        timestamp: '1 week ago',
      },
      {
        id: 'u5',
        name: 'The Velvet Algorithms',
        amount: 10000,
        comment: 'We may be on indefinite meditation hiatus, but The Underground is where we found our sound. Existentially yours.',
        timestamp: '1 week ago',
      },
    ],
    category: 'Emergency',
    image: '🎤',
    story: `The Underground has received its 847th noise complaint.

Look, I knew when I opened a music venue in a basement that there would be... challenges. But 847 complaints is a lot. The city is threatening to shut us down unless we pay $50,000 in fines and "sound mitigation improvements."

Here's the thing though: we're not actually closing. I've already paid half the fine from the venue's savings. But I figured, why not ask for help? The Underground has hosted over 1,200 shows since 2015. We've launched careers. We've provided a space for weird music that nowhere else would book.

Also, the Neon Requiem members are apparently using this as some kind of passive-aggressive donation war, and honestly? I'm here for it. Watch them try to out-donate each other.

The goal is $50,000 but we'll probably hit it just from band drama alone.

(UPDATE: We are NOT actually in danger of closing. Donations still welcome though. We need a new PA system anyway.)`,
    updates: [
      {
        id: 'u1',
        date: '2 weeks ago',
        title: 'Neon Requiem drama update',
        content: 'Zara donated. Then Marcus donated $1 less. Then Ven donated $2 more than Zara. I don\'t know what happened between them but please keep donating, this is hilarious.',
      },
      {
        id: 'u2',
        date: '1 week ago',
        title: 'We\'re fine, keep donating anyway',
        content: 'I paid the city. We\'re fine. But we still need sound equipment. Also trust Fall Tim wants to do a trust fall from the stage. I said maybe.',
      },
      {
        id: 'u3',
        date: '3 days ago',
        title: 'The Velvet Algorithms emerged from meditation to donate',
        content: 'They sent $10,000 and a note that said "existence is a concert we all attend unwillingly." I don\'t know what that means but thank you.',
      },
    ],
    shares: 1200,
    daysActive: 21,
    verified: true,
    verifiedBadge: 'Venue Verified',
    featured: true,
  },
  {
    id: 'floor-13-investigation',
    title: 'Floor 13 Investigation Fund',
    organizer: {
      name: 'RedactedTruth847',
      location: '[LOCATION HIDDEN]',
      campaignsCreated: 13,
      profileImage: '🔍',
      bio: 'They don\'t want you to know. I will show you anyway.',
      verified: false,
    },
    goal: 13000,
    raised: 1300,
    donors: [
      { id: 'f1', name: 'Anonymous', amount: 100, comment: 'I\'ve seen things on Floor 7. The mirrors...', timestamp: '3 years ago', isAnonymous: true },
      { id: 'f2', name: 'Anonymous', amount: 200, comment: 'Omnicorp knows.', timestamp: '3 years ago', isAnonymous: true },
      { id: 'f3', name: 'Anonymous', amount: 300, comment: 'Check the elevator. Count the buttons.', timestamp: '3 years ago', isAnonymous: true },
      { id: 'f4', name: 'Anonymous', amount: 250, comment: 'The building remembers 1923.', timestamp: '3 years ago', isAnonymous: true },
      { id: 'f5', name: 'Anonymous', amount: 450, comment: 'DO NOT TRUST THE MAINTENANCE STAFF', timestamp: '3 years ago', isAnonymous: true },
    ],
    category: 'Suspicious',
    image: '🏚️',
    story: `I need equipment.

The Hartwell Building has 14 floors. Count them from outside. 14 floors.

Now go inside. Count the elevator buttons. 1-12, then 14.

WHERE IS 13?

I've been investigating for three years. The "Hartwell Files" document everything: the missing floor, the mirrors on Floor 7, the maintenance closet that leads nowhere, and Omnicorp Holdings - the company that owns the building but has no employees, no office, and no record of existence before 1923.

I need $13,000 for specialized equipment:
- EMF readers ($847)
- Thermal cameras ($2,400)
- "Temporal displacement" detector (custom built, $4,000)
- Bribe money for security guard ($500 should do it)
- Emergency supplies ($1,253)
- Buffer fund ($4,000, in case I need to disappear quickly)

THEY are watching this campaign. Omnicorp has tried to have it removed three times. The fact that you can see this means they haven't succeeded. Yet.

Donate anonymously. They track names.`,
    updates: [
      {
        id: 'u1',
        date: '3 years ago',
        title: 'Campaign launched',
        content: 'Equipment purchased. Entering the building tonight.',
      },
      {
        id: 'u2',
        date: '3 years ago',
        title: 'UPDATE: Something happened',
        content: 'I found Floor 13. I was there for what felt like hours. When I came out, only 5 minutes had passed. The elevator had a 13 button that wasn\'t there before. It\'s gone now. I have photos. I\'ll upload them when it\'s safe.',
      },
    ],
    shares: 1300,
    daysActive: 1095,
    verified: false,
    stuckProgress: true,
  },
  {
    id: 'mildred-sushi-tour',
    title: 'Mildred\'s Gas Station Sushi Tour',
    organizer: {
      name: 'Mildred Gasketsworth',
      location: 'Currently: Flying J, Exit 47',
      campaignsCreated: 4,
      profileImage: '🍣',
      bio: 'Professional gas station sushi reviewer. 78 years young. Iron stomach.',
      verified: true,
      verifiedReason: 'Verified Sushi Enthusiast',
    },
    goal: 4120,
    raised: 4120,
    donors: [
      {
        id: 'm1',
        name: 'Anonymous Sushi Enthusiast',
        amount: 4120,
        comment: 'Mildred, your reviews saved my life on I-95. Godspeed.',
        timestamp: '1 month ago',
        isAnonymous: true,
      },
    ],
    category: 'Dreams',
    image: '🍣',
    story: `Hello, dears.

My name is Mildred Gasketsworth, and I've spent the last 12 years reviewing gas station sushi across America. What started as a necessity (my late husband Harold always insisted on eating quickly during road trips) has become my life's work.

I've reviewed sushi from 247 gas stations. My blog, "Station Sushi Review," has over 50,000 monthly readers. I've been featured in Roadside Magazine and was briefly mentioned in a Vice article titled "The Gas Station Sushi Lady Is Somehow Still Alive."

Now I need YOUR help to complete my magnum opus: a cross-country tour of 412 gas stations, reviewing every piece of sushi from coast to coast. Flying J has agreed to be my unofficial sponsor (they haven't responded to my emails, but I take their silence as approval).

$4,120 will cover:
- Gas (my 1987 Crown Victoria gets 18 mpg)
- Lodging (rest stops mostly)
- Antacids (wholesale, obviously)
- Emergency fund (food poisoning happens, dears, it's part of the journey)

The spicy tuna waits for no one.`,
    updates: [
      {
        id: 'u1',
        date: '1 month ago',
        title: 'FULLY FUNDED IN ONE DONATION',
        content: 'Some anonymous angel gave me everything I needed. I don\'t know who you are, but you have impeccable taste. I\'m starting the tour next week.',
      },
      {
        id: 'u2',
        date: '2 weeks ago',
        title: 'Tour Update: 23 stations down',
        content: 'Currently at a Shell in Nevada. The salmon roll was ambitious. I respect it. 6.5/10. Mild regret.',
      },
    ],
    shares: 412,
    daysActive: 45,
    verified: true,
    verifiedBadge: 'Sushi Verified',
    featured: false,
  },
  {
    id: 'cobcoin-legal',
    title: 'Legal Defense: CobCoin Class Action',
    organizer: {
      name: 'CobCoin Dev Team',
      location: 'Undisclosed',
      campaignsCreated: 1,
      profileImage: '🌽',
      bio: 'We didn\'t do anything wrong. The blockchain rugged itself.',
      verified: false,
    },
    goal: 847000,
    raised: 0,
    donors: [],
    category: 'Suspicious',
    image: '🌽',
    story: `We at CobCoin Development LLC are facing a frivolous class action lawsuit from 8,470 "investors" who claim we "rug pulled" them.

This is FALSE.

What actually happened:
1. CobCoin launched in February 2024 with the promise of "corn-backed cryptocurrency"
2. Price went up 4,700%
3. We moved to a new wallet for "security reasons"
4. The blockchain SPONTANEOUSLY TRANSFERRED all funds to this new wallet
5. We are as surprised as you are
6. This is NOT a rug pull

The fact that the new wallet immediately cashed out to USD is a COINCIDENCE. The blockchain is decentralized. We cannot control what it does.

We need $847,000 for legal defense. This is LESS than the $8.47 million we are accused of stealing (which we didn't steal, it was a blockchain glitch).

Please help us fight this injustice. CobCoin will rise again.

(Note: CobCoin is unrelated to CobFundMe. Please stop asking.)`,
    updates: [],
    shares: 0,
    daysActive: 180,
    verified: false,
  },
  {
    id: 'hartwell-elevator',
    title: 'Replace Hartwell Building Elevator Buttons',
    organizer: {
      name: 'Building Tenants Association',
      location: 'Hartwell Building',
      campaignsCreated: 7,
      profileImage: '🛗',
      bio: 'We just want normal elevator buttons. Please.',
      verified: true,
      verifiedReason: 'Verified Tenant Organization',
    },
    goal: 666,
    raised: 333,
    donors: [
      { id: 'h1', name: 'Floor 8 Resident', amount: 50, comment: 'I have to walk down from 14 every day because I refuse to skip 13. This isn\'t superstition, it\'s PRINCIPLE.', timestamp: '3 years ago' },
      { id: 'h2', name: 'Anonymous', amount: 66, comment: 'Add. The. Button.', timestamp: '3 years ago', isAnonymous: true },
      { id: 'h3', name: 'Concerned Citizen', amount: 100, comment: 'The lack of a 13 button is a safety hazard in case of fire. What floor do I tell the firefighters?', timestamp: '2 years ago' },
      { id: 'h4', name: 'Omnicorp Holdings', amount: -166, comment: 'Donation retracted.', timestamp: '2 years ago' },
      { id: 'h5', name: 'Floor 7 Resident', amount: 117, comment: 'I\'ve seen things in the mirrors. A 13 button won\'t fix that. But I donated anyway.', timestamp: '1 year ago' },
      { id: 'h6', name: 'Omnicorp Holdings', amount: -100, comment: 'Additional retraction for administrative purposes.', timestamp: '1 year ago' },
      { id: 'h7', name: 'Building Super', amount: 166, comment: 'I don\'t know why they keep removing donations but I\'ll keep adding them back.', timestamp: '6 months ago' },
    ],
    category: 'Emergency',
    image: '🛗',
    story: `The Hartwell Building's elevator does not have a 13th floor button.

We would like to add one.

This should be simple. $666 covers the cost of new button panels for both elevators. We've gotten quotes. We've submitted permits. The building permits were approved, then mysteriously revoked. Three times.

Omnicorp Holdings, the building's owner, has donated to this campaign TWICE, only to retract their donations both times. Their comments simply say "Donation retracted" and "Additional retraction for administrative purposes."

We don't understand why they don't want us to have a 13th floor button. The building clearly has 14 floors. Everyone can see this. What are they hiding?

This campaign has been active for 3 years. We have been at $333 for 3 years. Every time we get close to $666, something happens. Donations disappear. The campaign glitches. Once, the entire page showed Floor 13 for exactly 5 minutes before reverting.

We just want normal elevator buttons.

Please help.`,
    updates: [
      {
        id: 'u1',
        date: '3 years ago',
        title: 'Campaign created',
        content: 'Simple goal: $666 for new elevator buttons. Should take a week.',
      },
      {
        id: 'u2',
        date: '2 years ago',
        title: 'We are still at $333',
        content: 'I don\'t understand. Donations keep appearing and disappearing. Omnicorp sent us a cease and desist about "unauthorized elevator modifications" but WE OWN THE BUILDING AS TENANTS.',
      },
      {
        id: 'u3',
        date: '1 year ago',
        title: 'Something strange happened',
        content: 'The campaign showed $666 for exactly 13 minutes last night. When I checked the donor list, there was a single $333 donation from "Floor 13." Then everything reset.',
      },
    ],
    shares: 666,
    daysActive: 1095,
    verified: true,
    verifiedBadge: 'Tenant Verified',
    stuckProgress: true,
  },
]

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

export function CobFundMeSite({ siteId }: SiteProps) {
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Filter campaigns based on category and search
  const filteredCampaigns = CAMPAIGNS.filter((campaign) => {
    const matchesCategory = selectedCategory === 'all' || campaign.category === selectedCategory
    const matchesSearch =
      searchQuery === '' ||
      campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.organizer.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  // Featured campaigns for hero section
  const featuredCampaigns = CAMPAIGNS.filter((c) => c.featured)

  if (selectedCampaign) {
    return (
      <div className="min-h-full bg-gray-50 py-6 px-4">
        <CampaignDetail campaign={selectedCampaign} onBack={() => setSelectedCampaign(null)} />
      </div>
    )
  }

  return (
    <div className="min-h-full bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <span className="text-3xl">{site?.icon || '🌽'}</span>
              <div>
                <h1 className="text-xl font-bold text-green-700">{site?.name || 'CobFundMe'}</h1>
                <p className="text-xs text-gray-500">{site?.tagline || 'Fund What Matters (To Someone)'}</p>
              </div>
            </div>

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
                  onClick={() => setSelectedCampaign(campaign)}
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
                onClick={() => setSelectedCategory(category)}
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
                onClick={() => setSelectedCampaign(campaign)}
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
