import type { Message } from "@/types";

export function ChatMessage({ message }: { message: Message }) {
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
