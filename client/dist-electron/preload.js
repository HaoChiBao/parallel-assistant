"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld('overlayAPI', {
    onState: (callback) => {
        electron_1.ipcRenderer.on('overlay-state', (_event, value) => callback(value));
    },
    onCursorDemo: (callback) => {
        electron_1.ipcRenderer.on('trigger-cursor-demo', () => callback());
    },
    hideOverlay: () => electron_1.ipcRenderer.send('hide-overlay'),
    toggleClickThrough: (enabled) => electron_1.ipcRenderer.send('set-click-through', enabled),
    moveCursorDemo: () => electron_1.ipcRenderer.send('demo-move-cursor'),
    toggleHighlight: () => electron_1.ipcRenderer.send('toggle-highlight'), // Just relaying intention if main needs to know, or loopback
    setCursorVisible: (visible) => electron_1.ipcRenderer.send('set-cursor-visible', visible)
});
//# sourceMappingURL=preload.js.map