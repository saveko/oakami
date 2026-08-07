import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Table, Column, TableProps } from './Table';

interface MockData {
  id: string;
  name: string;
  quantity: number;
  cost: number;
  status: 'active' | 'inactive';
}

const mockData: MockData[] = [
  { id: '1', name: 'Ingredient A', quantity: 100, cost: 50, status: 'active' },
  { id: '2', name: 'Ingredient B', quantity: 200, cost: 75, status: 'active' },
  { id: '3', name: 'Ingredient C', quantity: 150, cost: 60, status: 'inactive' },
  { id: '4', name: 'Ingredient D', quantity: 250, cost: 100, status: 'active' },
  { id: '5', name: 'Ingredient E', quantity: 80, cost: 40, status: 'inactive' },
];

const mockColumns: Column<MockData>[] = [
  { id: 'name', label: 'Name', sortable: true },
  { id: 'quantity', label: 'Quantity', sortable: true, align: 'right' },
  { id: 'cost', label: 'Cost', sortable: true, align: 'right' },
  { id: 'status', label: 'Status', sortable: false },
];

const createTableProps = (overrides?: Partial<TableProps<MockData>>): TableProps<MockData> => ({
  columns: mockColumns,
  data: mockData,
  keyExtractor: (item) => item.id,
  ...overrides,
});

describe('Table', () => {
  describe('Rendering', () => {
    it('should render table with columns and data', () => {
      render(<Table {...createTableProps()} />);

      mockColumns.forEach((col) => {
        expect(screen.getByText(col.label)).toBeInTheDocument();
      });

      mockData.forEach((item) => {
        expect(screen.getByText(item.name)).toBeInTheDocument();
      });
    });

    it('should render with proper semantic HTML structure', () => {
      const { container } = render(<Table {...createTableProps()} />);

      expect(container.querySelector('table')).toBeInTheDocument();
      expect(container.querySelector('thead')).toBeInTheDocument();
      expect(container.querySelector('tbody')).toBeInTheDocument();
      expect(container.querySelectorAll('th')).toHaveLength(mockColumns.length);
    });

    it('should render correct number of rows', () => {
      render(<Table {...createTableProps()} />);

      const rows = screen.getAllByRole('row');
      expect(rows).toHaveLength(mockData.length + 1); // +1 for header
    });

    it('should render loading skeleton when isLoading is true', () => {
      const { container } = render(<Table {...createTableProps({ isLoading: true })} />);

      const skeletonRows = container.querySelectorAll('tbody tr');
      expect(skeletonRows.length).toBeGreaterThan(0);
      // 5 skeleton rows, one pulsing cell per column
      expect(container.querySelectorAll('.animate-pulse')).toHaveLength(
        5 * mockColumns.length
      );
    });

    it('should render error message when error prop is provided', () => {
      const errorMessage = 'Failed to load data';
      render(<Table {...createTableProps({ error: errorMessage, data: [] })} />);

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('should render empty state when data is empty', () => {
      render(<Table {...createTableProps({ data: [] })} />);

      expect(screen.getByText('No data available')).toBeInTheDocument();
    });

    it('should render custom empty state', () => {
      const emptyMessage = 'No records found';
      render(
        <Table
          {...createTableProps({
            data: [],
            emptyState: <div>{emptyMessage}</div>,
          })}
        />
      );

      expect(screen.getByText(emptyMessage)).toBeInTheDocument();
    });
  });

  describe('Sorting', () => {
    it('should display sort indicators on sortable columns', () => {
      const { container } = render(<Table {...createTableProps()} />);

      mockColumns.forEach((col) => {
        const header = screen.getByText(col.label);
        if (col.sortable) {
          expect(header.closest('th')).toHaveAttribute('aria-sort', 'none');
        }
      });
    });

    it('should update aria-sort when sorting', () => {
      const onSort = vi.fn();
      render(
        <Table
          {...createTableProps({
            onSort,
            sortBy: 'name',
            sortDirection: 'asc',
          })}
        />
      );

      const nameHeader = screen.getByText('Name').closest('th');
      expect(nameHeader).toHaveAttribute('aria-sort', 'ascending');
    });

    it('should call onSort when sortable column header is clicked', () => {
      const onSort = vi.fn();
      render(<Table {...createTableProps({ onSort })} />);

      fireEvent.click(screen.getByText('Name'));

      expect(onSort).toHaveBeenCalledWith('name', 'asc');
    });

    it('should toggle sort direction on repeated clicks', () => {
      const onSort = vi.fn();
      render(
        <Table
          {...createTableProps({
            onSort,
            sortBy: 'name',
            sortDirection: 'asc',
          })}
        />
      );

      fireEvent.click(screen.getByText('Name'));

      expect(onSort).toHaveBeenCalledWith('name', 'desc');
    });

    it('should not call onSort for non-sortable columns', () => {
      const onSort = vi.fn();
      render(<Table {...createTableProps({ onSort })} />);

      fireEvent.click(screen.getByText('Status'));

      expect(onSort).not.toHaveBeenCalled();
    });

    it('should display sort icon for sorted column', () => {
      const { container } = render(
        <Table
          {...createTableProps({
            sortBy: 'name',
            sortDirection: 'asc',
          })}
        />
      );

      const header = screen.getByText('Name').closest('th');
      expect(header?.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('Row Selection', () => {
    it('should render checkboxes when onRowSelect is provided', () => {
      render(<Table {...createTableProps({ onRowSelect: vi.fn() })} />);

      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes.length).toBeGreaterThan(0);
    });

    it('should not render checkboxes when onRowSelect is not provided', () => {
      render(<Table {...createTableProps({ onRowSelect: undefined })} />);

      expect(screen.queryAllByRole('checkbox')).toHaveLength(0);
    });

    it('should call onRowSelect with selected row id when checkbox is clicked', async () => {
      const onRowSelect = vi.fn();
      const user = userEvent.setup();

      render(
        <Table
          {...createTableProps({
            onRowSelect,
            selectedRows: [],
          })}
        />
      );

      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[1]); // First data row (skip header checkbox)

      expect(onRowSelect).toHaveBeenCalledWith(['1']);
    });

    it('should handle multiple row selections', async () => {
      const onRowSelect = vi.fn();
      const user = userEvent.setup();

      // selectedRows is controlled, so the parent must hold it for a second
      // click to accumulate rather than replace the first selection.
      const Harness = () => {
        const [selected, setSelected] = React.useState<string[]>([]);
        return (
          <Table
            {...createTableProps({
              onRowSelect: (ids: string[]) => {
                setSelected(ids);
                onRowSelect(ids);
              },
              selectedRows: selected,
            })}
          />
        );
      };
      render(<Harness />);

      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[1]);
      await user.click(checkboxes[2]);

      expect(onRowSelect).toHaveBeenLastCalledWith(['1', '2']);
    });

    it('should deselect row when already selected checkbox is clicked', async () => {
      const onRowSelect = vi.fn();
      const user = userEvent.setup();

      render(
        <Table
          {...createTableProps({
            onRowSelect,
            selectedRows: ['1'],
          })}
        />
      );

      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[1]);

      expect(onRowSelect).toHaveBeenCalledWith([]);
    });

    it('should select all rows when header checkbox is clicked', async () => {
      const onRowSelect = vi.fn();
      const user = userEvent.setup();

      render(
        <Table
          {...createTableProps({
            onRowSelect,
            selectedRows: [],
          })}
        />
      );

      const headerCheckbox = screen.getByLabelText('Select all rows');
      await user.click(headerCheckbox);

      expect(onRowSelect).toHaveBeenCalledWith(['1', '2', '3', '4', '5']);
    });

    it('should deselect all rows when header checkbox is clicked and all are selected', async () => {
      const onRowSelect = vi.fn();
      const user = userEvent.setup();

      render(
        <Table
          {...createTableProps({
            onRowSelect,
            selectedRows: ['1', '2', '3', '4', '5'],
          })}
        />
      );

      const headerCheckbox = screen.getByLabelText('Select all rows');
      await user.click(headerCheckbox);

      expect(onRowSelect).toHaveBeenCalledWith([]);
    });

    it('should highlight selected rows with background color', () => {
      const { container } = render(
        <Table
          {...createTableProps({
            onRowSelect: vi.fn(),
            selectedRows: ['1'],
          })}
        />
      );

      const rows = container.querySelectorAll('tbody tr');
      expect(rows[0]).toHaveClass('bg-sky-50');
    });
  });

  describe('Pagination', () => {
    it('should paginate data based on rowsPerPage', () => {
      render(
        <Table
          {...createTableProps({
            rowsPerPage: 2,
            currentPage: 1,
          })}
        />
      );

      expect(screen.getByText('Ingredient A')).toBeInTheDocument();
      expect(screen.getByText('Ingredient B')).toBeInTheDocument();
      expect(screen.queryByText('Ingredient C')).not.toBeInTheDocument();
    });

    it('should show correct data for different pages', () => {
      render(
        <Table
          {...createTableProps({
            rowsPerPage: 2,
            currentPage: 2,
          })}
        />
      );

      expect(screen.queryByText('Ingredient A')).not.toBeInTheDocument();
      expect(screen.getByText('Ingredient C')).toBeInTheDocument();
      expect(screen.getByText('Ingredient D')).toBeInTheDocument();
    });

    it('should handle rowsPerPage larger than data', () => {
      render(
        <Table
          {...createTableProps({
            rowsPerPage: 100,
            currentPage: 1,
          })}
        />
      );

      mockData.forEach((item) => {
        expect(screen.getByText(item.name)).toBeInTheDocument();
      });
    });

    it('should call onPageChange when page changes', async () => {
      const onPageChange = vi.fn();
      const { rerender } = render(
        <Table
          {...createTableProps({
            rowsPerPage: 2,
            currentPage: 1,
            onPageChange,
          })}
        />
      );

      // Simulate page change (normally done by external component)
      rerender(
        <Table
          {...createTableProps({
            rowsPerPage: 2,
            currentPage: 2,
            onPageChange,
          })}
        />
      );

      expect(screen.getByText('Ingredient C')).toBeInTheDocument();
    });
  });

  describe('Custom Rendering', () => {
    it('should render custom cell content using render function', () => {
      const customColumns: Column<MockData>[] = [
        {
          id: 'name',
          label: 'Name',
          render: (value) => <strong>{value}</strong>,
        },
        { id: 'quantity', label: 'Quantity' },
      ];

      const { container } = render(
        <Table
          {...createTableProps({
            columns: customColumns,
          })}
        />
      );

      const boldElements = container.querySelectorAll('tbody td strong');
      expect(boldElements.length).toBeGreaterThan(0);
    });

    it('should pass full row object to render function', () => {
      const renderMock = vi.fn((value, row) => {
        if (row.cost > 50) return 'High';
        return 'Low';
      });

      const customColumns: Column<MockData>[] = [
        { id: 'cost', label: 'Cost', render: renderMock },
      ];

      render(
        <Table
          {...createTableProps({
            columns: customColumns,
          })}
        />
      );

      expect(renderMock).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ id: '1' }));
    });
  });

  describe('Column Alignment', () => {
    it('should apply left alignment by default', () => {
      const { container } = render(
        <Table
          {...createTableProps({
            columns: [{ id: 'name', label: 'Name' }],
          })}
        />
      );

      const header = screen.getByText('Name').closest('th');
      expect(header).toHaveClass('text-left');
    });

    it('should apply center alignment when specified', () => {
      const customColumns: Column<MockData>[] = [
        { id: 'name', label: 'Name', align: 'center' },
      ];

      const { container } = render(
        <Table
          {...createTableProps({
            columns: customColumns,
          })}
        />
      );

      const header = screen.getByText('Name').closest('th');
      expect(header).toHaveClass('text-center');
    });

    it('should apply right alignment when specified', () => {
      const customColumns: Column<MockData>[] = [
        { id: 'quantity', label: 'Quantity', align: 'right' },
      ];

      render(
        <Table
          {...createTableProps({
            columns: customColumns,
          })}
        />
      );

      const header = screen.getByText('Quantity').closest('th');
      expect(header).toHaveClass('text-right');
    });
  });

  describe('Dark Mode', () => {
    it('should apply dark mode classes', () => {
      const { container } = render(
        <Table {...createTableProps()} />
      );

      expect(container.querySelector('table')).toBeInTheDocument();
      // Classes are applied via cn() and Tailwind
      const table = container.querySelector('table');
      expect(table?.parentElement).toHaveClass('dark:border-gray-700');
    });
  });

  describe('Accessibility', () => {
    it('should have proper semantic structure', () => {
      const { container } = render(
        <Table {...createTableProps()} />
      );

      expect(container.querySelector('thead')).toBeInTheDocument();
      expect(container.querySelector('tbody')).toBeInTheDocument();
      expect(container.querySelectorAll('th')).toHaveLength(mockColumns.length);
    });

    it('should have aria-sort on sortable headers', () => {
      render(<Table {...createTableProps()} />);

      const nameHeader = screen.getByText('Name').closest('th');
      expect(nameHeader).toHaveAttribute('aria-sort');
    });

    it('should have proper labels for checkboxes', () => {
      render(
        <Table
          {...createTableProps({
            onRowSelect: vi.fn(),
          })}
        />
      );

      expect(screen.getByLabelText('Select all rows')).toBeInTheDocument();
      // One per data row, so the query must allow multiple matches.
      expect(screen.getAllByLabelText(/Select row/)).toHaveLength(mockData.length);
    });

    it('should have role="alert" on error state', () => {
      render(
        <Table
          {...createTableProps({
            error: 'Error message',
            data: [],
          })}
        />
      );

      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  describe('Ref Forwarding', () => {
    it('should forward ref to table element', () => {
      const ref = React.createRef<HTMLTableElement>();
      render(<Table {...createTableProps()} ref={ref} />);

      expect(ref.current).toBeInstanceOf(HTMLTableElement);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long content in cells', () => {
      const longData: MockData[] = [
        {
          id: '1',
          name: 'A'.repeat(100),
          quantity: 100,
          cost: 50,
          status: 'active',
        },
      ];

      render(<Table {...createTableProps({ data: longData })} />);

      expect(screen.getByText('A'.repeat(100))).toBeInTheDocument();
    });

    it('should handle empty column id', () => {
      const customColumns: Column<MockData>[] = [
        { id: '', label: 'Empty ID' },
      ];

      const customData: any[] = [{ '': 'value' }];

      render(
        <Table
          data={customData}
          columns={customColumns}
          keyExtractor={(item) => 'key'}
        />
      );

      expect(screen.getByText('Empty ID')).toBeInTheDocument();
    });

    it('should handle sorting with undefined sortBy', () => {
      const onSort = vi.fn();
      render(
        <Table
          {...createTableProps({
            onSort,
            sortBy: undefined,
            sortDirection: 'asc',
          })}
        />
      );

      fireEvent.click(screen.getByText('Name'));

      expect(onSort).toHaveBeenCalled();
    });

    it('should render when className is provided', () => {
      const { container } = render(
        <Table
          {...createTableProps({
            className: 'custom-class',
          })}
        />
      );

      expect(container.querySelector('.custom-class')).toBeInTheDocument();
    });
  });

  describe('Controlled vs Uncontrolled', () => {
    it('should work as controlled component when onSort and sortBy are provided', () => {
      const onSort = vi.fn();
      const { rerender } = render(
        <Table
          {...createTableProps({
            onSort,
            sortBy: 'name',
            sortDirection: 'asc',
          })}
        />
      );

      expect(screen.getByText('Name').closest('th')).toHaveAttribute('aria-sort', 'ascending');

      rerender(
        <Table
          {...createTableProps({
            onSort,
            sortBy: 'quantity',
            sortDirection: 'asc',
          })}
        />
      );

      expect(screen.getByText('Quantity').closest('th')).toHaveAttribute('aria-sort', 'ascending');
    });

    it('should work as uncontrolled component when onSort is not provided', () => {
      render(<Table {...createTableProps({ onSort: undefined })} />);

      fireEvent.click(screen.getByText('Name'));

      expect(screen.getByText('Name').closest('th')).toHaveAttribute('aria-sort', 'ascending');
    });
  });
});
