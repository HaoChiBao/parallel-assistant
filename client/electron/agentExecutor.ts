import { Action, ActionType } from "@shared/agent/actions";
import { Step } from "@shared/agent/step";
import { ActionResult } from "@shared/agent/messages";

export async function executeAction(
  step: Step, 
  sendToPython: (cmd: any) => void
): Promise<ActionResult> {
  const action = step.action;
  const start = Date.now();

  try {
    switch (action.type) {
      case ActionType.MOVE_MOUSE:
        if (action.target_coords) {
          sendToPython({ command: "move_to", x: action.target_coords.x, y: action.target_coords.y });
        }
        break;
      
      case ActionType.CLICK:
        sendToPython({ command: "click", button: "left" });
        break;
      
      case ActionType.DOUBLE_CLICK:
        sendToPython({ command: "double_click" });
        break;
        
      case ActionType.TYPE_TEXT:
        if (action.text) {
           // Python needs a type command
           sendToPython({ command: "type", text: action.text });
        }
        break;
        
      case ActionType.KEYPRESS:
      case ActionType.HOTKEY:
        if (action.keys) {
            sendToPython({ command: "press", keys: action.keys });
        }
        break;
        
      case ActionType.WAIT:
        await new Promise(resolve => setTimeout(resolve, action.duration_ms || 1000));
        break;
        
      default:
        // TODO: Implement other actions
        console.warn("Unsupported action type:", action.type);
    }
    
    return {
      step_id: step.step_id,
      ok: true,
      duration_ms: Date.now() - start
    };
    
  } catch (e: any) {
    return {
      step_id: step.step_id,
      ok: false,
      error: e.message,
      duration_ms: Date.now() - start
    };
  }
}
