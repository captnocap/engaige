/**
 * Message Access Validator
 *
 * Central validation for whether a player can message an NPC
 * on a given platform, based on their relationship stage.
 */

import { getOrCreateRelationship, type RelationshipStage } from './relationships.js';
import { canAccessPlatform, getRequiredStage } from './platform-access.js';
import { eventBus, EventTypes } from '../events/index.js';

export interface AccessValidationResult {
  allowed: boolean;
  reason?: string;
  required_stage?: RelationshipStage;
  current_stage?: RelationshipStage;
}

/**
 * Validate whether a player can send messages to an NPC on a platform.
 * On denial, emits a RELATIONSHIP_ACCESS_DENIED event for auditing.
 */
export function validateMessageAccess(
  playerId: string,
  npcId: string,
  platform: string
): AccessValidationResult {
  const requiredStage = getRequiredStage(platform);

  // Unknown platform or no restriction → allowed
  if (!requiredStage) {
    return { allowed: true };
  }

  const relationship = getOrCreateRelationship(playerId, npcId);
  const currentStage = relationship.relationship_stage;

  if (canAccessPlatform(platform, currentStage)) {
    return { allowed: true };
  }

  // Denied — emit event for auditing
  eventBus.fire(EventTypes.RELATIONSHIP_ACCESS_DENIED, {
    platform,
    required_stage: requiredStage,
    current_stage: currentStage,
  }, {
    source: 'message-access-validator',
    player_id: playerId,
    npc_id: npcId,
    importance: 0.3,
  });

  return {
    allowed: false,
    reason: `Requires '${requiredStage}' relationship to use ${platform}. Current: '${currentStage}'.`,
    required_stage: requiredStage,
    current_stage: currentStage,
  };
}
