'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '../Button';
import { Select } from '../Select';
import { Checkbox } from '../Checkbox';
import { Input } from '../Input';
import { Card } from '../Card';
import type { Filter, FilterState } from './useFilterPanel';

export interface FilterPanelProps {
  filters: Filter[];
  values: FilterState;
  onFilterChange: (filterId: string, value: any) => void;
  onApply?: (filters: FilterState) => void;
  onReset?: (filters: FilterState) => void;
  onClearAll?: () => void;
  variant?: 'default' | 'compact';
  showHeader?: boolean;
  collapsible?: boolean;
  activeFilterCount?: number;
  className?: string;
}

const FilterInput: React.FC<{
  filter: Filter;
  value: any;
  onChange: (value: any) => void;
}> = ({ filter, value, onChange }) => {
  switch (filter.type) {
    case 'select':
      return (
        <Select
          options={(filter.options || []).map((opt) => ({
            value: String(opt.value),
            label: opt.label,
          }))}
          value={value ? String(value) : undefined}
          onChange={onChange}
          placeholder={filter.placeholder}
          disabled={filter.disabled}
          label={filter.label}
        />
      );

    case 'checkbox':
      const selectedValues = Array.isArray(value) ? value : [];
      return (
        <div className="space-y-2">
          {filter.options?.map((option) => (
            <Checkbox
              key={option.value}
              id={`filter-${filter.id}-${option.value}`}
              label={option.label}
              checked={selectedValues.includes(option.value)}
              onChange={(checked) => {
                const updated = checked
                  ? [...selectedValues, option.value]
                  : selectedValues.filter((v) => v !== option.value);
                onChange(updated);
              }}
              disabled={filter.disabled}
            />
          ))}
        </div>
      );

    case 'date-range':
      const dateValue = value || { start: '', end: '' };
      return (
        <div className="space-y-3">
          <Input
            type="date"
            value={dateValue.start || ''}
            onChange={(e) =>
              onChange({
                ...dateValue,
                start: e.target.value,
              })
            }
            placeholder="Start date"
            disabled={filter.disabled}
            label="From"
          />
          <Input
            type="date"
            value={dateValue.end || ''}
            onChange={(e) =>
              onChange({
                ...dateValue,
                end: e.target.value,
              })
            }
            placeholder="End date"
            disabled={filter.disabled}
            label="To"
          />
        </div>
      );

    case 'number-range':
      const numValue = value || { from: '', to: '' };
      return (
        <div className="space-y-3">
          <Input
            type="number"
            value={numValue.from || ''}
            onChange={(e) =>
              onChange({
                ...numValue,
                from: e.target.value ? Number(e.target.value) : '',
              })
            }
            placeholder="Min"
            disabled={filter.disabled}
            label="From"
          />
          <Input
            type="number"
            value={numValue.to || ''}
            onChange={(e) =>
              onChange({
                ...numValue,
                to: e.target.value ? Number(e.target.value) : '',
              })
            }
            placeholder="Max"
            disabled={filter.disabled}
            label="To"
          />
        </div>
      );

    default:
      return null;
  }
};

export const FilterPanel = React.forwardRef<HTMLDivElement, FilterPanelProps>(
  (
    {
      filters,
      values,
      onFilterChange,
      onApply,
      onReset,
      onClearAll,
      variant = 'default',
      showHeader = true,
      collapsible = true,
      activeFilterCount = 0,
      className,
    },
    ref
  ) => {
    const [expandedSections, setExpandedSections] = useState<Set<string>>(
      new Set(filters.map((f) => f.section || 'default'))
    );

    const toggleSection = (section: string) => {
      const updated = new Set(expandedSections);
      if (updated.has(section)) {
        updated.delete(section);
      } else {
        updated.add(section);
      }
      setExpandedSections(updated);
    };

    const groupedFilters = filters.reduce(
      (acc, filter) => {
        const section = filter.section || 'default';
        if (!acc[section]) {
          acc[section] = [];
        }
        acc[section].push(filter);
        return acc;
      },
      {} as Record<string, Filter[]>
    );

    const isCompact = variant === 'compact';
    const hasActiveFilters = activeFilterCount > 0;

    return (
      <Card ref={ref} variant="outlined" padding="md" className={cn('w-full', className)}>
        {showHeader && (
          <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Filters</h3>
              {hasActiveFilters && (
                <span
                  className="inline-flex items-center justify-center w-5 h-5 text-xs font-semibold text-white bg-sky-600 rounded-full"
                  aria-label={`${activeFilterCount} active filter${activeFilterCount !== 1 ? 's' : ''}`}
                >
                  {activeFilterCount}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Filter Sections */}
        <div className="space-y-4">
          {Object.entries(groupedFilters).map(([section, sectionFilters]) => {
            const isExpanded = expandedSections.has(section);

            return (
              <div key={section} className="space-y-2">
                {collapsible && sectionFilters.length > 0 && (
                  <button
                    onClick={() => toggleSection(section)}
                    className={cn(
                      'w-full flex items-center justify-between px-3 py-2 rounded-md',
                      'text-sm font-medium text-gray-900 dark:text-gray-100',
                      'hover:bg-gray-100 dark:hover:bg-gray-800',
                      'transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500'
                    )}
                    aria-expanded={isExpanded}
                    aria-controls={`filter-section-${section}`}
                  >
                    <span className="capitalize">{section === 'default' ? 'Filters' : section}</span>
                    <svg
                      className={cn('w-4 h-4 transition-transform', isExpanded && 'rotate-180')}
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
                  </button>
                )}

                {isExpanded && (
                  <div
                    id={`filter-section-${section}`}
                    className={cn('space-y-3', !collapsible && 'pt-2')}
                    role="group"
                    aria-labelledby={`filter-section-${section}-label`}
                  >
                    {sectionFilters.map((filter) => (
                      <div key={filter.id} className="space-y-2">
                        {filter.type !== 'checkbox' && filter.label && (
                          <label
                            htmlFor={`filter-${filter.id}`}
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                          >
                            {filter.label}
                          </label>
                        )}
                        <FilterInput
                          filter={filter}
                          value={values[filter.id]}
                          onChange={(value) => onFilterChange(filter.id, value)}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className={cn('mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2', isCompact && 'space-y-1')}>
          <Button
            onClick={() => onApply?.(values)}
            variant="primary"
            size="md"
            fullWidth
            className={isCompact ? 'py-2' : ''}
          >
            Apply Filters
          </Button>
          <Button
            onClick={() => onReset?.(values)}
            variant="secondary"
            size="md"
            fullWidth
            className={isCompact ? 'py-2' : ''}
          >
            Reset
          </Button>
          {hasActiveFilters && (
            <Button
              onClick={() => onClearAll?.()}
              variant="ghost"
              size="md"
              fullWidth
              className={cn('text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20', isCompact && 'py-2')}
            >
              Clear All
            </Button>
          )}
        </div>
      </Card>
    );
  }
);

FilterPanel.displayName = 'FilterPanel';
