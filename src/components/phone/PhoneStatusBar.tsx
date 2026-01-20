/**
 * Phone Status Bar
 *
 * iOS-style status bar with time, signal, battery.
 */

import { useState, useEffect } from 'react'

export function PhoneStatusBar() {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  return (
    <div className="h-12 px-6 flex items-center justify-between text-white text-sm font-medium pt-2">
      {/* Left - Time */}
      <div className="w-20">
        {formatTime(time)}
      </div>

      {/* Center - Dynamic Island space */}
      <div className="w-28" />

      {/* Right - Icons */}
      <div className="w-20 flex items-center justify-end gap-1">
        {/* Signal */}
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <rect x="2" y="16" width="3" height="6" rx="0.5" />
          <rect x="7" y="12" width="3" height="10" rx="0.5" />
          <rect x="12" y="8" width="3" height="14" rx="0.5" />
          <rect x="17" y="4" width="3" height="18" rx="0.5" />
        </svg>

        {/* WiFi */}
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 18c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm-4.9-2.3l1.4 1.4C9.4 16.4 10.6 16 12 16s2.6.4 3.5 1.1l1.4-1.4C15.6 14.6 13.9 14 12 14s-3.6.6-4.9 1.7zm-2.8-2.8l1.4 1.4C7.3 13 9.5 12 12 12s4.7 1 6.3 2.3l1.4-1.4C17.7 11.2 15 10 12 10s-5.7 1.2-7.7 2.9zM2 9.1l1.4 1.4C5.7 8.6 8.7 7.5 12 7.5s6.3 1.1 8.6 3l1.4-1.4C19.4 6.8 15.9 5.5 12 5.5S4.6 6.8 2 9.1z" />
        </svg>

        {/* Battery */}
        <div className="flex items-center gap-0.5">
          <div className="w-6 h-3 border border-white rounded-sm relative">
            <div
              className="absolute inset-0.5 rounded-[1px]"
              style={{ background: '#34C759', width: '85%' }}
            />
          </div>
          <div className="w-0.5 h-1.5 bg-white rounded-r-sm" />
        </div>
      </div>
    </div>
  )
}

export default PhoneStatusBar
