/**
 * OS Theme Store
 *
 * Detects the operating system and provides platform-specific UI configuration
 * for window chrome, taskbar, and other OS-like elements.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ============================================================================
// Types
// ============================================================================

export type OSType = 'mac' | 'windows' | 'linux'

export type WindowButtonPosition = 'left' | 'right'

export type WindowButtonStyle = 'traffic-light' | 'windows' | 'linux'

export interface WindowChromeConfig {
  buttonPosition: WindowButtonPosition
  buttonStyle: WindowButtonStyle
  showButtonLabels: boolean
  titleBarHeight: number
  cornerRadius: number
}

export interface TaskbarConfig {
  position: 'bottom' | 'top'
  height: number
  showHub: boolean
  hubPosition: 'left' | 'right'
  pinnedNPCIds: string[]
  showNPCStrip: boolean
}

export interface OSThemeState {
  // Detected OS
  detectedOS: OSType

  // Override (user can choose different style)
  overrideOS: OSType | null

  // Computed current OS style
  currentOS: OSType

  // Configs
  windowChrome: WindowChromeConfig
  taskbar: TaskbarConfig

  // Actions
  setOverrideOS: (os: OSType | null) => void
  resetToDetected: () => void
  pinNPC: (id: string) => void
  unpinNPC: (id: string) => void
  reorderPinnedNPCs: (ids: string[]) => void
}

// ============================================================================
// OS Detection
// ============================================================================

function detectOS(): OSType {
  const platform = navigator.platform.toLowerCase()
  const userAgent = navigator.userAgent.toLowerCase()

  if (platform.includes('mac') || userAgent.includes('mac')) {
    return 'mac'
  }
  if (platform.includes('win') || userAgent.includes('windows')) {
    return 'windows'
  }
  return 'linux'
}

// ============================================================================
// Config Presets
// ============================================================================

const WINDOW_CHROME_PRESETS: Record<OSType, WindowChromeConfig> = {
  mac: {
    buttonPosition: 'left',
    buttonStyle: 'traffic-light',
    showButtonLabels: false,
    titleBarHeight: 36,
    cornerRadius: 10,
  },
  windows: {
    buttonPosition: 'right',
    buttonStyle: 'windows',
    showButtonLabels: false,
    titleBarHeight: 32,
    cornerRadius: 8,
  },
  linux: {
    buttonPosition: 'right',
    buttonStyle: 'linux',
    showButtonLabels: false,
    titleBarHeight: 34,
    cornerRadius: 6,
  },
}

const TASKBAR_PRESETS: Record<OSType, TaskbarConfig> = {
  mac: {
    position: 'bottom',
    height: 48,
    showHub: true,
    hubPosition: 'left',
    pinnedNPCIds: ['npc_sarah', 'npc_jake', 'npc_emily'],
    showNPCStrip: true,
  },
  windows: {
    position: 'bottom',
    height: 48,
    showHub: true,
    hubPosition: 'left',
    pinnedNPCIds: ['npc_sarah', 'npc_jake', 'npc_emily'],
    showNPCStrip: true,
  },
  linux: {
    position: 'bottom',
    height: 48,
    showHub: true,
    hubPosition: 'left',
    pinnedNPCIds: ['npc_sarah', 'npc_jake', 'npc_emily'],
    showNPCStrip: true,
  },
}

// ============================================================================
// Store
// ============================================================================

export const useOSThemeStore = create<OSThemeState>()(
  persist(
    (set, get) => {
      const detectedOS = detectOS()

      return {
        detectedOS,
        overrideOS: null,
        currentOS: detectedOS,
        windowChrome: WINDOW_CHROME_PRESETS[detectedOS],
        taskbar: TASKBAR_PRESETS[detectedOS],

        setOverrideOS: (os) => {
          const effectiveOS = os || get().detectedOS
          const currentTaskbar = get().taskbar
          set({
            overrideOS: os,
            currentOS: effectiveOS,
            windowChrome: WINDOW_CHROME_PRESETS[effectiveOS],
            taskbar: {
              ...TASKBAR_PRESETS[effectiveOS],
              pinnedNPCIds: currentTaskbar.pinnedNPCIds,
              showNPCStrip: currentTaskbar.showNPCStrip,
            },
          })
        },

        resetToDetected: () => {
          const detected = get().detectedOS
          const currentTaskbar = get().taskbar
          set({
            overrideOS: null,
            currentOS: detected,
            windowChrome: WINDOW_CHROME_PRESETS[detected],
            taskbar: {
              ...TASKBAR_PRESETS[detected],
              pinnedNPCIds: currentTaskbar.pinnedNPCIds,
              showNPCStrip: currentTaskbar.showNPCStrip,
            },
          })
        },

        pinNPC: (id) => {
          const current = get().taskbar.pinnedNPCIds
          if (current.includes(id) || current.length >= 5) return
          set({
            taskbar: { ...get().taskbar, pinnedNPCIds: [...current, id] },
          })
        },

        unpinNPC: (id) => {
          set({
            taskbar: {
              ...get().taskbar,
              pinnedNPCIds: get().taskbar.pinnedNPCIds.filter(npcId => npcId !== id),
            },
          })
        },

        reorderPinnedNPCs: (ids) => {
          set({
            taskbar: { ...get().taskbar, pinnedNPCIds: ids.slice(0, 5) },
          })
        },
      }
    },
    {
      name: 'os-theme-storage',
      partialize: (state) => ({
        overrideOS: state.overrideOS,
        pinnedNPCIds: state.taskbar.pinnedNPCIds,
      }),
      onRehydrate: (state) => () => {
        // After rehydration, recalculate currentOS and configs
        if (state) {
          const effectiveOS = state.overrideOS || state.detectedOS
          state.currentOS = effectiveOS
          state.windowChrome = WINDOW_CHROME_PRESETS[effectiveOS]
          state.taskbar = {
            ...TASKBAR_PRESETS[effectiveOS],
            // Restore persisted pinned NPCs
            pinnedNPCIds: (state as unknown as { pinnedNPCIds?: string[] }).pinnedNPCIds ?? [],
          }
        }
      },
    }
  )
)

// ============================================================================
// Selectors
// ============================================================================

export const selectWindowChrome = (state: OSThemeState) => state.windowChrome
export const selectTaskbar = (state: OSThemeState) => state.taskbar
export const selectCurrentOS = (state: OSThemeState) => state.currentOS
