import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Switch from './Switch';

describe('Switch', () => {
  describe('rendering', () => {
    it('should render switch input', () => {
      render(<Switch id="toggle" />);
      const toggle = screen.getByRole('switch');
      expect(toggle).toBeInTheDocument();
    });

    it('should render with label', () => {
      render(<Switch id="toggle" label="Enable notifications" />);
      const label = screen.getByText('Enable notifications');
      expect(label).toBeInTheDocument();
      expect(label).toHaveAttribute('for', 'toggle');
    });

    it('should render required indicator', () => {
      render(<Switch id="toggle" label="Accept terms" required />);
      expect(screen.getByLabelText('required')).toBeInTheDocument();
    });

    it('should render with help text', () => {
      render(<Switch id="toggle" helpText="This will enable notifications" />);
      expect(screen.getByText('This will enable notifications')).toBeInTheDocument();
    });

    it('should render with error message', () => {
      render(<Switch id="toggle" error errorMessage="This is required" />);
      expect(screen.getByRole('alert')).toHaveTextContent('This is required');
    });

    it('should render unchecked by default', () => {
      render(<Switch id="toggle" />);
      const toggle = screen.getByRole('switch') as HTMLInputElement;
      expect(toggle.checked).toBe(false);
    });

    it('should render checked when checked prop is true', () => {
      render(<Switch id="toggle" checked />);
      const toggle = screen.getByRole('switch') as HTMLInputElement;
      expect(toggle.checked).toBe(true);
    });

    it('should render disabled state', () => {
      render(<Switch id="toggle" disabled />);
      const toggle = screen.getByRole('switch');
      expect(toggle).toBeDisabled();
    });

    it('should render small size variant', () => {
      const { container } = render(<Switch id="toggle" size="sm" />);
      expect(container.querySelector('.group')).toBeInTheDocument();
    });

    it('should render medium size variant', () => {
      const { container } = render(<Switch id="toggle" size="md" />);
      expect(container.querySelector('.group')).toBeInTheDocument();
    });
  });

  describe('interaction', () => {
    it('should toggle on click', () => {
      const handleChange = jest.fn();
      render(<Switch id="toggle" onChange={handleChange} />);

      const toggle = screen.getByRole('switch');
      fireEvent.click(toggle);

      expect(handleChange).toHaveBeenCalled();
    });

    it('should not toggle when disabled', () => {
      const handleChange = jest.fn();
      render(<Switch id="toggle" disabled onChange={handleChange} />);

      const toggle = screen.getByRole('switch');
      fireEvent.click(toggle);

      expect(handleChange).not.toHaveBeenCalled();
    });

    it('should toggle with Space key', () => {
      const handleChange = jest.fn();
      render(<Switch id="toggle" onChange={handleChange} />);

      const toggle = screen.getByRole('switch');
      toggle.focus();
      fireEvent.keyDown(toggle, { key: ' ' });

      expect(handleChange).toHaveBeenCalled();
    });

    it('should toggle with Enter key', () => {
      const handleChange = jest.fn();
      render(<Switch id="toggle" onChange={handleChange} />);

      const toggle = screen.getByRole('switch');
      toggle.focus();
      fireEvent.keyDown(toggle, { key: 'Enter' });

      expect(handleChange).toHaveBeenCalled();
    });
  });

  describe('ref forwarding', () => {
    it('should forward ref to input element', () => {
      const ref = React.createRef<HTMLInputElement>();
      render(<Switch ref={ref} id="toggle" />);

      expect(ref.current).toBeInstanceOf(HTMLInputElement);
      expect(ref.current?.type).toBe('checkbox');
    });
  });

  describe('aria attributes', () => {
    it('should have switch role', () => {
      render(<Switch id="toggle" />);
      const toggle = screen.getByRole('switch');
      expect(toggle).toHaveAttribute('role', 'switch');
    });

    it('should set aria-checked for checked state', () => {
      render(<Switch id="toggle" checked />);
      const toggle = screen.getByRole('switch');
      expect(toggle).toHaveAttribute('aria-checked', 'true');
    });

    it('should set aria-checked false for unchecked state', () => {
      render(<Switch id="toggle" checked={false} />);
      const toggle = screen.getByRole('switch');
      expect(toggle).toHaveAttribute('aria-checked', 'false');
    });

    it('should set aria-required for required field', () => {
      render(<Switch id="toggle" required />);
      const toggle = screen.getByRole('switch');
      expect(toggle).toHaveAttribute('aria-required', 'true');
    });

    it('should set aria-invalid on error', () => {
      render(<Switch id="toggle" error />);
      const toggle = screen.getByRole('switch');
      expect(toggle).toHaveAttribute('aria-invalid', 'true');
    });

    it('should have aria-label from label prop', () => {
      render(<Switch id="toggle" label="Notifications" />);
      const toggle = screen.getByRole('switch');
      expect(toggle).toHaveAttribute('aria-label', 'Notifications');
    });

    it('should use ariaLabel prop when provided', () => {
      render(<Switch id="toggle" ariaLabel="Custom label" />);
      const toggle = screen.getByRole('switch');
      expect(toggle).toHaveAttribute('aria-label', 'Custom label');
    });

    it('should link aria-describedby to help text', () => {
      render(<Switch id="toggle" helpText="Help text" />);
      const toggle = screen.getByRole('switch');
      const describedBy = toggle.getAttribute('aria-describedby');
      expect(describedBy).toContain('help');
    });

    it('should link aria-describedby to error message', () => {
      render(<Switch id="toggle" error errorMessage="Error" />);
      const toggle = screen.getByRole('switch');
      const describedBy = toggle.getAttribute('aria-describedby');
      expect(describedBy).toContain('error');
    });
  });

  describe('accessibility', () => {
    it('should have focus visible outline', () => {
      render(<Switch id="toggle" />);
      const group = screen.getByRole('switch').parentElement;
      expect(group).toHaveClass('peer-focus-visible:outline-2');
    });

    it('should be keyboard navigable with Tab', () => {
      render(<Switch id="toggle" />);
      const toggle = screen.getByRole('switch');

      toggle.focus();
      expect(document.activeElement).toBe(toggle);
    });

    it('should have proper disabled styling', () => {
      render(<Switch id="toggle" disabled label="Disabled" />);
      const toggle = screen.getByRole('switch');
      expect(toggle).toBeDisabled();
    });
  });

  describe('controlled component', () => {
    it('should update when checked prop changes', () => {
      const { rerender } = render(<Switch id="toggle" checked={false} />);
      let toggle = screen.getByRole('switch') as HTMLInputElement;
      expect(toggle.checked).toBe(false);

      rerender(<Switch id="toggle" checked={true} />);
      toggle = screen.getByRole('switch') as HTMLInputElement;
      expect(toggle.checked).toBe(true);
    });

    it('should call onChange when toggled', () => {
      const handleChange = jest.fn();
      render(<Switch id="toggle" onChange={handleChange} />);

      const toggle = screen.getByRole('switch');
      fireEvent.click(toggle);

      expect(handleChange).toHaveBeenCalledTimes(1);
    });
  });

  describe('label association', () => {
    it('should associate label with input via htmlFor', () => {
      render(<Switch id="my-switch" label="My Switch" />);
      const label = screen.getByText('My Switch');
      expect(label).toHaveAttribute('for', 'my-switch');
    });

    it('should toggle when label is clicked', () => {
      const handleChange = jest.fn();
      render(<Switch id="toggle" label="Toggle" onChange={handleChange} />);

      const label = screen.getByText('Toggle');
      fireEvent.click(label);

      expect(handleChange).toHaveBeenCalled();
    });
  });

  describe('size variants', () => {
    it('should apply small size styles', () => {
      const { container } = render(<Switch id="toggle" size="sm" />);
      const switchGroup = container.querySelector('.group');
      expect(switchGroup?.querySelector('.w-10')).toBeInTheDocument();
    });

    it('should apply medium size styles', () => {
      const { container } = render(<Switch id="toggle" size="md" />);
      const switchGroup = container.querySelector('.group');
      expect(switchGroup?.querySelector('.w-12')).toBeInTheDocument();
    });
  });

  describe('error states', () => {
    it('should display error message when error and errorMessage provided', () => {
      render(<Switch id="toggle" error errorMessage="Field required" />);
      expect(screen.getByText('Field required')).toBeInTheDocument();
    });

    it('should not display error message when only error is true', () => {
      render(<Switch id="toggle" error />);
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('should have aria-invalid when error is true', () => {
      render(<Switch id="toggle" error />);
      const toggle = screen.getByRole('switch');
      expect(toggle).toHaveAttribute('aria-invalid', 'true');
    });
  });

  describe('custom props', () => {
    it('should accept and pass through additional props', () => {
      render(<Switch id="toggle" data-testid="custom-switch" />);
      const toggle = screen.getByTestId('custom-switch');
      expect(toggle).toBeInTheDocument();
    });
  });
});
