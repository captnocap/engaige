/**
 * World Window
 *
 * Desktop window wrapper for the isometric world viewer.
 */

import WorldViewer from './WorldViewer.js';

interface WorldWindowProps {
  onClose?: () => void;
}

export default function WorldWindow({ onClose }: WorldWindowProps) {
  return (
    <div className="w-full h-full bg-[var(--color-bgPrimary)] overflow-hidden">
      <WorldViewer />
    </div>
  );
}
