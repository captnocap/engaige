/**
 * Notification Store
 *
 * Manages in-game notifications for the taskbar notification panel.
 * Notifications are generated from game events: relationship changes,
 * NPC messages, simulation milestones, etc.
 */

import { create } from 'zustand'

export interface GameNotification {
  id: string
  type: 'relationship' | 'message' | 'achievement' | 'system' | 'social'
  title: string
  body?: string
  timestamp: string
  read: boolean
  npcId?: string
}

interface NotificationState {
  notifications: GameNotification[]

  // Actions
  push: (notification: Omit<GameNotification, 'id' | 'timestamp' | 'read'>) => void
  markRead: (id: string) => void
  markAllRead: () => void
  dismiss: (id: string) => void
  clearAll: () => void
  unreadCount: () => number
}

export const useNotificationStore = create<NotificationState>()((set, get) => ({
  notifications: [],

  push: (notification) => {
    const newNotification: GameNotification = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toISOString(),
      read: false,
    }
    set(state => ({
      notifications: [newNotification, ...state.notifications].slice(0, 50), // Keep max 50
    }))
  },

  markRead: (id) => {
    set(state => ({
      notifications: state.notifications.map(n =>
        n.id === id ? { ...n, read: true } : n
      ),
    }))
  },

  markAllRead: () => {
    set(state => ({
      notifications: state.notifications.map(n => ({ ...n, read: true })),
    }))
  },

  dismiss: (id) => {
    set(state => ({
      notifications: state.notifications.filter(n => n.id !== id),
    }))
  },

  clearAll: () => {
    set({ notifications: [] })
  },

  unreadCount: () => {
    return get().notifications.filter(n => !n.read).length
  },
}))
