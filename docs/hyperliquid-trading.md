# Hyperliquid Trading Integration Guide

> **Source:** https://hyperliquid.gitbook.io/hyperliquid-docs/trading/builder-codes#api-for-builders

## Overview

Tramuntana integrates with Hyperliquid's perpetuals DEX using builder codes — a mechanism where frontend providers earn a fee share on trades. Our fees match Phantom Wallet's structure for competitive positioning.

### Why Hyperliquid
- **Highest performance perps DEX**: <10ms latency, on-chain orderbook
- **Non-custodial**: Users control funds at all times
- **Builder codes**: Revenue sharing for Tramuntana
- **Deep liquidity**: Largest perps DEX by volume

---

## Builder Codes

Builder codes allow frontends to earn fees on trades routed through them.

### Our Configuration
```typescript
const BUILDER_ADDRESS = '0xYOUR_ADDRESS'; // Deploy before launch
const BUILDER_FEE_BPS = 1; // 1 bps = 0.01%

// Phantom reference (for fee parity):
const PHANTOM_BUILDER = '0xb84168cf3be63c6b8dad05ff5d755e97432ff80b';
```

### Attaching Builder Code to Orders
```typescript
// Every order MUST include the builder field
const order = {
  coin: 'BTC',
  is_buy: true,
  sz: 0.01,
  limit_px: 95000,
  order_type: { limit: { tif: 'Ioc' } },
  reduce_only: false,
  // Builder code — enables fee routing
  builder: {
    b: BUILDER_ADDRESS,
    f: BUILDER_FEE_BPS,
  },
};
```

---

## Order Signing (EIP-712)

Hyperliquid uses EIP-712 typed data signing. Orders are signed with the user's private key (via Privy embedded wallet).

```typescript
import { createWalletClient, custom } from 'viem';

async function signOrder(order: PlaceOrderParams, walletAddress: string) {
  // Get Privy embedded wallet provider
  const wallet = wallets.find(w => w.address === walletAddress);
  const provider = await wallet.getEthereumProvider();

  const walletClient = createWalletClient({
    account: walletAddress,
    transport: custom(provider),
  });

  // Hyperliquid EIP-712 domain
  const domain = {
    name: 'Exchange',
    version: '1',
    chainId: 42161, // Arbitrum
    verifyingContract: '0x...' // HL exchange contract
  };

  // Sign the action
  const signature = await walletClient.signTypedData({
    domain,
    types: {
      Order: [
        { name: 'hyperliquidChain', type: 'string' },
        { name: 'asset', type: 'uint32' },
        // ... full type definition from HL docs
      ]
    },
    primaryType: 'Order',
    message: {
      ...order,
      nonce: Date.now(),
    }
  });

  return { order, signature };
}
```

---

## Exchange API

```typescript
// Submit signed order
const response = await fetch('https://api.hyperliquid.xyz/exchange', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: {
      type: 'order',
      orders: [order],
      grouping: 'na',
      builder: {
        b: BUILDER_ADDRESS,
        f: BUILDER_FEE_BPS,
      }
    },
    nonce: Date.now(),
    signature: { r, s, v },
  }),
});
```

---

## Info API (Read-Only)

```typescript
// Get mark prices
const { data } = await fetch('https://api.hyperliquid.xyz/info', {
  method: 'POST',
  body: JSON.stringify({ type: 'allMids' }),
});

// Get user state
const { data } = await fetch('https://api.hyperliquid.xyz/info', {
  method: 'POST',
  body: JSON.stringify({
    type: 'clearinghouseState',
    user: walletAddress,
  }),
});

// Get candles
const { data } = await fetch('https://api.hyperliquid.xyz/info', {
  method: 'POST',
  body: JSON.stringify({
    type: 'candleSnapshot',
    req: {
      coin: 'BTC',
      interval: '15m',
      startTime: Date.now() - 24 * 60 * 60 * 1000,
      endTime: Date.now(),
    },
  }),
});
```

---

## WebSocket (Real-time Data)

```typescript
const ws = new WebSocket('wss://api.hyperliquid.xyz/ws');

// Subscribe to mark prices
ws.send(JSON.stringify({
  method: 'subscribe',
  subscription: { type: 'allMids' },
}));

// Subscribe to user updates
ws.send(JSON.stringify({
  method: 'subscribe',
  subscription: {
    type: 'userEvents',
    user: walletAddress,
  },
}));
```

---

## Fee Structure

| Layer | Rate | Notes |
|---|---|---|
| HL base fee (perps) | 3.5 bps (0.035%) | Paid to HL liquidity providers |
| HL base fee (spot) | 5.0 bps (0.05%) | Paid to HL protocol |
| Builder fee | 1 bps (0.01%) | Paid to Tramuntana |
| **Total (perps)** | **4.5 bps** | User pays |

This matches Phantom's fee structure.

---

## Dual Wallet Architecture

| | Single Wallet | Dual Wallet |
|---|---|---|
| Wallet address | Same for vaults + perps | Separate per use case |
| Complexity | Simple | Requires USDC bridge |
| Gas cost | Lower (1 address) | Higher (bridge costs) |
| Risk isolation | No | Yes (perps risk isolated) |
| Tax | Combined | Can separate |
| **Recommendation** | ✅ Start here | Power user option |

### Implementation
```typescript
// Toggle in account settings
const { walletMode } = useTradeStore();

// 'combined': use vaultWallet for both
// 'separate': use perpsWallet for trading
const tradingAddress = walletMode === 'combined'
  ? user.vaultWallet.address
  : user.perpsWallet?.address;
```

---

## Depositing USDC to Hypercore

Hyperliquid uses a native bridge (Hypercore) to accept Arbitrum USDC:

```typescript
// Send USDC to HL deposit address on Arbitrum
const HL_DEPOSIT_ADDRESS = '0x2Df1c51E09aECF9cacB7bc98cB1742757f163dF7';

await walletClient.writeContract({
  address: USDC_ADDRESSES[42161], // Arbitrum USDC
  abi: ERC20_ABI,
  functionName: 'transfer',
  args: [HL_DEPOSIT_ADDRESS, amount],
  chain: arbitrum,
});
// Funds appear in HL account within ~1 minute
```

---

## Error Handling

| Error | Meaning | Action |
|---|---|---|
| `Insufficient margin` | Not enough USDC | Prompt user to deposit more |
| `Order too small` | Below minimum size | Show minimum size to user |
| `Invalid signature` | Signing failed | Re-sign or reconnect wallet |
| `Market not trading` | HL maintenance | Show status message |

---

## Builder Code Registration

Before going live:
1. Decide on builder address (multisig recommended for fee custody)
2. Contact Hyperliquid team or register via their portal
3. Verify builder code is active by placing a test order
4. Monitor fee accumulation at builder address

**Reference builder**: Phantom (`0xb84168cf3be63c6b8dad05ff5d755e97432ff80b`) — analyze their on-chain fee income for revenue projections.
