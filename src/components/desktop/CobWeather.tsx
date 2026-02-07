/**
 * CobWeather - Weather App
 *
 * Displays deterministic weather from the server with gradient backgrounds,
 * current conditions, and a 5-day forecast.
 */

import { useState, useEffect } from 'react'
import { useWSRequest } from '../../stores/wsStore.js'

interface CurrentWeather {
  temp: number
  condition: string
  icon: string
  gradient: [string, string]
  humidity: number
  windSpeed: number
  feelsLike: number
}

interface ForecastDay {
  date: string
  dayName: string
  temp: number
  tempHigh: number
  tempLow: number
  condition: string
  icon: string
}

interface WeatherData {
  current: CurrentWeather
  forecast: ForecastDay[]
  location: string
}

export function CobWeather() {
  const { request, connected } = useWSRequest()
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!connected) return
    setLoading(true)
    request<void, WeatherData>('weather:get')
      .then(data => { setWeather(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [connected, request])

  if (loading || !weather) {
    return (
      <div className="flex items-center justify-center h-full bg-[var(--color-bg)]">
        <div className="text-[var(--color-textSecondary)]">Loading weather...</div>
      </div>
    )
  }

  const { current, forecast, location } = weather

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Current weather - gradient hero */}
      <div
        className="flex-1 flex flex-col items-center justify-center p-6 text-white relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${current.gradient[0]}, ${current.gradient[1]})`,
        }}
      >
        <div className="text-sm font-medium opacity-80 mb-2">{location}</div>
        <div className="text-7xl mb-2">{current.icon}</div>
        <div className="text-6xl font-light mb-1">{current.temp}°F</div>
        <div className="text-lg opacity-90 mb-4">{current.condition}</div>
        <div className="flex gap-6 text-sm opacity-80">
          <div className="flex flex-col items-center">
            <span className="text-xs">Feels Like</span>
            <span className="font-medium">{current.feelsLike}°F</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xs">Humidity</span>
            <span className="font-medium">{current.humidity}%</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xs">Wind</span>
            <span className="font-medium">{current.windSpeed} mph</span>
          </div>
        </div>
      </div>

      {/* 5-day forecast */}
      <div className="bg-[var(--color-bg)] border-t border-[var(--color-border)] p-4">
        <div className="text-xs text-[var(--color-textSecondary)] font-medium mb-3 uppercase tracking-wider">
          5-Day Forecast
        </div>
        <div className="flex gap-2">
          {forecast.map(day => (
            <div
              key={day.date}
              className="flex-1 flex flex-col items-center gap-1 p-2 rounded-lg bg-[var(--color-bgSecondary)] border border-[var(--color-border)]"
            >
              <span className="text-xs font-medium text-[var(--color-textSecondary)]">{day.dayName}</span>
              <span className="text-2xl">{day.icon}</span>
              <div className="flex gap-1 text-xs">
                <span className="text-[var(--color-text)] font-medium">{day.tempHigh}°</span>
                <span className="text-[var(--color-textSecondary)]">{day.tempLow}°</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
