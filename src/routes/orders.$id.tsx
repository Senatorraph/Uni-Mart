import { createFileRoute } from "@tanstack/react-router";
import { Check, Camera, Phone } from "lucide-react";

import { StudentLayout } from "@/components/layouts/StudentLayout";
import { Button } from "@/components/ui/button";
import { formatNaira } from "@/lib/format";
import { ORDERS } from "@/lib/mock-data";
import { StudentRoute } from "@/components/ProtectedRoute";

export const Route = createFileRoute("/orders/$id")({
  head: () => ({
    meta: [
      { title: "Track your order — UniMarket" },
      {
        name: "description",
        content:
          "Follow your campus delivery step by step, from vendor confirmation to rider drop-off.",
      },
      { property: "og:title", content: "Track your order — UniMarket" },
      { property: "og:description", content: "Follow your campus delivery step by step." },
    ],
  }),
  component: () => (
    <StudentRoute>
      <OrderTracking />
    </StudentRoute>
  ),
});

const STEPS = [
  { label: "Order Placed", done: true },
  { label: "Vendor Confirmed", done: true },
  { label: "Rider Assigned", done: true },
  { label: "Picked Up", done: false, active: true },
  { label: "Delivered", done: false },
];

function OrderTracking() {
  const { id } = Route.useParams();
  const order = ORDERS.find((o) => o.id === id) ?? ORDERS[0];

  return (
    <StudentLayout>
      <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
        <div>
          <h1 className="text-2xl font-extrabold">Order {order.id}</h1>
          <p className="text-sm text-muted-foreground">Placed {order.date}</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <ol className="flex flex-col gap-6 md:flex-row md:items-start md:gap-0">
            {STEPS.map((s, i) => (
              <li
                key={s.label}
                className="flex items-start gap-3 md:flex-1 md:flex-col md:items-center md:text-center"
              >
                <div className="flex items-center gap-0 md:w-full md:justify-center">
                  <span
                    className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border text-xs font-bold ${
                      s.done
                        ? "border-success bg-success/20 text-success"
                        : s.active
                          ? "border-primary bg-primary/20 text-primary"
                          : "border-border bg-muted text-muted-foreground"
                    }`}
                  >
                    {s.done ? <Check className="h-4 w-4" /> : i + 1}
                  </span>
                </div>
                <div>
                  <p
                    className={`text-sm font-semibold ${s.done || s.active ? "" : "text-muted-foreground"}`}
                  >
                    {s.label}
                  </p>
                  {s.active && <p className="text-xs text-primary">In progress</p>}
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="rounded-xl border border-accent/40 bg-card p-5">
          <p className="flex items-center gap-2 text-sm font-bold">
            <Camera className="h-4 w-4 text-accent" /> Pickup Photo
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            The photo your rider uploaded before collecting your order.
          </p>
          <div className="mt-3 grid h-48 place-items-center rounded-lg border-2 border-accent/40 bg-gradient-to-br from-accent/10 to-background text-5xl">
            📸
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Items</h2>
          <p className="mt-3 text-sm">{order.items}</p>
          <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
            <span className="text-sm text-muted-foreground">Total paid</span>
            <span className="text-xl font-extrabold">{formatNaira(order.total)}</span>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
              Delivery Details
            </h2>
            <p className="mt-3 text-sm">{order.address}</p>
            <p className="mt-1 text-xs text-muted-foreground">Estimated arrival: 30-45 mins</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
              Vendor
            </h2>
            <div className="mt-3 flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-muted text-xl">
                {order.vendorEmoji}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{order.vendor}</p>
                <p className="text-xs text-muted-foreground">0803 555 0142</p>
              </div>
              <Button size="sm" variant="outline" className="ml-auto rounded-lg">
                <Phone className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {order.status === "delivered" && (
          <Button variant="outline" className="rounded-lg border-destructive/60 text-destructive">
            Raise a Dispute
          </Button>
        )}
      </div>
    </StudentLayout>
  );
}
