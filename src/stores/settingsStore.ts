import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface AudioSettings {
  masterVolume: number
  musicVolume: number
  sfxVolume: number
  masterMuted: boolean
  musicMuted: boolean
  sfxMuted: boolean
}

export interface GraphicsSettings {
  brightness: number
  contrast: number
  saturation: number
  reduceMotion: boolean
}

export interface WallpaperSettings {
  type: 'theme' | 'custom'
  customPath: string | null
  customSource: 'file' | 'url'
  customFit: 'cover' | 'contain' | 'fill' | 'tile'
}

export interface TypographySettings {
  fontFamily: string
  fontSize: number
  lineHeight: number
  letterSpacing: number
  fontWeight: 'normal' | 'medium' | 'semibold' | 'bold'
  enableAnimations: boolean
  animationStyle: 'subtle' | 'moderate' | 'energetic'
}

export interface AccessibilitySettings {
  highContrast: boolean
}

export interface DeveloperSettings {
  debugMode: boolean
  skipBootSequence: boolean
}

export interface IconPosition {
  x: number
  y: number
}

export interface DesktopLayoutSettings {
  iconPositions: Record<string, IconPosition>
  viewportRef: { width: number; height: number } | null
}

export type ContentRating = 'harsh' | 'strict' | 'normal' | 'relaxed' | 'none'

export interface ContentRatingSettings {
  rating: ContentRating
  showNoneWarningAcknowledged: boolean // Has user acknowledged the warning for 'none'?
}

export interface SettingsState {
  wallpaper: WallpaperSettings
  audio: AudioSettings
  graphics: GraphicsSettings
  typography: TypographySettings
  accessibility: AccessibilitySettings
  developer: DeveloperSettings
  contentRating: ContentRatingSettings
  desktopLayout: DesktopLayoutSettings

  // Actions
  setWallpaper: (wallpaper: Partial<WallpaperSettings>) => void
  setAudio: (audio: Partial<AudioSettings>) => void
  setGraphics: (graphics: Partial<GraphicsSettings>) => void
  setTypography: (typography: Partial<TypographySettings>) => void
  setAccessibility: (accessibility: Partial<AccessibilitySettings>) => void
  setDeveloper: (developer: Partial<DeveloperSettings>) => void
  setContentRating: (contentRating: Partial<ContentRatingSettings>) => void
  setDesktopLayout: (layout: Partial<DesktopLayoutSettings>) => void
  setIconPosition: (iconId: string, position: IconPosition) => void
  setIconPositions: (positions: Record<string, IconPosition>) => void
  resetAll: () => void
}

const defaultWallpaper: WallpaperSettings = {
  type: 'theme',
  customPath: null,
  customSource: 'file',
  customFit: 'cover',
}

const defaultAudio: AudioSettings = {
  masterVolume: 80,
  musicVolume: 70,
  sfxVolume: 60,
  masterMuted: false,
  musicMuted: false,
  sfxMuted: false,
}

const defaultGraphics: GraphicsSettings = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  reduceMotion: false,
}

const defaultTypography: TypographySettings = {
  fontFamily: 'system-ui',
  fontSize: 100,
  lineHeight: 1.5,
  letterSpacing: 0,
  fontWeight: 'normal',
  enableAnimations: false,
  animationStyle: 'subtle',
}

const defaultAccessibility: AccessibilitySettings = {
  highContrast: false,
}

const defaultDeveloper: DeveloperSettings = {
  debugMode: false,
  skipBootSequence: false,
}

const defaultContentRating: ContentRatingSettings = {
  rating: 'normal',
  showNoneWarningAcknowledged: false,
}

const defaultDesktopLayout: DesktopLayoutSettings = {
  iconPositions: {},
  viewportRef: null,
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      wallpaper: defaultWallpaper,
      audio: defaultAudio,
      graphics: defaultGraphics,
      typography: defaultTypography,
      accessibility: defaultAccessibility,
      developer: defaultDeveloper,
      contentRating: defaultContentRating,
      desktopLayout: defaultDesktopLayout,

      setWallpaper: (wallpaper) => {
        set((state) => ({ wallpaper: { ...state.wallpaper, ...wallpaper } }))
        applyWallpaperSettings(get().wallpaper)
      },

      setAudio: (audio) => {
        set((state) => ({ audio: { ...state.audio, ...audio } }))
        applyAudioSettings(get().audio)
      },

      setGraphics: (graphics) => {
        set((state) => ({ graphics: { ...state.graphics, ...graphics } }))
        applyGraphicsSettings(get().graphics)
        // Reapply typography to respect reduce motion changes
        applyTypographySettings(get().typography)
      },

      setTypography: (typography) => {
        set((state) => ({ typography: { ...state.typography, ...typography } }))
        applyTypographySettings(get().typography)
      },

      setAccessibility: (accessibility) => {
        set((state) => ({ accessibility: { ...state.accessibility, ...accessibility } }))
      },

      setDeveloper: (developer) => {
        set((state) => ({ developer: { ...state.developer, ...developer } }))
      },

      setContentRating: (contentRating) => {
        set((state) => ({ contentRating: { ...state.contentRating, ...contentRating } }))
        // Note: The actual backend sync happens via WebSocket in the UI component
      },

      setDesktopLayout: (layout) => {
        set((state) => ({ desktopLayout: { ...state.desktopLayout, ...layout } }))
      },

      setIconPosition: (iconId, position) => {
        set((state) => ({
          desktopLayout: {
            ...state.desktopLayout,
            iconPositions: {
              ...state.desktopLayout.iconPositions,
              [iconId]: position,
            },
            viewportRef: { width: window.innerWidth, height: window.innerHeight },
          },
        }))
      },

      setIconPositions: (positions) => {
        set((state) => ({
          desktopLayout: {
            ...state.desktopLayout,
            iconPositions: {
              ...state.desktopLayout.iconPositions,
              ...positions,
            },
            viewportRef: { width: window.innerWidth, height: window.innerHeight },
          },
        }))
      },

      resetAll: () => {
        set({
          wallpaper: defaultWallpaper,
          audio: defaultAudio,
          graphics: defaultGraphics,
          typography: defaultTypography,
          accessibility: defaultAccessibility,
          developer: defaultDeveloper,
          contentRating: defaultContentRating,
          desktopLayout: defaultDesktopLayout,
        })
        applyWallpaperSettings(defaultWallpaper)
        applyAudioSettings(defaultAudio)
        applyGraphicsSettings(defaultGraphics)
        applyTypographySettings(defaultTypography)
      },
    }),
    {
      name: 'loveai-settings',
      partialize: (state) => ({
        wallpaper: state.wallpaper,
        audio: state.audio,
        graphics: state.graphics,
        typography: state.typography,
        accessibility: state.accessibility,
        developer: state.developer,
        contentRating: state.contentRating,
        desktopLayout: state.desktopLayout,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('Failed to rehydrate settings:', error)
        } else if (state) {
          // Apply settings on load
          applyWallpaperSettings(state.wallpaper)
          applyAudioSettings(state.audio)
          applyGraphicsSettings(state.graphics)
          applyTypographySettings(state.typography)
        }
      },
    }
  )
)

// Apply audio settings to all audio elements
export function applyAudioSettings(audio: AudioSettings) {
  const masterMultiplier = audio.masterMuted ? 0 : audio.masterVolume / 100
  const musicMultiplier = audio.musicMuted ? 0 : audio.musicVolume / 100
  const sfxMultiplier = audio.sfxMuted ? 0 : audio.sfxVolume / 100

  document.querySelectorAll('audio[data-type="music"]').forEach((el) => {
    ;(el as HTMLAudioElement).volume = masterMultiplier * musicMultiplier
  })

  document.querySelectorAll('audio[data-type="sfx"]').forEach((el) => {
    ;(el as HTMLAudioElement).volume = masterMultiplier * sfxMultiplier
  })

  console.log('Audio settings applied:', audio)
}

// Apply graphics settings as CSS filters
export function applyGraphicsSettings(graphics: GraphicsSettings) {
  const root = document.documentElement

  const filter = `
    brightness(${graphics.brightness / 100})
    contrast(${graphics.contrast / 100})
    saturate(${graphics.saturation / 100})
  `
    .trim()
    .replace(/\n/g, ' ')

  root.style.setProperty('--graphics-filter', filter)

  if (graphics.reduceMotion) {
    root.classList.add('reduce-motion')
  } else {
    root.classList.remove('reduce-motion')
  }

  console.log('Graphics settings applied:', graphics)
}

// Apply typography settings
export function applyTypographySettings(typography: TypographySettings) {
  const root = document.documentElement
  const { graphics } = useSettingsStore.getState()

  root.style.setProperty('--font-family', typography.fontFamily)
  root.style.setProperty('--font-size-scale', `${typography.fontSize / 100}`)
  root.style.setProperty('--line-height', `${typography.lineHeight}`)
  root.style.setProperty('--letter-spacing', `${typography.letterSpacing}em`)
  root.style.setProperty('--font-weight-base', typography.fontWeight)

  // Remove all kinetic classes
  root.classList.remove('kinetic-subtle', 'kinetic-moderate', 'kinetic-energetic')

  // Apply kinetic typography ONLY if enabled AND reduce motion is OFF
  if (typography.enableAnimations && !graphics.reduceMotion) {
    root.classList.add(`kinetic-${typography.animationStyle}`)
  }

  console.log('Typography settings applied:', typography)
}

// Apply wallpaper settings (returns style object for Desktop component)
export function applyWallpaperSettings(wallpaper: WallpaperSettings) {
  console.log('Wallpaper settings applied:', wallpaper)
  // The actual application happens in Desktop.tsx component
  // This is just for logging and any global setup needed
}

// Initialize all settings on app load
export function initializeSettings() {
  const state = useSettingsStore.getState()
  applyAudioSettings(state.audio)
  applyGraphicsSettings(state.graphics)
  applyTypographySettings(state.typography)
  applyWallpaperSettings(state.wallpaper)
  console.log('Settings initialized')
}
