import { z } from "zod";
import { ActionType, Action } from "./actions"; // Using types only in Zod if needed, or defining explicitly

// --- Primitives ---
export const SessionStateSchema = z.enum(["INACTIVE", "ACTIVE", "PAUSED"]);
export type SessionState = z.infer<typeof SessionStateSchema>;

export const ConnectionStatusSchema = z.enum(["CONNECTED", "RECONNECTING", "OFFLINE"]);
export type ConnectionStatus = z.infer<typeof ConnectionStatusSchema>;

// Observation
export const ObservationSchema = z.object({
  frame_id: z.number(),
  active_app: z.string().optional(),
  window_title: z.string().optional(),
  cursor: z.object({ x: z.number(), y: z.number() }).optional(),
  display: z.object({ width: z.number(), height: z.number(), scale_factor: z.number() }).optional(),
  image: z.string().optional(), // base64 webp
  timestamp: z.number()
});
export type Observation = z.infer<typeof ObservationSchema>;

// Action Result
export const ActionResultSchema = z.object({
  step_id: z.string(),
  ok: z.boolean(),
  error: z.string().optional(),
  duration_ms: z.number().optional()
});
export type ActionResult = z.infer<typeof ActionResultSchema>;

// Step (Simplified for message payload)
export const StepSchema = z.object({
  session_id: z.string(),
  step_id: z.string(),
  goal: z.string(),
  action: z.any(), // Validated stronger in step.ts
  expectation: z.any(),
  fallbacks: z.array(z.any()).optional(),
  risk: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  requires_confirmation: z.boolean().optional(),
  next: z.enum(["continue", "confirm", "done", "need_info"])
});
export type Step = z.infer<typeof StepSchema>;


// --- Client -> Server Messages ---

export const ClientMessageSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("session.start"), task: z.string() }),
  z.object({ kind: z.literal("observation"), data: ObservationSchema }),
  z.object({ kind: z.literal("action.result"), data: ActionResultSchema }),
  z.object({ kind: z.literal("user.override"), type: z.enum(["mouse", "keyboard"]), details: z.string().optional() }),
  z.object({ kind: z.literal("session.pause") }),
  z.object({ kind: z.literal("session.resume") }),
  z.object({ kind: z.literal("session.stop") }),
  z.object({ kind: z.literal("confirm.step"), step_id: z.string(), approved: z.boolean() })
]);
export type ClientMessage = z.infer<typeof ClientMessageSchema>;

// --- Server -> Client Messages ---

export const ServerMessageSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("session.state"), state: SessionStateSchema, reason: z.string().optional() }),
  z.object({ kind: z.literal("thinking"), step_id: z.string().optional(), text: z.string(), type: z.enum(["plan", "reason", "status"]) }),
  z.object({ kind: z.literal("step.proposed"), step: StepSchema }),
  z.object({ kind: z.literal("action.execute"), step: StepSchema }),
  z.object({ kind: z.literal("verify.request"), step_id: z.string() }),
  z.object({ kind: z.literal("error"), message: z.string(), where: z.string().optional() }),
  z.object({ kind: z.literal("done"), summary: z.string() })
]);
export type ServerMessage = z.infer<typeof ServerMessageSchema>;
