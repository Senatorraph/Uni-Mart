import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MockVendor } from "@/lib/mock-data";

export function OpenBadge({ isOpen }: { isOpen: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
        isOpen
          ? "border-success/30 bg-success/15 text-success"
          : "border-destructive/30 bg-destructive/15 text-destructive"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${isOpen ? "bg-success" : "bg-destructive"}`} />
      {isOpen ? "Open" : "Closed"}
    </span>
  );
}

export function VendorCard({ vendor, showAction }: { vendor: MockVendor; showAction?: boolean }) {
  return (
    <div className="w-64 shrink-0 overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary/40">
      <div className="h-20 bg-gradient-to-r from-primary/30 via-primary/10 to-accent/20" />
      <div className="-mt-7 px-4 pb-4">
        <div className="grid h-14 w-14 place-items-center rounded-full border-4 border-card bg-muted text-2xl">
          {vendor.emoji}
        </div>
        <div className="mt-2 flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">{vendor.name}</p>
            <p className="text-xs text-muted-foreground">{vendor.category}</p>
          </div>
          <OpenBadge isOpen={vendor.isOpen} />
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Star className="h-3.5 w-3.5 fill-accent text-accent" />
          <span className="font-semibold text-foreground">{vendor.rating.toFixed(1)}</span>
          <span>· {vendor.sales} sales</span>
        </div>
        {showAction && (
          <Button variant="outline" size="sm" className="mt-3 w-full rounded-lg border-primary/50 text-primary">
            View Store
          </Button>
        )}
      </div>
    </div>
  );
}
