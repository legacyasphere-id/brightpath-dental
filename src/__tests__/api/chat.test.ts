import { describe, it, expect, vi, beforeEach } from 'vitest';

// The safety property under test: zero retrieved chunks must never reach
// the model. retrieveContext(), buildSystemPrompt(), and lib/ai/chat's
// streaming functions are all mocked so the assertion is purely "which
// code path ran," not "what did the model say."
vi.mock('next/server', () => ({
  after: vi.fn((fn) => fn()),
}));

vi.mock('@/lib/supabase/logging', () => ({
  logChatTurn: vi.fn(),
}));

const { mockRetrieveContext } = vi.hoisted(() => ({
  mockRetrieveContext: vi.fn(),
}));

vi.mock('@/lib/ai/retrieval', () => ({
  retrieveContext: mockRetrieveContext,
  detectLanguage: () => 'id',
}));

const { mockBuildSystemPrompt } = vi.hoisted(() => ({
  mockBuildSystemPrompt: vi.fn(() => 'system prompt'),
}));

vi.mock('@/lib/ai/prompts', () => ({
  buildSystemPrompt: mockBuildSystemPrompt,
}));

const { mockStreamChat, mockNoContextStream } = vi.hoisted(() => ({
  mockStreamChat: vi.fn(),
  mockNoContextStream: vi.fn(),
}));

function fakeStream(text: string) {
  const encoder = new TextEncoder();
  return new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: text })}\n\n`));
      controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      controller.close();
    },
  });
}

vi.mock('@/lib/ai/chat', () => ({
  streamChat: mockStreamChat,
  noContextStream: mockNoContextStream,
  errorStream: vi.fn(() => fakeStream('error')),
}));

async function readAll(res: Response): Promise<string> {
  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let out = '';
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    out += decoder.decode(value);
  }
  return out;
}

describe('/api/chat', () => {
  beforeEach(() => {
    mockRetrieveContext.mockReset();
    mockBuildSystemPrompt.mockClear();
    mockStreamChat.mockReset();
    mockNoContextStream.mockReset();
  });

  it('never calls the model when retrieval matches zero chunks', async () => {
    mockRetrieveContext.mockResolvedValue([]);
    mockNoContextStream.mockReturnValue(fakeStream('no context reply'));

    const { POST } = await import('@/app/api/chat/route');
    const req = new Request('http://localhost/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message: 'ada layanan apa saja?', sessionId: 'sess-1' }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);
    const body = await readAll(res);

    expect(mockNoContextStream).toHaveBeenCalledTimes(1);
    expect(mockBuildSystemPrompt).not.toHaveBeenCalled();
    expect(mockStreamChat).not.toHaveBeenCalled();
    expect(body).toContain('no context reply');
  });

  it('calls the model normally when retrieval returns chunks', async () => {
    mockRetrieveContext.mockResolvedValue([
      { chunk_id: 'c1', document_name: '02-pricing.txt', content: 'harga...', similarity: 0.6 },
    ]);
    mockStreamChat.mockResolvedValue(fakeStream('a real answer'));

    const { POST } = await import('@/app/api/chat/route');
    const req = new Request('http://localhost/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message: 'berapa harga scaling?', sessionId: 'sess-2' }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);
    const body = await readAll(res);

    expect(mockNoContextStream).not.toHaveBeenCalled();
    expect(mockBuildSystemPrompt).toHaveBeenCalledTimes(1);
    expect(mockStreamChat).toHaveBeenCalledTimes(1);
    expect(body).toContain('a real answer');
  });
});
