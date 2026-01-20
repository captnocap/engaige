import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getCurrentWindow, currentMonitor, availableMonitors, type Monitor } from '@tauri-apps/api/window'

interface DisplaySettings {
  fullscreen: boolean
  monitorName: string | null
}

interface DisplayState extends DisplaySettings {
  monitors: Monitor[]
  currentMonitor: Monitor | null

  loadMonitors: () => Promise<void>
  setFullscreen: (fullscreen: boolean) => Promise<void>
  setMonitor: (monitorName: string | null) => Promise<void>
  applySettings: () => Promise<void>
}

export const useDisplayStore = create<DisplayState>()(
  persist(
    (set, get) => ({
      fullscreen: true,
      monitorName: null,
      monitors: [],
      currentMonitor: null,

      loadMonitors: async () => {
        try {
          console.log('displayStore.loadMonitors: Starting...')
          const monitors = await availableMonitors()
          console.log('displayStore.loadMonitors: Got monitors:', monitors)
          const current = await currentMonitor()
          console.log('displayStore.loadMonitors: Got current monitor:', current)
          set({ monitors, currentMonitor: current })
          console.log('displayStore.loadMonitors: State updated')
        } catch (e) {
          console.error('displayStore.loadMonitors: Failed -', e)
        }
      },

      setFullscreen: async (fullscreen: boolean) => {
        set({ fullscreen })
        await get().applySettings()
      },

      setMonitor: async (monitorName: string | null) => {
        set({ monitorName })
        await get().applySettings()
      },

      applySettings: async () => {
        const { fullscreen, monitorName, monitors } = get()
        const win = getCurrentWindow()

        try {
          if (fullscreen) {
            const targetMonitor = monitorName
              ? monitors.find(m => m.name === monitorName)
              : monitors[0]

            if (targetMonitor) {
              await win.setPosition(targetMonitor.position)
              await win.setFullscreen(true)
            } else {
              await win.setFullscreen(true)
            }
          } else {
            await win.setFullscreen(false)
            await win.setSize({ type: 'Logical', width: 1280, height: 800 })
            await win.center()
          }
        } catch (e) {
          console.error('Failed to apply display settings:', e)
        }
      },
    }),
    {
      name: 'base-arch-display-settings',
      partialize: (state) => ({
        fullscreen: state.fullscreen,
        monitorName: state.monitorName,
      }),
    }
  )
)

export async function initializeDisplay() {
  console.log('initializeDisplay: Starting...')
  const store = useDisplayStore.getState()
  console.log('initializeDisplay: Calling loadMonitors...')
  await store.loadMonitors()
  console.log('initializeDisplay: Calling applySettings...')
  await store.applySettings()
  console.log('initializeDisplay: Complete. Monitors:', useDisplayStore.getState().monitors)
}