import { useOnboardingStore } from '../../../stores/onboardingStore.js'
import { useSimulationStore } from '../../../stores/simulationStore.js'
import { SettingsCard } from '../components/SettingsCard.js'

export default function DeveloperSettings() {
  const { reset } = useOnboardingStore()
  const {
    isRunning,
    isPaused,
    speedMultiplier,
    totalTicksProcessed,
    start,
    stop,
    pause,
    resume,
    tick,
    setSpeed,
    getGameTimeFormatted,
  } = useSimulationStore()

  const handleResetOnboarding = () => {
    if (confirm('Reset onboarding? This will reload the page.')) {
      reset()
      window.location.reload()
    }
  }

  const speedOptions = [0.5, 1, 2, 4, 8]

  return (
    <div className="space-y-6">
      {/* Simulation Controls */}
      <SettingsCard
        title="Simulation Controls"
        description="Control the game simulation that drives NPC behavior"
      >
        <div className="space-y-4">
          {/* Status Display */}
          <div
            className="p-4 rounded flex items-center justify-between"
            style={{
              background: 'var(--color-bg)',
              border: '1px solid var(--color-border)',
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  background: isRunning
                    ? isPaused
                      ? 'var(--color-warning)'
                      : 'var(--color-success)'
                    : 'var(--color-textMuted)',
                }}
              />
              <div>
                <div className="font-medium" style={{ color: 'var(--color-text)' }}>
                  {isRunning ? (isPaused ? 'Paused' : 'Running') : 'Stopped'}
                </div>
                <div className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
                  {getGameTimeFormatted()}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-mono" style={{ color: 'var(--color-text)' }}>
                {speedMultiplier}x speed
              </div>
              <div className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
                {totalTicksProcessed} ticks
              </div>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex gap-2">
            {!isRunning ? (
              <button
                onClick={start}
                className="flex-1 px-4 py-2 rounded text-sm font-medium transition-colors text-white"
                style={{ background: 'var(--color-success)' }}
              >
                Start Simulation
              </button>
            ) : (
              <>
                {isPaused ? (
                  <button
                    onClick={resume}
                    className="flex-1 px-4 py-2 rounded text-sm font-medium transition-colors text-white"
                    style={{ background: 'var(--color-success)' }}
                  >
                    Resume
                  </button>
                ) : (
                  <button
                    onClick={pause}
                    className="flex-1 px-4 py-2 rounded text-sm font-medium transition-colors text-white"
                    style={{ background: 'var(--color-warning)' }}
                  >
                    Pause
                  </button>
                )}
                <button
                  onClick={stop}
                  className="flex-1 px-4 py-2 rounded text-sm font-medium transition-colors text-white"
                  style={{ background: 'var(--color-error)' }}
                >
                  Stop
                </button>
              </>
            )}
          </div>

          {/* Speed Control */}
          <div className="space-y-2">
            <label className="block text-sm font-medium" style={{ color: 'var(--color-text)' }}>
              Simulation Speed
            </label>
            <div className="flex gap-2">
              {speedOptions.map((speed) => (
                <button
                  key={speed}
                  onClick={() => setSpeed(speed)}
                  className="flex-1 px-3 py-2 rounded text-sm font-medium transition-colors"
                  style={{
                    background: speedMultiplier === speed ? 'var(--color-primary)' : 'var(--color-bg)',
                    color: speedMultiplier === speed ? 'white' : 'var(--color-text)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  {speed}x
                </button>
              ))}
            </div>
            <div className="text-xs" style={{ color: 'var(--color-textMuted)' }}>
              At 1x: 1 real second = 15 in-game minutes (~4 real minutes = 1 in-game day)
            </div>
          </div>

          {/* Manual Tick Button */}
          <div className="pt-2 border-t" style={{ borderColor: 'var(--color-border)' }}>
            <button
              onClick={tick}
              className="px-4 py-2 rounded text-sm font-medium transition-colors"
              style={{
                background: 'var(--color-bgTertiary)',
                color: 'var(--color-text)',
                border: '1px solid var(--color-border)',
              }}
            >
              Manual Tick (Debug)
            </button>
            <div className="text-xs mt-1" style={{ color: 'var(--color-textMuted)' }}>
              Advances game time by 15 minutes and triggers all systems
            </div>
          </div>
        </div>
      </SettingsCard>

      {/* Other Developer Options */}
      <SettingsCard
        title="Developer Options"
        description="Testing and debugging tools"
      >
        <button
          onClick={handleResetOnboarding}
          className="px-4 py-2 rounded text-sm font-medium transition-colors text-white"
          style={{
            background: 'var(--color-error)',
          }}
        >
          Reset Onboarding
        </button>
      </SettingsCard>
    </div>
  )
}
