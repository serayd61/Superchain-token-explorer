import { ethers } from 'ethers';

interface RPCEndpoint {
  url: string;
  priority: number;
  failures: number;
  lastFailure: number;
}

export class RPCPool {
  private endpoints: Map<string, RPCEndpoint[]> = new Map();
  private providers: Map<string, ethers.JsonRpcProvider> = new Map();

  addEndpoint(chain: string, url: string, priority: number = 1): void {
    const endpoints = this.endpoints.get(chain) || [];
    endpoints.push({ url, priority, failures: 0, lastFailure: 0 });
    endpoints.sort((a, b) => b.priority - a.priority);
    this.endpoints.set(chain, endpoints);
  }

  async getProvider(chain: string): Promise<ethers.JsonRpcProvider | null> {
    const cached = this.providers.get(chain);
    if (cached) {
      try {
        await cached.getBlockNumber();
        return cached;
      } catch {
        this.providers.delete(chain);
      }
    }

    const endpoints = this.endpoints.get(chain) || [];

    for (const endpoint of endpoints) {
      if (endpoint.failures > 3 && Date.now() - endpoint.lastFailure < 300000) {
        continue;
      }

      try {
        const provider = new ethers.JsonRpcProvider(endpoint.url);
        await provider.getBlockNumber();

        this.providers.set(chain, provider);
        endpoint.failures = 0;
        return provider;
      } catch {
        endpoint.failures++;
        endpoint.lastFailure = Date.now();
      }
    }

    return null;
  }
}

export const rpcPool = new RPCPool();

rpcPool.addEndpoint('base', 'https://mainnet.base.org', 1);
rpcPool.addEndpoint('base', 'https://base.publicnode.com', 2);
rpcPool.addEndpoint('base', 'https://base.meowrpc.com', 3);

rpcPool.addEndpoint('optimism', 'https://mainnet.optimism.io', 1);
rpcPool.addEndpoint('optimism', 'https://optimism.publicnode.com', 2);
rpcPool.addEndpoint('optimism', 'https://optimism.drpc.org', 3);
