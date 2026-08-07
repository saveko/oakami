'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showJumpTo?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showPageInfo?: boolean;
  className?: string;
}

export const Pagination = React.forwardRef<HTMLDivElement, PaginationProps>(
  (
    {
      currentPage,
      totalPages,
      onPageChange,
      showJumpTo = false,
      size = 'md',
      showPageInfo = true,
      className,
    },
    ref
  ) => {
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    const halfVisible = Math.floor(maxVisible / 2);

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      // Show pages around current page
      const startPage = Math.max(2, currentPage - halfVisible);
      const endPage = Math.min(totalPages - 1, currentPage + halfVisible);

      if (startPage > 2) {
        pages.push('...');
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (endPage < totalPages - 1) {
        pages.push('...');
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  const pages = getPageNumbers();

  const [jumpToValue, setJumpToValue] = React.useState('');

  const submitJumpTo = () => {
    const page = parseInt(jumpToValue, 10);
    if (page > 0 && page <= totalPages) {
      onPageChange(page);
      setJumpToValue('');
    }
  };

  const buttonSize = {
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-base',
    lg: 'h-12 w-12 text-lg',
  };

  // Sizing, focus and disabled behaviour are shared by every button. The
  // current-page button only overrides colours — it must not replace this base,
  // or it loses its touch target and focus ring.
  const baseButtonClasses = cn(
    'inline-flex items-center justify-center rounded border transition-colors',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500',
    'disabled:cursor-not-allowed disabled:opacity-50',
    buttonSize[size]
  );

  const buttonClasses = cn(
    baseButtonClasses,
    'border-gray-300 bg-white text-gray-900 hover:bg-gray-50 disabled:hover:bg-white',
    'dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700 dark:disabled:hover:bg-gray-800'
  );

  const currentPageButtonClasses = cn(
    baseButtonClasses,
    'border-sky-600 bg-sky-600 text-white hover:bg-sky-700',
    'dark:border-sky-500 dark:bg-sky-600 dark:text-white dark:hover:bg-sky-700'
  );

  return (
    <div ref={ref} className={cn('flex items-center gap-2', className)} role="navigation" aria-label="Pagination">
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className={buttonClasses}
        aria-label="Previous page"
      >
        {'←'} <span className="ml-1 hidden sm:inline">Prev</span>
      </button>

      {/* Page Numbers */}
      <div className="flex gap-1">
        {pages.map((page, idx) => {
          if (page === '...') {
            return (
              <span
                key={`ellipsis-${idx}`}
                className={cn(
                  'flex items-center justify-center text-gray-600 dark:text-gray-400',
                  buttonSize[size]
                )}
              >
                ⋯
              </span>
            );
          }

          const pageNum = page as number;
          const isCurrent = pageNum === currentPage;

          return (
            <button
              key={pageNum}
              type="button"
              onClick={() => onPageChange(pageNum)}
              className={isCurrent ? currentPageButtonClasses : buttonClasses}
              aria-label={`Go to page ${pageNum}`}
              aria-current={isCurrent ? 'page' : undefined}
            >
              {pageNum}
            </button>
          );
        })}
      </div>

      {/* Next Button */}
      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className={buttonClasses}
        aria-label="Next page"
      >
        <span className="hidden sm:inline">Next</span> {'→'}
      </button>

      {/* Page Info */}
      {showPageInfo && (
        <div className="ml-4 text-sm text-gray-600 dark:text-gray-400">
          {/* One text node, not `Page <span>1</span> of <span>10</span>`: the
              inner spans matched text queries intended for the page buttons. */}
          <span className="font-medium">{`Page ${currentPage} of ${totalPages}`}</span>
        </div>
      )}

      {/* Jump to Page Input */}
      {showJumpTo && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submitJumpTo();
          }}
          className="ml-4 flex items-center gap-2"
        >
          <label htmlFor="jumpToPage" className="text-sm text-gray-600 dark:text-gray-400">
            Go to:
          </label>
          <input
            id="jumpToPage"
            name="jumpToPage"
            type="number"
            min="1"
            max={totalPages}
            placeholder="Page #"
            value={jumpToValue}
            onChange={(e) => setJumpToValue(e.target.value)}
            // Browsers submit a single-input form on Enter implicitly; jsdom
            // does not, and relying on it would make the control untestable.
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                submitJumpTo();
              }
            }}
            className={cn(
              'w-16 rounded border border-gray-300 bg-white px-2 py-1 text-sm text-gray-900',
              'focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2',
              'dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:focus:ring-offset-gray-900'
            )}
            aria-label="Jump to page number"
          />
        </form>
      )}
    </div>
  );
});

Pagination.displayName = 'Pagination';
