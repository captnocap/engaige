/**
 * Studio Panel
 *
 * Reusable collapsible panel component for the right sidebar.
 * Header with title, collapse chevron, and optional close button.
 */

import { useState } from 'react';
import { ChevronDownIcon, ChevronRightIcon, CloseIcon } from '../icons/StudioIcons.js';

interface StudioPanelProps {
  title: string;
  children: React.ReactNode;
  defaultCollapsed?: boolean;
  onClose?: () => void;
}

export function StudioPanel({ title, children, defaultCollapsed = false, onClose }: StudioPanelProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  return (
    <div className="studio-panel">
      <div
        className="studio-panel-header"
        onClick={() => setCollapsed(c => !c)}
      >
        <div className="flex items-center gap-1">
          {collapsed ? <ChevronRightIcon size={12} /> : <ChevronDownIcon size={12} />}
          <span>{title}</span>
        </div>
        {onClose && (
          <button
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="studio-toolbar-btn"
            style={{ width: 18, height: 18 }}
          >
            <CloseIcon size={10} />
          </button>
        )}
      </div>
      {!collapsed && (
        <div className="studio-panel-body">
          {children}
        </div>
      )}
    </div>
  );
}
