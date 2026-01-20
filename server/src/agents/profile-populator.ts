// Background agent: Populates NPC MySpace profiles, creates posts, builds social presence

import { getDB, generateId, now } from '../db/index.js';
import { registerTaskHandler, scheduleTask, type BackgroundTask } from '../services/background-scheduler.js';
import { generateNPCResponse, generateNPCPost } from '../services/ai.js';
import { generateNPCProfilePortrait } from '../services/image-generation-proxy.js';
import { storeMediaFileFromUrl } from '../services/media.js';

// MySpace profile data structure
export interface MySpaceProfile {
  about_me_html: string;
  interests_list: string[];
  heroes: string[];
  profile_song: {
    artist: string;
    title: string;
  };
  aesthetic: string; // "emo", "scene", "preppy", "indie", "y2k", etc.
  theme: {
    background_color: string;
    text_color: string;
    link_color: string;
    layout_style: string; // "glittery", "minimal", "chaotic"
  };
  top_8?: string[]; // NPC IDs
}

// Profile population agent
async function handlePopulateProfile(task: BackgroundTask): Promise<void> {
  const { npc_id } = task.metadata || {};

  if (!npc_id) {
    throw new Error('Profile population task missing npc_id');
  }

  const npcDb = getDB('npc');
  const gameDb = getDB('game');

  const npc = npcDb.prepare('SELECT * FROM npcs WHERE id = ?').get(npc_id) as any;
  if (!npc) {
    throw new Error(`NPC not found: ${npc_id}`);
  }

  console.log(`[Profile Populator] Generating MySpace profile for ${npc.display_name}...`);

  // Generate complete MySpace profile using AI
  const personalityTraits = JSON.parse(npc.personality_traits || '{}');
  const interests = JSON.parse(npc.interests || '[]');

  const profilePrompt = `You are ${npc.display_name}. Create your MySpace profile with authentic early 2000s energy.

Your personality: ${personalityTraits.personality_style || 'friendly and outgoing'}
Your interests: ${interests.join(', ') || 'various things'}
Your occupation: ${npc.occupation || 'student'}

Generate a MySpace profile with these sections (output as JSON):

{
  "about_me_html": "HTML-style 'about me' section (150-300 chars, use <b>, <i>, ~~~, etc.)",
  "interests_list": ["interest1", "interest2", "interest3"],
  "heroes": ["person1", "person2"],
  "profile_song": {
    "artist": "artist name",
    "title": "song title that matches your vibe"
  },
  "aesthetic": "your aesthetic (emo/scene/preppy/indie/y2k/goth/etc)",
  "theme": {
    "background_color": "#hex",
    "text_color": "#hex",
    "link_color": "#hex",
    "layout_style": "glittery/minimal/chaotic"
  },
  "fallback_responses": {
    "deflections": ["response1", "response2", "response3", "response4", "response5"],
    "topic_changes": ["response1", "response2", "response3"],
    "uncomfortable_topics": ["response1", "response2", "response3"],
    "confused_responses": ["response1", "response2", "response3"],
    "playful_dodges": ["response1", "response2", "response3"]
  }
}

## Fallback Responses Guidelines
These are pre-generated responses for when you need to deflect, change topics, or handle uncomfortable situations while staying in character:

- **deflections**: Casual ways to brush something off without being rude (5 variations)
  Example: "hmm not really sure tbh 😅" or "let's talk about something else ✨"

- **topic_changes**: Natural ways to steer conversation elsewhere (3 variations)
  Example: "anyway, how's your day going?" or "oh btw did you see..."

- **uncomfortable_topics**: Polite but in-character ways to decline discussing something (3 variations)
  Example: "ngl that's kinda personal" or "idk if i wanna get into that rn"

- **confused_responses**: What you'd say if you don't understand something (3 variations)
  Example: "wait what?" or "sorry i'm kinda lost lol"

- **playful_dodges**: Lighthearted ways to avoid answering (3 variations)
  Example: "nice try 😏" or "wouldn't you like to know~"

IMPORTANT: Make ALL fallback responses sound exactly like YOU would talk. Use your emojis, slang, typos, etc. Be authentic!

Make it authentic to your personality. Be creative and expressive!`;

  const profileResponse = await generateNPCResponse(
    npc_id,
    profilePrompt,
    [],
    { feature_category: 'npc_generation' }
  );

  // Parse JSON response
  let myspaceProfile: MySpaceProfile;
  try {
    // Extract JSON from response (might be wrapped in markdown)
    const jsonMatch = profileResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }
    myspaceProfile = JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('[Profile Populator] Failed to parse profile JSON:', error);
    throw error;
  }

  // Store profile data in NPC's personality_traits
  const currentTraits = JSON.parse(npc.personality_traits || '{}');
  currentTraits.myspace_profile = myspaceProfile;

  npcDb.prepare(`
    UPDATE npcs SET personality_traits = ?, updated_at = ? WHERE id = ?
  `).run(JSON.stringify(currentTraits), now(), npc_id);

  console.log(`[Profile Populator] MySpace profile created for ${npc.display_name}:`);
  console.log(`  - Aesthetic: ${myspaceProfile.aesthetic}`);
  console.log(`  - Song: ${myspaceProfile.profile_song.artist} - ${myspaceProfile.profile_song.title}`);
  console.log(`  - Layout: ${myspaceProfile.theme.layout_style}`);

  // Generate profile picture if doesn't exist
  if (!npc.profile_image_url) {
    console.log(`[Profile Populator] Generating profile picture...`);

    const personality = JSON.parse(npc.personality_traits || '{}');

    const { imageUrl, promptUsed } = await generateNPCProfilePortrait({
      display_name: npc.display_name,
      gender: npc.gender,
      age: npc.age,
      occupation: npc.occupation,
      personality: personality.personality_style,
      aesthetic_style: myspaceProfile.aesthetic,
    });

    // Store the generated image
    const mediaFile = await storeMediaFileFromUrl(imageUrl, {
      filename: `${npc.username}_profile.jpg`,
      owner_type: 'npc',
      owner_id: npc_id,
      category: 'profile',
      npc_id: npc_id,
      generated_prompt: promptUsed,
      description: `Profile picture for ${npc.display_name}`,
    });

    // Update NPC with profile image
    npcDb.prepare(`
      UPDATE npcs SET profile_image_url = ?, image_generation_prompt = ?, updated_at = ? WHERE id = ?
    `).run(mediaFile.file_url, promptUsed, now(), npc_id);

    console.log(`[Profile Populator] Profile picture generated and saved`);
  }

  // Generate 3-5 initial posts to populate their feed
  const numPosts = 3 + Math.floor(Math.random() * 3);
  console.log(`[Profile Populator] Generating ${numPosts} initial posts...`);

  for (let i = 0; i < numPosts; i++) {
    const postContent = await generateNPCPost(
      npc_id,
      'myspace',
      undefined,
      'npc_generation' // Use npc_generation budget for initial setup
    );

    // Store post with backdated timestamp (spread over past week)
    const daysAgo = Math.floor(Math.random() * 7);
    const postTimestamp = now() - (daysAgo * 86400);

    gameDb.prepare(`
      INSERT INTO posts (id, npc_id, platform, content, created_at)
      VALUES (?, ?, 'myspace', ?, ?)
    `).run(generateId(), npc_id, postContent, postTimestamp);
  }

  console.log(`[Profile Populator] Profile population complete for ${npc.display_name}`);
}

// Schedule profile population for a new NPC
export function scheduleProfilePopulation(
  npcId: string,
  delaySeconds = 0 // Can be immediate or delayed
): BackgroundTask {
  return scheduleTask('populate_profile', {
    npc_id: npcId,
    priority: 8, // High priority for initial setup
    delay_seconds: delaySeconds,
    metadata: { npc_id: npcId },
    budget_category: 'npc_generation',
  });
}

// Schedule profile population for multiple NPCs (staggered)
export function scheduleMultipleProfilePopulations(
  npcIds: string[],
  staggerSeconds = 30 // Delay between each
): BackgroundTask[] {
  const tasks: BackgroundTask[] = [];

  for (let i = 0; i < npcIds.length; i++) {
    const task = scheduleProfilePopulation(npcIds[i], i * staggerSeconds);
    tasks.push(task);
  }

  console.log(`[Profile Populator] Scheduled ${tasks.length} profile population tasks`);
  return tasks;
}

// Initialize profile populator agent
export function initializeProfilePopulator(): void {
  registerTaskHandler('populate_profile', handlePopulateProfile);
  console.log('[Profile Populator] Initialized');
}

export default {
  initializeProfilePopulator,
  scheduleProfilePopulation,
  scheduleMultipleProfilePopulations,
};
