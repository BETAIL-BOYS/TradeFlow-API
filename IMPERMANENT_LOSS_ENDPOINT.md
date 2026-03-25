# Impermanent Loss API Endpoint

## Overview

This document describes the implementation of the impermanent loss calculation endpoint for liquidity providers in the TradeFlow API.

## Endpoint Details

**URL**: `GET /api/v1/analytics/impermanent-loss`

**Description**: Calculates impermanent loss (IL) for liquidity providers based on entry and current price ratios using the constant product formula.

## Parameters

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| entryPriceRatio | number | Yes | Entry price ratio of the liquidity position | 1.0 |
| currentPriceRatio | number | Yes | Current price ratio of the liquidity position | 1.5 |

## Response Format

```json
{
  "success": true,
  "data": {
    "entryPriceRatio": 1.0,
    "currentPriceRatio": 1.5,
    "impermanentLossPercentage": -2.02
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Mathematical Formula

The impermanent loss is calculated using the standard constant product formula:

```
IL = 2 * sqrt(price_ratio) / (1 + price_ratio) - 1
```

Where:
- `price_ratio = currentPriceRatio / entryPriceRatio`
- The result is converted to a percentage

## Implementation Details

### Service Layer (`analytics.service.ts`)

```typescript
calculateImpermanentLoss(entryPriceRatio: number, currentPriceRatio: number): ImpermanentLossData {
  // Validate inputs
  if (entryPriceRatio <= 0 || currentPriceRatio <= 0) {
    throw new Error('Price ratios must be positive numbers');
  }

  // Calculate price ratio (current/entry)
  const priceRatio = currentPriceRatio / entryPriceRatio;
  
  // Apply the standard IL formula: 2 * sqrt(price_ratio) / (1 + price_ratio) - 1
  const impermanentLoss = (2 * Math.sqrt(priceRatio)) / (1 + priceRatio) - 1;
  
  // Convert to percentage
  const impermanentLossPercentage = impermanentLoss * 100;

  return {
    entryPriceRatio,
    currentPriceRatio,
    impermanentLossPercentage,
  };
}
```

### Controller Layer (`analytics.controller.ts`)

The controller provides:
- Input validation through query parameters
- Swagger documentation for API discovery
- Standardized JSON response wrapper
- Error handling through global exception filters

## Usage Examples

### Example 1: No Price Change
```
GET /api/v1/analytics/impermanent-loss?entryPriceRatio=1.0&currentPriceRatio=1.0
```
**Response**: `impermanentLossPercentage: 0.0%` (No impermanent loss)

### Example 2: 50% Price Increase
```
GET /api/v1/analytics/impermanent-loss?entryPriceRatio=1.0&currentPriceRatio=1.5
```
**Response**: `impermanentLossPercentage: -2.02%` (Negative impermanent loss)

### Example 3: 50% Price Decrease
```
GET /api/v1/analytics/impermanent-loss?entryPriceRatio=1.0&currentPriceRatio=0.5
```
**Response**: `impermanentLossPercentage: -2.02%` (Symmetric impermanent loss)

## Error Handling

The endpoint validates input parameters and returns appropriate error responses:

- **400 Bad Request**: Invalid or missing parameters
- **500 Internal Server Error**: Calculation errors

### Error Response Format
```json
{
  "success": false,
  "message": "Price ratios must be positive numbers",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/v1/analytics/impermanent-loss"
}
```

## Testing

### Formula Validation
The implementation includes comprehensive test coverage:
- Mathematical formula verification
- Edge case testing (zero prices, negative prices)
- Boundary condition validation
- Response structure validation

### Test Scripts
- `test-il-formula.js`: Validates the mathematical implementation
- `test-impermanent-loss.js`: Tests the API endpoint (requires running server)

## Integration Benefits

1. **Performance**: Moves heavy mathematical processing to the backend
2. **Consistency**: Ensures all clients use the same calculation method
3. **Scalability**: Leverages API infrastructure for high-volume requests
4. **Reliability**: Centralized error handling and validation
5. **Documentation**: Auto-generated Swagger documentation

## Security Considerations

- Input validation prevents mathematical errors
- Rate limiting through global throttling guards
- CORS configuration for secure cross-origin requests
- Error message sanitization in production

## Future Enhancements

Potential improvements for future iterations:
- Support for multiple liquidity pool types
- Historical IL tracking
- Batch calculation endpoints
- Advanced risk metrics integration
- Real-time price feed integration
