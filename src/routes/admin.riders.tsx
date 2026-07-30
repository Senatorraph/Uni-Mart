import { createFileRoute } from "@tanstack/react-router";

import { AdminLayout } from "@/components/layouts/AdminLayout";

export const Route = createFileRoute("/admin/riders")({
  head: () => ({
    meta: [
      { title: "Riders — UniMarket Admin" },
      { name: "description", content: "Manage campus delivery riders, verification and performance." },
      { property: "og:title", content: "Riders — UniMarket Admin" },
      { property: "og:description", content: "Manage campus delivery riders, verification and performance." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <AdminLayout title="Riders">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
          <h2 className="text-lg font-bold">Riders</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            This section is coming soon.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}
