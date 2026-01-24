import { useEffect } from 'react'
import { Desktop } from './components/desktop/Desktop'
import { BootScreen, LoginScreen } from './components/boot'
import { initializeDisplay } from './stores/displayStore'
import { useThemeStore } from './stores/themeStore'
import { useWSStore } from './stores/wsStore'
import { useSettingsStore } from './stores/settingsStore'
import { useBootStore } from './stores/bootStore'
import { useAccountStore } from './stores/accountStore'

export default function App() {
  const { currentTheme } = useThemeStore()
  const connect = useWSStore((state) => state.connect)
  const skipBootSequence = useSettingsStore((state) => state.developer.skipBootSequence)
  const bootPhase = useBootStore((state) => state.phase)
  const setPhase = useBootStore((state) => state.setPhase)
  const activeAccountId = useAccountStore((state) => state.activeAccountId)
  const accounts = useAccountStore((state) => state.accounts)
  const selectAccount = useAccountStore((state) => state.selectAccount)
  const loadAccounts = useAccountStore((state) => state.loadAccounts)

  useEffect(() => {
    initializeDisplay()
    // Initialize WebSocket connection on app startup (only if not skipping boot)
    if (skipBootSequence) {
      connect()
    }
  }, [skipBootSequence])

  // Apply theme on mount and whenever it changes
  useEffect(() => {
    const root = document.documentElement
    Object.entries(currentTheme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value)
    })
  }, [currentTheme])

  // Dev mode: Skip boot sequence entirely
  useEffect(() => {
    if (skipBootSequence) {
      // Wait for WebSocket connection, then auto-select first account or skip
      const setupDevMode = async () => {
        // Give time for WebSocket to connect
        await new Promise((resolve) => setTimeout(resolve, 500))

        try {
          await loadAccounts()
          const state = useAccountStore.getState()
          if (state.accounts.length > 0) {
            // Auto-select first account
            await selectAccount(state.accounts[0].id)
          }
        } catch {
          // If accounts fail to load, just proceed to desktop anyway
          console.log('[Dev Mode] Accounts not loaded, proceeding without account')
        }
        setPhase('ready')
      }
      setupDevMode()
    }
  }, [skipBootSequence, setPhase, loadAccounts, selectAccount])

  // Dev shortcut: Skip boot and login
  if (skipBootSequence && bootPhase === 'ready') {
    return <Desktop />
  }

  // Normal boot sequence
  switch (bootPhase) {
    case 'booting':
      return <BootScreen />
    case 'login':
      return <LoginScreen />
    case 'ready':
      return <Desktop />
    default:
      return <BootScreen />
  }
}