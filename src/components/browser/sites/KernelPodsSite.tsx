/**
 * KernelPods Site
 *
 * A podcast platform where every show is somehow corn-adjacent or features
 * recurring lore characters. Clean podcast app aesthetic with episode listings,
 * ratings, reviews, and plenty of interconnected world-building.
 *
 * Features shows from Trust Fall Tim, Derek Observerson, Mildred Gasketsworth,
 * and mysterious anonymous hosts investigating the Hartwell Building.
 */

import { useState } from 'react'
import type { SiteProps } from '../BrowserSiteContainer.js'
import { StyledCard, Button } from '../../ui/shared/index.js'

// ============================================================================
// Types & Data
// ============================================================================

interface Episode {
  id: string
  number: number
  title: string
  duration: string
  releaseDate: string
  description: string
  downloads: number
  hasTranscript?: boolean
}

interface Review {
  id: string
  author: string
  rating: number
  date: string
  content: string
}

interface Podcast {
  id: string
  title: string
  host: string
  hostBio: string
  coverEmoji: string
  category: 'true-crime' | 'lifestyle' | 'self-help' | 'business' | 'food' | 'conspiracy'
  rating: number
  totalDownloads: number
  reviewCount: number
  description: string
  tagline: string
  episodes: Episode[]
  reviews: Review[]
  featured?: boolean
}

const CATEGORIES = {
  'true-crime': { name: 'True Crime', icon: '🔍', color: '#7C3AED' },
  'lifestyle': { name: 'Lifestyle', icon: '☕', color: '#D97706' },
  'self-help': { name: 'Self-Help', icon: '🧘', color: '#059669' },
  'business': { name: 'Business', icon: '💼', color: '#2563EB' },
  'food': { name: 'Food', icon: '🍣', color: '#DC2626' },
  'conspiracy': { name: 'Conspiracy', icon: '👁️', color: '#7F1D1D' },
}

const PODCASTS: Podcast[] = [
  // The 13th Floor - True Crime/Mystery
  {
    id: 'the-13th-floor',
    title: 'The 13th Floor',
    host: 'Anonymous (Voice Distorted)',
    hostBio: 'Identity unknown. Voice modulated. Location: somewhere with very good acoustics. The host claims to have "firsthand knowledge" of Hartwell Building operations but refuses to elaborate.',
    coverEmoji: '🏢',
    category: 'true-crime',
    rating: 4.7,
    totalDownloads: 847000,
    reviewCount: 2341,
    description: 'A deep investigation into the mysteries surrounding the Hartwell Building, Omnicorp Holdings, and the people who have vanished within its walls. If you\'re listening to this, you\'re already on their list.',
    tagline: 'The truth is on a floor that doesn\'t exist.',
    featured: true,
    episodes: [
      {
        id: '13f-001',
        number: 1,
        title: 'The Hartwell Disappearances',
        duration: '47:23',
        releaseDate: 'January 15, 2026',
        description: 'In 1931, Magnus Hartwell walked into his building and never came out. He wasn\'t the last. We\'ve compiled a list of 13 documented disappearances within the building\'s walls. The police have closed every case. We\'re reopening them.',
        downloads: 234000,
        hasTranscript: true,
      },
      {
        id: '13f-002',
        number: 2,
        title: 'Omnicorp: What Are They Hiding?',
        duration: '52:11',
        releaseDate: 'January 8, 2026',
        description: 'Omnicorp Holdings purchased the Hartwell Building in 1947. Since then, they\'ve owned it through 47 different shell companies. We traced the money. It leads somewhere unexpected. This episode was re-uploaded after the original mysteriously corrupted.',
        downloads: 198000,
        hasTranscript: true,
      },
      {
        id: '13f-003',
        number: 3,
        title: 'Interview with a Floor 13 Survivor',
        duration: '1:03:47',
        releaseDate: 'December 28, 2025',
        description: 'She asked us to distort her voice. She asked us to change her name. She asked us never to contact her again. But first, she told us what she saw on the floor that doesn\'t exist. Content warning: this episode may affect your sleep.',
        downloads: 312000,
        hasTranscript: false,
      },
      {
        id: '13f-004',
        number: 4,
        title: 'The Mirrors of Floor 7',
        duration: '44:15',
        releaseDate: 'December 15, 2025',
        description: 'Every janitor who\'s worked the night shift mentions the mirrors. "Don\'t look too long." What do they see? We spoke to 4 former employees. Their stories are... consistent. Disturbingly consistent.',
        downloads: 189000,
        hasTranscript: true,
      },
      {
        id: '13f-005',
        number: 5,
        title: 'The 1952 Photographs',
        duration: '38:42',
        releaseDate: 'December 1, 2025',
        description: 'We obtained photographs from 1952 showing the Hartwell Building with 13 floors. The current building has 12. The city planning office won\'t return our calls. Photography experts confirm the images are authentic.',
        downloads: 156000,
        hasTranscript: true,
      },
    ],
    reviews: [
      { id: 'r1', author: 'TruthSeeker847', rating: 5, date: 'Jan 18, 2026', content: 'Finally someone is asking the real questions. I used to work near the Hartwell Building. The energy there is WRONG. Subscribe immediately.' },
      { id: 'r2', author: 'SkepticalSam', rating: 3, date: 'Jan 12, 2026', content: 'Entertaining but the voice distortion is annoying. Also, has anyone verified any of this? Still listening though.' },
      { id: 'r3', author: 'HartwellWatcher', rating: 5, date: 'Jan 5, 2026', content: 'The Floor 13 Survivor episode gave me nightmares. Good nightmares. Important nightmares. Keep digging.' },
    ],
  },

  // Quantum Sips - Lifestyle/Coffee
  {
    id: 'quantum-sips',
    title: 'Quantum Sips',
    host: 'Derek Observerson',
    hostBio: 'Self-proclaimed "quantum coffee researcher" and author of the unpublished manuscript "Brewing Across Dimensions." Derek has been banned from 3 coffee shops for "excessive observation" of other patrons\' drinks.',
    coverEmoji: '☕',
    category: 'lifestyle',
    rating: 2.3,
    totalDownloads: 84,
    reviewCount: 12,
    description: 'The only podcast brave enough to explore the intersection of quantum physics and coffee preparation. Each episode, Derek analyzes brewing techniques, discusses the Martinez Study, and occasionally mentions his ex-wife Sharon.',
    tagline: 'Observing coffee so you don\'t have to.',
    featured: false,
    episodes: [
      {
        id: 'qs-001',
        number: 1,
        title: 'Why My Wife Left (And Why She\'s Wrong)',
        duration: '2:47:33',
        releaseDate: 'January 10, 2026',
        description: 'In this extended episode, Derek explains how his dedication to quantum coffee research contributed to his divorce. He maintains that Sharon "never understood the importance of the Martinez Study" and that "$47 per cup is actually reasonable when you factor in dimensional stability."',
        downloads: 23,
      },
      {
        id: 'qs-002',
        number: 2,
        title: 'The Martinez Study Exposed',
        duration: '1:23:45',
        releaseDate: 'January 3, 2026',
        description: 'Derek does a deep dive into Dr. Martinez\'s controversial 2019 study on quantum-observed coffee. Includes a 45-minute tangent about how the academic establishment is "afraid of the truth" and why his paper was rejected from 14 journals.',
        downloads: 18,
      },
      {
        id: 'qs-003',
        number: 3,
        title: '$47 Is Actually Cheap',
        duration: '58:12',
        releaseDate: 'December 20, 2025',
        description: 'A passionate defense of premium quantum coffee pricing. Derek breaks down the costs: equipment, observation time, dimensional calibration, and "spiritual preparation." He also reads aloud several negative Yelp reviews and explains why each reviewer is wrong.',
        downloads: 15,
      },
      {
        id: 'qs-004',
        number: 4,
        title: 'Sharon\'s Lawyer Says I Can\'t Mention Her By Name Anymore',
        duration: '34:22',
        releaseDate: 'December 10, 2025',
        description: 'Derek discusses recent legal developments while NOT mentioning his ex-wife by name. Instead, he refers to her as "The Person Who Never Appreciated Good Coffee" and reads from his brewing journal entries from happier times.',
        downloads: 12,
      },
      {
        id: 'qs-005',
        number: 5,
        title: 'I Saw Trust Fall Tim at Quantum Coffee Co.',
        duration: '42:18',
        releaseDate: 'November 28, 2025',
        description: 'Derek describes his encounter with local legend Trust Fall Tim at Quantum Coffee Co. He caught Tim during a trust fall while mid-lecture about wave function collapse. "It felt like the universe was sending me a message about trust. And coffee."',
        downloads: 16,
      },
    ],
    reviews: [
      { id: 'r1', author: 'CoffeeNormal', rating: 1, date: 'Jan 15, 2026', content: 'I came for coffee tips. I got a man crying about his divorce for 3 hours. Do not recommend.' },
      { id: 'r2', author: 'DereksFriend', rating: 5, date: 'Jan 10, 2026', content: 'Derek is a genius misunderstood by his time. Sharon was wrong. The Martinez Study will be vindicated.' },
      { id: 'r3', author: 'QuantumSkeptic', rating: 2, date: 'Jan 2, 2026', content: 'I don\'t think this man knows what quantum means. But I can\'t stop listening. It\'s like a car crash.' },
      { id: 'r4', author: 'DereksSister', rating: 5, date: 'Dec 25, 2025', content: 'Supporting family. Derek please call mom.' },
    ],
  },

  // Trust Issues - Self-Help
  {
    id: 'trust-issues',
    title: 'Trust Issues',
    host: 'Trust Fall Tim',
    hostBio: '2,847 trust falls and counting. Tim has dedicated his life to the art of falling backwards into strangers\' arms. His catch rate sits at 78.5%. The 21.5%? That\'s where the lessons live.',
    coverEmoji: '🙆',
    category: 'self-help',
    rating: 4.2,
    totalDownloads: 156000,
    reviewCount: 847,
    description: 'A motivational podcast about trust, vulnerability, and the courage to fall. Each episode, Tim shares wisdom from his 2,847 documented trust falls. Uplifting but gets increasingly philosophical. And occasionally dark.',
    tagline: 'Trust is not given. Trust is fallen into.',
    featured: true,
    episodes: [
      {
        id: 'ti-001',
        number: 1,
        title: 'Learning to Fall',
        duration: '34:15',
        releaseDate: 'January 12, 2026',
        description: 'The basics of trust falls and life. Tim discusses proper form (arms out, eyes closed, core engaged) and draws parallels to emotional vulnerability. "Every fall is a conversation. Your body is asking: will you catch me?"',
        downloads: 45000,
        hasTranscript: true,
      },
      {
        id: 'ti-002',
        number: 2,
        title: 'The Small Kevin Incident: My Side',
        duration: '47:22',
        releaseDate: 'January 5, 2026',
        description: 'Tim finally addresses The Incident of March 15, 2022. A 6-foot fall. No catch. A mild concussion. And a man named Small Kevin who "just wasn\'t ready." Tim harbors no resentment. He simply... remembers.',
        downloads: 67000,
        hasTranscript: true,
      },
      {
        id: 'ti-003',
        number: 3,
        title: '847 Falls, 847 Lessons',
        duration: '1:12:33',
        releaseDate: 'December 22, 2025',
        description: 'A marathon episode where Tim discusses lessons from his 847th fall through his 1,694th fall. Topics include: reading body language, the ethics of surprise falls, and why elderly women are statistically the most reliable catchers.',
        downloads: 34000,
        hasTranscript: false,
      },
      {
        id: 'ti-004',
        number: 4,
        title: 'When They Don\'t Catch You',
        duration: '28:47',
        releaseDate: 'December 8, 2025',
        description: 'Not every fall ends in an embrace. Tim reflects on his 613 drops and what they taught him about humanity. "A drop is not a failure. A drop is data. The floor has information too."',
        downloads: 23000,
        hasTranscript: true,
      },
      {
        id: 'ti-005',
        number: 5,
        title: 'Big Mike: A Tribute',
        duration: '22:15',
        releaseDate: 'November 20, 2025',
        description: 'A special episode dedicated to Tim\'s most reliable catcher, Big Mike from Tulsa. Tim shares stories of their partnership and Big Mike\'s philosophy: "I catch because someone has to. And my arms are big."',
        downloads: 19000,
        hasTranscript: true,
      },
    ],
    reviews: [
      { id: 'r1', author: 'FellForTim', rating: 5, date: 'Jan 14, 2026', content: 'I caught Tim at the farmers market last week. This podcast helped me understand why. I was ready. He knew I was ready. Beautiful.' },
      { id: 'r2', author: 'SmallKevin_Real', rating: 1, date: 'Jan 8, 2026', content: 'I WAS NOT WARNED. He just FELL. Who does that?? Stop telling people about "The Incident."' },
      { id: 'r3', author: 'MotivatedMary', rating: 4, date: 'Jan 2, 2026', content: 'Genuinely inspiring. Though the episodes about drops are... darker than expected. Tim, are you okay?' },
    ],
  },

  // Cob Talk - Business
  {
    id: 'cob-talk',
    title: 'Cob Talk',
    host: 'Omnicorp Holdings Communications Division',
    hostBio: 'A rotating cast of anonymous voices representing Omnicorp Holdings\' commitment to "transparent communication" and "stakeholder engagement." No individual hosts are credited. The division does not officially exist.',
    coverEmoji: '🌽',
    category: 'business',
    rating: 5.0,
    totalDownloads: 1,
    reviewCount: 1,
    description: 'The official corporate podcast of Omnicorp Holdings. Each episode features discussions on synergy, vertical integration, and agricultural futures. Occasional static and whispers are "an audio glitch that has been reported."',
    tagline: 'Growing together. Forward. Always forward.',
    featured: false,
    episodes: [
      {
        id: 'ct-001',
        number: 1,
        title: 'Q4 Stakeholder Alignment Initiative',
        duration: '23:47',
        releaseDate: 'January 14, 2026',
        description: 'Discussion of Q4 performance metrics and stakeholder alignment protocols. [Note: Minutes 12:00-15:00 contain unexplained static. Content during this period has not been recovered. This is normal.]',
        downloads: 1,
      },
      {
        id: 'ct-002',
        number: 2,
        title: 'Vertical Integration: A Corn-prehensive Overview',
        duration: '45:12',
        releaseDate: 'January 7, 2026',
        description: 'Our vertical integration specialists discuss supply chain optimization. Background audio contains what some listeners describe as "whispering." This has been investigated. There is no whispering. Listen again.',
        downloads: 1,
      },
      {
        id: 'ct-003',
        number: 3,
        title: 'The 13th Quarter Projection Report',
        duration: '??:??',
        releaseDate: 'December ?, 2025',
        description: 'Financial projections for the upcoming 13th quarter. [Editor\'s note: There are only 4 quarters in a year. This episode has been flagged for review. It remains available for compliance purposes.]',
        downloads: 1,
      },
      {
        id: 'ct-004',
        number: 4,
        title: 'Employee Wellness: Building a Better Tomorrow',
        duration: '30:00',
        releaseDate: 'December 15, 2025',
        description: 'Our wellness division discusses employee health initiatives at the Hartwell Building headquarters. Topics include "adequate lighting," "appropriate elevator usage," and "not looking at mirrors for extended periods."',
        downloads: 1,
      },
      {
        id: 'ct-005',
        number: 5,
        title: 'Community Engagement Through Corn',
        duration: '28:33',
        releaseDate: 'December 1, 2025',
        description: 'Omnicorp\'s community outreach programs and our commitment to the .corn top-level domain ecosystem. Remember: when you see .corn, you see family. The corn connects us all.',
        downloads: 1,
      },
    ],
    reviews: [
      { id: 'r1', author: 'OmnicorpCompliance', rating: 5, date: 'Jan 15, 2026', content: 'Five stars or else.' },
    ],
  },

  // Gas Station Gourmet - Food
  {
    id: 'gas-station-gourmet',
    title: 'Gas Station Gourmet',
    host: 'Mildred Gasketsworth',
    hostBio: 'Retired insurance adjuster, 67 years old, widow of Gerald (1954-2023). Has reviewed 412 gas stations across the Midwest. Two hospitalizations (unrelated). Author of the upcoming self-published book "Fine Dining at the Fuel Pump."',
    coverEmoji: '⛽',
    category: 'food',
    rating: 4.5,
    totalDownloads: 89000,
    reviewCount: 156,
    description: 'Mildred Gasketsworth\'s audio companion to her legendary gas station food reviews. Each episode explores the culinary possibilities at highway fuel stops. Gerald would disapprove. That fuels her passion.',
    tagline: 'Big Grocery doesn\'t want you to know.',
    featured: true,
    episodes: [
      {
        id: 'gsg-001',
        number: 1,
        title: 'Flying J #847: A Love Letter',
        duration: '52:18',
        releaseDate: 'January 16, 2026',
        description: 'Mildred returns to her favorite gas station, Flying J #847 on Interstate 29. The deluxe sashimi combo achieved a perfect 5-pump rating. Big Mike from Tulsa witnessed her tears. This episode includes a 10-minute description of wasabi.',
        downloads: 34000,
        hasTranscript: true,
      },
      {
        id: 'gsg-002',
        number: 2,
        title: 'The Great Sushi Scandal of Exit 42',
        duration: '47:33',
        releaseDate: 'January 9, 2026',
        description: 'An investigative episode. Three gas stations at Exit 42 claim to have "the freshest sushi." Mildred tested them all in one day. One station lied. The truth will be revealed. Dr. Patel has requested she stop.',
        downloads: 28000,
        hasTranscript: true,
      },
      {
        id: 'gsg-003',
        number: 3,
        title: 'Gerald\'s Corner: Why He Was Wrong',
        duration: '38:45',
        releaseDate: 'December 28, 2025',
        description: 'A special episode where Mildred reads aloud Gerald\'s objections to her hobby from their marriage (1978-2023). She refutes each one systematically. "Mildred, you\'ll get sick" - she addresses this statistically.',
        downloads: 22000,
        hasTranscript: false,
      },
      {
        id: 'gsg-004',
        number: 4,
        title: 'The Pump Rating System Explained',
        duration: '25:12',
        releaseDate: 'December 15, 2025',
        description: 'A comprehensive guide to Mildred\'s 5-pump rating system. What separates a 3-pump California roll from a 5-pump? Spoiler: it\'s not just freshness. It\'s soul.',
        downloads: 18000,
        hasTranscript: true,
      },
      {
        id: 'gsg-005',
        number: 5,
        title: 'I Met Trust Fall Tim at a Gas Station',
        duration: '33:27',
        releaseDate: 'December 1, 2025',
        description: 'Mildred recounts her encounter with Trust Fall Tim at a Shell station. She caught him one-handed while holding a California roll. "I\'ve assessed 47,000 insurance claims. I know how to catch falling objects. And people."',
        downloads: 15000,
        hasTranscript: true,
      },
    ],
    reviews: [
      { id: 'r1', author: 'SushiSkeptic', rating: 4, date: 'Jan 18, 2026', content: 'I tried the Flying J sushi based on this podcast. It was... actually fine? I\'m confused but intrigued.' },
      { id: 'r2', author: 'AmandaGasketsworth', rating: 3, date: 'Jan 10, 2026', content: 'Mom, please. I love you but this is a lot. The episodes about Dad are particularly... a lot.' },
      { id: 'r3', author: 'TruckerBigMike', rating: 5, date: 'Jan 5, 2026', content: 'I was the Big Mike at Flying J! Mildred is a national treasure. My ex-wife did this with Cracker Barrels. I understand the mission.' },
    ],
  },

  // GrainTruth Radio - Conspiracy
  {
    id: 'graintruth-radio',
    title: 'GrainTruth Radio',
    host: 'The Kernel (Anonymous)',
    hostBio: 'Identity unknown. May be one person or many. Claims to have "sources within the corn industry." The podcast is the audio companion to GrainTruth.corn, the premier corn-based conspiracy research site.',
    coverEmoji: '🌽',
    category: 'conspiracy',
    rating: 3.8,
    totalDownloads: 234000,
    reviewCount: 892,
    description: 'The audio arm of GrainTruth.corn\'s research operations. Big Corn is watching. The .corn TLD was not an accident. Nebraska may not exist. Connect the kernels.',
    tagline: 'Follow the chaff trail.',
    featured: false,
    episodes: [
      {
        id: 'gt-001',
        number: 1,
        title: 'Big Corn Is Listening',
        duration: '58:22',
        releaseDate: 'January 13, 2026',
        description: 'An introduction to the corn surveillance apparatus. How agricultural lobbying became information warfare. Why your smart devices respond faster when you mention corn. This episode was uploaded 3 times after mysterious deletions.',
        downloads: 78000,
        hasTranscript: false,
      },
      {
        id: 'gt-002',
        number: 2,
        title: 'The .corn TLD Psyop',
        duration: '1:12:45',
        releaseDate: 'January 6, 2026',
        description: 'Why does the .corn top-level domain exist? Who approved it? Why do all the strange websites use it? We trace the domain\'s history to a 2019 ICANN meeting that "has no official records." Coincidence?',
        downloads: 67000,
        hasTranscript: true,
      },
      {
        id: 'gt-003',
        number: 3,
        title: 'Nebraska Doesn\'t Exist: The Proof',
        duration: '2:34:17',
        releaseDate: 'December 30, 2025',
        description: 'Our most controversial episode. We examine satellite data, census anomalies, and first-hand accounts from people who claim to have "visited" Nebraska. The evidence is disturbing. If Nebraska is real, why can\'t anyone describe it?',
        downloads: 89000,
        hasTranscript: true,
      },
      {
        id: 'gt-004',
        number: 4,
        title: 'The Martinez-Hartwell Connection',
        duration: '45:33',
        releaseDate: 'December 15, 2025',
        description: 'Dr. Martinez\'s quantum coffee research. The Hartwell Building\'s missing floor. Derek Observerson\'s divorce. These events are connected. The corn knows. We\'re pulling the thread.',
        downloads: 45000,
        hasTranscript: false,
      },
      {
        id: 'gt-005',
        number: 5,
        title: 'Interview with Dr. Helena Cryptwood',
        duration: '1:47:22',
        releaseDate: 'December 1, 2025',
        description: 'Exclusive interview with GrainTruth.corn\'s chief researcher. Dr. Cryptwood discusses the Burgundy wheat surplus of 1347, The Threshing Floor organization, and why she was "forced out" of academia. The chaff trail continues.',
        downloads: 56000,
        hasTranscript: true,
      },
    ],
    reviews: [
      { id: 'r1', author: 'CornWatcher', rating: 5, date: 'Jan 15, 2026', content: 'They\'re right about Nebraska. I drove through it once and remember nothing. That\'s not normal.' },
      { id: 'r2', author: 'RationalRob', rating: 1, date: 'Jan 8, 2026', content: 'I\'m from Nebraska. We exist. Please stop.' },
      { id: 'r3', author: 'ChaffFollower', rating: 5, date: 'Jan 2, 2026', content: 'Dr. Cryptwood interview was essential listening. The Martinez-Hartwell connection is REAL. Keep digging.' },
      { id: 'r4', author: 'OmnicorpCompliance', rating: 1, date: 'Dec 20, 2025', content: 'This podcast contains inaccuracies about Omnicorp Holdings. Legal action is being considered.' },
    ],
  },
]

// ============================================================================
// Components
// ============================================================================

/**
 * Star rating display component
 */
function StarRating({ rating }: { rating: number }) {
  const fullStars = Math.floor(rating)
  const hasHalf = rating % 1 >= 0.5
  return (
    <span className="text-yellow-500">
      {'★'.repeat(fullStars)}
      {hasHalf && '½'}
      <span className="text-gray-300">{'★'.repeat(5 - Math.ceil(rating))}</span>
      <span className="ml-1 text-sm text-gray-600">{rating.toFixed(1)}</span>
    </span>
  )
}

/**
 * Category badge component
 */
function CategoryBadge({ category }: { category: Podcast['category'] }) {
  const cat = CATEGORIES[category]
  return (
    <span
      className="text-xs px-2 py-0.5 rounded-full font-medium"
      style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
    >
      {cat.icon} {cat.name}
    </span>
  )
}

/**
 * Format download count for display
 */
function formatDownloads(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(0)}K`
  return num.toString()
}

/**
 * Podcast card for browse view
 */
function PodcastCard({
  podcast,
  onSelect,
}: {
  podcast: Podcast
  onSelect: () => void
}) {
  return (
    <StyledCard
      variant="default"
      padding="md"
      borderRadius="lg"
      shadow="md"
      onClick={onSelect}
      className="cursor-pointer hover:shadow-lg transition-shadow"
      bgColor="#ffffff"
      borderColor="#E5E7EB"
      textColor="#111827"
    >
      <div className="flex gap-4">
        <div
          className="w-20 h-20 rounded-lg flex items-center justify-center text-4xl flex-shrink-0"
          style={{ backgroundColor: `${CATEGORIES[podcast.category].color}15` }}
        >
          {podcast.coverEmoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-gray-900 truncate">{podcast.title}</h3>
            {podcast.featured && (
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full flex-shrink-0">
                Featured
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 truncate">{podcast.host}</p>
          <div className="flex items-center gap-2 mt-1">
            <StarRating rating={podcast.rating} />
            <span className="text-xs text-gray-400">({podcast.reviewCount})</span>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <CategoryBadge category={podcast.category} />
            <span className="text-xs text-gray-400">
              {formatDownloads(podcast.totalDownloads)} downloads
            </span>
          </div>
        </div>
      </div>
    </StyledCard>
  )
}

/**
 * Episode list item
 */
function EpisodeItem({
  episode,
  onSelect,
}: {
  episode: Episode
  onSelect: () => void
}) {
  return (
    <div
      onClick={onSelect}
      className="flex items-center gap-4 p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 cursor-pointer"
    >
      <button className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0 hover:bg-purple-700">
        <span className="text-white text-sm">▶</span>
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">EP {episode.number}</span>
          {episode.hasTranscript && (
            <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
              Transcript
            </span>
          )}
        </div>
        <h4 className="font-medium text-gray-900 truncate">{episode.title}</h4>
        <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
          <span>{episode.duration}</span>
          <span>{episode.releaseDate}</span>
          <span>{formatDownloads(episode.downloads)} plays</span>
        </div>
      </div>
    </div>
  )
}

/**
 * Review card component
 */
function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="border-b border-gray-100 last:border-0 py-3">
      <div className="flex items-center justify-between mb-1">
        <span className="font-medium text-gray-900">{review.author}</span>
        <span className="text-xs text-gray-400">{review.date}</span>
      </div>
      <div className="text-yellow-500 text-sm mb-2">
        {'★'.repeat(review.rating)}
        <span className="text-gray-300">{'★'.repeat(5 - review.rating)}</span>
      </div>
      <p className="text-sm text-gray-600">{review.content}</p>
    </div>
  )
}

/**
 * Podcast detail view
 */
function PodcastDetail({
  podcast,
  onBack,
  onSelectEpisode,
}: {
  podcast: Podcast
  onBack: () => void
  onSelectEpisode: (ep: Episode) => void
}) {
  const [activeTab, setActiveTab] = useState<'episodes' | 'reviews'>('episodes')

  return (
    <div>
      <Button
        variant="link"
        size="sm"
        textColor="#7C3AED"
        onClick={onBack}
        className="mb-4"
      >
        Back to Browse
      </Button>

      {/* Header */}
      <div className="flex gap-6 mb-6">
        <div
          className="w-32 h-32 rounded-xl flex items-center justify-center text-6xl flex-shrink-0"
          style={{ backgroundColor: `${CATEGORIES[podcast.category].color}15` }}
        >
          {podcast.coverEmoji}
        </div>
        <div className="flex-1">
          <CategoryBadge category={podcast.category} />
          <h1 className="text-2xl font-bold text-gray-900 mt-2">{podcast.title}</h1>
          <p className="text-gray-600">{podcast.host}</p>
          <div className="flex items-center gap-4 mt-2">
            <StarRating rating={podcast.rating} />
            <span className="text-sm text-gray-500">
              {podcast.reviewCount} reviews
            </span>
            <span className="text-sm text-gray-500">
              {formatDownloads(podcast.totalDownloads)} downloads
            </span>
          </div>
          <p className="text-sm text-gray-600 italic mt-2">"{podcast.tagline}"</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mb-6">
        <Button
          variant="primary"
          size="md"
          backgroundColor="#7C3AED"
          textColor="#ffffff"
          className="flex items-center gap-2"
        >
          <span>▶</span> Latest Episode
        </Button>
        <Button
          variant="outline"
          size="md"
          borderColor="#7C3AED"
          textColor="#7C3AED"
        >
          + Subscribe
        </Button>
        <Button
          variant="outline"
          size="md"
          borderColor="#E5E7EB"
          textColor="#6B7280"
        >
          Share
        </Button>
      </div>

      {/* Description */}
      <StyledCard
        variant="default"
        padding="md"
        borderRadius="lg"
        shadow="none"
        className="mb-6"
        bgColor="#F9FAFB"
        borderColor="#E5E7EB"
        textColor="#374151"
      >
        <h3 className="font-bold text-gray-900 mb-2">About</h3>
        <p className="text-sm">{podcast.description}</p>
        <div className="mt-3 pt-3 border-t border-gray-200">
          <h4 className="font-medium text-gray-900 text-sm mb-1">Host</h4>
          <p className="text-sm text-gray-600">{podcast.hostBio}</p>
        </div>
      </StyledCard>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-4">
        <button
          onClick={() => setActiveTab('episodes')}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'episodes'
              ? 'text-purple-600 border-b-2 border-purple-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Episodes ({podcast.episodes.length})
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'reviews'
              ? 'text-purple-600 border-b-2 border-purple-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Reviews ({podcast.reviews.length})
        </button>
      </div>

      {/* Content */}
      {activeTab === 'episodes' ? (
        <StyledCard
          variant="default"
          padding="none"
          borderRadius="lg"
          shadow="sm"
          bgColor="#ffffff"
          borderColor="#E5E7EB"
          textColor="#111827"
        >
          {podcast.episodes.map((ep) => (
            <EpisodeItem key={ep.id} episode={ep} onSelect={() => onSelectEpisode(ep)} />
          ))}
        </StyledCard>
      ) : (
        <div className="space-y-2">
          {podcast.reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * Episode detail view
 */
function EpisodeDetail({
  podcast,
  episode,
  onBack,
}: {
  podcast: Podcast
  episode: Episode
  onBack: () => void
}) {
  return (
    <div>
      <Button
        variant="link"
        size="sm"
        textColor="#7C3AED"
        onClick={onBack}
        className="mb-4"
      >
        Back to {podcast.title}
      </Button>

      <StyledCard
        variant="default"
        padding="lg"
        borderRadius="lg"
        shadow="md"
        bgColor="#ffffff"
        borderColor="#E5E7EB"
        textColor="#111827"
      >
        {/* Episode Header */}
        <div className="flex gap-4 mb-6">
          <div
            className="w-24 h-24 rounded-lg flex items-center justify-center text-4xl flex-shrink-0"
            style={{ backgroundColor: `${CATEGORIES[podcast.category].color}15` }}
          >
            {podcast.coverEmoji}
          </div>
          <div className="flex-1">
            <span className="text-xs text-gray-500">
              {podcast.title} - Episode {episode.number}
            </span>
            <h1 className="text-xl font-bold text-gray-900 mt-1">{episode.title}</h1>
            <div className="flex items-center gap-3 text-sm text-gray-500 mt-2">
              <span>{episode.duration}</span>
              <span>{episode.releaseDate}</span>
              <span>{formatDownloads(episode.downloads)} plays</span>
            </div>
          </div>
        </div>

        {/* Player Mock */}
        <div className="bg-gray-100 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-4">
            <button className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center hover:bg-purple-700">
              <span className="text-white text-lg">▶</span>
            </button>
            <div className="flex-1">
              <div className="h-2 bg-gray-200 rounded-full">
                <div className="h-2 bg-purple-600 rounded-full w-0"></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0:00</span>
                <span>{episode.duration}</span>
              </div>
            </div>
          </div>
          <div className="flex justify-center gap-4 mt-3">
            <button className="text-gray-500 text-sm hover:text-gray-700">⏪ 15s</button>
            <button className="text-gray-500 text-sm hover:text-gray-700">1x Speed</button>
            <button className="text-gray-500 text-sm hover:text-gray-700">15s ⏩</button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-6">
          <Button
            variant="outline"
            size="sm"
            borderColor="#E5E7EB"
            textColor="#6B7280"
          >
            Download
          </Button>
          <Button
            variant="outline"
            size="sm"
            borderColor="#E5E7EB"
            textColor="#6B7280"
          >
            Share
          </Button>
          {episode.hasTranscript && (
            <Button
              variant="outline"
              size="sm"
              borderColor="#E5E7EB"
              textColor="#6B7280"
            >
              View Transcript
            </Button>
          )}
        </div>

        {/* Description */}
        <div>
          <h3 className="font-bold text-gray-900 mb-2">Episode Description</h3>
          <p className="text-gray-600">{episode.description}</p>
        </div>
      </StyledCard>
    </div>
  )
}

/**
 * Top Charts sidebar
 */
function TopCharts({ onSelectPodcast }: { onSelectPodcast: (p: Podcast) => void }) {
  const topPodcasts = [...PODCASTS]
    .sort((a, b) => b.totalDownloads - a.totalDownloads)
    .slice(0, 5)

  return (
    <StyledCard
      variant="default"
      padding="md"
      borderRadius="lg"
      shadow="md"
      bgColor="#ffffff"
      borderColor="#E5E7EB"
      textColor="#111827"
    >
      <h3 className="font-bold text-gray-900 mb-3">Top Charts</h3>
      <div className="space-y-3">
        {topPodcasts.map((podcast, index) => (
          <div
            key={podcast.id}
            onClick={() => onSelectPodcast(podcast)}
            className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 -mx-2 rounded"
          >
            <span className="text-lg font-bold text-gray-300 w-6">{index + 1}</span>
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
              style={{ backgroundColor: `${CATEGORIES[podcast.category].color}15` }}
            >
              {podcast.coverEmoji}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 text-sm truncate">{podcast.title}</p>
              <p className="text-xs text-gray-500 truncate">{podcast.host}</p>
            </div>
          </div>
        ))}
      </div>
    </StyledCard>
  )
}

/**
 * Category filter buttons
 */
function CategoryFilter({
  activeCategory,
  onSelect,
}: {
  activeCategory: string | null
  onSelect: (cat: string | null) => void
}) {
  return (
    <div className="flex gap-2 flex-wrap mb-6">
      <button
        onClick={() => onSelect(null)}
        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
          activeCategory === null
            ? 'bg-purple-600 text-white'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        All
      </button>
      {Object.entries(CATEGORIES).map(([key, cat]) => (
        <button
          key={key}
          onClick={() => onSelect(key)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            activeCategory === key
              ? 'text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          style={activeCategory === key ? { backgroundColor: cat.color } : {}}
        >
          {cat.icon} {cat.name}
        </button>
      ))}
    </div>
  )
}

// ============================================================================
// Main Site Component
// ============================================================================

export function KernelPodsSite({ path, onPathChange }: SiteProps) {
  const [selectedPodcast, setSelectedPodcast] = useState<Podcast | null>(null)
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  // Filter podcasts by category
  const filteredPodcasts = activeCategory
    ? PODCASTS.filter((p) => p.category === activeCategory)
    : PODCASTS

  // Handle navigation
  const handleSelectPodcast = (podcast: Podcast) => {
    setSelectedPodcast(podcast)
    setSelectedEpisode(null)
    onPathChange?.(`/show/${podcast.id}`)
  }

  const handleSelectEpisode = (episode: Episode) => {
    setSelectedEpisode(episode)
    onPathChange?.(`/show/${selectedPodcast?.id}/episode/${episode.id}`)
  }

  const handleBack = () => {
    if (selectedEpisode) {
      setSelectedEpisode(null)
      onPathChange?.(`/show/${selectedPodcast?.id}`)
    } else {
      setSelectedPodcast(null)
      onPathChange?.(null)
    }
  }

  return (
    <div className="min-h-full" style={{ background: '#F9FAFB' }}>
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-700 to-purple-900 text-white py-6 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-4xl">🌽</span>
              <div>
                <h1 className="text-2xl font-bold">KernelPods</h1>
                <p className="text-purple-200 text-sm">Where every story has a kernel of truth</p>
              </div>
            </div>
            <nav className="hidden md:flex gap-4 text-sm">
              <button
                onClick={() => { setSelectedPodcast(null); setSelectedEpisode(null); }}
                className="text-purple-200 hover:text-white"
              >
                Browse
              </button>
              <button className="text-purple-200 hover:text-white">Library</button>
              <button className="text-purple-200 hover:text-white">Search</button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Main Column */}
          <div className="flex-1">
            {selectedEpisode && selectedPodcast ? (
              <EpisodeDetail
                podcast={selectedPodcast}
                episode={selectedEpisode}
                onBack={handleBack}
              />
            ) : selectedPodcast ? (
              <PodcastDetail
                podcast={selectedPodcast}
                onBack={handleBack}
                onSelectEpisode={handleSelectEpisode}
              />
            ) : (
              <>
                {/* Featured Banner */}
                <StyledCard
                  variant="default"
                  padding="lg"
                  borderRadius="lg"
                  shadow="md"
                  className="mb-6"
                  bgColor="linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)"
                  borderColor="transparent"
                  textColor="#ffffff"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-6xl">🎧</span>
                    <div>
                      <p className="text-purple-200 text-sm">Featured This Week</p>
                      <h2 className="text-xl font-bold">The 13th Floor: New Episode Out Now</h2>
                      <p className="text-purple-200 text-sm mt-1">
                        "The Hartwell Disappearances" - 847K downloads and counting
                      </p>
                      <Button
                        variant="primary"
                        size="sm"
                        backgroundColor="#ffffff"
                        textColor="#7C3AED"
                        className="mt-3"
                        onClick={() => handleSelectPodcast(PODCASTS[0])}
                      >
                        Listen Now
                      </Button>
                    </div>
                  </div>
                </StyledCard>

                {/* Category Filter */}
                <CategoryFilter
                  activeCategory={activeCategory}
                  onSelect={setActiveCategory}
                />

                {/* Podcast Grid */}
                <div className="space-y-4">
                  {filteredPodcasts.map((podcast) => (
                    <PodcastCard
                      key={podcast.id}
                      podcast={podcast}
                      onSelect={() => handleSelectPodcast(podcast)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Sidebar */}
          <aside className="w-72 hidden lg:block space-y-4">
            <TopCharts onSelectPodcast={handleSelectPodcast} />

            {/* Ad Card */}
            <StyledCard
              variant="default"
              padding="md"
              borderRadius="lg"
              shadow="md"
              bgColor="#FEF3C7"
              borderColor="#F59E0B"
              textColor="#78350F"
            >
              <p className="text-xs text-amber-600 mb-1">SPONSORED</p>
              <p className="font-bold text-amber-800">Quantum Coffee Co.</p>
              <p className="text-sm text-amber-700 mt-1">
                "The only coffee where observation matters."
              </p>
              <p className="text-xs text-amber-600 mt-2">$47/cup | Worth every penny - Derek</p>
            </StyledCard>

            {/* Network Notice */}
            <StyledCard
              variant="default"
              padding="md"
              borderRadius="lg"
              shadow="md"
              bgColor="#F3F4F6"
              borderColor="#E5E7EB"
              textColor="#374151"
            >
              <h3 className="font-bold text-gray-900 mb-2">KernelPods Network</h3>
              <p className="text-xs text-gray-600">
                KernelPods is a division of the .corn domain ecosystem. All podcasts
                are independently produced. Omnicorp Holdings has no editorial control
                over content. We are required to state this.
              </p>
              <p className="text-xs text-gray-400 mt-2 italic">
                "The corn connects us all."
              </p>
            </StyledCard>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-6 px-4 mt-8">
        <div className="max-w-5xl mx-auto text-center text-sm">
          <p className="font-bold text-white mb-2">KernelPods</p>
          <p>www.kernelpods.corn</p>
          <p className="mt-2">
            Podcasts for the corn-curious. News for the corn-convinced.
          </p>
          <div className="flex justify-center gap-4 mt-4 text-xs">
            <span>Terms of Service</span>
            <span>Privacy Policy</span>
            <span>Content Guidelines</span>
            <span>Advertise</span>
          </div>
          <p className="mt-4 text-xs text-gray-500">
            Not affiliated with Big Corn. We think.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default KernelPodsSite
