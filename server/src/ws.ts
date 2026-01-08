import { WebSocketServer, WebSocket } from "ws";
import { Server } from "http";
import { SessionManager } from "./agent/sessionManager";

export class WSServer {
  private wss: WebSocketServer;
  private sessionManager: SessionManager;

  constructor(server: Server) {
    this.wss = new WebSocketServer({ server, path: "/ws" });
    this.sessionManager = new SessionManager();

    this.wss.on("connection", (ws: WebSocket) => {
      console.log("Client connected via WebSocket");
      this.sessionManager.handleConnection(ws);

      ws.on("close", () => {
        console.log("Client disconnected");
      });
    });
  }
}
