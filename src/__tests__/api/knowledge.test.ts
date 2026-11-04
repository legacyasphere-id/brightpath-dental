import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('@/lib/ai/embeddings', () => ({ embed: vi.fn() }));

const { mockGetUser } = vi.hoisted(() => ({ mockGetUser: vi.fn() }));

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: mockGetUser },
  })),
  createServiceClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => ({ data: [], error: null })),
      })),
    })),
  })),
}));

const ORIGINAL_ADMIN_EMAILS = process.env.ADMIN_EMAILS;

describe('/api/knowledge', () => {
  beforeEach(() => {
    mockGetUser.mockReset();
    process.env.ADMIN_EMAILS = 'admin@brightpathdental.com';
  });

  afterEach(() => {
    process.env.ADMIN_EMAILS = ORIGINAL_ADMIN_EMAILS;
  });

  describe('GET', () => {
    it('returns 401 when no user is signed in', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } });
      const { GET } = await import('@/app/api/knowledge/route');
      const res = await GET();
      expect(res.status).toBe(401);
    });

    it('returns 403 when signed in but not on the admin allowlist', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { email: 'stranger@example.com' } },
      });
      const { GET } = await import('@/app/api/knowledge/route');
      const res = await GET();
      expect(res.status).toBe(403);
    });

    it('returns 200 when signed in as an allowlisted admin', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { email: 'admin@brightpathdental.com' } },
      });
      const { GET } = await import('@/app/api/knowledge/route');
      const res = await GET();
      expect(res.status).toBe(200);
    });
  });

  describe('POST', () => {
    function postRequest() {
      const formData = new FormData();
      formData.append('file', new File(['hello'], 'notes.txt', { type: 'text/plain' }));
      return new Request('http://localhost/api/knowledge', {
        method: 'POST',
        body: formData,
      });
    }

    it('returns 401 when no user is signed in', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } });
      const { POST } = await import('@/app/api/knowledge/route');
      const res = await POST(postRequest());
      expect(res.status).toBe(401);
    });

    it('returns 403 when signed in but not on the admin allowlist', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { email: 'stranger@example.com' } },
      });
      const { POST } = await import('@/app/api/knowledge/route');
      const res = await POST(postRequest());
      expect(res.status).toBe(403);
    });
  });
});
