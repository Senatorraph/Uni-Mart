import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { GraduationCap, Store } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Logo } from "@/components/Navbar";
import { BUSINESS_CATEGORIES, UNIVERSITY } from "@/lib/mock-data";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>) => ({
    next: typeof search.next === "string" ? search.next : "",
  }),
  head: () => ({
    meta: [
      { title: "Sign in or create an account — UniMarket" },
      { name: "description", content: "Join UniMarket as a student or campus vendor and start buying and selling on your campus." },
      { property: "og:title", content: "Sign in or create an account — UniMarket" },
      { property: "og:description", content: "Join UniMarket as a student or campus vendor." },
    ],
  }),
  component: AuthPage,
});

function Field({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      <Input {...props} className="h-11 rounded-lg border-border bg-background" />
    </div>
  );
}

function SelectField({
  label,
  options,
}: {
  label: string;
  options: string[];
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      <select className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition-colors focus:border-primary">
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

function GoogleBlock() {
  return (
    <>
      <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        or continue with
        <span className="h-px flex-1 bg-border" />
      </div>
      <Button variant="outline" className="h-11 w-full gap-3 rounded-lg border-border">
        <span className="grid h-5 w-5 place-items-center rounded-full bg-foreground text-[11px] font-black text-background">
          G
        </span>
        Continue with Google
      </Button>
    </>
  );
}

function RoleCard({
  icon: Icon,
  title,
  subtitle,
  selected,
  onSelect,
}: {
  icon: typeof GraduationCap;
  title: string;
  subtitle: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex-1 rounded-xl border p-4 text-left transition-all duration-200 ${
        selected
          ? "border-primary bg-primary/10 glow-primary"
          : "border-border bg-background hover:border-primary/40"
      }`}
    >
      <Icon className={`h-6 w-6 ${selected ? "text-primary" : "text-muted-foreground"}`} />
      <p className="mt-2 text-sm font-bold">{title}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
    </button>
  );
}

function AuthPage() {
  const [role, setRole] = useState<"student" | "vendor" | null>(null);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12">
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-primary/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-16 h-80 w-80 rounded-full bg-accent/15 blur-3xl" />

      <div className="relative w-full max-w-md">
        <div className="mb-6 text-center">
          <Link to="/" className="inline-flex items-center gap-2">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary font-extrabold text-primary-foreground glow-primary">
              U
            </span>
            <Logo className="text-xl" />
          </Link>
          <p className="mt-2 text-sm text-muted-foreground">Your campus marketplace, in one app.</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <Tabs defaultValue="signin">
            <TabsList className="grid w-full grid-cols-2 rounded-lg bg-muted">
              <TabsTrigger value="signin" className="rounded-lg">Sign In</TabsTrigger>
              <TabsTrigger value="signup" className="rounded-lg">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="mt-6 space-y-4">
              <Field label="Email" type="email" placeholder="you@student.edu.ng" />
              <Field label="Password" type="password" placeholder="••••••••" />
              <button className="text-xs font-medium text-primary hover:underline">
                Forgot password?
              </button>
              <Button asChild className="h-11 w-full rounded-lg text-sm font-bold glow-primary">
                <Link to="/">Sign In</Link>
              </Button>
              <GoogleBlock />
            </TabsContent>

            <TabsContent value="signup" className="mt-6">
              <p className="mb-3 text-xs font-medium text-muted-foreground">I want to join as</p>
              <div className="flex gap-3">
                <RoleCard
                  icon={GraduationCap}
                  title="I'm a Student"
                  subtitle="Browse and order from campus vendors"
                  selected={role === "student"}
                  onSelect={() => setRole("student")}
                />
                <RoleCard
                  icon={Store}
                  title="I'm a Vendor"
                  subtitle="Sell your products to students on campus"
                  selected={role === "vendor"}
                  onSelect={() => setRole("vendor")}
                />
              </div>

              {role && (
                <div className="mt-6 space-y-4">
                  <Field label="Full Name" placeholder="Chidi Okafor" />
                  <Field label="Email" type="email" placeholder="you@student.edu.ng" />
                  <Field label="Phone Number" placeholder="0801 234 5678" />
                  <Field label="Password" type="password" placeholder="••••••••" />
                  <SelectField label="University" options={[UNIVERSITY]} />

                  {role === "vendor" && (
                    <>
                      <Field label="Business Name" placeholder="Mama Tee's Kitchen" />
                      <SelectField label="Business Category" options={BUSINESS_CATEGORIES} />
                    </>
                  )}

                  <Button
                    asChild
                    className="h-11 w-full rounded-lg text-sm font-bold glow-primary"
                  >
                    <Link to={role === "vendor" ? "/vendor/dashboard" : "/"}>
                      {role === "vendor" ? "Submit Application" : "Create Account"}
                    </Link>
                  </Button>
                  <GoogleBlock />
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
