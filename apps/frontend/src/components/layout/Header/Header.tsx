'use client';

import React, { forwardRef } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface Breadcrumb {
  label: string;
  href?: string;
}

export interface HeaderProps {
  title: string;
  description?: string;
  level?: 'h1' | 'h2' | 'h3';
  breadcrumbs?: Breadcrumb[];
  actions?: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Header = forwardRef<HTMLDivElement, HeaderProps>(
  ({
    title,
    description,
    level = 'h1',
    breadcrumbs,
    actions,
    variant = 'default',
    padding = 'md',
    className,
  }, ref) => {
    const HeadingComponent = level;

    const variantStyles = {
      // No `border-0` here: cn() merges Tailwind classes, so it would cancel the
      // base `border-b` and leave the default header with no separator at all.
      default: 'bg-white dark:bg-gray-900',
      elevated: 'bg-white dark:bg-gray-900 shadow-sm',
      outlined: 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800',
    };

    const paddingStyles = {
      sm: 'px-4 py-4 md:px-6',
      md: 'px-4 py-6 md:px-8',
      lg: 'px-6 py-8 md:px-12',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'w-full border-b border-gray-200 dark:border-gray-800',
          variantStyles[variant],
          paddingStyles[padding],
          className
        )}
      >
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumbs */}
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav
              className="mb-4 flex items-center gap-2"
              aria-label="Breadcrumbs"
            >
              {breadcrumbs.map((crumb, idx) => {
                const isLast = idx === breadcrumbs.length - 1;
                return (
                  <React.Fragment key={idx}>
                    {crumb.href && !isLast ? (
                      <Link
                        href={crumb.href}
                        className={cn(
                          'text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300',
                          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 rounded px-1'
                        )}
                      >
                        {crumb.label}
                      </Link>
                    ) : (
                      <span
                        className={cn(
                          'text-sm',
                          isLast
                            ? 'text-gray-900 dark:text-white font-medium'
                            : 'text-gray-500 dark:text-gray-400'
                        )}
                        aria-current={isLast ? 'page' : undefined}
                      >
                        {crumb.label}
                      </span>
                    )}
                    {!isLast && (
                      <span
                        className="text-gray-300 dark:text-gray-600"
                        aria-hidden="true"
                      >
                        /
                      </span>
                    )}
                  </React.Fragment>
                );
              })}
            </nav>
          )}

          {/* Main content */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Title & Description */}
            <div className="flex-1">
              {title && (
                <HeadingComponent
                  className={cn(
                  'font-bold text-gray-900 dark:text-white',
                  level === 'h1' && 'text-4xl md:text-5xl',
                  level === 'h2' && 'text-3xl md:text-4xl',
                  level === 'h3' && 'text-2xl md:text-3xl',
                    'mb-2'
                  )}
                >
                  {title}
                </HeadingComponent>
              )}

              {description && (
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  {description}
                </p>
              )}
            </div>

            {/* Actions */}
            {actions && (
              <div className="flex flex-wrap items-center gap-2 md:gap-3 md:flex-nowrap justify-start md:justify-end">
                {actions}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

Header.displayName = 'Header';

export { Header };
