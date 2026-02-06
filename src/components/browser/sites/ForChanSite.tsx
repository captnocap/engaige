/**
 * ForChan Site
 *
 * 4chan-style imageboard clone for the engAIge browser.
 * Features anonymous posting, greentext, reply chains, and classic imageboard aesthetic.
 */

import { useState, useEffect, useRef, useMemo } from 'react'
import type { SiteProps } from '../BrowserSiteContainer.js'
import { FILLER_SITES } from '../../../config/filler-sites.js'
import { SidebarAdWidget } from '../ads/index.js'
import { useSiteContent, useSiteCategories, type SiteContentItem, type SiteCategory } from '../../../hooks/useSiteContent.js'

const site = FILLER_SITES.imageboard

// ============================================================================
// Types
// ============================================================================

interface Reply {
  id: string
  content: string
  image?: string
  timestamp: string
  replyTo?: string[]
  name?: string
  tripcode?: string
}

interface Thread {
  id: string
  board: string
  subject?: string
  content: string
  image?: string
  timestamp: string
  replies: Reply[]
  name?: string
  tripcode?: string
  sticky?: boolean
  locked?: boolean
}

interface Board {
  id: string
  name: string
  description: string
  nsfw?: boolean
}

// ============================================================================
// Sample Data
// ============================================================================

const BOARDS: Board[] = [
  { id: 'b', name: 'Random', description: 'The stories and information posted here are artistic works of fiction.' },
  { id: 'g', name: 'Technology', description: 'Install Gentoo' },
  { id: 'mu', name: 'Music', description: 'TORTURE THE ARTIST' },
  { id: 'ck', name: 'Food & Cooking', description: "How do I make pasta that doesn't taste like sadness?" },
  { id: 'x', name: 'Paranormal', description: 'Creepy tales and unexplained phenomena' },
  { id: 'sci', name: 'Science & Math', description: 'For the scientifically minded' },
  { id: 'diy', name: 'Do It Yourself', description: 'You can probably fix that yourself, right?' },
  { id: 'adv', name: 'Advice', description: 'Life lessons from anonymous strangers' },
]

const SAMPLE_THREADS: Thread[] = [
  {
    id: '94817234',
    board: 'g',
    subject: 'Quantum Coffee Machine General /qcg/',
    content: `>be me
>finally save up $3000 for quantum coffee maker
>took 6 months of eating nothing but ramen
>it arrives
>setup takes 4 hours
>first cup takes 45 minutes to brew
>taste it
>tastes exactly like regular coffee
>mfw I can't tell the difference
>mfw I'm $3000 poorer
>mfw my roommate was right all along

Is quantum coffee actually a meme or am I just not "observing" it correctly?`,
    image: '☕💸',
    timestamp: '11/23/24(Sat)14:23:42',
    name: 'Anonymous',
    sticky: true,
    replies: [
      {
        id: '94817267',
        content: `>>94817234
>he fell for the quantum meme
ngmi

just get an aeropress like a normal person`,
        timestamp: '11/23/24(Sat)14:25:11',
        replyTo: ['94817234'],
      },
      {
        id: '94817289',
        content: `>>94817234
Unironically you need to calibrate your observation field. The manual has a whole section on this.

t. actual quantum barista`,
        timestamp: '11/23/24(Sat)14:27:33',
        replyTo: ['94817234'],
        name: 'QuantumAnon',
        tripcode: '!qCoffee42',
      },
      {
        id: '94817312',
        content: `>>94817289
>tripfagging
>on /g/
cringe

also OP you need to observe it with INTENT. that's literally the whole point.`,
        timestamp: '11/23/24(Sat)14:29:58',
        replyTo: ['94817289'],
      },
      {
        id: '94817345',
        content: `>quantum coffee
>not just brewing regular coffee and lying to yourself about it
never gonna make it bros`,
        timestamp: '11/23/24(Sat)14:32:15',
        image: '🤡',
      },
      {
        id: '94817378',
        content: `>>94817234
>>94817267
>>94817312
This thread is living proof that nobody on this board has actually tried quantum coffee

I literally conducted a double blind test with 50 people and 47 of them could tell the difference

Source: I made it up but it sounds believable`,
        timestamp: '11/23/24(Sat)14:35:47',
        replyTo: ['94817234', '94817267', '94817312'],
      },
      {
        id: '94817401',
        content: `>>94817378
>Source: I made it up
at least you're honest

anyway the real redpill is that coffee is a psyop by Big Caffeine`,
        timestamp: '11/23/24(Sat)14:38:22',
        replyTo: ['94817378'],
      },
    ],
  },
  {
    id: '94815102',
    board: 'mu',
    subject: 'Velvet Algorithms Appreciation Thread',
    content: `ITT: We discuss the greatest synth-rock duo of our generation

Just saw them live at The Underground before they had their "existential crisis" and cancelled everything. AMA about the show.

pic unrelated but they didn't let us take photos`,
    image: '🎹✨',
    timestamp: '11/23/24(Sat)09:15:33',
    replies: [
      {
        id: '94815134',
        content: `>>94815102
>greatest synth-rock duo
>Neon Requiem exists
op has literally never listened to music`,
        timestamp: '11/23/24(Sat)09:18:45',
        replyTo: ['94815102'],
      },
      {
        id: '94815167',
        content: `>>94815134
Neon Requiem is good but VA has better songwriting

their new track "Debugging My Heart" is unironically kino`,
        timestamp: '11/23/24(Sat)09:21:22',
        replyTo: ['94815134'],
      },
      {
        id: '94815189',
        content: `>>94815102
What was the existential crisis about? I heard they had a breakdown during soundcheck`,
        timestamp: '11/23/24(Sat)09:23:57',
        replyTo: ['94815102'],
      },
      {
        id: '94815212',
        content: `>>94815189
I was there. Mars (venue owner) said they started arguing about whether music can truly express human emotion or if it's all just mathematical patterns

Then one of them said "what's even the point" and they both just... left

It was surreal`,
        timestamp: '11/23/24(Sat)09:27:14',
        replyTo: ['94815189'],
      },
      {
        id: '94815245',
        content: `>>94815212
>Mars
based venue owner. The Underground is literally the only good venue left in this city`,
        timestamp: '11/23/24(Sat)09:30:01',
        replyTo: ['94815212'],
      },
      {
        id: '94815278',
        content: `>>94815212
kek that's the most Velvet Algorithms thing I've ever heard

they'll be back in like 2 weeks acting like nothing happened`,
        timestamp: '11/23/24(Sat)09:33:46',
        replyTo: ['94815212'],
      },
    ],
  },
  {
    id: '94812456',
    board: 'x',
    subject: 'Hartwell Building Thread - New Evidence',
    content: `New info just dropped about the Hartwell Building incident

My cousin works in city records and found some documents that were supposed to be sealed. Not gonna post them but I can tell you what they say:

>building was scheduled for inspection the morning AFTER the incident
>inspection was specifically for "unusual electromagnetic readings"
>inspector called in sick that morning
>building was demolished 3 weeks later

Make of this what you will`,
    image: '🏢🔍',
    timestamp: '11/22/24(Fri)23:45:12',
    replies: [
      {
        id: '94812489',
        content: `>>94812456
>not posting the documents
>"trust me bro"
every time with this board`,
        timestamp: '11/22/24(Fri)23:47:55',
        replyTo: ['94812456'],
      },
      {
        id: '94812512',
        content: `>>94812489
you think I'm gonna dox my cousin? use your brain

anyway the electromagnetic thing lines up with what the midnight mystery guy said in his video`,
        timestamp: '11/22/24(Fri)23:50:33',
        replyTo: ['94812489'],
      },
      {
        id: '94812545',
        content: `I lived near Hartwell when it happened. The sounds that night were like nothing I've ever heard. Not screaming, not mechanical. Just... wrong.

Still have nightmares sometimes.`,
        timestamp: '11/22/24(Fri)23:53:18',
      },
      {
        id: '94812578',
        content: `>>94812545
>wrong
describe it better schizo

what did it actually sound like`,
        timestamp: '11/22/24(Fri)23:56:42',
        replyTo: ['94812545'],
      },
      {
        id: '94812601',
        content: `>>94812578
Imagine if static had a rhythm. Like white noise but it was... breathing? I know how that sounds but I don't know how else to describe it.

My dog wouldn't stop barking for hours.`,
        timestamp: '11/22/24(Fri)23:59:15',
        replyTo: ['94812578'],
      },
      {
        id: '94812634',
        content: `>>94812601
>static that breathes
bruh that's literally just sleep paralysis audio hallucinations

you weren't outside you were having a nightmare`,
        timestamp: '11/23/24(Sat)00:02:47',
        replyTo: ['94812601'],
      },
      {
        id: '94812667',
        content: `>>94812634
cope

something happened at Hartwell and they covered it up. too many independent witnesses for it to be "mass hysteria"`,
        timestamp: '11/23/24(Sat)00:05:33',
        replyTo: ['94812634'],
      },
    ],
  },
  {
    id: '94810987',
    board: 'ck',
    subject: 'Rate my quantum coffee setup',
    content: `Just upgraded my coffee station

>Quantum Q-3000 brewer
>Single origin beans from Guatemala
>Filtered water (important for wave function stability)
>Ceramic mug (no metal, affects readings)

Ask me anything about home quantum brewing`,
    image: '☕🔬',
    timestamp: '11/22/24(Fri)18:23:45',
    replies: [
      {
        id: '94811023',
        content: `>>94810987
>ceramic mug for readings
you know you're drinking it right? not measuring it?`,
        timestamp: '11/22/24(Fri)18:26:12',
        replyTo: ['94810987'],
      },
      {
        id: '94811056',
        content: `>>94811023
The container absolutely affects taste. This is basic quantum physics. The electrons in metal interfere with the superposition.

Did you even take high school physics?`,
        timestamp: '11/22/24(Fri)18:29:47',
        replyTo: ['94811023'],
      },
      {
        id: '94811089',
        content: `>>94811056
>electrons interfere with superposition
that's... that's not how any of this works

t. actual physics PhD`,
        timestamp: '11/22/24(Fri)18:32:58',
        replyTo: ['94811056'],
      },
      {
        id: '94811122',
        content: `>>94811089
>physics PhD
>on /ck/
>believes in "real" physics
ngmi`,
        timestamp: '11/22/24(Fri)18:35:33',
        replyTo: ['94811089'],
      },
      {
        id: '94811155',
        content: `Anyway OP how long does your setup take to brew? Mine takes like 50 minutes and my wife keeps complaining`,
        timestamp: '11/22/24(Fri)18:38:16',
      },
      {
        id: '94811188',
        content: `>>94811155
About 45 minutes if I'm being precise with the observation timing. You can speed it up but quality suffers.

Also don't let your wife observe it during brewing. Multiple observers collapse the wave function wrong.`,
        timestamp: '11/22/24(Fri)18:41:52',
        replyTo: ['94811155'],
      },
    ],
  },
  {
    id: '94809234',
    board: 'adv',
    content: `>be me
>24, live with roommate
>she's obsessed with quantum coffee
>spends $3000 on a machine
>makes me try it every morning
>I say it tastes like regular coffee
>she calls me closed minded
>told her I need peer reviewed studies before I believe it
>she won't talk to me now

How do I fix this? She's a good roommate otherwise and I don't want to move`,
    image: '😐',
    timestamp: '11/22/24(Fri)15:12:33',
    replies: [
      {
        id: '94809267',
        content: `>>94809234
just pretend to like it anon

it's not worth losing housing over fake coffee`,
        timestamp: '11/22/24(Fri)15:15:44',
        replyTo: ['94809234'],
      },
      {
        id: '94809300',
        content: `>>94809234
Wait are you the guy from AITA? This exact situation was posted there`,
        timestamp: '11/22/24(Fri)15:18:22',
        replyTo: ['94809234'],
      },
      {
        id: '94809333',
        content: `>>94809300
link?`,
        timestamp: '11/22/24(Fri)15:20:57',
        replyTo: ['94809300'],
      },
      {
        id: '94809366',
        content: `>>94809300
I don't use threadit. Maybe she posted about it? That's kind of concerning actually`,
        timestamp: '11/22/24(Fri)15:23:35',
        replyTo: ['94809300'],
      },
      {
        id: '94809399',
        content: `>>94809366
bro if she's posting about you on threadit that's a huge red flag

check r/AmITheAsshole, there's definitely a post about this`,
        timestamp: '11/22/24(Fri)15:26:18',
        replyTo: ['94809366'],
      },
      {
        id: '94809432',
        content: `>>94809234
NTA btw

She needs to understand not everyone wants to spend 45 minutes waiting for coffee every morning. That's just basic roommate respect.`,
        timestamp: '11/22/24(Fri)15:29:44',
        replyTo: ['94809234'],
      },
    ],
  },
  {
    id: '94807891',
    board: 'b',
    subject: 'Trust Fall Tim General',
    content: `New TFT video just dropped

>acoustic show
>8 people in crowd
>he still tried it
>nobody caught him
>again

When will he learn bros`,
    image: '🤸💥',
    timestamp: '11/22/24(Fri)12:34:56',
    replies: [
      {
        id: '94807924',
        content: `>>94807891
LEGEND. Never stop Tim.`,
        timestamp: '11/22/24(Fri)12:37:23',
        replyTo: ['94807891'],
      },
      {
        id: '94807957',
        content: `>>94807891
I was at that show. The acoustic guy stopped mid-song to check if Tim was okay. Tim just gave a thumbs up from the floor and the guy continued.

Absolute cinema.`,
        timestamp: '11/22/24(Fri)12:40:12',
        replyTo: ['94807891'],
      },
      {
        id: '94807990',
        content: `One day an anon will organize enough people to actually catch him

One day`,
        timestamp: '11/22/24(Fri)12:43:45',
      },
      {
        id: '94808023',
        content: `>>94807990
That defeats the purpose. The beauty is in the failure. Tim knows this.

He's not trying to crowdsurf. He's making a statement about trust in modern society.`,
        timestamp: '11/22/24(Fri)12:46:33',
        replyTo: ['94807990'],
      },
      {
        id: '94808056',
        content: `>>94808023
>deep philosophical meaning
>it's just some dude faceplanting every week
peak /b/ moment`,
        timestamp: '11/22/24(Fri)12:49:18',
        replyTo: ['94808023'],
      },
    ],
  },
  {
    id: '94806123',
    board: 'sci',
    subject: 'The Martinez Study - Actual Physicist Breakdown',
    content: `PhD in physics here. Since you retards keep citing the Martinez study wrong, let me break it down:

>study was about subatomic particle behavior under specific electromagnetic conditions
>nowhere does it mention coffee
>the "quantum extraction" coffee people cite is from a BLOG POST that misunderstood the abstract
>Martinez herself has clarified multiple times she's never even tried quantum coffee

The absolute state of scientific literacy in this country`,
    image: '🔬📖',
    timestamp: '11/22/24(Fri)10:15:22',
    replies: [
      {
        id: '94806156',
        content: `>>94806123
>PhD
>on /sci/
doubt`,
        timestamp: '11/22/24(Fri)10:18:33',
        replyTo: ['94806123'],
      },
      {
        id: '94806189',
        content: `>>94806123
ok but have you actually TRIED quantum coffee? I've read the study (the abstract anyway) and it makes sense to me`,
        timestamp: '11/22/24(Fri)10:21:47',
        replyTo: ['94806123'],
      },
      {
        id: '94806222',
        content: `>>94806189
>read the abstract
>thinks he understands quantum mechanics
every single time`,
        timestamp: '11/22/24(Fri)10:24:58',
        replyTo: ['94806189'],
      },
    ],
  },
  {
    id: '94805456',
    board: 'sci',
    subject: 'Can someone explain the Hartwell EMF readings?',
    content: `Not a schizo I promise. I do EMF work for a living and was called to inspect the Hartwell Building last year.

The readings on floors 6-8 were normal. Floor 7 specifically showed some anomalies but nothing crazy.

What was weird was when I tried to test between floors 12 and 14. My equipment showed readings that shouldn't be possible. Like the field was coming from a direction that doesn't exist.

Anyone have a scientific explanation?`,
    image: '📡❓',
    timestamp: '11/22/24(Fri)08:45:33',
    replies: [
      {
        id: '94805489',
        content: `>>94805456
>direction that doesn't exist
elaborate`,
        timestamp: '11/22/24(Fri)08:48:12',
        replyTo: ['94805456'],
      },
      {
        id: '94805522',
        content: `>>94805456
Probably just equipment interference from the elevator machinery. Older buildings have terrible electrical shielding.

Source: also do EMF work`,
        timestamp: '11/22/24(Fri)08:51:27',
        replyTo: ['94805456'],
      },
      {
        id: '94805555',
        content: `>>94805522
This. Industrial elevators from the 1920s produce weird readings all the time.

>>94805456 is probably just new to the job`,
        timestamp: '11/22/24(Fri)08:54:43',
        replyTo: ['94805522', '94805456'],
      },
    ],
  },
  {
    id: '94804789',
    board: 'diy',
    subject: 'Building my own quantum coffee maker - parts list?',
    content: `Not paying $3000 for something I can probably build myself

I've watched a few videos and it doesn't look that complicated. Basically just need:
>precision temperature control
>some kind of EMF generator?
>observation chamber (whatever that is)
>regular coffee maker parts

Anyone have a real parts list? Not finding good resources`,
    image: '🔧☕',
    timestamp: '11/21/24(Thu)22:33:15',
    replies: [
      {
        id: '94804822',
        content: `>>94804789
>observation chamber
bro that's literally just a glass window
they're selling you air`,
        timestamp: '11/21/24(Thu)22:36:28',
        replyTo: ['94804789'],
      },
      {
        id: '94804855',
        content: `>>94804789
Don't do this. I tried building one and nearly burned my apartment down. The EMF field generator needs to be calibrated PERFECTLY or it just makes heat.

Just save up for a real one or accept that regular coffee is fine`,
        timestamp: '11/21/24(Thu)22:39:44',
        replyTo: ['94804789'],
      },
      {
        id: '94804888',
        content: `>>94804855
>nearly burned apartment down trying to make fancy coffee
/diy/ moment`,
        timestamp: '11/21/24(Thu)22:42:57',
        replyTo: ['94804855'],
      },
    ],
  },
  {
    id: '94803456',
    board: 'diy',
    subject: 'Repairing the sound system at The Underground',
    content: `Mars is letting me help fix the PA system at The Underground after some drunk idiot spilled beer on the mixing board

Anyone have experience with vintage Mackie boards? Need to replace some capacitors but can't find the right specs`,
    image: '🔊🔧',
    timestamp: '11/21/24(Thu)18:22:45',
    replies: [
      {
        id: '94803489',
        content: `>>94803456
Post the board model. Most Mackies from that era use pretty standard caps.`,
        timestamp: '11/21/24(Thu)18:25:33',
        replyTo: ['94803456'],
      },
      {
        id: '94803522',
        content: `>>94803456
>The Underground
based. Mars is cool. Tell him Anon says hi`,
        timestamp: '11/21/24(Thu)18:28:47',
        replyTo: ['94803456'],
      },
      {
        id: '94803555',
        content: `>>94803456
Wait was this the beer that got spilled during the Neon Requiem show? That was legendary`,
        timestamp: '11/21/24(Thu)18:31:58',
        replyTo: ['94803456'],
      },
    ],
  },
  // ============================================================================
  // Schizo-Post Generator Content (AI Generated)
  // ============================================================================
  {
    id: '186543421',
    board: 'x',
    subject: 'Old photos with me in them that I don\'t remember',
    content: `>be me
>start noticing old photos with me in them
>at events I have no memory of attending
>family gatherings, parties, random outings
>my face, my clothes, my smile
>my brain: completely blank
>started dressing nicer lately
>wearing outfits I normally wouldn't
>subconsciously preparing for photos I might already be in
>like maybe if I look good enough it'll trigger something
>or maybe I'll slip into a memory that belongs to someone else wearing my face
>wife thinks I'm losing it
>maybe she's right
>gonna keep checking old photo albums
>gotta figure out who I was before I became whoever this is`,
    image: '📸👻',
    timestamp: '12/03/24(Tue)13:47:22',
    replies: [
      {
        id: '186543458',
        content: `>>186543421
CO detector. Get one. This shit is classic carbon monoxide poisoning. Memory gaps, delusion, false memories forming. Buy one TODAY.`,
        timestamp: '12/03/24(Tue)13:49:15',
        replyTo: ['186543421'],
      },
      {
        id: '186543462',
        content: `>>186543458
This. I had a roommate who was acting exactly like this. CO detector levels were off the charts. He got it fixed and said it was like waking up from a dream.`,
        timestamp: '12/03/24(Tue)13:51:33',
        replyTo: ['186543458'],
      },
      {
        id: '186543475',
        content: `>>186543462
OP probably won't listen because they're already deep in their own delusion. But if you're reading this OP: CO detector. Right now. Before you do something you don't remember.`,
        timestamp: '12/03/24(Tue)13:53:18',
        replyTo: ['186543462'],
      },
      {
        id: '186543501',
        content: `This is the dumbest thing I've read. You're just having memory problems. See a neurologist. Stop making up sci-fi explanations for your own brain being broken.`,
        timestamp: '12/03/24(Tue)13:55:42',
      },
      {
        id: '186543534',
        content: `>>186543501
How is that dumb? If he genuinely doesn't remember events that happened, something is medically wrong. Could be anything - trauma, dissociation, actual neurological shit. CO detector OR doctor visit. Not mutually exclusive.`,
        timestamp: '12/03/24(Tue)13:58:27',
        replyTo: ['186543501'],
      },
      {
        id: '186543551',
        content: `Wait wait wait.
>wife thinks I'm losing it
Does your wife remember you being at these events? Or is she gaslighting you?

Because if MULTIPLE people remember you being there with photos to prove it, you were probably there. Your brain is just ghosting you.`,
        timestamp: '12/03/24(Tue)14:01:33',
      },
      {
        id: '186543578',
        content: `>>186543551
This is the angle. Either:
1. OP has severe memory loss (medical)
2. Everyone is lying (conspiracy/delusion)
3. Wife is replacing him with a doppelganger and keeping OP locked in basement (kek)

I'm going with #1.`,
        timestamp: '12/03/24(Tue)14:04:17',
        replyTo: ['186543551'],
      },
      {
        id: '186543621',
        content: `>subconsciously preparing for photos I might already be in
>like maybe if I look good enough it'll trigger something
>or maybe I'll slip into a memory that belongs to someone else wearing my face

Oh buddy. You're not describing a medical problem. You're describing WANTING to believe you're living someone else's life because reality is too boring or painful. That's dissociation. Talk to a therapist.`,
        timestamp: '12/03/24(Tue)14:07:45',
      },
      {
        id: '186543667',
        content: `>>186543621
He could have dissociative amnesia from trauma. That's real. Not him wanting an exciting narrative, his brain legitimately blocking shit out.`,
        timestamp: '12/03/24(Tue)14:10:22',
        replyTo: ['186543621'],
      },
      {
        id: '186543701',
        content: `>>186543667
Yeah okay but the whole "slipping into a memory that belongs to someone else wearing my face" line is creative as fuck. That's a coping narrative. His brain is broken and instead of dealing with it, he's constructing a story where he's... what? A time traveler? A clone? A doppelganger?`,
        timestamp: '12/03/24(Tue)14:13:58',
        replyTo: ['186543667'],
      },
      {
        id: '186543734',
        content: `OP do you have a twin? Serious question. Could your family have been playing a prank, bringing your twin to events, and you're just now noticing?`,
        timestamp: '12/03/24(Tue)14:16:42',
      },
      {
        id: '186543756',
        content: `>>186543734
If OP had a twin he would probably know about his twin. His entire family would be in on it. That's not how twins work.`,
        timestamp: '12/03/24(Tue)14:19:15',
        replyTo: ['186543734'],
      },
      {
        id: '186543789',
        content: `>>186543756
Separated at birth? Adoption? I'm just throwing ideas out there. OP said his brain is blank. Maybe because it's not his memories at all.`,
        timestamp: '12/03/24(Tue)14:22:33',
        replyTo: ['186543756'],
      },
      {
        id: '186543812',
        content: `This reads like the start of a horror movie. Next thing OP knows he'll find out he's been dead the whole time and everyone around him is acting normal about it.

That or actual CO poisoning. Get the detector OP.`,
        timestamp: '12/03/24(Tue)14:25:18',
      },
      {
        id: '186543845',
        content: `>started dressing nicer lately
>wearing outfits I normally wouldn't
Your wife DEFINITELY knows something. She's giving you hints. What outfits OP? Did your wife buy them for you?`,
        timestamp: '12/03/24(Tue)14:28:42',
      },
      {
        id: '186543878',
        content: `>>186543845
She's not giving him hints, she thinks he's losing it. Reading comprehension.`,
        timestamp: '12/03/24(Tue)14:31:17',
        replyTo: ['186543845'],
      },
      {
        id: '186543901',
        content: `>>186543878
Yeah but think about it - she thinks he's "losing it" because he's CHANGING. Dressing different, acting different. What if the real OP has been gone for a while and this clone/replacement is noticing the gaps?`,
        timestamp: '12/03/24(Tue)14:34:55',
        replyTo: ['186543878'],
      },
      {
        id: '186543934',
        content: `>>186543901
We're going full Invasion of the Body Snatchers now. I'm here for it. But also OP: CO detector first, body-snatcher theories second.`,
        timestamp: '12/03/24(Tue)14:37:28',
        replyTo: ['186543901'],
      },
      {
        id: '186543967',
        content: `My dad had something similar. Not exactly memory gaps but he'd find himself in situations he didn't remember agreeing to. Turned out it was early-stage Alzheimer's. He was only 62. Get yourself checked OP, seriously.`,
        timestamp: '12/03/24(Tue)14:40:33',
      },
      {
        id: '186544001',
        content: `>>186543967
Yeah but OP is probably young based on context. Alzheimer's doesn't usually hit until later. Though early-onset exists.`,
        timestamp: '12/03/24(Tue)14:43:18',
        replyTo: ['186543967'],
      },
      {
        id: '186544034',
        content: `Can we just agree: OP needs professional help (doctor or therapist) AND a CO detector?

And if it IS some kind of replacement/time loop/body snatcher situation, there's literally nothing OP can do about it on 4chan so he might as well get the medical stuff handled.`,
        timestamp: '12/03/24(Tue)14:46:55',
      },
      {
        id: '186544067',
        content: `>>186544034
Based. The logical fallacy is thinking it's EITHER medical OR conspiracy. Could be both. Could be neither. But at minimum: rule out CO, rule out neurological shit, get psychiatric evaluation. THEN worry about clones.`,
        timestamp: '12/03/24(Tue)14:49:22',
        replyTo: ['186544034'],
      },
    ],
  },
  {
    id: '186547892',
    board: 'mu',
    subject: 'Who Was I For 847 Hours? Spotify Wrapped Existential Crisis',
    content: `>be me
>check spotify wrapped
>847 hours of listening this year
>don't remember a single song
>literally nothing
>girlfriend asks what my favorite track is
>can't name one
>start listening through my history on purpose
>trying to figure out who i am
>apparently i like dark ambient and podcast deep dives
>apparently i've been consuming this whole other life
>listening to it all again now
>trying to catch up with myself
>like archaeology but it's my own brain
>every song is "oh yeah, i guess i did listen to that"
>it's unsettling
>who was i during those 847 hours
>anyways gonna keep listening
>gotta know myself eventually`,
    image: '🎧❓',
    timestamp: '12/03/24(Tue)14:23:15',
    replies: [
      {
        id: '186547925',
        content: `847 hours what the FUCK. That's like 35 days straight of music. That's not normal man that's not normal. You were literally dissociating for a month and your brain just... autopilot listening to dark ambient? This is a cry for help and you're treating it like a mystery box`,
        timestamp: '12/03/24(Tue)14:25:42',
      },
      {
        id: '186547958',
        content: `>>186547925
Nah I do this all the time. Got like 1200 hours last year, basically had Spotify running all day in background while working. He probably just had it on while he was coding or at work or something. Not that deep`,
        timestamp: '12/03/24(Tue)14:27:18',
        replyTo: ['186547925'],
      },
      {
        id: '186547991',
        content: `>>186547925
>>186547958
This. I have my spotify on basically 24/7 at work. The 847 hours is over an entire year so that's literally less than 2.5 hours a day average. He's just schizo-posting about normal music consumption lol`,
        timestamp: '12/03/24(Tue)14:29:33',
        replyTo: ['186547925', '186547958'],
      },
      {
        id: '186548024',
        content: `Wait what podcast was he listening to? He just mentions "podcast deep dives" but doesn't say which ones. That's the real mystery here. Which dark ambient + podcast combo is he running through?`,
        timestamp: '12/03/24(Tue)14:31:07',
      },
      {
        id: '186548057',
        content: `>>186548024
Yeah curious about this too. Dark ambient + podcasts sounds like a specific vibe. Is it true crime? Philosophy? Creepypasta readings? The combo is weird`,
        timestamp: '12/03/24(Tue)14:32:45',
        replyTo: ['186548024'],
      },
      {
        id: '186548090',
        content: `Bro this is what dissociation actually looks like and you're romanticizing it as "archaeology of my brain" lmao. You lost 35 days to some fugue state and you're STILL just gonna keep listening instead of figuring out what was wrong? That's not living that's haunting your own life`,
        timestamp: '12/03/24(Tue)14:34:12',
      },
      {
        id: '186548123',
        content: `>>186548090
The archaeology thing actually hit different though. Like imagine if you COULD recover what you were thinking about during all those hours just by listening again. That's lowkey fascinating even if it's also deeply unhinged`,
        timestamp: '12/03/24(Tue)14:36:28',
        replyTo: ['186548090'],
      },
      {
        id: '186548156',
        content: `>>186548123
This. OP is basically speedrunning a memoir recovery. "Here's my life documented in a playlist I didn't consciously make." Not even that weird honestly`,
        timestamp: '12/03/24(Tue)14:38:01',
        replyTo: ['186548123'],
      },
      {
        id: '186548189',
        content: `Same thing happened to me but with YouTube. Found out I had like 200+ videos in my watch history I had ZERO memory of watching. Turns out I was just putting videos on background while dealing with some stuff. Found my "watched" folder one day and was like "who is this person?" Weird feeling man. You're not alone`,
        timestamp: '12/03/24(Tue)14:39:44',
      },
      {
        id: '186548222',
        content: `>>186548189
Yeah I had this with Soundcloud like three years ago. Turns out I was going through a depression spiral and had it on basically ambient noise mode while I was just staring at walls. When I finally looked at the history it was kinda sad lol. All lofi hip hop and sleep music. That was my "other life" I guess`,
        timestamp: '12/03/24(Tue)14:41:30',
        replyTo: ['186548189'],
      },
      {
        id: '186548255',
        content: `skill issue tbh. Most people can remember what they listen to. You probably have actual memory problems and the dark ambient was helping your brain cope with the dissociation`,
        timestamp: '12/03/24(Tue)14:43:15',
      },
      {
        id: '186548288',
        content: `>>186548255
That's not a skill issue that's literally a mental health thing you absolute walnut`,
        timestamp: '12/03/24(Tue)14:45:02',
        replyTo: ['186548255'],
      },
      {
        id: '186548321',
        content: `The girlfriend asking "what's your favorite track" and you just blanking is actually tragic. Like that's such a normal couples conversation and your brain just went 404 because you literally weren't present for 847 hours of your own listening. RIP`,
        timestamp: '12/03/24(Tue)14:46:38',
      },
      {
        id: '186548354',
        content: `>>186548321
This is it. This is the real horror. Not the "who was I" stuff, it's that your girlfriend was trying to connect with you about something you DO and you couldn't even meet her halfway. That would freak me out more than the music tbh`,
        timestamp: '12/03/24(Tue)14:48:23',
        replyTo: ['186548321'],
      },
      {
        id: '186548387',
        content: `>>186548354
Okay but like he's already listening back through it all trying to reconnect with himself. That's actually pretty self-aware. He's not ignoring it he's literally doing the work of remembering who he was`,
        timestamp: '12/03/24(Tue)14:50:45',
        replyTo: ['186548354'],
      },
      {
        id: '186548420',
        content: `Alternative theory: OP has a dissociative identity and there's literally just another person who was listening to that music. The podcast listening especially. Maybe another version of OP was into self-help audio books and dark ambient was literally him trying to fix himself without conscious knowledge`,
        timestamp: '12/03/24(Tue)14:52:11',
      },
      {
        id: '186548453',
        content: `>>186548420
This is insane but also like... not impossible? Especially if he was dealing with heavy shit. The brain compartmentalizing like that. Listening to podcasts about psychology or philosophy or whatever while his "main self" was just autopilot existing`,
        timestamp: '12/03/24(Tue)14:54:38',
        replyTo: ['186548420'],
      },
      {
        id: '186548486',
        content: `>>186548420
>>186548453
You two are writing fanfiction now lol. He probably just had music on at work and forgot about it. Not everything is a dissociative identity disorder special`,
        timestamp: '12/03/24(Tue)14:56:22',
        replyTo: ['186548420', '186548453'],
      },
      {
        id: '186548519',
        content: `The "trying to catch up with myself" line hit me. That's depression behavior fr fr. When you've been so checked out you have to literally replay your own year to understand what you were going through. Hope OP figures out what was going on during that time because that's not sustainable`,
        timestamp: '12/03/24(Tue)15:00:18',
      },
      {
        id: '186548552',
        content: `>>186548519
Yeah but also like... he's doing the right thing. Instead of just ignoring it he's actually trying to understand it. That's the opposite of not sustainable that's literally the sustainable choice lol`,
        timestamp: '12/03/24(Tue)15:02:44',
        replyTo: ['186548519'],
      },
      {
        id: '186548585',
        content: `OP I unironically think you should tell your girlfriend what's going on. Like actually tell her about the dissociation or spacing out or whatever this is. If she's asking about your favorite songs she probably WANTS to know you. This might be the thing that gets you to actually be present with her`,
        timestamp: '12/03/24(Tue)15:04:52',
      },
      {
        id: '186548618',
        content: `>>186548585
This. This is the advice. Communication. Vulnerability. Your girlfriend is not gonna think you're weird for having a weird year where you dissociated. She's gonna think you're weird for keeping it from her`,
        timestamp: '12/03/24(Tue)15:06:15',
        replyTo: ['186548585'],
      },
    ],
  },
  {
    id: '186551234',
    board: 'b',
    subject: 'My cat has been attending city council meetings',
    content: `>be me
>living alone with my cat Mr. Whiskers
>find out he's been going to city council meetings
>every tuesday for the last 3 months
>sitting in back row, taking notes
>the clerk says he's "surprisingly engaged with zoning regulations"
>voting on municipal bonds somehow
>i don't even know how he got a voter registration
>mixed feelings: proud my cat cares about infrastructure
>also deeply disturbed about the logistics
>try to stop him but he just stares at me
>you know that stare
>the look that says "this is important"
>checked the meeting minutes
>his comments on the new park expansion were actually solid
>cogent points about drainage
>drainage!!!
>decided to just let it happen
>if my cat wants to be a concerned citizen that's his choice
>democracy or whatever`,
    image: '🐱🏛️',
    timestamp: '12/03/24(Tue)15:23:42',
    replies: [
      {
        id: '186551267',
        content: `>>186551234
SHOW US THE MEETING MINUTES
REDACTED VERSION IS ACCEPTABLE
THIS IS THE MOST IMPORTANT DOCUMENT SINCE THE DEAD SEA SCROLLS
I NEED TO READ MR. WHISKERS' DRAINAGE COMMENTARY RIGHT NOW
Post them or LARP detected`,
        timestamp: '12/03/24(Tue)15:25:11',
        replyTo: ['186551234'],
      },
      {
        id: '186551300',
        content: `>>186551234
Based cat. Unironically more intelligent than 90% of actual city council voters. Probably understands fiscal policy better than the mayor.`,
        timestamp: '12/03/24(Tue)15:27:33',
        replyTo: ['186551234'],
      },
      {
        id: '186551333',
        content: `>my cat does the same thing but with planning commission meetings
>she has very strong opinions about parking regulations
>knocked my laptop off the desk when i tried to stop her from attending
>honestly her suggested amendments are better than the city's original proposal
>we live in a timeline where cats have better infrastructure ideas than humans`,
        timestamp: '12/03/24(Tue)15:29:58',
      },
      {
        id: '186551366',
        content: `Wait how did the cat actually vote though
Like physically
Did he paw a button?
Did he just hiss at the council and they counted it as a yes?
This whole post doesn't add up. CALLING BULLSHIT`,
        timestamp: '12/03/24(Tue)15:32:15',
      },
      {
        id: '186551399',
        content: `>>186551366
okay fair point but i want to believe
we deserve cats in government
they'd probably pass better laws`,
        timestamp: '12/03/24(Tue)15:35:47',
        replyTo: ['186551366'],
      },
      {
        id: '186551432',
        content: `THIS IS WHAT HAPPENS WHEN THE GOVERNMENT GETS TOO BIG
NOW WE CAN'T EVEN KEEP THE CATS OUT
TOMORROW IT'S THE RACCOONS
NEXT WEEK THE OPOSSUMS HAVE FULL VOTING RIGHTS
WAKE UP SHEEPLE`,
        timestamp: '12/03/24(Tue)15:38:22',
      },
      {
        id: '186551465',
        content: `>my tabby tried to attend a town hall once
>the police showed up
>apparently you need a voter ID card with a photo
>but apparently OP's cat has managed this???
>either this is fake or your cat is a criminal mastermind
>honestly both are based`,
        timestamp: '12/03/24(Tue)15:41:33',
      },
      {
        id: '186551498',
        content: `>>186551234
Based cat is based. At least he shows up and pays attention.
More than 80% of registered voters.
Mr. Whiskers for mayor 2025
MAKE DRAINAGE GREAT AGAIN`,
        timestamp: '12/03/24(Tue)15:44:18',
        replyTo: ['186551234'],
      },
      {
        id: '186551531',
        content: `PLEASE DROP THE MEETING MINUTES
I am BEGGING you
screenshots at minimum
this is not a joke
i need to see what a cat has to say about municipal bonds
my sanity depends on this`,
        timestamp: '12/03/24(Tue)15:47:42',
      },
      {
        id: '186551564',
        content: `>>186551531
seconding
i will pay money for this
literally will commissionate it
cat government is the future and we need documentation`,
        timestamp: '12/03/24(Tue)15:50:17',
        replyTo: ['186551531'],
      },
      {
        id: '186551597',
        content: `kek my dog somehow got into a HOA meeting
just walked in during open comment period
barked when they mentioned raising dues
the board secretary actually NOTED HIS OBJECTION
"Canine resident expresses concern" in the minutes
it was the best day of my life
dogs have superior governance instincts confirmed`,
        timestamp: '12/03/24(Tue)15:53:28',
      },
      {
        id: '186551630',
        content: `>>186551234
the most cursed part of this post is "he just stares at me"
you have lost control of your own home
your cat is now the alpha
you live in his house now
he graciously allows you to pay the mortgage
this is what you deserve`,
        timestamp: '12/03/24(Tue)15:56:42',
        replyTo: ['186551234'],
      },
      {
        id: '186551663',
        content: `DEMANDING PROOF OF DRAINAGE COMMENTS
SCREENSHOT OR FAKE
If this is real i will eat a shoe
Actually I'll eat a shoe anyway
But please confirm so I can feel justified`,
        timestamp: '12/03/24(Tue)15:59:15',
      },
      {
        id: '186551696',
        content: `>>186551663
same energy as "pics or it didn't happen"
but for municipal infrastructure discussion
what a time to be alive`,
        timestamp: '12/03/24(Tue)16:02:47',
        replyTo: ['186551663'],
      },
      {
        id: '186551729',
        content: `This is the most American thing I've ever read
A cat exercising his constitutional right to political participation
While the human just accepts it
Democracy in action ladies and gentlemen
I'm unironically proud of you both`,
        timestamp: '12/03/24(Tue)16:05:33',
      },
      {
        id: '186551762',
        content: `so wait
your cat
independently developed civic consciousness
and forced you to embrace municipal engagement
honestly this is a better meet-cute than 90% of dating apps
Mr. Whiskers is carrying this family's political engagement single-handedly`,
        timestamp: '12/03/24(Tue)16:08:18',
      },
      {
        id: '186551795',
        content: `>>186551234
>voting on municipal bonds somehow
this is where the story falls apart
unless we're talking about him being present during votes
because an actual cat signing a ballot or pressing a button is
well
impossible
cool story though`,
        timestamp: '12/03/24(Tue)16:11:42',
        replyTo: ['186551234'],
      },
      {
        id: '186551828',
        content: `>>186551795
maybe he just showed up and they counted his presence as consensus
honestly that's more honest than most governments
if a cat approves it's definitely good policy`,
        timestamp: '12/03/24(Tue)16:14:17',
        replyTo: ['186551795'],
      },
      {
        id: '186551861',
        content: `the funniest part is he chose DRAINAGE as his signature issue
not something cute like "more bird feeders"
or "eliminate the dog park"
no
he said DRAINAGE
your cat is a utilitarian infrastructure analyst
send him to engineering school`,
        timestamp: '12/03/24(Tue)16:17:55',
      },
      {
        id: '186551894',
        content: `all you newfags don't understand
this is a SIGN
the animals are organizing
next it's pigeons at the federal level
then squirrels in the judiciary
the wheel of government turns and we cannot stop it
based cat is just the beginning
WAKE UP`,
        timestamp: '12/03/24(Tue)16:20:28',
      },
      {
        id: '186551927',
        content: `>>186551894
unironically the most based post in this thread
i fear what comes next
but also respect it`,
        timestamp: '12/03/24(Tue)16:23:33',
        replyTo: ['186551894'],
      },
    ],
  },
  {
    id: '186554789',
    board: 'x',
    subject: 'My reflection started leaving notes for me',
    content: `>be me
>notice my reflection in the bathroom mirror is always 0.3 seconds ahead
>at first thought it was just me being tired
>but it's consistent
>timed it with my phone camera
>exactly 0.3 seconds
>one morning I blink and my reflection doesn't
>we make eye contact
>neither of us moves for what feels like minutes
>I go to work, come back
>there's a sticky note on the mirror
>in my handwriting: "we need to talk"
>I didn't write this
>I don't even have yellow sticky notes
>left a note back: "about what?"
>next morning his reply: "the third one"
>there are only two of us
>I'm genuinely afraid to look in mirrors now
>but I have to know what he means
>what the fuck is the third one`,
    image: '🪞😱',
    timestamp: '12/03/24(Tue)16:45:12',
    replies: [
      {
        id: '186554822',
        content: `>>186554789
this is the most elaborate schizo LARP i've seen this week
congrats OP you won the prize`,
        timestamp: '12/03/24(Tue)16:47:33',
        replyTo: ['186554789'],
      },
      {
        id: '186554855',
        content: `>>186554822
let him cook though this is actually creative
most people just post "my walls are watching me"
at least this guy is doing worldbuilding`,
        timestamp: '12/03/24(Tue)16:50:18',
        replyTo: ['186554822'],
      },
      {
        id: '186554888',
        content: `>exactly 0.3 seconds
bro calculated the latency of his own reality glitch
that's dedication to the bit`,
        timestamp: '12/03/24(Tue)16:53:42',
      },
      {
        id: '186554921',
        content: `>>186554789
okay so hear me out
what if the "third one" is you from a THIRD timeline
and mirror-you is trying to warn you
because he's been through this before`,
        timestamp: '12/03/24(Tue)16:56:17',
        replyTo: ['186554789'],
      },
      {
        id: '186554954',
        content: `>>186554921
now you're just writing fanfiction about OP's schizophrenia
based but also concerning`,
        timestamp: '12/03/24(Tue)16:59:33',
        replyTo: ['186554921'],
      },
      {
        id: '186554987',
        content: `>I don't even have yellow sticky notes
this is the detail that makes it creepy
the mundane impossibility
anyone can say "my mirror is haunted"
but "I don't own the stationery that appeared in my house" hits different`,
        timestamp: '12/03/24(Tue)17:02:18',
      },
      {
        id: '186555020',
        content: `>>186554987
plot twist: OP has dissociative identity and the other alter has been buying office supplies
the "third one" is the original personality they both split from`,
        timestamp: '12/03/24(Tue)17:05:42',
        replyTo: ['186554987'],
      },
      {
        id: '186555053',
        content: `you guys are way too invested in this
it's clearly creative writing practice
nobody's reflection is 0.3 seconds off
that's not how physics works`,
        timestamp: '12/03/24(Tue)17:08:17',
      },
      {
        id: '186555086',
        content: `>>186555053
>that's not how physics works
neither is a reflection leaving notes but here we are
sometimes you just gotta vibe with the narrative`,
        timestamp: '12/03/24(Tue)17:11:33',
        replyTo: ['186555053'],
      },
      {
        id: '186555119',
        content: `OP please leave another note asking what happens if you smash the mirror
i need to know how mirror-you would respond
this is important research`,
        timestamp: '12/03/24(Tue)17:14:18',
      },
      {
        id: '186555152',
        content: `>>186555119
don't do this OP
what if smashing the mirror is exactly what the third one wants
you'd be playing right into its hands`,
        timestamp: '12/03/24(Tue)17:17:42',
        replyTo: ['186555119'],
      },
      {
        id: '186555185',
        content: `the "we made eye contact" part is the scariest thing in this post
imagine being so aware of your own reflection being wrong
that you notice when it doesn't blink
OP either has incredible perception or incredible imagination`,
        timestamp: '12/03/24(Tue)17:20:17',
      },
      {
        id: '186555218',
        content: `>>186555185
or incredible psychosis
all three options are on the table tbh`,
        timestamp: '12/03/24(Tue)17:23:33',
        replyTo: ['186555185'],
      },
    ],
  },
  {
    id: '186558456',
    board: 'adv',
    subject: 'My therapist wants me to stop organizing my life by color code',
    content: `>be me
>everything in my apartment is color coded
>monday is blue, tuesday is green, etc
>this extends to EVERYTHING
>what i wear, what i eat, what i watch on tv
>if it's thursday (orange day) and i want to eat an apple
>i can't because apples are red or green
>have to eat an orange or carrot
>therapist says this is "controlling my life"
>but it's literally the only thing keeping chaos at bay
>tried to explain that if i break the system even once
>everything will collapse
>she asked what "collapse" means
>i don't know but i can feel it
>it's big and it's behind the colors
>she scheduled more sessions
>those sessions are on tuesdays
>so i have to wear green to them
>my life is very organized
>why is this a problem`,
    image: '🎨🧠',
    timestamp: '12/03/24(Tue)17:45:33',
    replies: [
      {
        id: '186558489',
        content: `>>186558456
this is textbook OCD my guy
"if i break the system everything will collapse"
is literally how compulsions work
your therapist is right to be concerned`,
        timestamp: '12/03/24(Tue)17:47:18',
        replyTo: ['186558456'],
      },
      {
        id: '186558522',
        content: `>can't eat an apple on thursday because apples aren't orange
peak /adv/ content
this is either the most elaborate troll or the most relatable post depending on who's reading`,
        timestamp: '12/03/24(Tue)17:50:42',
      },
      {
        id: '186558555',
        content: `>>186558489
>>186558522
wait but hear him out
he never said the system DOESN'T work
he said it's keeping chaos at bay
what if he's right and we're all just living in unorganized chaos`,
        timestamp: '12/03/24(Tue)17:53:17',
        replyTo: ['186558489', '186558522'],
      },
      {
        id: '186558588',
        content: `>>186558555
this is how cults start
"actually the weird behavior is correct and everyone else is wrong"
OP needs help not validation`,
        timestamp: '12/03/24(Tue)17:56:33',
        replyTo: ['186558555'],
      },
      {
        id: '186558621',
        content: `the fact that he doesn't know what "collapse" means but can FEEL it is the most terrifying part
his brain invented a consequence he can't even define
just a vague existential dread attached to breaking routine`,
        timestamp: '12/03/24(Tue)17:59:18',
      },
      {
        id: '186558654',
        content: `>>186558621
that's anxiety disorder 101
the fear doesn't need to be rational
it just needs to be FELT
OP's brain associated colors with safety and now it's stuck`,
        timestamp: '12/03/24(Tue)18:02:42',
        replyTo: ['186558621'],
      },
      {
        id: '186558687',
        content: `>she scheduled more sessions
>those sessions are on tuesdays
>so i have to wear green to them
unironically the most reasonable statement in this entire post
at least he's consistent`,
        timestamp: '12/03/24(Tue)18:05:17',
      },
      {
        id: '186558720',
        content: `OP what happens on leap year day
what color is february 29th
i need to know if the system accounts for calendar edge cases`,
        timestamp: '12/03/24(Tue)18:08:33',
      },
      {
        id: '186558753',
        content: `>>186558720
asking the real questions
also what about daylight savings
does the color shift at 2am or does he have to wear two colors that day`,
        timestamp: '12/03/24(Tue)18:11:18',
        replyTo: ['186558720'],
      },
      {
        id: '186558786',
        content: `>>186558456
>why is this a problem
because you can't eat apples on thursdays my brother in christ
the call is coming from inside the house`,
        timestamp: '12/03/24(Tue)18:14:42',
        replyTo: ['186558456'],
      },
      {
        id: '186558819',
        content: `genuinely though OP keep going to therapy
the fact that you're questioning why it's a problem means some part of you knows
that's actually good progress
don't listen to the people telling you the system works`,
        timestamp: '12/03/24(Tue)18:17:17',
      },
    ],
  },
  {
    id: '186561789',
    board: 'b',
    subject: 'I think my uber driver just saved my life but also ruined it',
    content: `>be me
>ordering uber at 3am after bad night out
>driver shows up in a 2003 honda civic with one working headlight
>i get in
>he doesn't say anything
>just drives
>realize 10 minutes later we're going the wrong direction
>about to say something
>he says "trust me"
>i don't but i'm also tired
>he stops at a 24 hour diner in the middle of nowhere
>says "you need to eat something"
>i didn't tell him i hadn't eaten in 2 days
>orders me pancakes and coffee
>sits across from me in silence while i eat
>drives me home after
>doesn't charge me
>haven't been able to stop thinking about it
>it's been 3 weeks
>who was this man
>why did he know
>my life is different now
>i eat breakfast every day
>i don't know how to feel about being seen by a stranger
>is this what being cared for feels like
>i never got his name`,
    image: '🚗😭',
    timestamp: '12/03/24(Tue)19:23:15',
    replies: [
      {
        id: '186561822',
        content: `>>186561789
this is either beautiful or a really elaborate kidnapping that just didn't pan out
either way OP is changed`,
        timestamp: '12/03/24(Tue)19:25:42',
        replyTo: ['186561789'],
      },
      {
        id: '186561855',
        content: `>i didn't tell him i hadn't eaten in 2 days
>he said "you need to eat something"
this implies he could TELL
some people just have that sense
my grandma was like that
she'd look at you and know you hadn't slept in days`,
        timestamp: '12/03/24(Tue)19:28:17',
      },
      {
        id: '186561888',
        content: `>>186561855
or OP looked like shit and was clearly having a crisis and the driver was just... kind
we underestimate how obvious our pain is to strangers sometimes`,
        timestamp: '12/03/24(Tue)19:31:33',
        replyTo: ['186561855'],
      },
      {
        id: '186561921',
        content: `the "trust me" line is doing a lot of heavy lifting here
imagine saying that to a passenger you're driving the wrong direction at 3am
power move
but also correct apparently`,
        timestamp: '12/03/24(Tue)19:34:18',
      },
      {
        id: '186561954',
        content: `>>186561789
>i don't know how to feel about being seen by a stranger
this is the most honest thing anyone has posted on this board in years
when someone acknowledges your pain without you asking them to
it breaks something open`,
        timestamp: '12/03/24(Tue)19:37:42',
        replyTo: ['186561789'],
      },
      {
        id: '186561987',
        content: `>>186561954
shut up i'm not crying about an uber driver greentext
this isn't allowed`,
        timestamp: '12/03/24(Tue)19:40:17',
        replyTo: ['186561954'],
      },
      {
        id: '186562020',
        content: `>i eat breakfast every day now
the real character development
this man fixed OP's life with pancakes and silence
no therapist in the world has this guy's methodology`,
        timestamp: '12/03/24(Tue)19:43:33',
      },
      {
        id: '186562053',
        content: `>>186562020
honestly "pancakes and silence" should be a therapy modality
just feed the client and shut up
let them figure it out`,
        timestamp: '12/03/24(Tue)19:46:18',
        replyTo: ['186562020'],
      },
      {
        id: '186562086',
        content: `OP you can probably find out who he is
uber keeps records
you could thank him`,
        timestamp: '12/03/24(Tue)19:49:42',
      },
      {
        id: '186562119',
        content: `>>186562086
no don't do this
the magic is in the anonymity
if OP finds him it becomes a transaction
right now it's just... grace
let it stay that way`,
        timestamp: '12/03/24(Tue)19:52:17',
        replyTo: ['186562086'],
      },
      {
        id: '186562152',
        content: `>2003 honda civic with one working headlight
this is the guardian angel aesthetic that movies miss
no glowing wings
just a busted car and intuition`,
        timestamp: '12/03/24(Tue)19:55:33',
      },
      {
        id: '186562185',
        content: `>>186562152
the one headlight is doing symbolic work and i refuse to elaborate`,
        timestamp: '12/03/24(Tue)19:58:18',
        replyTo: ['186562152'],
      },
    ],
  },
  {
    id: '186564567',
    board: 'g',
    subject: 'My code started writing itself and I\'m not sure I wrote it better',
    content: `>be me
>working on project at 2am
>fall asleep at keyboard
>wake up at 6am
>there's 847 new lines of code
>perfectly formatted
>solves the bug i was working on
>but also implements features i hadn't even planned
>my git shows commits every 20 minutes through the night
>all authored by me
>i don't remember any of this
>the code is... good
>better than my usual work
>cleaner architecture
>comments that actually explain things
>checked security cameras
>it's me typing
>eyes open
>but clearly not present
>do i have a programmer alter ego
>is my brain better at code when i'm not interfering
>should i be concerned or grateful
>the project is done now
>i don't feel like i earned it`,
    image: '💻😴',
    timestamp: '12/03/24(Tue)20:15:42',
    replies: [
      {
        id: '186564600',
        content: `>>186564567
>847 new lines of code
this number keeps showing up on this board
is there a significance or am i going schizo too`,
        timestamp: '12/03/24(Tue)20:17:33',
        replyTo: ['186564567'],
      },
      {
        id: '186564633',
        content: `>>186564600
bro it's just a number stop numerology posting`,
        timestamp: '12/03/24(Tue)20:20:18',
        replyTo: ['186564600'],
      },
      {
        id: '186564666',
        content: `>checked security cameras
>it's me typing
>eyes open
>but clearly not present

this is sleep coding and it's real
same as sleep walking but productive
some people clean their whole house asleep
OP writes clean code
we're not all dealt the same cards`,
        timestamp: '12/03/24(Tue)20:23:42',
      },
      {
        id: '186564699',
        content: `>>186564666
the comments that "actually explain things" is what gets me
OP's conscious mind doesn't comment well but his unconscious does
his brain is roasting him in his sleep`,
        timestamp: '12/03/24(Tue)20:26:17',
        replyTo: ['186564666'],
      },
      {
        id: '186564732',
        content: `>do i have a programmer alter ego
>is my brain better at code when i'm not interfering

these are the same question and the answer might be yes
your conscious mind is probably overthinking everything
sleep-you just Does The Thing`,
        timestamp: '12/03/24(Tue)20:29:33',
      },
      {
        id: '186564765',
        content: `>>186564732
this is why rubber duck debugging works
you have to explain it to bypass your own confusion
OP found the ultimate hack: be unconscious`,
        timestamp: '12/03/24(Tue)20:32:18',
        replyTo: ['186564732'],
      },
      {
        id: '186564798',
        content: `can you share the code
i want to see what sleep architecture looks like
for research purposes`,
        timestamp: '12/03/24(Tue)20:35:42',
      },
      {
        id: '186564831',
        content: `>>186564798
seconding
if sleep-OP really writes better code than awake-OP
there might be something to learn here`,
        timestamp: '12/03/24(Tue)20:38:17',
        replyTo: ['186564798'],
      },
      {
        id: '186564864',
        content: `>i don't feel like i earned it
imposter syndrome but make it dissociative
you literally watched yourself do it
on camera
you earned it even if you weren't "there"`,
        timestamp: '12/03/24(Tue)20:41:33',
      },
      {
        id: '186564897',
        content: `the darkest interpretation is that OP has been doing this for years and just never caught it
his whole career might be sleep-him carrying awake-him
and he's only now finding out`,
        timestamp: '12/03/24(Tue)20:44:18',
      },
      {
        id: '186564930',
        content: `>>186564897
delete this
this is too real
i don't want to wonder about my own accomplishments now`,
        timestamp: '12/03/24(Tue)20:47:42',
        replyTo: ['186564897'],
      },
      {
        id: '186564963',
        content: `>>186564567
>>186564930
what if the ENTIRE TECH INDUSTRY is just sleep coders
and we're all just vessels for our better unconscious selves
silicon valley is literally just a dormitory`,
        timestamp: '12/03/24(Tue)20:50:17',
        replyTo: ['186564567', '186564930'],
      },
    ],
  },
  {
    id: '186567890',
    board: 'ck',
    subject: 'I\'ve been meal prepping for someone who doesn\'t exist',
    content: `>be me
>live alone
>every sunday i meal prep for the week
>always make portions for two
>been doing this for 8 months
>realized today i have no idea why
>there's a second plate at dinner every night
>across from me
>empty
>i set it without thinking
>who am i cooking for
>checked my receipts
>i buy groceries for two
>my roommate budget line is $200/month
>i don't have a roommate
>apartment lease says single occupant
>am i grieving someone who never existed
>or preparing for someone who will
>either way the lasagna is excellent
>and there's always leftovers
>which i eat for lunch
>so technically it's not wasted
>but the plate stays across from me
>waiting`,
    image: '🍽️👻',
    timestamp: '12/03/24(Tue)21:15:33',
    replies: [
      {
        id: '186567923',
        content: `>>186567890
this is genuinely one of the saddest things i've read
you invented a dinner companion out of routine
your loneliness automated itself`,
        timestamp: '12/03/24(Tue)21:17:18',
        replyTo: ['186567890'],
      },
      {
        id: '186567956',
        content: `>am i grieving someone who never existed
>or preparing for someone who will

philosophy ck wasn't on my bingo card but here we are`,
        timestamp: '12/03/24(Tue)21:20:42',
      },
      {
        id: '186567989',
        content: `>>186567956
it's giving "set a place for elijah at the seder" energy
but secular and concerning`,
        timestamp: '12/03/24(Tue)21:23:17',
        replyTo: ['186567956'],
      },
      {
        id: '186568022',
        content: `>my roommate budget line is $200/month
>i don't have a roommate

OP's subconscious has better financial planning than most actual roommates
respect honestly`,
        timestamp: '12/03/24(Tue)21:26:33',
      },
      {
        id: '186568055',
        content: `>>186568022
he's paying rent to himself for a ghost he hasn't met yet
this is either mental illness or manifestation
and those are the same thing on this board`,
        timestamp: '12/03/24(Tue)21:29:18',
        replyTo: ['186568022'],
      },
      {
        id: '186568088',
        content: `the plate staying across from you
waiting
that detail broke me a little
you're not even clearing it
you're preserving space for absence`,
        timestamp: '12/03/24(Tue)21:32:42',
      },
      {
        id: '186568121',
        content: `>>186568088
stop making this poetic it's clearly a mental health issue
OP needs to talk to someone not get analyzed by cooking board philosophers`,
        timestamp: '12/03/24(Tue)21:35:17',
        replyTo: ['186568088'],
      },
      {
        id: '186568154',
        content: `>>186568121
counterpoint: sometimes the best therapy is cooking for two and waiting
OP might be doing exactly what he needs
even if he doesn't know why`,
        timestamp: '12/03/24(Tue)21:38:33',
        replyTo: ['186568121'],
      },
      {
        id: '186568187',
        content: `ok but is the lasagna actually excellent or is OP just coping
drop the recipe and we'll judge`,
        timestamp: '12/03/24(Tue)21:41:18',
      },
      {
        id: '186568220',
        content: `>>186568187
priorities
this man is having an existential crisis about phantom dinner guests
and you want the lasagna recipe
based and practical`,
        timestamp: '12/03/24(Tue)21:44:42',
        replyTo: ['186568187'],
      },
      {
        id: '186568253',
        content: `>>186567890
serious reply: you might be preparing for a future you want but haven't consciously accepted wanting

some part of you expects or hopes not to be alone forever

that's not unhealthy
it's just hope that took a weird form`,
        timestamp: '12/03/24(Tue)21:47:17',
        replyTo: ['186567890'],
      },
    ],
  },
  {
    id: '186571234',
    board: 'x',
    subject: 'The building across the street has the same people every day at 3:47pm',
    content: `>be me
>work from home
>desk faces window
>office building across the street
>every day at exactly 3:47pm
>the same 5 people walk past the same window
>in the same order
>same clothes
>same movements
>i've been watching for 2 months
>took photos to compare
>identical
>down to the arm positions
>like a gif on loop
>told my friend
>he watched with me yesterday
>said he sees different people each time
>we were looking at the same window
>am i stuck in some kind of personal time loop
>or is that building a glitch
>or is my brain generating the same memory repeatedly
>either way those 5 people don't know they're haunting me
>or maybe they do
>the third one from the left looked at me once
>right at me
>she waved
>she wasn't supposed to wave
>she'd never done it before
>i haven't looked out the window since`,
    image: '🏢⏰',
    timestamp: '12/03/24(Tue)22:23:42',
    replies: [
      {
        id: '186571267',
        content: `>>186571234
>she waved
>she wasn't supposed to wave
>she'd never done it before

SHE KNOWS YOURE WATCHING
this went from pattern observation to witness protection real fast`,
        timestamp: '12/03/24(Tue)22:25:33',
        replyTo: ['186571234'],
      },
      {
        id: '186571300',
        content: `>same clothes
>same movements
>like a gif on loop

or hear me out
they have a uniform and walk to the same meeting at the same time every day
corporate NPCs are predictable
doesn't have to be paranormal`,
        timestamp: '12/03/24(Tue)22:28:17',
      },
      {
        id: '186571333',
        content: `>>186571300
>>186571234
then explain why his friend saw different people
they were looking at THE SAME WINDOW
same time
different observations
that's either a mental health situation or a reality situation`,
        timestamp: '12/03/24(Tue)22:31:42',
        replyTo: ['186571300', '186571234'],
      },
      {
        id: '186571366',
        content: `the photos comparing arm positions is such an unhinged level of documentation
OP really said "this is either nothing or everything and i need proof"`,
        timestamp: '12/03/24(Tue)22:34:17',
      },
      {
        id: '186571399',
        content: `>>186571366
when you suspect your reality is glitched the only rational response IS documentation
OP is doing science
weird upsetting science but science`,
        timestamp: '12/03/24(Tue)22:37:33',
        replyTo: ['186571366'],
      },
      {
        id: '186571432',
        content: `>i haven't looked out the window since
coward
you HAVE to look
she broke the pattern
she became aware
this is either the start of contact or the start of horror
either way you have to know`,
        timestamp: '12/03/24(Tue)22:40:18',
      },
      {
        id: '186571465',
        content: `>>186571432
or maybe she just waved at someone because people do that
and OP's pattern-seeking brain is creating meaning where there isn't any
sometimes a wave is just a wave`,
        timestamp: '12/03/24(Tue)22:43:42',
        replyTo: ['186571432'],
      },
      {
        id: '186571498',
        content: `>>186571465
she was third from the left
the THIRD ONE
remember the mirror note guy?
"the third one"
what if it's connected`,
        timestamp: '12/03/24(Tue)22:46:17',
        replyTo: ['186571465'],
      },
      {
        id: '186571531',
        content: `>>186571498
you're connecting random schizo posts on a cooking board
this is how conspiracy thinking starts
two people said the number three and now it's a pattern`,
        timestamp: '12/03/24(Tue)22:49:33',
        replyTo: ['186571498'],
      },
      {
        id: '186571564',
        content: `>>186571531
>cooking board
sir this is /x/`,
        timestamp: '12/03/24(Tue)22:52:18',
        replyTo: ['186571531'],
      },
      {
        id: '186571597',
        content: `>every day at exactly 3:47pm
3+4+7 = 14 = 1+4 = 5
5 people in the window
COINCIDENCE???
yes probably but i'm posting it anyway`,
        timestamp: '12/03/24(Tue)22:55:42',
      },
      {
        id: '186571630',
        content: `>>186571597
numerology anon strikes again
next you'll be telling us 3:47 backwards is a demon's name`,
        timestamp: '12/03/24(Tue)22:58:17',
        replyTo: ['186571597'],
      },
      {
        id: '186571663',
        content: `OP genuinely though if you're seeing patterns your friend doesn't see
either you're noticing something real
or you're experiencing early psychosis
get checked out either way
then come back and tell us if she waves again`,
        timestamp: '12/03/24(Tue)23:01:33',
      },
    ],
  },
  {
    id: '186574567',
    board: 'adv',
    subject: 'I\'ve been sending good morning texts to a dead number for 3 years',
    content: `>be me
>best friend dies in accident 3 years ago
>we used to text good morning every day
>i never stopped
>her number got reassigned 6 months after
>i know this because sometimes someone replies
>"wrong number"
>"who is this"
>"please stop"
>i apologize but i don't stop
>every morning at 7:15
>"good morning, hope you're doing okay"
>the new person stopped replying a year ago
>but they haven't blocked me
>which means they receive it
>someone out there gets a good morning text meant for a ghost
>is this harassment
>is this grief
>is this just how i wake up now
>i don't know how to not do this anymore
>it's the first thing i do every day
>before coffee
>before bathroom
>good morning to nobody who will answer
>anyway she would've thought this was pathetic
>which is how i know she's really gone
>she'd have roasted me so hard for this`,
    image: '📱💔',
    timestamp: '12/03/24(Tue)23:23:15',
    replies: [
      {
        id: '186574600',
        content: `>>186574567
>they haven't blocked me
>which means they receive it
>someone out there gets a good morning text meant for a ghost

i came to /adv/ for laughs not to feel things
what is this`,
        timestamp: '12/03/24(Tue)23:25:42',
        replyTo: ['186574567'],
      },
      {
        id: '186574633',
        content: `>she would've thought this was pathetic
>which is how i know she's really gone
>she'd have roasted me so hard for this

and now I'M crying in a dennys parking lot thanks`,
        timestamp: '12/03/24(Tue)23:28:17',
      },
      {
        id: '186574666',
        content: `this is either incredibly beautiful or genuinely concerning behavior
possibly both
grief does weird things to us`,
        timestamp: '12/03/24(Tue)23:31:42',
      },
      {
        id: '186574699',
        content: `>>186574666
it's not harassment if they can block at any time
the fact that they choose to receive it is... something
maybe they need a good morning text from a stranger too`,
        timestamp: '12/03/24(Tue)23:34:17',
        replyTo: ['186574666'],
      },
      {
        id: '186574732',
        content: `>is this harassment
>is this grief
>is this just how i wake up now

all three can be true simultaneously
that's the thing about human behavior
motivations stack`,
        timestamp: '12/03/24(Tue)23:37:33',
      },
      {
        id: '186574765',
        content: `the structure of this:
>before coffee
>before bathroom
>good morning to nobody who will answer

poetry hidden in a greentext
OP is a secret writer`,
        timestamp: '12/03/24(Tue)23:40:18',
      },
      {
        id: '186574798',
        content: `>>186574765
grief makes writers of us all
you have to find somewhere to put it
OP chose a dead phone number
others choose the void of the internet`,
        timestamp: '12/03/24(Tue)23:43:42',
        replyTo: ['186574765'],
      },
      {
        id: '186574831',
        content: `ok actual advice:
1. you should talk to a grief counselor
2. maybe consider a journal instead of a stranger's phone
3. but also don't be too hard on yourself
4. this is weird but it's also clearly helping you function
5. just try to evolve it into something that doesn't involve an unwilling third party`,
        timestamp: '12/03/24(Tue)23:46:17',
      },
      {
        id: '186574864',
        content: `>>186574831
>unwilling third party
but are they unwilling?
they could block at any time
they're CHOOSING to receive
maybe they need this too`,
        timestamp: '12/03/24(Tue)23:49:33',
        replyTo: ['186574831'],
      },
      {
        id: '186574897',
        content: `>>186574864
you're projecting hope onto a stranger's inaction
they might just not care enough to block
don't romanticize apathy as connection`,
        timestamp: '12/03/24(Tue)23:52:18',
        replyTo: ['186574864'],
      },
      {
        id: '186574930',
        content: `>she'd have roasted me so hard for this
this is the line that proves you knew her
because only someone who really knew someone can guess their reaction to something hypothetical
you're not just mourning a person
you're mourning a voice in your head that knew you too`,
        timestamp: '12/03/24(Tue)23:55:42',
      },
      {
        id: '186574963',
        content: `>>186574930
ok that one broke me
you're right
grief isn't just losing someone
it's losing someone who saw you
who would've had opinions about your choices
now you have to imagine them
and it's never accurate enough`,
        timestamp: '12/03/24(Tue)23:58:17',
        replyTo: ['186574930'],
      },
    ],
  },
]

// ============================================================================
// DB Adapters
// ============================================================================

/** Adapt a DB SiteContentItem to the local Thread interface */
function dbToThread(item: SiteContentItem): Thread {
  const m = item.metadata || {}
  return {
    id: item.slug,
    board: m.board || item.category || 'b',
    subject: item.title || m.subject,
    content: item.body || item.summary || '',
    image: item.thumbnailEmoji || m.image,
    timestamp: m.timestamp || new Date((item.publishedAt || item.createdAt) * 1000).toLocaleString(),
    replies: Array.isArray(m.replies) ? (m.replies as Reply[]) : [],
    name: m.name,
    tripcode: m.tripcode,
    sticky: item.isPinned || m.sticky || false,
    locked: m.locked || false,
  }
}

/** Adapt a DB SiteCategory to the local Board interface */
function dbToBoard(cat: SiteCategory): Board {
  return {
    id: cat.slug,
    name: cat.name,
    description: cat.description || '',
  }
}

// ============================================================================
// Components
// ============================================================================

export function ForChanSite({ siteId, path, onNavigate, onPathChange }: SiteProps) {
  // Fetch from DB with fallback to hardcoded data
  const { content: dbContent } = useSiteContent('forchan')
  const { categories: dbCategories } = useSiteCategories('forchan')

  const threads = useMemo(() => {
    if (dbContent.length > 0) return dbContent.map(dbToThread)
    return SAMPLE_THREADS
  }, [dbContent])

  const boards = useMemo(() => {
    if (dbCategories.length > 0) return dbCategories.map(dbToBoard)
    return BOARDS
  }, [dbCategories])

  const [selectedBoard, setSelectedBoard] = useState<string | null>(null)
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null)

  // Track if we're updating from path (to avoid triggering onPathChange)
  const isUpdatingFromPath = useRef(false)

  // Parse path and update state when path changes (from browser back/forward)
  useEffect(() => {
    isUpdatingFromPath.current = true

    if (!path) {
      setSelectedThread(null)
      setSelectedBoard(null)
    } else if (path.match(/^\/[a-z]+\/thread\/\d+$/)) {
      // Thread path: /g/thread/94817234
      const match = path.match(/^\/([a-z]+)\/thread\/(\d+)$/)
      if (match) {
        const [, boardId, threadId] = match
        const thread = threads.find(t => t.id === threadId)
        if (thread) {
          setSelectedBoard(boardId)
          setSelectedThread(thread)
        }
      }
    } else if (path.match(/^\/[a-z]+$/)) {
      // Board path: /g
      const boardId = path.slice(1)
      if (boards.some(b => b.id === boardId)) {
        setSelectedThread(null)
        setSelectedBoard(boardId)
      }
    }

    // Reset flag after state updates
    setTimeout(() => {
      isUpdatingFromPath.current = false
    }, 0)
  }, [path])

  // Navigation handlers that update both state and path
  const handleSelectBoard = (boardId: string | null) => {
    setSelectedBoard(boardId)
    setSelectedThread(null)
    if (boardId) {
      onPathChange?.('/' + boardId)
    } else {
      onPathChange?.(null)
    }
  }

  const handleSelectThread = (thread: Thread) => {
    setSelectedThread(thread)
    onPathChange?.('/' + thread.board + '/thread/' + thread.id)
  }

  const handleBackFromThread = () => {
    setSelectedThread(null)
    if (selectedBoard) {
      onPathChange?.('/' + selectedBoard)
    } else {
      onPathChange?.(null)
    }
  }

  const displayedThreads = selectedBoard
    ? threads.filter(t => t.board === selectedBoard)
    : threads

  return (
    <div className="min-h-full" style={{ background: site.theme.background }}>
      {/* Header */}
      <header
        className="text-center py-3 px-4"
        style={{ background: site.theme.headerBg, borderBottom: `1px solid ${site.theme.border}` }}
      >
        <h1
          className="text-2xl font-bold"
          style={{ color: site.theme.headerText }}
        >
          {site.name}
        </h1>
        <p className="text-sm" style={{ color: site.theme.textMuted }}>
          {site.tagline}
        </p>
      </header>

      {/* Board Navigation */}
      <nav
        className="px-4 py-2 text-center text-sm border-b"
        style={{ background: site.theme.surface, borderColor: site.theme.border }}
      >
        <span className="font-bold mr-2" style={{ color: site.theme.text }}>[ </span>
        <button
          onClick={() => handleSelectBoard(null)}
          className="hover:underline"
          style={{ color: selectedBoard === null ? site.theme.linkVisited : site.theme.link }}
        >
          Home
        </button>
        {boards.map((board, i) => (
          <span key={board.id}>
            <span style={{ color: site.theme.text }}> / </span>
            <button
              onClick={() => handleSelectBoard(board.id)}
              className="hover:underline"
              style={{ color: selectedBoard === board.id ? site.theme.linkVisited : site.theme.link }}
            >
              {board.id}
            </button>
          </span>
        ))}
        <span className="font-bold ml-2" style={{ color: site.theme.text }}> ]</span>
      </nav>

      {/* Board Info */}
      {selectedBoard && !selectedThread && (
        <div
          className="text-center py-4 px-4"
          style={{ background: site.theme.surface, borderBottom: `1px solid ${site.theme.border}` }}
        >
          <h2 className="text-xl font-bold" style={{ color: site.theme.boardTitle }}>
            /{selectedBoard}/ - {boards.find(b => b.id === selectedBoard)?.name}
          </h2>
          <p className="text-sm italic" style={{ color: site.theme.textMuted }}>
            {boards.find(b => b.id === selectedBoard)?.description}
          </p>
        </div>
      )}

      {/* Content */}
      <main className="p-4 max-w-4xl mx-auto">
        {selectedThread ? (
          <ThreadView
            thread={selectedThread}
            onBack={handleBackFromThread}
          />
        ) : (
          <div className="space-y-4">
            {/* Post Form */}
            <div
              className="p-3 text-center"
              style={{ background: site.theme.surface, border: `1px solid ${site.theme.border}` }}
            >
              <div className="mb-2">
                <input
                  type="text"
                  placeholder="Name"
                  className="px-2 py-1 text-sm mr-2"
                  style={{
                    background: site.theme.inputBg,
                    border: `1px solid ${site.theme.border}`,
                    color: site.theme.text,
                  }}
                />
                <input
                  type="text"
                  placeholder="Subject"
                  className="px-2 py-1 text-sm"
                  style={{
                    background: site.theme.inputBg,
                    border: `1px solid ${site.theme.border}`,
                    color: site.theme.text,
                  }}
                />
              </div>
              <div className="mb-2">
                <textarea
                  placeholder="Comment"
                  rows={4}
                  className="w-full max-w-md px-2 py-1 text-sm resize-none"
                  style={{
                    background: site.theme.inputBg,
                    border: `1px solid ${site.theme.border}`,
                    color: site.theme.text,
                  }}
                />
              </div>
              <button
                className="px-4 py-1 text-sm"
                style={{
                  background: site.theme.buttonBg,
                  border: `1px solid ${site.theme.border}`,
                  color: site.theme.text,
                }}
              >
                Post
              </button>
            </div>

            <hr style={{ borderColor: site.theme.border }} />

            {/* Thread List */}
            {displayedThreads.map((thread) => (
              <ThreadPreview
                key={thread.id}
                thread={thread}
                onClick={() => handleSelectThread(thread)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Sketchy Ads */}
      <div className="max-w-4xl mx-auto px-4 pb-4">
        <SidebarAdWidget
          siteId="forchan"
          onNavigate={onNavigate}
          title="Ads"
          count={2}
        />
      </div>

      {/* Footer */}
      <footer
        className="text-center py-4 text-xs"
        style={{ color: site.theme.textMuted, borderTop: `1px solid ${site.theme.border}` }}
      >
        <p>All content is fictional. All trademarks belong to their respective owners.</p>
        <p className="mt-1">
          <button className="hover:underline" style={{ color: site.theme.link }}>FAQ</button>
          {' | '}
          <button className="hover:underline" style={{ color: site.theme.link }}>Rules</button>
          {' | '}
          <button className="hover:underline" style={{ color: site.theme.link }}>Contact</button>
        </p>
      </footer>
    </div>
  )
}

// ============================================================================
// Thread Preview Component
// ============================================================================

interface ThreadPreviewProps {
  thread: Thread
  onClick: () => void
}

function ThreadPreview({ thread, onClick }: ThreadPreviewProps) {
  return (
    <div
      className="p-3"
      style={{ background: site.theme.postBg, border: `1px solid ${site.theme.border}` }}
    >
      {/* Thread Header */}
      <div className="flex flex-wrap items-center gap-2 text-sm mb-2">
        {thread.sticky && (
          <span className="px-1 text-xs font-bold" style={{ color: site.theme.sticky }}>
            📌 Sticky
          </span>
        )}
        {thread.locked && (
          <span className="px-1 text-xs font-bold" style={{ color: site.theme.locked }}>
            🔒 Locked
          </span>
        )}
        {thread.subject && (
          <span className="font-bold" style={{ color: site.theme.subject }}>
            {thread.subject}
          </span>
        )}
        <span style={{ color: thread.tripcode ? site.theme.tripcode : site.theme.name }}>
          {thread.name || 'Anonymous'}
          {thread.tripcode && <span className="ml-1">{thread.tripcode}</span>}
        </span>
        <span style={{ color: site.theme.textMuted }}>
          {thread.timestamp}
        </span>
        <span style={{ color: site.theme.postId }}>
          No.{thread.id}
        </span>
        <button
          onClick={onClick}
          className="hover:underline"
          style={{ color: site.theme.link }}
        >
          [Reply]
        </button>
      </div>

      {/* Thread Content */}
      <div className="flex gap-3">
        {thread.image && (
          <div
            className="w-32 h-32 flex-shrink-0 flex items-center justify-center text-4xl"
            style={{ background: site.theme.thumbnailBg }}
          >
            {thread.image}
          </div>
        )}
        <div className="flex-1">
          <PostContent content={thread.content} />
          <p className="mt-2 text-sm" style={{ color: site.theme.textMuted }}>
            {thread.replies.length} replies
          </p>
        </div>
      </div>

      {/* Preview of last 2 replies */}
      {thread.replies.length > 0 && (
        <div className="mt-3 space-y-2 border-l-2 pl-3" style={{ borderColor: site.theme.border }}>
          {thread.replies.slice(-2).map((reply) => (
            <div key={reply.id} className="text-sm">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span style={{ color: reply.tripcode ? site.theme.tripcode : site.theme.name }}>
                  {reply.name || 'Anonymous'}
                  {reply.tripcode && <span className="ml-1">{reply.tripcode}</span>}
                </span>
                <span style={{ color: site.theme.textMuted }}>{reply.timestamp}</span>
                <span style={{ color: site.theme.postId }}>No.{reply.id}</span>
              </div>
              <PostContent content={reply.content.slice(0, 150) + (reply.content.length > 150 ? '...' : '')} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================================================
// Thread View Component
// ============================================================================

interface ThreadViewProps {
  thread: Thread
  onBack: () => void
}

function ThreadView({ thread, onBack }: ThreadViewProps) {
  return (
    <div>
      <button
        onClick={onBack}
        className="mb-4 text-sm hover:underline"
        style={{ color: site.theme.link }}
      >
        [Return] [Catalog]
      </button>

      {/* OP Post */}
      <div
        className="p-3 mb-4"
        style={{ background: site.theme.postBg, border: `1px solid ${site.theme.border}` }}
      >
        <div className="flex flex-wrap items-center gap-2 text-sm mb-2">
          {thread.sticky && (
            <span className="px-1 text-xs font-bold" style={{ color: site.theme.sticky }}>
              📌 Sticky
            </span>
          )}
          {thread.subject && (
            <span className="font-bold" style={{ color: site.theme.subject }}>
              {thread.subject}
            </span>
          )}
          <span style={{ color: thread.tripcode ? site.theme.tripcode : site.theme.name }}>
            {thread.name || 'Anonymous'}
            {thread.tripcode && <span className="ml-1">{thread.tripcode}</span>}
          </span>
          <span style={{ color: site.theme.textMuted }}>
            {thread.timestamp}
          </span>
          <span style={{ color: site.theme.postId }}>
            No.{thread.id}
          </span>
        </div>

        <div className="flex gap-3">
          {thread.image && (
            <div
              className="w-48 h-48 flex-shrink-0 flex items-center justify-center text-6xl cursor-pointer hover:opacity-80"
              style={{ background: site.theme.thumbnailBg }}
            >
              {thread.image}
            </div>
          )}
          <div className="flex-1">
            <PostContent content={thread.content} />
          </div>
        </div>
      </div>

      {/* Reply Form */}
      <div
        className="p-3 mb-4 text-center"
        style={{ background: site.theme.surface, border: `1px solid ${site.theme.border}` }}
      >
        <div className="mb-2">
          <input
            type="text"
            placeholder="Name"
            className="px-2 py-1 text-sm mr-2"
            style={{
              background: site.theme.inputBg,
              border: `1px solid ${site.theme.border}`,
              color: site.theme.text,
            }}
          />
        </div>
        <div className="mb-2">
          <textarea
            placeholder="Comment"
            rows={3}
            className="w-full max-w-md px-2 py-1 text-sm resize-none"
            style={{
              background: site.theme.inputBg,
              border: `1px solid ${site.theme.border}`,
              color: site.theme.text,
            }}
          />
        </div>
        <button
          className="px-4 py-1 text-sm"
          style={{
            background: site.theme.buttonBg,
            border: `1px solid ${site.theme.border}`,
            color: site.theme.text,
          }}
        >
          Post Reply
        </button>
      </div>

      {/* Replies */}
      <div className="space-y-2">
        {thread.replies.map((reply) => (
          <ReplyPost key={reply.id} reply={reply} />
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// Reply Post Component
// ============================================================================

interface ReplyPostProps {
  reply: Reply
}

function ReplyPost({ reply }: ReplyPostProps) {
  return (
    <div
      className="p-3"
      style={{ background: site.theme.replyBg, border: `1px solid ${site.theme.border}` }}
    >
      <div className="flex flex-wrap items-center gap-2 text-sm mb-2">
        <span style={{ color: reply.tripcode ? site.theme.tripcode : site.theme.name }}>
          {reply.name || 'Anonymous'}
          {reply.tripcode && <span className="ml-1">{reply.tripcode}</span>}
        </span>
        <span style={{ color: site.theme.textMuted }}>
          {reply.timestamp}
        </span>
        <span style={{ color: site.theme.postId }}>
          No.{reply.id}
        </span>
      </div>

      <div className="flex gap-3">
        {reply.image && (
          <div
            className="w-32 h-32 flex-shrink-0 flex items-center justify-center text-4xl cursor-pointer hover:opacity-80"
            style={{ background: site.theme.thumbnailBg }}
          >
            {reply.image}
          </div>
        )}
        <div className="flex-1">
          <PostContent content={reply.content} />
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Post Content Component (handles greentext and quotes)
// ============================================================================

interface PostContentProps {
  content: string
}

function PostContent({ content }: PostContentProps) {
  const lines = content.split('\n')

  return (
    <div className="text-sm whitespace-pre-wrap" style={{ color: site.theme.text }}>
      {lines.map((line, i) => {
        // Quote link (>>number)
        const quoteMatch = line.match(/^(>>\d+)(.*)/)
        if (quoteMatch) {
          return (
            <p key={i}>
              <span
                className="hover:underline cursor-pointer"
                style={{ color: site.theme.quoteLink }}
              >
                {quoteMatch[1]}
              </span>
              <span>{quoteMatch[2]}</span>
            </p>
          )
        }

        // Greentext (>text but not >>)
        if (line.startsWith('>') && !line.startsWith('>>')) {
          return (
            <p key={i} style={{ color: site.theme.greentext }}>
              {line}
            </p>
          )
        }

        // Regular text
        return <p key={i}>{line}</p>
      })}
    </div>
  )
}

export default ForChanSite
