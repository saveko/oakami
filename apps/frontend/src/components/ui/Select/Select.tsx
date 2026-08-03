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
    const elementId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
    const helpId = `${elementId}-help`;
    const errorId = `${elementId}-error`;

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
            break;

          case 'Tab':
            setIsOpen(false);
            break;

          default:
            break;
        }
      },
      [isOpen, filteredOptions, highlightedIndex, handleSelect]
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
            htmlFor={elementId}
            className="block text-sm font-medium text-gray-700 mb-2"
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
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-labelledby={label ? `${elementId}-label` : undefined}
          aria-label={ariaLabel}
        >
          <button
            id={elementId}
            type="button"
            onClick={handleToggle}
            disabled={disabled || isLoading}
            aria-required={required}
            aria-invalid={error}
            aria-describedby={descriptionIds || undefined}
            aria-busy={isLoading}
            className={`
              w-full px-3 py-2 text-left border rounded-lg
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
                    ? 'text-gray-500'
                    : 'text-gray-900'
                }
              >
                {isLoading ? '⏳ Loading...' : getSelectedLabel()}
              </span>
              <div className="flex items-center gap-1 ml-2">
                {clearable && selectedValue !== '' && !(isValueArray && selectedValue.length === 0) && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="p-1 hover:bg-gray-100 rounded transition"
                    aria-label="Clear selection"
                  >
                    ✕
                  </button>
                )}
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
              </div>
            </div>
          </button>

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

              <div
                ref={optionsRef}
                className="max-h-60 overflow-y-auto"
                role="listbox"
                aria-label={ariaLabel}
              >
                {filteredOptions.length === 0 ? (
                  <div className="px-3 py-2 text-center text-gray-500 text-sm">
                    No options found
                  </div>
                ) : (
                  filteredOptions.map((option, index) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleSelect(option)}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      onKeyDown={handleKeyDown}
                      disabled={option.disabled}
                      data-highlighted={index === highlightedIndex}
                      role="option"
                      aria-selected={
                        isMulti && isValueArray
                          ? selectedValue.includes(option.value)
                          : option.value === selectedValue
                      }
                      aria-disabled={option.disabled}
                      className={`
                        w-full px-3 py-2 text-left text-sm transition
                        disabled:opacity-50 disabled:cursor-not-allowed
                        focus:outline-none
                        ${
                          index === highlightedIndex
                            ? 'bg-sky-50'
                            : 'hover:bg-gray-50'
                        }
                        ${
                          isMulti && isValueArray
                            ? selectedValue.includes(option.value)
                              ? 'bg-sky-100 font-medium'
                              : ''
                            : option.value === selectedValue
                            ? 'bg-sky-100 font-medium'
                            : ''
                        }
                      `}
                    >
                      <div className="flex items-center gap-2">
                        {isMulti && (
                          <input
                            type="checkbox"
                            checked={
                              isValueArray && selectedValue.includes(option.value)
                            }
                            onChange={() => handleSelect(option)}
                            className="w-4 h-4 text-sky-600 rounded"
                            aria-hidden="true"
                          />
                        )}
                        {option.label}
                      </div>
                    </button>
                  ))
                )}
              </div>
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
