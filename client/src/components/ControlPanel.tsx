import React, { useEffect, useState } from 'react';
import { OverlayState } from '../types/global';

interface Props {
  state: OverlayState;
  onToggleActive: () => void;
  onResume: () => void;
  onRunDemo: () => void;
  onHide: () => void;
  onSpeedChange: (val: number) => void;
}

export const ControlPanel: React.FC<Props> = ({ 
  state, onToggleActive, onResume, onRunDemo, onHide, onSpeedChange 
}) => {
  
  const getStatusColor = () => {
    if (state.agentState === 'ACTIVE') return 'green';
    if (state.agentState === 'PAUSED') return 'orange';
    return 'gray';
  };

  return (
    <div className="control-panel">
      <div className="panel-header">Desktop Assistant Overlay (Cursor Control MVP)</div>
      
      {/* STATUS BLOCK */}
      <div className="status-block" style={{ borderColor: getStatusColor() }}>
        <div className="status-label">AGENT STATUS:</div>
        <div className="status-value" style={{ color: getStatusColor() }}>
          {state.agentState} 
          {state.agentState === 'ACTIVE' && <span className="sub-status"> - WASD Controlling Mouse</span>}
          {state.agentState === 'PAUSED' && <span className="sub-status"> - User Input Detected</span>}
        </div>
      </div>

      {/* INFO */}
      <div className="info-row">
        <span>Toggle: {state.activeHotkey}</span>
        <span className="danger-text">Stop: {state.emergencyHotkey}</span>
      </div>

      {/* CONTROLS */}
      <div className="controls-grid">
        <button onClick={onToggleActive} className={state.agentState === 'ACTIVE' ? 'active-btn' : ''}>
           {state.agentState === 'ACTIVE' ? 'Deactivate Agent' : 'Activate Agent'}
        </button>
        
        {state.agentState === 'PAUSED' && (
           <button onClick={onResume} className="resume-btn">RESUME</button>
        )}

        <button onClick={onRunDemo} disabled={state.agentState !== 'ACTIVE'}>
           {state.demoRunning ? 'Stop Demo' : 'Run Figure-8 Demo'}
        </button>

        <button onClick={onHide}>Hide Overlay</button>
      </div>
      
      {/* SPEED */}
      <div className="speed-row">
         <label>Speed: {state.speed}</label>
         <button onClick={() => onSpeedChange(Math.max(1, state.speed - 5))}>-</button>
         <button onClick={() => onSpeedChange(state.speed + 5)}>+</button>
      </div>

      {/* ERROR */}
      {state.lastError && (
        <div className="error-box">
           LAST ERROR: {state.lastError}
        </div>
      )}
    </div>
  );
};
