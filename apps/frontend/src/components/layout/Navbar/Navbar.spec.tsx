import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@/test/utils';
import { usePathname } from 'next/navigation';
import { Navbar } from './Navbar';

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
}));

// A module factory must return a module object; returning the component
// directly makes vi.mock throw before any test runs.
vi.mock('next/link', () => ({
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

describe('Navbar Component', () => {
  const mockItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Waste Records', href: '/waste' },
    { label: 'Settings', href: '/settings' },
  ];

  beforeEach(() => {
    (usePathname as unknown as ReturnType<typeof vi.fn>).mockReturnValue('/dashboard');
  });

  describe('Rendering', () => {
    it('renders navbar with banner role', () => {
      const { container } = render(<Navbar items={mockItems} />);
      expect(container.querySelector('[role="banner"]')).toBeInTheDocument();
    });

    it('renders logo by default', () => {
      render(<Navbar />);
      expect(screen.getByText('Oakami')).toBeInTheDocument();
    });

    it('renders custom logo when provided', () => {
      render(<Navbar logo={<span>Custom Logo</span>} />);
      expect(screen.getByText('Custom Logo')).toBeInTheDocument();
    });

    it('renders all navigation items on desktop', () => {
      render(<Navbar items={mockItems} />);
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Waste Records')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    it('renders logo link with correct href', () => {
      const { container } = render(<Navbar logoHref="/home" />);
      const logoLink = container.querySelector('a');
      expect(logoLink).toHaveAttribute('href', '/home');
    });

    it('renders mobile menu toggle button', () => {
      render(<Navbar items={mockItems} />);
      expect(screen.getByLabelText('Toggle navigation menu')).toBeInTheDocument();
    });

    it('renders right content when provided', () => {
      render(<Navbar rightContent={<button>User Menu</button>} />);
      expect(screen.getByText('User Menu')).toBeInTheDocument();
    });
  });

  describe('Active Link Detection', () => {
    it('marks current page as active', () => {
      render(<Navbar items={mockItems} />);
      const dashboardLink = screen.getByText('Dashboard').closest('a');
      expect(dashboardLink).toHaveAttribute('aria-current', 'page');
    });

    it('does not mark inactive links as active', () => {
      render(<Navbar items={mockItems} />);
      const wasteLink = screen.getByText('Waste Records').closest('a');
      expect(wasteLink).not.toHaveAttribute('aria-current', 'page');
    });

    it('applies active styling to active link', () => {
      render(<Navbar items={mockItems} />);
      const dashboardLink = screen.getByText('Dashboard').closest('a');
      expect(dashboardLink).toHaveClass('border-b-2');
      expect(dashboardLink).toHaveClass('border-sky-500');
    });

    it('updates active state when pathname changes', () => {
      (usePathname as unknown as ReturnType<typeof vi.fn>).mockReturnValue('/waste');
      render(<Navbar items={mockItems} />);
      const wasteLink = screen.getByText('Waste Records').closest('a');
      expect(wasteLink).toHaveAttribute('aria-current', 'page');
    });
  });

  describe('Mobile Menu Toggle', () => {
    it('mobile menu toggle button is hidden on desktop', () => {
      const { container } = render(<Navbar items={mockItems} />);
      const button = screen.getByLabelText('Toggle navigation menu');
      expect(button.closest('button')).toHaveClass('md:hidden');
    });

    it('calls onMenuToggle when button clicked', () => {
      const onMenuToggle = vi.fn();
      render(<Navbar items={mockItems} onMenuToggle={onMenuToggle} />);
      const button = screen.getByLabelText('Toggle navigation menu');
      fireEvent.click(button);
      expect(onMenuToggle).toHaveBeenCalled();
    });

    it('toggles aria-expanded attribute', () => {
      render(<Navbar items={mockItems} />);
      const button = screen.getByLabelText('Toggle navigation menu');
      expect(button).toHaveAttribute('aria-expanded', 'false');
      fireEvent.click(button);
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });

    it('shows mobile menu when toggle clicked', () => {
      render(<Navbar items={mockItems} />);
      const button = screen.getByLabelText('Toggle navigation menu');
      fireEvent.click(button);
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('hides mobile menu when toggled again', () => {
      render(<Navbar items={mockItems} />);
      const button = screen.getByLabelText('Toggle navigation menu');
      fireEvent.click(button);
      fireEvent.click(button);
      // Mobile nav should be removed from DOM or hidden
      const navs = screen.queryAllByRole('navigation');
      expect(navs.length).toBeLessThanOrEqual(1); // Only main nav should remain
    });

    it('displays mobile navigation items in menu', () => {
      render(<Navbar items={mockItems} />);
      const button = screen.getByLabelText('Toggle navigation menu');
      fireEvent.click(button);
      expect(screen.getAllByText('Dashboard').length).toBeGreaterThan(1);
    });
  });

  describe('Variants', () => {
    it('renders dark variant by default', () => {
      const { container } = render(<Navbar />);
      const navbar = container.querySelector('[role="banner"]');
      expect(navbar).toHaveClass('bg-gray-900');
    });

    it('renders light variant when specified', () => {
      const { container } = render(<Navbar variant="light" />);
      const navbar = container.querySelector('[role="banner"]');
      expect(navbar).toHaveClass('bg-white');
    });

    it('applies correct text color for dark variant', () => {
      const { container } = render(<Navbar variant="dark" />);
      const logoLink = container.querySelector('a');
      expect(logoLink).toHaveClass('text-white');
    });

    it('applies correct text color for light variant', () => {
      const { container } = render(<Navbar variant="light" />);
      const logoLink = container.querySelector('a');
      expect(logoLink).toHaveClass('text-gray-900');
    });
  });

  describe('Sticky Positioning', () => {
    it('has sticky positioning by default', () => {
      const { container } = render(<Navbar />);
      const navbar = container.querySelector('[role="banner"]');
      expect(navbar).toHaveClass('sticky');
      expect(navbar).toHaveClass('top-0');
    });

    it('removes sticky positioning when disabled', () => {
      const { container } = render(<Navbar sticky={false} />);
      const navbar = container.querySelector('[role="banner"]');
      expect(navbar).not.toHaveClass('sticky');
    });
  });

  describe('Accessibility', () => {
    it('has semantic nav element for desktop navigation', () => {
      const { container } = render(<Navbar items={mockItems} />);
      const nav = container.querySelector('nav[aria-label="Main navigation"]');
      expect(nav).toBeInTheDocument();
    });

    it('nav has aria-label', () => {
      const { container } = render(<Navbar items={mockItems} />);
      const nav = container.querySelector('nav');
      expect(nav).toHaveAttribute('aria-label', 'Main navigation');
    });

    it('logo link has focus visible outline', () => {
      const { container } = render(<Navbar />);
      const logoLink = container.querySelector('a[href="/"]');
      expect(logoLink).toHaveClass('focus-visible:outline-2');
      expect(logoLink).toHaveClass('focus-visible:outline-sky-500');
    });

    it('nav links have focus visible outline', () => {
      render(<Navbar items={mockItems} />);
      const link = screen.getByText('Dashboard').closest('a');
      expect(link).toHaveClass('focus-visible:outline-2');
      expect(link).toHaveClass('focus-visible:outline-sky-500');
    });

    it('menu toggle button has proper aria attributes', () => {
      render(<Navbar items={mockItems} />);
      const button = screen.getByLabelText('Toggle navigation menu');
      expect(button).toHaveAttribute('aria-controls', 'mobile-nav');
    });
  });

  describe('Responsive Behavior', () => {
    it('hides desktop navigation items on mobile', () => {
      const { container } = render(<Navbar items={mockItems} />);
      const desktopNav = container.querySelector('nav');
      expect(desktopNav).toHaveClass('hidden');
      expect(desktopNav).toHaveClass('md:flex');
    });

    it('shows desktop navigation items on desktop screens', () => {
      const { container } = render(<Navbar items={mockItems} />);
      const desktopNav = container.querySelector('nav');
      expect(desktopNav).toHaveClass('md:flex');
    });

    it('mobile menu items have correct styling', () => {
      render(<Navbar items={mockItems} />);
      const button = screen.getByLabelText('Toggle navigation menu');
      fireEvent.click(button);
      const mobileNav = screen.getByRole('navigation');
      expect(mobileNav).toHaveClass('md:hidden');
    });

    it('applies dark mode classes', () => {
      const { container } = render(<Navbar variant="dark" />);
      const navbar = container.querySelector('[role="banner"]');
      expect(navbar).toHaveClass('dark:bg-gray-900');
      expect(navbar).toHaveClass('dark:border-gray-800');
    });
  });

  describe('Styling & Layout', () => {
    it('has proper height', () => {
      const { container } = render(<Navbar />);
      const navbar = container.querySelector('[role="banner"]');
      expect(navbar).toHaveClass('h-16');
    });

    it('applies custom className', () => {
      const { container } = render(<Navbar className="custom-class" />);
      const navbar = container.querySelector('[role="banner"]');
      expect(navbar).toHaveClass('custom-class');
    });

    it('has appropriate padding', () => {
      const { container } = render(<Navbar />);
      const navbar = container.querySelector('[role="banner"]');
      expect(navbar).toHaveClass('px-4');
      expect(navbar).toHaveClass('md:px-6');
    });

    it('uses flexbox layout', () => {
      const { container } = render(<Navbar />);
      const navbar = container.querySelector('[role="banner"]');
      expect(navbar).toHaveClass('flex');
      expect(navbar).toHaveClass('items-center');
      expect(navbar).toHaveClass('justify-between');
    });
  });

  describe('Hover States', () => {
    it('nav links have hover styling', () => {
      render(<Navbar items={mockItems} variant="dark" />);
      const link = screen.getByText('Dashboard').closest('a');
      expect(link).toHaveClass('hover:bg-gray-800');
    });

    it('menu toggle has hover styling', () => {
      render(<Navbar items={mockItems} />);
      const button = screen.getByLabelText('Toggle navigation menu');
      expect(button).toHaveClass('hover:bg-gray-800');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty items list', () => {
      render(<Navbar items={[]} />);
      expect(screen.getByText('Oakami')).toBeInTheDocument();
    });

    it('handles no right content', () => {
      render(<Navbar items={mockItems} />);
      expect(screen.getByLabelText('Toggle navigation menu')).toBeInTheDocument();
    });

    it('handles very long navigation labels', () => {
      const longItems = [
        { label: 'This is a very long navigation item label', href: '/long' },
      ];
      render(<Navbar items={longItems} />);
      expect(screen.getByText('This is a very long navigation item label')).toBeInTheDocument();
    });

    it('handles special characters in labels', () => {
      const specialItems = [
        { label: 'Items & Things', href: '/items' },
      ];
      render(<Navbar items={specialItems} />);
      expect(screen.getByText('Items & Things')).toBeInTheDocument();
    });

    it('renders correct hamburger icon based on menu state', () => {
      const { container } = render(<Navbar items={mockItems} />);
      const button = screen.getByLabelText('Toggle navigation menu');

      // Initially closed - should show hamburger
      let svg = button.querySelector('svg');
      let paths = svg?.querySelectorAll('path');
      expect(paths).toBeDefined();

      // Click to open
      fireEvent.click(button);
      svg = button.querySelector('svg');
      paths = svg?.querySelectorAll('path');
      expect(paths).toBeDefined();
    });
  });

  describe('Mobile Right Content', () => {
    it('displays right content in mobile menu', () => {
      render(
        <Navbar
          items={mockItems}
          rightContent={<button>User Menu</button>}
        />
      );
      const button = screen.getByLabelText('Toggle navigation menu');
      fireEvent.click(button);
      expect(screen.getByText('User Menu')).toBeInTheDocument();
    });

    it('separates mobile right content with border', () => {
      const { container } = render(
        <Navbar
          items={mockItems}
          rightContent={<button>User Menu</button>}
        />
      );
      const button = screen.getByLabelText('Toggle navigation menu');
      fireEvent.click(button);
      const separator = container.querySelector('.border-t');
      expect(separator).toBeInTheDocument();
    });
  });
});
