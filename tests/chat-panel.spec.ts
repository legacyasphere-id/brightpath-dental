import { test, expect } from '@playwright/test';

test.describe('Chat panel sizing and empty state', () => {
  test('header is fully visible at 375x667', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.locator('button[aria-label="Open chat"]').click();

    const header = page.getByText('BrightPath AI · Instant Answers');
    await expect(header).toBeVisible();

    const box = await header.boundingBox();
    expect(box).not.toBeNull();
    // The header must not be clipped off the top of the viewport.
    expect(box!.y).toBeGreaterThanOrEqual(0);

    // The input must not be covered by the floating launcher button.
    const input = page.locator(
      'input[placeholder="Ask about services, pricing, or doctors..."]'
    );
    const launcher = page.locator('button[aria-label="Open chat"]');
    const inputBox = await input.boundingBox();
    const launcherBox = await launcher.boundingBox();
    expect(inputBox).not.toBeNull();
    expect(launcherBox).not.toBeNull();
    // No vertical overlap between the input row and the launcher button.
    expect(inputBox!.y + inputBox!.height).toBeLessThanOrEqual(launcherBox!.y);
  });

  test('header is fully visible at 1280x800', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    await page.locator('button[aria-label="Open chat"]').click();

    const header = page.getByText('BrightPath AI · Instant Answers');
    await expect(header).toBeVisible();
    const box = await header.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.y).toBeGreaterThanOrEqual(0);
  });

  test('empty state renders on open, with no API call', async ({ page }) => {
    let chatCalled = false;
    await page.route('**/api/chat', async (route) => {
      chatCalled = true;
      await route.continue();
    });

    await page.goto('/');
    await page.locator('button[aria-label="Open chat"]').click();

    // Scoped to the chat panel itself — AIDemo.tsx's own sample-question
    // chips share some wording (e.g. "Apakah menerima BPJS?") and would
    // otherwise collide with these.
    const panel = page
      .locator('div.fixed')
      .filter({ hasText: 'BrightPath AI · Instant Answers' });

    await expect(
      panel.getByText('Halo! Saya asisten AI BrightPath Dental.')
    ).toBeVisible();
    await expect(
      panel.getByText(
        'Tanya apa saja soal layanan, harga, jadwal dokter, atau lokasi klinik.'
      )
    ).toBeVisible();

    for (const chip of [
      'Berapa biaya periksa gigi?',
      'Jam praktik klinik?',
      'Dokter siapa yang menangani kawat gigi?',
      'Apakah menerima BPJS?',
    ]) {
      await expect(panel.getByRole('button', { name: chip })).toBeVisible();
    }

    expect(chatCalled).toBe(false);
  });

  test('clicking a chip sends that message and the chips disappear', async ({
    page,
  }) => {
    await page.route('**/api/chat', async (route) => {
      const body =
        'event: error\ndata: {"code":"model_failed","message":"mocked","language":"id"}\n\n' +
        'data: [DONE]\n\n';
      await route.fulfill({ status: 200, contentType: 'text/event-stream', body });
    });

    await page.goto('/');
    await page.locator('button[aria-label="Open chat"]').click();

    const chip = page.getByRole('button', { name: 'Jam praktik klinik?' });
    await expect(chip).toBeVisible();
    await chip.click();

    // The chip's text now appears as the user's own message.
    await expect(page.getByText('Jam praktik klinik?').first()).toBeVisible();

    // The empty state (greeting + chips) is gone once a message is sent.
    await expect(
      page.getByText('Halo! Saya asisten AI BrightPath Dental.')
    ).not.toBeVisible();
    await expect(chip).not.toBeVisible();
  });
});
