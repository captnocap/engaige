/**
 * Legacy Sites Registration
 *
 * Maps site components to their manifests and registers them with the router.
 *
 * The SINGLE SOURCE OF TRUTH for site metadata is in site-manifests.ts.
 * This file only maps components - no duplicate metadata!
 *
 * To add a new site:
 * 1. Add manifest in site-manifests.ts (with id, name, icon, etc.)
 * 2. Create the site component
 * 3. Add the component mapping below
 */

import React from 'react'
import { registerSite, createSimpleSite, registerManifest } from './site-registry.js'
import type { SiteComponentProps, SiteManifest } from './types.js'
import { ALL_SITE_MANIFESTS, MANIFEST_BY_ID } from '../data/site-manifests.js'

// Import all site components
import { PlaceholderSite } from '../components/browser/sites/PlaceholderSite.js'
import { MyFaceSite } from '../components/browser/sites/MyFaceSite.js'
import { InstaSnapSite } from '../components/browser/sites/InstaSnapSite.js'
import { WikiKnowSite } from '../components/browser/sites/WikiKnowSite.js'
import { ThreaditSite } from '../components/browser/sites/ThreaditSite.js'
import { DailyBuzzSite } from '../components/browser/sites/DailyBuzzSite.js'
import { VidTubeSite } from '../components/browser/sites/VidTubeSite.js'
import { ForChanSite } from '../components/browser/sites/ForChanSite.js'
import { VitalityRxSite } from '../components/browser/sites/VitalityRxSite.js'
import { NestFinderSite } from '../components/browser/sites/NestFinderSite.js'
import { BargainBaySite } from '../components/browser/sites/BargainBaySite.js'
import { OddsOracleSite } from '../components/browser/sites/OddsOracleSite.js'
import { StrangerZoneSite } from '../components/browser/sites/StrangerZoneSite.js'
import { WealthWisdomSite } from '../components/browser/sites/WealthWisdomSite.js'
import { PopupHellSite } from '../components/browser/sites/PopupHellSite.js'
import { MillionPixelsSite } from '../components/browser/sites/MillionPixelsSite.js'
import { QuantumBrewBlogSite } from '../components/browser/sites/QuantumBrewBlogSite.js'
import { CornStalkBlogSite } from '../components/browser/sites/CornStalkBlogSite.js'
import { JennifersBlogSite } from '../components/browser/sites/JennifersBlogSite.js'
import { ElenasBlogSite } from '../components/browser/sites/ElenasBlogSite.js'
import { VenuePoetBlogSite } from '../components/browser/sites/VenuePoetBlogSite.js'
import { HartwellFilesSite } from '../components/browser/sites/HartwellFilesSite.js'
import { TrustFallTimSite } from '../components/browser/sites/TrustFallTimSite.js'
import { TimsMomBlogSite } from '../components/browser/sites/TimsMomBlogSite.js'
import { OnlyFansSite } from '../components/browser/sites/OnlyFansSite.js'
import { BandsNotInTownSite } from '../components/browser/sites/BandsNotInTownSite.js'
import { GrainTruthSite } from '../components/browser/sites/GrainTruthSite.js'
import { HuskReviewsSite } from '../components/browser/sites/HuskReviewsSite.js'
import { KernelPodsSite } from '../components/browser/sites/KernelPodsSite.js'
import { CornHubSite } from '../components/browser/sites/CornHubSite.js'
import { PasteLiveSite } from '../components/browser/sites/PasteLiveSite.js'
import { CobCoinSite } from '../components/browser/sites/CobCoinSite.js'
import { OnlyFarmsSite } from '../components/browser/sites/OnlyFarmsSite.js'
import { CorndrSite } from '../components/browser/sites/CorndrSite.js'
import { StalkSite } from '../components/browser/sites/StalkSite.js'
import { LinkedCornSite } from '../components/browser/sites/LinkedCornSite.js'
import { CornMDSite } from '../components/browser/sites/CornMDSite.js'
import { CornMapsSite } from '../components/browser/sites/CornMapsSite.js'
import { BenchWatchSite } from '../components/browser/sites/BenchWatchSite.js'
import { DominateSite } from '../components/browser/sites/DominateSite.js'
import { StationSushiSite } from '../components/browser/sites/StationSushiSite.js'
import { TrueMossSite } from '../components/browser/sites/TrueMossSite.js'
import { AskCornSite } from '../components/browser/sites/AskCornSite.js'
import { CobFundMeSite } from '../components/browser/sites/CobFundMeSite.js'
import { CobHubSite } from '../components/browser/sites/CobHubSite.js'
import { DeadDropSite } from '../components/browser/sites/DeadDropSite.js'
import { AmaizeSite } from '../components/browser/sites/AmaizeSite.js'
import { SilkRoadSite } from '../components/browser/sites/SilkRoadSite.js'
import { CornArchiveSite } from '../components/browser/sites/CornArchiveSite.js'
import { MartinezBlogSite } from '../components/browser/sites/MartinezBlogSite.js'
import { BigMikeBlogSite } from '../components/browser/sites/BigMikeBlogSite.js'
import { VexDrumsBlogSite } from '../components/browser/sites/VexDrumsBlogSite.js'
import { PatriciaBlogSite } from '../components/browser/sites/PatriciaBlogSite.js'
import { WonderwallWarriorSite } from '../components/browser/sites/WonderwallWarriorSite.js'
import { Floor13BlogSite } from '../components/browser/sites/Floor13BlogSite.js'
import { SmallKevinBlogSite } from '../components/browser/sites/SmallKevinBlogSite.js'
import { GooberSite } from '../components/browser/sites/GooberSite.js'
import { CornMazeSite } from '../components/browser/sites/CornMazeSite.js'
import { CornGPTSite } from '../components/browser/sites/CornGPTSite.js'
import { StalksSite } from '../components/browser/sites/StalksSite.js'

// ============================================================================
// Component Type Definitions
// ============================================================================

type LegacySiteProps = {
  siteId: string
  path: string | null
  onNavigate: (appId: string) => void
  onPathChange: (path: string | null) => void
  onNavigateToUrl?: (url: string) => void
}

type LegacyComponent = React.ComponentType<LegacySiteProps>
type ModernComponent = React.ComponentType<SiteComponentProps>

/**
 * Adapt legacy component props to modern SiteComponentProps
 */
function adaptLegacyComponent(Component: LegacyComponent): ModernComponent {
  return function AdaptedComponent(props: SiteComponentProps) {
    return React.createElement(Component, {
      siteId: props.siteId,
      path: props.path,
      onNavigate: props.onNavigate,
      onPathChange: props.onPathChange,
      onNavigateToUrl: props.onNavigateToUrl,
    })
  }
}

// ============================================================================
// Component Mapping
// ============================================================================

/**
 * Maps site IDs to their React components.
 * Metadata comes from site-manifests.ts - this is ONLY for components.
 */
const SITE_COMPONENTS: Record<string, LegacyComponent | ModernComponent> = {
  // Social Media
  'myface': MyFaceSite,
  'instasnap': InstaSnapSite,
  'threadit': ThreaditSite,

  // Content
  'wikiknow': WikiKnowSite,
  'dailybuzz': DailyBuzzSite,
  'vidtube': VidTubeSite,
  'forchan': ForChanSite,

  // Commercial
  'amaize': AmaizeSite,
  'bargainbay': BargainBaySite,
  'nestfinder': NestFinderSite,
  'cobfundme': CobFundMeSite,
  'vitalityrx': VitalityRxSite,
  'oddsoracle': OddsOracleSite,
  'wealthwisdom': WealthWisdomSite,

  // Q&A
  'askcorn': AskCornSite,
  'huskreviews': HuskReviewsSite,

  // Tech
  'cobhub': CobHubSite,
  'kernelpods': KernelPodsSite,
  'pastelive': PasteLiveSite,

  // Parody
  'cornhub': CornHubSite,
  'onlyfans': OnlyFansSite,
  'onlyfarms': OnlyFarmsSite,
  'strangerzone': StrangerZoneSite,
  'graintruth': GrainTruthSite,
  'bandsnotintown': BandsNotInTownSite,
  'cobcoin': CobCoinSite,

  // Specialized (these use full SiteComponentProps)
  'goober': GooberSite,
  'cornmaze': CornMazeSite,
  'corngpt': CornGPTSite,
  'stalks': StalksSite,
  'cornmaps': CornMapsSite,
  'cornmd': CornMDSite,
  'linkedcorn': LinkedCornSite,
  'stalk': StalkSite,
  'corndr': CorndrSite,
  'deaddrop': DeadDropSite,
  'silkroad': SilkRoadSite,
  'cornarchive': CornArchiveSite,

  // Blogs
  'quantumbrewblog': QuantumBrewBlogSite,
  'trustfalltim': TrustFallTimSite,
  'hartwellfiles': HartwellFilesSite,
  'cornstalkblog': CornStalkBlogSite,
  'jennifersblog': JennifersBlogSite,
  'elenasblog': ElenasBlogSite,
  'venuepoetryblog': VenuePoetBlogSite,
  'timsmomsupport': TimsMomBlogSite,
  'smallkevinblog': SmallKevinBlogSite,
  'drmartinezblog': MartinezBlogSite,
  'bigmikeblog': BigMikeBlogSite,
  'vexdrums': VexDrumsBlogSite,
  'patriciablog': PatriciaBlogSite,
  'wonderwallwarrior': WonderwallWarriorSite,
  'floor13blog': Floor13BlogSite,

  // Unhinged Personas
  'benchwatch': BenchWatchSite,
  'dominate': DominateSite,
  'stationsushi': StationSushiSite,
  'truemoss': TrueMossSite,

  // Easter Eggs
  'popuphell': PopupHellSite,
  'millionpixels': MillionPixelsSite,
}

/**
 * Sites that use full SiteComponentProps (don't need adaptation)
 */
const MODERN_SITES = new Set(['goober', 'cornmaze', 'stalks'])

// ============================================================================
// Registration
// ============================================================================

/**
 * Register a site from its manifest and component
 */
function registerSiteFromManifest(manifest: SiteManifest): void {
  const component = SITE_COMPONENTS[manifest.id]

  if (!component) {
    console.warn(`[CornStack] No component found for site: ${manifest.id}`)
    return
  }

  // Adapt legacy components, use modern components as-is
  const adaptedComponent = MODERN_SITES.has(manifest.id)
    ? (component as ModernComponent)
    : adaptLegacyComponent(component as LegacyComponent)

  registerSite(createSimpleSite({
    id: manifest.id,
    domain: manifest.domain,
    name: manifest.name,
    icon: manifest.icon,
    iconImage: manifest.iconImage,
    description: manifest.homepage.description,
    component: adaptedComponent,
    keywords: manifest.homepage.keywords,
    seoScore: manifest.seoScore,
    manifest: manifest, // Pass manifest for search indexing
  }))
}

/**
 * Register all sites from manifests
 *
 * Call this once at app startup to register all sites with the router.
 */
export function registerLegacySites(): void {
  let registered = 0
  let skipped = 0

  for (const manifest of ALL_SITE_MANIFESTS) {
    if (SITE_COMPONENTS[manifest.id]) {
      registerSiteFromManifest(manifest)
      registered++
    } else {
      skipped++
    }
  }

  // Also register manifests directly for search indexing
  for (const manifest of ALL_SITE_MANIFESTS) {
    registerManifest(manifest)
  }

  console.log(`[CornStack] Registered ${registered} sites (${skipped} manifests without components)`)
  console.log(`[CornStack] Registered ${ALL_SITE_MANIFESTS.length} site manifests for search indexing`)
}

// Re-export for convenience
import { getAllSites, getAllSearchEntries, getManifestStats } from './site-registry.js'
export { getAllSites, getAllSearchEntries, getManifestStats }
