import { useEffect } from 'react'
import { Desktop } from './components/desktop/Desktop'
import { initializeDisplay } from './stores/displayStore'
import { useThemeStore } from './stores/themeStore'

export default function App() {
  const { currentTheme } = useThemeStore()

  useEffect(() => {
    initializeDisplay()
  }, [])

  // Apply theme on mount and whenever it changes
  useEffect(() => {
    const root = document.documentElement
    Object.entries(currentTheme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value)
    })
  }, [currentTheme])

  return <Desktop />
}