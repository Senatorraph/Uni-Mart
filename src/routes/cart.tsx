import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Lock, Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";

import { Navbar } from "@/components/Navbar";
import { BottomNav } from "@/components/BottomNav";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { formatNaira } from "@/lib/format";
import { CART_ITEMS } from "@/lib/mock-data";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your cart — UniMarket" },
      { name: "description", content: "Review your campus orders, adjust quantities and check out securely with Paystack." },
      { property: "og:title", content: "Your cart — UniMarket" },
      { property: "og:description", content: "Review your campus orders and check out securely." },
    ],
  }),
  component: CartPage,
});

const DELIVERY_FEE = 500;

function CartPage() {
  const [items, setItems] = useState(CART_ITEMS);
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const total = subtotal + (items.length ? DELIVERY_FEE : 0);

  const setQty = (id: string, delta: number) =>
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i)),
    );

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar cartCount={items.length} />

      <div className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-extrabold">Your Cart</h1>

        {items.length === 0 ? (
          <EmptyState
            icon={ShoppingCart}
            title="Your cart is empty"
            subtitle="Browse verified vendors on your campus and add something tasty."
            action={
              <Button asChild className="rounded-lg glow-primary">
                <Link to="/">Start Shopping</Link>
              </Button>
            }
          />
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4 rounded-xl border border-border bg-card p-4"
                >
                  <div className="grid h-20 w-20 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-primary/20 to-background text-3xl">
                    {item.emoji}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold">{item.name}</p>
                        <p className="text-xs text-accent">{item.vendor}</p>
                        <p className="mt-1 text-sm font-extrabold">{formatNaira(item.price)}</p>
                      </div>
                      <button
                        onClick={() => setItems((p) => p.filter((i) => i.id !== item.id))}
                        className="shrink-0 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-3 flex w-fit items-center rounded-lg border border-border">
                      <button className="p-2 transition-colors hover:bg-muted" onClick={() => setQty(item.id, -1)}>
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-10 text-center text-sm font-bold">{item.qty}</span>
                      <button className="p-2 transition-colors hover:bg-muted" onClick={() => setQty(item.id, 1)}>
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <aside className="h-fit rounded-xl border border-border bg-card p-5 lg:sticky lg:top-24">
              <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
                Order Summary
              </h2>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd className="font-semibold">{formatNaira(subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Delivery Fee</dt>
                  <dd className="font-semibold">{formatNaira(DELIVERY_FEE)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Discount</dt>
                  <dd className="font-semibold text-success">-₦0</dd>
                </div>
              </dl>
              <div className="my-4 h-px bg-border" />
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="text-2xl font-extrabold">{formatNaira(total)}</span>
              </div>
              <Button asChild className="mt-5 h-11 w-full rounded-lg font-bold glow-primary">
                <Link to="/checkout">Proceed to Checkout</Link>
              </Button>
              <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <Lock className="h-3.5 w-3.5" /> Secured by Paystack
              </p>
              <div className="mt-3 flex justify-center gap-2 text-[10px] font-semibold text-muted-foreground">
                {["VISA", "Mastercard", "Verve", "Transfer"].map((m) => (
                  <span key={m} className="rounded border border-border px-2 py-1">
                    {m}
                  </span>
                ))}
              </div>
            </aside>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
