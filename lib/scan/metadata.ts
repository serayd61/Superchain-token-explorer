import { ethers } from 'ethers';

export async function getTokenMetadata(
  contractAddress: string,
  provider: ethers.Provider
): Promise<{ name: string; symbol: string; decimals: number; total_supply: number }> {
  try {
    const contract = new ethers.Contract(
      contractAddress,
      [
        'function name() view returns (string)',
        'function symbol() view returns (string)',
        'function decimals() view returns (uint8)',
        'function totalSupply() view returns (uint256)'
      ],
      provider
    );

    const [name, symbol, decimals, totalSupply] = await Promise.all([
      contract.name().catch(() => 'Unknown'),
      contract.symbol().catch(() => 'UNKNOWN'),
      contract.decimals().catch(() => 18),
      contract.totalSupply().catch(() => '0')
    ]);

    return {
      name,
      symbol,
      decimals: Number(decimals),
      total_supply: Number(ethers.formatUnits(totalSupply, decimals))
    };
  } catch (error) {
    console.error('Error getting token metadata:', error);
    return {
      name: 'Unknown',
      symbol: 'UNKNOWN',
      decimals: 18,
      total_supply: 0
    };
  }
}
