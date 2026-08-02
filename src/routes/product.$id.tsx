import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bike, Loader2, Minus, Plus, ShoppingCart, Star } from "lucide-react";
import { toast } from "sonner";

import { StudentLayout } from "@/components/layouts/StudentLayout";
import { Footer } from "@/components/Footer";
import { OpenBadge } from "@/components/VendorCard";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { formatNaira } from "@/lib/format";
import { supabase } from "@/integrations/supabase/client";
import { useCartContext } from "@/context/CartContext";
import { StudentRoute } from "@/components/ProtectedRoute";
import type { Product, Vendor, Rating } from "@/types";

export const Route = createFileRoute("/product/$id")({
  head: () => ({
    meta: [
      { title: "Product details — UniMarket" },
      {
        name: "description",
        content:
          "See prices, vendor ratings and reviews before you order from a verified campus vendor.",
      },
      { property: "og:title", content: "Product details — UniMarket" },
      {
        property: "og:description",
        content: "See prices, vendor ratings and reviews on UniMarket.",
      },
    ],
  }),
  component: () => (
    <StudentRoute>
      <ProductDetail />
    </StudentRoute>
  ),
});

function ProductDetail() {
  return (
    <StudentLayout>
      <ProductDetailContent />
    </StudentLayout>
  );
}

function ProductDetailContent() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { addToCart } = useCartContext();

  const [product, setProduct] = useState<Product | null>(null);
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [reviews, setReviews] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;
    setLoading(true);

    async function fetchProduct() {
      const { data: productData, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (cancelled) return;

      if (error || !productData) {
        console.error("Product not found:", error?.message);
        setProduct(null);
        setLoading(false);
        return;
      }

      setProduct(productData as Product);
      setSelectedImage(0);
      setQuantity(1);

      const [{ data: vendorData }, { data: reviewData }] = await Promise.all([
        supabase.from("vendors").select("*").eq("id", productData.vendor_id).single(),
        supabase
          .from("ratings")
          .select("*")
          .eq("product_id", id)
          .order("created_at", { ascending: false })
          .limit(10),
      ]);

      if (cancelled) return;

      if (vendorData) setVendor(vendorData as Vendor);
      setReviews((reviewData as Rating[]) ?? []);

      setLoading(false);
    }

    fetchProduct();
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleAddToCart(redirectToCart: boolean) {
    if (!product || addingToCart) return;
    setAddingToCart(true);

    const { error } = await addToCart(product.id, quantity);

    setAddingToCart(false);

    if (error) {
      toast.error("Couldn't add to cart");
      return;
    }

    toast.success(`${product.name} added to cart`);
    if (redirectToCart) navigate({ to: "/cart" });
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl animate-pulse px-4 py-8">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="h-80 rounded-xl bg-muted md:h-96" />
          <div className="space-y-4">
            <div className="h-4 w-1/4 rounded bg-muted" />
            <div className="h-8 w-3/4 rounded bg-muted" />
            <div className="h-6 w-1/3 rounded bg-muted" />
            <div className="h-12 w-1/3 rounded bg-muted" />
            <div className="h-32 rounded bg-muted" />
            <div className="h-12 rounded bg-muted" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <EmptyState
          title="Product not found"
          subtitle="This product may have been removed."
          action={
            <Button className="rounded-lg glow-primary" onClick={() => navigate({ to: "/" })}>
              Back to Marketplace
            </Button>
          }
        />
      </div>
    );
  }

  const images = product.images ?? [];
  const roundedRating = Math.round(Number(product.rating ?? 0));
  const outOfStock = product.stock_qty <= 0;

  return (
    <>
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-8 md:grid-cols-2">
        <div>
          <div className="grid aspect-square place-items-center overflow-hidden rounded-xl border border-border bg-gradient-to-br from-primary/20 via-card to-background">
            {images[selectedImage] ? (
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-8xl" aria-hidden>
                🛍️
              </span>
            )}
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex gap-3 overflow-x-auto">
              {images.map((img, i) => (
                <button
                  key={img + i}
                  onClick={() => setSelectedImage(i)}
                  className={`grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-lg border bg-card transition-colors ${
                    i === selectedImage ? "border-primary" : "border-border hover:border-primary/40"
                  }`}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-5">
          <div>
            {vendor && <p className="text-sm font-semibold text-accent">{vendor.business_name}</p>}
            <h1 className="mt-1 text-3xl font-extrabold leading-tight">{product.name}</h1>
            <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < roundedRating ? "fill-accent text-accent" : "text-muted-foreground opacity-40"
                    }`}
                  />
                ))}
              </div>
              <span>({product.total_ratings ?? 0} reviews)</span>
            </div>
            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-4xl font-extrabold">{formatNaira(product.price)}</span>
              {product.compare_price && (
                <span className="text-base text-muted-foreground line-through">
                  {formatNaira(product.compare_price)}
                </span>
              )}
            </div>
            <span
              className={`mt-3 inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
                outOfStock
                  ? "border-destructive/30 bg-destructive/15 text-destructive"
                  : "border-success/30 bg-success/15 text-success"
              }`}
            >
              {outOfStock ? "Out of Stock" : `In Stock (${product.stock_qty} available)`}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Quantity:</span>
            <div className="flex items-center rounded-lg border border-border bg-card">
              <button
                className="p-2.5 transition-colors hover:bg-muted"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-12 text-center text-sm font-bold">{quantity}</span>
              <button
                className="p-2.5 transition-colors hover:bg-muted"
                onClick={() => setQuantity((q) => Math.min(product.stock_qty, q + 1))}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              variant="outline"
              className="h-11 flex-1 gap-2 rounded-lg border-primary/60 font-bold text-primary"
              disabled={addingToCart || outOfStock}
              onClick={() => handleAddToCart(false)}
            >
              {addingToCart ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ShoppingCart className="h-4 w-4" />
              )}
              Add to Cart
            </Button>
            <Button
              className="h-11 flex-1 rounded-lg font-bold glow-primary"
              disabled={addingToCart || outOfStock}
              onClick={() => handleAddToCart(true)}
            >
              Buy Now
            </Button>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-sm">
            <Bike className="h-5 w-5 shrink-0 text-primary" />
            <span>Campus delivery • ₦500 flat fee • 30-45 mins</span>
          </div>

          {vendor && (
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-primary/20 text-lg font-bold text-primary">
                  {vendor.business_name.slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-bold">{vendor.business_name}</p>
                    <OpenBadge isOpen={vendor.is_open} />
                  </div>
                  <p className="text-xs text-muted-foreground">{vendor.category}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                    <Star className="h-3.5 w-3.5 fill-accent text-accent" />
                    <span className="font-semibold text-foreground">
                      {Number(vendor.rating ?? 0).toFixed(1)}
                    </span>
                    <span>({vendor.total_ratings ?? 0} ratings)</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {product.description && (
            <div>
              <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-muted-foreground">
                Description
              </h3>
              <p className="text-sm leading-relaxed text-foreground/90">{product.description}</p>
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-16">
        <h2 className="mb-5 text-xl font-bold">Reviews ({reviews.length})</h2>
        {reviews.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No reviews yet. Be the first to review this product.
          </p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {reviews.map((review) => (
              <div key={review.id} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                    U
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3.5 w-3.5 ${
                            i < (review.product_rating ?? 0)
                              ? "fill-accent text-accent"
                              : "text-muted-foreground opacity-40"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(review.created_at).toLocaleDateString("en-NG")}
                    </p>
                  </div>
                </div>
                {review.review_text && (
                  <p className="mt-3 text-sm text-foreground/90">{review.review_text}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </>
  );
}
