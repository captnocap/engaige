// Test script for budget system
import { initializeBudget, getBudgetStatus, checkBudgetAllows, logApiCost, updateBudgetConfig } from './src/services/budget.js';
import { calculateCost } from './src/utils/cost-calculator.js';

console.log('=== Budget System Test ===\n');

// 1. Initialize budget with custom config
console.log('1. Initializing budget with $10 monthly limit...');
initializeBudget({
  overall_limit_cents: 1000, // $10
  period_type: 'monthly',
  rollover_enabled: true,
  max_rollover_days: 7,
  allocations: {
    conversation: { percentage: 40 },
    npc_generation: { percentage: 15 },
    autonomous_posts: { percentage: 15 },
    random_events: { percentage: 15 },
    npc_tuning: { percentage: 5 },
    image_generation: { cents_override: 2000 }, // $20 fixed
    other: { percentage: 10 },
  },
});
console.log('✓ Budget initialized\n');

// 2. Check initial status
console.log('2. Getting initial budget status...');
let status = getBudgetStatus();
console.log(`Period: ${new Date(status.period_start * 1000).toLocaleDateString()} - ${new Date(status.period_end * 1000).toLocaleDateString()}`);
console.log(`Overall limit: $${(status.overall_limit_cents / 100).toFixed(2)}`);
console.log(`Spent: $${(status.total_spent_cents / 100).toFixed(2)}`);
console.log(`Remaining: $${(status.remaining_cents / 100).toFixed(2)}\n`);

console.log('Category breakdown:');
for (const cat of status.categories) {
  console.log(`  ${cat.display_name}: $${(cat.allocated_cents / 100).toFixed(2)} allocated, $${(cat.spent_cents / 100).toFixed(2)} spent, $${(cat.remaining_cents / 100).toFixed(2)} remaining`);
}
console.log('');

// 3. Simulate some API calls
console.log('3. Simulating API calls...');

// Conversation call (gpt-4o-mini)
const conversationCost = calculateCost(
  { input_tokens: 150, output_tokens: 50, total_tokens: 200 },
  'gpt-4o-mini'
);
console.log(`Estimated conversation cost: $${(conversationCost / 100).toFixed(4)}`);

const conversationCheck = checkBudgetAllows('conversation', conversationCost);
if (conversationCheck.allowed) {
  console.log('✓ Budget allows conversation');
  logApiCost({
    provider: 'openai-compatible',
    model: 'gpt-4o-mini',
    feature_category: 'conversation',
    input_tokens: 150,
    output_tokens: 50,
    total_tokens: 200,
    cost_cents: conversationCost,
  });
  console.log('✓ Cost logged\n');
} else {
  console.log(`✗ Budget rejected: ${conversationCheck.reason}\n`);
}

// NPC generation call (larger)
const npcGenCost = calculateCost(
  { input_tokens: 500, output_tokens: 1000, total_tokens: 1500 },
  'gpt-4o'
);
console.log(`Estimated NPC generation cost: $${(npcGenCost / 100).toFixed(4)}`);

const npcGenCheck = checkBudgetAllows('npc_generation', npcGenCost);
if (npcGenCheck.allowed) {
  console.log('✓ Budget allows NPC generation');
  logApiCost({
    provider: 'openai',
    model: 'gpt-4o',
    feature_category: 'npc_generation',
    input_tokens: 500,
    output_tokens: 1000,
    total_tokens: 1500,
    cost_cents: npcGenCost,
  });
  console.log('✓ Cost logged\n');
} else {
  console.log(`✗ Budget rejected: ${npcGenCheck.reason}\n`);
}

// Random event (small)
const randomEventCost = calculateCost(
  { input_tokens: 100, output_tokens: 75, total_tokens: 175 },
  'gpt-4o-mini'
);
console.log(`Estimated random event cost: $${(randomEventCost / 100).toFixed(4)}`);

const randomEventCheck = checkBudgetAllows('random_events', randomEventCost);
if (randomEventCheck.allowed) {
  console.log('✓ Budget allows random event');
  logApiCost({
    provider: 'openai-compatible',
    model: 'gpt-4o-mini',
    feature_category: 'random_events',
    input_tokens: 100,
    output_tokens: 75,
    total_tokens: 175,
    cost_cents: randomEventCost,
  });
  console.log('✓ Cost logged\n');
} else {
  console.log(`✗ Budget rejected: ${randomEventCheck.reason}\n`);
}

// 4. Check updated status
console.log('4. Getting updated budget status...');
status = getBudgetStatus();
console.log(`Overall limit: $${(status.overall_limit_cents / 100).toFixed(2)}`);
console.log(`Spent: $${(status.total_spent_cents / 100).toFixed(2)}`);
console.log(`Remaining: $${(status.remaining_cents / 100).toFixed(2)}\n`);

console.log('Category breakdown:');
for (const cat of status.categories) {
  if (cat.spent_cents > 0) {
    console.log(`  ${cat.display_name}: $${(cat.allocated_cents / 100).toFixed(2)} allocated, $${(cat.spent_cents / 100).toFixed(2)} spent, $${(cat.remaining_cents / 100).toFixed(2)} remaining`);
  }
}
console.log('');

// 5. Test budget limit
console.log('5. Testing budget limit enforcement...');
const hugeCost = 10000; // $100 - way over budget
const hugeCheck = checkBudgetAllows('conversation', hugeCost);
if (!hugeCheck.allowed) {
  console.log(`✓ Budget correctly rejected large request: ${hugeCheck.reason}\n`);
} else {
  console.log('✗ Budget should have rejected this!\n');
}

// 6. Update budget config
console.log('6. Testing budget update...');
updateBudgetConfig({
  overall_limit_cents: 2000, // Increase to $20
});
console.log('✓ Budget limit increased to $20');

status = getBudgetStatus();
console.log(`New overall limit: $${(status.overall_limit_cents / 100).toFixed(2)}`);
console.log(`Spent: $${(status.total_spent_cents / 100).toFixed(2)}`);
console.log(`Remaining: $${(status.remaining_cents / 100).toFixed(2)}\n`);

console.log('=== Budget System Test Complete ===');
