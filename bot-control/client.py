import websocket, json, time, base64, io, threading
from PIL import ImageGrab
from pynput.mouse import Controller as MouseController
from pynput.keyboard import Controller as KeyboardController

mouse = MouseController()
keyboard = KeyboardController()
WS_URL = "wss://6767.onrender.com"

def capture_screen():
    try:
        img = ImageGrab.grab()
        buf = io.BytesIO()
        img.save(buf, format='JPEG', quality=40)
        buf.seek(0)
        return base64.b64encode(buf.read()).decode()
    except:
        return None

def on_message(ws, msg):
    try:
        data = json.loads(msg)
        if data['type'] == 'mouse':
            mouse.position = (data['x'], data['y'])
        elif data['type'] == 'keyboard':
            key = data['key']
            if len(key) == 1:
                keyboard.type(key)
    except:
        pass

def on_open(ws):
    print("✅ Connecté!")
    def stream():
        while True:
            try:
                screen = capture_screen()
                if screen:
                    ws.send(json.dumps({'type': 'screenshot', 'data': screen}))
                time.sleep(0.05)
            except:
                break
    threading.Thread(target=stream, daemon=True).start()

def on_close(ws, *args):
    print("❌ Reconnexion...")
    time.sleep(3)
    start()

def start():
    ws = websocket.WebSocketApp(WS_URL, on_open=on_open, on_message=on_message, on_close=on_close)
    ws.run_forever()

if __name__ == "__main__":
    print("🚀 Client lancé...")
    start()
