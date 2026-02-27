// ============================================================
// App Store — Global State (Zustand)
// Manages: auth state, vault positions, portfolio, notifications
// ============================================================

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { TramuntanaUser, PortfolioSummary, PerformancePoint, AppNotification } from '@/types/user';
import type { UserVaultPosition } from '@/types/vault';
import { generatePortfolioData } from '@/lib/utils/format';
import { MASTER_VAULTS } from '@/lib/veda/constants';

export type ActiveTab = 'earn' | 'portfolio' | 'trade';

interface AppState {
  // ── Auth ──────────────────────────────────
  user: TramuntanaUser | null;
  isAuthenticated: boolean;
  showAddresses: boolean;

  // ── UI State ──────────────────────────────
  activeTab: ActiveTab;
  isLoading: boolean;
  notifications: AppNotification[];

  // ── Portfolio ─────────────────────────────
  portfolioSummary: PortfolioSummary;
  performanceHistory: PerformancePoint[];
  selectedPeriod: '1W' | '1M' | '3M' | '1Y';

  // ── Vault Positions ───────────────────────
  vaultPositions: UserVaultPosition[];

  // ── Actions ───────────────────────────────
  setUser: (user: TramuntanaUser | null) => void;
  setActiveTab: (tab: ActiveTab) => void;
  toggleAddressVisibility: () => void;
  setSelectedPeriod: (period: '1W' | '1M' | '3M' | '1Y') => void;
  updateVaultPosition: (position: UserVaultPosition) => void;
  addNotification: (notification: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  logout: () => void;
}

// Mock portfolio data (replace with real data from Veda contracts)
const MOCK_POSITIONS: UserVaultPosition[] = [
  {
    vaultId: 'stablecoin',
    shares: BigInt(5200_000000),     // 5200 shares @ 1e6 decimals
    sharesFormatted: '5,200.00',
    valueUsd: 5632.48,
    depositedUsd: 5200.00,
    unrealizedPnl: 432.48,
    unrealizedPnlPct: 0.0832,
    depositTimestamp: Date.now() - 90 * 24 * 60 * 60 * 1000,
    withdrawalAvailable: true,
  },
  {
    vaultId: 'btc-assets',
    shares: BigInt(7250_000000),
    sharesFormatted: '7,250.00',
    valueUsd: 8796.75,
    depositedUsd: 7250.00,
    unrealizedPnl: 1546.75,
    unrealizedPnlPct: 0.2133,
    depositTimestamp: Date.now() - 180 * 24 * 60 * 60 * 1000,
    withdrawalAvailable: true,
  },
];

const MOCK_PORTFOLIO: PortfolioSummary = {
  totalValueUsd: 14429.23,
  vaultValueUsd: 14429.23,
  tradingValueUsd: 0,
  cashUsd: 0,
  pnlDay: 187.32,
  pnlDayPct: 0.0131,
  pnlTotal: 1979.23,
  pnlTotalPct: 0.1589,
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // ── Initial State ─────────────────────────
      user: null,
      isAuthenticated: false,
      showAddresses: false,
      activeTab: 'earn',
      isLoading: false,
      notifications: [],
      portfolioSummary: MOCK_PORTFOLIO,
      performanceHistory: generatePortfolioData(12450, 90, 0.12),
      selectedPeriod: '3M',
      vaultPositions: MOCK_POSITIONS,

      // ── Actions ───────────────────────────────
      setUser: (user) =>
        set({ user, isAuthenticated: !!user }),

      setActiveTab: (tab) =>
        set({ activeTab: tab }),

      toggleAddressVisibility: () =>
        set((state) => ({ showAddresses: !state.showAddresses })),

      setSelectedPeriod: (period) => {
        const days = { '1W': 7, '1M': 30, '3M': 90, '1Y': 365 }[period];
        set({
          selectedPeriod: period,
          performanceHistory: generatePortfolioData(12450, days, 0.12),
        });
      },

      updateVaultPosition: (position) =>
        set((state) => ({
          vaultPositions: state.vaultPositions.some(p => p.vaultId === position.vaultId)
            ? state.vaultPositions.map(p => p.vaultId === position.vaultId ? position : p)
            : [...state.vaultPositions, position],
        })),

      addNotification: (notification) =>
        set((state) => ({
          notifications: [
            {
              ...notification,
              id: crypto.randomUUID(),
              timestamp: Date.now(),
              read: false,
            },
            ...state.notifications,
          ],
        })),

      markNotificationRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n),
        })),

      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
          vaultPositions: [],
          portfolioSummary: { ...MOCK_PORTFOLIO, totalValueUsd: 0, vaultValueUsd: 0 },
        }),
    }),
    {
      name: 'tramuntana-app',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        activeTab: state.activeTab,
        showAddresses: state.showAddresses,
        selectedPeriod: state.selectedPeriod,
      }),
    }
  )
);
