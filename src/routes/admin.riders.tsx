import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { AdminLayout } from "@/components/layouts/AdminLayout";
import { EmptyState } from "@/components/EmptyState";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { AdminRoute } from "@/components/ProtectedRoute";

export const Route = createFileRoute("/admin/riders")({
  head: () => ({
    meta: [
      { title: "Riders — UniMarket Admin" },
      { name: "description", content: "Manage campus delivery riders, verification and performance." },
      { property: "og:title", content: "Riders — UniMarket Admin" },
      { property: "og:description", content: "Manage campus delivery riders, verification and performance." },
    ],
  }),
  component: () => (
    <AdminRoute>
      <Page />
    </AdminRoute>
  ),
});

type AdminRider = {
  id: string;
  full_name: string;
  phone: string | null;
  created_at: string;
  is_active: boolean;
  completedDeliveries: number;
};

function Page() {
  const { profile } = useAuth();
  const [riders, setRiders] = useState<AdminRider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.university_id) return;

    const universityId = profile.university_id;
    let cancelled = false;

    async function fetchRiders() {
      setLoading(true);

      const [ridersRes, deliveriesRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, full_name, phone, created_at, is_active")
          .eq("university_id", universityId)
          .eq("role", "rider")
          .order("created_at", { ascending: false }),
        supabase
          .from("deliveries")
          .select("rider_id")
          .eq("university_id", universityId)
          .eq("status", "delivered"),
      ]);

      if (cancelled) return;

      if (ridersRes.error) {
        console.error("Error fetching riders:", ridersRes.error.message);
        setLoading(false);
        return;
      }

      const countByRider = new Map<string, number>();
      for (const delivery of deliveriesRes.data ?? []) {
        if (!delivery.rider_id) continue;
        countByRider.set(delivery.rider_id, (countByRider.get(delivery.rider_id) ?? 0) + 1);
      }

      setRiders(
        (ridersRes.data ?? []).map((rider) => ({
          ...rider,
          completedDeliveries: countByRider.get(rider.id) ?? 0,
        })),
      );
      setLoading(false);
    }

    fetchRiders();
    return () => {
      cancelled = true;
    };
  }, [profile?.university_id]);

  return (
    <AdminLayout title="Riders">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {loading ? (
          <LoadingSpinner label="Loading riders..." />
        ) : riders.length === 0 ? (
          <EmptyState title="No riders yet" subtitle="Registered riders will appear here." />
        ) : (
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    {["Name", "Phone", "Status", "Completed Deliveries", "Member Since"].map((h) => (
                      <th key={h} className="px-5 py-3 text-left font-medium">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {riders.map((rider) => (
                    <tr key={rider.id} className="border-t border-border hover:bg-muted/20">
                      <td className="px-5 py-3 font-semibold">{rider.full_name}</td>
                      <td className="px-5 py-3 text-muted-foreground">{rider.phone ?? "—"}</td>
                      <td className="px-5 py-3">
                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
                            rider.is_active
                              ? "border-success/30 bg-success/15 text-success"
                              : "border-destructive/30 bg-destructive/15 text-destructive"
                          }`}
                        >
                          {rider.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-5 py-3 font-semibold">{rider.completedDeliveries}</td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {new Date(rider.created_at).toLocaleDateString("en-NG", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
