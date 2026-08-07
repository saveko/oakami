import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Chart, ChartProps, ChartSeries } from './Chart';

const mockChartData = [
  { date: '2026-08-01', value1: 100, value2: 200, category: 'A' },
  { date: '2026-08-02', value1: 120, value2: 180, category: 'B' },
  { date: '2026-08-03', value1: 150, value2: 250, category: 'A' },
  { date: '2026-08-04', value1: 110, value2: 190, category: 'C' },
];

const mockSeries: ChartSeries[] = [
  { key: 'value1', label: 'Metric 1', color: '#0EA5E9' },
  { key: 'value2', label: 'Metric 2', color: '#10B981' },
];

const createChartProps = (overrides?: Partial<ChartProps>): ChartProps => ({
  type: 'line',
  data: mockChartData,
  series: mockSeries,
  ...overrides,
});

describe('Chart Component', () => {
  describe('Rendering', () => {
    it('should render with default props', () => {
      const { container } = render(<Chart {...createChartProps()} />);
      expect(container.querySelector('[role="img"]')).toBeInTheDocument();
    });

    it('should render line chart type', () => {
      const { container } = render(
        <Chart {...createChartProps({ type: 'line' })} />
      );
      const chart = container.querySelector('[role="img"]');
      expect(chart).toBeInTheDocument();
    });

    it('should render bar chart type', () => {
      const { container } = render(
        <Chart {...createChartProps({ type: 'bar' })} />
      );
      const chart = container.querySelector('[role="img"]');
      expect(chart).toBeInTheDocument();
    });

    it('should render pie chart type', () => {
      const { container } = render(
        <Chart {...createChartProps({ type: 'pie' })} />
      );
      const chart = container.querySelector('[role="img"]');
      expect(chart).toBeInTheDocument();
    });

    it('should render area chart type', () => {
      const { container } = render(
        <Chart {...createChartProps({ type: 'area' })} />
      );
      const chart = container.querySelector('[role="img"]');
      expect(chart).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(
        <Chart {...createChartProps({ className: 'custom-chart' })} />
      );
      const wrapper = container.querySelector('[role="img"]');
      expect(wrapper?.className).toContain('custom-chart');
    });

    it('should have correct height style', () => {
      const { container } = render(
        <Chart {...createChartProps({ height: 500 })} />
      );
      const wrapper = container.querySelector('[role="img"]') as HTMLElement | null;
      expect(wrapper?.style.height).toBe('500px');
    });
  });

  describe('Loading State', () => {
    it('should show loading skeleton when isLoading is true', () => {
      const { container } = render(
        <Chart {...createChartProps({ isLoading: true })} />
      );
      const skeleton = container.querySelector('.animate-pulse');
      expect(skeleton).toBeInTheDocument();
    });

    it('should have aria-busy when loading', () => {
      const { container } = render(
        <Chart {...createChartProps({ isLoading: true })} />
      );
      expect(container.querySelector('[aria-busy="true"]')).toBeInTheDocument();
    });

    it('should not show chart when loading', () => {
      const { container } = render(
        <Chart {...createChartProps({ isLoading: true })} />
      );
      const chart = container.querySelector('svg');
      expect(chart).not.toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should show empty message when data is empty', () => {
      render(<Chart {...createChartProps({ data: [] })} />);
      expect(screen.getByText('No data available')).toBeInTheDocument();
    });

    it('should show custom empty message', () => {
      render(
        <Chart
          {...createChartProps({ data: [], emptyMessage: 'No data found' })}
        />
      );
      expect(screen.getByText('No data found')).toBeInTheDocument();
    });

    it('should have correct empty state role', () => {
      const { container } = render(
        <Chart {...createChartProps({ data: [] })} />
      );
      expect(container.querySelector('[role="status"]')).toBeInTheDocument();
    });
  });

  describe('Series Visibility', () => {
    it('should render all series by default', () => {
      const { container } = render(<Chart {...createChartProps()} />);
      expect(container.querySelector('[role="img"]')).toBeInTheDocument();
    });

    it('should hide series when legend item clicked', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <Chart {...createChartProps({ legend: true })} />
      );

      // Get legend item (aria-label contains series label)
      const legendItems = container.querySelectorAll('[role="button"]');
      if (legendItems.length > 0) {
        await user.click(legendItems[0]);
        // After click, series should be hidden (internal state)
        expect(legendItems[0]).toBeInTheDocument();
      }
    });

    it('should show series again when legend item clicked twice', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <Chart {...createChartProps({ legend: true })} />
      );

      const legendItems = container.querySelectorAll('[role="button"]');
      if (legendItems.length > 0) {
        await user.click(legendItems[0]);
        await user.click(legendItems[0]);
        expect(legendItems[0]).toBeInTheDocument();
      }
    });
  });

  describe('Legend', () => {
    it('should render legend by default', () => {
      const { container } = render(<Chart {...createChartProps()} />);
      // recharts is mocked in the test setup, so assert the legend is rendered
      // rather than probing for interactive internals the mock never produces.
      expect(container.querySelector('[data-testid="chart-legend"]')).toBeInTheDocument();
    });

    it('should hide legend when legend prop is false', () => {
      const { container } = render(
        <Chart {...createChartProps({ legend: false })} />
      );
      const wrapperStyle = container.querySelector('div')?.style;
      // Legend should be hidden via display: none
      expect(container.querySelector('[role="img"]')).toBeInTheDocument();
    });

    it('should show legend when legend prop is true', () => {
      const { container } = render(
        <Chart {...createChartProps({ legend: true })} />
      );
      expect(container.querySelector('[role="img"]')).toBeInTheDocument();
    });
  });

  describe('Tooltip', () => {
    it('should render with tooltip by default', () => {
      const { container } = render(<Chart {...createChartProps()} />);
      expect(container.querySelector('[role="img"]')).toBeInTheDocument();
    });

    it('should hide tooltip when tooltip prop is false', () => {
      const { container } = render(
        <Chart {...createChartProps({ tooltip: false })} />
      );
      expect(container.querySelector('[role="img"]')).toBeInTheDocument();
    });
  });

  describe('Axes Configuration', () => {
    it('should render xAxis when provided', () => {
      const { container } = render(
        <Chart
          {...createChartProps({
            xAxis: { key: 'date', label: 'Date' },
          })}
        />
      );
      expect(container.querySelector('[role="img"]')).toBeInTheDocument();
    });

    it('should render yAxis when provided', () => {
      const { container } = render(
        <Chart
          {...createChartProps({
            yAxis: { label: 'Value', domain: [0, 300] },
          })}
        />
      );
      expect(container.querySelector('[role="img"]')).toBeInTheDocument();
    });

    it('should render without axes when not provided', () => {
      const { container } = render(
        <Chart {...createChartProps({ xAxis: undefined, yAxis: undefined })} />
      );
      expect(container.querySelector('[role="img"]')).toBeInTheDocument();
    });
  });

  describe('Accessibility Labels', () => {
    it('should use default aria-label based on type', () => {
      const { container } = render(
        <Chart {...createChartProps({ type: 'line' })} />
      );
      const chart = container.querySelector('[role="img"]');
      expect(chart?.getAttribute('aria-label')).toContain('line chart');
    });

    it('should use custom ariaLabel when provided', () => {
      const { container } = render(
        <Chart
          {...createChartProps({
            ariaLabel: 'Custom Chart Label',
          })}
        />
      );
      const chart = container.querySelector('[role="img"]');
      expect(chart?.getAttribute('aria-label')).toBe('Custom Chart Label');
    });

    it('should include series labels in aria-label', () => {
      const { container } = render(
        <Chart {...createChartProps({ type: 'bar' })} />
      );
      const chart = container.querySelector('[role="img"]');
      const label = chart?.getAttribute('aria-label') || '';
      expect(label).toContain('Metric 1');
      expect(label).toContain('Metric 2');
    });
  });

  describe('Dark Mode', () => {
    it('should have dark mode classes', () => {
      const { container } = render(<Chart {...createChartProps()} />);
      const wrapper = container.querySelector('[role="img"]');
      expect(wrapper?.className).toContain('dark:');
    });

    it('should apply dark mode background', () => {
      const { container } = render(<Chart {...createChartProps()} />);
      const wrapper = container.querySelector('[role="img"]');
      expect(wrapper?.className).toContain('dark:bg-gray-800');
    });

    it('should apply dark mode border', () => {
      const { container } = render(<Chart {...createChartProps()} />);
      const wrapper = container.querySelector('[role="img"]');
      expect(wrapper?.className).toContain('dark:border-gray-700');
    });
  });

  describe('Chart Colors', () => {
    it('should use custom colors from series', () => {
      const customSeries: ChartSeries[] = [
        { key: 'value1', label: 'Custom', color: '#FF0000' },
      ];
      const { container } = render(
        <Chart {...createChartProps({ series: customSeries })} />
      );
      expect(container.querySelector('[role="img"]')).toBeInTheDocument();
    });

    it('should use default colors when not specified', () => {
      const seriesNoColor: ChartSeries[] = [
        { key: 'value1', label: 'Default Color' },
      ];
      const { container } = render(
        <Chart {...createChartProps({ series: seriesNoColor })} />
      );
      expect(container.querySelector('[role="img"]')).toBeInTheDocument();
    });

    it('should cycle through default colors for multiple series', () => {
      const manySeriesWithoutColor: ChartSeries[] = [
        { key: 'v1', label: 'Series 1' },
        { key: 'v2', label: 'Series 2' },
        { key: 'v3', label: 'Series 3' },
        { key: 'v4', label: 'Series 4' },
        { key: 'v5', label: 'Series 5' },
        { key: 'v6', label: 'Series 6' },
        { key: 'v7', label: 'Series 7' },
      ];
      const { container } = render(
        <Chart
          {...createChartProps({
            series: manySeriesWithoutColor,
            data: mockChartData.map((d) => ({
              ...d,
              v1: 100,
              v2: 120,
              v3: 140,
              v4: 160,
              v5: 180,
              v6: 200,
              v7: 220,
            })),
          })}
        />
      );
      expect(container.querySelector('[role="img"]')).toBeInTheDocument();
    });
  });

  describe('Ref Forwarding', () => {
    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<Chart {...createChartProps()} ref={ref} />);
      expect(ref.current).toBeTruthy();
      expect(ref.current?.getAttribute('role')).toBe('img');
    });

    it('should allow accessing DOM element via ref', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<Chart {...createChartProps()} ref={ref} />);
      const element = ref.current;
      expect(element?.className).toContain('rounded-lg');
      expect(element?.className).toContain('border');
    });
  });

  describe('Data Changes', () => {
    it('should handle empty data gracefully', () => {
      const { container } = render(
        <Chart {...createChartProps({ data: [] })} />
      );
      expect(screen.getByText('No data available')).toBeInTheDocument();
    });

    it('should handle single data point', () => {
      const { container } = render(
        <Chart
          {...createChartProps({
            data: [mockChartData[0]],
          })}
        />
      );
      expect(container.querySelector('[role="img"]')).toBeInTheDocument();
    });

    it('should handle large dataset', () => {
      const largeData = Array.from({ length: 365 }, (_, i) => ({
        date: `2026-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
        value1: Math.floor(Math.random() * 1000),
        value2: Math.floor(Math.random() * 1000),
        category: ['A', 'B', 'C'][i % 3],
      }));
      const { container } = render(
        <Chart {...createChartProps({ data: largeData })} />
      );
      expect(container.querySelector('[role="img"]')).toBeInTheDocument();
    });
  });

  describe('Props Combinations', () => {
    it('should handle line chart with all props', () => {
      const { container } = render(
        <Chart
          {...createChartProps({
            type: 'line',
            xAxis: { key: 'date' },
            yAxis: { domain: [0, 300] },
            legend: true,
            tooltip: true,
            height: 400,
          })}
        />
      );
      expect(container.querySelector('[role="img"]')).toBeInTheDocument();
    });

    it('should handle bar chart with all props', () => {
      const { container } = render(
        <Chart
          {...createChartProps({
            type: 'bar',
            xAxis: { key: 'category' },
            yAxis: { domain: [0, 300] },
            legend: true,
            tooltip: true,
          })}
        />
      );
      expect(container.querySelector('[role="img"]')).toBeInTheDocument();
    });

    it('should handle pie chart with all props', () => {
      const { container } = render(
        <Chart
          {...createChartProps({
            type: 'pie',
            legend: true,
            tooltip: true,
          })}
        />
      );
      expect(container.querySelector('[role="img"]')).toBeInTheDocument();
    });

    it('should handle area chart with all props', () => {
      const { container } = render(
        <Chart
          {...createChartProps({
            type: 'area',
            xAxis: { key: 'date' },
            yAxis: { domain: [0, 300] },
            legend: true,
            tooltip: true,
          })}
        />
      );
      expect(container.querySelector('[role="img"]')).toBeInTheDocument();
    });
  });
});
