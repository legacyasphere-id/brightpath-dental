import { describe, it, expect } from 'vitest';
import { isValidUuid } from '@/lib/validation';

describe('isValidUuid', () => {
  it('accepts a real crypto.randomUUID() value', () => {
    expect(isValidUuid(crypto.randomUUID())).toBe(true);
  });

  it('accepts a known-good v4 UUID in any case', () => {
    expect(isValidUuid('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
    expect(isValidUuid('550E8400-E29B-41D4-A716-446655440000')).toBe(true);
  });

  it('rejects non-UUID strings', () => {
    expect(isValidUuid('not-a-uuid')).toBe(false);
    expect(isValidUuid('sess-1')).toBe(false);
    expect(isValidUuid('')).toBe(false);
  });

  it('rejects non-string values', () => {
    expect(isValidUuid(undefined)).toBe(false);
    expect(isValidUuid(null)).toBe(false);
    expect(isValidUuid(12345)).toBe(false);
    expect(isValidUuid({})).toBe(false);
  });
});
