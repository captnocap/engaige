/**
 * Studio Panel Sidebar
 *
 * 280px right column that renders visible panels stacked with scroll.
 * Panel configuration varies by active mode.
 */

import { useStudio } from '../StudioContext.js';
import { StudioPanel } from './StudioPanel.js';
import { PropertiesPanel } from '../panels/PropertiesPanel.js';
import { ColorsPanel } from '../panels/ColorsPanel.js';
import { HistoryPanel } from '../panels/HistoryPanel.js';
import { GeneratePanel } from '../panels/GeneratePanel.js';
import { GalleryPanel } from '../panels/GalleryPanel.js';
import { LibraryPanel } from '../panels/LibraryPanel.js';
import { VideoIntentPanel } from '../panels/VideoIntentPanel.js';
import { VideoStylePanel } from '../panels/VideoStylePanel.js';
import { VideoTextPanel } from '../panels/VideoTextPanel.js';
import { VideoPlatformPanel } from '../panels/VideoPlatformPanel.js';
import { ModeSelector } from '../panels/ModeSelector.js';
import { TunerPanel } from '../panels/TunerPanel.js';
import { EnergyPanel } from '../panels/EnergyPanel.js';

// ============================================================================
// Panel Config Per Mode
// ============================================================================

interface PanelDef {
  id: string;
  title: string;
  component: React.ComponentType;
  defaultCollapsed?: boolean;
}

const DRAW_PANELS: PanelDef[] = [
  { id: 'properties', title: 'Properties', component: PropertiesPanel },
  { id: 'colors', title: 'Colors', component: ColorsPanel },
  { id: 'history', title: 'History', component: HistoryPanel, defaultCollapsed: true },
];

const GENERATE_PANELS: PanelDef[] = [
  { id: 'generate', title: 'Generate', component: GeneratePanel },
  { id: 'gallery', title: 'Gallery', component: GalleryPanel },
];

const VIDEO_PANELS: PanelDef[] = [
  { id: 'videoPlatform', title: 'Platform', component: VideoPlatformPanel },
  { id: 'videoIntent', title: 'Intent', component: VideoIntentPanel },
  { id: 'videoMode', title: 'Visual Mode', component: ModeSelector },
  { id: 'videoTuner', title: 'Tuner', component: TunerPanel, defaultCollapsed: true },
  { id: 'videoEnergy', title: 'Energy', component: EnergyPanel },
  { id: 'videoStyle', title: 'Overlay & Text Style', component: VideoStylePanel },
  { id: 'videoText', title: 'Text & Timing', component: VideoTextPanel },
];

const LIBRARY_PANELS: PanelDef[] = [
  { id: 'library', title: 'Library', component: LibraryPanel },
];

const MODE_PANELS: Record<string, PanelDef[]> = {
  draw: DRAW_PANELS,
  generate: GENERATE_PANELS,
  video: VIDEO_PANELS,
  library: LIBRARY_PANELS,
  compose: GENERATE_PANELS,
};

// ============================================================================
// Component
// ============================================================================

export function StudioPanelSidebar() {
  const { state, dispatch } = useStudio();
  const panels = MODE_PANELS[state.activeMode] || [];

  // Filter to only visible panels
  const visiblePanels = panels.filter(p => {
    const key = p.id as keyof typeof state.panelVisibility;
    return state.panelVisibility[key] !== false;
  });

  if (visiblePanels.length === 0) return null;

  return (
    <div
      className="flex flex-col overflow-y-auto"
      style={{
        width: 'var(--studio-panel-width)',
        background: 'var(--studio-panel)',
        borderLeft: '1px solid var(--studio-border-subtle)',
      }}
    >
      {visiblePanels.map(panel => {
        const PanelContent = panel.component;
        return (
          <StudioPanel
            key={panel.id}
            title={panel.title}
            defaultCollapsed={panel.defaultCollapsed}
            onClose={() => dispatch({ type: 'TOGGLE_PANEL', payload: panel.id })}
          >
            <PanelContent />
          </StudioPanel>
        );
      })}
    </div>
  );
}
