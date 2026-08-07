import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, renderHook, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Select from './Select';
import * as useSelectModule from './useSelect';

/**
 * The trigger and the clear control are both real buttons (a control nested
 * inside another button would be invalid HTML), so `getByRole('button')` is
 * ambiguous once a value is selected. The trigger is the one owning the popup.
 */
const getTrigger = (): HTMLElement =>
  screen
    .getAllByRole('button')
    .find((b) => b.getAttribute('aria-haspopup') === 'listbox') as HTMLElement;

describe('Select', () => {
  const mockOptions = [
    { value: 'apple', label: 'Apple' },
    { value: 'banana', label: 'Banana' },
    { value: 'orange', label: 'Orange' },
    { value: 'grape', label: 'Grape', disabled: true },
  ];

  describe('rendering', () => {
    it('should render with placeholder when no value provided', () => {
      render(<Select options={mockOptions} placeholder="Select a fruit" />);
      const button = getTrigger();
      expect(button).toHaveTextContent('Select a fruit');
    });

    it('should render with label when provided', () => {
      render(
        <Select
          options={mockOptions}
          label="Choose Fruit"
          required
        />
      );
      const label = screen.getByText('Choose Fruit');
      expect(label).toBeInTheDocument();
      expect(screen.getByLabelText('required')).toBeInTheDocument();
    });

    it('should render selected value', () => {
      render(
        <Select
          options={mockOptions}
          value="apple"
          placeholder="Select"
        />
      );
      expect(getTrigger()).toHaveTextContent('Apple');
    });

    it('should render multiple selected values as count', () => {
      render(
        <Select
          options={mockOptions}
          value={['apple', 'banana']}
          isMulti
          placeholder="Select"
        />
      );
      expect(getTrigger()).toHaveTextContent('2 selected');
    });

    it('should render with disabled state', () => {
      render(
        <Select options={mockOptions} disabled placeholder="Select" />
      );
      const button = getTrigger();
      expect(button).toBeDisabled();
    });

    it('should render loading state', () => {
      render(
        <Select options={mockOptions} isLoading placeholder="Select" />
      );
      expect(getTrigger()).toHaveTextContent('Loading...');
    });

    it('should render error state', () => {
      render(
        <Select
          options={mockOptions}
          error
          errorMessage="This field is required"
          placeholder="Select"
        />
      );
      expect(screen.getByRole('alert')).toHaveTextContent('This field is required');
    });

    it('should render help text', () => {
      render(
        <Select
          options={mockOptions}
          helpText="Choose your favorite fruit"
          placeholder="Select"
        />
      );
      expect(screen.getByText('Choose your favorite fruit')).toBeInTheDocument();
    });

    it('should render with custom id', () => {
      render(
        <Select
          options={mockOptions}
          id="fruit-select"
          placeholder="Select"
        />
      );
      expect(getTrigger()).toHaveAttribute('id', 'fruit-select');
    });
  });

  describe('dropdown interaction', () => {
    it('should open dropdown on button click', async () => {
      render(<Select options={mockOptions} placeholder="Select" />);
      const button = getTrigger();
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });
    });

    it('should close dropdown on button click when open', async () => {
      render(<Select options={mockOptions} placeholder="Select" />);
      const button = getTrigger();

      fireEvent.click(button);
      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });

      fireEvent.click(button);
      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      });
    });

    it('should not open when disabled', () => {
      render(
        <Select options={mockOptions} disabled placeholder="Select" />
      );
      const button = getTrigger();
      fireEvent.click(button);

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('should not open when loading', () => {
      render(
        <Select options={mockOptions} isLoading placeholder="Select" />
      );
      const button = getTrigger();
      fireEvent.click(button);

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('should close dropdown when clicking outside', async () => {
      render(
        <div>
          <Select options={mockOptions} placeholder="Select" />
          <button>Outside</button>
        </div>
      );

      const selectButton = screen.getAllByRole('button')[0];
      fireEvent.click(selectButton);

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });

      const outsideButton = screen.getByText('Outside');
      fireEvent.mouseDown(outsideButton);

      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      });
    });
  });

  describe('option selection', () => {
    it('should select single option', async () => {
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
        const options = screen.getAllByRole('option');
        fireEvent.click(options[0]);
      });

      expect(handleChange).toHaveBeenCalledWith('apple');
    });

    it('should close dropdown after single selection', async () => {
      render(
        <Select options={mockOptions} placeholder="Select" />
      );

      const button = getTrigger();
      fireEvent.click(button);

      await waitFor(() => {
        const options = screen.getAllByRole('option');
        fireEvent.click(options[0]);
      });

      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      });
    });

    it('should select multiple options in multi-select mode', async () => {
      const handleChange = vi.fn();
      // Select is controlled, so the parent must hold the value for a second
      // selection to accumulate rather than replace the first.
      const Harness = () => {
        const [value, setValue] = React.useState<string[]>([]);
        return (
          <Select
            options={mockOptions}
            value={value}
            onChange={(v) => {
              setValue(v as string[]);
              handleChange(v);
            }}
            isMulti
            placeholder="Select"
          />
        );
      };
      render(<Harness />);

      const button = getTrigger();
      fireEvent.click(button);

      await waitFor(() => {
        const options = screen.getAllByRole('option');
        fireEvent.click(options[0]);
        fireEvent.click(options[1]);
      });

      expect(handleChange).toHaveBeenCalledWith(['apple']);
      expect(handleChange).toHaveBeenLastCalledWith(['apple', 'banana']);
    });

    it('should not close dropdown after selection in multi-select mode', async () => {
      render(
        <Select options={mockOptions} isMulti placeholder="Select" />
      );

      const button = getTrigger();
      fireEvent.click(button);

      await waitFor(() => {
        const options = screen.getAllByRole('option');
        fireEvent.click(options[0]);
      });

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });
    });

    it('should not select disabled option', async () => {
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
        const options = screen.getAllByRole('option');
        const disabledOption = options.find(
          (opt) => opt.getAttribute('aria-disabled') === 'true'
        );
        fireEvent.click(disabledOption!);
      });

      expect(handleChange).not.toHaveBeenCalled();
    });

    it('should deselect option in multi-select mode', async () => {
      const handleChange = vi.fn();
      render(
        <Select
          options={mockOptions}
          onChange={handleChange}
          value={['apple', 'banana']}
          isMulti
          placeholder="Select"
        />
      );

      const button = getTrigger();
      fireEvent.click(button);

      await waitFor(() => {
        const options = screen.getAllByRole('option');
        fireEvent.click(options[0]);
      });

      expect(handleChange).toHaveBeenCalledWith(['banana']);
    });
  });

  describe('search functionality', () => {
    it('should filter options by search term', async () => {
      render(
        <Select options={mockOptions} searchable placeholder="Select" />
      );

      const button = getTrigger();
      fireEvent.click(button);

      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText('Search...');
        fireEvent.change(searchInput, { target: { value: 'appl' } });
      });

      await waitFor(() => {
        const options = screen.getAllByRole('option');
        expect(options).toHaveLength(1);
        expect(options[0]).toHaveTextContent('Apple');
      });
    });

    it('should show no options message when search finds nothing', async () => {
      render(
        <Select options={mockOptions} searchable placeholder="Select" />
      );

      const button = getTrigger();
      fireEvent.click(button);

      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText('Search...');
        fireEvent.change(searchInput, { target: { value: 'xyz' } });
      });

      await waitFor(() => {
        expect(screen.getByText('No options found')).toBeInTheDocument();
      });
    });

    it('should reset highlighted index on search', async () => {
      render(
        <Select options={mockOptions} searchable placeholder="Select" />
      );

      const button = getTrigger();
      fireEvent.click(button);

      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText('Search...');
        fireEvent.change(searchInput, { target: { value: 'banana' } });
      });

      // The highlighted index should be 0 after search
      await waitFor(() => {
        const options = screen.getAllByRole('option');
        expect(options[0]).toHaveAttribute('data-highlighted', 'true');
      });
    });

    it('should not show search input when searchable is false', () => {
      render(
        <Select
          options={mockOptions}
          searchable={false}
          placeholder="Select"
        />
      );

      const button = getTrigger();
      fireEvent.click(button);

      expect(screen.queryByPlaceholderText('Search...')).not.toBeInTheDocument();
    });
  });

  describe('clear functionality', () => {
    it('should clear selection with clear button', async () => {
      const handleChange = vi.fn();
      render(
        <Select
          options={mockOptions}
          value="apple"
          onChange={handleChange}
          clearable
          placeholder="Select"
        />
      );

      const clearButton = screen.getByLabelText('Clear selection');
      fireEvent.click(clearButton);

      expect(handleChange).toHaveBeenCalledWith('');
    });

    it('should not show clear button when clearable is false', () => {
      render(
        <Select
          options={mockOptions}
          value="apple"
          clearable={false}
          placeholder="Select"
        />
      );

      expect(screen.queryByLabelText('Clear selection')).not.toBeInTheDocument();
    });

    it('should not show clear button when no value selected', () => {
      render(
        <Select
          options={mockOptions}
          value=""
          clearable
          placeholder="Select"
        />
      );

      expect(screen.queryByLabelText('Clear selection')).not.toBeInTheDocument();
    });

    it('should not show clear button in multi-select when empty', () => {
      render(
        <Select
          options={mockOptions}
          value={[]}
          isMulti
          clearable
          placeholder="Select"
        />
      );

      expect(screen.queryByLabelText('Clear selection')).not.toBeInTheDocument();
    });

    it('should clear all selections in multi-select mode', async () => {
      const handleChange = vi.fn();
      render(
        <Select
          options={mockOptions}
          value={['apple', 'banana']}
          onChange={handleChange}
          isMulti
          clearable
          placeholder="Select"
        />
      );

      const clearButton = screen.getByLabelText('Clear selection');
      fireEvent.click(clearButton);

      expect(handleChange).toHaveBeenCalledWith([]);
    });
  });

  describe('keyboard navigation', () => {
    it('should open dropdown with arrow down when closed', async () => {
      render(
        <Select options={mockOptions} placeholder="Select" />
      );

      const button = getTrigger();
      fireEvent.keyDown(button, { key: 'ArrowDown' });

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });
    });

    it('should open dropdown with arrow up when closed', async () => {
      render(
        <Select options={mockOptions} placeholder="Select" />
      );

      const button = getTrigger();
      fireEvent.keyDown(button, { key: 'ArrowUp' });

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });
    });

    it('should navigate options with arrow keys', async () => {
      render(
        <Select options={mockOptions} placeholder="Select" />
      );

      const button = getTrigger();
      fireEvent.click(button);

      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText('Search...');
        fireEvent.keyDown(searchInput, { key: 'ArrowDown' });
      });

      await waitFor(() => {
        const options = screen.getAllByRole('option');
        expect(options[1]).toHaveAttribute('data-highlighted', 'true');
      });
    });

    it('should select option with enter key', async () => {
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
        fireEvent.keyDown(searchInput, { key: 'Enter' });
      });

      expect(handleChange).toHaveBeenCalledWith('apple');
    });

    it('should close dropdown with escape key', async () => {
      render(
        <Select options={mockOptions} placeholder="Select" />
      );

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

    it('should not navigate past first option with arrow up', async () => {
      render(
        <Select options={mockOptions} placeholder="Select" />
      );

      const button = getTrigger();
      fireEvent.click(button);

      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText('Search...');
        fireEvent.keyDown(searchInput, { key: 'ArrowUp' });
        fireEvent.keyDown(searchInput, { key: 'ArrowUp' });
      });

      await waitFor(() => {
        const options = screen.getAllByRole('option');
        expect(options[0]).toHaveAttribute('data-highlighted', 'true');
      });
    });

    it('should not navigate past last option with arrow down', async () => {
      render(
        <Select options={mockOptions} placeholder="Select" />
      );

      const button = getTrigger();
      fireEvent.click(button);

      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText('Search...');
        for (let i = 0; i < 10; i++) {
          fireEvent.keyDown(searchInput, { key: 'ArrowDown' });
        }
      });

      await waitFor(() => {
        const options = screen.getAllByRole('option');
        expect(options[options.length - 1]).toHaveAttribute(
          'data-highlighted',
          'true'
        );
      });
    });
  });

  describe('ref forwarding', () => {
    it('should forward ref to wrapper div', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(
        <Select ref={ref} options={mockOptions} placeholder="Select" />
      );

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe('aria attributes', () => {
    it('should have combobox role', () => {
      render(
        <Select options={mockOptions} placeholder="Select" />
      );

      const combobox = screen.getByRole('combobox');
      expect(combobox).toBeInTheDocument();
    });

    it('should set aria-expanded based on dropdown state', async () => {
      render(
        <Select options={mockOptions} placeholder="Select" />
      );

      const combobox = screen.getByRole('combobox');
      expect(combobox).toHaveAttribute('aria-expanded', 'false');

      const button = getTrigger();
      fireEvent.click(button);

      await waitFor(() => {
        expect(combobox).toHaveAttribute('aria-expanded', 'true');
      });
    });

    it('should set aria-haspopup', () => {
      render(
        <Select options={mockOptions} placeholder="Select" />
      );

      const combobox = screen.getByRole('combobox');
      expect(combobox).toHaveAttribute('aria-haspopup', 'listbox');
    });

    it('should set aria-required for required field', () => {
      render(
        <Select options={mockOptions} required placeholder="Select" />
      );

      // aria-required is not a permitted attribute on role="button"; it lives
      // on the combobox that wraps the trigger.
      expect(screen.getByRole('combobox')).toHaveAttribute('aria-required', 'true');
    });

    it('should set aria-invalid on error', () => {
      render(
        <Select options={mockOptions} error placeholder="Select" />
      );

      expect(screen.getByRole('combobox')).toHaveAttribute('aria-invalid', 'true');
    });

    it('should link aria-describedby to error and help text', () => {
      render(
        <Select
          options={mockOptions}
          errorMessage="Error"
          helpText="Help"
          placeholder="Select"
        />
      );

      const button = getTrigger();
      const describedBy = button.getAttribute('aria-describedby');

      expect(describedBy).toMatch(/error/);
      expect(describedBy).toMatch(/help/);
    });
  });

  describe('option aria attributes', () => {
    it('should set aria-selected for selected options', async () => {
      render(
        <Select options={mockOptions} value="apple" placeholder="Select" />
      );

      const button = getTrigger();
      fireEvent.click(button);

      await waitFor(() => {
        const options = screen.getAllByRole('option');
        expect(options[0]).toHaveAttribute('aria-selected', 'true');
        expect(options[1]).toHaveAttribute('aria-selected', 'false');
      });
    });

    it('should set aria-disabled for disabled options', async () => {
      render(
        <Select options={mockOptions} placeholder="Select" />
      );

      const button = getTrigger();
      fireEvent.click(button);

      await waitFor(() => {
        const options = screen.getAllByRole('option');
        const disabledOption = options.find(
          (opt) => opt.textContent === 'Grape'
        );
        expect(disabledOption).toHaveAttribute('aria-disabled', 'true');
      });
    });
  });

  describe('focus management', () => {
    it('should focus search input when dropdown opens', async () => {
      render(
        <Select options={mockOptions} searchable placeholder="Select" />
      );

      const button = getTrigger();
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search...')).toHaveFocus();
      });
    });

    it('should apply focus-visible class on focus', () => {
      render(
        <Select options={mockOptions} placeholder="Select" />
      );

      const button = getTrigger();
      expect(button).toHaveClass('focus-visible:outline-2');
    });
  });

  describe('useSelect hook', () => {
    it('should manage select state with hook', () => {
      const { useSelect } = useSelectModule;
      // A hook must be exercised with renderHook; render() returns a query
      // object, not a { result } handle, so result.current was always undefined.
      const { result } = renderHook(() =>
        useSelect({ initialValue: '', isMulti: false })
      );

      expect(result.current.value).toBe('');
    });
  });
});
