'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'solid' | 'outline' | 'dot';
  color?: 'sky' | 'red' | 'green' | 'yellow' | 'gray';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  onRemove?: () => void;
  removable?: boolean;
  ariaLabel?: string;
}

const variantStyles = {
  solid: {
    sky: 'bg-sky-100 text-sky-900 dark:bg-sky-900 dark:text-sky-100',
    red: 'bg-red-100 text-red-900 dark:bg-red-900 dark:text-red-100',
    green: 'bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-100',
    yellow: 'bg-yellow-100 text-yellow-900 dark:bg-yellow-900 dark:text-yellow-100',
    gray: 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100',
  },
  outline: {
    sky: 'border border-sky-300 text-sky-700 dark:border-sky-600 dark:text-sky-300',
    red: 'border border-red-300 text-red-700 dark:border-red-600 dark:text-red-300',
    green: 'border border-green-300 text-green-700 dark:border-green-600 dark:text-green-300',
    yellow: 'border border-yellow-300 text-yellow-700 dark:border-yellow-600 dark:text-yellow-300',
    gray: 'border border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300',
  },
  dot: {
    sky: 'text-sky-700 dark:text-sky-400',
    red: 'text-red-700 dark:text-red-400',
    green: 'text-green-700 dark:text-green-400',
    yellow: 'text-yellow-700 dark:text-yellow-400',
    gray: 'text-gray-700 dark:text-gray-400',
  },
};

const sizeStyles = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1.5 text-sm',
  lg: 'px-4 py-2 text-base',
};

const dotColorStyles = {
  sky: 'bg-sky-500 dark:bg-sky-400',
  red: 'bg-red-500 dark:bg-red-400',
  green: 'bg-green-500 dark:bg-green-400',
  yellow: 'bg-yellow-500 dark:bg-yellow-400',
  gray: 'bg-gray-500 dark:bg-gray-400',
};

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      variant = 'solid',
      color = 'gray',
      size = 'md',
      icon,
      onRemove,
      removable = false,
      className,
      ariaLabel,
      children,
      ...props
    },
    ref
  ) => {
    const variantClass = variantStyles[variant]?.[color] || variantStyles.solid.gray;
    const sizeClass = sizeStyles[size];

    const isDot = variant === 'dot';

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center gap-2 rounded-full font-medium whitespace-nowrap',
          sizeClass,
          !isDot && variantClass,
          isDot && 'text-sm',
          className
        )}
        role={isDot ? 'status' : undefined}
        aria-label={ariaLabel || (typeof children === 'string' ? children : undefined)}
        {...props}
      >
        {isDot && (
          <span
            className={cn('inline-block w-2 h-2 rounded-full', dotColorStyles[color])}
            aria-hidden="true"
          />
        )}

        {icon && <span aria-hidden="true">{icon}</span>}

        <span>{children}</span>

        {removable && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove?.();
            }}
            className={cn(
              'ml-1 inline-flex items-center justify-center rounded-full',
              'w-4 h-4 p-0',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500',
              'hover:opacity-70 transition-opacity',
              isDot ? 'text-gray-400 hover:text-gray-600' : ''
            )}
            aria-label={`Remove ${typeof children === 'string' ? children : 'badge'}`}
            type="button"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M1 1l10 10M11 1L1 11" />
            </svg>
          </button>
        )}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
