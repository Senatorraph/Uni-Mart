import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Grid2x2, List, Pencil, Trash2, UploadCloud } from "lucide-react";

import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatNaira } from "@/lib/format";
import { BUSINESS_CATEGORIES, PRODUCTS } from "@/lib/mock-data";

export const Route = createFileRoute("/vendor/products")({
  head: () => ({
    meta: [
      { title: "My Products — UniMarket Vendor" },
      { name: "description", content: "Add, edit and manage the products your campus store sells on UniMarket." },
      { property: "og:title", content: "My Products — UniMarket Vendor" },
      { property: "og:description", content: "Add, edit and manage your campus store products." },
    ],
  }),
  component: VendorProducts,
});

function ProductForm() {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Product Name</Label>
        <Input placeholder="Jollof Rice & Chicken" className="h-11 rounded-lg bg-background" />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Description</Label>
        <Textarea rows={3} placeholder="Describe your product..." className="rounded-lg bg-background" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Price (₦)</Label>
          <Input placeholder="2500" className="h-11 rounded-lg bg-background" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Compare Price (₦)</Label>
          <Input placeholder="3000" className="h-11 rounded-lg bg-background" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Category</Label>
          <select className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm">
            {BUSINESS_CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Stock Quantity</Label>
          <Input placeholder="25" className="h-11 rounded-lg bg-background" />
        </div>
      </div>
      <div className="grid h-36 place-items-center rounded-lg border-2 border-dashed border-border bg-background text-center">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <UploadCloud className="h-6 w-6 text-primary" />
          <p className="text-sm">Drag & drop an image, or click to upload</p>
          <p className="text-xs">PNG or JPG up to 5MB</p>
        </div>
      </div>
      <div className="flex items-center justify-between rounded-lg border border-border bg-background px-4 py-3">
        <span className="text-sm font-medium">Status: Active</span>
        <Switch defaultChecked />
      </div>
      <Button className="h-11 w-full rounded-lg font-bold glow-primary">Save Product</Button>
    </div>
  );
}

function VendorProducts() {
  const [view, setView] = useState<"list" | "grid">("list");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
          <h1 className="truncate text-2xl font-extrabold">My Products</h1>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="shrink-0 rounded-lg font-bold glow-primary">Add New Product</Button>
            </DialogTrigger>
            <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Add Product</DialogTitle>
              </DialogHeader>
              <ProductForm />
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex gap-2">
          {([
            ["list", List],
            ["grid", Grid2x2],
          ] as const).map(([v, Icon]) => (
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

        {view === "list" ? (
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    {["Product", "Category", "Price", "Stock", "Status", "Actions"].map((h) => (
                      <th key={h} className="px-5 py-3 text-left font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {PRODUCTS.map((p) => (
                    <tr key={p.id} className="border-t border-border hover:bg-muted/20">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <span className="grid h-10 w-10 place-items-center rounded-lg bg-muted text-lg">{p.emoji}</span>
                          <span className="font-semibold">{p.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">{p.category}</td>
                      <td className="px-5 py-3 font-semibold">{formatNaira(p.price)}</td>
                      <td className="px-5 py-3">{p.stock}</td>
                      <td className="px-5 py-3">
                        <span className="rounded-full border border-success/30 bg-success/15 px-2.5 py-0.5 text-[11px] font-semibold text-success">
                          Active
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex gap-2">
                          <Button size="icon" variant="outline" className="h-8 w-8 rounded-lg">
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="icon" variant="outline" className="h-8 w-8 rounded-lg border-destructive/50 text-destructive">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PRODUCTS.map((p) => (
              <div key={p.id} className="rounded-xl border border-border bg-card p-4">
                <div className="grid aspect-square place-items-center rounded-lg bg-gradient-to-br from-primary/15 to-background text-4xl">
                  {p.emoji}
                </div>
                <p className="mt-3 line-clamp-1 text-sm font-bold">{p.name}</p>
                <p className="text-xs text-muted-foreground">{p.category} · {p.stock} in stock</p>
                <p className="mt-1 font-extrabold">{formatNaira(p.price)}</p>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1 rounded-lg">Edit</Button>
                  <Button size="sm" variant="outline" className="rounded-lg border-destructive/50 text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
