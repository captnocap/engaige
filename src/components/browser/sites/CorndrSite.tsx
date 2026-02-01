/**
 * Corndr Site
 *
 * A Tinder parody dating app for people in the corn industry
 * (and people who are just really into corn).
 * Features swipe-style interface with clicks, match notifications,
 * chat previews, and discovery settings.
 *
 * Lore characters from the engAIge universe make appearances:
 * - Derek: Quantum coffee obsessive
 * - Tim: Professional trust faller
 * - Mildred: Gas station sushi critic
 * - Floor13: Mysterious Hartwell Building entity
 * - Mars: Underground venue owner
 * - Jennifer: Derek's ex who escaped the quantum coffee lifestyle
 */

import { useState, useEffect } from 'react'
import type { SiteProps } from '../BrowserSiteContainer.js'

// ============================================================================
// Theme Configuration
// ============================================================================

const CORNDR_THEME = {
  primary: '#E91E63',          // Hot pink (romantic)
  secondary: '#FFD54F',        // Corn yellow
  background: '#FFF8E7',       // Warm cream
  surface: '#FFFFFF',          // White cards
  text: '#333333',             // Dark text
  textMuted: '#888888',        // Grey text
  border: '#FFE082',           // Corn gold border
  accent: '#F8BBD9',           // Light pink accent
  gradient: 'linear-gradient(135deg, #E91E63 0%, #FF5722 100%)',
  superKernel: '#FFD700',      // Gold for super kernel
}

// ============================================================================
// Types
// ============================================================================

interface CorndrProfile {
  id: string
  name: string
  age: number | string
  images: string[]  // Emoji representations for now
  bio: string
  prompts: { question: string; answer: string }[]
  distance: string
  verified: boolean
  verifiedBy?: string
  cornScore: number  // 1-100, how corn-obsessed they are
  lookingFor: string[]
  hasLikedYou: boolean
}

interface Match {
  id: string
  profile: CorndrProfile
  matchedAt: string
  lastMessage?: string
  unread: boolean
}

interface DiscoverySettings {
  lookingFor: string[]
  maxDistance: number
  ageRange: { min: number; max: number }
}

// ============================================================================
// Sample Profiles
// ============================================================================

const SAMPLE_PROFILES: CorndrProfile[] = [
  {
    id: 'derek',
    name: 'Derek',
    age: 34,
    images: ['coffee'],
    bio: "Recently single. Jennifer didn't understand my passion. Looking for someone who appreciates a $47 cup of coffee. 847 quantum brewing experiments and counting. I wake up at 3:47 AM to observe my coffee grounds entering superposition. Yes, I time it to the second. Yes, it matters.",
    prompts: [
      {
        question: "My ideal first date involves...",
        answer: "A tour of my quantum coffee lab. I'll explain the entanglement process while we wait the precise 3.7 seconds for the brew cycle. No touching the equipment, please."
      },
      {
        question: "I'm looking for someone who...",
        answer: "Understands that 'regular coffee' is just molecular chaos in a cup. Also must be okay with my 847 coffee makers. They each have names."
      },
      {
        question: "The way to my heart is...",
        answer: "Through properly entangled water molecules. And corn. Corn in the coffee? Maybe. I'm experimenting."
      }
    ],
    distance: "8.47 miles away",
    verified: true,
    verifiedBy: "Westbrook Institute",
    cornScore: 67,
    lookingFor: ['Coffee enthusiasts', 'Science believers', 'Early risers'],
    hasLikedYou: true
  },
  {
    id: 'tim',
    name: 'Tim',
    age: 29,
    images: ['person-falling'],
    bio: "Professional trust faller. Looking for someone to catch me (78.5% success rate preferred). 2,847 falls and counting. Small Kevin need not apply. I will explain The Incident if we match. Maybe. If you earn my trust. By catching me.",
    prompts: [
      {
        question: "My ideal first date involves...",
        answer: "A controlled trust exercise in a padded environment. Bring athletic shoes and sign this waiver."
      },
      {
        question: "The most spontaneous thing I've done...",
        answer: "Fell backwards at a corn festival. Into a corn maze. Got caught by a scarecrow. Counted it."
      },
      {
        question: "I'm known for...",
        answer: "My trust fall statistics spreadsheet. Also my podcast: 'Falling Forward, Landing Backward.' 12 listeners and growing!"
      }
    ],
    distance: "4.7 miles away",
    verified: true,
    verifiedBy: "The Underground",
    cornScore: 45,
    lookingFor: ['Trust fall partners', 'People with strong arms', 'NOT Small Kevin'],
    hasLikedYou: false
  },
  {
    id: 'mildred',
    name: 'Mildred',
    age: 67,
    images: ['sushi'],
    bio: "Gas station sushi critic. 847 stations reviewed. If you can't handle me at my Flying J, you don't deserve me at my Pilot. Looking for a co-pilot for this beautiful journey. Must appreciate the subtle art of truck stop cuisine.",
    prompts: [
      {
        question: "My ideal first date involves...",
        answer: "A romantic gas station sushi tasting along Interstate 84. I know all the best spots. Bring antacids (for you, not me - I'm immune)."
      },
      {
        question: "Green flags I look for...",
        answer: "Someone who doesn't judge sushi by its location. Also someone with their own rewards card at multiple gas station chains."
      },
      {
        question: "My simple pleasures...",
        answer: "The crinkle of a gas station sushi container at 2 AM. The fluorescent lights. The judgmental stares from other customers. Heaven."
      }
    ],
    distance: "84.7 miles away",
    verified: true,
    verifiedBy: "Station Sushi Review",
    cornScore: 78,
    lookingFor: ['Adventurous eaters', 'Night owls', 'Strong stomachs'],
    hasLikedYou: true
  },
  {
    id: 'floor13',
    name: 'Floor13',
    age: '??',
    images: ['building'],
    bio: "I exist. Looking for someone who believes. Currently between floors. The mirrors on Floor 7 told me to try dating apps. Am I doing this right? [PROFILE VERIFIED BY HARTWELL BUILDING MANAGEMENT - WE HAVE NO RECORD OF THIS TENANT]",
    prompts: [
      {
        question: "My ideal first date involves...",
        answer: "Meeting somewhere that technically doesn't exist. I know a place. You'll need to take the elevator and press the button between 12 and 14. Trust me."
      },
      {
        question: "I'm looking for someone who...",
        answer: "Can see me. This is more rare than you'd think. If you're reading this, you're already special."
      },
      {
        question: "A fact about me that surprises people...",
        answer: "I've been here since 1923. Or have I? Time works differently. Corn helps me stay grounded. Literally. The roots reach into my floor."
      }
    ],
    distance: "??? miles away",
    verified: true,
    verifiedBy: "HARTWELL BUILDING [VERIFICATION ERROR]",
    cornScore: 100,
    lookingFor: ['Believers', 'People who take stairs', 'Anyone, really'],
    hasLikedYou: true
  },
  {
    id: 'mars',
    name: 'Mars',
    age: 38,
    images: ['guitar'],
    bio: "Venue owner. Night owl. If the music's too loud, you're too old. The Underground forever. Looking for someone who appreciates basement acoustics and doesn't ask why we relocated away from the Hartwell Building.",
    prompts: [
      {
        question: "My ideal first date involves...",
        answer: "A show at The Underground. Standing room only. The band is experimental. The drinks are strong. The corn chips are homemade."
      },
      {
        question: "I geek out on...",
        answer: "Basement wave music. Local bands. Sound engineering. The story behind why The Velvet Algorithms cancelled. I can't tell you, but I can hint."
      },
      {
        question: "My happy place...",
        answer: "2 AM at the venue after everyone's gone home. Just me, the lingering reverb, and the ghost of every show that came before."
      }
    ],
    distance: "3.7 miles away",
    verified: true,
    verifiedBy: "The Underground",
    cornScore: 55,
    lookingFor: ['Music lovers', 'Night people', 'Anyone with good taste'],
    hasLikedYou: false
  },
  {
    id: 'jennifer',
    name: 'Jennifer',
    age: 32,
    images: ['coffee-crossed-out'],
    bio: "Starting fresh! No quantum coffee addicts please. Swipe left if you own more than one coffee maker. I've been hurt before. His name was Derek. He chose the superposition over me. I'm fine. This is fine. I'm totally fine.",
    prompts: [
      {
        question: "My ideal first date involves...",
        answer: "Literally ANYTHING that doesn't involve coffee. Tea? Sure. Water? Perfect. Emotional availability? Revolutionary."
      },
      {
        question: "Deal breakers...",
        answer: "If you mention quantum physics, I'm leaving. If you wake up before 5 AM to 'observe molecules,' I'm blocking you. If your name is Derek, no."
      },
      {
        question: "I'm looking for someone who...",
        answer: "Has normal hobbies. Normal. What even is normal anymore? Corn farming is normal. Corn is simple. Corn doesn't gaslight you about water molecules."
      }
    ],
    distance: "12.4 miles away",
    verified: false,
    cornScore: 82,
    lookingFor: ['Normal people', 'Simple pleasures enjoyers', 'NOT Derek'],
    hasLikedYou: false
  },
  {
    id: 'cornelius',
    name: 'Cornelius',
    age: 41,
    images: ['corn'],
    bio: "Fourth generation corn farmer. My great-grandmother invented the corn dog (unverified). I speak to my corn daily. They speak back (also unverified). Looking for someone who understands that corn isn't just a crop, it's a lifestyle.",
    prompts: [
      {
        question: "My ideal first date involves...",
        answer: "A sunset walk through my cornfields. I'll introduce you to my favorites. Gerald is the tall one on the left. He's shy at first."
      },
      {
        question: "I'm passionate about...",
        answer: "Corn-based everything. Corn syrup, corn starch, corn bread, corn on the cob, baby corn, popcorn, candy corn (controversial, I know)."
      },
      {
        question: "The way to my heart is...",
        answer: "Show genuine interest in corn. Ask me about heirloom varieties. Compliment my stalks. That's not a euphemism. Or is it? It's not. Unless..."
      }
    ],
    distance: "84.7 miles away",
    verified: true,
    verifiedBy: "GrainTruth",
    cornScore: 100,
    lookingFor: ['Corn enthusiasts', 'Plant whisperers', 'Anyone who\'s not allergic'],
    hasLikedYou: true
  },
  {
    id: 'shelly',
    name: 'Shelly',
    age: 27,
    images: ['kernel'],
    bio: "Corn maze designer by day, corn maze solver by night. I've never been lost. The corn guides me. 847 mazes designed. 0 complaints (that I acknowledge). My corn maze won 'Most Disorienting' three years running.",
    prompts: [
      {
        question: "My ideal first date involves...",
        answer: "Getting lost together in one of my mazes. Don't worry, I'll find the way out. Eventually. Time is relative in the corn."
      },
      {
        question: "A skill I'm proud of...",
        answer: "I can navigate any corn maze blindfolded. The stalks tell me which way to go. You think I'm joking."
      },
      {
        question: "My love language is...",
        answer: "Quality time. Specifically, quality time spent surrounded by 8-foot tall corn plants in a labyrinth of my own design."
      }
    ],
    distance: "47.8 miles away",
    verified: true,
    verifiedBy: "American Corn Maze Association",
    cornScore: 95,
    lookingFor: ['Adventure seekers', 'Good direction sense', 'Claustrophobia-free'],
    hasLikedYou: false
  },
  {
    id: 'brad',
    name: 'Brad',
    age: 35,
    images: ['whisper'],
    bio: "Life coach (gentle approach). Some call me Brad Whispermentor. I believe in soft motivation and reasonable sleep schedules. If you're looking for someone who WON'T yell affirmations at you at 3:47 AM, I'm your guy.",
    prompts: [
      {
        question: "My ideal first date involves...",
        answer: "A quiet walk. Maybe some tea. Discussing our feelings at a reasonable volume. Going to bed at a sensible hour. Revolutionary, I know."
      },
      {
        question: "I believe in...",
        answer: "Work-life balance. Getting 8 hours of sleep. Warm showers. Being kind to yourself. This makes me controversial in certain circles."
      },
      {
        question: "Looking for someone who...",
        answer: "Doesn't think self-care is weakness. Who has hobbies that don't involve screaming at mirrors. Who likes corn, gently."
      }
    ],
    distance: "8.47 miles away",
    verified: false,
    cornScore: 40,
    lookingFor: ['Calm souls', 'Sleep enthusiasts', 'Normal volume speakers'],
    hasLikedYou: true
  }
]

// ============================================================================
// Components
// ============================================================================

/**
 * Header with Corndr branding and navigation
 */
function CorndrHeader({
  activeTab,
  onTabChange,
  matchCount
}: {
  activeTab: 'discover' | 'matches' | 'settings'
  onTabChange: (tab: 'discover' | 'matches' | 'settings') => void
  matchCount: number
}) {
  return (
    <header
      className="sticky top-0 z-20"
      style={{
        background: CORNDR_THEME.gradient,
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
      }}
    >
      <div className="max-w-lg mx-auto px-4 py-3">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="text-3xl">🌽</span>
          <h1 className="text-2xl font-bold text-white tracking-wide">
            Corndr
          </h1>
          <span className="text-3xl">💕</span>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex justify-center gap-2">
          <button
            onClick={() => onTabChange('discover')}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              activeTab === 'discover'
                ? 'bg-white text-pink-500'
                : 'bg-pink-400/30 text-white hover:bg-pink-400/50'
            }`}
          >
            Discover
          </button>
          <button
            onClick={() => onTabChange('matches')}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all relative ${
              activeTab === 'matches'
                ? 'bg-white text-pink-500'
                : 'bg-pink-400/30 text-white hover:bg-pink-400/50'
            }`}
          >
            Matches
            {matchCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-yellow-400 text-pink-600 text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {matchCount}
              </span>
            )}
          </button>
          <button
            onClick={() => onTabChange('settings')}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              activeTab === 'settings'
                ? 'bg-white text-pink-500'
                : 'bg-pink-400/30 text-white hover:bg-pink-400/50'
            }`}
          >
            Discovery
          </button>
        </nav>
      </div>
    </header>
  )
}

/**
 * Profile card component for swiping
 */
function ProfileCard({
  profile,
  onLike,
  onPass,
  onSuperKernel
}: {
  profile: CorndrProfile
  onLike: () => void
  onPass: () => void
  onSuperKernel: () => void
}) {
  const [showDetails, setShowDetails] = useState(false)

  // Get emoji based on profile type
  const getProfileEmoji = (id: string) => {
    const emojiMap: Record<string, string> = {
      'derek': '☕',
      'tim': '🙆‍♂️',
      'mildred': '🍣',
      'floor13': '🏚️',
      'mars': '🎸',
      'jennifer': '🚫☕',
      'cornelius': '🌽',
      'shelly': '🌾',
      'brad': '🧘'
    }
    return emojiMap[id] || '🌽'
  }

  return (
    <div
      className="relative bg-white rounded-2xl overflow-hidden shadow-xl"
      style={{
        border: `3px solid ${CORNDR_THEME.secondary}`,
        maxWidth: '380px',
        margin: '0 auto'
      }}
    >
      {/* Profile Image Area */}
      <div
        className="relative h-80 flex items-center justify-center cursor-pointer"
        style={{ background: 'linear-gradient(135deg, #FFF8E7 0%, #FFE4B5 100%)' }}
        onClick={() => setShowDetails(!showDetails)}
      >
        <span className="text-9xl">{getProfileEmoji(profile.id)}</span>

        {/* Verified Badge */}
        {profile.verified && (
          <div
            className="absolute top-3 right-3 bg-white/90 px-2 py-1 rounded-full flex items-center gap-1"
            title={`Verified by ${profile.verifiedBy}`}
          >
            <span className="text-blue-500">✓</span>
            <span className="text-xs font-medium text-gray-700">Verified</span>
          </div>
        )}

        {/* Corn Score */}
        <div
          className="absolute top-3 left-3 bg-yellow-400/90 px-2 py-1 rounded-full"
          title="Corn Enthusiasm Score"
        >
          <span className="text-xs font-bold text-yellow-900">🌽 {profile.cornScore}%</span>
        </div>

        {/* Click for more hint */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-3 py-1 rounded-full">
          Tap for more
        </div>
      </div>

      {/* Profile Info */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <h2 className="text-xl font-bold" style={{ color: CORNDR_THEME.text }}>
            {profile.name}, {profile.age}
          </h2>
          {profile.hasLikedYou && (
            <span className="bg-pink-100 text-pink-600 text-xs px-2 py-0.5 rounded-full">
              Liked You!
            </span>
          )}
        </div>

        <p className="text-sm text-gray-500 mb-3">{profile.distance}</p>

        {/* Bio Preview or Full Details */}
        {showDetails ? (
          <div className="space-y-4 max-h-60 overflow-y-auto">
            <p className="text-sm leading-relaxed" style={{ color: CORNDR_THEME.text }}>
              {profile.bio}
            </p>

            {profile.prompts.map((prompt, i) => (
              <div key={i} className="bg-pink-50 rounded-lg p-3">
                <p className="text-xs font-semibold text-pink-600 mb-1">
                  {prompt.question}
                </p>
                <p className="text-sm" style={{ color: CORNDR_THEME.text }}>
                  {prompt.answer}
                </p>
              </div>
            ))}

            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-500 mb-1">Looking for:</p>
              <div className="flex flex-wrap gap-1">
                {profile.lookingFor.map((item, i) => (
                  <span
                    key={i}
                    className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <p
            className="text-sm line-clamp-3 cursor-pointer"
            style={{ color: CORNDR_THEME.text }}
            onClick={() => setShowDetails(true)}
          >
            {profile.bio}
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4 p-4 pt-0">
        <button
          onClick={onPass}
          className="w-14 h-14 rounded-full flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
          style={{
            background: '#fff',
            border: '2px solid #ff6b6b',
            color: '#ff6b6b'
          }}
          title="Pass"
        >
          <span className="text-2xl">✕</span>
        </button>

        <button
          onClick={onSuperKernel}
          className="w-14 h-14 rounded-full flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
            border: '2px solid #FFD700',
            color: '#fff'
          }}
          title="Super Kernel!"
        >
          <span className="text-2xl">🌽</span>
        </button>

        <button
          onClick={onLike}
          className="w-14 h-14 rounded-full flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #E91E63 0%, #FF5722 100%)',
            border: '2px solid #E91E63',
            color: '#fff'
          }}
          title="Like"
        >
          <span className="text-2xl">💕</span>
        </button>
      </div>
    </div>
  )
}

/**
 * Match popup when two people like each other
 */
function MatchPopup({
  profile,
  onClose,
  onMessage
}: {
  profile: CorndrProfile
  onClose: () => void
  onMessage: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div
        className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 text-center"
        style={{ border: `4px solid ${CORNDR_THEME.secondary}` }}
      >
        <div className="text-6xl mb-4">🌽💕🌽</div>
        <h2
          className="text-2xl font-bold mb-2"
          style={{ color: CORNDR_THEME.primary }}
        >
          It's a Corn-ection!
        </h2>
        <p className="text-gray-600 mb-4">
          You and <span className="font-bold">{profile.name}</span> are both a-maize-d by each other!
        </p>

        <div className="flex justify-center gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-full border-2 font-semibold transition-colors"
            style={{
              borderColor: CORNDR_THEME.border,
              color: CORNDR_THEME.text
            }}
          >
            Keep Swiping
          </button>
          <button
            onClick={onMessage}
            className="px-4 py-2 rounded-full font-semibold text-white transition-transform hover:scale-105"
            style={{ background: CORNDR_THEME.gradient }}
          >
            Send Message
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * Matches list view
 */
function MatchesView({
  matches,
  onSelectMatch
}: {
  matches: Match[]
  onSelectMatch: (match: Match) => void
}) {
  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="mb-4">
        <h2 className="text-lg font-bold" style={{ color: CORNDR_THEME.text }}>
          Your Matches ({matches.length})
        </h2>
        <p className="text-sm text-gray-500">
          847 people are looking for corn love near you
        </p>
      </div>

      {matches.length === 0 ? (
        <div className="text-center py-12">
          <span className="text-6xl">🌽</span>
          <h3 className="text-lg font-semibold mt-4 mb-2" style={{ color: CORNDR_THEME.text }}>
            No matches yet
          </h3>
          <p className="text-sm text-gray-500">
            Keep swiping! Your perfect kernel is out there.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {matches.map(match => (
            <button
              key={match.id}
              onClick={() => onSelectMatch(match)}
              className="w-full flex items-center gap-3 p-3 rounded-xl transition-colors hover:bg-pink-50"
              style={{
                background: CORNDR_THEME.surface,
                border: `2px solid ${match.unread ? CORNDR_THEME.primary : CORNDR_THEME.border}`
              }}
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #FFF8E7 0%, #FFE4B5 100%)' }}
              >
                <span className="text-2xl">
                  {match.profile.id === 'derek' ? '☕' :
                   match.profile.id === 'mildred' ? '🍣' :
                   match.profile.id === 'floor13' ? '🏚️' :
                   match.profile.id === 'cornelius' ? '🌽' :
                   match.profile.id === 'brad' ? '🧘' : '🌽'}
                </span>
              </div>
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2">
                  <span className="font-semibold" style={{ color: CORNDR_THEME.text }}>
                    {match.profile.name}
                  </span>
                  {match.unread && (
                    <span className="w-2 h-2 rounded-full bg-pink-500"></span>
                  )}
                </div>
                <p className="text-sm text-gray-500 truncate">
                  {match.lastMessage || `Matched on ${match.matchedAt}`}
                </p>
              </div>
              <span className="text-gray-400">→</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * Chat view with a match
 */
function ChatView({
  match,
  onBack
}: {
  match: Match
  onBack: () => void
}) {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<{ text: string; fromMe: boolean; time: string }[]>([
    { text: "Hey there! I noticed you're into corn too... ", fromMe: false, time: '2:34 PM' },
    { text: "What's your favorite variety?", fromMe: false, time: '2:34 PM' },
  ])

  const handleSend = () => {
    if (!message.trim()) return
    setMessages([...messages, { text: message, fromMe: true, time: 'Just now' }])
    setMessage('')

    // Simulate response
    setTimeout(() => {
      const responses = [
        "That's so interesting! Tell me more about your corn journey.",
        "I've never thought about it that way before!",
        "We should definitely visit a corn field together sometime!",
        "You really get me. Most people don't appreciate good corn.",
        "847 out of 10 would recommend this conversation!"
      ]
      setMessages(prev => [...prev, {
        text: responses[Math.floor(Math.random() * responses.length)],
        fromMe: false,
        time: 'Just now'
      }])
    }, 1500)
  }

  return (
    <div className="flex flex-col h-full max-w-lg mx-auto">
      {/* Chat Header */}
      <div
        className="flex items-center gap-3 p-4"
        style={{
          background: CORNDR_THEME.surface,
          borderBottom: `2px solid ${CORNDR_THEME.border}`
        }}
      >
        <button onClick={onBack} className="text-pink-500 font-semibold">
          ← Back
        </button>
        <div className="flex-1 text-center">
          <span className="font-bold" style={{ color: CORNDR_THEME.text }}>
            {match.profile.name}
          </span>
        </div>
        <span className="text-2xl">
          {match.profile.id === 'derek' ? '☕' :
           match.profile.id === 'mildred' ? '🍣' :
           match.profile.id === 'floor13' ? '🏚️' : '🌽'}
        </span>
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-3"
        style={{ background: CORNDR_THEME.background }}
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.fromMe ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                msg.fromMe ? 'rounded-br-sm' : 'rounded-bl-sm'
              }`}
              style={{
                background: msg.fromMe ? CORNDR_THEME.gradient : CORNDR_THEME.surface,
                color: msg.fromMe ? '#fff' : CORNDR_THEME.text
              }}
            >
              <p className="text-sm">{msg.text}</p>
              <p className={`text-xs mt-1 ${msg.fromMe ? 'text-pink-200' : 'text-gray-400'}`}>
                {msg.time}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Message Input */}
      <div
        className="p-4 flex gap-2"
        style={{
          background: CORNDR_THEME.surface,
          borderTop: `2px solid ${CORNDR_THEME.border}`
        }}
      >
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Say something corn-y..."
          className="flex-1 px-4 py-2 rounded-full text-sm focus:outline-none"
          style={{
            border: `2px solid ${CORNDR_THEME.border}`,
            background: CORNDR_THEME.background
          }}
        />
        <button
          onClick={handleSend}
          className="w-10 h-10 rounded-full flex items-center justify-center text-white"
          style={{ background: CORNDR_THEME.gradient }}
        >
          🌽
        </button>
      </div>
    </div>
  )
}

/**
 * Discovery settings view
 */
function SettingsView({
  settings,
  onUpdate
}: {
  settings: DiscoverySettings
  onUpdate: (settings: DiscoverySettings) => void
}) {
  const lookingForOptions = [
    'Corn enthusiasts',
    'Quantum coffee drinkers',
    'Trust fall partners',
    'Gas station foodies',
    'Night owls',
    'Early risers',
    'Maze navigators',
    'Calm souls',
    'Anyone who believes'
  ]

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <h2 className="text-lg font-bold mb-6" style={{ color: CORNDR_THEME.text }}>
        Discovery Settings
      </h2>

      {/* Looking For */}
      <div className="mb-6">
        <label className="block text-sm font-semibold mb-2" style={{ color: CORNDR_THEME.text }}>
          Looking For
        </label>
        <div className="flex flex-wrap gap-2">
          {lookingForOptions.map(option => (
            <button
              key={option}
              onClick={() => {
                const newLookingFor = settings.lookingFor.includes(option)
                  ? settings.lookingFor.filter(o => o !== option)
                  : [...settings.lookingFor, option]
                onUpdate({ ...settings, lookingFor: newLookingFor })
              }}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                settings.lookingFor.includes(option)
                  ? 'bg-pink-500 text-white'
                  : 'bg-pink-100 text-pink-600'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* Max Distance */}
      <div className="mb-6">
        <label className="block text-sm font-semibold mb-2" style={{ color: CORNDR_THEME.text }}>
          Maximum Distance: {settings.maxDistance} miles
        </label>
        <input
          type="range"
          min="1"
          max="847"
          value={settings.maxDistance}
          onChange={(e) => onUpdate({ ...settings, maxDistance: parseInt(e.target.value) })}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>1 mi</span>
          <span>847 mi</span>
        </div>
      </div>

      {/* Age Range */}
      <div className="mb-6">
        <label className="block text-sm font-semibold mb-2" style={{ color: CORNDR_THEME.text }}>
          Age Range: {settings.ageRange.min} - {settings.ageRange.max}
        </label>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="text-xs text-gray-500">Min</label>
            <input
              type="number"
              min="18"
              max="99"
              value={settings.ageRange.min}
              onChange={(e) => onUpdate({
                ...settings,
                ageRange: { ...settings.ageRange, min: parseInt(e.target.value) }
              })}
              className="w-full px-3 py-2 rounded-lg text-sm"
              style={{ border: `2px solid ${CORNDR_THEME.border}` }}
            />
          </div>
          <div className="flex-1">
            <label className="text-xs text-gray-500">Max</label>
            <input
              type="number"
              min="18"
              max="99"
              value={settings.ageRange.max}
              onChange={(e) => onUpdate({
                ...settings,
                ageRange: { ...settings.ageRange, max: parseInt(e.target.value) }
              })}
              className="w-full px-3 py-2 rounded-lg text-sm"
              style={{ border: `2px solid ${CORNDR_THEME.border}` }}
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div
        className="p-4 rounded-xl"
        style={{
          background: CORNDR_THEME.background,
          border: `2px solid ${CORNDR_THEME.border}`
        }}
      >
        <h3 className="font-semibold mb-2" style={{ color: CORNDR_THEME.text }}>
          Your Corndr Stats
        </h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-gray-500">Super Kernels left:</span>
            <span className="ml-2 font-bold text-yellow-600">8</span>
          </div>
          <div>
            <span className="text-gray-500">Profiles viewed:</span>
            <span className="ml-2 font-bold" style={{ color: CORNDR_THEME.primary }}>847</span>
          </div>
          <div>
            <span className="text-gray-500">Match rate:</span>
            <span className="ml-2 font-bold text-green-600">47%</span>
          </div>
          <div>
            <span className="text-gray-500">Active since:</span>
            <span className="ml-2 font-bold" style={{ color: CORNDR_THEME.text }}>8d 47h</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Main Site Component
// ============================================================================

export function CorndrSite({ siteId, onNavigate }: SiteProps) {
  const [activeTab, setActiveTab] = useState<'discover' | 'matches' | 'settings'>('discover')
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0)
  const [matches, setMatches] = useState<Match[]>([])
  const [showMatchPopup, setShowMatchPopup] = useState<CorndrProfile | null>(null)
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
  const [settings, setSettings] = useState<DiscoverySettings>({
    lookingFor: ['Corn enthusiasts', 'Quantum coffee drinkers'],
    maxDistance: 100,
    ageRange: { min: 21, max: 99 }
  })

  const currentProfile = SAMPLE_PROFILES[currentProfileIndex]
  const noMoreProfiles = currentProfileIndex >= SAMPLE_PROFILES.length

  // Handle like action
  const handleLike = () => {
    if (currentProfile.hasLikedYou) {
      // It's a match!
      const newMatch: Match = {
        id: currentProfile.id,
        profile: currentProfile,
        matchedAt: new Date().toLocaleDateString(),
        unread: true
      }
      setMatches([newMatch, ...matches])
      setShowMatchPopup(currentProfile)
    }
    setCurrentProfileIndex(prev => prev + 1)
  }

  // Handle pass action
  const handlePass = () => {
    setCurrentProfileIndex(prev => prev + 1)
  }

  // Handle super kernel (same as like but with style)
  const handleSuperKernel = () => {
    handleLike()
  }

  // Render content based on active tab and state
  const renderContent = () => {
    if (selectedMatch) {
      return <ChatView match={selectedMatch} onBack={() => setSelectedMatch(null)} />
    }

    switch (activeTab) {
      case 'discover':
        return noMoreProfiles ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <span className="text-8xl mb-4">🌽</span>
            <h2 className="text-xl font-bold mb-2" style={{ color: CORNDR_THEME.text }}>
              You've seen everyone!
            </h2>
            <p className="text-gray-500 mb-4">
              You've swiped through all 847 profiles in your area.
              Check back later for new corn enthusiasts!
            </p>
            <button
              onClick={() => setCurrentProfileIndex(0)}
              className="px-6 py-2 rounded-full font-semibold text-white"
              style={{ background: CORNDR_THEME.gradient }}
            >
              Start Over
            </button>
          </div>
        ) : (
          <div className="py-6 px-4">
            <ProfileCard
              profile={currentProfile}
              onLike={handleLike}
              onPass={handlePass}
              onSuperKernel={handleSuperKernel}
            />
            <p className="text-center text-xs text-gray-400 mt-4">
              {SAMPLE_PROFILES.length - currentProfileIndex} profiles remaining
            </p>
          </div>
        )

      case 'matches':
        return (
          <MatchesView
            matches={matches}
            onSelectMatch={(match) => {
              setSelectedMatch(match)
              // Mark as read
              setMatches(matches.map(m =>
                m.id === match.id ? { ...m, unread: false } : m
              ))
            }}
          />
        )

      case 'settings':
        return <SettingsView settings={settings} onUpdate={setSettings} />

      default:
        return null
    }
  }

  return (
    <div
      className="min-h-full flex flex-col"
      style={{ background: CORNDR_THEME.background }}
    >
      {/* Header */}
      {!selectedMatch && (
        <CorndrHeader
          activeTab={activeTab}
          onTabChange={setActiveTab}
          matchCount={matches.filter(m => m.unread).length}
        />
      )}

      {/* Main Content */}
      <main className="flex-1">
        {renderContent()}
      </main>

      {/* Footer */}
      {!selectedMatch && (
        <footer
          className="py-3 text-center text-xs"
          style={{
            background: CORNDR_THEME.surface,
            borderTop: `2px solid ${CORNDR_THEME.border}`,
            color: CORNDR_THEME.textMuted
          }}
        >
          <p>www.corndr.corn - Where corn lovers connect</p>
          <p className="mt-1">847,000 members and growing! | Privacy | Terms | Safety</p>
        </footer>
      )}

      {/* Match Popup */}
      {showMatchPopup && (
        <MatchPopup
          profile={showMatchPopup}
          onClose={() => setShowMatchPopup(null)}
          onMessage={() => {
            setShowMatchPopup(null)
            setActiveTab('matches')
            const match = matches.find(m => m.profile.id === showMatchPopup.id)
            if (match) setSelectedMatch(match)
          }}
        />
      )}
    </div>
  )
}

export default CorndrSite
