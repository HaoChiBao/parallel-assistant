import { app, BrowserWindow, globalShortcut, ipcMain, screen } from 'electron';
import { spawn, ChildProcess } from 'child_process';
import path from 'path';

let win: BrowserWindow | null = null;
let pythonProcess: ChildProcess | null = null;

// --- STATE OF TRUTH ---
type AgentState = 'INACTIVE' | 'ACTIVE' | 'PAUSED';

let state = {
  overlayVisible: false,
  agentState: 'INACTIVE' as AgentState,
  activeHotkey: 'Control+Alt',
  emergencyHotkey: 'Control+Alt+Escape',
  demoRunning: false,
  lastError: null as string | null,
  targetBox: null as { x: number; y: number; width: number; height: number; label?: string } | null,
  speed: 20, // px per tick
  clickThroughEnabled: true
};

// Movement Logic
let movementInterval: NodeJS.Timeout | null = null;
let demoInterval: NodeJS.Timeout | null = null;
const activeKeys = new Set<string>(); // Tracks currently held keys for WASD

// Grace Period
let ignoreInputUntil = 0;

// --- BROADCAST ---
function broadcastState() {
  if (win && !win.isDestroyed()) {
    win.webContents.send('state-update', state);
  }
}

// --- WINDOW MANAGEMENT ---
function createOverlay() {
  if (win) return;

  const display = screen.getPrimaryDisplay();
  const { width, height } = display.bounds; // Full bounds including taskbar for overlay

  win = new BrowserWindow({
    width,
    height,
    x: 0,
    y: 0,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    movable: false,
    fullscreen: true, 
    hasShadow: false,
    show: false, // Default hidden
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.setAlwaysOnTop(true, 'screen-saver');
  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  win.setIgnoreMouseEvents(true, { forward: true }); // Always click-through for MVP overlay

  const devUrl = 'http://localhost:5173';
  win.loadURL(devUrl).catch((err) => {
    console.error("Failed to load URL:", err);
  });
  
  win.on('ready-to-show', () => {
    // Ensure hidden initially as per req
    win?.hide();
  });

  win.on('closed', () => {
    win = null;
  });
}

function setVisibility(show: boolean) {
  if (!win) return;
  
  if (show) {
    win.show();
    win.setAlwaysOnTop(true, 'screen-saver');
    win.setIgnoreMouseEvents(true, { forward: true });
    state.overlayVisible = true;
    
    // Double Check
    setTimeout(() => {
        if(win && !win.isVisible()) win.show();
    }, 100);
  } else {
    win.hide();
    state.overlayVisible = false;
    setTimeout(() => {
        if(win && win.isVisible()) win.hide();
    }, 100);
  }
  broadcastState();
}

function setAgentState(newState: AgentState) {
  if (state.agentState === newState) return;
  
  state.agentState = newState;
  
  if (newState !== 'ACTIVE') {
    // Cleanup if leaving active
    stopDemo();
    // Stop WASD loop
    if (movementInterval) {
        clearInterval(movementInterval);
        movementInterval = null;
    }
  } else {
     // Entering Active
     startMovementLoop();
     // Set Grace Period (600ms) to ignore the hotkey release events
     ignoreInputUntil = Date.now() + 600;
  }
  
  broadcastState();
}

// --- PYTHON IO ENGINE ---
function startPythonServer() {
  const scriptPath = path.join(__dirname, '..', 'electron', 'py_mouse', 'mouse_server.py'); 
  // Note: in dev, __dirname is dist-electron. 
  // source is client/electron/py_mouse...
  // easier path: process.cwd() is client root.
  const absPath = path.join(process.cwd(), 'electron/py_mouse/mouse_server.py');
  
  console.log("Launching Python IO:", absPath);

  pythonProcess = spawn('python', [absPath]);
  
  // Python -> TS
  pythonProcess.stdout?.on('data', (data) => {
    const lines = data.toString().split('\n');
    for (const line of lines) {
       if (!line.trim()) continue;
       try {
           const json = JSON.parse(line);
           handlePythonMessage(json);
       } catch (e) {
           // console.log("Raw Python:", line);
       }
    }
  });

  pythonProcess.stderr?.on('data', (data) => {
    console.error(`[PyErr]: ${data}`);
  });

  pythonProcess.on('close', () => {
    pythonProcess = null;
    console.log("Python IO closed");
  });
}

function sendToPython(cmd: any) {
    if (pythonProcess && pythonProcess.stdin) {
        pythonProcess.stdin.write(JSON.stringify(cmd) + "\n");
    }
}

// --- LOGIC BRAIN ---

function handlePythonMessage(msg: any) {
    if (msg.type === 'input_event') {
        onGlobalInput(msg.payload);
    }
}

// Allowed keys map
const AGENT_KEYS = new Set(['w', 'a', 's', 'd', 'W', 'A', 'S', 'D', 'Key.shift', 'Key.shift_r', 'Key.shift_l']);

function onGlobalInput(event: any) {
    // Grace Period Check
    if (Date.now() < ignoreInputUntil) return;

    // Auto-Pause Logic
    if (state.agentState === 'ACTIVE') {
        let isAgentInput = false;

        if (event.kind === 'keydown' || event.kind === 'keyup') {
            const key = event.key?.replace(/'/g, ""); // Pynput can send 'w'
            if (AGENT_KEYS.has(key)) {
                isAgentInput = true;
                
                // Track Key State
                if (event.kind === 'keydown') activeKeys.add(key.toLowerCase());
                if (event.kind === 'keyup') activeKeys.delete(key.toLowerCase());
            }
        }
        
        // If it's NOT an agent key, and it IS a user action (keydown or mousemove)
        // MOUSEMOVE: Python IO suppresses our own moves. So any mousemove here IS user.
        if (!isAgentInput) {
            // Detected User Inference
            setAgentState('PAUSED');
            state.lastError = `User Intervention: ${event.kind}`;
            activeKeys.clear(); 
            broadcastState();
            return;
        }
    } else {
        // If paused/inactive, just clear keys to be safe
        activeKeys.clear();
    }
}

// WASD Loop
function startMovementLoop() {
    if (movementInterval) clearInterval(movementInterval);
    
    movementInterval = setInterval(() => {
        if (state.agentState !== 'ACTIVE') return;
        if (state.demoRunning) return; // Demo takes precedence

        let dx = 0;
        let dy = 0;
        const baseSpeed = state.speed;
        let speed = baseSpeed;

        // Shift modifier
        if (activeKeys.has('key.shift') || activeKeys.has('key.shift_r') || activeKeys.has('key.shift_l')) {
            speed *= 3;
        }

        if (activeKeys.has('w')) dy -= speed;
        if (activeKeys.has('s')) dy += speed;
        if (activeKeys.has('a')) dx -= speed;
        if (activeKeys.has('d')) dx += speed;

        if (dx !== 0 || dy !== 0) {
            sendToPython({ command: 'move_by', dx, dy });
        }
    }, 16); // ~60fps
}

// Demo Logic
function startDemo() {
   if (state.agentState !== 'ACTIVE') return;
   
   state.demoRunning = true;
   broadcastState();
   
   let tick = 0;
   const centerScreen = screen.getPrimaryDisplay().bounds;
   const cx = centerScreen.width / 2;
   const cy = centerScreen.height / 2;
   const radius = 200;

   if (demoInterval) clearInterval(demoInterval);
   
   demoInterval = setInterval(() => {
       if (state.agentState !== 'ACTIVE' || !state.demoRunning) {
           stopDemo();
           return;
       }
       
       tick += 0.05;
       // Figure 8
       const x = cx + Math.cos(tick) * radius;
       const y = cy + Math.sin(tick * 2) * (radius / 2);
       
       sendToPython({ command: 'move_to', x, y });
       
       // Update Target Box visualization
       state.targetBox = {
           x: x - 25,
           y: y - 25,
           width: 50,
           height: 50,
           label: 'Demo Target'
       };
       broadcastState();
       
   }, 16);
}

function stopDemo() {
    state.demoRunning = false;
    if (demoInterval) {
        clearInterval(demoInterval);
        demoInterval = null;
    }
    state.targetBox = null;
    broadcastState();
}


// --- IPC HANDLERS ---
import { executeAction } from './agentExecutor';
import { captureObservation } from './observationCapture';

ipcMain.handle('agent-capture-observation', async () => {
   if (!win) return null;
   return await captureObservation(win);
});

ipcMain.handle('agent-execute-action', async (_, step) => {
   return await executeAction(step, sendToPython);
});

ipcMain.on('request-hide', () => setVisibility(false));
ipcMain.on('request-toggle-active', () => {
    if (state.agentState === 'ACTIVE') setAgentState('INACTIVE');
    else setAgentState('ACTIVE'); 
});
ipcMain.on('request-resume', () => setAgentState('ACTIVE'));
ipcMain.on('request-demo', () => {
    if (state.demoRunning) stopDemo();
    else startDemo();
});
ipcMain.on('set-speed', (_, val) => { state.speed = val; broadcastState(); });
ipcMain.on('set-click-through', (_, enabled: boolean) => {
    if (!win) return;
    state.clickThroughEnabled = enabled;
    // If enabled is true => WE WANT CLICK THROUGH => ignoreMouseEvents(true)
    // If enabled is false => WE WANT TO CATCH CLICKS => ignoreMouseEvents(false)
    win.setIgnoreMouseEvents(enabled, { forward: true });
    broadcastState();
});


// --- BOOT ---
app.whenReady().then(() => {
    createOverlay();
    startPythonServer();

    // Hotkeys
    const primary = 'Control+Alt'; // Electron might reject modifier-only
    try {
        const ret = globalShortcut.register('Control+Alt+Space', () => {
             // If hidden, SHOW overlay and ensure INACTIVE (Planning Mode)
             if (!state.overlayVisible) {
                 setVisibility(true);
                 setAgentState('INACTIVE');
                 // startDemo(); // DISABLE AUTO DEMO for Agent Loop
             } else {
                 // If already visible, HIDE
                 setVisibility(false);
                 setAgentState('INACTIVE');
             }
        });
        if (ret) state.activeHotkey = 'Control+Alt+Space';
        else {
             // Fallback?
        }
    } catch(e) {}
    
    globalShortcut.register('Control+Alt+Escape', () => {
        setAgentState('INACTIVE');
        setVisibility(false);
        state.lastError = "Emergency Stop Triggered";
        broadcastState();
    });
});

app.on('will-quit', () => {
    if (pythonProcess) pythonProcess.kill();
    globalShortcut.unregisterAll();
});
