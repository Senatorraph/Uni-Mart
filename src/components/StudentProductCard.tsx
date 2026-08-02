import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Loader2, ShoppingCart, Star } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { formatNaira } from "@/lib/format";
import { useCartContext } from "@/context/CartContext";
import type { ProductWithVendor } from "@/types";

export function StudentProductCard({ product }: { product: ProductWithVendor }) {
  const { addToCart } = useCartContext();
  const [adding, setAdding] = useState(false);

  const image = product.images?.[0];
  const outOfStock = product.stock_qty <= 0;

  async function handleAddToCart() {
    if (adding) return;
    setAdding(true);

    const { error } = await addToCart(product.id, 1);

    setAdding(false);

    if (error) {
      toast.error("Couldn't add to cart");
    } else {
      toast.success(`${product.name} added to cart`);
    }
  }

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10">
      <Link
        to="/product/$id"
        params={{ id: product.id }}
        className="relative grid aspect-[4/3] place-items-center overflow-hidden bg-gradient-to-br from-primary/15 via-card to-background transition-transform duration-300 group-hover:scale-[1.03]"
      >
        {image ? (
          <img src={image} alt={product.name} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <span className="text-5xl" aria-hidden>
            🛍️
          </span>
        )}
        {product.vendor_is_open === false && (
          <span className="absolute right-2 top-2 rounded-full border border-accent/30 bg-accent/15 px-2 py-0.5 text-[10px] font-semibold text-accent">
            Closed
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <span className="text-xs font-semibold text-accent">{product.business_name}</span>
        <Link
          to="/product/$id"
          params={{ id: product.id }}
          className="line-clamp-2 text-sm font-bold leading-snug transition-colors hover:text-primary"
        >
          {product.name}
        </Link>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Star className="h-3.5 w-3.5 fill-accent text-accent" />
          <span className="font-semibold text-foreground">{Number(product.rating ?? 0).toFixed(1)}</span>
          <span>({product.total_ratings ?? 0})</span>
        </div>
        <div className="mt-auto flex items-baseline gap-2 pt-1">
          <span className="text-base font-extrabold">{formatNaira(product.price)}</span>
          {product.compare_price && (
            <span className="text-xs text-muted-foreground line-through">
              {formatNaira(product.compare_price)}
            </span>
          )}
        </div>
        <Button
          size="sm"
          className="mt-2 w-full gap-2 rounded-lg glow-primary"
          disabled={outOfStock || adding}
          onClick={handleAddToCart}
        >
          {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingCart className="h-4 w-4" />}
          {outOfStock ? "Out of Stock" : "Add to Cart"}
        </Button>
      </div>
    </div>
  );
}
