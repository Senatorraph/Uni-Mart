import { Link } from "@tanstack/react-router";
import { ShoppingCart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatNaira } from "@/lib/format";
import type { MockProduct } from "@/lib/mock-data";

export function ProductCard({ product }: { product: MockProduct }) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10">
      <Link
        to="/product/$id"
        params={{ id: product.id }}
        className="grid aspect-[4/3] place-items-center bg-gradient-to-br from-primary/15 via-card to-background text-5xl transition-transform duration-300 group-hover:scale-[1.03]"
      >
        <span aria-hidden>{product.emoji}</span>
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <span className="text-xs font-semibold text-accent">{product.vendor}</span>
        <Link
          to="/product/$id"
          params={{ id: product.id }}
          className="line-clamp-2 text-sm font-bold leading-snug transition-colors hover:text-primary"
        >
          {product.name}
        </Link>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Star className="h-3.5 w-3.5 fill-accent text-accent" />
          <span className="font-semibold text-foreground">{product.rating.toFixed(1)}</span>
          <span>({product.reviews})</span>
        </div>
        <div className="mt-auto flex items-baseline gap-2 pt-1">
          <span className="text-base font-extrabold">{formatNaira(product.price)}</span>
          {product.comparePrice && (
            <span className="text-xs text-muted-foreground line-through">
              {formatNaira(product.comparePrice)}
            </span>
          )}
        </div>
        <Button size="sm" className="mt-2 w-full gap-2 rounded-lg glow-primary">
          <ShoppingCart className="h-4 w-4" />
          Add to Cart
        </Button>
      </div>
    </div>
  );
}
