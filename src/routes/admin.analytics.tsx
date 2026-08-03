import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { format, isSameDay, subDays } from "date-fns";
import { Package, Wallet } from "lucide-react";

import { AdminLayout } from "@/components/layouts/AdminLayout";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { formatNaira } from "@/lib/format";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { AdminRoute } from "@/components/ProtectedRoute";

export const Route = createFileRoute("/admin/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — UniMarket Admin" },
      { name: "description", content: "Track orders, revenue and growth across your campus marketplace." },
      { property: "og:title", content: "Analytics — UniMarket Admin" },
      { property: "og:description", content: "Track orders, revenue and growth across your campus marketplace." },
    ],
  }),
  component: () => (
    <AdminRoute>
      <Page />
    </AdminRoute>
  ),
});

type RecentOrder = { created_at: string; total_amount: number; status: string };
type CategoryBreakdown = { category: string; qty: number; pct: number };

function Page() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [topCategories, setTopCategories] = useState<CategoryBreakdown[]>([]);

  useEffect(() => {
    if (!profile?.university_id) return;

    const universityId = profile.university_id;
    let cancelled = false;

    async function fetchAnalytics() {
      setLoading(true);

      const sevenDaysAgo = subDays(new Date(), 6);
      sevenDaysAgo.setHours(0, 0, 0, 0);

      const [ordersRes, revenueRes, totalOrdersRes, categoriesRes] = await Promise.all([
        // Orders in the last 7 days — powers the weekly bar chart.
        supabase
          .from("orders")
          .select("created_at, total_amount, status")
          .eq("university_id", universityId)
          .gte("created_at", sevenDaysAgo.toISOString()),

        // All-time revenue from completed orders.
        supabase
          .from("orders")
          .select("total_amount")
          .eq("university_id", universityId)
          .in("status", ["delivered", "completed"]),

        // All-time order count.
        supabase
          .from("orders")
          .select("id", { count: "exact", head: true })
          .eq("university_id", universityId),

        // Category breakdown — order_items has no university_id column, so scope
        // through the linked order via an inner join instead.
        supabase
          .from("order_items")
          .select(
            `
            quantity,
            product:products(category),
            order:orders!inner(university_id)
          `,
          )
          .eq("order.university_id", universityId),
      ]);

      if (cancelled) return;

      setTotalRevenue(revenueRes.data?.reduce((sum, o) => sum + o.total_amount, 0) ?? 0);
      setTotalOrders(totalOrdersRes.count ?? 0);
      setRecentOrders(ordersRes.data ?? []);

      const totals = new Map<string, number>();
      for (const item of categoriesRes.data ?? []) {
        const category = item.product?.category ?? "Other";
        totals.set(category, (totals.get(category) ?? 0) + item.quantity);
      }
      const totalQty = [...totals.values()].reduce((sum, v) => sum + v, 0);
      setTopCategories(
        [...totals.entries()]
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([category, qty]) => ({
            category,
            qty,
            pct: totalQty > 0 ? Math.round((qty / totalQty) * 100) : 0,
          })),
      );

      setLoading(false);
    }

    fetchAnalytics();
    return () => {
      cancelled = true;
    };
  }, [profile?.university_id]);

  const last7Days = Array.from({ length: 7 }).map((_, i) => subDays(new Date(), 6 - i));
  const ordersByDay = last7Days.map((day) => ({
    label: format(day, "EEE"),
    count: recentOrders.filter((o) => isSameDay(new Date(o.created_at), day)).length,
  }));
  const maxOrdersInDay = Math.max(1, ...ordersByDay.map((d) => d.count));

  if (loading) {
    return (
      <AdminLayout title="Analytics">
        <div className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner label="Loading analytics..." />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Analytics">
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Total Revenue</span>
              <Wallet className="h-4 w-4 text-success" />
            </div>
            <p className="mt-3 text-2xl font-extrabold">{formatNaira(totalRevenue)}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Total Orders</span>
              <Package className="h-4 w-4 text-primary" />
            </div>
            <p className="mt-3 text-2xl font-extrabold">{totalOrders.toLocaleString()}</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm font-semibold">Orders this week</p>
            <div className="mt-4 flex h-32 items-end gap-2">
              {ordersByDay.map((d) => (
                <div key={d.label} className="flex flex-1 flex-col items-center gap-2">
                  <div
                    className="w-full rounded-t bg-gradient-to-t from-primary/40 to-primary transition-all"
                    style={{ height: `${(d.count / maxOrdersInDay) * 100}%` }}
                  />
                  <span className="text-[11px] text-muted-foreground">{d.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm font-semibold">Top categories</p>
            {topCategories.length === 0 ? (
              <p className="mt-4 text-xs text-muted-foreground">No orders placed yet.</p>
            ) : (
              <div className="mt-4 space-y-3 text-xs">
                {topCategories.map((c) => (
                  <div key={c.category}>
                    <div className="mb-1 flex justify-between text-muted-foreground">
                      <span>{c.category}</span>
                      <span>{c.pct}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-accent" style={{ width: `${c.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
