import { ClientMessage, ServerMessage, SessionState, Observation } from "@shared/agent/messages";
import { Step } from "@shared/agent/step";
import { decideNextStep } from "./gemini";

export class Orchestrator {
  private state: SessionState = "INACTIVE";
  private sendMessage: (msg: ServerMessage) => void;
  private session_id: string = "default-session";
  private task: string = "";
  private history: { step: Step, result?: any }[] = [];
  private currentStep: Step | null = null;

  constructor(sendMessage: (msg: ServerMessage) => void) {
    this.sendMessage = sendMessage;
  }

  async handleMessage(msg: ClientMessage) {
    switch (msg.kind) {
      case "session.start":
        this.startSession(msg.task);
        break;
      case "session.stop":
        this.stopSession();
        break;
      case "session.pause":
        this.state = "PAUSED";
        this.broadcastState();
        break;
      case "session.resume":
        if (this.state === "PAUSED") {
          this.state = "ACTIVE";
          this.broadcastState();
          this.runLoop(); // Resume loop
        }
        break;
      case "observation":
        // Store observation?
        break;
      case "action.result":
        this.handleActionResult(msg.data);
        break;
      case "user.override":
        this.state = "PAUSED";
        this.sendMessage({ kind: "thinking", text: "Paused due to user interaction.", type: "status" });
        this.broadcastState();
        break;
      case "confirm.step":
        if (this.currentStep && this.currentStep.step_id === msg.step_id) {
          if (msg.approved) {
             this.sendMessage({ kind: "action.execute", step: this.currentStep });
          } else {
            this.sendMessage({ kind: "thinking", text: "Step denied by user.", type: "status" });
            // TODO: handle rejection
          }
        }
        break;
    }
  }

  private startSession(task: string) {
    this.task = task;
    this.state = "ACTIVE";
    this.history = [];
    this.broadcastState();
    this.sendMessage({ kind: "thinking", text: "Analying task...", type: "plan" });
    this.runLoop();
  }

  private stopSession() {
    this.state = "INACTIVE";
    this.broadcastState();
  }

  private broadcastState() {
    this.sendMessage({ kind: "session.state", state: this.state });
  }

  private async runLoop(lastResult?: any) {
    if (this.state !== "ACTIVE") return;

    // 1. Decide Next Step
    this.sendMessage({ kind: "thinking", text: "Deciding next step...", type: "plan" });
    
    const step = await decideNextStep(this.session_id, this.task, this.history);
    this.currentStep = step;

    this.sendMessage({ kind: "step.proposed", step: this.currentStep });

    if (step.next === "done") {
        this.sendMessage({ kind: "done", summary: "Task completed (mock)." });
        this.stopSession();
        return;
    }

    if (step.requires_confirmation) {
        this.sendMessage({ kind: "thinking", text: "Waiting for confirmation...", type: "status" });
        // Client will send confirm.step -> triggers handleMessage -> sends action.execute
    } else {
        this.sendMessage({ kind: "action.execute", step });
    }
  }

  private handleActionResult(result: any) {
     if (this.state !== "ACTIVE") return;
     
     if (this.currentStep) {
         this.history.push({ step: this.currentStep, result });
         this.currentStep = null;
     }

     if (!result.ok) {
         this.sendMessage({ kind: "error", message: result.error || "Action failed" });
         // Simple retry or stop? For MVP continue or stop.
         // this.state = "PAUSED";
         // this.broadcastState();
     }
     
     // Loop continues
     this.runLoop(result);
  }
}
