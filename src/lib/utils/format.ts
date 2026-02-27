// ============================================================
// Formatting Utilities — Currency, Numbers, Dates
// ============================================================

/** Format USD value with commas and optional decimals */
export function formatUsd(value: number, decimals = 2): string {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`;
  }
  if (value >= 1_000) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/** Format TVL (Total Value Locked) */
export function formatTvl(value: number): string {
  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(2)}B`;
  }
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`;
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(1)}K`;
  }
  return `$${value.toFixed(0)}`;
}

/** Format percentage with sign */
export function formatPct(value: number, includeSign = true): string {
  const sign = includeSign && value > 0 ? '+' : '';
  return `${sign}${(value * 100).toFixed(2)}%`;
}

/** Format APY */
export function formatApy(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

/** Format crypto amount (e.g. BTC, ETH) */
export function formatCrypto(value: number, symbol: string, decimals = 4): string {
  if (value === 0) return `0 ${symbol}`;
  if (value < 0.0001) return `<0.0001 ${symbol}`;
  return `${value.toFixed(decimals)} ${symbol}`;
}

/** Format wallet address with ellipsis */
export function formatAddress(address: string, chars = 4): string {
  if (!address || address.length < chars * 2 + 2) return address;
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

/** Format a timestamp as relative time */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/** Format leverage */
export function formatLeverage(value: number): string {
  return `${value}x`;
}

/** Parse USD input string to number */
export function parseUsdInput(value: string): number {
  const cleaned = value.replace(/[^0-9.]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

/** Format price with appropriate decimals based on magnitude */
export function formatPrice(price: number): string {
  if (price >= 10_000) return price.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  if (price >= 100) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (price >= 1) return price.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 4 });
  return price.toFixed(6);
}

/** Generate mock portfolio performance data */
export function generatePortfolioData(
  baseValue: number,
  days: number,
  trend = 0.08 // Annual return trend
): Array<{ date: string; value: number; label: string }> {
  const data = [];
  let value = baseValue;
  const dailyTrend = trend / 365;
  const volatility = 0.015;

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const noise = (Math.random() - 0.45) * volatility;
    value = value * (1 + dailyTrend + noise);
    data.push({
      date: date.toISOString().split('T')[0],
      value: Math.round(value * 100) / 100,
      label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    });
  }
  return data;
}

/** Generate mock price data for trade chart */
export function generatePriceData(
  basePrice: number,
  periods: number,
  intervalMinutes: number
): Array<{ time: string; price: number; volume: number }> {
  const data = [];
  let price = basePrice;
  const volatility = 0.008;

  for (let i = periods - 1; i >= 0; i--) {
    const time = new Date();
    time.setMinutes(time.getMinutes() - i * intervalMinutes);
    const noise = (Math.random() - 0.5) * volatility * 2;
    price = price * (1 + noise);
    data.push({
      time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      price: Math.round(price * 100) / 100,
      volume: Math.floor(Math.random() * 1000000 + 200000),
    });
  }
  return data;
}
