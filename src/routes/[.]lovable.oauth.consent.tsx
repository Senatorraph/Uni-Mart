import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldCheck } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

type OAuthResponse = Promise<{ data: any; error: { message: string } | null }>;
type SupabaseOAuthApi = {
  getAuthorizationDetails: (authorizationId: string) => OAuthResponse;
  approveAuthorization: (authorizationId: string) => OAuthResponse;
  denyAuthorization: (authorizationId: string) => OAuthResponse;
};

function oauthApi() {
  const api = (supabase.auth as any).oauth as SupabaseOAuthApi | undefined;
  if (!api) throw new Error("OAuth authorization is not enabled for this auth project yet.");
  return api;
}

function targetFrom(data: any) {
  return data?.redirect_url ?? data?.redirect_to ?? "";
}

export const Route = createFileRoute("/.lovable/oauth/consent")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>) => ({
    authorization_id: typeof search.authorization_id === "string" ? search.authorization_id : "",
  }),
  head: () => ({
    meta: [
      { title: "Authorize app connection — UniMarket" },
      { name: "description", content: "Approve an OAuth app connection to your UniMarket account." },
      { property: "og:title", content: "Authorize app connection — UniMarket" },
      { property: "og:description", content: "Approve an OAuth app connection to your UniMarket account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  beforeLoad: async ({ search, location }) => {
    if (!search.authorization_id) throw new Error("Missing authorization_id");
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      const next = `${location.pathname}${location.searchStr}`;
      throw redirect({ to: "/auth", search: { next } });
    }
  },
  loader: async ({ location }) => {
    const authorizationId = new URLSearchParams(location.searchStr).get("authorization_id") ?? "";
    const { data, error } = await oauthApi().getAuthorizationDetails(authorizationId);
    if (error) throw new Error(error.message);
    const immediate = targetFrom(data);
    if (immediate && !data?.client) throw redirect({ href: immediate });
    return data;
  },
  component: ConsentPage,
  errorComponent: ({ error }) => (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <section className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl">
        <h1 className="text-xl font-semibold text-foreground">Could not load this connection</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {String((error as Error)?.message ?? error)}
        </p>
      </section>
    </main>
  ),
});

function ConsentPage() {
  const details = Route.useLoaderData();
  const { authorization_id } = Route.useSearch();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clientName = details?.client?.name ?? details?.client_name ?? "this app";
  const redirectUri =
    details?.client?.redirect_uri ??
    details?.client?.redirect_uris?.[0] ??
    details?.redirect_uri ??
    "the requesting app";
  const scopes = String(details?.scope ?? details?.scopes ?? "openid email profile")
    .split(/\s+/)
    .filter(Boolean);

  async function decide(approve: boolean) {
    setBusy(true);
    setError(null);
    const { data, error } = approve
      ? await oauthApi().approveAuthorization(authorization_id)
      : await oauthApi().denyAuthorization(authorization_id);

    if (error) {
      setBusy(false);
      setError(error.message);
      return;
    }

    const target = targetFrom(data);
    if (!target) {
      setBusy(false);
      setError("No redirect was returned by the authorization server.");
      return;
    }
    window.location.href = target;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <section className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-xl">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Connect {clientName} to UniMarket</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {clientName} will be able to call UniMarket's enabled tools while acting as your signed-in account.
        </p>

        <div className="mt-5 space-y-3 rounded-xl border border-border bg-background p-4 text-sm">
          <div>
            <p className="text-xs uppercase text-muted-foreground">Client redirect</p>
            <p className="break-all text-foreground">{redirectUri}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-muted-foreground">Identity access</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {scopes.map((scope) => (
                <span key={scope} className="rounded-full border border-border bg-card px-2 py-1 text-xs text-muted-foreground">
                  {scope === "openid" ? "Basic profile" : scope === "email" ? "Email address" : scope}
                </span>
              ))}
            </div>
          </div>
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          This does not bypass UniMarket permissions or backend policies.
        </p>

        {error && <p role="alert" className="mt-4 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}

        <div className="mt-6 flex gap-3">
          <Button className="flex-1" disabled={busy} onClick={() => decide(true)}>
            Approve
          </Button>
          <Button className="flex-1" variant="secondary" disabled={busy} onClick={() => decide(false)}>
            Cancel connection
          </Button>
        </div>
      </section>
    </main>
  );
}