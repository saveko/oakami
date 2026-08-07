'use client';

import React, { forwardRef, InputHTMLAttributes } from 'react';

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'role' | 'size'> {
  label?: string;
  required?: boolean;
  error?: boolean;
  errorMessage?: string;
  helpText?: string;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  size?: 'sm' | 'md';
  id: string;
}

const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  (
    {
      label,
      required = false,
      error = false,
      errorMessage,
      helpText,
      ariaLabel,
      ariaDescribedBy,
      size = 'md',
      id,
      checked,
      defaultChecked,
      disabled = false,
      onChange,
      onKeyDown,
      className,
      ...props
    },
    ref
  ) => {
    // role="switch" requires an explicit aria-checked, so mirror the input's
    // state when the component is used uncontrolled.
    const [internalChecked, setInternalChecked] = React.useState(
      checked ?? defaultChecked ?? false
    );
    const isChecked = checked ?? internalChecked;

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled) return;
      if (checked === undefined) setInternalChecked(event.currentTarget.checked);
      onChange?.(event);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      onKeyDown?.(event);
      if (disabled || event.defaultPrevented) return;
      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        event.currentTarget.click();
      }
    };

    const sizes = {
      sm: 'w-10 h-5',
      md: 'w-12 h-6',
    };

    const thumbSizes = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
    };

    const thumbTransforms = {
      sm: 'translate-x-0 group-has-[:checked]:translate-x-5',
      md: 'translate-x-0.5 group-has-[:checked]:translate-x-6',
    };

    const descriptionIds = [helpText && `${id}-help`, error && errorMessage && `${id}-error`]
      .filter(Boolean)
      .join(' ');

    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="group relative inline-block">
            <input
              ref={ref}
              id={id}
              type="checkbox"
              role="switch"
              checked={checked as boolean | undefined}
              defaultChecked={defaultChecked}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              disabled={disabled}
              required={required}
              aria-required={required}
              aria-checked={isChecked}
              aria-invalid={error}
              aria-label={ariaLabel || label}
              aria-describedby={ariaDescribedBy || (descriptionIds || undefined)}
              className="absolute opacity-0 w-0 h-0 peer cursor-pointer disabled:cursor-not-allowed"
              {...props}
            />

            {/* Switch background */}
            <div
              className={`
                ${sizes[size]}
                rounded-full
                bg-gray-300 peer-checked:bg-sky-600
                transition-colors duration-200 ease-out
                peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2
                peer-focus-visible:outline-sky-500
                peer-disabled:opacity-50 peer-disabled:cursor-not-allowed
                cursor-pointer
              `}
              aria-hidden="true"
            />

            {/* Switch thumb */}
            <div
              className={`
                ${thumbSizes[size]}
                ${thumbTransforms[size]}
                absolute top-1/2 -translate-y-1/2 left-0.5
                bg-white rounded-full
                shadow-md
                transition-transform duration-200 ease-out
                pointer-events-none
              `}
              aria-hidden="true"
            />
          </div>

          {label && (
            <label
              htmlFor={id}
              className={`
                text-sm font-medium cursor-pointer
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'text-gray-700'}
              `}
            >
              {label}
              {required && (
                <span aria-label="required" className="text-red-600 ml-1">
                  *
                </span>
              )}
            </label>
          )}
        </div>

        {helpText && (
          <p id={`${id}-help`} className="text-xs text-gray-500 ml-0">
            {helpText}
          </p>
        )}

        {error && errorMessage && (
          <p
            id={`${id}-error`}
            role="alert"
            className="text-xs text-red-600 ml-0"
          >
            {errorMessage}
          </p>
        )}
      </div>
    );
  }
);

Switch.displayName = 'Switch';

export default Switch;
