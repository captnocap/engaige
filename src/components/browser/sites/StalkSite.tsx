/**
 * Stalk Site - www.stalk.corn
 *
 * Twitch parody streaming platform for the engAIge browser.
 * Named after corn stalks, obviously. Features live streams, chat,
 * categories, channel profiles, and subscription tiers.
 *
 * Integrates with world lore: Derek, Trust Fall Tim, Floor 13,
 * The Underground, Mildred, and Omnicorp Holdings.
 */

import { useState, useEffect, useRef, useMemo } from 'react'
import type { SiteProps } from '../BrowserSiteContainer.js'
import { useSiteContent, type SiteContentItem } from '../../../hooks/useSiteContent.js'

// ============================================================================
// Types & Data
// ============================================================================

interface Stream {
  id: string
  username: string
  displayName: string
  title: string
  category: string
  viewers: number
  stalkers: number
  thumbnailEmoji: string
  isLive: boolean
  isPartner: boolean
  tags: string[]
  description: string
  chatMessages: ChatMessage[]
}

interface ChatMessage {
  id: string
  username: string
  message: string
  badges: string[]
  color: string
}

interface Category {
  id: string
  name: string
  viewers: number
  emoji: string
}

// Site theme - purple/dark like Twitch
const theme = {
  primary: '#9146FF',
  secondary: '#772CE8',
  background: '#0E0E10',
  surface: '#18181B',
  surfaceAlt: '#1F1F23',
  text: '#EFEFF1',
  textMuted: '#ADADB8',
  border: '#2F2F35',
}

// Categories available on Stalk
const CATEGORIES: Category[] = [
  { id: 'just-chatting', name: 'Just Chatting', viewers: 284700, emoji: '💬' },
  { id: 'corn-farming', name: 'Corn Farming Simulator', viewers: 84700, emoji: '🌽' },
  { id: 'quantum-coffee', name: 'Quantum Coffee Brewing', viewers: 4700, emoji: '☕' },
  { id: 'trust-fall', name: 'Trust Fall Practice', viewers: 28470, emoji: '🙆‍♂️' },
  { id: 'floor13', name: 'Floor 13 Watch', viewers: 1300, emoji: '🏚️' },
  { id: 'music', name: 'Music', viewers: 147000, emoji: '🎵' },
  { id: 'irl', name: 'IRL', viewers: 98400, emoji: '📹' },
  { id: 'food-drink', name: 'Food & Drink', viewers: 42000, emoji: '🍽️' },
]

// Featured streams with world lore integration
const STREAMS: Stream[] = [
  {
    id: 'derek-brews',
    username: 'Derek_Brews',
    displayName: 'Derek Observerson',
    title: 'Day 847: The perfect quantum cup - OBSERVATION MARATHON',
    category: 'Quantum Coffee Brewing',
    viewers: 847,
    stalkers: 847,
    thumbnailEmoji: '☕',
    isLive: true,
    isPartner: true,
    tags: ['English', 'Quantum', 'Coffee'],
    description: 'Former IT consultant. Current quantum coffee researcher. Divorced. Day 847 of documenting my journey to the perfect cup.',
    chatMessages: [
      { id: 'd1', username: 'QuantumFan42', message: 'KEKW quantum coffee KEKW', badges: ['sub'], color: '#9146FF' },
      { id: 'd2', username: 'CoffeeCritic', message: 'Has anyone actually TASTED the difference??', badges: [], color: '#00FF7F' },
      { id: 'd3', username: 'SkepticalSam', message: 'bro this is just regular coffee with extra steps', badges: [], color: '#1E90FF' },
      { id: 'd4', username: 'JustHereForCat', message: 'WHERE IS MR WHISKERS', badges: ['sub'], color: '#FF69B4' },
    ],
  },
  {
    id: 'trustfalltim',
    username: 'TrustFallTimOfficial',
    displayName: 'Trust Fall Tim',
    title: 'TRUST FALL MARATHON - 24 HOUR STREAM - Fall #2848',
    category: 'IRL',
    viewers: 2847,
    stalkers: 28470,
    thumbnailEmoji: '🙆‍♂️',
    isLive: true,
    isPartner: true,
    tags: ['English', 'Trust', 'IRL'],
    description: '2,847 documented falls. 78.5% catch rate. Will YOU catch me?',
    chatMessages: [
      { id: 't1', username: 'BigKevin', message: 'READY TO CATCH KING', badges: ['mod'], color: '#FF4500' },
      { id: 't2', username: 'TrustIssues', message: 'TRUST FALL IN CHAT', badges: ['sub'], color: '#9146FF' },
      { id: 't3', username: 'MarsTheOwner', message: 'coming by Underground tonight?', badges: ['vip'], color: '#FFD700' },
      { id: 't4', username: 'TheIncidentSurvivor', message: 'we dont talk about march 2022', badges: ['sub'], color: '#FF69B4' },
    ],
  },
  {
    id: 'floor13cam',
    username: 'Floor13Cam',
    displayName: 'FLOOR 13 OFFICIAL',
    title: '[24/7] Hartwell Building - Elevator between 12 and 14',
    category: 'Floor 13 Watch',
    viewers: 13,
    stalkers: 13,
    thumbnailEmoji: '🏚️',
    isLive: true,
    isPartner: false,
    tags: ['Mystery', 'Paranormal', '24/7'],
    description: 'Static camera. Floor that does not exist. Sometimes the numbers... change.',
    chatMessages: [
      { id: 'f1', username: 'HartwellWatcher', message: 'Has anyone seen floor 13 guy move?', badges: ['sub'], color: '#FF4500' },
      { id: 'f2', username: 'ParanormalPete', message: 'I swear I saw someone in the Hartwell stream', badges: [], color: '#9146FF' },
      { id: 'f3', username: 'MirrorWatcher', message: 'THE MIRRORS ARE DOORS', badges: ['sub'], color: '#FF0000' },
      { id: 'f4', username: 'OmnicorpBot', message: 'Nothing to see here. Move along.', badges: ['mod'], color: '#808080' },
    ],
  },
  {
    id: 'underground-stream',
    username: 'UndergroundVenueStream',
    displayName: 'The Underground Official',
    title: 'LIVE FROM THE UNDERGROUND - Open Mic Night',
    category: 'Music',
    viewers: 420,
    stalkers: 4200,
    thumbnailEmoji: '🎵',
    isLive: true,
    isPartner: true,
    tags: ['Music', 'Live', 'Local'],
    description: 'Official stream from The Underground venue. Owner: Mars. Acoustics: Questionable. Vibes: Immaculate.',
    chatMessages: [
      { id: 'u1', username: 'MarsTheOwner', message: 'drink specials all night stalkers', badges: ['broadcaster'], color: '#FFD700' },
      { id: 'u2', username: 'VelvetFan', message: 'any word on Velvet Algorithms returning??', badges: ['sub'], color: '#9146FF' },
      { id: 'u3', username: 'NeonRequiemRIP', message: 'still not over that final show...', badges: ['sub'], color: '#FF69B4' },
      { id: 'u4', username: 'TrustFallTimOfficial', message: 'be there in 20 for trust fall intermission', badges: ['vip'], color: '#EA580C' },
    ],
  },
  {
    id: 'mildred-eats',
    username: 'MildredEats',
    displayName: 'Mildred Gasketsworth',
    title: 'Rating gas station sushi LIVE - Flying J #847',
    category: 'Food & Drink',
    viewers: 847,
    stalkers: 8470,
    thumbnailEmoji: '🍣',
    isLive: true,
    isPartner: true,
    tags: ['Food', 'Sushi', 'Reviews'],
    description: '8,470 gas stations. 25,000+ sushi samples. Zero food poisoning incidents (publicly confirmed).',
    chatMessages: [
      { id: 'm1', username: 'SushiSkeptic', message: 'mildred please this cannot be safe', badges: [], color: '#1E90FF' },
      { id: 'm2', username: 'GasStationGourmet', message: 'QUEEN OF THE PUMPS', badges: ['sub'], color: '#FF69B4' },
      { id: 'm3', username: 'FDAWatcher', message: 'this has to violate SOMETHING', badges: [], color: '#FF4500' },
      { id: 'm4', username: 'TruckStopConnoisseur', message: 'Flying J #847 is elite tier actually', badges: ['sub'], color: '#FFD700' },
    ],
  },
  {
    id: 'omnicorp',
    username: 'OmnicorpHoldings',
    displayName: 'Omnicorp Holdings',
    title: '[INTERNAL] Q4 Compliance Training - DO NOT DISTRIBUTE',
    category: 'Just Chatting',
    viewers: 1,
    stalkers: 1,
    thumbnailEmoji: '🏢',
    isLive: true,
    isPartner: false,
    tags: ['Corporate', 'Training'],
    description: 'Official Omnicorp Holdings channel. Unauthorized viewing may result in review.',
    chatMessages: [
      { id: 'o1', username: 'Employee_7734', message: 'why is this public??', badges: [], color: '#808080' },
      { id: 'o2', username: 'OmnicorpBot', message: 'Please remain in your designated viewing area.', badges: ['mod'], color: '#808080' },
      { id: 'o3', username: 'GlitchWatcher', message: 'did anyone else see that?', badges: [], color: '#FF0000' },
      { id: 'o4', username: 'HartwellWatcher', message: 'this is definitely related to floor 13', badges: [], color: '#9146FF' },
    ],
  },
]

// Subscription tiers with corn-themed names
const SUB_TIERS = [
  { name: 'Kernel', price: '$4.99', emoji: '🌽', benefits: ['Ad-free viewing', 'Chat badges', '1 emote'] },
  { name: 'Cob', price: '$9.99', emoji: '🌽🌽', benefits: ['Everything in Kernel', '5 emotes', 'Subscriber streams'] },
  { name: 'Husk', price: '$24.99', emoji: '🌽🌽🌽', benefits: ['Everything in Cob', 'All emotes', 'Exclusive corn content'] },
]

// Unhinged chat messages for auto-generation
const UNHINGED_MESSAGES = [
  { username: 'RandomStalker', message: 'KEKW quantum coffee KEKW', color: '#9146FF' },
  { username: 'CornEnjoyer', message: 'stalk is better than twitch no cap', color: '#00FF7F' },
  { username: 'ChaoticViewer', message: 'Has anyone seen floor 13 guy move?', color: '#FF4500' },
  { username: 'TrustFaller', message: 'TRUST FALL IN CHAT', color: '#FFD700' },
  { username: 'ParanoidPete', message: 'I swear I saw someone in the Hartwell stream', color: '#FF69B4' },
  { username: 'EmoteSpammer', message: 'CornPog CornPog CornPog', color: '#1E90FF' },
  { username: 'LoreWatcher', message: 'mars catching tim one handed was legendary', color: '#32CD32' },
  { username: 'MildredFan', message: 'gas station sushi supremacy', color: '#9400D3' },
  { username: 'DerekStan', message: 'day 847... we believe in you derek', color: '#FF8C00' },
  { username: 'FloorWatcher', message: 'the mirrors are doors!!!', color: '#FF0000' },
  { username: 'QuantumSkeptic', message: 'its literally just coffee bro', color: '#BA55D3' },
]

// ============================================================================
// DB Adapter
// ============================================================================

/**
 * Maps a SiteContentItem from the database to the local Stream interface.
 * Uses metadata for stream-specific fields like chatMessages, viewers, stalkers, etc.
 */
function dbToStream(item: SiteContentItem): Stream {
  const m = item.metadata || {}
  return {
    id: item.slug,
    username: m.username ?? m.user_name ?? item.slug,
    displayName: item.title,
    title: item.subtitle ?? m.streamTitle ?? m.stream_title ?? item.title,
    category: item.category ?? m.category ?? 'Just Chatting',
    viewers: m.viewers ?? item.viewCount ?? 0,
    stalkers: m.stalkers ?? m.followers ?? item.likeCount ?? 0,
    thumbnailEmoji: item.thumbnailEmoji ?? m.thumbnailEmoji ?? m.thumbnail_emoji ?? '🌽',
    isLive: m.isLive ?? m.is_live ?? true,
    isPartner: m.isPartner ?? m.is_partner ?? false,
    tags: item.tags.length > 0 ? item.tags : (m.tags ?? []),
    description: item.body ?? item.summary ?? m.description ?? '',
    chatMessages: Array.isArray(m.chatMessages ?? m.chat_messages) ? (m.chatMessages ?? m.chat_messages) : [],
  }
}

// ============================================================================
// Main Component
// ============================================================================

export function StalkSite({ siteId, onNavigate }: SiteProps) {
  const { content: dbContent } = useSiteContent('stalk')
  const streams = useMemo(() => {
    if (dbContent.length > 0) return dbContent.map(dbToStream)
    return STREAMS
  }, [dbContent])

  const [selectedStream, setSelectedStream] = useState<Stream | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [isFollowing, setIsFollowing] = useState(false)

  const filteredStreams = selectedCategory
    ? streams.filter(s => s.category === selectedCategory)
    : streams

  const handleBack = () => {
    setSelectedStream(null)
    setSelectedCategory(null)
  }

  return (
    <div className="min-h-full" style={{ background: theme.background, color: theme.text }}>
      <Header onLogoClick={handleBack} />
      {selectedStream ? (
        <StreamView stream={selectedStream} onBack={handleBack} isFollowing={isFollowing} setIsFollowing={setIsFollowing} />
      ) : (
        <BrowseView
          streams={filteredStreams}
          categories={CATEGORIES}
          selectedCategory={selectedCategory}
          onStreamClick={setSelectedStream}
          onCategorySelect={setSelectedCategory}
        />
      )}
    </div>
  )
}

// ============================================================================
// Header Component
// ============================================================================

function Header({ onLogoClick }: { onLogoClick: () => void }) {
  return (
    <header className="sticky top-0 z-20 px-4 py-2 flex items-center justify-between" style={{ background: theme.surface, borderBottom: `1px solid ${theme.border}` }}>
      <div className="flex items-center gap-6">
        <button onClick={onLogoClick} className="flex items-center gap-2 hover:opacity-80">
          <span className="text-2xl">🌽</span>
          <span className="text-xl font-bold" style={{ color: theme.primary }}>Stalk</span>
        </button>
        <nav className="flex items-center gap-4">
          <button className="text-sm font-medium" style={{ color: theme.primary }}>Browse</button>
          <span style={{ color: theme.border }}>|</span>
          <button className="text-sm font-medium" style={{ color: theme.textMuted }}>Following</button>
        </nav>
      </div>
      <div className="flex-1 max-w-md mx-4">
        <input
          type="text"
          placeholder="Search"
          className="w-full px-4 py-1.5 rounded text-sm"
          style={{ background: theme.surfaceAlt, border: `1px solid ${theme.border}`, color: theme.text }}
        />
      </div>
      <div className="flex items-center gap-4">
        <button className="text-xl">🔔</button>
        <button className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: theme.primary }}>G</button>
      </div>
    </header>
  )
}

// ============================================================================
// Browse View Component
// ============================================================================

interface BrowseViewProps {
  streams: Stream[]
  categories: Category[]
  selectedCategory: string | null
  onStreamClick: (stream: Stream) => void
  onCategorySelect: (category: string | null) => void
}

function BrowseView({ streams, categories, selectedCategory, onStreamClick, onCategorySelect }: BrowseViewProps) {
  return (
    <div className="flex">
      {/* Categories Sidebar */}
      <aside className="w-60 shrink-0 p-4 sticky top-12 h-[calc(100vh-48px)] overflow-y-auto" style={{ background: theme.surface, borderRight: `1px solid ${theme.border}` }}>
        <h3 className="text-sm font-semibold mb-3" style={{ color: theme.textMuted }}>CATEGORIES</h3>
        <div className="space-y-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onCategorySelect(selectedCategory === cat.name ? null : cat.name)}
              className="w-full flex items-center gap-3 px-2 py-2 rounded text-left"
              style={{ background: selectedCategory === cat.name ? theme.surfaceAlt : 'transparent' }}
            >
              <span className="text-xl">{cat.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{cat.name}</p>
                <p className="text-xs" style={{ color: theme.textMuted }}>{cat.viewers.toLocaleString()} viewers</p>
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-1">{selectedCategory || "Live Channels We Think You'll Like"}</h2>
          <p className="text-sm" style={{ color: theme.textMuted }}>
            {selectedCategory ? `Stalkers are watching ${selectedCategory}` : 'Based on your stalking history'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {streams.map((stream) => (
            <StreamCard key={stream.id} stream={stream} onClick={() => onStreamClick(stream)} />
          ))}
        </div>

        {!selectedCategory && (
          <div className="mt-12">
            <h2 className="text-lg font-bold mb-4">Categories</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {categories.slice(0, 6).map((cat) => (
                <button key={cat.id} onClick={() => onCategorySelect(cat.name)} className="text-left group">
                  <div className="aspect-[3/4] rounded-lg mb-2 flex items-center justify-center text-5xl" style={{ background: theme.surfaceAlt }}>{cat.emoji}</div>
                  <p className="font-medium text-sm truncate">{cat.name}</p>
                  <p className="text-xs" style={{ color: theme.textMuted }}>{cat.viewers.toLocaleString()} viewers</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

// ============================================================================
// Stream Card Component
// ============================================================================

function StreamCard({ stream, onClick }: { stream: Stream; onClick: () => void }) {
  return (
    <button onClick={onClick} className="text-left group">
      <div className="relative aspect-video rounded-lg overflow-hidden mb-2 flex items-center justify-center" style={{ background: theme.surfaceAlt }}>
        <span className="text-6xl">{stream.thumbnailEmoji}</span>
        {stream.isLive && (
          <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-xs font-bold uppercase" style={{ background: '#EB0400', color: 'white' }}>LIVE</span>
        )}
        <span className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded text-xs font-medium" style={{ background: 'rgba(0,0,0,0.7)', color: 'white' }}>
          {stream.viewers.toLocaleString()} viewers
        </span>
      </div>
      <div className="flex gap-2">
        <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-lg" style={{ background: theme.primary }}>{stream.displayName.charAt(0)}</div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{stream.title}</p>
          <p className="text-sm truncate" style={{ color: theme.textMuted }}>{stream.displayName}</p>
          <p className="text-sm truncate" style={{ color: theme.textMuted }}>{stream.category}</p>
        </div>
      </div>
    </button>
  )
}

// ============================================================================
// Stream View Component
// ============================================================================

interface StreamViewProps {
  stream: Stream
  onBack: () => void
  isFollowing: boolean
  setIsFollowing: (v: boolean) => void
}

function StreamView({ stream, onBack, isFollowing, setIsFollowing }: StreamViewProps) {
  const [chatInput, setChatInput] = useState('')
  const [showSubModal, setShowSubModal] = useState(false)

  return (
    <div className="flex h-[calc(100vh-48px)]">
      {/* Video and Info Section */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Video Player */}
        <div className="relative aspect-video bg-black flex items-center justify-center shrink-0" style={{ maxHeight: '60vh' }}>
          <span className="text-9xl opacity-50">{stream.thumbnailEmoji}</span>
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className="px-2 py-1 rounded text-xs font-bold uppercase" style={{ background: '#EB0400', color: 'white' }}>LIVE</span>
            <span className="px-2 py-1 rounded text-xs font-medium" style={{ background: 'rgba(0,0,0,0.7)', color: 'white' }}>{stream.viewers.toLocaleString()} watching</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-3 flex items-center justify-between" style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.8))' }}>
            <div className="flex items-center gap-2">
              <button className="text-white text-xl">▶️</button>
              <button className="text-white text-xl">🔊</button>
            </div>
            <button className="text-white text-xl">⛶</button>
          </div>
        </div>

        {/* Stream Info */}
        <div className="p-4 overflow-y-auto flex-1" style={{ background: theme.surface }}>
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex gap-3">
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold" style={{ background: theme.primary }}>{stream.displayName.charAt(0)}</div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold">{stream.displayName}</h1>
                  {stream.isPartner && <span className="text-purple-500">✓</span>}
                </div>
                <p className="text-sm" style={{ color: theme.textMuted }}>{stream.stalkers.toLocaleString()} stalkers</p>
                <h2 className="font-medium mt-1">{stream.title}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs px-2 py-0.5 rounded" style={{ background: theme.surfaceAlt }}>{stream.category}</span>
                  {stream.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="text-xs px-2 py-0.5 rounded" style={{ background: theme.surfaceAlt, color: theme.textMuted }}>{tag}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsFollowing(!isFollowing)}
                className="px-4 py-2 rounded font-medium text-sm"
                style={{ background: isFollowing ? theme.surfaceAlt : theme.primary, color: theme.text }}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
              <button onClick={() => setShowSubModal(true)} className="px-4 py-2 rounded font-medium text-sm" style={{ background: theme.primary, color: 'white' }}>Subscribe</button>
            </div>
          </div>
          <div className="rounded-lg p-4 mt-4" style={{ background: theme.surfaceAlt }}>
            <h3 className="font-bold mb-2">About {stream.displayName}</h3>
            <p className="text-sm" style={{ color: theme.textMuted }}>{stream.description}</p>
          </div>
        </div>
      </div>

      {/* Chat Sidebar */}
      <ChatSidebar stream={stream} chatInput={chatInput} setChatInput={setChatInput} />

      {/* Subscription Modal */}
      {showSubModal && <SubscriptionModal stream={stream} onClose={() => setShowSubModal(false)} />}
    </div>
  )
}

// ============================================================================
// Chat Sidebar Component
// ============================================================================

function ChatSidebar({ stream, chatInput, setChatInput }: { stream: Stream; chatInput: string; setChatInput: (v: string) => void }) {
  const chatRef = useRef<HTMLDivElement>(null)
  const [messages, setMessages] = useState(stream.chatMessages)

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight
  }, [messages])

  // Simulate new chat messages
  useEffect(() => {
    const interval = setInterval(() => {
      const randomMsg = UNHINGED_MESSAGES[Math.floor(Math.random() * UNHINGED_MESSAGES.length)]
      const newMessage: ChatMessage = {
        id: `auto-${Date.now()}`,
        username: randomMsg.username,
        message: randomMsg.message,
        badges: Math.random() > 0.7 ? ['sub'] : [],
        color: randomMsg.color,
      }
      setMessages((prev) => [...prev.slice(-50), newMessage])
    }, 2000 + Math.random() * 3000)
    return () => clearInterval(interval)
  }, [])

  const handleSend = () => {
    if (!chatInput.trim()) return
    setMessages((prev) => [...prev, { id: `user-${Date.now()}`, username: 'You', message: chatInput, badges: ['sub'], color: theme.primary }])
    setChatInput('')
  }

  return (
    <aside className="w-80 shrink-0 flex flex-col" style={{ background: theme.surface, borderLeft: `1px solid ${theme.border}` }}>
      <div className="px-3 py-2 flex items-center justify-between" style={{ borderBottom: `1px solid ${theme.border}` }}>
        <span className="font-semibold text-sm">Stream Chat</span>
      </div>
      <div ref={chatRef} className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.map((msg) => (
          <div key={msg.id} className="text-sm">
            {msg.badges.map((badge) => (
              <span key={badge} className="inline-block w-4 h-4 rounded mr-1 text-xs text-center" style={{ background: badge === 'broadcaster' ? '#E91916' : badge === 'mod' ? '#00AD03' : theme.primary }} title={badge}>
                {badge === 'broadcaster' ? '📺' : badge === 'mod' ? '⚔️' : badge === 'vip' ? '💎' : '🌽'}
              </span>
            ))}
            <span className="font-bold" style={{ color: msg.color }}>{msg.username}</span>
            <span style={{ color: theme.textMuted }}>: </span>
            <span>{msg.message}</span>
          </div>
        ))}
      </div>
      <div className="p-3" style={{ borderTop: `1px solid ${theme.border}` }}>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Send a message"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 px-3 py-2 rounded text-sm"
            style={{ background: theme.surfaceAlt, border: `1px solid ${theme.border}`, color: theme.text }}
          />
          <button onClick={handleSend} className="px-4 py-2 rounded font-medium text-sm" style={{ background: theme.primary, color: 'white' }}>Chat</button>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs" style={{ color: theme.textMuted }}>Emotes:</span>
          {['KEKW', 'CornPog', 'TrustFall', 'FloorThirteen'].map((emote) => (
            <button key={emote} onClick={() => setChatInput((p) => p + ' ' + emote)} className="text-xs px-1.5 py-0.5 rounded" style={{ background: theme.surfaceAlt }}>{emote}</button>
          ))}
        </div>
      </div>
    </aside>
  )
}

// ============================================================================
// Subscription Modal Component
// ============================================================================

function SubscriptionModal({ stream, onClose }: { stream: Stream; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.8)' }} onClick={onClose}>
      <div className="w-full max-w-lg rounded-lg p-6" style={{ background: theme.surface }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Subscribe to {stream.displayName}</h2>
          <button onClick={onClose} className="text-2xl hover:opacity-80">x</button>
        </div>
        <p className="text-sm mb-6" style={{ color: theme.textMuted }}>Support {stream.displayName} and get exclusive corn-based perks!</p>
        <div className="space-y-4">
          {SUB_TIERS.map((tier) => (
            <div key={tier.name} className="rounded-lg p-4 cursor-pointer hover:opacity-90" style={{ background: theme.surfaceAlt, border: `1px solid ${theme.border}` }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{tier.emoji}</span>
                  <span className="font-bold">{tier.name}</span>
                </div>
                <span className="font-bold" style={{ color: theme.primary }}>{tier.price}/month</span>
              </div>
              <ul className="text-sm space-y-1" style={{ color: theme.textMuted }}>
                {tier.benefits.map((benefit) => <li key={benefit}>- {benefit}</li>)}
              </ul>
            </div>
          ))}
        </div>
        <button onClick={onClose} className="w-full mt-6 py-3 rounded font-bold" style={{ background: theme.primary, color: 'white' }}>Continue</button>
      </div>
    </div>
  )
}

export default StalkSite
