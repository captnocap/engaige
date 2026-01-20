// Background agent: Analyzes conversations and updates relationship stats intelligently

import { getDB, now } from '../db/index.js';
import { registerTaskHandler, scheduleTask, type BackgroundTask } from '../services/background-scheduler.js';
import { generateNPCResponse } from '../services/ai.js';
import { updateRelationshipStats } from '../services/relationships.js';
import { getConversationMessages } from '../services/conversation.js';

// Relationship analyzer agent
async function handleAnalyzeRelationship(task: BackgroundTask): Promise<void> {
  const { npc_id, player_id, conversation_id } = task.metadata || {};

  if (!npc_id || !player_id) {
    throw new Error('Relationship analysis task missing npc_id or player_id');
  }

  const gameDb = getDB('game');
  const npcDb = getDB('npc');

  const npc = npcDb.prepare('SELECT * FROM npcs WHERE id = ?').get(npc_id) as any;
  if (!npc) {
    throw new Error(`NPC not found: ${npc_id}`);
  }

  // Get recent conversation
  let messages: any[];
  if (conversation_id) {
    messages = getConversationMessages(conversation_id, 20);
  } else {
    // Get most recent conversation with this player
    const conv = gameDb.prepare(`
      SELECT id FROM conversations
      WHERE npc_id = ? AND participant_id = ? AND participant_type = 'player'
      ORDER BY last_message_at DESC
      LIMIT 1
    `).get(npc_id, player_id) as any;

    if (!conv) {
      console.log(`[Relationship Analyzer] No conversation found for NPC ${npc.display_name} and player`);
      return;
    }

    messages = getConversationMessages(conv.id, 20);
  }

  if (messages.length === 0) {
    return;
  }

  // Build conversation context
  const conversationText = messages
    .slice(-10) // Last 10 messages only for analysis
    .map((m: any) => `${m.sender_type === 'player' ? 'User' : 'You'}: ${m.content}`)
    .join('\n');

  // Ask NPC to analyze the relationship dynamics
  const analysisPrompt = `Based on this recent conversation, analyze how your relationship with the user has changed.

Conversation:
${conversationText}

Answer these questions (one word or short phrase each):
1. Trust change (decreased/unchanged/slight increase/moderate increase/major increase):
2. Affinity change (decreased/unchanged/slight increase/moderate increase/major increase):
3. Overall tone (negative/neutral/positive/very positive):
4. Did user share something personal? (yes/no):
5. Was there conflict or tension? (yes/no):

Format your response exactly as:
Trust: [answer]
Affinity: [answer]
Tone: [answer]
Personal: [answer]
Conflict: [answer]`;

  const analysisResponse = await generateNPCResponse(
    npc_id,
    analysisPrompt,
    [],
    { feature_category: 'conversation' }
  );

  // Parse analysis
  const analysis = parseAnalysis(analysisResponse);

  console.log(`[Relationship Analyzer] Analysis for ${npc.display_name}:`, analysis);

  // Calculate stat changes
  let trustDelta = 0;
  let affinityDelta = 0;

  // Trust changes
  if (analysis.trust === 'major increase') trustDelta = 5;
  else if (analysis.trust === 'moderate increase') trustDelta = 3;
  else if (analysis.trust === 'slight increase') trustDelta = 1;
  else if (analysis.trust === 'decreased') trustDelta = -3;

  // Affinity changes
  if (analysis.affinity === 'major increase') affinityDelta = 5;
  else if (analysis.affinity === 'moderate increase') affinityDelta = 3;
  else if (analysis.affinity === 'slight increase') affinityDelta = 1;
  else if (analysis.affinity === 'decreased') affinityDelta = -3;

  // Bonus for positive tone
  if (analysis.tone === 'very positive') {
    affinityDelta += 2;
  } else if (analysis.tone === 'positive') {
    affinityDelta += 1;
  } else if (analysis.tone === 'negative') {
    affinityDelta -= 2;
    trustDelta -= 1;
  }

  // Bonus for sharing personal info
  if (analysis.personal === 'yes') {
    trustDelta += 2;
    affinityDelta += 1;
  }

  // Penalty for conflict
  if (analysis.conflict === 'yes') {
    trustDelta -= 2;
    affinityDelta -= 1;
  }

  // Update relationship stats
  if (trustDelta !== 0 || affinityDelta !== 0) {
    updateRelationshipStats(player_id, npc_id, {
      trust_delta: trustDelta,
      affinity_delta: affinityDelta,
      familiarity_delta: 2, // Always gain familiarity from conversations
    });

    console.log(`[Relationship Analyzer] Updated stats: Trust ${trustDelta > 0 ? '+' : ''}${trustDelta}, Affinity ${affinityDelta > 0 ? '+' : ''}${affinityDelta}`);
  }
}

// Parse the analysis response
function parseAnalysis(response: string): {
  trust: string;
  affinity: string;
  tone: string;
  personal: string;
  conflict: string;
} {
  const lines = response.split('\n');
  const result: any = {};

  for (const line of lines) {
    const match = line.match(/^(Trust|Affinity|Tone|Personal|Conflict):\s*(.+)$/i);
    if (match) {
      const key = match[1].toLowerCase();
      const value = match[2].trim().toLowerCase();
      result[key] = value;
    }
  }

  return {
    trust: result.trust || 'unchanged',
    affinity: result.affinity || 'unchanged',
    tone: result.tone || 'neutral',
    personal: result.personal || 'no',
    conflict: result.conflict || 'no',
  };
}

// Schedule relationship analysis after a conversation
export function scheduleRelationshipAnalysis(
  npcId: string,
  playerId: string,
  conversationId: string,
  delaySeconds = 120 // Wait 2 minutes after conversation
): BackgroundTask {
  return scheduleTask('analyze_relationship', {
    npc_id: npcId,
    player_id: playerId,
    priority: 7,
    delay_seconds: delaySeconds,
    metadata: {
      conversation_id: conversationId,
      player_id: playerId,
    },
    budget_category: 'conversation',
  });
}

// Initialize relationship analyzer agent
export function initializeRelationshipAnalyzer(): void {
  registerTaskHandler('analyze_relationship', handleAnalyzeRelationship);
  console.log('[Relationship Analyzer] Initialized');
}

export default {
  initializeRelationshipAnalyzer,
  scheduleRelationshipAnalysis,
};
