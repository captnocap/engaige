interface MessageStyleClasses {
  container: string
  wrapper: string
  avatarContainer: string
  contentWrapper: string
  bubble: string
  bubbleOwn: string
  bubbleOther: string
  header: string
  authorName: string
  timestamp: string
  content: string
  attachments: string
  reactions: string
  status: string
  replyPreview: string
  actionsContainer: string
  actionButton: string
  systemMessage: string
  groupedMessage: string
  deletedMessage: string
}

const baseStyles: MessageStyleClasses = {
  container: 'py-0.5',
  wrapper: 'flex gap-2 items-end',
  avatarContainer: 'shrink-0 self-end',
  contentWrapper: 'flex flex-col max-w-[70%]',
  bubble: 'px-3 py-2 rounded-2xl',
  bubbleOwn: 'rounded-br-md',
  bubbleOther: 'rounded-bl-md',
  header: 'flex items-center gap-2 mb-0.5 text-xs',
  authorName: 'font-medium',
  timestamp: 'text-xs opacity-60',
  content: 'text-sm break-words',
  attachments: 'mt-1',
  reactions: 'flex flex-wrap gap-1 mt-1',
  status: 'text-[10px] mt-0.5 text-right',
  replyPreview: 'text-xs px-2 py-1 rounded mb-1 opacity-70 border-l-2',
  actionsContainer: 'opacity-0 group-hover:opacity-100 transition-opacity flex gap-1',
  actionButton: 'p-1 rounded hover:bg-white/10',
  systemMessage: 'text-center text-xs py-2',
  groupedMessage: 'pt-0',
  deletedMessage: 'italic opacity-50',
}

const STYLE_CONFIGS: Record<string, Partial<MessageStyleClasses>> = {
  default: {},

  messenger: {
    container: 'py-0.5',
    wrapper: 'flex gap-2 items-end',
    bubble: 'px-3 py-2 rounded-[18px]',
    bubbleOwn: 'rounded-br-sm',
    bubbleOther: 'rounded-bl-sm',
    content: 'text-sm',
    timestamp: 'text-[10px] opacity-0 group-hover:opacity-60 transition-opacity',
    status: 'text-[10px]',
    reactions: 'absolute -bottom-2 right-2 flex gap-0.5 bg-white/10 rounded-full px-1',
  },

  discord: {
    container: 'py-0.5 px-4 hover:bg-white/[0.02] group',
    wrapper: 'flex gap-4',
    avatarContainer: 'shrink-0 self-start pt-0.5',
    contentWrapper: 'flex-1 max-w-none',
    bubble: 'p-0',
    bubbleOwn: '',
    bubbleOther: '',
    header: 'flex items-center gap-2',
    authorName: 'font-medium text-sm hover:underline cursor-pointer',
    timestamp: 'text-[10px] opacity-40',
    content: 'text-sm',
    reactions: 'flex flex-wrap gap-1 mt-1',
    actionsContainer: 'absolute right-4 -top-4 bg-[var(--color-bgSecondary)] border border-[var(--color-border)] rounded flex shadow-lg',
    actionButton: 'p-1.5 hover:bg-white/10',
    systemMessage: 'text-center text-xs py-1 opacity-60',
  },

  imessage: {
    container: 'py-0.5',
    wrapper: 'flex gap-2 items-end',
    bubble: 'px-4 py-2 rounded-[20px]',
    bubbleOwn: 'rounded-br-[4px]',
    bubbleOther: 'rounded-bl-[4px]',
    content: 'text-[15px]',
    timestamp: 'text-[10px] text-center opacity-60 py-2',
    status: 'text-[10px] opacity-60',
  },

  whatsapp: {
    container: 'py-0.5 px-8',
    wrapper: 'flex gap-1 items-end',
    bubble: 'px-3 py-1.5 rounded-lg relative',
    bubbleOwn: 'rounded-tr-none',
    bubbleOther: 'rounded-tl-none',
    content: 'text-sm',
    timestamp: 'text-[10px] opacity-60 float-right ml-2 mt-1',
    status: 'inline-flex items-center ml-1',
  },

  slack: {
    container: 'py-2 px-4 hover:bg-white/[0.02] group',
    wrapper: 'flex gap-3',
    avatarContainer: 'shrink-0 self-start',
    contentWrapper: 'flex-1 max-w-none',
    bubble: 'p-0',
    bubbleOwn: '',
    bubbleOther: '',
    header: 'flex items-center gap-2',
    authorName: 'font-bold text-sm hover:underline cursor-pointer',
    timestamp: 'text-xs opacity-40',
    content: 'text-[15px]',
    reactions: 'flex flex-wrap gap-1 mt-1',
    actionsContainer: 'absolute right-2 -top-3 bg-white border rounded shadow flex',
  },

  // MySpace block style - early 2000s web aesthetic
  myspace: {
    container: 'py-2 px-3 border-b border-[var(--color-border)] hover:bg-[var(--color-bgSecondary)]/50',
    wrapper: 'flex gap-3',
    avatarContainer: 'shrink-0 self-start',
    contentWrapper: 'flex-1 max-w-none',
    bubble: 'p-0',
    bubbleOwn: '',
    bubbleOther: '',
    header: 'flex items-center gap-2 mb-1',
    authorName: 'font-bold text-sm text-[#003366] hover:underline cursor-pointer',
    timestamp: 'text-[11px] opacity-50',
    content: 'text-sm leading-relaxed',
    reactions: 'flex flex-wrap gap-2 mt-2 pt-2 border-t border-[var(--color-border)]/50',
    actionsContainer: 'absolute right-2 top-2 bg-[var(--color-bgSecondary)] border rounded shadow-md flex',
    actionButton: 'p-1.5 hover:bg-[var(--color-primary)]/20 text-xs',
    systemMessage: 'text-center text-xs py-3 italic text-[#666]',
  },

  // Chirp compact style - dense, avatar left, content right
  chirp: {
    container: 'py-1.5 px-3 hover:bg-white/[0.02] group',
    wrapper: 'flex gap-2',
    avatarContainer: 'shrink-0 self-start pt-0.5',
    contentWrapper: 'flex-1 max-w-none min-w-0',
    bubble: 'p-0',
    bubbleOwn: '',
    bubbleOther: '',
    header: 'flex items-center gap-1.5 flex-wrap',
    authorName: 'font-bold text-sm hover:underline cursor-pointer',
    timestamp: 'text-[11px] opacity-40',
    content: 'text-sm',
    reactions: 'flex flex-wrap gap-1 mt-1',
    actionsContainer: 'absolute right-2 -top-2 bg-[var(--color-bgSecondary)] border border-[var(--color-border)] rounded-full flex shadow-lg',
    actionButton: 'p-2 hover:bg-[#1DA1F2]/20 rounded-full',
  },

  // InstaSnap DM style - modern, clean bubbles
  instasnap: {
    container: 'py-0.5 px-4',
    wrapper: 'flex gap-2 items-end',
    bubble: 'px-4 py-2.5 rounded-[22px]',
    bubbleOwn: 'rounded-br-[6px]',
    bubbleOther: 'rounded-bl-[6px]',
    content: 'text-sm',
    timestamp: 'text-[10px] text-center opacity-50 py-2',
    status: 'text-[10px] opacity-50',
    reactions: 'absolute -bottom-3 right-0 flex gap-0.5 bg-[var(--color-bgSecondary)] rounded-full px-1.5 py-0.5 shadow-sm border border-[var(--color-border)]',
  },

  // LoveLink dating app style - warm, romantic bubbles
  lovelink: {
    container: 'py-1 px-4',
    wrapper: 'flex gap-2 items-end',
    bubble: 'px-4 py-2.5 rounded-[20px]',
    bubbleOwn: 'rounded-br-[4px]',
    bubbleOther: 'rounded-bl-[4px]',
    content: 'text-[15px]',
    timestamp: 'text-[10px] text-center opacity-50 py-2',
    status: 'text-[10px] opacity-50',
    reactions: 'flex gap-1 mt-1',
  },
}

export function getMessageStyles(variant: string): MessageStyleClasses {
  const variantStyles = STYLE_CONFIGS[variant] ?? STYLE_CONFIGS.default

  return {
    ...baseStyles,
    ...variantStyles,
  }
}

// CSS variable overrides per platform
export const MESSAGE_CSS_VARS: Record<string, Record<string, string>> = {
  messenger: {
    '--message-own-bg': '#0084ff',
    '--message-own-text': '#ffffff',
    '--message-other-bg': 'var(--color-bgSecondary)',
    '--message-other-text': 'var(--color-text)',
    '--message-system': 'var(--color-textMuted)',
  },
  discord: {
    '--message-own-bg': 'transparent',
    '--message-own-text': 'var(--color-text)',
    '--message-other-bg': 'transparent',
    '--message-other-text': 'var(--color-text)',
    '--message-system': 'var(--color-textMuted)',
    '--message-mention-bg': 'rgba(250, 166, 26, 0.1)',
  },
  imessage: {
    '--message-own-bg': '#007aff',
    '--message-own-text': '#ffffff',
    '--message-other-bg': '#e5e5ea',
    '--message-other-text': '#000000',
    '--message-system': '#8e8e93',
  },
  whatsapp: {
    '--message-own-bg': '#005c4b',
    '--message-own-text': '#ffffff',
    '--message-other-bg': '#202c33',
    '--message-other-text': '#ffffff',
    '--message-system': 'rgba(255,255,255,0.5)',
  },
  slack: {
    '--message-own-bg': 'transparent',
    '--message-own-text': 'var(--color-text)',
    '--message-other-bg': 'transparent',
    '--message-other-text': 'var(--color-text)',
    '--message-highlight': '#f8f3d6',
  },
  myspace: {
    '--message-own-bg': 'transparent',
    '--message-own-text': 'var(--color-text)',
    '--message-other-bg': 'transparent',
    '--message-other-text': 'var(--color-text)',
    '--message-system': '#666666',
    '--message-link': '#003366',
  },
  chirp: {
    '--message-own-bg': 'transparent',
    '--message-own-text': 'var(--color-text)',
    '--message-other-bg': 'transparent',
    '--message-other-text': 'var(--color-text)',
    '--message-system': 'var(--color-textMuted)',
    '--message-link': '#1DA1F2',
  },
  instasnap: {
    '--message-own-bg': '#3797F0',
    '--message-own-text': '#ffffff',
    '--message-other-bg': '#EFEFEF',
    '--message-other-text': '#000000',
    '--message-system': '#8e8e93',
  },
  lovelink: {
    '--message-own-bg': '#FE3C72',
    '--message-own-text': '#ffffff',
    '--message-other-bg': '#F0F0F0',
    '--message-other-text': '#000000',
    '--message-system': '#999999',
  },
}
