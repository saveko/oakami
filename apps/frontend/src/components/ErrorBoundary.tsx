'use client';

import React, { ReactNode } from 'react';
import { Error as ErrorDisplay } from '@/components/ui';

export interface ErrorBoundaryProps {
  children: ReactNode;
  /**
   * `section` keeps the failure contained to the region it wraps so the rest of
   * the page stays usable. `page` fills the viewport and is intended for the
   * root boundary only.
   */
  variant?: 'section' | 'page';
  /** Label used in the fallback so the user knows what failed. */
  name?: string;
  /** Replaces the default fallback entirely. */
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

/**
 * React has no hook equivalent for error boundaries, so this stays a class.
 */
export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.props.onError?.(error, errorInfo);

    if (process.env.NODE_ENV !== 'production') {
      console.error('Error caught by boundary:', error, errorInfo);
    }
  }

  /**
   * Clearing the error re-renders the subtree. A transient failure recovers in
   * place, without discarding the rest of the page's state to a full reload.
   */
  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    if (this.props.fallback) {
      return this.props.fallback;
    }

    const { variant = 'section', name } = this.props;
    const title = name ? `${name} could not be displayed` : 'Something went wrong';

    const fallback = (
      <ErrorDisplay
        variant="card"
        severity="error"
        title={title}
        message="An unexpected error occurred. You can retry without leaving the page."
        details={
          process.env.NODE_ENV !== 'production'
            ? this.state.error?.message
            : undefined
        }
        action={{ label: 'Retry', onClick: this.handleRetry }}
      />
    );

    if (variant === 'page') {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 dark:bg-gray-950">
          <div className="w-full max-w-md">{fallback}</div>
        </div>
      );
    }

    return <div className="w-full py-4">{fallback}</div>;
  }
}

export default ErrorBoundary;
