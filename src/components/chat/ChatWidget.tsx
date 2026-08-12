"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { MessageCircle } from "lucide-react";
import { ChatPanel } from "./ChatPanel";

interface ChatContextValue {
  // Opens the panel with the empty state, same as the launcher button.
  open: () => void;
  // Opens the panel and sends `text` immediately, reusing the exact send
  // path ChatEmptyState's own chips use — marketing CTAs get the same
  // "tap a question, get a real answer" behavior without a second chat
  // implementation.
  openWithMessage: (text: string) => void;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export function useChatWidget() {
  const ctx = useContext(ChatContext);
  if (!ctx) {
    throw new Error("useChatWidget must be used within the root layout's ChatWidget provider");
  }
  return ctx;
}

// Wraps the whole app (see layout.tsx) rather than sitting beside it, so
// any marketing component can call useChatWidget() to open the panel with
// a message already sent — not just the floating launcher button.
export function ChatWidget({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [initialMessage, setInitialMessage] = useState<string | null>(null);

  const open = useCallback(() => {
    setInitialMessage(null);
    setIsOpen(true);
  }, []);

  const openWithMessage = useCallback((text: string) => {
    setInitialMessage(text);
    setIsOpen(true);
  }, []);

  function handleClose() {
    setIsOpen(false);
    setInitialMessage(null);
  }

  return (
    <ChatContext.Provider value={{ open, openWithMessage }}>
      {children}
      {isOpen && <ChatPanel onClose={handleClose} initialMessage={initialMessage} />}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-clinic-mint text-white shadow-lg"
        aria-label="Open chat"
      >
        <MessageCircle size={24} strokeWidth={1.75} />
      </button>
    </ChatContext.Provider>
  );
}
