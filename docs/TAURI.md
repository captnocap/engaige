# Tauri Integration

LoveAI acts as a desktop application using Tauri, which wraps the React frontend in a system-native web view.

## Overview

Tauri provides the "shell" for the application, allowing it to:
1.  Run as a standalone executable (no browser window frame).
2.  Access the native file system (for reading/writing local configs and databases).
3.  Control system windows (creation, resizing, specialized window styles).

## Configuration (`src-tauri/tauri.conf.json`)

Key settings in the configuration file:

*   **Identifier**: `com.loveai.app`
*   **Windows**:
    *   `main`: The primary window that loads the React app.
    *   `decorations`: `true` (Utilizes native OS window controls, though the internal React app implements its own "desktop" metaphors).
*   **Permissions**: Defines what native APIs the frontend can access (e.g., `fs`, `shell`).

## Development

To run the application in Tauri mode:

```bash
bun tauri dev
```

This command:
1.  Starts the Vite dev server for the frontend.
2.  Compiles the Rust backend (if changed).
3.  Launches the application window pointing to the local dev server.

## Building

To build the final installable executable:

```bash
bun tauri build
```
This generates the platform-specific installer (e.g., `.deb` for Linux, `.dmg` for macOS, `.exe` for Windows) in `src-tauri/target/release/bundle`.
