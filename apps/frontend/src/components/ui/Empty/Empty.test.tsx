import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen } from '@/test/utils';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Empty } from './Empty';

expect.extend(toHaveNoViolations);

describe('Empty - Accessibility', () => {
  const defaultProps = {
    title: 'No data found',
  };

  describe('WCAG 2.1 Compliance', () => {
    it('should have no accessibility violations with default props', async () => {
      const { container } = render(<Empty {...defaultProps} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations with description', async () => {
      const { container } = render(
        <Empty {...defaultProps} description="Try creating a new record" />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations with icon', async () => {
      const { container } = render(
        <Empty {...defaultProps} icon={<span>📭</span>} />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations with action button', async () => {
      const { container } = render(
        <Empty
          {...defaultProps}
          action={{
            label: 'Create New',
            onClick: vi.fn(),
          }}
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations with all elements', async () => {
      const { container } = render(
        <Empty
          title="No results"
          description="Try adjusting your search"
          icon={<span>🔍</span>}
          action={{
            label: 'Reset',
            onClick: vi.fn(),
          }}
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations in compact variant', async () => {
      const { container } = render(
        <Empty {...defaultProps} variant="compact" />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations for all sizes', async () => {
      const sizes = ['sm', 'md'] as const;

      for (const size of sizes) {
        const { container } = render(
          <Empty {...defaultProps} size={size} />
        );
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      }
    });
  });

  describe('Semantic HTML Structure', () => {
    it('should use semantic heading for title', () => {
      const { container } = render(<Empty {...defaultProps} />);
      const heading = container.querySelector('h3');
      expect(heading?.tagName).toBe('H3');
    });

    it('should use semantic div with role="status"', () => {
      const { container } = render(<Empty {...defaultProps} />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.getAttribute('role')).toBe('status');
    });

    it('should use semantic paragraph for description', () => {
      const { container } = render(
        <Empty {...defaultProps} description="Test" />
      );
      const para = container.querySelector('p');
      expect(para?.tagName).toBe('P');
    });

    it('should use semantic button for action', () => {
      const { container } = render(
        <Empty
          {...defaultProps}
          action={{
            label: 'Action',
            onClick: vi.fn(),
          }}
        />
      );
      const button = container.querySelector('button');
      expect(button?.tagName).toBe('BUTTON');
    });
  });

  describe('ARIA Attributes', () => {
    it('should have role="status" for empty state', () => {
      const { container } = render(<Empty {...defaultProps} />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.getAttribute('role')).toBe('status');
    });

    it('should have aria-label with title', () => {
      const { container } = render(
        <Empty {...defaultProps} title="No results" />
      );
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.getAttribute('aria-label')).toBe('No results');
    });

    it('should hide decorative icon from screen readers', () => {
      const { container } = render(
        <Empty {...defaultProps} icon={<span>📭</span>} />
      );
      const icon = container.querySelector('[aria-hidden="true"]');
      expect(icon?.getAttribute('aria-hidden')).toBe('true');
    });

    it('should have accessible button label', () => {
      render(
        <Empty
          {...defaultProps}
          action={{
            label: 'Create New Item',
            onClick: vi.fn(),
          }}
        />
      );
      expect(screen.getByText('Create New Item')).toBeInTheDocument();
    });
  });

  describe('Heading Hierarchy', () => {
    it('should use h3 for empty state title', () => {
      const { container } = render(<Empty {...defaultProps} />);
      const heading = container.querySelector('h3');
      expect(heading).toBeInTheDocument();
    });

    it('should maintain proper heading hierarchy', () => {
      const { container } = render(
        <Empty title="Main Title" description="Subtitle" />
      );
      const h3 = container.querySelector('h3');
      expect(h3).toBeInTheDocument();
    });

    it('should not have missing heading levels', () => {
      const { container } = render(
        <Empty {...defaultProps} />
      );
      // Check that heading jumps are avoided
      expect(container.querySelector('h1')).not.toBeInTheDocument();
      expect(container.querySelector('h2')).not.toBeInTheDocument();
    });
  });

  describe('Color Contrast', () => {
    it('should have sufficient contrast for title', () => {
      const { container } = render(<Empty {...defaultProps} />);
      const title = container.querySelector('h3');
      expect(title?.className).toContain('text-gray-900');
      expect(title?.className).toContain('dark:text-gray-100');
    });

    it('should have sufficient contrast for description', () => {
      const { container } = render(
        <Empty {...defaultProps} description="Test" />
      );
      const description = container.querySelector('p');
      expect(description?.className).toContain('text-gray-600');
      expect(description?.className).toContain('dark:text-gray-400');
    });

    it('should have sufficient contrast for icon', () => {
      const { container } = render(
        <Empty {...defaultProps} icon={<span>📭</span>} />
      );
      const icon = container.querySelector('[aria-hidden="true"]');
      expect(icon?.className).toContain('text-gray-400');
      expect(icon?.className).toContain('dark:text-gray-500');
    });

    it('should maintain contrast in dark mode', () => {
      const { container } = render(
        <Empty
          {...defaultProps}
          description="Test"
          icon={<span>📭</span>}
        />
      );
      const title = container.querySelector('h3');
      const desc = container.querySelector('p');
      const icon = container.querySelector('[aria-hidden="true"]');

      expect(title?.className).toContain('dark:text-gray-100');
      expect(desc?.className).toContain('dark:text-gray-400');
      expect(icon?.className).toContain('dark:text-gray-500');
    });
  });

  describe('Keyboard Navigation', () => {
    it('should be keyboard navigable to action button', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <Empty
          {...defaultProps}
          action={{
            label: 'Action',
            onClick: vi.fn(),
          }}
        />
      );

      const button = container.querySelector('button');
      await user.tab();
      expect(button).toHaveFocus();
    });

    it('should activate button with Enter key', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      const { container } = render(
        <Empty
          {...defaultProps}
          action={{
            label: 'Action',
            onClick: handleClick,
          }}
        />
      );

      const button = container.querySelector('button') as HTMLButtonElement;
      button.focus();
      await user.keyboard('{Enter}');

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should activate button with Space key', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      const { container } = render(
        <Empty
          {...defaultProps}
          action={{
            label: 'Action',
            onClick: handleClick,
          }}
        />
      );

      const button = container.querySelector('button') as HTMLButtonElement;
      button.focus();
      await user.keyboard(' ');

      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Focus Management', () => {
    it('should have focus-visible outline on button', () => {
      const { container } = render(
        <Empty
          {...defaultProps}
          action={{
            label: 'Action',
            onClick: vi.fn(),
          }}
        />
      );

      const button = container.querySelector('button');
      expect(button?.className).toContain('focus-visible:outline');
    });

    it('should manage focus appropriately', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <Empty
          {...defaultProps}
          action={{
            label: 'Action',
            onClick: vi.fn(),
          }}
        />
      );

      const button = container.querySelector('button') as HTMLButtonElement;
      expect(document.activeElement).not.toBe(button);

      await user.tab();
      expect(document.activeElement).toBe(button);
    });
  });

  describe('Text Content', () => {
    it('should have readable font size for title', () => {
      const { container } = render(<Empty {...defaultProps} />);
      const title = container.querySelector('h3');
      // `expect(a) || expect(b)` is not an "or" — the first assertion throws
      // before the second is ever evaluated. Match either accepted size.
      expect(title?.className).toMatch(/text-(lg|2xl)\b/);
    });

    it('should have readable font size for description', () => {
      const { container } = render(
        <Empty {...defaultProps} description="Test" />
      );
      const description = container.querySelector('p');
      expect(description?.className).toMatch(/text-(sm|base)\b/);
    });

    it('should have readable font weight', () => {
      const { container } = render(<Empty {...defaultProps} />);
      const title = container.querySelector('h3');
      expect(title?.className).toContain('font-semibold');
    });

    it('should center text for scannability', () => {
      const { container } = render(
        <Empty {...defaultProps} description="Test" />
      );
      const textContainer = container.querySelector('.text-center');
      expect(textContainer).toBeInTheDocument();
    });
  });

  describe('Status Indication', () => {
    it('should indicate empty state to screen readers', () => {
      const { container } = render(<Empty {...defaultProps} />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.getAttribute('role')).toBe('status');
    });

    it('should provide context via aria-label', () => {
      const { container } = render(
        <Empty title="No search results" />
      );
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.getAttribute('aria-label')).toContain('search result');
    });
  });

  describe('Responsive Accessibility', () => {
    it('should be accessible at all sizes', async () => {
      const sizes = ['sm', 'md'] as const;

      for (const size of sizes) {
        const { container } = render(
          <Empty {...defaultProps} size={size} />
        );
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      }
    });

    it('should maintain accessibility in compact variant', async () => {
      const { container } = render(
        <Empty {...defaultProps} variant="compact" />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Visual Elements Accessibility', () => {
    it('should not rely on color alone to convey meaning', () => {
      render(<Empty {...defaultProps} icon={<span>📭</span>} />);
      // Icon provides visual enhancement, not critical information
      expect(screen.getByText(defaultProps.title)).toBeInTheDocument();
    });

    it('should have sufficient spacing between elements', () => {
      const { container } = render(
        <Empty
          title="Test"
          description="Description"
          icon={<span>📭</span>}
        />
      );
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain('gap-4');
    });
  });
});
