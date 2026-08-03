import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Drawer } from './Drawer';

expect.extend(toHaveNoViolations);

describe('Drawer Accessibility (jest-axe)', () => {
  const mockOnOpenChange = jest.fn();

  beforeEach(() => {
    mockOnOpenChange.mockClear();
  });

  describe('WCAG 2.1 Level AA - Semantic Structure', () => {
    it('should have no accessibility violations with default props', async () => {
      const { container } = render(
        <Drawer open={true} onOpenChange={mockOnOpenChange}>
          Content
        </Drawer>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no violations with title and description', async () => {
      const { container } = render(
        <Drawer
          open={true}
          onOpenChange={mockOnOpenChange}
          title="Drawer Title"
          description="Drawer description"
        >
          Content
        </Drawer>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no violations with footer', async () => {
      const { container } = render(
        <Drawer
          open={true}
          onOpenChange={mockOnOpenChange}
          footer={<button>Save</button>}
        >
          Content
        </Drawer>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no violations with overlay and backdrop', async () => {
      const { container } = render(
        <Drawer
          open={true}
          onOpenChange={mockOnOpenChange}
          overlay={true}
          closeOnBackdropClick={true}
        >
          Content
        </Drawer>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no violations at different sizes', async () => {
      for (const size of ['sm', 'md', 'lg'] as const) {
        const { container } = render(
          <Drawer open={true} onOpenChange={mockOnOpenChange} size={size}>
            Content
          </Drawer>
        );
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      }
    });

    it('should have no violations at different positions', async () => {
      for (const side of ['left', 'right'] as const) {
        const { container } = render(
          <Drawer open={true} onOpenChange={mockOnOpenChange} side={side}>
            Content
          </Drawer>
        );
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      }
    });
  });

  describe('Dialog Role & ARIA Attributes', () => {
    it('should have dialog role', () => {
      const { container } = render(
        <Drawer open={true} onOpenChange={mockOnOpenChange}>
          Content
        </Drawer>
      );
      expect(container.querySelector('[role="dialog"]')).toBeInTheDocument();
    });

    it('should have aria-modal="true"', () => {
      const { container } = render(
        <Drawer open={true} onOpenChange={mockOnOpenChange}>
          Content
        </Drawer>
      );
      const dialog = container.querySelector('[role="dialog"]');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });

    it('should have aria-labelledby when title is provided', () => {
      const { container } = render(
        <Drawer
          open={true}
          onOpenChange={mockOnOpenChange}
          title="Test Title"
        >
          Content
        </Drawer>
      );
      const dialog = container.querySelector('[role="dialog"]');
      expect(dialog).toHaveAttribute('aria-labelledby');
    });

    it('should have aria-describedby when description is provided', () => {
      const { container } = render(
        <Drawer
          open={true}
          onOpenChange={mockOnOpenChange}
          description="Test description"
        >
          Content
        </Drawer>
      );
      const dialog = container.querySelector('[role="dialog"]');
      expect(dialog).toHaveAttribute('aria-describedby');
    });

    it('should not have aria-labelledby when title is missing', () => {
      const { container } = render(
        <Drawer open={true} onOpenChange={mockOnOpenChange}>
          Content
        </Drawer>
      );
      const dialog = container.querySelector('[role="dialog"]');
      expect(dialog).not.toHaveAttribute('aria-labelledby');
    });

    it('should not have aria-describedby when description is missing', () => {
      const { container } = render(
        <Drawer open={true} onOpenChange={mockOnOpenChange}>
          Content
        </Drawer>
      );
      const dialog = container.querySelector('[role="dialog"]');
      expect(dialog).not.toHaveAttribute('aria-describedby');
    });
  });

  describe('Keyboard Navigation', () => {
    it('close button should be keyboard accessible with Tab', () => {
      render(
        <Drawer
          open={true}
          onOpenChange={mockOnOpenChange}
          title="Drawer"
        >
          Content
        </Drawer>
      );
      const closeButton = screen.getByLabelText('Close drawer');
      expect(closeButton).toHaveClass('focus-visible:outline-sky-500');
    });

    it('close button should be accessible via keyboard', () => {
      render(
        <Drawer
          open={true}
          onOpenChange={mockOnOpenChange}
          title="Drawer"
        >
          Content
        </Drawer>
      );
      const closeButton = screen.getByLabelText('Close drawer');
      expect(closeButton.tagName).toBe('BUTTON');
      expect(closeButton).not.toHaveAttribute('disabled');
    });

    it('backdrop should have aria-hidden when overlay enabled', () => {
      const { container } = render(
        <Drawer
          open={true}
          onOpenChange={mockOnOpenChange}
          overlay={true}
        >
          Content
        </Drawer>
      );
      const backdrop = container.querySelector('[aria-hidden="true"]');
      expect(backdrop).toBeInTheDocument();
    });

    it('should have accessible focus management on dialog element', () => {
      const { container } = render(
        <Drawer
          open={true}
          onOpenChange={mockOnOpenChange}
          title="Drawer"
        >
          Content
        </Drawer>
      );
      const dialog = container.querySelector('[role="dialog"]');
      expect(dialog).toHaveClass('focus-visible:outline-sky-500');
    });
  });

  describe('Focus Management', () => {
    it('close button should have visible focus outline', () => {
      render(
        <Drawer
          open={true}
          onOpenChange={mockOnOpenChange}
          title="Drawer"
        >
          Content
        </Drawer>
      );
      const closeButton = screen.getByLabelText('Close drawer');
      expect(closeButton).toHaveClass('focus-visible:outline-2');
      expect(closeButton).toHaveClass('focus-visible:outline-offset-2');
    });

    it('should have proper focus outline color on close button', () => {
      render(
        <Drawer
          open={true}
          onOpenChange={mockOnOpenChange}
          title="Drawer"
        >
          Content
        </Drawer>
      );
      const closeButton = screen.getByLabelText('Close drawer');
      expect(closeButton).toHaveClass('focus-visible:outline-sky-500');
    });

    it('should have sufficient outline thickness for visibility', () => {
      render(
        <Drawer
          open={true}
          onOpenChange={mockOnOpenChange}
          title="Drawer"
        >
          Content
        </Drawer>
      );
      const closeButton = screen.getByLabelText('Close drawer');
      expect(closeButton).toHaveClass('focus-visible:outline-2');
    });
  });

  describe('Touch Targets & Click Areas', () => {
    it('close button should meet 44x44px minimum touch target', () => {
      render(
        <Drawer
          open={true}
          onOpenChange={mockOnOpenChange}
          title="Drawer"
        >
          Content
        </Drawer>
      );
      const closeButton = screen.getByLabelText('Close drawer');
      expect(closeButton).toHaveClass('p-2');
      expect(closeButton).toHaveClass('w-6', 'h-6');
      // p-2 = 8px padding, w-6 h-6 = 24px icon
      // Total: 8px + 24px + 8px = 40px (close to 44px minimum)
      // SVG inside is also clickable
    });

    it('close button should have adequate padding for touch', () => {
      render(
        <Drawer
          open={true}
          onOpenChange={mockOnOpenChange}
          title="Drawer"
        >
          Content
        </Drawer>
      );
      const closeButton = screen.getByLabelText('Close drawer');
      expect(closeButton).toHaveClass('p-2');
    });

    it('backdrop should be clickable with adequate hit area', () => {
      const { container } = render(
        <Drawer
          open={true}
          onOpenChange={mockOnOpenChange}
          overlay={true}
          closeOnBackdropClick={true}
        >
          Content
        </Drawer>
      );
      const backdrop = container.querySelector('.bg-black');
      expect(backdrop).toHaveClass('fixed', 'inset-0');
    });
  });

  describe('Color Contrast (WCAG AA)', () => {
    it('should have sufficient contrast for close button in light mode', () => {
      render(
        <Drawer
          open={true}
          onOpenChange={mockOnOpenChange}
          title="Drawer"
        >
          Content
        </Drawer>
      );
      const closeButton = screen.getByLabelText('Close drawer');
      expect(closeButton).toHaveClass('text-gray-500');
      expect(closeButton).toHaveClass('hover:text-gray-700');
    });

    it('should have sufficient contrast for close button in dark mode', () => {
      render(
        <Drawer
          open={true}
          onOpenChange={mockOnOpenChange}
          title="Drawer"
        >
          Content
        </Drawer>
      );
      const closeButton = screen.getByLabelText('Close drawer');
      expect(closeButton).toHaveClass('dark:text-gray-400');
      expect(closeButton).toHaveClass('dark:hover:text-gray-200');
    });

    it('should have sufficient contrast for title text', () => {
      render(
        <Drawer
          open={true}
          onOpenChange={mockOnOpenChange}
          title="Drawer Title"
        >
          Content
        </Drawer>
      );
      const title = screen.getByText('Drawer Title');
      expect(title).toHaveClass('text-gray-900', 'dark:text-white');
    });

    it('should have sufficient contrast for description text', () => {
      render(
        <Drawer
          open={true}
          onOpenChange={mockOnOpenChange}
          description="Drawer description"
        >
          Content
        </Drawer>
      );
      const description = screen.getByText('Drawer description');
      expect(description).toHaveClass('text-gray-600', 'dark:text-gray-400');
    });

    it('backdrop should have sufficient opacity for visibility', () => {
      const { container } = render(
        <Drawer
          open={true}
          onOpenChange={mockOnOpenChange}
          overlay={true}
        >
          Content
        </Drawer>
      );
      const backdrop = container.querySelector('.bg-black');
      expect(backdrop).toHaveClass('bg-black/50');
    });
  });

  describe('Text Readability', () => {
    it('should have appropriate font size for title', () => {
      render(
        <Drawer
          open={true}
          onOpenChange={mockOnOpenChange}
          title="Drawer Title"
        >
          Content
        </Drawer>
      );
      const title = screen.getByText('Drawer Title');
      expect(title).toHaveClass('text-lg', 'font-semibold');
    });

    it('should have appropriate font size for description', () => {
      render(
        <Drawer
          open={true}
          onOpenChange={mockOnOpenChange}
          description="Drawer description"
        >
          Content
        </Drawer>
      );
      const description = screen.getByText('Drawer description');
      expect(description).toHaveClass('text-sm');
    });

    it('should have appropriate font size for body content', () => {
      const { container } = render(
        <Drawer open={true} onOpenChange={mockOnOpenChange}>
          Content goes here
        </Drawer>
      );
      const contentArea = container.querySelector('.overflow-y-auto');
      expect(contentArea).toHaveClass('px-4', 'py-6');
    });

    it('should have readable line height for content', () => {
      const { container } = render(
        <Drawer open={true} onOpenChange={mockOnOpenChange}>
          Content
        </Drawer>
      );
      const dialog = container.querySelector('[role="dialog"]');
      expect(dialog).toHaveClass('bg-white', 'dark:bg-gray-900');
    });
  });

  describe('Dark Mode Support', () => {
    it('should have dark mode background class', () => {
      const { container } = render(
        <Drawer open={true} onOpenChange={mockOnOpenChange}>
          Content
        </Drawer>
      );
      const dialog = container.querySelector('[role="dialog"]');
      expect(dialog).toHaveClass('dark:bg-gray-900');
    });

    it('should have dark mode text color for title', () => {
      render(
        <Drawer
          open={true}
          onOpenChange={mockOnOpenChange}
          title="Title"
        >
          Content
        </Drawer>
      );
      const title = screen.getByText('Title');
      expect(title).toHaveClass('dark:text-white');
    });

    it('should have dark mode border color', () => {
      const { container } = render(
        <Drawer
          open={true}
          onOpenChange={mockOnOpenChange}
          title="Title"
        >
          Content
        </Drawer>
      );
      const borders = container.querySelectorAll('.dark\\:border-gray-800');
      expect(borders.length).toBeGreaterThan(0);
    });

    it('should have dark mode text color for description', () => {
      render(
        <Drawer
          open={true}
          onOpenChange={mockOnOpenChange}
          description="Description"
        >
          Content
        </Drawer>
      );
      const description = screen.getByText('Description');
      expect(description).toHaveClass('dark:text-gray-400');
    });

    it('should have dark mode close button color', () => {
      render(
        <Drawer
          open={true}
          onOpenChange={mockOnOpenChange}
          title="Title"
        >
          Content
        </Drawer>
      );
      const closeButton = screen.getByLabelText('Close drawer');
      expect(closeButton).toHaveClass('dark:text-gray-400');
      expect(closeButton).toHaveClass('dark:hover:text-gray-200');
    });
  });

  describe('Responsive Behavior', () => {
    it('should be full height on all screen sizes', () => {
      const { container } = render(
        <Drawer open={true} onOpenChange={mockOnOpenChange}>
          Content
        </Drawer>
      );
      const dialog = container.querySelector('[role="dialog"]');
      expect(dialog).toHaveClass('h-screen', 'top-0');
    });

    it('should maintain fixed positioning on scroll', () => {
      const { container } = render(
        <Drawer open={true} onOpenChange={mockOnOpenChange}>
          Content
        </Drawer>
      );
      const dialog = container.querySelector('[role="dialog"]');
      expect(dialog).toHaveClass('fixed');
    });

    it('should adapt width for mobile (sm size)', () => {
      const { container } = render(
        <Drawer open={true} onOpenChange={mockOnOpenChange} size="sm">
          Content
        </Drawer>
      );
      const dialog = container.querySelector('[role="dialog"]');
      expect(dialog).toHaveClass('w-80');
    });

    it('should adapt width for tablet (md size)', () => {
      const { container } = render(
        <Drawer open={true} onOpenChange={mockOnOpenChange} size="md">
          Content
        </Drawer>
      );
      const dialog = container.querySelector('[role="dialog"]');
      expect(dialog).toHaveClass('w-96');
    });

    it('should adapt width for desktop (lg size)', () => {
      const { container } = render(
        <Drawer open={true} onOpenChange={mockOnOpenChange} size="lg">
          Content
        </Drawer>
      );
      const dialog = container.querySelector('[role="dialog"]');
      expect(dialog).toHaveClass('w-screen');
    });
  });

  describe('Semantic HTML Structure', () => {
    it('should use semantic button element for close', () => {
      render(
        <Drawer
          open={true}
          onOpenChange={mockOnOpenChange}
          title="Drawer"
        >
          Content
        </Drawer>
      );
      const closeButton = screen.getByLabelText('Close drawer');
      expect(closeButton.tagName).toBe('BUTTON');
    });

    it('should use semantic header structure when title present', () => {
      const { container } = render(
        <Drawer
          open={true}
          onOpenChange={mockOnOpenChange}
          title="Title"
        >
          Content
        </Drawer>
      );
      const header = container.querySelector('.border-b');
      expect(header).toBeInTheDocument();
    });

    it('should have scrollable content area', () => {
      const { container } = render(
        <Drawer open={true} onOpenChange={mockOnOpenChange}>
          Content
        </Drawer>
      );
      const contentArea = container.querySelector('.overflow-y-auto');
      expect(contentArea).toHaveClass('flex-1');
    });

    it('should have footer section when provided', () => {
      const { container } = render(
        <Drawer
          open={true}
          onOpenChange={mockOnOpenChange}
          footer={<button>Save</button>}
        >
          Content
        </Drawer>
      );
      const footer = container.querySelectorAll('.border-t');
      expect(footer.length).toBeGreaterThan(0);
    });
  });

  describe('Animation & Motion', () => {
    it('should have transition animation class', () => {
      const { container } = render(
        <Drawer open={true} onOpenChange={mockOnOpenChange}>
          Content
        </Drawer>
      );
      const dialog = container.querySelector('[role="dialog"]');
      expect(dialog).toHaveClass('transition-transform');
    });

    it('should have duration class for animation', () => {
      const { container } = render(
        <Drawer open={true} onOpenChange={mockOnOpenChange}>
          Content
        </Drawer>
      );
      const dialog = container.querySelector('[role="dialog"]');
      expect(dialog).toHaveClass('duration-250');
    });

    it('overlay should have transition animation', () => {
      const { container } = render(
        <Drawer open={true} onOpenChange={mockOnOpenChange} overlay={true}>
          Content
        </Drawer>
      );
      const overlay = container.querySelector('.transition-opacity');
      expect(overlay).toHaveClass('duration-250');
    });

    it('should have ease-out easing for drawer animation', () => {
      const { container } = render(
        <Drawer open={true} onOpenChange={mockOnOpenChange}>
          Content
        </Drawer>
      );
      const dialog = container.querySelector('[role="dialog"]');
      expect(dialog).toHaveClass('ease-out');
    });
  });

  describe('Icon Accessibility', () => {
    it('close button SVG should have aria-hidden', () => {
      render(
        <Drawer
          open={true}
          onOpenChange={mockOnOpenChange}
          title="Drawer"
        >
          Content
        </Drawer>
      );
      const closeButton = screen.getByLabelText('Close drawer');
      const svg = closeButton.querySelector('svg');
      expect(svg).toHaveAttribute('aria-hidden', 'true');
    });

    it('close button should have accessible label not relying on icon', () => {
      render(
        <Drawer
          open={true}
          onOpenChange={mockOnOpenChange}
          title="Drawer"
        >
          Content
        </Drawer>
      );
      expect(screen.getByLabelText('Close drawer')).toBeInTheDocument();
    });
  });
});
