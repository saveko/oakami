import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@/test/utils';
import { ErrorBoundary } from './ErrorBoundary';
import { PageErrorBoundary } from './PageErrorBoundary';

/** Throws on demand so a boundary has something to catch. */
function Boom({ shouldThrow = true }: { shouldThrow?: boolean }) {
  if (shouldThrow) {
    throw new Error('kaboom');
  }
  return <div>recovered content</div>;
}

describe('ErrorBoundary', () => {
  let consoleError: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // React logs caught errors to console.error; silence it so the output of a
    // passing run stays readable.
    consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleError.mockRestore();
  });

  it('renders its children when nothing throws', () => {
    render(
      <ErrorBoundary>
        <div>healthy content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('healthy content')).toBeInTheDocument();
  });

  it('renders a fallback instead of propagating the error', () => {
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/Something went wrong/)).toBeInTheDocument();
  });

  it('names the failing region so the user knows what broke', () => {
    render(
      <ErrorBoundary name="Charts">
        <Boom />
      </ErrorBoundary>
    );

    expect(screen.getByText('Charts could not be displayed')).toBeInTheDocument();
  });

  it('keeps sibling content rendered when one section fails', () => {
    render(
      <div>
        <ErrorBoundary name="Broken section">
          <Boom />
        </ErrorBoundary>
        <div>sibling still here</div>
      </div>
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('sibling still here')).toBeInTheDocument();
  });

  it('calls onError with the error and component stack', () => {
    const onError = vi.fn();

    render(
      <ErrorBoundary onError={onError}>
        <Boom />
      </ErrorBoundary>
    );

    expect(onError).toHaveBeenCalledTimes(1);
    const [error, errorInfo] = onError.mock.calls[0];
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('kaboom');
    expect(errorInfo).toHaveProperty('componentStack');
  });

  it('recovers in place when retried, without reloading', () => {
    function Harness() {
      const [shouldThrow, setShouldThrow] = React.useState(true);
      return (
        <>
          <button onClick={() => setShouldThrow(false)}>fix it</button>
          <ErrorBoundary>
            <Boom shouldThrow={shouldThrow} />
          </ErrorBoundary>
        </>
      );
    }

    render(<Harness />);
    expect(screen.getByRole('alert')).toBeInTheDocument();

    // Resolve the underlying cause, then clear the boundary.
    fireEvent.click(screen.getByRole('button', { name: 'fix it' }));
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));

    expect(screen.getByText('recovered content')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('renders a custom fallback when one is supplied', () => {
    render(
      <ErrorBoundary fallback={<div>custom fallback</div>}>
        <Boom />
      </ErrorBoundary>
    );

    expect(screen.getByText('custom fallback')).toBeInTheDocument();
    expect(screen.queryByText(/Something went wrong/)).not.toBeInTheDocument();
  });

  it('does not take over the viewport in the section variant', () => {
    const { container } = render(
      <ErrorBoundary variant="section">
        <Boom />
      </ErrorBoundary>
    );

    expect(container.querySelector('.min-h-screen')).not.toBeInTheDocument();
  });
});

describe('PageErrorBoundary', () => {
  let consoleError: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleError.mockRestore();
  });

  it('renders its children when nothing throws', () => {
    render(
      <PageErrorBoundary>
        <div>page content</div>
      </PageErrorBoundary>
    );

    expect(screen.getByText('page content')).toBeInTheDocument();
  });

  it('fills the viewport when the page fails', () => {
    const { container } = render(
      <PageErrorBoundary>
        <Boom />
      </PageErrorBoundary>
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(container.querySelector('.min-h-screen')).toBeInTheDocument();
  });
});
