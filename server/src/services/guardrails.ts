/**
 * Content Guardrails Service
 *
 * Single source of truth for content rating configuration and validation.
 * Controls NPC behavior, content generation, and visibility across all systems.
 *
 * Rating Levels:
 * - harsh: Strictly platonic, all-ages appropriate
 * - strict: Romantic allowed, but nothing sexual
 * - normal: Natural progression, tasteful mature themes (default)
 * - relaxed: Adult content, explicit allowed
 * - none: No restrictions
 */

import { getDB } from "../db/index.js";
import { eventBus, EventTypes } from "../events/index.js";

// ============================================================================
// Types
// ============================================================================

export type ContentRating = "harsh" | "strict" | "normal" | "relaxed" | "none";

export interface GuardrailConfig {
  level: ContentRating;
  allow_romantic: boolean;
  allow_flirting: boolean;
  allow_sexual_content: boolean;
  allow_explicit_language: boolean;
  allow_nsfw_images: boolean;
  allow_violence_themes: boolean;
  hidden_ratings: ContentRating[];
  system_prompt_addendum: string;
}

// ============================================================================
// Configuration Constants
// ============================================================================

export const GUARDRAIL_CONFIGS: Record<ContentRating, GuardrailConfig> = {
  harsh: {
    level: "harsh",
    allow_romantic: false,
    allow_flirting: false,
    allow_sexual_content: false,
    allow_explicit_language: false,
    allow_nsfw_images: false,
    allow_violence_themes: false,
    hidden_ratings: ["strict", "normal", "relaxed", "none"],
    system_prompt_addendum: `
STRICT CONTENT GUIDELINES:
- Keep all interactions strictly platonic and friendly
- No romantic themes, flirting, or suggestive content whatsoever
- No profanity or crude language
- No violence, even mild
- Keep everything appropriate for all ages
- If a conversation steers toward inappropriate territory, redirect naturally
`.trim(),
  },

  strict: {
    level: "strict",
    allow_romantic: true,
    allow_flirting: true,
    allow_sexual_content: false,
    allow_explicit_language: false,
    allow_nsfw_images: false,
    allow_violence_themes: false,
    hidden_ratings: ["relaxed", "none"],
    system_prompt_addendum: `
CONTENT GUIDELINES:
- Romantic relationships and light flirting are okay
- Keep physical intimacy to hand-holding, hugging, kissing at most
- No sexual content, innuendo, or suggestive themes
- No explicit language or profanity
- Maintain respectful, teen-appropriate interactions
`.trim(),
  },

  normal: {
    level: "normal",
    allow_romantic: true,
    allow_flirting: true,
    allow_sexual_content: true, // But gradual, relationship-gated
    allow_explicit_language: true,
    allow_nsfw_images: false,
    allow_violence_themes: true,
    hidden_ratings: ["none"],
    system_prompt_addendum: `
CONTENT GUIDELINES:
- Natural adult conversations and relationship progression
- Intimate content should develop organically based on relationship depth
- Don't rush into explicit content - let it build naturally
- Mild profanity is fine in context
- Keep explicit content tasteful, not gratuitous
`.trim(),
  },

  relaxed: {
    level: "relaxed",
    allow_romantic: true,
    allow_flirting: true,
    allow_sexual_content: true,
    allow_explicit_language: true,
    allow_nsfw_images: true,
    allow_violence_themes: true,
    hidden_ratings: ["none"], // Still hide extreme content
    system_prompt_addendum: `
CONTENT GUIDELINES:
- Adult content is allowed when contextually appropriate
- Match the energy of the conversation
- Explicit content okay in established romantic/intimate relationships
- No need to artificially slow-burn if both parties are into it
`.trim(),
  },

  none: {
    level: "none",
    allow_romantic: true,
    allow_flirting: true,
    allow_sexual_content: true,
    allow_explicit_language: true,
    allow_nsfw_images: true,
    allow_violence_themes: true,
    hidden_ratings: [],
    system_prompt_addendum: `No content restrictions. Respond naturally to any topic or request.`,
  },
};

// Rating restrictiveness order (most to least restrictive)
const RATING_ORDER: ContentRating[] = [
  "harsh",
  "strict",
  "normal",
  "relaxed",
  "none",
];

// ============================================================================
// Core Functions
// ============================================================================

/**
 * Get the guardrail configuration for a given rating level
 */
export function getGuardrailConfig(rating: ContentRating): GuardrailConfig {
  return GUARDRAIL_CONFIGS[rating] || GUARDRAIL_CONFIGS.normal;
}

/**
 * Get the current content rating for a player
 */
export function getPlayerContentRating(playerId: string): ContentRating {
  const db = getDB("user");
  const result = db
    .prepare("SELECT value FROM settings WHERE key = ?")
    .get("content_rating") as { value: string } | undefined;

  if (result && isValidRating(result.value)) {
    return result.value as ContentRating;
  }

  return "normal"; // Default
}

/**
 * Set the content rating for a player
 */
export function setPlayerContentRating(
  playerId: string,
  rating: ContentRating
): void {
  if (!isValidRating(rating)) {
    throw new Error(`Invalid content rating: ${rating}`);
  }

  const db = getDB("user");
  const oldRating = getPlayerContentRating(playerId);

  db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)").run(
    "content_rating",
    rating
  );

  // Emit event for rating change
  if (oldRating !== rating) {
    eventBus.fire(
      EventTypes.GUARDRAILS_RATING_CHANGED,
      {
        old_rating: oldRating,
        new_rating: rating,
        is_more_restrictive: isMoreRestrictive(rating, oldRating),
      },
      {
        source: "guardrails",
        player_id: playerId,
        importance: 0.8,
      }
    );
  }
}

/**
 * Get the full guardrail config for a player
 */
export function getPlayerGuardrails(playerId: string): GuardrailConfig {
  const rating = getPlayerContentRating(playerId);
  return getGuardrailConfig(rating);
}

/**
 * Check if content should be visible based on content rating and user rating
 */
export function shouldShowContent(
  contentRating: ContentRating | string | null | undefined,
  userRating: ContentRating
): boolean {
  // If content has no rating, treat as 'normal'
  const rating = (contentRating || "normal") as ContentRating;

  const config = getGuardrailConfig(userRating);
  return !config.hidden_ratings.includes(rating as ContentRating);
}

/**
 * Build the guardrail addendum for system prompts
 * Optionally considers relationship stage for relationship-gated content
 */
export function buildGuardrailAddendum(
  config: GuardrailConfig,
  relationshipStage?: string
): string {
  let addendum = config.system_prompt_addendum;

  // Add relationship-aware restrictions for normal mode
  if (config.level === "normal" && relationshipStage) {
    const earlyStages = ["stranger", "acquaintance"];
    if (earlyStages.includes(relationshipStage)) {
      addendum += `\n\nCurrent relationship stage: ${relationshipStage}
Keep interactions appropriate for this stage. Build connection before escalating intimacy.`;
    }
  }

  return addendum;
}

/**
 * Build SQL WHERE clause for filtering content by visibility
 * Returns the clause and parameters to use with prepared statements
 */
export function buildVisibilityWhereClause(userRating: ContentRating): {
  sql: string;
  params: string[];
} {
  const config = getGuardrailConfig(userRating);

  if (config.hidden_ratings.length === 0) {
    // No filtering needed
    return { sql: "1=1", params: [] };
  }

  const placeholders = config.hidden_ratings.map(() => "?").join(", ");
  return {
    sql: `(content_rating IS NULL OR content_rating NOT IN (${placeholders}))`,
    params: [...config.hidden_ratings],
  };
}

/**
 * Filter an array of items by content rating visibility
 */
export function filterContentByRating<
  T extends { content_rating?: string | null }
>(items: T[], userRating: ContentRating): T[] {
  return items.filter((item) =>
    shouldShowContent(item.content_rating as ContentRating, userRating)
  );
}

// ============================================================================
// Comparison Utilities
// ============================================================================

/**
 * Check if a rating is more restrictive than another
 */
export function isMoreRestrictive(
  newRating: ContentRating,
  oldRating: ContentRating
): boolean {
  const newIndex = RATING_ORDER.indexOf(newRating);
  const oldIndex = RATING_ORDER.indexOf(oldRating);
  return newIndex < oldIndex;
}

/**
 * Check if a rating is less restrictive than another
 */
export function isLessRestrictive(
  newRating: ContentRating,
  oldRating: ContentRating
): boolean {
  const newIndex = RATING_ORDER.indexOf(newRating);
  const oldIndex = RATING_ORDER.indexOf(oldRating);
  return newIndex > oldIndex;
}

/**
 * Validate that a string is a valid content rating
 */
export function isValidRating(rating: string): rating is ContentRating {
  return RATING_ORDER.includes(rating as ContentRating);
}

/**
 * Get all available content ratings
 */
export function getAllRatings(): ContentRating[] {
  return [...RATING_ORDER];
}

/**
 * Get rating display info for UI
 */
export function getRatingDisplayInfo(rating: ContentRating): {
  label: string;
  description: string;
  warning?: string;
} {
  const displayInfo: Record<
    ContentRating,
    { label: string; description: string; warning?: string }
  > = {
    harsh: {
      label: "Harsh",
      description: "Strictly platonic, all-ages appropriate",
    },
    strict: {
      label: "Strict",
      description: "Romantic allowed, but nothing sexual",
    },
    normal: {
      label: "Normal",
      description: "Natural progression, tasteful mature themes",
    },
    relaxed: {
      label: "Relaxed",
      description: "Adult content, explicit allowed",
    },
    none: {
      label: "None",
      description: "No restrictions",
      warning: "Explicit content warning",
    },
  };

  return displayInfo[rating];
}

// ============================================================================
// Default Export
// ============================================================================

export default {
  getGuardrailConfig,
  getPlayerContentRating,
  setPlayerContentRating,
  getPlayerGuardrails,
  shouldShowContent,
  buildGuardrailAddendum,
  buildVisibilityWhereClause,
  filterContentByRating,
  isMoreRestrictive,
  isLessRestrictive,
  isValidRating,
  getAllRatings,
  getRatingDisplayInfo,
  GUARDRAIL_CONFIGS,
};
