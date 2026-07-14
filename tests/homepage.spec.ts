import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('loads with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/BrightPath/i);
  });

  test('hero section is visible', async ({ page }) => {
    const hero = page.locator('section').first();
    await expect(hero).toBeVisible();
  });

  test('services section is visible', async ({ page }) => {
    await page.getByText(/layanan/i).or(page.getByText(/services/i)).first().waitFor();
  });

  test('doctors section is visible', async ({ page }) => {
    await page.getByText(/dokter/i).or(page.getByText(/doctors/i)).first().waitFor();
  });

  test('pricing section is visible', async ({ page }) => {
    await page.getByText(/harga/i).or(page.getByText(/pricing/i)).first().waitFor();
  });

  test('chat widget button is visible', async ({ page }) => {
    // ChatWidget.tsx renders a single floating button with aria-label="Open chat"
    const chatBtn = page.locator('button[aria-label="Open chat"]');
    await expect(chatBtn).toBeVisible();
  });

  test('lead form is present on page', async ({ page }) => {
    const form = page.locator('form').first();
    await expect(form).toBeVisible();
  });

  test('mobile viewport renders without horizontal scroll', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 1);
  });
});
