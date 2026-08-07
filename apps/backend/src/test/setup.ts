/**
 * Jest test environment setup
 * Runs before all tests
 */

// Suppress NestJS debug logs during tests
process.env.NODE_ENV = 'test';

// Mock environment variables if not set
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/oakami_test';
}

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'test-secret-key';
}

// Add custom matchers if needed
expect.extend({});
