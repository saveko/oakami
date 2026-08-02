import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/auth/login');

    await expect(page.locator('h1')).toContainText(/Sign In|Login/i);
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
  });

  test('should show error on invalid credentials', async ({ page }) => {
    await page.goto('/auth/login');

    await page.fill('input[name="email"]', 'invalid@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button:has-text("Sign In")');

    // Wait for error message
    await expect(
      page.locator('text=/Invalid|incorrect|failed/i'),
    ).toBeVisible({ timeout: 5000 });
  });

  test('should navigate to dashboard on successful login', async ({ page }) => {
    // Assuming test credentials are configured
    await page.goto('/auth/login');

    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.click('button:has-text("Sign In")');

    // Wait for navigation to dashboard
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 });
    await expect(page.locator('h1')).toContainText('Dashboard');
  });

  test('should display register page', async ({ page }) => {
    await page.goto('/auth/register');

    await expect(page.locator('h1')).toContainText(/Register|Sign Up/i);
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('input[name="firstName"]')).toBeVisible();
    await expect(page.locator('input[name="lastName"]')).toBeVisible();
  });

  test('should show validation errors on empty form submission', async ({ page }) => {
    await page.goto('/auth/register');

    await page.click('button:has-text("Register")');

    // Expect validation errors
    const errorElements = page.locator('[role="alert"]');
    await expect(errorElements.first()).toBeVisible({ timeout: 5000 });
  });
});
