import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Bell,
  ClipboardList,
  FileText,
  LifeBuoy,
  LogOut,
  Pencil,
  ChevronRight,
} from "lucide-react";

import { Navbar } from "@/components/Navbar";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { formatNaira } from "@/lib/format";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "My Profile — UniMarket" },
      { name: "description", content: "View your UniMarket campus profile, order stats, notifications and account settings." },
      { property: "og:title", content: "My Profile — UniMarket" },
      { property: "og:description", content: "Your campus profile, order stats and account settings." },
    ],
  }),
  component: ProfilePage,
});

const MENU = [
  { label: "My Orders", icon: ClipboardList, to: "/orders" as const },
  { label: "Notifications", icon: Bell },
  { label: "Help & Support", icon: LifeBuoy },
  { label: "Terms of Service", icon: FileText },
];

function ProfilePage() {
  return (
    <div className="min-h-screen bg-background pb-24 md:pb-0">
      <Navbar />

      <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        <section className="rounded-2xl border border-border bg-card p-6">
          <div className="flex min-w-0 flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
            <div className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-primary text-2xl font-extrabold text-primary-foreground glow-primary">
              CO
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-xl font-extrabold">Chidera Okonkwo</h1>
              <p className="truncate text-sm text-muted-foreground">chidera.okonkwo@uat.edu.ng</p>
              <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
                <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  University of Africa, Toru-Orua
                </span>
                <span className="rounded-full border border-success/30 bg-success/10 px-3 py-1 text-xs font-semibold text-success">
                  Student
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3 text-center">
            {[
              { label: "Total Orders", value: "24" },
              { label: "Total Spent", value: formatNaira(148500) },
              { label: "Member Since", value: "Mar 2025" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-border bg-background p-3">
                <p className="truncate text-sm font-extrabold sm:text-base">{s.value}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>

          <Button className="mt-6 w-full rounded-lg font-bold glow-primary sm:w-auto">
            <Pencil className="mr-2 h-4 w-4" /> Edit Profile
          </Button>
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

          <Link
            to="/auth"
            search={{ next: "" }}
            className="flex w-full items-center gap-3 px-5 py-4 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/10"
          >
            <LogOut className="h-4 w-4" /> Sign Out
          </Link>
        </section>
      </div>

      <BottomNav />
    </div>
  );
}
