interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class InMemoryCache {
  private cache: Map<string, CacheItem<any>> = new Map();
  
  set<T>(key: string, data: T, ttl: number = 300000): void { // Default 5 minutes
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }
  
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }
  
  clear(): void {
    this.cache.clear();
  }
}

export const cache = new InMemoryCache();

// lib/rateLimiter.ts
interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  
  constructor(private config: RateLimitConfig) {}
  
  async checkLimit(key: string): Promise<boolean> {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;
    
    // Get existing requests for this key
    const timestamps = this.requests.get(key) || [];
    
    // Filter out old requests
    const recentRequests = timestamps.filter(ts => ts > windowStart);
    
    // Check if limit exceeded
    if (recentRequests.length >= this.config.maxRequests) {
      return false;
    }
    
    // Add current request
    recentRequests.push(now);
    this.requests.set(key, recentRequests);
    
    return true;
  }
}

// Create rate limiters for different purposes
export const rpcRateLimiter = new RateLimiter({
  windowMs: 60000, // 1 minute
  maxRequests: 30  // 30 requests per minute per chain
});

export const apiRateLimiter = new RateLimiter({
  windowMs: 60000, // 1 minute
  maxRequests: 10  // 10 requests per minute per IP
});

// lib/rpcPool.ts
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
    // Check cached provider
    const cached = this.providers.get(chain);
    if (cached) {
      try {
        await cached.getBlockNumber();
        return cached;
      } catch {
        this.providers.delete(chain);
      }
    }
    
    // Try endpoints in order
    const endpoints = this.endpoints.get(chain) || [];
    
    for (const endpoint of endpoints) {
      // Skip recently failed endpoints
      if (endpoint.failures > 3 && Date.now() - endpoint.lastFailure < 300000) {
        continue;
      }
      
      try {
        const provider = new ethers.JsonRpcProvider(endpoint.url);
        await provider.getBlockNumber(); // Test connection
        
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

// Initialize RPC pool with multiple endpoints
export const rpcPool = new RPCPool();

// Base
rpcPool.addEndpoint('base', 'https://mainnet.base.org', 1);
rpcPool.addEndpoint('base', 'https://base.publicnode.com', 2);
rpcPool.addEndpoint('base', 'https://base.meowrpc.com', 3);

// Optimism
rpcPool.addEndpoint('optimism', 'https://mainnet.optimism.io', 1);
rpcPool.addEndpoint('optimism', 'https://optimism.publicnode.com', 2);
rpcPool.addEndpoint('optimism', 'https://optimism.drpc.org', 3);

// Add more endpoints for other chains...