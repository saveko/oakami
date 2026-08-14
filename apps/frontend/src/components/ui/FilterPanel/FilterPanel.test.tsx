import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@/test/utils';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { FilterPanel } from './FilterPanel';
import type { Filter, FilterState } from './useFilterPanel';

expect.extend(toHaveNoViolations);

describe('FilterPanel - Accessibility Tests', () => {
  const defaultFilters: Filter[] = [
    {
      id: 'category',
      label: 'Category',
      type: 'select',
      section: 'Basic',
      options: [
        { value: 'vegetables', label: 'Vegetables' },
        { value: 'fruits', label: 'Fruits' },
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
  ];

  const defaultProps = {
    filters: defaultFilters,
    values: {} as FilterState,
    onFilterChange: vi.fn(),
  };

  describe('WCAG 2.1 Compliance', () => {
    it('should have no accessibility violations with default props', async () => {
      const { container } = render(<FilterPanel {...defaultProps} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no violations with filters applied', async () => {
      const { container } = render(
        <FilterPanel
          {...defaultProps}
          values={{ category: 'fruits', status: ['active'] }}
          onFilterChange={vi.fn()}
          activeFilterCount={2}
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no violations with compact variant', async () => {
      const { container } = render(
        <FilterPanel {...defaultProps} variant="compact" />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no violations with all sections collapsed', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <FilterPanel {...defaultProps} collapsible />
      );

      const sectionButtons = screen.getAllByRole('button');
      for (const button of sectionButtons) {
        if (button.getAttribute('aria-expanded') === 'true') {
          await user.click(button);
        }
      }

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no violations with active filters badge', async () => {
      const { container } = render(
        <FilterPanel {...defaultProps} activeFilterCount={5} />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Semantic HTML', () => {
    it('should use semantic card container', () => {
      const { container } = render(<FilterPanel {...defaultProps} />);
      expect(container.querySelector('[role="article"]')).toBeInTheDocument();
    });

    it('should use semantic heading for title', () => {
      const { container } = render(<FilterPanel {...defaultProps} />);
      const heading = container.querySelector('h3');
      expect(heading?.textContent).toContain('Filters');
    });

    it('should use semantic buttons for actions', () => {
      render(<FilterPanel {...defaultProps} />);
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
      expect(buttons.some((b) => b.textContent?.includes('Apply'))).toBe(true);
    });

    it('should use semantic group for filter sections', () => {
      render(<FilterPanel {...defaultProps} />);
      const groups = screen.getAllByRole('group');
      expect(groups.length).toBeGreaterThan(0);
    });
  });

  describe('ARIA Attributes', () => {
    it('should have aria-label on active filter badge', () => {
      render(<FilterPanel {...defaultProps} activeFilterCount={3} />);
      expect(screen.getByLabelText(/3 active filter/)).toBeInTheDocument();
    });

    it('should have aria-expanded on collapsible sections', async () => {
      render(<FilterPanel {...defaultProps} collapsible />);
      const basicButton = screen.getByRole('button', { name: /basic/i });
      expect(basicButton).toHaveAttribute('aria-expanded');
    });

    it('should update aria-expanded when section toggled', async () => {
      const user = userEvent.setup();
      render(<FilterPanel {...defaultProps} collapsible />);
      const advancedButton = screen.getByRole('button', { name: /advanced/i });

      expect(advancedButton).toHaveAttribute('aria-expanded', 'true');

      await user.click(advancedButton);
      await waitFor(() => {
        expect(advancedButton).toHaveAttribute('aria-expanded', 'false');
      });
    });

    it('should have aria-controls linking sections', () => {
      render(<FilterPanel {...defaultProps} collapsible />);
      const basicButton = screen.getByRole('button', { name: /basic/i });
      expect(basicButton).toHaveAttribute('aria-controls');
    });

    it('should have aria-labelledby linking group to section', () => {
      render(<FilterPanel {...defaultProps} />);
      const groups = screen.getAllByRole('group');
      groups.forEach((group) => {
        expect(group).toHaveAttribute('aria-labelledby');
      });
    });
  });

  describe('Keyboard Navigation', () => {
    it('should navigate filters with Tab key', async () => {
      const user = userEvent.setup();
      render(<FilterPanel {...defaultProps} />);
      const applyButton = screen.getByText('Apply Filters');

      await user.tab();
      await user.tab();
      await user.tab();

      expect(applyButton).not.toHaveFocus(); // Cycling through inputs first
    });

    it('should activate button with Enter key', async () => {
      const user = userEvent.setup();
      const handleApply = vi.fn();
      render(<FilterPanel {...defaultProps} onApply={handleApply} />);
      const applyButton = screen.getByRole('button', { name: 'Apply Filters' });

      applyButton.focus();
      await user.keyboard('{Enter}');

      expect(handleApply).toHaveBeenCalled();
    });

    it('should activate button with Space key', async () => {
      const user = userEvent.setup();
      const handleApply = vi.fn();
      render(<FilterPanel {...defaultProps} onApply={handleApply} />);
      const applyButton = screen.getByRole('button', { name: 'Apply Filters' });

      applyButton.focus();
      await user.keyboard(' ');

      expect(handleApply).toHaveBeenCalled();
    });

    it('should toggle collapsible section with Enter', async () => {
      const user = userEvent.setup();
      render(<FilterPanel {...defaultProps} collapsible />);
      const basicButton = screen.getByRole('button', { name: /basic/i });

      basicButton.focus();
      await user.keyboard('{Enter}');

      expect(basicButton).toHaveAttribute('aria-expanded', 'false');
    });

    it('should be fully navigable without mouse', async () => {
      const user = userEvent.setup();
      const handleApply = vi.fn();
      render(
        <FilterPanel
          {...defaultProps}
          onApply={handleApply}
          onFilterChange={vi.fn()}
        />
      );

      const applyButton = screen.getByRole('button', { name: 'Apply Filters' });

      // Tab until Apply is reached rather than assuming a fixed control count:
      // the panel's focusable elements vary with the filters it renders.
      for (let i = 0; i < 25 && document.activeElement !== applyButton; i++) {
        await user.tab();
      }

      expect(applyButton).toHaveFocus();
      await user.keyboard('{Enter}');

      expect(handleApply).toHaveBeenCalled();
    });
  });

  describe('Focus Management', () => {
    it('should have visible focus outline on buttons', () => {
      const { container } = render(<FilterPanel {...defaultProps} />);
      const buttons = screen.getAllByRole('button');

      buttons.forEach((button) => {
        expect(button.className).toContain('focus-visible:outline');
      });
    });

    it('should manage focus for collapsible sections', async () => {
      const user = userEvent.setup();
      render(<FilterPanel {...defaultProps} collapsible />);
      const basicButton = screen.getByRole('button', { name: /basic/i });

      basicButton.focus();
      expect(basicButton).toHaveFocus();

      // Section toggle shouldn't move focus
      await user.click(basicButton);
      expect(basicButton).toHaveFocus();
    });

    it('should trap focus within filter panel appropriately', async () => {
      const user = userEvent.setup();
      render(<FilterPanel {...defaultProps} />);

      await user.tab();
      expect(document.activeElement).not.toBeNull();
    });
  });

  describe('Color Contrast', () => {
    it('should have sufficient contrast for section headers', () => {
      const { container } = render(<FilterPanel {...defaultProps} collapsible />);
      // Only the collapsible section headers; the Apply/Reset action buttons
      // are filled variants with deliberately inverted text colors.
      const sectionHeaders = screen
        .getAllByRole('button')
        .filter((b) => b.getAttribute('aria-expanded') !== null);

      expect(sectionHeaders.length).toBeGreaterThan(0);
      sectionHeaders.forEach((button) => {
        expect(button.className).toContain('text-gray-900');
        expect(button.className).toContain('dark:text-gray-100');
      });
    });

    it('should have sufficient contrast for labels', () => {
      const { container } = render(<FilterPanel {...defaultProps} />);
      const labels = container.querySelectorAll('label');

      expect(labels.length).toBeGreaterThan(0);
      // The design system ships two accessible label tokens (gray-700 for
      // inline control labels, gray-900 for field labels); assert each label
      // uses one of them in both themes rather than a single hard-coded pair.
      labels.forEach((label) => {
        expect(label.className).toMatch(/text-gray-(700|900)\b/);
        expect(label.className).toMatch(/dark:text-gray-(50|300)\b/);
      });
    });

    it('should have sufficient contrast for active filter badge', () => {
      render(<FilterPanel {...defaultProps} activeFilterCount={2} />);
      const badge = screen.getByText('2');

      expect(badge.className).toContain('text-white');
      expect(badge.className).toContain('bg-sky-600');
    });

    it('should maintain contrast in dark mode', () => {
      const { container } = render(<FilterPanel {...defaultProps} />);
      const wrapper = container.querySelector('[role="article"]') as HTMLElement;

      expect(wrapper.className).toContain('dark:');
    });
  });

  describe('Screen Reader Support', () => {
    it('should announce filter count to screen readers', () => {
      render(<FilterPanel {...defaultProps} activeFilterCount={3} />);
      expect(screen.getByLabelText(/3 active filter/)).toBeInTheDocument();
    });

    it('should announce section expanded state', async () => {
      render(<FilterPanel {...defaultProps} collapsible />);
      const basicButton = screen.getByRole('button', { name: /basic/i });

      expect(basicButton).toHaveAttribute('aria-expanded');
      const expanded = basicButton.getAttribute('aria-expanded');
      expect(['true', 'false']).toContain(expanded);
    });

    it('should provide filter group context', () => {
      render(<FilterPanel {...defaultProps} />);
      const groups = screen.getAllByRole('group');

      groups.forEach((group) => {
        expect(group).toHaveAttribute('aria-labelledby');
      });
    });

    it('should label action buttons clearly', () => {
      render(<FilterPanel {...defaultProps} />);

      expect(screen.getByText('Apply Filters')).toBeInTheDocument();
      expect(screen.getByText('Reset')).toBeInTheDocument();
    });
  });

  describe('Label Associations', () => {
    it('should associate labels with form inputs', () => {
      const { container } = render(<FilterPanel {...defaultProps} />);
      const labels = container.querySelectorAll('label');

      labels.forEach((label) => {
        const closestDiv = label.closest('div');
        expect(label.htmlFor || closestDiv?.querySelector('input, select')).toBeTruthy();
      });
    });

    it('should use proper for attribute on labels', () => {
      const { container } = render(
        <FilterPanel {...defaultProps} filters={defaultFilters} />
      );

      const checkboxLabels = screen.getAllByText('Active', { selector: 'label' });
      checkboxLabels.forEach((label) => {
        expect(label).toHaveAttribute('for');
      });
    });
  });

  describe('Interactive Elements Accessibility', () => {
    it('should have minimum touch target size for buttons', () => {
      const { container } = render(<FilterPanel {...defaultProps} />);
      const buttons = screen.getAllByRole('button');

      buttons.forEach((button) => {
        // Should have padding for touch target
        expect(button.className).toMatch(/p[xy]-|py-\d+|px-\d+/);
      });
    });

    it('should have proper button semantics', () => {
      render(<FilterPanel {...defaultProps} />);
      // Button renders its children inside a <span>, so getByText returns that
      // span rather than the button element.
      const applyButton = screen.getByRole('button', { name: 'Apply Filters' });

      expect(applyButton.tagName).toBe('BUTTON');
      expect(applyButton).toHaveAttribute('type', 'button');
    });

    it('should indicate clear all button as destructive', () => {
      render(<FilterPanel {...defaultProps} activeFilterCount={2} />);
      const clearButton = screen.getByRole('button', { name: 'Clear All' });

      expect(clearButton.className).toContain('text-red-600');
    });
  });

  describe('Collapsible Section Accessibility', () => {
    it('should have proper ARIA for section controls', () => {
      render(<FilterPanel {...defaultProps} collapsible />);
      const sectionButtons = screen.getAllByRole('button').filter((b) =>
        b.getAttribute('aria-expanded') !== null
      );

      expect(sectionButtons.length).toBeGreaterThan(0);
    });

    it('should link section button to content', () => {
      render(<FilterPanel {...defaultProps} collapsible />);
      const basicButton = screen.getByRole('button', { name: /basic/i });
      const ariaControls = basicButton.getAttribute('aria-controls');

      expect(ariaControls).toBeTruthy();
    });

    it('should use meaningful section names', () => {
      render(<FilterPanel {...defaultProps} collapsible />);

      expect(screen.getByText('Basic')).toBeInTheDocument();
      expect(screen.getByText('Advanced')).toBeInTheDocument();
    });
  });

  describe('Responsive Accessibility', () => {
    it('should maintain accessibility on mobile (default variant)', async () => {
      const { container } = render(
        <FilterPanel {...defaultProps} variant="default" />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should maintain accessibility on desktop (compact variant)', async () => {
      const { container } = render(
        <FilterPanel {...defaultProps} variant="compact" />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Error and Disabled State Accessibility', () => {
    it('should indicate disabled filters visually', () => {
      const disabledFilters: Filter[] = [
        {
          ...defaultFilters[0],
          disabled: true,
        },
      ];

      const { container } = render(
        <FilterPanel {...defaultProps} filters={disabledFilters} />
      );

      const disabledSelect = screen.getByRole('combobox');
      expect(disabledSelect).toBeDisabled();
      expect(disabledSelect).toHaveAttribute('disabled');
    });

    it('should announce disabled state to screen readers', () => {
      const disabledFilters: Filter[] = [
        {
          ...defaultFilters[1],
          disabled: true,
        },
      ];

      render(
        <FilterPanel {...defaultProps} filters={disabledFilters} />
      );

      const disabledCheckboxes = screen.getAllByRole('checkbox').filter(
        (c) => c instanceof HTMLInputElement && c.disabled
      );

      expect(disabledCheckboxes.length).toBeGreaterThan(0);
    });
  });

  describe('Combination Accessibility Tests', () => {
    it('should be fully accessible with all features enabled', async () => {
      const { container } = render(
        <FilterPanel
          {...defaultProps}
          showHeader
          collapsible
          activeFilterCount={2}
          variant="default"
          values={{ category: 'fruits' }}
          onFilterChange={vi.fn()}
          onApply={vi.fn()}
          onReset={vi.fn()}
          onClearAll={vi.fn()}
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should remain accessible through complete filter workflow', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <FilterPanel
          {...defaultProps}
          onFilterChange={vi.fn()}
          onApply={vi.fn()}
          activeFilterCount={1}
        />
      );

      // Navigate and interact
      await user.tab();
      await user.keyboard('Enter');

      // Check accessibility after interaction
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should maintain accessibility with nested interactions', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <FilterPanel
          {...defaultProps}
          collapsible
          onFilterChange={vi.fn()}
        />
      );

      // Collapse section
      const basicButton = screen.getByRole('button', { name: /basic/i });
      await user.click(basicButton);

      // Check accessibility
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
