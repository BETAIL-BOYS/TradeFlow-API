const EventEmitter = require('events');

/**
 * Global Event Emitter for internal service communication
 * This allows the eventIndexer to communicate with the WebSocket server
 */
const tradeFlowEvents = new EventEmitter();

module.exports = tradeFlowEvents;
