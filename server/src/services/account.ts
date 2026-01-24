/**
 * Account Service
 *
 * Manages user accounts - each account has its own isolated world.
 * Handles creation, deletion, copying between accounts.
 */

import { existsSync, rmSync, mkdirSync, copyFileSync } from 'fs';
import { join } from 'path';
import { getGlobalDB, getAccountWorldPath, ensureAccountWorldDir } from '../db/global-db.js';
import { eventBus, EventTypes } from '../events/index.js';
import { errorLogger } from './error-logger.js';

export interface Account {
  id: string;
  name: string;
  avatarUrl?: string;
  createdAt: number;
  lastPlayedAt: number;
  hasCompletedOnboarding: boolean;
}

export interface CreateAccountOptions {
  name: string;
  copyFrom?: {
    accountId: string;
    mode: 'everything' | 'settings_only';
  };
}

// Active account tracking
let activeAccountId: string | null = null;

/**
 * Get all accounts
 */
export function listAccounts(): Account[] {
  const db = getGlobalDB();
  const rows = db.query(`
    SELECT id, name, avatar_url, created_at, last_played_at, has_completed_onboarding
    FROM accounts
    ORDER BY last_played_at DESC
  `).all() as Array<{
    id: string;
    name: string;
    avatar_url: string | null;
    created_at: number;
    last_played_at: number;
    has_completed_onboarding: number;
  }>;

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    avatarUrl: row.avatar_url || undefined,
    createdAt: row.created_at * 1000, // Convert to milliseconds
    lastPlayedAt: row.last_played_at * 1000,
    hasCompletedOnboarding: row.has_completed_onboarding === 1,
  }));
}

/**
 * Get an account by ID
 */
export function getAccount(id: string): Account | null {
  const db = getGlobalDB();
  const row = db.query(`
    SELECT id, name, avatar_url, created_at, last_played_at, has_completed_onboarding
    FROM accounts
    WHERE id = ?
  `).get(id) as {
    id: string;
    name: string;
    avatar_url: string | null;
    created_at: number;
    last_played_at: number;
    has_completed_onboarding: number;
  } | null;

  if (!row) return null;

  return {
    id: row.id,
    name: row.name,
    avatarUrl: row.avatar_url || undefined,
    createdAt: row.created_at * 1000,
    lastPlayedAt: row.last_played_at * 1000,
    hasCompletedOnboarding: row.has_completed_onboarding === 1,
  };
}

/**
 * Create a new account
 */
export function createAccount(options: CreateAccountOptions): Account {
  const db = getGlobalDB();
  const id = crypto.randomUUID();
  const now = Math.floor(Date.now() / 1000);

  try {
    // Create the account record
    db.query(`
      INSERT INTO accounts (id, name, created_at, last_played_at, has_completed_onboarding)
      VALUES (?, ?, ?, ?, 0)
    `).run(id, options.name, now, now);

    // Create the world directory
    const worldPath = ensureAccountWorldDir(id);

    // If copying from an existing account
    if (options.copyFrom) {
      const sourceWorldPath = getAccountWorldPath(options.copyFrom.accountId);

      if (existsSync(sourceWorldPath)) {
        if (options.copyFrom.mode === 'everything') {
          // Copy player.db (profile + settings)
          const sourcePlayerDb = join(sourceWorldPath, 'player.db');
          const destPlayerDb = join(worldPath, 'player.db');
          if (existsSync(sourcePlayerDb)) {
            copyFileSync(sourcePlayerDb, destPlayerDb);
          }
        } else if (options.copyFrom.mode === 'settings_only') {
          // Copy only settings and budget config from player.db
          // This is more complex - we'd need to create a new player.db
          // and copy specific tables. For now, just create empty.
          // TODO: Implement partial copy
        }
      }

      // Update has_completed_onboarding based on copy mode
      if (options.copyFrom.mode === 'everything') {
        // Check if source account has completed onboarding
        const sourceAccount = getAccount(options.copyFrom.accountId);
        if (sourceAccount?.hasCompletedOnboarding) {
          db.query(`
            UPDATE accounts SET has_completed_onboarding = 1 WHERE id = ?
          `).run(id);
        }
      }
    }

    // Emit event
    eventBus.fire(
      EventTypes.PLAYER_PROFILE_CREATED,
      {
        player_id: id,
        username: options.name,
        display_name: options.name,
        is_account_creation: true,
        copy_from: options.copyFrom?.accountId,
        copy_mode: options.copyFrom?.mode,
      },
      {
        source: 'account',
        player_id: id,
        importance: 0.8,
      }
    );

    return getAccount(id)!;
  } catch (error) {
    errorLogger.log(error, {
      source: 'account',
      operation: 'createAccount',
      metadata: { name: options.name, copyFrom: options.copyFrom },
    });
    throw error;
  }
}

/**
 * Delete an account
 */
export function deleteAccount(id: string): boolean {
  const db = getGlobalDB();

  try {
    // Check if account exists
    const account = getAccount(id);
    if (!account) {
      return false;
    }

    // Delete the world directory
    const worldPath = getAccountWorldPath(id);
    if (existsSync(worldPath)) {
      rmSync(worldPath, { recursive: true, force: true });
    }

    // Delete the account record
    db.query('DELETE FROM accounts WHERE id = ?').run(id);

    // Clear active account if this was it
    if (activeAccountId === id) {
      activeAccountId = null;
    }

    // Emit event
    eventBus.fire(
      EventTypes.PLAYER_LOGGED_OUT,
      {
        player_id: id,
        is_account_deletion: true,
      },
      {
        source: 'account',
        player_id: id,
        importance: 0.8,
      }
    );

    return true;
  } catch (error) {
    errorLogger.log(error, {
      source: 'account',
      operation: 'deleteAccount',
      metadata: { accountId: id },
    });
    throw error;
  }
}

/**
 * Update last played time for an account
 */
export function updateLastPlayed(id: string): void {
  const db = getGlobalDB();
  const now = Math.floor(Date.now() / 1000);
  db.query('UPDATE accounts SET last_played_at = ? WHERE id = ?').run(now, id);
}

/**
 * Mark account as having completed onboarding
 */
export function markOnboardingComplete(id: string): void {
  const db = getGlobalDB();
  db.query('UPDATE accounts SET has_completed_onboarding = 1 WHERE id = ?').run(id);
}

/**
 * Set the active account
 * This should be called when a user selects an account to play
 */
export function setActiveAccount(id: string): boolean {
  const account = getAccount(id);
  if (!account) {
    return false;
  }

  activeAccountId = id;
  updateLastPlayed(id);

  // Emit event
  eventBus.fire(
    EventTypes.PLAYER_LOGGED_IN,
    {
      player_id: id,
      username: account.name,
    },
    {
      source: 'account',
      player_id: id,
      importance: 0.7,
    }
  );

  return true;
}

/**
 * Get the currently active account ID
 */
export function getActiveAccountId(): string | null {
  return activeAccountId;
}

/**
 * Get the currently active account
 */
export function getActiveAccount(): Account | null {
  if (!activeAccountId) return null;
  return getAccount(activeAccountId);
}

/**
 * Clear the active account
 */
export function clearActiveAccount(): void {
  if (activeAccountId) {
    eventBus.fire(
      EventTypes.PLAYER_LOGGED_OUT,
      {
        player_id: activeAccountId,
      },
      {
        source: 'account',
        player_id: activeAccountId,
        importance: 0.5,
      }
    );
  }
  activeAccountId = null;
}

export default {
  listAccounts,
  getAccount,
  createAccount,
  deleteAccount,
  updateLastPlayed,
  markOnboardingComplete,
  setActiveAccount,
  getActiveAccountId,
  getActiveAccount,
  clearActiveAccount,
};
