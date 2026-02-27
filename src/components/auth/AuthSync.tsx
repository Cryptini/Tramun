'use client';

import { useEffect } from 'react';
import { PRIVY_APP_ID } from '@/lib/privy/config';
import { useAppStore } from '@/store/appStore';

/**
 * AuthSync — Silently bridges Privy auth state into the Zustand app store.
 *
 * When PRIVY_APP_ID is configured (production), this uses Privy hooks to
 * sync the authenticated user and their embedded wallet into our store.
 *
 * When PRIVY_APP_ID is empty (demo mode), this is a no-op.
 */
export function AuthSync() {
    if (!PRIVY_APP_ID) return null;
    return <PrivyAuthSync />;
}

/**
 * Inner component that safely uses Privy hooks.
 * Only rendered when PrivyProvider is available.
 */
function PrivyAuthSync() {
    // These hooks are safe to call because we're inside PrivyProvider
    const { usePrivy, useWallets } = require('@privy-io/react-auth');
    const { ready, authenticated, user: privyUser } = usePrivy();
    const { wallets } = useWallets();
    const { setUser, logout: storeLogout, user: storeUser } = useAppStore();

    const embeddedWallet = wallets?.find((w: { walletClientType: string }) => w.walletClientType === 'privy');

    useEffect(() => {
        if (!ready) return;

        if (authenticated && privyUser) {
            // Extract display name
            let displayName = 'User';
            if (privyUser.google?.name) displayName = privyUser.google.name;
            else if (privyUser.apple?.email) displayName = privyUser.apple.email.split('@')[0];
            else if (privyUser.email?.address) displayName = privyUser.email.address.split('@')[0];

            // Extract email
            const email = privyUser.google?.email ?? privyUser.apple?.email ?? privyUser.email?.address;

            // Determine login method
            const loginMethod = privyUser.google ? 'google' : privyUser.apple ? 'apple' : 'email';

            const tramuntanaUser = {
                privyDid: privyUser.id,
                displayName,
                email,
                loginMethod: loginMethod as 'google' | 'apple' | 'email',
                createdAt: privyUser.createdAt ? new Date(privyUser.createdAt).getTime() : Date.now(),
                vaultWallet: {
                    address: embeddedWallet?.address ?? '',
                    type: 'vault' as const,
                    chainId: 1,
                    isActive: true,
                    usdcBalance: 0,
                    ethBalance: 0,
                    nativeBalance: 0,
                },
                showAddresses: false,
            };

            // Only update if the user DID changed (avoid infinite re-renders)
            if (!storeUser || storeUser.privyDid !== tramuntanaUser.privyDid) {
                setUser(tramuntanaUser);
            }
        } else if (!authenticated && storeUser) {
            storeLogout();
        }
    }, [ready, authenticated, privyUser?.id, embeddedWallet?.address]);

    return null;
}
