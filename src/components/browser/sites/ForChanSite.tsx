/**
 * ForChan Site
 *
 * 4chan-style imageboard clone for the engAIge browser.
 * Features anonymous posting, greentext, reply chains, and classic imageboard aesthetic.
 */

import { useState } from 'react'
import type { SiteProps } from '../BrowserSiteContainer.js'
import { FILLER_SITES } from '../../../config/filler-sites.js'
import { SidebarAdWidget } from '../ads/index.js'

const site = FILLER_SITES.imageboard

// ============================================================================
// Types
// ============================================================================

interface Reply {
  id: string
  content: string
  image?: string
  timestamp: string
  replyTo?: string[]
  name?: string
  tripcode?: string
}

interface Thread {
  id: string
  board: string
  subject?: string
  content: string
  image?: string
  timestamp: string
  replies: Reply[]
  name?: string
  tripcode?: string
  sticky?: boolean
  locked?: boolean
}

interface Board {
  id: string
  name: string
  description: string
  nsfw?: boolean
}

// ============================================================================
// Sample Data
// ============================================================================

const BOARDS: Board[] = [
  { id: 'b', name: 'Random', description: 'The stories and information posted here are artistic works of fiction.' },
  { id: 'g', name: 'Technology', description: 'Install Gentoo' },
  { id: 'mu', name: 'Music', description: 'TORTURE THE ARTIST' },
  { id: 'ck', name: 'Food & Cooking', description: "How do I make pasta that doesn't taste like sadness?" },
  { id: 'x', name: 'Paranormal', description: 'Creepy tales and unexplained phenomena' },
  { id: 'sci', name: 'Science & Math', description: 'For the scientifically minded' },
  { id: 'diy', name: 'Do It Yourself', description: 'You can probably fix that yourself, right?' },
  { id: 'adv', name: 'Advice', description: 'Life lessons from anonymous strangers' },
]

const SAMPLE_THREADS: Thread[] = [
  {
    id: '94817234',
    board: 'g',
    subject: 'Quantum Coffee Machine General /qcg/',
    content: `>be me
>finally save up $3000 for quantum coffee maker
>took 6 months of eating nothing but ramen
>it arrives
>setup takes 4 hours
>first cup takes 45 minutes to brew
>taste it
>tastes exactly like regular coffee
>mfw I can't tell the difference
>mfw I'm $3000 poorer
>mfw my roommate was right all along

Is quantum coffee actually a meme or am I just not "observing" it correctly?`,
    image: '☕💸',
    timestamp: '11/23/24(Sat)14:23:42',
    name: 'Anonymous',
    sticky: true,
    replies: [
      {
        id: '94817267',
        content: `>>94817234
>he fell for the quantum meme
ngmi

just get an aeropress like a normal person`,
        timestamp: '11/23/24(Sat)14:25:11',
        replyTo: ['94817234'],
      },
      {
        id: '94817289',
        content: `>>94817234
Unironically you need to calibrate your observation field. The manual has a whole section on this.

t. actual quantum barista`,
        timestamp: '11/23/24(Sat)14:27:33',
        replyTo: ['94817234'],
        name: 'QuantumAnon',
        tripcode: '!qCoffee42',
      },
      {
        id: '94817312',
        content: `>>94817289
>tripfagging
>on /g/
cringe

also OP you need to observe it with INTENT. that's literally the whole point.`,
        timestamp: '11/23/24(Sat)14:29:58',
        replyTo: ['94817289'],
      },
      {
        id: '94817345',
        content: `>quantum coffee
>not just brewing regular coffee and lying to yourself about it
never gonna make it bros`,
        timestamp: '11/23/24(Sat)14:32:15',
        image: '🤡',
      },
      {
        id: '94817378',
        content: `>>94817234
>>94817267
>>94817312
This thread is living proof that nobody on this board has actually tried quantum coffee

I literally conducted a double blind test with 50 people and 47 of them could tell the difference

Source: I made it up but it sounds believable`,
        timestamp: '11/23/24(Sat)14:35:47',
        replyTo: ['94817234', '94817267', '94817312'],
      },
      {
        id: '94817401',
        content: `>>94817378
>Source: I made it up
at least you're honest

anyway the real redpill is that coffee is a psyop by Big Caffeine`,
        timestamp: '11/23/24(Sat)14:38:22',
        replyTo: ['94817378'],
      },
    ],
  },
  {
    id: '94815102',
    board: 'mu',
    subject: 'Velvet Algorithms Appreciation Thread',
    content: `ITT: We discuss the greatest synth-rock duo of our generation

Just saw them live at The Underground before they had their "existential crisis" and cancelled everything. AMA about the show.

pic unrelated but they didn't let us take photos`,
    image: '🎹✨',
    timestamp: '11/23/24(Sat)09:15:33',
    replies: [
      {
        id: '94815134',
        content: `>>94815102
>greatest synth-rock duo
>Neon Requiem exists
op has literally never listened to music`,
        timestamp: '11/23/24(Sat)09:18:45',
        replyTo: ['94815102'],
      },
      {
        id: '94815167',
        content: `>>94815134
Neon Requiem is good but VA has better songwriting

their new track "Debugging My Heart" is unironically kino`,
        timestamp: '11/23/24(Sat)09:21:22',
        replyTo: ['94815134'],
      },
      {
        id: '94815189',
        content: `>>94815102
What was the existential crisis about? I heard they had a breakdown during soundcheck`,
        timestamp: '11/23/24(Sat)09:23:57',
        replyTo: ['94815102'],
      },
      {
        id: '94815212',
        content: `>>94815189
I was there. Mars (venue owner) said they started arguing about whether music can truly express human emotion or if it's all just mathematical patterns

Then one of them said "what's even the point" and they both just... left

It was surreal`,
        timestamp: '11/23/24(Sat)09:27:14',
        replyTo: ['94815189'],
      },
      {
        id: '94815245',
        content: `>>94815212
>Mars
based venue owner. The Underground is literally the only good venue left in this city`,
        timestamp: '11/23/24(Sat)09:30:01',
        replyTo: ['94815212'],
      },
      {
        id: '94815278',
        content: `>>94815212
kek that's the most Velvet Algorithms thing I've ever heard

they'll be back in like 2 weeks acting like nothing happened`,
        timestamp: '11/23/24(Sat)09:33:46',
        replyTo: ['94815212'],
      },
    ],
  },
  {
    id: '94812456',
    board: 'x',
    subject: 'Hartwell Building Thread - New Evidence',
    content: `New info just dropped about the Hartwell Building incident

My cousin works in city records and found some documents that were supposed to be sealed. Not gonna post them but I can tell you what they say:

>building was scheduled for inspection the morning AFTER the incident
>inspection was specifically for "unusual electromagnetic readings"
>inspector called in sick that morning
>building was demolished 3 weeks later

Make of this what you will`,
    image: '🏢🔍',
    timestamp: '11/22/24(Fri)23:45:12',
    replies: [
      {
        id: '94812489',
        content: `>>94812456
>not posting the documents
>"trust me bro"
every time with this board`,
        timestamp: '11/22/24(Fri)23:47:55',
        replyTo: ['94812456'],
      },
      {
        id: '94812512',
        content: `>>94812489
you think I'm gonna dox my cousin? use your brain

anyway the electromagnetic thing lines up with what the midnight mystery guy said in his video`,
        timestamp: '11/22/24(Fri)23:50:33',
        replyTo: ['94812489'],
      },
      {
        id: '94812545',
        content: `I lived near Hartwell when it happened. The sounds that night were like nothing I've ever heard. Not screaming, not mechanical. Just... wrong.

Still have nightmares sometimes.`,
        timestamp: '11/22/24(Fri)23:53:18',
      },
      {
        id: '94812578',
        content: `>>94812545
>wrong
describe it better schizo

what did it actually sound like`,
        timestamp: '11/22/24(Fri)23:56:42',
        replyTo: ['94812545'],
      },
      {
        id: '94812601',
        content: `>>94812578
Imagine if static had a rhythm. Like white noise but it was... breathing? I know how that sounds but I don't know how else to describe it.

My dog wouldn't stop barking for hours.`,
        timestamp: '11/22/24(Fri)23:59:15',
        replyTo: ['94812578'],
      },
      {
        id: '94812634',
        content: `>>94812601
>static that breathes
bruh that's literally just sleep paralysis audio hallucinations

you weren't outside you were having a nightmare`,
        timestamp: '11/23/24(Sat)00:02:47',
        replyTo: ['94812601'],
      },
      {
        id: '94812667',
        content: `>>94812634
cope

something happened at Hartwell and they covered it up. too many independent witnesses for it to be "mass hysteria"`,
        timestamp: '11/23/24(Sat)00:05:33',
        replyTo: ['94812634'],
      },
    ],
  },
  {
    id: '94810987',
    board: 'ck',
    subject: 'Rate my quantum coffee setup',
    content: `Just upgraded my coffee station

>Quantum Q-3000 brewer
>Single origin beans from Guatemala
>Filtered water (important for wave function stability)
>Ceramic mug (no metal, affects readings)

Ask me anything about home quantum brewing`,
    image: '☕🔬',
    timestamp: '11/22/24(Fri)18:23:45',
    replies: [
      {
        id: '94811023',
        content: `>>94810987
>ceramic mug for readings
you know you're drinking it right? not measuring it?`,
        timestamp: '11/22/24(Fri)18:26:12',
        replyTo: ['94810987'],
      },
      {
        id: '94811056',
        content: `>>94811023
The container absolutely affects taste. This is basic quantum physics. The electrons in metal interfere with the superposition.

Did you even take high school physics?`,
        timestamp: '11/22/24(Fri)18:29:47',
        replyTo: ['94811023'],
      },
      {
        id: '94811089',
        content: `>>94811056
>electrons interfere with superposition
that's... that's not how any of this works

t. actual physics PhD`,
        timestamp: '11/22/24(Fri)18:32:58',
        replyTo: ['94811056'],
      },
      {
        id: '94811122',
        content: `>>94811089
>physics PhD
>on /ck/
>believes in "real" physics
ngmi`,
        timestamp: '11/22/24(Fri)18:35:33',
        replyTo: ['94811089'],
      },
      {
        id: '94811155',
        content: `Anyway OP how long does your setup take to brew? Mine takes like 50 minutes and my wife keeps complaining`,
        timestamp: '11/22/24(Fri)18:38:16',
      },
      {
        id: '94811188',
        content: `>>94811155
About 45 minutes if I'm being precise with the observation timing. You can speed it up but quality suffers.

Also don't let your wife observe it during brewing. Multiple observers collapse the wave function wrong.`,
        timestamp: '11/22/24(Fri)18:41:52',
        replyTo: ['94811155'],
      },
    ],
  },
  {
    id: '94809234',
    board: 'adv',
    content: `>be me
>24, live with roommate
>she's obsessed with quantum coffee
>spends $3000 on a machine
>makes me try it every morning
>I say it tastes like regular coffee
>she calls me closed minded
>told her I need peer reviewed studies before I believe it
>she won't talk to me now

How do I fix this? She's a good roommate otherwise and I don't want to move`,
    image: '😐',
    timestamp: '11/22/24(Fri)15:12:33',
    replies: [
      {
        id: '94809267',
        content: `>>94809234
just pretend to like it anon

it's not worth losing housing over fake coffee`,
        timestamp: '11/22/24(Fri)15:15:44',
        replyTo: ['94809234'],
      },
      {
        id: '94809300',
        content: `>>94809234
Wait are you the guy from AITA? This exact situation was posted there`,
        timestamp: '11/22/24(Fri)15:18:22',
        replyTo: ['94809234'],
      },
      {
        id: '94809333',
        content: `>>94809300
link?`,
        timestamp: '11/22/24(Fri)15:20:57',
        replyTo: ['94809300'],
      },
      {
        id: '94809366',
        content: `>>94809300
I don't use threadit. Maybe she posted about it? That's kind of concerning actually`,
        timestamp: '11/22/24(Fri)15:23:35',
        replyTo: ['94809300'],
      },
      {
        id: '94809399',
        content: `>>94809366
bro if she's posting about you on threadit that's a huge red flag

check r/AmITheAsshole, there's definitely a post about this`,
        timestamp: '11/22/24(Fri)15:26:18',
        replyTo: ['94809366'],
      },
      {
        id: '94809432',
        content: `>>94809234
NTA btw

She needs to understand not everyone wants to spend 45 minutes waiting for coffee every morning. That's just basic roommate respect.`,
        timestamp: '11/22/24(Fri)15:29:44',
        replyTo: ['94809234'],
      },
    ],
  },
  {
    id: '94807891',
    board: 'b',
    subject: 'Trust Fall Tim General',
    content: `New TFT video just dropped

>acoustic show
>8 people in crowd
>he still tried it
>nobody caught him
>again

When will he learn bros`,
    image: '🤸💥',
    timestamp: '11/22/24(Fri)12:34:56',
    replies: [
      {
        id: '94807924',
        content: `>>94807891
LEGEND. Never stop Tim.`,
        timestamp: '11/22/24(Fri)12:37:23',
        replyTo: ['94807891'],
      },
      {
        id: '94807957',
        content: `>>94807891
I was at that show. The acoustic guy stopped mid-song to check if Tim was okay. Tim just gave a thumbs up from the floor and the guy continued.

Absolute cinema.`,
        timestamp: '11/22/24(Fri)12:40:12',
        replyTo: ['94807891'],
      },
      {
        id: '94807990',
        content: `One day an anon will organize enough people to actually catch him

One day`,
        timestamp: '11/22/24(Fri)12:43:45',
      },
      {
        id: '94808023',
        content: `>>94807990
That defeats the purpose. The beauty is in the failure. Tim knows this.

He's not trying to crowdsurf. He's making a statement about trust in modern society.`,
        timestamp: '11/22/24(Fri)12:46:33',
        replyTo: ['94807990'],
      },
      {
        id: '94808056',
        content: `>>94808023
>deep philosophical meaning
>it's just some dude faceplanting every week
peak /b/ moment`,
        timestamp: '11/22/24(Fri)12:49:18',
        replyTo: ['94808023'],
      },
    ],
  },
]

// ============================================================================
// Components
// ============================================================================

export function ForChanSite({ siteId, onNavigate }: SiteProps) {
  const [selectedBoard, setSelectedBoard] = useState<string | null>(null)
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null)

  const displayedThreads = selectedBoard
    ? SAMPLE_THREADS.filter(t => t.board === selectedBoard)
    : SAMPLE_THREADS

  return (
    <div className="min-h-full" style={{ background: site.theme.background }}>
      {/* Header */}
      <header
        className="text-center py-3 px-4"
        style={{ background: site.theme.headerBg, borderBottom: `1px solid ${site.theme.border}` }}
      >
        <h1
          className="text-2xl font-bold"
          style={{ color: site.theme.headerText }}
        >
          {site.name}
        </h1>
        <p className="text-sm" style={{ color: site.theme.textMuted }}>
          {site.tagline}
        </p>
      </header>

      {/* Board Navigation */}
      <nav
        className="px-4 py-2 text-center text-sm border-b"
        style={{ background: site.theme.surface, borderColor: site.theme.border }}
      >
        <span className="font-bold mr-2" style={{ color: site.theme.text }}>[ </span>
        <button
          onClick={() => {
            setSelectedBoard(null)
            setSelectedThread(null)
          }}
          className="hover:underline"
          style={{ color: selectedBoard === null ? site.theme.linkVisited : site.theme.link }}
        >
          Home
        </button>
        {BOARDS.map((board, i) => (
          <span key={board.id}>
            <span style={{ color: site.theme.text }}> / </span>
            <button
              onClick={() => {
                setSelectedBoard(board.id)
                setSelectedThread(null)
              }}
              className="hover:underline"
              style={{ color: selectedBoard === board.id ? site.theme.linkVisited : site.theme.link }}
            >
              {board.id}
            </button>
          </span>
        ))}
        <span className="font-bold ml-2" style={{ color: site.theme.text }}> ]</span>
      </nav>

      {/* Board Info */}
      {selectedBoard && !selectedThread && (
        <div
          className="text-center py-4 px-4"
          style={{ background: site.theme.surface, borderBottom: `1px solid ${site.theme.border}` }}
        >
          <h2 className="text-xl font-bold" style={{ color: site.theme.boardTitle }}>
            /{selectedBoard}/ - {BOARDS.find(b => b.id === selectedBoard)?.name}
          </h2>
          <p className="text-sm italic" style={{ color: site.theme.textMuted }}>
            {BOARDS.find(b => b.id === selectedBoard)?.description}
          </p>
        </div>
      )}

      {/* Content */}
      <main className="p-4 max-w-4xl mx-auto">
        {selectedThread ? (
          <ThreadView
            thread={selectedThread}
            onBack={() => setSelectedThread(null)}
          />
        ) : (
          <div className="space-y-4">
            {/* Post Form */}
            <div
              className="p-3 text-center"
              style={{ background: site.theme.surface, border: `1px solid ${site.theme.border}` }}
            >
              <div className="mb-2">
                <input
                  type="text"
                  placeholder="Name"
                  className="px-2 py-1 text-sm mr-2"
                  style={{
                    background: site.theme.inputBg,
                    border: `1px solid ${site.theme.border}`,
                    color: site.theme.text,
                  }}
                />
                <input
                  type="text"
                  placeholder="Subject"
                  className="px-2 py-1 text-sm"
                  style={{
                    background: site.theme.inputBg,
                    border: `1px solid ${site.theme.border}`,
                    color: site.theme.text,
                  }}
                />
              </div>
              <div className="mb-2">
                <textarea
                  placeholder="Comment"
                  rows={4}
                  className="w-full max-w-md px-2 py-1 text-sm resize-none"
                  style={{
                    background: site.theme.inputBg,
                    border: `1px solid ${site.theme.border}`,
                    color: site.theme.text,
                  }}
                />
              </div>
              <button
                className="px-4 py-1 text-sm"
                style={{
                  background: site.theme.buttonBg,
                  border: `1px solid ${site.theme.border}`,
                  color: site.theme.text,
                }}
              >
                Post
              </button>
            </div>

            <hr style={{ borderColor: site.theme.border }} />

            {/* Thread List */}
            {displayedThreads.map((thread) => (
              <ThreadPreview
                key={thread.id}
                thread={thread}
                onClick={() => setSelectedThread(thread)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Sketchy Ads */}
      <div className="max-w-4xl mx-auto px-4 pb-4">
        <SidebarAdWidget
          siteId="forchan"
          onNavigate={onNavigate}
          title="Ads"
          count={2}
        />
      </div>

      {/* Footer */}
      <footer
        className="text-center py-4 text-xs"
        style={{ color: site.theme.textMuted, borderTop: `1px solid ${site.theme.border}` }}
      >
        <p>All content is fictional. All trademarks belong to their respective owners.</p>
        <p className="mt-1">
          <button className="hover:underline" style={{ color: site.theme.link }}>FAQ</button>
          {' | '}
          <button className="hover:underline" style={{ color: site.theme.link }}>Rules</button>
          {' | '}
          <button className="hover:underline" style={{ color: site.theme.link }}>Contact</button>
        </p>
      </footer>
    </div>
  )
}

// ============================================================================
// Thread Preview Component
// ============================================================================

interface ThreadPreviewProps {
  thread: Thread
  onClick: () => void
}

function ThreadPreview({ thread, onClick }: ThreadPreviewProps) {
  return (
    <div
      className="p-3"
      style={{ background: site.theme.postBg, border: `1px solid ${site.theme.border}` }}
    >
      {/* Thread Header */}
      <div className="flex flex-wrap items-center gap-2 text-sm mb-2">
        {thread.sticky && (
          <span className="px-1 text-xs font-bold" style={{ color: site.theme.sticky }}>
            📌 Sticky
          </span>
        )}
        {thread.locked && (
          <span className="px-1 text-xs font-bold" style={{ color: site.theme.locked }}>
            🔒 Locked
          </span>
        )}
        {thread.subject && (
          <span className="font-bold" style={{ color: site.theme.subject }}>
            {thread.subject}
          </span>
        )}
        <span style={{ color: thread.tripcode ? site.theme.tripcode : site.theme.name }}>
          {thread.name || 'Anonymous'}
          {thread.tripcode && <span className="ml-1">{thread.tripcode}</span>}
        </span>
        <span style={{ color: site.theme.textMuted }}>
          {thread.timestamp}
        </span>
        <span style={{ color: site.theme.postId }}>
          No.{thread.id}
        </span>
        <button
          onClick={onClick}
          className="hover:underline"
          style={{ color: site.theme.link }}
        >
          [Reply]
        </button>
      </div>

      {/* Thread Content */}
      <div className="flex gap-3">
        {thread.image && (
          <div
            className="w-32 h-32 flex-shrink-0 flex items-center justify-center text-4xl"
            style={{ background: site.theme.thumbnailBg }}
          >
            {thread.image}
          </div>
        )}
        <div className="flex-1">
          <PostContent content={thread.content} />
          <p className="mt-2 text-sm" style={{ color: site.theme.textMuted }}>
            {thread.replies.length} replies
          </p>
        </div>
      </div>

      {/* Preview of last 2 replies */}
      {thread.replies.length > 0 && (
        <div className="mt-3 space-y-2 border-l-2 pl-3" style={{ borderColor: site.theme.border }}>
          {thread.replies.slice(-2).map((reply) => (
            <div key={reply.id} className="text-sm">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span style={{ color: reply.tripcode ? site.theme.tripcode : site.theme.name }}>
                  {reply.name || 'Anonymous'}
                  {reply.tripcode && <span className="ml-1">{reply.tripcode}</span>}
                </span>
                <span style={{ color: site.theme.textMuted }}>{reply.timestamp}</span>
                <span style={{ color: site.theme.postId }}>No.{reply.id}</span>
              </div>
              <PostContent content={reply.content.slice(0, 150) + (reply.content.length > 150 ? '...' : '')} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================================================
// Thread View Component
// ============================================================================

interface ThreadViewProps {
  thread: Thread
  onBack: () => void
}

function ThreadView({ thread, onBack }: ThreadViewProps) {
  return (
    <div>
      <button
        onClick={onBack}
        className="mb-4 text-sm hover:underline"
        style={{ color: site.theme.link }}
      >
        [Return] [Catalog]
      </button>

      {/* OP Post */}
      <div
        className="p-3 mb-4"
        style={{ background: site.theme.postBg, border: `1px solid ${site.theme.border}` }}
      >
        <div className="flex flex-wrap items-center gap-2 text-sm mb-2">
          {thread.sticky && (
            <span className="px-1 text-xs font-bold" style={{ color: site.theme.sticky }}>
              📌 Sticky
            </span>
          )}
          {thread.subject && (
            <span className="font-bold" style={{ color: site.theme.subject }}>
              {thread.subject}
            </span>
          )}
          <span style={{ color: thread.tripcode ? site.theme.tripcode : site.theme.name }}>
            {thread.name || 'Anonymous'}
            {thread.tripcode && <span className="ml-1">{thread.tripcode}</span>}
          </span>
          <span style={{ color: site.theme.textMuted }}>
            {thread.timestamp}
          </span>
          <span style={{ color: site.theme.postId }}>
            No.{thread.id}
          </span>
        </div>

        <div className="flex gap-3">
          {thread.image && (
            <div
              className="w-48 h-48 flex-shrink-0 flex items-center justify-center text-6xl cursor-pointer hover:opacity-80"
              style={{ background: site.theme.thumbnailBg }}
            >
              {thread.image}
            </div>
          )}
          <div className="flex-1">
            <PostContent content={thread.content} />
          </div>
        </div>
      </div>

      {/* Reply Form */}
      <div
        className="p-3 mb-4 text-center"
        style={{ background: site.theme.surface, border: `1px solid ${site.theme.border}` }}
      >
        <div className="mb-2">
          <input
            type="text"
            placeholder="Name"
            className="px-2 py-1 text-sm mr-2"
            style={{
              background: site.theme.inputBg,
              border: `1px solid ${site.theme.border}`,
              color: site.theme.text,
            }}
          />
        </div>
        <div className="mb-2">
          <textarea
            placeholder="Comment"
            rows={3}
            className="w-full max-w-md px-2 py-1 text-sm resize-none"
            style={{
              background: site.theme.inputBg,
              border: `1px solid ${site.theme.border}`,
              color: site.theme.text,
            }}
          />
        </div>
        <button
          className="px-4 py-1 text-sm"
          style={{
            background: site.theme.buttonBg,
            border: `1px solid ${site.theme.border}`,
            color: site.theme.text,
          }}
        >
          Post Reply
        </button>
      </div>

      {/* Replies */}
      <div className="space-y-2">
        {thread.replies.map((reply) => (
          <ReplyPost key={reply.id} reply={reply} />
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// Reply Post Component
// ============================================================================

interface ReplyPostProps {
  reply: Reply
}

function ReplyPost({ reply }: ReplyPostProps) {
  return (
    <div
      className="p-3"
      style={{ background: site.theme.replyBg, border: `1px solid ${site.theme.border}` }}
    >
      <div className="flex flex-wrap items-center gap-2 text-sm mb-2">
        <span style={{ color: reply.tripcode ? site.theme.tripcode : site.theme.name }}>
          {reply.name || 'Anonymous'}
          {reply.tripcode && <span className="ml-1">{reply.tripcode}</span>}
        </span>
        <span style={{ color: site.theme.textMuted }}>
          {reply.timestamp}
        </span>
        <span style={{ color: site.theme.postId }}>
          No.{reply.id}
        </span>
      </div>

      <div className="flex gap-3">
        {reply.image && (
          <div
            className="w-32 h-32 flex-shrink-0 flex items-center justify-center text-4xl cursor-pointer hover:opacity-80"
            style={{ background: site.theme.thumbnailBg }}
          >
            {reply.image}
          </div>
        )}
        <div className="flex-1">
          <PostContent content={reply.content} />
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Post Content Component (handles greentext and quotes)
// ============================================================================

interface PostContentProps {
  content: string
}

function PostContent({ content }: PostContentProps) {
  const lines = content.split('\n')

  return (
    <div className="text-sm whitespace-pre-wrap" style={{ color: site.theme.text }}>
      {lines.map((line, i) => {
        // Quote link (>>number)
        const quoteMatch = line.match(/^(>>\d+)(.*)/)
        if (quoteMatch) {
          return (
            <p key={i}>
              <span
                className="hover:underline cursor-pointer"
                style={{ color: site.theme.quoteLink }}
              >
                {quoteMatch[1]}
              </span>
              <span>{quoteMatch[2]}</span>
            </p>
          )
        }

        // Greentext (>text but not >>)
        if (line.startsWith('>') && !line.startsWith('>>')) {
          return (
            <p key={i} style={{ color: site.theme.greentext }}>
              {line}
            </p>
          )
        }

        // Regular text
        return <p key={i}>{line}</p>
      })}
    </div>
  )
}

export default ForChanSite
