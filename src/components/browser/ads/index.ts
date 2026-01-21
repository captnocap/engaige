/**
 * Browser Ads Module
 *
 * Re-exports all ad components for easy importing.
 */

export { AdBanner, AdSlot, SidebarAdWidget, InlineAd } from './AdBanner.js'
export type { } from './AdBanner.js'

// Re-export config utilities
export {
  FILLER_ADS,
  getAdsForSite,
  getRandomAdsForSite,
  getAdsByStyle,
  getAdsTargetingSite,
  getTargetSiteInfo,
} from '../../../config/filler-ads.js'
export type { FillerAd } from '../../../config/filler-ads.js'
