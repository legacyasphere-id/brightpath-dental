import { test, expect } from '@playwright/test';

test.describe('Admin Panel', () => {
  test('unauthenticated access to /admin redirects to login', async ({ page }) => {
    await page.goto('/admin');
    // Should redirect to /admin/login or show login form
    await page.waitForURL(/admin.*login|login/i, { timeout: 5000 }).catch(() => {});
    const url = page.url();
    const hasLoginInUrl = url.includes('login');
    const hasLoginForm = await page.locator('input[type="email"], input[type="password"]').first().isVisible().catch(() => false);
    expect(hasLoginInUrl || hasLoginForm).toBeTruthy();
  });

  test('admin login page has email and password fields', async ({ page }) => {
    await page.goto('/admin/login');
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
  });
});
