/**
 * NPC Relationship Service
 *
 * Server-side management of NPC-NPC relationships (not player-NPC).
 * Handles:
 * - Public relationships (dating, engaged, married)
 * - Secret relationships and affairs
 * - Trust, happiness, and drama levels
 * - Who knows about what secrets
 *
 * This creates emergent drama: NPCs can cheat, get caught, post vague drama
 * on social media, etc.
 */

import { getDB, generateId, now } from '../db/index.js';
import { eventBus, EventTypes } from '../events/index.js';

// ============================================================================
// Types
// ============================================================================

export type RelationshipType =
  | 'single'
  | 'talking'
  | 'dating'
  | 'exclusive'
  | 'engaged'
  | 'married'
  | 'its_complicated'
  | 'divorced'
  | 'broken_up';

export type RelationshipEventType =
  | 'relationship_started'
  | 'relationship_ended'
  | 'status_changed'
  | 'affair_started'
  | 'affair_discovered'
  | 'caught_cheating'
  | 'fight'
  | 'reconciliation'
  | 'secret_shared'
  | 'trust_broken'
  | 'jealousy_incident'
  | 'public_display';

export interface RelationshipEvent {
  id: string;
  type: RelationshipEventType;
  timestamp: number;
  description: string;
  witnessedBy: string[];
  happinessImpact?: number;
  trustImpact?: number;
  dramaImpact?: number;
}

export interface NPCRelationship {
  id: string;
  npc1Id: string;
  npc2Id: string;
  type: RelationshipType;
  startedAt: number;
  endedAt?: number;
  endReason?: 'mutual' | 'dumped' | 'caught' | 'ghosted' | 'other';
  isSecret: boolean;
  isAffair: boolean;
  secretKnownBy: string[];
  happiness: number;
  trust: number;
  drama: number;
  lastInteractionAt: number;
  significantEvents: RelationshipEvent[];
}

// ============================================================================
// Schema
// ============================================================================

export function initializeNPCRelationshipSchema(): void {
  const db = getDB('game');

  db.exec(`
    -- NPC-NPC relationships
    CREATE TABLE IF NOT EXISTS npc_relationships (
      id TEXT PRIMARY KEY,
      npc1_id TEXT NOT NULL,
      npc2_id TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'talking',
      started_at INTEGER DEFAULT (unixepoch()),
      ended_at INTEGER,
      end_reason TEXT,
      is_secret INTEGER DEFAULT 0,
      is_affair INTEGER DEFAULT 0,
      secret_known_by TEXT DEFAULT '[]',
      happiness INTEGER DEFAULT 80,
      trust INTEGER DEFAULT 70,
      drama INTEGER DEFAULT 20,
      last_interaction_at INTEGER DEFAULT (unixepoch()),
      UNIQUE(npc1_id, npc2_id)
    );

    -- Relationship events
    CREATE TABLE IF NOT EXISTS npc_relationship_events (
      id TEXT PRIMARY KEY,
      relationship_id TEXT NOT NULL,
      type TEXT NOT NULL,
      timestamp INTEGER DEFAULT (unixepoch()),
      description TEXT,
      witnessed_by TEXT DEFAULT '[]',
      happiness_impact INTEGER DEFAULT 0,
      trust_impact INTEGER DEFAULT 0,
      drama_impact INTEGER DEFAULT 0,
      FOREIGN KEY (relationship_id) REFERENCES npc_relationships(id)
    );

    CREATE INDEX IF NOT EXISTS idx_npc_rel_npc1 ON npc_relationships(npc1_id);
    CREATE INDEX IF NOT EXISTS idx_npc_rel_npc2 ON npc_relationships(npc2_id);
    CREATE INDEX IF NOT EXISTS idx_npc_rel_events ON npc_relationship_events(relationship_id);
  `);

  console.log('[NPCRelationships] Schema initialized');
}

// ============================================================================
// Helper Functions
// ============================================================================

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function rowToRelationship(row: any): NPCRelationship {
  const db = getDB('game');
  const events = db.query(
    'SELECT * FROM npc_relationship_events WHERE relationship_id = ? ORDER BY timestamp ASC'
  ).all(row.id) as any[];

  return {
    id: row.id,
    npc1Id: row.npc1_id,
    npc2Id: row.npc2_id,
    type: row.type,
    startedAt: row.started_at,
    endedAt: row.ended_at || undefined,
    endReason: row.end_reason || undefined,
    isSecret: row.is_secret === 1,
    isAffair: row.is_affair === 1,
    secretKnownBy: JSON.parse(row.secret_known_by || '[]'),
    happiness: row.happiness,
    trust: row.trust,
    drama: row.drama,
    lastInteractionAt: row.last_interaction_at,
    significantEvents: events.map(e => ({
      id: e.id,
      type: e.type,
      timestamp: e.timestamp,
      description: e.description,
      witnessedBy: JSON.parse(e.witnessed_by || '[]'),
      happinessImpact: e.happiness_impact || undefined,
      trustImpact: e.trust_impact || undefined,
      dramaImpact: e.drama_impact || undefined,
    })),
  };
}

// ============================================================================
// Queries
// ============================================================================

export function getRelationship(id: string): NPCRelationship | null {
  const db = getDB('game');
  const row = db.query('SELECT * FROM npc_relationships WHERE id = ?').get(id) as any;
  return row ? rowToRelationship(row) : null;
}

export function getRelationshipBetween(npc1Id: string, npc2Id: string): NPCRelationship | null {
  const db = getDB('game');
  const row = db.query(
    `SELECT * FROM npc_relationships
     WHERE (npc1_id = ? AND npc2_id = ?) OR (npc1_id = ? AND npc2_id = ?)`
  ).get(npc1Id, npc2Id, npc2Id, npc1Id) as any;
  return row ? rowToRelationship(row) : null;
}

export function getRelationshipsFor(npcId: string): NPCRelationship[] {
  const db = getDB('game');
  const rows = db.query(
    'SELECT * FROM npc_relationships WHERE npc1_id = ? OR npc2_id = ?'
  ).all(npcId, npcId) as any[];
  return rows.map(rowToRelationship);
}

export function getPublicRelationshipsFor(npcId: string): NPCRelationship[] {
  const db = getDB('game');
  const rows = db.query(
    `SELECT * FROM npc_relationships
     WHERE (npc1_id = ? OR npc2_id = ?) AND is_secret = 0 AND ended_at IS NULL`
  ).all(npcId, npcId) as any[];
  return rows.map(rowToRelationship);
}

export function getSecretRelationshipsFor(npcId: string): NPCRelationship[] {
  const db = getDB('game');
  const rows = db.query(
    `SELECT * FROM npc_relationships
     WHERE (npc1_id = ? OR npc2_id = ?) AND is_secret = 1 AND ended_at IS NULL`
  ).all(npcId, npcId) as any[];
  return rows.map(rowToRelationship);
}

export function getActiveRelationships(): NPCRelationship[] {
  const db = getDB('game');
  const rows = db.query('SELECT * FROM npc_relationships WHERE ended_at IS NULL').all() as any[];
  return rows.map(rowToRelationship);
}

export function getAffairs(): NPCRelationship[] {
  const db = getDB('game');
  const rows = db.query(
    'SELECT * FROM npc_relationships WHERE is_affair = 1 AND ended_at IS NULL'
  ).all() as any[];
  return rows.map(rowToRelationship);
}

export function isInRelationship(npcId: string): boolean {
  const rels = getPublicRelationshipsFor(npcId);
  return rels.some(r =>
    r.type !== 'single' &&
    r.type !== 'broken_up' &&
    r.type !== 'divorced'
  );
}

export function getPublicStatus(npcId: string): RelationshipType {
  const publicRels = getPublicRelationshipsFor(npcId);
  const statusOrder: RelationshipType[] = [
    'married', 'engaged', 'exclusive', 'dating', 'talking', 'its_complicated',
    'divorced', 'broken_up', 'single'
  ];

  for (const status of statusOrder) {
    if (publicRels.some(r => r.type === status)) {
      return status;
    }
  }
  return 'single';
}

export function getPartner(npcId: string): string | undefined {
  const publicRels = getPublicRelationshipsFor(npcId);
  const seriousRel = publicRels.find(r =>
    ['married', 'engaged', 'exclusive', 'dating'].includes(r.type)
  );
  if (!seriousRel) return undefined;
  return seriousRel.npc1Id === npcId ? seriousRel.npc2Id : seriousRel.npc1Id;
}

export function isCheating(npcId: string): boolean {
  const affairs = getAffairs();
  return affairs.some(r => r.npc1Id === npcId || r.npc2Id === npcId);
}

export function getAffairPartners(npcId: string): string[] {
  const affairs = getAffairs().filter(r =>
    r.npc1Id === npcId || r.npc2Id === npcId
  );
  return affairs.map(r => r.npc1Id === npcId ? r.npc2Id : r.npc1Id);
}

export function knowsAboutSecret(observerId: string, relationshipId: string): boolean {
  const rel = getRelationship(relationshipId);
  if (!rel) return false;
  if (!rel.isSecret) return true;
  return rel.secretKnownBy.includes(observerId);
}

// ============================================================================
// Actions
// ============================================================================

export async function startRelationship(
  npc1Id: string,
  npc2Id: string,
  type: RelationshipType = 'talking',
  options: { isSecret?: boolean } = {}
): Promise<NPCRelationship> {
  const db = getDB('game');
  const id = generateId();
  const timestamp = now();
  const { isSecret = false } = options;

  db.run(
    `INSERT INTO npc_relationships (id, npc1_id, npc2_id, type, started_at, is_secret, secret_known_by, last_interaction_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, npc1Id, npc2Id, type, timestamp, isSecret ? 1 : 0, JSON.stringify(isSecret ? [npc1Id, npc2Id] : []), timestamp]
  );

  // Add start event
  const eventId = generateId();
  db.run(
    `INSERT INTO npc_relationship_events (id, relationship_id, type, timestamp, description, witnessed_by)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [eventId, id, 'relationship_started', timestamp, `${npc1Id} and ${npc2Id} started ${type}`, JSON.stringify(isSecret ? [npc1Id, npc2Id] : [])]
  );

  const relationship = getRelationship(id)!;

  // Emit event
  await eventBus.emit(
    EventTypes.NPC_RELATIONSHIP_STARTED,
    {
      relationship_id: id,
      npc1_id: npc1Id,
      npc2_id: npc2Id,
      type,
      is_secret: isSecret,
    },
    { source: 'npc-relationships' }
  );

  return relationship;
}

export async function endRelationship(
  relationshipId: string,
  reason: 'mutual' | 'dumped' | 'caught' | 'ghosted' | 'other'
): Promise<void> {
  const rel = getRelationship(relationshipId);
  if (!rel) return;

  const db = getDB('game');
  const timestamp = now();
  const newType = rel.type === 'married' ? 'divorced' : 'broken_up';

  db.run(
    `UPDATE npc_relationships SET ended_at = ?, end_reason = ?, type = ? WHERE id = ?`,
    [timestamp, reason, newType, relationshipId]
  );

  // Add end event
  const eventId = generateId();
  db.run(
    `INSERT INTO npc_relationship_events (id, relationship_id, type, timestamp, description, witnessed_by, drama_impact)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [eventId, relationshipId, 'relationship_ended', timestamp, `Relationship ended (${reason})`, JSON.stringify(rel.isSecret ? rel.secretKnownBy : []), reason === 'caught' ? 50 : 20]
  );

  // Emit event
  await eventBus.emit(
    EventTypes.NPC_RELATIONSHIP_ENDED,
    {
      relationship_id: relationshipId,
      npc1_id: rel.npc1Id,
      npc2_id: rel.npc2Id,
      reason,
    },
    { source: 'npc-relationships' }
  );
}

export function updateRelationshipType(relationshipId: string, newType: RelationshipType): void {
  const db = getDB('game');
  const rel = getRelationship(relationshipId);
  if (!rel) return;

  db.run('UPDATE npc_relationships SET type = ? WHERE id = ?', [newType, relationshipId]);

  // Add status change event
  const eventId = generateId();
  db.run(
    `INSERT INTO npc_relationship_events (id, relationship_id, type, timestamp, description, witnessed_by)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [eventId, relationshipId, 'status_changed', now(), `Status changed to ${newType}`, JSON.stringify(rel.isSecret ? rel.secretKnownBy : [])]
  );
}

export async function startAffair(npc1Id: string, npc2Id: string): Promise<NPCRelationship | null> {
  const npc1InRel = isInRelationship(npc1Id);
  const npc2InRel = isInRelationship(npc2Id);

  if (!npc1InRel && !npc2InRel) {
    return null; // Not an affair if neither is in a relationship
  }

  const db = getDB('game');
  const id = generateId();
  const timestamp = now();

  db.run(
    `INSERT INTO npc_relationships (id, npc1_id, npc2_id, type, started_at, is_secret, is_affair, secret_known_by, happiness, trust, drama, last_interaction_at)
     VALUES (?, ?, ?, ?, ?, 1, 1, ?, 90, 30, 70, ?)`,
    [id, npc1Id, npc2Id, 'talking', timestamp, JSON.stringify([npc1Id, npc2Id]), timestamp]
  );

  // Add affair start event
  const eventId = generateId();
  db.run(
    `INSERT INTO npc_relationship_events (id, relationship_id, type, timestamp, description, witnessed_by, drama_impact)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [eventId, id, 'affair_started', timestamp, `Secret affair started between ${npc1Id} and ${npc2Id}`, JSON.stringify([npc1Id, npc2Id]), 30]
  );

  // Emit event
  await eventBus.emit(
    EventTypes.NPC_AFFAIR_STARTED,
    {
      relationship_id: id,
      npc1_id: npc1Id,
      npc2_id: npc2Id,
    },
    { source: 'npc-relationships' }
  );

  return getRelationship(id);
}

export async function discoverAffair(
  relationshipId: string,
  discoveredBy: string
): Promise<RelationshipEvent | null> {
  const rel = getRelationship(relationshipId);
  if (!rel || !rel.isAffair) return null;
  if (rel.secretKnownBy.includes(discoveredBy)) return null;

  const db = getDB('game');
  const timestamp = now();

  // Update secret knowledge
  const newSecretKnownBy = [...rel.secretKnownBy, discoveredBy];
  const newDrama = clamp(rel.drama + 40, 0, 100);
  db.run(
    'UPDATE npc_relationships SET secret_known_by = ?, drama = ? WHERE id = ?',
    [JSON.stringify(newSecretKnownBy), newDrama, relationshipId]
  );

  // Add discovery event
  const eventId = generateId();
  const event: RelationshipEvent = {
    id: eventId,
    type: 'affair_discovered',
    timestamp,
    description: `${discoveredBy} discovered the affair`,
    witnessedBy: [discoveredBy],
    trustImpact: -30,
    dramaImpact: 40,
  };

  db.run(
    `INSERT INTO npc_relationship_events (id, relationship_id, type, timestamp, description, witnessed_by, trust_impact, drama_impact)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [eventId, relationshipId, 'affair_discovered', timestamp, event.description, JSON.stringify([discoveredBy]), -30, 40]
  );

  // Emit event
  await eventBus.emit(
    EventTypes.NPC_AFFAIR_DISCOVERED,
    {
      relationship_id: relationshipId,
      npc1_id: rel.npc1Id,
      npc2_id: rel.npc2Id,
      discovered_by: discoveredBy,
    },
    { source: 'npc-relationships' }
  );

  return event;
}

export async function exposeAffair(relationshipId: string): Promise<void> {
  const rel = getRelationship(relationshipId);
  if (!rel || !rel.isAffair) return;

  const db = getDB('game');
  const timestamp = now();

  // Make affair public
  db.run(
    'UPDATE npc_relationships SET is_secret = 0, drama = 100, trust = 0 WHERE id = ?',
    [relationshipId]
  );

  // Add expose event
  const eventId = generateId();
  db.run(
    `INSERT INTO npc_relationship_events (id, relationship_id, type, timestamp, description, witnessed_by, trust_impact, drama_impact)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [eventId, relationshipId, 'caught_cheating', timestamp, 'Affair exposed publicly', '[]', -100, 100]
  );

  // Damage primary relationships
  const npc1Partner = getPartner(rel.npc1Id);
  const npc2Partner = getPartner(rel.npc2Id);

  if (npc1Partner) {
    const primaryRel = getRelationshipBetween(rel.npc1Id, npc1Partner);
    if (primaryRel) {
      updateMetrics(primaryRel.id, { trust: -50, happiness: -40, drama: 50 });
    }
  }

  if (npc2Partner) {
    const primaryRel = getRelationshipBetween(rel.npc2Id, npc2Partner);
    if (primaryRel) {
      updateMetrics(primaryRel.id, { trust: -50, happiness: -40, drama: 50 });
    }
  }

  // Emit event
  await eventBus.emit(
    EventTypes.NPC_AFFAIR_EXPOSED,
    {
      relationship_id: relationshipId,
      npc1_id: rel.npc1Id,
      npc2_id: rel.npc2Id,
    },
    { source: 'npc-relationships' }
  );
}

export function updateMetrics(
  relationshipId: string,
  changes: { happiness?: number; trust?: number; drama?: number }
): void {
  const rel = getRelationship(relationshipId);
  if (!rel) return;

  const db = getDB('game');
  const newHappiness = changes.happiness !== undefined
    ? clamp(rel.happiness + changes.happiness, 0, 100)
    : rel.happiness;
  const newTrust = changes.trust !== undefined
    ? clamp(rel.trust + changes.trust, 0, 100)
    : rel.trust;
  const newDrama = changes.drama !== undefined
    ? clamp(rel.drama + changes.drama, 0, 100)
    : rel.drama;

  db.run(
    'UPDATE npc_relationships SET happiness = ?, trust = ?, drama = ?, last_interaction_at = ? WHERE id = ?',
    [newHappiness, newTrust, newDrama, now(), relationshipId]
  );
}

export async function addEvent(
  relationshipId: string,
  event: Omit<RelationshipEvent, 'id' | 'timestamp'>
): Promise<RelationshipEvent> {
  const db = getDB('game');
  const eventId = generateId();
  const timestamp = now();

  db.run(
    `INSERT INTO npc_relationship_events (id, relationship_id, type, timestamp, description, witnessed_by, happiness_impact, trust_impact, drama_impact)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [eventId, relationshipId, event.type, timestamp, event.description, JSON.stringify(event.witnessedBy), event.happinessImpact || 0, event.trustImpact || 0, event.dramaImpact || 0]
  );

  // Update relationship metrics based on impacts
  if (event.happinessImpact || event.trustImpact || event.dramaImpact) {
    updateMetrics(relationshipId, {
      happiness: event.happinessImpact,
      trust: event.trustImpact,
      drama: event.dramaImpact,
    });
  }

  return {
    ...event,
    id: eventId,
    timestamp,
  };
}

export function revealSecretTo(relationshipId: string, observerId: string): void {
  const rel = getRelationship(relationshipId);
  if (!rel || !rel.isSecret) return;
  if (rel.secretKnownBy.includes(observerId)) return;

  const db = getDB('game');
  const newSecretKnownBy = [...rel.secretKnownBy, observerId];
  db.run(
    'UPDATE npc_relationships SET secret_known_by = ? WHERE id = ?',
    [JSON.stringify(newSecretKnownBy), relationshipId]
  );

  // Add secret shared event
  const eventId = generateId();
  db.run(
    `INSERT INTO npc_relationship_events (id, relationship_id, type, timestamp, description, witnessed_by)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [eventId, relationshipId, 'secret_shared', now(), `Secret revealed to ${observerId}`, JSON.stringify([observerId])]
  );
}

export function clearAllRelationships(): void {
  const db = getDB('game');
  db.run('DELETE FROM npc_relationship_events');
  db.run('DELETE FROM npc_relationships');
}

export async function setupPreExistingDrama(): Promise<void> {
  const existing = getActiveRelationships();
  if (existing.length > 0) return;

  // Sarah and Jake are dating
  await startRelationship('sarah', 'jake', 'dating');

  // Emily and Marcus are talking
  await startRelationship('emily', 'marcus', 'talking');

  // Sarah has a secret thing with Marcus (affair)
  await startAffair('sarah', 'marcus');

  console.log('[NPCRelationships] Pre-existing drama set up');
}

// ============================================================================
// Export
// ============================================================================

export const npcRelationshipService = {
  initializeNPCRelationshipSchema,
  getRelationship,
  getRelationshipBetween,
  getRelationshipsFor,
  getPublicRelationshipsFor,
  getSecretRelationshipsFor,
  getActiveRelationships,
  getAffairs,
  isInRelationship,
  getPublicStatus,
  getPartner,
  isCheating,
  getAffairPartners,
  knowsAboutSecret,
  startRelationship,
  endRelationship,
  updateRelationshipType,
  startAffair,
  discoverAffair,
  exposeAffair,
  updateMetrics,
  addEvent,
  revealSecretTo,
  clearAllRelationships,
  setupPreExistingDrama,
};

export default npcRelationshipService;
