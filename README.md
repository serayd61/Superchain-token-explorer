# 🚀 Superchain Token Explorer

[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black)](https://superchain-explorer.vercel.app)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![OP Stack](https://img.shields.io/badge/OP_Stack-7_Chains-red)](https://stack.optimism.io/)

A real-time dashboard for tracking new token deployments across the **Optimism Superchain** ecosystem.

## 🌐 Live Demo

🚀 **[Try it live!](https://superchain-explorer.vercel.app)**

## 🌟 Features

- **Multi-chain support** across Base, OP Mainnet, Mode, Zora, Fraxtal, World Chain, and Lisk
- **Real-time detection** of new ERC-20 token contracts
- **Liquidity pool checks** for Uniswap V2/V3 pairs
- **Token analytics** with metadata and explorer links
- **Superchain filter** to show only OP Stack deployments

## 🚀 Quick Start

```bash
git clone https://github.com/serayd61/superchain-token-explorer
cd superchain-token-explorer
npm install
cp .env.local.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Architecture

- `app/` – Next.js App Router pages and API routes
- `components/` – Reusable React components
- `lib/` – Chain utilities and helper functions
- `prisma/` – Prisma schema and migrations
- `scripts/` – Maintenance scripts (e.g., environment checks)
- `public/` – Static assets

## 🤝 Contributing

1. Fork the repository and create a feature branch.
2. Run `npm run lint` and ensure all checks pass.
3. Commit your changes with clear messages.
4. Open a pull request describing your work.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📧 Contact

GitHub: [@serayd61](https://github.com/serayd61)
Twitter: [@serayd61](https://twitter.com/serayd61)
