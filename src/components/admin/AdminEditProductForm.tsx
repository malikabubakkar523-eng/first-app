"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useToast } from "@/components/ui/ToastProvider";
import { Save, ArrowLeft, Trash2, Plus, Star } from "lucide-react";
import Link from "next/link";

interface AdminEditProductFormProps {
  product: any;
  categories: any[];
  brands: any[];
}

export function AdminEditProductForm({
  product,
  categories,
  brands,
}: AdminEditProductFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: product.name,
    sku: product.sku,
    categoryId: product.categoryId,
    brandId: product.brandId || "",
    price: product.price,
    salePrice: product.salePrice || "",
    description: product.description,
    details: product.details || "",
    isFeatured: product.isFeatured,
    isNew: product.isNew,
    status: product.status || "ACTIVE",
  });

  const [images, setImages] = useState<string[]>(
    product.images.map((img: any) => img.url)
  );
  const [newImageUrl, setNewImageUrl] = useState("");

  const [sizes, setSizes] = useState<any[]>(
    product.sizes.map((s: any) => ({
      id: s.id,
      size: s.size,
      stock: s.stock,
      sku: s.sku || "",
    }))
  );

  const handleAddImage = () => {
    if (newImageUrl.trim()) {
      setImages([...images, newImageUrl.trim()]);
      setNewImageUrl("");
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, idx) => idx !== index));
  };

  const handleStockChange = (index: number, val: number) => {
    const next = [...sizes];
    next[index].stock = Math.max(0, val);
    setSizes(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          images,
          sizes,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast({
          title: "Product Updated Successfully",
          description: formData.name,
          type: "success",
        });
        router.push("/admin/products");
        router.refresh();
      } else {
        toast({
          title: "Update Failed",
          description: data.error || "Could not save changes.",
          type: "error",
        });
      }
    } catch (err) {
      toast({ title: "Network error", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-16">
      <div className="flex items-center justify-between">
        <Link
          href="/admin/products"
          className="text-xs font-semibold text-zinc-400 hover:text-white flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Products
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold shadow-lg shadow-brand-500/20 flex items-center gap-2 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{loading ? "Saving Changes..." : "Save Changes"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Basic Information */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Footwear Details
            </h3>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Product Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 text-xs rounded-xl border border-zinc-800 bg-zinc-950 text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  SKU Identifier
                </label>
                <input
                  type="text"
                  required
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  className="w-full px-4 py-2.5 text-xs font-mono rounded-xl border border-zinc-800 bg-zinc-950 text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Category
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-zinc-800 bg-zinc-950 text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Description
              </label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2.5 text-xs rounded-xl border border-zinc-800 bg-zinc-950 text-white leading-relaxed focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Technical Specifications (Details)
              </label>
              <textarea
                rows={3}
                value={formData.details}
                onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                placeholder="Full carbon plate • 198g weight • Vibram Megagrip..."
                className="w-full px-4 py-2.5 text-xs rounded-xl border border-zinc-800 bg-zinc-950 text-white leading-relaxed focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Pricing & Stock */}
          <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Pricing & Size-Wise Inventory
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Regular Price (PKR / Rs.)
                </label>
                <input
                  type="number"
                  step="1"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 text-xs font-mono rounded-xl border border-zinc-800 bg-zinc-950 text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Sale Price (PKR / Rs. Optional)
                </label>
                <input
                  type="number"
                  step="1"
                  value={formData.salePrice}
                  onChange={(e) => setFormData({ ...formData, salePrice: e.target.value ? Number(e.target.value) : "" })}
                  className="w-full px-4 py-2.5 text-xs font-mono rounded-xl border border-zinc-800 bg-zinc-950 text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
            </div>

            {/* Size Stocks Table */}
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-semibold text-zinc-300">
                Size Breakdown (EU)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {sizes.map((s, idx) => (
                  <div key={idx} className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-bold text-zinc-400">
                      <span>EU {s.size}</span>
                      <span className="text-[10px] text-zinc-600 font-mono">STOCK</span>
                    </div>
                    <input
                      type="number"
                      min="0"
                      value={s.stock}
                      onChange={(e) => handleStockChange(idx, parseInt(e.target.value) || 0)}
                      className="w-full px-2.5 py-1 text-xs font-mono rounded-lg border border-zinc-800 bg-zinc-900 text-white text-center font-bold"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Status & Images */}
        <div className="space-y-6">
          {/* Status & Options */}
          <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Publishing Options
            </h3>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Product Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2.5 text-xs rounded-xl border border-zinc-800 bg-zinc-950 text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="ACTIVE">ACTIVE (Published)</option>
                <option value="ARCHIVED">ARCHIVED (Preserved for order history)</option>
                <option value="DRAFT">DRAFT</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Brand
              </label>
              <select
                value={formData.brandId}
                onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}
                className="w-full px-4 py-2.5 text-xs rounded-xl border border-zinc-800 bg-zinc-950 text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="">No specific brand</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2 pt-2 border-t border-zinc-800">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-zinc-300">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="rounded border-zinc-700 text-brand-500 focus:ring-brand-500"
                />
                <span>Featured on Storefront</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-zinc-300">
                <input
                  type="checkbox"
                  checked={formData.isNew}
                  onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })}
                  className="rounded border-zinc-700 text-brand-500 focus:ring-brand-500"
                />
                <span>Mark as New Arrival Drop</span>
              </label>
            </div>
          </div>

          {/* Product Gallery Images */}
          <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Product Images ({images.length})
            </h3>

            <div className="space-y-3">
              {images.map((url, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-3"
                >
                  <div className="relative w-12 h-12 rounded-xl bg-zinc-800 overflow-hidden shrink-0">
                    <Image src={url} alt={`Image ${idx}`} fill sizes="48px" className="object-contain" />
                  </div>
                  <p className="text-[10px] text-zinc-400 font-mono truncate flex-1">{url}</p>
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-zinc-800"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              <div className="flex gap-2 pt-2">
                <input
                  type="url"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="Paste new image URL..."
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-zinc-800 bg-zinc-950 text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
                <button
                  type="button"
                  onClick={handleAddImage}
                  className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
