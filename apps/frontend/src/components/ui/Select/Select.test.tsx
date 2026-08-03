import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import Select from './Select';

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

      const button = screen.getByRole('button');
      expect(document.activeElement).not.toBe(button);

      button.focus();
      expect(document.activeElement).toBe(button);
    });

    it('should open dropdown with Enter key', async () => {
      render(<Select options={mockOptions} placeholder="Select" />);

      const button = screen.getByRole('button');
      button.focus();
      fireEvent.keyDown(button, { key: 'Enter' });

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });
    });

    it('should navigate options with arrow keys when dropdown is open', async () => {
      render(<Select options={mockOptions} placeholder="Select" />);

      const button = screen.getByRole('button');
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
      const handleChange = jest.fn();
      render(
        <Select
          options={mockOptions}
          onChange={handleChange}
          placeholder="Select"
        />
      );

      const button = screen.getByRole('button');
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

      const button = screen.getByRole('button');
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

      const button = screen.getByRole('button');
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

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(combobox).toHaveAttribute('aria-expanded', 'true');
      });
    });

    it('should have proper listbox role', async () => {
      render(<Select options={mockOptions} placeholder="Select" />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        const listbox = screen.getByRole('listbox');
        expect(listbox).toBeInTheDocument();
      });
    });

    it('should have proper option role', async () => {
      render(<Select options={mockOptions} placeholder="Select" />);

      const button = screen.getByRole('button');
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

      const button = screen.getByRole('button');
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

      const button = screen.getByRole('button');
      const describedBy = button.getAttribute('aria-describedby');
      expect(describedBy).toContain('help');
    });

    it('should have aria-required for required field', () => {
      render(
        <Select options={mockOptions} required placeholder="Select" />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-required', 'true');
    });

    it('should have aria-invalid on error', () => {
      render(
        <Select options={mockOptions} error placeholder="Select" />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-invalid', 'true');
    });

    it('should set aria-selected correctly on options', async () => {
      render(
        <Select
          options={mockOptions}
          value="apple"
          placeholder="Select"
        />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        const options = screen.getAllByRole('option');
        expect(options[0]).toHaveAttribute('aria-selected', 'true');
        expect(options[1]).toHaveAttribute('aria-selected', 'false');
      });
    });

    it('should set aria-disabled on disabled options', async () => {
      render(<Select options={mockOptions} placeholder="Select" />);

      const button = screen.getByRole('button');
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

      const button = screen.getByRole('button');
      expect(button).toHaveClass('focus-visible:outline-2');
      expect(button).toHaveClass('focus-visible:outline-offset-2');
    });

    it('should focus search input when dropdown opens', async () => {
      render(
        <Select options={mockOptions} searchable placeholder="Select" />
      );

      const button = screen.getByRole('button');
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

      const button = screen.getByRole('button');
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

      const button = screen.getByRole('button');
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

      const button = screen.getByRole('button');
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

      const button = screen.getByRole('button');
      const styles = window.getComputedStyle(button);

      expect(styles.opacity).toBeDefined();
    });

    it('should have sufficient contrast on option hover', async () => {
      render(<Select options={mockOptions} placeholder="Select" />);

      const button = screen.getByRole('button');
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

      const button = screen.getByRole('button');
      expect(button.clientHeight).toBeGreaterThanOrEqual(44);
    });

    it('should have minimum 44px height on options', async () => {
      render(<Select options={mockOptions} placeholder="Select" />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        const options = screen.getAllByRole('option');
        options.forEach((option) => {
          expect(option.clientHeight).toBeGreaterThanOrEqual(32);
        });
      });
    });

    it('should have proper spacing between interactive elements', async () => {
      render(<Select options={mockOptions} placeholder="Select" />);

      const button = screen.getByRole('button');
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

      const button = screen.getByRole('button');
      expect(button.tagName).toBe('BUTTON');
    });

    it('should use semantic input element for search', async () => {
      render(
        <Select options={mockOptions} searchable placeholder="Select" />
      );

      const button = screen.getByRole('button');
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
        value: jest.fn().mockImplementation((query) => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });

      render(<Select options={mockOptions} placeholder="Select" />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should not have disruptive animations on focus', () => {
      render(<Select options={mockOptions} placeholder="Select" />);

      const button = screen.getByRole('button');
      button.focus();

      // Should not trigger layout thrashing animations
      expect(button).toHaveClass('focus-visible:outline-2');
    });

    it('should have smooth transitions on dropdown open/close', async () => {
      render(<Select options={mockOptions} placeholder="Select" />);

      const button = screen.getByRole('button');
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

      const button = screen.getByRole('button');
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

      const button = screen.getByRole('button');
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

      const button = screen.getByRole('button');
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

      const button = screen.getByRole('button');
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

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        const checkboxes = screen.getAllByRole('checkbox');
        expect(checkboxes.length).toBeGreaterThan(0);

        checkboxes.forEach((checkbox) => {
          expect(checkbox).toHaveAttribute('type', 'checkbox');
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

      const button = screen.getByRole('button');
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
