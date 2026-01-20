# Frontend Documentation

The frontend of LoveAI is a React application powered by Vite, providing the desktop environment interface.

## Directory Structure (`src/`)

```
src/
├── components/         # React components
│   └── desktop/        # Desktop simulation components
├── stores/             # Global state management (Zustand)
├── App.tsx             # Main application entry point
├── main.tsx            # React DOM mounting
└── index.css           # Global styles (Tailwind CSS)
```

## Desktop Simulation

The core of the frontend is the simulation of a desktop operating system.

### `Desktop.tsx`
This component acts as the main container and window manager.
*   **Window Management**: Tracks open windows, their z-index (stacking order), and minimized/maximized states.
*   **Wallpaper**: Renders the background wallpaper which reacts to game state (e.g., changes if the player is "winning" or "losing").

### `Window.tsx`
A reusable component wrapper that provides standard window functionality:
*   **Draggable**: Users can move windows around the "desktop".
*   **Resizable**: Windows can be resized.
*   **Controls**: Standard minimize, maximize, and close buttons that interact with the `Desktop` state.

### `Taskbar.tsx`
Simulates a system taskbar.
*   **Start Menu**: Access to system functions.
*   **App Icons**: Shows currently open windows and allows minimizing/restoring them.

## State Management

We use **Zustand** for global state management.

*   `stores/displayStore.ts`: Manages display settings, screen resolution simulation, and other visual preferences.

## Styling

Styling is handled via **Tailwind CSS v4**.
*   Utility-first approach for component styling.
*   Theme integration for consistent colors across the specialized desktop UI.

## Integration

The frontend runs typically on `http://localhost:1420` during development and talks to the backend mock API.
