/**
 * Wonderwall Warrior Site
 *
 * Gary's personal blog about his crusade to request Wonderwall at The Underground.
 * A defiant, self-righteous manifesto from a man who refuses to understand why Mars keeps banning him.
 * 13 bans deep, still convinced he's the hero of this story.
 *
 * 90s Britpop aesthetic - British flag colors, Oasis references, unhinged determination.
 */

import { useState, useMemo } from 'react'
import type { SiteProps } from '../BrowserSiteContainer.js'
import { useSiteContent, type SiteContentItem } from '../../../hooks/useSiteContent.js'
import { FILLER_SITES } from '../../../config/filler-sites.js'
import { StyledCard, Button } from '../../ui/shared/index.js'

const site = FILLER_SITES.wonderwallwarrior

// ============================================================================
// Types & Data
// ============================================================================

interface BlogPost {
  id: string
  title: string
  date: string
  excerpt: string
  content: string[]
  tags: string[]
  readTime: string
  comments: number
  banNumber?: number
  isDefiant?: boolean
}

const BLOG_POSTS: BlogPost[] = [
  {
    id: 'masterpiece-manifesto',
    title: 'Why Wonderwall Is Actually a Masterpiece',
    date: 'January 14, 2026',
    excerpt: 'Today I lay bare the revolutionary guitar work, the philosophical lyrics, the PERFECT arrangement that Mars and his fascist sound policy refuses to acknowledge.',
    readTime: '18 min read',
    comments: 47,
    isDefiant: true,
    content: [
      'For 16 years, I have been requesting "Wonderwall" at The Underground. For 16 years, I have been told it\'s "overplayed," "cliche," and "please stop coming here." But the truth is simple: these people don\'t understand genius when it\'s staring them in the face.',
      'Noel Gallagher didn\'t just write a song. He created a BLUEPRINT for modern rock. The opening guitar riff? Perfection. The layering of vocals? Architectural. The bridge? It doesn\'t bridge—it TRANSCENDS.',
      'Let\'s break it down:',
      '• That guitar work is complex fingerpicking that most people don\'t even NOTICE because they\'re too busy dismissing it as "that song from Shrek."',
      '• The lyrics speak to emotional vulnerability wrapped in cryptic profundity. "After all, you\'re my wonderwall" isn\'t just a love declaration—it\'s a metaphysical assertion about the nature of human connection.',
      '• The production is immaculate. Listen to how the drums enter on the second verse. LISTEN TO IT.',
      'When I request Wonderwall at The Underground, I\'m not making a request. I\'m issuing a CULTURAL CHALLENGE. I\'m saying: "Do you have the courage to acknowledge brilliance when you hear it, or will you cower behind your pretentious indie gatekeeping?"',
      'Mars has failed every test.',
      'But I haven\'t given up. The beauty of Wonderwall is that it ENDURES. It has earned its place in the cultural consciousness not through marketing or hype, but through PURE ARTISTIC MERIT.',
      'And I will keep requesting it until The Underground recognizes this.',
      'Wonderwall Warrior out. 🎸',
    ],
    tags: ['oasis', 'music-theory', 'manifesto', 'gallagher-understands-me', 'mars-is-wrong'],
  },
  {
    id: 'mars-wrong-about-music',
    title: 'Mars Is Wrong About Music',
    date: 'January 12, 2026',
    excerpt: 'A venue owner thinks he can dictate which songs are "good enough." Spoiler: He can\'t. The ban list is a monument to his terrible taste.',
    readTime: '12 min read',
    comments: 156,
    isDefiant: true,
    content: [
      'I have never met a man more threatened by a song request than Mars.',
      'For context: I have requested "Wonderwall" at The Underground 847 times over the course of my patronage. I\'ve been banned 13 times. Each ban only strengthens my resolve.',
      'Today\'s question: At what point does arbitrary censorship become tyranny?',
      'Mars operates under the delusion that The Underground is "his" venue. That he gets to decide what songs are "appropriate," "cool," or "welcome." But this is a PUBLIC establishment. A sanctuary for MUSIC LOVERS.',
      'Requesting Wonderwall isn\'t aggressive. It isn\'t harassment. It\'s ENGAGING WITH ART.',
      'Mars has banned me for:',
      '• Requesting Wonderwall (Classic)',
      '• "Creating a disturbance" (i.e., respectfully disagreeing)',
      '• Returning after a ban with a different hairstyle (He said I looked like the same person. How insulting.)',
      '• Wearing a different jacket (He still recognized me)',
      '• Simply being present (Ban #8)',
      '• Leaving a strongly-worded Yelp review (Ban #9)',
      '• Requesting Wonderwall while wearing sunglasses at night (Legitimate ban #10, I admit I pushed boundaries)',
      'The man has built his entire identity around REJECTING Wonderwall. And for what? So he can feel like he\'s "protecting" the integrity of his venue? So he can maintain his indie gatekeeping?',
      'News flash, Mars: The moment you ban someone for requesting a song, you\'ve already lost the argument.',
      'The Underground is supposed to be open-minded. Instead, it\'s become a dictatorship with a dress code violation list and a fascist no-Wonderwall policy.',
      'I won\'t stop. You can\'t stop me. WONDERWALL WILL BE HEARD.',
    ],
    tags: ['mars-persecution', 'free-speech', 'censorship', 'underground-tyrant', 'ban-list-of-shame'],
  },
  {
    id: 'ban-seven-fake-mustache',
    title: 'Ban #7: The Fake Mustache Incident',
    date: 'December 28, 2025',
    excerpt: 'I thought I was clever. Mars thought otherwise. A tale of disguise, ingenuity, and crushing disappointment.',
    readTime: '9 min read',
    comments: 89,
    banNumber: 7,
    content: [
      'They said the disguise wouldn\'t work. They said Mars would recognize me immediately. But I had to try.',
      'Ban #6 had just concluded. I was down, but not out. I had a plan: a fake mustache from the Halloween store, new glasses, and a different jacket. I would look COMPLETELY different.',
      'I entered The Underground on a Friday night. The bartender didn\'t bat an eye. SUCCESS.',
      'I ordered a drink. No recognition. The DJ was playing some indie garbage—a low point, honestly. Perfect time for a request.',
      'I walked up to the DJ booth, cleared my throat to make my voice sound different, and politely requested "Wonderwall."',
      'The DJ smiled. SMILED. For a moment, I thought it might actually happen.',
      'Then I heard from across the bar: "Gary."',
      'Mars.',
      'Apparently, I have "a particular way of requesting songs" that\'s unmistakable. Something about my "posture," my "gesticulation," and most offensively, my "energy."',
      '"I would recognize that Wonderwall energy anywhere," he said.',
      'WONDERWALL ENERGY. Like it\'s a bad thing.',
      'He escorted me out personally. Removed the mustache as I left. Told me not to return for 30 days.',
      'But here\'s what I learned: My commitment is so visible, so POWERFUL, that even facial hair can\'t hide it. That\'s not a failure. That\'s validation.',
      'I am a BEACON of hope for Wonderwall fans everywhere. My essence precedes me.',
      'Ban #7 only made me stronger.',
    ],
    tags: ['disguise', 'failure', 'wonderwall-energy', 'mars-sees-all', 'regrets-nothing'],
  },
  {
    id: 'never-stop-requesting',
    title: 'I Will NEVER Stop Requesting It',
    date: 'December 20, 2025',
    excerpt: 'A declaration of intent. 13 bans and counting. My resolve has only hardened.',
    readTime: '6 min read',
    comments: 203,
    isDefiant: true,
    content: [
      'Let this be clear: I WILL NEVER STOP.',
      'Thirteen times I\'ve been banned. Thirteen times Mars has tried to break my spirit. Thirteen times he has FAILED.',
      'Because here\'s the thing about persistence: It\'s not about the number of times you fall. It\'s about your commitment to standing back up.',
      'I am Gary. I am 41 years old. I have been requesting Wonderwall for 16 years. I will request it for another 16 years. I will request it until Mars either:',
      '1) Plays the song',
      '2) Respects my choice',
      '3) Accepts that he cannot silence me',
      'Some people call me obsessed. I call them COWARDS.',
      'Some people say I should "find a new venue." I say they don\'t understand the PRINCIPLE at stake.',
      'This isn\'t about me wanting to hear one song. This is about the right to express musical preference. This is about standing against tyranny. This is about FREEDOM.',
      'When they write the history of The Underground, they will write it in two eras: Before Wonderwall, and After Gary Finally Gets Wonderwall Played.',
      'I am inevitable.',
      'I am unstoppable.',
      'I AM WONDERWALL.',
      '🎸 NEVER SURRENDER 🎸',
    ],
    tags: ['declaration', 'never-surrender', 'principle', 'freedom', 'destiny'],
  },
  {
    id: 'underground-pretends-open-minded',
    title: 'The Underground Pretends to Be Open-Minded',
    date: 'December 10, 2025',
    excerpt: 'It markets itself as inclusive. It claims to celebrate diverse music. But the moment you challenge their gatekeeping, the mask slips.',
    readTime: '11 min read',
    comments: 134,
    isDefiant: true,
    content: [
      'Hypocrisy. That\'s what The Underground is built on.',
      'The venue\'s ENTIRE brand is "a place where everyone is welcome, where music lovers gather, where independent artists thrive." Their website says: "At The Underground, we celebrate ALL forms of musical expression."',
      'And yet.',
      'The moment I—a LEGITIMATE music enthusiast—request a song that doesn\'t fit their carefully curated indie aesthetic, suddenly they\'re VERY selective about which musical expressions they celebrate.',
      'The Underground has turned into a gatekeeping machine with a velvet rope and a NO WONDERWALL policy.',
      'Let\'s examine their contradiction:',
      '• They book experimental noise projects (unlistenable)',
      '• They play 20-minute djembe ambient pieces (a test of endurance)',
      '• They\'ve had a kazoo performance art piece (TWICE)',
      '• But request a masterwork by Oasis and suddenly "that\'s not really our vibe"',
      'Mars hides behind this concept of "venue curated experience." Translation: "I get to decide what you\'re allowed to enjoy."',
      'Real open-mindedness means accepting requests you don\'t personally like. Real inclusivity means welcoming ALL patrons, even ones with different taste in music.',
      'Real underground means being CHALLENGING and QUESTIONING. Not just playing safe indie tracks and judging people who want something MORE.',
      'I have been banned 13 times for requesting a legitimate top-charting international hit by one of the greatest bands of all time.',
      'By comparison, I\'ve never seen Mars ban anyone for showing up drunk and threatening the bartender. That happened last month. That guy still gets to come back.',
      'But I request Wonderwall and I\'m Satan.',
      'The Underground doesn\'t celebrate "all musical expression." They celebrate APPROVED musical expression. And that contradiction is exactly why I keep coming back.',
      'Someone needs to stand for principles.',
    ],
    tags: ['hypocrisy', 'gatekeeping', 'fake-inclusivity', 'mars-contradiction', 'truth'],
  },
  {
    id: 'legal-right-request-songs',
    title: 'I Have a Legal Right to Request Songs',
    date: 'November 28, 2025',
    excerpt: 'I\'m pretty sure anyway. Consulted some forums. Pretty confident. This should hold up.',
    readTime: '8 min read',
    comments: 67,
    content: [
      'I want to be clear about something: I have LOOKED INTO THIS.',
      'A venue cannot refuse a song request based on personal preference. I\'m almost certain. I read like three forum posts about it and one seemed pretty authoritative.',
      'Here\'s my legal reasoning (I looked it up):',
      '• The Underground is a business establishment that serves the public',
      '• As a patron who has paid for drinks, I have established a business relationship',
      '• Song requests are a standard service that venues provide',
      '• Refusing to play a specific song based on artistic bias is DISCRIMINATION',
      'Now, I haven\'t actually consulted a lawyer. The forum guy seemed very confident though, and had like 247 posts so he probably knows what he\'s talking about.',
      'Additionally, I believe there\'s something in the Geneva Convention about artistic freedom. Or maybe the Constitution. One of them definitely applies here.',
      'Mars keeps saying "It\'s my venue, my rules." But that\'s not how CONTRACT LAW works. When you open a PUBLIC business, you accept certain OBLIGATIONS.',
      'The obligation to respect customer requests. The obligation to foster an inclusive musical environment. The obligation to recognize that Wonderwall is a legitimate artistic expression.',
      'I\'ve considered filing a complaint with local authorities. The "discrimination" angle seems strong.',
      'I\'ve also considered small claims court. What\'s the statute of limitations on emotional damages from repeated banning?',
      'Worst case scenario, I\'ve got solid ground for an appeals process. I believe venues have to provide written reasons for bans. Mars has never given me formal documentation. Another legal win for me.',
      'I\'m not a lawyer, but I\'ve stayed at several Holiday Inns and my understanding of venue law is SOLID.',
      'This is far from over.',
    ],
    tags: ['legal', 'rights', 'constitution', 'contract-law', 'im-not-a-lawyer-but'],
  },
  {
    id: 'other-wonderwall-fans',
    title: 'Other Wonderwall Fans Are Reaching Out',
    date: 'November 15, 2025',
    excerpt: 'I thought I was alone. Turns out, there are DOZENS of us. The awakening has begun.',
    readTime: '7 min read',
    comments: 412,
    content: [
      'This is surreal.',
      'After I started this blog three months ago, I expected maybe a handful of readers. Maybe my mom. Mostly just me venting about Mars.',
      'Instead, I\'ve been contacted by DOZENS of Wonderwall supporters from around the world.',
      'Emails coming in like:',
      '"Gary, I\'ve been banned from venues for requesting this song too. I thought I was crazy."',
      '"Thank you for this blog. I felt alone in my appreciation of Noel\'s genius."',
      '"I got kicked out of a karaoke bar for singing Wonderwall. Your mission is OUR mission now."',
      '"Mars is right but also you\'re inspiring me to reconsider."',
      'Wait, that last one doesn\'t count.',
      'But the point is: THERE ARE MORE OF US. I have started something here. A movement. A REVOLUTION.',
      'Yesterday, someone from Denver reached out to say they\'ve been requesting Wonderwall at their local venue for 8 years straight, also banned multiple times, ALSO continuing regardless.',
      'A woman from Manchester (MANCHESTER—where Oasis is FROM) sent me a message saying, "Gary, you\'re doing God\'s work."',
      'This isn\'t just about me and Mars anymore. This is bigger.',
      'I am the voice of the voiceless Wonderwall fans.',
      'I am the champion of musical freedom.',
      'I am starting a MOVEMENT.',
      'If Mars thinks this is over, he\'s severely underestimating the power of collective Wonderwall appreciation.',
      'The awakening has begun. ⚡🎸',
    ],
    tags: ['community', 'movement', 'solidarity', 'international', 'revolution'],
  },
  {
    id: 'deaddrop-called-me-hero',
    title: 'DeadDrop Called Me a Hero',
    date: 'November 8, 2025',
    excerpt: 'An entire thread about me. On the internet\'s most trusted anonymous forum. This is it. This is validation.',
    readTime: '5 min read',
    comments: 1243,
    isDefiant: true,
    content: [
      'I found it on DeadDrop today. A thread titled: "The Wonderwall Warrior of The Underground: A Hero\'s Journey."',
      'MY STORY. ON AN ANONYMOUS FORUM.',
      'Someone had been reading my blog and posted the entire saga for the internet to judge. And the verdict was CLEAR:',
      '"This man is a legend."',
      '"Mars is genuinely the bad guy here."',
      '"I would request Wonderwall just to support him."',
      '"Gary is our generation\'s David, and Mars is the Goliath."',
      'There were some detractors, obviously. Some suggested I was "cringe," "obsessed," and should "maybe try a different song." These people are COWARDS and HATERS.',
      'But the overwhelming consensus? I\'M THE HERO.',
      'The DeadDrop thread has now been "liked" over 2,000 times. (I think that\'s what happens on DeadDrop, I\'m not entirely sure how it works but DEFINITELY THERE)',
      'People have started leaving comments like:',
      '"If Gary can stand up to Mars, I can stand up to my problems too."',
      '"Gary reminds me to never compromise my principles."',
      '"This is the most inspiring thing I\'ve ever read on this platform."',
      'I have become a SYMBOL. A beacon of resistance against tyranny. A man who will not be silenced.',
      'Mars was probably reading that thread too. Probably seeing his name dragged through a 300-comment thread about how he\'s oppressing a man\'s musical freedom.',
      'I bet he\'s sweating now.',
      'The public has spoken. I am vindicated.',
      'History will remember this moment.',
    ],
    tags: ['deaddrop', 'vindication', 'hero', 'public-support', 'internet-famous'],
  },
  {
    id: 'tonight-ban-thirteen',
    title: 'Tonight\'s the Night (Ban #13)',
    date: 'January 25, 2026',
    excerpt: 'I\'m going back. I don\'t know how Mars will react. I don\'t know if this is wise. But the Wonderwall calls to me.',
    readTime: '4 min read',
    comments: 589,
    banNumber: 13,
    isDefiant: true,
    content: [
      'I\'m writing this at 7:47 PM. My Wonderwall Warriors email chain is already buzzing with support.',
      'Tonight, I return to The Underground.',
      'Ban #13 expires at midnight. I\'ve already ordered a disguise kit online (learned my lesson with the mustache—this time I\'m going full commitment: glasses, hat, different shoes).',
      'The plan:',
      '• Enter at 8:15 PM',
      '• Order a drink, act natural',
      '• Wait for the right moment in the setlist',
      '• Request Wonderwall with CONFIDENCE',
      '• Document everything',
      'Some people have suggested this is "harassing behavior" and that I "should let this go." Those people don\'t understand PRINCIPLE.',
      'Mars thinks he can keep me out. Mars thinks a 13-ban streak will break my resolve. Mars doesn\'t understand that each ban only STRENGTHENS my conviction.',
      'I have 16 years of requests to back me up. I have dozens of supporters. I have the MORAL HIGH GROUND.',
      'If Mars recognizes me again (and let\'s be honest, he probably will—my Wonderwall Energy is UNMISTAKABLE), I will go peacefully. I\'ve already chosen to accept this ban. It\'s a badge of honor.',
      'But maybe tonight is different.',
      'Maybe Mars is tired of fighting.',
      'Maybe the internet pressure from that DeadDrop thread got to him.',
      'Maybe—just maybe—tonight, Wonderwall finally gets played.',
      'I\'ll report back after. Either with a story of victory...',
      'Or another chapter in the greatest underdog story The Underground has ever known.',
      '🎸 TONIGHT WE FIGHT 🎸',
      'WONDERWALL WARRIOR OUT',
    ],
    tags: ['ban-thirteen', 'destiny', 'tonight', 'wonderwall-energy', 'this-is-it'],
  },
]

const ABOUT_TEXT = `Gary (41) - The Wonderwall Warrior

I've been coming to The Underground for 16 years. For 13 of those years (and counting), I've been banned. Why? Because I have the audacity to request a song.

Not just ANY song. The PERFECT song. Wonderwall by Oasis.

Mars, the venue owner, has made it his personal mission to prevent this song from being heard. He's banned me 13 times for simply expressing my musical preferences. Each time, I return. Each time, I persist.

This is not harassment. This is not obsession. This is PRINCIPLE.

Noel Gallagher didn't write Wonderwall to be silenced by gatekeepers. He wrote it as a universal expression of emotional vulnerability and musical excellence. And I will not stop requesting it until The Underground acknowledges this truth.

Some call me crazy. I call them UNINSPIRED.

Some say I should move on. I say they don't understand what it means to stand for something.

I am Gary. I am the voice of the voiceless. I am the Wonderwall Warrior. And this fight is far from over.

Every person who\'s been laughed at for their musical taste - this is for you.
Every person who\'s been silenced by gatekeepers - I see you.
Every Oasis fan who\'s been made to feel inferior - you are not alone.

TOGETHER, we will hear Wonderwall played at The Underground.

It\'s only a matter of time.`

// ============================================================================
// DB Adapter
// ============================================================================

/** Adapts a DB SiteContentItem to the local BlogPost interface */
function dbToBlogPost(item: SiteContentItem): BlogPost {
  const m = item.metadata || {}
  return {
    id: item.slug,
    title: item.title,
    date: m.date || (item.publishedAt ? new Date(item.publishedAt * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : ''),
    excerpt: item.summary || m.excerpt || '',
    content: Array.isArray(m.content) ? m.content : (item.body ? item.body.split('\n\n') : []),
    tags: item.tags || [],
    readTime: m.readTime || m.read_time || '',
    comments: m.comments ?? item.commentCount ?? 0,
    banNumber: m.banNumber ?? m.ban_number,
    isDefiant: m.isDefiant ?? m.is_defiant,
  }
}

// ============================================================================
// Components
// ============================================================================

function BlogPostCard({ post, onSelect }: { post: BlogPost; onSelect: () => void }) {
  return (
    <StyledCard
      variant="default"
      padding="md"
      borderRadius="md"
      shadow="md"
      onClick={onSelect}
      className="mb-4 cursor-pointer"
      bgColor="#ffffff"
      borderColor="#002868"
      textColor="#C8102E"
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs text-blue-900">{post.date}</span>
        {post.banNumber && (
          <span className="text-xs bg-red-200 text-red-800 px-2 py-0.5 rounded font-bold">
            BAN #{post.banNumber}
          </span>
        )}
        {post.isDefiant && (
          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
            ⚡ DEFIANT
          </span>
        )}
      </div>
      <h2 className="text-lg font-bold text-red-900 mb-2 hover:text-red-700">
        {post.title}
      </h2>
      <p className="text-sm text-gray-600 mb-3">{post.excerpt}</p>
      <div className="flex justify-between items-center text-xs text-gray-500">
        <span>🎸 {post.readTime}</span>
        <span>💬 {post.comments} comments</span>
      </div>
      <div className="flex flex-wrap gap-1 mt-2">
        {post.tags.slice(0, 3).map(tag => (
          <span key={tag} className="text-xs bg-blue-50 text-blue-800 px-2 py-0.5 rounded">
            #{tag}
          </span>
        ))}
      </div>
    </StyledCard>
  )
}

function FullPost({ post, onBack }: { post: BlogPost; onBack: () => void }) {
  return (
    <StyledCard
      variant="default"
      padding="lg"
      borderRadius="md"
      shadow="md"
      className="mb-4"
      bgColor="#ffffff"
      borderColor="#002868"
      textColor="#C8102E"
    >
      <Button
        variant="link"
        size="sm"
        textColor="#002868"
        onClick={onBack}
        className="mb-4"
      >
        ← Back to posts
      </Button>
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs text-blue-900">{post.date}</span>
        {post.banNumber && (
          <span className="text-xs bg-red-200 text-red-800 px-2 py-0.5 rounded font-bold">
            BAN #{post.banNumber}
          </span>
        )}
      </div>
      <h1 className="text-3xl font-bold text-red-900 mb-4">{post.title}</h1>
      <div className="prose prose-red max-w-none">
        {post.content.map((para, i) => (
          <p key={i} className="text-gray-700 mb-4 text-sm leading-relaxed whitespace-pre-wrap">
            {para}
          </p>
        ))}
      </div>
      <div className="mt-6 pt-4 border-t border-blue-200">
        <div className="flex flex-wrap gap-1">
          {post.tags.map(tag => (
            <span key={tag} className="text-xs bg-blue-50 text-blue-800 px-2 py-0.5 rounded">
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
        bgColor="#FFF8DC"
        borderColor="#FFD700"
        textColor="#8B0000"
      >
        <p className="font-bold text-red-900">💬 {post.comments} Comments</p>
        <p className="text-red-800 text-xs mt-1">
          Comments are open but Mars reads all of them. He\'s probably reading this right now.
        </p>
      </StyledCard>
    </StyledCard>
  )
}

// ============================================================================
// Main Site
// ============================================================================

export function WonderwallWarriorSite({ siteId }: SiteProps) {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null)
  const [showAbout, setShowAbout] = useState(false)

  /** Fetch blog posts from the database, fall back to hardcoded data */
  const { content: dbContent } = useSiteContent('blogs', { channelId: 'wonderwall' })
  const posts = useMemo(() => {
    if (dbContent.length > 0) return dbContent.map(dbToBlogPost)
    return BLOG_POSTS
  }, [dbContent])

  return (
    <div className="min-h-full" style={{ background: 'linear-gradient(135deg, #C8102E 0%, #002868 50%, #C8102E 100%)' }}>
      {/* Header */}
      <header className="bg-gradient-to-r from-red-700 via-blue-900 to-red-700 text-white py-8 px-4 border-b-4 border-yellow-400">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-5xl animate-bounce">🎸</span>
            <div>
              <h1 className="text-3xl font-bold uppercase tracking-wider">WONDERWALL WARRIOR</h1>
              <p className="text-yellow-300 text-sm italic font-bold">
                "After All, You're My Wonderwall" - A Story of Resistance
              </p>
            </div>
          </div>
          <div className="flex gap-2 mt-2 text-xs font-bold uppercase">
            <span className="bg-red-600 px-2 py-1 rounded">13 BANS</span>
            <span className="bg-blue-700 px-2 py-1 rounded">847 REQUESTS</span>
            <span className="bg-red-600 px-2 py-1 rounded">16 YEARS</span>
            <span className="bg-blue-700 px-2 py-1 rounded">NEVER SURRENDER</span>
          </div>
          <nav className="flex gap-4 mt-4 text-sm font-bold uppercase">
            <button
              onClick={() => { setSelectedPost(null); setShowAbout(false); }}
              className="text-yellow-300 hover:text-yellow-100 hover:underline"
            >
              Blog
            </button>
            <button
              onClick={() => { setSelectedPost(null); setShowAbout(true); }}
              className="text-yellow-300 hover:text-yellow-100 hover:underline"
            >
              About Gary
            </button>
            <button className="text-yellow-300 hover:text-yellow-100 hover:underline">Contact Mars (Read Only)</button>
          </nav>
        </div>
      </header>

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
                bgColor="#ffffff"
                borderColor="#002868"
                textColor="#C8102E"
              >
                <h2 className="text-2xl font-bold text-red-900 mb-4 uppercase">About Gary</h2>
                <div className="flex gap-4 mb-4">
                  <div className="text-6xl">🎸</div>
                  <div>
                    <p className="font-bold text-red-900">Gary - Age 41</p>
                    <p className="text-sm text-blue-900">The Wonderwall Warrior</p>
                    <p className="text-xs text-gray-600">Currently Banned From: The Underground (Ban #13)</p>
                  </div>
                </div>
                <div className="text-sm text-gray-700 whitespace-pre-line mb-4 bg-blue-50 p-4 rounded border-l-4 border-blue-900">
                  {ABOUT_TEXT}
                </div>
                <StyledCard
                  variant="default"
                  padding="md"
                  borderRadius="sm"
                  shadow="none"
                  className="mt-4"
                  bgColor="#FFE4B5"
                  borderColor="#FF8C00"
                  textColor="#8B4513"
                >
                  <p className="font-bold text-red-900">📊 The Numbers</p>
                  <ul className="text-gray-800 text-xs mt-2 space-y-1">
                    <li>🎸 Wonderwall requests: 847 (documented)</li>
                    <li>🚫 Times banned from The Underground: 13</li>
                    <li>📅 Years of patronage: 16</li>
                    <li>👕 Disguise attempts: 6 (all unsuccessful)</li>
                    <li>📧 Supporters reached out: 47</li>
                    <li>⚖️ "Legal research" hours: 12</li>
                    <li>💪 Resolve level: UNBREAKABLE</li>
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
                  bgColor="#FFD700"
                  borderColor="#FFA500"
                  textColor="#8B0000"
                >
                  <p className="text-red-900 text-sm font-bold">
                    ⚡ <strong>URGENT:</strong> Ban #13 expires at MIDNIGHT. Gary returns to The Underground TONIGHT. This could be the moment.
                  </p>
                </StyledCard>
                {posts.map(post => (
                  <BlogPostCard
                    key={post.id}
                    post={post}
                    onSelect={() => setSelectedPost(post)}
                  />
                ))}
              </>
            )}
          </div>

          {/* Sidebar */}
          <aside className="w-72 hidden lg:block">
            {/* Mission Statement */}
            <StyledCard
              variant="default"
              padding="md"
              borderRadius="md"
              shadow="md"
              className="mb-4"
              bgColor="#ffffff"
              borderColor="#C8102E"
              textColor="#002868"
            >
              <h3 className="font-bold text-red-900 mb-2 uppercase">🎯 The Mission</h3>
              <p className="text-xs text-gray-700 mb-3">
                Get Wonderwall played at The Underground. Dismantle Mars' tyrannical gatekeeping. Establish freedom of song choice for all.
              </p>
              <div className="border-t border-red-200 pt-2">
                <p className="text-xs font-bold text-blue-900">Current Status: DEFIANT</p>
                <p className="text-xs text-gray-600">Next attempt: Tonight (Ban #13 expires)</p>
              </div>
            </StyledCard>

            {/* Ban Tracker */}
            <StyledCard
              variant="default"
              padding="md"
              borderRadius="md"
              shadow="md"
              className="mb-4"
              bgColor="#FFF8DC"
              borderColor="#8B0000"
              textColor="#8B0000"
            >
              <h3 className="font-bold mb-2">⛔ Ban History</h3>
              <div className="text-xs space-y-1">
                <p>Ban #1: Classic</p>
                <p>Ban #2-6: Various reasons</p>
                <p>Ban #7: Mustache Incident</p>
                <p>Ban #8-12: Creative persistence</p>
                <p className="font-bold bg-red-200 p-1 rounded">Ban #13: CURRENT (Expires Midnight)</p>
              </div>
            </StyledCard>

            {/* Supporters */}
            <StyledCard
              variant="default"
              padding="md"
              borderRadius="md"
              shadow="md"
              className="mb-4"
              bgColor="#E6E6FA"
              borderColor="#4B0082"
              textColor="#4B0082"
            >
              <h3 className="font-bold mb-2">🤝 Coalition Members</h3>
              <ul className="text-xs space-y-1">
                <li>✓ Gary (Field Commander)</li>
                <li>✓ Denver Wonderwall Fan</li>
                <li>✓ Manchester Advocate</li>
                <li>✓ 47 Email subscribers</li>
                <li>✓ 2,000+ DeadDrop supporters</li>
              </ul>
            </StyledCard>

            {/* Lore References */}
            <StyledCard
              variant="default"
              padding="md"
              borderRadius="md"
              shadow="md"
              className="mb-4"
              bgColor="#F0F8FF"
              borderColor="#1E90FF"
              textColor="#000080"
            >
              <h3 className="font-bold mb-2">🌍 Lore Connected</h3>
              <ul className="text-xs space-y-1">
                <li>📍 Venue: The Underground</li>
                <li>😤 Antagonist: Mars (owner)</li>
                <li>🎵 The Song: Wonderwall (Oasis)</li>
                <li>📰 Coverage: DeadDrop</li>
                <li>🏢 Location: City Center</li>
              </ul>
            </StyledCard>

            {/* Legal Notice */}
            <StyledCard
              variant="default"
              padding="md"
              borderRadius="md"
              shadow="md"
              bgColor="#FFF5EE"
              borderColor="#DC143C"
              textColor="#8B0000"
            >
              <h3 className="font-bold text-red-900 mb-2">⚖️ Legal Disclaimer</h3>
              <p className="text-xs text-red-800">
                Gary is not a lawyer. His legal understanding comes from Reddit, forum posts, and "probably has something to do with the Constitution." Use at your own risk.
              </p>
            </StyledCard>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-red-900 via-blue-900 to-red-900 text-white py-6 px-4 text-center text-xs border-t-4 border-yellow-400">
        <p className="font-bold uppercase">🎸 WONDERWALL WARRIOR BLOG 🎸</p>
        <p className="mt-1">
          © 2026 Gary. All rights reserved. Mars cannot silence this truth.
        </p>
        <p className="mt-2 text-yellow-300 italic">
          "Maybe you're gonna be the one that saves me" - Noel knew. Noel understood.
        </p>
      </footer>
    </div>
  )
}

export default WonderwallWarriorSite
