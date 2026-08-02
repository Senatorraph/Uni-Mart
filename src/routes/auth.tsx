import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { GraduationCap, Loader2, Store } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AuthLayout } from "@/components/layouts/AuthLayout";
import { BUSINESS_CATEGORIES } from "@/lib/mock-data";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { roleHome } from "@/components/ProtectedRoute";
import type { University } from "@/types";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>) => ({
    next: typeof search.next === "string" ? search.next : "",
  }),
  head: () => ({
    meta: [
      { title: "Sign in or create an account — UniMarket" },
      {
        name: "description",
        content:
          "Join UniMarket as a student or campus vendor and start buying and selling on your campus.",
      },
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
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition-colors focus:border-primary"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
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
      <Button
        variant="outline"
        className="h-11 w-full gap-3 rounded-lg border-border"
        type="button"
      >
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
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");
  const [role, setRole] = useState<"student" | "vendor" | null>(null);
  const [universities, setUniversities] = useState<
    Pick<University, "id" | "name" | "short_name">[]
  >([]);

  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");

  const [fullName, setFullName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [universityId, setUniversityId] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessCategory, setBusinessCategory] = useState(BUSINESS_CATEGORIES[0]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user && profile) {
      navigate({ to: roleHome[profile.role] as any });
    }
  }, [user, profile, authLoading]);

  useEffect(() => {
    async function loadUniversities() {
      const { data } = await supabase
        .from("universities")
        .select("id, name, short_name")
        .eq("is_active", true)
        .order("name");

      if (data) {
        setUniversities(data);
        if (data.length > 0) setUniversityId(data[0].id);
      }
    }
    loadUniversities();
  }, []);

  async function handleSignUp() {
    if (!role) return;

    try {
      setLoading(true);
      setError(null);

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: signUpEmail,
        password: signUpPassword,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Signup failed");

      const { error: profileError } = await supabase.from("profiles").insert({
        id: authData.user.id,
        university_id: universityId,
        full_name: fullName,
        phone,
        role,
      });

      if (profileError) throw profileError;

      if (role === "vendor" && businessName) {
        const { error: vendorError } = await supabase.from("vendors").insert({
          user_id: authData.user.id,
          university_id: universityId,
          business_name: businessName,
          category: businessCategory || "Other",
          status: "pending",
        });

        if (vendorError) throw vendorError;
      }

      setSuccessMessage(
        role === "vendor"
          ? "Application submitted! You will be notified once your store is approved."
          : "Account created! You can now sign in.",
      );
      setActiveTab("signin");
    } catch (err: any) {
      if (err.message?.includes("already registered")) {
        setError("An account with this email already exists.");
      } else {
        setError(err.message || "Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSignIn() {
    try {
      setLoading(true);
      setError(null);

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: signInEmail,
        password: signInPassword,
      });

      if (signInError) throw signInError;

      const { data: signedInProfile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      if (profileError || !signedInProfile) throw new Error("Could not load your profile.");

      navigate({ to: (roleHome[signedInProfile.role as keyof typeof roleHome] ?? "/") as any });
    } catch (err: any) {
      if (err.message?.includes("Invalid login credentials")) {
        setError("Incorrect email or password.");
      } else if (err.message?.includes("Email not confirmed")) {
        setError("Please confirm your email before signing in.");
      } else {
        setError(err.message || "Sign in failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <div className="rounded-xl border border-border bg-card p-6">
        {error && (
          <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="mb-4 rounded-lg border border-success/30 bg-success/10 px-4 py-2.5 text-sm text-success">
            {successMessage}
          </div>
        )}

        <Tabs
          value={activeTab}
          onValueChange={(v) => {
            setActiveTab(v as "signin" | "signup");
            setError(null);
            setSuccessMessage(null);
          }}
        >
          <TabsList className="grid w-full grid-cols-2 rounded-lg bg-muted">
            <TabsTrigger value="signin" className="rounded-lg">
              Sign In
            </TabsTrigger>
            <TabsTrigger value="signup" className="rounded-lg">
              Sign Up
            </TabsTrigger>
          </TabsList>

          <TabsContent value="signin" className="mt-6 space-y-4">
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                handleSignIn();
              }}
            >
              <Field
                label="Email"
                type="email"
                placeholder="you@student.edu.ng"
                value={signInEmail}
                onChange={(e) => setSignInEmail(e.target.value)}
                required
              />
              <Field
                label="Password"
                type="password"
                placeholder="••••••••"
                value={signInPassword}
                onChange={(e) => setSignInPassword(e.target.value)}
                required
              />
              <button type="button" className="text-xs font-medium text-primary hover:underline">
                Forgot password?
              </button>
              <Button
                type="submit"
                disabled={loading}
                className="h-11 w-full rounded-lg text-sm font-bold glow-primary"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign In
              </Button>
            </form>
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
              <form
                className="mt-6 space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSignUp();
                }}
              >
                <Field
                  label="Full Name"
                  placeholder="Chidi Okafor"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
                <Field
                  label="Email"
                  type="email"
                  placeholder="you@student.edu.ng"
                  value={signUpEmail}
                  onChange={(e) => setSignUpEmail(e.target.value)}
                  required
                />
                <Field
                  label="Phone Number"
                  placeholder="0801 234 5678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
                <Field
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  value={signUpPassword}
                  onChange={(e) => setSignUpPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <SelectField
                  label="University"
                  value={universityId}
                  onChange={setUniversityId}
                  options={universities.map((u) => ({ value: u.id, label: u.name }))}
                />

                {role === "vendor" && (
                  <>
                    <Field
                      label="Business Name"
                      placeholder="Mama Tee's Kitchen"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      required
                    />
                    <SelectField
                      label="Business Category"
                      value={businessCategory}
                      onChange={setBusinessCategory}
                      options={BUSINESS_CATEGORIES.map((c) => ({ value: c, label: c }))}
                    />
                  </>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="h-11 w-full rounded-lg text-sm font-bold glow-primary"
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {role === "vendor" ? "Submit Application" : "Create Account"}
                </Button>
                <GoogleBlock />
              </form>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AuthLayout>
  );
}
