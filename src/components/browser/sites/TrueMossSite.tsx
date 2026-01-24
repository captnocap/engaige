/**
 * TrueMoss Site
 *
 * Agatha Mosswell's independent moss research blog and personal vendetta archive.
 * She was expelled from the American Bryological Society in 2019 and she's
 * absolutely NOT over it. Equal parts genuine bryophyte expertise and
 * unhinged personal grievances against "Big Moss."
 */

import { useState } from 'react'
import type { SiteProps } from '../BrowserSiteContainer.js'
import { FILLER_SITES } from '../../../config/filler-sites.js'
import { StyledCard, Button } from '../../ui/shared/index.js'

const site = FILLER_SITES.truemoss

// ============================================================================
// Types & Data
// ============================================================================

interface MossPost {
  id: string
  title: string
  date: string
  excerpt: string
  content: string[]
  tags: string[]
  readTime: string
  comments: number
  isExpose?: boolean
  mossEmoji?: string
}

const MOSS_POSTS: MossPost[] = [
  {
    id: 'patricia-fernsworth-stole-hybridization',
    title: 'Patricia Fernsworth STOLE My Polytrichum Hybridization Method: The Evidence',
    date: 'January 20, 2026',
    excerpt: 'I have RECEIPTS. Timestamped lab notes. Witness testimony from Gerald (my oldest specimen). This woman has the AUDACITY to present MY work at the 2024 Pacific Northwest Bryological Conference.',
    readTime: '34 min read',
    comments: 847,
    isExpose: true,
    mossEmoji: '🌿',
    content: [
      'Let me be absolutely clear: I am not a petty person. I have dedicated my life to the advancement of bryophyte science. But Patricia Fernsworth has crossed a line that cannot be uncrossed.',
      'In 2018, I developed a revolutionary hybridization technique for Polytrichum commune and Polytrichum juniperinum. I shared this method - in confidence - at the Western Moss Enthusiasts Meetup in Eugene, Oregon. Patricia was there. Patricia took NOTES.',
      'Fast forward to 2024. The Pacific Northwest Bryological Conference. I\'m watching the livestream from my moss room (I was not invited for reasons I will address in another post), and there she is. MY TECHNIQUE. On HER slides. With HER name.',
      'The evidence:',
      '- My lab notes from March 2018 clearly document the pH-adjusted substrate method (attached as PDF, pending DMCA review)',
      '- Three witnesses remember me discussing this at the Eugene meetup (one has since passed, RIP Harold)',
      '- Gerald, my 7-year-old Polytrichum specimen, RECOILED when I showed him Patricia\'s presentation. Moss doesn\'t lie.',
      '- The exact same humidity ratios. 73.2%. That number is MY number.',
      'Patricia, I know you read this blog. You blocked me on every platform but I know you\'re here. This isn\'t over.',
      'I have reached out to the American Bryological Society about this matter. They responded with a cease and desist. Classic.',
    ],
    tags: ['patricia-fernsworth', 'theft', 'polytrichum', 'hybridization', 'receipts', 'gerald'],
  },
  {
    id: 'sphagnum-is-a-scam',
    title: 'Why Sphagnum Is a SCAM (And What Big Moss Doesn\'t Want You to Know)',
    date: 'January 14, 2026',
    excerpt: 'Every nursery pushes sphagnum. Every "expert" recommends sphagnum. Wake up, people. Follow the money.',
    readTime: '28 min read',
    comments: 1203,
    isExpose: true,
    mossEmoji: '💀',
    content: [
      'I am so TIRED of casuals walking into my moss room and saying "oh, you must have a lot of sphagnum!" No. I don\'t. And I\'ll tell you why.',
      'Sphagnum moss is the McDonald\'s of bryophytes. It\'s everywhere, it\'s profitable, and it\'s making America\'s moss ecosystem SICK.',
      'The Sphagnum Industrial Complex:',
      '- 73% of commercial moss sales are sphagnum (source: my own research)',
      '- The American Bryological Society receives funding from three major sphagnum distributors (I have the 990 forms)',
      '- Patricia Fernsworth\'s husband works for MossCo International. Connect the dots.',
      'What they don\'t want you to know: Sphagnum is a BULLY species. It acidifies substrate to crowd out more delicate, beautiful species like Hypnum cupressiforme and Thuidium delicatulum.',
      'Every time you buy sphagnum, you\'re funding the marginalization of shade-tolerant species. You\'re contributing to monoculture. You\'re part of the problem.',
      'There are 380 moss species in North America. The industry wants you to know about ONE. Ask yourself why.',
      'I\'ve been saying this for years. They called me crazy. They expelled me. But the truth is coming out.',
    ],
    tags: ['sphagnum', 'big-moss', 'industry-corruption', 'wake-up', 'shade-tolerant-species'],
  },
  {
    id: '2019-incident-official-statement',
    title: 'The 2019 Incident: My Official Statement About the Moisture Reader',
    date: 'January 8, 2026',
    excerpt: 'Seven years later, I am finally ready to share my side of the story. The American Bryological Society has silenced me long enough.',
    readTime: '41 min read',
    comments: 2156,
    mossEmoji: '📏',
    content: [
      'On September 14th, 2019, I was expelled from the American Bryological Society for "aggressive moisture readings" and "conduct unbecoming of a member." This is what actually happened.',
      'The National Moss Competition in Burlington, Vermont. I had been preparing Gerald (my prize Bryum argenteum) for three years. This was our moment.',
      'During the judging round, I noticed something suspicious. Judge #3 - who I later discovered was Patricia Fernsworth\'s COUSIN - was using a Deluxe MossReader 3000. This device is KNOWN to give inaccurate readings on silver moss varieties.',
      'I politely (POLITELY) requested a secondary reading with my calibrated Hygrometer Pro. The judge refused. I may have... raised my voice. I may have demonstrated on her specimen table why her readings were incorrect.',
      'What the incident report DOESN\'T mention:',
      '- Judge #3\'s visible bias against non-sphagnum entries',
      '- The "accidental" damage to Gerald\'s display case was caused by THEIR security personnel',
      '- I never "lunged." I stepped forward assertively. There\'s a difference.',
      '- The restraining order was later reduced to 50 feet (they don\'t mention that)',
      'Gerald never fully recovered. He still flinches when he sees clipboards.',
      'I have filed seven appeals. All denied. The system protects its own.',
      'But I am still here. Still growing. Still fighting. The moss community deserves better.',
    ],
    tags: ['2019-incident', 'abs-corruption', 'gerald', 'moisture-reader', 'burlington', 'vindication'],
  },
  {
    id: 'caring-for-gerald',
    title: 'Caring for Gerald: A 3-Year Journey with My Champion Bryum argenteum',
    date: 'December 30, 2025',
    excerpt: 'Gerald is more than a specimen. He\'s family. Here\'s how I\'ve cultivated the most magnificent silver moss on the eastern seaboard (unofficial, since I\'m banned from competitions).',
    readTime: '23 min read',
    comments: 423,
    mossEmoji: '🪴',
    content: [
      'I acquired Gerald as a small cutting in 2019, just weeks before The Incident. In many ways, we healed together.',
      'Bryum argenteum, commonly called "silver moss" or "sidewalk moss," is CRIMINALLY underrated by the establishment. They call it a "weed moss." I call it a survivor.',
      'Gerald\'s Care Routine (Do Not Share With Patricia):',
      '- Substrate: 60% granite chips, 30% peat-free compost, 10% crusite powder (my proprietary blend)',
      '- Humidity: 72-74% (NEVER 73.2% - that\'s for Polytrichum, and also Patricia stole that number)',
      '- Light: Indirect morning light only. Gerald prefers his east window.',
      '- Hydration: Misted twice daily with collected rainwater, pH-adjusted to 6.3',
      '- Emotional support: I read to Gerald every evening. Currently we\'re working through "Moss Gardening" by George Schenk (the only establishment book I respect).',
      'Gerald\'s Progress:',
      '- Year 1: Established root system, survived The Incident trauma',
      '- Year 2: Developed characteristic silver sheen, began producing sporophytes',
      '- Year 3: Reached competition-grade density (not that I can enter competitions)',
      'Gerald has taught me that growth happens on its own timeline. You cannot rush bryophytes. You cannot rush healing.',
      'NOTE TO PATRICIA: If you\'re thinking about "acquiring" a Bryum argenteum specimen after reading this, DON\'T. You don\'t have the patience or the soul.',
    ],
    tags: ['gerald', 'bryum-argenteum', 'care-guide', 'silver-moss', 'emotional-support-moss'],
  },
  {
    id: 'abs-corruption-timeline',
    title: 'The American Bryological Society Is CORRUPT: A Documented Timeline',
    date: 'December 22, 2025',
    excerpt: 'Seven years of receipts. Conference minutes. Email chains. Follow the sphagnum money.',
    readTime: '52 min read',
    comments: 3891,
    isExpose: true,
    mossEmoji: '📋',
    content: [
      'I have been compiling this timeline since my expulsion. Every date verified. Every source documented. The truth will set us free.',
      '2015: MossCo International becomes "platinum sponsor" of ABS annual conference. Sphagnum entries win 8 of 10 categories.',
      '2016: Dr. Richard Henley publishes paper questioning sphagnum monoculture. Paper rejected from ABS journal. Dr. Henley retires "voluntarily" the following year.',
      '2017: I present on shade-tolerant species at regional conference. Receive warning for "questioning judging standards."',
      '2018: Patricia Fernsworth joins ABS board. Her husband starts at MossCo two months later. Coincidence?',
      '2019: The Incident. You know what happened.',
      '2020: ABS changes bylaws to prevent expelled members from appealing after 60 days. My appeal was pending at 67 days.',
      '2021: Patricia Fernsworth wins "Bryologist of the Year." Her acceptance speech mentions her "innovative hybridization work." I threw my laptop.',
      '2022: MossCo acquires three competing suppliers. ABS publishes statement praising "industry consolidation."',
      '2023: I am banned from the ABS Facebook group. My crime? Posting peer-reviewed research on sphagnum overuse.',
      '2024: Patricia presents MY technique. ABS does nothing.',
      '2025: I launch TrueMoss. The movement begins.',
      'This is not about me. This is about the soul of bryology itself.',
    ],
    tags: ['abs', 'corruption', 'timeline', 'mossco', 'patricia-fernsworth', 'receipts'],
  },
  {
    id: 'naming-your-moss-guide',
    title: 'Why You Should Name Your Moss (A Guide for Serious Cultivators)',
    date: 'December 15, 2025',
    excerpt: 'Gerald, Whisper, The Duke, and Lady Marchbanks are not just specimens. They are individuals. Here\'s how to develop meaningful relationships with your bryophytes.',
    readTime: '18 min read',
    comments: 267,
    mossEmoji: '💚',
    content: [
      'When I tell people I\'ve named my moss specimens, they laugh. When I tell them my moss responds to their names, they call me "concerning." This is why the casual community will never understand true cultivation.',
      'My Named Specimens:',
      '- Gerald (Bryum argenteum): My oldest companion. Distinguished. Wise. Still recovering from 2019.',
      '- Whisper (Hypnum cupressiforme): Delicate, prefers quiet rooms. Named for the sound she makes when perfectly hydrated.',
      '- The Duke (Polytrichum commune): Regal bearing. Highest specimen in my collection (14cm). Demands respect.',
      '- Lady Marchbanks (Thuidium delicatulum): Arrived as an unexpected hitchhiker on a rock I collected. Now one of my most prized specimens.',
      '- The Twins (Ceratodon purpureus): Two specimens from the same substrate. Finish each other\'s photosynthesis.',
      'How to Name Your Moss:',
      '1. Observe the specimen for at least two weeks before naming. Learn its personality.',
      '2. Consider the species characteristics. Polytrichum = noble names. Hypnum = softer names.',
      '3. Wait for the name to come to you. If you\'re forcing it, you\'re not ready.',
      '4. Speak the name aloud to the specimen. Watch for response (subtle unfurling, color shift).',
      '5. Never rename. It damages trust.',
      'Patricia Fernsworth reportedly named her Polytrichum "Greg." No wonder her hybridization technique (MY technique) produces inferior results.',
    ],
    tags: ['naming', 'gerald', 'whisper', 'the-duke', 'relationships', 'cultivation-philosophy'],
  },
  {
    id: 'moisture-reader-reviews',
    title: 'Moisture Reader Reviews: What the Industry Doesn\'t Test',
    date: 'December 8, 2025',
    excerpt: 'I have purchased and tested 23 different moisture readers. Most are garbage designed to sell sphagnum. Here are the three that actually work.',
    readTime: '31 min read',
    comments: 892,
    mossEmoji: '💧',
    content: [
      'After The Incident, I vowed to never again be caught without proper instrumentation. I have spent $3,400 testing moisture readers so you don\'t have to.',
      'THE GOOD:',
      '- Hygrometer Pro X7 ($189): Accurate to 0.3%, works on all substrate types. This is what the judges SHOULD have used in Burlington.',
      '- BryoMeter Classic ($145): Old school analog gauge. No batteries to fail. Patricia wouldn\'t know how to read it.',
      '- MossCheck Digital ($220): Best for shade-tolerant species. The only reader I trust with Hypnum.',
      'THE MEDIOCRE:',
      '- MossReader 3000 ($79): The one THEY use at competitions. Inconsistent readings on silver moss. Suspiciously cheap. Ask yourself why.',
      '- HydroSpike Basic ($45): Fine for sphagnum (of course). Useless for real cultivation.',
      'THE GARBAGE (Industry-Promoted):',
      '- MossCo QuickRead ($35): Literally rebranded soil meter. They sponsor ABS. Connect the dots.',
      '- FernCo DualProbe ($55): Patricia Fernsworth endorsed this in 2022. Need I say more?',
      'TESTING METHODOLOGY: Each reader tested on 5 species across 3 substrate types over 6 months. Full data available on request (not you, Patricia).',
      'Invest in good tools. Your moss deserves better than industry marketing.',
    ],
    tags: ['equipment', 'moisture-readers', 'reviews', 'mossco-exposed', 'buyer-guide'],
  },
  {
    id: 'shade-tolerant-manifesto',
    title: 'The Shade-Tolerant Manifesto: Why I Dedicate My Life to Ignored Species',
    date: 'November 29, 2025',
    excerpt: 'While the establishment pushes sphagnum, entire genera languish in obscurity. This is my mission. This is my purpose.',
    readTime: '26 min read',
    comments: 534,
    mossEmoji: '🌑',
    content: [
      'There are over 12,000 moss species worldwide. The average person can name one: sphagnum. This is a tragedy of modern botanical education.',
      'Shade-tolerant species - the ones that thrive in forest understory, in north-facing crevices, in the places light forgets - are the most beautiful and most neglected bryophytes on Earth.',
      'I discovered my calling in 2012, hiking in the Olympic National Forest. I found a patch of Hookeria lucens (luminous moss) growing beneath a rotting log. It glowed in the darkness. It GLOWED. I wept.',
      'The establishment doesn\'t care about these species because you can\'t mass-produce them. You can\'t ship them in bulk. You can\'t sell them at Home Depot next to the orchids.',
      'But shade-tolerant species offer something sphagnum never will:',
      '- Ecological complexity (actual biodiversity contribution)',
      '- Aesthetic depth (try growing sphagnum in a terrarium - boring)',
      '- Cultivation challenge (if you want easy, buy a succulent)',
      '- Emotional resonance (shade-tolerant mosses have been through things)',
      'I have dedicated my life to documenting, cultivating, and advocating for these forgotten species. The ABS called my focus "fringe." Patricia called it "obsessive."',
      'I call it necessary.',
      'Someone has to speak for the moss that grows in darkness. I am that someone.',
    ],
    tags: ['shade-tolerant', 'manifesto', 'ignored-species', 'mission-statement', 'hookeria-lucens'],
  },
]

const SIDEBAR_SPECIMENS = [
  { name: 'Gerald', species: 'Bryum argenteum', status: 'Thriving (emotionally healing)' },
  { name: 'Whisper', species: 'Hypnum cupressiforme', status: 'Delicate but stable' },
  { name: 'The Duke', species: 'Polytrichum commune', status: 'Magnificent (14cm)' },
  { name: 'Lady Marchbanks', species: 'Thuidium delicatulum', status: 'Unexpected joy' },
  { name: 'The Twins', species: 'Ceratodon purpureus', status: 'Inseparable' },
]

const ABOUT_TEXT = `My name is Agatha Mosswell. I am a competitive moss gardener, independent bryophyte researcher, and exile from the American Bryological Society.

In 2019, I was expelled for "aggressive moisture readings" at the National Moss Competition. The real crime? Questioning the sphagnum establishment. Exposing biased judging. Refusing to stay silent.

This blog is my platform. No corporate sponsors. No industry interference. Just truth, science, and moss.

I specialize in shade-tolerant species - the beautiful, neglected bryophytes that Big Moss ignores because they can't be mass-produced. Gerald, my prize Bryum argenteum, is the heart of my collection.

Patricia Fernsworth, if you're reading this: I know what you did. Everyone will know soon.

For everyone else: welcome to the resistance.`

// ============================================================================
// Components
// ============================================================================

function MossPostCard({ post, onSelect }: { post: MossPost; onSelect: () => void }) {
  return (
    <StyledCard
      variant="default"
      padding="md"
      borderRadius="md"
      shadow="md"
      onClick={onSelect}
      className="mb-4 cursor-pointer"
      bgColor="#ffffff"
      borderColor="#86EFAC"
      textColor="#14532D"
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs text-lime-600">{post.date}</span>
        <div className="flex items-center gap-2">
          {post.mossEmoji && <span className="text-lg">{post.mossEmoji}</span>}
          {post.isExpose && (
            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded font-bold">
              EXPOSE
            </span>
          )}
        </div>
      </div>
      <h2 className="text-lg font-bold text-green-900 mb-2 hover:text-green-700">
        {post.title}
      </h2>
      <p className="text-sm text-gray-600 mb-3">{post.excerpt}</p>
      <div className="flex justify-between items-center text-xs text-gray-500">
        <span>{post.readTime}</span>
        <span>{post.comments} comments</span>
      </div>
      <div className="flex flex-wrap gap-1 mt-2">
        {post.tags.slice(0, 4).map(tag => (
          <span key={tag} className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded">
            #{tag}
          </span>
        ))}
      </div>
    </StyledCard>
  )
}

function FullPost({ post, onBack }: { post: MossPost; onBack: () => void }) {
  return (
    <StyledCard
      variant="default"
      padding="lg"
      borderRadius="md"
      shadow="md"
      className="mb-4"
      bgColor="#ffffff"
      borderColor="#86EFAC"
      textColor="#14532D"
    >
      <Button
        variant="link"
        size="sm"
        textColor="#166534"
        onClick={onBack}
        className="mb-4"
      >
        Back to posts
      </Button>
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs text-lime-600">{post.date}</span>
        <div className="flex items-center gap-2">
          {post.mossEmoji && <span className="text-2xl">{post.mossEmoji}</span>}
          {post.isExpose && (
            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded font-bold">
              EXPOSE
            </span>
          )}
        </div>
      </div>
      <h1 className="text-2xl font-bold text-green-900 mb-4">{post.title}</h1>
      <div className="prose prose-green max-w-none">
        {post.content.map((para, i) => (
          <p key={i} className="text-gray-700 mb-4 text-sm leading-relaxed">
            {para}
          </p>
        ))}
      </div>
      <div className="mt-6 pt-4 border-t border-green-100">
        <div className="flex flex-wrap gap-1">
          {post.tags.map(tag => (
            <span key={tag} className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded">
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
        bgColor="#DCFCE7"
        borderColor="#86EFAC"
        textColor="#14532D"
      >
        <p className="font-bold text-green-800">{post.comments} Comments</p>
        <p className="text-green-700 text-xs mt-1">
          Comments are moderated. Patricia Fernsworth and ABS affiliates are auto-blocked.
        </p>
      </StyledCard>
    </StyledCard>
  )
}

// ============================================================================
// Main Site
// ============================================================================

export function TrueMossSite({ siteId }: SiteProps) {
  const [selectedPost, setSelectedPost] = useState<MossPost | null>(null)
  const [showAbout, setShowAbout] = useState(false)

  return (
    <div className="min-h-full" style={{ background: '#F0FDF4' }}>
      {/* Header */}
      <header className="text-white py-6 px-4" style={{ background: 'linear-gradient(135deg, #166534 0%, #14532D 100%)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">🌿</span>
            <div>
              <h1 className="text-2xl font-bold">{site?.name || 'TrueMoss'}</h1>
              <p className="text-green-200 text-sm italic">
                "Real Bryophyte Science, No Corporate Influence"
              </p>
            </div>
          </div>
          <p className="text-green-300 text-xs mb-4">
            est. 2025 | Expelled from ABS 2019 | Gerald's Human
          </p>
          <nav className="flex gap-4 mt-4 text-sm">
            <button
              onClick={() => { setSelectedPost(null); setShowAbout(false); }}
              className="text-green-200 hover:text-white"
            >
              Posts
            </button>
            <button
              onClick={() => { setSelectedPost(null); setShowAbout(true); }}
              className="text-green-200 hover:text-white"
            >
              About Agatha
            </button>
            <button className="text-green-200 hover:text-white">Specimen Gallery</button>
            <button className="text-green-200 hover:text-white">Evidence Archive</button>
          </nav>
        </div>
      </header>

      {/* Alert Banner */}
      <div className="bg-red-100 border-b border-red-300 py-2 px-4">
        <p className="max-w-4xl mx-auto text-red-800 text-xs text-center">
          <strong>NOTICE:</strong> Patricia Fernsworth has been observed accessing this site from a VPN. Patricia, I know it's you. The IP patterns match.
        </p>
      </div>

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
                borderColor="#86EFAC"
                textColor="#14532D"
              >
                <h2 className="text-xl font-bold text-green-900 mb-4">About Agatha Mosswell</h2>
                <div className="flex gap-4 mb-4">
                  <div className="text-6xl">👩‍🔬</div>
                  <div>
                    <p className="font-bold text-green-800">Agatha Mosswell</p>
                    <p className="text-sm text-gray-600">Independent Bryophyte Researcher</p>
                    <p className="text-xs text-gray-500">ABS Member 2008-2019 (expelled)</p>
                  </div>
                </div>
                <div className="text-sm text-gray-700 whitespace-pre-line">
                  {ABOUT_TEXT}
                </div>
                <StyledCard
                  variant="default"
                  padding="md"
                  borderRadius="sm"
                  shadow="none"
                  className="mt-4"
                  bgColor="#DCFCE7"
                  borderColor="#86EFAC"
                  textColor="#14532D"
                >
                  <p className="font-bold text-green-800">Stats</p>
                  <ul className="text-green-700 text-xs mt-2">
                    <li>- 47 shade-tolerant species documented</li>
                    <li>- 12 named specimens (5 featured)</li>
                    <li>- 7 appeals filed (7 denied)</li>
                    <li>- 1 nemesis (Patricia Fernsworth)</li>
                    <li>- 0 regrets</li>
                  </ul>
                </StyledCard>
                <StyledCard
                  variant="default"
                  padding="md"
                  borderRadius="sm"
                  shadow="none"
                  className="mt-4"
                  bgColor="#FEF2F2"
                  borderColor="#FECACA"
                  textColor="#7F1D1D"
                >
                  <p className="font-bold text-red-800">Legal Restrictions</p>
                  <ul className="text-red-700 text-xs mt-2">
                    <li>- Cannot attend ABS events (expelled)</li>
                    <li>- Must maintain 50ft from Judge #3 (reduced from 100ft)</li>
                    <li>- Cannot contact MossCo employees directly</li>
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
                  bgColor="#DCFCE7"
                  borderColor="#86EFAC"
                  textColor="#14532D"
                >
                  <p className="text-green-800 text-sm">
                    <strong>BREAKING:</strong> New evidence in the Patricia Fernsworth hybridization theft case.
                    Original lab notes obtained. Post coming this week.
                  </p>
                </StyledCard>
                {MOSS_POSTS.map(post => (
                  <MossPostCard
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
            {/* Specimen Status */}
            <StyledCard
              variant="default"
              padding="md"
              borderRadius="md"
              shadow="md"
              className="mb-4"
              bgColor="#ffffff"
              borderColor="#86EFAC"
              textColor="#14532D"
            >
              <h3 className="font-bold text-green-900 mb-2">Specimen Status</h3>
              <div className="space-y-2">
                {SIDEBAR_SPECIMENS.map((specimen, i) => (
                  <div key={i} className="text-xs border-b border-green-100 pb-2 last:border-0">
                    <p className="font-bold text-green-800">{specimen.name}</p>
                    <p className="text-green-600 italic">{specimen.species}</p>
                    <p className="text-gray-500">{specimen.status}</p>
                  </div>
                ))}
              </div>
            </StyledCard>

            {/* The Cause */}
            <StyledCard
              variant="default"
              padding="md"
              borderRadius="md"
              shadow="md"
              className="mb-4"
              bgColor="#ffffff"
              borderColor="#86EFAC"
              textColor="#14532D"
            >
              <h3 className="font-bold text-green-900 mb-2">Support the Cause</h3>
              <p className="text-xs text-gray-600 mb-2">
                Help expose Big Moss and fund independent shade-tolerant species research.
              </p>
              <Button
                variant="primary"
                size="sm"
                width="full"
                backgroundColor="#166534"
                textColor="#ffffff"
              >
                Donate to TrueMoss
              </Button>
              <p className="text-xs text-gray-400 mt-2 italic">
                (Not tax-deductible. ABS blocked our 501c3.)
              </p>
            </StyledCard>

            {/* Gerald Corner */}
            <StyledCard
              variant="default"
              padding="md"
              borderRadius="md"
              shadow="md"
              className="mb-4"
              bgColor="#ffffff"
              borderColor="#86EFAC"
              textColor="#14532D"
            >
              <h3 className="font-bold text-green-900 mb-2">Gerald's Corner</h3>
              <div className="text-4xl text-center mb-2">🪴</div>
              <p className="text-xs text-gray-600 italic text-center">
                "Gerald's Current Mood: Cautiously optimistic, still processing trauma"
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Today's humidity: 72.8% (optimal). Gerald responded well to morning misting.
              </p>
            </StyledCard>

            {/* Enemy Watch */}
            <StyledCard
              variant="default"
              padding="md"
              borderRadius="md"
              shadow="md"
              className="mb-4"
              bgColor="#FEF2F2"
              borderColor="#FECACA"
              textColor="#7F1D1D"
            >
              <h3 className="font-bold text-red-800 mb-2">Enemy Watch</h3>
              <div className="text-xs text-red-700 space-y-1">
                <p><strong>Patricia Fernsworth:</strong> Spotted at Portland nursery (Jan 18)</p>
                <p><strong>ABS:</strong> Annual conference March 2026 (I will be outside)</p>
                <p><strong>MossCo:</strong> New "premium sphagnum" launch - stay vigilant</p>
              </div>
            </StyledCard>

            {/* Newsletter */}
            <StyledCard
              variant="default"
              padding="md"
              borderRadius="md"
              shadow="md"
              bgColor="#ffffff"
              borderColor="#86EFAC"
              textColor="#14532D"
            >
              <h3 className="font-bold text-green-900 mb-2">Newsletter</h3>
              <p className="text-xs text-gray-600 mb-2">
                Weekly updates on shade-tolerant species and industry corruption.
              </p>
              <input
                type="email"
                placeholder="your@email.com"
                className="w-full px-2 py-1 text-sm border border-green-200 rounded mb-2"
              />
              <Button
                variant="primary"
                size="sm"
                width="full"
                backgroundColor="#166534"
                textColor="#ffffff"
              >
                Subscribe
              </Button>
              <p className="text-xs text-gray-400 mt-2">
                (ABS-affiliated emails auto-rejected)
              </p>
            </StyledCard>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-green-200 py-4 px-4 text-center text-xs" style={{ background: '#14532D' }}>
        <p>&copy; 2025 {site?.name || 'TrueMoss'}. Not affiliated with the American Bryological Society (by their choice, not mine).</p>
        <p className="mt-1">
          Patricia Fernsworth: I see your traffic. I know you're watching. The truth is coming.
        </p>
        <p className="mt-2 text-green-400 italic">
          "In moss we trust. In Patricia we don't." - A. Mosswell, 2019
        </p>
      </footer>
    </div>
  )
}

export default TrueMossSite
