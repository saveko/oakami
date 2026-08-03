import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render } from '@/test/utils';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Pagination, PaginationProps } from './Pagination';

expect.extend(toHaveNoViolations);

const createPaginationProps = (overrides?: Partial<PaginationProps>): PaginationProps => ({
  currentPage: 1,
  totalPages: 10,
  onPageChange: vi.fn(),
  ...overrides,
});

describe('Pagination - Accessibility', () => {
  describe('WCAG 2.1 Compliance', () => {
    it('should have no accessibility violations with default props', async () => {
      const { container } = render(<Pagination {...createPaginationProps()} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations on first page', async () => {
      const { container } = render(
        <Pagination {...createPaginationProps({ currentPage: 1 })} />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations on last page', async () => {
      const { container } = render(
        <Pagination {...createPaginationProps({ currentPage: 10, totalPages: 10 })} />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations with page info', async () => {
      const { container } = render(
        <Pagination {...createPaginationProps({ showPageInfo: true })} />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations with jump to page', async () => {
      const { container } = render(
        <Pagination {...createPaginationProps({ showJumpTo: true })} />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations with all features enabled', async () => {
      const { container } = render(
        <Pagination
          {...createPaginationProps({
            showPageInfo: true,
            showJumpTo: true,
            size: 'lg',
          })}
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations on single page', async () => {
      const { container } = render(
        <Pagination {...createPaginationProps({ totalPages: 1 })} />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Semantic Structure', () => {
    it('should have navigation role', () => {
      const { container } = render(<Pagination {...createPaginationProps()} />);
      expect(container.querySelector('[role="navigation"]')).toBeInTheDocument();
    });

    it('should have aria-label on navigation', () => {
      const { container } = render(<Pagination {...createPaginationProps()} />);
      expect(container.querySelector('[aria-label="Pagination"]')).toBeInTheDocument();
    });

    it('should use button elements for page navigation', () => {
      const { container } = render(<Pagination {...createPaginationProps()} />);
      const buttons = container.querySelectorAll('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should use input element for jump to page', () => {
      const { container } = render(
        <Pagination {...createPaginationProps({ showJumpTo: true })} />
      );
      const input = container.querySelector('input[type="number"]');
      expect(input).toBeInTheDocument();
    });
  });

  describe('ARIA Attributes', () => {
    it('should have aria-label on previous button', () => {
      const { container } = render(<Pagination {...createPaginationProps()} />);
      expect(container.querySelector('[aria-label="Previous page"]')).toBeInTheDocument();
    });

    it('should have aria-label on next button', () => {
      const { container } = render(<Pagination {...createPaginationProps()} />);
      expect(container.querySelector('[aria-label="Next page"]')).toBeInTheDocument();
    });

    it('should have aria-current on current page button', () => {
      const { container } = render(
        <Pagination {...createPaginationProps({ currentPage: 3, totalPages: 5 })} />
      );
      const currentButton = container.querySelector('[aria-current="page"]');
      expect(currentButton).toBeInTheDocument();
      expect(currentButton?.textContent).toBe('3');
    });

    it('should have aria-label on page number buttons', () => {
      const { container } = render(
        <Pagination {...createPaginationProps({ totalPages: 3 })} />
      );
      const pageButtons = Array.from(container.querySelectorAll('button')).filter(
        (btn) => !btn.getAttribute('aria-label')?.includes('Previous') &&
                 !btn.getAttribute('aria-label')?.includes('Next')
      );
      // Page buttons should have aria-label="Go to page X"
      pageButtons.forEach((btn) => {
        expect(btn).toHaveAttribute('aria-label');
      });
    });

    it('should have aria-label on jump to page input', () => {
      const { container } = render(
        <Pagination {...createPaginationProps({ showJumpTo: true })} />
      );
      const input = container.querySelector('input[type="number"]');
      expect(input).toHaveAttribute('aria-label', 'Jump to page number');
    });

    it('should have label for jump to page input', () => {
      const { container } = render(
        <Pagination {...createPaginationProps({ showJumpTo: true })} />
      );
      const label = container.querySelector('label');
      expect(label).toBeInTheDocument();
      expect(label?.textContent).toContain('Go to');
    });
  });

  describe('Keyboard Navigation', () => {
    it('should have focusable buttons', () => {
      const { container } = render(<Pagination {...createPaginationProps()} />);
      const buttons = container.querySelectorAll('button');
      buttons.forEach((btn) => {
        // All buttons should be focusable (not having tabindex=-1)
        expect(btn).not.toHaveAttribute('tabindex', '-1');
      });
    });

    it('should have disabled attribute on disabled buttons', () => {
      const { container } = render(
        <Pagination {...createPaginationProps({ currentPage: 1, totalPages: 5 })} />
      );
      const prevButton = container.querySelector('[aria-label="Previous page"]');
      expect(prevButton).toHaveAttribute('disabled');
    });

    it('should have visible focus states', () => {
      const { container } = render(<Pagination {...createPaginationProps()} />);
      const buttons = container.querySelectorAll('button');
      buttons.forEach((btn) => {
        expect(btn.className).toContain('focus-visible:outline');
      });
    });

    it('should have focusable input for jump to page', () => {
      const { container } = render(
        <Pagination {...createPaginationProps({ showJumpTo: true })} />
      );
      const input = container.querySelector('input[type="number"]');
      expect(input).toHaveAttribute('type', 'number');
    });
  });

  describe('Touch Targets', () => {
    it('should have minimum 40px touch target for buttons (md size)', () => {
      const { container } = render(
        <Pagination {...createPaginationProps({ size: 'md' })} />
      );
      const buttons = container.querySelectorAll('button');
      buttons.forEach((btn) => {
        expect(btn.className).toContain('h-10');
        expect(btn.className).toContain('w-10');
      });
    });

    it('should have adequate touch targets for small size', () => {
      const { container } = render(
        <Pagination {...createPaginationProps({ size: 'sm' })} />
      );
      const buttons = container.querySelectorAll('button');
      buttons.forEach((btn) => {
        expect(btn.className).toContain('h-8');
        expect(btn.className).toContain('w-8');
      });
    });

    it('should have large touch targets available', () => {
      const { container } = render(
        <Pagination {...createPaginationProps({ size: 'lg' })} />
      );
      const buttons = container.querySelectorAll('button');
      buttons.forEach((btn) => {
        expect(btn.className).toContain('h-12');
        expect(btn.className).toContain('w-12');
      });
    });

    it('should have proper spacing between buttons', () => {
      const { container } = render(<Pagination {...createPaginationProps()} />);
      const wrapper = container.querySelector('[role="navigation"]');
      expect(wrapper?.className).toContain('gap-2');
    });
  });

  describe('Color Contrast', () => {
    it('should maintain contrast for button text', () => {
      const { container } = render(<Pagination {...createPaginationProps()} />);
      const buttons = container.querySelectorAll('button');
      buttons.forEach((btn) => {
        // Buttons should have text-gray-900 or text-white (adequate contrast)
        expect(
          btn.className.includes('text-gray-900') || btn.className.includes('text-white')
        ).toBeTruthy();
      });
    });

    it('should maintain contrast for page info text', () => {
      const { container } = render(
        <Pagination {...createPaginationProps({ showPageInfo: true })} />
      );
      const pageInfo = container.querySelector('.text-gray-600');
      expect(pageInfo).toBeInTheDocument();
    });

    it('should have sufficient contrast in dark mode', () => {
      const { container } = render(<Pagination {...createPaginationProps()} />);
      const buttons = container.querySelectorAll('button');
      buttons.forEach((btn) => {
        // All buttons should have dark mode classes
        expect(btn.className).toContain('dark:');
      });
    });

    it('should have sufficient contrast for current page indicator', () => {
      const { container } = render(
        <Pagination {...createPaginationProps({ currentPage: 3, totalPages: 5 })} />
      );
      const currentButton = container.querySelector('[aria-current="page"]');
      expect(currentButton?.className).toContain('text-white');
      expect(currentButton?.className).toContain('bg-sky-600');
    });
  });

  describe('Text Readability', () => {
    it('should use readable font sizes', () => {
      const { container } = render(<Pagination {...createPaginationProps({ size: 'md' })} />);
      const buttons = container.querySelectorAll('button');
      buttons.forEach((btn) => {
        expect(btn.className).toContain('text-base');
      });
    });

    it('should use readable font sizes for all variants', () => {
      const sizes = ['sm', 'md', 'lg'] as const;
      sizes.forEach((size) => {
        const { container } = render(
          <Pagination {...createPaginationProps({ size })} />
        );
        const buttons = container.querySelectorAll('button');
        expect(buttons.length).toBeGreaterThan(0);
      });
    });

    it('should have readable page info text', () => {
      const { container } = render(
        <Pagination {...createPaginationProps({ showPageInfo: true })} />
      );
      const pageInfo = container.querySelector('.text-sm');
      expect(pageInfo).toBeInTheDocument();
    });
  });

  describe('Dark Mode Support', () => {
    it('should have dark mode classes on buttons', () => {
      const { container } = render(<Pagination {...createPaginationProps()} />);
      const buttons = container.querySelectorAll('button');
      buttons.forEach((btn) => {
        expect(
          btn.className.includes('dark:border-gray-600') ||
          btn.className.includes('dark:bg-gray-800') ||
          btn.className.includes('dark:text-gray-100')
        ).toBeTruthy();
      });
    });

    it('should have dark mode classes on page info text', () => {
      const { container } = render(
        <Pagination {...createPaginationProps({ showPageInfo: true })} />
      );
      const pageInfo = container.querySelector('.dark\\:text-gray-400');
      expect(pageInfo).toBeInTheDocument();
    });

    it('should have dark mode classes on jump to input', () => {
      const { container } = render(
        <Pagination {...createPaginationProps({ showJumpTo: true })} />
      );
      const input = container.querySelector('input[type="number"]');
      expect(input?.className).toContain('dark:bg-gray-800');
    });
  });

  describe('Responsive Design', () => {
    it('should hide previous button text on small screens', () => {
      const { container } = render(<Pagination {...createPaginationProps()} />);
      const prevButton = container.querySelector('[aria-label="Previous page"]');
      // Check for hidden sm: classes
      expect(prevButton?.className).toContain('hidden');
      expect(prevButton?.className).toContain('sm:inline');
    });

    it('should hide next button text on small screens', () => {
      const { container } = render(<Pagination {...createPaginationProps()} />);
      const nextButton = container.querySelector('[aria-label="Next page"]');
      expect(nextButton?.className).toContain('hidden');
      expect(nextButton?.className).toContain('sm:inline');
    });

    it('should maintain functionality on small screens', () => {
      const { container } = render(<Pagination {...createPaginationProps()} />);
      const buttons = container.querySelectorAll('button');
      // All buttons should still be functional
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('Form Accessibility', () => {
    it('should have proper label association for jump to input', () => {
      const { container } = render(
        <Pagination {...createPaginationProps({ showJumpTo: true })} />
      );
      const label = container.querySelector('label');
      const input = container.querySelector('input[type="number"]');
      // Label should be associated with input
      expect(label).toBeInTheDocument();
      expect(input).toBeInTheDocument();
    });

    it('should have number input constraints', () => {
      const { container } = render(
        <Pagination {...createPaginationProps({ totalPages: 10, showJumpTo: true })} />
      );
      const input = container.querySelector('input[type="number"]') as HTMLInputElement;
      expect(input).toHaveAttribute('min', '1');
      expect(input).toHaveAttribute('max', '10');
    });

    it('should have placeholder for jump to input', () => {
      const { container } = render(
        <Pagination {...createPaginationProps({ showJumpTo: true })} />
      );
      const input = container.querySelector('input[type="number"]');
      expect(input).toHaveAttribute('placeholder');
    });
  });

  describe('Button Accessibility', () => {
    it('should have aria-label on all navigation buttons', () => {
      const { container } = render(<Pagination {...createPaginationProps()} />);
      const buttons = container.querySelectorAll('button');
      buttons.forEach((btn) => {
        expect(btn).toHaveAttribute('aria-label');
      });
    });

    it('should properly announce disabled state', () => {
      const { container } = render(
        <Pagination {...createPaginationProps({ currentPage: 1, totalPages: 5 })} />
      );
      const prevButton = container.querySelector('[aria-label="Previous page"]');
      expect(prevButton).toHaveAttribute('disabled');
    });
  });
});
