/**
 * Drama Post Templates
 *
 * Templates for NPC social media posts based on relationship events.
 * These create the authentic social media drama experience.
 *
 * Usage:
 * - Templates use {placeholders} that get replaced with actual values
 * - Each template has variants for different personality types
 * - Posts can trigger reactions from NPCs who see them
 */

// ============================================================================
// Types
// ============================================================================

export type DramaPostType =
  | 'vague_post'              // Cryptic subtweet
  | 'happy_relationship'      // Showing off relationship
  | 'anniversary'             // Celebrating milestones
  | 'post_breakup'            // After a breakup
  | 'caught_cheating_victim'  // Posted by the person cheated on
  | 'caught_cheating_guilty'  // Posted by the cheater (damage control)
  | 'jealousy'               // Jealous/passive-aggressive
  | 'thirst_trap'            // Attention-seeking after drama
  | 'moving_on'              // "Living my best life" energy
  | 'cryptic_lyrics'         // Song lyrics as subtweeting
  | 'indirect_callout';       // Calling someone out without naming them

export type DramaPersonalityType = 'dramatic' | 'subtle' | 'petty' | 'mature' | 'chaotic';

export interface DramaTemplate {
  type: DramaPostType;
  content: string;
  // Personality types this template fits
  personalityFit: DramaPersonalityType[];
  // How much drama this post causes (0-100)
  dramaLevel: number;
  // Platform this template works best on
  preferredPlatforms: ('myface' | 'chirp' | 'instasnap')[];
}

export interface CommentTemplate {
  type: 'supportive' | 'curious' | 'shady' | 'concerned' | 'oblivious' | 'knowing';
  content: string;
  // When to use this comment (what post types trigger it)
  triggerPostTypes: DramaPostType[];
}

// ============================================================================
// Post Templates
// ============================================================================

export const DRAMA_POST_TEMPLATES: DramaTemplate[] = [
  // --------------------------------------------------------------------------
  // Vague Posts (cryptic subtweeting)
  // --------------------------------------------------------------------------
  {
    type: 'vague_post',
    content: 'some people really show their true colors...',
    personalityFit: ['dramatic', 'petty'],
    dramaLevel: 50,
    preferredPlatforms: ['myface', 'chirp'],
  },
  {
    type: 'vague_post',
    content: "can't trust anyone these days 🙃",
    personalityFit: ['dramatic', 'subtle'],
    dramaLevel: 40,
    preferredPlatforms: ['chirp', 'myface'],
  },
  {
    type: 'vague_post',
    content: 'funny how things change',
    personalityFit: ['subtle', 'mature'],
    dramaLevel: 30,
    preferredPlatforms: ['myface'],
  },
  {
    type: 'vague_post',
    content: 'thought i knew someone but i guess not',
    personalityFit: ['dramatic', 'subtle'],
    dramaLevel: 45,
    preferredPlatforms: ['myface', 'chirp'],
  },
  {
    type: 'vague_post',
    content: 'actions speak louder than words... and wow were those actions LOUD 😤',
    personalityFit: ['dramatic', 'petty', 'chaotic'],
    dramaLevel: 70,
    preferredPlatforms: ['chirp', 'myface'],
  },
  {
    type: 'vague_post',
    content: 'lol ok then',
    personalityFit: ['subtle', 'petty'],
    dramaLevel: 35,
    preferredPlatforms: ['chirp'],
  },
  {
    type: 'vague_post',
    content: 'the trash takes itself out i guess 🗑️',
    personalityFit: ['petty', 'chaotic'],
    dramaLevel: 60,
    preferredPlatforms: ['chirp', 'myface'],
  },
  {
    type: 'vague_post',
    content: "if you know you know... and if you don't, mind your business 🤭",
    personalityFit: ['petty', 'dramatic'],
    dramaLevel: 55,
    preferredPlatforms: ['myface', 'chirp'],
  },

  // --------------------------------------------------------------------------
  // Happy Relationship Posts
  // --------------------------------------------------------------------------
  {
    type: 'happy_relationship',
    content: 'feeling so lucky rn 🥰',
    personalityFit: ['subtle', 'mature'],
    dramaLevel: 10,
    preferredPlatforms: ['instasnap', 'myface'],
  },
  {
    type: 'happy_relationship',
    content: 'best {timePeriod} of my life ❤️',
    personalityFit: ['dramatic', 'subtle'],
    dramaLevel: 15,
    preferredPlatforms: ['instasnap', 'myface'],
  },
  {
    type: 'happy_relationship',
    content: 'when you know, you know ✨',
    personalityFit: ['subtle', 'mature'],
    dramaLevel: 10,
    preferredPlatforms: ['instasnap'],
  },
  {
    type: 'happy_relationship',
    content: "can't believe this is my life 😍 {partnerName} you make everything better",
    personalityFit: ['dramatic', 'chaotic'],
    dramaLevel: 20,
    preferredPlatforms: ['myface', 'instasnap'],
  },
  {
    type: 'happy_relationship',
    content: 'he/she surprised me again 😭💕 i love my person so much',
    personalityFit: ['dramatic'],
    dramaLevel: 25,
    preferredPlatforms: ['myface', 'instasnap'],
  },

  // --------------------------------------------------------------------------
  // Anniversary Posts
  // --------------------------------------------------------------------------
  {
    type: 'anniversary',
    content: '{months} months with my favorite person 🥹💕',
    personalityFit: ['subtle', 'dramatic'],
    dramaLevel: 15,
    preferredPlatforms: ['instasnap', 'myface'],
  },
  {
    type: 'anniversary',
    content: "another month down, forever to go ❤️ love you {partnerName}",
    personalityFit: ['dramatic', 'mature'],
    dramaLevel: 20,
    preferredPlatforms: ['myface', 'instasnap'],
  },

  // --------------------------------------------------------------------------
  // Post-Breakup Posts
  // --------------------------------------------------------------------------
  {
    type: 'post_breakup',
    content: 'single and ready to mingle 😏',
    personalityFit: ['chaotic', 'petty'],
    dramaLevel: 40,
    preferredPlatforms: ['chirp', 'myface'],
  },
  {
    type: 'post_breakup',
    content: 'focusing on myself rn ✨',
    personalityFit: ['mature', 'subtle'],
    dramaLevel: 20,
    preferredPlatforms: ['instasnap', 'myface'],
  },
  {
    type: 'post_breakup',
    content: 'new chapter, who dis 💅',
    personalityFit: ['chaotic', 'petty'],
    dramaLevel: 45,
    preferredPlatforms: ['chirp', 'myface'],
  },
  {
    type: 'post_breakup',
    content: 'sometimes things just dont work out and thats okay',
    personalityFit: ['mature', 'subtle'],
    dramaLevel: 15,
    preferredPlatforms: ['myface'],
  },
  {
    type: 'post_breakup',
    content: "dodged a bullet honestly... my friends tried to tell me but i didn't listen 😅",
    personalityFit: ['petty', 'chaotic'],
    dramaLevel: 65,
    preferredPlatforms: ['chirp', 'myface'],
  },
  {
    type: 'post_breakup',
    content: 'healing era activated 🦋',
    personalityFit: ['subtle', 'mature'],
    dramaLevel: 20,
    preferredPlatforms: ['instasnap'],
  },

  // --------------------------------------------------------------------------
  // Caught Cheating - Victim Posts
  // --------------------------------------------------------------------------
  {
    type: 'caught_cheating_victim',
    content: 'YALL. I CANT EVEN.',
    personalityFit: ['dramatic', 'chaotic'],
    dramaLevel: 90,
    preferredPlatforms: ['chirp', 'myface'],
  },
  {
    type: 'caught_cheating_victim',
    content: "men/women ain't sh*t fr",
    personalityFit: ['petty', 'chaotic'],
    dramaLevel: 75,
    preferredPlatforms: ['chirp'],
  },
  {
    type: 'caught_cheating_victim',
    content: 'screenshot this @{cheaterUsername} 📸',
    personalityFit: ['petty', 'chaotic', 'dramatic'],
    dramaLevel: 100,
    preferredPlatforms: ['chirp', 'myface'],
  },
  {
    type: 'caught_cheating_victim',
    content: "{years} years... down the drain... for WHAT",
    personalityFit: ['dramatic'],
    dramaLevel: 85,
    preferredPlatforms: ['myface', 'chirp'],
  },
  {
    type: 'caught_cheating_victim',
    content: 'lmaooo some of yall have been in my DMs asking what happened... check the comments ☕',
    personalityFit: ['petty', 'chaotic'],
    dramaLevel: 95,
    preferredPlatforms: ['myface', 'chirp'],
  },

  // --------------------------------------------------------------------------
  // Caught Cheating - Guilty Party Posts (damage control)
  // --------------------------------------------------------------------------
  {
    type: 'caught_cheating_guilty',
    content: "people make mistakes... i'm not perfect",
    personalityFit: ['subtle', 'mature'],
    dramaLevel: 30,
    preferredPlatforms: ['myface'],
  },
  {
    type: 'caught_cheating_guilty',
    content: "there's two sides to every story 🤷",
    personalityFit: ['petty', 'subtle'],
    dramaLevel: 50,
    preferredPlatforms: ['chirp', 'myface'],
  },
  {
    type: 'caught_cheating_guilty',
    content: 'not gonna explain myself to the internet... the people who matter know the truth',
    personalityFit: ['mature', 'subtle'],
    dramaLevel: 40,
    preferredPlatforms: ['myface'],
  },

  // --------------------------------------------------------------------------
  // Jealousy Posts
  // --------------------------------------------------------------------------
  {
    type: 'jealousy',
    content: "i see how it is... 👀",
    personalityFit: ['petty', 'subtle'],
    dramaLevel: 45,
    preferredPlatforms: ['chirp', 'myface'],
  },
  {
    type: 'jealousy',
    content: "must be nice to have so much free time to be in everyone's business 🙄",
    personalityFit: ['petty', 'dramatic'],
    dramaLevel: 55,
    preferredPlatforms: ['chirp', 'myface'],
  },
  {
    type: 'jealousy',
    content: 'some people really cant stand to see others happy huh',
    personalityFit: ['petty', 'dramatic'],
    dramaLevel: 50,
    preferredPlatforms: ['myface', 'chirp'],
  },

  // --------------------------------------------------------------------------
  // Thirst Traps (attention-seeking after drama)
  // --------------------------------------------------------------------------
  {
    type: 'thirst_trap',
    content: 'new fit who dis 😏✨',
    personalityFit: ['chaotic', 'petty'],
    dramaLevel: 35,
    preferredPlatforms: ['instasnap', 'myface'],
  },
  {
    type: 'thirst_trap',
    content: "they don't know what they're missing 💅",
    personalityFit: ['petty', 'chaotic'],
    dramaLevel: 55,
    preferredPlatforms: ['instasnap'],
  },
  {
    type: 'thirst_trap',
    content: 'their loss honestly 😌',
    personalityFit: ['petty', 'chaotic'],
    dramaLevel: 45,
    preferredPlatforms: ['instasnap', 'myface'],
  },

  // --------------------------------------------------------------------------
  // Moving On Posts
  // --------------------------------------------------------------------------
  {
    type: 'moving_on',
    content: 'life is too short for negativity ✨ grateful for the lessons',
    personalityFit: ['mature', 'subtle'],
    dramaLevel: 15,
    preferredPlatforms: ['instasnap', 'myface'],
  },
  {
    type: 'moving_on',
    content: "closing this chapter for good. excited for what's next 🚪✨",
    personalityFit: ['mature', 'subtle'],
    dramaLevel: 20,
    preferredPlatforms: ['myface'],
  },
  {
    type: 'moving_on',
    content: 'upgrade season 📈',
    personalityFit: ['petty', 'chaotic'],
    dramaLevel: 40,
    preferredPlatforms: ['chirp', 'instasnap'],
  },

  // --------------------------------------------------------------------------
  // Cryptic Lyrics
  // --------------------------------------------------------------------------
  {
    type: 'cryptic_lyrics',
    content: '"we are never ever getting back together" - taylor swift',
    personalityFit: ['dramatic', 'petty'],
    dramaLevel: 55,
    preferredPlatforms: ['myface', 'chirp'],
  },
  {
    type: 'cryptic_lyrics',
    content: '"thank u, next" 💅',
    personalityFit: ['petty', 'chaotic'],
    dramaLevel: 50,
    preferredPlatforms: ['chirp'],
  },
  {
    type: 'cryptic_lyrics',
    content: '"should have said no" hits different rn...',
    personalityFit: ['dramatic', 'subtle'],
    dramaLevel: 45,
    preferredPlatforms: ['myface'],
  },

  // --------------------------------------------------------------------------
  // Indirect Callouts
  // --------------------------------------------------------------------------
  {
    type: 'indirect_callout',
    content: "SOME PEOPLE need to learn what loyalty means... you know who you are 👀",
    personalityFit: ['dramatic', 'petty', 'chaotic'],
    dramaLevel: 80,
    preferredPlatforms: ['chirp', 'myface'],
  },
  {
    type: 'indirect_callout',
    content: 'imagine thinking nobody would find out 🤡',
    personalityFit: ['petty', 'chaotic'],
    dramaLevel: 85,
    preferredPlatforms: ['chirp'],
  },
  {
    type: 'indirect_callout',
    content: "weird how some people switch up when they think no one's watching",
    personalityFit: ['petty', 'subtle'],
    dramaLevel: 60,
    preferredPlatforms: ['myface', 'chirp'],
  },
];

// ============================================================================
// Comment Templates (NPC reactions to drama posts)
// ============================================================================

export const COMMENT_TEMPLATES: CommentTemplate[] = [
  // Supportive
  {
    type: 'supportive',
    content: 'u deserve better babe ❤️',
    triggerPostTypes: ['vague_post', 'post_breakup', 'caught_cheating_victim'],
  },
  {
    type: 'supportive',
    content: 'sending love 💕',
    triggerPostTypes: ['vague_post', 'post_breakup'],
  },
  {
    type: 'supportive',
    content: "their loss honestly!! you're amazing",
    triggerPostTypes: ['post_breakup', 'moving_on', 'thirst_trap'],
  },
  {
    type: 'supportive',
    content: 'YES QUEEN 👑',
    triggerPostTypes: ['thirst_trap', 'moving_on', 'post_breakup'],
  },
  {
    type: 'supportive',
    content: 'dm me if u need to talk ❤️',
    triggerPostTypes: ['vague_post', 'post_breakup', 'caught_cheating_victim'],
  },

  // Curious (wants the tea)
  {
    type: 'curious',
    content: 'wait what happened?? 👀',
    triggerPostTypes: ['vague_post', 'caught_cheating_victim', 'indirect_callout'],
  },
  {
    type: 'curious',
    content: 'omg spill ☕',
    triggerPostTypes: ['vague_post', 'indirect_callout', 'caught_cheating_victim'],
  },
  {
    type: 'curious',
    content: 'tea??? 🍵',
    triggerPostTypes: ['vague_post', 'indirect_callout'],
  },
  {
    type: 'curious',
    content: 'WAIT WHAT',
    triggerPostTypes: ['caught_cheating_victim', 'indirect_callout'],
  },

  // Shady (stirring the pot)
  {
    type: 'shady',
    content: '👀',
    triggerPostTypes: ['vague_post', 'happy_relationship', 'thirst_trap'],
  },
  {
    type: 'shady',
    content: 'interesting timing on this post...',
    triggerPostTypes: ['happy_relationship', 'moving_on', 'thirst_trap'],
  },
  {
    type: 'shady',
    content: '☕',
    triggerPostTypes: ['vague_post', 'caught_cheating_guilty'],
  },
  {
    type: 'shady',
    content: 'i know something you dont know 🤭',
    triggerPostTypes: ['happy_relationship'],
  },

  // Concerned
  {
    type: 'concerned',
    content: 'you okay? 🥺',
    triggerPostTypes: ['vague_post', 'cryptic_lyrics'],
  },
  {
    type: 'concerned',
    content: 'is everything alright??',
    triggerPostTypes: ['vague_post', 'cryptic_lyrics', 'post_breakup'],
  },

  // Oblivious (commenting on something they don't understand)
  {
    type: 'oblivious',
    content: 'cute pic! 😊',
    triggerPostTypes: ['thirst_trap'],
  },
  {
    type: 'oblivious',
    content: 'aww you guys are so cute!!',
    triggerPostTypes: ['happy_relationship', 'anniversary'],
  },

  // Knowing (they know about the secret/affair)
  {
    type: 'knowing',
    content: '...👀',
    triggerPostTypes: ['happy_relationship', 'vague_post'],
  },
  {
    type: 'knowing',
    content: 'if only they knew lol',
    triggerPostTypes: ['happy_relationship'],
  },
  {
    type: 'knowing',
    content: 'karma is a thing... just saying',
    triggerPostTypes: ['caught_cheating_guilty', 'moving_on'],
  },
];

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get a random template for a given drama type
 */
export function getRandomTemplate(
  type: DramaPostType,
  personality?: DramaPersonalityType[]
): DramaTemplate | undefined {
  let templates = DRAMA_POST_TEMPLATES.filter(t => t.type === type);

  // Filter by personality if provided
  if (personality && personality.length > 0) {
    const personalityMatches = templates.filter(t =>
      t.personalityFit.some(pf => personality.includes(pf))
    );
    if (personalityMatches.length > 0) {
      templates = personalityMatches;
    }
  }

  if (templates.length === 0) return undefined;
  return templates[Math.floor(Math.random() * templates.length)];
}

/**
 * Get possible comment templates for a post type
 */
export function getCommentTemplates(
  postType: DramaPostType,
  commentType?: CommentTemplate['type']
): CommentTemplate[] {
  let templates = COMMENT_TEMPLATES.filter(t =>
    t.triggerPostTypes.includes(postType)
  );

  if (commentType) {
    templates = templates.filter(t => t.type === commentType);
  }

  return templates;
}

/**
 * Replace placeholders in a template
 */
export function fillTemplate(
  template: string,
  values: Record<string, string | number>
): string {
  let result = template;
  for (const [key, value] of Object.entries(values)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
  }
  return result;
}

/**
 * Get templates appropriate for a platform
 */
export function getTemplatesForPlatform(
  platform: string,
  type?: DramaPostType
): DramaTemplate[] {
  let templates = DRAMA_POST_TEMPLATES.filter(t =>
    t.preferredPlatforms.includes(platform as any)
  );

  if (type) {
    templates = templates.filter(t => t.type === type);
  }

  return templates;
}
