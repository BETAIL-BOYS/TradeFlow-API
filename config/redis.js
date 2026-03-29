const Redis = require('ioredis');

// Load environment variables if needed for standalone scripts
if (!process.env.REDIS_URL) {
  require('dotenv').config();
}

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

/**
 * Initializes and exports a centralized Redis client connection.
 * Used for distributed rate limiting and caching across multiple API instances.
 */
const redis = new Redis(REDIS_URL, {
  maxRetriesPerRequest: null,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  }
});

redis.on('connect', () => {
  console.log('✅ Connected to Redis successfully');
});

redis.on('error', (err) => {
  console.error('❌ Redis Connection Error:', err.message);
});

module.exports = redis;
