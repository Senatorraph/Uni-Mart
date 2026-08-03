import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Grid2x2, List, Loader2, Trash2 } from "lucide-react";

import { VendorLayout } from "@/components/layouts/VendorLayout";
import { EmptyState } from "@/components/EmptyState";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatNaira } from "@/lib/format";
import { BUSINESS_CATEGORIES } from "@/lib/mock-data";
import { supabase } from "@/integrations/supabase/client";
import { useVendor } from "@/hooks/useVendor";
import { VendorRoute } from "@/components/ProtectedRoute";
import type { Product } from "@/types";

export const Route = createFileRoute("/vendor/products")({
  head: () => ({
    meta: [
      { title: "My Products — UniMarket Vendor" },
      { name: "description", content: "Add, edit and manage the products your campus store sells on UniMarket." },
      { property: "og:title", content: "My Products — UniMarket Vendor" },
      { property: "og:description", content: "Add, edit and manage your campus store products." },
    ],
  }),
  component: () => (
    <VendorRoute>
      <VendorProducts />
    </VendorRoute>
  ),
});

const STATUS_STYLES: Record<string, string> = {
  active: "border-success/30 bg-success/15 text-success",
  out_of_stock: "border-accent/30 bg-accent/15 text-accent",
  hidden: "border-border bg-muted text-muted-foreground",
};

const STATUS_LABELS: Record<string, string> = {
  active: "Active",
  out_of_stock: "Out of Stock",
  hidden: "Hidden",
};

type NewProductForm = {
  name: string;
  description: string;
  price: string;
  compare_price: string;
  category: string;
  stock_qty: string;
  images: string[];
};

const EMPTY_PRODUCT_FORM: NewProductForm = {
  name: "",
  description: "",
  price: "",
  compare_price: "",
  category: "",
  stock_qty: "",
  images: [],
};

function VendorProducts() {
  const { vendor } = useVendor();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"list" | "grid">("list");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState<NewProductForm>(EMPTY_PRODUCT_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!vendor?.id) return;

    const vendorId = vendor.id;
    let cancelled = false;

    async function fetchProducts() {
      setLoading(true);

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("vendor_id", vendorId)
        .order("created_at", { ascending: false });

      if (cancelled) return;

      if (error) {
        console.error("Error fetching products:", error.message);
      } else {
        setProducts((data as Product[]) ?? []);
      }
      setLoading(false);
    }

    fetchProducts();
    return () => {
      cancelled = true;
    };
  }, [vendor?.id]);

  async function toggleProductStatus(productId: string, currentStatus: string) {
    const newStatus = currentStatus === "active" ? "hidden" : "active";

    const { error } = await supabase.from("products").update({ status: newStatus }).eq("id", productId);

    if (!error) {
      setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, status: newStatus } : p)));
    }
  }

  async function deleteProduct(productId: string) {
    const { error } = await supabase.from("products").update({ status: "hidden" }).eq("id", productId);

    if (!error) {
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    }
  }

  async function saveProduct() {
    if (!vendor?.id || !newProduct.name || !newProduct.price || !newProduct.category) return;
    setSaving(true);

    const { data, error } = await supabase
      .from("products")
      .insert({
        vendor_id: vendor.id,
        university_id: vendor.university_id,
        name: newProduct.name,
        description: newProduct.description || null,
        price: parseFloat(newProduct.price),
        compare_price: newProduct.compare_price ? parseFloat(newProduct.compare_price) : null,
        category: newProduct.category,
        stock_qty: parseInt(newProduct.stock_qty, 10) || 0,
        images: newProduct.images,
        status: "active",
      })
      .select()
      .single();

    if (!error && data) {
      setProducts((prev) => [data as Product, ...prev]);
      setShowAddForm(false);
      setNewProduct(EMPTY_PRODUCT_FORM);
    } else {
      console.error("Failed to save product:", error?.message);
    }

    setSaving(false);
  }

  return (
    <VendorLayout title="My Products">
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
          <h1 className="truncate text-2xl font-extrabold">My Products</h1>
          <Button className="shrink-0 rounded-lg font-bold glow-primary" onClick={() => setShowAddForm((v) => !v)}>
            {showAddForm ? "Cancel" : "Add New Product"}
          </Button>
        </div>

        {showAddForm && (
          <div className="space-y-4 rounded-xl border border-primary/30 bg-card p-6">
            <h3 className="font-semibold">Add New Product</h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Product Name *</Label>
                <Input
                  value={newProduct.name}
                  onChange={(e) => setNewProduct((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Jollof Rice & Chicken"
                  className="h-11 rounded-lg bg-background"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Category *</Label>
                <select
                  value={newProduct.category}
                  onChange={(e) => setNewProduct((p) => ({ ...p, category: e.target.value }))}
                  className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm"
                >
                  <option value="">Select category</option>
                  {BUSINESS_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Price (₦) *</Label>
                <Input
                  type="number"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct((p) => ({ ...p, price: e.target.value }))}
                  placeholder="2500"
                  className="h-11 rounded-lg bg-background"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Compare Price (₦)</Label>
                <Input
                  type="number"
                  value={newProduct.compare_price}
                  onChange={(e) => setNewProduct((p) => ({ ...p, compare_price: e.target.value }))}
                  placeholder="3000"
                  className="h-11 rounded-lg bg-background"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Stock Quantity *</Label>
                <Input
                  type="number"
                  value={newProduct.stock_qty}
                  onChange={(e) => setNewProduct((p) => ({ ...p, stock_qty: e.target.value }))}
                  placeholder="50"
                  className="h-11 rounded-lg bg-background"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Image URL</Label>
                <Input
                  type="text"
                  placeholder="https://... (Unsplash or Cloudinary URL)"
                  onBlur={(e) => {
                    if (e.target.value) {
                      setNewProduct((p) => ({ ...p, images: [e.target.value] }));
                    }
                  }}
                  className="h-11 rounded-lg bg-background"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Description</Label>
              <Textarea
                value={newProduct.description}
                onChange={(e) => setNewProduct((p) => ({ ...p, description: e.target.value }))}
                placeholder="Describe your product..."
                rows={3}
                className="rounded-lg bg-background"
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 rounded-lg"
                onClick={() => {
                  setShowAddForm(false);
                  setNewProduct(EMPTY_PRODUCT_FORM);
                }}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 gap-2 rounded-lg font-bold glow-primary"
                disabled={saving || !newProduct.name || !newProduct.price || !newProduct.category}
                onClick={saveProduct}
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {saving ? "Saving..." : "Save Product"}
              </Button>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          {(
            [
              ["list", List],
              ["grid", Grid2x2],
            ] as const
          ).map(([v, Icon]) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`grid h-9 w-9 place-items-center rounded-lg border transition-colors ${
                view === v ? "border-primary bg-primary/15 text-primary" : "border-border bg-card text-muted-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
            </button>
          ))}
        </div>

        {loading ? (
          <LoadingSpinner label="Loading your products..." />
        ) : products.length === 0 ? (
          <EmptyState
            title="No products yet"
            subtitle="Add your first product to start selling on your campus."
          />
        ) : view === "list" ? (
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    {["Product", "Category", "Price", "Stock", "Status", "Actions"].map((h) => (
                      <th key={h} className="px-5 py-3 text-left font-medium">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => {
                    const image = p.images?.[0];
                    return (
                      <tr key={p.id} className="border-t border-border hover:bg-muted/20">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-lg bg-muted">
                              {image ? (
                                <img src={image} alt={p.name} className="h-full w-full object-cover" />
                              ) : (
                                <span className="text-lg" aria-hidden>
                                  🛍️
                                </span>
                              )}
                            </div>
                            <span className="font-semibold">{p.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-muted-foreground">{p.category}</td>
                        <td className="px-5 py-3 font-semibold">{formatNaira(p.price)}</td>
                        <td className="px-5 py-3">{p.stock_qty}</td>
                        <td className="px-5 py-3">
                          <span
                            className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
                              STATUS_STYLES[p.status] ?? STATUS_STYLES.hidden
                            }`}
                          >
                            {STATUS_LABELS[p.status] ?? p.status}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-lg"
                              onClick={() => toggleProductStatus(p.id, p.status)}
                            >
                              {p.status === "active" ? "Hide" : "Show"}
                            </Button>
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-8 w-8 rounded-lg border-destructive/50 text-destructive"
                              onClick={() => deleteProduct(p.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((p) => {
              const image = p.images?.[0];
              return (
                <div key={p.id} className="rounded-xl border border-border bg-card p-4">
                  <div className="grid aspect-square place-items-center overflow-hidden rounded-lg bg-gradient-to-br from-primary/15 to-background">
                    {image ? (
                      <img src={image} alt={p.name} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-4xl" aria-hidden>
                        🛍️
                      </span>
                    )}
                  </div>
                  <p className="mt-3 line-clamp-1 text-sm font-bold">{p.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.category} · {p.stock_qty} in stock
                  </p>
                  <p className="mt-1 font-extrabold">{formatNaira(p.price)}</p>
                  <span
                    className={`mt-2 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                      STATUS_STYLES[p.status] ?? STATUS_STYLES.hidden
                    }`}
                  >
                    {STATUS_LABELS[p.status] ?? p.status}
                  </span>
                  <div className="mt-3 flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 rounded-lg"
                      onClick={() => toggleProductStatus(p.id, p.status)}
                    >
                      {p.status === "active" ? "Hide" : "Show"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-lg border-destructive/50 text-destructive"
                      onClick={() => deleteProduct(p.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </VendorLayout>
  );
}
