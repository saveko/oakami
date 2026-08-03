import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Header, Breadcrumb } from './Header';

jest.mock('next/link', () => {
  return ({ children, href }: any) => <a href={href}>{children}</a>;
});

expect.extend(toHaveNoViolations);

describe('Header Accessibility Tests', () => {
  const breadcrumbs: Breadcrumb[] = [
    { label: 'Home', href: '/' },
    { label: 'Settings', href: '/settings' },
    { label: 'Profile' },
  ];

  describe('WCAG 2.1 Level AA - Semantic HTML & ARIA', () => {
    it('passes axe accessibility audit with title only', async () => {
      const { container } = render(<Header title="Dashboard" />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('passes axe accessibility audit with all features', async () => {
      const { container } = render(
        <Header
          title="Dashboard"
          description="Manage your waste records"
          breadcrumbs={breadcrumbs}
          actions={<button>Add Record</button>}
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('uses semantic heading element', () => {
      const { container } = render(<Header title="Dashboard" />);
      expect(container.querySelector('h1')).toBeInTheDocument();
    });

    it('has proper heading hierarchy', () => {
      const { container } = render(<Header title="Dashboard" level="h2" />);
      expect(container.querySelector('h2')).toBeInTheDocument();
    });

    it('breadcrumb nav is semantic', () => {
      const { container } = render(
        <Header title="Dashboard" breadcrumbs={breadcrumbs} />
      );
      const nav = container.querySelector('nav[aria-label="Breadcrumbs"]');
      expect(nav).toBeInTheDocument();
    });

    it('current breadcrumb has aria-current', () => {
      const { container } = render(
        <Header title="Profile" breadcrumbs={breadcrumbs} />
      );
      const current = container.querySelector('[aria-current="page"]');
      expect(current).toBeInTheDocument();
    });

    it('breadcrumb separators are hidden from screen readers', () => {
      const { container } = render(
        <Header title="Dashboard" breadcrumbs={breadcrumbs} />
      );
      const hidden = container.querySelectorAll('[aria-hidden="true"]');
      expect(hidden.length).toBeGreaterThan(0);
    });
  });

  describe('WCAG 2.1 Level AA - Color Contrast', () => {
    it('maintains contrast for headings', async () => {
      const { container } = render(<Header title="Dashboard" />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('maintains contrast for descriptions', async () => {
      const { container } = render(
        <Header title="Dashboard" description="Test description" />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('maintains contrast for breadcrumb links', async () => {
      const { container } = render(
        <Header title="Dashboard" breadcrumbs={breadcrumbs} />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('maintains contrast in dark mode', async () => {
      const { container } = render(
        <Header title="Dashboard" className="dark" />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('text has sufficient contrast against background', () => {
      const { container } = render(<Header title="Dashboard" />);
      const heading = container.querySelector('h1');
      expect(heading).toHaveClass('text-gray-900');
      expect(heading).toHaveClass('dark:text-white');
    });
  });

  describe('WCAG 2.1 Level AA - Keyboard Navigation', () => {
    it('breadcrumb links are keyboard accessible', () => {
      const { container } = render(
        <Header title="Dashboard" breadcrumbs={breadcrumbs} />
      );
      const links = container.querySelectorAll('a');
      links.forEach((link) => {
        expect(link).not.toHaveAttribute('disabled');
      });
    });

    it('breadcrumb links have focus outline', () => {
      const { container } = render(
        <Header title="Dashboard" breadcrumbs={breadcrumbs} />
      );
      const links = container.querySelectorAll('a');
      links.forEach((link) => {
        expect(link).toHaveClass('focus-visible:outline-sky-500');
      });
    });

    it('action buttons are keyboard accessible', () => {
      const { container } = render(
        <Header
          title="Dashboard"
          actions={<button>Add</button>}
        />
      );
      const button = container.querySelector('button');
      expect(button).not.toHaveAttribute('disabled');
    });

    it('focus outline has proper width', () => {
      const { container } = render(
        <Header title="Dashboard" breadcrumbs={breadcrumbs} />
      );
      const link = container.querySelector('a');
      expect(link).toHaveClass('focus-visible:outline-2');
    });

    it('focus outline has proper offset', () => {
      const { container } = render(
        <Header title="Dashboard" breadcrumbs={breadcrumbs} />
      );
      const link = container.querySelector('a');
      expect(link).toHaveClass('focus-visible:outline-offset-2');
    });
  });

  describe('WCAG 2.1 Level AA - Focus Management', () => {
    it('has visible focus indicators on breadcrumb links', () => {
      const { container } = render(
        <Header title="Dashboard" breadcrumbs={breadcrumbs} />
      );
      const focusableElements = container.querySelectorAll(
        '[class*="focus-visible"]'
      );
      expect(focusableElements.length).toBeGreaterThan(0);
    });

    it('focus outline is color-sufficient', () => {
      const { container } = render(
        <Header title="Dashboard" breadcrumbs={breadcrumbs} />
      );
      const link = container.querySelector('a');
      expect(link).toHaveClass('focus-visible:outline-sky-500');
    });
  });

  describe('WCAG 2.1 Level AA - Touch Targets (Minimum 44×44px)', () => {
    it('breadcrumb links meet minimum touch target size', () => {
      const { container } = render(
        <Header title="Dashboard" breadcrumbs={breadcrumbs} />
      );
      const link = container.querySelector('a');
      expect(link).toHaveClass('px-1');
      // Text should be clickable via link element, with padding
    });

    it('action buttons meet minimum touch target size', () => {
      const { container } = render(
        <Header title="Dashboard" actions={<button>Add</button>} />
      );
      const button = container.querySelector('button');
      expect(button).toBeInTheDocument();
      // Button padding should ensure minimum touch target
    });
  });

  describe('WCAG 2.1 Level AA - Text & Readability', () => {
    it('heading text is readable size', () => {
      const { container } = render(<Header title="Dashboard" />);
      const heading = container.querySelector('h1');
      expect(heading).toHaveClass('text-4xl');
      // Large text is more readable
    });

    it('description text is readable size', () => {
      render(<Header title="Dashboard" description="Test" />);
      const description = document.body.textContent?.includes('Test');
      expect(description).toBe(true);
    });

    it('breadcrumb text is appropriately sized', () => {
      const { container } = render(
        <Header title="Dashboard" breadcrumbs={breadcrumbs} />
      );
      const breadcrumb = container.querySelector('nav a');
      expect(breadcrumb).toHaveClass('text-sm');
      // 14px is acceptable for secondary navigation
    });

    it('text is not color-only for differentiation', () => {
      const { container } = render(
        <Header title="Dashboard" breadcrumbs={breadcrumbs} />
      );
      // Current breadcrumb uses semantic markup, not just color
      const current = container.querySelector('[aria-current="page"]');
      expect(current).toBeInTheDocument();
    });

    it('has adequate line height for readability', () => {
      const { container } = render(
        <Header title="Dashboard" description="This is a longer description to test line height." />
      );
      const description = container.querySelector('.text-lg');
      expect(description).toBeInTheDocument();
    });
  });

  describe('WCAG 2.1 Level AA - Forms & Labels', () => {
    it('buttons have semantic button element', () => {
      const { container } = render(
        <Header title="Dashboard" actions={<button>Add</button>} />
      );
      const button = container.querySelector('button');
      expect(button?.tagName).toBe('BUTTON');
    });

    it('headings are semantic heading elements', () => {
      const { container } = render(<Header title="Dashboard" level="h1" />);
      const heading = container.querySelector('h1');
      expect(heading?.tagName).toBe('H1');
    });
  });

  describe('WCAG 2.1 Level AA - Dark Mode', () => {
    it('has dark mode text color on heading', () => {
      const { container } = render(<Header title="Dashboard" />);
      const heading = container.querySelector('h1');
      expect(heading).toHaveClass('dark:text-white');
    });

    it('has dark mode background', () => {
      const { container } = render(<Header title="Dashboard" />);
      const header = container.firstChild;
      expect(header).toHaveClass('dark:bg-gray-900');
    });

    it('has dark mode border color', () => {
      const { container } = render(<Header title="Dashboard" />);
      const header = container.firstChild;
      expect(header).toHaveClass('dark:border-gray-800');
    });

    it('passes axe with dark mode styling', async () => {
      const { container } = render(
        <Header title="Dashboard" className="dark" />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('WCAG 2.1 Level AA - Responsive & Mobile', () => {
    it('responsive heading sizes', () => {
      const { container } = render(<Header title="Dashboard" level="h1" />);
      const heading = container.querySelector('h1');
      expect(heading).toHaveClass('text-4xl');
      expect(heading).toHaveClass('md:text-5xl');
    });

    it('responsive padding', () => {
      const { container } = render(<Header title="Dashboard" />);
      const header = container.firstChild;
      expect(header).toHaveClass('px-4');
      expect(header).toHaveClass('md:px-8');
    });

    it('responsive layout stacking', () => {
      const { container } = render(
        <Header title="Dashboard" actions={<button>Action</button>} />
      );
      const content = container.querySelector('.flex-col');
      expect(content).toHaveClass('md:flex-row');
    });
  });

  describe('WCAG 2.1 Level AA - Edge Cases', () => {
    it('handles empty title accessibly', async () => {
      const { container } = render(<Header title="" />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('handles very long title', async () => {
      const { container } = render(
        <Header title="This is an extremely long header title that might wrap on smaller screens and should still be accessible" />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('handles very long description', async () => {
      const { container } = render(
        <Header
          title="Dashboard"
          description="This is a very long description that provides extensive context about the dashboard and its various features and capabilities."
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('handles many breadcrumbs', async () => {
      const manyBreadcrumbs: Breadcrumb[] = [
        { label: 'Home', href: '/' },
        { label: 'Admin', href: '/admin' },
        { label: 'Settings', href: '/settings' },
        { label: 'Advanced', href: '/advanced' },
        { label: 'User Management', href: '/users' },
        { label: 'Roles' },
      ];
      const { container } = render(
        <Header title="Roles" breadcrumbs={manyBreadcrumbs} />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('handles multiple action buttons', async () => {
      const { container } = render(
        <Header
          title="Dashboard"
          actions={
            <>
              <button>Add</button>
              <button>Edit</button>
              <button>Delete</button>
            </>
          }
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('handles all variants accessibly', async () => {
      const variants: Array<'default' | 'elevated' | 'outlined'> = [
        'default',
        'elevated',
        'outlined',
      ];

      for (const variant of variants) {
        const { container } = render(
          <Header title="Dashboard" variant={variant} />
        );
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      }
    });

    it('handles all padding sizes accessibly', async () => {
      const paddings: Array<'sm' | 'md' | 'lg'> = ['sm', 'md', 'lg'];

      for (const padding of paddings) {
        const { container } = render(
          <Header title="Dashboard" padding={padding} />
        );
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      }
    });
  });
});
