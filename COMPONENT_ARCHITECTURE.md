# Component Architecture for Multi-Platform UI

## Philosophy

Different platforms (MySpace, Instagram, Reddit, Messenger) need **similar functionality** but **different styling**. We want:

✅ **Shared Logic**: Comment threading, timestamps, reactions
✅ **Platform-Specific Styles**: MySpace ≠ Instagram ≠ Messenger
✅ **Easy to Maintain**: Update once, works everywhere
✅ **No Prop Hell**: Don't pass 47 conditional props

## Solution: Base Components + Style Variants

### Pattern: Compound Components with Theme Variants

```
BaseComponent (logic + structure)
    ↓
StyleVariant (platform-specific styling)
    ↓
Rendered Component
```

---

## 1. Comments Component

### Shared Features Across All Platforms
- Author name + avatar
- Timestamp (relative: "2h ago")
- Content (text, markdown, HTML)
- Nested replies (threading)
- Like/react button
- Reply button
- More actions (edit, delete, report)

### Platform Differences

| Platform | Style | Threading | Actions | Special Features |
|----------|-------|-----------|---------|------------------|
| **MySpace** | Colorful, HTML-styled | Flat or 1-level | Comment, Delete | Profile song plays |
| **Instagram** | Minimal, clean | Flat + "View replies" | Like, Reply | Heart animation |
| **Reddit** | Compact, nested | Deep nesting | Upvote/downvote | Collapse threads |
| **Twitter** | Tweet-style | 1-level | Like, Retweet, Reply | Quote tweets |

### Architecture

```typescript
// Base comment component (shared logic)
interface CommentData {
  id: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  content: string;
  timestamp: number;
  likes?: number;
  replies?: CommentData[];
  metadata?: Record<string, any>;
}

interface CommentStyleConfig {
  variant: 'myspace' | 'instagram' | 'reddit' | 'twitter';
  layout: 'flat' | 'nested' | 'deep-nested';
  showAvatar: boolean;
  showTimestamp: boolean;
  contentRenderer: 'plain' | 'markdown' | 'html';
  actionsPosition: 'below' | 'inline' | 'hover';
  colors?: {
    background?: string;
    text?: string;
    accent?: string;
  };
}
```

### Implementation

```tsx
// src/components/ui/Comment/BaseComment.tsx
interface BaseCommentProps {
  comment: CommentData;
  config: CommentStyleConfig;
  onLike?: (commentId: string) => void;
  onReply?: (commentId: string) => void;
  onDelete?: (commentId: string) => void;
}

export function BaseComment({ comment, config, onLike, onReply, onDelete }: BaseCommentProps) {
  const styles = getCommentStyles(config.variant);

  return (
    <div className={styles.container}>
      {config.showAvatar && (
        <img src={comment.author.avatar} className={styles.avatar} />
      )}

      <div className={styles.content}>
        <div className={styles.header}>
          <span className={styles.authorName}>{comment.author.name}</span>
          {config.showTimestamp && (
            <span className={styles.timestamp}>
              {formatTimestamp(comment.timestamp)}
            </span>
          )}
        </div>

        <ContentRenderer
          content={comment.content}
          type={config.contentRenderer}
        />

        <CommentActions
          config={config}
          comment={comment}
          onLike={onLike}
          onReply={onReply}
          onDelete={onDelete}
        />

        {config.layout !== 'flat' && comment.replies && (
          <CommentThread
            comments={comment.replies}
            config={config}
            depth={1}
          />
        )}
      </div>
    </div>
  );
}
```

### Platform Wrappers (Easy to Use)

```tsx
// src/components/platforms/MySpace/MySpaceComment.tsx
export function MySpaceComment({ comment, onLike, onReply }: CommentProps) {
  return (
    <BaseComment
      comment={comment}
      config={{
        variant: 'myspace',
        layout: 'flat',
        showAvatar: true,
        showTimestamp: true,
        contentRenderer: 'html',
        actionsPosition: 'below',
      }}
      onLike={onLike}
      onReply={onReply}
    />
  );
}

// src/components/platforms/Instagram/InstagramComment.tsx
export function InstagramComment({ comment, onLike, onReply }: CommentProps) {
  return (
    <BaseComment
      comment={comment}
      config={{
        variant: 'instagram',
        layout: 'nested',
        showAvatar: true,
        showTimestamp: true,
        contentRenderer: 'plain',
        actionsPosition: 'inline',
      }}
      onLike={onLike}
      onReply={onReply}
    />
  );
}

// src/components/platforms/Reddit/RedditComment.tsx
export function RedditComment({ comment, onUpvote, onDownvote, onReply }: CommentProps) {
  return (
    <BaseComment
      comment={comment}
      config={{
        variant: 'reddit',
        layout: 'deep-nested',
        showAvatar: false,
        showTimestamp: true,
        contentRenderer: 'markdown',
        actionsPosition: 'below',
      }}
      onLike={onUpvote}
      onReply={onReply}
    />
  );
}
```

### Usage (Super Clean)

```tsx
// In MySpace profile page
<div className="myspace-comments">
  {comments.map(comment => (
    <MySpaceComment
      key={comment.id}
      comment={comment}
      onLike={handleLike}
      onReply={handleReply}
    />
  ))}
</div>

// In Instagram post
<div className="instagram-comments">
  {comments.map(comment => (
    <InstagramComment
      key={comment.id}
      comment={comment}
      onLike={handleLike}
      onReply={handleReply}
    />
  ))}
</div>
```

---

## 2. Message Component

### Shared Features
- Sender info
- Content (text, images, attachments)
- Timestamp
- Read/delivered status
- Reactions (emoji)

### Platform Differences

| Platform | Style | Layout | Special Features |
|----------|-------|--------|------------------|
| **Messenger** | Chat bubbles | Left/right align | Typing indicator, read receipts |
| **SMS** | Simple bubbles | Left/right align | Delivery status, time gaps |
| **Dating App** | Cards | Centered | Match indicator, photo sharing |
| **Email** | Full-width | Thread view | Subject, CC/BCC, attachments |

### Architecture

```tsx
// src/components/ui/Message/BaseMessage.tsx
interface MessageData {
  id: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
  content: string;
  timestamp: number;
  isOwn: boolean; // Is this message from the current user?
  status?: 'sending' | 'sent' | 'delivered' | 'read';
  reactions?: Array<{ emoji: string; users: string[] }>;
  attachments?: Array<{ type: string; url: string }>;
}

interface MessageStyleConfig {
  variant: 'messenger' | 'sms' | 'dating' | 'email';
  layout: 'bubble' | 'card' | 'full-width';
  alignment: 'dynamic' | 'always-left';
  showAvatar: boolean;
  showStatus: boolean;
  grouping: 'time-based' | 'none';
}
```

### Platform Wrappers

```tsx
// src/components/platforms/Messenger/MessengerMessage.tsx
export function MessengerMessage({ message, onReact }: MessageProps) {
  return (
    <BaseMessage
      message={message}
      config={{
        variant: 'messenger',
        layout: 'bubble',
        alignment: 'dynamic', // Your messages right, theirs left
        showAvatar: !message.isOwn,
        showStatus: message.isOwn,
        grouping: 'time-based',
      }}
      onReact={onReact}
    />
  );
}

// src/components/platforms/Dating/DatingMessage.tsx
export function DatingMessage({ message, onReact }: MessageProps) {
  return (
    <BaseMessage
      message={message}
      config={{
        variant: 'dating',
        layout: 'card',
        alignment: 'dynamic',
        showAvatar: true,
        showStatus: true,
        grouping: 'none',
      }}
      onReact={onReact}
    />
  );
}
```

---

## 3. Post Component

### Shared Features
- Author info
- Content (text, images, video)
- Timestamp
- Engagement (likes, comments, shares)
- Comment section

### Platform Differences

| Platform | Style | Features |
|----------|-------|----------|
| **MySpace** | Colorful, HTML | Profile song, Top 8 references |
| **Instagram** | Photo-focused | Carousel, filters, hashtags |
| **Twitter** | Text-focused | 280 chars, retweets, threads |
| **Feed** | Mixed | Aggregated from all platforms |

### Architecture

```tsx
// src/components/ui/Post/BasePost.tsx
interface PostData {
  id: string;
  author: NPCProfile;
  content: string;
  media?: Array<{ type: 'image' | 'video'; url: string }>;
  timestamp: number;
  likes: number;
  comments: CommentData[];
  shares?: number;
  platform: 'myspace' | 'instagram' | 'twitter';
}

interface PostStyleConfig {
  variant: 'myspace' | 'instagram' | 'twitter' | 'feed';
  showMedia: 'full' | 'thumbnail' | 'none';
  showComments: boolean;
  maxCommentsPreview: number;
  actionsLayout: 'horizontal' | 'vertical';
}
```

---

## Style System

### CSS Variables per Platform

```css
/* Base styles */
:root {
  --comment-bg: var(--surface);
  --comment-text: var(--text);
  --comment-border: var(--border);
}

/* MySpace variant */
.comment-myspace {
  --comment-bg: #f5f5f5;
  --comment-text: #333;
  --comment-border: #ccc;
  --comment-accent: #ff6b9d;
  font-family: Verdana, sans-serif;
}

/* Instagram variant */
.comment-instagram {
  --comment-bg: transparent;
  --comment-text: var(--text);
  --comment-border: transparent;
  --comment-accent: #e1306c;
  font-family: -apple-system, sans-serif;
}

/* Reddit variant */
.comment-reddit {
  --comment-bg: var(--surface);
  --comment-text: var(--text);
  --comment-border: var(--border-subtle);
  --comment-accent: #ff4500;
  font-family: 'IBM Plex Sans', sans-serif;
}
```

### Style Utility

```typescript
// src/components/ui/styles.ts
const STYLE_CONFIGS = {
  myspace: {
    container: 'bg-[var(--comment-bg)] border-[var(--comment-border)] rounded p-4',
    avatar: 'w-12 h-12 rounded-full border-2 border-[var(--comment-accent)]',
    authorName: 'font-bold text-[var(--comment-accent)]',
    timestamp: 'text-sm text-gray-500',
    content: 'mt-2 text-[var(--comment-text)]',
    actions: 'mt-2 flex gap-4',
  },
  instagram: {
    container: 'py-2',
    avatar: 'w-8 h-8 rounded-full',
    authorName: 'font-semibold text-sm',
    timestamp: 'text-xs text-gray-400',
    content: 'inline text-sm',
    actions: 'inline-flex gap-3 ml-2 text-xs text-gray-400',
  },
  reddit: {
    container: 'border-l-2 border-[var(--comment-border)] pl-2 ml-2',
    avatar: 'hidden', // Reddit doesn't show avatars by default
    authorName: 'text-sm font-medium',
    timestamp: 'text-xs text-gray-500',
    content: 'mt-1 text-sm',
    actions: 'mt-2 flex gap-2 text-xs',
  },
};

export function getCommentStyles(variant: string) {
  return STYLE_CONFIGS[variant] || STYLE_CONFIGS.instagram;
}
```

---

## Shared Components Library

### Core UI Components (Reusable Everywhere)

```
src/components/ui/
├── Comment/
│   ├── BaseComment.tsx      # Base logic
│   ├── CommentThread.tsx    # Threading/nesting logic
│   ├── CommentActions.tsx   # Like, reply, etc.
│   └── ContentRenderer.tsx  # Markdown/HTML/plain
├── Message/
│   ├── BaseMessage.tsx
│   ├── MessageBubble.tsx
│   ├── MessageStatus.tsx
│   └── TypingIndicator.tsx
├── Post/
│   ├── BasePost.tsx
│   ├── PostHeader.tsx
│   ├── PostMedia.tsx
│   ├── PostActions.tsx
│   └── PostComments.tsx
└── Shared/
    ├── Avatar.tsx
    ├── Timestamp.tsx
    ├── LikeButton.tsx
    └── ReactionPicker.tsx
```

### Platform-Specific Wrappers

```
src/components/platforms/
├── MySpace/
│   ├── MySpaceComment.tsx
│   ├── MySpacePost.tsx
│   └── MySpaceProfile.tsx
├── Instagram/
│   ├── InstagramComment.tsx
│   ├── InstagramPost.tsx
│   └── InstagramStory.tsx
├── Messenger/
│   ├── MessengerMessage.tsx
│   ├── MessengerThread.tsx
│   └── MessengerTyping.tsx
└── Reddit/
    ├── RedditComment.tsx
    ├── RedditPost.tsx
    └── RedditThread.tsx
```

---

## Benefits of This Approach

✅ **DRY**: Core logic written once
✅ **Flexible**: Easy to add new platforms
✅ **Simple**: Platform wrappers are tiny and obvious
✅ **Consistent**: Same behavior across platforms
✅ **Maintainable**: Update logic in one place
✅ **Testable**: Test base component, variants are just styling
✅ **No Prop Hell**: Each wrapper has clean, minimal props

---

## Example: Adding a New Platform

Want to add Discord-style comments?

```tsx
// 1. Create wrapper
export function DiscordComment({ comment, onReact }: CommentProps) {
  return (
    <BaseComment
      comment={comment}
      config={{
        variant: 'discord',
        layout: 'flat',
        showAvatar: true,
        showTimestamp: true,
        contentRenderer: 'markdown',
        actionsPosition: 'hover',
      }}
      onReact={onReact}
    />
  );
}

// 2. Add styles
const STYLE_CONFIGS = {
  // ... existing
  discord: {
    container: 'hover:bg-gray-800/50 p-2',
    avatar: 'w-10 h-10 rounded-full',
    authorName: 'font-semibold text-white',
    timestamp: 'text-xs text-gray-400',
    content: 'text-gray-200',
    actions: 'flex gap-2 opacity-0 group-hover:opacity-100',
  },
};

// Done! 🎉
```

---

## Following CLAUDE.md Pattern

Just like the custom `<Select>` component rule in CLAUDE.md:

> "DO NOT use native HTML `<select>` elements. ALWAYS use custom `<Select>` component."

**We apply the same pattern here:**

❌ **DON'T** create bespoke comment components for every platform
✅ **DO** use `BaseComment` with platform-specific wrappers

❌ **DON'T** duplicate message logic in 5 places
✅ **DO** use `BaseMessage` with style variants

This keeps the codebase **maintainable**, **consistent**, and **easy to extend**.

---

## Summary

**Pattern:**
```
Base Component (logic) + Style Config (styling) = Platform Component
```

**Philosophy:**
- Share logic, customize styling
- Platform wrappers are tiny and obvious
- Easy to add new platforms
- No prop hell
- One source of truth

**Components to Build This Way:**
- Comments (MySpace, Instagram, Reddit, Twitter)
- Messages (Messenger, SMS, Dating, Email)
- Posts (MySpace, Instagram, Twitter, Feed)
- Profiles (MySpace, Instagram, Dating)

**Result:**
- Write logic once
- Style per platform
- Maintain easily
- Scale infinitely

🚀 **This is the way.**
