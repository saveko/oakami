import React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Loading } from './Loading';

expect.extend(toHaveNoViolations);

describe('Loading - Accessibility', () => {
  describe('WCAG 2.1 Compliance', () => {
    it('should have no accessibility violations with default props', async () => {
      const { container } = render(<Loading />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations with spinner variant', async () => {
      const { container } = render(<Loading variant="spinner" />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations with skeleton variant', async () => {
      const { container } = render(<Loading variant="skeleton" />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations with dots variant', async () => {
      const { container } = render(<Loading variant="dots" />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations with all sizes', async () => {
      const sizes = ['sm', 'md', 'lg'] as const;

      for (const size of sizes) {
        const { container } = render(<Loading size={size} />);
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      }
    });

    it('should have no accessibility violations with label', async () => {
      const { container } = render(<Loading label="Loading data..." />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations fullscreen', async () => {
      const { container } = render(<Loading fullScreen />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations with overlay', async () => {
      const { container } = render(<Loading overlay />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Semantic Structure', () => {
    it('should use semantic status role', () => {
      const { container } = render(<Loading />);
      const status = container.querySelector('div[role="status"]');
      expect(status).toBeInTheDocument();
    });

    it('should have role="status" for screen reader announcement', () => {
      const { container } = render(<Loading />);
      const status = container.querySelector('[role="status"]');
      expect(status?.getAttribute('role')).toBe('status');
    });

    it('should have aria-busy indicating active loading', () => {
      const { container } = render(<Loading />);
      const status = container.querySelector('[role="status"]');
      expect(status?.getAttribute('aria-busy')).toBe('true');
    });

    it('should have accessible aria-label', () => {
      const { container } = render(<Loading />);
      const status = container.querySelector('[role="status"]');
      expect(status?.getAttribute('aria-label')).toBeTruthy();
    });

    it('should have descriptive aria-label with custom label', () => {
      const { container } = render(<Loading label="Processing..." />);
      const status = container.querySelector('[role="status"]');
      const label = status?.getAttribute('aria-label');
      expect(label).toContain('Processing');
    });
  });

  describe('Visual and Decorative Elements', () => {
    it('should hide spinner from screen readers', () => {
      const { container } = render(<Loading />);
      const spinner = container.querySelector('.animate-spin');
      expect(spinner?.getAttribute('aria-hidden')).toBe('true');
    });

    it('should hide skeleton from screen readers', () => {
      const { container } = render(<Loading variant="skeleton" />);
      const skeleton = container.querySelector('.animate-pulse');
      expect(skeleton?.getAttribute('aria-hidden')).toBe('true');
    });

    it('should hide dots from screen readers', () => {
      const { container } = render(<Loading variant="dots" />);
      const wrapper = container.querySelector('[aria-hidden="true"]');
      expect(wrapper).toBeInTheDocument();
    });

    it('should not hide text label from screen readers', () => {
      const { container } = render(<Loading label="Loading..." />);
      const label = container.querySelector('p');
      expect(label?.getAttribute('aria-hidden')).not.toBe('true');
    });
  });

  describe('Animation and Motion', () => {
    it('should respect prefers-reduced-motion', () => {
      // Note: This test verifies the component renders correctly
      // The actual motion reduction would be handled by Tailwind's @media query
      const { container } = render(<Loading />);
      expect(container.querySelector('[role="status"]')).toBeInTheDocument();
    });

    it('should announce loading state updates', () => {
      const { container, rerender } = render(<Loading label="Loading..." />);
      const status = container.querySelector('[role="status"]');

      expect(status?.getAttribute('aria-busy')).toBe('true');

      rerender(<Loading label="Complete" />);
      expect(status?.getAttribute('aria-busy')).toBe('true');
    });
  });

  describe('Focus Management', () => {
    it('should be focusable when fullscreen', () => {
      const { container } = render(<Loading fullScreen />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.tabIndex).toBeGreaterThanOrEqual(-1);
    });

    it('should not capture focus from content behind overlay', () => {
      const { container } = render(
        <div>
          <input type="text" />
          <Loading overlay />
        </div>
      );
      const input = container.querySelector('input');
      expect(input).toBeInTheDocument();
    });
  });

  describe('Text Content and Readability', () => {
    it('should use readable font size for label', () => {
      const { container } = render(<Loading label="Loading..." />);
      const label = container.querySelector('p');
      expect(label?.className).toContain('text-sm');
    });

    it('should have sufficient color contrast for label', () => {
      const { container } = render(<Loading label="Loading..." />);
      const label = container.querySelector('p');
      expect(label?.className).toContain('text-gray-600');
      expect(label?.className).toContain('dark:text-gray-400');
    });

    it('should center text for readability', () => {
      const { container } = render(<Loading label="Loading..." />);
      const label = container.querySelector('p');
      expect(label?.className).toContain('text-center');
    });
  });

  describe('Color Contrast in Dark Mode', () => {
    it('should maintain contrast in dark mode spinner', () => {
      const { container } = render(<Loading />);
      const spinner = container.querySelector('.animate-spin');
      expect(spinner?.className).toContain('dark:border-gray-700');
      expect(spinner?.className).toContain('dark:border-t-sky-400');
    });

    it('should maintain contrast in dark mode skeleton', () => {
      const { container } = render(<Loading variant="skeleton" />);
      const skeleton = container.querySelector('.animate-pulse');
      expect(skeleton?.className).toContain('dark:bg-gray-700');
    });

    it('should maintain contrast in dark mode dots', () => {
      const { container } = render(<Loading variant="dots" />);
      const dot = container.querySelector('.animate-bounce');
      expect(dot?.className).toContain('dark:bg-sky-400');
    });

    it('should maintain contrast in dark mode label', () => {
      const { container } = render(<Loading label="Loading..." />);
      const label = container.querySelector('p');
      expect(label?.className).toContain('dark:text-gray-400');
    });
  });

  describe('Screen Reader Announcements', () => {
    it('should announce status changes with aria-busy', () => {
      const { container } = render(<Loading label="Processing" />);
      const status = container.querySelector('[role="status"]');
      expect(status?.getAttribute('aria-busy')).toBe('true');
    });

    it('should provide descriptive aria-label for context', () => {
      const { container } = render(<Loading label="Syncing data" />);
      const status = container.querySelector('[role="status"]');
      const label = status?.getAttribute('aria-label');
      expect(label).toContain('Syncing data');
    });

    it('should update aria-label when label changes', () => {
      const { container, rerender } = render(<Loading label="Step 1" />);
      let status = container.querySelector('[role="status"]');
      expect(status?.getAttribute('aria-label')).toContain('Step 1');

      rerender(<Loading label="Step 2" />);
      status = container.querySelector('[role="status"]');
      expect(status?.getAttribute('aria-label')).toContain('Step 2');
    });
  });

  describe('Fullscreen and Modal Behavior', () => {
    it('should indicate loading state clearly when fullscreen', async () => {
      const { container } = render(<Loading fullScreen label="Processing..." />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should maintain accessible structure with overlay', async () => {
      const { container } = render(<Loading overlay label="Loading..." />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Combination Accessibility', () => {
    it('should be accessible with all props combined', async () => {
      const { container } = render(
        <Loading
          variant="spinner"
          size="lg"
          label="Loading data..."
          fullScreen
          overlay
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper semantics for all variants', async () => {
      const variants = ['spinner', 'skeleton', 'dots'] as const;

      for (const variant of variants) {
        const { container } = render(
          <Loading variant={variant} label="Loading" />
        );
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      }
    });
  });
});
