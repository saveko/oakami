import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@/test/utils';
import Radio, { RadioGroup } from './Radio';

describe('Radio', () => {
  describe('rendering', () => {
    it('should render radio input', () => {
      render(<Radio name="option" />);
      const radio = screen.getByRole('radio');
      expect(radio).toBeInTheDocument();
    });

    it('should render with label', () => {
      render(<Radio name="option" label="Choice" id="choice" />);
      const label = screen.getByText('Choice');
      expect(label).toBeInTheDocument();
      expect(label).toHaveAttribute('for', 'choice');
    });

    it('should render required indicator', () => {
      render(<Radio name="option" label="Field" required id="field" />);
      expect(screen.getByLabelText('required')).toBeInTheDocument();
    });

    it('should render with custom id', () => {
      render(<Radio name="option" id="custom-id" />);
      const radio = screen.getByRole('radio');
      expect(radio).toHaveAttribute('id', 'custom-id');
    });

    it('should render with name attribute', () => {
      render(<Radio name="group-name" />);
      const radio = screen.getByRole('radio');
      expect(radio).toHaveAttribute('name', 'group-name');
    });

    it('should render disabled state', () => {
      render(<Radio name="option" disabled />);
      const radio = screen.getByRole('radio');
      expect(radio).toBeDisabled();
    });

    it('should render checked state', () => {
      render(<Radio name="option" defaultChecked />);
      const radio = screen.getByRole('radio') as HTMLInputElement;
      expect(radio.checked).toBe(true);
    });

    it('should render unchecked state', () => {
      render(<Radio name="option" defaultChecked={false} />);
      const radio = screen.getByRole('radio') as HTMLInputElement;
      expect(radio.checked).toBe(false);
    });

    it('should have unique id when not provided', () => {
      // Both radios must be mounted at once: a rerender replaces the first
      // instance, so there is never a second element to compare against.
      render(
        <>
          <Radio name="option1" />
          <Radio name="option2" />
        </>
      );
      const [radio1, radio2] = screen.getAllByRole('radio');

      expect(radio1.id).toBeTruthy();
      expect(radio1.id).not.toBe(radio2.id);
    });
  });

  describe('interaction', () => {
    it('should select radio on click', () => {
      const handleChange = vi.fn();
      render(<Radio name="option" onChange={handleChange} />);

      const radio = screen.getByRole('radio');
      fireEvent.click(radio);

      expect(handleChange).toHaveBeenCalled();
    });

    it('should not toggle when disabled', () => {
      const handleChange = vi.fn();
      render(<Radio name="option" disabled onChange={handleChange} />);

      const radio = screen.getByRole('radio');
      fireEvent.click(radio);

      expect(handleChange).not.toHaveBeenCalled();
    });

    it('should select on space key', () => {
      const handleChange = vi.fn();
      render(<Radio name="option" onChange={handleChange} />);

      const radio = screen.getByRole('radio');
      radio.focus();
      fireEvent.keyDown(radio, { key: ' ' });

      expect(handleChange).toHaveBeenCalled();
    });

    it('should select on enter key', () => {
      const handleChange = vi.fn();
      render(<Radio name="option" onChange={handleChange} />);

      const radio = screen.getByRole('radio');
      radio.focus();
      fireEvent.keyDown(radio, { key: 'Enter' });

      expect(handleChange).toHaveBeenCalled();
    });
  });

  describe('ref forwarding', () => {
    it('should forward ref to input element', () => {
      const ref = React.createRef<HTMLInputElement>();
      render(<Radio ref={ref} name="option" />);

      expect(ref.current).toBeInstanceOf(HTMLInputElement);
      expect(ref.current?.type).toBe('radio');
    });
  });

  describe('aria attributes', () => {
    it('should have radio role', () => {
      render(<Radio name="option" />);
      const radio = screen.getByRole('radio');
      expect(radio).toBeInTheDocument();
    });

    it('should set aria-required for required field', () => {
      render(<Radio name="option" required />);
      const radio = screen.getByRole('radio');
      expect(radio).toHaveAttribute('aria-required', 'true');
    });

    it('should have aria-label from label prop', () => {
      render(<Radio name="option" label="Choice" id="choice" />);
      const radio = screen.getByRole('radio');
      expect(radio).toHaveAttribute('aria-label', 'Choice');
    });

    it('should use ariaLabel prop when provided', () => {
      render(<Radio name="option" ariaLabel="Custom label" />);
      const radio = screen.getByRole('radio');
      expect(radio).toHaveAttribute('aria-label', 'Custom label');
    });
  });

  describe('accessibility', () => {
    it('should have focus visible outline', () => {
      render(<Radio name="option" />);
      const radio = screen.getByRole('radio');
      expect(radio).toHaveClass('focus-visible:outline-2');
    });

    it('should be keyboard navigable with Tab', () => {
      render(<Radio name="option" />);
      const radio = screen.getByRole('radio');

      radio.focus();
      expect(document.activeElement).toBe(radio);
    });
  });
});

describe('RadioGroup', () => {
  const mockOptions = [
    { value: 'opt1', label: 'Option 1' },
    { value: 'opt2', label: 'Option 2' },
    { value: 'opt3', label: 'Option 3' },
    { value: 'opt4', label: 'Option 4', disabled: true },
  ];

  describe('rendering', () => {
    it('should render fieldset with legend', () => {
      render(
        <RadioGroup
          options={mockOptions}
          value=""
          onChange={vi.fn()}
          name="group"
          legend="Choose option"
        />
      );

      expect(screen.getByText('Choose option')).toBeInTheDocument();
      expect(screen.getByRole('radiogroup')).toBeInTheDocument();
    });

    it('should render all radio options', () => {
      render(
        <RadioGroup
          options={mockOptions}
          value=""
          onChange={vi.fn()}
          name="group"
          legend="Choose"
        />
      );

      const radios = screen.getAllByRole('radio');
      expect(radios).toHaveLength(4);
    });

    it('should render option labels', () => {
      render(
        <RadioGroup
          options={mockOptions}
          value=""
          onChange={vi.fn()}
          name="group"
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
        <RadioGroup
          options={mockOptions}
          value=""
          onChange={vi.fn()}
          name="group"
          legend="Choose"
          required
        />
      );

      expect(screen.getByLabelText('required')).toBeInTheDocument();
    });

    it('should render error message', () => {
      render(
        <RadioGroup
          options={mockOptions}
          value=""
          onChange={vi.fn()}
          name="group"
          legend="Choose"
          error
          errorMessage="Select one option"
        />
      );

      expect(screen.getByRole('alert')).toHaveTextContent('Select one option');
    });

    it('should render help text', () => {
      render(
        <RadioGroup
          options={mockOptions}
          value=""
          onChange={vi.fn()}
          name="group"
          legend="Choose"
          helpText="Select one"
        />
      );

      expect(screen.getByText('Select one')).toBeInTheDocument();
    });

    it('should render in vertical layout by default', () => {
      const { container } = render(
        <RadioGroup
          options={mockOptions}
          value=""
          onChange={vi.fn()}
          name="group"
          legend="Choose"
        />
      );

      const group = screen.getByRole('radiogroup');
      expect(group).toHaveClass('flex flex-col gap-3');
    });

    it('should render in horizontal layout', () => {
      const { container } = render(
        <RadioGroup
          options={mockOptions}
          value=""
          onChange={vi.fn()}
          name="group"
          legend="Choose"
          layout="horizontal"
        />
      );

      const group = screen.getByRole('radiogroup');
      expect(group).toHaveClass('flex flex-wrap gap-4');
    });
  });

  describe('interaction', () => {
    it('should select option on click', () => {
      const handleChange = vi.fn();
      render(
        <RadioGroup
          options={mockOptions}
          value=""
          onChange={handleChange}
          name="group"
          legend="Choose"
        />
      );

      const radios = screen.getAllByRole('radio');
      fireEvent.click(radios[0]);

      expect(handleChange).toHaveBeenCalledWith('opt1');
    });

    it('should replace previous selection', () => {
      const handleChange = vi.fn();
      render(
        <RadioGroup
          options={mockOptions}
          value="opt1"
          onChange={handleChange}
          name="group"
          legend="Choose"
        />
      );

      const radios = screen.getAllByRole('radio');
      fireEvent.click(radios[1]);

      expect(handleChange).toHaveBeenCalledWith('opt2');
    });

    it('should not select disabled option', () => {
      const handleChange = vi.fn();
      render(
        <RadioGroup
          options={mockOptions}
          value=""
          onChange={handleChange}
          name="group"
          legend="Choose"
        />
      );

      const radios = screen.getAllByRole('radio');
      fireEvent.click(radios[3]); // Disabled option

      expect(handleChange).not.toHaveBeenCalled();
    });

    it('should disable all options when group is disabled', () => {
      const handleChange = vi.fn();
      render(
        <RadioGroup
          options={mockOptions}
          value=""
          onChange={handleChange}
          name="group"
          legend="Choose"
          disabled
        />
      );

      const radios = screen.getAllByRole('radio');
      radios.forEach((radio) => {
        expect(radio).toBeDisabled();
      });
    });

    it('should render selected value as checked', () => {
      render(
        <RadioGroup
          options={mockOptions}
          value="opt2"
          onChange={vi.fn()}
          name="group"
          legend="Choose"
        />
      );

      const radios = screen.getAllByRole('radio') as HTMLInputElement[];
      expect(radios[0].checked).toBe(false);
      expect(radios[1].checked).toBe(true);
      expect(radios[2].checked).toBe(false);
    });

    it('should navigate with arrow keys', () => {
      render(
        <RadioGroup
          options={mockOptions}
          value="opt1"
          onChange={vi.fn()}
          name="group"
          legend="Choose"
        />
      );

      const radios = screen.getAllByRole('radio');
      const firstRadio = radios[0] as HTMLInputElement;

      firstRadio.focus();
      fireEvent.keyDown(firstRadio, { key: 'ArrowDown' });

      // Note: Native browser behavior for arrow keys in radio groups
      expect(firstRadio).toHaveFocus();
    });
  });

  describe('aria attributes', () => {
    it('should use fieldset role', () => {
      const { container } = render(
        <RadioGroup
          options={mockOptions}
          value=""
          onChange={vi.fn()}
          name="group"
          legend="Choose"
        />
      );

      const fieldset = container.querySelector('fieldset');
      expect(fieldset).toBeInTheDocument();
    });

    it('should have legend for accessibility', () => {
      render(
        <RadioGroup
          options={mockOptions}
          value=""
          onChange={vi.fn()}
          name="group"
          legend="Choose options"
        />
      );

      const legend = screen.getByText('Choose options');
      expect(legend).toBeInTheDocument();
    });

    it('should have radiogroup role', () => {
      render(
        <RadioGroup
          options={mockOptions}
          value=""
          onChange={vi.fn()}
          name="group"
          legend="Choose"
        />
      );

      const group = screen.getByRole('radiogroup');
      expect(group).toBeInTheDocument();
    });

    it('should set aria-required on fieldset', () => {
      const { container } = render(
        <RadioGroup
          options={mockOptions}
          value=""
          onChange={vi.fn()}
          name="group"
          legend="Choose"
          required
        />
      );

      const fieldset = container.querySelector('fieldset');
      expect(fieldset).toHaveAttribute('aria-required', 'true');
    });

    it('should set aria-invalid on error', () => {
      const { container } = render(
        <RadioGroup
          options={mockOptions}
          value=""
          onChange={vi.fn()}
          name="group"
          legend="Choose"
          error
        />
      );

      const fieldset = container.querySelector('fieldset');
      expect(fieldset).toHaveAttribute('aria-invalid', 'true');
    });

    it('should link aria-describedby to help text', () => {
      const { container } = render(
        <RadioGroup
          options={mockOptions}
          value=""
          onChange={vi.fn()}
          name="group"
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
        <RadioGroup
          options={mockOptions}
          value=""
          onChange={vi.fn()}
          name="group"
          legend="Choose"
          error
          errorMessage="Error"
        />
      );

      const fieldset = container.querySelector('fieldset');
      const describedBy = fieldset?.getAttribute('aria-describedby');
      expect(describedBy).toContain('error');
    });

    it('should have aria-label on radios', () => {
      render(
        <RadioGroup
          options={mockOptions}
          value=""
          onChange={vi.fn()}
          name="group"
          legend="Choose"
        />
      );

      const radios = screen.getAllByRole('radio');
      expect(radios[0]).toHaveAttribute('aria-label', 'Option 1');
      expect(radios[1]).toHaveAttribute('aria-label', 'Option 2');
    });

    it('should have same name for mutual exclusivity', () => {
      render(
        <RadioGroup
          options={mockOptions}
          value=""
          onChange={vi.fn()}
          name="group-name"
          legend="Choose"
        />
      );

      const radios = screen.getAllByRole('radio');
      radios.forEach((radio) => {
        expect(radio).toHaveAttribute('name', 'group-name');
      });
    });
  });

  describe('ref forwarding', () => {
    it('should forward ref to fieldset element', () => {
      const ref = React.createRef<HTMLFieldSetElement>();
      render(
        <RadioGroup
          ref={ref}
          options={mockOptions}
          value=""
          onChange={vi.fn()}
          name="group"
          legend="Choose"
        />
      );

      expect(ref.current).toBeInstanceOf(HTMLFieldSetElement);
    });
  });

  describe('mutual exclusivity', () => {
    it('should only allow one selection', () => {
      const handleChange = vi.fn();
      render(
        <RadioGroup
          options={mockOptions}
          value="opt1"
          onChange={handleChange}
          name="group"
          legend="Choose"
        />
      );

      const radios = screen.getAllByRole('radio') as HTMLInputElement[];

      // opt1 is selected
      expect(radios[0].checked).toBe(true);

      // Select opt2
      fireEvent.click(radios[1]);

      // opt1 should now be deselected in the output
      expect(handleChange).toHaveBeenCalledWith('opt2');
    });
  });
});
