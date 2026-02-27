# Tramuntana — Developer Documentation

> Non-custodial DeFi yield and perpetuals trading platform

Tramuntana is a mobile-first web application that gives retail users access to:
1. **DeFi yield** via Veda BoringVault infrastructure (audited on-chain strategies)
2. **Perpetuals trading** via Hyperliquid builder codes
3. **Easy onboarding** via Privy (social login → embedded wallet) + peer.xyz (fiat onramp)

---

## Documentation Index

| Document | Description |
|---|---|
| [ROADMAP.md](./ROADMAP.md) | Feature checklist and development phases |
| [privy-integration.md](./privy-integration.md) | Privy wallet setup and auth flow |
| [peer-xyz-onramp.md](./peer-xyz-onramp.md) | Fiat onramp via peer.xyz zkP2P |
| [veda-vaults.md](./veda-vaults.md) | Veda BoringVault architecture and integration |
| [hyperliquid-trading.md](./hyperliquid-trading.md) | Hyperliquid builder codes and trading API |
| [security.md](./security.md) | Security practices and audit checklist |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    TRAMUNTANA FRONTEND                       │
│  Next.js 14 · Tailwind CSS · Framer Motion · Recharts       │
│  Mobile-first PWA (430px max-width)                          │
└────────────────┬────────────────────────────────────────────┘
                 │
     ┌───────────┼───────────────────────┐
     │           │                       │
     ▼           ▼                       ▼
┌─────────┐ ┌─────────────────┐ ┌───────────────────┐
│  Privy  │ │  peer.xyz zkP2P │ │   Hyperliquid API  │
│  Auth   │ │  Fiat Onramp    │ │  Builder Codes     │
│  Wallet │ │  USDC delivery  │ │  Perps Trading     │
└─────────┘ └─────────────────┘ └───────────────────┘
                                          │
     ┌────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────────────────────────┐
│                 VEDA BORINGVAULT MASTER VAULT                  │
│  BoringVault.sol + Accountant.sol + Teller.sol               │
│                                                               │
│  ┌──────────────────┐     ┌──────────────────────────────┐   │
│  │  Stablecoin Vault│     │  BTC & Assets Vault           │   │
│  │                  │     │                               │   │
│  │ ├─ Morpho USDC   │     │ ├─ Lagoon Prime ETH           │   │
│  │ ├─ Lagoon USDC   │     │ └─ Lagoon Tulipa BTC          │   │
│  │ └─ Upshift USDC  │     │                               │   │
│  └──────────────────┘     └──────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v3 |
| Animations | Framer Motion |
| Charts | Recharts |
| State | Zustand (persist to localStorage) |
| Auth | Privy (`@privy-io/react-auth`) |
| Web3 | Wagmi v2 + Viem v2 |
| Data fetching | TanStack Query v5 |

---

## Environment Variables

See [.env.example](../.env.example) for all required variables.

**Critical variables:**
```
NEXT_PUBLIC_PRIVY_APP_ID=          # From console.privy.io
NEXT_PUBLIC_HL_BUILDER_ADDRESS=    # Your builder fee address
NEXT_PUBLIC_TRAMUNTANA_MASTER_VAULT= # Deployed BoringVault address
```

---

## Development Setup

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Fill in your keys

# Start development server
npm run dev

# Open http://localhost:3000
```

---

## Key Design Principles

1. **Non-custodial first**: Users always control private keys (Privy embedded wallet)
2. **Abstracted complexity**: No wallet addresses shown by default, no gas concepts exposed
3. **Mobile-first**: 430px max-width, bottom navigation, touch-optimized
4. **Demo-ready**: App works with mock data until live integrations are configured
5. **Documentation as code**: Every integration has a dedicated doc file

---

## Ethical Practices

- Always reference official documentation before implementing
- Never expose private keys — use Privy's secure embedded wallet
- Clearly disclose fees to users before transactions
- Respect timelocks — never bypass BoringVault withdrawal delays
- Builder codes must be disclosed in UI (we show "Powered by Hyperliquid")
- Smart contract changes require timelock + multisig in production
