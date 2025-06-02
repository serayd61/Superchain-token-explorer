# 🚀 Superchain Token Explorer

A real-time dashboard for tracking new token deployments across the **Optimism Superchain** ecosystem. Monitor liquidity pools, analyze smart contracts, and discover new opportunities across 7+ OP Stack chains.

![Superchain Token Explorer](https://img.shields.io/badge/Superchain-Enabled-red)
![OP Stack](https://img.shields.io/badge/OP_Stack-7_Chains-green)
![License](https://img.shields.io/badge/license-MIT-blue)

## 🌟 Features

- **🔴 Multi-Chain Support**: Track tokens across Base, OP Mainnet, Mode, Zora, Fraxtal, World Chain, and Lisk
- **⚡ Real-Time Detection**: Scan blockchain blocks for new token deployments
- **💧 LP Detection**: Check Uniswap V2/V3 liquidity pool status
- **📊 Token Analytics**: View token metadata, supply, and deployment details
- **🔗 Explorer Integration**: Direct links to blockchain explorers
- **🎯 OP Stack Focus**: Filter to show only Superchain deployments

## 🛠️ Technology Stack

**Frontend:**
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Recharts for data visualization

**Blockchain Integration:**
- Ethers.js v6
- Multi-RPC endpoint support
- Event log analysis

## 📦 Installation

1. **Clone the repository:**
```bash
git clone https://github.com/YOUR_USERNAME/base-token-explorer.git
cd base-token-explorer
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your RPC URLs (optional - defaults provided):
```env
BASE_RPC_URL=https://mainnet.base.org
OPTIMISM_RPC_URL=https://optimism.drpc.org
# ... other chains
```

4. **Run the development server:**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## 🌐 Supported Chains

### OP Stack Chains (Superchain)
- 🔵 **Base** - Coinbase's L2
- 🔴 **OP Mainnet** - Optimism mainnet
- 🟢 **Mode** - DeFi-focused L2
- 🟣 **Zora** - NFT-focused L2
- 🟠 **Fraxtal** - Frax Finance L2
- 🌍 **World Chain** - Worldcoin L2
- 🔷 **Lisk** - Application-specific L2

### Other Chains
- ⟠ **Ethereum** - Mainnet
- 🔷 **Arbitrum** - Arbitrum One
- 🟣 **Polygon** - Polygon PoS

## 🚀 Usage

1. **Select a blockchain** from the dropdown
2. **Set the number of blocks** to scan (1-100)
3. **Click "Start Scan"** to find new token deployments
4. **View results** in the table with token details
5. **Optional**: Toggle "OP Stack Only" to filter Superchain tokens

## 🔧 API Endpoints

### Scan for Tokens
```
GET /api/scan?chain={chain}&blocks={number}&opStackOnly={boolean}
```

**Parameters:**
- `chain`: Chain name (base, optimism, ethereum, etc.)
- `blocks`: Number of blocks to scan (1-100)
- `opStackOnly`: Filter for OP Stack chains only

**Response:**
```json
{
  "success": true,
  "chain": "base",
  "blocks_scanned": 10,
  "results": [...],
  "summary": {
    "total_contracts": 5,
    "lp_contracts": 2,
    "success_rate": 40.0
  }
}
```

## 🏗️ Architecture

```
├── app/
│   ├── api/
│   │   └── scan/
│   │       └── route.ts    # Blockchain scanning API
│   ├── page.tsx           # Main page
│   └── layout.tsx         # App layout
├── components/
│   ├── TokenScanner.tsx   # Main scanner component
│   └── ChainSelector.tsx  # Chain selection dropdown
├── backend/
│   └── *.py              # Python scripts (legacy)
└── public/               # Static assets
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🎯 Optimism Ecosystem

This project is built specifically for the **Optimism Superchain** ecosystem and aims to:
- Support Superchain growth and adoption
- Provide valuable tools for developers and traders
- Contribute to the OP Stack ecosystem
- Apply for grants through the OP Atlas program

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Optimism team for the OP Stack
- Base team for RPC infrastructure
- All Superchain builders and contributors

## 📧 Contact

**Built with ❤️ for the Superchain**
=======
- GitHub: [@serayd61](https://github.com/serayd61)
- Twitter: [@serayd61](https://twitter.com/serayd61)

