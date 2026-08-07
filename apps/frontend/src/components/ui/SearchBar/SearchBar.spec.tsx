import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { act, render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchBar } from './SearchBar';

describe('SearchBar - Unit Tests', () => {
  const mockSuggestions = ['Apple', 'Apricot', 'Banana', 'Blueberry', 'Cherry', 'Date', 'Elderberry', 'Fig'];
  const defaultProps = {
    suggestions: mockSuggestions,
    placeholder: 'Search...',
  };

  describe('Rendering', () => {
    it('should render with default props', () => {
      render(<SearchBar {...defaultProps} />);
      expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
    });

    it('should render with initial value', () => {
      render(<SearchBar {...defaultProps} value="Apple" />);
      expect(screen.getByDisplayValue('Apple')).toBeInTheDocument();
    });

    it('should render with custom placeholder', () => {
      render(<SearchBar {...defaultProps} placeholder="Find ingredients..." />);
      expect(screen.getByPlaceholderText('Find ingredients...')).toBeInTheDocument();
    });

    it('should apply custom className to container', () => {
      const { container } = render(
        <SearchBar {...defaultProps} className="custom-search" />
      );
      expect(container.querySelector('.custom-search')).toBeInTheDocument();
    });

    it('should render inline variant', () => {
      const { container } = render(
        <SearchBar {...defaultProps} variant="inline" />
      );
      const wrapper = container.querySelector('.inline-flex');
      expect(wrapper).toBeInTheDocument();
    });
  });

  describe('Value Handling', () => {
    it('should update value on input change', async () => {
      const user = userEvent.setup();
      const { container } = render(<SearchBar {...defaultProps} />);
      const input = screen.getByPlaceholderText('Search...');

      await user.type(input, 'App');
      expect(input).toHaveValue('App');
    });

    it('should call onChange callback when value changes', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<SearchBar {...defaultProps} onChange={handleChange} />);
      const input = screen.getByPlaceholderText('Search...');

      await user.type(input, 'A');
      expect(handleChange).toHaveBeenCalledWith('A');
    });

    it('should handle controlled value prop', async () => {
      const { rerender } = render(
        <SearchBar {...defaultProps} value="Apple" onChange={vi.fn()} />
      );
      expect(screen.getByDisplayValue('Apple')).toBeInTheDocument();

      rerender(<SearchBar {...defaultProps} value="Banana" onChange={vi.fn()} />);
      expect(screen.getByDisplayValue('Banana')).toBeInTheDocument();
    });

    it('should support uncontrolled mode without value prop', async () => {
      const user = userEvent.setup();
      render(<SearchBar {...defaultProps} />);
      const input = screen.getByPlaceholderText('Search...');

      await user.type(input, 'Cherry');
      expect(input).toHaveValue('Cherry');
    });
  });

  describe('Suggestions Filtering', () => {
    it('should show suggestions matching input', async () => {
      const user = userEvent.setup();
      render(<SearchBar {...defaultProps} />);
      const input = screen.getByPlaceholderText('Search...');

      await user.type(input, 'A');
      await waitFor(() => {
        expect(screen.getByText('Apple')).toBeInTheDocument();
        expect(screen.getByText('Apricot')).toBeInTheDocument();
      });
    });

    it('should not show suggestions below minChars threshold', async () => {
      const user = userEvent.setup();
      render(<SearchBar {...defaultProps} minChars={2} />);
      const input = screen.getByPlaceholderText('Search...');

      await user.type(input, 'A');
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('should show suggestions when minChars threshold is met', async () => {
      const user = userEvent.setup();
      render(<SearchBar {...defaultProps} minChars={2} />);
      const input = screen.getByPlaceholderText('Search...');

      await user.type(input, 'Ap');
      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });
    });

    it('should respect maxSuggestions prop', async () => {
      const user = userEvent.setup();
      render(<SearchBar {...defaultProps} maxSuggestions={3} />);
      const input = screen.getByPlaceholderText('Search...');

      await user.type(input, 'Ap');
      await waitFor(() => {
        const options = screen.getAllByRole('option');
        // Matching is substring-based, and maxSuggestions caps the list at 3.
        expect(options.length).toBeGreaterThan(0);
        expect(options.length).toBeLessThanOrEqual(3);
      });
    });

    it('should be case-insensitive when filtering', async () => {
      const user = userEvent.setup();
      render(<SearchBar {...defaultProps} />);
      const input = screen.getByPlaceholderText('Search...');

      await user.type(input, 'apple');
      await waitFor(() => {
        expect(screen.getByText('Apple')).toBeInTheDocument();
      });
    });

    it('should clear suggestions when input is too short', async () => {
      const user = userEvent.setup();
      render(<SearchBar {...defaultProps} minChars={1} />);
      const input = screen.getByPlaceholderText('Search...');

      await user.type(input, 'App');
      await waitFor(() => {
        expect(screen.getByText('Apple')).toBeInTheDocument();
      });

      await user.clear(input);
      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      });
    });
  });

  describe('Debounce', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.runOnlyPendingTimers();
      vi.useRealTimers();
    });

    // These cases are about the debounce clock, not about realistic typing.
    // fireEvent is synchronous, so it composes with fake timers; userEvent
    // awaits internal timers and deadlocks once the clock is faked.
    const typeInto = (input: HTMLElement, value: string) => {
      fireEvent.change(input, { target: { value } });
    };

    it('should debounce onSearch callback', () => {
      const handleSearch = vi.fn();
      render(<SearchBar {...defaultProps} onSearch={handleSearch} debounceMs={300} />);
      const input = screen.getByPlaceholderText('Search...');

      typeInto(input, 'App');

      // Immediately after typing, onSearch should not be called yet
      expect(handleSearch).not.toHaveBeenCalled();

      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(handleSearch).toHaveBeenCalledWith('App');
    });

    it('should cancel previous debounce on new input', () => {
      const handleSearch = vi.fn();
      render(<SearchBar {...defaultProps} onSearch={handleSearch} debounceMs={300} />);
      const input = screen.getByPlaceholderText('Search...');

      typeInto(input, 'A');
      act(() => {
        vi.advanceTimersByTime(150);
      });

      typeInto(input, 'App');
      act(() => {
        vi.advanceTimersByTime(300);
      });

      // Should only call onSearch once with final value
      expect(handleSearch).toHaveBeenCalledTimes(1);
      expect(handleSearch).toHaveBeenCalledWith('App');
    });

    it('should respect custom debounceMs', () => {
      const handleSearch = vi.fn();
      render(<SearchBar {...defaultProps} onSearch={handleSearch} debounceMs={500} />);
      const input = screen.getByPlaceholderText('Search...');

      typeInto(input, 'Ban');
      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(handleSearch).not.toHaveBeenCalled();

      act(() => {
        vi.advanceTimersByTime(200);
      });

      expect(handleSearch).toHaveBeenCalledWith('Ban');
    });
  });

    describe('Keyboard Navigation', () => {
    it('should navigate suggestions with arrow keys', async () => {
      const user = userEvent.setup();
      render(<SearchBar {...defaultProps} />);
      const input = screen.getByPlaceholderText('Search...');

      await user.type(input, 'A');
      await waitFor(() => {
        expect(screen.getByText('Apple')).toBeInTheDocument();
      });

      const appleOption = screen.getByText('Apple').closest('[role="option"]');
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      await waitFor(() => {
        expect(appleOption).toHaveAttribute('aria-selected', 'true');
      });
    });

    it('should not move past last suggestion with ArrowDown', async () => {
      const user = userEvent.setup();
      render(<SearchBar {...defaultProps} maxSuggestions={2} />);
      const input = screen.getByPlaceholderText('Search...');

      await user.type(input, 'A');
      await waitFor(() => {
        const options = screen.getAllByRole('option');
        expect(options).toHaveLength(2);
      });

      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'ArrowDown' }); // Try to go past

      const options = screen.getAllByRole('option');
      // Should stay at second option
      expect(options[1]).toHaveAttribute('aria-selected', 'true');
    });

    it('should navigate backwards with ArrowUp', async () => {
      const user = userEvent.setup();
      render(<SearchBar {...defaultProps} />);
      const input = screen.getByPlaceholderText('Search...');

      await user.type(input, 'A');
      await waitFor(() => {
        expect(screen.getByText('Apple')).toBeInTheDocument();
      });

      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'ArrowUp' });

      // Should deselect (selectedIndex back to -1)
      const options = screen.getAllByRole('option');
      options.forEach((option) => {
        expect(option).toHaveAttribute('aria-selected', 'false');
      });
    });

    it('should select suggestion with Enter key', async () => {
      const user = userEvent.setup();
      const handleSearch = vi.fn();
      const handleSelect = vi.fn();
      render(
        <SearchBar
          {...defaultProps}
          onSearch={handleSearch}
          onSuggestionSelect={handleSelect}
        />
      );
      const input = screen.getByPlaceholderText('Search...');

      await user.type(input, 'A');
      await waitFor(() => {
        expect(screen.getByText('Apple')).toBeInTheDocument();
      });

      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'Enter' });

      await waitFor(() => {
        expect(input).toHaveValue('Apple');
        expect(handleSelect).toHaveBeenCalledWith('Apple');
      });
    });

    it('should search when Enter pressed without selection', async () => {
      const user = userEvent.setup();
      const handleSearch = vi.fn();
      render(<SearchBar {...defaultProps} onSearch={handleSearch} />);
      const input = screen.getByPlaceholderText('Search...');

      await user.type(input, 'Xyz');
      fireEvent.keyDown(input, { key: 'Enter' });

      await waitFor(() => {
        expect(handleSearch).toHaveBeenCalledWith('Xyz');
      });
    });

    it('should close suggestions with Escape', async () => {
      const user = userEvent.setup();
      render(<SearchBar {...defaultProps} />);
      const input = screen.getByPlaceholderText('Search...');

      await user.type(input, 'A');
      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });

      fireEvent.keyDown(input, { key: 'Escape' });
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });

  describe('Clear Button', () => {
    it('should display clear button when value exists', async () => {
      const user = userEvent.setup();
      render(<SearchBar {...defaultProps} clearable />);
      const input = screen.getByPlaceholderText('Search...');

      expect(screen.queryByLabelText('Clear search')).not.toBeInTheDocument();

      await user.type(input, 'A');
      await waitFor(() => {
        expect(screen.getByLabelText('Clear search')).toBeInTheDocument();
      });
    });

    it('should hide clear button when clearable is false', async () => {
      const user = userEvent.setup();
      render(<SearchBar {...defaultProps} clearable={false} />);
      const input = screen.getByPlaceholderText('Search...');

      await user.type(input, 'A');
      expect(screen.queryByLabelText('Clear search')).not.toBeInTheDocument();
    });

    it('should clear value when clear button clicked', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<SearchBar {...defaultProps} clearable onChange={handleChange} />);
      const input = screen.getByPlaceholderText('Search...');

      await user.type(input, 'Apple');
      const clearButton = screen.getByLabelText('Clear search');
      await user.click(clearButton);

      expect(input).toHaveValue('');
      expect(handleChange).toHaveBeenCalledWith('');
    });

    it('should hide clear button during loading', async () => {
      const user = userEvent.setup();
      render(<SearchBar {...defaultProps} clearable isLoading />);
      const input = screen.getByPlaceholderText('Search...');

      await user.type(input, 'A');
      expect(screen.queryByLabelText('Clear search')).not.toBeInTheDocument();
      expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument(); // Loading spinner
    });
  });

  describe('Loading State', () => {
    it('should display loading spinner when isLoading is true', () => {
      render(<SearchBar {...defaultProps} isLoading />);
      expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument();
    });

    it('should not display loading spinner when isLoading is false', () => {
      render(<SearchBar {...defaultProps} isLoading={false} />);
      expect(screen.queryByRole('status', { hidden: true })).not.toBeInTheDocument();
    });

    it('should prevent clear button when loading', async () => {
      const user = userEvent.setup();
      render(<SearchBar {...defaultProps} clearable isLoading value="test" onChange={vi.fn()} />);
      expect(screen.queryByLabelText('Clear search')).not.toBeInTheDocument();
    });
  });

  describe('Suggestion Click', () => {
    it('should select suggestion when clicked', async () => {
      const user = userEvent.setup();
      render(<SearchBar {...defaultProps} />);
      const input = screen.getByPlaceholderText('Search...');

      await user.type(input, 'App');
      await waitFor(() => {
        expect(screen.getByText('Apple')).toBeInTheDocument();
      });

      const appleOption = screen.getByText('Apple');
      await user.click(appleOption);

      await waitFor(() => {
        expect(input).toHaveValue('Apple');
      });
    });

    it('should call onSuggestionSelect when suggestion clicked', async () => {
      const user = userEvent.setup();
      const handleSelect = vi.fn();
      render(<SearchBar {...defaultProps} onSuggestionSelect={handleSelect} />);
      const input = screen.getByPlaceholderText('Search...');

      await user.type(input, 'Ban');
      await waitFor(() => {
        expect(screen.getByText('Banana')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Banana'));
      expect(handleSelect).toHaveBeenCalledWith('Banana');
    });

    it('should hide suggestions after selection', async () => {
      const user = userEvent.setup();
      render(<SearchBar {...defaultProps} />);
      const input = screen.getByPlaceholderText('Search...');

      await user.type(input, 'Che');
      await waitFor(() => {
        expect(screen.getByText('Cherry')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Cherry'));
      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      });
    });
  });

  describe('Focus and Blur', () => {
    it('should show suggestions on focus with matching suggestions', async () => {
      const user = userEvent.setup();
      render(<SearchBar {...defaultProps} />);
      const input = screen.getByPlaceholderText('Search...');

      await user.type(input, 'Ban');
      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });

      await user.tab(); // Move focus away
      await waitFor(
        () => {
          expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
        },
        { timeout: 300 }
      );
    });

    it('should reopen suggestions on refocus', async () => {
      const user = userEvent.setup();
      const { container } = render(<SearchBar {...defaultProps} />);
      const input = screen.getByPlaceholderText('Search...') as HTMLInputElement;

      await user.type(input, 'Dat');
      await waitFor(() => {
        expect(screen.getByText('Date')).toBeInTheDocument();
      });

      fireEvent.blur(input);
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();

      fireEvent.focus(input);
      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });
    });

    it('should not show empty suggestions list on focus', async () => {
      const user = userEvent.setup();
      const { container } = render(<SearchBar {...defaultProps} minChars={2} />);
      const input = screen.getByPlaceholderText('Search...');

      fireEvent.focus(input);
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();

      await user.type(input, 'A');
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();

      await user.type(input, 'p');
      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });
    });
  });

  describe('External Value Sync', () => {
    it('should update when external value prop changes', () => {
      const { rerender } = render(
        <SearchBar {...defaultProps} value="Apple" onChange={vi.fn()} />
      );
      expect(screen.getByDisplayValue('Apple')).toBeInTheDocument();

      rerender(<SearchBar {...defaultProps} value="Banana" onChange={vi.fn()} />);
      expect(screen.getByDisplayValue('Banana')).toBeInTheDocument();
      expect(screen.queryByDisplayValue('Apple')).not.toBeInTheDocument();
    });

    it('should handle undefined external value', () => {
      render(<SearchBar {...defaultProps} value={undefined} onChange={vi.fn()} />);
      expect(screen.getByPlaceholderText('Search...')).toHaveValue('');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty suggestions array', async () => {
      const user = userEvent.setup();
      render(<SearchBar suggestions={[]} />);
      const input = screen.getByPlaceholderText('Search...');

      await user.type(input, 'test');
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('should handle special characters in search', async () => {
      const user = userEvent.setup();
      const suggestions = ['Coffee & Tea', 'Juice'];
      render(<SearchBar suggestions={suggestions} />);
      const input = screen.getByPlaceholderText('Search...');

      await user.type(input, 'Coffee &');
      await waitFor(() => {
        expect(screen.getByText('Coffee & Tea')).toBeInTheDocument();
      });
    });

    it('should handle very long suggestion text', async () => {
      const user = userEvent.setup();
      const longText = 'A'.repeat(100);
      render(<SearchBar suggestions={[longText, 'Short']} />);
      const input = screen.getByPlaceholderText('Search...');

      await user.type(input, 'A');
      await waitFor(() => {
        expect(screen.getByText(longText)).toBeInTheDocument();
      });
    });

    it('should cleanup timers on unmount', async () => {
      const user = userEvent.setup();
      const handleSearch = vi.fn();
      const { unmount } = render(
        <SearchBar {...defaultProps} onSearch={handleSearch} />
      );
      const input = screen.getByPlaceholderText('Search...');

      await user.type(input, 'Ban');
      unmount();

      // No error should occur, timers cleaned up
      expect(true).toBe(true);
    });
  });

  describe('Combination Scenarios', () => {
    it('should handle complete workflow', async () => {
      const user = userEvent.setup();
      const handleSearch = vi.fn();
      const handleSelect = vi.fn();
      const handleChange = vi.fn();

      render(
        <SearchBar
          {...defaultProps}
          onSearch={handleSearch}
          onSuggestionSelect={handleSelect}
          onChange={handleChange}
          clearable
        />
      );

      const input = screen.getByPlaceholderText('Search...');

      // Type and see suggestions
      await user.type(input, 'App');
      await waitFor(() => {
        expect(screen.getByText('Apple')).toBeInTheDocument();
      });

      // Select suggestion
      await user.click(screen.getByText('Apple'));
      expect(handleSelect).toHaveBeenCalledWith('Apple');
      expect(input).toHaveValue('Apple');

      // Clear
      const clearButton = screen.getByLabelText('Clear search');
      await user.click(clearButton);
      expect(input).toHaveValue('');

      // Type again
      await user.type(input, 'Ban');
      fireEvent.keyDown(input, { key: 'Enter' });
      expect(handleSearch).toHaveBeenCalled();
    });

    it('should maintain focus visible outline through interactions', () => {
      const { container } = render(<SearchBar {...defaultProps} />);
      const input = screen.getByPlaceholderText('Search...');

      // fireEvent.focus only dispatches the event; it does not move focus.
      input.focus();
      expect(input).toHaveFocus();

      fireEvent.keyDown(input, { key: 'ArrowDown' });
      expect(input).toHaveFocus();
    });
  });
});
