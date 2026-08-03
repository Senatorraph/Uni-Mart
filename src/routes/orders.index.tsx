import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ClipboardList } from "lucide-react";

import { StudentLayout } from "@/components/layouts/StudentLayout";
import { EmptyState } from "@/components/EmptyState";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { OrderStatusBadge } from "@/components/OrderStatusBadge";
import { Button } from "@/components/ui/button";
import { formatNaira } from "@/lib/format";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { StudentRoute } from "@/components/ProtectedRoute";
import type { OrderWithDetails } from "@/types";

export const Route = createFileRoute("/orders/")({
  head: () => ({
    meta: [
      { title: "My Orders — UniMarket" },
      {
        name: "description",
        content:
          "Track every campus order you have placed, from pending to delivered, in one place.",
      },
      { property: "og:title", content: "My Orders — UniMarket" },
      { property: "og:description", content: "Track every campus order you have placed." },
    ],
  }),
  component: () => (
    <StudentRoute>
      <OrdersPage />
    </StudentRoute>
  ),
});

type OrderFilter = "all" | "pending" | "delivered" | "disputed";

const FILTERS: { key: OrderFilter; label: string }[] = [
  { key: "all", label: "All Orders" },
  { key: "pending", label: "In Progress" },
  { key: "delivered", label: "Delivered" },
  { key: "disputed", label: "Disputed" },
];

function OrdersPage() {
  return (
    <StudentLayout>
      <OrdersPageContent />
    </StudentLayout>
  );
}

function OrdersPageContent() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<OrderFilter>("all");

  useEffect(() => {
    if (!profile?.id) return;

    const studentId = profile.id;
    let cancelled = false;
    setLoading(true);

    async function fetchOrders() {
      let query = supabase
        .from("order_summary")
        .select("*")
        .eq("student_id", studentId)
        .order("created_at", { ascending: false });

      if (activeFilter === "pending") {
        query = query.in("status", ["pending", "paid", "confirmed", "rider_assigned", "picked_up"]);
      } else if (activeFilter === "delivered") {
        query = query.in("status", ["delivered", "completed"]);
      } else if (activeFilter === "disputed") {
        query = query.eq("status", "disputed");
      }

      const { data, error } = await query;
      if (cancelled) return;

      if (error) {
        console.error("Error fetching orders:", error.message);
      } else {
        setOrders((data as OrderWithDetails[]) ?? []);
      }
      setLoading(false);
    }

    fetchOrders();
    return () => {
      cancelled = true;
    };
  }, [profile?.id, activeFilter]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-extrabold">My Orders</h1>

      <div className="mt-5 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setActiveFilter(f.key)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all ${
              activeFilter === f.key
                ? "bg-primary text-primary-foreground glow-primary"
                : "border border-border bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-4">
        {loading ? (
          <LoadingSpinner label="Loading your orders..." />
        ) : orders.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="No orders yet"
            subtitle={
              activeFilter === "all"
                ? "You haven't placed any orders yet"
                : `No ${activeFilter} orders found`
            }
            action={
              <Button asChild className="rounded-lg glow-primary">
                <Link to="/">Start Shopping</Link>
              </Button>
            }
          />
        ) : (
          orders.map((order) => (
            <div
              key={order.id}
              onClick={() => navigate({ to: "/orders/$id", params: { id: order.id } })}
              className="cursor-pointer rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40"
            >
              <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full bg-muted">
                  {order.vendor_logo ? (
                    <img
                      src={order.vendor_logo}
                      alt={order.vendor_name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-lg font-bold text-primary">
                      {order.vendor_name?.slice(0, 1).toUpperCase()}
                    </span>
                  )}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">{order.vendor_name}</p>
                  <p className="text-xs text-muted-foreground">
                    #{order.id.slice(0, 8).toUpperCase()} ·{" "}
                    {new Date(order.created_at).toLocaleDateString("en-NG", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <OrderStatusBadge status={order.status} />
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-lg font-extrabold">{formatNaira(order.total_amount)}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
