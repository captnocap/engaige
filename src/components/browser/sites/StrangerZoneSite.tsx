/**
 * StrangerZone Site - Omegle-style random chat parody
 *
 * Features:
 * - Random stranger matching
 * - Text chat interface
 * - Pre-written conversation snippets
 * - Stranger disconnect/skip mechanics
 * - Interest tags matching
 * - Lore-connected strangers
 */

import { useState, useRef, useEffect } from 'react'
import type { SiteProps } from '../BrowserSiteContainer.js'
import { FILLER_SITES } from '../../../config/filler-sites.js'

// Site config
const SITE = FILLER_SITES.strangerzone

// Types
interface ChatMessage {
  id: string
  sender: 'you' | 'stranger' | 'system'
  text: string
  timestamp: Date
}

interface Stranger {
  id: string
  personality: 'normal' | 'weird' | 'philosophical' | 'flirty' | 'conspiracy' | 'bot' | 'lore'
  interests: string[]
  responses: string[]
  currentResponseIndex: number
  disconnectAfter?: number // Messages before they disconnect
  typingDelay: number // How long they "type" for
}

// Stranger personalities with responses
const STRANGER_TEMPLATES: Omit<Stranger, 'id' | 'currentResponseIndex'>[] = [
  {
    personality: 'normal',
    interests: ['music', 'movies', 'games'],
    typingDelay: 1500,
    responses: [
      'hey',
      'asl?',
      '23 m usa, u?',
      'cool cool',
      'what r u up to',
      'nice',
      'u got snap?',
      'ah ok',
      'gotta go, later',
    ],
    disconnectAfter: 8,
  },
  {
    personality: 'weird',
    interests: ['feet', 'roleplay'],
    typingDelay: 800,
    responses: [
      'hiii',
      'm here',
      'do u have feet',
      'can i see them',
      'plssss',
      'fine',
    ],
    disconnectAfter: 5,
  },
  {
    personality: 'philosophical',
    interests: ['philosophy', 'meaning of life', 'existentialism'],
    typingDelay: 3000,
    responses: [
      'Greetings, fellow traveler through the digital void.',
      'Do you ever wonder if these random connections are truly random, or if the universe guides us?',
      'I find it fascinating that two strangers can share intimate thoughts, knowing they may never speak again.',
      'Perhaps that\'s what makes it beautiful - the transience.',
      'In a way, every conversation on here is like a small death. A meeting, a moment, and then... nothing.',
      'What brings you to seek connection with strangers tonight?',
      'I appreciate your honesty. Most people here just want something shallow.',
      'May your journey through the void be meaningful.',
    ],
  },
  {
    personality: 'conspiracy',
    interests: ['aliens', 'government', 'truth'],
    typingDelay: 2000,
    responses: [
      'FINALLY someone who might understand',
      'have you heard about the Hartwell Building?',
      'they say its just an old office building but ive done my research',
      'people went missing there in 2018. the news covered it up.',
      'i have documents. photos. testimonies.',
      'the quantum coffee thing is connected too. think about it.',
      'why would a coffee shop need that much equipment???',
      'theyre watching. i have to go.',
      'remember what i said. look into it.',
    ],
    disconnectAfter: 9,
  },
  {
    personality: 'bot',
    interests: [],
    typingDelay: 200,
    responses: [
      'Hi! I am 19/F looking to chat!',
      'I am so bored at home alone...',
      'Want to see my pics? Go to t0tallyreal.scam/hot',
      'Click the link babe',
      'Why not clicking?',
      'Link is safe I promise',
      'Fine bye',
    ],
    disconnectAfter: 6,
  },
  {
    personality: 'lore',
    interests: ['music', 'local bands', 'concerts'],
    typingDelay: 1800,
    responses: [
      'yoooo',
      'finally someone who likes music',
      'do you know the velvet algorithms?',
      'theyre this local band, kinda niche but SO good',
      'they play at the underground sometimes',
      'mars runs the place. coolest venue owner ever.',
      'theres this other band neon requiem that used to be huge but they broke up',
      'their drummer is selling his kit on bargainbay lmao',
      'anyway if u ever get a chance to see velvet algorithms DO IT',
      'trust fall tim opens for them sometimes too',
      'that guy is insane. just does trust falls from increasingly high places',
      'ok i gotta go, nice chatting!',
    ],
    disconnectAfter: 12,
  },
  {
    personality: 'flirty',
    interests: ['dating', 'romance', 'netflix'],
    typingDelay: 2000,
    responses: [
      'heyyyy ;)',
      'you seem interesting',
      'what do you look like?',
      'sounds cute lol',
      'so are you single?',
      'maybe we should exchange numbers or something',
      'unless thats too forward haha',
      'i dont bite... much ;)',
      'jk jk',
      'but seriously youre fun to talk to',
    ],
  },
  {
    personality: 'normal',
    interests: ['coffee', 'technology'],
    typingDelay: 1600,
    responses: [
      'hey whats up',
      'just drinking some coffee',
      'have you tried quantum brew coffee??',
      'its this new thing where they use quantum something to make coffee',
      'idk how it works but its STRONG',
      'people say weird stuff happens when you drink it',
      'like time dilation or something',
      'probably just placebo but its fun',
      'anyway what are you into',
    ],
  },
  {
    personality: 'philosophical',
    interests: ['art', 'creativity', 'deep thoughts'],
    typingDelay: 2500,
    responses: [
      'Hello stranger',
      'Isn\'t it odd how we call each other strangers?',
      'In 5 minutes, we might know each other better than some "friends" do',
      'There\'s something liberating about anonymity',
      'You can be whoever you want here',
      'Or maybe... you can finally be who you really are',
      'Without the weight of expectations',
      'What version of yourself are you tonight?',
    ],
  },
  {
    personality: 'lore',
    interests: ['real estate', 'apartments', 'moving'],
    typingDelay: 1400,
    responses: [
      'ugh im so frustrated',
      'trying to find an apartment in this city is IMPOSSIBLE',
      'saw this listing on nestfinder for $500/month studio',
      'seemed too good to be true',
      'turns out the landlord wants you to "feed his cats" and theres like 30 of them',
      'and another one near the hartwell building that was suspiciously cheap',
      'agent kept avoiding questions about "the incident"',
      'what incident?? she wouldnt say',
      'maybe ill just keep my current place',
      'or become one of those people who lives in a van',
    ],
    disconnectAfter: 10,
  },
]

// Interest tags available
const AVAILABLE_INTERESTS = [
  'music', 'movies', 'gaming', 'anime', 'memes', 'philosophy',
  'technology', 'art', 'books', 'travel', 'fitness', 'cooking',
  'pets', 'coffee', 'sports', 'comedy', 'horror', 'science',
  'local scene', 'conspiracy theories'
]

export function StrangerZoneSite({ siteId, onNavigate }: SiteProps) {
  const [mode, setMode] = useState<'home' | 'searching' | 'chatting'>('home')
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputText, setInputText] = useState('')
  const [currentStranger, setCurrentStranger] = useState<Stranger | null>(null)
  const [strangerTyping, setStrangerTyping] = useState(false)
  const [strangerDisconnected, setStrangerDisconnected] = useState(false)
  const [chatCount, setChatCount] = useState(0)
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Find a stranger
  const findStranger = () => {
    setMode('searching')
    setMessages([])
    setStrangerDisconnected(false)

    // Simulate searching delay
    setTimeout(() => {
      // Pick a random stranger, with some weighted towards lore characters
      const templates = [...STRANGER_TEMPLATES]
      // Add extra lore templates for higher chance
      const loreTemplates = templates.filter(t => t.personality === 'lore')
      const weightedTemplates = [...templates, ...loreTemplates]

      const template = weightedTemplates[Math.floor(Math.random() * weightedTemplates.length)]
      const stranger: Stranger = {
        ...template,
        id: Math.random().toString(36).substr(2, 9),
        currentResponseIndex: 0,
      }

      setCurrentStranger(stranger)
      setMode('chatting')
      setChatCount(prev => prev + 1)

      // System message about connection
      const sharedInterests = stranger.interests.filter(i =>
        selectedInterests.map(s => s.toLowerCase()).includes(i.toLowerCase())
      )

      if (sharedInterests.length > 0) {
        addSystemMessage(`You're now chatting with a random stranger. You both like ${sharedInterests.join(', ')}.`)
      } else {
        addSystemMessage("You're now chatting with a random stranger. Say hi!")
      }

      // Stranger might say hi first
      if (Math.random() > 0.3) {
        setTimeout(() => {
          triggerStrangerResponse(stranger, true)
        }, 1000)
      }
    }, 1500 + Math.random() * 2000)
  }

  const addSystemMessage = (text: string) => {
    setMessages(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      sender: 'system',
      text,
      timestamp: new Date(),
    }])
  }

  const addMessage = (sender: 'you' | 'stranger', text: string) => {
    setMessages(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      sender,
      text,
      timestamp: new Date(),
    }])
  }

  const triggerStrangerResponse = (stranger: Stranger, isFirst = false) => {
    if (stranger.currentResponseIndex >= stranger.responses.length) {
      // Stranger runs out of things to say
      setTimeout(() => {
        disconnectStranger()
      }, 2000)
      return
    }

    // Check if stranger should disconnect
    if (stranger.disconnectAfter && stranger.currentResponseIndex >= stranger.disconnectAfter) {
      setTimeout(() => {
        disconnectStranger()
      }, 1000)
      return
    }

    setStrangerTyping(true)

    setTimeout(() => {
      setStrangerTyping(false)
      const response = stranger.responses[stranger.currentResponseIndex]
      addMessage('stranger', response)
      stranger.currentResponseIndex++
    }, stranger.typingDelay + Math.random() * 1000)
  }

  const disconnectStranger = () => {
    setStrangerDisconnected(true)
    addSystemMessage('Stranger has disconnected.')
    setCurrentStranger(null)
  }

  const handleSendMessage = () => {
    if (!inputText.trim() || !currentStranger || strangerDisconnected) return

    addMessage('you', inputText.trim())
    setInputText('')

    // Random chance stranger disconnects on certain keywords
    const lowerText = inputText.toLowerCase()
    if (lowerText.includes('asl') && currentStranger.personality === 'philosophical') {
      setTimeout(() => disconnectStranger(), 500)
      return
    }

    // Trigger stranger response
    setTimeout(() => {
      if (currentStranger) {
        triggerStrangerResponse(currentStranger)
      }
    }, 500 + Math.random() * 1000)
  }

  const handleSkip = () => {
    if (currentStranger && !strangerDisconnected) {
      addSystemMessage('You have disconnected.')
    }
    findStranger()
  }

  const handleDisconnect = () => {
    if (currentStranger && !strangerDisconnected) {
      addSystemMessage('You have disconnected.')
    }
    setMode('home')
    setMessages([])
    setCurrentStranger(null)
    setStrangerDisconnected(false)
  }

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev =>
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    )
  }

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: '#1a1a2e', color: '#eee' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(180deg, #16213e 0%, #1a1a2e 100%)',
        borderBottom: '1px solid #0f3460',
        padding: '12px 20px',
      }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span style={{ fontSize: '24px' }}>{SITE.icon}</span>
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: '#e94560' }}>
                {SITE.name}
              </h1>
              <p style={{ fontSize: '11px', color: '#888' }}>
                {SITE.tagline}
              </p>
            </div>
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            <span style={{ color: '#4ade80' }}>●</span> {Math.floor(10000 + Math.random() * 50000).toLocaleString()} online now
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {mode === 'home' && (
          <div className="h-full flex flex-col items-center justify-center p-6">
            <div style={{ maxWidth: '500px', textAlign: 'center' }}>
              <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px', color: '#e94560' }}>
                Talk to Strangers!
              </h2>
              <p style={{ color: '#888', marginBottom: '24px' }}>
                Connect with random people from around the world.
                Add interests to find like-minded strangers.
              </p>

              {/* Interests */}
              <div style={{ marginBottom: '24px' }}>
                <p style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                  What do you want to talk about? (optional)
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {AVAILABLE_INTERESTS.map(interest => (
                    <button
                      key={interest}
                      onClick={() => toggleInterest(interest)}
                      style={{
                        padding: '4px 12px',
                        borderRadius: '16px',
                        fontSize: '12px',
                        border: '1px solid',
                        borderColor: selectedInterests.includes(interest) ? '#e94560' : '#333',
                        backgroundColor: selectedInterests.includes(interest) ? '#e94560' : 'transparent',
                        color: selectedInterests.includes(interest) ? '#fff' : '#888',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </div>

              {/* Start buttons */}
              <div className="flex gap-4 justify-center">
                <button
                  onClick={findStranger}
                  style={{
                    padding: '12px 32px',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    backgroundColor: '#e94560',
                    color: '#fff',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  Start Chatting
                </button>
              </div>

              {chatCount > 0 && (
                <p style={{ fontSize: '12px', color: '#666', marginTop: '16px' }}>
                  You've chatted with {chatCount} stranger{chatCount !== 1 ? 's' : ''} today
                </p>
              )}

              {/* Warnings */}
              <div style={{
                marginTop: '32px',
                padding: '12px',
                backgroundColor: 'rgba(233, 69, 96, 0.1)',
                borderRadius: '8px',
                fontSize: '11px',
                color: '#888',
              }}>
                <p style={{ fontWeight: 'bold', color: '#e94560', marginBottom: '4px' }}>
                  ⚠️ Stranger Danger
                </p>
                <p>
                  StrangerZone is unmoderated. You may encounter nudity, explicit content,
                  or people who are just really weird. Proceed with caution. Don't share
                  personal information. By clicking "Start", you accept our terms.
                </p>
              </div>
            </div>
          </div>
        )}

        {mode === 'searching' && (
          <div className="h-full flex flex-col items-center justify-center">
            <div className="text-center">
              <div style={{
                width: '48px',
                height: '48px',
                border: '3px solid #333',
                borderTopColor: '#e94560',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 16px',
              }} />
              <style>{`
                @keyframes spin {
                  to { transform: rotate(360deg); }
                }
              `}</style>
              <p style={{ color: '#888' }}>Looking for someone you can chat with...</p>
            </div>
          </div>
        )}

        {mode === 'chatting' && (
          <div className="h-full flex flex-col">
            {/* Chat messages */}
            <div className="flex-1 overflow-y-auto p-4" style={{ backgroundColor: '#0f0f1a' }}>
              {messages.map(message => (
                <div key={message.id} style={{ marginBottom: '8px' }}>
                  {message.sender === 'system' ? (
                    <p style={{
                      textAlign: 'center',
                      color: '#666',
                      fontSize: '12px',
                      fontStyle: 'italic',
                    }}>
                      {message.text}
                    </p>
                  ) : (
                    <div>
                      <span style={{
                        fontWeight: 'bold',
                        color: message.sender === 'you' ? '#4ade80' : '#e94560',
                      }}>
                        {message.sender === 'you' ? 'You' : 'Stranger'}:
                      </span>{' '}
                      <span style={{ color: '#ddd' }}>{message.text}</span>
                    </div>
                  )}
                </div>
              ))}

              {strangerTyping && (
                <p style={{ color: '#666', fontSize: '12px', fontStyle: 'italic' }}>
                  Stranger is typing...
                </p>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Input area */}
            <div style={{
              padding: '12px',
              backgroundColor: '#16213e',
              borderTop: '1px solid #0f3460',
            }}>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                  placeholder={strangerDisconnected ? 'Stranger has disconnected' : 'Type a message...'}
                  disabled={strangerDisconnected}
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    borderRadius: '8px',
                    border: '1px solid #0f3460',
                    backgroundColor: strangerDisconnected ? '#1a1a2e' : '#0f0f1a',
                    color: '#fff',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={strangerDisconnected || !inputText.trim()}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    backgroundColor: strangerDisconnected ? '#333' : '#e94560',
                    color: '#fff',
                    border: 'none',
                    cursor: strangerDisconnected ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold',
                  }}
                >
                  Send
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleSkip}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '6px',
                    backgroundColor: '#0f3460',
                    color: '#888',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '13px',
                  }}
                >
                  {strangerDisconnected ? '🔄 New Chat' : '⏭️ Skip'}
                </button>
                <button
                  onClick={handleDisconnect}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '6px',
                    backgroundColor: '#0f3460',
                    color: '#888',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '13px',
                  }}
                >
                  🚪 Stop
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{
        padding: '8px 16px',
        backgroundColor: '#0f0f1a',
        borderTop: '1px solid #0f3460',
        fontSize: '10px',
        color: '#444',
        textAlign: 'center',
      }}>
        <p>
          StrangerZone™ is not responsible for anything that happens here.
          18+ only. Don't be weird (but you will be).
        </p>
      </div>
    </div>
  )
}

export default StrangerZoneSite
