'use client';

import { useState } from 'react';
import { PerformanceChart } from '@/components/portfolio/PerformanceChart';
import { VaultHolding, EmptyPortfolio } from '@/components/portfolio/VaultHolding';
import { DepositModal } from '@/components/earn/DepositModal';
import { Card } from '@/components/ui/Card';
import { Badge, ChangeBadge } from '@/components/ui/Badge';
import { useAppStore } from '@/store/appStore';
import { MASTER_VAULTS } from '@/lib/veda/constants';
import { formatUsd } from '@/lib/utils/format';
import type { MasterVault } from '@/types/vault';

export function PortfolioTab() {
  const {
    portfolioSummary,
    vaultPositions,
    isAuthenticated,
    setActiveTab,
  } = useAppStore();

  const [depositVault, setDepositVault] = useState<MasterVault | null>(null);

  const hasPositions = vaultPositions.some(p => p.valueUsd > 0);
  const isDemoMode = !isAuthenticated && hasPositions;

  return (
    <div className="px-5 pt-2 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-[22px] font-bold text-text-primary">Portfolio</h1>
        {isDemoMode && (
          <Badge variant="warning" size="sm" dot>Demo Mode</Badge>
        )}
      </div>

      {/* Total value hero */}
      <div className="hero-banner p-6 mb-5">
        <div className="relative z-10">
          <p className="text-white/70 text-sm font-medium mb-1">Total Value</p>
          <p className="text-[36px] font-bold font-numeric text-white leading-tight">
            {formatUsd(portfolioSummary.totalValueUsd)}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="inline-flex items-center gap-1 bg-white/15 backdrop-blur rounded-full px-2.5 py-1 text-white text-xs font-semibold">
              {portfolioSummary.pnlDayPct >= 0 ? '+' : ''}{(portfolioSummary.pnlDayPct * 100).toFixed(2)}% today
            </span>
            <span className="text-white/60 text-xs">
              {portfolioSummary.pnlDay >= 0 ? '+' : ''}{formatUsd(portfolioSummary.pnlDay)}
            </span>
          </div>
        </div>
      </div>

      {/* Chart card */}
      <Card variant="default" className="mb-5 overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[15px] font-bold text-text-primary">Performance</h2>
          <Badge variant="primary" size="sm">
            +{(portfolioSummary.pnlTotalPct * 100).toFixed(1)}% all time
          </Badge>
        </div>
        <PerformanceChart />
      </Card>

      {/* Holdings */}
      <div className="mb-4">
        <h2 className="text-[15px] font-bold text-text-primary mb-3">Holdings</h2>

        {!hasPositions ? (
          <EmptyPortfolio onEarn={() => setActiveTab('earn')} />
        ) : (
          <div className="space-y-3">
            {MASTER_VAULTS.map((vault) => {
              const position = vaultPositions.find(p => p.vaultId === vault.id);
              if (!position || position.valueUsd === 0) return null;
              return (
                <VaultHolding
                  key={vault.id}
                  vault={vault}
                  position={position}
                  onDeposit={() => setDepositVault(vault)}
                  onWithdraw={() => { }}
                />
              );
            })}

            {portfolioSummary.cashUsd > 0 && (
              <Card variant="default">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-success/10 flex items-center justify-center">
                      💵
                    </div>
                    <div>
                      <p className="text-sm font-bold text-text-primary">Cash</p>
                      <p className="text-xs text-text-muted">USDC · Not deployed</p>
                    </div>
                  </div>
                  <p className="text-sm font-bold font-numeric text-text-primary">
                    {formatUsd(portfolioSummary.cashUsd)}
                  </p>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Summary stats */}
      {hasPositions && (
        <div className="mb-4">
          <h3 className="text-[15px] font-bold text-text-primary mb-3">Summary</h3>
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { label: 'Total Deposited', value: formatUsd(vaultPositions.reduce((s, p) => s + p.depositedUsd, 0)) },
              { label: 'Current Value', value: formatUsd(portfolioSummary.vaultValueUsd) },
              { label: 'Total Earned', value: formatUsd(portfolioSummary.pnlTotal), positive: true },
              { label: 'Active Vaults', value: String(vaultPositions.filter(p => p.valueUsd > 0).length) },
            ].map((stat) => (
              <div key={stat.label} className="bg-gray-50 rounded-2xl p-3.5 border border-border/30">
                <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1 font-medium">{stat.label}</p>
                <p className={`text-sm font-bold font-numeric ${stat.positive ? 'text-success' : 'text-text-primary'}`}>
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Allocation */}
      {hasPositions && (
        <Card variant="default" className="mb-6">
          <h3 className="text-[15px] font-bold text-text-primary mb-3">Allocation</h3>
          <div className="space-y-3">
            {MASTER_VAULTS.map((vault) => {
              const position = vaultPositions.find(p => p.vaultId === vault.id);
              if (!position) return null;
              const pct = portfolioSummary.totalValueUsd > 0
                ? (position.valueUsd / portfolioSummary.totalValueUsd) * 100
                : 0;
              return (
                <div key={vault.id}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2">
                      <span>{vault.icon}</span>
                      <span className="text-text-primary font-medium">{vault.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-text-muted">{formatUsd(position.valueUsd)}</span>
                      <span className="text-text-primary font-bold font-numeric">{pct.toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${vault.id === 'stablecoin' ? 'bg-primary' : 'bg-accent-coral'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {depositVault && (
        <DepositModal
          isOpen={!!depositVault}
          onClose={() => setDepositVault(null)}
          vault={depositVault}
        />
      )}
    </div>
  );
}
