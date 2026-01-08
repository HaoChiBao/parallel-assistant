import { WebSocket } from "ws";
import { Orchestrator } from "./orchestrator";
import { ClientMessageSchema, ServerMessage } from "@shared/agent/messages"; // Requires path mapping or relative import fix if tsconfig doesn't work perfectly in execution environment

export class SessionManager {
  private activeOrchestrator: Orchestrator | null = null;
  private ws: WebSocket | null = null;

  handleConnection(ws: WebSocket) {
    if (this.ws) {
      console.warn("Closing existing connection for new client");
      this.ws.close();
    }
    this.ws = ws;
    this.activeOrchestrator = new Orchestrator(this.send.bind(this));

    ws.on("message", (raw: string) => {
      try {
        const json = JSON.parse(raw.toString());
        const result = ClientMessageSchema.safeParse(json);
        
        if (!result.success) {
          console.error("Invalid message format:", result.error);
          this.send({ kind: "error", message: "Invalid message format" });
          return;
        }

        const msg = result.data;
        this.activeOrchestrator?.handleMessage(msg);

      } catch (e) {
        console.error("Error parsing message:", e);
      }
    });
  }

  send(msg: ServerMessage) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
    }
  }
}
