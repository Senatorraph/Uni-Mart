import { Link, useNavigate } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import {
  ArrowLeft,
  Bell,
  LayoutGrid,
  LogOut,
  Menu,
  Package,
  Receipt,
  Settings,
  X,
} from "lucide-react";

import { Logo } from "@/components/Navbar";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

const ITEMS = [
  { to: "/vendor/dashboard", label: "Dashboard", icon: LayoutGrid },
  { to: "/vendor/products", label: "My Products", icon: Package },
  { to: "/vendor/orders", label: "Orders", icon: Receipt },
  { to: "/vendor/settings", label: "Store Settings", icon: Settings },
] as const;

function SidebarBody({ onNavigate }: { onNavigate?: () => void }) {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    onNavigate?.();
    navigate({ to: "/auth", search: { next: "" } });
  };

  return (
    <div className="flex h-full flex-col gap-2 p-4">
      <Link to="/vendor/dashboard" onClick={onNavigate} className="mb-4 flex items-center gap-2 px-2">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary font-extrabold text-primary-foreground glow-primary">
          U
        </div>
        <Logo />
      </Link>

      {ITEMS.map(({ to, label, icon: Icon }) => (
        <Link
          key={to}
          to={to}
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          activeProps={{ className: "bg-primary/15 text-primary font-semibold" }}
        >
          <Icon className="h-4 w-4 shrink-0" />
          <span className="truncate">{label}</span>
        </Link>
      ))}

      <div className="my-3 border-t border-border" />

      <Link
        to="/"
        onClick={onNavigate}
        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4 shrink-0" />
        Back to Marketplace
      </Link>
      <button
        onClick={handleSignOut}
        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-destructive transition-colors hover:bg-destructive/10"
      >
        <LogOut className="h-4 w-4 shrink-0" />
        Sign Out
      </button>
    </div>
  );
}

export function VendorLayout({ title, children }: { title: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [storeOpen, setStoreOpen] = useState(true);

  return (
    <div className="min-h-screen bg-background md:flex">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-border bg-[#111111] md:block">
        <SidebarBody />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col md:ml-64">
        <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
          <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label="Menu"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <h1 className="truncate text-lg font-extrabold md:text-xl">{title}</h1>
            <div className="flex shrink-0 items-center gap-3">
              <div className="hidden items-center gap-2 rounded-xl border border-border bg-card px-3 py-1.5 sm:flex">
                <span className="text-xs font-semibold">
                  {storeOpen ? "Open 🟢" : "Closed 🔴"}
                </span>
                <Switch checked={storeOpen} onCheckedChange={setStoreOpen} />
              </div>
              <div className="relative">
                <Button variant="ghost" size="icon" aria-label="Notifications">
                  <Bell className="h-5 w-5" />
                </Button>
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-destructive" />
              </div>
            </div>
          </div>
          {open && (
            <div className="border-t border-border bg-[#111111] md:hidden">
              <SidebarBody onNavigate={() => setOpen(false)} />
            </div>
          )}
        </header>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
