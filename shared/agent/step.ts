import { Action } from "./actions";
import { Expectation } from "./expectations";

export interface Step {
  session_id: string;
  step_id: string;
  goal: string;
  action: Action;
  expectation: Expectation;
  fallbacks?: Step[];
  risk?: "LOW" | "MEDIUM" | "HIGH";
  requires_confirmation?: boolean;
  next: "continue" | "confirm" | "done" | "need_info";
}
