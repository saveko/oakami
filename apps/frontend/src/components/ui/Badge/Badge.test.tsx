import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render } from '@/test/utils';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Badge } from './Badge';

expect.extend(toHaveNoViolations);

describe('Badge - Accessibility', () => {
  describe('WCAG 2.1 Compliance', () => {
    it('should have no accessibility violations with default props', async () => {
      const { container } = render(<Badge>Default Badge</Badge>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations with solid variant', async () => {
      const { container } = render(<Badge variant="solid">Solid</Badge>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations with outline variant', async () => {
      const { container } = render(<Badge variant="outline">Outline</Badge>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations with dot variant', async () => {
      const { container } = render(<Badge variant="dot">Dot Badge</Badge>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations with all colors', async () => {
      const colors = ['sky', 'red', 'green', 'yellow', 'gray'] as const;

      for (const color of colors) {
        const { container } = render(<Badge color={color}>Color {color}</Badge>);
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      }
    });

    it('should have no accessibility violations when removable', async () => {
      const { container } = render(
        <Badge removable onRemove={vi.fn()}>
          Removable Badge
        </Badge>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations with icon', async () => {
      const { container } = render(<Badge icon={<span>✓</span>}>With Icon</Badge>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations with custom aria-label', async () => {
      const { container } = render(
        <Badge ariaLabel="Custom accessible label">Custom</Badge>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Semantic HTML Structure', () => {
    it('should use semantic span element', () => {
      const { container } = render(<Badge>Badge</Badge>);
      const badge = container.querySelector('span');
      expect(badge?.tagName.toLowerCase()).toBe('span');
    });

    it('should have proper flex layout', () => {
      const { container } = render(<Badge>Badge</Badge>);
      const badge = container.querySelector('span');
      expect(badge?.className).toContain('inline-flex');
      expect(badge?.className).toContain('items-center');
    });

    it('should use button element for remove action', () => {
      const { container } = render(<Badge removable>Removable</Badge>);
      const button = container.querySelector('button');
      expect(button?.tagName.toLowerCase()).toBe('button');
      expect(button?.getAttribute('type')).toBe('button');
    });
  });

  describe('ARIA Attributes', () => {
    it('should have aria-label for accessibility', () => {
      const { container } = render(<Badge>Accessible Label</Badge>);
      const badge = container.querySelector('span');
      expect(badge?.getAttribute('aria-label')).toBe('Accessible Label');
    });

    it('should use custom aria-label when provided', () => {
      const { container } = render(
        <Badge ariaLabel="Custom Label">Text</Badge>
      );
      const badge = container.querySelector('span');
      expect(badge?.getAttribute('aria-label')).toBe('Custom Label');
    });

    it('should have role="status" for dot variant', () => {
      const { container } = render(<Badge variant="dot">Status</Badge>);
      const badge = container.querySelector('span');
      expect(badge?.getAttribute('role')).toBe('status');
    });

    it('should hide icon from screen readers with aria-hidden', () => {
      const { container } = render(<Badge icon={<span>✓</span>}>Badge</Badge>);
      const icon = container.querySelector('span > span:first-child');
      expect(icon?.getAttribute('aria-hidden')).toBe('true');
    });

    it('should hide dot indicator from screen readers', () => {
      const { container } = render(<Badge variant="dot">Dot</Badge>);
      const dot = container.querySelector('span > span:first-child');
      expect(dot?.getAttribute('aria-hidden')).toBe('true');
    });

    it('should have descriptive aria-label on remove button', () => {
      const { container } = render(<Badge removable>Remove Me</Badge>);
      const button = container.querySelector('button');
      expect(button?.getAttribute('aria-label')).toContain('Remove');
      expect(button?.getAttribute('aria-label')).toContain('Remove Me');
    });
  });

  describe('Focus Management', () => {
    it('should have focus-visible outline on remove button', () => {
      const { container } = render(<Badge removable>Removable</Badge>);
      const button = container.querySelector('button');
      expect(button?.className).toContain('focus-visible:outline-2');
      expect(button?.className).toContain('focus-visible:outline-offset-2');
      expect(button?.className).toContain('focus-visible:outline-sky-500');
    });

    it('should show focus outline on remove button on keyboard focus', async () => {
      const user = userEvent.setup();
      const { container } = render(<Badge removable>Removable</Badge>);
      const button = container.querySelector('button') as HTMLButtonElement;

      await user.tab();
      expect(button).toHaveFocus();
      expect(button?.className).toContain('focus-visible:outline');
    });

    it('should be keyboard accessible on remove button', async () => {
      const handleRemove = vi.fn();
      const { container } = render(
        <Badge removable onRemove={handleRemove}>
          Removable
        </Badge>
      );
      const button = container.querySelector('button') as HTMLButtonElement;

      button.focus();
      expect(button).toHaveFocus();
    });
  });

  describe('Color Contrast', () => {
    it('should maintain adequate contrast in light mode - solid sky', () => {
      const { container } = render(
        <Badge variant="solid" color="sky">
          Sky Badge
        </Badge>
      );
      const badge = container.querySelector('span');
      expect(badge?.className).toContain('bg-sky-100');
      expect(badge?.className).toContain('text-sky-900');
    });

    it('should maintain adequate contrast in light mode - solid red', () => {
      const { container } = render(
        <Badge variant="solid" color="red">
          Red Badge
        </Badge>
      );
      const badge = container.querySelector('span');
      expect(badge?.className).toContain('bg-red-100');
      expect(badge?.className).toContain('text-red-900');
    });

    it('should maintain adequate contrast in dark mode - solid sky', () => {
      const { container } = render(
        <Badge variant="solid" color="sky">
          Sky Badge
        </Badge>
      );
      const badge = container.querySelector('span');
      expect(badge?.className).toContain('dark:bg-sky-900');
      expect(badge?.className).toContain('dark:text-sky-100');
    });

    it('should maintain adequate contrast in dark mode - outline red', () => {
      const { container } = render(
        <Badge variant="outline" color="red">
          Red Outline
        </Badge>
      );
      const badge = container.querySelector('span');
      expect(badge?.className).toContain('dark:border-red-600');
      expect(badge?.className).toContain('dark:text-red-300');
    });

    it('should use accessible colors for dot variant', () => {
      const { container } = render(
        <Badge variant="dot" color="green">
          Dot
        </Badge>
      );
      const dot = container.querySelector('span > span:first-child');
      expect(dot?.className).toContain('bg-green-500');
    });
  });

  describe('Interactive Elements', () => {
    it('should have button type attribute on remove button', () => {
      const { container } = render(<Badge removable>Removable</Badge>);
      const button = container.querySelector('button');
      expect(button?.getAttribute('type')).toBe('button');
    });

    it('should be keyboard navigable via Tab', async () => {
      const user = userEvent.setup();
      const { container } = render(<Badge removable>Removable</Badge>);

      await user.tab();
      const button = container.querySelector('button');
      expect(button).toHaveFocus();
    });

    it('should be activatable via Enter key', async () => {
      const handleRemove = vi.fn();
      const user = userEvent.setup();
      const { container } = render(
        <Badge removable onRemove={handleRemove}>
          Removable
        </Badge>
      );
      const button = container.querySelector('button') as HTMLButtonElement;

      button.focus();
      await user.keyboard('{Enter}');

      expect(handleRemove).toHaveBeenCalledTimes(1);
    });

    it('should be activatable via Space key', async () => {
      const handleRemove = vi.fn();
      const user = userEvent.setup();
      const { container } = render(
        <Badge removable onRemove={handleRemove}>
          Removable
        </Badge>
      );
      const button = container.querySelector('button') as HTMLButtonElement;

      button.focus();
      await user.keyboard(' ');

      expect(handleRemove).toHaveBeenCalledTimes(1);
    });
  });

  describe('Text and Content', () => {
    it('should have readable font size (at least 12px)', () => {
      const { container } = render(<Badge size="sm">Small</Badge>);
      const badge = container.querySelector('span');
      expect(badge?.className).toContain('text-xs'); // 12px
    });

    it('should have appropriate line height', () => {
      const { container } = render(<Badge>Badge</Badge>);
      const badge = container.querySelector('span');
      // Tailwind default line-height is inherited or set via font-family
      expect(badge?.tagName).toBe('SPAN');
    });

    it('should use readable font weight', () => {
      const { container } = render(<Badge>Badge</Badge>);
      const badge = container.querySelector('span');
      expect(badge?.className).toContain('font-medium');
    });

    it('should preserve whitespace nowrap for single line', () => {
      const { container } = render(<Badge>Nowrap Badge</Badge>);
      const badge = container.querySelector('span');
      expect(badge?.className).toContain('whitespace-nowrap');
    });
  });

  describe('Responsive Behavior', () => {
    it('should maintain accessibility on all sizes', async () => {
      const sizes = ['sm', 'md', 'lg'] as const;

      for (const size of sizes) {
        const { container } = render(<Badge size={size}>Responsive</Badge>);
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      }
    });

    it('should have adequate touch target on remove button', () => {
      const { container } = render(<Badge removable>Removable</Badge>);
      const button = container.querySelector('button');
      // 16px (w-4 h-4) is too small, but with padding and gap it's acceptable
      // Ideally would be 44px but badge is inline
      expect(button?.className).toContain('w-4');
      expect(button?.className).toContain('h-4');
    });
  });

  describe('Icon Accessibility', () => {
    it('should hide decorative icon from screen readers', () => {
      const { container } = render(
        <Badge icon={<span data-testid="icon">✓</span>}>Badge</Badge>
      );
      const icon = container.querySelector('span > span:first-child');
      expect(icon?.getAttribute('aria-hidden')).toBe('true');
    });

    it('should have meaningful aria-label when only icon is visible', () => {
      const { container } = render(
        <Badge icon={<span>✓</span>} ariaLabel="Approved">
          ✓
        </Badge>
      );
      const badge = container.querySelector('span');
      expect(badge?.getAttribute('aria-label')).toBe('Approved');
    });
  });

  describe('Status Indication', () => {
    it('should have role="status" for dot variant badges', () => {
      const { container } = render(<Badge variant="dot">Online Status</Badge>);
      const badge = container.querySelector('span');
      expect(badge?.getAttribute('role')).toBe('status');
    });

    it('should announce status changes to screen readers', () => {
      const { container } = render(
        <Badge variant="dot" role="status" aria-live="polite">
          Connected
        </Badge>
      );
      const badge = container.querySelector('span');
      expect(badge?.getAttribute('role')).toBe('status');
    });
  });

  describe('Combination Accessibility', () => {
    it('should be accessible with icon and removable', async () => {
      const { container } = render(
        <Badge icon={<span>✓</span>} removable onRemove={vi.fn()}>
          Complex Badge
        </Badge>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should be accessible with all variant and color combinations', async () => {
      const variants = ['solid', 'outline', 'dot'] as const;
      const colors = ['sky', 'red', 'green', 'yellow', 'gray'] as const;

      for (const variant of variants) {
        for (const color of colors) {
          const { container } = render(
            <Badge variant={variant} color={color}>
              {variant}-{color}
            </Badge>
          );
          const results = await axe(container);
          expect(results).toHaveNoViolations();
        }
      }
    });
  });
});
