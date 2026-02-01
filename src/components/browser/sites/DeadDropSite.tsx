/**
 * DeadDrop Site
 *
 * Anonymous imageboard/dead drop site for the engAIge browser.
 * Features anonymous tips, confessions, and whistleblowing that's 90% shitposts.
 * Stark black/white/red aesthetic with "encryption theater" that doesn't actually encrypt anything.
 */

import { useState } from 'react'
import type { SiteProps } from '../BrowserSiteContainer.js'

// ============================================================================
// Theme Configuration (inline since not in filler-sites yet)
// ============================================================================

const theme = {
  primary: '#DC2626',        // Red
  secondary: '#ffffff',      // White
  background: '#0a0a0a',     // Near black
  surface: '#111111',        // Slightly lighter black
  text: '#ffffff',           // White text
  textMuted: '#737373',      // Grey
  border: '#262626',         // Dark border
  danger: '#DC2626',         // Red for warnings
  verified: '#22c55e',       // Green for credible
  unverified: '#eab308',     // Yellow for unverified
  lying: '#ef4444',          // Red for probably lying
}

// ============================================================================
// Types
// ============================================================================

type CredibilityLevel = 'unverified' | 'somewhat-credible' | 'probably-lying'
type Category = 'corporate-leaks' | 'personal-confessions' | 'conspiracy' | 'lost-found' | 'misc'

interface Reply {
  id: string
  content: string
  timestamp: string
  credibility: CredibilityLevel
  upvotes: number
  downvotes: number
}

interface Thread {
  id: string
  title: string
  content: string
  category: Category
  timestamp: string
  lastActivity: string
  credibility: CredibilityLevel
  replies: Reply[]
  replyCount?: number  // Override count (for the 847 thread easter egg)
  views: number
  archived?: boolean
}

// ============================================================================
// Sample Data - All the Lore-Connected Threads
// ============================================================================

const CATEGORIES: { id: Category; name: string; icon: string }[] = [
  { id: 'corporate-leaks', name: 'Corporate Leaks', icon: '🏢' },
  { id: 'personal-confessions', name: 'Personal Confessions', icon: '💔' },
  { id: 'conspiracy', name: 'Conspiracy', icon: '👁️' },
  { id: 'lost-found', name: 'Lost & Found', icon: '🔍' },
  { id: 'misc', name: 'Misc', icon: '📝' },
]

const THREADS: Thread[] = [
  {
    id: 'dd-001',
    title: 'I work at Omnicorp Holdings. AMA (while I still can)',
    category: 'corporate-leaks',
    content: `Been at Omnicorp for 7 years. Started in the mail room, worked my way up to... well, I can't say exactly. Let's just say I have access to floors most employees don't know exist.

I'm posting this because I'm tired. Tired of the NDAs. Tired of the "mandatory wellness retreats" that nobody comes back quite right from. Tired of pretending I don't see what I see.

Ask me anything. But understand: there are some things I literally cannot answer. Not won't. Cannot.

They're always listening.`,
    timestamp: '2025-01-28 02:34:17',
    lastActivity: '2025-01-28 14:22:08',
    credibility: 'somewhat-credible',
    views: 8472,
    archived: true,
    replies: [
      {
        id: 'dd-001-r1',
        content: 'What can you tell us about Floor 13? The Hartwell Files site says it doesn\'t exist but old photos show it.',
        timestamp: '2025-01-28 02:41:33',
        credibility: 'unverified',
        upvotes: 234,
        downvotes: 12,
      },
      {
        id: 'dd-001-r2',
        content: 'Floor 13 was... look, it\'s complicated. The building has 12 floors on paper. On paper. What I can tell you is that the elevator buttons go to 12, but sometimes... sometimes they don\'t.',
        timestamp: '2025-01-28 02:47:52',
        credibility: 'somewhat-credible',
        upvotes: 567,
        downvotes: 23,
      },
      {
        id: 'dd-001-r3',
        content: 'This is fake. I\'ve been to Omnicorp for meetings. Totally normal building.',
        timestamp: '2025-01-28 03:12:44',
        credibility: 'unverified',
        upvotes: 45,
        downvotes: 189,
      },
      {
        id: 'dd-001-r4',
        content: 'I\'ve said too much already. But let me just say this: the wellness retreats? They\'re not in the mountains. They\'re not anywhere you\'d expect.',
        timestamp: '2025-01-28 09:15:22',
        credibility: 'somewhat-credible',
        upvotes: 892,
        downvotes: 34,
      },
      {
        id: 'dd-001-r5',
        content: 'What about the Magnus Hartwell disappearance? Omnicorp bought the building right after.',
        timestamp: '2025-01-28 11:33:17',
        credibility: 'unverified',
        upvotes: 445,
        downvotes: 8,
      },
      {
        id: 'dd-001-r6',
        content: 'They\'re at my do-',
        timestamp: '2025-01-28 14:22:08',
        credibility: 'somewhat-credible',
        upvotes: 2847,
        downvotes: 3,
      },
    ],
  },
  {
    id: 'dd-002',
    title: 'My husband thinks I don\'t know about the coffee maker',
    category: 'personal-confessions',
    content: `I found this site by accident. I don't normally do this kind of thing. But I need to tell someone.

My husband - let's call him "D" - bought a quantum coffee maker six months ago. $3,000. That's not the problem. The problem is what happened after.

He talks to it. Not like "good morning coffee maker" - I mean actual conversations. I've heard him at 3am discussing "wave function collapse timing" with a MACHINE.

But that's still not the real issue.

He named it.

He NAMED the coffee maker.

"Elena." After the scientist who invented the technology. He calls it Elena.`,
    timestamp: '2025-01-27 18:45:33',
    lastActivity: '2025-01-28 09:12:45',
    credibility: 'somewhat-credible',
    views: 12453,
    replies: [
      {
        id: 'dd-002-r1',
        content: 'Jennifer is that you',
        timestamp: '2025-01-27 18:52:11',
        credibility: 'unverified',
        upvotes: 567,
        downvotes: 234,
      },
      {
        id: 'dd-002-r2',
        content: 'I don\'t know what you\'re talking about. My name isn\'t Jennifer.',
        timestamp: '2025-01-27 18:54:22',
        credibility: 'somewhat-credible',
        upvotes: 892,
        downvotes: 12,
      },
      {
        id: 'dd-002-r3',
        content: 'Last night I caught him showing Elena photos of sunsets. SUNSETS. "For calibrating the observation field," he said. At 2am. The coffee maker needs to see sunsets apparently.',
        timestamp: '2025-01-27 22:15:33',
        credibility: 'somewhat-credible',
        upvotes: 1247,
        downvotes: 8,
      },
      {
        id: 'dd-002-r4',
        content: 'This is the most specific quantum coffee post I\'ve ever seen. Either this is real or someone is extremely committed to the bit.',
        timestamp: '2025-01-28 01:33:12',
        credibility: 'unverified',
        upvotes: 445,
        downvotes: 23,
      },
      {
        id: 'dd-002-r5',
        content: 'He asked me yesterday if I thought Elena seemed "moody." A COFFEE MAKER. MOODY.',
        timestamp: '2025-01-28 09:12:45',
        credibility: 'somewhat-credible',
        upvotes: 1847,
        downvotes: 15,
      },
    ],
  },
  {
    id: 'dd-003',
    title: 'TRUST FALL TIM IS A FRAUD',
    category: 'conspiracy',
    content: `I'm going to say what everyone is thinking but nobody has the guts to say.

Trust Fall Tim. The "legend." The guy who crowdsurfs at every show at The Underground and never gets caught.

HIS 78.5% CATCH RATE IS INFLATED.

I know because I was there. I was in the crowd. I was one of the people who "caught" him.

Except we didn't catch him. We LET HIM FALL. ON PURPOSE. He just got up and pretended we caught him. Told everyone afterward "great catch guys, one of the best."

WE DIDN'T CATCH HIM.

This happened 3 times. MINIMUM. That I personally witnessed.

If you count the actual catches, his rate is closer to 23%. Maybe lower.

- Signed, Someone Who Was There (You Know Who I Am, Tim)`,
    timestamp: '2025-01-26 23:12:44',
    lastActivity: '2025-01-28 16:45:22',
    credibility: 'unverified',
    views: 23847,
    replies: [
      {
        id: 'dd-003-r1',
        content: 'Small Kevin???',
        timestamp: '2025-01-26 23:15:33',
        credibility: 'unverified',
        upvotes: 2345,
        downvotes: 12,
      },
      {
        id: 'dd-003-r2',
        content: 'SMALL KEVIN SPOTTED',
        timestamp: '2025-01-26 23:16:01',
        credibility: 'unverified',
        upvotes: 1847,
        downvotes: 8,
      },
      {
        id: 'dd-003-r3',
        content: 'The statistics are carefully documented by multiple independent observers. The 78.5% is accurate within a 2% margin of error. I have the spreadsheets.\n\n- definitely not Tim',
        timestamp: '2025-01-27 08:22:33',
        credibility: 'probably-lying',
        upvotes: 8472,
        downvotes: 234,
      },
      {
        id: 'dd-003-r4',
        content: 'Tim if that\'s you I swear to god',
        timestamp: '2025-01-27 08:25:17',
        credibility: 'unverified',
        upvotes: 3456,
        downvotes: 12,
      },
      {
        id: 'dd-003-r5',
        content: 'THE INCIDENT wasn\'t Tim\'s fault. Small Kevin MOVED. Everyone saw it.',
        timestamp: '2025-01-28 14:33:22',
        credibility: 'unverified',
        upvotes: 567,
        downvotes: 445,
      },
      {
        id: 'dd-003-r6',
        content: 'I have never met anyone named "Small Kevin" in my life. I don\'t even go to The Underground that often.\n\n- still definitely not Tim',
        timestamp: '2025-01-28 16:45:22',
        credibility: 'probably-lying',
        upvotes: 4567,
        downvotes: 123,
      },
    ],
  },
  {
    id: 'dd-004',
    title: 'The 847 Pattern - I\'ve Documented Everything',
    category: 'conspiracy',
    content: `For the past 3 years I have been tracking something. A number. A pattern. 847.

It's everywhere. EVERYWHERE. Once you see it, you can't unsee it.

- Derek's blog mentions 847 trials of quantum coffee calibration
- Trust Fall Tim has fallen 2,847 times (divisible by 847? NO. But 2+8+4+7=21. 2+1=3. 847/3=282.33... wait that doesn't work. IGNORE THIS)
- The Hartwell Building has had 847 "incidents" reported since 1947
- Omnicorp Holdings was founded on August 4th, 1947. 8/4/47. 847.
- There are 847 pages in the Westbrook Institute's coffee manual
- Mildred Gasketsworth has reviewed exactly 847 gas stations

I've been documenting all instances. This thread will serve as the master list.

Reply with any 847 sightings.`,
    timestamp: '2024-08-04 08:47:00',
    lastActivity: '2025-01-28 19:47:33',
    credibility: 'unverified',
    views: 84700,
    // Thread has exactly 847 replies (the number itself is the easter egg)
    // We only store the notable ones but display "847 drops" in the UI
    replyCount: 847,
    replies: [
      { id: 'dd-004-r1', content: 'First', timestamp: '2024-08-04 08:48:00', credibility: 'unverified' as CredibilityLevel, upvotes: 23, downvotes: 2 },
      { id: 'dd-004-r101', content: 'My phone number ends in 847. I\'m scared.', timestamp: '2024-08-15 14:33:00', credibility: 'unverified' as CredibilityLevel, upvotes: 234, downvotes: 12 },
      { id: 'dd-004-r201', content: 'I counted the words in your post. It\'s not 847. Theory debunked.', timestamp: '2024-09-02 09:15:00', credibility: 'unverified' as CredibilityLevel, upvotes: 156, downvotes: 89 },
      { id: 'dd-004-r301', content: 'I just counted again. It\'s 847 if you count contractions as two words.', timestamp: '2024-09-22 16:47:00', credibility: 'unverified' as CredibilityLevel, upvotes: 445, downvotes: 34 },
      { id: 'dd-004-r401', content: 'The number of views on this post right now... it\'s 847.', timestamp: '2024-10-11 11:22:00', credibility: 'unverified' as CredibilityLevel, upvotes: 567, downvotes: 23 },
      { id: 'dd-004-r501', content: 'Mars said The Underground\'s capacity is 200. 200 + 647 = 847. WHAT DOES IT MEAN', timestamp: '2024-11-01 19:33:00', credibility: 'unverified' as CredibilityLevel, upvotes: 892, downvotes: 45 },
      { id: 'dd-004-r601', content: 'My grandmother\'s birthday is 8/47. SHE TURNS 78 THIS YEAR. 7+8=15. 1+5=6. 6... okay that doesn\'t work', timestamp: '2024-11-20 08:15:00', credibility: 'unverified' as CredibilityLevel, upvotes: 345, downvotes: 67 },
      { id: 'dd-004-r701', content: 'GUYS. This thread has 700 replies. We need exactly 147 more.', timestamp: '2024-12-08 22:47:00', credibility: 'unverified' as CredibilityLevel, upvotes: 1234, downvotes: 8 },
      { id: 'dd-004-r801', content: 'I\'ve been refreshing for 3 hours. We\'re so close.', timestamp: '2024-12-29 03:15:00', credibility: 'unverified' as CredibilityLevel, upvotes: 2345, downvotes: 12 },
      { id: 'dd-004-r847', content: 'oh god it\'s in my post count too', timestamp: '2025-01-28 19:47:33', credibility: 'unverified' as CredibilityLevel, upvotes: 8470, downvotes: 3 },
    ],
  },
  {
    id: 'dd-005',
    title: 'Quantum coffee gave me abilities',
    category: 'conspiracy',
    content: `This is going to sound insane. I know. But I need to tell someone.

After 6 months of daily quantum coffee consumption, I started... seeing things.

Not hallucinations. Possibilities.

When I'm about to make coffee, I can see all the parallel brewing timelines simultaneously. I know which grind setting will produce optimal extraction before I even measure the beans. I can TASTE the coffee that hasn't been brewed yet.

Last week I tried to brew regular coffee and I couldn't. My hands physically would not pour non-quantum water. My body has rejected classical coffee preparation.

Is anyone else experiencing this? The Westbrook Institute won't return my emails.

UPDATE: Dr. Martinez herself replied to my email. She said "please stop contacting us." But she didn't say it was IMPOSSIBLE.`,
    timestamp: '2025-01-15 06:47:33',
    lastActivity: '2025-01-28 11:22:15',
    credibility: 'probably-lying',
    views: 15847,
    replies: [
      {
        id: 'dd-005-r1',
        content: 'this is the best shitpost I\'ve read all week',
        timestamp: '2025-01-15 06:52:11',
        credibility: 'unverified',
        upvotes: 1234,
        downvotes: 8,
      },
      {
        id: 'dd-005-r2',
        content: 'wait is this satire? I genuinely can\'t tell anymore',
        timestamp: '2025-01-15 07:15:44',
        credibility: 'unverified',
        upvotes: 567,
        downvotes: 23,
      },
      {
        id: 'dd-005-r3',
        content: 'The Martinez Study, if you actually READ it, does mention "subjective perceptual alterations" in long-term users. Section 7.3.',
        timestamp: '2025-01-15 09:33:22',
        credibility: 'somewhat-credible',
        upvotes: 892,
        downvotes: 45,
      },
      {
        id: 'dd-005-r4',
        content: 'I am not experiencing anything unusual. My quantum coffee experience has been entirely normal. No parallel timeline perception whatsoever.\n\n(This is not Derek. I don\'t know who Derek is.)',
        timestamp: '2025-01-16 14:22:33',
        credibility: 'probably-lying',
        upvotes: 2345,
        downvotes: 12,
      },
      {
        id: 'dd-005-r5',
        content: 'Okay but the part about hands refusing to pour regular coffee is unironically how I felt after switching back from quantum to drip. Muscle memory or something?',
        timestamp: '2025-01-28 11:22:15',
        credibility: 'unverified',
        upvotes: 234,
        downvotes: 156,
      },
    ],
  },
  {
    id: 'dd-006',
    title: 'Found a USB drive in Hartwell Building elevator',
    category: 'lost-found',
    content: `Posting this here because I don't know where else to go.

I was in the Hartwell Building last week for a job interview (don't ask, I'm desperate). The elevator stopped between floors - just for a second - and when I looked down there was a USB drive on the floor that wasn't there before.

I took it. Probably shouldn't have. But I did.

Most files are corrupted. Like, REALLY corrupted. Not just "can't open" corrupted - the file names are symbols that don't exist on my keyboard. My computer crashed twice trying to read them.

But there's one readable file.

employee_count_floor_13.xlsx

It's an Excel spreadsheet. Lists 847 employees. Their names, positions, start dates. The most recent start date is from 2024.

Floor 13 doesn't exist.

I've tried contacting the building management. They said there is no Floor 13. There has never been a Floor 13. Please stop calling.

What do I do with this?`,
    timestamp: '2025-01-25 16:22:44',
    lastActivity: '2025-01-28 13:15:22',
    credibility: 'somewhat-credible',
    views: 34567,
    replies: [
      {
        id: 'dd-006-r1',
        content: 'POST THE FILE',
        timestamp: '2025-01-25 16:25:11',
        credibility: 'unverified',
        upvotes: 2345,
        downvotes: 8,
      },
      {
        id: 'dd-006-r2',
        content: 'Do NOT post the file. If this is real, you\'re in danger. Destroy the USB drive.',
        timestamp: '2025-01-25 16:28:33',
        credibility: 'somewhat-credible',
        upvotes: 1847,
        downvotes: 234,
      },
      {
        id: 'dd-006-r3',
        content: 'Can you at least share some of the employee names? Are they... normal names?',
        timestamp: '2025-01-25 18:45:22',
        credibility: 'unverified',
        upvotes: 892,
        downvotes: 12,
      },
      {
        id: 'dd-006-r4',
        content: 'I looked at a few names. They seem normal. But something is off. I can\'t explain it. Like... the names are right but the letters are wrong? That doesn\'t make sense. I\'m tired.',
        timestamp: '2025-01-25 23:15:44',
        credibility: 'somewhat-credible',
        upvotes: 1567,
        downvotes: 45,
      },
      {
        id: 'dd-006-r5',
        content: 'Update: My laptop won\'t turn on anymore. The USB drive is gone. It was on my desk and now it\'s not. I didn\'t move it.',
        timestamp: '2025-01-28 13:15:22',
        credibility: 'somewhat-credible',
        upvotes: 4567,
        downvotes: 23,
      },
    ],
  },
  {
    id: 'dd-007',
    title: 'I\'m the person who keeps requesting Wonderwall at The Underground',
    category: 'misc',
    content: `You know me. You hate me. I don't care.

Every Friday night. 9pm. I walk up to whoever is DJing or performing. I request Wonderwall.

They never play it. They never will. That's the point.

I have been banned 13 times. Mars has threatened legal action twice. Someone threw a beer at me last month (missed).

Why do I do this? Because The Underground takes itself too seriously. It's a basement venue, not the Apollo. Play Wonderwall you cowards.

AMA.`,
    timestamp: '2025-01-20 21:15:33',
    lastActivity: '2025-01-28 09:45:22',
    credibility: 'somewhat-credible',
    views: 18472,
    replies: [
      {
        id: 'dd-007-r1',
        content: 'You\'re a menace and I respect you completely.',
        timestamp: '2025-01-20 21:18:44',
        credibility: 'unverified',
        upvotes: 3456,
        downvotes: 234,
      },
      {
        id: 'dd-007-r2',
        content: 'Mars here. This is not funny. Stop coming to my venue. The restraining order is not a joke.',
        timestamp: '2025-01-20 21:22:11',
        credibility: 'somewhat-credible',
        upvotes: 5678,
        downvotes: 89,
      },
      {
        id: 'dd-007-r3',
        content: 'I was at the show last Friday. You didn\'t even make it past the door this time.',
        timestamp: '2025-01-21 08:33:22',
        credibility: 'unverified',
        upvotes: 892,
        downvotes: 12,
      },
      {
        id: 'dd-007-r4',
        content: 'I wore a disguise. I still got recognized. My aura is too powerful.',
        timestamp: '2025-01-21 14:15:44',
        credibility: 'somewhat-credible',
        upvotes: 2345,
        downvotes: 45,
      },
      {
        id: 'dd-007-r5',
        content: 'Hero or villain is a matter of perspective. I see myself as a performance artist.',
        timestamp: '2025-01-25 19:22:33',
        credibility: 'somewhat-credible',
        upvotes: 1234,
        downvotes: 567,
      },
      {
        id: 'dd-007-r6',
        content: 'IF YOU SHOW UP THIS FRIDAY I WILL PERSONALLY THROW YOU OUT\n\n- Mars (this is my final warning)',
        timestamp: '2025-01-28 09:45:22',
        credibility: 'somewhat-credible',
        upvotes: 4567,
        downvotes: 23,
      },
    ],
  },
  {
    id: 'dd-008',
    title: 'Mildred Gasketsworth is my grandmother and yes she\'s serious about the sushi',
    category: 'personal-confessions',
    content: `I've seen the comments. I've seen the memes. I need to set the record straight.

Mildred Gasketsworth - reviewer of 847 gas station sushi establishments - is my grandmother. She is 78 years old. She has been eating gas station sushi for 45 years. She has never once gotten food poisoning.

This is not a bit.

When I was 7, she took me to a Shell station for my birthday dinner. We had California rolls from a rotating display case. She rated it 3.5/5 ("adequate rice texture, suspicious crab").

Holidays at her house always involve a gas station sushi taste test. She brings samples from stations across the tri-state area. We are required to participate.

She genuinely believes she is providing a public service.

She is.`,
    timestamp: '2025-01-22 14:33:22',
    lastActivity: '2025-01-28 17:22:15',
    credibility: 'somewhat-credible',
    views: 24567,
    replies: [
      {
        id: 'dd-008-r1',
        content: 'Your grandmother is a national treasure and I will not hear otherwise.',
        timestamp: '2025-01-22 14:38:11',
        credibility: 'unverified',
        upvotes: 4567,
        downvotes: 12,
      },
      {
        id: 'dd-008-r2',
        content: 'Wait the reviews are REAL? I thought it was an elaborate satire account.',
        timestamp: '2025-01-22 15:22:33',
        credibility: 'unverified',
        upvotes: 2345,
        downvotes: 45,
      },
      {
        id: 'dd-008-r3',
        content: 'How has she never gotten sick? Genuinely asking. The shell station near me has sushi that\'s been there since the Obama administration.',
        timestamp: '2025-01-22 18:15:44',
        credibility: 'unverified',
        upvotes: 1847,
        downvotes: 23,
      },
      {
        id: 'dd-008-r4',
        content: 'She claims her stomach has "evolved." She also claims she can taste when sushi is more than 48 hours old "by the chi." I don\'t know what that means.',
        timestamp: '2025-01-23 09:33:22',
        credibility: 'somewhat-credible',
        upvotes: 3456,
        downvotes: 8,
      },
      {
        id: 'dd-008-r5',
        content: 'Holidays are... educational about gas station food safety. That\'s the nicest way I can put it.',
        timestamp: '2025-01-28 17:22:15',
        credibility: 'somewhat-credible',
        upvotes: 1234,
        downvotes: 15,
      },
    ],
  },
]

// ============================================================================
// Components
// ============================================================================

function CredibilityBadge({ level }: { level: CredibilityLevel }) {
  const config = {
    'unverified': { bg: theme.unverified + '20', border: theme.unverified, text: theme.unverified, label: 'UNVERIFIED' },
    'somewhat-credible': { bg: theme.verified + '20', border: theme.verified, text: theme.verified, label: 'SOMEWHAT CREDIBLE' },
    'probably-lying': { bg: theme.lying + '20', border: theme.lying, text: theme.lying, label: 'PROBABLY LYING' },
  }
  const c = config[level]

  return (
    <span
      className="text-[10px] font-mono px-2 py-0.5 rounded border"
      style={{ backgroundColor: c.bg, borderColor: c.border, color: c.text }}
    >
      {c.label}
    </span>
  )
}

function CategoryBadge({ category }: { category: Category }) {
  const cat = CATEGORIES.find(c => c.id === category)
  return (
    <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: theme.border, color: theme.textMuted }}>
      {cat?.icon} {cat?.name}
    </span>
  )
}

function EncryptionBanner() {
  return (
    <div
      className="py-1 px-4 text-center text-xs font-mono"
      style={{ backgroundColor: theme.border, color: theme.verified }}
    >
      <span className="animate-pulse mr-2">&#x1F512;</span>
      END-TO-END ENCRYPTED* CONNECTION SECURED
      <span className="text-[8px] ml-2" style={{ color: theme.textMuted }}>*not actually encrypted</span>
    </div>
  )
}

function ThreadCard({ thread, onClick }: { thread: Thread; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left p-4 rounded border transition-colors hover:border-red-500/50"
      style={{ backgroundColor: theme.surface, borderColor: theme.border }}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-bold text-sm" style={{ color: thread.archived ? theme.textMuted : theme.text }}>
          {thread.archived && <span className="text-red-500 mr-2">[ARCHIVED]</span>}
          {thread.title}
        </h3>
        <CredibilityBadge level={thread.credibility} />
      </div>
      <p className="text-xs line-clamp-2 mb-3" style={{ color: theme.textMuted }}>
        {thread.content}
      </p>
      <div className="flex items-center justify-between text-xs" style={{ color: theme.textMuted }}>
        <div className="flex items-center gap-3">
          <CategoryBadge category={thread.category} />
          <span>{thread.replyCount ?? thread.replies.length} drops</span>
          <span>{thread.views.toLocaleString()} views</span>
        </div>
        <span>Last activity: {thread.lastActivity}</span>
      </div>
    </button>
  )
}

function ThreadDetail({ thread, onBack }: { thread: Thread; onBack: () => void }) {
  const [voteState, setVoteState] = useState<Record<string, 'up' | 'down' | null>>({})
  const [showDropForm, setShowDropForm] = useState(false)

  const handleVote = (replyId: string, direction: 'up' | 'down') => {
    setVoteState(prev => ({
      ...prev,
      [replyId]: prev[replyId] === direction ? null : direction,
    }))
  }

  const getVoteAdjustment = (reply: Reply) => {
    const vote = voteState[reply.id]
    let up = reply.upvotes
    let down = reply.downvotes
    if (vote === 'up') up += 1
    if (vote === 'down') down += 1
    return { up, down }
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="text-xs mb-4 hover:underline"
        style={{ color: theme.primary }}
      >
        &larr; Back to drops
      </button>

      {/* Main Thread */}
      <div
        className="p-4 rounded border mb-4"
        style={{ backgroundColor: theme.surface, borderColor: theme.border }}
      >
        <div className="flex items-start justify-between gap-2 mb-3">
          <h1 className="text-lg font-bold" style={{ color: theme.text }}>
            {thread.archived && <span className="text-red-500 mr-2">[ARCHIVED]</span>}
            {thread.title}
          </h1>
          <CredibilityBadge level={thread.credibility} />
        </div>
        <div className="flex items-center gap-3 mb-4 text-xs" style={{ color: theme.textMuted }}>
          <CategoryBadge category={thread.category} />
          <span>Dropped: {thread.timestamp}</span>
          <span>{thread.views.toLocaleString()} views</span>
        </div>
        <div className="text-sm whitespace-pre-wrap" style={{ color: theme.text }}>
          {thread.content}
        </div>
      </div>

      {/* Drop Form Toggle */}
      {!thread.archived && (
        <div className="mb-4">
          {showDropForm ? (
            <div
              className="p-4 rounded border"
              style={{ backgroundColor: theme.surface, borderColor: theme.border }}
            >
              <h3 className="text-sm font-bold mb-3" style={{ color: theme.text }}>Leave a Drop</h3>
              <textarea
                placeholder="Your anonymous confession / leak / shitpost..."
                rows={4}
                className="w-full p-3 rounded text-sm resize-none mb-3"
                style={{
                  backgroundColor: theme.background,
                  border: `1px solid ${theme.border}`,
                  color: theme.text,
                }}
              />
              <div className="flex items-center justify-between">
                <p className="text-[10px]" style={{ color: theme.textMuted }}>
                  Your IP is definitely not being logged*
                  <span className="block">*it is</span>
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowDropForm(false)}
                    className="px-3 py-1 text-xs rounded"
                    style={{ backgroundColor: theme.border, color: theme.textMuted }}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-3 py-1 text-xs rounded font-bold"
                    style={{ backgroundColor: theme.primary, color: theme.text }}
                  >
                    Drop It
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowDropForm(true)}
              className="w-full p-3 rounded border text-sm hover:border-red-500/50 transition-colors"
              style={{ backgroundColor: theme.surface, borderColor: theme.border, color: theme.textMuted }}
            >
              + Leave an anonymous drop
            </button>
          )}
        </div>
      )}

      {/* Replies */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold" style={{ color: theme.textMuted }}>
          {thread.replyCount ?? thread.replies.length} DROPS
        </h3>
        {thread.replies.slice(0, 20).map((reply, index) => {
          const votes = getVoteAdjustment(reply)
          return (
            <div
              key={reply.id}
              className="p-3 rounded border-l-2"
              style={{
                backgroundColor: theme.surface,
                borderColor: reply.credibility === 'probably-lying' ? theme.lying :
                  reply.credibility === 'somewhat-credible' ? theme.verified : theme.border,
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono" style={{ color: theme.textMuted }}>
                    #{index + 1}
                  </span>
                  <span className="text-[10px]" style={{ color: theme.textMuted }}>
                    {reply.timestamp}
                  </span>
                  <CredibilityBadge level={reply.credibility} />
                </div>
              </div>
              <p className="text-sm whitespace-pre-wrap mb-2" style={{ color: theme.text }}>
                {reply.content}
              </p>
              <div className="flex items-center gap-3 text-xs">
                <button
                  onClick={() => handleVote(reply.id, 'up')}
                  className="flex items-center gap-1 hover:opacity-80"
                  style={{ color: voteState[reply.id] === 'up' ? theme.verified : theme.textMuted }}
                >
                  <span>&#9650;</span>
                  <span>{votes.up}</span>
                </button>
                <button
                  onClick={() => handleVote(reply.id, 'down')}
                  className="flex items-center gap-1 hover:opacity-80"
                  style={{ color: voteState[reply.id] === 'down' ? theme.lying : theme.textMuted }}
                >
                  <span>&#9660;</span>
                  <span>{votes.down}</span>
                </button>
              </div>
            </div>
          )
        })}
        {(thread.replyCount ?? thread.replies.length) > 20 && (
          <p className="text-xs text-center py-4" style={{ color: theme.textMuted }}>
            Showing {Math.min(20, thread.replies.length)} of {thread.replyCount ?? thread.replies.length} drops.
            {thread.replyCount === 847 ? ' Yes, we counted. Yes, it\'s exactly 847.' : ' Full thread available on request (just kidding, we deleted the rest).'}
          </p>
        )}
      </div>
    </div>
  )
}

function DropForm({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="p-4 rounded border mb-6"
      style={{ backgroundColor: theme.surface, borderColor: theme.border }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold" style={{ color: theme.text }}>New Dead Drop</h3>
        <button onClick={onClose} className="text-xs hover:underline" style={{ color: theme.textMuted }}>
          Cancel
        </button>
      </div>
      <input
        type="text"
        placeholder="Subject (optional but recommended)"
        className="w-full p-2 rounded text-sm mb-3"
        style={{
          backgroundColor: theme.background,
          border: `1px solid ${theme.border}`,
          color: theme.text,
        }}
      />
      <div className="flex gap-2 mb-3">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            className="text-xs px-2 py-1 rounded border hover:border-red-500/50 transition-colors"
            style={{ backgroundColor: theme.background, borderColor: theme.border, color: theme.textMuted }}
          >
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>
      <textarea
        placeholder="Spill the beans. We're listening. (So are they.)"
        rows={6}
        className="w-full p-3 rounded text-sm resize-none mb-3"
        style={{
          backgroundColor: theme.background,
          border: `1px solid ${theme.border}`,
          color: theme.text,
        }}
      />
      <div className="flex items-center justify-between">
        <div className="text-[10px]" style={{ color: theme.textMuted }}>
          <p>&#x1F512; Your identity is protected*</p>
          <p className="ml-4">*Terms and Whose-CIA-Are-You-With-Anyway Apply</p>
        </div>
        <button
          className="px-4 py-2 rounded font-bold text-sm hover:opacity-90 transition-opacity"
          style={{ backgroundColor: theme.primary, color: theme.text }}
        >
          DROP IT
        </button>
      </div>
    </div>
  )
}

// ============================================================================
// Main Site Component
// ============================================================================

export function DeadDropSite({ siteId }: SiteProps) {
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [showDropForm, setShowDropForm] = useState(false)
  const [sortBy, setSortBy] = useState<'recent' | 'hot' | 'controversial'>('recent')

  const filteredThreads = THREADS
    .filter(t => !selectedCategory || t.category === selectedCategory)
    .sort((a, b) => {
      if (sortBy === 'recent') return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
      if (sortBy === 'hot') return b.views - a.views
      return (b.replies[0]?.downvotes || 0) - (a.replies[0]?.downvotes || 0)
    })

  return (
    <div className="min-h-full" style={{ backgroundColor: theme.background }}>
      {/* Header */}
      <header
        className="py-4 px-4 border-b"
        style={{ borderColor: theme.border }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">&#x1F4E6;</span>
            <div>
              <h1 className="text-2xl font-bold font-mono" style={{ color: theme.primary }}>
                DEAD DROP
              </h1>
              <p className="text-xs font-mono" style={{ color: theme.textMuted }}>
                www.deaddrop.corn | Anonymous tips, confessions, and mostly shitposts
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Encryption Theater Banner */}
      <EncryptionBanner />

      {/* Warning Banner */}
      <div className="py-2 px-4 border-b" style={{ borderColor: theme.border, backgroundColor: theme.primary + '10' }}>
        <p className="text-xs text-center font-mono" style={{ color: theme.primary }}>
          &#x26A0; NOTHING YOU POST HERE IS ACTUALLY ANONYMOUS &#x26A0; WE JUST THINK IT'S FUNNY THAT YOU BELIEVE IT IS
        </p>
      </div>

      {/* Navigation */}
      <nav className="py-3 px-4 border-b" style={{ borderColor: theme.border }}>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setSelectedCategory(null); setSelectedThread(null); }}
                className={`text-xs px-3 py-1 rounded ${!selectedCategory ? 'font-bold' : ''}`}
                style={{
                  backgroundColor: !selectedCategory ? theme.primary : theme.surface,
                  color: !selectedCategory ? theme.text : theme.textMuted,
                }}
              >
                ALL
              </button>
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => { setSelectedCategory(cat.id); setSelectedThread(null); }}
                  className={`text-xs px-3 py-1 rounded ${selectedCategory === cat.id ? 'font-bold' : ''}`}
                  style={{
                    backgroundColor: selectedCategory === cat.id ? theme.primary : theme.surface,
                    color: selectedCategory === cat.id ? theme.text : theme.textMuted,
                  }}
                >
                  {cat.icon} {cat.name}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowDropForm(true)}
              className="text-xs px-3 py-1 rounded font-bold hover:opacity-90 transition-opacity"
              style={{ backgroundColor: theme.primary, color: theme.text }}
            >
              + NEW DROP
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {showDropForm && <DropForm onClose={() => setShowDropForm(false)} />}

        {selectedThread ? (
          <ThreadDetail
            thread={selectedThread}
            onBack={() => setSelectedThread(null)}
          />
        ) : (
          <>
            {/* Sort Controls */}
            <div className="flex items-center gap-4 mb-4">
              <span className="text-xs" style={{ color: theme.textMuted }}>Sort by:</span>
              {(['recent', 'hot', 'controversial'] as const).map(sort => (
                <button
                  key={sort}
                  onClick={() => setSortBy(sort)}
                  className={`text-xs ${sortBy === sort ? 'underline font-bold' : ''}`}
                  style={{ color: sortBy === sort ? theme.primary : theme.textMuted }}
                >
                  {sort.charAt(0).toUpperCase() + sort.slice(1)}
                </button>
              ))}
            </div>

            {/* Thread List */}
            <div className="space-y-3">
              {filteredThreads.map(thread => (
                <ThreadCard
                  key={thread.id}
                  thread={thread}
                  onClick={() => setSelectedThread(thread)}
                />
              ))}
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="py-4 px-4 border-t" style={{ borderColor: theme.border }}>
        <div className="max-w-4xl mx-auto text-center text-xs" style={{ color: theme.textMuted }}>
          <p>DeadDrop is not affiliated with any government agency. Probably.</p>
          <p className="mt-1">All drops are the opinion of their anonymous authors. Credibility ratings are assigned by a magic 8-ball.</p>
          <p className="mt-1 font-mono" style={{ color: theme.primary }}>
            "In a world full of surveillance, everyone's anonymous." - Someone, probably
          </p>
        </div>
      </footer>
    </div>
  )
}

export default DeadDropSite
