import React from 'react';
import { render, screen } from '@testing-library/react';
import { Loading } from './Loading';

describe('Loading Component', () => {
  describe('Rendering', () => {
    it('should render with default props', () => {
      const { container } = render(<Loading />);
      expect(container.querySelector('div[role="status"]')).toBeInTheDocument();
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<Loading ref={ref} />);
      expect(ref.current).toBeTruthy();
      expect(ref.current?.tagName).toBe('DIV');
    });

    it('should render with custom className', () => {
      const { container } = render(<Loading className="custom-class" />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain('custom-class');
    });

    it('should render with custom id attribute', () => {
      const { container } = render(<Loading id="custom-id" />);
      const wrapper = container.querySelector('div[role="status"]');
      expect(wrapper?.parentElement?.id).toBe('custom-id');
    });
  });

  describe('Variants', () => {
    it('should render spinner variant by default', () => {
      const { container } = render(<Loading />);
      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('should render spinner variant', () => {
      const { container } = render(<Loading variant="spinner" />);
      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
      expect(spinner?.className).toContain('border-2');
      expect(spinner?.className).toContain('border-t-sky-500');
    });

    it('should render skeleton variant', () => {
      const { container } = render(<Loading variant="skeleton" />);
      const skeleton = container.querySelector('.animate-pulse');
      expect(skeleton).toBeInTheDocument();
      expect(skeleton?.className).toContain('bg-gray-200');
      expect(skeleton?.className).toContain('rounded-lg');
    });

    it('should render dots variant', () => {
      const { container } = render(<Loading variant="dots" />);
      const dots = container.querySelectorAll('.animate-bounce');
      expect(dots.length).toBe(3);
    });

    it('should have different colors for dots variant', () => {
      const { container } = render(<Loading variant="dots" />);
      const dots = container.querySelectorAll('.animate-bounce');
      dots.forEach((dot) => {
        expect(dot.className).toContain('bg-sky-500');
      });
    });
  });

  describe('Sizes', () => {
    it('should render small size', () => {
      const { container } = render(<Loading size="sm" />);
      const spinner = container.querySelector('.animate-spin');
      expect(spinner?.getAttribute('style')).toContain('width: 24px');
      expect(spinner?.getAttribute('style')).toContain('height: 24px');
    });

    it('should render medium size (default)', () => {
      const { container } = render(<Loading size="md" />);
      const spinner = container.querySelector('.animate-spin');
      expect(spinner?.getAttribute('style')).toContain('width: 40px');
      expect(spinner?.getAttribute('style')).toContain('height: 40px');
    });

    it('should render large size', () => {
      const { container } = render(<Loading size="lg" />);
      const spinner = container.querySelector('.animate-spin');
      expect(spinner?.getAttribute('style')).toContain('width: 64px');
      expect(spinner?.getAttribute('style')).toContain('height: 64px');
    });

    it('should render dots with different sizes', () => {
      const sizes = ['sm', 'md', 'lg'] as const;
      const expectedSizes = ['8px', '12px', '16px'];

      sizes.forEach((size, idx) => {
        const { container } = render(<Loading variant="dots" size={size} />);
        const dots = container.querySelectorAll('.animate-bounce');
        expect(dots[0]?.getAttribute('style')).toContain(`width: ${expectedSizes[idx]}`);
      });
    });
  });

  describe('Label', () => {
    it('should render with label', () => {
      render(<Loading label="Loading data..." />);
      expect(screen.getByText('Loading data...')).toBeInTheDocument();
    });

    it('should not render label when not provided', () => {
      const { container } = render(<Loading />);
      const label = container.querySelector('p');
      expect(label).not.toBeInTheDocument();
    });

    it('should style label appropriately', () => {
      const { container } = render(<Loading label="Loading..." />);
      const label = container.querySelector('p');
      expect(label?.className).toContain('text-sm');
      expect(label?.className).toContain('text-gray-600');
    });

    it('should have dark mode style on label', () => {
      const { container } = render(<Loading label="Loading..." />);
      const label = container.querySelector('p');
      expect(label?.className).toContain('dark:text-gray-400');
    });
  });

  describe('Display Modes', () => {
    it('should render as inline by default', () => {
      const { container } = render(<Loading />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain('w-full');
    });

    it('should render as full screen when fullScreen is true', () => {
      const { container } = render(<Loading fullScreen />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain('fixed');
      expect(wrapper.className).toContain('inset-0');
      expect(wrapper.className).toContain('z-50');
    });

    it('should render with overlay background when overlay is true', () => {
      const { container } = render(<Loading overlay />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain('relative');
    });

    it('should render fullscreen with overlay background', () => {
      const { container } = render(<Loading fullScreen overlay />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain('fixed');
      expect(wrapper.className).toContain('bg-black/50');
    });

    it('should render fullscreen with light background when no overlay', () => {
      const { container } = render(<Loading fullScreen overlay={false} />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain('bg-white');
    });
  });

  describe('Accessibility Attributes', () => {
    it('should have role="status"', () => {
      const { container } = render(<Loading />);
      expect(container.querySelector('div[role="status"]')).toBeInTheDocument();
    });

    it('should have aria-busy="true"', () => {
      const { container } = render(<Loading />);
      const status = container.querySelector('div[role="status"]');
      expect(status?.getAttribute('aria-busy')).toBe('true');
    });

    it('should have aria-label with default text', () => {
      const { container } = render(<Loading />);
      const status = container.querySelector('div[role="status"]');
      expect(status?.getAttribute('aria-label')).toBe('Loading');
    });

    it('should have aria-label including label text', () => {
      const { container } = render(<Loading label="data" />);
      const status = container.querySelector('div[role="status"]');
      expect(status?.getAttribute('aria-label')).toBe('Loading: data');
    });

    it('should hide decorative spinner from screen readers', () => {
      const { container } = render(<Loading />);
      const spinner = container.querySelector('.animate-spin');
      expect(spinner?.getAttribute('aria-hidden')).toBe('true');
    });

    it('should hide skeleton from screen readers', () => {
      const { container } = render(<Loading variant="skeleton" />);
      const skeleton = container.querySelector('.animate-pulse');
      expect(skeleton?.getAttribute('aria-hidden')).toBe('true');
    });

    it('should hide dots from screen readers', () => {
      const { container } = render(<Loading variant="dots" />);
      const dots = container.querySelector('[aria-hidden="true"]');
      expect(dots).toBeInTheDocument();
    });
  });

  describe('Dark Mode Support', () => {
    it('should have dark mode classes on spinner', () => {
      const { container } = render(<Loading />);
      const spinner = container.querySelector('.animate-spin');
      expect(spinner?.className).toContain('dark:border-gray-700');
      expect(spinner?.className).toContain('dark:border-t-sky-400');
    });

    it('should have dark mode classes on skeleton', () => {
      const { container } = render(<Loading variant="skeleton" />);
      const skeleton = container.querySelector('.animate-pulse');
      expect(skeleton?.className).toContain('dark:bg-gray-700');
    });

    it('should have dark mode classes on dots', () => {
      const { container } = render(<Loading variant="dots" />);
      const dots = container.querySelector('.animate-bounce');
      expect(dots?.className).toContain('dark:bg-sky-400');
    });

    it('should have dark mode on fullscreen background', () => {
      const { container } = render(<Loading fullScreen />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain('dark:bg-gray-900');
    });

    it('should have dark mode on fullscreen overlay', () => {
      const { container } = render(<Loading fullScreen overlay />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain('dark:bg-black/70');
    });
  });

  describe('Animation Properties', () => {
    it('should have staggered animation delays for dots', () => {
      const { container } = render(<Loading variant="dots" />);
      const dots = container.querySelectorAll('.animate-bounce');

      dots.forEach((dot, index) => {
        const style = dot.getAttribute('style');
        expect(style).toContain(`animation-delay: ${index * 0.1}s`);
      });
    });

    it('should use spin animation for spinner', () => {
      const { container } = render(<Loading variant="spinner" />);
      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('should use pulse animation for skeleton', () => {
      const { container } = render(<Loading variant="skeleton" />);
      const skeleton = container.querySelector('.animate-pulse');
      expect(skeleton).toBeInTheDocument();
    });

    it('should use bounce animation for dots', () => {
      const { container } = render(<Loading variant="dots" />);
      const dots = container.querySelectorAll('.animate-bounce');
      expect(dots.length).toBe(3);
    });
  });

  describe('Z-Index Management', () => {
    it('should have z-50 on fullscreen loading', () => {
      const { container } = render(<Loading fullScreen />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain('z-50');
    });

    it('should render without z-index when not fullscreen', () => {
      const { container } = render(<Loading />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).not.toContain('z-');
    });
  });

  describe('Layout Variations', () => {
    it('should render centered content', () => {
      const { container } = render(<Loading />);
      const content = container.querySelector('[role="status"]');
      expect(content?.className).toContain('flex');
      expect(content?.className).toContain('flex-col');
      expect(content?.className).toContain('items-center');
      expect(content?.className).toContain('justify-center');
    });

    it('should render gap between elements', () => {
      const { container } = render(<Loading label="Loading..." />);
      const content = container.querySelector('[role="status"]');
      expect(content?.className).toContain('gap-3');
    });

    it('should render with full height when fullscreen', () => {
      const { container } = render(<Loading fullScreen />);
      const content = container.querySelector('[role="status"]');
      expect(content?.className).toContain('h-screen');
    });
  });

  describe('Combinations', () => {
    it('should render spinner with label', () => {
      render(<Loading variant="spinner" label="Loading users..." size="md" />);
      expect(screen.getByText('Loading users...')).toBeInTheDocument();
    });

    it('should render dots fullscreen', () => {
      const { container } = render(<Loading variant="dots" fullScreen />);
      expect(container.querySelector('div[role="status"]')).toBeInTheDocument();
      expect(container.querySelector('.fixed')).toBeInTheDocument();
    });

    it('should render skeleton overlay with label', () => {
      render(<Loading variant="skeleton" overlay label="Loading data..." />);
      expect(screen.getByText('Loading data...')).toBeInTheDocument();
    });
  });
});
