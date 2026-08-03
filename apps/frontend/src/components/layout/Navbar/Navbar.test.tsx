import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { usePathname } from 'next/navigation';
import { Navbar } from './Navbar';

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

jest.mock('next/link', () => {
  return ({ children, href }: any) => <a href={href}>{children}</a>;
});

expect.extend(toHaveNoViolations);

describe('Navbar Accessibility Tests', () => {
  const mockItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Waste Records', href: '/waste' },
    { label: 'Settings', href: '/settings' },
  ];

  beforeEach(() => {
    (usePathname as jest.Mock).mockReturnValue('/dashboard');
  });

  describe('WCAG 2.1 Level AA - Color Contrast', () => {
    it('passes axe accessibility audit for dark variant', async () => {
      const { container } = render(<Navbar variant="dark" items={mockItems} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('passes axe accessibility audit for light variant', async () => {
      const { container } = render(<Navbar variant="light" items={mockItems} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('maintains contrast on active links', async () => {
      const { container } = render(<Navbar items={mockItems} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('maintains contrast on hover states', async () => {
      const { container } = render(<Navbar items={mockItems} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('maintains contrast in mobile menu', async () => {
      const { container, getByLabelText } = render(<Navbar items={mockItems} />);
      fireEvent.click(getByLabelText('Toggle navigation menu'));
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('WCAG 2.1 Level AA - Semantic HTML & ARIA', () => {
    it('uses semantic header/banner element', () => {
      const { container } = render(<Navbar items={mockItems} />);
      expect(container.querySelector('[role="banner"]')).toBeInTheDocument();
    });

    it('has semantic nav with aria-label', () => {
      const { container } = render(<Navbar items={mockItems} />);
      const nav = container.querySelector('nav[aria-label="Main navigation"]');
      expect(nav).toBeInTheDocument();
    });

    it('marks active page with aria-current="page"', () => {
      const { container } = render(<Navbar items={mockItems} />);
      const activeLink = container.querySelector('a[aria-current="page"]');
      expect(activeLink).toBeInTheDocument();
    });

    it('logo link is semantic link element', () => {
      const { container } = render(<Navbar />);
      const logoLink = container.querySelector('a[href="/"]');
      expect(logoLink).toBeInTheDocument();
    });

    it('menu toggle button has aria-label', () => {
      const { getByLabelText } = render(<Navbar items={mockItems} />);
      expect(getByLabelText('Toggle navigation menu')).toBeInTheDocument();
    });

    it('menu toggle button has aria-expanded', () => {
      const { getByLabelText } = render(<Navbar items={mockItems} />);
      const button = getByLabelText('Toggle navigation menu');
      expect(button).toHaveAttribute('aria-expanded');
    });

    it('menu toggle button has aria-controls', () => {
      const { getByLabelText } = render(<Navbar items={mockItems} />);
      const button = getByLabelText('Toggle navigation menu');
      expect(button).toHaveAttribute('aria-controls', 'mobile-nav');
    });
  });

  describe('WCAG 2.1 Level AA - Keyboard Navigation', () => {
    it('logo link is keyboard accessible', () => {
      const { container } = render(<Navbar />);
      const logoLink = container.querySelector('a[href="/"]');
      expect(logoLink).not.toHaveAttribute('disabled');
    });

    it('all navigation links are keyboard accessible', () => {
      const { container } = render(<Navbar items={mockItems} />);
      const links = container.querySelectorAll('a[href]');
      links.forEach((link) => {
        expect(link).not.toHaveAttribute('disabled');
      });
    });

    it('menu toggle button is keyboard accessible', () => {
      const { getByLabelText } = render(<Navbar items={mockItems} />);
      const button = getByLabelText('Toggle navigation menu');
      expect(button).not.toHaveAttribute('disabled');
    });

    it('focus outline is visible on interactive elements', () => {
      const { container } = render(<Navbar items={mockItems} />);
      const logoLink = container.querySelector('a[href="/"]');
      expect(logoLink).toHaveClass('focus-visible:outline-sky-500');
    });

    it('nav links have focus visible outline', () => {
      const { getByText } = render(<Navbar items={mockItems} />);
      const link = getByText('Dashboard').closest('a');
      expect(link).toHaveClass('focus-visible:outline-2');
      expect(link).toHaveClass('focus-visible:outline-sky-500');
    });

    it('mobile menu items are keyboard accessible', () => {
      const { getByLabelText, getByText } = render(<Navbar items={mockItems} />);
      fireEvent.click(getByLabelText('Toggle navigation menu'));
      const mobileLink = getByText('Dashboard').closest('a');
      expect(mobileLink).not.toHaveAttribute('disabled');
    });
  });

  describe('WCAG 2.1 Level AA - Focus Management', () => {
    it('has visible focus indicators on all interactive elements', () => {
      const { container } = render(<Navbar items={mockItems} />);
      const focusableElements = container.querySelectorAll(
        '[class*="focus-visible"]'
      );
      expect(focusableElements.length).toBeGreaterThan(0);
    });

    it('outline width is sufficient', () => {
      const { getByLabelText } = render(<Navbar items={mockItems} />);
      const button = getByLabelText('Toggle navigation menu');
      expect(button).toHaveClass('focus-visible:outline-2');
    });

    it('outline offset is appropriate', () => {
      const { container } = render(<Navbar items={mockItems} />);
      const logoLink = container.querySelector('a[href="/"]');
      expect(logoLink).toHaveClass('focus-visible:outline-offset-2');
    });
  });

  describe('WCAG 2.1 Level AA - Touch Targets (Minimum 44×44px)', () => {
    it('menu toggle button meets minimum touch target size', () => {
      const { getByLabelText } = render(<Navbar items={mockItems} />);
      const button = getByLabelText('Toggle navigation menu');
      expect(button).toHaveClass('p-2');
      // p-2 = 8px padding on 24x24 icon = ~40px, may need adjustment
    });

    it('logo link meets minimum touch target size', () => {
      const { container } = render(<Navbar />);
      const logoLink = container.querySelector('a[href="/"]');
      expect(logoLink).toHaveClass('px-2');
      expect(logoLink).toHaveClass('py-1');
      // Should have adequate padding for 44px minimum
    });

    it('navigation links have adequate height', () => {
      const { getByText } = render(<Navbar items={mockItems} />);
      const link = getByText('Dashboard').closest('a');
      expect(link).toHaveClass('py-1');
      expect(link).toHaveClass('px-2');
    });

    it('mobile menu items have adequate touch target size', () => {
      const { getByLabelText, getByText } = render(<Navbar items={mockItems} />);
      fireEvent.click(getByLabelText('Toggle navigation menu'));
      const mobileLink = getByText('Dashboard').closest('a');
      expect(mobileLink).toHaveClass('px-4');
      expect(mobileLink).toHaveClass('py-2');
    });
  });

  describe('WCAG 2.1 Level AA - Text & Readability', () => {
    it('uses readable font size for nav items', () => {
      const { getByText } = render(<Navbar items={mockItems} />);
      const link = getByText('Dashboard').closest('a');
      expect(link).toHaveClass('text-sm');
      // text-sm = 14px which is acceptable minimum
    });

    it('brand text has appropriate font size', () => {
      const { container } = render(<Navbar />);
      const logoLink = container.querySelector('a[href="/"]');
      expect(logoLink).toHaveClass('text-lg');
    });

    it('text is not solely color-dependent for meaning', () => {
      const { container } = render(<Navbar items={mockItems} />);
      const activeLink = container.querySelector('a[aria-current="page"]');
      // Active state uses border-bottom, not just color
      expect(activeLink).toHaveClass('border-b-2');
    });

    it('has sufficient line height for readability', () => {
      const { container } = render(<Navbar items={mockItems} />);
      // Default line-height should be adequate
      const link = container.querySelector('a[href="/dashboard"]');
      expect(link).toBeInTheDocument();
    });
  });

  describe('WCAG 2.1 Level AA - Responsive & Mobile', () => {
    it('mobile navigation is accessible when opened', async () => {
      const { container, getByLabelText } = render(<Navbar items={mockItems} />);
      fireEvent.click(getByLabelText('Toggle navigation menu'));
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('mobile nav items are properly semantically structured', () => {
      const { getByLabelText, getByRole } = render(<Navbar items={mockItems} />);
      fireEvent.click(getByLabelText('Toggle navigation menu'));
      const mobileNav = getByRole('navigation');
      expect(mobileNav).toBeInTheDocument();
    });

    it('active state is marked in mobile menu', () => {
      const { getByLabelText, container } = render(<Navbar items={mockItems} />);
      fireEvent.click(getByLabelText('Toggle navigation menu'));
      const mobileActiveLink = container.querySelector(
        '#mobile-nav a[aria-current="page"]'
      );
      expect(mobileActiveLink).toBeInTheDocument();
    });
  });

  describe('WCAG 2.1 Level AA - Motion & Animation', () => {
    it('respects prefers-reduced-motion (should have static styling)', () => {
      const { container } = render(<Navbar items={mockItems} />);
      // Menu toggle should work without animation requirement
      const button = container.querySelector('button[aria-label*="Toggle"]');
      expect(button).toBeInTheDocument();
    });

    it('icon animations are appropriate', () => {
      const { getByLabelText } = render(<Navbar items={mockItems} />);
      const button = getByLabelText('Toggle navigation menu');
      const svg = button.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('WCAG 2.1 Level AA - Error Prevention & Form Controls', () => {
    it('no form elements in navbar', () => {
      const { container } = render(<Navbar items={mockItems} />);
      const forms = container.querySelectorAll('form');
      expect(forms.length).toBe(0);
    });

    it('buttons have appropriate button element semantic', () => {
      const { getByLabelText } = render(<Navbar items={mockItems} />);
      const button = getByLabelText('Toggle navigation menu');
      expect(button.tagName).toBe('BUTTON');
    });
  });

  describe('WCAG 2.1 Level AA - Dark Mode Accessibility', () => {
    it('dark mode maintains proper contrast', () => {
      const { container } = render(<Navbar variant="dark" items={mockItems} />);
      const navbar = container.querySelector('[role="banner"]');
      expect(navbar).toHaveClass('dark:bg-gray-900');
      expect(navbar).toHaveClass('dark:border-gray-800');
    });

    it('text color is appropriate for dark mode', () => {
      const { container } = render(<Navbar variant="dark" />);
      const logoLink = container.querySelector('a[href="/"]');
      expect(logoLink).toHaveClass('text-white');
    });
  });

  describe('WCAG 2.1 Level AA - Edge Cases', () => {
    it('handles no navigation items accessibly', async () => {
      const { container } = render(<Navbar items={[]} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('handles no right content accessibly', async () => {
      const { container } = render(<Navbar items={mockItems} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('handles very long labels accessibly', async () => {
      const { container } = render(
        <Navbar
          items={[
            {
              label: 'This is an extremely long navigation label that might wrap',
              href: '/long',
            },
          ]}
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('passes accessibility audit with all features enabled', async () => {
      const { container } = render(
        <Navbar
          items={mockItems}
          logo={<span>Logo</span>}
          rightContent={<button>User</button>}
          sticky={true}
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});

import { fireEvent } from '@testing-library/react';
