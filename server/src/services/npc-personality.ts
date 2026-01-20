// NPC Personality, Behavior, and Communication Style System

export interface BehaviorFlags {
  is_enabled_to_post_freely: boolean;
  can_initiate_conversations: boolean;
  can_send_images: boolean;
  can_request_images: boolean;
  is_active_hours_aware: boolean;
  can_like_posts: boolean;
  can_comment_on_posts: boolean;
  will_share_posts: boolean;
}

export interface TopicInterests {
  // Social & Lifestyle (0-1 intensity)
  dating?: number;
  relationships?: number;
  gossip?: number;
  social_life?: number;
  parties?: number;

  // Intellectual
  science?: number;
  technology?: number;
  philosophy?: number;
  religion?: number;
  politics?: number;
  history?: number;

  // Creative & Arts
  art?: number;
  music?: number;
  photography?: number;
  writing?: number;
  movies?: number;
  tv_shows?: number;

  // Hobbies & Activities
  sports?: number;
  fitness?: number;
  gaming?: number;
  cooking?: number;
  travel?: number;
  fashion?: number;

  // Personal Growth
  self_improvement?: number;
  mental_health?: number;
  spirituality?: number;

  // Other
  memes?: number;
  internet_culture?: number;
  current_events?: number;
}

export interface CommunicationQuirks {
  // Verbosity: how much they write (0 = very short, 1 = very long)
  verbosity: number; // 0-1

  // Sarcasm level (0 = none, 1 = very sarcastic)
  sarcasm: number; // 0-1

  // Pessimism vs Optimism (-1 = pessimistic, 0 = neutral, 1 = optimistic)
  outlook: number; // -1 to 1

  // Formality (0 = very casual, 1 = very formal)
  formality: number; // 0-1

  // Emoji usage (0 = never, 1 = every message)
  emoji_usage: number; // 0-1

  // Typo frequency (0 = perfect, 1 = lots of typos)
  typo_frequency: number; // 0-1

  // Punctuation style
  uses_periods: boolean;
  uses_ellipsis: boolean;
  uses_exclamation: boolean;
  uses_question_marks: boolean;
  uses_all_caps: boolean;

  // Other quirks
  uses_abbreviations: boolean; // "u", "r", "lol", "omg"
  uses_internet_slang: boolean; // "fr", "ngl", "tbh"
}

export interface MessagePatterns {
  // Multi-message sender (sends 4 rapid messages vs 1 long)
  multi_message_sender: boolean;
  messages_per_thought: number; // 1-5

  // Typing speed (characters per second)
  typing_speed: number; // 10-60

  // Average response delay (seconds)
  // Includes "realistic" thinking time before typing
  average_response_delay_seconds: number; // 5-300

  // Response delay variance (randomness)
  response_delay_variance: number; // 0-1

  // Reading behavior
  reads_immediately: boolean; // Or waits to read
  average_read_delay_seconds?: number; // If not immediate

  // Voice messages
  uses_voice_messages: boolean;
  voice_message_frequency?: number; // 0-1

  // Activity patterns (if is_active_hours_aware)
  active_hours?: {
    start: number; // 0-23 (hour of day)
    end: number; // 0-23
  };
  timezone?: string; // e.g., "America/New_York"
}

// Default configurations for different archetypes
export const PERSONALITY_PRESETS: Record<string, {
  behavior_flags: Partial<BehaviorFlags>;
  communication_quirks: Partial<CommunicationQuirks>;
  message_patterns: Partial<MessagePatterns>;
}> = {
  // Enthusiastic, active social media user
  social_butterfly: {
    behavior_flags: {
      is_enabled_to_post_freely: true,
      can_initiate_conversations: true,
      can_send_images: true,
      can_like_posts: true,
      can_comment_on_posts: true,
    },
    communication_quirks: {
      verbosity: 0.6,
      emoji_usage: 0.8,
      outlook: 0.7,
      formality: 0.2,
      uses_exclamation: true,
      uses_internet_slang: true,
    },
    message_patterns: {
      multi_message_sender: true,
      messages_per_thought: 3,
      typing_speed: 45,
      average_response_delay_seconds: 30,
      reads_immediately: true,
    },
  },

  // Reserved, thoughtful communicator
  introvert: {
    behavior_flags: {
      is_enabled_to_post_freely: false,
      can_initiate_conversations: false,
      can_send_images: false,
      can_like_posts: true,
      can_comment_on_posts: false,
    },
    communication_quirks: {
      verbosity: 0.4,
      emoji_usage: 0.2,
      outlook: 0.0,
      formality: 0.6,
      uses_periods: true,
      uses_ellipsis: true,
    },
    message_patterns: {
      multi_message_sender: false,
      messages_per_thought: 1,
      typing_speed: 25,
      average_response_delay_seconds: 180,
      reads_immediately: false,
      average_read_delay_seconds: 300,
    },
  },

  // Chaotic, fun energy
  chaotic_fun: {
    behavior_flags: {
      is_enabled_to_post_freely: true,
      can_initiate_conversations: true,
      can_send_images: true,
      can_request_images: true,
    },
    communication_quirks: {
      verbosity: 0.3,
      emoji_usage: 0.9,
      sarcasm: 0.6,
      outlook: 0.8,
      formality: 0.1,
      uses_all_caps: true,
      uses_abbreviations: true,
      typo_frequency: 0.3,
    },
    message_patterns: {
      multi_message_sender: true,
      messages_per_thought: 5,
      typing_speed: 60,
      average_response_delay_seconds: 15,
      reads_immediately: true,
    },
  },

  // Professional, measured responses
  professional: {
    behavior_flags: {
      is_enabled_to_post_freely: false,
      can_initiate_conversations: false,
      can_send_images: false,
    },
    communication_quirks: {
      verbosity: 0.7,
      emoji_usage: 0.1,
      sarcasm: 0.1,
      outlook: 0.3,
      formality: 0.9,
      uses_periods: true,
      uses_question_marks: true,
    },
    message_patterns: {
      multi_message_sender: false,
      messages_per_thought: 1,
      typing_speed: 30,
      average_response_delay_seconds: 120,
      reads_immediately: false,
      active_hours: { start: 9, end: 17 },
    },
  },

  // Flirty, playful
  flirty: {
    behavior_flags: {
      is_enabled_to_post_freely: true,
      can_initiate_conversations: true,
      can_send_images: true,
      can_request_images: true,
    },
    communication_quirks: {
      verbosity: 0.5,
      emoji_usage: 0.7,
      sarcasm: 0.4,
      outlook: 0.6,
      formality: 0.3,
      uses_ellipsis: true,
      uses_question_marks: true,
    },
    message_patterns: {
      multi_message_sender: true,
      messages_per_thought: 2,
      typing_speed: 40,
      average_response_delay_seconds: 45,
      reads_immediately: true,
    },
  },
};

// Get default behavior flags
export function getDefaultBehaviorFlags(): BehaviorFlags {
  return {
    is_enabled_to_post_freely: true,
    can_initiate_conversations: true,
    can_send_images: true,
    can_request_images: false,
    is_active_hours_aware: false,
    can_like_posts: true,
    can_comment_on_posts: true,
    will_share_posts: false,
  };
}

// Get default communication quirks
export function getDefaultCommunicationQuirks(): CommunicationQuirks {
  return {
    verbosity: 0.5,
    sarcasm: 0.2,
    outlook: 0.3,
    formality: 0.4,
    emoji_usage: 0.5,
    typo_frequency: 0.1,
    uses_periods: true,
    uses_ellipsis: false,
    uses_exclamation: true,
    uses_question_marks: true,
    uses_all_caps: false,
    uses_abbreviations: true,
    uses_internet_slang: true,
  };
}

// Get default message patterns
export function getDefaultMessagePatterns(): MessagePatterns {
  return {
    multi_message_sender: false,
    messages_per_thought: 1,
    typing_speed: 35,
    average_response_delay_seconds: 60,
    response_delay_variance: 0.3,
    reads_immediately: true,
    uses_voice_messages: false,
  };
}

// Calculate response delay based on message length and patterns
export function calculateResponseDelay(
  messageLength: number,
  patterns: MessagePatterns
): number {
  // Base delay
  let delay = patterns.average_response_delay_seconds;

  // Add typing time (message length / typing speed)
  const typingTime = messageLength / patterns.typing_speed;
  delay += typingTime;

  // Add variance (randomness for realism)
  const variance = delay * patterns.response_delay_variance;
  const randomVariance = (Math.random() - 0.5) * 2 * variance;
  delay += randomVariance;

  // Minimum 2 seconds (realistic minimum)
  return Math.max(2, Math.floor(delay));
}

// Check if NPC is currently active (based on hours)
export function isNPCActive(
  patterns: MessagePatterns,
  currentTime: Date = new Date()
): boolean {
  if (!patterns.active_hours) {
    return true; // Always active if no hours set
  }

  const hour = currentTime.getHours();
  const { start, end } = patterns.active_hours;

  if (start <= end) {
    // Normal range (e.g., 9-17)
    return hour >= start && hour < end;
  } else {
    // Overnight range (e.g., 22-6)
    return hour >= start || hour < end;
  }
}

// Apply personality preset to NPC
export function applyPersonalityPreset(
  presetName: keyof typeof PERSONALITY_PRESETS
): {
  behavior_flags: BehaviorFlags;
  communication_quirks: CommunicationQuirks;
  message_patterns: MessagePatterns;
} {
  const preset = PERSONALITY_PRESETS[presetName];

  return {
    behavior_flags: { ...getDefaultBehaviorFlags(), ...preset.behavior_flags },
    communication_quirks: { ...getDefaultCommunicationQuirks(), ...preset.communication_quirks },
    message_patterns: { ...getDefaultMessagePatterns(), ...preset.message_patterns },
  };
}

// Generate random topic interests
export function generateRandomTopicInterests(): TopicInterests {
  const topics: (keyof TopicInterests)[] = [
    'dating', 'relationships', 'gossip', 'science', 'technology',
    'art', 'music', 'photography', 'sports', 'fitness',
    'gaming', 'cooking', 'travel', 'fashion', 'memes',
  ];

  const interests: TopicInterests = {};

  // Pick 5-8 random topics and assign intensity
  const numTopics = 5 + Math.floor(Math.random() * 4);
  const selectedTopics = topics.sort(() => Math.random() - 0.5).slice(0, numTopics);

  for (const topic of selectedTopics) {
    // Intensity between 0.3-0.9
    interests[topic] = 0.3 + Math.random() * 0.6;
  }

  return interests;
}

export default {
  getDefaultBehaviorFlags,
  getDefaultCommunicationQuirks,
  getDefaultMessagePatterns,
  calculateResponseDelay,
  isNPCActive,
  applyPersonalityPreset,
  generateRandomTopicInterests,
  PERSONALITY_PRESETS,
};
