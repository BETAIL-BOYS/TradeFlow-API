/**
 * services/eventIndexer.js
 * 
 * Background Soroban Event Listener daemon for TradeFlow-API.
 * This service polls the Soroban RPC for events emitted by the specified Pool contract.
 * When a 'Swap' event is detected, it parses the data and saves it to the database with Prisma.
 */

const { rpc } = require('@stellar/stellar-sdk');
const { PrismaClient } = require('@prisma/client');
const { parseScVal } = require('./scValParser');
const wsEvents = require('./wsEvents');

// In case dotenv is not installed as a top-level dependency,
// we try to load it safely. Most Node.js environments for this project should have it.
try {
  require('dotenv').config();
} catch (e) {
  console.warn('⚠️ dotenv not loaded. Ensure environment variables are set manually.');
}

const prisma = new PrismaClient();

// Configuration
const RPC_URL = process.env.SOROBAN_RPC_URL || 'https://soroban-testnet.stellar.org';
const POOL_ADDRESS = process.env.POOL_ADDRESS;
const POLL_INTERVAL = parseInt(process.env.INDEXER_POLL_INTERVAL || '5000');

if (!POOL_ADDRESS) {
  console.error('❌ POOL_ADDRESS is not defined in environment variables.');
  console.error('Please add POOL_ADDRESS="YOUR_CONTRACT_ID" to your .env file.');
  process.exit(1);
}

const server = new rpc.Server(RPC_URL);

/**
 * Main daemon loop to poll for Soroban events.
 */
async function startIndexer() {
  console.log('--- 🚀 TradeFlow Soroban Event Indexer ---');
  console.log(`📡 RPC Node: ${RPC_URL}`);
  console.log(`🎯 Pool Contract: ${POOL_ADDRESS}`);
  console.log('-------------------------------------------');

  // Start from the latest ledger initially
  let currentLedgerSequence;
  try {
    const latestLedger = await server.getLatestLedger();
    currentLedgerSequence = latestLedger.sequence;
    console.log(`Initial Start Ledger: ${currentLedgerSequence}`);
  } catch (err) {
    console.error('❌ Failed to connect to Soroban RPC. Verify your SOROBAN_RPC_URL.');
    process.exit(1);
  }

  // Periodic polling
  setInterval(async () => {
    try {
      const response = await server.getEvents({
        startLedger: currentLedgerSequence,
        filters: [
          {
            type: 'contract',
            contractIds: [POOL_ADDRESS],
          },
        ],
        limit: 10,
      });

      if (response.events && response.events.length > 0) {
        console.log(`Found ${response.events.length} new event(s). Processing...`);

        for (const event of response.events) {
          // Process event
          await handleContractEvent(event);
        }

        // Advance ledger checkpoint
        const latestProcessed = Math.max(...response.events.map(e => parseInt(e.ledger)));
        currentLedgerSequence = latestProcessed + 1;
      }
    } catch (error) {
      console.error('⚠️ Indexer Polling Error:', error.message);
    }
  }, POLL_INTERVAL);
}

/**
 * Handles an individual contract event.
 * Filters for 'Swap' events and indexes them.
 * 
 * @param {rpc.Api.GetEventsResponse.Event} event - The Soroban event from RPC.
 */
async function handleContractEvent(event) {
  try {
    // Decode topics to identify the event
    const topics = event.topic.map(t => parseScVal(t));
    
    // Check if topics contain "Swap" (case-insensitive)
    const isSwapEvent = topics.some(topic => 
      typeof topic === 'string' && topic.toLowerCase() === 'swap'
    );

    if (isSwapEvent) {
      console.log(`✅ Detected SwapEvent in ledger ${event.ledger}`);
      
      const payload = parseScVal(event.value);
      if (!payload) return;

      console.log('Decoded Payload:', JSON.stringify(payload, null, 2));

      // Map Soroban event data to our Prisma Trade model
      // Expected structure from SwapEvent: { user, amount_in, amount_out }
      const tradeData = {
        poolId: event.contractId,
        userAddress: payload.user || payload.address || 'Unknown',
        amountIn: (payload.amount_in || payload.amountIn || '0').toString(),
        amountOut: (payload.amount_out || payload.amountOut || '0').toString(),
        timestamp: new Date(),
      };

      // Save to Database via Prisma
      const savedTrade = await prisma.trade.create({
        data: tradeData
      });

      console.log(`💾 Indexed Trade saved. DB ID: ${savedTrade.id}`);
      
      // Trigger WebSocket broadcast
      wsEvents.emit('newTrade', savedTrade);
    }
  } catch (error) {
    console.error('❌ Failed to process event:', error.message);
  }
}

// Graceful Shut-off
process.on('SIGINT', async () => {
  console.log('\n--- Indexer Shutting Down ---');
  await prisma.$disconnect();
  process.exit(0);
});

exports.startIndexer = startIndexer;

// In standalone mode, starting the indexer automatically
if (require.main === module) {
  startIndexer();
}
