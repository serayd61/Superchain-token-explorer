import { ethers } from 'ethers';

// Uniswap V3 Router contract address on Base
export const UNISWAP_V3_ROUTER_ADDRESS = '0x2626664c2603336E57B271c5C0b26F421741e481';

// Popular token addresses on Base
export const BASE_TOKENS = {
  ETH: '0x4200000000000000000000000000000000000006', // WETH
  USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  DAI: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb',
  cbETH: '0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22',
} as const;

// Uniswap V3 Router ABI (simplified - key functions only)
export const UNISWAP_V3_ROUTER_ABI = [
  {
    "inputs": [
      {
        "components": [
          { "internalType": "address", "name": "tokenIn", "type": "address" },
          { "internalType": "address", "name": "tokenOut", "type": "address" },
          { "internalType": "uint24", "name": "fee", "type": "uint24" },
          { "internalType": "address", "name": "recipient", "type": "address" },
          { "internalType": "uint256", "name": "deadline", "type": "uint256" },
          { "internalType": "uint256", "name": "amountIn", "type": "uint256" },
          { "internalType": "uint256", "name": "amountOutMinimum", "type": "uint256" },
          { "internalType": "uint160", "name": "sqrtPriceLimitX96", "type": "uint160" }
        ],
        "internalType": "struct ISwapRouter.ExactInputSingleParams",
        "name": "params",
        "type": "tuple"
      }
    ],
    "name": "exactInputSingle",
    "outputs": [{ "internalType": "uint256", "name": "amountOut", "type": "uint256" }],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "tokenA", "type": "address" },
      { "internalType": "address", "name": "tokenB", "type": "address" },
      { "internalType": "uint24", "name": "fee", "type": "uint24" },
      { "internalType": "uint256", "name": "amountIn", "type": "uint256" },
      { "internalType": "uint160", "name": "sqrtPriceLimitX96", "type": "uint160" }
    ],
    "name": "quoteExactInputSingle",
    "outputs": [{ "internalType": "uint256", "name": "amountOut", "type": "uint256" }],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// ERC20 ABI (for token approvals)
export const ERC20_ABI = [
  {
    "constant": false,
    "inputs": [
      { "name": "_spender", "type": "address" },
      { "name": "_value", "type": "uint256" }
    ],
    "name": "approve",
    "outputs": [{ "name": "", "type": "bool" }],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      { "name": "_owner", "type": "address" },
      { "name": "_spender", "type": "address" }
    ],
    "name": "allowance",
    "outputs": [{ "name": "", "type": "uint256" }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [{ "name": "_owner", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "name": "balance", "type": "uint256" }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "decimals",
    "outputs": [{ "name": "", "type": "uint8" }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }
];

export interface SwapQuoteParams {
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  fee?: number; // 500, 3000, 10000 (0.05%, 0.3%, 1%)
  slippageTolerance?: number; // percentage (e.g., 0.5 for 0.5%)
}

export interface SwapQuoteResult {
  amountOut: string;
  amountOutMinimum: string;
  priceImpact: string;
  fee: string;
  route: string[];
  gasEstimate?: string;
}

export interface SwapTransaction {
  to: string;
  data: string;
  value: string;
  gasLimit: string;
  gasPrice?: string;
}

export class UniswapV3SwapService {
  private provider: ethers.Provider;
  private routerContract: ethers.Contract;

  constructor(rpcUrl?: string) {
    this.provider = new ethers.JsonRpcProvider(
      rpcUrl || process.env.BASE_RPC_URL || 'https://mainnet.base.org'
    );
    this.routerContract = new ethers.Contract(
      UNISWAP_V3_ROUTER_ADDRESS,
      UNISWAP_V3_ROUTER_ABI,
      this.provider
    );
  }

  async getSwapQuote(params: SwapQuoteParams): Promise<SwapQuoteResult> {
    try {
      const {
        tokenIn,
        tokenOut,
        amountIn,
        fee = 3000, // Default to 0.3% fee tier
        slippageTolerance = 0.5
      } = params;

      // Convert amount to wei if needed
      const amountInWei = ethers.parseUnits(amountIn, 18);

      // Get quote from Uniswap V3
      const amountOut = await this.routerContract.quoteExactInputSingle(
        tokenIn,
        tokenOut,
        fee,
        amountInWei,
        0 // sqrtPriceLimitX96 = 0 (no limit)
      );

      // Calculate minimum amount out with slippage
      const slippageMultiplier = (100 - slippageTolerance) / 100;
      const amountOutMinimum = (BigInt(amountOut.toString()) * BigInt(Math.floor(slippageMultiplier * 10000))) / BigInt(10000);

      // Calculate price impact (simplified)
      const priceImpact = this.calculatePriceImpact(amountInWei, amountOut, tokenIn, tokenOut);

      return {
        amountOut: ethers.formatUnits(amountOut, 18),
        amountOutMinimum: ethers.formatUnits(amountOutMinimum, 18),
        priceImpact: priceImpact.toFixed(2),
        fee: (fee / 10000).toString(), // Convert to percentage
        route: [tokenIn, tokenOut],
        gasEstimate: '150000' // Estimated gas
      };
    } catch (error) {
      console.error('Error getting swap quote:', error);
      throw new Error('Failed to get swap quote');
    }
  }

  async buildSwapTransaction(
    params: SwapQuoteParams,
    recipient: string,
    deadline?: number
  ): Promise<SwapTransaction> {
    try {
      const quote = await this.getSwapQuote(params);
      const {
        tokenIn,
        tokenOut,
        amountIn,
        fee = 3000,
        slippageTolerance = 0.5
      } = params;

      const amountInWei = ethers.parseUnits(amountIn, 18);
      const amountOutMinimumWei = ethers.parseUnits(quote.amountOutMinimum, 18);
      const deadlineTimestamp = deadline || Math.floor(Date.now() / 1000) + 1800; // 30 minutes

      // Build the swap parameters
      const swapParams = {
        tokenIn,
        tokenOut,
        fee,
        recipient,
        deadline: deadlineTimestamp,
        amountIn: amountInWei,
        amountOutMinimum: amountOutMinimumWei,
        sqrtPriceLimitX96: 0
      };

      // Encode the function call
      const iface = new ethers.Interface(UNISWAP_V3_ROUTER_ABI);
      const data = iface.encodeFunctionData('exactInputSingle', [swapParams]);

      // Handle ETH swaps (value field)
      const isETHIn = tokenIn === BASE_TOKENS.ETH;
      const value = isETHIn ? amountInWei.toString() : '0';

      return {
        to: UNISWAP_V3_ROUTER_ADDRESS,
        data,
        value,
        gasLimit: '200000',
        gasPrice: await this.getGasPrice()
      };
    } catch (error) {
      console.error('Error building swap transaction:', error);
      throw new Error('Failed to build swap transaction');
    }
  }

  async checkTokenAllowance(
    tokenAddress: string,
    owner: string,
    spender: string = UNISWAP_V3_ROUTER_ADDRESS
  ): Promise<string> {
    try {
      const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, this.provider);
      const allowance = await tokenContract.allowance(owner, spender);
      return ethers.formatUnits(allowance, 18);
    } catch (error) {
      console.error('Error checking token allowance:', error);
      return '0';
    }
  }

  async buildApprovalTransaction(
    tokenAddress: string,
    amount: string,
    spender: string = UNISWAP_V3_ROUTER_ADDRESS
  ): Promise<SwapTransaction> {
    try {
      const amountWei = ethers.parseUnits(amount, 18);
      const iface = new ethers.Interface(ERC20_ABI);
      const data = iface.encodeFunctionData('approve', [spender, amountWei]);

      return {
        to: tokenAddress,
        data,
        value: '0',
        gasLimit: '50000',
        gasPrice: await this.getGasPrice()
      };
    } catch (error) {
      console.error('Error building approval transaction:', error);
      throw new Error('Failed to build approval transaction');
    }
  }

  async getTokenBalance(tokenAddress: string, account: string): Promise<string> {
    try {
      if (tokenAddress === BASE_TOKENS.ETH) {
        const balance = await this.provider.getBalance(account);
        return ethers.formatEther(balance);
      } else {
        const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, this.provider);
        const balance = await tokenContract.balanceOf(account);
        return ethers.formatUnits(balance, 18);
      }
    } catch (error) {
      console.error('Error getting token balance:', error);
      return '0';
    }
  }

  private calculatePriceImpact(
    amountIn: bigint,
    amountOut: bigint,
    tokenIn: string,
    tokenOut: string
  ): number {
    // Simplified price impact calculation
    // In a real implementation, you'd use pool reserves and pricing formulas
    const ratio = Number(amountOut) / Number(amountIn);
    
    // Mock expected rate based on token pair
    let expectedRate = 1;
    if (tokenIn === BASE_TOKENS.ETH && tokenOut === BASE_TOKENS.USDC) {
      expectedRate = 2100; // 1 ETH = ~2100 USDC
    } else if (tokenIn === BASE_TOKENS.USDC && tokenOut === BASE_TOKENS.ETH) {
      expectedRate = 1 / 2100;
    }
    
    const priceImpact = Math.abs((ratio - expectedRate) / expectedRate) * 100;
    return Math.min(priceImpact, 5); // Cap at 5% for demo
  }

  private async getGasPrice(): Promise<string> {
    try {
      const gasPrice = await this.provider.getFeeData();
      return gasPrice.gasPrice?.toString() || '1000000000'; // 1 gwei fallback
    } catch (error) {
      return '1000000000'; // 1 gwei fallback
    }
  }

  // Helper function to get common trading pairs
  static getTradingPairs(): Array<{ symbol: string; address: string; decimals: number }> {
    return [
      { symbol: 'WETH', address: BASE_TOKENS.ETH, decimals: 18 },
      { symbol: 'USDC', address: BASE_TOKENS.USDC, decimals: 6 },
      { symbol: 'DAI', address: BASE_TOKENS.DAI, decimals: 18 },
      { symbol: 'cbETH', address: BASE_TOKENS.cbETH, decimals: 18 }
    ];
  }

  // Helper to get fee tier recommendations
  static getFeeTierRecommendation(tokenA: string, tokenB: string): number {
    // Stablecoin pairs typically use 0.05% (500)
    const stablecoins = [BASE_TOKENS.USDC, BASE_TOKENS.DAI];
    if (stablecoins.includes(tokenA as any) && stablecoins.includes(tokenB as any)) {
      return 500;
    }
    
    // ETH pairs typically use 0.3% (3000)
    if (tokenA === BASE_TOKENS.ETH || tokenB === BASE_TOKENS.ETH) {
      return 3000;
    }
    
    // Exotic pairs use 1% (10000)
    return 10000;
  }
}

export const uniswapV3SwapService = new UniswapV3SwapService();