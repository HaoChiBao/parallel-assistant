
import { useEffect, useRef, useState, useCallback } from 'react';
import { ServerMessage, ClientMessage, SessionState } from '@shared/agent/messages';

export function useAgentSocket(url: string) {
  const ws = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<ServerMessage[]>([]);
  const [sessionState, setSessionState] = useState<SessionState>("INACTIVE");

  useEffect(() => {
    connect();
    return () => {
        if (ws.current) {
            ws.current.onclose = null; // Prevent automatic reconnect
            ws.current.close();
        }
    };
  }, [url]);

  const connect = () => {
    ws.current = new WebSocket(url);
    ws.current.onopen = () => setIsConnected(true);
    ws.current.onclose = () => {
        setIsConnected(false); 
        setTimeout(connect, 3000); // Reconnect
    };
    ws.current.onmessage = (event) => {
        try {
            const msg = JSON.parse(event.data);
            handleMessage(msg);
        } catch(e) { console.error("Parse error", e)}
    };
  };

  const handleMessage = (msg: ServerMessage) => {
      setMessages(prev => [...prev, msg]);
      if (msg.kind === 'session.state') {
          setSessionState(msg.state);
      }
      if (msg.kind === 'action.execute') {
          handleExecute(msg.step);
      }
  };

  const sendMessage = useCallback((msg: ClientMessage) => {
      if (ws.current?.readyState === WebSocket.OPEN) {
          ws.current.send(JSON.stringify(msg));
      }
  }, []);

  const handleExecute = async (step: any) => {
      try {
          // Send executing status?
          const result = await window.overlayAPI.executeAction(step);
          sendMessage({ kind: 'action.result', data: result });
      } catch (e: any) {
          sendMessage({ kind: 'action.result', data: { step_id: step.step_id, ok: false, error: e.message } });
      }
  };

  return { isConnected, sendMessage, messages, sessionState };
}
