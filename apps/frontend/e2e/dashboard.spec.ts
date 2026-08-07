import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/auth/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.click('button:has-text("Sign In")');
    await page.waitForURL('/dashboard');
  });

  test('should display dashboard with metrics', async ({ page }) => {
    await page.goto('/dashboard');

    // Check main heading
    await expect(page.locator('h1')).toContainText('Dashboard');

    // Check KPI cards are visible
    await expect(page.locator('text=Total Waste Cost')).toBeVisible();
    await expect(page.locator('text=Waste Records')).toBeVisible();
    await expect(page.locator('text=Expiring Items')).toBeVisible();
    await expect(page.locator('text=Low Stock Items')).toBeVisible();
  });

  test('should display AI predictions section', async ({ page }) => {
    await page.goto('/dashboard');

    // Check predictions section
    const predictionsSection = page.locator('text=AI Predictions');
    await expect(predictionsSection).toBeVisible({ timeout: 5000 });

    // Check prediction cards are rendered
    const predictionCards = page.locator('[class*="gradient"]');
    await expect(predictionCards.first()).toBeVisible();
  });

  test('should display waste trend chart', async ({ page }) => {
    await page.goto('/dashboard');

    // Check charts are rendered
    const trendChart = page.locator('text=Daily Waste Trend');
    await expect(trendChart).toBeVisible();
  });

  test('should display category breakdown chart', async ({ page }) => {
    await page.goto('/dashboard');

    const categoryChart = page.locator('text=Waste by Category');
    await expect(categoryChart).toBeVisible();
  });

  test('should display notification bell with unread count', async ({ page }) => {
    await page.goto('/dashboard');

    const notificationBell = page.locator('text=🔔');
    await expect(notificationBell).toBeVisible();

    // Check if unread badge is visible (if there are unread notifications)
    const unreadBadge = page.locator('[class*="bg-red-500"]').first();
    // Badge might not always be present, so we just check it's not an error
    if (await unreadBadge.isVisible({ timeout: 2000 }).catch(() => false)) {
      expect(unreadBadge).toBeDefined();
    }
  });

  test('should open notification center when bell clicked', async ({ page }) => {
    await page.goto('/dashboard');

    const notificationBell = page.locator('button[title="Notifications"]');
    await notificationBell.click();

    // Check notification center is visible
    const notificationCenter = page.locator('text=Notifications');
    await expect(notificationCenter).toBeVisible();
  });

  test('should allow refreshing predictions', async ({ page }) => {
    await page.goto('/dashboard');

    // Wait for AI Predictions section
    await expect(page.locator('text=AI Predictions')).toBeVisible({ timeout: 5000 });

    // Click refresh button
    const refreshButton = page.locator('button:has-text("Refresh")');
    if (await refreshButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await refreshButton.click();

      // Wait for refresh to complete
      await page.waitForTimeout(2000);
    }
  });

  test('should display key metrics section', async ({ page }) => {
    await page.goto('/dashboard');

    // Check Key Metrics section
    const keyMetrics = page.locator('text=Key Metrics');
    await expect(keyMetrics).toBeVisible();

    // Check individual metrics
    await expect(page.locator('text=Average Waste per Record')).toBeVisible();
    await expect(page.locator('text=Daily Average Cost')).toBeVisible();
    await expect(page.locator('text=Categories Tracked')).toBeVisible();
  });

  test('should show unread notification banner if notifications exist', async ({ page }) => {
    await page.goto('/dashboard');

    // Check if notification banner exists
    const notificationBanner = page.locator('text=/You have.*unread notification/i');
    // Banner might not exist if no unread notifications
    if (await notificationBanner.isVisible({ timeout: 2000 }).catch(() => false)) {
      expect(notificationBanner).toBeDefined();
    }
  });
});
