/**
 * Tim's Mom's Blog Site
 *
 * Carol's personal blog about her son Trust Fall Tim and his "art career."
 * A worried mother live-blogging her son's dangerous hobby with genuine love
 * mixed with deep concern and confusion. Features posts about medical bills,
 * Small Kevin drama, and obsessive tracking of his fall count (currently 847).
 *
 * URL: www.timsmomsupport.corn
 * Theme: Warm, cozy, maternal. Floral patterns, homemade aesthetic.
 */

import { useState } from 'react'
import type { SiteProps } from '../BrowserSiteContainer.js'
import { FILLER_SITES } from '../../../config/filler-sites.js'
import { StyledCard, Button } from '../../ui/shared/index.js'

const site = FILLER_SITES.timsmomsupport || {
  name: "Carol's Trust Fall Support Blog",
  tagline: "A Mother's Journey Through Confusion",
}

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
  isLiveUpdate?: boolean
  concerns?: string[]
}

const BLOG_POSTS: BlogPost[] = [
  {
    id: 'my-son-the-artist',
    title: 'My Son the "Artist" (How Do I Explain This at Book Club?)',
    date: 'January 22, 2026',
    excerpt: 'Tim told me he "performs trust falls professionally." I spent 20 minutes explaining it to Carol from Pilates. She thought I meant he was a personal trainer.',
    readTime: '8 min read',
    content: [
      'My son Timothy is 34 years old and his job is jumping off things and hoping people catch him.',
      'I know how that sounds. I have a Master\'s degree in Library Science. I understand how it sounds.',
      'Last Tuesday, I was at my book club—we were discussing "Educated"—and Brenda asked what Tim does for work. I said, "He\'s an artist." And that\'s technically true! But then she asked what KIND of artist, and I had to explain that he literally jumps in the air and trusts that strangers will catch him before he hits the ground.',
      'Dead silence. Someone dropped their wine glass.',
      'Barbara asked if it was performance art. I said yes. Barbara seemed satisfied. I didn\'t mention the hospital bills.',
      'Tim says this is his "calling." He says the trust fall is "a meditation on human connection." His father just shakes his head and watches ESPN louder.',
      'I brought a photo to show them. He was mid-fall, captured by a professional photographer. His hair looked good, at least. Hair looked expensive. I wish he spent that much on health insurance.',
      'I\'m proud of him. I really am. But I\'m also very concerned. These are not mutually exclusive feelings.',
    ],
    tags: ['tim-career', 'book-club', 'concerned-mom', 'what-is-he-doing'],
    concerns: ['Career instability', 'Injury risk', 'Explaining him to people'],
  },
  {
    id: 'fall-847-live-updates',
    title: 'I Watched Fall #847 (Live Updates - Mild Heart Attack Included)',
    date: 'January 10, 2026',
    isLiveUpdate: true,
    excerpt: '4:15 PM: He\'s about to jump. I can\'t watch. I\'m watching. My hands are shaking. Update: He\'s alive.',
    readTime: '12 min read',
    content: [
      '4:00 PM - I\'m here at The Underground (the venue - it\'s a converted basement bar, very dark, smells like beer). Tim is warming up. He\'s doing stretches. Why is he stretching? Does that help?',
      '',
      '4:08 PM - The crowd is gathering. Probably 40-50 people. I count 7 older women in the audience. I am not alone in my concerns. Several of them nod sympathetically at me. We form an unspoken alliance of worried mothers.',
      '',
      '4:14 PM - This is it. Tim takes his position. He\'s on a platform that\'s about 6 feet high. That seems low? Or is 6 feet high?? Why am I not good at measurements. He\'s going to fall 6 feet onto the heads of college students who are NOT his mother and have NOT been trained in emergency first aid.',
      '',
      '4:16 PM - "Ladies and gentlemen, this is Trust Fall Tiiiiim!" the announcer yells. I die a little inside.',
      '',
      '4:17 PM - HE JUMPS. TIME STOPS. THE WORLD IS SLOW MOTION. A THOUSAND ARMS REACH UP. THEY CATCH HIM. HE LANDS SAFELY ON 12 RANDOM MEN.',
      '',
      '4:18 PM - I need to sit down. There is no chair. I sit on the floor. A young man asks if I\'m okay. I say "my son is a professional faller." He seems confused.',
      '',
      '4:20 PM - Tim comes over, sweaty, energized, talking about "the energy of the room" and "how safe and connected he felt." He did not feel as safe as I felt unsafe.',
      '',
      '4:25 PM - He\'s already talking about Fall #848. I brought Tums in my purse. I eat three of them dry.',
      '',
      'UPDATE: He\'s fine. He\'s always fine. Statistically speaking, at some point he will not be fine. This is the problem with statistics and probability. Eventually someone loses.',
    ],
    tags: ['fall-847', 'live-blog', 'heart-attack', 'i-brought-tums'],
    concerns: ['Fall landing safety', 'Crowd competence', 'His career trajectory'],
  },
  {
    id: 'small-kevin-trouble',
    title: 'That Kevin Boy Is Trouble (A Mother\'s Investigation)',
    date: 'December 28, 2025',
    excerpt: 'Small Kevin "missed a catch" during Fall #823. Tim fractured his arm. Kevin\'s mother denies everything. I have words.',
    readTime: '11 min read',
    content: [
      'Let me be VERY clear: I am not a person who holds grudges. I am calm. I am rational. I am a library scientist.',
      '',
      'But Small Kevin is a menace.',
      '',
      'For those unfamiliar with the trust fall community (and why would you be), "Small Kevin" is one of Tim\'s regular catchers. He\'s called "Small Kevin" even though he\'s 5\'11". I don\'t understand the naming conventions in this community.',
      '',
      'In November, during Fall #823, Small Kevin was part of the catch team. Tim landed on 10 people. Small Kevin was one of them. Except—and here is where my blood pressure enters dangerous territory—Small Kevin DID NOT CATCH HIM.',
      '',
      'He STEPPED OUT OF THE WAY.',
      '',
      'Tim fell through the catch net and fractured his left arm. I was NOT at this one (thank God, I would have had a full coronary). He hid it from me for THREE DAYS.',
      '',
      'I found out when I went to his apartment and saw his arm in a cast. I thought he had a STROKE. I almost called 911. For a FRACTURE. That he got from his JOB.',
      '',
      'When I asked why Kevin stepped out of the way, Tim said it was "strategic repositioning" and Kevin "didn\'t feel confident in his balance." WELL GET BETTER BALANCE, KEVIN, YOUR JOB IS CATCHING PEOPLE.',
      '',
      'I tried calling Kevin\'s mother, Susan, to discuss this like adults. She said I was "overreacting" and that "accidents happen in all sports." Ma\'am, this is not a sport. This is your son deliberately causing other people to fall.',
      '',
      'Tim defended Kevin. Said they\'re "friends" and "it was just a bad day." This is the most Tim thing he\'s ever said.',
      '',
      'I brought cookies to Tim\'s next performance (Fall #840) and I did NOT give any to Small Kevin. I gave extra to the good catchers. The ones with competent hand-eye coordination.',
      '',
      'Small Kevin avoided eye contact with me the rest of the night.',
      '',
      'Good.',
    ],
    tags: ['small-kevin', 'drama', 'dangerous', 'catching-skills'],
    concerns: ['Kevin\'s competence', 'Tim\'s poor judgment', 'Enabling behavior'],
  },
  {
    id: 'catch-rate-78-point-5',
    title: 'Tim Got His Catch Rate Up to 78.5%! (But What About the OTHER 21.5%???)',
    date: 'December 15, 2025',
    excerpt: 'This is supposed to be good news. A mother should be happy. But all I can think about is 847 multiplied by 0.215. That\'s a LOT of falls.',
    readTime: '7 min read',
    content: [
      'Tim told me his "catch rate" has improved to 78.5%. I am supposed to be proud. I am trying to be proud. But let me do the math here.',
      '',
      '847 falls total. 78.5% successful = 664 successful catches. Which means... 183 FALLS WHERE SOMETHING WENT WRONG.',
      '',
      'ONE HUNDRED AND EIGHTY THREE.',
      '',
      'His father asked me to stop doing the math. He said it\'s "not helpful." I said KNOWLEDGE is always helpful.',
      '',
      'Tim explained that a 78.5% catch rate is actually "extremely good" for someone who\'s been doing this for 3 years. He said most trust fall performers don\'t track stats this carefully. Which is PROBABLY because they would have nervous breakdowns if they did.',
      '',
      'I asked him what happens in the 21.5%. He said "people have good days and bad days" and "some falls are just harder than others—maybe the crowd is smaller, or there\'s bad positioning."',
      '',
      'So you\'re telling me that 183 TIMES, the conditions were suboptimal for falling on people.',
      '',
      'I should not be proud of this statistic. And yet, my mother\'s heart is proud. 78.5% is objectively better than 77.2% (his rate last month). So I am proud AND terrified. Schrödinger\'s mother.',
      '',
      'I made him a pie to celebrate. It has 78.5% filling and 21.5% less filling to represent the risk ratio. He didn\'t get the joke. He just ate the pie.',
      '',
      'His father got it. He laughed very hard and then looked sad.',
    ],
    tags: ['statistics', 'proud-but-terrified', 'math', 'catch-rates'],
    concerns: ['That other 21.5%', 'Crowd incompetence', 'Long-term injury risk'],
  },
  {
    id: 'met-mars-underground',
    title: 'I Met Mars at The Underground (She\'s Actually Very Nice?)',
    date: 'December 2, 2025',
    excerpt: 'The venue owner. Expected a sketchy club owner. Found a thoughtful woman who also seems worried about Tim. We bonded over concern.',
    readTime: '6 min read',
    content: [
      'Last Friday, I arrived at The Underground early to watch Tim set up for Fall #835. I was carrying my homemade brownies (the good ones, with the chocolate chunks, not the corner-cutting kind).',
      '',
      'The venue owner, Mars, was there doing sound checks. I was expecting someone... edgier? Moodier? Definitely someone who wouldn\'t care about a 58-year-old woman\'s concerns about her son jumping off platforms.',
      '',
      'But Mars came over to talk to me. She remembered my name. She asked how I was doing.',
      '',
      '"I\'m worried Tim\'s going to get seriously hurt," I told her. No filter. Just the truth.',
      '',
      'And Mars said—and I\'m quoting here—"Yeah, I worry about that too."',
      '',
      'We had a 20-minute conversation about injury prevention, crowd positioning, and the legal liability of hosting jump performances in a basement. Mars has clearly thought about this. She has insurance specifically for Tim. INSURANCE SPECIFICALLY FOR TIM.',
      '',
      'She told me that Tim negotiated it himself. That he wanted to make sure the venue was protected. That he took his "work" seriously in that way, at least.',
      '',
      'I offered her the brownies. She accepted them like they were a peace offering between two warriors. Which, I suppose, they were.',
      '',
      'She told me that whenever Tim performs, she stations extra catchers in strategic positions. That she watches the crowd carefully. That she\'s seen 847 falls and is deeply committed to making sure fall #848 happens safely.',
      '',
      'We\'re friends now, I think? We\'re friends.',
      '',
      'She still has leftover brownies from that day. She offered me the recipe for her venue\'s signature cocktail in trade. I said yes. I am bringing them next week. This is an alliance.',
    ],
    tags: ['mars', 'the-underground', 'unexpected-ally', 'brownies'],
  },
  {
    id: 'bringing-snacks',
    title: 'Bringing Snacks to My Son\'s "Shows" (A Mother\'s Review)',
    date: 'November 18, 2025',
    excerpt: 'I started bringing homemade cookies to perform performances. My snack reviews. A ranking of which trust fall events have the worst lighting.',
    readTime: '9 min read',
    content: [
      'I have attended 18 of Tim\'s performances. I have brought homemade baked goods to 12 of them. People now expect my presence and my cookies. I have accidentally become a fixture in the trust fall community.',
      '',
      'Here is my official cookie ranking by venue (because I keep detailed notes):',
      '',
      'TIER 1 (EXCELLENT CONDITIONS FOR BAKING):',
      '• The Underground - Good temperature control, people are receptive to snacks, Mars says nice things about my cookies',
      '• The Basement Bar - Surprisingly good ventilation for a basement bar, audience is about 60% my age (sympathetic)',
      '',
      'TIER 2 (ADEQUATE):',
      '• Derek\'s Loft - More pretentious crowd, but they eat the cookies anyway, someone asked for my recipe last time',
      '',
      'TIER 3 (CHALLENGING):',
      '• The Parking Garage (Fall #812) - Why would anyone do a trust fall in a PARKING GARAGE. It echoes. The acoustics ruined my baking experience. The cookies tasted fine but the ENVIRONMENT was wrong.',
      '• That one warehouse (Fall #828) - Too cold. Chocolate chips seized. Never again.',
      '',
      'I have perfected a chocolate chip cookie recipe that travels well. I use a mixture of semi-sweet and dark chocolate because the college students seem to appreciate complexity. The cookies are always gone within 20 minutes.',
      '',
      'Several people now refer to me as "Tim\'s Mom With The Cookies." I have been partially reduced to my baked goods, and yet, I am somehow okay with this.',
      '',
      'Tim is embarrassed by my presence. He hides this poorly. His father came to one show and stood in the back looking stricken. When I asked why, he said "I don\'t know what\'s more terrifying—Tim jumping or you baking cookies for his jumpers."',
      '',
      'But here\'s the truth: I brought cookies to Fall #823 (the one where Small Kevin failed). I noticed Kevin avoided my cookie table. I notice EVERYTHING.',
      '',
      'My cookies are now a form of surveillance.',
    ],
    tags: ['cookies', 'snacks', 'venue-reviews', 'maternal-involvement'],
  },
  {
    id: 'the-medical-bills',
    title: 'The Medical Bills (Why I Started the CobFundMe)',
    date: 'October 25, 2025',
    excerpt: 'Tim "didn\'t want to worry me" about his ER visits. That\'s where the $47,000 in bills came from. This is why I have a crowdfunding campaign.',
    readTime: '10 min read',
    content: [
      'I did not want to write this post. I wanted to keep our medical situation private.',
      '',
      'But I also wanted to keep Tim\'s career private. That didn\'t work out.',
      '',
      'Three months ago, I asked Tim casually about his health insurance. He said he had "basic coverage through an independent contractor\'s plan." I moved on. I should not have moved on.',
      '',
      'Last month, I got a bill forwarded to his apartment. It was addressed to me (I\'m still on his emergency contact). It was for $47,000. From County Hospital. From an ER visit in June.',
      '',
      'I called Tim. He claimed not to remember it. I said "A FORTY-SEVEN THOUSAND DOLLAR ER VISIT?" and he was like "oh yeah, that one."',
      '',
      '"THAT ONE," Timothy, suggests there have been MULTIPLE.',
      '',
      'It turns out he\'s had SIX ER visits in the last two years. Sprains, contusions, one concussion. He paid for most of them out of pocket because his insurance deductible is $5,000 per visit.',
      '',
      'His deductible is $5,000.',
      '',
      'His salary from trust falls is approximately $2,400 per month.',
      '',
      'I cannot do math. I refuse to do this math. His father did it for me and now he just sits very still and stares at the wall.',
      '',
      'So I did what any rational mother would do. I created a CobFundMe campaign. The title is "Help Tim\'s Mom Help Tim (Medical Bills From His Dangerous Art)."',
      '',
      'I set a goal of $15,000, which would cover his past ER visits plus emergency savings for future falls. It felt absurd to type that. "Future falls." Like they\'re inevitable. Which they are. Because he\'s going to keep jumping.',
      '',
      'I have raised $3,200 so far, mostly from the trust fall community. A few of his regular catchers donated. Mars donated $500 and a message saying "He\'s important." Several people from The Underground pitched in.',
      '',
      'Even Small Kevin donated $25.',
      '',
      'I was not expecting Small Kevin to donate. This complicates my feelings about Small Kevin.',
      '',
      'I still did not give him extra cookies, though. Standards.',
    ],
    tags: ['medical-bills', 'cobfundme', 'insurance-crisis', 'desperate-times'],
    concerns: ['Ongoing injury risk', 'Financial instability', 'Healthcare access'],
  },
  {
    id: 'grandchildren-want',
    title: 'I Just Want Grandchildren (But Tim Is Too Busy Falling)',
    date: 'October 10, 2025',
    excerpt: 'Is it selfish to want my son to have a normal life? To want him to meet someone, settle down, maybe give me a grandchild before I\'m too old to enjoy it?',
    readTime: '8 min read',
    content: [
      'My friends all have grandchildren. Barbara has three. Carol has two and is expecting a third. Brenda went to a grandchild\'s soccer game last weekend and hasn\'t stopped talking about it.',
      '',
      'I have a son who jumps off things for money.',
      '',
      'Don\'t misunderstand me. I love Tim. I am proud of his commitment to his craft. But I am also 58 years old and have been thinking about grandchildren since Tim turned 30.',
      '',
      'He doesn\'t date. He says he\'s "married to the practice" of trust falling. When he said that, I almost broke a glass.',
      '',
      'I have tried to set him up. I know a lovely woman from my library who reads a lot of literary fiction. I thought they might connect. Tim said "mom, I can\'t think about romantic relationships right now because I\'m processing a lot of emotional work around vulnerability."',
      '',
      'Ma\'am, you are literally vulnerable for a living. You fall in the air.',
      '',
      'His father suggested that maybe the trust falls ARE his way of processing relationships. That every fall is a meditation on trust, on connection, on the fear and beauty of interdependence. I said "that\'s very poetic, Gary, but it does not produce grandchildren."',
      '',
      'I shouldn\'t want this. Plenty of people don\'t have kids. Plenty of women are living fulfilling lives without grandchildren. I know this rationally.',
      '',
      'But emotionally? I want to bake for a grandchild\'s birthday party. I want to teach them recipes. I want them to call me grandma with that specific tone of love that children use.',
      '',
      'Maybe I should just adopt someone. Is that weird? Can you do that at my age?',
      '',
      'Until then, I guess I\'ll keep baking cookies for college students at trust fall performances and hope that one of them is someone Tim\'s interested in. Very subtle plan, Carol. Very subtle.',
    ],
    tags: ['grandchildren', 'lonely', 'aging-parent', 'maternal-desires'],
  },
  {
    id: 'father-doesnt-understand',
    title: 'Tim\'s Father Doesn\'t Understand Either (Marital Stress Over Our Son\'s Career)',
    date: 'September 28, 2025',
    excerpt: 'Gary and I are happily married. But Tim\'s career is creating tension. We process fear differently, and it\'s showing.',
    readTime: '9 min read',
    content: [
      'Gary and I have been married for 36 years. We have weathered mortgage crises, job layoffs, my mother\'s three-year-long "experimental phase," and Tim\'s entire adolescence.',
      '',
      'But I don\'t know if we\'re going to weather Trust Fall Tim.',
      '',
      'We process Tim\'s career very differently.',
      '',
      'I process it by attending performances, bringing cookies, monitoring his catch rates, and managing his medical expenses through a crowdfunding campaign.',
      '',
      'Gary processes it by avoiding all information about it and watching increasingly large amounts of ESPN.',
      '',
      'Last week, I mentioned that Tim\'s fall count had reached 847. Gary said "please stop telling me these things." I said "GARY, THESE ARE FACTS ABOUT OUR SON." He said "exactly, and the facts are horrible."',
      '',
      'He refuses to attend any of Tim\'s performances. He says seeing Tim jump will "traumatize him in a way he cannot recover from." I said "Gary, I see it all the time and I\'m still functioning." Gary said "Carol, you are baking surveillance cookies. That is not functioning."',
      '',
      'He had a point.',
      '',
      'The real tension came when Gary suggested that maybe we should have a serious conversation with Tim about "alternate career paths." I said "GARY, our son is 34 years old." Gary said "exactly, and he\'s going to be 35 with broken bones."',
      '',
      'I don\'t disagree with him. But I also believe Tim has to make his own choices. Even when those choices are terrifying and economically risky.',
      '',
      'Gary thinks I\'m enabling him by attending the shows. I think Gary\'s avoidance is enabling him too, just in a different way. We have not found common ground on this.',
      '',
      'Last Tuesday, Gary came home early from work. I asked why. He said he\'d received a text that Tim had done Fall #843 and he "needed to know immediately" that Tim was okay. So he texted Tim. So even Gary\'s avoidance strategy broke down.',
      '',
      'We are both terrified. We just express it differently.',
      '',
      'I through cookies. He through ESPN.',
      '',
      'I suggested couples therapy. He said "our marriage is fine, it\'s our son\'s job that\'s the problem." I said "that affects our marriage." We\'re now in couples therapy.',
      '',
      'The therapist says we\'re actually "quite aligned" in our values, just processing trauma through different outlets. She used the word "trauma." I suppose that\'s accurate.',
      '',
      'Gary brought me flowers yesterday. I brought him homemade pasta. We didn\'t discuss Tim. We just existed in our worry together. I think that\'s what marriage is, sometimes. Mutual catastrophizing paired with shared love for a very stupid son.',
    ],
    tags: ['marriage', 'gary', 'processing-fear', 'couples-therapy', 'stress'],
  },
]

const SIDEBAR_ITEMS = [
  { label: 'Tim\'s Fall Count', value: '847' },
  { label: 'Catch Rate', value: '78.5%' },
  { label: 'Medical Emergencies', value: '6' },
  { label: 'Cookies Baked', value: '37 batches' },
  { label: 'Heart Attacks', value: 'Lost count' },
]

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
      bgColor="#faf5f0"
      borderColor="#dcc5bb"
      textColor="#5c4033"
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs text-orange-600">{post.date}</span>
        {post.isLiveUpdate && (
          <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded animate-pulse">
            🔴 LIVE UPDATE
          </span>
        )}
      </div>
      <h2 className="text-lg font-bold text-orange-900 mb-2 hover:text-orange-700">
        {post.title}
      </h2>
      <p className="text-sm text-gray-700 mb-3">{post.excerpt}</p>
      {post.concerns && post.concerns.length > 0 && (
        <div className="mb-3 text-xs text-red-600 font-semibold">
          ⚠️ Mom\'s Concerns: {post.concerns.slice(0, 2).join(', ')}
        </div>
      )}
      <div className="flex justify-between items-center text-xs text-gray-600">
        <span>📖 {post.readTime}</span>
        <span>💭 Worried</span>
      </div>
      <div className="flex flex-wrap gap-1 mt-2">
        {post.tags.slice(0, 3).map((tag) => (
          <span key={tag} className="text-xs bg-orange-50 text-orange-700 px-2 py-0.5 rounded">
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
      borderColor="#dcc5bb"
      textColor="#5c4033"
    >
      <Button
        variant="link"
        size="sm"
        textColor="#a85030"
        onClick={onBack}
        className="mb-4"
      >
        ← Back to posts
      </Button>
      <div className="flex justify-between items-start mb-4">
        <span className="text-xs text-orange-600">{post.date}</span>
        {post.isLiveUpdate && (
          <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">
            🔴 LIVE UPDATE
          </span>
        )}
      </div>
      <h1 className="text-3xl font-bold text-orange-900 mb-2">{post.title}</h1>
      {post.concerns && post.concerns.length > 0 && (
        <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-400 rounded">
          <p className="text-xs font-bold text-red-700 mb-1">Mom\'s Pressing Concerns:</p>
          <ul className="text-xs text-red-600">
            {post.concerns.map((concern) => (
              <li key={concern}>• {concern}</li>
            ))}
          </ul>
        </div>
      )}
      <div className="prose prose-orange max-w-none">
        {post.content.map((para, i) => (
          <p
            key={i}
            className={`mb-4 text-gray-800 leading-relaxed ${
              para === '' ? 'h-2' : 'text-sm'
            }`}
          >
            {para}
          </p>
        ))}
      </div>
      <div className="mt-6 pt-4 border-t border-orange-100">
        <div className="flex flex-wrap gap-1">
          {post.tags.map((tag) => (
            <span key={tag} className="text-xs bg-orange-50 text-orange-700 px-2 py-0.5 rounded">
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
        bgColor="#fff5f0"
        borderColor="#f4dfd7"
        textColor="#5c4033"
      >
        <p className="font-bold text-orange-800">📝 About This Post</p>
        <p className="text-orange-700 text-xs mt-2">
          Posted with love and deep concern. If you have advice, please email me at
          carol@timsmomsupport.corn
        </p>
      </StyledCard>
    </StyledCard>
  )
}

// ============================================================================
// Main Site
// ============================================================================

export function TimsMomBlogSite({ siteId }: SiteProps) {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null)
  const [showAbout, setShowAbout] = useState(false)

  return (
    <div
      className="min-h-full"
      style={{
        background: 'linear-gradient(135deg, #fdf9f6 0%, #f5ede4 100%)',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Header */}
      <header className="bg-gradient-to-r from-orange-900 to-red-900 text-white py-8 px-4 border-b-8 border-orange-300 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-5xl">🍪</span>
            <div>
              <h1 className="text-3xl font-bold text-orange-100">{site?.name}</h1>
              <p className="text-orange-200 text-sm italic">
                "A Mother\'s Journey Through Confusion & Concern"
              </p>
              <p className="text-orange-100 text-xs mt-1">Carol\'s Honest Blog About Tim\'s... Art Career</p>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3 text-xs text-orange-100">
            <span>📍 Falls Tracked: 847</span>
            <span>•</span>
            <span>❤️ Heart Attacks: ∞</span>
            <span>•</span>
            <span>🍪 Batches Baked: 37</span>
          </div>
          <nav className="flex gap-4 mt-4 text-sm flex-wrap">
            <button
              onClick={() => {
                setSelectedPost(null)
                setShowAbout(false)
              }}
              className="text-orange-200 hover:text-white font-semibold"
            >
              Home
            </button>
            <button
              onClick={() => {
                setSelectedPost(null)
                setShowAbout(true)
              }}
              className="text-orange-200 hover:text-white font-semibold"
            >
              About Carol
            </button>
            <button className="text-orange-200 hover:text-white font-semibold">
              Ask Me Anything (via email)
            </button>
            <button className="text-orange-200 hover:text-white font-semibold">
              Tim\'s Instagram (he doesn\'t have one)
            </button>
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
                borderColor="#dcc5bb"
                textColor="#5c4033"
              >
                <h2 className="text-2xl font-bold text-orange-900 mb-4">About Carol</h2>
                <div className="flex gap-4 mb-4">
                  <div className="text-6xl">👩‍🦳</div>
                  <div>
                    <p className="font-bold text-orange-900">Carol Williams</p>
                    <p className="text-sm text-gray-700">Concerned Mother, Library Scientist, Cookie Baker</p>
                    <p className="text-xs text-gray-600">Tracking Fall #847 and Beyond</p>
                  </div>
                </div>
                <div className="text-sm text-gray-800 leading-relaxed">
                  <p className="mb-4">
                    Hello! I\'m Carol, a 58-year-old former library scientist now primarily known as
                    "Tim\'s Mom With The Cookies." I started this blog to document my journey as the
                    parent of a professional trust fall performer.
                  </p>
                  <p className="mb-4">
                    My son Timothy decided at age 31 that his calling was to jump off things and hope
                    that strangers would catch him. I am handling this better than expected (lower
                    expectations). I bring baked goods to his performances. I track his statistics. I
                    attend therapy.
                  </p>
                  <p className="mb-4">
                    My husband Gary avoids all information about Tim\'s career. My therapist says this
                    is "a healthy coping mechanism." I disagree, but I am not a therapist.
                  </p>
                  <p className="mb-4">
                    This blog is where I process the fear, the confusion, the pride, and the cookies. If
                    you\'re a parent who doesn\'t understand your adult child\'s career choices, this blog
                    is for you.
                  </p>
                  <p>
                    Godspeed to all of us confused parents out there. We are doing our best.
                  </p>
                </div>
                <StyledCard
                  variant="default"
                  padding="md"
                  borderRadius="sm"
                  shadow="none"
                  className="mt-4"
                  bgColor="#fff5f0"
                  borderColor="#f4dfd7"
                  textColor="#5c4033"
                >
                  <p className="font-bold text-orange-800">📊 Carol\'s Stats</p>
                  <ul className="text-orange-700 text-xs mt-2 space-y-1">
                    <li>• Age: 58</li>
                    <li>• Years of Maternal Concern: 34</li>
                    <li>• Trust Fills Witnessed: 18</li>
                    <li>• Medical Bills Tracked: $47,000+</li>
                    <li>• Therapy Sessions: 12 and counting</li>
                    <li>• Cookie Recipes Perfected: 5</li>
                    <li>• Heart Attack Risk: Very High</li>
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
                  className="mb-4 border-l-4 border-orange-400"
                  bgColor="#fff5f0"
                  borderColor="#f4dfd7"
                  textColor="#5c4033"
                >
                  <p className="text-orange-900 text-sm font-semibold mb-2">
                    📌 Recent Update
                  </p>
                  <p className="text-orange-800 text-sm">
                    Tim completed Fall #847 successfully last week. His catch rate remains at 78.5%.
                    I have started a petition to require better insurance coverage for trust fall
                    performers. Gary is watching sports to cope.
                  </p>
                </StyledCard>
                {BLOG_POSTS.map((post) => (
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
          <aside className="w-72 hidden lg:block space-y-4">
            {/* Stats */}
            <StyledCard
              variant="default"
              padding="md"
              borderRadius="md"
              shadow="md"
              className="sticky top-4"
              bgColor="#ffffff"
              borderColor="#dcc5bb"
              textColor="#5c4033"
            >
              <h3 className="font-bold text-orange-900 mb-3 text-sm">📊 The Numbers</h3>
              <div className="space-y-2">
                {SIDEBAR_ITEMS.map((item) => (
                  <div key={item.label} className="border-b border-orange-100 pb-2">
                    <p className="text-xs text-gray-700">{item.label}</p>
                    <p className="text-lg font-bold text-orange-700">{item.value}</p>
                  </div>
                ))}
              </div>
            </StyledCard>

            {/* Newsletter */}
            <StyledCard
              variant="default"
              padding="md"
              borderRadius="md"
              shadow="md"
              bgColor="#ffffff"
              borderColor="#dcc5bb"
              textColor="#5c4033"
            >
              <h3 className="font-bold text-orange-900 mb-2 text-sm">📬 Email Updates</h3>
              <p className="text-xs text-gray-700 mb-2">
                Get notified when I write about Tim\'s latest fall or emotional breakdown.
              </p>
              <input
                type="email"
                placeholder="your@email.com"
                className="w-full px-2 py-1 text-sm border border-orange-200 rounded mb-2"
              />
              <Button
                variant="primary"
                size="sm"
                width="full"
                backgroundColor="#c85a30"
                textColor="#ffffff"
              >
                Subscribe
              </Button>
            </StyledCard>

            {/* Recent Concerns */}
            <StyledCard
              variant="default"
              padding="md"
              borderRadius="md"
              shadow="md"
              bgColor="#fef2ed"
              borderColor="#f4dfd7"
              textColor="#5c4033"
            >
              <h3 className="font-bold text-orange-900 mb-2 text-sm">⚠️ Current Concerns</h3>
              <ul className="text-xs text-orange-800 space-y-1">
                <li>• That 21.5% catch failure rate</li>
                <li>• Small Kevin\'s grip strength</li>
                <li>• Medical insurance gaps</li>
                <li>• Tim\'s dating prospects</li>
                <li>• My future as a grandmother</li>
              </ul>
            </StyledCard>

            {/* Resources */}
            <StyledCard
              variant="default"
              padding="md"
              borderRadius="md"
              shadow="md"
              bgColor="#ffffff"
              borderColor="#dcc5bb"
              textColor="#5c4033"
            >
              <h3 className="font-bold text-orange-900 mb-2 text-sm">🔗 My Other Projects</h3>
              <div className="space-y-2 text-xs">
                <div className="text-orange-800 hover:text-orange-600 cursor-pointer">
                  → Tim\'s CobFundMe Campaign
                </div>
                <div className="text-orange-800 hover:text-orange-600 cursor-pointer">
                  → My Cookie Recipes (Coming Soon)
                </div>
                <div className="text-orange-800 hover:text-orange-600 cursor-pointer">
                  → Worried Parents Anonymous (Discord)
                </div>
              </div>
            </StyledCard>

            {/* Endorsement */}
            <StyledCard
              variant="default"
              padding="md"
              borderRadius="md"
              shadow="md"
              bgColor="#fff5f0"
              borderColor="#f4dfd7"
              textColor="#5c4033"
            >
              <p className="text-xs font-bold text-orange-800 mb-1">✓ Endorsed By:</p>
              <div className="space-y-1 text-xs text-orange-700">
                <div>• Mars (The Underground Owner)</div>
                <div>• Tim\'s Therapist (Probably)</div>
                <div>• Gary (Reluctantly)</div>
                <div>• My Book Club (With Pity)</div>
              </div>
            </StyledCard>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-orange-900 to-red-900 text-orange-100 py-6 px-4 text-center text-xs mt-12 border-t-8 border-orange-300">
        <p className="mb-2">© 2025 Carol\'s Trust Fall Support Blog | www.timsmomsupport.corn</p>
        <p className="mb-2">
          Made with love, concern, and homemade cookies. No AI was used in the worry generation.
        </p>
        <p className="text-orange-200">
          If your son is also a professional trust fall performer, please reach out. We need to form a support group.
        </p>
      </footer>
    </div>
  )
}

export default TimsMomBlogSite
