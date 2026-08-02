import { Link } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { Bell, ClipboardList, Home, Search, ShoppingCart, User } from "lucide-react";

import { Logo } from "@/components/Logo";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const NAV_LINKS = [
  { to: "/", label: "Home", exact: true },
  { to: "/orders", label: "My Orders", exact: false },
  { to: "/profile", label: "Profile", exact: false },
] as const;

const BOTTOM_LINKS = [
  { to: "/", label: "Home", icon: Home, exact: true },
  { to: "/", label: "Search", icon: Search, exact: true },
  { to: "/orders", label: "Orders", icon: ClipboardList, exact: false },
  { to: "/profile", label: "Profile", icon: User, exact: false },
] as const;

export function StudentLayout({ children }: { children: ReactNode }) {
  const { profile } = useAuth();
  const [cartCount, setCartCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const initials = profile?.full_name
    ? profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  useEffect(() => {
    const studentId = profile?.id;
    if (!studentId) return;

    async function fetchCartCount(id: string) {
      const { data } = await supabase.from("cart_items").select("quantity").eq("student_id", id);

      setCartCount(data ? data.reduce((sum, item) => sum + item.quantity, 0) : 0);
    }

    async function fetchUnread(id: string) {
      const { count } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", id)
        .eq("is_read", false);

      setUnreadCount(count ?? 0);
    }

    fetchCartCount(studentId);
    fetchUnread(studentId);

    const cartSub = supabase
      .channel("cart-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "cart_items",
          filter: `student_id=eq.${studentId}`,
        },
        () => fetchCartCount(studentId),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(cartSub);
    };
  }, [profile?.id]);

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="mx-auto grid h-16 max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-3 px-4">
          <Link to="/" className="flex shrink-0 items-center gap-2">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary font-extrabold text-primary-foreground glow-primary">
              U
            </div>
            <Logo className="hidden sm:inline" />
          </Link>

          <div className="relative hidden min-w-0 md:mx-6 md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search products on campus..."
              className="h-10 rounded-lg border-border bg-card pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex shrink-0 items-center gap-1 justify-self-end">
            <Link to="/cart" className="relative">
              <Button variant="ghost" size="icon" aria-label="Cart">
                <ShoppingCart className="h-5 w-5" />
              </Button>
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </Link>

            <div className="relative hidden sm:block">
              <Button variant="ghost" size="icon" aria-label="Notifications">
                <Bell className="h-5 w-5" />
              </Button>
              {unreadCount > 0 && (
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-destructive" />
              )}
            </div>

            <Link to="/profile" aria-label="Profile" className="shrink-0">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-primary/20 text-sm font-bold text-primary ring-1 ring-primary/40">
                {initials}
              </span>
            </Link>
          </div>
        </div>

        <nav className="hidden border-t border-border md:block">
          <div className="mx-auto flex max-w-7xl gap-6 px-4 py-2 text-sm">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="text-muted-foreground transition-colors hover:text-foreground"
                activeProps={{ className: "text-primary font-semibold" }}
                activeOptions={{ exact: l.exact }}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </nav>
      </header>

      {children}

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur md:hidden">
        <div className="grid grid-cols-4">
          {BOTTOM_LINKS.map(({ to, label, icon: Icon, exact }) => (
            <Link
              key={label}
              to={to}
              activeOptions={{ exact }}
              className="flex flex-col items-center gap-1 py-2.5 text-[11px] text-muted-foreground transition-colors"
              activeProps={{ className: "text-primary" }}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
