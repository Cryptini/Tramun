'use client';

import { useState } from 'react';
import { VaultCard } from '@/components/earn/VaultCard';
import { DepositModal } from '@/components/earn/DepositModal';
import { OnrampModal } from '@/components/onramp/OnrampModal';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAppStore } from '@/store/appStore';
import { MASTER_VAULTS, EXPLORE_VAULTS } from '@/lib/veda/constants';
import { formatUsd, formatApy } from '@/lib/utils/format';
import { Plus, ArrowUpRight, Shield, Bell, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { MasterVault } from '@/types/vault';

export function EarnTab() {
  const { isAuthenticated, user, portfolioSummary, vaultPositions } = useAppStore();
  const [depositVault, setDepositVault] = useState<MasterVault | null>(null);
  const [showOnramp, setShowOnramp] = useState(false);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const userName = user?.displayName?.split(' ')[0] ?? null;

  const hasPositions = vaultPositions.some(p => p.valueUsd > 0);

  // Calculate daily return estimate from APY across all positions
  const dailyReturnEstimate = vaultPositions.reduce((sum, pos) => {
    const vault = MASTER_VAULTS.find(v => v.id === pos.vaultId);
    if (!vault || pos.valueUsd === 0) return sum;
    return sum + (pos.valueUsd * vault.blendedApy) / 365;
  }, 0);

  return (
    <div className="px-5 pt-2 animate-fade-in">
      {/* Hero balance card */}
      <div className="hero-banner p-6 mb-5">
        <div className="relative z-10">
          <p className="text-white/70 text-sm font-medium mb-1">
            {isAuthenticated && userName ? `${greeting}, ${userName}` : 'Total Balance'}
          </p>
          <p className="text-[36px] font-bold text-white font-numeric leading-tight">
            {formatUsd(portfolioSummary.totalValueUsd)}
          </p>
          {portfolioSummary.pnlDay !== 0 && (
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1 bg-white/15 backdrop-blur rounded-full px-2.5 py-1 text-white text-xs font-semibold">
                <ArrowUpRight size={12} />
                +{(portfolioSummary.pnlDayPct * 100).toFixed(2)}% today
              </span>
              <span className="text-white/60 text-xs">
                {portfolioSummary.pnlDay >= 0 ? '+' : ''}{formatUsd(portfolioSummary.pnlDay)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Quick actions — Revolut-style circular buttons */}
      {isAuthenticated && (
        <div className="flex justify-around mb-6 px-4">
          <button
            onClick={() => setShowOnramp(true)}
            className="flex flex-col items-center gap-1.5"
          >
            <div className="action-circle bg-primary/10">
              <Plus size={20} className="text-primary" />
            </div>
            <span className="text-xs font-medium text-text-secondary">Add</span>
          </button>
          <button className="flex flex-col items-center gap-1.5">
            <div className="action-circle bg-accent-blue/10">
              <ArrowUpRight size={20} className="text-accent-blue" />
            </div>
            <span className="text-xs font-medium text-text-secondary">Send</span>
          </button>
          <button className="flex flex-col items-center gap-1.5">
            <div className="action-circle bg-success/10">
              <Shield size={20} className="text-success" />
            </div>
            <span className="text-xs font-medium text-text-secondary">Earn</span>
          </button>
        </div>
      )}

      {/* ── Your Positions ─────────────────────────────────── */}
      {hasPositions && (
        <div className="mb-5">
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-[17px] font-bold text-text-primary">Your Positions</h2>
            <div className="flex items-center gap-1.5 text-xs text-text-muted">
              <span className="font-numeric font-medium text-success">
                ~{formatUsd(dailyReturnEstimate)}/day
              </span>
            </div>
          </div>

          {/* Summary card — daily + total return */}
          <Card variant="default" padding="none" className="mb-3 overflow-hidden">
            <div className="grid grid-cols-2 divide-x divide-border/50">
              <div className="p-3.5 text-center">
                <p className="text-[10px] text-text-muted uppercase tracking-wider font-medium mb-1">Daily Return</p>
                <p className="text-lg font-bold font-numeric text-success">
                  +{formatUsd(dailyReturnEstimate)}
                </p>
                <p className="text-[10px] text-text-muted mt-0.5">estimated</p>
              </div>
              <div className="p-3.5 text-center">
                <p className="text-[10px] text-text-muted uppercase tracking-wider font-medium mb-1">Total Return</p>
                <p className={cn(
                  'text-lg font-bold font-numeric',
                  portfolioSummary.pnlTotal >= 0 ? 'text-success' : 'text-danger'
                )}>
                  {portfolioSummary.pnlTotal >= 0 ? '+' : ''}{formatUsd(portfolioSummary.pnlTotal)}
                </p>
                <p className="text-[10px] text-text-muted mt-0.5">
                  {portfolioSummary.pnlTotalPct >= 0 ? '+' : ''}{(portfolioSummary.pnlTotalPct * 100).toFixed(1)}% all time
                </p>
              </div>
            </div>
          </Card>

          {/* Position breakdown per vault */}
          <div className="space-y-2">
            {MASTER_VAULTS.map((vault) => {
              const position = vaultPositions.find(p => p.vaultId === vault.id);
              if (!position || position.valueUsd === 0) return null;

              const dailyEarn = (position.valueUsd * vault.blendedApy) / 365;
              const allocationPct = portfolioSummary.totalValueUsd > 0
                ? (position.valueUsd / portfolioSummary.totalValueUsd) * 100
                : 0;
              const isStablecoin = vault.id === 'stablecoin';

              return (
                <Card
                  key={vault.id}
                  variant="default"
                  padding="sm"
                  interactive
                  onClick={() => setDepositVault(vault)}
                >
                  <div className="flex items-center gap-3">
                    {/* Icon + allocation bar */}
                    <div className="relative">
                      <div className={cn(
                        'w-11 h-11 rounded-2xl flex items-center justify-center text-xl',
                        isStablecoin ? 'bg-primary/10' : 'bg-accent-coral/10'
                      )}>
                        {vault.icon}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <p className="text-sm font-bold text-text-primary truncate">{vault.name}</p>
                        <p className="text-sm font-bold font-numeric text-text-primary ml-2">
                          {formatUsd(position.valueUsd)}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={isStablecoin ? 'primary' : 'warning'}
                            size="sm"
                          >
                            {formatApy(vault.blendedApy)} APY
                          </Badge>
                          <span className="text-[10px] text-text-muted">
                            {allocationPct.toFixed(0)}% of portfolio
                          </span>
                        </div>
                        <span className={cn(
                          'text-xs font-semibold font-numeric',
                          position.unrealizedPnl >= 0 ? 'text-success' : 'text-danger'
                        )}>
                          {position.unrealizedPnl >= 0 ? '+' : ''}{formatUsd(position.unrealizedPnl)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Mini allocation bar */}
                  <div className="flex gap-0.5 mt-2.5">
                    <div
                      className={cn(
                        'h-1 rounded-full transition-all',
                        isStablecoin ? 'bg-primary' : 'bg-accent-coral'
                      )}
                      style={{ width: `${allocationPct}%` }}
                    />
                    <div className="h-1 rounded-full bg-gray-100 flex-1" />
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Active Vaults ──────────────────────────────────── */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-[17px] font-bold text-text-primary">Vaults</h2>
          <span className="text-xs text-text-muted">{MASTER_VAULTS.length} available</span>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {MASTER_VAULTS.map((vault) => {
            const position = vaultPositions.find(p => p.vaultId === vault.id);
            return (
              <VaultCard
                key={vault.id}
                vault={vault}
                position={position}
                onDeposit={() => setDepositVault(vault)}
                onWithdraw={() => { /* open withdraw modal */ }}
              />
            );
          })}
        </div>
      </div>

      {/* ── Explore — Coming Soon Strategies ───────────────── */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-[17px] font-bold text-text-primary">Explore</h2>
          <span className="text-xs text-text-muted">{EXPLORE_VAULTS.length} strategies</span>
        </div>

        <div className="space-y-2.5">
          {EXPLORE_VAULTS.map((explore) => (
            <Card key={explore.id} variant="default" padding="sm" className="group">
              <div className="flex items-center gap-3">
                {/* Icon */}
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ backgroundColor: `${explore.color}14` }}
                >
                  <span style={{ color: explore.color }}>{explore.icon}</span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-text-primary">{explore.name}</p>
                      <Badge
                        variant={explore.status === 'waitlist' ? 'warning' : 'neutral'}
                        size="sm"
                      >
                        {explore.status === 'coming_soon' ? 'Coming Soon' : 'Waitlist'}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold font-numeric" style={{ color: explore.color }}>
                        {formatApy(explore.estimatedApy)}
                      </p>
                      <p className="text-[9px] text-text-muted">Est. APY</p>
                    </div>
                  </div>

                  <p className="text-xs text-text-muted leading-relaxed line-clamp-1">
                    {explore.description}
                  </p>

                  {/* Tags */}
                  <div className="flex items-center gap-1.5 mt-2">
                    {explore.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: `${explore.color}10`,
                          color: explore.color,
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                    {explore.tvl && (
                      <span className="text-[10px] text-text-muted ml-auto">
                        TVL ${(explore.tvl / 1_000_000).toFixed(1)}M
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Notify me button */}
              <button className="mt-3 w-full flex items-center justify-center gap-1.5 h-8 rounded-xl border border-border/60 text-xs font-semibold text-text-secondary hover:bg-gray-50 hover:border-primary/30 hover:text-primary transition-all active:scale-[0.98]">
                <Bell size={12} />
                Notify Me
              </button>
            </Card>
          ))}
        </div>
      </div>

      {/* How it works — cleaner Revolut-style */}
      <div className="mb-5">
        <h3 className="text-[15px] font-bold text-text-primary mb-3 px-1">How it works</h3>
        <div className="space-y-2.5">
          {[
            { step: '1', text: 'Deposit USDC into a vault', color: 'bg-primary' },
            { step: '2', text: 'Deployed across audited DeFi strategies', color: 'bg-accent-blue' },
            { step: '3', text: 'Yield compounds daily, automatically', color: 'bg-success' },
            { step: '4', text: 'Withdraw anytime after timelock', color: 'bg-accent-coral' },
          ].map((item) => (
            <div key={item.step} className="flex items-center gap-3 bg-white rounded-xl p-3 border border-border/50">
              <div className={`w-7 h-7 rounded-full ${item.color} flex items-center justify-center flex-shrink-0`}>
                <span className="text-xs font-bold text-white">{item.step}</span>
              </div>
              <span className="text-sm text-text-primary font-medium">{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      {depositVault && (
        <DepositModal
          isOpen={!!depositVault}
          onClose={() => setDepositVault(null)}
          vault={depositVault}
        />
      )}
      <OnrampModal
        isOpen={showOnramp}
        onClose={() => setShowOnramp(false)}
      />
    </div>
  );
}
