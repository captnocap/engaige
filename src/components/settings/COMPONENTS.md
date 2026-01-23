# Settings UI Components

Reusable, theme-aware UI components extracted from `SettingsWindow.tsx`. All components use CSS variables for styling, making them fully compatible with the theme system.

## Components Overview

### SettingsCard
A card wrapper for grouping related settings. Provides consistent styling with borders, padding, and a title/description header.

**Props:**
- `title: string` - Card title (required)
- `description?: string` - Optional subtitle/description
- `children: ReactNode` - Content to display inside the card

**Usage:**
```tsx
import { SettingsCard } from '../components'

<SettingsCard title="Display" description="Adjust display settings">
  <div>Your settings content here</div>
</SettingsCard>
```

**CSS Variables Used:**
- `--color-bgSecondary` - Card background
- `--color-border` - Card border color
- `--color-text` - Title text color
- `--color-textMuted` - Description text color

---

### RangeControl
A numeric range slider with value display, reset button, and optional marks/labels. Perfect for any 0-100 or numeric range adjustment (brightness, volume, font size, etc).

**Props:**
- `value: number` - Current value (required)
- `min: number` - Minimum value (required)
- `max: number` - Maximum value (required)
- `step?: number` - Step increment (default: 1)
- `defaultValue: number` - Value used when reset is clicked (required)
- `unit?: string` - Unit string to display after value (e.g., '%', 'em')
- `onChange: (value: number) => void` - Value change callback (required)
- `marks?: Record<number | string, string>` - Optional labels for values

**Usage:**
```tsx
import { RangeControl } from '../components'

<RangeControl
  value={brightness}
  min={50}
  max={150}
  step={1}
  defaultValue={100}
  unit="%"
  onChange={(v) => setBrightness(v)}
  marks={{ 50: 'Darker', 100: 'Default', 150: 'Brighter' }}
/>
```

**CSS Variables Used:**
- `--color-text` - Value text color
- `--color-primary` - Reset button color
- `--color-textMuted` - Marks label color

---

### VolumeControl
A specialized volume slider with mute toggle button. Wraps RangeControl in a SettingsCard for complete volume management UI.

**Props:**
- `label: string` - Control label (required)
- `description: string` - Description text (required)
- `volume: number` - Volume level 0-100 (required)
- `muted: boolean` - Mute state (required)
- `onVolumeChange: (volume: number) => void` - Volume change callback (required)
- `onMuteToggle: () => void` - Mute toggle callback (required)
- `disabled?: boolean` - Disable the control (default: false)

**Usage:**
```tsx
import { VolumeControl } from '../components'

<VolumeControl
  label="Master Volume"
  description="Overall audio level"
  volume={volume}
  muted={muted}
  onVolumeChange={(v) => setVolume(v)}
  onMuteToggle={() => setMuted(!muted)}
/>
```

**Behavior:**
- Slider is disabled when `muted` is true
- Slider is disabled when `disabled` prop is true
- Mute button shows 🔊 when unmuted, 🔇 when muted
- Displays "Muted" or percentage when muted
- Optional master mute can disable child volume controls

**CSS Variables Used:**
- `--color-bgSecondary` - Card background
- `--color-border` - Card border
- `--color-text` - Labels and value text
- `--color-textMuted` - Muted state indicator
- `--color-bgTertiary` - Mute button background
- `--color-error` - Muted state highlight color

---

### SidebarNav
A generic vertical navigation sidebar with icon and label support. Active item is highlighted with color and border.

**Props:**
- `items: SidebarNavItem<T>[]` - Array of navigation items (required)
- `activeItem: T` - ID of currently active item (required)
- `onItemClick: (id: T) => void` - Item click callback (required)

**SidebarNavItem Structure:**
```typescript
interface SidebarNavItem<T extends string = string> {
  id: T                    // Unique identifier
  label: string           // Display label
  icon: string            // Emoji or icon character
}
```

**Usage:**
```tsx
import { SidebarNav } from '../components'

const navItems = [
  { id: 'display', label: 'Display', icon: '🖥️' },
  { id: 'audio', label: 'Audio', icon: '🔊' },
  { id: 'theme', label: 'Theme', icon: '🎨' },
]

<SidebarNav
  items={navItems}
  activeItem={activeTab}
  onItemClick={setActiveTab}
/>
```

**Styling:**
- Active item: colored left border (3px) and background tint
- Inactive items: transparent background
- Smooth transition on state change
- Scrollable if content exceeds container

**CSS Variables Used:**
- `--color-bgSecondary` - Sidebar background
- `--color-border` - Sidebar border and nav item border
- `--color-primary` - Active item highlight color
- `--color-text` - Inactive item text
- `--color-primary` (with opacity) - Active item text

---

## Theme Integration

All components use CSS variables for styling. They automatically adapt to theme changes:

```css
/* Colors that must be defined in root or theme provider */
--color-bg              /* Primary background */
--color-bgSecondary     /* Secondary background (cards) */
--color-bgTertiary      /* Tertiary background (buttons) */
--color-border          /* Border color */
--color-text            /* Primary text */
--color-textMuted       /* Secondary text */
--color-primary         /* Brand/accent color */
--color-success         /* Success state */
--color-error           /* Error state */
--color-warning         /* Warning state */
--color-info            /* Info state */
```

---

## App-Wide Usage Examples

### Example 1: Game Settings Panel
```tsx
import { SettingsCard, RangeControl, SidebarNav } from '@/components/settings/components'

function GameSettings() {
  const [difficulty, setDifficulty] = useState(50)
  const [activeTab, setActiveTab] = useState('gameplay')

  const tabs = [
    { id: 'gameplay', label: 'Gameplay', icon: '🎮' },
    { id: 'graphics', label: 'Graphics', icon: '✨' },
  ]

  return (
    <div className="flex">
      <SidebarNav items={tabs} activeItem={activeTab} onItemClick={setActiveTab} />
      <div>
        {activeTab === 'gameplay' && (
          <SettingsCard title="Difficulty" description="Adjust game difficulty">
            <RangeControl
              value={difficulty}
              min={1}
              max={100}
              defaultValue={50}
              onChange={setDifficulty}
              marks={{ 1: 'Easy', 50: 'Normal', 100: 'Hard' }}
            />
          </SettingsCard>
        )}
      </div>
    </div>
  )
}
```

### Example 2: Audio Settings
```tsx
import { VolumeControl } from '@/components/settings/components'

function AudioSettings() {
  const [music, setMusic] = useState(70)
  const [musicMuted, setMusicMuted] = useState(false)

  return (
    <VolumeControl
      label="Music Volume"
      description="Background music level"
      volume={music}
      muted={musicMuted}
      onVolumeChange={setMusic}
      onMuteToggle={() => setMusicMuted(!musicMuted)}
    />
  )
}
```

### Example 3: Video Settings Panel
```tsx
import { SettingsCard, RangeControl } from '@/components/settings/components'

function VideoSettings() {
  const [brightness, setBrightness] = useState(100)
  const [contrast, setContrast] = useState(100)
  const [saturation, setSaturation] = useState(100)

  return (
    <div className="space-y-6">
      <SettingsCard title="Brightness" description="Adjust screen brightness">
        <RangeControl
          value={brightness}
          min={50}
          max={150}
          defaultValue={100}
          unit="%"
          onChange={setBrightness}
          marks={{ 50: 'Darker', 100: 'Default', 150: 'Brighter' }}
        />
      </SettingsCard>

      <SettingsCard title="Contrast" description="Adjust color contrast">
        <RangeControl
          value={contrast}
          min={50}
          max={150}
          defaultValue={100}
          unit="%"
          onChange={setContrast}
        />
      </SettingsCard>

      <SettingsCard title="Saturation" description="Adjust color vibrancy">
        <RangeControl
          value={saturation}
          min={0}
          max={200}
          defaultValue={100}
          unit="%"
          onChange={setSaturation}
          marks={{ 0: 'Gray', 100: 'Normal', 200: 'Vibrant' }}
        />
      </SettingsCard>
    </div>
  )
}
```

---

## Design Patterns

### Nested Controls
```tsx
<SettingsCard title="Volume Controls">
  <div className="space-y-4">
    <VolumeControl ... />
    <VolumeControl ... />
  </div>
</SettingsCard>
```

### Grouped Navigation
```tsx
const tabs = [
  { id: 'display', label: 'Display', icon: '🖥️' },
  { id: 'audio', label: 'Audio', icon: '🔊' },
  // ... etc
]

<div className="flex">
  <SidebarNav items={tabs} activeItem={active} onItemClick={setActive} />
  <div>{renderContent()}</div>
</div>
```

### Range with Marks
```tsx
<RangeControl
  value={value}
  min={0}
  max={10}
  step={0.5}
  defaultValue={5}
  onChange={setValue}
  marks={{ 0: 'Off', 5: 'Medium', 10: 'Max' }}
/>
```

---

## Accessibility

All components follow these accessibility principles:

- **RangeControl**: Native HTML range input (keyboard accessible with arrow keys)
- **VolumeControl**: Mute button has proper disabled state; slider inherits from RangeControl
- **SidebarNav**: Full keyboard navigation with Tab/Enter support
- **SettingsCard**: Semantic heading hierarchy

---

## Performance Notes

- All components are lightweight and render efficiently
- No unnecessary re-renders with proper prop memoization
- CSS variables approach avoids inline style recalculations
- Works well in lists (e.g., many VolumeControls in AudioSettings)

---

## Extending Components

To create specialized controls, compose these components:

```tsx
// Custom brightness control with preset buttons
function BrightnessControl({ brightness, onChange }) {
  return (
    <SettingsCard title="Brightness" description="Screen brightness">
      <div className="space-y-4">
        <RangeControl
          value={brightness}
          min={50}
          max={150}
          defaultValue={100}
          unit="%"
          onChange={onChange}
          marks={{ 50: 'Low', 100: 'Normal', 150: 'High' }}
        />
        <div className="flex gap-2">
          <button onClick={() => onChange(70)}>Dim</button>
          <button onClick={() => onChange(100)}>Normal</button>
          <button onClick={() => onChange(130)}>Bright</button>
        </div>
      </div>
    </SettingsCard>
  )
}
```

---

## File Structure

```
src/components/
├── settings/
│   ├── components/
│   │   ├── index.ts              # Barrel export
│   │   ├── SettingsCard.tsx      # Card wrapper
│   │   ├── RangeControl.tsx      # Range slider
│   │   ├── VolumeControl.tsx     # Volume slider with mute
│   │   ├── SidebarNav.tsx        # Vertical navigation
│   │   └── COMPONENTS.md         # This file
│   └── SettingsWindow.tsx        # Main settings window (uses these components)
```

---

## Migration from SettingsWindow

If updating SettingsWindow to use these extracted components:

```tsx
// Before (inline components)
function VolumeControl({ label, ... }) { ... }

// After (imported components)
import { VolumeControl } from './components'

// Then use directly:
<VolumeControl label="Master Volume" ... />
```

This keeps SettingsWindow focused on layout and state management while these components handle individual UI concerns.
