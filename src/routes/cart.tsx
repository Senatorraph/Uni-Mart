import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Navbar } from "@/components/Navbar";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { formatNaira } from "@/lib/format";

const DELIVERY_FEE = 500;

export const Route = createFileRoute("/cart")({
  ssr: false,
  component: CartPage,
});

type CartRow = {
  id: string;
  quantity: number;
  product_id: string;
  products: {
    id: string;
    name: string;
    price: number | string;
    image_url: string | null;
    images?: string[] | null;
    vendor_id: string;
    vendors?: { business_name: string | null } | null;
  } | null;
};

function CartPage() {
  const navigate = useNavigate();
  const { user, session, loading } = useAuth();
  const [items, setItems] = useState<CartRow[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !session) navigate({ to: "/auth", replace: true });
  }, [loading, session, navigate]);

  const load = async () => {
    if (!user) return;
    setFetching(true);
    const { data, error } = await (supabase as any)
      .from("cart_items")
      .select("id, quantity, product_id, products(id, name, price, image_url, images, vendor_id, vendors(business_name))")
      .eq("user_id", user.id);
    if (error) toast.error(error.message);
    setItems((data as any) ?? []);
    setFetching(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const updateQty = async (id: string, quantity: number) => {
    if (quantity < 1) return;
    const { error } = await (supabase as any).from("cart_items").update({ quantity }).eq("id", id);
    if (error) toast.error(error.message);
    else load();
  };

  const remove = async (id: string) => {
    const { error } = await (supabase as any).from("cart_items").delete().eq("id", id);
    if (error) toast.error(error.message);
    else load();
  };

  const subtotal = items.reduce((sum, it) => {
    const price = Number(it.products?.price ?? 0);
    return sum + price * it.quantity;
  }, 0);
  const total = subtotal + (items.length ? DELIVERY_FEE : 0);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold">Your Cart</h1>
        {fetching ? (
          <LoadingSpinner label="Loading cart..." />
        ) : items.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title="Your cart is empty"
            subtitle="Browse products on your campus and add them to your cart."
            action={
              <Button asChild>
                <Link to="/">Start shopping</Link>
              </Button>
            }
          />
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="space-y-3">
              {items.map((it) => {
                const p = it.products;
                const img = p?.image_url ?? (Array.isArray(p?.images) ? p!.images![0] : null);
                return (
                  <div
                    key={it.id}
                    className="flex gap-4 rounded-xl border border-border bg-card p-3"
                  >
                    <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-muted">
                      {img ? (
                        <img src={img} alt={p?.name ?? ""} className="h-full w-full object-cover" />
                      ) : null}
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col justify-between">
                      <div>
                        <p className="line-clamp-1 font-medium">{p?.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {p?.vendors?.business_name ?? "Vendor"}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-primary">
                          {formatNaira(p?.price ?? 0)}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center rounded-lg border border-border">
                          <button className="p-1.5 hover:bg-muted" onClick={() => updateQty(it.id, it.quantity - 1)}>
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-8 text-center text-sm">{it.quantity}</span>
                          <button className="p-1.5 hover:bg-muted" onClick={() => updateQty(it.id, it.quantity + 1)}>
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <button
                          onClick={() => remove(it.id)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="h-fit rounded-xl border border-border bg-card p-5">
              <h2 className="mb-4 text-lg font-semibold">Order Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="text-foreground">{formatNaira(subtotal)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Delivery fee</span>
                  <span className="text-foreground">{formatNaira(DELIVERY_FEE)}</span>
                </div>
                <div className="mt-3 border-t border-border pt-3 flex justify-between text-base font-bold">
                  <span>Total</span>
                  <span className="text-primary">{formatNaira(total)}</span>
                </div>
              </div>
              <Button className="mt-5 w-full" size="lg">
                Proceed to Checkout
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
