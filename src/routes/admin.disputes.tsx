import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { AdminLayout } from "@/components/layouts/AdminLayout";
import { DisputeCard, type AdminDispute } from "@/components/DisputeCard";
import { EmptyState } from "@/components/EmptyState";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { AdminRoute } from "@/components/ProtectedRoute";

export const Route = createFileRoute("/admin/disputes")({
  head: () => ({
    meta: [
      { title: "Disputes — UniMarket Admin" },
      { name: "description", content: "Review and resolve order disputes raised by students and vendors." },
      { property: "og:title", content: "Disputes — UniMarket Admin" },
      { property: "og:description", content: "Review and resolve order disputes raised by students and vendors." },
    ],
  }),
  component: () => (
    <AdminRoute>
      <Page />
    </AdminRoute>
  ),
});

type DisputeFilter = "open" | "resolved" | "all";

const FILTERS: { key: DisputeFilter; label: string }[] = [
  { key: "open", label: "Open" },
  { key: "resolved", label: "Resolved" },
  { key: "all", label: "All" },
];

function Page() {
  const { profile } = useAuth();
  const [disputes, setDisputes] = useState<AdminDispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<DisputeFilter>("open");

  useEffect(() => {
    if (!profile?.university_id) return;

    const universityId = profile.university_id;
    let cancelled = false;

    async function fetchDisputes() {
      setLoading(true);

      let query = supabase
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
        .order("created_at", { ascending: false });

      if (filter === "open") {
        query = query.in("status", ["open", "under_review"]);
      } else if (filter === "resolved") {
        query = query.in("status", ["resolved_refund", "resolved_release", "closed"]);
      }

      const { data, error } = await query;

      console.log("Disputes fetch result:", data, error);
      console.log("Profile university_id:", profile?.university_id);
      console.log("Profile role:", profile?.role);

      if (cancelled) return;

      if (error) {
        console.error("Error fetching disputes:", error.message);
      } else {
        setDisputes((data as unknown as AdminDispute[]) ?? []);
      }
      setLoading(false);
    }

    fetchDisputes();
    return () => {
      cancelled = true;
    };
  }, [profile?.university_id, filter]);

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

    const dispute = disputes.find((d) => d.id === disputeId);
    if (dispute?.order?.id) {
      await supabase
        .from("orders")
        .update({ status: resolution === "resolved_refund" ? "refunded" : "completed" })
        .eq("id", dispute.order.id);
    }

    if (filter === "open") {
      setDisputes((prev) => prev.filter((d) => d.id !== disputeId));
    } else {
      setDisputes((prev) =>
        prev.map((d) =>
          d.id === disputeId
            ? { ...d, status: resolution, resolution_note: note, resolved_at: new Date().toISOString() }
            : d,
        ),
      );
    }
  }

  return (
    <AdminLayout title="Disputes">
      <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
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
          <LoadingSpinner label="Loading disputes..." />
        ) : disputes.length === 0 ? (
          <EmptyState title="No disputes found" subtitle={`No ${filter === "all" ? "" : filter + " "}disputes.`} />
        ) : (
          <div className="space-y-3">
            {disputes.map((dispute) => (
              <DisputeCard key={dispute.id} dispute={dispute} onResolve={resolveDispute} />
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
