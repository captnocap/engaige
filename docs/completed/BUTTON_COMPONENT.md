# StyledButton Component Documentation

## Overview

The `StyledButton` component (`src/components/ui/Shared/buttons/Button.tsx`) is a highly customizable button component designed for the engAIge multi-site browser. It supports all visual states, loading indicators, icons, and most importantly: **NO hardcoded colors**.

Each site (VitalityRx, OddsOracle, InstaSnap, etc.) has its own color palette. The Button component accepts color values as props, enabling consistent styling across different site themes.

## Key Features

- **7 Variants**: `primary`, `secondary`, `danger`, `success`, `outline`, `ghost`, `link`
- **5 Sizes**: `xs`, `sm`, `md`, `lg`, `xl`
- **Full Color Control**: Background, text, border, hover, and active colors via props
- **Icon Support**: Left, right, or icon-only positioning
- **Loading State**: Built-in spinner animation
- **Disabled State**: Visual feedback for disabled buttons
- **Accessibility**: Focus rings, ARIA labels, keyboard support
- **Interactive Feedback**: Smooth hover/active state transitions

## Basic Usage

### Simple Button (Using Defaults)

```tsx
import { Button } from '@/components/ui/Shared'

<Button variant="primary" size="md">
  Click Me
</Button>
```

### Custom Colors (Site-Specific)

```tsx
import { Button } from '@/components/ui/Shared'
import { FILLER_SITES } from '@/config/filler-sites'

const site = FILLER_SITES.pharmacy

// VitalityRx style button
<Button
  variant="primary"
  size="md"
  backgroundColor={site.theme.primary}
  textColor="white"
>
  Find a Doctor
</Button>

// OddsOracle style button (using color prop as alias)
<Button
  variant="primary"
  color={site.theme.yes}  // YES button
  textColor="white"
  size="lg"
>
  Buy YES {market.yesPrice}¢
</Button>

// InstaSnap style button with gradient-like effect
<Button
  variant="primary"
  backgroundColor={INSTASNAP_THEME.primary}
  textColor="white"
  size="md"
>
  Follow
</Button>
```

## Props Reference

### Content Props

| Prop       | Type                      | Default   | Description                    |
| ---------- | ------------------------- | --------- | ------------------------------ |
| `children` | `ReactNode`               | required  | Button text or content         |
| `type`     | `'button' \| 'submit' \| 'reset'` | `'button'` | HTML button type              |
| `onClick`  | `() => void`              | undefined | Click handler                  |
| `disabled` | `boolean`                 | `false`   | Disable button interaction    |
| `loading`  | `boolean`                 | `false`   | Show loading spinner          |

### Appearance Props

| Prop      | Type                                              | Default   | Description                        |
| --------- | ------------------------------------------------- | --------- | ---------------------------------- |
| `variant` | `'primary' \| 'secondary' \| 'danger' \| 'success' \| 'outline' \| 'ghost' \| 'link'` | `'primary'` | Button style preset           |
| `size`    | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'`           | `'md'`    | Button size                   |

### Color Props (NO Hardcoding!)

| Prop              | Type           | Default   | Description                                    |
| ----------------- | -------------- | --------- | ---------------------------------------------- |
| `backgroundColor` | `string`       | undefined | Background color (hex, rgb, or CSS color name) |
| `color`           | `string`       | undefined | Alias for `backgroundColor`                    |
| `textColor`       | `string`       | undefined | Text/foreground color                          |
| `borderColor`     | `string`       | undefined | Border color (outline variant)                 |
| `hoverColor`      | `string`       | undefined | Background on hover (overrides auto-darkening) |
| `activeColor`     | `string`       | undefined | Background when pressed (overrides auto)       |
| `hoverBgOpacity`  | `number`       | undefined | Opacity (0-1) for hover background             |

### Icon Props

| Prop             | Type                        | Default  | Description                         |
| ---------------- | --------------------------- | -------- | ----------------------------------- |
| `icon`           | `ReactNode`                 | undefined | Icon element (emoji, SVG, etc.)    |
| `iconPosition`   | `'left' \| 'right' \| 'only'` | `'left'` | Where to place the icon            |

### Width Props

| Prop    | Type                     | Default | Description                            |
| ------- | ------------------------ | ------- | -------------------------------------- |
| `width` | `'full' \| 'auto' \| string` | `'auto'` | Button width (`'full'`, custom CSS)  |

### Override Props

| Prop        | Type              | Default   | Description                           |
| ----------- | ----------------- | --------- | ------------------------------------- |
| `className` | `string`          | `''`      | Additional Tailwind classes          |
| `style`     | `CSSProperties`   | `{}`      | Inline style overrides               |
| `title`     | `string`          | undefined | Tooltip text                         |
| `ariaLabel` | `string`          | undefined | Accessibility label                  |

## Variant Details

### `primary`
Default colors: Blue (#3B82F6) on white. Override for site-specific colors.

```tsx
<Button variant="primary" backgroundColor={site.theme.primary}>
  Primary Action
</Button>
```

### `secondary`
Default colors: Gray (#6B7280) on white. For less important actions.

```tsx
<Button variant="secondary">
  Secondary Action
</Button>
```

### `danger`
Default colors: Red (#EF4444) on white. For destructive actions.

```tsx
<Button variant="danger" onClick={() => deleteItem()}>
  Delete
</Button>
```

### `success`
Default colors: Green (#10B981) on white. For confirmations.

```tsx
<Button variant="success">
  Confirm
</Button>
```

### `outline`
Transparent background with colored border. Good for secondary actions.

```tsx
<Button variant="outline" borderColor={site.theme.primary}>
  Cancel
</Button>
```

### `ghost`
Minimal style: transparent background, colored text. For less prominent actions.

```tsx
<Button variant="ghost" textColor={site.theme.primary}>
  Learn More
</Button>
```

### `link`
Text-only style, looks like a hyperlink. For navigation.

```tsx
<Button variant="link" textColor={site.theme.primary}>
  ← Back
</Button>
```

## Size Details

All sizes have proportional padding, font size, and minimum height:

| Size | Padding           | Font Size | Min Height | Use Case                    |
| ---- | ----------------- | --------- | ---------- | --------------------------- |
| `xs` | `0.25rem 0.75rem` | `0.75rem` | `1.5rem`   | Small inline buttons, tags  |
| `sm` | `0.375rem 0.875rem` | `0.875rem` | `2rem`   | Small forms, toolbars       |
| `md` | `0.5rem 1rem`     | `1rem`    | `2.5rem`   | Default, most common        |
| `lg` | `0.75rem 1.5rem`  | `1.125rem` | `3rem`    | Prominent actions, modals   |
| `xl` | `1rem 2rem`       | `1.25rem` | `3.5rem`   | Hero sections, CTAs         |

## Icon Examples

### Icon Left (Default)
```tsx
<Button icon="→" iconPosition="left" size="md">
  Learn more
</Button>
```

### Icon Right
```tsx
<Button icon="🔗" iconPosition="right" size="md">
  Visit Site
</Button>
```

### Icon Only
```tsx
<Button icon="❤️" iconPosition="only" size="md" title="Like this" />
```

### Loading Icon
```tsx
<Button loading size="md">
  Saving...
</Button>
```

## Real-World Examples

### Example 1: VitalityRx "Find a Doctor" Button

```tsx
import { Button } from '@/components/ui/Shared'
import { FILLER_SITES } from '@/config/filler-sites'

const site = FILLER_SITES.pharmacy

export function VitalityRxCTA() {
  return (
    <div style={{ background: site.theme.primary, padding: '2rem' }}>
      <h2 style={{ color: 'white' }}>Ready to Start?</h2>
      <Button
        variant="primary"
        backgroundColor="white"  // Override to white on colored background
        textColor={site.theme.primary}  // Use site primary as text
        size="lg"
        onClick={() => console.log('Find doctor')}
      >
        Find a Provider Near You
      </Button>
    </div>
  )
}
```

### Example 2: OddsOracle "Bet" Buttons

```tsx
import { Button } from '@/components/ui/Shared'
import { FILLER_SITES } from '@/config/filler-sites'

const site = FILLER_SITES.betting

export function BetButtons({ market }) {
  return (
    <div style={{ display: 'flex', gap: '1rem' }}>
      {/* YES Button */}
      <Button
        variant="primary"
        color={site.theme.yes}  // Green for YES
        textColor="white"
        size="lg"
        width="full"
        onClick={() => placeBet('yes')}
      >
        Buy YES {market.yesPrice}¢
      </Button>

      {/* NO Button */}
      <Button
        variant="primary"
        color={site.theme.no}   // Red for NO
        textColor="white"
        size="lg"
        width="full"
        onClick={() => placeBet('no')}
      >
        Buy NO {100 - market.yesPrice}¢
      </Button>
    </div>
  )
}
```

### Example 3: InstaSnap Follow Button with Loading

```tsx
import { Button } from '@/components/ui/Shared'
import { INSTASNAP_THEME } from './InstaSnapSite'

export function FollowButton({ isFollowing, onFollow }) {
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    setLoading(true)
    await onFollow()
    setLoading(false)
  }

  return (
    <Button
      variant={isFollowing ? 'outline' : 'primary'}
      backgroundColor={isFollowing ? 'transparent' : INSTASNAP_THEME.primary}
      textColor={isFollowing ? INSTASNAP_THEME.primary : 'white'}
      borderColor={INSTASNAP_THEME.primary}
      size="sm"
      loading={loading}
      onClick={handleClick}
      width="full"
    >
      {isFollowing ? 'Following' : 'Follow'}
    </Button>
  )
}
```

### Example 4: Multi-Button State

```tsx
import { Button } from '@/components/ui/Shared'

export function FormActions({ isLoading, isDirty, onSave, onCancel }) {
  return (
    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
      {/* Cancel Button */}
      <Button
        variant="ghost"
        onClick={onCancel}
        disabled={isLoading}
      >
        Cancel
      </Button>

      {/* Save Button */}
      <Button
        variant="primary"
        backgroundColor="#10B981"
        textColor="white"
        onClick={onSave}
        disabled={!isDirty || isLoading}
        loading={isLoading}
      >
        {isLoading ? 'Saving' : 'Save Changes'}
      </Button>
    </div>
  )
}
```

## Color Customization Strategy

### No Hardcoding Rule

Colors should NEVER be hardcoded in the button implementation. Instead:

1. **Pass site theme colors as props**
2. **Use CSS variables for theming**
3. **Allow parent components to control appearance**

```tsx
// ❌ BAD - Hardcoded color
<Button style={{ backgroundColor: '#6B4C9A' }}>Don't do this</Button>

// ✅ GOOD - Prop-driven
<Button backgroundColor={site.theme.primary}>Do this</Button>

// ✅ ALSO GOOD - CSS variable
<Button backgroundColor="var(--color-primary)">Or this</Button>
```

### Auto Color Handling

The Button component automatically handles hover/active states:

- **Default hover**: Darkens background by 10%
- **Override hover**: Pass `hoverColor` prop
- **Custom opacity**: Use `hoverBgOpacity` prop

```tsx
// Auto-darken on hover
<Button backgroundColor="#3B82F6">Auto Hover</Button>

// Custom hover color
<Button backgroundColor="#3B82F6" hoverColor="#1E40AF">
  Custom Hover
</Button>

// Transparent overlay on hover
<Button backgroundColor="#3B82F6" hoverBgOpacity={0.8}>
  Opacity Hover
</Button>
```

## Accessibility

The Button component includes built-in accessibility features:

- **Focus ring**: Visible when keyboard-focused
- **Disabled state**: Visual feedback for disabled buttons
- **ARIA labels**: Optional `ariaLabel` prop for screen readers
- **Keyboard support**: Full keyboard navigation support
- **Color contrast**: Defaults meet WCAG AA standards

```tsx
<Button
  ariaLabel="Save document"
  title="Click to save your changes"
  onClick={handleSave}
>
  Save
</Button>
```

## Migration Guide

### From Inline Styled Buttons

Before:
```tsx
<button
  onClick={() => setSelectedMed(med)}
  className="px-6 py-3 rounded-full font-medium"
  style={{ background: site.theme.primary, color: 'white' }}
>
  Learn more
</button>
```

After:
```tsx
<Button
  variant="primary"
  size="lg"
  backgroundColor={site.theme.primary}
  textColor="white"
  onClick={() => setSelectedMed(med)}
>
  Learn more
</Button>
```

### From Different Button Variants Across Sites

Before (duplicated across 21 sites):
```tsx
// In VitalityRxSite
<button style={{ background: site.theme.primary, ... }}>Find Doctor</button>

// In OddsOracleSite
<button style={{ background: site.theme.yes, ... }}>Buy YES</button>

// In InstaSnapSite
<button style={{ background: INSTASNAP_THEME.primary, ... }}>Follow</button>
```

After (consistent across all sites):
```tsx
import { Button } from '@/components/ui/Shared'

// VitalityRx
<Button color={site.theme.primary} textColor="white">Find Doctor</Button>

// OddsOracle
<Button color={site.theme.yes} textColor="white">Buy YES</Button>

// InstaSnap
<Button color={INSTASNAP_THEME.primary} textColor="white">Follow</Button>
```

## Testing

The Button component supports all standard React testing patterns:

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '@/components/ui/Shared'

describe('Button', () => {
  it('renders with custom colors', () => {
    render(
      <Button backgroundColor="#FF0000" textColor="white">
        Red Button
      </Button>
    )
    expect(screen.getByRole('button')).toHaveStyle({
      backgroundColor: '#FF0000',
      color: 'white',
    })
  })

  it('handles click events', async () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click</Button>)

    await userEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalled()
  })

  it('shows loading state', () => {
    render(<Button loading>Loading</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
```

## Best Practices

1. **Always use site theme colors** - Get colors from `site.theme` or theme constants
2. **Use semantic variants** - `danger` for destructive, `success` for confirmations
3. **Pick appropriate sizes** - Use `lg` for CTAs, `sm` for inline actions
4. **Add icons for clarity** - Visual indicators improve UX
5. **Use loading state** - Provide feedback during async operations
6. **Test hover/active states** - Verify interactive feedback works
7. **Follow accessibility** - Use `ariaLabel` for icon-only buttons
8. **Document site-specific usage** - Add comments when colors are site-specific

## Limitations & Future Enhancements

### Current Limitations
- No support for button groups (use flex container)
- No built-in dropdown variants (use separate menu component)
- No shadow customization (can be added via `style` prop)

### Potential Enhancements
- Button group component for related actions
- Icon button variants with text overlay
- Dropdown button with menu integration
- Split button for multiple actions
- Badge support for notifications
- Custom loading indicators (spinners, dots, etc.)

## File Structure

```
src/components/ui/Shared/
├── buttons/
│   ├── Button.tsx          # Main component (this file)
│   └── index.ts            # Barrel export
├── index.ts                # Exports Button
├── Avatar.tsx
├── LikeButton.tsx
└── ... other components
```

## Import Paths

```tsx
// Preferred - from Shared index
import { Button } from '@/components/ui/Shared'

// Also works - direct import
import { Button } from '@/components/ui/Shared/buttons'

// Component and types
import { Button, type ButtonProps } from '@/components/ui/Shared'
```

---

**Last Updated**: January 2026
**Version**: 1.0
**Status**: Production Ready
