import type { MessageRole } from "@/types";

export interface ChatMessageData {
  id: string;
  role: MessageRole;
  content: string;
}

export function ChatMessage({ message }: { message: ChatMessageData }) {
  const isUser = message.role === "user";

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
