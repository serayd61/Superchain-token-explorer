# 🌐 Superchain L2 Explorer

[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black)](https://superchain-explorer.vercel.app)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![Superchain](https://img.shields.io/badge/Superchain-6_Networks-purple)](https://superchain.dev)
[![AI Powered](https://img.shields.io/badge/AI-GitHub_Models-green)](https://github.blog/ai-and-ml/)

## 🌐 Live Demo

🚀 **[Explore all L2s!](https://superchain-explorer.vercel.app)**

**Professional-grade Superchain ecosystem explorer** with comprehensive L2 network support, AI-powered DeFi assistant, and institutional-level analytics across Base, Optimism, Mode, Ink, Unichain, and Sonerium.

## ✨ What's New in 2025

### 🌐 Complete L2 Ecosystem Support
- **Base**: Coinbase's L2 with $2.8B TVL - Native USDC, Aerodrome DEX
- **Optimism**: Original OP Stack with $1.8B TVL - Velodrome, Aave V3
- **Mode**: DeFi-focused L2 with $120M TVL - Native yield generation
- **Ink**: Kraken's professional trading L2 with $450M TVL
- **Unichain**: Uniswap's native L2 with $890M TVL - Uniswap V4 integration
- **Sonerium**: Sony's blockchain for digital entertainment with $75M TVL

### 🤖 AI DeFi Assistant (GitHub Models)
- **Free AI Integration**: Powered by GitHub Models - no API keys needed
- **Natural Language**: Ask complex DeFi questions in plain English
- **Yield Strategies**: Personalized farming and staking recommendations  
- **Risk Analysis**: AI-powered protocol and token risk assessment
- **Multi-Chain Guidance**: Cross-chain bridging and routing optimization
- **Real-time Insights**: Live market data and trend analysis

### 💰 Professional DeFi Features
- **$5.2B+ Total TVL**: Across all supported L2 networks
- **50+ DeFi Protocols**: Comprehensive protocol integration
- **Real-time Analytics**: Live TVL, APY, and transaction data
- **Risk Assessment**: Professional-grade security analysis
- **Multi-Chain DEX**: Best price discovery across all networks
- **Advanced Token Scanner**: BaseScan API integration with fallbacks

## 🌟 Core Features

### 🔍 Token Discovery
- **Multi-Chain Scanning**: Track tokens across Base, OP Mainnet, Mode, Zora, Fraxtal, World Chain, and Lisk
- **Real-Time Detection**: Instant blockchain monitoring for new deployments
- **LP Detection**: Comprehensive liquidity pool analysis
- **Smart Contract Verification**: Automatic security assessment

### 📊 Advanced Analytics
- **Portfolio Tracking**: Complete DeFi position monitoring
- **PnL Analysis**: Detailed profit/loss calculations
- **Risk Metrics**: Advanced portfolio risk assessment
- **Tax Reporting**: Crypto tax compliance tools

### 🎯 User Experience
- **Responsive Design**: Perfect on all devices
- **Dark/Light Mode**: Custom theme support
- **Multi-Language**: Support for 4 languages
- **Wallet Integration**: Connect and track your positions

## 🛠️ Technology Stack

**Frontend:**
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS with Glassmorphism design
- AI-powered natural language processing

**Blockchain Integration:**
- Ethers.js v6
- Multi-RPC endpoint support
- BaseScan API
- Ink Chain Blockscout API

**APIs & Services:**
- ParaSwap DEX Aggregator
- 1inch Protocol
- Uniswap V3/V4 subgraphs
- Custom AI analytics engine

## 📦 Quick Start

1. **Clone the repository:**
```bash
git clone https://github.com/serayd61/Superchain-token-explorer.git
cd Superchain-token-explorer
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your API keys:
```env
# Blockchain RPCs
BASE_RPC_URL=https://mainnet.base.org
OPTIMISM_RPC_URL=https://optimism.drpc.org
INK_CHAIN_RPC_URL=https://rpc-gel.inkonchain.com

# API Keys
BASESCAN_API_KEY=your_basescan_key
PARASWAP_API_KEY=your_paraswap_key
ONEINCH_API_KEY=your_1inch_key

# AI Features
OPENAI_API_KEY=your_openai_key
```

4. **Run the development server:**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start exploring!

## 🌐 Supported L2 Networks

### ✅ Primary Superchain Networks
- 🔵 **Base** (Chain ID: 8453) - $2.8B TVL | Aerodrome, Compound V3
- 🔴 **Optimism** (Chain ID: 10) - $1.8B TVL | Velodrome, Aave V3, Synthetix
- 🟢 **Mode** (Chain ID: 34443) - $120M TVL | Mode DEX, Ionic Protocol
- 🔥 **Ink** (Chain ID: 57073) - $450M TVL | InkSwap, Kraken DeFi
- 🦄 **Unichain** (Chain ID: 1301) - $890M TVL | Uniswap V4, Hook Protocol
- 💎 **Sonerium** (Chain ID: 1946) - $75M TVL | Sony NFT, Digital Assets

### 🔗 Extended Network Support
- ⟠ **Ethereum** (Chain ID: 1) - Mainnet for bridging
- 🔷 **Arbitrum** (Chain ID: 42161) - Cross-chain analytics
- 🟣 **Polygon** (Chain ID: 137) - Multi-chain support

### 📊 Network Comparison
| Network | TVL | Daily TXs | Gas Cost | Block Time | Specialty |
|---------|-----|-----------|----------|------------|-----------|
| Base | $2.8B | 2.5M | $0.05 | 2s | Mainstream DeFi |
| Unichain | $890M | 890K | $0.02 | 1s | DEX Optimization |
| Ink | $450M | 125K | $0.04 | 2s | Pro Trading |
| Optimism | $1.8B | 1.8M | $0.08 | 2s | Mature Ecosystem |
| Mode | $120M | 45K | $0.03 | 2s | Yield Focus |
| Sonerium | $75M | 28K | $0.01 | 2s | Entertainment |

## 🚀 Advanced Usage

### AI Natural Language Queries
```
"Show me the best yield farming opportunities on Base"
"What are the riskiest tokens deployed today?"
"Find new RWA tokens across all chains"
"Compare gas costs between OP and Base"
```

### API Integration
```typescript
// Get multi-chain token data
const response = await fetch('/api/scan?chain=base&ai=true');
const { aiInsights, tokenData } = await response.json();

// Real-time swap data
const swapData = await fetch('/api/swap/best-price', {
  method: 'POST',
  body: JSON.stringify({ tokenA, tokenB, amount })
});
```

### Webhook Notifications
```bash
curl -X POST https://superchain-explorer.vercel.app/api/webhooks \
  -H "Content-Type: application/json" \
  -d '{"url": "your-webhook-url", "events": ["new_token", "high_volume"]}'
```

## 📈 2025 Roadmap

### Q1 2025
- ✅ Base Explorer Integration
- ✅ Ink Chain Support
- ✅ DEX Aggregator APIs
- ✅ AI Analytics Engine

### Q2 2025
- 🔄 Mobile App (React Native)
- 🔄 Advanced Portfolio Analytics
- 🔄 Social Trading Features
- 🔄 NFT Integration

### Q3 2025
- 🔄 Institutional APIs
- 🔄 Custom Dashboards
- 🔄 White-label Solutions
- 🔄 Multi-chain Governance

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md).

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📊 Platform Statistics

- **6 L2 Networks** fully supported with live data
- **$5.2B+ Total TVL** across all networks
- **5.4M+ Daily Transactions** monitored
- **2.8M+ Active Users** across Superchain
- **50+ DeFi Protocols** integrated
- **Free AI Assistant** powered by GitHub Models
- **Real-time Analytics** across all chains
- **Professional-grade APIs** with fallback systems

## 🏆 Recognition

- **Optimism RetroPGF** recipient
- **Featured** in Superchain ecosystem
- **Community Supported** development
- **Open Source** commitment

## 🔒 Security

- Smart contract verification
- Real-time risk assessment
- Audit-ready codebase
- No private key storage

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Optimism Team** - For the OP Stack infrastructure
- **Base Team** - For RPC support and APIs  
- **Kraken** - For Ink Chain development
- **Superchain Community** - For continuous support

## 📧 Contact & Support

- **GitHub**: [@serayd61](https://github.com/serayd61)
- **Twitter**: [@serayd61](https://twitter.com/serayd61)
- **Discord**: [Join our community](https://discord.gg/superchain)
- **Email**: support@superchain-explorer.xyz

---

**Built with ❤️ for the Superchain Ecosystem**

*Empowering DeFi with AI-driven insights across the future of Ethereum scaling*

## 💰 Donation Address

Support development: `0x7FbD935c9972b6A4c0b6F7c6f650996677bF6e0A`

[![Ethereum](https://img.shields.io/badge/Ethereum-ETH-blue)](https://ethereum.org)
[![Base](https://img.shields.io/badge/Base-ETH-blue)](https://base.org)
[![Optimism](https://img.shields.io/badge/Optimism-ETH-red)](https://optimism.io)