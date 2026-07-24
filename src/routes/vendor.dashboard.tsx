import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Package, ShoppingBag, Wallet, Boxes, Plus } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Navbar } from "@/components/Navbar";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { EmptyState } from "@/components/EmptyState";
import { OrderStatusBadge } from "@/components/OrderStatusBadge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { formatNaira } from "@/lib/format";

export const Route = createFileRoute("/vendor/dashboard")({
  ssr: false,
  component: VendorDashboard,
});

function VendorDashboard() {
  const navigate = useNavigate();
  const { session, profile, loading, user } = useAuth();
  const [vendor, setVendor] = useState<any | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, revenue: 0, products: 0 });
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!session) {
      navigate({ to: "/auth", search: { next: "" }, replace: true });
      return;
    }
    if (profile && profile.role !== "vendor" && profile.role !== "super_admin") {
      navigate({ to: "/", replace: true });
    }
  }, [loading, session, profile, navigate]);

  const load = async () => {
    if (!user) return;
    setFetching(true);
    const { data: v } = await (supabase as any)
      .from("vendors")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    setVendor(v);
    if (!v) {
      setFetching(false);
      return;
    }
    const [{ data: ords }, { count: prodCount }] = await Promise.all([
      (supabase as any)
        .from("orders")
        .select("id, total, status, created_at, student_id, profiles:student_id(full_name)")
        .eq("vendor_id", v.id)
        .order("created_at", { ascending: false })
        .limit(20),
      (supabase as any)
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("vendor_id", v.id),
    ]);
    const list = ords ?? [];
    setOrders(list);
    setStats({
      total: list.length,
      pending: list.filter((o: any) => ["pending", "confirmed", "preparing"].includes((o.status ?? "").toLowerCase())).length,
      revenue: list
        .filter((o: any) => (o.status ?? "").toLowerCase() === "delivered")
        .reduce((s: number, o: any) => s + Number(o.total ?? 0), 0),
      products: prodCount ?? 0,
    });
    setFetching(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Realtime orders
  useEffect(() => {
    if (!vendor?.id) return;
    const channel = (supabase as any)
      .channel("vendor-orders")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders", filter: `vendor_id=eq.${vendor.id}` },
        () => load(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vendor?.id]);

  const toggleOpen = async (open: boolean) => {
    if (!vendor) return;
    const { error } = await (supabase as any).from("vendors").update({ is_open: open }).eq("id", vendor.id);
    if (error) toast.error(error.message);
    else {
      setVendor({ ...vendor, is_open: open });
      toast.success(open ? "Store is now open" : "Store is now closed");
    }
  };

  if (loading || fetching) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <LoadingSpinner label="Loading dashboard..." />
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="mx-auto max-w-3xl px-4 py-10">
          <EmptyState
            title="No vendor profile yet"
            subtitle="Your account is marked as a vendor but no vendor store is set up. Contact your university admin."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">{vendor.business_name ?? "Vendor Dashboard"}</h1>
            <p className="text-sm text-muted-foreground">Manage your store, orders and products.</p>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-2">
            <div className="text-sm">
              <div className="font-medium">{vendor.is_open ? "Store Open" : "Store Closed"}</div>
              <div className="text-xs text-muted-foreground">Toggle availability</div>
            </div>
            <Switch checked={!!vendor.is_open} onCheckedChange={toggleOpen} />
          </div>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={ShoppingBag} label="Total Orders" value={stats.total.toString()} />
          <StatCard icon={Package} label="Pending Orders" value={stats.pending.toString()} tint="amber" />
          <StatCard icon={Wallet} label="Total Revenue" value={formatNaira(stats.revenue)} tint="emerald" />
          <StatCard icon={Boxes} label="Total Products" value={stats.products.toString()} tint="primary" />
        </div>

        <div className="mb-6 flex flex-wrap gap-3">
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> Add New Product
          </Button>
          <Button variant="secondary">View All Products</Button>
          <Button variant="secondary">View All Orders</Button>
        </div>

        <div className="rounded-xl border border-border bg-card">
          <div className="border-b border-border px-5 py-4">
            <h2 className="font-semibold">Recent Orders</h2>
          </div>
          {orders.length === 0 ? (
            <div className="p-6">
              <EmptyState title="No orders yet" subtitle="New orders will appear here in real time." />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs uppercase text-muted-foreground">
                  <tr className="border-b border-border">
                    <th className="px-5 py-3 text-left font-medium">Order</th>
                    <th className="px-5 py-3 text-left font-medium">Student</th>
                    <th className="px-5 py-3 text-left font-medium">Total</th>
                    <th className="px-5 py-3 text-left font-medium">Status</th>
                    <th className="px-5 py-3 text-left font-medium">Placed</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id} className="border-b border-border/60 last:border-0 hover:bg-muted/30">
                      <td className="px-5 py-3 font-mono text-xs">
                        #{String(o.id).slice(0, 8)}
                      </td>
                      <td className="px-5 py-3">{o.profiles?.full_name ?? "—"}</td>
                      <td className="px-5 py-3 font-semibold">{formatNaira(o.total ?? 0)}</td>
                      <td className="px-5 py-3">
                        <OrderStatusBadge status={o.status} />
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {o.created_at ? new Date(o.created_at).toLocaleString() : ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  tint = "primary",
}: {
  icon: any;
  label: string;
  value: string;
  tint?: "primary" | "amber" | "emerald";
}) {
  const tintCls =
    tint === "amber"
      ? "bg-amber-500/15 text-amber-400"
      : tint === "emerald"
      ? "bg-emerald-500/15 text-emerald-400"
      : "bg-primary/15 text-primary";
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg ${tintCls}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}
