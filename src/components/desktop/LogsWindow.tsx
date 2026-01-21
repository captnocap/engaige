/**
 * Logs Window
 *
 * A comprehensive log viewer for monitoring all backend systems:
 * - Events: Master event log from the event bus
 * - Errors: Error log with severity and resolution tracking
 * - Budget: API spending per category
 * - Queue: AI request queue status
 */

import { useState, useEffect, useCallback } from 'react'
import { Select } from '../ui/Select.js'
import { useWSStore } from '../../stores/wsStore.js'

// ============================================================================
// Types
// ============================================================================

type LogTab = 'events' | 'errors' | 'budget' | 'queue'

interface GameEvent {
  id: string
  event_type: string
  category: string
  payload: string // JSON string
  timestamp: number
  source: string
  player_id?: string
  npc_id?: string
  conversation_id?: string
  post_id?: string
  session_id?: string
  importance: number
  parent_event_id?: string
}

interface ErrorLog {
  id: string
  timestamp: number
  severity: 'critical' | 'high' | 'medium' | 'low'
  error_type: string
  message: string
  stack?: string
  code?: string
  source: string
  operation?: string
  npc_id?: string
  player_id?: string
  conversation_id?: string
  task_id?: string
  request_id?: string
  session_id?: string
  metadata?: string // JSON string
  resolved: boolean
  resolved_at?: number
  resolution_notes?: string
}

interface BudgetLog {
  id: string
  timestamp: number
  provider: string
  model: string
  feature_category: string
  input_tokens?: number
  output_tokens?: number
  total_tokens?: number
  cost_cents: number
  request_metadata?: string // JSON string
}

interface QueueItem {
  id: string
  priority: number
  priorityName: string
  type: string
  estimatedCost: number
  npcId?: string
  playerId?: string
  featureCategory?: string
  createdAt: number
  attempts: number
  lastError?: string
  status: string
  count?: number
}

interface QueueStatus {
  active: QueueItem[]
  deferred: QueueItem[]
  processing: number
  stats: {
    total: number
    totalProcessed: number
    totalDeferred: number
    totalExpired: number
    totalFailed: number
    totalCostCents: number
    byPriority: Record<number, number>
    byType: Record<string, number>
  }
  budget: {
    remaining_cents: number
    daily_limit_cents: number
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

function formatTimestamp(ts: number): string {
  const date = new Date(ts)
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(4)}`
}

function getEventCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    player: '#3b82f6',      // blue
    npc: '#8b5cf6',         // purple
    conversation: '#10b981', // green
    relationship: '#f59e0b', // amber
    social: '#ec4899',      // pink
    memory: '#6366f1',      // indigo
    budget: '#14b8a6',      // teal
    system: '#6b7280',      // gray
    scheduler: '#f97316',   // orange
    ai: '#06b6d4',          // cyan
    media: '#84cc16',       // lime
    news: '#a855f7',        // violet
  }
  return colors[category] || '#6b7280'
}

function getSeverityColor(severity: string): string {
  const colors: Record<string, string> = {
    critical: '#ef4444', // red
    high: '#f97316',     // orange
    medium: '#f59e0b',   // amber
    low: '#6b7280',      // gray
  }
  return colors[severity] || '#6b7280'
}

function getPriorityLabel(priority: number): string {
  const labels: Record<number, string> = {
    1: 'CRITICAL',
    2: 'HIGH',
    3: 'MEDIUM',
    4: 'LOW',
    5: 'IDLE',
  }
  return labels[priority] || `P${priority}`
}

function getPriorityColor(priority: number): string {
  const colors: Record<number, string> = {
    1: '#ef4444', // red
    2: '#f97316', // orange
    3: '#f59e0b', // amber
    4: '#6b7280', // gray
    5: '#9ca3af', // light gray
  }
  return colors[priority] || '#6b7280'
}

// ============================================================================
// Tab Components
// ============================================================================

function EventsTab() {
  const [events, setEvents] = useState<GameEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(false)

  const connected = useWSStore(s => s.connected)
  const request = useWSStore(s => s.request)

  const categories = [
    'all', 'player', 'npc', 'conversation', 'relationship', 'social',
    'memory', 'budget', 'system', 'scheduler', 'ai', 'media', 'news'
  ]

  const fetchEvents = useCallback(async () => {
    if (!connected) {
      setError('Not connected to server')
      setLoading(false)
      return
    }

    try {
      setError(null)
      const payload: { limit: number; category?: string } = { limit: 100 }
      if (categoryFilter !== 'all') {
        payload.category = categoryFilter
      }
      const data = await request<typeof payload, { events: GameEvent[]; total: number }>('logs:getEvents', payload)
      setEvents(data.events || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch events')
    } finally {
      setLoading(false)
    }
  }, [categoryFilter, connected, request])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  useEffect(() => {
    if (!autoRefresh) return
    const interval = setInterval(fetchEvents, 2000)
    return () => clearInterval(interval)
  }, [autoRefresh, fetchEvents])

  if (loading) {
    return <div className="p-4 text-center text-gray-400">Loading events...</div>
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="p-3 rounded bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
        <button
          onClick={fetchEvents}
          className="mt-2 px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Filters */}
      <div className="p-3 border-b border-gray-700 flex items-center gap-3">
        <Select
          value={categoryFilter}
          onChange={setCategoryFilter}
          options={categories.map(c => ({ value: c, label: c.charAt(0).toUpperCase() + c.slice(1) }))}
          className="w-40"
        />
        <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={(e) => setAutoRefresh(e.target.checked)}
            className="rounded"
          />
          Auto-refresh
        </label>
        <button
          onClick={fetchEvents}
          className="ml-auto px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded"
        >
          Refresh
        </button>
        <span className="text-xs text-gray-500">{events.length} events</span>
      </div>

      {/* Event List */}
      <div className="flex-1 overflow-y-auto">
        {events.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No events found</div>
        ) : (
          <div className="divide-y divide-gray-800">
            {events.map((event) => (
              <div
                key={event.id}
                className="p-2 hover:bg-gray-800/50 cursor-pointer"
                onClick={() => setExpandedEvent(expandedEvent === event.id ? null : event.id)}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="px-1.5 py-0.5 text-xs font-medium rounded"
                    style={{
                      background: `${getEventCategoryColor(event.category)}20`,
                      color: getEventCategoryColor(event.category),
                    }}
                  >
                    {event.category}
                  </span>
                  <span className="text-sm text-gray-300 flex-1 truncate">
                    {event.event_type.split(':')[1] || event.event_type}
                  </span>
                  <span
                    className="text-xs px-1.5 py-0.5 rounded"
                    style={{
                      background: `rgba(255,255,255,${event.importance * 0.2})`,
                      color: event.importance > 0.7 ? '#fbbf24' : '#9ca3af',
                    }}
                  >
                    {event.importance.toFixed(1)}
                  </span>
                  <span className="text-xs text-gray-500 font-mono">
                    {formatTimestamp(event.timestamp)}
                  </span>
                </div>

                {expandedEvent === event.id && (
                  <div className="mt-2 p-2 bg-gray-900 rounded text-xs font-mono overflow-x-auto">
                    <div className="text-gray-400 mb-1">
                      Source: {event.source} | ID: {event.id.slice(0, 8)}...
                      {event.npc_id && ` | NPC: ${event.npc_id}`}
                      {event.player_id && ` | Player: ${event.player_id}`}
                    </div>
                    <pre className="text-gray-300 whitespace-pre-wrap">
                      {JSON.stringify(JSON.parse(event.payload || '{}'), null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ErrorsTab() {
  const [errors, setErrors] = useState<ErrorLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [severityFilter, setSeverityFilter] = useState('all')
  const [showResolved, setShowResolved] = useState(false)
  const [expandedError, setExpandedError] = useState<string | null>(null)

  const connected = useWSStore(s => s.connected)
  const request = useWSStore(s => s.request)

  const fetchErrors = useCallback(async () => {
    if (!connected) {
      setError('Not connected to server')
      setLoading(false)
      return
    }

    try {
      setError(null)
      const payload: { limit: number; severity?: string; unresolved?: boolean } = { limit: 100 }
      if (severityFilter !== 'all') {
        payload.severity = severityFilter
      }
      if (!showResolved) {
        payload.unresolved = true
      }
      const data = await request<typeof payload, { errors: ErrorLog[]; total: number }>('logs:getErrors', payload)
      setErrors(data.errors || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch errors')
    } finally {
      setLoading(false)
    }
  }, [severityFilter, showResolved, connected, request])

  useEffect(() => {
    fetchErrors()
  }, [fetchErrors])

  const handleResolve = async (errorId: string) => {
    try {
      await request<{ errorId: string; notes?: string }, { success: boolean }>('logs:resolveError', {
        errorId,
        notes: 'Resolved via Logs Viewer',
      })
      fetchErrors()
    } catch (err) {
      console.error('Failed to resolve error:', err)
    }
  }

  if (loading) {
    return <div className="p-4 text-center text-gray-400">Loading errors...</div>
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="p-3 rounded bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
        <button
          onClick={fetchErrors}
          className="mt-2 px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Filters */}
      <div className="p-3 border-b border-gray-700 flex items-center gap-3">
        <Select
          value={severityFilter}
          onChange={setSeverityFilter}
          options={[
            { value: 'all', label: 'All Severities' },
            { value: 'critical', label: 'Critical' },
            { value: 'high', label: 'High' },
            { value: 'medium', label: 'Medium' },
            { value: 'low', label: 'Low' },
          ]}
          className="w-40"
        />
        <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
          <input
            type="checkbox"
            checked={showResolved}
            onChange={(e) => setShowResolved(e.target.checked)}
            className="rounded"
          />
          Show resolved
        </label>
        <button
          onClick={fetchErrors}
          className="ml-auto px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded"
        >
          Refresh
        </button>
        <span className="text-xs text-gray-500">{errors.length} errors</span>
      </div>

      {/* Error List */}
      <div className="flex-1 overflow-y-auto">
        {errors.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            {showResolved ? 'No errors found' : 'No unresolved errors'}
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {errors.map((err) => (
              <div
                key={err.id}
                className={`p-2 hover:bg-gray-800/50 cursor-pointer ${err.resolved ? 'opacity-50' : ''}`}
                onClick={() => setExpandedError(expandedError === err.id ? null : err.id)}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="px-1.5 py-0.5 text-xs font-medium rounded uppercase"
                    style={{
                      background: `${getSeverityColor(err.severity)}20`,
                      color: getSeverityColor(err.severity),
                    }}
                  >
                    {err.severity}
                  </span>
                  <span className="text-sm text-gray-300 flex-1 truncate">
                    {err.message}
                  </span>
                  {err.resolved && (
                    <span className="text-xs text-green-500">Resolved</span>
                  )}
                  <span className="text-xs text-gray-500 font-mono">
                    {formatTimestamp(err.timestamp)}
                  </span>
                </div>

                {expandedError === err.id && (
                  <div className="mt-2 p-2 bg-gray-900 rounded text-xs space-y-2">
                    <div className="text-gray-400">
                      Source: {err.source} | Operation: {err.operation || 'N/A'} | Type: {err.error_type}
                    </div>
                    {err.stack && (
                      <pre className="text-red-400/80 whitespace-pre-wrap overflow-x-auto max-h-40">
                        {err.stack}
                      </pre>
                    )}
                    {err.metadata && (
                      <pre className="text-gray-300 whitespace-pre-wrap">
                        {JSON.stringify(JSON.parse(err.metadata), null, 2)}
                      </pre>
                    )}
                    {!err.resolved && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleResolve(err.id)
                        }}
                        className="px-2 py-1 text-xs bg-green-600 hover:bg-green-500 rounded"
                      >
                        Mark Resolved
                      </button>
                    )}
                    {err.resolved && err.resolution_notes && (
                      <div className="text-green-400/80">
                        Resolution: {err.resolution_notes}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function BudgetTab() {
  const [logs, setLogs] = useState<BudgetLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [expandedLog, setExpandedLog] = useState<string | null>(null)

  const connected = useWSStore(s => s.connected)
  const request = useWSStore(s => s.request)

  const categories = [
    'all', 'conversation', 'npc_generation', 'autonomous_posts',
    'random_events', 'vision_proxy', 'npc_tuning', 'image_generation', 'other'
  ]

  const fetchLogs = useCallback(async () => {
    if (!connected) {
      setError('Not connected to server')
      setLoading(false)
      return
    }

    try {
      setError(null)
      const payload: { limit: number; category?: string } = { limit: 100 }
      if (categoryFilter !== 'all') {
        payload.category = categoryFilter
      }
      const data = await request<typeof payload, { logs: BudgetLog[] }>('budget:getLogs', payload)
      setLogs(data.logs || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch budget logs')
    } finally {
      setLoading(false)
    }
  }, [categoryFilter, connected, request])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  const totalCost = logs.reduce((sum, log) => sum + log.cost_cents, 0)

  if (loading) {
    return <div className="p-4 text-center text-gray-400">Loading budget logs...</div>
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="p-3 rounded bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
        <button
          onClick={fetchLogs}
          className="mt-2 px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Filters */}
      <div className="p-3 border-b border-gray-700 flex items-center gap-3">
        <Select
          value={categoryFilter}
          onChange={setCategoryFilter}
          options={categories.map(c => ({
            value: c,
            label: c === 'all' ? 'All Categories' : c.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
          }))}
          className="w-48"
        />
        <button
          onClick={fetchLogs}
          className="ml-auto px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded"
        >
          Refresh
        </button>
        <span className="text-xs text-gray-500">{logs.length} logs</span>
        <span className="text-xs font-medium text-teal-400">
          Total: {formatCents(totalCost)}
        </span>
      </div>

      {/* Budget Log List */}
      <div className="flex-1 overflow-y-auto">
        {logs.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No budget logs found</div>
        ) : (
          <div className="divide-y divide-gray-800">
            {logs.map((log) => (
              <div
                key={log.id}
                className="p-2 hover:bg-gray-800/50 cursor-pointer"
                onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
              >
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 text-xs font-medium rounded bg-teal-500/20 text-teal-400">
                    {log.feature_category}
                  </span>
                  <span className="text-sm text-gray-300 flex-1">
                    {log.provider}/{log.model}
                  </span>
                  {log.total_tokens && (
                    <span className="text-xs text-gray-500">
                      {log.total_tokens.toLocaleString()} tokens
                    </span>
                  )}
                  <span className="text-xs font-mono text-teal-400">
                    {formatCents(log.cost_cents)}
                  </span>
                  <span className="text-xs text-gray-500 font-mono">
                    {formatTimestamp(log.timestamp)}
                  </span>
                </div>

                {expandedLog === log.id && (
                  <div className="mt-2 p-2 bg-gray-900 rounded text-xs font-mono">
                    <div className="grid grid-cols-2 gap-2 text-gray-400">
                      <div>Provider: {log.provider}</div>
                      <div>Model: {log.model}</div>
                      <div>Input: {log.input_tokens?.toLocaleString() || 'N/A'}</div>
                      <div>Output: {log.output_tokens?.toLocaleString() || 'N/A'}</div>
                    </div>
                    {log.request_metadata && (
                      <pre className="mt-2 text-gray-300 whitespace-pre-wrap">
                        {JSON.stringify(JSON.parse(log.request_metadata), null, 2)}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function QueueTab() {
  const [queue, setQueue] = useState<QueueStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)

  const connected = useWSStore(s => s.connected)
  const request = useWSStore(s => s.request)

  const fetchQueue = useCallback(async () => {
    if (!connected) {
      setError('Not connected to server')
      setLoading(false)
      return
    }

    try {
      setError(null)
      const data = await request<void, QueueStatus>('logs:getQueue')
      setQueue(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch queue')
    } finally {
      setLoading(false)
    }
  }, [connected, request])

  useEffect(() => {
    fetchQueue()
  }, [fetchQueue])

  useEffect(() => {
    if (!autoRefresh) return
    const interval = setInterval(fetchQueue, 1000)
    return () => clearInterval(interval)
  }, [autoRefresh, fetchQueue])

  if (loading) {
    return <div className="p-4 text-center text-gray-400">Loading queue...</div>
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="p-3 rounded bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
        <button
          onClick={fetchQueue}
          className="mt-2 px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded"
        >
          Retry
        </button>
      </div>
    )
  }

  const activeItems = queue?.active || []
  const deferredItems = queue?.deferred || []

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-gray-700 flex items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={(e) => setAutoRefresh(e.target.checked)}
            className="rounded"
          />
          Auto-refresh (1s)
        </label>
        <button
          onClick={fetchQueue}
          className="ml-auto px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded"
        >
          Refresh
        </button>
        <span className="text-xs text-gray-500">
          {queue?.processing || 0} processing, {activeItems.length} queued, {deferredItems.length} deferred
        </span>
      </div>

      {/* Queue Stats */}
      {queue?.stats && (
        <div className="p-3 border-b border-gray-700 flex gap-4 text-xs">
          <div className="text-gray-400">
            Processed: <span className="text-white font-medium">{queue.stats.totalProcessed}</span>
          </div>
          <div className="text-gray-400">
            Deferred: <span className="text-yellow-400 font-medium">{queue.stats.totalDeferred}</span>
          </div>
          <div className="text-gray-400">
            Failed: <span className="text-red-400 font-medium">{queue.stats.totalFailed}</span>
          </div>
          <div className="text-gray-400">
            Cost: <span className="text-teal-400 font-medium">{formatCents(queue.stats.totalCostCents)}</span>
          </div>
          {queue.budget && (
            <div className="text-gray-400 ml-auto">
              Budget: <span className="text-green-400 font-medium">
                {formatCents(queue.budget.remaining_cents)} / {formatCents(queue.budget.daily_limit_cents)}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Queue Lists */}
      <div className="flex-1 overflow-y-auto">
        {activeItems.length === 0 && deferredItems.length === 0 ? (
          <div className="p-4 text-center text-gray-500">Queue is empty</div>
        ) : (
          <div className="space-y-4 p-3">
            {/* Active Queue */}
            {activeItems.length > 0 && (
              <div>
                <h3 className="text-xs font-medium text-gray-400 uppercase mb-2">
                  Queued by Priority
                </h3>
                <div className="space-y-1">
                  {activeItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-2 bg-gray-800 rounded flex items-center gap-2"
                    >
                      <span
                        className="px-1.5 py-0.5 text-xs font-medium rounded"
                        style={{
                          background: `${getPriorityColor(item.priority)}20`,
                          color: getPriorityColor(item.priority),
                        }}
                      >
                        {item.priorityName || getPriorityLabel(item.priority)}
                      </span>
                      <span className="text-sm text-gray-300 flex-1">
                        {item.count !== undefined ? `${item.count} requests` : item.type}
                      </span>
                      <span className="text-xs text-gray-500">
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Deferred Queue */}
            {deferredItems.length > 0 && (
              <div>
                <h3 className="text-xs font-medium text-yellow-400 uppercase mb-2">
                  Deferred (Budget Low)
                </h3>
                <div className="space-y-1">
                  {deferredItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-2 bg-yellow-900/20 border border-yellow-700/30 rounded flex items-center gap-2"
                    >
                      <span
                        className="px-1.5 py-0.5 text-xs font-medium rounded"
                        style={{
                          background: `${getPriorityColor(item.priority)}20`,
                          color: getPriorityColor(item.priority),
                        }}
                      >
                        {item.priorityName || getPriorityLabel(item.priority)}
                      </span>
                      <span className="text-sm text-gray-300 flex-1">
                        {item.count !== undefined ? `${item.count} requests` : item.type}
                      </span>
                      {item.lastError && (
                        <span className="text-xs text-red-400 truncate max-w-[200px]">
                          {item.lastError}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// Main Component
// ============================================================================

export function LogsWindow() {
  const [activeTab, setActiveTab] = useState<LogTab>('events')
  const connected = useWSStore(s => s.connected)
  const connect = useWSStore(s => s.connect)

  // Auto-connect on mount
  useEffect(() => {
    if (!connected) {
      connect()
    }
  }, [connected, connect])

  const tabs: { id: LogTab; label: string; icon: string }[] = [
    { id: 'events', label: 'Events', icon: '📊' },
    { id: 'errors', label: 'Errors', icon: '⚠️' },
    { id: 'budget', label: 'Budget', icon: '💰' },
    { id: 'queue', label: 'Queue', icon: '📋' },
  ]

  return (
    <div className="h-full flex flex-col bg-gray-900 text-white">
      {/* Connection Status */}
      {!connected && (
        <div className="p-2 bg-yellow-900/50 border-b border-yellow-700/50 text-yellow-200 text-xs flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
          Connecting to server...
        </div>
      )}

      {/* Tab Bar */}
      <div className="flex border-b border-gray-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-gray-800 text-white border-b-2 border-cyan-500'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'events' && <EventsTab />}
        {activeTab === 'errors' && <ErrorsTab />}
        {activeTab === 'budget' && <BudgetTab />}
        {activeTab === 'queue' && <QueueTab />}
      </div>
    </div>
  )
}
