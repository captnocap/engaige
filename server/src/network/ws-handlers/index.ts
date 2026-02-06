/**
 * WebSocket Handlers Index
 *
 * Aggregates all handlers into a single route map for use by ws-server.
 */

export type { ClientSession, HandlerContext, WSHandler, HandlerMap } from './types.js';

// Import all handler maps
import { accountHandlers } from './account.js';
import { budgetHandlers } from './budget.js';
import { aiHandlers } from './ai.js';
import { logsHandlers } from './logs.js';
import { providerHandlers } from './providers.js';
import { onboardingHandlers } from './onboarding.js';
import { npcHandlers } from './npc.js';
import { playerHandlers } from './player.js';
import { thoughtsHandlers } from './thoughts.js';
import { chessHandlers } from './chess.js';
import { worldHandlers } from './world.js';
import { guardrailsHandlers } from './guardrails.js';
import { socialHandlers } from './social.js';
import { relationshipsHandlers } from './relationships.js';
import { awarenessHandlers } from './awareness.js';
import { searchHandlers } from './search.js';
import { mediaHandlers } from './media.js';
import { studioHandlers } from './studio.js';
import { commentsHandlers } from './comments.js';
import { exportHandlers } from './export.js';
import { groupChatHandlers } from './group-chat.js';
import { hashtagsHandlers } from './hashtags.js';
import { instasnapHandlers } from './instasnap.js';
import { interactionHandlers } from './interaction.js';
import { sitesHandlers } from './sites.js';
import { newsHandlers } from './news.js';
import { pinballHandlers } from './pinball.js';

// Re-export broadcast functions for external use
export { broadcastThought, broadcastDeliberationStarted, broadcastDeliberationCompleted } from './thoughts.js';
export { broadcastWorldTimeUpdate, broadcastNPCMoved } from './world.js';
export { broadcastSocialEvent } from './social.js';

// Aggregate all handlers into a single route map
export const handlers = {
  ...accountHandlers,
  ...budgetHandlers,
  ...aiHandlers,
  ...logsHandlers,
  ...providerHandlers,
  ...onboardingHandlers,
  ...npcHandlers,
  ...playerHandlers,
  ...thoughtsHandlers,
  ...chessHandlers,
  ...worldHandlers,
  ...guardrailsHandlers,
  ...socialHandlers,
  ...relationshipsHandlers,
  ...awarenessHandlers,
  ...searchHandlers,
  ...mediaHandlers,
  ...studioHandlers,
  ...commentsHandlers,
  ...exportHandlers,
  ...groupChatHandlers,
  ...hashtagsHandlers,
  ...instasnapHandlers,
  ...interactionHandlers,
  ...sitesHandlers,
  ...newsHandlers,
  ...pinballHandlers,
};

// Export individual handler maps for testing or selective imports
export {
  accountHandlers,
  budgetHandlers,
  aiHandlers,
  logsHandlers,
  providerHandlers,
  onboardingHandlers,
  npcHandlers,
  playerHandlers,
  thoughtsHandlers,
  chessHandlers,
  worldHandlers,
  guardrailsHandlers,
  socialHandlers,
  relationshipsHandlers,
  awarenessHandlers,
  searchHandlers,
  mediaHandlers,
  studioHandlers,
  commentsHandlers,
  exportHandlers,
  groupChatHandlers,
  hashtagsHandlers,
  instasnapHandlers,
  interactionHandlers,
  sitesHandlers,
  newsHandlers,
  pinballHandlers,
};
