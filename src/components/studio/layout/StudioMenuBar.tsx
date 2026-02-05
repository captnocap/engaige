/**
 * Studio Menu Bar
 *
 * Top menu bar: File | Edit | View | Filter | Generate | Window
 * with right-aligned budget indicator.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useStudio, type StudioMode } from '../StudioContext.js';

// ============================================================================
// Types
// ============================================================================

interface MenuItem {
  label: string;
  shortcut?: string;
  action?: () => void;
  disabled?: boolean;
  separator?: boolean;
}

interface MenuDefinition {
  label: string;
  items: MenuItem[];
}

// ============================================================================
// Component
// ============================================================================

interface StudioMenuBarProps {
  onPublish?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onSave?: () => void;
  onImport?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

export function StudioMenuBar({
  onPublish,
  onUndo,
  onRedo,
  onSave,
  onImport,
  canUndo = false,
  canRedo = false,
}: StudioMenuBarProps) {
  const { state, setMode, dispatch } = useStudio();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const barRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    if (!openMenu) return;
    function handleClick(e: MouseEvent) {
      if (barRef.current && !barRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [openMenu]);

  const togglePanel = useCallback((panelId: string) => {
    dispatch({ type: 'TOGGLE_PANEL', payload: panelId });
    setOpenMenu(null);
  }, [dispatch]);

  const switchMode = useCallback((mode: StudioMode) => {
    setMode(mode);
    setOpenMenu(null);
  }, [setMode]);

  // Menu definitions
  const menus: MenuDefinition[] = [
    {
      label: 'File',
      items: [
        { label: 'Save Canvas', shortcut: 'Ctrl+S', action: () => { onSave?.(); setOpenMenu(null); }, disabled: !onSave },
        { label: 'Import Image...', action: () => { onImport?.(); setOpenMenu(null); } },
        { separator: true, label: '' },
        { label: 'Publish to Feed...', shortcut: 'Ctrl+Shift+P', action: () => { onPublish?.(); setOpenMenu(null); } },
      ],
    },
    {
      label: 'Edit',
      items: [
        { label: 'Undo', shortcut: 'Ctrl+Z', action: () => { onUndo?.(); setOpenMenu(null); }, disabled: !canUndo },
        { label: 'Redo', shortcut: 'Ctrl+Shift+Z', action: () => { onRedo?.(); setOpenMenu(null); }, disabled: !canRedo },
      ],
    },
    {
      label: 'View',
      items: [
        { label: 'Toggle Properties', action: () => togglePanel('properties') },
        { label: 'Toggle Colors', action: () => togglePanel('colors') },
        { label: 'Toggle History', action: () => togglePanel('history') },
        { label: 'Toggle Gallery', action: () => togglePanel('gallery') },
        { label: 'Toggle Library', action: () => togglePanel('library') },
      ],
    },
    {
      label: 'Generate',
      items: [
        { label: 'Generate Image', action: () => switchMode('generate') },
        { label: 'Create Video', action: () => switchMode('video') },
      ],
    },
    {
      label: 'Window',
      items: [
        { label: 'Draw', shortcut: '', action: () => switchMode('draw') },
        { label: 'Generate', action: () => switchMode('generate') },
        { label: 'Video', action: () => switchMode('video') },
        { label: 'Library', action: () => switchMode('library') },
      ],
    },
  ];

  return (
    <div
      ref={barRef}
      className="flex items-center"
      style={{
        height: 'var(--studio-menubar-height)',
        background: 'var(--studio-panel-header)',
        borderBottom: '1px solid var(--studio-border-subtle)',
      }}
    >
      {/* Menu Buttons */}
      <div className="flex items-center">
        {menus.map(menu => (
          <div key={menu.label} className="relative">
            <button
              className={`studio-menu-btn ${openMenu === menu.label ? 'open' : ''}`}
              onMouseDown={() => setOpenMenu(prev => prev === menu.label ? null : menu.label)}
              onMouseEnter={() => openMenu && setOpenMenu(menu.label)}
            >
              {menu.label}
            </button>

            {/* Dropdown */}
            {openMenu === menu.label && (
              <div className="studio-dropdown">
                {menu.items.map((item, i) =>
                  item.separator ? (
                    <div key={i} className="studio-dropdown-separator" />
                  ) : (
                    <button
                      key={i}
                      className="studio-dropdown-item"
                      onClick={item.action}
                      disabled={item.disabled}
                    >
                      <span>{item.label}</span>
                      {item.shortcut && (
                        <span className="studio-dropdown-shortcut">{item.shortcut}</span>
                      )}
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Right side: Mode indicator + Budget */}
      <div className="ml-auto flex items-center gap-3 px-3">
        {/* Mode indicator */}
        <span style={{ color: 'var(--studio-text-muted)', fontSize: '11px' }}>
          {state.activeMode.charAt(0).toUpperCase() + state.activeMode.slice(1)}
        </span>

        {/* Budget */}
        {state.budget && (
          <span style={{ color: 'var(--studio-text-muted)', fontSize: '11px' }}>
            Budget: ${(state.budget.remaining / 100).toFixed(2)}
          </span>
        )}
      </div>
    </div>
  );
}
