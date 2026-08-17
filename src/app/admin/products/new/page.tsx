"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/components/ui/ToastProvider";
import { ArrowLeft, Plus, Trash2, Check, UploadCloud } from "lucide-react";
import { SHOE_SIZES } from "@/lib/utils";

export default function AdminNewProductPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  const [price, setPrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [description, setDescription] = useState("");
  const [details, setDetails] = useState("Full Carbon Plate\nNitrogen-infused foam\nDrop: 8mm");
  const [isFeatured, setIsFeatured] = useState(true);
  const [isNew, setIsNew] = useState(true);

  // Image URLs
  const [imageUrls, setImageUrls] = useState<string[]>([
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1000&q=80",
    "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=1000&q=80",
  ]);
  const [newImageUrl, setNewImageUrl] = useState("");

  // Size Inventory Matrix
  const [sizesStock, setSizesStock] = useState<Record<string, number>>({
    "39": 6,
    "40": 10,
    "41": 15,
    "42": 12,
    "43": 8,
    "44": 4,
    "45": 2,
  });

  const [brands, setBrands] = useState<any[]>([]);
  const [brandId, setBrandId] = useState("");

  const [adminStatus, setAdminStatus] = useState<"checking" | "admin" | "not_admin">("checking");

  React.useEffect(() => {
    // Check current auth status
    fetch("/api/auth/me", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.user?.role === "ADMIN") {
          setAdminStatus("admin");
        } else {
          setAdminStatus("not_admin");
        }
      })
      .catch(() => setAdminStatus("not_admin"));

    // Fetch live categories and brands
    fetch("/api/content/categories")
      .then((res) => res.json())
      .then((data) => {
        if (data.categories && data.categories.length > 0) {
          setCategories(data.categories);
          setCategoryId(data.categories[0].id);
        }
        if (data.brands && data.brands.length > 0) {
          setBrands(data.brands);
        }
      })
      .catch((err) => console.warn("Categories fetch error:", err));
  }, []);

  const handleAddImage = () => {
    if (!newImageUrl.trim()) return;
    setImageUrls([...imageUrls, newImageUrl.trim()]);
    setNewImageUrl("");
  };

  const handleRemoveImage = (index: number) => {
    setImageUrls(imageUrls.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || name.trim() === "") {
      toast({ title: "Product name is required", type: "error" });
      return;
    }

    const cleanPrice = String(price).replace(/[^0-9.]/g, "");
    if (!cleanPrice || parseFloat(cleanPrice) <= 0) {
      toast({ title: "Please enter a valid price", type: "error" });
      return;
    }

    setLoading(true);
    try {
      const generatedSku = sku && sku.trim() !== "" 
        ? sku.trim().toUpperCase() 
        : `VEL-${name.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

      const cleanSalePrice = salePrice ? String(salePrice).replace(/[^0-9.]/g, "") : null;

      const payload = {
        name: name.trim(),
        sku: generatedSku,
        categoryId: categoryId || undefined,
        brandId: brandId || undefined,
        price: parseFloat(cleanPrice),
        salePrice: cleanSalePrice ? parseFloat(cleanSalePrice) : null,
        description,
        details,
        isFeatured,
        isNew,
        images: imageUrls.length > 0 ? imageUrls : ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1000&q=80"],
        sizes: Object.entries(sizesStock).map(([sz, st]) => ({
          size: sz,
          stock: Number(st) || 0,
        })),
      };

      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast({
          title: "Product Published!",
          description: `${name} has been successfully added to the store catalog.`,
          type: "success",
        });
        router.push("/admin/products");
        router.refresh();
      } else {
        const errorDesc = data.error || "Failed to create product. Please check input data.";
        toast({
          title: "Error publishing product",
          description: errorDesc,
          type: "error",
        });
      }
    } catch (err: any) {
      toast({
        title: "Publishing error",
        description: err.message || "Failed to connect to server.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-brand-500">
            CATALOG CREATOR
          </span>
          <h1 className="text-2xl font-display font-black text-white tracking-tight mt-1">
            Add New Footwear Model
          </h1>
        </div>
        <Link
          href="/admin/products"
          className="text-xs font-semibold text-zinc-400 hover:text-white flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Products
        </Link>
      </div>

      {adminStatus === "not_admin" && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center justify-between">
          <span>⚠️ You are not signed in as Administrator. Please login as Admin to ensure all publishing privileges work.</span>
          <Link
            href="/login"
            className="px-3 py-1.5 rounded-lg bg-amber-500 text-black font-bold text-[11px] hover:bg-amber-400"
          >
            Login as Admin
          </Link>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Basic Information */}
        <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            1. Basic Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Product Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Veloce Apex Carbon Ghost"
                className="w-full px-4 py-3 text-xs rounded-xl border border-zinc-800 bg-zinc-950 text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                SKU Identifier
              </label>
              <input
                type="text"
                required
                value={sku}
                onChange={(e) => setSku(e.target.value.toUpperCase())}
                placeholder="e.g. VEL-APX-99"
                className="w-full px-4 py-3 text-xs rounded-xl border border-zinc-800 bg-zinc-950 text-white font-mono uppercase focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-4 py-3 text-xs rounded-xl border border-zinc-800 bg-zinc-950 text-white focus:outline-none"
              >
                {categories.length > 0 ? (
                  categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="sneakers">Sneakers (Default)</option>
                    <option value="running">Running</option>
                    <option value="basketball">Basketball</option>
                    <option value="casual">Casual & Loafers</option>
                    <option value="boots">Boots</option>
                    <option value="training">Training & Gym</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Brand (Optional)
              </label>
              <select
                value={brandId}
                onChange={(e) => setBrandId(e.target.value)}
                className="w-full px-4 py-3 text-xs rounded-xl border border-zinc-800 bg-zinc-950 text-white focus:outline-none"
              >
                <option value="">No specific brand / House Collection</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
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
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the footwear engineering, materials, and biomechanical fit..."
              className="w-full px-4 py-3 text-xs rounded-xl border border-zinc-800 bg-zinc-950 text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Technical Specifications (One per line)
            </label>
            <textarea
              rows={3}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Full carbon plate\nNitrogen-infused foam\nDrop: 8mm"
              className="w-full px-4 py-3 text-xs font-mono rounded-xl border border-zinc-800 bg-zinc-950 text-white focus:outline-none"
            />
          </div>
        </div>

        {/* Section 2: Pricing & Badges */}
        <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            2. Pricing & Flags
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Regular Retail Price (PKR / Rs.)
              </label>
              <input
                type="number"
                step="1"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="14500"
                className="w-full px-4 py-3 text-xs rounded-xl border border-zinc-800 bg-zinc-950 text-white font-mono focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Promotional Sale Price (PKR / Rs. Optional)
              </label>
              <input
                type="number"
                step="1"
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
                placeholder="11999"
                className="w-full px-4 py-3 text-xs rounded-xl border border-zinc-800 bg-zinc-950 text-white font-mono focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="rounded text-brand-500 focus:ring-brand-500"
              />
              <span className="text-xs font-semibold text-zinc-300">Feature on Homepage</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isNew}
                onChange={(e) => setIsNew(e.target.checked)}
                className="rounded text-brand-500 focus:ring-brand-500"
              />
              <span className="text-xs font-semibold text-zinc-300">Mark as New Arrival Drop</span>
            </label>
          </div>
        </div>

        {/* Section 3: High-Res Image Uploads */}
        <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              3. Product Photography (Device Upload & URLs)
            </h3>
            <span className="text-[11px] text-zinc-400">Upload high-res photos from your device</span>
          </div>

          {/* Direct File Upload Area from Device */}
          <label className="border-2 border-dashed border-zinc-700 hover:border-brand-500 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 text-center cursor-pointer bg-zinc-950/50 hover:bg-zinc-950 transition-all group">
            <UploadCloud className="w-8 h-8 text-zinc-500 group-hover:text-brand-500 transition-colors" />
            <div>
              <p className="text-xs font-bold text-white group-hover:text-brand-400 transition-colors">
                Click to upload shoe photos directly from device
              </p>
              <p className="text-[10px] text-zinc-500">
                Supports JPG, PNG, WEBP (Select one or multiple files)
              </p>
            </div>
            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const files = e.target.files;
                if (!files || files.length === 0) return;

                for (let i = 0; i < files.length; i++) {
                  const file = files[i];
                  const formData = new FormData();
                  formData.append("file", file);

                  try {
                    const res = await fetch("/api/admin/upload", {
                      method: "POST",
                      body: formData,
                    });
                    const data = await res.json();
                    if (res.ok && data.success) {
                      setImageUrls((prev) => [...prev, data.url]);
                      toast({
                        title: "Image Uploaded",
                        description: file.name,
                        type: "success",
                      });
                    } else {
                      toast({
                        title: "Upload Failed",
                        description: data.error || "Could not upload file",
                        type: "error",
                      });
                    }
                  } catch (err) {
                    toast({
                      title: "Upload Error",
                      description: "Failed to upload from device.",
                      type: "error",
                    });
                  }
                }
              }}
            />
          </label>

          {/* Optional External URL Bar */}
          <div className="flex gap-2 pt-2">
            <input
              type="url"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              placeholder="Or paste external image URL (optional)..."
              className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-zinc-800 bg-zinc-950 text-white focus:outline-none"
            />
            <button
              type="button"
              onClick={handleAddImage}
              className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold transition-colors"
            >
              Add URL
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {imageUrls.map((url, idx) => (
              <div
                key={idx}
                className="relative aspect-square rounded-2xl bg-zinc-950 border border-zinc-800 overflow-hidden p-2 flex items-center justify-center group"
              >
                <img src={url} alt={`Preview ${idx + 1}`} className="object-contain w-full h-full" />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(idx)}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-zinc-900/90 text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                {idx === 0 && (
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-zinc-900/90 text-[10px] font-bold text-brand-400 border border-brand-500/20">
                    Primary
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Size Inventory Matrix */}
        <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            4. Size-wise Stock Allocations
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-7 gap-3">
            {SHOE_SIZES.map((sz) => (
              <div key={sz} className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-center space-y-1.5">
                <span className="text-xs font-bold text-zinc-400 font-mono">EU {sz}</span>
                <input
                  type="number"
                  min="0"
                  value={sizesStock[sz] ?? 0}
                  onChange={(e) =>
                    setSizesStock({ ...sizesStock, [sz]: Number(e.target.value) })
                  }
                  className="w-full text-center py-1 text-xs font-mono font-bold rounded-lg border border-zinc-800 bg-zinc-900 text-white focus:outline-none"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold shadow-xl shadow-brand-500/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Check className="w-4 h-4" />
          <span>{loading ? "Publishing to Storefront..." : "Publish Product to Catalog"}</span>
        </button>
      </form>
    </div>
  );
}
