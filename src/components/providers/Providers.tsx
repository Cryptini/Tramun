'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PrivyProvider } from '@privy-io/react-auth';
import { useState } from 'react';
import { PRIVY_APP_ID, PRIVY_CLIENT_ID, privyConfig } from '@/lib/privy/config';

/**
 * App Providers wrapper.
 *
 * Wraps the app with:
 * 1. PrivyProvider — Authentication + embedded wallets
 * 2. QueryClientProvider — React Query for data fetching
 *
 * Privy automatically handles:
 * - Google & Apple OAuth login
 * - Embedded Ethereum wallet creation on first login
 * - Wallet state management across sessions
 *
 * Requires NEXT_PUBLIC_PRIVY_APP_ID to be set in .env.local
 * Get your App ID at https://dashboard.privy.io/
 */
export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30 * 1000, // 30 seconds
            retry: 2,
          },
        },
      })
  );

  // If no Privy App ID is configured, render without auth (demo mode)
  if (!PRIVY_APP_ID) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  }

  return (
    <PrivyProvider
      appId={PRIVY_APP_ID}
      clientId={PRIVY_CLIENT_ID || undefined}
      config={privyConfig}
    >
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </PrivyProvider>
  );
}
