const { successResponse } = require('../utils/responseFormatter');

// Mock token data for Wave 3
const tokens = [
  { id: '1', symbol: 'USDC', name: 'USD Coin', network: 'Stellar' },
  { id: '2', symbol: 'XLM', name: 'Stellar Lumens', network: 'Stellar' }
];

// Refactored List Endpoint 1: Get all tokens
const getTokens = (req, res) => {
  return successResponse(res, tokens, "Tokens retrieved successfully", { count: tokens.length });
};

// Refactored List Endpoint 2: Get tokens by a specific network
const getNetworkTokens = (req, res) => {
  const network = req.query.network || 'Stellar';
  const filteredTokens = tokens.filter(t => t.network.toLowerCase() === network.toLowerCase());
  return successResponse(res, filteredTokens, `${network} tokens retrieved successfully`, { count: filteredTokens.length });
};

module.exports = {
  getTokens,
  getNetworkTokens
};