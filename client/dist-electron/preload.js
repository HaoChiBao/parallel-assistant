"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld('overlayAPI', {
    hide: () => electron_1.ipcRenderer.send('request-hide'),
    toggleActive: () => electron_1.ipcRenderer.send('request-toggle-active'),
    resume: () => electron_1.ipcRenderer.send('request-resume'),
    toggleDemo: () => electron_1.ipcRenderer.send('request-demo'),
    setSpeed: (val) => electron_1.ipcRenderer.send('set-speed', val),
    setClickThrough: (enabled) => electron_1.ipcRenderer.send('set-click-through', enabled),
    // Agent API
    captureObservation: () => electron_1.ipcRenderer.invoke('agent-capture-observation'),
    executeAction: (step) => electron_1.ipcRenderer.invoke('agent-execute-action', step),
    // Events
    onStateUpdate: (callback) => electron_1.ipcRenderer.on('state-update', (_event, value) => callback(value)),
    onGlobalInput: (callback) => electron_1.ipcRenderer.on('input-event', (_event, value) => callback(value))
});
//# sourceMappingURL=preload.js.map