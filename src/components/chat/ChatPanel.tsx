"use client";

import { useRef, useState } from "react";
import { ChatMessage, type ChatMessageData } from "./ChatMessage";
import { LeadCapture } from "./LeadCapture";

export function ChatPanel({ onClose }: { onClose: () => void }) {
  const [sessionId] = useState(() => crypto.randomUUID());
  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [requiresLead, setRequiresLead] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  function scrollToBottom() {
    requestAnimationFrame(() => {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
    });
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    setError(null);
    setInput("");
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "user", content: text },
    ]);
    scrollToBottom();

    const assistantId = crypto.randomUUID();
    setMessages((prev) => [
      ...prev,
      { id: assistantId, role: "assistant", content: "" },
    ]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, sessionId }),
      });

      if (!res.ok || !res.body) {
        throw new Error("Chat request failed");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split("\n\n");
        buffer = events.pop() ?? "";

        for (const event of events) {
          const line = event.trim();
          if (!line.startsWith("data:")) continue;
          const payload = line.slice(5).trim();
          if (payload === "[DONE]") continue;

          const parsed = JSON.parse(payload);

          if (parsed.content) {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId
                  ? { ...m, content: m.content + parsed.content }
                  : m,
              ),
            );
            scrollToBottom();
          }

          if (parsed.requiresLead) {
            setRequiresLead(true);
          }

          if (parsed.error) {
            setError(parsed.error);
          }
        }
      }
    } catch {
      setError("Something went wrong — please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-24 right-6 z-50 flex h-[600px] w-[400px] max-w-[calc(100vw-3rem)] flex-col rounded-xl border border-clinic-border bg-clinic-surface shadow-2xl">
      <div className="flex items-center justify-between rounded-t-xl bg-clinic-navy px-4 py-3 text-white">
        <span className="font-sans text-sm font-semibold">
          BrightPath AI · Instant Answers
        </span>
        <button onClick={onClose} aria-label="Close chat">
          ×
        </button>
      </div>

      <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        {requiresLead && <LeadCapture conversationId={sessionId} />}
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>

      <form
        onSubmit={handleSend}
        className="flex gap-2 border-t border-clinic-border p-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          className="flex-1 rounded-lg border border-clinic-border px-3 py-2 text-sm disabled:opacity-50"
          placeholder="Ask about services, pricing, or doctors..."
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="rounded-lg bg-clinic-mint px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
