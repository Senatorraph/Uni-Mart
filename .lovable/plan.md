## Goal

Point the app at your external Supabase project (`zfqibmjvtfpztcrjqojw.supabase.co`) instead of the Lovable Cloud–managed one, so we develop against your existing schema.

## Steps

1. **Update env vars** in `.env` with your project's values:
   - `VITE_SUPABASE_URL` / `SUPABASE_URL` → `https://zfqibmjvtfpztcrjqojw.supabase.co`
   - `VITE_SUPABASE_PUBLISHABLE_KEY` / `SUPABASE_PUBLISHABLE_KEY` → your anon key
   - `VITE_SUPABASE_PROJECT_ID` / `SUPABASE_PROJECT_ID` → `zfqibmjvtfpztcrjqojw`

2. **Request your service role key** via a secure secret form (you'll paste it into the Lovable form — never in chat). It becomes `SUPABASE_SERVICE_ROLE_KEY` server-side and powers `supabaseAdmin` for any admin/RLS-bypass operations.

3. **Regenerate `src/integrations/supabase/types.ts`** from your project's schema so the typed client knows about your tables/enums. I'll introspect your `public` schema via your anon key + service role key and write the types file.

4. **Quick sanity check**: hit your project to list tables and confirm auth/RLS posture, then summarize what's there so we have a shared picture before you drop your prompt.

5. **Leave `supabase/config.toml` and auth UI integration alone** for now — those are Lovable Cloud–specific. We'll just be using the JS client + your project's own auth settings (which you manage on your Supabase dashboard).

## Things to know

- The managed `auth-attacher`, `auth-middleware`, and `client.server.ts` files keep working as-is — they read whatever URL/keys are in env. No code changes needed there.
- Anything currently using `supabaseAdmin` will only work once your service role key secret is in place.
- Auth providers (Google, email confirmation, etc.) are configured on **your** Supabase dashboard, not from here — I can't toggle them for an external project.
- If you later want to switch back to Lovable Cloud, we'd restore the original env values.

## Technical details

- Files touched: `.env` only (plus a regenerated `src/integrations/supabase/types.ts`).
- Secret added: `SUPABASE_SERVICE_ROLE_KEY` (via secure form).
- No migrations run on your DB — read-only introspection only.
- After step 1 the dev server picks up the new env on restart; the `supabase` client proxy re-instantiates with the new URL/key.

## After this plan

You drop your prompt for what to build, and we go from there against your real schema.
