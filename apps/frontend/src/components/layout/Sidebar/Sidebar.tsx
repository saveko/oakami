'use client';

import React, { forwardRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export interface SidebarItem {
  id: string;
  label: string;
  href?: string;
  icon?: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
  children?: SidebarItem[];
}

export interface SidebarProps {
  items: SidebarItem[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  itemClassName?: string;
}

const Sidebar = forwardRef<HTMLElement, SidebarProps>(
  ({
    items,
    open = true,
    onOpenChange,
    className,
    itemClassName,
  }, ref) => {
    const pathname = usePathname();
    const [expandedItems, setExpandedItems] = useState<string[]>([]);

    const toggleItemExpanded = useCallback((itemId: string) => {
      setExpandedItems((prev) =>
        prev.includes(itemId)
          ? prev.filter((id) => id !== itemId)
          : [...prev, itemId]
      );
    }, []);

    const handleCollapseClick = useCallback(() => {
      if (onOpenChange) {
        onOpenChange(!open);
      }
    }, [open, onOpenChange]);

    const isItemActive = (item: SidebarItem): boolean => {
      if (item.href && pathname === item.href) {
        return true;
      }
      if (item.children) {
        return item.children.some((child) => isItemActive(child));
      }
      return false;
    };

    const renderSidebarItem = (item: SidebarItem, depth = 0) => {
      const isActive = isItemActive(item);
      const hasChildren = item.children && item.children.length > 0;
      const isExpanded = expandedItems.includes(item.id);

      if (!item.href && hasChildren) {
        return (
          <div key={item.id}>
            <button
              onClick={() => toggleItemExpanded(item.id)}
              disabled={item.disabled}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2 mx-1 rounded-md transition-colors text-sm',
                'text-gray-200 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500',
                itemClassName
              )}
              aria-expanded={isExpanded}
            >
              {item.icon && (
                <span className="w-6 h-6 flex-shrink-0" aria-hidden="true">
                  {item.icon}
                </span>
              )}
              <span
                className={cn(
                  'text-left text-sm font-medium truncate',
                  open ? 'flex-1' : 'sr-only'
                )}
              >
                {item.label}
              </span>
              {open && (
                <>
                  <svg
                    className={cn(
                      'w-4 h-4 transition-transform',
                      isExpanded && 'rotate-180'
                    )}
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
                </>
              )}
            </button>
            {open && isExpanded && hasChildren && item.children && (
              <div className="pl-2">
                {item.children.map((child) =>
                  renderSidebarItem(child, depth + 1)
                )}
              </div>
            )}
          </div>
        );
      }

      if (item.href) {
        return (
          <Link
            key={item.id}
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 mx-1 rounded-md transition-colors text-sm truncate',
              'text-gray-200 hover:bg-gray-800',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500',
              'disabled:opacity-50 disabled:pointer-events-none',
              isActive && 'bg-gray-800 border-l-4 border-sky-500 text-white',
              item.disabled && 'opacity-50 pointer-events-none cursor-not-allowed',
              itemClassName
            )}
            aria-current={isActive ? 'page' : undefined}
          >
            {item.icon && (
              <span className="w-6 h-6 flex-shrink-0" aria-hidden="true">
                {item.icon}
              </span>
            )}
            {/* Always rendered: removing the label when collapsed left the
                link with no accessible name at all, since the icon is
                aria-hidden. sr-only keeps it announced but unseen. */}
            <span
              className={cn(
                'text-sm font-medium truncate',
                open ? 'flex-1' : 'sr-only'
              )}
            >
              {item.label}
            </span>
          </Link>
        );
      }

      // Neither a link nor a group: still render the label so the item is not
      // silently dropped from the navigation.
      return (
        <div
          key={item.id}
          className={cn(
            'flex items-center gap-3 px-3 py-2 mx-1 text-sm text-gray-200',
            item.disabled && 'opacity-50',
            itemClassName
          )}
        >
          {item.icon && (
            <span className="w-6 h-6 flex-shrink-0" aria-hidden="true">
              {item.icon}
            </span>
          )}
          <span className={cn('font-medium truncate', open ? 'flex-1' : 'sr-only')}>
            {item.label}
          </span>
        </div>
      );
    };

    return (
      <aside
        ref={ref}
        className={cn(
          'fixed left-0 top-0 h-screen bg-gray-900 text-white transition-all duration-200 flex flex-col',
          'border-r border-gray-800 z-40',
          open ? 'w-64' : 'w-16',
          'dark:bg-gray-900 dark:border-gray-800',
          className
        )}
        aria-label="Navigation"
      >
        {/* Toggle button at top */}
        <div className="flex items-center justify-between px-3 py-4 border-b border-gray-800">
          {open && (
            <span className="text-lg font-bold truncate text-white">
              Oakami
            </span>
          )}
          <button
            onClick={handleCollapseClick}
            className={cn(
              'p-2 rounded-md hover:bg-gray-800 transition-colors',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500',
              !open && 'mx-auto'
            )}
            aria-label={open ? 'Collapse sidebar' : 'Expand sidebar'}
            aria-controls="sidebar-nav"
          >
            <svg
              className={cn(
                'w-6 h-6 transition-transform',
                !open && 'rotate-180'
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        </div>

        {/* Navigation items */}
        <nav
          id="sidebar-nav"
          className="flex-1 overflow-y-auto py-4 px-2"
          role="navigation"
        >
          <ul className="space-y-1">
            {items.map((item) => (
              <li key={item.id}>
                {renderSidebarItem(item)}
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer area */}
        {open && (
          <div className="border-t border-gray-800 px-3 py-4 text-xs text-gray-400">
            <p>© 2026 Oakami</p>
          </div>
        )}
      </aside>
    );
  }
);

Sidebar.displayName = 'Sidebar';

export { Sidebar };
