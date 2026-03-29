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

### Background Jobs

The API includes a background indexer job that runs every 5 minutes to sync blockchain data. This is automatically initialized when the server starts and logs "Syncing Blockchain Data..." during each run.
