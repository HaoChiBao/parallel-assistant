"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld('overlayAPI', {
    // Sync state explicitly
    getOverlayState: () => electron_1.ipcRenderer.invoke('get-overlay-state'),
    // Listen for push updates
    onStateUpdate: (callback) => {
        const handler = (_event, value) => callback(value);
        electron_1.ipcRenderer.on('overlay-state', handler);
        return () => electron_1.ipcRenderer.removeListener('overlay-state', handler);
    },
    // Agent Activation Signal
    onAgentToggleListening: (callback) => {
        const handler = () => callback();
        electron_1.ipcRenderer.on('agent-toggle-listening', handler);
        return () => electron_1.ipcRenderer.removeListener('agent-toggle-listening', handler);
    },
    hideOverlay: () => electron_1.ipcRenderer.send('hide-overlay'),
    toggleClickThrough: (enabled) => electron_1.ipcRenderer.send('set-click-through', enabled),
    // Extra utils if needed later
    log: (msg) => console.log(msg)
});
//# sourceMappingURL=preload.js.map