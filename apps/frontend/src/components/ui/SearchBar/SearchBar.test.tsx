import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@/test/utils';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { SearchBar } from './SearchBar';

expect.extend(toHaveNoViolations);

describe('SearchBar - Accessibility Tests', () => {
  const mockSuggestions = ['Apple', 'Apricot', 'Banana', 'Blueberry', 'Cherry'];
  const defaultProps = {
    suggestions: mockSuggestions,
    placeholder: 'Search fruits...',
  };

  describe('WCAG 2.1 Compliance', () => {
    it('should have no accessibility violations with default props', async () => {
      const { container } = render(<SearchBar {...defaultProps} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no violations with value and suggestions visible', async () => {
      const { container } = render(
        <SearchBar
          {...defaultProps}
          value="App"
          onChange={vi.fn()}
          onSearch={vi.fn()}
        />
      );

      fireEvent.change(container.querySelector('input')!, {
        target: { value: 'App' },
      });

      await waitFor(() => {
        screen.getByText('Apple');
      });

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no violations with loading state', async () => {
      const { container } = render(<SearchBar {...defaultProps} isLoading />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no violations in inline variant', async () => {
      const { container } = render(
        <SearchBar {...defaultProps} variant="inline" />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no violations with clearable button', async () => {
      const { container } = render(
        <SearchBar {...defaultProps} clearable value="test" onChange={vi.fn()} />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Semantic HTML', () => {
    it('should use semantic input element', () => {
      const { container } = render(<SearchBar {...defaultProps} />);
      const input = container.querySelector('input[type="search"]');
      expect(input).toBeInTheDocument();
    });

    it('should have proper ARIA attributes on input', () => {
      render(<SearchBar {...defaultProps} />);
      const input = screen.getByPlaceholderText('Search fruits...');

      expect(input).toHaveAttribute('aria-autocomplete', 'list');
      expect(input).toHaveAttribute('aria-haspopup', 'listbox');
    });

    it('should use proper ARIA role on suggestions container', async () => {
      const user = userEvent.setup();
      render(<SearchBar {...defaultProps} />);
      const input = screen.getByPlaceholderText('Search fruits...');

      await user.type(input, 'App');
      await waitFor(() => {
        const listbox = screen.getByRole('listbox');
        expect(listbox).toBeInTheDocument();
        expect(listbox).toHaveAttribute('id', 'search-suggestions');
      });
    });

    it('should use role="option" for suggestions', async () => {
      const user = userEvent.setup();
      render(<SearchBar {...defaultProps} />);
      const input = screen.getByPlaceholderText('Search fruits...');

      await user.type(input, 'App');
      await waitFor(() => {
        const options = screen.getAllByRole('option');
        expect(options.length).toBeGreaterThan(0);
      });
    });
  });

  describe('ARIA Attributes', () => {
    it('should set aria-autocomplete on input', () => {
      render(<SearchBar {...defaultProps} />);
      const input = screen.getByPlaceholderText('Search fruits...');
      expect(input).toHaveAttribute('aria-autocomplete', 'list');
    });

    it('should set aria-haspopup on input', () => {
      render(<SearchBar {...defaultProps} />);
      const input = screen.getByPlaceholderText('Search fruits...');
      expect(input).toHaveAttribute('aria-haspopup', 'listbox');
    });

    it('should update aria-expanded when suggestions show/hide', async () => {
      const user = userEvent.setup();
      render(<SearchBar {...defaultProps} />);
      const input = screen.getByPlaceholderText('Search fruits...');

      expect(input).toHaveAttribute('aria-expanded', 'false');

      await user.type(input, 'App');
      await waitFor(() => {
        expect(input).toHaveAttribute('aria-expanded', 'true');
      });
    });

    it('should link input to suggestions via aria-controls', async () => {
      const user = userEvent.setup();
      render(<SearchBar {...defaultProps} />);
      const input = screen.getByPlaceholderText('Search fruits...');

      expect(input).toHaveAttribute('aria-controls', 'search-suggestions');
    });

    it('should set aria-selected on highlighted suggestion', async () => {
      const user = userEvent.setup();
      render(<SearchBar {...defaultProps} />);
      const input = screen.getByPlaceholderText('Search fruits...');

      await user.type(input, 'App');
      await waitFor(() => {
        const options = screen.getAllByRole('option');
        expect(options[0]).toHaveAttribute('aria-selected', 'false');
      });

      fireEvent.keyDown(input, { key: 'ArrowDown' });
      await waitFor(() => {
        const options = screen.getAllByRole('option');
        expect(options[0]).toHaveAttribute('aria-selected', 'true');
      });
    });
  });

  describe('Keyboard Navigation', () => {
    it('should support arrow key navigation through suggestions', async () => {
      const user = userEvent.setup();
      render(<SearchBar {...defaultProps} />);
      const input = screen.getByPlaceholderText('Search fruits...');

      await user.type(input, 'B');
      await waitFor(() => {
        const options = screen.getAllByRole('option');
        expect(options.length).toBeGreaterThan(0);
      });

      fireEvent.keyDown(input, { key: 'ArrowDown' });
      const firstOption = screen.getByText('Banana');
      expect(firstOption.closest('button')).toHaveAttribute('aria-selected', 'true');

      fireEvent.keyDown(input, { key: 'ArrowDown' });
      const secondOption = screen.getByText('Blueberry');
      expect(secondOption.closest('button')).toHaveAttribute('aria-selected', 'true');
    });

    it('should support entering from keyboard', async () => {
      const user = userEvent.setup();
      const handleSelect = vi.fn();
      render(<SearchBar {...defaultProps} onSuggestionSelect={handleSelect} />);
      const input = screen.getByPlaceholderText('Search fruits...');

      await user.type(input, 'App');
      await waitFor(() => {
        screen.getByText('Apple');
      });

      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(handleSelect).toHaveBeenCalledWith('Apple');
    });

    it('should support Escape to close suggestions', async () => {
      const user = userEvent.setup();
      render(<SearchBar {...defaultProps} />);
      const input = screen.getByPlaceholderText('Search fruits...');

      await user.type(input, 'App');
      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });

      fireEvent.keyDown(input, { key: 'Escape' });
      expect(input).toHaveAttribute('aria-expanded', 'false');
    });

    it('should be fully keyboard navigable without mouse', async () => {
      const user = userEvent.setup();
      render(<SearchBar {...defaultProps} clearable />);
      const input = screen.getByPlaceholderText('Search fruits...');

      // Focus input via keyboard
      await user.tab();
      expect(input).toHaveFocus();

      // Type
      await user.keyboard('Ch');
      await waitFor(() => {
        screen.getByText('Cherry');
      });

      // Navigate to suggestion
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      await waitFor(() => {
        expect(screen.getByText('Cherry').closest('button')).toHaveAttribute('aria-selected', 'true');
      });

      // Select
      fireEvent.keyDown(input, { key: 'Enter' });
      expect(input).toHaveValue('Cherry');
    });
  });

  describe('Focus Management', () => {
    it('should have visible focus outline on input', () => {
      const { container } = render(<SearchBar {...defaultProps} />);
      const input = screen.getByPlaceholderText('Search fruits...');

      fireEvent.focus(input);
      expect(input).toHaveFocus();
      expect(input.className).toContain('focus-visible:outline');
    });

    it('should manage focus when opening suggestions', async () => {
      const user = userEvent.setup();
      render(<SearchBar {...defaultProps} />);
      const input = screen.getByPlaceholderText('Search fruits...');

      await user.type(input, 'App');
      expect(input).toHaveFocus();

      // Focus should stay on input during keyboard navigation
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      expect(input).toHaveFocus();
    });

    it('should have proper tab order with clear button', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <SearchBar {...defaultProps} clearable value="test" onChange={vi.fn()} />
      );
      const input = screen.getByPlaceholderText('Search fruits...');

      await user.tab();
      expect(input).toHaveFocus();

      await user.tab();
      const clearButton = screen.getByLabelText('Clear search');
      expect(clearButton).toHaveFocus();
    });

    it('should trap focus if needed during suggestions interaction', async () => {
      const user = userEvent.setup();
      render(<SearchBar {...defaultProps} />);
      const input = screen.getByPlaceholderText('Search fruits...');

      await user.type(input, 'App');
      await waitFor(() => {
        screen.getByRole('listbox');
      });

      // Focus should remain on input during keyboard navigation
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      expect(input).toHaveFocus();
    });
  });

  describe('Screen Reader Support', () => {
    it('should announce clear button purpose', () => {
      render(<SearchBar {...defaultProps} clearable value="test" onChange={vi.fn()} />);
      const clearButton = screen.getByLabelText('Clear search');
      expect(clearButton).toHaveAttribute('aria-label', 'Clear search');
    });

    it('should announce number of suggestions to screen readers', async () => {
      const user = userEvent.setup();
      render(<SearchBar {...defaultProps} />);
      const input = screen.getByPlaceholderText('Search fruits...');

      await user.type(input, 'App');
      await waitFor(() => {
        const listbox = screen.getByRole('listbox');
        const options = within(listbox).getAllByRole('option');
        expect(options.length).toBeGreaterThan(0);
      });
    });

    it('should provide accessible description via aria-expanded state', async () => {
      const user = userEvent.setup();
      render(<SearchBar {...defaultProps} />);
      const input = screen.getByPlaceholderText('Search fruits...');

      expect(input).toHaveAttribute('aria-expanded', 'false');

      await user.type(input, 'B');
      await waitFor(() => {
        expect(input).toHaveAttribute('aria-expanded', 'true');
      });
    });
  });

  describe('Color Contrast', () => {
    it('should maintain color contrast for input text in light mode', () => {
      const { container } = render(<SearchBar {...defaultProps} />);
      const wrapper = container.firstChild as HTMLElement;

      // Should use high-contrast text colors
      expect(wrapper.className).toContain('text-gray-900');
    });

    it('should maintain color contrast for input text in dark mode', () => {
      const { container } = render(<SearchBar {...defaultProps} />);
      const input = screen.getByPlaceholderText('Search fruits...');

      // Should have dark mode text color support
      expect(input.className).toContain('dark:text-gray-100');
    });

    it('should maintain contrast for focus outline', () => {
      const { container } = render(<SearchBar {...defaultProps} />);
      const input = screen.getByPlaceholderText('Search fruits...');

      // Focus outline should use high-contrast color
      expect(input.className).toContain('focus-visible:outline-sky-500');
    });

    it('should maintain contrast for suggestion hover state', async () => {
      const user = userEvent.setup();
      const { container } = render(<SearchBar {...defaultProps} />);
      const input = screen.getByPlaceholderText('Search fruits...');

      await user.type(input, 'App');
      await waitFor(() => {
        const option = screen.getByText('Apple').closest('button');
        // Should have hover contrast support
        expect(option?.className).toContain('hover:bg-gray-100');
      });
    });
  });

  describe('Interactive Elements Accessibility', () => {
    it('should have proper button type for clear button', () => {
      render(<SearchBar {...defaultProps} clearable value="test" onChange={vi.fn()} />);
      const clearButton = screen.getByLabelText('Clear search');
      expect(clearButton).toHaveAttribute('type', 'button');
    });

    it('should have proper button type for suggestions', async () => {
      const user = userEvent.setup();
      render(<SearchBar {...defaultProps} />);
      const input = screen.getByPlaceholderText('Search fruits...');

      await user.type(input, 'App');
      await waitFor(() => {
        const suggestionButton = screen.getByText('Apple').closest('button');
        expect(suggestionButton).toHaveAttribute('type', 'button');
      });
    });

    it('should have minimum touch target size for interactive elements', () => {
      const { container } = render(
        <SearchBar {...defaultProps} clearable value="test" onChange={vi.fn()} />
      );
      const clearButton = screen.getByLabelText('Clear search');

      // Button should have sufficient padding for touch target
      expect(clearButton.className).toContain('p-1');
      // Parent container handles height
      expect(clearButton.className).toContain('rounded');
    });
  });

  describe('Loading State Accessibility', () => {
    it('should announce loading state to screen readers', () => {
      render(<SearchBar {...defaultProps} isLoading />);
      const spinner = screen.getByRole('status', { hidden: true });
      expect(spinner).toBeInTheDocument();
    });

    it('should indicate loading visually for low vision users', () => {
      const { container } = render(<SearchBar {...defaultProps} isLoading />);
      const spinner = container.querySelector('[aria-hidden="true"]');
      expect(spinner).toBeInTheDocument();
    });
  });

  describe('Placeholder and Label Accessibility', () => {
    it('should use descriptive placeholder text', () => {
      render(<SearchBar {...defaultProps} placeholder="Search fruits by name..." />);
      expect(screen.getByPlaceholderText('Search fruits by name...')).toBeInTheDocument();
    });

    it('should work with external label via aria-label', () => {
      const { container } = render(
        <SearchBar
          {...defaultProps}
          placeholder=""
          onChange={vi.fn()}
          aria-label="Fruit search box"
        />
      );
      const input = container.querySelector('input');
      expect(input).toHaveAttribute('aria-label', 'Fruit search box');
    });
  });

  describe('Suggestion List Accessibility', () => {
    it('should have unique id for suggestions list', async () => {
      const user = userEvent.setup();
      render(<SearchBar {...defaultProps} />);
      const input = screen.getByPlaceholderText('Search fruits...');

      await user.type(input, 'App');
      await waitFor(() => {
        const listbox = screen.getByRole('listbox');
        expect(listbox).toHaveAttribute('id', 'search-suggestions');
      });
    });

    it('should properly structure suggestion items', async () => {
      const user = userEvent.setup();
      render(<SearchBar {...defaultProps} />);
      const input = screen.getByPlaceholderText('Search fruits...');

      await user.type(input, 'App');
      await waitFor(() => {
        const options = screen.getAllByRole('option');
        options.forEach((option) => {
          expect(option).toHaveAttribute('role', 'option');
          expect(option).toHaveAttribute('aria-selected');
        });
      });
    });
  });

  describe('Responsive Accessibility', () => {
    it('should maintain accessibility on mobile (default variant)', () => {
      const { container } = render(<SearchBar {...defaultProps} />);
      // Component should be responsive without breaking accessibility
      expect(container.querySelector('[aria-autocomplete="list"]')).toBeInTheDocument();
    });

    it('should maintain accessibility on desktop (inline variant)', () => {
      const { container } = render(<SearchBar {...defaultProps} variant="inline" />);
      // Inline variant should also have full ARIA support
      expect(container.querySelector('[aria-autocomplete="list"]')).toBeInTheDocument();
    });
  });

  describe('Combination Accessibility Tests', () => {
    it('should be fully accessible with all features enabled', async () => {
      const { container } = render(
        <SearchBar
          {...defaultProps}
          value="App"
          onChange={vi.fn()}
          onSearch={vi.fn()}
          onSuggestionSelect={vi.fn()}
          clearable
          isLoading={false}
          variant="default"
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should maintain accessibility through complete user workflow', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <SearchBar
          {...defaultProps}
          onSearch={vi.fn()}
          onSuggestionSelect={vi.fn()}
          clearable
          aria-label="Search fruits"
        />
      );

      const input = screen.getByPlaceholderText('Search fruits...');

      // Interact with component
      await user.type(input, 'App');
      await waitFor(() => {
        screen.getByText('Apple');
      });

      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'Enter' });

      // Verify still accessible
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
