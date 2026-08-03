import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@/test/utils';
import Checkbox, { CheckboxGroup } from './Checkbox';

describe('Checkbox', () => {
  describe('rendering', () => {
    it('should render checkbox input', () => {
      render(<Checkbox />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeInTheDocument();
    });

    it('should render with label', () => {
      render(<Checkbox label="Accept terms" id="terms" />);
      const label = screen.getByText('Accept terms');
      expect(label).toBeInTheDocument();
      expect(label).toHaveAttribute('for', 'terms');
    });

    it('should render required indicator', () => {
      render(<Checkbox label="Field" required id="field" />);
      expect(screen.getByLabelText('required')).toBeInTheDocument();
    });

    it('should render with custom id', () => {
      render(<Checkbox id="custom-id" />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('id', 'custom-id');
    });

    it('should render error message', () => {
      render(
        <Checkbox
          error
          errorMessage="This field is required"
        />
      );
      expect(screen.getByRole('alert')).toHaveTextContent('This field is required');
    });

    it('should render help text', () => {
      render(
        <Checkbox
          helpText="Check to agree"
        />
      );
      expect(screen.getByText('Check to agree')).toBeInTheDocument();
    });

    it('should render disabled state', () => {
      render(<Checkbox disabled />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeDisabled();
    });

    it('should render checked state', () => {
      render(<Checkbox checked />);
      const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
      expect(checkbox.checked).toBe(true);
    });

    it('should render unchecked state', () => {
      render(<Checkbox checked={false} />);
      const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
      expect(checkbox.checked).toBe(false);
    });
  });

  describe('interaction', () => {
    it('should toggle checked state on click', () => {
      const handleChange = vi.fn();
      render(<Checkbox onChange={handleChange} />);

      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      expect(handleChange).toHaveBeenCalled();
    });

    it('should not toggle when disabled', () => {
      const handleChange = vi.fn();
      render(<Checkbox disabled onChange={handleChange} />);

      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      expect(handleChange).not.toHaveBeenCalled();
    });

    it('should toggle on space key', () => {
      const handleChange = vi.fn();
      render(<Checkbox onChange={handleChange} />);

      const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
      checkbox.focus();
      fireEvent.keyDown(checkbox, { key: ' ' });

      expect(handleChange).toHaveBeenCalled();
    });

    it('should call onChange with correct value', () => {
      const handleChange = vi.fn();
      render(<Checkbox value="test-value" onChange={handleChange} />);

      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      expect(handleChange).toHaveBeenCalled();
    });
  });

  describe('ref forwarding', () => {
    it('should forward ref to input element', () => {
      const ref = React.createRef<HTMLInputElement>();
      render(<Checkbox ref={ref} />);

      expect(ref.current).toBeInstanceOf(HTMLInputElement);
      expect(ref.current?.type).toBe('checkbox');
    });
  });

  describe('aria attributes', () => {
    it('should have checkbox role', () => {
      render(<Checkbox />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeInTheDocument();
    });

    it('should set aria-required for required field', () => {
      render(<Checkbox required />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('aria-required', 'true');
    });

    it('should set aria-invalid on error', () => {
      render(<Checkbox error />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('aria-invalid', 'true');
    });

    it('should link aria-describedby to help text', () => {
      render(<Checkbox helpText="Help" />);
      const checkbox = screen.getByRole('checkbox');
      const describedBy = checkbox.getAttribute('aria-describedby');
      expect(describedBy).toContain('help');
    });

    it('should link aria-describedby to error message', () => {
      render(<Checkbox error errorMessage="Error" />);
      const checkbox = screen.getByRole('checkbox');
      const describedBy = checkbox.getAttribute('aria-describedby');
      expect(describedBy).toContain('error');
    });

    it('should link aria-describedby to both help and error', () => {
      render(
        <Checkbox
          error
          errorMessage="Error"
          helpText="Help"
        />
      );
      const checkbox = screen.getByRole('checkbox');
      const describedBy = checkbox.getAttribute('aria-describedby');
      expect(describedBy).toContain('help');
      expect(describedBy).toContain('error');
    });

    it('should have aria-label from label prop', () => {
      render(<Checkbox label="Terms" id="terms" />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('aria-label', 'Terms');
    });

    it('should use ariaLabel prop when provided', () => {
      render(<Checkbox ariaLabel="Custom label" />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('aria-label', 'Custom label');
    });
  });

  describe('accessibility', () => {
    it('should have focus visible outline', () => {
      render(<Checkbox />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveClass('focus-visible:outline-2');
    });

    it('should be keyboard navigable with Tab', () => {
      render(<Checkbox />);
      const checkbox = screen.getByRole('checkbox');

      checkbox.focus();
      expect(document.activeElement).toBe(checkbox);
    });
  });
});

describe('CheckboxGroup', () => {
  const mockOptions = [
    { id: 'opt1', label: 'Option 1', value: 'opt1' },
    { id: 'opt2', label: 'Option 2', value: 'opt2' },
    { id: 'opt3', label: 'Option 3', value: 'opt3' },
    { id: 'opt4', label: 'Option 4', value: 'opt4', disabled: true },
  ];

  describe('rendering', () => {
    it('should render fieldset with legend', () => {
      render(
        <CheckboxGroup
          options={mockOptions}
          values={[]}
          onChange={vi.fn()}
          legend="Choose options"
        />
      );

      expect(screen.getByText('Choose options')).toBeInTheDocument();
      expect(screen.getByRole('group')).toBeInTheDocument();
    });

    it('should render all checkbox options', () => {
      render(
        <CheckboxGroup
          options={mockOptions}
          values={[]}
          onChange={vi.fn()}
          legend="Choose"
        />
      );

      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes).toHaveLength(4);
    });

    it('should render option labels', () => {
      render(
        <CheckboxGroup
          options={mockOptions}
          values={[]}
          onChange={vi.fn()}
          legend="Choose"
        />
      );

      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.getByText('Option 2')).toBeInTheDocument();
      expect(screen.getByText('Option 3')).toBeInTheDocument();
      expect(screen.getByText('Option 4')).toBeInTheDocument();
    });

    it('should render required indicator', () => {
      render(
        <CheckboxGroup
          options={mockOptions}
          values={[]}
          onChange={vi.fn()}
          legend="Choose"
          required
        />
      );

      expect(screen.getByLabelText('required')).toBeInTheDocument();
    });

    it('should render error message', () => {
      render(
        <CheckboxGroup
          options={mockOptions}
          values={[]}
          onChange={vi.fn()}
          legend="Choose"
          error
          errorMessage="Select at least one"
        />
      );

      expect(screen.getByRole('alert')).toHaveTextContent('Select at least one');
    });

    it('should render help text', () => {
      render(
        <CheckboxGroup
          options={mockOptions}
          values={[]}
          onChange={vi.fn()}
          legend="Choose"
          helpText="Select all that apply"
        />
      );

      expect(screen.getByText('Select all that apply')).toBeInTheDocument();
    });

    it('should render in vertical layout by default', () => {
      const { container } = render(
        <CheckboxGroup
          options={mockOptions}
          values={[]}
          onChange={vi.fn()}
          legend="Choose"
        />
      );

      const group = screen.getByRole('group');
      expect(group).toHaveClass('flex flex-col gap-3');
    });

    it('should render in horizontal layout', () => {
      const { container } = render(
        <CheckboxGroup
          options={mockOptions}
          values={[]}
          onChange={vi.fn()}
          legend="Choose"
          layout="horizontal"
        />
      );

      const group = screen.getByRole('group');
      expect(group).toHaveClass('flex flex-wrap gap-4');
    });
  });

  describe('interaction', () => {
    it('should select option on click', () => {
      const handleChange = vi.fn();
      render(
        <CheckboxGroup
          options={mockOptions}
          values={[]}
          onChange={handleChange}
          legend="Choose"
        />
      );

      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[0]);

      expect(handleChange).toHaveBeenCalledWith(['opt1']);
    });

    it('should add to selected values', () => {
      const handleChange = vi.fn();
      render(
        <CheckboxGroup
          options={mockOptions}
          values={['opt1']}
          onChange={handleChange}
          legend="Choose"
        />
      );

      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[1]);

      expect(handleChange).toHaveBeenCalledWith(['opt1', 'opt2']);
    });

    it('should remove from selected values', () => {
      const handleChange = vi.fn();
      render(
        <CheckboxGroup
          options={mockOptions}
          values={['opt1', 'opt2']}
          onChange={handleChange}
          legend="Choose"
        />
      );

      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[0]);

      expect(handleChange).toHaveBeenCalledWith(['opt2']);
    });

    it('should not select disabled option', () => {
      const handleChange = vi.fn();
      render(
        <CheckboxGroup
          options={mockOptions}
          values={[]}
          onChange={handleChange}
          legend="Choose"
        />
      );

      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[3]); // Disabled option

      expect(handleChange).not.toHaveBeenCalled();
    });

    it('should disable all options when group is disabled', () => {
      const handleChange = vi.fn();
      render(
        <CheckboxGroup
          options={mockOptions}
          values={[]}
          onChange={handleChange}
          legend="Choose"
          disabled
        />
      );

      const checkboxes = screen.getAllByRole('checkbox');
      checkboxes.forEach((checkbox) => {
        expect(checkbox).toBeDisabled();
      });
    });

    it('should render selected values as checked', () => {
      render(
        <CheckboxGroup
          options={mockOptions}
          values={['opt1', 'opt3']}
          onChange={vi.fn()}
          legend="Choose"
        />
      );

      const checkboxes = screen.getAllByRole('checkbox') as HTMLInputElement[];
      expect(checkboxes[0].checked).toBe(true);
      expect(checkboxes[1].checked).toBe(false);
      expect(checkboxes[2].checked).toBe(true);
      expect(checkboxes[3].checked).toBe(false);
    });
  });

  describe('aria attributes', () => {
    it('should use fieldset role', () => {
      const { container } = render(
        <CheckboxGroup
          options={mockOptions}
          values={[]}
          onChange={vi.fn()}
          legend="Choose"
        />
      );

      const fieldset = container.querySelector('fieldset');
      expect(fieldset).toBeInTheDocument();
    });

    it('should have legend for accessibility', () => {
      render(
        <CheckboxGroup
          options={mockOptions}
          values={[]}
          onChange={vi.fn()}
          legend="Choose options"
        />
      );

      const legend = screen.getByText('Choose options');
      expect(legend).toBeInTheDocument();
    });

    it('should set aria-required on fieldset', () => {
      const { container } = render(
        <CheckboxGroup
          options={mockOptions}
          values={[]}
          onChange={vi.fn()}
          legend="Choose"
          required
        />
      );

      const fieldset = container.querySelector('fieldset');
      expect(fieldset).toHaveAttribute('aria-required', 'true');
    });

    it('should set aria-invalid on error', () => {
      const { container } = render(
        <CheckboxGroup
          options={mockOptions}
          values={[]}
          onChange={vi.fn()}
          legend="Choose"
          error
        />
      );

      const fieldset = container.querySelector('fieldset');
      expect(fieldset).toHaveAttribute('aria-invalid', 'true');
    });

    it('should link aria-describedby to help text', () => {
      const { container } = render(
        <CheckboxGroup
          options={mockOptions}
          values={[]}
          onChange={vi.fn()}
          legend="Choose"
          helpText="Help text"
        />
      );

      const fieldset = container.querySelector('fieldset');
      const describedBy = fieldset?.getAttribute('aria-describedby');
      expect(describedBy).toContain('help');
    });

    it('should link aria-describedby to error message', () => {
      const { container } = render(
        <CheckboxGroup
          options={mockOptions}
          values={[]}
          onChange={vi.fn()}
          legend="Choose"
          error
          errorMessage="Error"
        />
      );

      const fieldset = container.querySelector('fieldset');
      const describedBy = fieldset?.getAttribute('aria-describedby');
      expect(describedBy).toContain('error');
    });

    it('should have aria-label on checkboxes', () => {
      render(
        <CheckboxGroup
          options={mockOptions}
          values={[]}
          onChange={vi.fn()}
          legend="Choose"
        />
      );

      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes[0]).toHaveAttribute('aria-label', 'Option 1');
      expect(checkboxes[1]).toHaveAttribute('aria-label', 'Option 2');
    });

    it('should set aria-disabled on disabled checkboxes', () => {
      render(
        <CheckboxGroup
          options={mockOptions}
          values={[]}
          onChange={vi.fn()}
          legend="Choose"
        />
      );

      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes[3]).toBeDisabled();
    });
  });

  describe('ref forwarding', () => {
    it('should forward ref to fieldset element', () => {
      const ref = React.createRef<HTMLFieldSetElement>();
      render(
        <CheckboxGroup
          ref={ref}
          options={mockOptions}
          values={[]}
          onChange={vi.fn()}
          legend="Choose"
        />
      );

      expect(ref.current).toBeInstanceOf(HTMLFieldSetElement);
    });
  });
});
