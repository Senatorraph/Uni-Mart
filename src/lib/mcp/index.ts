import { auth, defineMcp } from "@lovable.dev/mcp-js";

import addProductToCartTool from "./tools/add-product-to-cart";
import browseCampusProductsTool from "./tools/browse-campus-products";
import getMyCartTool from "./tools/get-my-cart";
import getMyProfileTool from "./tools/get-my-profile";
import getVendorDashboardTool from "./tools/get-vendor-dashboard";
import setVendorOpenTool from "./tools/set-vendor-open";

const issuer = "https://zfqibmjvtfpztcrjqojw.supabase.co/auth/v1";

export default defineMcp({
  name: "unimarket-mcp",
  title: "UniMarket MCP",
  version: "0.1.0",
  instructions:
    "Use these tools to help signed-in UniMarket users browse their university marketplace, manage their cart, and inspect vendor dashboard data. All reads and writes run through the user's own authorization context and database policies.",
  auth: auth.oauth.issuer({
    issuer,
    acceptedAudiences: "authenticated",
    jwksUri: `${issuer}/.well-known/jwks.json`,
  }),
  tools: [
    getMyProfileTool,
    browseCampusProductsTool,
    getMyCartTool,
    addProductToCartTool,
    getVendorDashboardTool,
    setVendorOpenTool,
  ],
});