/**
 * Context Menu Archetype Presets
 *
 * Pre-built menu item generators for each app archetype.
 * Organized in 3 layers:
 *   Layer 1 (Universal) - clipboard ops, always applicable
 *   Layer 2 (Surface)   - desktop, browser, studio
 *   Layer 3 (App)       - social feed, messaging, blog, etc.
 *
 * Usage:
 *   const items = desktopEmptyPreset({ onOpenSettings, ... })
 *   const items = browserPagePreset({ onBack, onForward, ... })
 *   const items = [...socialFeedPostPreset(post), SEP, ...clipboardPreset()]
 */

import type { ContextMenuItem } from '../components/ui/ContextMenu.js'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export const SEP: ContextMenuItem = { separator: true }

/** Merge layers with separators between non-empty groups */
export function composeLayers(...layers: ContextMenuItem[][]): ContextMenuItem[] {
  const result: ContextMenuItem[] = []
  for (const layer of layers) {
    const visible = layer.filter(item => item.visible !== false)
    if (visible.length === 0) continue
    if (result.length > 0) result.push(SEP)
    result.push(...visible)
  }
  return result
}

// ---------------------------------------------------------------------------
// Layer 1: Universal (clipboard)
// ---------------------------------------------------------------------------

export function clipboardPreset(): ContextMenuItem[] {
  return [
    {
      label: 'Cut',
      shortcut: 'Ctrl+X',
      onClick: () => document.execCommand('cut'),
    },
    {
      label: 'Copy',
      shortcut: 'Ctrl+C',
      onClick: () => document.execCommand('copy'),
    },
    {
      label: 'Paste',
      shortcut: 'Ctrl+V',
      onClick: () => document.execCommand('paste'),
    },
    {
      label: 'Select All',
      shortcut: 'Ctrl+A',
      onClick: () => document.execCommand('selectAll'),
    },
  ]
}

export function textSelectionPreset(): ContextMenuItem[] {
  const selection = window.getSelection()
  const hasSelection = selection && selection.toString().trim().length > 0

  return [
    {
      label: 'Copy',
      shortcut: 'Ctrl+C',
      onClick: () => document.execCommand('copy'),
      disabled: !hasSelection,
    },
    {
      label: 'Select All',
      shortcut: 'Ctrl+A',
      onClick: () => document.execCommand('selectAll'),
    },
  ]
}

// ---------------------------------------------------------------------------
// Layer 2: Desktop Surface
// ---------------------------------------------------------------------------

interface DesktopEmptyOptions {
  onRefresh?: () => void
  onOpenSettings?: () => void
  onChangeWallpaper?: () => void
  iconSize?: 'small' | 'medium' | 'large'
  onSetIconSize?: (size: 'small' | 'medium' | 'large') => void
  sortBy?: 'name' | 'type'
  onSetSortBy?: (sort: 'name' | 'type') => void
}

export function desktopEmptyPreset(opts: DesktopEmptyOptions = {}): ContextMenuItem[] {
  return composeLayers(
    // View / Sort
    [
      {
        label: 'View',
        children: [
          {
            label: 'Small Icons',
            checked: opts.iconSize === 'small',
            onClick: () => opts.onSetIconSize?.('small'),
          },
          {
            label: 'Medium Icons',
            checked: opts.iconSize === 'medium',
            onClick: () => opts.onSetIconSize?.('medium'),
          },
          {
            label: 'Large Icons',
            checked: opts.iconSize === 'large',
            onClick: () => opts.onSetIconSize?.('large'),
          },
        ],
        visible: !!opts.onSetIconSize,
      },
      {
        label: 'Sort by',
        children: [
          {
            label: 'Name',
            checked: opts.sortBy === 'name',
            onClick: () => opts.onSetSortBy?.('name'),
          },
          {
            label: 'Type',
            checked: opts.sortBy === 'type',
            onClick: () => opts.onSetSortBy?.('type'),
          },
        ],
        visible: !!opts.onSetSortBy,
      },
      {
        label: 'Refresh',
        shortcut: 'F5',
        onClick: () => opts.onRefresh?.(),
      },
    ],
    // Settings
    [
      {
        label: 'Change Wallpaper',
        onClick: () => opts.onChangeWallpaper?.(),
        visible: !!opts.onChangeWallpaper,
      },
      {
        label: 'Display Settings',
        onClick: () => opts.onOpenSettings?.(),
        visible: !!opts.onOpenSettings,
      },
    ],
  )
}

interface DesktopIconOptions {
  iconLabel: string
  onOpen: () => void
  onOpenNewInstance?: () => void
}

export function desktopIconPreset(opts: DesktopIconOptions): ContextMenuItem[] {
  return composeLayers(
    [
      {
        label: 'Open',
        onClick: opts.onOpen,
      },
      {
        label: 'Open New Window',
        onClick: () => opts.onOpenNewInstance?.(),
        visible: !!opts.onOpenNewInstance,
      },
    ],
  )
}

// ---------------------------------------------------------------------------
// Layer 2: Browser Surface
// ---------------------------------------------------------------------------

interface BrowserPageOptions {
  onBack?: () => void
  onForward?: () => void
  onReload?: () => void
  onBookmark?: () => void
  canGoBack?: boolean
  canGoForward?: boolean
  isBookmarked?: boolean
}

export function browserPagePreset(opts: BrowserPageOptions = {}): ContextMenuItem[] {
  return composeLayers(
    [
      {
        label: 'Back',
        shortcut: 'Alt+\u2190',
        onClick: () => opts.onBack?.(),
        disabled: !opts.canGoBack,
      },
      {
        label: 'Forward',
        shortcut: 'Alt+\u2192',
        onClick: () => opts.onForward?.(),
        disabled: !opts.canGoForward,
      },
      {
        label: 'Reload',
        shortcut: 'Ctrl+R',
        onClick: () => opts.onReload?.(),
      },
    ],
    [
      {
        label: opts.isBookmarked ? 'Remove Bookmark' : 'Bookmark This Page',
        shortcut: 'Ctrl+D',
        onClick: () => opts.onBookmark?.(),
        visible: !!opts.onBookmark,
      },
    ],
    textSelectionPreset(),
  )
}

interface BrowserTabOptions {
  tabId: string
  onReload?: () => void
  onDuplicate?: () => void
  onClose?: () => void
  onCloseOthers?: () => void
}

export function browserTabPreset(opts: BrowserTabOptions): ContextMenuItem[] {
  return composeLayers(
    [
      {
        label: 'Reload Tab',
        onClick: () => opts.onReload?.(),
      },
      {
        label: 'Duplicate Tab',
        onClick: () => opts.onDuplicate?.(),
        visible: !!opts.onDuplicate,
      },
    ],
    [
      {
        label: 'Close Other Tabs',
        onClick: () => opts.onCloseOthers?.(),
        visible: !!opts.onCloseOthers,
      },
      {
        label: 'Close Tab',
        shortcut: 'Ctrl+W',
        onClick: () => opts.onClose?.(),
        danger: true,
      },
    ],
  )
}

interface BrowserBookmarkOptions {
  url: string
  onOpen?: () => void
  onOpenNewTab?: () => void
  onRemove?: () => void
}

export function browserBookmarkPreset(opts: BrowserBookmarkOptions): ContextMenuItem[] {
  return composeLayers(
    [
      {
        label: 'Open',
        onClick: () => opts.onOpen?.(),
      },
      {
        label: 'Open in New Tab',
        onClick: () => opts.onOpenNewTab?.(),
        visible: !!opts.onOpenNewTab,
      },
    ],
    [
      {
        label: 'Remove Bookmark',
        onClick: () => opts.onRemove?.(),
        danger: true,
        visible: !!opts.onRemove,
      },
    ],
  )
}

// ---------------------------------------------------------------------------
// Layer 3: Social Feed
// ---------------------------------------------------------------------------

interface SocialFeedPostOptions {
  postId?: string
  authorName?: string
  onCopyLink?: () => void
  onShare?: () => void
  onSave?: () => void
  onReport?: () => void
  onViewProfile?: () => void
}

export function socialFeedPostPreset(opts: SocialFeedPostOptions = {}): ContextMenuItem[] {
  return composeLayers(
    [
      {
        label: 'Copy Link',
        onClick: () => opts.onCopyLink?.(),
        visible: !!opts.onCopyLink,
      },
      {
        label: 'Share',
        onClick: () => opts.onShare?.(),
        visible: !!opts.onShare,
      },
      {
        label: 'Save Post',
        onClick: () => opts.onSave?.(),
        visible: !!opts.onSave,
      },
    ],
    [
      {
        label: opts.authorName ? `View ${opts.authorName}'s Profile` : 'View Profile',
        onClick: () => opts.onViewProfile?.(),
        visible: !!opts.onViewProfile,
      },
    ],
    [
      {
        label: 'Report',
        onClick: () => opts.onReport?.(),
        danger: true,
        visible: !!opts.onReport,
      },
    ],
    textSelectionPreset(),
  )
}

// ---------------------------------------------------------------------------
// Layer 3: Messaging
// ---------------------------------------------------------------------------

interface MessagingOptions {
  isOwnMessage?: boolean
  onReply?: () => void
  onCopyText?: () => void
  onForward?: () => void
  onDelete?: () => void
  onReport?: () => void
}

export function messagingPreset(opts: MessagingOptions = {}): ContextMenuItem[] {
  return composeLayers(
    [
      {
        label: 'Reply',
        onClick: () => opts.onReply?.(),
        visible: !!opts.onReply,
      },
      {
        label: 'Copy Text',
        onClick: () => opts.onCopyText?.(),
        visible: !!opts.onCopyText,
      },
      {
        label: 'Forward',
        onClick: () => opts.onForward?.(),
        visible: !!opts.onForward,
      },
    ],
    [
      {
        label: 'Delete Message',
        onClick: () => opts.onDelete?.(),
        danger: true,
        visible: !!opts.isOwnMessage && !!opts.onDelete,
      },
      {
        label: 'Report Message',
        onClick: () => opts.onReport?.(),
        danger: true,
        visible: !opts.isOwnMessage && !!opts.onReport,
      },
    ],
  )
}

// ---------------------------------------------------------------------------
// Layer 3: Blog / Article
// ---------------------------------------------------------------------------

interface BlogArticleOptions {
  onCopyLink?: () => void
}

export function blogArticlePreset(opts: BlogArticleOptions = {}): ContextMenuItem[] {
  return composeLayers(
    [
      {
        label: 'Copy Link',
        onClick: () => opts.onCopyLink?.(),
        visible: !!opts.onCopyLink,
      },
    ],
    textSelectionPreset(),
  )
}

// ---------------------------------------------------------------------------
// Layer 3: E-Commerce
// ---------------------------------------------------------------------------

interface ECommerceProductOptions {
  productName?: string
  onCopyLink?: () => void
  onShare?: () => void
}

export function ecommerceProductPreset(opts: ECommerceProductOptions = {}): ContextMenuItem[] {
  return composeLayers(
    [
      {
        label: 'Copy Link',
        onClick: () => opts.onCopyLink?.(),
        visible: !!opts.onCopyLink,
      },
      {
        label: 'Share',
        onClick: () => opts.onShare?.(),
        visible: !!opts.onShare,
      },
    ],
    textSelectionPreset(),
  )
}

// ---------------------------------------------------------------------------
// Layer 3: Video / Media
// ---------------------------------------------------------------------------

interface VideoMediaOptions {
  onCopyLink?: () => void
  onLoop?: () => void
  isLooping?: boolean
}

export function videoMediaPreset(opts: VideoMediaOptions = {}): ContextMenuItem[] {
  return composeLayers(
    [
      {
        label: 'Loop',
        checked: opts.isLooping,
        onClick: () => opts.onLoop?.(),
        visible: !!opts.onLoop,
      },
      {
        label: 'Copy Video Link',
        onClick: () => opts.onCopyLink?.(),
        visible: !!opts.onCopyLink,
      },
    ],
    textSelectionPreset(),
  )
}

// ---------------------------------------------------------------------------
// Layer 3: File Manager
// ---------------------------------------------------------------------------

interface FileManagerOptions {
  fileName?: string
  isFolder?: boolean
  onOpen?: () => void
  onRename?: () => void
  onDelete?: () => void
  onNewFolder?: () => void
}

export function fileManagerItemPreset(opts: FileManagerOptions = {}): ContextMenuItem[] {
  return composeLayers(
    [
      {
        label: 'Open',
        onClick: () => opts.onOpen?.(),
        visible: !!opts.onOpen,
      },
      {
        label: 'Rename',
        shortcut: 'F2',
        onClick: () => opts.onRename?.(),
        visible: !!opts.onRename,
      },
    ],
    [
      {
        label: 'New Folder',
        onClick: () => opts.onNewFolder?.(),
        visible: !!opts.onNewFolder,
      },
    ],
    [
      {
        label: 'Delete',
        onClick: () => opts.onDelete?.(),
        danger: true,
        visible: !!opts.onDelete,
      },
    ],
  )
}

export function fileManagerEmptyPreset(opts: { onNewFolder?: () => void } = {}): ContextMenuItem[] {
  return composeLayers(
    [
      {
        label: 'New Folder',
        onClick: () => opts.onNewFolder?.(),
        visible: !!opts.onNewFolder,
      },
    ],
    clipboardPreset(),
  )
}

// ---------------------------------------------------------------------------
// Layer 3: Calculator
// ---------------------------------------------------------------------------

interface CalculatorOptions {
  displayValue?: string
  onCopyResult?: () => void
  onClear?: () => void
  onClearHistory?: () => void
}

export function calculatorPreset(opts: CalculatorOptions = {}): ContextMenuItem[] {
  return composeLayers(
    [
      {
        label: 'Copy Result',
        shortcut: 'Ctrl+C',
        onClick: () => opts.onCopyResult?.(),
        visible: !!opts.onCopyResult,
        disabled: !opts.displayValue || opts.displayValue === '0',
      },
    ],
    [
      {
        label: 'Clear',
        shortcut: 'Esc',
        onClick: () => opts.onClear?.(),
        visible: !!opts.onClear,
      },
      {
        label: 'Clear Memory',
        onClick: () => opts.onClearHistory?.(),
        visible: !!opts.onClearHistory,
      },
    ],
  )
}

// ---------------------------------------------------------------------------
// Layer 3: Text Editor
// ---------------------------------------------------------------------------

interface TextEditorOptions {
  onNew?: () => void
  onSave?: () => void
  onFind?: () => void
  wordWrap?: boolean
  onToggleWordWrap?: () => void
}

export function textEditorPreset(opts: TextEditorOptions = {}): ContextMenuItem[] {
  return composeLayers(
    clipboardPreset(),
    [
      {
        label: 'Find',
        shortcut: 'Ctrl+F',
        onClick: () => opts.onFind?.(),
        visible: !!opts.onFind,
      },
    ],
    [
      {
        label: 'Word Wrap',
        checked: opts.wordWrap,
        onClick: () => opts.onToggleWordWrap?.(),
        visible: opts.onToggleWordWrap !== undefined,
      },
    ],
    [
      {
        label: 'New Document',
        shortcut: 'Ctrl+N',
        onClick: () => opts.onNew?.(),
        visible: !!opts.onNew,
      },
      {
        label: 'Save',
        shortcut: 'Ctrl+S',
        onClick: () => opts.onSave?.(),
        visible: !!opts.onSave,
      },
    ],
  )
}

// ---------------------------------------------------------------------------
// Layer 3: Clock / Timer
// ---------------------------------------------------------------------------

interface ClockOptions {
  currentTime?: string
  onCopyTime?: () => void
  activeTab?: string
  onResetStopwatch?: () => void
  onResetTimer?: () => void
}

export function clockPreset(opts: ClockOptions = {}): ContextMenuItem[] {
  return composeLayers(
    [
      {
        label: 'Copy Time',
        onClick: () => opts.onCopyTime?.(),
        visible: !!opts.onCopyTime,
      },
    ],
    [
      {
        label: 'Reset Stopwatch',
        onClick: () => opts.onResetStopwatch?.(),
        visible: opts.activeTab === 'stopwatch' && !!opts.onResetStopwatch,
        danger: true,
      },
      {
        label: 'Reset Timer',
        onClick: () => opts.onResetTimer?.(),
        visible: opts.activeTab === 'timer' && !!opts.onResetTimer,
        danger: true,
      },
    ],
  )
}

// ---------------------------------------------------------------------------
// Layer 3: Sticky Note
// ---------------------------------------------------------------------------

interface StickyNoteOptions {
  noteId?: string
  onDuplicate?: () => void
  onDelete?: () => void
  colors?: { label: string; value: string }[]
  onChangeColor?: (color: string) => void
}

export function stickyNotePreset(opts: StickyNoteOptions = {}): ContextMenuItem[] {
  return composeLayers(
    [
      {
        label: 'Duplicate Note',
        onClick: () => opts.onDuplicate?.(),
        visible: !!opts.onDuplicate,
      },
    ],
    [
      {
        label: 'Change Color',
        visible: !!opts.colors && opts.colors.length > 0 && !!opts.onChangeColor,
        children: (opts.colors ?? []).map(c => ({
          label: c.label,
          onClick: () => opts.onChangeColor?.(c.value),
        })),
      },
    ],
    [
      {
        label: 'Delete Note',
        onClick: () => opts.onDelete?.(),
        danger: true,
        visible: !!opts.onDelete,
      },
    ],
  )
}

// ---------------------------------------------------------------------------
// Layer 3: Image Viewer
// ---------------------------------------------------------------------------

interface ImageViewerOptions {
  filename?: string
  onCopyImage?: () => void
  onSaveImage?: () => void
  onZoomFit?: () => void
  onZoomActual?: () => void
  onZoomIn?: () => void
  onZoomOut?: () => void
  onPrev?: () => void
  onNext?: () => void
  hasMultiple?: boolean
}

export function imageViewerPreset(opts: ImageViewerOptions = {}): ContextMenuItem[] {
  return composeLayers(
    [
      {
        label: 'Copy Image',
        onClick: () => opts.onCopyImage?.(),
        visible: !!opts.onCopyImage,
      },
      {
        label: 'Save Image As...',
        onClick: () => opts.onSaveImage?.(),
        visible: !!opts.onSaveImage,
      },
    ],
    [
      {
        label: 'Zoom to Fit',
        shortcut: '0',
        onClick: () => opts.onZoomFit?.(),
        visible: !!opts.onZoomFit,
      },
      {
        label: 'Actual Size',
        onClick: () => opts.onZoomActual?.(),
        visible: !!opts.onZoomActual,
      },
      {
        label: 'Zoom In',
        shortcut: '+',
        onClick: () => opts.onZoomIn?.(),
        visible: !!opts.onZoomIn,
      },
      {
        label: 'Zoom Out',
        shortcut: '-',
        onClick: () => opts.onZoomOut?.(),
        visible: !!opts.onZoomOut,
      },
    ],
    [
      {
        label: 'Previous Image',
        shortcut: '\u2190',
        onClick: () => opts.onPrev?.(),
        visible: !!opts.hasMultiple && !!opts.onPrev,
      },
      {
        label: 'Next Image',
        shortcut: '\u2192',
        onClick: () => opts.onNext?.(),
        visible: !!opts.hasMultiple && !!opts.onNext,
      },
    ],
  )
}

// ---------------------------------------------------------------------------
// Layer 3: Calendar
// ---------------------------------------------------------------------------

interface CalendarOptions {
  selectedDate?: string
  onCopyDate?: () => void
  onGoToToday?: () => void
}

export function calendarPreset(opts: CalendarOptions = {}): ContextMenuItem[] {
  return composeLayers(
    [
      {
        label: 'Go to Today',
        onClick: () => opts.onGoToToday?.(),
        visible: !!opts.onGoToToday,
      },
    ],
    [
      {
        label: 'Copy Date',
        onClick: () => opts.onCopyDate?.(),
        visible: !!opts.onCopyDate && !!opts.selectedDate,
      },
    ],
  )
}

// ---------------------------------------------------------------------------
// Layer 3: Weather
// ---------------------------------------------------------------------------

interface WeatherOptions {
  onRefresh?: () => void
  onCopyConditions?: () => void
}

export function weatherPreset(opts: WeatherOptions = {}): ContextMenuItem[] {
  return composeLayers(
    [
      {
        label: 'Refresh Weather',
        shortcut: 'F5',
        onClick: () => opts.onRefresh?.(),
        visible: !!opts.onRefresh,
      },
    ],
    [
      {
        label: 'Copy Conditions',
        onClick: () => opts.onCopyConditions?.(),
        visible: !!opts.onCopyConditions,
      },
    ],
  )
}

// ---------------------------------------------------------------------------
// Layer 3: Media Player
// ---------------------------------------------------------------------------

interface MediaPlayerTrackOptions {
  trackTitle?: string
  onPlay?: () => void
  onCopyTrackInfo?: () => void
  onRemoveFromPlaylist?: () => void
}

export function mediaPlayerTrackPreset(opts: MediaPlayerTrackOptions = {}): ContextMenuItem[] {
  return composeLayers(
    [
      {
        label: 'Play',
        onClick: () => opts.onPlay?.(),
        visible: !!opts.onPlay,
      },
      {
        label: 'Copy Track Info',
        onClick: () => opts.onCopyTrackInfo?.(),
        visible: !!opts.onCopyTrackInfo,
      },
    ],
    [
      {
        label: 'Remove from Playlist',
        onClick: () => opts.onRemoveFromPlaylist?.(),
        danger: true,
        visible: !!opts.onRemoveFromPlaylist,
      },
    ],
  )
}

interface MediaPlayerOptions {
  isPlaying?: boolean
  shuffle?: boolean
  repeat?: boolean
  onTogglePlay?: () => void
  onToggleShuffle?: () => void
  onToggleRepeat?: () => void
  onNext?: () => void
  onPrev?: () => void
}

export function mediaPlayerPreset(opts: MediaPlayerOptions = {}): ContextMenuItem[] {
  return composeLayers(
    [
      {
        label: opts.isPlaying ? 'Pause' : 'Play',
        onClick: () => opts.onTogglePlay?.(),
        visible: !!opts.onTogglePlay,
      },
      {
        label: 'Previous Track',
        onClick: () => opts.onPrev?.(),
        visible: !!opts.onPrev,
      },
      {
        label: 'Next Track',
        onClick: () => opts.onNext?.(),
        visible: !!opts.onNext,
      },
    ],
    [
      {
        label: 'Shuffle',
        checked: opts.shuffle,
        onClick: () => opts.onToggleShuffle?.(),
        visible: !!opts.onToggleShuffle,
      },
      {
        label: 'Repeat',
        checked: opts.repeat,
        onClick: () => opts.onToggleRepeat?.(),
        visible: !!opts.onToggleRepeat,
      },
    ],
  )
}

// ---------------------------------------------------------------------------
// Layer 3: Snipping Tool
// ---------------------------------------------------------------------------

interface SnipOptions {
  onNewSnip?: () => void
  onCopy?: () => void
  onSave?: () => void
  onDeleteFromHistory?: () => void
  hasPreview?: boolean
}

export function snipPreset(opts: SnipOptions = {}): ContextMenuItem[] {
  return composeLayers(
    [
      {
        label: 'New Snip',
        onClick: () => opts.onNewSnip?.(),
        visible: !!opts.onNewSnip,
      },
    ],
    [
      {
        label: 'Copy to Clipboard',
        shortcut: 'Ctrl+C',
        onClick: () => opts.onCopy?.(),
        visible: !!opts.hasPreview && !!opts.onCopy,
      },
      {
        label: 'Save As...',
        shortcut: 'Ctrl+S',
        onClick: () => opts.onSave?.(),
        visible: !!opts.hasPreview && !!opts.onSave,
      },
    ],
    [
      {
        label: 'Delete from History',
        onClick: () => opts.onDeleteFromHistory?.(),
        danger: true,
        visible: !!opts.onDeleteFromHistory,
      },
    ],
  )
}
