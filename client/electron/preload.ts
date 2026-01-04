import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('overlayAPI', {
  // Sync state explicitly
  getOverlayState: () => ipcRenderer.invoke('get-overlay-state'),
  
  // Listen for push updates
  onStateUpdate: (callback: (state: any) => void) => {
    const handler = (_event: any, value: any) => callback(value);
    ipcRenderer.on('overlay-state', handler);
    return () => ipcRenderer.removeListener('overlay-state', handler);
  },
  
  // Agent Activation Signal
  onAgentToggleListening: (callback: () => void) => {
    const handler = () => callback();
    ipcRenderer.on('agent-toggle-listening', handler);
    return () => ipcRenderer.removeListener('agent-toggle-listening', handler);
  },

  hideOverlay: () => ipcRenderer.send('hide-overlay'),
  toggleClickThrough: (enabled: boolean) => ipcRenderer.send('set-click-through', enabled),
  
  // Extra utils if needed later
  log: (msg: string) => console.log(msg)
});
