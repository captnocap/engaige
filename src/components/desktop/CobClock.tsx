/**
 * CobClock - Clock / Stopwatch / Timer
 *
 * Three tabs: Analog+Digital clock, Stopwatch with laps, Countdown timer.
 * Right-click context menu for copy time, reset actions.
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { ContextMenu } from '../ui/ContextMenu.js'
import { useContextMenu } from '../../hooks/useContextMenu.js'
import { clockPreset } from '../../hooks/useContextMenuPresets.js'

type Tab = 'clock' | 'stopwatch' | 'timer'

function formatTime(ms: number): string {
  const totalSec = Math.floor(ms / 1000)
  const min = Math.floor(totalSec / 60)
  const sec = totalSec % 60
  const centisec = Math.floor((ms % 1000) / 10)
  return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}.${centisec.toString().padStart(2, '0')}`
}

function AnalogClock({ time }: { time: Date }) {
  const hours = time.getHours() % 12
  const minutes = time.getMinutes()
  const seconds = time.getSeconds()

  const hourAngle = (hours + minutes / 60) * 30
  const minuteAngle = (minutes + seconds / 60) * 6
  const secondAngle = seconds * 6

  return (
    <svg viewBox="0 0 200 200" className="w-48 h-48">
      {/* Face */}
      <circle cx="100" cy="100" r="95" fill="var(--color-bgSecondary)" stroke="var(--color-border)" strokeWidth="2" />
      {/* Hour markers */}
      {Array.from({ length: 12 }, (_, i) => {
        const angle = (i * 30 - 90) * (Math.PI / 180)
        const isQuarter = i % 3 === 0
        const outer = 88
        const inner = isQuarter ? 75 : 80
        return (
          <line
            key={i}
            x1={100 + inner * Math.cos(angle)} y1={100 + inner * Math.sin(angle)}
            x2={100 + outer * Math.cos(angle)} y2={100 + outer * Math.sin(angle)}
            stroke="var(--color-text)" strokeWidth={isQuarter ? 2.5 : 1} strokeLinecap="round"
          />
        )
      })}
      {/* Hour hand */}
      <line
        x1="100" y1="100"
        x2={100 + 50 * Math.cos((hourAngle - 90) * (Math.PI / 180))}
        y2={100 + 50 * Math.sin((hourAngle - 90) * (Math.PI / 180))}
        stroke="var(--color-text)" strokeWidth="4" strokeLinecap="round"
      />
      {/* Minute hand */}
      <line
        x1="100" y1="100"
        x2={100 + 70 * Math.cos((minuteAngle - 90) * (Math.PI / 180))}
        y2={100 + 70 * Math.sin((minuteAngle - 90) * (Math.PI / 180))}
        stroke="var(--color-text)" strokeWidth="2.5" strokeLinecap="round"
      />
      {/* Second hand */}
      <line
        x1="100" y1="100"
        x2={100 + 78 * Math.cos((secondAngle - 90) * (Math.PI / 180))}
        y2={100 + 78 * Math.sin((secondAngle - 90) * (Math.PI / 180))}
        stroke="#00ff88" strokeWidth="1.5" strokeLinecap="round"
      />
      {/* Center dot */}
      <circle cx="100" cy="100" r="4" fill="#00ff88" />
    </svg>
  )
}

function ClockTab() {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center gap-4 flex-1">
      <AnalogClock time={time} />
      <div className="text-4xl font-mono text-[var(--color-text)]">
        {time.toLocaleTimeString()}
      </div>
      <div className="text-sm text-[var(--color-textSecondary)]">
        {time.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      </div>
    </div>
  )
}

function StopwatchTab({ resetRef }: { resetRef: React.MutableRefObject<(() => void) | null> }) {
  const [elapsed, setElapsed] = useState(0)
  const [running, setRunning] = useState(false)
  const [laps, setLaps] = useState<number[]>([])
  const startTimeRef = useRef(0)
  const rafRef = useRef(0)

  const tick = useCallback(() => {
    setElapsed(Date.now() - startTimeRef.current)
    rafRef.current = requestAnimationFrame(tick)
  }, [])

  const start = useCallback(() => {
    startTimeRef.current = Date.now() - elapsed
    setRunning(true)
    rafRef.current = requestAnimationFrame(tick)
  }, [elapsed, tick])

  const stop = useCallback(() => {
    setRunning(false)
    cancelAnimationFrame(rafRef.current)
  }, [])

  const reset = useCallback(() => {
    stop()
    setElapsed(0)
    setLaps([])
  }, [stop])

  const lap = useCallback(() => {
    setLaps(prev => [elapsed, ...prev])
  }, [elapsed])

  // Expose reset to parent
  resetRef.current = reset

  useEffect(() => {
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  return (
    <div className="flex flex-col items-center flex-1 p-4">
      <div className="text-5xl font-mono text-[var(--color-text)] my-6">
        {formatTime(elapsed)}
      </div>
      <div className="flex gap-3 mb-4">
        {!running ? (
          <button onClick={start} className="px-6 py-2 rounded-lg bg-[#00ff88] text-[#0a0a0a] font-medium hover:bg-[#00dd77]">
            {elapsed > 0 ? 'Resume' : 'Start'}
          </button>
        ) : (
          <button onClick={stop} className="px-6 py-2 rounded-lg bg-red-500/20 text-red-400 font-medium hover:bg-red-500/30">
            Stop
          </button>
        )}
        {running && (
          <button onClick={lap} className="px-6 py-2 rounded-lg bg-[var(--color-bgSecondary)] text-[var(--color-text)] font-medium hover:bg-[var(--color-border)]">
            Lap
          </button>
        )}
        {!running && elapsed > 0 && (
          <button onClick={reset} className="px-6 py-2 rounded-lg bg-[var(--color-bgSecondary)] text-[var(--color-textSecondary)] font-medium hover:bg-[var(--color-border)]">
            Reset
          </button>
        )}
      </div>
      {laps.length > 0 && (
        <div className="w-full max-h-40 overflow-y-auto border border-[var(--color-border)] rounded-lg">
          {laps.map((lapTime, i) => (
            <div key={i} className="flex justify-between px-4 py-1.5 text-sm border-b border-[var(--color-border)] last:border-0">
              <span className="text-[var(--color-textSecondary)]">Lap {laps.length - i}</span>
              <span className="font-mono text-[var(--color-text)]">{formatTime(lapTime)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function TimerTab({ resetRef }: { resetRef: React.MutableRefObject<(() => void) | null> }) {
  const [inputMin, setInputMin] = useState(5)
  const [inputSec, setInputSec] = useState(0)
  const [remaining, setRemaining] = useState(0)
  const [running, setRunning] = useState(false)
  const [finished, setFinished] = useState(false)
  const endTimeRef = useRef(0)
  const rafRef = useRef(0)

  const tick = useCallback(() => {
    const left = Math.max(0, endTimeRef.current - Date.now())
    setRemaining(left)
    if (left <= 0) {
      setRunning(false)
      setFinished(true)
      return
    }
    rafRef.current = requestAnimationFrame(tick)
  }, [])

  const start = useCallback(() => {
    const totalMs = running ? remaining : (inputMin * 60 + inputSec) * 1000
    if (totalMs <= 0) return
    endTimeRef.current = Date.now() + totalMs
    setRemaining(totalMs)
    setRunning(true)
    setFinished(false)
    rafRef.current = requestAnimationFrame(tick)
  }, [inputMin, inputSec, running, remaining, tick])

  const pause = useCallback(() => {
    setRunning(false)
    cancelAnimationFrame(rafRef.current)
  }, [])

  const reset = useCallback(() => {
    pause()
    setRemaining(0)
    setFinished(false)
  }, [pause])

  // Expose reset to parent
  resetRef.current = reset

  useEffect(() => {
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  const totalMin = Math.floor(remaining / 60000)
  const totalSec = Math.floor((remaining % 60000) / 1000)

  return (
    <div className="flex flex-col items-center justify-center flex-1 p-4 gap-6">
      {!running && remaining === 0 && !finished ? (
        <div className="flex items-center gap-2">
          <div className="flex flex-col items-center">
            <label className="text-xs text-[var(--color-textSecondary)] mb-1">Min</label>
            <input
              type="number" min={0} max={99} value={inputMin}
              onChange={e => setInputMin(Math.max(0, Math.min(99, parseInt(e.target.value) || 0)))}
              className="w-20 h-14 text-center text-3xl font-mono bg-[var(--color-bgSecondary)] border border-[var(--color-border)] rounded-lg text-[var(--color-text)] outline-none focus:border-[#00ff88]"
            />
          </div>
          <span className="text-3xl font-mono text-[var(--color-text)] mt-4">:</span>
          <div className="flex flex-col items-center">
            <label className="text-xs text-[var(--color-textSecondary)] mb-1">Sec</label>
            <input
              type="number" min={0} max={59} value={inputSec}
              onChange={e => setInputSec(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
              className="w-20 h-14 text-center text-3xl font-mono bg-[var(--color-bgSecondary)] border border-[var(--color-border)] rounded-lg text-[var(--color-text)] outline-none focus:border-[#00ff88]"
            />
          </div>
        </div>
      ) : (
        <div className={`text-6xl font-mono ${finished ? 'text-[#00ff88] animate-pulse' : 'text-[var(--color-text)]'}`}>
          {totalMin.toString().padStart(2, '0')}:{totalSec.toString().padStart(2, '0')}
        </div>
      )}

      {finished && (
        <div className="text-lg text-[#00ff88] font-medium">Time's up!</div>
      )}

      <div className="flex gap-3">
        {!running ? (
          <button onClick={start} className="px-6 py-2 rounded-lg bg-[#00ff88] text-[#0a0a0a] font-medium hover:bg-[#00dd77]">
            {remaining > 0 ? 'Resume' : 'Start'}
          </button>
        ) : (
          <button onClick={pause} className="px-6 py-2 rounded-lg bg-amber-500/20 text-amber-400 font-medium hover:bg-amber-500/30">
            Pause
          </button>
        )}
        {(remaining > 0 || finished) && (
          <button onClick={reset} className="px-6 py-2 rounded-lg bg-[var(--color-bgSecondary)] text-[var(--color-textSecondary)] font-medium hover:bg-[var(--color-border)]">
            Reset
          </button>
        )}
      </div>
    </div>
  )
}

export function CobClock() {
  const [tab, setTab] = useState<Tab>('clock')
  const ctx = useContextMenu()
  const stopwatchResetRef = useRef<(() => void) | null>(null)
  const timerResetRef = useRef<(() => void) | null>(null)

  const handleCopyTime = useCallback(() => {
    navigator.clipboard.writeText(new Date().toLocaleTimeString()).catch(() => {})
  }, [])

  return (
    <div
      className="flex flex-col h-full bg-[var(--color-bg)]"
      onContextMenu={(e) => ctx.show(e)}
    >
      {/* Tab bar */}
      <div className="flex border-b border-[var(--color-border)]">
        {(['clock', 'stopwatch', 'timer'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 text-sm font-medium capitalize transition-colors ${
              tab === t
                ? 'text-[#00ff88] border-b-2 border-[#00ff88]'
                : 'text-[var(--color-textSecondary)] hover:text-[var(--color-text)]'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 flex">
        {tab === 'clock' && <ClockTab />}
        {tab === 'stopwatch' && <StopwatchTab resetRef={stopwatchResetRef} />}
        {tab === 'timer' && <TimerTab resetRef={timerResetRef} />}
      </div>

      {/* Context Menu */}
      {ctx.visible && (
        <ContextMenu
          items={clockPreset({
            onCopyTime: handleCopyTime,
            activeTab: tab,
            onResetStopwatch: stopwatchResetRef.current ? () => stopwatchResetRef.current?.() : undefined,
            onResetTimer: timerResetRef.current ? () => timerResetRef.current?.() : undefined,
          })}
          x={ctx.x}
          y={ctx.y}
          onClose={ctx.hide}
        />
      )}
    </div>
  )
}
