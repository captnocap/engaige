/**
 * Simulation Store
 *
 * Manages game time and the simulation loop that drives autonomous NPC behavior.
 * Controls the pace at which in-game time passes and triggers periodic updates
 * to all systems that need time-based processing.
 *
 * Key concept: Real-time vs Game-time
 * - tickIntervalMs: How often (in real ms) we advance the simulation
 * - gameTimeAdvanceMinutes: How many in-game minutes pass per tick
 * - speedMultiplier: Allows fast-forward (2x, 4x, etc.)
 *
 * Example: tickIntervalMs=1000, gameTimeAdvanceMinutes=15, speed=1x
 * → Every real second, 15 in-game minutes pass
 * → 1 real minute = 15 in-game hours
 * → 1 real hour = ~37 in-game days
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useAwarenessStore } from './awarenessStore.js'

// ============================================================================
// Types
// ============================================================================

export interface SimulationState {
  // Current in-game time
  gameTime: Date

  // Simulation control
  isRunning: boolean
  isPaused: boolean

  // Timing configuration
  tickIntervalMs: number          // Real-time ms between ticks (default: 1000 = 1 second)
  gameTimeAdvanceMinutes: number  // In-game minutes per tick (default: 15)
  speedMultiplier: number         // 1 = normal, 2 = 2x speed, etc.

  // Statistics
  totalTicksProcessed: number
  lastTickAt: string | null

  // Internal timer reference (not persisted)
  _timerId: ReturnType<typeof setInterval> | null

  // ========================================================================
  // Actions
  // ========================================================================

  // Simulation control
  start: () => void
  stop: () => void
  pause: () => void
  resume: () => void
  tick: () => void

  // Configuration
  setSpeed: (multiplier: number) => void
  setTickInterval: (ms: number) => void
  setGameTimeAdvance: (minutes: number) => void

  // Time manipulation (for testing/debugging)
  setGameTime: (date: Date) => void
  advanceGameTime: (minutes: number) => void

  // Queries
  getGameTimeFormatted: () => string
  getGameHour: () => number
  isNightTime: () => boolean
}

// ============================================================================
// Default Configuration
// ============================================================================

const DEFAULT_TICK_INTERVAL_MS = 1000        // 1 second real-time
const DEFAULT_GAME_ADVANCE_MINUTES = 15      // 15 in-game minutes per tick
const DEFAULT_SPEED_MULTIPLIER = 1

// Start game at a reasonable time (9:00 AM on a Monday)
function getDefaultGameTime(): Date {
  const now = new Date()
  now.setHours(9, 0, 0, 0)
  // Set to next Monday
  const day = now.getDay()
  const daysUntilMonday = day === 0 ? 1 : day === 1 ? 0 : 8 - day
  now.setDate(now.getDate() + daysUntilMonday)
  return now
}

// ============================================================================
// Store Implementation
// ============================================================================

export const useSimulationStore = create<SimulationState>()(
  persist(
    (set, get) => ({
      // Initial state
      gameTime: getDefaultGameTime(),
      isRunning: false,
      isPaused: false,
      tickIntervalMs: DEFAULT_TICK_INTERVAL_MS,
      gameTimeAdvanceMinutes: DEFAULT_GAME_ADVANCE_MINUTES,
      speedMultiplier: DEFAULT_SPEED_MULTIPLIER,
      totalTicksProcessed: 0,
      lastTickAt: null,
      _timerId: null,

      // ========================================================================
      // Simulation Control
      // ========================================================================

      start: () => {
        const { isRunning, _timerId, tickIntervalMs, speedMultiplier, tick } = get()

        if (isRunning && _timerId) {
          console.log('[Simulation] Already running')
          return
        }

        // Clear any existing timer
        if (_timerId) {
          clearInterval(_timerId)
        }

        // Calculate actual interval based on speed multiplier
        const actualInterval = Math.max(100, tickIntervalMs / speedMultiplier)

        const timerId = setInterval(() => {
          const state = get()
          if (!state.isPaused) {
            state.tick()
          }
        }, actualInterval)

        set({
          isRunning: true,
          isPaused: false,
          _timerId: timerId,
        })

        console.log(`[Simulation] Started (tick every ${actualInterval}ms at ${speedMultiplier}x speed)`)
      },

      stop: () => {
        const { _timerId } = get()

        if (_timerId) {
          clearInterval(_timerId)
        }

        set({
          isRunning: false,
          isPaused: false,
          _timerId: null,
        })

        console.log('[Simulation] Stopped')
      },

      pause: () => {
        set({ isPaused: true })
        console.log('[Simulation] Paused')
      },

      resume: () => {
        set({ isPaused: false })
        console.log('[Simulation] Resumed')
      },

      tick: () => {
        const { gameTime, gameTimeAdvanceMinutes, speedMultiplier, totalTicksProcessed } = get()

        // Advance game time
        const newGameTime = new Date(gameTime)
        newGameTime.setMinutes(newGameTime.getMinutes() + (gameTimeAdvanceMinutes * speedMultiplier))

        // Update state
        set({
          gameTime: newGameTime,
          totalTicksProcessed: totalTicksProcessed + 1,
          lastTickAt: new Date().toISOString(),
        })

        // ====================================================================
        // Trigger all time-based systems
        // ====================================================================

        // 1. NPC Social Media Checks
        // NPCs check their platforms based on their habits
        useAwarenessStore.getState().simulateSocialMediaChecks()

        // NOTE: Drama engine now runs server-side via server/src/services/drama-engine.ts
        // Server handles relationship-based posts and affair discovery

        // Log occasional status (every 4 ticks = 1 in-game hour with default settings)
        if (totalTicksProcessed % 4 === 0) {
          const formatted = get().getGameTimeFormatted()
          console.log(`[Simulation] Game time: ${formatted}`)
        }
      },

      // ========================================================================
      // Configuration
      // ========================================================================

      setSpeed: (multiplier: number) => {
        const { isRunning, stop, start } = get()

        set({ speedMultiplier: Math.max(0.25, Math.min(10, multiplier)) })

        // Restart timer with new speed if running
        if (isRunning) {
          stop()
          start()
        }

        console.log(`[Simulation] Speed set to ${multiplier}x`)
      },

      setTickInterval: (ms: number) => {
        const { isRunning, stop, start } = get()

        set({ tickIntervalMs: Math.max(100, ms) })

        // Restart timer with new interval if running
        if (isRunning) {
          stop()
          start()
        }
      },

      setGameTimeAdvance: (minutes: number) => {
        set({ gameTimeAdvanceMinutes: Math.max(1, Math.min(60, minutes)) })
      },

      // ========================================================================
      // Time Manipulation
      // ========================================================================

      setGameTime: (date: Date) => {
        set({ gameTime: date })
        console.log(`[Simulation] Game time set to ${date.toLocaleString()}`)
      },

      advanceGameTime: (minutes: number) => {
        const { gameTime } = get()
        const newGameTime = new Date(gameTime)
        newGameTime.setMinutes(newGameTime.getMinutes() + minutes)
        set({ gameTime: newGameTime })
      },

      // ========================================================================
      // Queries
      // ========================================================================

      getGameTimeFormatted: () => {
        const { gameTime } = get()
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        const day = days[gameTime.getDay()]
        const time = gameTime.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        })
        return `${day} ${time}`
      },

      getGameHour: () => {
        return get().gameTime.getHours()
      },

      isNightTime: () => {
        const hour = get().getGameHour()
        return hour >= 22 || hour < 6
      },
    }),
    {
      name: 'engaige-simulation',
      partialize: (state) => ({
        gameTime: state.gameTime,
        tickIntervalMs: state.tickIntervalMs,
        gameTimeAdvanceMinutes: state.gameTimeAdvanceMinutes,
        speedMultiplier: state.speedMultiplier,
        totalTicksProcessed: state.totalTicksProcessed,
        // Note: isRunning is NOT persisted - simulation must be manually started
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Convert gameTime string back to Date object
          if (typeof state.gameTime === 'string') {
            state.gameTime = new Date(state.gameTime)
          }
        }
      },
    }
  )
)

// ============================================================================
// Selector Hooks
// ============================================================================

export const useGameTime = () => {
  return useSimulationStore(state => state.gameTime)
}

export const useGameTimeFormatted = () => {
  return useSimulationStore(state => state.getGameTimeFormatted())
}

export const useIsSimulationRunning = () => {
  return useSimulationStore(state => state.isRunning)
}

export const useSimulationSpeed = () => {
  return useSimulationStore(state => state.speedMultiplier)
}

export const useIsNightTime = () => {
  return useSimulationStore(state => state.isNightTime())
}
