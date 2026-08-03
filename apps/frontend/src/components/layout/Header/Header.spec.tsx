import { render, screen } from '@testing-library/react';
import { Header, Breadcrumb } from './Header';

jest.mock('next/link', () => {
  return ({ children, href }: any) => <a href={href}>{children}</a>;
});

describe('Header Component', () => {
  describe('Rendering', () => {
    it('renders with title', () => {
      render(<Header title="Dashboard" />);
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    it('renders with description', () => {
      render(
        <Header
          title="Dashboard"
          description="Manage your waste records"
        />
      );
      expect(screen.getByText('Manage your waste records')).toBeInTheDocument();
    });

    it('renders without description', () => {
      render(<Header title="Dashboard" />);
      expect(screen.queryByText(/Manage/)).not.toBeInTheDocument();
    });

    it('renders without breadcrumbs', () => {
      const { container } = render(<Header title="Dashboard" />);
      expect(container.querySelector('nav[aria-label="Breadcrumbs"]')).not.toBeInTheDocument();
    });

    it('renders with breadcrumbs', () => {
      const breadcrumbs: Breadcrumb[] = [
        { label: 'Home', href: '/' },
        { label: 'Dashboard' },
      ];
      render(<Header title="Dashboard" breadcrumbs={breadcrumbs} />);
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    it('renders with actions', () => {
      render(
        <Header
          title="Dashboard"
          actions={<button>Add Record</button>}
        />
      );
      expect(screen.getByText('Add Record')).toBeInTheDocument();
    });

    it('renders without actions', () => {
      render(<Header title="Dashboard" />);
      expect(screen.queryByText(/Add/)).not.toBeInTheDocument();
    });

    it('renders container with max-width', () => {
      const { container } = render(<Header title="Dashboard" />);
      const inner = container.querySelector('.max-w-7xl');
      expect(inner).toBeInTheDocument();
    });
  });

  describe('Heading Levels', () => {
    it('renders h1 by default', () => {
      const { container } = render(<Header title="Dashboard" />);
      expect(container.querySelector('h1')).toBeInTheDocument();
    });

    it('renders h2 when level="h2"', () => {
      const { container } = render(<Header title="Dashboard" level="h2" />);
      expect(container.querySelector('h2')).toBeInTheDocument();
      expect(container.querySelector('h1')).not.toBeInTheDocument();
    });

    it('renders h3 when level="h3"', () => {
      const { container } = render(<Header title="Dashboard" level="h3" />);
      expect(container.querySelector('h3')).toBeInTheDocument();
    });

    it('h1 has appropriate styling', () => {
      const { container } = render(<Header title="Dashboard" level="h1" />);
      const heading = container.querySelector('h1');
      expect(heading).toHaveClass('text-4xl');
      expect(heading).toHaveClass('md:text-5xl');
    });

    it('h2 has appropriate styling', () => {
      const { container } = render(<Header title="Dashboard" level="h2" />);
      const heading = container.querySelector('h2');
      expect(heading).toHaveClass('text-3xl');
      expect(heading).toHaveClass('md:text-4xl');
    });

    it('h3 has appropriate styling', () => {
      const { container } = render(<Header title="Dashboard" level="h3" />);
      const heading = container.querySelector('h3');
      expect(heading).toHaveClass('text-2xl');
      expect(heading).toHaveClass('md:text-3xl');
    });
  });

  describe('Breadcrumbs', () => {
    const breadcrumbs: Breadcrumb[] = [
      { label: 'Home', href: '/' },
      { label: 'Settings', href: '/settings' },
      { label: 'Profile' },
    ];

    it('renders breadcrumb links', () => {
      render(<Header title="Profile" breadcrumbs={breadcrumbs} />);
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    it('renders last breadcrumb as current page', () => {
      render(<Header title="Profile" breadcrumbs={breadcrumbs} />);
      const currentBreadcrumb = screen.getByText('Profile').closest('span');
      expect(currentBreadcrumb).toHaveAttribute('aria-current', 'page');
    });

    it('last breadcrumb is not a link', () => {
      render(<Header title="Profile" breadcrumbs={breadcrumbs} />);
      const links = screen.getAllByRole('link');
      expect(links.length).toBe(2); // Only Home and Settings should be links
    });

    it('breadcrumb links are keyboard accessible', () => {
      render(<Header title="Profile" breadcrumbs={breadcrumbs} />);
      const links = screen.getAllByRole('link');
      links.forEach((link) => {
        expect(link).toHaveClass('focus-visible:outline-sky-500');
      });
    });

    it('separates breadcrumbs with forward slashes', () => {
      const { container } = render(
        <Header title="Profile" breadcrumbs={breadcrumbs} />
      );
      const separators = container.querySelectorAll('[aria-hidden="true"]');
      expect(separators.length).toBeGreaterThan(0);
    });

    it('nav has breadcrumbs aria-label', () => {
      const { container } = render(
        <Header title="Profile" breadcrumbs={breadcrumbs} />
      );
      const nav = container.querySelector('nav[aria-label="Breadcrumbs"]');
      expect(nav).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    it('renders default variant', () => {
      const { container } = render(<Header title="Dashboard" />);
      const header = container.querySelector('[class*="bg-"]');
      expect(header).toHaveClass('bg-white');
    });

    it('renders elevated variant', () => {
      const { container } = render(
        <Header title="Dashboard" variant="elevated" />
      );
      const header = container.querySelector('[class*="shadow"]');
      expect(header).toHaveClass('shadow-sm');
    });

    it('renders outlined variant', () => {
      const { container } = render(
        <Header title="Dashboard" variant="outlined" />
      );
      const header = container.firstChild;
      expect(header).toHaveClass('border');
    });
  });

  describe('Padding', () => {
    it('applies small padding', () => {
      const { container } = render(
        <Header title="Dashboard" padding="sm" />
      );
      const header = container.firstChild;
      expect(header).toHaveClass('px-4');
      expect(header).toHaveClass('py-4');
    });

    it('applies medium padding by default', () => {
      const { container } = render(<Header title="Dashboard" />);
      const header = container.firstChild;
      expect(header).toHaveClass('px-4');
      expect(header).toHaveClass('py-6');
    });

    it('applies large padding', () => {
      const { container } = render(
        <Header title="Dashboard" padding="lg" />
      );
      const header = container.firstChild;
      expect(header).toHaveClass('px-6');
      expect(header).toHaveClass('py-8');
    });

    it('applies responsive padding', () => {
      const { container } = render(
        <Header title="Dashboard" padding="md" />
      );
      const header = container.firstChild;
      expect(header).toHaveClass('md:px-8');
    });
  });

  describe('Layout & Responsive', () => {
    it('has flex layout for content', () => {
      const { container } = render(<Header title="Dashboard" />);
      const inner = container.querySelector('.flex');
      expect(inner).toHaveClass('flex-col');
      expect(inner).toHaveClass('md:flex-row');
    });

    it('stacks vertically on mobile', () => {
      const { container } = render(
        <Header
          title="Dashboard"
          description="Test"
          actions={<button>Action</button>}
        />
      );
      const inner = container.querySelector('.flex-col');
      expect(inner).toHaveClass('md:flex-row');
    });

    it('has dark mode support', () => {
      const { container } = render(<Header title="Dashboard" />);
      const header = container.firstChild;
      expect(header).toHaveClass('dark:bg-gray-900');
    });

    it('title and description are flex-1 on desktop', () => {
      const { container } = render(
        <Header
          title="Dashboard"
          description="Test"
          actions={<button>Action</button>}
        />
      );
      const titleSection = container.querySelector('.flex-1');
      expect(titleSection).toBeInTheDocument();
    });
  });

  describe('Actions', () => {
    it('renders multiple action buttons', () => {
      render(
        <Header
          title="Dashboard"
          actions={
            <>
              <button>Add</button>
              <button>Export</button>
            </>
          }
        />
      );
      expect(screen.getByText('Add')).toBeInTheDocument();
      expect(screen.getByText('Export')).toBeInTheDocument();
    });

    it('actions are right-aligned on desktop', () => {
      const { container } = render(
        <Header
          title="Dashboard"
          actions={<button>Action</button>}
        />
      );
      const actions = container.querySelector('.md:justify-end');
      expect(actions).toBeInTheDocument();
    });

    it('actions wrap on mobile', () => {
      const { container } = render(
        <Header
          title="Dashboard"
          actions={<button>Action</button>}
        />
      );
      const actions = container.querySelector('.flex-wrap');
      expect(actions).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('applies custom className', () => {
      const { container } = render(
        <Header title="Dashboard" className="custom-class" />
      );
      const header = container.firstChild;
      expect(header).toHaveClass('custom-class');
    });

    it('has top border', () => {
      const { container } = render(<Header title="Dashboard" />);
      const header = container.firstChild;
      expect(header).toHaveClass('border-b');
    });

    it('title is bold', () => {
      const { container } = render(<Header title="Dashboard" />);
      const heading = container.querySelector('h1');
      expect(heading).toHaveClass('font-bold');
    });

    it('title has dark mode text color', () => {
      const { container } = render(<Header title="Dashboard" />);
      const heading = container.querySelector('h1');
      expect(heading).toHaveClass('dark:text-white');
    });

    it('description has secondary color', () => {
      render(<Header title="Dashboard" description="Test" />);
      const description = screen.getByText('Test');
      expect(description).toHaveClass('text-gray-600');
      expect(description).toHaveClass('dark:text-gray-400');
    });
  });

  describe('Edge Cases', () => {
    it('handles very long titles', () => {
      render(
        <Header title="This is an extremely long title that might wrap on smaller screens" />
      );
      expect(
        screen.getByText(
          /This is an extremely long title that might wrap on smaller screens/
        )
      ).toBeInTheDocument();
    });

    it('handles long descriptions', () => {
      render(
        <Header
          title="Dashboard"
          description="This is a very long description that provides additional context about the dashboard and its purpose in the application."
        />
      );
      expect(
        screen.getByText(/This is a very long description/)
      ).toBeInTheDocument();
    });

    it('handles single breadcrumb', () => {
      render(
        <Header
          title="Dashboard"
          breadcrumbs={[{ label: 'Home', href: '/' }]}
        />
      );
      expect(screen.getByText('Home')).toBeInTheDocument();
    });

    it('handles many breadcrumbs', () => {
      const breadcrumbs: Breadcrumb[] = [
        { label: 'Home', href: '/' },
        { label: 'Admin', href: '/admin' },
        { label: 'Settings', href: '/settings' },
        { label: 'Profile', href: '/profile' },
        { label: 'Avatar' },
      ];
      render(<Header title="Avatar" breadcrumbs={breadcrumbs} />);
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Avatar')).toBeInTheDocument();
    });

    it('handles no title', () => {
      const { container } = render(<Header title="" />);
      expect(container.querySelector('h1')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has semantic heading element', () => {
      const { container } = render(<Header title="Dashboard" />);
      expect(container.querySelector('h1')).toBeInTheDocument();
    });

    it('breadcrumb nav is semantic', () => {
      const breadcrumbs: Breadcrumb[] = [
        { label: 'Home', href: '/' },
        { label: 'Dashboard' },
      ];
      const { container } = render(
        <Header title="Dashboard" breadcrumbs={breadcrumbs} />
      );
      expect(container.querySelector('nav')).toBeInTheDocument();
    });

    it('current breadcrumb marked with aria-current', () => {
      const breadcrumbs: Breadcrumb[] = [
        { label: 'Home', href: '/' },
        { label: 'Dashboard' },
      ];
      render(<Header title="Dashboard" breadcrumbs={breadcrumbs} />);
      const current = screen.getByText('Dashboard').closest('span');
      expect(current).toHaveAttribute('aria-current', 'page');
    });

    it('breadcrumb separators are hidden from screen readers', () => {
      const breadcrumbs: Breadcrumb[] = [
        { label: 'Home', href: '/' },
        { label: 'Dashboard' },
      ];
      const { container } = render(
        <Header title="Dashboard" breadcrumbs={breadcrumbs} />
      );
      const separators = container.querySelectorAll('[aria-hidden="true"]');
      expect(separators.length).toBeGreaterThan(0);
    });
  });
});
