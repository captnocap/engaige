// Message formatting and delivery based on NPC personality

import type { CommunicationQuirks, MessagePatterns } from './npc-personality.js';
import { calculateResponseDelay } from './npc-personality.js';

export interface FormattedMessage {
  parts: string[];
  delays: number[]; // Delay before each part (in seconds)
  total_delay: number;
}

// Break a message into multiple parts based on personality
export function formatMessageForNPC(
  rawMessage: string,
  quirks: CommunicationQuirks,
  patterns: MessagePatterns
): FormattedMessage {
  let message = rawMessage;

  // Apply quirks to the message
  message = applyQuirks(message, quirks);

  // Break into parts if multi-message sender
  const parts = patterns.multi_message_sender
    ? breakIntoMultipleMessages(message, patterns.messages_per_thought)
    : [message];

  // Calculate delays between parts
  const delays: number[] = [];
  let totalDelay = 0;

  for (let i = 0; i < parts.length; i++) {
    if (i === 0) {
      // First message: full response delay
      const delay = calculateResponseDelay(parts[i].length, patterns);
      delays.push(delay);
      totalDelay += delay;
    } else {
      // Subsequent messages: shorter delay (typing only)
      const typingDelay = parts[i].length / patterns.typing_speed;
      const delay = Math.max(1, Math.floor(typingDelay + Math.random() * 2));
      delays.push(delay);
      totalDelay += delay;
    }
  }

  return {
    parts,
    delays,
    total_delay: totalDelay,
  };
}

// Break a message into multiple parts (simulates sending multiple texts)
function breakIntoMultipleMessages(message: string, messagesPerThought: number): string[] {
  // Split on natural breakpoints
  const sentences = message.split(/([.!?]+\s+)/).filter(s => s.trim());

  if (sentences.length <= 1) {
    return [message]; // Can't break it up
  }

  // Group sentences into parts
  const parts: string[] = [];
  const sentencesPerPart = Math.ceil(sentences.length / messagesPerThought);

  for (let i = 0; i < sentences.length; i += sentencesPerPart * 2) {
    const part = sentences.slice(i, i + sentencesPerPart * 2).join('');
    if (part.trim()) {
      parts.push(part.trim());
    }
  }

  // If we still only have 1 part, try splitting on commas or "and"
  if (parts.length === 1) {
    const chunks = message.split(/,\s+|\s+and\s+/);
    if (chunks.length > 1) {
      const chunksPerPart = Math.ceil(chunks.length / messagesPerThought);
      parts.length = 0;
      for (let i = 0; i < chunks.length; i += chunksPerPart) {
        parts.push(chunks.slice(i, i + chunksPerPart).join(', '));
      }
    }
  }

  return parts.slice(0, messagesPerThought);
}

// Apply communication quirks to message
function applyQuirks(message: string, quirks: CommunicationQuirks): string {
  let result = message;

  // Add emojis based on emoji_usage
  if (quirks.emoji_usage > 0.3 && Math.random() < quirks.emoji_usage) {
    result = addEmojis(result, quirks.emoji_usage);
  }

  // Add typos based on typo_frequency
  if (quirks.typo_frequency > 0.1) {
    result = addTypos(result, quirks.typo_frequency);
  }

  // Convert to abbreviations
  if (quirks.uses_abbreviations) {
    result = convertToAbbreviations(result);
  }

  // Add internet slang
  if (quirks.uses_internet_slang && Math.random() < 0.4) {
    result = addInternetSlang(result);
  }

  // Apply punctuation style
  if (!quirks.uses_periods) {
    result = result.replace(/\.+$/g, '');
  }

  if (quirks.uses_ellipsis && Math.random() < 0.3) {
    result = result.replace(/\.\s/g, '... ');
  }

  if (quirks.uses_all_caps && Math.random() < 0.2) {
    // Make random word all caps for emphasis
    const words = result.split(' ');
    const randomIndex = Math.floor(Math.random() * words.length);
    words[randomIndex] = words[randomIndex].toUpperCase();
    result = words.join(' ');
  }

  return result;
}

// Add emojis to message
function addEmojis(message: string, intensity: number): string {
  const emojis = ['😊', '😂', '❤️', '🔥', '💯', '👍', '😅', '🤔', '💀', '✨', '🙌', '😭', '😍', '🥺', '💕'];

  // Higher intensity = more emojis
  const numEmojis = intensity > 0.7 ? 2 : 1;

  for (let i = 0; i < numEmojis; i++) {
    if (Math.random() < intensity) {
      const emoji = emojis[Math.floor(Math.random() * emojis.length)];
      // Add at end
      message += ` ${emoji}`;
    }
  }

  return message;
}

// Add realistic typos
function addTypos(message: string, frequency: number): string {
  const words = message.split(' ');

  for (let i = 0; i < words.length; i++) {
    if (Math.random() < frequency && words[i].length > 3) {
      // Common typos: swap letters, drop letters, double letters
      const typoType = Math.floor(Math.random() * 3);

      if (typoType === 0 && words[i].length > 2) {
        // Swap two adjacent letters
        const pos = Math.floor(Math.random() * (words[i].length - 1));
        const chars = words[i].split('');
        [chars[pos], chars[pos + 1]] = [chars[pos + 1], chars[pos]];
        words[i] = chars.join('');
      } else if (typoType === 1 && words[i].length > 3) {
        // Drop a letter
        const pos = Math.floor(Math.random() * words[i].length);
        words[i] = words[i].slice(0, pos) + words[i].slice(pos + 1);
      } else if (typoType === 2) {
        // Double a letter
        const pos = Math.floor(Math.random() * words[i].length);
        words[i] = words[i].slice(0, pos + 1) + words[i][pos] + words[i].slice(pos + 1);
      }
    }
  }

  return words.join(' ');
}

// Convert to common abbreviations
function convertToAbbreviations(message: string): string {
  const abbreviations: Record<string, string> = {
    'you': 'u',
    'your': 'ur',
    'you\'re': 'ur',
    'are': 'r',
    'okay': 'ok',
    'because': 'bc',
    'before': 'b4',
    'tonight': '2nite',
    'tomorrow': 'tmrw',
    'please': 'pls',
    'thanks': 'thx',
    'probably': 'prob',
    'people': 'ppl',
    'something': 'smth',
    'someone': 'smone',
  };

  // Only convert some words (not all) for realism
  const words = message.split(' ');
  for (let i = 0; i < words.length; i++) {
    const lower = words[i].toLowerCase();
    if (abbreviations[lower] && Math.random() < 0.4) {
      words[i] = abbreviations[lower];
    }
  }

  return words.join(' ');
}

// Add internet slang
function addInternetSlang(message: string): string {
  const slang = ['fr', 'ngl', 'tbh', 'lol', 'lmao', 'omg', 'lowkey', 'highkey', 'deadass'];
  const selected = slang[Math.floor(Math.random() * slang.length)];

  // Add at beginning or end
  if (Math.random() < 0.5) {
    return `${selected} ${message}`;
  } else {
    return `${message} ${selected}`;
  }
}

// Format message based on verbosity
export function adjustMessageVerbosity(message: string, verbosity: number): string {
  if (verbosity < 0.3) {
    // Very short - keep only essential words
    // "I'm doing great! How about you?" → "good! u?"
    return message.split('.')[0].substring(0, 30);
  } else if (verbosity > 0.7) {
    // Very long - this would ideally expand the response
    // For now, keep as-is (AI model should generate longer based on prompting)
    return message;
  }

  return message;
}

// Simulate typing indicator delay
export interface TypingIndicator {
  show_typing: boolean;
  duration_seconds: number;
}

export function shouldShowTyping(patterns: MessagePatterns): TypingIndicator {
  const delay = patterns.average_response_delay_seconds;

  // Show typing if delay > 10 seconds
  if (delay > 10) {
    return {
      show_typing: true,
      duration_seconds: Math.min(delay * 0.7, 30), // Max 30 seconds typing
    };
  }

  return {
    show_typing: false,
    duration_seconds: 0,
  };
}

export default {
  formatMessageForNPC,
  adjustMessageVerbosity,
  shouldShowTyping,
};
