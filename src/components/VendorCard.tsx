import { Star } from "lucide-react";

export type VendorInfo = {
  id?: string;
  business_name?: string | null;
  logo_url?: string | null;
  rating?: number | null;
  is_open?: boolean | null;
  category?: string | null;
};

export function VendorCard({ vendor }: { vendor: VendorInfo }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full bg-muted">
        {vendor.logo_url ? (
          <img src={vendor.logo_url} alt={vendor.business_name ?? ""} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-lg font-bold text-primary">
            {(vendor.business_name ?? "?").charAt(0)}
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate font-semibold">{vendor.business_name ?? "Vendor"}</h3>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
              vendor.is_open
                ? "bg-emerald-500/15 text-emerald-400"
                : "bg-red-500/15 text-red-400"
            }`}
          >
            {vendor.is_open ? "Open" : "Closed"}
          </span>
        </div>
        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
          {vendor.rating != null && (
            <span className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-accent text-accent" />
              {Number(vendor.rating).toFixed(1)}
            </span>
          )}
          {vendor.category && <span>· {vendor.category}</span>}
        </div>
      </div>
    </div>
  );
}
