'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

/**
 * App Providers wrapper.
 *
 * In production, add:
 * - PrivyProvider (from @privy-io/react-auth) for wallet/auth
 * - WagmiProvider (from wagmi) for onchain interactions
 *
 * Example production implementation:
 * ```tsx
 * import { PrivyProvider } from '@privy-io/react-auth';
 * import { WagmiProvider } from 'wagmi';
 * import { PRIVY_APP_ID, privyConfig } from '@/lib/privy/config';
 * import { wagmiConfig } from '@/lib/wagmi/config';
 *
 * export function Providers({ children }) {
 *   return (
 *     <PrivyProvider appId={PRIVY_APP_ID} config={privyConfig}>
 *       <WagmiProvider config={wagmiConfig}>
 *         <QueryClientProvider client={queryClient}>
 *           {children}
 *         </QueryClientProvider>
 *       </WagmiProvider>
 *     </PrivyProvider>
 *   );
 * }
 * ```
 *
 * Note: Privy requires NEXT_PUBLIC_PRIVY_APP_ID to be set.
 * Get your App ID at https://console.privy.io/
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

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
