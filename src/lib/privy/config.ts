// ============================================================
// Privy Configuration
// Ref: https://docs.privy.io/basics/react/setup
//
// KEY DECISIONS:
// - loginMethods: Google + Apple only (no email/wallet for non-crypto users)
// - embeddedWallets: auto-create Ethereum wallet on login (fully abstracted)
// - appearance: Tramuntana light theme with purple accent
// - chains: Ethereum mainnet (for vaults)
// ============================================================

import type { PrivyClientConfig } from '@privy-io/react-auth';

/**
 * Your Privy App ID — get it from https://dashboard.privy.io
 * Set NEXT_PUBLIC_PRIVY_APP_ID in your .env.local file.
 */
export const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID ?? '';

/**
 * Your Privy Client ID — get it from App Clients in Privy Dashboard
 * Set NEXT_PUBLIC_PRIVY_CLIENT_ID in your .env.local file.
 */
export const PRIVY_CLIENT_ID = process.env.NEXT_PUBLIC_PRIVY_CLIENT_ID ?? '';

export const privyConfig: PrivyClientConfig = {
  appearance: {
    theme: 'light',
    accentColor: '#6C5CE7',          // Tramuntana primary purple
    logo: '/logo.svg',
    showWalletLoginFirst: false,
    landingHeader: 'Welcome to Tramuntana',
    loginMessage: 'Sign in to access DeFi yield and trading',
  },

  embeddedWallets: {
    ethereum: {
      // Auto-create an embedded wallet for users who don't already have one
      createOnLogin: 'users-without-wallets',
    },
  },

  // MFA disabled for simpler UX
  mfa: { noPromptOnMfaRequired: false },
};
