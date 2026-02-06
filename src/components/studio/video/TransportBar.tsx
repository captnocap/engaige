/**
 * Transport Bar
 *
 * Play/Pause, time display, seek slider, and loop toggle
 * between the preview and timeline.
 */

import { useCallback } from 'react';
import { useVideoComposition } from '../hooks/useVideoComposition.js';
import { PlayIcon, PauseIcon, LoopIcon } from '../icons/StudioIcons.js';

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function TransportBar() {
  const { composition, togglePlayPause, setTime, setComposition } = useVideoComposition();

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setTime(Number(e.target.value));
  }, [setTime]);

  const handleSeekClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setTime(percent * composition.duration);
  }, [setTime, composition.duration]);

  const toggleLoop = useCallback(() => {
    setComposition({ loop: !composition.loop });
  }, [setComposition, composition.loop]);

  return (
    <div
      className="flex items-center gap-3 px-3"
      style={{
        height: 36,
        background: 'var(--studio-panel-header, #2a2a2a)',
        borderTop: '1px solid var(--studio-border-subtle, #333)',
        borderBottom: '1px solid var(--studio-border-subtle, #333)',
      }}
    >
      {/* Play/Pause */}
      <button
        onClick={togglePlayPause}
        className="studio-toolbar-btn"
        style={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        title={composition.isPlaying ? 'Pause (Space)' : 'Play (Space)'}
      >
        {composition.isPlaying
          ? <PauseIcon size={14} />
          : <PlayIcon size={14} />
        }
      </button>

      {/* Time display */}
      <span
        className="font-mono text-xs tabular-nums"
        style={{ color: 'var(--studio-text, #ccc)', minWidth: 80, textAlign: 'center' }}
      >
        {formatTime(composition.currentTime)} / {formatTime(composition.duration)}
      </span>

      {/* Seek bar */}
      <div
        className="flex-1 h-1.5 rounded-full cursor-pointer relative group"
        style={{ background: 'var(--studio-bg-darkest, #1a1a1a)' }}
        onClick={handleSeekClick}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: `${composition.duration > 0 ? (composition.currentTime / composition.duration) * 100 : 0}%`,
            background: 'var(--studio-accent, #4a6cf7)',
          }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          style={{
            left: `calc(${composition.duration > 0 ? (composition.currentTime / composition.duration) * 100 : 0}% - 6px)`,
            background: '#fff',
            boxShadow: '0 0 4px rgba(0,0,0,0.5)',
          }}
        />
      </div>

      {/* Loop toggle */}
      <button
        onClick={toggleLoop}
        className="studio-toolbar-btn"
        style={{
          width: 24,
          height: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: composition.loop ? 1 : 0.4,
        }}
        title={composition.loop ? 'Loop: On' : 'Loop: Off'}
      >
        <LoopIcon size={14} />
      </button>
    </div>
  );
}
