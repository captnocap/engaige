/**
 * TaskbarClock
 *
 * Displays current time and date with a tooltip showing full date/time.
 */

import { useState, useEffect } from 'react'
import { Tooltip } from '../../ui/Tooltip.js'

export function TaskbarClock() {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  const timeStr = time.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })

  const dateStr = time.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })

  const fullDate = time.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <Tooltip content={fullDate} placement="top">
      <div className="text-right min-w-[60px] px-2 py-1 rounded-lg hover:bg-white/8 transition-colors cursor-default">
        <div className="text-xs text-white/90 leading-tight">{timeStr}</div>
        <div className="text-[10px] text-white/50 leading-tight">{dateStr}</div>
      </div>
    </Tooltip>
  )
}
