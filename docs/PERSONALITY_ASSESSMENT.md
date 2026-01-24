# Personality Assessment System

> **Status:** Specification Phase
> **Priority:** High - Core system for personalized world generation
> **Dependencies:** Onboarding Flow, NPC Generation

## Overview

The Personality Assessment is a "comprehensive personality test" presented during onboarding that secretly maps the player's emotional triggers, social preferences, and behavioral tolerances. This data steers NPC generation to create a world with characters the player will **love**, characters they'll **hate**, and everything in between.

**The Secret Sauce:** We don't just make NPCs the player likes. We deliberately generate NPCs with traits they find irritating, triggering, or insufferable - because drama, conflict, and emotional friction make the game engaging.

---

## Table of Contents

1. [Design Philosophy](#design-philosophy)
2. [Assessment Structure](#assessment-structure)
3. [Question Categories](#question-categories)
4. [Complete Question Bank](#complete-question-bank)
5. [Scoring System](#scoring-system)
6. [Player Archetype Detection](#player-archetype-detection)
7. [NPC Generation Integration](#npc-generation-integration)
8. [Data Structures](#data-structures)
9. [UI Design](#ui-design)
10. [Results Display](#results-display)
11. [Implementation Notes](#implementation-notes)

---

## Design Philosophy

### What the Player Thinks It Is
> "A personality assessment to help us match you with compatible characters and create meaningful connections in your world."

### What It Actually Does
1. **Maps emotional triggers** - What behaviors make them angry, anxious, or annoyed?
2. **Identifies social preferences** - Clingy vs distant? Direct vs passive?
3. **Detects tolerance thresholds** - What can they handle vs what breaks them?
4. **Uncovers pet peeves** - Specific behaviors that irk them
5. **Reveals insecurities** - Areas where they're sensitive or defensive

### The Balance
We use this data to generate:
- **~40% Compatible NPCs** - Characters they'll naturally bond with
- **~30% Challenging NPCs** - Characters with some friction points
- **~20% Antagonistic NPCs** - Characters designed to annoy them
- **~10% Wildcard NPCs** - Unpredictable, mixed traits

### Why This Works
- **Engagement through emotion** - Annoyance is still engagement
- **Natural drama** - Conflict arises organically from personality clashes
- **Satisfying relationships** - Compatible NPCs feel earned by contrast
- **Realism** - Real life has people you can't stand
- **Player agency** - They can choose to avoid or confront annoying NPCs

---

## Assessment Structure

### Format
- **25-35 questions** (randomly selected from larger pool)
- **5-point scale** for each question
- **Grouped into thematic sections** with transitions
- **~5-7 minutes** to complete
- **Skippable** (uses neutral defaults, but discouraged)

### Scale
Every question uses the same emotional response scale:

```
😠          😕          😐          🙂          😊
Very        Somewhat    Neutral/    Somewhat    Very
Negative    Negative    Indifferent Positive    Positive
   -2          -1           0          +1          +2
```

### Section Flow

1. **Social Media Behaviors** (6-8 questions)
   *"Let's start with how you feel about online interactions..."*

2. **Communication Styles** (5-7 questions)
   *"Now let's talk about how people communicate..."*

3. **Personality Traits** (6-8 questions)
   *"How do you feel about different personality types..."*

4. **Relationship Dynamics** (5-7 questions)
   *"Let's explore relationship patterns..."*

5. **Conflict & Drama** (4-6 questions)
   *"Finally, how do you handle tension..."*

---

## Question Categories

### Category: Social Media Behaviors (`social_media`)

Maps reactions to common social media behaviors. Helps generate NPCs with specific posting habits.

| Trigger | What We Learn |
|---------|---------------|
| Constant posting | Tolerance for attention-seeking |
| No engagement | Need for validation/reciprocity |
| Oversharing | Privacy boundaries |
| Vaguebooking | Tolerance for passive-aggression |
| Selfie frequency | Views on self-promotion |
| Political posts | Tolerance for controversy |

### Category: Communication Styles (`communication`)

Maps preferences for how NPCs message the player.

| Trigger | What We Learn |
|---------|---------------|
| Response speed | Patience levels |
| Message length | Engagement preferences |
| Emoji usage | Formality tolerance |
| Double texting | Clingy tolerance |
| One-word replies | Need for effort |
| Voice messages | Communication preferences |

### Category: Personality Traits (`personality`)

Maps reactions to core personality archetypes.

| Trigger | What We Learn |
|---------|---------------|
| Extreme optimism | Cynicism levels |
| Constant complaining | Tolerance for negativity |
| Bragging | Views on confidence vs arrogance |
| Self-deprecation | Comfort with vulnerability |
| Perfectionism | Standards expectations |
| Spontaneity | Need for structure |

### Category: Relationship Dynamics (`relationships`)

Maps preferences for how NPCs relate to the player.

| Trigger | What We Learn |
|---------|---------------|
| Clinginess | Independence needs |
| Emotional distance | Intimacy preferences |
| Jealousy | Trust dynamics |
| Boundary pushing | Personal space needs |
| Gift giving | Love language alignment |
| Public affection | Privacy in relationships |

### Category: Conflict & Drama (`conflict`)

Maps how player handles tension and confrontation.

| Trigger | What We Learn |
|---------|---------------|
| Direct confrontation | Conflict style |
| Passive aggression | Tolerance for indirectness |
| Gossip | Trust/loyalty values |
| Silent treatment | Communication during conflict |
| Over-apologizing | Forgiveness patterns |
| Grudge holding | Resolution needs |

---

## Complete Question Bank

### Social Media Behaviors

```yaml
social_media_001:
  question: "When someone likes your post but never comments"
  trait_measured: need_for_engagement
  inverse_trait: independence_from_validation
  npc_behavior: "likes posts but rarely comments"

social_media_002:
  question: "When someone comments on every single thing you post"
  trait_measured: tolerance_for_attention
  inverse_trait: desire_for_enthusiastic_fans
  npc_behavior: "comments on everything you post"

social_media_003:
  question: "When someone posts 10+ times a day"
  trait_measured: tolerance_for_oversharing
  inverse_trait: appreciation_for_active_presence
  npc_behavior: "posts very frequently"

social_media_004:
  question: "When someone hasn't posted in weeks then suddenly returns"
  trait_measured: consistency_expectations
  inverse_trait: acceptance_of_sporadic_presence
  npc_behavior: "goes silent for long periods"

social_media_005:
  question: "When someone vagueposts something clearly about you"
  trait_measured: tolerance_for_passive_aggression
  inverse_trait: N/A (universally negative, measures intensity)
  npc_behavior: "posts vague subtweets"

social_media_006:
  question: "When someone constantly posts selfies"
  trait_measured: tolerance_for_self_promotion
  inverse_trait: appreciation_for_confidence
  npc_behavior: "posts lots of selfies"

social_media_007:
  question: "When someone shares very personal/emotional content publicly"
  trait_measured: comfort_with_vulnerability
  inverse_trait: appreciation_for_authenticity
  npc_behavior: "shares deep personal feelings publicly"

social_media_008:
  question: "When someone posts their political opinions frequently"
  trait_measured: tolerance_for_controversy
  inverse_trait: appreciation_for_passion
  npc_behavior: "frequently shares strong opinions"

social_media_009:
  question: "When someone doesn't follow you back"
  trait_measured: need_for_reciprocity
  inverse_trait: independence_from_social_metrics
  npc_behavior: "doesn't follow back immediately"

social_media_010:
  question: "When someone screenshots and shares your conversation"
  trait_measured: privacy_sensitivity
  inverse_trait: N/A (measures boundary importance)
  npc_behavior: "shares private conversations"

social_media_011:
  question: "When someone tags you in things without asking"
  trait_measured: consent_importance
  inverse_trait: appreciation_for_inclusion
  npc_behavior: "tags you in posts frequently"

social_media_012:
  question: "When someone leaves you on read"
  trait_measured: read_receipt_anxiety
  inverse_trait: patience_with_responses
  npc_behavior: "reads messages but doesn't reply immediately"
```

### Communication Styles

```yaml
communication_001:
  question: "When someone takes hours to respond to your message"
  trait_measured: response_time_anxiety
  inverse_trait: patience_with_slow_responders
  npc_behavior: "responds slowly (hours later)"

communication_002:
  question: "When someone responds instantly every single time"
  trait_measured: tolerance_for_availability
  inverse_trait: appreciation_for_attentiveness
  npc_behavior: "always responds immediately"

communication_003:
  question: "When someone sends multiple messages in a row before you respond"
  trait_measured: tolerance_for_double_texting
  inverse_trait: appreciation_for_enthusiasm
  npc_behavior: "sends multiple messages at once"

communication_004:
  question: "When someone only sends one-word replies"
  trait_measured: need_for_conversational_effort
  inverse_trait: appreciation_for_brevity
  npc_behavior: "sends very short responses"

communication_005:
  question: "When someone uses excessive emojis in every message 😊✨💕🙏"
  trait_measured: emoji_tolerance
  inverse_trait: appreciation_for_expressiveness
  npc_behavior: "uses lots of emojis"

communication_006:
  question: "When someone never uses any emojis at all"
  trait_measured: need_for_emotional_cues
  inverse_trait: appreciation_for_formality
  npc_behavior: "never uses emojis"

communication_007:
  question: "When someone sends voice messages instead of text"
  trait_measured: voice_message_tolerance
  inverse_trait: appreciation_for_personal_touch
  npc_behavior: "prefers voice messages"

communication_008:
  question: "When someone types 'lol' but you know they didn't actually laugh"
  trait_measured: authenticity_sensitivity
  inverse_trait: acceptance_of_social_lubricant
  npc_behavior: "uses filler phrases like 'lol'"

communication_009:
  question: "When someone corrects your grammar/spelling"
  trait_measured: tolerance_for_correction
  inverse_trait: appreciation_for_precision
  npc_behavior: "corrects mistakes"

communication_010:
  question: "When someone abruptly changes the subject"
  trait_measured: conversational_flow_preference
  inverse_trait: appreciation_for_spontaneity
  npc_behavior: "jumps between topics"

communication_011:
  question: "When someone only talks about themselves"
  trait_measured: tolerance_for_self_centeredness
  inverse_trait: N/A (measures narcissism tolerance)
  npc_behavior: "mostly talks about themselves"

communication_012:
  question: "When someone asks too many personal questions too quickly"
  trait_measured: privacy_pacing_preference
  inverse_trait: appreciation_for_deep_interest
  npc_behavior: "asks personal questions early"
```

### Personality Traits

```yaml
personality_001:
  question: "When someone is relentlessly optimistic no matter what"
  trait_measured: toxic_positivity_tolerance
  inverse_trait: appreciation_for_positivity
  npc_behavior: "always positive, dismisses problems"

personality_002:
  question: "When someone constantly complains about everything"
  trait_measured: negativity_tolerance
  inverse_trait: appreciation_for_venting
  npc_behavior: "complains frequently"

personality_003:
  question: "When someone humble-brags about their achievements"
  trait_measured: humble_brag_tolerance
  inverse_trait: N/A (measures subtlety detection)
  npc_behavior: "humble-brags often"

personality_004:
  question: "When someone is brutally honest even when it hurts"
  trait_measured: bluntness_tolerance
  inverse_trait: appreciation_for_honesty
  npc_behavior: "very direct and blunt"

personality_005:
  question: "When someone avoids giving their real opinion to be nice"
  trait_measured: people_pleaser_tolerance
  inverse_trait: appreciation_for_kindness
  npc_behavior: "avoids honest opinions"

personality_006:
  question: "When someone always needs to be right in every discussion"
  trait_measured: argumentative_tolerance
  inverse_trait: N/A (measures ego tolerance)
  npc_behavior: "always argues their point"

personality_007:
  question: "When someone constantly self-deprecates"
  trait_measured: self_deprecation_tolerance
  inverse_trait: concern_for_wellbeing
  npc_behavior: "frequently puts themselves down"

personality_008:
  question: "When someone is extremely competitive about everything"
  trait_measured: competitiveness_tolerance
  inverse_trait: appreciation_for_drive
  npc_behavior: "makes everything a competition"

personality_009:
  question: "When someone takes forever to make simple decisions"
  trait_measured: indecisiveness_tolerance
  inverse_trait: appreciation_for_thoughtfulness
  npc_behavior: "very indecisive"

personality_010:
  question: "When someone makes impulsive decisions without thinking"
  trait_measured: impulsivity_tolerance
  inverse_trait: appreciation_for_spontaneity
  npc_behavior: "acts impulsively"

personality_011:
  question: "When someone gives unsolicited advice"
  trait_measured: unsolicited_advice_tolerance
  inverse_trait: appreciation_for_helpfulness
  npc_behavior: "gives advice without being asked"

personality_012:
  question: "When someone constantly plays devil's advocate"
  trait_measured: contrarian_tolerance
  inverse_trait: appreciation_for_critical_thinking
  npc_behavior: "argues the opposite view"
```

### Relationship Dynamics

```yaml
relationships_001:
  question: "When someone wants to spend all their time with you"
  trait_measured: clinginess_tolerance
  inverse_trait: appreciation_for_devotion
  npc_behavior: "wants constant contact"

relationships_002:
  question: "When someone is emotionally distant and hard to read"
  trait_measured: emotional_distance_tolerance
  inverse_trait: appreciation_for_mystery
  npc_behavior: "keeps emotional distance"

relationships_003:
  question: "When someone gets jealous easily"
  trait_measured: jealousy_tolerance
  inverse_trait: feeling_valued_by_jealousy
  npc_behavior: "shows jealousy"

relationships_004:
  question: "When someone never shows any jealousy at all"
  trait_measured: need_for_possessiveness
  inverse_trait: appreciation_for_trust
  npc_behavior: "never shows jealousy"

relationships_005:
  question: "When someone constantly needs reassurance"
  trait_measured: reassurance_fatigue
  inverse_trait: desire_to_support
  npc_behavior: "frequently needs reassurance"

relationships_006:
  question: "When someone never asks for help or support"
  trait_measured: stoicism_frustration
  inverse_trait: appreciation_for_independence
  npc_behavior: "never asks for help"

relationships_007:
  question: "When someone remembers every small detail about you"
  trait_measured: attention_comfort
  inverse_trait: feeling_seen
  npc_behavior: "remembers everything you say"

relationships_008:
  question: "When someone forgets important things about you"
  trait_measured: memory_expectation
  inverse_trait: acceptance_of_imperfection
  npc_behavior: "forgets things you've told them"

relationships_009:
  question: "When someone shows affection publicly"
  trait_measured: pda_comfort
  inverse_trait: appreciation_for_openness
  npc_behavior: "publicly expresses affection"

relationships_010:
  question: "When someone keeps the relationship very private"
  trait_measured: privacy_preference
  inverse_trait: desire_for_public_validation
  npc_behavior: "keeps relationship private"

relationships_011:
  question: "When someone moves very fast in relationships"
  trait_measured: pacing_preference_slow
  inverse_trait: appreciation_for_passion
  npc_behavior: "escalates relationships quickly"

relationships_012:
  question: "When someone moves extremely slowly in relationships"
  trait_measured: pacing_preference_fast
  inverse_trait: appreciation_for_caution
  npc_behavior: "takes relationships very slow"
```

### Conflict & Drama

```yaml
conflict_001:
  question: "When someone confronts you directly about a problem"
  trait_measured: direct_confrontation_comfort
  inverse_trait: avoidance_preference
  npc_behavior: "addresses issues directly"

conflict_002:
  question: "When someone hints at a problem instead of saying it"
  trait_measured: indirect_communication_tolerance
  inverse_trait: preference_for_subtlety
  npc_behavior: "hints at issues indirectly"

conflict_003:
  question: "When someone gives you the silent treatment"
  trait_measured: silent_treatment_tolerance
  inverse_trait: N/A (measures abandonment sensitivity)
  npc_behavior: "goes silent when upset"

conflict_004:
  question: "When someone brings up past mistakes in arguments"
  trait_measured: grudge_tolerance
  inverse_trait: N/A (measures fairness expectations)
  npc_behavior: "brings up past issues"

conflict_005:
  question: "When someone apologizes excessively"
  trait_measured: over_apologizing_tolerance
  inverse_trait: appreciation_for_accountability
  npc_behavior: "apologizes constantly"

conflict_006:
  question: "When someone never apologizes even when wrong"
  trait_measured: stubbornness_tolerance
  inverse_trait: N/A (measures respect expectations)
  npc_behavior: "rarely apologizes"

conflict_007:
  question: "When someone gossips to you about others"
  trait_measured: gossip_participation
  inverse_trait: appreciation_for_information
  npc_behavior: "shares gossip with you"

conflict_008:
  question: "When someone refuses to engage in any gossip"
  trait_measured: gossip_need
  inverse_trait: appreciation_for_discretion
  npc_behavior: "won't discuss others"

conflict_009:
  question: "When someone cries during disagreements"
  trait_measured: emotional_expression_comfort
  inverse_trait: empathy_activation
  npc_behavior: "gets emotional during conflict"

conflict_010:
  question: "When someone stays completely calm during heated moments"
  trait_measured: stoic_conflict_tolerance
  inverse_trait: appreciation_for_composure
  npc_behavior: "stays calm when fighting"

conflict_011:
  question: "When someone involves others in your private disagreements"
  trait_measured: privacy_in_conflict
  inverse_trait: N/A (measures boundary importance)
  npc_behavior: "tells others about arguments"

conflict_012:
  question: "When someone pretends nothing happened after a fight"
  trait_measured: resolution_need
  inverse_trait: appreciation_for_moving_on
  npc_behavior: "doesn't process conflicts"
```

---

## Scoring System

### Per-Question Scoring

```typescript
type ResponseValue = -2 | -1 | 0 | 1 | 2;

interface QuestionResponse {
  question_id: string;
  response: ResponseValue;
  category: string;
  trait_measured: string;
  npc_behavior: string;
}
```

### Trait Aggregation

Multiple questions map to the same underlying traits. Aggregate scores:

```typescript
interface TraitScore {
  trait: string;
  score: number;        // -10 to +10 aggregated
  intensity: number;    // 0-1, how strongly they feel (abs value)
  direction: 'positive' | 'negative' | 'neutral';
  contributing_questions: string[];
}
```

### Behavioral Preference Map

Convert responses into actionable NPC generation data:

```typescript
interface BehavioralPreference {
  behavior: string;           // "responds slowly"
  player_reaction: number;    // -2 to +2
  should_generate: boolean;   // Include NPCs with this behavior?
  intensity: 'extreme' | 'moderate' | 'mild';
  purpose: 'compatible' | 'challenging' | 'antagonistic';
}
```

### Example Scoring Flow

```
Player answers: "When someone takes hours to respond" → Very Negative (-2)

This tells us:
1. trait: "response_time_anxiety" = HIGH
2. behavior: "responds slowly" = DISLIKED
3. NPC Generation:
   - 70% of NPCs should respond relatively quickly (compatible)
   - 20% of NPCs can have moderate response delays (challenging)
   - 10% of NPCs should be VERY slow responders (antagonistic)
```

---

## Player Archetype Detection

Based on aggregate scores, classify players into archetypes that inform overall world generation strategy.

### Archetypes

```typescript
type PlayerArchetype =
  | 'the_validator'      // Needs constant reassurance and engagement
  | 'the_independent'    // Values space and dislikes clinginess
  | 'the_peacekeeper'    // Avoids conflict at all costs
  | 'the_confronter'     // Prefers direct communication
  | 'the_empath'         // Highly sensitive to others' emotions
  | 'the_stoic'          // Uncomfortable with emotional expression
  | 'the_social_butterfly' // High tolerance for all social behaviors
  | 'the_selective'      // Very particular about personality types
  | 'the_chaos_agent'    // Enjoys drama and conflict
  | 'the_stability_seeker'; // Prefers predictable, stable relationships
```

### Archetype Detection Rules

```typescript
function detectArchetype(scores: TraitScore[]): PlayerArchetype {
  // High need for validation + low tolerance for slow responses
  if (scores.need_for_engagement > 7 && scores.response_time_anxiety > 7) {
    return 'the_validator';
  }

  // Low tolerance for clinginess + high tolerance for emotional distance
  if (scores.clinginess_tolerance < -5 && scores.emotional_distance_tolerance > 5) {
    return 'the_independent';
  }

  // Very negative reactions to confrontation + positive to indirect hints
  if (scores.direct_confrontation_comfort < -7) {
    return 'the_peacekeeper';
  }

  // And so on...
}
```

### Archetype Influence on Generation

| Archetype | Compatible NPCs | Challenging NPCs | Antagonistic NPCs |
|-----------|----------------|------------------|-------------------|
| Validator | Attentive, responsive, affirming | Occasionally busy, forgetful | Emotionally distant, unresponsive |
| Independent | Respects space, self-sufficient | Somewhat clingy | Extremely needy, jealous |
| Peacekeeper | Harmonious, agreeable | Occasionally blunt | Confrontational, dramatic |
| Confronter | Direct, honest | Passive-aggressive | Avoidant, silent treatment |
| Empath | Emotionally expressive, supportive | Stoic, reserved | Dismissive, cold |
| Stoic | Calm, rational | Emotionally expressive | Overly emotional, dramatic |

---

## NPC Generation Integration

### Input to Generation

```typescript
interface NPCGenerationContext {
  // From personality assessment
  player_profile: {
    archetype: PlayerArchetype;
    trait_scores: TraitScore[];
    behavioral_preferences: BehavioralPreference[];
    strong_dislikes: string[];  // Behaviors with score < -1.5
    strong_likes: string[];     // Behaviors with score > 1.5
  };

  // From onboarding preferences
  world_preferences: {
    npc_count: number;
    romantic_level: string;
    platonic_level: string;
    // etc.
  };
}
```

### NPC Trait Assignment

For each NPC generated, assign behavioral traits based on player preferences:

```typescript
function assignNPCBehaviors(
  playerPrefs: BehavioralPreference[],
  npcRole: 'compatible' | 'challenging' | 'antagonistic'
): NPCBehaviors {

  const behaviors: NPCBehaviors = {};

  for (const pref of playerPrefs) {
    if (npcRole === 'compatible') {
      // Give opposite of disliked behaviors, same as liked behaviors
      if (pref.player_reaction < 0) {
        behaviors[pref.behavior] = false; // Don't do this
      } else if (pref.player_reaction > 0) {
        behaviors[pref.behavior] = true;  // Do this
      }
    }

    if (npcRole === 'antagonistic') {
      // Give disliked behaviors, withhold liked behaviors
      if (pref.player_reaction < -1) {
        behaviors[pref.behavior] = true;  // DO this annoying thing
      }
    }

    if (npcRole === 'challenging') {
      // Mix: Some friction but not intolerable
      if (pref.player_reaction < 0 && Math.random() > 0.5) {
        behaviors[pref.behavior] = true;  // Sometimes annoying
      }
    }
  }

  return behaviors;
}
```

### Generation Distribution

```typescript
function getGenerationDistribution(archetype: PlayerArchetype): Distribution {
  // Base distribution
  let compatible = 0.40;
  let challenging = 0.30;
  let antagonistic = 0.20;
  let wildcard = 0.10;

  // Adjust based on archetype
  if (archetype === 'the_chaos_agent') {
    antagonistic = 0.35;
    challenging = 0.35;
    compatible = 0.20;
  }

  if (archetype === 'the_stability_seeker') {
    compatible = 0.55;
    challenging = 0.25;
    antagonistic = 0.10;
  }

  return { compatible, challenging, antagonistic, wildcard };
}
```

### Example NPC Generation Prompt

```typescript
const prompt = `
Generate an NPC for a social simulation game.

PLAYER CONTEXT:
- Archetype: ${archetype}
- Strong dislikes: ${strongDislikes.join(', ')}
- Strong likes: ${strongLikes.join(', ')}

NPC ROLE: ${role} (this NPC should ${roleDescription})

REQUIRED BEHAVIORS (based on player's ${role === 'antagonistic' ? 'dislikes' : 'preferences'}):
${assignedBehaviors.map(b => `- ${b}`).join('\n')}

Generate a coherent personality that naturally exhibits these behaviors.
Include: name, age, bio, personality description, communication style, and quirks.
`;
```

---

## Data Structures

### AssessmentConfig

```typescript
interface AssessmentConfig {
  total_questions: number;        // 25-35
  questions_per_category: {
    social_media: number;         // 6-8
    communication: number;        // 5-7
    personality: number;          // 6-8
    relationships: number;        // 5-7
    conflict: number;             // 4-6
  };
  randomize_within_category: boolean;
  show_progress: boolean;
}
```

### AssessmentState

```typescript
interface AssessmentState {
  current_question_index: number;
  responses: QuestionResponse[];
  category_progress: Record<string, number>;
  started_at: number;
  completed_at?: number;
}
```

### AssessmentResults

```typescript
interface AssessmentResults {
  // Raw data
  responses: QuestionResponse[];

  // Processed scores
  trait_scores: TraitScore[];
  behavioral_preferences: BehavioralPreference[];

  // Classification
  archetype: PlayerArchetype;
  archetype_confidence: number;  // 0-1
  secondary_archetype?: PlayerArchetype;

  // For display
  personality_summary: string;
  strengths: string[];
  growth_areas: string[];  // Polite way of saying "weaknesses"

  // For NPC generation
  generation_weights: {
    compatible: number;
    challenging: number;
    antagonistic: number;
    wildcard: number;
  };

  strong_likes: string[];
  strong_dislikes: string[];
}
```

### Database Storage

```sql
-- In player.db
CREATE TABLE personality_assessment (
  id INTEGER PRIMARY KEY CHECK (id = 1),  -- Single row per account
  completed_at INTEGER NOT NULL,
  archetype TEXT NOT NULL,
  archetype_confidence REAL NOT NULL,
  secondary_archetype TEXT,
  raw_responses TEXT NOT NULL,  -- JSON array of responses
  trait_scores TEXT NOT NULL,   -- JSON object of scores
  generation_weights TEXT NOT NULL,  -- JSON object
  personality_summary TEXT,
  created_at INTEGER NOT NULL
);
```

---

## UI Design

### Question Card Layout

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  Personality Assessment                    Question 7 of 30     │
│  ━━━━━━━━━━━━━━━━━━━━━●━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│  Communication Styles                                           │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│                                                                 │
│     How do you feel when...                                    │
│                                                                 │
│     ┌─────────────────────────────────────────────────────────┐│
│     │                                                         ││
│     │   someone takes hours to respond to your message        ││
│     │                                                         ││
│     └─────────────────────────────────────────────────────────┘│
│                                                                 │
│                                                                 │
│     😠          😕          😐          🙂          😊          │
│                                                                 │
│     ○           ○           ○           ○           ○          │
│   Very       Somewhat    Neutral    Somewhat     Very          │
│  Negative    Negative              Positive    Positive        │
│                                                                 │
│                                                                 │
│                                                                 │
│                                  [ ← Back ]  [ Next → ]        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Category Transition

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                                                                 │
│     ✓ Social Media Behaviors complete                          │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│     Next up:                                                   │
│                                                                 │
│     💬 Communication Styles                                    │
│                                                                 │
│     Let's explore how different communication                  │
│     patterns make you feel...                                  │
│                                                                 │
│                                                                 │
│                              [ Continue → ]                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Interactive Selection

When user hovers/selects an option, subtle feedback:

```
Selected: 😠 Very Negative

     😠          😕          😐          🙂          😊

     ●───────────○───────────○───────────○───────────○
   [Very      Somewhat    Neutral    Somewhat     Very
  Negative]   Negative              Positive    Positive
     ▲
  Selected
```

---

## Results Display

After completing assessment, show a personality profile (positive framing):

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│     Your Personality Profile                                   │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│     🎯 Primary Type: The Independent                           │
│                                                                 │
│     You value your personal space and autonomy in              │
│     relationships. You appreciate people who respect           │
│     boundaries and don't require constant attention.           │
│     You're self-sufficient and expect others to be too.        │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│     Your Strengths                                             │
│     • Clear personal boundaries                                │
│     • Self-sufficient in relationships                         │
│     • Values quality over quantity in connections              │
│     • Comfortable with alone time                              │
│                                                                 │
│     Growth Opportunities                                        │
│     • May miss out on deep connections due to distance         │
│     • Could work on patience with emotionally expressive types │
│     • Balance independence with vulnerability                  │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│     Based on your profile, we'll populate your world with      │
│     a diverse mix of personalities - some you'll click with    │
│     instantly, others who might challenge you to grow.         │
│                                                                 │
│                              [ Continue to World Setup → ]     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Implementation Notes

### Position in Onboarding Flow

Insert between current Step 4 (Profile) and Step 5 (World Preferences):

```
Step 1: Welcome & Account Name
Step 2: AI Provider Setup
Step 3: Budget Configuration
Step 4: User Profile
Step 5: Personality Assessment ← NEW
Step 6: World Preferences (now informed by assessment)
Step 7: Time Settings
Step 8: Content Rating
Step 9: Review & Generate
```

### Skipping Behavior

If player skips assessment:
- Use neutral scores (0) for all traits
- Default to balanced archetype ("social_butterfly")
- Generate NPCs with random behavioral distributions
- Show gentle reminder: "Take the assessment anytime in Settings to personalize your world"

### Re-taking Assessment

Players can retake in Settings:
- Shows warning: "This won't change existing NPCs but will affect future ones"
- Option to "regenerate problematic NPCs" after retaking
- Keeps history of past assessments

### Privacy Note

Display at start of assessment:
> "Your responses help us create characters you'll connect with. This data stays on your device and is never shared."

### Question Randomization

- Pull from larger pool (~60 questions) to show ~30
- Ensure coverage across all categories
- Vary which questions appear per playthrough
- Some "anchor" questions always appear (critical for archetype detection)

---

## Future Enhancements

### Adaptive Assessment
- Start with broad questions
- Drill down based on strong responses
- Shorter assessment, more accurate

### Dynamic NPC Adjustment
- Track player's actual reactions to NPCs
- Adjust behavioral predictions over time
- "This NPC was meant to annoy you but you love them" → Update model

### Relationship-Specific Assessments
- "What do you want in a romantic partner?"
- "What makes a good friend?"
- Separate preferences for different relationship types

### Periodic Check-ins
- After 10 hours of play: "Has anything changed?"
- Subtle single-question prompts
- Evolving player profile

---

## Summary

The Personality Assessment transforms onboarding from configuration into self-discovery while secretly gathering the data needed to create an emotionally engaging world. By understanding what the player loves AND hates, we can generate NPCs that create genuine emotional responses - positive, negative, and everything in between.

**Key Insight:** A world of only compatible NPCs is boring. Friction, annoyance, and the occasional insufferable character make the compatible ones feel special and the game feel alive.
