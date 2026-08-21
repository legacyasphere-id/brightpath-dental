"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
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

  // At 375px the launcher (fixed bottom-right) can land on top of page text
  // at whatever scroll position happens to put content there — documented
  // in BRIGHTPATHHANDOFF.md against Citra Dewi's specialty line, but it's
  // generic to any fixed element over scrollable content, not that section
  // specifically. Shrinking it on mobile (below) reduces how much text any
  // one position can cover; fading it while the page is actively moving
  // means it isn't sitting solid on top of text as it scrolls past.
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    function handleScroll() {
      setIsScrolling(true);
      clearTimeout(scrollTimeout.current);
      scrollTimeout.current = setTimeout(() => setIsScrolling(false), 350);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(scrollTimeout.current);
    };
  }, []);

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
        className={`fixed bottom-4 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-clinic-mint text-white shadow-lg transition-opacity duration-300 sm:bottom-6 sm:right-6 sm:h-14 sm:w-14 ${
          isScrolling && !isOpen ? "opacity-40" : "opacity-100"
        }`}
        aria-label="Open chat"
      >
        <MessageCircle size={22} strokeWidth={1.75} />
      </button>
    </ChatContext.Provider>
  );
}
