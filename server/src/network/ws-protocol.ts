/**
 * WebSocket Message Protocol
 *
 * Defines all message types for client <-> server communication.
 * All messages follow the format: { type: string, payload?: any, id?: string }
 *
 * The `id` field is optional and used for request-response correlation.
 */

// ============================================================================
// Base Types
// ============================================================================

export interface WSMessage<T = unknown> {
  type: string;
  payload?: T;
  id?: string; // For request-response correlation
}

export interface WSErrorPayload {
  message: string;
  code?: string;
}

// ============================================================================
// Client -> Server Messages
// ============================================================================

// Budget
export interface BudgetGetStatusMessage extends WSMessage {
  type: 'budget:getStatus';
}

export interface BudgetGetConfigMessage extends WSMessage {
  type: 'budget:getConfig';
}

export interface BudgetUpdateConfigMessage extends WSMessage<{
  daily_budget_cents?: number;
  monthly_budget_cents?: number;
  category_allocations?: Record<string, number>;
}> {
  type: 'budget:updateConfig';
}

export interface BudgetGetLogsMessage extends WSMessage<{
  category?: string;
  limit?: number;
  offset?: number;
  startDate?: number;
  endDate?: number;
}> {
  type: 'budget:getLogs';
}

// AI / Conversation
export interface AISendMessageMessage extends WSMessage<{
  npcId: string;
  message: string;
  conversationId?: string;
  platform?: string;
}> {
  type: 'ai:sendMessage';
}

export interface AIGeneratePostMessage extends WSMessage<{
  npcId: string;
  platform: string;
  prompt?: string;
}> {
  type: 'ai:generatePost';
}

// Proxy Configuration
export interface ProxyGetConfigMessage extends WSMessage {
  type: 'proxy:getConfig';
}

export interface ProxySetConfigMessage extends WSMessage<{
  enabled: boolean;
  type?: 'socks5' | 'socks4' | 'http' | 'https';
  host?: string;
  port?: number;
  auth?: { username: string; password: string };
}> {
  type: 'proxy:setConfig';
}

// System
export interface PingMessage extends WSMessage {
  type: 'ping';
}

// Logs - Events
export interface LogsGetEventsMessage extends WSMessage<{
  category?: string;
  limit?: number;
  offset?: number;
}> {
  type: 'logs:getEvents';
}

// Logs - Errors
export interface LogsGetErrorsMessage extends WSMessage<{
  severity?: 'low' | 'medium' | 'high' | 'critical';
  unresolved?: boolean;
  limit?: number;
}> {
  type: 'logs:getErrors';
}

export interface LogsResolveErrorMessage extends WSMessage<{
  errorId: string;
  notes?: string;
}> {
  type: 'logs:resolveError';
}

// Logs - Queue
export interface LogsGetQueueMessage extends WSMessage {
  type: 'logs:getQueue';
}

// NPC Thoughts
export interface ThoughtsGetMessage extends WSMessage<{
  npcId?: string;       // If provided, get thoughts for specific NPC
  limit?: number;
  thoughtType?: 'in_character' | 'meta_ai' | 'unknown' | 'all';
  minConfidence?: number;
  since?: number;       // Timestamp - get thoughts after this time
}> {
  type: 'thoughts:get';
}

export interface ThoughtsSubscribeMessage extends WSMessage<{
  npcId?: string;       // If provided, subscribe to specific NPC's thoughts
}> {
  type: 'thoughts:subscribe';
}

export interface ThoughtsUnsubscribeMessage extends WSMessage {
  type: 'thoughts:unsubscribe';
}

// AI Provider Configuration
export interface AIProviderGetAllMessage extends WSMessage {
  type: 'aiProvider:getAll';
}

export interface AIProviderGetActiveMessage extends WSMessage {
  type: 'aiProvider:getActive';
}

export interface AIProviderCreateMessage extends WSMessage<{
  name: string;
  display_name: string;
  provider_type: 'openai' | 'openai-compatible' | 'anthropic';
  base_url?: string;
  api_key?: string;
  default_model: string;
  is_enabled?: boolean;
  supports_vision?: boolean;
  supports_tools?: boolean;
  max_context_tokens?: number;
}> {
  type: 'aiProvider:create';
}

export interface AIProviderUpdateMessage extends WSMessage<{
  id?: string;
  name?: string;
  display_name?: string;
  provider_type?: 'openai' | 'openai-compatible' | 'anthropic';
  base_url?: string;
  api_key?: string;
  default_model?: string;
  is_enabled?: boolean;
  supports_vision?: boolean;
  supports_tools?: boolean;
  max_context_tokens?: number;
}> {
  type: 'aiProvider:update';
}

export interface AIProviderDeleteMessage extends WSMessage<{
  id?: string;
  name?: string;
}> {
  type: 'aiProvider:delete';
}

export interface AIProviderSetActiveMessage extends WSMessage<{
  id?: string;
  name?: string;
}> {
  type: 'aiProvider:setActive';
}

export interface AIProviderTestMessage extends WSMessage<{
  id?: string;
  name?: string;
}> {
  type: 'aiProvider:test';
}

// Chess
export interface ChessChallengeNPCMessage extends WSMessage<{
  npc_id: string;
}> {
  type: 'chess:challengeNPC';
}

export interface ChessMakeMoveMessage extends WSMessage<{
  match_id: string;
  move: string;
}> {
  type: 'chess:makeMove';
}

export interface ChessResignMessage extends WSMessage<{
  match_id: string;
}> {
  type: 'chess:resign';
}

export interface ChessGetLeaderboardMessage extends WSMessage<{
  limit?: number;
}> {
  type: 'chess:getLeaderboard';
}

export interface ChessGetMatchMessage extends WSMessage<{
  match_id: string;
}> {
  type: 'chess:getMatch';
}

export interface ChessGetActiveMatchesMessage extends WSMessage {
  type: 'chess:getActiveMatches';
}

export interface ChessGetMatchHistoryMessage extends WSMessage<{
  limit?: number;
}> {
  type: 'chess:getMatchHistory';
}

// World Map
export interface WorldGetStateMessage extends WSMessage {
  type: 'world:getState';
}

export interface WorldSubscribeMessage extends WSMessage {
  type: 'world:subscribe';
}

export interface WorldUnsubscribeMessage extends WSMessage {
  type: 'world:unsubscribe';
}

export interface WorldGetBackgroundNPCsMessage extends WSMessage<{
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}> {
  type: 'world:getBackgroundNPCs';
}

export interface WorldPauseTimeMessage extends WSMessage {
  type: 'world:pauseTime';
}

export interface WorldResumeTimeMessage extends WSMessage {
  type: 'world:resumeTime';
}

export interface WorldSetTimeMultiplierMessage extends WSMessage<{
  multiplier: number;
}> {
  type: 'world:setTimeMultiplier';
}

// Content Guardrails
export interface GuardrailsGetRatingMessage extends WSMessage {
  type: 'guardrails:getRating';
}

export interface GuardrailsSetRatingMessage extends WSMessage<{
  rating: 'harsh' | 'strict' | 'normal' | 'relaxed' | 'none';
}> {
  type: 'guardrails:setRating';
}

export interface GuardrailsGetConfigMessage extends WSMessage {
  type: 'guardrails:getConfig';
}

// Union of all client messages
export type ClientMessage =
  | BudgetGetStatusMessage
  | BudgetGetConfigMessage
  | BudgetUpdateConfigMessage
  | BudgetGetLogsMessage
  | AISendMessageMessage
  | AIGeneratePostMessage
  | ProxyGetConfigMessage
  | ProxySetConfigMessage
  | PingMessage
  | LogsGetEventsMessage
  | LogsGetErrorsMessage
  | LogsResolveErrorMessage
  | LogsGetQueueMessage
  | AIProviderGetAllMessage
  | AIProviderGetActiveMessage
  | AIProviderCreateMessage
  | AIProviderUpdateMessage
  | AIProviderDeleteMessage
  | AIProviderSetActiveMessage
  | AIProviderTestMessage
  | ThoughtsGetMessage
  | ThoughtsSubscribeMessage
  | ThoughtsUnsubscribeMessage
  | ChessChallengeNPCMessage
  | ChessMakeMoveMessage
  | ChessResignMessage
  | ChessGetLeaderboardMessage
  | ChessGetMatchMessage
  | ChessGetActiveMatchesMessage
  | ChessGetMatchHistoryMessage
  | WorldGetStateMessage
  | WorldSubscribeMessage
  | WorldUnsubscribeMessage
  | WorldGetBackgroundNPCsMessage
  | WorldPauseTimeMessage
  | WorldResumeTimeMessage
  | WorldSetTimeMultiplierMessage
  | GuardrailsGetRatingMessage
  | GuardrailsSetRatingMessage
  | GuardrailsGetConfigMessage;

// ============================================================================
// Server -> Client Messages
// ============================================================================

// Responses (match request by id)
export interface ResponseMessage<T = unknown> extends WSMessage<T> {
  type: 'response';
  success: boolean;
  error?: string;
}

// Budget Events
export interface BudgetStatusEvent extends WSMessage<{
  daily_spent_cents: number;
  daily_budget_cents: number;
  monthly_spent_cents: number;
  monthly_budget_cents: number;
  remaining_daily_cents: number;
  remaining_monthly_cents: number;
}> {
  type: 'budget:status';
}

// AI Events
export interface AITypingEvent extends WSMessage<{
  npcId: string;
  isTyping: boolean;
}> {
  type: 'ai:typing';
}

export interface AIResponseEvent extends WSMessage<{
  npcId: string;
  message: string;
  conversationId: string;
}> {
  type: 'ai:response';
}

export interface AIPostCreatedEvent extends WSMessage<{
  npcId: string;
  platform: string;
  content: string;
  postId: string;
}> {
  type: 'ai:postCreated';
}

// System Events
export interface PongMessage extends WSMessage {
  type: 'pong';
}

export interface ErrorEvent extends WSMessage<WSErrorPayload> {
  type: 'error';
}

export interface ConnectedEvent extends WSMessage<{
  sessionId: string;
  serverVersion: string;
}> {
  type: 'connected';
}

// NPC Thoughts Events
export interface ThoughtCapturedEvent extends WSMessage<{
  thought_id: string;
  npc_id: string;
  npc_display_name: string;
  content: string;
  thought_type: 'in_character' | 'meta_ai' | 'unknown';
  confidence: number;
  context?: string;
  conversation_id?: string;
  created_at: number;
}> {
  type: 'thoughts:captured';
}

export interface DeliberationStartedEvent extends WSMessage<{
  npc_id: string;
  npc_display_name: string;
  target_loops: number;
  thinking_style: 'quick' | 'normal' | 'deliberate' | 'agonizing';
  reason: string;
  conversation_id?: string;
}> {
  type: 'thoughts:deliberationStarted';
}

export interface DeliberationCompletedEvent extends WSMessage<{
  npc_id: string;
  npc_display_name: string;
  loops_completed: number;
  thinking_style: 'quick' | 'normal' | 'deliberate' | 'agonizing';
  total_time_ms: number;
  thought_count: number;
  conversation_id?: string;
}> {
  type: 'thoughts:deliberationCompleted';
}

// Chess Events
export interface ChessMatchStartedEvent extends WSMessage<{
  match_id: string;
  white_player_id: string;
  black_player_id: string;
  white_elo: number;
  black_elo: number;
}> {
  type: 'chess:matchStarted';
}

export interface ChessMoveMadeEvent extends WSMessage<{
  match_id: string;
  player_id: string;
  move_notation: string;
  move_number: number;
  is_check: boolean;
  is_checkmate: boolean;
  fen_after: string;
}> {
  type: 'chess:moveMade';
}

export interface ChessMatchEndedEvent extends WSMessage<{
  match_id: string;
  result: 'white_win' | 'black_win' | 'draw' | 'abandoned';
  termination_reason: string;
  white_elo_change: number;
  black_elo_change: number;
}> {
  type: 'chess:matchEnded';
}

// World Map Events
export interface WorldStateEvent extends WSMessage<{
  city: {
    name: string;
    bounds: { minX: number; maxX: number; minY: number; maxY: number };
    tileSize: number;
    gridSize: { width: number; height: number };
    districts: Array<{
      id: string;
      name: string;
      type: string;
      description: string;
      bounds: { points: Array<[number, number]> };
      color: string;
      peakHours: number[];
      vibe: string;
    }>;
    buildings: Array<{
      id: string;
      name: string;
      type: string;
      districtId: string;
      position: { x: number; y: number };
      size: { width: number; height: number };
      spriteId: string;
      capacity: number;
      isResidential: boolean;
      isWorkplace: boolean;
    }>;
    landmarks: Array<{
      id: string;
      name: string;
      buildingId: string;
      description: string;
      keywords: string[];
      isNotable: boolean;
      iconEmoji?: string;
    }>;
  };
  gameTime: {
    hour: number;
    minute: number;
    dayOfWeek: number;
    dayName: string;
    isNight: boolean;
    period: 'morning' | 'afternoon' | 'evening' | 'night';
  };
  timeMultiplier: number;
  isPaused: boolean;
  aiNPCs: Array<{
    npcId: string;
    position: { x: number; y: number };
    buildingId?: string;
    activity: string;
    activityDescription?: string;
  }>;
  backgroundNPCCount: number;
  playerHome?: {
    buildingId: string;
    position: { x: number; y: number };
  };
}> {
  type: 'world:state';
}

export interface WorldNPCMovedEvent extends WSMessage<{
  npcId: string;
  isAI: boolean;
  position: { x: number; y: number };
  targetPosition?: { x: number; y: number };
  buildingId?: string;
  activity: string;
  activityDescription?: string;
}> {
  type: 'world:npcMoved';
}

export interface WorldTimeUpdateEvent extends WSMessage<{
  gameTime: {
    hour: number;
    minute: number;
    dayOfWeek: number;
    dayName: string;
    isNight: boolean;
    period: 'morning' | 'afternoon' | 'evening' | 'night';
  };
  formattedTime: string;
  formattedDateTime: string;
}> {
  type: 'world:timeUpdate';
}

export interface WorldBackgroundNPCsEvent extends WSMessage<{
  npcs: Array<{
    id: string;
    name: string;
    appearanceSeed: number;
    position: { x: number; y: number };
    state: string;
    activityLabel: string;
  }>;
  viewportBounds: { minX: number; maxX: number; minY: number; maxY: number };
}> {
  type: 'world:backgroundNPCs';
}

// Guardrails Events
export interface GuardrailsRatingChangedEvent extends WSMessage<{
  old_rating: 'harsh' | 'strict' | 'normal' | 'relaxed' | 'none';
  new_rating: 'harsh' | 'strict' | 'normal' | 'relaxed' | 'none';
  is_more_restrictive: boolean;
}> {
  type: 'guardrails:ratingChanged';
}

// Union of all server messages
export type ServerMessage =
  | ResponseMessage
  | BudgetStatusEvent
  | AITypingEvent
  | AIResponseEvent
  | AIPostCreatedEvent
  | PongMessage
  | ErrorEvent
  | ConnectedEvent
  | ThoughtCapturedEvent
  | DeliberationStartedEvent
  | DeliberationCompletedEvent
  | ChessMatchStartedEvent
  | ChessMoveMadeEvent
  | ChessMatchEndedEvent
  | WorldStateEvent
  | WorldNPCMovedEvent
  | WorldTimeUpdateEvent
  | WorldBackgroundNPCsEvent
  | GuardrailsRatingChangedEvent;

// ============================================================================
// Helpers
// ============================================================================

/**
 * Create a response message for a request
 */
export function createResponse<T>(requestId: string | undefined, success: boolean, payload?: T, error?: string): ResponseMessage<T> {
  return {
    type: 'response',
    id: requestId,
    success,
    payload,
    error,
  };
}

/**
 * Create an error event
 */
export function createError(message: string, code?: string, requestId?: string): ErrorEvent {
  return {
    type: 'error',
    id: requestId,
    payload: { message, code },
  };
}

/**
 * Parse incoming message with validation
 */
export function parseMessage(data: string): WSMessage | null {
  try {
    const parsed = JSON.parse(data);

    if (typeof parsed !== 'object' || !parsed.type) {
      return null;
    }

    return parsed as WSMessage;
  } catch {
    return null;
  }
}

/**
 * Serialize message for sending
 */
export function serializeMessage(message: WSMessage): string {
  return JSON.stringify(message);
}
