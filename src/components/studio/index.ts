/**
 * Creative Suite
 *
 * Adobe CC-inspired content creation suite for the engAIge desktop.
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
  type StudioBudget,
  type PanelVisibility,
  type Tool,
  type AssetFilters,
  type AssetSource,
  type AssetUsage,
  type VideoComposition,
  type TextSegmentDraft,
  type EnergyLevel,
} from './StudioContext.js';

export { useStudioAssets, type MediaFile } from './useStudioAssets.js';
export { useCanvasDrawing, CANVAS_PRESETS } from './hooks/useCanvasDrawing.js';
export { useStudioKeyboard } from './hooks/useStudioKeyboard.js';
export { useVideoComposition, PLATFORM_DEFAULTS } from './hooks/useVideoComposition.js';

// Layout components
export { StudioMenuBar } from './layout/StudioMenuBar.js';
export { StudioToolbar } from './layout/StudioToolbar.js';
export { StudioStatusBar } from './layout/StudioStatusBar.js';
export { StudioPanel } from './layout/StudioPanel.js';
export { StudioPanelSidebar } from './layout/StudioPanelSidebar.js';

// Panel components
export { PropertiesPanel } from './panels/PropertiesPanel.js';
export { ColorsPanel } from './panels/ColorsPanel.js';
export { HistoryPanel } from './panels/HistoryPanel.js';
export { GeneratePanel } from './panels/GeneratePanel.js';
export { GalleryPanel } from './panels/GalleryPanel.js';
export { LibraryPanel } from './panels/LibraryPanel.js';
export { VideoIntentPanel } from './panels/VideoIntentPanel.js';
export { VideoStylePanel } from './panels/VideoStylePanel.js';
export { VideoTextPanel } from './panels/VideoTextPanel.js';
export { VideoPlatformPanel } from './panels/VideoPlatformPanel.js';

// Modal components
export { PublishModal } from './modals/PublishModal.js';
export { ImportImageModal } from './modals/ImportImageModal.js';

// Mode components (for advanced usage)
export { ImageGeneratorMode } from './modes/ImageGeneratorMode.js';
export { CanvasMode } from './modes/CanvasMode.js';
export { VideoCreatorMode } from './modes/VideoCreatorMode.js';
export { AssetLibraryMode } from './modes/AssetLibraryMode.js';

// Video composition components
export { CompositionView } from './video/CompositionView.js';
export { VideoTimeline } from './video/VideoTimeline.js';
export { TransportBar } from './video/TransportBar.js';

// Icons
export * from './icons/StudioIcons.js';
