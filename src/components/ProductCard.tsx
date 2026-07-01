import { Star, Plus } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { formatNaira } from "@/lib/format";

export type ProductCardData = {
  id: string;
  name: string;
  price: number | string;
  image_url?: string | null;
  vendor_name?: string | null;
  vendor_rating?: number | null;
  category?: string | null;
};

export function ProductCard({
  product,
  onAdd,
}: {
  product: ProductCardData;
  onAdd?: (p: ProductCardData) => void;
}) {
  return (
    <div className="group overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5">
      <Link
        to="/product/$id"
        params={{ id: product.id }}
        className="block aspect-square overflow-hidden bg-muted"
      >
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            No image
          </div>
        )}
      </Link>
      <div className="space-y-2 p-3">
        <Link
          to="/product/$id"
          params={{ id: product.id }}
          className="line-clamp-1 text-sm font-medium hover:text-primary"
        >
          {product.name}
        </Link>
        <div className="flex items-center justify-between">
          <span className="text-base font-bold">{formatNaira(product.price)}</span>
          {product.vendor_rating != null && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Star className="h-3 w-3 fill-accent text-accent" />
              {Number(product.vendor_rating).toFixed(1)}
            </span>
          )}
        </div>
        {product.vendor_name && (
          <p className="line-clamp-1 text-xs text-muted-foreground">{product.vendor_name}</p>
        )}
        <Button
          size="sm"
          className="w-full gap-1"
          onClick={(e) => {
            e.preventDefault();
            onAdd?.(product);
          }}
        >
          <Plus className="h-4 w-4" />
          Add to Cart
        </Button>
      </div>
    </div>
  );
}
