# peer.xyz zkP2P Onramp Integration Guide

> **Source:** https://docs.peer.xyz/developer/integrate-zkp2p/integrate-redirect-onramp

## Overview

peer.xyz uses zero-knowledge proofs to enable peer-to-peer fiat-to-crypto conversions. Users pay with Venmo, Revolut, Zelle, etc. and receive USDC directly in their wallet — no custodian, no exchange account required.

### Why peer.xyz for Tramuntana
- **Non-custodial**: USDC delivered directly to user's wallet address
- **No exchange account**: Works for complete crypto beginners
- **Redirect-based**: No API key required for basic integration
- **Multiple payment methods**: Apple Pay, Revolut, Venmo, Zelle, Wise
- **Low fees**: Competitive P2P rates

---

## Integration Type: Redirect

The simplest integration — build a URL and redirect the user. peer.xyz handles all payment processing and sends USDC on-chain.

```
User taps "Add Funds"
  → We build redirect URL with wallet address
  → User completes payment on peer.xyz
  → peer.xyz sends USDC to wallet on-chain
  → User redirected back to Tramuntana
```

No backend required. No API keys for basic flow.

---

## Redirect URL Format

```typescript
const onrampUrl = new URL('/zkp2p/onramp', 'https://app.peer.xyz');

onrampUrl.searchParams.set('depositAddress', walletAddress);  // User's wallet
onrampUrl.searchParams.set('quoteCurrencyCode', 'USDC');      // Target crypto
onrampUrl.searchParams.set('baseCurrencyCode', 'USD');         // Fiat currency
onrampUrl.searchParams.set('network', 'ethereum');             // Chain
onrampUrl.searchParams.set('returnUrl', 'https://tramuntana.app/onramp/success');
onrampUrl.searchParams.set('baseCurrencyAmount', '100');       // Pre-fill $100

// Optional: specify payment method
onrampUrl.searchParams.set('paymentMethod', 'revolut');
```

---

## Vault vs Perps Onramp

### Vault Wallet (Ethereum)
```typescript
buildOnrampUrl({
  walletAddress: user.vaultWallet.address,
  network: 'ethereum',
  targetAsset: 'USDC',
})
```

### Perps Wallet (Arbitrum/Hypercore)
```typescript
// Option A: Direct to Arbitrum wallet, then bridge to Hypercore
buildOnrampUrl({
  walletAddress: user.perpsWallet.address,
  network: 'arbitrum',
  targetAsset: 'USDC',
})

// Option B: Use HL's L1 deposit address directly
buildOnrampUrl({
  walletAddress: WALLET_ARCHITECTURE.PERPS_DEPOSIT_ADDRESS,
  network: 'arbitrum',
  targetAsset: 'USDC',
})
```

**Cost analysis — single wallet vs dual wallet:**
- Single wallet: 1 onramp tx + 1 bridge tx (if perps) = ~$5 gas
- Dual wallet: 1 onramp tx (each destination) = ~$2 gas each
- **Recommendation**: Start with single wallet. Offer dual wallet as power user option.

---

## Success Callback Page

Create `src/app/onramp/success/page.tsx`:

```tsx
'use client';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useAppStore } from '@/store/appStore';

export default function OnrampSuccess() {
  const searchParams = useSearchParams();
  const { addNotification } = useAppStore();

  useEffect(() => {
    const amount = searchParams.get('amount');
    const txHash = searchParams.get('txHash');

    if (txHash) {
      addNotification({
        type: 'success',
        title: 'Funds received!',
        message: `${amount} USDC added to your wallet`,
      });
    }

    // Redirect back to app
    window.location.href = '/';
  }, []);

  return <div>Processing...</div>;
}
```

---

## Payment Methods

| Method | Min | Max | Time | Regions |
|---|---|---|---|---|
| Apple Pay | $20 | $500 | ~2 min | US |
| Revolut | $20 | $5,000 | ~10 min | EU/UK/US |
| Venmo | $20 | $2,000 | ~5 min | US |
| Zelle | $50 | $5,000 | ~3 min | US |
| Wise | $20 | $10,000 | ~15 min | Global |

---

## Error Handling

peer.xyz may append error parameters to the return URL:
```
?error=cancelled    # User cancelled
?error=timeout      # Payment timed out
?error=failed       # Payment failed
```

Handle in the success page:
```typescript
const error = searchParams.get('error');
if (error) {
  addNotification({ type: 'error', title: 'Payment failed', message: error });
}
```

---

## Notes

1. **Availability**: peer.xyz P2P availability depends on active liquidity providers. Inform users of estimated wait times.
2. **KYC**: peer.xyz handles KYC/AML compliance. We don't need to handle it.
3. **Fees**: peer.xyz charges a small fee (typically 1-3%). Show users the fee breakdown before redirecting.
4. **Rate**: Exchange rate is determined at time of peer.xyz transaction, not when we build the URL.
5. **Limits**: Subject to change — always show current limits from peer.xyz UI.
