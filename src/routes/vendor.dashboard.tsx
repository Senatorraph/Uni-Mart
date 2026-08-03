import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Boxes, Clock, Package, Wallet, Zap } from "lucide-react";

import { VendorLayout } from "@/components/layouts/VendorLayout";
import { OrderStatusBadge } from "@/components/OrderStatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { formatNaira } from "@/lib/format";
import { supabase } from "@/integrations/supabase/client";
import { useVendor } from "@/hooks/useVendor";
import { VendorRoute } from "@/components/ProtectedRoute";

export const Route = createFileRoute("/vendor/dashboard")({
  head: () => ({
    meta: [
      { title: "Vendor Dashboard — UniMarket" },
      { name: "description", content: "Track campus orders, revenue and AI demand forecasts for your UniMarket store." },
      { property: "og:title", content: "Vendor Dashboard — UniMarket" },
      { property: "og:description", content: "Track orders, revenue and demand forecasts for your store." },
    ],
  }),
  component: () => (
    <VendorRoute>
      <VendorDashboard />
    </VendorRoute>
  ),
});

type DashboardOrder = {
  id: string;
  status: string;
  total_amount: number;
  created_at: string;
  delivery_address: string;
  student: { full_name: string } | null;
  items: { quantity: number; product: { name: string } | null }[] | null;
};

function StatCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Package;
  label: string;
  value: string;
  tone?: "accent" | "success";
}) {
  const color = tone === "accent" ? "text-accent" : tone === "success" ? "text-success" : "text-primary";
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <Icon className={`h-4 w-4 ${color}`} />
      </div>
      <p className="mt-3 text-2xl font-extrabold">{value}</p>
    </div>
  );
}

const FORECAST_VALUES = [40, 65, 45, 80, 55, 90, 70];
const FORECAST_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function VendorDashboard() {
  const navigate = useNavigate();
  const { vendor, loading: vendorLoading } = useVendor();

  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
  });
  const [recentOrders, setRecentOrders] = useState<DashboardOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!vendor?.id) return;

    const vendorId = vendor.id;
    let cancelled = false;

    async function fetchDashboardData() {
      setLoading(true);

      const [ordersRes, productsRes] = await Promise.all([
        supabase
          .from("orders")
          .select(
            `
            id, status, total_amount, created_at, delivery_address,
            student:profiles(full_name),
            items:order_items(
              quantity,
              product:products(name)
            )
          `,
          )
          .eq("vendor_id", vendorId)
          .order("created_at", { ascending: false }),
        supabase.from("products").select("id, status").eq("vendor_id", vendorId),
      ]);

      if (cancelled) return;

      if (ordersRes.data) {
        const orders = ordersRes.data as unknown as DashboardOrder[];
        setRecentOrders(orders.slice(0, 10));

        setStats({
          totalOrders: orders.length,
          pendingOrders: orders.filter((o) => ["paid", "confirmed"].includes(o.status)).length,
          totalRevenue: orders
            .filter((o) => ["delivered", "completed"].includes(o.status))
            .reduce((sum, o) => sum + o.total_amount, 0),
          totalProducts: productsRes.data?.length ?? 0,
        });
      }

      setLoading(false);
    }

    fetchDashboardData();

    const sub = supabase
      .channel(`vendor-orders-${vendorId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders", filter: `vendor_id=eq.${vendorId}` },
        () => fetchDashboardData(),
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders", filter: `vendor_id=eq.${vendorId}` },
        () => fetchDashboardData(),
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(sub);
    };
  }, [vendor?.id]);

  if (vendorLoading) {
    return (
      <VendorLayout title="Vendor Dashboard">
        <div className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner label="Loading your store..." />
        </div>
      </VendorLayout>
    );
  }

  if (!vendor) {
    return (
      <VendorLayout title="Vendor Dashboard">
        <div className="mx-auto max-w-3xl px-4 py-10">
          <EmptyState
            title="No vendor profile found"
            subtitle="We couldn't find a store linked to your account."
          />
        </div>
      </VendorLayout>
    );
  }

  const forecastMax = Math.max(...FORECAST_VALUES);

  return (
    <VendorLayout title="Vendor Dashboard">
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8">
        <h1 className="text-2xl font-extrabold">Vendor Dashboard</h1>

        {vendor.status === "pending" && (
          <div className="rounded-xl border border-accent/30 bg-accent/10 p-4">
            <p className="text-sm font-medium text-accent">⏳ Store Pending Approval</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Your store is under review by the university admin. You will be notified once
              approved and your products become visible to students.
            </p>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={Package} label="Total Orders" value={stats.totalOrders.toLocaleString()} />
          <StatCard
            icon={Clock}
            label="Pending Orders"
            value={stats.pendingOrders.toLocaleString()}
            tone="accent"
          />
          <StatCard icon={Wallet} label="Total Revenue" value={formatNaira(stats.totalRevenue)} tone="success" />
          <StatCard icon={Boxes} label="Total Products" value={stats.totalProducts.toLocaleString()} />
        </div>

        <div className="flex flex-wrap gap-3">
          <Button asChild className="rounded-lg glow-primary">
            <Link to="/vendor/products">Add Product</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-lg">
            <Link to="/vendor/orders">View Orders</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-lg">
            <Link to="/">View Store</Link>
          </Button>
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-sm font-bold">Recent Orders</h2>
          </div>
          {loading ? (
            <LoadingSpinner label="Loading orders..." />
          ) : recentOrders.length === 0 ? (
            <EmptyState title="No orders yet" subtitle="New orders will appear here in real time." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    {["Order ID", "Student", "Items", "Total", "Status", "Time", "Action"].map((h) => (
                      <th key={h} className="px-5 py-3 text-left font-medium">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="cursor-pointer border-t border-border transition-colors hover:bg-muted/20"
                      onClick={() => navigate({ to: "/vendor/orders" })}
                    >
                      <td className="px-5 py-3 font-semibold">#{order.id.slice(0, 8).toUpperCase()}</td>
                      <td className="px-5 py-3">{order.student?.full_name || "Unknown"}</td>
                      <td className="max-w-[220px] truncate px-5 py-3 text-muted-foreground">
                        {order.items?.map((item) => `${item.product?.name} ×${item.quantity}`).join(", ")}
                      </td>
                      <td className="px-5 py-3 font-semibold">{formatNaira(order.total_amount)}</td>
                      <td className="px-5 py-3">
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {new Date(order.created_at).toLocaleString("en-NG", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-5 py-3">
                        <Button
                          asChild
                          size="sm"
                          variant="outline"
                          className="rounded-lg"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Link to="/vendor/orders">View</Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-primary/40 bg-primary/5 p-5">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 fill-primary text-primary" />
            <h2 className="text-sm font-bold">AI Demand Forecast</h2>
            <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-accent">
              Coming Soon
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Predicted orders for {vendor.business_name} over the next 7 days. AI forecasting
            activates once your ML microservice is deployed.
          </p>
          <div className="mt-5 flex h-40 items-end gap-3">
            {FORECAST_VALUES.map((v, i) => (
              <div key={FORECAST_DAYS[i]} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-lg bg-gradient-to-t from-primary/40 to-primary transition-all"
                  style={{ height: `${(v / forecastMax) * 100}%` }}
                />
                <span className="text-[11px] text-muted-foreground">{FORECAST_DAYS[i]}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-center text-[11px] font-semibold text-accent">Powered by UniMarket AI</p>
        </div>
      </div>
    </VendorLayout>
  );
}
