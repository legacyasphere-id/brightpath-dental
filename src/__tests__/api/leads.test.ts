import { describe, it, expect, vi, beforeEach } from 'vitest';

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

const { mockCheckRateLimit } = vi.hoisted(() => ({
  mockCheckRateLimit: vi.fn(),
}));

vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: mockCheckRateLimit,
  getClientIp: () => '1.2.3.4',
}));

describe('/api/leads', () => {
  beforeEach(() => {
    // Clears call history (so "not.toHaveBeenCalled()" assertions below
    // aren't polluted by earlier tests in this file) without touching
    // createServiceClient's mock implementation.
    vi.clearAllMocks();
    mockCheckRateLimit.mockResolvedValue({ limited: false });
  });

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
  });

  it('returns 400 when name exceeds 100 characters', async () => {
    const { POST } = await import('@/app/api/leads/route');
    const req = new Request('http://localhost/api/leads', {
      method: 'POST',
      body: JSON.stringify({ name: 'a'.repeat(101), phone: '08123456789' }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
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

  it('returns 400 when phone is not a sane phone format', async () => {
    const { POST } = await import('@/app/api/leads/route');
    const req = new Request('http://localhost/api/leads', {
      method: 'POST',
      body: JSON.stringify({ name: 'Budi Santoso', phone: 'drop table leads;' }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 400 when source is not "chat" or "form"', async () => {
    const { POST } = await import('@/app/api/leads/route');
    const req = new Request('http://localhost/api/leads', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Budi Santoso',
        phone: '08123456789',
        source: 'telemarketing',
      }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 400 when conversationId is not a valid UUID', async () => {
    const { POST } = await import('@/app/api/leads/route');
    const req = new Request('http://localhost/api/leads', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Budi Santoso',
        phone: '08123456789',
        conversationId: 'not-a-uuid',
      }),
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

  it('silently discards the submission when the honeypot field is filled', async () => {
    const { createServiceClient } = await import('@/lib/supabase/server');
    const { POST } = await import('@/app/api/leads/route');
    const req = new Request('http://localhost/api/leads', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Bot Submission',
        phone: '08123456789',
        website: 'https://spam.example.com',
      }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.leadId).toBeNull();
    // The whole point of a honeypot is that it never reaches the DB.
    expect(createServiceClient).not.toHaveBeenCalled();
  });

  it('returns 429 and never inserts when rate limited', async () => {
    mockCheckRateLimit.mockResolvedValue({ limited: true });
    const { createServiceClient } = await import('@/lib/supabase/server');
    const { POST } = await import('@/app/api/leads/route');
    const req = new Request('http://localhost/api/leads', {
      method: 'POST',
      body: JSON.stringify({ name: 'Budi Santoso', phone: '08123456789' }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);
    expect(res.status).toBe(429);
    expect(createServiceClient).not.toHaveBeenCalled();
  });
});
