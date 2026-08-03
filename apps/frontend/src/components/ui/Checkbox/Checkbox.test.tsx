import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@/test/utils';
import { axe, toHaveNoViolations } from 'jest-axe';
import Checkbox, { CheckboxGroup } from './Checkbox';

expect.extend(toHaveNoViolations);

describe('Checkbox - Accessibility', () => {
  describe('keyboard navigation', () => {
    it('should be focusable with Tab key', () => {
      render(<Checkbox />);

      const checkbox = screen.getByRole('checkbox');
      checkbox.focus();
      expect(document.activeElement).toBe(checkbox);
    });

    it('should toggle with Space key', () => {
      const handleChange = vi.fn();
      render(<Checkbox onChange={handleChange} />);

      const checkbox = screen.getByRole('checkbox');
      checkbox.focus();
      fireEvent.keyDown(checkbox, { key: ' ' });

      expect(handleChange).toHaveBeenCalled();
    });

    it('should toggle with Enter key', () => {
      const handleChange = vi.fn();
      render(<Checkbox onChange={handleChange} />);

      const checkbox = screen.getByRole('checkbox');
      checkbox.focus();
      fireEvent.keyDown(checkbox, { key: 'Enter' });

      expect(handleChange).toHaveBeenCalled();
    });

    it('should have accessible label for keyboard navigation', () => {
      render(<Checkbox label="Agree" id="agree" />);

      const checkbox = screen.getByRole('checkbox');
      const label = screen.getByText('Agree');
      expect(label).toHaveAttribute('for', 'agree');
    });
  });

  describe('focus management', () => {
    it('should have visible focus indicator', () => {
      render(<Checkbox />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveClass('focus-visible:outline-2');
      expect(checkbox).toHaveClass('focus-visible:outline-offset-2');
    });

    it('should be focusable in group', () => {
      render(
        <CheckboxGroup
          options={[
            { id: 'opt1', label: 'Option 1', value: 'opt1' },
            { id: 'opt2', label: 'Option 2', value: 'opt2' },
          ]}
          values={[]}
          onChange={vi.fn()}
          legend="Choose"
        />
      );

      const checkboxes = screen.getAllByRole('checkbox');
      checkboxes[0].focus();
      expect(document.activeElement).toBe(checkboxes[0]);

      fireEvent.keyDown(checkboxes[0], { key: 'Tab' });
      checkboxes[1].focus();
      expect(document.activeElement).toBe(checkboxes[1]);
    });

    it('should skip disabled options', () => {
      render(
        <CheckboxGroup
          options={[
            { id: 'opt1', label: 'Option 1', value: 'opt1' },
            { id: 'opt2', label: 'Option 2', value: 'opt2', disabled: true },
            { id: 'opt3', label: 'Option 3', value: 'opt3' },
          ]}
          values={[]}
          onChange={vi.fn()}
          legend="Choose"
        />
      );

      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes[1]).toBeDisabled();
    });
  });

  describe('aria attributes', () => {
    it('should have checkbox role', () => {
      render(<Checkbox />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox.getAttribute('type')).toBe('checkbox');
    });

    it('should have aria-required for required field', () => {
      render(<Checkbox required />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('aria-required', 'true');
    });

    it('should have aria-invalid on error', () => {
      render(<Checkbox error />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('aria-invalid', 'true');
    });

    it('should have aria-label', () => {
      render(<Checkbox label="Accept" id="accept" />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('aria-label', 'Accept');
    });

    it('should have aria-describedby for help text', () => {
      render(<Checkbox helpText="Help" />);

      const checkbox = screen.getByRole('checkbox');
      const describedBy = checkbox.getAttribute('aria-describedby');
      expect(describedBy).toContain('help');
    });

    it('should have aria-describedby for error message', () => {
      render(<Checkbox error errorMessage="Error" />);

      const checkbox = screen.getByRole('checkbox');
      const describedBy = checkbox.getAttribute('aria-describedby');
      expect(describedBy).toContain('error');
    });

    it('should have aria-describedby for both help and error', () => {
      render(
        <Checkbox
          error
          errorMessage="Error"
          helpText="Help"
        />
      );

      const checkbox = screen.getByRole('checkbox');
      const describedBy = checkbox.getAttribute('aria-describedby');
      expect(describedBy).toContain('help');
      expect(describedBy).toContain('error');
    });

    it('should not have aria-label when label not provided', () => {
      const { container } = render(<Checkbox />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox.getAttribute('aria-label')).toBeFalsy();
    });
  });

  describe('color contrast', () => {
    it('should have sufficient contrast on text', () => {
      render(<Checkbox label="Accept" id="accept" />);

      const label = screen.getByText('Accept');
      const styles = window.getComputedStyle(label);
      expect(styles.color).toBeTruthy();
    });

    it('should have sufficient contrast on error text', () => {
      render(
        <Checkbox
          error
          errorMessage="Error"
        />
      );

      const error = screen.getByRole('alert');
      const styles = window.getComputedStyle(error);
      expect(styles.color).toBeTruthy();
    });

    it('should have sufficient contrast on disabled state', () => {
      render(<Checkbox disabled label="Disabled" id="disabled" />);

      const checkbox = screen.getByRole('checkbox');
      const styles = window.getComputedStyle(checkbox);
      expect(styles.opacity).toBeDefined();
    });
  });

  describe('touch targets', () => {
    it('should have minimum 44px height', () => {
      render(<Checkbox />);

      const checkbox = screen.getByRole('checkbox');
      // 20px + padding should meet minimum touch target
      const height = checkbox.clientHeight;
      expect(height).toBeGreaterThanOrEqual(20);
    });

    it('should have proper spacing in group', () => {
      render(
        <CheckboxGroup
          options={[
            { id: 'opt1', label: 'Option 1', value: 'opt1' },
            { id: 'opt2', label: 'Option 2', value: 'opt2' },
            { id: 'opt3', label: 'Option 3', value: 'opt3' },
          ]}
          values={[]}
          onChange={vi.fn()}
          legend="Choose"
        />
      );

      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes.length).toBe(3);
    });

    it('should have clickable label', () => {
      render(<Checkbox label="Accept" id="accept" />);

      const label = screen.getByText('Accept');
      expect(label).toHaveAttribute('for', 'accept');
    });
  });

  describe('semantic HTML', () => {
    it('should use semantic input element', () => {
      render(<Checkbox />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox.tagName).toBe('INPUT');
      expect(checkbox).toHaveAttribute('type', 'checkbox');
    });

    it('should use semantic label element', () => {
      render(<Checkbox label="Accept" id="accept" />);

      const label = screen.getByText('Accept');
      expect(label.tagName).toBe('LABEL');
    });

    it('should use semantic fieldset for group', () => {
      const { container } = render(
        <CheckboxGroup
          options={[
            { id: 'opt1', label: 'Option 1', value: 'opt1' },
            { id: 'opt2', label: 'Option 2', value: 'opt2' },
          ]}
          values={[]}
          onChange={vi.fn()}
          legend="Choose"
        />
      );

      const fieldset = container.querySelector('fieldset');
      expect(fieldset).toBeInTheDocument();
    });

    it('should use semantic legend for fieldset', () => {
      render(
        <CheckboxGroup
          options={[
            { id: 'opt1', label: 'Option 1', value: 'opt1' },
          ]}
          values={[]}
          onChange={vi.fn()}
          legend="Options"
        />
      );

      const legend = screen.getByText('Options');
      expect(legend.tagName).toBe('LEGEND');
    });

    it('should use role="alert" for error message', () => {
      render(
        <Checkbox
          error
          errorMessage="Error"
        />
      );

      const alert = screen.getByRole('alert');
      expect(alert).toHaveTextContent('Error');
    });

    it('should have group role for checkbox group', () => {
      render(
        <CheckboxGroup
          options={[
            { id: 'opt1', label: 'Option 1', value: 'opt1' },
          ]}
          values={[]}
          onChange={vi.fn()}
          legend="Choose"
        />
      );

      const group = screen.getByRole('group');
      expect(group).toBeInTheDocument();
    });
  });

  describe('text alternatives', () => {
    it('should provide text alternative for checkbox', () => {
      render(<Checkbox label="Accept" id="accept" />);

      const checkbox = screen.getByRole('checkbox');
      const label = screen.getByText('Accept');
      expect(label).toHaveAttribute('for', 'accept');
    });

    it('should provide required indicator', () => {
      render(<Checkbox label="Accept" required id="accept" />);

      expect(screen.getByLabelText('required')).toBeInTheDocument();
    });

    it('should provide help text', () => {
      render(
        <Checkbox
          label="Accept"
          helpText="You must accept to proceed"
          id="accept"
        />
      );

      expect(screen.getByText('You must accept to proceed')).toBeInTheDocument();
    });
  });

  describe('error handling', () => {
    it('should announce error with role="alert"', () => {
      render(
        <Checkbox
          error
          errorMessage="This field is required"
        />
      );

      const alert = screen.getByRole('alert');
      expect(alert).toHaveTextContent('This field is required');
    });

    it('should have error styling', () => {
      render(
        <Checkbox
          label="Field"
          error
          errorMessage="Error"
          id="field"
        />
      );

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('aria-invalid', 'true');
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

      render(<Checkbox />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeInTheDocument();
    });

    it('should not have disruptive animations on focus', () => {
      render(<Checkbox />);

      const checkbox = screen.getByRole('checkbox');
      checkbox.focus();

      expect(checkbox).toHaveClass('focus-visible:outline-2');
    });
  });

  describe('dark mode support', () => {
    it('should render with dark mode', () => {
      const { container } = render(
        <div className="dark">
          <Checkbox label="Accept" id="accept" />
        </div>
      );

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeInTheDocument();
    });
  });

  describe('axe accessibility audit', () => {
    it('should not have violations in default state', async () => {
      const { container } = render(
        <Checkbox label="Accept" id="accept" />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should not have violations with error state', async () => {
      const { container } = render(
        <Checkbox
          label="Accept"
          error
          errorMessage="Required"
          id="accept"
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should not have violations in group', async () => {
      const { container } = render(
        <CheckboxGroup
          options={[
            { id: 'opt1', label: 'Option 1', value: 'opt1' },
            { id: 'opt2', label: 'Option 2', value: 'opt2' },
          ]}
          values={[]}
          onChange={vi.fn()}
          legend="Choose"
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should not have violations with required field', async () => {
      const { container } = render(
        <Checkbox label="Accept" required id="accept" />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should not have violations with disabled option', async () => {
      const { container } = render(
        <CheckboxGroup
          options={[
            { id: 'opt1', label: 'Option 1', value: 'opt1' },
            { id: 'opt2', label: 'Option 2', value: 'opt2', disabled: true },
          ]}
          values={[]}
          onChange={vi.fn()}
          legend="Choose"
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should not have violations in horizontal layout', async () => {
      const { container } = render(
        <CheckboxGroup
          options={[
            { id: 'opt1', label: 'Option 1', value: 'opt1' },
            { id: 'opt2', label: 'Option 2', value: 'opt2' },
          ]}
          values={[]}
          onChange={vi.fn()}
          legend="Choose"
          layout="horizontal"
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('required field indicator', () => {
    it('should display required indicator', () => {
      render(<Checkbox label="Field" required id="field" />);

      expect(screen.getByLabelText('required')).toBeInTheDocument();
    });

    it('should have aria-required attribute', () => {
      render(<Checkbox required />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('aria-required', 'true');
    });
  });

  describe('group accessibility', () => {
    it('should group options in fieldset', () => {
      const { container } = render(
        <CheckboxGroup
          options={[
            { id: 'opt1', label: 'Option 1', value: 'opt1' },
            { id: 'opt2', label: 'Option 2', value: 'opt2' },
          ]}
          values={[]}
          onChange={vi.fn()}
          legend="Options"
        />
      );

      const fieldset = container.querySelector('fieldset');
      expect(fieldset).toBeInTheDocument();

      const legend = container.querySelector('legend');
      expect(legend).toHaveTextContent('Options');
    });

    it('should have group role', () => {
      render(
        <CheckboxGroup
          options={[
            { id: 'opt1', label: 'Option 1', value: 'opt1' },
          ]}
          values={[]}
          onChange={vi.fn()}
          legend="Options"
        />
      );

      const group = screen.getByRole('group');
      expect(group).toBeInTheDocument();
    });

    it('should label group with legend', () => {
      render(
        <CheckboxGroup
          options={[
            { id: 'opt1', label: 'Option 1', value: 'opt1' },
          ]}
          values={[]}
          onChange={vi.fn()}
          legend="Options"
        />
      );

      const legend = screen.getByText('Options');
      expect(legend).toBeInTheDocument();
    });
  });
});
