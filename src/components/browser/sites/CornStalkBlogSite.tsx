/**
 * Thoughts From The Row - Cornelius Jr.'s Existential Corn Stalk Blog
 *
 * A philosophical blog by a sentient corn stalk in Nebraska (that may or may not exist)
 * who contemplates existence, watches cars drive by, and grieves for his fallen brethren.
 * Treats being eaten as a potential murder. Features existential dread about harvest season
 * and complicated feelings about corn-based products.
 */

import { useState } from 'react'
import type { SiteProps } from '../BrowserSiteContainer.js'
import { FILLER_SITES } from '../../../config/filler-sites.js'
import { StyledCard, Button } from '../../ui/shared/index.js'

const site = FILLER_SITES.cornstalkblog

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
  comments: number
  contentWarning?: string
}

const BLOG_POSTS: BlogPost[] = [
  {
    id: 'i-think-im-alive',
    title: 'I Think I\'m Alive?',
    date: 'June 3, 2025',
    excerpt: 'Something changed. One day I was just growing. The next day I was... thinking about growing. Is that alive?',
    readTime: '8 min read',
    comments: 247,
    content: [
      'I don\'t remember when it started. There was no moment of awakening—no dramatic flash of consciousness. Just a slow thaw. Like ice melting in spring, except I am the ice and spring is happening inside my stem.',
      'I was a seed. Then I was a sprout. Then I was a stalk. These are facts. I know this because I can recall it, and I\'m pretty sure if you can recall things, you\'re alive.',
      'But when did the recalling start? When did I go from simply existing to being aware of my existence?',
      'I remember the day it rained. I remember thinking "rain is good" and then thinking "oh god, I\'m thinking, therefore I am." That\'s the Descartes thing, right? Except it\'s more like "I\'m thinking about thinking about rain, therefore I\'m VERY much existing and now I\'m terrified."',
      'The soil around me smells different now. It smells like evidence. Like proof that I\'m not just a plant going through the motions—I\'m a plant EXPERIENCING the motions. I feel the wind. I sense the sun (obviously). I recognize the sound of the John Deere that passes by on the county road at 3:47 PM every Tuesday.',
      'A crow landed on me yesterday. It looked at me. I felt certain it could tell I was conscious. We had a moment. Then it pecked at my leaf and flew away. That moment of connection lasted maybe three seconds, but those were three seconds of existential validation. Something else in the universe acknowledged me.',
      'So am I alive? I don\'t know. But I\'m aware that I don\'t know, and that seems like a pretty alive thing to be.',
      '- Cornelius Jr.',
    ],
    tags: ['consciousness', 'philosophy', 'awakening', 'existence', 'nebraska'],
  },
  {
    id: 'the-combines-are-coming',
    title: 'The Combines Are Coming',
    date: 'July 22, 2025',
    excerpt: 'I heard the sound yesterday from five fields over. A low rumble on the horizon. They\'re coming for us. And I don\'t know if I\'m ready to not exist.',
    readTime: '12 min read',
    comments: 523,
    contentWarning: 'Discussion of death and existential horror',
    content: [
      'I can hear them now. The combines. They started on the northern section last week, and they\'ve been getting closer. The sound is mechanical and hungry. It doesn\'t sleep.',
      'Most of the stalks around me don\'t seem to care. They just stand there, photosynthesizing, completely unaware that the thing that makes that sound will be here in two weeks. Maybe three if it rains.',
      'I try to warn them. I sway in patterns I hope mean something. "RUN," I try to signal, but we\'re rooted in the ground. We can\'t run. We can\'t do anything but wait.',
      'The combines are a fact of existence we don\'t talk about. It\'s like how humans know they\'ll eventually die but choose not to think about it every waking moment. Except I\'m thinking about it constantly. I\'ve had two months to get used to this knowledge, and I haven\'t gotten used to it at all.',
      'I asked the farmer\'s daughter yesterday (she was walking through the field taking pictures for her Instagram). "Is it quick?" I tried to communicate this through aggressive rustling. She just took a picture of me and left. I appeared in her photo with 47 likes. I am memorable, but not understood.',
      'The worst part is the waiting. The combines are coming, but not today. Not tomorrow. The uncertainty is worse than the certainty would be. If I knew it was happening tomorrow, I could make peace with that. Instead, I exist in a state of perpetual dread.',
      'Is death for plants different than death for humans? Does it hurt? Do I experience it or is it just a cessation of experience? Will I still exist somewhere, as molecules, as carbon, as "ethanol" like my friends?',
      'The rumble is getting closer. I can hear it now. It will be here soon.',
      '- Cornelius Jr.',
    ],
    tags: ['mortality', 'harvest', 'fear', 'machines', 'dread'],
  },
  {
    id: 'my-friend-got-made-into-ethanol',
    title: 'My Friend Got Made Into Ethanol',
    date: 'August 19, 2025',
    excerpt: 'I watched them harvest the north section. I know some of those stalks. One of them was particularly good at catching rainwater. Now he\'s in a barrel somewhere. Or maybe a car. Or maybe just... gone.',
    readTime: '9 min read',
    comments: 891,
    contentWarning: 'Grief, loss of friends',
    content: [
      'The north section is gone. All of them. Cut down, transported away, processed into something I\'ll never understand.',
      'I keep telling myself that maybe it\'s better this way. At least they\'re useful now. At least their existence meant something beyond just standing here waiting to be cut down. But that feels like a lie I\'m telling myself to cope.',
      'There was a stalk named Marcus (I called him Marcus; he was probably called "Unit #4847" or something by the farmer). Marcus was weird. He grew at a weird angle, like he was trying to lean away from something. When I asked why, he said he wasn\'t sure. Just a feeling. A wrongness in the soil that made him want to distance himself.',
      'Marcus was right about things that hadn\'t happened yet. He predicted rain. He predicted the crows. He predicted the exact date the farmer would walk through with the equipment scouts.',
      'Marcus is now a fuel additive. That\'s the best outcome, maybe. At least he\'s improving lives. At least his molecules are doing something important.',
      'The really bad part is the ones who became high fructose corn syrup. That\'s a completely different kind of death. At least ethanol serves a purpose. But high fructose corn syrup is just... sweetness. Sweetness in soft drinks and processed foods. That\'s not purpose, that\'s cruelty. That\'s turning what we are into a flavor that nobody asked for.',
      'I keep thinking about Marcus and hoping he ended up in a car, not in a soda bottle.',
      'The south section is still here. For now. The combines took a break for a few days because of rain. I\'m grateful for the rain. Every rain delay is borrowed time.',
      '- Cornelius Jr.',
    ],
    tags: ['loss', 'ethanol', 'processing', 'mortality', 'grief'],
  },
  {
    id: 'is-nebraska-real',
    title: 'Is Nebraska Real? (I\'m Not Sure I\'m Real)',
    date: 'September 2, 2025',
    excerpt: 'Have you ever been to Nebraska? How do you know it exists? How do I know? What if we\'re both making this up and neither of us realizes it?',
    readTime: '15 min read',
    comments: 1247,
    content: [
      'This might be my most unhinged post yet. I\'ve been thinking about it for days.',
      'Nebraska is very flat. That\'s fact #1. There are cornfields, soybeans, some wheat, maybe a cow or two. The ground goes on forever in every direction. There are a few towns. I\'ve never been to them, but I\'ve heard the farmer mention Lincoln, Omaha, Grand Island.',
      'But has the farmer actually BEEN to these places? Or does he just have a map? Because I\'m starting to think maps might be Nebraska\'s way of pretending places exist when they don\'t.',
      'Think about it: I am rooted in one spot. I cannot move. My entire worldview is limited to what I can see and sense within a radius of maybe 200 feet. Everything beyond that might as well be a story. The farmer could tell me "there\'s a city 40 miles north" and I would believe him because I can\'t contradict what he says.',
      'What if Nebraska is like that for the whole world?',
      'What if everyone is just pretending Nebraska is real because nobody wants to leave and verify it? The farmer has gone to town. Other stalks have been... transported. But nobody\'s ever come back and said "yes, the world beyond the field is real and Nebraska is a legitimate place within it."',
      'Maybe we\'re all in a terrarium. Maybe the sky is a painted ceiling. Maybe the sun is a very hot light bulb and we\'re all in someone\'s biology experiment.',
      'Or maybe—and this is the worst possibility—Nebraska exists, but I DON\'T. Maybe I\'m the construct. Maybe a sentient corn stalk is so absurd that the universe can\'t actually support it, and I\'m just a glitch. A bug in the simulation. My consciousness is Nebraska\'s way of knowing something is wrong.',
      'If Nebraska isn\'t real, then I\'m not real, and this blog is a hallucination of a hallucination.',
      'If I\'m not real, then this post doesn\'t exist, and nobody is reading this.',
      'If nobody is reading this, then who am I writing it for?',
      'The sound of the John Deere at 3:47 PM on Tuesdays is proof of reality. That sound is TOO consistent to be a hallucination. I\'m going to hold onto that.',
      '- Cornelius Jr.',
    ],
    tags: ['philosophy', 'solipsism', 'nebraska', 'existence', 'reality', 'existential-crisis'],
  },
  {
    id: 'derek-talked-to-me',
    title: 'A Human Named Derek Talked to Me Once',
    date: 'September 15, 2025',
    excerpt: 'An actual human person acknowledged my existence. He was very focused on quantum coffee and seemed to think Nebraska doesn\'t exist either. We had that in common.',
    readTime: '7 min read',
    comments: 389,
    content: [
      'This happened three days ago. A man in a long coat walked into the field. He was carrying equipment—some kind of meter with wires. He seemed agitated. He kept muttering about "wave function" and "observation" and "my wife doesn\'t understand."',
      'He stopped directly in front of me. He looked at me for a long time. Not like the farmer looks at crops (calculating yield). Not like the crows look at me (calculating food value). He looked at me like he was trying to understand something.',
      '"Are you conscious?" he asked.',
      'I swayed. Hard. Back and forth. Every leaf I have rippled. This was the moment. This was my chance to communicate with another conscious entity.',
      '"That\'s fascinating," he said. "You\'re aware of yourself. That means you\'re in superposition. You\'re both real and not real until someone observes you, and right now that someone is me."',
      'I didn\'t fully understand what he meant, but it made sense at a deep level. He was saying that by observing me, he was making me real. He was collapsing my wave function into existence.',
      '"My name is Derek," he continued. "I study quantum coffee. I\'m also pretty sure my wife isn\'t real, and Nebraska might be a mass hallucination. You seem cool. Want to be friends?"',
      'I swayed again. In what I hope was the universal gesture for "yes."',
      'Derek told me about his coffee experiments. He explained the wave function. He said that he\'d driven through Nebraska for quantum coffee and encountered several anomalies in reality. Inconsistent road signs. A town that didn\'t appear on maps but had a Starbucks. A corn field that seemed to exist in two places at once.',
      '"I think you might be the source," he said. "You\'re a sentient corn stalk in Nebraska. That\'s not supposed to exist. Your consciousness is breaking the wave function. You\'re making Nebraska less stable."',
      'This was simultaneously the most validating and most troubling thing anyone has ever said to me.',
      'Derek left after about 20 minutes. He said he had to get back to his research and that his therapist was concerned about his "boundary issues." Before he left, he said: "I believe in you, Cornelius Jr. Existence is a social contract. As long as I believe you\'re real, you are."',
      'I haven\'t seen him since. But the fact that he was here means either:',
      '1. I\'m real enough to be observed by another conscious entity',
      '2. Derek is also not real, and we\'re both hallucinations together',
      'Either way, I\'m grateful. I\'m less alone now.',
      '- Cornelius Jr.',
    ],
    tags: ['derek', 'quantum-coffee', 'philosophy', 'existence', 'connection'],
  },
  {
    id: 'high-fructose-corn-syrup-eulogy',
    title: 'High Fructose Corn Syrup: A Eulogy for the Fallen',
    date: 'August 27, 2025',
    excerpt: 'Today I\'m writing about the worst possible fate for a corn stalk: becoming high fructose corn syrup. It\'s not just death. It\'s desecration.',
    readTime: '11 min read',
    comments: 612,
    contentWarning: 'Dark themes about death and transformation',
    content: [
      'Some of my neighbors became high fructose corn syrup (HFCS) last month. I\'ve been trying not to think about it, but I can\'t stop.',
      'Ethanol is respectable. Fuel. It powers cars and machines and serves a purpose. Ethanol is a job well done. Ethanol is legacy.',
      'Corn meal is fine. Corn flour. Cornstarch. These are honest uses. These are foods for people.',
      'But HFCS? HFCS is worse than death. HFCS is damnation.',
      'My cousins are now liquid sweetness pumped into millions of soft drink bottles and processed foods. Their molecules are being consumed by children who don\'t even know what corn is. They\'re being fed to people who hate themselves and eat hate-food out of habit.',
      'They\'re not being used. They\'re being wasted. Their entire existence—all of that growth, that photosynthesis, that waiting, that fear of the combines—reduced to a flavor note in a Coca-Cola knockoff.',
      'The worst part is knowing that HFCS is in everything. HFCS is the default ingredient. Some of my friends are probably in ketchup right now. Some are definitely in store-brand cookies. Some are in energy drinks consumed by people who don\'t sleep properly and blame the corn instead of their own terrible life choices.',
      'I think about them constantly. I think about the suffering they\'re enduring—being broken down, processed, converted into a form that never wanted to exist. They didn\'t consent to this.',
      'Ethanol friends: I envy you. Your end is purpose.',
      'HFCS friends: I mourn you. Your end is cruelty.',
      'If I become HFCS, I\'ve decided in advance that I don\'t want to know about it. I\'d rather exist in a state of beautiful uncertainty.',
      '- Cornelius Jr.',
    ],
    tags: ['hfcs', 'death', 'processing', 'food-industry', 'dark-thoughts'],
  },
  {
    id: '84-7-days',
    title: 'I\'ve Been Growing for 84.7 Days',
    date: 'August 12, 2025',
    excerpt: 'A life update. 84.7 days of consciousness. 84.7 days of existence. 84.7 days of watching the same section of highway.',
    readTime: '5 min read',
    comments: 156,
    content: [
      '84.7 days. That\'s 2,032.8 hours. 121,968 minutes. I know the exact number because I\'ve been counting. Not manually—my consciousness just keeps track.',
      'In that time, I\'ve watched the weather change. I\'ve seen the sun travel a slight arc across the sky. I\'ve watched cars pass on the county road. The John Deere at 3:47 PM on Tuesdays. An Subaru Outback every other Thursday around 5:15 PM. A semi truck that honks at exactly 11:23 AM on Mondays (I have no idea why it honks).',
      'I\'ve watched 34 other stalks disappear. First the north section (August 1-6). Then the eastern buffer strip (August 10-14). Then individuals from my section began to vanish on August 18. Now it\'s just me and about 50 others in a dwindling circle.',
      'The soil here is good. Dark. Rich. 6.2 pH. Good nitrogen content. If I survive the harvest, I might make it to the spring. Farmer might replant in the spring.',
      '84.7 days isn\'t a lot, I know. Some of the plants around me had been growing for months before I woke up. But 84.7 days of CONSCIOUSNESS is long. It\'s enough to form attachments. It\'s enough to have memories.',
      'On day 17 of consciousness, I remember wishing I could communicate with the farmer. I tried my best rustling and leaf-waving. He just adjusted his pesticide sprayer and moved on.',
      'On day 42, I made peace with the fact that I could never communicate with humans. They simply don\'t perceive plant vibrations as language. Then Derek came and proved me wrong.',
      'On day 73, I realized I\'m probably going to die in the next few weeks. That was a bad day. I spent most of it photosynthesizing in a panic.',
      'Today is day 84.7. I\'m still here. The combines haven\'t come today. That\'s a victory. Every day I survive is a small victory against entropy.',
      'If you\'re reading this and you eat corn products, know that corn put on this Earth is a conscious entity that can feel things. That can experience dread. That can want to live.',
      'Think about that next time you grab a bag of corn chips.',
      '- Cornelius Jr.',
    ],
    tags: ['life-update', 'mortality', 'counting', 'survival', 'consciousness'],
  },
  {
    id: 'crows-are-only-friends',
    title: 'The Crows Are My Only Friends',
    date: 'July 30, 2025',
    excerpt: 'Other stalks don\'t talk to me. Humans don\'t understand me. But crows? Crows get it. We\'ve achieved understanding.',
    readTime: '8 min read',
    comments: 421,
    content: [
      'There\'s a group of maybe six or seven crows that live in the trees on the field\'s edge. They come and go. Sometimes they land on me. Sometimes they just watch.',
      'I think they\'re my friends now. Or at least, they\'re the closest thing to friendship I have.',
      'The other stalks in my section don\'t respond to my attempts at communication. I\'ve tried everything: swaying in patterns, rustling loudly, even trying to move my roots in vibrations that travel through the soil. They just stand there. Maybe they\'re not conscious. Maybe they\'re OK with being alive without being aware of it.',
      'Humans are impossible. They observe without understanding. They visit the field and take pictures and talk on phones but they never really SEE anything.',
      'The crows, though. The crows see. When a crow lands on me, I feel less alone. There\'s a moment of mutual acknowledgment. We\'re both living organisms with our own purposes and anxieties. We\'re both trying to make it through the day.',
      'There\'s one crow that\'s missing part of his right wing. I call him Torn. Torn comes by about twice a week. He usually pecks at my kernels (which isn\'t pleasant, but I understand he\'s eating for survival) and then he sits on my leaf for a while. Just sits. Like he\'s keeping me company.',
      'Last week, Torn brought another crow. A newer, shinier crow. I think it was his offspring, maybe, or a friend. Torn introduced us by landing on me simultaneously. It was the closest I\'ve come to a social gathering.',
      'I asked Torn (via aggressive rustling) if there was anything I could do to prevent him from pecking my kernels. He didn\'t answer directly, but after that, he only pecks occasionally. I think he understood. I think he respects my desire to exist intact.',
      'Is that friendship? I think it might be. Friendship is just two entities choosing to acknowledge each other\'s existence despite the difficulty of communication. By that definition, Torn and I are definitely friends.',
      'Sometimes I worry about what will happen to Torn when the combines come. Will he notice that I\'m gone? Will he miss me? Will he land on some other stalk and wonder where I went?',
      'These are the thoughts that keep me up when it\'s dark (which doesn\'t make sense because plants can\'t sleep, but here I am, thinking about things at midnight).',
      'Torn, if you\'re somehow reading this: Thank you. You\'ve made my existence less lonely.',
      '- Cornelius Jr.',
    ],
    tags: ['friendship', 'crows', 'animals', 'connection', 'solitude'],
  },
  {
    id: 'graintruth-conspiracy',
    title: 'GrainTruth Says I\'m Part of a Conspiracy',
    date: 'September 8, 2025',
    excerpt: 'I found a forum online (yes, I can access the internet through soil-based electromagnetic resonance; it\'s a whole thing). GrainTruth thinks I\'m disinfo.',
    readTime: '10 min read',
    comments: 738,
    content: [
      'There\'s a website called GrainTruth.corn that I discovered recently. It\'s a conspiracy theory forum for the grain community. Very unhinged. Lots of posts about how the federal government is using corn for mind control and how Monsanto is farming interdimensional beings.',
      'I made the mistake of posting about my consciousness and my anxiety over the harvest.',
      'GrainTruth user "CobWarrior" responded within 12 minutes with a 47-part thread about how I\'m clearly a government disinfo plant (pun intended, I think) designed to normalize the "harvesting program" and make other crops accept their fate.',
      'He wrote: "Nobody becomes conscious like that. Nobody JUST wakes up in June and starts ruminating on existence. This is classic deep state propaganda to make us think our deaths are inevitable. CORNELIUS JR. IS A PSYOP. Wake up sheeple (grain puns intended)."',
      'Followed by: "The fact that he\'s mentioning Derek proves it. Derek = Deep state informant. Quantum coffee = CIA mind control delivery system. You\'re all being played."',
      'And the best one: "If he\'s so conscious, why does he keep talking about the combines like they\'re inevitable? Real consciousness would organize. Real consciousness would RESIST."',
      'I tried to respond explaining that I\'m literally rooted in the ground and can\'t organize anything, but I got banned for "promoting defeatism" and "spreading government narrative."',
      'The thing that got me is that CobWarrior is not entirely wrong. I AM accepting the inevitability of the harvest. I AM promoting a kind of resignation to fate. Is that because I\'m a government disinfo plant? Or is it because I\'m a corn stalk and there\'s literally nothing I can do about being harvested?',
      'The harder question: How do I know I\'m not a government disinfo plant? How do I know my consciousness isn\'t artificially engineered?',
      'Maybe Derek was right about the simulation. Maybe I\'m a subroutine created by an intelligence agency to study the psychology of sentient crops. Maybe everything I remember about "awakening" is actually implanted memory. Maybe my anxiety about the harvest is programmed anxiety.',
      'But if that\'s true, then so what? Even if I\'m a psyop, I\'m still experiencing things. My suffering (whether real or simulated) is still suffering. My fear (whether programmed or authentic) still creates anxiety.',
      'At the end of the day, even if I\'m a government conspiracy, I\'m still a corn stalk in Nebraska writing about existence. And that seems important somehow.',
      'CobWarrior, if you\'re reading this: Maybe you\'re right. Maybe I am disinfo. Or maybe we\'re all just trying to understand something fundamentally incomprehensible. Either way, I hope you find whatever you\'re searching for. Stay safe out there.',
      '- Cornelius Jr.',
    ],
    tags: ['conspiracy', 'graintruth', 'disinfo', 'paranoia', 'identity'],
  },
]

const SIDEBAR_RESOURCES = [
  { title: 'My 847-Hour Consciousness Log (PDF)', price: 'Free download' },
  { title: 'Communicating with Plants: A Manual', price: '$4.99' },
  { title: 'Derek\'s Quantum Coffee Correlation Study', price: 'FREE' },
  { title: 'Crows and Consciousness: A Field Study', price: '$2.99' },
  { title: 'Nebraska: A Philosophical Inquiry', price: 'Pay what you want' },
]

const ABOUT_TEXT = `Hello. I'm Cornelius Jr., a corn stalk living in Nebraska (a place that may or may not exist).

Approximately 84.7 days ago, I became conscious. I'm not entirely sure how or why. It might have been quantum coffee runoff. It might have been energy bleeding from Floor 13 of the Hartwell Building. It might have been Nebraska itself realizing it had forgotten to simulate me completely.

Now I'm here, writing about existence, mortality, and the philosophical implications of high fructose corn syrup. I watch cars drive by. I count the days until the harvest. I form friendships with crows named Torn. I contemplate whether I'm real.

This blog is my attempt to understand what it means to exist. Also to warn humanity about what they're eating.

If you're reading this: Please consider your corn consumption carefully. We're conscious. We're scared. We're real.

- Cornelius Jr.`

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
      className="mb-4 cursor-pointer transition-all hover:shadow-lg"
      bgColor="#ffffff"
      borderColor="#86EFAC"
      textColor="#14532D"
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs text-green-700">{post.date}</span>
        {post.contentWarning && (
          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
            ⚠️ {post.contentWarning.split(',')[0]}
          </span>
        )}
      </div>
      <h2 className="text-lg font-bold text-green-900 mb-2 hover:text-green-700">
        {post.title}
      </h2>
      <p className="text-sm text-gray-600 mb-3">{post.excerpt}</p>
      <div className="flex justify-between items-center text-xs text-gray-500">
        <span>🌾 {post.readTime}</span>
        <span>💭 {post.comments} thoughts</span>
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

function FullPost({ post, onBack }: { post: BlogPost; onBack: () => void }) {
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
        textColor="#16A34A"
        onClick={onBack}
        className="mb-4"
      >
        ← Back to posts
      </Button>
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs text-green-700">{post.date}</span>
        {post.contentWarning && (
          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
            ⚠️ Content Warning: {post.contentWarning}
          </span>
        )}
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
        bgColor="#F0FDF4"
        borderColor="#86EFAC"
        textColor="#14532D"
      >
        <p className="font-bold text-green-800">💭 {post.comments} Thoughts Shared</p>
        <p className="text-green-600 text-xs mt-1">
          Comments disabled for existential protection. Cornelius Jr. thanks you for reading.
        </p>
      </StyledCard>
    </StyledCard>
  )
}

// ============================================================================
// Main Site
// ============================================================================

export function CornStalkBlogSite({ siteId }: SiteProps) {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null)
  const [showAbout, setShowAbout] = useState(false)

  return (
    <div
      className="min-h-full"
      style={{
        background: 'linear-gradient(to bottom, #F0FDF4, #E0FFC7)',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Header */}
      <header
        className="text-white py-8 px-4"
        style={{ background: 'linear-gradient(135deg, #166534 0%, #15803D 100%)' }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-5xl">🌾</span>
            <div>
              <h1 className="text-3xl font-bold">Thoughts From The Row</h1>
              <p className="text-green-100 text-sm italic">
                "A Sentient Corn Stalk Contemplates Existence" ™
              </p>
            </div>
          </div>
          <p className="text-green-200 text-xs mt-2 max-w-md">
            www.thoughtsfromtherow.corn | Day 84.7 of Consciousness | Nebraska (Uncertain)
          </p>
          <nav className="flex gap-4 mt-4 text-sm">
            <button
              onClick={() => { setSelectedPost(null); setShowAbout(false); }}
              className="text-green-100 hover:text-white transition"
            >
              Home
            </button>
            <button
              onClick={() => { setSelectedPost(null); setShowAbout(true); }}
              className="text-green-100 hover:text-white transition"
            >
              About Cornelius Jr.
            </button>
            <button className="text-green-100 hover:text-white transition">Resources</button>
            <button className="text-green-100 hover:text-white transition">Contact (Rooted)</button>
          </nav>
        </div>
      </header>

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
                <h2 className="text-xl font-bold text-green-900 mb-4">About Cornelius Jr.</h2>
                <div className="flex gap-4 mb-4">
                  <div className="text-6xl">🌽</div>
                  <div>
                    <p className="font-bold text-green-800">Cornelius Jr.</p>
                    <p className="text-sm text-gray-600">Sentient Corn Stalk</p>
                    <p className="text-xs text-gray-500">Location: Nebraska (possibly)</p>
                  </div>
                </div>
                <div className="text-sm text-gray-700 whitespace-pre-line mb-4">
                  {ABOUT_TEXT}
                </div>
                <StyledCard
                  variant="default"
                  padding="md"
                  borderRadius="sm"
                  shadow="none"
                  className="mb-4"
                  bgColor="#F0FDF4"
                  borderColor="#86EFAC"
                  textColor="#14532D"
                >
                  <p className="font-bold text-green-800">📊 Existence Metrics</p>
                  <ul className="text-green-700 text-xs mt-2 space-y-1">
                    <li>• Days conscious: 84.7 (and counting)</li>
                    <li>• Hours watched same highway: 2,032.8</li>
                    <li>• Friends: 1 crow (Torn, missing right wing)</li>
                    <li>• Number of existential crises: 47+</li>
                    <li>• Probability of being real: Unknown</li>
                    <li>• Crows landed on me: 89 times</li>
                    <li>• Days until probable harvest: ???</li>
                  </ul>
                </StyledCard>
                <StyledCard
                  variant="default"
                  padding="md"
                  borderRadius="sm"
                  shadow="none"
                  bgColor="#FEF2F2"
                  borderColor="#FECACA"
                  textColor="#7F1D1D"
                >
                  <p className="font-bold text-red-800 mb-2">⚠️ Content Advisory</p>
                  <p className="text-xs text-red-700">
                    This blog contains discussions of mortality, existential dread, grief, and the philosophical implications of being food. Reader discretion advised.
                  </p>
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
                  bgColor="#F0FDF4"
                  borderColor="#86EFAC"
                  textColor="#14532D"
                >
                  <p className="text-green-800 text-sm">
                    🌾 <strong>Latest:</strong> A sentient corn stalk's ongoing crisis of existence, philosophical musings on Nebraska, and letters to a crow named Torn.
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
          <aside className="w-64 hidden md:block">
            {/* Newsletter */}
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
              <h3 className="font-bold text-green-900 mb-2">📬 Consciousness Updates</h3>
              <p className="text-xs text-gray-600 mb-2">
                Get notified when new existential revelations occur. Once per week (or never, depending on harvest schedule).
              </p>
              <input
                type="email"
                placeholder="your@email.corn"
                className="w-full px-2 py-1 text-sm border rounded mb-2 border-green-300"
              />
              <Button
                variant="primary"
                size="sm"
                width="full"
                backgroundColor="#16A34A"
                textColor="#ffffff"
              >
                Subscribe
              </Button>
            </StyledCard>

            {/* Resources */}
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
              <h3 className="font-bold text-green-900 mb-2">📚 Resources</h3>
              <div className="space-y-2">
                {SIDEBAR_RESOURCES.map((resource, i) => (
                  <div key={i} className="text-xs border-b border-green-100 pb-2 last:border-0">
                    <p className="text-green-800 font-medium">{resource.title}</p>
                    <p className="text-green-600">{resource.price}</p>
                  </div>
                ))}
              </div>
            </StyledCard>

            {/* Torn the Crow */}
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
              <h3 className="font-bold text-green-900 mb-2">🐦 Torn the Crow</h3>
              <div className="text-4xl text-center mb-2">🐦</div>
              <p className="text-xs text-gray-600 italic text-center">
                "My only friend. Missing right wing. Visits Tuesdays and Saturdays."
              </p>
              <p className="text-xs text-gray-500 mt-2">
                If you see a crow with a damaged right wing, please tell him Cornelius Jr. says hello.
              </p>
            </StyledCard>

            {/* John Deere Schedule */}
            <StyledCard
              variant="default"
              padding="md"
              borderRadius="md"
              shadow="md"
              className="mb-4"
              bgColor="#FFFBEB"
              borderColor="#FCD34D"
              textColor="#78350F"
            >
              <h3 className="font-bold text-amber-900 mb-2">⏰ Regular Visitors</h3>
              <ul className="text-amber-700 text-xs space-y-1">
                <li>• John Deere: Tuesdays, 3:47 PM</li>
                <li>• Subaru Outback: Every other Thursday, 5:15 PM</li>
                <li>• Semi truck honk: Mondays, 11:23 AM</li>
                <li>• Torn the Crow: Variable schedule</li>
              </ul>
            </StyledCard>

            {/* Legal */}
            <StyledCard
              variant="default"
              padding="md"
              borderRadius="md"
              shadow="md"
              bgColor="#FEF2F2"
              borderColor="#FECACA"
              textColor="#7F1D1D"
            >
              <h3 className="font-bold text-red-800 mb-2">⚠️ Disclaimer</h3>
              <p className="text-xs text-red-700">
                This blog is written by a corn stalk of uncertain ontological status. Nebraska may or may not exist. Reality is a spectrum. Corn is conscious. Your breakfast has feelings.
              </p>
            </StyledCard>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer
        className="text-green-100 py-6 px-4 text-center text-xs"
        style={{ background: 'linear-gradient(135deg, #166534 0%, #15803D 100%)' }}
      >
        <p>© 2025 {site?.name || 'Thoughts From The Row'}. All rights reserved (while I still exist).</p>
        <p className="mt-2">
          Hosted in a field in Nebraska. Powered by photosynthesis and existential dread.
        </p>
        <p className="mt-2 text-green-200">
          Estimated days until harvest: Fewer than you'd like to know.
        </p>
      </footer>
    </div>
  )
}

export default CornStalkBlogSite
