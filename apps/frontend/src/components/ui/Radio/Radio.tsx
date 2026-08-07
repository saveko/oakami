'use client';

import React, { forwardRef, InputHTMLAttributes } from 'react';

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  required?: boolean;
  ariaLabel?: string;
  ariaDescribedBy?: string;
}

const Radio = forwardRef<HTMLInputElement, RadioProps>(
  (
    {
      label,
      required = false,
      ariaLabel,
      ariaDescribedBy,
      id,
      name,
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
    const elementId = id || `radio-${generatedId}`;

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled) return;
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

    return (
      <div className="flex items-center gap-2">
        <input
          ref={ref}
          id={elementId}
          type="radio"
          name={name}
          checked={checked as boolean | undefined}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          required={required}
          aria-required={required}
          aria-label={ariaLabel || label}
          aria-describedby={ariaDescribedBy}
          className={`
            h-5 w-5 text-sky-600 cursor-pointer
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
            } text-gray-700 dark:text-gray-300`}
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
    );
  }
);

Radio.displayName = 'Radio';

export interface RadioOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  options: RadioOption[];
  value?: string;
  onChange: (value: string) => void;
  name: string;
  legend: string;
  required?: boolean;
  error?: boolean;
  errorMessage?: string;
  helpText?: string;
  layout?: 'vertical' | 'horizontal';
  disabled?: boolean;
}

export const RadioGroup = forwardRef<HTMLFieldSetElement, RadioGroupProps>(
  (
    {
      options,
      value,
      onChange,
      name,
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
    const groupId = `radio-group-${React.useId()}`;

    const handleOptionChange = (option: RadioOption) => {
      if (disabled || option.disabled) return;
      onChange(option.value);
    };
    const helpId = `${groupId}-help`;
    const errorId = `${groupId}-error`;

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
          role="radiogroup"
          aria-label={legend}
        >
          {options.map((option) => (
            <div key={option.value} className="flex items-center gap-2">
              <input
                type="radio"
                id={`${name}-${option.value}`}
                name={name}
                value={option.value}
                checked={value === option.value}
                onChange={() => handleOptionChange(option)}
                disabled={option.disabled || disabled}
                aria-label={option.label}
                className={`
                  h-5 w-5 text-sky-600 cursor-pointer
                  border-gray-300 focus-visible:outline-2 focus-visible:outline-offset-2
                  focus-visible:outline-sky-500 disabled:opacity-50 disabled:cursor-not-allowed
                  transition
                `}
              />
              <label
                htmlFor={`${name}-${option.value}`}
                className={`text-sm cursor-pointer ${
                  option.disabled || disabled ? 'opacity-50 cursor-not-allowed' : ''
                } text-gray-700 dark:text-gray-300`}
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

RadioGroup.displayName = 'RadioGroup';

export default Radio;
