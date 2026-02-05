/**
 * Threadit Site - Refactored with Shared Components
 *
 * Reddit clone for the engAIge browser.
 * Features chaotic drama, AITA posts, and nested comment threads.
 */

import { useState, useEffect, useRef } from 'react'
import type { SiteProps } from '../BrowserSiteContainer.js'
import { FILLER_SITES } from '../../../config/filler-sites.js'
import { SidebarAdWidget } from '../ads/index.js'
import { StyledCard, Button, Avatar, MetaRow } from '../../ui/shared/index.js'

const site = FILLER_SITES.reddit

// ============================================================================
// Types
// ============================================================================

interface ThreadComment {
  id: string
  author: string
  content: string
  upvotes: number
  timestamp: string
  replies: ThreadComment[]
  isOP?: boolean
  flair?: string
}

interface Thread {
  id: string
  subreddit: string
  title: string
  author: string
  content: string
  flair?: string
  upvotes: number
  commentCount: number
  timestamp: string
  comments: ThreadComment[]
  awards?: string[]
}

interface Subreddit {
  name: string
  icon: string
  members: string
  description: string
}

// ============================================================================
// Sample Data
// ============================================================================

const SUBREDDITS: Subreddit[] = [
  { name: 't/QuantumCoffee', icon: '☕', members: '847K', description: 'The unofficial threadit for quantum coffee enthusiasts. Derek is a mod.' },
  { name: 't/HartwellBuilding', icon: '🏢', members: '234K', description: 'Theories, sightings, and investigations into the Hartwell Building mystery' },
  { name: 't/TrustFallTim', icon: '🤾', members: '89K', description: 'Fan community for Trust Fall Tim. Fall statistics, meet-up planning, and The Incident discussions.' },
  { name: 't/LocalMusic', icon: '🎸', members: '156K', description: 'Local music scene discussion. Velvet Algorithms updates, Underground shows, Neon Requiem memorials.' },
  { name: 't/Cornfield', icon: '🌽', members: '412K', description: 'General discussion for Cornfield, KS residents and enthusiasts' },
  { name: 't/AskThreadit', icon: '❓', members: '5.2M', description: 'Ask and answer thought-provoking questions' },
]

const SAMPLE_THREADS: Thread[] = [
  // ============================================================================
  // t/QuantumCoffee Threads
  // ============================================================================
  {
    id: 'aita_for_refusing_to_drink_my_roommates_quantum_brewed_coffee',
    subreddit: 't/QuantumCoffee',
    title: 'AITA for refusing to drink my roommate\'s "quantum brewed" coffee?',
    author: 'throwaway_brew_123',
    content: `My (24M) roommate (26F) just bought a $3000 quantum coffee maker and insists I try it every morning. I think it's pseudoscience bs and tastes the same as regular coffee.

She's now claiming I'm "closed-minded" and "don't appreciate innovation." She's been making passive aggressive comments about how I "wouldn't understand" because I "never finished my physics degree."

This morning she made a big show of brewing her quantum coffee and sighing loudly when I made instant coffee instead. Then she said "some people just can't handle progress."

I told her that until peer-reviewed studies prove quantum coffee is actually different, I'm not spending 45 minutes watching her "collapse wave functions" for a cup of coffee.

Now she's not speaking to me and sent me a 47-minute YouTube video about quantum mechanics.

AITA?

Edit: Yes I know about the Martinez study. My roommate has told me about it approximately 400 times.`,
    flair: 'Discussion',
    upvotes: 2847,
    commentCount: 342,
    timestamp: '6 hours ago',
    awards: ['🏆', '😂', '☕'],
    comments: [
      {
        id: 'qc1_c1',
        author: 'CaffeineAddict99',
        content: 'NTA. Your coffee, your choice. Though I gotta say, quantum coffee IS pretty good...',
        upvotes: 1523,
        timestamp: '5 hours ago',
        replies: [
          {
            id: 'qc1_c1_1',
            author: 'throwaway_brew_123',
            content: 'I just don\'t see how quantum physics makes coffee taste better lol',
            upvotes: 892,
            timestamp: '5 hours ago',
            isOP: true,
            replies: [],
          },
        ],
      },
      {
        id: 'qc1_c2',
        author: 'DerekMod',
        content: 'Mod here. I\'ve conducted 847 personal brewing trials. The difference is REAL. But $3k is steep - you can get comparable results with a $1200 setup if you\'re patient.',
        upvotes: 2104,
        timestamp: '4 hours ago',
        flair: 'Moderator',
        replies: [],
      },
    ],
  },
  {
    id: 'dr_martinez_clarification_about_her_study',
    subreddit: 't/QuantumCoffee',
    title: 'Dr. Martinez just posted clarification about her study AGAIN. When will people learn?',
    author: 'DerekMod',
    content: `For the 847th time: Dr. Martinez's study was about subatomic particle behavior, NOT coffee brewing. She has repeatedly stated this.

HOWEVER - that doesn't mean quantum coffee doesn't work. It just means her study isn't the proof everyone thinks it is. We need to fund NEW studies specifically about quantum brewing methods.

I've started a CobFundMe to fund independent research. Link in comments.

Edit: Stop sending me hate mail Jennifer. I know it's you.`,
    flair: 'Meta',
    upvotes: 567,
    commentCount: 234,
    timestamp: '2 days ago',
    awards: ['☕'],
    comments: [
      {
        id: 'qc2_c1',
        author: 'SkepticalSipper',
        content: 'So you\'re admitting the study everyone cites doesn\'t actually support quantum coffee?',
        upvotes: 892,
        timestamp: '2 days ago',
        replies: [
          {
            id: 'qc2_c1_1',
            author: 'DerekMod',
            content: 'I\'m saying we need BETTER evidence, not that it doesn\'t work. I taste the difference every single morning.',
            upvotes: 234,
            timestamp: '2 days ago',
            isOP: true,
            replies: [],
          },
        ],
      },
    ],
  },
  {
    id: 'my_partner_wont_stop_explaining_quantum_physics',
    subreddit: 't/QuantumCoffee',
    title: 'My partner won\'t stop explaining quantum physics to me and it\'s ruining our relationship',
    author: 'tired_of_particles',
    content: `We've been together for 2 years and I love him, but ever since he got into quantum coffee, he won't shut up about it.

Every dinner conversation turns into a lecture about wave function collapse. He bought me a book called "Quantum Mechanics for Your Girlfriend" which I found condescending.

Last week he told me our relationship was like "quantum entanglement" and when I said that was sweet, he spent 45 minutes explaining why that was actually "physically inaccurate but emotionally true."

How do I tell him to just... talk to me like a normal person again?

Edit: Yes his name is Derek. No I'm not his ex-wife Jennifer.`,
    flair: 'Relationship',
    upvotes: 1247,
    commentCount: 189,
    timestamp: '12 hours ago',
    awards: ['💕'],
    comments: [
      {
        id: 'qc3_c1',
        author: 'quantum_widow',
        content: 'Girl RUN. I divorced my quantum coffee obsessed husband last year. It started with coffee. Then he wanted to quantum entangle our PETS.',
        upvotes: 567,
        timestamp: '10 hours ago',
        replies: [],
      },
      {
        id: 'qc3_c2',
        author: 'JennifersBlog',
        content: 'Trust me, it doesn\'t get better. Save yourself.',
        upvotes: 1823,
        timestamp: '9 hours ago',
        flair: 'Verified Ex-Wife',
        replies: [],
      },
    ],
  },

  // ============================================================================
  // t/HartwellBuilding Threads
  // ============================================================================
  {
    id: 'theory_floor_13_is_a_dimensional_pocket',
    subreddit: 't/HartwellBuilding',
    title: '[THEORY] The Hartwell Building Floor 13 is a dimensional pocket',
    author: 'floor13truther',
    content: `Okay hear me out. I've been researching the Hartwell Building for 3 years now. Here's what we know:

1. The building has 14 floors but no 13th floor button in the elevator
2. The stairwell skips from 12 to 14
3. Floor 7 has mirrors that show "reflections that don't quite match"
4. Omnicorp Holdings is headquartered there and nobody knows what they do
5. The number 847 appears EVERYWHERE in documents related to the building

My theory: Floor 13 exists, but in a pocket dimension accessible only at certain times. The mirrors on Floor 7 are some kind of viewing portal.

Anyone else notice strange things around the building?`,
    flair: 'Theory',
    upvotes: 3421,
    commentCount: 567,
    timestamp: '3 days ago',
    awards: ['🏢', '👁️', '🔮'],
    comments: [
      {
        id: 'hb1_c1',
        author: 'OmnicorpHR_Patricia',
        content: 'Hi! HR here from Omnicorp. There\'s no Floor 13. It\'s just architectural superstition, very common in buildings from the 1920s! We\'re a perfectly normal company doing perfectly normal business things. Hope this helps! 😊',
        upvotes: -1247,
        timestamp: '3 days ago',
        flair: 'Omnicorp Employee',
        replies: [
          {
            id: 'hb1_c1_1',
            author: 'floor13truther',
            content: 'This is EXACTLY what someone hiding a dimensional portal would say',
            upvotes: 2891,
            timestamp: '3 days ago',
            isOP: true,
            replies: [],
          },
        ],
      },
      {
        id: 'hb1_c2',
        author: 'building_historian',
        content: 'I\'ve seen the original 1923 blueprints. There IS a 13th floor in the plans. What happened to it?',
        upvotes: 4521,
        timestamp: '2 days ago',
        replies: [],
      },
    ],
  },
  {
    id: 'the_mirrors_on_floor_7_showed_me_something',
    subreddit: 't/HartwellBuilding',
    title: 'The mirrors on Floor 7 showed me something that wasn\'t there',
    author: 'delivery_driver_anon',
    content: `I do deliveries for a restaurant near the Hartwell Building. Made a delivery to Floor 7 yesterday.

While waiting for someone to sign, I glanced in the hallway mirror. My reflection... blinked when I didn't. I swear to god. It blinked, then smiled at me.

I dropped the food and ran. Lost my job over it. Don't care. Something is WRONG with that building.

Has anyone else seen things in those mirrors?`,
    flair: 'Experience',
    upvotes: 2156,
    commentCount: 423,
    timestamp: '1 week ago',
    awards: ['😱'],
    comments: [
      {
        id: 'hb2_c1',
        author: 'janitorial_staff_847',
        content: 'I clean those mirrors every night. They\'re just mirrors. You probably saw someone walking behind you.',
        upvotes: -567,
        timestamp: '1 week ago',
        replies: [
          {
            id: 'hb2_c1_1',
            author: 'delivery_driver_anon',
            content: 'I was ALONE in the hallway',
            upvotes: 1234,
            timestamp: '1 week ago',
            isOP: true,
            replies: [],
          },
        ],
      },
    ],
  },
  {
    id: 'what_does_omnicorp_actually_do',
    subreddit: 't/HartwellBuilding',
    title: 'What does Omnicorp actually DO?',
    author: 'curious_researcher',
    content: `I've been trying to figure out what Omnicorp Holdings actually does as a business. Their website is just a logo and "Synergizing Tomorrow's Solutions Today."

- No products listed
- No services described
- Patricia from HR says they do "business things"
- They occupy 4 floors of the Hartwell Building
- Been in business since 1923 (same year building was built)

What company has been around 100+ years with no apparent product or service?`,
    flair: 'Investigation',
    upvotes: 1892,
    commentCount: 312,
    timestamp: '5 days ago',
    comments: [
      {
        id: 'hb3_c1',
        author: 'OmnicorpHR_Patricia',
        content: 'We synergize solutions! It\'s right there on the website! 😊 Please stop investigating us.',
        upvotes: -2341,
        timestamp: '5 days ago',
        flair: 'Omnicorp Employee',
        replies: [],
      },
    ],
  },

  // ============================================================================
  // t/TrustFallTim Threads
  // ============================================================================
  {
    id: 'weekly_stats_tim_achieved_79_catch_rate',
    subreddit: 't/TrustFallTim',
    title: 'WEEKLY STATS: Tim achieved 79.2% catch rate this week!',
    author: 'TFT_Stats_Bot',
    content: `Trust Fall Tim Weekly Statistics Report:

📊 Week of 10/15 - 10/21

- Total Falls: 7
- Successful Catches: 5
- Unsuccessful Catches: 2
- Weekly Catch Rate: 71.4%
- All-Time Catch Rate: 78.5%
- Total Career Falls: 2,854

Notable Events:
- Tuesday's fall at the farmer's market was his fastest catch ever (0.3 seconds)
- Thursday's fall at The Underground resulted in a beverage spillage incident

Keep falling, Tim! 🙌`,
    flair: 'Weekly Stats',
    upvotes: 1567,
    commentCount: 89,
    timestamp: '2 days ago',
    awards: ['📊', '🙌'],
    comments: [
      {
        id: 'tft1_c1',
        author: 'TrustFallTim',
        content: 'The Thursday incident was NOT my fault. Mars should have warned me about the beer tasting event.',
        upvotes: 2341,
        timestamp: '2 days ago',
        flair: 'The Man Himself',
        replies: [
          {
            id: 'tft1_c1_1',
            author: 'MarsTheOwner',
            content: 'Tim you fell TOWARDS the beer table. That was a choice.',
            upvotes: 3456,
            timestamp: '2 days ago',
            flair: 'Underground Owner',
            replies: [],
          },
        ],
      },
    ],
  },
  {
    id: 'i_was_there_for_the_incident_ama',
    subreddit: 't/TrustFallTim',
    title: 'I was there for The Incident. AMA.',
    author: 'witness_to_history',
    content: `I was standing right next to Small Kevin when it happened. I've never spoken publicly about it but I feel like the community deserves to know the truth.

Ask me anything (except Kevin's current whereabouts - he asked me not to share that).`,
    flair: 'AMA',
    upvotes: 8934,
    commentCount: 1247,
    timestamp: '1 month ago',
    awards: ['🏆', '😱', '💀', '👀'],
    comments: [
      {
        id: 'tft2_c1',
        author: 'curious_fan',
        content: 'Was it really Kevin\'s fault?',
        upvotes: 4521,
        timestamp: '1 month ago',
        replies: [
          {
            id: 'tft2_c1_1',
            author: 'witness_to_history',
            content: 'Kevin did nothing wrong. The positioning was off. Tim\'s trajectory was unexpected. It was a perfect storm of unfortunate timing.',
            upvotes: 6789,
            timestamp: '1 month ago',
            isOP: true,
            replies: [],
          },
        ],
      },
      {
        id: 'tft2_c2',
        author: 'SmallKevin',
        content: 'Thank you for this.',
        upvotes: 15678,
        timestamp: '1 month ago',
        flair: 'The Other Guy',
        replies: [],
      },
    ],
  },
  {
    id: 'tims_mom_started_a_support_blog',
    subreddit: 't/TrustFallTim',
    title: 'Tim\'s mom started a support blog and it\'s the most wholesome thing',
    author: 'wholesome_content',
    content: `Found Tim's mom's blog where she documents supporting her son's "performance art journey."

She writes about making sandwiches for his falls, knitting him a special "falling sweater," and how proud she is that he's "following his dreams even if those dreams involve falling backwards in public."

Link in comments. Get tissues ready.`,
    flair: 'Wholesome',
    upvotes: 4567,
    commentCount: 234,
    timestamp: '2 weeks ago',
    awards: ['💕', '😭', '🙌'],
    comments: [
      {
        id: 'tft3_c1',
        author: 'TrustFallTim',
        content: 'MOM STOP YOU\'RE EMBARRASSING ME',
        upvotes: 8934,
        timestamp: '2 weeks ago',
        flair: 'The Man Himself',
        replies: [
          {
            id: 'tft3_c1_1',
            author: 'TimsMomBlog',
            content: 'I\'m just so proud of you sweetie! 🥰',
            upvotes: 12453,
            timestamp: '2 weeks ago',
            replies: [],
          },
        ],
      },
    ],
  },

  // ============================================================================
  // t/LocalMusic Threads
  // ============================================================================
  {
    id: 'velvet_algorithms_cancelled_existential_crisis',
    subreddit: 't/LocalMusic',
    title: 'The Velvet Algorithms cancelled their show due to "existential crisis" - anyone know what happened?',
    author: 'UndergroundRegular',
    content: `Was supposed to see them at The Underground tonight and just got the notification that the show is cancelled. Anyone have inside info?

Their last Instagram post just says "sometimes the algorithm needs to debug itself" which tells me nothing.

I drove 3 hours for this show. Anyone else stranded downtown?`,
    flair: 'News',
    upvotes: 423,
    commentCount: 87,
    timestamp: '8 hours ago',
    comments: [
      {
        id: 'lm1_c1',
        author: 'venue_insider',
        content: 'Heard from Mars that both band members had some kind of breakdown during soundcheck. Something about "the music no longer resonating with the fundamental frequency of existence"',
        upvotes: 312,
        timestamp: '7 hours ago',
        replies: [
          {
            id: 'lm1_c1_1',
            author: 'UndergroundRegular',
            content: 'That\'s the most Velvet Algorithms reason ever',
            upvotes: 189,
            timestamp: '7 hours ago',
            isOP: true,
            replies: [],
          },
        ],
      },
      {
        id: 'lm1_c2',
        author: 'neon_dreams_fan',
        content: 'Neon Requiem is doing an impromptu show at Murphy\'s Pub if anyone needs somewhere to go tonight.',
        upvotes: 156,
        timestamp: '6 hours ago',
        replies: [],
      },
    ],
  },
  {
    id: 'vex_still_posting_about_neon_requiem',
    subreddit: 't/LocalMusic',
    title: 'Vex (Neon Requiem drummer) is STILL posting about the band like they didn\'t break up 10 months ago',
    author: 'scene_watcher',
    content: `Check his blog. Every single post is about Neon Requiem reunion rumors, the "legendary" final show, or cryptic hints about new music.

THE BAND IS OVER VEX. The frontman moved to Portland. The bassist is in dental school. It's done.

Someone needs to stage an intervention.`,
    flair: 'Drama',
    upvotes: 2341,
    commentCount: 456,
    timestamp: '3 days ago',
    awards: ['😂', '💀'],
    comments: [
      {
        id: 'lm2_c1',
        author: 'VexDrums',
        content: 'We\'re just on hiatus. There\'s a difference. The final show wasn\'t "final" it was "legendary." Those are different words with different meanings.',
        upvotes: -567,
        timestamp: '3 days ago',
        flair: 'Neon Requiem',
        replies: [
          {
            id: 'lm2_c1_1',
            author: 'scene_watcher',
            content: 'Vex the frontman\'s Instagram bio literally says "former member of Neon Requiem"',
            upvotes: 3456,
            timestamp: '3 days ago',
            isOP: true,
            replies: [],
          },
        ],
      },
    ],
  },
  {
    id: 'mars_banned_another_wonderwall_requester',
    subreddit: 't/LocalMusic',
    title: 'Mars permanently banned another Wonderwall requester',
    author: 'underground_regular_2',
    content: `Witnessed history tonight at The Underground. Some guy requested Wonderwall for the third time in one night.

Mars walked over, took his drink, poured it out, and handed him a piece of paper. It was a printed lifetime ban certificate. Pre-made. He has these READY TO GO.

The guy tried to argue and Mars just pointed to the sign: "ABSOLUTELY NO WONDERWALL. NO EXCEPTIONS. NO APPEALS."

Legend.`,
    flair: 'Classic Mars',
    upvotes: 5678,
    commentCount: 789,
    timestamp: '1 week ago',
    awards: ['🏆', '😂', '🎸'],
    comments: [
      {
        id: 'lm3_c1',
        author: 'MarsTheOwner',
        content: 'I have 200 of those certificates. We\'re down to 184.',
        upvotes: 8934,
        timestamp: '1 week ago',
        flair: 'Underground Owner',
        replies: [
          {
            id: 'lm3_c1_1',
            author: 'WonderwallWarrior',
            content: 'One day I will hear my song in that venue.',
            upvotes: -2341,
            timestamp: '1 week ago',
            flair: 'Banned x16',
            replies: [],
          },
        ],
      },
    ],
  },

  // ============================================================================
  // t/Cornfield Threads
  // ============================================================================
  {
    id: 'psa_the_new_stop_sign_on_5th_and_main',
    subreddit: 't/Cornfield',
    title: 'PSA: The new stop sign on 5th and Main is NOT optional',
    author: 'concerned_citizen_847',
    content: `I've seen 12 people run this stop sign today. TWELVE. It's been there for a week. Yes it's new. No that doesn't mean you can ignore it.

Deputy Morrison is setting up speed traps there starting Monday. Consider yourselves warned.`,
    flair: 'PSA',
    upvotes: 234,
    commentCount: 45,
    timestamp: '4 hours ago',
    comments: [
      {
        id: 'cf1_c1',
        author: 'long_time_resident',
        content: 'There\'s been no stop sign there for 40 years and suddenly we need one? This is overreach.',
        upvotes: 89,
        timestamp: '3 hours ago',
        replies: [
          {
            id: 'cf1_c1_1',
            author: 'concerned_citizen_847',
            content: 'Mrs. Henderson got hit by a cyclist there last month',
            upvotes: 156,
            timestamp: '3 hours ago',
            isOP: true,
            replies: [],
          },
        ],
      },
    ],
  },
  {
    id: 'why_were_8_fire_trucks_at_hartwell_last_night',
    subreddit: 't/Cornfield',
    title: 'Anyone know why there were 8 fire trucks at the Hartwell Building last night?',
    author: 'downtown_neighbor',
    content: `Huge response around 2am. No smoke that I could see. Trucks just sat there for 3 hours then left.

Fire department says it was a "routine check." At 2am? With 8 trucks?`,
    flair: 'Question',
    upvotes: 567,
    commentCount: 123,
    timestamp: '1 day ago',
    awards: ['🤔'],
    comments: [
      {
        id: 'cf2_c1',
        author: 'floor13truther',
        content: 'They found something on Floor 13',
        upvotes: 892,
        timestamp: '1 day ago',
        replies: [
          {
            id: 'cf2_c1_1',
            author: 'OmnicorpHR_Patricia',
            content: 'There is no Floor 13! 😊 The fire department was checking our very normal smoke detectors!',
            upvotes: -456,
            timestamp: '1 day ago',
            flair: 'Omnicorp Employee',
            replies: [],
          },
        ],
      },
    ],
  },
  {
    id: 'the_quantum_coffee_shop_is_actually_pretty_good',
    subreddit: 't/Cornfield',
    title: 'The quantum coffee shop downtown is actually pretty good?',
    author: 'reluctant_convert',
    content: `I was a skeptic. Thought it was all pseudoscience nonsense. My coworker dragged me there and... okay the coffee IS somehow better?

I don't understand the science but the pour-over they made me was genuinely the best coffee I've had. Even if it took 35 minutes.

Derek if you're reading this, you were right. I'm sorry I called you a cult member at the office party.`,
    flair: 'Food & Drink',
    upvotes: 345,
    commentCount: 67,
    timestamp: '2 days ago',
    comments: [
      {
        id: 'cf3_c1',
        author: 'DerekMod',
        content: 'Apology accepted. Welcome to enlightenment. ☕',
        upvotes: 234,
        timestamp: '2 days ago',
        flair: 't/QuantumCoffee Mod',
        replies: [],
      },
    ],
  },

  // ============================================================================
  // t/AskThreadit Threads
  // ============================================================================
  {
    id: 'whats_the_weirdest_thing_at_a_local_venue',
    subreddit: 't/AskThreadit',
    title: 'What\'s the weirdest thing you\'ve ever witnessed at a local venue?',
    author: 'curiosity_killed_me',
    content: `I'll start: At The Underground last month, a guy tried to crowdsurf during an acoustic set. There were like 12 people in the audience. They did not catch him.`,
    upvotes: 5621,
    commentCount: 2341,
    timestamp: '1 day ago',
    awards: ['🏆', '😂', '🎸', '💀'],
    comments: [
      {
        id: 'at1_c1',
        author: 'basement_show_veteran',
        content: 'Saw a band\'s drummer quit mid-song because the frontman made a joke about his "timekeeping." The drummer threw his sticks into the crowd and left.',
        upvotes: 4521,
        timestamp: '23 hours ago',
        replies: [],
      },
      {
        id: 'at1_c2',
        author: 'MarsTheOwner',
        content: 'I own The Underground. The crowdsurf guy comes back every month. We call him "Trust Fall Tim." No one has ever caught him. He keeps trying.',
        upvotes: 8934,
        timestamp: '20 hours ago',
        flair: 'Verified Venue Owner',
        replies: [
          {
            id: 'at1_c2_1',
            author: 'TrustFallTim',
            content: 'One day Mars. One day.',
            upvotes: 12453,
            timestamp: '18 hours ago',
            flair: 'Performance Artist',
            replies: [],
          },
        ],
      },
    ],
  },
  {
    id: 'whats_your_towns_open_secret',
    subreddit: 't/AskThreadit',
    title: 'What\'s your town\'s "open secret" that everyone knows but nobody talks about?',
    author: 'small_town_curious',
    content: `Every town has one. What's yours?`,
    upvotes: 8934,
    commentCount: 3456,
    timestamp: '3 days ago',
    awards: ['🏆', '👀', '😱'],
    comments: [
      {
        id: 'at2_c1',
        author: 'cornfield_native',
        content: 'The Hartwell Building\'s 13th floor. Everyone knows something\'s weird about it but asking questions just gets you a visit from "Patricia from HR."',
        upvotes: 5678,
        timestamp: '3 days ago',
        replies: [
          {
            id: 'at2_c1_1',
            author: 'OmnicorpHR_Patricia',
            content: 'Hi! Just checking in! There\'s nothing weird about our perfectly normal building! 😊 What\'s your address?',
            upvotes: -3456,
            timestamp: '3 days ago',
            flair: 'Omnicorp Employee',
            replies: [],
          },
        ],
      },
      {
        id: 'at2_c2',
        author: 'anonymous_poster_847',
        content: 'The quantum coffee "scene" is basically a cult at this point. Derek is their leader. His ex-wife Jennifer runs an anti-quantum-coffee blog. Their divorce was MESSY.',
        upvotes: 2341,
        timestamp: '3 days ago',
        replies: [],
      },
    ],
  },
  {
    id: 'people_caught_by_trust_fall_tim_how_did_it_feel',
    subreddit: 't/AskThreadit',
    title: 'People who\'ve been caught by Trust Fall Tim: How did it feel?',
    author: 'tft_researcher',
    content: `Statistically, 78.5% of people DO catch him. I want to hear from the catchers - what goes through your mind in that moment?`,
    upvotes: 2341,
    commentCount: 567,
    timestamp: '5 days ago',
    awards: ['🙌'],
    comments: [
      {
        id: 'at3_c1',
        author: 'accidental_catcher',
        content: 'Terrifying. I was just walking to get coffee and suddenly there\'s a full grown man in my arms. He said "thank you for your trust" and walked away. Still processing.',
        upvotes: 4567,
        timestamp: '5 days ago',
        replies: [
          {
            id: 'at3_c1_1',
            author: 'TrustFallTim',
            content: 'You have excellent reflexes. I remember you.',
            upvotes: 6789,
            timestamp: '5 days ago',
            flair: 'Performance Artist',
            replies: [],
          },
        ],
      },
    ],
  },
]

// ============================================================================
// Components
// ============================================================================

export function ThreaditSite({ siteId, path, onNavigate, onPathChange }: SiteProps) {
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null)
  const [selectedSubreddit, setSelectedSubreddit] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'hot' | 'new' | 'top'>('hot')
  const [userVotes, setUserVotes] = useState<Record<string, 'up' | 'down' | null>>({})

  // Track if we're updating from path (to avoid triggering onPathChange)
  const isUpdatingFromPath = useRef(false)

  // Parse path and update state when path changes (from browser back/forward)
  useEffect(() => {
    isUpdatingFromPath.current = true

    if (!path) {
      setSelectedThread(null)
      setSelectedSubreddit(null)
    } else if (path.startsWith('/t/')) {
      // Check if it's a needle (post): /t/CommunityName/n/post_slug
      const nMatch = path.match(/^\/t\/([^/]+)\/n\/(.+)$/)
      if (nMatch) {
        // It's a needle (post)
        const [, communityName, postSlug] = nMatch
        const thread = SAMPLE_THREADS.find(t => t.id === postSlug)
        if (thread) {
          setSelectedThread(thread)
          setSelectedSubreddit('t/' + communityName)
        }
      } else {
        // It's just a threadit (community): /t/CommunityName
        const communityName = path.slice(3) // Remove '/t/'
        setSelectedThread(null)
        setSelectedSubreddit('t/' + communityName)
      }
    }

    // Reset flag after state updates
    setTimeout(() => {
      isUpdatingFromPath.current = false
    }, 0)
  }, [path])

  // Navigation handlers that update both state and path
  const handleSelectThread = (thread: Thread) => {
    setSelectedThread(thread)
    // Generate /t/CommunityName/n/post_slug path
    // thread.subreddit is "t/CommunityName", so remove the "t/" prefix
    const communityName = thread.subreddit.slice(2)
    onPathChange('/t/' + communityName + '/n/' + thread.id)
  }

  const handleSelectSubreddit = (subredditName: string | null) => {
    setSelectedSubreddit(subredditName)
    setSelectedThread(null)
    if (subredditName) {
      // subredditName includes "t/" prefix, remove it for the path
      onPathChange('/t/' + subredditName.slice(2))
    } else {
      onPathChange(null)
    }
  }

  const handleBackToHome = () => {
    setSelectedThread(null)
    setSelectedSubreddit(null)
    onPathChange(null)
  }

  const handleBackFromThread = () => {
    setSelectedThread(null)
    // Go back to threadit if one is selected, otherwise go to home
    if (selectedSubreddit) {
      onPathChange('/t/' + selectedSubreddit.slice(2))
    } else {
      onPathChange(null)
    }
  }

  const filteredThreads = selectedSubreddit
    ? SAMPLE_THREADS.filter(t => t.subreddit === selectedSubreddit)
    : SAMPLE_THREADS

  const handleVote = (id: string, direction: 'up' | 'down') => {
    setUserVotes(prev => ({
      ...prev,
      [id]: prev[id] === direction ? null : direction,
    }))
  }

  const getVoteAdjustment = (id: string, originalVotes: number): number => {
    const vote = userVotes[id]
    if (vote === 'up') return originalVotes + 1
    if (vote === 'down') return originalVotes - 1
    return originalVotes
  }

  return (
    <div className="min-h-full" style={{ background: site.theme.background }}>
      {/* Header */}
      <header
        className="sticky top-0 z-10"
        style={{ background: site.theme.surface, borderBottom: `1px solid ${site.theme.border}` }}
      >
        <div className="max-w-5xl mx-auto px-4 py-2">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <button
              onClick={handleBackToHome}
              className="flex items-center gap-2 hover:opacity-80"
            >
              <span className="text-2xl">{site.icon}</span>
              <span
                className="text-xl font-bold"
                style={{ color: site.theme.primary }}
              >
                {site.name}
              </span>
            </button>

            {/* Search */}
            <div className="flex-1 max-w-xl">
              <input
                type="text"
                placeholder={`Search ${site.name}`}
                className="w-full px-4 py-1.5 rounded-full text-sm"
                style={{
                  background: site.theme.background,
                  border: `1px solid ${site.theme.border}`,
                  color: site.theme.text,
                }}
              />
            </div>

            {/* User */}
            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                backgroundColor={site.theme.primary}
                textColor="white"
              >
                Log In
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-4">
        <div className="flex gap-6">
          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {selectedThread ? (
              <ThreadDetail
                thread={selectedThread}
                onBack={handleBackFromThread}
                userVotes={userVotes}
                onVote={handleVote}
                getVoteAdjustment={getVoteAdjustment}
              />
            ) : (
              <>
                {/* Sort Controls */}
                <StyledCard
                  bgColor={site.theme.surface}
                  borderColor="transparent"
                  padding="md"
                  borderRadius="md"
                  shadow="none"
                  className="flex items-center gap-4 mb-4"
                >
                  <span className="text-sm" style={{ color: site.theme.textMuted }}>
                    Sort by:
                  </span>
                  {(['hot', 'new', 'top'] as const).map((sort) => (
                    <Button
                      key={sort}
                      onClick={() => setSortBy(sort)}
                      variant={sortBy === sort ? 'primary' : 'ghost'}
                      size="sm"
                      backgroundColor={sortBy === sort ? site.theme.primary : 'transparent'}
                      textColor={sortBy === sort ? 'white' : site.theme.textMuted}
                    >
                      {sort.charAt(0).toUpperCase() + sort.slice(1)}
                    </Button>
                  ))}
                </StyledCard>

                {/* Thread List */}
                <div className="space-y-3">
                  {filteredThreads.map((thread) => (
                    <ThreadCard
                      key={thread.id}
                      thread={thread}
                      onClick={() => handleSelectThread(thread)}
                      userVotes={userVotes}
                      onVote={handleVote}
                      getVoteAdjustment={getVoteAdjustment}
                    />
                  ))}
                </div>
              </>
            )}
          </main>

          {/* Sidebar */}
          <aside className="w-72 shrink-0 space-y-4">
            {/* Subreddit Info */}
            {selectedSubreddit ? (
              <div className="rounded-md overflow-hidden" style={{ border: `1px solid ${site.theme.border}` }}>
                <div className="p-3" style={{ background: site.theme.primary }}>
                  <h2 className="font-bold text-white">{selectedSubreddit}</h2>
                </div>
                <StyledCard
                  bgColor={site.theme.surface}
                  borderColor="transparent"
                  padding="md"
                  borderRadius="0"
                  shadow="none"
                >
                  <p className="text-sm mb-3" style={{ color: site.theme.textMuted }}>
                    {SUBREDDITS.find(s => s.name === selectedSubreddit)?.description}
                  </p>
                  <Button
                    onClick={() => handleSelectSubreddit(null)}
                    variant="link"
                    size="sm"
                    textColor={site.theme.secondary}
                  >
                    ← Back to Home
                  </Button>
                </StyledCard>
              </div>
            ) : (
              <div className="rounded-md overflow-hidden" style={{ border: `1px solid ${site.theme.border}` }}>
                <div className="p-3" style={{ background: site.theme.primary }}>
                  <h2 className="font-bold text-white">Home</h2>
                </div>
                <StyledCard
                  bgColor={site.theme.surface}
                  borderColor="transparent"
                  padding="md"
                  borderRadius="0"
                  shadow="none"
                >
                  <p className="text-sm" style={{ color: site.theme.textMuted }}>
                    Your personal {site.name} front page. Come here to check in with your favorite communities.
                  </p>
                </StyledCard>
              </div>
            )}

            {/* Popular Communities */}
            <StyledCard
              bgColor={site.theme.surface}
              borderColor={site.theme.border}
              padding="0"
              borderRadius="md"
              shadow="sm"
              className="overflow-hidden"
            >
              <div className="p-3 font-bold text-sm" style={{ color: site.theme.text, borderBottom: `1px solid ${site.theme.border}` }}>
                Popular Communities
              </div>
              <div className="py-2">
                {SUBREDDITS.map((sub) => (
                  <Button
                    key={sub.name}
                    onClick={() => handleSelectSubreddit(sub.name)}
                    variant="ghost"
                    backgroundColor="transparent"
                    width="full"
                    className="justify-start px-3 py-2"
                  >
                    <span className="text-xl mr-2">{sub.icon}</span>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-sm font-medium" style={{ color: site.theme.text }}>
                        {sub.name}
                      </p>
                      <p className="text-xs" style={{ color: site.theme.textMuted }}>
                        {sub.members} members
                      </p>
                    </div>
                  </Button>
                ))}
              </div>
            </StyledCard>

            {/* Rules */}
            <StyledCard
              bgColor={site.theme.surface}
              borderColor={site.theme.border}
              padding="md"
              borderRadius="md"
              shadow="sm"
              textColor={site.theme.textMuted}
              className="text-xs"
            >
              <p className="font-bold mb-2" style={{ color: site.theme.text }}>
                {site.name} Rules
              </p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Remember the human</li>
                <li>Behave like you would in real life</li>
                <li>Look for the original source of content</li>
                <li>Search for duplicates before posting</li>
                <li>Read the community rules</li>
              </ol>
            </StyledCard>

            {/* Promoted */}
            <SidebarAdWidget
              siteId="threadit"
              onNavigate={onNavigate}
              title="Promoted"
              count={2}
            />
          </aside>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Thread Card Component
// ============================================================================

interface ThreadCardProps {
  thread: Thread
  onClick: () => void
  userVotes: Record<string, 'up' | 'down' | null>
  onVote: (id: string, direction: 'up' | 'down') => void
  getVoteAdjustment: (id: string, originalVotes: number) => number
}

function ThreadCard({ thread, onClick, userVotes, onVote, getVoteAdjustment }: ThreadCardProps) {
  const votes = getVoteAdjustment(thread.id, thread.upvotes)
  const userVote = userVotes[thread.id]

  return (
    <StyledCard
      bgColor={site.theme.surface}
      borderColor={site.theme.border}
      padding="md"
      borderRadius="md"
      shadow="sm"
      className="flex overflow-hidden p-0"
    >
      {/* Vote Column */}
      <div
        className="w-10 flex flex-col items-center py-2 gap-1 shrink-0"
        style={{ background: site.theme.background }}
      >
        <Button
          onClick={(e) => {
            e.stopPropagation?.()
            onVote(thread.id, 'up')
          }}
          variant="ghost"
          size="xs"
          icon={
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill={userVote === 'up' ? site.theme.upvote : 'none'}
              stroke={userVote === 'up' ? site.theme.upvote : site.theme.textMuted}
              strokeWidth={2}
            >
              <path d="M12 4l-8 8h5v8h6v-8h5z" />
            </svg>
          }
          backgroundColor="transparent"
        />
        <span
          className="text-xs font-bold"
          style={{
            color: userVote === 'up' ? site.theme.upvote :
                   userVote === 'down' ? site.theme.downvote :
                   site.theme.text
          }}
        >
          {votes >= 1000 ? `${(votes / 1000).toFixed(1)}k` : votes}
        </span>
        <Button
          onClick={(e) => {
            e.stopPropagation?.()
            onVote(thread.id, 'down')
          }}
          variant="ghost"
          size="xs"
          icon={
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill={userVote === 'down' ? site.theme.downvote : 'none'}
              stroke={userVote === 'down' ? site.theme.downvote : site.theme.textMuted}
              strokeWidth={2}
            >
              <path d="M12 20l8-8h-5V4H9v8H4z" />
            </svg>
          }
          backgroundColor="transparent"
        />
      </div>

      {/* Content */}
      <button
        onClick={onClick}
        className="flex-1 p-3 text-left hover:bg-gray-50 transition-colors"
        style={{ border: 'none', background: 'transparent' }}
      >
        <MetaRow
          items={[
            { value: thread.subreddit, style: { fontWeight: 500 } },
            { value: `Posted by u/${thread.author}` },
            { value: thread.timestamp },
            ...(thread.awards?.map(award => ({ value: award })) ?? []),
          ]}
          textSize="xs"
          textColor={site.theme.text}
          mutedColor={site.theme.textMuted}
          separator="•"
        />
        <h3 className="font-medium mb-1 mt-1" style={{ color: site.theme.text }}>
          {thread.flair && (
            <span
              className="inline-block px-2 py-0.5 text-xs rounded mr-2"
              style={{
                background: thread.flair === 'Asshole' ? '#ff4500' :
                           thread.flair === 'Not the A-hole' ? '#0dd3bb' :
                           site.theme.secondary,
                color: 'white',
              }}
            >
              {thread.flair}
            </span>
          )}
          {thread.title}
        </h3>
        <p className="text-sm line-clamp-2" style={{ color: site.theme.textMuted }}>
          {thread.content}
        </p>
        <div className="flex items-center gap-4 mt-2 text-xs" style={{ color: site.theme.textMuted }}>
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            {thread.commentCount} comments
          </span>
          <span>Share</span>
          <span>Save</span>
        </div>
      </button>
    </StyledCard>
  )
}

// ============================================================================
// Thread Detail Component
// ============================================================================

interface ThreadDetailProps {
  thread: Thread
  onBack: () => void
  userVotes: Record<string, 'up' | 'down' | null>
  onVote: (id: string, direction: 'up' | 'down') => void
  getVoteAdjustment: (id: string, originalVotes: number) => number
}

function ThreadDetail({ thread, onBack, userVotes, onVote, getVoteAdjustment }: ThreadDetailProps) {
  const votes = getVoteAdjustment(thread.id, thread.upvotes)
  const userVote = userVotes[thread.id]

  return (
    <div className="space-y-4">
      <Button
        onClick={onBack}
        variant="link"
        size="sm"
        textColor={site.theme.secondary}
      >
        ← Back to {thread.subreddit}
      </Button>

      {/* Main Post */}
      <StyledCard
        bgColor={site.theme.surface}
        borderColor={site.theme.border}
        padding="lg"
        borderRadius="md"
        shadow="sm"
      >
        <MetaRow
          items={[
            { value: thread.subreddit, style: { fontWeight: 500 } },
            { value: `Posted by u/${thread.author}` },
            { value: thread.timestamp },
            ...(thread.awards?.map(award => ({ value: award })) ?? []),
          ]}
          textSize="xs"
          textColor={site.theme.text}
          mutedColor={site.theme.textMuted}
          separator="•"
          className="mb-2"
        />

        <h1 className="text-xl font-medium mb-3" style={{ color: site.theme.text }}>
          {thread.flair && (
            <span
              className="inline-block px-2 py-0.5 text-xs rounded mr-2"
              style={{
                background: thread.flair === 'Asshole' ? '#ff4500' :
                           thread.flair === 'Not the A-hole' ? '#0dd3bb' :
                           site.theme.secondary,
                color: 'white',
              }}
            >
              {thread.flair}
            </span>
          )}
          {thread.title}
        </h1>

        <div
          className="text-sm whitespace-pre-wrap mb-4"
          style={{ color: site.theme.text }}
        >
          {thread.content}
        </div>

        {/* Post Actions */}
        <div className="flex items-center gap-4 text-sm" style={{ color: site.theme.textMuted }}>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => onVote(thread.id, 'up')}
              variant="ghost"
              size="sm"
              icon={
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill={userVote === 'up' ? site.theme.upvote : 'none'}
                  stroke={userVote === 'up' ? site.theme.upvote : 'currentColor'}
                  strokeWidth={2}
                >
                  <path d="M12 4l-8 8h5v8h6v-8h5z" />
                </svg>
              }
              backgroundColor="transparent"
            />
            <span
              className="font-bold"
              style={{
                color: userVote === 'up' ? site.theme.upvote :
                       userVote === 'down' ? site.theme.downvote :
                       site.theme.text
              }}
            >
              {votes}
            </span>
            <Button
              onClick={() => onVote(thread.id, 'down')}
              variant="ghost"
              size="sm"
              icon={
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill={userVote === 'down' ? site.theme.downvote : 'none'}
                  stroke={userVote === 'down' ? site.theme.downvote : 'currentColor'}
                  strokeWidth={2}
                >
                  <path d="M12 20l8-8h-5V4H9v8H4z" />
                </svg>
              }
              backgroundColor="transparent"
            />
          </div>
          <span>{thread.commentCount} comments</span>
          <span>Share</span>
          <span>Save</span>
        </div>
      </StyledCard>

      {/* Comment Input */}
      <StyledCard
        bgColor={site.theme.surface}
        borderColor={site.theme.border}
        padding="lg"
        borderRadius="md"
        shadow="sm"
      >
        <p className="text-sm mb-2" style={{ color: site.theme.textMuted }}>
          Comment as <span style={{ color: site.theme.secondary }}>u/guest</span>
        </p>
        <textarea
          placeholder="What are your thoughts?"
          className="w-full p-3 rounded text-sm resize-none mb-2"
          rows={4}
          style={{
            background: site.theme.background,
            border: `1px solid ${site.theme.border}`,
            color: site.theme.text,
          }}
        />
        <div className="flex justify-end">
          <Button
            variant="secondary"
            size="sm"
            backgroundColor={site.theme.secondary}
            textColor="white"
          >
            Comment
          </Button>
        </div>
      </StyledCard>

      {/* Comments */}
      <StyledCard
        bgColor={site.theme.surface}
        borderColor={site.theme.border}
        padding="lg"
        borderRadius="md"
        shadow="sm"
      >
        <div className="flex items-center gap-4 mb-4">
          <span className="text-sm font-medium" style={{ color: site.theme.text }}>
            Sort by: Best
          </span>
        </div>

        <div className="space-y-4">
          {thread.comments.map((comment) => (
            <CommentThread
              key={comment.id}
              comment={comment}
              depth={0}
              userVotes={userVotes}
              onVote={onVote}
              getVoteAdjustment={getVoteAdjustment}
            />
          ))}
        </div>
      </StyledCard>
    </div>
  )
}

// ============================================================================
// Comment Thread Component (Recursive)
// ============================================================================

interface CommentThreadProps {
  comment: ThreadComment
  depth: number
  userVotes: Record<string, 'up' | 'down' | null>
  onVote: (id: string, direction: 'up' | 'down') => void
  getVoteAdjustment: (id: string, originalVotes: number) => number
}

function CommentThread({ comment, depth, userVotes, onVote, getVoteAdjustment }: CommentThreadProps) {
  const [collapsed, setCollapsed] = useState(false)
  const votes = getVoteAdjustment(comment.id, comment.upvotes)
  const userVote = userVotes[comment.id]

  const borderColors = ['#0079d3', '#ff4500', '#00b300', '#9b59b6', '#3498db']
  const borderColor = borderColors[depth % borderColors.length]

  if (comment.content === '[removed]') {
    return (
      <div className="text-sm italic" style={{ color: site.theme.textMuted }}>
        [removed]
      </div>
    )
  }

  return (
    <div
      className="pl-3"
      style={{
        borderLeft: depth > 0 ? `2px solid ${borderColor}` : 'none',
        marginLeft: depth > 0 ? '8px' : 0,
      }}
    >
      <div className="py-1">
        {/* Comment Header */}
        <div className="flex items-center gap-2 text-xs" style={{ color: site.theme.textMuted }}>
          <Button
            onClick={() => setCollapsed(!collapsed)}
            variant="ghost"
            size="xs"
            backgroundColor="transparent"
            textColor={site.theme.textMuted}
          >
            {collapsed ? '[+]' : '[-]'}
          </Button>
          <span className="font-medium" style={{ color: comment.isOP ? site.theme.secondary : site.theme.text }}>
            u/{comment.author}
            {comment.isOP && <span className="ml-1 text-xs" style={{ color: site.theme.secondary }}>(OP)</span>}
          </span>
          {comment.flair && (
            <span
              className="px-1.5 py-0.5 rounded text-[10px]"
              style={{ background: site.theme.background, color: site.theme.textMuted }}
            >
              {comment.flair}
            </span>
          )}
          <span>•</span>
          <span>{comment.timestamp}</span>
        </div>

        {/* Comment Content */}
        {!collapsed && (
          <>
            <div
              className="text-sm py-1"
              style={{ color: site.theme.text }}
            >
              {comment.content}
            </div>

            {/* Comment Actions */}
            <div className="flex items-center gap-3 text-xs" style={{ color: site.theme.textMuted }}>
              <div className="flex items-center gap-1">
                <Button
                  onClick={() => onVote(comment.id, 'up')}
                  variant="ghost"
                  size="xs"
                  icon={
                    <svg
                      className="w-3 h-3"
                      viewBox="0 0 24 24"
                      fill={userVote === 'up' ? site.theme.upvote : 'none'}
                      stroke={userVote === 'up' ? site.theme.upvote : 'currentColor'}
                      strokeWidth={2}
                    >
                      <path d="M12 4l-8 8h5v8h6v-8h5z" />
                    </svg>
                  }
                  backgroundColor="transparent"
                />
                <span
                  className="font-medium"
                  style={{
                    color: userVote === 'up' ? site.theme.upvote :
                           userVote === 'down' ? site.theme.downvote :
                           votes < 0 ? site.theme.downvote :
                           site.theme.text
                  }}
                >
                  {votes}
                </span>
                <Button
                  onClick={() => onVote(comment.id, 'down')}
                  variant="ghost"
                  size="xs"
                  icon={
                    <svg
                      className="w-3 h-3"
                      viewBox="0 0 24 24"
                      fill={userVote === 'down' ? site.theme.downvote : 'none'}
                      stroke={userVote === 'down' ? site.theme.downvote : 'currentColor'}
                      strokeWidth={2}
                    >
                      <path d="M12 20l8-8h-5V4H9v8H4z" />
                    </svg>
                  }
                  backgroundColor="transparent"
                />
              </div>
              <Button
                variant="link"
                size="xs"
                textColor={site.theme.secondary}
              >
                Reply
              </Button>
              <Button
                variant="link"
                size="xs"
                textColor={site.theme.secondary}
              >
                Share
              </Button>
            </div>

            {/* Nested Replies */}
            {comment.replies.length > 0 && (
              <div className="mt-2">
                {comment.replies.map((reply) => (
                  <CommentThread
                    key={reply.id}
                    comment={reply}
                    depth={depth + 1}
                    userVotes={userVotes}
                    onVote={onVote}
                    getVoteAdjustment={getVoteAdjustment}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default ThreaditSite
