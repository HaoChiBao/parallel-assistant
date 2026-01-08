import React, { useEffect, useState } from 'react';
import { OverlayRoot } from './components/OverlayRoot';
import { ControlPanel } from './components/ControlPanel';
import { HighlightBox } from './components/HighlightBox';
import { OverlayState } from './types/global';
import './styles.css';

// New Imports
import { useAgentSocket } from './hooks/useAgentSocket';
import { TaskInput } from './components/TaskInput';
import { Timeline } from './components/Timeline';
import { ConfirmModal } from './components/ConfirmModal';
import { Step } from '@shared/agent/step';

function App() {
  const [state, setState] = useState<OverlayState>({
    overlayVisible: true,
    agentState: 'INACTIVE',
    activeHotkey: '...',
    emergencyHotkey: '...',
    demoRunning: false,
    lastError: null,
    targetBox: null,
    speed: 10,
    clickThroughEnabled: true
  });

  const { isConnected, sendMessage, messages, sessionState } = useAgentSocket('ws://localhost:3000/ws');
  const [pendingConfirmStep, setPendingConfirmStep] = useState<Step | null>(null);

  useEffect(() => {
    const removeListener = window.overlayAPI.onStateUpdate(setState);
    
    // Also listen for confirm requirements from messages
    // (This is a simplified way, ideally useAgentSocket exposes this)
    const lastMsg = messages[messages.length - 1];
    if (lastMsg && lastMsg.kind === 'step.proposed' && lastMsg.step.requires_confirmation) {
        setPendingConfirmStep(lastMsg.step as Step);
    }
    
    return () => removeListener();
  }, [messages, sessionState]);

  // Sync Electron State with Server State (User Override)
  useEffect(() => {
     if (state.agentState === 'PAUSED' && sessionState === 'ACTIVE') {
         sendMessage({ kind: 'session.pause' });
     }
  }, [state.agentState, sessionState, sendMessage]);

  const handleStartTask = (task: string) => {
      window.overlayAPI.toggleActive(); // Set local ACTIVE
      sendMessage({ kind: 'session.start', task });
  };

  const handleConfirm = (approved: boolean) => {
      if (pendingConfirmStep) {
          sendMessage({ kind: 'confirm.step', step_id: pendingConfirmStep.step_id, approved });
          setPendingConfirmStep(null);
      }
  };

  if (!state.overlayVisible) return null;

  return (
    <OverlayRoot visible={state.overlayVisible}>
      <ControlPanel 
        state={state} 
        onToggleActive={() => {
            window.overlayAPI.toggleActive();
            if (state.agentState === 'ACTIVE') sendMessage({ kind: 'session.stop' });
        }}
        onResume={() => {
            window.overlayAPI.resume();
            sendMessage({ kind: 'session.resume' });
        }}
        onRunDemo={() => window.overlayAPI.toggleDemo()}
        onHide={() => window.overlayAPI.hide()}
        onSpeedChange={(val) => window.overlayAPI.setSpeed(val)}
      />

      {/* Connection Status */}
      <div className="fixed bottom-2 right-2 text-xs font-mono opacity-50 text-white pointer-events-none">
          WS: {isConnected ? 'Connected' : 'Offline'} | Agent: {sessionState}
      </div>
      
      {state.agentState === 'ACTIVE' && (
        <div className="active-gradient-overlay" />
      )}

      {state.agentState === 'ACTIVE' && (
        <div className="active-badge">AGENT ACTIVE — WASD controls cursor</div>
      )}
      
      {state.agentState === 'PAUSED' && (
        <div className="paused-badge">PAUSED — move/keys detected</div>
      )}

      {/* New Agent Components */}
      <TaskInput 
        state={state.agentState} 
        onStart={handleStartTask} 
      />
      
      <Timeline messages={messages} state={state.agentState} />
      
      {pendingConfirmStep && (
          <ConfirmModal step={pendingConfirmStep} onConfirm={handleConfirm} />
      )}

      {state.targetBox && (
        <HighlightBox 
          x={state.targetBox.x}
          y={state.targetBox.y}
          width={state.targetBox.width}
          height={state.targetBox.height}
          label={state.targetBox.label}
        />
      )}
    </OverlayRoot>
  );
}

export default App;

