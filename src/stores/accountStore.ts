/**
 * Account Store
 *
 * Manages user accounts - each account has its own isolated world (NPCs, game state).
 * AI providers are shared globally across all accounts.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useWSStore } from './wsStore'

export interface Account {
  id: string
  name: string
  avatarUrl?: string
  createdAt: number
  lastPlayedAt: number
  hasCompletedOnboarding: boolean
}

export interface CreateAccountOptions {
  name: string
  copyFrom?: {
    accountId: string
    mode: 'everything' | 'settings_only'
  }
}

export interface AccountState {
  accounts: Account[]
  activeAccountId: string | null
  hasCompletedFirstOnboarding: boolean
  isLoading: boolean
  error: string | null

  // Actions
  loadAccounts: () => Promise<void>
  selectAccount: (id: string) => Promise<boolean>
  createAccount: (options: CreateAccountOptions) => Promise<Account | null>
  deleteAccount: (id: string) => Promise<boolean>
  updateAccount: (id: string, updates: Partial<Account>) => void
  markOnboardingComplete: (accountId: string) => void
  setActiveAccountId: (id: string | null) => void
  setError: (error: string | null) => void
  reset: () => void
}

export const useAccountStore = create<AccountState>()(
  persist(
    (set, get) => ({
      accounts: [],
      activeAccountId: null,
      hasCompletedFirstOnboarding: false,
      isLoading: false,
      error: null,

      loadAccounts: async () => {
        set({ isLoading: true, error: null })
        try {
          const wsStore = useWSStore.getState()
          const result = await wsStore.request<void, { accounts: Account[] }>('account:list')
          set({
            accounts: result.accounts || [],
            isLoading: false,
          })
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to load accounts'
          set({ error: message, isLoading: false })
        }
      },

      selectAccount: async (id: string) => {
        set({ isLoading: true, error: null })
        try {
          const wsStore = useWSStore.getState()
          await wsStore.request('account:select', { id })
          set({
            activeAccountId: id,
            isLoading: false,
          })
          // Update last played time locally
          get().updateAccount(id, { lastPlayedAt: Date.now() })
          return true
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to select account'
          set({ error: message, isLoading: false })
          return false
        }
      },

      createAccount: async (options: CreateAccountOptions) => {
        set({ isLoading: true, error: null })
        try {
          const wsStore = useWSStore.getState()
          const result = await wsStore.request<CreateAccountOptions, Account>('account:create', options)
          const newAccount = result as Account
          set((state) => ({
            accounts: [...state.accounts, newAccount],
            isLoading: false,
          }))
          return newAccount
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to create account'
          set({ error: message, isLoading: false })
          return null
        }
      },

      deleteAccount: async (id: string) => {
        set({ isLoading: true, error: null })
        try {
          const wsStore = useWSStore.getState()
          await wsStore.request('account:delete', { id })
          set((state) => ({
            accounts: state.accounts.filter((a) => a.id !== id),
            activeAccountId: state.activeAccountId === id ? null : state.activeAccountId,
            isLoading: false,
          }))
          return true
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to delete account'
          set({ error: message, isLoading: false })
          return false
        }
      },

      updateAccount: (id: string, updates: Partial<Account>) => {
        set((state) => ({
          accounts: state.accounts.map((a) => (a.id === id ? { ...a, ...updates } : a)),
        }))
      },

      markOnboardingComplete: (accountId: string) => {
        const state = get()
        state.updateAccount(accountId, { hasCompletedOnboarding: true })
        // Mark global first onboarding complete
        if (!state.hasCompletedFirstOnboarding) {
          set({ hasCompletedFirstOnboarding: true })
        }
      },

      setActiveAccountId: (id: string | null) => {
        set({ activeAccountId: id })
      },

      setError: (error: string | null) => {
        set({ error })
      },

      reset: () => {
        set({
          accounts: [],
          activeAccountId: null,
          isLoading: false,
          error: null,
        })
      },
    }),
    {
      name: 'engaige-accounts',
      partialize: (state) => ({
        activeAccountId: state.activeAccountId,
        hasCompletedFirstOnboarding: state.hasCompletedFirstOnboarding,
      }),
    }
  )
)

export default useAccountStore
