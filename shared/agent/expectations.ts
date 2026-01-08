export enum ExpectationType {
  ELEMENT_PRESENT = "ELEMENT_PRESENT",
  WINDOW_TITLE_CONTAINS = "WINDOW_TITLE_CONTAINS",
  APP_IS_ACTIVE = "APP_IS_ACTIVE",
  TEXT_PRESENT = "TEXT_PRESENT",
  SCREEN_CHANGED = "SCREEN_CHANGED",
  TOAST_PRESENT = "TOAST_PRESENT",
  NONE = "NONE"
}

export interface Expectation {
  type: ExpectationType;
  target_text?: string;
  timeout_ms?: number;
  poll_ms?: number;
}
