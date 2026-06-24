-- AlterTable
ALTER TABLE "pools" ADD COLUMN "reserveA" TEXT,
ADD COLUMN "reserveB" TEXT,
ADD COLUMN "tvlUsd" DECIMAL(20,8),
ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "lastSyncedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "protocol_metrics_snapshots" (
    "id" TEXT NOT NULL,
    "globalTvlUsd" DECIMAL(20,8) NOT NULL,
    "totalRevenueUsd" DECIMAL(20,8) NOT NULL,
    "activeUsers24h" INTEGER NOT NULL,
    "activeUsers7d" INTEGER NOT NULL,
    "activeUsers30d" INTEGER NOT NULL,
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "protocol_metrics_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "protocol_metrics_snapshots_computedAt_idx" ON "protocol_metrics_snapshots"("computedAt");

-- CreateIndex
CREATE INDEX "trades_userAddress_timestamp_idx" ON "trades"("userAddress", "timestamp");
