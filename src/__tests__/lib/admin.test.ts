import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { isAdminEmail } from '@/lib/auth/admin';

const ORIGINAL_ADMIN_EMAILS = process.env.ADMIN_EMAILS;

describe('isAdminEmail', () => {
  beforeEach(() => {
    process.env.ADMIN_EMAILS = 'admin@brightpathdental.com, Owner@BrightPathDental.com';
  });

  afterEach(() => {
    process.env.ADMIN_EMAILS = ORIGINAL_ADMIN_EMAILS;
  });

  it('accepts an exact match', () => {
    expect(isAdminEmail('admin@brightpathdental.com')).toBe(true);
  });

  it('is case-insensitive on both sides', () => {
    expect(isAdminEmail('ADMIN@brightpathdental.com')).toBe(true);
    expect(isAdminEmail('owner@brightpathdental.com')).toBe(true);
  });

  it('tolerates whitespace around entries in the env var', () => {
    expect(isAdminEmail('owner@brightpathdental.com')).toBe(true);
  });

  it('rejects an email not on the allowlist', () => {
    expect(isAdminEmail('stranger@example.com')).toBe(false);
  });

  it('rejects null/undefined', () => {
    expect(isAdminEmail(null)).toBe(false);
    expect(isAdminEmail(undefined)).toBe(false);
  });

  it('rejects everything when ADMIN_EMAILS is unset', () => {
    delete process.env.ADMIN_EMAILS;
    expect(isAdminEmail('admin@brightpathdental.com')).toBe(false);
  });
});
