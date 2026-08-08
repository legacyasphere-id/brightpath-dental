import { describe, it, expect, vi, beforeEach } from 'vitest';

// A route handler test needs the Supabase client mocked, not a real
// database — the point of these two cases is exercising both status-code
// branches, which a live check can't reliably do either way (a healthy
// check needs a reachable Supabase project; a failing check needs one
// that isn't reachable, on demand).
const { mockLimit } = vi.hoisted(() => ({
  mockLimit: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createAnonClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        limit: mockLimit,
      })),
    })),
  })),
}));

import { GET } from '@/app/api/health/route';

describe('/api/health', () => {
  beforeEach(() => {
    mockLimit.mockReset();
  });

  it('returns 200 with ok true against a healthy database', async () => {
    mockLimit.mockResolvedValue({ data: [{ id: 'setting-1' }], error: null });

    const res = await GET();
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.db).toBe(true);
    expect(typeof body.timestamp).toBe('string');
  });

  it('returns 503 when the Supabase check returns an error', async () => {
    mockLimit.mockResolvedValue({
      data: null,
      error: { message: 'connection refused' },
    });

    const res = await GET();
    expect(res.status).toBe(503);

    const body = await res.json();
    expect(body.ok).toBe(false);
    expect(body.db).toBe(false);
  });

  it('returns 503 when the Supabase client throws', async () => {
    mockLimit.mockRejectedValue(new Error('network unreachable'));

    const res = await GET();
    expect(res.status).toBe(503);

    const body = await res.json();
    expect(body.ok).toBe(false);
    expect(body.db).toBe(false);
  });
});
