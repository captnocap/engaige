// Threaded comment system for posts (MySpace, Instagram-style)

import { getDB, generateId, now } from '../db/index.js';
import { generateNPCResponse } from './ai.js';

export interface Comment {
  id: string;
  post_id: string;
  parent_comment_id: string | null;
  root_comment_id: string | null;
  thread_depth: number;
  author_id: string;
  author_type: 'player' | 'npc';
  author_name: string;
  content: string;
  created_at: number;
}

export interface Post {
  id: string;
  npc_id: string;
  platform: string;
  content: string;
  created_at: number;
}

// Create a comment on a post
export function createComment(
  postId: string,
  authorId: string,
  authorType: 'player' | 'npc',
  authorName: string,
  content: string,
  parentCommentId: string | null = null
): Comment {
  const db = getDB('game');

  // If replying to a comment, get the root and depth
  let rootCommentId = null;
  let threadDepth = 0;

  if (parentCommentId) {
    const parentComment = db.prepare(`
      SELECT root_comment_id, thread_depth FROM comments WHERE id = ?
    `).get(parentCommentId) as any;

    if (parentComment) {
      // Root is either the parent's root, or the parent itself if it's top-level
      rootCommentId = parentComment.root_comment_id || parentCommentId;
      threadDepth = parentComment.thread_depth + 1;
    }
  }

  const commentId = generateId();

  db.prepare(`
    INSERT INTO comments (
      id, post_id, parent_comment_id, root_comment_id, thread_depth,
      author_id, author_type, author_name, content, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    commentId,
    postId,
    parentCommentId,
    rootCommentId,
    threadDepth,
    authorId,
    authorType,
    authorName,
    content,
    now()
  );

  return {
    id: commentId,
    post_id: postId,
    parent_comment_id: parentCommentId,
    root_comment_id: rootCommentId,
    thread_depth: threadDepth,
    author_id: authorId,
    author_type: authorType,
    author_name: authorName,
    content,
    created_at: now(),
  };
}

// Get all comments for a post
export function getPostComments(postId: string): Comment[] {
  const db = getDB('game');

  return db.prepare(`
    SELECT * FROM comments
    WHERE post_id = ?
    ORDER BY created_at ASC
  `).all(postId) as any[];
}

// Get a specific comment
export function getComment(commentId: string): Comment | null {
  const db = getDB('game');

  return db.prepare(`
    SELECT * FROM comments WHERE id = ?
  `).get(commentId) as any;
}

// Get comment thread chain (from root to specific comment)
export function getCommentThread(commentId: string): Comment[] {
  const db = getDB('game');
  const comments: Comment[] = [];

  let current = getComment(commentId);

  // Walk up to root
  while (current) {
    comments.unshift(current); // Add to beginning
    current = current.parent_comment_id
      ? getComment(current.parent_comment_id)
      : null;
  }

  return comments;
}

// Get all replies to a comment
export function getCommentReplies(commentId: string): Comment[] {
  const db = getDB('game');

  return db.prepare(`
    SELECT * FROM comments
    WHERE parent_comment_id = ?
    ORDER BY created_at ASC
  `).all(commentId) as any[];
}

// Build context for generating a reply in a thread
export async function buildThreadContext(
  commentId: string,
  npcId: string
): Promise<{
  systemPrompt: string;
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  post: Post;
}> {
  const db = getDB('game');
  const comment = getComment(commentId);

  if (!comment) {
    throw new Error(`Comment not found: ${commentId}`);
  }

  // Get the original post
  const post = db.prepare(`
    SELECT p.*, n.display_name as author_name
    FROM posts p
    LEFT JOIN npcs n ON p.npc_id = n.id
    WHERE p.id = ?
  `).get(comment.post_id) as any;

  if (!post) {
    throw new Error(`Post not found: ${comment.post_id}`);
  }

  // Get NPC info
  const npcDb = getDB('npc');
  const npc = npcDb.prepare('SELECT * FROM npcs WHERE id = ?').get(npcId) as any;

  // Get the full thread chain from root to this comment
  const threadChain = getCommentThread(commentId);

  // Build system prompt with post context
  const systemPrompt = `
You are ${npc.display_name}.

## Context
You are replying to a comment thread on a ${post.platform} post by ${post.author_name}:

Post: "${post.content}"

## This Comment Thread
${threadChain.map(c => `${c.author_name}: ${c.content}`).join('\n')}

## Guidelines
- Stay relevant to the post and thread topic
- Keep comments conversational and natural
- You can reference the original post or earlier comments in the thread
- Be authentic to your personality
- Comments can be short and casual
- Use emojis if it fits your style

Respond naturally to the latest comment in the thread.
`.trim();

  // Build conversation from thread
  // The NPC's previous comments are 'assistant', others are 'user'
  const messages = threadChain.map(c => ({
    role: (c.author_id === npcId && c.author_type === 'npc') ? 'assistant' as const : 'user' as const,
    content: c.author_id === npcId ? c.content : `${c.author_name}: ${c.content}`,
  }));

  return { systemPrompt, messages, post };
}

// Generate NPC reply to a comment
export async function generateCommentReply(
  npcId: string,
  parentCommentId: string
): Promise<string> {
  const { systemPrompt, messages, post } = await buildThreadContext(parentCommentId, npcId);

  const npcDb = getDB('npc');
  const npc = npcDb.prepare('SELECT * FROM npcs WHERE id = ?').get(npcId) as any;

  if (!npc) {
    throw new Error(`NPC not found: ${npcId}`);
  }

  // Get latest comment as prompt
  const lastMessage = messages[messages.length - 1];

  // Generate response
  const response = await generateNPCResponse(
    npcId,
    lastMessage.content,
    messages.slice(0, -1),
    {
      platform: post.platform,
      feature_category: 'conversation',
    }
  );

  return response.trim();
}

// Auto-generate NPC comment on their own post
export async function generatePostComment(
  npcId: string,
  postId: string,
  parentCommentId: string | null = null
): Promise<string> {
  const db = getDB('game');
  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(postId) as any;

  if (!post) {
    throw new Error(`Post not found: ${postId}`);
  }

  const npcDb = getDB('npc');
  const npc = npcDb.prepare('SELECT * FROM npcs WHERE id = ?').get(npcId) as any;

  if (!npc) {
    throw new Error(`NPC not found: ${npcId}`);
  }

  let context: Array<{ role: 'user' | 'assistant'; content: string }> = [];
  let systemPrompt = `You are ${npc.display_name}.`;

  if (parentCommentId) {
    // Replying to an existing comment
    const threadContext = await buildThreadContext(parentCommentId, npcId);
    context = threadContext.messages.slice(0, -1);
    systemPrompt = threadContext.systemPrompt;
  } else {
    // Top-level comment on the post
    systemPrompt = `
You are ${npc.display_name}.

## Context
You are commenting on a ${post.platform} post.

Post: "${post.content}"

## Guidelines
- Keep your comment casual and authentic
- React naturally to the post
- Show your personality
- Comments can be short
`.trim();
  }

  const prompt = parentCommentId
    ? context[context.length - 1]?.content || 'Reply to this comment'
    : `Comment on this post: "${post.content}"`;

  const response = await generateNPCResponse(
    npcId,
    prompt,
    context,
    {
      platform: post.platform,
      feature_category: 'autonomous_posts',
    }
  );

  return response.trim();
}

// Build nested comment tree for display
export interface CommentTree {
  comment: Comment;
  replies: CommentTree[];
}

export function buildCommentTree(postId: string): CommentTree[] {
  const allComments = getPostComments(postId);
  const commentMap = new Map<string, CommentTree>();
  const rootComments: CommentTree[] = [];

  // Create tree nodes
  for (const comment of allComments) {
    commentMap.set(comment.id, {
      comment,
      replies: [],
    });
  }

  // Build tree structure
  for (const comment of allComments) {
    const node = commentMap.get(comment.id)!;

    if (comment.parent_comment_id) {
      // Add as reply to parent
      const parent = commentMap.get(comment.parent_comment_id);
      if (parent) {
        parent.replies.push(node);
      }
    } else {
      // Top-level comment
      rootComments.push(node);
    }
  }

  return rootComments;
}

export default {
  createComment,
  getPostComments,
  getComment,
  getCommentThread,
  getCommentReplies,
  buildThreadContext,
  generateCommentReply,
  generatePostComment,
  buildCommentTree,
};
