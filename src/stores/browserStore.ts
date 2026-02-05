import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Bookmark {
  id: string
  url: string
  title: string
  icon: string
  position: number
  createdAt: number
}

export interface SiteVisit {
  count: number
  lastVisit: number
}

export interface BrowserState {
  bookmarks: Bookmark[]
  showBookmarksBar: boolean
  siteVisits: Record<string, SiteVisit>  // domain -> visit data

  // Bookmark Actions
  addBookmark: (url: string, title: string, icon: string) => void
  removeBookmark: (id: string) => void
  reorderBookmark: (id: string, newPosition: number) => void
  isBookmarked: (url: string) => boolean
  getBookmarkByUrl: (url: string) => Bookmark | undefined
  toggleBookmarksBar: () => void
  setShowBookmarksBar: (show: boolean) => void

  // Visit Tracking Actions
  recordVisit: (domain: string) => void
  getVisitCount: (domain: string) => number
  getTopVisitedDomains: (limit?: number) => Array<{ domain: string; count: number; lastVisit: number }>
  clearHistory: () => void
}

function generateBookmarkId(): string {
  return `bookmark-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export const useBrowserStore = create<BrowserState>()(
  persist(
    (set, get) => ({
      bookmarks: [],
      showBookmarksBar: true,
      siteVisits: {},

      addBookmark: (url: string, title: string, icon: string) => {
        const { bookmarks } = get()

        // Don't add duplicate
        if (bookmarks.some(b => b.url === url)) return

        const newBookmark: Bookmark = {
          id: generateBookmarkId(),
          url,
          title,
          icon,
          position: bookmarks.length,
          createdAt: Date.now(),
        }

        set({ bookmarks: [...bookmarks, newBookmark] })
      },

      removeBookmark: (id: string) => {
        const { bookmarks } = get()
        const filtered = bookmarks.filter(b => b.id !== id)

        // Recalculate positions
        const reindexed = filtered.map((b, i) => ({ ...b, position: i }))

        set({ bookmarks: reindexed })
      },

      reorderBookmark: (id: string, newPosition: number) => {
        const { bookmarks } = get()
        const bookmark = bookmarks.find(b => b.id === id)
        if (!bookmark) return

        const oldPosition = bookmark.position
        if (oldPosition === newPosition) return

        // Update positions for all affected bookmarks
        const updated = bookmarks.map(b => {
          if (b.id === id) {
            return { ...b, position: newPosition }
          }

          // Moving forward (dragging left)
          if (oldPosition > newPosition) {
            if (b.position >= newPosition && b.position < oldPosition) {
              return { ...b, position: b.position + 1 }
            }
          }

          // Moving backward (dragging right)
          if (oldPosition < newPosition) {
            if (b.position > oldPosition && b.position <= newPosition) {
              return { ...b, position: b.position - 1 }
            }
          }

          return b
        })

        set({ bookmarks: updated })
      },

      isBookmarked: (url: string) => {
        return get().bookmarks.some(b => b.url === url)
      },

      getBookmarkByUrl: (url: string) => {
        return get().bookmarks.find(b => b.url === url)
      },

      toggleBookmarksBar: () => {
        set(state => ({ showBookmarksBar: !state.showBookmarksBar }))
      },

      setShowBookmarksBar: (show: boolean) => {
        set({ showBookmarksBar: show })
      },

      // Visit Tracking
      recordVisit: (domain: string) => {
        const { siteVisits } = get()
        const normalized = domain.toLowerCase().replace(/^www\./, '')
        const existing = siteVisits[normalized]

        set({
          siteVisits: {
            ...siteVisits,
            [normalized]: {
              count: (existing?.count || 0) + 1,
              lastVisit: Date.now(),
            },
          },
        })
      },

      getVisitCount: (domain: string) => {
        const { siteVisits } = get()
        const normalized = domain.toLowerCase().replace(/^www\./, '')
        return siteVisits[normalized]?.count || 0
      },

      getTopVisitedDomains: (limit = 12) => {
        const { siteVisits } = get()
        return Object.entries(siteVisits)
          .map(([domain, data]) => ({ domain, ...data }))
          .sort((a, b) => b.count - a.count)
          .slice(0, limit)
      },

      clearHistory: () => {
        set({ siteVisits: {} })
      },
    }),
    {
      name: 'engaige-browser',
      partialize: (state) => ({
        bookmarks: state.bookmarks,
        showBookmarksBar: state.showBookmarksBar,
        siteVisits: state.siteVisits,
      }),
    }
  )
)

export default useBrowserStore
