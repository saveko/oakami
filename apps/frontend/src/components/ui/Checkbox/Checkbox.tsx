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
      checked = false,
      onChange,
      ...props
    },
    ref
  ) => {
    const elementId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;
    const helpId = `${elementId}-help`;
    const errorId = `${elementId}-error`;

    const descriptionIds = [
      helpText && helpId,
      errorMessage && errorId,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <input
            ref={ref}
            id={elementId}
            type="checkbox"
            checked={checked as boolean}
            onChange={onChange}
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
    const groupId = `checkbox-group-${Math.random().toString(36).substr(2, 9)}`;
    const helpId = `${groupId}-help`;
    const errorId = `${groupId}-error`;

    const handleChange = (value: string) => {
      const newValues = values.includes(value)
        ? values.filter((v) => v !== value)
        : [...values, value];
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

        <div
          className={
            layout === 'horizontal'
              ? 'flex flex-wrap gap-4'
              : 'flex flex-col gap-3'
          }
          role="group"
          aria-labelledby={legend}
        >
          {options.map((option) => (
            <div key={option.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                id={option.id}
                value={option.value}
                checked={values.includes(option.value)}
                onChange={() => handleChange(option.value)}
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
