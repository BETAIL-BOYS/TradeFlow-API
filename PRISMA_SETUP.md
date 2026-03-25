# Prisma ORM Setup for TradeFlow API

This document outlines the Prisma ORM implementation for PostgreSQL database integration in the TradeFlow API project.

## Installation

The following dependencies have been added to `package.json`:
- `@prisma/client`: Prisma client for database queries
- `prisma`: Prisma CLI for database management

## Database Schema

The Prisma schema is defined in `prisma/schema.prisma` with the following models:

### Trade Model
```prisma
model Trade {
  id          String   @id @default(cuid())
  poolId      String
  userAddress String
  amountIn    String   // Using String to handle decimal values precisely
  amountOut   String   // Using String to handle decimal values precisely
  timestamp   DateTime @default(now())
  
  @@map("trades")
}
```

### Pool Model
```prisma
model Pool {
  id          String   @id @default(cuid())
  address     String   @unique
  tokenA      String
  tokenB      String
  fee         String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  trades Trade[]
  
  @@map("pools")
}
```

### Token Model
```prisma
model Token {
  id          String   @id @default(cuid())
  address     String   @unique
  symbol      String
  name        String
  decimals    Int
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@map("tokens")
}
```

## Environment Configuration

Add the following to your `.env` file:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/tradeflow?schema=public"
```

The `.env.example` file has been updated with the required database configuration.

## Available Scripts

The following npm scripts have been added for Prisma management:

- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:push` - Push schema to database
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio

## Usage

### Prisma Service

A global `PrismaService` is available throughout the application:

```typescript
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class YourService {
  constructor(private prisma: PrismaService) {}

  async createTrade(data: CreateTradeDto) {
    return this.prisma.trade.create({
      data,
    });
  }
}
```

### Trade Service

A `TradeService` has been created with common operations:

- `createTrade()` - Create a new trade record
- `getTradesByUser()` - Get all trades for a specific user
- `getTradesByPool()` - Get all trades for a specific pool
- `getAllTrades()` - Get all trades with pagination
- `createPool()` - Create a new pool
- `getPoolByAddress()` - Get pool by address with trades
- `createToken()` - Create a new token
- `getTokenByAddress()` - Get token by address

## Database Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Generate Prisma client:
   ```bash
   npm run prisma:generate
   ```

3. Push schema to database:
   ```bash
   npm run prisma:push
   ```

4. (Optional) Create and run migrations:
   ```bash
   npm run prisma:migrate
   ```

## Integration with Existing TypeORM

The Prisma implementation runs alongside the existing TypeORM setup. Both can be used simultaneously:

- Prisma uses `DATABASE_URL` environment variable
- TypeORM uses individual `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE` variables

## Notes

- String types are used for `amountIn` and `amountOut` to handle decimal values precisely
- All models include appropriate timestamps for auditing
- The Prisma module is globally available throughout the application
- Database relationships are properly defined (Pool -> Trade)
