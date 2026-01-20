import { useState, useEffect } from 'react'

interface TimestampProps {
  time: number | Date
  format?: 'relative' | 'absolute' | 'smart'
  className?: string
  updateInterval?: number // ms, for live updating relative times
}

function formatRelative(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)
  const diffWeek = Math.floor(diffDay / 7)
  const diffMonth = Math.floor(diffDay / 30)
  const diffYear = Math.floor(diffDay / 365)

  if (diffSec < 5) return 'just now'
  if (diffSec < 60) return `${diffSec}s ago`
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHour < 24) return `${diffHour}h ago`
  if (diffDay < 7) return `${diffDay}d ago`
  if (diffWeek < 4) return `${diffWeek}w ago`
  if (diffMonth < 12) return `${diffMonth}mo ago`
  return `${diffYear}y ago`
}

function formatAbsolute(date: Date): string {
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
    hour: 'numeric',
    minute: '2-digit',
  })
}

function formatSmart(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHour = diffMs / (1000 * 60 * 60)
  const diffDay = diffMs / (1000 * 60 * 60 * 24)

  // Less than 24 hours: relative
  if (diffHour < 24) {
    return formatRelative(date)
  }

  // Same year: "Jan 5 at 3:30 PM"
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  // Different year: "Jan 5, 2023"
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function Timestamp({
  time,
  format = 'smart',
  className = '',
  updateInterval = 60000, // Update every minute by default
}: TimestampProps) {
  const date = typeof time === 'number' ? new Date(time * 1000) : time
  const [, setTick] = useState(0)

  // Live update for relative times
  useEffect(() => {
    if (format === 'absolute') return

    const interval = setInterval(() => {
      setTick(t => t + 1)
    }, updateInterval)

    return () => clearInterval(interval)
  }, [format, updateInterval])

  const formatted =
    format === 'relative'
      ? formatRelative(date)
      : format === 'absolute'
        ? formatAbsolute(date)
        : formatSmart(date)

  return (
    <time
      dateTime={date.toISOString()}
      title={formatAbsolute(date)}
      className={className}
      style={{ color: 'var(--color-textMuted)' }}
    >
      {formatted}
    </time>
  )
}
