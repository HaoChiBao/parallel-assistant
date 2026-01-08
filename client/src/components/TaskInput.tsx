import React, { useState, useEffect, useRef } from 'react';

interface TaskInputProps {
  onStart: (task: string) => void;
  state: string;
}

export function TaskInput({ onStart, state }: TaskInputProps) {
  const [val, setVal] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
      // Auto focus when inactive and shown
      if (state === 'INACTIVE') {
          inputRef.current?.focus();
      }
  }, [state]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && val.trim()) {
          onStart(val);
          setVal("");
      }
  };

  if (state !== 'INACTIVE') return null;

  return (
    <div className="fixed top-28 left-1/2 transform -translate-x-1/2 w-[600px] pointer-events-auto">
      <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl p-4 flex gap-2 items-center">
        <div className="text-blue-400 font-bold">AI</div>
        <input 
            ref={inputRef}
            className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-500 font-sans text-lg"
            placeholder="Type a task (e.g., 'Open Chrome and find react docs')..."
            value={val}
            onChange={e => setVal(e.target.value)}
            onKeyDown={handleKeyDown}
        />
        <div className="text-xs text-gray-500">Press Enter</div>
      </div>
    </div>
  );
}
