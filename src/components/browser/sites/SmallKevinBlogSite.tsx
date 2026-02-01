/**
 * Small Kevin's Redemption Blog
 *
 * A sad, desperate blog by Kevin Smallwood (28) trying to rebuild his reputation
 * after The Incident of March 2022 where he failed to catch Trust Fall Tim.
 * Defensive, apologetic, pathetic. References bans, failed dates, CobCoin losses.
 *
 * URL: www.smallkevinredemption.corn
 * Aesthetic: Sad blue/grey with hints of desperation
 */

import { useState } from 'react'
import type { SiteProps } from '../BrowserSiteContainer.js'
import { FILLER_SITES } from '../../../config/filler-sites.js'
import { StyledCard, Button } from '../../ui/shared/index.js'

const site = FILLER_SITES.smallkevinblog

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
  comments?: number
  isControversial?: boolean
  isPinned?: boolean
}

const BLOG_POSTS: BlogPost[] = [
  {
    id: 'the-incident-truth',
    title: 'My Side of the Story: What REALLY Happened on March 15, 2022',
    date: 'March 15, 2023 (Anniversary Post)',
    excerpt: 'Everyone blames me for The Incident. But nobody was there. Nobody knows what it was like in that moment.',
    isPinned: true,
    readTime: '18 min read',
    comments: 847,
    content: [
      "Okay. I'm going to say this once, and I'm going to say it clearly. I did not intentionally drop Tim.",
      "On March 15, 2022, I was at the Westgate Mall food court. Tim was there with about 30 other people. He yelled \"TRUST FALL\" like he always does. I was positioned behind him. I was ready.",
      "Here's what happened: My phone was buzzing. I thought it was my mom. It wasn't. But in that split second when I looked down—just a microsecond—Tim fell.",
      "I reached out. I swear I did. My hands were there. But his momentum carried him past me. Past all of us. He hit the ground and I—I tried to catch him on the way down but he was already falling too fast.",
      "The mall security blamed me. The trust fall community blamed me. But here's the thing: I've caught Tim 847 times before. EIGHT. HUNDRED. FORTY. SEVEN. Times. One moment of distraction doesn't erase that.",
      'Except it does. One moment does erase all of that.',
      "I'm sorry, Tim. I say that every day, but I need you to know: it was an accident.",
    ],
    tags: ['the-incident', 'accountability', 'falling', 'regret', 'march-2022'],
  },
  {
    id: 'distracted-confession',
    title: 'I Was Distracted (A Confession)',
    date: 'May 3, 2022',
    excerpt: "The real reason I wasn't fully focused on Tim that day. I was checking CobCoin prices.",
    readTime: '8 min read',
    isControversial: true,
    comments: 1200,
    content: [
      "I promised myself I would never write this post. But I owe Tim the truth.",
      'When Tim yelled "TRUST FALL" at the food court, I was checking my CobCoin portfolio on my phone. Specifically, I was watching COBS crash from $47.23 to $23.60 in real-time.',
      "I had invested $8,470—my entire savings—at the top of the market. I was panic-selling.",
      "That's where my focus was. Not on Tim. Not on the 30 people around us. On a cryptocurrency that went to zero by 2023.",
      "If I had just ignored my phone. If I had just been PRESENT for one moment.",
      "But I wasn't. I was thinking about my money. About how stupid I was for buying into the hype. About how I would tell Big Kevin that I lost everything.",
      'And then Tim fell.',
      'The phone addiction destroyed my finances AND my reputation. Pretty sure I also lost a Corndr date because I was checking crypto prices during dinner. She said "you\'re not even looking at me" and she was right. I was looking at COBS at $3.20.',
      "This is my confession: I failed Tim because I was a distracted, greedy, broke 27-year-old man with a problem.",
    ],
    tags: ['cobcoin', 'distraction', 'confession', 'crypto-failure', 'regret'],
  },
  {
    id: 'big-kevin-silence',
    title: "Big Kevin Won't Talk to Me Anymore",
    date: 'July 22, 2022',
    excerpt: 'My only friend has cut me off. And I deserve it.',
    readTime: '12 min read',
    comments: 426,
    content: [
      "Big Kevin was my best friend. We met in high school. We did everything together.",
      'After The Incident, he sent one text: "We need some space right now."',
      'That was 4 months ago.',
      "I've called 47 times. I've texted 847 times (I counted). I emailed. I showed up at his house twice. He has a restraining order preventing me from coming within 100 feet of his residence.",
      'His mom still talks to me sometimes at the grocery store. She says he\'s "processing." She says he\'ll come around. She\'s being nice to me, which makes it worse.',
      'Big Kevin was the one person who believed in me. When nobody else in the trust fall community would work with me anymore, he said "hey, we\'re still friends, right?" I said yes. He believed me.',
      "And then I destroyed that trust by literally failing to catch his best friend.",
      "I understand why he's angry. I understand why he doesn't want to see me. I just wish he would take one of my calls. Just once.",
      "I saw him at the grocery store last week. He looked different—older, somehow. We made eye contact for about 3 seconds. He walked away.",
      "That 3 seconds of eye contact is the longest conversation we've had in 4 months.",
      "I miss my best friend.",
    ],
    tags: ['big-kevin', 'friendship', 'loss', 'isolation', 'betrayal'],
  },
  {
    id: 'medical-fund-donation',
    title: "I Donated $1 to Tim's Medical Fund (And I Feel Even Worse)",
    date: 'September 10, 2022',
    excerpt: 'My pathetic attempt at redemption and why it changed nothing.',
    readTime: '6 min read',
    comments: 234,
    content: [
      "After Tim's hospital bills started circulating on ForChan, someone set up a medical fund.",
      'It had raised about $4,700 when I added my contribution: $1.',
      "A single dollar. That's what I could afford after losing my life savings to CobCoin.",
      "I thought maybe—just maybe—if Tim saw my name on that list, he would know I cared. That I wanted to help. That I was sorry.",
      'His response on his ForChan thread (before he stopped posting): "Who is this Kevin Smallwood? $1? That\'s insulting."',
      'He was right. It was insulting.',
      'Big Kevin texted his mom, who texted my sister, who texted me: "Tim doesn\'t want Small Kevin\'s money."',
      'I was humiliated. But also: I deserved to be.',
      "The $1 sits in Tim's medical fund like a monument to my failure. A permanent record of how sorry I'm not enough to actually help.",
      "If I ever get back on my feet financially, I'm donating $10,000 to that fund anonymously. But right now, I'm broke and pathetic and all I can offer is a single, insulting dollar.",
      "That's the story of my life now.",
    ],
    tags: ['guilt', 'charity', 'failure', 'humiliation', 'broke'],
  },
  {
    id: 'underground-mustache',
    title: 'Why I Infiltrated The Underground in a Fake Mustache',
    date: 'November 2, 2023',
    excerpt: "What was I even trying to do? I still don't know.",
    readTime: '7 min read',
    isControversial: true,
    comments: 1847,
    content: [
      'The Underground is the venue where all the trust fall community hangs out. They banned me after The Incident.',
      "Mars, the owner, said I wasn't welcome. Period. End of discussion.",
      'Last month, I put on a fake mustache and tried to get in.',
      'Yeah. I know. Stupid.',
      "I bought the mustache from a costume shop for $8.47 (I remember because I almost didn't have enough money). I wore a hoodie. I kept my head down. I thought maybe I could just... sit in the corner. Listen to some music. Feel like I was part of something again.",
      'Mars recognized me within 30 seconds.',
      "I didn't even make it to the bar.",
      "He called security. I left without any trouble, but I could feel everyone's eyes on me as I walked out. The fake mustache fell off halfway to the door.",
      "I drove home and cried in my car for an hour.",
      "What was I trying to prove? That I could fool people? That I could fake my way back into community? That I could pretend The Incident never happened?",
      "It didn't work. It never will.",
      "I'm banned from The Underground, and I deserve to be.",
    ],
    tags: ['the-underground', 'infiltration', 'desperation', 'humiliation', 'ban'],
  },
  {
    id: 'linkedcorn-blocked',
    title: 'Tim Blocked Me on LinkedCorn: Professional Consequences',
    date: 'January 8, 2024',
    excerpt: "Even my career can't escape The Incident.",
    readTime: '5 min read',
    comments: 203,
    content: [
      'I tried to reach out to Tim on LinkedCorn, thinking a more "professional" platform might be the right place for an actual apology.',
      'I sent him a message: "Tim, I know I\'m the last person you want to hear from, but I wanted to reconnect professionally and personally. I\'m trying to rebuild."',
      'That message was on read for 3 minutes.',
      'Then I got a notification: "Trust Fall Tim has blocked you on LinkedCorn."',
      "My profile still exists. Everyone can see that I've been blocked. It's permanent documentation of my failure, right there on my professional network.",
      'Now when people search my name on LinkedCorn, they see: "You have 47 connections." And one of them is probably thinking "why is Kevin Smallwood the guy who dropped the trust fall legend?"',
      "I even lost a job opportunity because of it. A startup was interested in hiring me (I don't know for what—they never specified). Then they must have searched my name, found the LinkedCorn block, Googled me, and the opportunity died.",
      'The HR person never responded to my follow-up email.',
      "The Incident doesn't just affect my personal relationships. It's affecting my career, my professional reputation, my future.",
      "I'm 28 years old and I will never escape this.",
    ],
    tags: ['linkedcorn', 'professional', 'career', 'reputation', 'blocked'],
  },
  {
    id: 'training-arc',
    title: 'Practicing Alone: My Training Arc',
    date: 'February 14, 2024',
    excerpt: 'I\'m learning to catch again. By myself. In an empty gym.',
    readTime: '9 min read',
    comments: 156,
    content: [
      "For the past 3 months, I've been going to an empty gym on Monday evenings.",
      "I throw myself backwards off platforms. I practice positioning. I work on reaction time.",
      'I do this alone.',
      "No one knows about this. No one cares. But I do it anyway.",
      "Maybe it's pointless. Maybe I'm just torturing myself. Maybe no one will ever let me catch them again.",
      "But I'm getting better.",
      "I can now catch myself from 5 feet consistently. Six feet about 80% of the time. I'm working up to 7 feet, but I'm scared. That's how far Tim fell.",
      "I've been keeping logs. Just a notebook where I write down my attempts: the height, the conditions, whether I landed safely. I'm on page 847 of my training journal.",
      "847 attempts. Not anywhere near Tim's 2,847 falls, but it's something.",
      "I don't know what I'm training for. The community will never let me catch for them again. Big Kevin won't train with me. Tim will never let me near him.",
      "But maybe I'm not doing this for them. Maybe I'm doing this because I need to know that I'm not just the guy who failed. That I can be good at something.",
      'That I can catch people.',
      'Even if no one ever asks me to.',
    ],
    tags: ['training', 'redemption-attempt', 'isolation', 'perseverance', '847-reps'],
  },
  {
    id: 'open-letter-tim',
    title: 'An Open Letter to Trust Fall Tim',
    date: 'March 14, 2024',
    excerpt: "One year after. Everything I need to say, and nothing that will fix it.",
    readTime: '11 min read',
    comments: 576,
    content: [
      'Tim,',
      'Tomorrow is March 15th. One year to the day since The Incident.',
      "I don't expect you to read this. I don't expect you to care. But I'm writing it anyway.",
      "I've been thinking about what I want to say to you. I've written 847 different versions of this letter in my head. Deleted them all.",
      "Here's what I know:",
      "I failed you. Not just as a catcher, but as a person who claims to be part of the trust fall community. You trusted me—literally—and I let you down in the most public, humiliating way possible.",
      "I have thought about that moment every single day for 365 days. Sometimes multiple times per hour. Sometimes I wake up from dreams where I'm reaching for you, trying to catch you, always too slow.",
      "I lost my best friend because of what I did to you. I lost my place in the community. I lost my savings to a panic sell fueled by anxiety about what everyone thinks of me.",
      "I don't expect forgiveness. I don't deserve it.",
      "But I wanted you to know: I'm trying. I'm practicing alone in a gym. I'm reading about biomechanics and reaction time. I'm working on being better, even though no one will ever let me prove it.",
      "I wanted you to know that I'm sorry. Not the \"sorry I got caught\" kind. The \"sorry I fundamentally damaged something you care about\" kind.",
      "You've done 847 trust falls since The Incident. (I know because I follow your ForChan threads religiously, which is probably creepy, and I'm sorry about that too.)",
      "847 times you've fallen again. 847 times you've trusted people. That takes courage after what happened.",
      "I will spend the rest of my life wishing I could take back that moment. Wishing I had put my phone down. Wishing I had been present. Wishing I was the person you thought I was when you fell backwards into my arms that day.",
      "I'm sorry, Tim. I mean it. I mean it so much it hurts.",
      'Sincerely,',
      'Small Kevin (Kevin Smallwood)',
      "P.S. - I'm still training. I'm still trying. I don't know why. Maybe one day it will matter.",
    ],
    tags: ['tim', 'apology', 'anniversary', 'letter', 'heartfelt'],
  },
]

const ABOUT_TEXT = `Hi, I'm Kevin Smallwood. Everyone calls me Small Kevin (because of Big Kevin, my former best friend).

I am a 28-year-old man defined by one mistake.

On March 15, 2022, I failed to catch Trust Fall Tim at Westgate Mall. The "Incident" resulted in Tim's longest drop, a concussion, and my permanent exile from the trust fall community.

Since then, I have:
- Been banned from The Underground (the main venue)
- Lost my best friend, Big Kevin
- Made a $1 donation to Tim's medical fund (humiliating)
- Infiltrated a venue in a fake mustache
- Lost all my money to CobCoin
- Failed at multiple Corndr dates
- Been blocked on LinkedCorn
- Been permanently associated with failure

This blog is my attempt at redemption. It probably won't work. But I have to try.`

const SIDEBAR_QUOTES = [
  { quote: "The Incident wasn't my whole life", author: 'Small Kevin (delusional)' },
  { quote: 'I\'m still training', author: 'Small Kevin (alone, in a gym)' },
  { quote: "Big Kevin won't return my calls", author: 'Small Kevin (facts)' },
  { quote: 'CobCoin was a mistake', author: 'Small Kevin (tragic)' },
  { quote: '847 training reps and counting', author: 'Small Kevin (determined? desperate?)' },
]

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
      className="mb-4 cursor-pointer hover:shadow-lg transition-shadow"
      bgColor="#ffffff"
      borderColor="#cbd5e1"
      textColor="#1e293b"
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs text-slate-500">{post.date}</span>
        <div className="flex gap-2">
          {post.isPinned && (
            <span className="text-xs bg-slate-900 text-white px-2 py-0.5 rounded">
              📌 PINNED
            </span>
          )}
          {post.isControversial && (
            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
              ⚠️ CONTROVERSIAL
            </span>
          )}
        </div>
      </div>
      <h2 className="text-lg font-bold text-slate-900 mb-2 hover:text-slate-700">
        {post.title}
      </h2>
      <p className="text-sm text-slate-600 mb-3">{post.excerpt}</p>
      <div className="flex justify-between items-center text-xs text-slate-500">
        <span>📖 {post.readTime}</span>
        {post.comments && <span>💬 {post.comments} comments</span>}
      </div>
      <div className="flex flex-wrap gap-1 mt-2">
        {post.tags.slice(0, 3).map(tag => (
          <span key={tag} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
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
      borderColor="#cbd5e1"
      textColor="#1e293b"
    >
      <Button
        variant="link"
        size="sm"
        textColor="#64748b"
        onClick={onBack}
        className="mb-4"
      >
        ← Back to posts
      </Button>
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs text-slate-500">{post.date}</span>
        <div className="flex gap-2">
          {post.isPinned && (
            <span className="text-xs bg-slate-900 text-white px-2 py-0.5 rounded">
              📌 PINNED
            </span>
          )}
          {post.isControversial && (
            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
              ⚠️ CONTROVERSIAL
            </span>
          )}
        </div>
      </div>
      <h1 className="text-2xl font-bold text-slate-900 mb-4">{post.title}</h1>
      <div className="prose prose-slate max-w-none">
        {post.content.map((para, i) => (
          <p key={i} className="text-slate-700 mb-4 text-sm leading-relaxed whitespace-pre-wrap">
            {para}
          </p>
        ))}
      </div>
      <div className="mt-6 pt-4 border-t border-slate-200">
        <div className="flex flex-wrap gap-1">
          {post.tags.map(tag => (
            <span key={tag} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
              #{tag}
            </span>
          ))}
        </div>
      </div>
      {post.comments !== undefined && (
        <StyledCard
          variant="default"
          padding="md"
          borderRadius="sm"
          shadow="none"
          className="mt-4"
          bgColor="#f1f5f9"
          borderColor="#cbd5e1"
          textColor="#475569"
        >
          <p className="font-bold text-slate-700">💬 {post.comments} Comments</p>
          <p className="text-slate-600 text-xs mt-1">
            (Comments disabled. I can't handle more criticism right now.)
          </p>
        </StyledCard>
      )}
    </StyledCard>
  )
}

// ============================================================================
// Main Site
// ============================================================================

export function SmallKevinBlogSite({ siteId }: SiteProps) {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null)
  const [showAbout, setShowAbout] = useState(false)

  return (
    <div className="min-h-full" style={{ background: '#f8fafc' }}>
      {/* Header - Sad, defeated aesthetic */}
      <header className="bg-gradient-to-r from-slate-800 to-slate-700 text-white py-6 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">😔</span>
            <div>
              <h1 className="text-2xl font-bold">{site?.name || 'SmallKevinRedemption'}</h1>
              <p className="text-slate-300 text-sm italic">
                "Trying to Rebuild After One Terrible Moment" ™
              </p>
            </div>
          </div>
          <nav className="flex gap-4 mt-4 text-sm">
            <button
              onClick={() => {
                setSelectedPost(null)
                setShowAbout(false)
              }}
              className="text-slate-300 hover:text-white"
            >
              Home
            </button>
            <button
              onClick={() => {
                setSelectedPost(null)
                setShowAbout(true)
              }}
              className="text-slate-300 hover:text-white"
            >
              About Kevin
            </button>
            <button className="text-slate-300 hover:text-white">Contact (Blocked)</button>
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
                borderColor="#cbd5e1"
                textColor="#1e293b"
              >
                <h2 className="text-xl font-bold text-slate-900 mb-4">About Small Kevin</h2>
                <div className="flex gap-4 mb-4">
                  <div className="text-6xl">😔</div>
                  <div>
                    <p className="font-bold text-slate-800">Kevin Smallwood</p>
                    <p className="text-sm text-slate-600">Age 28, Former Catcher</p>
                    <p className="text-xs text-slate-500">Permanently Associated with Failure</p>
                  </div>
                </div>
                <div className="text-sm text-slate-700 whitespace-pre-line mb-4">
                  {ABOUT_TEXT}
                </div>
                <StyledCard
                  variant="default"
                  padding="md"
                  borderRadius="sm"
                  shadow="none"
                  bgColor="#eff6ff"
                  borderColor="#cbd5e1"
                  textColor="#1e40af"
                >
                  <p className="font-bold text-blue-900">📊 Life Stats</p>
                  <ul className="text-blue-800 text-xs mt-2">
                    <li>• Days since The Incident: 847 (ish)</li>
                    <li>• Trust falls caught before failure: 847+</li>
                    <li>• Trust falls caught after failure: 0</li>
                    <li>• CobCoin losses: $8,470</li>
                    <li>• Fake mustaches worn: 1</li>
                    <li>• Calls from Big Kevin: 0</li>
                    <li>• Training gym visits: 847</li>
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
                  bgColor="#fef2f2"
                  borderColor="#fecaca"
                  textColor="#7f1d1d"
                >
                  <p className="text-red-800 text-sm">
                    🚨 <strong>Latest:</strong> One year after The Incident. Still training. Still trying.
                    Still banned from The Underground.
                  </p>
                </StyledCard>
                {BLOG_POSTS.map(post => (
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
          <aside className="w-64 hidden md:block">
            {/* Newsletter */}
            <StyledCard
              variant="default"
              padding="md"
              borderRadius="md"
              shadow="md"
              className="mb-4"
              bgColor="#ffffff"
              borderColor="#cbd5e1"
              textColor="#1e293b"
            >
              <h3 className="font-bold text-slate-900 mb-2">📧 Newsletter</h3>
              <p className="text-xs text-slate-600 mb-2">
                Get updates on my failed redemption arc. (I have 0 subscribers.)
              </p>
              <input
                type="email"
                placeholder="your@email.com"
                className="w-full px-2 py-1 text-sm border border-slate-300 rounded mb-2"
              />
              <Button
                variant="primary"
                size="sm"
                width="full"
                backgroundColor="#64748b"
                textColor="#ffffff"
              >
                Subscribe
              </Button>
            </StyledCard>

            {/* Quotes */}
            <StyledCard
              variant="default"
              padding="md"
              borderRadius="md"
              shadow="md"
              className="mb-4"
              bgColor="#ffffff"
              borderColor="#cbd5e1"
              textColor="#1e293b"
            >
              <h3 className="font-bold text-slate-900 mb-2">💭 Quotes About Kevin</h3>
              <div className="space-y-3">
                {SIDEBAR_QUOTES.map((item, i) => (
                  <div key={i} className="text-xs">
                    <p className="text-slate-600 italic">"{item.quote}"</p>
                    <p className="text-slate-500 font-bold">— {item.author}</p>
                  </div>
                ))}
              </div>
            </StyledCard>

            {/* Training Log */}
            <StyledCard
              variant="default"
              padding="md"
              borderRadius="md"
              shadow="md"
              className="mb-4"
              bgColor="#ffffff"
              borderColor="#cbd5e1"
              textColor="#1e293b"
            >
              <h3 className="font-bold text-slate-900 mb-2">🏋️ Training Progress</h3>
              <div className="text-4xl text-center mb-2">🙆‍♂️</div>
              <p className="text-xs text-slate-600 text-center">
                <strong>847 solo attempts</strong>
              </p>
              <p className="text-xs text-slate-500 mt-2 italic">
                "Nobody's watching, but I'm getting better at something."
              </p>
              <div className="mt-2 bg-slate-100 rounded p-2">
                <p className="text-xs font-bold text-slate-700">Personal Records:</p>
                <ul className="text-xs text-slate-600 mt-1">
                  <li>• 5ft: Consistent</li>
                  <li>• 6ft: 80% success</li>
                  <li>• 7ft: Terrified</li>
                </ul>
              </div>
            </StyledCard>

            {/* Shame List */}
            <StyledCard
              variant="default"
              padding="md"
              borderRadius="md"
              shadow="md"
              bgColor="#fef2f2"
              borderColor="#fecaca"
              textColor="#7f1d1d"
            >
              <h3 className="font-bold text-red-900 mb-2">⛔ Places I'm Banned From</h3>
              <ul className="text-xs text-red-800 mt-2">
                <li>• The Underground (main venue)</li>
                <li>• Trust Fall Community events</li>
                <li>• Big Kevin's house (100ft radius)</li>
                <li>• Westgate Mall food court</li>
                <li>• Tim's LinkedIn (blocked)</li>
                <li>• Several Corndr profiles</li>
              </ul>
            </StyledCard>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-800 text-slate-300 py-4 px-4 text-center text-xs mt-8">
        <p>© 2024 {site?.name || 'SmallKevinRedemption'}. All rights reserved (except I have no rights).</p>
        <p className="mt-1">
          "Maybe one day someone will let me catch them again. But probably not."
        </p>
      </footer>
    </div>
  )
}

export default SmallKevinBlogSite
