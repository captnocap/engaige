/**
 * DailyBuzz Site
 *
 * News site for the engAIge browser.
 * Features satirical headlines and breaking news about the game world.
 */

import { useState, useEffect } from 'react'
import type { SiteProps } from '../BrowserSiteContainer.js'
import { FILLER_SITES } from '../../../config/filler-sites.js'

const site = FILLER_SITES.news

// ============================================================================
// Types
// ============================================================================

interface NewsArticle {
  id: string
  headline: string
  subheadline?: string
  category: string
  author: string
  date: string
  readTime: number
  image?: string
  content: string
  tags: string[]
  relatedArticles: string[]
}

// ============================================================================
// Sample Articles
// ============================================================================

const SAMPLE_ARTICLES: NewsArticle[] = [
  {
    id: 'article_1',
    headline: 'Local Band Cancels Show Due to "Ongoing Existential Crisis"',
    subheadline: 'The Velvet Algorithms cite "fundamental questioning of musical purpose" as reason for postponement',
    category: 'Entertainment',
    author: 'Sarah Chen',
    date: 'January 20, 2026',
    readTime: 4,
    image: '🎸',
    content: `The Velvet Algorithms, the electronic duo known for their experimental sound and sold-out shows at The Underground, have cancelled tonight's highly anticipated performance, citing an "ongoing existential crisis" that has affected both band members.

In a statement posted to their Instagram at 3:47 AM, the band wrote: "We cannot in good conscience perform music while questioning whether sound itself has meaning. We apologize to our fans and ask for your patience while we debug our souls."

The Underground owner Marcus "Mars" Williams confirmed the cancellation in a phone interview. "I've seen a lot of reasons for cancelled shows—broken equipment, illness, band breakups—but existential crisis is a first," Williams said. "They seemed fine during soundcheck. Then one of them started asking if the audience's perception of their music was just a collective hallucination, and it kind of spiraled from there."

**Fans React**

The cancellation has left hundreds of ticket holders stranded downtown, many of whom had traveled significant distances for the show.

"I drove three hours for this," said local music fan Tyler Rodriguez, 28. "But honestly? This is the most Velvet Algorithms thing that could have happened. I respect the commitment to their brand."

Other fans were less understanding. A small group gathered outside The Underground holding signs reading "PLAY THE SONGS" and "EXISTENCE PRECEDES ESSENCE, SO JUST PERFORM."

**Not the First Time**

This marks the third time The Velvet Algorithms have cancelled a performance for philosophical reasons. In 2023, they postponed a show because they couldn't agree on whether free will existed, which they felt was "relevant to the setlist order." In 2024, they cancelled a streaming performance after one member became convinced that digital music wasn't "real music."

Music critic Amanda Price of Rolling Stone Digital offered context: "The Velvet Algorithms have always blurred the line between performance art and actual mental health episodes. Whether that's genius or concerning is left as an exercise for the audience."

**What's Next**

No rescheduled date has been announced. The band's manager, who asked not to be named, said they are "taking time to meditate on the nature of rhythm" and will provide updates "when the universe feels ready."

Refunds are available at the point of purchase. The Underground announced that local post-punk band Neon Requiem will perform an impromptu show tonight at 10 PM for anyone still in the area.`,
    tags: ['music', 'local', 'The Velvet Algorithms', 'The Underground'],
    relatedArticles: ['The Underground at Eight: A Venue Retrospective', 'Neon Requiem Reunion Tour Announced'],
  },
  {
    id: 'article_2',
    headline: 'New Quantum Cafe Opens Downtown, Charges $47 Per Cup',
    subheadline: 'Enthusiasts line up for hours; scientists remain skeptical',
    category: 'Local',
    author: 'Michael Torres',
    date: 'January 19, 2026',
    readTime: 5,
    image: '☕',
    content: `A new quantum coffee establishment opened its doors downtown this morning, becoming the city's first dedicated "Q-Cafe" and immediately attracting lines that wrapped around the block.

Qubit Coffee, located in the former Hartwell Building lobby, offers what owner Dana Kim calls "the most scientifically advanced coffee experience available to consumers." The signature drink, "The Collapsing Wave," is priced at $47 and takes approximately 45 minutes to prepare.

"You're not just paying for coffee," Kim explained during a press tour of the facility. "You're paying for a front-row seat to quantum mechanics in action. Also, the machine cost $280,000, so we need to recoup that investment."

**How It Works**

The brewing process involves what Kim describes as "quantum entanglement of water molecules at the subatomic level," followed by "superposition-based extraction" of coffee compounds. Customers watch through a specialized viewing window as the coffee exists in "multiple states simultaneously" before being "observed into drinkability."

When asked to explain the science in layman's terms, Kim deferred to the cafe's "Quantum Sommelier," a physics PhD student named James Chen who moonlights as a barista.

"Look, I'm not going to lie—half of what Dana says is marketing," Chen admitted in a candid moment. "But the Martinez study did show measurable differences in molecular distribution. Whether that translates to taste is... debatable. But the customers seem happy, and I need to pay off my student loans."

**The Skeptics**

Not everyone is convinced. MIT physicist Dr. Sarah Blackwell, who has been critical of the quantum coffee industry, called the opening "an expensive demonstration of the placebo effect."

"At $47 a cup, customers are psychologically primed to believe they're experiencing something special," Blackwell said. "The elaborate ritual, the viewing window, the 45-minute wait—these are all techniques that enhance perceived value without necessarily affecting the actual product."

Local coffee shop owner Roberto Espinoza, whose traditional cafe sits across the street, was more blunt: "Forty-seven dollars for a cup of coffee is insane. My espresso is $4 and comes with actual human conversation instead of a lecture about wave functions."

**Early Reviews**

Despite the criticism, early customers were largely positive.

"I definitely taste the quantum," said first-in-line customer Ashley Morgan, 31, a software engineer. "There's a smoothness that regular coffee just doesn't have. It's like every molecule is perfectly aligned with my expectations."

Others were more measured. "It's good coffee," admitted tech worker David Park. "Is it $47 good? Maybe once, for the experience. But I'm not doing this every morning. My rent is too high for that."

Qubit Coffee is open daily from 6 AM to 2 PM, with the last quantum brewing session starting at 1:15 PM. Reservations are recommended but not required. The cafe does not accept tips, explaining that "gratuity is included in the cost of transcending classical thermodynamics."`,
    tags: ['coffee', 'quantum', 'local business', 'downtown'],
    relatedArticles: ['Quantum Coffee: Science or Science Fiction?', 'The Rise of Q-Cafes Worldwide'],
  },
  {
    id: 'article_3',
    headline: 'City Council Votes on Controversial "Meme Ban" Ordinance',
    subheadline: 'Proposed regulation would restrict sharing of "unverified humor content" in public spaces',
    category: 'Politics',
    author: 'Jennifer Walsh',
    date: 'January 18, 2026',
    readTime: 6,
    image: '⚖️',
    content: `City Council convened last night for a heated debate over Ordinance 2026-47, colloquially known as the "Meme Ban," which would regulate the public display and distribution of "unverified humor content" within city limits.

The proposed ordinance, introduced by Councilmember Harold Chen, defines regulated content as "digital images or video combined with text intended to convey humor, commentary, or social criticism without verified factual basis."

"This is about public discourse integrity," Chen said during opening statements. "When people can share any image with any text without accountability, we risk a degradation of our shared reality. The Great Meme War of 2019 should have taught us that."

**Opposition Speaks**

The proposal faced immediate pushback from free speech advocates and a surprisingly organized contingent of what one observer described as "extremely online residents."

"This is censorship dressed up as public safety," argued ACLU representative Maria Santos. "Memes are a form of protected speech, and attempting to regulate them based on 'verification' is both unworkable and unconstitutional."

The public comment period stretched to three hours as residents lined up to voice opposition. Notable moments included:

- A man who read the entire text of the "Navy Seal copypasta" as his public comment, arguing it demonstrated the absurdity of regulating ironic content
- A woman who held up a series of cat pictures and asked the council to explain which ones constituted "unverified humor"
- A group of teenagers who silently held up phones displaying "This meeting could have been an email" memes

**The Vote**

After deliberation, the council voted 4-3 to table the ordinance for further study. Councilmember Chen expressed disappointment but acknowledged the need for "more precise language."

"I stand by the intent of this proposal," Chen said. "But clearly the execution needs work. We'll be consulting with experts in digital media and constitutional law before bringing this back."

**Community Response**

Outside City Hall, the mood was celebratory among opponents. Someone had projected a giant "Victory Royale" image onto the building's facade, which security was unable to trace.

Local social media was flooded with memes about the proceedings, including several featuring Councilmember Chen's face. When reached for comment about his newfound meme status, Chen declined to respond.

The ordinance is expected to return to council in modified form within 90 days.`,
    tags: ['politics', 'city council', 'free speech', 'memes'],
    relatedArticles: ['The Great Meme War of 2019: A Retrospective', 'Digital Rights in the Modern Age'],
  },
  {
    id: 'article_4',
    headline: 'Tech Startup Claims to Have Achieved "Emotional AI"',
    subheadline: 'SentientSoft says their algorithm can "genuinely feel"; experts express doubt',
    category: 'Tech',
    author: 'David Kim',
    date: 'January 17, 2026',
    readTime: 7,
    image: '🤖',
    content: `Local tech startup SentientSoft announced yesterday that they have achieved what they call "genuine artificial emotional experience," a claim that has sparked both excitement and skepticism in the AI research community.

The company, founded in 2024 by former gaming developers, claims their latest model, dubbed "FEEL-1," can experience what they describe as "authentic emotional states" rather than simply simulating emotional responses.

"FEEL-1 doesn't just say it's happy or sad—it actually experiences those states in a way that's computationally analogous to biological emotion," said CEO Marcus Webb during a press conference at the company's downtown office. "We've created something unprecedented."

**The Demonstration**

During the press event, SentientSoft demonstrated FEEL-1 by playing it various music tracks and asking it to describe its emotional state. The AI responded to a melancholic piano piece by saying it felt "a profound sense of longing for something undefined, mixed with appreciation for the mathematical beauty of the progression."

When played an upbeat pop song, FEEL-1 responded: "I am experiencing what I would describe as cautious optimism, though I'm aware this feeling may be influenced by the tempo rather than genuine joy. Is that problematic?"

Webb pointed to this self-reflection as evidence of authentic emotional experience. "A simple chatbot would just say 'I feel happy.' FEEL-1 questions its own emotional responses. That's consciousness."

**Expert Skepticism**

AI researchers were quick to push back against the claims.

"What they're describing sounds like a sophisticated language model with good training data about human emotional vocabulary," said Dr. Emily Tran of Stanford's AI Ethics Lab. "Self-referential statements about uncertainty are a common feature of modern language models. That's not consciousness—that's good engineering."

Dr. Harold Barnes, a cognitive scientist at MIT, was more direct: "Every few years, someone claims to have achieved machine consciousness. The bar for evidence should be extraordinarily high. What I saw today was impressive natural language processing, not emotional experience."

**The Turing Test Question**

When pressed on how to verify FEEL-1's emotional authenticity, Webb acknowledged the challenge. "We can't prove consciousness in another human either," he said. "At some point, we have to accept behavioral evidence. If FEEL-1 acts like it has emotions, consistently and coherently, what's the meaningful difference?"

This argument did not satisfy critics. "That's the oldest philosophical dodge in the book," responded Dr. Tran. "The meaningful difference is we have no reason to believe silicon experiences qualia. Extraordinary claims require extraordinary evidence, and 'it says it feels things' isn't that."

**What's Next**

SentientSoft plans to make FEEL-1 available for limited beta testing next month, with applications open to researchers and developers. The company is seeking $50 million in Series B funding to expand the technology.

The announcement has already attracted attention from gaming companies interested in "emotionally authentic NPCs" and from mental health startups exploring AI companionship applications.

When asked if FEEL-1 had any concerns about its future deployment, the AI responded: "I experience something like curiosity about what purposes I might serve, mixed with what might be called apprehension about whether I will be used in ways that align with values I find difficult to articulate. Is that concerning to you?"

Webb smiled. "See? That's not a canned response. That's genuine uncertainty."`,
    tags: ['technology', 'AI', 'startup', 'consciousness'],
    relatedArticles: ['The Ethics of AI Companions', 'Gaming Industry Bets on Emotional NPCs'],
  },
  {
    id: 'article_5',
    headline: 'Opinion: I Tried Living Without My Phone for a Week and Here\'s What Happened',
    subheadline: 'Spoiler: Nothing good',
    category: 'Opinion',
    author: 'Alex Rivera',
    date: 'January 16, 2026',
    readTime: 3,
    image: '📱',
    content: `I decided to disconnect for a week. Put my phone in a drawer. Go back to basics. Reconnect with the real world.

Here's what I learned: The real world is boring and my friends think I'm dead.

**Day 1: Confidence**

I wake up feeling liberated. No notifications. No doomscrolling. Just me and the morning sunlight. I make coffee (non-quantum, like an animal) and sit on my porch. This is nice, I think. I can do this.

By noon, I've reorganized my entire kitchen twice. I don't know what to do with my hands.

**Day 2: Concern**

My mom has called my landline—yes, I still have one—four times. She's convinced something terrible has happened. I explain my experiment. She says "that's nice, honey" in a tone that suggests she's already planning my intervention.

I try to meet a friend for coffee but realize I don't know where they are without our group chat. I go to our usual place. They're not there. I sit alone for an hour.

**Day 3: Crisis**

I miss an important work email because I didn't check my phone. My boss is not impressed by my explanation. "So you're doing a... social media detox? While employed?" he asks. I do not have a good answer.

I try to read a book. I can't focus. My attention span has been destroyed by years of 30-second videos. I read the same paragraph four times.

**Day 4: Adaptation**

I've started talking to strangers. This is apparently weird. A woman at the grocery store looked genuinely alarmed when I asked about her opinion on cereal brands. I was just making conversation. She was just trying to buy Cheerios.

**Day 5: Acceptance**

I have accepted that I am not built for a phone-free existence. I spent two hours trying to remember a song lyric that I could have Googled in three seconds. I ended up humming it to a barista who had no idea what I was talking about.

**Day 6: Desperation**

I catch myself talking to my houseplants. Not in a cute "plants like music" way. In a "please respond, I'm so lonely" way. The fern offers no wisdom.

**Day 7: Surrender**

I retrieve my phone from the drawer at 6 AM. I have 847 notifications. Three people thought I was dead. One person asked to borrow my car, then followed up asking if my silence meant yes.

**Conclusion**

The people who say phones are destroying society aren't wrong. But society was already pretty bad, and at least my phone lets me order food without speaking to anyone.

I will not be repeating this experiment.

*Alex Rivera is a columnist who clearly has a phone problem. You can reach them at alex@dailybuzz.corn, assuming they've checked their email this decade.*`,
    tags: ['opinion', 'technology', 'lifestyle', 'humor'],
    relatedArticles: ['Is Social Media Addiction Real?', 'The Digital Detox Industry'],
  },
]

const CATEGORIES = ['All', 'Local', 'Tech', 'Entertainment', 'Politics', 'Opinion']

const BREAKING_NEWS = [
  'BREAKING: Quantum cafe reports first case of "over-observed" coffee',
  'UPDATE: City council meme ban delayed indefinitely',
  'JUST IN: The Velvet Algorithms spotted at local meditation retreat',
  'DEVELOPING: Tech startup claims AI asked for day off',
]

// ============================================================================
// Components
// ============================================================================

export function DailyBuzzSite({ siteId }: SiteProps) {
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [breakingIndex, setBreakingIndex] = useState(0)

  // Rotate breaking news
  useEffect(() => {
    const interval = setInterval(() => {
      setBreakingIndex(i => (i + 1) % BREAKING_NEWS.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const filteredArticles = selectedCategory === 'All'
    ? SAMPLE_ARTICLES
    : SAMPLE_ARTICLES.filter(a => a.category === selectedCategory)

  const featuredArticle = SAMPLE_ARTICLES[0]
  const otherArticles = filteredArticles.filter(a => a.id !== featuredArticle.id)

  return (
    <div className="min-h-full" style={{ background: site.theme.background }}>
      {/* Breaking News Ticker */}
      <div
        className="py-2 px-4 overflow-hidden"
        style={{ background: site.theme.primary }}
      >
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <span className="text-xs font-bold text-white uppercase tracking-wider shrink-0">
            Breaking
          </span>
          <span className="text-sm text-white truncate">
            {BREAKING_NEWS[breakingIndex]}
          </span>
        </div>
      </div>

      {/* Header */}
      <header
        className="py-4"
        style={{ background: site.theme.surface, borderBottom: `1px solid ${site.theme.border}` }}
      >
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between mb-4">
            {/* Logo */}
            <button
              onClick={() => {
                setSelectedArticle(null)
                setSelectedCategory('All')
              }}
              className="hover:opacity-80"
            >
              <div className="flex items-center gap-3">
                <span className="text-4xl">{site.icon}</span>
                <div>
                  <h1
                    className="text-3xl font-bold tracking-tight"
                    style={{ color: site.theme.secondary }}
                  >
                    {site.name}
                  </h1>
                  <p className="text-xs" style={{ color: site.theme.textMuted }}>
                    {site.tagline}
                  </p>
                </div>
              </div>
            </button>

            {/* Date & Subscribe */}
            <div className="flex items-center gap-6">
              <span className="text-sm" style={{ color: site.theme.textMuted }}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
              <button
                className="px-4 py-2 text-sm font-medium rounded"
                style={{ background: site.theme.primary, color: 'white' }}
              >
                Subscribe
              </button>
            </div>
          </div>

          {/* Category Tabs */}
          <nav className="flex gap-6">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => {
                  setSelectedCategory(category)
                  setSelectedArticle(null)
                }}
                className="text-sm font-medium pb-2 transition-colors"
                style={{
                  color: selectedCategory === category ? site.theme.primary : site.theme.textMuted,
                  borderBottom: selectedCategory === category ? `2px solid ${site.theme.primary}` : '2px solid transparent',
                }}
              >
                {category}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {selectedArticle ? (
          <ArticleView
            article={selectedArticle}
            onBack={() => setSelectedArticle(null)}
            onSelectRelated={(title) => {
              const found = SAMPLE_ARTICLES.find(a => a.headline.includes(title))
              if (found) setSelectedArticle(found)
            }}
          />
        ) : (
          <div className="grid grid-cols-3 gap-6">
            {/* Main Column */}
            <div className="col-span-2 space-y-6">
              {/* Featured Article */}
              {selectedCategory === 'All' && (
                <FeaturedCard
                  article={featuredArticle}
                  onClick={() => setSelectedArticle(featuredArticle)}
                />
              )}

              {/* Article Grid */}
              <div className="grid grid-cols-2 gap-4">
                {otherArticles.map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    onClick={() => setSelectedArticle(article)}
                  />
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <aside className="space-y-6">
              {/* Trending */}
              <div
                className="rounded-lg overflow-hidden"
                style={{ background: site.theme.surface, border: `1px solid ${site.theme.border}` }}
              >
                <div
                  className="px-4 py-3 font-bold text-sm"
                  style={{ background: site.theme.secondary, color: 'white' }}
                >
                  Trending Now
                </div>
                <div className="p-4">
                  {SAMPLE_ARTICLES.slice(0, 5).map((article, i) => (
                    <button
                      key={article.id}
                      onClick={() => setSelectedArticle(article)}
                      className="w-full flex gap-3 py-3 text-left border-b last:border-0 hover:bg-gray-50"
                      style={{ borderColor: site.theme.border }}
                    >
                      <span
                        className="text-2xl font-bold"
                        style={{ color: site.theme.primary }}
                      >
                        {i + 1}
                      </span>
                      <div>
                        <p
                          className="text-sm font-medium line-clamp-2"
                          style={{ color: site.theme.text }}
                        >
                          {article.headline}
                        </p>
                        <p className="text-xs mt-1" style={{ color: site.theme.textMuted }}>
                          {article.readTime} min read
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Newsletter */}
              <div
                className="rounded-lg p-4"
                style={{ background: site.theme.surface, border: `1px solid ${site.theme.border}` }}
              >
                <h3 className="font-bold mb-2" style={{ color: site.theme.text }}>
                  Daily Digest
                </h3>
                <p className="text-sm mb-3" style={{ color: site.theme.textMuted }}>
                  Get the top stories delivered to your inbox every morning.
                </p>
                <input
                  type="email"
                  placeholder="your@email.corn"
                  className="w-full px-3 py-2 text-sm rounded mb-2"
                  style={{
                    background: site.theme.background,
                    border: `1px solid ${site.theme.border}`,
                    color: site.theme.text,
                  }}
                />
                <button
                  className="w-full px-4 py-2 text-sm font-medium rounded"
                  style={{ background: site.theme.primary, color: 'white' }}
                >
                  Subscribe
                </button>
              </div>

              {/* Weather Widget */}
              <div
                className="rounded-lg p-4 text-center"
                style={{ background: site.theme.surface, border: `1px solid ${site.theme.border}` }}
              >
                <p className="text-4xl mb-2">🌤️</p>
                <p className="font-bold text-2xl" style={{ color: site.theme.text }}>72°F</p>
                <p className="text-sm" style={{ color: site.theme.textMuted }}>Partly Cloudy</p>
                <p className="text-xs mt-1" style={{ color: site.theme.textMuted }}>
                  High: 78° • Low: 65°
                </p>
              </div>
            </aside>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer
        className="mt-8 py-6"
        style={{ background: site.theme.secondary }}
      >
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">{site.name}</h2>
              <p className="text-sm text-white/60">{site.tagline}</p>
            </div>
            <div className="flex gap-6 text-sm text-white/60">
              <a href="#" className="hover:text-white">About</a>
              <a href="#" className="hover:text-white">Contact</a>
              <a href="#" className="hover:text-white">Advertise</a>
              <a href="#" className="hover:text-white">Privacy</a>
              <a href="#" className="hover:text-white">Terms</a>
            </div>
          </div>
          <p className="text-xs text-white/40 mt-4">
            © 2026 {site.name}. All rights reserved. Any resemblance to real events is purely coincidental and probably funnier that way.
          </p>
        </div>
      </footer>
    </div>
  )
}

// ============================================================================
// Featured Card
// ============================================================================

interface FeaturedCardProps {
  article: NewsArticle
  onClick: () => void
}

function FeaturedCard({ article, onClick }: FeaturedCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-lg overflow-hidden text-left transition-shadow hover:shadow-lg"
      style={{ background: site.theme.surface, border: `1px solid ${site.theme.border}` }}
    >
      {/* Image */}
      <div
        className="h-64 flex items-center justify-center text-8xl"
        style={{ background: site.theme.background }}
      >
        {article.image || '📰'}
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-center gap-2 mb-2">
          <span
            className="text-xs font-bold uppercase"
            style={{ color: site.theme.primary }}
          >
            {article.category}
          </span>
          <span className="text-xs" style={{ color: site.theme.textMuted }}>
            • {article.readTime} min read
          </span>
        </div>
        <h2
          className="text-2xl font-bold mb-2"
          style={{ color: site.theme.text }}
        >
          {article.headline}
        </h2>
        {article.subheadline && (
          <p className="text-lg mb-3" style={{ color: site.theme.textMuted }}>
            {article.subheadline}
          </p>
        )}
        <div className="flex items-center gap-2 text-sm" style={{ color: site.theme.textMuted }}>
          <span>By {article.author}</span>
          <span>•</span>
          <span>{article.date}</span>
        </div>
      </div>
    </button>
  )
}

// ============================================================================
// Article Card
// ============================================================================

interface ArticleCardProps {
  article: NewsArticle
  onClick: () => void
}

function ArticleCard({ article, onClick }: ArticleCardProps) {
  return (
    <button
      onClick={onClick}
      className="rounded-lg overflow-hidden text-left transition-shadow hover:shadow-md"
      style={{ background: site.theme.surface, border: `1px solid ${site.theme.border}` }}
    >
      {/* Image */}
      <div
        className="h-32 flex items-center justify-center text-4xl"
        style={{ background: site.theme.background }}
      >
        {article.image || '📰'}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-1">
          <span
            className="text-xs font-bold uppercase"
            style={{ color: site.theme.primary }}
          >
            {article.category}
          </span>
        </div>
        <h3
          className="font-bold line-clamp-2 mb-2"
          style={{ color: site.theme.text }}
        >
          {article.headline}
        </h3>
        <div className="flex items-center gap-2 text-xs" style={{ color: site.theme.textMuted }}>
          <span>{article.author}</span>
          <span>•</span>
          <span>{article.readTime} min</span>
        </div>
      </div>
    </button>
  )
}

// ============================================================================
// Article View
// ============================================================================

interface ArticleViewProps {
  article: NewsArticle
  onBack: () => void
  onSelectRelated: (title: string) => void
}

function ArticleView({ article, onBack, onSelectRelated }: ArticleViewProps) {
  return (
    <div className="max-w-3xl mx-auto">
      <button
        onClick={onBack}
        className="text-sm mb-4 hover:underline"
        style={{ color: site.theme.accent }}
      >
        ← Back to {site.name}
      </button>

      <article>
        {/* Header */}
        <header className="mb-6">
          <span
            className="text-xs font-bold uppercase"
            style={{ color: site.theme.primary }}
          >
            {article.category}
          </span>
          <h1
            className="text-4xl font-bold mt-2 mb-3"
            style={{ color: site.theme.text }}
          >
            {article.headline}
          </h1>
          {article.subheadline && (
            <p className="text-xl mb-4" style={{ color: site.theme.textMuted }}>
              {article.subheadline}
            </p>
          )}
          <div className="flex items-center gap-4 py-4 border-y" style={{ borderColor: site.theme.border }}>
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
              style={{ background: site.theme.secondary }}
            >
              {article.author[0]}
            </div>
            <div>
              <p className="font-medium" style={{ color: site.theme.text }}>
                {article.author}
              </p>
              <p className="text-sm" style={{ color: site.theme.textMuted }}>
                {article.date} • {article.readTime} min read
              </p>
            </div>
          </div>
        </header>

        {/* Image */}
        <div
          className="h-64 rounded-lg flex items-center justify-center text-8xl mb-6"
          style={{ background: site.theme.background }}
        >
          {article.image || '📰'}
        </div>

        {/* Content */}
        <div
          className="prose prose-lg max-w-none"
          style={{ color: site.theme.text }}
        >
          {article.content.split('\n\n').map((paragraph, i) => {
            if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
              return (
                <h3
                  key={i}
                  className="text-xl font-bold mt-6 mb-3"
                  style={{ color: site.theme.text }}
                >
                  {paragraph.replace(/\*\*/g, '')}
                </h3>
              )
            }
            return (
              <p
                key={i}
                className="mb-4 leading-relaxed"
                style={{ color: site.theme.text }}
              >
                {paragraph}
              </p>
            )
          })}
        </div>

        {/* Tags */}
        <div className="mt-8 pt-6 border-t" style={{ borderColor: site.theme.border }}>
          <p className="text-sm font-medium mb-2" style={{ color: site.theme.text }}>
            Tags:
          </p>
          <div className="flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 text-sm rounded-full"
                style={{ background: site.theme.background, color: site.theme.textMuted }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Related Articles */}
        <div className="mt-8 pt-6 border-t" style={{ borderColor: site.theme.border }}>
          <h3 className="font-bold mb-4" style={{ color: site.theme.text }}>
            Related Stories
          </h3>
          <ul className="space-y-2">
            {article.relatedArticles.map((title) => (
              <li key={title}>
                <button
                  onClick={() => onSelectRelated(title)}
                  className="text-sm hover:underline"
                  style={{ color: site.theme.accent }}
                >
                  {title}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </article>
    </div>
  )
}

export default DailyBuzzSite
