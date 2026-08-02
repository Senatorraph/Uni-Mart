import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ClipboardList } from "lucide-react";

import { StudentLayout } from "@/components/layouts/StudentLayout";
import { EmptyState } from "@/components/EmptyState";
import { OrderStatusBadge } from "@/components/OrderStatusBadge";
import { Button } from "@/components/ui/button";
import { formatNaira } from "@/lib/format";
import { ORDERS } from "@/lib/mock-data";
import { StudentRoute } from "@/components/ProtectedRoute";

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

const FILTERS = ["All", "Pending", "Delivered", "Disputed"];

function OrdersPage() {
  const [filter, setFilter] = useState("All");
  const orders =
    filter === "All" ? ORDERS : ORDERS.filter((o) => o.status === filter.toLowerCase());

  return (
    <StudentLayout>
      <div className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="text-2xl font-extrabold">My Orders</h1>

        <div className="mt-5 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all ${
                filter === f
                  ? "bg-primary text-primary-foreground glow-primary"
                  : "border border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="mt-6 space-y-4">
          {orders.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title={`No ${filter.toLowerCase()} orders`}
              subtitle="When you place an order it will show up here for easy tracking."
              action={
                <Button asChild className="rounded-lg glow-primary">
                  <Link to="/">Start Shopping</Link>
                </Button>
              }
            />
          ) : (
            orders.map((o) => (
              <div
                key={o.id}
                className="rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40"
              >
                <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-muted text-xl">
                    {o.vendorEmoji}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{o.vendor}</p>
                    <p className="text-xs text-muted-foreground">
                      {o.id} · {o.date}
                    </p>
                  </div>
                  <OrderStatusBadge status={o.status} />
                </div>
                <p className="mt-3 line-clamp-1 text-sm text-muted-foreground">{o.items}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-lg font-extrabold">{formatNaira(o.total)}</span>
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="rounded-lg border-primary/50 text-primary"
                  >
                    <Link to="/orders/$id" params={{ id: o.id }}>
                      Track Order
                    </Link>
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </StudentLayout>
  );
}
