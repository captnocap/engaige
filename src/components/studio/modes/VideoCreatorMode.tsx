/**
 * Video Creator Mode
 *
 * Thin wrapper that renders the After Effects-style CompositionView.
 * All video state is managed via StudioContext + useVideoComposition hook.
 * Property panels are rendered in the sidebar by StudioPanelSidebar.
 */

import { CompositionView } from '../video/CompositionView.js';

export function VideoCreatorMode() {
  return <CompositionView />;
}

export default VideoCreatorMode;
