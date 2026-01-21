/**
 * AdBanner Component
 *
 * Reusable ad component that renders cross-linking advertisements
 * between fake sites in the browser ecosystem.
 *
 * Supports multiple styles:
 * - banner: Full-width horizontal ad
 * - sidebar: Vertical sidebar ad
 * - native: Blends with content
 * - sketchy: Intentionally suspicious-looking
 */

import { useState, useEffect } from 'react'
import type { FillerAd } from '../../../config/filler-ads.js'
import { getRandomAdsForSite } from '../../../config/filler-ads.js'

// ============================================================================
// Types
// ============================================================================

interface AdBannerProps {
  /** The ad to display */
  ad: FillerAd
  /** Navigation handler from parent site */
  onNavigate: (siteId: string) => void
  /** Optional size variant */
  size?: 'small' | 'medium' | 'large'
  /** Optional className for additional styling */
  className?: string
}

interface AdSlotProps {
  /** Site ID to get ads for */
  siteId: string
  /** Navigation handler from parent site */
  onNavigate: (siteId: string) => void
  /** Number of ads to show */
  count?: number
  /** Style filter */
  style?: FillerAd['style']
  /** Optional className */
  className?: string
  /** Layout direction */
  direction?: 'horizontal' | 'vertical'
}

// ============================================================================
// Single Ad Banner Component
// ============================================================================

export function AdBanner({ ad, onNavigate, size = 'medium', className = '' }: AdBannerProps) {
  const [isHovered, setIsHovered] = useState(false)

  // Sketchy ads get extra animations
  const sketchyAnimation = ad.isSketchy ? {
    animation: isHovered ? 'none' : 'pulse 2s infinite',
  } : {}

  const handleClick = () => {
    onNavigate(ad.targetSiteId)
  }

  const sizeStyles = {
    small: { padding: '8px 12px', fontSize: '12px' },
    medium: { padding: '12px 16px', fontSize: '14px' },
    large: { padding: '16px 20px', fontSize: '16px' },
  }

  // Banner style - full width horizontal
  if (ad.style === 'banner') {
    return (
      <button
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`w-full rounded-lg overflow-hidden text-left transition-all hover:scale-[1.02] hover:shadow-lg ${className}`}
        style={{
          background: ad.background,
          color: ad.textColor,
          cursor: 'pointer',
          ...sizeStyles[size],
          ...sketchyAnimation,
        }}
      >
        <div className="flex items-center gap-3">
          {ad.icon && <span className="text-2xl shrink-0">{ad.icon}</span>}
          <div className="flex-1 min-w-0">
            <p className="font-bold truncate">{ad.headline}</p>
            {ad.subtext && (
              <p className="text-sm opacity-80 truncate">{ad.subtext}</p>
            )}
          </div>
          {ad.cta && (
            <span
              className="shrink-0 px-3 py-1 rounded-full text-sm font-medium"
              style={{
                background: ad.accentColor || 'rgba(255,255,255,0.2)',
                color: ad.textColor,
              }}
            >
              {ad.cta}
            </span>
          )}
        </div>
        <AdLabel isSketchy={ad.isSketchy} />
      </button>
    )
  }

  // Sidebar style - vertical card
  if (ad.style === 'sidebar') {
    return (
      <button
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`w-full rounded-lg overflow-hidden text-left transition-all hover:scale-[1.02] hover:shadow-lg ${className}`}
        style={{
          background: ad.background,
          color: ad.textColor,
          cursor: 'pointer',
          ...sketchyAnimation,
        }}
      >
        <div className="p-4">
          {ad.icon && (
            <div className="text-4xl mb-3 text-center">{ad.icon}</div>
          )}
          <p className="font-bold text-center mb-2">{ad.headline}</p>
          {ad.subtext && (
            <p className="text-sm opacity-80 text-center mb-3">{ad.subtext}</p>
          )}
          {ad.cta && (
            <div
              className="w-full py-2 rounded text-center text-sm font-medium"
              style={{
                background: ad.accentColor || 'rgba(255,255,255,0.2)',
                color: ad.textColor,
              }}
            >
              {ad.cta}
            </div>
          )}
        </div>
        <AdLabel isSketchy={ad.isSketchy} />
      </button>
    )
  }

  // Native style - blends with content
  if (ad.style === 'native') {
    return (
      <button
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`w-full rounded-lg overflow-hidden text-left transition-all hover:bg-opacity-90 ${className}`}
        style={{
          background: ad.background,
          color: ad.textColor,
          border: `1px solid ${ad.accentColor || 'rgba(0,0,0,0.1)'}`,
          cursor: 'pointer',
          ...sizeStyles[size],
          ...sketchyAnimation,
        }}
      >
        <div className="flex items-start gap-3">
          {ad.icon && <span className="text-xl shrink-0">{ad.icon}</span>}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs opacity-60">Sponsored</span>
            </div>
            <p className="font-medium">{ad.headline}</p>
            {ad.subtext && (
              <p className="text-sm opacity-70 mt-1">{ad.subtext}</p>
            )}
            {ad.cta && (
              <span
                className="inline-block mt-2 text-sm font-medium hover:underline"
                style={{ color: ad.accentColor || ad.textColor }}
              >
                {ad.cta} &rarr;
              </span>
            )}
          </div>
        </div>
      </button>
    )
  }

  // Sketchy style - intentionally suspicious
  if (ad.style === 'sketchy' || ad.isSketchy) {
    return (
      <button
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`w-full rounded overflow-hidden text-left transition-all ${className}`}
        style={{
          background: ad.background,
          color: ad.textColor,
          border: `2px dashed ${ad.accentColor || '#ff0000'}`,
          cursor: 'pointer',
          ...sizeStyles[size],
          animation: 'pulse 1.5s infinite',
        }}
      >
        <div className="text-center">
          {ad.icon && <span className="text-3xl block mb-2">{ad.icon}</span>}
          <p className="font-bold" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
            {ad.headline}
          </p>
          {ad.subtext && (
            <p className="text-sm mt-1">{ad.subtext}</p>
          )}
          {ad.cta && (
            <div
              className="mt-2 py-1 px-4 rounded inline-block font-bold animate-bounce"
              style={{
                background: ad.accentColor || '#ffff00',
                color: '#000000',
              }}
            >
              {ad.cta}
            </div>
          )}
        </div>
      </button>
    )
  }

  // Popup style (for use in modals)
  if (ad.style === 'popup') {
    return (
      <button
        onClick={handleClick}
        className={`rounded-lg overflow-hidden text-left shadow-2xl ${className}`}
        style={{
          background: ad.background,
          color: ad.textColor,
          border: `3px solid ${ad.accentColor || '#000'}`,
          cursor: 'pointer',
        }}
      >
        <div className="p-6 text-center">
          {ad.icon && <span className="text-5xl block mb-3">{ad.icon}</span>}
          <p className="text-xl font-bold mb-2">{ad.headline}</p>
          {ad.subtext && (
            <p className="text-sm opacity-80 mb-4">{ad.subtext}</p>
          )}
          {ad.cta && (
            <div
              className="py-2 px-6 rounded-full inline-block font-bold"
              style={{
                background: ad.accentColor || '#ffffff',
                color: ad.background.includes('gradient') ? '#000' : ad.background,
              }}
            >
              {ad.cta}
            </div>
          )}
        </div>
        <AdLabel isSketchy={ad.isSketchy} />
      </button>
    )
  }

  // Default fallback
  return (
    <button
      onClick={handleClick}
      className={`w-full rounded-lg p-4 text-left transition-all hover:opacity-90 ${className}`}
      style={{
        background: ad.background,
        color: ad.textColor,
        cursor: 'pointer',
      }}
    >
      <div className="flex items-center gap-3">
        {ad.icon && <span className="text-2xl">{ad.icon}</span>}
        <div>
          <p className="font-bold">{ad.headline}</p>
          {ad.subtext && <p className="text-sm opacity-80">{ad.subtext}</p>}
        </div>
      </div>
      <AdLabel isSketchy={ad.isSketchy} />
    </button>
  )
}

// ============================================================================
// Ad Label Component (small "Ad" indicator)
// ============================================================================

function AdLabel({ isSketchy }: { isSketchy?: boolean }) {
  if (isSketchy) return null // Sketchy ads don't admit they're ads

  return (
    <div className="absolute top-1 right-1 px-1 text-[10px] opacity-50 uppercase tracking-wider">
      Ad
    </div>
  )
}

// ============================================================================
// Ad Slot Component (auto-fills with random ads)
// ============================================================================

export function AdSlot({
  siteId,
  onNavigate,
  count = 1,
  style,
  className = '',
  direction = 'vertical',
}: AdSlotProps) {
  const [ads, setAds] = useState<FillerAd[]>([])

  useEffect(() => {
    let selectedAds = getRandomAdsForSite(siteId, count * 2) // Get extra for filtering

    // Filter by style if specified
    if (style) {
      selectedAds = selectedAds.filter(ad => ad.style === style)
    }

    // Take only the count we need
    setAds(selectedAds.slice(0, count))
  }, [siteId, count, style])

  if (ads.length === 0) return null

  const containerClass = direction === 'horizontal'
    ? 'flex gap-4 overflow-x-auto'
    : 'flex flex-col gap-4'

  return (
    <div className={`${containerClass} ${className}`}>
      {ads.map((ad) => (
        <AdBanner key={ad.id} ad={ad} onNavigate={onNavigate} />
      ))}
    </div>
  )
}

// ============================================================================
// Sidebar Ad Widget (common pattern)
// ============================================================================

interface SidebarAdWidgetProps {
  siteId: string
  onNavigate: (siteId: string) => void
  title?: string
  count?: number
  className?: string
}

export function SidebarAdWidget({
  siteId,
  onNavigate,
  title = 'Sponsored',
  count = 2,
  className = '',
}: SidebarAdWidgetProps) {
  const [ads, setAds] = useState<FillerAd[]>([])

  useEffect(() => {
    setAds(getRandomAdsForSite(siteId, count))
  }, [siteId, count])

  if (ads.length === 0) return null

  return (
    <div className={`space-y-3 ${className}`}>
      <p className="text-xs uppercase tracking-wider opacity-50">{title}</p>
      {ads.map((ad) => (
        <AdBanner key={ad.id} ad={ad} onNavigate={onNavigate} size="small" />
      ))}
    </div>
  )
}

// ============================================================================
// Inline Ad Component (for between content)
// ============================================================================

interface InlineAdProps {
  siteId: string
  onNavigate: (siteId: string) => void
  className?: string
}

export function InlineAd({ siteId, onNavigate, className = '' }: InlineAdProps) {
  const [ad, setAd] = useState<FillerAd | null>(null)

  useEffect(() => {
    const ads = getRandomAdsForSite(siteId, 1)
    if (ads.length > 0) {
      // Prefer native style for inline
      const nativeAd = ads.find(a => a.style === 'native') || ads[0]
      setAd(nativeAd)
    }
  }, [siteId])

  if (!ad) return null

  return (
    <div className={`my-4 ${className}`}>
      <AdBanner ad={ad} onNavigate={onNavigate} />
    </div>
  )
}

export default AdBanner
