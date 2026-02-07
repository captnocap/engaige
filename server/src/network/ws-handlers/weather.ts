/**
 * Weather Handlers
 *
 * Deterministic weather generation based on game time.
 * Weather is seeded from the date so it's consistent across reloads.
 */

import type { ServerWebSocket } from 'bun';
import { createResponse, type WSMessage } from '../ws-protocol.js';
import type { ClientSession, HandlerContext, HandlerMap } from './types.js';

interface WeatherCondition {
  name: string;
  icon: string;
  gradient: [string, string];
}

const CONDITIONS: WeatherCondition[] = [
  { name: 'Sunny', icon: '☀️', gradient: ['#f59e0b', '#ea580c'] },
  { name: 'Partly Cloudy', icon: '⛅', gradient: ['#60a5fa', '#9ca3af'] },
  { name: 'Cloudy', icon: '☁️', gradient: ['#6b7280', '#9ca3af'] },
  { name: 'Rainy', icon: '🌧️', gradient: ['#374151', '#6b7280'] },
  { name: 'Thunderstorm', icon: '⛈️', gradient: ['#1f2937', '#4b5563'] },
  { name: 'Snowy', icon: '🌨️', gradient: ['#bfdbfe', '#e2e8f0'] },
  { name: 'Foggy', icon: '🌫️', gradient: ['#9ca3af', '#d1d5db'] },
  { name: 'Windy', icon: '💨', gradient: ['#67e8f9', '#a5b4fc'] },
];

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

function generateWeather(date: Date) {
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
  const seed = date.getFullYear() * 1000 + dayOfYear;
  const rng = seededRandom(seed);

  // Temperature based on season (northern hemisphere)
  const seasonalBase = Math.sin((dayOfYear - 80) * (2 * Math.PI / 365));
  const baseTemp = 60 + seasonalBase * 25; // 35°F to 85°F range
  const tempVariation = (rng() - 0.5) * 15;
  const temp = Math.round(baseTemp + tempVariation);

  // Condition weighted by season
  const conditionRoll = rng();
  const month = date.getMonth();
  let conditionIndex: number;
  if (month >= 11 || month <= 1) {
    // Winter: more snow/cloudy
    conditionIndex = conditionRoll < 0.15 ? 0 : conditionRoll < 0.3 ? 1 : conditionRoll < 0.5 ? 2 :
      conditionRoll < 0.65 ? 3 : conditionRoll < 0.7 ? 4 : conditionRoll < 0.9 ? 5 : conditionRoll < 0.95 ? 6 : 7;
  } else if (month >= 5 && month <= 8) {
    // Summer: more sun/storms
    conditionIndex = conditionRoll < 0.4 ? 0 : conditionRoll < 0.6 ? 1 : conditionRoll < 0.7 ? 2 :
      conditionRoll < 0.8 ? 3 : conditionRoll < 0.9 ? 4 : conditionRoll < 0.92 ? 5 : conditionRoll < 0.96 ? 6 : 7;
  } else {
    // Spring/Fall: mixed
    conditionIndex = conditionRoll < 0.25 ? 0 : conditionRoll < 0.45 ? 1 : conditionRoll < 0.6 ? 2 :
      conditionRoll < 0.75 ? 3 : conditionRoll < 0.82 ? 4 : conditionRoll < 0.87 ? 5 : conditionRoll < 0.94 ? 6 : 7;
  }

  const condition = CONDITIONS[conditionIndex];
  const humidity = Math.round(30 + rng() * 50 + (conditionIndex >= 3 && conditionIndex <= 4 ? 20 : 0));
  const windSpeed = Math.round(5 + rng() * 20 + (conditionIndex === 7 ? 15 : 0));

  return { temp, condition, humidity, windSpeed };
}

async function handleWeatherGet(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  const now = new Date();

  // Today's weather
  const today = generateWeather(now);

  // 5-day forecast
  const forecast = Array.from({ length: 5 }, (_, i) => {
    const date = new Date(now);
    date.setDate(date.getDate() + i + 1);
    const weather = generateWeather(date);
    return {
      date: date.toISOString().split('T')[0],
      dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
      temp: weather.temp,
      tempHigh: weather.temp + Math.round(Math.random() * 5),
      tempLow: weather.temp - Math.round(Math.random() * 8),
      condition: weather.condition.name,
      icon: weather.condition.icon,
    };
  });

  ctx.send(ws, createResponse(message.id, true, {
    current: {
      temp: today.temp,
      condition: today.condition.name,
      icon: today.condition.icon,
      gradient: today.condition.gradient,
      humidity: today.humidity,
      windSpeed: today.windSpeed,
      feelsLike: today.temp + (today.humidity > 60 ? 3 : today.windSpeed > 15 ? -5 : 0),
    },
    forecast,
    location: 'Cobville',
  }));
}

export const weatherHandlers: HandlerMap = {
  'weather:get': handleWeatherGet,
};
