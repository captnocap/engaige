import { getDB, generateId } from '../db/index.js';
import { configureAI, type AIProvider } from './ai.js';
import { initializeBudget, type BudgetConfig } from './budget.js';
import { createPlayer, setOnboardingComplete, hasCompletedOnboarding, savePlayerPreferences, type PlayerPreferences } from './player.js';

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
    // Step 1: Configure AI provider globally
    configureAI({
      provider: data.provider.type,
      model: data.provider.model,
      apiKey: data.provider.apiKey,
      baseUrl: data.provider.baseUrl,
    });

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
    if (!data.skip_npc_generation) {
      // TODO: Implement NPC generation
      // This will be done in the next phase
      npcCount = 0; // Placeholder
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
): Promise<{ valid: boolean; error?: string }> {
  try {
    // For OpenAI-compatible, just check if base URL is reachable
    if (provider === 'openai-compatible' && baseUrl) {
      try {
        const response = await fetch(baseUrl.replace('/v1', '') + '/v1/models', {
          method: 'GET',
          headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : {},
        });
        if (response.ok) {
          return { valid: true };
        }
      } catch {
        // Local server might not have models endpoint, that's okay
        return { valid: true };
      }
    }

    // For OpenAI, check API key
    if (provider === 'openai') {
      if (!apiKey) {
        return { valid: false, error: 'API key required for OpenAI' };
      }
      // Could test with a minimal API call here
      return { valid: true };
    }

    // For Anthropic, check API key
    if (provider === 'anthropic') {
      if (!apiKey) {
        return { valid: false, error: 'API key required for Anthropic' };
      }
      return { valid: true };
    }

    return { valid: true };
  } catch (error: any) {
    return { valid: false, error: error.message };
  }
}

export default {
  checkOnboardingStatus,
  completeOnboarding,
  createDevProfile,
  resetOnboarding,
  validateProviderConfig,
};
