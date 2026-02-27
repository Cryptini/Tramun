'use client';

import { useState } from 'react';
import { Modal, ModalSection } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { redirectToOnramp, buildOnrampUrl, ONRAMP_METHODS, type OnrampMethod } from '@/lib/peer-xyz/onramp';
import { useAppStore } from '@/store/appStore';
import { formatUsd } from '@/lib/utils/format';
import { ArrowRight, Copy, ExternalLink } from 'lucide-react';

interface OnrampModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultAmount?: number;
}

type OnrampStep = 'method' | 'amount' | 'crypto';

export function OnrampModal({ isOpen, onClose, defaultAmount = 100 }: OnrampModalProps) {
  const { user } = useAppStore();
  const [step, setStep] = useState<OnrampStep>('method');
  const [selectedMethod, setSelectedMethod] = useState<OnrampMethod | null>(null);
  const [amount, setAmount] = useState(defaultAmount.toString());

  const walletAddress = user?.vaultWallet?.address ?? '';

  const handleMethodSelect = (method: OnrampMethod) => {
    setSelectedMethod(method);
    setStep('amount');
  };

  const handleProceed = () => {
    if (!selectedMethod || !walletAddress) return;
    const numAmount = parseFloat(amount);
    redirectToOnramp({
      walletAddress,
      amount: numAmount,
      paymentMethod: selectedMethod,
    }, true); // Opens in new tab
    onClose();
  };

  const handleReset = () => {
    setStep('method');
    setSelectedMethod(null);
    setAmount(defaultAmount.toString());
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => { onClose(); handleReset(); }}
      title="Add Funds"
      subtitle="Choose how you want to add money"
    >
      <ModalSection>
        {step === 'method' && (
          <div className="space-y-3">
            {/* Crypto receive option */}
            <button
              onClick={() => setStep('crypto')}
              className="w-full text-left"
            >
              <Card
                variant="elevated"
                interactive
                className="border-border hover:border-primary/30"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-muted flex items-center justify-center text-lg">
                      ↓
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-primary">Receive Crypto</p>
                      <p className="text-xs text-text-muted">Send USDC to your wallet</p>
                    </div>
                  </div>
                  <ArrowRight size={16} className="text-text-muted" />
                </div>
              </Card>
            </button>

            {/* Fiat onramp options via peer.xyz */}
            <p className="text-xs text-text-muted px-1 pt-1">Buy with fiat — powered by peer.xyz</p>
            <div className="space-y-2">
              {ONRAMP_METHODS.filter(m => m.available).map((method) => (
                <button
                  key={method.id}
                  onClick={() => handleMethodSelect(method.id)}
                  className="w-full text-left"
                >
                  <Card
                    variant="elevated"
                    interactive
                    className="border-border hover:border-primary/30"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-bg-card flex items-center justify-center text-xl">
                          {method.icon}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-text-primary">{method.label}</p>
                          <p className="text-xs text-text-muted">{method.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="neutral" size="sm">{method.estimatedTime}</Badge>
                        <p className="text-xs text-text-muted mt-1">
                          ${method.minAmount}–${method.maxAmount >= 10000 ? '10K+' : method.maxAmount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </Card>
                </button>
              ))}
            </div>

            <p className="text-[11px] text-text-muted text-center leading-relaxed">
              Fiat purchases are processed by peer.xyz via zkP2P.<br />
              USDC is sent directly to your wallet — no custodian involved.
            </p>
          </div>
        )}

        {step === 'amount' && selectedMethod && (
          <div className="space-y-4">
            <button onClick={() => setStep('method')} className="text-sm text-primary flex items-center gap-1">
              ← Back
            </button>

            <div className="text-center py-4">
              <p className="text-text-muted text-sm mb-2">You pay</p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-4xl font-bold text-text-primary">$</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="text-4xl font-bold bg-transparent text-text-primary outline-none w-32 text-center font-numeric"
                  min="20"
                  placeholder="100"
                />
              </div>
              <p className="text-xs text-text-muted mt-2">≈ {amount} USDC received</p>
            </div>

            {/* Quick amounts */}
            <div className="grid grid-cols-4 gap-2">
              {[50, 100, 500, 1000].map((a) => (
                <button
                  key={a}
                  onClick={() => setAmount(a.toString())}
                  className="h-9 rounded-xl bg-bg-elevated border border-border text-sm text-text-secondary hover:border-primary/50 hover:text-primary transition-all active:scale-95"
                >
                  ${a >= 1000 ? '1K' : a}
                </button>
              ))}
            </div>

            <Button variant="primary" fullWidth size="lg" onClick={handleProceed}>
              Continue with {ONRAMP_METHODS.find(m => m.id === selectedMethod)?.label}
              <ExternalLink size={14} className="ml-1" />
            </Button>

            <p className="text-[11px] text-text-muted text-center">
              You'll be redirected to peer.xyz to complete payment.
              USDC will arrive in your wallet in {ONRAMP_METHODS.find(m => m.id === selectedMethod)?.estimatedTime}.
            </p>
          </div>
        )}

        {step === 'crypto' && (
          <div className="space-y-4">
            <button onClick={() => setStep('method')} className="text-sm text-primary">
              ← Back
            </button>

            <div className="text-center py-2">
              <p className="text-sm text-text-secondary mb-4">
                Send USDC or ETH to your wallet address on Ethereum
              </p>

              {/* QR Code placeholder */}
              <div className="w-40 h-40 mx-auto rounded-2xl bg-white flex items-center justify-center mb-4">
                <div className="w-32 h-32 bg-[repeating-conic-gradient(#000_0%_25%,#fff_0%_50%)] bg-[length:8px_8px] rounded" />
              </div>

              <div className="flex items-center gap-2 bg-bg-elevated rounded-xl p-3 border border-border">
                <p className="text-xs font-mono text-text-secondary flex-1 truncate">
                  {walletAddress}
                </p>
                <button
                  onClick={() => navigator.clipboard.writeText(walletAddress)}
                  className="text-primary flex-shrink-0"
                >
                  <Copy size={14} />
                </button>
              </div>

              <p className="text-xs text-text-muted mt-3">
                Only send USDC on Ethereum. Other assets may be lost.
              </p>
            </div>
          </div>
        )}
      </ModalSection>
    </Modal>
  );
}
