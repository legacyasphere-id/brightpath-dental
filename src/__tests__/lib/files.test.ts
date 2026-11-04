import { describe, it, expect } from 'vitest';
import { sanitizeFilename, matchesFileSignature } from '@/lib/files';

describe('sanitizeFilename', () => {
  it('leaves an ordinary filename untouched', () => {
    expect(sanitizeFilename('pricing-2024.pdf')).toBe('pricing-2024.pdf');
  });

  it('strips a directory component', () => {
    expect(sanitizeFilename('../../etc/passwd.pdf')).toBe('passwd.pdf');
    expect(sanitizeFilename('..\\..\\windows\\system32\\evil.pdf')).toBe('evil.pdf');
  });

  it('replaces unsafe characters', () => {
    expect(sanitizeFilename('weird name!@#$.pdf')).toBe('weird_name____.pdf');
  });

  it('strips leading dots so the result cannot resolve to a hidden/relative path', () => {
    expect(sanitizeFilename('..pdf')).toBe('pdf');
    expect(sanitizeFilename('...')).not.toMatch(/^\.+$/);
  });

  it('falls back to "file" for an empty or entirely-stripped name', () => {
    expect(sanitizeFilename('')).toBe('file');
    expect(sanitizeFilename('///')).toBe('file');
  });

  it('keeps the tail (and extension) of a very long name', () => {
    const longName = 'a'.repeat(300) + '.pdf';
    const result = sanitizeFilename(longName);
    expect(result.length).toBeLessThanOrEqual(150);
    expect(result.endsWith('.pdf')).toBe(true);
  });
});

describe('matchesFileSignature', () => {
  it('accepts a real PDF signature', () => {
    const buffer = Buffer.from('%PDF-1.4\n...rest of file', 'utf-8');
    expect(matchesFileSignature(buffer, 'pdf')).toBe(true);
  });

  it('accepts a real DOCX (ZIP) signature', () => {
    const buffer = Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x14, 0x00]);
    expect(matchesFileSignature(buffer, 'docx')).toBe(true);
  });

  it('rejects a PDF-extension file whose bytes are not a PDF', () => {
    const buffer = Buffer.from('<html><script>evil()</script></html>', 'utf-8');
    expect(matchesFileSignature(buffer, 'pdf')).toBe(false);
  });

  it('rejects a DOCX-extension file whose bytes are not a ZIP', () => {
    const buffer = Buffer.from('MZ\x90\x00this is actually an exe', 'utf-8');
    expect(matchesFileSignature(buffer, 'docx')).toBe(false);
  });

  it('rejects a buffer shorter than the expected signature', () => {
    expect(matchesFileSignature(Buffer.from([0x25, 0x50]), 'pdf')).toBe(false);
  });

  it('has nothing to check for txt — any bytes pass', () => {
    expect(matchesFileSignature(Buffer.from('plain text'), 'txt')).toBe(true);
    expect(matchesFileSignature(Buffer.from([0x00, 0xff]), 'txt')).toBe(true);
  });
});
