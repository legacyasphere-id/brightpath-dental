import { test, expect, type Page, type Locator } from '@playwright/test';

async function sendChatMessage(page: Page, text: string): Promise<Locator> {
  const input = page.locator(
    'input[placeholder="Ask about services, pricing, or doctors..."]'
  );
  await input.fill(text);
  await page.getByRole('button', { name: 'Send' }).click();

  // The input re-enables once the SSE stream finishes (loading -> false in
  // ChatPanel's finally block), which is the signal the reply is complete.
  await expect(input).toBeEnabled({ timeout: 30000 });

  // ChatMessage.tsx renders the assistant bubble as a <p> inside a
  // "text-left" wrapper (vs "text-right" for the user's own message) — the
  // only place in the app that uses that exact class today.
  return page.locator('.text-left p').last();
}

test.describe('Chat language detection', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('button[aria-label="Open chat"]').click();
  });

  test('ambiguous "hallo" greeting replies in Indonesian, never German', async ({
    page,
  }) => {
    const reply = await sendChatMessage(page, 'hallo');
    const text = ((await reply.textContent()) ?? '').toLowerCase();

    expect(text).not.toContain('wie kann ich');
    expect(text).not.toContain('möchten sie');
    expect(text).not.toContain('ihnen');

    // The reply must actually be Indonesian, not merely "not German" —
    // an English reply would satisfy the assertions above too.
    expect(text).toMatch(
      /\b(saya|kami|anda|silakan|maaf|dapat|klinik|dokter|layanan|informasi)\b/
    );
  });

  test('a clearly English question gets an English reply', async ({
    page,
  }) => {
    const reply = await sendChatMessage(page, 'what services do you offer?');
    const text = ((await reply.textContent()) ?? '').toLowerCase();

    // Heuristic: none of these common Indonesian function words should
    // leak into a reply that's supposed to be in English.
    expect(text).not.toMatch(/\b(yang|adalah|silakan|kami)\b/);
  });
});
