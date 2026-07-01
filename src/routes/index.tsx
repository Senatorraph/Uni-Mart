import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { useAuth, roleHome } from "@/lib/auth-context";
import { Navbar } from "@/components/Navbar";
import { ProductCard, type ProductCardData } from "@/components/ProductCard";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";

const CATEGORIES = ["All", "Food", "Electronics", "Clothing", "Books", "Services"];

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "UniMarket — Your Campus. Your Market." },
      { name: "description", content: "Shop from vendors right on your campus." },
    ],
  }),
  component: Home,
});

function Home() {
  const navigate = useNavigate();
  const { session, profile, loading, user } = useAuth();
  const [category, setCategory] = useState("All");
  const [products, setProducts] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!session) {
      navigate({ to: "/auth", replace: true });
      return;
    }
    if (profile && profile.role && profile.role !== "student") {
      navigate({ to: roleHome(profile.role), replace: true });
    }
  }, [loading, session, profile, navigate]);

  useEffect(() => {
    if (!profile?.university_id) return;
    setFetching(true);
    setError(null);
    (async () => {
      let q = (supabase as any)
        .from("student_product_feed")
        .select("*")
        .eq("university_id", profile.university_id)
        .limit(60);
      const { data, error } = await q;
      if (error) {
        setError(error.message);
        setProducts([]);
      } else {
        setProducts(data ?? []);
      }
      setFetching(false);
    })();
  }, [profile?.university_id]);

  const filtered = useMemo(() => {
    if (category === "All") return products;
    return products.filter(
      (p) => (p.category ?? "").toLowerCase() === category.toLowerCase(),
    );
  }, [products, category]);

  const cards: ProductCardData[] = filtered.map((p) => ({
    id: p.id ?? p.product_id,
    name: p.name ?? p.product_name ?? "Unnamed product",
    price: p.price ?? 0,
    image_url: p.image_url ?? (Array.isArray(p.images) ? p.images[0] : null),
    vendor_name: p.vendor_name ?? p.business_name,
    vendor_rating: p.vendor_rating ?? p.rating,
    category: p.category,
  }));

  const addToCart = async (p: ProductCardData) => {
    if (!user) return;
    const { error } = await (supabase as any).from("cart_items").insert({
      user_id: user.id,
      product_id: p.id,
      quantity: 1,
      university_id: profile?.university_id,
    });
    if (error) toast.error(error.message);
    else toast.success("Added to cart");
  };

  if (loading || !session) {
    return (
      <div className="min-h-screen">
        <LoadingSpinner label="Loading..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="border-b border-border bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="mx-auto max-w-7xl px-4 py-14 md:py-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Sparkles className="h-3 w-3" /> Hyperlocal · Campus verified
            </div>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight md:text-5xl">
              Your Campus. <span className="text-primary">Your Market.</span>
            </h1>
            <p className="mt-3 max-w-lg text-base text-muted-foreground md:text-lg">
              Order food, electronics, books and more from vendors right on your campus — delivered fast by student riders.
            </p>
            <Button size="lg" className="mt-6" onClick={() => window.scrollTo({ top: 500, behavior: "smooth" })}>
              Shop Now
            </Button>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="sticky top-16 z-30 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-7xl overflow-x-auto px-4">
          <div className="flex gap-2 py-3">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  category === c
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Product grid */}
      <section className="mx-auto max-w-7xl px-4 py-8">
        <h2 className="mb-4 text-xl font-bold">Fresh on your campus</h2>
        {fetching ? (
          <LoadingSpinner label="Loading products..." />
        ) : error ? (
          <EmptyState title="Couldn't load products" subtitle={error} />
        ) : cards.length === 0 ? (
          <EmptyState
            title="No products yet"
            subtitle="Vendors on your campus haven't listed products in this category yet. Check back soon."
          />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {cards.map((p) => (
              <ProductCard key={p.id} product={p} onAdd={addToCart} />
            ))}
          </div>
        )}
      </section>

      {/* AI Recommendations */}
      <section className="mx-auto max-w-7xl px-4 pb-16">
        <div className="mb-4 flex items-center gap-3">
          <h2 className="text-xl font-bold">Recommended For You</h2>
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
            <Sparkles className="h-3 w-3" /> AI
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex aspect-[3/4] flex-col items-center justify-center rounded-xl border border-dashed border-primary/30 bg-primary/5 p-4 text-center"
            >
              <Sparkles className="mb-2 h-6 w-6 text-primary" />
              <p className="text-xs text-muted-foreground">
                AI-powered recommendations coming soon
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
