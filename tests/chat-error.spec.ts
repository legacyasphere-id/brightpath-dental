import { test, expect } from '@playwright/test';

test.describe('Chat error handling', () => {
  test('a failing /api/chat renders a visible error state, never an empty bubble', async ({
    page,
  }) => {
    await page.route('**/api/chat', async (route) => {
      const body =
        'event: error\ndata: {"code":"model_failed","message":"mocked failure","language":"id"}\n\n' +
        'data: [DONE]\n\n';
      await route.fulfill({
        status: 200,
        contentType: 'text/event-stream',
        body,
      });
    });

    await page.goto('/');
    await page.locator('button[aria-label="Open chat"]').click();

    const input = page.locator(
      'input[placeholder="Ask about services, pricing, or doctors..."]'
    );
    await input.fill('Berapa biaya periksa gigi?');
    await page.getByRole('button', { name: 'Send' }).click();

    // Streaming finished (loading -> false) once the mocked SSE response
    // has been fully read.
    await expect(input).toBeEnabled({ timeout: 10000 });

    // The Indonesian error copy with the WhatsApp fallback must be visible.
    await expect(
      page.getByText('Silakan hubungi kami langsung di')
    ).toBeVisible();
    const waLink = page.getByRole('link', { name: 'WhatsApp', exact: true });
    await expect(waLink).toHaveAttribute('href', /wa\.me\/6281229467180/);

    // A retry affordance must be present on the failed message.
    await expect(page.getByRole('button', { name: 'Coba lagi' })).toBeVisible();

    // No assistant bubble may ever render with empty text content — an
    // empty assistant message must be unrenderable by construction.
    const bubbleTexts = await page.locator('.text-left p').allTextContents();
    expect(bubbleTexts.length).toBeGreaterThan(0);
    for (const text of bubbleTexts) {
      expect(text.trim().length).toBeGreaterThan(0);
    }
  });

  test('the error card follows the reply language rule — English message gets English copy', async ({
    page,
  }) => {
    await page.route('**/api/chat', async (route) => {
      const body =
        'event: error\ndata: {"code":"model_failed","message":"mocked failure","language":"en"}\n\n' +
        'data: [DONE]\n\n';
      await route.fulfill({
        status: 200,
        contentType: 'text/event-stream',
        body,
      });
    });

    await page.goto('/');
    await page.locator('button[aria-label="Open chat"]').click();

    const input = page.locator(
      'input[placeholder="Ask about services, pricing, or doctors..."]'
    );
    await input.fill('What services do you offer?');
    await page.getByRole('button', { name: 'Send' }).click();
    await expect(input).toBeEnabled({ timeout: 10000 });

    await expect(
      page.getByText('Please contact us directly on')
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible();
  });
});
