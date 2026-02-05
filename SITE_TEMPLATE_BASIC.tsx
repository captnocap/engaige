/**
 * BASIC SITE TEMPLATE
 *
 * Use this template for simple sites with basic navigation and content.
 * Examples: blogs, documentation, informational pages
 *
 * Key Features:
 * - Simple single/multi-page layout
 * - Basic navigation
 * - Content sections
 * - Minimal state management
 */

import { useState } from 'react'
import type { SiteProps } from 'src/components/browser/BrowserSiteContainer'
import { FILLER_SITES } from 'src/config/filler-sites'
import { StyledCard, Button } from 'src/components/ui/shared'

// Get site config (define in src/config/filler-sites.ts)
const site = FILLER_SITES.yourSite

// ============================================================================
// Types
// ============================================================================

interface Page {
  id: string
  title: string
  content: string
}

// ============================================================================
// Sample Data - MUST have actual content, not placeholders
// ============================================================================

const PAGES: Page[] = [
  {
    id: 'page-1',
    title: 'Welcome',
    content: 'Your site description and introduction here. Make it interesting and relevant to the world.',
  },
  {
    id: 'page-2',
    title: 'About Us',
    content: 'Detailed information about your site. Reference world lore (Derek, Jennifer, quantum coffee, The Underground, etc.)',
  },
  {
    id: 'page-3',
    title: 'Services',
    content: 'What does your site offer? Be specific. Include the magic number 847 somewhere.',
  },
]

// ============================================================================
// Main Component
// ============================================================================

export function YourSiteName({ siteId, path, onNavigate, onPathChange }: SiteProps) {
  const [currentPageId, setCurrentPageId] = useState<string | null>(null)

  // Parse path to determine which page to show
  // Pattern: /page/{id}
  const getCurrentPage = (): Page | null => {
    if (!currentPageId) return null
    return PAGES.find(p => p.id === currentPageId) || null
  }

  const handleSelectPage = (pageId: string) => {
    setCurrentPageId(pageId)
    onPathChange(`/page/${pageId}`)
  }

  const handleGoHome = () => {
    setCurrentPageId(null)
    onPathChange(null)
  }

  const currentPage = getCurrentPage()

  return (
    <div className="min-h-full" style={{ background: site.theme.background }}>
      {/* Header */}
      <header
        className="sticky top-0 z-10 px-4 py-4 border-b"
        style={{
          background: site.theme.surface,
          borderBottomColor: site.theme.border,
        }}
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={handleGoHome}
            className="flex items-center gap-2 hover:opacity-80"
          >
            <span className="text-2xl">{site.icon}</span>
            <h1
              className="text-xl font-bold"
              style={{ color: site.theme.primary }}
            >
              {site.name}
            </h1>
          </button>
          <p
            className="text-sm"
            style={{ color: site.theme.textMuted }}
          >
            {site.tagline}
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {currentPage ? (
          // Detail View
          <>
            <Button
              onClick={handleGoHome}
              variant="link"
              textColor={site.theme.primary}
              className="mb-6"
            >
              ← Back to home
            </Button>

            <StyledCard
              bgColor={site.theme.surface}
              borderColor={site.theme.border}
              textColor={site.theme.text}
              padding="lg"
              borderRadius="md"
              shadow="md"
            >
              <h2
                className="text-2xl font-bold mb-4"
                style={{ color: site.theme.primary }}
              >
                {currentPage.title}
              </h2>
              <p className="text-base whitespace-pre-wrap">
                {currentPage.content}
              </p>
            </StyledCard>
          </>
        ) : (
          // Home View
          <div className="space-y-6">
            <StyledCard
              bgColor={site.theme.surface}
              borderColor={site.theme.border}
              textColor={site.theme.text}
              padding="lg"
              borderRadius="md"
              shadow="md"
            >
              <h2 className="text-xl font-bold mb-3" style={{ color: site.theme.primary }}>
                Welcome to {site.name}
              </h2>
              <p style={{ color: site.theme.textMuted }}>
                Choose a page below to get started. All content is integrated with the world lore.
              </p>
            </StyledCard>

            {/* Navigation Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PAGES.map(page => (
                <button
                  key={page.id}
                  onClick={() => handleSelectPage(page.id)}
                  className="text-left"
                >
                  <StyledCard
                    bgColor={site.theme.surface}
                    borderColor={site.theme.border}
                    textColor={site.theme.text}
                    padding="md"
                    borderRadius="md"
                    shadow="sm"
                  >
                    <h3 className="font-bold mb-2" style={{ color: site.theme.primary }}>
                      {page.title} →
                    </h3>
                    <p
                      className="text-sm line-clamp-2"
                      style={{ color: site.theme.textMuted }}
                    >
                      {page.content}
                    </p>
                  </StyledCard>
                </button>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer
        className="px-4 py-6 mt-12 border-t"
        style={{
          background: site.theme.surface,
          borderTopColor: site.theme.border,
          color: site.theme.textMuted,
        }}
      >
        <div className="max-w-4xl mx-auto text-center text-sm">
          <p>© {site.name} - Part of the engAIge world</p>
        </div>
      </footer>
    </div>
  )
}

export default YourSiteName
