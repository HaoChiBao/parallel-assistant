
export type AgentState = 'INACTIVE' | 'ACTIVE' | 'PAUSED';

export interface OverlayState {
  overlayVisible: boolean;
  agentState: AgentState;
  activeHotkey: string;
  emergencyHotkey: string;
  demoRunning: boolean;
  targetBox: { x: number; y: number; width: number; height: number; label?: string } | null;
  lastError: string | null;
  speed: number;
  clickThroughEnabled: boolean;
}

declare global {
  interface Window {
    overlayAPI: {
      hide: () => void;
      toggleActive: () => void;
      resume: () => void;
      toggleDemo: () => void;
      setSpeed: (val: number) => void;
      setClickThrough: (enabled: boolean) => void;
      
      // Agent
      captureObservation: () => Promise<any>;
      executeAction: (step: any) => Promise<any>;
      
      // Events
      onStateUpdate: (callback: (state: OverlayState) => void) => () => void;
      onGlobalInput: (callback: (event: any) => void) => () => void;
      log: (msg: string) => void;
    };
  }
}
