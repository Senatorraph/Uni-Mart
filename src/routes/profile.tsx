import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Bell,
  ClipboardList,
  FileText,
  LifeBuoy,
  LogOut,
  Pencil,
  ChevronRight,
} from "lucide-react";

import { StudentLayout } from "@/components/layouts/StudentLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatNaira } from "@/lib/format";
import { StudentRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "My Profile — UniMarket" },
      {
        name: "description",
        content:
          "View your UniMarket campus profile, order stats, notifications and account settings.",
      },
      { property: "og:title", content: "My Profile — UniMarket" },
      {
        property: "og:description",
        content: "Your campus profile, order stats and account settings.",
      },
    ],
  }),
  component: () => (
    <StudentRoute>
      <ProfilePage />
    </StudentRoute>
  ),
});

const MENU = [
  { label: "My Orders", icon: ClipboardList, to: "/orders" as const },
  { label: "Notifications", icon: Bell },
  { label: "Help & Support", icon: LifeBuoy },
  { label: "Terms of Service", icon: FileText },
];

function ProfilePage() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const [universityName, setUniversityName] = useState("");
  const [stats, setStats] = useState({ totalOrders: 0, totalSpent: 0 });
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({ full_name: "", phone: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setEditData({
        full_name: profile.full_name || "",
        phone: profile.phone || "",
      });
    }
  }, [profile]);

  useEffect(() => {
    if (!profile?.university_id) return;

    supabase
      .from("universities")
      .select("name")
      .eq("id", profile.university_id)
      .single()
      .then(({ data }) => {
        if (data) setUniversityName(data.name);
      });
  }, [profile?.university_id]);

  useEffect(() => {
    if (!user?.id) return;

    supabase
      .from("orders")
      .select("total_amount, status")
      .eq("student_id", user.id)
      .then(({ data }) => {
        if (data) {
          setStats({
            totalOrders: data.length,
            totalSpent: data.reduce((sum, o) => sum + Number(o.total_amount), 0),
          });
        }
      });
  }, [user?.id]);

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/auth", search: { next: "" } });
  };

  async function saveProfile() {
    if (!profile?.id) return;
    setSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: editData.full_name.trim(),
        phone: editData.phone.trim(),
      })
      .eq("id", profile.id);

    if (error) {
      console.error("Failed to update profile:", error.message);
    } else {
      setEditing(false);
      window.location.reload();
    }

    setSaving(false);
  }

  const initials = profile?.full_name
    ? profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-NG", {
        month: "short",
        year: "numeric",
      })
    : "";

  return (
    <StudentLayout>
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        <section className="rounded-2xl border border-border bg-card p-6">
          <div className="flex min-w-0 flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
            <div className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-primary text-2xl font-extrabold text-primary-foreground glow-primary">
              {initials}
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-xl font-extrabold">{profile?.full_name || "—"}</h1>
              <p className="truncate text-sm text-muted-foreground">{user?.email}</p>
              <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
                <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  {universityName || "—"}
                </span>
                <span className="rounded-full border border-success/30 bg-success/10 px-3 py-1 text-xs font-semibold text-success capitalize">
                  {profile?.role?.replace("_", " ") || "—"}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3 text-center">
            {[
              { label: "Total Orders", value: String(stats.totalOrders) },
              { label: "Total Spent", value: formatNaira(stats.totalSpent) },
              { label: "Member Since", value: memberSince || "—" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-border bg-background p-3">
                <p className="truncate text-sm font-extrabold sm:text-base">{s.value}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>

          {editing ? (
            <div className="mt-6 space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={editData.full_name}
                  onChange={(e) => setEditData((p) => ({ ...p, full_name: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={editData.phone}
                  onChange={(e) => setEditData((p) => ({ ...p, phone: e.target.value }))}
                  placeholder="+234 800 000 0000"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 rounded-lg font-bold"
                  onClick={() => setEditing(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 rounded-lg font-bold glow-primary"
                  disabled={saving || !editData.full_name.trim()}
                  onClick={saveProfile}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          ) : (
            <Button
              className="mt-6 w-full rounded-lg font-bold glow-primary sm:w-auto"
              onClick={() => setEditing(true)}
            >
              <Pencil className="mr-2 h-4 w-4" /> Edit Profile
            </Button>
          )}
        </section>

        <section className="overflow-hidden rounded-2xl border border-border bg-card">
          {MENU.map(({ label, icon: Icon, to }) => {
            const inner = (
              <>
                <span className="flex min-w-0 items-center gap-3">
                  <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="truncate text-sm">{label}</span>
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </>
            );
            const cls =
              "flex w-full items-center justify-between border-b border-border px-5 py-4 text-left transition-colors hover:bg-muted/40";
            return to ? (
              <Link key={label} to={to} className={cls}>
                {inner}
              </Link>
            ) : (
              <button key={label} className={cls}>
                {inner}
              </button>
            );
          })}

          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 px-5 py-4 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/10"
          >
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </section>
      </div>
    </StudentLayout>
  );
}
