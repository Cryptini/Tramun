'use client';

import { Card } from '@/components/ui/Card';
import { Badge, ChangeBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatUsd, formatRelativeTime } from '@/lib/utils/format';
import { Lock } from 'lucide-react';
import type { UserVaultPosition } from '@/types/vault';
import type { MasterVault } from '@/types/vault';
import { cn } from '@/lib/utils/cn';

interface VaultHoldingProps {
  vault: MasterVault;
  position: UserVaultPosition;
  onDeposit: () => void;
  onWithdraw: () => void;
}

export function VaultHolding({ vault, position, onDeposit, onWithdraw }: VaultHoldingProps) {
  const isStablecoin = vault.id === 'stablecoin';

  return (
    <Card variant="default" padding="none" className="overflow-hidden">
      <div className="p-4">
        {/* Top row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className={cn(
              'w-9 h-9 rounded-xl flex items-center justify-center text-lg',
              isStablecoin ? 'bg-primary-muted' : 'bg-warning-muted'
            )}>
              {vault.icon}
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">{vault.name}</p>
              <p className="text-xs text-text-muted">
                {vault.underlyingVaults.map(v => v.asset).join(' · ')}
              </p>
            </div>
          </div>

          <ChangeBadge value={position.unrealizedPnlPct} />
        </div>

        {/* Value */}
        <div className="flex items-end justify-between mb-3">
          <div>
            <p className="text-xl font-bold font-numeric text-text-primary">
              {formatUsd(position.valueUsd)}
            </p>
            <p className={cn(
              'text-sm font-numeric',
              position.unrealizedPnl >= 0 ? 'text-success' : 'text-danger'
            )}>
              {position.unrealizedPnl >= 0 ? '+' : ''}{formatUsd(position.unrealizedPnl)} all time
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-text-muted">Deposited</p>
            <p className="text-sm font-numeric text-text-secondary">
              {formatUsd(position.depositedUsd)}
            </p>
          </div>
        </div>

        {/* Progress bar — shows gain */}
        <div className="h-1.5 bg-bg-elevated rounded-full overflow-hidden mb-3">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-1000',
              position.unrealizedPnlPct >= 0 ? 'bg-success' : 'bg-danger'
            )}
            style={{ width: `${Math.min(Math.abs(position.unrealizedPnlPct) * 500, 100)}%` }}
          />
        </div>

        {/* Withdrawal status */}
        {!position.withdrawalAvailable && position.withdrawalUnlockAt && (
          <div className="flex items-center gap-2 text-xs text-text-muted mb-3">
            <Lock size={11} />
            <span>
              Withdrawal unlocks{' '}
              {formatRelativeTime(position.withdrawalUnlockAt)}
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" className="flex-1" onClick={onDeposit}>
            Add More
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex-1"
            disabled={!position.withdrawalAvailable}
            onClick={onWithdraw}
          >
            {position.withdrawalAvailable ? 'Withdraw' : (
              <span className="flex items-center gap-1">
                <Lock size={12} />
                Locked
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Strategy mini-bar */}
      <div className="px-4 pb-3 flex gap-1">
        {vault.underlyingVaults.map((uv) => (
          <div
            key={uv.id}
            className="relative flex-1 overflow-hidden"
            title={`${uv.name}: ${(uv.allocationWeight * 100).toFixed(0)}%`}
          >
            <div
              className={cn(
                'h-1 rounded-full',
                isStablecoin ? 'bg-primary/40' : 'bg-amber-400/40'
              )}
            />
          </div>
        ))}
      </div>
    </Card>
  );
}

/** Empty state when no holdings */
export function EmptyPortfolio({ onEarn }: { onEarn: () => void }) {
  return (
    <div className="text-center py-10 space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-bg-elevated border border-border flex items-center justify-center mx-auto">
        <span className="text-2xl">📈</span>
      </div>
      <div>
        <h3 className="text-base font-semibold text-text-primary">No holdings yet</h3>
        <p className="text-sm text-text-secondary mt-1">
          Deposit into a vault to start earning yield
        </p>
      </div>
      <Button variant="primary" onClick={onEarn}>
        Start Earning
      </Button>
    </div>
  );
}
