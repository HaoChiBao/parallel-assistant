# Electron Overlay MVP

## Setup
1. `cd client`
2. `npm install`
3. `npm run dev`

## Usage
- **Show Overlay**: `Control+Alt` (Fallback: `Control+Alt+Space`)
- **Hide Overlay**: `Control+Alt`
- **Emergency Stop**: `Control+Alt+Esc`

## Development
- Renderer runs on Vite (port 5173).
- Main process runs via Electron.
- Wait-on ensures Electron waits for Vite.

## Architecture
- **Main**: Controls window visibility, inputs, and hotkeys.
- **Preload**: Exposes `overlayAPI` via `contextBridge`.
- **Renderer**: React UI with Zustand-like state (simple React state for MVP).
