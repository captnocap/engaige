/**
 * Wallet Window
 *
 * Budget tracking and API cost management interface.
 * Uses WebSocket for all server communication.
 */

import { useState, useEffect, useCallback } from 'react'
import { Select } from '../ui/Select.js'
import { useWSStore, useWSRequest, useWSConnection } from '../../stores/wsStore.js'

// ============================================================================
// Types
// ============================================================================

interface CategoryStatus {
  name: string
  display_name: string
  allocated_cents: number
  spent_cents: number
  remaining_cents: number
}

interface BudgetStatus {
  period_start: number
  period_end: number
  overall_limit_cents: number
  total_spent_cents: number
  remaining_cents: number
  rollover_available_cents: number
  categories: CategoryStatus[]
}

interface BudgetConfig {
  overall_limit_cents: number
  period_type: 'daily' | 'weekly' | 'monthly'
  rollover_enabled: boolean
  max_rollover_days: number
  allocations: Record<string, { percentage?: number; cents_override?: number }>
}

interface ApiCostLog {
  id: string
  timestamp: number
  provider: string
  model: string
  feature_category: string
  input_tokens?: number
  output_tokens?: number
  total_tokens?: number
  cost_cents: number
  request_metadata?: Record<string, unknown>
}

interface CategoryInfo {
  name: string
  display_name: string
  description: string
}

// ============================================================================
// Component
// ============================================================================

export function WalletWindow() {
  const { request, connected } = useWSRequest()
  const { connect } = useWSConnection()

  const [status, setStatus] = useState<BudgetStatus | null>(null)
  const [config, setConfig] = useState<BudgetConfig | null>(null)
  const [logs, setLogs] = useState<ApiCostLog[]>([])
  const [categories, setCategories] = useState<CategoryInfo[]>([])
  const [logsTotal, setLogsTotal] = useState(0)
  const [logsOffset, setLogsOffset] = useState(0)
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [expandedLog, setExpandedLog] = useState<string | null>(null)
  const [editingCategory, setEditingCategory] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [editType, setEditType] = useState<'percentage' | 'fixed'>('percentage')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch budget data via WebSocket
  const fetchData = useCallback(async () => {
    if (!connected) {
      setError('Not connected to server')
      setLoading(false)
      return
    }

    try {
      setError(null)

      // Make parallel requests via WebSocket
      const [statusData, configData] = await Promise.all([
        request<void, BudgetStatus>('budget:getStatus'),
        request<void, BudgetConfig>('budget:getConfig'),
      ])

      setStatus(statusData)
      setConfig(configData)

      // Extract categories from status if available
      if (statusData?.categories) {
        setCategories(statusData.categories.map(cat => ({
          name: cat.name,
          display_name: cat.display_name,
          description: '',
        })))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch budget data')
    } finally {
      setLoading(false)
    }
  }, [connected, request])

  // Fetch logs via WebSocket
  const fetchLogs = useCallback(async (offset = 0, category = categoryFilter) => {
    if (!connected) return

    try {
      const payload: { limit: number; offset: number; category?: string } = {
        limit: 50,
        offset,
      }
      if (category !== 'all') {
        payload.category = category
      }

      const data = await request<typeof payload, { logs: ApiCostLog[]; total: number; offset: number }>(
        'budget:getLogs',
        payload
      )

      setLogs(data.logs || [])
      setLogsTotal(data.total || 0)
      setLogsOffset(data.offset || 0)
    } catch (err) {
      console.error('[Wallet] Failed to fetch logs:', err)
    }
  }, [connected, request, categoryFilter])

  // Auto-connect and fetch on mount
  useEffect(() => {
    if (!connected) {
      connect()
    }
  }, [connect, connected])

  // Fetch data when connected
  useEffect(() => {
    if (connected) {
      fetchData()
      fetchLogs()
    }
  }, [connected, fetchData, fetchLogs])

  const handleCategoryFilterChange = (value: string) => {
    setCategoryFilter(value)
    setLogsOffset(0)
    fetchLogs(0, value)
  }

  const handleLoadMore = () => {
    const newOffset = logsOffset + 50
    fetchLogs(newOffset, categoryFilter)
  }

  const handleEditAllocation = (categoryName: string) => {
    if (!config) return
    const allocation = config.allocations[categoryName]
    if (allocation?.cents_override !== undefined) {
      setEditType('fixed')
      setEditValue((allocation.cents_override / 100).toString())
    } else {
      setEditType('percentage')
      setEditValue((allocation?.percentage || 0).toString())
    }
    setEditingCategory(categoryName)
  }

  const handleSaveAllocation = async () => {
    if (!config || !editingCategory || !connected) return

    const newAllocations = { ...config.allocations }
    if (editType === 'fixed') {
      newAllocations[editingCategory] = {
        cents_override: Math.round(parseFloat(editValue) * 100),
      }
    } else {
      newAllocations[editingCategory] = {
        percentage: parseFloat(editValue),
      }
    }

    try {
      await request('budget:updateConfig', { allocations: newAllocations })
      setEditingCategory(null)
      fetchData()
    } catch (err) {
      console.error('[Wallet] Failed to save allocation:', err)
    }
  }

  const formatCents = (cents: number) => `$${(cents / 100).toFixed(2)}`

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const getCategoryDisplayName = (name: string) => {
    const cat = categories.find(c => c.name === name)
    return cat?.display_name || name
  }

  // ============================================================================
  // Loading State
  // ============================================================================

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
        <div style={{ color: 'var(--color-textMuted)' }}>
          {connected ? 'Loading...' : 'Connecting...'}
        </div>
      </div>
    )
  }

  // ============================================================================
  // Error State
  // ============================================================================

  if (error || !connected) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-3 p-6" style={{ background: 'var(--color-bg)' }}>
        <div style={{ color: 'var(--color-error)' }}>{error || 'Not connected to server'}</div>
        <div className="text-xs text-center" style={{ color: 'var(--color-textMuted)' }}>
          Run: <code className="px-1.5 py-0.5 rounded" style={{ background: 'var(--color-bgSecondary)' }}>cd server && bun run src/index.ts</code>
        </div>
        <button
          onClick={() => {
            setLoading(true)
            setError(null)
            connect()
          }}
          className="px-3 py-1.5 rounded text-sm"
          style={{ background: 'var(--color-primary)', color: 'var(--color-text)' }}
        >
          Retry
        </button>
      </div>
    )
  }

  // ============================================================================
  // Main Render
  // ============================================================================

  const spentPercentage = status ? (status.total_spent_cents / status.overall_limit_cents) * 100 : 0
  const periodLabel = config?.period_type === 'daily' ? 'today' : config?.period_type === 'weekly' ? 'this week' : 'this month'

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ background: 'var(--color-bg)' }}>
      {/* Budget Overview - Compact */}
      <div className="shrink-0 px-4 pt-3 pb-2">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>
                {formatCents(status?.total_spent_cents || 0)}
              </span>
              <span className="text-sm" style={{ color: 'var(--color-textMuted)' }}>
                / {formatCents(status?.overall_limit_cents || 0)} {periodLabel}
              </span>
            </div>
            <div className="h-2 rounded-full overflow-hidden mt-1.5" style={{ background: 'var(--color-bgTertiary)' }}>
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.min(spentPercentage, 100)}%`,
                  background: spentPercentage > 90 ? 'var(--color-error)' : spentPercentage > 75 ? 'var(--color-warning)' : 'var(--color-primary)',
                }}
              />
            </div>
          </div>
          <div className="text-right text-xs" style={{ color: 'var(--color-textMuted)' }}>
            <div>{Math.round(spentPercentage)}% used</div>
            {status && status.rollover_available_cents > 0 && (
              <div>+{formatCents(status.rollover_available_cents)} rollover</div>
            )}
          </div>
        </div>
      </div>

      {/* Allocations - 2 column compact grid */}
      <div className="shrink-0 px-4 py-2" style={{ borderTop: '1px solid var(--color-border)' }}>
        <div className="text-[10px] uppercase tracking-wider mb-2" style={{ color: 'var(--color-textMuted)' }}>
          Allocations
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {status?.categories.map(cat => {
            const pct = cat.allocated_cents > 0 ? (cat.spent_cents / cat.allocated_cents) * 100 : 0
            const isEditing = editingCategory === cat.name

            if (isEditing) {
              return (
                <div
                  key={cat.name}
                  className="col-span-2 flex items-center gap-2 p-2 rounded"
                  style={{ background: 'var(--color-bgSecondary)' }}
                  onClick={e => e.stopPropagation()}
                >
                  <span className="text-xs font-medium flex-1" style={{ color: 'var(--color-text)' }}>{cat.display_name}</span>
                  <Select
                    value={editType}
                    onChange={(v) => setEditType(v as 'percentage' | 'fixed')}
                    options={[{ value: 'percentage', label: '%' }, { value: 'fixed', label: '$' }]}
                    className="w-14"
                  />
                  <input
                    type="number"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="w-16 px-2 py-1 rounded text-xs"
                    style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                    autoFocus
                  />
                  <button onClick={handleSaveAllocation} className="px-2 py-1 rounded text-xs" style={{ background: 'var(--color-primary)', color: 'var(--color-text)' }}>Save</button>
                  <button onClick={() => setEditingCategory(null)} className="px-2 py-1 rounded text-xs" style={{ background: 'var(--color-bgTertiary)', color: 'var(--color-text)' }}>X</button>
                </div>
              )
            }

            return (
              <div
                key={cat.name}
                className="flex items-center justify-between px-2 py-1.5 rounded cursor-pointer hover:opacity-80"
                style={{ background: 'var(--color-bgSecondary)' }}
                onClick={() => handleEditAllocation(cat.name)}
              >
                <span className="text-xs truncate" style={{ color: 'var(--color-text)' }}>{cat.display_name}</span>
                <div className="flex items-center gap-2">
                  <div className="w-12 h-1 rounded-full overflow-hidden" style={{ background: 'var(--color-bgTertiary)' }}>
                    <div className="h-full rounded-full" style={{ width: `${Math.min(pct, 100)}%`, background: pct > 90 ? 'var(--color-error)' : pct > 75 ? 'var(--color-warning)' : 'var(--color-success)' }} />
                  </div>
                  <span className="text-[10px] tabular-nums" style={{ color: 'var(--color-textMuted)' }}>
                    {formatCents(cat.spent_cents)}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Activity Log - Takes remaining space */}
      <div className="flex-1 min-h-0 flex flex-col px-4 pt-2 pb-3" style={{ borderTop: '1px solid var(--color-border)' }}>
        <div className="shrink-0 flex items-center justify-between mb-2">
          <div className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--color-textMuted)' }}>
            Activity Log
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={categoryFilter}
              onChange={handleCategoryFilterChange}
              options={[
                { value: 'all', label: 'All' },
                ...categories.map(c => ({ value: c.name, label: c.display_name })),
              ]}
              className="w-32"
            />
            <span className="text-[10px]" style={{ color: 'var(--color-textMuted)' }}>{logsTotal} total</span>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto rounded" style={{ background: 'var(--color-bgSecondary)' }}>
          {logs.length === 0 ? (
            <div className="flex items-center justify-center h-full text-sm" style={{ color: 'var(--color-textMuted)' }}>
              No activity yet
            </div>
          ) : (
            <table className="w-full text-xs">
              <tbody>
                {logs.map(log => {
                  const isExpanded = expandedLog === log.id
                  return (
                    <tr
                      key={log.id}
                      className="cursor-pointer hover:opacity-80 border-b last:border-b-0"
                      style={{ borderColor: 'var(--color-border)', background: isExpanded ? 'var(--color-bgTertiary)' : 'transparent' }}
                      onClick={() => setExpandedLog(isExpanded ? null : log.id)}
                    >
                      <td className="py-1.5 px-2 font-mono" style={{ color: 'var(--color-textMuted)', width: '60px' }}>{formatTime(log.timestamp)}</td>
                      <td className="py-1.5" style={{ color: 'var(--color-text)' }}>{getCategoryDisplayName(log.feature_category)}</td>
                      <td className="py-1.5 px-2 text-right" style={{ color: 'var(--color-textMuted)' }}>{log.model}</td>
                      <td className="py-1.5 px-2 text-right font-medium tabular-nums" style={{ color: 'var(--color-primary)', width: '50px' }}>{formatCents(log.cost_cents)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {logs.length < logsTotal && (
          <button
            onClick={handleLoadMore}
            className="shrink-0 mt-2 w-full py-1.5 rounded text-xs"
            style={{ background: 'var(--color-bgTertiary)', color: 'var(--color-text)' }}
          >
            Load More ({logsTotal - logs.length} remaining)
          </button>
        )}
      </div>
    </div>
  )
}
