/**
 * Boot Screen Component
 *
 * Linux-style boot screen with scrolling init messages.
 * Displays during the initial boot sequence before login screen.
 */

import { useEffect, useRef } from 'react'
import { useBootStore, runBootSequence } from '../../stores/bootStore'
import { useWSStore } from '../../stores/wsStore'
import { useAccountStore } from '../../stores/accountStore'

export function BootScreen() {
  const { bootMessages, bootProgress, bootError, bootComplete, setPhase } = useBootStore()
  const loadAccounts = useAccountStore((state) => state.loadAccounts)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const hasStartedRef = useRef(false)

  // Auto-scroll to bottom as new messages appear
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [bootMessages])

  // Run boot sequence on mount
  useEffect(() => {
    if (hasStartedRef.current) return
    hasStartedRef.current = true

    const runBoot = async () => {
      try {
        await runBootSequence(async (step) => {
          // Real steps that actually do something
          if (step.includes('Connecting to server')) {
            // Ensure WebSocket is connected
            const currentState = useWSStore.getState()
            if (!currentState.connected) {
              currentState.connect()
              // Wait for connection
              await new Promise<void>((resolve, reject) => {
                const timeout = setTimeout(() => reject(new Error('Connection timeout')), 10000)
                const checkConnection = setInterval(() => {
                  if (useWSStore.getState().connected) {
                    clearInterval(checkConnection)
                    clearTimeout(timeout)
                    resolve()
                  }
                }, 100)
              })
            }
          } else if (step.includes('Loading accounts')) {
            await loadAccounts()
          }
        })
      } catch (error) {
        console.error('[Boot] Boot sequence failed:', error)
      }
    }

    runBoot()
  }, [])

  // Transition to login when boot completes
  useEffect(() => {
    if (bootComplete) {
      // Small delay before transitioning
      const timer = setTimeout(() => {
        setPhase('login')
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [bootComplete, setPhase])

  return (
    <div className="fixed inset-0 bg-black flex flex-col font-mono text-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 text-green-500 border-b border-green-900">
        <pre className="text-xs leading-tight">
{`
███████╗███╗   ██╗ ██████╗  █████╗ ██╗ ██████╗ ███████╗
██╔════╝████╗  ██║██╔════╝ ██╔══██╗██║██╔════╝ ██╔════╝
█████╗  ██╔██╗ ██║██║  ███╗███████║██║██║  ███╗█████╗
██╔══╝  ██║╚██╗██║██║   ██║██╔══██║██║██║   ██║██╔══╝
███████╗██║ ╚████║╚██████╔╝██║  ██║██║╚██████╔╝███████╗
╚══════╝╚═╝  ╚═══╝ ╚═════╝ ╚═╝  ╚═╝╚═╝ ╚═════╝ ╚══════╝
`.trim()}
        </pre>
      </div>

      {/* Boot messages */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-green-900 scrollbar-track-transparent">
        {bootMessages.map((msg, index) => (
          <div
            key={index}
            className={`leading-relaxed ${
              msg.type === 'error'
                ? 'text-red-500'
                : msg.type === 'warning'
                  ? 'text-yellow-500'
                  : msg.type === 'success'
                    ? 'text-green-400'
                    : 'text-gray-300'
            }`}
          >
            {msg.message}
          </div>
        ))}
        <div ref={messagesEndRef} />

        {/* Blinking cursor */}
        {!bootComplete && !bootError && (
          <span className="inline-block w-2 h-4 bg-green-500 animate-pulse" />
        )}
      </div>

      {/* Progress bar */}
      <div className="p-4 border-t border-green-900">
        <div className="flex items-center gap-4">
          <div className="flex-1 h-2 bg-green-900/30 rounded overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all duration-300"
              style={{ width: `${bootProgress}%` }}
            />
          </div>
          <span className="text-green-500 w-12 text-right">{bootProgress}%</span>
        </div>

        {bootError && (
          <div className="mt-2 text-red-500">
            Boot failed: {bootError}
            <button
              onClick={() => {
                useBootStore.getState().reset()
                hasStartedRef.current = false
                window.location.reload()
              }}
              className="ml-4 px-3 py-1 bg-red-900/50 hover:bg-red-900/70 rounded text-sm"
            >
              Retry
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default BootScreen
