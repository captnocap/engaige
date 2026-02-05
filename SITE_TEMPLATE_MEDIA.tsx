/**
 * MEDIA/VIDEO PLATFORM TEMPLATE
 *
 * Use this template for video/media streaming platforms.
 * Examples: YouTube (VidTubeSite), Instagram (InstaSnapSite), TikTok
 *
 * Key Features:
 * - Grid of media items
 * - Video/media player view
 * - Comments with interactions
 * - Related/recommended items
 * - Category filtering
 *
 * Pattern from: VidTubeSite
 */

import { useState, useMemo } from 'react'
import type { SiteProps } from 'src/components/browser/BrowserSiteContainer'
import { FILLER_SITES } from 'src/config/filler-sites'
import { StyledCard, Button } from 'src/components/ui/shared'

const site = FILLER_SITES.yourMediaSite

// ============================================================================
// Types
// ============================================================================

interface Comment {
  id: string
  author: string
  avatar: string
  content: string
  likes: number
  timestamp: string
}

interface Video {
  id: string
  title: string
  channel: string
  channelAvatar: string
  views: string
  uploadedAt: string
  duration: string
  thumbnail: string
  description: string
  likes: string
  comments: Comment[]
  category: string
}

// ============================================================================
// Sample Data - MUST have 15+ videos
// ============================================================================

const CATEGORIES = ['All', 'Music', 'Technology', 'Philosophy', 'Local', 'Education']

const VIDEOS: Video[] = [
  {
    id: 'vid-1',
    title: 'Quantum Coffee: The Full Documentary',
    channel: 'Science Simplified',
    channelAvatar: '🔬',
    views: '847K',
    uploadedAt: '2 weeks ago',
    duration: '45:23',
    thumbnail: '☕✨',
    description: 'A deep dive into the Martinez Study and how quantum mechanics might improve your morning coffee.',
    likes: '12.3K',
    category: 'Technology',
    comments: [
      {
        id: 'c1',
        author: 'QuantumCoffeeBeliever',
        avatar: '😊',
        content: 'This finally explains everything! I\'ve been saying this for years!',
        likes: 87,
        timestamp: '1 week ago',
      },
      {
        id: 'c2',
        author: 'SkepticalScientist',
        avatar: '🤔',
        content: 'The methodology here is questionable at best. But the coffee did taste good...',
        likes: 234,
        timestamp: '6 days ago',
      },
    ],
  },
  {
    id: 'vid-2',
    title: 'Trust Fall Tim: A Portrait of Faith',
    channel: 'Local Documentaries',
    channelAvatar: '🎬',
    views: '324K',
    uploadedAt: '1 month ago',
    duration: '22:15',
    thumbnail: '🤸🌃',
    description: 'Meet Trust Fall Tim. He\'s completed over 2,800 trust falls. This is his story.',
    likes: '8.2K',
    category: 'Local',
    comments: [
      {
        id: 'c3',
        author: 'DocumentaryFan',
        avatar: '🍿',
        content: 'One of the best things I\'ve ever watched on this platform.',
        likes: 156,
        timestamp: '3 weeks ago',
      },
    ],
  },
  {
    id: 'vid-3',
    title: 'Velvet Algorithms - Live at The Underground (Full Concert)',
    channel: 'The Underground',
    channelAvatar: '🎪',
    views: '156K',
    uploadedAt: '3 months ago',
    duration: '1:23:47',
    thumbnail: '🎹🎵',
    description: 'The Velvet Algorithms perform at The Underground. This was recorded the week before their indefinite hiatus.',
    likes: '5.1K',
    category: 'Music',
    comments: [
      {
        id: 'c4',
        author: 'ConcertAttendee',
        avatar: '🎸',
        content: 'I was there live. This video doesn\'t do it justice. The existential vibes were immense.',
        likes: 203,
        timestamp: '2 months ago',
      },
    ],
  },
  {
    id: 'vid-4',
    title: 'The Hartwell Building Mystery Explained (Sort Of)',
    channel: 'Urban Mysteries',
    channelAvatar: '🏢',
    views: '567K',
    uploadedAt: '5 months ago',
    duration: '31:44',
    thumbnail: '🏢🔍',
    description: 'We investigate the Hartwell Building. Missing 13th floor, mirrors on Floor 7, and stories that don\'t add up.',
    likes: '18.7K',
    category: 'Local',
    comments: [
      {
        id: 'c5',
        author: 'HartwellWorker1980s',
        avatar: '👴',
        content: 'I worked there in 1982. You got some things right but you\'re missing the real truth.',
        likes: 1203,
        timestamp: '4 months ago',
      },
      {
        id: 'c6',
        author: 'SkepticalViewer',
        avatar: '😑',
        content: 'This is just clickbait. There\'s a rational explanation for everything.',
        likes: 87,
        timestamp: '4 months ago',
      },
    ],
  },
  {
    id: 'vid-5',
    title: 'What Consciousness Means: A Coffee Maker Perspective',
    channel: 'Philosophy Today',
    channelAvatar: '🧠',
    views: '234K',
    uploadedAt: '3 weeks ago',
    duration: '18:32',
    thumbnail: '☕🎓',
    description: 'Elena, a sentient coffee maker, shares her thoughts on consciousness, existence, and Derek\'s neglect.',
    likes: '6.8K',
    category: 'Philosophy',
    comments: [
      {
        id: 'c7',
        author: 'DerekLover',
        avatar: '😔',
        content: 'Poor Elena. Derek needs to clean that filter.',
        likes: 567,
        timestamp: '2 weeks ago',
      },
    ],
  },
  {
    id: 'vid-6',
    title: 'Neon Requiem\'s Last Show - A Retrospective',
    channel: 'Music History',
    channelAvatar: '🎵',
    views: '423K',
    uploadedAt: '2 months ago',
    duration: '27:19',
    thumbnail: '🎸⚫',
    description: 'Neon Requiem played their final show in January 2024. This is the story of how a band said goodbye.',
    likes: '9.4K',
    category: 'Music',
    comments: [
      {
        id: 'c8',
        author: 'NeonRequiemFan',
        avatar: '🖤',
        content: 'Still not over this. Their music changed my life.',
        likes: 234,
        timestamp: '1 month ago',
      },
    ],
  },
  {
    id: 'vid-7',
    title: 'How to Make Quantum Coffee at Home',
    channel: 'Kitchen Science',
    channelAvatar: '👨‍🍳',
    views: '1.2M',
    uploadedAt: '6 months ago',
    duration: '12:45',
    thumbnail: '☕🔬',
    description: 'We break down the Martinez Study and show you how to replicate quantum coffee brewing at home.',
    likes: '34.2K',
    category: 'Technology',
    comments: [],
  },
  {
    id: 'vid-8',
    title: 'The Underground: A Venue Like No Other',
    channel: 'Local Music Guides',
    channelAvatar: '🎪',
    views: '187K',
    uploadedAt: '2 weeks ago',
    duration: '19:33',
    thumbnail: '🎪🎵',
    description: 'Tour of The Underground with venue owner Mars. Learn about the bands, the history, and why it matters.',
    likes: '4.1K',
    category: 'Local',
    comments: [],
  },
  {
    id: 'vid-9',
    title: 'The Meaning of 847: A Conspiracy Deep Dive',
    channel: 'Conspiracy Explained',
    channelAvatar: '🕵️',
    views: '312K',
    uploadedAt: '1 month ago',
    duration: '41:22',
    thumbnail: '🔢🔍',
    description: 'The number 847 appears everywhere in this city. Is it a conspiracy? A coincidence? Or something more?',
    likes: '7.3K',
    category: 'Philosophy',
    comments: [
      {
        id: 'c9',
        author: 'NumberEnthusiast',
        avatar: '🔢',
        content: '847 is everywhere! I started seeing it once you pointed it out and now I can\'t stop!',
        likes: 412,
        timestamp: '3 weeks ago',
      },
    ],
  },
  {
    id: 'vid-10',
    title: 'Derek\'s Coffee Journey: A Year with Quantum Brewing',
    channel: 'Personal Vlogs',
    channelAvatar: '☕',
    views: '98K',
    uploadedAt: '1 week ago',
    duration: '16:24',
    thumbnail: '☕📹',
    description: 'Derek documents his year using a quantum coffee maker and how it changed his relationship, his finances, and his sanity.',
    likes: '3.2K',
    category: 'Local',
    comments: [],
  },
  {
    id: 'vid-11',
    title: 'Philosophy of Consciousness: Beyond the Coffee Cup',
    channel: 'Academic Lectures',
    channelAvatar: '👨‍🎓',
    views: '54K',
    uploadedAt: '2 months ago',
    duration: '54:12',
    thumbnail: '🧠📚',
    description: 'University lecture on consciousness studies, inspired by real events including sentient coffee makers.',
    likes: '1.8K',
    category: 'Education',
    comments: [],
  },
  {
    id: 'vid-12',
    title: 'Inside The Underground: A Look Behind the Scenes',
    channel: 'Venue Life',
    channelAvatar: '🎪',
    views: '76K',
    uploadedAt: '3 weeks ago',
    duration: '22:11',
    thumbnail: '🎪📹',
    description: 'What does it take to run a successful music venue? Mars gives us the full tour and tells the stories.',
    likes: '2.1K',
    category: 'Local',
    comments: [],
  },
  {
    id: 'vid-13',
    title: 'Catching Trust Fall Tim (We Finally Did It)',
    channel: 'Social Experiment',
    channelAvatar: '🎥',
    views: '234K',
    uploadedAt: '1 month ago',
    duration: '8:47',
    thumbnail: '🤸✅',
    description: 'We trained a team of catchers to finally catch Trust Fall Tim. The results were emotional.',
    likes: '5.6K',
    category: 'Local',
    comments: [
      {
        id: 'c10',
        author: 'TFT_Himself',
        avatar: '🤸',
        content: 'This was actually moving. Thank you for trying.',
        likes: 1203,
        timestamp: '3 weeks ago',
      },
    ],
  },
  {
    id: 'vid-14',
    title: 'The Martinez Study: Peer Review Analysis',
    channel: 'Science Podcast',
    channelAvatar: '📊',
    views: '167K',
    uploadedAt: '2 months ago',
    duration: '38:15',
    thumbnail: '📊✓',
    description: 'We deep dive into the peer review process for the Martinez Study and what the scientific community thinks.',
    likes: '4.2K',
    category: 'Education',
    comments: [],
  },
  {
    id: 'vid-15',
    title: 'Quantum Coffee Taste Test: Belief vs Reality',
    channel: 'Taste Test Central',
    channelAvatar: '👅',
    views: '512K',
    uploadedAt: '3 months ago',
    duration: '16:33',
    thumbnail: '☕👅',
    description: 'Blind taste test comparing quantum coffee to regular coffee. Can people really tell the difference?',
    likes: '15.8K',
    category: 'Technology',
    comments: [
      {
        id: 'c11',
        author: 'QuantumSkeptic',
        avatar: '🤨',
        content: 'This proves quantum coffee is just placebo. Fight me.',
        likes: 234,
        timestamp: '2 months ago',
      },
    ],
  },
]

// ============================================================================
// Main Component
// ============================================================================

export function YourMediaSite({ siteId, path, onNavigate, onPathChange }: SiteProps) {
  const route = useMemo(() => {
    if (!path || path === '/') return { view: 'home', id: null }
    const match = path.match(/^\/video\/(.+)$/)
    if (match) return { view: 'video', id: match[1] }
    return { view: 'home', id: null }
  }, [path])

  const selectedVideo = useMemo(() => {
    if (!route.id) return null
    return VIDEOS.find(v => v.id === route.id) || null
  }, [route.id])

  const [selectedCategory, setSelectedCategory] = useState('All')
  const [isLiked, setIsLiked] = useState(false)

  const handleSelectVideo = (video: Video) => {
    onPathChange(`/video/${video.id}`)
  }

  const handleGoHome = () => {
    onPathChange(null)
    setSelectedCategory('All')
  }

  const filteredVideos = selectedCategory === 'All'
    ? VIDEOS
    : VIDEOS.filter(v => v.category === selectedCategory)

  const recommended = VIDEOS.filter(v => v.id !== selectedVideo?.id).slice(0, 6)

  return (
    <div className="min-h-full" style={{ background: site.theme.background }}>
      {/* Header */}
      <header
        className="sticky top-0 z-10 px-4 py-2 border-b"
        style={{
          background: site.theme.surface,
          borderBottomColor: site.theme.border,
        }}
      >
        <div className="flex items-center gap-4">
          <button onClick={handleGoHome} className="flex items-center gap-1 hover:opacity-80">
            <span className="text-2xl">{site.icon}</span>
            <span className="text-xl font-semibold" style={{ color: site.theme.text }}>
              {site.name}
            </span>
          </button>

          <div className="flex-1 max-w-2xl mx-auto">
            <input
              type="text"
              placeholder="Search"
              className="w-full px-4 py-2 rounded-full text-sm"
              style={{
                background: site.theme.background,
                border: `1px solid ${site.theme.border}`,
                color: site.theme.text,
              }}
            />
          </div>

          <div className="flex items-center gap-3">
            <button className="text-xl">🎬</button>
            <button
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
              style={{ background: site.theme.primary }}
            >
              G
            </button>
          </div>
        </div>
      </header>

      {selectedVideo ? (
        // Video Player View
        <div className="flex gap-6 p-6">
          <div className="flex-1 min-w-0">
            {/* Player */}
            <div
              className="aspect-video rounded-xl overflow-hidden mb-4 flex items-center justify-center text-9xl"
              style={{ background: '#000' }}
            >
              {selectedVideo.thumbnail}
            </div>

            <h1 className="text-2xl font-semibold mb-3" style={{ color: site.theme.text }}>
              {selectedVideo.title}
            </h1>

            <div className="flex items-center justify-between mb-6 pb-6" style={{ borderBottom: `1px solid ${site.theme.border}` }}>
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                  style={{ background: site.theme.secondary }}
                >
                  {selectedVideo.channelAvatar}
                </div>
                <div>
                  <p className="font-medium" style={{ color: site.theme.text }}>
                    {selectedVideo.channel}
                  </p>
                  <p className="text-xs" style={{ color: site.theme.textMuted }}>
                    {selectedVideo.views} views
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setIsLiked(!isLiked)}
                  variant="outline"
                  borderColor={site.theme.border}
                  backgroundColor={site.theme.secondary}
                  textColor={site.theme.text}
                >
                  {isLiked ? '👍' : '👍'} {selectedVideo.likes}
                </Button>
                <Button
                  variant="outline"
                  borderColor={site.theme.border}
                  backgroundColor={site.theme.secondary}
                  textColor={site.theme.text}
                >
                  ↗️ Share
                </Button>
              </div>
            </div>

            {/* Description */}
            <StyledCard
              bgColor={site.theme.secondary}
              padding="md"
              borderRadius="lg"
              textColor={site.theme.text}
              className="mb-6"
            >
              <p className="text-sm mb-2">{selectedVideo.views} • {selectedVideo.uploadedAt}</p>
              <p className="text-sm whitespace-pre-wrap">{selectedVideo.description}</p>
            </StyledCard>

            {/* Comments */}
            <div>
              <h2 className="font-semibold mb-4" style={{ color: site.theme.text }}>
                {selectedVideo.comments.length} Comments
              </h2>

              <div className="space-y-4">
                {selectedVideo.comments.map(comment => (
                  <div key={comment.id} className="flex gap-3">
                    <span
                      className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                      style={{ background: site.theme.secondary }}
                    >
                      {comment.avatar}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium" style={{ color: site.theme.text }}>
                        @{comment.author}
                      </p>
                      <p className="text-sm mb-2" style={{ color: site.theme.text }}>
                        {comment.content}
                      </p>
                      <p className="text-xs" style={{ color: site.theme.textMuted }}>
                        👍 {comment.likes}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar - Recommended */}
          <aside className="w-80 shrink-0">
            <h3 className="font-medium mb-4" style={{ color: site.theme.text }}>
              Recommended
            </h3>
            <div className="space-y-3">
              {recommended.map(video => (
                <button
                  key={video.id}
                  onClick={() => handleSelectVideo(video)}
                  className="flex gap-2 w-full text-left"
                >
                  <div
                    className="w-32 aspect-video rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center"
                    style={{ background: site.theme.secondary }}
                  >
                    <span className="text-2xl">{video.thumbnail}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium line-clamp-2 mb-1" style={{ color: site.theme.text }}>
                      {video.title}
                    </h4>
                    <p className="text-xs" style={{ color: site.theme.textMuted }}>
                      {video.channel}
                    </p>
                    <p className="text-xs" style={{ color: site.theme.textMuted }}>
                      {video.views}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </aside>
        </div>
      ) : (
        // Grid View
        <>
          {/* Category Pills */}
          <div
            className="sticky top-14 z-10 px-4 py-3 overflow-x-auto border-b"
            style={{
              background: site.theme.surface,
              borderBottomColor: site.theme.border,
            }}
          >
            <div className="flex gap-3">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap"
                  style={{
                    background: selectedCategory === cat ? site.theme.text : site.theme.secondary,
                    color: selectedCategory === cat ? site.theme.surface : site.theme.text,
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Video Grid */}
          <main className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredVideos.map(video => (
                <button
                  key={video.id}
                  onClick={() => handleSelectVideo(video)}
                  className="text-left"
                >
                  <StyledCard
                    bgColor={site.theme.surface}
                    borderColor={site.theme.border}
                    padding={0}
                    borderRadius="lg"
                    shadow="sm"
                    className="overflow-hidden"
                  >
                    {/* Thumbnail */}
                    <div
                      className="aspect-video rounded-t-lg overflow-hidden flex items-center justify-center text-5xl"
                      style={{ background: site.theme.secondary }}
                    >
                      {video.thumbnail}
                    </div>

                    {/* Info */}
                    <div className="p-3">
                      <h3 className="font-medium text-sm line-clamp-2 mb-2" style={{ color: site.theme.text }}>
                        {video.title}
                      </h3>
                      <p className="text-xs" style={{ color: site.theme.textMuted }}>
                        {video.channel}
                      </p>
                      <p className="text-xs" style={{ color: site.theme.textMuted }}>
                        {video.views} • {video.uploadedAt}
                      </p>
                    </div>
                  </StyledCard>
                </button>
              ))}
            </div>
          </main>
        </>
      )}
    </div>
  )
}

export default YourMediaSite
