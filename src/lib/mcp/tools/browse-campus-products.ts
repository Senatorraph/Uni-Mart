import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

import { clampLimit, createUserSupabase, getProfile, jsonToolResult, toolError } from "../supabase";

function textOf(value: unknown) {
  return String(value ?? "").toLowerCase();
}

export default defineTool({
  name: "browse_campus_products",
  title: "Browse campus products",
  description: "List products from the signed-in user's university marketplace feed.",
  inputSchema: {
    category: z.string().optional().describe("Optional category such as Food, Electronics, Clothing, Books, or Services."),
    search: z.string().optional().describe("Optional text to match against product or vendor names."),
    limit: z.number().optional().describe("Optional number of products to return. The app clamps this to a safe maximum."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ category, search, limit }, ctx) => {
    try {
      const profile = await getProfile(ctx);
      if (!profile.university_id) throw new Error("Your profile is not linked to a university.");

      const { data, error } = await createUserSupabase(ctx)
        .from("student_product_feed")
        .select("*")
        .eq("university_id", profile.university_id)
        .limit(clampLimit(limit, 30, 80));

      if (error) throw new Error(error.message);

      const categoryFilter = textOf(category);
      const searchFilter = textOf(search);
      const products = (data ?? []).filter((product: Record<string, unknown>) => {
        const productCategory = textOf(product.category);
        const searchable = [product.name, product.product_name, product.vendor_name, product.business_name]
          .map(textOf)
          .join(" ");
        const categoryMatches = !categoryFilter || categoryFilter === "all" || productCategory === categoryFilter;
        const searchMatches = !searchFilter || searchable.includes(searchFilter);
        return categoryMatches && searchMatches;
      });

      return jsonToolResult(`Found ${products.length} product${products.length === 1 ? "" : "s"}.`, {
        university_id: profile.university_id,
        products,
      });
    } catch (error) {
      return toolError(error);
    }
  },
});