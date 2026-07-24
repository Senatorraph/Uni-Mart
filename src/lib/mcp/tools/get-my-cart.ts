import { defineTool } from "@lovable.dev/mcp-js";

import { createUserSupabase, jsonToolResult, toolError } from "../supabase";

export default defineTool({
  name: "get_my_cart",
  title: "Get my cart",
  description: "Read the signed-in user's UniMarket cart items with product and vendor details.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    try {
      const userId = ctx.getUserId();
      if (!userId) throw new Error("Could not identify the signed-in UniMarket user.");

      const supabase = createUserSupabase(ctx);
      const { data: cartRows, error: cartError } = await supabase
        .from("cart_items")
        .select("id, product_id, quantity, university_id, created_at")
        .eq("user_id", userId);

      if (cartError) throw new Error(cartError.message);

      const productIds = [...new Set((cartRows ?? []).map((row: Record<string, unknown>) => String(row.product_id)).filter(Boolean))];
      const productsById = new Map<string, Record<string, unknown>>();
      const vendorsById = new Map<string, Record<string, unknown>>();

      if (productIds.length > 0) {
        const { data: products, error: productsError } = await supabase
          .from("products")
          .select("id, name, price, image_url, images, vendor_id")
          .in("id", productIds);
        if (productsError) throw new Error(productsError.message);

        for (const product of products ?? []) productsById.set(String(product.id), product as Record<string, unknown>);

        const vendorIds = [...new Set((products ?? []).map((product: Record<string, unknown>) => String(product.vendor_id)).filter(Boolean))];
        if (vendorIds.length > 0) {
          const { data: vendors, error: vendorsError } = await supabase
            .from("vendors")
            .select("id, business_name, rating")
            .in("id", vendorIds);
          if (vendorsError) throw new Error(vendorsError.message);
          for (const vendor of vendors ?? []) vendorsById.set(String(vendor.id), vendor as Record<string, unknown>);
        }
      }

      const items = (cartRows ?? []).map((row: Record<string, unknown>) => {
        const product = productsById.get(String(row.product_id)) ?? null;
        const vendor = product ? vendorsById.get(String(product.vendor_id)) ?? null : null;
        return { ...row, product, vendor };
      });

      return jsonToolResult(`Your cart has ${items.length} item${items.length === 1 ? "" : "s"}.`, { items });
    } catch (error) {
      return toolError(error);
    }
  },
});