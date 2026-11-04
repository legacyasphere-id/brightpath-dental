// @vitest-environment node
//
// jsdom's File/FormData/Request implementations don't round-trip a real
// File through Request.formData() correctly (the file comes back with
// instanceof File false and its name replaced with "blob" — a known
// jsdom limitation, confirmed by reproducing it directly before adding
// this pragma). This file tests actual multipart file uploads, so it
// needs Node's native, spec-correct Request/FormData/File instead.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('@/lib/ai/embeddings', () => ({ embed: vi.fn(async () => [0.1, 0.2]) }));

// A real PDF is a full structured document, not just its magic-byte
// header — the signature check (what this file is testing) only
// verifies the first few bytes, so a minimal "%PDF-..." fixture passes
// it but isn't a document pdf-parse can actually extract text from.
// Mocked out so these tests exercise the sanitize/signature path this
// commit added, not pdf-parse's own unrelated parsing logic.
vi.mock('pdf-parse', () => ({
  PDFParse: class {
    async getText() {
      return { text: 'mock extracted pdf text' };
    }
    async destroy() {}
  },
}));

const { mockGetUser, mockUpload } = vi.hoisted(() => ({
  mockGetUser: vi.fn(),
  mockUpload: vi.fn<(path: string, data: Buffer) => { error: null }>(() => ({ error: null })),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: mockGetUser },
  })),
  createServiceClient: vi.fn(() => ({
    storage: {
      from: vi.fn(() => ({ upload: mockUpload })),
    },
    from: vi.fn((table: string) => {
      if (table === 'documents') {
        return {
          select: vi.fn(() => ({
            order: vi.fn(() => ({ data: [], error: null })),
          })),
          insert: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn(() => ({ data: { id: 'doc-1' }, error: null })),
            })),
          })),
          update: vi.fn(() => ({
            eq: vi.fn(() => ({ data: null, error: null })),
          })),
        };
      }
      if (table === 'document_chunks') {
        return {
          insert: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn(() => ({ data: { id: 'chunk-1' }, error: null })),
            })),
          })),
        };
      }
      if (table === 'embeddings') {
        return { insert: vi.fn(() => ({ error: null })) };
      }
      return {};
    }),
  })),
}));

const ORIGINAL_ADMIN_EMAILS = process.env.ADMIN_EMAILS;

describe('/api/knowledge', () => {
  beforeEach(() => {
    mockGetUser.mockReset();
    mockUpload.mockClear();
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

    it('returns 400 when a .pdf-named file is not actually a PDF', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { email: 'admin@brightpathdental.com' } },
      });
      const formData = new FormData();
      formData.append(
        'file',
        new File(['<html><script>evil()</script></html>'], 'invoice.pdf', {
          type: 'application/pdf',
        }),
      );
      const req = new Request('http://localhost/api/knowledge', {
        method: 'POST',
        body: formData,
      });

      const { POST } = await import('@/app/api/knowledge/route');
      const res = await POST(req);
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toContain('does not match');
      expect(mockUpload).not.toHaveBeenCalled();
    });

    it('sanitizes a path-traversal filename before it reaches storage, and accepts a genuine PDF', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { email: 'admin@brightpathdental.com' } },
      });
      const pdfBytes = Buffer.from('%PDF-1.4\nsome pdf content here', 'utf-8');
      const formData = new FormData();
      formData.append(
        'file',
        new File([pdfBytes], '../../etc/passwd.pdf', { type: 'application/pdf' }),
      );
      const req = new Request('http://localhost/api/knowledge', {
        method: 'POST',
        body: formData,
      });

      const { POST } = await import('@/app/api/knowledge/route');
      const res = await POST(req);
      expect(res.status).toBe(200);
      expect(mockUpload).toHaveBeenCalledTimes(1);
      const storagePath = mockUpload.mock.calls[0]![0] as string;
      expect(storagePath).not.toContain('..');
      expect(storagePath).not.toContain('/etc/');
      expect(storagePath.endsWith('passwd.pdf')).toBe(true);
    });
  });
});
