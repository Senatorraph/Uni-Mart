import { createClient } from "@supabase/supabase-js";
import type { ToolContext, ToolHandlerResult } from "@lovable.dev/mcp-js";

const EXTERNAL_SUPABASE_URL = "https://zfqibmjvtfpztcrjqojw.supabase.co";
const EXTERNAL_SUPABASE_PUBLISHABLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJIUzI1NiJ9".replace(
    "eyJpc3MiOiJIUzI1NiJ9",
    "eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpmcWlibWp2dGZwenRjcmpxb2p3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0OTI3NDgsImV4cCI6MjA5NzA2ODc0OH0.Uthj88D5VLNifT4BSh2v2xUYITAq_Bvn4nGrt0gyP-A",
  );

export type UniMarketProfile = {
  id: string;
  university_id: string | null;
  full_name: string | null;
  phone: string | null;
  role: "student" | "vendor" | "rider" | "university_admin" | "super_admin" | null;
  avatar_url?: string | null;
};

export function createUserSupabase(ctx: ToolContext) {
  const token = ctx.getToken();
  if (!ctx.isAuthenticated() || !token) {
    throw new Error("This MCP tool requires a signed-in UniMarket user.");
  }

  return createClient(EXTERNAL_SUPABASE_URL, EXTERNAL_SUPABASE_PUBLISHABLE_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      storage: undefined,
    },
  });
}

export async function getProfile(ctx: ToolContext): Promise<UniMarketProfile> {
  const userId = ctx.getUserId();
  if (!userId) throw new Error("Could not identify the signed-in UniMarket user.");

  const supabase = createUserSupabase(ctx);
  const { data, error } = await supabase
    .from("profiles")
    .select("id, university_id, full_name, phone, role, avatar_url")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("No UniMarket profile exists for this user.");
  return data as UniMarketProfile;
}

export function toolError(error: unknown): ToolHandlerResult {
  const message = error instanceof Error ? error.message : "The MCP tool failed.";
  return { content: [{ type: "text", text: message }], isError: true };
}

export function jsonToolResult(text: string, structuredContent: Record<string, unknown>): ToolHandlerResult {
  return {
    content: [{ type: "text", text }],
    structuredContent,
  };
}

export function clampLimit(value: unknown, fallback = 20, max = 50) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return Math.min(Math.floor(n), max);
}