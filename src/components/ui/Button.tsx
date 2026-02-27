'use client';

import { cn } from '@/lib/utils/cn';
import { type ButtonHTMLAttributes, forwardRef } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'outline';
type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantStyles: Record<Variant, string> = {
  primary: 'bg-primary text-white shadow-button hover:bg-primary-dark active:bg-primary-dark',
  secondary: 'bg-bg-elevated border border-border text-text-primary hover:bg-gray-100 active:bg-gray-200',
  ghost: 'bg-transparent text-text-secondary hover:bg-black/5 active:bg-black/10',
  danger: 'bg-danger text-white hover:opacity-90 active:opacity-80',
  success: 'bg-success text-white hover:opacity-90 active:opacity-80',
  outline: 'bg-transparent border-2 border-primary text-primary hover:bg-primary-muted active:opacity-80',
};

const sizeStyles: Record<Size, string> = {
  xs: 'h-7 px-3 text-xs rounded-lg gap-1',
  sm: 'h-9 px-4 text-sm rounded-xl gap-1.5',
  md: 'h-11 px-5 text-sm rounded-xl gap-2',
  lg: 'h-13 px-6 text-base rounded-2xl gap-2',
  xl: 'h-14 px-8 text-base rounded-2xl gap-2',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      leftIcon,
      rightIcon,
      children,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          'inline-flex items-center justify-center font-semibold transition-all duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
          'disabled:opacity-40 disabled:cursor-not-allowed',
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && 'w-full',
          !isDisabled && 'cursor-pointer',
          className
        )}
        {...props}
      >
        {loading ? (
          <>
            <Spinner size={size} />
            <span className="opacity-60">{children}</span>
          </>
        ) : (
          <>
            {leftIcon}
            {children}
            {rightIcon}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

function Spinner({ size }: { size: Size }) {
  const s = { xs: 12, sm: 14, md: 16, lg: 18, xl: 20 }[size];
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      className="animate-spin"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.3" />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
