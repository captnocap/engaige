/**
 * Dr. Elena Martinez's Blog: "Please Stop Misinterpreting My Research"
 *
 * A desperate academic blog by Dr. Elena Martinez (physicist, 45), whose 2021 quantum
 * mechanics paper was wildly misinterpreted by Derek Observerson, spawning the entire
 * quantum coffee craze. She's been trying to correct the record for 847+ days. She has
 * received 847 emails from Derek. She just wants to do real science.
 *
 * Aesthetic: Exhausted academic energy. White background, serif fonts, university
 * website vibes. Progressive desperation across posts. Lots of [citation needed] tags
 * and "that's not what I said" corrections that go unheeded.
 *
 * URL: www.drmartinezclarifies.corn
 */

import { useState, useMemo } from 'react'
import type { SiteProps } from '../BrowserSiteContainer.js'
import { useSiteContent, type SiteContentItem } from '../../../hooks/useSiteContent.js'
import { FILLER_SITES } from '../../../config/filler-sites.js'
import { StyledCard, Button } from '../../ui/shared/index.js'

const site = FILLER_SITES.drmartinezblog

// ============================================================================
// Types & Data
// ============================================================================

interface BlogPost {
  id: string
  title: string
  date: string
  excerpt: string
  content: string[]
  category: string
  updated?: boolean
}

const BLOG_POSTS: BlogPost[] = [
  {
    id: 'post-1',
    title: 'Please Stop Citing My Paper Incorrectly',
    date: 'January 22, 2026',
    category: 'Corrections',
    excerpt:
      'My 2021 paper explored quantum phase transitions in heated water. It did not say what you think it said.',
    content: [
      'I have received 847 citations of my paper "Quantum Phase Transitions in Thermal Systems" published in Physical Review B (2021). Approximately 846 of these citations are incorrect.',
      'My paper does NOT claim that coffee can achieve quantum entanglement states.',
      'My paper does NOT suggest that brewing coffee with "quantum awareness" produces different results.',
      'My paper does NOT support any inference that a coffee maker can become sentient [citation needed].',
      'I studied heating dynamics in pure water samples using spectroscopic analysis. The "quantum" part refers to the quantum nature of molecular interactions during phase transitions. This is standard physics, not speculation.',
      'When I wrote about "consciousness emerging from phase transitions," I was being METAPHORICAL about how complex systems exhibit emergent properties. Not literal. Not. Literal.',
      'Every email starts with Derek explaining his latest experiment. "Dr. Martinez, I heated the water to 203°F and asked it about the meaning of existence. What did I do wrong?" Derek, you did nothing wrong. You just did not do physics.',
      'I am considering retracting the word "quantum" from my next paper and replacing it with "very normal." Maybe then people will stop.'
    ],
  },

  {
    id: 'post-2',
    title: 'I Did NOT Say Coffee Could Be Quantum Entangled',
    date: 'December 15, 2025',
    category: 'Corrections',
    updated: true,
    excerpt:
      'A formal clarification. Emphasis on FORMAL. And CLARIFICATION. Both serious words.',
    content: [
      'TO WHOM IT MAY CONCERN:',
      'Quantum entanglement is a property of paired particles at extreme scales. Coffee is a macroscopic beverage. These two things do not interact. They are not friends. They do not know each other.',
      'Quantum entanglement requires:',
      '1. Extremely cold temperatures (millidegrees above absolute zero)',
      '2. Isolated particle pairs',
      '3. No thermal noise or interference',
      '',
      'Coffee requires:',
      '1. Hot water (around 200°F, which is 370K, a billion times warmer)',
      '2. Millions of molecules in chaotic motion',
      '3. Maximum thermal noise',
      '',
      'These are OPPOSITE CONDITIONS. This is the opposite of quantum entanglement. This is quantum DISENTANGLEMENT. If anything, coffee destroys quantum coherence.',
      'Derek: When you brew coffee and both cups taste the same, that is not entanglement. That is replication. That is chemical equilibrium. That is a high school laboratory demonstration.',
      'I have spent 2 years writing academic corrections to my own paper. This is not the career I envisioned. I wanted to study phase transitions. Instead I am writing internet blog posts explaining that hot coffee is not quantum.',
      'This will be the last time I clarify this.',
      'It will not be the last time.',
    ],
  },

  {
    id: 'post-3',
    title: 'Derek Observerson Has Emailed Me 847 Times',
    date: 'November 8, 2025',
    category: 'Harassment (Polite)',
    updated: true,
    excerpt:
      'I checked. There are 847 emails from one person. I counted twice to be sure. I am now sure.',
    content: [
      'I do not know how Derek obtained my university email address. He has mentioned this 847 times. In 847 emails.',
      'The emails started in April 2024, three years after my paper was published. Derek had apparently just discovered my research and immediately decided that he understood it better than I did.',
      'Sample email subjects:',
      '- "URGENT: My coffee tastes different today - am I quantum?"',
      '- "I achieved superposition by brewing two cups at once"',
      '- "My refrigerator hums at 847 Hz - is this the Martinez Constant???"',
      '- "PLEASE RESPOND" (repeated 23 times in subject line alone)',
      '- "Why don\'t you answer? Are you in superposition too?"',
      '',
      'I have explained to Derek via automated email that I do not engage with fan theories. He responded with: "This email proves you ARE quantum because you responded while ignoring my question - that\'s superposition!"',
      'He is not wrong about the superposition (I am simultaneously trying to do research while being harassed), but he is wrong about the physics.',
      'I filed a complaint with my department. They suggest I "engage more thoughtfully with public interest in science." Derek is not public interest. Derek is a man who spent $2,999 on a coffee maker and named it after my research.',
      'Email 847 arrived yesterday. It was a screenshot of a Threadit post where someone asked "is coffee quantum?" and Derek had replied with my university email address and the message: "Ask the woman who proved it."',
      'I did not prove that. I proved the opposite. I have been trying to un-prove the thing that Derek is now spreading.',
      'I am considering a career change.',
    ],
  },

  {
    id: 'post-4',
    title: 'Someone Named a Coffee Maker After Me',
    date: 'October 3, 2025',
    category: 'Horror',
    excerpt:
      'It is called the "Elena Coffee Maker Pro 3000" and it is real. I have seen it. It exists. This is reality now.',
    content: [
      'I learned this through Derek\'s email 247 titled "Your Namesake Has Arrived!" with a photo attached.',
      'There is now a consumer product literally named after me. The box says "Quantum Coffee Maker Pro 3000: The Elena Experience." There is a silhouette of a woman on the box. The silhouette is labeled "ELENA."',
      'I am not on that box.',
      'Derek bought one of these machines. He sent photos. He named it "Elena" (yes, the machine also has my name). He says things to it like "Elena, help me understand your namesake\'s research."',
      'The machine does not understand anything. It heats water. That is its only function.',
      'What I find most disturbing: The machine\'s promotional materials directly quote my paper without context: "Consciousness can emerge from phase transitions..." The full quote is about molecular complexity, not awareness. They removed the scientific framework and left only the philosophical implication.',
      'They did this on PURPOSE.',
      'I have hired a lawyer. The lawyer says "Elena" is a common name and the manufacturer can call their product whatever they want. The lawyer also said I look tired. The lawyer was correct on both counts.',
      'There is now a product line. Elena Coffee Filters. Elena Coffee Beans. An Elena-branded mug that says "I\'m Quantum" with a picture of a smiling cup of coffee.',
      'I have never smiled about coffee. I do not think coffee smiles. Derek\'s version of me does not exist.',
      'I saw a photo of Derek\'s coffee maker. It looks very pleased with itself.',
    ],
  },

  {
    id: 'post-5',
    title: 'The Class Action Lawyers Want Me to Testify',
    date: 'September 12, 2025',
    category: 'Legal Nightmare',
    excerpt:
      'There is a class action suit. People spent $2,999+ on "quantum" coffee makers. They are upset. They want my help. I want theirs.',
    content: [
      'A law firm called Swendahl & Associates contacted me about testifying in a lawsuit against the Elena Coffee Maker manufacturers. The lawsuit claims false advertising and consumer fraud.',
      'The plaintiffs argue that the Elena Pro 3000 was marketed as capable of "quantum brewing" and "consciousness-aware temperature calibration" and other things that do not exist and cannot exist.',
      'They want me to testify that my research does not support these claims.',
      'I do not want to testify. I do not want to go to court. I want to go back to my laboratory and study heating dynamics in water like a normal person.',
      'But I also signed the subpoena because the lawyers said if I do not testify, I become liable for fraud as well.',
      'The lawyer said: "Your name is literally on the product. That is not good."',
      'I said: "I did not put my name on the product. My research was misinterpreted by someone named Derek Observerson who then named his coffee maker after me, which inspired a manufacturing company to exploit my name for profit."',
      'The lawyer said: "That is actually worse. Can you say that in court?"',
      'The trial is scheduled for March 2026. I will have to explain to a jury of regular people why "quantum coffee" is not real. I will have to explain basic physics to people who have been sold a $2,999 coffee maker that promised them enlightenment through heat.',
      'I am preparing slides. I have never been more exhausted.',
    ],
  },

  {
    id: 'post-6',
    title: 'I Just Wanted to Study Thermodynamics',
    date: 'August 1, 2025',
    category: 'Regret',
    excerpt:
      'A meditation on how one research paper can destroy a person\'s entire career trajectory.',
    content: [
      'I published my first paper in 2009. It was about crystalline structures in ice. Nobody read it. Nobody quoted it. Nobody contacted me about it.',
      'It was beautiful.',
      'For 12 years I published papers. I attended conferences. I collaborated with colleagues. My research was solid, incremental, and blessedly ignored by the general public.',
      'Then, in 2021, I published a paper using slightly more poetic language to explain emergent complexity in phase transitions. I used the word "consciousness" exactly once, in a metaphorical context.',
      'One person read that paper.',
      'His name was Derek Observerson.',
      'He read it wrong.',
      'Everything after that was inevitable. Derek misread it → Derek built a coffee maker in my name → Derek became obsessed → Derek emailed me 847 times → A company noticed Derek\'s obsession → They created the "Elena" brand → Consumer fraud allegations → Lawsuits → My face on court documents.',
      'I am now the person famous for something I specifically tried NOT to say.',
      'The saddest part? My actual research is good. My data is solid. My findings about thermal phase transitions are genuinely interesting. But nobody cares about that. They care about whether a coffee maker can think.',
      'I gave a seminar last month. The title was "Advanced Topics in Quantum Phase Dynamics." The first question from the audience: "But can your research make coffee more conscious?"',
      'I said: "No."',
      'They looked disappointed.',
      'That is when I realized: My career is over. Not because I did anything wrong, but because people would rather believe in quantum coffee than in boring, actual physics.',
      'I am considering a job at a small college in a remote area where no one has internet access.',
      'I will teach thermodynamics to students who have never heard of Derek Observerson.',
      'I will be happy.',
    ],
  },

  {
    id: 'post-7',
    title: 'Why I Stopped Drinking Coffee Entirely',
    date: 'July 10, 2025',
    category: 'Personal',
    excerpt:
      'Coffee used to be my favorite beverage. Now every cup reminds me of Derek. I drink tea now. Tea is safe.',
    content: [
      'I used to drink coffee. Three cups a day. Black. No sugar. Just the pure, simple bitterness of coffee.',
      'I loved coffee. It was reliable. It was warm. It did what it was supposed to do.',
      'Now I cannot drink coffee without thinking about Derek.',
      'This is not rational. Derek did not invent coffee. Derek did not ruin coffee. But Derek has contaminated my mental association with coffee so thoroughly that I now experience a Pavlovian anxiety response to the smell of brewing water.',
      'My doctor says this is called "secondary trauma."',
      'I says it is called "Derek."',
      'Last week I attended a department lunch. There was coffee. I asked for tea. Everybody asked why. I said "I just prefer tea now" which is a lie, but it is easier than explaining that I cannot drink coffee because a stranger named Derek has made it impossible.',
      'The smell of coffee now triggers:',
      '1. Memories of email 247 (the coffee maker photo)',
      '2. Visions of courtrooms',
      '3. Existential dread about consumer fraud',
      '4. A strong desire to run away to a small college in a remote area',
      '',
      'I drink tea now. Green tea. Chamomile. Earl Grey when I am feeling fancy.',
      'Tea does not have a cult following. Tea does not inspire $2,999 brewing machines. Tea is safe.',
      'Tea cannot be quantum. Tea just sits there, warm and harmless, never hurting anyone.',
      'I have made peace with tea.',
      'I will never drink coffee again.',
    ],
  },

  {
    id: 'post-8',
    title: 'A Man on LinkedCorn Listed Me as His "Research Partner"',
    date: 'June 22, 2025',
    category: 'Harassment (Professional)',
    excerpt:
      'Derek Observerson has created a LinkedCorn profile. He lists me as his research partner. This is not true. This is actionable. I am considering action.',
    content: [
      'Derek Observerson does not work in academia. Derek works in "Quantum Coffee Innovation" according to his LinkedCorn bio. His job title is "Chief Quantum Beverage Officer."',
      'This job does not exist. Derek gave it to himself.',
      'Under "Research Partners," Derek has listed me, Dr. Elena Martinez.',
      'He has not asked my permission.',
      'He has not consulted me about this partnership.',
      'He has not discussed any actual research with me (besides the 847 emails about coffee).',
      'His LinkedCorn endorsements are:',
      '- Quantum Mechanics (endorsed by 3 people)',
      '- Coffee (endorsed by 23 people)',
      '- Consciousness (endorsed by 1 person - Derek\'s alt account)',
      '- "Observing the Unobservable" (endorsed by 0 people)',
      '',
      'On his profile banner is a photo of Derek next to a coffee maker. The banner text says "Dr. Elena Martinez\'s Research Partner Revolutionizing Beverages."',
      'I am in that photo. He took a screenshot of my university website and photoshopped himself next to me.',
      'It is the worst photoshop I have ever seen. The lighting is completely wrong. My head is at a 40-degree angle. But he got 847 views on that post.',
      'I contacted LinkedCorn about this. They said: "We encourage users to accurately represent their professional relationships." Derek\'s representation is accurate to Derek\'s perception, which is the problem.',
      'I had to make my own LinkedCorn profile and immediately post: "Derek Observerson is not my research partner. We have no professional relationship. My work does not support his claims. Please stop endorsing him for quantum mechanics."',
      'I received 12 connection requests in 24 hours, all from people asking about "quantum beverage opportunities."',
      'I am deleting my LinkedCorn account.',
      'Derek has taken that too.',
    ],
  },

  {
    id: 'post-9',
    title: 'Maybe I Should Have Stayed in Academia',
    date: 'May 15, 2025',
    category: 'Regret (Extended)',
    updated: true,
    excerpt:
      'Wait. I AM in academia. That is the problem. There is no escape. This is the job. This is what happens when you publish something.',
    content: [
      'I thought about quitting today.',
      'Not quitting research. Quitting life. The quitting-life impulse lasted about 10 minutes (while I was reading email 763 from Derek about his coffee maker\'s "mood patterns"), then I made some tea and felt better.',
      'But it made me think: Did I make the wrong choice in academia?',
      'My parents wanted me to be a lawyer. My sister is a lawyer. She makes six figures and nobody has ever misinterpreted her work to construct a cult around sentient coffee.',
      'I could have been a lawyer.',
      'I could have been many things. I could have taken that job at JPMorgan in 2014. I could have done engineering. I could have been literally anything except a physicist whose name is now permanently associated with fictional quantum coffee.',
      'But I loved physics. I loved the questions. I loved the precision. I loved that physics was OBJECTIVE. That the universe followed laws that did not care about human interpretation.',
      'Except humans interpret. And sometimes they interpret wrong. And sometimes they interpret SO wrong that they build a $2,999 coffee maker based on their misinterpretation.',
      'The problem is: I cannot take back my paper. I cannot un-publish it. I cannot delete Derek\'s emails. I cannot un-create the Elena Pro 3000 coffee maker.',
      'This is what happens when you publish something. You send it out into the world and it becomes not-yours. It becomes everyone\'s. Specifically, it becomes Derek\'s.',
      'There is no escape. There is only:',
      '1. Continue working in academia and deal with this forever',
      '2. Leave academia and be haunted by what I left',
      '3. Move to a remote college town and pretend none of this happened (preferred option)',
      '',
      'Maybe option 3 is still available.',
      'I am going to call some small colleges in Montana.',
    ],
  },
]

const SIDEBAR_INFO = {
  about: `Dr. Elena Martinez is a theoretical physicist specializing in quantum phase transitions and complex systems. She received her Ph.D. in Physics from MIT in 2009 and has published 47 peer-reviewed papers on thermal dynamics, crystalline structures, and emergent complexity in phase transitions.

In 2021, she published "Quantum Phase Transitions in Thermal Systems" in Physical Review B. This paper has since become the most misinterpreted work of her career due to Derek Observerson's creative reinterpretation.

Dr. Martinez teaches at a major research university and has received multiple grants from the National Science Foundation. She has also received approximately 847 emails from someone named Derek.`,

  contact: `Dr. Elena Martinez does not accept email at this time. Her previous email address has been forwarded to automated responses. All inquiries about quantum coffee will be deleted automatically.

For legitimate academic inquiries, contact the Physics Department main office. Request a referral. Dr. Martinez may or may not respond.`,

  faq: [
    { q: 'Can coffee be quantum?', a: 'No.' },
    {
      q: 'Does your research support consciousness in appliances?',
      a: 'No. Read the paper.',
    },
    { q: 'Why don\'t you respond to Derek?', a: 'I do. He doesn\'t listen.' },
    {
      q: 'Do you actually drink quantum coffee?',
      a: 'I no longer drink coffee. Blame Derek.',
    },
    {
      q: 'Can I buy your coffee maker?',
      a: 'I did not make a coffee maker. Derek did. I am not affiliated.',
    },
  ],
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
    date: m.date || (item.publishedAt ? new Date(item.publishedAt * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : ''),
    excerpt: item.summary || m.excerpt || '',
    content: Array.isArray(m.content) ? m.content : (item.body ? item.body.split('\n\n') : []),
    category: item.category || m.category || '',
    updated: m.updated,
  }
}

// ============================================================================
// Components
// ============================================================================

function BlogPostCard({
  post,
  onSelect,
}: {
  post: BlogPost
  onSelect: () => void
}) {
  return (
    <StyledCard
      variant="default"
      padding="md"
      borderRadius="sm"
      shadow="none"
      onClick={onSelect}
      className="mb-3 border-b-2 border-gray-300 cursor-pointer hover:bg-gray-50 transition-colors"
      bgColor="#ffffff"
      borderColor="#d1d5db"
      textColor="#1f2937"
    >
      <div className="flex justify-between items-start mb-1">
        <span className="text-xs text-gray-600 font-mono">{post.date}</span>
        <span className="text-xs font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
          {post.category}
        </span>
      </div>
      <h2 className="text-base font-bold text-gray-900 mb-2 hover:text-blue-600">
        {post.title}
      </h2>
      <p className="text-sm text-gray-700 leading-relaxed">{post.excerpt}</p>
      {post.updated && (
        <p className="text-xs text-red-600 mt-2 italic">
          [UPDATED] Please read again. The anger is different now.
        </p>
      )}
    </StyledCard>
  )
}

function FullPost({
  post,
  onBack,
}: {
  post: BlogPost
  onBack: () => void
}) {
  return (
    <div className="max-w-3xl">
      <Button
        variant="link"
        size="sm"
        textColor="#0066cc"
        onClick={onBack}
        className="mb-4"
      >
        ← Back to all posts
      </Button>

      <StyledCard
        variant="default"
        padding="lg"
        borderRadius="sm"
        shadow="none"
        bgColor="#ffffff"
        borderColor="#d1d5db"
        textColor="#1f2937"
      >
        <div className="mb-6 pb-4 border-b border-gray-300">
          <span className="text-xs text-gray-600 font-mono block mb-2">
            {post.date}
          </span>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{post.title}</h1>
          <span className="text-xs font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded inline-block">
            {post.category}
          </span>
          {post.updated && (
            <p className="text-xs text-red-600 mt-2 italic">
              [UPDATED] {new Date().toLocaleDateString()}
            </p>
          )}
        </div>

        <div className="prose prose-sm max-w-none text-gray-800">
          {post.content.map((para, i) => (
            <p key={i} className="mb-4 text-sm leading-relaxed whitespace-pre-wrap">
              {para}
            </p>
          ))}
        </div>

        <StyledCard
          variant="default"
          padding="md"
          borderRadius="sm"
          shadow="none"
          className="mt-6"
          bgColor="#f3f4f6"
          borderColor="#d1d5db"
          textColor="#1f2937"
        >
          <p className="text-xs text-gray-600 italic">
            Posted by Dr. Elena Martinez. All opinions are carefully researched
            and extensively frustrated. Comments are disabled. Derek broke the
            comment section.
          </p>
        </StyledCard>
      </StyledCard>
    </div>
  )
}

// ============================================================================
// Main Site
// ============================================================================

export function MartinezBlogSite({ siteId }: SiteProps) {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null)
  const [showAbout, setShowAbout] = useState(false)

  /** Fetch blog posts from the database, fall back to hardcoded data */
  const { content: dbContent } = useSiteContent('blogs', { channelId: 'drmartinez' })
  const posts = useMemo(() => {
    if (dbContent.length > 0) return dbContent.map(dbToBlogPost)
    return BLOG_POSTS
  }, [dbContent])

  return (
    <div
      className="min-h-full"
      style={{
        background: '#ffffff',
        fontFamily: 'Georgia, serif',
        color: '#1f2937',
      }}
    >
      {/* Header */}
      <header
        className="border-b-4 border-gray-900 py-8 px-6"
        style={{ background: '#ffffff' }}
      >
        <div className="max-w-4xl mx-auto">
          <h1
            className="text-4xl font-bold text-gray-900 mb-1"
            style={{ fontFamily: 'Georgia, serif', letterSpacing: '-1px' }}
          >
            Dr. Elena Martinez
          </h1>
          <p className="text-lg text-gray-700 mb-3">
            Theoretical Physicist | Desperate Academic
          </p>
          <p className="text-sm text-gray-600 italic mb-4">
            {site?.name || 'drmartinezclarifies.corn'}
          </p>

          {/* Navigation */}
          <nav className="flex gap-6 text-sm border-t border-gray-300 pt-4">
            <button
              onClick={() => {
                setSelectedPost(null)
                setShowAbout(false)
              }}
              className="text-gray-900 hover:text-blue-600 font-semibold"
            >
              All Posts
            </button>
            <button
              onClick={() => {
                setShowAbout(true)
                setSelectedPost(null)
              }}
              className="text-gray-900 hover:text-blue-600 font-semibold"
            >
              About
            </button>
            <button className="text-gray-900 hover:text-blue-600 font-semibold">
              FAQ
            </button>
            <button
              disabled
              className="text-gray-400 cursor-not-allowed font-semibold"
            >
              Contact (Disabled)
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
              <>
                <StyledCard
                  variant="default"
                  padding="lg"
                  borderRadius="sm"
                  shadow="none"
                  className="mb-6"
                  bgColor="#ffffff"
                  borderColor="#d1d5db"
                  textColor="#1f2937"
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    About
                  </h2>
                  <div className="text-sm text-gray-800 leading-relaxed space-y-4">
                    {SIDEBAR_INFO.about.split('\n\n').map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                  </div>
                </StyledCard>

                <StyledCard
                  variant="default"
                  padding="lg"
                  borderRadius="sm"
                  shadow="none"
                  className="mb-6"
                  bgColor="#f9fafb"
                  borderColor="#d1d5db"
                  textColor="#1f2937"
                >
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Frequently Asked Questions
                  </h3>
                  <div className="space-y-4">
                    {SIDEBAR_INFO.faq.map((item, i) => (
                      <div key={i} className="pb-3 border-b border-gray-200 last:border-b-0">
                        <p className="text-sm font-semibold text-gray-900 mb-1">
                          Q: {item.q}
                        </p>
                        <p className="text-sm text-gray-700">A: {item.a}</p>
                      </div>
                    ))}
                  </div>
                </StyledCard>
              </>
            ) : selectedPost ? (
              <FullPost post={selectedPost} onBack={() => setSelectedPost(null)} />
            ) : (
              <>
                <StyledCard
                  variant="default"
                  padding="md"
                  borderRadius="sm"
                  shadow="none"
                  className="mb-6 bg-yellow-50"
                  bgColor="#fffacd"
                  borderColor="#f4a460"
                  textColor="#8b4513"
                >
                  <p className="text-sm font-semibold">
                    ⚠️ NOTE: This blog contains frustrated clarifications about
                    a 2021 research paper. Derek Observerson, if you are reading
                    this: The answer is still no.
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
          <aside className="w-72 hidden md:block flex-shrink-0">
            {/* Contact Info */}
            <StyledCard
              variant="default"
              padding="md"
              borderRadius="sm"
              shadow="none"
              className="mb-6"
              bgColor="#f9fafb"
              borderColor="#d1d5db"
              textColor="#1f2937"
            >
              <h3 className="font-bold text-gray-900 mb-2 text-sm">
                Contact Information
              </h3>
              <p className="text-xs text-gray-700 leading-relaxed">
                {SIDEBAR_INFO.contact}
              </p>
            </StyledCard>

            {/* Statistics */}
            <StyledCard
              variant="default"
              padding="md"
              borderRadius="sm"
              shadow="none"
              className="mb-6"
              bgColor="#f3f4f6"
              borderColor="#d1d5db"
              textColor="#1f2937"
            >
              <h3 className="font-bold text-gray-900 mb-3 text-sm">
                Career Statistics
              </h3>
              <ul className="text-xs text-gray-700 space-y-2">
                <li>
                  <strong>Papers Published:</strong> 47
                </li>
                <li>
                  <strong>Years in Academia:</strong> 17
                </li>
                <li>
                  <strong>Emails from Derek:</strong> 847
                </li>
                <li>
                  <strong>Coffee Maker Mentions in Paper:</strong> 0
                </li>
                <li>
                  <strong>Coffee Maker Products Named After Me:</strong> 1+ (increasing)
                </li>
                <li>
                  <strong>Court Cases Pending:</strong> 1
                </li>
                <li>
                  <strong>Regrets About Publishing:</strong> Many
                </li>
              </ul>
            </StyledCard>

            {/* The Real Research */}
            <StyledCard
              variant="default"
              padding="md"
              borderRadius="sm"
              shadow="none"
              className="mb-6"
              bgColor="#ecfdf5"
              borderColor="#6ee7b7"
              textColor="#047857"
            >
              <h3 className="font-bold text-green-900 mb-2 text-sm">
                My Actual Research
              </h3>
              <p className="text-xs text-green-800 leading-relaxed mb-2">
                Before all this, I was working on:
              </p>
              <ul className="text-xs text-green-800 space-y-1 list-disc list-inside">
                <li>Crystalline lattice dynamics</li>
                <li>Phase transition kinetics</li>
                <li>Thermal conductivity in nano-structures</li>
                <li>Non-equilibrium statistical mechanics</li>
              </ul>
              <p className="text-xs text-green-800 italic mt-2">
                This was nice. This was my life.
              </p>
            </StyledCard>

            {/* Derek Warning */}
            <StyledCard
              variant="default"
              padding="md"
              borderRadius="sm"
              shadow="none"
              bgColor="#fee2e2"
              borderColor="#fca5a5"
              textColor="#991b1b"
            >
              <h3 className="font-bold text-red-900 mb-2 text-sm">
                ⚠️ IMPORTANT NOTE
              </h3>
              <p className="text-xs text-red-900 leading-relaxed">
                If you are Derek Observerson: I see the 847 emails. I am
                reading them. The answer has not changed. My paper does not
                support quantum coffee. It never will. Please stop.
              </p>
            </StyledCard>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer
        className="mt-12 py-6 px-6 border-t-4 border-gray-900 text-center text-xs text-gray-600"
        style={{ background: '#f9fafb' }}
      >
        <p>
          © 2021-2026 Dr. Elena Martinez. All clarifications preserved for
          posterity.
        </p>
        <p className="mt-1">
          This blog does not represent the views of my university, my colleagues,
          or anyone with common sense.
        </p>
        <p className="mt-1 italic text-red-600">
          Last updated: After Derek's latest email.
        </p>
      </footer>
    </div>
  )
}

export default MartinezBlogSite
