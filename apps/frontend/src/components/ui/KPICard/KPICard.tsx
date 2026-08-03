'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface KPICardProps {
  label: string;
  value: number | string;
  unit?: string;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
    label?: string;
  };
  status?: 'success' | 'warning' | 'error' | 'neutral';
  icon?: React.ReactNode;
  chart?: React.ReactNode;
  onClick?: () => void;
  isLoading?: boolean;
  className?: string;
  ariaLabel?: string;
}

const statusColors = {
  success: 'border-l-green-500',
  warning: 'border-l-yellow-500',
  error: 'border-l-red-500',
  neutral: 'border-l-gray-500',
};

const trendColors = {
  up: 'text-green-600 dark:text-green-400',
  down: 'text-red-600 dark:text-red-400',
  neutral: 'text-gray-600 dark:text-gray-400',
};

export const KPICard = React.forwardRef<HTMLDivElement, KPICardProps>(
  (
    {
      label,
      value,
      unit,
      trend,
      status = 'neutral',
      icon,
      chart,
      onClick,
      isLoading = false,
      className,
      ariaLabel,
    },
    ref
  ) => {
    const isClickable = onClick !== undefined;

    if (isLoading) {
      return (
        <div
          ref={ref}
          className={cn(
            'overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800',
            'h-32 animate-pulse'
          )}
          aria-busy="true"
          aria-label={ariaLabel || label}
        >
          <div className="flex flex-col gap-3 p-4">
            <div className="h-4 w-20 rounded bg-gray-300 dark:bg-gray-600"></div>
            <div className="h-7 w-32 rounded bg-gray-300 dark:bg-gray-600"></div>
            <div className="h-3 w-16 rounded bg-gray-300 dark:bg-gray-600"></div>
          </div>
        </div>
      );
    }

    return (
      <article
        ref={ref}
        className={cn(
          'relative overflow-hidden rounded-lg border border-gray-200 bg-white transition-all dark:border-gray-700 dark:bg-gray-800',
          'border-l-4',
          statusColors[status],
          'flex h-32 flex-col justify-between p-4',
          isClickable && 'cursor-pointer hover:shadow-lg hover:dark:shadow-gray-900/50',
          className
        )}
        onClick={onClick}
        role={isClickable ? 'button' : 'article'}
        tabIndex={isClickable ? 0 : undefined}
        onKeyDown={isClickable ? (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick?.();
          }
        } : undefined}
        aria-label={ariaLabel || label}
      >
        {/* Icon - Top Right */}
        {icon && (
          <div className="absolute right-4 top-4 text-2xl text-gray-400 dark:text-gray-600">
            {icon}
          </div>
        )}

        {/* Main Content - Left Side */}
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {label}
          </h3>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {value}
            </span>
            {unit && (
              <span className="text-sm text-gray-500 dark:text-gray-500">
                {unit}
              </span>
            )}
          </div>
        </div>

        {/* Trend Indicator - Bottom Left */}
        {trend && (
          <div className={cn('text-xs font-medium', trendColors[trend.direction])}>
            <span>
              {trend.direction === 'up' && '↑ '}
              {trend.direction === 'down' && '↓ '}
              {Math.abs(trend.value)}%
            </span>
            {trend.label && (
              <span className="ml-1 text-gray-600 dark:text-gray-400">
                {trend.label}
              </span>
            )}
          </div>
        )}

        {/* Chart - Bottom Right (optional) */}
        {chart && (
          <div className="absolute bottom-0 right-0 h-10 w-20">
            {chart}
          </div>
        )}
      </article>
    );
  }
);

KPICard.displayName = 'KPICard';
