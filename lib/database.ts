// lib/database.ts
import { TokenContract } from '@/components/TokenScanner';

// Database interfaces
export interface TokenDeployment {
  id?: string;
  chain: string;
  chain_id: number;
  is_op_stack: boolean;
  block: number;
  hash: string;
  deployer: string;
  contract_address: string;
  timestamp: string;
  metadata: {
    name: string;
    symbol: string;
    decimals: number;
    total_supply: number;
  };
  lp_info: {
    v2: boolean;
    v3: boolean;
    status: string;
  };
  dex_data?: {
    price_usd: string;
    volume_24h: string;
    liquidity: string;
    dex: string;
  };
  explorer_url: string;
  created_at?: string;
}

export interface ScanHistory {
  id?: string;
  chain: string;
  blocks_scanned: number;
  total_contracts: number;
  lp_contracts: number;
  success_rate: number;
  scan_time: string;
  scan_duration_ms?: number;
  error_message?: string;
  created_at?: string;
}

export interface DeployerStats {
  deployer: string;
  chain: string;
  total_deployments: number;
  successful_deployments: number;
  success_rate: number;
  total_liquidity: number;
  first_deployment: string;
  last_deployment: string;
  updated_at: string;
}

// In-memory storage (can be replaced with real database later)
class InMemoryDatabase {
  private tokenDeployments: TokenDeployment[] = [];
  private scanHistory: ScanHistory[] = [];
  private deployerStats: Map<string, DeployerStats> = new Map();

  // Token Deployment methods
  async saveTokenDeployment(deployment: TokenContract): Promise<void> {
    const dbDeployment: TokenDeployment = {
      id: `${deployment.chain}_${deployment.contract_address}`,
      chain: deployment.chain,
      chain_id: deployment.chain_id,
      is_op_stack: deployment.is_op_stack,
      block: deployment.block,
      hash: deployment.hash,
      deployer: deployment.deployer,
      contract_address: deployment.contract_address,
      timestamp: deployment.timestamp,
      metadata: deployment.metadata,
      lp_info: deployment.lp_info,
      dex_data: deployment.dex_data,
      explorer_url: deployment.explorer_url,
      created_at: new Date().toISOString()
    };

    // Check if already exists
    const existingIndex = this.tokenDeployments.findIndex(
      d => d.contract_address === deployment.contract_address && d.chain === deployment.chain
    );

    if (existingIndex >= 0) {
      this.tokenDeployments[existingIndex] = dbDeployment;
    } else {
      this.tokenDeployments.push(dbDeployment);
    }

    // Update deployer stats
    await this.updateDeployerStats(deployment);

    console.log(`✅ Saved token deployment: ${deployment.metadata.symbol} on ${deployment.chain}`);
  }

  async getTokenDeployments(filters?: {
    chain?: string;
    isOpStack?: boolean;
    hasLiquidity?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<TokenDeployment[]> {
    let filtered = [...this.tokenDeployments];

    if (filters?.chain) {
      filtered = filtered.filter(d => d.chain === filters.chain);
    }

    if (filters?.isOpStack !== undefined) {
      filtered = filtered.filter(d => d.is_op_stack === filters.isOpStack);
    }

    if (filters?.hasLiquidity !== undefined) {
      filtered = filtered.filter(d => 
        filters.hasLiquidity ? d.lp_info.status === 'YES' : d.lp_info.status !== 'YES'
      );
    }

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Apply pagination
    const offset = filters?.offset || 0;
    const limit = filters?.limit || 100;
    
    return filtered.slice(offset, offset + limit);
  }

  async getTokenByAddress(chain: string, address: string): Promise<TokenDeployment | null> {
    const token = this.tokenDeployments.find(
      d => d.chain === chain && d.contract_address.toLowerCase() === address.toLowerCase()
    );
    return token || null;
  }

  // Scan History methods
  async saveScanHistory(history: {
    chain: string;
    blocks_scanned: number;
    total_contracts: number;
    lp_contracts: number;
    success_rate: number;
    scan_time: string;
    scan_duration_ms?: number;
    error_message?: string;
  }): Promise<void> {
    const dbHistory: ScanHistory = {
      id: `${history.chain}_${Date.now()}`,
      ...history,
      created_at: new Date().toISOString()
    };

    this.scanHistory.push(dbHistory);

    // Keep only last 1000 records per chain
    const chainHistory = this.scanHistory.filter(h => h.chain === history.chain);
    if (chainHistory.length > 1000) {
      const toRemove = chainHistory.length - 1000;
      chainHistory.sort((a, b) => new Date(a.scan_time).getTime() - new Date(b.scan_time).getTime());
      
      for (let i = 0; i < toRemove; i++) {
        const index = this.scanHistory.findIndex(h => h.id === chainHistory[i].id);
        if (index >= 0) {
          this.scanHistory.splice(index, 1);
        }
      }
    }

    console.log(`✅ Saved scan history for ${history.chain}: ${history.total_contracts} contracts found`);
  }

  async getScanHistory(chain?: string, limit?: number): Promise<ScanHistory[]> {
    let filtered = [...this.scanHistory];

    if (chain) {
      filtered = filtered.filter(h => h.chain === chain);
    }

    // Sort by scan_time (newest first)
    filtered.sort((a, b) => new Date(b.scan_time).getTime() - new Date(a.scan_time).getTime());

    return filtered.slice(0, limit || 100);
  }

  // Deployer Stats methods
  private async updateDeployerStats(deployment: TokenContract): Promise<void> {
    const key = `${deployment.deployer}_${deployment.chain}`;
    const existing = this.deployerStats.get(key);

    if (existing) {
      existing.total_deployments++;
      if (deployment.lp_info.status === 'YES') {
        existing.successful_deployments++;
      }
      existing.success_rate = (existing.successful_deployments / existing.total_deployments) * 100;
      existing.last_deployment = deployment.timestamp;
      
      // Update liquidity info if available
      if (deployment.dex_data?.liquidity) {
        const liquidityValue = parseFloat(deployment.dex_data.liquidity);
        if (!isNaN(liquidityValue)) {
          existing.total_liquidity += liquidityValue;
        }
      }
      
      existing.updated_at = new Date().toISOString();
    } else {
      const newStats: DeployerStats = {
        deployer: deployment.deployer,
        chain: deployment.chain,
        total_deployments: 1,
        successful_deployments: deployment.lp_info.status === 'YES' ? 1 : 0,
        success_rate: deployment.lp_info.status === 'YES' ? 100 : 0,
        total_liquidity: deployment.dex_data?.liquidity ? parseFloat(deployment.dex_data.liquidity) || 0 : 0,
        first_deployment: deployment.timestamp,
        last_deployment: deployment.timestamp,
        updated_at: new Date().toISOString()
      };
      
      this.deployerStats.set(key, newStats);
    }
  }

  async getDeployerStats(options?: {
    chain?: string;
    minDeployments?: number;
    sortBy?: 'total_deployments' | 'success_rate' | 'total_liquidity';
    limit?: number;
  }): Promise<DeployerStats[]> {
    let stats = Array.from(this.deployerStats.values());

    if (options?.chain) {
      stats = stats.filter(s => s.chain === options.chain);
    }

    // TypeScript hatasını düzelt - Non-null assertion kullan
    if (options?.minDeployments !== undefined) {
      stats = stats.filter(s => s.total_deployments >= options.minDeployments!);
    }

    // Sort
    const sortBy = options?.sortBy || 'total_deployments';
    stats.sort((a, b) => b[sortBy] - a[sortBy]);

    return stats.slice(0, options?.limit || 50);
  }

  // Analytics methods
  async getChainStats(): Promise<{
    totalTokens: number;
    totalWithLiquidity: number;
    chainsData: { chain: string; count: number; withLiquidity: number; isOpStack: boolean }[];
  }> {
    const totalTokens = this.tokenDeployments.length;
    const totalWithLiquidity = this.tokenDeployments.filter(d => d.lp_info.status === 'YES').length;

    const chainCounts = new Map<string, { count: number; withLiquidity: number; isOpStack: boolean }>();
    
    this.tokenDeployments.forEach(deployment => {
      const current = chainCounts.get(deployment.chain) || { count: 0, withLiquidity: 0, isOpStack: deployment.is_op_stack };
      current.count++;
      if (deployment.lp_info.status === 'YES') {
        current.withLiquidity++;
      }
      chainCounts.set(deployment.chain, current);
    });

    const chainsData = Array.from(chainCounts.entries()).map(([chain, data]) => ({
      chain,
      ...data
    }));

    return {
      totalTokens,
      totalWithLiquidity,
      chainsData
    };
  }

  async getRecentActivity(hours: number = 24): Promise<TokenDeployment[]> {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    return this.tokenDeployments
      .filter(d => new Date(d.timestamp) > cutoff)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  // Clear methods (for testing/development)
  async clearTokenDeployments(): Promise<void> {
    this.tokenDeployments = [];
    console.log('🗑️ Cleared all token deployments');
  }

  async clearScanHistory(): Promise<void> {
    this.scanHistory = [];
    console.log('🗑️ Cleared all scan history');
  }

  async clearDeployerStats(): Promise<void> {
    this.deployerStats.clear();
    console.log('🗑️ Cleared all deployer stats');
  }

  // Export data (for backup/analysis)
  async exportData(): Promise<{
    tokenDeployments: TokenDeployment[];
    scanHistory: ScanHistory[];
    deployerStats: DeployerStats[];
    exportedAt: string;
  }> {
    return {
      tokenDeployments: this.tokenDeployments,
      scanHistory: this.scanHistory,
      deployerStats: Array.from(this.deployerStats.values()),
      exportedAt: new Date().toISOString()
    };
  }

  // Import data (for restore)
  async importData(data: {
    tokenDeployments?: TokenDeployment[];
    scanHistory?: ScanHistory[];
    deployerStats?: DeployerStats[];
  }): Promise<void> {
    if (data.tokenDeployments) {
      this.tokenDeployments = data.tokenDeployments;
    }
    if (data.scanHistory) {
      this.scanHistory = data.scanHistory;
    }
    if (data.deployerStats) {
      this.deployerStats = new Map(data.deployerStats.map(stat => 
        [`${stat.deployer}_${stat.chain}`, stat]
      ));
    }
    console.log('📥 Data imported successfully');
  }
}

// Create singleton instance
const database = new InMemoryDatabase();

// Export functions for API usage
export const saveTokenDeployment = (deployment: TokenContract) => 
  database.saveTokenDeployment(deployment);

export const saveScanHistory = (history: {
  chain: string;
  blocks_scanned: number;
  total_contracts: number;
  lp_contracts: number;
  success_rate: number;
  scan_time: string;
  scan_duration_ms?: number;
  error_message?: string;
}) => database.saveScanHistory(history);

export const getTokenDeployments = (filters?: {
  chain?: string;
  isOpStack?: boolean;
  hasLiquidity?: boolean;
  limit?: number;
  offset?: number;
}) => database.getTokenDeployments(filters);

export const getTokenByAddress = (chain: string, address: string) => 
  database.getTokenByAddress(chain, address);

export const getScanHistory = (chain?: string, limit?: number) => 
  database.getScanHistory(chain, limit);

export const getDeployerStats = (options?: {
  chain?: string;
  minDeployments?: number;
  sortBy?: 'total_deployments' | 'success_rate' | 'total_liquidity';
  limit?: number;
}) => database.getDeployerStats(options);

export const getChainStats = () => database.getChainStats();
export const getRecentActivity = (hours?: number) => database.getRecentActivity(hours);

// Development/testing functions
export const clearTokenDeployments = () => database.clearTokenDeployments();
export const clearScanHistory = () => database.clearScanHistory();
export const clearDeployerStats = () => database.clearDeployerStats();
export const exportData = () => database.exportData();
export const importData = (data: any) => database.importData(data);

// Database instance for direct access
export default database;
