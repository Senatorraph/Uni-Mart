import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { VendorLayout } from "@/components/layouts/VendorLayout";
import { OrderStatusBadge } from "@/components/OrderStatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatNaira } from "@/lib/format";
import { supabase } from "@/integrations/supabase/client";
import { useVendor } from "@/hooks/useVendor";
import { VendorRoute } from "@/components/ProtectedRoute";

export const Route = createFileRoute("/vendor/orders")({
  head: () => ({
    meta: [
      { title: "Order Management — UniMarket Vendor" },
      { name: "description", content: "Confirm, track and resolve every order placed with your campus store." },
      { property: "og:title", content: "Order Management — UniMarket Vendor" },
      { property: "og:description", content: "Confirm, track and resolve orders for your store." },
    ],
  }),
  component: () => (
    <VendorRoute>
      <VendorOrders />
    </VendorRoute>
  ),
});

type VendorOrder = {
  id: string;
  status: string;
  total_amount: number;
  delivery_address: string;
  delivery_note: string | null;
  created_at: string;
  confirmed_at: string | null;
  student: { full_name: string; phone: string | null } | null;
  items:
    | {
        id: string;
        quantity: number;
        unit_price: number;
        product: { name: string; images: string[] } | null;
      }[]
    | null;
};

type OrderFilter = "all" | "pending" | "confirmed" | "delivered" | "disputed";

const FILTERS: { key: OrderFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "confirmed", label: "Confirmed" },
  { key: "delivered", label: "Delivered" },
  { key: "disputed", label: "Disputed" },
];

function VendorOrders() {
  const { vendor } = useVendor();
  const [orders, setOrders] = useState<VendorOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<OrderFilter>("all");
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  useEffect(() => {
    if (!vendor?.id) return;

    const vendorId = vendor.id;
    let cancelled = false;

    async function fetchOrders() {
      setLoading(true);

      let query = supabase
        .from("orders")
        .select(
          `
          id, status, total_amount, delivery_address,
          delivery_note, created_at, confirmed_at,
          student:profiles(full_name, phone),
          items:order_items(
            id, quantity, unit_price,
            product:products(name, images)
          )
        `,
        )
        .eq("vendor_id", vendorId)
        .order("created_at", { ascending: false });

      if (activeFilter === "pending") {
        query = query.eq("status", "paid");
      } else if (activeFilter === "confirmed") {
        query = query.in("status", ["confirmed", "rider_assigned", "picked_up"]);
      } else if (activeFilter === "delivered") {
        query = query.in("status", ["delivered", "completed"]);
      } else if (activeFilter === "disputed") {
        query = query.eq("status", "disputed");
      }

      const { data, error } = await query;
      if (cancelled) return;

      if (error) {
        console.error("Error fetching vendor orders:", error.message);
      } else {
        setOrders((data as unknown as VendorOrder[]) ?? []);
      }
      setLoading(false);
    }

    fetchOrders();

    const sub = supabase
      .channel(`vendor-all-orders-${vendorId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders", filter: `vendor_id=eq.${vendorId}` },
        () => fetchOrders(),
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(sub);
    };
  }, [vendor?.id, activeFilter]);

  async function confirmOrder(orderId: string) {
    setConfirmingId(orderId);

    const { error } = await supabase
      .from("orders")
      .update({ status: "confirmed", confirmed_at: new Date().toISOString() })
      .eq("id", orderId);

    if (error) {
      console.error("Failed to confirm order:", error.message);
    }

    setConfirmingId(null);
  }

  return (
    <VendorLayout title="Order Management">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-2xl font-extrabold">Order Management</h1>

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
            <LoadingSpinner label="Loading orders..." />
          ) : orders.length === 0 ? (
            <EmptyState
              title={`No ${activeFilter === "all" ? "" : activeFilter + " "}orders`}
              subtitle="New orders will appear here in real time."
            />
          ) : (
            orders.map((order) => (
              <div key={order.id} className="rounded-xl border border-border bg-card p-5">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{order.student?.full_name || "Unknown"}</p>
                    <p className="text-xs text-muted-foreground">
                      #{order.id.slice(0, 8).toUpperCase()} ·{" "}
                      {new Date(order.created_at).toLocaleString("en-NG", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <OrderStatusBadge status={order.status} />
                </div>

                <div className="mt-3 space-y-1.5">
                  {order.items?.map((item) => {
                    const image = item.product?.images?.[0];
                    return (
                      <div key={item.id} className="flex items-center gap-2 text-sm">
                        <div className="grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-lg bg-muted">
                          {image ? (
                            <img src={image} alt={item.product?.name} className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-xs" aria-hidden>
                              🛍️
                            </span>
                          )}
                        </div>
                        <span className="text-muted-foreground">
                          {item.product?.name} ×{item.quantity}
                        </span>
                        <span className="ml-auto font-medium">
                          {formatNaira(item.unit_price * item.quantity)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <p className="mt-3 text-xs text-muted-foreground">📍 {order.delivery_address}</p>
                {order.delivery_note && (
                  <p className="mt-1 text-xs text-muted-foreground">📝 {order.delivery_note}</p>
                )}

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <span className="text-lg font-extrabold">{formatNaira(order.total_amount)}</span>
                  <div className="ml-auto flex gap-2">
                    {order.status === "paid" && (
                      <Button
                        size="sm"
                        className="rounded-lg glow-primary"
                        disabled={confirmingId === order.id}
                        onClick={() => confirmOrder(order.id)}
                      >
                        {confirmingId === order.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "✓ Confirm Order"
                        )}
                      </Button>
                    )}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline" className="rounded-lg">
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Order #{order.id.slice(0, 8).toUpperCase()}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-3 text-sm">
                          <p>
                            <span className="text-muted-foreground">Student:</span>{" "}
                            {order.student?.full_name || "Unknown"}
                          </p>
                          {order.student?.phone && (
                            <p>
                              <span className="text-muted-foreground">Phone:</span> {order.student.phone}
                            </p>
                          )}
                          <p>
                            <span className="text-muted-foreground">Items:</span>{" "}
                            {order.items?.map((i) => `${i.product?.name} ×${i.quantity}`).join(", ")}
                          </p>
                          <p>
                            <span className="text-muted-foreground">Address:</span> {order.delivery_address}
                          </p>
                          {order.delivery_note && (
                            <p>
                              <span className="text-muted-foreground">Note:</span> {order.delivery_note}
                            </p>
                          )}
                          <p>
                            <span className="text-muted-foreground">Total:</span>{" "}
                            {formatNaira(order.total_amount)}
                          </p>
                          {order.status === "disputed" && (
                            <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
                              This order is under dispute. Check the admin dashboard for details.
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </VendorLayout>
  );
}
