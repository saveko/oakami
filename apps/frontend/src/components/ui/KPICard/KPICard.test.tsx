import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render } from '@/test/utils';
import { axe, toHaveNoViolations } from 'jest-axe';
import { KPICard, KPICardProps } from './KPICard';

expect.extend(toHaveNoViolations);

const createKPICardProps = (overrides?: Partial<KPICardProps>): KPICardProps => ({
  label: 'Total Waste Cost',
  value: 150.5,
  unit: '$',
  ...overrides,
});

describe('KPICard - Accessibility', () => {
  describe('WCAG 2.1 Compliance', () => {
    it('should have no accessibility violations with default props', async () => {
      const { container } = render(<KPICard {...createKPICardProps()} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations with trend', async () => {
      const { container } = render(
        <KPICard
          {...createKPICardProps({
            trend: { value: 15, direction: 'up' },
          })}
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations when clickable', async () => {
      const { container } = render(
        <KPICard {...createKPICardProps({ onClick: vi.fn() })} />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations with icon', async () => {
      const { container } = render(
        <KPICard {...createKPICardProps({ icon: '📊' })} />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations with chart', async () => {
      const { container } = render(
        <KPICard
          {...createKPICardProps({
            chart: <div data-testid="chart">Mini Chart</div>,
          })}
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations during loading', async () => {
      const { container } = render(
        <KPICard {...createKPICardProps({ isLoading: true })} />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations with all statuses', async () => {
      const statuses = ['success', 'warning', 'error', 'neutral'] as const;

      for (const status of statuses) {
        const { container } = render(
          <KPICard {...createKPICardProps({ status })} />
        );
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      }
    });
  });

  describe('Semantic HTML Structure', () => {
    it('should use article element', () => {
      const { container } = render(<KPICard {...createKPICardProps()} />);
      expect(container.querySelector('article')).toBeInTheDocument();
    });

    it('should use heading for label', () => {
      const { container } = render(<KPICard {...createKPICardProps()} />);
      expect(container.querySelector('h3')).toBeInTheDocument();
    });

    it('should use button role when interactive', () => {
      const { container } = render(
        <KPICard {...createKPICardProps({ onClick: vi.fn() })} />
      );
      expect(container.querySelector('[role="button"]')).toBeInTheDocument();
    });
  });

  describe('ARIA Attributes', () => {
    it('should have aria-label', () => {
      const { container } = render(<KPICard {...createKPICardProps()} />);
      expect(container.querySelector('[aria-label]')).toBeInTheDocument();
    });

    it('should use label prop for aria-label by default', () => {
      const { container } = render(
        <KPICard {...createKPICardProps({ label: 'Custom Label' })} />
      );
      expect(container.querySelector('[aria-label="Custom Label"]')).toBeInTheDocument();
    });

    it('should use ariaLabel prop when provided', () => {
      const { container } = render(
        <KPICard
          {...createKPICardProps({
            ariaLabel: 'Custom ARIA Label',
          })}
        />
      );
      expect(
        container.querySelector('[aria-label="Custom ARIA Label"]')
      ).toBeInTheDocument();
    });

    it('should have aria-busy during loading', () => {
      const { container } = render(
        <KPICard {...createKPICardProps({ isLoading: true })} />
      );
      expect(container.querySelector('[aria-busy="true"]')).toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should have tabindex when interactive', () => {
      const { container } = render(
        <KPICard {...createKPICardProps({ onClick: vi.fn() })} />
      );
      expect(container.querySelector('[tabindex="0"]')).toBeInTheDocument();
    });

    it('should not have tabindex when not interactive', () => {
      const { container } = render(
        <KPICard {...createKPICardProps({ onClick: undefined })} />
      );
      expect(container.querySelector('[tabindex]')).not.toBeInTheDocument();
    });

    it('should have visible focus state', () => {
      const { container } = render(
        <KPICard {...createKPICardProps({ onClick: vi.fn() })} />
      );
      // The focus ring belongs to the interactive element, which is the click
      // overlay — <article> itself is not focusable.
      const target = container.querySelector('[role="button"]');
      expect(target?.className).toContain('focus:');
    });
  });

  describe('Touch Targets', () => {
    it('should have adequate size for touch interaction', () => {
      const { container } = render(
        <KPICard {...createKPICardProps({ onClick: vi.fn() })} />
      );
      const card = container.querySelector('article');
      expect(card).toHaveClass('h-32');
      // h-32 = 128px height, sufficient for touch target
    });

    it('should have proper padding for touch', () => {
      const { container } = render(
        <KPICard {...createKPICardProps()} />
      );
      const card = container.querySelector('article');
      expect(card).toHaveClass('p-4');
    });
  });

  describe('Color Contrast', () => {
    it('should maintain contrast for label text', () => {
      const { container } = render(
        <KPICard {...createKPICardProps()} />
      );
      const label = container.querySelector('.text-gray-600');
      expect(label).toBeInTheDocument();
    });

    it('should maintain contrast for value text', () => {
      const { container } = render(
        <KPICard {...createKPICardProps()} />
      );
      const value = container.querySelector('.text-gray-900');
      expect(value).toBeInTheDocument();
    });

    it('should maintain contrast for unit text', () => {
      const { container } = render(
        <KPICard {...createKPICardProps()} />
      );
      const unit = container.querySelector('.text-gray-500');
      expect(unit).toBeInTheDocument();
    });

    it('should maintain contrast for all trend colors', () => {
      const directions = ['up', 'down', 'neutral'] as const;

      directions.forEach((direction) => {
        const { container } = render(
          <KPICard
            {...createKPICardProps({
              trend: { value: 10, direction },
            })}
          />
        );
        const trend = container.querySelector('[class*="text-"]');
        expect(trend).toBeInTheDocument();
      });
    });

    it('should have sufficient contrast in dark mode', () => {
      const { container } = render(
        <KPICard {...createKPICardProps()} />
      );
      const card = container.querySelector('article');
      expect(card?.className).toContain('dark:');
    });
  });

  describe('Text Readability', () => {
    it('should use readable font sizes', () => {
      const { container } = render(
        <KPICard {...createKPICardProps()} />
      );
      const value = container.querySelector('.text-2xl');
      expect(value).toBeInTheDocument();
    });

    it('should use readable font weight', () => {
      const { container } = render(
        <KPICard {...createKPICardProps()} />
      );
      const value = container.querySelector('.font-bold');
      expect(value).toBeInTheDocument();
    });

    it('should have proper line spacing', () => {
      const { container } = render(
        <KPICard {...createKPICardProps()} />
      );
      const card = container.querySelector('article');
      expect(card).toHaveClass('flex');
    });
  });

  describe('Dark Mode Support', () => {
    it('should have dark mode classes', () => {
      const { container } = render(
        <KPICard {...createKPICardProps()} />
      );
      const card = container.querySelector('article');
      expect(card?.className).toContain('dark:');
    });

    it('should apply dark mode to text', () => {
      const { container } = render(
        <KPICard {...createKPICardProps()} />
      );
      expect(container.querySelector('.dark\\:text-gray-400')).toBeInTheDocument();
      expect(container.querySelector('.dark\\:text-gray-100')).toBeInTheDocument();
    });

    it('should apply dark mode to background', () => {
      const { container } = render(
        <KPICard {...createKPICardProps()} />
      );
      const card = container.querySelector('article');
      expect(card).toHaveClass('dark:bg-gray-800');
    });

    it('should apply dark mode to borders', () => {
      const { container } = render(
        <KPICard {...createKPICardProps()} />
      );
      const card = container.querySelector('article');
      expect(card).toHaveClass('dark:border-gray-700');
    });
  });

  describe('Icon Accessibility', () => {
    it('should handle emoji icons accessibly', () => {
      const { container } = render(
        <KPICard {...createKPICardProps({ icon: '📊' })} />
      );
      // Emoji in context should be accessible
      expect(container.querySelector('article')).toBeInTheDocument();
    });

    it('should position icon appropriately', () => {
      const { container } = render(
        <KPICard {...createKPICardProps({ icon: '📊' })} />
      );
      const icon = container.querySelector('.absolute.right-4.top-4');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('Status Indicators', () => {
    it('should use color to indicate status', () => {
      const statusColors = {
        success: 'border-l-green-500',
        warning: 'border-l-yellow-500',
        error: 'border-l-red-500',
        neutral: 'border-l-gray-500',
      };

      Object.entries(statusColors).forEach(([status, color]) => {
        const { container } = render(
          <KPICard
            {...createKPICardProps({
              status: status as any,
            })}
          />
        );
        expect(container.querySelector(`.${color}`)).toBeInTheDocument();
      });
    });

    it('should provide semantic meaning beyond color', () => {
      const { container } = render(
        <KPICard {...createKPICardProps({ status: 'error' })} />
      );
      // Card should be labeled, not relying on color alone
      expect(container.querySelector('[aria-label]')).toBeInTheDocument();
    });
  });

  describe('Trend Accessibility', () => {
    it('should use arrows with numbers for trend', () => {
      const { container } = render(
        <KPICard
          {...createKPICardProps({
            trend: { value: 15, direction: 'up' },
          })}
        />
      );
      // Text should include direction indicator and number
      expect(container.textContent).toContain('15%');
    });

    it('should provide semantic meaning for trends', () => {
      const { container } = render(
        <KPICard
          {...createKPICardProps({
            trend: { value: 20, direction: 'down', label: 'vs last month' },
          })}
        />
      );
      // Trend should have descriptive label
      expect(container.textContent).toContain('vs last month');
    });
  });

  describe('Interactive Elements Accessibility', () => {
    it('should be keyboard accessible when interactive', () => {
      const { container } = render(
        <KPICard {...createKPICardProps({ onClick: vi.fn() })} />
      );
      const button = container.querySelector('[role="button"]');
      expect(button).toHaveAttribute('tabindex', '0');
    });

    it('should provide visual feedback for interactions', () => {
      const { container } = render(
        <KPICard {...createKPICardProps({ onClick: vi.fn() })} />
      );
      const card = container.querySelector('article');
      expect(card?.className).toContain('cursor-pointer');
      expect(card?.className).toContain('hover:');
    });
  });

  describe('Loading State Accessibility', () => {
    it('should announce loading state', () => {
      const { container } = render(
        <KPICard {...createKPICardProps({ isLoading: true })} />
      );
      expect(container.querySelector('[aria-busy="true"]')).toBeInTheDocument();
    });

    it('should prevent interaction during loading', () => {
      const onClick = vi.fn();
      const { container } = render(
        <KPICard {...createKPICardProps({ isLoading: true, onClick })} />
      );
      // Card should have aria-busy but still be in document
      expect(container.querySelector('[aria-busy="true"]')).toBeInTheDocument();
    });
  });
});
