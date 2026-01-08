import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { Step } from "@shared/agent/step";
import { Observation } from "@shared/agent/messages";
import { ActionType } from "@shared/agent/actions";
import { ExpectationType } from "@shared/agent/expectations";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
} else {
  console.warn("No GEMINI_API_KEY found. Using Mock Brain.");
}

export async function decideNextStep(
  session_id: string,
  task: string,
  history: { step: Step, result?: any }[],
  lastObservation?: Observation
): Promise<Step> {
  // --- MOCK BRAIN FALLBACK ---
  if (!ai || task.includes("demo")) {
    return runMockBrain(session_id, task, history);
  }

  // --- REAL GEMINI IMPLEMENTATION (TODO: Full Prompting) ---
  // For MVP, if key exists but not demo, we try a simple prompt, but complex agent loop 
  // needs a robust system prompt likely using structured output.
  // We'll stick to mock for reliability in MVP unless specifically implemented with schemas.
  // ...
  console.log("Real Gemini implementation requested but using Mock for MVP stability/safety first.");
  return runMockBrain(session_id, task, history);
}

function runMockBrain(session_id: string, task: string, history: { step: Step }[]): Step {
  const stepCount = history.length;
  const stepId = `step_${stepCount}`;

  if (task.toLowerCase().includes("open chrome")) {
    if (stepCount === 0) return {
      session_id, step_id: stepId, goal: "Open Chrome",
      action: { type: ActionType.HOTKEY, keys: "win" }, // Simplified 'open start'
      expectation: { type: ExpectationType.NONE }, 
      next: "continue"
    };
    if (stepCount === 1) return {
      session_id, step_id: stepId, goal: "Type Chrome",
      action: { type: ActionType.TYPE_TEXT, text: "chrome" },
      expectation: { type: ExpectationType.NONE },
      next: "continue"
    };
    if (stepCount === 2) return {
      session_id, step_id: stepId, goal: "Select Chrome",
      action: { type: ActionType.KEYPRESS, keys: "enter" },
      expectation: { type: ExpectationType.WINDOW_TITLE_CONTAINS, target_text: "Chrome" },
      next: "done"
    };
  }

  // Generic Mock Loop for testing UI
  if (stepCount < 3) {
    return {
      session_id,
      step_id: stepId,
      goal: `Mock Step ${stepCount + 1}`,
      action: { type: ActionType.WAIT, duration_ms: 1000 },
      expectation: { type: ExpectationType.NONE },
      next: "continue"
    }
  }

  return {
    session_id,
    step_id: stepId,
    goal: "Task Completed",
    action: { type: ActionType.WAIT, duration_ms: 100 },
    expectation: { type: ExpectationType.NONE },
    next: "done"
  };
}
