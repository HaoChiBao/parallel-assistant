export interface OverlayState {
  visible: boolean;
  activeHotkey: string;
  emergencyHotkey: string;
  clickThroughEnabled: boolean;
  lastError: string | null;
}

declare global {
  interface Window {
    overlayAPI: {
      getOverlayState: () => Promise<OverlayState>;
      onStateUpdate: (callback: (state: OverlayState) => void) => () => void;
      onAgentToggleListening: (callback: () => void) => () => void;
      hideOverlay: () => void;
      toggleClickThrough: (enabled: boolean) => void;
    };
  }
}
