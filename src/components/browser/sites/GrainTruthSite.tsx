/**
 * GrainTruth Site (www.graintruth.corn)
 *
 * A paranoid conspiracy theory website dedicated to exposing the truth about
 * corn's role in controlling humanity. Big Corn runs everything. The .corn
 * TLD is a psyop. High fructose corn syrup is mind control. Nebraska doesn't
 * exist. The Hartwell Building's missing 13th floor is actually a corn silo.
 * Quantum coffee uses "quantum corn" not regular beans.
 *
 * THEY'RE WATCHING. THEY'VE ALWAYS BEEN WATCHING.
 *
 * Easter eggs: 847 appears throughout, references to Derek, Hartwell Building,
 * The Underground, and other game lore elements.
 */

import { useState, useMemo } from 'react'
import type { SiteProps } from '../BrowserSiteContainer.js'
import { FILLER_SITES } from '../../../config/filler-sites.js'
import { StyledCard, Button } from '../../ui/shared/index.js'
import { useSiteContent, type SiteContentItem } from '../../../hooks/useSiteContent.js'

const site = FILLER_SITES.graintruth

// ============================================================================
// Types & Data
// ============================================================================

interface Article {
  id: string
  title: string
  date: string
  classification: 'VERIFIED' | 'DEVELOPING' | 'SUPPRESSED' | 'CRITICAL' | 'THEY KNOW'
  excerpt: string
  content: string[]
  sources: string[]
  views: number
  comments: Comment[]
}

interface Comment {
  id: string
  username: string
  date: string
  content: string
  replies?: Comment[]
  upvotes: number
}

// ============================================================================
// Article Data - The Evidence
// ============================================================================

const ARTICLES: Article[] = [
  {
    id: 'big-corn-government',
    title: 'EXPOSED: How Big Corn Controls Every Level of Government',
    date: 'January 28, 2026',
    classification: 'VERIFIED',
    excerpt: 'Follow the money. Follow the subsidies. Follow the CORN.',
    views: 84742,
    content: [
      'Let me be absolutely clear: the United States government is a subsidiary of Big Corn. This is not hyperbole. This is documented fact.',
      'In 2024, corn subsidies totaled $8.47 BILLION dollars. That\'s not a typo. Notice that number? 847. They\'re not even hiding it anymore.',
      'Every major political decision since 1973 has been made with corn interests in mind. The farm bill? Corn. Energy policy? Ethanol (CORN). Foreign trade? Corn exports. Healthcare? High fructose corn syrup keeps the hospitals full.',
      'I obtained documents (before they "disappeared" from the archive) showing that 73% of Congressional staffers have direct ties to corn-producing states. The remaining 27% have INDIRECT ties through family, investments, or "coincidental" vacation patterns.',
      'When Senator [REDACTED] tried to introduce anti-corn legislation in 2019, he was "convinced" to retire within 6 months. His replacement? Former lobbyist for the American Corn Growers Association.',
      'The chain of evidence is unbroken: Corn -> Subsidies -> Political donations -> Legislation -> More corn -> Total control.',
      'They think we don\'t see. They think we\'re too distracted by their corn-syrup-induced brain fog. They\'re wrong.',
    ],
    sources: [
      'USDA Subsidy Database (cached before "maintenance update")',
      'Congressional Financial Disclosures 2020-2025',
      'Anonymous source inside the Corn Refiners Association',
      'WikiKnow article on "Corn Subsidies" (note: heavily edited since our citation)',
      'Threadit post r/actualconspiracies (deleted, we have screenshots)',
    ],
    comments: [
      {
        id: 'c1',
        username: 'KernelOfTruth847',
        date: 'January 28, 2026',
        content: 'Finally someone saying what we\'ve all known. My cousin worked at a corn processing plant and he said they have BUNKERS underneath. Full bunkers. Why would corn need bunkers???',
        upvotes: 847,
        replies: [
          {
            id: 'c1r1',
            username: 'SilkWatcher',
            date: 'January 28, 2026',
            content: 'They\'re storing something down there. Not corn. Something else.',
            upvotes: 234,
          },
          {
            id: 'c1r2',
            username: 'Anonymous_Whistler',
            date: 'January 29, 2026',
            content: 'I can confirm. Former federal inspector. The "storage facilities" go 7 floors underground. We were never allowed past floor 3.',
            upvotes: 412,
          },
        ],
      },
      {
        id: 'c2',
        username: 'DerekTheSleepless',
        date: 'January 29, 2026',
        content: 'This connects to my research on quantum coffee! The Martinez Study showed that quantum brewing affects corn-derived compounds differently. THEY KNOW THIS. Why do you think Quantum Coffee uses $47/cup pricing? 4+7=11. 11 letters in "CORN CONTROL".',
        upvotes: 156,
        replies: [
          {
            id: 'c2r1',
            username: 'CaffeinatedTruth',
            date: 'January 29, 2026',
            content: 'Derek, your blog connected so many dots for me. The coffee-corn axis is REAL.',
            upvotes: 89,
          },
        ],
      },
      {
        id: 'c3',
        username: 'NebraskaIsALie',
        date: 'January 30, 2026',
        content: 'Wake up people. The entire state of Nebraska is a corn operation disguised as a state. I\'ve tried to drive through it - you can\'t. The roads just loop back. It doesn\'t exist.',
        upvotes: 567,
      },
    ],
  },
  {
    id: 'dot-corn-psyop',
    title: 'The .corn TLD: A Psychological Operation Hidden in Plain Sight',
    date: 'January 25, 2026',
    classification: 'CRITICAL',
    excerpt: 'Why do all our websites end in .corn? Who decided this? WHO BENEFITS?',
    views: 62847,
    content: [
      'Every website you visit ends in .corn. Have you ever stopped to ask WHY?',
      'The official story: The .corn TLD was established in 1985 as a "tribute to American agriculture." This is a LIE.',
      'The TRUTH: In 1984 (yes, 1984 - the irony writes itself), a consortium of corn interests purchased naming rights to the entire internet infrastructure. Every time you type a URL, you are subconsciously reinforcing corn\'s dominance.',
      'This is not speculation. I have traced the shell companies: InterCorn Holdings -> Maize Digital Trust -> CornNet Foundation -> THE SAME FAMILIES that have controlled corn production since the 1800s.',
      'Why .corn and not .com? Because THEY wanted us swimming in subliminal corn messaging 24/7. Every URL. Every email. Every digital interaction. CORN.',
      'The psychological impact is staggering. Research from the University of [REDACTED - paper withdrawn] showed that exposure to the word "corn" 847+ times daily creates "agricultural compliance patterns" in brain activity.',
      'You are being programmed every time you browse the internet. The only question is: what do THEY want you to do?',
      'UPDATE: Since posting this article, my domain registrar has "experienced technical difficulties" with my account. Coincidence? No such thing.',
    ],
    sources: [
      'ICANN historical records (accessed before IP ban)',
      'Corporate registry filings, Delaware 1983-1985',
      'Neurolinguistic study, University of [REDACTED], 2018',
      'Testimony from former DNS administrator (identity protected)',
    ],
    comments: [
      {
        id: 'c4',
        username: 'WebArchivist1999',
        date: 'January 25, 2026',
        content: 'I remember when they were considering .web and .net as alternatives. Those proposals were BURIED. The vote was 8-4-7 against. Think about that number.',
        upvotes: 445,
      },
      {
        id: 'c5',
        username: 'PatternRecognizer',
        date: 'January 26, 2026',
        content: 'The .corn extension has exactly 5 characters including the dot. CORN has 4 letters. 5-4=1. ONE WORLD ORDER. This goes deeper than we thought.',
        upvotes: 312,
        replies: [
          {
            id: 'c5r1',
            username: 'Numerologist_X',
            date: 'January 26, 2026',
            content: 'Brother, you\'re onto something. The numerology is EVERYWHERE once you see it.',
            upvotes: 178,
          },
        ],
      },
    ],
  },
  {
    id: 'hfcs-mind-control',
    title: 'High Fructose Corn Syrup: The Mind Control Agent in Your Food',
    date: 'January 20, 2026',
    classification: 'VERIFIED',
    excerpt: 'It\'s not about sweetness. It\'s about COMPLIANCE.',
    views: 156847,
    content: [
      'High Fructose Corn Syrup (HFCS) is in EVERYTHING. Bread. Soda. Yogurt. Salad dressing. Baby food. EVERYTHING.',
      'The food industry claims this is because HFCS is "cheaper" and "sweeter." They\'re lying.',
      'HFCS contains compounds that cross the blood-brain barrier and affect dopamine receptors in ways that sugar does not. This isn\'t my theory - this is peer-reviewed science (before the papers were retracted under pressure).',
      'But here\'s what they DON\'T want you to know: HFCS doesn\'t just make you crave more sugar. It makes you COMPLIANT. Docile. Accepting.',
      'Countries with low HFCS consumption have higher rates of political protest and civic engagement. Countries with high HFCS consumption have populations that accept ANYTHING their governments tell them. The correlation is 0.847. EXACT.',
      'I stopped consuming HFCS 3 years ago. Within weeks, I started seeing patterns I\'d missed my entire life. The fog lifted. I could THINK again.',
      'They put it in everything because they need us sedated. A population hooked on corn syrup is a population that won\'t resist.',
      'Try it yourself. Go 30 days without HFCS. See what you start noticing. But be careful - THEY notice when people wake up.',
    ],
    sources: [
      'Journal of Nutritional Neuroscience, Vol 47, 2019 (RETRACTED)',
      'WHO comparative consumption data, 2015-2024',
      'Personal experimentation and documentation',
      'Leaked internal memo from [MAJOR SODA COMPANY], 2021',
      'VitalityRx product analysis showing HFCS in "health" supplements',
    ],
    comments: [
      {
        id: 'c6',
        username: 'CleanEater2024',
        date: 'January 20, 2026',
        content: 'Been HFCS-free for 18 months. Everything this article says is TRUE. I can literally feel when someone near me is consuming it now. There\'s an energy.',
        upvotes: 934,
        replies: [
          {
            id: 'c6r1',
            username: 'SkepticalSteve',
            date: 'January 21, 2026',
            content: 'How do you even avoid it? It\'s literally in everything.',
            upvotes: 145,
          },
          {
            id: 'c6r2',
            username: 'CleanEater2024',
            date: 'January 21, 2026',
            content: 'You have to grow your own food or know someone who does. The system is designed to make escape impossible. But it CAN be done.',
            upvotes: 223,
          },
        ],
      },
      {
        id: 'c7',
        username: 'FormerFDAWorker',
        date: 'January 22, 2026',
        content: 'I can\'t say much but... the internal approval process for HFCS in the 1970s was RUSHED. Files are missing. People who asked questions were transferred. That\'s all I can say.',
        upvotes: 1247,
      },
    ],
  },
  {
    id: 'hartwell-corn-silo',
    title: 'THE HARTWELL BUILDING: Missing Floor 13 is a Corn Storage Facility',
    date: 'January 15, 2026',
    classification: 'DEVELOPING',
    excerpt: 'The truth about the Hartwell Building connects EVERYTHING we\'ve documented.',
    views: 48472,
    content: [
      'You\'ve heard about the Hartwell Building\'s missing 13th floor. The "official" theories range from superstition to construction error. They\'re all wrong.',
      'The 13th floor EXISTS. It\'s a corn silo. And not just any corn - SEED CORN for the post-collapse replanting program.',
      'I\'ve been collaborating with researchers at hartwellfiles.corn (a sister site - check their evidence). Our combined research reveals that Magnus Hartwell wasn\'t just a building developer - he was a CORN DYNASTY heir.',
      'The Hartwell family controlled 23% of Midwest corn production in the 1920s. When Magnus "disappeared" in 1931, the family\'s corn empire didn\'t vanish - it went UNDERGROUND. Literally.',
      'Floor 13 is accessible only through a hidden elevator in the basement. The entrance is behind a mirror on Floor 7 - which is why witnesses report "strange mirror behavior." The mirrors are DOORS.',
      'Why store corn in a building? Because nobody looks there. Underground silos can be detected by satellite. Soil surveys reveal bunkers. But a building in the middle of a city? Perfect cover.',
      'The Hartwell Building holds enough seed corn to replant the entire Midwest. They\'re preparing for something. Climate collapse? Nuclear war? Something THEY know is coming.',
      'Note: Since we began this investigation, both The Underground venue and Quantum Coffee have received "anonymous" threats. The Underground used to be near the Hartwell Building. The original owner saw something. That\'s why they moved.',
    ],
    sources: [
      'hartwellfiles.corn - Evidence File HW-001',
      'Hartwell Family genealogical records, Library of Congress',
      'Satellite thermal imaging analysis (self-conducted)',
      'Testimony from former Underground venue staff',
      'City planning documents showing "modified" blueprints',
    ],
    comments: [
      {
        id: 'c8',
        username: 'HartwellWatcher',
        date: 'January 15, 2026',
        content: 'This explains the humming. Residents report a low humming sound at night. That\'s VENTILATION for the corn storage. Temperature-controlled storage makes that sound.',
        upvotes: 567,
      },
      {
        id: 'c9',
        username: 'DerekTheSleepless',
        date: 'January 16, 2026',
        content: 'I\'ve been saying this for YEARS on QuantumBrewBlog! The Martinez Study subjects reported "corn-adjacent temporal anomalies" near the building. Quantum coffee research brought us to the same conclusion from a different angle. THE CORN IS THE KEY.',
        upvotes: 423,
        replies: [
          {
            id: 'c9r1',
            username: 'GrainTruthAdmin',
            date: 'January 16, 2026',
            content: 'Derek, we should collaborate. Your quantum research and our corn documentation together would be unstoppable. Contact us through secure channels.',
            upvotes: 312,
          },
        ],
      },
      {
        id: 'c10',
        username: 'ArchitectAnon',
        date: 'January 17, 2026',
        content: 'Structural engineer here. The building\'s load-bearing specifications don\'t match a standard 12-floor building. There\'s unaccounted mass. SIGNIFICANT unaccounted mass. The engineering makes no sense unless there\'s more building than they\'re showing.',
        upvotes: 892,
      },
    ],
  },
  {
    id: 'quantum-corn',
    title: 'QUANTUM COFFEE: They\'re Not Using Beans - They\'re Using QUANTUM CORN',
    date: 'January 10, 2026',
    classification: 'SUPPRESSED',
    excerpt: 'Why does Quantum Coffee cost $47/cup? Because it\'s not coffee.',
    views: 37284,
    content: [
      'Everyone knows Quantum Coffee. $47 per cup. "Quantum brewing." "Observational preparation." But what\'s actually IN that cup?',
      'I obtained a sample through... let\'s call it "non-traditional channels." The lab results were SHOCKING.',
      'Quantum Coffee contains ZERO traditional coffee bean compounds. Instead, it\'s based on a corn derivative that has been subjected to "quantum superposition processing."',
      'Let me explain: Normal corn becomes HIGH FRUCTOSE CORN SYRUP through enzyme treatment. But QUANTUM CORN is exposed to controlled quantum states that alter its molecular structure into something that mimics coffee\'s effects - but with additional properties.',
      'The Martinez Study (referenced on QuantumBrewBlog.corn by Derek, our research partner) documented "enhanced temporal perception" in subjects who consumed the product. That\'s not what regular coffee does. That\'s what QUANTUM CORN does.',
      'Why the $47 price? Because quantum processing is expensive. And because it keeps consumption limited to people who can "afford to see the truth."',
      'The elite drink quantum corn while feeding us regular HFCS. They stay sharp while we stay foggy. It\'s a two-tier consciousness system.',
      'Derek has done extensive documentation on his blog. His 847 trials of quantum coffee analysis corroborate everything we\'ve found. This isn\'t coffee. It\'s corn. ENHANCED corn.',
    ],
    sources: [
      'Laboratory analysis from [FACILITY REDACTED - under NDA threat]',
      'QuantumBrewBlog.corn - Derek\'s comprehensive research',
      'The Martinez Study, full unredacted version',
      'Quantum Coffee supply chain analysis',
      'Former employee testimony (identity protected)',
    ],
    comments: [
      {
        id: 'c11',
        username: 'DerekTheSleepless',
        date: 'January 10, 2026',
        content: 'I\'ve been documenting Quantum Coffee for years but I never made the corn connection until I found this site. The molecular signatures in my samples NOW MAKE SENSE. The corn compound explains the temporal effects. This is the breakthrough.',
        upvotes: 734,
      },
      {
        id: 'c12',
        username: 'CaffeineSkeptic',
        date: 'January 11, 2026',
        content: 'I work at a Quantum Coffee location. We\'re told the beans are "proprietary" and we never see them. The product arrives in sealed containers. We just add water and "observe." Now I understand why.',
        upvotes: 1156,
        replies: [
          {
            id: 'c12r1',
            username: 'GrainTruthAdmin',
            date: 'January 11, 2026',
            content: 'Can you get us a sample of the pre-mixed product? Contact us through our secure form. We need primary source material.',
            upvotes: 445,
          },
        ],
      },
    ],
  },
  {
    id: 'nebraska-doesnt-exist',
    title: 'NEBRASKA DOESN\'T EXIST: It\'s a Corn Production Zone Disguised as a State',
    date: 'January 5, 2026',
    classification: 'THEY KNOW',
    excerpt: 'Have you ever met someone FROM Nebraska? Have you ever BEEN to Nebraska? Think carefully.',
    views: 94721,
    content: [
      'I want you to think very carefully: Do you know ANYONE who was actually born in Nebraska?',
      'No. You don\'t. Neither does anyone you know. "Nebraska" is a controlled agricultural zone masquerading as a state.',
      'The "population" of Nebraska is 1.9 million people. But the state has enough corn production to require a workforce of 8.47 MILLION. Where are those workers? They\'re there - you\'re just not allowed to see them.',
      '"Nebraska" was admitted to the Union in 1867, during a period of ZERO federal oversight of new states. The corn interests wrote their own constitution, drew their own borders, and established their own "population counts."',
      'Every person you\'ve ever met who claims to be "from Nebraska" was actually born elsewhere and given false documentation. They believe their Nebraska origin story because of HFCS-induced memory modification.',
      'The roads through Nebraska are designed to loop. GPS signals are manipulated. If you try to drive across Nebraska, you will exit the state having seen nothing but corn. Because THERE IS NOTHING BUT CORN.',
      'The "cities" - Lincoln, Omaha - are Potemkin villages. Facades. Processing centers where the corn workforce is rotated through to maintain the illusion of civilian population.',
      'I tried to investigate in person in 2023. My car broke down 47 miles into the state. The tow truck driver said nothing. His eyes were empty. I left and haven\'t been back.',
      'They\'re hiding something in Nebraska. Maybe it\'s just corn production. Maybe it\'s something worse. But one thing is certain: IT\'S NOT A STATE.',
    ],
    sources: [
      'Census data anomalies, 1870-2024',
      'Agricultural labor requirement calculations (custom analysis)',
      'GPS spoofing incident reports on Threadit r/glitch_in_the_matrix',
      'Personal investigation, documented June 2023',
      'Analysis of "Nebraska-born" celebrity backgrounds (ALL show irregularities)',
    ],
    comments: [
      {
        id: 'c13',
        username: 'TruthSeekerMidwest',
        date: 'January 5, 2026',
        content: 'I "grew up" in Nebraska. Reading this gave me chills. I can\'t remember anything specific about my childhood there. Just... corn. Corn everywhere. And a feeling that I shouldn\'t ask questions.',
        upvotes: 1834,
        replies: [
          {
            id: 'c13r1',
            username: 'MemoryExpert',
            date: 'January 6, 2026',
            content: 'This is consistent with implanted memories. The vagueness is the tell. Real memories have specific details. Implanted ones are hazy and emotional.',
            upvotes: 567,
          },
          {
            id: 'c13r2',
            username: 'TruthSeekerMidwest',
            date: 'January 6, 2026',
            content: 'Oh god. What was I doing for the first 18 years of my life? WHERE WAS I?',
            upvotes: 423,
          },
        ],
      },
      {
        id: 'c14',
        username: 'PilotAnonymous',
        date: 'January 7, 2026',
        content: 'Commercial pilot here. We\'re routed AROUND Nebraska, not over it. "Weather patterns" they say. But the weather data doesn\'t support the routing. There\'s something they don\'t want us to see from the air.',
        upvotes: 2156,
      },
      {
        id: 'c15',
        username: 'NebraskaIsALie',
        date: 'January 8, 2026',
        content: 'I\'ve been saying this for YEARS. My Threadit posts kept getting removed. They called me crazy. But I knew. I KNEW.',
        upvotes: 847,
      },
    ],
  },
];

// ============================================================================
// Sidebar Data
// ============================================================================

const SIDEBAR_LINKS = [
  { title: 'hartwellfiles.corn', desc: 'Building conspiracy research' },
  { title: 'quantumbrewblog.corn', desc: 'Derek\'s coffee documentation' },
  { title: 'Threadit r/corntruth', desc: 'Community discussion (often censored)' },
  { title: 'WikiKnow "Corn Subsidies"', desc: 'Heavily edited but still useful' },
];

const THREAT_LEVEL = {
  level: 'ORANGE',
  message: 'Increased monitoring detected. Use VPN.',
};

const VISITOR_COUNT = 847247;

// ============================================================================
// DB Adapter
// ============================================================================

/** Map a SiteContentItem from the DB to the local Article interface */
function dbToArticle(item: SiteContentItem): Article {
  const m = item.metadata || {}
  // Body may be stored as a single string with paragraph breaks, or as JSON array
  let contentParagraphs: string[] = []
  if (m.content && Array.isArray(m.content)) {
    contentParagraphs = m.content
  } else if (item.body) {
    contentParagraphs = item.body.split('\n\n').filter(Boolean)
  }

  return {
    id: item.slug,
    title: item.title,
    date: m.date ?? (item.publishedAt ? new Date(item.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Unknown'),
    classification: m.classification ?? 'DEVELOPING',
    excerpt: item.summary ?? m.excerpt ?? '',
    content: contentParagraphs,
    sources: m.sources ?? [],
    views: item.viewCount ?? m.views ?? 0,
    comments: (m.comments ?? []).map((c: any, i: number) => ({
      id: c.id ?? `c_${i}`,
      username: c.username ?? 'Anonymous',
      date: c.date ?? '',
      content: c.content ?? '',
      upvotes: c.upvotes ?? 0,
      replies: (c.replies ?? []).map((r: any, j: number) => ({
        id: r.id ?? `c_${i}_r_${j}`,
        username: r.username ?? 'Anonymous',
        date: r.date ?? '',
        content: r.content ?? '',
        upvotes: r.upvotes ?? 0,
      })),
    })),
  }
}

// ============================================================================
// Components
// ============================================================================

/**
 * Glitchy text effect for paranoid aesthetic
 */
function GlitchText({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`relative inline-block ${className}`}>
      <span className="relative z-10">{children}</span>
      <span
        className="absolute top-0 left-0 text-red-500 opacity-70"
        style={{ transform: 'translate(1px, 1px)', animation: 'pulse 2s infinite' }}
      >
        {children}
      </span>
    </span>
  );
}

/**
 * Classification badge with color coding
 */
function ClassificationBadge({ classification }: { classification: Article['classification'] }) {
  const styles: Record<Article['classification'], { bg: string; text: string; border: string }> = {
    'VERIFIED': { bg: '#166534', text: '#4ade80', border: '#22c55e' },
    'DEVELOPING': { bg: '#a16207', text: '#fde047', border: '#eab308' },
    'SUPPRESSED': { bg: '#7f1d1d', text: '#fca5a5', border: '#ef4444' },
    'CRITICAL': { bg: '#7c2d12', text: '#fdba74', border: '#f97316' },
    'THEY KNOW': { bg: '#581c87', text: '#e879f9', border: '#a855f7' },
  };

  const style = styles[classification];

  return (
    <span
      className="text-xs px-2 py-0.5 rounded font-mono font-bold tracking-wider"
      style={{ backgroundColor: style.bg, color: style.text, border: `1px solid ${style.border}` }}
    >
      [{classification}]
    </span>
  );
}

/**
 * Comment component with nested replies
 */
function CommentThread({ comment, depth = 0 }: { comment: Comment; depth?: number }) {
  return (
    <div
      className={`${depth > 0 ? 'ml-4 pl-4 border-l-2 border-red-900/50' : ''}`}
      style={{ marginTop: depth > 0 ? '8px' : '12px' }}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="text-red-400 font-mono text-sm font-bold">{comment.username}</span>
        <span className="text-gray-600 text-xs">{comment.date}</span>
        <span className="text-yellow-600 text-xs">+{comment.upvotes}</span>
      </div>
      <p className="text-gray-300 text-sm">{comment.content}</p>
      {comment.replies?.map((reply) => (
        <CommentThread key={reply.id} comment={reply} depth={depth + 1} />
      ))}
    </div>
  );
}

/**
 * Article card for the main listing
 */
function ArticleCard({
  article,
  onSelect,
}: {
  article: Article;
  onSelect: () => void;
}) {
  return (
    <StyledCard
      variant="dark"
      padding="md"
      borderRadius="sm"
      shadow="md"
      onClick={onSelect}
      className="cursor-pointer mb-4 transition-all hover:border-red-500"
      bgColor="#1a1a1a"
      borderColor="#7f1d1d"
      textColor="#fef2f2"
      hoverColor="#2a1a1a"
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs text-red-600 font-mono">{article.date}</span>
        <ClassificationBadge classification={article.classification} />
      </div>
      <h2 className="text-lg font-bold text-red-100 mb-2 font-mono hover:text-yellow-400">
        {article.title}
      </h2>
      <p className="text-sm text-gray-400 mb-3">{article.excerpt}</p>
      <div className="flex justify-between items-center text-xs text-gray-600">
        <span>{article.views.toLocaleString()} views</span>
        <span>{article.comments.length} comments</span>
        <span>{article.sources.length} sources</span>
      </div>
    </StyledCard>
  );
}

/**
 * Full article view with comments
 */
function ArticleView({
  article,
  onBack,
}: {
  article: Article;
  onBack: () => void;
}) {
  return (
    <div className="space-y-4">
      {/* Back button */}
      <Button
        variant="link"
        size="sm"
        textColor="#ef4444"
        onClick={onBack}
        className="font-mono"
      >
        [RETURN TO EVIDENCE INDEX]
      </Button>

      {/* Article content */}
      <StyledCard
        variant="dark"
        padding="lg"
        borderRadius="sm"
        shadow="md"
        bgColor="#1a1a1a"
        borderColor="#7f1d1d"
        textColor="#fef2f2"
      >
        <div className="flex justify-between items-start mb-4">
          <span className="text-xs text-red-600 font-mono">{article.date}</span>
          <ClassificationBadge classification={article.classification} />
        </div>

        <h1 className="text-2xl font-bold text-red-100 mb-4 font-mono">
          {article.title}
        </h1>

        <div className="prose prose-invert max-w-none">
          {article.content.map((para, i) => (
            <p key={i} className="text-gray-300 mb-4 text-sm leading-relaxed">
              {para}
            </p>
          ))}
        </div>

        {/* Sources */}
        <div className="mt-6 pt-4 border-t border-red-900/50">
          <h3 className="text-sm font-bold text-red-400 mb-3 font-mono">
            SOURCES & EVIDENCE:
          </h3>
          <ul className="space-y-2">
            {article.sources.map((source, i) => (
              <li
                key={i}
                className="text-xs text-gray-500 font-mono pl-4 border-l-2 border-red-900/50"
              >
                [{i + 1}] {source}
              </li>
            ))}
          </ul>
        </div>

        {/* Warning */}
        <div
          className="mt-4 p-3 rounded text-xs font-mono"
          style={{ backgroundColor: '#1f1f1f', border: '1px solid #7f1d1d' }}
        >
          <span className="text-red-500">WARNING:</span>{' '}
          <span className="text-gray-400">
            This article may be monitored. Share through secure channels only.
            Screenshot evidence before it disappears.
          </span>
        </div>
      </StyledCard>

      {/* Comments section */}
      <StyledCard
        variant="dark"
        padding="md"
        borderRadius="sm"
        shadow="md"
        bgColor="#1a1a1a"
        borderColor="#7f1d1d"
        textColor="#fef2f2"
      >
        <h3 className="text-lg font-bold text-red-400 mb-4 font-mono">
          COMMUNITY EVIDENCE ({article.comments.length} contributors)
        </h3>
        <div className="space-y-4">
          {article.comments.map((comment) => (
            <CommentThread key={comment.id} comment={comment} />
          ))}
        </div>

        {/* Comment form (non-functional but adds to authenticity) */}
        <div className="mt-6 pt-4 border-t border-red-900/50">
          <textarea
            placeholder="Add your evidence... (VPN recommended)"
            className="w-full p-3 rounded text-sm bg-black/50 border border-red-900/50 text-gray-300 placeholder-gray-600 resize-none"
            rows={3}
            disabled
          />
          <p className="text-xs text-red-600 mt-2 font-mono">
            Comments disabled temporarily - increased surveillance detected
          </p>
        </div>
      </StyledCard>
    </div>
  );
}

// ============================================================================
// Main Site Component
// ============================================================================

export function GrainTruthSite({ siteId }: SiteProps) {
  // Fetch DB content, falling back to hardcoded articles
  const { content: dbContent } = useSiteContent('graintruth')

  const articles = useMemo(() => {
    if (dbContent.length > 0) return dbContent.map(dbToArticle)
    return ARTICLES
  }, [dbContent])

  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [activeTab, setActiveTab] = useState<'evidence' | 'about' | 'network'>('evidence');

  return (
    <div className="min-h-full" style={{ background: '#0a0a0a' }}>
      {/* THEY'RE WATCHING banner - always visible */}
      <div
        className="py-1 text-center text-xs font-mono animate-pulse"
        style={{ backgroundColor: '#7f1d1d', color: '#fef2f2' }}
      >
        THEY&apos;RE WATCHING - THEY&apos;RE WATCHING - THEY&apos;RE WATCHING - THEY&apos;RE WATCHING - THEY&apos;RE WATCHING
      </div>

      {/* Header */}
      <header
        className="py-6 px-4"
        style={{
          background: 'linear-gradient(180deg, #1a0000 0%, #0a0a0a 100%)',
          borderBottom: '3px solid #7f1d1d',
        }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <div className="text-5xl">🌽</div>
            <div>
              <h1 className="text-3xl font-bold font-mono">
                <GlitchText className="text-red-500">GRAIN</GlitchText>
                <GlitchText className="text-yellow-500">TRUTH</GlitchText>
              </h1>
              <p className="text-red-400/80 text-sm font-mono italic">
                "THEY CONTROL THE CORN. THEY CONTROL EVERYTHING."
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex gap-6 text-sm font-mono">
            {(['evidence', 'about', 'network'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setSelectedArticle(null);
                }}
                className={`uppercase tracking-wider transition-colors ${
                  activeTab === tab
                    ? 'text-red-400 border-b-2 border-red-400'
                    : 'text-gray-500 hover:text-red-400'
                }`}
              >
                [{tab}]
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Threat level banner */}
      <div
        className="py-2 px-4 text-center font-mono"
        style={{ backgroundColor: '#1a1a1a', borderBottom: '1px solid #7f1d1d' }}
      >
        <span className="text-orange-500 font-bold">CURRENT THREAT LEVEL: {THREAT_LEVEL.level}</span>
        <span className="text-gray-500 mx-2">|</span>
        <span className="text-gray-400 text-sm">{THREAT_LEVEL.message}</span>
        <span className="text-gray-500 mx-2">|</span>
        <span className="text-red-600 text-sm">Visitors: {VISITOR_COUNT.toLocaleString()}</span>
      </div>

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Main column */}
          <div className="flex-1">
            {activeTab === 'evidence' && (
              <>
                {selectedArticle ? (
                  <ArticleView
                    article={selectedArticle}
                    onBack={() => setSelectedArticle(null)}
                  />
                ) : (
                  <>
                    {/* Latest alert */}
                    <div
                      className="p-3 mb-4 rounded font-mono text-sm"
                      style={{
                        backgroundColor: '#1f1f1f',
                        border: '1px solid #7f1d1d',
                      }}
                    >
                      <span className="text-red-500 font-bold">ALERT:</span>{' '}
                      <span className="text-yellow-400">
                        New whistleblower evidence connects corn subsidies to
                        surveillance expansion. Article pending verification.
                        847 documents received.
                      </span>
                    </div>

                    {/* Article list */}
                    {articles.map((article) => (
                      <ArticleCard
                        key={article.id}
                        article={article}
                        onSelect={() => setSelectedArticle(article)}
                      />
                    ))}
                  </>
                )}
              </>
            )}

            {activeTab === 'about' && (
              <StyledCard
                variant="dark"
                padding="lg"
                borderRadius="sm"
                shadow="md"
                bgColor="#1a1a1a"
                borderColor="#7f1d1d"
                textColor="#fef2f2"
              >
                <h2 className="text-2xl font-bold text-red-400 mb-4 font-mono">
                  ABOUT THIS SITE
                </h2>
                <div className="text-gray-300 text-sm space-y-4">
                  <p>
                    GrainTruth was founded in 2019 by a collective of researchers,
                    former agricultural industry workers, and concerned citizens who
                    recognized that CORN is at the center of everything.
                  </p>
                  <p>
                    We are not affiliated with any political party, corporation, or
                    government entity. We accept no advertising. Our hosting is paid
                    through anonymous cryptocurrency donations routed through 7
                    different exchanges.
                  </p>
                  <p>
                    Our research has been cited by hartwellfiles.corn, QuantumBrewBlog,
                    and various Threadit communities before being deleted. We have been
                    threatened with legal action 8 times. We have been hacked 47 times.
                    We persist.
                  </p>
                  <p>
                    The truth about corn cannot be suppressed forever. Big Corn controls
                    the government, the food supply, and through the .corn domain, the
                    ENTIRE INTERNET. But they cannot control US.
                  </p>
                  <p className="text-red-400 font-mono">
                    We are the kernels of resistance. Join us.
                  </p>
                </div>

                <div
                  className="mt-6 p-4 rounded"
                  style={{ backgroundColor: '#0a0a0a', border: '1px solid #7f1d1d' }}
                >
                  <h3 className="text-red-400 font-mono font-bold mb-2">
                    CONTACT (SECURE ONLY)
                  </h3>
                  <p className="text-gray-500 text-xs font-mono">
                    PGP Key: Available on request through verified channels
                  </p>
                  <p className="text-gray-500 text-xs font-mono">
                    Dead drop: Rotating locations - Signal for coordinates
                  </p>
                  <p className="text-gray-500 text-xs font-mono">
                    DO NOT email us through normal channels. THEY read everything.
                  </p>
                </div>
              </StyledCard>
            )}

            {activeTab === 'network' && (
              <StyledCard
                variant="dark"
                padding="lg"
                borderRadius="sm"
                shadow="md"
                bgColor="#1a1a1a"
                borderColor="#7f1d1d"
                textColor="#fef2f2"
              >
                <h2 className="text-2xl font-bold text-red-400 mb-4 font-mono">
                  THE TRUTH NETWORK
                </h2>
                <p className="text-gray-400 text-sm mb-4">
                  Allied researchers and documentation sites. Support the network.
                </p>

                <div className="space-y-4">
                  {SIDEBAR_LINKS.map((link, i) => (
                    <div
                      key={i}
                      className="p-3 rounded cursor-pointer transition-colors hover:bg-red-900/20"
                      style={{ border: '1px solid #7f1d1d' }}
                    >
                      <p className="text-red-400 font-mono">{link.title}</p>
                      <p className="text-gray-500 text-xs">{link.desc}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 rounded" style={{ backgroundColor: '#0a0a0a', border: '1px solid #7f1d1d' }}>
                  <h3 className="text-yellow-500 font-mono font-bold mb-2">
                    SPECIAL RESEARCH PARTNER
                  </h3>
                  <p className="text-gray-300 text-sm">
                    Derek at QuantumBrewBlog has conducted 847 separate trials documenting
                    quantum corn compounds. His work on the Martinez Study is essential reading.
                  </p>
                  <p className="text-gray-500 text-xs mt-2">
                    &quot;The corn-coffee axis is the key to understanding everything.&quot; - Derek
                  </p>
                </div>
              </StyledCard>
            )}
          </div>

          {/* Sidebar */}
          <aside className="w-64 hidden lg:block space-y-4">
            {/* Visitor counter */}
            <StyledCard
              variant="dark"
              padding="md"
              borderRadius="sm"
              shadow="md"
              bgColor="#1a1a1a"
              borderColor="#7f1d1d"
              textColor="#fef2f2"
            >
              <h3 className="text-xs text-gray-500 font-mono uppercase mb-1">
                Awakened Visitors
              </h3>
              <p className="text-2xl font-bold text-red-400 font-mono">
                {VISITOR_COUNT.toLocaleString()}
              </p>
              <p className="text-xs text-gray-600">
                (They can see this number too)
              </p>
            </StyledCard>

            {/* Quick stats */}
            <StyledCard
              variant="dark"
              padding="md"
              borderRadius="sm"
              shadow="md"
              bgColor="#1a1a1a"
              borderColor="#7f1d1d"
              textColor="#fef2f2"
            >
              <h3 className="text-sm font-bold text-red-400 mb-3 font-mono">
                BY THE NUMBERS
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Corn subsidies (2024)</span>
                  <span className="text-yellow-400 font-mono">$8.47B</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">HFCS in US food supply</span>
                  <span className="text-yellow-400 font-mono">84.7%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Suppressed articles</span>
                  <span className="text-yellow-400 font-mono">847+</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Nebraska witnesses</span>
                  <span className="text-yellow-400 font-mono">0*</span>
                </div>
              </div>
              <p className="text-xs text-gray-700 mt-2">
                *All Nebraska &quot;witnesses&quot; have memory inconsistencies
              </p>
            </StyledCard>

            {/* Allied sites */}
            <StyledCard
              variant="dark"
              padding="md"
              borderRadius="sm"
              shadow="md"
              bgColor="#1a1a1a"
              borderColor="#7f1d1d"
              textColor="#fef2f2"
            >
              <h3 className="text-sm font-bold text-red-400 mb-3 font-mono">
                TRUTH NETWORK
              </h3>
              <div className="space-y-2">
                {SIDEBAR_LINKS.map((link, i) => (
                  <div key={i} className="text-xs">
                    <p className="text-gray-400 hover:text-red-400 cursor-pointer">
                      {link.title}
                    </p>
                  </div>
                ))}
              </div>
            </StyledCard>

            {/* Daily reminder */}
            <StyledCard
              variant="dark"
              padding="md"
              borderRadius="sm"
              shadow="md"
              bgColor="#0a0a0a"
              borderColor="#7f1d1d"
              textColor="#fef2f2"
            >
              <h3 className="text-sm font-bold text-yellow-500 mb-2 font-mono">
                DAILY REMINDER
              </h3>
              <p className="text-xs text-gray-400">
                Check food labels. Avoid HFCS. Question &quot;Nebraska.&quot;
                The Hartwell Building has 13 floors. Derek was right about the coffee.
                The .corn domain was not an accident.
              </p>
              <p className="text-xs text-red-500 mt-2 font-mono">
                STAY VIGILANT.
              </p>
            </StyledCard>

            {/* Archive link */}
            <StyledCard
              variant="dark"
              padding="md"
              borderRadius="sm"
              shadow="md"
              bgColor="#1a1a1a"
              borderColor="#7f1d1d"
              textColor="#fef2f2"
            >
              <h3 className="text-sm font-bold text-red-400 mb-2 font-mono">
                SECURE ARCHIVE
              </h3>
              <p className="text-xs text-gray-500">
                All articles are backed up to 8 secure locations across 4 continents.
                If this site goes dark, the archive survives.
              </p>
              <p className="text-xs text-gray-600 mt-2">
                Last backup: 47 minutes ago
              </p>
            </StyledCard>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer
        className="py-4 px-4 text-center font-mono"
        style={{
          backgroundColor: '#0a0a0a',
          borderTop: '3px solid #7f1d1d',
        }}
      >
        <p className="text-gray-500 text-xs">
          GrainTruth.corn - Established 2019 - Suppressed 847 times - Still here
        </p>
        <p className="text-red-600 text-xs mt-1">
          &quot;The truth is not a kernel. It is the whole cob.&quot;
        </p>
        <p className="text-gray-700 text-xs mt-2">
          Big Corn is watching. But so are we.
        </p>
      </footer>

      {/* Bottom warning banner */}
      <div
        className="py-1 text-center text-xs font-mono animate-pulse"
        style={{ backgroundColor: '#7f1d1d', color: '#fef2f2' }}
      >
        THEY&apos;RE WATCHING - THEY&apos;RE WATCHING - THEY&apos;RE WATCHING - THEY&apos;RE WATCHING - THEY&apos;RE WATCHING
      </div>
    </div>
  );
}

export default GrainTruthSite;
