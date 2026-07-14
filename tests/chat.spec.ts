import { test, expect } from '@playwright/test';

test.describe('Chat Widget', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('chat button is visible on page load', async ({ page }) => {
    // ChatWidget.tsx's button has no visible text (just a 💬 emoji) — the
    // reliable selector is its aria-label, which AIDemo.tsx's own "Ask our
    // AI" wiring also relies on to find this exact button.
    const chatTrigger = page.locator('button[aria-label="Open chat"]');
    await expect(chatTrigger).toBeVisible({ timeout: 5000 });
  });

  test('clicking chat button opens chat panel', async ({ page }) => {
    const chatTrigger = page.locator('button[aria-label="Open chat"]');
    await chatTrigger.click();
    // ChatPanel.tsx has no role="dialog" or data-testid — its header text
    // is the stable, actually-rendered signal that it opened.
    const chatPanel = page.getByText('BrightPath AI · Instant Answers');
    await expect(chatPanel).toBeVisible({ timeout: 3000 });
  });
});
