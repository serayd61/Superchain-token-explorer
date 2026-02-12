interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

export class RateLimiter {
  private requests: Map<string, number[]> = new Map();

  constructor(private config: RateLimitConfig) {}

  async checkLimit(key: string): Promise<boolean> {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    const timestamps = this.requests.get(key) || [];
    const recentRequests = timestamps.filter(ts => ts > windowStart);

    if (recentRequests.length >= this.config.maxRequests) {
      return false;
    }

    recentRequests.push(now);
    this.requests.set(key, recentRequests);

    return true;
  }
}

export const rpcRateLimiter = new RateLimiter({
  windowMs: 60000,
  maxRequests: 30
});

export const apiRateLimiter = new RateLimiter({
  windowMs: 60000,
  maxRequests: 10
});
