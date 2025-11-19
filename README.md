<div align="center">

# 🎴 DegenScore

### **Generate Your Solana Trading Card in Seconds**

Transform your wallet history into a beautiful, shareable trading card.

[![Solana](https://img.shields.io/badge/Solana-mainnet-blueviolet?logo=solana)](https://solana.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](./LICENSE)

</div>

---

## 🔥 What is DegenScore?

DegenScore analyzes your Solana trading history and generates a **beautiful trading card** with your real stats:

- 💰 Total Profit/Loss
- 📊 Win Rate %
- 🏆 DegenScore (0-100)
- 🎯 Best Trade
- 💎 Tokens Held
- 🏅 Achievements & Badges

Share your card on Twitter/Telegram to flex your trading skills!

---

## ✨ Features

### 🎯 Real Analytics
- ✅ **Actual P&L Calculation** - Real profit/loss from your trades
- ✅ **Win Rate** - Based on actual closed positions
- ✅ **Trading Volume** - Total SOL traded
- ✅ **Best/Worst Trades** - Track your wins and losses
- ✅ **Current Holdings** - Tokens in your wallet

### 🎨 Beautiful Cards
- ✅ **Tier System** - LEGENDARY, MASTER, DIAMOND, PLATINUM, GOLD, SILVER, BRONZE
- ✅ **Gradients & Glows** - Premium visual effects based on your score
- ✅ **Achievements** - Unlock badges as you trade
- ✅ **Social Share** - One-click share to Twitter/Telegram

### 🏆 Competitive
- ✅ **Leaderboard** - Global rankings by score, volume, win rate
- ✅ **Compare Wallets** - Head-to-head trading stats
- ✅ **Public Profiles** - Show off your trading prowess

---

## 🚀 Quick Start

### For Users
1. Visit [https://your-deployment-url.vercel.app](https://your-deployment-url.vercel.app)
2. Connect your Solana wallet (Phantom, Backpack, Solflare)
3. Click "Generate Card"
4. Download & share!

### For Developers

#### Prerequisites
- Node.js 18+ ([Download](https://nodejs.org/))
- PostgreSQL database (or Supabase account)
- Helius API Key ([Free tier](https://helius.dev) - 1M credits/month)

#### Installation

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/DegenScore-Card.git
cd DegenScore-Card

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
```

Edit `.env.local` with your credentials:

```env
# Required
DATABASE_URL="postgresql://user:pass@host:5432/dbname"
HELIUS_API_KEY="your_helius_api_key"

# Optional (for premium features)
UPSTASH_REDIS_REST_URL="your_redis_url"
UPSTASH_REDIS_REST_TOKEN="your_redis_token"
```

```bash
# 4. Set up database
npx prisma generate
npx prisma db push

# 5. Start development server
npm run dev

# 6. Open http://localhost:3000
```

#### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
# Then deploy to production
vercel --prod
```

---

## 🏗️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes (serverless)
- **Database**: PostgreSQL + Prisma ORM
- **Cache**: Upstash Redis (optional)
- **Blockchain**: Solana mainnet via Helius RPC
- **Wallet**: @solana/wallet-adapter-react
- **Deployment**: Vercel

---

## 📊 How The Score Works

The **DegenScore (0-100)** is calculated from:

| Factor | Weight | Description |
|--------|--------|-------------|
| **Profit/Loss** | 35% | Total SOL gained/lost |
| **Win Rate** | 25% | % of profitable trades |
| **Trading Volume** | 15% | Total SOL traded |
| **Experience** | 15% | Total number of trades |
| **Best Trade** | 10% | Highest % gain on a single trade |

Score ranges:
- **90-100**: LEGENDARY 👑
- **80-89**: MASTER 💎
- **70-79**: DIAMOND 💠
- **60-69**: PLATINUM ⚡
- **50-59**: GOLD 🌟
- **30-49**: SILVER 🥈
- **0-29**: BRONZE 🥉

---

## 🎯 Roadmap

### ✅ V1 - MVP (Current)
- [x] Wallet analysis
- [x] Card generation
- [x] Leaderboard
- [x] Social sharing
- [x] Multi-language support (EN, ES)

### 🔄 V2 - Monetization (Next 2 weeks)
- [ ] Premium cards (no watermark, HD, custom themes)
- [ ] Referral program (earn rewards)
- [ ] Profile customization
- [ ] Achievement system expansion

### 🚀 V3 - Growth (Q1 2025)
- [ ] Mobile app (PWA)
- [ ] NFT minting (dynamic cards)
- [ ] Token gating for premium features
- [ ] API for third-party integrations

---

## 💼 Monetization

Current pricing:
- **Free**: Basic card with watermark
- **Premium** (1 SOL ~$140): No watermark, HD quality, custom profile, referral bonuses

Future revenue streams:
- API subscriptions for developers
- White-label for DAOs/projects
- Sponsored badges

---

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 🛡️ Security

- ✅ Input validation on all endpoints
- ✅ Rate limiting (Redis + in-memory fallback)
- ✅ Secure wallet verification
- ✅ XSS prevention
- ✅ TypeScript strict mode

Found a vulnerability? Email: security@degenscore.com

---

## 📜 License

MIT License - see [LICENSE](./LICENSE) file

---

## 📞 Contact

- **Twitter**: [@DegenScore](https://twitter.com/DegenScore)
- **Discord**: [discord.gg/degenscore](https://discord.gg/degenscore)
- **Email**: hello@degenscore.com

---

<div align="center">

### ⭐ Star us on GitHub if you like this project!

**Built with ❤️ on Solana**

</div>
