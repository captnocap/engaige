/**
 * GrainTruth Site
 *
 * Dr. Helena Cryptwood's conspiracy research archive connecting ALL modern events
 * to 14th century grain prices. She was "forced out" of academia for this
 * groundbreaking work and has been mapping the Burgundy wheat surplus of 1347
 * to everything from the 2008 financial crisis to modern social media.
 *
 * The Threshing Floor is watching. They've always been watching.
 */

import { useState } from 'react'
import type { SiteProps } from '../BrowserSiteContainer.js'
import { FILLER_SITES } from '../../../config/filler-sites.js'
import { StyledCard, Button } from '../../ui/shared/index.js'

const site = FILLER_SITES.graintruth

// ============================================================================
// Types & Data
// ============================================================================

interface ResearchPost {
  id: string
  title: string
  date: string
  classification: 'VERIFIED' | 'PROBABLE' | 'DEVELOPING' | 'THEY\'RE WATCHING' | 'REDACTED'
  excerpt: string
  content: string[]
  citations: string[]
  lastUpdated?: string
  urgentNote?: string
}

const RESEARCH_POSTS: ResearchPost[] = [
  {
    id: 'burgundy-wheat-social-media',
    title: 'VERIFIED: How the 1347 Burgundy Wheat Surplus Created Modern Social Media',
    date: 'January 12, 2026',
    classification: 'VERIFIED',
    excerpt: 'The connection is undeniable. Follow the chaff trail from medieval grain storage to your Facebook feed.',
    lastUpdated: 'January 19, 2026 - 3:47 AM',
    content: [
      'Let me be absolutely clear: I did not "lose" my position at [UNIVERSITY NAME REDACTED FOR LEGAL REASONS]. I was PUSHED OUT because my research threatened centuries of carefully maintained narratives.',
      'The 1347 Burgundy wheat surplus created a merchant class with excess capital. This capital funded the Medici banking network. The Medicis funded the printing press. The printing press created mass communication. Mass communication created social networks.',
      'The line is DIRECT. It is UNBROKEN. Every time you post a status update, you are completing a transaction that began in a medieval grain silo.',
      'I have documented 847 intermediate steps in this chain. My former colleagues called this "academic obsession." I call it THOROUGHNESS.',
      'The Threshing Floor has worked for 700 years to obscure this connection. They fund "Big Grain" think tanks that publish papers claiming grain prices are "just economics." Nothing is "just economics."',
      'When I presented this at the 2019 Medieval History Conference, three men in identical grey suits attended my session. They took no notes. They asked no questions. They watched.',
    ],
    citations: [
      'Cryptwood, H. (2018). "Grain Futures and Social Fates: A 700-Year Analysis." Unpublished (SUPPRESSED).',
      'Anonymous Burgundian Ledger, 1347-1352. Cathedral Archive of Dijon. (Access restricted since my visit.)',
      'The Medici Grain Letters, 1403. Florence State Archives. (Original documents "missing" since 2016.)',
    ],
  },
  {
    id: 'barley-bitcoin',
    title: 'The Barley-Bitcoin Connection: A 700-Year Paper Trail',
    date: 'January 8, 2026',
    classification: 'VERIFIED',
    excerpt: 'Satoshi Nakamoto was not the first to create a decentralized currency. Medieval barley traders did it in 1342.',
    content: [
      'In 1342, a consortium of barley traders in Northern France created a system of grain receipts that functioned EXACTLY like cryptocurrency. These receipts were traded without physical grain changing hands. Sound familiar?',
      'The receipts were recorded in a distributed ledger across twelve monasteries. Each monastery verified transactions independently. This was blockchain technology. In 1342.',
      'I have traced the family lines of these original traders. One bloodline leads directly to a certain anonymous cryptocurrency founder. I cannot publish names for my own safety.',
      'When I submitted this paper to the Journal of Economic History, my email account was "hacked" within 24 hours. My files were "corrupted." My backup drives "failed." All three of them. Simultaneously.',
      'The Threshing Floor does not want you to know that they have controlled currency since the Middle Ages. Bitcoin was allowed to exist only because it serves their purposes. The blockchain is a distraction.',
      'UPDATE: My credit score dropped 200 points the day after I posted this. Coincidence?',
    ],
    citations: [
      'The Twelve Monastery Ledgers, 1342-1358. (Sealed by the Vatican since 1962.)',
      'Cryptwood, H. (2020). "Pre-Modern Distributed Ledger Systems." Rejected by 47 journals.',
      'Anonymous correspondence, suspected Nakamoto associate, 2017. (Original emails deleted from server.)',
    ],
  },
  {
    id: 'oat-futures-redacted',
    title: 'Why They Don\'t Want You to Know About Oat Futures [SECTIONS REDACTED]',
    date: 'January 3, 2026',
    classification: 'REDACTED',
    excerpt: 'The oat market of 1389 predicted everything. I had the documents. I no longer have the documents.',
    urgentNote: 'If you are reading this and have access to the Flemish Oat Compendium of 1389, CONTACT ME IMMEDIATELY through secure channels only.',
    content: [
      'I will tell you what I CAN tell you. The rest has been [REDACTED BY REQUEST OF LEGAL COUNSEL].',
      'The Flemish Oat Compendium of 1389 contained predictions. Not forecasts. PREDICTIONS. Written by a grain merchant named [REDACTED] who somehow knew about [REDACTED], the fall of [REDACTED], and the exact date of [REDACTED].',
      'I photographed every page during my 2015 visit to the [REDACTED] archive. These photographs were on my laptop, my phone, my external drive, and my cloud storage. All gone. Every copy. Within ONE WEEK of my return.',
      'The librarian who granted me access has "retired." Her replacement claims the Compendium "never existed." The card catalog entry has been removed. The shelf where it sat is now "undergoing renovation."',
      'I am not crazy. I HELD THAT BOOK IN MY HANDS. I read predictions about oat prices in 2008. They were ACCURATE.',
      'Someone knows I know. The clicks on my phone line started three days after I began this post.',
    ],
    citations: [
      'The Flemish Oat Compendium, 1389. [LOCATION REDACTED]. (Officially "does not exist.")',
      'Cryptwood, H. Personal research notes, 2015. (Destroyed in unexplained hard drive failures.)',
      'Phone records showing unusual routing, 2026. (Saved in secure offline location.)',
    ],
  },
  {
    id: 'rye-conference',
    title: 'EMERGENCY UPDATE: I\'ve Been Followed Since the Rye Conference',
    date: 'December 28, 2025',
    classification: 'THEY\'RE WATCHING',
    excerpt: 'The 2025 European Grain History Symposium in Vienna. Three days. Twelve followers. One very clear message.',
    lastUpdated: 'Every 4 hours since original post',
    content: [
      'I should not have attended the Vienna symposium. I know that now. But I thought presenting in person would lend credibility. I was naive.',
      'Day 1: I noticed a woman in a tan coat at my hotel breakfast. I saw her again at my presentation. And again at dinner. She never ordered food.',
      'Day 2: The woman was joined by two men. They sat three rows behind me at every session. They did not have conference badges. When I asked the organizers, they claimed not to see them.',
      'Day 3: I found a single grain of rye on my pillow. Just one. Perfectly centered. My room had been locked. The window does not open.',
      'I changed hotels. They found me within 2 hours. I left Vienna early. At the airport, the woman in the tan coat was at my gate. She smiled.',
      'I have not slept more than 3 hours consecutively since my return. Every time I close my eyes, I see that single grain of rye.',
      'THEY KNOW ABOUT THE RYE RESEARCH. I was getting too close to something. The 1356 Rye Blight was not a natural occurrence.',
    ],
    citations: [
      'Personal testimony and documented observations, December 2025.',
      'Hotel security footage request DENIED "for privacy reasons."',
      'Conference attendee list mysteriously "unavailable" after my inquiry.',
    ],
  },
  {
    id: 'threshing-floor-origins',
    title: 'The Threshing Floor: 700 Years of Shadow Control',
    date: 'December 15, 2025',
    classification: 'PROBABLE',
    excerpt: 'In 1342, twelve grain merchants formed an alliance that has controlled world events ever since. I have their names.',
    content: [
      'Every conspiracy needs a beginning. For The Threshing Floor, that beginning was the winter of 1342, in a barn outside Bruges.',
      'Twelve grain merchants gathered after the worst harvest in living memory. Famine was coming. Millions would die. These twelve men decided they would not be among them.',
      'They pooled their remaining grain stores. They created artificial scarcity. They funded grain shipments to specific regions while letting others starve. They chose who lived and who died based on ECONOMIC LOYALTY.',
      'By 1350, these twelve families controlled 60% of Northern European grain trade. By 1400, their descendants had expanded into banking, shipping, and what we would now call "information warfare."',
      'The symbol of The Threshing Floor is a stylized chaff pattern, hidden in plain sight. I have found it in corporate logos, government buildings, and one very famous painting in the Louvre. They are not subtle. They do not need to be.',
      'I have traced all twelve bloodlines to the present day. Three are extinct. Nine continue. I will not publish the names. I am not suicidal.',
    ],
    citations: [
      'The Bruges Compact, 1342. (Original document in private collection, photographed covertly in 2012.)',
      'Genealogical research spanning 14 archives across 6 countries, 2010-2024.',
      'Corporate logo analysis with chaff pattern frequency study, Cryptwood 2023. (Never published.)',
    ],
  },
  {
    id: '2008-crisis-grain',
    title: 'The 2008 Financial Crisis Was Planned in 1347',
    date: 'December 1, 2025',
    classification: 'VERIFIED',
    excerpt: 'The Burgundy wheat surplus created a 661-year cascade that culminated in the collapse of Lehman Brothers.',
    content: [
      'I know how this sounds. I also know I am correct.',
      'The 1347 Burgundy surplus generated excess merchant capital that funded early Italian banking. This banking system developed instruments we would recognize as derivatives. These derivatives evolved over centuries into the credit default swaps that destroyed the global economy in 2008.',
      'But here is what they do not want you to know: the TIMING was not accidental.',
      'The Threshing Floor operates on 661-year cycles. 1347 plus 661 equals 2008. This is not coincidence. 661 is the number of days between wheat planting and the third harvest cycle in medieval Burgundy. It is their sacred number.',
      'Lehman Brothers was CHOSEN. Their logo contains a hidden chaff pattern if you look at the negative space. They were sacrificed to complete a cycle.',
      'The next 661-year event is not until 2669, but smaller cycles occur every 47 years (the number of weeks in medieval grain storage). 2008 plus 47 equals 2055. Mark that year.',
      'I have sent this research to the SEC, the FBI, and three major newspapers. None have responded. One reporter called me "deranged." He was promoted six days later.',
    ],
    citations: [
      'Cryptwood, H. (2021). "Sacred Numerology in Medieval Grain Economics." Self-published.',
      'Lehman Brothers corporate archives, seized documents 2008. (FOIA request "still processing.")',
      'The Burgundy Merchant Guild records, 1347-1352. Archives departementales de la Cote-d\'Or.',
    ],
  },
  {
    id: 'message-to-followers',
    title: 'A Message to My Followers (Read If You Find This Site Offline)',
    date: 'November 20, 2025',
    classification: 'DEVELOPING',
    excerpt: 'If this site goes dark, check the contingency location. You know where. The research must survive.',
    urgentNote: 'This is not paranoia. This is preparation. There is a difference.',
    content: [
      'To those who have followed my research, some for years now: I want you to know that I am of sound mind. I have documentation. I have evidence.',
      'If this website becomes unavailable, if my social media accounts are "suspended," if you hear reports of my "breakdown" or "mental health crisis," DO NOT BELIEVE THEM.',
      'I have established contingency protocols. The full archive of my research exists in three physical locations. Trusted colleagues (yes, I still have some) know where to find it.',
      'The chaff trail must not end with me. I have dedicated my career to exposing The Threshing Floor. They have taken my academic position, my marriage (Robert could not understand), and my peace of mind. They will not take the truth.',
      'Continue the work. Follow the grain. Question everything you think you know about medieval agriculture.',
      'And remember: Big Grain is always watching. But we are watching back.',
      'With unwavering dedication to the truth,',
      'Dr. Helena Cryptwood, PhD',
      'Former Associate Professor of Medieval Economic History',
      '"Forced Out" for Knowing Too Much',
    ],
    citations: [
      'This message serves as documentation of my mental state as of November 2025.',
      'Contingency Protocol established with [NAMES WITHHELD FOR THEIR PROTECTION].',
      'Full research archive: Location Alpha, Location Bravo, Location Charlie.',
    ],
  },
]

const SIDEBAR_DOCUMENTS = [
  { title: 'The Complete Burgundy Analysis', pages: '847 pages', status: 'CLASSIFIED' },
  { title: 'Threshing Floor Bloodline Map', pages: '12 family trees', status: 'SENSITIVE' },
  { title: 'The Missing Oat Compendium (Recreation)', pages: '234 pages', status: 'PARTIAL' },
  { title: 'Vienna Incident Report', pages: '67 pages', status: 'ONGOING' },
  { title: 'My Collected Termination Letters', pages: '23 letters', status: 'EVIDENCE' },
]

const ABOUT_TEXT = `Dr. Helena Cryptwood, PhD
Former Associate Professor of Medieval Economic History
[Institution Name Withheld for Legal Reasons]

For 23 years, I maintained an exemplary academic record. 47 peer-reviewed publications. 12 successful PhD students. Two book contracts (both subsequently "cancelled").

Then I discovered the connection.

In 2012, while researching Burgundian merchant networks for what should have been a routine monograph, I found a pattern. A pattern that connected 14th century grain prices to every major world event since.

I published my preliminary findings in 2014. Within six months, my tenure review was "reconsidered." My grant applications were "not competitive." My office was "needed for renovations."

By 2016, I was gone. They called it "early retirement." Robert called it "the thing that ended our marriage." I call it SILENCING.

But I did not stop. I will never stop.

This website is the repository of truth they do not want you to see. I update it from secure locations using VPN routing through seven countries.

The red string on my wall connects everything. And soon, you will see what I see.

Follow the chaff trail.

- Dr. H. Cryptwood`

// ============================================================================
// Components
// ============================================================================

function ClassificationBadge({ classification }: { classification: ResearchPost['classification'] }) {
  const colors: Record<ResearchPost['classification'], { bg: string; text: string; border: string }> = {
    'VERIFIED': { bg: '#166534', text: '#BBF7D0', border: '#22C55E' },
    'PROBABLE': { bg: '#1E40AF', text: '#BFDBFE', border: '#3B82F6' },
    'DEVELOPING': { bg: '#A16207', text: '#FEF3C7', border: '#EAB308' },
    'THEY\'RE WATCHING': { bg: '#7F1D1D', text: '#FECACA', border: '#DC2626' },
    'REDACTED': { bg: '#1F2937', text: '#F3F4F6', border: '#6B7280' },
  }

  const style = colors[classification]

  return (
    <span
      className="text-xs px-2 py-0.5 rounded font-mono"
      style={{
        backgroundColor: style.bg,
        color: style.text,
        border: `1px solid ${style.border}`
      }}
    >
      [{classification}]
    </span>
  )
}

function ResearchCard({ post, onSelect }: { post: ResearchPost; onSelect: () => void }) {
  return (
    <StyledCard
      variant="default"
      padding="md"
      borderRadius="sm"
      shadow="md"
      onClick={onSelect}
      className="mb-4 cursor-pointer"
      bgColor="#292524"
      borderColor="#44403C"
      textColor="#FEF3C7"
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs text-amber-600/70 font-mono">{post.date}</span>
        <ClassificationBadge classification={post.classification} />
      </div>
      <h2 className="text-base font-bold text-amber-100 mb-2 hover:text-amber-400 font-mono">
        {post.title}
      </h2>
      {post.urgentNote && (
        <div
          className="text-xs p-2 mb-2 rounded font-mono"
          style={{ backgroundColor: '#7F1D1D', color: '#FECACA', border: '1px solid #DC2626' }}
        >
          URGENT: {post.urgentNote}
        </div>
      )}
      <p className="text-sm text-stone-400 mb-3">{post.excerpt}</p>
      {post.lastUpdated && (
        <p className="text-xs text-red-500/70 font-mono">
          Last updated: {post.lastUpdated}
        </p>
      )}
      <div className="mt-2 text-xs text-stone-500">
        {post.citations.length} citation(s) | Click to view full analysis
      </div>
    </StyledCard>
  )
}

function FullResearch({ post, onBack }: { post: ResearchPost; onBack: () => void }) {
  return (
    <StyledCard
      variant="default"
      padding="lg"
      borderRadius="sm"
      shadow="md"
      className="mb-4"
      bgColor="#292524"
      borderColor="#44403C"
      textColor="#FEF3C7"
    >
      <Button
        variant="link"
        size="sm"
        textColor="#DC2626"
        onClick={onBack}
        className="mb-4 font-mono"
      >
        [RETURN TO ARCHIVE]
      </Button>

      <div className="flex justify-between items-start mb-2">
        <span className="text-xs text-amber-600/70 font-mono">{post.date}</span>
        <ClassificationBadge classification={post.classification} />
      </div>

      <h1 className="text-xl font-bold text-amber-100 mb-4 font-mono">{post.title}</h1>

      {post.urgentNote && (
        <div
          className="text-sm p-3 mb-4 rounded font-mono"
          style={{ backgroundColor: '#7F1D1D', color: '#FECACA', border: '1px solid #DC2626' }}
        >
          URGENT: {post.urgentNote}
        </div>
      )}

      {post.lastUpdated && (
        <p className="text-xs text-red-500 font-mono mb-4">
          Document last updated: {post.lastUpdated}
        </p>
      )}

      <div className="prose prose-invert max-w-none">
        {post.content.map((para, i) => (
          <p key={i} className="text-stone-300 mb-4 text-sm leading-relaxed">
            {para}
          </p>
        ))}
      </div>

      {/* Citations Section */}
      <div className="mt-6 pt-4 border-t border-stone-700">
        <h3 className="text-sm font-bold text-amber-200 mb-3 font-mono">
          CITATIONS & EVIDENCE:
        </h3>
        <div className="space-y-2">
          {post.citations.map((citation, i) => (
            <p key={i} className="text-xs text-stone-400 font-mono pl-4 border-l-2 border-stone-600">
              [{i + 1}] {citation}
            </p>
          ))}
        </div>
      </div>

      {/* Warning Footer */}
      <StyledCard
        variant="default"
        padding="md"
        borderRadius="sm"
        shadow="none"
        className="mt-4"
        bgColor="#1C1917"
        borderColor="#DC2626"
        textColor="#FEF3C7"
      >
        <p className="text-xs text-red-400 font-mono">
          This document is protected under academic freedom provisions. Unauthorized access,
          modification, or "disappearance" of this research will be documented and reported
          to multiple independent sources. THE CHAFF TRAIL WILL NOT BE SILENCED.
        </p>
      </StyledCard>
    </StyledCard>
  )
}

// ============================================================================
// Main Site
// ============================================================================

export function GrainTruthSite({ siteId }: SiteProps) {
  const [selectedPost, setSelectedPost] = useState<ResearchPost | null>(null)
  const [showAbout, setShowAbout] = useState(false)

  return (
    <div className="min-h-full" style={{ background: '#1C1917' }}>
      {/* Header */}
      <header className="py-6 px-4" style={{ backgroundColor: '#7C2D12', borderBottom: '3px solid #DC2626' }}>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">🌾</span>
            <div>
              <h1 className="text-2xl font-bold text-amber-100 font-mono">
                {site?.name || 'GrainTruth'}
              </h1>
              <p className="text-amber-300/80 text-sm italic font-mono">
                "Following the Chaff Trail to Hidden History"
              </p>
            </div>
          </div>
          <nav className="flex gap-4 mt-4 text-sm font-mono">
            <button
              onClick={() => { setSelectedPost(null); setShowAbout(false); }}
              className="text-amber-200 hover:text-white"
            >
              [ARCHIVE]
            </button>
            <button
              onClick={() => { setSelectedPost(null); setShowAbout(true); }}
              className="text-amber-200 hover:text-white"
            >
              [ABOUT DR. CRYPTWOOD]
            </button>
            <button className="text-amber-200 hover:text-white">[EVIDENCE]</button>
            <button className="text-red-400 hover:text-red-300">[EMERGENCY PROTOCOLS]</button>
          </nav>
        </div>
      </header>

      {/* Alert Banner */}
      <div
        className="py-2 px-4 text-center text-sm font-mono"
        style={{ backgroundColor: '#7F1D1D', color: '#FEF3C7', borderBottom: '1px solid #DC2626' }}
      >
        NOTICE: If you are viewing this site, your IP has been logged by THEM. Consider using a VPN.
        The Threshing Floor has operatives in all major ISPs.
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
                borderRadius="sm"
                shadow="md"
                bgColor="#292524"
                borderColor="#44403C"
                textColor="#FEF3C7"
              >
                <h2 className="text-xl font-bold text-amber-100 mb-4 font-mono">
                  ABOUT THE RESEARCHER
                </h2>
                <div className="flex gap-4 mb-4">
                  <div className="text-6xl">👩‍🏫</div>
                  <div>
                    <p className="font-bold text-amber-200 font-mono">Dr. Helena Cryptwood, PhD</p>
                    <p className="text-sm text-stone-400">Medieval Economic History</p>
                    <p className="text-xs text-red-400 font-mono">"Forced Out" - Status: VINDICATED</p>
                  </div>
                </div>
                <div className="text-sm text-stone-300 whitespace-pre-line font-mono leading-relaxed">
                  {ABOUT_TEXT}
                </div>
                <StyledCard
                  variant="default"
                  padding="md"
                  borderRadius="sm"
                  shadow="none"
                  className="mt-4"
                  bgColor="#1C1917"
                  borderColor="#DC2626"
                  textColor="#FEF3C7"
                >
                  <p className="font-bold text-red-400 font-mono">CREDENTIALS (BEFORE SUPPRESSION)</p>
                  <ul className="text-stone-400 text-xs mt-2 font-mono space-y-1">
                    <li>- 47 peer-reviewed publications (23 since "withdrawn")</li>
                    <li>- 12 PhD students supervised (3 have "disappeared")</li>
                    <li>- 2 book contracts (both "cancelled")</li>
                    <li>- 1 marriage (ended due to "obsession")</li>
                    <li>- 0 regrets</li>
                    <li>- INFINITE dedication to truth</li>
                  </ul>
                </StyledCard>
              </StyledCard>
            ) : selectedPost ? (
              <FullResearch post={selectedPost} onBack={() => setSelectedPost(null)} />
            ) : (
              <>
                <StyledCard
                  variant="default"
                  padding="md"
                  borderRadius="sm"
                  shadow="none"
                  className="mb-4"
                  bgColor="#1C1917"
                  borderColor="#DC2626"
                  textColor="#FEF3C7"
                >
                  <p className="text-amber-200 text-sm font-mono">
                    📜 <strong>LATEST:</strong> New evidence links the 1356 Rye Blight to modern
                    telecommunications infrastructure. The pattern is UNDENIABLE. Full analysis
                    pending secure document retrieval.
                  </p>
                </StyledCard>
                {RESEARCH_POSTS.map(post => (
                  <ResearchCard
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
            {/* Secure Contact */}
            <StyledCard
              variant="default"
              padding="md"
              borderRadius="sm"
              shadow="md"
              className="mb-4"
              bgColor="#292524"
              borderColor="#44403C"
              textColor="#FEF3C7"
            >
              <h3 className="font-bold text-amber-100 mb-2 font-mono">📡 SECURE CONTACT</h3>
              <p className="text-xs text-stone-400 mb-2 font-mono">
                Do NOT use regular email. They read everything.
              </p>
              <p className="text-xs text-red-400 font-mono mb-2">
                PGP Key: Available upon verification
              </p>
              <p className="text-xs text-stone-500 font-mono">
                Dead drop locations rotate weekly. Signal me for current coordinates.
              </p>
            </StyledCard>

            {/* Documents */}
            <StyledCard
              variant="default"
              padding="md"
              borderRadius="sm"
              shadow="md"
              className="mb-4"
              bgColor="#292524"
              borderColor="#44403C"
              textColor="#FEF3C7"
            >
              <h3 className="font-bold text-amber-100 mb-2 font-mono">📁 CLASSIFIED DOCUMENTS</h3>
              <div className="space-y-2">
                {SIDEBAR_DOCUMENTS.map((doc, i) => (
                  <div key={i} className="text-xs border-b border-stone-700 pb-2">
                    <p className="text-amber-200 font-mono">{doc.title}</p>
                    <div className="flex justify-between text-stone-500">
                      <span>{doc.pages}</span>
                      <span className="text-red-400">[{doc.status}]</span>
                    </div>
                  </div>
                ))}
              </div>
            </StyledCard>

            {/* Red String Map */}
            <StyledCard
              variant="default"
              padding="md"
              borderRadius="sm"
              shadow="md"
              className="mb-4"
              bgColor="#292524"
              borderColor="#DC2626"
              textColor="#FEF3C7"
            >
              <h3 className="font-bold text-red-400 mb-2 font-mono">🧵 THE RED STRING MAP</h3>
              <div className="text-2xl text-center mb-2">📍🔴📍🔴📍</div>
              <p className="text-xs text-stone-400 font-mono italic">
                "12 connections confirmed. 847 suspected. The pattern is complete but
                cannot be published here. THEY are monitoring bandwidth."
              </p>
              <p className="text-xs text-red-400 mt-2 font-mono">
                Full map available in person only. Bring ID. Expect verification questions.
              </p>
            </StyledCard>

            {/* Warning */}
            <StyledCard
              variant="default"
              padding="md"
              borderRadius="sm"
              shadow="md"
              bgColor="#1C1917"
              borderColor="#DC2626"
              textColor="#FEF3C7"
            >
              <h3 className="font-bold text-red-500 mb-2 font-mono">⚠️ LEGAL NOTICE</h3>
              <p className="text-xs text-red-300 font-mono">
                All research published here is protected academic work. Multiple copies exist
                in secure locations. Any attempt to suppress, destroy, or "discredit" this
                research will be documented and added to the evidence file against The Threshing
                Floor.
              </p>
              <p className="text-xs text-red-400 mt-2 font-mono">
                I am not paranoid. I am PREPARED.
              </p>
            </StyledCard>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer
        className="py-4 px-4 text-center text-xs font-mono"
        style={{ backgroundColor: '#7C2D12', borderTop: '3px solid #DC2626', color: '#FEF3C7' }}
      >
        <p>© 2025 {site?.name || 'GrainTruth'}. All research rights reserved.</p>
        <p className="mt-1 text-amber-300/70">
          "The truth was planted in 1342. It is finally ready for harvest."
        </p>
        <p className="mt-1 text-red-400">
          Site uptime: Monitored. Backup servers: Active. The chaff trail continues.
        </p>
      </footer>
    </div>
  )
}

export default GrainTruthSite
