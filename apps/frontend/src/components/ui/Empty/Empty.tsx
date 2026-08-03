'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Button, type ButtonProps } from '../Button';

export interface EmptyProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: ButtonProps['variant'];
    size?: ButtonProps['size'];
  };
  size?: 'sm' | 'md';
  variant?: 'default' | 'compact';
}

export const Empty = React.forwardRef<HTMLDivElement, EmptyProps>(
  (
    {
      icon,
      title,
      description,
      action,
      size = 'md',
      variant = 'default',
      className,
      ...props
    },
    ref
  ) => {
    const isSmall = size === 'sm';

    const containerHeight = {
      default: { sm: 'min-h-64', md: 'min-h-96' },
      compact: { sm: 'min-h-40', md: 'min-h-56' },
    }[variant][size];

    const iconSize = {
      sm: 'text-4xl',
      md: 'text-6xl',
    }[size];

    const titleSize = {
      sm: 'text-lg',
      md: 'text-2xl',
    }[size];

    const descriptionSize = {
      sm: 'text-sm',
      md: 'text-base',
    }[size];

    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col items-center justify-center',
          'px-4 py-8',
          containerHeight,
          'gap-4',
          className
        )}
        role="status"
        aria-label={title}
        {...props}
      >
        {icon && (
          <div
            className={cn(
              'flex-shrink-0',
              'text-gray-400 dark:text-gray-500',
              iconSize
            )}
            aria-hidden="true"
          >
            {icon}
          </div>
        )}

        <div className="flex flex-col items-center gap-2 text-center max-w-md">
          <h3
            className={cn(
              'font-semibold',
              'text-gray-900 dark:text-gray-100',
              titleSize
            )}
          >
            {title}
          </h3>

          {description && (
            <p
              className={cn(
                'text-gray-600 dark:text-gray-400',
                descriptionSize
              )}
            >
              {description}
            </p>
          )}
        </div>

        {action && (
          <div className="pt-2">
            <Button
              variant={action.variant || 'primary'}
              size={action.size || (isSmall ? 'sm' : 'md')}
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          </div>
        )}
      </div>
    );
  }
);

Empty.displayName = 'Empty';
