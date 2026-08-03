import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Drawer } from './Drawer';

describe('Drawer Component', () => {
  const mockOnOpenChange = jest.fn();

  beforeEach(() => {
    mockOnOpenChange.mockClear();
  });

  describe('Rendering', () => {
    it('renders drawer when open', () => {
      const { container } = render(
        <Drawer
          open={true}
          onOpenChange={mockOnOpenChange}
          title="Drawer Title"
        >
          Content
        </Drawer>
      );
      expect(container.querySelector('[role="dialog"]')).toBeInTheDocument();
    });

    it('renders drawer with title', () => {
      render(
        <Drawer
          open={true}
          onOpenChange={mockOnOpenChange}
          title="Drawer Title"
        >
          Content
        </Drawer>
      );
      expect(screen.getByText('Drawer Title')).toBeInTheDocument();
    });

    it('renders drawer with description', () => {
      render(
        <Drawer
          open={true}
          onOpenChange={mockOnOpenChange}
          title="Drawer Title"
          description="Drawer description"
        >
          Content
        </Drawer>
      );
      expect(screen.getByText('Drawer description')).toBeInTheDocument();
    });

    it('renders drawer content', () => {
      render(
        <Drawer
          open={true}
          onOpenChange={mockOnOpenChange}
        >
          Content goes here
        </Drawer>
      );
      expect(screen.getByText('Content goes here')).toBeInTheDocument();
    });

    it('renders drawer footer', () => {
      render(
        <Drawer
          open={true}
          onOpenChange={mockOnOpenChange}
          footer={<button>Save</button>}
        >
          Content
        </Drawer>
      );
      expect(screen.getByText('Save')).toBeInTheDocument();
    });

    it('renders overlay when open', () => {
      const { container } = render(
        <Drawer
          open={true}
          onOpenChange={mockOnOpenChange}
          overlay={true}
        >
          Content
        </Drawer>
      );
      expect(container.querySelector('.bg-black')).toBeInTheDocument();
    });

    it('does not render overlay when disabled', () => {
      const { container } = render(
        <Drawer
          open={true}
          onOpenChange={mockOnOpenChange}
          overlay={false}
        >
          Content
        </Drawer>
      );
      expect(container.querySelector('.bg-black')).not.toBeInTheDocument();
    });

    it('renders close button', () => {
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

  describe('Opening/Closing', () => {
    it('calls onOpenChange when close button clicked', () => {
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
      fireEvent.click(closeButton);
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });

    it('calls onOpenChange when backdrop clicked', () => {
      const { container } = render(
        <Drawer
          open={true}
          onOpenChange={mockOnOpenChange}
          closeOnBackdropClick={true}
        >
          Content
        </Drawer>
      );
      const backdrop = container.querySelector('.bg-black');
      fireEvent.click(backdrop!);
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });

    it('does not call onOpenChange when backdrop clicked if disabled', () => {
      const { container } = render(
        <Drawer
          open={true}
          onOpenChange={mockOnOpenChange}
          closeOnBackdropClick={false}
        >
          Content
        </Drawer>
      );
      const backdrop = container.querySelector('.bg-black');
      fireEvent.click(backdrop!);
      expect(mockOnOpenChange).not.toHaveBeenCalled();
    });

    it('does not close when clicking inside drawer', () => {
      render(
        <Drawer
          open={true}
          onOpenChange={mockOnOpenChange}
          closeOnBackdropClick={true}
        >
          <button>Inner Button</button>
        </Drawer>
      );
      const innerButton = screen.getByText('Inner Button');
      fireEvent.click(innerButton);
      expect(mockOnOpenChange).not.toHaveBeenCalled();
    });
  });

  describe('Keyboard Navigation', () => {
    it('closes drawer when ESC key pressed', async () => {
      render(
        <Drawer
          open={true}
          onOpenChange={mockOnOpenChange}
        >
          Content
        </Drawer>
      );
      fireEvent.keyDown(document, { key: 'Escape' });
      await waitFor(() => {
        expect(mockOnOpenChange).toHaveBeenCalledWith(false);
      });
    });

    it('does not close drawer when ESC pressed while closed', async () => {
      render(
        <Drawer
          open={false}
          onOpenChange={mockOnOpenChange}
        >
          Content
        </Drawer>
      );
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(mockOnOpenChange).not.toHaveBeenCalled();
    });

    it('focus button is keyboard accessible', () => {
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
  });

  describe('Positioning', () => {
    it('positions drawer on right by default', () => {
      const { container } = render(
        <Drawer
          open={true}
          onOpenChange={mockOnOpenChange}
        >
          Content
        </Drawer>
      );
      const dialog = container.querySelector('[role="dialog"]');
      expect(dialog).toHaveClass('right-0');
    });

    it('positions drawer on left when side="left"', () => {
      const { container } = render(
        <Drawer
          open={true}
          onOpenChange={mockOnOpenChange}
          side="left"
        >
          Content
        </Drawer>
      );
      const dialog = container.querySelector('[role="dialog"]');
      expect(dialog).toHaveClass('left-0');
    });

    it('positions drawer on right when side="right"', () => {
      const { container } = render(
        <Drawer
          open={true}
          onOpenChange={mockOnOpenChange}
          side="right"
        >
          Content
        </Drawer>
      );
      const dialog = container.querySelector('[role="dialog"]');
      expect(dialog).toHaveClass('right-0');
    });
  });

  describe('Sizes', () => {
    it('renders small size', () => {
      const { container } = render(
        <Drawer
          open={true}
          onOpenChange={mockOnOpenChange}
          size="sm"
        >
          Content
        </Drawer>
      );
      const dialog = container.querySelector('[role="dialog"]');
      expect(dialog).toHaveClass('w-80');
    });

    it('renders medium size by default', () => {
      const { container } = render(
        <Drawer
          open={true}
          onOpenChange={mockOnOpenChange}
        >
          Content
        </Drawer>
      );
      const dialog = container.querySelector('[role="dialog"]');
      expect(dialog).toHaveClass('w-96');
    });

    it('renders large size', () => {
      const { container } = render(
        <Drawer
          open={true}
          onOpenChange={mockOnOpenChange}
          size="lg"
        >
          Content
        </Drawer>
      );
      const dialog = container.querySelector('[role="dialog"]');
      expect(dialog).toHaveClass('w-screen');
    });
  });

  describe('Animation', () => {
    it('has transition class', () => {
      const { container } = render(
        <Drawer
          open={true}
          onOpenChange={mockOnOpenChange}
        >
          Content
        </Drawer>
      );
      const dialog = container.querySelector('[role="dialog"]');
      expect(dialog).toHaveClass('transition-transform');
      expect(dialog).toHaveClass('duration-250');
    });
  });

  describe('Styling', () => {
    it('has dark mode support', () => {
      const { container } = render(
        <Drawer
          open={true}
          onOpenChange={mockOnOpenChange}
        >
          Content
        </Drawer>
      );
      const dialog = container.querySelector('[role="dialog"]');
      expect(dialog).toHaveClass('dark:bg-gray-900');
    });

    it('has fixed positioning', () => {
      const { container } = render(
        <Drawer
          open={true}
          onOpenChange={mockOnOpenChange}
        >
          Content
        </Drawer>
      );
      const dialog = container.querySelector('[role="dialog"]');
      expect(dialog).toHaveClass('fixed');
      expect(dialog).toHaveClass('top-0');
      expect(dialog).toHaveClass('h-screen');
    });

    it('applies custom className', () => {
      const { container } = render(
        <Drawer
          open={true}
          onOpenChange={mockOnOpenChange}
          className="custom-class"
        >
          Content
        </Drawer>
      );
      const dialog = container.querySelector('[role="dialog"]');
      expect(dialog).toHaveClass('custom-class');
    });

    it('has box shadow', () => {
      const { container } = render(
        <Drawer
          open={true}
          onOpenChange={mockOnOpenChange}
        >
          Content
        </Drawer>
      );
      const dialog = container.querySelector('[role="dialog"]');
      expect(dialog).toHaveClass('shadow-lg');
    });
  });

  describe('Accessibility', () => {
    it('has dialog role', () => {
      const { container } = render(
        <Drawer
          open={true}
          onOpenChange={mockOnOpenChange}
        >
          Content
        </Drawer>
      );
      expect(container.querySelector('[role="dialog"]')).toBeInTheDocument();
    });

    it('has aria-modal attribute', () => {
      const { container } = render(
        <Drawer
          open={true}
          onOpenChange={mockOnOpenChange}
        >
          Content
        </Drawer>
      );
      const dialog = container.querySelector('[role="dialog"]');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });

    it('has aria-labelledby when title provided', () => {
      const { container } = render(
        <Drawer
          open={true}
          onOpenChange={mockOnOpenChange}
          title="Drawer Title"
        >
          Content
        </Drawer>
      );
      const dialog = container.querySelector('[role="dialog"]');
      expect(dialog).toHaveAttribute('aria-labelledby');
    });

    it('has aria-describedby when description provided', () => {
      const { container } = render(
        <Drawer
          open={true}
          onOpenChange={mockOnOpenChange}
          description="Drawer description"
        >
          Content
        </Drawer>
      );
      const dialog = container.querySelector('[role="dialog"]');
      expect(dialog).toHaveAttribute('aria-describedby');
    });

    it('close button has aria-label', () => {
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

    it('backdrop is hidden from screen readers', () => {
      const { container } = render(
        <Drawer
          open={true}
          onOpenChange={mockOnOpenChange}
        >
          Content
        </Drawer>
      );
      const backdrop = container.querySelector('[aria-hidden="true"]');
      expect(backdrop).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles drawer without title', () => {
      render(
        <Drawer
          open={true}
          onOpenChange={mockOnOpenChange}
        >
          Content
        </Drawer>
      );
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('handles drawer without description', () => {
      render(
        <Drawer
          open={true}
          onOpenChange={mockOnOpenChange}
          title="Title"
        >
          Content
        </Drawer>
      );
      expect(screen.getByText('Title')).toBeInTheDocument();
    });

    it('handles drawer without footer', () => {
      render(
        <Drawer
          open={true}
          onOpenChange={mockOnOpenChange}
        >
          Content
        </Drawer>
      );
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('handles very long content', () => {
      const longContent = 'Lorem ipsum '.repeat(200);
      render(
        <Drawer
          open={true}
          onOpenChange={mockOnOpenChange}
        >
          {longContent}
        </Drawer>
      );
      const content = screen.getByText(new RegExp(longContent.substring(0, 50)));
      expect(content).toBeInTheDocument();
    });

    it('handles rapid open/close', () => {
      const { rerender } = render(
        <Drawer
          open={true}
          onOpenChange={mockOnOpenChange}
        >
          Content
        </Drawer>
      );

      rerender(
        <Drawer
          open={false}
          onOpenChange={mockOnOpenChange}
        >
          Content
        </Drawer>
      );

      rerender(
        <Drawer
          open={true}
          onOpenChange={mockOnOpenChange}
        >
          Content
        </Drawer>
      );

      expect(screen.getByText('Content')).toBeInTheDocument();
    });
  });

  describe('Header & Footer Structure', () => {
    it('renders header with title and close button', () => {
      render(
        <Drawer
          open={true}
          onOpenChange={mockOnOpenChange}
          title="Test Drawer"
        >
          Content
        </Drawer>
      );
      expect(screen.getByText('Test Drawer')).toBeInTheDocument();
      expect(screen.getByLabelText('Close drawer')).toBeInTheDocument();
    });

    it('renders footer section when provided', () => {
      render(
        <Drawer
          open={true}
          onOpenChange={mockOnOpenChange}
          footer={
            <>
              <button>Cancel</button>
              <button>Save</button>
            </>
          }
        >
          Content
        </Drawer>
      );
      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(screen.getByText('Save')).toBeInTheDocument();
    });

    it('has scrollable content area', () => {
      const { container } = render(
        <Drawer
          open={true}
          onOpenChange={mockOnOpenChange}
        >
          Content
        </Drawer>
      );
      const contentArea = container.querySelector('.overflow-y-auto');
      expect(contentArea).toBeInTheDocument();
    });

    it('has border between header and content', () => {
      const { container } = render(
        <Drawer
          open={true}
          onOpenChange={mockOnOpenChange}
          title="Title"
        >
          Content
        </Drawer>
      );
      const borders = container.querySelectorAll('.border-b');
      expect(borders.length).toBeGreaterThan(0);
    });

    it('has border between content and footer', () => {
      const { container } = render(
        <Drawer
          open={true}
          onOpenChange={mockOnOpenChange}
          footer={<button>Save</button>}
        >
          Content
        </Drawer>
      );
      const borders = container.querySelectorAll('.border-t');
      expect(borders.length).toBeGreaterThan(0);
    });
  });
});
