/**
 * Threadit Site
 *
 * Reddit clone for the engAIge browser.
 * Features chaotic drama, AITA posts, and nested comment threads.
 */

import { useState } from 'react'
import type { SiteProps } from '../BrowserSiteContainer.js'
import { FILLER_SITES } from '../../../config/filler-sites.js'

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
  { name: 'r/coffee', icon: '☕', members: '847K', description: 'For the caffeinated' },
  { name: 'r/AmITheAsshole', icon: '⚖️', members: '5.2M', description: 'A catharsis for the frustrated' },
  { name: 'r/relationship_advice', icon: '💔', members: '3.1M', description: 'Need help with your relationship?' },
  { name: 'r/localscene', icon: '🎸', members: '124K', description: 'Underground shows and local music' },
  { name: 'r/AskThreadit', icon: '❓', members: '41M', description: 'Ask and answer thought-provoking questions' },
]

const SAMPLE_THREADS: Thread[] = [
  {
    id: 'thread_1',
    subreddit: 'r/AmITheAsshole',
    title: 'AITA for refusing to drink my roommate\'s "quantum brewed" coffee?',
    author: 'throwaway_brew_123',
    content: `My (24M) roommate (26F) just bought a $3000 quantum coffee maker and insists I try it every morning. I think it's pseudoscience bs and tastes the same as regular coffee.

She's now claiming I'm "closed-minded" and "don't appreciate innovation." She's been making passive aggressive comments about how I "wouldn't understand" because I "never finished my physics degree."

For context, I dropped out to pursue music, which she ALSO makes comments about.

This morning she made a big show of brewing her quantum coffee and sighing loudly when I made instant coffee instead. Then she said "some people just can't handle progress."

I told her that until peer-reviewed studies prove quantum coffee is actually different, I'm not spending 45 minutes watching her "collapse wave functions" for a cup of coffee.

Now she's not speaking to me and sent me a 47-minute YouTube video about quantum mechanics.

AITA?

Edit: Yes I know about the Martinez study. My roommate has told me about it approximately 400 times.

Edit 2: To everyone saying "just try it" - I DID try it once. It tasted like coffee. She said I "observed it wrong."`,
    flair: 'Asshole',
    upvotes: 2847,
    commentCount: 342,
    timestamp: '6 hours ago',
    awards: ['🏆', '😂', '☕'],
    comments: [
      {
        id: 'c1',
        author: 'CaffeineAddict99',
        content: 'NTA. Your coffee, your choice. Though I gotta say, quantum coffee IS pretty good...',
        upvotes: 1523,
        timestamp: '5 hours ago',
        replies: [
          {
            id: 'c1_1',
            author: 'throwaway_brew_123',
            content: 'I just don\'t see how quantum physics makes coffee taste better lol',
            upvotes: 892,
            timestamp: '5 hours ago',
            isOP: true,
            replies: [
              {
                id: 'c1_1_1',
                author: 'QuantumBaristaGirl',
                content: 'As someone who works at a quantum cafe, there IS a difference. The molecular structure is more uniform. But yeah, $3k is excessive for home use.',
                upvotes: 2104,
                timestamp: '4 hours ago',
                flair: 'Certified Q-Barista',
                replies: [],
              },
            ],
          },
        ],
      },
      {
        id: 'c2',
        author: 'RelationshipGuru2024',
        content: 'YTA. She\'s excited about something and wants to share it with you. Just try one cup and be supportive!',
        upvotes: -234,
        timestamp: '5 hours ago',
        replies: [
          {
            id: 'c2_1',
            author: 'RationalThinker42',
            content: 'Found the roommate\'s alt account',
            upvotes: 1847,
            timestamp: '4 hours ago',
            replies: [],
          },
        ],
      },
      {
        id: 'c3',
        author: 'PhysicsProf_MIT',
        content: 'Physics professor here. Quantum coffee is... complicated. The Martinez study has been somewhat replicated but the mechanism is still debated. Your roommate is being dramatic but also not entirely wrong?\n\nESH I guess?',
        upvotes: 3421,
        timestamp: '4 hours ago',
        flair: 'PhD',
        replies: [
          {
            id: 'c3_1',
            author: 'throwaway_brew_123',
            content: 'Wait, it\'s actually real? I thought it was like cryptocurrency for coffee people',
            upvotes: 2891,
            timestamp: '4 hours ago',
            isOP: true,
            replies: [
              {
                id: 'c3_1_1',
                author: 'PhysicsProf_MIT',
                content: 'Oh it\'s definitely real. Whether it\'s WORTH $3000 and 45 minutes of your morning is another question entirely.',
                upvotes: 1567,
                timestamp: '3 hours ago',
                flair: 'PhD',
                replies: [],
              },
            ],
          },
        ],
      },
      {
        id: 'c4',
        author: 'Deleted_User',
        content: '[removed]',
        upvotes: 0,
        timestamp: '3 hours ago',
        replies: [],
      },
    ],
  },
  {
    id: 'thread_2',
    subreddit: 'r/relationship_advice',
    title: 'My (24F) partner (27M) won\'t stop explaining quantum physics to me and it\'s ruining our relationship',
    author: 'tired_of_particles',
    content: `We've been together for 2 years and I love him, but ever since he got into quantum coffee, he won't shut up about it.

Every dinner conversation turns into a lecture about wave function collapse. He bought me a book called "Quantum Mechanics for Your Girlfriend" which I found condescending.

Last week he told me our relationship was like "quantum entanglement" and when I said that was sweet, he spent 45 minutes explaining why that was actually "physically inaccurate but emotionally true."

I told him I don't need everything explained to me and he said "but how will you understand the beauty of the universe?"

How do I tell him to just... talk to me like a normal person again?`,
    flair: 'Relationships',
    upvotes: 1247,
    commentCount: 189,
    timestamp: '12 hours ago',
    awards: ['💕'],
    comments: [
      {
        id: 't2_c1',
        author: 'ActualTherapist_Karen',
        content: 'This is a communication issue. He\'s found something that excites him and wants to share it, but isn\'t reading your signals. Have you tried directly saying "I love that you\'re passionate about this, but I need us to have conversations that don\'t involve quantum physics"?',
        upvotes: 892,
        timestamp: '11 hours ago',
        flair: 'Counselor',
        replies: [
          {
            id: 't2_c1_1',
            author: 'tired_of_particles',
            content: 'I tried that and he said "but everything involves quantum physics at some level"',
            upvotes: 2341,
            timestamp: '11 hours ago',
            isOP: true,
            replies: [],
          },
        ],
      },
      {
        id: 't2_c2',
        author: 'quantum_widow',
        content: 'Girl RUN. I divorced my quantum coffee obsessed husband last year. It started with coffee. Then he wanted to quantum entangle our PETS.',
        upvotes: 567,
        timestamp: '10 hours ago',
        replies: [],
      },
    ],
  },
  {
    id: 'thread_3',
    subreddit: 'r/localscene',
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
        id: 't3_c1',
        author: 'venue_insider',
        content: 'I work at a nearby venue. Heard from Mars (owner of The Underground) that both band members had some kind of breakdown during soundcheck. Something about "the music no longer resonating with the fundamental frequency of existence" idk man',
        upvotes: 312,
        timestamp: '7 hours ago',
        replies: [
          {
            id: 't3_c1_1',
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
        id: 't3_c2',
        author: 'neon_dreams_fan',
        content: 'Neon Requiem is doing an impromptu show at Murphy\'s Pub if anyone needs somewhere to go tonight. Starts at 10.',
        upvotes: 156,
        timestamp: '6 hours ago',
        replies: [
          {
            id: 't3_c2_1',
            author: 'UndergroundRegular',
            content: 'You\'re a lifesaver. On my way',
            upvotes: 67,
            timestamp: '6 hours ago',
            isOP: true,
            replies: [],
          },
        ],
      },
    ],
  },
  {
    id: 'thread_4',
    subreddit: 'r/AskThreadit',
    title: 'What\'s the weirdest thing you\'ve ever witnessed at a local venue?',
    author: 'curiosity_killed_me',
    content: `I\'ll start: At The Underground last month, a guy tried to crowdsurf during an acoustic set. There were like 12 people in the audience. They did not catch him.`,
    upvotes: 5621,
    commentCount: 2341,
    timestamp: '1 day ago',
    awards: ['🏆', '😂', '🎸', '💀'],
    comments: [
      {
        id: 't4_c1',
        author: 'basement_show_veteran',
        content: 'Saw a band\'s drummer quit mid-song because the frontman made a joke about his "timekeeping." The drummer threw his sticks into the crowd and left. The band just finished the set with the bassist playing drums with one hand.',
        upvotes: 4521,
        timestamp: '23 hours ago',
        replies: [],
      },
      {
        id: 't4_c2',
        author: 'MarsTheOwner',
        content: 'I own The Underground. The crowdsurf guy comes back every month. We call him "Trust Fall Tim." No one has ever caught him. He keeps trying.',
        upvotes: 8934,
        timestamp: '20 hours ago',
        flair: 'Verified Venue Owner',
        replies: [
          {
            id: 't4_c2_1',
            author: 'TrustFallTim',
            content: 'One day Mars. One day.',
            upvotes: 12453,
            timestamp: '18 hours ago',
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

export function ThreaditSite({ siteId }: SiteProps) {
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null)
  const [selectedSubreddit, setSelectedSubreddit] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'hot' | 'new' | 'top'>('hot')
  const [userVotes, setUserVotes] = useState<Record<string, 'up' | 'down' | null>>({})

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
              onClick={() => {
                setSelectedThread(null)
                setSelectedSubreddit(null)
              }}
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
              <button
                className="px-3 py-1 rounded-full text-sm font-medium"
                style={{ background: site.theme.primary, color: 'white' }}
              >
                Log In
              </button>
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
                onBack={() => setSelectedThread(null)}
                userVotes={userVotes}
                onVote={handleVote}
                getVoteAdjustment={getVoteAdjustment}
              />
            ) : (
              <>
                {/* Sort Controls */}
                <div
                  className="rounded-md mb-4 p-3 flex items-center gap-4"
                  style={{ background: site.theme.surface }}
                >
                  <span className="text-sm" style={{ color: site.theme.textMuted }}>
                    Sort by:
                  </span>
                  {(['hot', 'new', 'top'] as const).map((sort) => (
                    <button
                      key={sort}
                      onClick={() => setSortBy(sort)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        sortBy === sort ? '' : 'hover:bg-gray-100'
                      }`}
                      style={{
                        background: sortBy === sort ? site.theme.primary : 'transparent',
                        color: sortBy === sort ? 'white' : site.theme.textMuted,
                      }}
                    >
                      {sort.charAt(0).toUpperCase() + sort.slice(1)}
                    </button>
                  ))}
                </div>

                {/* Thread List */}
                <div className="space-y-3">
                  {filteredThreads.map((thread) => (
                    <ThreadCard
                      key={thread.id}
                      thread={thread}
                      onClick={() => setSelectedThread(thread)}
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
              <div
                className="rounded-md overflow-hidden"
                style={{ background: site.theme.surface, border: `1px solid ${site.theme.border}` }}
              >
                <div className="p-3" style={{ background: site.theme.primary }}>
                  <h2 className="font-bold text-white">{selectedSubreddit}</h2>
                </div>
                <div className="p-3">
                  <p className="text-sm" style={{ color: site.theme.textMuted }}>
                    {SUBREDDITS.find(s => s.name === selectedSubreddit)?.description}
                  </p>
                  <button
                    onClick={() => setSelectedSubreddit(null)}
                    className="mt-3 text-sm hover:underline"
                    style={{ color: site.theme.secondary }}
                  >
                    ← Back to Home
                  </button>
                </div>
              </div>
            ) : (
              <div
                className="rounded-md overflow-hidden"
                style={{ background: site.theme.surface, border: `1px solid ${site.theme.border}` }}
              >
                <div className="p-3" style={{ background: site.theme.primary }}>
                  <h2 className="font-bold text-white">Home</h2>
                </div>
                <div className="p-3">
                  <p className="text-sm" style={{ color: site.theme.textMuted }}>
                    Your personal {site.name} front page. Come here to check in with your favorite communities.
                  </p>
                </div>
              </div>
            )}

            {/* Popular Communities */}
            <div
              className="rounded-md overflow-hidden"
              style={{ background: site.theme.surface, border: `1px solid ${site.theme.border}` }}
            >
              <div className="p-3 font-bold text-sm" style={{ color: site.theme.text, borderBottom: `1px solid ${site.theme.border}` }}>
                Popular Communities
              </div>
              <div className="py-2">
                {SUBREDDITS.map((sub) => (
                  <button
                    key={sub.name}
                    onClick={() => {
                      setSelectedSubreddit(sub.name)
                      setSelectedThread(null)
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-100 transition-colors text-left"
                  >
                    <span className="text-xl">{sub.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium" style={{ color: site.theme.text }}>
                        {sub.name}
                      </p>
                      <p className="text-xs" style={{ color: site.theme.textMuted }}>
                        {sub.members} members
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Rules */}
            <div
              className="rounded-md p-3 text-xs"
              style={{ background: site.theme.surface, border: `1px solid ${site.theme.border}`, color: site.theme.textMuted }}
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
            </div>
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
    <div
      className="rounded-md flex overflow-hidden"
      style={{ background: site.theme.surface, border: `1px solid ${site.theme.border}` }}
    >
      {/* Vote Column */}
      <div
        className="w-10 flex flex-col items-center py-2 gap-1"
        style={{ background: site.theme.background }}
      >
        <button
          onClick={(e) => {
            e.stopPropagation()
            onVote(thread.id, 'up')
          }}
          className="p-1 rounded hover:bg-gray-200 transition-colors"
        >
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill={userVote === 'up' ? site.theme.upvote : 'none'}
            stroke={userVote === 'up' ? site.theme.upvote : site.theme.textMuted}
            strokeWidth={2}
          >
            <path d="M12 4l-8 8h5v8h6v-8h5z" />
          </svg>
        </button>
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
        <button
          onClick={(e) => {
            e.stopPropagation()
            onVote(thread.id, 'down')
          }}
          className="p-1 rounded hover:bg-gray-200 transition-colors"
        >
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill={userVote === 'down' ? site.theme.downvote : 'none'}
            stroke={userVote === 'down' ? site.theme.downvote : site.theme.textMuted}
            strokeWidth={2}
          >
            <path d="M12 20l8-8h-5V4H9v8H4z" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <button
        onClick={onClick}
        className="flex-1 p-3 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2 text-xs mb-1" style={{ color: site.theme.textMuted }}>
          <span className="font-medium" style={{ color: site.theme.text }}>
            {thread.subreddit}
          </span>
          <span>•</span>
          <span>Posted by u/{thread.author}</span>
          <span>•</span>
          <span>{thread.timestamp}</span>
          {thread.awards && thread.awards.map((award, i) => (
            <span key={i}>{award}</span>
          ))}
        </div>
        <h3 className="font-medium mb-1" style={{ color: site.theme.text }}>
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
    </div>
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
      <button
        onClick={onBack}
        className="text-sm hover:underline"
        style={{ color: site.theme.secondary }}
      >
        ← Back to {thread.subreddit}
      </button>

      {/* Main Post */}
      <div
        className="rounded-md"
        style={{ background: site.theme.surface, border: `1px solid ${site.theme.border}` }}
      >
        <div className="p-4">
          <div className="flex items-center gap-2 text-xs mb-2" style={{ color: site.theme.textMuted }}>
            <span className="font-medium" style={{ color: site.theme.text }}>
              {thread.subreddit}
            </span>
            <span>•</span>
            <span>Posted by u/{thread.author}</span>
            <span>•</span>
            <span>{thread.timestamp}</span>
            {thread.awards && thread.awards.map((award, i) => (
              <span key={i}>{award}</span>
            ))}
          </div>

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
              <button
                onClick={() => onVote(thread.id, 'up')}
                className="p-1 rounded hover:bg-gray-100"
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill={userVote === 'up' ? site.theme.upvote : 'none'}
                  stroke={userVote === 'up' ? site.theme.upvote : 'currentColor'}
                  strokeWidth={2}
                >
                  <path d="M12 4l-8 8h5v8h6v-8h5z" />
                </svg>
              </button>
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
              <button
                onClick={() => onVote(thread.id, 'down')}
                className="p-1 rounded hover:bg-gray-100"
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill={userVote === 'down' ? site.theme.downvote : 'none'}
                  stroke={userVote === 'down' ? site.theme.downvote : 'currentColor'}
                  strokeWidth={2}
                >
                  <path d="M12 20l8-8h-5V4H9v8H4z" />
                </svg>
              </button>
            </div>
            <span>{thread.commentCount} comments</span>
            <span>Share</span>
            <span>Save</span>
          </div>
        </div>
      </div>

      {/* Comment Input */}
      <div
        className="rounded-md p-4"
        style={{ background: site.theme.surface, border: `1px solid ${site.theme.border}` }}
      >
        <p className="text-sm mb-2" style={{ color: site.theme.textMuted }}>
          Comment as <span style={{ color: site.theme.secondary }}>u/guest</span>
        </p>
        <textarea
          placeholder="What are your thoughts?"
          className="w-full p-3 rounded text-sm resize-none"
          rows={4}
          style={{
            background: site.theme.background,
            border: `1px solid ${site.theme.border}`,
            color: site.theme.text,
          }}
        />
        <div className="flex justify-end mt-2">
          <button
            className="px-4 py-1.5 rounded-full text-sm font-medium"
            style={{ background: site.theme.secondary, color: 'white' }}
          >
            Comment
          </button>
        </div>
      </div>

      {/* Comments */}
      <div
        className="rounded-md p-4"
        style={{ background: site.theme.surface, border: `1px solid ${site.theme.border}` }}
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
      </div>
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
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hover:bg-gray-100 p-0.5 rounded"
          >
            {collapsed ? '[+]' : '[-]'}
          </button>
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
                <button
                  onClick={() => onVote(comment.id, 'up')}
                  className="p-0.5 rounded hover:bg-gray-100"
                >
                  <svg
                    className="w-3 h-3"
                    viewBox="0 0 24 24"
                    fill={userVote === 'up' ? site.theme.upvote : 'none'}
                    stroke={userVote === 'up' ? site.theme.upvote : 'currentColor'}
                    strokeWidth={2}
                  >
                    <path d="M12 4l-8 8h5v8h6v-8h5z" />
                  </svg>
                </button>
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
                <button
                  onClick={() => onVote(comment.id, 'down')}
                  className="p-0.5 rounded hover:bg-gray-100"
                >
                  <svg
                    className="w-3 h-3"
                    viewBox="0 0 24 24"
                    fill={userVote === 'down' ? site.theme.downvote : 'none'}
                    stroke={userVote === 'down' ? site.theme.downvote : 'currentColor'}
                    strokeWidth={2}
                  >
                    <path d="M12 20l8-8h-5V4H9v8H4z" />
                  </svg>
                </button>
              </div>
              <button className="hover:underline">Reply</button>
              <button className="hover:underline">Share</button>
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
