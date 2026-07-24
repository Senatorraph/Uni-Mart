import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

import { createUserSupabase, getProfile, jsonToolResult, toolError } from "../supabase";

export default defineTool({
  name: "set_vendor_open",
  title: "Set vendor store open status",
  description: "Open or close the signed-in vendor's UniMarket store.",
  inputSchema: {
    is_open: z.boolean().describe("True to open the store; false to close it."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  handler: async ({ is_open }, ctx) => {
    try {
      const profile = await getProfile(ctx);
      if (profile.role !== "vendor" && profile.role !== "super_admin") {
        throw new Error("Only vendor accounts can update store status.");
      }

      const userId = ctx.getUserId();
      if (!userId) throw new Error("Could not identify the signed-in UniMarket user.");

      const { data, error } = await createUserSupabase(ctx)
        .from("vendors")
        .update({ is_open })
        .eq("user_id", userId)
        .select("id, business_name, is_open, status")
        .maybeSingle();

      if (error) throw new Error(error.message);
      if (!data) throw new Error("No vendor store is linked to this account.");
      return jsonToolResult(is_open ? "Your store is now open." : "Your store is now closed.", { vendor: data });
    } catch (error) {
      return toolError(error);
    }
  },
});