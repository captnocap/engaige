/**
 * Browser Site Container
 *
 * Routes to the appropriate site component based on siteId.
 */

import { getApp } from '../../config/app-registry.js'
import { PlaceholderSite } from './sites/PlaceholderSite.js'
import { MyFaceSite } from './sites/MyFaceSite.js'
import { InstaSnapSite } from './sites/InstaSnapSite.js'
import { WikiKnowSite } from './sites/WikiKnowSite.js'
import { ThreaditSite } from './sites/ThreaditSite.js'
import { DailyBuzzSite } from './sites/DailyBuzzSite.js'
import { VidTubeSite } from './sites/VidTubeSite.js'
import { ForChanSite } from './sites/ForChanSite.js'
import { VitalityRxSite } from './sites/VitalityRxSite.js'
import { NestFinderSite } from './sites/NestFinderSite.js'
import { BargainBaySite } from './sites/BargainBaySite.js'
import { OddsOracleSite } from './sites/OddsOracleSite.js'
import { StrangerZoneSite } from './sites/StrangerZoneSite.js'
import { WealthWisdomSite } from './sites/WealthWisdomSite.js'
// Easter egg sites
import { PopupHellSite } from './sites/PopupHellSite.js'
import { MillionPixelsSite } from './sites/MillionPixelsSite.js'
import { QuantumBrewBlogSite } from './sites/QuantumBrewBlogSite.js'
import { HartwellFilesSite } from './sites/HartwellFilesSite.js'
import { TrustFallTimSite } from './sites/TrustFallTimSite.js'
import { OnlyFansSite } from './sites/OnlyFansSite.js'

interface BrowserSiteContainerProps {
  siteId: string
  onNavigate: (appId: string) => void
}

export interface SiteProps {
  siteId: string
  onNavigate: (appId: string) => void
}

// Map site IDs to components - PlaceholderSite used for unimplemented sites
const SITE_COMPONENTS: Record<string, React.ComponentType<SiteProps>> = {
  'myface': MyFaceSite,
  'myface-chat': MyFaceSite, // Chat is part of MyFace
  'instasnap': InstaSnapSite, // Instagram clone
  // Filler content sites
  'wikiknow': WikiKnowSite,
  'threadit': ThreaditSite,
  'dailybuzz': DailyBuzzSite,
  'vidtube': VidTubeSite,
  'forchan': ForChanSite,
  'vitalityrx': VitalityRxSite,
  'nestfinder': NestFinderSite,
  'bargainbay': BargainBaySite,
  'oddsoracle': OddsOracleSite,
  'strangerzone': StrangerZoneSite,
  'wealthwisdom': WealthWisdomSite,
  // Easter egg sites
  'popuphell': PopupHellSite,
  'millionpixels': MillionPixelsSite,
  'quantumbrewblog': QuantumBrewBlogSite,
  'hartwellfiles': HartwellFilesSite,
  'trustfalltim': TrustFallTimSite,
  'onlyfans': OnlyFansSite,
  // All other sites use PlaceholderSite until implemented
}

export function BrowserSiteContainer({ siteId, onNavigate }: BrowserSiteContainerProps) {
  const app = getApp(siteId)
  const SiteComponent = SITE_COMPONENTS[siteId] || PlaceholderSite

  if (!app) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-6xl mb-4">🔍</p>
          <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
            Site Not Found
          </h2>
          <p style={{ color: 'var(--color-textMuted)' }}>
            We couldn't find that website.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto">
      <SiteComponent siteId={siteId} onNavigate={onNavigate} />
    </div>
  )
}

export default BrowserSiteContainer
