'use client';

import React, { forwardRef, useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';

export interface DrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  side?: 'left' | 'right';
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  closeOnBackdropClick?: boolean;
  overlay?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Drawer = forwardRef<HTMLDivElement, DrawerProps>(
  ({
    open,
    onOpenChange,
    side = 'right',
    title,
    description,
    children,
    footer,
    closeOnBackdropClick = true,
    overlay = true,
    size = 'md',
    className,
  }, ref) => {
    const drawerRef = useRef<HTMLDivElement>(null);
    const titleId = useRef(`drawer-title-${Math.random().toString(36).substr(2, 9)}`);
    const descriptionId = useRef(`drawer-description-${Math.random().toString(36).substr(2, 9)}`);

    // Handle ESC key
    useEffect(() => {
      if (!open) return;

      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onOpenChange(false);
        }
      };

      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }, [open, onOpenChange]);

    // Handle backdrop click
    const handleBackdropClick = useCallback(() => {
      if (closeOnBackdropClick) {
        onOpenChange(false);
      }
    }, [closeOnBackdropClick, onOpenChange]);

    // Prevent closing when clicking inside drawer
    const handleDrawerClick = (e: React.MouseEvent) => {
      e.stopPropagation();
    };

    const sizeStyles = {
      sm: 'w-80',
      md: 'w-96',
      lg: 'w-screen max-w-2xl',
    };

    const sideStyles = {
      left: {
        transform: open ? 'translateX(0)' : '-translateX(100%)',
        left: 0,
      },
      right: {
        transform: open ? 'translateX(0)' : 'translateX(100%)',
        right: 0,
      },
    };

    return (
      <>
        {/* Overlay Backdrop */}
        {overlay && open && (
          <div
            className={cn(
              'fixed inset-0 bg-black/50 z-40 transition-opacity duration-250',
              open ? 'opacity-100' : 'opacity-0'
            )}
            onClick={handleBackdropClick}
            aria-hidden="true"
          />
        )}

        {/* Drawer */}
        <div
          ref={ref || drawerRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? titleId.current : undefined}
          aria-describedby={description ? descriptionId.current : undefined}
          className={cn(
            'fixed top-0 h-screen bg-white dark:bg-gray-900 shadow-lg z-50',
            'transition-transform duration-250 ease-out',
            'flex flex-col',
            sizeStyles[size],
            className
          )}
          style={sideStyles[side]}
          onClick={handleDrawerClick}
        >
          {/* Header */}
          {(title || closeOnBackdropClick) && (
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
              <div className="flex-1">
                {title && (
                  <h2
                    id={titleId.current}
                    className="text-lg font-semibold text-gray-900 dark:text-white"
                  >
                    {title}
                  </h2>
                )}
                {description && (
                  <p
                    id={descriptionId.current}
                    className="text-sm text-gray-600 dark:text-gray-400 mt-1"
                  >
                    {description}
                  </p>
                )}
              </div>

              {/* Close button */}
              <button
                onClick={() => onOpenChange(false)}
                className={cn(
                  'p-2 rounded-lg transition-colors flex-shrink-0 ml-4',
                  'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
                  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500'
                )}
                aria-label="Close drawer"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-4 py-6">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="border-t border-gray-200 dark:border-gray-800 px-4 py-4 flex-shrink-0">
              {footer}
            </div>
          )}
        </div>
      </>
    );
  }
);

Drawer.displayName = 'Drawer';

export { Drawer };
