import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Star } from "lucide-react";

import { AdminLayout } from "@/components/layouts/AdminLayout";
import { EmptyState } from "@/components/EmptyState";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { AdminRoute } from "@/components/ProtectedRoute";
import type { VendorStatus } from "@/types";

export const Route = createFileRoute("/admin/vendors")({
  head: () => ({
    meta: [
      { title: "Vendors — UniMarket Admin" },
      { name: "description", content: "Review and manage every vendor operating on your campus marketplace." },
      { property: "og:title", content: "Vendors — UniMarket Admin" },
      { property: "og:description", content: "Review and manage every vendor operating on your campus marketplace." },
    ],
  }),
  component: () => (
    <AdminRoute>
      <Page />
    </AdminRoute>
  ),
});

type AdminVendor = {
  id: string;
  business_name: string;
  category: string;
  status: VendorStatus;
  rating: number;
  total_ratings: number;
  is_open: boolean;
  created_at: string;
  owner: { full_name: string; phone: string | null } | null;
};

type VendorFilter = "all" | "approved" | "pending" | "rejected";

const FILTERS: { key: VendorFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "approved", label: "Approved" },
  { key: "pending", label: "Pending" },
  { key: "rejected", label: "Rejected" },
];

const STATUS_STYLES: Record<string, string> = {
  approved: "border-success/30 bg-success/15 text-success",
  pending: "border-accent/30 bg-accent/15 text-accent",
  rejected: "border-destructive/30 bg-destructive/15 text-destructive",
  suspended: "border-border bg-muted text-muted-foreground",
};

function Page() {
  const { profile } = useAuth();
  const [vendors, setVendors] = useState<AdminVendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<VendorFilter>("all");
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (!profile?.university_id) return;

    const universityId = profile.university_id;
    let cancelled = false;

    async function fetchVendors() {
      setLoading(true);

      let query = supabase
        .from("vendors")
        .select(
          `
          id, business_name, category, status, rating,
          total_ratings, is_open, created_at,
          owner:profiles(full_name, phone)
        `,
        )
        .eq("university_id", universityId)
        .order("created_at", { ascending: false });

      if (filter !== "all") {
        query = query.eq("status", filter);
      }

      const { data, error } = await query;
      if (cancelled) return;

      if (error) {
        console.error("Error fetching vendors:", error.message);
      } else {
        setVendors((data as unknown as AdminVendor[]) ?? []);
      }
      setLoading(false);
    }

    fetchVendors();
    return () => {
      cancelled = true;
    };
  }, [profile?.university_id, filter]);

  async function updateVendorStatus(vendorId: string, status: VendorStatus) {
    setProcessingId(vendorId);

    const { error } = await supabase.from("vendors").update({ status }).eq("id", vendorId);

    if (error) {
      console.error("Failed to update vendor status:", error.message);
    } else {
      setVendors((prev) => prev.map((v) => (v.id === vendorId ? { ...v, status } : v)));
    }

    setProcessingId(null);
  }

  return (
    <AdminLayout title="Vendors">
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8">
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all ${
                filter === f.key
                  ? "bg-primary text-primary-foreground glow-primary"
                  : "border border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <LoadingSpinner label="Loading vendors..." />
        ) : vendors.length === 0 ? (
          <EmptyState title="No vendors found" subtitle={`No ${filter === "all" ? "" : filter + " "}vendors yet.`} />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {vendors.map((vendor) => (
              <div key={vendor.id} className="space-y-3 rounded-xl border border-border bg-card p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{vendor.business_name}</p>
                    <p className="text-xs text-accent">{vendor.category}</p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold capitalize ${
                      STATUS_STYLES[vendor.status] ?? STATUS_STYLES.suspended
                    }`}
                  >
                    {vendor.status}
                  </span>
                </div>

                <div className="space-y-1 text-xs text-muted-foreground">
                  <p>Owner: {vendor.owner?.full_name ?? "Unknown"}</p>
                  {vendor.owner?.phone && <p>Phone: {vendor.owner.phone}</p>}
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-accent text-accent" />
                    <span className="font-semibold text-foreground">{Number(vendor.rating ?? 0).toFixed(1)}</span>
                    <span>({vendor.total_ratings ?? 0} ratings)</span>
                  </div>
                  <p>
                    Applied{" "}
                    {new Date(vendor.created_at).toLocaleDateString("en-NG", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {vendor.status === "pending" && (
                    <>
                      <Button
                        size="sm"
                        className="flex-1 gap-1 rounded-lg bg-success text-success-foreground hover:bg-success/90"
                        disabled={processingId === vendor.id}
                        onClick={() => updateVendorStatus(vendor.id, "approved")}
                      >
                        {processingId === vendor.id && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 gap-1 rounded-lg border-destructive/60 text-destructive"
                        disabled={processingId === vendor.id}
                        onClick={() => updateVendorStatus(vendor.id, "rejected")}
                      >
                        {processingId === vendor.id && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                        Reject
                      </Button>
                    </>
                  )}
                  {vendor.status === "approved" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 gap-1 rounded-lg border-destructive/60 text-destructive"
                      disabled={processingId === vendor.id}
                      onClick={() => updateVendorStatus(vendor.id, "suspended")}
                    >
                      {processingId === vendor.id && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                      Suspend
                    </Button>
                  )}
                  {vendor.status === "suspended" && (
                    <Button
                      size="sm"
                      className="flex-1 gap-1 rounded-lg bg-success text-success-foreground hover:bg-success/90"
                      disabled={processingId === vendor.id}
                      onClick={() => updateVendorStatus(vendor.id, "approved")}
                    >
                      {processingId === vendor.id && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                      Reactivate
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
