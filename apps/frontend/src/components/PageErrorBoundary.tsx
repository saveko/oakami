'use client';

import React, { ReactNode } from 'react';
import { ErrorBoundary } from './ErrorBoundary';

export interface PageErrorBoundaryProps {
  children: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

/**
 * Full-page boundary for the root layout: a failure here means nothing below it
 * rendered, so the fallback takes over the viewport. Wrap individual page
 * sections in `ErrorBoundary` instead, so one broken widget does not blank the
 * whole screen.
 */
export function PageErrorBoundary({ children, onError }: PageErrorBoundaryProps) {
  return (
    <ErrorBoundary variant="page" onError={onError}>
      {children}
    </ErrorBoundary>
  );
}

export default PageErrorBoundary;
