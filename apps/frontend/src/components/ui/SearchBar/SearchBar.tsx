'use client';

import React, { useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Input } from '../Input';

export interface SearchBarProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'type'> {
  suggestions?: string[];
  onSearch?: (query: string) => void;
  onChange?: (value: string) => void;
  isLoading?: boolean;
  clearable?: boolean;
  debounceMs?: number;
  minChars?: number;
  maxSuggestions?: number;
  variant?: 'default' | 'inline';
  onSuggestionSelect?: (suggestion: string) => void;
}

export const SearchBar = React.forwardRef<HTMLInputElement, SearchBarProps>(
  (
    {
      value: propValue = '',
      suggestions = [],
      onSearch,
      onChange,
      isLoading = false,
      clearable = true,
      debounceMs = 300,
      minChars = 1,
      maxSuggestions = 8,
      variant = 'default',
      onSuggestionSelect,
      className,
      ...props
    },
    ref
  ) => {
    const [value, setValue] = React.useState<string>(String(propValue));
    const [showSuggestions, setShowSuggestions] = React.useState(false);
    const [selectedIndex, setSelectedIndex] = React.useState(-1);
    const [debounceTimer, setDebounceTimer] = React.useState<NodeJS.Timeout | null>(null);

    // Filter and limit suggestions
    const filteredSuggestions = useMemo(() => {
      if (value.length < minChars) return [];
      return suggestions
        .filter((s) => s.toLowerCase().includes(value.toLowerCase()))
        .slice(0, maxSuggestions);
    }, [value, suggestions, minChars, maxSuggestions]);

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setValue(newValue);
        onChange?.(newValue);
        setSelectedIndex(-1);

        // Clear existing timer
        if (debounceTimer) clearTimeout(debounceTimer);

        // Set new debounce timer
        if (newValue.length >= minChars) {
          setShowSuggestions(true);
          const timer = setTimeout(() => {
            onSearch?.(newValue);
          }, debounceMs);
          setDebounceTimer(timer);
        } else {
          setShowSuggestions(false);
        }
      },
      [onChange, onSearch, debounceMs, minChars, debounceTimer]
    );

    const handleClear = useCallback(() => {
      setValue('');
      onChange?.('');
      onSearch?.('');
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }, [onChange, onSearch]);

    const handleSuggestionClick = useCallback(
      (suggestion: string) => {
        setValue(suggestion);
        onChange?.(suggestion);
        onSearch?.(suggestion);
        onSuggestionSelect?.(suggestion);
        setShowSuggestions(false);
        setSelectedIndex(-1);
      },
      [onChange, onSearch, onSuggestionSelect]
    );

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!showSuggestions || filteredSuggestions.length === 0) {
        if (e.key === 'Escape') {
          setShowSuggestions(false);
        }
        return;
      }

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < filteredSuggestions.length - 1 ? prev + 1 : prev
          );
          break;

        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
          break;

        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0) {
            handleSuggestionClick(filteredSuggestions[selectedIndex]);
          } else {
            onSearch?.(value);
            setShowSuggestions(false);
          }
          break;

        case 'Escape':
          e.preventDefault();
          setShowSuggestions(false);
          setSelectedIndex(-1);
          break;

        default:
          break;
      }
    };

    React.useEffect(() => {
      // Sync external value changes
      if (propValue !== undefined && String(propValue) !== value) {
        setValue(String(propValue));
      }
    }, [propValue]);

    React.useEffect(() => {
      return () => {
        if (debounceTimer) clearTimeout(debounceTimer);
      };
    }, [debounceTimer]);

    const containerClasses = {
      default: 'relative w-full',
      inline: 'inline-flex relative',
    }[variant];

    return (
      <div className={cn(containerClasses, className)}>
        <div className="relative w-full">
          <Input
            ref={ref}
            type="search"
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (value.length >= minChars && filteredSuggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
            onBlur={() => {
              // Delay hiding to allow suggestion click
              setTimeout(() => setShowSuggestions(false), 200);
            }}
            placeholder={props.placeholder || 'Search...'}
            aria-autocomplete="list"
            aria-controls={showSuggestions ? 'search-suggestions' : undefined}
            aria-expanded={showSuggestions}
            aria-haspopup="listbox"
            {...props}
          />

          {isLoading && (
            <div
              className="absolute right-10 top-1/2 -translate-y-1/2"
              aria-hidden="true"
            >
              <div className="w-4 h-4 border-2 border-gray-200 border-t-sky-500 rounded-full animate-spin dark:border-gray-700 dark:border-t-sky-400" />
            </div>
          )}

          {clearable && value && !isLoading && (
            <button
              onClick={handleClear}
              className={cn(
                'absolute right-2 top-1/2 -translate-y-1/2',
                'p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500',
                'transition-colors'
              )}
              aria-label="Clear search"
              type="button"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 4L4 12M4 4l8 8" />
              </svg>
            </button>
          )}
        </div>

        {showSuggestions && filteredSuggestions.length > 0 && (
          <div
            id="search-suggestions"
            className={cn(
              'absolute top-full left-0 right-0 mt-1 z-50',
              'bg-white dark:bg-gray-800',
              'border border-gray-200 dark:border-gray-700',
              'rounded-md shadow-lg',
              'max-h-64 overflow-y-auto'
            )}
            role="listbox"
          >
            {filteredSuggestions.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => handleSuggestionClick(suggestion)}
                className={cn(
                  'w-full text-left px-4 py-2',
                  'text-sm text-gray-900 dark:text-gray-100',
                  'hover:bg-gray-100 dark:hover:bg-gray-700',
                  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500',
                  'transition-colors',
                  selectedIndex === idx && 'bg-gray-100 dark:bg-gray-700'
                )}
                role="option"
                aria-selected={selectedIndex === idx}
                type="button"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }
);

SearchBar.displayName = 'SearchBar';
