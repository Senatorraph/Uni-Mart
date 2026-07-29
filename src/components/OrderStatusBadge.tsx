const STYLES: Record<string, string> = {
  pending: "bg-accent/15 text-accent border-accent/30",
  confirmed: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  preparing: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
  ready: "bg-violet-500/15 text-violet-300 border-violet-500/30",
  picked_up: "bg-primary/20 text-primary border-primary/40",
  out_for_delivery: "bg-primary/20 text-primary border-primary/40",
  delivered: "bg-success/15 text-success border-success/30",
  disputed: "bg-destructive/15 text-destructive border-destructive/30",
  cancelled: "bg-destructive/15 text-destructive border-destructive/30",
  refunded: "bg-muted text-muted-foreground border-border",
};

export function OrderStatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  const cls = STYLES[s] ?? "bg-muted text-muted-foreground border-border";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold capitalize ${cls}`}
    >
      {s.replace(/_/g, " ")}
    </span>
  );
}
