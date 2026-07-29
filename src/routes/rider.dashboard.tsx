import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Camera, MapPin, Phone } from "lucide-react";

import { Navbar } from "@/components/Navbar";
import { OrderStatusBadge } from "@/components/OrderStatusBadge";
import { Button } from "@/components/ui/button";
import { formatNaira } from "@/lib/format";
import { RIDER_JOBS, ORDERS } from "@/lib/mock-data";

export const Route = createFileRoute("/rider/dashboard")({
  head: () => ({
    meta: [
      { title: "Rider Dashboard — UniMarket" },
      { name: "description", content: "Accept campus delivery jobs, upload pickup photos and complete deliveries as a UniMarket rider." },
      { property: "og:title", content: "Rider Dashboard — UniMarket" },
      { property: "og:description", content: "Accept delivery jobs and complete campus deliveries." },
    ],
  }),
  component: RiderDashboard,
});

function RiderDashboard() {
  const [active, setActive] = useState<string | null>(RIDER_JOBS[0].id);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="mx-auto max-w-5xl space-y-8 px-4 py-8">
        <h1 className="text-2xl font-extrabold">Rider Dashboard</h1>

        <section>
          <h2 className="mb-4 text-lg font-bold">Available Jobs</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {RIDER_JOBS.map((j) => (
              <div key={j.id} className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold">{j.id}</span>
                  <span className="text-sm font-extrabold text-success">{formatNaira(j.fee)}</span>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">Pickup</p>
                <p className="text-sm font-semibold">{j.vendor} · {j.pickup}</p>
                <p className="mt-2 text-xs text-muted-foreground">Deliver to</p>
                <p className="text-sm">{j.dropoff}</p>
                <Button
                  className="mt-4 w-full rounded-lg font-bold glow-primary"
                  onClick={() => setActive(j.id)}
                >
                  Accept Job
                </Button>
              </div>
            ))}
          </div>
        </section>

        {active && (
          <section className="rounded-xl border border-primary/40 bg-primary/5 p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Active Delivery · {active}</h2>
              <OrderStatusBadge status="picked_up" />
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="space-y-3 text-sm">
                <p className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" /> Block C, Room 204, Mandate Hostel
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary" /> Chidi Okafor · 0803 555 0142
                </p>
                <div className="grid h-32 place-items-center rounded-lg border border-border bg-card text-xs text-muted-foreground">
                  Map preview
                </div>
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <p className="flex items-center gap-2 text-sm font-semibold">
                  <Camera className="h-4 w-4 text-accent" /> Upload Pickup Photo
                </p>
                <div className="mt-3 grid h-28 place-items-center rounded-lg border-2 border-dashed border-accent/40 text-center text-xs text-muted-foreground">
                  Take a clear photo of the order before picking up
                </div>
                <div className="mt-4 flex flex-col gap-2">
                  <Button variant="outline" className="rounded-lg">I'm at Vendor</Button>
                  <Button variant="outline" className="rounded-lg border-accent/60 text-accent">
                    Upload Pickup Photo
                  </Button>
                  <Button className="rounded-lg font-bold glow-primary">Mark as Delivered</Button>
                </div>
              </div>
            </div>
          </section>
        )}

        <section>
          <h2 className="mb-4 text-lg font-bold">Completed Deliveries</h2>
          <div className="space-y-3">
            {ORDERS.filter((o) => o.status === "delivered").concat(ORDERS.slice(0, 2)).map((o, i) => (
              <div key={`${o.id}-${i}`} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-border bg-card p-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{o.id} · {o.vendor}</p>
                  <p className="truncate text-xs text-muted-foreground">{o.address} · {o.date}</p>
                </div>
                <span className="text-sm font-bold text-success">{formatNaira(500)}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
