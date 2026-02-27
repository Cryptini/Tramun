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

  // Show mock data in demo mode (when not authenticated but positions exist)
  const hasPositions = vaultPositions.some(p => p.valueUsd > 0);
  const isDemoMode = !isAuthenticated && hasPositions;

  return (
    <div className="px-4 pt-2 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-[22px] font-bold text-text-primary">Portfolio</h1>
        {isDemoMode && (
          <Badge variant="warning" size="sm" dot>Demo Mode</Badge>
        )}
      </div>

      {/* Total value card */}
      <Card variant="default" className="mb-4" style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.05) 0%, rgba(16,185,129,0.03) 100%)' }}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm text-text-muted mb-1">Total Portfolio Value</p>
            <p className="text-3xl font-bold font-numeric text-text-primary">
              {formatUsd(portfolioSummary.totalValueUsd)}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <ChangeBadge value={portfolioSummary.pnlDayPct} />
              <span className="text-xs text-text-muted">
                {portfolioSummary.pnlDay >= 0 ? '+' : ''}{formatUsd(portfolioSummary.pnlDay)} today
              </span>
            </div>
          </div>
          <Badge variant="primary" size="md">
            +{(portfolioSummary.pnlTotalPct * 100).toFixed(1)}% total
          </Badge>
        </div>

        {/* Performance chart — always shown when there's data */}
        <PerformanceChart />
      </Card>

      {/* Holdings */}
      <div className="mb-4">
        <h2 className="text-[15px] font-semibold text-text-primary mb-3">Holdings</h2>

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
                  onWithdraw={() => {}}
                />
              );
            })}

            {portfolioSummary.cashUsd > 0 && (
              <Card variant="elevated">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-success-muted flex items-center justify-center">
                      💵
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-text-primary">Cash</p>
                      <p className="text-xs text-text-muted">USDC · Not deployed</p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold font-numeric text-text-primary">
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
        <Card variant="elevated" className="mb-4">
          <h3 className="text-sm font-semibold text-text-primary mb-3">Summary</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Total Deposited', value: formatUsd(vaultPositions.reduce((s, p) => s + p.depositedUsd, 0)) },
              { label: 'Current Value', value: formatUsd(portfolioSummary.vaultValueUsd) },
              { label: 'Total Earned', value: formatUsd(portfolioSummary.pnlTotal), positive: true },
              { label: 'Active Vaults', value: String(vaultPositions.filter(p => p.valueUsd > 0).length) },
            ].map((stat) => (
              <div key={stat.label} className="bg-bg-card rounded-xl p-3">
                <p className="text-[10px] text-text-muted uppercase tracking-wide mb-1">{stat.label}</p>
                <p className={`text-sm font-semibold font-numeric ${stat.positive ? 'text-success' : 'text-text-primary'}`}>
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Allocation bar chart */}
      {hasPositions && (
        <Card variant="elevated" className="mb-6">
          <h3 className="text-sm font-semibold text-text-primary mb-3">Allocation</h3>
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
                      <span className="text-text-secondary">{vault.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-text-muted">{formatUsd(position.valueUsd)}</span>
                      <span className="text-text-primary font-numeric font-medium">{pct.toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="h-2 bg-bg-card rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${vault.id === 'stablecoin' ? 'bg-primary' : 'bg-amber-400'}`}
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
