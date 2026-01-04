import React, { useEffect, useState } from 'react';
import { OverlayRoot } from './components/OverlayRoot';
import { FloatingPanel } from './components/FloatingPanel';
import { AgentCursor } from './components/AgentCursor';
import { HighlightBox } from './components/HighlightBox';
import { OverlayState } from './types/global';

const App: React.FC = () => {
  const [overlayState, setOverlayState] = useState<OverlayState | null>(null);
  const [highlightVisible, setHighlightVisible] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);
  const [cursorPos, setCursorPos] = useState({ x: 300, y: 300 });

  useEffect(() => {
    // Subscribe to Main Process State
    window.overlayAPI.onState((s) => {
      console.log('State update:', s);
      setOverlayState(s);
    });

    // Subscribe to Demo Trigger
    window.overlayAPI.onCursorDemo(() => {
      runCursorDemo();
    });

    // Keyboard controls for cursor
    const handleKeyDown = (e: KeyboardEvent) => {
      console.log('Keystroke:', e.key);
      if (e.ctrlKey && e.altKey) {
        console.log('Control + Alt pressed together');
      }

      if (!overlayState?.visible) return;
      
      const step = 10;
      setCursorPos(prev => {
        let { x, y } = prev;
        if (e.key === 'ArrowUp') y -= step;
        if (e.key === 'ArrowDown') y += step;
        if (e.key === 'ArrowLeft') x -= step;
        if (e.key === 'ArrowRight') x += step;
        return { x, y };
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [overlayState?.visible]);

  const runCursorDemo = () => {
    const points = [
      { x: 100, y: 100 },
      { x: window.innerWidth / 2, y: window.innerHeight / 2 },
      { x: window.innerWidth - 100, y: window.innerHeight - 100 }
    ];

    let i = 0;
    const interval = setInterval(() => {
      if (i >= points.length) {
        clearInterval(interval);
        return;
      }
      setCursorPos(points[i]);
      i++;
    }, 800);
  };

  const handleToggleClickThrough = () => {
    const newState = !overlayState?.clickThroughEnabled;
    window.overlayAPI.toggleClickThrough(newState);
  };

  return (
    <OverlayRoot visible={overlayState?.visible ?? true}>
        <FloatingPanel 
          state={overlayState}
          onHide={() => window.overlayAPI.hideOverlay()}
          onToggleHighlight={() => setHighlightVisible(v => !v)}
          onMoveCursor={() => window.overlayAPI.moveCursorDemo()}
          onToggleCursorVis={() => setCursorVisible(v => !v)}
          onToggleClickThrough={handleToggleClickThrough}
          cursorVisible={cursorVisible}
          highlightVisible={highlightVisible}
        />

        {cursorVisible && (
          <AgentCursor x={cursorPos.x} y={cursorPos.y} />
        )}

        {highlightVisible && (
          <HighlightBox />
        )}
    </OverlayRoot>
  );
};

export default App;
