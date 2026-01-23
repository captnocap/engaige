/**
 * PopupHell Site
 *
 * The most obnoxious late-90s/early-2000s popup trap site.
 * Features cascading popups, fake virus warnings, "YOU ARE THE 1000000th VISITOR!",
 * marquees, blinking text, cursor trails (simulated), and everything terrible.
 *
 * NOTE: The popups are simulated within the site container, not actual browser popups.
 */

import { useState, useEffect, useCallback } from 'react'
import type { SiteProps } from '../BrowserSiteContainer.js'
import { FILLER_SITES } from '../../../config/filler-sites.js'
import { Button } from '../../ui/shared/index.js'
import { StyledCard } from '../../ui/shared/index.js'

const site = FILLER_SITES.popuphell

// ============================================================================
// Types
// ============================================================================

interface FakePopup {
  id: string
  type: 'virus' | 'winner' | 'survey' | 'ad' | 'warning' | 'congratulations' | 'download' | 'toolbar'
  x: number
  y: number
  width: number
  height: number
  title: string
  content: React.ReactNode
  zIndex: number
  shake?: boolean
}

// ============================================================================
// Popup Templates
// ============================================================================

const POPUP_TEMPLATES = {
  virus: [
    {
      title: '⚠️ VIRUS DETECTED!!!',
      content: (
        <div className="text-center p-2" style={{ fontFamily: 'Arial, sans-serif' }}>
          <div className="text-red-600 font-bold text-lg animate-pulse mb-2">
            🦠 YOUR COMPUTER HAS 847 VIRUSES!!! 🦠
          </div>
          <div className="text-sm mb-2">
            We detected TROJAN.WIN32.GENERIC.BADSTUFF on your system!
          </div>
          <div className="text-xs text-red-500 mb-3">
            YOUR HARD DRIVE WILL BE FORMATTED IN 00:59 SECONDS
          </div>
          <div className="flex gap-2 justify-center">
            <Button
              backgroundColor="#ef4444"
              textColor="#ffffff"
              size="xs"
              onClick={() => {}}
            >
              SCAN NOW!!! (FREE)
            </Button>
            <Button
              backgroundColor="#d1d5db"
              textColor="#9ca3af"
              size="xs"
              disabled
            >
              Ignore (NOT RECOMMENDED)
            </Button>
          </div>
        </div>
      ),
    },
    {
      title: '🔒 Windows Security Center',
      content: (
        <div className="p-2 bg-yellow-50" style={{ fontFamily: 'Tahoma, sans-serif' }}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-4xl">🛡️</span>
            <div>
              <div className="font-bold text-red-600">CRITICAL SYSTEM WARNING</div>
              <div className="text-xs">Your firewall has been DISABLED by hackers!</div>
            </div>
          </div>
          <div className="text-xs bg-red-100 p-2 rounded mb-2">
            ⚠️ 23 unauthorized programs detected trying to access your webcam
          </div>
          <div className="flex gap-2 justify-center">
            <Button backgroundColor="#3b82f6" textColor="#ffffff" size="xs" onClick={() => {}}>
              Fix Now
            </Button>
            <Button backgroundColor="#3b82f6" textColor="#ffffff" size="xs" onClick={() => {}}>
              Fix Later (RISKY)
            </Button>
          </div>
        </div>
      ),
    },
  ],
  winner: [
    {
      title: '🎉 CONGRATULATIONS!!! 🎉',
      content: (
        <div className="text-center p-2" style={{ background: 'linear-gradient(45deg, #ff6b6b, #ffd93d, #6bcb77, #4d96ff, #ff6b6b)', backgroundSize: '400% 400%' }}>
          <div className="bg-white/90 p-3 rounded">
            <div className="text-2xl font-bold text-green-600 animate-bounce">YOU WON!!!</div>
            <div className="text-sm my-2">You are the <span className="text-red-500 font-bold">1,000,000th</span> visitor!</div>
            <div className="text-lg font-bold text-purple-600 my-2">🏆 WIN A FREE iPHONE 47 PRO MAX ULTRA!!! 🏆</div>
            <div className="text-xs mb-2">Click below to claim your prize before it expires!</div>
            <Button
              backgroundColor="#22c55e"
              textColor="#ffffff"
              size="sm"
              onClick={() => {}}
              className="animate-pulse"
            >
              👉 CLAIM NOW!!! 👈
            </Button>
            <div className="text-xs mt-2 text-gray-500">
              *Offer expires in 0:47 seconds
            </div>
          </div>
        </div>
      ),
    },
    {
      title: '💰 FREE MONEY!!!',
      content: (
        <div className="p-3 bg-gradient-to-r from-yellow-200 to-yellow-400 text-center">
          <div className="text-xl font-bold">💵💵💵 $50,000 CASH GIVEAWAY 💵💵💵</div>
          <div className="my-2 text-sm">Your email was randomly selected!</div>
          <div className="text-xs bg-white p-2 rounded my-2">
            Recipient: {'{'}YOUR_EMAIL{'}'}<br/>
            Amount: $50,000.00 USD
          </div>
          <Button backgroundColor="#16a34a" textColor="#ffffff" size="sm" onClick={() => {}}>
            ACCEPT PAYMENT
          </Button>
        </div>
      ),
    },
  ],
  survey: [
    {
      title: 'Quick Survey - Win $1000 Amazon Gift Card!',
      content: (
        <div className="p-3 bg-white">
          <div className="text-sm font-bold mb-2">Answer 1 simple question:</div>
          <div className="text-sm mb-3">Do you like FREE STUFF?</div>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 text-sm">
              <input type="radio" name="survey" /> Yes, I love free stuff!
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="radio" name="survey" /> YES!!!
            </label>
          </div>
          <Button
            backgroundColor="#f97316"
            textColor="#ffffff"
            size="sm"
            width="full"
            onClick={() => {}}
            className="mt-3"
          >
            SUBMIT & WIN!!!
          </Button>
        </div>
      ),
    },
  ],
  ad: [
    {
      title: '🔥 HOT SINGLES IN YOUR AREA 🔥',
      content: (
        <div className="p-2 bg-pink-100 text-center">
          <div className="text-4xl mb-2">👩‍🦰👱‍♀️👩</div>
          <div className="font-bold text-pink-600 mb-2">
            37 SINGLES NEAR {'{'}YOUR_CITY{'}'} WANT TO MEET YOU!
          </div>
          <div className="text-xs mb-2">They're online RIGHT NOW and waiting!</div>
          <Button backgroundColor="#ec4899" textColor="#ffffff" size="sm" onClick={() => {}}>
            SEE PHOTOS (18+)
          </Button>
        </div>
      ),
    },
    {
      title: 'MAKE $$$ FROM HOME!!!',
      content: (
        <div className="p-2 bg-green-50 text-center">
          <div className="text-xl font-bold text-green-700">🤑 WORK FROM HOME 🤑</div>
          <div className="text-sm my-2">Local mom makes $8,472/week with this ONE WEIRD TRICK!</div>
          <div className="text-xs bg-white p-2 rounded mb-2">
            "I just made $500 in my pajamas!" - Karen, 34
          </div>
          <Button backgroundColor="#16a34a" textColor="#ffffff" size="sm" onClick={() => {}}>
            LEARN THE SECRET
          </Button>
        </div>
      ),
    },
  ],
  warning: [
    {
      title: '⚠️ Browser Out of Date',
      content: (
        <div className="p-3 bg-yellow-100">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-3xl">⚠️</span>
            <div className="font-bold text-yellow-800">Your browser is DANGEROUSLY outdated!</div>
          </div>
          <div className="text-sm mb-2">You are using Internet Explorer -3.0</div>
          <div className="text-xs mb-3">Update NOW to avoid hackers stealing your identity!</div>
          <Button
            backgroundColor="#eab308"
            textColor="#000000"
            size="sm"
            width="full"
            onClick={() => {}}
          >
            UPDATE BROWSER (URGENT)
          </Button>
        </div>
      ),
    },
  ],
  download: [
    {
      title: 'Download Complete!',
      content: (
        <div className="p-3 bg-gray-100">
          <div className="text-sm mb-2">✅ Your download is ready:</div>
          <div className="bg-white p-2 rounded text-xs font-mono mb-2">
            totally_not_malware.exe (4.2 MB)
          </div>
          <div className="text-xs text-gray-600 mb-2">
            This file contains: FREE_MOVIES_2024_KEYGEN_WORKING.zip
          </div>
          <div className="flex gap-2">
            <Button
              backgroundColor="#3b82f6"
              textColor="#ffffff"
              size="sm"
              width="full"
              onClick={() => {}}
            >
              Run
            </Button>
            <Button
              backgroundColor="#d1d5db"
              textColor="#374151"
              size="sm"
              width="full"
              onClick={() => {}}
            >
              Save
            </Button>
          </div>
        </div>
      ),
    },
  ],
  toolbar: [
    {
      title: 'Install FREE Toolbar!',
      content: (
        <div className="p-3 bg-purple-100">
          <div className="text-center mb-2">
            <span className="text-3xl">🔧</span>
          </div>
          <div className="font-bold text-center text-purple-700 mb-2">
            BONZI BUDDY TOOLBAR 2024
          </div>
          <div className="text-xs mb-2">Features:</div>
          <ul className="text-xs list-disc list-inside mb-3">
            <li>Weather in taskbar!</li>
            <li>FREE emoticons!!!!</li>
            <li>Search powered by Ask Jeeves</li>
            <li>Cool cursor effects!</li>
          </ul>
          <Button
            backgroundColor="#9333ea"
            textColor="#ffffff"
            size="sm"
            width="full"
            onClick={() => {}}
          >
            INSTALL NOW (IT'S FREE!)
          </Button>
          <div className="text-xs text-center mt-1 text-gray-500">
            By clicking, you agree to change your homepage
          </div>
        </div>
      ),
    },
  ],
  congratulations: [
    {
      title: '🎊 SPECIAL OFFER 🎊',
      content: (
        <div className="p-2 text-center" style={{ background: 'repeating-linear-gradient(45deg, #ff0, #ff0 10px, #000 10px, #000 20px)' }}>
          <div className="bg-white p-3 rounded">
            <div className="font-bold text-red-600 text-lg">🎁 YOU HAVE BEEN SELECTED! 🎁</div>
            <div className="text-sm my-2">
              Complete this offer to receive your FREE PlayStation 9!
            </div>
            <div className="text-xs">
              Just complete 47 sponsor offers and it's yours!
            </div>
            <Button
              backgroundColor="#ef4444"
              textColor="#ffffff"
              size="sm"
              onClick={() => {}}
              className="mt-2 animate-pulse"
            >
              START NOW!!!
            </Button>
          </div>
        </div>
      ),
    },
  ],
}

// ============================================================================
// Cursor Trail Component (Simulated)
// ============================================================================

interface TrailDot {
  id: number
  x: number
  y: number
  opacity: number
}

function CursorTrail() {
  const [trails, setTrails] = useState<TrailDot[]>([])
  const [counter, setCounter] = useState(0)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const container = target.closest('[data-popup-hell-container]')
      if (!container) return

      const rect = container.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      setCounter(c => c + 1)
      setTrails(prev => [
        ...prev.slice(-15),
        { id: counter, x, y, opacity: 1 }
      ])
    }

    document.addEventListener('mousemove', handleMouseMove)
    return () => document.removeEventListener('mousemove', handleMouseMove)
  }, [counter])

  useEffect(() => {
    const interval = setInterval(() => {
      setTrails(prev =>
        prev
          .map(t => ({ ...t, opacity: t.opacity - 0.1 }))
          .filter(t => t.opacity > 0)
      )
    }, 50)
    return () => clearInterval(interval)
  }, [])

  return (
    <>
      {trails.map(trail => (
        <div
          key={trail.id}
          className="pointer-events-none absolute text-xl"
          style={{
            left: trail.x,
            top: trail.y,
            opacity: trail.opacity,
            transform: 'translate(-50%, -50%)',
            transition: 'opacity 0.05s',
          }}
        >
          ✨
        </div>
      ))}
    </>
  )
}

// ============================================================================
// Fake Popup Component
// ============================================================================

interface PopupWindowProps {
  popup: FakePopup
  onClose: (id: string) => void
  onSpawnMore: () => void
}

function PopupWindow({ popup, onClose, onSpawnMore }: PopupWindowProps) {
  const handleClose = () => {
    // 50% chance to spawn more popups when closing
    if (Math.random() > 0.5) {
      onSpawnMore()
    }
    onClose(popup.id)
  }

  return (
    <div
      className={`absolute bg-gray-200 border-2 border-gray-400 shadow-lg ${popup.shake ? 'animate-shake' : ''}`}
      style={{
        left: popup.x,
        top: popup.y,
        width: popup.width,
        height: popup.height,
        zIndex: popup.zIndex,
        fontFamily: 'Tahoma, Arial, sans-serif',
      }}
    >
      {/* Title bar */}
      <div className="flex items-center justify-between px-2 py-1 bg-gradient-to-r from-blue-800 to-blue-600 text-white text-xs">
        <span className="truncate font-bold">{popup.title}</span>
        <div className="flex gap-0.5">
          <Button
            size="xs"
            backgroundColor="#d1d5db"
            textColor="#000000"
            borderRadius={0}
            onClick={() => {}}
            width="4"
            ariaLabel="Minimize"
          >
            _
          </Button>
          <Button
            size="xs"
            backgroundColor="#ef4444"
            textColor="#ffffff"
            borderRadius={0}
            onClick={handleClose}
            width="4"
            ariaLabel="Close"
          >
            X
          </Button>
        </div>
      </div>
      {/* Content */}
      <div className="overflow-auto" style={{ height: popup.height - 24 }}>
        {popup.content}
      </div>
    </div>
  )
}

// ============================================================================
// Main Site Component
// ============================================================================

export function PopupHellSite({ siteId }: SiteProps) {
  const [popups, setPopups] = useState<FakePopup[]>([])
  const [popupCounter, setPopupCounter] = useState(0)
  const [showUnderConstruction, setShowUnderConstruction] = useState(false)
  const [visitorCount] = useState(() => Math.floor(Math.random() * 900000) + 100000)
  const [blinkState, setBlinkState] = useState(true)

  // Blinking text effect
  useEffect(() => {
    const interval = setInterval(() => {
      setBlinkState(prev => !prev)
    }, 500)
    return () => clearInterval(interval)
  }, [])

  const spawnPopup = useCallback((forceType?: FakePopup['type']) => {
    const types: FakePopup['type'][] = ['virus', 'winner', 'survey', 'ad', 'warning', 'download', 'toolbar', 'congratulations']
    const type = forceType || types[Math.floor(Math.random() * types.length)]
    const templates = POPUP_TEMPLATES[type]
    const template = templates[Math.floor(Math.random() * templates.length)]

    const newPopup: FakePopup = {
      id: `popup-${popupCounter}`,
      type,
      x: Math.random() * 300 + 50,
      y: Math.random() * 200 + 50,
      width: type === 'virus' || type === 'winner' ? 350 : 280,
      height: type === 'virus' || type === 'winner' ? 250 : 220,
      title: template.title,
      content: template.content,
      zIndex: 100 + popupCounter,
      shake: type === 'virus' || type === 'warning',
    }

    setPopups(prev => [...prev, newPopup])
    setPopupCounter(prev => prev + 1)
  }, [popupCounter])

  // Initial popup storm
  useEffect(() => {
    const timeout1 = setTimeout(() => spawnPopup('winner'), 500)
    const timeout2 = setTimeout(() => spawnPopup('virus'), 1500)
    const timeout3 = setTimeout(() => spawnPopup('ad'), 2500)

    return () => {
      clearTimeout(timeout1)
      clearTimeout(timeout2)
      clearTimeout(timeout3)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Random popup spawner
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7 && popups.length < 10) {
        spawnPopup()
      }
    }, 5000)
    return () => clearInterval(interval)
  }, [popups.length, spawnPopup])

  const closePopup = (id: string) => {
    setPopups(prev => prev.filter(p => p.id !== id))
  }

  const spawnMultiple = () => {
    const count = Math.floor(Math.random() * 3) + 1
    for (let i = 0; i < count; i++) {
      setTimeout(() => spawnPopup(), i * 200)
    }
  }

  return (
    <div
      className="min-h-full relative overflow-hidden"
      data-popup-hell-container
      style={{
        background: 'linear-gradient(135deg, #ff00ff 0%, #00ffff 50%, #ffff00 100%)',
        fontFamily: 'Comic Sans MS, Papyrus, cursive',
      }}
    >
      <CursorTrail />

      {/* Popups */}
      {popups.map(popup => (
        <PopupWindow
          key={popup.id}
          popup={popup}
          onClose={closePopup}
          onSpawnMore={spawnMultiple}
        />
      ))}

      {/* Main Content */}
      <div className="relative z-0 p-4">
        {/* Header */}
        <div className="text-center mb-4">
          <h1
            className="text-4xl font-bold mb-2"
            style={{
              background: 'linear-gradient(to right, red, orange, yellow, green, blue, indigo, violet)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
            }}
          >
            ~*~WELCOME TO MY AWESOME PAGE~*~
          </h1>

          {/* Marquee simulation */}
          <div className="bg-black text-yellow-400 py-1 overflow-hidden whitespace-nowrap">
            <div className="animate-marquee inline-block">
              ★彡 WELCOME TO THE BEST SITE ON THE INTERNET!!! ★彡 You are visitor #{visitorCount.toLocaleString()}!!! ★彡 Sign my guestbook!!! ★彡 This site is best viewed with Internet Explorer 4.0 at 800x600 ★彡 UNDER CONSTRUCTION ★彡 Last updated: Never ★彡
            </div>
          </div>
        </div>

        {/* Visitor Counter */}
        <div className="text-center mb-4">
          <div className="inline-block bg-black text-green-400 px-4 py-2 font-mono border-4 border-gray-600">
            <span className="text-xs">VISITOR COUNT:</span>
            <br />
            <span className="text-2xl">{visitorCount.toLocaleString()}</span>
          </div>
        </div>

        {/* Blinking Text */}
        <div className="text-center mb-4">
          <span
            className="text-2xl font-bold text-red-600"
            style={{ visibility: blinkState ? 'visible' : 'hidden' }}
          >
            🔥 HOT!!! NEW!!! CLICK HERE!!! 🔥
          </span>
        </div>

        {/* Animated GIF placeholders (emoji substitutes) */}
        <div className="flex justify-center gap-4 mb-4">
          <span className="text-4xl animate-bounce">👷</span>
          <span className="text-4xl animate-spin">🚧</span>
          <span className="text-4xl animate-bounce">👷</span>
          <span className="text-4xl animate-spin">🚧</span>
          <span className="text-4xl animate-bounce">👷</span>
        </div>

        {/* Under Construction Banner */}
        <div
          className="bg-yellow-300 border-4 border-dashed border-black p-4 mb-4 cursor-pointer"
          onClick={() => setShowUnderConstruction(!showUnderConstruction)}
        >
          <div className="text-center">
            <span className="text-6xl">🚧</span>
            <h2 className="text-xl font-bold">UNDER CONSTRUCTION</h2>
            <p className="text-sm">This page is still being built! Check back soon!</p>
            <p className="text-xs">(Click for a surprise!)</p>
          </div>
        </div>

        {showUnderConstruction && (
          <div className="bg-lime-300 p-4 mb-4 border-4 border-lime-600">
            <h3 className="font-bold text-center mb-2">🎵 COMING SOON 🎵</h3>
            <ul className="text-sm list-disc list-inside">
              <li>Auto-playing MIDI music!!!!</li>
              <li>My Geocities guestbook</li>
              <li>Dancing baby GIF collection</li>
              <li>Web ring links</li>
              <li>Cool Java applets</li>
              <li>My AIM buddy list</li>
            </ul>
          </div>
        )}

        {/* Fake Links That Spawn Popups */}
        <div className="bg-white/80 p-4 rounded mb-4">
          <h2 className="text-xl font-bold text-center mb-2 text-purple-600">
            ✨ COOL LINKS ✨
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {[
              { text: '💰 FREE MONEY CLICK HERE', type: 'winner' as const },
              { text: '🔥 HOT SINGLES IN YOUR AREA', type: 'ad' as const },
              { text: '🛡️ SCAN YOUR PC FOR VIRUSES', type: 'virus' as const },
              { text: '📋 COMPLETE SURVEY WIN $1000', type: 'survey' as const },
              { text: '⬇️ DOWNLOAD FREE MOVIES', type: 'download' as const },
              { text: '🔧 INSTALL COOL TOOLBAR', type: 'toolbar' as const },
            ].map((link, i) => (
              <Button
                key={i}
                onClick={() => spawnPopup(link.type)}
                variant="link"
                size="sm"
                textColor="#2563eb"
                className="text-left"
                style={{ fontFamily: 'Times New Roman, serif' }}
              >
                {link.text}
              </Button>
            ))}
          </div>
        </div>

        {/* Guestbook */}
        <div className="bg-white/80 p-4 rounded mb-4">
          <h2 className="text-xl font-bold text-center mb-2 text-green-600">
            📝 SIGN MY GUESTBOOK 📝
          </h2>
          <div className="space-y-2 text-sm">
            <div className="bg-pink-100 p-2 rounded">
              <strong>~*xXxDarkAngelxXx*~</strong> (03/15/2003): <br/>
              "CoOl SiTe!!1! ChEcK oUt MiNe!!! www.angelfire.com/darkangel666"
            </div>
            <div className="bg-blue-100 p-2 rounded">
              <strong>skaterboi2002</strong> (02/28/2003): <br/>
              "FIRST!!!!!! lol nice page dude add me on aim: sk8rboy2002cool"
            </div>
            <div className="bg-green-100 p-2 rounded">
              <strong>~*PrInCeSs*~</strong> (02/14/2003): <br/>
              "hiii luv ur page!! the music is sooo cool!! ♥♥♥"
            </div>
          </div>
        </div>

        {/* Web Ring */}
        <div className="bg-gray-200 p-2 rounded text-center text-sm mb-4">
          <span className="font-bold">[ This site is part of the</span>
          <span className="text-blue-600 underline mx-1">AWESOME SITES WEB RING</span>
          <span className="font-bold">]</span>
          <div className="mt-1 flex justify-center gap-2">
            <Button variant="link" size="xs" textColor="#2563eb" onClick={() => {}}>
              ← Previous
            </Button>
            <Button variant="link" size="xs" textColor="#2563eb" onClick={() => {}}>
              Random
            </Button>
            <Button variant="link" size="xs" textColor="#2563eb" onClick={() => {}}>
              Next →
            </Button>
          </div>
        </div>

        {/* Best Viewed With */}
        <div className="text-center text-xs mb-4">
          <p>Best viewed with</p>
          <div className="flex justify-center items-center gap-2 my-1">
            <span className="text-2xl">🌐</span>
            <span>Internet Explorer 4.0</span>
          </div>
          <p>Resolution: 800x600</p>
          <p className="mt-2">Made with 💖 in Notepad</p>
        </div>

        {/* Copyright */}
        <div className="text-center text-xs text-gray-600">
          <p>© 1999-2003 {site?.name || 'PopupHell'}. All rights reserved.</p>
          <p>No rights reserved actually. Please don't sue me.</p>
        </div>
      </div>

      {/* Styles */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          animation: marquee 15s linear infinite;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.3s infinite;
        }
      `}</style>
    </div>
  )
}

export default PopupHellSite
