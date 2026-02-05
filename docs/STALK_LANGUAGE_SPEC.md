# STALK Language Specification

**Version:** 0.1.0 (Draft)
**Status:** Design Phase

> *"Type-safe code prevents errors. Pop-safe code prevents embarrassment."*

STALK (Situational Tool Authoring for Lightweight Kernels) is the official programming language of CobHub. It is not a general-purpose language. It is a ritualized system for observing social conditions, making predictions, declaring outputs, and creating consequences in the world.

---

## Table of Contents

1. [Philosophy](#1-philosophy)
2. [Program Structure](#2-program-structure)
3. [Lexical Elements](#3-lexical-elements)
4. [Identifiers & Resolution](#4-identifiers--resolution)
5. [Data Model](#5-data-model)
6. [Block Specifications](#6-block-specifications)
7. [Expressions & Operators](#7-expressions--operators)
8. [Game State Queries](#8-game-state-queries)
9. [Audiences](#9-audiences)
10. [UI Primitives](#10-ui-primitives)
11. [IMPACT Operations](#11-impact-operations)
12. [Capabilities](#12-capabilities)
13. [Runtime Contract](#13-runtime-contract)
14. [Execution Model](#14-execution-model)
15. [Pop-Safety System](#15-pop-safety-system)
16. [Diagnostics & Pops](#16-diagnostics--pops)
17. [Standard Library](#17-standard-library)
18. [Examples](#18-examples)

---

## 1. Philosophy

### 1.1 Core Principles

**Pop-safety over type-safety.** STALK does not care if your math is wrong. It cares if your math embarrasses you publicly.

**Social consequences as first-class outputs.** Every STALK program can affect the world. A "Hello World" that doesn't change anything is incomplete.

**Ritualized structure.** Programs follow a fixed block order. This isn't a limitation—it's a ceremony. The structure makes programs legible and makes safety gating natural.

**Constrained by design.** STALK is intentionally not Turing-complete. There are no arbitrary loops. There is no recursion. There is no escaping the sandbox. If you need those things, you need a different language.

### 1.2 Design Goals

- **Easy for humans to read** — Verbose canonical form, IDE can offer shortcuts
- **Easy for LLMs to generate** — Deterministic syntax, no ambiguity
- **Easy to sandbox** — All side effects isolated to IMPACT blocks
- **Easy to lint** — Pop-safety warnings are computable from static analysis
- **Hard to abuse** — Capabilities are explicit, budgets are enforced

### 1.3 What STALK Is NOT

- Not a general-purpose programming language
- Not Turing-complete (no arbitrary loops, no recursion)
- Not for file I/O, network requests, or system access
- Not type-safe in the traditional sense
- Not trying to be JavaScript, Python, Lua, or any "real" language

STALK is closer to a spreadsheet formula language crossed with a social media posting interface. It observes, predicts, declares, and impacts. That's it.

---

## 2. Program Structure

### 2.1 Top-Level Declaration

Every STALK program begins with a declaration:

```stalk
STALK "program-name" {
  # blocks go here
}
```

The program name must be a valid identifier string (lowercase, hyphens allowed, no spaces).

### 2.2 Block Ordering

Blocks must appear in this order. All blocks are optional except the name declaration.

```
STALK "name" {
  REQUIRE { }      # 1. Capabilities needed (optional)
  CONFIG { }       # 2. Program configuration (optional)
  OBSERVE { }      # 3. Conditions to watch (optional)
  PREDICT { }      # 4. Assertions about future (optional)
  DECLARE { }      # 5. UI and outputs (optional)
  IMPACT { }       # 6. Side effects (optional)
}
```

The `DISCLAIMER` block is special—it can appear anywhere and multiple times:

```stalk
STALK "controversial-take" {
  DISCLAIMER { "This is a bit." }

  OBSERVE { ... }

  DISCLAIMER { "Not financial advice." }

  IMPACT { ... }
}
```

### 2.3 Comments

```stalk
# Single line comment
// Also a single line comment

#*
   Multi-line comment
   Spanning multiple lines
*#
```

### 2.4 Minimal Valid Program

```stalk
STALK "empty" { }
```

This program does nothing. It is valid. It is also pointless.

---

## 3. Lexical Elements

### 3.1 Keywords

Reserved words that cannot be used as identifiers:

```
STALK, REQUIRE, CONFIG, OBSERVE, PREDICT, DECLARE, IMPACT, DISCLAIMER,
AND, OR, NOT, UNLESS, IF, THEN, ELSE, END,
ON, CLICK, CHANGE, SUBMIT, TICK,
TO, FROM, AS, WITH, FOR, UNTIL,
TRUE, FALSE, NULL, UNKNOWN,
CONFIDENCE, EVIDENCE, AUDIENCE,
WINDOW, TEXT, BUTTON, SLIDER, INPUT, CHART, NOTIFY, TOAST, MODAL,
POST, DM, REACT, PRINT, FLASH, SOUND,
ALLOW_BROADCAST, ALLOW_RELATIONSHIP_WRITE, ALLOW_MARKET_INFLUENCE,
ALLOW_NPC_CONTACT, ALLOW_VIRALITY, ALLOW_SYSTEMIC
```

### 3.2 Identifiers

Valid identifiers:
- Start with a letter (a-z, A-Z) or underscore
- Contain letters, numbers, underscores
- Case-insensitive (but convention is lowercase with underscores)

```stalk
my_variable      # valid
_private         # valid
variable2        # valid
2variable        # INVALID - starts with number
my-variable      # INVALID - hyphens not allowed in identifiers
```

### 3.3 Literals

**Numbers:**
```stalk
42               # integer
3.14             # float
-7               # negative
0.847            # the sacred number
```

**Strings:**
```stalk
"Hello, world"           # double quotes
'Single quotes too'      # single quotes
"Line one\nLine two"     # escape sequences: \n \t \\ \"
```

**String Interpolation:**
```stalk
"Trust level: {player.trust}"
"Hello, {npc_name}!"
```

**Booleans:**
```stalk
TRUE
FALSE
```

**Special Values:**
```stalk
NULL             # absence of value
UNKNOWN          # value exists but is not known (important for predictions)
```

### 3.4 Operators

**Arithmetic:**
```stalk
+    # addition
-    # subtraction
*    # multiplication
/    # division
%    # modulo
```

**Comparison:**
```stalk
==   # equals
!=   # not equals
>    # greater than
<    # less than
>=   # greater or equal
<=   # less or equal
~=   # "vibes equal" (fuzzy match, within 10% for numbers, case-insensitive for strings)
```

**Logical:**
```stalk
AND
OR
NOT
UNLESS   # equivalent to AND NOT, but reads better
```

**Assignment:**
```stalk
=    # assignment
+=   # add and assign
-=   # subtract and assign
```

---

## 4. Identifiers & Resolution

### 4.1 Path Grammar

Game state is accessed through dotted paths and function-style lookups:

```stalk
# Static paths (known at parse time)
player.trust
player.mood
market.stalks.corn.price

# Dynamic lookups (resolved at runtime)
npc("Derek").trust
npc("Derek").affinity
market.stalks["quantum_coffee"].price
posts.by(npc("Derek")).recent

# Collections
nearby.npcs
online.npcs
feed.trending
```

### 4.2 Resolution Rules

1. **Static paths** use dot notation: `object.property.subproperty`
2. **Dynamic lookups** use function syntax: `npc("name")`, `stalks["symbol"]`
3. **Mixed paths** combine both: `npc("Derek").relationships.with(npc("Mars")).trust`

### 4.3 Missing Path Behavior

When a path cannot be resolved:

| Situation | Returns | Diagnostic |
|-----------|---------|------------|
| NPC doesn't exist | `NULL` | Warning: "NPC 'Zork' not found" |
| Property doesn't exist | `NULL` | Warning: "Unknown property 'trust_level'" |
| Collection is empty | Empty collection `[]` | None |
| Value is private/hidden | `UNKNOWN` | Info: "Value hidden by privacy settings" |

### 4.4 Reserved Paths

These paths are always available:

```stalk
player.*           # Current player state
self.*             # The running program's state
time.*             # Current time information
random.*           # Random number generation (budgeted)
```

---

## 5. Data Model

### 5.1 Type Philosophy

STALK does not have explicit types. Values have implicit types that coerce as needed.

> "Types are for compilers. Vibes are for people."

### 5.2 Implicit Types

Internally, values are one of:

- **Number** — integers and floats unified
- **String** — text
- **Boolean** — TRUE or FALSE
- **Collection** — ordered list of values
- **Reference** — pointer to game state
- **NULL** — absence of value
- **UNKNOWN** — value exists but is hidden/unknowable

### 5.3 Coercion Rules

When types mismatch, STALK coerces:

| From | To | Rule |
|------|-----|------|
| Number | String | `42` → `"42"` |
| String | Number | `"42"` → `42`, `"hello"` → `0` with warning |
| Boolean | Number | `TRUE` → `1`, `FALSE` → `0` |
| Number | Boolean | `0` → `FALSE`, anything else → `TRUE` |
| NULL | String | `"null"` |
| NULL | Number | `0` with warning |
| UNKNOWN | Any | Operation returns `UNKNOWN` |

### 5.4 Variables

Variables are declared implicitly on first assignment:

```stalk
OBSERVE {
  beans = 47
  confidence_level = npc("Derek").confidence
  is_online = online.npcs.contains(npc("Derek"))
}
```

Variables are scoped to the program. There are no global variables.

---

## 6. Block Specifications

### 6.1 REQUIRE Block

Declares capabilities the program needs. Must be first block if present.

```stalk
REQUIRE {
  ALLOW_BROADCAST          # Can post publicly
  ALLOW_RELATIONSHIP_WRITE # Can modify relationship stats
  ALLOW_NPC_CONTACT        # Can send DMs to NPCs
}
```

If a required capability is not granted, the program fails to run with a clear error.

### 6.2 CONFIG Block

Program configuration and metadata.

```stalk
CONFIG {
  version = "1.0.0"
  author = player.username
  description = "Calculates optimal quantum coffee ratios"

  # Execution mode
  trigger = ON_CONDITION    # or ONCE, or CONTINUOUS
  tick_rate = 2             # Hz, for CONTINUOUS mode

  # Pop-safety settings
  max_confidence = 0.8      # Self-imposed confidence cap
  default_audience = FRIENDS
}
```

### 6.3 OBSERVE Block

Watches game state and defines conditions. **Read-only.** No side effects allowed.

```stalk
OBSERVE {
  # Simple observations
  derek_trust = npc("Derek").trust
  corn_price = market.stalks.corn.price

  # Conditions (evaluated as triggers if trigger = ON_CONDITION)
  trust_is_high = derek_trust > 75
  market_is_volatile = corn_price.change_24h > 0.2

  # Collection queries
  nearby_friends = nearby.npcs.where(trust > 50)
  trending_posts = feed.trending.limit(10)

  # Time-based
  is_peak_hours = time.hour >= 18 AND time.hour <= 22
  is_cringe_hours = time.hour >= 2 AND time.hour <= 5
}
```

### 6.4 PREDICT Block

Makes assertions about future state. Predictions can be validated later for credibility scoring.

```stalk
PREDICT {
  # Simple predictions
  derek_will_post = TRUE
  CONFIDENCE = 0.7
  EVIDENCE = "He always posts after coffee"

  # Market predictions
  corn_will_rise = market.stalks.corn.price > corn_price * 1.1
  CONFIDENCE = 0.6
  EVIDENCE = "Derek mentioned quantum entanglement"
  TIMEFRAME = "24h"

  # Social predictions
  post_will_flop = TRUE
  CONFIDENCE = 0.4
  EVIDENCE = "Posting during cringe hours"
}
```

Predictions with high CONFIDENCE and low EVIDENCE trigger pop-safety warnings.

### 6.5 DECLARE Block

Defines UI elements and program outputs. Does not execute side effects.

```stalk
DECLARE {
  WINDOW {
    title = "Quantum Coffee Calculator"
    size = (420, 300)
    position = CENTER
  }

  # UI Elements
  TEXT {
    id = "title"
    content = "Calculate Your Quantum Brew"
    style = HEADING
  }

  SLIDER {
    id = "beans"
    label = "Bean Count"
    range = (1, 100)
    default = 47
  }

  SLIDER {
    id = "entanglement"
    label = "Entanglement Factor"
    range = (0, 1)
    default = 0.73
  }

  BUTTON {
    id = "calculate"
    label = "Calculate"
  }

  TEXT {
    id = "result"
    content = ""
    style = RESULT
  }
}
```

### 6.6 IMPACT Block

The **only** place side effects can occur. All world-affecting operations go here.

```stalk
IMPACT {
  ON CLICK "calculate" {
    result_value = beans * entanglement * 8.47
    self.result.content = "Optimal dose: {result_value}mg"
  }

  ON SUBMIT {
    # Tier 0: Cosmetic (always allowed)
    PRINT "Calculation complete"
    FLASH "result"
    SOUND "ding"

    # Tier 1: Personal (always allowed)
    player.mood += 0.01

    # Tier 2: Social (requires ALLOW_BROADCAST)
    POST TO myface {
      content = "Just calculated my quantum coffee dose: {result_value}mg"
      AUDIENCE = FRIENDS
    }

    # Tier 3: Relational (requires ALLOW_RELATIONSHIP_WRITE)
    npc("Derek").trust += 0.02

    # Tier 4: Systemic (requires ALLOW_SYSTEMIC, very rare)
    market.stalks.quantum_coffee.sentiment += 0.001
  }
}
```

### 6.7 DISCLAIMER Block

Reduces social blowback. Can appear anywhere in the program.

```stalk
DISCLAIMER {
  "This is a bit."
  "Not financial advice."
  "Results may vary based on local quantum conditions."
  "I was young and needed the engagement."
}
```

Disclaimers are:
- Displayed with program output
- Factor into pop-safety calculations
- Can reduce relationship damage from controversial posts
- Have diminishing returns (too many disclaimers = suspicious)

---

## 7. Expressions & Operators

### 7.1 Arithmetic Expressions

```stalk
beans * entanglement * 8.47
(price_now - price_yesterday) / price_yesterday * 100
abs(trust_change)
round(confidence, 2)
```

### 7.2 Comparison Expressions

```stalk
trust > 50
price == 847
name ~= "derek"        # vibes equal (case-insensitive)
confidence >= 0.8 AND evidence < 0.3
```

### 7.3 Logical Expressions

```stalk
is_online AND trust > 50
NOT is_cringe_hours
has_permission UNLESS is_blocked
(a OR b) AND (c OR d)
```

### 7.4 Conditional Expressions

```stalk
IF trust > 75 THEN "friend" ELSE "acquaintance"
IF confidence > 0.8 THEN "certain" ELSE IF confidence > 0.5 THEN "likely" ELSE "uncertain"
```

### 7.5 Collection Expressions

```stalk
npcs.where(trust > 50)
posts.limit(10)
feed.sort_by(engagement).reverse()
online.npcs.count()
nearby.npcs.first()
trending.contains(my_post)
```

### 7.6 String Expressions

```stalk
"Hello, " + name
"Trust: {trust}%"
message.upper()
name.lower()
bio.contains("quantum")
```

---

## 8. Game State Queries

### 8.1 Player State

```stalk
player.username
player.trust              # Overall trust rating
player.mood               # Current mood (-1 to 1)
player.anxiety            # Current anxiety (0 to 1)
player.reputation         # Public reputation score
player.relationships      # Collection of NPC relationships
```

### 8.2 NPC State

```stalk
npc("Derek").trust        # Their trust in player
npc("Derek").affinity     # How much they like player
npc("Derek").familiarity  # How well they know player
npc("Derek").mood         # Current mood
npc("Derek").online       # Boolean
npc("Derek").last_seen    # Timestamp
npc("Derek").posts.recent # Recent posts collection
```

### 8.3 Social State

```stalk
feed.trending             # Trending posts
feed.recent               # Recent posts from followed
feed.by(npc("Derek"))     # Posts by specific NPC
posts.count               # Total post count
posts.engagement_rate     # Average engagement

online.npcs               # Currently online NPCs
nearby.npcs               # NPCs in current context
friends.npcs              # NPCs with trust > threshold
```

### 8.4 Market State

```stalk
market.stalks.corn.price
market.stalks.corn.change_24h
market.stalks.corn.volume
market.stalks.corn.sentiment
market.stalks["quantum_coffee"].price
market.trending           # Trending stalks
```

### 8.5 Time State

```stalk
time.now                  # Current timestamp
time.hour                 # Current hour (0-23)
time.day                  # Day of week (0-6)
time.date                 # Date string
time.elapsed(timestamp)   # Time since timestamp
time.until(timestamp)     # Time until timestamp
time.is_peak              # Boolean: peak social hours
time.is_cringe            # Boolean: cringe hours (2-5 AM)
```

---

## 9. Audiences

### 9.1 Audience Types

Every output has an audience. The audience affects pop-safety calculations.

```stalk
AUDIENCE = SELF           # Only you see it
AUDIENCE = FRIENDS        # Friends only (trust > 50)
AUDIENCE = FOLLOWERS      # Your followers
AUDIENCE = PUBLIC         # Everyone
AUDIENCE = npc("Derek")   # Specific NPC
AUDIENCE = group("Hartwell Tenants")  # Specific group
```

### 9.2 Audience Mismatch

Pop-safety warnings trigger when content doesn't match its audience:

| Content Type | Safe Audience | Risky Audience |
|--------------|---------------|----------------|
| Inside joke | FRIENDS | PUBLIC |
| Hot take | SELF | PUBLIC |
| Prediction | FRIENDS | PUBLIC |
| Personal info | SELF | Anyone else |
| Criticism of NPC | SELF | That NPC or PUBLIC |

### 9.3 Audience-Based Warning Examples

```
WARNING: High-context joke posted to PUBLIC
Estimated laugh rate: 12%
Screenshot risk: HIGH

WARNING: Criticism of Derek visible to Derek
Relationship damage likely: -15 trust

WARNING: Confident prediction broadcast to PUBLIC
If wrong, credibility impact: SEVERE
```

---

## 10. UI Primitives

### 10.1 WINDOW

```stalk
WINDOW {
  title = "My App"
  size = (width, height)    # in pixels
  position = CENTER | (x, y)
  resizable = TRUE | FALSE
  closable = TRUE | FALSE
}
```

### 10.2 TEXT

```stalk
TEXT {
  id = "label1"
  content = "Hello, world"
  style = NORMAL | HEADING | SUBHEADING | CAPTION | RESULT | ERROR
}
```

### 10.3 BUTTON

```stalk
BUTTON {
  id = "submit"
  label = "Click Me"
  style = PRIMARY | SECONDARY | DANGER
  disabled = FALSE
}
```

### 10.4 INPUT

```stalk
INPUT {
  id = "username"
  label = "Username"
  placeholder = "Enter username"
  type = TEXT | NUMBER | PASSWORD
  default = ""
}
```

### 10.5 SLIDER

```stalk
SLIDER {
  id = "volume"
  label = "Volume"
  range = (min, max)
  step = 1
  default = 50
}
```

### 10.6 CHART

```stalk
CHART {
  id = "price_chart"
  type = LINE | BAR | PIE
  data = market.stalks.corn.history
  x_axis = "time"
  y_axis = "price"
}
```

### 10.7 Notifications

```stalk
NOTIFY {
  title = "Alert"
  message = "Something happened"
  duration = 3000    # milliseconds
}

TOAST {
  message = "Saved!"
  position = BOTTOM
}

MODAL {
  title = "Confirm"
  message = "Are you sure?"
  buttons = ["Yes", "No"]
}
```

---

## 11. IMPACT Operations

### 11.1 Tier 0: Cosmetic (Always Allowed)

No capability required. No lasting effects.

```stalk
PRINT "Hello"                    # Log to console
FLASH "element_id"               # Visual flash
SOUND "ding" | "error" | "pop"   # Play sound
self.element.content = "text"    # Update own UI
```

### 11.2 Tier 1: Personal (Always Allowed)

Affects only the player's personal state.

```stalk
player.mood += 0.1
player.anxiety -= 0.05
player.notes.add("Remember this")
```

### 11.3 Tier 2: Social (Requires ALLOW_BROADCAST)

Creates public-facing content.

```stalk
POST TO myface {
  content = "My post text"
  AUDIENCE = FRIENDS
  media = NULL
}

POST TO threadit {
  subreddit = "quantum_coffee"
  title = "New discovery"
  content = "..."
  AUDIENCE = PUBLIC
}

REACT TO post_id WITH "heart"
```

### 11.4 Tier 3: Relational (Requires ALLOW_RELATIONSHIP_WRITE)

Modifies relationships with NPCs.

```stalk
npc("Derek").trust += 0.05
npc("Derek").affinity -= 0.02

DM TO npc("Derek") {
  content = "Hey!"
}
```

### 11.5 Tier 4: Systemic (Requires ALLOW_SYSTEMIC)

Affects global game state. Very rare capability.

```stalk
market.stalks.corn.sentiment += 0.01
npc("Derek").beliefs.add("quantum coffee is real")
world.events.trigger("coffee_shortage")
```

---

## 12. Capabilities

### 12.1 Capability List

| Capability | Allows | Risk Level |
|------------|--------|------------|
| `ALLOW_BROADCAST` | Public posts, public reactions | Medium |
| `ALLOW_RELATIONSHIP_WRITE` | Modify trust/affinity | High |
| `ALLOW_NPC_CONTACT` | Send DMs to NPCs | Medium |
| `ALLOW_MARKET_INFLUENCE` | Affect stalks prices | High |
| `ALLOW_VIRALITY` | Remove reach throttle | High |
| `ALLOW_SYSTEMIC` | Global state changes | Critical |

### 12.2 Capability Acquisition

Capabilities are not freely available. They are:

- **Earned** through gameplay (relationship milestones, achievements)
- **Purchased** from CobHub marketplace (with in-game currency)
- **Granted** by NPCs who trust you
- **Inherited** from forked programs (if original had them)
- **Revoked** after major pop-safety violations

### 12.3 Capability Denial

When a program requires a capability the user doesn't have:

```
CAPABILITY DENIED

Required: ALLOW_RELATIONSHIP_WRITE
Status: Not granted

To obtain this capability:
• Reach "Close Friend" status with any NPC
• Purchase from CobHub Store (847 corn)
• Fork a program that has it (with permission)
```

---

## 13. Runtime Contract

### 13.1 Determinism Rules

**Deterministic operations:**
- All arithmetic and logical operations
- String manipulation
- Collection filtering and sorting
- Time queries (within tick resolution)
- Game state reads

**Non-deterministic operations (budgeted):**
- `random.number(min, max)` — uses budget
- `random.choice(collection)` — uses budget
- Market price changes between ticks

### 13.2 Sandbox Boundaries

STALK programs **cannot**:
- Access the filesystem
- Make network requests
- Execute arbitrary code
- Access other programs' state
- Modify game state outside IMPACT blocks
- Run longer than tick budget allows
- Allocate unlimited memory

### 13.3 Side Effect Isolation

**OBSERVE, PREDICT, DECLARE blocks are pure.** They read state but cannot modify it.

**IMPACT is the only block where side effects occur.** All world-affecting operations must be in IMPACT.

If a non-IMPACT block attempts a side effect, it's a parse error:

```
PARSE ERROR at line 15

npc("Derek").trust += 1

Side effects are only allowed in IMPACT blocks.
Move this statement to your IMPACT block.
```

### 13.4 UI State Binding

UI elements can only read state through bound variables declared in OBSERVE or DECLARE:

```stalk
OBSERVE {
  current_trust = npc("Derek").trust
}

DECLARE {
  TEXT {
    id = "trust_display"
    content = "Trust: {current_trust}"  # Bound to observed variable
  }
}
```

UI elements cannot query game state directly. This prevents hidden dependencies.

---

## 14. Execution Model

### 14.1 Trigger Modes

**ONCE:** Program runs once when launched, then stops.

```stalk
CONFIG {
  trigger = ONCE
}
```

**ON_CONDITION:** Program runs when OBSERVE conditions become true.

```stalk
CONFIG {
  trigger = ON_CONDITION
}

OBSERVE {
  should_run = npc("Derek").online AND time.is_peak
}
```

**CONTINUOUS:** Program runs on a tick loop.

```stalk
CONFIG {
  trigger = CONTINUOUS
  tick_rate = 2  # Hz
}
```

### 14.2 Tick Budget

Every program has a tick budget that limits:
- Number of game state queries per tick
- Number of random operations per tick
- Complexity of collection operations

Default budget: 100 operations per tick.

If budget exceeded:
```
BUDGET EXCEEDED

Operations this tick: 147
Budget: 100

Your program is doing too much.
Simplify OBSERVE conditions or reduce tick_rate.
```

### 14.3 Evaluation Order

Within a tick:
1. OBSERVE block evaluates (reads state, sets variables)
2. PREDICT block evaluates (makes assertions)
3. DECLARE block updates (rebinds UI to new values)
4. IMPACT block executes (if triggered by event or tick)

### 14.4 Event Handling

Events in IMPACT are processed in order:

```stalk
IMPACT {
  ON TICK {
    # Runs every tick (if CONTINUOUS mode)
  }

  ON CLICK "button_id" {
    # Runs when button clicked
  }

  ON CHANGE "slider_id" {
    # Runs when slider value changes
  }

  ON SUBMIT {
    # Runs on form submission
  }
}
```

---

## 15. Pop-Safety System

### 15.1 What Is Pop-Safety?

Pop-safety measures the social risk of a program's outputs. A "pop" is when something goes wrong socially:
- A post gets screenshotted out of context
- A prediction is publicly wrong
- A hot take alienates friends
- Trust Fall Tim is summoned unintentionally

### 15.2 Pop-Safety Factors

| Factor | Description | Weight |
|--------|-------------|--------|
| Confidence | How certain the program claims to be | High |
| Evidence | Supporting evidence for claims | High |
| Audience size | Who can see the output | High |
| Audience mismatch | Content vs audience fit | Medium |
| Timing | Cringe hours, peak hours | Medium |
| Topic sensitivity | Controversial subjects | Medium |
| Disclaimer coverage | Are disclaimers present | Low |
| Author reputation | Past pop history | Low |

### 15.3 Pop-Safety Calculation

```
pop_risk = (confidence - evidence) * audience_size * timing_modifier * topic_sensitivity
         - (disclaimer_coverage * 0.2) - (reputation * 0.1)
```

Risk levels:
- 0.0 - 0.3: LOW — minor embarrassment possible
- 0.3 - 0.6: MEDIUM — screenshots likely, trust impact possible
- 0.6 - 0.8: HIGH — viral wrong likely, relationship damage expected
- 0.8 - 1.0: CRITICAL — KERNEL POP imminent

### 15.4 KERNEL POPPED

The ultimate failure state. Occurs when:
- Pop risk exceeded 0.95
- Multiple high-risk operations in short time
- Audience mismatch was extreme
- NPCs lost trust because of your program

```
❌ KERNEL POPPED

Reason:
• Social feedback loop exceeded tolerance
• Program entered recursive irony state
• NPCs no longer sure if you were joking

Consequences:
• Trust with Derek: -15
• Reputation: -5
• Screenshots archived: 3

System recovered.
Screenshot damage irreversible.
```

---

## 16. Diagnostics & Pops

### 16.1 Diagnostic Levels

| Level | Icon | Description |
|-------|------|-------------|
| INFO | ℹ️ | Informational, no action needed |
| WARN | ⚠️ | Potential issue, review recommended |
| POP | 🎈 | Pop-safety concern, likely embarrassment |
| PANIC | ❌ | Critical error, program cannot run |

### 16.2 Parse Diagnostics

Errors in syntax or structure.

```
PANIC at line 12, col 5

OBSERVE {
  trust += 5
       ^
Side effects not allowed in OBSERVE block.
```

### 16.3 Static Diagnostics

Issues detected before execution.

```
WARN at line 8

PREDICT {
  will_succeed = TRUE
  CONFIDENCE = 0.95
  EVIDENCE = "trust me"
}

High confidence (0.95) with weak evidence.
Consider lowering CONFIDENCE to 0.6.
```

### 16.4 Runtime Pops

Issues during execution.

```
POP at runtime

Your POST reached 847 people.
Engagement: 12 likes, 3 comments, 47 screenshots.
Sentiment: MIXED

Top screenshot caption:
"this guy really said quantum coffee cures loneliness 💀"
```

### 16.5 Social Pops (Simulated Consequences)

The IDE can simulate social fallout before publishing:

```
SIMULATED SOCIAL POP

If you publish this with current settings:

• 73% chance Derek sees it
• 45% chance Derek misunderstands
• 12% chance screenshot goes viral
• 3% chance Trust Fall Tim quote-tweets

Recommendation: Add DISCLAIMER or reduce AUDIENCE to FRIENDS.
```

---

## 17. Standard Library

### 17.1 Math Functions

```stalk
abs(x)              # Absolute value
round(x)            # Round to nearest integer
round(x, decimals)  # Round to decimal places
floor(x)            # Round down
ceil(x)             # Round up
min(a, b)           # Minimum
max(a, b)           # Maximum
clamp(x, min, max)  # Clamp to range
random.number(min, max)  # Random number (uses budget)
random.choice(collection) # Random element (uses budget)
```

### 17.2 String Functions

```stalk
str.upper()         # Uppercase
str.lower()         # Lowercase
str.trim()          # Remove whitespace
str.contains(sub)   # Contains substring
str.starts_with(s)  # Starts with
str.ends_with(s)    # Ends with
str.replace(old, new) # Replace substring
str.split(delimiter) # Split to collection
str.length          # Character count
```

### 17.3 Collection Functions

```stalk
col.count()         # Number of elements
col.first()         # First element
col.last()          # Last element
col.at(index)       # Element at index
col.contains(item)  # Contains item
col.where(condition) # Filter
col.sort_by(field)  # Sort
col.reverse()       # Reverse order
col.limit(n)        # Take first n
col.skip(n)         # Skip first n
col.sum(field)      # Sum of field
col.avg(field)      # Average of field
col.min(field)      # Minimum of field
col.max(field)      # Maximum of field
```

### 17.4 Time Functions

```stalk
time.now            # Current timestamp
time.elapsed(ts)    # Duration since timestamp
time.until(ts)      # Duration until timestamp
time.format(ts, fmt) # Format timestamp
time.parse(str, fmt) # Parse timestamp
```

### 17.5 Social Functions

```stalk
engagement_rate(post)      # Engagement percentage
cringe_factor(content)     # Cringe score 0-1
screenshot_risk(post)      # Screenshot probability
audience_match(content, audience) # Fit score
sentiment(text)            # Sentiment -1 to 1
```

---

## 18. Examples

### 18.1 Minimal: Hello World with IMPACT

```stalk
STALK "hello-world" {
  OBSERVE {
    audience_attention = feed.engagement_rate
  }

  PREDICT {
    reaction = "confusion"
    CONFIDENCE = 0.6
    EVIDENCE = "People don't expect hello worlds to have consequences"
  }

  DECLARE {
    TEXT {
      id = "greeting"
      content = "Hello, World"
    }
  }

  IMPACT {
    PRINT "Hello, World"
    player.trust -= 0.01  # Everything has consequences
  }
}
```

### 18.2 Calculator: Quantum Coffee Calculator

```stalk
STALK "quantum-coffee-calc" {
  CONFIG {
    trigger = ONCE
    author = player.username
    description = "Calculate optimal quantum coffee dosage"
  }

  DISCLAIMER {
    "Not medical advice."
    "Results based on the Martinez Study (n=847)."
  }

  OBSERVE {
    derek_online = npc("Derek").online
    base_entanglement = 0.73
  }

  DECLARE {
    WINDOW {
      title = "Quantum Coffee Calculator"
      size = (420, 300)
    }

    SLIDER {
      id = "beans"
      label = "Bean Count"
      range = (1, 100)
      default = 47
    }

    SLIDER {
      id = "entanglement"
      label = "Entanglement Factor"
      range = (0, 1)
      default = base_entanglement
    }

    BUTTON {
      id = "calculate"
      label = "Calculate Optimal Dose"
    }

    TEXT {
      id = "result"
      content = ""
      style = RESULT
    }
  }

  IMPACT {
    ON CLICK "calculate" {
      dose = beans * entanglement * 8.47
      self.result.content = "Optimal dose: {round(dose, 2)}mg"

      IF derek_online {
        NOTIFY {
          title = "Derek noticed"
          message = "He approves of your methodology"
        }
        npc("Derek").affinity += 0.01
      }
    }
  }
}
```

### 18.3 Observer: Trust Fall Tim Alert

```stalk
STALK "tim-alert" {
  REQUIRE {
    ALLOW_NPC_CONTACT
  }

  CONFIG {
    trigger = ON_CONDITION
    tick_rate = 1
  }

  OBSERVE {
    tim = npc("Trust Fall Tim")
    tim_nearby = nearby.npcs.contains(tim)
    tim_confidence = tim.mood * 1.2  # He's always overconfident
    fall_imminent = tim_nearby AND tim_confidence > 0.9
  }

  PREDICT {
    someone_will_catch = FALSE
    CONFIDENCE = 0.78  # Historical catch rate
    EVIDENCE = "Based on 2,847 documented falls"
  }

  DECLARE {
    NOTIFY {
      title = "⚠️ TIM ALERT"
      message = "Trust Fall Tim detected. Brace yourself."
    }
  }

  IMPACT {
    ON fall_imminent {
      SOUND "alert"
      player.anxiety += 0.1

      DM TO tim {
        content = "Tim, please, not today"
      }
    }
  }
}
```

### 18.4 Predictor: Stalks Market Forecaster

```stalk
STALK "corn-predictor" {
  REQUIRE {
    ALLOW_BROADCAST
  }

  CONFIG {
    trigger = CONTINUOUS
    tick_rate = 0.1  # Every 10 seconds
    max_confidence = 0.7  # Self-imposed cap
  }

  DISCLAIMER {
    "Not financial advice."
    "Past performance does not predict future performance."
    "The market is fake and so is this prediction."
  }

  OBSERVE {
    corn = market.stalks.corn
    price = corn.price
    change = corn.change_24h
    volume = corn.volume
    sentiment = corn.sentiment

    derek_posting = npc("Derek").posts.recent.where(
      content.contains("quantum") OR content.contains("coffee")
    ).count() > 0
  }

  PREDICT {
    direction = IF change > 0.05 THEN "up"
                ELSE IF change < -0.05 THEN "down"
                ELSE "sideways"

    magnitude = abs(change) * volume * sentiment

    CONFIDENCE = clamp(magnitude * 0.5, 0.1, max_confidence)
    EVIDENCE = IF derek_posting THEN "Derek is posting about quantum coffee"
               ELSE "Market momentum analysis"
    TIMEFRAME = "1h"
  }

  DECLARE {
    WINDOW {
      title = "Corn Predictor 🌽"
      size = (350, 200)
    }

    TEXT {
      id = "prediction"
      content = "Corn will go {direction}"
      style = HEADING
    }

    TEXT {
      id = "confidence"
      content = "Confidence: {round(CONFIDENCE * 100)}%"
    }

    CHART {
      id = "history"
      type = LINE
      data = corn.history.limit(24)
    }
  }

  IMPACT {
    ON change > 0.1 OR change < -0.1 {
      POST TO threadit {
        subreddit = "stalks_trading"
        title = "🌽 CORN {IF change > 0 THEN '📈' ELSE '📉'} {round(change * 100)}%"
        content = "Predicted direction: {direction}\nConfidence: {round(CONFIDENCE * 100)}%\n\n{DISCLAIMER}"
        AUDIENCE = PUBLIC
      }
    }
  }
}
```

### 18.5 Full App: Relationship Dashboard

```stalk
STALK "relationship-dashboard" {
  REQUIRE {
    ALLOW_RELATIONSHIP_WRITE
    ALLOW_NPC_CONTACT
  }

  CONFIG {
    trigger = CONTINUOUS
    tick_rate = 0.5
    description = "Monitor and manage your NPC relationships"
  }

  OBSERVE {
    all_npcs = player.relationships
    friends = all_npcs.where(trust > 50)
    acquaintances = all_npcs.where(trust >= 25 AND trust <= 50)
    strangers = all_npcs.where(trust < 25)

    online_friends = friends.where(npc.online)

    lowest_trust = all_npcs.min(trust)
    highest_trust = all_npcs.max(trust)
    avg_trust = all_npcs.avg(trust)

    declining = all_npcs.where(trust_change_7d < -5)
    improving = all_npcs.where(trust_change_7d > 5)
  }

  PREDICT {
    someone_will_leave = declining.count() > 2
    CONFIDENCE = 0.4
    EVIDENCE = "Multiple relationships declining simultaneously"
  }

  DECLARE {
    WINDOW {
      title = "Relationship Dashboard"
      size = (600, 500)
    }

    TEXT {
      id = "header"
      content = "Your Relationships"
      style = HEADING
    }

    TEXT {
      id = "stats"
      content = "Friends: {friends.count()} | Acquaintances: {acquaintances.count()} | Strangers: {strangers.count()}"
    }

    TEXT {
      id = "avg"
      content = "Average trust: {round(avg_trust)}"
    }

    TEXT {
      id = "online"
      content = "Online friends: {online_friends.count()}"
      style = SUBHEADING
    }

    TEXT {
      id = "warning"
      content = IF declining.count() > 0
                THEN "⚠️ {declining.count()} relationship(s) declining"
                ELSE "✓ All relationships stable"
      style = IF declining.count() > 0 THEN ERROR ELSE NORMAL
    }

    BUTTON {
      id = "reach_out"
      label = "Send Goodwill Messages"
      disabled = declining.count() == 0
    }
  }

  IMPACT {
    ON CLICK "reach_out" {
      FOR npc IN declining {
        DM TO npc {
          content = "Hey {npc.name}, just thinking of you. Hope you're doing well!"
        }
        npc.trust += 0.5
        npc.affinity += 0.3
      }

      TOAST {
        message = "Sent messages to {declining.count()} NPCs"
      }
    }
  }
}
```

---

## Appendix A: Grammar (EBNF)

```ebnf
program         = "STALK" string "{" block* "}" ;
block           = require_block | config_block | observe_block | predict_block
                | declare_block | impact_block | disclaimer_block ;

require_block   = "REQUIRE" "{" capability* "}" ;
config_block    = "CONFIG" "{" assignment* "}" ;
observe_block   = "OBSERVE" "{" (assignment | condition)* "}" ;
predict_block   = "PREDICT" "{" prediction* "}" ;
declare_block   = "DECLARE" "{" ui_element* "}" ;
impact_block    = "IMPACT" "{" impact_statement* "}" ;
disclaimer_block = "DISCLAIMER" "{" string* "}" ;

capability      = "ALLOW_" identifier ;
assignment      = identifier "=" expression ;
condition       = identifier "=" expression ;

prediction      = identifier "=" expression metadata* ;
metadata        = "CONFIDENCE" "=" number
                | "EVIDENCE" "=" string
                | "TIMEFRAME" "=" string ;

ui_element      = ui_type "{" property* "}" ;
ui_type         = "WINDOW" | "TEXT" | "BUTTON" | "SLIDER" | "INPUT" | "CHART"
                | "NOTIFY" | "TOAST" | "MODAL" ;
property        = identifier "=" expression ;

impact_statement = "ON" trigger "{" statement* "}"
                 | action ;
trigger         = "TICK" | "CLICK" string | "CHANGE" string | "SUBMIT"
                | expression ;
action          = tier0_action | tier1_action | tier2_action | tier3_action | tier4_action ;

expression      = literal | identifier | path | binary_op | unary_op | call | conditional ;
path            = identifier ("." identifier | "[" expression "]" | "(" arguments ")")* ;
binary_op       = expression operator expression ;
unary_op        = "NOT" expression | "-" expression ;
call            = identifier "(" arguments? ")" ;
conditional     = "IF" expression "THEN" expression ("ELSE" expression)? ;

literal         = number | string | boolean | "NULL" | "UNKNOWN" ;
operator        = "+" | "-" | "*" | "/" | "%" | "==" | "!=" | ">" | "<"
                | ">=" | "<=" | "~=" | "AND" | "OR" | "UNLESS" ;
```

---

## Appendix B: Reserved for Future

The following are reserved for future versions and should not be used:

- `IMPORT` — future module system
- `EXPORT` — future module system
- `CLASS` — will never be added (not that kind of language)
- `FUNCTION` — may be added for reusable snippets
- `ASYNC` / `AWAIT` — execution is already async, no need
- `TRY` / `CATCH` — errors are pops, not exceptions
- `LOOP` / `WHILE` / `FOR` — intentionally limited iteration

---

## Appendix C: Changelog

**v0.1.0 (Draft)**
- Initial specification
- Core block structure defined
- Pop-safety system designed
- Capability model established

---

*This specification is the source of truth for STALK. The IDE, interpreter, and game systems all derive their behavior from this document.*
