import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Minus, Plus, Star } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Navbar } from "@/components/Navbar";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { EmptyState } from "@/components/EmptyState";
import { VendorCard } from "@/components/VendorCard";
import { Button } from "@/components/ui/button";
import { formatNaira } from "@/lib/format";

export const Route = createFileRoute("/product/$id")({
  ssr: false,
  component: ProductDetail,
});

function ProductDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { user, profile, session, loading } = useAuth();
  const [product, setProduct] = useState<any | null>(null);
  const [vendor, setVendor] = useState<any | null>(null);
  const [ratings, setRatings] = useState<any[]>([]);
  const [qty, setQty] = useState(1);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !session) navigate({ to: "/auth", search: { next: "" }, replace: true });
  }, [loading, session, navigate]);

  useEffect(() => {
    (async () => {
      setFetching(true);
      const { data, error } = await (supabase as any)
        .from("products")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) setError(error.message);
      setProduct(data);
      if (data?.vendor_id) {
        const { data: v } = await (supabase as any)
          .from("vendors")
          .select("*")
          .eq("id", data.vendor_id)
          .maybeSingle();
        setVendor(v);
      }
      const { data: r } = await (supabase as any)
        .from("ratings")
        .select("*")
        .eq("product_id", id)
        .order("created_at", { ascending: false })
        .limit(10);
      setRatings(r ?? []);
      setFetching(false);
    })();
  }, [id]);

  const addToCart = async (goToCart = false) => {
    if (!user || !product) return;
    const { error } = await (supabase as any).from("cart_items").insert({
      user_id: user.id,
      product_id: product.id,
      quantity: qty,
      university_id: profile?.university_id ?? product.university_id,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Added to cart");
    if (goToCart) navigate({ to: "/cart" });
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <LoadingSpinner label="Loading product..." />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="mx-auto max-w-3xl px-4 py-10">
          <EmptyState title="Product not found" subtitle={error ?? "This product may have been removed."} />
        </div>
      </div>
    );
  }

  const image = product.image_url ?? (Array.isArray(product.images) ? product.images[0] : null);
  const inStock = (product.stock ?? 1) > 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 md:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="aspect-square bg-muted">
            {image ? (
              <img src={image} alt={product.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                No image
              </div>
            )}
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">{product.name}</h1>
            <div className="mt-2 flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-primary">{formatNaira(product.price)}</span>
              {product.compare_price && Number(product.compare_price) > Number(product.price) && (
                <span className="text-base text-muted-foreground line-through">
                  {formatNaira(product.compare_price)}
                </span>
              )}
            </div>
            <p className={`mt-2 text-sm ${inStock ? "text-emerald-400" : "text-red-400"}`}>
              {inStock ? "In stock" : "Out of stock"}
            </p>
          </div>

          {vendor && <VendorCard vendor={vendor} />}

          <div className="flex items-center gap-3">
            <div className="flex items-center rounded-lg border border-border bg-card">
              <button
                className="p-2 hover:bg-muted"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-10 text-center text-sm font-semibold">{qty}</span>
              <button className="p-2 hover:bg-muted" onClick={() => setQty((q) => q + 1)}>
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex gap-3">
            <Button className="flex-1" onClick={() => addToCart(false)} disabled={!inStock}>
              Add to Cart
            </Button>
            <Button variant="secondary" className="flex-1" onClick={() => addToCart(true)} disabled={!inStock}>
              Buy Now
            </Button>
          </div>

          {product.description && (
            <div>
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Description
              </h3>
              <p className="text-sm leading-relaxed text-foreground/90">{product.description}</p>
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-16">
        <h2 className="mb-4 text-xl font-bold">Reviews</h2>
        {ratings.length === 0 ? (
          <EmptyState title="No reviews yet" subtitle="Be the first to review this product." />
        ) : (
          <div className="space-y-3">
            {ratings.map((r) => (
              <div key={r.id} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-1 text-accent">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < (r.rating ?? 0) ? "fill-accent" : "opacity-30"}`}
                    />
                  ))}
                </div>
                {r.review && <p className="mt-2 text-sm text-foreground/90">{r.review}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
