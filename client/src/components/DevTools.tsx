import React from 'react';
import { OverlayState } from '../types/global';

interface Props {
  state: OverlayState | null;
  onHide: () => void;
  onToggleHighlight: () => void;
  onMoveCursor: () => void;
  // Gestures
  onGestureCircle: () => void;
  onGestureShake: () => void;
  onGesturePoke: () => void;

  // Manual & Actions
  onManualMove: (dx: number, dy: number) => void;
  onActionClick: () => void;
  onActionHold: () => void;
  onActionDrag: () => void;
  onActionScroll: () => void;

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
  onGestureCircle,
  onGestureShake,
  onGesturePoke,
  onManualMove,
  onActionClick,
  onActionHold,
  onActionDrag,
  onActionScroll,
  onToggleCursorVis,
  onToggleClickThrough,
  cursorVisible,
  highlightVisible
}) => {
  if (!state) return null;

  return (
    <div className="devtools-overlay"
      onMouseEnter={() => window.overlayAPI.setClickThrough(false)}
      onMouseLeave={() => window.overlayAPI.setClickThrough(true)}
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

      <div className="debug-row">
        <button onClick={onGestureCircle}>Circle Focus</button>
        <button onClick={onGesturePoke}>Poke</button>
        <button onClick={onGestureShake}>Shake No</button>
      </div>

      {/* Manual D-Pad */}
      <div className="dpad-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px', margin: '8px 0' }}>
         <div /> 
         <button onClick={() => onManualMove(0,-20)}>▲</button> 
         <div />
         <button onClick={() => onManualMove(-20,0)}>◀</button>
         <div style={{ textAlign: 'center', fontSize: '10px', alignSelf: 'center' }}>MOVE</div>
         <button onClick={() => onManualMove(20,0)}>▶</button>
         <div />
         <button onClick={() => onManualMove(0,20)}>▼</button>
         <div />
      </div>

      {/* Actions */}
      <div className="debug-row">
        <button onClick={onActionClick}>Click</button>
        <button onClick={onActionHold}>Hold</button>
        <button onClick={onActionDrag}>Drag</button>
        <button onClick={onActionScroll}>Scroll</button>
      </div>

      <button className="danger" onClick={onHide}>
        Stop Overlay (Esc)
      </button>

      <div className="mini-status">
        {state.activeHotkey} | {state.overlayVisible ? 'Vis' : 'Hid'}
      </div>
    </div>
  );
};
