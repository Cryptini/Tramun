'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useAppStore } from '@/store/appStore';
import { formatUsd } from '@/lib/utils/format';
import type { PerformancePoint } from '@/types/user';

const PERIODS = ['1W', '1M', '3M', '1Y'] as const;
type Period = typeof PERIODS[number];

/** Custom tooltip for performance chart */
function ChartTooltip({ active, payload }: { active?: boolean; payload?: Array<{ value: number; payload: PerformancePoint }> }) {
  if (!active || !payload?.length) return null;
  const { value, payload: data } = payload[0];
  return (
    <div className="bg-white border border-border rounded-xl px-3 py-2 shadow-elevated">
      <p className="text-sm font-bold text-text-primary font-numeric">{formatUsd(value)}</p>
      <p className="text-xs text-text-muted">{data.label}</p>
    </div>
  );
}

export function PerformanceChart() {
  const { performanceHistory, selectedPeriod, setSelectedPeriod } = useAppStore();

  const firstValue = performanceHistory[0]?.value ?? 0;
  const lastValue = performanceHistory[performanceHistory.length - 1]?.value ?? 0;
  const change = lastValue - firstValue;
  const isPositive = change >= 0;

  const xAxisData = performanceHistory.filter((_, i) => {
    const step = Math.max(1, Math.floor(performanceHistory.length / 6));
    return i % step === 0 || i === performanceHistory.length - 1;
  });

  const strokeColor = isPositive ? '#00B894' : '#FF6B6B';
  const fillId = isPositive ? 'positiveGradient' : 'negativeGradient';

  return (
    <div className="w-full">
      {/* Period selector */}
      <div className="flex items-center gap-1 mb-4 bg-gray-50 rounded-xl p-1">
        {PERIODS.map((period) => (
          <button
            key={period}
            onClick={() => setSelectedPeriod(period)}
            className={`flex-1 h-8 rounded-lg text-xs font-semibold transition-all ${selectedPeriod === period
                ? 'bg-white text-primary shadow-card'
                : 'text-text-muted hover:text-text-secondary'
              }`}
          >
            {period}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={performanceHistory}
            margin={{ top: 4, right: 0, bottom: 0, left: 0 }}
          >
            <defs>
              <linearGradient id="positiveGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00B894" stopOpacity={0.2} />
                <stop offset="85%" stopColor="#00B894" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="negativeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FF6B6B" stopOpacity={0.2} />
                <stop offset="85%" stopColor="#FF6B6B" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="label"
              tick={{ fill: '#9CA3AF', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
              ticks={xAxisData.map(d => d.label)}
            />
            <YAxis hide domain={['auto', 'auto']} />
            <Tooltip
              content={<ChartTooltip />}
              cursor={{ stroke: strokeColor, strokeWidth: 1, strokeDasharray: '4 4' }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={strokeColor}
              strokeWidth={2}
              fill={`url(#${fillId})`}
              dot={false}
              activeDot={{ r: 4, fill: strokeColor, strokeWidth: 2, stroke: 'white' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
