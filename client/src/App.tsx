import React, { useEffect, useState, useRef } from 'react';
import { OverlayRoot } from './components/OverlayRoot';
import { AgentCursor, AgentMode } from './components/AgentCursor';
import { HighlightBox } from './components/HighlightBox';
import { DevTools } from './components/DevTools';
import { OverlayState } from './types/global';

function App() {
  const [overlayState, setOverlayState] = useState<OverlayState | null>(null);
  
  // Agent State
  const [mode, setMode] = useState<AgentMode>('idle');
  const [cursorPos, setCursorPos] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const [cursorVisible, setCursorVisible] = useState(true);
  const [highlightVisible, setHighlightVisible] = useState(false);

  // Animation Refs
  const moveInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Initial sync
    window.overlayAPI.getOverlayState().then(setOverlayState);

    // Listen for updates
    const removeStateListener = window.overlayAPI.onStateUpdate(setOverlayState);
    
    // Listen for Hotkey Activation (Ctrl+Alt+Space) -> TOGGLE
    const removeToggleListener = window.overlayAPI.onAgentToggleListening(() => {
      setMode(prevMode => {
        if (prevMode === 'idle' || prevMode === 'processing' || prevMode === 'acting') {
          console.log("Starting Listening...");
          return 'listening';
        } else {
          console.log("Stopping Listening...");
          return 'idle'; 
        }
      });
    });

    return () => {
      removeStateListener();
      removeToggleListener();
      if (moveInterval.current) clearInterval(moveInterval.current);
    };
  }, []);

  // --- MANUAL TOGGLE ---
  // No longer auto-sequenced. Controlled by user hotkey.
  
  const startRandomMovement = () => {
    if (moveInterval.current) clearInterval(moveInterval.current);
    
    let time = 0;
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    moveInterval.current = setInterval(() => {
      time += 0.05;
      // Spiral / Orbit movement
      const radius = 150 + Math.sin(time) * 50;
      setCursorPos({
        x: centerX + Math.cos(time * 2) * radius,
        y: centerY + Math.sin(time * 2) * radius
      });
    }, 16); // 60fps
  };

  const stopMovement = () => {
    if (moveInterval.current) clearInterval(moveInterval.current);
    moveInterval.current = null;
  };

  // -- DevTools Handlers --
  const handleHide = () => window.overlayAPI.hideOverlay();
  const handleToggleHighlight = () => setHighlightVisible(p => !p);
  const handleToggleCursorVis = () => setCursorVisible(p => !p);
  const handleToggleClickThrough = () => {
    const current = overlayState?.clickThroughEnabled ?? false;
    window.overlayAPI.toggleClickThrough(!current);
  };

  return (
    <OverlayRoot visible={overlayState?.visible ?? true}>
      
      {/* Persistent DevTools */}
      <DevTools 
        state={overlayState}
        onHide={handleHide}
        onToggleHighlight={handleToggleHighlight}
        onMoveCursor={() => setMode(m => m === 'idle' ? 'listening' : 'idle')} // Manual toggle for demo
        onToggleCursorVis={handleToggleCursorVis}
        onToggleClickThrough={handleToggleClickThrough}
        cursorVisible={cursorVisible}
        highlightVisible={highlightVisible}
      />

      {/* The Agent (State Machine) */}
      <AgentCursor 
        x={cursorPos.x} 
        y={cursorPos.y} 
        visible={cursorVisible} 
        mode={mode}
      />

      {highlightVisible && (
        <HighlightBox 
          x={window.innerWidth / 2 - 150} 
          y={window.innerHeight / 2 - 100} 
          width={300} 
          height={200}
          label="Target Window"
        />
      )}
      
    </OverlayRoot>
  );
}

export default App;
