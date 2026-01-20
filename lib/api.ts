/**
 * API client for FastAPI backend
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export interface Chain {
  id: number;
  name: string;
  slug: string;
  chain_id: number;
  rpc_url?: string;
  is_active: boolean;
  created_at: string;
}

export interface Token {
  id: number;
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  chain_id: number;
  chain: {
    id: number;
    name: string;
    slug: string;
    chain_id: number;
  };
  price_usd?: number;
  volume_24h?: number;
  market_cap?: number;
  has_liquidity: boolean;
  liquidity_usd?: number;
  is_verified: boolean;
  is_trending: boolean;
  safety_score?: number;
  risk_level?: string;
  created_at_on_chain?: string;
  created_at: string;
  updated_at: string;
}

export interface TokenListResponse {
  items: Token[];
  total: number;
  limit: number;
  offset: number;
  has_more: boolean;
}

export interface PriceHistoryPoint {
  timestamp: string;
  price_usd: number;
  volume_24h?: number;
  market_cap?: number;
}

export interface PriceHistoryResponse {
  token_id: number;
  range: string;
  data: PriceHistoryPoint[];
}

export interface TokenListQuery {
  chain?: string;
  search?: string;
  sort?: string;
  limit?: number;
  offset?: number;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Chains
  async getChains(): Promise<Chain[]> {
    return this.request<Chain[]>('/api/chains');
  }

  // Tokens
  async getTokens(params?: TokenListQuery): Promise<TokenListResponse> {
    const queryParams = new URLSearchParams();
    if (params?.chain) queryParams.append('chain', params.chain);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.sort) queryParams.append('sort', params.sort);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    const queryString = queryParams.toString();
    const endpoint = `/api/tokens${queryString ? `?${queryString}` : ''}`;
    return this.request<TokenListResponse>(endpoint);
  }

  async getTrendingTokens(limit: number = 20): Promise<Token[]> {
    return this.request<Token[]>(`/api/tokens/trending?limit=${limit}`);
  }

  async getToken(tokenId: number): Promise<Token> {
    return this.request<Token>(`/api/tokens/${tokenId}`);
  }

  async getTokenPriceHistory(
    tokenId: number,
    range: '24h' | '7d' | '30d' = '24h'
  ): Promise<PriceHistoryResponse> {
    return this.request<PriceHistoryResponse>(
      `/api/tokens/${tokenId}/price-history?range=${range}`
    );
  }

  // Health
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.request('/health');
  }
}

export const apiClient = new ApiClient();
