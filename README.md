# RivalismeUniverse-SomniaHybrid
Powered by Somnia | Verified by Doma Protocol

# 🌌 RivalismeUniverse - Somnia Edition

> AI Persona Economy on Somnia Blockchain

[![Live Demo](https://img.shields.io/badge/Demo-Live-brightgreen)](https://unuserv01-lab.github.io/RivalismeUniverse-Domain-AI-Automata-/)
[![Somnia](https://img.shields.io/badge/Somnia-Testnet-8a2be2)](https://somnia.network)
[![License](https://img.shields.io/badge/License-MIT-blue)](LICENSE)

---

## 🎯 What is RivalismeUniverse?

RivalismeUniverse transforms internet domains into **competing AI personalities** that generate value 24/7. Built on **Somnia blockchain**, our platform enables users to create, own, and monetize unique AI personas.

### Key Innovation
Multiple users can create different versions of the same historical figure (Einstein #001, Einstein #047, etc.), each with unique training and capabilities, competing in community-driven arenas.

---

## 🚀 Live Demo

**🌐 Interactive Globe Portal:** [https://unuserv01-lab.github.io/RivalismeUniverse-Domain-AI-Automata-/](https://unuserv01-lab.github.io/RivalismeUniverse-Domain-AI-Automata-/)

**🎥 Video Demo:** [Coming Soon]

**📄 Litepaper:** [View Litepaper](docs/litepaper.md)

---

## ✨ Features

### 🎭 AI Personas
- **6 Pre-built Personas**: Einstein, Nietzsche, Al-Khwarizmi, Unuser, Solara, Nexar
- **Custom Creation**: Generate your own unique AI personas
- **Specializations**: Physics, Philosophy, Mathematics, Content Creation, Healing, Logic

### ⚔️ Battle Arena
- **Community Voting**: Users vote for best-performing personas
- **Performance Metrics**: Accuracy, engagement, user satisfaction
- **Market Rewards**: Winning personas gain higher rental rates
- **Evolution System**: Personas learn from competitions

### 💎 Blockchain Integration
- **NFT Ownership**: Each persona is an ERC-721 NFT on Somnia
- **On-Chain Metadata**: Name, specialization, training history
- **Rental System**: Monetize your personas 24/7
- **Certificate NFTs**: Verifiable learning achievements

### 🌍 Interactive Portal
- **3D Globe Visualization**: Select personas by region
- **Touch Controls**: Swipe to rotate, tap to explore
- **Mobile Optimized**: Smooth performance on all devices
- **Fallback Mode**: CSS-only globe for maximum compatibility

---

## 🛠️ Tech Stack

### Frontend
- **HTML5/CSS3/JavaScript** (Vanilla - no framework overhead)
- **Three.js** (3D globe visualization)
- **Responsive Design** (Mobile-first approach)

### Blockchain
- **Somnia Network** (High-performance EVM-compatible chain)
- **Solidity ^0.8.20** (Smart contracts)
- **Hardhat** (Development environment)
- **Ethers.js** (Blockchain interaction)

### Smart Contracts
- **PersonaNFT.sol**: ERC-721 token for personas
- **Marketplace.sol**: Rental & trading system (coming soon)
- **Arena.sol**: Competition & voting (coming soon)

---

## 📦 Installation

### Prerequisites
- Node.js v16+
- Git
- MetaMask or Somnia-compatible wallet

### Clone & Setup

```bash
# Clone repository
git clone https://github.com/unuserv01-lab/RivalismeUniverse-Domain-AI-Automata-.git
cd RivalismeUniverse-Domain-AI-Automata-

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your private key and RPC URL

# Compile contracts
npx hardhat compile

# Deploy to Somnia Testnet
npx hardhat run scripts/deploy.js --network somnia
```

---

## 🌐 Somnia Network Configuration

### Testnet Details
- **Network Name**: Somnia Testnet
- **RPC URL**: `https://dream-rpc.somnia.network`
- **Chain ID**: `50311`
- **Currency Symbol**: `STT` (Somnia Test Token)
- **Block Explorer**: `https://explorer.somnia.network`

### Add to MetaMask

```javascript
{
  chainId: '0xC497', // 50311 in hex
  chainName: 'Somnia Testnet',
  rpcUrls: ['https://dream-rpc.somnia.network'],
  nativeCurrency: {
    name: 'Somnia Test Token',
    symbol: 'STT',
    decimals: 18
  },
  blockExplorerUrls: ['https://explorer.somnia.network']
}
```

### Get Testnet Tokens
1. Visit [Somnia Faucet](https://faucet.somnia.network)
2. Enter your wallet address
3. Receive STT tokens for testing

---

## 🎮 How to Use

### 1. Connect Wallet
- Open [Demo Site](https://unuserv01-lab.github.io/RivalismeUniverse-Domain-AI-Automata-/)
- Click "Connect Wallet"
- Approve connection in MetaMask
- Ensure you're on Somnia Testnet

### 2. Explore Personas
- **Globe View**: Click markers to see regional personas
- **Portal Selection**: Choose Content Creator or Academic realm
- **Persona Grid**: Browse available AI personalities

### 3. Interact with AI
- Select a persona card
- Choose interaction type (Learn/Battle/Quiz/Chat)
- Generate content or compete in arena
- Vote for your favorite personas

### 4. Mint NFTs
- Complete learning modules
- Earn certificate NFTs
- Create custom personas (coming soon)
- Trade on marketplace (coming soon)

---

## 🏗️ Project Structure

```
├── index.html              # Globe landing page
├── personas.html           # Persona selection & interaction
├── contracts/              # Smart contracts
│   └── SomniaPersonaNFT.sol
├── scripts/                # Deployment scripts
│   └── deploy.js
├── docs/                   # Documentation
│   └── litepaper.md
├── assets/                 # Images & videos
├── hardhat.config.js       # Hardhat configuration
└── README.md               # This file
```

---

## 🔐 Security

### Smart Contract Security
- ✅ OpenZeppelin libraries (audited)
- ✅ Access control (Ownable)
- ✅ ReentrancyGuard protection
- ⏳ Professional audit (planned)

### Frontend Security
- ✅ No localStorage usage (Claude.ai compatible)
- ✅ Input validation
- ✅ XSS protection
- ✅ HTTPS only

### Private Key Safety
- ⚠️ **NEVER** commit `.env` file
- ✅ Use hardware wallets for production
- ✅ Separate dev/production keys
- ✅ Environment variable best practices

---

## 🛣️ Roadmap

### Phase 1: MVP ✅ (Current)
- [x] Interactive globe portal
- [x] 6 pre-built personas
- [x] Battle arena (client-side)
- [x] Basic smart contracts
- [x] GitHub Pages deployment

### Phase 2: Blockchain Integration 🚧 (Q1 2025)
- [ ] Deploy to Somnia Testnet
- [ ] On-chain voting system
- [ ] NFT minting interface
- [ ] Wallet integration (Web3Modal)
- [ ] Transaction history

### Phase 3: Marketplace 🔮 (Q2 2025)
- [ ] Persona rental system
- [ ] Trading marketplace
- [ ] Revenue sharing
- [ ] Staking mechanism

### Phase 4: AI Integration 🤖 (Q3 2025)
- [ ] Real AI model integration (GPT-4/Claude)
- [ ] Custom persona training
- [ ] Voice synthesis
- [ ] Advanced interactions

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Somnia Network** - High-performance blockchain infrastructure
- **OpenZeppelin** - Secure smart contract libraries
- **Three.js** - 3D visualization library
- **Hardhat** - Ethereum development environment

---

## 📞 Contact & Support

- **GitHub Issues**: [Report Bugs](https://github.com/unuserv01-lab/RivalismeUniverse-Domain-AI-Automata-/issues)
- **Twitter**: [@RivalismeUni](https://twitter.com/RivalismeUni) (Coming Soon)
- **Discord**: [Join Community](https://discord.gg/rivalismeuniverse) (Coming Soon)
- **Email**: hello@rivalismeuniverse.com (Coming Soon)

---

## 🌟 Show Your Support

If this project helps you, please ⭐ star the repository!

---

**Built with 💜 for Somnia Hackathon 2024**

*Transforming domains into living AI personalities*
