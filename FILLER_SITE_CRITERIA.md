# Filler Sites Quality Criteria

Every filler site in engAIge must meet these standards to maintain world immersion. This document defines the requirements for new sites.

## Core Principle

**If it looks clickable, it MUST work. No dead ends.**

## Mandatory Requirements

### 1. Content Quality - Zero Placeholders

**REQUIRED:**
- Every list shows actual items (10+ items minimum for marketplace/forum views)
- Every clickable element has real destination/behavior
- All counts/numbers are backed by actual data
- Comments, posts, or responses exist (not "847 comments" with empty section)
- Descriptions, titles, and metadata are complete sentences

**NOT ALLOWED:**
- Empty comment threads
- "Click here" links with no destination
- Unimplemented buttons
- Placeholder text like "TODO" or "[content goes here]"
- Numbers without supporting data

### 2. Navigation & Routing

**REQUIRED:**
- URL path tracking using `onPathChange` prop
- Parse `path` prop to restore state from browser history
- Multi-level navigation (home → category/section → detail)
- Back buttons that restore previous state
- Consistent URL structure across site

**PATTERN:**
```typescript
// Parse path to determine current view
const route = useMemo(() => parseRoute(path), [path])

// Navigate by updating both state and URL
const handleSelectItem = (item) => {
  setSelectedItem(item)
  onPathChange(`/item/${item.id}`)
}
```

### 3. Data Structure & Types

**REQUIRED:**
- TypeScript interfaces for all major data types
- Sample data array (not fetched from API)
- Proper prop typing for components
- Metadata on items (dates, counts, authors, ratings)

**PATTERN:**
```typescript
interface Post {
  id: string
  title: string
  author: string
  content: string
  timestamp: string
  likes: number
  comments: Comment[]
}

const SAMPLE_POSTS: Post[] = [
  { id: '1', title: '...', ... },
  // 10+ items minimum
]
```

### 4. Interactive Elements

**REQUIRED:**
- Voting/like systems work (state updates visible)
- Search/filter actually filters results
- Form inputs accept text
- Buttons have click handlers
- Sorting changes display order

**NOT ALLOWED:**
- `onClick={() => {}}` empty handlers
- Non-functional search boxes
- Buttons that don't respond
- Disabled states without reason

### 5. Theming & Aesthetics

**REQUIRED:**
- Use site config from `FILLER_SITES` (e.g., `site.theme.primary`)
- Use `StyledCard`, `Button`, `Avatar` components from `ui/shared`
- Consistent color scheme throughout
- Professional spacing (Tailwind gap/padding)
- Hover states on interactive elements

**PATTERN:**
```typescript
const site = FILLER_SITES.customSite

<StyledCard
  bgColor={site.theme.surface}
  borderColor={site.theme.border}
  textColor={site.theme.text}
>
  {content}
</StyledCard>
```

### 6. Lore Integration

**REQUIRED:**
- Reference existing world elements where appropriate
- Use real character names (Derek, Jennifer, Tim, Mars)
- Reference real venues (The Underground, Quantum Cafe)
- Reference real bands (Velvet Algorithms, Neon Requiem)
- Use the magic number 847
- Make it feel part of the same world

**WORLD ELEMENTS TO USE:**
| Element | Description | References |
|---------|-------------|-----------|
| Derek | Coffee enthusiast, owns Elena the coffee maker | Quantum coffee, Martinez Study |
| Jennifer | Derek's ex, left various items | Moving on, apartment near Hartwell |
| Hartwell Building | Mysterious building, missing 13th floor | Floor 7 mirrors, resident mystery |
| The Underground | Mars's music venue | TFT performs there, local bands |
| Velvet Algorithms | Electronic band, on existential hiatus | Local music scene |
| Neon Requiem | Post-punk legends, broke up Jan 2024 | Sold drum kit, farewell show |
| Trust Fall Tim (TFT) | 2,847 trust falls, 78.5% catch rate | Performs at The Underground |
| Quantum Coffee | Pseudoscience brewing method | $47/cup, Martinez Study |
| 847 | Magic number appearing everywhere | Brew cycle, Derek's trials, etc. |

### 7. Component Organization

**REQUIRED:**
- Main export component uses `SiteProps` type
- Separate components for different sections
- Proper prop interfaces
- Reusable sub-components
- Clear separation of concerns

**PATTERN:**
```typescript
export function MySite({ siteId, path, onNavigate, onPathChange }: SiteProps) {
  // Main component logic

  return (
    <>
      <Header />
      {selectedView ? <DetailView /> : <ListView />}
    </>
  )
}

function DetailView() { /* detailed view */ }
function ListItem() { /* item component */ }
```

### 8. No Dead UI

**REQUIRED:**
- Every button has a click handler
- All links navigate to valid content
- Forms can be submitted
- Expandable sections actually expand
- Loaded images or fallback emojis

**NOT ALLOWED:**
- `<a href="#">` dead links
- Buttons that look clickable but aren't
- "Read more" that goes nowhere
- Collapsed sections that don't expand
- Empty modals or dialogs

## Common Site Types

### List/Detail Pattern
*Forum (ThreaditSite), Blog (ElenasBlogSite), Marketplace (BargainBaySite)*

```
Home (list of items)
  ↓ click item
Detail (full item view with metadata)
  ↓ back button
Home
```

**Requirements:**
- Show 10+ items in list view
- Each item has clickable card
- Detail view shows full content
- Comments/metadata on detail view
- URL paths: `/` home, `/{section}/{id}` detail

### Interactive Pattern
*Chat (StrangerZoneSite), Real-time (OnlyFans), Games*

```
Lobby (setup/start screen)
  ↓ button to start
Active (live interaction)
  ↓ user sends message/action
Response (system responds)
  ↓ repeat or exit
```

**Requirements:**
- State changes visible immediately
- Typing indicators or delays for realism
- Multiple interactive states
- User actions have consequences
- Data persists during session

### Grid/Discover Pattern
*Video platform (VidTubeSite), Photo feed (InstaSnapSite), Shopping*

```
Grid view (filter by category)
  ↓ click item
Detail/Player view
  ↓ back button
Grid
```

**Requirements:**
- Grid displays 9+ items
- Category/sort filtering works
- Each item has metadata visible
- Detail view shows full content + related items
- Smooth navigation between views

## Testing Checklist

Before considering a site "complete":

- [ ] Can I click every interactive element?
- [ ] Does every link go somewhere?
- [ ] Are there 10+ items in list views?
- [ ] Do votes/likes/interactions update visibly?
- [ ] Can I search/filter and see results?
- [ ] Does browser back/forward work?
- [ ] Are there no placeholder texts?
- [ ] Is the aesthetic consistent with site config colors?
- [ ] Are lore references integrated naturally?
- [ ] Does the 847 number appear somewhere?
- [ ] Can I submit forms (even if just simulated)?
- [ ] Do images show or fall back to emojis?
- [ ] Are component names descriptive?
- [ ] Is TypeScript strict mode happy?

## File Structure

```
src/components/browser/sites/
├── YourSiteSite.tsx           # Main export
├── your-site/                 # (optional) Subcomponents
│   ├── DetailView.tsx
│   ├── ListItem.tsx
│   └── Header.tsx
└── ads/SidebarAdWidget.tsx    # Ads (optional)
```

## Examples to Study

- **ThreaditSite** - Complex nested comments, multi-level navigation
- **ElenasBlogSite** - Blog with multiple detail views, rich metadata
- **BargainBaySite** - Marketplace with categories, search, detailed listings
- **StrangerZoneSite** - Interactive stateful component, realistic delays
- **VidTubeSite** - Grid/player pattern, complex data relationships
- **InstaSnapSite** - Multiple view modes, rich media handling

## Common Mistakes to Avoid

1. **Showing counts without data** - "847 comments" → add actual comments
2. **Dead links** - Every `<a>` or `<button>` must work
3. **Empty sections** - Every page should have content
4. **Placeholder text** - "TODO", "coming soon", "[...]"
5. **Missing types** - Use TypeScript interfaces for all data
6. **Hard-coded colors** - Use `site.theme` config values
7. **No lore** - World should feel connected to other sites
8. **Too little data** - Minimum 10 items for list views
9. **Non-functional search** - If you add search, make it actually filter
10. **Missing metadata** - Dates, authors, counts, timestamps on everything

## When in Doubt

Ask: **Would a user feel disappointed clicking on this?**

If yes, it needs more content or interactivity.

---

For implementation help, see the SITE_TEMPLATE files in the project root.
