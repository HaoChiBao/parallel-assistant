"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerMessageSchema = exports.ClientMessageSchema = exports.StepSchema = exports.ActionResultSchema = exports.ObservationSchema = exports.ConnectionStatusSchema = exports.SessionStateSchema = void 0;
const zod_1 = require("zod");
// --- Primitives ---
exports.SessionStateSchema = zod_1.z.enum(["INACTIVE", "ACTIVE", "PAUSED"]);
exports.ConnectionStatusSchema = zod_1.z.enum(["CONNECTED", "RECONNECTING", "OFFLINE"]);
// Observation
exports.ObservationSchema = zod_1.z.object({
    frame_id: zod_1.z.number(),
    active_app: zod_1.z.string().optional(),
    window_title: zod_1.z.string().optional(),
    cursor: zod_1.z.object({ x: zod_1.z.number(), y: zod_1.z.number() }).optional(),
    display: zod_1.z.object({ width: zod_1.z.number(), height: zod_1.z.number(), scale_factor: zod_1.z.number() }).optional(),
    image: zod_1.z.string().optional(), // base64 webp
    timestamp: zod_1.z.number()
});
// Action Result
exports.ActionResultSchema = zod_1.z.object({
    step_id: zod_1.z.string(),
    ok: zod_1.z.boolean(),
    error: zod_1.z.string().optional(),
    duration_ms: zod_1.z.number().optional()
});
// Step (Simplified for message payload)
exports.StepSchema = zod_1.z.object({
    session_id: zod_1.z.string(),
    step_id: zod_1.z.string(),
    goal: zod_1.z.string(),
    action: zod_1.z.any(), // Validated stronger in step.ts
    expectation: zod_1.z.any(),
    fallbacks: zod_1.z.array(zod_1.z.any()).optional(),
    risk: zod_1.z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
    requires_confirmation: zod_1.z.boolean().optional(),
    next: zod_1.z.enum(["continue", "confirm", "done", "need_info"])
});
// --- Client -> Server Messages ---
exports.ClientMessageSchema = zod_1.z.discriminatedUnion("kind", [
    zod_1.z.object({ kind: zod_1.z.literal("session.start"), task: zod_1.z.string() }),
    zod_1.z.object({ kind: zod_1.z.literal("observation"), data: exports.ObservationSchema }),
    zod_1.z.object({ kind: zod_1.z.literal("action.result"), data: exports.ActionResultSchema }),
    zod_1.z.object({ kind: zod_1.z.literal("user.override"), type: zod_1.z.enum(["mouse", "keyboard"]), details: zod_1.z.string().optional() }),
    zod_1.z.object({ kind: zod_1.z.literal("session.pause") }),
    zod_1.z.object({ kind: zod_1.z.literal("session.resume") }),
    zod_1.z.object({ kind: zod_1.z.literal("session.stop") }),
    zod_1.z.object({ kind: zod_1.z.literal("confirm.step"), step_id: zod_1.z.string(), approved: zod_1.z.boolean() })
]);
// --- Server -> Client Messages ---
exports.ServerMessageSchema = zod_1.z.discriminatedUnion("kind", [
    zod_1.z.object({ kind: zod_1.z.literal("session.state"), state: exports.SessionStateSchema, reason: zod_1.z.string().optional() }),
    zod_1.z.object({ kind: zod_1.z.literal("thinking"), step_id: zod_1.z.string().optional(), text: zod_1.z.string(), type: zod_1.z.enum(["plan", "reason", "status"]) }),
    zod_1.z.object({ kind: zod_1.z.literal("step.proposed"), step: exports.StepSchema }),
    zod_1.z.object({ kind: zod_1.z.literal("action.execute"), step: exports.StepSchema }),
    zod_1.z.object({ kind: zod_1.z.literal("verify.request"), step_id: zod_1.z.string() }),
    zod_1.z.object({ kind: zod_1.z.literal("error"), message: zod_1.z.string(), where: zod_1.z.string().optional() }),
    zod_1.z.object({ kind: zod_1.z.literal("done"), summary: zod_1.z.string() })
]);
//# sourceMappingURL=messages.js.map