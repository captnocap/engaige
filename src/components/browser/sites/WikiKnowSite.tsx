/**
 * WikiKnow Site
 *
 * Wikipedia clone for the engAIge browser.
 * Features encyclopedic content about absurd topics played completely straight.
 */

import { useState } from 'react'
import type { SiteProps } from '../BrowserSiteContainer.js'
import { FILLER_SITES } from '../../../config/filler-sites.js'
import { SidebarAdWidget } from '../ads/index.js'

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
  // ============================================================================
  // New Lore Articles
  // ============================================================================
  {
    id: 'derek_observerson',
    title: 'Derek Observerson',
    category: 'People',
    summary: `Derek Observerson (born 1987) is an American independent beverage researcher and quantum coffee advocate, best known for his 847 documented brewing experiments and his controversial role in popularizing the Martinez Study. A former IT consultant, Observerson has become a polarizing figure in the coffee enthusiast community, with supporters praising his dedication to "observational brewing science" and critics characterizing him as "the most expensive divorce in quantum coffee history."`,
    sections: [
      {
        id: 'early_life',
        heading: 'Early Life',
        content: `Observerson was born in Portland, Oregon, and showed an early interest in both technology and beverages. He earned a degree in Information Systems from Portland State University in 2009, where he reportedly first experimented with "optimized hydration schedules" during late-night coding sessions.

Former roommates have described Observerson as "intense about water temperature" even before his introduction to quantum coffee. A 2021 Threadit post, allegedly from a college acquaintance, claimed that Observerson "once measured the pH of his tears after watching the ending of Cast Away."[1]`,
      },
      {
        id: 'career',
        heading: 'Career',
        content: `After graduation, Observerson worked as an IT consultant for various firms in the Pacific Northwest, a career he describes as being "between contracts" since 2022. His transition to full-time beverage research coincided with his discovery of Dr. Elena Martinez's preliminary study on quantum brewing effects.

Observerson's blog, QuantumBrewBlog, has documented 847 individual brewing experiments since 2021, each with detailed notes on "observation duration," "quantum coherence indicators," and "flavor wave collapse events." The blog receives an estimated 12,000 monthly visitors, though analytics suggest many arrive via links from r/HobbyDrama.[2]

**Notable Experiments:**
- Trial #47: First successful "double observation" technique
- Trial #312: Introduced Mr. Whiskers (his cat) as a "secondary observer"
- Trial #666: The "Dark Roast Incident" (results redacted)
- Trial #847: Claimed to achieve "perfect molecular equilibration"`,
        subsections: [
          {
            id: 'martinez_study',
            heading: 'The Martinez Study Controversy',
            content: `Observerson is widely credited—and criticized—for popularizing Dr. Elena Martinez's 2021 preliminary study, which suggested quantum effects might influence coffee extraction. While the original paper noted its findings were "inconclusive and requiring replication," Observerson's blog posts frequently cited it as "peer-reviewed proof" of quantum coffee's validity.

Dr. Martinez herself has distanced herself from Observerson's interpretations, stating in a 2023 interview: "I wrote a preliminary paper about interesting thermodynamic anomalies. I did not claim that staring at your coffee improves the taste."[3]

Despite this, Observerson maintains that Dr. Martinez is "under pressure from Big Coffee to suppress the truth." He has reportedly sent her 47 emails requesting collaboration, none of which have received responses.`,
          },
        ],
      },
      {
        id: 'personal_life',
        heading: 'Personal Life and Divorce',
        content: `Observerson married Jennifer Observerson (née Thompson) in 2018. The marriage dissolved in 2024, with court documents citing "irreconcilable differences regarding household beverage expenditure" and "obsessive observation behaviors."[4]

In posts on various subreddits, Observerson has frequently referenced his divorce, often in the context of quantum coffee. A notable Threadit post titled "AITA for spending our vacation fund on a Quantum Brew Pro 3000?" received over 2,400 comments, with the consensus being "YTA."

Observerson lives alone in a Portland apartment with his cat, Mr. Whiskers, whom he describes as "the only living being who truly understands the importance of molecular observation." He has been banned from three local Starbucks locations for "attempting to 'correct' barista brewing techniques."

**Financial Impact:**
According to receipts shared on his blog, Observerson has spent an estimated $47,000 on quantum coffee equipment and supplies since 2021. This figure does not include electricity costs, which he has described as "substantial but necessary for science."`,
      },
      {
        id: 'criticism',
        heading: 'Criticism',
        content: `Observerson has faced significant criticism from multiple communities:

**Scientific Community:** Dr. Sarah Blackwell of MIT has described Observerson as "what happens when confirmation bias gets a subscription to a physics journal abstract service."[5]

**Traditional Coffee Enthusiasts:** The International Barista Association has declined to comment on Observerson specifically but has noted that "some individuals in the quantum coffee space actively harm public understanding of coffee science."

**Personal Relationships:** His ex-wife Jennifer, in a viral TikTok video titled "Life After Quantum Coffee," described living with Observerson as "like being married to someone who joined a cult, except the cult is about water temperature and costs $47 per cup."[6]

**Online Communities:** Several subreddits have implemented "No Derek" rules after his tendency to appear in any thread mentioning coffee, temperature, or cats.`,
      },
      {
        id: 'legacy',
        heading: 'Legacy',
        content: `Despite criticism, Observerson maintains a dedicated following among quantum coffee enthusiasts. His blog continues to publish regular updates, and he has been invited to speak at three "Quantum Brewing Symposiums" (which he also organized).

The Underground, a local music venue, has banned Observerson from the premises after he allegedly attempted to "observe" other patrons' drinks. However, Mars, the venue's owner, noted that Observerson "seemed like a nice enough guy, just... a lot."

Observerson is currently working on a book titled "The Observation Principle: How I Lost My Wife But Found Perfect Coffee," scheduled for self-publication in 2026.`,
      },
    ],
    infobox: {
      image: '👨‍🔬',
      imageCaption: 'Observerson at Quantum Brewing Symposium III, 2024',
      facts: {
        'Born': '1987 (age 37-38)',
        'Occupation': 'Independent Beverage Researcher',
        'Known for': 'Quantum coffee advocacy, 847 brewing experiments',
        'Spouse': 'Jennifer Observerson (m. 2018, div. 2024)',
        'Pet': 'Mr. Whiskers (cat)',
        'Notable blog': 'QuantumBrewBlog',
        'Starbucks bans': '3',
        'Estimated spending': '$47,000+',
      },
    },
    relatedArticles: [
      'Quantum Coffee Brewing',
      'Dr. Elena Martinez',
      'Martinez Study',
      'The Underground (venue)',
      'Quantum Coffee',
    ],
    references: [
      'Anonymous Threadit user. (2021). "I went to college with the quantum coffee guy AMA." r/HobbyDrama.',
      'SimilarWeb Analytics. (2024). "QuantumBrewBlog Traffic Report."',
      'Martinez, E. (2023). Interview with Science Daily. "On Misinterpretation of Preliminary Research."',
      'Observerson v. Observerson (2024). Portland Family Court, Case No. 2024-FC-0847.',
      'Blackwell, S. (2023). Twitter/X post, archived.',
      'Thompson, J. [@jennyescapedcoffee]. (2024). "Life After Quantum Coffee" [TikTok video].',
    ],
    lastEdited: '14 hours ago',
    views: 34521,
  },
  {
    id: 'hartwell_building',
    title: 'The Hartwell Building',
    category: 'Buildings',
    summary: `The Hartwell Building is a commercial building located in downtown, constructed in 1923 by industrialist Magnus Hartwell. The building has been the subject of persistent urban legends and conspiracy theories regarding a "missing floor," temporal anomalies, and the unexplained disappearance of its founder in 1931. Currently owned by Omnicorp Holdings, the building remains partially occupied despite decades of incomplete renovations.`,
    sections: [
      {
        id: 'disputed_tag',
        heading: '',
        content: `**This article has multiple issues.** Please help improve it or discuss these issues on the talk page.
- This article's neutrality is disputed. (December 2024)
- This article may contain original research. (January 2025)
- Some of this article's claims require citations from reliable sources. (Ongoing)`,
      },
      {
        id: 'history',
        heading: 'History',
        content: `The Hartwell Building was commissioned by Magnus Hartwell, a railroad industrialist whose fortune was made during the expansion of the Pacific Northwest rail network. Construction began in 1922 and was completed in 1923 at a cost of $2.3 million (equivalent to approximately $42 million in 2024 dollars).

Magnus Hartwell maintained an office on what was then designated as the 13th floor until his disappearance on October 15, 1931. He was last seen entering the building at 9:47 PM. His body was never recovered, and the case remains officially unsolved.[1]

Following Hartwell's disappearance, the building passed through several owners:
- 1932-1958: Hartwell Estate Trust
- 1958-1984: Pacific Commerce Holdings
- 1984-present: Omnicorp Holdings

The building underwent major "renovations" in 1984, after which it was listed as having 12 floors. The basement has been continuously "under renovation" since this time.[2]`,
      },
      {
        id: 'architecture',
        heading: 'Architecture',
        content: `The Hartwell Building is a 12-story [disputed – discuss] structure designed in the Art Deco style with Gothic Revival influences. The architect's identity is unknown, as the original blueprints were destroyed in a fire at the city records office in 1952—the same year photographs emerged showing the building with 13 visible floors.

**Architectural Features:**
- Limestone and granite facade
- Brass elevator doors with geometric patterns
- Original terrazzo flooring in the lobby
- Extensive use of mirrors on Floor 7
- Gargoyles on corners (added 1928, removed 1984, reinstalled 2019)

The building is notable for having two sets of elevator buttons: the modern set shows floors 1-12, while a older set behind a maintenance panel shows floors 1-14 with floor 13 scratched out.[citation needed]`,
        subsections: [
          {
            id: 'floor_7',
            heading: 'Floor 7',
            content: `Floor 7 is the building's most architecturally unusual level, featuring an extensive installation of mirrors that predates the 1984 renovation. Current tenants report that the floor plan does not match building records, with some offices appearing to have no windows despite their supposed exterior location.

The mirrors have been the subject of numerous complaints. A 2019 building inspection report noted that "mirror placement creates disorienting spatial effects" but found no code violations. Several tenants have requested mirror removal, which Omnicorp Holdings has declined, citing "historical preservation requirements."[3]

A NestFinder listing for Floor 7 appeared briefly in January 2025 before being removed within 6 hours. Cached versions of the listing describe "a unique opportunity to experience living in the space between spaces."[citation needed]`,
          },
        ],
      },
      {
        id: 'missing_floor',
        heading: 'The Missing Floor Controversy',
        content: `The most persistent controversy surrounding the Hartwell Building involves claims that the building originally had 13 floors rather than the current 12.

**Evidence cited by proponents:**
- A 1952 photograph showing 13 visible floor levels (authentication disputed)
- Elevator button panels with floor 13 scratched out
- Inconsistencies in floor height measurements
- Eyewitness accounts of "arriving at a floor that doesn't exist"[4]

**Skeptical explanations:**
- The 1952 photograph may show a mechanical floor or decorative element
- Elevator irregularities are common in buildings of this age
- Height inconsistencies result from varying ceiling heights
- Eyewitness accounts may be influenced by suggestion

The building management does not comment on these claims. A 2020 request for floor plans under the Freedom of Information Act was denied on the grounds that the building is privately owned. Omnicorp Holdings did not respond to inquiries.`,
      },
      {
        id: 'temporal_anomalies',
        heading: 'Temporal Anomalies (reported)',
        content: `Beginning in 1999, various tenants and visitors have reported temporal anomalies within the building. These accounts are not verified by any scientific measurement.

**Reported phenomena:**
- Clocks running at different speeds on different floors
- Time discrepancies between entering and exiting the building
- Phone timestamps that don't match building security logs
- A 2019 incident where security footage showed a figure that appeared on no other cameras[5]

Dr. Helena Vance, a physicist at the local university, has stated that "there is no scientific basis for temporal anomalies in commercial real estate. If there were, physicists would be buying property, not publishing papers."[6]

Despite skepticism from the scientific community, online forums dedicated to the Hartwell Building (particularly r/HartwellFiles and the HartwellFiles.net archive) continue to document and investigate reported incidents. The subreddit has 847 active members as of January 2025.`,
      },
      {
        id: 'notable_tenants',
        heading: 'Notable Tenants',
        content: `**Current:**
- Floors 1-2: Retail (various, high turnover)
- Floor 3: Vacant since 2018
- Floor 4: Legal offices (Hendricks & Associates)
- Floor 5-6: Tech startup (name changes annually)
- Floor 7: "Mixed use" (tenant list unavailable)
- Floors 8-10: Omnicorp Holdings offices
- Floors 11-12: Vacant (listed as "under renovation")

**Historical:**
- Magnus Hartwell's personal office (Floor 13, 1923-1931)
- The Underground music venue (basement, 2008-2020) - relocated due to "acoustic concerns"
- Quantum Coffee Co. flagship cafe (Floor 1, 2022-2023) - closed after 47 complaints about "observation protocols"

The Underground's relocation in 2020 notably occurred after owner Marcus "Mars" Chen reported "increasingly weird vibes in the basement, like the walls were listening."[7]`,
      },
    ],
    infobox: {
      image: '🏢',
      imageCaption: 'The Hartwell Building (2024). Note: Floor count disputed.',
      facts: {
        'Built': '1923',
        'Floors': '12 (disputed)',
        'Original floors': '13 or 14 (unverified)',
        'Architect': 'Unknown (records lost)',
        'Owner': 'Omnicorp Holdings',
        'Builder': 'Magnus Hartwell',
        'Style': 'Art Deco/Gothic Revival',
        'Basement status': 'Under renovation (since 1984)',
      },
    },
    relatedArticles: [
      'Magnus Hartwell',
      'Omnicorp Holdings',
      'The Underground (venue)',
      'Art Deco architecture',
      'Urban legends',
    ],
    references: [
      'City Police Archives. (1931). "Hartwell, Magnus - Missing Person Report #1931-847."',
      'Building Permits Office. (1984). "Hartwell Building Renovation Permit #84-1213."',
      'Hendricks & Associates v. Omnicorp Holdings. (2019). "Motion for Mirror Removal." Denied.',
      'Various contributors. (2024). r/HartwellFiles wiki. "Eyewitness Testimony Archive."',
      'Building Security Report. (2019). "Incident #2019-1031." Unredacted version unavailable.',
      'Vance, H. (2023). Interview with Local News 7.',
      'Chen, M. (2020). Interview with Rolling Stone Digital.',
    ],
    lastEdited: '6 hours ago',
    views: 89234,
  },
  {
    id: 'trust_fall_tim',
    title: 'Trust Fall Tim',
    category: 'People',
    summary: `Timothy "Trust Fall Tim" Morrison (born 1985) is an American performance artist and self-described "trust consultant" known for his practice of performing trust falls at public venues, primarily The Underground. As of January 2025, Morrison has completed 2,847 documented falls with a career catch rate of 78.5%. His practice has been described as "a genuine exploration of human connection" by supporters and "a liability nightmare" by venue insurance providers.`,
    sections: [
      {
        id: 'fancruft_warning',
        heading: '',
        content: `**This article may contain excessive fancruft.** Please help improve it by removing excessive, minor, or trivial in-universe information. (November 2024)`,
      },
      {
        id: 'career',
        heading: 'Career',
        content: `Morrison began his trust fall practice in 2015 after what he describes as "a profound realization during a team-building exercise." In an interview with Local Arts Weekly, he stated: "Everyone was doing trust falls ironically, making jokes. But I looked at the person behind me and thought—what if we took this seriously?"[1]

His early performances occurred at various locations including parks, grocery stores, and bus stops. After several incidents (including being escorted from a Whole Foods), Morrison established a regular practice at The Underground music venue, where owner Marcus "Mars" Chen agreed to host him on the condition that he "keep it to between sets."

Morrison performs without prior arrangement with catchers, relying on what he calls "spontaneous trust." He maintains detailed logs of each fall, including:
- Date and time
- Location
- Catch result (caught/dropped/partial)
- Catcher identity (if known)
- "Trust resonance score" (a metric of his own devising)

His website, TrustFallTim.fan, archives all 2,847 documented falls with video when available.`,
      },
      {
        id: 'technique',
        heading: 'Technique',
        content: `Morrison has developed what he calls the "Morrison Method" of trust falling, which he has attempted to teach at various community centers with limited success.

**Key Elements:**
- The "trust announcement" - clearly stating "I am going to trust fall" approximately 3 seconds before falling
- The "surrender posture" - arms crossed over chest, eyes closed
- The "faith descent" - falling without looking back
- The "gratitude recovery" - thanking the catcher regardless of outcome

Morrison emphasizes that the practice is about "the moment of letting go" rather than being caught. This philosophy has been criticized by medical professionals, particularly following The Small Kevin Incident.[2]

**Statistics (as of January 2025):**
- Total documented falls: 2,847
- Catch rate: 78.5%
- Clean catches: 2,235
- Partial catches: 518
- Complete misses: 94
- Personal best streak: 47 consecutive catches
- Falls at The Underground: 847`,
      },
      {
        id: 'small_kevin_incident',
        heading: 'The Small Kevin Incident',
        content: `On March 15, 2022, Morrison suffered a concussion following a 6-foot fall when his designated catcher, Kevin Park (known as "Small Kevin"), failed to catch him during a performance at The Underground.

According to witnesses, Small Kevin was momentarily distracted by his phone when Morrison began his descent. Morrison struck his head on the venue's concrete floor and was hospitalized for two days. The incident was captured on video and has been viewed over 400,000 times on VidTube.[3]

Following his recovery, Morrison implemented the "catcher verification protocol" and issued a lifetime ban prohibiting Small Kevin from participating in his trust falls. This ban remains in effect.

**Notable quote from Morrison:** "I forgive Kevin. I have to. That's the whole point. But he's also never catching me again."[4]

The incident led to The Underground requiring Morrison to sign liability waivers before each performance. Morrison has described these forms as "the bureaucracy of trust."`,
      },
      {
        id: 'records_statistics',
        heading: 'Records and Statistics',
        content: `Morrison maintains detailed records of all trust fall activities, which he publishes monthly on his website.

**Personal Records:**
- Longest consecutive catch streak: 47 (ended by "a sneeze at a critical moment")
- Most falls in a single night: 23 (The Underground, New Year's Eve 2023)
- Fastest catcher response time: 0.3 seconds (Mars, one-handed, while holding a drink)
- Oldest catcher: 78 years old (name withheld)
- Youngest catcher: 16 years old (with parental consent)

**Catcher Hall of Fame:**
1. Marcus "Mars" Chen - 147 catches, 0 drops
2. "Big Kevin" Martinez - 89 catches, 2 drops
3. Amanda Torres - 67 catches, 1 drop
4. Derek Observerson - 1 catch, 0 drops (at Quantum Coffee Co., 2023)[5]

Mars's catch record includes one instance of catching Morrison while holding a full pint glass without spilling, which Morrison describes as "the greatest display of trust facilitation I have ever witnessed."`,
      },
      {
        id: 'popular_culture',
        heading: 'In Popular Culture',
        content: `Morrison's practice has received mixed coverage in media and popular culture.

**Media Appearances:**
- Local News 7: "Is Trust Fall Tim a Menace or a Movement?" (2023)
- VidTube: Trust fall compilation videos (various, 2M+ total views)
- Threadit: r/TrustFallTim (847 members)
- ForChan: Regular threads on /b/

**Music:**
The local band Neon Requiem included a hidden track titled "Trust (Fall)" on their final album, reportedly inspired by Morrison's performances. Morrison has stated he was "deeply moved" but has not been able to confirm if the song is actually about him.

**Merchandise:**
Morrison sells "I Caught Tim" t-shirts through his website, though legal questions have been raised about whether he can trademark someone else's act of catching.[6]

**Critical Reception:**
Art critic Helena Marsh wrote in Modern Performance Quarterly: "Morrison's practice interrogates the fundamental contract between individuals in public space. It asks us: what do we owe strangers? The answer, apparently, is a willingness to catch them."

Insurance adjuster Frank Thompson wrote on his personal blog: "This man is going to get someone killed."`,
      },
    ],
    infobox: {
      image: '🤸',
      imageCaption: 'Morrison demonstrating the "surrender posture" (2024)',
      facts: {
        'Born': '1985 (age 39-40)',
        'Occupation': 'Performance artist, Trust consultant',
        'Known for': '2,847 documented trust falls',
        'Catch rate': '78.5%',
        'Primary venue': 'The Underground',
        'Consecutive record': '47 catches',
        'Website': 'TrustFallTim.fan',
        'Notable incident': 'The Small Kevin Incident (2022)',
      },
    },
    relatedArticles: [
      'The Underground (venue)',
      'Performance art',
      'Marcus Chen',
      'Neon Requiem',
    ],
    references: [
      'Morrison, T. (2019). Interview with Local Arts Weekly.',
      'Various physicians. (2022). "Open Letter Regarding Unsolicited Trust Falls." Published in Local Medical Journal.',
      'VidTube. (2022). "Trust Fall Tim vs Small Kevin - THE INCIDENT" [video].',
      'Morrison, T. (2022). "On Forgiveness and Kevin." TrustFallTim.fan blog post.',
      'Observerson, D. (2023). "The Day I Caught Tim." QuantumBrewBlog.',
      'Johnson, M. (2024). "Can You Trademark Being Caught?" Intellectual Property Weekly.',
    ],
    lastEdited: '2 days ago',
    views: 67432,
  },
  {
    id: 'quantum_coffee_pseudoscience',
    title: 'Quantum Coffee',
    category: 'Pseudoscience',
    summary: `Quantum Coffee is a term used to describe a pseudoscientific approach to coffee preparation that claims quantum mechanical effects can be harnessed to improve flavor and molecular consistency. Proponents assert that "observing" coffee during the brewing process causes quantum wave function collapse that optimizes extraction. The claims have been widely rejected by the scientific community, though a dedicated subculture of enthusiasts continues to practice and promote the methodology.`,
    sections: [
      {
        id: 'pseudoscience_warning',
        heading: '',
        content: `**This article is about a pseudoscientific concept.** Quantum coffee claims are not supported by peer-reviewed scientific evidence. See scientific criticism section.`,
      },
      {
        id: 'claims',
        heading: 'Claims',
        content: `Quantum coffee proponents make several claims about the brewing process:

**Core Assertions:**
- Coffee extraction is influenced by quantum observation effects
- "Observing" water molecules during heating improves temperature uniformity
- The consciousness of the observer affects molecular behavior
- Extended observation periods (typically 45-60 minutes) produce measurably better coffee[1]

**Proposed Mechanisms:**
Advocates suggest that the observer effect in quantum mechanics—where the act of measurement affects particle behavior—applies to macroscopic coffee brewing. They claim that sustained attention during brewing causes water molecules to enter optimal quantum states for extraction.

**Typical Practice:**
A standard quantum coffee brewing session, as described by proponent Derek Observerson, involves:
1. Preparing beans and water as in traditional brewing
2. "Observing" the water during heating (45-60 minutes)
3. Maintaining eye contact with the brew during extraction
4. Avoiding distractions that might "break coherence"
5. Optional: Secondary observers to "reinforce the field"

Critics note that these steps are not based on any established physics and that quantum effects do not operate at the macroscopic level in the manner described.`,
      },
      {
        id: 'martinez_study',
        heading: 'The Martinez Study',
        content: `The popularity of quantum coffee largely stems from a 2021 preliminary paper by Dr. Elena Martinez of the local university physics department titled "Anomalous Thermodynamic Behavior in Observed vs. Unobserved Aqueous Heating."

**The Study:**
Martinez's original paper documented minor temperature variations between observed and unobserved water samples during heating. The paper explicitly noted:
- Sample size was small (n=12)
- Results were within experimental error margins
- No claim of quantum effects was made
- Further replication was needed

**Misinterpretation:**
The paper was subsequently cited by quantum coffee advocates as evidence supporting their claims. Derek Observerson's blog post "CONFIRMED: Science Proves Quantum Coffee Is Real" mischaracterized the study as definitive proof of observer effects on coffee.[2]

**Martinez's Response:**
Dr. Martinez has repeatedly distanced herself from the quantum coffee movement:
- "My paper made no claims about coffee whatsoever." (2022 interview)
- "The quantum coffee community has fundamentally misunderstood both my research and quantum mechanics." (2023 statement)
- "I have started drinking tea to avoid the conversation." (2024 tweet)

Despite Martinez's objections, her name continues to be invoked by quantum coffee proponents, and she has reportedly received hundreds of emails requesting "collaboration opportunities."`,
      },
      {
        id: 'criticism',
        heading: 'Criticism',
        content: `Quantum coffee has been extensively criticized by physicists, food scientists, and coffee industry professionals.

**Scientific Criticism:**
Dr. Sarah Blackwell of MIT has been a prominent skeptic:
- "Quantum effects do not scale to coffee cups. If they did, the universe would be a very different place."[3]
- "The 'observer effect' refers to measurement apparatus physically interacting with particles, not consciousness magically improving your latte."

**Coffee Industry Response:**
The International Barista Association issued a 2022 statement:
- "There is no scientific basis for 'observing' coffee during brewing."
- "We recommend evidence-based brewing parameters: grind size, water temperature, extraction time."
- "We will not certify 'quantum baristas.'"

**Cost Concerns:**
Consumer advocates have noted that quantum coffee products are significantly overpriced:
- Quantum coffee makers: $2,999-$15,000
- Per-cup cost at "Q-Cafes": $47 average
- Electricity consumption: Substantial due to 45-60 minute brewing times

A 2023 consumer report estimated that quantum coffee enthusiasts spend 847% more on coffee annually compared to traditional brewing methods.[4]

**Relationship Impacts:**
A notable subcategory of criticism involves the personal costs of quantum coffee obsession:
- The subreddit r/QCsupport ("Quantum Coffee Survivors Support") has 2,400 members
- Multiple AITA posts on Threadit involve quantum coffee relationship conflicts
- At least one documented divorce (Observerson v. Observerson, 2024) cited quantum coffee as a contributing factor`,
      },
      {
        id: 'cultural_impact',
        heading: 'Cultural Impact',
        content: `Despite scientific rejection, quantum coffee has developed a significant subculture.

**Commercial Presence:**
- 2,400+ self-described "Q-Cafes" worldwide (as of 2024)
- Market size estimated at $1.2 billion
- Major appliance manufacturers have released "quantum" coffee products (with no claimed quantum functionality)

**Community:**
- QuantumBrewBlog (Derek Observerson's site): 12,000 monthly visitors
- r/QuantumCoffee: 8,400 members
- Annual "Quantum Brewing Symposium" events
- Dating site profiles mentioning quantum coffee (typically as dealbreaker)

**Media Coverage:**
The phenomenon has been covered as a cultural curiosity:
- "The $47 Cup: Inside Quantum Coffee Culture" (Daily Buzz, 2023)
- "My Year of Observing Coffee" (documentary, 2024)
- "Please Stop Asking Me About Quantum Coffee" (Dr. Martinez, op-ed, 2024)

**Humor:**
Quantum coffee has become a frequent subject of internet humor:
- The phrase "Have you tried observing it?" has become a sarcastic response to technical problems
- "Schrödinger's Espresso" jokes reference both quantum mechanics and coffee
- Trust Fall Tim once asked a crowd at The Underground if anyone had "observed their beer" (received mixed laughter)[5]`,
      },
    ],
    infobox: {
      image: '⚛️',
      imageCaption: 'Common quantum coffee brewing apparatus',
      facts: {
        'Type': 'Pseudoscientific beverage preparation',
        'Main proponent': 'Derek Observerson',
        'Origin': 'Misinterpretation of Martinez Study (2021)',
        'Typical price': '$47/cup',
        'Brew time': '45-60 minutes',
        'Scientific status': 'Rejected',
        'Q-Cafes worldwide': '2,400+',
        'Market size': '$1.2 billion',
      },
    },
    relatedArticles: [
      'Derek Observerson',
      'Dr. Elena Martinez',
      'Quantum Coffee Brewing',
      'Pseudoscience',
      'Observer effect',
      'Coffee culture',
    ],
    references: [
      'Observerson, D. (2021-present). QuantumBrewBlog. Various posts.',
      'Observerson, D. (2021). "CONFIRMED: Science Proves Quantum Coffee Is Real." QuantumBrewBlog.',
      'Blackwell, S. (2023). "Quantum Coffee: Science or Science Fiction?" MIT Technology Review.',
      'Consumer Protection Bureau. (2023). "The True Cost of Quantum Coffee." Annual Report.',
      'Morrison, T. (2024). Performance at The Underground (audience recording).',
    ],
    lastEdited: '8 hours ago',
    views: 156234,
  },
  {
    id: 'the_underground_updated',
    title: 'The Underground (venue, history)',
    category: 'Music Venues',
    summary: `The Underground is an independent music venue currently located at 847 Canal Street, known for its support of local artists, its distinctive "no phones during sets" policy, and its role in launching the careers of bands including Neon Requiem and The Velvet Algorithms. Originally established in 2008 in the basement of the Hartwell Building, the venue relocated in 2020 following what owner Marcus "Mars" Chen described as "increasingly weird vibes."`,
    sections: [
      {
        id: 'history',
        heading: 'History',
        content: `The Underground was founded in 2008 by Marcus "Mars" Chen, a former record store employee who discovered an unused basement space in the Hartwell Building while attending an art show in a neighboring warehouse.

"The space was just there," Chen recalled in a 2022 interview. "No one was using it. The building management didn't seem to know it existed. I asked about renting it, and they looked at me like I'd asked to rent a dimension."[1]

The early years saw The Underground operate in a legal gray area, with Chen gradually formalizing the venue's status through a combination of permits, bribes, and what he describes as "strategic ambiguity about exactly where the venue was located." Fire marshals reportedly had difficulty finding the entrance on inspection visits.

**Timeline:**
- 2008: Venue opens in Hartwell Building basement
- 2012: First full legal permits obtained
- 2015: Capacity expanded to 200 (officially)
- 2019: Mars catches Trust Fall Tim one-handed
- 2020: Relocation to current location
- 2023: Noise complaint #847 received
- 2024: Neon Requiem's legendary final show

The venue has received over 847 noise complaints since relocating, surpassing its total from the previous location in just four years.`,
        subsections: [
          {
            id: 'hartwell_era',
            heading: 'The Hartwell Era (2008-2020)',
            content: `During its 12 years in the Hartwell Building basement, The Underground developed much of its identity and reputation. The space's unusual acoustics—described variously as "questionable," "haunted-sounding," and "like playing inside a reverb pedal made of concrete"—became part of the venue's character.

Several bands refused to play the space due to acoustic concerns, most notably The Velvet Algorithms, who cancelled a 2018 appearance citing the sound as "fundamentally incompatible with our artistic vision." They later described this decision as "prescient" given their subsequent relocation.

The basement was connected to the Hartwell Building's infrastructure in ways that Chen describes as "architecturally improbable." The venue had access to floors that building management claimed did not exist, and sound occasionally bled into the building above in patterns that did not match the venue's layout.

In 2019, security footage captured a figure in the venue that appeared on no other cameras. Chen has declined to discuss this incident in detail.`,
          },
          {
            id: 'relocation',
            heading: 'Relocation (2020)',
            content: `In early 2020, Chen announced the venue would relocate, citing "acoustic concerns" in public statements. In a subsequent interview with Rolling Stone Digital, he was more specific:

"The vibes got weird. Weirder than usual. We'd find doors that weren't there before. Sound would do things that sound shouldn't do. I started getting 847 emails from addresses that didn't exist asking about booking 'shows for the other audience.' Whatever that means."[2]

The relocation was completed in March 2020, just before pandemic restrictions began. Chen has described the timing as "suspiciously convenient, like something wanted us out before everything locked down."

The Hartwell Building basement remains sealed. Omnicorp Holdings lists it as "under renovation."`,
          },
        ],
      },
      {
        id: 'notable_performances',
        heading: 'Notable Performances',
        content: `**Neon Requiem's Final Show (January 2024):**
The post-punk band's last performance before their breakup is considered legendary among local music fans. The show was unannounced, with the band appearing during what was scheduled as an open mic night. Over 400 people attempted to enter a venue with 200-person capacity. The fire marshal was not pleased.[3]

**The Velvet Algorithms (2016, 2019 cancelled, 2021):**
The electronic duo's early performances at the venue helped establish their following. Their 2019 cancellation due to "acoustic incompatibility" and subsequent 2021 return (post-relocation) is considered a vindication of the venue's new space.

**DJ Probability's "Infinite Set" (2021):**
A 27-hour consecutive DJ set that broke multiple venue records. Audience members came and went in shifts, with some reportedly sleeping on what is known as "couch corner."

**Trust Fall Tim's Record Night (New Year's Eve 2023):**
23 trust falls in a single night, all caught. Mars personally caught 7 of them.

**The Velvet Algorithms' Existential Crisis (November 2024):**
During soundcheck, the duo had a breakdown about whether "music expresses human emotion or mathematical patterns." The scheduled show was cancelled. They have since been on a meditation retreat.`,
      },
      {
        id: 'noise_complaints',
        heading: 'The Noise Complaint Saga',
        content: `The Underground has received over 847 noise complaints since its 2020 relocation, making it one of the most-complained-about venues in the city. Chen displays a framed collection of complaint letters in the venue's green room.

**Notable Complaints:**
- Complaint #1: "Music too loud" (classic)
- Complaint #47: "The bass is resonating with my grandmother's medical equipment" (investigated, inconclusive)
- Complaint #312: "I can hear the music in my dreams" (forwarded to wellness services)
- Complaint #666: Complaint text was just the word "STOP" repeated 847 times
- Complaint #847: "Please keep doing what you're doing, I just wanted to be part of the count" (filed by suspected fan)[4]

Chen has implemented various noise mitigation measures, including soundproofing, reduced hours, and what he calls "aggressive good neighboring" (bringing cookies to nearby residents). The complaints continue.

City council has debated the venue's future at seven meetings, with no resolution. The venue remains open.`,
      },
      {
        id: 'cultural_significance',
        heading: 'Cultural Significance',
        content: `The Underground has been credited with fostering a distinct local sound that critics have termed "basement wave"—characterized by lo-fi production, introspective lyrics, and unusual time signatures developed in response to the original location's acoustic challenges.

**Venue Policies:**
- "No phones during sets" - Enforced by honor system and "gentle shaming"
- "If you catch Tim, drinks are on us" - Trust Fall Tim incentive program
- "Bands must use local openers" - Community support requirement
- "No quantum coffee discussion" - Implemented after Derek Observerson incident

**The Artist Wall:**
A section of wall where performers leave handwritten messages. Contains notes from over 600 artists and has been photographed for a forthcoming documentary.

**Community Role:**
The venue hosts weekly open mics, annual benefit shows for local causes, and serves as an informal community center for the local music scene. Mars has been known to let touring bands sleep in the green room.`,
      },
    ],
    infobox: {
      image: '🎵',
      imageCaption: 'The Underground\'s current location (2024)',
      facts: {
        'Established': '2008',
        'Location': '847 Canal Street (since 2020)',
        'Previous location': 'Hartwell Building basement (2008-2020)',
        'Owner': 'Marcus "Mars" Chen',
        'Capacity': '200',
        'Noise complaints': '847+',
        'Notable policy': 'No phones during sets',
        'Trust Fall Tim catches': '847',
      },
    },
    relatedArticles: [
      'Marcus Chen',
      'Neon Requiem',
      'The Velvet Algorithms',
      'Trust Fall Tim',
      'The Hartwell Building',
      'Basement wave',
    ],
    references: [
      'Chen, M. (2022). Interview with Local Music Monthly, Issue 47.',
      'Chen, M. (2020). Interview with Rolling Stone Digital.',
      'Fire Marshal Report. (2024). "Capacity Violation Incident #2024-01-15."',
      'City Noise Complaint Database. (2020-2025). Retrieved January 2025.',
    ],
    lastEdited: '1 day ago',
    views: 45678,
  },
  {
    id: 'omnicorp_holdings',
    title: 'Omnicorp Holdings',
    category: 'Companies',
    summary: `Omnicorp Holdings is a holding company headquartered in the Hartwell Building. The company has owned the Hartwell Building since 1984 and maintains various other undisclosed business interests. Little verifiable information about the company's operations, ownership structure, or leadership is publicly available.`,
    sections: [
      {
        id: 'press_release_warning',
        heading: '',
        content: `**This article reads like a press release or a news article and may largely represent the point of view of the subject.** Please help improve this article by adding independent citations. (January 2025)`,
      },
      {
        id: 'history',
        heading: 'History',
        content: `Omnicorp Holdings acquired the Hartwell Building in 1984 from Pacific Commerce Holdings. The circumstances of this acquisition are unclear [citation needed].

According to corporate filings, Omnicorp Holdings was incorporated in Delaware in 1983 [citation needed]. The company's founding documentation lists a registered agent but provides no information about beneficial owners or initial investors [clarification needed].

**Timeline:**
- 1983: Omnicorp Holdings incorporated (Delaware)
- 1984: Acquired Hartwell Building
- 1984: Initiated "renovation" of Hartwell Building basement (ongoing)
- 1984: Building floor count reduced from 13 to 12 [disputed]
- 1999-present: Various tenant complaints filed
- 2020: The Underground venue vacates basement
- 2025: NestFinder listing for Floor 7 appears and disappears [unverified]

The company has not issued any press releases or public statements since its founding [citation needed].`,
      },
      {
        id: 'operations',
        heading: 'Operations',
        content: `Omnicorp Holdings describes itself as a "diversified holding company with interests in real estate and related sectors" [citation needed].

**Known Assets:**
- The Hartwell Building (confirmed)
- Additional properties [citation needed]
- Undisclosed subsidiary companies [citation needed]

**Business Activities:**
The nature of Omnicorp Holdings' business activities is unclear. The company occupies floors 8-10 of the Hartwell Building but the number of employees and nature of work performed is unknown [citation needed].

Building tenants report that Omnicorp employees are rarely seen in common areas and that the company's office floors require special elevator access [citation needed]. Attempts by building inspectors to access these floors have been delayed due to "ongoing renovation work" since 1998 [clarification needed].`,
      },
      {
        id: 'leadership',
        heading: 'Leadership',
        content: `**Board of Directors:**
Unknown [citation needed]

**Executive Officers:**
Unknown [citation needed]

**Registered Agent:**
Capitol Corporate Services, Inc. (Delaware) [citation needed]

Corporate filings list no named officers or directors. Annual reports filed with the Delaware Secretary of State contain the minimum required information and are signed by the registered agent rather than a corporate officer [citation needed].

A 2019 investigative report by the local newspaper attempted to identify Omnicorp leadership through property records, court filings, and public documents. The reporter concluded that "either no one runs Omnicorp Holdings, or the people who do are very good at not existing on paper."[1]`,
      },
      {
        id: 'controversies',
        heading: 'Controversies',
        content: `**Building Management Issues:**
Tenants have filed complaints regarding:
- Unexplained renovation projects lasting decades [citation needed]
- Inaccessible floors [citation needed]
- Mirror removal requests denied [citation needed]
- Elevator irregularities [citation needed]
- Security footage anomalies [citation needed]

**Lack of Transparency:**
Freedom of Information requests for building permits, inspection records, and corporate communications have been denied on the grounds that the company is private property [citation needed].

**Connection to Magnus Hartwell:**
Some theorists have speculated about a connection between Omnicorp Holdings and the original building owner, Magnus Hartwell, who disappeared in 1931 [citation needed]. These theories are unsupported by evidence [citation needed].

**The r/HartwellFiles Community:**
An online community dedicated to investigating the Hartwell Building has compiled extensive documentation of alleged irregularities. Omnicorp Holdings has not responded to any inquiries from this community [citation needed].`,
      },
      {
        id: 'criticism',
        heading: 'Criticism',
        content: `[This section is empty. You can help by adding to it.]`,
      },
    ],
    infobox: {
      image: '🏛️',
      imageCaption: 'Omnicorp Holdings has no public logo on file',
      facts: {
        'Type': 'Holding company',
        'Founded': '1983 [citation needed]',
        'Headquarters': 'Hartwell Building, Floors 8-10',
        'Industry': 'Real estate, other [citation needed]',
        'Key people': 'Unknown',
        'Revenue': 'Unknown',
        'Employees': 'Unknown',
        'Website': 'None known',
      },
    },
    relatedArticles: [
      'The Hartwell Building',
      'Magnus Hartwell',
      'Shell company',
      'Corporate transparency',
    ],
    references: [
      'Thompson, R. (2019). "Who Owns the Hartwell Building?" Local Investigative Report.',
    ],
    lastEdited: '12 hours ago',
    views: 28934,
  },
]

// ============================================================================
// Components
// ============================================================================

export function WikiKnowSite({ siteId, onNavigate }: SiteProps) {
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

            {/* Sponsored Links */}
            <div className="mt-6">
              <SidebarAdWidget
                siteId="wikiknow"
                onNavigate={onNavigate}
                title="Sponsored Links"
                count={2}
              />
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
