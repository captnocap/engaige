/**
 * World Window
 *
 * Desktop window wrapper for the 3D city viewer.
 */

import CityViewer from './CityViewer.js';

interface WorldWindowProps {
  onClose?: () => void;
}

export default function WorldWindow({ onClose }: WorldWindowProps) {
  return (
    <div className="w-full h-full bg-[var(--color-bgPrimary)] overflow-hidden">
      <CityViewer />
    </div>
  );
}
