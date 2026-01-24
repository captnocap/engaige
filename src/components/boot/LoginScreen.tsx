/**
 * Login Screen Component
 *
 * Account selection screen shown after boot sequence.
 * Displays existing accounts and option to create new ones.
 */

import { useState, useEffect } from 'react'
import { useAccountStore, type Account, type CreateAccountOptions } from '../../stores/accountStore'
import { useBootStore } from '../../stores/bootStore'
import { AccountCard } from './AccountCard'
import { AccountCreationModal } from './AccountCreationModal'

export function LoginScreen() {
  const { accounts, activeAccountId, selectAccount, isLoading, error, loadAccounts } = useAccountStore()
  const setPhase = useBootStore((state) => state.setPhase)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null)

  // Reload accounts when screen mounts
  useEffect(() => {
    loadAccounts()
  }, [loadAccounts])

  const handleAccountSelect = async (account: Account) => {
    setSelectedAccountId(account.id)
    const success = await selectAccount(account.id)
    if (success) {
      // If onboarding not complete, will be handled by Desktop
      setPhase('ready')
    } else {
      setSelectedAccountId(null)
    }
  }

  const handleAccountCreated = async (account: Account) => {
    setShowCreateModal(false)
    // Auto-select the new account
    const success = await selectAccount(account.id)
    if (success) {
      setPhase('ready')
    }
  }

  const sortedAccounts = [...accounts].sort((a, b) => b.lastPlayedAt - a.lastPlayedAt)

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-white mb-2">Welcome to engAIge</h1>
        <p className="text-gray-400">Select an account to continue</p>
      </div>

      {/* Error display */}
      {error && (
        <div className="mb-6 px-4 py-2 bg-red-900/50 border border-red-700 rounded-lg text-red-300 max-w-md text-center">
          {error}
        </div>
      )}

      {/* Account grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl px-8">
        {sortedAccounts.map((account) => (
          <AccountCard
            key={account.id}
            account={account}
            isSelected={selectedAccountId === account.id}
            isLoading={isLoading && selectedAccountId === account.id}
            onClick={() => handleAccountSelect(account)}
          />
        ))}

        {/* Create new account card */}
        <button
          onClick={() => setShowCreateModal(true)}
          disabled={isLoading}
          className="group relative flex flex-col items-center justify-center p-8 rounded-xl border-2 border-dashed border-gray-600 hover:border-blue-500 transition-all duration-200 min-h-[200px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="w-16 h-16 rounded-full bg-gray-700 group-hover:bg-blue-900/50 flex items-center justify-center mb-4 transition-colors">
            <span className="text-3xl text-gray-400 group-hover:text-blue-400">+</span>
          </div>
          <span className="text-gray-400 group-hover:text-blue-400 font-medium transition-colors">
            New Account
          </span>
          {accounts.length === 0 && (
            <span className="text-xs text-gray-500 mt-2">Start your adventure</span>
          )}
        </button>
      </div>

      {/* Footer info */}
      <div className="mt-12 text-center text-gray-500 text-sm">
        <p>Each account has its own world with unique NPCs and relationships.</p>
        <p className="mt-1">AI providers are shared across all accounts.</p>
      </div>

      {/* Create account modal */}
      {showCreateModal && (
        <AccountCreationModal
          existingAccounts={accounts}
          onClose={() => setShowCreateModal(false)}
          onCreated={handleAccountCreated}
        />
      )}
    </div>
  )
}

export default LoginScreen
