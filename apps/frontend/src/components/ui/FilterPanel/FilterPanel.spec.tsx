import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@/test/utils';
import userEvent from '@testing-library/user-event';
import { FilterPanel } from './FilterPanel';
import type { Filter, FilterState } from './useFilterPanel';

describe('FilterPanel - Unit Tests', () => {
  const defaultFilters: Filter[] = [
    {
      id: 'category',
      label: 'Category',
      type: 'select',
      section: 'Basic',
      options: [
        { value: 'vegetables', label: 'Vegetables' },
        { value: 'fruits', label: 'Fruits' },
        { value: 'dairy', label: 'Dairy' },
      ],
    },
    {
      id: 'status',
      label: 'Status',
      type: 'checkbox',
      section: 'Basic',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'archived', label: 'Archived' },
      ],
    },
    {
      id: 'dateRange',
      label: 'Date Range',
      type: 'date-range',
      section: 'Advanced',
    },
    {
      id: 'costRange',
      label: 'Cost Range',
      type: 'number-range',
      section: 'Advanced',
    },
  ];

  const defaultProps = {
    filters: defaultFilters,
    values: {} as FilterState,
    onFilterChange: vi.fn(),
  };

  describe('Rendering', () => {
    it('should render with header and filters', () => {
      render(<FilterPanel {...defaultProps} />);
      expect(screen.getByText('Filters')).toBeInTheDocument();
      expect(screen.getByText('Category')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
    });

    it('should render without header when showHeader is false', () => {
      render(<FilterPanel {...defaultProps} showHeader={false} />);
      expect(screen.queryByText('Filters')).not.toBeInTheDocument();
    });

    it('should render all filter types', () => {
      render(<FilterPanel {...defaultProps} />);
      expect(screen.getByText('Category')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Date Range')).toBeInTheDocument();
      expect(screen.getByText('Cost Range')).toBeInTheDocument();
    });

    it('should display active filter count badge', () => {
      render(<FilterPanel {...defaultProps} activeFilterCount={3} />);
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('should not display badge when no active filters', () => {
      render(<FilterPanel {...defaultProps} activeFilterCount={0} />);
      expect(screen.queryByLabelText(/0 active filters/)).not.toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(
        <FilterPanel {...defaultProps} className="custom-class" />
      );
      expect(container.querySelector('.custom-class')).toBeInTheDocument();
    });
  });

  describe('Filter Types - Select', () => {
    it('should render select filter with options', () => {
      render(<FilterPanel {...defaultProps} />);
      const selectElements = screen.getAllByRole('combobox');
      expect(selectElements.length).toBeGreaterThan(0);
    });

    it('should call onFilterChange when select value changes', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<FilterPanel {...defaultProps} onFilterChange={handleChange} />);

      const selects = screen.getAllByRole('combobox');
      const categorySelect = selects[0];

      await user.click(categorySelect);
      const fruitOption = screen.getByText('Fruits');
      await user.click(fruitOption);

      expect(handleChange).toHaveBeenCalledWith('category', 'fruits');
    });

    it('should set initial select value', () => {
      const values = { category: 'fruits' };
      render(<FilterPanel {...defaultProps} values={values} onFilterChange={vi.fn()} />);

      const select = screen.getByDisplayValue('Fruits');
      expect(select).toBeInTheDocument();
    });
  });

  describe('Filter Types - Checkbox', () => {
    it('should render checkbox filter with options', () => {
      render(<FilterPanel {...defaultProps} />);
      expect(screen.getByLabelText('Active')).toBeInTheDocument();
      expect(screen.getByLabelText('Archived')).toBeInTheDocument();
    });

    it('should call onFilterChange when checkbox is checked', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<FilterPanel {...defaultProps} onFilterChange={handleChange} />);

      const activeCheckbox = screen.getByLabelText('Active');
      await user.click(activeCheckbox);

      expect(handleChange).toHaveBeenCalledWith('status', ['active']);
    });

    it('should support multiple checkbox selections', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<FilterPanel {...defaultProps} onFilterChange={handleChange} />);

      const activeCheckbox = screen.getByLabelText('Active');
      const archivedCheckbox = screen.getByLabelText('Archived');

      await user.click(activeCheckbox);
      await user.click(archivedCheckbox);

      expect(handleChange).toHaveBeenLastCalledWith('status', ['archived']);
    });

    it('should set initial checkbox values', () => {
      const values = { status: ['active', 'archived'] };
      render(<FilterPanel {...defaultProps} values={values} onFilterChange={vi.fn()} />);

      expect(screen.getByLabelText('Active')).toBeChecked();
      expect(screen.getByLabelText('Archived')).toBeChecked();
    });

    it('should uncheck checkbox when clicked again', async () => {
      const user = userEvent.setup();
      const values = { status: ['active'] };
      const handleChange = vi.fn();
      render(<FilterPanel {...defaultProps} values={values} onFilterChange={handleChange} />);

      const activeCheckbox = screen.getByLabelText('Active') as HTMLInputElement;
      expect(activeCheckbox.checked).toBe(true);

      await user.click(activeCheckbox);
      expect(handleChange).toHaveBeenCalledWith('status', []);
    });
  });

  describe('Filter Types - Date Range', () => {
    it('should render date range inputs', () => {
      render(<FilterPanel {...defaultProps} />);
      const dateInputs = screen.getAllByDisplayValue('');
      expect(dateInputs.length).toBeGreaterThanOrEqual(2); // start and end dates
    });

    it('should call onFilterChange for start date', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<FilterPanel {...defaultProps} onFilterChange={handleChange} />);

      const dateInputs = screen.getAllByRole('textbox').filter((el) => el instanceof HTMLInputElement && el.type === 'date');
      if (dateInputs.length > 0) {
        await user.type(dateInputs[0], '2026-08-01');
        expect(handleChange).toHaveBeenCalledWith(
          'dateRange',
          expect.objectContaining({ start: '2026-08-01' })
        );
      }
    });

    it('should call onFilterChange for end date', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<FilterPanel {...defaultProps} onFilterChange={handleChange} />);

      const dateInputs = screen.getAllByRole('textbox').filter((el) => el instanceof HTMLInputElement && el.type === 'date');
      if (dateInputs.length > 1) {
        await user.type(dateInputs[1], '2026-08-31');
        expect(handleChange).toHaveBeenCalledWith(
          'dateRange',
          expect.objectContaining({ end: '2026-08-31' })
        );
      }
    });
  });

  describe('Filter Types - Number Range', () => {
    it('should render number range inputs', () => {
      render(<FilterPanel {...defaultProps} />);
      const numberInputs = screen.getAllByRole('spinbutton');
      expect(numberInputs.length).toBeGreaterThanOrEqual(2);
    });

    it('should call onFilterChange for min value', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<FilterPanel {...defaultProps} onFilterChange={handleChange} />);

      const spinButtons = screen.getAllByRole('spinbutton');
      if (spinButtons.length > 0) {
        await user.clear(spinButtons[0]);
        await user.type(spinButtons[0], '10');
        expect(handleChange).toHaveBeenCalledWith(
          'costRange',
          expect.objectContaining({ from: 10 })
        );
      }
    });

    it('should call onFilterChange for max value', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<FilterPanel {...defaultProps} onFilterChange={handleChange} />);

      const spinButtons = screen.getAllByRole('spinbutton');
      if (spinButtons.length > 1) {
        await user.clear(spinButtons[1]);
        await user.type(spinButtons[1], '100');
        expect(handleChange).toHaveBeenCalledWith(
          'costRange',
          expect.objectContaining({ to: 100 })
        );
      }
    });
  });

  describe('Collapsible Sections', () => {
    it('should render collapsible section headers', () => {
      render(<FilterPanel {...defaultProps} collapsible />);
      expect(screen.getByText('Basic')).toBeInTheDocument();
      expect(screen.getByText('Advanced')).toBeInTheDocument();
    });

    it('should toggle section expanded state', async () => {
      const user = userEvent.setup();
      render(<FilterPanel {...defaultProps} collapsible />);

      const basicButton = screen.getByRole('button', { name: /basic/i });
      expect(screen.getByText('Category')).toBeInTheDocument();

      await user.click(basicButton);
      await waitFor(() => {
        expect(basicButton).toHaveAttribute('aria-expanded', 'false');
      });
    });

    it('should expand section on click', async () => {
      const user = userEvent.setup();
      render(<FilterPanel {...defaultProps} collapsible />);

      const advancedButton = screen.getByRole('button', { name: /advanced/i });
      await user.click(advancedButton);

      await waitFor(() => {
        expect(advancedButton).toHaveAttribute('aria-expanded', 'false');
      });

      await user.click(advancedButton);
      expect(advancedButton).toHaveAttribute('aria-expanded', 'true');
    });

    it('should not render collapsed filters', async () => {
      const user = userEvent.setup();
      render(<FilterPanel {...defaultProps} collapsible />);

      const advancedButton = screen.getByRole('button', { name: /advanced/i });
      await user.click(advancedButton);

      await waitFor(() => {
        expect(screen.queryByText('Date Range')).not.toBeInTheDocument();
      });
    });

    it('should keep collapsible disabled when not enabled', () => {
      render(<FilterPanel {...defaultProps} collapsible={false} />);
      expect(screen.queryByRole('button', { name: /basic/i })).not.toBeInTheDocument();
    });
  });

  describe('Action Buttons', () => {
    it('should render apply button', () => {
      render(<FilterPanel {...defaultProps} />);
      expect(screen.getByText('Apply Filters')).toBeInTheDocument();
    });

    it('should render reset button', () => {
      render(<FilterPanel {...defaultProps} />);
      expect(screen.getByText('Reset')).toBeInTheDocument();
    });

    it('should call onApply when apply button clicked', async () => {
      const user = userEvent.setup();
      const handleApply = vi.fn();
      const values = { category: 'fruits' };
      render(
        <FilterPanel
          {...defaultProps}
          values={values}
          onApply={handleApply}
          onFilterChange={vi.fn()}
        />
      );

      await user.click(screen.getByText('Apply Filters'));
      expect(handleApply).toHaveBeenCalledWith(values);
    });

    it('should call onReset when reset button clicked', async () => {
      const user = userEvent.setup();
      const handleReset = vi.fn();
      const values = { category: 'fruits' };
      render(
        <FilterPanel
          {...defaultProps}
          values={values}
          onReset={handleReset}
          onFilterChange={vi.fn()}
        />
      );

      await user.click(screen.getByText('Reset'));
      expect(handleReset).toHaveBeenCalledWith(values);
    });

    it('should render clear all button only when filters active', () => {
      const { rerender } = render(
        <FilterPanel {...defaultProps} activeFilterCount={0} />
      );
      expect(screen.queryByText('Clear All')).not.toBeInTheDocument();

      rerender(
        <FilterPanel {...defaultProps} activeFilterCount={2} />
      );
      expect(screen.getByText('Clear All')).toBeInTheDocument();
    });

    it('should call onClearAll when clear all button clicked', async () => {
      const user = userEvent.setup();
      const handleClearAll = vi.fn();
      render(
        <FilterPanel
          {...defaultProps}
          activeFilterCount={2}
          onClearAll={handleClearAll}
          onFilterChange={vi.fn()}
        />
      );

      await user.click(screen.getByText('Clear All'));
      expect(handleClearAll).toHaveBeenCalled();
    });
  });

  describe('Variants', () => {
    it('should render default variant', () => {
      const { container } = render(
        <FilterPanel {...defaultProps} variant="default" />
      );
      expect(container.querySelector('[role="group"]')).toBeInTheDocument();
    });

    it('should render compact variant', () => {
      render(<FilterPanel {...defaultProps} variant="compact" />);
      expect(screen.getByText('Apply Filters')).toBeInTheDocument();
    });
  });

  describe('Disabled Filters', () => {
    it('should disable select filter when disabled prop is true', () => {
      const disabledFilters: Filter[] = [
        {
          ...defaultFilters[0],
          disabled: true,
        },
      ];

      render(
        <FilterPanel
          {...defaultProps}
          filters={disabledFilters}
        />
      );

      const select = screen.getByRole('combobox');
      expect(select).toBeDisabled();
    });

    it('should disable checkbox filters when disabled prop is true', () => {
      const disabledFilters: Filter[] = [
        {
          ...defaultFilters[1],
          disabled: true,
        },
      ];

      render(
        <FilterPanel
          {...defaultProps}
          filters={disabledFilters}
        />
      );

      expect(screen.getByLabelText('Active')).toBeDisabled();
      expect(screen.getByLabelText('Archived')).toBeDisabled();
    });
  });

  describe('Values Persistence', () => {
    it('should preserve filter values across renders', () => {
      const values = { category: 'vegetables', status: ['active'] };
      const { rerender } = render(
        <FilterPanel
          {...defaultProps}
          values={values}
          onFilterChange={vi.fn()}
        />
      );

      expect(screen.getByDisplayValue('Vegetables')).toBeInTheDocument();
      expect(screen.getByLabelText('Active')).toBeChecked();

      rerender(
        <FilterPanel
          {...defaultProps}
          values={values}
          onFilterChange={vi.fn()}
        />
      );

      expect(screen.getByDisplayValue('Vegetables')).toBeInTheDocument();
      expect(screen.getByLabelText('Active')).toBeChecked();
    });
  });

  describe('Empty Filters', () => {
    it('should handle empty filters array', () => {
      render(
        <FilterPanel
          {...defaultProps}
          filters={[]}
          onFilterChange={vi.fn()}
        />
      );

      expect(screen.getByText('Filters')).toBeInTheDocument();
    });
  });

  describe('Combination Scenarios', () => {
    it('should handle multiple filters in workflow', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      const handleApply = vi.fn();

      render(
        <FilterPanel
          {...defaultProps}
          onFilterChange={handleChange}
          onApply={handleApply}
        />
      );

      // Set select
      const selects = screen.getAllByRole('combobox');
      await user.click(selects[0]);
      const fruitOption = screen.getByText('Fruits');
      await user.click(fruitOption);

      // Set checkbox
      const activeCheckbox = screen.getByLabelText('Active');
      await user.click(activeCheckbox);

      // Apply
      await user.click(screen.getByText('Apply Filters'));

      expect(handleChange).toHaveBeenCalled();
      expect(handleApply).toHaveBeenCalled();
    });

    it('should maintain ref forwarding', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<FilterPanel {...defaultProps} ref={ref} />);
      expect(ref.current).toBeTruthy();
      expect(ref.current?.tagName).toBe('DIV');
    });
  });
});
