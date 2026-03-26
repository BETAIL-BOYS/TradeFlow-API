/**
 * server.js
 * 
 * Main Entry Point for combined Soroban Indexer and WebSocket streaming server.
 * This file orchestrates the real-time data flow from the blockchain to the frontend.
 */

const WebSocket = require('ws');
const wsEvents = require('./services/wsEvents');
const { startIndexer } = require('./services/eventIndexer');

// Config and Port Setup
const WS_PORT = process.env.WS_PORT || 3001;
const wss = new WebSocket.Server({ port: WS_PORT });

console.log('--- 🌐 TradeFlow Real-Time Stream Server ---');
console.log(`📡 WebSocket server running on ws://localhost:${WS_PORT}`);

// Connection tracking
let activeConnections = 0;

/**
 * Listen for incoming WebSocket connections.
 */
wss.on('connection', (ws) => {
  activeConnections++;
  console.log(`✅ New Web3 client connected. Active: ${activeConnections}`);
  
  // Initial Connection ACK
  ws.send(JSON.stringify({ 
    event: 'INDEXER_CONNECTED', 
    status: 'ONLINE',
    timestamp: new Date().toISOString() 
  }));

  ws.on('close', () => {
    activeConnections--;
    console.log(`❌ Web3 client disconnected. Active: ${activeConnections}`);
  });

  ws.on('error', (err) => {
    console.error('⚠️ WS Socket Error:', err.message);
  });
});

/**
 * BROADCASTER: Listens to the internal 'newTrade' event emitter.
 * Broadcasts every new blockchain event caught by the Indexer daemon
 * to all connected browser clients.
 */
wsEvents.on('newTrade', (tradeData) => {
  console.log(`📣 BROADCASTING: New trade found in pool ${tradeData.poolId.slice(0, 8)}...`);
  
  const payload = JSON.stringify({
    event: 'NEW_TRADE_EVENT',
    data: tradeData,
    receivedAt: new Date().toISOString()
  });

  // Iterative broadcast to all active subscribers
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
});

/**
 * 🚀 START DAEMON ORCHESTRATION
 * We start the Soroban Indexer in the same Node.js process to bridge
 * the blockchain data with the WebSocket emitter via internal memory.
 */
startIndexer().catch((err) => {
  console.error('❌ CRITICAL ERROR: Event Indexer failed to start:', err.message);
  process.exit(1);
});

// Process Management
process.on('SIGTERM', () => {
  console.log('🛑 Closing WebSocket connections and shutting down.');
  wss.close();
  process.exit(0);
});
