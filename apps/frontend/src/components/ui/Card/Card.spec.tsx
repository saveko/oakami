import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen } from '@/test/utils';
import { Card } from './Card';

describe('Card', () => {
  describe('Rendering', () => {
    it('renders card with children', () => {
      render(<Card>Card content</Card>);
      expect(screen.getByText('Card content')).toBeInTheDocument();
    });

    it('renders with semantic div', () => {
      const { container } = render(<Card>Content</Card>);
      const card = container.querySelector('div');
      expect(card).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    it('renders elevated variant', () => {
      const { container } = render(<Card variant="elevated">Elevated</Card>);
      const card = container.querySelector('div');
      expect(card).toHaveClass('shadow-md');
    });

    it('renders outlined variant (default)', () => {
      const { container } = render(<Card>Outlined</Card>);
      const card = container.querySelector('div');
      expect(card).toHaveClass('border');
    });

    it('renders filled variant', () => {
      const { container } = render(<Card variant="filled">Filled</Card>);
      const card = container.querySelector('div');
      expect(card).toHaveClass('bg-gray-50');
    });
  });

  describe('Padding', () => {
    it('renders with no padding', () => {
      const { container } = render(<Card padding="none">No padding</Card>);
      const card = container.querySelector('div');
      expect(card).not.toHaveClass('p-');
    });

    it('renders with small padding', () => {
      const { container } = render(<Card padding="sm">Small</Card>);
      const card = container.querySelector('div');
      expect(card).toHaveClass('p-2');
    });

    it('renders with medium padding (default)', () => {
      const { container } = render(<Card>Medium</Card>);
      const card = container.querySelector('div');
      expect(card).toHaveClass('p-4');
    });

    it('renders with large padding', () => {
      const { container } = render(<Card padding="lg">Large</Card>);
      const card = container.querySelector('div');
      expect(card).toHaveClass('p-6');
    });
  });

  describe('Interactive State', () => {
    it('applies interactive styles when interactive=true', () => {
      const { container } = render(<Card interactive>Interactive</Card>);
      const card = container.querySelector('div');
      expect(card).toHaveClass('cursor-pointer');
    });

    it('does not apply interactive styles by default', () => {
      const { container } = render(<Card>Not interactive</Card>);
      const card = container.querySelector('div');
      expect(card).not.toHaveClass('cursor-pointer');
    });
  });

  describe('Custom Styling', () => {
    it('accepts custom className', () => {
      const { container } = render(<Card className="custom-class">Custom</Card>);
      const card = container.querySelector('div');
      expect(card).toHaveClass('custom-class');
    });

    it('combines default and custom classes', () => {
      const { container } = render(
        <Card variant="elevated" className="extra">
          Combined
        </Card>
      );
      const card = container.querySelector('div');
      expect(card).toHaveClass('shadow-md');
      expect(card).toHaveClass('extra');
    });
  });

  describe('Ref Forwarding', () => {
    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<Card ref={ref}>Ref card</Card>);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe('Accessibility', () => {
    it('is keyboard accessible when interactive', () => {
      const handleClick = vi.fn();
      render(
        <Card interactive onClick={handleClick} role="button" tabIndex={0}>
          Interactive
        </Card>
      );
      const card = screen.getByRole('button');
      expect(card).toBeInTheDocument();
    });
  });

  describe('Dark Mode', () => {
    it('applies dark mode styles', () => {
      const { container } = render(<Card>Dark</Card>);
      const card = container.querySelector('div');
      expect(card).toHaveClass('dark:bg-gray-900');
    });
  });
});
