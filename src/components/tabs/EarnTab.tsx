'use client';

import { useState } from 'react';
import { VaultCard } from '@/components/earn/VaultCard';
import { DepositModal } from '@/components/earn/DepositModal';
import { OnrampModal } from '@/components/onramp/OnrampModal';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAppStore } from '@/store/appStore';
import { MASTER_VAULTS } from '@/lib/veda/constants';
import { formatUsd, formatApy } from '@/lib/utils/format';
import { Plus, TrendingUp, Shield } from 'lucide-react';
import type { MasterVault } from '@/types/vault';

export function EarnTab() {
  const { isAuthenticated, user, portfolioSummary, vaultPositions } = useAppStore();
  const [depositVault, setDepositVault] = useState<MasterVault | null>(null);
  const [showOnramp, setShowOnramp] = useState(false);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const userName = user?.displayName?.split(' ')[0] ?? null;

  const totalEarning = vaultPositions.reduce((sum, p) => sum + p.unrealizedPnl, 0);
  const blendedApy = MASTER_VAULTS.reduce((sum, v) => sum + v.blendedApy, 0) / MASTER_VAULTS.length;

  return (
    <div className="px-4 pt-2 animate-fade-in">
      {/* Greeting header */}
      <div className="mb-5">
        <h1 className="text-[22px] font-bold text-text-primary">
          {isAuthenticated && userName ? `${greeting}, ${userName}` : 'Earn Yield'}
        </h1>
        {isAuthenticated && portfolioSummary.vaultValueUsd > 0 ? (
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-sm text-text-muted">Total earning</span>
            <span className="text-base font-semibold text-success">
              {formatUsd(portfolioSummary.vaultValueUsd)}
            </span>
          </div>
        ) : (
          <p className="text-sm text-text-secondary mt-1">
            Deploy capital into audited DeFi strategies
          </p>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-bg-elevated rounded-xl p-3 text-center">
          <TrendingUp size={14} className="text-success mx-auto mb-1" />
          <p className="text-base font-bold text-success">{formatApy(blendedApy)}</p>
          <p className="text-[10px] text-text-muted">Avg APY</p>
        </div>
        <div className="bg-bg-elevated rounded-xl p-3 text-center">
          <Shield size={14} className="text-primary mx-auto mb-1" />
          <p className="text-base font-bold text-text-primary">Audited</p>
          <p className="text-[10px] text-text-muted">All strategies</p>
        </div>
        <div className="bg-bg-elevated rounded-xl p-3 text-center">
          <span className="text-base">🔐</span>
          <p className="text-base font-bold text-text-primary">Self</p>
          <p className="text-[10px] text-text-muted">Custodial</p>
        </div>
      </div>

      {/* Vault cards — side by side */}
      <div className="grid grid-cols-1 gap-3 mb-5">
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

      {/* How it works */}
      <Card variant="elevated" className="mb-5">
        <h3 className="text-sm font-semibold text-text-primary mb-3">How it works</h3>
        <div className="space-y-3">
          {[
            { step: '1', text: 'Deposit USDC into a vault', icon: '💳' },
            { step: '2', text: 'Funds are deployed across audited DeFi strategies', icon: '⚙️' },
            { step: '3', text: 'Yield accumulates daily and compounds automatically', icon: '📈' },
            { step: '4', text: 'Withdraw anytime after the timelock period', icon: '🔓' },
          ].map((item) => (
            <div key={item.step} className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-primary-muted flex items-center justify-center flex-shrink-0">
                <span className="text-[10px] font-bold text-primary">{item.step}</span>
              </div>
              <span className="text-sm text-text-secondary flex-1">{item.text}</span>
              <span>{item.icon}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Add funds CTA */}
      {isAuthenticated && (
        <Button
          variant="outline"
          fullWidth
          size="md"
          className="mb-4"
          onClick={() => setShowOnramp(true)}
          leftIcon={<Plus size={16} />}
        >
          Add Funds to Wallet
        </Button>
      )}

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
