import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  describe('Rendering', () => {
    it('renders button with text', () => {
      render(<Button>Click me</Button>);
      expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
    });

    it('renders button with custom className', () => {
      const { container } = render(<Button className="custom-class">Button</Button>);
      expect(container.querySelector('.custom-class')).toBeInTheDocument();
    });

    it('renders with aria-label for icon-only buttons', () => {
      render(<Button ariaLabel="Close dialog">✕</Button>);
      expect(screen.getByRole('button', { name: /close dialog/i })).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    it('renders primary variant', () => {
      const { container } = render(<Button variant="primary">Primary</Button>);
      expect(container.querySelector('.bg-sky-600')).toBeInTheDocument();
    });

    it('renders secondary variant', () => {
      const { container } = render(<Button variant="secondary">Secondary</Button>);
      expect(container.querySelector('.bg-gray-200')).toBeInTheDocument();
    });

    it('renders destructive variant', () => {
      const { container } = render(<Button variant="destructive">Delete</Button>);
      expect(container.querySelector('.bg-red-600')).toBeInTheDocument();
    });

    it('renders ghost variant', () => {
      const { container } = render(<Button variant="ghost">Ghost</Button>);
      expect(container.querySelector('.bg-gray-100')).not.toBeInTheDocument();
    });
  });

  describe('Sizes', () => {
    it('renders small size', () => {
      const { container } = render(<Button size="sm">Small</Button>);
      expect(container.querySelector('.text-sm')).toBeInTheDocument();
    });

    it('renders medium size (default)', () => {
      const { container } = render(<Button>Medium</Button>);
      expect(container.querySelector('.text-base')).toBeInTheDocument();
    });

    it('renders large size', () => {
      const { container } = render(<Button size="lg">Large</Button>);
      expect(container.querySelector('.text-lg')).toBeInTheDocument();
    });
  });

  describe('States', () => {
    it('renders disabled button', () => {
      const button = screen.getByRole('button', { name: /disabled/i });
      render(<Button disabled>Disabled</Button>);
      expect(button).toBeDisabled();
    });

    it('sets aria-busy during loading', () => {
      render(<Button isLoading>Loading</Button>);
      const button = screen.getByRole('button', { name: /loading/i });
      expect(button).toHaveAttribute('aria-busy', 'true');
    });

    it('disables button during loading', () => {
      render(<Button isLoading>Loading</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('shows loading spinner when loading', () => {
      const { container } = render(<Button isLoading>Loading</Button>);
      expect(container.querySelector('.animate-spin')).toBeInTheDocument();
    });
  });

  describe('Icons', () => {
    it('renders leading icon', () => {
      const { container } = render(
        <Button icon={<span data-testid="icon">🔒</span>} iconPosition="leading">
          Lock
        </Button>
      );
      const icon = screen.getByTestId('icon');
      expect(icon).toBeInTheDocument();
    });

    it('renders trailing icon', () => {
      render(
        <Button icon={<span data-testid="arrow">→</span>} iconPosition="trailing">
          Next
        </Button>
      );
      expect(screen.getByTestId('arrow')).toBeInTheDocument();
    });

    it('hides icon when loading', () => {
      const { container } = render(
        <Button isLoading icon={<span data-testid="icon">🔒</span>}>
          Loading
        </Button>
      );
      expect(screen.queryByTestId('icon')).not.toBeInTheDocument();
    });
  });

  describe('Event Handlers', () => {
    it('calls onClick handler when clicked', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Click</Button>);
      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when disabled', () => {
      const handleClick = jest.fn();
      render(
        <Button disabled onClick={handleClick}>
          Disabled
        </Button>
      );
      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('does not call onClick when loading', () => {
      const handleClick = jest.fn();
      render(
        <Button isLoading onClick={handleClick}>
          Loading
        </Button>
      );
      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Full Width', () => {
    it('renders full width when fullWidth prop is true', () => {
      const { container } = render(<Button fullWidth>Full Width</Button>);
      expect(container.querySelector('.w-full')).toBeInTheDocument();
    });
  });

  describe('Button Types', () => {
    it('renders submit button', () => {
      render(<Button type="submit">Submit</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'submit');
    });

    it('renders reset button', () => {
      render(<Button type="reset">Reset</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'reset');
    });

    it('defaults to button type', () => {
      render(<Button>Default</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'button');
    });
  });

  describe('Accessibility', () => {
    it('has focus visible outline', () => {
      const { container } = render(<Button>Focus</Button>);
      const button = container.querySelector('button');
      expect(button).toHaveClass('focus-visible:outline-2');
    });

    it('supports aria-describedby for help text', () => {
      render(
        <Button ariaDescribedBy="help-text">Help</Button>
      );
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-describedby', 'help-text');
    });

    it('has proper cursor on disabled state', () => {
      const { container } = render(<Button disabled>Disabled</Button>);
      const button = container.querySelector('button');
      expect(button).toHaveClass('disabled:cursor-not-allowed');
    });
  });

  describe('Ref Forwarding', () => {
    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(<Button ref={ref}>Ref Button</Button>);
      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });

    it('allows imperative focus', () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(<Button ref={ref}>Focus</Button>);
      ref.current?.focus();
      expect(ref.current).toHaveFocus();
    });
  });
});
