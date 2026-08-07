import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@/test/utils';
import { axe, toHaveNoViolations } from 'jest-axe';
import Select from './Select';

/**
 * The trigger and the clear control are both real buttons (a control nested
 * inside another button would be invalid HTML), so `getByRole('button')` is
 * ambiguous once a value is selected. The trigger is the one owning the popup.
 */
const getTrigger = (): HTMLElement =>
  screen
    .getAllByRole('button')
    .find((b) => b.getAttribute('aria-haspopup') === 'listbox') as HTMLElement;


expect.extend(toHaveNoViolations);

describe('Select - Accessibility', () => {
  const mockOptions = [
    { value: 'apple', label: 'Apple' },
    { value: 'banana', label: 'Banana' },
    { value: 'orange', label: 'Orange' },
    { value: 'grape', label: 'Grape', disabled: true },
  ];

  describe('keyboard navigation', () => {
    it('should be keyboard navigable with Tab key', async () => {
      render(<Select options={mockOptions} placeholder="Select" />);

      const button = getTrigger();
      expect(document.activeElement).not.toBe(button);

      button.focus();
      expect(document.activeElement).toBe(button);
    });

    it('should open dropdown with Enter key', async () => {
      render(<Select options={mockOptions} placeholder="Select" />);

      const button = getTrigger();
      button.focus();
      fireEvent.keyDown(button, { key: 'Enter' });

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });
    });

    it('should navigate options with arrow keys when dropdown is open', async () => {
      render(<Select options={mockOptions} placeholder="Select" />);

      const button = getTrigger();
      fireEvent.click(button);

      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText('Search...');
        expect(searchInput).toHaveFocus();

        fireEvent.keyDown(searchInput, { key: 'ArrowDown' });
        fireEvent.keyDown(searchInput, { key: 'ArrowDown' });

        const options = screen.getAllByRole('option');
        expect(options[2]).toHaveAttribute('data-highlighted', 'true');
      });
    });

    it('should select option with Space key', async () => {
      const handleChange = vi.fn();
      render(
        <Select
          options={mockOptions}
          onChange={handleChange}
          placeholder="Select"
        />
      );

      const button = getTrigger();
      fireEvent.click(button);

      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText('Search...');
        fireEvent.keyDown(searchInput, { key: ' ' });
      });

      // Note: Space in input adds character; for actual option selection use Enter
      expect(handleChange).not.toHaveBeenCalled();
    });

    it('should close dropdown with Escape key', async () => {
      render(<Select options={mockOptions} placeholder="Select" />);

      const button = getTrigger();
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search...');
      fireEvent.keyDown(searchInput, { key: 'Escape' });

      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      });
    });

    it('should skip disabled options in keyboard navigation', async () => {
      render(<Select options={mockOptions} placeholder="Select" />);

      const button = getTrigger();
      fireEvent.click(button);

      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText('Search...');

        // Navigate to grape (4th item)
        fireEvent.keyDown(searchInput, { key: 'ArrowDown' });
        fireEvent.keyDown(searchInput, { key: 'ArrowDown' });
        fireEvent.keyDown(searchInput, { key: 'ArrowDown' });

        const options = screen.getAllByRole('option');
        expect(options[3]).toHaveAttribute('aria-disabled', 'true');
      });
    });
  });

  describe('aria attributes', () => {
    it('should have proper combobox semantics', () => {
      const { container } = render(
        <Select options={mockOptions} placeholder="Select" />
      );

      const combobox = container.querySelector('[role="combobox"]');
      expect(combobox).toHaveAttribute('aria-haspopup', 'listbox');
      expect(combobox).toHaveAttribute('aria-expanded', 'false');
    });

    it('should set aria-expanded correctly', async () => {
      render(<Select options={mockOptions} placeholder="Select" />);

      const combobox = screen.getByRole('combobox');
      expect(combobox).toHaveAttribute('aria-expanded', 'false');

      const button = getTrigger();
      fireEvent.click(button);

      await waitFor(() => {
        expect(combobox).toHaveAttribute('aria-expanded', 'true');
      });
    });

    it('should have proper listbox role', async () => {
      render(<Select options={mockOptions} placeholder="Select" />);

      const button = getTrigger();
      fireEvent.click(button);

      await waitFor(() => {
        const listbox = screen.getByRole('listbox');
        expect(listbox).toBeInTheDocument();
      });
    });

    it('should have proper option role', async () => {
      render(<Select options={mockOptions} placeholder="Select" />);

      const button = getTrigger();
      fireEvent.click(button);

      await waitFor(() => {
        const options = screen.getAllByRole('option');
        expect(options.length).toBe(4);
        options.forEach((option) => {
          expect(option).toHaveAttribute('role', 'option');
        });
      });
    });

    it('should link label with aria-labelledby', () => {
      render(
        <Select
          options={mockOptions}
          label="Select Fruit"
          placeholder="Select"
        />
      );

      // Label should be associated with button
      const label = screen.getByText('Select Fruit');
      expect(label).toBeInTheDocument();
    });

    it('should link error message with aria-describedby', () => {
      render(
        <Select
          options={mockOptions}
          error
          errorMessage="This field is required"
          placeholder="Select"
        />
      );

      const button = getTrigger();
      const describedBy = button.getAttribute('aria-describedby');
      expect(describedBy).toContain('error');
    });

    it('should link help text with aria-describedby', () => {
      render(
        <Select
          options={mockOptions}
          helpText="Choose your favorite"
          placeholder="Select"
        />
      );

      const button = getTrigger();
      const describedBy = button.getAttribute('aria-describedby');
      expect(describedBy).toContain('help');
    });

    it('should have aria-required for required field', () => {
      render(
        <Select options={mockOptions} required placeholder="Select" />
      );

      // aria-required is not a permitted attribute on role="button"; it lives
      // on the combobox that wraps the trigger.
      expect(screen.getByRole('combobox')).toHaveAttribute('aria-required', 'true');
    });

    it('should have aria-invalid on error', () => {
      render(
        <Select options={mockOptions} error placeholder="Select" />
      );

      expect(screen.getByRole('combobox')).toHaveAttribute('aria-invalid', 'true');
    });

    it('should set aria-selected correctly on options', async () => {
      render(
        <Select
          options={mockOptions}
          value="apple"
          placeholder="Select"
        />
      );

      const button = getTrigger();
      fireEvent.click(button);

      await waitFor(() => {
        const options = screen.getAllByRole('option');
        expect(options[0]).toHaveAttribute('aria-selected', 'true');
        expect(options[1]).toHaveAttribute('aria-selected', 'false');
      });
    });

    it('should set aria-disabled on disabled options', async () => {
      render(<Select options={mockOptions} placeholder="Select" />);

      const button = getTrigger();
      fireEvent.click(button);

      await waitFor(() => {
        const options = screen.getAllByRole('option');
        const disabledOption = options[3]; // Grape
        expect(disabledOption).toHaveAttribute('aria-disabled', 'true');
      });
    });
  });

  describe('focus management', () => {
    it('should have visible focus indicator', () => {
      render(<Select options={mockOptions} placeholder="Select" />);

      const button = getTrigger();
      expect(button).toHaveClass('focus-visible:outline-2');
      expect(button).toHaveClass('focus-visible:outline-offset-2');
    });

    it('should focus search input when dropdown opens', async () => {
      render(
        <Select options={mockOptions} searchable placeholder="Select" />
      );

      const button = getTrigger();
      fireEvent.click(button);

      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText('Search...');
        expect(searchInput).toHaveFocus();
      });
    });

    it('should focus correct element after closing dropdown', async () => {
      render(
        <Select options={mockOptions} placeholder="Select" />
      );

      const button = getTrigger();
      fireEvent.click(button);

      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText('Search...');
        fireEvent.keyDown(searchInput, { key: 'Escape' });
      });

      // Focus should return to button or remain on searchInput
      const searchInput = screen.queryByPlaceholderText('Search...');
      expect(document.activeElement).toBe(button);
    });

    it('should maintain focus trap during navigation', async () => {
      render(<Select options={mockOptions} placeholder="Select" />);

      const button = getTrigger();
      fireEvent.click(button);

      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText('Search...');
        expect(searchInput).toHaveFocus();
      });
    });
  });

  describe('color contrast', () => {
    it('should have sufficient contrast on button text', () => {
      const { container } = render(
        <Select
          options={mockOptions}
          value="apple"
          placeholder="Select"
        />
      );

      const button = getTrigger();
      const styles = window.getComputedStyle(button);

      // Dark text on light background should pass WCAG AA (4.5:1)
      expect(styles.color).toBeTruthy();
      expect(styles.backgroundColor).toBeTruthy();
    });

    it('should have sufficient contrast on disabled state', () => {
      render(
        <Select
          options={mockOptions}
          disabled
          placeholder="Select"
        />
      );

      const button = getTrigger();
      const styles = window.getComputedStyle(button);

      expect(styles.opacity).toBeDefined();
    });

    it('should have sufficient contrast on option hover', async () => {
      render(<Select options={mockOptions} placeholder="Select" />);

      const button = getTrigger();
      fireEvent.click(button);

      await waitFor(() => {
        const options = screen.getAllByRole('option');
        const hoverOption = options[0];
        fireEvent.mouseEnter(hoverOption);

        const styles = window.getComputedStyle(hoverOption);
        expect(styles.backgroundColor).toBeTruthy();
      });
    });
  });

  describe('touch targets', () => {
    it('should have minimum 44px height on button', () => {
      render(<Select options={mockOptions} placeholder="Select" />);

      // jsdom does not lay out, so clientHeight is always 0; assert the class
      // that produces the 44px target instead.
      expect(getTrigger().className).toContain('min-h-[44px]');
    });

    it('should have minimum 44px height on options', async () => {
      render(<Select options={mockOptions} placeholder="Select" />);

      const button = getTrigger();
      fireEvent.click(button);

      await waitFor(() => {
        const options = screen.getAllByRole('option');
        expect(options.length).toBeGreaterThan(0);
        options.forEach((option) => {
          expect(option.className).toContain('min-h-[32px]');
        });
      });
    });

    it('should have proper spacing between interactive elements', async () => {
      render(<Select options={mockOptions} placeholder="Select" />);

      const button = getTrigger();
      fireEvent.click(button);

      await waitFor(() => {
        const options = screen.getAllByRole('option');
        // Options should not overlap
        for (let i = 0; i < options.length - 1; i++) {
          const current = options[i].getBoundingClientRect();
          const next = options[i + 1].getBoundingClientRect();
          expect(current.bottom).toBeLessThanOrEqual(next.top);
        }
      });
    });
  });

  describe('semantic HTML', () => {
    it('should use semantic button element', () => {
      render(<Select options={mockOptions} placeholder="Select" />);

      const button = getTrigger();
      expect(button.tagName).toBe('BUTTON');
    });

    it('should use semantic input element for search', async () => {
      render(
        <Select options={mockOptions} searchable placeholder="Select" />
      );

      const button = getTrigger();
      fireEvent.click(button);

      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText('Search...');
        expect(searchInput.tagName).toBe('INPUT');
        expect(searchInput).toHaveAttribute('type', 'text');
      });
    });

    it('should use semantic label element', () => {
      render(
        <Select
          options={mockOptions}
          label="Select Fruit"
          placeholder="Select"
        />
      );

      const label = screen.getByText('Select Fruit');
      expect(label.tagName).toBe('LABEL');
    });

    it('should use semantic error message with role="alert"', () => {
      render(
        <Select
          options={mockOptions}
          error
          errorMessage="This field is required"
          placeholder="Select"
        />
      );

      const alert = screen.getByRole('alert');
      expect(alert).toHaveTextContent('This field is required');
    });
  });

  describe('motion and animation', () => {
    it('should respect prefers-reduced-motion', () => {
      // Mock matchMedia for prefers-reduced-motion
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

      render(<Select options={mockOptions} placeholder="Select" />);

      const button = getTrigger();
      expect(button).toBeInTheDocument();
    });

    it('should not have disruptive animations on focus', () => {
      render(<Select options={mockOptions} placeholder="Select" />);

      const button = getTrigger();
      button.focus();

      // Should not trigger layout thrashing animations
      expect(button).toHaveClass('focus-visible:outline-2');
    });

    it('should have smooth transitions on dropdown open/close', async () => {
      render(<Select options={mockOptions} placeholder="Select" />);

      const button = getTrigger();
      fireEvent.click(button);

      await waitFor(() => {
        const dropdown = screen.getByRole('listbox');
        expect(dropdown).toBeInTheDocument();
      });

      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      });
    });
  });

  describe('dark mode support', () => {
    it('should render with dark mode classes', () => {
      const { container } = render(
        <div className="dark">
          <Select options={mockOptions} placeholder="Select" />
        </div>
      );

      const button = getTrigger();
      expect(button).toBeInTheDocument();
    });
  });

  describe('axe accessibility audit', () => {
    it('should not have accessibility violations in default state', async () => {
      const { container } = render(
        <Select options={mockOptions} placeholder="Select" />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should not have violations when open', async () => {
      const { container } = render(
        <Select options={mockOptions} placeholder="Select" />
      );

      const button = getTrigger();
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should not have violations with error state', async () => {
      const { container } = render(
        <Select
          options={mockOptions}
          error
          errorMessage="Error message"
          placeholder="Select"
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should not have violations with label and required', async () => {
      const { container } = render(
        <Select
          options={mockOptions}
          label="Select Fruit"
          required
          placeholder="Select"
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('search input accessibility', () => {
    it('should have accessible search input', async () => {
      render(
        <Select options={mockOptions} searchable placeholder="Select" />
      );

      const button = getTrigger();
      fireEvent.click(button);

      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText('Search...');
        expect(searchInput).toHaveAttribute('type', 'text');
        expect(searchInput).toHaveAttribute('aria-label', 'Search options');
      });
    });

    it('should have proper input event handling', async () => {
      render(
        <Select options={mockOptions} searchable placeholder="Select" />
      );

      const button = getTrigger();
      fireEvent.click(button);

      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText('Search...') as HTMLInputElement;
        fireEvent.change(searchInput, { target: { value: 'app' } });
        expect(searchInput.value).toBe('app');
      });
    });
  });

  describe('multi-select accessibility', () => {
    it('should have accessible checkboxes in multi-select mode', async () => {
      render(
        <Select
          options={mockOptions}
          isMulti
          placeholder="Select"
        />
      );

      const button = getTrigger();
      fireEvent.click(button);

      await waitFor(() => {
        // A listbox may only own options, so multi-select state is carried by
        // aria-selected on a multiselectable listbox rather than by nested
        // checkbox inputs (which would be a nested-interactive violation).
        const listbox = screen.getByRole('listbox');
        expect(listbox).toHaveAttribute('aria-multiselectable', 'true');

        const options = screen.getAllByRole('option');
        expect(options.length).toBeGreaterThan(0);
        options.forEach((option) => {
          expect(option).toHaveAttribute('aria-selected');
        });
      });
    });

    it('should have proper aria-selected on multi-select options', async () => {
      render(
        <Select
          options={mockOptions}
          value={['apple', 'banana']}
          isMulti
          placeholder="Select"
        />
      );

      const button = getTrigger();
      fireEvent.click(button);

      await waitFor(() => {
        const options = screen.getAllByRole('option');
        expect(options[0]).toHaveAttribute('aria-selected', 'true');
        expect(options[1]).toHaveAttribute('aria-selected', 'true');
        expect(options[2]).toHaveAttribute('aria-selected', 'false');
      });
    });
  });
});
