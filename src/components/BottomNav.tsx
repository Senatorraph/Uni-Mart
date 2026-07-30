import { Link } from "@tanstack/react-router";
import { Home, Search, ClipboardList, User } from "lucide-react";

const ITEMS = [
  { to: "/", label: "Home", icon: Home, exact: true },
  { to: "/cart", label: "Search", icon: Search, exact: false },
  { to: "/orders", label: "Orders", icon: ClipboardList, exact: false },
  { to: "/profile", label: "Profile", icon: User, exact: false },
] as const;

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur md:hidden">
      <div className="grid grid-cols-4">
        {ITEMS.map(({ to, label, icon: Icon, exact }) => (
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
  );
}
