export enum ActionType {
  CLICK = "CLICK",
  DOUBLE_CLICK = "DOUBLE_CLICK",
  RIGHT_CLICK = "RIGHT_CLICK",
  MOVE_MOUSE = "MOVE_MOUSE",
  SCROLL = "SCROLL",
  TYPE_TEXT = "TYPE_TEXT",
  SET_CLIPBOARD = "SET_CLIPBOARD",
  PASTE = "PASTE",
  KEYPRESS = "KEYPRESS",
  HOTKEY = "HOTKEY",
  WAIT = "WAIT",
  FOCUS_APP = "FOCUS_APP"
}

export type TargetStrategy = "A11Y" | "VISION" | "COORDS";

export interface TargetCoords {
  x: number;
  y: number;
}

export interface TargetVision {
  bbox: [number, number, number, number]; // x1, y1, x2, y2
  label?: string;
  confidence?: number;
}

export interface TargetA11Y {
  role?: string;
  name_contains?: string;
}

export interface Action {
  type: ActionType;
  target_strategy?: TargetStrategy;
  target_coords?: TargetCoords;
  target_vision?: TargetVision;
  target_a11y?: TargetA11Y;
  text?: string; // For TYPE_TEXT
  keys?: string; // For KEYPRESS/HOTKEY
  duration_ms?: number; // For WAIT
  risk?: "LOW" | "MEDIUM" | "HIGH";
  requires_confirmation?: boolean;
}
