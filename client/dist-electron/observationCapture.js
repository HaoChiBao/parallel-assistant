"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.captureObservation = captureObservation;
const electron_1 = require("electron");
let frameIdCounter = 0;
async function captureObservation(win) {
    const display = electron_1.screen.getPrimaryDisplay();
    const { width, height } = display.bounds;
    const scaleFactor = display.scaleFactor;
    // Get Screenshot
    const sources = await electron_1.desktopCapturer.getSources({ types: ['screen'], thumbnailSize: { width, height } });
    const primarySource = sources[0]; // Assuming primary
    const imageDisplay = primarySource.thumbnail.toDataURL(); // Base64
    // Get Cursor (Main process state if available, or just null for now)
    const cursor = electron_1.screen.getCursorScreenPoint();
    // Active App (TODO: use native lib like 'active-win' or the python server)
    // For MVP, we skip strictly accurate active app
    return {
        frame_id: ++frameIdCounter,
        timestamp: Date.now(),
        display: { width, height, scale_factor: scaleFactor },
        cursor: { x: cursor.x, y: cursor.y },
        image: imageDisplay,
        active_app: "Unknown",
        window_title: "Unknown"
    };
}
//# sourceMappingURL=observationCapture.js.map