'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAppStore } from '@/store/appStore';
import { Button } from '@/components/ui/Button';
import { PRIVY_APP_ID } from '@/lib/privy/config';

interface LoginScreenProps {
  onLoginComplete?: () => void;
}

export function LoginScreen({ onLoginComplete }: LoginScreenProps) {
  const isPrivyConfigured = !!PRIVY_APP_ID;

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Hero section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        {/* Logo */}
        <div className="w-20 h-20 rounded-3xl bg-primary flex items-center justify-center shadow-button mb-6 animate-float">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L3 7v10l9 5 9-5V7L12 2z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M12 2v20M3 7l9 5 9-5" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-text-primary mb-3">
          Welcome to<br />
          <span className="gradient-text-hero">Tramuntana</span>
        </h1>

        <p className="text-text-secondary text-base leading-relaxed max-w-[280px]">
          Earn yield on your savings and trade crypto — all in one secure, self-custodial account.
        </p>

        {/* Features */}
        <div className="mt-8 space-y-3 text-left w-full max-w-[300px]">
          {[
            { icon: '🏦', text: 'Earn up to 12% APY on USDC & BTC', color: 'bg-primary/8' },
            { icon: '⚡', text: 'Trade perps powered by Hyperliquid', color: 'bg-accent-blue/8' },
            { icon: '🔐', text: 'Non-custodial — you own your keys', color: 'bg-success/8' },
            { icon: '💳', text: 'Top up with Apple Pay or bank transfer', color: 'bg-accent-coral/8' },
          ].map((f) => (
            <div key={f.text} className={`flex items-center gap-3 ${f.color} rounded-xl px-3 py-2.5`}>
              <span className="text-xl">{f.icon}</span>
              <span className="text-sm text-text-primary font-medium">{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Login buttons */}
      <div className="px-6 pb-8 space-y-3">
        {isPrivyConfigured ? (
          <PrivyLoginButtons onLoginComplete={onLoginComplete} />
        ) : (
          <DemoLoginButtons onLoginComplete={onLoginComplete} />
        )}

        <p className="text-center text-xs text-text-muted px-4 leading-relaxed">
          By continuing, you agree to our{' '}
          <span className="text-primary font-medium">Terms of Service</span> and{' '}
          <span className="text-primary font-medium">Privacy Policy</span>.
          Your embedded wallet is self-custodial.
        </p>
      </div>
    </div>
  );
}

/**
 * Real Privy OAuth login buttons (when PRIVY_APP_ID is configured)
 */
function PrivyLoginButtons({ onLoginComplete }: { onLoginComplete?: () => void }) {
  const { loginWithGoogle, loginWithApple } = useAuth();

  const handleGoogle = async () => {
    await loginWithGoogle();
    onLoginComplete?.();
  };

  const handleApple = async () => {
    await loginWithApple();
    onLoginComplete?.();
  };

  return (
    <>
      <Button
        variant="secondary"
        fullWidth
        size="lg"
        onClick={handleGoogle}
        leftIcon={<GoogleIcon />}
      >
        Continue with Google
      </Button>

      <Button
        variant="secondary"
        fullWidth
        size="lg"
        onClick={handleApple}
        leftIcon={<AppleIcon />}
      >
        Continue with Apple
      </Button>
    </>
  );
}

/**
 * Demo login buttons (when PRIVY_APP_ID is NOT configured — fallback mock auth)
 */
function DemoLoginButtons({ onLoginComplete }: { onLoginComplete?: () => void }) {
  const { setUser } = useAppStore();
  const [loading, setLoading] = useState<'google' | 'apple' | null>(null);

  const handleLogin = async (method: 'google' | 'apple') => {
    setLoading(method);
    try {
      await new Promise(r => setTimeout(r, 1500));

      setUser({
        privyDid: `did:privy:demo_${Date.now()}`,
        displayName: method === 'google' ? 'Alex G.' : 'Alex A.',
        email: method === 'google' ? 'alex@gmail.com' : undefined,
        loginMethod: method,
        createdAt: Date.now(),
        vaultWallet: {
          address: '0x742d35Cc6634C0532925a3b8D4C9c4e7B3f5f3c9',
          type: 'vault',
          chainId: 1,
          isActive: true,
          usdcBalance: 0,
          ethBalance: 0.002,
          nativeBalance: 0.002,
        },
        showAddresses: false,
      });

      onLoginComplete?.();
    } finally {
      setLoading(null);
    }
  };

  return (
    <>
      <Button
        variant="secondary"
        fullWidth
        size="lg"
        loading={loading === 'google'}
        onClick={() => handleLogin('google')}
        leftIcon={<GoogleIcon />}
      >
        Continue with Google
      </Button>

      <Button
        variant="secondary"
        fullWidth
        size="lg"
        loading={loading === 'apple'}
        onClick={() => handleLogin('apple')}
        leftIcon={<AppleIcon />}
      >
        Continue with Apple
      </Button>

      <div className="flex items-center justify-center gap-1.5 bg-amber-50 rounded-lg px-3 py-2 border border-amber-200">
        <span className="text-[11px] text-amber-700 font-medium text-center">
          ⚠ Demo mode — Set NEXT_PUBLIC_PRIVY_APP_ID for real auth
        </span>
      </div>
    </>
  );
}

// ── SVG Icons ──────────────────────────────────────────────────

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.56-1.33 3.1-2.54 4.08zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}


