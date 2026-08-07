'use client';

import React, { useState, useRef, useCallback, useEffect, forwardRef } from 'react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string | string[];
  onChange?: (value: string | string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  isLoading?: boolean;
  isMulti?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  label?: string;
  required?: boolean;
  error?: boolean;
  errorMessage?: string;
  helpText?: string;
  ariaLabel?: string;
  id?: string;
}

const Select = forwardRef<HTMLDivElement, SelectProps>(
  (
    {
      options,
      value,
      onChange,
      placeholder = 'Select an option',
      disabled = false,
      isLoading = false,
      isMulti = false,
      searchable = true,
      clearable = true,
      label,
      required = false,
      error = false,
      errorMessage,
      helpText,
      ariaLabel,
      id,
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [highlightedIndex, setHighlightedIndex] = useState(0);
    const selectRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const optionsRef = useRef<HTMLDivElement>(null);
    const generatedId = React.useId();
    const elementId = id || `select-${generatedId}`;
    const helpId = `${elementId}-help`;
    const errorId = `${elementId}-error`;
    const listboxId = `${elementId}-listbox`;

    const selectedValue = value || (isMulti ? [] : '');
    const isValueArray = Array.isArray(selectedValue);

    const filteredOptions = searchable
      ? options.filter((opt) =>
          opt.label.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : options;

    const getSelectedLabel = () => {
      if (isMulti && isValueArray) {
        if (selectedValue.length === 0) return placeholder;
        if (selectedValue.length === 1) {
          return options.find((o) => o.value === selectedValue[0])?.label || placeholder;
        }
        return `${selectedValue.length} selected`;
      }

      if (!isMulti && typeof selectedValue === 'string') {
        return options.find((o) => o.value === selectedValue)?.label || placeholder;
      }

      return placeholder;
    };

    const handleToggle = useCallback(() => {
      if (disabled || isLoading) return;
      setIsOpen(!isOpen);
      setSearchTerm('');
      setHighlightedIndex(0);
    }, [disabled, isLoading, isOpen]);

    const handleSelect = useCallback(
      (option: SelectOption) => {
        if (option.disabled) return;

        if (isMulti && isValueArray) {
          const newValue = selectedValue.includes(option.value)
            ? selectedValue.filter((v) => v !== option.value)
            : [...selectedValue, option.value];
          onChange?.(newValue);
        } else {
          onChange?.(option.value);
          setIsOpen(false);
        }
        setSearchTerm('');
      },
      [isMulti, selectedValue, isValueArray, onChange]
    );

    const handleClear = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange?.(isMulti ? [] : '');
      },
      [isMulti, onChange]
    );

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement | HTMLButtonElement>) => {
        if (!isOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter')) {
          e.preventDefault();
          setIsOpen(true);
          return;
        }

        if (!isOpen) return;

        switch (e.key) {
          case 'ArrowDown':
            e.preventDefault();
            setHighlightedIndex((prev) =>
              prev < filteredOptions.length - 1 ? prev + 1 : prev
            );
            break;

          case 'ArrowUp':
            e.preventDefault();
            setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
            break;

          case 'Enter':
            e.preventDefault();
            if (filteredOptions[highlightedIndex]) {
              handleSelect(filteredOptions[highlightedIndex]);
            }
            break;

          case 'Escape':
            e.preventDefault();
            setIsOpen(false);
            // Focus must not be stranded on the search input inside the closed
            // dropdown; return it to the control that opened it.
            document.getElementById(elementId)?.focus();
            break;

          case 'Tab':
            setIsOpen(false);
            break;

          default:
            break;
        }
      },
      [isOpen, filteredOptions, highlightedIndex, handleSelect, elementId]
    );

    // Scroll highlighted option into view
    useEffect(() => {
      if (!isOpen || !optionsRef.current) return;

      const highlightedElement = optionsRef.current.querySelector(
        '[data-highlighted="true"]'
      ) as HTMLElement;

      if (highlightedElement) {
        highlightedElement.scrollIntoView({ block: 'nearest' });
      }
    }, [highlightedIndex, isOpen, filteredOptions]);

    // Close on outside click
    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (selectRef.current && !selectRef.current.contains(e.target as Node)) {
          setIsOpen(false);
        }
      };

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
      }
    }, [isOpen]);

    // Focus search input when dropdown opens
    useEffect(() => {
      if (isOpen && searchable && searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, [isOpen, searchable]);

    const descriptionIds = [
      helpText && helpId,
      errorMessage && errorId,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div ref={ref} className="w-full">
        {label && (
          <label
            id={`${elementId}-label`}
            htmlFor={elementId}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            {label}
            {required && (
              <span aria-label="required" className="text-red-600 ml-1">
                *
              </span>
            )}
          </label>
        )}

        <div
          ref={selectRef}
          className="relative w-full"
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={isOpen ? listboxId : undefined}
          aria-activedescendant={
            isOpen && filteredOptions[highlightedIndex]
              ? `${listboxId}-option-${highlightedIndex}`
              : undefined
          }
          aria-labelledby={label ? `${elementId}-label` : undefined}
          aria-label={label ? undefined : ariaLabel || placeholder}
          aria-required={required || undefined}
          aria-invalid={error || undefined}
        >
          <button
            id={elementId}
            type="button"
            onClick={handleToggle}
            onKeyDown={handleKeyDown}
            disabled={disabled || isLoading}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            aria-controls={isOpen ? listboxId : undefined}
            aria-labelledby={label ? `${elementId}-label` : undefined}
            aria-label={ariaLabel}
            aria-describedby={descriptionIds || undefined}
            aria-busy={isLoading}
            className={`
              w-full px-3 py-2 text-left border rounded-lg min-h-[44px]
              text-gray-900 dark:text-gray-100
              transition focus-visible:outline-2 focus-visible:outline-offset-2
              focus-visible:outline-sky-500
              disabled:opacity-50 disabled:cursor-not-allowed
              ${
                error
                  ? 'border-red-300 focus:border-red-500'
                  : 'border-gray-300 focus:border-sky-500'
              }
            `}
          >
            <div className="flex items-center justify-between">
              <span
                className={
                  selectedValue === '' || (isValueArray && selectedValue.length === 0)
                    ? 'text-gray-500 dark:text-gray-400'
                    : 'text-gray-900 dark:text-gray-100'
                }
              >
                {isLoading ? '⏳ Loading...' : getSelectedLabel()}
              </span>
              <span className="flex items-center gap-1 ml-2">
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
              </span>
            </div>
          </button>

          {/* Sibling of the trigger, never nested inside it: a control inside a
              button is invalid HTML and an axe "nested interactive" violation. */}
          {clearable && selectedValue !== '' && !(isValueArray && selectedValue.length === 0) && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-9 top-1/2 -translate-y-1/2 p-1 rounded transition hover:bg-gray-100 dark:hover:bg-gray-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
              aria-label="Clear selection"
            >
              ✕
            </button>
          )}

          {isOpen && (
            <div
              className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg"
              role="presentation"
            >
              {searchable && (
                <div className="p-2 border-b border-gray-200">
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setHighlightedIndex(0);
                    }}
                    onKeyDown={handleKeyDown}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                    aria-label="Search options"
                  />
                </div>
              )}

              {filteredOptions.length === 0 ? (
                <div className="px-3 py-2 text-center text-gray-500 text-sm">
                  No options found
                </div>
              ) : (
                <ul
                  ref={optionsRef}
                  id={listboxId}
                  className="max-h-60 overflow-y-auto m-0 p-0 list-none"
                  role="listbox"
                  aria-multiselectable={isMulti || undefined}
                  aria-label={ariaLabel || label || 'Options'}
                >
                  {filteredOptions.map((option, index) => {
                    const isSelected =
                      isMulti && isValueArray
                        ? selectedValue.includes(option.value)
                        : option.value === selectedValue;

                    return (
                      // A listbox may only own options — a <button> here is an
                      // axe "nested interactive"/required-children violation and
                      // makes every getByRole('button') query ambiguous.
                      <li
                        key={option.value}
                        id={`${listboxId}-option-${index}`}
                        role="option"
                        aria-selected={isSelected}
                        aria-disabled={option.disabled || undefined}
                        data-highlighted={index === highlightedIndex}
                        onClick={() => handleSelect(option)}
                        onMouseEnter={() => setHighlightedIndex(index)}
                        className={`
                          w-full px-3 py-2 text-left text-sm transition cursor-pointer
                          min-h-[32px] flex items-center gap-2
                          text-gray-900 dark:text-gray-100
                          ${option.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                          ${index === highlightedIndex ? 'bg-sky-50 dark:bg-sky-900' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}
                          ${isSelected ? 'bg-sky-100 dark:bg-sky-800 font-medium' : ''}
                        `}
                      >
                        {isMulti && (
                          <span
                            aria-hidden="true"
                            className={`w-4 h-4 shrink-0 rounded border flex items-center justify-center text-xs ${
                              isSelected
                                ? 'bg-sky-600 border-sky-600 text-white'
                                : 'border-gray-300 dark:border-gray-600'
                            }`}
                          >
                            {isSelected ? '✓' : ''}
                          </span>
                        )}
                        {option.label}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
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

Select.displayName = 'Select';

export default Select;
