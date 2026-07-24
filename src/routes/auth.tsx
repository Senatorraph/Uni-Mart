import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { GraduationCap, Store } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useAuth, roleHome, type Profile } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoadingSpinner } from "@/components/LoadingSpinner";

export const Route = createFileRoute("/auth")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>) => ({
    next: typeof search.next === "string" && search.next.startsWith("/") && !search.next.startsWith("//") ? search.next : "",
  }),
  head: () => ({
    meta: [
      { title: "Sign in — UniMarket" },
      { name: "description", content: "Sign in or create your UniMarket account." },
    ],
  }),
  component: AuthPage,
});

type University = { id: string; name: string };
type SignupRole = "student" | "vendor";

const VENDOR_CATEGORIES = [
  "Food & Drinks",
  "Electronics",
  "Clothing & Fashion",
  "Books & Stationery",
  "Beauty & Personal Care",
  "Services & Repairs",
  "Other",
] as const;

const signUpSchema = z.object({
  full_name: z.string().trim().min(2, "Enter your full name").max(80),
  email: z.string().trim().email("Enter a valid email").max(255),
  phone: z.string().trim().min(7, "Enter a valid phone number").max(20),
  password: z.string().min(6, "Password must be at least 6 characters").max(72),
  university_id: z.string().uuid("Select your university"),
});

const vendorExtraSchema = z.object({
  business_name: z.string().trim().min(2, "Enter your business name").max(100),
  category: z.string().min(1, "Select a business category"),
});

function AuthPage() {
  const navigate = useNavigate();
  const { next } = Route.useSearch();
  const { session, profile, loading } = useAuth();
  const [universities, setUniversities] = useState<University[]>([]);
  const [uniLoading, setUniLoading] = useState(true);

  useEffect(() => {
    (supabase as any)
      .from("universities")
      .select("id, name")
      .eq("is_active", true)
      .order("name")
      .then(({ data, error }: any) => {
        if (error) toast.error("Could not load universities");
        setUniversities(data ?? []);
        setUniLoading(false);
      });
  }, []);

  useEffect(() => {
    if (loading || !session) return;
    if (next) {
      navigate({ href: next, replace: true });
      return;
    }
    // Wait briefly for profile to load; if none exists, default to student home.
    if (profile !== null) {
      navigate({ to: roleHome(profile.role), replace: true });
    } else {
      const t = setTimeout(() => navigate({ to: "/", replace: true }), 400);
      return () => clearTimeout(t);
    }
  }, [loading, session, profile, navigate, next]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground text-xl font-bold">
            U
          </div>
          <h1 className="text-2xl font-bold">
            Uni<span className="text-primary">Market</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your Campus. Your Market.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-xl">
          <Tabs defaultValue="signin">
            <TabsList className="grid w-full grid-cols-2 bg-muted">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="signin" className="mt-6">
              <SignInForm next={next} />
            </TabsContent>
            <TabsContent value="signup" className="mt-6">
              {uniLoading ? (
                <LoadingSpinner label="Loading universities..." />
              ) : (
                <SignUpForm universities={universities} next={next} />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function SignInForm({ next }: { next: string }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setSubmitting(false);
      toast.error(error.message);
      return;
    }
    const userId = data.session?.user.id;
    let role: Profile["role"] = "student";
    if (userId) {
      const { data: profile } = await (supabase as any)
        .from("profiles")
        .select("role, university_id, full_name")
        .eq("id", userId)
        .maybeSingle();
      if (profile?.role) role = profile.role;
    }
    setSubmitting(false);
    toast.success("Welcome back!");
    if (next) {
      navigate({ href: next, replace: true });
      return;
    }
    navigate({ to: roleHome(role), replace: true });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="signin-email">Email</Label>
        <Input
          id="signin-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@school.edu.ng"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signin-password">Password</Label>
        <Input
          id="signin-password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />
      </div>
      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? "Signing in..." : "Sign In"}
      </Button>
    </form>
  );
}

function SignUpForm({ universities, next }: { universities: University[]; next: string }) {
  const [role, setRole] = useState<SignupRole | null>(null);
  const [values, setValues] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    university_id: "",
    business_name: "",
    category: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const set = (k: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setValues((v) => ({ ...v, [k]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) {
      toast.error("Please select who you are");
      return;
    }
    const parsed = signUpSchema.safeParse(values);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    if (role === "vendor") {
      const v = vendorExtraSchema.safeParse(values);
      if (!v.success) {
        toast.error(v.error.issues[0].message);
        return;
      }
    }
    setSubmitting(true);
    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        emailRedirectTo: next ? `${window.location.origin}${next}` : window.location.origin,
        data: {
          full_name: values.full_name,
          phone: values.phone,
          university_id: values.university_id,
          role,
        },
      },
    });
    if (error) {
      setSubmitting(false);
      toast.error(error.message);
      return;
    }
    const userId = data.user?.id;
    if (userId) {
      const { error: pErr } = await (supabase as any).from("profiles").upsert(
        {
          id: userId,
          full_name: values.full_name,
          phone: values.phone,
          university_id: values.university_id,
          role,
        },
        { onConflict: "id" },
      );
      if (pErr) console.error(pErr);

      if (role === "vendor") {
        const { error: vErr } = await (supabase as any).from("vendors").insert({
          user_id: userId,
          university_id: values.university_id,
          business_name: values.business_name,
          category: values.category,
          status: "pending",
        });
        if (vErr) console.error(vErr);
      }
    }
    setSubmitting(false);
    if (role === "vendor") {
      toast.success("Application submitted! You will be notified once your store is approved.");
    } else {
      toast.success("Welcome to UniMarket! You can now sign in.");
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <RoleCard
          selected={role === "student"}
          onClick={() => setRole("student")}
          icon={<GraduationCap className="h-6 w-6" />}
          title="I'm a Student"
          subtitle="Browse and order from campus vendors"
        />
        <RoleCard
          selected={role === "vendor"}
          onClick={() => setRole("vendor")}
          icon={<Store className="h-6 w-6" />}
          title="I'm a Vendor"
          subtitle="Sell your products to students on campus"
        />
      </div>

      {role && (
        <>
          <div className="space-y-2">
            <Label htmlFor="su-name">Full Name</Label>
            <Input id="su-name" required value={values.full_name} onChange={set("full_name")} placeholder="Chioma Okafor" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="su-email">Email</Label>
            <Input id="su-email" type="email" required value={values.email} onChange={set("email")} placeholder="you@school.edu.ng" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="su-phone">Phone Number</Label>
            <Input id="su-phone" type="tel" required value={values.phone} onChange={set("phone")} placeholder="+234 800 000 0000" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="su-password">Password</Label>
            <Input id="su-password" type="password" required value={values.password} onChange={set("password")} placeholder="At least 6 characters" />
          </div>
          <div className="space-y-2">
            <Label>University</Label>
            <Select
              value={values.university_id}
              onValueChange={(v) => setValues((s) => ({ ...s, university_id: v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your university" />
              </SelectTrigger>
              <SelectContent>
                {universities.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {role === "vendor" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="su-business">Business Name</Label>
                <Input
                  id="su-business"
                  required
                  value={values.business_name}
                  onChange={set("business_name")}
                  placeholder="Chioma's Kitchen"
                />
              </div>
              <div className="space-y-2">
                <Label>Business Category</Label>
                <Select
                  value={values.category}
                  onValueChange={(v) => setValues((s) => ({ ...s, category: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {VENDOR_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting
              ? "Submitting..."
              : role === "vendor"
                ? "Submit Vendor Application"
                : "Create Account"}
          </Button>
        </>
      )}
    </form>
  );
}

function RoleCard({
  selected,
  onClick,
  icon,
  title,
  subtitle,
}: {
  selected: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-start gap-2 rounded-xl border-2 p-4 text-left transition ${
        selected
          ? "border-[#6C3FC5] bg-[#6C3FC5]/10"
          : "border-border bg-card hover:border-muted-foreground/40"
      }`}
    >
      <div className={selected ? "text-[#6C3FC5]" : "text-muted-foreground"}>{icon}</div>
      <div className="text-sm font-semibold">{title}</div>
      <div className="text-xs text-muted-foreground">{subtitle}</div>
    </button>
  );
}
