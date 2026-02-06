/**
 * MillionPixels Site
 *
 * A parody of the famous Million Dollar Homepage.
 * Features a grid of bizarre, absurd pixel ad blocks that reference game lore.
 */

import { useState, useMemo } from 'react'
import type { SiteProps } from '../BrowserSiteContainer.js'
import { FILLER_SITES } from '../../../config/filler-sites.js'
import { StyledCard, Button } from '../../ui/shared/index.js'
import { useSiteContent, type SiteContentItem } from '../../../hooks/useSiteContent.js'

const site = FILLER_SITES.millionpixels

// ============================================================================
// Types
// ============================================================================

interface PixelBlock {
  id: string
  x: number
  y: number
  width: number
  height: number
  color: string
  gradient?: string
  emoji?: string
  text?: string
  subtext?: string
  url?: string
  category: 'lore' | 'absurd' | 'scam' | 'meme' | 'local' | 'meta'
}

// ============================================================================
// Pixel Block Data
// ============================================================================


// ============================================================================
// DB → Local Adapter
// ============================================================================

/**
 * Maps a SiteContentItem from the database to the local PixelBlock interface.
 * Grid position, dimensions, colors, and display text stored in metadata.
 */
function dbToPixelBlock(item: SiteContentItem): PixelBlock {
  const m = item.metadata || {}
  return {
    id: item.slug,
    x: m.x ?? 0,
    y: m.y ?? 0,
    width: m.width ?? 1,
    height: m.height ?? 1,
    color: m.color || '#ccc',
    gradient: m.gradient,
    emoji: item.thumbnailEmoji || m.emoji,
    text: item.title || m.text,
    subtext: item.subtitle || m.subtext,
    url: m.url,
    category: (item.category || m.category || 'meta') as PixelBlock['category'],
  }
}

// ============================================================================
// Components
// ============================================================================

const CELL_SIZE = 50 // pixels per grid cell
const GRID_COLS = 10
const GRID_ROWS = 10

interface PixelBlockComponentProps {
  block: PixelBlock
  isSelected: boolean
  onSelect: () => void
}

function PixelBlockComponent({ block, isSelected, onSelect }: PixelBlockComponentProps) {
  const style: React.CSSProperties = {
    position: 'absolute',
    left: block.x * CELL_SIZE,
    top: block.y * CELL_SIZE,
    width: block.width * CELL_SIZE,
    height: block.height * CELL_SIZE,
    background: block.gradient || block.color || '#ccc',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4px',
    overflow: 'hidden',
    border: isSelected ? '3px solid #FFD700' : '1px solid rgba(0,0,0,0.3)',
    boxSizing: 'border-box',
    transition: 'transform 0.1s, box-shadow 0.1s',
    boxShadow: isSelected ? '0 0 20px rgba(255,215,0,0.5)' : 'none',
  }

  const textColor = block.color && parseInt(block.color.slice(1), 16) < 0x888888 ? '#fff' : '#000'

  return (
    <div
      style={style}
      onClick={onSelect}
      className="hover:scale-105 hover:z-10"
    >
      {block.emoji && (
        <span style={{ fontSize: block.height > 1 ? '24px' : '16px' }}>
          {block.emoji}
        </span>
      )}
      {block.text && (
        <span
          className="font-bold text-center leading-tight"
          style={{
            fontSize: block.width > 1 ? (block.height > 1 ? '10px' : '8px') : '6px',
            color: textColor,
            textShadow: '1px 1px 1px rgba(0,0,0,0.5)',
          }}
        >
          {block.text}
        </span>
      )}
      {block.subtext && block.height > 1 && (
        <span
          className="text-center leading-tight opacity-80"
          style={{
            fontSize: '7px',
            color: textColor,
          }}
        >
          {block.subtext}
        </span>
      )}
    </div>
  )
}

// ============================================================================
// Main Site
// ============================================================================

export function MillionPixelsSite({ siteId }: SiteProps) {
  const { content: dbContent } = useSiteContent('millionpixels')

  const pixelBlocks = useMemo(() => dbContent.map(dbToPixelBlock), [dbContent])

  const [selectedBlock, setSelectedBlock] = useState<PixelBlock | null>(null)
  const [soldCount] = useState(() => Math.floor(Math.random() * 50000) + 950000)

  return (
    <div className="min-h-full" style={{ background: '#1a1a1a' }}>
      {/* Header */}
      <div className="text-center py-4 px-2" style={{ background: '#0a0a0a' }}>
        <h1 className="text-3xl font-bold text-white mb-1">
          💰 {site?.name || 'MillionPixels'} 💰
        </h1>
        <p className="text-gray-400 text-sm">
          The Original Million Dollar Homepage... but weirder
        </p>
        <div className="mt-2 flex justify-center gap-4 text-xs text-gray-500">
          <span>🟢 {soldCount.toLocaleString()} / 1,000,000 pixels sold</span>
          <span>💵 ${(soldCount / 100).toLocaleString()} raised</span>
          <span>📅 Since 2005</span>
        </div>
      </div>

      {/* Pixel Grid */}
      <div className="flex justify-center py-4">
        <div
          className="relative border-4 border-gray-700"
          style={{
            width: GRID_COLS * CELL_SIZE,
            height: GRID_ROWS * CELL_SIZE,
            background: 'repeating-linear-gradient(0deg, transparent, transparent 49px, #333 49px, #333 50px), repeating-linear-gradient(90deg, transparent, transparent 49px, #333 49px, #333 50px)',
          }}
        >
          {pixelBlocks.map(block => (
            <PixelBlockComponent
              key={block.id}
              block={block}
              isSelected={selectedBlock?.id === block.id}
              onSelect={() => setSelectedBlock(block)}
            />
          ))}
        </div>
      </div>

      {/* Selected Block Info */}
      {selectedBlock && (
        <StyledCard
          variant="dark"
          padding="md"
          borderRadius="lg"
          shadow="md"
          className="max-w-md mx-auto mb-4 mx-4"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-white font-bold flex items-center gap-2">
                {selectedBlock.emoji && <span>{selectedBlock.emoji}</span>}
                {selectedBlock.text || 'Untitled Block'}
              </h3>
              {selectedBlock.subtext && (
                <p className="text-gray-400 text-sm">{selectedBlock.subtext}</p>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedBlock(null)}
              textColor="#9CA3AF"
            >
              ✕
            </Button>
          </div>
          <div className="mt-2 pt-2 border-t border-gray-700 text-xs text-gray-500">
            <p>Block ID: {selectedBlock.id}</p>
            <p>Size: {selectedBlock.width * 10}x{selectedBlock.height * 10} pixels</p>
            <p>Category: {selectedBlock.category}</p>
            <p className="mt-2 text-yellow-500">
              💰 This block is worth ${(selectedBlock.width * selectedBlock.height * 10).toLocaleString()}
            </p>
          </div>
        </StyledCard>
      )}

      {/* Stats & Info */}
      <div className="max-w-2xl mx-auto px-4 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Pixels Sold', value: soldCount.toLocaleString(), emoji: '🟢' },
            { label: 'Revenue', value: `$${(soldCount / 100).toLocaleString()}`, emoji: '💵' },
            { label: 'Advertisers', value: pixelBlocks.length.toString(), emoji: '🏪' },
            { label: 'Dead Links', value: '47%', emoji: '💀' },
          ].map((stat, i) => (
            <StyledCard
              key={i}
              variant="dark"
              padding="sm"
              borderRadius="md"
              shadow="sm"
              className="text-center"
            >
              <div className="text-2xl">{stat.emoji}</div>
              <div className="text-white font-bold">{stat.value}</div>
              <div className="text-gray-500 text-xs">{stat.label}</div>
            </StyledCard>
          ))}
        </div>

        <StyledCard
          variant="dark"
          padding="md"
          borderRadius="lg"
          shadow="md"
          className="mb-4"
        >
          <h2 className="text-white font-bold mb-2">🤔 What is this?</h2>
          <p className="text-gray-400 text-sm">
            Inspired by the original Million Dollar Homepage (2005), this is a collection
            of the finest pixel advertisements the fake internet has to offer. From legitimate
            local businesses to obvious scams, from beloved local bands to cryptic lore...
            it's all here.
          </p>
        </StyledCard>

        <StyledCard
          variant="dark"
          padding="md"
          borderRadius="lg"
          shadow="md"
          className="mb-4"
        >
          <h2 className="text-white font-bold mb-2">💰 Buy Your Own Pixel!</h2>
          <p className="text-gray-400 text-sm mb-3">
            Only $1 per pixel! Minimum purchase: 10x10 block ($100)
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="success"
              size="sm"
              width="full"
              backgroundColor="#16a34a"
              hoverColor="#15803d"
            >
              Buy Pixels ($100)
            </Button>
            <Button
              variant="primary"
              size="sm"
              width="full"
              backgroundColor="#b45309"
              hoverColor="#92400e"
            >
              Premium Block ($500)
            </Button>
          </div>
          <p className="text-gray-600 text-xs mt-2 text-center">
            Payment accepted: Cryptocurrency, Gift Cards, Exposure
          </p>
        </StyledCard>

        <StyledCard
          variant="dark"
          padding="md"
          borderRadius="lg"
          shadow="md"
        >
          <h2 className="text-white font-bold mb-2">📜 Hall of Fame</h2>
          <div className="space-y-2 text-sm">
            {[
              { name: 'Quantum Coffee Co.', amount: '$300', date: '2024' },
              { name: 'Trust Fall Tim', amount: '$200', date: '2024' },
              { name: 'Definitely Not A Scam LLC', amount: '$500', date: '2023' },
              { name: 'Anonymous', amount: '$100', date: '2023' },
              { name: 'www.angelfire.com/~xXdarkXx', amount: '$100 (BOUNCED)', date: '2005' },
            ].map((donor, i) => (
              <div key={i} className="flex justify-between text-gray-400">
                <span>{donor.name}</span>
                <span className="text-green-400">{donor.amount}</span>
              </div>
            ))}
          </div>
        </StyledCard>
      </div>

      {/* Footer */}
      <div className="text-center py-4 text-xs text-gray-600 border-t border-gray-800">
        <p>© 2005-∞ {site?.name || 'MillionPixels'}. Inspired by Alex Tew.</p>
        <p>All links are probably broken. That's the charm.</p>
      </div>
    </div>
  )
}

export default MillionPixelsSite
