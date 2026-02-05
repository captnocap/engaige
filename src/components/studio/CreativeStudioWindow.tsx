/**
 * Creative Studio Window
 *
 * Unified content creation app with modes for:
 * - Image Generation (AI-powered)
 * - Video Creation (MediaRenderer)
 * - Post Composition (multi-platform)
 * - Asset Library (browse & manage)
 */

import { useEffect } from 'react';
import { SidebarNav, type SidebarNavItem } from '../settings/components/SidebarNav.js';
import { StudioProvider, useStudio, type StudioMode } from './StudioContext.js';
import { useWSStore } from '../../stores/wsStore.js';

// Mode components
import { ImageGeneratorMode } from './modes/ImageGeneratorMode.js';
import { VideoCreatorMode } from './modes/VideoCreatorMode.js';
import { PostComposerMode } from './modes/PostComposerMode.js';
import { AssetLibraryMode } from './modes/AssetLibraryMode.js';
import { CanvasMode } from './modes/CanvasMode.js';

// ============================================================================
// Navigation Config
// ============================================================================

const NAV_ITEMS: SidebarNavItem<StudioMode>[] = [
  { id: 'generate', label: 'Generate', icon: '✨' },
  { id: 'draw', label: 'Draw', icon: '🎨' },
  { id: 'video', label: 'Video', icon: '🎬' },
  { id: 'compose', label: 'Compose', icon: '📝' },
  { id: 'library', label: 'Library', icon: '🖼️' },
];

// Map modes to their components
const MODE_COMPONENTS: Record<StudioMode, React.ComponentType> = {
  generate: ImageGeneratorMode,
  draw: CanvasMode,
  video: VideoCreatorMode,
  compose: PostComposerMode,
  library: AssetLibraryMode,
};

// Mode titles for header
const MODE_TITLES: Record<StudioMode, string> = {
  generate: 'Generate Images',
  draw: 'Draw & Edit',
  video: 'Create Video',
  compose: 'Compose Post',
  library: 'Asset Library',
};

// ============================================================================
// Inner Component (uses context)
// ============================================================================

function CreativeStudioInner() {
  const { state, setMode, dispatch } = useStudio();
  const request = useWSStore((s) => s.request);
  const connected = useWSStore((s) => s.connected);

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
        // Budget fetch failed, not critical
        console.warn('[Studio] Failed to fetch budget:', e);
      }
    }

    fetchBudget();
  }, [connected, request, dispatch]);

  const ActiveModeComponent = MODE_COMPONENTS[state.activeMode];

  return (
    <div className="h-full flex flex-col" style={{ background: 'var(--color-bg)' }}>
      {/* Header */}
      <div
        className="px-6 py-4 border-b flex items-center justify-between"
        style={{
          background: 'var(--color-bgSecondary)',
          borderBottomColor: 'var(--color-border)',
        }}
      >
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>
            Creative Studio
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--color-textSecondary)' }}>
            {MODE_TITLES[state.activeMode]}
          </p>
        </div>

        {/* Budget indicator */}
        {state.budget && (
          <div
            className="text-sm px-3 py-1.5 rounded"
            style={{
              background: 'var(--color-bg)',
              border: '1px solid var(--color-border)',
            }}
          >
            <span style={{ color: 'var(--color-textSecondary)' }}>Budget: </span>
            <span style={{ color: 'var(--color-text)' }}>
              ${(state.budget.remaining / 100).toFixed(2)}
            </span>
            <span style={{ color: 'var(--color-textSecondary)' }}> remaining</span>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <SidebarNav items={NAV_ITEMS} activeItem={state.activeMode} onItemClick={setMode} />

        {/* Content Area */}
        <div className="flex-1 overflow-hidden" style={{ background: 'var(--color-bg)' }}>
          <ActiveModeComponent />
        </div>
      </div>
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
      <CreativeStudioInner />
    </StudioProvider>
  );
}

export default CreativeStudioWindow;
