import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Lock, Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";

import { StudentLayout } from "@/components/layouts/StudentLayout";
import { EmptyState } from "@/components/EmptyState";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { formatNaira } from "@/lib/format";
import { StudentRoute } from "@/components/ProtectedRoute";
import { useCartContext } from "@/context/CartContext";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your cart — UniMarket" },
      {
        name: "description",
        content:
          "Review your campus orders, adjust quantities and check out securely with Paystack.",
      },
      { property: "og:title", content: "Your cart — UniMarket" },
      { property: "og:description", content: "Review your campus orders and check out securely." },
    ],
  }),
  component: () => (
    <StudentRoute>
      <CartPage />
    </StudentRoute>
  ),
});

const DELIVERY_FEE = 500;

function CartPage() {
  return (
    <StudentLayout>
      <CartPageContent />
    </StudentLayout>
  );
}

function CartPageContent() {
  const { cartItems, cartCount, cartTotal, loading, updateQuantity, removeFromCart } = useCartContext();
  const navigate = useNavigate();
  const total = cartItems.length ? cartTotal + DELIVERY_FEE : cartTotal;

  async function handleUpdateQuantity(cartItemId: string, quantity: number) {
    console.log('Updating cart item id:', cartItemId, 'new quantity:', quantity);
    const { error } = await updateQuantity(cartItemId, quantity);
    if (error) console.error('Update quantity error:', error);
  }

  async function handleRemove(cartItemId: string) {
    console.log('Removing cart item id:', cartItemId);
    const { error } = await removeFromCart(cartItemId);
    if (error) console.error('Remove error:', error);
  }

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-extrabold">Your Cart</h1>

        {loading ? (
          <LoadingSpinner label="Loading your cart..." />
        ) : cartItems.length === 0 ? (
          <EmptyState
            icon={ShoppingCart}
            title="Your cart is empty"
            subtitle="Browse verified vendors on your campus and add something tasty."
            action={
              <Button asChild className="rounded-lg glow-primary">
                <Link to="/">Start Shopping</Link>
              </Button>
            }
          />
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
            <div className="space-y-4">
              {cartItems.map((item) => {
                const image = item.product?.images?.[0];
                const price = item.product?.price ?? 0;
                return (
                  <div
                    key={item.id}
                    className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4 rounded-xl border border-border bg-card p-4"
                  >
                    <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-lg bg-gradient-to-br from-primary/20 to-background">
                      {image ? (
                        <img
                          src={image}
                          alt={item.product?.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-3xl" aria-hidden>
                          🛍️
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold">{item.product?.name}</p>
                          <p className="text-xs text-accent">{item.product?.vendor?.business_name}</p>
                          <p className="mt-1 text-sm font-extrabold">{formatNaira(price * item.quantity)}</p>
                        </div>
                        <button
                          onClick={() => handleRemove(item.id)}
                          className="shrink-0 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="mt-3 flex w-fit items-center rounded-lg border border-border">
                        <button
                          className="p-2 transition-colors hover:bg-muted"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-10 text-center text-sm font-bold">{item.quantity}</span>
                        <button
                          className="p-2 transition-colors hover:bg-muted"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <aside className="h-fit rounded-xl border border-border bg-card p-5 lg:sticky lg:top-24">
              <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
                Order Summary
              </h2>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Subtotal ({cartCount} items)</dt>
                  <dd className="font-semibold">{formatNaira(cartTotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Delivery Fee</dt>
                  <dd className="font-semibold">{formatNaira(DELIVERY_FEE)}</dd>
                </div>
              </dl>
              <div className="my-4 h-px bg-border" />
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="text-2xl font-extrabold">{formatNaira(total)}</span>
              </div>
              <Button
                className="mt-5 h-11 w-full rounded-lg font-bold glow-primary"
                onClick={() => navigate({ to: "/checkout" })}
              >
                Proceed to Checkout
              </Button>
              <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <Lock className="h-3.5 w-3.5" /> Secured by Paystack
              </p>
              <div className="mt-3 flex justify-center gap-2 text-[10px] font-semibold text-muted-foreground">
                {["VISA", "Mastercard", "Verve", "Transfer"].map((m) => (
                  <span key={m} className="rounded border border-border px-2 py-1">
                    {m}
                  </span>
                ))}
              </div>
            </aside>
          </div>
        )}
      </div>
    </>
  );
}
