import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Empty } from './Empty';

describe('Empty Component', () => {
  const defaultProps = {
    title: 'No data found',
  };

  describe('Rendering', () => {
    it('should render with required props', () => {
      render(<Empty {...defaultProps} />);
      expect(screen.getByText('No data found')).toBeInTheDocument();
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<Empty {...defaultProps} ref={ref} />);
      expect(ref.current).toBeTruthy();
      expect(ref.current?.tagName).toBe('DIV');
    });

    it('should render with custom className', () => {
      const { container } = render(
        <Empty {...defaultProps} className="custom-class" />
      );
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain('custom-class');
    });

    it('should render with custom id', () => {
      const { container } = render(
        <Empty {...defaultProps} id="custom-id" />
      );
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.id).toBe('custom-id');
    });
  });

  describe('Title', () => {
    it('should render title as h3 element', () => {
      render(<Empty {...defaultProps} />);
      const title = screen.getByText('No data found');
      expect(title.tagName).toBe('H3');
    });

    it('should apply title styling', () => {
      const { container } = render(<Empty {...defaultProps} />);
      const title = container.querySelector('h3');
      expect(title?.className).toContain('font-semibold');
      expect(title?.className).toContain('text-gray-900');
    });

    it('should have dark mode styling on title', () => {
      const { container } = render(<Empty {...defaultProps} />);
      const title = container.querySelector('h3');
      expect(title?.className).toContain('dark:text-gray-100');
    });
  });

  describe('Description', () => {
    it('should render description when provided', () => {
      render(
        <Empty
          {...defaultProps}
          description="Try creating a new record"
        />
      );
      expect(screen.getByText('Try creating a new record')).toBeInTheDocument();
    });

    it('should not render description when not provided', () => {
      const { container } = render(<Empty {...defaultProps} />);
      const paragraphs = container.querySelectorAll('p');
      expect(paragraphs.length).toBe(0);
    });

    it('should apply description styling', () => {
      const { container } = render(
        <Empty {...defaultProps} description="Test description" />
      );
      const description = container.querySelector('p');
      expect(description?.className).toContain('text-gray-600');
      expect(description?.className).toContain('dark:text-gray-400');
    });
  });

  describe('Icon', () => {
    it('should render icon when provided', () => {
      render(
        <Empty {...defaultProps} icon={<span data-testid="empty-icon">📭</span>} />
      );
      expect(screen.getByTestId('empty-icon')).toBeInTheDocument();
    });

    it('should not render icon when not provided', () => {
      render(<Empty {...defaultProps} />);
      expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });

    it('should hide icon from screen readers', () => {
      const { container } = render(
        <Empty {...defaultProps} icon={<span>📭</span>} />
      );
      const icon = container.querySelector('[aria-hidden="true"]');
      expect(icon).toBeInTheDocument();
    });

    it('should apply icon styling', () => {
      const { container } = render(
        <Empty {...defaultProps} icon={<span>📭</span>} />
      );
      const iconContainer = container.querySelector('div[aria-hidden="true"]');
      expect(iconContainer?.className).toContain('text-gray-400');
      expect(iconContainer?.className).toContain('dark:text-gray-500');
    });
  });

  describe('Action Button', () => {
    it('should render action button when provided', () => {
      render(
        <Empty
          {...defaultProps}
          action={{
            label: 'Create New',
            onClick: jest.fn(),
          }}
        />
      );
      expect(screen.getByText('Create New')).toBeInTheDocument();
    });

    it('should not render action button when not provided', () => {
      render(<Empty {...defaultProps} />);
      expect(screen.queryByText(/Create/)).not.toBeInTheDocument();
    });

    it('should call onClick handler when button clicked', () => {
      const handleClick = jest.fn();
      render(
        <Empty
          {...defaultProps}
          action={{
            label: 'Create New',
            onClick: handleClick,
          }}
        />
      );

      fireEvent.click(screen.getByText('Create New'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should use custom button variant', () => {
      const { container } = render(
        <Empty
          {...defaultProps}
          action={{
            label: 'Delete',
            onClick: jest.fn(),
            variant: 'destructive',
          }}
        />
      );

      const button = container.querySelector('button');
      expect(button?.className).toContain('bg-red-600');
    });

    it('should use custom button size', () => {
      const { container } = render(
        <Empty
          {...defaultProps}
          action={{
            label: 'Action',
            onClick: jest.fn(),
            size: 'lg',
          }}
        />
      );

      const button = container.querySelector('button');
      expect(button?.className).toContain('px-6');
    });
  });

  describe('Sizes', () => {
    it('should render small size', () => {
      const { container } = render(
        <Empty {...defaultProps} size="sm" />
      );
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain('min-h-64');
    });

    it('should render medium size (default)', () => {
      const { container } = render(
        <Empty {...defaultProps} size="md" />
      );
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain('min-h-96');
    });

    it('should apply correct title size for sm', () => {
      const { container } = render(
        <Empty {...defaultProps} size="sm" />
      );
      const title = container.querySelector('h3');
      expect(title?.className).toContain('text-lg');
    });

    it('should apply correct title size for md', () => {
      const { container } = render(
        <Empty {...defaultProps} size="md" />
      );
      const title = container.querySelector('h3');
      expect(title?.className).toContain('text-2xl');
    });
  });

  describe('Variants', () => {
    it('should render default variant', () => {
      const { container } = render(
        <Empty {...defaultProps} variant="default" />
      );
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain('min-h-96');
    });

    it('should render compact variant', () => {
      const { container } = render(
        <Empty {...defaultProps} variant="compact" />
      );
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain('min-h-56');
    });

    it('should render compact variant with small size', () => {
      const { container } = render(
        <Empty {...defaultProps} variant="compact" size="sm" />
      );
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain('min-h-40');
    });
  });

  describe('Layout and Spacing', () => {
    it('should center content vertically and horizontally', () => {
      const { container } = render(<Empty {...defaultProps} />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain('flex');
      expect(wrapper.className).toContain('flex-col');
      expect(wrapper.className).toContain('items-center');
      expect(wrapper.className).toContain('justify-center');
    });

    it('should have proper padding', () => {
      const { container } = render(<Empty {...defaultProps} />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain('px-4');
      expect(wrapper.className).toContain('py-8');
    });

    it('should have gap between elements', () => {
      const { container } = render(
        <Empty {...defaultProps} icon={<span>📭</span>} />
      );
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain('gap-4');
    });

    it('should limit content width', () => {
      const { container } = render(
        <Empty
          {...defaultProps}
          description="Test description"
        />
      );
      const content = container.querySelector('.max-w-md');
      expect(content).toBeInTheDocument();
    });
  });

  describe('Responsive Behavior', () => {
    it('should render responsively', () => {
      const { container } = render(
        <Empty {...defaultProps} />
      );
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain('px-4');
    });

    it('should handle mobile layouts', () => {
      const { container } = render(
        <Empty
          {...defaultProps}
          icon={<span>📭</span>}
          description="Test"
          action={{ label: 'Action', onClick: jest.fn() }}
        />
      );
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Dark Mode Support', () => {
    it('should have dark mode classes', () => {
      const { container } = render(
        <Empty
          {...defaultProps}
          icon={<span>📭</span>}
          description="Test"
        />
      );
      expect(container.textContent).toContain('dark:');
    });

    it('should have dark mode on title', () => {
      const { container } = render(<Empty {...defaultProps} />);
      const title = container.querySelector('h3');
      expect(title?.className).toContain('dark:text-gray-100');
    });

    it('should have dark mode on description', () => {
      const { container } = render(
        <Empty {...defaultProps} description="Test" />
      );
      const description = container.querySelector('p');
      expect(description?.className).toContain('dark:text-gray-400');
    });

    it('should have dark mode on icon', () => {
      const { container } = render(
        <Empty {...defaultProps} icon={<span>📭</span>} />
      );
      const icon = container.querySelector('[aria-hidden="true"]');
      expect(icon?.className).toContain('dark:text-gray-500');
    });
  });

  describe('Accessibility Attributes', () => {
    it('should have role="status"', () => {
      const { container } = render(<Empty {...defaultProps} />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.getAttribute('role')).toBe('status');
    });

    it('should have aria-label with title', () => {
      const { container } = render(
        <Empty {...defaultProps} title="Custom Title" />
      );
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.getAttribute('aria-label')).toBe('Custom Title');
    });

    it('should have semantic heading hierarchy', () => {
      const { container } = render(<Empty {...defaultProps} />);
      const heading = container.querySelector('h3');
      expect(heading).toBeInTheDocument();
    });
  });

  describe('Combinations', () => {
    it('should render with all props', () => {
      const handleClick = jest.fn();
      render(
        <Empty
          title="No results"
          description="Try adjusting your search"
          icon={<span>🔍</span>}
          size="md"
          variant="default"
          action={{
            label: 'Reset',
            onClick: handleClick,
            variant: 'secondary',
            size: 'md',
          }}
        />
      );

      expect(screen.getByText('No results')).toBeInTheDocument();
      expect(screen.getByText('Try adjusting your search')).toBeInTheDocument();
      expect(screen.getByText('Reset')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Reset'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should render compact variant with all elements', () => {
      render(
        <Empty
          title="Empty"
          description="Description"
          icon={<span>📭</span>}
          variant="compact"
          action={{ label: 'Action', onClick: jest.fn() }}
        />
      );

      expect(screen.getByText('Empty')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
      expect(screen.getByText('Action')).toBeInTheDocument();
    });
  });

  describe('Content Variations', () => {
    it('should handle long titles', () => {
      const longTitle = 'This is a very long title that should still render properly and wrap if needed';
      render(<Empty title={longTitle} />);
      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it('should handle long descriptions', () => {
      const longDesc = 'This is a very long description that explains the empty state in detail and provides helpful context to the user.';
      render(<Empty title="Empty" description={longDesc} />);
      expect(screen.getByText(longDesc)).toBeInTheDocument();
    });

    it('should handle React node in icon', () => {
      render(
        <Empty
          title="Test"
          icon={
            <div data-testid="complex-icon">
              <span>Complex</span>
              <span>Icon</span>
            </div>
          }
        />
      );
      expect(screen.getByTestId('complex-icon')).toBeInTheDocument();
    });
  });
});
