-- CreateTable
CREATE TABLE "subscriptions" (
  "id" TEXT NOT NULL,
  "filters" JSONB NOT NULL,
  "webhookUrl" TEXT,
  "email" TEXT,
  "telegram" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastNotified" TIMESTAMP(3),
  CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_logs" (
  "id" TEXT NOT NULL,
  "subscriptionId" TEXT NOT NULL,
  "channel" TEXT NOT NULL,
  "error" TEXT NOT NULL,
  "attempts" INTEGER NOT NULL DEFAULT 1,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "notification_logs_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "notification_logs_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "notification_logs_subscriptionId_idx" ON "notification_logs"("subscriptionId");
