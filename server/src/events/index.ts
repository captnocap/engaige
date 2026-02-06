/**
 * Event Bus - Central Export
 *
 * Usage:
 *   import { eventBus, EventTypes } from '../events/index.js';
 *
 *   // Emit an event
 *   await eventBus.emit(EventTypes.CONVERSATION_MESSAGE_SENT, { ... }, { source: 'conversation' });
 *
 *   // Subscribe to events
 *   eventBus.on(EventTypes.RELATIONSHIP_STAGE_CHANGED, (event) => { ... });
 */

export { eventBus, default } from './event-bus.js';
export {
  EventTypes,
  type EventCategory,
  type GameEvent,
  type EventContext,
  type EventTypeValue,

  // Payload types
  type PlayerProfileUpdatedPayload,
  type PlayerSettingsChangedPayload,
  type PlayerSessionPayload,
  type NPCCreatedPayload,
  type NPCUpdatedPayload,
  type NPCMoodChangedPayload,
  type NPCStatusPayload,
  type MessagePayload,
  type ConversationStartedPayload,
  type ConversationEndedPayload,
  type RelationshipStatsUpdatedPayload,
  type RelationshipStageChangedPayload,
  type RelationshipMilestonePayload,
  type PostCreatedPayload,
  type PostInteractionPayload,
  type ProfileViewedPayload,
  type MemoryCreatedPayload,
  type MemoryRecalledPayload,
  type MemoryExpiredPayload,
  type BudgetSpentPayload,
  type BudgetWarningPayload,
  type BudgetExhaustedPayload,
  type BudgetAllocationChangedPayload,
  type SystemStartupPayload,
  type SystemShutdownPayload,
  type SystemErrorPayload,
  type WSConnectionPayload,
  type TaskScheduledPayload,
  type TaskExecutionPayload,
  type AIRequestPayload,
  type AIResponsePayload,
  type AIErrorPayload,
  type AIProxiedPayload,
  type MediaUploadedPayload,
  type MediaGeneratedPayload,
  type MediaDeletedPayload,
  type OnboardingPersonalityTestCompletedPayload,
  type OnboardingNPCWavePayload,
  type OnboardingCompletedPayload,
  type PinballGameStartedPayload,
  type PinballGameEndedPayload,
  type PinballEloUpdatedPayload,
  type PinballHighScorePayload,
} from './event-types.js';
