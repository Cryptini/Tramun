// ============================================================
// peer.xyz zkP2P Onramp Integration
// Ref: https://docs.peer.xyz/developer/integrate-zkp2p/integrate-redirect-onramp
//
// Flow:
// 1. User taps "Add Funds" → select method (Apple Pay, bank, crypto)
// 2. We build a redirect URL with their wallet address + amount
// 3. User is redirected to peer.xyz to complete payment
// 4. peer.xyz sends USDC on-chain to user's wallet
// 5. User is redirected back to our success page
//
// NO CUSTODIAL HANDLING — peer.xyz sends directly to user's wallet
// ============================================================

const PEER_BASE_URL = process.env.NEXT_PUBLIC_PEER_BASE_URL ?? 'https://app.peer.xyz';
const RETURN_URL = process.env.NEXT_PUBLIC_PEER_RETURN_URL ?? 'http://localhost:3000/onramp/success';

export type OnrampMethod = 'apple-pay' | 'revolut' | 'venmo' | 'cashapp' | 'zelle' | 'wise';
export type OnrampCurrency = 'USD' | 'EUR' | 'GBP';
export type OnrampAsset = 'USDC' | 'USDT';
export type OnrampNetwork = 'ethereum' | 'arbitrum' | 'base' | 'polygon';

export interface OnrampParams {
  walletAddress: string;
  amount?: number;            // Pre-fill amount in fiat
  fiatCurrency?: OnrampCurrency;
  targetAsset?: OnrampAsset;
  network?: OnrampNetwork;
  paymentMethod?: OnrampMethod;
}

/**
 * Build the peer.xyz redirect URL for onramp
 * Sends user to peer.xyz where they complete payment via P2P
 * USDC is delivered directly to walletAddress on-chain
 */
export function buildOnrampUrl(params: OnrampParams): string {
  const {
    walletAddress,
    amount,
    fiatCurrency = 'USD',
    targetAsset = 'USDC',
    network = 'ethereum',
    paymentMethod,
  } = params;

  const url = new URL('/zkp2p/onramp', PEER_BASE_URL);

  // Required parameters
  url.searchParams.set('depositAddress', walletAddress);
  url.searchParams.set('quoteCurrencyCode', targetAsset);
  url.searchParams.set('baseCurrencyCode', fiatCurrency);
  url.searchParams.set('network', network);
  url.searchParams.set('returnUrl', RETURN_URL);

  // Optional pre-fill
  if (amount && amount > 0) {
    url.searchParams.set('baseCurrencyAmount', amount.toString());
  }
  if (paymentMethod) {
    url.searchParams.set('paymentMethod', paymentMethod);
  }

  return url.toString();
}

/**
 * Build onramp URL specifically for Hyperliquid perps wallet
 * Funds go directly to the perps account (Hypercore)
 */
export function buildPerpsOnrampUrl(params: OnrampParams): string {
  return buildOnrampUrl({
    ...params,
    network: 'arbitrum', // HL settles on Arbitrum
    targetAsset: 'USDC',
  });
}

/**
 * Redirect user to peer.xyz onramp
 * Opens in same tab (can also open in new tab for better UX)
 */
export function redirectToOnramp(params: OnrampParams, newTab = false): void {
  const url = buildOnrampUrl(params);
  if (newTab) {
    window.open(url, '_blank', 'noopener,noreferrer');
  } else {
    window.location.href = url;
  }
}

/** Supported payment methods with display metadata */
export const ONRAMP_METHODS: Array<{
  id: OnrampMethod;
  label: string;
  icon: string;
  description: string;
  minAmount: number;
  maxAmount: number;
  estimatedTime: string;
  available: boolean;
}> = [
  {
    id: 'apple-pay',
    label: 'Apple Pay',
    icon: '🍎',
    description: 'Instant purchase with Apple Pay',
    minAmount: 20,
    maxAmount: 500,
    estimatedTime: '~2 min',
    available: true,
  },
  {
    id: 'revolut',
    label: 'Revolut',
    icon: '💜',
    description: 'Bank transfer via Revolut',
    minAmount: 20,
    maxAmount: 5000,
    estimatedTime: '~10 min',
    available: true,
  },
  {
    id: 'venmo',
    label: 'Venmo',
    icon: '💙',
    description: 'P2P payment via Venmo',
    minAmount: 20,
    maxAmount: 2000,
    estimatedTime: '~5 min',
    available: true,
  },
  {
    id: 'zelle',
    label: 'Zelle',
    icon: '⚡',
    description: 'Instant bank transfer via Zelle',
    minAmount: 50,
    maxAmount: 5000,
    estimatedTime: '~3 min',
    available: true,
  },
  {
    id: 'wise',
    label: 'Wise',
    icon: '🌍',
    description: 'International bank transfer',
    minAmount: 20,
    maxAmount: 10000,
    estimatedTime: '~15 min',
    available: true,
  },
];
