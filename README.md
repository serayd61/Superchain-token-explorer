# 🛰️ Base Token Explorer

A dashboard that tracks **new token deployments** on the [Base](https://base.org) blockchain, including:

- ✅ Liquidity Pool (LP) status
- ✅ First-hour price action chart
- ✅ Top 5 holders per token
- ✅ CSV export
- ✅ Real-time updates (coming soon)

---

## 🚀 Features

- 🔎 Scans the last 50 blocks on Base for newly deployed contracts
- 🧪 Checks LP existence via AlienBase (UniswapV2-style) factory
- 📉 Displays sparkline chart for first-hour price movement
- 📬 Future plans: alerts via email / Telegram for new deployments

---

## 🛠️ Technologies

**Frontend**:
- [Next.js 15](https://nextjs.org/)
- TypeScript
- Tailwind CSS
- Recharts (for sparkline graphs)

**Backend**:
- Python 3
- Web3.py
- Pandas

---

## ⚙️ Setup

### 1. Clone the repo

```bash
git clone https://github.com/serayd61/base-token-explorer.git
cd base-token-explorer
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
