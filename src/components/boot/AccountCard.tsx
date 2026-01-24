/**
 * Account Card Component
 *
 * Displays an account in the login screen grid.
 */

import type { Account } from '../../stores/accountStore'

interface AccountCardProps {
  account: Account
  isSelected: boolean
  isLoading: boolean
  onClick: () => void
}

function formatLastPlayed(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp

  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  return new Date(timestamp).toLocaleDateString()
}

function formatCreatedDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  })
}

export function AccountCard({ account, isSelected, isLoading, onClick }: AccountCardProps) {
  const defaultAvatar = `https://api.dicebear.com/7.x/identicon/svg?seed=${account.id}`

  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className={`group relative flex flex-col items-center p-8 rounded-xl transition-all duration-200 min-h-[200px] ${
        isSelected
          ? 'bg-blue-900/50 border-2 border-blue-500 scale-105'
          : 'bg-gray-800/50 border-2 border-gray-700 hover:border-blue-500/50 hover:bg-gray-800'
      } ${isLoading ? 'cursor-wait' : 'cursor-pointer'}`}
    >
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center z-10">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Avatar */}
      <div className="relative mb-4">
        <img
          src={account.avatarUrl || defaultAvatar}
          alt={account.name}
          className="w-20 h-20 rounded-full object-cover border-2 border-gray-600 group-hover:border-blue-500/50 transition-colors"
        />
        {!account.hasCompletedOnboarding && (
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center border-2 border-gray-800">
            <span className="text-xs">!</span>
          </div>
        )}
      </div>

      {/* Account name */}
      <h3 className="text-lg font-semibold text-white mb-1 truncate max-w-full">{account.name}</h3>

      {/* Last played */}
      <p className="text-sm text-gray-400 mb-1">Last played: {formatLastPlayed(account.lastPlayedAt)}</p>

      {/* Created date */}
      <p className="text-xs text-gray-500">Created {formatCreatedDate(account.createdAt)}</p>

      {/* Onboarding status */}
      {!account.hasCompletedOnboarding && (
        <div className="absolute top-2 right-2">
          <span className="px-2 py-1 bg-yellow-900/50 text-yellow-400 text-xs rounded">New</span>
        </div>
      )}
    </button>
  )
}

export default AccountCard
