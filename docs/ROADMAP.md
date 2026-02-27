# Tramuntana — Development Roadmap

> Living checklist · Update status as features ship

## Phase 0 — Foundation ✅

- [x] Project scaffold (Next.js 14, Tailwind, TypeScript)
- [x] Design system (colors, typography, components)
- [x] Mobile-first layout (Header, TabBar, AppShell)
- [x] Three main tabs: Earn, Portfolio, Trade
- [x] Zustand stores (appStore, tradeStore)
- [x] Integration libraries (stubs for Privy, peer.xyz, Veda, Hyperliquid)
- [x] Documentation structure
- [x] Mock data layer (all views functional)

---

## Phase 1 — Auth & Wallet (Privy) 🔲

**References:** [privy-integration.md](./privy-integration.md)

- [ ] Install and configure `@privy-io/react-auth`
- [ ] Add `NEXT_PUBLIC_PRIVY_APP_ID` to env
- [ ] Wrap app in `PrivyProvider` with Tramuntana config
- [ ] Implement `usePrivy()` auth in LoginScreen
- [ ] Implement `useWallets()` to read embedded wallet address
- [ ] Hook user state to Privy auth (setUser on login/logout)
- [ ] Test Google login flow
- [ ] Test Apple login flow
- [ ] Verify embedded wallet auto-creation
- [ ] Address visibility toggle (show/hide wallet address)
- [ ] Connect Privy wallet to Wagmi for onchain txns

---

## Phase 2 — Fiat Onramp (peer.xyz) 🔲

**References:** [peer-xyz-onramp.md](./peer-xyz-onramp.md)

- [ ] Configure `NEXT_PUBLIC_PEER_RETURN_URL`
- [ ] Test redirect URL generation with wallet address
- [ ] Test Apple Pay onramp flow (end-to-end)
- [ ] Test bank transfer flow (Revolut, Wise, Venmo)
- [ ] Handle success callback (`/onramp/success` page)
- [ ] Handle failure/cancel callback
- [ ] Update USDC balance after successful onramp
- [ ] Add onramp directly to Hypercore perps account
  - [ ] Evaluate `network=arbitrum` flow for perps wallet
  - [ ] Compare gas costs: single wallet vs dual wallet

---

## Phase 3 — Veda Vault Integration 🔲

**References:** [veda-vaults.md](./veda-vaults.md)

### 3a. Smart Contract Deployment
- [ ] Deploy Tramuntana Stablecoin BoringVault
  - [ ] BoringVault.sol
  - [ ] Accountant.sol (share price tracking)
  - [ ] Teller.sol (deposit/withdraw interface)
- [ ] Deploy Tramuntana BTC & Assets BoringVault
- [ ] Configure underlying vault allocations
  - [ ] Morpho Steakhouse USDC (50%)
  - [ ] Lagoon Tulipa USDC (30%)
  - [ ] Upshift USDC (20%)
  - [ ] Lagoon Prime ETH (40%)
  - [ ] Lagoon Tulipa BTC (60%)
- [ ] Set withdrawal timelocks
  - [ ] Stablecoin: 24h
  - [ ] BTC/Assets: 72h
- [ ] Configure fee receivers
- [ ] Security audit (see [security.md](./security.md))

### 3b. Frontend Integration
- [ ] Connect Wagmi to Ethereum mainnet
- [ ] Read vault share price from Accountant contract
- [ ] Read user vault balance (shares × sharePrice)
- [ ] Implement USDC approve + deposit flow
  - [ ] `approve(tellerAddress, amount)`
  - [ ] `teller.deposit(amount, minSharesOut, deadline)`
- [ ] Implement withdrawal request flow
  - [ ] `teller.requestWithdraw(shares)`
  - [ ] Track withdrawal unlock timestamp
  - [ ] Implement `teller.completeWithdraw()` after timelock
- [ ] Swap integration for BTC/ETH vault deposits
  - [ ] Integrate 1inch API for USDC → WBTC / WETH quotes
  - [ ] Apply Tramuntana swap fee (configurable, default 0.2%)
  - [ ] Slippage protection (max 1%)
- [ ] Real TVL and APY from on-chain data / subgraph
- [ ] Vault strategy rebalancing (admin function)
  - [ ] Document timelock for strategy changes
  - [ ] Implement admin UI for rebalancing

---

## Phase 4 — Hyperliquid Trading 🔲

**References:** [hyperliquid-trading.md](./hyperliquid-trading.md)

- [ ] Configure `NEXT_PUBLIC_HL_BUILDER_ADDRESS`
- [ ] Set `NEXT_PUBLIC_HL_BUILDER_FEE_BPS=1` (matching Phantom)
- [ ] Implement market data fetching
  - [ ] `fetchAllMetas()` — market list
  - [ ] `fetchMarkPrices()` — real-time prices
  - [ ] `fetchCandles()` — chart data
  - [ ] WebSocket for real-time price updates
- [ ] Implement order signing with Privy wallet
  - [ ] Build EIP-712 order hash
  - [ ] Sign with `signTypedData()` from embedded wallet
  - [ ] Attach builder code to every order
- [ ] Implement order submission
  - [ ] Market orders (IoC)
  - [ ] Limit orders (GTC)
  - [ ] Close position (reduce-only)
- [ ] Implement account state polling
  - [ ] Margin summary
  - [ ] Open positions
  - [ ] Open orders
- [ ] Order management
  - [ ] Cancel single order
  - [ ] Cancel all orders
- [ ] Perps account funding
  - [ ] USDC deposit to Hypercore (L1 bridge)
  - [ ] USDC withdrawal from Hypercore
- [ ] Dual wallet mode (optional advanced feature)
  - [ ] Vault wallet (Ethereum) vs Perps wallet (Arbitrum)
  - [ ] Toggle in account settings

---

## Phase 5 — Portfolio & Analytics 🔲

- [ ] Real-time portfolio value from vault contracts
- [ ] Performance history from on-chain events
- [ ] PnL tracking (vault gains + trading PnL)
- [ ] Transaction history (deposits, withdrawals, trades)
- [ ] Export to CSV for tax purposes
- [ ] Push notifications (via web push API)
  - [ ] Deposit confirmed
  - [ ] Withdrawal available
  - [ ] Position liquidation warning

---

## Phase 6 — Polish & Production 🔲

- [ ] PWA manifest + service worker
- [ ] App icon (512x512, 192x192)
- [ ] Splash screens for iOS
- [ ] Error boundaries for all API calls
- [ ] Loading skeletons for all data
- [ ] Offline state handling
- [ ] Rate limit handling
- [ ] Analytics (PostHog or Mixpanel)
- [ ] Error tracking (Sentry)
- [ ] Performance monitoring

---

## Phase 7 — Mobile App (Optional) 🔲

**References:** Rork docs (https://docs.rork.com/)

- [ ] Evaluate React Native (Expo) vs WebView wrapper
- [ ] If Expo: migrate components to React Native
- [ ] App Store Connect configuration
- [ ] TestFlight beta distribution
- [ ] Apple App Store submission
- [ ] Google Play Store submission (if Android)

---

## Security Checklist 🔒

See [security.md](./security.md) for full checklist.

- [ ] Smart contract audit (Stablecoin vault)
- [ ] Smart contract audit (BTC/Assets vault)
- [ ] Dependency vulnerability scan (`npm audit`)
- [ ] CSP headers configured
- [ ] No private keys in frontend code
- [ ] No sensitive data in localStorage
- [ ] HTTPS everywhere
- [ ] Rate limiting on any backend API routes

---

## Known Limitations / Constraints

| Limitation | Mitigation |
|---|---|
| BoringVault timelocks prevent instant withdrawals | Clearly communicate delays to users; show countdown |
| Strategy rebalancing has timelock (typically 3-day) | Plan changes in advance; monitor performance |
| Hyperliquid requires Arbitrum USDC for perps | Bridge USDC from Ethereum if using single wallet |
| Privy embedded wallets cannot be exported on mobile | Power users can toggle to MetaMask via WalletConnect |
| peer.xyz availability varies by region | Show estimated availability; offer crypto deposit fallback |
