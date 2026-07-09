export function ChatPanel({ onClose }: { onClose: () => void }) {
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
      <div className="flex-1 overflow-y-auto p-4" />
      <div className="border-t border-clinic-border p-3">
        <input
          className="w-full rounded-lg border border-clinic-border px-3 py-2 text-sm"
          placeholder="Ask about services, pricing, or doctors..."
        />
      </div>
    </div>
  );
}
