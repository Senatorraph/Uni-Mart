import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Twitter } from "lucide-react";
import { Logo } from "@/components/Navbar";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border bg-card/40">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-3">
        <div>
          <Logo />
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">
            Your campus. Your market. Buy from verified vendors and get it delivered to your hostel
            in minutes.
          </p>
        </div>
        <div className="flex gap-10 text-sm">
          <div className="space-y-2">
            <p className="font-semibold">Company</p>
            <Link to="/" className="block text-muted-foreground hover:text-foreground">About</Link>
            <Link to="/" className="block text-muted-foreground hover:text-foreground">Contact</Link>
          </div>
          <div className="space-y-2">
            <p className="font-semibold">Legal</p>
            <Link to="/" className="block text-muted-foreground hover:text-foreground">Terms</Link>
            <Link to="/" className="block text-muted-foreground hover:text-foreground">Privacy</Link>
          </div>
        </div>
        <div className="flex items-start gap-3 md:justify-end">
          {[Instagram, Twitter, Facebook].map((Icon, i) => (
            <span
              key={i}
              className="grid h-10 w-10 place-items-center rounded-xl border border-border bg-card text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
            >
              <Icon className="h-4 w-4" />
            </span>
          ))}
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        © 2026 UniMarket. Built for Nigerian campuses.
      </div>
    </footer>
  );
}
