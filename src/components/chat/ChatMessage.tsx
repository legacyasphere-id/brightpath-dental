import type { MessageRole } from "@/types";

const WHATSAPP_URL = "https://wa.me/6281229467180";

export interface ChatMessageData {
  id: string;
  role: MessageRole;
  content: string;
  // Assistant messages only. "streaming" while a response is still being
  // written to; finalized to "done" or "error" once the request settles.
  // A message must never end up empty with status "done" — see ChatPanel.
  status?: "streaming" | "done" | "error";
  // Original user message text, set on assistant messages that end in
  // "error" so the retry affordance can resend the same request.
  retryText?: string;
}

export function ChatMessage({
  message,
  onRetry,
}: {
  message: ChatMessageData;
  onRetry?: () => void;
}) {
  const isUser = message.role === "user";

  if (message.status === "error") {
    return (
      <div className="text-left">
        <div className="inline-block max-w-[85%] rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
          <p>
            Maaf, asisten AI sedang tidak dapat dihubungi. Silakan hubungi
            kami langsung di{" "}
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold underline"
            >
              WhatsApp
            </a>{" "}
            dan tim kami akan membantu.
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 text-xs font-semibold text-red-700 underline"
            >
              Coba lagi
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={isUser ? "text-right" : "text-left"}>
      <p
        className={
          isUser
            ? "inline-block rounded-lg bg-clinic-navy px-3 py-2 text-sm text-white"
            : "inline-block rounded-lg bg-clinic-mintLight px-3 py-2 text-sm text-clinic-text"
        }
      >
        {message.content}
      </p>
    </div>
  );
}
