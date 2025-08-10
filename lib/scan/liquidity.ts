import { ethers } from 'ethers';

export async function checkLiquidity(
  tokenAddress: string,
  provider: ethers.Provider,
  chainConfig: {
    uniswapV2Factory: string;
    uniswapV3Factory: string;
    wethAddress: string;
  }
): Promise<{ v2: boolean; v3: boolean; status: string }> {
  try {
    let v2Exists = false;
    let v3Exists = false;

    try {
      const v2Factory = new ethers.Contract(
        chainConfig.uniswapV2Factory,
        ['function getPair(address tokenA, address tokenB) view returns (address pair)'],
        provider
      );
      const pairAddress = await v2Factory.getPair(tokenAddress, chainConfig.wethAddress);
      v2Exists = pairAddress !== '0x0000000000000000000000000000000000000000';
    } catch (error) {
      console.error('V2 check error:', error);
    }

    try {
      const v3Factory = new ethers.Contract(
        chainConfig.uniswapV3Factory,
        ['function getPool(address tokenA, address tokenB, uint24 fee) view returns (address pool)'],
        provider
      );
      const feeTiers = [500, 3000, 10000];
      for (const fee of feeTiers) {
        const poolAddress = await v3Factory.getPool(tokenAddress, chainConfig.wethAddress, fee);
        if (poolAddress !== '0x0000000000000000000000000000000000000000') {
          v3Exists = true;
          break;
        }
      }
    } catch (error) {
      console.error('V3 check error:', error);
    }

    return {
      v2: v2Exists,
      v3: v3Exists,
      status: v2Exists || v3Exists ? 'YES' : 'NO'
    };
  } catch (error) {
    console.error('Error checking liquidity:', error);
    return { v2: false, v3: false, status: 'ERROR' };
  }
}
