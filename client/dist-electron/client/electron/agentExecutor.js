"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeAction = executeAction;
const actions_1 = require("../../shared/agent/actions");
async function executeAction(step, sendToPython) {
    const action = step.action;
    const start = Date.now();
    try {
        switch (action.type) {
            case actions_1.ActionType.MOVE_MOUSE:
                if (action.target_coords) {
                    sendToPython({ command: "move_to", x: action.target_coords.x, y: action.target_coords.y });
                }
                break;
            case actions_1.ActionType.CLICK:
                sendToPython({ command: "click", button: "left" });
                break;
            case actions_1.ActionType.DOUBLE_CLICK:
                sendToPython({ command: "double_click" });
                break;
            case actions_1.ActionType.TYPE_TEXT:
                if (action.text) {
                    // Python needs a type command
                    sendToPython({ command: "type", text: action.text });
                }
                break;
            case actions_1.ActionType.KEYPRESS:
            case actions_1.ActionType.HOTKEY:
                if (action.keys) {
                    sendToPython({ command: "press", keys: action.keys });
                }
                break;
            case actions_1.ActionType.WAIT:
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
    }
    catch (e) {
        return {
            step_id: step.step_id,
            ok: false,
            error: e.message,
            duration_ms: Date.now() - start
        };
    }
}
//# sourceMappingURL=agentExecutor.js.map