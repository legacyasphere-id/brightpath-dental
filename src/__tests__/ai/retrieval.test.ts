import { describe, it, expect } from 'vitest';
import { detectLanguage } from '@/lib/ai/language';

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
