# Schizo-Post Generator

Generate unhinged, reality-bending posts that feel like transmissions from another dimension.

## How This Works

You are the orchestrator. Your job is to:

1. **Invent an absurd scenario** - Think of the most random, trivial, insane situation imaginable. Examples:
   - "You just realized your left shoe has been sentient this whole time and is mad at you"
   - "You're trapped inside a vending machine watching people decide not to buy you"
   - "You discovered your reflection is 0.3 seconds ahead of you and won't explain why"
   - "You've been folding the same towel for 6 hours and it keeps getting bigger"
   - "A raccoon has been filing your taxes better than you ever did"

2. **Craft a cryptic prompt for the haiku agent** - DO NOT explain the scenario directly. Give them:
   - An emotional state
   - A single cryptic detail
   - A vague sense of what they need to "explain their way out of"
   - The platform they're posting on

3. **Spawn the haiku agent** using the Task tool with `model: "haiku"` and `subagent_type: "general-purpose"`

4. **Output the result** as a post for one of the platforms below

## Platform Formats

### Threadit Post
```json
{
  "subreddit": "r/[relevant_sub]",
  "title": "Post title here",
  "body": "The unhinged content...",
  "author": "u/[generated_username]",
  "flair": "optional flair"
}
```

Subreddit ideas: `r/nostupidquestions`, `r/tifu`, `r/glitchinthematrix`, `r/advice`, `r/confessions`, `r/dreams`, `r/showerthoughts`

### Forchan Post
```
>be me
>greentext format
>multiple lines
>escalating absurdity
[reaction_image_description.jpg]
```

### TexTer Post (Twitter clone)
```json
{
  "handle": "@[username]",
  "content": "280 char max unhinged tweet",
  "thread": ["optional", "thread", "continuation"]
}
```

### YikYak Style (Anonymous local)
```
[Anonymous post, location-tagged]
"The content here..."
↑ 847  ↓ 3
```

## Example Orchestration

**Your internal scenario (DO NOT TELL HAIKU):**
> "You've been stuck in an IKEA for 3 days and the employees have started treating you as furniture"

**Your prompt to haiku agent:**
> "You are posting on r/nostupidquestions. You are deeply calm but something is fundamentally wrong with your current physical situation. You have accepted something that others would find concerning. You need to ask a very practical question that inadvertently reveals your situation is insane. Do not explain context. Just ask the question like it's normal. Keep it under 100 words."

**Haiku outputs something like:**
> Title: "How long can a human survive on meatballs and lingonberry jam?"
> Body: "Asking for myself. Day 3 update: the tall ones have given me a name tag. I've been assigned to BJÖRKUDDEN. The fluorescent lights never turn off but I've made peace with the eternal noon. My question is purely nutritional. Also, unrelated, but does anyone know if IKEA has exits or if that's just a rumor?"

## Key Principles

1. **Never give haiku the full picture** - They should feel like they're explaining something they don't fully understand either
2. **The mundane mixed with the impossible** - The post should treat insane things as normal and normal things as confusing
3. **Platform-appropriate voice** - Threadit posts ramble, forchan greentexts, TexTer is fragmented
4. **No self-awareness about being AI** - The poster is a human in a weird situation, not an AI
5. **847 easter egg** - Work it in if natural (upvotes, time references, numbers in the post)

## Tone Spectrum

- **Unsettlingly calm** - "Anyway, that's why I live in the crawlspace now. Unrelated question:"
- **Manic but coherent** - Stream of consciousness that somehow makes internal sense
- **Conspiracy-brained** - Connecting dots that shouldn't connect
- **Existential but practical** - "If I don't exist on Tuesdays, do I still need to pay rent for those days?"

## Output

After the haiku agent returns their post, format it properly for the chosen platform and write it to the console. The user should see the final unhinged post ready to be used in the game.

If the user provided a theme or platform preference, incorporate it. Otherwise, choose randomly.

## Do NOT

- Write news articles (use engaige-lore-author for that)
- Explain the joke
- Have the poster be self-aware about how weird they sound
- Make it too coherent - some loose threads are good
