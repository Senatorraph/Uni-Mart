## What's left

Your `.env` (used in dev) and generated `types.ts` are already swapped to the external project. What still points at the old Lovable Cloud project is the **runtime secrets** — these are what server functions (`createServerFn`, webhooks, `supabaseAdmin`) read from `process.env` in production/preview builds.

Three secrets need new values:

1. **`SUPABASE_URL`** → `https://zfqibmjvtfpztcrjqojw.supabase.co`
2. **`SUPABASE_PUBLISHABLE_KEY`** → your newly rotated publishable key (the `sb_publishable_…` value)
3. **`SUPABASE_SERVICE_ROLE_KEY`** → your **newly rotated** service role key (the one you just generated — do NOT paste the old leaked one)

## How submission works

When you approve this plan, I'll call the `update_secret` tool which opens a **secure form** in the chat. You paste the three values there — they go straight to the backend secret store, never appear in chat history, and are never visible to me as plaintext.

## After secrets land

- Server functions and `supabaseAdmin` will hit your external project
- I'll do a quick sanity ping (list a public table row count) to confirm the wiring
- Then you can drop your app-build prompt and we're off

No other files change in this step.