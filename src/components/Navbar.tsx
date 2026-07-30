import { Link } from "@tanstack/react-router";
import { Bell, Search, ShoppingCart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/orders", label: "My Orders" },
  { to: "/profile", label: "Profile" },
] as const;

export function Logo({ className }: { className?: string }) {
  return (
    <span className={`text-lg font-extrabold tracking-tight ${className ?? ""}`}>
      Uni<span className="text-primary">Market</span>
    </span>
  );
}

export function Navbar({ cartCount = 3 }: { cartCount?: number }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-lg">
      <div className="mx-auto grid h-16 max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-3 px-4">
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary font-extrabold text-primary-foreground glow-primary">
            U
          </div>
          <Logo className="hidden sm:inline" />
        </Link>

        <div className="relative min-w-0 md:mx-6">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products on campus..."
            className="h-10 rounded-lg border-border bg-card pl-9"
          />
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <Link to="/cart" className="relative">
            <Button variant="ghost" size="icon" aria-label="Cart">
              <ShoppingCart className="h-5 w-5" />
            </Button>
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground">
                {cartCount}
              </span>
            )}
          </Link>

          <div className="relative hidden sm:block">
            <Button variant="ghost" size="icon" aria-label="Notifications">
              <Bell className="h-5 w-5" />
            </Button>
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-destructive" />
          </div>

          <Link to="/profile" aria-label="Profile" className="shrink-0">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-primary/20 text-sm font-bold text-primary ring-1 ring-primary/40">
              CO
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
              activeOptions={{ exact: l.to === "/" }}
            >
              {l.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
