/**
 * VidTube Content Configuration
 *
 * Add videos here and they'll appear on VidTube.
 * Transcripts allow NPCs to "watch" and discuss videos.
 *
 * To add a new video:
 * 1. Add thumbnail to public/images/vidtube/ (optional - will use emoji fallback)
 * 2. Add entry to VIDTUBE_VIDEOS array below
 * 3. Include transcript so NPCs can reference the content
 */

// ============================================================================
// Types
// ============================================================================

export interface VideoComment {
  id: string
  author: string
  avatar: string
  content: string
  likes: number
  timestamp: string
  replies?: VideoComment[]
  isCreator?: boolean
}

export interface Video {
  id: string
  title: string
  channel: string
  channelAvatar: string
  channelVerified?: boolean
  /** Path to thumbnail image in public/images/vidtube/ (e.g., 'vid_1.jpg') */
  thumbnail?: string
  /** Emoji fallback if no thumbnail image */
  thumbnailEmoji: string
  views: string
  uploadedAt: string
  duration: string
  description: string
  likes: string
  dislikes: string
  comments: VideoComment[]
  category: string
  tags: string[]
  /**
   * Full transcript of the video for NPC consumption.
   * NPCs read this to "watch" the video and can discuss it.
   */
  transcript: string
}

export interface Channel {
  id: string
  name: string
  /** Path to avatar image in public/images/vidtube/channels/ (e.g., 'quantumbrew.jpg') */
  avatar?: string
  /** Emoji fallback if no avatar image */
  avatarEmoji: string
  subscribers: string
  verified?: boolean
  description: string
}

// ============================================================================
// Channels
// ============================================================================

export const VIDTUBE_CHANNELS: Record<string, Channel> = {
  'QuantumBrew': {
    id: 'quantumbrew',
    name: 'QuantumBrew',
    avatarEmoji: '☕',
    subscribers: '2.4M',
    verified: true,
    description: 'The official channel for quantum coffee brewing techniques and science.',
  },
  'TrustFallTim': {
    id: 'trustfalltim',
    name: 'TrustFallTim',
    avatarEmoji: '🤸',
    subscribers: '847K',
    verified: false,
    description: 'I crowdsurf at inappropriate times. One day someone will catch me.',
  },
  'UndergroundVenues': {
    id: 'underground',
    name: 'The Underground Official',
    avatarEmoji: '🎸',
    subscribers: '156K',
    verified: true,
    description: 'Live music venue. Home of the weirdest shows in town.',
  },
  'TechExplained': {
    id: 'techexplained',
    name: 'TechExplained',
    avatarEmoji: '🔬',
    subscribers: '12.3M',
    verified: true,
    description: 'Making complex technology simple since 2015.',
  },
  'ChaoticCooking': {
    id: 'chaoticcooking',
    name: 'Chaotic Cooking',
    avatarEmoji: '👨‍🍳',
    subscribers: '3.8M',
    verified: true,
    description: 'Recipes that probably shouldn\'t work but somehow do.',
  },
  'MidnightMystery': {
    id: 'midnightmystery',
    name: 'Midnight Mystery Files',
    avatarEmoji: '🔮',
    subscribers: '5.1M',
    verified: false,
    description: 'Investigating the unexplained. New episodes every Thursday.',
  },
  'VelvetAlgorithms': {
    id: 'velvetalgorithms',
    name: 'The Velvet Algorithms',
    avatarEmoji: '🎹',
    subscribers: '423K',
    verified: true,
    description: 'Official channel. Music that resonates with the fundamental frequency of existence.',
  },
}

// ============================================================================
// Videos
// ============================================================================

export const VIDTUBE_VIDEOS: Video[] = [
  {
    id: 'vid_1',
    title: 'I Tried Making Quantum Coffee at Home... It Changed My Life',
    channel: 'QuantumBrew',
    channelAvatar: '☕',
    channelVerified: true,
    thumbnailEmoji: '☕✨',
    views: '4.2M views',
    uploadedAt: '2 weeks ago',
    duration: '24:31',
    description: `Today I finally got my hands on a $3,000 home quantum coffee maker and the results were... unexpected.

TIMESTAMPS:
0:00 - Unboxing
3:24 - Setup (it took 4 hours)
8:15 - First brew attempt
12:47 - The taste test
18:32 - Why I'm returning it
22:45 - Just kidding, I'm keeping it forever

Follow me on socials @QuantumBrew

This video is NOT sponsored by Big Quantum (they wish)

#quantumcoffee #coffee #science`,
    likes: '342K',
    dislikes: '12K',
    category: 'Science & Technology',
    tags: ['quantum coffee', 'coffee', 'science', 'review'],
    transcript: `Hey everyone, welcome back to QuantumBrew. Today is a very special day because I finally got my hands on the Q-3000, the home quantum coffee maker that everyone's been talking about.

So this thing costs three thousand dollars. Yes, three thousand. My wife almost killed me when she saw the credit card statement, but I told her it's for the channel. Let's unbox this bad boy.

Okay so right away you can see the build quality is insane. This is solid metal, feels like it weighs about 20 pounds. We've got the brewing chamber here, the observation window - which is key because you need to watch the coffee to collapse the wave function - and all these cables and tubes.

The setup took me about four hours. The manual is 47 pages long and half of it is warnings about improper observation technique. Apparently if you look away at the wrong moment, you can end up with coffee that exists in a superposition of good and bad, which just tastes mediocre.

First brew attempt... okay, it's making some interesting sounds. Kind of like a regular coffee maker but with this weird harmonic overtone. The water is doing something in there, I can see particles doing... something. This is where it gets sciency.

45 minutes later - yes, 45 minutes - we have our first cup. The moment of truth. Taking a sip...

Oh my god. Okay. Okay this is actually incredible. I don't know if it's placebo or the quantum effects or what but this is genuinely the best coffee I've ever had. The flavor is somehow both bold and subtle at the same time. It's like the coffee can't decide what it wants to be and that's actually perfect.

I was going to return this. I had the return label printed out. But I can't. I just can't go back to regular coffee after this. My wife is going to have to understand. This is worth it. The Q-3000 gets a 10 out of 10 from me.`,
    comments: [
      {
        id: 'vc1',
        author: 'CoffeeAddict2024',
        avatar: '😴',
        content: 'Bruh I bought one of these after watching this video. My wife left me but the coffee is incredible.',
        likes: 24500,
        timestamp: '1 week ago',
        replies: [
          {
            id: 'vc1_1',
            author: 'QuantumBrew',
            avatar: '☕',
            content: 'Worth it tbh',
            likes: 8934,
            timestamp: '1 week ago',
            isCreator: true,
          },
        ],
      },
      {
        id: 'vc2',
        author: 'SkepticalSam',
        avatar: '🤨',
        content: 'This is literally just fancy water with caffeine. The placebo effect is real.',
        likes: 1234,
        timestamp: '2 weeks ago',
        replies: [],
      },
      {
        id: 'vc3',
        author: 'PhysicsNerd42',
        avatar: '🔬',
        content: 'As a physics student, I can confirm this is actually how quantum mechanics works. Source: trust me bro.',
        likes: 18700,
        timestamp: '2 weeks ago',
        replies: [],
      },
    ],
  },
  {
    id: 'vid_2',
    title: 'TRUST FALL AT ACOUSTIC SET (nobody caught me AGAIN)',
    channel: 'TrustFallTim',
    channelAvatar: '🤸',
    channelVerified: false,
    thumbnailEmoji: '🎪💥',
    views: '1.8M views',
    uploadedAt: '3 days ago',
    duration: '0:47',
    description: `Weekly trust fall attempt #47

The crowd: 8 people
Did they catch me: no
Will I stop: never

Location: The Underground
Song playing: "Whisper" by Some Acoustic Guy

Special thanks to Mars for not banning me yet

#trustfall #crowdsurf #theunderground`,
    likes: '189K',
    dislikes: '2.1K',
    category: 'Entertainment',
    tags: ['trust fall', 'comedy', 'live music', 'fail'],
    transcript: `[Video opens at The Underground venue during an acoustic performance. About 8 people are standing near the small stage. A guy with an acoustic guitar is playing a soft, emotional song.]

Acoustic guy: "...and I whisper your name into the void..."

[Camera pans to Tim standing on a chair near the back of the small crowd]

Tim: "TRUST FALL!"

[Tim falls backwards with arms spread wide. The 8 audience members look confused and step aside. Tim hits the ground with a loud thud.]

Acoustic guy: [stops playing] "Dude, are you okay?"

Tim: [gives thumbs up from the floor] "I'm good! Keep playing!"

[Acoustic guy hesitantly continues. Tim remains on the floor for a moment, then gets up, brushes himself off, and walks out of frame]

[Cut to Tim outside the venue]

Tim: "Week 47. Still no catch. But you know what? It's not about the destination. It's about the journey. And the floor. Mostly the floor. See you next week."

[End card with "SUBSCRIBE" and previous trust fall compilation thumbnails]`,
    comments: [
      {
        id: 'vc4',
        author: 'MarsTheOwner',
        avatar: '🌙',
        content: 'Tim I\'m begging you to stop doing this',
        likes: 45000,
        timestamp: '3 days ago',
        replies: [
          {
            id: 'vc4_1',
            author: 'TrustFallTim',
            avatar: '🤸',
            content: 'No ❤️',
            likes: 78000,
            timestamp: '3 days ago',
            isCreator: true,
          },
        ],
      },
      {
        id: 'vc5',
        author: 'UndergroundRegular',
        avatar: '🎸',
        content: 'I was there! The thud was so loud the singer stopped mid-song 💀',
        likes: 12300,
        timestamp: '2 days ago',
        replies: [],
      },
    ],
  },
  {
    id: 'vid_3',
    title: 'The Velvet Algorithms - "Debugging My Heart" (Official Music Video)',
    channel: 'VelvetAlgorithms',
    channelAvatar: '🎹',
    channelVerified: true,
    thumbnailEmoji: '🎵💜',
    views: '892K views',
    uploadedAt: '1 month ago',
    duration: '4:23',
    description: `Our new single "Debugging My Heart" is out now on all streaming platforms.

Lyrics:
"Your love was like a null pointer exception
Crashed my system without detection
Now I'm stuck in an infinite loop
Of memories I can't compute..."

Directed by: Someone Artsy
Produced by: The Velvet Algorithms

Stream: fakespotify.fake/velvetalgorithms
Merch: velvetalgorithms.fake/shop

#newmusic #indieelectronic #velvetalgorithms`,
    likes: '67K',
    dislikes: '1.2K',
    category: 'Music',
    tags: ['music', 'indie', 'electronic', 'music video'],
    transcript: `[Music video opens with glitchy, VHS-style footage of a dark room filled with vintage computers and synthesizers. Purple and blue neon lights flicker.]

[Verse 1]
Your love was like a null pointer exception
Crashed my system without detection
Every function call returns your face
A memory leak I can't erase

[The two band members appear - one at a massive modular synth, the other at a keyboard. Both wear dark clothing with subtle LED accents.]

[Chorus]
Debugging my heart, line by line
Searching for the error in our design
But every fix just breaks something new
I'm stuck in a loop, thinking of you

[Visual: Code scrolling on screens behind them, interspersed with romantic scenes that glitch and corrupt]

[Verse 2]
You said our love was like quantum state
Together and apart, entangled fate
But when you observed what we could be
The wave function collapsed, and you left me

[Bridge - synths build dramatically]
Ctrl+Z can't undo what's done
Alt+F4 won't help me run
From the ghost in this machine
The best bug I've ever seen

[Final Chorus with full instrumentation]
Debugging my heart, one last time
Accepting the fault was never mine
Sometimes the code just wasn't meant to run
Some programs end before they've begun

[Video ends with both musicians walking away from their instruments as the screens behind them display "PROGRAM TERMINATED"]`,
    comments: [
      {
        id: 'vc6',
        author: 'AlgorithmFan1',
        avatar: '💜',
        content: 'THIS IS THEIR BEST WORK YET. The part at 2:47 where the synths kick in literally made me cry',
        likes: 5600,
        timestamp: '1 month ago',
        replies: [],
      },
      {
        id: 'vc7',
        author: 'NeonRequiemFan',
        avatar: '🎸',
        content: 'Neon Requiem did it better tbh',
        likes: 234,
        timestamp: '3 weeks ago',
        replies: [
          {
            id: 'vc7_1',
            author: 'AlgorithmFan1',
            avatar: '💜',
            content: 'nobody asked',
            likes: 1890,
            timestamp: '3 weeks ago',
          },
        ],
      },
    ],
  },
  {
    id: 'vid_4',
    title: 'Explaining the Great Meme War of 2019 in 15 Minutes',
    channel: 'TechExplained',
    channelAvatar: '🔬',
    channelVerified: true,
    thumbnailEmoji: '⚔️🖼️',
    views: '8.7M views',
    uploadedAt: '6 months ago',
    duration: '15:42',
    description: `The Great Meme War of 2019 was one of the most significant internet events of the decade. In this video, we break down:

- How it started (the coffee meme incident)
- The major factions involved
- Key battles and turning points
- The AMMR Treaty that ended it all
- Its lasting impact on internet culture

SOURCES:
WikiKnow article on the Great Meme War
Various archived forum posts
Interviews with veterans

#memes #internethistory #documentary`,
    likes: '524K',
    dislikes: '18K',
    category: 'Education',
    tags: ['meme war', 'internet history', 'documentary', 'explained'],
    transcript: `Welcome back to TechExplained. Today we're diving into one of the most chaotic periods in internet history: The Great Meme War of 2019.

It all started with a coffee meme. Specifically, a meme comparing regular coffee drinkers to quantum coffee enthusiasts. What seemed like harmless internet humor quickly escalated into a full-scale conflict that would reshape online culture.

The spark came on March 15th, 2019, when a user posted a meme showing a "virgin regular coffee" versus a "chad quantum coffee" comparison. Within hours, it had gone viral. But here's where things got interesting - both sides took offense.

Regular coffee people thought they were being mocked. Quantum coffee people thought the meme was sarcastic and actually making fun of them. Neither side was willing to back down.

Within a week, distinct factions had formed. You had the Traditionalists, who defended regular coffee brewing. The Quantum Collective, who saw themselves as coffee revolutionaries. The Chaos Agents, who just wanted to watch it all burn. And the Centrists, who tried to argue that both coffees were valid.

The battles were fought across every platform. Meme raids on forums, coordinated downvote campaigns, hashtag hijacking. At its peak, over 10 million users were actively participating.

The turning point came during the Battle of Brewdit - yes, that's what they called it - where the Quantum Collective launched a massive meme offensive that crashed multiple servers. The collateral damage was enormous. Innocent cooking forums were caught in the crossfire.

Finally, after three months of chaos, representatives from all factions met virtually to negotiate peace. The result was the AMMR Treaty - the Agreement on Meme Mutual Respect. It established guidelines for meme engagement and created a framework for de-escalation.

The impact of the Great Meme War is still felt today. It fundamentally changed how we think about internet conflict, meme ethics, and online community management. Some veterans still bear the psychological scars.

Was it worth it? That's not for me to say. But one thing's certain - the internet was never quite the same after 2019.`,
    comments: [
      {
        id: 'vc8',
        author: 'MemeWarVeteran',
        avatar: '🎖️',
        content: 'I was there. The things I saw... the reposts... they still haunt me.',
        likes: 34000,
        timestamp: '6 months ago',
        replies: [],
      },
      {
        id: 'vc9',
        author: 'HistoryBuff99',
        avatar: '📚',
        content: 'Fun fact: My thesis was on the socioeconomic impact of the AMMR Treaty. Got an A.',
        likes: 8900,
        timestamp: '5 months ago',
        replies: [],
      },
    ],
  },
  {
    id: 'vid_5',
    title: 'I Made Dinner Using Only Items From My Landlord\'s Garden (He Doesn\'t Know)',
    channel: 'ChaoticCooking',
    channelAvatar: '👨‍🍳',
    channelVerified: true,
    thumbnailEmoji: '🥗🏃',
    views: '2.1M views',
    uploadedAt: '5 days ago',
    duration: '18:56',
    description: `Today's chaotic challenge: create a gourmet meal using only ingredients I could "borrow" from my landlord's garden at 3am.

Ingredients obtained:
- 4 tomatoes
- Some basil (I think)
- A suspicious pepper
- What might be oregano
- One very confused cat (not used in recipe)

Recipe in the description below... if I don't get evicted.

DISCLAIMER: I did eventually tell my landlord and paid him $20 for the vegetables. He was not amused.

#cooking #chaos #garden #3am`,
    likes: '198K',
    dislikes: '4.2K',
    category: 'Howto & Style',
    tags: ['cooking', 'comedy', 'challenge', 'garden'],
    transcript: `What's up chaos crew, it's your boy back with another questionable cooking challenge. Tonight's mission: make a gourmet dinner using only ingredients from my landlord's garden. The catch? He doesn't know. Also it's 3am.

[Cut to nighttime footage with night vision]

Okay so I'm in the garden. Gerald - that's my landlord - is definitely asleep because I can hear him snoring from down here. Let's see what we're working with.

Got some tomatoes here, looking good. These are definitely ripe. Taking four of them. Some basil... at least I think it's basil? Smells right. Oh, there's a pepper. Just one pepper. And some kind of herb, might be oregano, might be a weed, we'll find out.

[A cat appears]

Oh no. That's Gerald's cat. Hey buddy. Please don't meow. Please don't - okay he's meowing. Time to go.

[Cut to kitchen]

Alright, made it back alive. Let's see what we can make with this haul. We've got Italian vibes here so I'm thinking... caprese-ish? But also maybe a sauce?

[Cooking montage with increasingly chaotic energy]

The tomatoes are beautiful. Cutting them up for a quick sauce. The basil is definitely basil, thank god. The pepper is... actually pretty spicy? Okay very spicy. That's going to be interesting.

The mystery herb... tasting it... yeah that's oregano. We're good.

[Final plating]

And there we have it. Midnight garden pasta with stolen tomato sauce, definitely-basil, one aggressive pepper, and probably-oregano. Let's taste it.

...

This is actually incredible? The tomatoes are so fresh, the basil is perfect, and the pepper gives it this kick that just works. Gerald grows good stuff.

[Text on screen: "UPDATE: I told Gerald. He was not happy. I paid him $20 and he said 'just ask next time.' We're cool now."]

Alright chaos crew, that's it for today. Like and subscribe if you want to see more questionable cooking decisions. Next week I'm thinking... foraging in the park at midnight? We'll see. Peace.`,
    comments: [
      {
        id: 'vc10',
        author: 'ConcernedViewer',
        avatar: '😰',
        content: 'This gave me so much anxiety to watch. 10/10 would recommend.',
        likes: 23000,
        timestamp: '4 days ago',
        replies: [],
      },
      {
        id: 'vc11',
        author: 'ChefMike',
        avatar: '👨‍🍳',
        content: 'As a professional chef, this video is both a masterpiece and a crime against cuisine.',
        likes: 15600,
        timestamp: '5 days ago',
        replies: [
          {
            id: 'vc11_1',
            author: 'ChaoticCooking',
            avatar: '👨‍🍳',
            content: 'Thank you, that\'s the nicest thing anyone\'s ever said to me',
            likes: 8900,
            timestamp: '5 days ago',
            isCreator: true,
          },
        ],
      },
    ],
  },
  {
    id: 'vid_6',
    title: 'The Hartwell Building: What REALLY Happened That Night? [FULL INVESTIGATION]',
    channel: 'MidnightMystery',
    channelAvatar: '🔮',
    channelVerified: false,
    thumbnailEmoji: '🏢👻',
    views: '3.4M views',
    uploadedAt: '2 months ago',
    duration: '47:23',
    description: `The Hartwell Building incident of 2018 remains one of the most unexplained events in local history. Tonight, we go deep.

CHAPTERS:
0:00 - Introduction
4:32 - The building's history
12:15 - Events leading up to that night
23:47 - Eyewitness accounts
35:12 - The official report (and its problems)
41:56 - My theory
45:30 - Conclusion

⚠️ DISCLAIMER: This video is for entertainment purposes only. I am not claiming anything as fact.

Support the channel: patreon.fake/midnightmystery
Merch: midnightmystery.fake/shop

#mystery #investigation #hartwell #unexplained`,
    likes: '245K',
    dislikes: '8.9K',
    category: 'Entertainment',
    tags: ['mystery', 'investigation', 'documentary', 'unexplained'],
    transcript: `[Ominous music plays over footage of an empty lot]

What you're looking at is 100 Hartwell Plaza. Or rather, where it used to be. Today it's just an empty lot. A parking garage is scheduled to be built here next year. But in 2018, this was a 40-story office building. And on the night of October 15th, something happened here that no one can fully explain.

I'm your host, and this is Midnight Mystery Files. Tonight, we investigate the Hartwell Building incident.

[Title card]

Let's start with the building's history. The Hartwell Building was constructed in 1987 by developer Marcus Hartwell. For 30 years, it was a normal office building. Insurance companies, law firms, a dentist on the 12th floor. Nothing unusual.

But there were always rumors. Security guards reported hearing sounds from empty floors at night. The cleaning crew refused to work past midnight. One elevator would occasionally go to floors that didn't exist on the panel.

Then came October 15th, 2018.

[News footage clips]

At approximately 11:47 PM, residents in a two-mile radius reported hearing a sound they described as - and I'm quoting here - "static that breathed." Dogs were barking for hours. Car alarms went off. Some people reported seeing lights in the building despite it being closed.

By morning, the building was evacuated. The official reason given was "structural concerns." But here's where it gets interesting - the building was demolished just three weeks later. No environmental study. No lengthy approval process. Just... gone.

I managed to track down several eyewitnesses. A woman who lived across the street told me she saw figures in the windows that night, but the building's access logs showed no one was inside. A security guard from a nearby building described electromagnetic interference so strong it fried his radio.

The official report, which I obtained through a records request, is heavily redacted. But what we can read mentions "anomalous readings" and recommends "immediate remediation." Remediation of what? They won't say.

[Dramatic pause]

Here's my theory, and I want to be clear this is just speculation. The Hartwell Building was built on the site of an old research facility. What kind of research? The records from that era are incomplete. But some documents suggest experiments involving electromagnetic fields and... other things.

I think something was dormant under that building for decades. And on October 15th, 2018, it woke up. Whatever it was, it was enough to convince the city to tear down a 40-story building in three weeks.

What really happened at the Hartwell Building? We may never know. But I'll keep digging. If you have any information, my email is in the description.

This has been Midnight Mystery Files. Stay curious. Stay skeptical. And maybe... stay away from empty lots.`,
    comments: [
      {
        id: 'vc12',
        author: 'LocalResident2018',
        avatar: '🏠',
        content: 'I lived two blocks away when this happened. The sounds that night... you got most of it right but there\'s stuff they won\'t let you say.',
        likes: 45000,
        timestamp: '2 months ago',
        replies: [
          {
            id: 'vc12_1',
            author: 'MidnightMystery',
            avatar: '🔮',
            content: 'DM me. I\'m working on a follow-up.',
            likes: 12000,
            timestamp: '2 months ago',
            isCreator: true,
          },
        ],
      },
      {
        id: 'vc13',
        author: 'SkepticalDebunker',
        avatar: '🙄',
        content: 'It was literally just a gas leak and some birds. You people need to go outside.',
        likes: 2340,
        timestamp: '1 month ago',
        replies: [
          {
            id: 'vc13_1',
            author: 'WantToBelieve',
            avatar: '👽',
            content: 'found the government agent',
            likes: 18000,
            timestamp: '1 month ago',
          },
        ],
      },
    ],
  },
  {
    id: 'vid_7',
    title: 'LIVE: The Underground Open Mic Night',
    channel: 'UndergroundVenues',
    channelAvatar: '🎸',
    channelVerified: true,
    thumbnailEmoji: '🎤🔴',
    views: '12K watching',
    uploadedAt: 'Started streaming 2 hours ago',
    duration: 'LIVE',
    description: `🔴 LIVE NOW: Open mic night at The Underground!

Tonight's lineup:
- 8:00 PM: Various open mic performers
- 10:00 PM: Special guest (TBA)
- 11:30 PM: Late night jam session

Chat rules: Be cool, be kind, no spoilers about the special guest

Support the venue: theunderground.fake/donate`,
    likes: '2.3K',
    dislikes: '45',
    category: 'Music',
    tags: ['live', 'music', 'open mic', 'the underground'],
    transcript: `[Live stream of The Underground venue. Small stage with exposed brick walls, string lights, and a modest crowd of about 40 people. Mars, the owner, is on stage.]

Mars: "Alright everyone, welcome to another Thursday night at The Underground. You know the rules - be cool, support the performers, and please, for the love of god, don't yell requests during quiet songs."

[Scattered laughter from crowd]

Mars: "First up tonight, we've got a local favorite returning to our stage. Everyone give it up for acoustic vibes and emotional damage - here's Jamie with some original songs."

[Applause as a person with an acoustic guitar takes the stage]

Jamie: "Hey everyone. This first song is about my ex. Just kidding, they're all about my ex."

[Laughter]

[Jamie begins playing a soft, melancholic song]

[Chat scrolling with messages like "love this venue" "is Trust Fall Tim here tonight?" "the vibes are immaculate"]

[About 30 minutes into the stream, someone in the back of the crowd can be seen climbing onto a chair]

Chat: "OH NO" "TIM NO" "HERE WE GO" "SOMEONE CATCH HIM THIS TIME"

[A distant "TRUST FALL!" is heard, followed by a thud]

Mars (from off-stage): "Tim, we talked about this!"

[Stream continues with more performers...]`,
    comments: [
      {
        id: 'vc14',
        author: 'LiveChatUser',
        avatar: '💬',
        content: 'Is Trust Fall Tim there tonight? 😂',
        likes: 890,
        timestamp: '15 minutes ago',
        replies: [
          {
            id: 'vc14_1',
            author: 'MarsTheOwner',
            avatar: '🌙',
            content: 'Unfortunately yes',
            likes: 2300,
            timestamp: '14 minutes ago',
          },
        ],
      },
    ],
  },
  {
    id: 'vid_8',
    title: '10 Hours of Quantum Coffee Machine Sounds for Studying',
    channel: 'QuantumBrew',
    channelAvatar: '☕',
    channelVerified: true,
    thumbnailEmoji: '☕😴',
    views: '567K views',
    uploadedAt: '4 months ago',
    duration: '10:00:01',
    description: `By popular demand: the soothing sounds of quantum wave function collapse, perfect for studying, sleeping, or achieving enlightenment.

Timestamps:
0:00 - Warm-up phase
0:45 - Quantum oscillation begins
2:30:00 - The really good part
5:00:00 - Halfway celebration beep
7:45:00 - Peak quantum state
9:59:00 - Cool-down

This video has been scientifically proven* to increase productivity by 47%.

*Not actually scientifically proven`,
    likes: '34K',
    dislikes: '890',
    category: 'Music',
    tags: ['study', 'ambience', 'quantum coffee', 'white noise', '10 hours'],
    transcript: `[10 hours of ambient sounds from a quantum coffee maker]

[0:00 - Warm-up phase]
[Soft humming as the machine powers on. Gentle clicks and whirs. The sound of water beginning to heat.]

[0:45 - Quantum oscillation begins]
[A low, rhythmic pulsing sound joins the ambient hum. It has an almost musical quality, like a very slow heartbeat combined with wind chimes made of science.]

[The sound continues steadily with subtle variations - sometimes the oscillation speeds up slightly, sometimes it harmonizes with itself in unexpected ways]

[2:30:00 - The really good part]
[The harmonics align in a particularly pleasing way. Multiple frequencies seem to dance together. Listeners report this section induces a state of focused calm.]

[5:00:00 - Halfway celebration beep]
[A single, gentle beep marks the halfway point, then the ambient sounds continue]

[7:45:00 - Peak quantum state]
[The sounds reach their most complex arrangement. If you listen carefully, you might hear patterns that seem almost like language, but aren't.]

[9:59:00 - Cool-down]
[The oscillations slowly wind down. The humming softens. One final, satisfying click as the machine completes its cycle.]

[10:00:01 - Silence]`,
    comments: [
      {
        id: 'vc15',
        author: 'StudyGrind247',
        avatar: '📚',
        content: 'This got me through finals week. I owe my degree to this video.',
        likes: 5600,
        timestamp: '3 months ago',
        replies: [],
      },
      {
        id: 'vc16',
        author: 'InsomniacAndy',
        avatar: '😵',
        content: 'I fell asleep at 2:30:00. Can someone tell me what the really good part was?',
        likes: 12000,
        timestamp: '4 months ago',
        replies: [
          {
            id: 'vc16_1',
            author: 'QuantumBrew',
            avatar: '☕',
            content: 'It\'s different every time you observe it 😉',
            likes: 4500,
            timestamp: '4 months ago',
            isCreator: true,
          },
        ],
      },
    ],
  },
]

// ============================================================================
// Categories
// ============================================================================

export const VIDTUBE_CATEGORIES = [
  'All',
  'Music',
  'Gaming',
  'News',
  'Live',
  'Science & Technology',
  'Education',
  'Entertainment',
  'Howto & Style',
  'Comedy',
]

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get thumbnail URL for a video
 * Returns image path if thumbnail exists, otherwise returns emoji
 */
export function getVideoThumbnail(video: Video): { type: 'image' | 'emoji', value: string } {
  if (video.thumbnail) {
    return { type: 'image', value: `/images/vidtube/${video.thumbnail}` }
  }
  return { type: 'emoji', value: video.thumbnailEmoji }
}

/**
 * Get channel avatar
 * Returns image path if avatar exists, otherwise returns emoji
 */
export function getChannelAvatar(channel: Channel): { type: 'image' | 'emoji', value: string } {
  if (channel.avatar) {
    return { type: 'image', value: `/images/vidtube/channels/${channel.avatar}` }
  }
  return { type: 'emoji', value: channel.avatarEmoji }
}

/**
 * Get all videos (for NPC use)
 */
export function getAllVideos(): Video[] {
  return VIDTUBE_VIDEOS
}

/**
 * Get video by ID (for NPC use)
 */
export function getVideoById(id: string): Video | undefined {
  return VIDTUBE_VIDEOS.find(v => v.id === id)
}

/**
 * Get random video (for NPC "watching" simulation)
 */
export function getRandomVideo(): Video {
  return VIDTUBE_VIDEOS[Math.floor(Math.random() * VIDTUBE_VIDEOS.length)]
}
