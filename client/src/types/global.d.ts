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
      onState: (callback: (state: OverlayState) => void) => void;
      onCursorDemo: (callback: () => void) => void;
      hideOverlay: () => void;
      hideOverlay: () => void;
      toggleClickThrough: (enabled: boolean) => void;
      moveCursorDemo: () => void;
      toggleHighlight: () => void;
      setCursorVisible: (visible: boolean) => void;
    };
  }
}
