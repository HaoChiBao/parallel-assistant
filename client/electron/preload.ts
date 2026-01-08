import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('overlayAPI', {
  hide: () => ipcRenderer.send('request-hide'),
  toggleActive: () => ipcRenderer.send('request-toggle-active'),
  resume: () => ipcRenderer.send('request-resume'),
  toggleDemo: () => ipcRenderer.send('request-demo'),
  setSpeed: (val: number) => ipcRenderer.send('set-speed', val),
  setClickThrough: (enabled: boolean) => ipcRenderer.send('set-click-through', enabled),
  
  // Agent API
  captureObservation: () => ipcRenderer.invoke('agent-capture-observation'),
  executeAction: (step: any) => ipcRenderer.invoke('agent-execute-action', step),
  
  // Events
  onStateUpdate: (callback: (state: any) => void) => {
      const handler = (_event: any, value: any) => callback(value);
      ipcRenderer.on('state-update', handler);
      return () => ipcRenderer.removeListener('state-update', handler);
  },
  onGlobalInput: (callback: (event: any) => void) => {
      const handler = (_event: any, value: any) => callback(value);
      ipcRenderer.on('input-event', handler);
      return () => ipcRenderer.removeListener('input-event', handler);
  }
});
