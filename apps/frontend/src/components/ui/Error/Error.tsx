'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '../Button';
import { Card } from '../Card';

export interface ErrorProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  message?: string;
  details?: string;
  severity?: 'error' | 'warning' | 'info';
  variant?: 'inline' | 'card' | 'alert';
  dismissible?: boolean;
  onDismiss?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const severityStyles = {
  error: {
    border: 'border-red-200 dark:border-red-900',
    bg: 'bg-red-50 dark:bg-red-950',
    text: 'text-red-900 dark:text-red-200',
    title: 'text-red-900 dark:text-red-100',
    message: 'text-red-800 dark:text-red-200',
    details: 'text-red-700 dark:text-red-300',
    icon: '🔴',
    alertBg: 'bg-red-600 dark:bg-red-700',
    alertText: 'text-white',
  },
  warning: {
    border: 'border-yellow-200 dark:border-yellow-900',
    bg: 'bg-yellow-50 dark:bg-yellow-950',
    text: 'text-yellow-900 dark:text-yellow-200',
    title: 'text-yellow-900 dark:text-yellow-100',
    message: 'text-yellow-800 dark:text-yellow-200',
    details: 'text-yellow-700 dark:text-yellow-300',
    icon: '⚠️',
    alertBg: 'bg-yellow-600 dark:bg-yellow-700',
    alertText: 'text-white',
  },
  info: {
    border: 'border-sky-200 dark:border-sky-900',
    bg: 'bg-sky-50 dark:bg-sky-950',
    text: 'text-sky-900 dark:text-sky-200',
    title: 'text-sky-900 dark:text-sky-100',
    message: 'text-sky-800 dark:text-sky-200',
    details: 'text-sky-700 dark:text-sky-300',
    icon: 'ℹ️',
    alertBg: 'bg-sky-600 dark:bg-sky-700',
    alertText: 'text-white',
  },
};

export const Error = React.forwardRef<HTMLDivElement, ErrorProps>(
  (
    {
      title,
      message,
      details,
      severity = 'error',
      variant = 'inline',
      dismissible = false,
      onDismiss,
      action,
      className,
      ...props
    },
    ref
  ) => {
    const [isDismissed, setIsDismissed] = React.useState(false);

    if (isDismissed) return null;

    const severityConfig = severityStyles[severity];

    const content = (
      <div className="flex gap-3 w-full">
        <div
          className="flex-shrink-0 text-lg mt-0.5"
          aria-hidden="true"
        >
          {severityConfig.icon}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className={cn('font-semibold text-sm', severityConfig.title)}>
            {title}
          </h3>

          {message && (
            <p className={cn('text-sm mt-1', severityConfig.message)}>
              {message}
            </p>
          )}

          {details && (
            <details className="mt-2">
              <summary className={cn(
                'cursor-pointer text-sm font-medium',
                severityConfig.text,
                'hover:opacity-80 transition-opacity'
              )}>
                More details
              </summary>
              <p className={cn('text-xs mt-2 whitespace-pre-wrap', severityConfig.details)}>
                {details}
              </p>
            </details>
          )}
        </div>

        {dismissible && (
          <button
            onClick={() => {
              setIsDismissed(true);
              onDismiss?.();
            }}
            className={cn(
              'flex-shrink-0 p-1 rounded',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500',
              'hover:opacity-70 transition-opacity',
              severityConfig.text
            )}
            aria-label="Dismiss error"
            type="button"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 4L4 12M4 4l8 8" />
            </svg>
          </button>
        )}
      </div>
    );

    const actions = action && (
      <div className="mt-3">
        <Button
          size="sm"
          variant={severity === 'error' ? 'primary' : 'secondary'}
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      </div>
    );

    if (variant === 'alert') {
      return (
        <div
          ref={ref}
          className={cn(
            'w-full px-4 py-3 rounded-md',
            severityConfig.alertBg,
            severityConfig.alertText,
            className
          )}
          role="alert"
          {...props}
        >
          <div className="flex gap-3">
            <div className="flex-shrink-0" aria-hidden="true">
              {severityConfig.icon}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm">
                {title}
              </h3>
              {message && (
                <p className="text-sm mt-1 opacity-90">
                  {message}
                </p>
              )}
              {actions}
            </div>
            {dismissible && (
              <button
                onClick={() => {
                  setIsDismissed(true);
                  onDismiss?.();
                }}
                className={cn(
                  'flex-shrink-0 p-1 rounded',
                  'focus-visible:outline-2 focus-visible:outline-offset-2',
                  'hover:opacity-70 transition-opacity',
                  'text-white'
                )}
                aria-label="Dismiss error"
                type="button"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 4L4 12M4 4l8 8" />
                </svg>
              </button>
            )}
          </div>
        </div>
      );
    }

    if (variant === 'card') {
      return (
        <Card
          ref={ref}
          className={cn(
            'border-l-4',
            severity === 'error' && 'border-l-red-600 dark:border-l-red-400',
            severity === 'warning' && 'border-l-yellow-600 dark:border-l-yellow-400',
            severity === 'info' && 'border-l-sky-600 dark:border-l-sky-400',
            severityConfig.bg,
            className
          )}
          {...props}
        >
          {content}
          {actions}
        </Card>
      );
    }

    // variant === 'inline' (default)
    return (
      <div
        ref={ref}
        className={cn(
          'border rounded-md px-4 py-3',
          'border-l-4',
          severityConfig.border,
          severityConfig.bg,
          className
        )}
        role="alert"
        {...props}
      >
        {content}
        {actions}
      </div>
    );
  }
);

Error.displayName = 'Error';
