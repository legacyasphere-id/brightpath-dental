// @vitest-environment node
//
// retrieval.ts imports embeddings.ts, which constructs an OpenAI client at
// module load time. The OpenAI SDK refuses to initialize in a browser-like
// environment (jsdom provides `window`/`document`) without
// dangerouslyAllowBrowser — forcing node here avoids that entirely, since
// detectLanguage() itself needs no DOM.
import { describe, it, expect } from 'vitest';
import { detectLanguage } from '@/lib/ai/retrieval';

describe('detectLanguage', () => {
  it('detects Bahasa Indonesia from common words', () => {
    const result = detectLanguage('harga perawatan gigi berapa ya dok?');
    expect(result).toBe('id');
  });

  it('defaults to English for English text', () => {
    const result = detectLanguage('what are the prices for teeth cleaning?');
    expect(result).toBe('en');
  });

  it('handles empty string', () => {
    const result = detectLanguage('');
    expect(result).toBe('en');
  });
});
