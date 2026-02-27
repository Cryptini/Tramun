// ============================================================
// Trade Types — Hyperliquid Perps & Spot
// Ref: https://hyperliquid.gitbook.io/hyperliquid-docs/trading/builder-codes
// ============================================================

export type OrderSide = 'long' | 'short';
export type OrderType = 'market' | 'limit';
export type OrderStatus = 'pending' | 'open' | 'filled' | 'cancelled' | 'rejected';
export type PositionSide = 'long' | 'short';

/** Hyperliquid market (perp or spot) */
export interface HLMarket {
  coin: string;          // e.g. "BTC"
  name: string;          // e.g. "BTC-PERP"
  isPerp: boolean;
  markPrice: number;
  indexPrice: number;
  fundingRate: number;   // 8h funding rate
  openInterest: number;
  volume24h: number;
  priceChange24h: number; // As percentage
  maxLeverage: number;
  minOrderSize: number;
  tickSize: number;
}

/** Order to submit via Hyperliquid API */
export interface PlaceOrderParams {
  coin: string;
  isBuy: boolean;
  sz: number;           // Size in base asset
  limitPx: number;      // Price (use markPrice for market orders)
  orderType: { limit: { tif: 'Gtc' | 'Ioc' | 'Alo' } } | { trigger: { triggerPx: number; isMarket: boolean; tpsl: 'tp' | 'sl' } };
  reduceOnly?: boolean;
  cloid?: string;       // Client order ID
  // Builder code fields (required for fee routing)
  builder: {
    b: string;          // Builder Ethereum address
    f: number;          // Fee in basis points (1 = 0.01%)
  };
}

/** Open order */
export interface Order {
  oid: number;
  coin: string;
  side: OrderSide;
  sz: number;
  limitPx: number;
  origSz: number;
  timestamp: number;
  status: OrderStatus;
  cloid?: string;
}

/** Open position */
export interface Position {
  coin: string;
  side: PositionSide;
  szi: number;          // Size (positive)
  entryPx: number;
  markPx: number;
  pnl: number;          // Unrealized PnL in USD
  pnlPct: number;       // As percentage
  margin: number;       // Margin used
  leverage: number;     // Current leverage
  liquidationPx: number;
  returnOnEquity: number;
  maxLeverage: number;
}

/** Account state on Hyperliquid */
export interface HLAccountState {
  marginSummary: {
    accountValue: number;
    totalMarginUsed: number;
    totalNtlPos: number;    // Total notional
    withdrawable: number;
  };
  crossMaintenanceMarginUsed: number;
  crossMarginRatio: number;
  positions: Position[];
  orders: Order[];
}

/** Price candle for chart */
export interface PriceCandle {
  time: number;         // Unix timestamp
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

/** Order book entry */
export interface OrderBookEntry {
  px: number;           // Price
  sz: number;           // Size
  n: number;            // Number of orders
}

/** User's trading wallet state */
export interface TradingWallet {
  address: string;
  usdcBalance: number;
  isPerpsWallet: boolean; // True = Hyperliquid perps wallet
}
