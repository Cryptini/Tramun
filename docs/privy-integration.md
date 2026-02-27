# Privy Integration Guide

> **Source:** https://docs.privy.io/wallets/global-wallets/launch-your-wallet/overview

## Overview

Privy provides embedded wallet infrastructure that abstracts all crypto complexity from users. Users sign in with Google or Apple and get a self-custodial embedded wallet — no seed phrase, no MetaMask required.

### Why Privy for Tramuntana
- **Zero-friction onboarding**: Social login replaces wallet setup
- **Embedded wallets**: Auto-created, managed by Privy's secure infrastructure
- **Global wallets**: Same wallet accessible across devices
- **Non-custodial**: Users own their keys (via MPC or TEE)
- **Customizable UI**: Match our dark Tramuntana theme

---

## Configuration

```typescript
// src/lib/privy/config.ts
import { type PrivyClientConfig } from '@privy-io/react-auth';

export const privyConfig: PrivyClientConfig = {
  loginMethods: ['google', 'apple'],    // Only social login

  appearance: {
    theme: 'dark',
    accentColor: '#3B82F6',             // Tramuntana blue
    logo: '/logo.svg',
  },

  embeddedWallets: {
    createOnLogin: 'users-without-wallets', // Auto-create
    showWalletUIs: false,               // We handle our own UI
  },
};
```

---

## Installation

```bash
npm install @privy-io/react-auth wagmi viem @tanstack/react-query
```

---

## Provider Setup

```tsx
// src/components/providers/Providers.tsx
'use client';
import { PrivyProvider } from '@privy-io/react-auth';
import { WagmiProvider, createConfig } from 'wagmi';
import { mainnet, arbitrum } from 'wagmi/chains';
import { http } from 'viem';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PRIVY_APP_ID, privyConfig } from '@/lib/privy/config';

const wagmiConfig = createConfig({
  chains: [mainnet, arbitrum],
  transports: {
    [mainnet.id]: http(process.env.NEXT_PUBLIC_ETH_RPC_URL),
    [arbitrum.id]: http(process.env.NEXT_PUBLIC_ARB_RPC_URL),
  },
});

export function Providers({ children }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <PrivyProvider appId={PRIVY_APP_ID} config={privyConfig}>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </WagmiProvider>
    </PrivyProvider>
  );
}
```

---

## Auth Flow

```tsx
// In your LoginScreen component
import { usePrivy } from '@privy-io/react-auth';

function LoginScreen() {
  const { login, authenticated, user } = usePrivy();

  // Trigger social login
  const handleGoogleLogin = () => login({ loginMethods: ['google'] });
  const handleAppleLogin = () => login({ loginMethods: ['apple'] });

  if (authenticated) {
    // User is logged in — wallet is auto-created
    console.log('User DID:', user?.id);
  }
}
```

---

## Reading Wallet Address

```tsx
import { useWallets } from '@privy-io/react-auth';

function MyComponent() {
  const { wallets } = useWallets();

  // Get the embedded wallet (not external wallets)
  const embeddedWallet = wallets.find(w => w.walletClientType === 'privy');
  const address = embeddedWallet?.address;

  // Switch chain if needed
  await embeddedWallet?.switchChain(1); // Ethereum mainnet
}
```

---

## Signing Transactions

```tsx
import { useWallets } from '@privy-io/react-auth';
import { createWalletClient, custom } from 'viem';
import { mainnet } from 'viem/chains';

async function sendTransaction(walletAddress: string) {
  const { wallets } = useWallets();
  const wallet = wallets.find(w => w.address === walletAddress);

  // Get EIP-1193 provider from Privy wallet
  const provider = await wallet.getEthereumProvider();

  // Create viem wallet client
  const walletClient = createWalletClient({
    account: walletAddress,
    chain: mainnet,
    transport: custom(provider),
  });

  // Sign typed data (e.g., for Hyperliquid orders)
  const signature = await walletClient.signTypedData({
    domain: { ... },
    types: { ... },
    primaryType: '...',
    message: { ... },
  });
}
```

---

## Privacy: Address Visibility

Users should be able to hide their wallet address by default. We handle this in our `appStore`:

```typescript
// Toggle address visibility
const { showAddresses, toggleAddressVisibility } = useAppStore();

// Display — show/hide based on user preference
const displayAddress = showAddresses ? address : '••••••••';
```

---

## Environment Variables

```bash
NEXT_PUBLIC_PRIVY_APP_ID=clxxxxxxxxxxxxxx
```

Get your App ID at: https://console.privy.io/

---

## Notes

1. **Privy App ID** must be created at console.privy.io with allowed origins set to your domain
2. **Embedded wallets** use MPC (multi-party computation) — Privy never has full key access
3. **Global wallets** allow same wallet across devices (enabled by default)
4. **Key export**: Users can optionally export their private key from the Privy UI
5. **Recovery**: Privy handles wallet recovery via social login — no seed phrase needed
