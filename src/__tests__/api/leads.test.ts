import { describe, it, expect, vi } from 'vitest';

// Mock next/server's after() — real route.ts wraps the webhook fetch in it
vi.mock('next/server', () => ({
  after: vi.fn((fn) => fn()),
}));

// Mock Supabase
vi.mock('@/lib/supabase/server', () => ({
  createServiceClient: vi.fn(() => ({
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => ({ data: { id: 'test-id-123' }, error: null })),
        })),
      })),
    })),
  })),
}));

describe('/api/leads', () => {
  it('returns 400 when body is not valid JSON', async () => {
    const { POST } = await import('@/app/api/leads/route');
    const req = new Request('http://localhost/api/leads', {
      method: 'POST',
      body: 'not-json',
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Invalid JSON body');
  });

  it('returns 400 when name is missing', async () => {
    const { POST } = await import('@/app/api/leads/route');
    const req = new Request('http://localhost/api/leads', {
      method: 'POST',
      body: JSON.stringify({ phone: '08123456789' }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('required');
  });

  it('returns 400 when phone is missing', async () => {
    const { POST } = await import('@/app/api/leads/route');
    const req = new Request('http://localhost/api/leads', {
      method: 'POST',
      body: JSON.stringify({ name: 'Budi Santoso' }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 200 with leadId on valid submission', async () => {
    const { POST } = await import('@/app/api/leads/route');
    const req = new Request('http://localhost/api/leads', {
      method: 'POST',
      body: JSON.stringify({ name: 'Budi Santoso', phone: '08123456789' }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.leadId).toBe('test-id-123');
  });
});
