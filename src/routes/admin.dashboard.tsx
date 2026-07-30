import { createFileRoute } from "@tanstack/react-router";
import { Store, Clock, Package, AlertTriangle } from "lucide-react";

import { AdminLayout } from "@/components/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { DISPUTES, FORECAST, PENDING_VENDORS } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/dashboard")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — UniMarket" },
      { name: "description", content: "Approve campus vendors, review disputes and monitor marketplace analytics for your university." },
      { property: "og:title", content: "Admin Dashboard — UniMarket" },
      { property: "og:description", content: "Approve vendors, review disputes and monitor analytics." },
    ],
  }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const max = Math.max(...FORECAST.map((f) => f.value));

  return (
    <AdminLayout title="Admin Dashboard">

      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8">
        <h1 className="text-2xl font-extrabold">Admin Dashboard</h1>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Store, label: "Total Vendors", value: "48", color: "text-primary" },
            { icon: Clock, label: "Pending Approvals", value: "3", color: "text-accent" },
            { icon: Package, label: "Orders Today", value: "213", color: "text-success" },
            { icon: AlertTriangle, label: "Active Disputes", value: "3", color: "text-destructive" },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{label}</span>
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
              <p className="mt-3 text-2xl font-extrabold">{value}</p>
            </div>
          ))}
        </div>

        <section>
          <h2 className="mb-4 text-lg font-bold">Pending Vendor Approvals</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {PENDING_VENDORS.map((v) => (
              <div key={v.id} className="rounded-xl border border-border bg-card p-5">
                <p className="text-sm font-bold">{v.business}</p>
                <p className="text-xs text-accent">{v.category}</p>
                <p className="mt-2 text-xs text-muted-foreground">Owner: {v.owner}</p>
                <p className="text-xs text-muted-foreground">{v.university}</p>
                <p className="mt-1 text-xs text-muted-foreground">Applied {v.applied}</p>
                <div className="mt-4 flex gap-2">
                  <Button size="sm" className="flex-1 rounded-lg bg-success text-success-foreground hover:bg-success/90">
                    Approve
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 rounded-lg border-destructive/60 text-destructive">
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-bold">Active Disputes</h2>
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[780px] text-sm">
                <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    {["Dispute", "Order", "Student", "Vendor", "Reason", "AI Score", "Status", ""].map((h) => (
                      <th key={h} className="px-5 py-3 text-left font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {DISPUTES.map((d) => (
                    <tr key={d.id} className="border-t border-border hover:bg-muted/20">
                      <td className="px-5 py-3 font-semibold">{d.id}</td>
                      <td className="px-5 py-3">{d.orderId}</td>
                      <td className="px-5 py-3">{d.student}</td>
                      <td className="px-5 py-3">{d.vendor}</td>
                      <td className="px-5 py-3 text-muted-foreground">{d.reason}</td>
                      <td className="px-5 py-3">
                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
                            d.score > 0.7
                              ? "border-destructive/30 bg-destructive/15 text-destructive"
                              : "border-accent/30 bg-accent/15 text-accent"
                          }`}
                        >
                          {d.score.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-5 py-3 capitalize text-muted-foreground">{d.status}</td>
                      <td className="px-5 py-3">
                        <Button size="sm" variant="outline" className="rounded-lg">Review</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-bold">Platform Analytics</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-border bg-card p-5">
              <p className="text-sm font-semibold">Orders over time</p>
              <div className="mt-4 flex h-32 items-end gap-2">
                {FORECAST.map((f) => (
                  <div key={f.day} className="flex-1 rounded-t bg-primary/70" style={{ height: `${(f.value / max) * 100}%` }} />
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <p className="text-sm font-semibold">Revenue</p>
              <div className="mt-4 flex h-32 items-end gap-2">
                {FORECAST.map((f) => (
                  <div key={f.day} className="flex-1 rounded-t bg-success/70" style={{ height: `${(f.value / max) * 90}%` }} />
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <p className="text-sm font-semibold">Top categories</p>
              <div className="mt-4 space-y-3 text-xs">
                {[["Food & Drinks", 62], ["Electronics", 21], ["Beauty", 10], ["Books", 7]].map(([label, pct]) => (
                  <div key={label as string}>
                    <div className="mb-1 flex justify-between text-muted-foreground">
                      <span>{label}</span>
                      <span>{pct}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}
