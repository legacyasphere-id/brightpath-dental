import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const { mockLimit } = vi.hoisted(() => ({ mockLimit: vi.fn() }));

vi.mock('@upstash/redis', () => ({
  Redis: class MockRedis {
    constructor(public opts: unknown) {}
  },
}));

vi.mock('@upstash/ratelimit', () => {
  class MockRatelimit {
    limit = mockLimit;
    constructor(public opts: unknown) {}
    static slidingWindow = vi.fn((limit: number, window: string) => ({ limit, window }));
  }
  return { Ratelimit: MockRatelimit };
});

const ORIGINAL_ENV = { ...process.env };

describe('getClientIp', () => {
  it('uses the first entry of x-forwarded-for', async () => {
    const { getClientIp } = await import('@/lib/rate-limit');
    const req = new Request('http://localhost/api/chat', {
      headers: { 'x-forwarded-for': '203.0.113.5, 10.0.0.1' },
    });
    expect(getClientIp(req)).toBe('203.0.113.5');
  });

  it('falls back to x-real-ip when x-forwarded-for is absent', async () => {
    const { getClientIp } = await import('@/lib/rate-limit');
    const req = new Request('http://localhost/api/chat', {
      headers: { 'x-real-ip': '198.51.100.7' },
    });
    expect(getClientIp(req)).toBe('198.51.100.7');
  });

  it('returns "unknown" when neither header is present', async () => {
    const { getClientIp } = await import('@/lib/rate-limit');
    const req = new Request('http://localhost/api/chat');
    expect(getClientIp(req)).toBe('unknown');
  });
});

describe('checkRateLimit', () => {
  beforeEach(() => {
    vi.resetModules();
    mockLimit.mockReset();
    process.env = { ...ORIGINAL_ENV };
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it('fails open (not limited) when Upstash env vars are unset', async () => {
    const { checkRateLimit } = await import('@/lib/rate-limit');
    const result = await checkRateLimit('test', 5, '1 m', '1.2.3.4');
    expect(result.limited).toBe(false);
    expect(mockLimit).not.toHaveBeenCalled();
  });

  it('reports limited when the underlying limiter denies the request', async () => {
    process.env.UPSTASH_REDIS_REST_URL = 'https://example.upstash.io';
    process.env.UPSTASH_REDIS_REST_TOKEN = 'test-token';
    mockLimit.mockResolvedValue({ success: false });

    const { checkRateLimit } = await import('@/lib/rate-limit');
    const result = await checkRateLimit('test', 5, '1 m', '1.2.3.4');
    expect(result.limited).toBe(true);
    expect(mockLimit).toHaveBeenCalledWith('1.2.3.4');
  });

  it('allows the request when the underlying limiter has quota left', async () => {
    process.env.UPSTASH_REDIS_REST_URL = 'https://example.upstash.io';
    process.env.UPSTASH_REDIS_REST_TOKEN = 'test-token';
    mockLimit.mockResolvedValue({ success: true });

    const { checkRateLimit } = await import('@/lib/rate-limit');
    const result = await checkRateLimit('test', 5, '1 m', '1.2.3.4');
    expect(result.limited).toBe(false);
  });

  it('fails open when the Upstash call itself throws', async () => {
    process.env.UPSTASH_REDIS_REST_URL = 'https://example.upstash.io';
    process.env.UPSTASH_REDIS_REST_TOKEN = 'test-token';
    mockLimit.mockRejectedValue(new Error('network blip'));

    const { checkRateLimit } = await import('@/lib/rate-limit');
    const result = await checkRateLimit('test', 5, '1 m', '1.2.3.4');
    expect(result.limited).toBe(false);
  });
});
