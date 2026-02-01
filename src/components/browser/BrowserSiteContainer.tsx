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
import { CornStalkBlogSite } from './sites/CornStalkBlogSite.js'
import { JennifersBlogSite } from './sites/JennifersBlogSite.js'
import { ElenasBlogSite } from './sites/ElenasBlogSite.js'
import { VenuePoetBlogSite } from './sites/VenuePoetBlogSite.js'
import { HartwellFilesSite } from './sites/HartwellFilesSite.js'
import { TrustFallTimSite } from './sites/TrustFallTimSite.js'
import { TimsMomBlogSite } from './sites/TimsMomBlogSite.js'
import { OnlyFansSite } from './sites/OnlyFansSite.js'
import { BandsNotInTownSite } from './sites/BandsNotInTownSite.js'
import { GrainTruthSite } from './sites/GrainTruthSite.js'
import { HuskReviewsSite } from './sites/HuskReviewsSite.js'
import { KernelPodsSite } from './sites/KernelPodsSite.js'
import { CornHubSite } from './sites/CornHubSite.js'
import { PasteLiveSite } from './sites/PasteLiveSite.js'
import { CobCoinSite } from './sites/CobCoinSite.js'
import { OnlyFarmsSite } from './sites/OnlyFarmsSite.js'
import { CorndrSite } from './sites/CorndrSite.js'
import { StalkSite } from './sites/StalkSite.js'
import { LinkedCornSite } from './sites/LinkedCornSite.js'
import { CornMDSite } from './sites/CornMDSite.js'
import { CornMapsSite } from './sites/CornMapsSite.js'
// Unhinged persona sites
import { BenchWatchSite } from './sites/BenchWatchSite.js'
import { DominateSite } from './sites/DominateSite.js'
import { StationSushiSite } from './sites/StationSushiSite.js'
import { TrueMossSite } from './sites/TrueMossSite.js'
// Q&A site
import { AskCornSite } from './sites/AskCornSite.js'
// Crowdfunding parody
import { CobFundMeSite } from './sites/CobFundMeSite.js'
// GitHub parody
import { CobHubSite } from './sites/CobHubSite.js'
// Anonymous dead drop
import { DeadDropSite } from './sites/DeadDropSite.js'
// Amazon parody
import { AmaizeSite } from './sites/AmaizeSite.js'
// Dark web corn silk parody
import { SilkRoadSite } from './sites/SilkRoadSite.js'
// Internet Archive parody
import { CornArchiveSite } from './sites/CornArchiveSite.js'
// Dr. Elena Martinez's blog - physicist whose paper was misinterpreted
import { MartinezBlogSite } from './sites/MartinezBlogSite.js'
// Big Mike's aggressively normal blog
import { BigMikeBlogSite } from './sites/BigMikeBlogSite.js'
// Musician denial blog
import { VexDrumsBlogSite } from './sites/VexDrumsBlogSite.js'
// Patricia's sinister corporate HR blog
import { PatriciaBlogSite } from './sites/PatriciaBlogSite.js'
// Gary's defiant Wonderwall blog
import { WonderwallWarriorSite } from './sites/WonderwallWarriorSite.js'
// Mysterious Floor 13 entity blog
import { Floor13BlogSite } from './sites/Floor13BlogSite.js'

interface BrowserSiteContainerProps {
  siteId: string
  path: string | null
  onNavigate: (appId: string) => void
  onPathChange: (path: string | null) => void
}

export interface SiteProps {
  siteId: string
  path: string | null  // Current path from URL (e.g., "/r/coffee", "/profile/123")
  onNavigate: (appId: string) => void
  onPathChange: (path: string | null) => void  // Callback to update URL when internal state changes
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
  'cornstalkblog': CornStalkBlogSite,
  'jennifersblog': JennifersBlogSite,
  'elenasblog': ElenasBlogSite,
  'venuepoetryblog': VenuePoetBlogSite,
  'hartwellfiles': HartwellFilesSite,
  'trustfalltim': TrustFallTimSite,
  'timsmomsupport': TimsMomBlogSite,
  'onlyfans': OnlyFansSite,
  'bandsnotintown': BandsNotInTownSite,
  'graintruth': GrainTruthSite,
  'huskreviews': HuskReviewsSite,
  'kernelpods': KernelPodsSite,
  'cornhub': CornHubSite,
  'pastelive': PasteLiveSite,
  'cobcoin': CobCoinSite,
  'onlyfarms': OnlyFarmsSite,
  'corndr': CorndrSite,
  'stalk': StalkSite,
  'linkedcorn': LinkedCornSite,
  'cornmd': CornMDSite,
  'cornmaps': CornMapsSite,
  // Unhinged persona sites
  'benchwatch': BenchWatchSite,
  'dominate': DominateSite,
  'stationsushi': StationSushiSite,
  'truemoss': TrueMossSite,
  // Q&A site
  'askcorn': AskCornSite,
  // Crowdfunding parody
  'cobfundme': CobFundMeSite,
  // GitHub parody
  'cobhub': CobHubSite,
  // Anonymous dead drop
  'deaddrop': DeadDropSite,
  // Amazon parody
  'amaize': AmaizeSite,
  // Dark web corn silk parody
  'silkroad': SilkRoadSite,
  // Internet Archive parody
  'cornarchive': CornArchiveSite,
  // Dr. Elena Martinez's blog
  'drmartinezblog': MartinezBlogSite,
  // Big Mike's aggressively normal blog
  'bigmikeblog': BigMikeBlogSite,
  // Musician denial blog
  'vexdrums': VexDrumsBlogSite,
  // Patricia's sinister HR blog
  'patriciablog': PatriciaBlogSite,
  // Gary's Wonderwall defiance blog
  'wonderwallwarrior': WonderwallWarriorSite,
  // Mysterious Floor 13 entity blog
  'floor13blog': Floor13BlogSite,
  // All other sites use PlaceholderSite until implemented
}

export function BrowserSiteContainer({ siteId, path, onNavigate, onPathChange }: BrowserSiteContainerProps) {
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
      <SiteComponent siteId={siteId} path={path} onNavigate={onNavigate} onPathChange={onPathChange} />
    </div>
  )
}

export default BrowserSiteContainer
