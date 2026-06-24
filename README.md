# TradeFlow-API: Off-Chain Infrastructure

![Docker](https://img.shields.io/badge/docker-ready-blue)
![Stellar](https://img.shields.io/badge/stellar-integrated-orange)
![License](https://img.shields.io/badge/license-MIT-blue)

**TradeFlow-API** is the backend service layer for the TradeFlow protocol. It bridges the on-chain Soroban contracts with off-chain Real-World Asset (RWA) data.

## 🏗 Architecture

The service performs three critical functions:

1.  **Event Indexing:** Listens to `TradeFlow-Core` contract events (Minting, Repayment) and indexes them into PostgreSQL.
2.  **Risk Engine:** Processes PDF invoices and assigns risk scores (0-100) signed by our oracle key.
3.  **Auth:** Manages user sessions via wallet signatures (SIWE - Sign In With Ethereum/Stellar style).

## 🐳 Infrastructure

We use Docker for a consistent development environment.

```yaml
services:
  api:
    build: .
    ports: ["3000:3000"]
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: tradeflow
```

## 🔒 Security & CORS

The API is configured with strict Cross-Origin Resource Sharing (CORS) policies to ensure secure communication:

- **Allowed Origins**:
  - `http://localhost:3000` (Local Development)
  - `https://tradeflow-web.vercel.app` (Production)
- **Allowed Methods**: `GET`, `POST`, `PUT`, `PATCH`

### Verifying CORS
To verify the CORS configuration, ensure dependencies are installed and the server is running, then execute the test script:

```bash
# 1. Install dependencies
npm install

# 2. Start the server
npm run start

# 3. Run the CORS verification script (in a new terminal)
node test-cors.js
```

## 📊 API Endpoints

### TVL Statistics

Get Total Value Locked (TVL) metrics for the TradeFlow protocol.

#### `GET /api/v1/stats/tvl`

Returns the current TVL in USD with optional formatting.

**Response Format:**
```json
{
  "tvlUSD": 14500000.50,
  "lastUpdated": "2026-03-19T00:00:00Z"
}
```

**Query Parameters:**
- `format` (optional): Set to `short` to return formatted TVL (e.g., "14.5M")

**Examples:**

```bash
# Get full TVL data
curl http://localhost:3000/api/v1/stats/tvl

# Get formatted TVL for display
curl http://localhost:3000/api/v1/stats/tvl?format=short
```

**Short Format Response:**
```json
{
  "tvlUSD": "14.5M",
  "lastUpdated": "2026-03-19T00:00:00Z"
}
```

#### `GET /api/v1/stats/tvl/history`

Get historical Total Value Locked (TVL) data for the analytics dashboard.

**Response Format:**
```json
[
  {
    "date": "2026-03-26",
    "tvlUSD": 10035254.53
  },
  {
    "date": "2026-03-27",
    "tvlUSD": 10161477.57
  }
]
```

**Description:**
- Returns 30 days of historical TVL data
- Each entry contains a date string and TVL amount in USD
- Data simulates realistic protocol growth with 1.5% daily growth rate and 2% volatility
- Dates are in YYYY-MM-DD format
- TVL values are rounded to 2 decimal places

**Example:**
```bash
curl http://localhost:3000/api/v1/stats/tvl/history
```

### Admin Metrics

Aggregated protocol-wide statistics for administrative dashboards. Metrics are recomputed every **5 minutes** by a background scheduler and served from Redis cache (with PostgreSQL snapshot fallback).

All endpoints require a valid admin JWT obtained via `POST /api/v1/admin/login`.

#### `POST /api/v1/admin/login`

Authenticate with the configured `ADMIN_PASSWORD` to obtain a Bearer token.

```bash
curl -X POST http://localhost:3000/api/v1/admin/login \
  -H "Content-Type: application/json" \
  -d '{"password":"your-admin-password"}'
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### `GET /api/v1/admin/metrics/tvl`

Returns global Total Value Locked (sum of USD value across all active pools).

**Response Format:**
```json
{
  "success": true,
  "data": {
    "tvlUSD": 14500000.50,
    "poolCount": 12,
    "lastUpdated": "2026-06-24T12:00:00.000Z"
  },
  "timestamp": "2026-06-24T12:00:00.000Z"
}
```

**Example:**
```bash
curl http://localhost:3000/api/v1/admin/metrics/tvl \
  -H "Authorization: Bearer <admin-token>"
```

#### `GET /api/v1/admin/metrics/revenue`

Returns total cumulative protocol fees routed to the Treasury (derived from indexed swaps × pool fee tiers).

**Response Format:**
```json
{
  "success": true,
  "data": {
    "totalRevenueUSD": 125000.75,
    "lastUpdated": "2026-06-24T12:00:00.000Z"
  },
  "timestamp": "2026-06-24T12:00:00.000Z"
}
```

**Example:**
```bash
curl http://localhost:3000/api/v1/admin/metrics/revenue \
  -H "Authorization: Bearer <admin-token>"
```

#### `GET /api/v1/admin/metrics/active-users`

Returns distinct active trader counts for rolling 24-hour, 7-day, and 30-day windows.

**Response Format:**
```json
{
  "success": true,
  "data": {
    "activeUsers24h": 142,
    "activeUsers7d": 890,
    "activeUsers30d": 3200,
    "lastUpdated": "2026-06-24T12:00:00.000Z"
  },
  "timestamp": "2026-06-24T12:00:00.000Z"
}
```

**Example:**
```bash
curl http://localhost:3000/api/v1/admin/metrics/active-users \
  -H "Authorization: Bearer <admin-token>"
```

### Analytics Endpoints

#### `GET /api/v1/analytics/leaderboard`

Get the top traders leaderboard sorted by 7-day trading volume.

**Response Format:**
```json
[
  {
    "rank": 1,
    "walletAddress": "0x742d...8b4c",
    "volumeUSD": 850000
  },
  {
    "rank": 2,
    "walletAddress": "0x8f3a...2d1e",
    "volumeUSD": 720000
  }
]
```

### Token Verification

#### `GET /api/v1/tokens/verify/:address`

Check if a Stellar contract address is officially verified and safe to trade.

**Response Format:**
```json
{
  "isVerified": true,
  "riskLevel": "LOW"
}
```

**Parameters:**
- `address` (path): Stellar contract address to verify

### Network Fees

#### `GET /api/v1/network/fees`

Get current Stellar network fee estimates.

**Response Format:**
```json
{
  "success": true,
  "data": {
    "baseFee": 100,
    "priorityFee": 500,
    "estimatedTotal": 600
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Note:** This endpoint includes a 30-second cache header for performance optimization.

### Webhook Endpoints

#### `POST /api/v1/webhooks/stellar`

Receive Stellar network events from external indexer services.

**Request Format:**
```json
{
  "event": "contract_event",
  "contract": "stellar_contract_address",
  "timestamp": "2026-04-24T21:47:41.467Z",
  "data": {
    "custom_fields": "event_data"
  }
}
```

**Response Format:**
```json
{
  "received": true
}
```

**Description:**
- Accepts JSON payloads containing Stellar network events
- Logs incoming events to console for debugging
- Returns immediate 200 OK response to acknowledge receipt
- Uses Express JSON body parser for payload handling
- Designed for real-time dashboard updates from external indexer

**Example:**
```bash
curl -X POST http://localhost:3000/api/v1/webhooks/stellar \
  -H "Content-Type: application/json" \
  -d '{"event": "contract_event", "contract": "test_address", "timestamp": "2026-04-24T21:47:41.467Z"}'
```

### Background Jobs

The API includes a background indexer job that runs every 5 minutes to sync blockchain data. This is automatically initialized when the server starts and logs "Syncing Blockchain Data..." during each run.
