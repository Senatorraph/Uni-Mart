import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

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
  head: () => ({
    meta: [
      { title: "Sign in — UniMarket" },
      { name: "description", content: "Sign in or create your UniMarket account." },
    ],
  }),
  component: AuthPage,
});

type University = { id: string; name: string };

const signUpSchema = z.object({
  full_name: z.string().trim().min(2, "Enter your full name").max(80),
  email: z.string().trim().email("Enter a valid email").max(255),
  phone: z.string().trim().min(7, "Enter a valid phone number").max(20),
  password: z.string().min(6, "Password must be at least 6 characters").max(72),
  university_id: z.string().uuid("Select your university"),
});

function AuthPage() {
  const navigate = useNavigate();
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
    // Wait briefly for profile to load; if none exists, default to student home.
    if (profile !== null) {
      navigate({ to: roleHome(profile.role), replace: true });
    } else {
      const t = setTimeout(() => navigate({ to: "/", replace: true }), 400);
      return () => clearTimeout(t);
    }
  }, [loading, session, profile, navigate]);

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
              <SignInForm />
            </TabsContent>
            <TabsContent value="signup" className="mt-6">
              {uniLoading ? (
                <LoadingSpinner label="Loading universities..." />
              ) : (
                <SignUpForm universities={universities} />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function SignInForm() {
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

function SignUpForm({ universities }: { universities: University[] }) {
  const [values, setValues] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    university_id: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const set = (k: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setValues((v) => ({ ...v, [k]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = signUpSchema.safeParse(values);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setSubmitting(true);
    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          full_name: values.full_name,
          phone: values.phone,
          university_id: values.university_id,
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
          role: "student",
        },
        { onConflict: "id" },
      );
      if (pErr) console.error(pErr);
    }
    setSubmitting(false);
    toast.success("Account created — check your email if confirmation is required.");
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
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
      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? "Creating account..." : "Create Account"}
      </Button>
    </form>
  );
}
