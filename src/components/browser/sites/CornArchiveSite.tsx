/**
 * CornArchive Site
 *
 * Internet Archive / Wayback Machine parody for the engAIge browser.
 * Archives "deleted" and "historical" web pages with timeline scrubbing,
 * removal notices, and deep lore connections.
 *
 * Features:
 * - Retro blue/white archive aesthetic
 * - Timeline slider for viewing "old versions"
 * - "Saved X times" counters with the recurring 847 easter egg
 * - Collection categories
 * - "This page has been removed at the request of..." notices
 */

import { useState } from 'react'
import type { SiteProps } from '../BrowserSiteContainer.js'
import { FILLER_SITES } from '../../../config/filler-sites.js'

// ============================================================================
// Site Configuration
// ============================================================================

const site = FILLER_SITES.cornarchive

// ============================================================================
// Types
// ============================================================================

interface ArchivedSnapshot {
  date: string
  timestamp: number
  available: boolean
  note?: string
}

interface ArchivedPage {
  id: string
  url: string
  title: string
  category: string
  savedCount: number
  firstArchived: string
  lastArchived: string
  snapshots: ArchivedSnapshot[]
  currentContent: React.ReactNode
  removalNotice?: {
    requester: string
    reason: string
    date: string
  }
  description?: string
}

// ============================================================================
// Archived Pages Data
// ============================================================================

const ARCHIVED_PAGES: ArchivedPage[] = [
  {
    id: 'derek-wedding',
    url: 'www.derek-jennifer-forever.corn',
    title: "Derek & Jennifer's Wedding Website",
    category: 'Personal',
    savedCount: 47,
    firstArchived: 'March 15, 2018',
    lastArchived: 'June 2, 2018',
    snapshots: [
      { date: 'March 15, 2018', timestamp: 1521072000, available: true },
      { date: 'April 1, 2018', timestamp: 1522540800, available: true },
      { date: 'May 12, 2018', timestamp: 1526083200, available: true },
      { date: 'June 2, 2018', timestamp: 1527897600, available: true },
    ],
    description: 'Wedding website for Derek & Jennifer, married June 15, 2018',
    currentContent: (
      <div className="font-serif">
        <div className="text-center py-8 border-b border-[#a0a0a0]">
          <p className="text-lg italic text-[#666]">~ Together Forever ~</p>
          <h1 className="text-4xl font-bold text-[#8B4513] my-4">Derek & Jennifer</h1>
          <p className="text-xl text-[#333]">June 15th, 2018</p>
          <p className="text-sm text-[#666] mt-2">Westbrook Community Church</p>
        </div>

        <div className="py-6 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-[#8B4513] mb-4 text-center">Our Story</h2>
          <p className="text-[#333] leading-relaxed mb-4">
            We met at the Westbrook Farmers Market in the summer of 2015. Derek was buying
            organic vegetables (he's always been health-conscious!) and I accidentally
            knocked over his basket of heirloom tomatoes. The rest, as they say, is history.
          </p>
          <p className="text-[#333] leading-relaxed mb-4">
            Three years later, he proposed at the same farmers market, and now we're
            beginning our forever together.
          </p>
        </div>

        <div className="py-6 bg-[#FFF8DC] border-y border-[#DEB887]">
          <h2 className="text-2xl font-bold text-[#8B4513] mb-4 text-center">Jennifer's Vows</h2>
          <p className="text-[#333] leading-relaxed italic max-w-2xl mx-auto px-4">
            "Derek, I promise to love you unconditionally. I promise to support your
            interests, whatever they may be. I promise to always be your partner in
            everything - from lazy Sunday mornings to ambitious Tuesday evenings.
            I promise to grow old with you, to laugh with you, and to build a beautiful
            life together. You are my best friend, my soulmate, and soon, my husband.
            I love you."
          </p>
          <p className="text-xs text-[#666] text-center mt-4">
            [Editor's note: Remarkably, coffee is not mentioned once in these vows.
            This will not last.]
          </p>
        </div>

        <div className="py-6 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-[#8B4513] mb-4 text-center">Guestbook Comments</h2>
          <div className="space-y-4">
            <div className="bg-white p-4 rounded border border-[#DEB887]">
              <p className="text-[#333]">"They're perfect together! So happy for you both!"</p>
              <p className="text-sm text-[#666] mt-2">- Sarah & Mike, March 20, 2018</p>
            </div>
            <div className="bg-white p-4 rounded border border-[#DEB887]">
              <p className="text-[#333]">"Derek, you found the one! Jennifer is amazing."</p>
              <p className="text-sm text-[#666] mt-2">- Kevin (College Roommate), March 22, 2018</p>
            </div>
            <div className="bg-white p-4 rounded border border-[#DEB887]">
              <p className="text-[#333]">"Such a lovely couple. Traditional values, beautiful ceremony planned."</p>
              <p className="text-sm text-[#666] mt-2">- Derek's Mom, April 1, 2018</p>
            </div>
            <div className="bg-white p-4 rounded border border-[#DEB887]">
              <p className="text-[#333]">"Can't wait to see you walk down the aisle, sis!"</p>
              <p className="text-sm text-[#666] mt-2">- Amanda (Jennifer's Sister), May 3, 2018</p>
            </div>
          </div>
        </div>

        <div className="text-center py-4 text-xs text-[#999]">
          <p>Website created with WedSite Builder Pro</p>
          <p className="mt-1">[Site taken offline after divorce, August 2022]</p>
        </div>
      </div>
    ),
  },
  {
    id: 'quantum-brew-original',
    url: 'www.quantumbrewcafe.corn/menu',
    title: 'Quantum Brew Cafe - Original Menu (2019)',
    category: 'Business',
    savedCount: 234,
    firstArchived: 'January 8, 2019',
    lastArchived: 'September 15, 2019',
    snapshots: [
      { date: 'January 8, 2019', timestamp: 1546905600, available: true },
      { date: 'March 22, 2019', timestamp: 1553212800, available: true },
      { date: 'June 1, 2019', timestamp: 1559347200, available: false, note: 'Snapshot corrupted' },
      { date: 'September 15, 2019', timestamp: 1568505600, available: true },
    ],
    description: 'Original menu before the "quantum" rebrand',
    currentContent: (
      <div className="bg-[#F5F5DC] p-8">
        <div className="max-w-xl mx-auto">
          <div className="text-center border-b-2 border-[#8B4513] pb-4 mb-6">
            <h1 className="text-3xl font-bold text-[#8B4513]">Brew Cafe</h1>
            <p className="text-sm text-[#666] mt-1">Est. 2018 - Downtown Westbrook</p>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-bold text-[#8B4513] mb-4 border-b border-[#DEB887] pb-2">
              Coffee Menu
            </h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>House Blend</span>
                <span className="font-bold">$3.50</span>
              </div>
              <div className="flex justify-between">
                <span>Espresso</span>
                <span className="font-bold">$4.00</span>
              </div>
              <div className="flex justify-between">
                <span>Cappuccino</span>
                <span className="font-bold">$5.00</span>
              </div>
              <div className="flex justify-between">
                <span>Latte (any flavor)</span>
                <span className="font-bold">$5.50</span>
              </div>
              <div className="flex justify-between">
                <span>Cold Brew</span>
                <span className="font-bold">$4.50</span>
              </div>
              <div className="flex justify-between">
                <span>Premium Single Origin</span>
                <span className="font-bold">$8.00</span>
              </div>
              <div className="flex justify-between">
                <span>Chef's Special Brew</span>
                <span className="font-bold">$12.00</span>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-bold text-[#8B4513] mb-4 border-b border-[#DEB887] pb-2">
              Pastries & Snacks
            </h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Croissant</span>
                <span className="font-bold">$3.00</span>
              </div>
              <div className="flex justify-between">
                <span>Blueberry Muffin</span>
                <span className="font-bold">$3.50</span>
              </div>
              <div className="flex justify-between">
                <span>Avocado Toast</span>
                <span className="font-bold">$8.00</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded border border-[#DEB887] text-center">
            <p className="text-sm text-[#666] italic">
              "Just good coffee, made with care."
            </p>
            <p className="text-xs text-[#999] mt-2">- Original tagline</p>
          </div>

          <div className="mt-8 p-4 bg-[#FFE4E1] border border-[#CD5C5C] rounded">
            <p className="text-sm text-[#8B0000] font-bold">COMPARE TO CURRENT SITE:</p>
            <p className="text-xs text-[#8B0000] mt-2">
              Current "Quantum Brew" prices start at $47/cup for "Entangled Espresso."
              No quantum anything on this menu. Just normal coffee at normal prices.
              What happened?
            </p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'hartwell-directory',
    url: 'www.hartwellbuilding.corn/directory',
    title: 'Hartwell Building - Floor Directory (1931)',
    category: 'Historical',
    savedCount: 847,
    firstArchived: 'Unknown (restored from microfilm)',
    lastArchived: 'February 14, 1931',
    snapshots: [
      { date: 'February 14, 1931', timestamp: -1227398400, available: true },
    ],
    description: 'Original floor directory showing all 13 floors',
    removalNotice: {
      requester: 'Omnicorp Holdings LLC',
      reason: 'Contains confidential historical business information',
      date: 'March 3, 2019',
    },
    currentContent: (
      <div className="bg-[#F4E4BC] p-8 font-serif">
        <div className="max-w-lg mx-auto border-4 border-[#8B4513] p-6 bg-[#FFFEF0]">
          <div className="text-center border-b-2 border-[#8B4513] pb-4 mb-6">
            <h1 className="text-2xl font-bold tracking-wide text-[#1a1a1a]">
              THE HARTWELL BUILDING
            </h1>
            <p className="text-sm mt-1">FLOOR DIRECTORY</p>
            <p className="text-xs mt-1 text-[#666]">Erected 1923 - Renovated 1930</p>
          </div>

          <div className="space-y-1 text-sm">
            <div className="flex justify-between border-b border-dotted border-[#8B4513] pb-1">
              <span>Floor 1</span>
              <span>Main Lobby & Reception</span>
            </div>
            <div className="flex justify-between border-b border-dotted border-[#8B4513] pb-1">
              <span>Floor 2</span>
              <span>Hartwell Bank & Trust</span>
            </div>
            <div className="flex justify-between border-b border-dotted border-[#8B4513] pb-1">
              <span>Floor 3</span>
              <span>Westbrook Insurance Co.</span>
            </div>
            <div className="flex justify-between border-b border-dotted border-[#8B4513] pb-1">
              <span>Floor 4</span>
              <span>Law Offices of Crane & Associates</span>
            </div>
            <div className="flex justify-between border-b border-dotted border-[#8B4513] pb-1">
              <span>Floor 5</span>
              <span>Accounting Services</span>
            </div>
            <div className="flex justify-between border-b border-dotted border-[#8B4513] pb-1">
              <span>Floor 6</span>
              <span>Medical Offices</span>
            </div>
            <div className="flex justify-between border-b border-dotted border-[#8B4513] pb-1 bg-[#FFE4E1]">
              <span className="font-bold">Floor 7</span>
              <span className="font-bold">[REDACTED - See Management]</span>
            </div>
            <div className="flex justify-between border-b border-dotted border-[#8B4513] pb-1">
              <span>Floor 8</span>
              <span>Architectural Firm</span>
            </div>
            <div className="flex justify-between border-b border-dotted border-[#8B4513] pb-1">
              <span>Floor 9</span>
              <span>Import/Export Office</span>
            </div>
            <div className="flex justify-between border-b border-dotted border-[#8B4513] pb-1">
              <span>Floor 10</span>
              <span>Private Offices</span>
            </div>
            <div className="flex justify-between border-b border-dotted border-[#8B4513] pb-1">
              <span>Floor 11</span>
              <span>Conference Rooms</span>
            </div>
            <div className="flex justify-between border-b border-dotted border-[#8B4513] pb-1">
              <span>Floor 12</span>
              <span>Storage & Archives</span>
            </div>
            <div className="flex justify-between border-b border-dotted border-[#8B4513] pb-1 bg-[#FFFACD]">
              <span className="font-bold">Floor 13</span>
              <span className="font-bold">Executive Offices - H. Hartwell</span>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-[#666]">
            <p>Building Superintendent: R. Morrison</p>
            <p className="mt-1">Founder: Harold Hartwell (1878-1943)</p>
          </div>
        </div>

        <div className="mt-6 max-w-lg mx-auto p-4 bg-[#FF6B6B] text-white rounded">
          <p className="font-bold text-sm">ARCHIVIST NOTE:</p>
          <p className="text-xs mt-2">
            Modern building plans only show 12 floors. Floor 13 does not appear in any
            post-1943 documentation. Current elevator buttons skip from 12 to 14.
            Current building owner (Omnicorp Holdings) denies 13th floor ever existed.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 'trust-fall-tim-first',
    url: 'www.vidtube.corn/watch?v=tft001',
    title: "Trust Fall Tim's First Video (2015)",
    category: 'Media',
    savedCount: 2847,
    firstArchived: 'July 4, 2015',
    lastArchived: 'July 4, 2015',
    snapshots: [
      { date: 'July 4, 2015', timestamp: 1435968000, available: true },
    ],
    description: 'The video that started it all. 3 views.',
    currentContent: (
      <div className="bg-[#0f0f0f] p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-black aspect-video flex items-center justify-center border border-[#333] rounded">
            <div className="text-center text-white">
              <span className="text-6xl mb-4 block">📼</span>
              <p className="text-[#666] text-sm">[Video Playback Unavailable]</p>
              <p className="text-[#444] text-xs mt-1">Archived as text description only</p>
            </div>
          </div>

          <div className="mt-4">
            <h1 className="text-xl font-bold text-white">trust fall attempt 1</h1>
            <div className="flex items-center gap-4 text-sm text-[#aaa] mt-2">
              <span>3 views</span>
              <span>Jul 4, 2015</span>
            </div>
          </div>

          <div className="mt-4 p-4 bg-[#1a1a1a] rounded border border-[#333]">
            <p className="text-white text-sm font-bold">Video Description:</p>
            <p className="text-[#aaa] text-sm mt-2 italic">
              "first trust fall video. asked my roommate to catch me but he wasnt home
              so i just fell. it hurt. gonna try again tomorrow with someone actually there lol"
            </p>
            <p className="text-[#666] text-xs mt-4">
              [Archived transcript: Man stands with back to camera in empty apartment.
              Counts to three. Falls backward. Hits floor. Long pause. "Ow." Video ends.]
            </p>
          </div>

          <div className="mt-4 p-4 bg-[#1a1a1a] rounded border border-[#333]">
            <p className="text-[#666] text-sm mb-2">Comments disabled for this video</p>
            <p className="text-[#444] text-xs italic">
              [Original comment section was empty except for one comment from "mom_of_tim":
              "Be careful sweetie! Love you!" - Later deleted]
            </p>
          </div>

          <div className="mt-6 p-4 bg-[#2a1a1a] rounded border border-[#4a2a2a]">
            <p className="text-[#ff6b6b] text-sm font-bold">ARCHIVIST NOTE:</p>
            <p className="text-[#aaa] text-xs mt-2">
              Tim is alone. Tim falls. No one catches Tim. This would become the central
              tragedy/comedy of Trust Fall Tim's entire career. As of 2024, Tim has
              attempted 2,847 trust falls with a 78.5% catch rate. This first video
              remains his only one with 0% catch rate.
            </p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'graintruth-original',
    url: 'www.graintruth.corn',
    title: 'GrainTruth - Before The Awakening (2020)',
    category: 'Personal Blog',
    savedCount: 12,
    firstArchived: 'January 3, 2020',
    lastArchived: 'April 28, 2020',
    snapshots: [
      { date: 'January 3, 2020', timestamp: 1578009600, available: true },
      { date: 'February 15, 2020', timestamp: 1581724800, available: true },
      { date: 'March 30, 2020', timestamp: 1585526400, available: true },
      { date: 'April 28, 2020', timestamp: 1588032000, available: true, note: 'Last normal version' },
    ],
    description: 'Before it became a conspiracy site, GrainTruth was about farming',
    currentContent: (
      <div className="bg-[#F5F5DC] p-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center border-b-2 border-[#228B22] pb-4 mb-6">
            <h1 className="text-3xl font-bold text-[#228B22]">GrainTruth</h1>
            <p className="text-sm text-[#666] mt-1">Honest Advice for Modern Farmers</p>
          </div>

          <article className="mb-8 bg-white p-6 rounded shadow">
            <h2 className="text-xl font-bold text-[#228B22] mb-2">
              Spring Planting Tips for Corn
            </h2>
            <p className="text-xs text-[#666] mb-4">Posted March 15, 2020</p>
            <p className="text-[#333] leading-relaxed mb-4">
              Hello fellow farmers! With spring approaching, I wanted to share some
              tried-and-true tips for getting your corn crop off to a great start...
            </p>
            <ul className="list-disc list-inside text-[#333] space-y-2 text-sm">
              <li>Wait until soil temperature reaches 50F consistently</li>
              <li>Plant seeds 1.5-2 inches deep</li>
              <li>Space rows 30-36 inches apart</li>
              <li>Consider companion planting with beans and squash</li>
            </ul>
          </article>

          <article className="mb-8 bg-white p-6 rounded shadow">
            <h2 className="text-xl font-bold text-[#228B22] mb-2">
              Best Fertilizers for Grain Crops
            </h2>
            <p className="text-xs text-[#666] mb-4">Posted February 1, 2020</p>
            <p className="text-[#333] leading-relaxed">
              A balanced N-P-K fertilizer is key for healthy grain development.
              I've been using a 10-10-10 blend with great results...
            </p>
          </article>

          <div className="bg-[#FFFACD] p-4 rounded border border-[#DAA520] mb-8">
            <p className="text-sm text-[#8B4513] font-bold">From the Founder:</p>
            <p className="text-sm text-[#333] mt-2 italic">
              "I started this blog to help small farmers like myself navigate the
              challenges of modern agriculture. Good information shouldn't be hard
              to find. Happy growing! - Earl"
            </p>
          </div>

          <div className="mt-6 p-4 bg-[#FFE4E1] rounded border border-[#CD5C5C]">
            <p className="text-sm text-[#8B0000] font-bold">FOUNDER'S NOTE (April 2020):</p>
            <p className="text-xs text-[#8B0000] mt-2 italic">
              "Something changed in me last spring. I was out in the fields, really
              looking at the corn for the first time. Really seeing it. They're
              watching us, you know. They've always been watching. More to come.
              The truth is in the grain."
            </p>
            <p className="text-xs text-[#666] mt-4">
              [This was the last post before the site's complete redesign in May 2020.
              Current site now focuses exclusively on "Big Corn" conspiracy theories.]
            </p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'cobcoin-whitepaper',
    url: 'www.cobcoin.corn/whitepaper',
    title: 'CobCoin Whitepaper (2023)',
    category: 'Cryptocurrency',
    savedCount: 847,
    firstArchived: 'February 14, 2023',
    lastArchived: 'December 1, 2023',
    snapshots: [
      { date: 'February 14, 2023', timestamp: 1676332800, available: true },
      { date: 'May 1, 2023', timestamp: 1682899200, available: true },
      { date: 'August 15, 2023', timestamp: 1692057600, available: true },
      { date: 'December 1, 2023', timestamp: 1701388800, available: true },
    ],
    description: 'The promises that were made. The promises that were broken.',
    currentContent: (
      <div className="bg-[#0a0f1c] p-8 text-white">
        <div className="max-w-2xl mx-auto">
          <div className="text-center border-b border-[#fbbf24] pb-6 mb-8">
            <span className="text-6xl">🌽</span>
            <h1 className="text-4xl font-bold text-[#fbbf24] mt-4">COBCOIN</h1>
            <p className="text-lg text-[#10b981] mt-2">Official Whitepaper v1.0</p>
            <p className="text-sm text-[#666] mt-1">February 2023</p>
          </div>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-[#fbbf24] mb-4">Executive Summary</h2>
            <p className="text-[#aaa] leading-relaxed">
              CobCoin ($COB) represents the future of agricultural finance. Built on
              blockchain technology and backed by the eternal value of corn, $COB
              will revolutionize how the world thinks about both cryptocurrency
              and agriculture.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-[#fbbf24] mb-4">Price Projections</h2>
            <div className="bg-[#1f2937] p-4 rounded border border-[#374151]">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#aaa]">Launch Price (Feb 2023):</span>
                  <span className="text-[#10b981]">$0.001</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#aaa]">Q2 2023 Target:</span>
                  <span className="text-[#10b981]">$1.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#aaa]">Q4 2023 Target:</span>
                  <span className="text-[#10b981]">$47.00</span>
                </div>
                <div className="flex justify-between border-t border-[#374151] pt-2 mt-2">
                  <span className="text-white font-bold">2024 Target:</span>
                  <span className="text-[#fbbf24] font-bold">$847.00 per coin</span>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-[#fbbf24] mb-4">Key Promises</h2>
            <ul className="space-y-3 text-[#aaa]">
              <li className="flex items-start gap-2">
                <span className="text-[#10b981]">[X]</span>
                <span>"CobCoin will NEVER fall below $0.10"</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#10b981]">[X]</span>
                <span>"Team tokens locked for 5 years"</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#10b981]">[X]</span>
                <span>"Backed by real corn reserves in certified facilities"</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#10b981]">[X]</span>
                <span>"Fully doxxed team with agricultural expertise"</span>
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-[#fbbf24] mb-4">Roadmap</h2>
            <div className="space-y-4">
              <div className="bg-[#1f2937] p-3 rounded">
                <p className="text-[#10b981] font-bold">Q1 2023 - Launch</p>
                <p className="text-xs text-[#666]">Status: Completed (sort of)</p>
              </div>
              <div className="bg-[#1f2937] p-3 rounded">
                <p className="text-[#10b981] font-bold">Q2 2023 - Exchange Listings</p>
                <p className="text-xs text-[#666]">Status: "In negotiations"</p>
              </div>
              <div className="bg-[#1f2937] p-3 rounded">
                <p className="text-[#10b981] font-bold">Q3 2023 - Corn Reserve Verification</p>
                <p className="text-xs text-[#666]">Status: Delayed indefinitely</p>
              </div>
              <div className="bg-[#1f2937] p-3 rounded">
                <p className="text-[#fbbf24] font-bold">Q4 2023 - Moon</p>
                <p className="text-xs text-[#666]">Status: LOL</p>
              </div>
            </div>
          </section>

          <div className="bg-[#7f1d1d] p-4 rounded border border-[#ef4444]">
            <p className="text-[#fca5a5] font-bold text-sm">
              THIS PAGE HAS BEEN ARCHIVED 847 TIMES BY CONCERNED USERS
            </p>
            <p className="text-xs text-[#fca5a5] mt-2">
              Current $COB price: $0.00000847
              <br />
              Peak price: $0.03 (lasted 4 minutes)
              <br />
              Team wallets: Emptied September 2023
              <br />
              "Corn reserves": Verified to be a single bag of popcorn
            </p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'underground-opening',
    url: 'www.theunderground.corn/about',
    title: 'The Underground - Original Opening (2008)',
    category: 'Music Venues',
    savedCount: 156,
    firstArchived: 'October 31, 2008',
    lastArchived: 'December 15, 2008',
    snapshots: [
      { date: 'October 31, 2008', timestamp: 1225411200, available: true },
      { date: 'November 15, 2008', timestamp: 1226707200, available: true },
      { date: 'December 15, 2008', timestamp: 1229299200, available: true },
    ],
    description: 'When The Underground was just getting started',
    currentContent: (
      <div className="bg-[#1a1a1a] p-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center border-b border-[#333] pb-6 mb-8">
            <h1 className="text-4xl font-bold text-white" style={{ fontFamily: 'Impact, sans-serif' }}>
              THE UNDERGROUND
            </h1>
            <p className="text-[#888] mt-2">A New Kind of Venue</p>
          </div>

          <div className="mb-8">
            <img
              src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200' viewBox='0 0 400 200'%3E%3Crect fill='%23333' width='400' height='200'/%3E%3Ctext x='200' y='100' text-anchor='middle' fill='%23666' font-size='14'%3E[Photo: Young Mars Williams at opening night]%3C/text%3E%3C/svg%3E"
              alt="Opening night"
              className="w-full rounded"
            />
            <p className="text-xs text-[#666] text-center mt-2 italic">
              Mars on opening night, October 2008. Look how hopeful he looks.
            </p>
          </div>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4">About Us</h2>
            <p className="text-[#aaa] leading-relaxed">
              The Underground is Westbrook's newest independent music venue, located
              in the basement of the old Hartwell Building (entrance on 5th street).
              We believe in giving new artists a space to grow and established acts
              a place to connect with fans.
            </p>
          </section>

          <section className="mb-8 bg-[#222] p-4 rounded">
            <h2 className="text-lg font-bold text-white mb-2">Why "Underground"?</h2>
            <p className="text-[#aaa] text-sm">
              "I found this basement space while exploring the old Hartwell Building.
              It was abandoned, forgotten, perfect. The acoustics are incredible -
              something about the old stone walls. And being underground? It just
              felt right for what we're trying to do." - Mars Williams, Founder
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4">Venue Stats</h2>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-[#222] p-4 rounded">
                <p className="text-2xl font-bold text-[#10b981]">0</p>
                <p className="text-xs text-[#666]">Noise Complaints!</p>
              </div>
              <div className="bg-[#222] p-4 rounded">
                <p className="text-2xl font-bold text-[#10b981]">1</p>
                <p className="text-xs text-[#666]">Shows Hosted</p>
              </div>
            </div>
            <p className="text-xs text-[#666] text-center mt-2 italic">
              [Proudly maintaining our zero complaints record!]
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4">Upcoming Shows</h2>
            <div className="space-y-3">
              <div className="bg-[#222] p-3 rounded flex justify-between items-center">
                <div>
                  <p className="text-white font-bold">Neon Requiem - FIRST GIG</p>
                  <p className="text-xs text-[#666]">November 8, 2008</p>
                </div>
                <span className="text-xs bg-[#10b981] text-white px-2 py-1 rounded">$5</span>
              </div>
              <div className="bg-[#222] p-3 rounded flex justify-between items-center">
                <div>
                  <p className="text-white font-bold">Open Mic Night</p>
                  <p className="text-xs text-[#666]">November 15, 2008</p>
                </div>
                <span className="text-xs bg-[#10b981] text-white px-2 py-1 rounded">FREE</span>
              </div>
              <div className="bg-[#222] p-3 rounded flex justify-between items-center">
                <div>
                  <p className="text-white font-bold">Local Bands Showcase</p>
                  <p className="text-xs text-[#666]">December 1, 2008</p>
                </div>
                <span className="text-xs bg-[#10b981] text-white px-2 py-1 rounded">$8</span>
              </div>
            </div>
          </section>

          <div className="bg-[#1a2a1a] p-4 rounded border border-[#2a4a2a]">
            <p className="text-[#4ade80] font-bold text-sm">ARCHIVIST NOTE:</p>
            <p className="text-xs text-[#aaa] mt-2">
              This was before the 2015 relocation, before the noise complaints,
              before the legendary shows. Neon Requiem's first gig mentioned here
              would later be described as "the night post-punk came to Westbrook."
              Capacity: 50 people. Attendance that night: 12.
            </p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'quantumcoffee-reddit',
    url: 'www.threadit.corn/r/quantumcoffee',
    title: 'r/quantumcoffee Before Derek Found It (2019)',
    category: 'Social Media',
    savedCount: 84,
    firstArchived: 'August 3, 2019',
    lastArchived: 'November 15, 2019',
    snapshots: [
      { date: 'August 3, 2019', timestamp: 1564790400, available: true },
      { date: 'September 20, 2019', timestamp: 1568937600, available: true },
      { date: 'November 15, 2019', timestamp: 1573776000, available: true, note: 'Last pre-Derek archive' },
    ],
    description: 'A quiet community of 12 members, before everything changed',
    currentContent: (
      <div className="bg-[#DAE0E6] p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-t p-4 border-b border-[#ccc]">
            <div className="flex items-center gap-3">
              <span className="text-3xl">☕</span>
              <div>
                <h1 className="text-xl font-bold text-[#1c1c1c]">r/quantumcoffee</h1>
                <p className="text-xs text-[#7c7c7c]">12 members - Created Jan 2019</p>
              </div>
            </div>
            <p className="text-sm text-[#7c7c7c] mt-2">
              A small community for discussing the science of quantum-level coffee brewing.
              Speculation and friendly discussion welcome!
            </p>
          </div>

          <div className="space-y-2 mt-2">
            <div className="bg-white p-3 rounded">
              <div className="flex items-start gap-2">
                <div className="flex flex-col items-center text-xs text-[#7c7c7c]">
                  <button className="hover:text-[#FF4500]">^</button>
                  <span>3</span>
                  <button className="hover:text-[#7193FF]">v</button>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-[#1c1c1c]">
                    Has anyone actually tried the Quantum Brew Cafe? Is it worth the price?
                  </p>
                  <p className="text-xs text-[#7c7c7c] mt-1">
                    Posted by u/coffee_curious42 - 2 months ago
                  </p>
                  <div className="text-xs text-[#7c7c7c] mt-2 pl-4 border-l-2 border-[#ccc]">
                    <p className="mb-2">
                      <span className="text-[#0079D3]">u/bean_scientist:</span> I went last week.
                      The coffee is good but I'm not sure about the "quantum" claims. Still,
                      nice atmosphere and the baristas are friendly.
                    </p>
                    <p>
                      <span className="text-[#0079D3]">u/coffee_curious42:</span> Thanks! Might
                      check it out this weekend.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-3 rounded">
              <div className="flex items-start gap-2">
                <div className="flex flex-col items-center text-xs text-[#7c7c7c]">
                  <button className="hover:text-[#FF4500]">^</button>
                  <span>5</span>
                  <button className="hover:text-[#7193FF]">v</button>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-[#1c1c1c]">
                    Weekly Discussion: What's everyone brewing this week?
                  </p>
                  <p className="text-xs text-[#7c7c7c] mt-1">
                    Posted by u/mod_elena - 3 months ago
                  </p>
                  <p className="text-xs text-[#7c7c7c] mt-2 italic">
                    [12 comments - all friendly, no capslock]
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-3 rounded">
              <div className="flex items-start gap-2">
                <div className="flex flex-col items-center text-xs text-[#7c7c7c]">
                  <button className="hover:text-[#FF4500]">^</button>
                  <span>2</span>
                  <button className="hover:text-[#7193FF]">v</button>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-[#1c1c1c]">
                    [Question] ELI5 the Martinez Study?
                  </p>
                  <p className="text-xs text-[#7c7c7c] mt-1">
                    Posted by u/newbie_brewer - 4 months ago
                  </p>
                  <p className="text-xs text-[#7c7c7c] mt-2 italic">
                    [3 helpful, measured responses explaining the science]
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded mt-4">
            <h2 className="text-sm font-bold text-[#1c1c1c] mb-2">Subreddit Rules</h2>
            <ol className="text-xs text-[#7c7c7c] list-decimal list-inside space-y-1">
              <li>Be respectful to other members</li>
              <li>No spam or self-promotion</li>
              <li>Keep discussions on-topic</li>
              <li>Have fun!</li>
            </ol>
          </div>

          <div className="bg-[#FFE4E1] p-4 rounded mt-4 border border-[#CD5C5C]">
            <p className="text-sm text-[#8B0000] font-bold">
              THIS SUBREDDIT'S CHARACTER CHANGED SIGNIFICANTLY AFTER THIS ARCHIVE
            </p>
            <p className="text-xs text-[#8B0000] mt-2">
              Shortly after November 2019, a user named "QuantumDerek847" joined and
              began posting 15-20 times daily. Within 3 months, the subreddit grew
              from 12 to 4,700 members. The mod team resigned. Current top post is
              "WHY DR. MARTINEZ DESERVES THE NOBEL PRIZE (and why Big Coffee is
              SUPPRESSING HER RESEARCH)" with 847 awards.
            </p>
            <p className="text-xs text-[#666] mt-2 italic">
              Last archived version description from u/mod_elena: "Nice community :)"
            </p>
          </div>
        </div>
      </div>
    ),
  },
]

// ============================================================================
// Collection Categories
// ============================================================================

const COLLECTIONS = [
  { id: 'all', name: 'All Archives', icon: '📚', count: ARCHIVED_PAGES.length },
  { id: 'removed', name: 'Removed Content', icon: '🚫', count: ARCHIVED_PAGES.filter(p => p.removalNotice).length },
  { id: 'historical', name: 'Historical', icon: '📜', count: ARCHIVED_PAGES.filter(p => p.category === 'Historical').length },
  { id: 'personal', name: 'Personal Sites', icon: '👤', count: ARCHIVED_PAGES.filter(p => p.category === 'Personal' || p.category === 'Personal Blog').length },
  { id: 'business', name: 'Business', icon: '🏢', count: ARCHIVED_PAGES.filter(p => p.category === 'Business' || p.category === 'Cryptocurrency').length },
  { id: 'media', name: 'Media & Social', icon: '🎬', count: ARCHIVED_PAGES.filter(p => p.category === 'Media' || p.category === 'Social Media').length },
  { id: 'music', name: 'Music & Venues', icon: '🎵', count: ARCHIVED_PAGES.filter(p => p.category === 'Music Venues').length },
]

// ============================================================================
// Main Component
// ============================================================================

export function CornArchiveSite({ siteId, onNavigate }: SiteProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPage, setSelectedPage] = useState<ArchivedPage | null>(null)
  const [selectedSnapshot, setSelectedSnapshot] = useState<number>(0)
  const [activeCollection, setActiveCollection] = useState('all')

  // Running ticker count (animated illusion)
  const [tickerCount] = useState(847847847)

  const filteredPages = ARCHIVED_PAGES.filter(page => {
    const matchesSearch = searchQuery === '' ||
      page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      page.url.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCollection = activeCollection === 'all' ||
      (activeCollection === 'removed' && page.removalNotice) ||
      (activeCollection === 'historical' && page.category === 'Historical') ||
      (activeCollection === 'personal' && (page.category === 'Personal' || page.category === 'Personal Blog')) ||
      (activeCollection === 'business' && (page.category === 'Business' || page.category === 'Cryptocurrency')) ||
      (activeCollection === 'media' && (page.category === 'Media' || page.category === 'Social Media')) ||
      (activeCollection === 'music' && page.category === 'Music Venues')

    return matchesSearch && matchesCollection
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
  }

  const handlePageSelect = (page: ArchivedPage) => {
    setSelectedPage(page)
    setSelectedSnapshot(0)
  }

  const handleBack = () => {
    setSelectedPage(null)
    setSelectedSnapshot(0)
  }

  return (
    <div className="min-h-full" style={{ background: site.theme.background }}>
      {/* Header */}
      <header style={{ background: site.theme.headerBg, borderBottom: `3px solid ${site.theme.primary}` }}>
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 cursor-pointer" onClick={handleBack}>
              <span className="text-4xl">{site.icon}</span>
              <div>
                <h1 className="text-2xl font-bold" style={{ color: site.theme.primary }}>
                  {site.name}
                </h1>
                <p className="text-xs" style={{ color: site.theme.textMuted }}>
                  {site.tagline}
                </p>
              </div>
            </div>

            <form onSubmit={handleSearch} className="flex-1 max-w-md mx-8">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search archived URLs..."
                  className="w-full px-4 py-2 text-sm rounded border-2 focus:outline-none"
                  style={{
                    borderColor: site.theme.primary,
                    background: '#fff',
                    color: site.theme.text,
                  }}
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1"
                  style={{ color: site.theme.primary }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </form>

            <div className="text-right">
              <p className="text-xs" style={{ color: site.theme.textMuted }}>Pages Archived</p>
              <p className="text-lg font-bold font-mono" style={{ color: site.theme.primary }}>
                {tickerCount.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Running Ticker */}
        <div className="overflow-hidden py-1" style={{ background: site.theme.primary }}>
          <div className="animate-marquee whitespace-nowrap text-white text-xs">
            <span className="mx-8">847,847,847 pages archived and counting</span>
            <span className="mx-8">Preserving the internet since 2004</span>
            <span className="mx-8">847,847,847 pages archived and counting</span>
            <span className="mx-8">The web never forgets (except when it does)</span>
            <span className="mx-8">847,847,847 pages archived and counting</span>
          </div>
        </div>
      </header>

      {selectedPage ? (
        // Archive View
        <div className="max-w-6xl mx-auto px-4 py-6">
          {/* Navigation breadcrumb */}
          <div className="mb-4">
            <button
              onClick={handleBack}
              className="text-sm hover:underline flex items-center gap-1"
              style={{ color: site.theme.primary }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to search
            </button>
          </div>

          {/* Archive header */}
          <div className="p-4 rounded-t border-2" style={{ background: site.theme.surface, borderColor: site.theme.border }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-mono mb-1" style={{ color: site.theme.textMuted }}>
                  {selectedPage.url}
                </p>
                <h2 className="text-xl font-bold" style={{ color: site.theme.text }}>
                  {selectedPage.title}
                </h2>
                <div className="flex items-center gap-4 mt-2 text-xs" style={{ color: site.theme.textMuted }}>
                  <span>Category: {selectedPage.category}</span>
                  <span>|</span>
                  <span>Saved {selectedPage.savedCount} times</span>
                  <span>|</span>
                  <span>First archived: {selectedPage.firstArchived}</span>
                </div>
              </div>
            </div>

            {/* Removal Notice */}
            {selectedPage.removalNotice && (
              <div className="mt-4 p-3 rounded" style={{ background: '#FFF3CD', border: '1px solid #FFC107' }}>
                <p className="text-sm font-bold" style={{ color: '#856404' }}>
                  NOTICE: This page has been removed at the request of {selectedPage.removalNotice.requester}
                </p>
                <p className="text-xs mt-1" style={{ color: '#856404' }}>
                  Reason: {selectedPage.removalNotice.reason}
                </p>
                <p className="text-xs" style={{ color: '#856404' }}>
                  Date of request: {selectedPage.removalNotice.date}
                </p>
                <p className="text-xs mt-2 italic" style={{ color: '#666' }}>
                  Archived version shown for historical purposes only.
                </p>
              </div>
            )}
          </div>

          {/* Timeline slider */}
          <div className="p-4 border-x-2 border-b-2" style={{ background: '#E8F4F8', borderColor: site.theme.border }}>
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold" style={{ color: site.theme.primary }}>TIMELINE</span>
              <div className="flex-1 relative">
                <input
                  type="range"
                  min={0}
                  max={selectedPage.snapshots.length - 1}
                  value={selectedSnapshot}
                  onChange={(e) => setSelectedSnapshot(parseInt(e.target.value))}
                  className="w-full"
                  style={{ accentColor: site.theme.primary }}
                />
                <div className="flex justify-between mt-1">
                  {selectedPage.snapshots.map((snap, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedSnapshot(idx)}
                      className={`text-xs px-2 py-1 rounded ${idx === selectedSnapshot ? 'font-bold' : ''}`}
                      style={{
                        background: idx === selectedSnapshot ? site.theme.primary : 'transparent',
                        color: idx === selectedSnapshot ? '#fff' : site.theme.textMuted,
                      }}
                    >
                      {snap.date}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {selectedPage.snapshots[selectedSnapshot]?.note && (
              <p className="text-xs mt-2 italic" style={{ color: site.theme.textMuted }}>
                Note: {selectedPage.snapshots[selectedSnapshot].note}
              </p>
            )}
            {!selectedPage.snapshots[selectedSnapshot]?.available && (
              <p className="text-xs mt-2 font-bold" style={{ color: '#DC3545' }}>
                This snapshot is not available for viewing.
              </p>
            )}
          </div>

          {/* Archived content */}
          <div
            className="border-2 border-t-0 rounded-b overflow-hidden"
            style={{ borderColor: site.theme.border }}
          >
            {selectedPage.snapshots[selectedSnapshot]?.available ? (
              <div className="archive-content">
                {selectedPage.currentContent}
              </div>
            ) : (
              <div className="p-12 text-center" style={{ background: '#f5f5f5' }}>
                <span className="text-4xl">📦</span>
                <p className="mt-4 font-bold" style={{ color: site.theme.text }}>
                  Snapshot Unavailable
                </p>
                <p className="text-sm" style={{ color: site.theme.textMuted }}>
                  This archived version cannot be displayed due to data corruption or storage issues.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        // Browse View
        <main className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex gap-6">
            {/* Sidebar - Collections */}
            <aside className="w-64 shrink-0">
              <div className="p-4 rounded" style={{ background: site.theme.surface, border: `1px solid ${site.theme.border}` }}>
                <h3 className="font-bold mb-3" style={{ color: site.theme.text }}>Collections</h3>
                <ul className="space-y-1">
                  {COLLECTIONS.map(collection => (
                    <li key={collection.id}>
                      <button
                        onClick={() => setActiveCollection(collection.id)}
                        className="w-full text-left px-3 py-2 rounded text-sm flex items-center justify-between transition-colors"
                        style={{
                          background: activeCollection === collection.id ? site.theme.primary : 'transparent',
                          color: activeCollection === collection.id ? '#fff' : site.theme.text,
                        }}
                      >
                        <span>
                          {collection.icon} {collection.name}
                        </span>
                        <span className="text-xs opacity-70">{collection.count}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Stats box */}
              <div className="mt-4 p-4 rounded" style={{ background: site.theme.surface, border: `1px solid ${site.theme.border}` }}>
                <h3 className="font-bold mb-3" style={{ color: site.theme.text }}>Archive Stats</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span style={{ color: site.theme.textMuted }}>Total Pages:</span>
                    <span className="font-bold" style={{ color: site.theme.text }}>847,847,847</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: site.theme.textMuted }}>Snapshots:</span>
                    <span className="font-bold" style={{ color: site.theme.text }}>2.4 billion</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: site.theme.textMuted }}>Storage:</span>
                    <span className="font-bold" style={{ color: site.theme.text }}>847 petabytes</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: site.theme.textMuted }}>Removed:</span>
                    <span className="font-bold" style={{ color: site.theme.text }}>847 requests</span>
                  </div>
                </div>
              </div>

              {/* About box */}
              <div className="mt-4 p-4 rounded" style={{ background: '#E8F4F8', border: `1px solid ${site.theme.border}` }}>
                <h3 className="font-bold mb-2" style={{ color: site.theme.primary }}>About CornArchive</h3>
                <p className="text-xs" style={{ color: site.theme.text }}>
                  Founded in 2004, CornArchive preserves the digital heritage of
                  the internet, one page at a time. We believe the web should never
                  forget - even when everyone wishes it would.
                </p>
              </div>
            </aside>

            {/* Main content - Results */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold" style={{ color: site.theme.text }}>
                  {activeCollection === 'all' ? 'All Archived Pages' : COLLECTIONS.find(c => c.id === activeCollection)?.name}
                </h2>
                <span className="text-sm" style={{ color: site.theme.textMuted }}>
                  {filteredPages.length} results
                </span>
              </div>

              <div className="space-y-3">
                {filteredPages.map(page => (
                  <div
                    key={page.id}
                    onClick={() => handlePageSelect(page)}
                    className="p-4 rounded cursor-pointer transition-all hover:shadow-md"
                    style={{
                      background: site.theme.surface,
                      border: `1px solid ${site.theme.border}`,
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-xs font-mono mb-1" style={{ color: site.theme.primary }}>
                          {page.url}
                        </p>
                        <h3 className="font-bold" style={{ color: site.theme.text }}>
                          {page.title}
                        </h3>
                        {page.description && (
                          <p className="text-sm mt-1" style={{ color: site.theme.textMuted }}>
                            {page.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-xs" style={{ color: site.theme.textMuted }}>
                          <span className="px-2 py-0.5 rounded" style={{ background: site.theme.background }}>
                            {page.category}
                          </span>
                          <span>{page.snapshots.length} snapshots</span>
                          <span>Saved {page.savedCount} times</span>
                        </div>
                      </div>
                      {page.removalNotice && (
                        <span
                          className="text-xs px-2 py-1 rounded font-bold"
                          style={{ background: '#FFC107', color: '#856404' }}
                        >
                          REMOVED
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {filteredPages.length === 0 && (
                <div className="p-12 text-center rounded" style={{ background: site.theme.surface }}>
                  <span className="text-4xl">🔍</span>
                  <p className="mt-4 font-bold" style={{ color: site.theme.text }}>
                    No archived pages found
                  </p>
                  <p className="text-sm" style={{ color: site.theme.textMuted }}>
                    Try adjusting your search or browse a different collection.
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      )}

      {/* Footer */}
      <footer
        className="mt-8 py-6 text-center text-xs"
        style={{ background: site.theme.headerBg, borderTop: `3px solid ${site.theme.primary}` }}
      >
        <p style={{ color: site.theme.text }}>
          CornArchive is a non-profit digital library dedicated to preserving the internet.
        </p>
        <p className="mt-1" style={{ color: site.theme.textMuted }}>
          "The web forgets nothing. Neither do we."
        </p>
        <div className="mt-4 flex items-center justify-center gap-6">
          <button className="hover:underline" style={{ color: site.theme.primary }}>About</button>
          <button className="hover:underline" style={{ color: site.theme.primary }}>Donate</button>
          <button className="hover:underline" style={{ color: site.theme.primary }}>Blog</button>
          <button className="hover:underline" style={{ color: site.theme.primary }}>Contact</button>
          <button className="hover:underline" style={{ color: site.theme.primary }}>API</button>
        </div>
        <p className="mt-4" style={{ color: site.theme.textMuted }}>
          All content archived for historical and educational purposes.
          Archived {new Date().getFullYear()} CornArchive.
        </p>
      </footer>

      {/* CSS for marquee animation */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
          display: inline-block;
        }
      `}</style>
    </div>
  )
}

export default CornArchiveSite
