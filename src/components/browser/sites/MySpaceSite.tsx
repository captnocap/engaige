/**
 * MySpace Site
 *
 * The OG social network - early 2000s aesthetic.
 * Includes feed, profiles, and messaging.
 */

import { useState } from 'react'
import type { SiteProps } from '../BrowserSiteContainer.js'

type MySpaceView = 'home' | 'profile' | 'messages' | 'browse'

export function MySpaceSite({ siteId, onNavigate }: SiteProps) {
  const [currentView, setCurrentView] = useState<MySpaceView>(
    siteId === 'myspace-chat' ? 'messages' : 'home'
  )
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null)

  return (
    <div className="min-h-full" style={{ background: '#336699' }}>
      {/* MySpace Header */}
      <header
        className="px-4 py-2"
        style={{
          background: 'linear-gradient(180deg, #003366 0%, #336699 100%)',
          borderBottom: '2px solid #FF6600',
        }}
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-white" style={{ fontFamily: 'Impact, sans-serif' }}>
              My<span style={{ color: '#FF6600' }}>Space</span>
            </span>
            <span className="text-xs text-white/60">a place for friends</span>
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-4">
            {(['home', 'browse', 'messages'] as MySpaceView[]).map((view) => (
              <button
                key={view}
                onClick={() => setCurrentView(view)}
                className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                  currentView === view
                    ? 'bg-[#FF6600] text-white'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                {view.charAt(0).toUpperCase() + view.slice(1)}
              </button>
            ))}
          </nav>

          {/* User */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-white/80">Hello, Player!</span>
            <div className="w-8 h-8 rounded bg-white/20 flex items-center justify-center text-white text-sm">
              P
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto py-4 px-4">
        {currentView === 'home' && <MySpaceHome onViewProfile={setSelectedProfile} />}
        {currentView === 'browse' && <MySpaceBrowse onViewProfile={setSelectedProfile} />}
        {currentView === 'messages' && <MySpaceMessages />}
        {currentView === 'profile' && selectedProfile && (
          <MySpaceProfile npcId={selectedProfile} onBack={() => setCurrentView('home')} />
        )}
      </main>
    </div>
  )
}

function MySpaceHome({ onViewProfile }: { onViewProfile: (id: string) => void }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {/* Left Column - User Info */}
      <div className="space-y-4">
        <div
          className="p-4 rounded"
          style={{ background: 'white', border: '1px solid #ccc' }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-16 h-16 rounded bg-gray-200 flex items-center justify-center text-2xl">
              👤
            </div>
            <div>
              <h2 className="font-bold text-[#003366]">Player</h2>
              <p className="text-xs text-gray-500">"Living my best life!"</p>
            </div>
          </div>
          <div className="text-xs space-y-1 text-gray-600">
            <p><strong>Mood:</strong> 😊 happy</p>
            <p><strong>Online Now!</strong></p>
          </div>
        </div>

        {/* Top 8 */}
        <div
          className="p-4 rounded"
          style={{ background: 'white', border: '1px solid #ccc' }}
        >
          <h3 className="font-bold text-[#003366] mb-2 text-sm">
            Player's Top 8
          </h3>
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="aspect-square rounded bg-gray-100 flex items-center justify-center text-gray-400 text-xs cursor-pointer hover:bg-gray-200"
                onClick={() => onViewProfile(`npc_${i}`)}
              >
                +
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Center Column - Feed */}
      <div className="col-span-2 space-y-4">
        <div
          className="p-4 rounded"
          style={{ background: 'white', border: '1px solid #ccc' }}
        >
          <h3 className="font-bold text-[#003366] mb-3 pb-2 border-b border-gray-200">
            Bulletin Board
          </h3>

          {/* Mock posts */}
          {[
            { name: 'Sarah', content: 'just got new pics up!! check my profile 📸', time: '5 mins ago' },
            { name: 'Jake', content: 'who wants to hang out this weekend??', time: '23 mins ago' },
            { name: 'Emily', content: 'new song on my profile. tell me what u think!', time: '1 hour ago' },
          ].map((post, i) => (
            <div key={i} className="py-3 border-b border-gray-100 last:border-0">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded bg-gray-200 flex items-center justify-center text-sm shrink-0">
                  {post.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-[#003366] text-sm hover:underline cursor-pointer">
                      {post.name}
                    </span>
                    <span className="text-xs text-gray-400">{post.time}</span>
                  </div>
                  <p className="text-sm text-gray-700">{post.content}</p>
                  <div className="flex gap-4 mt-2 text-xs">
                    <button className="text-[#003366] hover:underline">Comment</button>
                    <button className="text-[#003366] hover:underline">Kudos</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Post something */}
        <div
          className="p-4 rounded"
          style={{ background: 'white', border: '1px solid #ccc' }}
        >
          <h3 className="font-bold text-[#003366] mb-2 text-sm">Post a Bulletin</h3>
          <textarea
            placeholder="What's on your mind?"
            className="w-full p-2 border border-gray-300 rounded text-sm resize-none"
            rows={3}
          />
          <div className="flex justify-end mt-2">
            <button
              className="px-4 py-1 text-sm font-medium text-white rounded"
              style={{ background: '#FF6600' }}
            >
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function MySpaceBrowse({ onViewProfile }: { onViewProfile: (id: string) => void }) {
  return (
    <div
      className="p-4 rounded"
      style={{ background: 'white', border: '1px solid #ccc' }}
    >
      <h3 className="font-bold text-[#003366] mb-4">Browse People</h3>
      <p className="text-gray-500 text-sm">
        Search and browse NPCs coming soon...
      </p>
    </div>
  )
}

function MySpaceMessages() {
  return (
    <div className="grid grid-cols-3 gap-4">
      {/* Conversation list */}
      <div
        className="p-4 rounded"
        style={{ background: 'white', border: '1px solid #ccc' }}
      >
        <h3 className="font-bold text-[#003366] mb-3 pb-2 border-b border-gray-200">
          Inbox
        </h3>
        <div className="space-y-2">
          {['Sarah', 'Jake', 'Emily'].map((name, i) => (
            <button
              key={i}
              className="w-full flex items-center gap-2 p-2 rounded hover:bg-gray-100 text-left"
            >
              <div className="w-8 h-8 rounded bg-gray-200 flex items-center justify-center text-sm">
                {name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-[#003366] truncate">{name}</p>
                <p className="text-xs text-gray-500 truncate">Last message preview...</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Message thread */}
      <div
        className="col-span-2 p-4 rounded flex flex-col"
        style={{ background: 'white', border: '1px solid #ccc', minHeight: '400px' }}
      >
        <h3 className="font-bold text-[#003366] mb-3 pb-2 border-b border-gray-200">
          Conversation
        </h3>
        <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
          Select a conversation to start chatting
        </div>
      </div>
    </div>
  )
}

function MySpaceProfile({ npcId, onBack }: { npcId: string; onBack: () => void }) {
  return (
    <div
      className="p-4 rounded"
      style={{ background: 'white', border: '1px solid #ccc' }}
    >
      <button
        onClick={onBack}
        className="text-[#003366] hover:underline text-sm mb-4"
      >
        ← Back to Home
      </button>
      <h3 className="font-bold text-[#003366] mb-4">Profile: {npcId}</h3>
      <p className="text-gray-500 text-sm">
        Profile view coming soon...
      </p>
    </div>
  )
}

export default MySpaceSite
