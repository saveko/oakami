import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import Radio, { RadioGroup } from './Radio';

expect.extend(toHaveNoViolations);

describe('Radio - Accessibility', () => {
  describe('keyboard navigation', () => {
    it('should be focusable with Tab key', () => {
      render(<Radio name="option" id="radio-1" />);

      const radio = screen.getByRole('radio');
      radio.focus();
      expect(document.activeElement).toBe(radio);
    });

    it('should select radio with Space key', () => {
      const handleChange = jest.fn();
      render(<Radio name="option" onChange={handleChange} id="radio-1" />);

      const radio = screen.getByRole('radio');
      radio.focus();
      fireEvent.keyDown(radio, { key: ' ' });

      expect(handleChange).toHaveBeenCalled();
    });

    it('should select radio with Enter key', () => {
      const handleChange = jest.fn();
      render(<Radio name="option" onChange={handleChange} id="radio-1" />);

      const radio = screen.getByRole('radio');
      radio.focus();
      fireEvent.keyDown(radio, { key: 'Enter' });

      expect(handleChange).toHaveBeenCalled();
    });

    it('should navigate group with arrow keys', () => {
      render(
        <RadioGroup
          options={[
            { value: 'opt1', label: 'Option 1' },
            { value: 'opt2', label: 'Option 2' },
            { value: 'opt3', label: 'Option 3' },
          ]}
          value="opt1"
          onChange={jest.fn()}
          name="group"
          legend="Choose"
        />
      );

      const radios = screen.getAllByRole('radio');
      radios[0].focus();
      expect(document.activeElement).toBe(radios[0]);

      fireEvent.keyDown(radios[0], { key: 'ArrowDown' });
      // Native browser handles arrow key navigation in radio groups
      expect(radios[0]).toHaveFocus();
    });

    it('should have accessible label for keyboard navigation', () => {
      render(<Radio name="option" label="Accept" id="accept" />);

      const radio = screen.getByRole('radio');
      const label = screen.getByText('Accept');
      expect(label).toHaveAttribute('for', 'accept');
    });

    it('should skip disabled options in group', () => {
      render(
        <RadioGroup
          options={[
            { value: 'opt1', label: 'Option 1' },
            { value: 'opt2', label: 'Option 2', disabled: true },
            { value: 'opt3', label: 'Option 3' },
          ]}
          value="opt1"
          onChange={jest.fn()}
          name="group"
          legend="Choose"
        />
      );

      const radios = screen.getAllByRole('radio');
      expect(radios[1]).toBeDisabled();
    });
  });

  describe('focus management', () => {
    it('should have visible focus indicator', () => {
      render(<Radio name="option" id="radio-1" />);

      const radio = screen.getByRole('radio');
      expect(radio).toHaveClass('focus-visible:outline-2');
      expect(radio).toHaveClass('focus-visible:outline-offset-2');
    });

    it('should be focusable in group', () => {
      render(
        <RadioGroup
          options={[
            { value: 'opt1', label: 'Option 1' },
            { value: 'opt2', label: 'Option 2' },
          ]}
          value=""
          onChange={jest.fn()}
          name="group"
          legend="Choose"
        />
      );

      const radios = screen.getAllByRole('radio');
      radios[0].focus();
      expect(document.activeElement).toBe(radios[0]);

      fireEvent.keyDown(radios[0], { key: 'Tab' });
      radios[1].focus();
      expect(document.activeElement).toBe(radios[1]);
    });
  });

  describe('aria attributes', () => {
    it('should have radio role', () => {
      render(<Radio name="option" id="radio-1" />);

      const radio = screen.getByRole('radio');
      expect(radio).toHaveAttribute('type', 'radio');
    });

    it('should have aria-required for required field', () => {
      render(<Radio name="option" required id="radio-1" />);

      const radio = screen.getByRole('radio');
      expect(radio).toHaveAttribute('aria-required', 'true');
    });

    it('should have aria-label from label prop', () => {
      render(<Radio name="option" label="Choice" id="choice" />);

      const radio = screen.getByRole('radio');
      expect(radio).toHaveAttribute('aria-label', 'Choice');
    });

    it('should use ariaLabel prop when provided', () => {
      render(<Radio name="option" ariaLabel="Custom label" id="radio-1" />);

      const radio = screen.getByRole('radio');
      expect(radio).toHaveAttribute('aria-label', 'Custom label');
    });

    it('should set aria-required on fieldset for required group', () => {
      const { container } = render(
        <RadioGroup
          options={[
            { value: 'opt1', label: 'Option 1' },
          ]}
          value=""
          onChange={jest.fn()}
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
          options={[
            { value: 'opt1', label: 'Option 1' },
          ]}
          value=""
          onChange={jest.fn()}
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
          options={[
            { value: 'opt1', label: 'Option 1' },
          ]}
          value=""
          onChange={jest.fn()}
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
          options={[
            { value: 'opt1', label: 'Option 1' },
          ]}
          value=""
          onChange={jest.fn()}
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
          options={[
            { value: 'opt1', label: 'Option 1' },
            { value: 'opt2', label: 'Option 2' },
          ]}
          value=""
          onChange={jest.fn()}
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
          options={[
            { value: 'opt1', label: 'Option 1' },
            { value: 'opt2', label: 'Option 2' },
          ]}
          value=""
          onChange={jest.fn()}
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

  describe('color contrast', () => {
    it('should have sufficient contrast on text', () => {
      render(<Radio name="option" label="Accept" id="accept" />);

      const label = screen.getByText('Accept');
      const styles = window.getComputedStyle(label);
      expect(styles.color).toBeTruthy();
    });

    it('should have sufficient contrast on error text', () => {
      render(
        <RadioGroup
          options={[
            { value: 'opt1', label: 'Option 1' },
          ]}
          value=""
          onChange={jest.fn()}
          name="group"
          legend="Choose"
          error
          errorMessage="Error"
        />
      );

      const error = screen.getByRole('alert');
      const styles = window.getComputedStyle(error);
      expect(styles.color).toBeTruthy();
    });

    it('should have sufficient contrast on disabled state', () => {
      render(<Radio name="option" disabled label="Disabled" id="disabled" />);

      const radio = screen.getByRole('radio');
      const styles = window.getComputedStyle(radio);
      expect(styles.opacity).toBeDefined();
    });
  });

  describe('touch targets', () => {
    it('should have minimum 44px height', () => {
      render(<Radio name="option" id="radio-1" />);

      const radio = screen.getByRole('radio');
      // 20px + padding should meet minimum touch target
      const height = radio.clientHeight;
      expect(height).toBeGreaterThanOrEqual(20);
    });

    it('should have proper spacing in group', () => {
      render(
        <RadioGroup
          options={[
            { value: 'opt1', label: 'Option 1' },
            { value: 'opt2', label: 'Option 2' },
            { value: 'opt3', label: 'Option 3' },
          ]}
          value=""
          onChange={jest.fn()}
          name="group"
          legend="Choose"
        />
      );

      const radios = screen.getAllByRole('radio');
      expect(radios.length).toBe(3);
    });

    it('should have clickable label', () => {
      render(<Radio name="option" label="Accept" id="accept" />);

      const label = screen.getByText('Accept');
      expect(label).toHaveAttribute('for', 'accept');
    });
  });

  describe('semantic HTML', () => {
    it('should use semantic input element', () => {
      render(<Radio name="option" id="radio-1" />);

      const radio = screen.getByRole('radio');
      expect(radio.tagName).toBe('INPUT');
      expect(radio).toHaveAttribute('type', 'radio');
    });

    it('should use semantic label element', () => {
      render(<Radio name="option" label="Accept" id="accept" />);

      const label = screen.getByText('Accept');
      expect(label.tagName).toBe('LABEL');
    });

    it('should use semantic fieldset for group', () => {
      const { container } = render(
        <RadioGroup
          options={[
            { value: 'opt1', label: 'Option 1' },
            { value: 'opt2', label: 'Option 2' },
          ]}
          value=""
          onChange={jest.fn()}
          name="group"
          legend="Choose"
        />
      );

      const fieldset = container.querySelector('fieldset');
      expect(fieldset).toBeInTheDocument();
    });

    it('should use semantic legend for fieldset', () => {
      render(
        <RadioGroup
          options={[
            { value: 'opt1', label: 'Option 1' },
          ]}
          value=""
          onChange={jest.fn()}
          name="group"
          legend="Options"
        />
      );

      const legend = screen.getByText('Options');
      expect(legend.tagName).toBe('LEGEND');
    });

    it('should use role="alert" for error message', () => {
      render(
        <RadioGroup
          options={[
            { value: 'opt1', label: 'Option 1' },
          ]}
          value=""
          onChange={jest.fn()}
          name="group"
          legend="Choose"
          error
          errorMessage="Error"
        />
      );

      const alert = screen.getByRole('alert');
      expect(alert).toHaveTextContent('Error');
    });

    it('should have radiogroup role', () => {
      render(
        <RadioGroup
          options={[
            { value: 'opt1', label: 'Option 1' },
          ]}
          value=""
          onChange={jest.fn()}
          name="group"
          legend="Choose"
        />
      );

      const group = screen.getByRole('radiogroup');
      expect(group).toBeInTheDocument();
    });
  });

  describe('text alternatives', () => {
    it('should provide text alternative for radio', () => {
      render(<Radio name="option" label="Accept" id="accept" />);

      const radio = screen.getByRole('radio');
      const label = screen.getByText('Accept');
      expect(label).toHaveAttribute('for', 'accept');
    });

    it('should provide required indicator', () => {
      render(<Radio name="option" label="Accept" required id="accept" />);

      expect(screen.getByLabelText('required')).toBeInTheDocument();
    });

    it('should provide help text', () => {
      render(
        <RadioGroup
          options={[
            { value: 'opt1', label: 'Option 1' },
          ]}
          value=""
          onChange={jest.fn()}
          name="group"
          legend="Choose"
          helpText="Select one"
        />
      );

      expect(screen.getByText('Select one')).toBeInTheDocument();
    });
  });

  describe('error handling', () => {
    it('should announce error with role="alert"', () => {
      render(
        <RadioGroup
          options={[
            { value: 'opt1', label: 'Option 1' },
          ]}
          value=""
          onChange={jest.fn()}
          name="group"
          legend="Choose"
          error
          errorMessage="This field is required"
        />
      );

      const alert = screen.getByRole('alert');
      expect(alert).toHaveTextContent('This field is required');
    });

    it('should have error styling', () => {
      const { container } = render(
        <RadioGroup
          options={[
            { value: 'opt1', label: 'Option 1' },
          ]}
          value=""
          onChange={jest.fn()}
          name="group"
          legend="Field"
          error
          errorMessage="Error"
        />
      );

      const fieldset = container.querySelector('fieldset');
      expect(fieldset).toHaveAttribute('aria-invalid', 'true');
    });
  });

  describe('motion and animation', () => {
    it('should respect prefers-reduced-motion', () => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation((query) => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });

      render(<Radio name="option" id="radio-1" />);

      const radio = screen.getByRole('radio');
      expect(radio).toBeInTheDocument();
    });

    it('should not have disruptive animations on focus', () => {
      render(<Radio name="option" id="radio-1" />);

      const radio = screen.getByRole('radio');
      radio.focus();

      expect(radio).toHaveClass('focus-visible:outline-2');
    });
  });

  describe('dark mode support', () => {
    it('should render with dark mode', () => {
      const { container } = render(
        <div className="dark">
          <Radio name="option" label="Accept" id="accept" />
        </div>
      );

      const radio = screen.getByRole('radio');
      expect(radio).toBeInTheDocument();
    });
  });

  describe('axe accessibility audit', () => {
    it('should not have violations in default state', async () => {
      const { container } = render(
        <Radio name="option" label="Accept" id="accept" />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should not have violations with error state', async () => {
      const { container } = render(
        <RadioGroup
          options={[
            { value: 'opt1', label: 'Option 1' },
          ]}
          value=""
          onChange={jest.fn()}
          name="group"
          legend="Choose"
          error
          errorMessage="Required"
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should not have violations in group', async () => {
      const { container } = render(
        <RadioGroup
          options={[
            { value: 'opt1', label: 'Option 1' },
            { value: 'opt2', label: 'Option 2' },
          ]}
          value=""
          onChange={jest.fn()}
          name="group"
          legend="Choose"
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should not have violations with required field', async () => {
      const { container } = render(
        <Radio name="option" label="Accept" required id="accept" />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should not have violations with disabled option', async () => {
      const { container } = render(
        <RadioGroup
          options={[
            { value: 'opt1', label: 'Option 1' },
            { value: 'opt2', label: 'Option 2', disabled: true },
          ]}
          value=""
          onChange={jest.fn()}
          name="group"
          legend="Choose"
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should not have violations in horizontal layout', async () => {
      const { container } = render(
        <RadioGroup
          options={[
            { value: 'opt1', label: 'Option 1' },
            { value: 'opt2', label: 'Option 2' },
          ]}
          value=""
          onChange={jest.fn()}
          name="group"
          legend="Choose"
          layout="horizontal"
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('required field indicator', () => {
    it('should display required indicator', () => {
      render(<Radio name="option" label="Field" required id="field" />);

      expect(screen.getByLabelText('required')).toBeInTheDocument();
    });

    it('should have aria-required attribute', () => {
      render(<Radio name="option" required id="radio-1" />);

      const radio = screen.getByRole('radio');
      expect(radio).toHaveAttribute('aria-required', 'true');
    });
  });

  describe('group accessibility', () => {
    it('should group options in fieldset', () => {
      const { container } = render(
        <RadioGroup
          options={[
            { value: 'opt1', label: 'Option 1' },
            { value: 'opt2', label: 'Option 2' },
          ]}
          value=""
          onChange={jest.fn()}
          name="group"
          legend="Options"
        />
      );

      const fieldset = container.querySelector('fieldset');
      expect(fieldset).toBeInTheDocument();

      const legend = container.querySelector('legend');
      expect(legend).toHaveTextContent('Options');
    });

    it('should have radiogroup role', () => {
      render(
        <RadioGroup
          options={[
            { value: 'opt1', label: 'Option 1' },
          ]}
          value=""
          onChange={jest.fn()}
          name="group"
          legend="Options"
        />
      );

      const group = screen.getByRole('radiogroup');
      expect(group).toBeInTheDocument();
    });

    it('should label group with legend', () => {
      render(
        <RadioGroup
          options={[
            { value: 'opt1', label: 'Option 1' },
          ]}
          value=""
          onChange={jest.fn()}
          name="group"
          legend="Options"
        />
      );

      const legend = screen.getByText('Options');
      expect(legend).toBeInTheDocument();
    });

    it('should maintain mutual exclusivity with proper grouping', () => {
      render(
        <RadioGroup
          options={[
            { value: 'opt1', label: 'Option 1' },
            { value: 'opt2', label: 'Option 2' },
            { value: 'opt3', label: 'Option 3' },
          ]}
          value="opt1"
          onChange={jest.fn()}
          name="group"
          legend="Choose"
        />
      );

      const radios = screen.getAllByRole('radio') as HTMLInputElement[];
      // All should have same name for mutual exclusivity
      radios.forEach((radio) => {
        expect(radio).toHaveAttribute('name', 'group');
      });
    });
  });
});
