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
      checked = false,
      onChange,
      ...props
    },
    ref
  ) => {
    const elementId = id || `radio-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="flex items-center gap-2">
        <input
          ref={ref}
          id={elementId}
          type="radio"
          name={name}
          checked={checked as boolean}
          onChange={onChange}
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
            } text-gray-700`}
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
    const groupId = `radio-group-${Math.random().toString(36).substr(2, 9)}`;
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
          aria-labelledby={legend}
        >
          {options.map((option) => (
            <div key={option.value} className="flex items-center gap-2">
              <input
                type="radio"
                id={`${name}-${option.value}`}
                name={name}
                value={option.value}
                checked={value === option.value}
                onChange={() => onChange(option.value)}
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
                } text-gray-700`}
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
