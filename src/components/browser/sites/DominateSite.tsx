/**
 * DOMINATE Site
 *
 * Chad Thundercoach's high-intensity life coaching empire.
 * Every piece of advice is delivered with maximum aggression,
 * treating mundane tasks like preparation for WAR.
 * The advice is technically correct but delivered with unhinged energy.
 */

import { useState, useMemo } from 'react'
import type { SiteProps } from '../BrowserSiteContainer.js'
import { FILLER_SITES } from '../../../config/filler-sites.js'
import { StyledCard, Button } from '../../ui/shared/index.js'
import { useSiteContent, type SiteContentItem } from '../../../hooks/useSiteContent.js'

const site = FILLER_SITES.dominate

// ============================================================================
// Types & Data
// ============================================================================

interface MotivationalPost {
  id: string
  title: string
  date: string
  excerpt: string
  content: string[]
  intensityLevel: number // 1-5 fire emojis
  category: string
  readTime: string
  warriorsEngaged: number
  isPremiumContent?: boolean
}

const MOTIVATIONAL_POSTS: MotivationalPost[] = [
  {
    id: 'bed-making-warrior',
    title: 'HOW TO MAKE YOUR BED LIKE A WARRIOR (This Is NOT About Sleep, It\'s About DOMINANCE)',
    date: 'January 22, 2026',
    excerpt: 'Your bed is LAUGHING at you right now. Those wrinkled sheets? That\'s WEAKNESS manifesting in cotton form. TIME TO DESTROY CHAOS.',
    readTime: '8 min read',
    warriorsEngaged: 47892,
    intensityLevel: 4,
    category: 'MORNING DOMINATION',
    content: [
      'LISTEN UP, CHAMPION. Every morning you wake up, your bed is a BATTLEFIELD. Those tangled sheets? That\'s ENTROPY trying to DEFEAT you before you\'ve even had your first protein shake.',
      'I make my bed at 3:47 AM. Not 3:45 - that\'s for QUITTERS who round down. Not 3:50 - that\'s for LAZY OPTIMISTS. 3:47 AM is the EXACT moment when your circadian rhythm is weakest and you need to PUNCH IT IN THE FACE with discipline.',
      'Here\'s the THUNDERCOACH METHOD for bed dominance:',
      '1. APPROACH the bed like it owes you money. Because in a way, it does - every moment of sleep you lose to bad energy is DEBT.',
      '2. GRIP those sheets like you\'re shaking hands with your FUTURE SELF. Your future self is JACKED and SUCCESSFUL and has PERFECT SHEETS.',
      '3. EXECUTE the hospital corner fold with EXTREME PREJUDICE. Military precision isn\'t optional - it\'s the MINIMUM ACCEPTABLE STANDARD.',
      '4. SLAM that pillow into position. Yes, SLAM. Gentle pillow placement is how MEDIOCRITY SPREADS.',
      'My ex-wives both complained about this. They said it was "intense" and "unnecessary at 3 AM." They couldn\'t handle the GRIND. The bed is STILL made. The marriages are NOT. COINCIDENCE? I THINK NOT.',
      'Your made bed is a DECLARATION OF WAR against chaos. When you walk out of that bedroom, you\'ve already WON your first battle. Now go CONQUER THE REST.',
    ],
  },
  {
    id: 'champion-breakfast-time',
    title: 'THE WEAK EAT BREAKFAST AT 8AM. CHAMPIONS EAT AT 4:15AM. HERE\'S WHY.',
    date: 'January 18, 2026',
    excerpt: 'While you\'re DREAMING, I\'m already on my THIRD egg white omelette. Your alarm clock is a PRISON. Mine is a WEAPON.',
    readTime: '12 min read',
    warriorsEngaged: 89234,
    intensityLevel: 5,
    category: 'NUTRITION WARFARE',
    content: [
      'Let me ask you something, WARRIOR. What time did you eat breakfast today? 7 AM? 8 AM? NOON?! If it was after 4:15 AM, you\'ve already LOST the day. Pack it up. Try again tomorrow.',
      'At 4:15 AM, your cortisol levels are doing something I call the THUNDERCOACH SPIKE. Scientists call it "being asleep." Scientists are SOFT.',
      'Here\'s what my morning DOMINATION FUEL looks like:',
      '- 12 egg whites (yolks are for people who NEGOTIATE with cholesterol)',
      '- 400g of chicken breast (COLD, because microwaves are for the WEAK)',
      '- One tablespoon of PURE DETERMINATION (I get mine from a guy named Steve)',
      '- A glass of water that I\'ve been SCREAMING at for 10 minutes to activate the molecules',
      'My course "ABSOLUTE DOMINATION BREAKFAST MASTERY" ($497) goes DEEP into the science of early morning protein synthesis. Spoiler alert: the science says WAKE UP EARLIER.',
      'But Chad, you ask, what if I\'m not hungry at 4 AM? WRONG QUESTION. Hunger is a FEELING. Breakfast is a COMMITMENT. You think my stomach was ready at 4:15 AM? NO. But I MADE IT READY. I DOMINATED my own digestive system.',
      'Champions don\'t wait for hunger. HUNGER WAITS FOR CHAMPIONS.',
    ],
  },
  {
    id: 'fired-my-therapist',
    title: 'I FIRED MY THERAPIST BECAUSE THERAPY IS FOR PEOPLE WHO DON\'T HAVE GOALS',
    date: 'January 12, 2026',
    excerpt: 'She said I had "unresolved anger." I said I had RESOLVED FOCUS. We disagreed. I\'m still WINNING.',
    readTime: '15 min read',
    warriorsEngaged: 156789,
    intensityLevel: 5,
    category: 'MENTAL FORTRESS',
    isPremiumContent: true,
    content: [
      'DISCLAIMER: I\'m not a mental health professional. But you know what I AM? A guy who wakes up at 3:47 AM EVERY DAY. You know who DOESN\'T do that? People in therapy.',
      'My therapist, Dr. Linda (SOFT NAME, SOFT PERSON), told me I had "difficulty processing emotions" and "concerning intensity issues." You know what I call those things? FUEL.',
      'She wanted me to "sit with my feelings." I said NO. I SPRINT with my feelings. My feelings can either KEEP UP or get LEFT BEHIND with the rest of the QUITTERS.',
      'Here\'s what therapy couldn\'t teach me that PURE DISCIPLINE did:',
      '- How to turn self-doubt into SELF-DOMINATION',
      '- How to convert anxiety into AGGRESSIVE FORWARD MOMENTUM',
      '- How to channel sadness into EXTRA REPS',
      'Dr. Linda said my two divorces indicated a "pattern." I said they indicated my ex-wives\' INABILITY TO MATCH MY ENERGY. Same thing? NO. ONE IS WEAK FRAMING.',
      'Now look, WARRIORS, some of you might actually benefit from professional help. If you\'re going through something serious, there\'s no shame in seeking support. But ALSO consider this: what if instead of talking about your problems, you just CRUSHED them with a 5 AM kettlebell session?',
      'I\'m KIDDING. Sort of. Talk to whoever you need to talk to. Then WAKE UP EARLIER.',
    ],
  },
  {
    id: 'grocery-battlefield',
    title: 'GROCERY SHOPPING: A BATTLEFIELD GUIDE TO TOTAL VEGETABLE SUPREMACY',
    date: 'January 8, 2026',
    excerpt: 'The produce aisle is a WARZONE. That old lady reaching for the last bunch of kale? She\'s your COMPETITION. DOMINATE OR BE DOMINATED.',
    readTime: '10 min read',
    warriorsEngaged: 34567,
    intensityLevel: 4,
    category: 'SUPPLY CHAIN DOMINATION',
    content: [
      'WARRIORS. I need to talk to you about something CRITICAL. Something that separates the CHAMPIONS from the CART-PUSHERS. I\'m talking about GROCERY SHOPPING.',
      'Most people wander into a supermarket like SHEEP. No plan. No strategy. No WARRIOR MINDSET. They end up in aisle 7 buying COOKIES like DEFEATED LOSERS.',
      'Here\'s the THUNDERCOACH TACTICAL SHOPPING PROTOCOL:',
      '1. RECON: Study the store layout BEFORE entry. Know your exits. Know where the organic section is. Knowledge is POWER.',
      '2. TIMING: I shop at 5:30 AM when the store opens. Why? BECAUSE THE WEAK ARE STILL SLEEPING. Zero cart traffic. Maximum efficiency.',
      '3. CART SELECTION: Always take the ALPHA cart. The one with all four wheels working. Squeaky carts are for people who ACCEPT MEDIOCRITY.',
      '4. PRODUCE SECTION DOMINANCE: This is where WARS are won. You see those vegetables? They\'re AMMUNITION for your body. Grab them with PURPOSE.',
      '5. CHECKOUT AGGRESSION: Self-checkout is for LONE WOLVES. Regular checkout is for people who want to ASSERT DOMINANCE by maintaining eye contact with the cashier.',
      'Last week, an elderly woman reached for the same bunch of kale as me. We locked eyes. She backed down. WHY? Because she saw the FIRE in my gaze. She knew I NEEDED that kale more.',
      'She called me "aggressive" and "concerning." I call it VICTORY.',
    ],
  },
  {
    id: 'shower-temperature-weakness',
    title: 'IF YOUR SHOWER ISN\'T COLD ENOUGH TO MAKE YOU CRY, YOU\'RE SHOWERING WRONG',
    date: 'January 3, 2026',
    excerpt: 'Warm water is the ENEMY. Your comfort zone ends where the COLD begins. EMBRACE THE SUFFERING.',
    readTime: '7 min read',
    warriorsEngaged: 78901,
    intensityLevel: 5,
    category: 'THERMAL WARFARE',
    content: [
      'CHAMPIONS. Let me ask you a question that will DEFINE your future. What temperature was your shower this morning?',
      'If you answered anything above ABSOLUTE ZERO, you\'ve got WORK to do.',
      'Warm showers are LIES your body tells you. "Oh, I deserve comfort." "Oh, I worked hard today." NO. You know what you deserve? GROWTH. And growth happens in the COLD.',
      'Here\'s the THUNDERCOACH CRYO PROTOCOL:',
      '- Step 1: Turn the knob ALL THE WAY to cold. Not "kind of cold." ARCTIC PUNISHMENT COLD.',
      '- Step 2: Enter the water SCREAMING. Yes, SCREAMING. This activates your WARRIOR LUNGS.',
      '- Step 3: Stay there for 5 minutes minimum. Your body will try to ESCAPE. DENY IT.',
      '- Step 4: Exit the shower as a DIFFERENT PERSON. A COLDER, HARDER, MORE DOMINANT PERSON.',
      'Studies show cold showers boost testosterone, increase alertness, and build mental toughness. Studies also show warm showers make you feel "comfortable" and "clean." COMFORT IS THE ENEMY.',
      'My first wife left me during my cold shower phase. She said I was "impossible to be around" and "shivering all the time." She was THREATENED by my discipline. The cold shower stays. The wife left. THE GRIND CONTINUES.',
    ],
  },
  {
    id: 'making-friends-domination',
    title: 'HOW TO MAKE FRIENDS: A HIGH-INTENSITY GUIDE TO SOCIAL SUPREMACY',
    date: 'December 28, 2025',
    excerpt: 'Friendship isn\'t about CONNECTION. It\'s about STRATEGIC ALLIANCE FORMATION. Here\'s how to DOMINATE the social battlefield.',
    readTime: '11 min read',
    warriorsEngaged: 23456,
    intensityLevel: 3,
    category: 'SOCIAL WARFARE',
    content: [
      'WARRIORS, I know what you\'re thinking. "Chad, you seem like you might not have many friends." WRONG. I have DOZENS of strategic allies who RESPECT and possibly FEAR my intensity.',
      'Making friends isn\'t about being "likable" or "pleasant to be around." Those are WEAK concepts. It\'s about demonstrating VALUE and DOMINANCE.',
      'The THUNDERCOACH FRIENDSHIP PROTOCOL:',
      '1. APPROACH with confidence. Walk up to your target friend like you own the room. Because you DO. Energetically.',
      '2. ESTABLISH DOMINANCE through firm handshake. 8.7 seconds minimum. Maintain eye contact. DO NOT BLINK.',
      '3. DEMONSTRATE VALUE by sharing your morning routine unprompted. If they\'re not impressed by your 3:47 AM wake-up, they\'re not friend material.',
      '4. PROPOSE a partnership. Not "want to hang out?" but "I\'m offering you an ALLIANCE with a HIGH-VALUE INDIVIDUAL."',
      'Now, some potential friends will be "uncomfortable" with this approach. They\'ll say things like "please stop" or "security!" These people are NOT READY for your energy. Move on.',
      'My friend group is small but ELITE. We do 5 AM workout sessions and SCREAM AFFIRMATIONS at each other. Is it "weird"? Only if you\'re WEAK. Is it "the reason my neighbors filed a noise complaint"? ALSO YES.',
      'Remember: it\'s not about quantity of friends. It\'s about quantity of INTENSITY per friend.',
    ],
  },
  {
    id: 'email-inbox-warfare',
    title: 'YOUR EMAIL INBOX IS A WARZONE: THUNDERCOACH\'S GUIDE TO ABSOLUTE DIGITAL SUPREMACY',
    date: 'December 22, 2025',
    excerpt: 'Every unread email is an ENEMY COMBATANT. Time to TAKE BACK YOUR DIGITAL TERRITORY with EXTREME PREJUDICE.',
    readTime: '9 min read',
    warriorsEngaged: 45678,
    intensityLevel: 4,
    category: 'DIGITAL WARFARE',
    content: [
      'How many unread emails do you have RIGHT NOW? 10? 100? 1,000?! Each one of those is a TINY TERRORIST holding your PRODUCTIVITY HOSTAGE.',
      'I achieve INBOX ZERO every single day. BY 4:30 AM. While YOU\'RE still SLEEPING, I\'ve already DESTROYED hundreds of emails with WARRIOR EFFICIENCY.',
      'The THUNDERCOACH EMAIL DOMINATION SYSTEM:',
      '1. TRIAGE: Emails are either CRITICAL (respond NOW), TACTICAL (respond within the hour), or WEAKNESS (DELETE).',
      '2. RESPONSE PROTOCOL: Every email response should assert DOMINANCE. Don\'t say "thanks for your email." Say "I\'VE RECEIVED YOUR COMMUNICATION AND PROCESSED IT WITH EXTREME EFFICIENCY."',
      '3. SUBJECT LINE SUPREMACY: Your subject lines should COMMAND attention. Not "Quick question" but "URGENT INQUIRY REQUIRING IMMEDIATE ACTION - THUNDERCOACH"',
      '4. SIGNATURE: Mine reads "CHAD THUNDERCOACH | PROFESSIONAL DOMINATOR | 3:47 AM CLUB | NOT ACCEPTING WEAKNESS"',
      'My coworkers at my old job (before I was "asked to transition to other opportunities") complained that my emails were "intense" and "felt like being yelled at in text form." That\'s called EFFECTIVE COMMUNICATION.',
      'Every email you send is a REPRESENTATION of your WARRIOR SPIRIT. Make each one COUNT. Make each one DOMINATE.',
      'And if you\'re sending emails after 5 AM, you\'re already BEHIND.',
    ],
  },
  {
    id: 'sleep-is-optional',
    title: 'SLEEP IS OPTIONAL: HOW I THRIVE ON 3.5 HOURS (DOCTORS HATE THIS)',
    date: 'December 15, 2025',
    excerpt: 'While you\'re DREAMING, I\'m ACHIEVING. Sleep is just UNCONSCIOUS QUITTING. Here\'s how to TRANSCEND the need for rest.',
    readTime: '14 min read',
    warriorsEngaged: 112233,
    intensityLevel: 5,
    category: 'ANTI-SLEEP PROTOCOL',
    isPremiumContent: true,
    content: [
      'WARRIORS, I need to address the BIGGEST LIE in human history. Bigger than "you need breakfast" (you need it at 4:15 AM). Bigger than "cold showers are uncomfortable" (EXACTLY THE POINT). I\'m talking about the SLEEP INDUSTRIAL COMPLEX.',
      'They say you need 7-8 hours of sleep. You know who else got 8 hours of sleep? PEOPLE WHO AREN\'T ME. And look where they are. ASLEEP RIGHT NOW, PROBABLY.',
      'I operate on 3.5 hours of POWER REST. Not sleep. POWER REST. It\'s different because I BELIEVE it\'s different.',
      'The THUNDERCOACH MINIMAL SLEEP PROTOCOL:',
      '- 11:47 PM: Begin POWER REST (not sleep, POWER REST)',
      '- 3:17 AM: Pre-wake meditation (still horizontal, but INTENSELY awake mentally)',
      '- 3:47 AM: VIOLENT awakening via my custom alarm that plays MOTIVATIONAL SCREAMING',
      'My doctor says I\'m "severely sleep deprived" and "concerning to observe." I told him my RESULTS speak for themselves. He asked "what results?" I said "THIS CONVERSATION" and left without paying.',
      'Now look, some of you WEAKER warriors might actually need sleep for "health reasons" and "basic cognitive function." Fine. SLEEP. But know that while you\'re unconscious, I\'m out here DOMINATING.',
      'I did have a period where I hallucinated a competitor named "Brad Whispermentor" who gave gentle, supportive advice. Turns out he was a SYMPTOM of sleep deprivation. I miss Brad sometimes. He was SOFT but he listened.',
      'Sleep is rest for the BODY. But CHAMPIONS rest when they\'re DEAD. Which, according to my doctor, might be sooner than average. THAT\'S COMMITMENT.',
    ],
  },
]

const PREMIUM_COURSES = [
  { name: 'ABSOLUTE DOMINATION BREAKFAST MASTERY', price: '$497' },
  { name: 'THE 3:47 AM AWAKENING SYSTEM', price: '$697' },
  { name: 'COLD SHOWER CRYO WARRIOR BOOTCAMP', price: '$299' },
  { name: 'EMAIL INBOX WARFARE INTENSIVE', price: '$397' },
  { name: 'SOCIAL SUPREMACY: FRIENDSHIP PROTOCOL', price: '$447' },
  { name: 'SLEEP IS FOR THE WEAK (AUDIO SERIES)', price: '$199' },
]

const ABOUT_TEXT = `I'm CHAD THUNDERCOACH, and I INVENTED productivity. (I didn't technically invent it, but I PERFECTED it through SHEER INTENSITY.)

After my second divorce (she couldn't handle the GRIND), I dedicated my life to one mission: HELPING WARRIORS LIKE YOU CRUSH EVERY ASPECT OF EXISTENCE.

My morning routine starts at 3:47 AM. Not 3:45 (for QUITTERS), not 3:50 (for LAZY OPTIMISTS). 3:47 AM is when CHAMPIONS ARE FORGED.

I've been featured in: my own YouTube channel, my Substack, and several noise complaint hearings.

Former professions: Insurance adjuster, CrossFit instructor (banned), motivational speaker (also banned), and currently: PROFESSIONAL DOMINATOR.

My competition - those SOFT life coaches who talk about "self-care" and "work-life balance" - they FEAR me. As they SHOULD.`

// ============================================================================
// Components
// ============================================================================

function IntensityMeter({ level }: { level: number }) {
  return (
    <span className="font-mono tracking-wide">
      {'🔥'.repeat(level)}
      <span className="opacity-30">{'🔥'.repeat(5 - level)}</span>
    </span>
  )
}

function MotivationCard({ post, onSelect }: { post: MotivationalPost; onSelect: () => void }) {
  return (
    <StyledCard
      variant="default"
      padding="md"
      borderRadius="md"
      shadow="md"
      onClick={onSelect}
      className="mb-4 cursor-pointer"
      bgColor="#1A1A1A"
      borderColor="#DC2626"
      textColor="#FFFFFF"
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs text-red-400 font-bold">{post.category}</span>
        {post.isPremiumContent && (
          <span className="text-xs bg-yellow-500 text-black px-2 py-0.5 rounded font-bold">
            PREMIUM
          </span>
        )}
      </div>
      <h2 className="text-lg font-black text-white mb-2 hover:text-red-400 uppercase leading-tight">
        {post.title}
      </h2>
      <p className="text-sm text-gray-300 mb-3">{post.excerpt}</p>
      <div className="flex justify-between items-center text-xs">
        <span className="text-gray-400">INTENSITY: <IntensityMeter level={post.intensityLevel} /></span>
        <span className="text-red-400 font-bold">{post.warriorsEngaged.toLocaleString()} WARRIORS ENGAGED</span>
      </div>
      <div className="flex justify-between items-center text-xs mt-2 text-gray-500">
        <span>{post.date}</span>
        <span>{post.readTime}</span>
      </div>
    </StyledCard>
  )
}

function FullPost({ post, onBack }: { post: MotivationalPost; onBack: () => void }) {
  return (
    <StyledCard
      variant="default"
      padding="lg"
      borderRadius="md"
      shadow="md"
      className="mb-4"
      bgColor="#1A1A1A"
      borderColor="#DC2626"
      textColor="#FFFFFF"
    >
      <Button
        variant="link"
        size="sm"
        textColor="#DC2626"
        onClick={onBack}
        className="mb-4 font-bold"
      >
        ← RETREAT TO MAIN FEED
      </Button>
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs text-red-400 font-bold">{post.category}</span>
        {post.isPremiumContent && (
          <span className="text-xs bg-yellow-500 text-black px-2 py-0.5 rounded font-bold">
            PREMIUM CONTENT
          </span>
        )}
      </div>
      <h1 className="text-2xl font-black text-white mb-4 uppercase leading-tight">{post.title}</h1>
      <div className="flex items-center gap-4 text-xs text-gray-400 mb-6">
        <span>INTENSITY: <IntensityMeter level={post.intensityLevel} /></span>
        <span>{post.date}</span>
        <span>{post.readTime}</span>
      </div>
      <div className="prose prose-invert max-w-none">
        {post.content.map((para, i) => (
          <p key={i} className="text-gray-200 mb-4 text-sm leading-relaxed">
            {para}
          </p>
        ))}
      </div>
      <div className="mt-6 pt-4 border-t border-red-900">
        <div className="flex items-center justify-between">
          <span className="text-red-400 font-bold text-sm">
            {post.warriorsEngaged.toLocaleString()} WARRIORS HAVE ENGAGED WITH THIS CONTENT
          </span>
        </div>
      </div>
      <StyledCard
        variant="default"
        padding="md"
        borderRadius="sm"
        shadow="none"
        className="mt-4"
        bgColor="#2A0A0A"
        borderColor="#DC2626"
        textColor="#FFFFFF"
      >
        <p className="font-black text-red-400 text-lg">NOW GO EXECUTE, CHAMPION.</p>
        <p className="text-gray-400 text-xs mt-1">
          Share this with someone who needs to hear it. They probably WON'T listen. That's THEIR loss.
        </p>
      </StyledCard>
    </StyledCard>
  )
}

// ============================================================================
// Main Site
// ============================================================================

/**
 * Adapter: maps SiteContentItem to local MotivationalPost interface.
 * Expects metadata to carry post-specific fields (intensityLevel, category, readTime, etc.)
 */
function dbToMotivationalPost(item: SiteContentItem): MotivationalPost {
  // Body may be stored as a single string with paragraph breaks, or as JSON array
  let contentParagraphs: string[] = []
  if (item.metadata?.content && Array.isArray(item.metadata.content)) {
    contentParagraphs = item.metadata.content
  } else if (item.body) {
    contentParagraphs = item.body.split('\n\n').filter(Boolean)
  }

  return {
    id: item.slug,
    title: item.title,
    date: item.metadata?.date ?? (item.publishedAt ? new Date(item.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Unknown'),
    excerpt: item.summary ?? '',
    content: contentParagraphs,
    intensityLevel: item.metadata?.intensityLevel ?? 3,
    category: item.category ?? item.metadata?.category ?? 'UNCATEGORIZED',
    readTime: item.metadata?.readTime ?? '? min read',
    warriorsEngaged: item.viewCount ?? item.metadata?.warriorsEngaged ?? 0,
    isPremiumContent: item.metadata?.isPremiumContent ?? false,
  }
}

export function DominateSite({ siteId }: SiteProps) {
  // Fetch DB content, falling back to hardcoded posts
  const { content: dbContent } = useSiteContent('dominate')

  const posts = useMemo(() => {
    if (dbContent.length > 0) return dbContent.map(dbToMotivationalPost)
    return MOTIVATIONAL_POSTS
  }, [dbContent])

  const [selectedPost, setSelectedPost] = useState<MotivationalPost | null>(null)
  const [showAbout, setShowAbout] = useState(false)

  return (
    <div className="min-h-full" style={{ background: '#0A0A0A' }}>
      {/* Header */}
      <header className="py-6 px-4" style={{ background: 'linear-gradient(135deg, #DC2626 0%, #7F0000 100%)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-5xl">💪</span>
            <div>
              <h1 className="text-3xl font-black text-white tracking-wider">
                {site?.name || 'DOMINATE'}
              </h1>
              <p className="text-red-200 text-sm font-bold uppercase tracking-wide">
                CRUSH YOUR GOALS OR THEY CRUSH YOU
              </p>
            </div>
          </div>
          <nav className="flex gap-4 mt-4 text-sm">
            <button
              onClick={() => { setSelectedPost(null); setShowAbout(false); }}
              className="text-red-200 hover:text-white font-bold uppercase"
            >
              BATTLE STATION
            </button>
            <button
              onClick={() => { setSelectedPost(null); setShowAbout(true); }}
              className="text-red-200 hover:text-white font-bold uppercase"
            >
              ABOUT CHAD
            </button>
            <button className="text-red-200 hover:text-white font-bold uppercase">
              COURSES
            </button>
            <button className="text-red-200 hover:text-white font-bold uppercase">
              WARRIOR COMMUNITY
            </button>
          </nav>
        </div>
      </header>

      {/* Motivational Banner */}
      {!selectedPost && !showAbout && (
        <div className="bg-black border-y-4 border-red-600 py-3 px-4">
          <p className="text-center text-white font-black text-sm uppercase tracking-widest animate-pulse">
            YOU ARE EITHER GETTING STRONGER OR YOU ARE DYING. THERE IS NO MIDDLE GROUND. - CHAD THUNDERCOACH
          </p>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Posts Column */}
          <div className="flex-1">
            {showAbout ? (
              <StyledCard
                variant="default"
                padding="lg"
                borderRadius="md"
                shadow="md"
                bgColor="#1A1A1A"
                borderColor="#DC2626"
                textColor="#FFFFFF"
              >
                <h2 className="text-2xl font-black text-white mb-4 uppercase">ABOUT CHAD THUNDERCOACH</h2>
                <div className="flex gap-4 mb-4">
                  <div className="text-6xl">💪</div>
                  <div>
                    <p className="font-black text-red-400 text-xl">CHAD THUNDERCOACH</p>
                    <p className="text-sm text-gray-400">PROFESSIONAL DOMINATOR</p>
                    <p className="text-xs text-gray-500">Inventor of Productivity (self-proclaimed)</p>
                  </div>
                </div>
                <div className="text-sm text-gray-300 whitespace-pre-line mb-6">
                  {ABOUT_TEXT}
                </div>
                <StyledCard
                  variant="default"
                  padding="md"
                  borderRadius="sm"
                  shadow="none"
                  className="mt-4"
                  bgColor="#2A0A0A"
                  borderColor="#DC2626"
                  textColor="#FFFFFF"
                >
                  <p className="font-black text-red-400 mb-2">STATS THAT MATTER:</p>
                  <ul className="text-gray-300 text-xs space-y-1">
                    <li>- Wake-up time: 3:47 AM (EVERY. SINGLE. DAY.)</li>
                    <li>- Divorces: 2 (THEY couldn't handle the GRIND)</li>
                    <li>- Hours of sleep: 3.5 (POWER REST, not sleep)</li>
                    <li>- Shower temperature: ARCTIC</li>
                    <li>- Courses sold: 47,000+</li>
                    <li>- Noise complaints: 23 (and COUNTING)</li>
                    <li>- Regrets: ZERO (regret is for the WEAK)</li>
                  </ul>
                </StyledCard>
              </StyledCard>
            ) : selectedPost ? (
              <FullPost post={selectedPost} onBack={() => setSelectedPost(null)} />
            ) : (
              <>
                <StyledCard
                  variant="default"
                  padding="md"
                  borderRadius="md"
                  shadow="none"
                  className="mb-4"
                  bgColor="#2A0A0A"
                  borderColor="#DC2626"
                  textColor="#FFFFFF"
                >
                  <p className="text-red-400 text-sm font-bold uppercase">
                    NEW: The complete THUNDERCOACH ANTI-SLEEP PROTOCOL is now available. Stop WASTING 8 hours a day on UNCONSCIOUS QUITTING.
                  </p>
                </StyledCard>
                {posts.map(post => (
                  <MotivationCard
                    key={post.id}
                    post={post}
                    onSelect={() => setSelectedPost(post)}
                  />
                ))}
              </>
            )}
          </div>

          {/* Sidebar */}
          <aside className="w-64 hidden md:block">
            {/* Join the Warriors */}
            <StyledCard
              variant="default"
              padding="md"
              borderRadius="md"
              shadow="md"
              className="mb-4"
              bgColor="#1A1A1A"
              borderColor="#DC2626"
              textColor="#FFFFFF"
            >
              <h3 className="font-black text-red-400 mb-2 uppercase">JOIN THE WARRIORS</h3>
              <p className="text-xs text-gray-400 mb-2">
                Daily DOMINATION emails at 4:00 AM. If you're not awake to read them, you're already LOSING.
              </p>
              <input
                type="email"
                placeholder="your@email.com"
                className="w-full px-2 py-1 text-sm border rounded mb-2 bg-black border-red-600 text-white placeholder-gray-500"
              />
              <Button
                variant="primary"
                size="sm"
                width="full"
                backgroundColor="#DC2626"
                textColor="#ffffff"
              >
                ENLIST NOW
              </Button>
              <p className="text-xs text-gray-500 mt-2 text-center">
                {Math.floor(Math.random() * 50000 + 200000).toLocaleString()} WARRIORS ALREADY ENLISTED
              </p>
            </StyledCard>

            {/* Premium Courses */}
            <StyledCard
              variant="default"
              padding="md"
              borderRadius="md"
              shadow="md"
              className="mb-4"
              bgColor="#1A1A1A"
              borderColor="#DC2626"
              textColor="#FFFFFF"
            >
              <h3 className="font-black text-red-400 mb-2 uppercase">PREMIUM COURSES</h3>
              <div className="space-y-2">
                {PREMIUM_COURSES.map((course, i) => (
                  <div key={i} className="text-xs border-b border-gray-800 pb-2 last:border-0">
                    <p className="text-white font-bold">{course.name}</p>
                    <p className="text-red-400 font-black">{course.price}</p>
                  </div>
                ))}
              </div>
            </StyledCard>

            {/* Daily Affirmation */}
            <StyledCard
              variant="default"
              padding="md"
              borderRadius="md"
              shadow="md"
              className="mb-4"
              bgColor="#2A0A0A"
              borderColor="#DC2626"
              textColor="#FFFFFF"
            >
              <h3 className="font-black text-yellow-400 mb-2 uppercase">TODAY'S AFFIRMATION</h3>
              <p className="text-white text-sm font-bold italic">
                "I AM STRONGER THAN MY EXCUSES. MY EXCUSES ARE WEAK. LIKE MY COMPETITION. LIKE EVERYONE WHO ISN'T ME."
              </p>
              <p className="text-xs text-gray-500 mt-2">
                - SCREAM this at your mirror at 3:47 AM
              </p>
            </StyledCard>

            {/* Warning */}
            <StyledCard
              variant="default"
              padding="md"
              borderRadius="md"
              shadow="md"
              bgColor="#1A0505"
              borderColor="#7F0000"
              textColor="#FFFFFF"
            >
              <h3 className="font-black text-red-500 mb-2 uppercase">SOFT PEOPLE WARNING</h3>
              <p className="text-xs text-red-300">
                This website contains EXTREME INTENSITY. If you're not ready to DOMINATE, please close this tab and return to your COMFORTABLE MEDIOCRITY.
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Side effects may include: excessive motivation, alienating friends and family, being "too intense" at parties.
              </p>
            </StyledCard>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 px-4 text-center text-xs" style={{ background: '#0A0A0A' }}>
        <p className="text-gray-400">
          © 2025 {site?.name || 'DOMINATE'} | CHAD THUNDERCOACH ENTERPRISES LLC
        </p>
        <p className="text-gray-600 mt-1">
          Legal: This is not medical, financial, or relationship advice. Results not typical. Chad's ex-wives have not endorsed this content.
        </p>
        <p className="text-red-600 font-bold mt-2 uppercase">
          NOW STOP READING AND GO EXECUTE, WARRIOR.
        </p>
      </footer>
    </div>
  )
}

export default DominateSite
