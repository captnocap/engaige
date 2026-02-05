/**
 * Studio Toolbar
 *
 * 40px vertical toolbar on the left side.
 * Shows drawing tools in draw mode, mode-switch icons otherwise.
 */

import { useStudio, type Tool } from '../StudioContext.js';
import {
  PencilIcon,
  BrushIcon,
  EraserIcon,
  LineIcon,
  RectangleIcon,
  EllipseIcon,
  FillIcon,
  EyedropperIcon,
  GenerateIcon,
  VideoIcon,
  LibraryIcon,
} from '../icons/StudioIcons.js';

// ============================================================================
// Tool Definitions
// ============================================================================

interface ToolDef {
  id: Tool;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  label: string;
  shortcut?: string;
}

const DRAW_TOOLS: ToolDef[] = [
  { id: 'pencil', icon: PencilIcon, label: 'Pencil', shortcut: 'P' },
  { id: 'brush', icon: BrushIcon, label: 'Brush', shortcut: 'B' },
  { id: 'eraser', icon: EraserIcon, label: 'Eraser', shortcut: 'E' },
  { id: 'line', icon: LineIcon, label: 'Line', shortcut: 'L' },
  { id: 'rectangle', icon: RectangleIcon, label: 'Rectangle', shortcut: 'R' },
  { id: 'ellipse', icon: EllipseIcon, label: 'Ellipse', shortcut: 'O' },
  { id: 'fill', icon: FillIcon, label: 'Fill', shortcut: 'G' },
  { id: 'eyedropper', icon: EyedropperIcon, label: 'Eyedropper', shortcut: 'I' },
];

// ============================================================================
// Component
// ============================================================================

export function StudioToolbar() {
  const { state, dispatch, setMode } = useStudio();
  const isDrawMode = state.activeMode === 'draw';

  return (
    <div
      className="flex flex-col items-center py-1 gap-0.5"
      style={{
        width: 'var(--studio-toolbar-width)',
        background: 'var(--studio-panel)',
        borderRight: '1px solid var(--studio-border-subtle)',
      }}
    >
      {isDrawMode ? (
        /* Drawing tools */
        <>
          {DRAW_TOOLS.map(tool => {
            const Icon = tool.icon;
            const isActive = state.activeTool === tool.id;
            return (
              <button
                key={tool.id}
                className={`studio-toolbar-btn ${isActive ? 'active' : ''}`}
                onClick={() => dispatch({ type: 'SET_TOOL', payload: tool.id })}
                title={`${tool.label}${tool.shortcut ? ` (${tool.shortcut})` : ''}`}
              >
                <Icon size={16} color={isActive ? '#fff' : undefined} />
              </button>
            );
          })}

          {/* Separator */}
          <div style={{ width: 24, height: 1, background: 'var(--studio-border)', margin: '4px 0' }} />

          {/* Mode shortcuts below tools */}
          <button
            className="studio-toolbar-btn"
            onClick={() => setMode('generate')}
            title="Generate"
          >
            <GenerateIcon size={16} />
          </button>
          <button
            className="studio-toolbar-btn"
            onClick={() => setMode('library')}
            title="Library"
          >
            <LibraryIcon size={16} />
          </button>
        </>
      ) : (
        /* Mode navigation */
        <>
          <button
            className={`studio-toolbar-btn ${state.activeMode === 'draw' ? 'active' : ''}`}
            onClick={() => setMode('draw')}
            title="Draw"
          >
            <BrushIcon size={16} />
          </button>
          <button
            className={`studio-toolbar-btn ${state.activeMode === 'generate' ? 'active' : ''}`}
            onClick={() => setMode('generate')}
            title="Generate"
          >
            <GenerateIcon size={16} />
          </button>
          <button
            className={`studio-toolbar-btn ${state.activeMode === 'video' ? 'active' : ''}`}
            onClick={() => setMode('video')}
            title="Video"
          >
            <VideoIcon size={16} />
          </button>
          <button
            className={`studio-toolbar-btn ${state.activeMode === 'library' ? 'active' : ''}`}
            onClick={() => setMode('library')}
            title="Library"
          >
            <LibraryIcon size={16} />
          </button>
        </>
      )}
    </div>
  );
}
