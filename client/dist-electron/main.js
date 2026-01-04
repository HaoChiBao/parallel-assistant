"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
let win = null;
// State of Source Truth
let state = {
    visible: true, // DEV: Default to true
    activeHotkey: 'Control+Alt', // To be confirmed
    emergencyHotkey: 'Control+Alt+Escape',
    clickThroughEnabled: false,
    lastError: null,
};
function broadcastState() {
    if (win && !win.isDestroyed()) {
        win.webContents.send('overlay-state', state);
    }
}
function createOverlay() {
    if (win)
        return;
    const display = electron_1.screen.getPrimaryDisplay();
    const { width, height } = display.workAreaSize;
    win = new electron_1.BrowserWindow({
        width,
        height,
        x: 0,
        y: 0,
        frame: false,
        transparent: true,
        alwaysOnTop: true,
        skipTaskbar: true,
        resizable: false,
        movable: false,
        minimizable: false, // Prevent minimization
        type: 'toolbar', // Helps with staying on top/not being treated as normal window
        hasShadow: false,
        show: true, // DEV: Show immediately
        webPreferences: {
            preload: path_1.default.join(__dirname, 'preload.js'),
            sandbox: true,
            contextIsolation: true,
            nodeIntegration: false,
        },
    });
    // Try strongest always on top
    win.setAlwaysOnTop(true, 'screen-saver');
    win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
    // Default: Ignore mouse events (click-through) but forward them so we can detect hover
    win.setIgnoreMouseEvents(true, { forward: true });
    const devUrl = 'http://localhost:5173';
    // In a real prod build, this would be a file path. For MVP dev, localhost.
    // We'll rely on our 'dev' script waiting for localhost.
    win.loadURL(devUrl).catch((err) => {
        state.lastError = `Failed to load URL: ${err.message}`;
        broadcastState();
    });
    win.on('closed', () => {
        win = null;
    });
}
// VISIBILITY LOGIC
function setVisibility(show) {
    if (!win || win.isDestroyed()) {
        createOverlay();
        if (!win)
            return; // Should not happen
    }
    if (show) {
        win.show();
        // Default to click-through (ignore mouse), but forward events for hover detection
        win.setIgnoreMouseEvents(true, { forward: true });
        win.setAlwaysOnTop(true, 'screen-saver'); // Re-assert
        win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true }); // Re-assert
        // win.focus(); // Do NOT focus by default if we are in pass-through mode
        // Double-check verification
        setTimeout(() => {
            if (win && !win.isDestroyed() && !win.isVisible()) {
                win.show();
                state.lastError = "Warning: Had to force-show overlay.";
                broadcastState();
            }
        }, 100);
        state.visible = true;
    }
    else {
        // When hiding, we also reset click-through so user isn't stuck next time
        // ACTUALLY: User might want it persistent? MVP safer to reset if they lock themselves out.
        // Given the prompt requirements, let's just Hide.
        win.hide();
        // Create verification
        setTimeout(() => {
            if (win && !win.isDestroyed() && win.isVisible()) {
                win.hide(); // Force
            }
        }, 100);
        state.visible = false;
    }
    broadcastState();
}
function toggleOverlay() {
    setVisibility(!state.visible);
}
function emergencyHide() {
    if (state.visible) {
        setVisibility(false);
        state.lastError = "Emergency Hide Triggered";
        broadcastState();
        console.log("Emergency Hide Triggered");
    }
}
electron_1.app.whenReady().then(() => {
    createOverlay();
    // Force visibility for dev
    setVisibility(true);
    // 1. Attempt Primary Hotkey
    const primary = 'Control+Alt+Space'; // Fixed: Ctrl+Alt is a modifier, not a trigger.
    const success = electron_1.globalShortcut.register(primary, toggleOverlay);
    if (success) {
        state.activeHotkey = primary;
        console.log(`Registered ${primary}`);
    }
    else {
        // 2. Fallback
        const fallback = 'Control+Alt+S';
        console.log(`Failed to register ${primary}, trying ${fallback}`);
        const fbSuccess = electron_1.globalShortcut.register(fallback, toggleOverlay);
        if (fbSuccess) {
            state.activeHotkey = fallback;
            state.lastError = `Primary hotkey (${primary}) failed. Using ${fallback}`;
        }
        else {
            state.activeHotkey = 'NONE';
            state.lastError = 'CRITICAL: Could not register ANY toggle hotkey.';
        }
    }
    // Emergency Hotkey
    electron_1.globalShortcut.register(state.emergencyHotkey, emergencyHide);
    // Initial Broadcast (wait a sec for renderer to load)
    setTimeout(broadcastState, 2000);
});
electron_1.app.on('window-all-closed', () => {
    // Don't quit, keep running in tray/background logic equivalent
    if (process.platform !== 'darwin')
        electron_1.app.quit();
});
// IPC HANDLERS
electron_1.ipcMain.on('hide-overlay', () => {
    setVisibility(false);
});
electron_1.ipcMain.on('set-click-through', (_event, enabled) => {
    state.clickThroughEnabled = enabled;
    if (win && !win.isDestroyed()) {
        // If click-through is enabled, we ignore mouse events.
        // forward: true allows events to pass to apps behind.
        // But wait, if we ignore, we can't click "Stop".
        // This is the danger zone. 
        // We will strictly follow the command.
        win.setIgnoreMouseEvents(enabled, { forward: true });
        if (enabled) {
            // Optional: Maybe focus the window behind?
            win.blur();
        }
        else {
            win.focus();
        }
    }
    broadcastState();
});
electron_1.ipcMain.on('set-cursor-visible', (_event, visible) => {
    // Just for state, renderer handles the actual cursor div
    // We can broadcast this if we tracked it in state, but renderer state is fine for simple visual.
    // If we wanted to hide OS cursor: win.webContents.send('cursor-visibility', visible)
});
electron_1.ipcMain.on('demo-move-cursor', () => {
    if (win) {
        win.webContents.send('trigger-cursor-demo');
    }
});
//# sourceMappingURL=main.js.map