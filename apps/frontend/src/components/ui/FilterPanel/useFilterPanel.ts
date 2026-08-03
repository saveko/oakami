'use client';

import { useCallback, useMemo, useState } from 'react';

export type FilterType = 'select' | 'checkbox' | 'date-range' | 'number-range';

export interface FilterOption {
  value: string | number;
  label: string;
}

export interface Filter {
  id: string;
  label: string;
  type: FilterType;
  section?: string;
  value?: string | string[] | { from?: number; to?: number } | { start?: string; end?: string };
  options?: FilterOption[];
  placeholder?: string;
  disabled?: boolean;
}

export interface FilterState {
  [filterId: string]: any;
}

export interface UseFilterPanelReturn {
  filters: FilterState;
  setFilter: (filterId: string, value: any) => void;
  clearFilter: (filterId: string) => void;
  clearAll: () => void;
  hasActiveFilters: boolean;
  getActiveFilterCount: () => number;
  reset: () => void;
}

export function useFilterPanel(initialFilters?: FilterState): UseFilterPanelReturn {
  const [filters, setFilters] = useState<FilterState>(initialFilters || {});

  const setFilter = useCallback((filterId: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [filterId]: value,
    }));
  }, []);

  const clearFilter = useCallback((filterId: string) => {
    setFilters((prev) => {
      const updated = { ...prev };
      delete updated[filterId];
      return updated;
    });
  }, []);

  const clearAll = useCallback(() => {
    setFilters({});
  }, []);

  const reset = useCallback(() => {
    setFilters(initialFilters || {});
  }, [initialFilters]);

  const hasActiveFilters = useMemo(() => {
    return Object.keys(filters).length > 0;
  }, [filters]);

  const getActiveFilterCount = useCallback(() => {
    return Object.keys(filters).length;
  }, [filters]);

  return {
    filters,
    setFilter,
    clearFilter,
    clearAll,
    hasActiveFilters,
    getActiveFilterCount,
    reset,
  };
}
