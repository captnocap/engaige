/**
 * Shared types for the modular taskbar system
 */

import type { ReactNode } from 'react' // still needed for TaskbarWindow/TaskbarProps

export interface TaskbarWindow {
  id: string
  title: string
  icon: ReactNode
  isMinimized: boolean
  isActive: boolean
}

export interface StartMenuApp {
  id: string
  icon: ReactNode
  label: string
}

export interface TaskbarProps {
  windows: TaskbarWindow[]
  onWindowClick: (id: string) => void
  onWindowClose?: (id: string) => void
  onOpenApp?: (appId: string) => void
  apps?: StartMenuApp[]
  phoneVisible?: boolean
  onPhoneToggle?: () => void
  onOpenNPCConversation?: (npcId: string) => void
  onShowDesktop?: () => void
  onSnapToGrid?: () => void
  className?: string
}

// Re-exported from canonical location for backward compatibility
export type { ContextMenuItem } from '../../ui/ContextMenu.js'
