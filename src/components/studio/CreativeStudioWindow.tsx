/**
 * Creative Suite Window
 *
 * Adobe CC-inspired content creation suite with modes for:
 * - Image Generation (AI-powered)
 * - Drawing & Editing (Canvas)
 * - Video Creation (MediaRenderer)
 * - Asset Library (browse & manage)
 *
 * Layout: MenuBar (top) | Toolbar (left) | Workspace (center) | PanelSidebar (right) | StatusBar (bottom)
 */

import { useState, useEffect, useRef } from 'react';
import { StudioProvider, useStudio, type StudioMode } from './StudioContext.js';
import { useWSStore } from '../../stores/wsStore.js';

// Layout components
import { StudioMenuBar } from './layout/StudioMenuBar.js';
import { StudioToolbar } from './layout/StudioToolbar.js';
import { StudioStatusBar } from './layout/StudioStatusBar.js';
import { StudioPanelSidebar } from './layout/StudioPanelSidebar.js';

// Mode components
import { ImageGeneratorMode } from './modes/ImageGeneratorMode.js';
import { VideoCreatorMode } from './modes/VideoCreatorMode.js';
import { AssetLibraryMode } from './modes/AssetLibraryMode.js';
import { CanvasMode } from './modes/CanvasMode.js';

// Modals
import { PublishModal } from './modals/PublishModal.js';

// Theme
import './studio-theme.css';

// ============================================================================
// Mode Components Map
// ============================================================================

const MODE_COMPONENTS: Record<Exclude<StudioMode, 'compose'>, React.ComponentType> = {
  generate: ImageGeneratorMode,
  draw: CanvasMode,
  video: VideoCreatorMode,
  library: AssetLibraryMode,
};

// ============================================================================
// Inner Component (uses context)
// ============================================================================

function CreativeSuiteInner() {
  const { state, dispatch } = useStudio();
  const request = useWSStore((s) => s.request);
  const connected = useWSStore((s) => s.connected);
  const [showPublishModal, setShowPublishModal] = useState(false);

  // Canvas interaction refs (passed down via callbacks)
  const canvasUndoRef = useRef<(() => void) | null>(null);
  const canvasRedoRef = useRef<(() => void) | null>(null);
  const canvasSaveRef = useRef<(() => void) | null>(null);
  const canvasImportRef = useRef<(() => void) | null>(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // Fetch budget on mount
  useEffect(() => {
    if (!connected) return;

    async function fetchBudget() {
      try {
        const response = await request<object, { spent: number; remaining: number; costPerImage: number; totalBudget: number }>(
          'studio:getBudget',
          {}
        );
        if (response && typeof response.remaining === 'number') {
          dispatch({ type: 'SET_BUDGET', payload: response });
        }
      } catch (e) {
        console.warn('[Studio] Failed to fetch budget:', e);
      }
    }

    fetchBudget();
  }, [connected, request, dispatch]);

  // Determine which mode component to render
  const activeMode = state.activeMode === 'compose' ? 'generate' : state.activeMode;
  const ActiveModeComponent = MODE_COMPONENTS[activeMode];

  return (
    <div className="studio-theme h-full flex flex-col">
      {/* Menu Bar */}
      <StudioMenuBar
        onPublish={() => setShowPublishModal(true)}
        onUndo={() => canvasUndoRef.current?.()}
        onRedo={() => canvasRedoRef.current?.()}
        onSave={() => canvasSaveRef.current?.()}
        onImport={() => canvasImportRef.current?.()}
        canUndo={canUndo}
        canRedo={canRedo}
      />

      {/* Main Area: Toolbar | Workspace | Panels */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Toolbar */}
        <StudioToolbar />

        {/* Workspace (center) */}
        <div className="flex-1 overflow-hidden" style={{ background: 'var(--studio-bg)' }}>
          <ActiveModeComponent />
        </div>

        {/* Right Panel Sidebar */}
        <StudioPanelSidebar />
      </div>

      {/* Status Bar */}
      <StudioStatusBar />

      {/* Publish Modal */}
      {showPublishModal && (
        <PublishModal onClose={() => setShowPublishModal(false)} />
      )}
    </div>
  );
}

// ============================================================================
// Main Export (wrapped with provider)
// ============================================================================

interface CreativeStudioWindowProps {
  onClose?: () => void;
}

export function CreativeStudioWindow({ onClose }: CreativeStudioWindowProps) {
  return (
    <StudioProvider>
      <CreativeSuiteInner />
    </StudioProvider>
  );
}

export default CreativeStudioWindow;
