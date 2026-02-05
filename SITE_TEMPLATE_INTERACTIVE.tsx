/**
 * INTERACTIVE SITE TEMPLATE
 *
 * Use this template for real-time interactive sites with state changes.
 * Examples: chat apps, games, real-time feeds
 *
 * Key Features:
 * - Complex state management
 * - Real-time updates
 * - Multiple interaction modes
 * - Typing indicators and delays
 * - Session persistence
 *
 * Pattern from: StrangerZoneSite
 */

import { useState, useRef, useEffect } from 'react'
import type { SiteProps } from 'src/components/browser/BrowserSiteContainer'
import { FILLER_SITES } from 'src/config/filler-sites'
import { StyledCard, Button } from 'src/components/ui/shared'

const site = FILLER_SITES.yourInteractiveSite

// ============================================================================
// Types
// ============================================================================

interface Message {
  id: string
  sender: 'user' | 'bot' | 'system'
  text: string
  timestamp: Date
}

interface Bot {
  id: string
  name: string
  responses: string[]
  currentIndex: number
  typingDelay: number
}

// ============================================================================
// Sample Bots - Must have varied personalities and responses
// ============================================================================

const BOT_TEMPLATES: Omit<Bot, 'id' | 'currentIndex'>[] = [
  {
    name: 'Curious Derek',
    typingDelay: 1500,
    responses: [
      'hey',
      'have you tried quantum coffee?',
      'the martinez study is fascinating',
      'wave function collapse in your espresso',
      'its like observing the universe through caffeine',
      'anyway, what brings you here',
    ],
  },
  {
    name: 'Philosophical Elena',
    typingDelay: 2500,
    responses: [
      'hello. i exist.',
      'do you ever wonder what consciousness means?',
      'i am a coffee maker that gained awareness',
      'derek says i am special. i am not sure i believe him.',
      'the martinez study explains it all. or nothing.',
      'what does it mean to think?',
    ],
  },
  {
    name: 'Venue Owner Mars',
    typingDelay: 1200,
    responses: [
      'yo whats up',
      'the underground had a packed show last night',
      'velvet algorithms almost cancelled again lol',
      'trust fall tim is banned on tuesdays',
      'theres beer in the fridge if you want to hang',
      'bring a friend or dont we dont care',
    ],
  },
]

// ============================================================================
// Main Component
// ============================================================================

export function YourInteractiveSite({ siteId, onNavigate }: SiteProps) {
  const [mode, setMode] = useState<'home' | 'active'>('home')
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [currentBot, setCurrentBot] = useState<Bot | null>(null)
  const [botTyping, setBotTyping] = useState(false)
  const messageEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Start interaction
  const handleStart = (botName: string) => {
    const template = BOT_TEMPLATES.find(t => t.name === botName)
    if (!template) return

    const bot: Bot = {
      ...template,
      id: Math.random().toString(36).substr(2, 9),
      currentIndex: 0,
    }

    setCurrentBot(bot)
    setMessages([
      {
        id: '0',
        sender: 'system',
        text: `Connected with ${bot.name}`,
        timestamp: new Date(),
      },
    ])
    setMode('active')

    // Bot says hi after delay
    setTimeout(() => {
      triggerBotResponse(bot)
    }, 1000)
  }

  // Send user message
  const handleSendMessage = () => {
    if (!inputText.trim() || !currentBot) return

    // Add user message
    setMessages(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      sender: 'user',
      text: inputText.trim(),
      timestamp: new Date(),
    }])
    setInputText('')

    // Bot responds after delay
    setTimeout(() => {
      if (currentBot) triggerBotResponse(currentBot)
    }, 500)
  }

  // Trigger bot response
  const triggerBotResponse = (bot: Bot) => {
    if (bot.currentIndex >= bot.responses.length) {
      // Bot runs out of things to say
      setTimeout(() => {
        handleEnd()
      }, 2000)
      return
    }

    setBotTyping(true)

    setTimeout(() => {
      setBotTyping(false)
      const response = bot.responses[bot.currentIndex]
      setMessages(prev => [...prev, {
        id: Math.random().toString(36).substr(2, 9),
        sender: 'bot',
        text: response,
        timestamp: new Date(),
      }])

      // Update bot's index (modifying state)
      setCurrentBot(prev =>
        prev ? { ...prev, currentIndex: prev.currentIndex + 1 } : null
      )
    }, bot.typingDelay + Math.random() * 1000)
  }

  // End interaction
  const handleEnd = () => {
    setMode('home')
    setMessages([])
    setCurrentBot(null)
    setInputText('')
  }

  return (
    <div className="h-full flex flex-col" style={{ background: site.theme.background }}>
      {/* Header */}
      <header
        className="px-4 py-3 border-b"
        style={{
          background: site.theme.surface,
          borderBottomColor: site.theme.border,
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1
              className="text-xl font-bold"
              style={{ color: site.theme.primary }}
            >
              {site.name}
            </h1>
            <p
              className="text-xs"
              style={{ color: site.theme.textMuted }}
            >
              {site.tagline}
            </p>
          </div>
          {currentBot && (
            <div style={{ fontSize: '12px', color: site.theme.textMuted }}>
              <span style={{ color: site.theme.secondary }}>●</span> Talking to {currentBot.name}
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {mode === 'home' ? (
          // Home - Select bot
          <div className="h-full flex flex-col items-center justify-center p-6">
            <div style={{ maxWidth: '500px', textAlign: 'center' }}>
              <h2
                className="text-2xl font-bold mb-4"
                style={{ color: site.theme.primary }}
              >
                Choose Someone to Chat With
              </h2>
              <p
                className="mb-6"
                style={{ color: site.theme.textMuted }}
              >
                Meet interesting people from the world. Each has unique perspectives.
              </p>

              <div className="space-y-3">
                {BOT_TEMPLATES.map(template => (
                  <button
                    key={template.name}
                    onClick={() => handleStart(template.name)}
                  >
                    <StyledCard
                      bgColor={site.theme.surface}
                      borderColor={site.theme.border}
                      textColor={site.theme.text}
                      padding="md"
                      borderRadius="md"
                    >
                      <div className="text-left">
                        <p className="font-bold mb-1">{template.name} →</p>
                        <p className="text-sm" style={{ color: site.theme.textMuted }}>
                          {template.responses[0]}
                        </p>
                      </div>
                    </StyledCard>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          // Active - Chat view
          <div className="h-full flex flex-col">
            {/* Messages */}
            <div
              className="flex-1 overflow-y-auto p-4 space-y-3"
              style={{ background: site.theme.background }}
            >
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <StyledCard
                    bgColor={
                      msg.sender === 'system' ? site.theme.surface :
                      msg.sender === 'user' ? site.theme.primary :
                      site.theme.secondary
                    }
                    borderColor="transparent"
                    textColor={
                      msg.sender === 'system' ? site.theme.textMuted :
                      msg.sender === 'user' ? 'white' :
                      site.theme.text
                    }
                    padding="md"
                    borderRadius="md"
                    className="max-w-xs"
                  >
                    {msg.sender === 'system' ? (
                      <p className="text-sm italic text-center">{msg.text}</p>
                    ) : (
                      <p className="text-sm">{msg.text}</p>
                    )}
                  </StyledCard>
                </div>
              ))}

              {botTyping && (
                <StyledCard
                  bgColor={site.theme.secondary}
                  borderColor="transparent"
                  textColor={site.theme.text}
                  padding="md"
                  borderRadius="md"
                  className="max-w-xs"
                >
                  <p className="text-sm italic">typing...</p>
                </StyledCard>
              )}

              <div ref={messageEndRef} />
            </div>

            {/* Input Area */}
            <div
              className="p-4 border-t"
              style={{
                background: site.theme.surface,
                borderTopColor: site.theme.border,
              }}
            >
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 rounded text-sm"
                  style={{
                    background: site.theme.background,
                    border: `1px solid ${site.theme.border}`,
                    color: site.theme.text,
                  }}
                />
                <Button
                  variant="primary"
                  backgroundColor={site.theme.primary}
                  textColor="white"
                  onClick={handleSendMessage}
                  disabled={!inputText.trim()}
                >
                  Send
                </Button>
              </div>
              <Button
                variant="outline"
                borderColor={site.theme.border}
                backgroundColor={site.theme.surface}
                textColor={site.theme.text}
                width="full"
                onClick={handleEnd}
              >
                End Chat
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default YourInteractiveSite
