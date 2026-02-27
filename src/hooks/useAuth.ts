// ============================================================
// useAuth — Bridge between Privy SDK and Tramuntana app state
//
// This hook:
// 1. Syncs Privy's auth state into our Zustand appStore
// 2. Provides loginWithGoogle / loginWithApple helpers
// 3. Maps Privy user data to our TramuntanaUser type
// 4. Gets the embedded wallet address (fully abstracted)
// ============================================================

'use client';

import { useCallback, useEffect } from 'react';
import { usePrivy, useLoginWithOAuth, useLogout, useWallets } from '@privy-io/react-auth';
import { useAppStore } from '@/store/appStore';
import type { TramuntanaUser, LoginMethod } from '@/types/user';

/**
 * Returns the display name from a Privy user object.
 * Tries Google name, Apple name, email prefix, then fallback.
 */
function getDisplayName(privyUser: ReturnType<typeof usePrivy>['user']): string {
    if (!privyUser) return 'User';

    // Try Google account name
    const google = privyUser.google;
    if (google?.name) return google.name;

    // Try Apple account
    const apple = privyUser.apple;
    if (apple?.email) return apple.email.split('@')[0];

    // Try email
    const email = privyUser.email;
    if (email?.address) return email.address.split('@')[0];

    // Fallback
    return 'User';
}

/**
 * Returns the email from a Privy user object.
 */
function getEmail(privyUser: ReturnType<typeof usePrivy>['user']): string | undefined {
    if (!privyUser) return undefined;

    const google = privyUser.google;
    if (google?.email) return google.email;

    const apple = privyUser.apple;
    if (apple?.email) return apple.email;

    const email = privyUser.email;
    if (email?.address) return email.address;

    return undefined;
}

/**
 * Returns the avatar URL from a Privy user object.
 */
function getAvatar(privyUser: ReturnType<typeof usePrivy>['user']): string | undefined {
    if (!privyUser) return undefined;
    // Google profile picture is not directly exposed in Privy user type,
    // but we can try to construct one from the google account
    return undefined;
}

/**
 * Determines the login method from a Privy user object.
 */
function getLoginMethod(privyUser: ReturnType<typeof usePrivy>['user']): LoginMethod {
    if (!privyUser) return 'google';

    if (privyUser.google) return 'google';
    if (privyUser.apple) return 'apple';
    if (privyUser.email) return 'email';

    return 'google';
}

export function useAuth() {
    const { ready, authenticated, user: privyUser } = usePrivy();
    const { initOAuth } = useLoginWithOAuth();
    const { logout: privyLogout } = useLogout();
    const { wallets } = useWallets();

    const { setUser, logout: storeLogout, user: storeUser, addNotification } = useAppStore();

    // Find the embedded wallet (created by Privy)
    const embeddedWallet = wallets.find(w => w.walletClientType === 'privy');

    // Sync Privy auth state → Zustand store
    useEffect(() => {
        if (!ready) return;

        if (authenticated && privyUser) {
            // Build our TramuntanaUser from Privy data
            const tramuntanaUser: TramuntanaUser = {
                privyDid: privyUser.id,
                displayName: getDisplayName(privyUser),
                email: getEmail(privyUser),
                avatar: getAvatar(privyUser),
                loginMethod: getLoginMethod(privyUser),
                createdAt: privyUser.createdAt
                    ? new Date(privyUser.createdAt).getTime()
                    : Date.now(),
                vaultWallet: {
                    address: embeddedWallet?.address ?? '',
                    type: 'vault',
                    chainId: 1,
                    isActive: true,
                    usdcBalance: 0,
                    ethBalance: 0,
                    nativeBalance: 0,
                },
                showAddresses: false,
            };

            // Only update if user changed (avoid infinite loops)
            if (!storeUser || storeUser.privyDid !== tramuntanaUser.privyDid) {
                setUser(tramuntanaUser);
            }
        } else if (!authenticated && storeUser) {
            // User logged out from Privy
            storeLogout();
        }
    }, [ready, authenticated, privyUser, embeddedWallet?.address]);

    // Login with Google
    const loginWithGoogle = useCallback(async () => {
        try {
            await initOAuth({ provider: 'google' });
        } catch (error) {
            console.error('Google login failed:', error);
            addNotification({
                type: 'error',
                title: 'Login failed',
                message: 'Could not sign in with Google. Please try again.',
            });
        }
    }, [initOAuth, addNotification]);

    // Login with Apple
    const loginWithApple = useCallback(async () => {
        try {
            await initOAuth({ provider: 'apple' });
        } catch (error) {
            console.error('Apple login failed:', error);
            addNotification({
                type: 'error',
                title: 'Login failed',
                message: 'Could not sign in with Apple. Please try again.',
            });
        }
    }, [initOAuth, addNotification]);

    // Logout from both Privy and app store
    const logout = useCallback(async () => {
        try {
            await privyLogout();
            storeLogout();
        } catch (error) {
            console.error('Logout failed:', error);
        }
    }, [privyLogout, storeLogout]);

    return {
        ready,
        authenticated,
        privyUser,
        embeddedWallet,
        loginWithGoogle,
        loginWithApple,
        logout,
    };
}
