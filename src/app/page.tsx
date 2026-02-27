'use client';

import { Providers } from '@/components/providers/Providers';
import { Header } from '@/components/layout/Header';
import { TabBar } from '@/components/layout/TabBar';
import { EarnTab } from '@/components/tabs/EarnTab';
import { PortfolioTab } from '@/components/tabs/PortfolioTab';
import { TradeTab } from '@/components/tabs/TradeTab';
import { LoginScreen } from '@/components/auth/LoginScreen';
import { useAppStore } from '@/store/appStore';

function AppShell() {
  const { activeTab, isAuthenticated } = useAppStore();

  // Demo mode: allow browsing without login
  // In production: show login for actions requiring wallet
  const showLogin = !isAuthenticated && false; // Set to true to enforce login

  if (showLogin) {
    return (
      <main className="flex flex-col h-dvh bg-bg-base">
        <LoginScreen />
      </main>
    );
  }

  return (
    <main className="flex flex-col h-dvh bg-bg-base overflow-hidden">
      {/* Fixed header */}
      <Header />

      {/* Tab content */}
      <div className="tab-content">
        {activeTab === 'earn' && <EarnTab />}
        {activeTab === 'portfolio' && <PortfolioTab />}
        {activeTab === 'trade' && <TradeTab />}
      </div>

      {/* Fixed bottom tab bar */}
      <TabBar />
    </main>
  );
}

export default function Home() {
  return (
    <Providers>
      <AppShell />
    </Providers>
  );
}
