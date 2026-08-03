import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BadgeCheck } from "lucide-react";

import { AdminLayout } from "@/components/layouts/AdminLayout";
import { EmptyState } from "@/components/EmptyState";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { AdminRoute } from "@/components/ProtectedRoute";

export const Route = createFileRoute("/admin/students")({
  head: () => ({
    meta: [
      { title: "Students — UniMarket Admin" },
      { name: "description", content: "View and manage student accounts registered on your campus." },
      { property: "og:title", content: "Students — UniMarket Admin" },
      { property: "og:description", content: "View and manage student accounts registered on your campus." },
    ],
  }),
  component: () => (
    <AdminRoute>
      <Page />
    </AdminRoute>
  ),
});

type AdminStudent = {
  id: string;
  full_name: string;
  phone: string | null;
  created_at: string;
  is_active: boolean;
  is_verified: boolean;
};

function Page() {
  const { profile } = useAuth();
  const [students, setStudents] = useState<AdminStudent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.university_id) return;

    const universityId = profile.university_id;
    let cancelled = false;

    async function fetchStudents() {
      setLoading(true);

      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, phone, created_at, is_active, is_verified")
        .eq("university_id", universityId)
        .eq("role", "student")
        .order("created_at", { ascending: false });

      if (cancelled) return;

      if (error) {
        console.error("Error fetching students:", error.message);
      } else {
        setStudents(data ?? []);
      }
      setLoading(false);
    }

    fetchStudents();
    return () => {
      cancelled = true;
    };
  }, [profile?.university_id]);

  return (
    <AdminLayout title="Students">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {loading ? (
          <LoadingSpinner label="Loading students..." />
        ) : students.length === 0 ? (
          <EmptyState title="No students yet" subtitle="Registered students will appear here." />
        ) : (
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    {["Name", "Phone", "Verified", "Member Since", "Status"].map((h) => (
                      <th key={h} className="px-5 py-3 text-left font-medium">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.id} className="border-t border-border hover:bg-muted/20">
                      <td className="px-5 py-3 font-semibold">{student.full_name}</td>
                      <td className="px-5 py-3 text-muted-foreground">{student.phone ?? "—"}</td>
                      <td className="px-5 py-3">
                        {student.is_verified ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-success/30 bg-success/15 px-2.5 py-0.5 text-[11px] font-semibold text-success">
                            <BadgeCheck className="h-3 w-3" /> Verified
                          </span>
                        ) : (
                          <span className="rounded-full border border-border bg-muted px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
                            Unverified
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {new Date(student.created_at).toLocaleDateString("en-NG", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
                            student.is_active
                              ? "border-success/30 bg-success/15 text-success"
                              : "border-destructive/30 bg-destructive/15 text-destructive"
                          }`}
                        >
                          {student.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
