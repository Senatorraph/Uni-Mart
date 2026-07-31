import { createFileRoute } from "@tanstack/react-router";

import { AdminLayout } from "@/components/layouts/AdminLayout";
import { AdminRoute } from "@/components/ProtectedRoute";

export const Route = createFileRoute("/admin/vendors")({
  head: () => ({
    meta: [
      { title: "Vendors — UniMarket Admin" },
      { name: "description", content: "Review and manage every vendor operating on your campus marketplace." },
      { property: "og:title", content: "Vendors — UniMarket Admin" },
      { property: "og:description", content: "Review and manage every vendor operating on your campus marketplace." },
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
    <AdminLayout title="Vendors">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
          <h2 className="text-lg font-bold">Vendors</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            This section is coming soon.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}
