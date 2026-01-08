import React, { useEffect, useRef } from 'react';
import { ServerMessage } from '@shared/agent/messages';

interface TimelineProps {
  messages: ServerMessage[];
  state: string;
}

export function Timeline({ messages, state }: TimelineProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // if (state === 'INACTIVE') return null; // Show timeline always if overlay is visible

  return (
    <div className="fixed top-48 right-10 w-80 max-h-[500px] overflow-y-auto bg-gray-900/90 backdrop-blur border border-gray-700 rounded-lg p-4 font-mono text-xs shadow-xl pointer-events-auto">
       <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-700">
          <span className="text-gray-400 uppercase font-bold">Trace</span>
          <span className={`px-2 py-0.5 rounded ${state === 'ACTIVE' ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'}`}>
              {state}
          </span>
       </div>
       
       <div className="flex flex-col gap-2">
          {messages.map((m, i) => (
             <MessageItem key={i} msg={m} />
          ))}
          <div ref={bottomRef} />
       </div>
    </div>
  );
}

function MessageItem({ msg }: { msg: ServerMessage }) {
    switch (msg.kind) {
        case 'thinking':
            return <div className="text-blue-300">🤔 {msg.text}</div>;
        case 'step.proposed':
            return (
                <div className="bg-gray-800 p-2 rounded border border-gray-700">
                    <div className="text-gray-400">Step: {msg.step.goal}</div>
                    <div className="text-green-400 truncate">&gt; {msg.step.action.type}</div>
                </div>
            );
        case 'action.execute':
            return <div className="text-purple-400 opacity-70">Running...</div>
        case 'verify.request':
            return <div className="text-orange-400">Verifying...</div>
        case 'error':
            return <div className="text-red-400 bg-red-900/20 p-1 rounded">Error: {msg.message}</div>
        case 'done':
            return <div className="text-green-400 font-bold border-t border-gray-700 mt-2 pt-2">DONE: {msg.summary}</div>
        default:
            return null;
    }
}
