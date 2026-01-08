import React from 'react';
import { Step } from '@shared/agent/step';

interface ConfirmModalProps {
  step: Step;
  onConfirm: (approved: boolean) => void;
}

export function ConfirmModal({ step, onConfirm }: ConfirmModalProps) {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 pointer-events-auto">
      <div className="bg-gray-800 border-2 border-yellow-600 rounded-lg p-6 max-w-lg w-full shadow-2xl">
         <h2 className="text-xl font-bold text-yellow-400 mb-4">⚠️ Verification Required</h2>
         <p className="text-gray-300 mb-2">The agent wants to perform the following action:</p>
         
         <div className="bg-black/50 p-4 rounded mb-6 font-mono text-sm">
             <div className="text-blue-300">Goal: {step.goal}</div>
             <div className="text-green-400 mt-2">&gt; Action: {step.action.type}</div>
             {step.action.text && <div className="text-gray-400">"{step.action.text}"</div>}
         </div>

         <div className="flex gap-4 justify-end">
             <button 
                onClick={() => onConfirm(false)}
                className="px-4 py-2 rounded bg-red-900/50 hover:bg-red-900 text-red-200 border border-red-700 transition"
             >
                 Deny / Stop
             </button>
             <button 
                onClick={() => onConfirm(true)}
                className="px-4 py-2 rounded bg-green-700 hover:bg-green-600 text-white font-bold transition shadow-lg"
             >
                 Approve & Execute
             </button>
         </div>
      </div>
    </div>
  );
}
