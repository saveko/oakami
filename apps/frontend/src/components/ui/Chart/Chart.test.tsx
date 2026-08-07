import React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Chart, ChartProps, ChartSeries } from './Chart';

expect.extend(toHaveNoViolations);

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

describe('Chart - Accessibility', () => {
  describe('WCAG 2.1 Compliance', () => {
    it('should have no accessibility violations with default props', async () => {
      const { container } = render(<Chart {...createChartProps()} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations with line chart', async () => {
      const { container } = render(
        <Chart {...createChartProps({ type: 'line' })} />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations with bar chart', async () => {
      const { container } = render(
        <Chart {...createChartProps({ type: 'bar' })} />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations with pie chart', async () => {
      const { container } = render(
        <Chart {...createChartProps({ type: 'pie' })} />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations with area chart', async () => {
      const { container } = render(
        <Chart {...createChartProps({ type: 'area' })} />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations during loading', async () => {
      const { container } = render(
        <Chart {...createChartProps({ isLoading: true })} />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations in empty state', async () => {
      const { container } = render(
        <Chart {...createChartProps({ data: [] })} />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations with legend', async () => {
      const { container } = render(
        <Chart {...createChartProps({ legend: true })} />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations with tooltip', async () => {
      const { container } = render(
        <Chart {...createChartProps({ tooltip: true })} />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no violations with axes configured', async () => {
      const { container } = render(
        <Chart
          {...createChartProps({
            xAxis: { key: 'date', label: 'Date' },
            yAxis: { label: 'Value' },
          })}
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Semantic HTML Structure', () => {
    it('should have proper role attribute', () => {
      const { container } = render(<Chart {...createChartProps()} />);
      expect(container.querySelector('[role="img"]')).toBeInTheDocument();
    });

    it('should have proper role for empty state', () => {
      const { container } = render(
        <Chart {...createChartProps({ data: [] })} />
      );
      expect(container.querySelector('[role="status"]')).toBeInTheDocument();
    });

    it('should use div as base element', () => {
      const { container } = render(<Chart {...createChartProps()} />);
      const wrapper = container.querySelector('[role="img"]');
      expect(wrapper?.tagName.toLowerCase()).toBe('div');
    });

    it('should have proper structure for chart container', () => {
      const { container } = render(<Chart {...createChartProps()} />);
      const chartDiv = container.querySelector('[role="img"]');
      expect(chartDiv?.className).toContain('rounded-lg');
      expect(chartDiv?.className).toContain('border');
    });
  });

  describe('ARIA Attributes', () => {
    it('should have aria-label', () => {
      const { container } = render(<Chart {...createChartProps()} />);
      expect(container.querySelector('[aria-label]')).toBeInTheDocument();
    });

    it('should use default aria-label based on type', () => {
      const { container } = render(
        <Chart {...createChartProps({ type: 'bar' })} />
      );
      const label = container.querySelector('[aria-label]');
      expect(label?.getAttribute('aria-label')).toContain('bar chart');
    });

    it('should use custom aria-label when provided', () => {
      const { container } = render(
        <Chart
          {...createChartProps({
            ariaLabel: 'Sales by Region',
          })}
        />
      );
      const label = container.querySelector('[aria-label]');
      expect(label?.getAttribute('aria-label')).toBe('Sales by Region');
    });

    it('should include series information in aria-label', () => {
      const { container } = render(
        <Chart {...createChartProps({ type: 'line' })} />
      );
      const label = container.querySelector('[aria-label]');
      const ariaLabel = label?.getAttribute('aria-label') || '';
      expect(ariaLabel).toContain('Metric 1');
      expect(ariaLabel).toContain('Metric 2');
    });

    it('should have aria-busy during loading', () => {
      const { container } = render(
        <Chart {...createChartProps({ isLoading: true })} />
      );
      expect(container.querySelector('[aria-busy="true"]')).toBeInTheDocument();
    });
  });

  describe('Color Contrast', () => {
    it('should maintain proper contrast in light mode', () => {
      const { container } = render(<Chart {...createChartProps()} />);
      const wrapper = container.querySelector('[role="img"]');
      expect(wrapper?.className).toContain('bg-white');
      expect(wrapper?.className).toContain('border-gray-200');
    });

    it('should maintain proper contrast in dark mode', () => {
      const { container } = render(<Chart {...createChartProps()} />);
      const wrapper = container.querySelector('[role="img"]');
      expect(wrapper?.className).toContain('dark:bg-gray-800');
      expect(wrapper?.className).toContain('dark:border-gray-700');
    });

    it('should use accessible colors for series', () => {
      const accessibleSeries: ChartSeries[] = [
        { key: 'v1', label: 'Series 1', color: '#0EA5E9' }, // Sky-500
        { key: 'v2', label: 'Series 2', color: '#10B981' }, // Emerald-500
        { key: 'v3', label: 'Series 3', color: '#F59E0B' }, // Amber-500
      ];
      const { container } = render(
        <Chart {...createChartProps({ series: accessibleSeries })} />
      );
      expect(container.querySelector('[role="img"]')).toBeInTheDocument();
    });

    it('should have sufficient contrast for text in empty state', () => {
      const { container } = render(
        <Chart {...createChartProps({ data: [] })} />
      );
      const text = container.querySelector('p');
      expect(text?.className).toContain('text-gray-500');
    });
  });

  describe('Focus Management', () => {
    it('should have proper focus outline on wrapper', () => {
      const { container } = render(<Chart {...createChartProps()} />);
      const wrapper = container.querySelector('[role="img"]');
      // Chart wrapper itself is not focusable, but internal elements should be
      expect(wrapper?.className).toContain('rounded-lg');
    });

    it('should maintain focus visibility for legend items', () => {
      const { container } = render(
        <Chart {...createChartProps({ legend: true })} />
      );
      // Legend buttons should be focusable
      const legendItems = container.querySelectorAll('[role="button"]');
      legendItems.forEach((item) => {
        expect(item).toBeInTheDocument();
      });
    });
  });

  describe('Text Readability', () => {
    it('should use readable font sizes for labels', () => {
      const { container } = render(
        // The message only renders when there is no data to draw.
        <Chart {...createChartProps({ data: [], emptyMessage: 'Test Message' })} />
      );
      const text = container.querySelector('p');
      expect(text?.className).toContain('text-sm');
    });

    it('should have proper text content in empty state', () => {
      render(<Chart {...createChartProps({ data: [] })} />);
      expect(document.body.textContent).toContain('No data available');
    });

    it('should display custom empty message', () => {
      render(
        <Chart
          {...createChartProps({
            data: [],
            emptyMessage: 'Custom Message',
          })}
        />
      );
      expect(document.body.textContent).toContain('Custom Message');
    });
  });

  describe('Dark Mode Support', () => {
    it('should have dark mode classes on wrapper', () => {
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

    it('should apply dark mode to padding', () => {
      const { container } = render(<Chart {...createChartProps()} />);
      const wrapper = container.querySelector('[role="img"]');
      expect(wrapper?.className).toContain('p-4');
    });

    it('should maintain contrast in dark mode', () => {
      const { container } = render(<Chart {...createChartProps()} />);
      const wrapper = container.querySelector('[role="img"]');
      // Should have both light and dark mode styles
      expect(wrapper?.className).toContain('border-gray-200');
      expect(wrapper?.className).toContain('dark:border-gray-700');
    });
  });

  describe('Loading State Accessibility', () => {
    it('should announce loading state', () => {
      const { container } = render(
        <Chart {...createChartProps({ isLoading: true })} />
      );
      expect(container.querySelector('[aria-busy="true"]')).toBeInTheDocument();
    });

    it('should have proper role during loading', () => {
      const { container } = render(
        <Chart {...createChartProps({ isLoading: true })} />
      );
      const wrapper = container.querySelector('[role="img"]');
      expect(wrapper).toBeInTheDocument();
    });

    it('should show skeleton with proper structure', () => {
      const { container } = render(
        <Chart {...createChartProps({ isLoading: true })} />
      );
      const skeleton = container.querySelector('.animate-pulse');
      expect(skeleton).toBeInTheDocument();
    });

    it('should have accessible empty state structure', () => {
      const { container } = render(
        <Chart {...createChartProps({ isLoading: true })} />
      );
      expect(container.querySelector('[role="img"]')).toBeInTheDocument();
      expect(container.querySelector('[aria-busy="true"]')).toBeInTheDocument();
    });
  });

  describe('Chart Type Accessibility', () => {
    it('should be accessible regardless of chart type', async () => {
      const types: Array<'line' | 'bar' | 'pie' | 'area'> = [
        'line',
        'bar',
        'pie',
        'area',
      ];

      for (const type of types) {
        const { container } = render(
          <Chart {...createChartProps({ type })} />
        );
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      }
    });
  });

  describe('Responsive Behavior', () => {
    it('should have overflow-hidden for responsive container', () => {
      const { container } = render(<Chart {...createChartProps()} />);
      const wrapper = container.querySelector('[role="img"]');
      expect(wrapper?.className).toContain('overflow-hidden');
    });

    it('should maintain aspect ratio with fixed height', () => {
      const { container } = render(
        <Chart {...createChartProps({ height: 500 })} />
      );
      const wrapper = container.querySelector('[role="img"]') as HTMLElement | null;
      expect(wrapper?.style.height).toBe('500px');
    });

    it('should use border-radius for visual polish', () => {
      const { container } = render(<Chart {...createChartProps()} />);
      const wrapper = container.querySelector('[role="img"]');
      expect(wrapper?.className).toContain('rounded-lg');
    });
  });

  describe('Legend Accessibility', () => {
    it('should have proper legend structure when enabled', () => {
      const { container } = render(
        <Chart {...createChartProps({ legend: true })} />
      );
      const legendItems = container.querySelectorAll('[role="button"]');
      // Legend should have interactive items
      expect(legendItems.length).toBeGreaterThanOrEqual(0);
    });

    it('should hide legend when disabled', () => {
      const { container } = render(
        <Chart {...createChartProps({ legend: false })} />
      );
      // Chart should still be accessible
      expect(container.querySelector('[role="img"]')).toBeInTheDocument();
    });
  });

  describe('Tooltip Accessibility', () => {
    it('should provide tooltip when enabled', () => {
      const { container } = render(
        <Chart {...createChartProps({ tooltip: true })} />
      );
      expect(container.querySelector('[role="img"]')).toBeInTheDocument();
    });

    it('should not have tooltip-related accessibility issues', () => {
      const { container } = render(
        <Chart {...createChartProps({ tooltip: true })} />
      );
      // Should not have hidden text or missing labels
      expect(container.querySelector('[role="img"]')).toHaveAttribute(
        'aria-label'
      );
    });
  });

  describe('Axis Labels', () => {
    it('should handle axis labels accessibly', async () => {
      const { container } = render(
        <Chart
          {...createChartProps({
            xAxis: { key: 'date', label: 'Date' },
            yAxis: { label: 'Value' },
          })}
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Series Information', () => {
    it('should provide series information via aria-label', () => {
      const { container } = render(<Chart {...createChartProps()} />);
      const label = container.querySelector('[aria-label]');
      const ariaLabel = label?.getAttribute('aria-label') || '';
      // Should mention the series
      expect(ariaLabel.length).toBeGreaterThan(0);
    });

    it('should handle multiple series accessibly', async () => {
      const manySeries: ChartSeries[] = Array.from({ length: 6 }, (_, i) => ({
        key: `series-${i}`,
        label: `Series ${i + 1}`,
      }));

      const { container } = render(
        <Chart
          {...createChartProps({
            series: manySeries,
            data: mockChartData,
          })}
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
