'use client';

import { cn } from '@/lib/utils/cn';
import { type InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  hint?: string;
  error?: string;
  leftAdornment?: React.ReactNode;
  rightAdornment?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      hint,
      error,
      leftAdornment,
      rightAdornment,
      size = 'md',
      className,
      ...props
    },
    ref
  ) => {
    const sizeStyles = {
      sm: 'h-10 text-sm',
      md: 'h-12 text-base',
      lg: 'h-14 text-lg',
    };

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-text-secondary mb-1.5">
            {label}
          </label>
        )}
        <div
          className={cn(
            'flex items-center w-full rounded-xl',
            'bg-bg-elevated border transition-colors',
            error
              ? 'border-danger/60 focus-within:border-danger'
              : 'border-border focus-within:border-primary/60',
            sizeStyles[size],
            leftAdornment && 'pl-3',
            rightAdornment && 'pr-3',
          )}
        >
          {leftAdornment && (
            <span className="text-text-muted flex-shrink-0 mr-2">
              {leftAdornment}
            </span>
          )}
          <input
            ref={ref}
            className={cn(
              'flex-1 bg-transparent outline-none',
              'text-text-primary placeholder:text-text-muted font-numeric',
              !leftAdornment && 'pl-4',
              !rightAdornment && 'pr-4',
              className
            )}
            {...props}
          />
          {rightAdornment && (
            <span className="text-text-muted flex-shrink-0 ml-2 text-sm font-medium">
              {rightAdornment}
            </span>
          )}
        </div>
        {(hint || error) && (
          <p className={cn('text-xs mt-1.5', error ? 'text-danger' : 'text-text-muted')}>
            {error ?? hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

/** Quick amount selector buttons */
export function AmountPresets({
  amounts,
  onSelect,
  className,
}: {
  amounts: number[];
  onSelect: (amount: number) => void;
  className?: string;
}) {
  return (
    <div className={cn('flex gap-2', className)}>
      {amounts.map((amount) => (
        <button
          key={amount}
          onClick={() => onSelect(amount)}
          className="flex-1 h-9 text-sm font-medium rounded-xl bg-bg-elevated border border-border text-text-secondary hover:border-primary/50 hover:text-primary active:scale-95 transition-all"
        >
          ${amount >= 1000 ? `${amount / 1000}K` : amount}
        </button>
      ))}
    </div>
  );
}
