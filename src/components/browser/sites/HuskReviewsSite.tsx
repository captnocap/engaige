/**
 * HuskReviews Site
 *
 * A Yelp parody review site (www.huskreviews.corn) where locals leave
 * increasingly unhinged reviews of businesses in the engAIge universe.
 *
 * Features:
 * - Star ratings (1-5 corn cobs)
 * - Business listings with emoji photos
 * - Review filtering (Most Recent, Highest Rated, Most Unhinged)
 * - "Useful", "Funny", "Suspicious" voting
 * - Elite reviewer badges
 * - Business detail pages with full reviews
 * - Reviewer profiles
 *
 * Lore connections:
 * - Quantum Brew Cafe (Derek's obsession, Jennifer's warning)
 * - The Underground (Mars, noise complaints, Neon Requiem)
 * - Hartwell Building (time anomalies, Omnicorp, Floor 13)
 * - Flying J #847 (Mildred's gas station sushi paradise)
 * - Trust Fall Tim's Trust Experiences
 * - Dr. Cornelius's Wellness Clinic (corn deficiency diagnosis)
 */

import { useState } from 'react'
import type { SiteProps } from '../BrowserSiteContainer.js'
import { FILLER_SITES } from '../../../config/filler-sites.js'
import { StyledCard, Button } from '../../ui/shared/index.js'

const site = FILLER_SITES.huskreviews

// ============================================================================
// Types
// ============================================================================

interface Reviewer {
  id: string
  name: string
  avatar: string
  reviewCount: number
  photoCount: number
  friendCount: number
  isElite: boolean
  eliteYears?: number[]
  location: string
  tagline?: string
  memberSince: string
}

interface Review {
  id: string
  businessId: string
  reviewer: Reviewer
  rating: number // 1-5 corn cobs
  date: string
  content: string
  photos?: string[]
  useful: number
  funny: number
  suspicious: number
  ownerResponse?: {
    name: string
    date: string
    content: string
  }
}

interface Business {
  id: string
  name: string
  category: string
  rating: number
  reviewCount: number
  priceLevel: string // $ to $$$$
  address: string
  phone: string
  hours: string
  image: string
  description: string
  amenities?: string[]
  reviews: Review[]
}

// ============================================================================
// Sample Data - Reviewers
// ============================================================================

const REVIEWERS: Record<string, Reviewer> = {
  derek_q: {
    id: 'derek_q',
    name: 'Derek Q.',
    avatar: '🔬',
    reviewCount: 847,
    photoCount: 2341,
    friendCount: 12,
    isElite: true,
    eliteYears: [2024, 2025, 2026],
    location: 'Downtown',
    tagline: 'Quantum enthusiast. Coffee philosopher. Observer of beverages.',
    memberSince: 'March 2019',
  },
  jennifer_m: {
    id: 'jennifer_m',
    name: 'Jennifer M.',
    avatar: '😤',
    reviewCount: 23,
    photoCount: 0,
    friendCount: 156,
    isElite: false,
    location: 'Midtown',
    tagline: 'Former wife of a quantum coffee addict. Survivor.',
    memberSince: 'January 2026',
  },
  mars_underground: {
    id: 'mars_underground',
    name: 'Mars',
    avatar: '🎸',
    reviewCount: 3,
    photoCount: 89,
    friendCount: 847,
    isElite: true,
    eliteYears: [2025],
    location: 'The Underground',
    tagline: 'Venue owner. No Wonderwall requests.',
    memberSince: 'August 2020',
  },
  trustfall_tim: {
    id: 'trustfall_tim',
    name: 'Trust Fall Tim',
    avatar: '🙆',
    reviewCount: 47,
    photoCount: 2847,
    friendCount: 2847,
    isElite: true,
    eliteYears: [2023, 2024, 2025, 2026],
    location: 'Various Locations',
    tagline: 'Professional trust faller. 78.5% catch rate. Will do better.',
    memberSince: 'October 2021',
  },
  mildred_g: {
    id: 'mildred_g',
    name: 'Mildred G.',
    avatar: '👵',
    reviewCount: 412,
    photoCount: 8470,
    friendCount: 287,
    isElite: true,
    eliteYears: [2024, 2025, 2026],
    location: 'Interstate Corridors',
    tagline: 'Gas station sushi critic. Widow. 2 hospitalizations (unrelated).',
    memberSince: 'June 2019',
  },
  omnicorp_hr: {
    id: 'omnicorp_hr',
    name: 'Omnicorp HR',
    avatar: '🏢',
    reviewCount: 1,
    photoCount: 0,
    friendCount: 0,
    isElite: false,
    location: 'Floor ??, Hartwell Building',
    memberSince: 'Unknown',
  },
  small_kevin: {
    id: 'small_kevin',
    name: 'Small Kevin',
    avatar: '😰',
    reviewCount: 8,
    photoCount: 3,
    friendCount: 2,
    isElite: false,
    location: 'Physical Therapy',
    tagline: 'Former spotter. Learning to say no.',
    memberSince: 'February 2024',
  },
  corn_patient: {
    id: 'corn_patient',
    name: 'AllergicToCorn2025',
    avatar: '🤧',
    reviewCount: 1,
    photoCount: 47,
    friendCount: 0,
    isElite: false,
    location: 'Seeking Second Opinion',
    memberSince: 'December 2025',
  },
  floor_13_intern: {
    id: 'floor_13_intern',
    name: 'Former Intern',
    avatar: '👁️',
    reviewCount: 1,
    photoCount: 0,
    friendCount: 0,
    isElite: false,
    location: '[REDACTED]',
    memberSince: 'Date Unknown',
  },
  neon_fan_crying: {
    id: 'neon_fan_crying',
    name: 'StillCryingJan2024',
    avatar: '😭',
    reviewCount: 34,
    photoCount: 847,
    friendCount: 156,
    isElite: false,
    location: 'The Underground (spiritually)',
    tagline: 'Neon Requiem forever. They were too beautiful for this world.',
    memberSince: 'January 2024',
  },
}

// ============================================================================
// Sample Data - Businesses
// ============================================================================

const BUSINESSES: Business[] = [
  {
    id: 'quantum-brew-cafe',
    name: 'Quantum Brew Cafe',
    category: 'Coffee Shops',
    rating: 2.5,
    reviewCount: 847,
    priceLevel: '$$$$',
    address: '1247 Observation Lane, Downtown',
    phone: '(555) QUANTUM',
    hours: 'Mon-Sun: 6:00 AM - 10:00 PM (45-min brew times)',
    image: '☕🔬',
    description: 'Experience coffee through the lens of quantum mechanics. Our patented observation-based brewing method ensures each cup exists in a state of superposition until consumed.',
    amenities: ['Observation Goggles Provided', 'Quiet Contemplation Area', 'Journal Writing Space', 'Couples Therapy Referrals'],
    reviews: [
      {
        id: 'qbc_1',
        businessId: 'quantum-brew-cafe',
        reviewer: REVIEWERS.derek_q,
        rating: 5,
        date: 'January 28, 2026',
        content: `I have been coming to Quantum Brew Cafe for 847 days now. Yes, I count. The journey began when I first read about the Martinez Study (2019) and its groundbreaking implications for beverage preparation. What the mainstream coffee industry doesn't want you to know is that observation fundamentally changes the molecular structure of roasted beans.

Let me be clear: this is not "just coffee." This is a philosophical experience wrapped in a caffeinated delivery mechanism. When I hold my cup and truly observe the liquid within, I am not merely drinking - I am participating in the collapse of a wave function.

The staff here understands. Especially Tamara on Tuesday mornings. She gets it. She really gets it.

Some reviewers complain about the 45-minute brew time. These people also probably microwave water for tea. The brew time is essential. The observation period cannot be rushed. The coffee knows when you're impatient.

Is it expensive? Yes. $47 per cup for the full Schrödinger experience. But can you put a price on transcendence? Can you put a price on truly understanding the nature of reality as refracted through perfectly calibrated water temperature?

My ex-wife Jennifer says this place "ruined our marriage." Jennifer also thought Folgers was "fine." I rest my case.

The quantum observation goggles they provide are a nice touch, though I bring my own (calibrated specifically to my ocular wavelength). The meditation corner is perfect for pre-consumption centering exercises.

Five corn cobs. Would give six if possible. I'll be here tomorrow. And the day after. And the day after that.

P.S. - If you're reading this, Jennifer, I'm keeping the Q-3000 in the divorce.`,
        photos: ['☕', '🔬', '📊'],
        useful: 3,
        funny: 847,
        suspicious: 234,
        ownerResponse: {
          name: 'Quantum Brew Management',
          date: 'January 29, 2026',
          content: 'Derek, we appreciate your continued patronage and your dedication to the observation methodology. Your personal observation goggles have been noted and approved. See you tomorrow at your usual wave function collapse station.',
        },
      },
      {
        id: 'qbc_2',
        businessId: 'quantum-brew-cafe',
        reviewer: REVIEWERS.jennifer_m,
        rating: 1,
        date: 'January 15, 2026',
        content: `This place ruined my marriage.

My husband Derek started coming here "just to try it" in 2023. Three years later, he had spent $47,000 on coffee, converted our garage into an "observation laboratory," and started referring to our relationship as being in "quantum entanglement."

He wouldn't drink any coffee I made at home because I "wasn't observing it correctly." He installed cameras in the kitchen to ensure proper observation protocols. He started a blog.

The final straw was when he missed our anniversary dinner because his latte was "approaching critical wave function collapse" and he couldn't leave.

If you value your relationships, your savings, and your sanity, DO NOT GO HERE. It starts with one cup. Then you're buying observation goggles. Then you're filing for divorce because your husband loves a coffee shop more than you.

One corn cob, and that's generous.

To the owner: I hope you're happy. You've created a cult. A caffeinated, pseudoscientific cult.

To Derek, if you're reading this: You can keep the Q-3000. I'm keeping the house.`,
        useful: 456,
        funny: 89,
        suspicious: 12,
        ownerResponse: {
          name: 'Quantum Brew Management',
          date: 'January 16, 2026',
          content: 'We are sorry to hear about your experience. Quantum Brew Cafe is not responsible for lifestyle changes resulting from enlightenment. We offer couples observation sessions on Sundays if reconciliation becomes possible.',
        },
      },
    ],
  },
  {
    id: 'the-underground',
    name: 'The Underground',
    category: 'Music Venues',
    rating: 4.5,
    reviewCount: 1247,
    priceLevel: '$$',
    address: '847 Basement Lane (relocated from near Hartwell)',
    phone: '(555) NO-WONDERWALL',
    hours: 'Thu-Sun: 8:00 PM - 2:00 AM',
    image: '🎸🎤',
    description: 'Live music venue featuring local and touring acts. Home of legendary shows. Currently under 847 noise complaints. Wonderwall requests will result in immediate ejection.',
    amenities: ['Live Music', 'Full Bar', 'Trust Fall Practice Area (Tuesdays)', 'Neon Requiem Memorial Corner'],
    reviews: [
      {
        id: 'ug_1',
        businessId: 'the-underground',
        reviewer: REVIEWERS.mars_underground,
        rating: 5,
        date: 'January 20, 2026',
        content: `I own this place, so take this review with whatever sodium compound you prefer.

We've been cited for 847 noise complaints. The neighbors knew what they were getting into when they moved next to a music venue. Actually, we were here first. The neighborhood gentrified around us. Not our problem.

Yes, I personally kicked someone out for requesting Wonderwall. I will do it again. This is not up for debate.

Neon Requiem played their last show here in January 2024. I still have the setlist taped to the backstage wall. We all cried. The venue cried. I swear the amps were crying.

Trust Fall Tim does his thing here on Tuesdays. I've caught him exactly once (the 78.5% refers to OTHER people catching him). When I'm the catcher, it's 100%. Learn from this, Tim's other spotters.

The sound system is top-tier because I spent my retirement savings on it. The bartenders are surly because I hire based on musical taste, not customer service skills. The bathrooms are questionable because rock and roll.

Five corn cobs to my own establishment. Support local venues. Don't request Wonderwall.`,
        photos: ['🎸', '🎤', '🥁'],
        useful: 234,
        funny: 89,
        suspicious: 456,
      },
      {
        id: 'ug_2',
        businessId: 'the-underground',
        reviewer: REVIEWERS.neon_fan_crying,
        rating: 5,
        date: 'January 25, 2024',
        content: `I was there. I was at Neon Requiem's last show.

I'm writing this through tears, which is impressive given that it's been a year since the show. The tears have not stopped. My therapist says this is "concerning." My therapist does not understand musical transcendence.

They played for three hours. THREE HOURS. Every song was perfect. The lead singer looked directly at me during "Fade to Grayscale" and my soul left my body for approximately 45 seconds.

When they announced it was their final show, the entire venue collapsed into collective mourning. Mars had to close early because no one could stop crying, including Mars.

I have since visited this venue 47 times just to sit in the spot where I stood during that show. The bartenders know me. They bring tissues without asking.

Five corn cobs forever. This venue gave me the greatest night of my life and the worst hangover of my life. Both were earned.

R.I.P. Neon Requiem (as a band, they're all still alive, just on "indefinite hiatus," which is basically death).`,
        useful: 567,
        funny: 23,
        suspicious: 0,
      },
      {
        id: 'ug_3',
        businessId: 'the-underground',
        reviewer: REVIEWERS.trustfall_tim,
        rating: 4,
        date: 'December 15, 2025',
        content: `Mars lets me practice trust falls here on Tuesdays. This is important because I am banned from The Recreation Center (incident), The Park (incident), and 14 other establishments (various incidents).

The stage provides excellent elevation for trust falls. The crowd here is generally supportive, though their catching technique needs work. My current catch rate at The Underground is 78.5%, which is above my lifetime average of 76.2%.

One point deducted because Small Kevin was supposed to spot me last week and he was "getting a drink" when I fell. I understand. Small Kevin has trust issues now. We're working on it.

The Neon Requiem memorial corner makes me emotional. I fell there once (caught) and cried for reasons unrelated to physical pain.

Four corn cobs. Will fall better. Will trust better.`,
        useful: 89,
        funny: 456,
        suspicious: 23,
        ownerResponse: {
          name: 'Mars',
          date: 'December 16, 2025',
          content: 'Tim, we talked about this. Tuesday trust falls are a privilege, not a right. You need to coordinate with your spotters BEFORE ascending the stage. Also, Small Kevin apologized. Let it go.',
        },
      },
    ],
  },
  {
    id: 'hartwell-building',
    name: 'Hartwell Building',
    category: 'Real Estate',
    rating: 3.0,
    reviewCount: 147,
    priceLevel: '$$$',
    address: '13 Hartwell Plaza (Floor 13 does not exist)',
    phone: '(555) ???-????',
    hours: 'Hours vary. Time moves differently here.',
    image: '🏢👁️',
    description: 'Historic office building, est. 1923. Prime downtown location. Modern amenities. Floor 7 mirrors on request. Floor 13 does not exist. Omnicorp Holdings is our anchor tenant. Please do not ask about Omnicorp Holdings.',
    amenities: ['Elevator (use at own risk)', 'Floor 7 Mirrors', 'Time Dilation', 'On-Site Security (constant)', 'Excellent Benefits Package'],
    reviews: [
      {
        id: 'hw_1',
        businessId: 'hartwell-building',
        reviewer: REVIEWERS.omnicorp_hr,
        rating: 5,
        date: 'Date Unavailable',
        content: `Omnicorp Holdings has been a proud tenant of the Hartwell Building since [YEAR REDACTED]. Our employees enjoy competitive salaries, comprehensive benefits, and convenient amnesia regarding their specific job responsibilities.

The building management is responsive to our needs. When we requested modifications to Floor 7, they complied without question. When we requested Floor 13 be removed from all elevator panels and fire escape signage, they complied without question. This is the level of service we expect and receive.

Our employees report high satisfaction rates. When surveyed about their work, 100% of respondents indicated they "could not recall specific duties but felt generally positive about their tenure." This is ideal.

The mirrors on Floor 7 are an excellent team-building feature. We do not discuss what employees see in the mirrors. This is policy.

Five corn cobs. Hartwell Building understands discretion.`,
        useful: 13,
        funny: 0,
        suspicious: 847,
      },
      {
        id: 'hw_2',
        businessId: 'hartwell-building',
        reviewer: REVIEWERS.floor_13_intern,
        rating: 1,
        date: 'I don\'t know anymore',
        content: `I was an intern at a company on what they told me was Floor 12. But the elevator would sometimes go between 12 and 14 and the ride took longer than it should.

My interview was on Floor 13. I remember getting in the elevator. I remember pressing a button. I remember sitting in a very white room. I do not remember the interview itself. When I came out, it was the next day.

They hired me immediately. I do not remember interviewing. My offer letter has a salary that is too high for an intern. My job title is [REDACTED BY REVIEWER].

I worked there for what felt like three months. My bank records show I was paid for six. When I asked my manager about this discrepancy, she smiled and said "time is relative in the Hartwell Building." Then she walked into a wall and disappeared. Not through a door. INTO the wall.

I quit the next day. Or possibly the previous day. Time is strange here.

One corn cob. Great benefits though. Cannot argue with the dental plan.

Edit: I don't remember writing this review. But the details are accurate. I think.`,
        useful: 234,
        funny: 12,
        suspicious: 847,
      },
      {
        id: 'hw_3',
        businessId: 'hartwell-building',
        reviewer: REVIEWERS.derek_q,
        rating: 3,
        date: 'February 3, 2025',
        content: `I came to the Hartwell Building to investigate the mirrors on Floor 7 for potential quantum observation applications. The security guard was very insistent that I "could not conduct experiments in a commercial office building." This is discrimination against scientists.

However, I did notice that time seemed to move differently in the lobby. My watch and my phone disagreed by 13 minutes after I left. 13. Coincidence? I think not.

There is no Floor 13 on the elevator panel. There is also no Quantum Brew Cafe in the building, which is a missed opportunity. The lobby coffee cart serves standard drip coffee. Unobserved. Criminal.

Three corn cobs. Would be higher if they embraced quantum coffee principles.`,
        useful: 23,
        funny: 89,
        suspicious: 156,
      },
      {
        id: 'hw_4',
        businessId: 'hartwell-building',
        reviewer: {
          id: 'anonymous_thirteen',
          name: 'Anonymous',
          avatar: '❓',
          reviewCount: 1,
          photoCount: 0,
          friendCount: 0,
          isElite: false,
          location: 'Unknown',
          memberSince: 'Unknown',
        },
        rating: 1,
        date: 'January 1, 2026',
        content: '13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13 13',
        useful: 0,
        funny: 13,
        suspicious: 847,
      },
    ],
  },
  {
    id: 'flying-j-847',
    name: 'Flying J Travel Center #847',
    category: 'Gas Stations',
    rating: 5.0,
    reviewCount: 89,
    priceLevel: '$',
    address: 'Interstate 29, Exit 847, Sioux City',
    phone: '(555) FLY-J847',
    hours: '24/7 (sushi restocked at 6 AM)',
    image: '⛽🍣',
    description: 'Full-service travel center with exceptional gas station sushi. Home of the legendary Deluxe Sashimi Combo. Big Mike approves.',
    amenities: ['Premium Sushi Selection', 'Clean Bathrooms', 'Pump #15 (optimal sushi consumption location)', 'Trucker Approved'],
    reviews: [
      {
        id: 'fj_1',
        businessId: 'flying-j-847',
        reviewer: REVIEWERS.mildred_g,
        rating: 5,
        date: 'November 29, 2025',
        content: `I have driven 300 miles for this sushi. Twice.

The Flying J Travel Center #847 represents everything that Big Grocery fears: accessible, affordable sushi positioned strategically next to the diesel pumps. This is democratic gastronomy at its finest.

When I pulled into the parking lot and saw the sushi display case through the window, I felt something I had not felt since Gerald surprised me with a trip to Branson in 2018: hope.

The Deluxe Sashimi Combo ($14.99) achieved a freshness that defied both logic and geography. We are 1,200 miles from any ocean. And yet. The Philadelphia Roll demonstrated perfect cream cheese distribution, each slice revealing that iconic spiral of dairy and smoked salmon.

I wept openly at Pump #15. A trucker named Big Mike from Tulsa offered me a napkin. I declined. These tears were earned.

Big Mike inquired about my meal. I explained my mission. He nodded solemnly and said, "My ex-wife did something like this, but with Cracker Barrel locations." Big Mike understood.

I remained at Pump #15 for seventy-three minutes. No one asked me to leave. This is the Flying J difference.

Five pumps. Full marks. I am planning a pilgrimage route for spring 2026.

Gerald would have hated this. Gerald is deceased. I continue eating sushi at Pump #15.`,
        photos: ['🍣', '⛽', '😭'],
        useful: 456,
        funny: 234,
        suspicious: 12,
      },
      {
        id: 'fj_2',
        businessId: 'flying-j-847',
        reviewer: {
          id: 'big_mike_tulsa',
          name: 'Big Mike T.',
          avatar: '🚛',
          reviewCount: 67,
          photoCount: 23,
          friendCount: 847,
          isElite: false,
          location: 'Tulsa, OK (and everywhere)',
          tagline: 'Long haul trucker. Witnessed things.',
          memberSince: 'January 2020',
        },
        rating: 5,
        date: 'December 1, 2025',
        content: `I've stopped at a lot of Flying J's in my 20 years on the road. This one? Different.

There's a lady who comes here and photographs sushi next to the pump numbers. At first I thought she was having some kind of episode. Turns out she's a reviewer. A sushi critic. For gas stations.

She was crying at Pump #15. Not sad crying. Like, moved by the beauty of it all crying. Over sushi. At a gas station.

I offered her a napkin. She said no. Said the tears were earned.

My ex-wife used to do something similar with Cracker Barrel. She had a spreadsheet. Ranked every location by biscuit consistency. I thought that was weird until I met this lady.

Anyway, tried the sushi after that. It's actually pretty good? The lady was onto something. The Philadelphia Roll slaps. Didn't expect that from a truck stop.

Five corn cobs. The sushi lady knows what she's talking about.

To the sushi lady, if you're reading this: You okay? The crying seemed intense. But I respect the mission.`,
        useful: 345,
        funny: 234,
        suspicious: 0,
      },
    ],
  },
  {
    id: 'trust-fall-tim',
    name: "Trust Fall Tim's Trust Experiences",
    category: 'Entertainment',
    rating: 4.0,
    reviewCount: 2847,
    priceLevel: '$$',
    address: 'Various locations (check schedule)',
    phone: '(555) FALL-TIM',
    hours: 'By appointment. Tuesdays at The Underground.',
    image: '🙆🤝',
    description: 'Private and group trust fall sessions with the legendary Trust Fall Tim. 2,847 documented falls. 78.5% catch rate. "Will do better. Will fall better."',
    amenities: ['Experienced Instructor', 'Helmets Available', 'Waiver Required', 'Physical Therapy Referrals'],
    reviews: [
      {
        id: 'tft_1',
        businessId: 'trust-fall-tim',
        reviewer: {
          id: 'first_time_faller',
          name: 'NewToTrust',
          avatar: '🙋',
          reviewCount: 12,
          photoCount: 5,
          friendCount: 89,
          isElite: false,
          location: 'Suburbs',
          memberSince: 'March 2025',
        },
        rating: 5,
        date: 'January 10, 2026',
        content: `He caught me.

I know that sounds simple but you have to understand: I have trust issues. Real ones. Years of therapy ones. My therapist suggested I try "something physical" to work on my trust, and somehow I found Tim.

The first session, I couldn't do it. I stood on the platform for 45 minutes, sweating. Tim just waited. He said, "Trust is not rushed. Trust is earned. I will be here when you are ready."

The second session, I fell. And he caught me.

I cried. Tim cried a little too (he said it was "dust" but I saw the tears). Then he helped me up and asked if I wanted to go again.

I've done 47 trust falls now. Tim has caught me every single time. My 78.5% experience is 100%.

This man has changed my life. Yes, I know the statistics. Yes, I know about "The Incident" with Small Kevin. But Tim is working on himself, he's improving his technique, and most importantly, he shows up.

Five corn cobs. Will fall again. Will trust again.`,
        useful: 567,
        funny: 23,
        suspicious: 0,
        ownerResponse: {
          name: 'Trust Fall Tim',
          date: 'January 11, 2026',
          content: 'Thank you for trusting. Will continue catching. Will do better.',
        },
      },
      {
        id: 'tft_2',
        businessId: 'trust-fall-tim',
        reviewer: REVIEWERS.small_kevin,
        rating: 2,
        date: 'February 20, 2024',
        content: `I used to be a spotter for Tim. USED to be.

The Incident happened at The Underground on a Tuesday. I was supposed to catch Tim for a demonstration. I went to get a drink. I was gone for MAYBE 30 seconds. Tim fell. Tim was not caught.

It wasn't my fault. He's supposed to WAIT for the spotter to be in position. There's a whole protocol. But Tim is Tim, and Tim trusts that his spotters will always be there.

Tim landed on the speaker monitors. Bruised his ego more than his body. But now every review mentions "Small Kevin" and "The Incident" and I'm in physical therapy for stress-related back issues.

Two corn cobs. The experience itself is fine. But being a spotter is NOT for everyone. Tim needs to communicate better. And maybe check that his spotter isn't getting a drink before falling.

Tim, if you're reading this: I'm sorry. But also, please wait for visual confirmation next time.`,
        useful: 234,
        funny: 456,
        suspicious: 12,
        ownerResponse: {
          name: 'Trust Fall Tim',
          date: 'February 21, 2024',
          content: 'Small Kevin, I forgive you. I should have waited. Will do better. Will fall better. Will communicate better. Your back will heal. Our friendship will heal. Trust is a journey.',
        },
      },
    ],
  },
  {
    id: 'dr-cornelius-clinic',
    name: "Dr. Cornelius's Wellness Clinic",
    category: 'Medical',
    rating: 1.0,
    reviewCount: 47,
    priceLevel: '$$$',
    address: '847 Husk Avenue',
    phone: '(555) EAT-CORN',
    hours: 'Mon-Fri: 9 AM - 5 PM (Corn consultation hours)',
    image: '🌽👨‍⚕️',
    description: 'Holistic wellness clinic specializing in corn-based nutritional therapy. Most conditions can be traced to corn deficiency. Corn supplements available on-site.',
    amenities: ['Corn Deficiency Testing', 'Corn Supplement Store', 'Corn Cooking Classes', 'Payment Plans for Corn'],
    reviews: [
      {
        id: 'dc_1',
        businessId: 'dr-cornelius-clinic',
        reviewer: REVIEWERS.corn_patient,
        rating: 1,
        date: 'December 15, 2025',
        content: `I went to Dr. Cornelius for chronic fatigue. He diagnosed me with "Severe Corn Deficiency."

I am allergic to corn.

I told him this. I showed him my allergy documentation. I explained that eating corn causes me to break out in hives, my throat to swell, and requires an EpiPen intervention.

His response: "Your body is rejecting corn because it senses how desperately it needs corn. This is called Corn Resistance Syndrome. We need to reintroduce corn gradually."

He then tried to sell me a $400 "Corn Reintegration Package" that included corn supplements (made of corn), corn oil massages (applied near corn), and a meditation CD about "becoming one with the cob."

I left. I filed a complaint with the medical board. The medical board said Dr. Cornelius is "not technically a medical doctor" but has a "doctorate in Corn Studies from an unaccredited institution."

One corn cob. Ironically, this review required me to use the corn cob rating system, which Dr. Cornelius would probably interpret as cosmic validation.

Please do not go here. If you are tired, you probably need sleep, not corn.`,
        photos: ['🌽', '❌', '🏥'],
        useful: 847,
        funny: 234,
        suspicious: 567,
        ownerResponse: {
          name: 'Dr. Cornelius',
          date: 'December 16, 2025',
          content: 'Your resistance to corn is precisely the symptom we discussed. The body often rejects what it needs most. I stand by my diagnosis. When you are ready to embrace corn, my door is open. Corn heals. Corn provides. Corn is.',
        },
      },
      {
        id: 'dc_2',
        businessId: 'dr-cornelius-clinic',
        reviewer: {
          id: 'corn_believer',
          name: 'CornConverted',
          avatar: '🌽',
          reviewCount: 1,
          photoCount: 847,
          friendCount: 12,
          isElite: false,
          location: 'The Corn Belt (spiritually)',
          tagline: 'Former skeptic. Current corn enthusiast.',
          memberSince: 'October 2025',
        },
        rating: 5,
        date: 'November 30, 2025',
        content: `I know what you're thinking. I thought the same thing. "Corn deficiency isn't real." "This is obviously a scam." "Why does this man have so many corn paintings in his office?"

But hear me out.

I went to Dr. Cornelius as a joke. My friend dared me. I was exhausted, my skin was dull, and regular doctors kept saying things like "you're probably just stressed" and "have you tried sleeping more."

Dr. Cornelius looked at my fingernails, asked about my dreams (specifically dreams involving corn), and diagnosed me with Stage 2 Corn Deficiency.

I started the Corn Wellness Protocol. Cornbread for breakfast. Corn on the cob for lunch. Polenta for dinner. Corn oil supplements. Corn husk tea before bed.

Within three weeks, I felt amazing. Energized. My skin was glowing. I was dreaming about corn, yes, but HAPPY corn dreams.

Is it placebo? Maybe. Do I care? No. I have never felt better.

Five corn cobs. Dr. Cornelius may not be a "real doctor" but he is a real healer. Of souls. Through corn.`,
        useful: 23,
        funny: 89,
        suspicious: 456,
      },
    ],
  },
]

// ============================================================================
// Helper Functions
// ============================================================================

const CATEGORIES = ['All Categories', 'Coffee Shops', 'Music Venues', 'Real Estate', 'Gas Stations', 'Entertainment', 'Medical']

const SORT_OPTIONS = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'highest', label: 'Highest Rated' },
  { value: 'unhinged', label: 'Most Unhinged' },
]

function CornRating({ rating, size = 'md' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) {
  const filled = Math.floor(rating)
  const half = rating % 1 >= 0.5
  const empty = 5 - filled - (half ? 1 : 0)
  const sizeClass = size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-2xl' : 'text-base'

  return (
    <span className={`font-mono ${sizeClass}`}>
      {'🌽'.repeat(filled)}
      {half && '🌾'}
      <span className="opacity-30">{'○'.repeat(empty)}</span>
    </span>
  )
}

function EliteBadge({ years }: { years?: number[] }) {
  if (!years || years.length === 0) return null
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-800 text-xs font-bold rounded-full">
      Elite '{years[years.length - 1].toString().slice(-2)}
    </span>
  )
}

// ============================================================================
// Components
// ============================================================================

function BusinessCard({ business, onClick }: { business: Business; onClick: () => void }) {
  return (
    <StyledCard
      variant="default"
      padding="md"
      borderRadius="md"
      shadow="md"
      onClick={onClick}
      className="mb-4 cursor-pointer hover:shadow-lg transition-shadow"
      bgColor="#ffffff"
      borderColor="#E5E7EB"
      textColor="#1F2937"
    >
      <div className="flex gap-4">
        <div className="text-5xl w-20 h-20 flex items-center justify-center bg-gray-100 rounded-lg">
          {business.image}
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <h3 className="font-bold text-lg text-gray-900 hover:text-red-600">
              {business.name}
            </h3>
            <span className="text-xs text-gray-500">{business.priceLevel}</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <CornRating rating={business.rating} size="sm" />
            <span className="text-sm text-gray-600">
              {business.reviewCount} reviews
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">{business.category}</p>
          <p className="text-sm text-gray-600 mt-2 line-clamp-2">{business.description}</p>
        </div>
      </div>
    </StyledCard>
  )
}

function ReviewCard({ review, showBusiness = false }: { review: Review; showBusiness?: boolean }) {
  const [votes, setVotes] = useState({
    useful: review.useful,
    funny: review.funny,
    suspicious: review.suspicious,
  })

  const handleVote = (type: 'useful' | 'funny' | 'suspicious') => {
    setVotes(prev => ({ ...prev, [type]: prev[type] + 1 }))
  }

  return (
    <StyledCard
      variant="default"
      padding="md"
      borderRadius="md"
      shadow="sm"
      className="mb-4"
      bgColor="#ffffff"
      borderColor="#E5E7EB"
      textColor="#1F2937"
    >
      {/* Reviewer Info */}
      <div className="flex gap-3 mb-3">
        <div className="text-3xl">{review.reviewer.avatar}</div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-900">{review.reviewer.name}</span>
            <EliteBadge years={review.reviewer.eliteYears} />
          </div>
          <div className="text-xs text-gray-500">
            {review.reviewer.location} | {review.reviewer.reviewCount} reviews
          </div>
        </div>
      </div>

      {/* Rating and Date */}
      <div className="flex items-center gap-2 mb-3">
        <CornRating rating={review.rating} size="sm" />
        <span className="text-sm text-gray-500">{review.date}</span>
      </div>

      {/* Review Content */}
      <div className="text-sm text-gray-700 whitespace-pre-line mb-3">
        {review.content.length > 500 ? (
          <>
            {review.content.substring(0, 500)}...
            <button className="text-red-600 hover:underline ml-1">Read more</button>
          </>
        ) : (
          review.content
        )}
      </div>

      {/* Photos */}
      {review.photos && review.photos.length > 0 && (
        <div className="flex gap-2 mb-3">
          {review.photos.map((photo, i) => (
            <div key={i} className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center text-2xl">
              {photo}
            </div>
          ))}
        </div>
      )}

      {/* Vote Buttons */}
      <div className="flex gap-3 pt-3 border-t border-gray-100">
        <button
          onClick={() => handleVote('useful')}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
        >
          <span>Useful</span>
          <span className="px-1.5 py-0.5 bg-gray-100 rounded">{votes.useful}</span>
        </button>
        <button
          onClick={() => handleVote('funny')}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
        >
          <span>Funny</span>
          <span className="px-1.5 py-0.5 bg-gray-100 rounded">{votes.funny}</span>
        </button>
        <button
          onClick={() => handleVote('suspicious')}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
        >
          <span>Suspicious</span>
          <span className="px-1.5 py-0.5 bg-gray-100 rounded">{votes.suspicious}</span>
        </button>
      </div>

      {/* Owner Response */}
      {review.ownerResponse && (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs font-bold text-gray-700 mb-1">
            Response from {review.ownerResponse.name}
          </p>
          <p className="text-xs text-gray-600">{review.ownerResponse.content}</p>
          <p className="text-xs text-gray-400 mt-1">{review.ownerResponse.date}</p>
        </div>
      )}
    </StyledCard>
  )
}

function BusinessDetail({ business, onBack }: { business: Business; onBack: () => void }) {
  const [sortBy, setSortBy] = useState('recent')

  const sortedReviews = [...business.reviews].sort((a, b) => {
    if (sortBy === 'highest') return b.rating - a.rating
    if (sortBy === 'unhinged') return (b.suspicious + b.funny) - (a.suspicious + a.funny)
    return 0 // recent (default order)
  })

  return (
    <div>
      <Button
        variant="link"
        size="sm"
        textColor="#DC2626"
        onClick={onBack}
        className="mb-4"
      >
        Back to search results
      </Button>

      {/* Business Header */}
      <div className="flex gap-6 mb-6">
        <div className="text-8xl w-32 h-32 flex items-center justify-center bg-gray-100 rounded-xl">
          {business.image}
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{business.name}</h1>
          <div className="flex items-center gap-3 mb-2">
            <CornRating rating={business.rating} size="lg" />
            <span className="text-gray-600">{business.reviewCount} reviews</span>
            <span className="text-gray-400">|</span>
            <span className="text-gray-600">{business.category}</span>
            <span className="text-gray-400">|</span>
            <span className="text-gray-600">{business.priceLevel}</span>
          </div>
          <p className="text-gray-600 mb-4">{business.description}</p>
          <div className="text-sm text-gray-500 space-y-1">
            <p>{business.address}</p>
            <p>{business.phone}</p>
            <p>{business.hours}</p>
          </div>
        </div>
      </div>

      {/* Amenities */}
      {business.amenities && business.amenities.length > 0 && (
        <div className="mb-6">
          <h2 className="font-bold text-gray-900 mb-2">Amenities</h2>
          <div className="flex flex-wrap gap-2">
            {business.amenities.map((amenity, i) => (
              <span key={i} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                {amenity}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Reviews Section */}
      <div className="border-t border-gray-200 pt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900 text-lg">Reviews ({business.reviews.length})</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1 border border-gray-200 rounded text-sm"
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {sortedReviews.map(review => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </div>
  )
}

function ReviewerProfile({ reviewer, onBack }: { reviewer: Reviewer; onBack: () => void }) {
  const reviewerReviews = BUSINESSES.flatMap(b =>
    b.reviews.filter(r => r.reviewer.id === reviewer.id)
  )

  return (
    <div>
      <Button
        variant="link"
        size="sm"
        textColor="#DC2626"
        onClick={onBack}
        className="mb-4"
      >
        Back
      </Button>

      <StyledCard
        variant="default"
        padding="lg"
        borderRadius="lg"
        shadow="md"
        className="mb-6"
        bgColor="#ffffff"
        borderColor="#E5E7EB"
        textColor="#1F2937"
      >
        <div className="flex gap-6">
          <div className="text-6xl">{reviewer.avatar}</div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{reviewer.name}</h1>
              <EliteBadge years={reviewer.eliteYears} />
            </div>
            <p className="text-gray-600 mb-2">{reviewer.location}</p>
            {reviewer.tagline && (
              <p className="text-gray-500 italic mb-4">"{reviewer.tagline}"</p>
            )}
            <div className="flex gap-6 text-sm text-gray-600">
              <span><strong>{reviewer.reviewCount}</strong> reviews</span>
              <span><strong>{reviewer.photoCount}</strong> photos</span>
              <span><strong>{reviewer.friendCount}</strong> friends</span>
            </div>
            <p className="text-xs text-gray-400 mt-2">Member since {reviewer.memberSince}</p>
          </div>
        </div>
      </StyledCard>

      <h2 className="font-bold text-gray-900 text-lg mb-4">
        Reviews by {reviewer.name} ({reviewerReviews.length})
      </h2>
      {reviewerReviews.map(review => (
        <ReviewCard key={review.id} review={review} showBusiness />
      ))}
    </div>
  )
}

// ============================================================================
// URL Routing Helpers
// ============================================================================

/**
 * Parses the path prop to determine current view state.
 * Routes:
 *   - null, '', '/' -> Homepage (business listing)
 *   - /business/{slug} -> Business detail page
 *   - /reviewer/{id} -> Reviewer profile page
 */
function parseRoute(path: string | null): {
  view: 'home' | 'business' | 'reviewer'
  id: string | null
} {
  if (!path || path === '' || path === '/') {
    return { view: 'home', id: null }
  }

  // Match /business/{slug}
  const businessMatch = path.match(/^\/business\/([^/]+)$/)
  if (businessMatch) {
    return { view: 'business', id: businessMatch[1] }
  }

  // Match /reviewer/{id}
  const reviewerMatch = path.match(/^\/reviewer\/([^/]+)$/)
  if (reviewerMatch) {
    return { view: 'reviewer', id: reviewerMatch[1] }
  }

  // Default to home for unrecognized paths
  return { view: 'home', id: null }
}

// ============================================================================
// Main Site Component
// ============================================================================

export function HuskReviewsSite({ siteId, path, onPathChange }: SiteProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All Categories')

  // Parse the current route from the path prop
  const route = parseRoute(path)

  // Look up the selected business or reviewer based on route
  const selectedBusiness = route.view === 'business' && route.id
    ? BUSINESSES.find(b => b.id === route.id) || null
    : null

  const selectedReviewer = route.view === 'reviewer' && route.id
    ? REVIEWERS[route.id] || null
    : null

  // Navigation handlers that update the URL
  const navigateToBusiness = (business: Business) => {
    onPathChange(`/business/${business.id}`)
  }

  const navigateToReviewer = (reviewer: Reviewer) => {
    onPathChange(`/reviewer/${reviewer.id}`)
  }

  const navigateToHome = () => {
    onPathChange(null)
  }

  const filteredBusinesses = BUSINESSES.filter(business => {
    const matchesSearch = searchQuery === '' ||
      business.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      business.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'All Categories' ||
      business.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-full" style={{ background: '#F7F7F7' }}>
      {/* Header */}
      <header className="bg-red-600 text-white py-4 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={navigateToHome}
              className="flex items-center gap-2"
            >
              <span className="text-3xl">🌽</span>
              <span className="text-2xl font-bold">{site?.name || 'HuskReviews'}</span>
            </button>
            <div className="flex items-center gap-4">
              <button className="text-sm text-red-100 hover:text-white">Write a Review</button>
              <button className="text-sm text-red-100 hover:text-white">Find Friends</button>
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-red-600 font-bold">
                G
              </div>
            </div>
          </div>

          {/* Search Bar */}
          {!selectedBusiness && !selectedReviewer && (
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search businesses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 rounded-l text-gray-900"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 text-gray-900 border-l"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <button className="px-6 py-2 bg-red-700 hover:bg-red-800 rounded-r font-medium">
                Search
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Tagline Banner */}
      <div className="bg-red-50 border-b border-red-100 py-2 px-4">
        <p className="text-center text-sm text-red-700">
          <strong>HuskReviews</strong> - Where honest opinions meet unhinged experiences | {BUSINESSES.reduce((sum, b) => sum + b.reviewCount, 0).toLocaleString()} reviews and counting
        </p>
      </div>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        {selectedReviewer ? (
          <ReviewerProfile
            reviewer={selectedReviewer}
            onBack={navigateToHome}
          />
        ) : selectedBusiness ? (
          <BusinessDetail
            business={selectedBusiness}
            onBack={navigateToHome}
          />
        ) : (
          <div className="flex gap-6">
            {/* Main Listings */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">
                  {selectedCategory === 'All Categories' ? 'All Businesses' : selectedCategory}
                </h2>
                <span className="text-sm text-gray-500">
                  {filteredBusinesses.length} results
                </span>
              </div>

              {filteredBusinesses.map(business => (
                <BusinessCard
                  key={business.id}
                  business={business}
                  onClick={() => navigateToBusiness(business)}
                />
              ))}

              {filteredBusinesses.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-4xl mb-4">🌽</p>
                  <p className="text-gray-500">No businesses found. Try a different search.</p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="w-72 hidden lg:block">
              {/* Recent Activity */}
              <StyledCard
                variant="default"
                padding="md"
                borderRadius="md"
                shadow="sm"
                className="mb-4"
                bgColor="#ffffff"
                borderColor="#E5E7EB"
                textColor="#1F2937"
              >
                <h3 className="font-bold text-gray-900 mb-3">Recent Activity</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex gap-2">
                    <span>🔬</span>
                    <span>Derek Q. wrote his 847th review</span>
                  </div>
                  <div className="flex gap-2">
                    <span>👵</span>
                    <span>Mildred G. cried at another gas station</span>
                  </div>
                  <div className="flex gap-2">
                    <span>🙆</span>
                    <span>Trust Fall Tim achieved 78.6% catch rate</span>
                  </div>
                </div>
              </StyledCard>

              {/* Elite Reviewers */}
              <StyledCard
                variant="default"
                padding="md"
                borderRadius="md"
                shadow="sm"
                className="mb-4"
                bgColor="#ffffff"
                borderColor="#E5E7EB"
                textColor="#1F2937"
              >
                <h3 className="font-bold text-gray-900 mb-3">Elite Reviewers</h3>
                <div className="space-y-3">
                  {Object.values(REVIEWERS)
                    .filter(r => r.isElite)
                    .slice(0, 4)
                    .map(reviewer => (
                      <button
                        key={reviewer.id}
                        onClick={() => navigateToReviewer(reviewer)}
                        className="flex items-center gap-2 w-full text-left hover:bg-gray-50 p-1 rounded"
                      >
                        <span className="text-xl">{reviewer.avatar}</span>
                        <div>
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-medium">{reviewer.name}</span>
                            <EliteBadge years={reviewer.eliteYears} />
                          </div>
                          <span className="text-xs text-gray-500">{reviewer.reviewCount} reviews</span>
                        </div>
                      </button>
                    ))}
                </div>
              </StyledCard>

              {/* Categories */}
              <StyledCard
                variant="default"
                padding="md"
                borderRadius="md"
                shadow="sm"
                className="mb-4"
                bgColor="#ffffff"
                borderColor="#E5E7EB"
                textColor="#1F2937"
              >
                <h3 className="font-bold text-gray-900 mb-3">Categories</h3>
                <div className="space-y-1">
                  {CATEGORIES.slice(1).map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`block w-full text-left px-2 py-1 rounded text-sm ${
                        selectedCategory === cat
                          ? 'bg-red-50 text-red-700'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </StyledCard>

              {/* Rating Guide */}
              <StyledCard
                variant="default"
                padding="md"
                borderRadius="md"
                shadow="sm"
                bgColor="#FEF2F2"
                borderColor="#FECACA"
                textColor="#991B1B"
              >
                <h3 className="font-bold mb-2">Corn Cob Ratings</h3>
                <div className="text-xs space-y-1">
                  <p><CornRating rating={5} size="sm" /> - Transcendent</p>
                  <p><CornRating rating={4} size="sm" /> - Excellent</p>
                  <p><CornRating rating={3} size="sm" /> - Average</p>
                  <p><CornRating rating={2} size="sm" /> - Disappointing</p>
                  <p><CornRating rating={1} size="sm" /> - Avoid</p>
                </div>
              </StyledCard>
            </aside>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-400 py-6 px-4 text-center text-xs">
        <p className="mb-2">
          {site?.name || 'HuskReviews'} - The most trusted source for unhinged local business reviews
        </p>
        <p className="text-gray-500">
          Not affiliated with any corn-based agricultural entity. All reviews are real. Some reviewers may need therapy.
        </p>
      </footer>
    </div>
  )
}

export default HuskReviewsSite
