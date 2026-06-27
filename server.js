const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 3000;

/**
 * WebSocket Connection Listener
 * Logs a message when a client connects.
 */
wss.on('connection', (ws) => {
  console.log('✅ New WebSocket client connected');

  ws.on('close', () => {
    console.log('❌ WebSocket client disconnected');
  });

  ws.on('error', (err) => {
    console.error('⚠️ WebSocket error:', err.message);
  });
});

/**
 * Basic Broadcaster
 * Sends a dummy JSON string every 5 seconds to all connected clients.
 */
setInterval(() => {
  const payload = JSON.stringify({
    type: 'ping',
    timestamp: new Date().toISOString()
  });

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}, 5000);

app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

server.listen(PORT, () => {
  console.log(`🚀 Mock Server running on http://localhost:${PORT}`);
  console.log(`📡 WebSocket server attached to the HTTP server`);
});
