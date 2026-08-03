import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Camera, CheckCircle, Loader2, MapPin, Package, Phone } from "lucide-react";

import { RiderLayout, type RiderTab } from "@/components/layouts/RiderLayout";
import { EmptyState } from "@/components/EmptyState";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { formatNaira } from "@/lib/format";
import { useRider } from "@/hooks/useRider";
import { RiderRoute } from "@/components/ProtectedRoute";

export const Route = createFileRoute("/rider/dashboard")({
  head: () => ({
    meta: [
      { title: "Rider Dashboard — UniMarket" },
      { name: "description", content: "Accept campus delivery jobs, upload pickup photos and complete deliveries as a UniMarket rider." },
      { property: "og:title", content: "Rider Dashboard — UniMarket" },
      { property: "og:description", content: "Accept delivery jobs and complete campus deliveries." },
    ],
  }),
  component: () => (
    <RiderRoute>
      <RiderDashboard />
    </RiderRoute>
  ),
});

const ACTIVE_STATUS_STYLES: Record<string, { label: string; className: string }> = {
  assigned: { label: "Heading to vendor", className: "bg-sky-500/15 text-sky-400" },
  at_vendor: { label: "At vendor", className: "bg-accent/15 text-accent" },
  picked_up: { label: "En route to student", className: "bg-primary/15 text-primary" },
};

function RiderDashboard() {
  const {
    availableJobs,
    activeDelivery,
    completedDeliveries,
    loading,
    acceptJob,
    updateDeliveryStatus,
  } = useRider();

  const [activeTab, setActiveTab] = useState<RiderTab>("available");
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [pickupPhotoUrl, setPickupPhotoUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  async function handlePhotoUpload(file: File) {
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch(
        `https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_IMGBB_KEY}`,
        {
          method: "POST",
          body: formData,
        },
      );

      const data = await response.json();

      if (data.success) {
        setPickupPhotoUrl(data.data.url);
      } else {
        console.error("Upload failed:", data);
      }
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
    }
  }

  async function handleAcceptJob(deliveryId: string) {
    setAcceptingId(deliveryId);
    const { error } = await acceptJob(deliveryId);
    if (error) console.error("Failed to accept job:", error);
    setAcceptingId(null);
    setActiveTab("active");
  }

  async function handleAtVendor() {
    if (!activeDelivery?.id) return;
    setUpdatingStatus(true);
    await updateDeliveryStatus(activeDelivery.id, "at_vendor");
    setUpdatingStatus(false);
  }

  async function handlePickedUp() {
    if (!activeDelivery?.id || !pickupPhotoUrl.trim()) return;
    setUpdatingStatus(true);
    await updateDeliveryStatus(activeDelivery.id, "picked_up", {
      pickup_photo_url: pickupPhotoUrl.trim(),
    });
    setPickupPhotoUrl("");
    setUpdatingStatus(false);
  }

  async function handleDelivered() {
    if (!activeDelivery?.id) return;
    setUpdatingStatus(true);
    await updateDeliveryStatus(activeDelivery.id, "delivered");
    setUpdatingStatus(false);
    setActiveTab("completed");
  }

  return (
    <RiderLayout activeTab={activeTab} onTabChange={setActiveTab}>
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
        {activeTab === "available" && (
          <div className="space-y-4">
            {loading ? (
              <LoadingSpinner label="Loading available jobs..." />
            ) : availableJobs.length === 0 ? (
              <EmptyState
                icon={Package}
                title="No jobs available"
                subtitle="New delivery jobs will appear here when vendors confirm student orders."
              />
            ) : (
              availableJobs.map((job) => (
                <div key={job.id} className="space-y-3 rounded-xl border border-border bg-card p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold">
                        Order #{job.order?.id?.slice(0, 8).toUpperCase()}
                      </p>
                      <p className="text-xs text-muted-foreground">{job.order?.vendor?.business_name}</p>
                    </div>
                    <span className="text-sm font-bold text-success">₦500</span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-start gap-2 text-sm">
                      <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">Pickup from</p>
                        <p className="text-sm">
                          {job.order?.vendor?.business_name}
                          {job.order?.vendor?.address && ` · ${job.order.vendor.address}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent" />
                      <div>
                        <p className="text-xs text-muted-foreground">Deliver to</p>
                        <p className="text-sm">{job.order?.delivery_address}</p>
                      </div>
                    </div>
                  </div>

                  <Button
                    className="w-full gap-2 rounded-lg glow-primary"
                    disabled={acceptingId === job.id || Boolean(activeDelivery)}
                    onClick={() => handleAcceptJob(job.id)}
                  >
                    {acceptingId === job.id && <Loader2 className="h-4 w-4 animate-spin" />}
                    {acceptingId === job.id
                      ? "Accepting..."
                      : activeDelivery
                        ? "Complete active delivery first"
                        : "Accept Job"}
                  </Button>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "active" && (
          <div className="space-y-4">
            {!activeDelivery ? (
              <EmptyState
                icon={CheckCircle}
                title="No active delivery"
                subtitle="Accept a job from the Available Jobs tab."
              />
            ) : (
              <>
                <div className="space-y-3 rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">
                      Order #{activeDelivery.order?.id?.slice(0, 8).toUpperCase()}
                    </h3>
                    {(() => {
                      const style = ACTIVE_STATUS_STYLES[activeDelivery.status] ?? {
                        label: activeDelivery.status,
                        className: "bg-muted text-muted-foreground",
                      };
                      return (
                        <span className={`rounded-full px-2 py-1 text-xs font-medium ${style.className}`}>
                          {style.label}
                        </span>
                      );
                    })()}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">Pickup</p>
                        <p className="text-sm">{activeDelivery.order?.vendor?.business_name}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                      <div>
                        <p className="text-xs text-muted-foreground">Deliver to</p>
                        <p className="text-sm">{activeDelivery.order?.delivery_address}</p>
                      </div>
                    </div>
                    {activeDelivery.order?.student?.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm">
                          {activeDelivery.order.student.full_name} · {activeDelivery.order.student.phone}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {activeDelivery.status === "assigned" && (
                  <Button
                    className="w-full gap-2 rounded-lg bg-accent text-accent-foreground hover:bg-accent/90"
                    disabled={updatingStatus}
                    onClick={handleAtVendor}
                  >
                    {updatingStatus && <Loader2 className="h-4 w-4 animate-spin" />}
                    {updatingStatus ? "Updating..." : "I'm at the Vendor"}
                  </Button>
                )}

                {activeDelivery.status === "at_vendor" && (
                  <div className="space-y-3">
                    <div className="rounded-xl border border-accent/30 bg-card p-4">
                      <div className="mb-3 flex items-center gap-2">
                        <Camera className="h-5 w-5 text-accent" />
                        <h4 className="font-medium">Upload Pickup Photo</h4>
                        <span className="rounded-full bg-destructive/15 px-2 py-0.5 text-xs text-destructive">
                          Required
                        </span>
                      </div>
                      <p className="mb-3 text-xs text-muted-foreground">
                        Take a clear photo of the complete order before picking up. This protects both
                        you and the student.
                      </p>

                      <div className="space-y-3">
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handlePhotoUpload(file);
                          }}
                          className="hidden"
                          id="pickup-photo-input"
                        />
                        <label
                          htmlFor="pickup-photo-input"
                          className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-accent/50 transition-colors hover:border-accent"
                        >
                          {uploading ? (
                            <div className="flex flex-col items-center gap-2">
                              <Loader2 className="h-6 w-6 animate-spin text-accent" />
                              <p className="text-xs text-muted-foreground">Uploading...</p>
                            </div>
                          ) : pickupPhotoUrl ? (
                            <img
                              src={pickupPhotoUrl}
                              alt="Pickup preview"
                              className="h-full w-full rounded-xl object-cover"
                            />
                          ) : (
                            <div className="flex flex-col items-center gap-2">
                              <Camera className="h-8 w-8 text-accent" />
                              <p className="text-sm text-accent">Tap to take photo</p>
                              <p className="text-xs text-muted-foreground">Opens camera on mobile</p>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>

                    <Button
                      className="w-full gap-2 rounded-lg glow-primary"
                      disabled={updatingStatus || uploading || !pickupPhotoUrl.trim()}
                      onClick={handlePickedUp}
                    >
                      {updatingStatus && <Loader2 className="h-4 w-4 animate-spin" />}
                      {updatingStatus
                        ? "Updating..."
                        : uploading
                          ? "Uploading photo..."
                          : !pickupPhotoUrl.trim()
                            ? "Add pickup photo first"
                            : "Confirm Pickup"}
                    </Button>
                  </div>
                )}

                {activeDelivery.status === "picked_up" && (
                  <div className="space-y-3">
                    {activeDelivery.pickup_photo_url && (
                      <div className="rounded-xl border border-success/30 bg-card p-3">
                        <p className="mb-2 text-xs text-success">✓ Pickup photo uploaded</p>
                        <img
                          src={activeDelivery.pickup_photo_url}
                          alt="Pickup"
                          className="h-32 w-full rounded-lg object-cover"
                        />
                      </div>
                    )}
                    <Button
                      className="w-full gap-2 rounded-lg bg-success text-success-foreground hover:bg-success/90"
                      disabled={updatingStatus}
                      onClick={handleDelivered}
                    >
                      {updatingStatus && <Loader2 className="h-4 w-4 animate-spin" />}
                      {updatingStatus ? "Updating..." : "✓ Mark as Delivered"}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === "completed" && (
          <div className="space-y-3">
            {completedDeliveries.length === 0 ? (
              <EmptyState
                icon={CheckCircle}
                title="No completed deliveries yet"
                subtitle="Your completed deliveries will appear here."
              />
            ) : (
              completedDeliveries.map((delivery) => (
                <div key={delivery.id} className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{delivery.order?.vendor?.business_name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {delivery.order?.delivery_address}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {delivery.delivered_at &&
                          new Date(delivery.delivered_at).toLocaleString("en-NG", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-bold text-success">{formatNaira(500)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </RiderLayout>
  );
}
