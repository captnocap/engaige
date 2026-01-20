interface CommentStyleClasses {
  container: string
  wrapper: string
  avatarContainer: string
  contentWrapper: string
  header: string
  authorName: string
  username: string
  timestamp: string
  content: string
  actionsContainer: string
  actionButton: string
  replyCount: string
  moreActions: string
  replyInput: string
  loadMoreButton: string
  collapsedContainer: string
  collapseButton: string
  opBadge: string
}

const baseStyles: CommentStyleClasses = {
  container: 'py-2',
  wrapper: 'flex gap-3',
  avatarContainer: 'shrink-0',
  contentWrapper: 'flex-1 min-w-0',
  header: 'flex items-center gap-2 flex-wrap',
  authorName: 'font-medium text-sm',
  username: 'text-sm opacity-60 ml-1',
  timestamp: 'text-xs',
  content: 'mt-1 text-sm break-words',
  actionsContainer: 'mt-2 flex items-center gap-4 text-xs',
  actionButton: 'transition-colors hover:opacity-80',
  replyCount: 'ml-1 opacity-60',
  moreActions: '',
  replyInput: 'mt-3 pl-2 border-l-2',
  loadMoreButton: 'mt-2 text-xs hover:underline',
  collapsedContainer: 'py-1 text-xs',
  collapseButton: 'ml-2 opacity-60 hover:opacity-100',
  opBadge: 'text-xs px-1.5 py-0.5 rounded',
}

const STYLE_CONFIGS: Record<string, Partial<CommentStyleClasses>> = {
  default: {},

  myspace: {
    container: 'p-3 rounded-lg mb-2',
    wrapper: 'flex gap-3',
    authorName: 'font-bold text-sm',
    content: 'mt-2 text-sm',
    actionsContainer: 'mt-3 flex items-center gap-4 text-xs',
    opBadge: 'text-xs px-1.5 py-0.5 rounded font-bold',
  },

  instagram: {
    container: 'py-2',
    wrapper: 'flex gap-2',
    avatarContainer: 'shrink-0',
    header: 'inline',
    authorName: 'font-semibold text-sm inline',
    content: 'inline text-sm ml-1',
    actionsContainer: 'mt-1 flex items-center gap-3 text-xs',
    actionButton: 'font-medium',
    replyInput: 'mt-2',
  },

  reddit: {
    container: 'py-1',
    wrapper: 'flex gap-2',
    avatarContainer: 'hidden',
    header: 'flex items-center gap-1 text-xs',
    authorName: 'font-medium text-xs',
    username: 'hidden',
    timestamp: 'text-xs opacity-60',
    content: 'mt-1 text-sm',
    actionsContainer: 'mt-1 flex items-center gap-2 text-xs',
    actionButton: 'px-1 hover:bg-white/5 rounded',
    collapsedContainer: 'py-0.5 text-xs cursor-pointer hover:bg-white/5',
    collapseButton: 'opacity-40 hover:opacity-100 mr-1',
    opBadge: 'text-[10px] px-1 py-0.5 rounded font-bold',
  },

  twitter: {
    container: 'py-3 border-b',
    wrapper: 'flex gap-3',
    authorName: 'font-bold text-sm',
    username: 'text-sm opacity-60',
    content: 'mt-1 text-sm',
    actionsContainer: 'mt-2 flex items-center gap-6 text-sm',
  },

  discord: {
    container: 'py-1 px-2 rounded hover:bg-white/5 group',
    wrapper: 'flex gap-3',
    header: 'flex items-center gap-2',
    authorName: 'font-medium text-sm',
    timestamp: 'text-[10px] opacity-0 group-hover:opacity-60 transition-opacity',
    content: 'text-sm',
    actionsContainer: 'opacity-0 group-hover:opacity-100 transition-opacity absolute right-2 top-1 flex items-center gap-1',
    actionButton: 'p-1 rounded hover:bg-white/10',
  },
}

export function getCommentStyles(variant: string): CommentStyleClasses {
  const variantStyles = STYLE_CONFIGS[variant] ?? STYLE_CONFIGS.default

  // Merge base with variant
  return {
    ...baseStyles,
    ...variantStyles,
  }
}

// CSS variable overrides per platform (for colors)
export const PLATFORM_CSS_VARS: Record<string, Record<string, string>> = {
  myspace: {
    '--comment-bg': 'var(--color-bgSecondary)',
    '--comment-border': 'var(--color-border)',
    '--comment-accent': '#ff6b9d',
    '--comment-op-bg': '#ff6b9d33',
  },
  instagram: {
    '--comment-bg': 'transparent',
    '--comment-border': 'transparent',
    '--comment-accent': '#e1306c',
    '--comment-op-bg': '#e1306c22',
  },
  reddit: {
    '--comment-bg': 'var(--color-bgSecondary)',
    '--comment-border': 'var(--color-border)',
    '--comment-accent': '#ff4500',
    '--comment-op-bg': '#0079d322',
    '--comment-thread-line': 'var(--color-border)',
  },
  twitter: {
    '--comment-bg': 'transparent',
    '--comment-border': 'var(--color-border)',
    '--comment-accent': '#1d9bf0',
    '--comment-op-bg': '#1d9bf022',
  },
  discord: {
    '--comment-bg': 'transparent',
    '--comment-border': 'transparent',
    '--comment-accent': '#5865f2',
    '--comment-op-bg': '#5865f222',
  },
}
