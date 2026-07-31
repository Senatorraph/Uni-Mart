import { createFileRoute } from "@tanstack/react-router";

import { AdminLayout } from "@/components/layouts/AdminLayout";
import { AdminRoute } from "@/components/ProtectedRoute";

export const Route = createFileRoute("/admin/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — UniMarket Admin" },
      { name: "description", content: "Track orders, revenue and growth across your campus marketplace." },
      { property: "og:title", content: "Analytics — UniMarket Admin" },
      { property: "og:description", content: "Track orders, revenue and growth across your campus marketplace." },
    ],
  }),
  component: () => (
    <AdminRoute>
      <Page />
    </AdminRoute>
  ),
});

function Page() {
  return (
    <AdminLayout title="Analytics">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
          <h2 className="text-lg font-bold">Analytics</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            This section is coming soon.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}
