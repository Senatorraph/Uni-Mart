import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AlertTriangle, Clock, Loader2, Package, Store } from "lucide-react";

import { AdminLayout } from "@/components/layouts/AdminLayout";
import { DisputeCard, type AdminDispute } from "@/components/DisputeCard";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { FORECAST } from "@/lib/mock-data";
import { AdminRoute } from "@/components/ProtectedRoute";

export const Route = createFileRoute("/admin/dashboard")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — UniMarket" },
      { name: "description", content: "Approve campus vendors, review disputes and monitor marketplace analytics for your university." },
      { property: "og:title", content: "Admin Dashboard — UniMarket" },
      { property: "og:description", content: "Approve vendors, review disputes and monitor analytics." },
    ],
  }),
  component: () => (
    <AdminRoute>
      <AdminDashboard />
    </AdminRoute>
  ),
});

type PendingVendor = {
  id: string;
  business_name: string;
  category: string;
  status: string;
  created_at: string;
  owner: { full_name: string; phone: string | null } | null;
};

function AdminDashboard() {
  const { profile } = useAuth();

  const [stats, setStats] = useState({
    totalVendors: 0,
    pendingApprovals: 0,
    ordersToday: 0,
    activeDisputes: 0,
  });
  const [pendingVendors, setPendingVendors] = useState<PendingVendor[]>([]);
  const [activeDisputes, setActiveDisputes] = useState<AdminDispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (!profile?.university_id) return;

    const universityId = profile.university_id;
    let cancelled = false;

    async function fetchDashboardData() {
      setLoading(true);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [vendorsRes, pendingRes, ordersRes, disputesRes] = await Promise.all([
        supabase
          .from("vendors")
          .select("id", { count: "exact", head: true })
          .eq("university_id", universityId)
          .eq("status", "approved"),

        supabase
          .from("vendors")
          .select(
            `
            id, business_name, category, status, created_at,
            owner:profiles(full_name, phone)
          `,
          )
          .eq("university_id", universityId)
          .eq("status", "pending")
          .order("created_at", { ascending: false }),

        supabase
          .from("orders")
          .select("id", { count: "exact", head: true })
          .eq("university_id", universityId)
          .gte("created_at", today.toISOString()),

        supabase
          .from("disputes")
          .select(
            `
            id, order_id, raised_by, university_id, reason, evidence_urls,
            classifier_score, classifier_recommendation, status,
            resolved_by, resolution_note, resolved_at, created_at,
            order:orders(id, total_amount),
            raised_by_profile:profiles!disputes_raised_by_fkey(full_name)
          `,
          )
          .eq("university_id", universityId)
          .in("status", ["open", "under_review"])
          .order("created_at", { ascending: false }),
      ]);

      if (cancelled) return;

      setStats({
        totalVendors: vendorsRes.count ?? 0,
        pendingApprovals: pendingRes.data?.length ?? 0,
        ordersToday: ordersRes.count ?? 0,
        activeDisputes: disputesRes.data?.length ?? 0,
      });

      if (pendingRes.data) setPendingVendors(pendingRes.data as unknown as PendingVendor[]);
      if (disputesRes.data) setActiveDisputes(disputesRes.data as unknown as AdminDispute[]);

      setLoading(false);
    }

    fetchDashboardData();

    const sub = supabase
      .channel("admin-dashboard")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "vendors", filter: `university_id=eq.${universityId}` },
        () => fetchDashboardData(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "disputes", filter: `university_id=eq.${universityId}` },
        () => fetchDashboardData(),
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(sub);
    };
  }, [profile?.university_id]);

  async function approveVendor(vendorId: string) {
    setProcessingId(vendorId);

    const { error } = await supabase.from("vendors").update({ status: "approved" }).eq("id", vendorId);

    if (error) {
      console.error("Failed to approve vendor:", error.message);
    } else {
      setPendingVendors((prev) => prev.filter((v) => v.id !== vendorId));
      setStats((prev) => ({
        ...prev,
        totalVendors: prev.totalVendors + 1,
        pendingApprovals: prev.pendingApprovals - 1,
      }));
    }

    setProcessingId(null);
  }

  async function rejectVendor(vendorId: string) {
    setProcessingId(vendorId);

    const { error } = await supabase.from("vendors").update({ status: "rejected" }).eq("id", vendorId);

    if (error) {
      console.error("Failed to reject vendor:", error.message);
    } else {
      setPendingVendors((prev) => prev.filter((v) => v.id !== vendorId));
      setStats((prev) => ({ ...prev, pendingApprovals: prev.pendingApprovals - 1 }));
    }

    setProcessingId(null);
  }

  async function resolveDispute(
    disputeId: string,
    resolution: "resolved_refund" | "resolved_release",
    note: string,
  ) {
    const { error } = await supabase
      .from("disputes")
      .update({
        status: resolution,
        resolved_by: profile?.id,
        resolution_note: note,
        resolved_at: new Date().toISOString(),
      })
      .eq("id", disputeId);

    if (error) {
      console.error("Failed to resolve dispute:", error.message);
      return;
    }

    const dispute = activeDisputes.find((d) => d.id === disputeId);
    if (dispute?.order?.id) {
      await supabase
        .from("orders")
        .update({ status: resolution === "resolved_refund" ? "refunded" : "completed" })
        .eq("id", dispute.order.id);
    }

    setActiveDisputes((prev) => prev.filter((d) => d.id !== disputeId));
    setStats((prev) => ({ ...prev, activeDisputes: prev.activeDisputes - 1 }));
  }

  const max = Math.max(...FORECAST.map((f) => f.value));

  const statCards = [
    { label: "Total Vendors", value: stats.totalVendors, icon: Store, color: "text-primary" },
    { label: "Pending Approvals", value: stats.pendingApprovals, icon: Clock, color: "text-accent" },
    { label: "Orders Today", value: stats.ordersToday, icon: Package, color: "text-success" },
    { label: "Active Disputes", value: stats.activeDisputes, icon: AlertTriangle, color: "text-destructive" },
  ];

  return (
    <AdminLayout title="Admin Dashboard">
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8">
        <h1 className="text-2xl font-extrabold">Admin Dashboard</h1>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{label}</span>
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
              <p className="mt-3 text-2xl font-extrabold">{value.toLocaleString()}</p>
            </div>
          ))}
        </div>

        <section>
          <h2 className="mb-4 text-lg font-bold">Pending Vendor Approvals</h2>
          {loading ? (
            <LoadingSpinner label="Loading vendor applications..." />
          ) : pendingVendors.length === 0 ? (
            <p className="py-4 text-sm text-muted-foreground">No pending vendor applications</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {pendingVendors.map((vendor) => (
                <div key={vendor.id} className="rounded-xl border border-border bg-card p-5">
                  <p className="text-sm font-bold">{vendor.business_name}</p>
                  <p className="text-xs text-accent">{vendor.category}</p>
                  <p className="mt-2 text-xs text-muted-foreground">Owner: {vendor.owner?.full_name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Applied{" "}
                    {new Date(vendor.created_at).toLocaleDateString("en-NG", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                  <div className="mt-4 flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1 gap-1 rounded-lg bg-success text-success-foreground hover:bg-success/90"
                      disabled={processingId === vendor.id}
                      onClick={() => approveVendor(vendor.id)}
                    >
                      {processingId === vendor.id && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 gap-1 rounded-lg border-destructive/60 text-destructive"
                      disabled={processingId === vendor.id}
                      onClick={() => rejectVendor(vendor.id)}
                    >
                      {processingId === vendor.id && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-4 text-lg font-bold">Active Disputes</h2>
          {loading ? (
            <LoadingSpinner label="Loading disputes..." />
          ) : activeDisputes.length === 0 ? (
            <p className="py-4 text-sm text-muted-foreground">No active disputes</p>
          ) : (
            <div className="space-y-3">
              {activeDisputes.map((dispute) => (
                <DisputeCard key={dispute.id} dispute={dispute} onResolve={resolveDispute} />
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-4 text-lg font-bold">Platform Analytics</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-border bg-card p-5">
              <p className="text-sm font-semibold">Orders over time</p>
              <div className="mt-4 flex h-32 items-end gap-2">
                {FORECAST.map((f) => (
                  <div key={f.day} className="flex-1 rounded-t bg-primary/70" style={{ height: `${(f.value / max) * 100}%` }} />
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <p className="text-sm font-semibold">Revenue</p>
              <div className="mt-4 flex h-32 items-end gap-2">
                {FORECAST.map((f) => (
                  <div key={f.day} className="flex-1 rounded-t bg-success/70" style={{ height: `${(f.value / max) * 90}%` }} />
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <p className="text-sm font-semibold">Top categories</p>
              <div className="mt-4 space-y-3 text-xs">
                {[["Food & Drinks", 62], ["Electronics", 21], ["Beauty", 10], ["Books", 7]].map(([label, pct]) => (
                  <div key={label as string}>
                    <div className="mb-1 flex justify-between text-muted-foreground">
                      <span>{label}</span>
                      <span>{pct}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}
