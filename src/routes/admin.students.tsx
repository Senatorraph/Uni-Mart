import { createFileRoute } from "@tanstack/react-router";

import { AdminLayout } from "@/components/layouts/AdminLayout";

export const Route = createFileRoute("/admin/students")({
  head: () => ({
    meta: [
      { title: "Students — UniMarket Admin" },
      { name: "description", content: "View and manage student accounts registered on your campus." },
      { property: "og:title", content: "Students — UniMarket Admin" },
      { property: "og:description", content: "View and manage student accounts registered on your campus." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <AdminLayout title="Students">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
          <h2 className="text-lg font-bold">Students</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            This section is coming soon.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}
