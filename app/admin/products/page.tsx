"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/utils";

type AdminProduct = {
  id: string;
  name: string;
  basePrice: number;
  salePrice?: number | null;
  isActive: boolean;
  isFeatured: boolean;
  category?: { name: string };
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);

  function load() {
    fetch("/api/admin/products")
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setProducts(res.data);
        setLoading(false);
      });
  }

  useEffect(load, []);

  async function toggleActive(p: AdminProduct) {
    await fetch(`/api/admin/products/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !p.isActive }),
    });
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this product?")) return;
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="container-px mx-auto max-w-6xl py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Products</h1>
      </div>

      {loading ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : (
        <div className="card-surface divide-y divide-border">
          {products.map((p) => (
            <div key={p.id} className="flex items-center justify-between gap-4 p-4 text-sm">
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium">{p.name}</div>
                <div className="text-xs text-muted">{p.category?.name}</div>
              </div>
              <div className="w-24 text-right">
                {formatPrice(p.salePrice ?? p.basePrice)}
              </div>
              <button
                onClick={() => toggleActive(p)}
                className={`rounded-full px-3 py-1 text-xs ${
                  p.isActive ? "bg-green-600/20 text-green-400" : "bg-border text-muted"
                }`}
              >
                {p.isActive ? "Active" : "Hidden"}
              </button>
              <button
                onClick={() => remove(p.id)}
                className="text-xs text-muted hover:text-red-400"
              >
                Delete
              </button>
            </div>
          ))}
          {products.length === 0 && (
            <div className="p-6 text-sm text-muted">No products yet. Run the seed script.</div>
          )}
        </div>
      )}
    </div>
  );
}
