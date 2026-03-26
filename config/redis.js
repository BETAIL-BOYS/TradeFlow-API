/**
 * Centralized Redis Client Connection
 * Shared across API instances for rate limiting and price caching
 */
const Redis = require('ioredis');

// In a real production deployment, this URL would come from environment
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

const redisClient = new Redis(REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: true
});

redisClient.on('connect', () => {
    console.log('🚀 Redis Connection Established - Synchronization Active');
});

redisClient.on('error', (err) => {
    console.error('⚠️ Redis Connection Failed:', err.message);
});

module.exports = redisClient;
