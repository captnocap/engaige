/**
 * News System Task Handlers
 *
 * Registers background task handlers for:
 * - Story generation from trends
 * - RSS feed refreshing (future)
 * - Lore reloading
 */

import { registerTaskHandler, scheduleTask, type BackgroundTask } from './background-scheduler.js';
import { runStoryGenerationCycle, cleanupCooldowns } from './story-generator.js';
import { newsFeedService } from './news-feed.js';
import { eventBus, EventTypes } from '../events/index.js';
import { errorLogger } from './error-logger.js';

// ============================================================================
// Task Handlers
// ============================================================================

/**
 * Story generation task handler
 * Runs the full trend detection → article generation cycle
 */
async function handleGenerateNewsStories(task: BackgroundTask): Promise<void> {
  console.log('[NewsTasks] Running story generation cycle...');

  try {
    const result = await runStoryGenerationCycle();

    // Clean up old topic cooldowns
    cleanupCooldowns();

    // Emit event with results
    eventBus.fire(EventTypes.NEWS_STORIES_GENERATED, {
      trends_found: result.trendsFound,
      articles_generated: result.articlesGenerated,
      errors: result.errors,
    }, {
      source: 'news-tasks',
      importance: result.articlesGenerated > 0 ? 0.6 : 0.3,
    });

    console.log(`[NewsTasks] Story cycle complete: ${result.articlesGenerated} articles generated from ${result.trendsFound} trends`);

  } catch (error: any) {
    errorLogger.log(error, {
      source: 'news-tasks',
      operation: 'handleGenerateNewsStories',
    });
    throw error;
  }
}

/**
 * RSS feed refresh task handler (future)
 */
async function handleRefreshRSSFeeds(task: BackgroundTask): Promise<void> {
  console.log('[NewsTasks] RSS refresh not yet implemented');
  // TODO: Implement RSS feed fetching
  // This will:
  // 1. Get all enabled RSS feed configs
  // 2. Fetch and parse each feed
  // 3. Ingest new articles into the news feed
  // 4. Update feed lastFetchedAt timestamps
}

// ============================================================================
// Registration
// ============================================================================

let initialized = false;

/**
 * Initialize news task handlers
 * Call this once during server startup
 */
export function initializeNewsTasks(): void {
  if (initialized) {
    console.warn('[NewsTasks] Already initialized');
    return;
  }

  // Register handlers
  registerTaskHandler('generate_news_stories', handleGenerateNewsStories);
  registerTaskHandler('refresh_rss_feeds', handleRefreshRSSFeeds);

  // Initialize the news feed service (loads lore articles)
  newsFeedService.initialize().then(() => {
    console.log('[NewsTasks] News feed service initialized');
  }).catch(error => {
    errorLogger.log(error, {
      source: 'news-tasks',
      operation: 'initializeNewsFeed',
    });
  });

  initialized = true;
  console.log('[NewsTasks] Task handlers registered');
}

// ============================================================================
// Scheduling Helpers
// ============================================================================

/**
 * Schedule regular story generation
 * Call this to set up recurring story generation
 */
export function scheduleStoryGeneration(options: {
  intervalHours?: number;
  startDelayMinutes?: number;
} = {}): void {
  const {
    intervalHours = 6,      // Generate stories every 6 hours
    startDelayMinutes = 5,  // Start 5 minutes after server starts
  } = options;

  // Schedule initial run
  scheduleTask('generate_news_stories', {
    delay_seconds: startDelayMinutes * 60,
    priority: 3, // Low priority
    metadata: { scheduled: true, interval_hours: intervalHours },
    budget_category: 'story_generation',
  });

  console.log(`[NewsTasks] Story generation scheduled: first run in ${startDelayMinutes} minutes, then every ${intervalHours} hours`);
}

/**
 * Schedule next story generation run
 * Called after each cycle completes to schedule the next one
 */
export function scheduleNextStoryGeneration(intervalHours: number = 6): void {
  scheduleTask('generate_news_stories', {
    delay_seconds: intervalHours * 60 * 60,
    priority: 3,
    metadata: { scheduled: true, interval_hours: intervalHours },
    budget_category: 'story_generation',
  });
}

/**
 * Trigger immediate story generation (for manual testing)
 */
export function triggerStoryGenerationNow(): void {
  scheduleTask('generate_news_stories', {
    delay_seconds: 0,
    priority: 5, // Medium priority for manual triggers
    metadata: { manual: true },
    budget_category: 'story_generation',
  });

  console.log('[NewsTasks] Manual story generation triggered');
}

/**
 * Schedule RSS feed refresh (future)
 */
export function scheduleRSSRefresh(intervalMinutes: number = 30): void {
  scheduleTask('refresh_rss_feeds', {
    delay_seconds: intervalMinutes * 60,
    priority: 2, // Very low priority
    metadata: { scheduled: true, interval_minutes: intervalMinutes },
    budget_category: 'other',
  });

  console.log(`[NewsTasks] RSS refresh scheduled: every ${intervalMinutes} minutes`);
}

// ============================================================================
// Exports
// ============================================================================

export default {
  initializeNewsTasks,
  scheduleStoryGeneration,
  scheduleNextStoryGeneration,
  triggerStoryGenerationNow,
  scheduleRSSRefresh,
};
