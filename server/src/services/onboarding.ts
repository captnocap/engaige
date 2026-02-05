import { getDB, generateId } from '../db/index.js';
import { configureAI, type AIProvider } from './ai.js';
import { upsertAIProvider, setActiveAIProvider, testProviderConnection, getAIProviderByName } from './ai-provider-config.js';
import { initializeBudget, type BudgetConfig } from './budget.js';
import { createPlayer, setOnboardingComplete, hasCompletedOnboarding, savePlayerPreferences, type PlayerPreferences } from './player.js';
import { generateNPCBatch, generateNPCBatchProgressive, type NPCGenerationResult } from './npc-generator.js';
import { loadQuestions, compileProfile, generatePersonaSummary, saveProfile, type TestAnswer, type PlayerPersonalityProfile } from './personality-test.js';
import { runFullGeneration, registerWaveTaskHandler, type FullGenerationResult } from './scene-seed-generator.js';

// Onboarding data structure
export interface OnboardingData {
  // Step 1: AI Provider Configuration
  provider: {
    type: AIProvider;
    model: string;
    apiKey?: string;
    baseUrl?: string;
  };

  // Step 2: Budget Configuration
  budget: {
    overall_limit_cents: number;
    period_type: 'daily' | 'weekly' | 'monthly';
    rollover_enabled: boolean;
    allocations?: Record<string, { percentage?: number; cents_override?: number }>;
  };

  // Step 3: User Profile
  profile: {
    username: string;
    display_name?: string;
    bio?: string;
    interests: string[];
    personality_vibe: string;
  };

  // Step 4: Preferences
  preferences: {
    romantic_interest_level: 'none' | 'low' | 'medium' | 'high';
    platonic_friends_level: 'low' | 'medium' | 'high';
    npc_count: number; // How many NPCs to generate initially
    npc_gender_preference: 'any' | 'male' | 'female' | 'mixed';
    age_range_preference: { min: number; max: number };
  };

  // Optional: Skip NPC generation for dev/testing
  skip_npc_generation?: boolean;
}

// Check onboarding status
export function checkOnboardingStatus(): {
  completed: boolean;
  player_id?: string;
} {
  const db = getDB('user');

  // Check if any player exists
  const player = db.prepare('SELECT id FROM player LIMIT 1').get() as any;
  if (!player) {
    return { completed: false };
  }

  // Check onboarding flag
  const completed = hasCompletedOnboarding(player.id);
  return { completed, player_id: player.id };
}

// Complete the onboarding process
export async function completeOnboarding(data: OnboardingData): Promise<{
  success: boolean;
  player_id: string;
  npc_count?: number;
  error?: string;
}> {
  try {
    // Step 1: Configure AI provider (persists to database)
    // Determine provider name from type
    let providerName: string;
    switch (data.provider.type) {
      case 'openai':
        providerName = 'openai';
        break;
      case 'anthropic':
        providerName = 'anthropic';
        break;
      default:
        providerName = 'local';
    }

    // Create/update the provider in the database
    upsertAIProvider({
      name: providerName,
      display_name: providerName === 'local' ? 'Local LM Studio' : providerName === 'openai' ? 'OpenAI' : 'Anthropic',
      provider_type: data.provider.type,
      base_url: data.provider.baseUrl,
      api_key: data.provider.apiKey,
      default_model: data.provider.model,
      is_active: true,
      is_enabled: true,
    });

    // Set this provider as active
    setActiveAIProvider(providerName);

    // Step 2: Initialize budget
    initializeBudget({
      overall_limit_cents: data.budget.overall_limit_cents,
      period_type: data.budget.period_type,
      rollover_enabled: data.budget.rollover_enabled,
      allocations: data.budget.allocations,
    });

    // Step 3: Create player profile
    const player = createPlayer(
      data.profile.username,
      data.profile.display_name || data.profile.username,
      data.profile.bio
    );

    // Step 4: Save player preferences
    const preferences: PlayerPreferences = {
      preferred_npc_count: data.preferences.npc_count,
      romantic_interest_level: data.preferences.romantic_interest_level,
      platonic_friends_level: data.preferences.platonic_friends_level,
      interests: data.profile.interests,
      personality_vibe: data.profile.personality_vibe,
      relationship_style: 'balanced', // Default
      npc_gender_preference: data.preferences.npc_gender_preference,
      age_range_preference: data.preferences.age_range_preference,
      occupation_preference: [], // Can be extended later
    };

    savePlayerPreferences(player.id, preferences);

    // Step 5: Generate NPCs (optional, can be skipped for dev)
    let npcCount = 0;
    let npcGenerationResult: NPCGenerationResult | null = null;

    if (!data.skip_npc_generation && data.preferences.npc_count > 0) {
      console.log(`[Onboarding] Starting NPC generation: ${data.preferences.npc_count} NPCs requested`);

      // Use progressive generation for larger batches
      if (data.preferences.npc_count > 10) {
        npcGenerationResult = await generateNPCBatchProgressive({
          count: data.preferences.npc_count,
          preferences: preferences,
          playerInterests: data.profile.interests,
          playerPersonalityVibe: data.profile.personality_vibe,
        }, (created, total) => {
          console.log(`[Onboarding] NPC generation progress: ${created}/${total}`);
        });
      } else {
        npcGenerationResult = await generateNPCBatch({
          count: data.preferences.npc_count,
          preferences: preferences,
          playerInterests: data.profile.interests,
          playerPersonalityVibe: data.profile.personality_vibe,
        });
      }

      npcCount = npcGenerationResult.created_count;

      if (npcGenerationResult.errors.length > 0) {
        console.warn(`[Onboarding] NPC generation had ${npcGenerationResult.errors.length} errors:`, npcGenerationResult.errors);
      }

      console.log(`[Onboarding] NPC generation complete: ${npcCount} created, ${npcGenerationResult.failed_count} failed`);
    }

    // Step 6: Mark onboarding as complete
    setOnboardingComplete(player.id);

    return {
      success: true,
      player_id: player.id,
      npc_count: npcCount,
    };
  } catch (error: any) {
    return {
      success: false,
      player_id: '',
      error: error.message || 'Unknown error during onboarding',
    };
  }
}

// Create a dev/test onboarding profile quickly
export async function createDevProfile(): Promise<{
  success: boolean;
  player_id: string;
}> {
  const devData: OnboardingData = {
    provider: {
      type: 'openai-compatible',
      model: 'gpt-4o-mini',
      baseUrl: 'http://localhost:1234/v1',
    },
    budget: {
      overall_limit_cents: 1000, // $10
      period_type: 'monthly',
      rollover_enabled: true,
    },
    profile: {
      username: 'dev_user',
      display_name: 'Dev User',
      bio: 'Just testing the system',
      interests: ['coding', 'gaming', 'music'],
      personality_vibe: 'chill',
    },
    preferences: {
      romantic_interest_level: 'medium',
      platonic_friends_level: 'medium',
      npc_count: 10,
      npc_gender_preference: 'mixed',
      age_range_preference: { min: 20, max: 35 },
    },
    skip_npc_generation: true, // Skip for dev mode
  };

  return await completeOnboarding(devData);
}

// Reset onboarding (for testing)
export function resetOnboarding(): void {
  const db = getDB('user');

  // Delete all player data
  db.exec('DELETE FROM player');
  db.exec('DELETE FROM settings');

  // Reset budget
  db.exec('DELETE FROM budget_config');
  db.exec('DELETE FROM api_costs');

  // Reset AI providers (will be re-seeded with defaults on next startup)
  db.exec('DELETE FROM ai_providers');

  // Reset game state
  const gameDb = getDB('game');
  gameDb.exec('DELETE FROM conversations');
  gameDb.exec('DELETE FROM messages');
  gameDb.exec('DELETE FROM memories');
  gameDb.exec('DELETE FROM posts');
  gameDb.exec('DELETE FROM post_comments');
  gameDb.exec('DELETE FROM npc_activities');

  console.log('Onboarding reset complete');
}

// Validate provider configuration by testing connection
export async function validateProviderConfig(
  provider: AIProvider,
  model: string,
  apiKey?: string,
  baseUrl?: string
): Promise<{ valid: boolean; error?: string; latency_ms?: number }> {
  try {
    // Basic validation first
    if (provider === 'openai' && !apiKey) {
      return { valid: false, error: 'API key required for OpenAI' };
    }
    if (provider === 'anthropic' && !apiKey) {
      return { valid: false, error: 'API key required for Anthropic' };
    }

    // Create a temporary provider object to test connection
    const tempProvider = {
      id: 'temp',
      name: 'temp',
      display_name: 'Temp',
      provider_type: provider,
      base_url: baseUrl,
      api_key: apiKey,
      default_model: model,
      is_active: false,
      is_enabled: true,
      supports_vision: false,
      supports_tools: true,
      created_at: 0,
      updated_at: 0,
    };

    const result = await testProviderConnection(tempProvider);
    return {
      valid: result.success,
      error: result.error,
      latency_ms: result.latency_ms,
    };
  } catch (error: any) {
    return { valid: false, error: error.message };
  }
}

// ============================================================================
// Scene Seed / Personality Test Integration
// ============================================================================

export function getPersonalityQuestions() {
  const questions = loadQuestions();
  // Return sanitized version (strip weights from choices - don't send scoring info to client)
  return questions.map(q => ({
    id: q.id,
    question: q.question,
    dimension: q.dimension,
    choices: q.choices.map(c => ({ label: c.label, value: c.value })),
    allowFreeform: q.allowFreeform,
    skippable: q.skippable,
  }));
}

export async function processPersonalityTest(
  playerId: string,
  answers: TestAnswer[],
  playerName: string
): Promise<PlayerPersonalityProfile> {
  // Compile profile from answers
  const profile = compileProfile(answers);

  // Generate AI persona summary (async)
  try {
    const summary = await generatePersonaSummary(
      profile.dimensions,
      profile.freeform_answers,
      playerName
    );
    profile.persona_summary = summary;
  } catch (error: any) {
    console.warn('[Onboarding] Failed to generate persona summary:', error.message);
    // Profile still valid without AI summary
  }

  // Save to database
  saveProfile(playerId, profile);

  return profile;
}

export async function startSceneSeedGeneration(
  playerId: string,
  profile: PlayerPersonalityProfile,
  playerName: string,
  options?: { targetNPCCount?: number; romanticEnabled?: boolean }
): Promise<FullGenerationResult> {
  const targetNPCCount = options?.targetNPCCount ?? 30;
  const romanticEnabled = options?.romanticEnabled ?? (profile.romance_readiness > 0.3);

  console.log(`[Onboarding] Starting scene seed generation: ${targetNPCCount} NPCs, romance=${romanticEnabled}`);

  const result = await runFullGeneration(profile, playerName, {
    targetNPCCount,
    romanticEnabled,
    dramaLevel: profile.drama_affinity,
  });

  console.log(`[Onboarding] Wave 1 complete: ${result.total_npcs_created} NPCs created`);

  return result;
}

export function initializeSceneSeedSystem(): void {
  registerWaveTaskHandler();
  console.log('[Onboarding] Scene seed system initialized');
}

export default {
  checkOnboardingStatus,
  completeOnboarding,
  createDevProfile,
  resetOnboarding,
  validateProviderConfig,
  getPersonalityQuestions,
  processPersonalityTest,
  startSceneSeedGeneration,
  initializeSceneSeedSystem,
};
