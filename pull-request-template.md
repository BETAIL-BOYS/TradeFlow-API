# Pull Request: feat: Create an API endpoint for historical impermanent loss calculation

## Description
This PR implements a dedicated backend endpoint for calculating impermanent loss (IL) risk for liquidity providers. The endpoint accepts entry and current price ratios and algorithmically calculates the percentage of impermanent loss based on the constant product formula.

## Changes Made

### ✅ New Features
- **GET endpoint**: `/api/v1/analytics/impermanent-loss`
- **Mathematical implementation**: Standard IL formula `2 * sqrt(price_ratio) / (1 + price_ratio) - 1`
- **Input validation**: Ensures positive price ratios
- **Standardized response**: JSON wrapper with success flag and timestamp
- **Swagger documentation**: Complete API documentation with examples

### ✅ Files Modified
- `src/analytics/analytics.service.ts`: Added `calculateImpermanentLoss()` method
- `src/analytics/analytics.controller.ts`: Added `getImpermanentLoss()` endpoint
- `src/analytics/analytics.module.ts`: No changes needed (existing structure)

### ✅ Files Added
- `test-impermanent-loss.js`: Endpoint integration tests
- `test-il-formula.js`: Mathematical formula validation
- `IMPERMANENT_LOSS_ENDPOINT.md`: Comprehensive documentation

## API Usage

### Request
```bash
GET /api/v1/analytics/impermanent-loss?entryPriceRatio=1.0&currentPriceRatio=1.5
```

### Response
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

## Testing

### Formula Verification
- ✅ No price change = 0% IL
- ✅ Price increase/decrease symmetry
- ✅ Input validation (zero/negative prices)
- ✅ Mathematical accuracy

### Endpoint Testing
- ✅ Response structure validation
- ✅ Error handling
- ✅ Swagger documentation
- ✅ CORS compatibility

## Benefits

1. **Performance**: Heavy mathematical processing moved to backend
2. **Consistency**: Standardized calculation across all clients
3. **Scalability**: Leverages API infrastructure for high-volume requests
4. **Power User Value**: Advanced liquidity providers can hedge positions
5. **Developer Experience**: Well-documented endpoint with examples

## Security & Validation

- Input validation prevents mathematical errors
- Global exception handling for consistent error responses
- CORS configuration maintained
- Rate limiting through existing throttling guards

## Documentation

Complete API documentation available at:
- Swagger UI: `http://localhost:3000/api/docs`
- Technical documentation: `IMPERMANENT_LOSS_ENDPOINT.md`

## Testing Instructions

1. Start the development server: `npm run start:dev`
2. Test the formula validation: `node test-il-formula.js`
3. Test the endpoint: `node test-impermanent-loss.js`
4. View Swagger documentation: Navigate to `/api/docs`

## Checklist

- [x] Code follows existing project patterns
- [x] Mathematical implementation is correct
- [x] Input validation implemented
- [x] Error handling in place
- [x] Swagger documentation complete
- [x] Test scripts provided
- [x] Documentation created
- [x] No breaking changes to existing endpoints

## Issue Resolution

Resolves #88: "feat: Create an API endpoint for historical impermanent loss calculation"

This implementation provides advanced liquidity providers with the tools they need to calculate impermanent loss risk before depositing funds, moving heavy mathematical processing off the frontend and into the scalable API layer.
