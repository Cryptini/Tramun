// ============================================================
// Veda Vault Constants & Strategy Definitions
// Ref: https://docs.veda.tech/integrations/boringvault-protocol-integration
//
// Architecture:
// Tramuntana Master Vault (BoringVault)
//   ├── Stablecoin Vault → Morpho/Lagoon USDC strategies
//   └── BTC & Assets Vault → BTC/ETH yield strategies
//
// Timelocks: Withdrawal requests enter a queue.
// Users must wait for the withdrawal period before funds arrive.
// This protects against liquidity attacks on underlying strategies.
// ============================================================

import type { MasterVault, UnderlyingVault } from '@/types/vault';

// ── Tramuntana vault contracts (deploy before going live) ──
export const TRAMUNTANA_CONTRACTS = {
  MASTER_VAULT_STABLECOIN: process.env.NEXT_PUBLIC_TRAMUNTANA_MASTER_VAULT ?? '0x0000000000000000000000000000000000000001',
  MASTER_VAULT_BTC: '0x0000000000000000000000000000000000000002',
  ACCOUNTANT_STABLECOIN: process.env.NEXT_PUBLIC_TRAMUNTANA_ACCOUNTANT ?? '0x0000000000000000000000000000000000000003',
  ACCOUNTANT_BTC: '0x0000000000000000000000000000000000000004',
  TELLER_STABLECOIN: process.env.NEXT_PUBLIC_TRAMUNTANA_TELLER ?? '0x0000000000000000000000000000000000000005',
  TELLER_BTC: '0x0000000000000000000000000000000000000006',
} as const;

// ── USDC contract addresses by chain ──
export const USDC_ADDRESSES: Record<number, string> = {
  1: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',   // Ethereum mainnet
  42161: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', // Arbitrum
  8453: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',  // Base
};

// ── Underlying strategy vaults ──
export const UNDERLYING_VAULTS: UnderlyingVault[] = [
  // ── Stablecoin Strategies ──────────────────────────────────
  {
    id: 'morpho-steakhouse-usdc',
    name: 'Steakhouse USDC',
    protocol: 'morpho',
    contractAddress: '0xbeEF346d7099865208Ff331e4f648f4154DDAa05',
    chainId: 1,
    asset: 'USDC',
    apy: 0.071,
    tvl: 48_200_000,
    allocationWeight: 0.5,
    actualAllocation: 0.5,
    status: 'active',
    protocolUrl: 'https://app.morpho.org/ethereum/vault/0xbeEF346d7099865208Ff331e4f648f4154DDAa05/steakhouse-reservoir-usdc',
    description: 'Battle-tested USDC lending vault on Morpho Blue. Curated by Steakhouse Financial.',
    risks: ['Smart contract risk', 'Morpho protocol risk', 'Counterparty risk'],
    auditUrl: 'https://docs.morpho.org/security',
  },
  {
    id: 'lagoon-tulipa-usdc',
    name: 'Tulipa Capital USDC',
    protocol: 'lagoon',
    contractAddress: '0xce0b790ae0d8cf91e01f3fb69025e14569b574f3',
    chainId: 1,
    asset: 'USDC',
    apy: 0.092,
    tvl: 12_800_000,
    allocationWeight: 0.3,
    actualAllocation: 0.3,
    status: 'active',
    protocolUrl: 'https://app.lagoon.finance/vault/1/0xce0b790ae0d8cf91e01f3fb69025e14569b574f3',
    description: 'Actively managed USDC yield strategies by Tulipa Capital on Lagoon Finance.',
    risks: ['Manager risk', 'Smart contract risk', 'Liquidity risk'],
  },
  {
    id: 'upshift-usdc',
    name: 'Upshift USDC Pool',
    protocol: 'upshift',
    contractAddress: '0x80E1048eDE66ec4c364b4F22C8768fc657FF6A42',
    chainId: 1,
    asset: 'USDC',
    apy: 0.085,
    tvl: 8_400_000,
    allocationWeight: 0.2,
    actualAllocation: 0.2,
    status: 'active',
    protocolUrl: 'https://app.upshift.finance/pools/1/0x80E1048eDE66ec4c364b4F22C8768fc657FF6A42',
    description: 'Optimized USDC yield across multiple DeFi protocols via Upshift.',
    risks: ['Protocol aggregation risk', 'Smart contract risk'],
  },

  // ── BTC & Assets Strategies ──────────────────────────────
  {
    id: 'lagoon-prime-eth',
    name: 'Steakhouse Prime ETH',
    protocol: 'lagoon',
    contractAddress: '0xbeef04b01e0275D4ac2e2986256BB14E3Ff6ef42',
    chainId: 10143, // Monad testnet (will deploy on mainnet)
    asset: 'ETH',
    apy: 0.121,
    tvl: 6_900_000,
    allocationWeight: 0.4,
    actualAllocation: 0.4,
    status: 'active',
    protocolUrl: 'https://app.morpho.org/monad/vault/0xbeef04b01e0275D4ac2e2986256BB14E3Ff6ef42/steakhouse-prime-eth',
    description: 'ETH restaking and native yield strategies. Targets 12%+ APY.',
    risks: ['ETH price risk', 'Restaking slashing risk', 'Smart contract risk'],
  },
  {
    id: 'lagoon-tulipa-btc',
    name: 'Tulipa Capital BTC',
    protocol: 'lagoon',
    contractAddress: '0x9b1c616f5d2d8efb451b2823a58e789dc370705f',
    chainId: 1,
    asset: 'BTC',
    apy: 0.068,
    tvl: 22_100_000,
    allocationWeight: 0.6,
    actualAllocation: 0.6,
    status: 'active',
    protocolUrl: 'https://app.lagoon.finance/vault/1/0x9b1c616f5d2d8efb451b2823a58e789dc370705f',
    description: 'BTC yield strategies via wrapped BTC lending and structured products.',
    risks: ['BTC price risk', 'Bridge risk (WBTC)', 'Manager risk'],
  },
];

// ── Master Vault Definitions ──────────────────────────────
export const MASTER_VAULTS: MasterVault[] = [
  {
    id: 'stablecoin',
    name: 'Stablecoin Vault',
    description: 'USDC/USDT deployed across audited on-chain yield strategies',
    icon: '💵',
    primaryAsset: 'USDC',
    acceptedAssets: ['USDC', 'USDT'],
    blendedApy: 0.082,
    tvl: 69_400_000,
    sharePrice: 1.0824,
    contractAddress: TRAMUNTANA_CONTRACTS.MASTER_VAULT_STABLECOIN,
    accountantAddress: TRAMUNTANA_CONTRACTS.ACCOUNTANT_STABLECOIN,
    tellerAddress: TRAMUNTANA_CONTRACTS.TELLER_STABLECOIN,
    chainId: 1,
    underlyingVaults: UNDERLYING_VAULTS.filter(v => v.id.includes('usdc')),
    status: 'active',
    minDeposit: 10,
    withdrawalDelay: 86400,    // 24h timelock
    managementFee: 0.005,      // 0.5% annual
    performanceFee: 0.10,      // 10% of profits
    swapFee: 0.001,            // 0.1% on swaps
  },
  {
    id: 'btc-assets',
    name: 'BTC & Assets Vault',
    description: 'BTC, ETH, SOL earning native yield via staking and structured products',
    icon: '₿',
    primaryAsset: 'BTC',
    acceptedAssets: ['USDC', 'USDT'],  // Accept USDC, swap internally
    blendedApy: 0.097,
    tvl: 29_000_000,
    sharePrice: 1.2140,
    contractAddress: TRAMUNTANA_CONTRACTS.MASTER_VAULT_BTC,
    accountantAddress: TRAMUNTANA_CONTRACTS.ACCOUNTANT_BTC,
    tellerAddress: TRAMUNTANA_CONTRACTS.TELLER_BTC,
    chainId: 1,
    underlyingVaults: UNDERLYING_VAULTS.filter(v => !v.id.includes('usdc')),
    status: 'active',
    minDeposit: 50,
    withdrawalDelay: 259200,   // 72h timelock (longer due to BTC bridge)
    managementFee: 0.005,
    performanceFee: 0.10,
    swapFee: 0.002,            // 0.2% on USDC→BTC swaps
  },
];

// Fee configuration for Tramuntana platform
export const PLATFORM_FEES = {
  /** Max swap fee we can charge (configurable per vault) */
  MAX_SWAP_FEE_BPS: 50,        // 0.5%
  /** Default rebalancing fee */
  DEFAULT_REBALANCE_FEE_BPS: 20, // 0.2%
  /** Protocol fee for vault management */
  MANAGEMENT_FEE_ANNUAL_BPS: 50, // 0.5%
} as const;
