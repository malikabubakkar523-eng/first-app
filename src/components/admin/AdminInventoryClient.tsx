"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useToast } from "@/components/ui/ToastProvider";
import { AlertCircle, Plus, Minus, Check, Search } from "lucide-react";

interface ProductSizeItem {
  id: string;
  size: string;
  stock: number;
  sku: string | null;
  product: {
    id: string;
    name: string;
    sku: string;
    images: { url: string }[];
  };
}

interface AdminInventoryClientProps {
  initialSizes: ProductSizeItem[];
}

export function AdminInventoryClient({ initialSizes }: AdminInventoryClientProps) {
  const { toast } = useToast();
  const [sizes, setSizes] = useState<ProductSizeItem[]>(initialSizes);
  const [search, setSearch] = useState("");
  const [filterLowStock, setFilterLowStock] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleStockChange = async (sizeId: string, newStock: number) => {
    if (newStock < 0) return;
    setUpdatingId(sizeId);

    try {
      const res = await fetch("/api/admin/inventory", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sizeId, stock: newStock }),
      });

      if (res.ok) {
        setSizes(sizes.map((s) => (s.id === sizeId ? { ...s, stock: newStock } : s)));
        toast({
          title: "Stock Updated",
          description: `New stock level: ${newStock}`,
          type: "success",
        });
      } else {
        toast({ title: "Failed to update stock", type: "error" });
      }
    } catch (err) {
      toast({ title: "Error", type: "error" });
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = sizes.filter((s) => {
    const matchesSearch =
      s.product.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.sku && s.sku.toLowerCase().includes(search.toLowerCase()));
    const matchesLowStock = filterLowStock ? s.stock <= 4 : true;
    return matchesSearch && matchesLowStock;
  });

  return (
    <div className="space-y-6">
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by shoe or SKU..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-zinc-800 bg-zinc-900 text-white focus:outline-none"
          />
        </div>

        <button
          onClick={() => setFilterLowStock(!filterLowStock)}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors ${
            filterLowStock
              ? "bg-amber-500 text-zinc-950 font-bold shadow-md"
              : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Show Low Stock Only (&le; 4)</span>
        </button>
      </div>

      {/* Inventory Table */}
      <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-800 text-[11px] uppercase tracking-wider text-zinc-500">
                <th className="pb-3 font-semibold">Product Silhouette</th>
                <th className="pb-3 font-semibold">SKU</th>
                <th className="pb-3 font-semibold">Size (EU)</th>
                <th className="pb-3 font-semibold">Current Stock</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold text-right">Adjust Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filtered.map((s) => {
                const img = s.product.images[0]?.url || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&q=80";

                return (
                  <tr key={s.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-xl bg-zinc-800 p-1 shrink-0 flex items-center justify-center">
                          <Image src={img} alt={s.product.name} fill sizes="40px" className="object-contain" />
                        </div>
                        <span className="font-bold text-white line-clamp-1">{s.product.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 font-mono text-zinc-400">{s.sku || s.product.sku}</td>
                    <td className="py-3.5 font-mono font-bold text-white">EU {s.size}</td>
                    <td className="py-3.5 font-mono font-bold text-lg text-white">{s.stock}</td>
                    <td className="py-3.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          s.stock === 0
                            ? "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                            : s.stock <= 4
                            ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                            : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                        }`}
                      >
                        {s.stock === 0 ? "OUT OF STOCK" : s.stock <= 4 ? "LOW STOCK" : "IN STOCK"}
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleStockChange(s.id, s.stock - 1)}
                          disabled={s.stock <= 0 || updatingId === s.id}
                          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 disabled:opacity-30"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleStockChange(s.id, s.stock + 5)}
                          disabled={updatingId === s.id}
                          className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] font-mono font-bold"
                          title="Add 5 units"
                        >
                          +5
                        </button>
                        <button
                          onClick={() => handleStockChange(s.id, s.stock + 1)}
                          disabled={updatingId === s.id}
                          className="p-1.5 rounded-lg bg-brand-500 hover:bg-brand-600 text-white"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
