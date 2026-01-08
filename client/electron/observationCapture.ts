import { desktopCapturer, screen, BrowserWindow } from 'electron';
import { Observation } from '@shared/agent/messages';

let frameIdCounter = 0;

export async function captureObservation(win: BrowserWindow): Promise<Observation> {
  const display = screen.getPrimaryDisplay();
  const { width, height } = display.bounds;
  const scaleFactor = display.scaleFactor;
  
  // Get Screenshot
  const sources = await desktopCapturer.getSources({ types: ['screen'], thumbnailSize: { width, height } });
  const primarySource = sources[0]; // Assuming primary
  const imageDisplay = primarySource.thumbnail.toDataURL(); // Base64
  
  // Get Cursor (Main process state if available, or just null for now)
  const cursor = screen.getCursorScreenPoint();

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
