// Player-NPC relationship tracking and progression system

import { getDB, generateId, now } from '../db/index.js';
import { eventBus, EventTypes } from '../events/index.js';

export type RelationshipStage =
  | 'stranger'
  | 'acquaintance'
  | 'friend'
  | 'close_friend'
  | 'best_friend'
  | 'romantic_interest'
  | 'partner';

export interface PlayerNPCRelationship {
  id: string;
  player_id: string;
  npc_id: string;

  // Core stats (0-100)
  trust_level: number;
  affinity: number;
  familiarity: number;

  // Interaction tracking
  total_messages_sent: number;
  total_messages_received: number;
  total_images_shared: number;
  total_posts_liked: number;
  total_posts_commented: number;

  // Relationship stage
  relationship_stage: RelationshipStage;

  // Timestamps
  first_interaction: number;
  last_interaction: number | null;
  last_message_sent: number | null;
  last_message_received: number | null;

  // Metadata
  notes?: string;
  relationship_tags?: string[];

  created_at: number;
  updated_at: number;
}

// Relationship stage progression thresholds
const STAGE_THRESHOLDS = {
  stranger: { trust: 0, affinity: 0, familiarity: 0, messages: 0 },
  acquaintance: { trust: 10, affinity: 10, familiarity: 10, messages: 5 },
  friend: { trust: 30, affinity: 30, familiarity: 30, messages: 20 },
  close_friend: { trust: 50, affinity: 50, familiarity: 50, messages: 50 },
  best_friend: { trust: 70, affinity: 60, familiarity: 70, messages: 100 },
  romantic_interest: { trust: 40, affinity: 70, familiarity: 50, messages: 30 },
  partner: { trust: 80, affinity: 90, familiarity: 80, messages: 150 },
};

// Get or create relationship
export function getOrCreateRelationship(playerId: string, npcId: string): PlayerNPCRelationship {
  const db = getDB('game');

  let rel = db.prepare(`
    SELECT * FROM player_npc_relationships WHERE player_id = ? AND npc_id = ?
  `).get(playerId, npcId) as any;

  if (!rel) {
    const id = generateId();
    db.prepare(`
      INSERT INTO player_npc_relationships (id, player_id, npc_id)
      VALUES (?, ?, ?)
    `).run(id, playerId, npcId);

    rel = db.prepare(`
      SELECT * FROM player_npc_relationships WHERE id = ?
    `).get(id) as any;

    // Emit first interaction event for new relationships
    eventBus.fire(EventTypes.RELATIONSHIP_FIRST_INTERACTION, {
      relationship_id: id,
    }, {
      source: 'relationships',
      player_id: playerId,
      npc_id: npcId,
      importance: 0.9,
    });
  }

  return parseRelationship(rel);
}

// Update relationship stats after an interaction
export function updateRelationshipStats(
  playerId: string,
  npcId: string,
  updates: {
    trust_delta?: number; // Change in trust (-10 to +10)
    affinity_delta?: number; // Change in affinity (-10 to +10)
    familiarity_delta?: number; // Change in familiarity (usually +1 to +5)
    message_sent?: boolean;
    message_received?: boolean;
    image_shared?: boolean;
    post_liked?: boolean;
    post_commented?: boolean;
  }
): PlayerNPCRelationship {
  const db = getDB('game');
  const rel = getOrCreateRelationship(playerId, npcId);

  // Update core stats
  let trust = rel.trust_level;
  let affinity = rel.affinity;
  let familiarity = rel.familiarity;

  if (updates.trust_delta !== undefined) {
    trust = Math.max(0, Math.min(100, trust + updates.trust_delta));
  }

  if (updates.affinity_delta !== undefined) {
    affinity = Math.max(0, Math.min(100, affinity + updates.affinity_delta));
  }

  if (updates.familiarity_delta !== undefined) {
    familiarity = Math.max(0, Math.min(100, familiarity + updates.familiarity_delta));
  }

  // Update interaction counts
  const messageSent = updates.message_sent ? 1 : 0;
  const messageReceived = updates.message_received ? 1 : 0;
  const imageShared = updates.image_shared ? 1 : 0;
  const postLiked = updates.post_liked ? 1 : 0;
  const postCommented = updates.post_commented ? 1 : 0;

  const timestamp = now();

  db.prepare(`
    UPDATE player_npc_relationships
    SET
      trust_level = ?,
      affinity = ?,
      familiarity = ?,
      total_messages_sent = total_messages_sent + ?,
      total_messages_received = total_messages_received + ?,
      total_images_shared = total_images_shared + ?,
      total_posts_liked = total_posts_liked + ?,
      total_posts_commented = total_posts_commented + ?,
      last_interaction = ?,
      last_message_sent = CASE WHEN ? = 1 THEN ? ELSE last_message_sent END,
      last_message_received = CASE WHEN ? = 1 THEN ? ELSE last_message_received END,
      updated_at = ?
    WHERE player_id = ? AND npc_id = ?
  `).run(
    trust,
    affinity,
    familiarity,
    messageSent,
    messageReceived,
    imageShared,
    postLiked,
    postCommented,
    timestamp,
    messageSent,
    timestamp,
    messageReceived,
    timestamp,
    timestamp,
    playerId,
    npcId
  );

  // Recalculate relationship stage
  const updated = getOrCreateRelationship(playerId, npcId);
  const newStage = calculateRelationshipStage(updated);
  const previousStage = updated.relationship_stage;

  if (newStage !== previousStage) {
    db.prepare(`
      UPDATE player_npc_relationships SET relationship_stage = ?, updated_at = ? WHERE id = ?
    `).run(newStage, now(), updated.id);

    // Emit stage changed event (high importance!)
    eventBus.fire(EventTypes.RELATIONSHIP_STAGE_CHANGED, {
      previous_stage: previousStage,
      new_stage: newStage,
      trust: trust,
      affinity: affinity,
      familiarity: familiarity,
    }, {
      source: 'relationships',
      player_id: playerId,
      npc_id: npcId,
      importance: 1.0, // Maximum importance
    });
  }

  // Emit stats updated event
  eventBus.fire(EventTypes.RELATIONSHIP_STATS_UPDATED, {
    trust_delta: updates.trust_delta,
    affinity_delta: updates.affinity_delta,
    familiarity_delta: updates.familiarity_delta,
    new_trust: trust,
    new_affinity: affinity,
    new_familiarity: familiarity,
    trigger: updates.message_sent ? 'message_sent' :
             updates.message_received ? 'message_received' :
             updates.image_shared ? 'image_shared' :
             updates.post_liked ? 'post_liked' :
             updates.post_commented ? 'post_commented' : 'unknown',
  }, {
    source: 'relationships',
    player_id: playerId,
    npc_id: npcId,
    importance: 0.4, // Medium-low (high volume)
  });

  return getOrCreateRelationship(playerId, npcId);
}

// Calculate appropriate relationship stage based on stats
function calculateRelationshipStage(rel: PlayerNPCRelationship): RelationshipStage {
  const totalMessages = rel.total_messages_sent + rel.total_messages_received;

  // Check for romantic progression (high affinity, medium+ trust)
  if (
    rel.affinity >= STAGE_THRESHOLDS.partner.affinity &&
    rel.trust_level >= STAGE_THRESHOLDS.partner.trust &&
    rel.familiarity >= STAGE_THRESHOLDS.partner.familiarity &&
    totalMessages >= STAGE_THRESHOLDS.partner.messages
  ) {
    return 'partner';
  }

  if (
    rel.affinity >= STAGE_THRESHOLDS.romantic_interest.affinity &&
    rel.trust_level >= STAGE_THRESHOLDS.romantic_interest.trust &&
    rel.familiarity >= STAGE_THRESHOLDS.romantic_interest.familiarity &&
    totalMessages >= STAGE_THRESHOLDS.romantic_interest.messages
  ) {
    return 'romantic_interest';
  }

  // Check for friendship progression
  if (
    rel.trust_level >= STAGE_THRESHOLDS.best_friend.trust &&
    rel.familiarity >= STAGE_THRESHOLDS.best_friend.familiarity &&
    totalMessages >= STAGE_THRESHOLDS.best_friend.messages
  ) {
    return 'best_friend';
  }

  if (
    rel.trust_level >= STAGE_THRESHOLDS.close_friend.trust &&
    rel.familiarity >= STAGE_THRESHOLDS.close_friend.familiarity &&
    totalMessages >= STAGE_THRESHOLDS.close_friend.messages
  ) {
    return 'close_friend';
  }

  if (
    rel.trust_level >= STAGE_THRESHOLDS.friend.trust &&
    rel.familiarity >= STAGE_THRESHOLDS.friend.familiarity &&
    totalMessages >= STAGE_THRESHOLDS.friend.messages
  ) {
    return 'friend';
  }

  if (
    rel.familiarity >= STAGE_THRESHOLDS.acquaintance.familiarity ||
    totalMessages >= STAGE_THRESHOLDS.acquaintance.messages
  ) {
    return 'acquaintance';
  }

  return 'stranger';
}

// Get all relationships for a player
export function getPlayerRelationships(
  playerId: string,
  options?: {
    stage?: RelationshipStage;
    minTrust?: number;
    minAffinity?: number;
  }
): PlayerNPCRelationship[] {
  const db = getDB('game');
  let query = 'SELECT * FROM player_npc_relationships WHERE player_id = ?';
  const params: any[] = [playerId];

  if (options?.stage) {
    query += ' AND relationship_stage = ?';
    params.push(options.stage);
  }

  if (options?.minTrust !== undefined) {
    query += ' AND trust_level >= ?';
    params.push(options.minTrust);
  }

  if (options?.minAffinity !== undefined) {
    query += ' AND affinity >= ?';
    params.push(options.minAffinity);
  }

  query += ' ORDER BY affinity DESC, familiarity DESC';

  return db.prepare(query).all(...params).map((r: any) => parseRelationship(r));
}

// Get relationship progress to next stage
export function getRelationshipProgress(rel: PlayerNPCRelationship): {
  current_stage: RelationshipStage;
  next_stage: RelationshipStage | null;
  progress_percentage: number;
  missing_requirements: string[];
} {
  const stages: RelationshipStage[] = [
    'stranger',
    'acquaintance',
    'friend',
    'close_friend',
    'best_friend',
  ];

  const romanticStages: RelationshipStage[] = [
    'stranger',
    'acquaintance',
    'romantic_interest',
    'partner',
  ];

  // Determine path (friendship vs romantic)
  const isRomanticPath = rel.affinity > rel.trust_level + 20;

  const currentStages = isRomanticPath ? romanticStages : stages;
  const currentIndex = currentStages.indexOf(rel.relationship_stage);

  if (currentIndex === -1 || currentIndex === currentStages.length - 1) {
    return {
      current_stage: rel.relationship_stage,
      next_stage: null,
      progress_percentage: 100,
      missing_requirements: [],
    };
  }

  const nextStage = currentStages[currentIndex + 1];
  const requirements = STAGE_THRESHOLDS[nextStage];
  const totalMessages = rel.total_messages_sent + rel.total_messages_received;

  const missing: string[] = [];
  let totalProgress = 0;
  let metRequirements = 0;

  // Check each requirement
  const trustProgress = Math.min(100, (rel.trust_level / requirements.trust) * 100);
  if (rel.trust_level < requirements.trust) {
    missing.push(`Trust: ${rel.trust_level}/${requirements.trust}`);
  } else {
    metRequirements++;
  }
  totalProgress += trustProgress;

  const affinityProgress = Math.min(100, (rel.affinity / requirements.affinity) * 100);
  if (rel.affinity < requirements.affinity) {
    missing.push(`Affinity: ${rel.affinity}/${requirements.affinity}`);
  } else {
    metRequirements++;
  }
  totalProgress += affinityProgress;

  const familiarityProgress = Math.min(100, (rel.familiarity / requirements.familiarity) * 100);
  if (rel.familiarity < requirements.familiarity) {
    missing.push(`Familiarity: ${rel.familiarity}/${requirements.familiarity}`);
  } else {
    metRequirements++;
  }
  totalProgress += familiarityProgress;

  const messageProgress = Math.min(100, (totalMessages / requirements.messages) * 100);
  if (totalMessages < requirements.messages) {
    missing.push(`Messages: ${totalMessages}/${requirements.messages}`);
  } else {
    metRequirements++;
  }
  totalProgress += messageProgress;

  return {
    current_stage: rel.relationship_stage,
    next_stage: nextStage,
    progress_percentage: Math.floor(totalProgress / 4),
    missing_requirements: missing,
  };
}

// Automatic stat updates based on interaction type
export function updateStatsForMessage(
  playerId: string,
  npcId: string,
  messageContent: string,
  isFromPlayer: boolean
): void {
  // Base familiarity gain from messaging
  const familiarityGain = 1;

  // Trust gain based on message depth/length (longer = more personal)
  const trustGain = messageContent.length > 100 ? 2 : 1;

  // Affinity can vary based on message sentiment (would need sentiment analysis)
  // For now, small positive gain for any interaction
  const affinityGain = 1;

  updateRelationshipStats(playerId, npcId, {
    trust_delta: trustGain,
    affinity_delta: affinityGain,
    familiarity_delta: familiarityGain,
    message_sent: isFromPlayer,
    message_received: !isFromPlayer,
  });
}

export function updateStatsForImageShare(playerId: string, npcId: string): void {
  // Sharing images shows trust and intimacy
  updateRelationshipStats(playerId, npcId, {
    trust_delta: 3,
    affinity_delta: 2,
    familiarity_delta: 2,
    image_shared: true,
  });
}

export function updateStatsForPostInteraction(
  playerId: string,
  npcId: string,
  type: 'like' | 'comment'
): void {
  if (type === 'like') {
    updateRelationshipStats(playerId, npcId, {
      affinity_delta: 1,
      familiarity_delta: 0.5,
      post_liked: true,
    });
  } else {
    // Comments show more engagement
    updateRelationshipStats(playerId, npcId, {
      trust_delta: 1,
      affinity_delta: 2,
      familiarity_delta: 1,
      post_commented: true,
    });
  }
}

// Get relationship summary for UI
export function getRelationshipSummary(playerId: string, npcId: string): {
  relationship: PlayerNPCRelationship;
  progress: ReturnType<typeof getRelationshipProgress>;
  insights: string[];
} {
  const relationship = getOrCreateRelationship(playerId, npcId);
  const progress = getRelationshipProgress(relationship);

  const insights: string[] = [];

  // Generate insights
  if (relationship.trust_level < 20) {
    insights.push("They're still getting to know you");
  } else if (relationship.trust_level > 70) {
    insights.push("They trust you deeply");
  }

  if (relationship.affinity > 60) {
    insights.push("They really enjoy talking to you");
  }

  const daysSinceLastInteraction = relationship.last_interaction
    ? Math.floor((now() - relationship.last_interaction) / 86400)
    : 0;

  if (daysSinceLastInteraction > 7) {
    insights.push(`Haven't talked in ${daysSinceLastInteraction} days`);
  } else if (daysSinceLastInteraction === 0) {
    insights.push("You talked today");
  }

  const totalMessages = relationship.total_messages_sent + relationship.total_messages_received;
  if (totalMessages > 100) {
    insights.push(`${totalMessages} messages exchanged`);
  }

  return {
    relationship,
    progress,
    insights,
  };
}

// Get top relationships for player
export function getTopRelationships(
  playerId: string,
  limit = 8
): Array<PlayerNPCRelationship & { npc_display_name: string; npc_avatar: string }> {
  const db = getDB('game');
  const npcDb = getDB('npc');

  const relationships = db.prepare(`
    SELECT * FROM player_npc_relationships
    WHERE player_id = ?
    ORDER BY affinity DESC, trust_level DESC, familiarity DESC
    LIMIT ?
  `).all(playerId, limit) as any[];

  return relationships.map((rel: any) => {
    const npc = npcDb.prepare('SELECT display_name, profile_image_url, avatar_url FROM npcs WHERE id = ?').get(rel.npc_id) as any;
    return {
      ...parseRelationship(rel),
      npc_display_name: npc?.display_name || 'Unknown',
      npc_avatar: npc?.profile_image_url || npc?.avatar_url || '',
    };
  });
}

// Helper to parse relationship from database
function parseRelationship(rel: any): PlayerNPCRelationship {
  return {
    id: rel.id,
    player_id: rel.player_id,
    npc_id: rel.npc_id,
    trust_level: rel.trust_level,
    affinity: rel.affinity,
    familiarity: rel.familiarity,
    total_messages_sent: rel.total_messages_sent,
    total_messages_received: rel.total_messages_received,
    total_images_shared: rel.total_images_shared,
    total_posts_liked: rel.total_posts_liked,
    total_posts_commented: rel.total_posts_commented,
    relationship_stage: rel.relationship_stage,
    first_interaction: rel.first_interaction,
    last_interaction: rel.last_interaction,
    last_message_sent: rel.last_message_sent,
    last_message_received: rel.last_message_received,
    notes: rel.notes,
    relationship_tags: rel.relationship_tags ? JSON.parse(rel.relationship_tags) : undefined,
    created_at: rel.created_at,
    updated_at: rel.updated_at,
  };
}

export default {
  getOrCreateRelationship,
  updateRelationshipStats,
  updateStatsForMessage,
  updateStatsForImageShare,
  updateStatsForPostInteraction,
  getRelationshipSummary,
  getTopRelationships,
  getRelationshipProgress,
};
