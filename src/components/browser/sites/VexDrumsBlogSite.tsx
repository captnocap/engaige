/**
 * Vex Drums Blog Site
 *
 * Personal blog of Vex (Vernon), the drummer from Neon Requiem.
 * The band broke up in January 2024, but Vex won't accept it.
 *
 * Dark, moody post-punk aesthetic. Purple and black with increasing desperation
 * masked as optimism. References The Underground, band members who have moved on,
 * and his denial that everything is fine.
 */

import { useState } from 'react'
import type { SiteProps } from '../BrowserSiteContainer.js'
import { FILLER_SITES } from '../../../config/filler-sites.js'

const site = FILLER_SITES.vexdrums

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
  desperation?: number // 0-10 scale of how desperate the post feels
}

const BLOG_POSTS: BlogPost[] = [
  {
    id: 'hiatus-not-breakup',
    title: 'We\'re Not Broken Up, It\'s a Hiatus',
    date: 'January 28, 2024',
    excerpt: 'Some people are calling it a "breakup." They\'re wrong. We\'re just taking some time apart to focus on personal growth.',
    readTime: '8 min read',
    desperation: 3,
    content: [
      'I see the posts online. People saying Neon Requiem is "over." That we "broke up." These people don\'t understand what\'s actually happening.',
      'We\'re on a HIATUS. There\'s a difference.',
      'Maya said she was "starting a new chapter." What she meant was: exploring other creative directions temporarily. The band will be there when she\'s ready.',
      'James said something about "the final show being our goodbye." I think that\'s just how he processes major events. He gets emotional. It\'s part of why he\'s such a good bassist.',
      'And Iris? She hasn\'t returned my calls, but I\'m sure that\'s just because her new job is keeping her busy. When the reunion starts, she\'ll be right back.',
      'The math is simple: we played together for 8 years. One show doesn\'t end that. We\'ve taken breaks before. This is just a longer one.',
      'We\'ll reconvene when everyone\'s ready. I give it three months, maybe six.',
      'Definitely not a breakup though.',
    ],
    tags: ['hiatus', 'neon-requiem', 'denial', 'totally-fine'],
  },
  {
    id: 'band-practice-tomorrow',
    title: 'Band Practice Tomorrow (They\'ll Show Up This Time)',
    date: 'February 15, 2024',
    excerpt: 'Mars texted me the code to The Underground. We\'re going in at 8 PM. I know they didn\'t confirm, but that\'s just because they haven\'t seen the message.',
    readTime: '5 min read',
    desperation: 6,
    content: [
      'Got my message out to the group chat at 3 AM. Practice session tomorrow at 8 PM at The Underground.',
      'I know they\'re "busy." I know they haven\'t responded. But sometimes the best bands are the ones that just SHOW UP, you know?',
      'Last time they didn\'t make it, Maya said she had "other commitments." This time she doesn\'t have an excuse because I gave them 24 hours notice.',
      'James will come. He always comes. Even if he says he\'s "moved on to other projects" or "doesn\'t think the band is worth his time anymore," deep down, a drummer and bassist connection is sacred.',
      'I\'ve been practicing our entire catalog. Two hours a day on the kit. My neighbors complained, but they don\'t understand what\'s at stake here.',
      'Mars said we could use The Underground if we wanted to. He seemed sad about it, actually. Like he knew something I didn\'t. But that\'s irrelevant.',
      'They\'ll show up. They have to. We have unfinished business.',
      'I\'m bringing extra picks. And new heads for the toms. And I\'ll have a speech prepared for when they arrive, about how we can do this differently, how we can make it work.',
      'Actually, I think I\'ll skip the speech. Just get straight into "Fade to Violet." Our opener. Our song.',
      'They\'ll remember why we started this.',
    ],
    tags: ['practice', 'denial', 'the-underground', 'they-wont-come', 'but-really'],
  },
  {
    id: 'final-show-was-regular',
    title: 'The Final Show Was Just a Regular Show',
    date: 'January 31, 2024',
    excerpt: 'People keep saying "it was a goodbye," but I wasn\'t saying goodbye to anyone. It was just a show. The 247th show we\'ve done.',
    readTime: '12 min read',
    desperation: 7,
    content: [
      'The show at The Underground on January 13th was... it was just a show.',
      'That\'s what I keep trying to tell people. Everyone\'s acting like it was some kind of finale, some big emotional ending. But it wasn\'t. It couldn\'t have been.',
      'We didn\'t do anything different. Same setlist structure. Same tech setup (though Mars let us use the good rig, which was nice). Same energy.',
      'Sure, there were more people than usual. And sure, a lot of people seemed... I don\'t know... really into it? Like they were savoring every moment? But that happens at good shows.',
      'And sure, at the end, when we did "Violet Echo," Maya looked like she might cry during her solo. But artists are emotional. That doesn\'t mean anything.',
      'And sure, James didn\'t do his usual joke after "Dead Signal." But people have off nights.',
      'And sure, Iris held her bass up at the end, and looked out at the crowd for like two full minutes without moving, and I thought I saw her mouth something that might have been "thank you," but—',
      'It was a regular show.',
      'You don\'t know what a final show looks like until someone explicitly says "this is the final show, we\'re breaking up." And nobody said that. Not really. Not in a way that counts.',
      'The next show will be different. When we regroup, we\'ll have new material. We\'ll be tighter. Better.',
      'That\'s what that show was: preparation for the comeback.',
    ],
    tags: ['denial', 'neon-requiem', 'the-underground', 'reframing', 'lying-to-myself'],
  },
  {
    id: 'bargainbay-listing',
    title: 'I Listed My Kit on BargainBay (But I\'m Not Selling)',
    date: 'February 3, 2024',
    excerpt: 'Listed my Yamaha kit on BargainBay for $4,200. Not because I\'m getting rid of it. Just testing the market. I\'m canceling the sale.',
    readTime: '9 min read',
    desperation: 8,
    content: [
      'People keep asking me why I\'m selling my drums. I\'m NOT selling my drums.',
      'I listed them on BargainBay because... because I wanted to see what they\'re worth, actually. A drummer needs to know his equipment\'s value for insurance purposes.',
      'The listing was live for three days. Got seventeen offers. The highest was $4,800, which I thought was reasonable considering the condition and the upgrades I\'ve done.',
      'Then I realized: I can\'t actually sell these. They\'re the Yamaha kit I\'ve been playing since 2016. The kit I used on our first EP. The kit that played The Underground.',
      'So I pulled the listing. Not because I realized the band might come back (though they definitely might). Just because... I wasn\'t ready.',
      'One of the offers left a note: "Beautiful kit. Previous owner clearly loves playing." I read that and had to step outside for a while.',
      'I might list them again. Or maybe not. I haven\'t decided.',
      'The thing about selling instruments is that it feels like you\'re admitting something. And I\'m not admitting anything.',
      'My drums are staying right where they are: set up in my apartment, ready for practice at a moment\'s notice.',
      'They don\'t gather dust. I play them. Sometimes for hours.',
      'Mostly at 2 AM.',
      'When the neighbors are asleep.',
    ],
    tags: ['denial', 'bargainbay', 'selling-kit', 'not-selling-kit', 'conflict'],
  },
  {
    id: 'mars-eviction',
    title: 'Mars Says I Can\'t Keep Sleeping at The Underground',
    date: 'March 12, 2024',
    excerpt: 'He was nice about it. Way too nice. That\'s what made it worse. He said I "shouldn\'t have to spend nights on the couch." But the couch is fine.',
    readTime: '7 min read',
    desperation: 9,
    content: [
      'I wasn\'t technically sleeping at The Underground.',
      'I was napping. There\'s a difference.',
      'I\'d go in after closing, practice for four or five hours, and then just... rest for a bit. On the couch in the back office. It\'s a nice couch.',
      'Mars found me there at 5 AM last Thursday. He brought coffee. We sat and talked about... everything, actually.',
      'He said the band wouldn\'t want me doing this. I told him the band isn\'t around to want anything. He got really quiet.',
      'Then he said I couldn\'t keep coming by at night. That he\'d have to lock up. That I should "go home and sleep in my actual bed like a normal person."',
      'But my apartment is too quiet. Without the sound of Iris\'s bass, it\'s just this... silence. The drums don\'t sound right alone.',
      'Mars offered to pay for a hotel room. I said no. That felt like accepting that this was permanent.',
      'He told me the venue is closing on Thursdays now. Fewer shows. No tours coming through. It\'s not as fun without the live music ecosystem, he said.',
      'He also said, and I remember this exactly: "Vex, it\'s okay to grieve."',
      'I told him I wasn\'t grieving. Just... regrouping.',
      'I don\'t go back to The Underground anymore.',
      'Not because of what Mars said. Just because the acoustics are different now. It doesn\'t feel the same.',
    ],
    tags: ['the-underground', 'mars', 'loss', 'reality-hitting', 'homelessness-joke'],
  },
  {
    id: 'quantum-brew-encounter',
    title: 'I Saw Our Lead Singer at Quantum Brew (He Pretended Not to See Me)',
    date: 'March 28, 2024',
    excerpt: 'I was getting coffee. My usual order. V60, light roast. And there was James. He looked different. Shorter hair. Happier.',
    readTime: '6 min read',
    desperation: 10,
    content: [
      'Quantum Coffee Co. on Fifth Street. I go there every morning now. It\'s become my routine.',
      'I was waiting for my coffee when I saw him. James. Our bassist. My friend.',
      'He was with someone I didn\'t recognize. They were holding hands.',
      'For a second, I thought about going over. Saying hi. Asking how he\'s been. But then I realized: he wasn\'t at the last band practice. He\'s never coming back, is he?',
      'He saw me. I know he did. Our eyes met for like half a second.',
      'He immediately looked away and shifted his body so his back was to me.',
      'The barista called my name. I got my coffee. I left.',
      'On the walk home, I thought about what it means when someone you\'ve been making art with for eight years pretends not to see you.',
      'It means they don\'t want to talk about the band.',
      'It means they\'ve moved on.',
      'It means they\'re not coming back.',
      'I haven\'t been to Quantum Brew since.',
      'I\'m getting coffee somewhere else now. This place on the corner that\'s always empty. The coffee is worse, but at least I won\'t see anyone I know.',
      'I haven\'t played the drums since that day.',
      'I just sit there. The kit sits there too. We just... exist together. In silence.',
    ],
    tags: ['james', 'heartbreak', 'moving-on', 'acceptance', 'denial-breaking'],
  },
  {
    id: 'new-material-reunion',
    title: 'Working on New Material (For When We Reunite)',
    date: 'April 22, 2024',
    excerpt: 'Been writing. New compositions for the next album. Heavier stuff. Angrier. Better.',
    readTime: '8 min read',
    desperation: 5,
    content: [
      'The next Neon Requiem album is going to be incredible.',
      'I know that sounds weird to say when the band isn\'t technically together, but I\'m preparing. That\'s what professionals do.',
      'I\'ve written six drum patterns. Complex stuff. Polyrhythmic. It\'s going to blow everyone\'s mind.',
      'The songs don\'t have titles yet because they don\'t have lyrics yet because nobody\'s here to write the lyrics.',
      'But when everyone comes back, the framework will be ready.',
      'I\'ve been listening to a lot of Velvet Algorithms lately. Which is sad because they\'re on hiatus too. And they broke up for real—like, they literally said they were breaking up.',
      'But even broken up bands have a legacy. We\'ll have a legacy too. When we come back.',
      'I started keeping a journal. Track ideas. Rhythms. Timing. When Maya returns and wants to work on new material, I\'ll have months of prep.',
      'It\'s not the same as writing with the band. When you\'re all in the room together, there\'s magic. Magic I can\'t replicate alone.',
      'But I\'m trying.',
      'I play the patterns every day. No bass. No guitars. No voice.',
      'Just me and the drums, building the blueprint of something that doesn\'t exist anymore.',
      'Something that might exist again.',
      'Probably.',
    ],
    tags: ['new-material', 'reunion', 'preparation', 'hope', 'delusion'],
  },
  {
    id: 'velvet-algorithms-hiatus',
    title: 'The Velvet Algorithms Are Also on Hiatus, Right?',
    date: 'May 10, 2024',
    excerpt: 'Saw an interview where they said "we\'re taking some time apart." So they\'re not broken up. Everyone takes hiatuses. That\'s normal.',
    readTime: '4 min read',
    desperation: 6,
    content: [
      'Just checking in on the other local band situation.',
      'Velvet Algorithms announced a "hiatus for meditation and existential exploration."',
      'That\'s basically what Neon Requiem is doing. Just with less public announcement.',
      'So we\'re not alone in this. Other bands pause. Other artists step back. It\'s healthy, actually.',
      'I bet Velvet Algorithms will reunite. I bet in two years we\'ll see both bands back on The Underground\'s stage, playing some kind of collaborative show.',
      'That could be really cool actually. Neon Requiem opening, Velvet Algorithms closing. Late night crowd. All our friends there.',
      'I should reach out to Velvet Algorithms. Ask if they want to collaborate when they\'re ready. Show solidarity in the hiatus community.',
      'We\'re not broken. We\'re just... paused.',
      'Like everyone else.',
    ],
    tags: ['velvet-algorithms', 'hiatus-solidarity', 'comparison', 'seeking-validation', 'grasping'],
  },
  {
    id: 'im-fine',
    title: 'I\'m Fine. The Band Is Fine. Everything Is Fine.',
    date: 'June 3, 2024',
    excerpt: 'People keep asking how I\'m doing. I\'m doing great. Never better. The band is taking a break. I\'m taking a break. We\'re all on a break.',
    readTime: '3 min read',
    desperation: 10,
    content: [
      'I\'m fine.',
      'Everyone keeps asking and I need to say it clearly: I am fine.',
      'The band is fine. We\'re just taking some time. That\'s healthy. That\'s normal.',
      'I haven\'t heard from Maya in four months.',
      'I haven\'t heard from James in five weeks.',
      'Iris never responded to my last seventeen messages.',
      'But that\'s fine.',
      'I\'m playing my drums every night. Alone. In my apartment. Where no one can hear me.',
      'I\'m eating. Sometimes. When I remember.',
      'I got a job at a coffee shop. Not Quantum Brew. Somewhere else. Where I don\'t see anyone I know.',
      'I\'m saving money. For when the band reunites and we need to rent a studio. For when we\'re ready to record.',
      'We\'re going to record that album. The one with the new material I wrote.',
      'Everyone is going to be so impressed with what I\'ve done.',
      'I\'m fine.',
      'Really.',
      'The only thing I can\'t do is listen to our old songs. Because when I do, I remember what it felt like to play with them, and that remembering feels like dying a little, and I can\'t afford to die anymore because I\'ve already died like thirty-seven times since January.',
      'But other than that?',
      'Fine.',
      'Everything is fine.',
    ],
    tags: ['breakdown', 'denial', 'fine', 'not-fine', 'falling-apart', 'help-me'],
  },
]

const SIDEBAR_INFO = [
  { label: 'Band Status', value: 'On Hiatus (Temporary!)' },
  { label: 'Last Show', value: 'January 13, 2024 @ The Underground' },
  { label: 'Kit Type', value: 'Yamaha Stage Custom (almost sold)' },
  { label: 'Years Active', value: '2016-2024 (not counting now)' },
  { label: 'Current Mood', value: '(smile emoji)' },
]

// ============================================================================
// Components
// ============================================================================

function BlogPostCard({ post, onSelect }: { post: BlogPost; onSelect: () => void }) {
  // Color intensity increases with desperation
  const desperationColor = post.desperation
    ? `rgba(168, 85, 247, ${0.1 + (post.desperation * 0.08)})`
    : 'transparent'

  return (
    <div
      onClick={onSelect}
      className="mb-4 p-4 rounded-lg cursor-pointer transition-all hover:shadow-lg"
      style={{
        backgroundColor: '#1a1a2e',
        borderLeft: `4px solid ${post.desperation && post.desperation > 7 ? '#dc2626' : '#a855f7'}`,
        borderRadius: '6px',
      }}
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs text-purple-300">{post.date}</span>
        {post.desperation && post.desperation > 8 && (
          <span className="text-xs bg-red-900 text-red-200 px-2 py-0.5 rounded">
            ⚠️ CRY FOR HELP
          </span>
        )}
      </div>
      <h2 className="text-lg font-bold text-purple-200 mb-2 hover:text-purple-100">
        {post.title}
      </h2>
      <p className="text-sm text-gray-300 mb-3">{post.excerpt}</p>
      <div className="flex justify-between items-center text-xs text-gray-400">
        <span>🥁 {post.readTime}</span>
        {post.desperation && <span>💔 Desperation Level: {post.desperation}/10</span>}
      </div>
      <div className="flex flex-wrap gap-1 mt-2">
        {post.tags.slice(0, 3).map(tag => (
          <span key={tag} className="text-xs bg-purple-900 text-purple-200 px-2 py-0.5 rounded">
            #{tag}
          </span>
        ))}
      </div>
    </div>
  )
}

function FullPost({ post, onBack }: { post: BlogPost; onBack: () => void }) {
  return (
    <div
      className="rounded-lg p-6"
      style={{
        backgroundColor: '#1a1a2e',
        borderLeft: `4px solid ${post.desperation && post.desperation > 7 ? '#dc2626' : '#a855f7'}`,
      }}
    >
      <button
        onClick={onBack}
        className="text-purple-300 hover:text-purple-100 mb-4 text-sm"
      >
        ← Back to all posts
      </button>

      <div className="flex justify-between items-start mb-4">
        <span className="text-sm text-purple-300">{post.date}</span>
        {post.desperation && post.desperation > 8 && (
          <span className="text-xs bg-red-900 text-red-200 px-2 py-0.5 rounded">
            ⚠️ CRY FOR HELP
          </span>
        )}
      </div>

      <h1 className="text-3xl font-bold text-purple-100 mb-6">{post.title}</h1>

      <div className="space-y-4 mb-6">
        {post.content.map((para, i) => (
          <p key={i} className="text-gray-200 leading-relaxed text-sm">
            {para}
          </p>
        ))}
      </div>

      <div className="mt-8 pt-4 border-t border-purple-900">
        <div className="flex flex-wrap gap-1">
          {post.tags.map(tag => (
            <span key={tag} className="text-xs bg-purple-900 text-purple-200 px-2 py-0.5 rounded">
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {post.desperation && post.desperation > 8 && (
        <div
          className="mt-6 p-4 rounded-lg"
          style={{ backgroundColor: '#3f1f1f', borderLeft: '4px solid #dc2626' }}
        >
          <p className="text-red-200 text-sm">
            If you or someone you know is struggling, please reach out. Things get better. Even when they don't feel like it.
          </p>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// Main Site
// ============================================================================

export function VexDrumsBlogSite({ siteId }: SiteProps) {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null)
  const [showAbout, setShowAbout] = useState(false)

  return (
    <div style={{ background: '#0f0a1f', minHeight: '100%' }}>
      {/* Header */}
      <header style={{ backgroundColor: '#1a1328', borderBottom: '2px solid #a855f7' }} className="py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">🥁</span>
            <div>
              <h1 style={{ color: '#c084fc' }} className="text-3xl font-bold">
                VEX DRUMS
              </h1>
              <p style={{ color: '#a78bfa' }} className="text-sm italic">
                "Vernon's Space / Neon Requiem Lives"
              </p>
            </div>
          </div>
          <nav className="flex gap-4 mt-6 text-sm">
            <button
              onClick={() => {
                setSelectedPost(null)
                setShowAbout(false)
              }}
              className="px-3 py-2 rounded"
              style={{ color: '#c084fc', borderBottom: !selectedPost && !showAbout ? '2px solid #a855f7' : 'none' }}
            >
              Posts
            </button>
            <button
              onClick={() => {
                setSelectedPost(null)
                setShowAbout(true)
              }}
              className="px-3 py-2 rounded"
              style={{ color: '#c084fc', borderBottom: showAbout ? '2px solid #a855f7' : 'none' }}
            >
              About
            </button>
            <button
              className="px-3 py-2 rounded"
              style={{ color: '#6b7280' }}
            >
              Contact (Disabled)
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Posts Column */}
          <div className="flex-1">
            {showAbout ? (
              <div className="p-6 rounded-lg" style={{ backgroundColor: '#1a1a2e' }}>
                <h2 className="text-2xl font-bold text-purple-100 mb-4">About Vernon</h2>
                <div className="flex gap-4 mb-6">
                  <div className="text-6xl">🥁</div>
                  <div>
                    <p className="font-bold text-purple-100">Vex (Vernon Graves)</p>
                    <p className="text-sm text-purple-300">Drummer | Neon Requiem</p>
                    <p className="text-xs text-gray-400">Born 1990 | Resident of The Underground (formerly)</p>
                  </div>
                </div>

                <div className="text-sm text-gray-200 space-y-4 mb-6">
                  <p>
                    I'm a drummer. I've been playing drums since I was 12. Started Neon Requiem in 2016 with some friends
                    from the local post-punk scene. We had a good run. Really good, actually.
                  </p>
                  <p>
                    Right now we're on hiatus. It's temporary. Everyone's just taking some time to explore other stuff.
                    That's healthy. That's normal. Bands do this all the time.
                  </p>
                  <p>
                    I play at The Underground sometimes. Not as much anymore. Mars has been nice about it, but he's also
                    kind of sad about the whole thing, which I don't really understand.
                  </p>
                  <p>
                    I work at a coffee shop now. Not Quantum Brew. A different one.
                  </p>
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: '#2a1f3f', borderLeft: '4px solid #a855f7' }}>
                  <p className="font-bold text-purple-200 mb-2">📊 Stats</p>
                  <ul className="text-purple-200 text-xs space-y-1">
                    <li>• Band active: 2016-2024 (8 years)</li>
                    <li>• Shows played: 247</li>
                    <li>• Times checked phone for band messages: 847+</li>
                    <li>• Times cried at The Underground: unknown</li>
                    <li>• Status: ???</li>
                  </ul>
                </div>
              </div>
            ) : selectedPost ? (
              <FullPost post={selectedPost} onBack={() => setSelectedPost(null)} />
            ) : (
              <>
                <div className="mb-4 p-4 rounded-lg" style={{ backgroundColor: '#2a1f3f', borderLeft: '4px solid #dc2626' }}>
                  <p style={{ color: '#fca5a5' }} className="text-sm">
                    📝 <strong>Latest thoughts:</strong> Still here. Still hoping. Still confused about what "hiatus" means when
                    nobody's talking to you.
                  </p>
                </div>
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
          <aside className="w-80 hidden md:block space-y-4">
            {/* Band Info */}
            <div className="p-4 rounded-lg" style={{ backgroundColor: '#1a1a2e', borderLeft: '4px solid #a855f7' }}>
              <h3 className="font-bold text-purple-100 mb-4">🎸 Neon Requiem</h3>
              <div className="space-y-2">
                {SIDEBAR_INFO.map((item, i) => (
                  <div key={i} className="text-xs">
                    <p className="text-purple-300">{item.label}</p>
                    <p className="text-gray-300 font-bold">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Band Members */}
            <div className="p-4 rounded-lg" style={{ backgroundColor: '#1a1a2e', borderLeft: '4px solid #8b5cf6' }}>
              <h3 className="font-bold text-purple-100 mb-3">👥 The Band</h3>
              <div className="space-y-2 text-xs">
                <div>
                  <p className="text-purple-300">Maya Reeves</p>
                  <p className="text-gray-400">Vocals (not responding)</p>
                </div>
                <div>
                  <p className="text-purple-300">James Chen</p>
                  <p className="text-gray-400">Bass (avoids eye contact)</p>
                </div>
                <div>
                  <p className="text-purple-300">Iris Kovak</p>
                  <p className="text-gray-400">Guitar (moved on)</p>
                </div>
                <div>
                  <p className="text-purple-300">Vex (Me)</p>
                  <p className="text-gray-400">Drums (still here)</p>
                </div>
              </div>
            </div>

            {/* Recent Memories */}
            <div className="p-4 rounded-lg" style={{ backgroundColor: '#1a1a2e', borderLeft: '4px solid #a855f7' }}>
              <h3 className="font-bold text-purple-100 mb-2">📍 Locations</h3>
              <ul className="text-xs text-gray-300 space-y-1">
                <li>• The Underground (venue)</li>
                <li>• Quantum Brew Coffee (avoid)</li>
                <li>• Apartment (too quiet)</li>
                <li>• Coffee shop (new job)</li>
              </ul>
            </div>

            {/* Listening */}
            <div className="p-4 rounded-lg" style={{ backgroundColor: '#1a1a2e', borderLeft: '4px solid #a855f7' }}>
              <h3 className="font-bold text-purple-100 mb-2">♫ On Repeat</h3>
              <ul className="text-xs text-gray-300 space-y-1">
                <li>• Velvet Algorithms</li>
                <li>• Old Neon Requiem demos</li>
                <li>• The sound of silence</li>
                <li>• Existential dread</li>
              </ul>
            </div>

            {/* Help */}
            <div
              className="p-4 rounded-lg"
              style={{ backgroundColor: '#3f1f1f', borderLeft: '4px solid #dc2626' }}
            >
              <h3 className="font-bold text-red-200 mb-2">⚠️ Need Help?</h3>
              <p className="text-xs text-red-100">
                If you're struggling, reach out to someone. I didn't, and here we are.
              </p>
            </div>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer
        style={{ backgroundColor: '#1a1328', borderTop: '2px solid #a855f7' }}
        className="py-4 px-4 text-center mt-8"
      >
        <p style={{ color: '#a78bfa' }} className="text-xs">
          © 2024 Vex Drums. Neon Requiem Records. All songs rights reserved (by people who won't talk to me).
        </p>
        <p style={{ color: '#6b7280' }} className="mt-1 text-xs">
          "We're not broken. We're just paused. Tell yourself that enough times and it almost becomes true."
        </p>
      </footer>
    </div>
  )
}

export default VexDrumsBlogSite
