// ============================================================
// Vault Types
// Covers Tramuntana Master Vault and underlying Veda strategies
// Ref: https://docs.veda.tech/integrations/boringvault-protocol-integration
// ============================================================

export type VaultAsset = 'USDC' | 'USDT' | 'BTC' | 'ETH' | 'SOL' | 'WBTC' | 'WETH';

export type VaultCategory = 'stablecoin' | 'btc-assets' | 'mixed';

export type VaultProtocol = 'morpho' | 'lagoon' | 'upshift' | 'aave' | 'compound' | 'custom';

export type VaultStatus = 'active' | 'paused' | 'deprecated' | 'pending';

export type WithdrawalStatus = 'available' | 'queued' | 'processing' | 'completed';

/** Individual underlying strategy vault */
export interface UnderlyingVault {
  id: string;
  name: string;
  protocol: VaultProtocol;
  contractAddress: string;
  chainId: number;
  asset: VaultAsset;
  apy: number;             // Annual percentage yield (e.g. 0.084 = 8.4%)
  tvl: number;             // Total value locked in USD
  allocationWeight: number; // Target allocation weight (0-1, sums to 1 across underlying vaults)
  actualAllocation: number; // Current actual allocation
  status: VaultStatus;
  auditUrl?: string;
  protocolUrl: string;
  description: string;
  risks: string[];
}

/** Tramuntana Master Vault — the user-facing vault */
export interface MasterVault {
  id: string;
  name: string;
  description: string;
  icon: string;
  primaryAsset: VaultAsset;
  acceptedAssets: VaultAsset[];
  blendedApy: number;      // Weighted average APY across strategies
  tvl: number;             // Total value locked in USD
  sharePrice: number;      // Current share price in primary asset
  contractAddress: string;
  accountantAddress: string;
  tellerAddress: string;
  chainId: number;
  underlyingVaults: UnderlyingVault[];
  status: VaultStatus;
  minDeposit: number;      // Minimum deposit in USD
  withdrawalDelay: number; // Seconds (from timelock)
  managementFee: number;   // Annual fee (0.005 = 0.5%)
  performanceFee: number;  // Performance fee (0.1 = 10%)
  swapFee: number;         // Fee on rebalancing swaps (0.001 = 0.1%)
}

/** Upcoming / Explore vault strategy — not yet depositable */
export interface ExploreVault {
  id: string;
  name: string;
  description: string;
  icon: string;
  asset: VaultAsset | string;
  estimatedApy: number;
  tvl?: number;
  status: 'coming_soon' | 'active' | 'waitlist';
  tags: string[];
  color: string;           // Accent color for the card
}

/** User's deposit in a vault */
export interface UserVaultPosition {
  vaultId: string;
  shares: bigint;          // ERC20 vault shares
  sharesFormatted: string;
  valueUsd: number;
  depositedUsd: number;    // Original deposit value
  unrealizedPnl: number;   // Profit/loss in USD
  unrealizedPnlPct: number; // Profit/loss as percentage
  depositTimestamp: number;
  withdrawalAvailable: boolean;
  withdrawalUnlockAt?: number; // Unix timestamp
}

/** Pending withdrawal request */
export interface WithdrawalRequest {
  id: string;
  vaultId: string;
  shares: bigint;
  estimatedUsdc: number;
  requestedAt: number;
  availableAt: number;
  status: WithdrawalStatus;
}

/** Deposit transaction params */
export interface DepositParams {
  vaultId: string;
  asset: VaultAsset;
  amount: bigint;           // In token decimals
  minSharesOut: bigint;     // Slippage protection
  referrer?: string;        // Optional referrer address
}

/** Swap quote for cross-asset deposits */
export interface SwapQuote {
  fromAsset: VaultAsset;
  toAsset: VaultAsset;
  fromAmount: bigint;
  toAmount: bigint;
  priceImpact: number;     // 0.001 = 0.1%
  fee: number;             // In USD
  route: string[];         // DEX route
  expiresAt: number;       // Unix timestamp
}
