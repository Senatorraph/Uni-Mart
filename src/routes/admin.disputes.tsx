import { createFileRoute } from "@tanstack/react-router";

import { AdminLayout } from "@/components/layouts/AdminLayout";

export const Route = createFileRoute("/admin/disputes")({
  head: () => ({
    meta: [
      { title: "Disputes — UniMarket Admin" },
      { name: "description", content: "Review and resolve order disputes raised by students and vendors." },
      { property: "og:title", content: "Disputes — UniMarket Admin" },
      { property: "og:description", content: "Review and resolve order disputes raised by students and vendors." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <AdminLayout title="Disputes">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
          <h2 className="text-lg font-bold">Disputes</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            This section is coming soon.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}
