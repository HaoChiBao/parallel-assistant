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

export const FloatingPanel: React.FC<Props> = ({
  state,
  onHide,
  onToggleHighlight,
  onMoveCursor,
  onToggleCursorVis,
  onToggleClickThrough,
  cursorVisible,
  highlightVisible
}) => {
  if (!state) return <div className="floating-panel">Loading...</div>;

  return (
    <div className="floating-panel"
      onMouseEnter={() => {
        // When mouse is OVER the panel, we want to CATCH clicks.
        // So we disable "click-through" (ignoreMouse=false)
        window.overlayAPI.toggleClickThrough(false);
      }}
      onMouseLeave={() => {
        // When mouse LEAVES the panel, we want to PASS clicks.
        // So we enable "click-through" (ignoreMouse=true)
        window.overlayAPI.toggleClickThrough(true);
      }}
    >
      <div className="title">Desktop Assistant Overlay (MVP)</div>
      
      <div className="status-row">
        <span>STATUS: {state.visible ? 'VISIBLE' : 'HIDDEN'}</span>
        <span>{state.clickThroughEnabled ? 'CLICKS PASSED' : 'CLICKS CAUGHT'}</span>
      </div>

      <div className="hotkey-info">
        Toggle: <span className="badge">{state.activeHotkey}</span> | 
        Emergency: <span className="badge">{state.emergencyHotkey}</span>
      </div>

      <div className="btn-group">
        <button className="danger" onClick={onHide}>
          <span>STOP (Hide Overlay)</span>
          <span>🛑</span>
        </button>

        <button onClick={onToggleHighlight}>
          <span>Toggle Highlight</span>
          <span className="badge">{highlightVisible ? 'ON' : 'OFF'}</span>
        </button>

        <button onClick={onMoveCursor}>
          <span>Demo Move Cursor</span>
          <span>▶️</span>
        </button>

        <button onClick={onToggleCursorVis}>
          <span>Toggle Cursor Visibility</span>
          <span className="badge">{cursorVisible ? 'ON' : 'OFF'}</span>
        </button>

        <button onClick={onToggleClickThrough}>
          <span>Click-through: {state.clickThroughEnabled ? 'ON' : 'OFF'}</span>
          <span>🖱️</span>
        </button>
      </div>

      {state.lastError && (
        <div className="error-box">
          <strong>Error:</strong> {state.lastError}
        </div>
      )}
    </div>
  );
};
