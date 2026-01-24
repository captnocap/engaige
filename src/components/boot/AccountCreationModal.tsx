/**
 * Account Creation Modal
 *
 * Modal for creating new accounts with options to:
 * - Start fresh (full onboarding)
 * - Copy from existing account (profile + settings OR settings only)
 */

import { useState } from 'react'
import { useAccountStore, type Account, type CreateAccountOptions } from '../../stores/accountStore'

interface AccountCreationModalProps {
  existingAccounts: Account[]
  onClose: () => void
  onCreated: (account: Account) => void
}

type CopyMode = 'fresh' | 'everything' | 'settings_only'

export function AccountCreationModal({
  existingAccounts,
  onClose,
  onCreated,
}: AccountCreationModalProps) {
  const { createAccount, isLoading, error } = useAccountStore()
  const [name, setName] = useState('')
  const [copyMode, setCopyMode] = useState<CopyMode>('fresh')
  const [sourceAccountId, setSourceAccountId] = useState<string>(existingAccounts[0]?.id || '')
  const [localError, setLocalError] = useState<string | null>(null)

  const hasExistingAccounts = existingAccounts.length > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError(null)

    if (!name.trim()) {
      setLocalError('Please enter an account name')
      return
    }

    if (name.length > 30) {
      setLocalError('Account name must be 30 characters or less')
      return
    }

    const options: CreateAccountOptions = {
      name: name.trim(),
    }

    if (copyMode !== 'fresh' && sourceAccountId) {
      options.copyFrom = {
        accountId: sourceAccountId,
        mode: copyMode,
      }
    }

    const account = await createAccount(options)
    if (account) {
      onCreated(account)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div
        className="bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6 border border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Create New Account</h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Account name */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">Account Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter account name"
              disabled={isLoading}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 disabled:opacity-50"
              autoFocus
            />
          </div>

          {/* Copy options (only show if there are existing accounts) */}
          {hasExistingAccounts && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-3">Start Options</label>
              <div className="space-y-3">
                {/* Fresh start */}
                <label className="flex items-start gap-3 p-3 rounded-lg border border-gray-600 hover:border-gray-500 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="copyMode"
                    checked={copyMode === 'fresh'}
                    onChange={() => setCopyMode('fresh')}
                    disabled={isLoading}
                    className="mt-1"
                  />
                  <div>
                    <div className="text-white font-medium">Start Fresh</div>
                    <div className="text-sm text-gray-400">New world, new profile, full onboarding</div>
                  </div>
                </label>

                {/* Copy everything */}
                <label className="flex items-start gap-3 p-3 rounded-lg border border-gray-600 hover:border-gray-500 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="copyMode"
                    checked={copyMode === 'everything'}
                    onChange={() => setCopyMode('everything')}
                    disabled={isLoading}
                    className="mt-1"
                  />
                  <div>
                    <div className="text-white font-medium">Copy Everything</div>
                    <div className="text-sm text-gray-400">
                      Same profile & settings, new world with new NPCs
                    </div>
                  </div>
                </label>

                {/* Copy settings only */}
                <label className="flex items-start gap-3 p-3 rounded-lg border border-gray-600 hover:border-gray-500 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="copyMode"
                    checked={copyMode === 'settings_only'}
                    onChange={() => setCopyMode('settings_only')}
                    disabled={isLoading}
                    className="mt-1"
                  />
                  <div>
                    <div className="text-white font-medium">Copy Settings Only</div>
                    <div className="text-sm text-gray-400">
                      New profile, keeps budget & AI settings
                    </div>
                  </div>
                </label>
              </div>

              {/* Source account selector (only if copying) */}
              {copyMode !== 'fresh' && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Copy From</label>
                  <select
                    value={sourceAccountId}
                    onChange={(e) => setSourceAccountId(e.target.value)}
                    disabled={isLoading}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
                  >
                    {existingAccounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Error display */}
          {(error || localError) && (
            <div className="mb-4 px-3 py-2 bg-red-900/50 border border-red-700 rounded-lg text-red-300 text-sm">
              {localError || error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !name.trim()}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AccountCreationModal
