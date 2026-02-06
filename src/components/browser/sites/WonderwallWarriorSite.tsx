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

  const { content: dbContent } = useSiteContent('blogs', { channelId: 'wonderwall' })
  const posts = useMemo(() => dbContent.map(dbToBlogPost), [dbContent])

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
