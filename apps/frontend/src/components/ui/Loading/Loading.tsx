'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface LoadingProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'spinner' | 'skeleton' | 'dots';
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  fullScreen?: boolean;
  overlay?: boolean;
}

const sizeConfig = {
  sm: { spinner: 24, skeleton: 24 },
  md: { spinner: 40, skeleton: 40 },
  lg: { spinner: 64, skeleton: 64 },
};

export const Loading = React.forwardRef<HTMLDivElement, LoadingProps>(
  (
    {
      variant = 'spinner',
      size = 'md',
      label,
      fullScreen = false,
      overlay = false,
      className,
      ...props
    },
    ref
  ) => {
    const spinnerSize = sizeConfig[size].spinner;
    const skeletonSize = sizeConfig[size].skeleton;

    const content = (
      <div
        className={cn(
          'flex flex-col items-center justify-center gap-3',
          fullScreen ? 'h-screen' : ''
        )}
        role="status"
        aria-busy="true"
        aria-label={label ? `Loading: ${label}` : 'Loading'}
      >
        {variant === 'spinner' && (
          <div
            className="border-2 border-gray-200 border-t-sky-500 rounded-full animate-spin dark:border-gray-700 dark:border-t-sky-400"
            style={{ width: spinnerSize, height: spinnerSize }}
            aria-hidden="true"
          />
        )}

        {variant === 'skeleton' && (
          <div
            className="bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"
            style={{ width: skeletonSize, height: skeletonSize }}
            aria-hidden="true"
          />
        )}

        {variant === 'dots' && (
          <div
            className="flex gap-2"
            aria-hidden="true"
          >
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="bg-sky-500 dark:bg-sky-400 rounded-full animate-bounce"
                style={{
                  width: size === 'sm' ? 8 : size === 'md' ? 12 : 16,
                  height: size === 'sm' ? 8 : size === 'md' ? 12 : 16,
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
        )}

        {label && (
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            {label}
          </p>
        )}
      </div>
    );

    if (fullScreen) {
      return (
        <div
          ref={ref}
          className={cn(
            'fixed inset-0 z-50 flex items-center justify-center',
            overlay ? 'bg-black/50 dark:bg-black/70' : 'bg-white dark:bg-gray-900',
            className
          )}
          {...props}
        >
          {content}
        </div>
      );
    }

    if (overlay) {
      return (
        <div
          ref={ref}
          className={cn(
            'relative w-full h-full',
            className
          )}
          {...props}
        >
          {content}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          'w-full',
          className
        )}
        {...props}
      >
        {content}
      </div>
    );
  }
);

Loading.displayName = 'Loading';
