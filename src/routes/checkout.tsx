import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Lock, MapPin } from "lucide-react";

import { StudentLayout } from "@/components/layouts/StudentLayout";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatNaira } from "@/lib/format";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useCartContext } from "@/context/CartContext";
import { StudentRoute } from "@/components/ProtectedRoute";
import type { CartItem } from "@/types";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — UniMarket" },
      {
        name: "description",
        content: "Confirm your hostel delivery details and pay securely for your campus order.",
      },
      { property: "og:title", content: "Checkout — UniMarket" },
      {
        property: "og:description",
        content: "Confirm delivery details and pay securely on UniMarket.",
      },
    ],
  }),
  component: () => (
    <StudentRoute>
      <Checkout />
    </StudentRoute>
  ),
});

const STEPS = ["Cart", "Checkout", "Payment", "Confirmation"];
const DELIVERY_FEE = 500;
const PLATFORM_FEE_RATE = 0.1;

function Checkout() {
  return (
    <StudentLayout>
      <CheckoutContent />
    </StudentLayout>
  );
}

function CheckoutContent() {
  const { profile, user } = useAuth();
  const { cartItems, cartTotal, clearCart, loading: cartLoading } = useCartContext();
  const navigate = useNavigate();

  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryNote, setDeliveryNote] = useState("");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subtotal = cartTotal;
  const total = subtotal + DELIVERY_FEE;

  // Redirect if the cart is empty — but not while the cart is still loading from
  // Supabase (cartItems starts at []) or while an order is actively being placed
  // (clearCart() empties the cart right before we navigate to the order page).
  useEffect(() => {
    if (!cartLoading && !loading && cartItems.length === 0) {
      navigate({ to: "/cart" });
    }
  }, [cartItems, cartLoading, loading, navigate]);

  if (cartLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner label="Loading your cart..." />
      </div>
    );
  }

  const itemsByVendor = cartItems.reduce(
    (groups, item) => {
      const vendorId = item.product?.vendor_id || "unknown";
      if (!groups[vendorId]) groups[vendorId] = [];
      groups[vendorId].push(item);
      return groups;
    },
    {} as Record<string, CartItem[]>,
  );

  async function createOrders() {
    if (!profile?.id || !profile?.university_id) {
      console.error("No profile or university_id", { profile });
      return null;
    }
    if (!deliveryAddress.trim()) {
      setError("Please enter your delivery address");
      return null;
    }

    setLoading(true);
    setError(null);

    const createdOrderIds: string[] = [];

    try {
      for (const [vendorId, items] of Object.entries(itemsByVendor)) {
        const vendorSubtotal = items.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);
        const vendorAmount = vendorSubtotal - vendorSubtotal * PLATFORM_FEE_RATE;

        const { data: order, error: orderError } = await supabase
          .from("orders")
          .insert({
            student_id: profile.id,
            vendor_id: vendorId,
            university_id: profile.university_id,
            status: "pending",
            subtotal: vendorSubtotal,
            delivery_fee: DELIVERY_FEE,
            discount: 0,
            total_amount: vendorSubtotal + DELIVERY_FEE,
            delivery_address: deliveryAddress.trim(),
            delivery_note: deliveryNote.trim() || null,
          })
          .select("id")
          .single();

        if (orderError || !order) throw new Error(orderError?.message || "Failed to create order");

        createdOrderIds.push(order.id);

        const orderItems = items.map((item) => ({
          order_id: order.id,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.product?.price || 0,
          subtotal: (item.product?.price || 0) * item.quantity,
        }));

        const { error: itemsError } = await supabase.from("order_items").insert(orderItems);

        if (itemsError) throw new Error(itemsError.message);

        const { error: paymentError } = await supabase.from("payments").insert({
          order_id: order.id,
          student_id: profile.id,
          vendor_id: vendorId,
          university_id: profile.university_id,
          amount: vendorSubtotal + DELIVERY_FEE,
          platform_fee: vendorSubtotal * PLATFORM_FEE_RATE,
          vendor_amount: vendorAmount,
          delivery_fee: DELIVERY_FEE,
          status: "pending",
        });

        if (paymentError) throw new Error(paymentError.message);

        const { error: deliveryError } = await supabase.from("deliveries").insert({
          order_id: order.id,
          university_id: profile.university_id,
          status: "pending",
        });

        if (deliveryError) throw new Error(deliveryError.message);
      }

      return createdOrderIds;
    } catch (err) {
      console.error("Order creation failed:", err);
      setError(err instanceof Error ? err.message : "Failed to create order. Please try again.");
      setLoading(false);
      return null;
    }
  }

  async function markOrdersPaid(orderIds: string[], paystackRef: string) {
    for (const orderId of orderIds) {
      await supabase.from("orders").update({ status: "paid" }).eq("id", orderId);
      await supabase
        .from("payments")
        .update({
          status: "held",
          paystack_ref: paystackRef,
          paid_at: new Date().toISOString(),
        })
        .eq("order_id", orderId);
    }
  }

  async function rollbackOrders(orderIds: string[]) {
    for (const orderId of orderIds) {
      await supabase.from("order_items").delete().eq("order_id", orderId);
      await supabase.from("payments").delete().eq("order_id", orderId);
      await supabase.from("deliveries").delete().eq("order_id", orderId);
      await supabase.from("orders").delete().eq("id", orderId);
    }
  }

  async function handleCheckout() {
    const orderIds = await createOrders();
    if (!orderIds || orderIds.length === 0) return;

    const paystackKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
    const isPlaceholderKey = !paystackKey || paystackKey === "pk_test_placeholder" || paystackKey.includes("xxxx");

    if (isPlaceholderKey) {
      // No real Paystack key configured yet — simulate a successful payment.
      await markOrdersPaid(orderIds, `SIMULATED-${Date.now()}`);
      await clearCart();
      navigate({ to: "/orders/$id", params: { id: orderIds[0] } });
      setLoading(false);
      return;
    }

    const PaystackPop = (await import("@paystack/inline-js")).default;
    const paystack = new PaystackPop();

    paystack.newTransaction({
      key: paystackKey,
      email: user?.email || "",
      amount: total * 100,
      currency: "NGN",
      ref: `UM-${Date.now()}`,
      metadata: {
        order_ids: orderIds,
        student_id: profile?.id,
      },
      onSuccess: async (transaction) => {
        await markOrdersPaid(orderIds, transaction.reference);
        await clearCart();
        navigate({ to: "/orders/$id", params: { id: orderIds[0] } });
      },
      onCancel: async () => {
        await rollbackOrders(orderIds);
        setError("Payment was cancelled. Your cart is still saved.");
        setLoading(false);
      },
    });
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <ol className="mb-8 flex flex-wrap items-center gap-3 text-xs">
        {STEPS.map((s, i) => (
          <li key={s} className="flex items-center gap-3">
            <span
              className={`flex items-center gap-2 rounded-full border px-3 py-1.5 font-semibold ${
                i <= 1
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border bg-card text-muted-foreground"
              }`}
            >
              <span className="grid h-5 w-5 place-items-center rounded-full bg-primary/20 text-[10px]">
                {i + 1}
              </span>
              {s}
            </span>
            {i < STEPS.length - 1 && <span className="h-px w-6 bg-border" />}
          </li>
        ))}
      </ol>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="space-y-5 rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-bold">Delivery Details</h2>

          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Delivery Address *</Label>
            <Textarea
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              rows={3}
              placeholder="e.g. Block C, Room 204, Mandate Hostel"
              className="rounded-lg border-border bg-background"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Delivery Note (optional)</Label>
            <Textarea
              value={deliveryNote}
              onChange={(e) => setDeliveryNote(e.target.value)}
              rows={2}
              placeholder="e.g. Call me when you get to the gate"
              className="rounded-lg border-border bg-background"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Contact Phone Number</Label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0801 234 5678"
              className="h-11 rounded-lg border-border bg-background"
            />
          </div>

          <div className="relative grid h-44 place-items-center overflow-hidden rounded-xl border border-border bg-gradient-to-br from-primary/15 via-card to-background">
            <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(var(--border)_1px,transparent_1px),linear-gradient(90deg,var(--border)_1px,transparent_1px)] [background-size:28px_28px]" />
            <div className="relative flex flex-col items-center gap-2 text-center">
              <MapPin className="h-7 w-7 text-primary" />
              <p className="text-sm font-semibold">Campus Delivery Zone</p>
              <p className="text-xs text-muted-foreground">
                University of Africa, Toru-Orua · all hostels covered
              </p>
            </div>
          </div>
        </section>

        <aside className="h-fit rounded-xl border border-border bg-card p-5 lg:sticky lg:top-24">
          <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Payment Summary</h2>
          <ul className="mt-4 space-y-3">
            {cartItems.map((item) => {
              const image = item.product?.images?.[0];
              return (
                <li key={item.id} className="flex items-center gap-3 text-sm">
                  <div className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-lg bg-muted">
                    {image ? (
                      <img src={image} alt={item.product?.name} className="h-full w-full object-cover" />
                    ) : (
                      <span aria-hidden>🛍️</span>
                    )}
                  </div>
                  <span className="min-w-0 flex-1 truncate">
                    {item.product?.name} <span className="text-muted-foreground">×{item.quantity}</span>
                  </span>
                  <span className="font-semibold">{formatNaira((item.product?.price || 0) * item.quantity)}</span>
                </li>
              );
            })}
          </ul>
          <div className="my-4 h-px bg-border" />
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd>{formatNaira(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Delivery Fee</dt>
              <dd>{formatNaira(DELIVERY_FEE)}</dd>
            </div>
            <div className="flex justify-between text-base font-extrabold">
              <dt>Total</dt>
              <dd>{formatNaira(total)}</dd>
            </div>
          </dl>
          <Button
            className="mt-5 h-11 w-full gap-2 rounded-lg font-bold glow-primary"
            disabled={loading || cartItems.length === 0}
            onClick={handleCheckout}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              `Pay ${formatNaira(total)}`
            )}
          </Button>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <Lock className="h-3.5 w-3.5" /> Paystack · Your payment is secured
          </p>
        </aside>
      </div>
    </div>
  );
}
