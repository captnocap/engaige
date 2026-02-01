/**
 * Anonymous Venue Poet Blog
 *
 * Mars's (Marcus Chen) secret personal blog where he writes extremely emotional,
 * often cringe poetry about running The Underground. Topics range from noise complaints
 * to his mysterious past at the Hartwell Building. The blog is written under the guise
 * of complete anonymity, though he has no idea how transparent he's being.
 *
 * Aesthetic: Dark, moody, noir-ish. Poetry formatting with heavy use of whitespace.
 * Completely anonymous according to Mars. Everyone else can tell it's him immediately.
 * URL: www.anonymousvenuepoet.corn
 */

import { useState } from 'react'
import type { SiteProps } from '../BrowserSiteContainer.js'
import { FILLER_SITES } from '../../../config/filler-sites.js'
import { StyledCard, Button } from '../../ui/shared/index.js'

const site = FILLER_SITES.venuepoetryblog

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
  hearts: number
  isPain?: boolean
}

const BLOG_POSTS: BlogPost[] = [
  {
    id: 'ode-to-847th-noise-complaint',
    title: 'Ode to the 847th Noise Complaint',
    date: 'January 24, 2026',
    excerpt: 'A meditation on bureaucracy, bass frequencies, and the slow death of artistic freedom.',
    readTime: '8 min read',
    hearts: 23,
    isPain: true,
    content: [
      'O Phone Call from City Hall,',
      'How you ring at 3 AM.',
      'Your voice like a broken amplifier,',
      'Speaking the language of regulations.',
      '',
      'They say the music is too loud.',
      'As if the 847th complaint will silence',
      'The way the bass moves through a room like blood,',
      'Like life itself demanding to be heard.',
      '',
      'I told them: You don\'t understand.',
      'The venue isn\'t loud.',
      'The world is quiet.',
      'We are the only noise left.',
      '',
      'They didn\'t care.',
      'They never do.',
      '',
      'Tomorrow I reduce the sound by 2 decibels.',
      'The artist weeps.',
      'The audience loses something they can\'t name.',
      'And somewhere, a bureaucrat nods in satisfaction.',
      '',
      'The 848th complaint is coming.',
      'I can feel it like a bass line in my ribs.',
    ],
    tags: ['bureaucracy', 'city-hall', '847', 'sound-levels', 'artistic-freedom'],
  },

  {
    id: 'the-bass-player-who-never-came-back',
    title: 'The Bass Player Who Never Came Back',
    date: 'January 18, 2026',
    excerpt: 'For Neon Requiem. The final show. The band that broke while the music still played.',
    readTime: '12 min read',
    hearts: 89,
    isPain: true,
    content: [
      'His name was Marcus.',
      '(Mine too. Funny.)',
      '',
      'The bass player of Neon Requiem walked off the stage on January 14th, 2024.',
      'Not because he had to.',
      'Because the song was ending.',
      '',
      'Two years ago, they were the legend in my venue.',
      'Post-punk prophets. Existential angels.',
      'The kind of band that makes you forget why you\'re angry at the world.',
      '',
      'They broke up on that stage.',
      'In front of 400 people.',
      'And it was the most beautiful thing I\'ve ever witnessed.',
      '',
      'The lead singer just... stopped singing.',
      'The drummer left the kit mid-beat.',
      'The guitarist walked into the crowd.',
      'And Marcus the bass player—',
      'He looked at the audience like he was saying goodbye to a lover.',
      '',
      'Then he was gone.',
      '',
      'They never played again.',
      'They didn\'t even announce it.',
      'One song. One moment. Then the light switched off.',
      '',
      'I cried in the back office for three hours.',
      'My staff didn\'t ask why.',
      'They knew.',
      '',
      'I still have the setlist.',
      'I still have the video.',
      'I still have the way their music made me feel like I wasn\'t alone.',
      '',
      'The bass player who never came back',
      'Took something with him.',
      'Something the 847th noise complaint will never understand.',
      '',
      'I hope he found it again.',
      'I hope they all did.',
    ],
    tags: ['neon-requiem', 'final-show', 'heartbreak', 'music', 'goodbye'],
  },

  {
    id: '3am-and-speakers-hum',
    title: '3 AM and the Speakers Still Hum',
    date: 'January 12, 2026',
    excerpt: 'Late night thoughts. The time when a venue owner becomes a philosopher.',
    readTime: '6 min read',
    hearts: 45,
    content: [
      'The band left at 2:47 AM.',
      'The crowd filtered out like sand from an hourglass.',
      'And now it\'s me and the speakers.',
      '',
      'They still hum.',
      'Even powered down, they hum.',
      'A ghost frequency. A memory of sound.',
      '',
      'I sit on the bar stool.',
      '(The one with the cracked vinyl seat.)',
      'And I watch the empty stage.',
      '',
      'Do you know what a venue is at 3 AM?',
      'It\'s a cathedral with no god.',
      'A concert hall that only echoes silence.',
      'A dream someone else had.',
      '',
      'The equipment smells like sweat and ambition.',
      'There\'s a setlist on the floor.',
      'Someone\'s drink left behind.',
      'A sock. (Why is there always a sock?)',
      '',
      'These are the artifacts of temporary joy.',
      'These are the ghosts of people who felt alive.',
      '',
      'And I am the priest of this space.',
      'Keeper of the stage.',
      'Guardian of the bass frequency.',
      'Cleaner of socks.',
      '',
      'The speakers hum.',
      'Maybe they\'re singing.',
      'Maybe they\'re remembering.',
      'Maybe they\'re crying like I cry.',
      '',
      'At 3 AM, we are all just humming.',
      'Trying to remember what the music sounded like.',
    ],
    tags: ['3am', 'venue-life', 'late-night', 'empty-stage', 'loneliness'],
  },

  {
    id: 'left-hartwell-for-reason',
    title: 'I Left Hartwell for a Reason',
    date: 'January 5, 2026',
    excerpt: 'Some places keep you. Some places consume you. Hartwell was the second kind.',
    readTime: '14 min read',
    hearts: 156,
    isPain: true,
    content: [
      'People ask me why I left Hartwell.',
      'They ask with this tone that suggests there\'s a story.',
      'A scandal. A mystery.',
      '',
      'There isn\'t.',
      'Or there is.',
      'Or there was, and I\'m not the person who got to keep it.',
      '',
      'The Hartwell Building was beautiful in the way beautiful things are dangerous.',
      'It had a 13th floor that didn\'t exist. (Or did exist. Depends on how you counted.)',
      'It had a 7th floor that was a mirror of somewhere else. (I\'ll never confirm what.)',
      'It had secrets in the walls like someone building a monument to secrets.',
      '',
      'I worked there for seven years.',
      'In maintenance. In the background.',
      'Watching.',
      '',
      'I watched the building breathe.',
      'I watched the elevators go to floors that shouldn\'t exist.',
      'I watched people come in changed. Or not come out at all.',
      '',
      'One night—',
      'And I can\'t say more than this.',
      'I learned something about the building that changed my understanding of everything.',
      'About space. About time. About whether buildings are alive.',
      '',
      'The next morning, I resigned.',
      'Packed my things.',
      'Told no one why.',
      '',
      'They asked me to stay.',
      '(Not the people. The building.)',
      'I could feel it asking.',
      '',
      'But I couldn\'t. Because once you know a building is alive,',
      'You can\'t unknow it.',
      'And once a building knows you know,',
      'It won\'t let you leave.',
      '',
      'So I took my knowledge and my trauma and my inexplicable sense of having survived something,',
      'And I found the Underground.',
      '',
      'A basement venue became my new cathedral.',
      'Instead of 13th floors and mirror reflections,',
      'I got bass frequencies and temporary joy.',
      '',
      'It was the only way to escape.',
      '',
      'Hartwell is still there.',
      'Still breathing.',
      'Still keeping its secrets.',
      'Still waiting for me to come back.',
      '',
      'I won\'t.',
      '',
      'Some places, you leave once and you\'re done.',
      'Some places, you leave and they follow you forever.',
      'Hartwell is the second kind.',
      '',
      'It\'s in everything I do.',
      'In every bass frequency.',
      'In every dark room.',
      'In every moment I hold my breath and listen.',
      '',
      'The building won\'t release me.',
      'And I won\'t give it the satisfaction of trying again.',
    ],
    tags: ['hartwell', 'past', 'mystery', 'escape', 'the-building'],
  },

  {
    id: 'trust-fall-guy-haiku',
    title: 'The Trust Fall Guy (A Haiku)',
    date: 'December 28, 2025',
    excerpt: 'Three lines. One observation. A 78.5% catch rate.',
    readTime: '1 min read',
    hearts: 12,
    content: [
      'Man falls from platform',
      'Trust Fall Tim catches him twice—',
      '2,847',
    ],
    tags: ['trust-fall-tim', 'haiku', 'observation', 'hope'],
  },

  {
    id: 'why-i-banned-wonderwall',
    title: 'Why I Banned Wonderwall (A Sonnet)',
    date: 'December 20, 2025',
    excerpt: 'A 14-line meditation on why certain songs deserve to die.',
    readTime: '4 min read',
    hearts: 203,
    isPain: true,
    content: [
      'Some songs are like diseases of the ear,',
      'They spread through crowds like contagion\'s call,',
      'And patrons think they\'ve reached the atmosphere,',
      'When really, they just can\'t hear music at all.',
      '',
      'This song—this cursed and awful, dreary thing—',
      'Has killed a thousand artists\' perfect nights,',
      'When drunk civilians start to cry and sing',
      'And drown out every genuine delight.',
      '',
      'I banned it from my stage with righteous pain,',
      'Though crowds have hated me for this decree,',
      'But venues are not democracies, my friend—',
      'Sometimes you must protect what\'s meant to be.',
      '',
      'So let this song die in some corporate place,',
      'The Underground will never show its face.',
    ],
    tags: ['wonderwall', 'banned-songs', 'artistic-integrity', 'sonnet', 'nemesis'],
  },

  {
    id: 'derek-cries-coffee',
    title: 'Derek Cries Into His Coffee (Free Verse)',
    date: 'December 15, 2025',
    excerpt: 'An observation about a regular customer. The human condition. Quantum coffee.',
    readTime: '7 min read',
    hearts: 67,
    content: [
      'There is a man who comes in every morning.',
      'Derek, he tells people his name is Derek.',
      'He orders the same coffee.',
      '($47 for something that costs $4 because he thinks it\'s special,)',
      'And he sits in the corner booth by the dark window,',
      'And he cries into it.',
      '',
      'Not sobbing.',
      'Not dramatic.',
      'Just this quiet overflow,',
      'Like his eyes are faucets someone forgot to turn off.',
      '',
      'I know that look.',
      'I see it in every person who comes to a venue.',
      'The look of someone carrying weight they can\'t name.',
      '',
      'Derek comes for the coffee.',
      'He stays for the darkness of the space.',
      'He stays because nobody asks him why he\'s crying.',
      'They just let him sit with his expensive beans and his expensive sadness.',
      '',
      'Once I asked him about the coffee.',
      'He gave me a 47-minute explanation about quantum states and observation and how',
      'Awareness changes the flavor of things.',
      'I didn\'t understand.',
      'But I understood the loneliness underneath.',
      '',
      'Derek doesn\'t come to hear music.',
      'Derek comes to hear the space breathe.',
      'Like me.',
      '',
      'We are brothers in the darkness,',
      'Crying into different things,',
      'Both convinced we\'re alone.',
      '',
      'My coffee is bass frequency.',
      'His is something he\'ll never explain.',
      '',
      'But the tears taste the same.',
    ],
    tags: ['derek', 'observation', 'coffee', 'sadness', 'connection'],
  },

  {
    id: 'mildred-brought-sushi-again',
    title: 'Mildred Brought Sushi Again',
    date: 'December 8, 2025',
    excerpt: 'She keeps showing up. She keeps feeding me. I don\'t know how to tell her.',
    readTime: '5 min read',
    hearts: 34,
    content: [
      'Mildred came through the side door at 8 PM.',
      'She always uses the side door.',
      'Like she\'s a ghost.',
      'Like she\'s not quite real.',
      '',
      '"I brought sushi," she said.',
      '',
      'She always brings sushi.',
      'California rolls.',
      'Spicy tuna.',
      'The things she thinks I like.',
      '(I\'ve never told her I do. Or don\'t. I just eat them and don\'t say anything.)',
      '',
      'Mildred watches the bands.',
      'Watches the people.',
      'Watches me watching the people.',
      'And then she brings sushi.',
      '',
      'I don\'t know what she wants.',
      'I don\'t know what she thinks will happen.',
      'I don\'t know if she understands that a venue owner is a type of ghost too,',
      'Haunting the space he built,',
      'Unable to leave,',
      'Unable to really stay.',
      '',
      'But she keeps coming.',
      'And she keeps bringing sushi.',
      'And I keep not knowing what to do about it.',
      '',
      'Today she smiled at me.',
      'Not said anything.',
      'Just smiled.',
      'Like she knew something I didn\'t.',
      '',
      'I turned away.',
      'I always do.',
      '',
      'She left the sushi on the bar.',
      'And disappeared into the back like she was never there.',
      '',
      'Maybe she wasn\'t.',
      'Maybe Mildred is the building breathing.',
      'Maybe she\'s another ghost I invited to haunt this place.',
      '',
      'The sushi is still there.',
      'Getting cold.',
      'I eat it anyway.',
      'Because that\'s what you do when someone brings you sushi.',
      'Even if you don\'t know who they are.',
      'Even if you\'re afraid of what it means.',
    ],
    tags: ['mildred', 'confusion', 'kindness', 'distance', 'mystery'],
  },

  {
    id: 'underground-will-outlive-us',
    title: 'The Underground Will Outlive Us All',
    date: 'December 1, 2025',
    excerpt: 'A meditation on legacy. On what we build. On what we leave behind.',
    readTime: '9 min read',
    hearts: 127,
    content: [
      'The Underground will outlive me.',
      'This I know the way I know my own breath.',
      'The way I know the bass frequency of a room.',
      'The way I know that Hartwell Building is still breathing somewhere beneath this city.',
      '',
      'When I am gone—',
      'And I will be gone.',
      'All of us will be gone.',
      'Someone else will stand where I stand.',
      'And feel what I feel.',
      '',
      'They will see the stage I built.',
      'They will hear the echoes of every band who ever played here.',
      'They will wonder about the person who made this space,',
      'And they will never quite know.',
      '',
      'This is not sad.',
      'This is love.',
      '',
      'I am building a legacy in bass frequencies.',
      'I am constructing eternity out of temporary joy.',
      'I am making something that will remember the people who forgot themselves here.',
      '',
      'The Underground is a living thing.',
      'I feed it with risk.',
      'I feed it with faith in music.',
      'I feed it with the part of me that Hartwell couldn\'t keep.',
      '',
      'Long after I\'m dust,',
      'People will come here.',
      'They will fall in love.',
      'They will hear music that changes them.',
      'They will cry in the back office.',
      'They will sit in the corner booth and wonder why they feel less alone.',
      '',
      'And they won\'t know it\'s because I stayed.',
      'Because I chose this basement over the 13th floor.',
      'Because I decided that temporary was enough.',
      'That temporary was everything.',
      '',
      'The Underground will outlive me.',
      'And that\'s the only immortality I need.',
      '',
      'Some things,',
      'You don\'t build to last forever.',
      'You build them to matter while they\'re here.',
      '',
      'And then you let them go.',
      'Knowing they\'ll keep glowing in the dark,',
      'Long after your candle burned out.',
    ],
    tags: ['legacy', 'the-underground', 'permanence', 'meaning', 'goodbye'],
  },
]

const SIDEBAR_NOTES = [
  'This blog is completely anonymous. Nobody knows who writes it.',
  'No identifying details. I am a voice from the darkness.',
  'The Underground is just a metaphor. Probably.',
  'Hartwell Building references are purely fictional. Absolutely.',
  'If you recognize yourself in these poems, that\'s a coincidence.',
  'A very specific, detailed coincidence.',
]

const ABOUT_TEXT = `I am a voice from the darkness.

I run a place where people come to feel alive. A venue. A basement. A cathedral for the temporary.

By day, I am professional. I handle permits. I negotiate with bands. I pay taxes. I exist in the world as a functional human being.

By night, I am this.

These poems are my confession. My therapy. My way of processing the weight of holding space for other people\'s joy while your own gets smaller.

I have lived through things I cannot name. I have learned things about buildings that physics says shouldn\'t be true. I have watched people\'s lives change on my stage.

And I am alone with all of it.

This blog is my way of not being alone.

If you are reading this, you understand what it means to carry the weight of a place. To be the keeper of temporary joy. To love something so much it breaks you every night.

Or maybe you\'re just bored and found this by accident.

Either way: Welcome to the dark. Welcome to where the real things live.`

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
      bgColor="#1a1a1a"
      borderColor="#3d3d3d"
      textColor="#e0e0e0"
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs text-gray-500">{post.date}</span>
        {post.isPain && (
          <span className="text-xs bg-red-950 text-red-300 px-2 py-0.5 rounded">
            💔 PAIN
          </span>
        )}
      </div>
      <h2 className="text-lg font-bold text-gray-100 mb-2 hover:text-white">
        {post.title}
      </h2>
      <p className="text-sm text-gray-400 mb-3 italic">{post.excerpt}</p>
      <div className="flex justify-between items-center text-xs text-gray-500">
        <span>✍️ {post.readTime}</span>
        <span>❤️ {post.hearts} hearts</span>
      </div>
      <div className="flex flex-wrap gap-1 mt-2">
        {post.tags.slice(0, 3).map(tag => (
          <span key={tag} className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded">
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
      bgColor="#1a1a1a"
      borderColor="#3d3d3d"
      textColor="#e0e0e0"
    >
      <Button
        variant="link"
        size="sm"
        textColor="#999999"
        onClick={onBack}
        className="mb-6"
      >
        ← Back to poems
      </Button>

      <div className="flex justify-between items-start mb-4">
        <span className="text-xs text-gray-600">{post.date}</span>
        {post.isPain && (
          <span className="text-xs bg-red-950 text-red-300 px-2 py-0.5 rounded">
            💔 PAIN
          </span>
        )}
      </div>

      <h1 className="text-3xl font-bold text-gray-100 mb-6 leading-tight">{post.title}</h1>

      {/* Poetry with proper formatting and whitespace */}
      <div className="prose prose-invert max-w-none mb-6">
        {post.content.map((line, i) => (
          <p
            key={i}
            className={`text-gray-300 mb-3 text-base leading-relaxed ${
              line === '' ? 'mb-6' : ''
            }`}
            style={{
              fontFamily: 'Georgia, serif',
              whiteSpace: 'pre-wrap',
              color: line === '' ? 'transparent' : '#d1d5db',
            }}
          >
            {line === '' ? '.' : line}
          </p>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t border-gray-700">
        <div className="flex flex-wrap gap-2 mb-6">
          {post.tags.map(tag => (
            <span key={tag} className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded">
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
        bgColor="#2a2a2a"
        borderColor="#3d3d3d"
        textColor="#999999"
      >
        <p className="font-bold text-gray-300">❤️ {post.hearts} people felt this</p>
        <p className="text-gray-500 text-xs mt-2">
          Comments are disabled. Some things should stay in the darkness.
        </p>
      </StyledCard>
    </StyledCard>
  )
}

// ============================================================================
// Main Site
// ============================================================================

export function VenuePoetBlogSite({ siteId }: SiteProps) {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null)
  const [showAbout, setShowAbout] = useState(false)

  return (
    <div className="min-h-full" style={{ background: '#0f0f0f' }}>
      {/* Header */}
      <header className="bg-black text-white py-8 px-4 border-b border-gray-800">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-5xl">🎵</span>
            <div>
              <h1 className="text-3xl font-bold text-gray-100">Anonymous Venue Poet</h1>
              <p className="text-gray-500 text-sm italic mt-1">
                "The truth emerges from the darkness"
              </p>
            </div>
          </div>
          <nav className="flex gap-6 mt-6 text-sm">
            <button
              onClick={() => {
                setSelectedPost(null)
                setShowAbout(false)
              }}
              className="text-gray-400 hover:text-white transition-colors"
            >
              Poems
            </button>
            <button
              onClick={() => {
                setSelectedPost(null)
                setShowAbout(true)
              }}
              className="text-gray-400 hover:text-white transition-colors"
            >
              About
            </button>
            <button className="text-gray-400 hover:text-white transition-colors">Archive</button>
            <button className="text-gray-400 hover:text-white transition-colors">
              Contact (Anonymous Form)
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Posts Column */}
          <div className="flex-1">
            {showAbout ? (
              <StyledCard
                variant="default"
                padding="lg"
                borderRadius="md"
                shadow="md"
                bgColor="#1a1a1a"
                borderColor="#3d3d3d"
                textColor="#e0e0e0"
              >
                <h2 className="text-2xl font-bold text-gray-100 mb-4">About This Voice</h2>
                <div className="flex gap-4 mb-6">
                  <div className="text-6xl">🌙</div>
                  <div>
                    <p className="font-bold text-gray-100">The Keeper of a Dark Place</p>
                    <p className="text-sm text-gray-400">Age 38 | Anonymous | Completely Unknown</p>
                    <p className="text-xs text-gray-600 mt-1">
                      (Definitely not the owner of a specific underground venue)
                    </p>
                  </div>
                </div>
                <div className="text-sm text-gray-300 whitespace-pre-line leading-relaxed">
                  {ABOUT_TEXT}
                </div>
                <StyledCard
                  variant="default"
                  padding="md"
                  borderRadius="sm"
                  shadow="none"
                  className="mt-6"
                  bgColor="#2a2a2a"
                  borderColor="#3d3d3d"
                  textColor="#999999"
                >
                  <p className="font-bold text-gray-300">📊 Anonymous Stats</p>
                  <ul className="text-gray-400 text-xs mt-2 space-y-1">
                    <li>• Years running a venue: Unknown</li>
                    <li>• Years since Hartwell: Unknown (but haunting)</li>
                    <li>• Noise complaints received: 847</li>
                    <li>• Trust Fall Tim falls caught: 2,847 (observed)</li>
                    <li>• Poetry collection: Growing daily</li>
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
                  className="mb-6"
                  bgColor="#2a2a2a"
                  borderColor="#3d3d3d"
                  textColor="#999999"
                >
                  <p className="text-gray-400 text-sm">
                    🌙 <strong>Welcome to the darkness.</strong> These poems are completely anonymous.
                    They could be about anyone. They are definitely not about a specific person running
                    a specific venue at a specific address.
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
          <aside className="w-64 hidden lg:block">
            {/* Subscribe (anonymously) */}
            <StyledCard
              variant="default"
              padding="md"
              borderRadius="md"
              shadow="md"
              className="mb-4"
              bgColor="#1a1a1a"
              borderColor="#3d3d3d"
              textColor="#e0e0e0"
            >
              <h3 className="font-bold text-gray-100 mb-2">📬 Get New Poems</h3>
              <p className="text-xs text-gray-400 mb-3">
                Anonymous email delivery. No one will ever know you read these.
              </p>
              <input
                type="email"
                placeholder="your.secret@email.corn"
                className="w-full px-2 py-1.5 text-xs border border-gray-700 rounded bg-gray-900 text-gray-300 focus:outline-none focus:border-gray-600"
              />
              <Button
                variant="primary"
                size="sm"
                width="full"
                backgroundColor="#3d3d3d"
                textColor="#e0e0e0"
                className="mt-2"
              >
                Subscribe
              </Button>
            </StyledCard>

            {/* Anonymous Assurance */}
            <StyledCard
              variant="default"
              padding="md"
              borderRadius="md"
              shadow="md"
              className="mb-4"
              bgColor="#1a1a1a"
              borderColor="#3d3d3d"
              textColor="#e0e0e0"
            >
              <h3 className="font-bold text-gray-100 mb-2">🔒 Your Privacy</h3>
              <ul className="text-xs text-gray-400 space-y-1">
                {SIDEBAR_NOTES.map((note, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-gray-600">•</span>
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </StyledCard>

            {/* Recent Themes */}
            <StyledCard
              variant="default"
              padding="md"
              borderRadius="md"
              shadow="md"
              className="mb-4"
              bgColor="#1a1a1a"
              borderColor="#3d3d3d"
              textColor="#e0e0e0"
            >
              <h3 className="font-bold text-gray-100 mb-2">🎵 Common Themes</h3>
              <div className="space-y-2 text-xs">
                <div>
                  <p className="text-gray-300">Running a Venue</p>
                  <p className="text-gray-600">The weight of temporary joy</p>
                </div>
                <div>
                  <p className="text-gray-300">Hartwell Building</p>
                  <p className="text-gray-600">Never to be named or elaborated on</p>
                </div>
                <div>
                  <p className="text-gray-300">Music & Loss</p>
                  <p className="text-gray-600">Watching things end beautifully</p>
                </div>
                <div>
                  <p className="text-gray-300">Loneliness</p>
                  <p className="text-gray-600">The cost of holding others up</p>
                </div>
              </div>
            </StyledCard>

            {/* Legal Disclaimer */}
            <StyledCard
              variant="default"
              padding="md"
              borderRadius="md"
              shadow="md"
              bgColor="#2a1a1a"
              borderColor="#4a2a2a"
              textColor="#cc6666"
            >
              <h3 className="font-bold text-red-400 mb-2">⚠️ Completely Fictional</h3>
              <p className="text-xs text-red-600">
                Any resemblance to real venues, real venue owners, or real buildings is purely
                coincidental. The Hartwell Building is not real. The Underground is a metaphor.
                Derek doesn't exist. (Please don't tell him I wrote this.)
              </p>
            </StyledCard>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-black text-gray-600 py-4 px-4 text-center text-xs mt-12">
        <p>© Unknown Year | {site?.name || 'Anonymous Venue Poet'}</p>
        <p className="mt-1">
          Written in the darkness. Published from the shadows. Read by no one I know.
        </p>
      </footer>
    </div>
  )
}

export default VenuePoetBlogSite
