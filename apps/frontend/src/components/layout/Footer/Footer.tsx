'use client';

import React, { forwardRef } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterSection {
  title: string;
  links: FooterLink[];
}

export interface FooterSocialLink {
  icon: React.ReactNode;
  href: string;
  label: string;
}

export interface FooterProps {
  sections?: FooterSection[];
  copyright?: string;
  socialLinks?: FooterSocialLink[];
  variant?: 'minimal' | 'standard' | 'expanded';
  className?: string;
}

const Footer = forwardRef<HTMLDivElement, FooterProps>(
  ({
    sections,
    copyright = '© 2026 Oakami. All rights reserved.',
    socialLinks,
    variant = 'standard',
    className,
  }, ref) => {
    const bgColor = {
      minimal: 'bg-gray-50 dark:bg-gray-800',
      standard: 'bg-gray-50 dark:bg-gray-800',
      expanded: 'bg-white dark:bg-gray-900',
    }[variant];

    return (
      <footer
        ref={ref}
        className={cn(
          'w-full border-t border-gray-200 dark:border-gray-800',
          bgColor,
          'px-4 py-12 md:px-8 md:py-16 lg:px-12 lg:py-24',
          className
        )}
      >
        <div className="max-w-7xl mx-auto">
          {/* Sections */}
          {sections && sections.length > 0 && (
            <div
              className={cn(
                'grid gap-8 md:gap-12 mb-8 md:mb-12',
                variant === 'minimal' && 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
                variant === 'standard' &&
                  'grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
                variant === 'expanded' &&
                  'grid-cols-2 md:grid-cols-3 lg:grid-cols-6'
              )}
            >
              {sections.map((section, idx) => (
                <div key={idx}>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">
                    {section.title}
                  </h3>
                  <ul className="space-y-2">
                    {section.links.map((link, linkIdx) => (
                      <li key={linkIdx}>
                        <Link
                          href={link.href}
                          className={cn(
                            'text-sm text-gray-600 dark:text-gray-400',
                            'hover:text-gray-900 dark:hover:text-white',
                            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 rounded px-1',
                            'transition-colors'
                          )}
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {/* Bottom section: Copyright & Social */}
          <div
            className={cn(
              'flex flex-col md:flex-row md:items-center md:justify-between gap-6',
              // An empty array is truthy, so `sections || socialLinks` drew a
              // separator above the copyright even with nothing to separate.
              (sections?.length || socialLinks?.length) &&
                'border-t border-gray-200 dark:border-gray-700 pt-6 md:pt-8'
            )}
          >
            {/* Copyright */}
            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-500">
              {copyright}
            </p>

            {/* Social Links */}
            {socialLinks && socialLinks.length > 0 && (
              <div className="flex items-center gap-4">
                {socialLinks.map((social, idx) => (
                  <a
                    key={idx}
                    href={social.href}
                    aria-label={social.label}
                    className={cn(
                      'text-gray-600 dark:text-gray-400',
                      'hover:text-gray-900 dark:hover:text-white',
                      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 rounded p-1',
                      'transition-colors w-6 h-6 flex items-center justify-center'
                    )}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </footer>
    );
  }
);

Footer.displayName = 'Footer';

export { Footer };
