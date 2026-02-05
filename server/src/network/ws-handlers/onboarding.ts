/**
 * Onboarding Handlers
 */

import type { ServerWebSocket } from 'bun';
import { createResponse, type WSMessage } from '../ws-protocol.js';
import type { ClientSession, HandlerContext, HandlerMap } from './types.js';

async function handleOnboardingGetStatus(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  const { checkOnboardingStatus } = await import('../../services/onboarding.js');
  const status = checkOnboardingStatus();
  ctx.send(ws, createResponse(message.id, true, status));
}

async function handleOnboardingComplete(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  if (!message.payload) {
    ctx.send(ws, createResponse(message.id, false, null, 'Missing payload'));
    return;
  }

  const { completeOnboarding } = await import('../../services/onboarding.js');

  const onboardingData = message.payload as any;

  console.log(`[WS] Starting onboarding for user: ${onboardingData.profile?.username}`);

  try {
    const result = await completeOnboarding(onboardingData);

    if (result.success) {
      // Broadcast that onboarding completed
      ctx.broadcast({
        type: 'onboarding:completed',
        payload: {
          player_id: result.player_id,
          npc_count: result.npc_count,
        },
      });
    }

    ctx.send(ws, createResponse(message.id, true, result));
  } catch (err: any) {
    ctx.send(ws, createResponse(message.id, false, null, err.message));
  }
}

async function handleOnboardingValidateProvider(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  if (!message.payload) {
    ctx.send(ws, createResponse(message.id, false, null, 'Missing payload'));
    return;
  }

  const { validateProviderConfig } = await import('../../services/onboarding.js');
  const { provider, model, apiKey, baseUrl } = message.payload as any;

  const result = await validateProviderConfig(provider, model, apiKey, baseUrl);
  ctx.send(ws, createResponse(message.id, true, result));
}

async function handleOnboardingGetPersonalityQuestions(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  const { getPersonalityQuestions } = await import('../../services/onboarding.js');
  const questions = getPersonalityQuestions();
  ctx.send(ws, createResponse(message.id, true, { questions }));
}

async function handleOnboardingReset(
  ws: ServerWebSocket<ClientSession>,
  message: WSMessage,
  ctx: HandlerContext
): Promise<void> {
  const { resetOnboarding } = await import('../../services/onboarding.js');
  resetOnboarding();
  ctx.send(ws, createResponse(message.id, true, { reset: true }));

  // Broadcast that onboarding was reset
  ctx.broadcast({
    type: 'onboarding:reset',
    payload: {},
  });
}

export const onboardingHandlers: HandlerMap = {
  'onboarding:getStatus': handleOnboardingGetStatus,
  'onboarding:complete': handleOnboardingComplete,
  'onboarding:validateProvider': handleOnboardingValidateProvider,
  'onboarding:getPersonalityQuestions': handleOnboardingGetPersonalityQuestions,
  'onboarding:reset': handleOnboardingReset,
};
