/**
 * CobCal - Calendar
 *
 * Month grid view with event dots, mini-month sidebar, and day detail.
 * Fetches NPC birthdays and game events from the server.
 */

import { useState, useEffect, useCallback } from 'react'
import { useWSRequest } from '../../stores/wsStore.js'
import { ContextMenu } from '../ui/ContextMenu.js'
import { useContextMenu } from '../../hooks/useContextMenu.js'
import { calendarPreset } from '../../hooks/useContextMenuPresets.js'

interface CalendarEvent {
  id: string
  date: string
  title: string
  type: 'birthday' | 'event' | 'holiday' | 'lore'
  description?: string
  icon?: string
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

const EVENT_COLORS: Record<string, string> = {
  birthday: '#f472b6',
  event: '#60a5fa',
  holiday: '#fbbf24',
  lore: '#a78bfa',
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay()
}

export function CobCal() {
  const { request, connected } = useWSRequest()
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [selectedDay, setSelectedDay] = useState<number | null>(now.getDate())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const ctx = useContextMenu()

  useEffect(() => {
    if (!connected) return
    request<any, any>('calendar:getEvents', { month: month + 1, year })
      .then(res => setEvents(res?.events || []))
      .catch(() => setEvents([]))
  }, [connected, request, month, year])

  const navigateMonth = useCallback((delta: number) => {
    setMonth(prev => {
      let newMonth = prev + delta
      if (newMonth < 0) { setYear(y => y - 1); return 11 }
      if (newMonth > 11) { setYear(y => y + 1); return 0 }
      return newMonth
    })
    setSelectedDay(null)
  }, [])

  const goToToday = useCallback(() => {
    const today = new Date()
    setYear(today.getFullYear())
    setMonth(today.getMonth())
    setSelectedDay(today.getDate())
  }, [])

  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)
  const today = new Date()
  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth()

  const getEventsForDay = (day: number) => {
    const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
    return events.filter(e => e.date === dateStr)
  }

  const selectedDayEvents = selectedDay ? getEventsForDay(selectedDay) : []

  // Mini month grid for sidebar
  const MiniMonth = ({ y, m }: { y: number; m: number }) => {
    const days = getDaysInMonth(y, m)
    const first = getFirstDayOfMonth(y, m)
    const isCurrent = y === today.getFullYear() && m === today.getMonth()

    return (
      <div className="mb-4">
        <div className="text-xs font-medium text-[var(--color-textSecondary)] mb-1 text-center">
          {MONTHS[m]} {y}
        </div>
        <div className="grid grid-cols-7 gap-0">
          {DAYS.map(d => (
            <div key={d} className="text-[8px] text-center text-[var(--color-textSecondary)]">{d[0]}</div>
          ))}
          {Array.from({ length: first }, (_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {Array.from({ length: days }, (_, i) => {
            const day = i + 1
            const isToday = isCurrent && day === today.getDate()
            return (
              <button
                key={day}
                onClick={() => { setYear(y); setMonth(m); setSelectedDay(day) }}
                className={`text-[9px] w-4 h-4 flex items-center justify-center rounded-full mx-auto ${
                  isToday ? 'bg-[#00ff88] text-[#0a0a0a] font-bold' : 'text-[var(--color-textSecondary)] hover:bg-[var(--color-border)]'
                }`}
              >
                {day}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  // Previous and next month for mini view
  const prevMonth = month === 0 ? 11 : month - 1
  const prevYear = month === 0 ? year - 1 : year
  const nextMonth = month === 11 ? 0 : month + 1
  const nextYear = month === 11 ? year + 1 : year

  const selectedDateStr = selectedDay
    ? `${MONTHS[month]} ${selectedDay}, ${year}`
    : undefined

  const handleCopyDate = useCallback(() => {
    if (selectedDateStr) {
      navigator.clipboard.writeText(selectedDateStr).catch(() => {})
    }
  }, [selectedDateStr])

  return (
    <div className="flex h-full bg-[var(--color-bg)]" onContextMenu={(e) => ctx.show(e)}>
      {/* Sidebar */}
      <div className="w-48 border-r border-[var(--color-border)] p-3 flex flex-col">
        <button
          onClick={goToToday}
          className="mb-4 px-3 py-1.5 text-sm bg-[#00ff88] text-[#0a0a0a] rounded-md font-medium hover:bg-[#00dd77]"
        >
          Today
        </button>

        <MiniMonth y={prevYear} m={prevMonth} />
        <MiniMonth y={nextYear} m={nextMonth} />

        {/* Selected day events */}
        {selectedDay && selectedDayEvents.length > 0 && (
          <div className="mt-auto">
            <div className="text-xs font-medium text-[var(--color-textSecondary)] mb-2">
              {MONTHS[month]} {selectedDay}
            </div>
            {selectedDayEvents.map(evt => (
              <div key={evt.id} className="mb-2 p-2 rounded bg-[var(--color-bgSecondary)] border border-[var(--color-border)]">
                <div className="flex items-center gap-1 text-sm">
                  <span>{evt.icon || '📌'}</span>
                  <span className="text-[var(--color-text)] font-medium truncate">{evt.title}</span>
                </div>
                {evt.description && (
                  <div className="text-xs text-[var(--color-textSecondary)] mt-1">{evt.description}</div>
                )}
                <div className="text-[10px] mt-1" style={{ color: EVENT_COLORS[evt.type] }}>
                  {evt.type}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main calendar */}
      <div className="flex-1 flex flex-col p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigateMonth(-1)} className="p-2 hover:bg-[var(--color-bgSecondary)] rounded">
            <span className="text-[var(--color-textSecondary)]">‹</span>
          </button>
          <h2 className="text-xl font-semibold text-[var(--color-text)]">
            {MONTHS[month]} {year}
          </h2>
          <button onClick={() => navigateMonth(1)} className="p-2 hover:bg-[var(--color-bgSecondary)] rounded">
            <span className="text-[var(--color-textSecondary)]">›</span>
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-1">
          {DAYS.map(day => (
            <div key={day} className="text-center text-xs font-medium text-[var(--color-textSecondary)] py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Day grid */}
        <div className="grid grid-cols-7 flex-1 gap-px bg-[var(--color-border)]">
          {/* Empty cells before first day */}
          {Array.from({ length: firstDay }, (_, i) => (
            <div key={`empty-${i}`} className="bg-[var(--color-bg)] p-1" />
          ))}

          {/* Day cells */}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1
            const dayEvents = getEventsForDay(day)
            const isToday = isCurrentMonth && day === today.getDate()
            const isSelected = day === selectedDay

            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`bg-[var(--color-bg)] p-1 text-left flex flex-col min-h-[60px] transition-colors ${
                  isSelected ? 'ring-1 ring-[#00ff88] ring-inset' : 'hover:bg-[var(--color-bgSecondary)]'
                }`}
              >
                <span className={`text-xs w-6 h-6 flex items-center justify-center rounded-full ${
                  isToday ? 'bg-[#00ff88] text-[#0a0a0a] font-bold' : 'text-[var(--color-text)]'
                }`}>
                  {day}
                </span>
                {dayEvents.length > 0 && (
                  <div className="flex flex-wrap gap-0.5 mt-0.5">
                    {dayEvents.slice(0, 3).map(evt => (
                      <div
                        key={evt.id}
                        className="text-[9px] px-1 rounded truncate max-w-full"
                        style={{ backgroundColor: EVENT_COLORS[evt.type] + '30', color: EVENT_COLORS[evt.type] }}
                        title={evt.title}
                      >
                        {evt.icon} {evt.title}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-[9px] text-[var(--color-textSecondary)]">
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                )}
              </button>
            )
          })}

          {/* Empty cells after last day */}
          {Array.from({ length: (7 - (firstDay + daysInMonth) % 7) % 7 }, (_, i) => (
            <div key={`trail-${i}`} className="bg-[var(--color-bg)] p-1" />
          ))}
        </div>
      </div>

      {/* Context Menu */}
      {ctx.visible && (
        <ContextMenu
          items={calendarPreset({
            selectedDate: selectedDateStr,
            onCopyDate: handleCopyDate,
            onGoToToday: goToToday,
          })}
          x={ctx.x}
          y={ctx.y}
          onClose={ctx.hide}
        />
      )}
    </div>
  )
}
