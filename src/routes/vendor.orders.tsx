import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { Navbar } from "@/components/Navbar";
import { OrderStatusBadge } from "@/components/OrderStatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatNaira } from "@/lib/format";
import { ORDERS } from "@/lib/mock-data";

export const Route = createFileRoute("/vendor/orders")({
  head: () => ({
    meta: [
      { title: "Order Management — UniMarket Vendor" },
      { name: "description", content: "Confirm, track and resolve every order placed with your campus store." },
      { property: "og:title", content: "Order Management — UniMarket Vendor" },
      { property: "og:description", content: "Confirm, track and resolve orders for your store." },
    ],
  }),
  component: VendorOrders,
});

const FILTERS = ["All", "Pending", "Confirmed", "Picked Up", "Delivered", "Disputed"];

function VendorOrders() {
  const [filter, setFilter] = useState("All");
  const key = filter.toLowerCase().replace(/ /g, "_");
  const orders = filter === "All" ? ORDERS : ORDERS.filter((o) => o.status === key);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-2xl font-extrabold">Order Management</h1>

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
            <EmptyState title={`No ${filter.toLowerCase()} orders`} subtitle="New orders will appear here in real time." />
          ) : (
            orders.map((o) => (
              <div key={o.id} className="rounded-xl border border-border bg-card p-5">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{o.student}</p>
                    <p className="text-xs text-muted-foreground">{o.id} · {o.date}</p>
                  </div>
                  <OrderStatusBadge status={o.status} />
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{o.items}</p>
                <p className="mt-1 text-xs text-muted-foreground">📍 {o.address}</p>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <span className="text-lg font-extrabold">{formatNaira(o.total)}</span>
                  <div className="ml-auto flex gap-2">
                    {o.status === "pending" && (
                      <Button size="sm" className="rounded-lg glow-primary">Confirm Order</Button>
                    )}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline" className="rounded-lg">View Details</Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Order {o.id}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-3 text-sm">
                          <p><span className="text-muted-foreground">Student:</span> {o.student}</p>
                          <p><span className="text-muted-foreground">Items:</span> {o.items}</p>
                          <p><span className="text-muted-foreground">Address:</span> {o.address}</p>
                          <p><span className="text-muted-foreground">Total:</span> {formatNaira(o.total)}</p>
                          <div>
                            <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Pickup photo</p>
                            <div className="grid h-36 place-items-center rounded-lg border-2 border-accent/40 bg-accent/5 text-4xl">📸</div>
                          </div>
                          {o.status === "disputed" && (
                            <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
                              Dispute opened: “Wrong size delivered” · under review
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
    </div>
  );
}
