'use client';

import { cn } from '@/lib/utils/cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'glass' | 'outline';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
  interactive?: boolean;
}

const variantStyles = {
  default: 'bg-bg-card border border-border/50',
  elevated: 'bg-bg-elevated border border-border',
  glass: 'bg-bg-card/80 border border-border/30 backdrop-blur-sm',
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
  variant = 'default',
  padding = 'md',
  onClick,
  interactive = false,
}: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-2xl transition-all duration-150',
        variantStyles[variant],
        paddingStyles[padding],
        (interactive || onClick) && 'cursor-pointer active:scale-[0.98] active:opacity-90',
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
