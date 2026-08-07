'use client';

import React, { forwardRef, InputHTMLAttributes } from 'react';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  required?: boolean;
  error?: boolean;
  errorMessage?: string;
  helpText?: string;
  indeterminate?: boolean;
  ariaLabel?: string;
  ariaDescribedBy?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      label,
      required = false,
      error = false,
      errorMessage,
      helpText,
      indeterminate = false,
      ariaLabel,
      ariaDescribedBy,
      id,
      className,
      disabled = false,
      checked,
      onChange,
      onKeyDown,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const elementId = id || `checkbox-${generatedId}`;
    const helpId = `${elementId}-help`;
    const errorId = `${elementId}-error`;

    const descriptionIds = [
      helpText && helpId,
      errorMessage && errorId,
    ]
      .filter(Boolean)
      .join(' ');

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled) return;
      onChange?.(event);
    };

    // Space natively toggles a checkbox, but the visible control is the styled
    // label, so drive the toggle explicitly and support Enter as well.
    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      onKeyDown?.(event);
      if (disabled || event.defaultPrevented) return;
      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        event.currentTarget.click();
      }
    };

    return (
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <input
            ref={ref}
            id={elementId}
            type="checkbox"
            checked={checked as boolean | undefined}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            required={required}
            aria-required={required}
            aria-invalid={error}
            aria-describedby={descriptionIds || undefined}
            aria-label={ariaLabel || label}
            className={`
              h-5 w-5 rounded text-sky-600 cursor-pointer
              border-gray-300 focus-visible:outline-2 focus-visible:outline-offset-2
              focus-visible:outline-sky-500 disabled:opacity-50 disabled:cursor-not-allowed
              transition
              ${className || ''}
            `}
            {...props}
          />
          {label && (
            <label
              htmlFor={elementId}
              className={`text-sm font-medium cursor-pointer ${
                disabled ? 'opacity-50 cursor-not-allowed' : ''
              } ${error ? 'text-red-600' : 'text-gray-700'}`}
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

        {errorMessage && (
          <p
            id={errorId}
            role="alert"
            className="text-xs text-red-600 mt-1"
          >
            {errorMessage}
          </p>
        )}

        {helpText && (
          <p id={helpId} className="text-xs text-gray-500 mt-1">
            {helpText}
          </p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export interface CheckboxOption {
  id: string;
  label: string;
  value: string;
  disabled?: boolean;
}

export interface CheckboxGroupProps {
  options: CheckboxOption[];
  values: string[];
  onChange: (values: string[]) => void;
  legend: string;
  required?: boolean;
  error?: boolean;
  errorMessage?: string;
  helpText?: string;
  layout?: 'vertical' | 'horizontal';
  disabled?: boolean;
}

export const CheckboxGroup = forwardRef<HTMLFieldSetElement, CheckboxGroupProps>(
  (
    {
      options,
      values,
      onChange,
      legend,
      required = false,
      error = false,
      errorMessage,
      helpText,
      layout = 'vertical',
      disabled = false,
    },
    ref
  ) => {
    const groupId = `checkbox-group-${React.useId()}`;
    const helpId = `${groupId}-help`;
    const errorId = `${groupId}-error`;

    const handleChange = (option: CheckboxOption) => {
      if (disabled || option.disabled) return;
      const newValues = values.includes(option.value)
        ? values.filter((v) => v !== option.value)
        : [...values, option.value];
      onChange(newValues);
    };

    const descriptionIds = [
      helpText && helpId,
      errorMessage && errorId,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <fieldset
        ref={ref}
        className="border-0 p-0 m-0"
        disabled={disabled}
        aria-required={required}
        aria-invalid={error}
        aria-describedby={descriptionIds || undefined}
      >
        <legend className="text-sm font-medium text-gray-700 mb-2 block">
          {legend}
          {required && (
            <span aria-label="required" className="text-red-600 ml-1">
              *
            </span>
          )}
        </legend>

        {/* No role="group" here: the wrapping <fieldset> already exposes it, and
            a second one makes every getByRole('group') query ambiguous. */}
        <div
          className={
            layout === 'horizontal'
              ? 'flex flex-wrap gap-4'
              : 'flex flex-col gap-3'
          }
        >
          {options.map((option) => (
            <div key={option.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                id={option.id}
                value={option.value}
                checked={values.includes(option.value)}
                onChange={() => handleChange(option)}
                disabled={option.disabled || disabled}
                aria-label={option.label}
                className={`
                  h-5 w-5 rounded text-sky-600 cursor-pointer
                  border-gray-300 focus-visible:outline-2 focus-visible:outline-offset-2
                  focus-visible:outline-sky-500 disabled:opacity-50 disabled:cursor-not-allowed
                  transition
                `}
              />
              <label
                htmlFor={option.id}
                className={`text-sm cursor-pointer ${
                  option.disabled || disabled ? 'opacity-50 cursor-not-allowed' : ''
                } ${error ? 'text-red-600' : 'text-gray-700'}`}
              >
                {option.label}
              </label>
            </div>
          ))}
        </div>

        {errorMessage && (
          <p
            id={errorId}
            role="alert"
            className="text-xs text-red-600 mt-2"
          >
            {errorMessage}
          </p>
        )}

        {helpText && (
          <p id={helpId} className="text-xs text-gray-500 mt-2">
            {helpText}
          </p>
        )}
      </fieldset>
    );
  }
);

CheckboxGroup.displayName = 'CheckboxGroup';

export default Checkbox;
