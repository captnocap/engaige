// Test script for NPC personality and message formatting system

import { formatMessageForNPC } from './src/services/message-formatter.js';
import { applyPersonalityPreset, PERSONALITY_PRESETS } from './src/services/npc-personality.js';

console.log('=== NPC Personality System Test ===\n');

const testMessage = "Hey! I'm so glad you asked about that. I've been thinking about this a lot lately and I really want to share my thoughts with you. We should totally do something fun this weekend. What do you think?";

console.log('Original message:', testMessage);
console.log('\n' + '='.repeat(80) + '\n');

// Test each personality preset
for (const [presetName, _] of Object.entries(PERSONALITY_PRESETS)) {
  console.log(`\n📝 ${presetName.toUpperCase().replace(/_/g, ' ')}:\n`);

  const personality = applyPersonalityPreset(presetName as keyof typeof PERSONALITY_PRESETS);

  const formatted = formatMessageForNPC(
    testMessage,
    personality.communication_quirks,
    personality.message_patterns
  );

  console.log(`Message parts: ${formatted.parts.length}`);
  console.log(`Total delay: ${formatted.total_delay}s`);
  console.log(`\nDelivery sequence:`);

  let cumulativeTime = 0;
  for (let i = 0; i < formatted.parts.length; i++) {
    console.log(`  [+${formatted.delays[i]}s] "${formatted.parts[i]}"`);
    cumulativeTime += formatted.delays[i];
  }

  console.log(`\nBehavior:`);
  console.log(`  - Posts freely: ${personality.behavior_flags.is_enabled_to_post_freely}`);
  console.log(`  - Initiates convos: ${personality.behavior_flags.can_initiate_conversations}`);
  console.log(`  - Multi-message: ${personality.message_patterns.multi_message_sender}`);
  console.log(`  - Typing speed: ${personality.message_patterns.typing_speed} chars/sec`);
  console.log(`  - Avg delay: ${personality.message_patterns.average_response_delay_seconds}s`);

  console.log('\n' + '-'.repeat(80));
}

console.log('\n=== Personality System Test Complete ===');
