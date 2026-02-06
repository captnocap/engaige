/**
 * Platform Access Level Registry
 *
 * Maps messaging platforms to the minimum relationship stage required
 * for the player to use them with an NPC.
 */

import type { RelationshipStage } from './relationships.js';

// Platform → minimum relationship stage required
export const PLATFORM_ACCESS_LEVELS: Record<string, RelationshipStage> = {
  // DMs (private messaging) — requires close_friend
  'messages': 'close_friend',

  // MyFace chat — requires friend
  'myface-chat': 'friend',

  // Chirp DM / InstaSnap DM — requires acquaintance
  'chirp-dm': 'acquaintance',
  'instasnap-dm': 'acquaintance',

  // Dating apps and group chat — open to all (stranger)
  'lovelink-chat': 'stranger',
  'spark-chat': 'stranger',
  'groupchat': 'stranger',

  // Generic chat fallback — open
  'chat': 'stranger',
};

// Ordered from lowest to highest access
const STAGE_ORDER: RelationshipStage[] = [
  'stranger',
  'acquaintance',
  'friend',
  'romantic_interest',
  'close_friend',
  'best_friend',
  'partner',
];

/**
 * Check whether a given relationship stage meets the minimum
 * required by a platform.
 */
export function canAccessPlatform(platform: string, currentStage: RelationshipStage): boolean {
  const requiredStage = PLATFORM_ACCESS_LEVELS[platform];

  // Unknown platforms default to open access
  if (!requiredStage) return true;

  const currentIndex = STAGE_ORDER.indexOf(currentStage);
  const requiredIndex = STAGE_ORDER.indexOf(requiredStage);

  return currentIndex >= requiredIndex;
}

/**
 * Get the minimum relationship stage needed for a platform.
 * Returns null if the platform is unknown (open access).
 */
export function getRequiredStage(platform: string): RelationshipStage | null {
  return PLATFORM_ACCESS_LEVELS[platform] ?? null;
}
