'use client';

import { useState } from 'react';
import { useTradeStore } from '@/store/tradeStore';
import { formatPrice } from '@/lib/utils/format';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { HLMarket } from '@/types/trade';

export function MarketSelector() {
  const { markets, selectedMarket, setSelectedMarket, markPrices } = useTradeStore();
  const [isOpen, setIsOpen] = useState(false);

  const currentPrice = markPrices[selectedMarket.coin] ?? selectedMarket.markPrice;
  const isPositive = selectedMarket.priceChange24h >= 0;

  return (
    <div className="relative">
      {/* Current market button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 h-10 px-3 rounded-xl bg-bg-elevated border border-border"
      >
        <div className="w-6 h-6 rounded-full bg-primary-muted flex items-center justify-center">
          <span className="text-[10px] font-bold text-primary">
            {selectedMarket.coin.slice(0, 1)}
          </span>
        </div>
        <div className="text-left">
          <p className="text-sm font-semibold text-text-primary leading-none">
            {selectedMarket.name}
          </p>
        </div>
        <ChevronDown
          size={14}
          className={cn('text-text-muted transition-transform ml-1', isOpen && 'rotate-180')}
        />
      </button>

      {/* Price display */}
      <div className="flex items-center gap-2 mt-1.5 px-1">
        <span className="text-2xl font-bold font-numeric text-text-primary">
          ${formatPrice(currentPrice)}
        </span>
        <span className={cn(
          'text-sm font-medium',
          isPositive ? 'text-success' : 'text-danger'
        )}>
          {isPositive ? '+' : ''}{(selectedMarket.priceChange24h * 100).toFixed(2)}%
        </span>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-2 w-64 bg-bg-elevated border border-border rounded-2xl shadow-modal z-20 overflow-hidden animate-scale-in">
            <p className="text-xs text-text-muted px-4 py-3 border-b border-border">
              Perpetual Markets
            </p>
            {markets.map((market) => (
              <MarketRow
                key={market.coin}
                market={market}
                isSelected={selectedMarket.coin === market.coin}
                onSelect={() => {
                  setSelectedMarket(market);
                  setIsOpen(false);
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function MarketRow({
  market,
  isSelected,
  onSelect,
}: {
  market: HLMarket;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const isPositive = market.priceChange24h >= 0;
  return (
    <button
      onClick={onSelect}
      className={cn(
        'w-full flex items-center justify-between px-4 py-3 transition-colors',
        isSelected ? 'bg-primary-muted' : 'hover:bg-white/5'
      )}
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-bg-card flex items-center justify-center">
          <span className="text-xs font-bold text-text-secondary">
            {market.coin.slice(0, 2)}
          </span>
        </div>
        <div className="text-left">
          <p className="text-sm font-medium text-text-primary">{market.name}</p>
          <p className="text-xs text-text-muted">{market.maxLeverage}x max leverage</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-numeric text-text-primary">${formatPrice(market.markPrice)}</p>
        <p className={cn('text-xs font-numeric', isPositive ? 'text-success' : 'text-danger')}>
          {isPositive ? '+' : ''}{(market.priceChange24h * 100).toFixed(2)}%
        </p>
      </div>
    </button>
  );
}
