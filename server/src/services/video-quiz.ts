/**
 * Video Quiz Definitions
 *
 * 5-question quiz that NPCs answer to generate GenArt video configs.
 * Each question has 4-5 options that map to specific visual parameters.
 */

// ============================================================================
// Quiz Types
// ============================================================================

export interface QuizOption {
  id: string;
  label: string;
  description: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
}

export interface QuizAnswers {
  mood: 'contemplative' | 'joyful' | 'intense' | 'chaotic' | 'melancholic';
  aesthetic: 'cosmic' | 'organic' | 'geometric' | 'terrain' | 'digital';
  intensity: 'whisper' | 'conversation' | 'shout' | 'scream';
  texture: 'smooth' | 'gritty' | 'crystalline' | 'hazy';
  temperature: 'warm' | 'cool' | 'neutral' | 'shifting';
}

// ============================================================================
// Quiz Questions
// ============================================================================

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'mood',
    question: 'What energy are you channeling right now?',
    options: [
      { id: 'contemplative', label: 'Contemplative', description: 'Reflective, still, thoughtful' },
      { id: 'joyful', label: 'Joyful', description: 'Happy, warm, uplifting' },
      { id: 'intense', label: 'Intense', description: 'Focused, powerful, driven' },
      { id: 'chaotic', label: 'Chaotic', description: 'Wild, unhinged, explosive' },
      { id: 'melancholic', label: 'Melancholic', description: 'Sad, wistful, longing' },
    ],
  },
  {
    id: 'aesthetic',
    question: 'What visual world speaks to you?',
    options: [
      { id: 'cosmic', label: 'Cosmic', description: 'Stars, nebulae, deep space' },
      { id: 'organic', label: 'Organic', description: 'Growth, nature, flowing' },
      { id: 'geometric', label: 'Geometric', description: 'Patterns, symmetry, math' },
      { id: 'terrain', label: 'Terrain', description: 'Landscapes, topography, earth' },
      { id: 'digital', label: 'Digital', description: 'Glitch, 3D, synthetic' },
    ],
  },
  {
    id: 'intensity',
    question: 'How loud should this feel?',
    options: [
      { id: 'whisper', label: 'Whisper', description: 'Barely there, minimal' },
      { id: 'conversation', label: 'Conversation', description: 'Moderate, comfortable' },
      { id: 'shout', label: 'Shout', description: 'Loud, attention-grabbing' },
      { id: 'scream', label: 'Scream', description: 'Maximum volume, overwhelming' },
    ],
  },
  {
    id: 'texture',
    question: 'What surface quality?',
    options: [
      { id: 'smooth', label: 'Smooth', description: 'Long trails, flowing' },
      { id: 'gritty', label: 'Gritty', description: 'Raw, rough, noisy' },
      { id: 'crystalline', label: 'Crystalline', description: 'Sharp, clear, precise' },
      { id: 'hazy', label: 'Hazy', description: 'Soft, dreamy, blurred' },
    ],
  },
  {
    id: 'temperature',
    question: 'What color temperature?',
    options: [
      { id: 'warm', label: 'Warm', description: 'Reds, oranges, yellows' },
      { id: 'cool', label: 'Cool', description: 'Blues, cyans, purples' },
      { id: 'neutral', label: 'Neutral', description: 'Greens, teals, balanced' },
      { id: 'shifting', label: 'Shifting', description: 'Constantly changing hues' },
    ],
  },
];

// ============================================================================
// AI Prompt for Quiz
// ============================================================================

export const QUIZ_PROMPT_INSTRUCTIONS = `
## Video Creation Guide (Quiz Format)

Instead of picking style presets, answer these 5 questions about your current mood and aesthetic preference. Your answers will be used to generate a unique visual.

### Question 1 - Mood (what energy are you channeling?):
- contemplative: Reflective, still, thoughtful
- joyful: Happy, warm, uplifting
- intense: Focused, powerful, driven
- chaotic: Wild, unhinged, explosive
- melancholic: Sad, wistful, longing

### Question 2 - Aesthetic (what visual world?):
- cosmic: Stars, nebulae, deep space
- organic: Growth, nature, flowing
- geometric: Patterns, symmetry, math
- terrain: Landscapes, topography, earth
- digital: Glitch, 3D, synthetic

### Question 3 - Intensity (how loud?):
- whisper: Barely there, minimal
- conversation: Moderate, comfortable
- shout: Loud, attention-grabbing
- scream: Maximum volume, overwhelming

### Question 4 - Texture (surface quality?):
- smooth: Long trails, flowing
- gritty: Raw, rough, noisy
- crystalline: Sharp, clear, precise
- hazy: Soft, dreamy, blurred

### Question 5 - Temperature (color temperature?):
- warm: Reds, oranges, yellows
- cool: Blues, cyans, purples
- neutral: Greens, teals, balanced
- shifting: Constantly changing hues

### Output Format:
\`\`\`json
{
  "mood": "intense",
  "aesthetic": "geometric",
  "intensity": "shout",
  "texture": "gritty",
  "temperature": "warm",
  "text": [
    { "text": "can't stop thinking about it", "start": 0, "position": "center", "effect": "slam" },
    { "text": "it's consuming me", "start": 2, "position": "bottom", "effect": "shake" }
  ]
}
\`\`\`

### Text Effects Available:
fade_in, typewriter, word_by_word, slam, bounce, slide_up, slide_down, zoom_in, zoom_out, shake, pulse, rainbow, glitch, float
`;
