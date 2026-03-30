# TradeFlow API Documentation

This folder contains documentation and resources for the TradeFlow API.

## Postman Collection

### 📁 TradeFlow-API-Postman-Collection.json

A comprehensive Postman collection containing all available API endpoints for testing the TradeFlow backend service.

#### Features Included:
- **Health & Status**: `/health` endpoint for service monitoring
- **Authentication**: Wallet-based authentication with challenge-response mechanism
- **Tokens**: Token management endpoints (planned feature)
- **Prices**: Price information endpoints (planned feature)  
- **Invoices**: Complete invoice management including PDF parsing

#### How to Use:

1. **Import the Collection:**
   - Open Postman
   - Click "Import" → "Select Files"
   - Choose `TradeFlow-API-Postman-Collection.json`

2. **Configure Environment:**
   - The collection includes variables:
     - `baseUrl`: Default set to `http://localhost:3000`
     - `jwtToken`: Set this after successful authentication

3. **Authentication Flow:**
   - First call `POST /auth/challenge` to get a nonce
   - Sign the nonce with your wallet
   - Call `POST /auth/login` with the signature to get JWT token
   - Set the returned token in the `jwtToken` variable

4. **Testing Endpoints:**
   - All protected endpoints automatically use the JWT token
   - The collection includes example request bodies
   - Descriptions explain the purpose of each endpoint

#### Current Endpoints:

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/health` | Service health check | No |
| POST | `/auth/challenge` | Get authentication nonce | No |
| POST | `/auth/login` | Authenticate with wallet | No |
| GET | `/tokens` | Get all tokens | Yes |
| GET | `/tokens/:id` | Get specific token | Yes |
| GET | `/prices` | Get all prices | Yes |
| GET | `/prices/:token` | Get token price | Yes |
| GET | `/invoices` | Get all invoices | Yes |
| POST | `/invoices` | Create new invoice | Yes |
| POST | `/invoices/parse` | Parse PDF invoice | Yes |
| GET | `/invoices/test-error` | Test error handling | Yes |

#### Notes:
- The `/tokens` and `/prices` endpoints are planned features and included as placeholders
- All invoice endpoints require JWT authentication
- The API runs on port 3000 by default
- CORS is configured for `http://localhost:3000` and `https://tradeflow-web.vercel.app`

## API Documentation

For interactive API documentation, visit: `http://localhost:3000/api/docs` (when the server is running)

This provides Swagger UI documentation with detailed schemas and testing capabilities.
