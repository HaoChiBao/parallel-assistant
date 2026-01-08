
import sys
import json
import time
import threading
import math
import pyautogui
from pynput import mouse, keyboard

# PyAutoGUI Setup
pyautogui.FAILSAFE = False
pyautogui.PAUSE = 0.005

# --- GLOBAL STATE ---
# We track the "Expected Position" of the agent.
# If a mouse move event occurs:
#   - If it is close to expected_pos (within tolerance), we assume it's our own move -> SUPPRESS.
#   - If it is far, it's the user -> REPORT.
last_agent_move_time = 0
expected_pos = None # (x, y)
SUPPRESS_TOLERANCE = 15 # pixels. If mouse is within 15px of target, ignore.
SUPPRESS_WINDOW = 0.2 # seconds. Only apply heuristic for short time after move.

# --- OUTPUT HELPERS ---
def send_to_electron(msg_type, payload):
    try:
        msg = json.dumps({"type": msg_type, "payload": payload})
        sys.stdout.write(msg + "\n")
        sys.stdout.flush()
    except Exception:
        pass

# --- INPUT LISTENERS ---

def on_mouse_move(x, y):
    global expected_pos, last_agent_move_time
    
    # Check if we are in the "Agent Moving" window
    if time.time() - last_agent_move_time < SUPPRESS_WINDOW:
        if expected_pos:
            ex, ey = expected_pos
            # Euclidian distance
            dist = math.hypot(x - ex, y - ey)
            
            if dist < SUPPRESS_TOLERANCE:
                # It's us! Suppress.
                return
    
    # If we are here, it's either:
    # 1. Time window expired (Agent not active)
    # 2. Distance too large (User jerked mouse away)
    send_to_electron("input_event", {"kind": "mousemove", "x": x, "y": y})

def on_click(x, y, button, pressed):
    if not pressed: return
    # Always report clicks for safety. Agent logic in TS can decide to ignore if needed,
    # but generally user clicking implies they want control.
    send_to_electron("input_event", {"kind": "mousedown", "button": str(button)})

def on_scroll(x, y, dx, dy):
    send_to_electron("input_event", {"kind": "mousewheel"})

def on_press(key):
    k_str = ""
    try:
        k_str = key.char
    except AttributeError:
        k_str = str(key)
    send_to_electron("input_event", {"kind": "keydown", "key": k_str})

def on_release(key):
    k_str = ""
    try:
        k_str = key.char
    except AttributeError:
        k_str = str(key)
    send_to_electron("input_event", {"kind": "keyup", "key": k_str})

# --- COMMAND HANDLERS ---

def handle_command(cmd_data):
    global expected_pos, last_agent_move_time
    cmd = cmd_data.get('command')
    
    if cmd == 'move_to':
        x = cmd_data.get('x')
        y = cmd_data.get('y')
        
        # 1. Update Expected Pos BEFORE moving
        expected_pos = (x, y)
        last_agent_move_time = time.time()
        
        # 2. Perform Move
        try:
            pyautogui.moveTo(x, y)
        except:
            pass
            
    elif cmd == 'move_by':
        dx = cmd_data.get('dx')
        dy = cmd_data.get('dy')
        
        # Calculate expected (rough, as we don't know start per se without querying)
        # For perf, maybe query? Or just rely on relative?
        # Let's query current first to be accurate.
        try:
            ox, oy = pyautogui.position()
            tx, ty = ox + dx, oy + dy
            
            expected_pos = (tx, ty)
            last_agent_move_time = time.time()
            
            pyautogui.moveRel(dx, dy)
        except:
            pass

    elif cmd == 'get_pos':
        try:
            x, y = pyautogui.position()
            send_to_electron("position_update", {"x": x, "y": y})
        except:
            pass

# --- MAIN ---

def main():
    sys.stderr.write("Python IO Engine Started (Heuristic Mode)\n")
    sys.stderr.flush()

    # Listeners
    m_listener = mouse.Listener(
        on_move=on_mouse_move,
        on_click=on_click,
        on_scroll=on_scroll
    )
    m_listener.start()

    k_listener = keyboard.Listener(
        on_press=on_press,
        on_release=on_release
    )
    k_listener.start()

    while True:
        try:
            line = sys.stdin.readline()
            if not line: break
            
            line = line.strip()
            if not line: continue

            try:
                data = json.loads(line)
                handle_command(data)
            except json.JSONDecodeError:
                pass
                
        except KeyboardInterrupt:
            break
        except Exception:
            pass
    
    m_listener.stop()
    k_listener.stop()

if __name__ == "__main__":
    main()
