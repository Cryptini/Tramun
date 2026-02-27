'use client';

import { cn } from '@/lib/utils/cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  variant?: 'default' | 'elevated' | 'glass' | 'outline';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
  interactive?: boolean;
  style?: React.CSSProperties;
}

const variantStyles = {
  default: 'bg-white border border-border/60 shadow-card',
  elevated: 'bg-bg-elevated border border-border/40',
  glass: 'bg-white/80 border border-border/30 backdrop-blur-sm shadow-card',
  outline: 'bg-transparent border border-border',
};

const paddingStyles = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-5',
};

export function Card({
  children,
  className,
  style,
  variant = 'default',
  padding = 'md',
  onClick,
  interactive = false,
  style,
}: CardProps) {
  return (
    <div
      onClick={onClick}
      style={style}
      className={cn(
        'rounded-2xl transition-all duration-200',
        variantStyles[variant],
        paddingStyles[padding],
        (interactive || onClick) && 'cursor-pointer active:scale-[0.98] active:opacity-90 hover:shadow-card-hover',
        className
      )}
    >
      {children}
    </div>
  );
}

/** Divider for use inside cards */
export function CardDivider({ className }: { className?: string }) {
  return <div className={cn('border-t border-border/50 my-3', className)} />;
}

/** Card row for key-value pairs */
export function CardRow({
  label,
  value,
  className,
}: {
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center justify-between', className)}>
      <span className="text-sm text-text-secondary">{label}</span>
      <span className="text-sm font-medium text-text-primary">{value}</span>
    </div>
  );
}
