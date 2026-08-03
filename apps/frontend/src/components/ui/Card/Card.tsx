'use client';

import React, { forwardRef, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'elevated' | 'outlined' | 'filled';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  interactive?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({
    variant = 'outlined',
    padding = 'md',
    interactive = false,
    className,
    children,
    ...props
  }, ref) => {
    // Variant styles
    const variantStyles = {
      elevated: 'bg-white shadow-md border border-gray-100 dark:bg-gray-900 dark:border-gray-800',
      outlined: 'bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800',
      filled: 'bg-gray-50 border border-gray-200 dark:bg-gray-800 dark:border-gray-700',
    };

    // Padding styles
    const paddingStyles = {
      none: '',
      sm: 'p-2 md:p-3',
      md: 'p-4 md:p-6',
      lg: 'p-6 md:p-8',
    };

    // Interactive styles
    const interactiveStyles = interactive
      ? 'cursor-pointer transition-all duration-200 hover:shadow-lg dark:hover:shadow-xl hover:border-sky-300 dark:hover:border-sky-700'
      : '';

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-lg overflow-hidden',
          variantStyles[variant],
          paddingStyles[padding],
          interactiveStyles,
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export { Card };
export type { CardProps };
