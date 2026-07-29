import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Minus, Plus, Star, Bike } from "lucide-react";

import { Navbar } from "@/components/Navbar";
import { BottomNav } from "@/components/BottomNav";
import { Footer } from "@/components/Footer";
import { OpenBadge } from "@/components/VendorCard";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { formatNaira } from "@/lib/format";
import { PRODUCTS, REVIEWS, VENDORS } from "@/lib/mock-data";

export const Route = createFileRoute("/product/$id")({
  head: () => ({
    meta: [
      { title: "Product details — UniMarket" },
      { name: "description", content: "See prices, vendor ratings and reviews before you order from a verified campus vendor." },
      { property: "og:title", content: "Product details — UniMarket" },
      { property: "og:description", content: "See prices, vendor ratings and reviews on UniMarket." },
    ],
  }),
  component: ProductDetail,
});

function ProductDetail() {
  const { id } = Route.useParams();
  const product = PRODUCTS.find((p) => p.id === id) ?? PRODUCTS[0];
  const vendor = VENDORS.find((v) => v.id === product.vendorId) ?? VENDORS[0];
  const [qty, setQty] = useState(1);

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="mx-auto max-w-3xl px-4 py-10">
          <EmptyState title="Product not found" subtitle="This product may have been removed." />
        </div>
      </div>
    );
  }

  const breakdown = [78, 14, 5, 2, 1];

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-8 md:grid-cols-2">
        <div>
          <div className="grid aspect-square place-items-center rounded-xl border border-border bg-gradient-to-br from-primary/20 via-card to-background text-8xl">
            <span aria-hidden>{product.emoji}</span>
          </div>
          <div className="mt-3 flex gap-3">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`grid h-20 w-20 place-items-center rounded-lg border bg-card text-2xl transition-colors ${
                  i === 0 ? "border-primary" : "border-border hover:border-primary/40"
                }`}
              >
                <span aria-hidden>{product.emoji}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <h1 className="text-3xl font-extrabold leading-tight">{product.name}</h1>
            <p className="mt-1 text-sm font-semibold text-accent">{product.vendor}</p>
            <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <Star className="h-4 w-4 fill-accent text-accent" />
              <span className="font-semibold text-foreground">{product.rating.toFixed(1)}</span>
              <span>· {product.reviews} reviews</span>
            </div>
            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-4xl font-extrabold">{formatNaira(product.price)}</span>
              {product.comparePrice && (
                <span className="text-base text-muted-foreground line-through">
                  {formatNaira(product.comparePrice)}
                </span>
              )}
            </div>
            <span
              className={`mt-3 inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
                product.stock > 0
                  ? "border-success/30 bg-success/15 text-success"
                  : "border-destructive/30 bg-destructive/15 text-destructive"
              }`}
            >
              {product.stock > 0 ? "In Stock" : "Out of Stock"}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center rounded-lg border border-border bg-card">
              <button className="p-2.5 transition-colors hover:bg-muted" onClick={() => setQty((q) => Math.max(1, q - 1))}>
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-12 text-center text-sm font-bold">{qty}</span>
              <button className="p-2.5 transition-colors hover:bg-muted" onClick={() => setQty((q) => q + 1)}>
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <span className="text-sm text-muted-foreground">{product.stock} available</span>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="outline" className="h-11 flex-1 rounded-lg border-primary/60 font-bold text-primary">
              <Link to="/cart">Add to Cart</Link>
            </Button>
            <Button asChild className="h-11 flex-1 rounded-lg font-bold glow-primary">
              <Link to="/checkout">Buy Now</Link>
            </Button>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-sm">
            <Bike className="h-5 w-5 shrink-0 text-primary" />
            <span>Campus delivery • ₦500 flat fee • 30-45 mins</span>
          </div>

          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-muted text-2xl">
                {vendor.emoji}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">{vendor.name}</p>
                <p className="text-xs text-muted-foreground">
                  ⭐ {vendor.rating.toFixed(1)} · {vendor.sales} sales
                </p>
              </div>
              <OpenBadge isOpen={vendor.isOpen} />
            </div>
            <Button variant="outline" size="sm" className="mt-3 w-full rounded-lg">
              View Store
            </Button>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-muted-foreground">
              Description
            </h3>
            <p className="text-sm leading-relaxed text-foreground/90">{product.description}</p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-16">
        <h2 className="mb-5 text-xl font-bold">Reviews</h2>
        <div className="grid gap-6 md:grid-cols-[260px_1fr]">
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-4xl font-extrabold">{product.rating.toFixed(1)}</p>
            <p className="text-xs text-muted-foreground">{product.reviews} reviews</p>
            <div className="mt-4 space-y-2">
              {breakdown.map((pct, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <span className="w-6 text-muted-foreground">{5 - i}★</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-8 text-right text-muted-foreground">{pct}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {REVIEWS.map((r) => (
              <div key={r.id} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                    {r.initials}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{r.name}</p>
                    <p className="text-xs text-muted-foreground">{r.date}</p>
                  </div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${i < r.rating ? "fill-accent text-accent" : "text-muted-foreground opacity-40"}`}
                      />
                    ))}
                  </div>
                </div>
                <p className="mt-3 text-sm text-foreground/90">{r.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
      <BottomNav />
    </div>
  );
}
