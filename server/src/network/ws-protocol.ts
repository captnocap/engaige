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
  | LogsGetQueueMessage;

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

// Union of all server messages
export type ServerMessage =
  | ResponseMessage
  | BudgetStatusEvent
  | AITypingEvent
  | AIResponseEvent
  | AIPostCreatedEvent
  | PongMessage
  | ErrorEvent
  | ConnectedEvent;

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
