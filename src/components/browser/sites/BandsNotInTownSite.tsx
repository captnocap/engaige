/**
 * BandsNotInTown Site
 *
 * A parody of Bandsintown where every band you love is playing
 * everywhere EXCEPT your city. Maximum FOMO energy.
 */

import { useState, useMemo } from 'react'
import type { SiteProps } from '../BrowserSiteContainer.js'
import { FILLER_SITES } from '../../../config/filler-sites.js'
import { StyledCard, Button } from '../../ui/shared/index.js'
import { useSiteContent, type SiteContentItem } from '../../../hooks/useSiteContent.js'

const site = FILLER_SITES.bandsnotintown

// ============================================================================
// Types
// ============================================================================

interface Concert {
  id: string
  band: string
  bandEmoji: string
  venue: string
  city: string
  date: string
  time: string
  price: string
  soldOut: boolean
  distance: string
  reasonYouCantGo: string
  ticketsLeft?: number
}

interface Band {
  name: string
  emoji: string
  genre: string
  followers: string
  lastInYourCity: string
  nextInYourCity: string
  tours: Concert[]
}

// ============================================================================
// Sample Data
// ============================================================================

const YOUR_CITY = 'Your City'

const UPCOMING_CONCERTS: Concert[] = [
  {
    id: '1',
    band: 'The Velvet Algorithms',
    bandEmoji: '🎸',
    venue: 'The Somewhere Else Arena',
    city: 'Literally Anywhere But Here',
    date: 'Tomorrow',
    time: '8:00 PM',
    price: '$25',
    soldOut: false,
    distance: '847 miles away',
    reasonYouCantGo: 'It\'s tomorrow and 847 miles away',
    ticketsLeft: 12,
  },
  {
    id: '2',
    band: 'Neon Requiem',
    bandEmoji: '💀',
    venue: 'The Underground',
    city: YOUR_CITY,
    date: 'Last Week',
    time: '9:00 PM',
    price: '$30',
    soldOut: true,
    distance: '0 miles',
    reasonYouCantGo: 'You missed it. It was last week. Everyone said it was amazing.',
  },
  {
    id: '3',
    band: 'Quantum Entanglement',
    bandEmoji: '⚛️',
    venue: 'Madison Square Garden',
    city: 'New York, NY',
    date: 'March 15, 2026',
    time: '7:30 PM',
    price: '$450',
    soldOut: false,
    distance: '2,847 miles away',
    reasonYouCantGo: 'Tickets are $450 and it\'s across the country',
    ticketsLeft: 3,
  },
  {
    id: '4',
    band: 'The Existential Dread',
    bandEmoji: '😰',
    venue: 'Wembley Stadium',
    city: 'London, UK',
    date: 'April 20, 2026',
    time: '6:00 PM',
    price: '£85',
    soldOut: false,
    distance: '5,000+ miles away',
    reasonYouCantGo: 'It\'s in another country',
    ticketsLeft: 2847,
  },
  {
    id: '5',
    band: 'Schrödinger\'s Cats',
    bandEmoji: '🐱',
    venue: 'The Tiny Venue',
    city: 'Town Next To Yours',
    date: 'This Saturday',
    time: '10:00 PM',
    price: '$15',
    soldOut: true,
    distance: '12 miles away',
    reasonYouCantGo: 'Sold out in 0.3 seconds. You didn\'t even know about it.',
  },
  {
    id: '6',
    band: 'Trust Fall Tim & The Catchers',
    bandEmoji: '🙆‍♂️',
    venue: 'Community Center',
    city: YOUR_CITY,
    date: 'Your Birthday',
    time: '7:00 PM',
    price: '$20',
    soldOut: true,
    distance: '0 miles',
    reasonYouCantGo: 'It\'s on your birthday and you already have plans you can\'t cancel',
  },
  {
    id: '7',
    band: 'Derek\'s Wave Function',
    bandEmoji: '☕',
    venue: 'Coffee Shop Basement',
    city: 'Portland, OR',
    date: 'Every Tuesday',
    time: '11:00 PM',
    price: 'Free',
    soldOut: false,
    distance: '1,200 miles away',
    reasonYouCantGo: 'It\'s every Tuesday in Portland. You don\'t live in Portland.',
    ticketsLeft: 847,
  },
  {
    id: '8',
    band: 'The Hartwell Hauntings',
    bandEmoji: '🏚️',
    venue: 'Hartwell Building Basement',
    city: YOUR_CITY,
    date: 'TBD',
    time: '???',
    price: 'Your Soul',
    soldOut: false,
    distance: '0 miles',
    reasonYouCantGo: 'The venue doesn\'t technically exist. Or does it?',
  },
]

const JUST_MISSED: Concert[] = [
  { id: 'jm1', band: 'The Velvet Algorithms', bandEmoji: '🎸', venue: 'Your Favorite Venue', city: YOUR_CITY, date: '2 days ago', time: '8:00 PM', price: '$25', soldOut: true, distance: '0 miles', reasonYouCantGo: 'You were sick that day' },
  { id: 'jm2', band: 'Neon Requiem', bandEmoji: '💀', venue: 'The Underground', city: YOUR_CITY, date: 'Last month', time: '9:00 PM', price: '$30', soldOut: true, distance: '0 miles', reasonYouCantGo: 'You didn\'t check your email' },
  { id: 'jm3', band: 'Quantum Entanglement', bandEmoji: '⚛️', venue: 'Secret Location', city: YOUR_CITY, date: 'Yesterday', time: '11:00 PM', price: 'Free', soldOut: true, distance: '0 miles', reasonYouCantGo: 'It was a secret show. You weren\'t cool enough to know.' },
]

const TRACKED_BANDS: Band[] = [
  {
    name: 'The Velvet Algorithms',
    emoji: '🎸',
    genre: 'Electronic / Existential',
    followers: '847,293',
    lastInYourCity: '2 days ago (you missed it)',
    nextInYourCity: 'Maybe 2027? They\'re "taking a break"',
    tours: UPCOMING_CONCERTS.filter(c => c.band === 'The Velvet Algorithms'),
  },
  {
    name: 'Neon Requiem',
    emoji: '💀',
    genre: 'Post-Punk Revival',
    followers: '234,567',
    lastInYourCity: 'Last week',
    nextInYourCity: 'Unknown - they broke up after the show',
    tours: UPCOMING_CONCERTS.filter(c => c.band === 'Neon Requiem'),
  },
  {
    name: 'Schrödinger\'s Cats',
    emoji: '🐱',
    genre: 'Quantum Jazz',
    followers: '50,000 (maybe)',
    lastInYourCity: 'They both did and didn\'t play here',
    nextInYourCity: 'Uncertain',
    tours: UPCOMING_CONCERTS.filter(c => c.band === 'Schrödinger\'s Cats'),
  },
]

const NOTIFICATIONS = [
  '🎸 The Velvet Algorithms just announced a tour! (No dates in your area)',
  '💀 Neon Requiem played a secret show in your city last night!',
  '⚛️ Quantum Entanglement tickets ON SALE NOW (sold out)',
  '🙆‍♂️ Trust Fall Tim is playing your city! (It\'s on your wedding day)',
  '🎵 Your favorite band is playing 3,000 miles away tomorrow!',
]

// ============================================================================
// DB Adapters
// ============================================================================

/** Adapt a DB SiteContentItem to the local Concert interface */
function dbToConcert(item: SiteContentItem): Concert {
  const m = item.metadata || {}
  return {
    id: item.slug,
    band: item.title,
    bandEmoji: item.thumbnailEmoji || m.bandEmoji || '🎵',
    venue: m.venue || '',
    city: m.city || '',
    date: m.date || new Date((item.publishedAt || item.createdAt) * 1000).toLocaleDateString(),
    time: m.time || '',
    price: m.price || '',
    soldOut: m.soldOut || false,
    distance: m.distance || '',
    reasonYouCantGo: m.reasonYouCantGo || item.summary || '',
    ticketsLeft: m.ticketsLeft,
  }
}

// ============================================================================
// Components
// ============================================================================

function ConcertCard({ concert }: { concert: Concert }) {
  const isPast = concert.date.includes('ago') || concert.date.includes('Last') || concert.date.includes('Yesterday')

  return (
    <StyledCard
      variant="default"
      padding="md"
      borderRadius="md"
      shadow="md"
      className="mb-3"
      bgColor="#ffffff"
      borderColor={isPast ? '#d1d5db' : '#fecaca'}
      textColor={isPast ? '#6b7280' : '#1f2937'}
      style={{ opacity: isPast ? 0.75 : 1 }}
    >
      <div className="flex justify-between items-start">
        <div className="flex gap-3">
          <div className="text-4xl">{concert.bandEmoji}</div>
          <div>
            <h3 className="font-bold text-gray-800">{concert.band}</h3>
            <p className="text-sm text-gray-600">{concert.venue}</p>
            <p className="text-sm text-gray-500">{concert.city}</p>
          </div>
        </div>
        <div className="text-right">
          <p className={`font-bold ${isPast ? 'text-gray-400' : 'text-red-600'}`}>
            {concert.date}
          </p>
          <p className="text-sm text-gray-500">{concert.time}</p>
          <p className="text-sm font-medium text-gray-700">{concert.price}</p>
        </div>
      </div>

      {/* Why you can't go */}
      <StyledCard
        variant="default"
        padding="sm"
        borderRadius="sm"
        shadow="none"
        className="mt-3"
        bgColor={isPast ? '#f3f4f6' : '#fef2f2'}
        borderColor="transparent"
        textColor={isPast ? '#4b5563' : '#b91c1c'}
      >
        <span className="font-medium">
          {isPast ? '❌ You missed this: ' : '😔 Why you can\'t go: '}
        </span>
        {concert.reasonYouCantGo}
      </StyledCard>

      {/* Ticket info */}
      <div className="mt-3 flex justify-between items-center">
        <span className="text-xs text-gray-500">📍 {concert.distance}</span>
        {concert.soldOut ? (
          <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">SOLD OUT</span>
        ) : concert.ticketsLeft && concert.ticketsLeft < 20 ? (
          <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded animate-pulse">
            Only {concert.ticketsLeft} tickets left!
          </span>
        ) : (
          <Button
            variant="primary"
            size="xs"
            backgroundColor="#dc2626"
            textColor="#ffffff"
          >
            Get Tickets (Why Though?)
          </Button>
        )}
      </div>
    </StyledCard>
  )
}

function BandCard({ band }: { band: Band }) {
  return (
    <StyledCard
      variant="default"
      padding="md"
      borderRadius="md"
      shadow="md"
      bgColor="#ffffff"
      borderColor="#e5e7eb"
      textColor="#1f2937"
    >
      <div className="flex items-center gap-3 mb-3">
        <span className="text-3xl">{band.emoji}</span>
        <div>
          <h3 className="font-bold text-gray-800">{band.name}</h3>
          <p className="text-xs text-gray-500">{band.genre}</p>
        </div>
      </div>
      <div className="text-sm space-y-1">
        <p className="text-gray-600">
          <span className="text-gray-400">Followers:</span> {band.followers}
        </p>
        <p className="text-gray-600">
          <span className="text-gray-400">Last in {YOUR_CITY}:</span>{' '}
          <span className="text-red-600">{band.lastInYourCity}</span>
        </p>
        <p className="text-gray-600">
          <span className="text-gray-400">Next in {YOUR_CITY}:</span>{' '}
          <span className="text-red-600">{band.nextInYourCity}</span>
        </p>
      </div>
      <Button
        variant="outline"
        size="sm"
        width="full"
        textColor="#dc2626"
        borderColor="#fca5a5"
        backgroundColor="transparent"
        className="mt-3"
      >
        Track (For More Disappointment)
      </Button>
    </StyledCard>
  )
}

// ============================================================================
// Main Site
// ============================================================================

export function BandsNotInTownSite({ siteId }: SiteProps) {
  // Fetch from DB with fallback to hardcoded data
  const { content: dbContent } = useSiteContent('bandsnotintown')

  const upcomingConcerts = useMemo(() => {
    if (dbContent.length > 0) {
      // DB items with contentType 'concert' or category 'upcoming' map to upcoming concerts
      const upcoming = dbContent.filter(i => i.contentType === 'concert' || i.category === 'upcoming' || !i.category)
      if (upcoming.length > 0) return upcoming.map(dbToConcert)
    }
    return UPCOMING_CONCERTS
  }, [dbContent])

  const justMissed = useMemo(() => {
    if (dbContent.length > 0) {
      const missed = dbContent.filter(i => i.category === 'missed')
      if (missed.length > 0) return missed.map(dbToConcert)
    }
    return JUST_MISSED
  }, [dbContent])

  const [activeTab, setActiveTab] = useState<'upcoming' | 'missed' | 'tracked'>('upcoming')
  const [showNotification, setShowNotification] = useState(true)

  return (
    <div className="min-h-full bg-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-red-600 to-red-700 text-white">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-4xl">🎫</span>
              <div>
                <h1 className="text-2xl font-bold">{site?.name || 'BandsNotInTown'}</h1>
                <p className="text-red-200 text-sm">Never See Your Favorite Artists Live™</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-red-200">Your Location:</p>
              <p className="font-bold">{YOUR_CITY} 📍</p>
            </div>
          </div>

          {/* Search */}
          <div className="mt-4 relative">
            <input
              type="text"
              placeholder="Search for artists to be disappointed about..."
              className="w-full px-4 py-3 rounded-lg text-gray-800 pr-12"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-red-500 text-white p-2 rounded-lg">
              🔍
            </button>
          </div>

          {/* Stats */}
          <div className="mt-4 flex justify-center gap-8 text-sm">
            <div className="text-center">
              <p className="text-2xl font-bold">847</p>
              <p className="text-red-200">Shows Missed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">23</p>
              <p className="text-red-200">Bands Tracked</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">0</p>
              <p className="text-red-200">Shows In Your City</p>
            </div>
          </div>
        </div>
      </header>

      {/* Notification Banner */}
      {showNotification && (
        <div className="bg-yellow-100 border-b border-yellow-300 py-2 px-4">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <p className="text-sm text-yellow-800">
              {NOTIFICATIONS[Math.floor(Math.random() * NOTIFICATIONS.length)]}
            </p>
            <button onClick={() => setShowNotification(false)} className="text-yellow-600 hover:text-yellow-800">
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto flex">
          {[
            { id: 'upcoming', label: 'Upcoming (Not Here)', count: upcomingConcerts.length },
            { id: 'missed', label: 'Just Missed', count: justMissed.length },
            { id: 'tracked', label: 'Tracked Bands', count: TRACKED_BANDS.length },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex-1 py-3 text-sm font-medium border-b-2 ${
                activeTab === tab.id
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {activeTab === 'upcoming' && (
          <div>
            <StyledCard
              variant="default"
              padding="md"
              borderRadius="md"
              shadow="none"
              className="mb-6"
              bgColor="#fef2f2"
              borderColor="#fca5a5"
              textColor="#7f1d1d"
            >
              <h2 className="font-bold text-red-800 mb-2">😔 Bad News</h2>
              <p className="text-sm text-red-700">
                We found {upcomingConcerts.length} concerts from artists you like.
                Unfortunately, none of them are convenient for you to attend.
                Here they are anyway, to maximize your suffering.
              </p>
            </StyledCard>

            {upcomingConcerts.map(concert => (
              <ConcertCard key={concert.id} concert={concert} />
            ))}
          </div>
        )}

        {activeTab === 'missed' && (
          <div>
            <StyledCard
              variant="default"
              padding="md"
              borderRadius="md"
              shadow="none"
              className="mb-6"
              bgColor="#f3f4f6"
              borderColor="#d1d5db"
              textColor="#1f2937"
            >
              <h2 className="font-bold text-gray-800 mb-2">💀 Shows You Missed</h2>
              <p className="text-sm text-gray-600">
                These shows already happened. They were apparently amazing.
                Everyone's still talking about them. You weren't there.
              </p>
            </StyledCard>

            {justMissed.map(concert => (
              <ConcertCard key={concert.id} concert={concert} />
            ))}

            <StyledCard
              variant="default"
              padding="md"
              borderRadius="md"
              shadow="md"
              className="mt-6"
              bgColor="#ffffff"
              borderColor="#e5e7eb"
              textColor="#1f2937"
            >
              <h3 className="font-bold text-gray-800 mb-3">📊 Your Miss Statistics</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <StyledCard
                  variant="default"
                  padding="sm"
                  borderRadius="sm"
                  shadow="none"
                  bgColor="#f3f4f6"
                  borderColor="transparent"
                  textColor="#6b7280"
                >
                  <p className="text-gray-500">Shows missed this year</p>
                  <p className="text-2xl font-bold text-red-600">47</p>
                </StyledCard>
                <StyledCard
                  variant="default"
                  padding="sm"
                  borderRadius="sm"
                  shadow="none"
                  bgColor="#f3f4f6"
                  borderColor="transparent"
                  textColor="#6b7280"
                >
                  <p className="text-gray-500">Money saved (cope)</p>
                  <p className="text-2xl font-bold text-green-600">$1,847</p>
                </StyledCard>
                <StyledCard
                  variant="default"
                  padding="sm"
                  borderRadius="sm"
                  shadow="none"
                  bgColor="#f3f4f6"
                  borderColor="transparent"
                  textColor="#6b7280"
                >
                  <p className="text-gray-500">Secret shows missed</p>
                  <p className="text-2xl font-bold text-red-600">12</p>
                </StyledCard>
                <StyledCard
                  variant="default"
                  padding="sm"
                  borderRadius="sm"
                  shadow="none"
                  bgColor="#f3f4f6"
                  borderColor="transparent"
                  textColor="#6b7280"
                >
                  <p className="text-gray-500">Reunion tours missed</p>
                  <p className="text-2xl font-bold text-red-600">3</p>
                </StyledCard>
              </div>
            </StyledCard>
          </div>
        )}

        {activeTab === 'tracked' && (
          <div>
            <StyledCard
              variant="default"
              padding="md"
              borderRadius="md"
              shadow="none"
              className="mb-6"
              bgColor="#eff6ff"
              borderColor="#93c5fd"
              textColor="#1e40af"
            >
              <h2 className="font-bold text-blue-800 mb-2">🎯 Bands You're Tracking</h2>
              <p className="text-sm text-blue-700">
                We'll notify you the moment these bands announce shows!
                (So you can watch tickets sell out before you can buy them)
              </p>
            </StyledCard>

            <div className="grid md:grid-cols-2 gap-4">
              {TRACKED_BANDS.map(band => (
                <BandCard key={band.name} band={band} />
              ))}
            </div>

            <StyledCard
              variant="default"
              padding="md"
              borderRadius="md"
              shadow="md"
              className="mt-6"
              bgColor="#ffffff"
              borderColor="#e5e7eb"
              textColor="#1f2937"
              style={{ textAlign: 'center' }}
            >
              <p className="text-gray-500 mb-3">Track more bands to increase your disappointment</p>
              <Button
                variant="primary"
                size="md"
                backgroundColor="#dc2626"
                textColor="#ffffff"
              >
                + Add Artists
              </Button>
            </StyledCard>
          </div>
        )}

        {/* FOMO Generator */}
        <StyledCard
          variant="gradient"
          padding="lg"
          borderRadius="md"
          shadow="md"
          className="mt-8"
          bgColor="linear-gradient(to right, #9333ea, #a855f7)"
          textColor="#ffffff"
        >
          <h2 className="text-xl font-bold mb-2">🔥 FOMO Generator</h2>
          <p className="text-purple-200 mb-4">
            Not feeling bad enough? Let us help.
          </p>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <StyledCard
              variant="transparent"
              padding="sm"
              borderRadius="sm"
              shadow="none"
              bgColor="rgba(255, 255, 255, 0.1)"
              borderColor="transparent"
              textColor="#f3e8ff"
            >
              <p className="text-purple-200">Right now, somewhere:</p>
              <p className="font-bold">The Velvet Algorithms are soundchecking</p>
            </StyledCard>
            <StyledCard
              variant="transparent"
              padding="sm"
              borderRadius="sm"
              shadow="none"
              bgColor="rgba(255, 255, 255, 0.1)"
              borderColor="transparent"
              textColor="#f3e8ff"
            >
              <p className="text-purple-200">Last night:</p>
              <p className="font-bold">Secret show in your neighborhood</p>
            </StyledCard>
            <StyledCard
              variant="transparent"
              padding="sm"
              borderRadius="sm"
              shadow="none"
              bgColor="rgba(255, 255, 255, 0.1)"
              borderColor="transparent"
              textColor="#f3e8ff"
            >
              <p className="text-purple-200">Tomorrow:</p>
              <p className="font-bold">Last ever Neon Requiem show (not here)</p>
            </StyledCard>
          </div>
        </StyledCard>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-6 px-4 mt-8">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xl mb-2">🎫 BandsNotInTown</p>
          <p className="text-gray-400 text-sm">
            "We'll let you know about every show you can't attend"
          </p>
          <div className="mt-4 flex justify-center gap-6 text-xs text-gray-500">
            <span>© 2026 BandsNotInTown</span>
            <span>|</span>
            <span>Privacy Policy (We sell your tears)</span>
            <span>|</span>
            <span>Contact (We won't respond)</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default BandsNotInTownSite
