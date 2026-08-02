import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Zap } from "lucide-react";

import { StudentLayout } from "@/components/layouts/StudentLayout";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { VendorCard } from "@/components/VendorCard";
import { Button } from "@/components/ui/button";
import { CATEGORIES, PRODUCTS, VENDORS } from "@/lib/mock-data";
import { StudentRoute } from "@/components/ProtectedRoute";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "UniMarket — Your Campus. Your Market." },
      {
        name: "description",
        content:
          "Shop food, gadgets, fashion and services from verified vendors on your Nigerian campus, delivered to your hostel in minutes.",
      },
      { property: "og:title", content: "UniMarket — Your Campus. Your Market." },
      {
        property: "og:description",
        content:
          "Shop food, gadgets, fashion and services from verified vendors on your Nigerian campus, delivered to your hostel in minutes.",
      },
    ],
  }),
  component: () => (
    <StudentRoute>
      <Home />
    </StudentRoute>
  ),
});

function Home() {
  const [category, setCategory] = useState("All");
  const products = category === "All" ? PRODUCTS : PRODUCTS.filter((p) => p.category === category);

  return (
    <StudentLayout>
      <section className="relative overflow-hidden border-b border-border">
        <div className="pointer-events-none absolute -left-20 top-0 h-72 w-72 rounded-full bg-primary/25 blur-3xl" />
        <div className="pointer-events-none absolute -right-10 bottom-0 h-64 w-64 rounded-full bg-accent/15 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 md:py-24">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            Hyperlocal · Campus verified
          </span>
          <h1 className="mt-5 text-5xl font-extrabold leading-[1.05] tracking-tight md:text-7xl">
            Your Campus.
            <br />
            <span className="text-primary">Your Market.</span>
          </h1>
          <p className="mt-5 max-w-lg text-base text-muted-foreground md:text-lg">
            Shop from verified vendors on your campus. Fast delivery to your door.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" className="rounded-lg font-bold glow-primary">
              Start Shopping
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-lg border-primary/50 font-bold text-primary"
            >
              <Link to="/auth" search={{ next: "" }}>
                Become a Vendor
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="sticky top-16 z-30 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-7xl overflow-x-auto px-4 no-scrollbar">
          <div className="flex gap-2 py-3">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  category === c
                    ? "bg-primary text-primary-foreground glow-primary"
                    : "border border-border bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10">
        <h2 className="mb-5 text-xl font-bold">Fresh on your campus</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6">
        <div className="flex flex-wrap items-center gap-3">
          <Zap className="h-5 w-5 fill-primary text-primary" />
          <h2 className="text-xl font-bold">Recommended For You</h2>
          <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-accent">
            AI Powered
          </span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Personalised picks based on what students like you are ordering
        </p>
        <div className="mt-5 flex gap-5 overflow-x-auto pb-2 no-scrollbar md:grid md:grid-cols-3 md:overflow-visible">
          {PRODUCTS.slice(2, 5).map((p) => (
            <div key={p.id} className="w-64 shrink-0 md:w-auto">
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10">
        <h2 className="mb-5 text-xl font-bold">Featured Vendors</h2>
        <div className="flex gap-5 overflow-x-auto pb-2 no-scrollbar">
          {VENDORS.map((v) => (
            <VendorCard key={v.id} vendor={v} showAction />
          ))}
        </div>
      </section>

      <Footer />
    </StudentLayout>
  );
}
