'use client';

import { useState } from 'react';
import { useTradeStore } from '@/store/tradeStore';
import { useAppStore } from '@/store/appStore';
import { Button } from '@/components/ui/Button';
import { Card, CardDivider, CardRow } from '@/components/ui/Card';
import { Input, AmountPresets } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { formatUsd, formatPrice, formatLeverage } from '@/lib/utils/format';
import { estimateTradeFee as calcFee } from '@/lib/hyperliquid/builder';
import { cn } from '@/lib/utils/cn';
import { Zap } from 'lucide-react';

function estimateFee(notional: number): string {
  return calcFee({ notionalSize: notional, isPerp: true }).breakdown;
}

export function OrderPanel() {
  const {
    selectedMarket,
    side,
    orderType,
    size,
    leverage,
    limitPrice,
    isPlacingOrder,
    markPrices,
    setSide,
    setOrderType,
    setSize,
    setLeverage,
    setLimitPrice,
    setIsPlacingOrder,
  } = useTradeStore();

  const { isAuthenticated, addNotification } = useAppStore();
  const [error, setError] = useState('');

  const markPrice = markPrices[selectedMarket.coin] ?? selectedMarket.markPrice;
  const numSize = parseFloat(size) || 0;
  const numLimitPrice = parseFloat(limitPrice) || markPrice;
  const execPrice = orderType === 'market' ? markPrice : numLimitPrice;
  const notionalSize = numSize * leverage;
  const positionSize = notionalSize / execPrice;
  const liqDistance = (numSize / notionalSize) * execPrice;
  const liqPrice = side === 'long'
    ? execPrice - liqDistance * 0.9
    : execPrice + liqDistance * 0.9;

  const isValid = numSize >= 10 && isAuthenticated;

  const handleSubmit = async () => {
    if (!isValid) {
      setError(isAuthenticated ? 'Minimum order size is $10' : 'Sign in to trade');
      return;
    }
    setError('');
    setIsPlacingOrder(true);

    try {
      await new Promise(r => setTimeout(r, 1500));

      addNotification({
        type: 'success',
        title: `${side === 'long' ? 'Long' : 'Short'} ${selectedMarket.coin} placed`,
        message: `${formatLeverage(leverage)} ${orderType} order for ${formatUsd(numSize)}`,
      });

      setSize('');
    } catch {
      addNotification({ type: 'error', title: 'Order failed', message: 'Please try again.' });
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Long / Short toggle */}
      <div className="grid grid-cols-2 gap-1.5 bg-gray-50 rounded-xl p-1">
        <button
          onClick={() => setSide('long')}
          className={cn(
            'h-10 rounded-xl text-sm font-bold transition-all',
            side === 'long'
              ? 'bg-success text-white shadow-glow-success'
              : 'text-text-muted hover:text-text-secondary'
          )}
        >
          Long
        </button>
        <button
          onClick={() => setSide('short')}
          className={cn(
            'h-10 rounded-xl text-sm font-bold transition-all',
            side === 'short'
              ? 'bg-danger text-white'
              : 'text-text-muted hover:text-text-secondary'
          )}
        >
          Short
        </button>
      </div>

      {/* Market / Limit toggle */}
      <div className="flex gap-2">
        {(['market', 'limit'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setOrderType(type)}
            className={cn(
              'flex-1 h-8 rounded-lg text-xs font-semibold transition-all',
              orderType === type
                ? 'bg-primary/10 text-primary border border-primary/20'
                : 'bg-gray-50 text-text-muted border border-border'
            )}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* Size input */}
      <Input
        type="number"
        label="Size (margin)"
        placeholder="0.00"
        value={size}
        onChange={(e) => setSize(e.target.value)}
        leftAdornment={<span className="text-text-muted text-sm">$</span>}
        rightAdornment="USDC"
        error={error}
      />

      {/* Quick sizes */}
      <AmountPresets amounts={[50, 100, 500, 1000]} onSelect={(a) => setSize(a.toString())} />

      {/* Limit price */}
      {orderType === 'limit' && (
        <Input
          type="number"
          label="Limit Price"
          placeholder={formatPrice(markPrice)}
          value={limitPrice}
          onChange={(e) => setLimitPrice(e.target.value)}
          leftAdornment={<span className="text-text-muted text-sm">$</span>}
        />
      )}

      {/* Leverage slider */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-text-secondary">Leverage</span>
          <span className="text-sm font-bold text-primary">{formatLeverage(leverage)}</span>
        </div>
        <input
          type="range"
          min={1}
          max={selectedMarket.maxLeverage}
          value={leverage}
          onChange={(e) => setLeverage(parseInt(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-[10px] text-text-muted mt-1">
          <span>1x</span>
          <span>{selectedMarket.maxLeverage / 4}x</span>
          <span>{selectedMarket.maxLeverage / 2}x</span>
          <span>{selectedMarket.maxLeverage}x</span>
        </div>
      </div>

      {/* Order summary */}
      {numSize >= 10 && (
        <Card variant="elevated" className="space-y-2 animate-fade-in">
          <CardRow
            label="Position size"
            value={<span className="font-numeric font-semibold">{positionSize.toFixed(4)} {selectedMarket.coin}</span>}
          />
          <CardRow
            label="Notional value"
            value={<span className="font-numeric font-semibold">{formatUsd(notionalSize)}</span>}
          />
          <CardRow
            label="Est. liquidation"
            value={<span className="text-danger font-numeric font-semibold">${formatPrice(liqPrice)}</span>}
          />
          <CardDivider />
          <CardRow
            label="Fee"
            value={
              <span className="text-xs text-text-muted">
                {estimateFee(notionalSize)}
              </span>
            }
          />
        </Card>
      )}

      {/* Submit button */}
      <Button
        variant={side === 'long' ? 'success' : 'danger'}
        fullWidth
        size="lg"
        loading={isPlacingOrder}
        disabled={!isValid}
        onClick={handleSubmit}
      >
        {!isAuthenticated
          ? 'Sign In to Trade'
          : `Open ${side === 'long' ? 'Long' : 'Short'} ${numSize > 0 ? formatLeverage(leverage) : ''}`}
      </Button>

      {/* Attribution */}
      <div className="flex items-center justify-center gap-1.5 py-1">
        <Zap size={11} className="text-primary" />
        <span className="text-[11px] text-text-muted font-medium">Powered by Hyperliquid</span>
      </div>
    </div>
  );
}
