# Base Window Architecture

A clean, reusable desktop windowing system built with React + Tauri.

## Features

- **Window Management**: Draggable, resizable windows with minimize/maximize/close
- **Taskbar**: Windows taskbar with start menu, window list, system tray, clock
- **Desktop Icons**: Double-clickable icons with selection states
- **Phone Panel**: Optional floating phone widget (toggle with P key)
- **Multi-Monitor**: Support for display configuration via Tauri APIs
- **Persistence**: Window positions and display settings saved to localStorage
- **Tailwind Styling**: Clean dark theme with consistent design

## Architecture

```
src/
├── components/
│   └── desktop/
│       ├── Desktop.tsx      # Main desktop container & window manager
│       ├── Window.tsx       # Reusable window component (drag, resize, maximize)
│       ├── Taskbar.tsx      # Windows-style taskbar
│       └── DesktopIcon.tsx  # Desktop icon component
└── stores/
    └── displayStore.ts      # Display/monitor settings with persistence
```

## Usage

1. Install dependencies:
   ```bash
   bun install
   ```

2. Run development:
   ```bash
   bun run dev
   ```

3. Build:
   ```bash
   bun run build
   ```

## Customization

### Adding Windows

Add to the `windows` array in `Desktop.tsx`:

```tsx
{
  id: 'myapp',
  title: 'My App',
  icon: '📦',
  component: <MyAppComponent />,
  defaultState: { x: 100, y: 50, width: 600, height: 400 },
}
```

### Adding Desktop Icons

Add to the `desktopIcons` array:

```tsx
{
  id: 'myapp',
  icon: '📦',
  label: 'My App',
  opensWindow: 'myapp',  // Opens a window by ID
  // or
  action: () => console.log('clicked')
}
```

## Tech Stack

- React 19 + TypeScript
- Vite + Tailwind CSS 4
- Tauri 2.x (for window management APIs)
- Zustand (state management)