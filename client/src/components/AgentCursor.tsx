import React, { useEffect, useState, useRef } from 'react';
import { VoiceVisualizer } from './VoiceVisualizer';

// Shared type for Agent Modes
export type AgentMode = 'idle' | 'listening' | 'processing' | 'acting';

interface Props {
  x: number;
  y: number;
  visible: boolean;
  mode: AgentMode;
  actionState?: 'clicking' | 'dragging' | 'holding' | 'scrolling' | null;
}

export const AgentCursor: React.FC<Props> = ({ x, y, visible, mode, actionState }) => {
  const [transcript, setTranscript] = useState("Listening...");
  const recognitionRef = useRef<any>(null);

  // Speech Recognition Effect
  useEffect(() => {
    if (mode === 'listening') {
      startListening();
    } else {
      stopListening();
    }
  }, [mode]);

  const startListening = () => {
    // Reset
    setTranscript("Listening...");

    if (!('webkitSpeechRecognition' in window)) {
      console.warn("Speech Recognition not supported in this environment.");
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          const text = event.results[i][0].transcript;
          console.log("TRANSCRIPT:", text); // Log to console as requested
          setTranscript(text);
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      if (interim) {
        // Optional: show interim text?
        // setTranscript(interim);
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech Error:", event.error);
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
    } catch (e) {
      console.error(e);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
  };

  // Intelligent Click-Through
  const handleMouseEnter = () => window.overlayAPI.toggleClickThrough(false); // Enable Clicking
  const handleMouseLeave = () => window.overlayAPI.toggleClickThrough(true);  // Enable Pass-Through

  if (!visible) return null;

  return (
    <div 
      className={`agent-hub mode-${mode} ${actionState ? `action-${actionState}` : ''}`}
      style={{ left: x, top: y }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Listening State: PILL UI (Compact, No Text) */}
      {mode === 'listening' && (
        <div className="pill-content">
          <VoiceVisualizer />
        </div>
      )}

      {/* Processing State: SPINNER */}
      {mode === 'processing' && (
        <div className="loading-spinner"></div>
      )}
      
      {/* Acting State: VISUAL POINTER (handled by CSS shape) */}
    </div>
  );
};
