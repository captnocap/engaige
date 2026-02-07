/**
 * Calendar Handlers
 *
 * Provides game events and NPC-related dates for the CobCal calendar app.
 */

import type { ServerWebSocket } from 'bun';
import { createResponse, type WSMessage } from '../ws-protocol.js';
import type { ClientSession, HandlerContext, HandlerMap } from './types.js';

interface CalendarEvent {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  type: 'birthday' | 'event' | 'holiday' | 'lore';
  description?: string;
  icon?: string;
}

// Built-in game world events
const LORE_EVENTS: CalendarEvent[] = [
  { id: 'evt-1', date: '2026-01-15', title: 'Neon Requiem Broke Up (Anniversary)', type: 'lore', icon: '🎸', description: 'Two years since the band called it quits. Again.' },
  { id: 'evt-2', date: '2026-02-14', title: "Valentine's Day", type: 'holiday', icon: '💝' },
  { id: 'evt-3', date: '2026-03-17', title: 'Quantum Coffee Appreciation Day', type: 'lore', icon: '☕', description: 'Martinez Study anniversary. $47/cup specials all day.' },
  { id: 'evt-4', date: '2026-04-01', title: 'Trust Fall Day', type: 'lore', icon: '🙆', description: 'Annual event. Tim has fallen 2,847 times. Catch rate: 78.5%.' },
  { id: 'evt-5', date: '2026-05-01', title: 'May Day / Underground Anniversary', type: 'lore', icon: '🎵', description: "Mars's venue celebrates another year." },
  { id: 'evt-6', date: '2026-06-21', title: 'Summer Solstice Festival', type: 'event', icon: '☀️' },
  { id: 'evt-7', date: '2026-07-04', title: 'Independence Day', type: 'holiday', icon: '🎆' },
  { id: 'evt-8', date: '2026-08-13', title: 'Hartwell Building Anniversary (1923)', type: 'lore', icon: '🏢', description: 'The 13th floor remains missing.' },
  { id: 'evt-9', date: '2026-09-01', title: 'Velvet Algorithms Meditation Retreat', type: 'lore', icon: '🧘', description: 'Annual hiatus begins.' },
  { id: 'evt-10', date: '2026-10-31', title: 'Halloween', type: 'holiday', icon: '🎃' },
  { id: 'evt-11', date: '2026-11-27', title: 'Thanksgiving', type: 'holiday', icon: '🦃' },
  { id: 'evt-12', date: '2026-12-25', title: 'Christmas', type: 'holiday', icon: '🎄' },
  { id: 'evt-13', date: '2026-12-31', title: "New Year's Eve", type: 'holiday', icon: '🎊' },
];

async function handleCalendarGetEvents(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  const payload = (message.payload || {}) as { month?: number; year?: number };

  // Get NPC data for birthdays (use creation dates as pseudo-birthdays)
  let npcEvents: CalendarEvent[] = [];
  try {
    const { getDB } = await import('../../db/index.js');
    const db = getDB('npc');
    const npcs = db.query('SELECT id, name, created_at FROM npcs').all() as Array<{
      id: string; name: string; created_at: string;
    }>;

    npcEvents = npcs.map((npc, i) => {
      // Generate a pseudo-birthday from the NPC's name hash
      const hash = Array.from(npc.name).reduce((h, c) => ((h << 5) - h + c.charCodeAt(0)) | 0, 0);
      const month = (Math.abs(hash) % 12) + 1;
      const day = (Math.abs(hash >> 4) % 28) + 1;
      const year = payload.year ?? new Date().getFullYear();
      return {
        id: `bday-${npc.id}`,
        date: `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`,
        title: `${npc.name}'s Birthday`,
        type: 'birthday' as const,
        icon: '🎂',
      };
    });
  } catch {
    // NPC db may not exist yet
  }

  const allEvents = [...LORE_EVENTS, ...npcEvents];

  // Filter by month/year if provided
  let filtered = allEvents;
  if (payload.month && payload.year) {
    const prefix = `${payload.year}-${payload.month.toString().padStart(2, '0')}`;
    filtered = allEvents.filter(e => e.date.startsWith(prefix));
  }

  ctx.send(ws, createResponse(message.id, true, { events: filtered }));
}

export const calendarHandlers: HandlerMap = {
  'calendar:getEvents': handleCalendarGetEvents,
};
