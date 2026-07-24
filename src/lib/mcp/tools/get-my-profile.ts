import { defineTool } from "@lovable.dev/mcp-js";

import { createUserSupabase, getProfile, jsonToolResult, toolError } from "../supabase";

export default defineTool({
  name: "get_my_profile",
  title: "Get my UniMarket profile",
  description: "Read the signed-in user's UniMarket profile, role, and university.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    try {
      const profile = await getProfile(ctx);
      let university = null;

      if (profile.university_id) {
        const { data, error } = await createUserSupabase(ctx)
          .from("universities")
          .select("id, name, short_name")
          .eq("id", profile.university_id)
          .maybeSingle();
        if (error) throw new Error(error.message);
        university = data ?? null;
      }

      return jsonToolResult("Fetched your UniMarket profile.", { profile, university });
    } catch (error) {
      return toolError(error);
    }
  },
});