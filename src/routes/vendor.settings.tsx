import { createFileRoute } from "@tanstack/react-router";

import { VendorLayout } from "@/components/layouts/VendorLayout";

export const Route = createFileRoute("/vendor/settings")({
  head: () => ({
    meta: [
      { title: "Store Settings — UniMarket Vendor" },
      { name: "description", content: "Manage your campus store name, category, opening hours and payout details." },
      { property: "og:title", content: "Store Settings — UniMarket Vendor" },
      { property: "og:description", content: "Manage your campus store name, category, opening hours and payout details." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <VendorLayout title="Store Settings">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
          <h2 className="text-lg font-bold">Store Settings</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            This section is coming soon.
          </p>
        </div>
      </div>
    </VendorLayout>
  );
}
