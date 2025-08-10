import { PrismaClient } from '@prisma/client';
import { TokenContract } from '@/components/TokenScanner';

// Maintain a single PrismaClient instance across hot reloads in development
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// ---------------------------------------------------------------------------
// Token DAO
// ---------------------------------------------------------------------------
export const tokenDAO = {
  /**
   * Save or update a token deployment using Prisma
   */
  async save(deployment: TokenContract) {
    const data = {
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
      v2Pools: deployment.lp_info.v2 ? [] : [],
      v3Pools: deployment.lp_info.v3 ? [] : [],
      liquidityUSD: deployment.dex_data
        ? Number(deployment.dex_data.liquidity)
        : undefined,
      priceUSD: deployment.dex_data
        ? Number(deployment.dex_data.price_usd)
        : undefined,
      volume24h: deployment.dex_data
        ? Number(deployment.dex_data.volume_24h)
        : undefined,
    };

    await prisma.token.upsert({
      where: { contractAddress: deployment.contract_address },
      update: data,
      create: { contractAddress: deployment.contract_address, ...data },
    });
  },

  /** Find a token by chain and address */
  async findByAddress(chain: string, address: string) {
    return prisma.token.findFirst({
      where: { chain, contractAddress: address },
    });
  },

  /** List token deployments with optional filters */
  async list(filters?: {
    chain?: string;
    hasLiquidity?: boolean;
    limit?: number;
    offset?: number;
  }) {
    const { chain, hasLiquidity, limit = 50, offset = 0 } = filters || {};
    return prisma.token.findMany({
      where: {
        ...(chain && { chain }),
        ...(typeof hasLiquidity === 'boolean' && { hasLiquidity }),
      },
      take: limit,
      skip: offset,
      orderBy: { timestamp: 'desc' },
    });
  },
};

// ---------------------------------------------------------------------------
// Scan History DAO
// ---------------------------------------------------------------------------
export const scanHistoryDAO = {
  /**
   * Record a scan history entry
   */
  async save(history: {
    chain: string;
    blocks_scanned: number;
    total_contracts: number;
    lp_contracts: number;
    success_rate: number;
    scan_time: string;
    scan_duration_ms?: number;
    error_message?: string;
  }) {
    await prisma.scanHistory.create({
      data: {
        chain: history.chain,
        blockStart: 0,
        blockEnd: history.blocks_scanned,
        tokensFound: history.total_contracts,
        tokensWithLP: history.lp_contracts,
        successRate: history.success_rate,
        scanDuration: Math.floor((history.scan_duration_ms ?? 0) / 1000),
        timestamp: new Date(history.scan_time),
      },
    });
  },

  /** Retrieve recent scan history */
  async list(chain?: string, limit: number = 50) {
    return prisma.scanHistory.findMany({
      where: { ...(chain && { chain }) },
      take: limit,
      orderBy: { timestamp: 'desc' },
    });
  },
};

