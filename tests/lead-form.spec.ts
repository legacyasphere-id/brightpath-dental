import { test, expect } from '@playwright/test';

test.describe('Lead Form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Scroll to lead form
    await page.locator('form').first().scrollIntoViewIfNeeded();
  });

  test('shows validation when submitting empty form', async ({ page }) => {
    const form = page.locator('form').first();
    const submitBtn = form.locator('button[type="submit"]');
    await submitBtn.click();
    // LeadForm.tsx's inputs have no `name` attribute — the name field is the
    // only type="text" input in the form (service is a <select>, message is
    // a <textarea>, phone is type="tel").
    const nameInput = form.locator('input[type="text"]').first();
    const validationMessage = await nameInput.evaluate((el: HTMLInputElement) => el.validationMessage);
    expect(validationMessage).toBeTruthy();
  });

  test('name and phone fields are present', async ({ page }) => {
    const form = page.locator('form').first();
    const nameInput = form.locator('input[type="text"]').first();
    const phoneInput = form.locator('input[type="tel"]').first();
    await expect(nameInput).toBeVisible();
    await expect(phoneInput).toBeVisible();
  });
});
