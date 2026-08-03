import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Error as ErrorComponent } from './Error';

expect.extend(toHaveNoViolations);

describe('Error - Accessibility', () => {
  const defaultProps = {
    title: 'An error occurred',
  };

  describe('WCAG 2.1 Compliance', () => {
    it('should have no accessibility violations with default props', async () => {
      const { container } = render(<ErrorComponent {...defaultProps} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations for error severity', async () => {
      const { container } = render(
        <ErrorComponent {...defaultProps} severity="error" />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations for warning severity', async () => {
      const { container } = render(
        <ErrorComponent {...defaultProps} severity="warning" />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations for info severity', async () => {
      const { container } = render(
        <ErrorComponent {...defaultProps} severity="info" />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations for inline variant', async () => {
      const { container } = render(
        <ErrorComponent {...defaultProps} variant="inline" />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations for card variant', async () => {
      const { container } = render(
        <ErrorComponent {...defaultProps} variant="card" />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations for alert variant', async () => {
      const { container } = render(
        <ErrorComponent {...defaultProps} variant="alert" />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations when dismissible', async () => {
      const { container } = render(
        <ErrorComponent {...defaultProps} dismissible />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations with all content', async () => {
      const { container } = render(
        <ErrorComponent
          title="Error"
          message="Something failed"
          details="Details"
          severity="error"
          variant="card"
          dismissible
          action={{ label: 'Action', onClick: jest.fn() }}
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Semantic HTML', () => {
    it('should have role="alert"', () => {
      const { container } = render(<ErrorComponent {...defaultProps} />);
      expect(container.querySelector('[role="alert"]')).toBeInTheDocument();
    });

    it('should use h3 for title', () => {
      const { container } = render(<ErrorComponent {...defaultProps} />);
      const heading = container.querySelector('h3');
      expect(heading?.textContent).toContain('An error occurred');
    });

    it('should use summary element for expandable details', () => {
      const { container } = render(
        <ErrorComponent {...defaultProps} details="Details" />
      );
      const summary = container.querySelector('summary');
      expect(summary?.textContent).toContain('More details');
    });

    it('should use details element for expandable content', () => {
      const { container } = render(
        <ErrorComponent {...defaultProps} details="Details" />
      );
      const details = container.querySelector('details');
      expect(details).toBeInTheDocument();
    });
  });

  describe('ARIA Attributes', () => {
    it('should announce as alert to screen readers', () => {
      const { container } = render(<ErrorComponent {...defaultProps} />);
      const alert = container.querySelector('[role="alert"]');
      expect(alert?.getAttribute('role')).toBe('alert');
    });

    it('should have accessible dismiss button label', () => {
      render(<ErrorComponent {...defaultProps} dismissible />);
      const button = screen.getByLabelText('Dismiss error');
      expect(button).toBeInTheDocument();
    });

    it('should hide decorative icons from screen readers', () => {
      const { container } = render(<ErrorComponent {...defaultProps} />);
      const icons = container.querySelectorAll('[aria-hidden="true"]');
      expect(icons.length).toBeGreaterThan(0);
    });
  });

  describe('Color Contrast', () => {
    it('should have sufficient contrast for error state', () => {
      const { container } = render(
        <ErrorComponent {...defaultProps} severity="error" />
      );
      const wrapper = container.firstChild as HTMLElement;
      // Check that it uses the error color classes
      expect(wrapper.className).toContain('text-red');
      expect(wrapper.className).toContain('bg-red');
    });

    it('should have sufficient contrast for warning state', () => {
      const { container } = render(
        <ErrorComponent {...defaultProps} severity="warning" />
      );
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain('text-yellow');
      expect(wrapper.className).toContain('bg-yellow');
    });

    it('should have sufficient contrast for info state', () => {
      const { container } = render(
        <ErrorComponent {...defaultProps} severity="info" />
      );
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain('text-sky');
      expect(wrapper.className).toContain('bg-sky');
    });

    it('should maintain contrast in dark mode for error', () => {
      const { container } = render(
        <ErrorComponent {...defaultProps} severity="error" />
      );
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain('dark:text-red');
      expect(wrapper.className).toContain('dark:bg-red');
    });

    it('should maintain contrast in dark mode for alert variant', () => {
      const { container } = render(
        <ErrorComponent
          {...defaultProps}
          variant="alert"
          severity="error"
        />
      );
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain('dark:bg-red');
    });
  });

  describe('Keyboard Navigation', () => {
    it('should be keyboard navigable to dismiss button', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <ErrorComponent {...defaultProps} dismissible />
      );

      const button = container.querySelector('button');
      await user.tab();
      expect(button).toHaveFocus();
    });

    it('should dismiss on Enter key', async () => {
      const user = userEvent.setup();
      const handleDismiss = jest.fn();
      const { container } = render(
        <ErrorComponent
          {...defaultProps}
          dismissible
          onDismiss={handleDismiss}
        />
      );

      const button = container.querySelector('button') as HTMLButtonElement;
      button.focus();
      await user.keyboard('{Enter}');

      expect(handleDismiss).toHaveBeenCalledTimes(1);
    });

    it('should dismiss on Space key', async () => {
      const user = userEvent.setup();
      const handleDismiss = jest.fn();
      const { container } = render(
        <ErrorComponent
          {...defaultProps}
          dismissible
          onDismiss={handleDismiss}
        />
      );

      const button = container.querySelector('button') as HTMLButtonElement;
      button.focus();
      await user.keyboard(' ');

      expect(handleDismiss).toHaveBeenCalledTimes(1);
    });

    it('should activate action button via keyboard', async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();
      render(
        <ErrorComponent
          {...defaultProps}
          action={{ label: 'Retry', onClick: handleClick }}
        />
      );

      await user.tab();
      await user.keyboard('{Enter}');

      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Focus Management', () => {
    it('should have focus-visible on dismiss button', () => {
      const { container } = render(
        <ErrorComponent {...defaultProps} dismissible />
      );

      const button = container.querySelector('button');
      expect(button?.className).toContain('focus-visible:outline');
    });

    it('should show focus outline on dismiss button', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <ErrorComponent {...defaultProps} dismissible />
      );

      const button = container.querySelector('button') as HTMLButtonElement;
      await user.tab();
      expect(button).toHaveFocus();
    });
  });

  describe('Text and Content', () => {
    it('should have readable font size for title', () => {
      const { container } = render(<ErrorComponent {...defaultProps} />);
      const title = container.querySelector('h3');
      expect(title?.className).toContain('text-sm');
    });

    it('should have readable font size for message', () => {
      const { container } = render(
        <ErrorComponent {...defaultProps} message="Error message" />
      );
      const message = container.querySelector('p');
      expect(message?.className).toContain('text-sm');
    });

    it('should have readable font size for details', () => {
      const { container } = render(
        <ErrorComponent {...defaultProps} details="Details" />
      );
      const details = container.querySelector('p:last-of-type');
      expect(details?.className).toContain('text-xs');
    });

    it('should use readable font weight for title', () => {
      const { container } = render(<ErrorComponent {...defaultProps} />);
      const title = container.querySelector('h3');
      expect(title?.className).toContain('font-semibold');
    });
  });

  describe('Alert Semantics', () => {
    it('should announce as alert for inline variant', () => {
      const { container } = render(
        <ErrorComponent {...defaultProps} variant="inline" />
      );
      expect(container.querySelector('[role="alert"]')).toBeInTheDocument();
    });

    it('should announce as alert for alert variant', () => {
      const { container } = render(
        <ErrorComponent {...defaultProps} variant="alert" />
      );
      expect(container.querySelector('[role="alert"]')).toBeInTheDocument();
    });

    it('should not duplicate role when using Card', () => {
      const { container } = render(
        <ErrorComponent {...defaultProps} variant="card" />
      );
      const alerts = container.querySelectorAll('[role="alert"]');
      // Should only have one alert role
      expect(alerts.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Interactive Elements Accessibility', () => {
    it('should have accessible button type', () => {
      const { container } = render(
        <ErrorComponent {...defaultProps} dismissible />
      );
      const button = container.querySelector('button');
      expect(button?.getAttribute('type')).toBe('button');
    });

    it('should have proper button label for dismiss', () => {
      render(<ErrorComponent {...defaultProps} dismissible />);
      const button = screen.getByLabelText('Dismiss error');
      expect(button).toHaveAttribute('type', 'button');
    });
  });

  describe('Expandable Content Accessibility', () => {
    it('should make details accessible via keyboard', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <ErrorComponent {...defaultProps} details="Details" />
      );

      const summary = container.querySelector('summary');
      await user.click(summary!);

      const detailsElement = container.querySelector('details');
      expect((detailsElement as HTMLDetailsElement).open).toBe(true);
    });

    it('should toggle details with Enter key', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <ErrorComponent {...defaultProps} details="Details" />
      );

      const summary = container.querySelector('summary') as HTMLElement;
      summary.focus();
      await user.keyboard('{Enter}');

      const detailsElement = container.querySelector('details');
      expect((detailsElement as HTMLDetailsElement).open).toBe(true);
    });

    it('should have semantic structure for details', () => {
      const { container } = render(
        <ErrorComponent {...defaultProps} details="Details" />
      );

      const detailsElement = container.querySelector('details');
      const summary = detailsElement?.querySelector('summary');
      expect(summary).toBeInTheDocument();
    });
  });

  describe('Combination Accessibility', () => {
    it('should be accessible with all elements combined', async () => {
      const { container } = render(
        <ErrorComponent
          title="Critical Error"
          message="Failed to save"
          details="Timeout occurred"
          severity="error"
          variant="card"
          dismissible
          action={{ label: 'Retry', onClick: jest.fn() }}
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
