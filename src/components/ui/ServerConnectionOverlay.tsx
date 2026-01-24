/**
 * ServerConnectionOverlay
 *
 * Full-screen blocking overlay that appears when the game server is disconnected.
 * This is NOT part of gameplay - it's a technical blocker to prevent confusion
 * when the backend server is unavailable.
 */

import { useEffect, useState } from 'react'
import { useWSConnection } from '../../stores/wsStore.js'

export function ServerConnectionOverlay() {
  const { connected, connect, sessionId } = useWSConnection()
  const [hasEverConnected, setHasEverConnected] = useState(false)
  const [manualRetrying, setManualRetrying] = useState(false)

  // Track if we've ever been connected
  useEffect(() => {
    if (connected && sessionId) {
      setHasEverConnected(true)
    }
  }, [connected, sessionId])

  // If we're connected, don't show the overlay
  if (connected) {
    return null
  }

  // Determine messaging based on state
  const isReconnecting = hasEverConnected
  const title = isReconnecting ? 'Connection Lost' : 'Connecting to Game Server'
  const message = isReconnecting
    ? 'The connection to the game server was lost. Attempting to reconnect...'
    : 'Please wait while we connect to the game server. If this takes too long, the server may not be running.'

  const handleManualRetry = () => {
    setManualRetrying(true)
    connect()
    setTimeout(() => setManualRetrying(false), 2000)
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div
        style={{
          background: '#1a1a1a',
          border: '2px solid #333',
          borderRadius: '12px',
          padding: '48px 64px',
          maxWidth: '500px',
          textAlign: 'center',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6)',
        }}
      >
        {/* Technical Icon */}
        <div
          style={{
            fontSize: '64px',
            marginBottom: '24px',
            animation: 'pulse 2s ease-in-out infinite',
          }}
        >
          ⚠️
        </div>

        {/* Title */}
        <h1
          style={{
            fontSize: '28px',
            fontWeight: '700',
            color: '#ffffff',
            marginBottom: '16px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          {title}
        </h1>

        {/* Message */}
        <p
          style={{
            fontSize: '16px',
            color: '#aaaaaa',
            lineHeight: '1.6',
            marginBottom: '32px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          {message}
        </p>

        {/* Loading Spinner */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            marginBottom: '24px',
          }}
        >
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#666',
              animation: 'bounce 1.4s infinite ease-in-out both',
              animationDelay: '-0.32s',
            }}
          />
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#666',
              animation: 'bounce 1.4s infinite ease-in-out both',
              animationDelay: '-0.16s',
            }}
          />
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#666',
              animation: 'bounce 1.4s infinite ease-in-out both',
            }}
          />
        </div>

        {/* Manual Retry Button */}
        <button
          onClick={handleManualRetry}
          disabled={manualRetrying}
          style={{
            padding: '12px 32px',
            fontSize: '14px',
            fontWeight: '600',
            color: manualRetrying ? '#666' : '#ffffff',
            backgroundColor: manualRetrying ? '#2a2a2a' : '#3a3a3a',
            border: '1px solid #555',
            borderRadius: '6px',
            cursor: manualRetrying ? 'not-allowed' : 'pointer',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            if (!manualRetrying) {
              e.currentTarget.style.backgroundColor = '#4a4a4a'
            }
          }}
          onMouseLeave={(e) => {
            if (!manualRetrying) {
              e.currentTarget.style.backgroundColor = '#3a3a3a'
            }
          }}
        >
          {manualRetrying ? 'Retrying...' : 'Retry Connection'}
        </button>

        {/* Technical Note */}
        <p
          style={{
            marginTop: '32px',
            fontSize: '12px',
            color: '#666',
            fontFamily: 'monospace',
          }}
        >
          This is a technical connection issue, not part of the game.
          <br />
          Make sure the backend server is running.
        </p>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        @keyframes bounce {
          0%, 80%, 100% {
            transform: scale(0);
          }
          40% {
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  )
}
