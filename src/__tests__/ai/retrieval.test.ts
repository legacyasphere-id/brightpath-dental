import { describe, it, expect, vi, beforeEach } from 'vitest';
import { detectLanguage } from '@/lib/ai/language';
import { expandQueryForRetrieval } from '@/lib/ai/retrieval';

const { mockEmbed, mockRpc } = vi.hoisted(() => ({
  mockEmbed: vi.fn(),
  mockRpc: vi.fn(),
}));

vi.mock('@/lib/ai/embeddings', () => ({ embed: mockEmbed }));
vi.mock('@/lib/supabase/server', () => ({
  createAnonClient: vi.fn(() => ({ rpc: mockRpc })),
}));

describe('detectLanguage', () => {
  it('detects Bahasa Indonesia from common words', () => {
    const result = detectLanguage('harga perawatan gigi berapa ya dok?');
    expect(result).toBe('id');
  });

  it('classifies English text on positive English evidence', () => {
    const result = detectLanguage('what are the prices for teeth cleaning?');
    expect(result).toBe('en');
  });

  // Nearly every visitor is Indonesian, so the default has to be
  // Indonesian, not English — classify "en" only on positive English
  // evidence, never as a fallback for ambiguous or evidence-free text.
  it('defaults to Indonesian for an empty string', () => {
    const result = detectLanguage('');
    expect(result).toBe('id');
  });

  it('defaults to Indonesian for an ambiguous greeting with no evidence either way', () => {
    expect(detectLanguage('hallo')).toBe('id');
    expect(detectLanguage('halo')).toBe('id');
    expect(detectLanguage('hi')).toBe('id');
    expect(detectLanguage('ok')).toBe('id');
  });

  it('Indonesian evidence outweighs a single accidental English substring match', () => {
    // "dok" (short for "dokter") contains "do", an English indicator —
    // real Indonesian evidence must still win.
    const result = detectLanguage('harga scaling berapa ya dok?');
    expect(result).toBe('id');
  });
});

describe('expandQueryForRetrieval', () => {
  it('embeds the original question verbatim inside the expansion', () => {
    const result = expandQueryForRetrieval('ada layanan apa saja?');
    expect(result).toContain('ada layanan apa saja?');
  });

  it('adds clinic context and cross-topic vocabulary, not just length', () => {
    const result = expandQueryForRetrieval('ada layanan apa saja?');
    expect(result).toContain('BrightPath Dental');
    expect(result).toContain('layanan');
    expect(result).toContain('dokter');
    expect(result).toContain('harga');
  });

  it('is a fixed template — no per-question branching', () => {
    // Two unrelated questions should share the exact same surrounding
    // template text, only the quoted question itself should differ.
    const a = expandQueryForRetrieval('berapa biaya scaling?');
    const b = expandQueryForRetrieval('jam buka klinik?');
    const aWithoutQuestion = a.replace('berapa biaya scaling?', '');
    const bWithoutQuestion = b.replace('jam buka klinik?', '');
    expect(aWithoutQuestion).toBe(bWithoutQuestion);
  });
});

describe('retrieveContext', () => {
  beforeEach(() => {
    mockEmbed.mockReset().mockResolvedValue([0.1, 0.2, 0.3]);
    mockRpc.mockReset().mockResolvedValue({ data: [], error: null });
  });

  it('embeds the expanded query, not the raw one', async () => {
    const { retrieveContext } = await import('@/lib/ai/retrieval');
    await retrieveContext('ada layanan apa saja?', 5);

    expect(mockEmbed).toHaveBeenCalledTimes(1);
    const embeddedText = mockEmbed.mock.calls[0][0];
    expect(embeddedText).not.toBe('ada layanan apa saja?');
    expect(embeddedText).toBe(expandQueryForRetrieval('ada layanan apa saja?'));
  });
});
