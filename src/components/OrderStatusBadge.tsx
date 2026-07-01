import { Badge } from "@/components/ui/badge";

const STYLES: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  confirmed: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  preparing: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
  ready: "bg-violet-500/15 text-violet-400 border-violet-500/30",
  out_for_delivery: "bg-purple-500/15 text-purple-300 border-purple-500/30",
  delivered: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  cancelled: "bg-red-500/15 text-red-400 border-red-500/30",
  refunded: "bg-zinc-500/15 text-zinc-300 border-zinc-500/30",
};

export function OrderStatusBadge({ status }: { status: string | null | undefined }) {
  const s = (status ?? "pending").toLowerCase();
  const cls = STYLES[s] ?? "bg-muted text-muted-foreground border-border";
  return (
    <Badge variant="outline" className={`capitalize ${cls}`}>
      {s.replace(/_/g, " ")}
    </Badge>
  );
}
