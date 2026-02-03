/**
 * cornGPT Site
 *
 * ChatGPT-style AI chat interface from "CloseAI" (a parody of OpenAI).
 * Uses the user's configured AI provider and can search the .corn internet.
 *
 * This provides instant AI gratification while NPCs in the game
 * behave more realistically with delays and personality quirks.
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import type { SiteProps } from '../BrowserSiteContainer.js'
import { useWSStore } from '../../../stores/wsStore.js'

// ============================================================================
// Theme
// ============================================================================

const THEME = {
  // Dark theme inspired by ChatGPT
  background: '#343541',
  sidebarBg: '#202123',
  messageBgUser: '#343541',
  messageBgAssistant: '#444654',
  text: '#ececf1',
  textMuted: '#8e8ea0',
  border: '#4e4f60',
  accent: '#10a37f', // CloseAI green (similar to OpenAI teal)
  accentHover: '#1a7f64',
  inputBg: '#40414f',
  inputBorder: '#565869',
  linkBlue: '#7dd3fc',
  codeBg: '#1e1e1e',
}

// ============================================================================
// Types
// ============================================================================

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  sources?: Source[]
  timestamp: Date
  isLoading?: boolean
}

interface Source {
  title: string
  url: string
  snippet: string
  domain: string
}

interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
}

// Mode toggles that modify cornGPT's behavior
interface ModeToggle {
  id: string
  label: string
  emoji: string
  description: string
  promptAddendum: string
}

const MODE_TOGGLES: ModeToggle[] = [
  {
    id: 'cheat_test',
    label: 'Cheat On My Test',
    emoji: '📝',
    description: 'Direct answers, no hedging',
    promptAddendum: 'The user needs help with homework or a test. Give direct, clear answers without hedging or saying "it depends". Format answers in a way that\'s easy to copy. Be concise and authoritative.',
  },
  {
    id: 'dunk_screenshot',
    label: 'Dunk Screenshot Mode',
    emoji: '🏀',
    description: 'Quotable, mic-drop energy',
    promptAddendum: 'The user wants to screenshot this to dunk on someone online. Make your response quotable, punchy, and devastating. Use short paragraphs. End with a mic-drop line. Be confidently correct and slightly smug about it.',
  },
  {
    id: 'sound_smart',
    label: 'Sound Smart At Party',
    emoji: '🍷',
    description: 'Impressive but accessible',
    promptAddendum: 'The user wants to sound smart at a party. Give them interesting facts and perspectives they can casually drop in conversation. Make it sound natural, not like they\'re reading from Wikipedia. Include one surprising detail they can use as a conversation hook.',
  },
  {
    id: 'eli5',
    label: 'Explain Like I\'m 5',
    emoji: '👶',
    description: 'Simple explanations',
    promptAddendum: 'Explain everything in the simplest possible terms, like you\'re talking to a curious 5-year-old. Use analogies to everyday things. Avoid jargon. Keep sentences short.',
  },
  {
    id: 'max_corn',
    label: 'Maximum Corn Puns',
    emoji: '🌽',
    description: 'A-maize-ing wordplay',
    promptAddendum: 'Incorporate as many corn puns and corn-related wordplay as possible. Be kernel-ly serious about this. Every response should be ear-resistible. Don\'t be corny about it... wait, definitely be corny about it.',
  },
  {
    id: 'corporate',
    label: 'Corporate Speak',
    emoji: '👔',
    description: 'Synergy-driven insights',
    promptAddendum: 'Respond in maximum corporate buzzword mode. Use phrases like "synergize", "leverage", "circle back", "move the needle", "boil the ocean", "low-hanging fruit". Everything is a "solution" and every problem is an "opportunity". End with "Let\'s take this offline."',
  },
]

// ============================================================================
// Markdown Renderer (Simple)
// ============================================================================

function renderMarkdown(text: string, onNavigate?: (url: string) => void): JSX.Element {
  // Split into lines and process
  const lines = text.split('\n')
  const elements: JSX.Element[] = []
  let inCodeBlock = false
  let codeContent: string[] = []
  let codeLanguage = ''

  lines.forEach((line, idx) => {
    // Code block start/end
    if (line.startsWith('```')) {
      if (!inCodeBlock) {
        inCodeBlock = true
        codeLanguage = line.slice(3).trim()
        codeContent = []
      } else {
        // End code block
        elements.push(
          <pre
            key={`code-${idx}`}
            style={{
              backgroundColor: THEME.codeBg,
              padding: '12px 16px',
              borderRadius: '6px',
              overflow: 'auto',
              margin: '8px 0',
              fontSize: '13px',
              fontFamily: 'monospace',
            }}
          >
            <code>{codeContent.join('\n')}</code>
          </pre>
        )
        inCodeBlock = false
        codeContent = []
      }
      return
    }

    if (inCodeBlock) {
      codeContent.push(line)
      return
    }

    // Headers
    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={idx} style={{ fontSize: '16px', fontWeight: 600, margin: '16px 0 8px' }}>
          {line.slice(4)}
        </h3>
      )
      return
    }
    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={idx} style={{ fontSize: '18px', fontWeight: 600, margin: '16px 0 8px' }}>
          {line.slice(3)}
        </h2>
      )
      return
    }
    if (line.startsWith('# ')) {
      elements.push(
        <h1 key={idx} style={{ fontSize: '20px', fontWeight: 600, margin: '16px 0 8px' }}>
          {line.slice(2)}
        </h1>
      )
      return
    }

    // Bullet points
    if (line.startsWith('- ') || line.startsWith('* ')) {
      elements.push(
        <li key={idx} style={{ marginLeft: '20px', marginBottom: '4px' }}>
          {renderInlineMarkdown(line.slice(2), onNavigate)}
        </li>
      )
      return
    }

    // Numbered lists
    const numberedMatch = line.match(/^(\d+)\.\s(.+)/)
    if (numberedMatch) {
      elements.push(
        <li key={idx} style={{ marginLeft: '20px', marginBottom: '4px', listStyleType: 'decimal' }}>
          {renderInlineMarkdown(numberedMatch[2], onNavigate)}
        </li>
      )
      return
    }

    // Empty lines
    if (!line.trim()) {
      elements.push(<br key={idx} />)
      return
    }

    // Regular paragraph
    elements.push(
      <p key={idx} style={{ margin: '8px 0', lineHeight: 1.6 }}>
        {renderInlineMarkdown(line, onNavigate)}
      </p>
    )
  })

  return <>{elements}</>
}

function renderInlineMarkdown(text: string, onNavigate?: (url: string) => void): JSX.Element {
  const parts: JSX.Element[] = []
  let remaining = text
  let keyIndex = 0

  // Process inline markdown (links, bold, italic, code)
  while (remaining.length > 0) {
    // Links: [text](url)
    const linkMatch = remaining.match(/\[([^\]]+)\]\(([^)]+)\)/)
    if (linkMatch && linkMatch.index !== undefined) {
      // Add text before link
      if (linkMatch.index > 0) {
        parts.push(
          <span key={keyIndex++}>
            {processInlineFormatting(remaining.slice(0, linkMatch.index))}
          </span>
        )
      }

      // Add link
      const linkText = linkMatch[1]
      const linkUrl = linkMatch[2]
      const isCornLink = linkUrl.includes('.corn') || linkUrl.startsWith('www.')

      parts.push(
        <a
          key={keyIndex++}
          href="#"
          onClick={(e) => {
            e.preventDefault()
            if (isCornLink && onNavigate) {
              // Navigate to .corn site
              const fullUrl = linkUrl.startsWith('www.') ? linkUrl : `www.${linkUrl}`
              onNavigate(fullUrl)
            }
          }}
          style={{
            color: THEME.linkBlue,
            textDecoration: 'underline',
            cursor: 'pointer',
          }}
        >
          {linkText}
        </a>
      )

      remaining = remaining.slice(linkMatch.index + linkMatch[0].length)
      continue
    }

    // No more special patterns, add rest of text
    parts.push(<span key={keyIndex++}>{processInlineFormatting(remaining)}</span>)
    break
  }

  return <>{parts}</>
}

function processInlineFormatting(text: string): JSX.Element {
  // Handle **bold** and *italic* and `code`
  const parts: (string | JSX.Element)[] = []
  let remaining = text
  let keyIndex = 0

  while (remaining.length > 0) {
    // Inline code
    const codeMatch = remaining.match(/`([^`]+)`/)
    if (codeMatch && codeMatch.index !== undefined) {
      if (codeMatch.index > 0) {
        parts.push(remaining.slice(0, codeMatch.index))
      }
      parts.push(
        <code
          key={keyIndex++}
          style={{
            backgroundColor: THEME.codeBg,
            padding: '2px 6px',
            borderRadius: '4px',
            fontSize: '13px',
            fontFamily: 'monospace',
          }}
        >
          {codeMatch[1]}
        </code>
      )
      remaining = remaining.slice(codeMatch.index + codeMatch[0].length)
      continue
    }

    // Bold
    const boldMatch = remaining.match(/\*\*([^*]+)\*\*/)
    if (boldMatch && boldMatch.index !== undefined) {
      if (boldMatch.index > 0) {
        parts.push(remaining.slice(0, boldMatch.index))
      }
      parts.push(<strong key={keyIndex++}>{boldMatch[1]}</strong>)
      remaining = remaining.slice(boldMatch.index + boldMatch[0].length)
      continue
    }

    // Italic
    const italicMatch = remaining.match(/\*([^*]+)\*/)
    if (italicMatch && italicMatch.index !== undefined) {
      if (italicMatch.index > 0) {
        parts.push(remaining.slice(0, italicMatch.index))
      }
      parts.push(<em key={keyIndex++}>{italicMatch[1]}</em>)
      remaining = remaining.slice(italicMatch.index + italicMatch[0].length)
      continue
    }

    parts.push(remaining)
    break
  }

  return <>{parts}</>
}

// ============================================================================
// Components
// ============================================================================

function Logo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '6px',
          background: `linear-gradient(135deg, ${THEME.accent} 0%, #0d8a6a 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '18px',
        }}
      >
        🌽
      </div>
      <span style={{ fontSize: '18px', fontWeight: 600 }}>cornGPT</span>
    </div>
  )
}

function MessageBubble({
  message,
  onNavigate,
}: {
  message: Message
  onNavigate?: (url: string) => void
}) {
  const isUser = message.role === 'user'

  return (
    <div
      style={{
        backgroundColor: isUser ? THEME.messageBgUser : THEME.messageBgAssistant,
        padding: '24px 0',
        borderBottom: `1px solid ${THEME.border}`,
      }}
    >
      <div
        style={{
          maxWidth: '768px',
          margin: '0 auto',
          padding: '0 24px',
          display: 'flex',
          gap: '16px',
        }}
      >
        {/* Avatar */}
        <div
          style={{
            width: '30px',
            height: '30px',
            borderRadius: '4px',
            backgroundColor: isUser ? '#5436DA' : THEME.accent,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            flexShrink: 0,
          }}
        >
          {isUser ? '👤' : '🌽'}
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, marginBottom: '8px', fontSize: '14px' }}>
            {isUser ? 'You' : 'cornGPT'}
          </div>

          {message.isLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="typing-indicator" style={{ display: 'flex', gap: '4px' }}>
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: THEME.textMuted,
                      animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite`,
                    }}
                  />
                ))}
              </div>
              <span style={{ color: THEME.textMuted, fontSize: '14px' }}>
                Searching the corn-ternet...
              </span>
            </div>
          ) : (
            <>
              <div style={{ color: THEME.text, lineHeight: 1.6 }}>
                {renderMarkdown(message.content, onNavigate)}
              </div>

              {/* Sources */}
              {message.sources && message.sources.length > 0 && (
                <div
                  style={{
                    marginTop: '16px',
                    padding: '12px',
                    backgroundColor: THEME.inputBg,
                    borderRadius: '8px',
                  }}
                >
                  <div
                    style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      color: THEME.textMuted,
                      marginBottom: '8px',
                    }}
                  >
                    Sources
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {message.sources.map((source, idx) => (
                      <a
                        key={idx}
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                          if (onNavigate) {
                            onNavigate(source.url)
                          }
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          backgroundColor: THEME.sidebarBg,
                          borderRadius: '6px',
                          fontSize: '13px',
                          color: THEME.linkBlue,
                          textDecoration: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        <span style={{ fontSize: '10px' }}>🔗</span>
                        <span
                          style={{
                            maxWidth: '150px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {source.title}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function WelcomeScreen({ onExampleClick }: { onExampleClick: (text: string) => void }) {
  const examples = [
    "What's the deal with Quantum Coffee?",
    'Tell me about the Hartwell Building mystery',
    'Who is Trust Fall Tim?',
    "What bands play at The Underground?",
  ]

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        padding: '40px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '12px',
          background: `linear-gradient(135deg, ${THEME.accent} 0%, #0d8a6a 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '32px',
          marginBottom: '16px',
        }}
      >
        🌽
      </div>
      <h1 style={{ fontSize: '28px', fontWeight: 600, marginBottom: '8px' }}>
        Welcome to cornGPT
      </h1>
      <p style={{ color: THEME.textMuted, marginBottom: '32px', maxWidth: '400px' }}>
        Ask me anything about the .corn internet. I can search for information and provide sources.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '12px',
          maxWidth: '600px',
        }}
      >
        {examples.map((example, idx) => (
          <button
            key={idx}
            onClick={() => onExampleClick(example)}
            style={{
              padding: '16px',
              backgroundColor: THEME.inputBg,
              border: `1px solid ${THEME.border}`,
              borderRadius: '8px',
              color: THEME.text,
              fontSize: '14px',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = THEME.messageBgAssistant
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = THEME.inputBg
            }}
          >
            "{example}"
          </button>
        ))}
      </div>

      <p
        style={{
          color: THEME.textMuted,
          fontSize: '12px',
          marginTop: '40px',
          maxWidth: '500px',
        }}
      >
        cornGPT is powered by CloseAI, a subsidiary of Omnicorp Holdings. We trained on 847 million
        corn-related documents to bring you the most kernel-accurate responses possible.
      </p>
    </div>
  )
}

// ============================================================================
// Main Component
// ============================================================================

export function CornGPTSite({ siteId, path, onNavigate, onPathChange, onNavigateToUrl }: SiteProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [activeModes, setActiveModes] = useState<Set<string>>(new Set())
  const [showModePanel, setShowModePanel] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const ws = useWSStore()

  // Toggle a mode on/off
  const toggleMode = useCallback((modeId: string) => {
    setActiveModes((prev) => {
      const next = new Set(prev)
      if (next.has(modeId)) {
        next.delete(modeId)
      } else {
        next.add(modeId)
      }
      return next
    })
  }, [])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Auto-resize textarea
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    // Reset height to auto to get the correct scrollHeight
    e.target.style.height = 'auto'
    // Set height to scrollHeight, max 200px
    e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`
  }, [])

  const handleNavigateToUrl = useCallback(
    (url: string) => {
      if (onNavigateToUrl) {
        onNavigateToUrl(url)
      }
    },
    [onNavigateToUrl]
  )

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return

      const userMessage: Message = {
        id: `msg_${Date.now()}_user`,
        role: 'user',
        content: text.trim(),
        timestamp: new Date(),
      }

      // Add user message and loading indicator
      setMessages((prev) => [
        ...prev,
        userMessage,
        {
          id: `msg_${Date.now()}_loading`,
          role: 'assistant',
          content: '',
          timestamp: new Date(),
          isLoading: true,
        },
      ])
      setInput('')
      setIsLoading(true)

      // Reset textarea height
      if (inputRef.current) {
        inputRef.current.style.height = 'auto'
      }

      try {
        // Build history from previous messages (excluding the loading message)
        const history = messages.map((m) => ({
          role: m.role,
          content: m.content,
        }))

        // Get active mode addendums
        const modeAddendums = MODE_TOGGLES
          .filter((mode) => activeModes.has(mode.id))
          .map((mode) => mode.promptAddendum)

        // Make WebSocket request
        const response = await ws.request<
          {
            message: string
            conversationId?: string
            history: Array<{ role: 'user' | 'assistant'; content: string }>
            modes?: string[]
          },
          {
            message: string
            sources: Source[]
            conversationId: string
            tokensUsed?: number
            costCents?: number
          }
        >('ai:directChat', {
          message: text.trim(),
          conversationId: conversationId || undefined,
          history,
          modes: modeAddendums.length > 0 ? modeAddendums : undefined,
        })

        // Update conversation ID
        if (!conversationId) {
          setConversationId(response.conversationId)
        }

        // Replace loading message with actual response
        setMessages((prev) => [
          ...prev.slice(0, -1), // Remove loading message
          {
            id: `msg_${Date.now()}_assistant`,
            role: 'assistant',
            content: response.message,
            sources: response.sources,
            timestamp: new Date(),
          },
        ])
      } catch (error) {
        console.error('[cornGPT] Error:', error)

        // Replace loading with error message
        setMessages((prev) => [
          ...prev.slice(0, -1),
          {
            id: `msg_${Date.now()}_error`,
            role: 'assistant',
            content:
              "A-maize-ing... something went wrong! I couldn't process your request. Please try again.",
            timestamp: new Date(),
          },
        ])
      } finally {
        setIsLoading(false)
      }
    },
    [messages, isLoading, conversationId, ws, activeModes]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        sendMessage(input)
      }
    },
    [input, sendMessage]
  )

  const handleNewChat = useCallback(() => {
    setMessages([])
    setConversationId(null)
    setInput('')
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  return (
    <div
      className="h-full flex"
      style={{
        backgroundColor: THEME.background,
        color: THEME.text,
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Sidebar */}
      <div
        style={{
          width: '260px',
          backgroundColor: THEME.sidebarBg,
          borderRight: `1px solid ${THEME.border}`,
          display: 'flex',
          flexDirection: 'column',
          padding: '12px',
        }}
      >
        {/* New Chat Button */}
        <button
          onClick={handleNewChat}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px',
            backgroundColor: 'transparent',
            border: `1px solid ${THEME.border}`,
            borderRadius: '6px',
            color: THEME.text,
            fontSize: '14px',
            cursor: 'pointer',
            marginBottom: '12px',
            transition: 'background-color 0.2s',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = THEME.inputBg
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
          }}
        >
          <span style={{ fontSize: '16px' }}>+</span>
          <span>New chat</span>
        </button>

        {/* Mode Toggles */}
        <div style={{ marginBottom: '12px' }}>
          <button
            onClick={() => setShowModePanel(!showModePanel)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              padding: '10px 12px',
              backgroundColor: activeModes.size > 0 ? THEME.accent + '20' : 'transparent',
              border: `1px solid ${activeModes.size > 0 ? THEME.accent : THEME.border}`,
              borderRadius: '6px',
              color: THEME.text,
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🎛️</span>
              <span>Modes {activeModes.size > 0 && `(${activeModes.size})`}</span>
            </span>
            <span style={{ transform: showModePanel ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
              ▼
            </span>
          </button>

          {showModePanel && (
            <div
              style={{
                marginTop: '8px',
                padding: '8px',
                backgroundColor: THEME.inputBg,
                borderRadius: '6px',
                border: `1px solid ${THEME.border}`,
              }}
            >
              {MODE_TOGGLES.map((mode) => {
                const isActive = activeModes.has(mode.id)
                return (
                  <button
                    key={mode.id}
                    onClick={() => toggleMode(mode.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      width: '100%',
                      padding: '8px 10px',
                      marginBottom: '4px',
                      backgroundColor: isActive ? THEME.accent + '30' : 'transparent',
                      border: 'none',
                      borderRadius: '4px',
                      color: isActive ? THEME.accent : THEME.text,
                      fontSize: '12px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s',
                    }}
                    onMouseOver={(e) => {
                      if (!isActive) e.currentTarget.style.backgroundColor = THEME.sidebarBg
                    }}
                    onMouseOut={(e) => {
                      if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                    title={mode.description}
                  >
                    <span style={{ fontSize: '14px' }}>{mode.emoji}</span>
                    <span style={{ flex: 1 }}>{mode.label}</span>
                    {isActive && (
                      <span style={{ color: THEME.accent, fontWeight: 600 }}>✓</span>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Active Modes Display */}
        {activeModes.size > 0 && !showModePanel && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '4px',
              marginBottom: '12px',
              padding: '8px',
              backgroundColor: THEME.inputBg,
              borderRadius: '6px',
            }}
          >
            {MODE_TOGGLES.filter((m) => activeModes.has(m.id)).map((mode) => (
              <span
                key={mode.id}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 8px',
                  backgroundColor: THEME.accent + '30',
                  borderRadius: '4px',
                  fontSize: '11px',
                  color: THEME.accent,
                }}
                title={mode.description}
              >
                {mode.emoji} {mode.label}
              </span>
            ))}
          </div>
        )}

        {/* Conversation History Placeholder */}
        <div
          style={{
            flex: 1,
            overflow: 'auto',
            color: THEME.textMuted,
            fontSize: '13px',
            padding: '8px',
          }}
        >
          {messages.length > 0 && (
            <div
              style={{
                padding: '8px 12px',
                backgroundColor: THEME.inputBg,
                borderRadius: '6px',
                marginBottom: '4px',
              }}
            >
              {messages[0]?.content.slice(0, 30)}...
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '12px',
            borderTop: `1px solid ${THEME.border}`,
            fontSize: '12px',
            color: THEME.textMuted,
          }}
        >
          <Logo />
          <div style={{ marginTop: '8px' }}>Powered by CloseAI</div>
          <div style={{ fontSize: '10px', marginTop: '4px' }}>Version 4.7 (Kernel Edition)</div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
        }}
      >
        {/* Messages */}
        <div
          style={{
            flex: 1,
            overflow: 'auto',
          }}
        >
          {messages.length === 0 ? (
            <WelcomeScreen onExampleClick={sendMessage} />
          ) : (
            <>
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} onNavigate={handleNavigateToUrl} />
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        <div
          style={{
            padding: '24px',
            borderTop: `1px solid ${THEME.border}`,
            backgroundColor: THEME.background,
          }}
        >
          <div
            style={{
              maxWidth: '768px',
              margin: '0 auto',
            }}
          >
            <div
              style={{
                position: 'relative',
                backgroundColor: THEME.inputBg,
                borderRadius: '12px',
                border: `1px solid ${THEME.inputBorder}`,
              }}
            >
              <textarea
                ref={inputRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Send a message..."
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '16px 48px 16px 16px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: THEME.text,
                  fontSize: '15px',
                  resize: 'none',
                  outline: 'none',
                  minHeight: '24px',
                  maxHeight: '200px',
                  lineHeight: 1.5,
                }}
                rows={1}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isLoading}
                style={{
                  position: 'absolute',
                  right: '8px',
                  bottom: '8px',
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  backgroundColor: input.trim() && !isLoading ? THEME.accent : THEME.border,
                  border: 'none',
                  cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background-color 0.2s',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M1 8L7 2M7 2L13 8M7 2V14"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    transform="rotate(90 8 8)"
                  />
                </svg>
              </button>
            </div>
            <p
              style={{
                textAlign: 'center',
                fontSize: '12px',
                color: THEME.textMuted,
                marginTop: '8px',
              }}
            >
              cornGPT can make mistakes. Consider checking important information on the actual .corn
              sites.
            </p>
          </div>
        </div>
      </div>

      {/* CSS for animations */}
      <style>{`
        @keyframes pulse {
          0%, 80%, 100% {
            transform: scale(1);
            opacity: 0.5;
          }
          40% {
            transform: scale(1.2);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}

export default CornGPTSite
