import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@/test/utils';
import { usePathname } from 'next/navigation';
import { Sidebar, SidebarItem } from './Sidebar';

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
}));

// A module factory must return a module object; returning the component
// directly makes vi.mock throw before any test runs.
vi.mock('next/link', () => ({
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

describe('Sidebar Component', () => {
  const mockItems: SidebarItem[] = [
    {
      id: '1',
      label: 'Dashboard',
      href: '/dashboard',
      icon: <span>📊</span>,
    },
    {
      id: '2',
      label: 'Waste Records',
      href: '/waste',
      icon: <span>🚨</span>,
    },
    {
      id: '3',
      label: 'Settings',
      href: '/settings',
      icon: <span>⚙️</span>,
    },
  ];

  beforeEach(() => {
    (usePathname as unknown as ReturnType<typeof vi.fn>).mockReturnValue('/dashboard');
  });

  describe('Rendering', () => {
    it('renders sidebar with navigation label', () => {
      render(<Sidebar items={mockItems} />);
      expect(screen.getByLabelText('Navigation')).toBeInTheDocument();
    });

    it('renders all navigation items', () => {
      render(<Sidebar items={mockItems} />);
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Waste Records')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    it('renders icons for each item', () => {
      render(<Sidebar items={mockItems} />);
      expect(screen.getByText('📊')).toBeInTheDocument();
      expect(screen.getByText('🚨')).toBeInTheDocument();
      expect(screen.getByText('⚙️')).toBeInTheDocument();
    });

    it('renders branding text when open', () => {
      render(<Sidebar items={mockItems} open={true} />);
      expect(screen.getByText('Oakami')).toBeInTheDocument();
    });

    it('does not render branding text when closed', () => {
      render(<Sidebar items={mockItems} open={false} />);
      expect(screen.queryByText('Oakami')).not.toBeInTheDocument();
    });

    it('renders footer text when open', () => {
      render(<Sidebar items={mockItems} open={true} />);
      expect(screen.getByText(/© 2026 Oakami/)).toBeInTheDocument();
    });

    it('does not render footer text when closed', () => {
      render(<Sidebar items={mockItems} open={false} />);
      expect(screen.queryByText(/© 2026 Oakami/)).not.toBeInTheDocument();
    });

    it('renders empty sidebar when no items provided', () => {
      render(<Sidebar items={[]} />);
      expect(screen.getByLabelText('Navigation')).toBeInTheDocument();
    });
  });

  describe('Active Link Detection', () => {
    it('marks current page as active', () => {
      render(<Sidebar items={mockItems} />);
      const dashboardLink = screen.getByText('Dashboard').closest('a');
      expect(dashboardLink).toHaveAttribute('aria-current', 'page');
    });

    it('does not mark inactive links as active', () => {
      render(<Sidebar items={mockItems} />);
      const wasteLink = screen.getByText('Waste Records').closest('a');
      expect(wasteLink).not.toHaveAttribute('aria-current', 'page');
    });

    it('updates active state when pathname changes', () => {
      (usePathname as unknown as ReturnType<typeof vi.fn>).mockReturnValue('/waste');
      render(<Sidebar items={mockItems} />);
      const wasteLink = screen.getByText('Waste Records').closest('a');
      expect(wasteLink).toHaveAttribute('aria-current', 'page');
    });

    it('applies active styling to active link', () => {
      render(<Sidebar items={mockItems} />);
      const dashboardLink = screen.getByText('Dashboard').closest('a');
      expect(dashboardLink).toHaveClass('bg-gray-800');
      expect(dashboardLink).toHaveClass('border-l-4');
      expect(dashboardLink).toHaveClass('border-sky-500');
    });
  });

  describe('Collapse/Expand', () => {
    it('renders collapse button', () => {
      render(<Sidebar items={mockItems} />);
      expect(screen.getByLabelText('Collapse sidebar')).toBeInTheDocument();
    });

    it('calls onOpenChange when collapse button clicked', () => {
      const onOpenChange = vi.fn();
      render(
        <Sidebar items={mockItems} open={true} onOpenChange={onOpenChange} />
      );
      const collapseButton = screen.getByLabelText('Collapse sidebar');
      fireEvent.click(collapseButton);
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it('shows expand label when closed', () => {
      render(<Sidebar items={mockItems} open={false} />);
      expect(screen.getByLabelText('Expand sidebar')).toBeInTheDocument();
    });

    it('shows labels when open', () => {
      render(<Sidebar items={mockItems} open={true} />);
      expect(screen.getByText('Dashboard')).toBeVisible();
    });

    it('hides labels when closed', () => {
      render(<Sidebar items={mockItems} open={false} />);
      expect(screen.getByText('Dashboard')).not.toBeVisible();
    });
  });

  describe('Nested Items', () => {
    const nestedItems: SidebarItem[] = [
      {
        id: '1',
        label: 'Reports',
        icon: <span>📈</span>,
        children: [
          {
            id: '1-1',
            label: 'Daily Report',
            href: '/reports/daily',
          },
          {
            id: '1-2',
            label: 'Weekly Report',
            href: '/reports/weekly',
          },
        ],
      },
    ];

    it('renders parent item with expand button', () => {
      render(<Sidebar items={nestedItems} />);
      const expandButton = screen.getByRole('button', { name: /Reports/i });
      expect(expandButton).toBeInTheDocument();
    });

    it('expands nested items when parent clicked', () => {
      render(<Sidebar items={nestedItems} open={true} />);
      const expandButton = screen.getByRole('button', { name: /Reports/i });
      fireEvent.click(expandButton);
      expect(screen.getByText('Daily Report')).toBeVisible();
      expect(screen.getByText('Weekly Report')).toBeVisible();
    });

    it('collapses nested items when parent clicked again', () => {
      render(<Sidebar items={nestedItems} open={true} />);
      const expandButton = screen.getByRole('button', { name: /Reports/i });
      fireEvent.click(expandButton);
      fireEvent.click(expandButton);
      expect(screen.queryByText('Daily Report')).not.toBeVisible();
    });

    it('marks active nested item as current', () => {
      (usePathname as unknown as ReturnType<typeof vi.fn>).mockReturnValue('/reports/daily');
      render(<Sidebar items={nestedItems} open={true} />);
      const expandButton = screen.getByRole('button', { name: /Reports/i });
      fireEvent.click(expandButton);
      const dailyLink = screen.getByText('Daily Report').closest('a');
      expect(dailyLink).toHaveAttribute('aria-current', 'page');
    });

    it('hides nested labels when sidebar closed', () => {
      render(<Sidebar items={nestedItems} open={false} />);
      const expandButton = screen.getByRole('button', { name: /Reports/i });
      fireEvent.click(expandButton);
      expect(screen.queryByText('Daily Report')).not.toBeVisible();
    });
  });

  describe('Disabled Items', () => {
    const disabledItems: SidebarItem[] = [
      {
        id: '1',
        label: 'Active',
        href: '/active',
      },
      {
        id: '2',
        label: 'Disabled',
        href: '/disabled',
        disabled: true,
      },
    ];

    it('renders disabled items with opacity', () => {
      render(<Sidebar items={disabledItems} />);
      const disabledLink = screen.getByText('Disabled').closest('a');
      expect(disabledLink).toHaveClass('opacity-50');
    });

    it('prevents clicking disabled items', () => {
      render(<Sidebar items={disabledItems} />);
      const disabledLink = screen.getByText('Disabled').closest('a');
      expect(disabledLink).toHaveClass('pointer-events-none');
    });
  });

  describe('Keyboard Navigation', () => {
    it('includes focusable elements', () => {
      render(<Sidebar items={mockItems} />);
      const collapseButton = screen.getByLabelText('Collapse sidebar');
      expect(collapseButton).toBeInTheDocument();
    });

    it('focus visible outline on collapse button', () => {
      render(<Sidebar items={mockItems} />);
      const collapseButton = screen.getByLabelText('Collapse sidebar');
      expect(collapseButton).toHaveClass('focus-visible:outline-sky-500');
    });

    it('focus visible outline on navigation links', () => {
      render(<Sidebar items={mockItems} />);
      const link = screen.getByText('Dashboard').closest('a');
      expect(link).toHaveClass('focus-visible:outline-sky-500');
    });
  });

  describe('Accessibility', () => {
    it('has semantic nav element', () => {
      render(<Sidebar items={mockItems} />);
      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
    });

    it('collapse button has aria-label', () => {
      render(<Sidebar items={mockItems} />);
      expect(screen.getByLabelText('Collapse sidebar')).toBeInTheDocument();
    });

    it('nav elements have aria-controls', () => {
      render(<Sidebar items={mockItems} />);
      const button = screen.getByLabelText('Collapse sidebar');
      expect(button).toHaveAttribute('aria-controls', 'sidebar-nav');
    });

    it('expanded state has aria-expanded attribute', () => {
      const nestedItems: SidebarItem[] = [
        {
          id: '1',
          label: 'Parent',
          children: [{ id: '1-1', label: 'Child', href: '/child' }],
        },
      ];
      render(<Sidebar items={nestedItems} open={true} />);
      const button = screen.getByRole('button', { name: /Parent/i });
      expect(button).toHaveAttribute('aria-expanded', 'false');
    });

    it('icons are hidden from screen readers', () => {
      render(<Sidebar items={mockItems} />);
      const icons = screen.getAllByText(/📊|🚨|⚙️/);
      icons.forEach((icon) => {
        expect(icon.closest('span')).toHaveAttribute('aria-hidden', 'true');
      });
    });
  });

  describe('Styling', () => {
    it('has dark background color', () => {
      const { container } = render(<Sidebar items={mockItems} />);
      const aside = container.querySelector('aside');
      expect(aside).toHaveClass('bg-gray-900');
    });

    it('has border on right edge', () => {
      const { container } = render(<Sidebar items={mockItems} />);
      const aside = container.querySelector('aside');
      expect(aside).toHaveClass('border-r');
    });

    it('has smooth transition', () => {
      const { container } = render(<Sidebar items={mockItems} />);
      const aside = container.querySelector('aside');
      expect(aside).toHaveClass('transition-all');
    });

    it('applies custom className', () => {
      const { container } = render(
        <Sidebar items={mockItems} className="custom-class" />
      );
      const aside = container.querySelector('aside');
      expect(aside).toHaveClass('custom-class');
    });
  });

  describe('Hover States', () => {
    it('nav links have hover styling', () => {
      render(<Sidebar items={mockItems} />);
      const link = screen.getByText('Dashboard').closest('a');
      expect(link).toHaveClass('hover:bg-gray-800');
    });

    it('buttons have hover styling', () => {
      const nestedItems: SidebarItem[] = [
        {
          id: '1',
          label: 'Parent',
          children: [{ id: '1-1', label: 'Child', href: '/child' }],
        },
      ];
      render(<Sidebar items={nestedItems} />);
      const button = screen.getByRole('button', { name: /Parent/i });
      expect(button).toHaveClass('hover:bg-gray-800');
    });
  });

  describe('Edge Cases', () => {
    it('handles items without icons', () => {
      const itemsNoIcons: SidebarItem[] = [
        {
          id: '1',
          label: 'Dashboard',
          href: '/dashboard',
        },
      ];
      render(<Sidebar items={itemsNoIcons} />);
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    it('handles items without href (no children)', () => {
      const groupItem: SidebarItem[] = [
        {
          id: '1',
          label: 'Group',
        },
      ];
      render(<Sidebar items={groupItem} />);
      expect(screen.getByText('Group')).toBeInTheDocument();
    });

    it('truncates long labels', () => {
      const longItems: SidebarItem[] = [
        {
          id: '1',
          label: 'This is a very long navigation item label that should be truncated',
          href: '/long',
        },
      ];
      render(<Sidebar items={longItems} open={true} />);
      const link = screen.getByText(
        'This is a very long navigation item label that should be truncated'
      ).closest('a');
      expect(link).toHaveClass('truncate');
    });

    it('handles rapid collapse/expand', () => {
      const onOpenChange = vi.fn();
      render(
        <Sidebar items={mockItems} open={true} onOpenChange={onOpenChange} />
      );
      const button = screen.getByLabelText('Collapse sidebar');
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);
      expect(onOpenChange).toHaveBeenCalledTimes(3);
    });
  });
});
