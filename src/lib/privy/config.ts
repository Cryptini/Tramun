// ============================================================
// Privy Configuration
// Ref: https://docs.privy.io/wallets/global-wallets/launch-your-wallet/overview
//
// KEY DECISIONS:
// - loginMethods: Google + Apple only (no email/wallet for non-crypto users)
// - embeddedWallets: auto-create on login (fully abstracted)
// - appearance: Tramuntana dark theme
// - chains: Ethereum mainnet (for vaults) + Arbitrum (for HL)
// ============================================================

import { type PrivyClientConfig } from '@privy-io/react-auth';

export const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID ?? 'clxxxxxxxxxxxxxx';

export const privyConfig: PrivyClientConfig = {
  // Only social login — no wallet connect, no email/password
  loginMethods: ['google', 'apple'],

  appearance: {
    theme: 'dark',
    accentColor: '#3B82F6',       // Tramuntana primary blue
    logo: '/logo.svg',
    showWalletLoginFirst: false,
    // Custom dialog branding
    landingHeader: 'Welcome to Tramuntana',
    loginMessage: 'Sign in to access DeFi yield and trading',
  },

  embeddedWallets: {
    // Auto-create embedded wallet for every new user
    createOnLogin: 'users-without-wallets',
    // Show funding UI after wallet creation
    showWalletUIs: false,           // We handle our own UI
    requireUserPasswordOnCreate: false,
    // Use the same wallet across devices (global wallets)
    // priceQuote is handled by peer.xyz
  },

  // Networks supported (EVM)
  // Vault wallet: Ethereum mainnet
  // Perps wallet: Arbitrum (Hyperliquid)
  defaultChain: {
    id: 1,
    name: 'Ethereum',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: {
      default: { http: [process.env.NEXT_PUBLIC_ETH_RPC_URL ?? 'https://eth.llamarpc.com'] },
    },
  },

  // MFA disabled for simpler UX (can enable for power users)
  mfa: { noPromptOnMfaRequired: false },
};
