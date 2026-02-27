'use client';

import { MarketSelector } from '@/components/trade/MarketSelector';
import { PriceChart } from '@/components/trade/PriceChart';
import { OrderPanel } from '@/components/trade/OrderPanel';
import { PositionsList } from '@/components/trade/PositionsList';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useTradeStore } from '@/store/tradeStore';
import { useAppStore } from '@/store/appStore';
import { formatUsd } from '@/lib/utils/format';
import { Zap, Info } from 'lucide-react';

export function TradeTab() {
  const { selectedMarket, accountValue, withdrawable, positions } = useTradeStore();
  const { isAuthenticated } = useAppStore();

  return (
    <div className="px-4 pt-2 animate-fade-in space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-[22px] font-bold text-text-primary">Trade</h1>
        <div className="flex items-center gap-1.5">
          <Zap size={14} className="text-primary" />
          <span className="text-xs text-text-muted">Powered by</span>
          <Badge variant="primary" size="sm">Hyperliquid</Badge>
        </div>
      </div>

      {/* Account summary (if logged in) */}
      {isAuthenticated && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-bg-elevated rounded-xl p-3">
            <p className="text-[10px] text-text-muted uppercase tracking-wide mb-0.5">Account Value</p>
            <p className="text-sm font-bold font-numeric text-text-primary">
              {formatUsd(accountValue)}
            </p>
          </div>
          <div className="bg-bg-elevated rounded-xl p-3">
            <p className="text-[10px] text-text-muted uppercase tracking-wide mb-0.5">Available</p>
            <p className="text-sm font-bold font-numeric text-text-primary">
              {formatUsd(withdrawable)}
            </p>
          </div>
        </div>
      )}

      {/* Market selector + price */}
      <MarketSelector />

      {/* Price chart */}
      <Card variant="default" padding="sm">
        <PriceChart />
      </Card>

      {/* Order panel */}
      <Card variant="default" padding="md">
        <OrderPanel />
      </Card>

      {/* Open positions */}
      {positions.length > 0 && (
        <div>
          <h2 className="text-[15px] font-semibold text-text-primary mb-2">Open Positions</h2>
          <PositionsList />
        </div>
      )}

      {/* Info: dual wallet option */}
      <Card variant="outline" className="border-border/30 mb-4">
        <div className="flex items-start gap-3">
          <Info size={14} className="text-text-muted mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-medium text-text-secondary mb-0.5">
              About your trading wallet
            </p>
            <p className="text-xs text-text-muted leading-relaxed">
              Trading uses your Tramuntana embedded wallet. You can optionally use a separate
              wallet for DeFi vaults vs perps trading for isolation — toggle in account settings.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
