-- CreateEnum
CREATE TYPE "public"."RiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH');

-- CreateEnum
CREATE TYPE "public"."LiquidityEventType" AS ENUM ('POOL_CREATED', 'LIQUIDITY_ADDED', 'LIQUIDITY_REMOVED', 'SWAP');

-- CreateEnum
CREATE TYPE "public"."PoolType" AS ENUM ('UNISWAP_V2', 'UNISWAP_V3', 'SUSHISWAP', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."AlertType" AS ENUM ('NEW_TOKEN', 'LIQUIDITY_ADDED', 'PRICE_CHANGE', 'SAFETY_SCORE_CHANGE', 'HIGH_VOLUME');

-- CreateTable
CREATE TABLE "public"."tokens" (
    "id" TEXT NOT NULL,
    "contractAddress" TEXT NOT NULL,
    "chain" TEXT NOT NULL,
    "chainId" INTEGER NOT NULL,
    "deployer" TEXT NOT NULL,
    "blockNumber" INTEGER NOT NULL,
    "transactionHash" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "decimals" INTEGER NOT NULL,
    "totalSupply" TEXT NOT NULL,
    "hasLiquidity" BOOLEAN NOT NULL DEFAULT false,
    "v2Pools" TEXT[],
    "v3Pools" TEXT[],
    "liquidityUSD" DOUBLE PRECISION,
    "priceUSD" DOUBLE PRECISION,
    "volume24h" DOUBLE PRECISION,
    "marketCap" DOUBLE PRECISION,
    "safetyScore" INTEGER,
    "riskLevel" "public"."RiskLevel",
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isHoneypot" BOOLEAN NOT NULL DEFAULT false,
    "hasBlacklist" BOOLEAN NOT NULL DEFAULT false,
    "hasMintFunction" BOOLEAN NOT NULL DEFAULT false,
    "maxTxAmount" TEXT,
    "buyTaxPercent" DOUBLE PRECISION,
    "sellTaxPercent" DOUBLE PRECISION,
    "holderCount" INTEGER,
    "topHoldersPercent" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."scan_histories" (
    "id" TEXT NOT NULL,
    "chain" TEXT NOT NULL,
    "blockStart" INTEGER NOT NULL,
    "blockEnd" INTEGER NOT NULL,
    "tokensFound" INTEGER NOT NULL,
    "tokensWithLP" INTEGER NOT NULL,
    "successRate" DOUBLE PRECISION NOT NULL,
    "scanDuration" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scan_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."price_histories" (
    "id" TEXT NOT NULL,
    "tokenId" TEXT NOT NULL,
    "priceUSD" DOUBLE PRECISION NOT NULL,
    "volume24h" DOUBLE PRECISION,
    "marketCap" DOUBLE PRECISION,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "price_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."liquidity_events" (
    "id" TEXT NOT NULL,
    "tokenId" TEXT NOT NULL,
    "eventType" "public"."LiquidityEventType" NOT NULL,
    "poolAddress" TEXT NOT NULL,
    "poolType" "public"."PoolType" NOT NULL,
    "liquidityUSD" DOUBLE PRECISION NOT NULL,
    "txHash" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "liquidity_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."safety_analyses" (
    "id" TEXT NOT NULL,
    "tokenId" TEXT NOT NULL,
    "overallScore" INTEGER NOT NULL,
    "riskLevel" "public"."RiskLevel" NOT NULL,
    "isSourceVerified" BOOLEAN NOT NULL,
    "hasMaliciousFunctions" BOOLEAN NOT NULL,
    "isStandardERC20" BOOLEAN NOT NULL,
    "hasProxyPattern" BOOLEAN NOT NULL,
    "isOwnershipRenounced" BOOLEAN NOT NULL,
    "hasAdminFunctions" BOOLEAN NOT NULL,
    "hasBlacklistFunction" BOOLEAN NOT NULL,
    "hasPausableFunction" BOOLEAN NOT NULL,
    "hasTradingRestrictions" BOOLEAN NOT NULL,
    "maxTransactionLimit" TEXT,
    "buyTaxPercent" DOUBLE PRECISION,
    "sellTaxPercent" DOUBLE PRECISION,
    "isHoneypot" BOOLEAN NOT NULL,
    "hasStableLiquidity" BOOLEAN NOT NULL,
    "holderDistribution" TEXT NOT NULL,
    "tradingVolume24h" DOUBLE PRECISION,
    "analyzedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "analysisVersion" TEXT NOT NULL DEFAULT '1.0',

    CONSTRAINT "safety_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."deployer_stats" (
    "id" TEXT NOT NULL,
    "deployerAddress" TEXT NOT NULL,
    "tokenCount" INTEGER NOT NULL DEFAULT 0,
    "successfulTokens" INTEGER NOT NULL DEFAULT 0,
    "successRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalLiquidity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avgSafetyScore" DOUBLE PRECISION,
    "isKnownScammer" BOOLEAN NOT NULL DEFAULT false,
    "riskLevel" "public"."RiskLevel" NOT NULL DEFAULT 'MEDIUM',
    "firstSeen" TIMESTAMP(3) NOT NULL,
    "lastSeen" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "deployer_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."watchlists" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenId" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "watchlists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."alert_settings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "alertType" "public"."AlertType" NOT NULL,
    "chains" TEXT[],
    "minLiquidity" DOUBLE PRECISION,
    "maxRiskLevel" "public"."RiskLevel",
    "hasLiquidity" BOOLEAN NOT NULL DEFAULT true,
    "webhookUrl" TEXT,
    "email" TEXT,
    "telegramChatId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastTriggered" TIMESTAMP(3),

    CONSTRAINT "alert_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."system_config" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."api_usage" (
    "id" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "responseTime" INTEGER NOT NULL,
    "statusCode" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "api_usage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_ScanHistoryToToken" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ScanHistoryToToken_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "tokens_contractAddress_key" ON "public"."tokens"("contractAddress");

-- CreateIndex
CREATE INDEX "tokens_chain_timestamp_idx" ON "public"."tokens"("chain", "timestamp");

-- CreateIndex
CREATE INDEX "tokens_contractAddress_idx" ON "public"."tokens"("contractAddress");

-- CreateIndex
CREATE INDEX "tokens_deployer_idx" ON "public"."tokens"("deployer");

-- CreateIndex
CREATE INDEX "tokens_hasLiquidity_idx" ON "public"."tokens"("hasLiquidity");

-- CreateIndex
CREATE INDEX "tokens_safetyScore_idx" ON "public"."tokens"("safetyScore");

-- CreateIndex
CREATE INDEX "tokens_riskLevel_idx" ON "public"."tokens"("riskLevel");

-- CreateIndex
CREATE INDEX "scan_histories_chain_timestamp_idx" ON "public"."scan_histories"("chain", "timestamp");

-- CreateIndex
CREATE INDEX "price_histories_tokenId_timestamp_idx" ON "public"."price_histories"("tokenId", "timestamp");

-- CreateIndex
CREATE INDEX "liquidity_events_tokenId_timestamp_idx" ON "public"."liquidity_events"("tokenId", "timestamp");

-- CreateIndex
CREATE INDEX "liquidity_events_eventType_idx" ON "public"."liquidity_events"("eventType");

-- CreateIndex
CREATE INDEX "safety_analyses_tokenId_idx" ON "public"."safety_analyses"("tokenId");

-- CreateIndex
CREATE INDEX "safety_analyses_overallScore_idx" ON "public"."safety_analyses"("overallScore");

-- CreateIndex
CREATE INDEX "safety_analyses_riskLevel_idx" ON "public"."safety_analyses"("riskLevel");

-- CreateIndex
CREATE UNIQUE INDEX "deployer_stats_deployerAddress_key" ON "public"."deployer_stats"("deployerAddress");

-- CreateIndex
CREATE INDEX "deployer_stats_deployerAddress_idx" ON "public"."deployer_stats"("deployerAddress");

-- CreateIndex
CREATE INDEX "deployer_stats_successRate_idx" ON "public"."deployer_stats"("successRate");

-- CreateIndex
CREATE INDEX "deployer_stats_isKnownScammer_idx" ON "public"."deployer_stats"("isKnownScammer");

-- CreateIndex
CREATE INDEX "watchlists_userId_idx" ON "public"."watchlists"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "watchlists_userId_tokenId_key" ON "public"."watchlists"("userId", "tokenId");

-- CreateIndex
CREATE INDEX "alert_settings_userId_idx" ON "public"."alert_settings"("userId");

-- CreateIndex
CREATE INDEX "alert_settings_alertType_idx" ON "public"."alert_settings"("alertType");

-- CreateIndex
CREATE INDEX "alert_settings_isActive_idx" ON "public"."alert_settings"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "system_config_key_key" ON "public"."system_config"("key");

-- CreateIndex
CREATE INDEX "api_usage_endpoint_timestamp_idx" ON "public"."api_usage"("endpoint", "timestamp");

-- CreateIndex
CREATE INDEX "api_usage_timestamp_idx" ON "public"."api_usage"("timestamp");

-- CreateIndex
CREATE INDEX "_ScanHistoryToToken_B_index" ON "public"."_ScanHistoryToToken"("B");

-- AddForeignKey
ALTER TABLE "public"."price_histories" ADD CONSTRAINT "price_histories_tokenId_fkey" FOREIGN KEY ("tokenId") REFERENCES "public"."tokens"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."liquidity_events" ADD CONSTRAINT "liquidity_events_tokenId_fkey" FOREIGN KEY ("tokenId") REFERENCES "public"."tokens"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."safety_analyses" ADD CONSTRAINT "safety_analyses_tokenId_fkey" FOREIGN KEY ("tokenId") REFERENCES "public"."tokens"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."watchlists" ADD CONSTRAINT "watchlists_tokenId_fkey" FOREIGN KEY ("tokenId") REFERENCES "public"."tokens"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_ScanHistoryToToken" ADD CONSTRAINT "_ScanHistoryToToken_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."scan_histories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_ScanHistoryToToken" ADD CONSTRAINT "_ScanHistoryToToken_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."tokens"("id") ON DELETE CASCADE ON UPDATE CASCADE;
