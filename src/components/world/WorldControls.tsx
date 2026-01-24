/**
 * World Controls
 *
 * UI controls for the world viewer including time display,
 * zoom controls, and time speed controls.
 */

import { useWorldStore } from '../../stores/worldStore.js';

export default function WorldControls() {
  const {
    gameTime,
    timeMultiplier,
    isPaused,
    viewport,
    city,
    aiNPCs,
    backgroundNPCCount,
    pauseTime,
    resumeTime,
    setSpeed,
    setViewport,
  } = useWorldStore();

  // Format time display
  const formatTime = () => {
    if (!gameTime) return '--:--';
    const hour12 = gameTime.hour === 0 ? 12 : gameTime.hour > 12 ? gameTime.hour - 12 : gameTime.hour;
    const ampm = gameTime.hour >= 12 ? 'PM' : 'AM';
    const minute = gameTime.minute.toString().padStart(2, '0');
    return `${hour12}:${minute} ${ampm}`;
  };

  const handleZoomIn = () => {
    setViewport({ zoom: Math.min(2, viewport.zoom + 0.25) });
  };

  const handleZoomOut = () => {
    setViewport({ zoom: Math.max(0.25, viewport.zoom - 0.25) });
  };

  const handleResetView = () => {
    if (city) {
      setViewport({
        x: city.gridSize.width / 2,
        y: city.gridSize.height / 2,
        zoom: 1,
      });
    }
  };

  const handleTogglePause = () => {
    if (isPaused) {
      resumeTime();
    } else {
      pauseTime();
    }
  };

  const speedOptions = [
    { value: 5, label: '5x' },
    { value: 15, label: '15x' },
    { value: 30, label: '30x' },
    { value: 60, label: '60x' },
  ];

  return (
    <>
      {/* Time Display - Top Center */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-[var(--color-bgSecondary)]/90 backdrop-blur-sm border border-[var(--color-border)] rounded-lg px-4 py-2 shadow-lg">
        <div className="flex items-center gap-4">
          {/* Day and Time */}
          <div className="text-center">
            <div className="text-lg font-mono font-bold text-[var(--color-text)]">
              {formatTime()}
            </div>
            <div className="text-xs text-[var(--color-textMuted)]">
              {gameTime?.dayName || '---'}
            </div>
          </div>

          {/* Divider */}
          <div className="w-px h-8 bg-[var(--color-border)]" />

          {/* Time Controls */}
          <div className="flex items-center gap-2">
            {/* Pause/Play */}
            <button
              onClick={handleTogglePause}
              className="p-1.5 rounded hover:bg-[var(--color-bgTertiary)] transition-colors"
              title={isPaused ? 'Resume' : 'Pause'}
            >
              {isPaused ? (
                <PlayIcon className="w-4 h-4" />
              ) : (
                <PauseIcon className="w-4 h-4" />
              )}
            </button>

            {/* Speed Selector */}
            <select
              value={timeMultiplier}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="bg-[var(--color-bgTertiary)] border border-[var(--color-border)] rounded px-2 py-1 text-xs"
            >
              {speedOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* City Name - Top Left */}
      <div className="absolute top-3 left-3 bg-[var(--color-bgSecondary)]/90 backdrop-blur-sm border border-[var(--color-border)] rounded-lg px-3 py-2 shadow-lg">
        <div className="text-sm font-medium text-[var(--color-text)]">
          {city?.name || 'Loading...'}
        </div>
        <div className="text-xs text-[var(--color-textMuted)]">
          {gameTime?.period === 'night' ? 'Night' :
           gameTime?.period === 'morning' ? 'Morning' :
           gameTime?.period === 'afternoon' ? 'Afternoon' :
           gameTime?.period === 'evening' ? 'Evening' : ''}
        </div>
      </div>

      {/* Stats - Top Right */}
      <div className="absolute top-3 right-3 bg-[var(--color-bgSecondary)]/90 backdrop-blur-sm border border-[var(--color-border)] rounded-lg px-3 py-2 shadow-lg">
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-[var(--color-textMuted)]">AI NPCs:</span>
            <span className="font-medium">{aiNPCs.length}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-gray-500" />
            <span className="text-[var(--color-textMuted)]">Background:</span>
            <span className="font-medium">{backgroundNPCCount}</span>
          </div>
        </div>
      </div>

      {/* Zoom Controls - Bottom Right */}
      <div className="absolute bottom-3 right-3 bg-[var(--color-bgSecondary)]/90 backdrop-blur-sm border border-[var(--color-border)] rounded-lg shadow-lg">
        <div className="flex flex-col">
          <button
            onClick={handleZoomIn}
            className="p-2 hover:bg-[var(--color-bgTertiary)] transition-colors rounded-t-lg border-b border-[var(--color-border)]"
            title="Zoom In"
          >
            <ZoomInIcon className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetView}
            className="p-2 hover:bg-[var(--color-bgTertiary)] transition-colors border-b border-[var(--color-border)]"
            title="Reset View"
          >
            <span className="text-xs font-mono">{Math.round(viewport.zoom * 100)}%</span>
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 hover:bg-[var(--color-bgTertiary)] transition-colors rounded-b-lg"
            title="Zoom Out"
          >
            <ZoomOutIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Help Hint - Bottom Left */}
      <div className="absolute bottom-3 left-3 text-xs text-[var(--color-textMuted)] bg-[var(--color-bgSecondary)]/70 backdrop-blur-sm rounded px-2 py-1">
        Drag to pan, scroll to zoom
      </div>
    </>
  );
}

// ============================================================================
// Icons
// ============================================================================

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
    </svg>
  );
}

function PauseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M5.5 3a1.5 1.5 0 00-1.5 1.5v11a1.5 1.5 0 001.5 1.5h2a1.5 1.5 0 001.5-1.5v-11A1.5 1.5 0 007.5 3h-2zm7 0a1.5 1.5 0 00-1.5 1.5v11a1.5 1.5 0 001.5 1.5h2a1.5 1.5 0 001.5-1.5v-11A1.5 1.5 0 0014.5 3h-2z" clipRule="evenodd" />
    </svg>
  );
}

function ZoomInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
    </svg>
  );
}

function ZoomOutIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
    </svg>
  );
}
