/**
 * Colors Panel
 *
 * Color picker + recent colors + default palette.
 * Extracted from CanvasMode color section.
 */

import { useState, useCallback } from 'react';

const DEFAULT_COLORS = [
  '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff',
  '#ffff00', '#ff00ff', '#00ffff', '#ff8800', '#8800ff',
  '#008800', '#880000', '#888888', '#cccccc', '#ffcccc',
];

export function ColorsPanel() {
  const [color, setColor] = useState('#000000');
  const [recentColors, setRecentColors] = useState<string[]>(DEFAULT_COLORS);

  const addRecentColor = useCallback((newColor: string) => {
    setRecentColors(prev => {
      const filtered = prev.filter(c => c !== newColor);
      return [newColor, ...filtered].slice(0, 15);
    });
  }, []);

  return (
    <div className="space-y-3">
      {/* Active Color Preview + Picker */}
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={color}
          onChange={e => {
            setColor(e.target.value);
            addRecentColor(e.target.value);
          }}
          className="w-8 h-8 rounded cursor-pointer"
          style={{ border: '1px solid var(--studio-border)' }}
        />
        <span style={{ color: 'var(--studio-text)', fontSize: '11px', fontFamily: 'monospace' }}>
          {color.toUpperCase()}
        </span>
      </div>

      {/* Color Swatches */}
      <div className="flex flex-wrap gap-1">
        {recentColors.map((c, i) => (
          <button
            key={i}
            onClick={() => setColor(c)}
            className="rounded-sm"
            style={{
              width: 20,
              height: 20,
              background: c,
              border: color === c
                ? '2px solid var(--studio-accent)'
                : '1px solid var(--studio-border)',
            }}
          />
        ))}
      </div>
    </div>
  );
}
