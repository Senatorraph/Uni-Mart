import { defineTool } from "@lovable.dev/mcp-js";

import { createUserSupabase, getProfile, jsonToolResult, toolError } from "../supabase";

export default defineTool({
  name: "get_vendor_dashboard",
  title: "Get vendor dashboard",
  description: "Read the signed-in vendor's store status, recent orders, and summary counts.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    try {
      const profile = await getProfile(ctx);
      if (profile.role !== "vendor" && profile.role !== "super_admin") {
        throw new Error("Only vendor accounts can read a vendor dashboard.");
      }

      const userId = ctx.getUserId();
      if (!userId) throw new Error("Could not identify the signed-in UniMarket user.");

      const supabase = createUserSupabase(ctx);
      const { data: vendor, error: vendorError } = await supabase
        .from("vendors")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();
      if (vendorError) throw new Error(vendorError.message);
      if (!vendor) throw new Error("No vendor store is linked to this account.");

      const [{ data: orders, error: ordersError }, { count: productCount, error: productCountError }] = await Promise.all([
        supabase
          .from("orders")
          .select("id, total, status, created_at, student_id")
          .eq("vendor_id", vendor.id)
          .order("created_at", { ascending: false })
          .limit(20),
        supabase.from("products").select("id", { count: "exact", head: true }).eq("vendor_id", vendor.id),
      ]);

      if (ordersError) throw new Error(ordersError.message);
      if (productCountError) throw new Error(productCountError.message);

      const recentOrders = orders ?? [];
      const totalRevenue = recentOrders
        .filter((order: Record<string, unknown>) => String(order.status ?? "").toLowerCase() === "delivered")
        .reduce((sum: number, order: Record<string, unknown>) => sum + Number(order.total ?? 0), 0);

      return jsonToolResult("Fetched your vendor dashboard.", {
        vendor,
        stats: {
          recent_order_count: recentOrders.length,
          pending_order_count: recentOrders.filter((order: Record<string, unknown>) =>
            ["pending", "confirmed", "preparing"].includes(String(order.status ?? "").toLowerCase()),
          ).length,
          recent_delivered_revenue: totalRevenue,
          product_count: productCount ?? 0,
        },
        recent_orders: recentOrders,
      });
    } catch (error) {
      return toolError(error);
    }
  },
});