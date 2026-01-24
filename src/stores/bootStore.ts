/**
 * Boot Store
 *
 * Manages the boot sequence state for the game startup.
 * Controls progression through: booting -> login -> ready
 */

import { create } from 'zustand'

export type BootPhase = 'booting' | 'login' | 'ready'

export interface BootMessage {
  timestamp: number
  message: string
  type: 'info' | 'success' | 'error' | 'warning'
}

export interface BootState {
  phase: BootPhase
  bootMessages: BootMessage[]
  bootComplete: boolean
  bootProgress: number // 0-100
  bootError: string | null

  // Actions
  addBootMessage: (message: string, type?: BootMessage['type']) => void
  setPhase: (phase: BootPhase) => void
  setBootProgress: (progress: number) => void
  setBootError: (error: string | null) => void
  completeBootSequence: () => void
  reset: () => void
}

// Boot messages for flavor (mixed with real ones)
const FLAVOR_MESSAGES = [
  'Warming up neural pathways...',
  'Calibrating relationship algorithms...',
  'Loading existential dread... 100%',
  'Preparing NPCs for social interaction...',
  'Shuffling virtual dating cards...',
  'Initializing personality matrices...',
  'Loading social anxiety protocols...',
  'Brewing virtual coffee...',
  'Charging conversation batteries...',
  'Syncing emotional resonance...',
]

export const useBootStore = create<BootState>((set, get) => ({
  phase: 'booting',
  bootMessages: [],
  bootComplete: false,
  bootProgress: 0,
  bootError: null,

  addBootMessage: (message, type = 'info') => {
    set((state) => ({
      bootMessages: [
        ...state.bootMessages,
        {
          timestamp: Date.now(),
          message,
          type,
        },
      ],
    }))
  },

  setPhase: (phase) => {
    set({ phase })
  },

  setBootProgress: (progress) => {
    set({ bootProgress: Math.min(100, Math.max(0, progress)) })
  },

  setBootError: (error) => {
    set({ bootError: error })
    if (error) {
      get().addBootMessage(error, 'error')
    }
  },

  completeBootSequence: () => {
    set({
      bootComplete: true,
      bootProgress: 100,
      phase: 'login',
    })
  },

  reset: () => {
    set({
      phase: 'booting',
      bootMessages: [],
      bootComplete: false,
      bootProgress: 0,
      bootError: null,
    })
  },
}))

/**
 * Run the boot sequence with a mix of real and flavor messages
 */
export async function runBootSequence(onRealStep?: (step: string) => Promise<void>): Promise<void> {
  const store = useBootStore.getState()
  const { addBootMessage, setBootProgress, completeBootSequence, setBootError } = store

  const steps: Array<{ message: string; progress: number; real?: boolean; action?: () => Promise<void> }> = [
    { message: 'engAIge kernel v0.1.0', progress: 5 },
    { message: 'Initializing event bus... OK', progress: 10 },
    { message: FLAVOR_MESSAGES[Math.floor(Math.random() * FLAVOR_MESSAGES.length)], progress: 15 },
    { message: 'Loading AI providers...', progress: 20, real: true },
    { message: 'Connecting to server...', progress: 30, real: true },
    { message: FLAVOR_MESSAGES[Math.floor(Math.random() * FLAVOR_MESSAGES.length)], progress: 40 },
    { message: 'Loading global configuration...', progress: 50, real: true },
    { message: FLAVOR_MESSAGES[Math.floor(Math.random() * FLAVOR_MESSAGES.length)], progress: 60 },
    { message: 'Starting background scheduler... OK', progress: 70 },
    { message: 'Loading accounts...', progress: 80, real: true },
    { message: FLAVOR_MESSAGES[Math.floor(Math.random() * FLAVOR_MESSAGES.length)], progress: 90 },
    { message: 'System ready.', progress: 100 },
  ]

  try {
    for (const step of steps) {
      const formattedTime = (Date.now() % 100000) / 1000
      const prefix = `[${formattedTime.toFixed(6).padStart(12, ' ')}]`
      addBootMessage(`${prefix} ${step.message}`)
      setBootProgress(step.progress)

      if (step.real && onRealStep) {
        await onRealStep(step.message)
      }

      // Small delay between messages for effect
      await new Promise((resolve) => setTimeout(resolve, 100 + Math.random() * 200))
    }

    completeBootSequence()
  } catch (error) {
    setBootError(error instanceof Error ? error.message : 'Boot sequence failed')
    throw error
  }
}

export default useBootStore
