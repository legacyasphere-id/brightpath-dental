export function LeadCapture({ conversationId }: { conversationId: string }) {
  return (
    <div className="rounded-lg border border-clinic-border bg-clinic-surface p-4">
      <p className="text-sm text-clinic-body">
        Let&apos;s get you booked in — conversation {conversationId}
      </p>
    </div>
  );
}
