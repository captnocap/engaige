/**
 * TrustFallTim Site
 *
 * An obsessive fan site dedicated to Trust Fall Tim, a local legend
 * whose entire thing is falling backwards and hoping someone catches him.
 * Features stats tracking, highlight reels, fan art, and way too much information.
 */

import { useState, useMemo } from 'react'
import type { SiteProps } from '../BrowserSiteContainer.js'
import { FILLER_SITES } from '../../../config/filler-sites.js'
import { useSiteContent, type SiteContentItem } from '../../../hooks/useSiteContent.js'

const site = FILLER_SITES.trustfalltim

// ============================================================================
// Types & Data
// ============================================================================

interface FallRecord {
  id: string
  date: string
  location: string
  caught: boolean
  catcher?: string
  height: string
  style: string
  notes: string
  legendary?: boolean
}

interface FanArt {
  id: string
  title: string
  artist: string
  emoji: string
  description: string
}

const CAREER_STATS = {
  totalFalls: 2847,
  catches: 2234,
  drops: 613,
  catchRate: 78.5,
  consecutiveCatches: 47,
  longestDrop: '6 feet (The Incident)',
  favoriteCatcher: 'Big Mike',
  worstCatcher: 'Small Kevin',
  averageHeight: '4.2 feet',
  totalTimeFalling: '14 hours, 23 minutes',
}


const SIGNATURE_MOVES = [
  { name: 'Classic Arms-Out', difficulty: '★', description: 'The fundamental. Arms extended, eyes closed, pure trust.' },
  { name: 'The Majestic Eagle', difficulty: '★★', description: 'Arms spread wide like wings. More surface area = more catchable.' },
  { name: 'The Pencil', difficulty: '★★★', description: 'Arms at sides. Minimal surface area. Maximum faith.' },
  { name: 'The Bus Lean', difficulty: '★★★★', description: 'Executed on public transportation. Requires timing and a seated position.' },
  { name: 'The Double Tap', difficulty: '★★★★', description: 'Two falls in quick succession to the same catcher.' },
  { name: 'The Blindfolded Trust', difficulty: '★★★★★', description: 'Self-explanatory. Only attempted twice. One catch, one concussion.' },
  { name: 'The Crowd Surf Entry', difficulty: '★★★★★', description: 'Trust fall into a crowd at a concert. Success rate: 60%.' },
]

const FAN_ART: FanArt[] = [
  { id: 'fa1', title: 'Tim Falls at Sunset', artist: 'ArtLover2003', emoji: '🌅🙆‍♂️', description: 'Digital painting of Tim\'s silhouette falling against an orange sky' },
  { id: 'fa2', title: 'The 1000th Fall', artist: 'TimsNumberOneFan', emoji: '🎉🙆‍♂️🎊', description: 'Commemorative piece for the milestone' },
  { id: 'fa3', title: 'Tim vs. Gravity', artist: 'PhysicsMemes', emoji: '🙆‍♂️⚔️🌍', description: 'Tim arm-wrestling gravity personified' },
  { id: 'fa4', title: 'Falling in Love', artist: 'RomanticTimFan', emoji: '💕🙆‍♂️💕', description: 'Controversial piece. Tim falls into a heart. The fandom is divided.' },
  { id: 'fa5', title: 'The Incident (Reimagined)', artist: 'DarkTimArt', emoji: '😰🙆‍♂️😰', description: 'We don\'t talk about The Incident. This artist did anyway.' },
]

const FAQ_ITEMS = [
  {
    q: 'Who is Trust Fall Tim?',
    a: 'Tim (last name unknown) is a local legend who has dedicated his life to the art of the trust fall. Since 2019, he has been performing trust falls on unsuspecting (but consenting) members of the public.',
  },
  {
    q: 'Why does he do this?',
    a: 'In a 2021 interview, Tim stated: "Every trust fall is a conversation about human connection. When I fall, I\'m asking: will you catch me? When they catch me, they\'re saying: I see you." Deep stuff.',
  },
  {
    q: 'Has he ever been hurt?',
    a: 'Yes. The Incident (2022) resulted in a mild concussion and three weeks of no trust falls. The fandom does not like to discuss this period.',
  },
  {
    q: 'How can I catch Tim?',
    a: 'Tim performs at random locations throughout the city. Follow his VidTube and ForChan for location hints. If you see a man yelling "TRUST FALL" in public, position yourself behind him. You are now part of the movement.',
  },
  {
    q: 'Is this a bit? Is Tim doing a bit?',
    a: 'Tim\'s commitment suggests this is not a bit. 2,847 documented falls. This is a lifestyle.',
  },
]

// ============================================================================
// DB → Local Adapter
// ============================================================================

/**
 * Maps a SiteContentItem from the database to the local FallRecord interface.
 * Fall-specific fields (caught, catcher, height, style, legendary) stored in metadata.
 */
function dbToFallRecord(item: SiteContentItem): FallRecord {
  const m = item.metadata || {}
  return {
    id: item.slug,
    date: m.date || (item.publishedAt ? new Date(item.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''),
    location: item.title,
    caught: m.caught ?? true,
    catcher: m.catcher,
    height: m.height || '',
    style: m.style || '',
    notes: item.body || m.notes || '',
    legendary: m.legendary ?? item.isFeatured,
  }
}

// ============================================================================
// Components
// ============================================================================

function StatCard({ label, value, highlight }: { label: string; value: string | number; highlight?: boolean }) {
  return (
    <div className={`rounded-lg p-4 text-center ${highlight ? 'bg-orange-500 text-white' : 'bg-white border border-orange-200'}`}>
      <div className={`text-2xl font-bold ${highlight ? '' : 'text-orange-600'}`}>{value}</div>
      <div className={`text-xs ${highlight ? 'text-orange-100' : 'text-gray-500'}`}>{label}</div>
    </div>
  )
}

function FallRecordCard({ fall }: { fall: FallRecord }) {
  return (
    <div className={`bg-white rounded-lg p-4 border ${fall.legendary ? 'border-yellow-400 shadow-lg' : 'border-orange-100'}`}>
      {fall.legendary && (
        <div className="text-xs bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded inline-block mb-2">
          ⭐ LEGENDARY FALL
        </div>
      )}
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs text-gray-400 font-mono">{fall.id}</span>
        <span className={`text-xs px-2 py-0.5 rounded ${fall.caught ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {fall.caught ? '✓ CAUGHT' : '✗ DROPPED'}
        </span>
      </div>
      <h3 className="font-bold text-orange-800">{fall.location}</h3>
      <p className="text-sm text-gray-600">{fall.date}</p>
      <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-500">
        <div>Height: {fall.height}</div>
        <div>Style: {fall.style}</div>
        {fall.catcher && <div className="col-span-2">Catcher: {fall.catcher}</div>}
      </div>
      <p className="mt-2 text-sm text-gray-700 italic">"{fall.notes}"</p>
    </div>
  )
}

// ============================================================================
// Main Site
// ============================================================================

export function TrustFallTimSite({ siteId }: SiteProps) {
  const { content: dbContent } = useSiteContent('trustfalltim')

  const recentFalls = useMemo(() => dbContent.map(dbToFallRecord), [dbContent])

  const [activeTab, setActiveTab] = useState<'home' | 'stats' | 'gallery' | 'faq'>('home')

  return (
    <div className="min-h-full" style={{ background: 'linear-gradient(135deg, #FFF5EB 0%, #FFE5D0 100%)' }}>
      {/* Hero Header */}
      <header className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-8 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {[...Array(20)].map((_, i) => (
            <span key={i} className="absolute text-4xl" style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              transform: `rotate(${Math.random() * 360}deg)`,
            }}>
              🙆‍♂️
            </span>
          ))}
        </div>
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <div className="text-6xl mb-2 animate-bounce">🙆‍♂️</div>
          <h1 className="text-4xl font-bold mb-2">{site?.name || 'TrustFallTim.corn'}</h1>
          <p className="text-orange-100 italic">
            "The Official Unofficial Fan Archive of the Man Who Falls"
          </p>
          <div className="mt-4 flex justify-center gap-4 text-sm">
            <span>📊 {CAREER_STATS.totalFalls} Falls Documented</span>
            <span>|</span>
            <span>✅ {CAREER_STATS.catchRate}% Catch Rate</span>
            <span>|</span>
            <span>🏆 47 Consecutive Catches</span>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-orange-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex">
          {(['home', 'stats', 'gallery', 'faq'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-sm font-medium uppercase tracking-wider ${
                activeTab === tab
                  ? 'text-orange-600 border-b-2 border-orange-600'
                  : 'text-gray-500 hover:text-orange-500'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {activeTab === 'home' && (
          <>
            {/* Live Stats Banner */}
            <div className="bg-orange-600 text-white rounded-lg p-4 mb-6 flex items-center justify-between">
              <div>
                <span className="text-xs uppercase opacity-75">Current Streak</span>
                <div className="text-3xl font-bold">{CAREER_STATS.consecutiveCatches} Catches</div>
              </div>
              <div className="text-right">
                <span className="text-xs uppercase opacity-75">Next Fall Location</span>
                <div className="text-lg font-bold">📍 TBD (Check Socials)</div>
              </div>
            </div>

            {/* Recent Falls */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-orange-800 mb-4">📋 Recent Falls</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {recentFalls.map(fall => (
                  <FallRecordCard key={fall.id} fall={fall} />
                ))}
              </div>
            </section>

            {/* Signature Moves */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-orange-800 mb-4">🎭 Signature Moves</h2>
              <div className="bg-white rounded-lg overflow-hidden border border-orange-200">
                {SIGNATURE_MOVES.map((move, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 border-b border-orange-100 last:border-0">
                    <div className="text-2xl w-12 text-center">{move.difficulty}</div>
                    <div>
                      <h3 className="font-bold text-orange-800">{move.name}</h3>
                      <p className="text-sm text-gray-600">{move.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Quote */}
            <div className="bg-orange-100 rounded-lg p-6 text-center">
              <div className="text-4xl mb-2">🙆‍♂️</div>
              <blockquote className="text-xl italic text-orange-800">
                "Trust is not given. Trust is fallen into."
              </blockquote>
              <p className="text-orange-600 mt-2">— Trust Fall Tim, 2023</p>
            </div>
          </>
        )}

        {activeTab === 'stats' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-orange-800">📊 Career Statistics</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Total Falls" value={CAREER_STATS.totalFalls} highlight />
              <StatCard label="Catches" value={CAREER_STATS.catches} />
              <StatCard label="Drops" value={CAREER_STATS.drops} />
              <StatCard label="Catch Rate" value={`${CAREER_STATS.catchRate}%`} highlight />
            </div>

            <div className="bg-white rounded-lg p-6 border border-orange-200">
              <h3 className="font-bold text-orange-800 mb-4">Detailed Breakdown</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between py-2 border-b border-orange-100">
                  <span className="text-gray-600">Consecutive Catches (Record)</span>
                  <span className="font-bold text-orange-600">{CAREER_STATS.consecutiveCatches}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-orange-100">
                  <span className="text-gray-600">Longest Drop</span>
                  <span className="font-bold text-red-600">{CAREER_STATS.longestDrop}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-orange-100">
                  <span className="text-gray-600">Favorite Catcher</span>
                  <span className="font-bold">{CAREER_STATS.favoriteCatcher}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-orange-100">
                  <span className="text-gray-600">Worst Catcher</span>
                  <span className="font-bold text-red-600">{CAREER_STATS.worstCatcher}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-orange-100">
                  <span className="text-gray-600">Average Height</span>
                  <span className="font-bold">{CAREER_STATS.averageHeight}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-orange-100">
                  <span className="text-gray-600">Total Time Falling</span>
                  <span className="font-bold">{CAREER_STATS.totalTimeFalling}</span>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4">
              <h3 className="font-bold text-yellow-800 mb-2">🏆 OddsOracle Markets</h3>
              <p className="text-sm text-yellow-700">
                Current prediction markets on OddsOracle:
              </p>
              <ul className="text-sm text-yellow-800 mt-2">
                <li>• "Tim reaches 3000 falls by 2026" - 67% YES</li>
                <li>• "Tim catch rate stays above 75%" - 82% YES</li>
                <li>• "Another Incident in 2026" - 23% YES</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'gallery' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-orange-800">🎨 Fan Art Gallery</h2>
            <p className="text-gray-600 text-sm">
              The Tim fandom creates beautiful works. Here are some highlights.
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              {FAN_ART.map(art => (
                <div key={art.id} className="bg-white rounded-lg p-4 border border-orange-200">
                  <div className="text-6xl text-center py-8 bg-orange-50 rounded mb-4">
                    {art.emoji}
                  </div>
                  <h3 className="font-bold text-orange-800">{art.title}</h3>
                  <p className="text-xs text-gray-500">by {art.artist}</p>
                  <p className="text-sm text-gray-600 mt-2">{art.description}</p>
                </div>
              ))}
            </div>

            <div className="bg-orange-100 rounded-lg p-4 text-center">
              <h3 className="font-bold text-orange-800 mb-2">Submit Your Art!</h3>
              <p className="text-sm text-orange-700">
                Email submissions to trustfalltim.fanart@email.corn
              </p>
              <p className="text-xs text-orange-600 mt-1">
                (Tim personally reviews every submission. He cries sometimes. Happy tears.)
              </p>
            </div>
          </div>
        )}

        {activeTab === 'faq' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-orange-800">❓ Frequently Asked Questions</h2>

            <div className="space-y-4">
              {FAQ_ITEMS.map((item, i) => (
                <div key={i} className="bg-white rounded-lg p-4 border border-orange-200">
                  <h3 className="font-bold text-orange-800 mb-2">Q: {item.q}</h3>
                  <p className="text-gray-600 text-sm">A: {item.a}</p>
                </div>
              ))}
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-bold text-red-800 mb-2">⚠️ About "The Incident"</h3>
              <p className="text-sm text-red-700">
                On March 15, 2022, Tim attempted a trust fall at a crowded mall food court.
                Due to a miscommunication (and Small Kevin), Tim fell 6 feet with no catch.
                He suffered a mild concussion and three weeks of recovery.
              </p>
              <p className="text-sm text-red-600 mt-2 italic">
                We don't blame Small Kevin. We simply remember.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-orange-600 text-white py-6 px-4 mt-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-4xl mb-2">🙆‍♂️</div>
          <p className="font-bold">TrustFallTim.corn</p>
          <p className="text-orange-200 text-sm mt-1">
            "The #1 Source for Trust Fall Tim News, Stats, and Community"
          </p>
          <div className="mt-4 flex justify-center gap-4 text-sm text-orange-200">
            <span>VidTube: @TrustFallTim</span>
            <span>|</span>
            <span>Threadit: r/TrustFallTim</span>
            <span>|</span>
            <span>ForChan: /tim/</span>
          </div>
          <p className="text-xs text-orange-300 mt-4">
            This is a fan site. We are not Tim. We just believe in him.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default TrustFallTimSite
