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

  const { content: dbContent } = useSiteContent('blogs', { channelId: 'floor13' })
  const posts = useMemo(() => dbContent.map(dbToBlogPost), [dbContent])

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
