const { rpc, xdr, scValToNative } = require('@stellar/stellar-sdk');
const { PrismaClient } = require('@prisma/client');
const eventEmitter = require('./eventEmitter');

// Initialize Prisma Client
const prisma = new PrismaClient();

// Configuration
// In a real environment, these would be in a .env file
const SOROBAN_RPC_URL = process.env.SOROBAN_RPC_URL || 'https://soroban-testnet.stellar.org';
const POOL_ADDRESS = process.env.POOL_ADDRESS || 'CC7J6PQTYY7W25Z6M4S6S6S6S6S6S6S6S6S6S6S6S6S6S6S6S6S6'; // Placeholder pool address

/**
 * Parsing utility to decode Soroban XDR payloads into readable JSON
 */
const SorobanParser = {
  /**
   * Decodes a Base64 encoded ScVal XDR string into a native JS type
   */
  decodeScVal(xdrString) {
    if (!xdrString) return null;
    try {
      const val = xdr.ScVal.fromXDR(xdrString, 'base64');
      return scValToNative(val);
    } catch (error) {
      console.error('Error decoding ScVal:', error);
      return null;
    }
  },

  /**
   * Parses a full SwapEvent from its raw XDR components
   */
  parseSwapEvent(event) {
    try {
      // Soroban events have topics (array of ScVal) and a value (ScVal)
      const topics = event.topics.map(t => this.decodeScVal(t));
      const payload = this.decodeScVal(event.value);

      // Standard SwapEvent structure:
      // topics[0]: 'Swap' (symbol/string)
      // topics[1]: User address (AccountID or ContractID)
      // payload: { amount_in: i128, amount_out: i128, token_in: Address, token_out: Address }
      
      const eventName = topics[0];
      const userAddress = topics[1];

      if (eventName !== 'Swap') {
          return null;
      }

      return {
        eventName,
        userAddress: userAddress.toString(),
        amountIn: payload.amount_in ? payload.amount_in.toString() : payload.amountIn?.toString() || '0',
        amountOut: payload.amount_out ? payload.amount_out.toString() : payload.amountOut?.toString() || '0',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to parse swap event:', error);
      return null;
    }
  }
};

const server = new rpc.Server(SOROBAN_RPC_URL);

/**
 * Main daemon loop to listen for Soroban events
 */
async function runIndexer() {
  console.log('--- TradeFlow Event Indexer Running ---');
  console.log(`RPC Node: ${SOROBAN_RPC_URL}`);
  console.log(`Watching Pool: ${POOL_ADDRESS}`);
  
  // We'd ideally store this in the database to resume from failure
  let lastLedger = 0; 
  
  // Try to start from current ledger if we don't know where we are
  try {
      const info = await server.getLatestLedger();
      lastLedger = info.sequence;
      console.log(`Starting from current ledger: ${lastLedger}`);
  } catch (err) {
      console.warn('Could not fetch latest ledger, starting from 0');
  }

  while (true) {
    try {
      // we use getEvents to poll for contract events
      const response = await server.getEvents({
        startLedger: lastLedger,
        filters: [
          {
            type: 'contract',
            contractIds: [POOL_ADDRESS],
          }
        ],
        limit: 10
      });

      if (response.results && response.results.length > 0) {
        console.log(`Found ${response.results.length} new events...`);
        
        for (const event of response.results) {
          const parsed = SorobanParser.parseSwapEvent(event);
          
          if (parsed) {
            console.log(`Event Parsed: Swap by ${parsed.userAddress} (${parsed.amountIn} -> ${parsed.amountOut})`);
            
            // Sync with Database
            await saveTradeToDb(parsed);
          }
          
          // Update ledger seq to avoid double counting
          if (event.ledgerSeq >= lastLedger) {
              lastLedger = event.ledgerSeq + 1;
          }
        }
      }

      // Checkpoint every 5 seconds
      await new Promise(resolve => setTimeout(resolve, 5000));
      
    } catch (error) {
      console.error('Indexer error pulse:', error.message);
      // Wait longer on error to prevent spamming
      await new Promise(resolve => setTimeout(resolve, 15000));
    }
  }
}

/**
 * Persists the parsed trade into PostgreSQL via Prisma
 */
async function saveTradeToDb(tradeData) {
  try {
    // Ensure the pool exists in our database first
    // In a real app, pools should already exist, but for this daemon we'll upsert
    let pool = await prisma.pool.findUnique({
      where: { address: POOL_ADDRESS }
    });

    if (!pool) {
      console.log(`Creating record for pool ${POOL_ADDRESS} in DB`);
      pool = await prisma.pool.create({
        data: {
          address: POOL_ADDRESS,
          tokenA: 'XLM', // Defaulting for indexer bootstrap
          tokenB: 'USDC',
          fee: '0.3%'
        }
      });
    }

    // Insert the actual trade
    await prisma.trade.create({
      data: {
        poolId: pool.id,
        userAddress: tradeData.userAddress,
        amountIn: tradeData.amountIn,
        amountOut: tradeData.amountOut,
        timestamp: new Date()
      }
    });

    console.log(`✅ Trade indexed successfully in DB: ${tradeData.userAddress.substring(0, 8)}...`);
    
    // Emit trade event for WebSocket broadcasting
    eventEmitter.emit('newTrade', {
        ...tradeData,
        poolAddress: POOL_ADDRESS
    });
  } catch (error) {
    console.error('Database insertion error:', error);
  }
}

// Global error handling for the daemon
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Start the daemon
runIndexer().catch(err => {
  console.error('Fatal Indexer Crash:', err);
  process.exit(1);
});
