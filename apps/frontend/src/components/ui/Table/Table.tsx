'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';

export interface Column<T> {
  id: string;
  label: string;
  sortable?: boolean;
  width?: string;
  render?: (value: any, row: T) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  isLoading?: boolean;
  error?: string;
  onSort?: (columnId: string, direction: 'asc' | 'desc') => void;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  rowsPerPage?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  onRowSelect?: (selectedIds: string[]) => void;
  selectedRows?: string[];
  emptyState?: React.ReactNode;
  className?: string;
}

export const Table = React.forwardRef<HTMLTableElement, TableProps<any>>(
  (
    {
      columns,
      data,
      keyExtractor,
      isLoading = false,
      error,
      onSort,
      sortBy,
      sortDirection = 'asc',
      rowsPerPage = 20,
      currentPage = 1,
      onRowSelect,
      selectedRows = [],
      emptyState,
      className,
    },
    ref
  ) => {
    const [internalSortBy, setInternalSortBy] = useState<string | undefined>(sortBy);
    const [internalSortDirection, setInternalSortDirection] = useState<'asc' | 'desc'>(sortDirection);

    const isControlled = sortBy !== undefined && onSort !== undefined;

    const handleSort = (columnId: string) => {
      const column = columns.find((c) => c.id === columnId);
      if (!column?.sortable) return;

      if (isControlled) {
        const newDirection = sortBy === columnId && sortDirection === 'asc' ? 'desc' : 'asc';
        onSort(columnId, newDirection);
      } else {
        const newDirection = internalSortBy === columnId && internalSortDirection === 'asc' ? 'desc' : 'asc';
        setInternalSortBy(columnId);
        setInternalSortDirection(newDirection);
      }
    };

    const currentSortBy = isControlled ? sortBy : internalSortBy;
    const currentSortDirection = isControlled ? sortDirection : internalSortDirection;

    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedData = data.slice(startIndex, endIndex);

    const handleSelectRow = (rowId: string) => {
      if (!onRowSelect) return;
      const newSelectedRows = selectedRows.includes(rowId)
        ? selectedRows.filter((id) => id !== rowId)
        : [...selectedRows, rowId];
      onRowSelect(newSelectedRows);
    };

    const handleSelectAll = () => {
      if (!onRowSelect) return;
      if (selectedRows.length === paginatedData.length && paginatedData.length > 0) {
        onRowSelect([]);
      } else {
        onRowSelect(paginatedData.map((row) => keyExtractor(row)));
      }
    };

    const isAllSelected = paginatedData.length > 0 && selectedRows.length === paginatedData.length;
    const isSomeSelected = selectedRows.length > 0 && selectedRows.length < paginatedData.length;

    if (error) {
      return (
        <div className={cn('rounded-lg border border-red-200 bg-red-50 p-4', className)} role="alert">
          <p className="text-sm font-medium text-red-900">{error}</p>
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className={cn('overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700', className)}>
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900 py-3 dark:text-gray-400">
                {onRowSelect && <th className="w-12 px-4 py-3"></th>}
                {columns.map((col) => (
                  <th key={col.id} className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx} className="border-b border-gray-100 dark:border-gray-800">
                  {onRowSelect && (
                    <td className="w-12 px-4 py-3">
                      <div className="h-5 w-5 animate-pulse rounded bg-gray-300 dark:bg-gray-600"></div>
                    </td>
                  )}
                  {columns.map((col) => (
                    <td key={col.id} className="px-4 py-3">
                      <div className="h-4 w-3/4 animate-pulse rounded bg-gray-300 dark:bg-gray-600"></div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    if (data.length === 0) {
      return (
        <div className={cn('rounded-lg border border-gray-200 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-800', className)}>
          {emptyState || (
            <p className="text-sm text-gray-500 dark:text-gray-400">No data available</p>
          )}
        </div>
      );
    }

    return (
      <div className={cn('overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700', className)}>
        <table ref={ref} className="w-full" role="grid" aria-label="Data table">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900 py-3">
              {onRowSelect && (
                <th scope="col" className="w-12 px-4 py-3">
                  <label className="flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={handleSelectAll}
                      className="h-5 w-5 rounded border-gray-300 text-sky-600 focus:ring-2 focus:ring-sky-500 dark:border-gray-600 dark:bg-gray-700"
                      aria-label="Select all rows"
                      ref={(el) => {
                        if (el) el.indeterminate = isSomeSelected;
                      }}
                    />
                  </label>
                </th>
              )}
              {columns.map((col) => {
                const isSorted = currentSortBy === col.id;
                const isAscending = isSorted && currentSortDirection === 'asc';

                return (
                  <th
                    key={col.id}
                    scope="col"
                    className={cn(
                      'px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400',
                      col.width && `w-[${col.width}]`,
                      col.align === 'center' && 'text-center',
                      col.align === 'right' && 'text-right',
                      col.sortable && 'cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500'
                    )}
                    aria-sort={
                      col.sortable
                        ? isSorted
                          ? isAscending
                            ? 'ascending'
                            : 'descending'
                          : 'none'
                        : undefined
                    }
                    onClick={() => col.sortable && handleSort(col.id)}
                  >
                    <div className="flex items-center gap-2">
                      {col.label}
                      {col.sortable && isSorted && (
                        <span className="flex-shrink-0 text-sky-600 dark:text-sky-400" aria-hidden="true">
                          {isAscending ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row) => {
              const rowId = keyExtractor(row);
              const isSelected = selectedRows.includes(rowId);

              return (
                <tr
                  key={rowId}
                  className={cn(
                    'border-b border-gray-100 dark:border-gray-800',
                    isSelected && 'bg-sky-50 dark:bg-sky-900/20'
                  )}
                >
                  {onRowSelect && (
                    <td className="w-12 px-4 py-3">
                      <label className="flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectRow(rowId)}
                          className="h-5 w-5 rounded border-gray-300 text-sky-600 focus:ring-2 focus:ring-sky-500 dark:border-gray-600 dark:bg-gray-700"
                          aria-label={`Select row ${rowId}`}
                        />
                      </label>
                    </td>
                  )}
                  {columns.map((col) => (
                    <td
                      key={`${rowId}-${col.id}`}
                      className={cn(
                        'px-4 py-3 text-sm text-gray-900 dark:text-gray-100',
                        col.align === 'center' && 'text-center',
                        col.align === 'right' && 'text-right'
                      )}
                    >
                      {col.render ? col.render(row[col.id as keyof typeof row], row) : row[col.id as keyof typeof row]}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }
);

Table.displayName = 'Table';
