const http = require('http');
const WebSocket = require('ws');
const eventEmitter = require('./services/eventEmitter');

/**
 * TradeFlow WebSocket Server
 * Broadcasts real-time Soroban ledger updates to connected clients
 */
const server = http.createServer();
const wss = new WebSocket.Server({ server });

// Track connected clients
let clients = 0;

wss.on('connection', (ws) => {
    clients++;
    console.log(`[WS] New client connected. Active: ${clients}`);
    
    // Welcome message
    ws.send(JSON.stringify({ 
        type: 'SUBSCRIPTION_SUCCESS', 
        message: 'Connected to TradeFlow Real-time Data Pipeline' 
    }));

    ws.on('close', () => {
        clients--;
        console.log(`[WS] Client disconnected. Active: ${clients}`);
    });
});

/**
 * Handle new trade events from the Soroban Indexer
 */
eventEmitter.on('newTrade', (trade) => {
    console.log(`[WS] Incoming trade from Indexer. Broadcasting to ${wss.clients.size} clients...`);
    
    const payload = JSON.stringify({
        topic: 'TRADE_UPDATE',
        data: trade,
        timestamp: new Date().toISOString()
    });

    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(payload);
        }
    });
});

const WS_PORT = process.env.WS_PORT || 8080;

server.listen(WS_PORT, () => {
    console.log('==============================================');
    console.log(`🚀 TradeFlow WebSocket Server active on port ${WS_PORT}`);
    console.log('==============================================');
});
