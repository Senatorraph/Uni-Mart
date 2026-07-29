import { createFileRoute, Link } from "@tanstack/react-router";
import { Lock, MapPin } from "lucide-react";

import { Navbar } from "@/components/Navbar";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatNaira } from "@/lib/format";
import { CART_ITEMS } from "@/lib/mock-data";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — UniMarket" },
      { name: "description", content: "Confirm your hostel delivery details and pay securely for your campus order." },
      { property: "og:title", content: "Checkout — UniMarket" },
      { property: "og:description", content: "Confirm delivery details and pay securely on UniMarket." },
    ],
  }),
  component: Checkout,
});

const STEPS = ["Cart", "Checkout", "Payment", "Confirmation"];

function Checkout() {
  const subtotal = CART_ITEMS.reduce((s, i) => s + i.price * i.qty, 0);
  const total = subtotal + 500;

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />

      <div className="mx-auto max-w-6xl px-4 py-8">
        <ol className="mb-8 flex flex-wrap items-center gap-3 text-xs">
          {STEPS.map((s, i) => (
            <li key={s} className="flex items-center gap-3">
              <span
                className={`flex items-center gap-2 rounded-full border px-3 py-1.5 font-semibold ${
                  i <= 1
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border bg-card text-muted-foreground"
                }`}
              >
                <span className="grid h-5 w-5 place-items-center rounded-full bg-primary/20 text-[10px]">
                  {i + 1}
                </span>
                {s}
              </span>
              {i < STEPS.length - 1 && <span className="h-px w-6 bg-border" />}
            </li>
          ))}
        </ol>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <section className="space-y-5 rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-bold">Delivery Details</h2>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Delivery Address</Label>
              <Textarea
                rows={3}
                placeholder="e.g. Block C, Room 204, Mandate Hostel"
                className="rounded-lg border-border bg-background"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Delivery Note (optional)</Label>
              <Textarea
                rows={2}
                placeholder="e.g. Call me when you get to the gate"
                className="rounded-lg border-border bg-background"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Contact Phone Number</Label>
              <Input
                placeholder="0801 234 5678"
                className="h-11 rounded-lg border-border bg-background"
              />
            </div>

            <div className="relative grid h-44 place-items-center overflow-hidden rounded-xl border border-border bg-gradient-to-br from-primary/15 via-card to-background">
              <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(var(--border)_1px,transparent_1px),linear-gradient(90deg,var(--border)_1px,transparent_1px)] [background-size:28px_28px]" />
              <div className="relative flex flex-col items-center gap-2 text-center">
                <MapPin className="h-7 w-7 text-primary" />
                <p className="text-sm font-semibold">Campus Delivery Zone</p>
                <p className="text-xs text-muted-foreground">
                  University of Africa, Toru-Orua · all hostels covered
                </p>
              </div>
            </div>
          </section>

          <aside className="h-fit rounded-xl border border-border bg-card p-5 lg:sticky lg:top-24">
            <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
              Payment Summary
            </h2>
            <ul className="mt-4 space-y-3">
              {CART_ITEMS.map((i) => (
                <li key={i.id} className="flex items-center gap-3 text-sm">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-muted">
                    {i.emoji}
                  </span>
                  <span className="min-w-0 flex-1 truncate">
                    {i.name} <span className="text-muted-foreground">×{i.qty}</span>
                  </span>
                  <span className="font-semibold">{formatNaira(i.price * i.qty)}</span>
                </li>
              ))}
            </ul>
            <div className="my-4 h-px bg-border" />
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd>{formatNaira(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Delivery Fee</dt>
                <dd>{formatNaira(500)}</dd>
              </div>
              <div className="flex justify-between text-base font-extrabold">
                <dt>Total</dt>
                <dd>{formatNaira(total)}</dd>
              </div>
            </dl>
            <Button asChild className="mt-5 h-11 w-full rounded-lg font-bold glow-primary">
              <Link to="/orders/$id" params={{ id: "UM-10432" }}>Pay {formatNaira(total)}</Link>
            </Button>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <Lock className="h-3.5 w-3.5" /> Paystack · Your payment is secured
            </p>
          </aside>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
