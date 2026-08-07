'use client';

import React, { forwardRef, ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'destructive' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'leading' | 'trailing';
  fullWidth?: boolean;
  ariaLabel?: string;
  ariaDescribedBy?: string;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    variant = 'primary',
    size = 'md',
    isLoading = false,
    icon,
    iconPosition = 'leading',
    fullWidth = false,
    disabled = false,
    className,
    children,
    ariaLabel,
    ariaDescribedBy,
    type = 'button',
    ...props
  }, ref) => {
    const isDisabled = disabled || isLoading;

    // Variant styles
    const variantStyles = {
      primary: 'bg-sky-600 text-white hover:bg-sky-700 focus-visible:outline-sky-500 disabled:bg-gray-300 disabled:text-gray-500',
      secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus-visible:outline-gray-500 disabled:bg-gray-100 disabled:text-gray-400',
      destructive: 'bg-red-600 text-white hover:bg-red-700 focus-visible:outline-red-500 disabled:bg-gray-300 disabled:text-gray-500',
      ghost: 'text-gray-900 hover:bg-gray-100 focus-visible:outline-gray-500 disabled:text-gray-400 dark:text-gray-50 dark:hover:bg-gray-800',
    };

    // Size styles
    const sizeStyles = {
      sm: 'px-3 py-1.5 text-sm leading-6 min-h-[32px]',
      md: 'px-4 py-2 text-base leading-6 min-h-[44px]',
      lg: 'px-6 py-3 text-lg leading-8 min-h-[48px]',
    };

    // Combined styles with Tailwind
    const baseStyles = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors duration-150 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2';

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-busy={isLoading}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {/* Loading spinner */}
        {isLoading && (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}

        {/* Leading icon */}
        {icon && iconPosition === 'leading' && !isLoading && (
          <span className="flex-shrink-0" aria-hidden="true">
            {icon}
          </span>
        )}

        {/* Children (button text) */}
        {children && <span>{children}</span>}

        {/* Trailing icon */}
        {icon && iconPosition === 'trailing' && !isLoading && (
          <span className="flex-shrink-0" aria-hidden="true">
            {icon}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
export type { ButtonProps };
