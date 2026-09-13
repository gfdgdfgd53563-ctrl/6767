const canvas = document.getElementById('screen');
const ctx = canvas.getContext('2d');
const statusEl = document.getElementById('status');
let ws = null;
let mouseX = 0, mouseY = 0;

function connect() {
    ws = new WebSocket('wss://6767.onrender.com');
    
    ws.onopen = () => {
        statusEl.textContent = '🟢 ONLINE';
        statusEl.classList.add('ok');
        statusEl.classList.remove('off');
    };
    
    ws.onmessage = (e) => {
        const data = JSON.parse(e.data);
        if (data.type === 'screenshot') {
            const img = new Image();
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
            };
            img.src = 'data:image/jpeg;base64,' + data.data;
        }
    };
    
    ws.onclose = () => {
        statusEl.textContent = '🔴 OFFLINE';
        statusEl.classList.remove('ok');
        statusEl.classList.add('off');
        setTimeout(connect, 2000);
    };
}

canvas.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    fetch('/api/mouse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ x: Math.floor(mouseX), y: Math.floor(mouseY) })
    });
});

function click_mouse() {
    fetch('/api/mouse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ x: mouseX, y: mouseY, click: true })
    });
}

function send_key(key) {
    fetch('/api/keyboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: key })
    });
}

connect();
