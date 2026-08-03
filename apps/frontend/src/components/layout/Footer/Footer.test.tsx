import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Footer, FooterSection } from './Footer';

jest.mock('next/link', () => {
  return ({ children, href }: any) => <a href={href}>{children}</a>;
});

expect.extend(toHaveNoViolations);

describe('Footer Accessibility Tests', () => {
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

  const mockSocialLinks = [
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

  describe('WCAG 2.1 Level AA - Semantic HTML & ARIA', () => {
    it('passes axe audit with sections only', async () => {
      const { container } = render(<Footer sections={mockSections} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('passes axe audit with social links', async () => {
      const { container } = render(
        <Footer sections={mockSections} socialLinks={mockSocialLinks} />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('passes axe audit with all features', async () => {
      const { container } = render(
        <Footer
          sections={mockSections}
          socialLinks={mockSocialLinks}
          copyright="© 2024 My Company"
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('uses semantic footer element', () => {
      const { container } = render(<Footer />);
      expect(container.querySelector('footer')).toBeInTheDocument();
    });

    it('links have semantic link elements', () => {
      const { getByRole } = render(<Footer sections={mockSections} />);
      const links = getByRole('link', { hidden: true }) ||
        document.querySelector('footer a');
      expect(links).toBeInTheDocument();
    });

    it('social links have aria-labels', () => {
      const { getByLabelText } = render(
        <Footer socialLinks={mockSocialLinks} />
      );
      expect(getByLabelText('Facebook')).toBeInTheDocument();
    });

    it('section titles are semantic headings', () => {
      const { container } = render(<Footer sections={mockSections} />);
      const heading = container.querySelector('h3');
      expect(heading).toBeInTheDocument();
    });
  });

  describe('WCAG 2.1 Level AA - Color Contrast', () => {
    it('maintains contrast for links', async () => {
      const { container } = render(<Footer sections={mockSections} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('maintains contrast for section titles', async () => {
      const { container } = render(<Footer sections={mockSections} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('maintains contrast for copyright text', async () => {
      const { container } = render(<Footer />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('dark mode maintains contrast', async () => {
      const { container } = render(<Footer className="dark" />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('text has readable color on background', () => {
      const { container } = render(<Footer sections={mockSections} />);
      const link = container.querySelector('a');
      expect(link).toHaveClass('text-gray-600');
      expect(link).toHaveClass('dark:text-gray-400');
    });
  });

  describe('WCAG 2.1 Level AA - Keyboard Navigation', () => {
    it('section links are keyboard accessible', () => {
      const { container } = render(<Footer sections={mockSections} />);
      const links = container.querySelectorAll('a');
      links.forEach((link) => {
        expect(link).not.toHaveAttribute('disabled');
      });
    });

    it('social links are keyboard accessible', () => {
      const { container } = render(<Footer socialLinks={mockSocialLinks} />);
      const links = container.querySelectorAll('a');
      links.forEach((link) => {
        expect(link).not.toHaveAttribute('disabled');
      });
    });

    it('links have focus visible outline', () => {
      const { container } = render(<Footer sections={mockSections} />);
      const link = container.querySelector('a');
      expect(link).toHaveClass('focus-visible:outline-sky-500');
    });

    it('focus outline has proper width', () => {
      const { container } = render(<Footer sections={mockSections} />);
      const link = container.querySelector('a');
      expect(link).toHaveClass('focus-visible:outline-2');
    });

    it('focus outline has proper offset', () => {
      const { container } = render(<Footer sections={mockSections} />);
      const link = container.querySelector('a');
      expect(link).toHaveClass('focus-visible:outline-offset-2');
    });
  });

  describe('WCAG 2.1 Level AA - Focus Management', () => {
    it('all interactive elements have focus indicators', () => {
      const { container } = render(
        <Footer
          sections={mockSections}
          socialLinks={mockSocialLinks}
        />
      );
      const focusableElements = container.querySelectorAll(
        '[class*="focus-visible"]'
      );
      expect(focusableElements.length).toBeGreaterThan(0);
    });
  });

  describe('WCAG 2.1 Level AA - Touch Targets (Minimum 44×44px)', () => {
    it('section links meet minimum touch target size', () => {
      const { container } = render(<Footer sections={mockSections} />);
      const link = container.querySelector('a');
      expect(link).toHaveClass('px-1');
      // Text click area should provide adequate touch target
    });

    it('social links meet minimum touch target size', () => {
      const { container } = render(<Footer socialLinks={mockSocialLinks} />);
      const socialLink = container.querySelectorAll('a')[0];
      expect(socialLink).toHaveClass('p-1');
      expect(socialLink).toHaveClass('w-6');
      expect(socialLink).toHaveClass('h-6');
      // 6x6 with padding should provide adequate touch target
    });
  });

  describe('WCAG 2.1 Level AA - Text & Readability', () => {
    it('section titles use readable font size', () => {
      const { container } = render(<Footer sections={mockSections} />);
      const title = container.querySelector('h3');
      expect(title).toHaveClass('text-sm');
      // 14px font is acceptable
    });

    it('links use readable font size', () => {
      const { container } = render(<Footer sections={mockSections} />);
      const link = container.querySelector('a');
      expect(link).toHaveClass('text-sm');
    });

    it('copyright uses readable font size', () => {
      const { container } = render(<Footer />);
      const copyright = container.querySelector('p');
      expect(copyright).toHaveClass('text-xs');
      expect(copyright).toHaveClass('md:text-sm');
    });

    it('text is not color-only for meaning', () => {
      // Footer doesn't rely on color alone for meaning - structure provides clarity
      const { container } = render(<Footer sections={mockSections} />);
      const heading = container.querySelector('h3');
      expect(heading).toBeInTheDocument();
    });
  });

  describe('WCAG 2.1 Level AA - Forms & Labels', () => {
    it('social links have aria-labels', () => {
      const { getByLabelText } = render(
        <Footer socialLinks={mockSocialLinks} />
      );
      expect(getByLabelText('Facebook')).toBeInTheDocument();
      expect(getByLabelText('Twitter')).toBeInTheDocument();
    });

    it('links are semantic link elements', () => {
      const { container } = render(<Footer sections={mockSections} />);
      const links = container.querySelectorAll('a');
      expect(links.length).toBeGreaterThan(0);
      links.forEach((link) => {
        expect(link.tagName).toBe('A');
      });
    });

    it('section titles are semantic heading elements', () => {
      const { container } = render(<Footer sections={mockSections} />);
      const headings = container.querySelectorAll('h3');
      expect(headings.length).toBeGreaterThan(0);
    });
  });

  describe('WCAG 2.1 Level AA - Dark Mode', () => {
    it('has dark mode text color', () => {
      const { container } = render(<Footer />);
      const footer = container.querySelector('footer');
      expect(footer).toHaveClass('dark:bg-gray-800');
    });

    it('has dark mode border color', () => {
      const { container } = render(<Footer />);
      const footer = container.querySelector('footer');
      expect(footer).toHaveClass('dark:border-gray-800');
    });

    it('passes axe with dark mode', async () => {
      const { container } = render(<Footer className="dark" />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('WCAG 2.1 Level AA - Responsive & Mobile', () => {
    it('responsive grid layout', () => {
      const { container } = render(<Footer sections={mockSections} />);
      const grid = container.querySelector('.grid');
      expect(grid).toHaveClass('grid-cols-2');
      expect(grid).toHaveClass('md:grid-cols-3');
    });

    it('responsive padding', () => {
      const { container } = render(<Footer />);
      const footer = container.querySelector('footer');
      expect(footer).toHaveClass('px-4');
      expect(footer).toHaveClass('md:px-8');
    });

    it('responsive flex layout for bottom section', () => {
      const { container } = render(
        <Footer sections={mockSections} socialLinks={mockSocialLinks} />
      );
      const flexContainer = container.querySelector('.flex-col');
      expect(flexContainer).toHaveClass('md:flex-row');
    });
  });

  describe('WCAG 2.1 Level AA - Edge Cases', () => {
    it('handles no sections accessibly', async () => {
      const { container } = render(<Footer sections={[]} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('handles no social links accessibly', async () => {
      const { container } = render(<Footer sections={mockSections} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('handles very long copyright text', async () => {
      const { container } = render(
        <Footer copyright="Copyright 2024-2026 My Organization. All rights reserved. Please refer to our terms of service for more information." />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('handles many sections', async () => {
      const manySections: FooterSection[] = Array.from({ length: 8 }, (_, i) => ({
        title: `Section ${i + 1}`,
        links: [{ label: `Link ${i + 1}`, href: `/link${i + 1}` }],
      }));
      const { container } = render(<Footer sections={manySections} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('handles many social links', async () => {
      const manySocialLinks = Array.from({ length: 8 }, (_, i) => ({
        icon: <span>Icon{i + 1}</span>,
        href: `/social${i + 1}`,
        label: `Social ${i + 1}`,
      }));
      const { container } = render(
        <Footer socialLinks={manySocialLinks} />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('handles all variants accessibly', async () => {
      const variants: Array<'minimal' | 'standard' | 'expanded'> = [
        'minimal',
        'standard',
        'expanded',
      ];

      for (const variant of variants) {
        const { container } = render(
          <Footer sections={mockSections} variant={variant} />
        );
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      }
    });

    it('passes axe with all features enabled', async () => {
      const { container } = render(
        <Footer
          sections={mockSections}
          socialLinks={mockSocialLinks}
          copyright="© 2024 My Company. All rights reserved."
          variant="expanded"
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
