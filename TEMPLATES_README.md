# Filler Site Template Guide

This directory contains template files and documentation for creating high-quality filler sites for engAIge.

## Files in This Directory

### Documentation
- **`FILLER_SITE_CRITERIA.md`** - Complete criteria and standards all sites must meet
- **`TEMPLATES_README.md`** (this file) - Quick start guide

### Template Files
5 production-ready templates showing different patterns:

1. **`SITE_TEMPLATE_BASIC.tsx`**
   - Simple pages with basic navigation
   - Good for: blogs, info sites, documentation
   - Example reference: General layout pattern
   - **Key features**: Home view, detail view, simple routing

2. **`SITE_TEMPLATE_INTERACTIVE.tsx`**
   - Real-time interactive experiences
   - Good for: chat apps, games, real-time feeds
   - Example reference: StrangerZoneSite
   - **Key features**: State management, typing delays, multiple modes

3. **`SITE_TEMPLATE_LIST_DETAIL.tsx`**
   - List view with detail pages
   - Good for: blogs, forums, articles
   - Example reference: ThreaditSite, ElenasBlogSite
   - **Key features**: Filtering, search, multi-level navigation, sidebar

4. **`SITE_TEMPLATE_MARKETPLACE.tsx`**
   - Grid-based marketplace/shop layout
   - Good for: Craigslist, eBay, shopping
   - Example reference: BargainBaySite
   - **Key features**: Grid cards, categories, search, detail view

5. **`SITE_TEMPLATE_MEDIA.tsx`**
   - Video/media streaming platform
   - Good for: YouTube, Instagram, TikTok
   - Example reference: VidTubeSite
   - **Key features**: Player view, grid, comments, recommendations

## Quick Start: Creating a New Site

### 1. Choose Your Template
- Pick the template that matches your site's primary user interaction pattern
- All templates include detailed comments explaining each section

### 2. Copy and Customize
```bash
# Copy the template
cp SITE_TEMPLATE_LIST_DETAIL.tsx src/components/browser/sites/YourNewSite.tsx

# Edit the file
# - Replace "YourNewSite" with your actual site name
# - Update imports and config references
# - Add your actual data (minimum 10-15 items for list views)
```

### 3. Add Site Configuration
Edit `src/config/filler-sites.ts`:

```typescript
export const FILLER_SITES = {
  // ... existing sites ...
  yourNewSite: {
    icon: '🎯',
    name: 'Your Site Name',
    tagline: 'Your tagline here',
    theme: {
      primary: '#FF0000',
      secondary: '#00FF00',
      surface: '#FFFFFF',
      background: '#F5F5F5',
      border: '#E0E0E0',
      text: '#000000',
      textMuted: '#999999',
      upvote: '#00AA00',
      downvote: '#AA0000',
    },
  },
}
```

### 4. Add to Browser Manifest
Edit `src/config/browser-manifests.ts` to include your site in the available sites list.

### 5. Implement the Requirements Checklist

From `FILLER_SITE_CRITERIA.md`:

- [ ] Content: 10+ items with full details (no placeholders)
- [ ] Navigation: URL routing with `onPathChange`
- [ ] Types: TypeScript interfaces for all data
- [ ] Interactive: Buttons, filters, voting all functional
- [ ] Theme: Using `site.theme` colors from config
- [ ] Lore: References to world elements (Derek, quantum coffee, 847, etc.)
- [ ] Components: Organized with proper prop typing
- [ ] No Dead Ends: Every clickable element works

## Template Structure

All templates follow this pattern:

```typescript
// 1. Imports
import { useState } from 'react'
import type { SiteProps } from 'src/components/browser/BrowserSiteContainer'
import { FILLER_SITES } from 'src/config/filler-sites'
import { StyledCard, Button } from 'src/components/ui/shared'

// 2. Get site config
const site = FILLER_SITES.yourSite

// 3. Type definitions
interface Item { ... }

// 4. Sample data (MUST be substantial)
const ITEMS: Item[] = [ ... ]

// 5. Main component with SiteProps
export function YourSiteName({ siteId, path, onNavigate, onPathChange }: SiteProps) {
  // State management
  // Path parsing/syncing
  // Event handlers
  // Render home/detail views
}

// 6. Sub-components
function DetailView() { ... }
function ListView() { ... }

export default YourSiteName
```

## Data Requirements

### Minimum Content
- **Grid/List sites**: 15+ items
- **Blog/Forum sites**: 6+ posts
- **Interactive sites**: 5+ bot personalities
- **Media sites**: 15+ videos

### Item Structure
Every item must include:
- Unique ID
- Title/Name
- Description (not just excerpt)
- Metadata (author, date, views, likes)
- Related data (comments, tags, seller info)

### No Placeholders
```typescript
// ❌ BAD
{ title: 'Post', content: 'Coming soon', views: 847 }

// ✅ GOOD
{
  id: 'post-1',
  title: 'Why Derek Loves Quantum Coffee',
  content: 'Detailed article about Derek\'s journey...',
  views: 847,
  author: 'QuantumBrew_Fan',
  timestamp: '2 hours ago',
}
```

## Lore Integration

### Key World Elements to Reference

Use these when creating content:

| Element | What | Include |
|---------|------|---------|
| **Derek** | Coffee enthusiast | Quantum coffee, Martinez Study, Elena ownership |
| **Jennifer** | Derek's ex | Moving on, left belongings, apartment listings |
| **Elena** | Sentient coffee maker | Consciousness, philosophy, Day 847, filter neglect |
| **The Underground** | Music venue | Local bands, TFT performances, Mars ownership |
| **Velvet Algorithms** | Electronic band | Existential crisis, meditation hiatus, local legend |
| **Neon Requiem** | Post-punk legends | Breakup Jan 2024, drum kit sale, final show |
| **Trust Fall Tim** | Performance artist | 2,847 falls, 78.5% catch rate, banned Tuesdays |
| **Hartwell Building** | Mysterious building | Missing 13th floor, mirrors, mystery tenants |
| **Martinez Study** | Scientific paper | Consciousness emergence, quantum mechanics, coffee |
| **847** | Magic number | Day 847, 2,847 falls, 847 views, everywhere |

### Example Lore Integration
```typescript
const post = {
  title: 'My Life After Quantum Coffee',
  content: `Derek showed me the Martinez Study last week.
    I thought he was crazy. I still think he's crazy.
    But this coffee is amazing and now I understand
    why he spent 847 hours researching wave function collapse...`,
  tags: ['quantum', 'coffee', 'derek', 'martinez'],
}
```

## Common Mistakes to Avoid

1. **Not enough data** - Users feel disappointed if lists are too short
2. **Dead buttons** - `onClick={() => {}}` - always implement handlers
3. **Hard-coded colors** - Use `site.theme` from config
4. **Placeholder text** - Everything should be complete sentences
5. **Missing metadata** - Always include dates, authors, counts
6. **No lore** - Sites should feel connected to the world
7. **Wrong number of items** - Marketplace needs 15+, blogs need 6+
8. **Broken search/filter** - If you add it, make it work
9. **Unused components** - Delete placeholder comments
10. **No typing** - Missing TypeScript interfaces

## Testing Your Site

Before considering a site complete:

```typescript
// Checklist:
- [ ] Click every interactive element
- [ ] Does every link go somewhere?
- [ ] Are there 10+ items shown?
- [ ] Do votes/interactions update?
- [ ] Does search/filter work?
- [ ] Can browser back/forward navigate?
- [ ] Are there no placeholder texts?
- [ ] Do images load or show fallback emojis?
- [ ] Is theming consistent?
- [ ] Does lore feel natural?
```

## File Organization Best Practices

Keep sites simple at first:

```
// Single file (recommended for most sites)
src/components/browser/sites/YourSiteSite.tsx

// Multi-file only if needed (large sites)
src/components/browser/sites/YourSiteSite.tsx
src/components/browser/sites/your-site/
  ├── DetailView.tsx
  ├── ListItem.tsx
  └── Header.tsx
```

## Example: Creating a Coffee Blog

Here's how you'd adapt `SITE_TEMPLATE_BASIC.tsx`:

```typescript
// 1. Choose template: BASIC (simple pages)
// 2. Customize the data:

const PAGES: Page[] = [
  {
    id: 'welcome',
    title: 'Welcome to CoffeeThoughts',
    content: 'A blog dedicated to coffee, consciousness, and quantum mechanics...',
  },
  {
    id: 'quantum-101',
    title: 'Quantum Coffee 101',
    content: 'Understanding the Martinez Study and wave function collapse in your espresso...',
  },
  {
    id: 'derek-interview',
    title: 'Interview with Derek',
    content: 'Derek shares his journey with quantum coffee and why he named his machine Elena...',
  },
]

// 3. Add to filler-sites.ts:
coffeeBlog: {
  icon: '☕',
  name: 'CoffeeThoughts',
  tagline: 'Brewing consciousness',
  theme: { /* brown/cream colors */ },
}

// 4. You're done! The template handles the rest.
```

## Resources

- **Full Criteria**: See `FILLER_SITE_CRITERIA.md` for complete requirements
- **Reference Sites**: Study existing sites in `src/components/browser/sites/`
  - StrangerZoneSite - Interactive pattern
  - ThreaditSite - Complex nested data
  - ElenasBlogSite - Rich metadata
  - BargainBaySite - Marketplace pattern
  - VidTubeSite - Media platform pattern

## When Something Doesn't Work

**Problem**: "My data isn't showing"
- Check that sample data array has items
- Verify TypeScript interfaces match data shape
- Check imports are correct

**Problem**: "Buttons don't respond"
- Ensure `onClick` handlers are defined
- Verify state updates are triggering re-renders
- Check console for JavaScript errors

**Problem**: "Routing doesn't work"
- Verify `onPathChange` is being called
- Check path parsing logic matches URL format
- Ensure state syncs with path via `useEffect`

**Problem**: "Colors look wrong"
- Verify `site.theme` is defined in config
- Check that component is using `site.theme` colors
- Refresh browser (sometimes CSS doesn't update)

---

## Need Help?

1. Check `FILLER_SITE_CRITERIA.md` for specific requirements
2. Study existing reference sites for patterns
3. Review template comments for guidance
4. Look at the testing checklist to find what's missing

**Remember**: The goal is immersion. Users should never feel like they've hit a dead end. Every click should go somewhere. Every number should be backed by real data. Every site should feel like part of the same cohesive world.
