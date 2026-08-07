'use client';

import React, { forwardRef, InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  required?: boolean;
  error?: boolean;
  errorMessage?: string;
  helpText?: string;
  icon?: React.ReactNode;
  iconPosition?: 'leading' | 'trailing';
  ariaDescribedBy?: string;
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({
    label,
    required = false,
    error = false,
    errorMessage,
    helpText,
    icon,
    iconPosition = 'leading',
    ariaDescribedBy,
    fullWidth = true,
    type = 'text',
    id,
    disabled = false,
    className,
    ...props
  }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const describedBy = [
      ariaDescribedBy,
      helpText && `${inputId}-help`,
      error && errorMessage && `${inputId}-error`,
    ]
      .filter(Boolean)
      .join(' ') || undefined;

    // Base styles
    const baseStyles = 'w-full px-3 py-2 text-base rounded-lg border transition-colors duration-150 placeholder:text-gray-400 dark:placeholder:text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2';

    // Border and background styles
    const borderStyles = error
      ? 'border-red-500 focus-visible:outline-red-500'
      : 'border-gray-300 focus-visible:outline-sky-500';

    const bgStyles = disabled ? 'bg-gray-100' : 'bg-white';

    return (
      <div className={cn('flex flex-col gap-1', fullWidth && 'w-full')}>
        {/* Label */}
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-900 dark:text-gray-50">
            {label}
            {required && (
              <span
                className="text-red-600 ml-1"
                aria-label="required"
              >
                *
              </span>
            )}
          </label>
        )}

        {/* Input container with icon support */}
        <div className="relative">
          {/* Leading icon */}
          {icon && iconPosition === 'leading' && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 flex-shrink-0 pointer-events-none" aria-hidden="true">
              {icon}
            </div>
          )}

          {/* Input field */}
          <input
            ref={ref}
            id={inputId}
            type={type}
            disabled={disabled}
            aria-required={required}
            aria-invalid={error}
            aria-describedby={describedBy}
            className={cn(
              baseStyles,
              borderStyles,
              bgStyles,
              icon && iconPosition === 'leading' && 'pl-10',
              icon && iconPosition === 'trailing' && 'pr-10',
              className
            )}
            {...props}
          />

          {/* Trailing icon */}
          {icon && iconPosition === 'trailing' && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 flex-shrink-0 pointer-events-none" aria-hidden="true">
              {icon}
            </div>
          )}
        </div>

        {/* Help text */}
        {helpText && !error && (
          <p
            id={`${inputId}-help`}
            className="text-xs text-gray-600 dark:text-gray-400 mt-1"
          >
            {helpText}
          </p>
        )}

        {/* Error message */}
        {error && errorMessage && (
          <p
            id={`${inputId}-error`}
            role="alert"
            className="text-xs text-red-600 dark:text-red-400 mt-1 flex items-center gap-1"
          >
            <span className="font-semibold">⚠</span>
            {errorMessage}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
export type { InputProps };
