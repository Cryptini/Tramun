// ============================================================
// Hyperliquid REST API Client
// Ref: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api
// ============================================================

import type { HLMarket, HLAccountState, PriceCandle } from '@/types/trade';
import { generatePriceData } from '@/lib/utils/format';

const HL_API_URL = process.env.NEXT_PUBLIC_HL_API_URL ?? 'https://api.hyperliquid.xyz';

/** Generic info endpoint query */
async function hlInfo<T>(payload: Record<string, unknown>): Promise<T> {
  const response = await fetch(`${HL_API_URL}/info`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(`HL API error: ${response.statusText}`);
  return response.json();
}

/** Fetch all perpetual markets metadata */
export async function fetchAllMetas(): Promise<HLMarket[]> {
  // In production: call HL /info with { type: 'meta' }
  // Mock data for development:
  return MOCK_MARKETS;
}

/** Fetch mark prices for all markets */
export async function fetchMarkPrices(): Promise<Record<string, number>> {
  return {
    BTC: 95420.5,
    ETH: 3241.8,
    SOL: 182.4,
    ARB: 0.892,
    MATIC: 0.812,
    AVAX: 38.21,
    LINK: 14.32,
    UNI: 8.91,
    DOGE: 0.178,
    XRP: 2.341,
  };
}

/** Fetch user's account state on Hyperliquid */
export async function fetchAccountState(address: string): Promise<HLAccountState> {
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
    return MOCK_ACCOUNT_STATE;
  }
  return hlInfo({ type: 'clearinghouseState', user: address });
}

/** Fetch recent trades / candles for a market */
export async function fetchCandles(
  coin: string,
  interval: string = '15m',
  limit = 96
): Promise<PriceCandle[]> {
  // Mock data for development
  const basePrices: Record<string, number> = {
    BTC: 95420.5,
    ETH: 3241.8,
    SOL: 182.4,
  };
  const base = basePrices[coin] ?? 100;
  const raw = generatePriceData(base, limit, 15);
  return raw.map((d, i) => ({
    time: Date.now() - (limit - i) * 15 * 60 * 1000,
    open: d.price * 0.999,
    high: d.price * 1.002,
    low: d.price * 0.997,
    close: d.price,
    volume: d.volume,
  }));
}

/** Fetch funding rate history */
export async function fetchFundingHistory(coin: string): Promise<Array<{ time: number; fundingRate: number }>> {
  // Mock
  return Array.from({ length: 8 }, (_, i) => ({
    time: Date.now() - i * 8 * 60 * 60 * 1000,
    fundingRate: (Math.random() - 0.48) * 0.0002,
  }));
}

// ── Mock data for demo mode ──────────────────────────────────

export const MOCK_MARKETS: HLMarket[] = [
  {
    coin: 'BTC',
    name: 'BTC-PERP',
    isPerp: true,
    markPrice: 95420.5,
    indexPrice: 95385.2,
    fundingRate: 0.0001,
    openInterest: 284_000_000,
    volume24h: 1_240_000_000,
    priceChange24h: 0.0241,
    maxLeverage: 50,
    minOrderSize: 0.001,
    tickSize: 0.1,
  },
  {
    coin: 'ETH',
    name: 'ETH-PERP',
    isPerp: true,
    markPrice: 3241.8,
    indexPrice: 3239.5,
    fundingRate: 0.00008,
    openInterest: 198_000_000,
    volume24h: 842_000_000,
    priceChange24h: 0.0182,
    maxLeverage: 50,
    minOrderSize: 0.01,
    tickSize: 0.01,
  },
  {
    coin: 'SOL',
    name: 'SOL-PERP',
    isPerp: true,
    markPrice: 182.4,
    indexPrice: 182.1,
    fundingRate: 0.00012,
    openInterest: 52_000_000,
    volume24h: 210_000_000,
    priceChange24h: -0.0091,
    maxLeverage: 20,
    minOrderSize: 0.1,
    tickSize: 0.001,
  },
  {
    coin: 'ARB',
    name: 'ARB-PERP',
    isPerp: true,
    markPrice: 0.892,
    indexPrice: 0.891,
    fundingRate: -0.00003,
    openInterest: 12_000_000,
    volume24h: 48_000_000,
    priceChange24h: 0.0312,
    maxLeverage: 10,
    minOrderSize: 1,
    tickSize: 0.0001,
  },
];

export const MOCK_ACCOUNT_STATE: HLAccountState = {
  marginSummary: {
    accountValue: 5240.0,
    totalMarginUsed: 1020.0,
    totalNtlPos: 10200.0,
    withdrawable: 4220.0,
  },
  crossMaintenanceMarginUsed: 612.0,
  crossMarginRatio: 0.117,
  positions: [],
  orders: [],
};
