// ============================================================
// Hyperliquid Builder Code Integration
// Ref: https://hyperliquid.gitbook.io/hyperliquid-docs/trading/builder-codes#api-for-builders
//
// Builder codes let protocols earn a fee share on trades placed
// through their frontend by attaching a builder object to orders.
//
// Fee Structure (matching Phantom Wallet):
// - Phantom builder: 0xb84168cf3be63c6b8dad05ff5d755e97432ff80b
// - Perps fee: 1 bps (0.01%) added on top of HL base fee
// - Spot fee: typically 1 bps as well
// - Fee is paid to NEXT_PUBLIC_HL_BUILDER_ADDRESS
//
// Architecture consideration: Separate vault wallet vs perps wallet
// Option A: Same wallet for both (simpler UX, more gas efficient)
// Option B: Separate wallets (isolation, potential tax efficiency)
// → We support BOTH via a wallet toggle in the UI
// ============================================================

import type { PlaceOrderParams } from '@/types/trade';

/** Our builder address — receives fee share from all trades */
const BUILDER_ADDRESS = process.env.NEXT_PUBLIC_HL_BUILDER_ADDRESS ??
  '0x0000000000000000000000000000000000000000';

/** Phantom's reference builder address (for fee parity) */
export const PHANTOM_BUILDER_ADDRESS = '0xb84168cf3be63c6b8dad05ff5d755e97432ff80b';

/** Fee in basis points (1 bps = 0.01%) — must match Phantom */
const BUILDER_FEE_BPS = parseInt(process.env.NEXT_PUBLIC_HL_BUILDER_FEE_BPS ?? '1', 10);

/** Hyperliquid API endpoint */
const HL_API_URL = process.env.NEXT_PUBLIC_HL_API_URL ?? 'https://api.hyperliquid.xyz';

/**
 * Attach Tramuntana builder code to an order
 * This routes a portion of trading fees to our builder address
 */
export function attachBuilderCode(order: Omit<PlaceOrderParams, 'builder'>): PlaceOrderParams {
  return {
    ...order,
    builder: {
      b: BUILDER_ADDRESS,
      f: BUILDER_FEE_BPS,
    },
  };
}

/**
 * Build a market order with builder code attached
 * Market orders use the current mark price with IoC (Immediate or Cancel)
 */
export function buildMarketOrder(params: {
  coin: string;
  isBuy: boolean;
  sz: number;
  markPrice: number;
  slippagePct?: number;  // e.g. 0.01 = 1% slippage tolerance
}): PlaceOrderParams {
  const { coin, isBuy, sz, markPrice, slippagePct = 0.005 } = params;

  // For market buys: limit price slightly above mark (slippage allowance)
  // For market sells: limit price slightly below mark
  const limitPx = isBuy
    ? markPrice * (1 + slippagePct)
    : markPrice * (1 - slippagePct);

  return attachBuilderCode({
    coin,
    isBuy,
    sz,
    limitPx: parseFloat(limitPx.toFixed(2)),
    orderType: { limit: { tif: 'Ioc' } }, // IoC for market orders
    reduceOnly: false,
  });
}

/**
 * Build a limit order with builder code attached
 */
export function buildLimitOrder(params: {
  coin: string;
  isBuy: boolean;
  sz: number;
  limitPx: number;
  timeInForce?: 'Gtc' | 'Ioc' | 'Alo';
}): PlaceOrderParams {
  const { coin, isBuy, sz, limitPx, timeInForce = 'Gtc' } = params;

  return attachBuilderCode({
    coin,
    isBuy,
    sz,
    limitPx,
    orderType: { limit: { tif: timeInForce } },
    reduceOnly: false,
  });
}

/**
 * Build a close position order (reduce only)
 */
export function buildCloseOrder(params: {
  coin: string;
  isBuy: boolean;  // Opposite of position side
  sz: number;
  markPrice: number;
}): PlaceOrderParams {
  return {
    ...buildMarketOrder(params),
    reduceOnly: true,
  };
}

/**
 * Submit order to Hyperliquid via their Exchange API
 * Requires signing with user's private key
 *
 * IMPORTANT: In production, signing happens in the embedded wallet (Privy)
 * The user never exposes their private key
 *
 * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint
 */
export async function submitOrder(
  signedAction: Record<string, unknown>
): Promise<{ status: 'ok'; response: { type: string; data: { statuses: unknown[] } } }> {
  const response = await fetch(`${HL_API_URL}/exchange`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(signedAction),
  });

  if (!response.ok) {
    throw new Error(`Hyperliquid API error: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Calculate estimated fee for a trade
 */
export function estimateTradeFee(params: {
  notionalSize: number;  // In USD
  isPerp: boolean;
}): {
  hlBaseFee: number;
  builderFee: number;
  totalFee: number;
  breakdown: string;
} {
  const { notionalSize, isPerp } = params;

  // Hyperliquid base fees (approximate)
  const hlFeeRate = isPerp ? 0.00035 : 0.0005; // 3.5 bps perps, 5 bps spot
  const builderFeeRate = BUILDER_FEE_BPS / 10000;

  const hlBaseFee = notionalSize * hlFeeRate;
  const builderFee = notionalSize * builderFeeRate;

  return {
    hlBaseFee,
    builderFee,
    totalFee: hlBaseFee + builderFee,
    breakdown: `HL: ${(hlFeeRate * 100).toFixed(3)}% + Builder: ${(builderFeeRate * 100).toFixed(3)}%`,
  };
}

/**
 * Dual wallet architecture analysis
 *
 * OPTION A: Single wallet (vault + perps)
 * - Simpler UX, one address
 * - No cross-wallet transfers needed
 * - Less gas overhead
 *
 * OPTION B: Two wallets (vault wallet + perps wallet)
 * - Isolation: DeFi risk separated from trading risk
 * - Potential tax separation benefit
 * - Requires USDC bridge from vault wallet → Hypercore
 * - More complex UX (but can abstract with a toggle)
 *
 * RECOMMENDATION: Start with Option A, offer Option B as advanced setting
 */
export const WALLET_ARCHITECTURE = {
  VAULT_CHAIN_ID: 1,          // Ethereum for BoringVault
  PERPS_CHAIN_ID: 42161,      // Arbitrum for Hyperliquid
  PERPS_DEPOSIT_ADDRESS: '0x2Df1c51E09aECF9cacB7bc98cB1742757f163dF7', // HL L1 bridge
} as const;
