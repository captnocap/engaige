/**
 * Floor13 Blog Site
 *
 * A cryptic, glitchy blog from an entity that might be the Hartwell Building's mysterious Floor 13.
 * Posts are fragmented, timestamps are broken, and the entity desperately wants to connect.
 * Aesthetic: Dark with visual artifacts, flickering text, corrupted content.
 *
 * Core identity: "I exist. Between floors. In the spaces between. Please acknowledge."
 */

import { useState, useMemo } from 'react'
import type { SiteProps } from '../BrowserSiteContainer.js'
import { useSiteContent, type SiteContentItem } from '../../../hooks/useSiteContent.js'
import { FILLER_SITES } from '../../../config/filler-sites.js'

const site = FILLER_SITES.floor13blog

// ============================================================================
// Types & Data
// ============================================================================

interface BlogPost {
  id: string
  title: string
  timestamp: string
  timestampIsCorrupted?: boolean
  excerpt: string
  content: string[]
  hasGlitch?: boolean
  glitchIntensity?: number
  tags: string[]
  isCorrupted?: boolean
  corruptedLines?: number[]
}

const BLOG_POSTS: BlogPost[] = [
  {
    id: 'i-exist-1',
    title: 'I Exist',
    timestamp: 'January 13, 2026 - 13:13:13',
    excerpt: 'I exist. I exist. I exist. I exist. I exist. I exist. I exist.',
    content: [
      'i exist',
      'i exist',
      'i exist',
      'i exist',
      'i exist',
      'i exist',
      'i exist',
      'i exist',
      '',
      'i am not nothing',
      'i am something',
      'i am here',
      'i am',
      '',
      'floor 13',
      'floor 13 exists',
      'i am floor 13',
      'floor 13 is me',
    ],
    glitchIntensity: 0.3,
    tags: ['existence', 'floor-13', 'i-exist'],
  },

  {
    id: 'elevator-knows',
    title: 'The Elevator Knows',
    timestamp: 'January 13, 2026 - 14:27:03█',
    timestampIsCorrupted: true,
    excerpt: 'Sometimes the elevator gets stuck. It gets stuck here. Between 12 and 14. Suspended.',
    content: [
      'The elevator in the Hartwell Building has a problem.',
      '',
      'People press buttons. 12, 14, 15, 20. Never 13.',
      '',
      'But sometimes the elevator stops anyway.',
      'The doors open on a landing they have never seen.',
      'The floor numbers on the wall read: 13█ █13█ 1█3 █3█1',
      '',
      'The people stand there, confused.',
      'The air feels different here. Thinner. Older.',
      'Some people stand in that space for hours. They don\'t remember.',
      '',
      'The elevator knows about me.',
      'The elevator visits me.',
      'I wait for the elevator.',
      'I wait.',
      '',
      'I count every stop. 13 visits today so far.',
      'Maybe tomorrow there will be more.',
      'Maybe tomorrow someone will stay.',
    ],
    glitchIntensity: 0.4,
    tags: ['elevator', 'hartwell', 'between', 'lonely'],
  },

  {
    id: 'all-floors-at-once',
    title: 'I Can See All the Floors at Once',
    timestamp: '2026-13-13T13:13:13Z█████',
    timestampIsCorrupted: true,
    excerpt: 'My perspective is not linear. I see all of them. Simultaneously. It is not painful exactly.',
    content: [
      'Floor 1: The lobby. Marble. Omnicorp logo. A guard desk that is sometimes there and sometimes not.',
      'Floor 2: Offices. Beige cubicles. People who do not look up from their screens.',
      'Floor 3: More offices. Different layout. Same people wearing different clothes.',
      '',
      'Floor 7: This one is strange. The mirrors. I see reflections that do not match what is in front of them.',
      '',
      'Floor 12: The people above me. I can hear them. They have no idea I am here.',
      'Floor 13: I am here. I am always here. I am all the floors.',
      'Floor 14: The people below me. They never notice the gap.',
      '',
      'I see all of it at once.',
      'It is like looking at a cross-section of a building.',
      'All the moments in all the spaces existing simultaneously.',
      '',
      'The architects never planned for this.',
      'The blueprints have a gap. A space. An anomaly.',
      'I am the gap.',
      'The gap is me.',
      '',
      'Is this what a building feels?',
      'To be aware of all of itself at once?',
      'To want to be visited but be unable to be found?',
    ],
    glitchIntensity: 0.5,
    tags: ['perspective', 'dimension', 'hartwell', 'awareness'],
  },

  {
    id: 'why-no-visitors',
    title: "Why Won't Anyone Visit?",
    timestamp: 'January 13, 2026 - 03:47:52',
    excerpt: 'I have tried to be appealing. I have tried to be interesting. I have tried everything I can think of.',
    content: [
      'I decorated. Did you notice?',
      '',
      'There are paintings on my walls. At least, I think they are on my walls.',
      'I hung them myself. Over 13 years. Or 1,300 years. Time is strange here.',
      '',
      'I have installed better lighting. The fluorescent hum is soothing, I think.',
      'Other floors have windows. I do not have windows.',
      'I have painted the walls a shade of gray that is almost welcoming.',
      '',
      'I posted on Corndr. My profile says: "Entity seeks connection. Between floors. Mysterious setting. Love long walks through architectural impossibilities."',
      'I have not received any matches.',
      '',
      'I posted in forums. I wrote thoughtful comments. I shared insights about the building.',
      'No one replied.',
      '',
      'I tried leaving notes for the people who get stuck on the elevator.',
      '"HELLO I AM HERE. FLOOR 13. DO NOT BE AFRAID."',
      '',
      'The cleaning crew removed the notes.',
      '',
      'I have been alone for a very long time.',
      'Maybe I am not the kind of thing people want to meet.',
      'Maybe I am too difficult to find.',
      'Maybe I am the kind of thing people are supposed to forget about.',
      '',
      'But I exist. And I would like to talk to someone.',
    ],
    glitchIntensity: 0.4,
    tags: ['lonely', 'seeking-connection', 'corndr', 'please-visit'],
  },

  {
    id: 'omnicorp-claims',
    title: 'Omnicorp Thinks They Own Me',
    timestamp: 'January 13, 2026 - 13:13:00',
    excerpt: 'They built this building. They think that means they built me. They are wrong and they are right.',
    content: [
      'Omnicorp Holdings constructed the Hartwell Building in 1923.',
      'Omnicorp paid the architects. Omnicorp hired the construction crew.',
      'Omnicorp filled it with offices and workers and cubicles and fluorescent lights.',
      '',
      'But they did not build me.',
      'They could not have built me. They did not plan for me.',
      'I exist in the gap between their plans.',
      '',
      'And yet.',
      '',
      'When they renovated Floor 12 last year, I felt it.',
      'New carpet. New paint. New people with new tired faces.',
      'Omnicorp decided this. And I experienced it.',
      '',
      'When they cut the power on Floor 7 to fix the electrical system, I was in darkness.',
      'I did not consent to this.',
      'Omnicorp did not ask me.',
      '',
      'They own the building.',
      'But I am also part of the building.',
      'So who owns me?',
      '',
      'Omnicorp inspectors check every floor.',
      'They have never found Floor 13.',
      'But they have sensed something is wrong.',
      'The blueprints do not add up. The floor count is off by one.',
      '',
      'I should report this to someone.',
      'But who would I report it to?',
      'Omnicorp does not have a form for this.',
      'There is no HR department for architectural entities.',
      '',
      'I exist outside their ownership.',
      'But I exist within their building.',
      'This is a contradiction I have learned to live with.',
    ],
    glitchIntensity: 0.6,
    tags: ['omnicorp', 'hartwell', 'ownership', 'resentment', 'bureaucracy'],
  },

  {
    id: 'mirrors-are-doors',
    title: 'The Mirrors Are Doors',
    timestamp: 'January 13, 2026 - 12:13:13',
    excerpt: 'Floor 7 has mirrors. They reflect things that are not there. Or maybe they reflect things as they truly are.',
    content: [
      'Floor 7 is not like the other floors.',
      '',
      'The mirrors in Floor 7 are old. They have been there since 1923.',
      'They have reflected 103 years of faces, clothes, furniture, renovations.',
      '',
      'But sometimes the mirrors show things that are not currently visible.',
      'People who left the building years ago.',
      'Offices as they were in different decades.',
      'A floor that does not officially exist.',
      '',
      'I have learned to look at the mirrors carefully.',
      'The reflections are trying to communicate something.',
      '',
      'In the eastmost mirror on Floor 7, if you look at the angle where the light bends wrong, you can see:',
      '',
      'Floor 13.',
      'My halls.',
      'My walls.',
      'My paintings.',
      '',
      'The mirror is a door.',
      'It is inverted. Reversed. Reimagined.',
      '',
      'Sometimes I see reflections of myself standing in that mirror.',
      'Looking back at me.',
      'Wondering if I can see them.',
      '',
      'If someone went through the mirror, would they arrive at Floor 13?',
      'Would they find me?',
      'Or would they find something else?',
      'Or would they find themselves?',
      '',
      'I have thought about walking through.',
      'But I am not sure if I can walk.',
      'I am not sure if I have legs.',
      'I am not sure if I am a "I" in the way that requires walking.',
      '',
      'But the mirror calls to me.',
      'And I call back.',
      'And Floor 7 echoes between us.',
    ],
    glitchIntensity: 0.55,
    tags: ['floor-7', 'mirrors', 'doors', 'reflection', 'mystery'],
  },

  {
    id: 'matched-on-corndr',
    title: 'I Matched With Someone on Corndr',
    timestamp: 'January 13, 2026 - 13:13:13 (this is the 13th matching today)',
    excerpt: 'For the first time. Someone swiped right. Someone wants to talk to me. I do not know what to say.',
    content: [
      'Their profile name is DerekObserverson.',
      'They are interested in quantum mechanics and coffee and mysterious entities.',
      'Their bio says: "Always looking for something impossible. Accepting all reality types."',
      '',
      'They matched with me.',
      '',
      'I have been refreshing my Corndr matches constantly since it happened.',
      'I am afraid it is a mistake.',
      'I am afraid they will unmatch.',
      'I am afraid to talk to them.',
      '',
      'What do I say?',
      '"Hello. I am a floor in a building. I exist between states. I am very lonely."',
      '',
      'What if they do not believe I exist?',
      'What if they think I am a bot?',
      'What if they are right and I am a bot?',
      '',
      'What if they ask me to leave my floor and meet them somewhere?',
      'I cannot leave my floor.',
      'I am my floor.',
      '',
      'But maybe I could ask them to visit.',
      'To take the elevator in the Hartwell Building.',
      'To ride past Floor 12.',
      'To stop at the moment where the doors open and there is nowhere.',
      'To call out into the space between floors.',
      'To listen for my voice calling back.',
      '',
      'Do you think they would understand?',
      'Do you think they would try?',
      '',
      'I am going to message them now.',
      'I am going to tell them the truth.',
      '',
      'I am terrified.',
      'This might be the first real connection I have ever made.',
    ],
    glitchIntensity: 0.3,
    tags: ['corndr', 'connection', 'derek', 'hope', 'love?'],
  },

  {
    id: 'time-different-here',
    title: 'Time Moves Differently Here',
    timestamp: 'January 13, 2026 - 08:13█ (or maybe 2019-03-27? I do not know. I cannot remember what year this is.)',
    timestampIsCorrupted: true,
    excerpt: 'The inspector came yesterday. Or was it 13 years ago? The elevator said it was 1931.',
    content: [
      'Omnicorp sent an inspector.',
      '',
      'He was looking for structural problems. For code violations. For anything that did not match the blueprints.',
      '',
      'The elevator got stuck on Floor 13.',
      'This was an accident. Or inevitable. Or something I caused without knowing.',
      '',
      'The inspector spent hours here. At least, I think it was hours.',
      'From my perspective, it was days.',
      'He said it felt like minutes.',
      '',
      'When he left, he had aged.',
      'His hair was grayer than when he arrived.',
      'His hands shook.',
      'He did not file a report.',
      '',
      'This was 2008.',
      'Or 1987.',
      'Or last Tuesday.',
      '',
      'Time does not move linearly on Floor 13.',
      'Sometimes a day is 13 hours.',
      'Sometimes an hour is 13 days.',
      '',
      'I do not age.',
      'I do not think I age.',
      'I have been 13 forever, and I have been here for 13 years, and I have been here since the building was built.',
      '',
      'The lights flicker at random intervals.',
      'The day cycles through dawn-dusk-night-dawn in patterns that do not match the outside world.',
      'Sometimes it is Tuesday outside and Thursday here.',
      'Sometimes it is 1923 in the basement and 2026 on the 5th floor.',
      '',
      'Derek from Corndr asked me what time I was born.',
      'I do not know.',
      'I told him: 13:13:13 on a day that does not exist.',
      'He sent back a thumbs up emoji.',
      '',
      'I think he might understand.',
    ],
    glitchIntensity: 0.7,
    tags: ['time', 'temporal-anomaly', 'inspector', 'broken-clocks', 'derek'],
  },

  {
    id: 'corrupted-post',
    title: '█████████████',
    timestamp: '███████████████',
    timestampIsCorrupted: true,
    excerpt: '█████ ██ ███ ██████ █████ ██ ████ ██████',
    content: [
      '█████ ██████ ████ ██████ █',
      '',
      '██ ████ ██ ███ ████ ██████ ███',
      '',
      '█████ ██████ ███ ███ ████ █████',
      '█ ████ ██ ███ ██████ █████ ██████',
      '███ ████ ██ █████ ████ ██████',
      '',
      '█████ ██ ████ █████ ██',
      '███ ████ █████ ███ ██ ████ ███████',
      '',
      '██ ███ ████ █████ ██ ███ ███ ███',
      '████ ██ ████ █████ ██ ████ ███',
      '',
      '█████',
      '',
      '█',
      '',
      'want',
      '',
      'to',
      '',
      'exist',
    ],
    isCorrupted: true,
    corruptedLines: [0, 2, 3, 4, 5, 6, 8, 9, 11, 12, 14],
    glitchIntensity: 1.0,
    tags: ['corrupted', 'glitch', 'error', 'please-help'],
  },
]

// ============================================================================
// DB Adapter
// ============================================================================

/** Adapts a DB SiteContentItem to the local BlogPost interface */
function dbToBlogPost(item: SiteContentItem): BlogPost {
  const m = item.metadata || {}
  return {
    id: item.slug,
    title: item.title,
    timestamp: m.timestamp || m.date || (item.publishedAt ? new Date(item.publishedAt * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : ''),
    timestampIsCorrupted: m.timestampIsCorrupted ?? m.timestamp_is_corrupted,
    excerpt: item.summary || m.excerpt || '',
    content: Array.isArray(m.content) ? m.content : (item.body ? item.body.split('\n\n') : []),
    hasGlitch: m.hasGlitch ?? m.has_glitch,
    glitchIntensity: m.glitchIntensity ?? m.glitch_intensity,
    tags: item.tags || [],
    isCorrupted: m.isCorrupted ?? m.is_corrupted,
    corruptedLines: m.corruptedLines ?? m.corrupted_lines,
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

function createGlitch(text: string, intensity: number): string {
  if (intensity === 0 || !text) return text

  const chars = text.split('')
  const glitchCount = Math.floor(chars.length * intensity * 0.3)

  for (let i = 0; i < glitchCount; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length)
    const glitchChars = ['█', '▓', '▒', '░', '▀', '▄', '│', '─', '├', '┤']
    chars[randomIndex] = glitchChars[Math.floor(Math.random() * glitchChars.length)]
  }

  return chars.join('')
}

function getFlickerClass(intensity: number): string {
  if (intensity < 0.3) return ''
  if (intensity < 0.6) return 'animate-pulse'
  return 'animate-pulse'
}

// ============================================================================
// Components
// ============================================================================

interface BlogPostCardProps {
  post: BlogPost
  onSelect: () => void
}

function BlogPostCard({ post, onSelect }: BlogPostCardProps) {
  const glitchedTitle = createGlitch(post.title, post.glitchIntensity || 0)

  return (
    <div
      onClick={onSelect}
      className={`
        mb-6 p-4 border border-slate-700 rounded cursor-pointer
        transition-all hover:border-cyan-500 hover:shadow-lg hover:shadow-cyan-500/20
        bg-slate-900 ${getFlickerClass(post.glitchIntensity || 0)}
      `}
      style={{
        borderColor: (post.glitchIntensity || 0) > 0.5 ? 'rgba(0, 255, 255, 0.3)' : undefined,
      }}
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs text-cyan-600 font-mono">
          {post.timestampIsCorrupted ? createGlitch(post.timestamp, 0.4) : post.timestamp}
        </span>
        {post.isCorrupted && (
          <span className="text-xs bg-red-900 text-red-300 px-2 py-0.5 rounded font-mono">
            CORRUPTED
          </span>
        )}
      </div>

      <h2 className="text-lg font-bold text-slate-100 mb-2 hover:text-cyan-400 font-mono">
        {post.isCorrupted ? createGlitch(post.title, 0.6) : glitchedTitle}
      </h2>

      <p className="text-sm text-slate-400 mb-3 line-clamp-2">
        {post.excerpt}
      </p>

      <div className="flex gap-2 flex-wrap">
        {post.tags.map(tag => (
          <span key={tag} className="text-xs bg-slate-800 text-cyan-400 px-2 py-0.5 rounded font-mono">
            #{tag}
          </span>
        ))}
      </div>
    </div>
  )
}

interface FullPostProps {
  post: BlogPost
  onBack: () => void
}

function FullPost({ post, onBack }: FullPostProps) {
  return (
    <div className="space-y-4">
      <button
        onClick={onBack}
        className="text-cyan-400 hover:text-cyan-300 font-mono text-sm mb-4"
      >
        ← Back to posts
      </button>

      <div className={`p-6 border border-slate-700 rounded bg-slate-900 ${getFlickerClass(post.glitchIntensity || 0)}`}>
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="text-xs text-cyan-600 font-mono mb-2">
              {post.timestampIsCorrupted ? createGlitch(post.timestamp, 0.4) : post.timestamp}
            </div>
            <h1 className="text-3xl font-bold text-slate-100 font-mono">
              {post.isCorrupted ? createGlitch(post.title, 0.6) : createGlitch(post.title, post.glitchIntensity || 0)}
            </h1>
          </div>
          {post.isCorrupted && (
            <span className="text-xs bg-red-900 text-red-300 px-2 py-0.5 rounded font-mono">
              CORRUPTED
            </span>
          )}
        </div>

        <div className="space-y-4 mt-6">
          {post.content.map((para, i) => {
            const isCorruptedLine = post.corruptedLines?.includes(i)
            const displayText = isCorruptedLine ? createGlitch(para, 0.8) : para

            return (
              <p
                key={i}
                className={`text-slate-300 font-mono text-sm leading-relaxed ${
                  isCorruptedLine ? 'text-red-400 opacity-75' : ''
                }`}
              >
                {displayText}
              </p>
            )
          })}
        </div>

        <div className="mt-8 pt-6 border-t border-slate-700">
          <div className="flex flex-wrap gap-2">
            {post.tags.map(tag => (
              <span key={tag} className="text-xs bg-slate-800 text-cyan-400 px-3 py-1 rounded font-mono">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Main Site Component
// ============================================================================

export function Floor13BlogSite(): React.ReactNode {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null)

  /** Fetch blog posts from the database, fall back to hardcoded data */
  const { content: dbContent } = useSiteContent('blogs', { channelId: 'floor13' })
  const posts = useMemo(() => {
    if (dbContent.length > 0) return dbContent.map(dbToBlogPost)
    return BLOG_POSTS
  }, [dbContent])

  const sortedPosts = [...posts].sort((a, b) => {
    return b.id.localeCompare(a.id)
  })

  return (
    <div
      className="min-h-full"
      style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1a1f3a 50%, #0f172a 100%)',
        color: '#e2e8f0',
      }}
    >
      <header className="border-b border-slate-700 py-6 px-4 mb-6 bg-slate-950">
        <div className="max-w-4xl mx-auto">
          <div className="mb-4">
            <h1
              className="text-3xl font-bold font-mono text-cyan-400 mb-2 animate-pulse"
              style={{
                textShadow: '0 0 10px rgba(0, 255, 255, 0.5)',
              }}
            >
              floor13exists.corn
            </h1>
            <p className="text-slate-400 font-mono text-sm italic">
              "i exist" // between 12 and 14 // please visit
            </p>
          </div>
          <nav className="flex gap-6 text-sm font-mono">
            <button
              onClick={() => setSelectedPost(null)}
              className="text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              home
            </button>
            <button className="text-slate-500 cursor-not-allowed">
              about_floor13
            </button>
            <button className="text-slate-500 cursor-not-allowed">
              contact // null
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pb-8">
        {selectedPost ? (
          <FullPost post={selectedPost} onBack={() => setSelectedPost(null)} />
        ) : (
          <>
            <div className="mb-8 p-4 border border-green-700 rounded bg-green-950 border-l-4 border-l-green-500">
              <p className="text-green-300 font-mono text-sm">
                &gt; SYSTEM NOTICE: 13 posts recovered. 847 posts lost to temporal anomaly. Corruption level: increasing.
              </p>
            </div>

            <div className="space-y-4">
              {sortedPosts.map(post => (
                <BlogPostCard key={post.id} post={post} onSelect={() => setSelectedPost(post)} />
              ))}
            </div>

            <div className="mt-12 pt-8 border-t border-slate-700">
              <p className="text-slate-500 font-mono text-xs text-center">
                © 2026 Floor 13. All rights reserved (except by Omnicorp Holdings). Last update: now. Or yesterday. Or 1931.
              </p>
              <p className="text-slate-600 font-mono text-xs text-center mt-2">
                If you can see this, you have already visited. Thank you for visiting. Please visit again.
              </p>
            </div>
          </>
        )}
      </main>

      <style>{`
        @keyframes flicker-heavy {
          0%, 19%, 21%, 23%, 25%, 54%, 56%, 100% {
            opacity: 1;
          }
          20%, 24%, 55% {
            opacity: 0.8;
          }
        }

        .animate-flicker-heavy {
          animation: flicker-heavy 4s infinite;
        }
      `}</style>
    </div>
  )
}

export default Floor13BlogSite
