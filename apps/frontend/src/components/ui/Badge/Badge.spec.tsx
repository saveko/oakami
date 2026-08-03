import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Badge } from './Badge';

describe('Badge Component', () => {
  describe('Rendering', () => {
    it('should render with default props', () => {
      const { container } = render(<Badge>Default Badge</Badge>);
      expect(container.querySelector('span')).toBeInTheDocument();
      expect(screen.getByText('Default Badge')).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      const { container } = render(<Badge className="custom-class">Custom</Badge>);
      const badge = container.querySelector('span');
      expect(badge?.className).toContain('custom-class');
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLSpanElement>();
      render(<Badge ref={ref}>Badge</Badge>);
      expect(ref.current).toBeTruthy();
      expect(ref.current?.tagName).toBe('SPAN');
    });

    it('should render with icon', () => {
      render(<Badge icon={<span>🎯</span>}>With Icon</Badge>);
      expect(screen.getByText('🎯')).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    it('should render solid variant by default', () => {
      const { container } = render(<Badge>Solid</Badge>);
      const badge = container.querySelector('span');
      expect(badge?.className).toContain('bg-gray-100');
    });

    it('should render solid variant with sky color', () => {
      const { container } = render(<Badge variant="solid" color="sky">Solid Sky</Badge>);
      const badge = container.querySelector('span');
      expect(badge?.className).toContain('bg-sky-100');
      expect(badge?.className).toContain('text-sky-900');
    });

    it('should render outline variant', () => {
      const { container } = render(<Badge variant="outline">Outline</Badge>);
      const badge = container.querySelector('span');
      expect(badge?.className).toContain('border');
    });

    it('should render dot variant', () => {
      const { container } = render(<Badge variant="dot">Dot</Badge>);
      const badge = container.querySelector('span');
      expect(badge?.className).toContain('text-gray-700');
      const dot = container.querySelector('span > span:first-child');
      expect(dot?.className).toContain('bg-gray-500');
    });

    it('should render dot with colored indicator', () => {
      const { container } = render(<Badge variant="dot" color="red">Dot Red</Badge>);
      const dot = container.querySelector('span > span:first-child');
      expect(dot?.className).toContain('bg-red-500');
    });
  });

  describe('Colors', () => {
    it('should render sky color', () => {
      const { container } = render(<Badge color="sky">Sky</Badge>);
      const badge = container.querySelector('span');
      expect(badge?.className).toContain('bg-sky-100');
    });

    it('should render red color', () => {
      const { container } = render(<Badge color="red">Red</Badge>);
      const badge = container.querySelector('span');
      expect(badge?.className).toContain('bg-red-100');
    });

    it('should render green color', () => {
      const { container } = render(<Badge color="green">Green</Badge>);
      const badge = container.querySelector('span');
      expect(badge?.className).toContain('bg-green-100');
    });

    it('should render yellow color', () => {
      const { container } = render(<Badge color="yellow">Yellow</Badge>);
      const badge = container.querySelector('span');
      expect(badge?.className).toContain('bg-yellow-100');
    });

    it('should render gray color (default)', () => {
      const { container } = render(<Badge color="gray">Gray</Badge>);
      const badge = container.querySelector('span');
      expect(badge?.className).toContain('bg-gray-100');
    });
  });

  describe('Sizes', () => {
    it('should render small size', () => {
      const { container } = render(<Badge size="sm">Small</Badge>);
      const badge = container.querySelector('span');
      expect(badge?.className).toContain('px-2');
      expect(badge?.className).toContain('py-1');
      expect(badge?.className).toContain('text-xs');
    });

    it('should render medium size (default)', () => {
      const { container } = render(<Badge size="md">Medium</Badge>);
      const badge = container.querySelector('span');
      expect(badge?.className).toContain('px-3');
      expect(badge?.className).toContain('py-1.5');
      expect(badge?.className).toContain('text-sm');
    });

    it('should render large size', () => {
      const { container } = render(<Badge size="lg">Large</Badge>);
      const badge = container.querySelector('span');
      expect(badge?.className).toContain('px-4');
      expect(badge?.className).toContain('py-2');
      expect(badge?.className).toContain('text-base');
    });
  });

  describe('Removable Badge', () => {
    it('should render remove button when removable is true', () => {
      render(<Badge removable>Removable</Badge>);
      expect(screen.getByLabelText(/Remove/)).toBeInTheDocument();
    });

    it('should not render remove button when removable is false (default)', () => {
      render(<Badge>Not Removable</Badge>);
      expect(screen.queryByLabelText(/Remove/)).not.toBeInTheDocument();
    });

    it('should call onRemove when remove button clicked', () => {
      const handleRemove = jest.fn();
      render(
        <Badge removable onRemove={handleRemove}>
          Removable
        </Badge>
      );

      const removeButton = screen.getByLabelText(/Remove/);
      fireEvent.click(removeButton);

      expect(handleRemove).toHaveBeenCalledTimes(1);
    });

    it('should stop propagation when remove button clicked', () => {
      const handleClick = jest.fn();
      render(
        <Badge removable onClick={handleClick}>
          Removable
        </Badge>
      );

      const removeButton = screen.getByLabelText(/Remove/);
      fireEvent.click(removeButton);

      // Only onRemove should fire, not parent click
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should have focus visible outline on remove button', () => {
      const { container } = render(<Badge removable>Removable</Badge>);
      const button = container.querySelector('button');
      expect(button?.className).toContain('focus-visible:outline-2');
      expect(button?.className).toContain('focus-visible:outline-sky-500');
    });
  });

  describe('Dark Mode', () => {
    it('should have dark mode classes on solid variant', () => {
      const { container } = render(<Badge variant="solid">Dark Mode</Badge>);
      const badge = container.querySelector('span');
      expect(badge?.className).toContain('dark:');
    });

    it('should have dark mode background on outline variant', () => {
      const { container } = render(<Badge variant="outline">Dark Mode</Badge>);
      const badge = container.querySelector('span');
      expect(badge?.className).toContain('dark:border-');
      expect(badge?.className).toContain('dark:text-');
    });
  });

  describe('Icon and Content', () => {
    it('should render with leading icon', () => {
      render(
        <Badge icon={<span data-testid="badge-icon">✓</span>}>
          With Icon
        </Badge>
      );
      expect(screen.getByTestId('badge-icon')).toBeInTheDocument();
    });

    it('should hide icon from screen readers', () => {
      const { container } = render(
        <Badge icon={<span>✓</span>}>Badge</Badge>
      );
      const iconContainer = container.querySelector('span > span:first-child');
      expect(iconContainer?.getAttribute('aria-hidden')).toBe('true');
    });

    it('should hide dot from screen readers', () => {
      const { container } = render(<Badge variant="dot">Dot</Badge>);
      const dot = container.querySelector('span > span:first-child');
      expect(dot?.getAttribute('aria-hidden')).toBe('true');
    });
  });

  describe('ARIA and Accessibility', () => {
    it('should have aria-label from children', () => {
      const { container } = render(<Badge>Label Text</Badge>);
      const badge = container.querySelector('span');
      expect(badge?.getAttribute('aria-label')).toBe('Label Text');
    });

    it('should accept custom aria-label', () => {
      const { container } = render(<Badge ariaLabel="Custom Label">Text</Badge>);
      const badge = container.querySelector('span');
      expect(badge?.getAttribute('aria-label')).toBe('Custom Label');
    });

    it('should have role="status" for dot variant', () => {
      const { container } = render(<Badge variant="dot">Status</Badge>);
      const badge = container.querySelector('span');
      expect(badge?.getAttribute('role')).toBe('status');
    });

    it('should not have role attribute for other variants', () => {
      const { container } = render(<Badge variant="solid">Solid</Badge>);
      const badge = container.querySelector('span');
      expect(badge?.getAttribute('role')).toBeNull();
    });
  });

  describe('Combinations', () => {
    it('should render with all variant + color + size combinations', () => {
      const variants = ['solid', 'outline', 'dot'] as const;
      const colors = ['sky', 'red', 'green', 'yellow', 'gray'] as const;
      const sizes = ['sm', 'md', 'lg'] as const;

      variants.forEach((variant) => {
        colors.forEach((color) => {
          sizes.forEach((size) => {
            const { container } = render(
              <Badge variant={variant} color={color} size={size}>
                {`${variant}-${color}-${size}`}
              </Badge>
            );
            expect(container.querySelector('span')).toBeInTheDocument();
          });
        });
      });
    });

    it('should render with icon, removable, and custom class', () => {
      const handleRemove = jest.fn();
      render(
        <Badge
          icon={<span>🎯</span>}
          removable
          onRemove={handleRemove}
          className="custom"
          color="red"
          size="lg"
        >
          Complex Badge
        </Badge>
      );

      expect(screen.getByText('🎯')).toBeInTheDocument();
      expect(screen.getByText('Complex Badge')).toBeInTheDocument();
      expect(screen.getByLabelText(/Remove/)).toBeInTheDocument();

      fireEvent.click(screen.getByLabelText(/Remove/));
      expect(handleRemove).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty children', () => {
      const { container } = render(<Badge />);
      expect(container.querySelector('span')).toBeInTheDocument();
    });

    it('should handle React node children', () => {
      render(
        <Badge>
          <strong>Bold</strong> and <em>italic</em>
        </Badge>
      );
      expect(screen.getByText('Bold')).toBeInTheDocument();
      expect(screen.getByText('italic')).toBeInTheDocument();
    });

    it('should handle long text gracefully', () => {
      const longText = 'This is a very long badge text that might wrap';
      render(<Badge>{longText}</Badge>);
      expect(screen.getByText(longText)).toBeInTheDocument();
    });
  });
});
