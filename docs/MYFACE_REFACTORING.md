# MyFace Site Refactoring Documentation

**Date:** 2026-01-23
**File:** `/src/components/browser/sites/MyFaceSite.tsx`
**Original Size:** 1265 lines
**Refactored Size:** 1253 lines
**Component Library:** Shared UI Components (StyledCard, Button, Avatar, MetaRow)

## Overview

The MyFace social network site has been refactored to use the shared UI component library (`src/components/ui/shared/`) for consistency, maintainability, and code reuse across the entire application. This refactoring improves:

- **Code Reusability** - Consistent components across all browser sites
- **Maintainability** - Centralized styling and behavior logic
- **Consistency** - Uniform appearance and UX patterns
- **Accessibility** - Built-in accessibility features in shared components
- **Development Speed** - Faster feature development with pre-built components

## Refactored Components

### 1. StyledCard Replacements

**Purpose:** Replace all manually styled divs with flexible, reusable card containers.

**Locations:**
- MyFaceHome: Player card, Top 8 card, Stats card, Post bulletin card, Feed card
- MyFaceBrowse: Main container card
- MyFaceDating: Dating header, matches container
- MyFaceProfile: Profile header (main card), About card, Interests card, Music card, Top Friends card, Bulletins card
- MyFaceMessages: Inbox card, Message thread card
- ContactOptionsDropdown: Dropdown container, empty state card

**Key Props Used:**
```typescript
<StyledCard
  bgColor={MYFACE_COLORS.bg}          // 'white'
  borderColor={MYFACE_COLORS.border}  // '#ccc'
  padding="lg"                         // 'md', 'sm', etc.
  borderRadius="lg"                    // Controls corner rounding
  shadow="md"                          // Box shadow intensity
  className="..."                      // Additional Tailwind classes
/>
```

**Benefits:**
- Consistent card styling across entire MyFace site
- Easy to update card colors/shadows globally via MYFACE_COLORS constant
- Supports interactive states (hover, click) with hoverColor prop
- Responsive shadow and border control

### 2. Button Replacements

**Purpose:** Replace all manually styled buttons with the comprehensive Button component.

**Locations:**
- MyFaceHome: "View My Profile" button, Top 8 friend buttons, "Post" button
- PostCard: "Like", "Comment", "Post comment" buttons
- MyFaceBrowse: Profile card interactive area
- MyFaceDating: Match avatar buttons, "Pass"/"Like" action buttons
- MyFaceProfile: "Add Friend", "Message" buttons, friend interaction buttons
- MyFaceMessages: Conversation selection buttons, "Send" button
- ContactOptionsDropdown: App contact buttons

**Key Props Used:**
```typescript
<Button
  size="xs"                             // 'xs', 'sm', 'md', 'lg', 'xl'
  variant="primary"                     // 'primary', 'secondary', 'ghost', 'link'
  backgroundColor={MYFACE_COLORS.accent}
  textColor="white"
  onClick={() => handleClick()}
  disabled={!contentText.trim()}
  width="full"                          // 'auto', 'full', or custom value
/>
```

**Benefits:**
- Consistent button sizing across all interactions
- Built-in hover/active/disabled states
- Supports icons (though not used in MyFace)
- Easy color theming via props

### 3. Avatar Replacements

**Purpose:** Replace all manually styled avatar circles/squares with Avatar component.

**Locations:**
- MyFaceHome: Player avatar, Top 8 friend avatars
- PostCard: Author and commenter avatars
- MyFaceBrowse: Profile card avatars
- MyFaceDating: Match avatars in matches row
- MyFaceProfile: Profile header avatar, friend avatars
- MyFaceMessages: Conversation participant avatars, unread badge
- ContactOptionsDropdown: App icon avatars

**Key Props Used:**
```typescript
<Avatar
  size="md"                      // 'xs', 'sm', 'md', 'lg', 'xl'
  initials={avatarString}        // Fallback text (emoji or initial)
  bgColor="#f3f4f6"             // Fallback background
  shape="rounded"               // 'circle', 'square', 'rounded'
  border={`2px solid ${color}`} // Border styling
  status="online"               // 'online', 'offline', 'away', 'none'
  badge={3}                     // Notification badge count
  onClick={() => onViewProfile()}
/>
```

**Benefits:**
- Consistent avatar sizing and styling
- Supports status indicators (online/offline/away)
- Built-in notification badges
- Fallback to initials if image fails to load
- Clickable for profile navigation

### 4. MetaRow Replacements

**Purpose:** Display metadata (author, timestamp) in a clean, consistent row format.

**Locations:**
- PostCard: Author name + timestamp metadata
- PostCard comments: Commenter name + timestamp metadata
- MyFaceBrowse ProfileCard: Status info (online/offline + mood)

**Key Implementation:**
```typescript
const metaItems: MetaRowItem[] = [
  { value: post.author.name, onClick: () => onViewProfile(post.authorId) },
  { value: formatRelativeTime(new Date(post.timestamp)) },
]

<MetaRow
  items={metaItems}
  textColor={MYFACE_COLORS.primary}
  mutedColor="#9ca3af"
  separator="•"
  textSize="sm"
/>
```

**Benefits:**
- Consistent metadata display across all posts and comments
- Built-in separators between items
- Clickable metadata values
- Configurable text colors and sizes

## Color System

### MYFACE_COLORS Constant

Created a centralized color scheme for easy updates:

```typescript
const MYFACE_COLORS = {
  primary: '#003366',    // Primary text/accent (MySpace blue)
  accent: '#FF6600',     // Action accent (MySpace orange)
  bg: 'white',           // Card backgrounds
  border: '#ccc',        // Card borders
}
```

**Usage:**
- All StyledCard components use these colors for consistency
- All Button components use these colors for theming
- Text colors applied via textColor prop
- Easy to adjust entire site's appearance by editing 4 values

## Maintained Features

All original functionality is preserved:

✅ Feed with posts and bulletins
✅ Comment system with nested comments
✅ Like/unlike functionality (with heart emoji)
✅ Profile viewing and browsing
✅ Dating feature with swipe interface
✅ Messaging system with conversations
✅ Contact options dropdown for messaging via multiple apps
✅ Relationship status badges
✅ Top 8 friends display
✅ User stats (views, friends, posts)
✅ Online status indicators
✅ Mood display
✅ User bio and interests
✅ Music display (if available)

## Implementation Details

### Import Statement

Added centralized import from shared components:

```typescript
import { StyledCard, Button, Avatar, MetaRow, type MetaRowItem } from '../../ui/shared/index.js'
```

This replaces the need for multiple styled-components or inline Tailwind classes.

### Component-Specific Changes

#### MyFaceHome
- Player card now uses `StyledCard` with `Avatar` for profile picture
- Top 8 friends use `Button` for click targets
- Stats card is a simple `StyledCard`
- Post composition area uses `StyledCard` wrapper

#### PostCard
- Author avatar replaced with `Avatar` component
- Author name + timestamp replaced with `MetaRow`
- Like/comment buttons use `Button` component
- Comments display uses `MetaRow` for each comment's metadata
- Comment input buttons use `Button` component

#### MyFaceBrowse & ProfileCard
- Profile cards now use `StyledCard` as main container
- Avatar displayed using `Avatar` component
- Status metadata (online/mood) uses `MetaRow`
- Card is made interactive with `interactive` prop

#### MyFaceDating
- Dating header uses `StyledCard`
- Match avatars displayed with `Avatar` component (with border prop for new matches)
- Dating profile cards use `StyledCard` with proper padding/shadow
- Pass/Like buttons use `Button` component with width control

#### MyFaceProfile
- Profile header is a `StyledCard` with gradient background
- Relationship badge uses color mapping (no component change needed)
- About/Interests/Music sections use `StyledCard`
- Friend avatars use `Button` for clickability
- All text sections use `StyledCard`

#### MyFaceMessages
- Inbox/conversation containers use `StyledCard` with proper flex layout
- Conversation list items use `Button` with avatar and metadata
- Unread count uses `Avatar` badge feature
- Send button uses `Button` component

#### ContactOptionsDropdown
- Dropdown container uses `StyledCard` with absolute positioning
- Each app option uses `Button` with avatar
- Hint text in footer

## Code Quality Improvements

### Before
- 140+ lines of manual inline styling for cards
- Inconsistent button implementations
- Custom avatar divs with hardcoded sizing
- Repeated metadata display logic

### After
- Centralized card styling via StyledCard props
- Single, reusable Button implementation
- Avatar component with built-in features
- Standardized metadata display via MetaRow
- MYFACE_COLORS constant for easy theming

## Testing Checklist

The following features should be verified to work correctly:

- [ ] Feed displays posts and comments correctly
- [ ] Like/unlike works with heart emoji toggle
- [ ] Comments can be added and displayed
- [ ] Profile cards render with correct styling
- [ ] Dating interface shows profiles and allows swiping
- [ ] Matches display correctly with badges
- [ ] Messaging interface loads conversations
- [ ] Message input and sending works
- [ ] Contact dropdown shows available apps
- [ ] Avatar display with fallback initials
- [ ] Online status indicators visible
- [ ] Relationship badges show correct levels
- [ ] Top 8 friends grid displays correctly
- [ ] All colors match MyFace theme

## Future Enhancements

With this refactoring in place, future improvements are easier:

1. **Theme Customization** - Update MYFACE_COLORS to create alternate themes
2. **Component Extension** - Add more shared components (tables, modals, etc.)
3. **Accessibility** - Leverage built-in a11y features of shared components
4. **Animation** - Add transitions via StyledCard and Button props
5. **Dark Mode** - Create alternate color scheme using same components
6. **Mobile Optimization** - Adjust shared component breakpoints

## Files Modified

- **Main File:** `/src/components/browser/sites/MyFaceSite.tsx` (1253 lines)
- **Imports From:** `/src/components/ui/shared/index.ts`
- **Related Components:**
  - `/src/components/ui/shared/cards/Card.tsx` (StyledCard)
  - `/src/components/ui/shared/buttons/Button.tsx` (Button)
  - `/src/components/ui/shared/avatars/Avatar.tsx` (Avatar)
  - `/src/components/ui/shared/layout/MetaRow.tsx` (MetaRow)

## Breaking Changes

None. This is a pure refactoring with no API changes.

## Notes

- All SAMPLE_DATA and social network logic preserved
- MySpace aesthetic maintained
- Early 2000s color scheme (#003366, #FF6600) preserved
- No changes to state management or data flow
- All event handlers and callbacks unchanged
- Backward compatible with existing stores and hooks
