import { describe, it, expect } from 'vitest';
import { buildSystemPrompt } from '@/lib/ai/prompts';
import type { RetrievedChunk } from '@/types';

// buildSystemPrompt(chunks, language) takes positional args, not an options
// object — chunks is required (an array, [] for "no context") and language
// defaults to "en".
describe('buildSystemPrompt', () => {
  it('returns a non-empty string', () => {
    const prompt = buildSystemPrompt([]);
    expect(typeof prompt).toBe('string');
    expect(prompt.length).toBeGreaterThan(0);
  });

  it('includes a Bahasa Indonesia instruction when language is "id"', () => {
    const prompt = buildSystemPrompt([], 'id');
    expect(prompt).toContain('Bahasa Indonesia');
  });

  it('instructs English responses by default', () => {
    const prompt = buildSystemPrompt([]);
    expect(prompt).toContain('Respond in English');
  });

  it('includes retrieved chunk content in the prompt', () => {
    const chunks: RetrievedChunk[] = [
      {
        chunk_id: 'c1',
        document_name: 'pricing.txt',
        content: 'Harga perawatan gigi: Rp 200.000',
        similarity: 0.9,
      },
    ];
    const prompt = buildSystemPrompt(chunks);
    expect(prompt).toContain('Harga perawatan gigi: Rp 200.000');
    expect(prompt).toContain('pricing.txt');
  });
});
