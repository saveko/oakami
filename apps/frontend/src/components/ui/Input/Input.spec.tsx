import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen } from '@/test/utils';
import userEvent from '@testing-library/user-event';
import { Input } from './Input';
import { Mail, Lock } from 'lucide-react';

describe('Input', () => {
  describe('Rendering', () => {
    it('renders input field', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
    });

    it('renders with label', () => {
      render(<Input label="Email" />);
      expect(screen.getByText('Email')).toBeInTheDocument();
    });

    it('associates label with input', () => {
      render(<Input id="email" label="Email" />);
      const label = screen.getByText('Email');
      expect(label).toHaveAttribute('for', 'email');
    });

    it('generates unique id when not provided', () => {
      const { rerender } = render(<Input label="Field 1" />);
      const input1 = screen.getByRole('textbox');
      const id1 = input1.id;

      rerender(<Input label="Field 2" />);
      const input2 = screen.getByRole('textbox');
      expect(input2.id).not.toBe(id1);
    });
  });

  describe('Input Types', () => {
    it('renders text input (default)', () => {
      render(<Input />);
      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.type).toBe('text');
    });

    it('renders email input', () => {
      render(<Input type="email" />);
      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.type).toBe('email');
    });

    it('renders password input', () => {
      render(<Input type="password" />);
      const input = screen.getByDisplayValue('');
      expect(input).toHaveAttribute('type', 'password');
    });

    it('renders number input', () => {
      render(<Input type="number" />);
      const input = screen.getByRole('spinbutton');
      expect(input).toBeInTheDocument();
    });

    it('renders search input', () => {
      render(<Input type="search" />);
      const input = screen.getByRole('searchbox');
      expect(input).toBeInTheDocument();
    });
  });

  describe('States', () => {
    it('renders disabled input', () => {
      render(<Input disabled />);
      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
    });

    it('applies error styling', () => {
      const { container } = render(<Input error={true} errorMessage="Invalid" />);
      const input = container.querySelector('input');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('renders error message', () => {
      render(<Input error={true} errorMessage="Email is required" />);
      expect(screen.getByText('Email is required')).toBeInTheDocument();
    });

    it('marks error message as alert', () => {
      render(<Input error={true} errorMessage="Error" />);
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  describe('Label & Required', () => {
    it('marks required field', () => {
      render(<Input label="Email" required={true} />);
      expect(screen.getByLabelText(/required/i)).toBeInTheDocument();
    });

    it('sets aria-required attribute', () => {
      render(<Input required={true} />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-required', 'true');
    });

    it('does not show required indicator when false', () => {
      render(<Input label="Email" required={false} />);
      const asterisks = screen.queryAllByText('*');
      expect(asterisks.length).toBe(0);
    });
  });

  describe('Help Text', () => {
    it('displays help text', () => {
      render(<Input helpText="At least 8 characters" />);
      expect(screen.getByText('At least 8 characters')).toBeInTheDocument();
    });

    it('links help text with aria-describedby', () => {
      render(<Input id="password" helpText="Help text" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-describedby');
    });

    it('hides help text when error is shown', () => {
      const { rerender } = render(
        <Input helpText="Help" />
      );
      expect(screen.getByText('Help')).toBeInTheDocument();

      rerender(<Input helpText="Help" error={true} errorMessage="Error" />);
      expect(screen.queryByText('Help')).not.toBeInTheDocument();
    });
  });

  describe('Icons', () => {
    it('renders leading icon', () => {
      render(<Input icon={<Mail size={18} />} iconPosition="leading" />);
      // Icon is rendered and marked as aria-hidden
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('pl-10');
    });

    it('renders trailing icon', () => {
      render(<Input icon={<Lock size={18} />} iconPosition="trailing" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('pr-10');
    });

    it('marks icon as aria-hidden', () => {
      const { container } = render(
        <Input icon={<Mail size={18} />} iconPosition="leading" />
      );
      const icon = container.querySelector('[aria-hidden="true"]');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('Input Values', () => {
    it('accepts initial value', () => {
      render(<Input defaultValue="test@example.com" />);
      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('test@example.com');
    });

    it('handles onChange events', async () => {
      const handleChange = vi.fn();
      render(<Input onChange={handleChange} />);
      const input = screen.getByRole('textbox');

      await userEvent.type(input, 'hello');
      expect(handleChange).toHaveBeenCalledTimes(5); // Called for each character
    });

    it('accepts custom attributes', () => {
      render(<Input placeholder="Enter text" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('placeholder', 'Enter text');
    });
  });

  describe('Width Control', () => {
    it('renders full width by default', () => {
      const { container } = render(<Input />);
      const wrapper = container.querySelector('div');
      expect(wrapper).toHaveClass('w-full');
    });

    it('can disable full width', () => {
      const { container } = render(<Input fullWidth={false} />);
      const wrapper = container.querySelector('div');
      expect(wrapper).not.toHaveClass('w-full');
    });
  });

  describe('Ref Forwarding', () => {
    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLInputElement>();
      render(<Input ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLInputElement);
    });

    it('allows imperative focus', () => {
      const ref = React.createRef<HTMLInputElement>();
      render(<Input ref={ref} />);
      ref.current?.focus();
      expect(ref.current).toHaveFocus();
    });
  });
});
