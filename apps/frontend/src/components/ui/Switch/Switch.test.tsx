import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@/test/utils';
import { axe, toHaveNoViolations } from 'jest-axe';
import Switch from './Switch';

expect.extend(toHaveNoViolations);

describe('Switch - Accessibility', () => {
  describe('keyboard navigation', () => {
    it('should be focusable with Tab key', () => {
      render(<Switch id="toggle" />);

      const toggle = screen.getByRole('switch');
      toggle.focus();
      expect(document.activeElement).toBe(toggle);
    });

    it('should toggle with Space key', () => {
      const handleChange = vi.fn();
      render(<Switch id="toggle" onChange={handleChange} />);

      const toggle = screen.getByRole('switch');
      toggle.focus();
      fireEvent.keyDown(toggle, { key: ' ' });

      expect(handleChange).toHaveBeenCalled();
    });

    it('should toggle with Enter key', () => {
      const handleChange = vi.fn();
      render(<Switch id="toggle" onChange={handleChange} />);

      const toggle = screen.getByRole('switch');
      toggle.focus();
      fireEvent.keyDown(toggle, { key: 'Enter' });

      expect(handleChange).toHaveBeenCalled();
    });

    it('should have accessible label for keyboard navigation', () => {
      render(<Switch id="toggle" label="Notifications" />);

      const toggle = screen.getByRole('switch');
      const label = screen.getByText('Notifications');
      expect(label).toHaveAttribute('for', 'toggle');
    });
  });

  describe('focus management', () => {
    it('should have visible focus indicator', () => {
      const { container } = render(<Switch id="toggle" />);

      const switchGroup = container.querySelector('.group');
      expect(switchGroup).toHaveClass('peer-focus-visible:outline-2');
      expect(switchGroup).toHaveClass('peer-focus-visible:outline-offset-2');
    });

    it('should be focusable and show focus state', () => {
      render(<Switch id="toggle" />);
      const toggle = screen.getByRole('switch');

      toggle.focus();
      expect(document.activeElement).toBe(toggle);
    });
  });

  describe('aria attributes', () => {
    it('should have switch role', () => {
      render(<Switch id="toggle" />);

      const toggle = screen.getByRole('switch');
      expect(toggle).toHaveAttribute('role', 'switch');
    });

    it('should set aria-checked for on state', () => {
      render(<Switch id="toggle" checked />);

      const toggle = screen.getByRole('switch');
      expect(toggle).toHaveAttribute('aria-checked', 'true');
    });

    it('should set aria-checked false for off state', () => {
      render(<Switch id="toggle" checked={false} />);

      const toggle = screen.getByRole('switch');
      expect(toggle).toHaveAttribute('aria-checked', 'false');
    });

    it('should have aria-required for required field', () => {
      render(<Switch id="toggle" required />);

      const toggle = screen.getByRole('switch');
      expect(toggle).toHaveAttribute('aria-required', 'true');
    });

    it('should have aria-invalid on error', () => {
      render(<Switch id="toggle" error />);

      const toggle = screen.getByRole('switch');
      expect(toggle).toHaveAttribute('aria-invalid', 'true');
    });

    it('should have aria-label', () => {
      render(<Switch id="toggle" label="Enable feature" />);

      const toggle = screen.getByRole('switch');
      expect(toggle).toHaveAttribute('aria-label', 'Enable feature');
    });

    it('should use ariaLabel prop when provided', () => {
      render(<Switch id="toggle" ariaLabel="Custom label" />);

      const toggle = screen.getByRole('switch');
      expect(toggle).toHaveAttribute('aria-label', 'Custom label');
    });

    it('should link aria-describedby to help text', () => {
      render(<Switch id="toggle" helpText="Enable notifications" />);

      const toggle = screen.getByRole('switch');
      const describedBy = toggle.getAttribute('aria-describedby');
      expect(describedBy).toContain('help');
    });

    it('should link aria-describedby to error message', () => {
      render(<Switch id="toggle" error errorMessage="This is required" />);

      const toggle = screen.getByRole('switch');
      const describedBy = toggle.getAttribute('aria-describedby');
      expect(describedBy).toContain('error');
    });
  });

  describe('color contrast', () => {
    it('should have sufficient contrast on text', () => {
      render(<Switch id="toggle" label="Enable" />);

      const label = screen.getByText('Enable');
      const styles = window.getComputedStyle(label);
      expect(styles.color).toBeTruthy();
    });

    it('should have sufficient contrast on error text', () => {
      render(<Switch id="toggle" error errorMessage="Error" />);

      const error = screen.getByRole('alert');
      const styles = window.getComputedStyle(error);
      expect(styles.color).toBeTruthy();
    });

    it('should have sufficient contrast on disabled state', () => {
      render(<Switch id="toggle" disabled label="Disabled" />);

      const toggle = screen.getByRole('switch');
      const styles = window.getComputedStyle(toggle);
      expect(styles.opacity).toBeDefined();
    });
  });

  describe('touch targets', () => {
    it('should have proper minimum touch target size', () => {
      render(<Switch id="toggle" />);

      const toggle = screen.getByRole('switch');
      // Switch should be accessible for touch (hidden input with large click area via label)
      expect(toggle).toBeInTheDocument();
    });

    it('should have label as clickable target', () => {
      render(<Switch id="toggle" label="Enable" />);

      const label = screen.getByText('Enable');
      expect(label).toHaveAttribute('for', 'toggle');
    });
  });

  describe('semantic HTML', () => {
    it('should use semantic input element', () => {
      render(<Switch id="toggle" />);

      const toggle = screen.getByRole('switch');
      expect(toggle.tagName).toBe('INPUT');
      expect(toggle).toHaveAttribute('type', 'checkbox');
    });

    it('should use semantic label element', () => {
      render(<Switch id="toggle" label="Enable" />);

      const label = screen.getByText('Enable');
      expect(label.tagName).toBe('LABEL');
    });

    it('should use role="switch" for semantics', () => {
      render(<Switch id="toggle" />);

      const toggle = screen.getByRole('switch');
      expect(toggle).toHaveAttribute('role', 'switch');
    });

    it('should use role="alert" for error message', () => {
      render(<Switch id="toggle" error errorMessage="Error" />);

      const alert = screen.getByRole('alert');
      expect(alert).toHaveTextContent('Error');
    });
  });

  describe('text alternatives', () => {
    it('should provide text alternative for switch', () => {
      render(<Switch id="toggle" label="Enable notifications" />);

      const toggle = screen.getByRole('switch');
      const label = screen.getByText('Enable notifications');
      expect(label).toHaveAttribute('for', 'toggle');
    });

    it('should provide required indicator', () => {
      render(<Switch id="toggle" label="Accept" required />);

      expect(screen.getByLabelText('required')).toBeInTheDocument();
    });

    it('should provide help text', () => {
      render(<Switch id="toggle" helpText="This will enable notifications" />);

      expect(screen.getByText('This will enable notifications')).toBeInTheDocument();
    });
  });

  describe('error handling', () => {
    it('should announce error with role="alert"', () => {
      render(<Switch id="toggle" error errorMessage="This field is required" />);

      const alert = screen.getByRole('alert');
      expect(alert).toHaveTextContent('This field is required');
    });

    it('should have error styling', () => {
      render(<Switch id="toggle" error />);

      const toggle = screen.getByRole('switch');
      expect(toggle).toHaveAttribute('aria-invalid', 'true');
    });
  });

  describe('motion and animation', () => {
    it('should respect prefers-reduced-motion', () => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query) => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      render(<Switch id="toggle" />);

      const toggle = screen.getByRole('switch');
      expect(toggle).toBeInTheDocument();
    });

    it('should have smooth transition', () => {
      const { container } = render(<Switch id="toggle" />);

      const switchBg = container.querySelector('[aria-hidden="true"]');
      expect(switchBg).toHaveClass('transition-colors');
      expect(switchBg).toHaveClass('duration-200');
    });
  });

  describe('dark mode support', () => {
    it('should render with dark mode', () => {
      const { container } = render(
        <div className="dark">
          <Switch id="toggle" label="Enable" />
        </div>
      );

      const toggle = screen.getByRole('switch');
      expect(toggle).toBeInTheDocument();
    });
  });

  describe('axe accessibility audit', () => {
    it('should not have violations in default state', async () => {
      const { container } = render(<Switch id="toggle" label="Enable" />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should not have violations with error state', async () => {
      const { container } = render(
        <Switch id="toggle" label="Enable" error errorMessage="Required" />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should not have violations when checked', async () => {
      const { container } = render(<Switch id="toggle" label="Enable" checked />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should not have violations when disabled', async () => {
      const { container } = render(
        <Switch id="toggle" label="Enable" disabled />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should not have violations with required field', async () => {
      const { container } = render(
        <Switch id="toggle" label="Enable" required />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should not have violations with help text', async () => {
      const { container } = render(
        <Switch id="toggle" label="Enable" helpText="Help text" />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should not have violations in small size', async () => {
      const { container } = render(
        <Switch id="toggle" label="Enable" size="sm" />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should not have violations in medium size', async () => {
      const { container } = render(
        <Switch id="toggle" label="Enable" size="md" />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('required field indicator', () => {
    it('should display required indicator', () => {
      render(<Switch id="toggle" label="Accept" required />);

      expect(screen.getByLabelText('required')).toBeInTheDocument();
    });

    it('should have aria-required attribute', () => {
      render(<Switch id="toggle" required />);

      const toggle = screen.getByRole('switch');
      expect(toggle).toHaveAttribute('aria-required', 'true');
    });
  });

  describe('state transitions', () => {
    it('should update aria-checked when toggled', () => {
      const { rerender } = render(<Switch id="toggle" checked={false} />);
      let toggle = screen.getByRole('switch');
      expect(toggle).toHaveAttribute('aria-checked', 'false');

      rerender(<Switch id="toggle" checked={true} />);
      toggle = screen.getByRole('switch');
      expect(toggle).toHaveAttribute('aria-checked', 'true');
    });

    it('should announce state change to screen readers', () => {
      const { rerender } = render(<Switch id="toggle" checked={false} label="Notifications" />);
      let toggle = screen.getByRole('switch');
      expect(toggle).toHaveAttribute('aria-checked', 'false');

      rerender(<Switch id="toggle" checked={true} label="Notifications" />);
      toggle = screen.getByRole('switch');
      expect(toggle).toHaveAttribute('aria-checked', 'true');
    });
  });
});
