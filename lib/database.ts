import { TokenContract } from '@/components/TokenScanner';
import prisma from './prisma';
import { AlertSettings, Prisma } from '@prisma/client';

// Notification interfaces used by webhook routes
export interface NotificationFilter {
  chains: string[];
  minLiquidity?: number;
  hasLiquidity: boolean;
  tokenNamePattern?: string;
  tokenSymbolPattern?: string;
}

export interface Subscription {
  id: string;
  filters: NotificationFilter;
  webhookUrl?: string;
  email?: string;
  telegram?: string;
  createdAt: string;
  lastNotified?: string;
}

// Token Deployment persistence
export async function saveTokenDeployment(deployment: TokenContract): Promise<void> {
  const liquidity = deployment.dex_data?.liquidity ? parseFloat(deployment.dex_data.liquidity) : 0;

  await prisma.token.upsert({
    where: { contractAddress: deployment.contract_address },
    update: {
      chain: deployment.chain,
      chainId: deployment.chain_id,
      deployer: deployment.deployer,
      blockNumber: deployment.block,
      transactionHash: deployment.hash,
      timestamp: new Date(deployment.timestamp),
      name: deployment.metadata.name,
      symbol: deployment.metadata.symbol,
      decimals: deployment.metadata.decimals,
      totalSupply: deployment.metadata.total_supply.toString(),
      hasLiquidity: deployment.lp_info.status === 'YES',
      liquidityUSD: liquidity,
      priceUSD: deployment.dex_data?.price_usd ? parseFloat(deployment.dex_data.price_usd) : undefined,
      volume24h: deployment.dex_data?.volume_24h ? parseFloat(deployment.dex_data.volume_24h) : undefined,
      updatedAt: new Date(),
    },
    create: {
      contractAddress: deployment.contract_address,
      chain: deployment.chain,
      chainId: deployment.chain_id,
      deployer: deployment.deployer,
      blockNumber: deployment.block,
      transactionHash: deployment.hash,
      timestamp: new Date(deployment.timestamp),
      name: deployment.metadata.name,
      symbol: deployment.metadata.symbol,
      decimals: deployment.metadata.decimals,
      totalSupply: deployment.metadata.total_supply.toString(),
      hasLiquidity: deployment.lp_info.status === 'YES',
      liquidityUSD: liquidity,
      priceUSD: deployment.dex_data?.price_usd ? parseFloat(deployment.dex_data.price_usd) : undefined,
      volume24h: deployment.dex_data?.volume_24h ? parseFloat(deployment.dex_data.volume_24h) : undefined,
    },
  });

  await updateDeployerStats(deployment);
}

export async function getTokenDeployments(filters?: {
  chain?: string;
  hasLiquidity?: boolean;
  limit?: number;
  offset?: number;
}) {
  return prisma.token.findMany({
    where: {
      chain: filters?.chain,
      hasLiquidity: filters?.hasLiquidity,
    },
    orderBy: { timestamp: 'desc' },
    skip: filters?.offset || 0,
    take: filters?.limit || 100,
  });
}

export async function getTokenByAddress(chain: string, address: string) {
  return prisma.token.findFirst({
    where: { chain, contractAddress: address },
  });
}

// Scan History persistence
export async function saveScanHistory(history: {
  chain: string;
  blocks_scanned: number;
  total_contracts: number;
  lp_contracts: number;
  success_rate: number;
  scan_time: string;
  scan_duration_ms?: number;
  error_message?: string;
}): Promise<void> {
  await prisma.scanHistory.create({
    data: {
      chain: history.chain,
      blockStart: 0,
      blockEnd: history.blocks_scanned,
      tokensFound: history.total_contracts,
      tokensWithLP: history.lp_contracts,
      successRate: history.success_rate,
      scanDuration: history.scan_duration_ms ? Math.floor(history.scan_duration_ms / 1000) : 0,
      timestamp: new Date(history.scan_time),
    },
  });
}

export async function getScanHistory(chain?: string, limit: number = 100) {
  return prisma.scanHistory.findMany({
    where: { chain },
    orderBy: { timestamp: 'desc' },
    take: limit,
  });
}

// Deployer statistics
async function updateDeployerStats(deployment: TokenContract) {
  const liquidity = deployment.dex_data?.liquidity ? parseFloat(deployment.dex_data.liquidity) : 0;
  const existing = await prisma.deployerStats.findUnique({
    where: { deployerAddress: deployment.deployer },
  });

  if (existing) {
    const tokenCount = existing.tokenCount + 1;
    const successfulTokens = existing.successfulTokens + (deployment.lp_info.status === 'YES' ? 1 : 0);
    await prisma.deployerStats.update({
      where: { deployerAddress: deployment.deployer },
      data: {
        tokenCount,
        successfulTokens,
        successRate: (successfulTokens / tokenCount) * 100,
        totalLiquidity: existing.totalLiquidity + liquidity,
        lastSeen: new Date(deployment.timestamp),
      },
    });
  } else {
    await prisma.deployerStats.create({
      data: {
        deployerAddress: deployment.deployer,
        tokenCount: 1,
        successfulTokens: deployment.lp_info.status === 'YES' ? 1 : 0,
        successRate: deployment.lp_info.status === 'YES' ? 100 : 0,
        totalLiquidity: liquidity,
        firstSeen: new Date(deployment.timestamp),
        lastSeen: new Date(deployment.timestamp),
      },
    });
  }
}

export async function getDeployerStats(options?: {
  minDeployments?: number;
  sortBy?: 'total_deployments' | 'success_rate' | 'total_liquidity';
  limit?: number;
}) {
  const orderField: Record<string, Prisma.SortOrder> = {
    total_deployments: 'desc',
    success_rate: 'desc',
    total_liquidity: 'desc',
  };
  const sortField =
    options?.sortBy === 'success_rate'
      ? 'successRate'
      : options?.sortBy === 'total_liquidity'
      ? 'totalLiquidity'
      : 'tokenCount';

  return prisma.deployerStats.findMany({
    where: options?.minDeployments
      ? { tokenCount: { gte: options.minDeployments } }
      : undefined,
    orderBy: { [sortField]: 'desc' },
    take: options?.limit || 50,
  });
}

// Subscription helpers using AlertSettings model
export async function createSubscription(data: {
  filters: NotificationFilter;
  webhookUrl?: string;
  email?: string;
  telegram?: string;
}): Promise<Subscription> {
  const created = await prisma.alertSettings.create({
    data: {
      userId: 'anonymous',
      alertType: 'NEW_TOKEN',
      chains: data.filters.chains,
      minLiquidity: data.filters.minLiquidity,
      hasLiquidity: data.filters.hasLiquidity,
      webhookUrl: data.webhookUrl,
      email: data.email,
      telegramChatId: data.telegram,
    },
  });

  return {
    id: created.id,
    filters: data.filters,
    webhookUrl: created.webhookUrl || undefined,
    email: created.email || undefined,
    telegram: created.telegramChatId || undefined,
    createdAt: created.createdAt.toISOString(),
    lastNotified: created.lastTriggered?.toISOString(),
  };
}

export async function listSubscriptions(): Promise<Subscription[]> {
  const subs = await prisma.alertSettings.findMany({ where: { isActive: true } });
  return subs.map((s) => ({
    id: s.id,
    filters: {
      chains: s.chains,
      minLiquidity: s.minLiquidity || undefined,
      hasLiquidity: s.hasLiquidity,
    },
    webhookUrl: s.webhookUrl || undefined,
    email: s.email || undefined,
    telegram: s.telegramChatId || undefined,
    createdAt: s.createdAt.toISOString(),
    lastNotified: s.lastTriggered?.toISOString(),
  }));
}

export async function deleteSubscription(id: string) {
  await prisma.alertSettings.delete({ where: { id } });
}

export async function getChainStats() {
  const tokens = await prisma.token.findMany({ select: { chain: true, hasLiquidity: true } });
  const totalTokens = tokens.length;
  const totalWithLiquidity = tokens.filter((t) => t.hasLiquidity).length;
  const map = new Map<string, { count: number; withLiquidity: number }>();
  tokens.forEach((t) => {
    const entry = map.get(t.chain) || { count: 0, withLiquidity: 0 };
    entry.count += 1;
    if (t.hasLiquidity) entry.withLiquidity += 1;
    map.set(t.chain, entry);
  });
  const chainsData = Array.from(map.entries()).map(([chain, data]) => ({
    chain,
    count: data.count,
    withLiquidity: data.withLiquidity,
    isOpStack: false,
  }));
  return { totalTokens, totalWithLiquidity, chainsData };
}

export async function getRecentActivity(hours: number = 24) {
  const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
  return prisma.token.findMany({
    where: { timestamp: { gt: cutoff } },
    orderBy: { timestamp: 'desc' },
  });
}

export async function clearTokenDeployments() {
  await prisma.token.deleteMany();
}

export async function clearScanHistory() {
  await prisma.scanHistory.deleteMany();
}

export async function clearDeployerStats() {
  await prisma.deployerStats.deleteMany();
}

export async function exportData() {
  return {
    tokenDeployments: await prisma.token.findMany(),
    scanHistory: await prisma.scanHistory.findMany(),
    deployerStats: await prisma.deployerStats.findMany(),
    exportedAt: new Date().toISOString(),
  };
}

export async function importData(data: {
  tokenDeployments?: Prisma.TokenCreateManyInput[];
  scanHistory?: Prisma.ScanHistoryCreateManyInput[];
  deployerStats?: Prisma.DeployerStatsCreateManyInput[];
}) {
  if (data.tokenDeployments) {
    await prisma.token.createMany({ data: data.tokenDeployments, skipDuplicates: true });
  }
  if (data.scanHistory) {
    await prisma.scanHistory.createMany({ data: data.scanHistory, skipDuplicates: true });
  }
  if (data.deployerStats) {
    await prisma.deployerStats.createMany({ data: data.deployerStats, skipDuplicates: true });
  }
}
