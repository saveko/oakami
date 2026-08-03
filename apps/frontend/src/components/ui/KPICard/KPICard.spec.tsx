import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { KPICard, KPICardProps } from './KPICard';

const createKPICardProps = (overrides?: Partial<KPICardProps>): KPICardProps => ({
  label: 'Total Waste Cost',
  value: 150.5,
  unit: '$',
  ...overrides,
});

describe('KPICard', () => {
  describe('Rendering', () => {
    it('should render with label and value', () => {
      render(<KPICard {...createKPICardProps()} />);

      expect(screen.getByText('Total Waste Cost')).toBeInTheDocument();
      expect(screen.getByText('150.5')).toBeInTheDocument();
    });

    it('should render unit text', () => {
      render(<KPICard {...createKPICardProps({ unit: '$' })} />);

      expect(screen.getByText('$')).toBeInTheDocument();
    });

    it('should render without unit when not provided', () => {
      render(<KPICard {...createKPICardProps({ unit: undefined })} />);

      expect(screen.getByText('150.5')).toBeInTheDocument();
      expect(screen.queryByText('$')).not.toBeInTheDocument();
    });

    it('should render trend information', () => {
      render(
        <KPICard
          {...createKPICardProps({
            trend: {
              value: 15,
              direction: 'up',
              label: 'vs last month',
            },
          })}
        />
      );

      expect(screen.getByText(/↑ 15%/)).toBeInTheDocument();
      expect(screen.getByText('vs last month')).toBeInTheDocument();
    });

    it('should render loading skeleton when isLoading is true', () => {
      const { container } = render(
        <KPICard {...createKPICardProps({ isLoading: true })} />
      );

      expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
      expect(screen.getByRole('article', { hidden: true })).toHaveAttribute('aria-busy', 'true');
    });

    it('should render with numeric value', () => {
      render(<KPICard {...createKPICardProps({ value: 42 })} />);

      expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('should render with string value', () => {
      render(<KPICard {...createKPICardProps({ value: 'N/A' })} />);

      expect(screen.getByText('N/A')).toBeInTheDocument();
    });

    it('should render icon when provided', () => {
      render(
        <KPICard {...createKPICardProps({ icon: '📊' })} />
      );

      expect(screen.getByText('📊')).toBeInTheDocument();
    });

    it('should render chart content when provided', () => {
      const chartContent = <div data-testid="chart">Mini Chart</div>;
      render(
        <KPICard {...createKPICardProps({ chart: chartContent })} />
      );

      expect(screen.getByTestId('chart')).toBeInTheDocument();
    });
  });

  describe('Status Variants', () => {
    it('should apply success status styling', () => {
      const { container } = render(
        <KPICard {...createKPICardProps({ status: 'success' })} />
      );

      const card = container.querySelector('article');
      expect(card).toHaveClass('border-l-green-500');
    });

    it('should apply warning status styling', () => {
      const { container } = render(
        <KPICard {...createKPICardProps({ status: 'warning' })} />
      );

      const card = container.querySelector('article');
      expect(card).toHaveClass('border-l-yellow-500');
    });

    it('should apply error status styling', () => {
      const { container } = render(
        <KPICard {...createKPICardProps({ status: 'error' })} />
      );

      const card = container.querySelector('article');
      expect(card).toHaveClass('border-l-red-500');
    });

    it('should apply neutral status by default', () => {
      const { container } = render(
        <KPICard {...createKPICardProps({ status: 'neutral' })} />
      );

      const card = container.querySelector('article');
      expect(card).toHaveClass('border-l-gray-500');
    });
  });

  describe('Trend Direction', () => {
    it('should show up arrow for positive trend', () => {
      render(
        <KPICard
          {...createKPICardProps({
            trend: { value: 10, direction: 'up' },
          })}
        />
      );

      expect(screen.getByText(/↑ 10%/)).toBeInTheDocument();
    });

    it('should show down arrow for negative trend', () => {
      render(
        <KPICard
          {...createKPICardProps({
            trend: { value: 5, direction: 'down' },
          })}
        />
      );

      expect(screen.getByText(/↓ 5%/)).toBeInTheDocument();
    });

    it('should show neutral indicator for neutral trend', () => {
      render(
        <KPICard
          {...createKPICardProps({
            trend: { value: 0, direction: 'neutral' },
          })}
        />
      );

      expect(screen.getByText(/0%/)).toBeInTheDocument();
    });

    it('should apply color to trend based on direction', () => {
      const { container: upContainer } = render(
        <KPICard
          {...createKPICardProps({
            trend: { value: 10, direction: 'up' },
          })}
        />
      );

      const upTrend = upContainer.querySelector('.text-green-600');
      expect(upTrend).toBeInTheDocument();

      const { container: downContainer } = render(
        <KPICard
          {...createKPICardProps({
            trend: { value: 5, direction: 'down' },
          })}
        />
      );

      const downTrend = downContainer.querySelector('.text-red-600');
      expect(downTrend).toBeInTheDocument();
    });
  });

  describe('Interactivity', () => {
    it('should call onClick when card is clicked', async () => {
      const onClick = jest.fn();
      const user = userEvent.setup();

      render(
        <KPICard {...createKPICardProps({ onClick })} />
      );

      await user.click(screen.getByRole('button'));

      expect(onClick).toHaveBeenCalled();
    });

    it('should call onClick when Enter key is pressed', async () => {
      const onClick = jest.fn();
      const user = userEvent.setup();

      render(
        <KPICard {...createKPICardProps({ onClick })} />
      );

      const card = screen.getByRole('button');
      card.focus();
      await user.keyboard('{Enter}');

      expect(onClick).toHaveBeenCalled();
    });

    it('should call onClick when Space key is pressed', async () => {
      const onClick = jest.fn();
      const user = userEvent.setup();

      render(
        <KPICard {...createKPICardProps({ onClick })} />
      );

      const card = screen.getByRole('button');
      card.focus();
      await user.keyboard(' ');

      expect(onClick).toHaveBeenCalled();
    });

    it('should apply hover styles when clickable', () => {
      const { container } = render(
        <KPICard {...createKPICardProps({ onClick: jest.fn() })} />
      );

      const card = container.querySelector('article');
      expect(card).toHaveClass('hover:shadow-lg');
      expect(card).toHaveClass('cursor-pointer');
    });

    it('should not be clickable when onClick is not provided', () => {
      render(<KPICard {...createKPICardProps({ onClick: undefined })} />);

      expect(screen.getByRole('article')).not.toHaveAttribute('tabindex');
    });

    it('should have tabindex when clickable', () => {
      render(
        <KPICard {...createKPICardProps({ onClick: jest.fn() })} />
      );

      expect(screen.getByRole('button')).toHaveAttribute('tabindex', '0');
    });
  });

  describe('Semantic Structure', () => {
    it('should use article element', () => {
      render(<KPICard {...createKPICardProps()} />);

      expect(screen.getByRole('article')).toBeInTheDocument();
    });

    it('should use heading for label', () => {
      render(<KPICard {...createKPICardProps()} />);

      expect(screen.getByRole('heading')).toHaveTextContent('Total Waste Cost');
    });

    it('should use button role when clickable', () => {
      render(
        <KPICard {...createKPICardProps({ onClick: jest.fn() })} />
      );

      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  describe('Dark Mode', () => {
    it('should apply dark mode classes', () => {
      const { container } = render(
        <KPICard {...createKPICardProps()} />
      );

      const card = container.querySelector('article');
      expect(card).toHaveClass('dark:border-gray-700');
      expect(card).toHaveClass('dark:bg-gray-800');
    });

    it('should apply dark mode to text elements', () => {
      const { container } = render(
        <KPICard {...createKPICardProps()} />
      );

      expect(container.querySelector('.dark\\:text-gray-400')).toBeInTheDocument();
      expect(container.querySelector('.dark\\:text-gray-100')).toBeInTheDocument();
    });
  });

  describe('ARIA Attributes', () => {
    it('should have aria-label', () => {
      render(<KPICard {...createKPICardProps()} />);

      expect(screen.getByLabelText('Total Waste Cost')).toBeInTheDocument();
    });

    it('should use custom aria-label when provided', () => {
      render(
        <KPICard
          {...createKPICardProps({
            ariaLabel: 'Custom label',
          })}
        />
      );

      expect(screen.getByLabelText('Custom label')).toBeInTheDocument();
    });

    it('should have aria-busy during loading', () => {
      render(
        <KPICard {...createKPICardProps({ isLoading: true })} />
      );

      expect(screen.getByRole('article', { hidden: true })).toHaveAttribute('aria-busy', 'true');
    });
  });

  describe('Ref Forwarding', () => {
    it('should forward ref to article element', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<KPICard {...createKPICardProps()} ref={ref} />);

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very large numbers', () => {
      render(
        <KPICard {...createKPICardProps({ value: 999999999 })} />
      );

      expect(screen.getByText('999999999')).toBeInTheDocument();
    });

    it('should handle special characters in unit', () => {
      render(
        <KPICard {...createKPICardProps({ unit: '€/kg' })} />
      );

      expect(screen.getByText('€/kg')).toBeInTheDocument();
    });

    it('should handle long label text', () => {
      const longLabel = 'This is a very long label that might overflow the container';
      render(
        <KPICard {...createKPICardProps({ label: longLabel })} />
      );

      expect(screen.getByText(longLabel)).toBeInTheDocument();
    });

    it('should handle className prop', () => {
      const { container } = render(
        <KPICard
          {...createKPICardProps({
            className: 'custom-class',
          })}
        />
      );

      expect(container.querySelector('.custom-class')).toBeInTheDocument();
    });

    it('should handle zero value', () => {
      render(<KPICard {...createKPICardProps({ value: 0 })} />);

      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('should handle negative trend value', () => {
      render(
        <KPICard
          {...createKPICardProps({
            trend: { value: -25, direction: 'down' },
          })}
        />
      );

      expect(screen.getByText(/↓ 25%/)).toBeInTheDocument();
    });
  });

  describe('Layout', () => {
    it('should have fixed height', () => {
      const { container } = render(
        <KPICard {...createKPICardProps()} />
      );

      const card = container.querySelector('article');
      expect(card).toHaveClass('h-32');
    });

    it('should have proper padding', () => {
      const { container } = render(
        <KPICard {...createKPICardProps()} />
      );

      const card = container.querySelector('article');
      expect(card).toHaveClass('p-4');
    });

    it('should position icon at top right', () => {
      const { container } = render(
        <KPICard {...createKPICardProps({ icon: '📊' })} />
      );

      const icon = container.querySelector('.absolute.right-4.top-4');
      expect(icon).toBeInTheDocument();
    });
  });
});
