import type { Metadata } from 'next';
import AuthProvider from '@/components/AuthProvider';
import ErrorBoundary from '@/components/ErrorBoundary';
import QueryProvider from '@/components/QueryProvider';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'Oakami - Waste Intelligence System',
  description: 'Enterprise-grade restaurant food waste intelligence system',
  viewport: 'width=device-width, initial-scale=1.0',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body>
        <ErrorBoundary>
          <QueryProvider>
            <AuthProvider>{children}</AuthProvider>
          </QueryProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
