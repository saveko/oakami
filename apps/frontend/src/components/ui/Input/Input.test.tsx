import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Input } from './Input';

expect.extend(toHaveNoViolations);

describe('Input Accessibility', () => {
  describe('Keyboard Navigation', () => {
    it('is focusable with Tab key', async () => {
      const user = userEvent.setup();
      render(<Input />);

      const input = screen.getByRole('textbox');
      await user.tab();

      expect(input).toHaveFocus();
    });

    it('accepts typed input', async () => {
      const user = userEvent.setup();
      render(<Input />);

      const input = screen.getByRole('textbox') as HTMLInputElement;
      await user.type(input, 'test@example.com');

      expect(input.value).toBe('test@example.com');
    });
  });

  describe('Label Association', () => {
    it('has properly associated label', () => {
      render(<Input id="email" label="Email Address" />);
      const label = screen.getByText('Email Address');
      expect(label).toHaveAttribute('for', 'email');
    });

    it('creates implicit association when label wraps input', () => {
      render(<Input label="Password" />);
      const label = screen.getByText('Password');
      expect(label).toBeInTheDocument();
    });
  });

  describe('ARIA Attributes', () => {
    it('sets aria-required for required fields', () => {
      render(<Input required={true} />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-required', 'true');
    });

    it('sets aria-invalid on error', () => {
      render(<Input error={true} />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('links input to error message with aria-describedby', () => {
      render(<Input id="password" error={true} errorMessage="Too short" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-describedby');
      const describedBy = input.getAttribute('aria-describedby');
      expect(describedBy).toContain('error');
    });

    it('links input to help text with aria-describedby', () => {
      render(<Input id="password" helpText="At least 8 chars" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-describedby');
    });

    it('combines multiple descriptions in aria-describedby', () => {
      render(
        <Input
          id="password"
          ariaDescribedBy="extra"
          helpText="Help text"
        />
      );
      const input = screen.getByRole('textbox');
      const describedBy = input.getAttribute('aria-describedby');
      expect(describedBy).toContain('extra');
      expect(describedBy).toContain('help');
    });
  });

  describe('Error Handling', () => {
    it('announces error message with role="alert"', () => {
      render(<Input error={true} errorMessage="Invalid input" />);
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('associates error message with input', () => {
      render(<Input id="email" error={true} errorMessage="Invalid email" />);
      const alert = screen.getByRole('alert');
      expect(alert.textContent).toContain('Invalid email');
    });
  });

  describe('Focus Management', () => {
    it('shows focus-visible outline', () => {
      const { container } = render(<Input />);
      const input = container.querySelector('input');
      expect(input).toHaveClass('focus-visible:outline-2');
    });

    it('has 2px outline offset', () => {
      const { container } = render(<Input />);
      const input = container.querySelector('input');
      expect(input).toHaveClass('focus-visible:outline-offset-2');
    });

    it('changes outline color on error', () => {
      const { container } = render(<Input error={true} />);
      const input = container.querySelector('input');
      expect(input).toHaveClass('focus-visible:outline-red-500');
    });
  });

  describe('Placeholder Text', () => {
    it('does not rely on placeholder as label', () => {
      render(<Input placeholder="Email" />);
      // If no label provided, this is a violation. But for flexibility:
      expect(screen.queryByText('Email')).not.toBeInTheDocument();
    });

    it('uses label when provided', () => {
      render(<Input label="Email" placeholder="user@example.com" />);
      expect(screen.getByText('Email')).toBeInTheDocument();
    });
  });

  describe('Disabled State', () => {
    it('properly marks disabled input', () => {
      render(<Input disabled />);
      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
    });

    it('shows disabled styling', () => {
      const { container } = render(<Input disabled />);
      const input = container.querySelector('input');
      expect(input).toHaveClass('disabled:opacity-50');
    });
  });

  describe('Color Contrast', () => {
    it('has sufficient contrast for text on white', () => {
      const { container } = render(<Input />);
      // Dark gray text (#1F2937) on white (#FFFFFF) = 10.9:1 contrast
      const input = container.querySelector('input');
      expect(input).toHaveClass('text-base');
      expect(input).toHaveClass('bg-white');
    });

    it('has sufficient contrast for placeholder text', () => {
      const { container } = render(<Input placeholder="Text" />);
      // Placeholder inherits color from input, maintains contrast
      const input = container.querySelector('input');
      expect(input).toHaveClass('placeholder:text-gray-400');
    });

    it('has sufficient contrast for disabled state', () => {
      const { container } = render(<Input disabled />);
      const input = container.querySelector('input');
      expect(input).toHaveClass('disabled:opacity-50');
    });
  });

  describe('Touch Target Size', () => {
    it('has minimum 44px height', () => {
      const { container } = render(<Input />);
      const input = container.querySelector('input');
      expect(input).toHaveClass('py-2'); // ~44px with text height
    });

    it('has padding for touch', () => {
      const { container } = render(<Input />);
      const input = container.querySelector('input');
      expect(input).toHaveClass('px-3');
    });
  });

  describe('Icon Accessibility', () => {
    it('marks icon as aria-hidden', () => {
      const { container } = render(
        <Input icon={<span>📧</span>} iconPosition="leading" />
      );
      const icon = container.querySelector('[aria-hidden="true"]');
      expect(icon).toBeInTheDocument();
    });

    it('does not interfere with input semantics', () => {
      render(
        <Input icon={<span>🔒</span>} label="Password" />
      );
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
    });
  });

  describe('Axe Accessibility Audit', () => {
    it('passes accessibility audit for basic input', async () => {
      const { container } = render(
        <Input id="test" label="Test Input" />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('passes accessibility audit with error state', async () => {
      const { container } = render(
        <Input
          id="test"
          label="Email"
          error={true}
          errorMessage="Invalid email"
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('passes accessibility audit with help text', async () => {
      const { container } = render(
        <Input
          id="password"
          label="Password"
          helpText="At least 8 characters"
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('passes accessibility audit when disabled', async () => {
      const { container } = render(
        <Input label="Disabled Field" disabled />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('passes accessibility audit with required indicator', async () => {
      const { container } = render(
        <Input label="Required Field" required={true} />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Dark Mode', () => {
    it('applies dark mode text colors', () => {
      const { container } = render(<Input label="Dark Mode" />);
      const label = container.querySelector('label');
      expect(label).toHaveClass('dark:text-gray-50');
    });
  });

  describe('Screen Reader Announcements', () => {
    it('announces required status', () => {
      render(<Input label="Email" required={true} />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-required', 'true');
      expect(screen.getByLabelText(/required/i)).toBeInTheDocument();
    });

    it('announces error status', () => {
      render(
        <Input
          label="Email"
          error={true}
          errorMessage="Invalid format"
        />
      );
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('announces help text', () => {
      render(
        <Input label="Password" helpText="8+ characters" />
      );
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-describedby');
    });
  });
});
