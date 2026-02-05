/**
 * Creative Studio
 *
 * Unified content creation app for the engAIge desktop.
 *
 * Usage:
 *   import { CreativeStudioWindow } from '../studio'
 */

// Main component
export { CreativeStudioWindow, default } from './CreativeStudioWindow.js';

// Context and hooks
export {
  StudioProvider,
  useStudio,
  type StudioState,
  type StudioMode,
  type StudioDraft,
  type StudioAction,
  type AssetFilters,
  type AssetSource,
  type AssetUsage,
} from './StudioContext.js';

export { useStudioAssets, type MediaFile } from './useStudioAssets.js';

// Mode components (for advanced usage)
export { ImageGeneratorMode } from './modes/ImageGeneratorMode.js';
export { VideoCreatorMode } from './modes/VideoCreatorMode.js';
export { PostComposerMode } from './modes/PostComposerMode.js';
export { AssetLibraryMode } from './modes/AssetLibraryMode.js';
