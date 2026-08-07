import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Footer, FooterSection } from './Footer';

// A module factory must return a module object; returning the component
// directly makes vi.mock throw before any test runs.
vi.mock('next/link', () => ({
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

describe('Footer Component', () => {
  const mockSections: FooterSection[] = [
    {
      title: 'Product',
      links: [
        { label: 'Features', href: '/features' },
        { label: 'Pricing', href: '/pricing' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About', href: '/about' },
        { label: 'Blog', href: '/blog' },
      ],
    },
  ];

  describe('Rendering', () => {
    it('renders footer element', () => {
      const { container } = render(<Footer />);
      expect(container.querySelector('footer')).toBeInTheDocument();
    });

    it('renders copyright text by default', () => {
      render(<Footer />);
      expect(
        screen.getByText('© 2026 Oakami. All rights reserved.')
      ).toBeInTheDocument();
    });

    it('renders custom copyright text', () => {
      render(<Footer copyright="© 2024 My Company" />);
      expect(screen.getByText('© 2024 My Company')).toBeInTheDocument();
    });

    it('renders sections', () => {
      render(<Footer sections={mockSections} />);
      expect(screen.getByText('Product')).toBeInTheDocument();
      expect(screen.getByText('Company')).toBeInTheDocument();
    });

    it('renders section links', () => {
      render(<Footer sections={mockSections} />);
      expect(screen.getByText('Features')).toBeInTheDocument();
      expect(screen.getByText('Pricing')).toBeInTheDocument();
      expect(screen.getByText('About')).toBeInTheDocument();
      expect(screen.getByText('Blog')).toBeInTheDocument();
    });

    it('renders social links', () => {
      const socialLinks = [
        {
          icon: <span>FB</span>,
          href: 'https://facebook.com',
          label: 'Facebook',
        },
        {
          icon: <span>TW</span>,
          href: 'https://twitter.com',
          label: 'Twitter',
        },
      ];
      render(<Footer socialLinks={socialLinks} />);
      expect(screen.getByLabelText('Facebook')).toBeInTheDocument();
      expect(screen.getByLabelText('Twitter')).toBeInTheDocument();
    });

    it('renders without sections', () => {
      render(<Footer />);
      expect(screen.getByText(/© 2026 Oakami/)).toBeInTheDocument();
    });

    it('renders without social links', () => {
      render(<Footer sections={mockSections} />);
      expect(screen.getByText('Product')).toBeInTheDocument();
    });
  });

  describe('Section Links', () => {
    it('renders links as anchor elements', () => {
      render(<Footer sections={mockSections} />);
      const links = screen.getAllByRole('link');
      expect(links.length).toBeGreaterThanOrEqual(4);
    });

    it('links have correct href attributes', () => {
      render(<Footer sections={mockSections} />);
      const featuresLink = screen.getByText('Features').closest('a');
      expect(featuresLink).toHaveAttribute('href', '/features');
    });

    it('section titles are properly labeled', () => {
      render(<Footer sections={mockSections} />);
      expect(screen.getByText('Product')).toBeInTheDocument();
      expect(screen.getByText('Company')).toBeInTheDocument();
    });
  });

  describe('Social Links', () => {
    const socialLinks = [
      {
        icon: <span>FB</span>,
        href: 'https://facebook.com',
        label: 'Facebook',
      },
      {
        icon: <span>TW</span>,
        href: 'https://twitter.com',
        label: 'Twitter',
      },
    ];

    it('renders social link buttons', () => {
      render(<Footer socialLinks={socialLinks} />);
      expect(screen.getByLabelText('Facebook')).toBeInTheDocument();
    });

    it('social links have correct hrefs', () => {
      render(<Footer socialLinks={socialLinks} />);
      const fbLink = screen.getByLabelText('Facebook');
      expect(fbLink).toHaveAttribute('href', 'https://facebook.com');
    });

    it('social links have aria-labels', () => {
      render(<Footer socialLinks={socialLinks} />);
      expect(screen.getByLabelText('Facebook')).toBeInTheDocument();
      expect(screen.getByLabelText('Twitter')).toBeInTheDocument();
    });

    it('social links contain icons', () => {
      render(<Footer socialLinks={socialLinks} />);
      expect(screen.getByText('FB')).toBeInTheDocument();
      expect(screen.getByText('TW')).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    it('renders minimal variant', () => {
      const { container } = render(
        <Footer sections={mockSections} variant="minimal" />
      );
      const footer = container.querySelector('footer');
      expect(footer).toHaveClass('bg-gray-50');
    });

    it('renders standard variant by default', () => {
      const { container } = render(<Footer sections={mockSections} />);
      const footer = container.querySelector('footer');
      expect(footer).toHaveClass('bg-gray-50');
    });

    it('renders expanded variant', () => {
      const { container } = render(
        <Footer sections={mockSections} variant="expanded" />
      );
      const footer = container.querySelector('footer');
      expect(footer).toHaveClass('bg-white');
    });
  });

  describe('Layout & Responsive', () => {
    it('has max-width container', () => {
      const { container } = render(<Footer sections={mockSections} />);
      const maxWidth = container.querySelector('.max-w-7xl');
      expect(maxWidth).toBeInTheDocument();
    });

    it('sections grid is responsive', () => {
      const { container } = render(<Footer sections={mockSections} />);
      const grid = container.querySelector('.grid');
      expect(grid).toHaveClass('grid-cols-2');
      expect(grid).toHaveClass('md:grid-cols-3');
      expect(grid).toHaveClass('lg:grid-cols-5');
    });

    it('bottom section is flex layout', () => {
      const { container } = render(
        <Footer sections={mockSections} socialLinks={[]} />
      );
      const bottomSection = container.querySelector('.flex');
      expect(bottomSection).toHaveClass('flex-col');
      expect(bottomSection).toHaveClass('md:flex-row');
    });

    it('has appropriate padding', () => {
      const { container } = render(<Footer />);
      const footer = container.querySelector('footer');
      expect(footer).toHaveClass('px-4');
      expect(footer).toHaveClass('py-12');
      expect(footer).toHaveClass('md:px-8');
      expect(footer).toHaveClass('md:py-16');
    });
  });

  describe('Styling', () => {
    it('has top border', () => {
      const { container } = render(<Footer />);
      const footer = container.querySelector('footer');
      expect(footer).toHaveClass('border-t');
    });

    it('has dark mode support', () => {
      const { container } = render(<Footer />);
      const footer = container.querySelector('footer');
      expect(footer).toHaveClass('dark:bg-gray-800');
      expect(footer).toHaveClass('dark:border-gray-800');
    });

    it('applies custom className', () => {
      const { container } = render(
        <Footer className="custom-class" />
      );
      const footer = container.querySelector('footer');
      expect(footer).toHaveClass('custom-class');
    });

    it('section titles are bold', () => {
      render(<Footer sections={mockSections} />);
      const title = screen.getByText('Product');
      expect(title).toHaveClass('font-bold');
    });

    it('links have hover styling', () => {
      render(<Footer sections={mockSections} />);
      const link = screen.getByText('Features').closest('a');
      expect(link).toHaveClass('hover:text-gray-900');
    });
  });

  describe('Accessibility', () => {
    it('is semantic footer element', () => {
      const { container } = render(<Footer />);
      expect(container.querySelector('footer')).toBeInTheDocument();
    });

    it('links have focus visible outline', () => {
      render(<Footer sections={mockSections} />);
      const link = screen.getByText('Features').closest('a');
      expect(link).toHaveClass('focus-visible:outline-sky-500');
    });

    it('social links have aria-labels', () => {
      const socialLinks = [
        {
          icon: <span>FB</span>,
          href: 'https://facebook.com',
          label: 'Facebook',
        },
      ];
      render(<Footer socialLinks={socialLinks} />);
      expect(screen.getByLabelText('Facebook')).toBeInTheDocument();
    });

    it('section links are semantic link elements', () => {
      render(<Footer sections={mockSections} />);
      const links = screen.getAllByRole('link');
      expect(links.length).toBeGreaterThanOrEqual(4);
    });

    it('copyright text has appropriate size', () => {
      render(<Footer />);
      const copyright = screen.getByText(/© 2026 Oakami/);
      expect(copyright).toHaveClass('text-xs');
      expect(copyright).toHaveClass('md:text-sm');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty sections array', () => {
      render(<Footer sections={[]} />);
      expect(
        screen.getByText('© 2026 Oakami. All rights reserved.')
      ).toBeInTheDocument();
    });

    it('handles single section', () => {
      const singleSection: FooterSection[] = [
        {
          title: 'Legal',
          links: [{ label: 'Privacy', href: '/privacy' }],
        },
      ];
      render(<Footer sections={singleSection} />);
      expect(screen.getByText('Legal')).toBeInTheDocument();
      expect(screen.getByText('Privacy')).toBeInTheDocument();
    });

    it('handles many sections', () => {
      const manySections: FooterSection[] = Array.from({ length: 10 }, (_, i) => ({
        title: `Section ${i + 1}`,
        links: [{ label: `Link ${i + 1}`, href: `/link${i + 1}` }],
      }));
      render(<Footer sections={manySections} />);
      expect(screen.getByText('Section 1')).toBeInTheDocument();
      expect(screen.getByText('Section 10')).toBeInTheDocument();
    });

    it('handles very long copyright text', () => {
      render(
        <Footer copyright="Copyright 2024-2026 My Organization. All rights reserved. Please refer to our terms of service." />
      );
      expect(
        screen.getByText(
          /Copyright 2024-2026 My Organization. All rights reserved. Please refer to our terms of service./
        )
      ).toBeInTheDocument();
    });

    it('handles no copyright text', () => {
      render(<Footer copyright="" />);
      const footer = screen.getByRole('contentinfo', { hidden: true }) ||
        document.querySelector('footer');
      expect(footer).toBeInTheDocument();
    });

    it('handles many social links', () => {
      const manySocialLinks = Array.from({ length: 6 }, (_, i) => ({
        icon: <span>Icon{i + 1}</span>,
        href: `/social${i + 1}`,
        label: `Social ${i + 1}`,
      }));
      render(<Footer socialLinks={manySocialLinks} />);
      expect(screen.getByLabelText('Social 1')).toBeInTheDocument();
      expect(screen.getByLabelText('Social 6')).toBeInTheDocument();
    });
  });

  describe('Separator Line', () => {
    it('displays border between sections and copyright', () => {
      const { container } = render(<Footer sections={mockSections} />);
      const separator = container.querySelector('.border-t');
      expect(separator).toBeInTheDocument();
    });

    it('does not display separator when no sections', () => {
      const { container } = render(<Footer sections={[]} />);
      const separators = container.querySelectorAll('.border-t');
      expect(separators.length).toBe(1); // Only outer border
    });
  });
});
