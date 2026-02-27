'use client';

import { useState } from 'react';
import { Card, CardDivider } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatApy, formatTvl, formatUsd } from '@/lib/utils/format';
import { ChevronDown, Info, Shield } from 'lucide-react';
import type { MasterVault } from '@/types/vault';
import type { UserVaultPosition } from '@/types/vault';
import { cn } from '@/lib/utils/cn';

interface VaultCardProps {
  vault: MasterVault;
  position?: UserVaultPosition;
  onDeposit: () => void;
  onWithdraw?: () => void;
  compact?: boolean;
}

export function VaultCard({ vault, position, onDeposit, onWithdraw, compact = false }: VaultCardProps) {
  const [expanded, setExpanded] = useState(false);
  const hasPosition = position && position.valueUsd > 0;

  const isStablecoin = vault.id === 'stablecoin';

  return (
    <Card
      variant="default"
      padding="none"
      className={cn(
        'overflow-hidden border',
        isStablecoin ? 'border-primary/15' : 'border-warning/15',
        'transition-all duration-200'
      )}
    >
      {/* Header gradient stripe */}
      <div
        className={cn(
          'h-1 w-full',
          isStablecoin ? 'bg-primary-gradient' : 'bg-gradient-to-r from-amber-500 to-orange-500'
        )}
      />

      <div className="p-4">
        {/* Vault name row */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center text-xl',
              isStablecoin ? 'bg-primary-muted' : 'bg-warning-muted'
            )}>
              {vault.icon}
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-text-primary leading-tight">
                {vault.name}
              </h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Badge variant={vault.status === 'active' ? 'success' : 'warning'} size="sm" dot>
                  {vault.status === 'active' ? 'Live' : 'Paused'}
                </Badge>
                <Shield size={10} className="text-text-muted" />
                <span className="text-[10px] text-text-muted">Audited</span>
              </div>
            </div>
          </div>

          {/* APY badge */}
          <div className="text-right">
            <div className={cn(
              'text-2xl font-bold font-numeric',
              isStablecoin ? 'gradient-text-primary' : 'text-amber-400'
            )}>
              {formatApy(vault.blendedApy)}
            </div>
            <p className="text-[10px] text-text-muted mt-0.5">APY</p>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-bg-elevated rounded-xl p-3">
            <p className="text-[10px] text-text-muted uppercase tracking-wide mb-0.5">Total Value</p>
            <p className="text-sm font-semibold text-text-primary font-numeric">
              {formatTvl(vault.tvl)}
            </p>
          </div>
          <div className="bg-bg-elevated rounded-xl p-3">
            <p className="text-[10px] text-text-muted uppercase tracking-wide mb-0.5">My Deposit</p>
            <p className="text-sm font-semibold text-text-primary font-numeric">
              {hasPosition ? formatUsd(position.valueUsd) : '–'}
            </p>
            {hasPosition && position.unrealizedPnlPct > 0 && (
              <p className="text-[10px] text-success mt-0.5">
                +{(position.unrealizedPnlPct * 100).toFixed(1)}% return
              </p>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-text-muted mb-4 leading-relaxed">
          {vault.description}
        </p>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="primary"
            size="sm"
            className="flex-1"
            onClick={onDeposit}
          >
            Deposit
          </Button>
          {hasPosition && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onWithdraw}
            >
              Withdraw
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="px-2"
          >
            <ChevronDown
              size={16}
              className={cn('transition-transform', expanded && 'rotate-180')}
            />
          </Button>
        </div>

        {/* Expanded: Strategy breakdown */}
        {expanded && (
          <div className="mt-4 animate-fade-in">
            <CardDivider />
            <p className="text-xs font-medium text-text-secondary mb-3">
              Underlying Strategies
            </p>
            <div className="space-y-2">
              {vault.underlyingVaults.map((uv) => (
                <div key={uv.id} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-bg-elevated flex items-center justify-center">
                      <span className="text-[10px] font-bold text-text-muted">
                        {uv.protocol[0].toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-text-primary">{uv.name}</p>
                      <p className="text-[10px] text-text-muted capitalize">{uv.protocol}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-success">
                      {formatApy(uv.apy)}
                    </p>
                    <p className="text-[10px] text-text-muted">
                      {(uv.allocationWeight * 100).toFixed(0)}% weight
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Fees */}
            <CardDivider />
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px]">
                <span className="text-text-muted">Management fee</span>
                <span className="text-text-secondary">
                  {(vault.managementFee * 100).toFixed(1)}%/yr
                </span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-text-muted">Performance fee</span>
                <span className="text-text-secondary">
                  {(vault.performanceFee * 100).toFixed(0)}% of profits
                </span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-text-muted flex items-center gap-1">
                  Withdrawal delay
                  <Info size={9} />
                </span>
                <span className="text-text-secondary">
                  {vault.withdrawalDelay / 3600}h
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
