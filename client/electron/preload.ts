import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('overlayAPI', {
  onState: (callback: (state: any) => void) => {
    ipcRenderer.on('overlay-state', (_event, value) => callback(value));
  },
  onCursorDemo: (callback: () => void) => {
    ipcRenderer.on('trigger-cursor-demo', () => callback());
  },
  hideOverlay: () => ipcRenderer.send('hide-overlay'),
  toggleClickThrough: (enabled: boolean) => ipcRenderer.send('set-click-through', enabled),
  moveCursorDemo: () => ipcRenderer.send('demo-move-cursor'),
  toggleHighlight: () => ipcRenderer.send('toggle-highlight'), // Just relaying intention if main needs to know, or loopback
  setCursorVisible: (visible: boolean) => ipcRenderer.send('set-cursor-visible', visible)
});
