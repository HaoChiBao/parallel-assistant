import React from 'react';
import { OverlayState } from '../types/global';

interface Props {
  state: OverlayState | null;
  onHide: () => void;
  onToggleHighlight: () => void;
  onMoveCursor: () => void;
  onToggleCursorVis: () => void;
  onToggleClickThrough: () => void;
  cursorVisible: boolean;
  highlightVisible: boolean;
}

export const DevTools: React.FC<Props> = ({
  state,
  onHide,
  onToggleHighlight,
  onMoveCursor,
  onToggleCursorVis,
  onToggleClickThrough,
  cursorVisible,
  highlightVisible
}) => {
  if (!state) return null;

  return (
    <div className="devtools-overlay"
      onMouseEnter={() => window.overlayAPI.toggleClickThrough(false)}
      onMouseLeave={() => window.overlayAPI.toggleClickThrough(true)}
    >
      <div className="debug-header">DevTools</div>
      
      <div className="debug-row">
        <button onClick={onToggleHighlight}>
          Highlight {highlightVisible ? '⦿' : '○'}
        </button>
        <button onClick={onToggleCursorVis}>
          Cursor {cursorVisible ? '⦿' : '○'}
        </button>
      </div>

      <div className="debug-row">
        <button onClick={onMoveCursor}>
           ▶️ Demo
        </button>
        <button onClick={onToggleClickThrough}>
          {state.clickThroughEnabled ? '🖱️ Pass' : '🖱️ Catch'}
        </button>
      </div>

      <button className="danger" onClick={onHide}>
        Stop Overlay (Esc)
      </button>

      <div className="mini-status">
        {state.activeHotkey} | {state.visible ? 'Vis' : 'Hid'}
      </div>
    </div>
  );
};
