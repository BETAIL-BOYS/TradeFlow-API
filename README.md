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
 