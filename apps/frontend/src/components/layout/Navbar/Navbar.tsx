'use client';

import React, { forwardRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export interface NavbarItem {
  label: string;
  href: string;
  active?: boolean;
}

export interface NavbarProps {
  logo?: React.ReactNode;
  logoHref?: string;
  items?: NavbarItem[];
  onMenuToggle?: () => void;
  rightContent?: React.ReactNode;
  sticky?: boolean;
  variant?: 'light' | 'dark';
  className?: string;
}

const Navbar = forwardRef<HTMLDivElement, NavbarProps>(
  ({
    logo,
    logoHref = '/',
    items = [],
    onMenuToggle,
    rightContent,
    sticky = true,
    variant = 'dark',
    className,
  }, ref) => {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleMenuToggle = useCallback(() => {
      setIsMobileMenuOpen((prev) => !prev);
      onMenuToggle?.();
    }, [onMenuToggle]);

    const isItemActive = (href: string): boolean => {
      return pathname === href;
    };

    // The `variant` prop picks the navbar's own palette; the dark: variants let
    // it follow the app-wide theme as every other component does.
    const bgColor = {
      light: 'bg-white border-b border-gray-200 dark:bg-gray-900 dark:border-gray-800',
      dark: 'bg-gray-900 border-b border-gray-800 dark:bg-gray-900 dark:border-gray-800',
    }[variant];

    const textColor = {
      light: 'text-gray-900',
      dark: 'text-white',
    }[variant];

    const hoverColor = {
      light: 'hover:bg-gray-50',
      dark: 'hover:bg-gray-800',
    }[variant];

    return (
      <div
        ref={ref}
        className={cn(
          'w-full h-16 flex items-center justify-between px-4 md:px-6 lg:px-8',
          sticky && 'sticky top-0 z-50',
          bgColor,
          className
        )}
        role="banner"
      >
        {/* Left section: Logo */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {logo ? (
            <Link
              href={logoHref}
              className={cn(
                'flex items-center gap-2 font-bold text-lg max-w-xs',
                textColor,
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 rounded px-2 py-1'
              )}
            >
              {logo}
            </Link>
          ) : (
            <Link
              href={logoHref}
              className={cn(
                'text-lg font-bold max-w-xs',
                textColor,
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 rounded px-2 py-1'
              )}
            >
              Oakami
            </Link>
          )}
        </div>

        {/* Center section: Navigation (hidden on mobile) */}
        <nav
          className="hidden md:flex items-center gap-6 flex-1 mx-8"
          aria-label="Main navigation"
        >
          {items.map((item) => {
            const isActive = isItemActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'text-sm font-medium transition-colors px-2 py-1',
                  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 rounded',
                  textColor,
                  hoverColor,
                  isActive && 'border-b-2 border-sky-500'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right section: Actions */}
        <div className="flex items-center gap-4 flex-shrink-0">
          {/* Desktop right content */}
          <div className="hidden md:flex items-center gap-4">
            {rightContent}
          </div>

          {/* Mobile menu toggle button */}
          <button
            onClick={handleMenuToggle}
            className={cn(
              'md:hidden p-2 rounded-lg transition-colors',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500',
              hoverColor
            )}
            aria-label="Toggle navigation menu"
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-nav"
          >
            <svg
              className={cn('w-6 h-6', textColor)}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu (shown below navbar) */}
        {isMobileMenuOpen && (
          <div
            id="mobile-nav"
            className={cn(
              'absolute top-16 left-0 right-0 md:hidden flex flex-col gap-2 p-4',
              bgColor
            )}
            role="navigation"
          >
            {items.map((item) => {
              const isActive = isItemActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500',
                    textColor,
                    hoverColor,
                    isActive && 'bg-gray-100 dark:bg-gray-800 border-l-4 border-sky-500'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
            {/* Mobile right content */}
            {rightContent && (
              <div className="border-t border-gray-200 dark:border-gray-800 mt-4 pt-4">
                {rightContent}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);

Navbar.displayName = 'Navbar';

export { Navbar };
