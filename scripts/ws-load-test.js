/**
 * WebSocket connection-churn load test (issue #158).
 *
 * Simulates many clients repeatedly connecting and disconnecting to verify that
 * the TradeGateway connection pool stays flat (no memory leak) under flaky-network
 * conditions. Use it together with heap snapshots to confirm dropped sockets are
 * garbage collected.
 *
 * Prerequisites:
 *   - The API running locally:  npm run start
 *   - socket.io-client installed: npm i -D socket.io-client
 *
 * Usage:
 *   node scripts/ws-load-test.js
 *   URL=http://localhost:3000 CLIENTS=500 ROUNDS=20 HOLD_MS=500 node scripts/ws-load-test.js
 *
 * Capture heap snapshots around the run to confirm stability:
 *   node --expose-gc scripts/ws-load-test.js          # forces GC between rounds
 *   # then compare process RSS / heapUsed printed each round; it should plateau.
 */

const URL = process.env.URL || 'http://localhost:3000';
const CLIENTS = Number(process.env.CLIENTS || 500);
const ROUNDS = Number(process.env.ROUNDS || 20);
const HOLD_MS = Number(process.env.HOLD_MS || 500);

let io;
try {
  io = require('socket.io-client');
} catch {
  console.error(
    'socket.io-client is required to run this load test.\n' +
      'Install it with:  npm i -D socket.io-client',
  );
  process.exit(1);
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function mb(bytes) {
  return (bytes / 1024 / 1024).toFixed(1);
}

function logMemory(label) {
  const m = process.memoryUsage();
  console.log(
    `[${label}] rss=${mb(m.rss)}MB heapUsed=${mb(m.heapUsed)}MB heapTotal=${mb(m.heapTotal)}MB`,
  );
}

function connectOnce() {
  return new Promise((resolve) => {
    const socket = io(URL, {
      transports: ['websocket'],
      reconnection: false,
      timeout: 5000,
    });
    const done = () => resolve(socket);
    socket.on('connect', done);
    socket.on('connect_error', done);
  });
}

async function round(n) {
  const sockets = await Promise.all(
    Array.from({ length: CLIENTS }, () => connectOnce()),
  );
  await sleep(HOLD_MS);
  // Abruptly drop every connection — mimics flaky clients vanishing.
  sockets.forEach((s) => s.disconnect());
  await sleep(HOLD_MS);
  if (global.gc) {
    global.gc();
  }
  logMemory(`round ${n + 1}/${ROUNDS}`);
}

async function main() {
  console.log(
    `Churning ${CLIENTS} clients x ${ROUNDS} rounds against ${URL} ` +
      `(${global.gc ? 'gc enabled' : 'run with --expose-gc for GC between rounds'})`,
  );
  logMemory('baseline');
  for (let i = 0; i < ROUNDS; i++) {
    await round(i);
  }
  logMemory('final');
  console.log(
    'If heapUsed/rss plateau across rounds rather than growing monotonically, ' +
      'dropped connections are being pruned correctly.',
  );
  process.exit(0);
}

main().catch((err) => {
  console.error('Load test failed:', err);
  process.exit(1);
});
