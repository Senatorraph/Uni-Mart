import { Link, useNavigate } from "@tanstack/react-router";
import { type ReactNode } from "react";
import { Bell } from "lucide-react";

import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";

export type RiderTab = "available" | "active" | "completed";

const TABS: { key: RiderTab; label: string }[] = [
  { key: "available", label: "Available Jobs" },
  { key: "active", label: "Active Delivery" },
  { key: "completed", label: "Completed" },
];

export function RiderLayout({
  activeTab,
  onTabChange,
  children,
}: {
  activeTab: RiderTab;
  onTabChange: (tab: RiderTab) => void;
  children: ReactNode;
}) {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/auth", search: { next: "" } });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto grid max-w-5xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3">
          <div className="flex min-w-0 items-center gap-2">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary font-extrabold text-primary-foreground glow-primary">
              U
            </div>
            <Logo className="truncate" />
            <span className="shrink-0 rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-accent">
              Rider
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <div className="relative">
              <Button variant="ghost" size="icon" aria-label="Notifications">
                <Bell className="h-5 w-5" />
              </Button>
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-destructive" />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  aria-label="Account"
                  className="h-9 w-9 shrink-0 rounded-full bg-primary/20 text-sm font-bold text-primary ring-1 ring-primary/40"
                >
                  TA
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem asChild>
                  <Link to="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={handleSignOut} className="text-destructive">
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="mx-auto flex max-w-5xl gap-2 overflow-x-auto px-4 pb-3 no-scrollbar">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => onTabChange(t.key)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all ${
                activeTab === t.key
                  ? "bg-primary text-primary-foreground glow-primary"
                  : "border border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}
