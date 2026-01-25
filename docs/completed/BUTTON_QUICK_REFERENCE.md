# Button Component - Quick Reference

## Import
```tsx
import { Button } from '@/components/ui/Shared'
```

## Variants
```tsx
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="danger">Danger</Button>
<Button variant="success">Success</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>
```

## Sizes
```tsx
<Button size="xs">Extra Small</Button>
<Button size="sm">Small</Button>
<Button size="md">Medium (Default)</Button>
<Button size="lg">Large</Button>
<Button size="xl">Extra Large</Button>
```

## Colors (Site-Specific - NO Hardcoding!)

### VitalityRx Example
```tsx
<Button
  backgroundColor={site.theme.primary}
  textColor="white"
  hoverColor={darkenColor(site.theme.primary, 0.15)}
>
  Find Doctor
</Button>
```

### OddsOracle Example
```tsx
<Button
  color={site.theme.yes}
  textColor="white"
>
  Buy YES
</Button>
```

### InstaSnap Example
```tsx
<Button
  backgroundColor={INSTASNAP_THEME.primary}
  textColor="white"
>
  Follow
</Button>
```

## States

### Disabled
```tsx
<Button disabled>Can't Click</Button>
```

### Loading
```tsx
<Button loading>Saving...</Button>
```

### Full Width
```tsx
<Button width="full">Full Width</Button>
```

## Icons

### Icon Left (Default)
```tsx
<Button icon="→">Continue</Button>
```

### Icon Right
```tsx
<Button icon="🔗" iconPosition="right">Open</Button>
```

### Icon Only
```tsx
<Button icon="❤️" iconPosition="only" size="md" title="Like" />
```

## Common Patterns

### CTA Button
```tsx
<Button
  variant="primary"
  size="lg"
  width="full"
  backgroundColor={site.theme.primary}
  textColor="white"
  onClick={handleAction}
>
  Take Action
</Button>
```

### Cancel Button
```tsx
<Button
  variant="ghost"
  onClick={handleCancel}
>
  Cancel
</Button>
```

### Delete Button
```tsx
<Button
  variant="danger"
  textColor="white"
  onClick={handleDelete}
>
  Delete
</Button>
```

### Button with Loading
```tsx
<Button
  loading={isLoading}
  onClick={handleAsyncAction}
>
  {isLoading ? 'Processing' : 'Submit'}
</Button>
```

### Form Actions (Row)
```tsx
<div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
  <Button variant="ghost" onClick={handleCancel}>Cancel</Button>
  <Button variant="primary" backgroundColor={site.theme.primary} onClick={handleSave}>Save</Button>
</div>
```

## Props Summary

| Prop | Type | Default | Example |
|------|------|---------|---------|
| `children` | ReactNode | - | `"Click me"` |
| `variant` | string | `"primary"` | `"danger"` |
| `size` | string | `"md"` | `"lg"` |
| `backgroundColor` | string | - | `"#3B82F6"` |
| `color` | string | - | `"#3B82F6"` (alias) |
| `textColor` | string | - | `"white"` |
| `borderColor` | string | - | `"#3B82F6"` |
| `hoverColor` | string | - | `"#1E40AF"` |
| `activeColor` | string | - | `"#1E3A8A"` |
| `icon` | ReactNode | - | `"→"` |
| `iconPosition` | string | `"left"` | `"right"` \| `"only"` |
| `width` | string | `"auto"` | `"full"` |
| `loading` | boolean | `false` | `true` |
| `disabled` | boolean | `false` | `true` |
| `onClick` | function | - | `() => {}` |

## ⚠️ Important Rules

1. **Never hardcode colors** - Always pass site theme colors as props
2. **Use semantic variants** - `danger` for delete, `success` for save
3. **Accessibility** - Use `ariaLabel` for icon-only buttons
4. **Loading state** - Disable button while loading with `loading` prop
5. **Full width** - Use for modals and important CTAs

## File Location
`/home/user/engaige/src/components/ui/Shared/buttons/Button.tsx`

## Exports
- `Button` - The main component
- `ButtonProps` - TypeScript interface for props
