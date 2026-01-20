/**
 * React Query hooks for token data
 */
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import {
  apiClient,
  Token,
  TokenListResponse,
  TokenListQuery,
  PriceHistoryResponse,
} from '../api';

// Query keys
export const tokenKeys = {
  all: ['tokens'] as const,
  lists: () => [...tokenKeys.all, 'list'] as const,
  list: (params?: TokenListQuery) => [...tokenKeys.lists(), params] as const,
  details: () => [...tokenKeys.all, 'detail'] as const,
  detail: (id: number) => [...tokenKeys.details(), id] as const,
  trending: (limit?: number) => [...tokenKeys.all, 'trending', limit] as const,
  priceHistory: (id: number, range?: string) =>
    [...tokenKeys.detail(id), 'price-history', range] as const,
};

// Hooks
export function useChains() {
  return useQuery({
    queryKey: ['chains'],
    queryFn: () => apiClient.getChains(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useTokens(params?: TokenListQuery) {
  return useQuery<TokenListResponse>({
    queryKey: tokenKeys.list(params),
    queryFn: () => apiClient.getTokens(params),
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useTrendingTokens(limit: number = 20) {
  return useQuery<Token[]>({
    queryKey: tokenKeys.trending(limit),
    queryFn: () => apiClient.getTrendingTokens(limit),
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
}

export function useToken(tokenId: number) {
  return useQuery<Token>({
    queryKey: tokenKeys.detail(tokenId),
    queryFn: () => apiClient.getToken(tokenId),
    enabled: !!tokenId,
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function usePriceHistory(
  tokenId: number,
  range: '24h' | '7d' | '30d' = '24h'
) {
  return useQuery<PriceHistoryResponse>({
    queryKey: tokenKeys.priceHistory(tokenId, range),
    queryFn: () => apiClient.getTokenPriceHistory(tokenId, range),
    enabled: !!tokenId,
    staleTime: 60 * 1000, // 1 minute
  });
}
