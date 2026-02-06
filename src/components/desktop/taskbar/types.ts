/**
 * Shared types for the modular taskbar system
 */

import type { ReactNode } from 'react'

export interface TaskbarWindow {
  id: string
  title: string
  icon: ReactNode
  isMinimized: boolean
  isActive: boolean
}

export interface TaskbarProps {
  windows: TaskbarWindow[]
  onWindowClick: (id: string) => void
  onWindowClose?: (id: string) => void
  onStartClick?: () => void
  phoneVisible?: boolean
  onPhoneToggle?: () => void
  onOpenNPCConversation?: (npcId: string) => void
  className?: string
}

export interface ContextMenuItem {
  label: string
  icon?: ReactNode
  onClick: () => void
  disabled?: boolean
  danger?: boolean
  separator?: boolean
}
