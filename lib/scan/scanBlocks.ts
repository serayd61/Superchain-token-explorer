import { ethers } from 'ethers';
import { getTokenMetadata } from './metadata';
import { checkLiquidity } from './liquidity';
import type { TokenContract } from './types';
import { recordTokenDeployment } from './db';

export async function scanBlocks(
  provider: ethers.Provider,
  chainConfig: {
    name: string;
    chainId: number;
    isOpStack: boolean;
    explorerUrl: string;
    wethAddress: string;
    uniswapV2Factory: string;
    uniswapV3Factory: string;
  },
  startBlock: number,
  latestBlock: number
): Promise<TokenContract[]> {
  const results: TokenContract[] = [];
  const blockNumbers = Array.from({ length: latestBlock - startBlock + 1 }, (_, i) => startBlock + i);

  await Promise.all(blockNumbers.map(async blockNumber => {
    try {
      const block = await provider.getBlock(blockNumber, true);
      if (!block || !block.transactions) return;

      const txHashes = block.transactions as string[];
      await Promise.all(txHashes.map(async txHash => {
        if (typeof txHash !== 'string') return;
        const tx = await provider.getTransaction(txHash);
        if (!tx || tx.to !== null) return;

        const receipt = await provider.getTransactionReceipt(tx.hash);
        if (!receipt || !receipt.contractAddress) return;

        const [metadata, lpInfo] = await Promise.all([
          getTokenMetadata(receipt.contractAddress, provider),
          checkLiquidity(receipt.contractAddress, provider, chainConfig)
        ]);

        if (metadata.name === 'Unknown' && metadata.symbol === 'UNKNOWN') return;

        const result: TokenContract = {
          chain: chainConfig.name,
          chain_id: chainConfig.chainId,
          is_op_stack: chainConfig.isOpStack,
          block: blockNumber,
          hash: tx.hash,
          deployer: tx.from,
          contract_address: receipt.contractAddress,
          timestamp: new Date(block.timestamp * 1000).toISOString(),
          metadata,
          lp_info: lpInfo,
          explorer_url: `${chainConfig.explorerUrl}/address/${receipt.contractAddress}`
        };

        results.push(result);
        await recordTokenDeployment(result);
        console.log(`Found token: ${metadata.symbol} at ${receipt.contractAddress}`);
      }));
    } catch (error) {
      console.error(`Error processing block ${blockNumber}:`, error);
    }
  }));

  return results;
}
