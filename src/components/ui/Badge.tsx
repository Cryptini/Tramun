import { cn } from '@/lib/utils/cn';

type BadgeVariant = 'default' | 'success' | 'danger' | 'warning' | 'primary' | 'neutral';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  dot?: boolean;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-gray-100 text-text-secondary',
  primary: 'bg-primary-muted text-primary',
  success: 'bg-success-muted text-success',
  danger: 'bg-danger-muted text-danger',
  warning: 'bg-warning-muted text-amber-600',
  neutral: 'bg-gray-100 text-text-muted',
};

const dotColors: Record<BadgeVariant, string> = {
  default: 'bg-text-muted',
  primary: 'bg-primary',
  success: 'bg-success',
  danger: 'bg-danger',
  warning: 'bg-amber-500',
  neutral: 'bg-text-muted',
};

export function Badge({
  children,
  variant = 'default',
  size = 'sm',
  dot = false,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-semibold rounded-full',
        size === 'sm' ? 'text-2xs px-2.5 py-0.5' : 'text-xs px-3 py-1',
        variantStyles[variant],
        className
      )}
    >
      {dot && (
        <span className={cn('w-1.5 h-1.5 rounded-full', dotColors[variant])} />
      )}
      {children}
    </span>
  );
}

/** Percentage change badge — auto-colors based on sign */
export function ChangeBadge({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const isPositive = value >= 0;
  const variant = isPositive ? 'success' : 'danger';
  const sign = isPositive ? '+' : '';
  return (
    <Badge variant={variant} className={className}>
      {sign}{(value * 100).toFixed(2)}%
    </Badge>
  );
}
