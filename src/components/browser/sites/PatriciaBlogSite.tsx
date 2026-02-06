/**
 * Patricia's Workplace Blog
 *
 * Corporate HR wellness blog from Patricia at Omnicorp Holdings HR.
 * Increasingly unhinged hints that she knows way too much about the Hartwell Building.
 * She's been Employee of the Month for 847 consecutive months. Everything is fine.
 * Do not ask about Floor 13.
 */

import { useState, useMemo } from 'react'
import type { SiteProps } from '../BrowserSiteContainer.js'
import { useSiteContent, type SiteContentItem } from '../../../hooks/useSiteContent.js'
import { FILLER_SITES } from '../../../config/filler-sites.js'
import { StyledCard, Button } from '../../ui/shared/index.js'

const site = FILLER_SITES.patriciablog

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
  isSinister?: boolean
}

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
    isSinister: m.isSinister ?? m.is_sinister,
  }
}

const SIDEBAR_INFO = [
  { label: 'Current Floor', value: 'Unknown (Not 13)' },
  { label: 'Years at Omnicorp', value: '847+ (Time is weird)' },
  { label: 'Consecutive EOM Awards', value: '847 months' },
  { label: 'Voluntary Resignations Processed', value: '847' },
  { label: 'Clocks Removed from Floor 7', value: '14' },
  { label: 'Mirrors on Floor 7', value: 'Yes' },
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
      borderColor="#1e3a8a"
      textColor="#1e293b"
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs text-blue-600">{post.date}</span>
        {post.isSinister && (
          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded font-semibold">
            ⚠️ CONCERNING
          </span>
        )}
      </div>
      <h2 className="text-lg font-bold text-blue-900 mb-2 hover:text-blue-700">
        {post.title}
      </h2>
      <p className="text-sm text-gray-600 mb-3">{post.excerpt}</p>
      <div className="flex justify-between items-center text-xs text-gray-500">
        <span>{post.readTime}</span>
      </div>
      <div className="flex flex-wrap gap-1 mt-2">
        {post.tags.slice(0, 3).map(tag => (
          <span key={tag} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
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
      borderColor="#1e3a8a"
      textColor="#1e293b"
    >
      <Button
        variant="link"
        size="sm"
        textColor="#1e40af"
        onClick={onBack}
        className="mb-4"
      >
        ← Back to posts
      </Button>
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs text-blue-600">{post.date}</span>
        {post.isSinister && (
          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded font-semibold">
            ⚠️ CONCERNING
          </span>
        )}
      </div>
      <h1 className="text-2xl font-bold text-blue-900 mb-4">{post.title}</h1>
      <div className="prose prose-slate max-w-none">
        {post.content.map((para, i) => (
          <p key={i} className="text-gray-700 mb-4 text-sm leading-relaxed whitespace-pre-wrap">
            {para}
          </p>
        ))}
      </div>
      <div className="mt-6 pt-4 border-t border-blue-200">
        <div className="flex flex-wrap gap-1">
          {post.tags.map(tag => (
            <span key={tag} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </StyledCard>
  )
}

// ============================================================================
// Main Site
// ============================================================================

export function PatriciaBlogSite({ siteId }: SiteProps) {
  const { content: dbContent } = useSiteContent('blogs', { channelId: 'patricia' })

  const posts = useMemo(() => dbContent.map(dbToBlogPost), [dbContent])

  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null)
  const [showAbout, setShowAbout] = useState(false)

  return (
    <div className="min-h-full" style={{ background: '#f0f4f8' }}>
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-900 to-blue-800 text-white py-8 px-4 shadow-lg">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">👔</span>
            <div>
              <h1 className="text-3xl font-bold">Patricia's Workplace Blog</h1>
              <p className="text-blue-200 text-sm italic">
                "HR Excellence in the Hartwell Building" ™
              </p>
            </div>
          </div>
          <nav className="flex gap-6 mt-4 text-sm">
            <button
              onClick={() => { setSelectedPost(null); setShowAbout(false); }}
              className="text-blue-200 hover:text-white transition-colors"
            >
              Home
            </button>
            <button
              onClick={() => { setSelectedPost(null); setShowAbout(true); }}
              className="text-blue-200 hover:text-white transition-colors"
            >
              About Patricia
            </button>
            <button className="text-blue-200 hover:text-white transition-colors">Contact (Disabled)</button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-6">
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
                borderColor="#1e3a8a"
                textColor="#1e293b"
              >
                <h2 className="text-2xl font-bold text-blue-900 mb-4">About Patricia</h2>
                <div className="flex gap-4 mb-4">
                  <div className="text-6xl">👩‍💼</div>
                  <div>
                    <p className="font-bold text-blue-900">Patricia (Last Name Unknown)</p>
                    <p className="text-sm text-gray-600">HR Manager, Omnicorp Holdings</p>
                    <p className="text-xs text-gray-500">Hartwell Building, Unknown Floor</p>
                  </div>
                </div>
                <div className="text-sm text-gray-700 mb-6">
                  <p className="mb-3">
                    Patricia has worked at Omnicorp Holdings for 847 consecutive months (or is it years? time is different here). She is responsible for onboarding, offboarding, and the mysterious disappearances of employees.
                  </p>
                  <p className="mb-3">
                    When not processing voluntary resignations, Patricia enjoys: existing, not asking questions, and trying to remember what the outside world looked like.
                  </p>
                  <p>
                    Patricia is the all-time record holder for Employee of the Month with 847 consecutive awards. She does not know how this is possible. Neither do we.
                  </p>
                </div>

                <StyledCard
                  variant="default"
                  padding="md"
                  borderRadius="sm"
                  shadow="none"
                  className="mb-4"
                  bgColor="#e0e7ff"
                  borderColor="#818cf8"
                  textColor="#1e3a8a"
                >
                  <h3 className="font-bold text-blue-900 mb-3">📊 Patricia's Stats</h3>
                  <div className="space-y-2 text-sm">
                    {SIDEBAR_INFO.map((info, i) => (
                      <div key={i} className="flex justify-between">
                        <span className="font-medium">{info.label}:</span>
                        <span className="text-blue-700">{info.value}</span>
                      </div>
                    ))}
                  </div>
                </StyledCard>

                <StyledCard
                  variant="default"
                  padding="md"
                  borderRadius="sm"
                  shadow="none"
                  bgColor="#fef2f2"
                  borderColor="#fca5a5"
                  textColor="#7f1d1d"
                >
                  <p className="font-bold text-red-800 mb-2">⚠️ Warning</p>
                  <p className="text-xs text-red-700">
                    Patricia is fine. Everything at Omnicorp is fine. If you have concerns, please do not contact HR. There is no help available. There never was.
                  </p>
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
                  bgColor="#dbeafe"
                  borderColor="#3b82f6"
                  textColor="#1e3a8a"
                >
                  <p className="text-blue-900 text-sm font-semibold">
                    📌 <strong>Latest:</strong> Patricia continues her 847-month streak as Employee of the Month. Questions about how this is possible should not be asked.
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
            {/* Quick Links */}
            <StyledCard
              variant="default"
              padding="md"
              borderRadius="md"
              shadow="md"
              className="mb-4"
              bgColor="#ffffff"
              borderColor="#1e3a8a"
              textColor="#1e293b"
            >
              <h3 className="font-bold text-blue-900 mb-3">🔗 Quick Links</h3>
              <div className="space-y-2 text-sm">
                <a href="#" className="text-blue-600 hover:text-blue-800">Employee Handbook</a>
                <a href="#" className="text-blue-600 hover:text-blue-800">Benefits Guide</a>
                <a href="#" className="text-blue-600 hover:text-blue-800">Floor 13 FAQs</a>
                <a href="#" className="text-blue-600 hover:text-blue-800">Resignation Form</a>
                <a href="#" className="text-blue-600 hover:text-blue-800">Omnicorp Values</a>
              </div>
            </StyledCard>

            {/* Omnicorp Values */}
            <StyledCard
              variant="default"
              padding="md"
              borderRadius="md"
              shadow="md"
              className="mb-4"
              bgColor="#ffffff"
              borderColor="#1e3a8a"
              textColor="#1e293b"
            >
              <h3 className="font-bold text-blue-900 mb-3">🏢 Omnicorp Values</h3>
              <div className="space-y-2 text-xs text-gray-700">
                <p><strong>Integrity:</strong> We never lie. We simply don't remember.</p>
                <p><strong>Excellence:</strong> 847 consecutive months. Do not ask how.</p>
                <p><strong>Family:</strong> We are all family here. We cannot leave.</p>
                <p><strong>Innovation:</strong> We innovate new ways to hide truths.</p>
              </div>
            </StyledCard>

            {/* Recent Comments */}
            <StyledCard
              variant="default"
              padding="md"
              borderRadius="md"
              shadow="md"
              className="mb-4"
              bgColor="#f0fdf4"
              borderColor="#22c55e"
              textColor="#15803d"
            >
              <h3 className="font-bold text-green-900 mb-3">💬 Recent Comments</h3>
              <div className="space-y-3 text-xs">
                <div className="border-l-2 border-green-400 pl-2">
                  <p className="font-semibold text-green-800">Anonymous Employee</p>
                  <p className="text-green-700 mt-1">"I don't remember leaving."</p>
                </div>
                <div className="border-l-2 border-green-400 pl-2">
                  <p className="font-semibold text-green-800">Floor 7 Worker</p>
                  <p className="text-green-700 mt-1">"The mirrors... the mirrors showed me..."</p>
                </div>
                <div className="border-l-2 border-green-400 pl-2">
                  <p className="font-semibold text-green-800">New Hire</p>
                  <p className="text-green-700 mt-1">"When is orientation? Where am I?"</p>
                </div>
              </div>
            </StyledCard>

            {/* Office Directory */}
            <StyledCard
              variant="default"
              padding="md"
              borderRadius="md"
              shadow="md"
              className="mb-4"
              bgColor="#ffffff"
              borderColor="#1e3a8a"
              textColor="#1e293b"
            >
              <h3 className="font-bold text-blue-900 mb-3">📞 Directory</h3>
              <div className="space-y-2 text-xs">
                <p><strong>Patricia (HR):</strong> Always here</p>
                <p><strong>Maintenance:</strong> Unknown location</p>
                <p><strong>Security:</strong> Do not contact</p>
                <p><strong>Floor 13:</strong> Does not exist</p>
              </div>
            </StyledCard>

            {/* Compliance Notice */}
            <StyledCard
              variant="default"
              padding="md"
              borderRadius="md"
              shadow="md"
              bgColor="#fef2f2"
              borderColor="#fca5a5"
              textColor="#7f1d1d"
            >
              <h3 className="font-bold text-red-800 mb-2">⚠️ Compliance Notice</h3>
              <p className="text-xs text-red-700">
                This blog represents the official policies of Omnicorp Holdings. Reading these posts indicates acknowledgment and acceptance of all terms, including voluntary resignation to the Hartwell Building.
              </p>
            </StyledCard>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-blue-900 text-blue-200 py-6 px-4 text-center text-xs mt-12">
        <p>© 2025 Omnicorp Holdings. All rights reserved (Floor 13 excluded).</p>
        <p className="mt-2">
          Questions? {/* Contact Patricia */}
          <span className="text-red-400"> Do not ask questions.</span>
        </p>
        <p className="mt-2 text-blue-300">
          Patricia's Workplace is monitoring this site. Have you hugged your floor today?
        </p>
      </footer>
    </div>
  )
}

export default PatriciaBlogSite
