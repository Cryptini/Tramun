'use client';

import { useState } from 'react';
import { Bell, Eye, EyeOff, Copy, ExternalLink, LogOut, Plus } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { formatAddress, formatUsd } from '@/lib/utils/format';
import { Modal, ModalSection } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { redirectToOnramp } from '@/lib/peer-xyz/onramp';
import { PRIVY_APP_ID } from '@/lib/privy/config';

export function Header() {
  const {
    user,
    isAuthenticated,
    showAddresses,
    toggleAddressVisibility,
    portfolioSummary,
    notifications,
    logout: storeLogout,
  } = useAppStore();

  // Use real Privy logout if configured, otherwise store-only logout
  const handleLogout = async () => {
    if (PRIVY_APP_ID) {
      // Dynamic import to avoid hook issues when Privy isn't configured
      const { useLogout } = await import('@privy-io/react-auth');
      // For now, just do store logout + page reload to clear Privy session
      storeLogout();
      window.location.reload();
    } else {
      storeLogout();
    }
  };

  const [showAccount, setShowAccount] = useState(false);
  const [copied, setCopied] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleCopyAddress = async () => {
    const address = user?.vaultWallet?.address;
    if (!address) return;
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddFunds = () => {
    if (!user?.vaultWallet?.address) return;
    redirectToOnramp({ walletAddress: user.vaultWallet.address }, true);
  };

  return (
    <>
      <header className="flex items-center justify-between px-5 pt-[max(env(safe-area-inset-top),16px)] pb-3">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-button">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2L3 7v10l9 5 9-5V7L12 2z"
                stroke="white"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <path
                d="M12 2v20M3 7l9 5 9-5"
                stroke="white"
                strokeWidth="2"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="text-[18px] font-bold tracking-tight text-text-primary">
            Tramuntana
          </span>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <button className="relative w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 text-text-secondary hover:bg-gray-100 transition-colors">
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-danger rounded-full text-[9px] font-bold flex items-center justify-center text-white">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Account */}
          <button
            onClick={() => setShowAccount(true)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-primary text-white font-bold text-sm shadow-button"
          >
            {isAuthenticated && user?.displayName
              ? user.displayName.charAt(0).toUpperCase()
              : '?'}
          </button>
        </div>
      </header>

      {/* Account Sheet */}
      <Modal
        isOpen={showAccount}
        onClose={() => setShowAccount(false)}
        title={isAuthenticated ? user?.displayName ?? 'My Account' : 'Account'}
        subtitle={isAuthenticated ? 'Manage your wallet and settings' : undefined}
      >
        <ModalSection>
          {isAuthenticated && user ? (
            <div className="space-y-4">
              {/* Portfolio summary */}
              <div className="hero-banner p-5 text-white">
                <p className="text-sm opacity-80">Total Portfolio</p>
                <div className="flex items-center gap-3 mt-1.5 relative z-10">
                  <p className="text-3xl font-bold font-numeric">
                    {showAddresses ? formatUsd(portfolioSummary.totalValueUsd) : '••••••'}
                  </p>
                  <button onClick={toggleAddressVisibility} className="text-white/60 hover:text-white/90 transition-colors">
                    {showAddresses ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Wallet address */}
              <Card variant="default">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-text-muted mb-1">Wallet Address</p>
                    <p className="text-sm font-mono text-text-primary">
                      {showAddresses
                        ? formatAddress(user.vaultWallet.address, 6)
                        : '••••••••'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCopyAddress}
                      className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-50 text-text-secondary hover:bg-gray-100 transition-colors"
                    >
                      <Copy size={14} />
                    </button>
                    <a
                      href={`https://etherscan.io/address/${user.vaultWallet.address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-50 text-text-secondary hover:bg-gray-100 transition-colors"
                    >
                      <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
                {copied && (
                  <Badge variant="success" className="mt-2">Copied!</Badge>
                )}
              </Card>

              {/* Login method */}
              <div className="flex items-center justify-between text-sm px-1">
                <span className="text-text-muted">Logged in via</span>
                <Badge variant="neutral">
                  {user.loginMethod === 'google' ? '🔵 Google' : '🍎 Apple'}
                </Badge>
              </div>

              {/* Actions */}
              <Button
                variant="primary"
                fullWidth
                onClick={handleAddFunds}
                leftIcon={<Plus size={16} />}
              >
                Add Funds
              </Button>

              <Button
                variant="ghost"
                fullWidth
                onClick={handleLogout}
                leftIcon={<LogOut size={16} />}
                className="text-danger hover:bg-danger-muted"
              >
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="text-center py-6 space-y-4">
              <p className="text-text-secondary text-sm">Sign in to access your account</p>
              <Button variant="primary" fullWidth>
                Sign In
              </Button>
            </div>
          )}
        </ModalSection>
      </Modal>
    </>
  );
}
