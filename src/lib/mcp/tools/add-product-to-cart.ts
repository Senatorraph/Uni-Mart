import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

import { createUserSupabase, getProfile, jsonToolResult, toolError } from "../supabase";

export default defineTool({
  name: "add_product_to_cart",
  title: "Add product to cart",
  description: "Add a product from the user's university marketplace to their cart.",
  inputSchema: {
    product_id: z.string().uuid().describe("The product id to add."),
    quantity: z.number().optional().describe("Optional quantity. The app clamps this to a safe positive integer."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
  handler: async ({ product_id, quantity }, ctx) => {
    try {
      const userId = ctx.getUserId();
      if (!userId) throw new Error("Could not identify the signed-in UniMarket user.");

      const profile = await getProfile(ctx);
      if (!profile.university_id) throw new Error("Your profile is not linked to a university.");

      const supabase = createUserSupabase(ctx);
      const { data: product, error: productError } = await supabase
        .from("products")
        .select("id, university_id, name, stock")
        .eq("id", product_id)
        .maybeSingle();
      if (productError) throw new Error(productError.message);
      if (!product) throw new Error("Product not found.");
      if (product.university_id !== profile.university_id) throw new Error("That product is not in your university marketplace.");

      const safeQuantity = Math.max(1, Math.min(Math.floor(Number(quantity) || 1), 99));
      const { data, error } = await supabase
        .from("cart_items")
        .insert({ user_id: userId, product_id, quantity: safeQuantity, university_id: profile.university_id })
        .select("id, product_id, quantity, university_id")
        .maybeSingle();

      if (error) throw new Error(error.message);
      return jsonToolResult(`Added ${safeQuantity} × ${product.name ?? "product"} to your cart.`, { cart_item: data });
    } catch (error) {
      return toolError(error);
    }
  },
});