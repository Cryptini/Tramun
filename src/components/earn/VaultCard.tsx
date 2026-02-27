'use client';

import { useState } from 'react';
import { Card, CardDivider } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatApy, formatTvl, formatUsd } from '@/lib/utils/format';
import { ChevronDown, Shield } from 'lucide-react';
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

  const accentColor = isStablecoin ? 'primary' : 'accent-coral';
  const gradientClass = isStablecoin
    ? 'from-primary/8 to-accent-blue/4'
    : 'from-accent-coral/8 to-accent-orange/4';

  return (
    <Card
      variant="default"
      padding="none"
      className="overflow-hidden"
    >
      {/* Top accent gradient */}
      <div className={cn('h-1.5 w-full', isStablecoin ? 'bg-primary' : 'bg-gradient-to-r from-accent-coral to-accent-orange')} />

      <div className="p-4">
        {/* Vault header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={cn(
              'w-11 h-11 rounded-2xl flex items-center justify-center text-xl',
              `bg-gradient-to-br ${gradientClass}`
            )}>
              {vault.icon}
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-text-primary leading-tight">
                {vault.name}
              </h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Badge variant={vault.status === 'active' ? 'success' : 'warning'} size="sm" dot>
                  {vault.status === 'active' ? 'Live' : 'Paused'}
                </Badge>
                <div className="flex items-center gap-0.5 text-text-muted">
                  <Shield size={10} />
                  <span className="text-[10px]">Audited</span>
                </div>
              </div>
            </div>
          </div>

          {/* APY badge — prominent */}
          <div className="text-right">
            <div className={cn(
              'text-2xl font-bold font-numeric',
              isStablecoin ? 'text-primary' : 'text-accent-coral'
            )}>
              {formatApy(vault.blendedApy)}
            </div>
            <p className="text-[10px] text-text-muted font-medium mt-0.5">APY</p>
          </div>
        </div>

        {/* Key stats — clean 2-column */}
        <div className="grid grid-cols-2 gap-2.5 mb-3">
          <div className="bg-gray-50 rounded-xl p-2.5">
            <p className="text-[10px] text-text-muted uppercase tracking-wider mb-0.5">TVL</p>
            <p className="text-sm font-bold text-text-primary font-numeric">
              {formatTvl(vault.tvl)}
            </p>
          </div>
          <div className="bg-gray-50 rounded-xl p-2.5">
            <p className="text-[10px] text-text-muted uppercase tracking-wider mb-0.5">My Position</p>
            <p className="text-sm font-bold text-text-primary font-numeric">
              {hasPosition ? formatUsd(position.valueUsd) : '–'}
            </p>
            {hasPosition && position.unrealizedPnlPct > 0 && (
              <p className="text-[10px] text-success font-semibold">
                +{(position.unrealizedPnlPct * 100).toFixed(1)}%
              </p>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-text-muted mb-3.5 leading-relaxed">
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
            className="px-2.5"
          >
            <ChevronDown
              size={16}
              className={cn('transition-transform text-text-muted', expanded && 'rotate-180')}
            />
          </Button>
        </div>

        {/* Expanded: Strategy breakdown */}
        {expanded && (
          <div className="mt-4 animate-fade-in">
            <CardDivider />
            <p className="text-xs font-bold text-text-primary mb-3 uppercase tracking-wider">
              Strategies
            </p>
            <div className="space-y-2">
              {vault.underlyingVaults.map((uv) => (
                <div key={uv.id} className="flex items-center justify-between py-2 px-2 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-primary">
                        {uv.protocol[0].toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-text-primary">{uv.name}</p>
                      <p className="text-[10px] text-text-muted capitalize">{uv.protocol}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-success">
                      {formatApy(uv.apy)}
                    </p>
                    <p className="text-[10px] text-text-muted">
                      {(uv.allocationWeight * 100).toFixed(0)}%
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
                <span className="text-text-primary font-medium">
                  {(vault.managementFee * 100).toFixed(1)}%/yr
                </span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-text-muted">Performance fee</span>
                <span className="text-text-primary font-medium">
                  {(vault.performanceFee * 100).toFixed(0)}% of profits
                </span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-text-muted">Withdrawal delay</span>
                <span className="text-text-primary font-medium">
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
