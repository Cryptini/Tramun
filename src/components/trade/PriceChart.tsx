'use client';

import { useEffect, useState } from 'react';
import { AreaChart, Area, Tooltip, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { useTradeStore } from '@/store/tradeStore';
import { formatPrice } from '@/lib/utils/format';
import { fetchCandles } from '@/lib/hyperliquid/api';
import { cn } from '@/lib/utils/cn';

const INTERVALS = ['5m', '15m', '1h', '4h', '1d'] as const;
type Interval = typeof INTERVALS[number];

function ChartTooltip({ active, payload }: { active?: boolean; payload?: Array<{ value: number }> }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-border rounded-xl px-3 py-1.5 shadow-elevated">
      <p className="text-xs font-bold text-text-primary font-numeric">
        ${formatPrice(payload[0].value)}
      </p>
    </div>
  );
}

export function PriceChart() {
  const { selectedMarket } = useTradeStore();
  const [interval, setInterval] = useState<Interval>('15m');
  const [data, setData] = useState<Array<{ time: string; price: number }>>([]);

  useEffect(() => {
    const load = async () => {
      const candles = await fetchCandles(selectedMarket.coin, interval, 60);
      setData(candles.map(c => ({
        time: new Date(c.time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        price: c.close,
      })));
    };
    load();
  }, [selectedMarket.coin, interval]);

  const firstPrice = data[0]?.price ?? 0;
  const lastPrice = data[data.length - 1]?.price ?? 0;
  const isPositive = lastPrice >= firstPrice;
  const strokeColor = isPositive ? '#00B894' : '#FF6B6B';

  return (
    <div className="w-full">
      {/* Interval selector */}
      <div className="flex items-center gap-1 mb-3 bg-gray-50 rounded-xl p-1">
        {INTERVALS.map((iv) => (
          <button
            key={iv}
            onClick={() => setInterval(iv)}
            className={cn(
              'flex-1 h-7 rounded-lg text-xs font-semibold transition-all',
              interval === iv
                ? 'bg-white text-primary shadow-card'
                : 'text-text-muted hover:text-text-secondary'
            )}
          >
            {iv}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="h-48">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="tradeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={strokeColor} stopOpacity={0.15} />
                  <stop offset="90%" stopColor={strokeColor} stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" hide />
              <YAxis hide domain={['auto', 'auto']} />
              <Tooltip
                content={<ChartTooltip />}
                cursor={{ stroke: strokeColor, strokeWidth: 1, strokeDasharray: '3 3' }}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke={strokeColor}
                strokeWidth={2}
                fill="url(#tradeGradient)"
                dot={false}
                activeDot={{ r: 4, fill: strokeColor, strokeWidth: 2, stroke: 'white' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full skeleton rounded-xl" />
        )}
      </div>
    </div>
  );
}
