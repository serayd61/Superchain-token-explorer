export const chainExplorers: Record<string, string> = {
  base: 'https://basescan.org',
  optimism: 'https://optimistic.etherscan.io',
  mode: 'https://explorer.mode.network',
  zora: 'https://explorer.zora.energy',
  arbitrum: 'https://arbiscan.io',
  polygon: 'https://polygonscan.com',
  ethereum: 'https://etherscan.io'
};

export const getExplorerUrl = (chain: string): string | undefined => {
  return chainExplorers[chain];
};
