import { useState } from 'react'

interface CommentActionsProps {
  commentId: string
  onEdit?: (commentId: string) => void
  onDelete?: (commentId: string) => void
  onReport?: (commentId: string) => void
  className?: string
}

export function CommentActions({
  commentId,
  onEdit,
  onDelete,
  onReport,
  className = '',
}: CommentActionsProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Don't render if no actions available
  if (!onEdit && !onDelete && !onReport) {
    return null
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-2 py-1 rounded transition-colors hover:bg-white/10"
        style={{ color: 'var(--color-textMuted)' }}
      >
        •••
      </button>

      {isOpen && (
        <>
          {/* Backdrop to close menu */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown menu */}
          <div
            className="absolute right-0 top-full mt-1 min-w-[120px] rounded-lg shadow-lg z-20 py-1"
            style={{
              background: 'var(--color-bgSecondary)',
              border: '1px solid var(--color-border)',
            }}
          >
            {onEdit && (
              <button
                onClick={() => {
                  onEdit(commentId)
                  setIsOpen(false)
                }}
                className="w-full px-3 py-2 text-left text-sm transition-colors hover:bg-white/10"
                style={{ color: 'var(--color-text)' }}
              >
                Edit
              </button>
            )}

            {onDelete && (
              <button
                onClick={() => {
                  onDelete(commentId)
                  setIsOpen(false)
                }}
                className="w-full px-3 py-2 text-left text-sm transition-colors hover:bg-white/10"
                style={{ color: 'var(--color-error)' }}
              >
                Delete
              </button>
            )}

            {onReport && (
              <button
                onClick={() => {
                  onReport(commentId)
                  setIsOpen(false)
                }}
                className="w-full px-3 py-2 text-left text-sm transition-colors hover:bg-white/10"
                style={{ color: 'var(--color-textMuted)' }}
              >
                Report
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}
