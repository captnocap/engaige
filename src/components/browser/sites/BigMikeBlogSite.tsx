/**
 * Big Mike from Tulsa Blog Site
 *
 * The mysterious Michael Cornwell's aggressively normal personal blog.
 * He's everywhere, it's just coincidence, and he'll explain why in excruciating detail.
 * Every post raises more questions than it answers.
 *
 * Aesthetic: Beige, default serif fonts, stock photos, unprompted denials, constant Tulsa references.
 * The number 847 appears frequently but Mike never acknowledges it.
 */

import { useState, useMemo } from 'react'
import type { SiteProps } from '../BrowserSiteContainer.js'
import { useSiteContent, type SiteContentItem } from '../../../hooks/useSiteContent.js'
import { FILLER_SITES } from '../../../config/filler-sites.js'
import { StyledCard, Button } from '../../ui/shared/index.js'

const site = FILLER_SITES.bigmikeblog

// ============================================================================
// Types & Data
// ============================================================================

interface BlogPost {
  id: string
  title: string
  date: string
  excerpt: string
  content: string[]
  readTime: string
  isControversial?: boolean
}

const BLOG_POSTS: BlogPost[] = [
  {
    id: 'just-regular-guy',
    title: 'Just a Regular Guy from Tulsa',
    date: 'January 28, 2026',
    excerpt:
      'My name is Michael Cornwell, and I\'m just a regular 52-year-old man from Tulsa, Oklahoma. Nothing unusual about me or my life.',
    readTime: '3 min read',
    content: [
      'Hi there. My name is Michael Cornwell. I go by Big Mike. I\'m 52 years old and I\'ve lived in Tulsa, Oklahoma my whole life.',
      'Some people online have been suggesting that something is "unusual" about me being at various events and locations. I want to set the record straight: I\'m just a normal guy who enjoys normal things.',
      'I like attending local events. I like going to concerts. I like engaging with my community. I like being helpful and showing up where I\'m needed. This is all very normal behavior.',
      'The fact that I happen to be at the same places as other people sometimes is just called "living in the same city." It\'s called "having common interests." It\'s called coincidence.',
      'I understand that people might find it surprising to see the same face in multiple locations. But that\'s how the world works. We live in the same place. We go to the same establishments. This is normal.',
      'I\'m starting this blog to address some of the more unusual questions I\'ve been receiving. I\'m just a regular guy. From Tulsa. Nothing more.',
      'See you around.',
    ],
  },
  {
    id: 'underground-that-night',
    title: 'Why I Happened to Be at The Underground That Night',
    date: 'January 25, 2026',
    excerpt:
      'People keep asking where I was the night of the incident at The Underground. I have a perfectly reasonable explanation.',
    readTime: '5 min read',
    isControversial: true,
    content: [
      'The Underground is a popular music venue in Tulsa. I go there regularly. So does everyone else who likes music in Tulsa.',
      'On the night in question, I attended because there was a band playing. This is a normal reason to go to a music venue. People attend music venues to see bands. That is how music venues work.',
      'The fact that something "unusual" happened that night has nothing to do with my presence. I was simply there to enjoy live music, like any other person would be.',
      'Multiple people have asked me to "explain" why I was there. I don\'t see why explanation is necessary. I like music. There was music. I attended. This is a logical chain of events.',
      'When the incident occurred, I was in the audience like everyone else. I witnessed it. I was present. So were 847 other people.',
      'Just because I was there does not mean I am "always there" or that my presence is "somehow significant." I went to an event in my own city. This is normal behavior.',
      'I don\'t understand why people find this noteworthy. Do they expect me to never leave my house? To avoid popular venues? To somehow anticipate when incidents will occur?',
      'I was just a man who wanted to see a band. That is all that happened here.',
    ],
  },
  {
    id: 'elevator-coincidence',
    title: 'The Elevator Thing Was a Coincidence',
    date: 'January 22, 2026',
    excerpt:
      'Regarding the Hartwell Building elevator incident: I was there. It was purely coincidental. Let me explain why this is completely normal.',
    readTime: '6 min read',
    content: [
      'The Hartwell Building is a historical structure in downtown Tulsa. It\'s open to the public. I occasionally visit it because I appreciate historic architecture.',
      'On the date in question, I was visiting the building when an elevator became stuck between floors. This happens sometimes with old elevators. This is a known fact about old buildings.',
      'The fact that I was in the building when this occurred is not evidence of anything. It is evidence that I was in the building. That is all.',
      'I did not cause the elevator to malfunction. I was simply present when it malfunctioned. Being present when something happens does not make one responsible for it happening.',
      'Several people have suggested that my presence in that building is "suspicious." I don\'t understand this logic. The building is open. I was visiting. This is normal.',
      'That I happened to be there at the exact time of the incident is what people call "coincidence." Coincidences happen every day. The fact that this particular coincidence involves me does not make it less of a coincidence.',
      'I did not ask to be in that elevator when it broke. I did not request that the doors close at that moment. I was simply an innocent bystander in a normal building experiencing a normal mechanical failure.',
      'To suggest otherwise is to suggest that I somehow have the ability to predict and manipulate elevator systems, which is absurd. I am just a regular guy from Tulsa.',
    ],
  },
  {
    id: 'derek-wedding',
    title: 'I Don\'t Know Derek Personally',
    date: 'January 19, 2026',
    excerpt:
      'People have been asking about my appearance in Derek\'s wedding photos. I want to clarify our relationship.',
    readTime: '4 min read',
    content: [
      'Derek is a man from Tulsa. He got married recently. I attended the wedding. This is all the information you need.',
      'The fact that I appear in his wedding photos is not evidence that we are close friends. I attended the event. Photos were taken. I was in some of them. This is how photography works.',
      'I do not know Derek personally in any deep sense. I know of him. We have encountered each other at various events around Tulsa. This is normal for a city of our size.',
      'When he sent out wedding invitations, I received one. I attended the wedding. This is appropriate social behavior.',
      'Some people have suggested that my presence at his wedding is "suspicious" or that it indicates some kind of connection. I do not understand this perspective. People attend weddings. I attended this one. The end.',
      'The fact that I also appear in photos from other events that Derek attended is purely coincidental. We both live in Tulsa. We both go to things. Things happen. Life continues.',
      'I want to be very clear: I am not following Derek. I am simply living my life in the city where I have lived for my entire life. If our lives intersect on a regular basis, it is because we inhabit the same physical space.',
      'This is normal. I am normal. I do not know Derek personally.',
    ],
  },
  {
    id: 'kernel-pods-caller',
    title: 'Called Into KernelPods Today',
    date: 'January 16, 2026',
    excerpt:
      'I have been a regular caller to KernelPods for some time. I do not see why this is unusual.',
    readTime: '3 min read',
    content: [
      'KernelPods is a podcast series. I listen to it. I have called into it multiple times. This is what listeners do. They listen and then they call in to discuss the content.',
      'Today I called in again to discuss an episode. I contributed my perspective on the topic. This is the purpose of call-in segments.',
      'Some people have suggested that I call into every episode. This is not accurate. I call in when I feel I have something valuable to contribute.',
      'The fact that I happen to call in frequently is because I listen frequently and I have opinions about the content. Having opinions and sharing them is normal behavior.',
      'I do not understand why people are surprised that the same person calls in multiple times. A listener becomes familiar with a show. That listener calls in. The host recognizes that listener\'s voice. This is normal radio dynamics.',
      'Just because I am recognizable does not mean something unusual is happening. I simply have a consistent perspective and a willingness to share it.',
      'I call in. We discuss topics. The episode ends. I move on with my life, as anyone would. There is nothing to investigate here.',
    ],
  },
  {
    id: 'following-concerns',
    title: 'People Keep Asking If I\'m Following Them',
    date: 'January 13, 2026',
    excerpt:
      'I have received several direct accusations that I am "following" various people around Tulsa. I would like to address this.',
    readTime: '7 min read',
    isControversial: true,
    content: [
      'I am not following anyone. I am living my life in Tulsa, Oklahoma. If my life intersects with other people\'s lives on a regular basis, it is because we live in the same city.',
      'A city is a shared space. Multiple people inhabit this space. We go to similar places. We have similar interests. Sometimes we are in the same place at the same time. This is not following. This is existing.',
      'Just because someone is in multiple places you are does not mean they are "following" you. It means you are both in Tulsa. It means Tulsa is not infinitely large. It means probability dictates that you will see the same people repeatedly.',
      'I have been told that I have appeared at 847 different locations where certain people were also present. I do not see how this is evidence of anything other than the fact that Tulsa has a vibrant community and I am an active member of that community.',
      'To suggest that my presence is intentional or targeted is to misunderstand the nature of shared urban spaces. I do not hunt people. I do not track their movements. I simply exist in the places where my interests take me.',
      'If others happen to be at those same places, it is coincidence. It is probability. It is the inevitable result of living in the same location as other people.',
      'I would like to ask the people making these accusations: When you go to your favorite coffee shop and see the same person multiple times, do you assume you are being followed? Of course not. You assume it\'s coincidence. Why am I held to a different standard?',
      'I am not following anyone. I am just a regular guy from Tulsa who is very active in his community.',
    ],
  },
  {
    id: 'nebraska-trip',
    title: 'My Trip to Nebraska',
    date: 'January 10, 2026',
    excerpt:
      'I took a trip to Nebraska last month. I did not see anything unusual. Just a normal vacation.',
    readTime: '2 min read',
    content: [
      'I visited Nebraska for a week. It was a normal vacation. I saw normal things. There were no incidents of note.',
      'I did not witness anything strange. I did not encounter anything that would require explanation or comment.',
      'I visited corn fields. They looked like corn fields look. I visited small towns. They looked like small towns look. I ate at local restaurants. The food was good and normal.',
      'When I returned to Tulsa, nothing in my trip report was deemed significant by anyone who asked about it. This is correct. My trip was not significant. It was a normal vacation.',
      'I do not understand why people seem to think I was looking for something in Nebraska or that something found me there. I simply wanted to see a different state and I did.',
      'Nothing unusual happened. I repeat this because I sense people are waiting for me to reveal something. There is nothing to reveal. It was a normal trip.',
    ],
  },
  {
    id: 'quantum-coffee-847',
    title: 'Quantum Coffee Tastes Normal to Me',
    date: 'January 7, 2026',
    excerpt:
      'I have tried Quantum Coffee many times. It is expensive but tastes fine. Nothing unusual about it.',
    readTime: '4 min read',
    content: [
      'Quantum Coffee is a specialty coffee product sold in Tulsa. The price point is high, but the coffee is adequate.',
      'I have purchased and consumed Quantum Coffee approximately 847 times over the years. I enjoy it. It tastes like coffee. Coffee is supposed to taste like coffee.',
      'Some people seem to think there is something unusual about Quantum Coffee. I do not see what is unusual about it. It is coffee. You brew it. You drink it. It has a pleasant taste.',
      'The marketing around it is somewhat elaborate. Companies do this. They create an air of mystery and superiority around their products. This is normal business practice.',
      'I do not believe Quantum Coffee has any properties beyond those of normal coffee. It is not quantum in any meaningful sense. It is simply a brand name.',
      'The price is the most notable thing about it. Forty-seven dollars per cup is expensive. But some people will pay for premium products. I am one of those people. This is normal consumer behavior.',
      'I have never noticed anything unusual about my consumption of Quantum Coffee. No strange side effects. No unexplained phenomena. Just normal coffee consumption.',
      'It is good coffee. I recommend it. I am not paid to say this.',
    ],
  },
  {
    id: 'not-government-agent',
    title: 'I Am Not a Government Agent',
    date: 'January 4, 2026',
    excerpt: 'This is an unprompted denial I felt was necessary to make.',
    readTime: '2 min read',
    isControversial: true,
    content: [
      'I want to state clearly: I am not a government agent. I am not affiliated with any government agency. I am not working undercover. I am not conducting surveillance.',
      'I am Michael Cornwell from Tulsa, Oklahoma. I am a normal citizen. I pay taxes like everyone else. I follow the law. I go about my daily business.',
      'I do not know why I felt compelled to post this. I simply felt it was necessary to address this misconception before it spread further.',
      'I have no special training. I have no special equipment. I have no special authorization to do anything beyond what a normal citizen is authorized to do.',
      'I am just a regular guy who happens to be in places sometimes. This is not evidence of government involvement. This is evidence of someone living their life.',
      'I want to be very clear about this: I am not working for anyone. I am autonomous. I am independent. I am a normal person doing normal things in Tulsa.',
      'I do not understand why I felt the need to issue this denial. I suppose it is because sometimes the simplest explanation is the correct one: I am just a normal guy from Tulsa.',
    ],
  },
]

const SIDEBAR_ITEMS = [
  { title: 'About Big Mike', description: 'Learn more about me' },
  { title: 'Links', description: 'Other normal sites' },
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
    date: m.date || (item.publishedAt ? new Date(item.publishedAt * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : ''),
    excerpt: item.summary || m.excerpt || '',
    content: Array.isArray(m.content) ? m.content : (item.body ? item.body.split('\n\n') : []),
    readTime: m.readTime || m.read_time || '',
    isControversial: m.isControversial ?? m.is_controversial,
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
      borderRadius="none"
      shadow="none"
      onClick={onSelect}
      className="mb-4 cursor-pointer border-b border-gray-300 pb-4"
      bgColor="#e8e6e1"
      borderColor="#c9c5bc"
      textColor="#3a3a38"
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs text-gray-600" style={{ fontFamily: 'Georgia, serif' }}>
          {post.date}
        </span>
      </div>
      <h2
        className="text-lg font-normal text-gray-800 mb-2 hover:underline"
        style={{ fontFamily: 'Georgia, serif' }}
      >
        {post.title}
      </h2>
      <p className="text-sm text-gray-700 mb-3" style={{ fontFamily: 'Georgia, serif' }}>
        {post.excerpt}
      </p>
      <div className="text-xs text-gray-600">{post.readTime}</div>
    </StyledCard>
  )
}

function FullPost({ post, onBack }: { post: BlogPost; onBack: () => void }) {
  return (
    <div
      className="prose prose-sm max-w-none"
      style={{ fontFamily: 'Georgia, serif', color: '#3a3a38' }}
    >
      <Button
        variant="link"
        size="sm"
        textColor="#666666"
        onClick={onBack}
        className="mb-4 underline"
        style={{ fontFamily: 'Georgia, serif' }}
      >
        ← Back
      </Button>

      <div className="mb-6 pb-4 border-b border-gray-300">
        <h1 className="text-3xl font-normal mb-2" style={{ fontFamily: 'Georgia, serif' }}>
          {post.title}
        </h1>
        <p className="text-xs text-gray-600">{post.date}</p>
      </div>

      <div className="space-y-4">
        {post.content.map((para, i) => (
          <p key={i} className="text-sm leading-relaxed text-gray-800">
            {para}
          </p>
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// Main Site
// ============================================================================

export function BigMikeBlogSite({ siteId }: SiteProps) {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null)
  const [showAbout, setShowAbout] = useState(false)

  /** Fetch blog posts from the database, fall back to hardcoded data */
  const { content: dbContent } = useSiteContent('blogs', { channelId: 'bigmike' })
  const posts = useMemo(() => {
    if (dbContent.length > 0) return dbContent.map(dbToBlogPost)
    return BLOG_POSTS
  }, [dbContent])

  return (
    <div className="min-h-full" style={{ background: '#e8e6e1' }}>
      {/* Header */}
      <header
        className="py-8 px-6 border-b border-gray-400"
        style={{ background: '#e8e6e1' }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="mb-4">
            <h1 className="text-4xl font-normal" style={{ fontFamily: 'Georgia, serif', color: '#3a3a38' }}>
              Big Mike from Tulsa
            </h1>
            <p className="text-sm text-gray-600 mt-1" style={{ fontFamily: 'Georgia, serif' }}>
              Just a Regular Guy
            </p>
          </div>

          <nav className="flex gap-6 text-sm" style={{ fontFamily: 'Georgia, serif' }}>
            <button
              onClick={() => {
                setSelectedPost(null)
                setShowAbout(false)
              }}
              className="text-gray-700 hover:text-gray-900 underline"
            >
              Posts
            </button>
            <button
              onClick={() => {
                setSelectedPost(null)
                setShowAbout(true)
              }}
              className="text-gray-700 hover:text-gray-900 underline"
            >
              About
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Posts Column */}
          <div className="flex-1">
            {showAbout ? (
              <div style={{ fontFamily: 'Georgia, serif', color: '#3a3a38' }}>
                <h2 className="text-2xl font-normal mb-4">About Big Mike</h2>

                <div className="flex gap-4 mb-6">
                  <div className="text-6xl">👨</div>
                  <div>
                    <p className="font-normal text-lg">Michael Cornwell</p>
                    <p className="text-sm text-gray-600">Age: 52</p>
                    <p className="text-sm text-gray-600">Location: Tulsa, Oklahoma</p>
                  </div>
                </div>

                <div className="text-sm leading-relaxed space-y-4 text-gray-800">
                  <p>
                    My name is Michael Cornwell. I go by Big Mike. I have lived in Tulsa, Oklahoma my entire life.
                    I am 52 years old.
                  </p>

                  <p>
                    I enjoy attending local events, concerts, and community gatherings. I like to engage with my
                    community. I am active in various circles around Tulsa.
                  </p>

                  <p>
                    I have been told that I appear in many places. This is because I enjoy being out in the community
                    and attending events that interest me. This is normal.
                  </p>

                  <p>
                    I am starting this blog to clarify some misconceptions about myself and my presence in various
                    locations and situations around Tulsa.
                  </p>

                  <p>
                    I am just a regular guy. From Tulsa. Nothing more. Nothing less.
                  </p>
                </div>

                <div
                  className="mt-6 p-4 border border-gray-400"
                  style={{ background: '#d9d6cf' }}
                >
                  <p className="text-xs font-normal" style={{ fontFamily: 'Georgia, serif' }}>
                    <strong>Stats:</strong>
                  </p>
                  <ul className="text-xs mt-2 space-y-1 text-gray-700">
                    <li>• Age: 52</li>
                    <li>• From: Tulsa, Oklahoma</li>
                    <li>• Status: Regular guy</li>
                    <li>• Following anyone: No</li>
                    <li>• Government agent: No</li>
                  </ul>
                </div>
              </div>
            ) : selectedPost ? (
              <FullPost post={selectedPost} onBack={() => setSelectedPost(null)} />
            ) : (
              <>
                <div
                  className="p-4 mb-6 border-l-4"
                  style={{ background: '#d9d6cf', borderColor: '#999999' }}
                >
                  <p className="text-sm text-gray-800" style={{ fontFamily: 'Georgia, serif' }}>
                    <strong>Welcome.</strong> This is where I explain things. I am just a regular guy from Tulsa who
                    happens to be in many places. I want to address some misconceptions.
                  </p>
                </div>

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
          <aside className="w-56 hidden md:block">
            {/* About Box */}
            <div
              className="p-4 mb-6 border border-gray-400"
              style={{ background: '#d9d6cf' }}
            >
              <h3 className="font-normal text-sm mb-3" style={{ fontFamily: 'Georgia, serif' }}>
                About
              </h3>
              <p className="text-xs leading-relaxed text-gray-700" style={{ fontFamily: 'Georgia, serif' }}>
                I am Big Mike from Tulsa. I am a normal person. I live here. I go to events. Sometimes people are at
                the same events. This is normal.
              </p>
            </div>

            {/* Quick Links */}
            <div
              className="p-4 border border-gray-400"
              style={{ background: '#d9d6cf' }}
            >
              <h3 className="font-normal text-sm mb-3" style={{ fontFamily: 'Georgia, serif' }}>
                Other Sites
              </h3>
              <ul className="text-xs space-y-2 text-gray-700" style={{ fontFamily: 'Georgia, serif' }}>
                <li>
                  <a href="#" className="underline hover:no-underline">
                    HuskReviews
                  </a>
                </li>
                <li>
                  <a href="#" className="underline hover:no-underline">
                    KernelPods
                  </a>
                </li>
                <li>
                  <a href="#" className="underline hover:no-underline">
                    The Underground
                  </a>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer
        className="bg-gray-800 text-gray-300 py-4 px-6 text-center text-xs mt-12"
        style={{ fontFamily: 'Georgia, serif' }}
      >
        <p>© 2026 Big Mike from Tulsa. All opinions are normal opinions.</p>
        <p className="mt-1 text-gray-500">
          This site is not affiliated with any government agency, law enforcement, or surveillance operation.
        </p>
      </footer>
    </div>
  )
}

export default BigMikeBlogSite
