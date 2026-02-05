/**
 * Drama Engine
 *
 * Server-side orchestrator for NPC drama behavior. This service ties together:
 * - Relationship events -> NPC posts
 * - Post viewing -> NPC reactions
 * - Affair discovery mechanics
 * - Personality-based content selection
 *
 * The drama engine reads from other services and triggers actions.
 * All significant actions emit events through the event bus.
 */

import { eventBus, EventTypes } from '../events/index.js';
import * as socialService from './social.js';
import * as npcRelationshipService from './npc-relationships.js';
import * as awarenessService from './awareness.js';
import { getNPCById, getAllNPCs, type NPC } from './npc.js';
import {
  type DramaPostType,
  type DramaPersonalityType,
  getRandomTemplate,
  getCommentTemplates,
  fillTemplate,
} from '../config/drama-templates.js';
import type { NPCRelationship, RelationshipEvent } from './npc-relationships.js';

// ============================================================================
// Types
// ============================================================================

export interface NPCPersonality {
  extraversion: number;
  agreeableness: number;
  conscientiousness: number;
  neuroticism: number;
  openness: number;
}

export interface DramaContext {
  // Who the post is about (if applicable)
  targetNpcId?: string;
  targetNpcName?: string;

  // Relationship context
  relationship?: NPCRelationship;
  partnerName?: string;

  // Time-based
  timePeriod?: string;  // "week", "month", "year"
  months?: number;

  // Cheating context
  cheaterUsername?: string;
  years?: number;
}

// ============================================================================
// Personality Parsing & Mapping
// ============================================================================

/**
 * Parse NPC personality from the JSON string stored in database.
 * Returns default values if parsing fails.
 */
function parseNPCPersonality(npc: NPC): NPCPersonality {
  try {
    if (typeof npc.personality === 'string') {
      const parsed = JSON.parse(npc.personality);
      return {
        extraversion: parsed.extraversion ?? 50,
        agreeableness: parsed.agreeableness ?? 50,
        conscientiousness: parsed.conscientiousness ?? 50,
        neuroticism: parsed.neuroticism ?? 50,
        openness: parsed.openness ?? 50,
      };
    }
  } catch {
    // Fallback to defaults
  }
  return {
    extraversion: 50,
    agreeableness: 50,
    conscientiousness: 50,
    neuroticism: 50,
    openness: 50,
  };
}

/**
 * Maps NPC personality traits to drama personality types.
 * Returns an array of types that fit this NPC (used for template selection).
 */
export function getDramaPersonality(personality: NPCPersonality): DramaPersonalityType[] {
  const types: DramaPersonalityType[] = [];

  // Dramatic: High extraversion + high neuroticism
  if (personality.extraversion > 60 && personality.neuroticism > 50) {
    types.push('dramatic');
  }

  // Petty: Low agreeableness + high neuroticism
  if (personality.agreeableness < 50 && personality.neuroticism > 50) {
    types.push('petty');
  }

  // Mature: High agreeableness + low neuroticism
  if (personality.agreeableness > 60 && personality.neuroticism < 40) {
    types.push('mature');
  }

  // Subtle: Low extraversion OR high conscientiousness
  if (personality.extraversion < 50 || personality.conscientiousness > 60) {
    types.push('subtle');
  }

  // Chaotic: High openness + low conscientiousness
  if (personality.openness > 60 && personality.conscientiousness < 50) {
    types.push('chaotic');
  }

  // Default to subtle if no types match
  if (types.length === 0) {
    types.push('subtle');
  }

  return types;
}

// ============================================================================
// Event -> Post Type Mapping
// ============================================================================

/**
 * Maps relationship events to the type of drama post an NPC might make.
 * Returns null if this event doesn't warrant a post.
 */
export function getPostTypeForEvent(
  event: RelationshipEvent,
  npcId: string,
  relationship: NPCRelationship
): DramaPostType | null {
  switch (event.type) {
    case 'relationship_started':
      // Only post if it's a public relationship
      if (!relationship.isSecret) {
        return 'happy_relationship';
      }
      return null;

    case 'relationship_ended':
      // The person who got dumped posts more dramatically
      return 'post_breakup';

    case 'affair_discovered':
      // The person who discovered posts vague/indirect content
      if (event.witnessedBy.includes(npcId)) {
        return Math.random() > 0.5 ? 'vague_post' : 'indirect_callout';
      }
      return null;

    case 'caught_cheating':
      // Check if this NPC is the victim or the cheater
      const partner = npcRelationshipService.getPartner(npcId);
      if (partner && (relationship.npc1Id === partner || relationship.npc2Id === partner)) {
        // NPC's partner was caught - they're the victim
        return 'caught_cheating_victim';
      }
      if (relationship.npc1Id === npcId || relationship.npc2Id === npcId) {
        // NPC was the cheater
        return 'caught_cheating_guilty';
      }
      return null;

    case 'jealousy_incident':
      return 'jealousy';

    case 'fight':
      return 'vague_post';

    default:
      return null;
  }
}

// ============================================================================
// Post Generation
// ============================================================================

/**
 * Generates a drama post for an NPC based on a trigger and context.
 * Returns the created post or null if generation failed.
 */
export function generateDramaPost(
  npcId: string,
  triggerType: DramaPostType,
  context: DramaContext = {}
): socialService.PostWithDetails | null {
  // Get NPC data
  const npc = getNPCById(npcId);
  if (!npc) {
    console.warn(`[DramaEngine] Cannot generate post: NPC ${npcId} not found`);
    return null;
  }

  // Get personality-appropriate template
  const personality = parseNPCPersonality(npc);
  const dramaPersonality = getDramaPersonality(personality);
  const template = getRandomTemplate(triggerType, dramaPersonality);

  if (!template) {
    console.warn(`[DramaEngine] No template found for type ${triggerType}`);
    return null;
  }

  // Fill in template placeholders
  const filledContent = fillTemplate(template.content, {
    partnerName: context.partnerName || 'babe',
    timePeriod: context.timePeriod || 'time',
    months: context.months || 1,
    years: context.years || 1,
    cheaterUsername: context.cheaterUsername || 'someone',
  });

  // Select platform based on template preference
  const platform = template.preferredPlatforms[
    Math.floor(Math.random() * template.preferredPlatforms.length)
  ] as 'myface' | 'chirp' | 'instasnap';

  // Create the post
  const post = socialService.createPost({
    authorId: npcId,
    authorType: 'npc',
    platform,
    content: filledContent,
  });

  if (post) {
    console.log(`[DramaEngine] ${npc.display_name} posted (${triggerType}): "${filledContent.substring(0, 40)}..."`);
  }

  return post;
}

// ============================================================================
// Reaction Generation
// ============================================================================

/**
 * Determines if and how an NPC should react to a post they've seen.
 * This is called when an NPC "checks" social media and sees posts.
 */
export function processPostReaction(
  npcId: string,
  post: { id: string; authorId: string; content: string }
): void {
  // Get NPC data
  const npc = getNPCById(npcId);
  if (!npc) return;

  // Don't react to own posts
  if (post.authorId === npcId) return;

  // Get habits to check reaction likelihood
  const habits = awarenessService.getHabits(npcId);
  const reactsOften = habits?.traits.reactsOften ?? false;

  // Base reaction chance (lower = less spam)
  let reactionChance = reactsOften ? 0.3 : 0.1;

  // Increase chance for dramatic posts
  const isDramaPost = detectDramaPost(post.content);
  if (isDramaPost) {
    reactionChance += 0.2;
  }

  // Check relationship to post author
  const relationshipToAuthor = npcRelationshipService.getRelationshipBetween(npcId, post.authorId);

  // Partners react more often to each other's posts
  if (relationshipToAuthor && ['dating', 'exclusive', 'married', 'engaged'].includes(relationshipToAuthor.type)) {
    reactionChance += 0.3;
  }

  // Check if NPC knows about any secrets involving the author
  const authorAffairs = npcRelationshipService.getSecretRelationshipsFor(post.authorId);
  const knowsSecrets = authorAffairs.some(r => r.secretKnownBy.includes(npcId));
  if (knowsSecrets) {
    reactionChance += 0.2;
  }

  // Roll for reaction
  if (Math.random() > reactionChance) {
    return; // No reaction
  }

  // Decide: like or comment?
  const commentChance = reactsOften ? 0.4 : 0.2;
  const willComment = Math.random() < commentChance;

  if (willComment) {
    // Select appropriate comment
    const comment = selectComment(npc, post, knowsSecrets);
    if (comment) {
      socialService.addComment({
        postId: post.id,
        authorId: npcId,
        authorType: 'npc',
        content: comment,
      });
      console.log(`[DramaEngine] ${npc.display_name} commented on post: "${comment}"`);
    }
  } else {
    // Just like
    socialService.likePost(post.id, npcId, 'npc');
    console.log(`[DramaEngine] ${npc.display_name} liked a post`);
  }
}

/**
 * Detects if a post is likely a "drama" post based on content patterns.
 */
function detectDramaPost(content: string): boolean {
  const dramaPatterns = [
    /some people/i,
    /can't trust/i,
    /true colors/i,
    /if you know/i,
    /🙃|😤|👀|🐍|☕|🍵/,
    /ain't sh\*t/i,
    /two sides/i,
    /trash takes itself out/i,
    /karma/i,
    /snake/i,
    /cheating|cheat/i,
  ];

  return dramaPatterns.some(pattern => pattern.test(content));
}

/**
 * Determines the post type from content (simplified heuristic).
 */
function detectPostType(content: string): DramaPostType {
  const lowerContent = content.toLowerCase();

  if (lowerContent.includes('lucky') || lowerContent.includes('love') || lowerContent.includes('❤️')) {
    return 'happy_relationship';
  }
  if (lowerContent.includes('single') || lowerContent.includes('focusing on myself')) {
    return 'post_breakup';
  }
  if (lowerContent.includes('screenshot') || lowerContent.includes('CANT EVEN')) {
    return 'caught_cheating_victim';
  }

  return 'vague_post';
}

/**
 * Selects an appropriate comment for an NPC to post on a given post.
 */
function selectComment(
  npc: NPC,
  post: { id: string; content: string },
  knowsSecrets: boolean
): string | null {
  const personality = parseNPCPersonality(npc);
  const dramaPersonality = getDramaPersonality(personality);
  const postType = detectPostType(post.content);

  // Get matching comment templates
  let commentTemplates = getCommentTemplates(postType);

  // Filter by what makes sense for this NPC
  if (knowsSecrets && postType === 'happy_relationship') {
    // NPC knows the poster is cheating - use shady/knowing comments
    commentTemplates = commentTemplates.filter(t => t.type === 'shady' || t.type === 'knowing');
  } else if (dramaPersonality.includes('petty')) {
    // Petty NPCs prefer curious/shady comments
    const filtered = commentTemplates.filter(t => t.type === 'curious' || t.type === 'shady');
    if (filtered.length > 0) commentTemplates = filtered;
  } else if (dramaPersonality.includes('mature')) {
    // Mature NPCs prefer supportive/concerned comments
    const filtered = commentTemplates.filter(t => t.type === 'supportive' || t.type === 'concerned');
    if (filtered.length > 0) commentTemplates = filtered;
  }

  if (commentTemplates.length === 0) {
    return null;
  }

  // Pick a random matching template
  const template = commentTemplates[Math.floor(Math.random() * commentTemplates.length)];
  return template.content;
}

// ============================================================================
// Affair Discovery
// ============================================================================

/**
 * Processes affair discovery mechanics during a simulation tick.
 * Affairs can be discovered through:
 * 1. Suspicious posts + comments (NPCs connect the dots)
 * 2. Random slip-ups (high drama relationships)
 * 3. Gossip (someone who knows tells someone else)
 */
export function processAffairDiscovery(): void {
  // Get all active affairs
  const affairs = npcRelationshipService.getAffairs();

  for (const affair of affairs) {
    // Skip if already exposed
    if (!affair.isSecret) continue;

    // Calculate discovery chance based on drama level
    // Higher drama = more careless = more likely to slip up
    const baseDiscoveryChance = 0.01; // 1% per tick base
    const dramaBonus = (affair.drama / 100) * 0.05; // Up to 5% bonus at max drama
    const discoveryChance = baseDiscoveryChance + dramaBonus;

    if (Math.random() < discoveryChance) {
      // Someone might discover the affair!

      // Who could discover it?
      // - The partner(s) of the people having the affair
      const npc1Partner = npcRelationshipService.getPartner(affair.npc1Id);
      const npc2Partner = npcRelationshipService.getPartner(affair.npc2Id);

      const potentialDiscoverers = [npc1Partner, npc2Partner].filter(
        (p): p is string => !!p && !affair.secretKnownBy.includes(p)
      );

      if (potentialDiscoverers.length === 0) continue;

      // Pick one to discover
      const discoverer = potentialDiscoverers[
        Math.floor(Math.random() * potentialDiscoverers.length)
      ];

      // Trigger discovery!
      const event = npcRelationshipService.discoverAffair(affair.id, discoverer);

      if (event) {
        console.log(`[DramaEngine] ${discoverer} discovered the affair between ${affair.npc1Id} and ${affair.npc2Id}!`);

        // The discoverer might post about it
        const postChance = 0.6; // 60% chance they post
        if (Math.random() < postChance) {
          generateDramaPost(discoverer, 'vague_post', {
            targetNpcId: affair.npc1Id,
          });
        }
      }
    }
  }
}

/**
 * Checks if suspicious post activity might reveal an affair.
 * Called when NPCs view posts and connect the dots.
 */
export function checkForSuspiciousActivity(
  viewerNpcId: string,
  posts: Array<{ id: string; authorId: string; content: string; comments?: Array<{ content: string }> }>
): void {
  // Get the viewer's partner (if any)
  const partner = npcRelationshipService.getPartner(viewerNpcId);
  if (!partner) return;

  // Look for suspicious patterns in posts by the partner
  const partnerPosts = posts.filter(p => p.authorId === partner);

  for (const post of partnerPosts) {
    // Check if this is a suspicious "happy" post when there shouldn't be one
    const isSuspicious =
      post.content.includes('butterflies') ||
      post.content.includes('feeling so lucky') ||
      (post.content.includes('❤️') && !post.content.includes(viewerNpcId));

    if (!isSuspicious) continue;

    // Check comments for signs of an affair
    const comments = post.comments || [];
    const suspiciousComments = comments.filter(c => {
      const content = c.content.toLowerCase();
      return content === '👀' ||
             content.includes('if only') ||
             content.includes('interesting timing');
    });

    if (suspiciousComments.length > 0) {
      // This might trigger a jealousy incident
      // Check if partner has any secret relationships
      const partnerSecrets = npcRelationshipService.getSecretRelationshipsFor(partner);
      const affair = partnerSecrets.find(r => r.isAffair);

      if (affair && !affair.secretKnownBy.includes(viewerNpcId)) {
        // Small chance to discover affair from suspicious activity
        if (Math.random() < 0.15) {
          npcRelationshipService.discoverAffair(affair.id, viewerNpcId);
          console.log(`[DramaEngine] ${viewerNpcId} got suspicious and discovered the affair!`);
        } else {
          // Just a jealousy incident for now
          const mainRel = npcRelationshipService.getRelationshipBetween(viewerNpcId, partner);
          if (mainRel) {
            npcRelationshipService.addEvent(mainRel.id, {
              type: 'jealousy_incident',
              description: `${viewerNpcId} got suspicious about ${partner}'s posts`,
              witnessedBy: [viewerNpcId],
              trustImpact: -5,
              dramaImpact: 10,
            });
          }
        }
      }
    }
  }
}

// ============================================================================
// Main Tick Function
// ============================================================================

/**
 * Main drama engine tick. Called periodically by the scheduler.
 * Processes all drama-related logic:
 * 1. Check for spontaneous drama posts (based on relationship states)
 * 2. Process affair discovery chances
 * 3. Handle any pending drama events
 */
export function tick(): void {
  // Process affair discovery mechanics
  processAffairDiscovery();

  // Check for spontaneous posts based on relationship state
  const activeRelationships = npcRelationshipService.getActiveRelationships();

  for (const rel of activeRelationships) {
    // Skip ended relationships
    if (rel.endedAt) continue;

    // High drama relationships might trigger vague posts
    if (rel.drama > 70 && !rel.isSecret) {
      const spontaneousPostChance = 0.02; // 2% per tick at high drama

      if (Math.random() < spontaneousPostChance) {
        // Pick one of the NPCs to post
        const poster = Math.random() > 0.5 ? rel.npc1Id : rel.npc2Id;

        generateDramaPost(poster, 'vague_post', {
          relationship: rel,
        });
      }
    }

    // Happy relationships might post happy content
    if (rel.happiness > 80 && !rel.isSecret && rel.type !== 'talking') {
      const happyPostChance = 0.01; // 1% per tick

      if (Math.random() < happyPostChance) {
        const poster = Math.random() > 0.5 ? rel.npc1Id : rel.npc2Id;
        const partnerName = poster === rel.npc1Id ? rel.npc2Id : rel.npc1Id;

        const partnerNpc = getNPCById(partnerName);
        generateDramaPost(poster, 'happy_relationship', {
          relationship: rel,
          partnerName: partnerNpc?.display_name || partnerName,
        });
      }
    }
  }
}

// ============================================================================
// Event Handlers (for relationship store events)
// ============================================================================

/**
 * Called when a relationship event occurs.
 * Determines if any NPCs should post in response.
 */
export function onRelationshipEvent(
  event: RelationshipEvent,
  relationship: NPCRelationship
): void {
  // Determine who might post about this event
  const potentialPosters: string[] = [];

  switch (event.type) {
    case 'relationship_started':
      if (!relationship.isSecret) {
        potentialPosters.push(relationship.npc1Id, relationship.npc2Id);
      }
      break;

    case 'relationship_ended':
      // The dumped person is more likely to post
      potentialPosters.push(relationship.npc1Id, relationship.npc2Id);
      break;

    case 'affair_discovered':
      // The discoverer might post
      potentialPosters.push(...event.witnessedBy);
      break;

    case 'caught_cheating':
      // Everyone involved might post
      potentialPosters.push(relationship.npc1Id, relationship.npc2Id);
      // Partners too
      const p1 = npcRelationshipService.getPartner(relationship.npc1Id);
      const p2 = npcRelationshipService.getPartner(relationship.npc2Id);
      if (p1) potentialPosters.push(p1);
      if (p2) potentialPosters.push(p2);
      break;
  }

  // Each potential poster has a chance to actually post
  for (const npcId of potentialPosters) {
    const postChance = 0.6; // 60% chance to post about significant events

    if (Math.random() < postChance) {
      const postType = getPostTypeForEvent(event, npcId, relationship);

      if (postType) {
        generateDramaPost(postType, postType, {
          relationship,
        });
      }
    }
  }
}

// ============================================================================
// Initialization
// ============================================================================

let isInitialized = false;

/**
 * Initialize the drama engine.
 * This subscribes to events so NPCs automatically post when
 * relationship changes occur.
 */
export function initializeDramaEngine(): void {
  if (isInitialized) return;

  // Subscribe to NPC social media check events
  eventBus.on(EventTypes.NPC_SHOULD_REACT_TO_POSTS, async (event) => {
    const { npc_id, posts } = event.payload;

    for (const post of posts) {
      processPostReaction(npc_id, post);
    }
  });

  // Subscribe to relationship started events
  eventBus.on(EventTypes.NPC_RELATIONSHIP_STARTED, async (event) => {
    const relationship = npcRelationshipService.getRelationship(event.payload.relationship_id);
    if (!relationship) return;

    // Potential posters
    if (!relationship.isSecret) {
      for (const npcId of [relationship.npc1Id, relationship.npc2Id]) {
        if (Math.random() < 0.6) {
          const partnerNpcId = npcId === relationship.npc1Id ? relationship.npc2Id : relationship.npc1Id;
          const partnerNpc = getNPCById(partnerNpcId);
          generateDramaPost(npcId, 'happy_relationship', {
            relationship,
            partnerName: partnerNpc?.display_name || partnerNpcId,
          });
        }
      }
    }
  });

  // Subscribe to relationship ended events
  eventBus.on(EventTypes.NPC_RELATIONSHIP_ENDED, async (event) => {
    const { npc1_id, npc2_id } = event.payload;

    for (const npcId of [npc1_id, npc2_id]) {
      if (Math.random() < 0.6) {
        generateDramaPost(npcId, 'post_breakup', {});
      }
    }
  });

  // Subscribe to affair discovered events
  eventBus.on(EventTypes.NPC_AFFAIR_DISCOVERED, async (event) => {
    const { discovered_by } = event.payload;

    if (discovered_by && Math.random() < 0.6) {
      generateDramaPost(discovered_by, 'vague_post', {});
    }
  });

  // Subscribe to affair exposed events
  eventBus.on(EventTypes.NPC_AFFAIR_EXPOSED, async (event) => {
    const relationship = npcRelationshipService.getRelationship(event.payload.relationship_id);
    if (!relationship) return;

    // Victims post about being cheated on
    const npc1Partner = npcRelationshipService.getPartner(relationship.npc1Id);
    const npc2Partner = npcRelationshipService.getPartner(relationship.npc2Id);

    for (const victim of [npc1Partner, npc2Partner].filter(Boolean) as string[]) {
      if (Math.random() < 0.7) {
        generateDramaPost(victim, 'caught_cheating_victim', {});
      }
    }

    // Cheaters might post damage control
    for (const cheater of [relationship.npc1Id, relationship.npc2Id]) {
      if (Math.random() < 0.4) {
        generateDramaPost(cheater, 'caught_cheating_guilty', {});
      }
    }
  });

  isInitialized = true;
  console.log('[DramaEngine] Initialized and subscribed to events');
}

// ============================================================================
// Start Drama Engine Ticker
// ============================================================================

let tickInterval: ReturnType<typeof setInterval> | null = null;

/**
 * Start the drama engine periodic tick.
 */
export function startDramaEngine(options: { tickIntervalMinutes?: number } = {}): void {
  const intervalMinutes = options.tickIntervalMinutes ?? 5;

  if (tickInterval) {
    clearInterval(tickInterval);
  }

  tickInterval = setInterval(() => {
    try {
      tick();
    } catch (err) {
      console.error('[DramaEngine] Error during tick:', err);
    }
  }, intervalMinutes * 60 * 1000);

  console.log(`[DramaEngine] Started with ${intervalMinutes} minute tick interval`);
}

/**
 * Stop the drama engine periodic tick.
 */
export function stopDramaEngine(): void {
  if (tickInterval) {
    clearInterval(tickInterval);
    tickInterval = null;
    console.log('[DramaEngine] Stopped');
  }
}

// ============================================================================
// Exports
// ============================================================================

export const dramaEngine = {
  initializeDramaEngine,
  startDramaEngine,
  stopDramaEngine,
  tick,
  generateDramaPost,
  processPostReaction,
  processAffairDiscovery,
  checkForSuspiciousActivity,
  onRelationshipEvent,
  getDramaPersonality,
  getPostTypeForEvent,
};

export default dramaEngine;
