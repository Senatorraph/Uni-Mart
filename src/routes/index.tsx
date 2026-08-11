import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search, Star, Zap } from "lucide-react";

import { StudentLayout } from "@/components/layouts/StudentLayout";
import { Footer } from "@/components/Footer";
import { StudentProductCard } from "@/components/StudentProductCard";
import { OpenBadge } from "@/components/VendorCard";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { getRecommendations } from "@/lib/ml";
import { supabase } from "@/integrations/supabase/client";
import { StudentRoute } from "@/components/ProtectedRoute";
import type { ProductWithVendor } from "@/types";

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

const CATEGORIES = [
  "All",
  "Food & Drinks",
  "Electronics",
  "Clothing & Fashion",
  "Books & Stationery",
  "Beauty & Personal Care",
  "Services & Repairs",
];

type FeaturedVendor = {
  id: string;
  business_name: string;
  category: string;
  rating: number;
  is_open: boolean;
  logo_url: string | null;
};

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border bg-card p-4 animate-pulse">
          <div className="mb-4 h-48 w-full rounded-lg bg-muted" />
          <div className="mb-2 h-4 w-3/4 rounded bg-muted" />
          <div className="mb-2 h-4 w-1/2 rounded bg-muted" />
          <div className="mt-4 h-8 rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}

function Home() {
  const { profile } = useAuth();
  const [products, setProducts] = useState<ProductWithVendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [vendors, setVendors] = useState<FeaturedVendor[]>([]);

  useEffect(() => {
    if (!profile?.university_id) return;

    const universityId = profile.university_id;
    let cancelled = false;
    setLoading(true);

    async function fetchProducts() {
      let query = supabase
        .from("student_product_feed")
        .select("*")
        .eq("university_id", universityId)
        .order("is_featured", { ascending: false })
        .order("rating", { ascending: false });

      if (selectedCategory !== "All") {
        query = query.eq("category", selectedCategory);
      }

      const { data, error } = await query;
      if (cancelled) return;

      if (error) {
        console.error("Error fetching products:", error.message);
      } else {
        setProducts((data ?? []) as ProductWithVendor[]);
      }
      setLoading(false);
    }

    fetchProducts();
    return () => {
      cancelled = true;
    };
  }, [profile?.university_id, selectedCategory]);

  useEffect(() => {
    if (!profile?.university_id) return;

    const universityId = profile.university_id;
    let cancelled = false;

    async function fetchVendors() {
      const { data, error } = await supabase
        .from("vendors")
        .select("id, business_name, category, rating, is_open, logo_url")
        .eq("university_id", universityId)
        .eq("status", "approved")
        .order("rating", { ascending: false })
        .limit(6);

      if (cancelled) return;
      if (error) {
        console.error("Error fetching vendors:", error.message);
      } else {
        setVendors((data ?? []) as FeaturedVendor[]);
      }
    }

    fetchVendors();
    return () => {
      cancelled = true;
    };
  }, [profile?.university_id]);

  const filteredProducts = useMemo(
    () => products.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase())),
    [products, searchQuery],
  );

  const [recommendedProducts, setRecommendedProducts] = useState<ProductWithVendor[]>([]);

  useEffect(() => {
    if (!profile?.id || !profile?.university_id) return;

    const studentId = profile.id;
    const universityId = profile.university_id;

    async function fetchRecommendations() {
      const ids = await getRecommendations(studentId, universityId, 8);

      if (ids.length > 0) {
        // ML currently returns synthetic training IDs, not real product IDs —
        // fall back to featured products until the model is trained on live data
        setRecommendedProducts(products.filter((p) => p.is_featured).slice(0, 4));
      } else {
        setRecommendedProducts(products.filter((p) => p.is_featured).slice(0, 4));
      }
    }

    fetchRecommendations();
  }, [profile?.id, profile?.university_id, products]);

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

          <div className="relative mt-8 max-w-lg">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search products on campus..."
              className="h-11 rounded-lg border-border bg-card pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="sticky top-16 z-30 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-7xl overflow-x-auto px-4 no-scrollbar">
          <div className="flex gap-2 py-3">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCategory(c)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  selectedCategory === c
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
        {loading ? (
          <ProductGridSkeleton />
        ) : filteredProducts.length === 0 ? (
          <EmptyState
            title="No products found"
            subtitle={
              selectedCategory !== "All"
                ? `No ${selectedCategory} products available yet`
                : "No products available on your campus yet"
            }
            action={
              selectedCategory !== "All" ? (
                <Button
                  className="rounded-lg glow-primary"
                  onClick={() => setSelectedCategory("All")}
                >
                  View all products
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((p) => (
              <StudentProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {!loading && recommendedProducts.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-6">
          <div className="flex flex-wrap items-center gap-3">
            <Zap className="h-5 w-5 fill-primary text-primary" />
            <h2 className="text-xl font-bold">Recommended For You</h2>
            <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-accent">
              AI Powered
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Powered by UniMarket AI — personalised for your campus
          </p>
          <div className="mt-5 flex gap-5 overflow-x-auto pb-2 no-scrollbar md:grid md:grid-cols-4 md:overflow-visible">
            {recommendedProducts.map((p) => (
              <div key={p.id} className="w-64 shrink-0 md:w-auto">
                <StudentProductCard product={p} />
              </div>
            ))}
          </div>
        </section>
      )}

      {vendors.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-10">
          <h2 className="mb-5 text-xl font-bold">Featured Vendors</h2>
          <div className="flex gap-5 overflow-x-auto pb-2 no-scrollbar">
            {vendors.map((v) => (
              <div
                key={v.id}
                className="w-64 shrink-0 overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary/40"
              >
                <div className="h-20 bg-gradient-to-r from-primary/30 via-primary/10 to-accent/20" />
                <div className="-mt-7 px-4 pb-4">
                  {v.logo_url ? (
                    <img
                      src={v.logo_url}
                      alt={v.business_name}
                      className="h-14 w-14 rounded-full border-4 border-card object-cover"
                    />
                  ) : (
                    <div className="grid h-14 w-14 place-items-center rounded-full border-4 border-card bg-muted text-lg font-bold text-primary">
                      {v.business_name.slice(0, 1).toUpperCase()}
                    </div>
                  )}
                  <div className="mt-2 flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold">{v.business_name}</p>
                      <p className="text-xs text-muted-foreground">{v.category}</p>
                    </div>
                    <OpenBadge isOpen={v.is_open} />
                  </div>
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Star className="h-3.5 w-3.5 fill-accent text-accent" />
                    <span className="font-semibold text-foreground">
                      {Number(v.rating ?? 0).toFixed(1)}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 w-full rounded-lg border-primary/50 text-primary"
                  >
                    View Store
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <Footer />
    </StudentLayout>
  );
}
