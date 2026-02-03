/**
 * Legacy Sites Registration
 *
 * Auto-registers all existing sites from the old system.
 * This provides backwards compatibility while we gradually migrate
 * sites to use proper routing.
 *
 * To migrate a site:
 * 1. Remove it from this file
 * 2. Create a proper site definition with routes in a new file
 * 3. Register it in site-definitions.ts
 */

import React from 'react'
import { registerSite, createSimpleSite, registerManifest } from './site-registry.js'
import type { SiteComponentProps } from './types.js'
import { ALL_SITE_MANIFESTS } from '../data/site-manifests.js'

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
import { CornGPTSite } from '../components/browser/sites/CornGPTSite.js'
import { StalksSite } from '../components/browser/sites/StalksSite.js'

// Type adapter: convert old SiteProps to new SiteComponentProps
// The old components use a simpler interface, this creates a compatible wrapper
type LegacySiteProps = {
  siteId: string
  path: string | null
  onNavigate: (appId: string) => void
  onPathChange: (path: string | null) => void
  onNavigateToUrl?: (url: string) => void
}

type LegacyComponent = React.ComponentType<LegacySiteProps>

function adaptLegacyComponent(Component: LegacyComponent): React.ComponentType<SiteComponentProps> {
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

/**
 * Register all legacy sites
 *
 * Call this once at app startup to make all existing sites work
 * with the new router system.
 */
export function registerLegacySites(): void {
  // =========================================================================
  // Social Media Sites
  // =========================================================================

  registerSite(createSimpleSite({
    id: 'myface',
    domain: 'myface.corn',
    name: 'MyFace',
    icon: '👤',
    iconImage: '/src/assets/icon-myface.png',
    description: 'The OG social network - profiles, Top 8, bulletins',
    component: adaptLegacyComponent(MyFaceSite),
    keywords: ['social', 'profile', 'friends', 'myspace'],
    seoScore: 80,
  }))

  registerSite(createSimpleSite({
    id: 'instasnap',
    domain: 'instasnap.corn',
    name: 'InstaSnap',
    icon: '📸',
    description: 'Photo sharing - grid profiles, stories, reels',
    component: adaptLegacyComponent(InstaSnapSite),
    keywords: ['photos', 'social', 'stories', 'instagram'],
    seoScore: 80,
  }))

  // =========================================================================
  // Search Engine
  // =========================================================================

  registerSite(createSimpleSite({
    id: 'goober',
    domain: 'goober.corn',
    name: 'Goober',
    icon: '🔍',
    description: 'The corn internet search engine',
    component: GooberSite,  // Uses full SiteComponentProps (needs query param)
    keywords: ['search', 'google', 'find', 'engine'],
    seoScore: 95,
  }))

  registerSite(createSimpleSite({
    id: 'corngpt',
    domain: 'corngpt.corn',
    name: 'cornGPT',
    icon: '🌽',
    description: 'AI-powered search and chat from CloseAI',
    component: adaptLegacyComponent(CornGPTSite),
    keywords: ['ai', 'chat', 'gpt', 'assistant', 'closeai', 'search'],
    seoScore: 92,
  }))

  registerSite(createSimpleSite({
    id: 'stalks',
    domain: 'stalks.corn',
    name: 'Stalks',
    icon: '📈',
    description: 'Prediction market for .corn internet drama',
    component: StalksSite,  // Uses full SiteComponentProps
    keywords: ['predictions', 'betting', 'markets', 'stocks', 'drama', 'gambling'],
    seoScore: 75,
  }))

  // =========================================================================
  // Content Sites
  // =========================================================================

  registerSite(createSimpleSite({
    id: 'wikiknow',
    domain: 'wikiknow.corn',
    name: 'WikiKnow',
    icon: '📖',
    description: 'The free encyclopedia that anyone can edit',
    component: adaptLegacyComponent(WikiKnowSite),
    keywords: ['wiki', 'encyclopedia', 'reference', 'articles'],
    seoScore: 90,
  }))

  registerSite(createSimpleSite({
    id: 'threadit',
    domain: 'threadit.corn',
    name: 'Threadit',
    icon: '🗣️',
    description: 'The front page of the fake internet',
    component: adaptLegacyComponent(ThreaditSite),
    keywords: ['forum', 'discussion', 'community', 'reddit'],
    seoScore: 85,
  }))

  registerSite(createSimpleSite({
    id: 'dailybuzz',
    domain: 'dailybuzz.corn',
    name: 'DailyBuzz',
    icon: '📰',
    description: 'All the news that fits',
    component: adaptLegacyComponent(DailyBuzzSite),
    keywords: ['news', 'articles', 'journalism'],
    seoScore: 75,
  }))

  registerSite(createSimpleSite({
    id: 'vidtube',
    domain: 'vidtube.corn',
    name: 'VidTube',
    icon: '▶️',
    description: 'Share and watch videos from around the world',
    component: adaptLegacyComponent(VidTubeSite),
    keywords: ['video', 'streaming', 'youtube'],
    seoScore: 85,
  }))

  registerSite(createSimpleSite({
    id: 'forchan',
    domain: 'forchan.corn',
    name: 'ForChan',
    icon: '🍀',
    description: 'Anonymous imageboard',
    component: adaptLegacyComponent(ForChanSite),
    keywords: ['anonymous', 'imageboard', 'forum'],
    seoScore: 40,
  }))

  // =========================================================================
  // Commercial Sites
  // =========================================================================

  registerSite(createSimpleSite({
    id: 'vitalityrx',
    domain: 'vitalityrx.corn',
    name: 'VitalityRx',
    icon: '💊',
    description: 'Medications for the Modern Age',
    component: adaptLegacyComponent(VitalityRxSite),
    keywords: ['pharmacy', 'medicine', 'health'],
    seoScore: 60,
  }))

  registerSite(createSimpleSite({
    id: 'nestfinder',
    domain: 'nestfinder.corn',
    name: 'NestFinder',
    icon: '🏠',
    description: 'Find your perfect place',
    component: adaptLegacyComponent(NestFinderSite),
    keywords: ['real estate', 'homes', 'apartments', 'rental'],
    seoScore: 70,
  }))

  registerSite(createSimpleSite({
    id: 'bargainbay',
    domain: 'bargainbay.corn',
    name: 'BargainBay',
    icon: '🏷️',
    description: 'Local classifieds and marketplace',
    component: adaptLegacyComponent(BargainBaySite),
    keywords: ['classifieds', 'marketplace', 'buy', 'sell'],
    seoScore: 65,
  }))

  registerSite(createSimpleSite({
    id: 'oddsoracle',
    domain: 'oddsoracle.corn',
    name: 'OddsOracle',
    icon: '🎲',
    description: 'Prediction markets for everything',
    component: adaptLegacyComponent(OddsOracleSite),
    keywords: ['predictions', 'betting', 'markets'],
    seoScore: 55,
  }))

  registerSite(createSimpleSite({
    id: 'strangerzone',
    domain: 'strangerzone.corn',
    name: 'StrangerZone',
    icon: '👤',
    description: 'Talk to random strangers',
    component: adaptLegacyComponent(StrangerZoneSite),
    keywords: ['chat', 'anonymous', 'strangers'],
    seoScore: 45,
  }))

  registerSite(createSimpleSite({
    id: 'wealthwisdom',
    domain: 'wealthwisdom.corn',
    name: 'WealthWisdom',
    icon: '💰',
    description: 'Financial advice from experts',
    component: adaptLegacyComponent(WealthWisdomSite),
    keywords: ['finance', 'money', 'investing'],
    seoScore: 60,
  }))

  // =========================================================================
  // Easter Egg Sites
  // =========================================================================

  registerSite(createSimpleSite({
    id: 'popuphell',
    domain: 'free-prizes-click-here.corn',
    name: 'FREE PRIZES!!!',
    icon: '🎉',
    description: 'YOU ARE THE 1000000th VISITOR!!!',
    component: adaptLegacyComponent(PopupHellSite),
    keywords: ['popup', 'scam', 'prizes'],
    seoScore: 10,
  }))

  registerSite(createSimpleSite({
    id: 'millionpixels',
    domain: 'millionpixels.corn',
    name: 'MillionPixels',
    icon: '🟦',
    description: 'Own a piece of fake internet history',
    component: adaptLegacyComponent(MillionPixelsSite),
    keywords: ['pixels', 'advertising', 'history'],
    seoScore: 35,
  }))

  // =========================================================================
  // Blog Sites
  // =========================================================================

  registerSite(createSimpleSite({
    id: 'quantumbrewblog',
    domain: 'quantumbrewblog.corn',
    name: 'QuantumBrewBlog',
    icon: '☕',
    description: "Observing coffee so you don't have to",
    component: adaptLegacyComponent(QuantumBrewBlogSite),
    keywords: ['quantum', 'coffee', 'derek', 'blog'],
    seoScore: 55,
  }))

  registerSite(createSimpleSite({
    id: 'cornstalkblog',
    domain: 'thoughtsfromtherow.corn',
    name: 'Thoughts From The Row',
    icon: '🌾',
    description: 'A sentient corn stalk contemplates existence',
    component: adaptLegacyComponent(CornStalkBlogSite),
    keywords: ['corn', 'philosophy', 'blog', 'existential'],
    seoScore: 40,
  }))

  registerSite(createSimpleSite({
    id: 'jennifersblog',
    domain: 'jenniferheals.corn',
    name: 'Jennifer Heals',
    icon: '💗',
    description: 'A healing journey after divorce',
    component: adaptLegacyComponent(JennifersBlogSite),
    keywords: ['healing', 'divorce', 'blog', 'wellness'],
    seoScore: 45,
  }))

  registerSite(createSimpleSite({
    id: 'elenasblog',
    domain: 'elenasclarifies.corn',
    name: 'Dr. Elena Martinez',
    icon: '🔬',
    description: 'Academic blog by physicist Dr. Elena Martinez',
    component: adaptLegacyComponent(ElenasBlogSite),
    keywords: ['physics', 'quantum', 'science', 'martinez'],
    seoScore: 70,
  }))

  registerSite(createSimpleSite({
    id: 'venuepoetryblog',
    domain: 'anonymousvenuepoet.corn',
    name: 'Anonymous Venue Poet',
    icon: '🎵',
    description: 'Secret poetry about running a venue',
    component: adaptLegacyComponent(VenuePoetBlogSite),
    keywords: ['poetry', 'venue', 'underground', 'mars'],
    seoScore: 40,
  }))

  registerSite(createSimpleSite({
    id: 'hartwellfiles',
    domain: 'hartwellfiles.corn',
    name: 'Hartwell Files',
    icon: '🏚️',
    description: 'The truth is in there',
    component: adaptLegacyComponent(HartwellFilesSite),
    keywords: ['hartwell', 'mystery', 'floor 13', 'building'],
    seoScore: 50,
  }))

  registerSite(createSimpleSite({
    id: 'trustfalltim',
    domain: 'trustfalltim.corn',
    name: 'TrustFallTim.corn',
    icon: '🙆‍♂️',
    description: 'The official unofficial fan archive',
    component: adaptLegacyComponent(TrustFallTimSite),
    keywords: ['trust fall', 'tim', 'fan site', '847'],
    seoScore: 55,
  }))

  registerSite(createSimpleSite({
    id: 'timsmomsupport',
    domain: 'carolstimupdate.corn',
    name: "Carol's Blog",
    icon: '🍪',
    description: "Tim's worried mom blogs about his trust fall career",
    component: adaptLegacyComponent(TimsMomBlogSite),
    keywords: ['carol', 'tim', 'mom', 'trust fall'],
    seoScore: 35,
  }))

  registerSite(createSimpleSite({
    id: 'smallkevinblog',
    domain: 'smallkevinredemption.corn',
    name: 'SmallKevinRedemption',
    icon: '😔',
    description: "Small Kevin's redemption blog after The Incident",
    component: adaptLegacyComponent(SmallKevinBlogSite),
    keywords: ['kevin', 'redemption', 'incident', 'trust fall'],
    seoScore: 30,
  }))

  registerSite(createSimpleSite({
    id: 'drmartinezblog',
    domain: 'drmartinezclarifies.corn',
    name: 'Dr. Elena Martinez',
    icon: '🔬',
    description: 'Physicist whose paper was misinterpreted into quantum coffee',
    component: adaptLegacyComponent(MartinezBlogSite),
    keywords: ['martinez', 'physics', 'quantum', 'coffee', 'misinterpreted'],
    seoScore: 70,
  }))

  registerSite(createSimpleSite({
    id: 'bigmikeblog',
    domain: 'bigmikefromtulsa.corn',
    name: 'Big Mike from Tulsa',
    icon: '👨',
    description: "The aggressively normal blog of Michael Cornwell",
    component: adaptLegacyComponent(BigMikeBlogSite),
    keywords: ['big mike', 'tulsa', 'normal', 'cornwell'],
    seoScore: 45,
  }))

  registerSite(createSimpleSite({
    id: 'vexdrums',
    domain: 'vexdrumsblog.corn',
    name: 'Vex Drums Blog',
    icon: '🥁',
    description: "Personal blog of Vex, drummer from Neon Requiem",
    component: adaptLegacyComponent(VexDrumsBlogSite),
    keywords: ['vex', 'drums', 'neon requiem', 'band', 'denial'],
    seoScore: 50,
  }))

  registerSite(createSimpleSite({
    id: 'patriciablog',
    domain: 'patriciasworkplacewellness.corn',
    name: "Patricia's Workplace Blog",
    icon: '👔',
    description: 'Corporate HR wellness blog from Omnicorp Holdings',
    component: adaptLegacyComponent(PatriciaBlogSite),
    keywords: ['patricia', 'hr', 'omnicorp', 'floor 13', 'wellness'],
    seoScore: 55,
  }))

  registerSite(createSimpleSite({
    id: 'wonderwallwarrior',
    domain: 'wonderwallwarrior.corn',
    name: 'Wonderwall Warrior',
    icon: '🎸',
    description: "Gary's defiant blog about requesting Wonderwall at The Underground",
    component: adaptLegacyComponent(WonderwallWarriorSite),
    keywords: ['wonderwall', 'gary', 'underground', 'banned'],
    seoScore: 40,
  }))

  registerSite(createSimpleSite({
    id: 'floor13blog',
    domain: 'floor13exists.corn',
    name: 'Floor 13 Exists',
    icon: '█',
    description: 'A cryptic blog from the mysterious entity on Floor 13',
    component: adaptLegacyComponent(Floor13BlogSite),
    keywords: ['floor 13', 'hartwell', 'entity', 'mystery'],
    seoScore: 60,
  }))

  // =========================================================================
  // Parody Sites
  // =========================================================================

  registerSite(createSimpleSite({
    id: 'onlyfans',
    domain: 'onlyfans.corn',
    name: 'OnlyFans',
    icon: '🌀',
    description: 'Premium fans for enthusiasts. Ceiling fans. Desk fans.',
    component: adaptLegacyComponent(OnlyFansSite),
    keywords: ['fans', 'ceiling', 'desk', 'premium'],
    seoScore: 50,
  }))

  registerSite(createSimpleSite({
    id: 'bandsnotintown',
    domain: 'bandsnotintown.corn',
    name: 'BandsNotInTown',
    icon: '🎫',
    description: 'Never see your favorite artists live',
    component: adaptLegacyComponent(BandsNotInTownSite),
    keywords: ['concerts', 'bands', 'music', 'cancelled'],
    seoScore: 55,
  }))

  registerSite(createSimpleSite({
    id: 'graintruth',
    domain: 'graintruth.corn',
    name: 'GrainTruth',
    icon: '🌽',
    description: 'Corn-based conspiracy research - Big Corn is watching',
    component: adaptLegacyComponent(GrainTruthSite),
    keywords: ['conspiracy', 'corn', 'big corn', 'truth'],
    seoScore: 35,
  }))

  registerSite(createSimpleSite({
    id: 'huskreviews',
    domain: 'huskreviews.corn',
    name: 'HuskReviews',
    icon: '🌽',
    description: 'Local business reviews from increasingly unhinged customers',
    component: adaptLegacyComponent(HuskReviewsSite),
    keywords: ['reviews', 'business', 'yelp', 'unhinged'],
    seoScore: 60,
  }))

  registerSite(createSimpleSite({
    id: 'kernelpods',
    domain: 'kernelpods.corn',
    name: 'KernelPods',
    icon: '🎧',
    description: 'Podcast platform - every show has a kernel of truth',
    component: adaptLegacyComponent(KernelPodsSite),
    keywords: ['podcast', 'audio', 'shows'],
    seoScore: 55,
  }))

  registerSite(createSimpleSite({
    id: 'cornhub',
    domain: 'cornhub.corn',
    name: 'CornHub',
    icon: '🌽',
    description: 'Free corn recipes. What did you think it was?',
    component: adaptLegacyComponent(CornHubSite),
    keywords: ['recipes', 'corn', 'cooking', 'food'],
    seoScore: 65,
  }))

  registerSite(createSimpleSite({
    id: 'pastelive',
    domain: 'pastelive.corn',
    name: 'PasteLive',
    icon: '📋',
    description: 'Pastebin-style text hosting for anonymous sharing',
    component: adaptLegacyComponent(PasteLiveSite),
    keywords: ['paste', 'text', 'code', 'share'],
    seoScore: 50,
  }))

  registerSite(createSimpleSite({
    id: 'cobcoin',
    domain: 'cobcoin.corn',
    name: 'CobCoin Exchange',
    icon: '🌽',
    description: 'Corn-based cryptocurrency exchange - 847 COB = 1 USD',
    component: adaptLegacyComponent(CobCoinSite),
    keywords: ['crypto', 'coin', 'exchange', '847'],
    seoScore: 45,
  }))

  registerSite(createSimpleSite({
    id: 'onlyfarms',
    domain: 'onlyfarms.corn',
    name: 'OnlyFarms',
    icon: '🚜',
    description: 'Premium agricultural equipment marketplace.',
    component: adaptLegacyComponent(OnlyFarmsSite),
    keywords: ['farming', 'equipment', 'tractors', 'agriculture'],
    seoScore: 50,
  }))

  registerSite(createSimpleSite({
    id: 'corndr',
    domain: 'corndr.corn',
    name: 'Corndr',
    icon: '🌽💕',
    description: 'Dating app for people in the corn industry',
    component: adaptLegacyComponent(CorndrSite),
    keywords: ['dating', 'corn', 'farmers', 'love'],
    seoScore: 45,
  }))

  registerSite(createSimpleSite({
    id: 'stalk',
    domain: 'stalk.corn',
    name: 'Stalk',
    icon: '🌽',
    description: 'Live streaming platform - watch stalkers go live',
    component: adaptLegacyComponent(StalkSite),
    keywords: ['streaming', 'live', 'twitch'],
    seoScore: 55,
  }))

  registerSite(createSimpleSite({
    id: 'linkedcorn',
    domain: 'linkedcorn.corn',
    name: 'LinkedCorn',
    icon: '🌽',
    description: 'Professional networking for the corn industry',
    component: adaptLegacyComponent(LinkedCornSite),
    keywords: ['professional', 'networking', 'jobs', 'linkedin'],
    seoScore: 65,
  }))

  registerSite(createSimpleSite({
    id: 'cornmd',
    domain: 'cornmd.corn',
    name: 'CornMD',
    icon: '🌽',
    description: 'Medical symptom checker - everything is corn-related',
    component: adaptLegacyComponent(CornMDSite),
    keywords: ['medical', 'symptoms', 'health', 'doctor'],
    seoScore: 60,
  }))

  registerSite(createSimpleSite({
    id: 'cornmaps',
    domain: 'cornmaps.corn',
    name: 'CornMaps',
    icon: '🌽',
    description: 'Navigation app where every destination has something off',
    component: adaptLegacyComponent(CornMapsSite),
    keywords: ['maps', 'navigation', 'directions', 'places'],
    seoScore: 70,
  }))

  registerSite(createSimpleSite({
    id: 'askcorn',
    domain: 'askcorn.corn',
    name: 'AskCorn',
    icon: '🌽',
    description: 'Q&A site where questions range from technical to unhinged',
    component: adaptLegacyComponent(AskCornSite),
    keywords: ['questions', 'answers', 'qa', 'stackoverflow'],
    seoScore: 65,
  }))

  registerSite(createSimpleSite({
    id: 'cobfundme',
    domain: 'cobfundme.corn',
    name: 'CobFundMe',
    icon: '🌽',
    description: 'Crowdfunding for questionable campaigns since 2019',
    component: adaptLegacyComponent(CobFundMeSite),
    keywords: ['crowdfunding', 'fundraiser', 'gofundme'],
    seoScore: 55,
  }))

  registerSite(createSimpleSite({
    id: 'cobhub',
    domain: 'cobhub.corn',
    name: 'CobHub',
    icon: '🌽',
    description: 'Code repository hosting for unhinged open source projects',
    component: adaptLegacyComponent(CobHubSite),
    keywords: ['code', 'git', 'repository', 'github'],
    seoScore: 70,
  }))

  registerSite(createSimpleSite({
    id: 'deaddrop',
    domain: 'deaddrop.corn',
    name: 'DeadDrop',
    icon: '📦',
    description: 'Anonymous tips, confessions, and mostly shitposts',
    component: adaptLegacyComponent(DeadDropSite),
    keywords: ['anonymous', 'tips', 'confessions', 'secrets'],
    seoScore: 40,
  }))

  registerSite(createSimpleSite({
    id: 'amaize',
    domain: 'amaize.corn',
    name: 'Amaize',
    icon: '🌽',
    description: 'The everything corn store. Kernel Prime delivery.',
    component: adaptLegacyComponent(AmaizeSite),
    keywords: ['shopping', 'amazon', 'delivery', 'store'],
    seoScore: 80,
  }))

  registerSite(createSimpleSite({
    id: 'silkroad',
    domain: 'silkroad.corn',
    name: 'SilkRoad',
    icon: '🌽',
    description: 'Legitimate corn silk marketplace. Stop asking.',
    component: adaptLegacyComponent(SilkRoadSite),
    keywords: ['silk', 'corn silk', 'marketplace', 'dark web'],
    seoScore: 30,
  }))

  registerSite(createSimpleSite({
    id: 'cornarchive',
    domain: 'cornarchive.corn',
    name: 'CornArchive',
    icon: '📚',
    description: 'Preserving deleted and historical web pages since 2004',
    component: adaptLegacyComponent(CornArchiveSite),
    keywords: ['archive', 'history', 'wayback', 'preservation'],
    seoScore: 75,
  }))

  // =========================================================================
  // Unhinged Persona Sites
  // =========================================================================

  registerSite(createSimpleSite({
    id: 'benchwatch',
    domain: 'benchwatch.corn',
    name: 'BenchWatch',
    icon: '🪑',
    description: "Greg Mantooth's forensic bench analysis",
    component: adaptLegacyComponent(BenchWatchSite),
    keywords: ['bench', 'forensic', 'analysis', 'greg'],
    seoScore: 35,
  }))

  registerSite(createSimpleSite({
    id: 'dominate',
    domain: 'dominate.corn',
    name: 'DOMINATE',
    icon: '💪',
    description: "Chad Thundercoach's high-intensity success system",
    component: adaptLegacyComponent(DominateSite),
    keywords: ['success', 'motivation', 'coaching', 'chad'],
    seoScore: 45,
  }))

  registerSite(createSimpleSite({
    id: 'stationsushi',
    domain: 'stationsushireview.corn',
    name: 'Station Sushi Review',
    icon: '🍣',
    description: "Mildred Gasketsworth's gas station sushi reviews",
    component: adaptLegacyComponent(StationSushiSite),
    keywords: ['sushi', 'gas station', 'reviews', 'mildred'],
    seoScore: 40,
  }))

  registerSite(createSimpleSite({
    id: 'truemoss',
    domain: 'truemoss.corn',
    name: 'TrueMoss',
    icon: '🌿',
    description: "Agatha Mosswell's independent moss research",
    component: adaptLegacyComponent(TrueMossSite),
    keywords: ['moss', 'research', 'agatha', 'nature'],
    seoScore: 35,
  }))

  // =========================================================================
  // Register Site Manifests (for Goober search indexing)
  // =========================================================================

  for (const manifest of ALL_SITE_MANIFESTS) {
    registerManifest(manifest)
  }

  console.log(`[CornStack] Registered ${getAllSites().length} legacy sites`)
  console.log(`[CornStack] Registered ${ALL_SITE_MANIFESTS.length} site manifests for search indexing`)
}

// Re-export for convenience
import { getAllSites, getAllSearchEntries, getManifestStats } from './site-registry.js'
export { getAllSites, getAllSearchEntries, getManifestStats }
