# TypeORM Migrations Setup

This document explains how to use TypeORM migrations in the TradeFlow API project.

## Overview

Migrations provide a way to safely manage database schema changes without losing data. This replaces the dangerous `synchronize: true` option which should never be used in production.

## Files Created

- `src/datasource.ts` - TypeORM configuration for CLI commands
- `src/entities/user.entity.ts` - User entity definition
- `src/entities/invoice.entity.ts` - Invoice entity definition  
- `src/migrations/` - Directory containing migration files
- `src/migration-runner.ts` - Manual migration runner for testing

## Available Scripts

```bash
# Generate a new migration
npm run migration:generate -- MigrationName

# Run all pending migrations
npm run migration:run

# Revert the last migration
npm run migration:revert

# Run migrations manually (for testing)
npm run migration:manual
```

## Initial Migration

The initial migration (`1708665600000-InitialMigration.ts`) creates:

### Users Table
- `id` (UUID, primary key)
- `publicKey` (varchar, unique)
- `email` (varchar, nullable)
- `isActive` (boolean, default: true)
- `createdAt` (timestamp)
- `updatedAt` (timestamp)

### Invoices Table
- `id` (int, primary key, auto-increment)
- `amount` (decimal 10,2)
- `date` (timestamp)
- `customer` (varchar)
- `description` (text, nullable)
- `riskScore` (int, default: 0)
- `status` (varchar, enum: Pending/Approved/High Risk/Rejected)
- `processedAt` (timestamp, default: CURRENT_TIMESTAMP)
- `userId` (uuid, foreign key to users, nullable)
- `createdAt` (timestamp)
- `updatedAt` (timestamp)

### Relationships
- Foreign key from `invoices.userId` to `users.id`
- Index on `invoices.status` for performance

## Migration Process

1. **Make entity changes** - Modify entity files in `src/entities/`
2. **Generate migration** - Run `npm run migration:generate -- DescriptionOfChanges`
3. **Review migration** - Check the generated migration file
4. **Run migration** - Execute `npm run migration:run`
5. **Verify** - Check that tables are created/updated correctly

## Schema Migrations Table

TypeORM automatically creates a `migrations` table to track which migrations have been applied. This prevents re-running the same migration and ensures proper ordering.

## Production Safety

- `synchronize: false` is set in both `datasource.ts` and `database.providers.ts`
- All schema changes must go through migrations
- Migrations are reversible with `up()` and `down()` methods
- Foreign key constraints maintain data integrity

## Environment Variables

Configure database connection using these environment variables:

```bash
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_DATABASE=tradeflow
```

## Docker Setup

When using Docker Compose, the database will be available at `localhost:5432` and migrations can be run after the container starts:

```bash
docker-compose up -d db
npm run migration:run
```
