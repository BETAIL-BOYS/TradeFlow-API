const { successResponse } = require('../utils/responseFormatter');

// Mock price data
const mockPrices = [
  { symbol: 'USDC', price: 1.00 },
  { symbol: 'XLM', price: 0.12 }
];

// Refactored List Endpoint 3: Get all prices
const getPrices = (req, res) => {
  return successResponse(res, mockPrices, "Prices retrieved successfully", { count: mockPrices.length });
};

module.exports = {
  getPrices
};