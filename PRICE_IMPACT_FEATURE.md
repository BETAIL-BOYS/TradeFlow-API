# Price Impact Calculation Feature

## Overview
This feature implements a price impact estimation endpoint for the TradeFlow API. It calculates the potential slippage a user might experience when trading large amounts of tokens.

## Implementation Details

### Endpoint
- **URL**: `POST /api/v1/swap/estimate`
- **Description**: Estimates price impact based on trade amount

### Request Body
```json
{
  "amountIn": 5000
}
```

### Response Format
```json
{
  "amountIn": 5000,
  "priceImpact": "1.33%",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Business Logic
- **amountIn < 1000**: Returns 0.1% price impact
- **amountIn > 10000**: Returns 2.5% price impact  
- **1000 ≤ amountIn ≤ 10000**: Linear interpolation between 0.1% and 2.5%

### Error Handling
- Invalid (negative or zero) amounts return 400 Bad Request

## Files Created/Modified

### New Files
1. `src/swap/swap.controller.ts` - REST controller with Swagger documentation
2. `src/swap/swap.service.ts` - Business logic for price impact calculation
3. `src/swap/swap.module.ts` - NestJS module configuration
4. `test-swap-endpoint.js` - Test script for endpoint validation

### Modified Files
1. `src/app.module.ts` - Added SwapModule to imports

## Testing

### Manual Testing
1. Start the server: `npm run start:dev`
2. Run the test script: `node test-swap-endpoint.js`

### Test Cases
- Small trade (500): Expected 0.1%
- Large trade (15000): Expected 2.5%
- Medium trade (5500): Expected ~1.33% (interpolated)
- Invalid input (-100): Expected 400 error

## API Documentation
The endpoint is fully documented with Swagger annotations and available at `/api/docs` when the server is running.

## Future Enhancements
- Real pool size integration
- Dynamic price impact calculation based on liquidity
- Multi-token support
- Historical price impact tracking
