"use client";

import { useRef, useState } from "react";
import { ChatMessage, type ChatMessageData } from "./ChatMessage";
import { LeadCapture } from "./LeadCapture";
import { detectLanguage, type Language } from "@/lib/ai/language";

export function ChatPanel({ onClose }: { onClose: () => void }) {
  const [sessionId] = useState(() => crypto.randomUUID());
  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [requiresLead, setRequiresLead] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  function scrollToBottom() {
    requestAnimationFrame(() => {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
    });
  }

  async function sendMessage(text: string) {
    if (!text || loading) return;

    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "user", content: text },
    ]);
    scrollToBottom();

    const assistantId = crypto.randomUUID();
    setMessages((prev) => [
      ...prev,
      { id: assistantId, role: "assistant", content: "", status: "streaming" },
    ]);
    setLoading(true);

    // Client-side fallback for failures that never reach a server error
    // payload (fetch itself throwing, a non-SSE response) — same detector
    // the server uses, so the error card still follows the language rule.
    const fallbackLanguage: Language = detectLanguage(text);

    function finalizeError(language: Language = fallbackLanguage) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, status: "error", retryText: text, errorLanguage: language }
            : m,
        ),
      );
    }

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, sessionId }),
      });

      if (!res.ok || !res.body) {
        finalizeError();
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let sawError = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const frames = buffer.split("\n\n");
        buffer = frames.pop() ?? "";

        for (const frame of frames) {
          const lines = frame
            .split("\n")
            .map((l) => l.trim())
            .filter(Boolean);
          const dataLine = lines.find((l) => l.startsWith("data:"));
          if (!dataLine) continue;

          const payload = dataLine.slice(5).trim();
          if (payload === "[DONE]") continue;

          const eventLine = lines.find((l) => l.startsWith("event:"));
          const eventType = eventLine ? eventLine.slice(6).trim() : "message";
          const parsed = JSON.parse(payload);

          if (eventType === "error") {
            sawError = true;
            finalizeError(parsed.language ?? fallbackLanguage);
            continue;
          }

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
        }
      }

      if (!sawError) {
        // Guard the silent case: the stream closed with zero content and
        // no error event ever arrived. An assistant message must never
        // settle as empty — treat it the same as an explicit error.
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? m.content === ""
                ? {
                    ...m,
                    status: "error",
                    retryText: text,
                    errorLanguage: fallbackLanguage,
                  }
                : { ...m, status: "done" }
              : m,
          ),
        );
      }
    } catch {
      finalizeError();
    } finally {
      setLoading(false);
    }
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    await sendMessage(text);
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
          <ChatMessage
            key={message.id}
            message={message}
            onRetry={
              message.status === "error" && message.retryText
                ? () => sendMessage(message.retryText!)
                : undefined
            }
          />
        ))}
        {requiresLead && <LeadCapture conversationId={sessionId} />}
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
