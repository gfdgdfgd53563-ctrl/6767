const express = require('express');
const WebSocket = require('ws');
const http = require('http');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json());

let pcClient = null;

wss.on('connection', (ws) => {
  console.log('✅ PC connecté');
  pcClient = ws;

  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data);
      if (msg.type === 'screenshot') {
        wss.clients.forEach(client => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'screenshot', data: msg.data }));
          }
        });
      }
    } catch (e) {}
  });

  ws.on('close', () => {
    console.log('❌ PC déconnecté');
    pcClient = null;
  });
});

app.post('/api/mouse', (req, res) => {
  const { x, y } = req.body;
  if (pcClient && pcClient.readyState === WebSocket.OPEN) {
    pcClient.send(JSON.stringify({ type: 'mouse', x, y }));
    res.json({ ok: true });
  } else {
    res.json({ ok: false });
  }
});

app.post('/api/keyboard', (req, res) => {
  const { key } = req.body;
  if (pcClient && pcClient.readyState === WebSocket.OPEN) {
    pcClient.send(JSON.stringify({ type: 'keyboard', key }));
    res.json({ ok: true });
  } else {
    res.json({ ok: false });
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Serveur port ${PORT}`));
