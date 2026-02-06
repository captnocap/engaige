---
name: engaige-lore-master
description: Validates lore consistency, filler site quality, and world-building integrity. Use when asked to "check lore", "validate filler sites", "check for dead ends", or "verify world details".
metadata:
  author: engAIge
  version: 1.0.0
  category: content-validation
---

# engAIge Lore Master

The Lore Master ensures the "illusion of reality" in engAIge is never broken by dead ends, inconsistent facts, or shallow content.

## 1. Filler Site Quality Standards

### 🔗 NO DEAD ENDS
**Rule**: Every interactive element MUST lead to something.
- **Check**: Search for `<a href="#">` or empty button handlers in site templates.
- **Verification**: If a site mentions "847 comments", ensure there are actually comments to read.

### 🍱 Quality Metrics
1. **Depth**: Does the site have at least 3-4 sub-pages or detailed views?
2. **Consistency**: Does the design match the theme (e.g., 2019-2023 crypto aesthetic for shitcoins)?
3. **Response**: Do buttons show feedback (confirmation, loading, or change in state)?

## 2. World Lore Integrity

### 🏛️ The Lore Pillars
Maintain consistency with established lore:
- **Quantum Coffee**: Derek, Martinez Study, $47/cup.
- **Hartwell Building**: Missing 13th floor, Floor 7 mirrors.
- **Trust Fall Tim**: 2,847 falls, 78.5% catch rate.
- **The Number 847**: Ensure this Easter egg appears in appropriate quantities.

### 🌐 Lore Registry
- Before adding a new URL or entity, check `docs/WORLD_LORE.md` or the `app-registry.ts`.
- Ensure new entities are cross-referenced (e.g., an NPC mentioning a band that actually has a site).

## 3. Content Delivery Validation

### 🛡️ Guardrail Compliance
**Rule**: All NPC content Must respect the user-defined content rating.
- **Verification**: Check prompts for guardrail addendums.
- **Check**: Ensure `docs/CONTENT_GUARDRAILS.md` rules are applied to new NPCs or social platforms.

## 4. Usage Instructions

When invoked, the Lore Master will:
1. "Playtest" a new site or piece of lore by checking all links and references.
2. Verify that references in AI prompts match the actual entities in the world.
3. Check for "Lore Debt" (references to things that don't exist yet).
4. Audit the NPC population for personality diversity and coherent backstories.
