/**
 * Social Autopilot Agent
 *
 * Makes NPCs autonomously post and react on social media.
 * Handles 'generate_post' and 'react_to_post' background tasks.
 *
 * The chaos engine that brings the social simulation to life.
 */

import { getDB, generateId, now } from '../db/index.js';
import { registerTaskHandler, scheduleTask, type BackgroundTask } from '../services/background-scheduler.js';
import { queuedGenerateNPCPost, Priority } from '../services/ai.js';
import { getAllNPCs, type NPC } from '../services/npc.js';
import { eventBus, EventTypes } from '../events/index.js';
import { errorLogger } from '../services/error-logger.js';
import { broadcastToClients } from '../services/broadcast.js';

// ============================================================================
// Types
// ============================================================================

interface PostMetadata {
  platform: 'myface' | 'instasnap' | 'threadit';
  prompt?: string;
  mood?: string;
  reacting_to_post_id?: string;
}

interface GeneratedPost {
  npc_id: string;
  content: string;
  platform: string;
  images?: string[];
  timestamp: number;
}

// Platform-specific prompts to guide content style
const PLATFORM_PROMPTS: Record<string, string> = {
  myface: `Create a casual MyFace status update. Be conversational, use emojis sparingly, reference your current mood or recent activities. Keep it under 280 characters. Don't use hashtags.`,

  instasnap: `Create an InstaSnap caption for a photo post. Be aesthetic and engaging. Include 2-4 relevant hashtags at the end. Reference visual content you're sharing. Keep it under 200 characters before hashtags.`,

  threadit: `Create a Threadit post. Be opinionated or share something interesting. Can be longer and more thoughtful. Use casual internet speak. Don't use hashtags. Can be a hot take, question, or story.`,
};

// Moods that influence posting style
const MOOD_MODIFIERS: Record<string, string> = {
  happy: 'You are in a great mood! Be enthusiastic and positive.',
  sad: 'You are feeling down. Be more introspective or seek support.',
  excited: 'You are super excited about something! Show your energy!',
  bored: 'You are bored. Complain a little or try to stir up engagement.',
  angry: 'You are frustrated about something. Vent a bit (keep it appropriate).',
  tired: 'You are exhausted. Be low-energy, maybe a bit dramatic about it.',
  creative: 'You are feeling inspired! Share something artistic or profound.',
  chaotic: 'You are feeling chaotic. Be random, funny, or slightly unhinged.',
};

// ============================================================================
// Post Generation Handler
// ============================================================================

async function handleGeneratePost(task: BackgroundTask): Promise<void> {
  const { npc_id, metadata } = task;
  if (!npc_id) {
    throw new Error('generate_post task requires npc_id');
  }

  const postMetadata = (metadata || {}) as PostMetadata;
  const platform = postMetadata.platform || pickRandomPlatform();
  const mood = postMetadata.mood || pickRandomMood();

  console.log(`[SocialAutopilot] Generating ${platform} post for NPC ${npc_id} (mood: ${mood})`);

  // Build the prompt
  let prompt = PLATFORM_PROMPTS[platform] || PLATFORM_PROMPTS.myface;
  prompt += '\n\n' + (MOOD_MODIFIERS[mood] || '');

  if (postMetadata.prompt) {
    prompt += `\n\nTopic suggestion: ${postMetadata.prompt}`;
  }

  try {
    // Generate the post content using AI
    const result = await queuedGenerateNPCPost(npc_id, platform, prompt, {
      priority: Priority.LOW,
      isBackground: true,
      featureCategory: 'autonomous_posts',
    });

    if (result.status !== 'completed' || !result.result) {
      console.log(`[SocialAutopilot] Post generation deferred or failed: ${result.status}`);
      return;
    }

    const content = result.result;

    // Store the post in the database
    const postId = generateId();
    const db = getDB('game');

    db.prepare(`
      INSERT INTO posts (id, author_id, author_type, content, platform, created_at)
      VALUES (?, ?, 'npc', ?, ?, ?)
    `).run(postId, npc_id, content, platform, now());

    console.log(`[SocialAutopilot] NPC ${npc_id} posted on ${platform}: "${content.substring(0, 50)}..."`);

    // Emit event
    eventBus.fire(EventTypes.SOCIAL_POST_CREATED, {
      post_id: postId,
      platform,
      content,
      has_media: false,
    }, {
      source: 'social-autopilot',
      npc_id,
      importance: 0.6,
    });

    // Broadcast to frontend
    broadcastToClients('social:newPost', {
      post_id: postId,
      npc_id,
      content,
      platform,
      timestamp: now(),
    });

    // Schedule reactions from other NPCs (with some randomness)
    scheduleReactionsToPost(postId, npc_id, platform);

  } catch (error: any) {
    errorLogger.log(error, {
      source: 'social-autopilot',
      operation: 'generate_post',
      npc_id,
      metadata: { platform, mood },
    });
    throw error;
  }
}

// ============================================================================
// React to Post Handler
// ============================================================================

async function handleReactToPost(task: BackgroundTask): Promise<void> {
  const { npc_id, metadata } = task;
  if (!npc_id) {
    throw new Error('react_to_post task requires npc_id');
  }

  const postId = (metadata as any)?.post_id;
  if (!postId) {
    throw new Error('react_to_post task requires post_id in metadata');
  }

  const db = getDB('game');
  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(postId) as any;

  if (!post) {
    console.log(`[SocialAutopilot] Post ${postId} not found, skipping reaction`);
    return;
  }

  // Don't react to own posts
  if (post.author_id === npc_id) {
    return;
  }

  const reactionType = (metadata as any)?.reaction_type || pickReactionType();

  console.log(`[SocialAutopilot] NPC ${npc_id} reacting to post ${postId} with ${reactionType}`);

  try {
    if (reactionType === 'like') {
      // Simple like - no AI needed
      const existingLike = db.prepare(
        'SELECT id FROM post_likes WHERE post_id = ? AND user_id = ?'
      ).get(postId, npc_id);

      if (!existingLike) {
        db.prepare(`
          INSERT INTO post_likes (id, post_id, user_id, user_type, created_at)
          VALUES (?, ?, ?, 'npc', ?)
        `).run(generateId(), postId, npc_id, now());

        eventBus.fire(EventTypes.SOCIAL_POST_LIKED, {
          post_id: postId,
          interaction_type: 'like',
          actor_type: 'npc',
          actor_id: npc_id,
        }, {
          source: 'social-autopilot',
          npc_id,
          post_id: postId,
        });

        broadcastToClients('social:postLiked', { post_id: postId, npc_id });
      }

    } else if (reactionType === 'comment') {
      // Generate a comment using AI
      const prompt = `Write a short comment (1-2 sentences max) reacting to this post: "${post.content.substring(0, 200)}"

Be natural and conversational. React authentically based on your personality. You can be supportive, funny, curious, or even slightly sarcastic if that fits your character.`;

      const result = await queuedGenerateNPCPost(npc_id, 'comment', prompt, {
        priority: Priority.LOW,
        isBackground: true,
        featureCategory: 'autonomous_posts',
      });

      if (result.status === 'completed' && result.result) {
        const commentContent = result.result;
        const commentId = generateId();

        db.prepare(`
          INSERT INTO post_comments (id, post_id, author_id, author_type, content, created_at)
          VALUES (?, ?, ?, 'npc', ?, ?)
        `).run(commentId, postId, npc_id, commentContent, now());

        eventBus.fire(EventTypes.SOCIAL_POST_COMMENTED, {
          post_id: postId,
          interaction_type: 'comment',
          actor_type: 'npc',
          actor_id: npc_id,
          content: commentContent,
        }, {
          source: 'social-autopilot',
          npc_id,
          post_id: postId,
        });

        broadcastToClients('social:newComment', {
          post_id: postId,
          comment_id: commentId,
          npc_id,
          content: commentContent,
        });

        console.log(`[SocialAutopilot] NPC ${npc_id} commented: "${commentContent.substring(0, 40)}..."`);
      }
    }

  } catch (error: any) {
    errorLogger.log(error, {
      source: 'social-autopilot',
      operation: 'react_to_post',
      npc_id,
      metadata: { post_id: postId, reaction_type: reactionType },
    });
    throw error;
  }
}

// ============================================================================
// Scheduling Helpers
// ============================================================================

/**
 * Schedule reactions from other NPCs to a new post
 */
function scheduleReactionsToPost(postId: string, authorId: string, platform: string): void {
  const npcs = getAllNPCs();

  // Filter out the author and randomly select some NPCs to react
  const otherNpcs = npcs.filter(npc => npc.id !== authorId);
  const reactingNpcs = otherNpcs
    .filter(() => Math.random() < 0.4) // 40% chance each NPC reacts
    .slice(0, 5); // Max 5 reactions per post

  for (const npc of reactingNpcs) {
    // Random delay between 1-30 minutes
    const delaySeconds = Math.floor(Math.random() * 1800) + 60;

    scheduleTask('react_to_post', {
      npc_id: npc.id,
      delay_seconds: delaySeconds,
      priority: 3,
      metadata: {
        post_id: postId,
        reaction_type: Math.random() < 0.7 ? 'like' : 'comment', // 70% likes, 30% comments
      },
      budget_category: 'autonomous_posts',
    });
  }

  console.log(`[SocialAutopilot] Scheduled ${reactingNpcs.length} reactions to post ${postId}`);
}

/**
 * Schedule random posts for all active NPCs
 */
export function scheduleRandomPosts(options: {
  minDelayMinutes?: number;
  maxDelayMinutes?: number;
  postsPerNpc?: number;
} = {}): void {
  const {
    minDelayMinutes = 5,
    maxDelayMinutes = 120,
    postsPerNpc = 1,
  } = options;

  const npcs = getAllNPCs();

  for (const npc of npcs) {
    for (let i = 0; i < postsPerNpc; i++) {
      const delaySeconds = Math.floor(
        Math.random() * (maxDelayMinutes - minDelayMinutes) * 60
      ) + (minDelayMinutes * 60);

      scheduleTask('generate_post', {
        npc_id: npc.id,
        delay_seconds: delaySeconds,
        priority: 4,
        metadata: {
          platform: pickRandomPlatform(),
          mood: pickRandomMood(),
        },
        budget_category: 'autonomous_posts',
      });
    }
  }

  console.log(`[SocialAutopilot] Scheduled ${npcs.length * postsPerNpc} random posts`);
}

/**
 * Kick off the social chaos - call this when the game starts
 */
export function startSocialAutopilot(options: {
  initialBurst?: boolean;
  postIntervalMinutes?: number;
} = {}): void {
  const { initialBurst = true, postIntervalMinutes = 30 } = options;

  console.log('[SocialAutopilot] Starting autonomous social activity...');

  // Initial burst of posts
  if (initialBurst) {
    scheduleRandomPosts({
      minDelayMinutes: 1,
      maxDelayMinutes: 10,
      postsPerNpc: 1,
    });
  }

  // Schedule recurring posts
  setInterval(() => {
    scheduleRandomPosts({
      minDelayMinutes: 5,
      maxDelayMinutes: postIntervalMinutes,
      postsPerNpc: 1,
    });
  }, postIntervalMinutes * 60 * 1000);
}

// ============================================================================
// Utility Functions
// ============================================================================

function pickRandomPlatform(): 'myface' | 'instasnap' | 'threadit' {
  const platforms: Array<'myface' | 'instasnap' | 'threadit'> = ['myface', 'instasnap', 'threadit'];
  const weights = [0.4, 0.4, 0.2]; // MyFace and InstaSnap more common

  const random = Math.random();
  let cumulative = 0;

  for (let i = 0; i < platforms.length; i++) {
    cumulative += weights[i];
    if (random < cumulative) {
      return platforms[i];
    }
  }

  return 'myface';
}

function pickRandomMood(): string {
  const moods = Object.keys(MOOD_MODIFIERS);
  return moods[Math.floor(Math.random() * moods.length)];
}

function pickReactionType(): 'like' | 'comment' {
  return Math.random() < 0.7 ? 'like' : 'comment';
}

// ============================================================================
// Initialize
// ============================================================================

export function initializeSocialAutopilot(): void {
  registerTaskHandler('generate_post', handleGeneratePost);
  registerTaskHandler('react_to_post', handleReactToPost);
  console.log('[SocialAutopilot] Task handlers registered');
}

export default {
  initializeSocialAutopilot,
  startSocialAutopilot,
  scheduleRandomPosts,
};
