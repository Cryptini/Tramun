// ============================================================
// Trade Store — Hyperliquid Trading State
// ============================================================

import { create } from 'zustand';
import type { HLMarket, Order, Position, OrderSide, OrderType } from '@/types/trade';
import { MOCK_MARKETS, MOCK_ACCOUNT_STATE } from '@/lib/hyperliquid/api';

interface TradeState {
  // ── Market ────────────────────────────────
  markets: HLMarket[];
  selectedMarket: HLMarket;
  markPrices: Record<string, number>;

  // ── Order Form ────────────────────────────
  side: OrderSide;
  orderType: OrderType;
  size: string;         // In USDC (display)
  leverage: number;
  limitPrice: string;   // For limit orders

  // ── Account ───────────────────────────────
  accountValue: number;
  marginUsed: number;
  withdrawable: number;
  positions: Position[];
  openOrders: Order[];

  // ── UI ────────────────────────────────────
  isPlacingOrder: boolean;
  walletMode: 'combined' | 'separate';  // Single or dual wallet

  // ── Actions ───────────────────────────────
  setSelectedMarket: (market: HLMarket) => void;
  setSide: (side: OrderSide) => void;
  setOrderType: (type: OrderType) => void;
  setSize: (size: string) => void;
  setLeverage: (leverage: number) => void;
  setLimitPrice: (price: string) => void;
  setWalletMode: (mode: 'combined' | 'separate') => void;
  setIsPlacingOrder: (loading: boolean) => void;
  updateMarkPrices: (prices: Record<string, number>) => void;
  addOrder: (order: Order) => void;
  removeOrder: (oid: number) => void;
  updatePosition: (position: Position) => void;
  closePosition: (coin: string) => void;
}

export const useTradeStore = create<TradeState>()((set, get) => ({
  // ── Initial State ──────────────────────────
  markets: MOCK_MARKETS,
  selectedMarket: MOCK_MARKETS[0], // BTC-PERP
  markPrices: {
    BTC: 95420.5,
    ETH: 3241.8,
    SOL: 182.4,
    ARB: 0.892,
  },

  side: 'long',
  orderType: 'market',
  size: '',
  leverage: 10,
  limitPrice: '',

  accountValue: MOCK_ACCOUNT_STATE.marginSummary.accountValue,
  marginUsed: MOCK_ACCOUNT_STATE.marginSummary.totalMarginUsed,
  withdrawable: MOCK_ACCOUNT_STATE.marginSummary.withdrawable,
  positions: MOCK_ACCOUNT_STATE.positions,
  openOrders: MOCK_ACCOUNT_STATE.orders,

  isPlacingOrder: false,
  walletMode: 'combined',

  // ── Actions ───────────────────────────────
  setSelectedMarket: (market) =>
    set({ selectedMarket: market, size: '', limitPrice: '' }),

  setSide: (side) => set({ side }),

  setOrderType: (orderType) => set({ orderType }),

  setSize: (size) => set({ size }),

  setLeverage: (leverage) => set({ leverage }),

  setLimitPrice: (limitPrice) => set({ limitPrice }),

  setWalletMode: (walletMode) => set({ walletMode }),

  setIsPlacingOrder: (isPlacingOrder) => set({ isPlacingOrder }),

  updateMarkPrices: (prices) =>
    set((state) => ({
      markPrices: { ...state.markPrices, ...prices },
      markets: state.markets.map(m => ({
        ...m,
        markPrice: prices[m.coin] ?? m.markPrice,
      })),
    })),

  addOrder: (order) =>
    set((state) => ({ openOrders: [order, ...state.openOrders] })),

  removeOrder: (oid) =>
    set((state) => ({
      openOrders: state.openOrders.filter(o => o.oid !== oid),
    })),

  updatePosition: (position) =>
    set((state) => ({
      positions: state.positions.some(p => p.coin === position.coin)
        ? state.positions.map(p => p.coin === position.coin ? position : p)
        : [...state.positions, position],
    })),

  closePosition: (coin) =>
    set((state) => ({
      positions: state.positions.filter(p => p.coin !== coin),
    })),
}));
