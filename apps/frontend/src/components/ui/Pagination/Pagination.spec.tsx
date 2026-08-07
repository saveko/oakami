import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@/test/utils';
import userEvent from '@testing-library/user-event';
import { Pagination, PaginationProps } from './Pagination';

const createPaginationProps = (overrides?: Partial<PaginationProps>): PaginationProps => ({
  currentPage: 1,
  totalPages: 10,
  onPageChange: vi.fn(),
  ...overrides,
});

describe('Pagination', () => {
  describe('Rendering', () => {
    it('should render pagination controls', () => {
      render(<Pagination {...createPaginationProps()} />);

      expect(screen.getByLabelText('Previous page')).toBeInTheDocument();
      expect(screen.getByLabelText('Next page')).toBeInTheDocument();
    });

    it('should render page numbers', () => {
      render(<Pagination {...createPaginationProps({ totalPages: 5 })} />);

      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('should render page info by default', () => {
      render(<Pagination {...createPaginationProps({ currentPage: 2, totalPages: 10 })} />);

      expect(screen.getByText(/Page 2 of 10/)).toBeInTheDocument();
    });

    it('should not render page info when showPageInfo is false', () => {
      render(<Pagination {...createPaginationProps({ showPageInfo: false })} />);

      expect(screen.queryByText(/Page/)).not.toBeInTheDocument();
    });

    it('should render jump to page input when showJumpTo is true', () => {
      render(<Pagination {...createPaginationProps({ showJumpTo: true })} />);

      expect(screen.getByLabelText('Go to:')).toBeInTheDocument();
      expect(screen.getByLabelText('Jump to page number')).toBeInTheDocument();
    });

    it('should not render jump to page input by default', () => {
      render(<Pagination {...createPaginationProps()} />);

      expect(screen.queryByLabelText('Go to:')).not.toBeInTheDocument();
    });

    it('should render all page numbers for small page counts', () => {
      render(<Pagination {...createPaginationProps({ totalPages: 3 })} />);

      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('should render ellipsis for large page counts', () => {
      render(<Pagination {...createPaginationProps({ currentPage: 5, totalPages: 20 })} />);

      const ellipsis = screen.getAllByText('⋯');
      expect(ellipsis.length).toBeGreaterThan(0);
    });
  });

  describe('Navigation', () => {
    it('should call onPageChange with next page when next button is clicked', async () => {
      const onPageChange = vi.fn();
      const user = userEvent.setup();

      render(
        <Pagination
          {...createPaginationProps({
            currentPage: 1,
            totalPages: 5,
            onPageChange,
          })}
        />
      );

      await user.click(screen.getByLabelText('Next page'));

      expect(onPageChange).toHaveBeenCalledWith(2);
    });

    it('should call onPageChange with previous page when previous button is clicked', async () => {
      const onPageChange = vi.fn();
      const user = userEvent.setup();

      render(
        <Pagination
          {...createPaginationProps({
            currentPage: 5,
            totalPages: 10,
            onPageChange,
          })}
        />
      );

      await user.click(screen.getByLabelText('Previous page'));

      expect(onPageChange).toHaveBeenCalledWith(4);
    });

    it('should call onPageChange with selected page number', async () => {
      const onPageChange = vi.fn();
      const user = userEvent.setup();

      render(
        <Pagination
          {...createPaginationProps({
            currentPage: 1,
            totalPages: 5,
            onPageChange,
          })}
        />
      );

      await user.click(screen.getByText('3'));

      expect(onPageChange).toHaveBeenCalledWith(3);
    });
  });

  describe('Button States', () => {
    it('should disable previous button on first page', () => {
      render(
        <Pagination
          {...createPaginationProps({
            currentPage: 1,
            totalPages: 5,
          })}
        />
      );

      expect(screen.getByLabelText('Previous page')).toBeDisabled();
    });

    it('should disable next button on last page', () => {
      render(
        <Pagination
          {...createPaginationProps({
            currentPage: 5,
            totalPages: 5,
          })}
        />
      );

      expect(screen.getByLabelText('Next page')).toBeDisabled();
    });

    it('should enable previous and next buttons on middle pages', () => {
      render(
        <Pagination
          {...createPaginationProps({
            currentPage: 3,
            totalPages: 5,
          })}
        />
      );

      expect(screen.getByLabelText('Previous page')).not.toBeDisabled();
      expect(screen.getByLabelText('Next page')).not.toBeDisabled();
    });

    it('should highlight current page button', () => {
      render(
        <Pagination
          {...createPaginationProps({
            currentPage: 3,
            totalPages: 5,
          })}
        />
      );

      const currentButton = screen.getByText('3');
      expect(currentButton).toHaveAttribute('aria-current', 'page');
      expect(currentButton).toHaveClass('bg-sky-600');
    });

    it('should have aria-current on current page', () => {
      render(
        <Pagination
          {...createPaginationProps({
            currentPage: 2,
            totalPages: 5,
          })}
        />
      );

      expect(screen.getByText('2')).toHaveAttribute('aria-current', 'page');
      expect(screen.getByText('1')).not.toHaveAttribute('aria-current');
    });
  });

  describe('Jump to Page', () => {
    it('should navigate to entered page number', async () => {
      const onPageChange = vi.fn();
      const user = userEvent.setup();

      render(
        <Pagination
          {...createPaginationProps({
            totalPages: 20,
            showJumpTo: true,
            onPageChange,
          })}
        />
      );

      const input = screen.getByLabelText('Jump to page number') as HTMLInputElement;
      await user.type(input, '15');
      await user.keyboard('{Enter}');

      expect(onPageChange).toHaveBeenCalledWith(15);
    });

    it('should not navigate if page number is out of range', async () => {
      const onPageChange = vi.fn();
      const user = userEvent.setup();

      render(
        <Pagination
          {...createPaginationProps({
            totalPages: 10,
            showJumpTo: true,
            onPageChange,
          })}
        />
      );

      const input = screen.getByLabelText('Jump to page number') as HTMLInputElement;
      await user.type(input, '15');
      await user.keyboard('{Enter}');

      expect(onPageChange).not.toHaveBeenCalled();
    });

    it('should clear input after successful navigation', async () => {
      const onPageChange = vi.fn();
      const user = userEvent.setup();

      render(
        <Pagination
          {...createPaginationProps({
            totalPages: 20,
            showJumpTo: true,
            onPageChange,
          })}
        />
      );

      const input = screen.getByLabelText('Jump to page number') as HTMLInputElement;
      await user.type(input, '5');
      await user.keyboard('{Enter}');

      expect(input.value).toBe('');
    });

    it('should have input with min and max constraints', () => {
      render(
        <Pagination
          {...createPaginationProps({
            totalPages: 10,
            showJumpTo: true,
          })}
        />
      );

      const input = screen.getByLabelText('Jump to page number') as HTMLInputElement;
      expect(input).toHaveAttribute('min', '1');
      expect(input).toHaveAttribute('max', '10');
    });
  });

  describe('Size Variants', () => {
    it('should apply small size classes', () => {
      const { container } = render(
        <Pagination {...createPaginationProps({ size: 'sm' })} />
      );

      const buttons = container.querySelectorAll('button');
      buttons.forEach((btn) => {
        expect(btn.className).toContain('h-8');
        expect(btn.className).toContain('w-8');
      });
    });

    it('should apply medium size classes by default', () => {
      const { container } = render(
        <Pagination {...createPaginationProps({ size: 'md' })} />
      );

      const buttons = container.querySelectorAll('button');
      buttons.forEach((btn) => {
        expect(btn.className).toContain('h-10');
        expect(btn.className).toContain('w-10');
      });
    });

    it('should apply large size classes', () => {
      const { container } = render(
        <Pagination {...createPaginationProps({ size: 'lg' })} />
      );

      const buttons = container.querySelectorAll('button');
      buttons.forEach((btn) => {
        expect(btn.className).toContain('h-12');
        expect(btn.className).toContain('w-12');
      });
    });
  });

  describe('Page Number Display', () => {
    it('should show first and last page when at low page numbers', () => {
      render(
        <Pagination
          {...createPaginationProps({
            currentPage: 1,
            totalPages: 10,
          })}
        />
      );

      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
    });

    it('should show first and last page when at high page numbers', () => {
      render(
        <Pagination
          {...createPaginationProps({
            currentPage: 10,
            totalPages: 10,
          })}
        />
      );

      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
    });

    it('should show pages around current page in middle', () => {
      render(
        <Pagination
          {...createPaginationProps({
            currentPage: 5,
            totalPages: 10,
          })}
        />
      );

      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('should display ellipsis between gap in page numbers', () => {
      render(
        <Pagination
          {...createPaginationProps({
            currentPage: 1,
            totalPages: 20,
          })}
        />
      );

      expect(screen.getAllByText('⋯').length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels on buttons', () => {
      render(
        <Pagination
          {...createPaginationProps({
            currentPage: 1,
            totalPages: 5,
          })}
        />
      );

      expect(screen.getByLabelText('Previous page')).toBeInTheDocument();
      expect(screen.getByLabelText('Next page')).toBeInTheDocument();
    });

    it('should have navigation role', () => {
      const { container } = render(
        <Pagination {...createPaginationProps()} />
      );

      expect(container.querySelector('[role="navigation"]')).toBeInTheDocument();
    });

    it('should have aria-label for navigation', () => {
      const { container } = render(
        <Pagination {...createPaginationProps()} />
      );

      expect(container.querySelector('[aria-label="Pagination"]')).toBeInTheDocument();
    });

    it('should have aria-current for current page', () => {
      render(
        <Pagination
          {...createPaginationProps({
            currentPage: 3,
            totalPages: 5,
          })}
        />
      );

      expect(screen.getByText('3')).toHaveAttribute('aria-current', 'page');
    });

    it('should have disabled attribute on disabled buttons', () => {
      render(
        <Pagination
          {...createPaginationProps({
            currentPage: 1,
            totalPages: 5,
          })}
        />
      );

      expect(screen.getByLabelText('Previous page')).toHaveAttribute('disabled');
    });
  });

  describe('Dark Mode', () => {
    it('should apply dark mode classes to buttons', () => {
      const { container } = render(
        <Pagination {...createPaginationProps()} />
      );

      const buttons = container.querySelectorAll('button');
      buttons.forEach((btn) => {
        expect(btn.className).toContain('dark:');
      });
    });

    it('should apply dark mode classes to text', () => {
      render(
        <Pagination
          {...createPaginationProps({
            showPageInfo: true,
          })}
        />
      );

      // Page info should have dark mode classes
      const pageInfo = screen.getByText(/Page/);
      expect(pageInfo?.parentElement?.className).toContain('dark:');
    });
  });

  describe('Ref Forwarding', () => {
    it('should forward ref to div element', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<Pagination {...createPaginationProps()} ref={ref} />);

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe('Edge Cases', () => {
    it('should handle single page', () => {
      const onPageChange = vi.fn();
      render(
        <Pagination
          {...createPaginationProps({
            currentPage: 1,
            totalPages: 1,
            onPageChange,
          })}
        />
      );

      expect(screen.getByLabelText('Previous page')).toBeDisabled();
      expect(screen.getByLabelText('Next page')).toBeDisabled();
    });

    it('should handle very large page count', () => {
      render(
        <Pagination
          {...createPaginationProps({
            currentPage: 50,
            totalPages: 100,
          })}
        />
      );

      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
    });

    it('should handle className prop', () => {
      const { container } = render(
        <Pagination
          {...createPaginationProps({
            className: 'custom-class',
          })}
        />
      );

      expect(container.querySelector('.custom-class')).toBeInTheDocument();
    });
  });
});
