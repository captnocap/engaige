/**
 * AskCorn Site - Stack Overflow / Yahoo Answers Parody
 *
 * A Q&A site where questions range from technical to unhinged.
 * Features corn kernels as reputation points and lore-integrated questions.
 *
 * URL: www.askcorn.corn
 */

import { useState, useEffect, useRef, useMemo } from 'react'
import type { SiteProps } from '../BrowserSiteContainer.js'
import { StyledCard, Button, Avatar, MetaRow } from '../../ui/shared/index.js'
import { SidebarAdWidget } from '../ads/index.js'
import { useSiteContent, useSiteCategories, type SiteContentItem, type SiteCategory } from '../../../hooks/useSiteContent.js'

// ============================================================================
// Site Theme Configuration
// ============================================================================

const SITE_THEME = {
  id: 'askcorn',
  name: 'AskCorn',
  tagline: 'Where Every Question Pops',
  url: 'www.askcorn.corn',
  icon: '🌽',
  primary: '#F48024',      // Stack Overflow orange
  secondary: '#0077CC',    // Stack Overflow blue
  background: '#f8f9f9',   // Light grey
  surface: '#ffffff',      // White
  text: '#232629',         // Near black
  textMuted: '#6a737c',    // Grey
  border: '#d6d9dc',       // Light border
  tagBg: '#e1ecf4',        // Tag background
  tagText: '#39739d',      // Tag text
  accepted: '#2f6f44',     // Accepted answer green
  closed: '#9199a1',       // Closed question grey
  gold: '#ffcc00',         // Gold badge
  silver: '#b4b8bc',       // Silver badge
  bronze: '#d1a684',       // Bronze badge
}

// ============================================================================
// Types
// ============================================================================

interface Tag {
  name: string
  count: number
}

interface Answer {
  id: string
  author: string
  authorRep: number
  content: string
  votes: number
  isAccepted: boolean
  timestamp: string
  comments?: AnswerComment[]
}

interface AnswerComment {
  author: string
  content: string
  timestamp: string
}

interface Question {
  id: string
  title: string
  content: string
  author: string
  authorRep: number
  votes: number
  views: number
  answerCount: number
  timestamp: string
  tags: string[]
  answers: Answer[]
  isClosed?: boolean
  closeReason?: string
  isDuplicate?: boolean
  duplicateOf?: string
}

interface User {
  username: string
  reputation: number
  badges: { gold: number; silver: number; bronze: number }
  about?: string
  topTags?: string[]
}

// ============================================================================
// DB-to-Local Adapters
// ============================================================================

/** Adapt a DB SiteContentItem to the local Question interface */
function dbToQuestion(item: SiteContentItem): Question {
  const m = item.metadata || {}
  // Map answers from metadata, adapting each to the local Answer interface
  const rawAnswers: any[] = m.answers || []
  const answers: Answer[] = rawAnswers.map((a: any, idx: number) => ({
    id: a.id || `${item.slug}_a${idx}`,
    author: a.author || 'anonymous',
    authorRep: a.authorRep ?? 0,
    content: a.content || '',
    votes: a.votes ?? 0,
    isAccepted: a.isAccepted ?? false,
    timestamp: a.timestamp || '',
    comments: (a.comments || []).map((c: any) => ({
      author: c.author || 'anonymous',
      content: c.content || '',
      timestamp: c.timestamp || '',
    })),
  }))

  return {
    id: item.slug,
    title: item.title,
    content: item.body || item.summary || '',
    author: m.author || 'anonymous',
    authorRep: m.authorRep ?? 0,
    votes: item.likeCount || m.votes || 0,
    views: item.viewCount || m.views || 0,
    answerCount: m.answerCount ?? answers.length,
    timestamp: m.timestamp || '',
    tags: item.tags,
    answers,
    isClosed: m.isClosed,
    closeReason: m.closeReason,
    isDuplicate: m.isDuplicate,
    duplicateOf: m.duplicateOf,
  }
}

/** Adapt a DB SiteCategory to the local Tag interface */
function dbCategoryToTag(cat: SiteCategory): Tag {
  return {
    name: cat.slug,
    count: cat.sortOrder || 0,
  }
}

/** Adapt a DB SiteContentItem (user-type content) to the local User interface */
function dbToUser(item: SiteContentItem): User {
  const m = item.metadata || {}
  return {
    username: item.slug,
    reputation: m.reputation ?? item.likeCount ?? 0,
    badges: m.badges || { gold: 0, silver: 0, bronze: 0 },
    about: item.summary || m.about || undefined,
    topTags: m.topTags || item.tags || undefined,
  }
}

// ============================================================================
// Sample Data - Questions (hardcoded fallback)
// ============================================================================

const SAMPLE_QUESTIONS: Question[] = [
  {
    id: 'q_derek_coffee',
    title: 'How do I tell my wife I spent $3000 on a quantum coffee maker?',
    content: `I need some relationship advice here. I've been researching quantum coffee for 8 months now and finally took the plunge on a QuBrew Pro 3000.

The thing is, Jennifer (my wife) doesn't believe in quantum coffee. She thinks it's "pseudoscience" and that regular coffee is "fine." She doesn't understand that the Martinez Study clearly shows improved molecular cohesion when beans are observed during the brewing process.

I used our joint savings. It was supposed to be for a vacation to see her parents but I figured this was more important for our long-term happiness. Better coffee = better mornings = better marriage, right?

She comes home tomorrow and the machine takes up most of the kitchen counter. I've already done 12 test brews and the cat seems happier, which is scientific evidence in my opinion.

How do I explain to her that this was a sound investment? I've prepared a PowerPoint but I'm not sure if that will help or hurt my case.

UPDATE: She saw my credit card statement before I could explain. She's staying at her sister's place. Mr. Whiskers and I are drinking excellent coffee though.

UPDATE 2: Jennifer wants a divorce. Still worth it. This coffee is transcendent.`,
    author: 'quantum_derek_847',
    authorRep: 847,
    votes: 2847,
    views: 84723,
    answerCount: 156,
    timestamp: '6 months ago',
    tags: ['relationship-advice', 'quantum-coffee', 'marriage', 'budgeting'],
    answers: [
      {
        id: 'a1_derek',
        author: 'jennifer_was_right',
        authorRep: 12453,
        content: `I cannot stress this enough: **You cannot explain this because it was not a sound investment.**

You spent $3,000 of joint savings on a coffee maker without discussing it with your partner. The fact that it's a quantum coffee maker is almost irrelevant - the issue is you made a major financial decision unilaterally.

That said, I own a QuBrew Pro 3000 and it's fantastic. The molecular cohesion really is noticeable. But I discussed it with my partner first like a functional adult.`,
        votes: 4521,
        isAccepted: false,
        timestamp: '6 months ago',
        comments: [
          { author: 'quantum_derek_847', content: 'She doesn\'t understand science though', timestamp: '6 months ago' },
          { author: 'jennifer_was_right', content: 'Neither do you, my guy. Neither do you.', timestamp: '6 months ago' },
        ],
      },
      {
        id: 'a2_derek',
        author: 'MartinezStudyCited',
        authorRep: 8934,
        content: `The Martinez Study you're citing was preliminary and has not been replicated. I say this as someone who worked in Dr. Martinez's lab.

Also, your cat seeming happier is not scientific evidence. Your cat cannot observe the quantum state.

Your marriage problems are not a coffee problem. They are a you problem.`,
        votes: 3892,
        isAccepted: false,
        timestamp: '6 months ago',
      },
      {
        id: 'a3_derek',
        author: 'quantum_defender_99',
        authorRep: 567,
        content: `Ignore the haters. Quantum coffee is real, Jennifer was holding you back, and Mr. Whiskers knows the truth.

I've been divorced twice over quantum coffee purchases and I regret nothing.`,
        votes: -234,
        isAccepted: true,
        timestamp: '6 months ago',
        comments: [
          { author: 'concerned_moderator', content: 'This should not be the accepted answer', timestamp: '6 months ago' },
          { author: 'quantum_derek_847', content: 'Finally someone who gets it', timestamp: '6 months ago' },
        ],
      },
    ],
  },
  {
    id: 'q_hartwell_floor',
    title: 'Why does my building skip floor 13?',
    content: `I just moved into the Hartwell Building downtown. Great rent, beautiful architecture, very spacious units. But I noticed something weird when I was in the elevator:

The floors go 11, 12, 14, 15...

There's no 13th floor button. I assumed this was a superstition thing - lots of old buildings skip 13. But then I found some old photographs from 1952 and the building clearly has 13 floors in the pictures.

I asked the building manager and he just said "there is no 13th floor" in this really flat voice and walked away.

I tried to find the stairwell to floor 13 but the door between 12 and 14 is welded shut. Not locked. Welded.

Also my neighbor on floor 7 says I shouldn't look at the mirrors for too long. What does that mean??

The rent is really cheap though so I'm not sure if I should be concerned or just enjoy the deal.`,
    author: 'new_tenant_confused',
    authorRep: 134,
    votes: 1847,
    views: 34129,
    answerCount: 89,
    timestamp: '3 months ago',
    tags: ['hartwell-building', 'architecture', 'real-estate', 'unexplained'],
    answers: [
      {
        id: 'a1_hartwell',
        author: 'omnicorp_official',
        authorRep: 1,
        content: `The Hartwell Building has always had 12 floors. The photographs you found must be doctored. There is nothing unusual about the building. Please do not investigate further.

The mirrors are normal mirrors.

Your rent is correct.

Have a pleasant day.`,
        votes: -847,
        isAccepted: false,
        timestamp: '3 months ago',
        comments: [
          { author: 'new_tenant_confused', content: 'Who are you and how did you find this post so fast?', timestamp: '3 months ago' },
          { author: 'definitely_not_omnicorp', content: 'Do not ask questions about Omnicorp Holdings.', timestamp: '3 months ago' },
        ],
      },
      {
        id: 'a2_hartwell',
        author: 'hartwell_researcher',
        authorRep: 8472,
        content: `Oh boy, you moved into THAT building.

Let me break it down:
- **1923**: Magnus Hartwell builds the building with 13 floors
- **1931**: Magnus disappears. Body never found. Building sold.
- **1952**: Photos clearly show 13 floors
- **1967**: UFO sighting above building (officially "weather balloon")
- **1984**: Floor 7 "renovated." 13th floor no longer accessible.
- **Present**: Omnicorp Holdings owns it through 7 shell companies

The mirrors on floor 7 allegedly show things that aren't there. Multiple tenants have reported seeing a figure in formal 1920s attire. The figure is always facing away.

My advice: don't look at the mirrors after midnight, don't take the stairs between 12 and 14, and if you hear static that sounds like it's breathing, that's normal.

Also check out www.hartwellfiles.corn for more info. We have a whole community.`,
        votes: 3421,
        isAccepted: true,
        timestamp: '3 months ago',
        comments: [
          { author: 'new_tenant_confused', content: 'This is not reassuring', timestamp: '3 months ago' },
          { author: 'floor_7_resident', content: 'The mirrors are fine. Everything is fine. I am fine.', timestamp: '3 months ago' },
        ],
      },
    ],
  },
  {
    id: 'q_trustfall_roommate',
    title: 'Is it normal for my roommate to practice trust falls alone?',
    content: `My roommate (let's call him "Tim") has been doing this thing for the past 3 months where he stands in the living room, announces "TRUST FALL," and then just... falls backwards.

He does this whether anyone is there to catch him or not. I've seen him do it at least 2,847 times now. Sometimes I catch him, sometimes I don't. He seems equally happy either way.

He's started doing it at parties too. He just walks up to strangers, yells "TRUST FALL," and falls. Some people catch him, some don't. He has a spreadsheet tracking his "catch rate" (currently 78.5%).

Last week he fell at a concert (at The Underground) and the venue owner caught him one-handed while holding a beer. Tim said it was "the best fall of his life."

Is this normal? Should I be concerned? He seems really happy but also has a lot of bruises.`,
    author: 'concerned_roommate_24',
    authorRep: 567,
    votes: 5621,
    views: 847291,
    answerCount: 342,
    timestamp: '8 months ago',
    tags: ['trust-falls', 'roommates', 'lifestyle', 'the-underground'],
    answers: [
      {
        id: 'a1_trustfall',
        author: 'TrustFallTim',
        authorRep: 28471,
        content: `Hey, it's me! Your roommate! I found your post!

First off, I'm not "practicing" - I'm LIVING. Every fall is an authentic expression of human vulnerability and connection.

Second, my catch rate is actually 78.6% now. I had a good week.

Third, you're a great roommate. You've caught me 847 times and only missed 12. That's elite catching.

The Underground incident was indeed the best fall of my life. Mars is a legend among catchers. One hand!

To answer your question: yes, this is normal. For me. Everyone's normal is different. My normal just involves more falling.

P.S. - I'm going to do a trust fall in 30 seconds. Please be ready.`,
        votes: 12453,
        isAccepted: true,
        timestamp: '8 months ago',
        comments: [
          { author: 'concerned_roommate_24', content: 'TIM WHAT THE HECK', timestamp: '8 months ago' },
          { author: 'MarsTheUnderground', content: 'I did catch him one-handed. Can confirm.', timestamp: '8 months ago' },
          { author: 'big_kevin_catcher', content: 'Tim you\'re an inspiration', timestamp: '8 months ago' },
        ],
      },
      {
        id: 'a2_trustfall',
        author: 'small_kevin_reformed',
        authorRep: 23,
        content: `Please tell Tim I'm sorry about The Incident. I've been practicing my catching form. I'm ready for another chance.`,
        votes: -156,
        isAccepted: false,
        timestamp: '8 months ago',
        comments: [
          { author: 'TrustFallTim', content: 'Not yet, Kevin. Not yet.', timestamp: '8 months ago' },
        ],
      },
    ],
  },
  {
    id: 'q_cobcoin',
    title: 'How to convert CobCoin to real money?',
    content: `I invested my life savings into CobCoin last year because my cousin said it was "the corn-based cryptocurrency revolution." He showed me a whitepaper about how blockchain technology could revolutionize the corn supply chain.

I now have 847,000 CobCoin but I can't find any exchange that will accept them. The CobCoin website just says "Coming Soon" and has for 14 months.

My cousin says to "HODL" but I need to pay rent. Is there any way to convert this to actual money?

Also the "CobWallet" app keeps sending me notifications about "staking opportunities" but when I click them it just shows a picture of a corn cob wearing sunglasses.`,
    author: 'invested_in_corn',
    authorRep: 12,
    votes: 892,
    views: 23456,
    answerCount: 67,
    timestamp: '2 months ago',
    tags: ['crypto', 'scam', 'cobcoin', 'help'],
    isClosed: true,
    closeReason: 'Duplicate',
    isDuplicate: true,
    duplicateOf: 'q_cobcoin_original',
    answers: [
      {
        id: 'a1_cobcoin',
        author: 'crypto_skeptic',
        authorRep: 9823,
        content: `I'm sorry to tell you this, but CobCoin is not a real cryptocurrency. It was a scam that made the rounds last year.

The whitepaper you mentioned was literally copy-pasted from the Bitcoin whitepaper with "Bitcoin" replaced with "Corn" and "blockchain" replaced with "cornchain."

Your cousin either also got scammed or was in on it. Either way, those 847,000 CobCoin are worth exactly $0.

The corn cob with sunglasses is named "Chad Cob" and he is the mascot of your lost money.`,
        votes: 2341,
        isAccepted: false,
        timestamp: '2 months ago',
      },
    ],
  },
  {
    id: 'q_corn_sentience',
    title: 'Can corn develop sentience?',
    content: `This is a serious philosophical and scientific question. Given that:

1. Corn has been selectively bred by humans for thousands of years
2. Some plants demonstrate forms of chemical communication
3. Quantum coffee suggests that observation affects matter
4. The corn lobby seems suspiciously powerful

Is it possible that corn has or could develop sentience? And if so, what are the ethical implications of eating it?

I've been staring at a cob of corn for 3 hours and I swear it moved.`,
    author: 'corn_philosopher_99',
    authorRep: 45,
    votes: -156,
    views: 8472,
    answerCount: 23,
    timestamp: '1 month ago',
    tags: ['corn', 'philosophy', 'sentience', 'ethics'],
    isClosed: true,
    closeReason: 'Off-topic: This question is not about a practical, answerable problem.',
    answers: [
      {
        id: 'a1_corn',
        author: 'actual_botanist',
        authorRep: 15672,
        content: `No. Corn cannot develop sentience. Plants do not have nervous systems. The "chemical communication" you're referring to is a stress response, not thought.

Quantum coffee has nothing to do with this. The observation effect in quantum mechanics applies to subatomic particles, not corn.

The corn lobby is powerful because corn is a massive agricultural commodity, not because corn is secretly intelligent.

Please seek help. 3 hours of staring at corn is concerning behavior.`,
        votes: 4521,
        isAccepted: false,
        timestamp: '1 month ago',
        comments: [
          { author: 'corn_philosopher_99', content: 'That\'s what the corn wants you to think', timestamp: '1 month ago' },
          { author: 'graintruth_editor', content: 'Actually there\'s a lot of evidence that... [comment removed by moderator]', timestamp: '1 month ago' },
        ],
      },
    ],
  },
  {
    id: 'q_coworker_time',
    title: 'My coworker disappeared for 3 days and claims only 5 minutes passed',
    content: `I work in an office on floor 7 of a building downtown (I'd rather not say which one). My coworker Dave went to use the bathroom on Tuesday at 2:15 PM.

He came back on Friday at 2:20 PM.

From his perspective, he walked to the bathroom, used it, washed his hands, and walked back. He says it took about 5 minutes. But for the rest of us, 3 days had passed. We filed a missing persons report. His wife was devastated.

Dave has no memory of the gap. His phone still shows Tuesday's date. His lunch was still warm.

HR is not being helpful. They said this "happens sometimes" and asked us to fill out incident report form 847-B. The form has a checkbox for "temporal displacement" which seems very specific.

Has anyone else experienced this? What should we do?

EDIT: I'm not supposed to mention the mirrors but Dave says when he was in the bathroom he thought his reflection moved "wrong." He's refusing to elaborate.`,
    author: 'concerned_coworker_f7',
    authorRep: 234,
    votes: 3892,
    views: 67234,
    answerCount: 145,
    timestamp: '2 weeks ago',
    tags: ['hartwell-building', 'hr', 'workplace', 'time-anomaly'],
    answers: [
      {
        id: 'a1_time',
        author: 'former_floor7_employee',
        authorRep: 4521,
        content: `You work on floor 7 of the Hartwell Building. I don't even need you to confirm it.

This is documented. It happens about once every 2-3 months. The building management knows. HR knows. Omnicorp knows.

Here's what you need to do:
1. Fill out form 847-B completely and accurately
2. Do NOT look at any mirrors on that floor for at least a week
3. Dave should drink quantum coffee - for some reason it seems to help stabilize temporal discrepancies
4. If Dave starts speaking in a language he doesn't know, contact the building immediately
5. Most importantly: do not discuss this outside of work

Dave will be fine. Probably. Most people who experience temporal displacement recover fully. The ones who don't are... well, you don't need to worry about that.

The reflection moving "wrong" is concerning but not unusual. Tell Dave to avoid mirrors entirely for now.`,
        votes: 5823,
        isAccepted: true,
        timestamp: '2 weeks ago',
        comments: [
          { author: 'concerned_coworker_f7', content: 'This is terrifying but also somehow reassuring?', timestamp: '2 weeks ago' },
          { author: 'omnicorp_official', content: 'This post contains misinformation. Please disregard.', timestamp: '2 weeks ago' },
          { author: 'definitely_not_dave', content: 'I feel fine. The mirrors are fine. Floor 7 is fine.', timestamp: '2 weeks ago' },
        ],
      },
    ],
  },
  {
    id: 'q_trustfall_catching',
    title: 'Best practices for catching someone 2,847 times?',
    content: `I've become the designated catcher for a local trust fall enthusiast (you might know him - he's kind of famous in the downtown scene). Over the past 2 years, I've successfully caught him 2,847 times with only a handful of misses.

My question is about technique optimization. I've developed what I call the "Reliable Kevin Stance":
- Feet shoulder-width apart
- Knees slightly bent
- Arms ready at chest height
- Core engaged

But after 2,847 catches, I'm starting to feel some strain in my lower back. Are there any exercises or modifications I should consider?

Also, he's started doing surprise trust falls where he doesn't announce himself. Any tips for staying ready 24/7?

For context: the falls happen at various locations but most commonly at The Underground (great venue, questionable acoustics). The venue owner Mars is also an elite catcher - he once caught the guy one-handed while holding a full beer. I aspire to that level.`,
    author: 'BigKevin_Catcher',
    authorRep: 8472,
    votes: 4892,
    views: 56721,
    answerCount: 89,
    timestamp: '4 months ago',
    tags: ['trust-falls', 'exercise', 'technique', 'the-underground'],
    answers: [
      {
        id: 'a1_catching',
        author: 'TrustFallTim',
        authorRep: 28471,
        content: `Kevin! My favorite catcher! Let me address your concerns:

**On the "Reliable Kevin Stance"**: It's beautiful. It's textbook. I feel safe every time I fall into your arms. However, I've noticed you've been favoring your left side lately. Consider switching your lead foot occasionally to distribute the load.

**On lower back strain**: I recommend deadlifts and core strengthening. Also, I'll try to angle my falls to reduce impact on your lower back. This is a partnership.

**On surprise falls**: The secret is to always be ready. I do this by never fully relaxing. You should too. Trust can happen at any moment.

**On Mars**: He is the GOAT of catchers. I've been trying to get him to drop something during a catch but his grip strength is inhuman. The one-handed beer catch is my most treasured fall memory.

Thank you for your service, Kevin. You're one of the good ones.

P.S. - Small Kevin, if you're reading this, you're still not forgiven for The Incident. March 2022. 6-foot drop. Concussion. I haven't forgotten.`,
        votes: 8934,
        isAccepted: true,
        timestamp: '4 months ago',
        comments: [
          { author: 'BigKevin_Catcher', content: 'This is genuinely helpful, thank you Tim', timestamp: '4 months ago' },
          { author: 'small_kevin_reformed', content: 'It was one time...', timestamp: '4 months ago' },
          { author: 'MarsTheUnderground', content: 'The grip strength comes from years of changing kegs. Also, Tim, you\'re falling tonight at 9pm. Be there.', timestamp: '4 months ago' },
        ],
      },
      {
        id: 'a2_catching',
        author: 'sports_medicine_doc',
        authorRep: 12453,
        content: `I'm a sports medicine doctor and I have questions.

2,847 catches is... a lot. The forces involved in repeatedly catching a falling adult are significant. I'd recommend:

1. **Core exercises**: Planks, dead bugs, bird dogs
2. **Hip strengthening**: Squats, lunges, hip hinges
3. **Upper back work**: Rows, face pulls
4. **Regular stretching**: Hip flexors especially

Also please see a physical therapist. This is not a normal amount of catching.`,
        votes: 3421,
        isAccepted: false,
        timestamp: '4 months ago',
      },
    ],
  },
  {
    id: 'q_quantum_side_effects',
    title: 'Is it normal to see my future self in quantum coffee reflections?',
    content: `I've been drinking quantum coffee daily for about 4 months now (QuBrew Pro 3000, properly calibrated, observing for full 45 minutes).

Starting about 2 weeks ago, when I look at the surface of the coffee before drinking, I sometimes see... myself? But older. And doing things I haven't done yet.

Last week I saw myself getting a promotion at work. Then I got the promotion on Friday.

Yesterday I saw myself crying at what looked like a funeral. I don't know whose funeral.

Is this a known side effect of quantum coffee? I checked the Martinez Study but it doesn't mention anything about temporal precognition.

I should also mention I live in the Hartwell Building (floor 3, not floor 7). Could that be related?`,
    author: 'quantum_seer_confused',
    authorRep: 567,
    votes: 1892,
    views: 34521,
    answerCount: 78,
    timestamp: '1 week ago',
    tags: ['quantum-coffee', 'side-effects', 'hartwell-building', 'precognition'],
    answers: [
      {
        id: 'a1_vision',
        author: 'quantum_derek_847',
        authorRep: 847,
        content: `Welcome to the club.

Yes, this happens. No, the Martinez Study doesn't cover it because Dr. Martinez refuses to acknowledge it. I've emailed her 847 times about this phenomenon.

My theory: the quantum observation process creates a localized field of probability awareness. Your consciousness, focused on the coffee, briefly accesses adjacent timeline information. It's not precognition - it's probability perception.

The Hartwell Building location is definitely relevant. That building has... unusual properties that may amplify the effect.

As for the funeral vision - I saw something similar before my cat Mr. Whiskers got sick. He recovered, but only after I changed his diet based on what I saw. So consider it a warning, not a certainty.

Check out my blog at www.quantumbrewblog.corn for more information on this and other quantum coffee phenomena.

Also, your QuBrew Pro 3000 is a solid choice. Worth every penny of the divorce.`,
        votes: 2341,
        isAccepted: false,
        timestamp: '1 week ago',
        comments: [
          { author: 'quantum_seer_confused', content: 'This is both helpful and concerning', timestamp: '1 week ago' },
          { author: 'dr_martinez_official', content: 'I have never received 847 emails from this person. Also this is not how quantum mechanics works.', timestamp: '1 week ago' },
          { author: 'quantum_derek_847', content: 'Check your spam folder, Elena', timestamp: '1 week ago' },
        ],
      },
    ],
  },
]

// Additional questions for the list view (hardcoded fallback)
const ADDITIONAL_QUESTIONS: Partial<Question>[] = [
  {
    id: 'q_velvet_algorithms',
    title: 'Why did Velvet Algorithms cancel their show for "existential reasons"?',
    votes: 423,
    answerCount: 87,
    views: 12453,
    tags: ['velvet-algorithms', 'concerts', 'the-underground'],
    timestamp: '3 weeks ago',
  },
  {
    id: 'q_neon_requiem_reunion',
    title: 'Will Neon Requiem ever reunite? Their final show changed my life',
    votes: 1234,
    answerCount: 234,
    views: 45672,
    tags: ['neon-requiem', 'concerts', 'reunion'],
    timestamp: '2 months ago',
  },
  {
    id: 'q_quantumil',
    title: 'Has anyone else experienced "recursive existence anxiety" from QUANTUMIL?',
    votes: 567,
    answerCount: 89,
    views: 23451,
    tags: ['quantum-coffee', 'medication', 'side-effects'],
    timestamp: '5 days ago',
  },
  {
    id: 'q_gas_station_sushi',
    title: 'Is Flying J #847 really the best gas station sushi? Planning a pilgrimage',
    votes: 892,
    answerCount: 156,
    views: 34521,
    tags: ['food', 'travel', 'gas-station-sushi'],
    timestamp: '1 month ago',
  },
  {
    id: 'q_corn_allergy',
    title: 'Can you be allergic to quantum-observed corn specifically?',
    votes: 234,
    answerCount: 45,
    views: 8923,
    tags: ['corn-allergy', 'quantum-coffee', 'medical'],
    timestamp: '2 weeks ago',
  },
]

// ============================================================================
// Sample Data - Tags (hardcoded fallback)
// ============================================================================

const POPULAR_TAGS_FALLBACK: Tag[] = [
  { name: 'quantum-coffee', count: 8472 },
  { name: 'hartwell-building', count: 3421 },
  { name: 'trust-falls', count: 2847 },
  { name: 'relationship-advice', count: 15672 },
  { name: 'corn-allergy', count: 1234 },
  { name: 'the-underground', count: 892 },
  { name: 'crypto', count: 4521 },
  { name: 'scam', count: 3892 },
]

// ============================================================================
// Sample Data - Users (hardcoded fallback)
// ============================================================================

const SAMPLE_USERS_FALLBACK: Record<string, User> = {
  'quantum_derek_847': {
    username: 'quantum_derek_847',
    reputation: 847,
    badges: { gold: 0, silver: 8, bronze: 47 },
    about: 'IT consultant (between contracts). Quantum coffee enthusiast. Divorced. My cat Mr. Whiskers understands me.',
    topTags: ['quantum-coffee', 'relationship-advice', 'hartwell-building'],
  },
  'TrustFallTim': {
    username: 'TrustFallTim',
    reputation: 28471,
    badges: { gold: 2, silver: 84, bronze: 7 },
    about: 'Professional trust faller. 2,847 documented falls. 78.5% catch rate. The Incident was not my fault.',
    topTags: ['trust-falls', 'exercise', 'the-underground'],
  },
  'hartwell_researcher': {
    username: 'hartwell_researcher',
    reputation: 8472,
    badges: { gold: 1, silver: 23, bronze: 56 },
    about: 'Documenting the truth about the Hartwell Building since 2019. The mirrors are doors.',
    topTags: ['hartwell-building', 'unexplained', 'omnicorp'],
  },
}

// ============================================================================
// Hot Network Questions (Sidebar) - always hardcoded
// ============================================================================

const HOT_NETWORK_QUESTIONS = [
  { title: 'Why does my quantum-brewed coffee taste like regret?', site: 'cooking.askcorn', votes: 156 },
  { title: 'Is it legal to marry a building? Asking for research purposes', site: 'law.askcorn', votes: 234 },
  { title: 'How to explain to my parents I\'m a professional trust faller?', site: 'parenting.askcorn', votes: 892 },
  { title: 'My AI assistant started speaking in tongues after visiting floor 7', site: 'tech.askcorn', votes: 1234 },
  { title: 'Can cats observe quantum states? My cat says yes', site: 'pets.askcorn', votes: 567 },
  { title: 'Recovering from a 6-foot trust fall drop: AMA', site: 'health.askcorn', votes: 847 },
]

// ============================================================================
// Components
// ============================================================================

export function AskCornSite({ siteId, path, onNavigate, onPathChange }: SiteProps) {
  // Fetch from DB with fallback to hardcoded data
  const { content: dbContent } = useSiteContent('askcorn')
  const { content: dbUserContent } = useSiteContent('askcorn', { contentType: 'user' })
  const { categories: dbCategories } = useSiteCategories('askcorn')

  // Derive questions from DB content, falling back to hardcoded data
  const questions = useMemo(() => {
    // Filter to only question-type content (exclude user-type)
    const questionContent = dbContent.filter(item => item.contentType !== 'user')
    if (questionContent.length > 0) return questionContent.map(dbToQuestion)
    return SAMPLE_QUESTIONS
  }, [dbContent])

  // Derive additional questions stub list for the combined listing
  const additionalQuestions = useMemo((): Partial<Question>[] => {
    // When DB content is available, all questions are in `questions` already
    if (dbContent.filter(item => item.contentType !== 'user').length > 0) return []
    return ADDITIONAL_QUESTIONS
  }, [dbContent])

  // Derive tags from DB categories, falling back to hardcoded data
  const popularTags = useMemo(() => {
    if (dbCategories.length > 0) return dbCategories.map(dbCategoryToTag)
    return POPULAR_TAGS_FALLBACK
  }, [dbCategories])

  // Derive users from DB user-type content, falling back to hardcoded data
  const sampleUsers = useMemo((): Record<string, User> => {
    if (dbUserContent.length > 0) {
      const map: Record<string, User> = {}
      for (const item of dbUserContent) {
        const user = dbToUser(item)
        map[user.username] = user
      }
      return map
    }
    return SAMPLE_USERS_FALLBACK
  }, [dbUserContent])

  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'questions' | 'tags' | 'users'>('questions')
  const [userVotes, setUserVotes] = useState<Record<string, number>>({})

  // Track if we're updating from path
  const isUpdatingFromPath = useRef(false)

  // Parse path and update state when path changes
  useEffect(() => {
    isUpdatingFromPath.current = true

    if (!path || path === '/') {
      // Homepage - clear all selections
      setSelectedQuestion(null)
      setSelectedUser(null)
      setSelectedTag(null)
    } else if (path.startsWith('/question/')) {
      // Question detail view: /question/question-id
      const questionId = path.slice('/question/'.length)
      const question = questions.find(q => q.id === questionId)
      if (question) {
        setSelectedQuestion(question)
        setSelectedUser(null)
        setSelectedTag(null)
      }
    } else if (path.startsWith('/user/')) {
      // User profile view: /user/username
      const username = path.slice('/user/'.length)
      const user = sampleUsers[username]
      if (user) {
        setSelectedUser(user)
        setSelectedQuestion(null)
        setSelectedTag(null)
      }
    } else if (path.startsWith('/tag/')) {
      // Tag filter view: /tag/tagname
      const tagName = path.slice('/tag/'.length)
      setSelectedTag(tagName)
      setSelectedQuestion(null)
      setSelectedUser(null)
      setActiveTab('questions')
    }

    setTimeout(() => {
      isUpdatingFromPath.current = false
    }, 0)
  }, [path, questions, sampleUsers])

  // Navigation handlers
  const handleSelectQuestion = (question: Question) => {
    // Find full question data
    const fullQuestion = questions.find(q => q.id === question.id)
    if (fullQuestion) {
      setSelectedQuestion(fullQuestion)
      setSelectedUser(null)
      setSelectedTag(null)
      onPathChange('/question/' + question.id)
    }
  }

  const handleSelectUser = (username: string) => {
    const user = sampleUsers[username]
    if (user) {
      setSelectedUser(user)
      setSelectedQuestion(null)
      setSelectedTag(null)
      onPathChange('/user/' + username)
    }
  }

  const handleSelectTag = (tagName: string) => {
    setSelectedTag(tagName)
    setSelectedQuestion(null)
    setSelectedUser(null)
    setActiveTab('questions')
    onPathChange('/tag/' + tagName)
  }

  const handleBackToHome = () => {
    setSelectedQuestion(null)
    setSelectedUser(null)
    setSelectedTag(null)
    onPathChange(null)
  }

  const handleVote = (id: string, direction: 1 | -1) => {
    setUserVotes(prev => ({
      ...prev,
      [id]: prev[id] === direction ? 0 : direction,
    }))
  }

  // Combine full questions with additional question stubs for listing
  const allQuestionsForList = useMemo(() => [
    ...questions,
    ...additionalQuestions.map(q => ({
      ...q,
      author: 'anonymous_user',
      authorRep: Math.floor(Math.random() * 1000),
      content: '',
      answers: [],
    } as Question)),
  ], [questions, additionalQuestions])

  // Filter questions by selected tag if applicable
  const filteredQuestions = selectedTag
    ? allQuestionsForList.filter(q => q.tags.includes(selectedTag))
    : allQuestionsForList

  return (
    <div className="min-h-full" style={{ background: SITE_THEME.background }}>
      {/* Header */}
      <header
        className="sticky top-0 z-10"
        style={{ background: SITE_THEME.surface, borderBottom: `1px solid ${SITE_THEME.border}`, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
      >
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center h-12 gap-4">
            {/* Logo */}
            <button
              onClick={handleBackToHome}
              className="flex items-center gap-2 hover:opacity-80 shrink-0"
            >
              <span className="text-2xl">{SITE_THEME.icon}</span>
              <span className="text-xl font-bold" style={{ color: SITE_THEME.text }}>
                ask<span style={{ color: SITE_THEME.primary }}>corn</span>
              </span>
            </button>

            {/* Navigation */}
            <nav className="flex items-center gap-1 ml-4">
              {(['questions', 'tags', 'users'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab)
                    handleBackToHome()
                  }}
                  className="px-3 py-1.5 text-sm rounded hover:bg-gray-100 transition-colors"
                  style={{
                    color: activeTab === tab ? SITE_THEME.primary : SITE_THEME.textMuted,
                    fontWeight: activeTab === tab ? 600 : 400,
                  }}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>

            {/* Search */}
            <div className="flex-1 max-w-xl ml-4">
              <input
                type="text"
                placeholder="Search questions..."
                className="w-full px-3 py-1.5 text-sm rounded"
                style={{
                  background: SITE_THEME.background,
                  border: `1px solid ${SITE_THEME.border}`,
                  color: SITE_THEME.text,
                }}
              />
            </div>

            {/* User */}
            <div className="flex items-center gap-2 ml-4">
              <Button
                variant="primary"
                size="sm"
                backgroundColor={SITE_THEME.primary}
                textColor="white"
              >
                Log In
              </Button>
              <Button
                variant="secondary"
                size="sm"
                backgroundColor={SITE_THEME.secondary}
                textColor="white"
              >
                Sign Up
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex gap-6">
          {/* Left Sidebar */}
          <aside className="w-40 shrink-0 hidden lg:block">
            <nav className="space-y-1">
              <SidebarLink label="Home" isActive icon="🏠" onClick={handleBackToHome} />
              <SidebarLink label="Questions" icon="❓" onClick={() => setActiveTab('questions')} />
              <SidebarLink label="Tags" icon="🏷️" onClick={() => setActiveTab('tags')} />
              <SidebarLink label="Users" icon="👥" onClick={() => setActiveTab('users')} />
              <div className="pt-4 pb-2">
                <span className="text-xs font-semibold uppercase" style={{ color: SITE_THEME.textMuted }}>
                  Collectives
                </span>
              </div>
              <SidebarLink label="Quantum Coffee" icon="☕" />
              <SidebarLink label="Hartwell Research" icon="🏚️" />
              <SidebarLink label="Trust Fall Network" icon="🙆‍♂️" />
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {selectedQuestion ? (
              <QuestionDetail
                question={selectedQuestion}
                onBack={handleBackToHome}
                userVotes={userVotes}
                onVote={handleVote}
                onSelectUser={handleSelectUser}
                onSelectTag={handleSelectTag}
              />
            ) : selectedUser ? (
              <UserProfile
                user={selectedUser}
                questions={questions}
                onBack={handleBackToHome}
                onSelectQuestion={handleSelectQuestion}
              />
            ) : selectedTag ? (
              <TagFilterView
                tagName={selectedTag}
                questions={filteredQuestions}
                popularTags={popularTags}
                onBack={handleBackToHome}
                onSelectQuestion={handleSelectQuestion}
                userVotes={userVotes}
                onVote={handleVote}
              />
            ) : activeTab === 'tags' ? (
              <TagsList tags={popularTags} onSelectTag={handleSelectTag} />
            ) : activeTab === 'users' ? (
              <UsersList users={Object.values(sampleUsers)} onSelectUser={handleSelectUser} />
            ) : (
              <QuestionsList
                questions={filteredQuestions}
                onSelectQuestion={handleSelectQuestion}
                userVotes={userVotes}
                onVote={handleVote}
                onSelectTag={handleSelectTag}
              />
            )}
          </main>

          {/* Right Sidebar */}
          <aside className="w-72 shrink-0 space-y-4 hidden md:block">
            {/* Hot Network Questions */}
            <StyledCard
              bgColor={SITE_THEME.surface}
              borderColor={SITE_THEME.border}
              padding="0"
              borderRadius="sm"
              shadow="sm"
              className="overflow-hidden"
            >
              <div
                className="px-3 py-2 text-sm font-semibold"
                style={{ background: SITE_THEME.tagBg, color: SITE_THEME.text }}
              >
                Hot Network Questions
              </div>
              <div className="divide-y" style={{ borderColor: SITE_THEME.border }}>
                {HOT_NETWORK_QUESTIONS.map((q, i) => (
                  <button
                    key={i}
                    className="w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors"
                  >
                    <p className="text-xs mb-1" style={{ color: SITE_THEME.secondary }}>
                      {q.site}
                    </p>
                    <p className="text-sm leading-snug" style={{ color: SITE_THEME.secondary }}>
                      {q.title}
                    </p>
                  </button>
                ))}
              </div>
            </StyledCard>

            {/* Popular Tags */}
            <StyledCard
              bgColor={SITE_THEME.surface}
              borderColor={SITE_THEME.border}
              padding="md"
              borderRadius="sm"
              shadow="sm"
            >
              <h3 className="text-sm font-semibold mb-3" style={{ color: SITE_THEME.text }}>
                Popular Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {popularTags.slice(0, 6).map((tag) => (
                  <TagBadge key={tag.name} name={tag.name} count={tag.count} onClick={() => handleSelectTag(tag.name)} />
                ))}
              </div>
            </StyledCard>

            {/* Ad Widget */}
            <SidebarAdWidget
              siteId="askcorn"
              onNavigate={onNavigate}
              title="Sponsored"
              count={1}
            />
          </aside>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Sidebar Link Component
// ============================================================================

interface SidebarLinkProps {
  label: string
  icon?: string
  isActive?: boolean
  onClick?: () => void
}

function SidebarLink({ label, icon, isActive, onClick }: SidebarLinkProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2 px-3 py-1.5 text-sm rounded transition-colors"
      style={{
        background: isActive ? SITE_THEME.tagBg : 'transparent',
        color: isActive ? SITE_THEME.text : SITE_THEME.textMuted,
        fontWeight: isActive ? 600 : 400,
      }}
    >
      {icon && <span>{icon}</span>}
      {label}
    </button>
  )
}

// ============================================================================
// Tag Badge Component
// ============================================================================

interface TagBadgeProps {
  name: string
  count?: number
  size?: 'sm' | 'md'
  onClick?: () => void
}

function TagBadge({ name, count, size = 'sm', onClick }: TagBadgeProps) {
  const baseClasses = `inline-flex items-center gap-1 rounded ${size === 'sm' ? 'px-1.5 py-0.5 text-xs' : 'px-2 py-1 text-sm'}`
  const clickableClasses = onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className={`${baseClasses} ${clickableClasses}`}
        style={{ background: SITE_THEME.tagBg, color: SITE_THEME.tagText }}
      >
        {name}
        {count !== undefined && (
          <span style={{ color: SITE_THEME.textMuted }}>x{count.toLocaleString()}</span>
        )}
      </button>
    )
  }

  return (
    <span
      className={baseClasses}
      style={{ background: SITE_THEME.tagBg, color: SITE_THEME.tagText }}
    >
      {name}
      {count !== undefined && (
        <span style={{ color: SITE_THEME.textMuted }}>x{count.toLocaleString()}</span>
      )}
    </span>
  )
}

// ============================================================================
// Questions List Component
// ============================================================================

interface QuestionsListProps {
  questions: Question[]
  onSelectQuestion: (question: Question) => void
  userVotes: Record<string, number>
  onVote: (id: string, direction: 1 | -1) => void
  onSelectTag?: (tagName: string) => void
}

function QuestionsList({ questions, onSelectQuestion, userVotes, onVote, onSelectTag }: QuestionsListProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl" style={{ color: SITE_THEME.text }}>All Questions</h1>
        <Button
          variant="primary"
          size="sm"
          backgroundColor={SITE_THEME.secondary}
          textColor="white"
        >
          Ask Question
        </Button>
      </div>

      <div className="flex items-center gap-2 mb-4 pb-2" style={{ borderBottom: `1px solid ${SITE_THEME.border}` }}>
        <span className="text-sm" style={{ color: SITE_THEME.textMuted }}>
          {questions.length.toLocaleString()} questions
        </span>
        <div className="flex-1" />
        <div className="flex gap-1">
          {['Newest', 'Active', 'Unanswered'].map((filter) => (
            <button
              key={filter}
              className="px-3 py-1 text-sm rounded"
              style={{
                background: filter === 'Newest' ? SITE_THEME.primary : 'transparent',
                color: filter === 'Newest' ? 'white' : SITE_THEME.textMuted,
              }}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="divide-y" style={{ borderColor: SITE_THEME.border }}>
        {questions.map((question) => (
          <QuestionRow
            key={question.id}
            question={question}
            onClick={() => onSelectQuestion(question)}
            userVote={userVotes[question.id] || 0}
            onVote={(dir) => onVote(question.id, dir)}
            onSelectTag={onSelectTag}
          />
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// Question Row Component
// ============================================================================

interface QuestionRowProps {
  question: Question
  onClick: () => void
  userVote: number
  onVote: (direction: 1 | -1) => void
  onSelectTag?: (tagName: string) => void
}

function QuestionRow({ question, onClick, userVote, onVote, onSelectTag }: QuestionRowProps) {
  const displayVotes = question.votes + userVote

  return (
    <div className="py-4 flex gap-4">
      {/* Stats */}
      <div className="w-24 shrink-0 text-right space-y-1">
        <div
          className="text-sm"
          style={{ color: userVote !== 0 ? SITE_THEME.primary : SITE_THEME.text }}
        >
          <span className="font-semibold">{displayVotes.toLocaleString()}</span>
          <span className="ml-1" style={{ color: SITE_THEME.textMuted }}>votes</span>
        </div>
        <div
          className="text-sm px-2 py-0.5 rounded"
          style={{
            background: question.answerCount > 0 && question.answers?.some(a => a.isAccepted)
              ? SITE_THEME.accepted
              : question.answerCount > 0 ? SITE_THEME.tagBg : 'transparent',
            color: question.answerCount > 0 && question.answers?.some(a => a.isAccepted)
              ? 'white'
              : question.answerCount > 0 ? SITE_THEME.accepted : SITE_THEME.textMuted,
            border: question.answerCount > 0 ? 'none' : `1px solid ${SITE_THEME.border}`,
          }}
        >
          <span className="font-semibold">{question.answerCount}</span>
          <span className="ml-1">answers</span>
        </div>
        <div className="text-sm" style={{ color: SITE_THEME.textMuted }}>
          {question.views.toLocaleString()} views
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <button
          onClick={onClick}
          className="text-left hover:opacity-80 transition-opacity"
        >
          <h3
            className="text-base font-normal leading-snug mb-1"
            style={{ color: SITE_THEME.secondary }}
          >
            {question.isClosed && (
              <span
                className="inline-block px-1.5 py-0.5 text-xs rounded mr-2"
                style={{ background: SITE_THEME.closed, color: 'white' }}
              >
                {question.isDuplicate ? 'duplicate' : 'closed'}
              </span>
            )}
            {question.title}
          </h3>
        </button>

        <div className="flex flex-wrap gap-1 mb-2">
          {question.tags.map((tag) => (
            <TagBadge key={tag} name={tag} onClick={onSelectTag ? () => onSelectTag(tag) : undefined} />
          ))}
        </div>

        <MetaRow
          items={[
            { value: question.timestamp },
            { value: `asked by ${question.author}`, style: { color: SITE_THEME.secondary } },
            { value: `${question.authorRep?.toLocaleString() || '0'} kernels` },
          ]}
          textSize="xs"
          textColor={SITE_THEME.text}
          mutedColor={SITE_THEME.textMuted}
          separator=""
          className="gap-2"
        />
      </div>
    </div>
  )
}

// ============================================================================
// Question Detail Component
// ============================================================================

interface QuestionDetailProps {
  question: Question
  onBack: () => void
  userVotes: Record<string, number>
  onVote: (id: string, direction: 1 | -1) => void
  onSelectUser: (username: string) => void
  onSelectTag: (tagName: string) => void
}

function QuestionDetail({ question, onBack, userVotes, onVote, onSelectUser, onSelectTag }: QuestionDetailProps) {
  const displayVotes = question.votes + (userVotes[question.id] || 0)

  return (
    <div>
      {/* Header */}
      <div className="mb-4 pb-4" style={{ borderBottom: `1px solid ${SITE_THEME.border}` }}>
        <div className="flex items-start justify-between gap-4 mb-2">
          <h1 className="text-xl leading-snug" style={{ color: SITE_THEME.text }}>
            {question.title}
          </h1>
          <Button
            variant="primary"
            size="sm"
            backgroundColor={SITE_THEME.secondary}
            textColor="white"
            className="shrink-0"
          >
            Ask Question
          </Button>
        </div>
        <MetaRow
          items={[
            { value: `Asked ${question.timestamp}` },
            { value: `Viewed ${question.views.toLocaleString()} times` },
          ]}
          textSize="sm"
          textColor={SITE_THEME.text}
          mutedColor={SITE_THEME.textMuted}
          separator=""
          className="gap-4"
        />
      </div>

      {/* Closed Notice */}
      {question.isClosed && (
        <div
          className="mb-4 p-3 rounded text-sm"
          style={{ background: '#fdf7e2', border: '1px solid #e6cf7e' }}
        >
          <strong>Closed.</strong> {question.closeReason}
          {question.isDuplicate && (
            <span className="ml-1" style={{ color: SITE_THEME.secondary }}>
              This question already has answers here.
            </span>
          )}
        </div>
      )}

      {/* Question Content */}
      <div className="flex gap-4 mb-6">
        {/* Vote Column */}
        <div className="w-12 shrink-0 flex flex-col items-center gap-1">
          <button
            onClick={() => onVote(question.id, 1)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <svg
              className="w-8 h-8"
              viewBox="0 0 36 36"
              fill={userVotes[question.id] === 1 ? SITE_THEME.primary : SITE_THEME.border}
            >
              <path d="M18 6l-12 12h8v12h8v-12h8z" />
            </svg>
          </button>
          <span
            className="text-xl font-medium"
            style={{ color: userVotes[question.id] ? SITE_THEME.primary : SITE_THEME.text }}
          >
            {displayVotes}
          </span>
          <button
            onClick={() => onVote(question.id, -1)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <svg
              className="w-8 h-8"
              viewBox="0 0 36 36"
              fill={userVotes[question.id] === -1 ? SITE_THEME.primary : SITE_THEME.border}
            >
              <path d="M18 30l12-12h-8v-12h-8v12h-8z" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div
            className="prose prose-sm max-w-none mb-4 whitespace-pre-wrap"
            style={{ color: SITE_THEME.text }}
          >
            {question.content}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-4">
            {question.tags.map((tag) => (
              <TagBadge key={tag} name={tag} onClick={() => onSelectTag(tag)} />
            ))}
          </div>

          {/* Author Card */}
          <div className="flex justify-end">
            <button
              onClick={() => onSelectUser(question.author)}
              className="p-3 rounded text-left hover:bg-gray-50 transition-colors"
              style={{ background: SITE_THEME.tagBg }}
            >
              <div className="text-xs mb-1" style={{ color: SITE_THEME.textMuted }}>
                asked {question.timestamp}
              </div>
              <div className="flex items-center gap-2">
                <Avatar
                  name={question.author}
                  size="sm"
                  backgroundColor={SITE_THEME.primary}
                  textColor="white"
                />
                <div>
                  <div className="text-sm" style={{ color: SITE_THEME.secondary }}>
                    {question.author}
                  </div>
                  <div className="text-xs" style={{ color: SITE_THEME.textMuted }}>
                    {question.authorRep.toLocaleString()} corn kernels
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Answers Section */}
      <div className="mb-4">
        <h2 className="text-lg mb-4" style={{ color: SITE_THEME.text }}>
          {question.answers.length} Answer{question.answers.length !== 1 ? 's' : ''}
        </h2>

        <div className="space-y-6">
          {question.answers.map((answer) => (
            <AnswerCard
              key={answer.id}
              answer={answer}
              userVote={userVotes[answer.id] || 0}
              onVote={(dir) => onVote(answer.id, dir)}
              onSelectUser={onSelectUser}
            />
          ))}
        </div>
      </div>

      {/* Your Answer */}
      <div className="pt-4" style={{ borderTop: `1px solid ${SITE_THEME.border}` }}>
        <h2 className="text-lg mb-4" style={{ color: SITE_THEME.text }}>
          Your Answer
        </h2>
        <textarea
          className="w-full p-3 rounded text-sm resize-none mb-3"
          rows={8}
          placeholder="Write your answer here..."
          style={{
            border: `1px solid ${SITE_THEME.border}`,
            color: SITE_THEME.text,
          }}
        />
        <Button
          variant="primary"
          backgroundColor={SITE_THEME.secondary}
          textColor="white"
        >
          Post Your Answer
        </Button>
      </div>
    </div>
  )
}

// ============================================================================
// Answer Card Component
// ============================================================================

interface AnswerCardProps {
  answer: Answer
  userVote: number
  onVote: (direction: 1 | -1) => void
  onSelectUser: (username: string) => void
}

function AnswerCard({ answer, userVote, onVote, onSelectUser }: AnswerCardProps) {
  const displayVotes = answer.votes + userVote

  return (
    <div className="flex gap-4 pb-6" style={{ borderBottom: `1px solid ${SITE_THEME.border}` }}>
      {/* Vote Column */}
      <div className="w-12 shrink-0 flex flex-col items-center gap-1">
        <button
          onClick={() => onVote(1)}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
        >
          <svg
            className="w-8 h-8"
            viewBox="0 0 36 36"
            fill={userVote === 1 ? SITE_THEME.primary : SITE_THEME.border}
          >
            <path d="M18 6l-12 12h8v12h8v-12h8z" />
          </svg>
        </button>
        <span
          className="text-xl font-medium"
          style={{ color: userVote ? SITE_THEME.primary : SITE_THEME.text }}
        >
          {displayVotes}
        </span>
        <button
          onClick={() => onVote(-1)}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
        >
          <svg
            className="w-8 h-8"
            viewBox="0 0 36 36"
            fill={userVote === -1 ? SITE_THEME.primary : SITE_THEME.border}
          >
            <path d="M18 30l12-12h-8v-12h-8v12h-8z" />
          </svg>
        </button>
        {answer.isAccepted && (
          <svg
            className="w-10 h-10 mt-2"
            viewBox="0 0 36 36"
            fill={SITE_THEME.accepted}
          >
            <path d="M6 18l8 8 16-16-3-3-13 13-5-5z" />
          </svg>
        )}
      </div>

      {/* Content */}
      <div className="flex-1">
        <div
          className="prose prose-sm max-w-none mb-4 whitespace-pre-wrap"
          style={{ color: SITE_THEME.text }}
        >
          {answer.content}
        </div>

        {/* Author Card */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => onSelectUser(answer.author)}
            className="p-3 rounded text-left hover:bg-gray-50 transition-colors"
            style={{ background: answer.isAccepted ? '#d4edda' : SITE_THEME.background }}
          >
            <div className="text-xs mb-1" style={{ color: SITE_THEME.textMuted }}>
              answered {answer.timestamp}
            </div>
            <div className="flex items-center gap-2">
              <Avatar
                name={answer.author}
                size="sm"
                backgroundColor={answer.isAccepted ? SITE_THEME.accepted : SITE_THEME.secondary}
                textColor="white"
              />
              <div>
                <div className="text-sm" style={{ color: SITE_THEME.secondary }}>
                  {answer.author}
                </div>
                <div className="text-xs" style={{ color: SITE_THEME.textMuted }}>
                  {answer.authorRep.toLocaleString()} corn kernels
                </div>
              </div>
            </div>
          </button>
        </div>

        {/* Comments */}
        {answer.comments && answer.comments.length > 0 && (
          <div className="pl-4" style={{ borderLeft: `2px solid ${SITE_THEME.border}` }}>
            {answer.comments.map((comment, i) => (
              <div
                key={i}
                className="py-2 text-sm"
                style={{ borderBottom: i < answer.comments!.length - 1 ? `1px solid ${SITE_THEME.border}` : 'none' }}
              >
                <span style={{ color: SITE_THEME.text }}>{comment.content}</span>
                <span className="mx-1" style={{ color: SITE_THEME.textMuted }}>-</span>
                <span style={{ color: SITE_THEME.secondary }}>{comment.author}</span>
                <span className="ml-2" style={{ color: SITE_THEME.textMuted }}>{comment.timestamp}</span>
              </div>
            ))}
            <button
              className="text-sm py-2"
              style={{ color: SITE_THEME.textMuted }}
            >
              Add a comment
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// Tags List Component
// ============================================================================

interface TagsListProps {
  tags: Tag[]
  onSelectTag: (tagName: string) => void
}

function TagsList({ tags, onSelectTag }: TagsListProps) {
  return (
    <div>
      <h1 className="text-2xl mb-4" style={{ color: SITE_THEME.text }}>Tags</h1>
      <p className="text-sm mb-4" style={{ color: SITE_THEME.textMuted }}>
        A tag is a keyword or label that categorizes your question with other, similar questions.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {tags.map((tag) => (
          <button
            key={tag.name}
            onClick={() => onSelectTag(tag.name)}
            className="text-left p-4 rounded hover:shadow-md transition-shadow"
            style={{ background: SITE_THEME.surface, border: `1px solid ${SITE_THEME.border}` }}
          >
            <TagBadge name={tag.name} size="md" />
            <p className="text-sm mt-2" style={{ color: SITE_THEME.textMuted }}>
              {tag.count.toLocaleString()} questions
            </p>
          </button>
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// Tag Filter View Component
// ============================================================================

interface TagFilterViewProps {
  tagName: string
  questions: Question[]
  popularTags: Tag[]
  onBack: () => void
  onSelectQuestion: (question: Question) => void
  userVotes: Record<string, number>
  onVote: (id: string, direction: 1 | -1) => void
}

function TagFilterView({ tagName, questions, popularTags, onBack, onSelectQuestion, userVotes, onVote }: TagFilterViewProps) {
  // Find tag info from popularTags if available
  const tagInfo = popularTags.find(t => t.name === tagName)

  return (
    <div>
      <Button
        onClick={onBack}
        variant="link"
        size="sm"
        textColor={SITE_THEME.secondary}
        className="mb-4"
      >
        ← Back to all questions
      </Button>

      <div className="flex items-center gap-3 mb-4 pb-4" style={{ borderBottom: `1px solid ${SITE_THEME.border}` }}>
        <TagBadge name={tagName} size="md" />
        <div>
          <h1 className="text-xl" style={{ color: SITE_THEME.text }}>
            Questions tagged [{tagName}]
          </h1>
          <p className="text-sm" style={{ color: SITE_THEME.textMuted }}>
            {questions.length} question{questions.length !== 1 ? 's' : ''}
            {tagInfo && ` (${tagInfo.count.toLocaleString()} total)`}
          </p>
        </div>
      </div>

      {questions.length > 0 ? (
        <div className="divide-y" style={{ borderColor: SITE_THEME.border }}>
          {questions.map((question) => (
            <QuestionRow
              key={question.id}
              question={question}
              onClick={() => onSelectQuestion(question)}
              userVote={userVotes[question.id] || 0}
              onVote={(dir) => onVote(question.id, dir)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8" style={{ color: SITE_THEME.textMuted }}>
          No questions found with this tag.
        </div>
      )}
    </div>
  )
}

// ============================================================================
// Users List Component
// ============================================================================

interface UsersListProps {
  users: User[]
  onSelectUser: (username: string) => void
}

function UsersList({ users, onSelectUser }: UsersListProps) {
  return (
    <div>
      <h1 className="text-2xl mb-4" style={{ color: SITE_THEME.text }}>Users</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {users.map((user) => (
          <button
            key={user.username}
            onClick={() => onSelectUser(user.username)}
            className="text-left p-4 rounded hover:shadow-md transition-shadow"
            style={{ background: SITE_THEME.surface, border: `1px solid ${SITE_THEME.border}` }}
          >
            <div className="flex items-center gap-3 mb-2">
              <Avatar
                name={user.username}
                size="md"
                backgroundColor={SITE_THEME.primary}
                textColor="white"
              />
              <div>
                <div className="font-medium" style={{ color: SITE_THEME.secondary }}>
                  {user.username}
                </div>
                <div className="text-sm" style={{ color: SITE_THEME.textMuted }}>
                  {user.reputation.toLocaleString()} kernels
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <span className="text-xs" style={{ color: SITE_THEME.gold }}>
                ● {user.badges.gold}
              </span>
              <span className="text-xs" style={{ color: SITE_THEME.silver }}>
                ● {user.badges.silver}
              </span>
              <span className="text-xs" style={{ color: SITE_THEME.bronze }}>
                ● {user.badges.bronze}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// User Profile Component
// ============================================================================

interface UserProfileProps {
  user: User
  questions: Question[]
  onBack: () => void
  onSelectQuestion: (question: Question) => void
}

function UserProfile({ user, questions, onBack, onSelectQuestion }: UserProfileProps) {
  // Find questions by this user from the passed-in questions array
  const userQuestions = questions.filter(q => q.author === user.username)

  return (
    <div>
      <Button
        onClick={onBack}
        variant="link"
        size="sm"
        textColor={SITE_THEME.secondary}
        className="mb-4"
      >
        ← Back to questions
      </Button>

      {/* Profile Header */}
      <div className="flex items-start gap-6 mb-6 pb-6" style={{ borderBottom: `1px solid ${SITE_THEME.border}` }}>
        <Avatar
          name={user.username}
          size="lg"
          backgroundColor={SITE_THEME.primary}
          textColor="white"
        />
        <div className="flex-1">
          <h1 className="text-2xl mb-1" style={{ color: SITE_THEME.text }}>
            {user.username}
          </h1>
          <div className="flex items-center gap-4 mb-3">
            <span className="text-lg font-semibold" style={{ color: SITE_THEME.primary }}>
              {user.reputation.toLocaleString()} corn kernels
            </span>
            <div className="flex gap-2">
              <span style={{ color: SITE_THEME.gold }}>
                ● {user.badges.gold} gold
              </span>
              <span style={{ color: SITE_THEME.silver }}>
                ● {user.badges.silver} silver
              </span>
              <span style={{ color: SITE_THEME.bronze }}>
                ● {user.badges.bronze} bronze
              </span>
            </div>
          </div>
          {user.about && (
            <p className="text-sm" style={{ color: SITE_THEME.textMuted }}>
              {user.about}
            </p>
          )}
        </div>
      </div>

      {/* Top Tags */}
      {user.topTags && user.topTags.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg mb-3" style={{ color: SITE_THEME.text }}>Top Tags</h2>
          <div className="flex flex-wrap gap-2">
            {user.topTags.map((tag) => (
              <TagBadge key={tag} name={tag} size="md" />
            ))}
          </div>
        </div>
      )}

      {/* User's Questions */}
      <div>
        <h2 className="text-lg mb-3" style={{ color: SITE_THEME.text }}>Questions</h2>
        {userQuestions.length > 0 ? (
          <div className="space-y-3">
            {userQuestions.map((q) => (
              <button
                key={q.id}
                onClick={() => onSelectQuestion(q)}
                className="w-full text-left p-3 rounded hover:bg-gray-50 transition-colors"
                style={{ border: `1px solid ${SITE_THEME.border}` }}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="text-sm font-medium px-2 py-1 rounded"
                    style={{ background: SITE_THEME.tagBg, color: SITE_THEME.accepted }}
                  >
                    {q.votes}
                  </span>
                  <span style={{ color: SITE_THEME.secondary }}>{q.title}</span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm" style={{ color: SITE_THEME.textMuted }}>
            No questions yet.
          </p>
        )}
      </div>
    </div>
  )
}

export default AskCornSite
