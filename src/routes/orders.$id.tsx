import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Camera, Check, Loader2, Phone } from "lucide-react";

import { StudentLayout } from "@/components/layouts/StudentLayout";
import { EmptyState } from "@/components/EmptyState";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { OrderStatusBadge } from "@/components/OrderStatusBadge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatNaira } from "@/lib/format";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { StudentRoute } from "@/components/ProtectedRoute";
import type { Delivery, Dispute, Order, OrderItem, OrderStatus, Payment } from "@/types";

// Canonical happy-path ordering, used as a fallback when a step's own timestamp
// hasn't been set yet (e.g. a status was updated without also stamping the
// corresponding *_at column — the real vendor/rider actions that will do both
// atomically aren't wired up yet). A dispute can only be raised after delivery
// per the order lifecycle, so it's mapped to "delivered" for this comparison —
// unlike 'cancelled'/'refunded', which can happen at any point and are left out
// (no safe assumption about how far they got).
const STATUS_SEQUENCE: OrderStatus[] = [
  "pending",
  "paid",
  "confirmed",
  "rider_assigned",
  "picked_up",
  "delivered",
  "completed",
];

function statusIndex(status: OrderStatus): number {
  const effective = status === "disputed" ? "delivered" : status;
  return STATUS_SEQUENCE.indexOf(effective);
}

export const Route = createFileRoute("/orders/$id")({
  head: () => ({
    meta: [
      { title: "Track your order — UniMarket" },
      {
        name: "description",
        content:
          "Follow your campus delivery step by step, from vendor confirmation to rider drop-off.",
      },
      { property: "og:title", content: "Track your order — UniMarket" },
      { property: "og:description", content: "Follow your campus delivery step by step." },
    ],
  }),
  component: () => (
    <StudentRoute>
      <OrderTracking />
    </StudentRoute>
  ),
});

type StepContext = { order: Order; delivery: Delivery | null; payment: Payment | null };

type StepDef = {
  key: string;
  label: string;
  description: string;
  minStatus: OrderStatus;
  isComplete: (ctx: StepContext) => boolean;
};

const STEP_DEFS: StepDef[] = [
  {
    key: "paid",
    label: "Order Placed",
    description: "Your order has been placed and payment received",
    minStatus: "paid",
    isComplete: ({ order, payment }) => Boolean(payment?.paid_at) || order.status !== "pending",
  },
  {
    key: "confirmed",
    label: "Vendor Confirmed",
    description: "The vendor has confirmed your order",
    minStatus: "confirmed",
    isComplete: ({ order }) => Boolean(order.confirmed_at),
  },
  {
    key: "rider_assigned",
    label: "Rider Assigned",
    description: "A rider has accepted your delivery",
    minStatus: "rider_assigned",
    isComplete: ({ delivery }) => Boolean(delivery?.assigned_at),
  },
  {
    key: "picked_up",
    label: "Order Picked Up",
    description: "Rider collected your order from the vendor",
    minStatus: "picked_up",
    isComplete: ({ delivery }) => Boolean(delivery?.picked_up_at),
  },
  {
    key: "delivered",
    label: "Delivered",
    description: "Your order has been delivered",
    minStatus: "delivered",
    isComplete: ({ order, delivery }) => Boolean(order.delivered_at) || delivery?.status === "delivered",
  },
];

// Each step is complete once either its own timestamp is set, or the order's status
// has reached-or-passed that point in STATUS_SEQUENCE. The OR means a step that's
// already been reached stays checked even through a terminal status change (the
// timestamp side), while still working when only the status was updated and the
// timestamp wasn't (the status-index side) — see STATUS_SEQUENCE above for why.
const ORDER_STEPS: StepDef[] = STEP_DEFS.map((step) => ({
  ...step,
  isComplete: (ctx: StepContext) => {
    const idx = statusIndex(ctx.order.status);
    return step.isComplete(ctx) || (idx >= 0 && idx >= STATUS_SEQUENCE.indexOf(step.minStatus));
  },
}));

const TERMINAL_BANNERS: Record<string, { label: string; className: string }> = {
  cancelled: {
    label: "This order was cancelled.",
    className: "border-border bg-muted text-muted-foreground",
  },
  refunded: {
    label: "This order was refunded.",
    className: "border-border bg-muted text-muted-foreground",
  },
  disputed: {
    label: "This order is under dispute.",
    className: "border-destructive/30 bg-destructive/10 text-destructive",
  },
};

const DISPUTE_STATUS_STYLES: Record<string, { label: string; className: string }> = {
  open: { label: "Under Review", className: "bg-accent/15 text-accent" },
  under_review: { label: "Under Review", className: "bg-accent/15 text-accent" },
  resolved_refund: { label: "Refund Approved", className: "bg-success/15 text-success" },
  resolved_release: { label: "Resolved — No Refund", className: "bg-muted text-muted-foreground" },
  closed: { label: "Closed", className: "bg-muted text-muted-foreground" },
};

function OrderTracking() {
  return (
    <StudentLayout>
      <OrderTrackingContent />
    </StudentLayout>
  );
}

function OrderTrackingContent() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();

  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [vendorName, setVendorName] = useState("");
  const [vendorLogo, setVendorLogo] = useState<string | null>(null);
  const [vendorWhatsapp, setVendorWhatsapp] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDisputeForm, setShowDisputeForm] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");
  const [submittingDispute, setSubmittingDispute] = useState(false);
  const [disputeSuccess, setDisputeSuccess] = useState(false);
  const [existingDispute, setExistingDispute] = useState<Dispute | null>(null);
  // Bumped after submitting a dispute to force an immediate refetch, on top of
  // (not instead of) the realtime subscription below — see the cart INSERT
  // backstop pattern for why: it's a harmless, faster-than-waiting belt-and-suspenders.
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    async function fetchOrder() {
      const [orderRes, itemsRes, deliveryRes, paymentRes] = await Promise.all([
        supabase.from("orders").select("*").eq("id", id).single(),
        supabase
          .from("order_items")
          .select(
            `
            *,
            product:products(name, images, price)
          `,
          )
          .eq("order_id", id),
        supabase.from("deliveries").select("*").eq("order_id", id).maybeSingle(),
        supabase.from("payments").select("*").eq("order_id", id).maybeSingle(),
      ]);

      if (cancelled) return;

      if (orderRes.data) {
        setOrder(orderRes.data as Order);

        const { data: vendor } = await supabase
          .from("vendors")
          .select("business_name, logo_url, whatsapp")
          .eq("id", orderRes.data.vendor_id)
          .single();

        if (!cancelled && vendor) {
          setVendorName(vendor.business_name);
          setVendorLogo(vendor.logo_url);
          setVendorWhatsapp(vendor.whatsapp);
        }
      } else {
        setOrder(null);
      }

      if (itemsRes.data) setOrderItems(itemsRes.data as OrderItem[]);
      if (deliveryRes.data) setDelivery(deliveryRes.data as Delivery);
      if (paymentRes.data) setPayment(paymentRes.data as Payment);

      setLoading(false);
    }

    fetchOrder();

    const sub = supabase
      .channel(`order-${id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${id}` },
        () => fetchOrder(),
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "deliveries", filter: `order_id=eq.${id}` },
        () => fetchOrder(),
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(sub);
    };
  }, [id, refetchTrigger]);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    async function checkDispute() {
      const { data } = await supabase.from("disputes").select("*").eq("order_id", id).maybeSingle();
      if (!cancelled && data) setExistingDispute(data as Dispute);
    }

    checkDispute();
    return () => {
      cancelled = true;
    };
  }, [id, refetchTrigger]);

  async function submitDispute() {
    if (!disputeReason.trim()) return;
    if (!profile?.id || !profile?.university_id || !order) return;

    setSubmittingDispute(true);

    try {
      const { data: dispute, error: disputeError } = await supabase
        .from("disputes")
        .insert({
          order_id: order.id,
          raised_by: profile.id,
          university_id: profile.university_id,
          reason: disputeReason.trim(),
          evidence_urls: [],
          status: "open",
        })
        .select("*")
        .single();

      if (disputeError) throw disputeError;

      const { error: orderError } = await supabase
        .from("orders")
        .update({ status: "disputed" })
        .eq("id", order.id);

      if (orderError) throw orderError;

      if (dispute) setExistingDispute(dispute as Dispute);
      setRefetchTrigger((t) => t + 1);
      setDisputeSuccess(true);
      setShowDisputeForm(false);
      setDisputeReason("");
    } catch (err) {
      console.error("Failed to submit dispute:", err instanceof Error ? err.message : err);
    } finally {
      setSubmittingDispute(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner label="Loading your order..." />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <EmptyState
          title="Order not found"
          subtitle="This order may not exist or may not belong to your account."
          action={
            <Button className="rounded-lg glow-primary" onClick={() => navigate({ to: "/orders" })}>
              Back to My Orders
            </Button>
          }
        />
      </div>
    );
  }

  const terminalBanner = TERMINAL_BANNERS[order.status];
  const stepContext: StepContext = { order, delivery, payment };
  const whatsappHref = vendorWhatsapp ? `https://wa.me/${vendorWhatsapp.replace(/\D/g, "")}` : null;

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">Order #{order.id.slice(0, 8).toUpperCase()}</h1>
          <p className="text-sm text-muted-foreground">
            Placed{" "}
            {new Date(order.created_at).toLocaleDateString("en-NG", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {terminalBanner && (
        <div className={`rounded-xl border p-4 text-sm font-medium ${terminalBanner.className}`}>
          {terminalBanner.label}
        </div>
      )}

      <div className="rounded-xl border border-border bg-card p-6">
        {ORDER_STEPS.map((step, index) => {
          const isComplete = step.isComplete(stepContext);
          return (
            <div key={step.key} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-bold ${
                    isComplete ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {isComplete ? <Check className="h-4 w-4" /> : index + 1}
                </div>
                {index < ORDER_STEPS.length - 1 && (
                  <div className={`mt-1 h-8 w-0.5 ${isComplete ? "bg-primary" : "bg-muted"}`} />
                )}
              </div>
              <div className="pb-6">
                <p className={`text-sm font-semibold ${isComplete ? "" : "text-muted-foreground"}`}>
                  {step.label}
                </p>
                <p className="text-xs text-muted-foreground">{step.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {delivery?.pickup_photo_url && (
        <div className="rounded-xl border border-accent/40 bg-card p-5">
          <p className="flex items-center gap-2 text-sm font-bold">
            <Camera className="h-4 w-4 text-accent" /> Pickup Photo
            <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-bold text-accent">
              Verified
            </span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Photo taken by rider at pickup — proof of what was collected.
          </p>
          <img
            src={delivery.pickup_photo_url}
            alt="Order pickup verification"
            className="mt-3 h-48 w-full rounded-lg border-2 border-accent/40 object-cover"
          />
        </div>
      )}

      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Items</h2>
        <div className="mt-3 space-y-3">
          {orderItems.map((item) => {
            const image = item.product?.images?.[0];
            return (
              <div key={item.id} className="flex items-center gap-3">
                <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-lg bg-muted">
                  {image ? (
                    <img src={image} alt={item.product?.name} className="h-full w-full object-cover" />
                  ) : (
                    <span aria-hidden>🛍️</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.product?.name}</p>
                  <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                </div>
                <p className="text-sm font-bold">{formatNaira(item.unit_price * item.quantity)}</p>
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
          <span className="text-sm text-muted-foreground">Total paid</span>
          <span className="text-xl font-extrabold">{formatNaira(order.total_amount)}</span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Delivery Details</h2>
          <p className="mt-3 text-sm">{order.delivery_address}</p>
          {order.delivery_note && (
            <p className="mt-1 text-xs text-muted-foreground">Note: {order.delivery_note}</p>
          )}
          <p className="mt-1 text-xs text-muted-foreground">Estimated arrival: 30-45 mins</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Vendor</h2>
          <div className="mt-3 flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full bg-muted">
              {vendorLogo ? (
                <img src={vendorLogo} alt={vendorName} className="h-full w-full object-cover" />
              ) : (
                <span className="text-sm font-bold text-primary">{vendorName.slice(0, 1).toUpperCase()}</span>
              )}
            </div>
            <p className="min-w-0 flex-1 truncate text-sm font-semibold">{vendorName}</p>
            <Button size="sm" variant="outline" className="rounded-lg" disabled={!whatsappHref} asChild={Boolean(whatsappHref)}>
              {whatsappHref ? (
                <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
                  <Phone className="h-4 w-4" />
                </a>
              ) : (
                <Phone className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {existingDispute && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4">
          <h4 className="mb-1 font-semibold text-destructive">Dispute Filed</h4>
          <p className="text-sm text-muted-foreground">{existingDispute.reason}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {(() => {
              const style = DISPUTE_STATUS_STYLES[existingDispute.status] ?? {
                label: existingDispute.status,
                className: "bg-muted text-muted-foreground",
              };
              return (
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${style.className}`}>
                  {style.label}
                </span>
              );
            })()}
            {existingDispute.classifier_recommendation && (
              <span className="text-xs text-muted-foreground">
                AI recommendation: {existingDispute.classifier_recommendation}
              </span>
            )}
          </div>
          {existingDispute.resolution_note && (
            <p className="mt-2 border-t border-destructive/20 pt-2 text-sm text-muted-foreground">
              Admin note: {existingDispute.resolution_note}
            </p>
          )}
        </div>
      )}

      {disputeSuccess && (
        <div className="rounded-xl border border-success/30 bg-success/10 p-4">
          <p className="flex items-center gap-1.5 text-sm font-medium text-success">
            <Check className="h-4 w-4" /> Dispute submitted successfully
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Our team will review your case and respond within 24 hours. Payment is held until the
            dispute is resolved.
          </p>
        </div>
      )}

      {["delivered", "completed"].includes(order.status) && !existingDispute && (
        <div>
          {!showDisputeForm ? (
            <Button
              variant="outline"
              className="w-full rounded-lg border-destructive/60 text-destructive"
              onClick={() => setShowDisputeForm(true)}
            >
              Raise a Dispute
            </Button>
          ) : (
            <div className="space-y-3 rounded-xl border border-destructive/30 bg-card p-4">
              <h4 className="font-semibold">Raise a Dispute</h4>
              <p className="text-xs text-muted-foreground">
                Describe what went wrong with your order. Our team will review your case within 24
                hours.
              </p>
              <Textarea
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                placeholder="e.g. The item I received was different from what was shown. I ordered a blue shirt but received a red one."
                rows={4}
                className="rounded-lg border-border bg-background"
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 rounded-lg"
                  onClick={() => {
                    setShowDisputeForm(false);
                    setDisputeReason("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1 gap-2 rounded-lg"
                  disabled={!disputeReason.trim() || submittingDispute}
                  onClick={submitDispute}
                >
                  {submittingDispute && <Loader2 className="h-4 w-4 animate-spin" />}
                  {submittingDispute ? "Submitting..." : "Submit Dispute"}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
