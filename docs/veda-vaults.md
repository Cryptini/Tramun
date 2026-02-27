# Veda Vault Integration Guide

> **Sources:**
> - https://docs.veda.tech/integrations/boringvault-protocol-integration
> - https://docs.morpho.org/get-started/

## Overview

Tramuntana uses Veda's BoringVault architecture to create a curated "index" of DeFi yield strategies. Users deposit USDC into a Tramuntana Master Vault, which in turn allocates to pre-selected underlying strategy vaults.

### Architecture

```
User deposits USDC
      │
      ▼
┌─────────────────────────────────┐
│  Tramuntana Master Vault        │
│  (BoringVault.sol)              │
│                                 │
│  Accountant.sol ─ share prices  │
│  Teller.sol ─ deposit/withdraw  │
└────────────┬────────────────────┘
             │
     ┌───────┴───────┐
     │               │
     ▼               ▼
┌─────────┐   ┌─────────────┐
│Stablecoin│   │ BTC & Assets │
│ Vault    │   │ Vault        │
└──┬──┬───┘   └──┬──────────┘
   │  │          │
   ▼  ▼          ▼
Morpho  Lagoon  Lagoon
Upshift         Prime ETH
```

---

## Key Contracts

### BoringVault.sol
The core ERC4626-compatible vault contract.
- Holds underlying assets
- Issues shares to depositors
- Managed by a StrategyManager

### Accountant.sol
Tracks share price and vault performance.
- Provides `getRate()` — share price in base asset
- Calculates management and performance fees

### Teller.sol
User-facing deposit and withdrawal interface.
- `deposit(asset, amount, minimumShares, deadline)` — deposit assets, receive shares
- `requestWithdrawal(shares, asset, deadline)` — queue a withdrawal
- `completeWithdrawal(withdrawRequest)` — claim funds after timelock

---

## Deposit Flow

```typescript
import { parseUnits, createWalletClient } from 'viem';
import { mainnet } from 'viem/chains';

async function depositIntoVault(
  walletClient: WalletClient,
  amount: number,        // In USDC (e.g. 1000)
  vaultId: 'stablecoin' | 'btc-assets'
) {
  const vault = MASTER_VAULTS.find(v => v.id === vaultId)!;
  const amountBn = parseUnits(amount.toString(), 6); // USDC has 6 decimals

  // Step 1: Approve USDC to Teller contract
  const usdcAddress = USDC_ADDRESSES[1]; // Ethereum mainnet
  await walletClient.writeContract({
    address: usdcAddress,
    abi: ERC20_ABI,
    functionName: 'approve',
    args: [vault.tellerAddress, amountBn],
  });

  // Step 2: Deposit via Teller
  const minShares = amountBn * 99n / 100n; // 1% slippage
  const deadline = BigInt(Math.floor(Date.now() / 1000) + 300); // 5 min

  const tx = await walletClient.writeContract({
    address: vault.tellerAddress,
    abi: TELLER_ABI,
    functionName: 'deposit',
    args: [
      usdcAddress,   // depositAsset
      amountBn,      // depositAmount
      minShares,     // minimumMint (slippage)
      deadline,      // deadline
    ],
  });

  return tx;
}
```

---

## Withdrawal Flow (with Timelock)

```typescript
// Step 1: Request withdrawal (enters queue, starts timelock)
async function requestWithdrawal(shares: bigint, vaultId: string) {
  const vault = MASTER_VAULTS.find(v => v.id === vaultId)!;
  const deadline = BigInt(Math.floor(Date.now() / 1000) + 300);

  await walletClient.writeContract({
    address: vault.tellerAddress,
    abi: TELLER_ABI,
    functionName: 'requestWithdraw',
    args: [
      vault.contractAddress,  // vault
      shares,                 // shareAmount
      USDC_ADDRESSES[1],     // receiveAsset
      deadline,
    ],
  });
}

// Step 2: After timelock expires, complete withdrawal
async function completeWithdrawal(withdrawRequest: WithdrawalRequest) {
  await walletClient.writeContract({
    address: vault.tellerAddress,
    abi: TELLER_ABI,
    functionName: 'completeWithdraw',
    args: [withdrawRequest],
  });
}
```

---

## Timelocks

| Vault | Timelock | Reason |
|---|---|---|
| Stablecoin | 24h | Protects against flash loan attacks |
| BTC & Assets | 72h | BTC bridge settlement time |

**Important**: Timelocks are enforced at the contract level and CANNOT be bypassed. This protects users from flash loan attacks that could drain underlying strategies.

Communicate clearly in the UI:
- Show withdrawal unlock timestamp prominently
- Countdown timer when withdrawal is pending
- Explain why the timelock exists

---

## Strategy Rebalancing

To swap an underperforming strategy, the vault manager calls:
```solidity
// Only callable by vault manager with timelock
function updateStrategyAllocations(
    address[] calldata strategies,
    uint256[] calldata weights
) external onlyManager timelocked(3 days) { ... }
```

**Process:**
1. Governance vote or multisig approval
2. Submit transaction with 3-day timelock
3. Users can withdraw during timelock if they disagree
4. Timelock expires → new allocation applies

---

## Swap Fee Configuration

When users deposit USDC into the BTC & Assets vault, we swap USDC → WBTC/WETH:

```typescript
// Fee is charged on the swap, configurable by admin
const SWAP_FEE_BPS = 20; // 0.2% default

function calculateSwapFee(usdcAmount: number): number {
  return usdcAmount * SWAP_FEE_BPS / 10000;
}
```

Max fee: 50 bps (0.5%) — hardcoded in contract.
Default: 20 bps (0.2%).
We can lower to 0 for promotions.

---

## Underlying Vault Examples

| Vault | Protocol | Asset | APY | Chain |
|---|---|---|---|---|
| Steakhouse USDC | Morpho | USDC | 7.1% | Ethereum |
| Tulipa Capital USDC | Lagoon | USDC | 9.2% | Ethereum |
| Upshift USDC Pool | Upshift | USDC | 8.5% | Ethereum |
| Steakhouse Prime ETH | Lagoon/Morpho | ETH | 12.1% | Monad/ETH |
| Tulipa Capital BTC | Lagoon | BTC | 6.8% | Ethereum |

> APYs are variable and change with market conditions. Always fetch live data.

---

## Fee Structure

| Fee | Rate | Recipient |
|---|---|---|
| Management fee | 0.5%/year | Tramuntana treasury |
| Performance fee | 10% of profits | Tramuntana treasury |
| Swap fee | 0.2% on BTC vault swaps | Tramuntana treasury |
| Underlying protocol fees | Variable | Respective protocols |

---

## Morpho Reference

Morpho Blue is the lending protocol powering the Steakhouse USDC vault.

Key concepts from Morpho docs:
- **Markets**: Each market is identified by `(loanToken, collateralToken, oracle, irm, lltv)`
- **Vaults**: ERC4626-compliant, curated list of markets
- **No oracle manipulation risk**: Morpho uses time-weighted average prices
- **Non-upgradeable**: Core Morpho Blue contracts are immutable

Relevant for Tramuntana:
- We don't interact with Morpho directly — we go through the Steakhouse vault
- Steakhouse vault manager handles market selection and risk management
- Our exposure is to Steakhouse vault's track record and audit status

---

## Audit Requirements

Before going live:
1. **Tramuntana BoringVault contracts** — full audit (recommend Trail of Bits or Spearbit)
2. **Underlying vault contracts** — verify existing audits
   - Morpho Blue: Audited by Trail of Bits, Cantina, and others
   - Lagoon Finance: Verify current audit status
   - Upshift Finance: Verify current audit status
3. **Dependency review** — OpenZeppelin, Veda base contracts
