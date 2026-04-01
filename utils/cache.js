const { LRUCache } = require('lru-cache');

const cache = new LRUCache({
  max: 500,
  ttl: 60 * 1000, // 60 seconds in milliseconds
});

module.exports = cache;
