/**
 * React Query hooks for token data with real-time updates
 */
import { useQuery } from '@tanstack/react-query';
import {
  apiClient,
  Token,
  TokenListResponse,
  TokenListQuery,
  PriceHistoryResponse,
  Chain,
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
  return useQuery<Chain[]>({
    queryKey: ['chains'],
    queryFn: () => apiClient.getChains(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

export function useTokens(params?: TokenListQuery) {
  return useQuery<TokenListResponse>({
    queryKey: tokenKeys.list(params),
    queryFn: () => apiClient.getTokens(params),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 30 * 1000, // Refetch every 30 seconds for real-time prices
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

export function useTrendingTokens(limit: number = 20) {
  return useQuery<Token[]>({
    queryKey: tokenKeys.trending(limit),
    queryFn: () => apiClient.getTrendingTokens(limit),
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 60 * 1000, // Refetch every minute
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

export function useToken(tokenId: number) {
  return useQuery<Token>({
    queryKey: tokenKeys.detail(tokenId),
    queryFn: () => apiClient.getToken(tokenId),
    enabled: !!tokenId && tokenId > 0,
    staleTime: 15 * 1000, // 15 seconds
    refetchInterval: 15 * 1000, // Refetch every 15 seconds for real-time price
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

export function usePriceHistory(
  tokenId: number,
  range: '24h' | '7d' | '30d' = '24h'
) {
  return useQuery<PriceHistoryResponse>({
    queryKey: tokenKeys.priceHistory(tokenId, range),
    queryFn: () => apiClient.getTokenPriceHistory(tokenId, range),
    enabled: !!tokenId && tokenId > 0,
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 60 * 1000, // Refetch every minute
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

// Helper hook to check if data is stale
export function useIsDataFresh(lastUpdated: Date | string | undefined): boolean {
  if (!lastUpdated) return false;
  const lastUpdate = new Date(lastUpdated);
  const now = new Date();
  const diffMs = now.getTime() - lastUpdate.getTime();
  return diffMs < 60 * 1000; // Data is fresh if less than 1 minute old
}
