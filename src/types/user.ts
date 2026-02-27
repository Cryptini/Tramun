// ============================================================
// User Types — Privy-powered accounts
// Ref: https://docs.privy.io/wallets/global-wallets/launch-your-wallet/overview
// ============================================================

export type LoginMethod = 'google' | 'apple' | 'email' | 'wallet';
export type WalletType = 'vault' | 'perps';

/** Tramuntana user account */
export interface TramuntanaUser {
  privyDid: string;           // Privy user DID
  displayName: string;        // Derived from email/social login
  email?: string;
  avatar?: string;
  loginMethod: LoginMethod;
  createdAt: number;
  // Wallets
  vaultWallet: UserWallet;    // For Veda vault interactions
  perpsWallet?: UserWallet;   // Optional separate perps wallet
  showAddresses: boolean;     // Privacy toggle
}

/** User's embedded wallet */
export interface UserWallet {
  address: string;
  type: WalletType;
  chainId: number;
  isActive: boolean;
  usdcBalance: number;
  ethBalance: number;
  nativeBalance: number;
}

/** Portfolio summary */
export interface PortfolioSummary {
  totalValueUsd: number;
  vaultValueUsd: number;
  tradingValueUsd: number;
  cashUsd: number;
  pnlDay: number;       // PnL today in USD
  pnlDayPct: number;    // PnL today as %
  pnlTotal: number;     // All-time PnL
  pnlTotalPct: number;
}

/** Performance data point for charts */
export interface PerformancePoint {
  date: string;         // ISO date string
  value: number;        // Portfolio value in USD
  label: string;        // Display label (e.g. "Jan 15")
}

/** Onramp transaction record */
export interface OnrampTransaction {
  id: string;
  type: 'onramp' | 'offramp';
  method: 'apple-pay' | 'bank-transfer' | 'crypto';
  fiatAmount?: number;
  fiatCurrency?: string;
  cryptoAmount: number;
  cryptoAsset: string;
  status: 'pending' | 'completed' | 'failed';
  timestamp: number;
  txHash?: string;
}

/** App notification */
export interface AppNotification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  timestamp: number;
  read: boolean;
  action?: {
    label: string;
    href: string;
  };
}
