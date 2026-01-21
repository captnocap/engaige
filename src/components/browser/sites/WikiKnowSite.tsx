/**
 * WikiKnow Site
 *
 * Wikipedia clone for the engAIge browser.
 * Features encyclopedic content about absurd topics played completely straight.
 */

import { useState } from 'react'
import type { SiteProps } from '../BrowserSiteContainer.js'
import { FILLER_SITES } from '../../../config/filler-sites.js'

const site = FILLER_SITES.wiki

// ============================================================================
// Types
// ============================================================================

interface WikiSection {
  id: string
  heading: string
  content: string
  subsections?: WikiSection[]
}

interface WikiInfobox {
  image?: string
  imageCaption?: string
  facts: Record<string, string>
}

interface WikiArticle {
  id: string
  title: string
  category: string
  summary: string
  sections: WikiSection[]
  infobox?: WikiInfobox
  relatedArticles: string[]
  references: string[]
  lastEdited: string
  views: number
}

// ============================================================================
// Sample Articles
// ============================================================================

const SAMPLE_ARTICLES: WikiArticle[] = [
  {
    id: 'quantum_coffee',
    title: 'Quantum Coffee Brewing',
    category: 'Technology',
    summary: `Quantum Coffee Brewing is a revolutionary coffee preparation technique discovered in 2019 by Dr. Elena Martinez at the Westbrook Institute of Applied Thermodynamics. The process uses quantum entanglement to achieve perfect brew temperature uniformity across all water molecules simultaneously, resulting in what enthusiasts describe as "the most molecularly consistent cup of coffee possible."`,
    sections: [
      {
        id: 'history',
        heading: 'History',
        content: `The technique was accidentally discovered on March 15, 2019, when Dr. Martinez spilled her morning coffee onto a prototype quantum processor during routine maintenance. Rather than causing damage, the liquid appeared to undergo what she later termed "spontaneous thermal equilibration at the quantum level."

Initial skepticism from the scientific community was widespread, with notable physicist Dr. Harold Chen famously calling the discovery "the most caffeinated nonsense I've ever heard." However, subsequent peer-reviewed studies published in the Journal of Caffeinated Physics confirmed the phenomenon.[1]

The first commercial quantum coffee maker was released by BrewTech Industries in 2021, retailing at $2,999. Despite the high price point, the devices sold out within hours, primarily to Silicon Valley tech workers and coffee enthusiasts.`,
      },
      {
        id: 'process',
        heading: 'Process',
        content: `The quantum brewing process involves three key steps that must be performed in precise sequence:`,
        subsections: [
          {
            id: 'entanglement',
            heading: 'Quantum Entanglement',
            content: `Water molecules are first entangled using a specialized quantum coil operating at temperatures near absolute zero. This creates what physicists call a "coherent hydration field" where all molecules share identical quantum states. The entanglement process takes approximately 3.7 seconds and requires approximately 47 kilowatts of power.[2]`,
          },
          {
            id: 'superposition',
            heading: 'Superposition of Grounds',
            content: `Coffee grounds are introduced to the system while the water exists in a superposition of all possible temperatures. This allows the extraction process to theoretically occur at every temperature simultaneously, though only the optimal extraction state collapses into observable reality.`,
          },
          {
            id: 'observation',
            heading: 'Observation Collapse',
            content: `The final step involves "observing" the coffee through a specialized lens that collapses the quantum state to the user's preferred serving temperature. Critics argue this step is pseudoscientific, though blind taste tests consistently show preference for quantum-brewed coffee over traditional methods.[3]`,
          },
        ],
      },
      {
        id: 'cultural_impact',
        heading: 'Cultural Impact',
        content: `Quantum coffee shops have become increasingly popular in urban areas, with over 2,400 "Q-Cafes" operating worldwide as of 2024. The trend has spawned its own subculture, with enthusiasts developing specialized vocabulary and rituals.

The phrase "Have you collapsed your morning superposition?" has become common among quantum coffee drinkers as a greeting. Some cafes require patrons to wear specialized "observation goggles" as part of the experience, though this has been criticized as "quantum theater" by skeptics.

Notable celebrity quantum coffee enthusiasts include tech entrepreneur Marcus Webb and pop star Luna Starling, who famously had a $50,000 quantum coffee bar installed on her tour bus.`,
      },
      {
        id: 'controversy',
        heading: 'Controversy',
        content: `The quantum coffee industry has faced significant criticism from both scientists and traditional coffee purveyors.

Dr. Sarah Blackwell of MIT published a widely-cited paper in 2023 arguing that the "quantum" aspect of the brewing process is "at best, a very expensive water heater, and at worst, an elaborate placebo effect."[4]

Traditional baristas have also pushed back against the trend. The International Barista Association issued a statement in 2022 declaring quantum coffee "an affront to the craft of coffee making" and refusing to certify quantum-trained baristas.

Despite these criticisms, consumer demand for quantum coffee continues to grow, with market analysts projecting the industry will reach $4.7 billion by 2027.`,
      },
    ],
    infobox: {
      image: '☕',
      imageCaption: 'A quantum coffee maker in operation',
      facts: {
        'Discovered': '2019',
        'Inventor': 'Dr. Elena Martinez',
        'First commercial use': '2021',
        'Average cost': '$47 per cup',
        'Global cafes': '2,400+',
        'Market size': '$1.2B (2024)',
        'Power required': '47 kW',
        'Brew time': '3.7 seconds',
      },
    },
    relatedArticles: [
      'Dr. Elena Martinez',
      'Westbrook Institute',
      'Journal of Caffeinated Physics',
      'BrewTech Industries',
      'Coffee culture',
      'Quantum mechanics',
    ],
    references: [
      'Martinez, E. (2019). "Accidental Quantum Brewing: A Serendipitous Discovery". Journal of Caffeinated Physics, 12(3), 45-62.',
      'Chen, H. & Nakamura, Y. (2020). "Energy Requirements for Macroscopic Quantum Coherence in Aqueous Solutions". Physical Review Letters, 124(8).',
      'Westbrook Consumer Research Group. (2023). "Blind Taste Testing of Quantum vs. Traditional Coffee: A Double-Blind Study".',
      'Blackwell, S. (2023). "Quantum Coffee: Science or Science Fiction?". MIT Technology Review.',
    ],
    lastEdited: '3 hours ago',
    views: 47892,
  },
  {
    id: 'meme_war_2019',
    title: 'The Great Meme War of 2019',
    category: 'Internet History',
    summary: `The Great Meme War of 2019 was a month-long conflict between rival online communities that took place primarily on social media platforms during August 2019. What began as a dispute over the proper use of the "Surprised Pikachu" format escalated into one of the largest coordinated memetic campaigns in internet history, involving an estimated 2.3 million participants across 47 countries.`,
    sections: [
      {
        id: 'background',
        heading: 'Background',
        content: `Tensions between the r/dankmemes and r/memes communities had been building since early 2019, with each subreddit accusing the other of "normifying" popular formats. The final catalyst came on August 3, 2019, when user u/MemeLord420x posted a Surprised Pikachu meme with what purists considered "improper caption spacing."

The post received over 50,000 upvotes before being removed by moderators, sparking accusations of censorship. Within hours, both subreddits had mobilized their members for what would become known as "Operation Dank Storm."[1]`,
      },
      {
        id: 'major_battles',
        heading: 'Major Battles',
        content: `The conflict saw several significant engagements:

**The Battle of New (August 5-7)**: Both communities attempted to flood each other's "New" sections with low-quality content to bury original posts. Moderators on both sides worked in shifts to combat the influx, with some reporting they removed over 10,000 posts per hour.

**The Twitter Incursion (August 12)**: r/dankmemes attempted to expand the conflict to Twitter, creating thousands of accounts to spread propaganda. The campaign backfired when Twitter's algorithm began promoting the content, inadvertently giving r/memes more visibility.

**The Great Watermarking (August 18)**: In a controversial move, r/dankmemes began watermarking all original content with elaborate, removal-resistant marks. This strategy proved effective but was criticized as "destroying the open-source nature of meme culture."[2]`,
      },
      {
        id: 'resolution',
        heading: 'Resolution',
        content: `The conflict officially ended on August 31, 2019, with the signing of the "Accord of Mutual Memetic Respect" (AMMR). Key provisions included:

- Recognition of both subreddits as "legitimate memetic territories"
- Establishment of a joint moderation council
- Creation of the Meme Historians Archive to preserve content from the conflict
- A mutual non-aggression pact regarding format disputes

The accord was signed by representatives of both communities during a livestreamed ceremony that attracted over 500,000 concurrent viewers.[3]`,
      },
      {
        id: 'legacy',
        heading: 'Legacy',
        content: `The Great Meme War of 2019 is studied in several university communications courses as an example of "digital tribalism and community identity formation." Dr. Amanda Price of Stanford's Digital Culture Lab has described it as "the first true war fought entirely through irony and inside jokes."

Annual commemorations are held by both communities, typically involving the ceremonial posting of "throwback" memes from the conflict period. The Meme Historians Archive, established as part of the peace agreement, contains over 2.4 million preserved images and remains an active research resource.`,
      },
    ],
    infobox: {
      image: '⚔️',
      imageCaption: 'Symbolic representation of the conflict',
      facts: {
        'Date': 'August 2019',
        'Duration': '28 days',
        'Participants': '~2.3 million',
        'Countries involved': '47',
        'Posts removed': '~45 million',
        'Result': 'AMMR Treaty',
        'Casualties': '12 subreddits banned',
      },
    },
    relatedArticles: [
      'r/dankmemes',
      'r/memes',
      'Internet culture',
      'Surprised Pikachu',
      'Digital tribalism',
      'Meme Historians Archive',
    ],
    references: [
      'Price, A. (2020). "Digital Warfare: The Great Meme War and Its Implications". Journal of Internet Studies, 8(2), 112-134.',
      'Thompson, K. (2021). "Watermarking and Ownership in Meme Culture". Digital Humanities Quarterly, 15(3).',
      'The Meme Historians Archive. (2019). "Official Documentation of the AMMR Signing Ceremony".',
    ],
    lastEdited: '2 days ago',
    views: 128453,
  },
  {
    id: 'the_underground',
    title: 'The Underground (venue)',
    category: 'Music Venues',
    summary: `The Underground is a music venue and cultural space located in the basement of the former Hartwell Building in downtown. Established in 2015, it has become a significant hub for independent music, hosting over 1,200 shows and launching the careers of numerous artists including The Velvet Algorithms, Neon Requiem, and DJ Probability.`,
    sections: [
      {
        id: 'history',
        heading: 'History',
        content: `The venue was founded by former record store owner Marcus "Mars" Williams after he discovered the unused basement space while exploring the abandoned Hartwell Building. Despite lacking any formal permits, Williams began hosting small shows in late 2015, initially lit only by Christmas lights and battery-powered lanterns.

"The first show had maybe twelve people," Williams recalled in a 2022 interview. "We had one band, no PA system, and I'm pretty sure the drummer was playing on paint buckets. It was perfect."[1]

The venue gained legal status in 2017 following a successful crowdfunding campaign that raised $127,000 for safety renovations and proper licensing. The campaign notably received contributions from artists who had played early shows at the space, including several who had since achieved mainstream success.`,
      },
      {
        id: 'notable_performances',
        heading: 'Notable Performances',
        content: `**The Velvet Algorithms (2016)**: The electronic duo's third-ever performance, now considered legendary among fans. Bootleg recordings of the show regularly sell for hundreds of dollars.

**Neon Requiem Reunion Show (2019)**: The post-punk band's surprise reunion after their 2018 breakup drew over 400 people to a venue with a 200-person capacity. The fire marshal was not pleased.

**DJ Probability's "Infinite Set" (2021)**: The DJ performed for 27 consecutive hours, breaking the venue's longest-set record. Audience members came and went in shifts, with some reportedly taking power naps on the venue's infamous "couch corner."

**The Cancelled Show (2023)**: The Velvet Algorithms were scheduled to perform but cancelled due to what the band described as an "ongoing existential crisis." The event made national news.`,
      },
      {
        id: 'cultural_significance',
        heading: 'Cultural Significance',
        content: `The Underground has been credited with fostering a distinct local sound that music critics have termed "basement wave" - characterized by lo-fi production, introspective lyrics, and a tendency toward unusual time signatures.

The venue maintains a strict "no phones during sets" policy, enforced by the honor system and occasional gentle shaming. This policy has become part of The Underground's identity, with regular patrons considering it essential to the experience.

A small section of one wall is reserved for artists to leave handwritten notes. As of 2024, the "artist wall" contains messages from over 600 performers and has been photographed extensively for a forthcoming documentary.`,
      },
    ],
    infobox: {
      image: '🎸',
      imageCaption: 'The Underground logo',
      facts: {
        'Established': '2015',
        'Location': 'Hartwell Building, Downtown',
        'Capacity': '200 (officially)',
        'Shows hosted': '1,200+',
        'Genre': 'Independent, Electronic, Post-punk',
        'Owner': 'Marcus "Mars" Williams',
        'Notable policy': 'No phones during sets',
      },
    },
    relatedArticles: [
      'The Velvet Algorithms',
      'Neon Requiem',
      'DJ Probability',
      'Basement wave',
      'Marcus Williams',
      'Independent music venues',
    ],
    references: [
      'Williams, M. (2022). Interview with Local Music Monthly, Issue 47.',
      'Chen, L. (2023). "The Underground at Eight: A Retrospective". Rolling Stone Digital.',
    ],
    lastEdited: '5 hours ago',
    views: 23156,
  },
]

// ============================================================================
// Components
// ============================================================================

export function WikiKnowSite({ siteId }: SiteProps) {
  const [selectedArticle, setSelectedArticle] = useState<WikiArticle>(SAMPLE_ARTICLES[0])
  const [searchQuery, setSearchQuery] = useState('')

  const handleRandomArticle = () => {
    const randomIndex = Math.floor(Math.random() * SAMPLE_ARTICLES.length)
    setSelectedArticle(SAMPLE_ARTICLES[randomIndex])
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Find article by title (case-insensitive partial match)
    const found = SAMPLE_ARTICLES.find(a =>
      a.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    if (found) {
      setSelectedArticle(found)
      setSearchQuery('')
    }
  }

  const handleRelatedClick = (title: string) => {
    const found = SAMPLE_ARTICLES.find(a =>
      a.title.toLowerCase().includes(title.toLowerCase())
    )
    if (found) {
      setSelectedArticle(found)
    }
  }

  return (
    <div className="min-h-full" style={{ background: site.theme.background }}>
      {/* Header */}
      <header
        className="sticky top-0 z-10"
        style={{ background: site.theme.surface, borderBottom: `1px solid ${site.theme.border}` }}
      >
        <div className="max-w-6xl mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <span className="text-3xl">{site.icon}</span>
              <div>
                <h1
                  className="text-xl font-serif font-bold"
                  style={{ color: site.theme.text }}
                >
                  {site.name}
                </h1>
                <p className="text-xs" style={{ color: site.theme.textMuted }}>
                  {site.tagline}
                </p>
              </div>
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 max-w-md mx-8">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search WikiKnow"
                  className="w-full px-4 py-1.5 pr-10 text-sm rounded border focus:outline-none focus:ring-2"
                  style={{
                    borderColor: site.theme.border,
                    background: site.theme.surface,
                    color: site.theme.text,
                  }}
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1"
                  style={{ color: site.theme.textMuted }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </form>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <button
                onClick={handleRandomArticle}
                className="text-sm hover:underline"
                style={{ color: site.theme.primary }}
              >
                Random article
              </button>
              <span className="text-sm" style={{ color: site.theme.textMuted }}>
                {SAMPLE_ARTICLES.length.toLocaleString()} articles
              </span>
            </div>
          </div>
        </div>

        {/* Navigation tabs */}
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-1 -mb-px">
            {['Article', 'Talk', 'View history'].map((tab, i) => (
              <button
                key={tab}
                className="px-4 py-2 text-sm border-b-2 transition-colors"
                style={{
                  color: i === 0 ? site.theme.text : site.theme.textMuted,
                  borderColor: i === 0 ? site.theme.primary : 'transparent',
                  background: i === 0 ? site.theme.surface : 'transparent',
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Article Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Main Content */}
          <article className="flex-1 min-w-0">
            {/* Title */}
            <h1
              className="text-3xl font-serif border-b pb-2 mb-4"
              style={{ color: site.theme.text, borderColor: site.theme.border }}
            >
              {selectedArticle.title}
            </h1>

            {/* Article info bar */}
            <div
              className="flex items-center gap-4 text-xs mb-4 pb-2 border-b"
              style={{ color: site.theme.textMuted, borderColor: site.theme.border }}
            >
              <span>From {site.name}, the free encyclopedia</span>
              <span>•</span>
              <span>{selectedArticle.views.toLocaleString()} views</span>
              <span>•</span>
              <span>Last edited {selectedArticle.lastEdited}</span>
            </div>

            {/* Summary */}
            <p className="text-sm leading-relaxed mb-6" style={{ color: site.theme.text }}>
              <strong>{selectedArticle.title}</strong> {selectedArticle.summary.replace(selectedArticle.title, '')}
            </p>

            {/* Table of Contents */}
            <div
              className="p-4 mb-6 rounded"
              style={{ background: site.theme.background, border: `1px solid ${site.theme.border}` }}
            >
              <h2 className="font-bold text-sm mb-2" style={{ color: site.theme.text }}>
                Contents
              </h2>
              <ol className="list-decimal list-inside text-sm space-y-1">
                {selectedArticle.sections.map((section, i) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="hover:underline"
                      style={{ color: site.theme.primary }}
                    >
                      {section.heading}
                    </a>
                    {section.subsections && (
                      <ol className="list-decimal list-inside ml-6 mt-1 space-y-1">
                        {section.subsections.map((sub, j) => (
                          <li key={sub.id} className="text-xs">
                            <a
                              href={`#${sub.id}`}
                              className="hover:underline"
                              style={{ color: site.theme.primary }}
                            >
                              {sub.heading}
                            </a>
                          </li>
                        ))}
                      </ol>
                    )}
                  </li>
                ))}
              </ol>
            </div>

            {/* Sections */}
            {selectedArticle.sections.map((section, i) => (
              <section key={section.id} id={section.id} className="mb-6">
                <h2
                  className="text-xl font-serif font-bold border-b pb-1 mb-3"
                  style={{ color: site.theme.text, borderColor: site.theme.border }}
                >
                  {section.heading}
                </h2>
                <div
                  className="text-sm leading-relaxed whitespace-pre-wrap"
                  style={{ color: site.theme.text }}
                >
                  {section.content}
                </div>

                {/* Subsections */}
                {section.subsections?.map((sub) => (
                  <div key={sub.id} id={sub.id} className="mt-4 ml-4">
                    <h3
                      className="text-lg font-serif font-bold mb-2"
                      style={{ color: site.theme.text }}
                    >
                      {sub.heading}
                    </h3>
                    <div
                      className="text-sm leading-relaxed whitespace-pre-wrap"
                      style={{ color: site.theme.text }}
                    >
                      {sub.content}
                    </div>
                  </div>
                ))}
              </section>
            ))}

            {/* References */}
            <section className="mt-8">
              <h2
                className="text-xl font-serif font-bold border-b pb-1 mb-3"
                style={{ color: site.theme.text, borderColor: site.theme.border }}
              >
                References
              </h2>
              <ol className="list-decimal list-inside text-xs space-y-2" style={{ color: site.theme.textMuted }}>
                {selectedArticle.references.map((ref, i) => (
                  <li key={i}>{ref}</li>
                ))}
              </ol>
            </section>

            {/* Categories */}
            <div
              className="mt-8 p-3 text-xs"
              style={{ background: site.theme.background, border: `1px solid ${site.theme.border}` }}
            >
              <span style={{ color: site.theme.textMuted }}>Categories: </span>
              <a href="#" className="hover:underline" style={{ color: site.theme.primary }}>
                {selectedArticle.category}
              </a>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="w-72 shrink-0">
            {/* Infobox */}
            {selectedArticle.infobox && (
              <div
                className="mb-6 text-sm"
                style={{
                  background: site.theme.background,
                  border: `1px solid ${site.theme.border}`,
                }}
              >
                <div
                  className="px-3 py-2 font-bold text-center"
                  style={{ background: site.theme.border, color: site.theme.text }}
                >
                  {selectedArticle.title}
                </div>
                {selectedArticle.infobox.image && (
                  <div className="p-4 text-center">
                    <span className="text-6xl">{selectedArticle.infobox.image}</span>
                    {selectedArticle.infobox.imageCaption && (
                      <p className="text-xs mt-2" style={{ color: site.theme.textMuted }}>
                        {selectedArticle.infobox.imageCaption}
                      </p>
                    )}
                  </div>
                )}
                <table className="w-full text-xs">
                  <tbody>
                    {Object.entries(selectedArticle.infobox.facts).map(([key, value]) => (
                      <tr key={key} style={{ borderTop: `1px solid ${site.theme.border}` }}>
                        <th
                          className="px-3 py-1.5 text-left font-semibold"
                          style={{ background: site.theme.background, color: site.theme.textMuted }}
                        >
                          {key}
                        </th>
                        <td className="px-3 py-1.5" style={{ color: site.theme.text }}>
                          {value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Related Articles */}
            <div
              className="p-4"
              style={{
                background: site.theme.surface,
                border: `1px solid ${site.theme.border}`,
              }}
            >
              <h3 className="font-bold text-sm mb-3" style={{ color: site.theme.text }}>
                See also
              </h3>
              <ul className="text-sm space-y-1">
                {selectedArticle.relatedArticles.map((title) => (
                  <li key={title}>
                    <button
                      onClick={() => handleRelatedClick(title)}
                      className="hover:underline text-left"
                      style={{ color: site.theme.primary }}
                    >
                      {title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Other articles */}
            <div
              className="mt-6 p-4"
              style={{
                background: site.theme.surface,
                border: `1px solid ${site.theme.border}`,
              }}
            >
              <h3 className="font-bold text-sm mb-3" style={{ color: site.theme.text }}>
                Other articles
              </h3>
              <ul className="text-sm space-y-2">
                {SAMPLE_ARTICLES.filter(a => a.id !== selectedArticle.id).map((article) => (
                  <li key={article.id}>
                    <button
                      onClick={() => setSelectedArticle(article)}
                      className="hover:underline text-left"
                      style={{ color: site.theme.primary }}
                    >
                      {article.title}
                    </button>
                    <span className="text-xs ml-2" style={{ color: site.theme.textMuted }}>
                      ({article.category})
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer
        className="mt-8 py-4 text-center text-xs"
        style={{ background: site.theme.surface, borderTop: `1px solid ${site.theme.border}`, color: site.theme.textMuted }}
      >
        <p>Content is available under the Creative Commons Attribution-ShareAlike License.</p>
        <p className="mt-1">
          {site.name} is a project of the Totally Real Encyclopedia Foundation.
        </p>
      </footer>
    </div>
  )
}

export default WikiKnowSite
