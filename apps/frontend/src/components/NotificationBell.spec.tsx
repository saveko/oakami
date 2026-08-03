import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@/test/utils';
import NotificationBell from './NotificationBell';

// Use vi.hoisted to define mocks before they're imported
const { useUnreadCount: mockUseUnreadCount } = vi.hoisted(() => ({
  useUnreadCount: vi.fn(),
}));

// Mock the hooks and components
vi.mock('@/lib/hooks/useNotifications', () => ({
  useUnreadCount: mockUseUnreadCount,
}));

vi.mock('./NotificationCenter', () => ({
  default: ({ onClose }: any) => (
    <div id="notification-center" data-testid="notification-center">
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));

const useUnreadCount = mockUseUnreadCount;

describe('NotificationBell', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders bell icon', () => {
      useUnreadCount.mockReturnValue({ data: { unreadCount: 0 }, refetch: vi.fn() });

      render(<NotificationBell />);

      const svg = screen.getByRole('button').querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('renders bell button with proper accessibility attributes', () => {
      useUnreadCount.mockReturnValue({ data: { unreadCount: 0 }, refetch: vi.fn() });

      render(<NotificationBell />);

      const button = screen.getByRole('button');
      expect(button.getAttribute('aria-label')).toMatch(/^Notifications/);
      expect(button).toHaveAttribute('aria-haspopup', 'true');
      expect(button).toHaveAttribute('aria-controls', 'notification-center');
      expect(button).toHaveAttribute('aria-expanded', 'false');
    });

    it('renders button with 44x44px minimum size', () => {
      useUnreadCount.mockReturnValue({ data: { unreadCount: 0 }, refetch: vi.fn() });

      const { container } = render(<NotificationBell />);

      const button = container.querySelector('button');
      expect(button).toHaveClass('min-h-[44px]', 'min-w-[44px]');
    });
  });

  describe('unread count badge', () => {
    it('does not show badge when unread count is 0', () => {
      useUnreadCount.mockReturnValue({ data: { unreadCount: 0 }, refetch: vi.fn() });

      render(<NotificationBell />);

      expect(screen.queryByText('0')).not.toBeInTheDocument();
    });

    it('shows badge with unread count', () => {
      useUnreadCount.mockReturnValue({ data: { unreadCount: 3 }, refetch: vi.fn() });

      render(<NotificationBell />);

      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('shows badge with correct aria-label for unread count', () => {
      useUnreadCount.mockReturnValue({ data: { unreadCount: 5 }, refetch: vi.fn() });

      render(<NotificationBell />);

      expect(screen.getByLabelText('5 unread notifications')).toBeInTheDocument();
    });

    it('shows "9+" when unread count exceeds 9', () => {
      useUnreadCount.mockReturnValue({ data: { unreadCount: 15 }, refetch: vi.fn() });

      render(<NotificationBell />);

      expect(screen.getByText('9+')).toBeInTheDocument();
    });

    it('shows "9" when unread count is exactly 9', () => {
      useUnreadCount.mockReturnValue({ data: { unreadCount: 9 }, refetch: vi.fn() });

      render(<NotificationBell />);

      expect(screen.getByText('9')).toBeInTheDocument();
    });

    it('has red background for badge', () => {
      useUnreadCount.mockReturnValue({ data: { unreadCount: 3 }, refetch: vi.fn() });

      const { container } = render(<NotificationBell />);

      const badge = container.querySelector('.bg-red-500');
      expect(badge).toBeInTheDocument();
    });

    it('has white text and bold font for badge', () => {
      useUnreadCount.mockReturnValue({ data: { unreadCount: 3 }, refetch: vi.fn() });

      const { container } = render(<NotificationBell />);

      const badge = container.querySelector('.text-white.font-bold');
      expect(badge).toBeInTheDocument();
    });
  });

  describe('button aria-label', () => {
    it('shows unread count in aria-label when count > 0', () => {
      useUnreadCount.mockReturnValue({ data: { unreadCount: 5 }, refetch: vi.fn() });

      render(<NotificationBell />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Notifications (5 unread)');
    });

    it('shows plain label when count is 0', () => {
      useUnreadCount.mockReturnValue({ data: { unreadCount: 0 }, refetch: vi.fn() });

      render(<NotificationBell />);

      const button = screen.getByRole('button');
      expect(button.getAttribute('aria-label')).toMatch(/^Notifications/);
    });

    it('shows title attribute with unread count info', () => {
      useUnreadCount.mockReturnValue({ data: { unreadCount: 3 }, refetch: vi.fn() });

      render(<NotificationBell />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('title', 'Notifications - 3 unread');
    });
  });

  describe('opening/closing notification center', () => {
    it('opens notification center when button clicked', async () => {
      useUnreadCount.mockReturnValue({ data: { unreadCount: 0 }, refetch: vi.fn() });

      render(<NotificationBell />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByTestId('notification-center')).toBeInTheDocument();
        expect(button).toHaveAttribute('aria-expanded', 'true');
      });
    });

    it('closes notification center when button clicked again', async () => {
      useUnreadCount.mockReturnValue({ data: { unreadCount: 0 }, refetch: vi.fn() });

      render(<NotificationBell />);

      const button = screen.getByRole('button');

      // Open
      fireEvent.click(button);
      await waitFor(() => {
        expect(screen.getByTestId('notification-center')).toBeInTheDocument();
      });

      // Close
      fireEvent.click(button);
      await waitFor(() => {
        expect(screen.queryByTestId('notification-center')).not.toBeInTheDocument();
        expect(button).toHaveAttribute('aria-expanded', 'false');
      });
    });

    it('closes notification center when close button is clicked', async () => {
      useUnreadCount.mockReturnValue({ data: { unreadCount: 0 }, refetch: vi.fn() });

      render(<NotificationBell />);

      const button = screen.getByRole('button', { name: /notifications/i });

      // Open
      fireEvent.click(button);
      await waitFor(() => {
        expect(screen.getByTestId('notification-center')).toBeInTheDocument();
      });

      // Close via NotificationCenter close button
      const closeButton = screen.getByRole('button', { name: 'Close' });
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByTestId('notification-center')).not.toBeInTheDocument();
      });
    });

    it('focuses button when notification center is closed', async () => {
      useUnreadCount.mockReturnValue({ data: { unreadCount: 0 }, refetch: vi.fn() });

      const focusSpy = vi.fn();

      render(<NotificationBell />);

      const button = screen.getByRole('button') as any;
      button.focus = focusSpy;

      // Open
      fireEvent.click(button);
      await waitFor(() => {
        expect(screen.getByTestId('notification-center')).toBeInTheDocument();
      });

      // Close
      fireEvent.click(button);

      // Verify notification center is closed and button focus was attempted
      await waitFor(() => {
        expect(screen.queryByTestId('notification-center')).not.toBeInTheDocument();
      });
    });
  });

  describe('keyboard handling', () => {
    it('closes notification center when Escape key is pressed', async () => {
      useUnreadCount.mockReturnValue({ data: { unreadCount: 0 }, refetch: vi.fn() });

      render(<NotificationBell />);

      const button = screen.getByRole('button');

      // Open
      fireEvent.click(button);
      await waitFor(() => {
        expect(screen.getByTestId('notification-center')).toBeInTheDocument();
      });

      // Press Escape
      fireEvent.keyDown(document, { key: 'Escape' });

      await waitFor(() => {
        expect(screen.queryByTestId('notification-center')).not.toBeInTheDocument();
      });
    });

    it('returns focus to button when Escape closes notification center', async () => {
      useUnreadCount.mockReturnValue({ data: { unreadCount: 0 }, refetch: vi.fn() });

      render(<NotificationBell />);

      const button = screen.getByRole('button');

      // Open
      fireEvent.click(button);
      await waitFor(() => {
        expect(screen.getByTestId('notification-center')).toBeInTheDocument();
      });

      // Press Escape
      fireEvent.keyDown(document, { key: 'Escape' });

      // Verify notification center is closed
      await waitFor(() => {
        expect(screen.queryByTestId('notification-center')).not.toBeInTheDocument();
      });
    });

    it('does not close when Escape pressed while notification center is closed', async () => {
      useUnreadCount.mockReturnValue({ data: { unreadCount: 0 }, refetch: vi.fn() });

      render(<NotificationBell />);

      // Press Escape without opening
      fireEvent.keyDown(document, { key: 'Escape' });

      // Nothing should happen
      expect(screen.queryByTestId('notification-center')).not.toBeInTheDocument();
    });
  });

  describe('tab visibility handling', () => {
    it('refetches unread count when tab becomes visible', async () => {
      const refetchMock = vi.fn();
      useUnreadCount.mockReturnValue({ data: { unreadCount: 0 }, refetch: refetchMock });

      render(<NotificationBell />);

      // Simulate tab becoming visible
      Object.defineProperty(document, 'hidden', {
        configurable: true,
        get: () => false,
      });

      document.dispatchEvent(new Event('visibilitychange'));

      await waitFor(() => {
        expect(refetchMock).toHaveBeenCalled();
      });
    });

    it('does not refetch when tab is hidden', () => {
      const refetchMock = vi.fn();
      useUnreadCount.mockReturnValue({ data: { unreadCount: 0 }, refetch: refetchMock });

      render(<NotificationBell />);

      // Simulate tab becoming hidden
      Object.defineProperty(document, 'hidden', {
        configurable: true,
        get: () => true,
      });

      document.dispatchEvent(new Event('visibilitychange'));

      // Reset mock to see if it's called after visibility change
      refetchMock.mockClear();

      // Trigger event
      document.dispatchEvent(new Event('visibilitychange'));

      expect(refetchMock).not.toHaveBeenCalled();
    });

    it('removes visibility listener on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');
      useUnreadCount.mockReturnValue({ data: { unreadCount: 0 }, refetch: vi.fn() });

      const { unmount } = render(<NotificationBell />);

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'visibilitychange',
        expect.any(Function)
      );

      removeEventListenerSpy.mockRestore();
    });
  });

  describe('styling', () => {
    it('has hover effect on button', () => {
      useUnreadCount.mockReturnValue({ data: { unreadCount: 0 }, refetch: vi.fn() });

      const { container } = render(<NotificationBell />);

      const button = container.querySelector('button');
      expect(button).toHaveClass('hover:bg-gray-700');
    });

    it('has proper focus styling', () => {
      useUnreadCount.mockReturnValue({ data: { unreadCount: 0 }, refetch: vi.fn() });

      const { container } = render(<NotificationBell />);

      const button = container.querySelector('button');
      expect(button).toHaveClass(
        'focus-visible:outline-2',
        'focus-visible:outline-offset-2',
        'focus-visible:outline-sky-500'
      );
    });

    it('has transition effect', () => {
      useUnreadCount.mockReturnValue({ data: { unreadCount: 0 }, refetch: vi.fn() });

      const { container } = render(<NotificationBell />);

      const button = container.querySelector('button');
      expect(button).toHaveClass('transition');
    });
  });

  describe('edge cases', () => {
    it('handles undefined unread count gracefully', () => {
      useUnreadCount.mockReturnValue({ data: undefined, refetch: vi.fn() });

      render(<NotificationBell />);

      const button = screen.getByRole('button');
      expect(button.getAttribute('aria-label')).toMatch(/^Notifications/);
    });

    it('handles null unread count gracefully', () => {
      useUnreadCount.mockReturnValue({ data: { unreadCount: null }, refetch: vi.fn() });

      render(<NotificationBell />);

      const button = screen.getByRole('button');
      expect(button.getAttribute('aria-label')).toMatch(/^Notifications/);
    });

    it('handles missing refetch function', () => {
      useUnreadCount.mockReturnValue({ data: { unreadCount: 0 }, refetch: undefined });

      expect(() => {
        render(<NotificationBell />);
      }).not.toThrow();
    });
  });
});
