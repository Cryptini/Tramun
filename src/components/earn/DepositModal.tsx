'use client';

import { useState } from 'react';
import { Modal, ModalSection } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input, AmountPresets } from '@/components/ui/Input';
import { Card, CardDivider, CardRow } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatUsd, formatApy } from '@/lib/utils/format';
import { useAppStore } from '@/store/appStore';
import type { MasterVault } from '@/types/vault';
import { Info, CheckCircle } from 'lucide-react';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  vault: MasterVault;
}

type DepositStep = 'input' | 'confirm' | 'success';

export function DepositModal({ isOpen, onClose, vault }: DepositModalProps) {
  const { user, isAuthenticated, updateVaultPosition, addNotification } = useAppStore();
  const [step, setStep] = useState<DepositStep>('input');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const numAmount = parseFloat(amount) || 0;
  const estimatedShares = numAmount / vault.sharePrice;
  const estimatedYearlyReturn = numAmount * vault.blendedApy;
  const feeApplied = vault.id === 'btc-assets' && numAmount > 0 ? numAmount * vault.swapFee : 0;
  const netDeposit = numAmount - feeApplied;

  const isValid = numAmount >= vault.minDeposit;

  const handleDeposit = async () => {
    if (!isValid || !isAuthenticated) return;
    setStep('confirm');
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      // Production: call Veda BoringVault teller.deposit()
      // This requires: approve USDC, then call teller.deposit(amount, shares, deadline)
      await new Promise(r => setTimeout(r, 2000));

      // Update local state with new position
      updateVaultPosition({
        vaultId: vault.id,
        shares: BigInt(Math.floor(estimatedShares * 1e6)),
        sharesFormatted: estimatedShares.toFixed(6),
        valueUsd: numAmount,
        depositedUsd: numAmount,
        unrealizedPnl: 0,
        unrealizedPnlPct: 0,
        depositTimestamp: Date.now(),
        withdrawalAvailable: false,
        withdrawalUnlockAt: Date.now() + vault.withdrawalDelay * 1000,
      });

      addNotification({
        type: 'success',
        title: 'Deposit successful',
        message: `${formatUsd(numAmount)} deposited into ${vault.name}`,
      });

      setStep('success');
    } catch {
      addNotification({
        type: 'error',
        title: 'Deposit failed',
        message: 'Please try again or contact support.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setStep('input');
    setAmount('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={step === 'success' ? undefined : `Deposit into ${vault.name}`}
      subtitle={step === 'input' ? 'Enter the amount you want to deposit' : undefined}
    >
      <ModalSection>
        {step === 'input' && (
          <div className="space-y-4">
            {/* Vault info */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-muted">Current APY</span>
              <span className="text-success font-semibold">{formatApy(vault.blendedApy)}</span>
            </div>

            {/* Amount input */}
            <div>
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  className="w-full h-16 bg-bg-elevated border border-border rounded-2xl text-center text-3xl font-bold text-text-primary outline-none focus:border-primary/60 font-numeric transition-colors"
                  min={vault.minDeposit}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted text-sm font-medium">
                  USDC
                </span>
              </div>
              {numAmount > 0 && numAmount < vault.minDeposit && (
                <p className="text-xs text-danger mt-1.5 text-center">
                  Minimum deposit: {formatUsd(vault.minDeposit)}
                </p>
              )}
            </div>

            {/* Quick amounts */}
            <AmountPresets
              amounts={[100, 500, 1000, 5000]}
              onSelect={(a) => setAmount(a.toString())}
            />

            {/* Estimates */}
            {numAmount >= vault.minDeposit && (
              <Card variant="elevated" className="space-y-2 animate-fade-in">
                <CardRow
                  label="Estimated yearly return"
                  value={
                    <span className="text-success">+{formatUsd(estimatedYearlyReturn)}</span>
                  }
                />
                {feeApplied > 0 && (
                  <CardRow
                    label="Swap fee (USDC → BTC)"
                    value={<span className="text-danger">−{formatUsd(feeApplied)}</span>}
                  />
                )}
                <CardDivider className="my-0" />
                <CardRow
                  label="Withdrawal available after"
                  value={
                    <Badge variant="warning" size="sm">
                      {vault.withdrawalDelay / 3600}h
                    </Badge>
                  }
                />
              </Card>
            )}

            {!isAuthenticated && (
              <Card variant="elevated" className="border-primary/20">
                <div className="flex items-start gap-3">
                  <Info size={16} className="text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-text-secondary">
                    Sign in with Google or Apple to deposit. Your wallet is created automatically.
                  </p>
                </div>
              </Card>
            )}

            <Button
              variant="primary"
              fullWidth
              size="lg"
              disabled={!isValid}
              onClick={handleDeposit}
            >
              {!isAuthenticated ? 'Sign In to Deposit' : `Deposit ${numAmount > 0 ? formatUsd(numAmount) : ''}`}
            </Button>
          </div>
        )}

        {step === 'confirm' && (
          <div className="space-y-4 animate-fade-in">
            <Card variant="elevated" className="space-y-3">
              <CardRow label="Vault" value={vault.name} />
              <CardRow label="Depositing" value={<span className="font-semibold">{formatUsd(numAmount)}</span>} />
              <CardRow label="Expected APY" value={<span className="text-success">{formatApy(vault.blendedApy)}</span>} />
              {feeApplied > 0 && (
                <CardRow label="Swap fee" value={<span className="text-danger">−{formatUsd(feeApplied)}</span>} />
              )}
              <CardDivider />
              <CardRow
                label="You receive ≈"
                value={<span className="font-semibold">{estimatedShares.toFixed(4)} shares</span>}
              />
              <CardRow
                label="Withdrawal lock"
                value={`${vault.withdrawalDelay / 3600}h timelock`}
              />
            </Card>

            <p className="text-xs text-text-muted text-center leading-relaxed">
              By confirming, you approve USDC spending and deposit into the Tramuntana {vault.name}.
              This is a non-custodial transaction — you remain in control.
            </p>

            <div className="flex gap-3">
              <Button variant="secondary" fullWidth onClick={() => setStep('input')}>
                Back
              </Button>
              <Button variant="primary" fullWidth loading={isLoading} onClick={handleConfirm}>
                Confirm Deposit
              </Button>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="text-center py-6 space-y-4 animate-scale-in">
            <div className="w-16 h-16 rounded-full bg-success-muted flex items-center justify-center mx-auto animate-pulse-glow">
              <CheckCircle size={32} className="text-success" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-text-primary">Deposit Confirmed!</h3>
              <p className="text-text-secondary text-sm mt-1">
                {formatUsd(numAmount)} is now earning {formatApy(vault.blendedApy)} APY
              </p>
            </div>
            <Card variant="elevated">
              <p className="text-sm text-text-secondary">
                Your funds are allocated across {vault.underlyingVaults.length} audited yield strategies.
                Withdrawal available after {vault.withdrawalDelay / 3600}h.
              </p>
            </Card>
            <Button variant="primary" fullWidth onClick={handleClose}>
              View Portfolio
            </Button>
          </div>
        )}
      </ModalSection>
    </Modal>
  );
}
