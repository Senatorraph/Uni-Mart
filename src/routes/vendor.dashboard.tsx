import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Package, Clock, Wallet, Boxes, Zap, TrendingUp } from "lucide-react";

import { Navbar } from "@/components/Navbar";
import { OrderStatusBadge } from "@/components/OrderStatusBadge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { formatNaira } from "@/lib/format";
import { FORECAST, ORDERS } from "@/lib/mock-data";

export const Route = createFileRoute("/vendor/dashboard")({
  head: () => ({
    meta: [
      { title: "Vendor Dashboard — UniMarket" },
      { name: "description", content: "Track campus orders, revenue and AI demand forecasts for your UniMarket store." },
      { property: "og:title", content: "Vendor Dashboard — UniMarket" },
      { property: "og:description", content: "Track orders, revenue and demand forecasts for your store." },
    ],
  }),
  component: VendorDashboard,
});

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  tone,
}: {
  icon: typeof Package;
  label: string;
  value: string;
  hint?: string;
  tone?: "accent" | "success";
}) {
  const color =
    tone === "accent" ? "text-accent" : tone === "success" ? "text-success" : "text-primary";
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <Icon className={`h-4 w-4 ${color}`} />
      </div>
      <p className="mt-3 text-2xl font-extrabold">{value}</p>
      {hint && (
        <p className="mt-1 flex items-center gap-1 text-xs text-success">
          <TrendingUp className="h-3 w-3" /> {hint}
        </p>
      )}
    </div>
  );
}

function VendorDashboard() {
  const [open, setOpen] = useState(true);
  const max = Math.max(...FORECAST.map((f) => f.value));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
          <h1 className="truncate text-2xl font-extrabold">Vendor Dashboard</h1>
          <div className="flex shrink-0 items-center gap-3 rounded-xl border border-border bg-card px-4 py-2">
            <span className="text-sm font-semibold">
              {open ? "Store is Open 🟢" : "Store is Closed 🔴"}
            </span>
            <Switch checked={open} onCheckedChange={setOpen} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={Package} label="Total Orders" value="1,284" hint="+12% this week" />
          <StatCard icon={Clock} label="Pending Orders" value="7" tone="accent" />
          <StatCard icon={Wallet} label="Total Revenue" value={formatNaira(2845000)} tone="success" />
          <StatCard icon={Boxes} label="Total Products" value="34" />
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
                {ORDERS.map((o) => (
                  <tr key={o.id} className="border-t border-border transition-colors hover:bg-muted/20">
                    <td className="px-5 py-3 font-semibold">{o.id}</td>
                    <td className="px-5 py-3">{o.student}</td>
                    <td className="max-w-[220px] truncate px-5 py-3 text-muted-foreground">{o.items}</td>
                    <td className="px-5 py-3 font-semibold">{formatNaira(o.total)}</td>
                    <td className="px-5 py-3"><OrderStatusBadge status={o.status} /></td>
                    <td className="px-5 py-3 text-muted-foreground">{o.date}</td>
                    <td className="px-5 py-3">
                      <Button asChild size="sm" variant="outline" className="rounded-lg">
                        <Link to="/orders/$id" params={{ id: o.id }}>View</Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl border border-primary/40 bg-primary/5 p-5">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 fill-primary text-primary" />
            <h2 className="text-sm font-bold">AI Demand Forecast</h2>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Predicted orders for next 7 days</p>
          <div className="mt-5 flex h-40 items-end gap-3">
            {FORECAST.map((f) => (
              <div key={f.day} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-lg bg-gradient-to-t from-primary/40 to-primary transition-all"
                  style={{ height: `${(f.value / max) * 100}%` }}
                />
                <span className="text-[11px] text-muted-foreground">{f.day}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] font-semibold text-accent">Powered by UniMarket AI</p>
        </div>
      </div>
    </div>
  );
}
