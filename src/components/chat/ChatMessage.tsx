import type { MessageRole } from "@/types";
import type { Language } from "@/lib/ai/language";

const WHATSAPP_URL = "https://wa.me/6281229467180";

// An error is still a reply — same language rule as RUN 1: Indonesian by
// default, English only when the user's message was clearly English. The
// WhatsApp link/number is identical regardless of language.
const ERROR_COPY: Record<Language, { text: React.ReactNode; retry: string }> = {
  id: {
    text: (
      <>
        Maaf, asisten AI sedang tidak dapat dihubungi. Silakan hubungi kami
        langsung di{" "}
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold underline"
        >
          WhatsApp
        </a>{" "}
        dan tim kami akan membantu.
      </>
    ),
    retry: "Coba lagi",
  },
  en: {
    text: (
      <>
        Sorry, the AI assistant is currently unavailable. Please contact us
        directly on{" "}
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold underline"
        >
          WhatsApp
        </a>{" "}
        and our team will help.
      </>
    ),
    retry: "Retry",
  },
};

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
  // Language for the error card, set alongside status "error". Defaults
  // to "id" if somehow unset.
  errorLanguage?: Language;
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
    const copy = ERROR_COPY[message.errorLanguage ?? "id"];
    return (
      <div className="text-left">
        <div className="inline-block max-w-[85%] rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
          <p>{copy.text}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 text-xs font-semibold text-red-700 underline"
            >
              {copy.retry}
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
