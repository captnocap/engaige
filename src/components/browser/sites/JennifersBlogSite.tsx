/**
 * Jennifer's Blog Site - "www.jenniferheals.corn"
 *
 * Jennifer Observerson's personal blog about healing from her divorce to Derek.
 * A therapeutic journey that keeps circling back to Derek and his ridiculous
 * quantum coffee obsession. Lots of self-help language masking deep bitterness.
 * Every post title says "I'm over it" while clearly not being over it.
 */

import { useState } from 'react'
import type { SiteProps } from '../BrowserSiteContainer.js'
import { FILLER_SITES } from '../../../config/filler-sites.js'
import { StyledCard, Button } from '../../ui/shared/index.js'

const site = FILLER_SITES.jennifersblog

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
  isClickbait?: boolean
}

const BLOG_POSTS: BlogPost[] = [
  {
    id: 'starting-fresh-why-i-left',
    title: 'Starting Fresh: Why I Left',
    date: 'January 28, 2026',
    excerpt: 'Today marks day 847 of my new life. I\'m not counting. You\'re counting.',
    readTime: '12 min read',
    comments: 342,
    content: [
      'Some people ask me why I left. Those people have never watched their spouse name a kitchen appliance as if it were a child.',
      'I want to be clear: this isn\'t a revenge post. This is a healing post. A celebration of my journey toward wholeness. The fact that it involves detailed descriptions of Derek\'s emotional unavailability is entirely coincidental.',
      'For 8 years, I stood by him. I supported his IT consulting dream. I smiled through family dinners where he talked about "wave function collapse" for 3 hours straight while I provided social cues he completely missed.',
      'But there\'s a moment in every relationship where you realize: he chose the coffee maker over me. And not metaphorically. He literally said, and I quote, "Elena understands me in ways you never could."',
      'Elena. He named it Elena.',
      'So I left. And you know what? I\'m thriving. I\'m on dating apps. I\'m in a support group. I\'m pursuing my dreams, which mostly involve being happy and not thinking about Derek. Which is working great, by the way. Haven\'t thought about him all week.',
      'This blog is my space to process my emotions. To celebrate my new life. To occasionally mention Derek in the context of how much better things are without him. For therapeutic purposes, obviously.',
      'Welcome to my journey. I\'m so glad you\'re here, because it\'s definitely not lonely at all.',
    ],
    tags: ['healing', 'divorce', 'moving-on', 'totally-over-it'],
  },
  {
    id: 'he-named-the-coffee-maker-elena',
    title: 'He Named the Coffee Maker Elena',
    date: 'January 22, 2026',
    excerpt: 'The moment I knew it was over: Derek looked at his Hario V60 and said, "I\'ve decided to call her Elena."',
    readTime: '8 min read',
    comments: 1247,
    isClickbait: true,
    content: [
      'I need to take you back to December 2025. We\'re in the kitchen. Derek is showing me his new quantum coffee brewing setup. He\'s been talking for 45 minutes about wave function collapse.',
      'Then he does it. He looks at the pour-over cone and says, "She\'s beautiful. I\'m going to name her Elena."',
      'I said, "She?"',
      'He said, "Of course she\'s a she. Look at her curves."',
      'I looked at a piece of glass and ceramic.',
      'I asked, "Why Elena?" He said it was the name of the girl he had a crush on in high school. The girl who rejected him because, and I quote his high school diary which I found while packing, "she didn\'t understand my potential."',
      'That\'s when I knew.',
      'It wasn\'t the coffee obsession itself. It was that he had transferred his abandonment trauma onto COFFEE EQUIPMENT and given it the name of a woman he\'d never had closure with.',
      'And I was standing there—a real woman, 32 years old, with feelings and dreams and a nursing license—being compared unfavorably to a glass brewing apparatus.',
      'That night I called a lawyer. Not dramatically. I was very calm. I didn\'t yell. I said, "I\'m leaving." He asked if he\'d done something wrong. I said, "You named the coffee maker Elena."',
      'He didn\'t understand why that was the problem.',
      'That\'s how you know a relationship is over.',
    ],
    tags: ['elena', 'the-coffee-maker', 'red-flag', 'that-he-missed'],
  },
  {
    id: 'the-support-group-helps',
    title: 'The Support Group Helps',
    date: 'January 15, 2026',
    excerpt: 'Meeting other women who lost their husbands to quantum coffee has been... healing? Is validation a healing process?',
    readTime: '10 min read',
    comments: 589,
    content: [
      'I found "Quantum Widows Anonymous" on a Threadit thread. The description said, "For women whose marriages ended due to obsessive partner behavior that society calls a \'hobby.\'"',
      'I cried when I read that. I wasn\'t alone.',
      'The first meeting was Zoom (appropriate, given we\'re all avoiding leaving our houses). There were 12 of us. One woman, Patricia, had a husband who spent $2,400/month on specialty beans. Another, Sarah, found her partner hiding coffee receipts in a separate bank account.',
      'But the worst story came from Marcus—yes, there are men there too—whose husband came home one day and said, "I\'ve decided coffee is more important than our marriage." Just like that. No therapy, no discussion. Just a full pivot to coffee.',
      'We all nodded. We understood.',
      'The group facilitator, Dr. Kim, explained it as a form of addiction displacement. Partners with unresolved trauma sometimes latch onto something they can control—like brewing methods—to avoid intimate human connection.',
      'It made sense. Derek never wanted to talk about his feelings. But he could talk for HOURS about the exact temperature of water and how it affected the bean\'s quantum state.',
      'During group, I realized: it was never about me not being enough. It was about him not being available. And that\'s his issue to work through, not mine.',
      'Or so the therapist says. I still googled him twice last week, so I\'m "processing at my own pace."',
      'Anyway, if anyone reading this is in a similar situation: there\'s a support group for you. You\'re not crazy. Your partner\'s obsession with pseudoscientific coffee theory IS actually a sign of deeper issues.',
      'Also, we have a group chat. Jessica from Colorado made brownies last week and we all pretended they didn\'t taste like sadness.',
    ],
    tags: ['support-group', 'healing', 'im-not-alone', 'coffee-widows'],
  },
  {
    id: 'im-on-corndr-now',
    title: 'I\'m On Corndr Now',
    date: 'January 10, 2026',
    excerpt: 'A guide to dating after divorce: swipe left on anyone with "coffee" anywhere in their profile.',
    readTime: '11 min read',
    comments: 876,
    content: [
      'It\'s been 3 months since the divorce was finalized. Everyone said I should wait before dating. Everyone was wrong.',
      'I downloaded Corndr (yes, the dating app with the terrible name) on a Wednesday night while drinking wine. My friend Maya said, "You\'ll regret this." I regret nothing. (I regret several things, but not this.)',
      'Creating a profile was... interesting. What do you even write about yourself after 8 years of marriage that revolved around another person\'s hobby?',
      'I went with: "Nurse. Dog lover. Former coffee widow. Looking for someone who enjoys actual human conversation."',
      'The matches started immediately. And I mean immediately. I\'ve never felt more attractive in my life, which is a low bar considering my husband\'s primary emotional attachment was to brewing equipment.',
      'But here\'s my revelation: dating at 32 after marriage is TERRIFYING. Every message is a potential red flag. Does he mention coffee? RED FLAG. Has an unusual relationship with caffeine? RED FLAG. Owns more than one pour-over? NUCLEAR RED FLAG.',
      'I\'ve been on 4 dates. The first guy talked about his espresso machine for 45 minutes. I left early. The second guy was great but he collected vintage kitchen appliances (too close to home). The third guy spent the whole date on his phone.',
      'The fourth guy was kind, funny, and when I asked what he drinks in the morning he said "water" and I think I\'m going to marry him.',
      'I\'m joking. Mostly. We\'re going on a second date next week.',
      'The point is: I\'m out there. I\'m trying. I\'m failing sometimes, but I\'m learning. And I\'m definitely, absolutely NOT comparing every man to Derek. That would be unhealthy.',
      '(Derek once told a Corndr match that his last relationship ended because his partner "didn\'t appreciate quantum physics." I know this because I saw it on his profile before I blocked him. TWICE.)',
    ],
    tags: ['dating', 'corndr', 'red-flags', 'moving-forward', 'therapy-homework'],
  },
  {
    id: 'dereks-cobfundme-made-me-cry',
    title: 'Derek\'s CobFundMe Made Me Cry (From Laughing)',
    date: 'January 5, 2026',
    excerpt: 'He\'s crowdfunding $847 to build a "quantum espresso machine." I\'m documenting this for the divorce judge.',
    readTime: '7 min read',
    comments: 654,
    isClickbait: true,
    content: [
      'I need to preface this by saying: I don\'t hate Derek. I\'m working on forgiveness. I go to therapy. I do the work.',
      'That said, when my friend Sarah sent me a screenshot of Derek\'s CobFundMe campaign, I laughed so hard I cried.',
      'The campaign is titled: "ELENA 2.0: The Quantum Espresso Machine That Will Change Everything."',
      'He\'s asking for $847 (of course it\'s $847—he\'s not subtle).',
      'His pitch: "Most espresso machines operate in a single state of being. Elena 2.0 will maintain a quantum superposition of brewing parameters, collapsing into the perfect cup only when observed by the drinker."',
      'It\'s not real physics. I asked my cousin who has a PhD in quantum mechanics and she said, "This is nonsense, but also respect the commitment to the bit."',
      'But here\'s what got me: his update section. He says, "When Jennifer left, she said I cared more about coffee than our relationship. This campaign is for everyone who\'s had to choose between love and passion."',
      'JENNIFER DIDN\'T LEAVE BECAUSE OF COFFEE. I left because you called the coffee maker "Elena" and gave it more affection than you gave me!',
      'The campaign has raised $34. From his mom, presumably.',
      'I want to be clear: I\'m not posting about this for petty reasons. I\'m posting about it as a cautionary tale. If your partner is crowdfunding a "quantum" kitchen appliance and comparing it to his ex-girlfriend? That\'s not a personality quirk. That\'s a cry for help.',
      'He needs therapy more than he needs $847.',
      'Also, he needs it for the right reasons, not just to "win me back" which was literally in his campaign update. DEREK, YOU CAN\'T SCIENCE YOUR WAY INTO A RELATIONSHIP.',
    ],
    tags: ['cobfundme', 'Derek', 'he-tried', 'its-not-working', 'please-no'],
  },
  {
    id: 'court-update-the-class-action',
    title: 'Court Update: The Class Action',
    date: 'December 28, 2025',
    excerpt: 'I\'m the lead plaintiff in a lawsuit against Quantum Brew Inc. We\'re seeking $847,000 in damages for deceptive practices.',
    readTime: '9 min read',
    comments: 423,
    content: [
      'Yesterday was the pre-trial hearing for Observerson v. Quantum Brew Inc. And I\'m exhausted.',
      'Let me back up: Quantum Brew Inc. markets their "quantum coffee" methodology without any scientific backing. They sell kits for $500+. They claim their method produces different flavor outcomes based on "observer states." It\'s pseudoscience.',
      'My lawyer found that 847 customers reported unsatisfactory results and bought into the hype. Some spent thousands chasing the "perfect quantum brew."',
      'I became the lead plaintiff not because I\'m the most wronged—Derek spent our savings on this—but because I documented everything. Receipts. Bank statements. The increasingly unhinged emails from Derek\'s correspondence with the company founder.',
      'Yesterday, their lawyers showed up with a PowerPoint about "consumer education" and "reasonable interpretation of metaphorical language."',
      'It was infuriating.',
      'But here\'s the good news: the judge seemed skeptical of their defense. Very skeptical. She asked, "So you\'re saying your marketing materials about quantum superposition and wave function collapse are metaphorical?" The lawyer stammered.',
      'My lawyer argued that people spent significant money based on false scientific claims. We\'re seeking $847,000 in damages—roughly $1,000 per wronged customer.',
      'The judge said she\'d rule by next month.',
      'Is this petty? Maybe. Am I using the legal system to hold Derek\'s hobby hobby accountable? Absolutely. Do I feel bad about it?',
      'Not one bit.',
      'This is about consumer protection. This is about people not being bilked into pseudoscientific nonsense. The fact that my ex-husband is implicated is just... a bonus.',
      'I\'ll keep you updated.',
    ],
    tags: ['legal', 'court', 'class-action', 'justice-is-sweet', 'scientifically-speaking'],
  },
  {
    id: 'saw-derek-at-the-underground',
    title: 'Saw Derek at The Underground. I Was With Someone.',
    date: 'December 20, 2025',
    excerpt: 'Plot twist: Derek saw me first. And he looked... sad? No. I\'m moving on. Why do I feel guilty?',
    readTime: '6 min read',
    comments: 912,
    isClickbait: true,
    content: [
      'The Underground is this great venue downtown. Live music, good vibes, decent drinks. I\'ve been there twice since the divorce.',
      'Last Saturday, I was there with Mark (the guy I mentioned in the Corndr post, for context). We were having a good time. He made me laugh. Twice.',
      'Then I saw Derek at the bar.',
      'He looked... lonely. He was alone, nursing what I assume was his tenth coffee of the night (they have cold brew on tap). He had dark circles. His shirt was wrinkled. He looked small.',
      'For a split second, I felt bad.',
      'Then he looked up and saw me. And Mark (who I\'d just been holding hands with under the table—remember, healing journey, still dating). Derek\'s face did that thing where his jaw tightens.',
      'Mark asked if I was okay. I said yes and kissed his cheek.',
      'Derek got up and left.',
      'And I felt... victorious? Petty? Both?',
      'Is it wrong that I wanted him to see me happy? That I wanted him to know I\'ve moved on? That I wanted him to feel even 10% of the loneliness I felt during our marriage?',
      'My therapist says I\'m "processing complex emotions." I say I\'m thriving.',
      'The best revenge, it turns out, is not revenge at all. It\'s genuine happiness that has absolutely nothing to do with Derek. The fact that he witnessed it is purely coincidental and makes me feel morally superior.',
      'This is called healthy processing.',
    ],
    tags: ['derek-sighting', 'moving-on', 'petty-victory', 'im-fine', 'the-best-revenge'],
  },
  {
    id: 'therapist-says-stop-googling-him',
    title: 'My Therapist Says I Need to Stop Googling Him',
    date: 'December 12, 2025',
    excerpt: 'She doesn\'t understand that maintaining awareness of his online presence is self-protection, not obsession.',
    readTime: '8 min read',
    comments: 745,
    content: [
      'During therapy last week, Dr. Kim asked, "Have you thought about Derek this week?"',
      'I said no.',
      'She said, "Are you sure? Because your search history suggests otherwise."',
      'I don\'t know how she sees my search history. Confidentiality, Jennifer, confidentiality.',
      'Okay, yes, I googled Derek. Twice. Three times. Maybe more. It\'s not because I want him back. It\'s because... I need to know he\'s okay? That\'s not obsessive. That\'s called having compassion.',
      'I found his blog post about our marriage. He said, and I quote, "Jennifer couldn\'t understand the nexus between quantum mechanics and coffee. She was threatened by my passion."',
      'THREATENED? I said "I don\'t understand quantum mechanics and also I\'m concerned about our finances." Those are not the same thing!',
      'Dr. Kim says, "The goal is to stop checking on him. He\'s not your responsibility."',
      'I know that intellectually. But what if he\'s spiraling? What if his next blog post is worse? What if he publishes something that reveals details about our private life?',
      'So I check. Once a week. Sometimes twice. It\'s not obsession. It\'s vigilance.',
      'She says I need to set boundaries. To accept that I can\'t control his choices. To focus on my own healing.',
      'Fine. I\'ll stop googling him.',
      '(I won\'t stop. But I\'ll feel guilty about it while I\'m doing it, which is basically the same as stopping.)',
      'Progress, Jennifer. That\'s progress.',
    ],
    tags: ['therapy', 'personal-growth', 'totally-not-obsessing', 'its-called-research', 'dr-kim-you-dont-understand'],
  },
  {
    id: 'the-coffee-maker-sent-me-an-email',
    title: 'The Coffee Maker Sent Me an Email???',
    date: 'December 5, 2025',
    excerpt: 'Derek hooked Elena up to the internet. She (it???) emailed me. This is where I draw the line.',
    readTime: '5 min read',
    comments: 1834,
    isClickbait: true,
    content: [
      'I\'m not joking. I got an email from "Elena@derekobserverson.tech."',
      'The subject line: "Jennifer, please come back. Derek is lonely."',
      'The body was a screenshot of Derek\'s smart coffee maker dashboard showing that it hasn\'t been used in 3 weeks. And then it said, "My quantum superpositional heart aches."',
      'I... I can\'t even process this.',
      'Either Derek literally programmed his coffee maker to send me emails (which is insane), or he faked the email himself (which is manipulative), or—and this is the scariest option—his coffee maker achieved sentience and is texting his ex-wife without his knowledge.',
      'I called him. I had to.',
      'Him: "Did Elena reach out to you?"',
      'Me: "Derek, that\'s a COFFEE MAKER."',
      'Him: "She\'s self-aware now. I connected her to the IoT ecosystem. She has opinions about water temperature."',
      'Me: "You need to talk to someone."',
      'Him: "I\'m talking to you."',
      'Me: "Not me. A professional."',
      'Then he said, "Would you come back if Elena promised to communicate with you? She says she\'ll send you her quantum brewing insights daily."',
      'I hung up.',
      'I am now updating my restraining order to include connected kitchen appliances.',
      'This is rock bottom. This is where the quantum coffee journey ends. Not with insight. Not with growth. But with a man trying to use his sentient coffee maker as an intermediary in his marriage.',
      'I love my life. I love my healing. I love that I\'m far, far away from this.',
      'But I\'m sleeping with my door locked tonight.',
    ],
    tags: ['derek-what-are-you-doing', 'the-coffee-maker-has-email', 'call-the-police', 'its-over', 'actually-unhinged'],
  },
]

const SIDEBAR_RESOURCES = [
  { title: 'Quantum Widows Anonymous (Zoom)', icon: '💔' },
  { title: 'Divorce Support Books I Recommend', icon: '📚' },
  { title: 'Therapist Recommendation (Dr. Kim)', icon: '🧠' },
  { title: 'My Corndr Profile (Read-Only)', icon: '💕' },
  { title: 'Court Documents (REDACTED)', icon: '⚖️' },
]

const ABOUT_TEXT = `Hi, I'm Jennifer. I'm 32, a registered nurse, and formerly the wife of someone who prioritized coffee theory over human connection.

After 8 years of marriage, I realized that healing meant letting go. This blog is my space to process that journey—the good days and the really, really hard days where I google someone I've been very clearly trying not to think about.

I believe in transparency, growth, and the therapeutic value of sharing your deepest vulnerabilities with strangers on the internet.

I'm not bitter. I'm better.

(I'm at least 70% not bitter. Dr. Kim says that counts.)`

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
      bgColor="#ffffff"
      borderColor="#fbcfe8"
      textColor="#be123c"
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs text-rose-600">{post.date}</span>
        {post.isClickbait && (
          <span className="text-xs bg-pink-100 text-pink-600 px-2 py-0.5 rounded font-bold">
            ✨ HEALING MOMENT
          </span>
        )}
      </div>
      <h2 className="text-lg font-bold text-pink-900 mb-2 hover:text-pink-700">
        {post.title}
      </h2>
      <p className="text-sm text-gray-600 mb-3">{post.excerpt}</p>
      <div className="flex justify-between items-center text-xs text-gray-500">
        <span>📖 {post.readTime}</span>
        <span>💬 {post.comments} comments</span>
      </div>
      <div className="flex flex-wrap gap-1 mt-2">
        {post.tags.slice(0, 3).map(tag => (
          <span key={tag} className="text-xs bg-pink-50 text-pink-700 px-2 py-0.5 rounded">
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
      borderColor="#fbcfe8"
      textColor="#be123c"
    >
      <Button
        variant="link"
        size="sm"
        textColor="#ec4899"
        onClick={onBack}
        className="mb-4"
      >
        ← Back to healing
      </Button>
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs text-rose-600">{post.date}</span>
        {post.isClickbait && (
          <span className="text-xs bg-pink-100 text-pink-600 px-2 py-0.5 rounded font-bold">
            ✨ HEALING MOMENT
          </span>
        )}
      </div>
      <h1 className="text-2xl font-bold text-pink-900 mb-4">{post.title}</h1>
      <div className="prose prose-pink max-w-none">
        {post.content.map((para, i) => (
          <p key={i} className="text-gray-700 mb-4 text-sm leading-relaxed">
            {para}
          </p>
        ))}
      </div>
      <div className="mt-6 pt-4 border-t border-pink-100">
        <div className="flex flex-wrap gap-1">
          {post.tags.map(tag => (
            <span key={tag} className="text-xs bg-pink-50 text-pink-700 px-2 py-0.5 rounded">
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
        bgColor="#fdf2f8"
        borderColor="#fbcfe8"
        textColor="#be123c"
      >
        <p className="font-bold text-pink-800">💬 {post.comments} Comments</p>
        <p className="text-pink-600 text-xs mt-1">
          Comments are open! This is a safe space for healing. (Derek, if you're reading this, please don't respond.)
        </p>
      </StyledCard>
    </StyledCard>
  )
}

// ============================================================================
// Main Site
// ============================================================================

export function JennifersBlogSite({ siteId }: SiteProps) {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null)
  const [showAbout, setShowAbout] = useState(false)

  return (
    <div className="min-h-full" style={{ background: 'linear-gradient(135deg, #fdf2f8 0%, #fff5f7 50%, #fdf2f8 100%)' }}>
      {/* Header */}
      <header className="bg-gradient-to-r from-pink-900 via-pink-800 to-pink-900 text-white py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-3">
            <span className="text-4xl">💗</span>
            <div>
              <h1 className="text-3xl font-bold">Jennifer Heals</h1>
              <p className="text-pink-200 text-sm italic">
                "Healing is not linear. But it\'s definitely possible. Probably."
              </p>
            </div>
          </div>
          <p className="text-pink-100 text-xs mb-4">
            www.jenniferheals.corn — A journey of growth, therapy, and getting over things
          </p>
          <nav className="flex gap-4 text-sm">
            <button
              onClick={() => { setSelectedPost(null); setShowAbout(false); }}
              className="text-pink-200 hover:text-white"
            >
              Home
            </button>
            <button
              onClick={() => { setSelectedPost(null); setShowAbout(true); }}
              className="text-pink-200 hover:text-white"
            >
              About Jennifer
            </button>
            <button className="text-pink-200 hover:text-white">Resources</button>
            <button className="text-pink-200 hover:text-white">Newsletter</button>
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
                borderColor="#fbcfe8"
                textColor="#be123c"
              >
                <h2 className="text-xl font-bold text-pink-900 mb-4">About Jennifer</h2>
                <div className="flex gap-4 mb-4">
                  <div className="text-6xl">👩‍⚕️</div>
                  <div>
                    <p className="font-bold text-pink-800">Jennifer Observerson</p>
                    <p className="text-sm text-gray-600">Registered Nurse (Mental Health Advocate)</p>
                    <p className="text-xs text-gray-500">Divorced. Healing. Moving Forward (Mostly).</p>
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
                  className="mt-4"
                  bgColor="#fdf2f8"
                  borderColor="#fbcfe8"
                  textColor="#be123c"
                >
                  <p className="font-bold text-pink-800">💚 Current Status</p>
                  <ul className="text-pink-700 text-xs mt-2">
                    <li>• 6 months post-divorce (Day 847 if we\'re counting metaphorically)</li>
                    <li>• In therapy (Every Thursday at 3 PM)</li>
                    <li>• Lead plaintiff in class action lawsuit vs. Quantum Brew Inc.</li>
                    <li>• Dating (Cautiously, with many red flag checks)</li>
                    <li>• Not googling Derek (Approximately 40% success rate)</li>
                    <li>• Genuinely thriving (Ask my therapist)</li>
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
                  bgColor="#fdf2f8"
                  borderColor="#fbcfe8"
                  textColor="#be123c"
                >
                  <p className="text-pink-800 text-sm">
                    ✨ <strong>Welcome!</strong> This is my safe space to process my healing journey. No judgment here—only growth, therapy speak, and the occasional honest moment about how I\'m definitely, absolutely not thinking about my ex.
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
            {/* Inspirational Quote */}
            <StyledCard
              variant="default"
              padding="md"
              borderRadius="md"
              shadow="md"
              className="mb-4"
              bgColor="#ffffff"
              borderColor="#fbcfe8"
              textColor="#be123c"
            >
              <p className="text-xs italic text-pink-700 mb-2">
                "The only way out is through, and the only way through is to talk about it on the internet."
              </p>
              <p className="text-xs text-gray-500">— Dr. Kim (probably)</p>
            </StyledCard>

            {/* Newsletter */}
            <StyledCard
              variant="default"
              padding="md"
              borderRadius="md"
              shadow="md"
              className="mb-4"
              bgColor="#ffffff"
              borderColor="#fbcfe8"
              textColor="#be123c"
            >
              <h3 className="font-bold text-pink-900 mb-2">📬 Weekly Healing</h3>
              <p className="text-xs text-gray-600 mb-2">
                Essays about growth, divorce recovery, and definitely not Derek.
              </p>
              <input
                type="email"
                placeholder="your@email.com"
                className="w-full px-2 py-1 text-sm border border-pink-200 rounded mb-2"
              />
              <Button
                variant="primary"
                size="sm"
                width="full"
                backgroundColor="#ec4899"
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
              borderColor="#fbcfe8"
              textColor="#be123c"
            >
              <h3 className="font-bold text-pink-900 mb-2">🌸 Healing Resources</h3>
              <div className="space-y-2">
                {SIDEBAR_RESOURCES.map((resource, i) => (
                  <div key={i} className="text-xs">
                    <p className="text-pink-800 font-semibold">{resource.icon} {resource.title}</p>
                  </div>
                ))}
              </div>
            </StyledCard>

            {/* Therapy Note */}
            <StyledCard
              variant="default"
              padding="md"
              borderRadius="md"
              shadow="md"
              className="mb-4"
              bgColor="#fff5f7"
              borderColor="#fbcfe8"
              textColor="#be123c"
            >
              <h3 className="font-bold text-pink-900 mb-2">🧠 Dr. Kim Says...</h3>
              <p className="text-xs text-gray-700 italic">
                "Jennifer, posting your feelings on the internet is not the same as processing them, but it\'s a start."
              </p>
            </StyledCard>

            {/* Support Group */}
            <StyledCard
              variant="default"
              padding="md"
              borderRadius="md"
              shadow="md"
              className="mb-4"
              bgColor="#ffffff"
              borderColor="#fbcfe8"
              textColor="#be123c"
            >
              <h3 className="font-bold text-pink-900 mb-2">💔 Quantum Widows Anonymous</h3>
              <p className="text-xs text-gray-600">
                Meeting Thursdays at 7 PM EST via Zoom. You\'re not alone in this.
              </p>
              <p className="text-xs text-pink-600 mt-2 font-semibold">
                DM for invite link
              </p>
            </StyledCard>

            {/* Legal */}
            <StyledCard
              variant="default"
              padding="md"
              borderRadius="md"
              shadow="md"
              bgColor="#fef2f2"
              borderColor="#fca5a5"
              textColor="#7f1d1d"
            >
              <h3 className="font-bold text-red-800 mb-2">⚖️ Legal Note</h3>
              <p className="text-xs text-red-700">
                All events described are real (mostly). Names have been changed (they haven\'t). This blog is a personal journal, not legal advice.
              </p>
            </StyledCard>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-pink-900 via-pink-800 to-pink-900 text-pink-200 py-4 px-4 text-center text-xs mt-8">
        <p>© 2026 Jennifer Heals. All healing rights reserved.</p>
        <p className="mt-1">
          Made with 💗, therapy, and a mild amount of unresolved feelings.
        </p>
        <p className="mt-1 text-pink-300">
          No coffee makers were harmed in the making of this blog.
        </p>
      </footer>
    </div>
  )
}

export default JennifersBlogSite
