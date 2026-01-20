// Test script for background agents
// Tests: memory writer, relationship analyzer, profile populator

import { getDB, generateId, now } from './src/db/index.js';
import { initializeMemoryAgent, scheduleMemoryGeneration } from './src/agents/memory-writer.js';
import { initializeRelationshipAnalyzer, scheduleRelationshipAnalysis } from './src/agents/relationship-analyzer.js';
import { initializeProfilePopulator, scheduleProfilePopulation } from './src/agents/profile-populator.js';
import { processTasks, registerTaskHandler } from './src/services/background-scheduler.js';
import { initializeBudget } from './src/services/budget.js';

console.log('=== Background Agents Test ===\n');

// Initialize budget system
initializeBudget({
  overall_limit_cents: 10000, // $100 for testing
  period_type: 'monthly',
  allocations: {
    npc_generation: 3000,
    conversation: 3000,
    autonomous_posts: 2000,
    image_generation: 2000,
  },
});

// Initialize all agents
console.log('Initializing agents...');
initializeMemoryAgent();
initializeRelationshipAnalyzer();
initializeProfilePopulator();

// Create test NPC
const npcDb = getDB('npc');
const gameDb = getDB('game');

const testNPCId = generateId();

console.log('\n=== Creating Test NPC ===');
npcDb.prepare(`
  INSERT INTO npcs (
    id, username, display_name, bio, occupation,
    interests, system_prompt, gender, age,
    personality_traits, created_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`).run(
  testNPCId,
  'alex_test',
  'Alex',
  'An artist living in the city, always up for adventures',
  'Graphic Designer',
  JSON.stringify(['art', 'music', 'design', 'coffee']),
  'You are Alex, a creative graphic designer who loves art and music. You are outgoing, creative, and love music and art.',
  'nonbinary',
  26,
  JSON.stringify({
    personality_style: 'friendly and creative',
  }),
  now()
);

console.log(`✓ Created NPC: Alex (${testNPCId})`);

// Create test player
const testPlayerId = generateId();
const userDb = getDB('user');

userDb.prepare(`
  INSERT OR REPLACE INTO player (id, username, display_name, created_at)
  VALUES (?, ?, ?, ?)
`).run(testPlayerId, 'tester', 'Test Player', now());

console.log(`✓ Created Player: Test Player (${testPlayerId})`);

// Create test conversation
const conversationId = generateId();
gameDb.prepare(`
  INSERT INTO conversations (
    id, npc_id, participant_id, participant_type,
    platform, last_message_at, created_at
  ) VALUES (?, ?, ?, 'player', 'messenger', ?, ?)
`).run(conversationId, testNPCId, testPlayerId, now(), now());

// Add some test messages to the conversation
const messages = [
  { sender: 'player', content: 'Hey Alex! How\'s your art project coming along?' },
  { sender: 'npc', content: 'Hey! It\'s going great, thanks for asking! I\'ve been working on this really cool mural design.' },
  { sender: 'player', content: 'That sounds amazing! I love coffee. Do you have a favorite cafe where you work?' },
  { sender: 'npc', content: 'Oh totally! There\'s this little place called The Bean Scene, I\'m there almost every day. Their lattes are incredible!' },
  { sender: 'player', content: 'We should go together sometime! I\'d love to see your sketches.' },
  { sender: 'npc', content: 'I\'d love that! Let\'s plan for this weekend?' },
];

for (const msg of messages) {
  gameDb.prepare(`
    INSERT INTO messages (
      id, conversation_id, sender_type, content, timestamp
    ) VALUES (?, ?, ?, ?, ?)
  `).run(generateId(), conversationId, msg.sender, msg.content, now());
}

console.log(`✓ Created conversation with ${messages.length} messages\n`);

// Initialize relationship
gameDb.prepare(`
  INSERT INTO player_npc_relationships (
    id, player_id, npc_id, trust_level, affinity, familiarity,
    relationship_stage, last_interaction_at
  ) VALUES (?, ?, ?, 10, 15, 20, 'acquaintance', ?)
`).run(generateId(), testPlayerId, testNPCId, now());

console.log('✓ Initialized relationship stats\n');

// Schedule background tasks
console.log('=== Scheduling Background Tasks ===\n');

// 1. Schedule memory generation (immediate)
const memoryTask = scheduleMemoryGeneration(testNPCId, conversationId, 0);
console.log(`✓ Scheduled memory generation task: ${memoryTask.id}`);

// 2. Schedule relationship analysis (immediate)
const relationshipTask = scheduleRelationshipAnalysis(testNPCId, testPlayerId, conversationId, 0);
console.log(`✓ Scheduled relationship analysis task: ${relationshipTask.id}`);

// 3. Schedule profile population (immediate)
const profileTask = scheduleProfilePopulation(testNPCId, 0);
console.log(`✓ Scheduled profile population task: ${profileTask.id}`);

console.log('\n=== Processing Tasks ===\n');

// Process all tasks
const result = await processTasks(10);

console.log('\n=== Processing Results ===');
console.log(`Processed: ${result.processed}`);
console.log(`Skipped: ${result.skipped}`);
console.log(`Failed: ${result.failed}`);

// Check results
console.log('\n=== Checking Results ===\n');

// 1. Check memories
const memories = gameDb.prepare(`
  SELECT * FROM memories WHERE npc_id = ?
`).all(testNPCId) as any[];

console.log(`Memories created: ${memories.length}`);
for (const memory of memories) {
  console.log(`  - [Importance: ${memory.importance.toFixed(2)}] ${memory.content}`);
}

// 2. Check relationship updates
const relationship = gameDb.prepare(`
  SELECT * FROM player_npc_relationships
  WHERE player_id = ? AND npc_id = ?
`).get(testPlayerId, testNPCId) as any;

if (relationship) {
  console.log(`\nRelationship updated:`);
  console.log(`  - Stage: ${relationship.relationship_stage}`);
  console.log(`  - Trust: ${relationship.trust_level}`);
  console.log(`  - Affinity: ${relationship.affinity}`);
  console.log(`  - Familiarity: ${relationship.familiarity}`);
}

// 3. Check NPC profile
const npc = npcDb.prepare(`SELECT * FROM npcs WHERE id = ?`).get(testNPCId) as any;
const personalityTraits = JSON.parse(npc.personality_traits || '{}');

if (personalityTraits.myspace_profile) {
  console.log(`\nMySpace Profile created:`);
  console.log(`  - Aesthetic: ${personalityTraits.myspace_profile.aesthetic}`);
  console.log(`  - Song: ${personalityTraits.myspace_profile.profile_song.artist} - ${personalityTraits.myspace_profile.profile_song.title}`);
  console.log(`  - Layout: ${personalityTraits.myspace_profile.theme.layout_style}`);
  console.log(`  - About: ${personalityTraits.myspace_profile.about_me_html.slice(0, 100)}...`);
}

// Check profile image
if (npc.profile_image_url) {
  console.log(`  - Profile image: ${npc.profile_image_url}`);
}

// Check initial posts
const posts = gameDb.prepare(`
  SELECT * FROM posts WHERE npc_id = ?
`).all(testNPCId) as any[];

console.log(`\nInitial posts created: ${posts.length}`);
for (const post of posts.slice(0, 3)) {
  console.log(`  - "${post.content.slice(0, 80)}..."`);
}

console.log('\n=== Background Agents Test Complete ===');
