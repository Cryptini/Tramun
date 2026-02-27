'use client';

import { useTradeStore } from '@/store/tradeStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatUsd, formatPrice, formatLeverage } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';
import type { Position } from '@/types/trade';

export function PositionsList() {
  const { positions, closePosition, openOrders } = useTradeStore();

  if (positions.length === 0 && openOrders.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-text-muted">No open positions</p>
        <p className="text-xs text-text-disabled mt-1">Your positions will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {positions.map((position) => (
        <PositionRow
          key={position.coin}
          position={position}
          onClose={() => closePosition(position.coin)}
        />
      ))}
    </div>
  );
}

function PositionRow({
  position,
  onClose,
}: {
  position: Position;
  onClose: () => void;
}) {
  const isLong = position.side === 'long';
  const isProfitable = position.pnl >= 0;

  return (
    <Card variant="elevated" padding="sm">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <Badge variant={isLong ? 'success' : 'danger'} size="sm">
            {isLong ? 'LONG' : 'SHORT'}
          </Badge>
          <span className="text-sm font-semibold text-text-primary">
            {position.coin}-PERP
          </span>
          <Badge variant="neutral" size="sm">{formatLeverage(position.leverage)}</Badge>
        </div>

        <div className={cn(
          'text-sm font-semibold font-numeric',
          isProfitable ? 'text-success' : 'text-danger'
        )}>
          {isProfitable ? '+' : ''}{formatUsd(position.pnl)}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-2.5">
        <div>
          <p className="text-[10px] text-text-muted">Entry</p>
          <p className="text-xs font-numeric text-text-secondary">${formatPrice(position.entryPx)}</p>
        </div>
        <div>
          <p className="text-[10px] text-text-muted">Mark</p>
          <p className="text-xs font-numeric text-text-primary">${formatPrice(position.markPx)}</p>
        </div>
        <div>
          <p className="text-[10px] text-text-muted">Liq. Price</p>
          <p className="text-xs font-numeric text-danger">${formatPrice(position.liquidationPx)}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-xs text-text-muted">
          Size: <span className="text-text-secondary font-numeric">{position.szi.toFixed(4)} {position.coin}</span>
          {' · '}
          Margin: <span className="text-text-secondary font-numeric">{formatUsd(position.margin)}</span>
        </div>
        <Button variant="ghost" size="xs" onClick={onClose} className="text-danger hover:bg-danger-muted h-6">
          Close
        </Button>
      </div>
    </Card>
  );
}
