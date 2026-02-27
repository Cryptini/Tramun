'use client';

import { useAppStore, type ActiveTab } from '@/store/appStore';
import { TrendingUp, PieChart, Zap } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const TABS: Array<{
  id: ActiveTab;
  label: string;
  icon: React.ReactNode;
  activeIcon: React.ReactNode;
}> = [
  {
    id: 'earn',
    label: 'Earn',
    icon: <TrendingUp size={22} strokeWidth={1.5} />,
    activeIcon: <TrendingUp size={22} strokeWidth={2.5} />,
  },
  {
    id: 'portfolio',
    label: 'Portfolio',
    icon: <PieChart size={22} strokeWidth={1.5} />,
    activeIcon: <PieChart size={22} strokeWidth={2.5} />,
  },
  {
    id: 'trade',
    label: 'Trade',
    icon: <Zap size={22} strokeWidth={1.5} />,
    activeIcon: <Zap size={22} strokeWidth={2.5} />,
  },
];

export function TabBar() {
  const { activeTab, setActiveTab } = useAppStore();

  return (
    <div
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-30"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {/* Gradient fade */}
      <div className="absolute inset-x-0 top-[-20px] h-5 bg-gradient-to-b from-transparent to-bg-base/80 pointer-events-none" />

      {/* Tab bar */}
      <div className="tab-bar-blur bg-bg-surface/90 border-t border-border/50 px-2 h-[72px] flex items-center">
        <div className="flex items-center w-full">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex-1 flex flex-col items-center gap-1 py-2 transition-all duration-200',
                  'focus:outline-none relative'
                )}
                aria-selected={isActive}
                role="tab"
              >
                {/* Active indicator pill */}
                {isActive && (
                  <span className="absolute top-1 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
                )}

                {/* Icon */}
                <span
                  className={cn(
                    'transition-all duration-200',
                    isActive ? 'text-primary' : 'text-text-muted'
                  )}
                >
                  {isActive ? tab.activeIcon : tab.icon}
                </span>

                {/* Label */}
                <span
                  className={cn(
                    'text-[11px] font-medium transition-all duration-200',
                    isActive ? 'text-primary' : 'text-text-muted'
                  )}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
