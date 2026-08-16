"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import {
  Plus,
  Trash2,
  Edit3,
  Image as ImageIcon,
  Sparkles,
  ExternalLink,
  X,
  Check,
  Eye,
  Upload,
  ArrowUp,
  ArrowDown,
  ToggleLeft,
  ToggleRight,
  AlertTriangle,
  Loader2,
  Link as LinkIcon,
} from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";

export interface GalleryItemType {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  description: string | null;
  shoeModel: string | null;
  link: string | null;
  order: number;
  isActive: boolean;
  createdAt: string;
}

export function AdminGalleryManagerClient({ initialItems }: { initialItems: GalleryItemType[] }) {
  const [items, setItems] = useState<GalleryItemType[]>(initialItems);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItemType | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<GalleryItemType | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("ALL");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const [replacingItemId, setReplacingItemId] = useState<string | null>(null);

  const { toast } = useToast();

  const [form, setForm] = useState({
    title: "",
    category: "WOMEN",
    imageUrl: "",
    description: "",
    shoeModel: "",
    link: "",
    order: 0,
    isActive: true,
  });

  const openAddModal = () => {
    setEditingItem(null);
    setForm({
      title: "",
      category: "WOMEN",
      imageUrl: "",
      description: "",
      shoeModel: "",
      link: "",
      order: items.length + 1,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: GalleryItemType) => {
    setEditingItem(item);
    setForm({
      title: item.title,
      category: item.category,
      imageUrl: item.imageUrl,
      description: item.description || "",
      shoeModel: item.shoeModel || "",
      link: item.link || "",
      order: item.order,
      isActive: item.isActive,
    });
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: "form" | "replace", itemId?: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Image size must be under 5MB for optimal speed.",
        type: "error",
      });
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (res.ok && data.success) {
        if (target === "form") {
          setForm((prev) => ({ ...prev, imageUrl: data.url }));
          toast({
            title: "Image Uploaded",
            description: "File uploaded and optimized successfully.",
            type: "success",
          });
        } else if (target === "replace" && itemId) {
          // Immediately update the item in DB
          const patchRes = await fetch(`/api/admin/gallery/${itemId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageUrl: data.url }),
          });
          if (patchRes.ok) {
            setItems((prev) =>
              prev.map((i) => (i.id === itemId ? { ...i, imageUrl: data.url } : i))
            );
            toast({
              title: "Image Replaced",
              description: "New image is now live in the gallery.",
              type: "success",
            });
          }
        }
      } else {
        toast({
          title: "Upload Failed",
          description: data.error || "Could not upload image.",
          type: "error",
        });
      }
    } catch (err) {
      toast({
        title: "Upload Error",
        description: "Network error during upload.",
        type: "error",
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (replaceInputRef.current) replaceInputRef.current.value = "";
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.imageUrl) {
      toast({
        title: "Validation Error",
        description: "Title and Image are required.",
        type: "error",
      });
      return;
    }

    setSaving(true);
    try {
      if (editingItem) {
        // PATCH
        const res = await fetch(`/api/admin/gallery/${editingItem.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setItems(
            items.map((i) => (i.id === editingItem.id ? { ...i, ...form } : i))
          );
          toast({
            title: "Success",
            description: "Gallery item updated successfully!",
            type: "success",
          });
          setIsModalOpen(false);
        } else {
          toast({
            title: "Update Failed",
            description: data.error || "Could not update item.",
            type: "error",
          });
        }
      } else {
        // POST
        const res = await fetch("/api/admin/gallery", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setItems([data.item, ...items]);
          toast({
            title: "Created",
            description: "New photo added to gallery!",
            type: "success",
          });
          setIsModalOpen(false);
        } else {
          toast({
            title: "Creation Failed",
            description: data.error || "Could not save photo.",
            type: "error",
          });
        }
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Network error occurred.",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (item: GalleryItemType) => {
    const newStatus = !item.isActive;
    try {
      const res = await fetch(`/api/admin/gallery/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: newStatus }),
      });
      if (res.ok) {
        setItems(items.map((i) => (i.id === item.id ? { ...i, isActive: newStatus } : i)));
        toast({
          title: newStatus ? "Image Enabled" : "Image Disabled",
          description: newStatus ? "Now visible in public lookbook." : "Hidden from public lookbook.",
          type: "info",
        });
      }
    } catch (e) {
      toast({ title: "Error updating status", type: "error" });
    }
  };

  const handleMoveOrder = async (item: GalleryItemType, direction: "up" | "down") => {
    const index = items.findIndex((i) => i.id === item.id);
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === items.length - 1) return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const swapItem = items[targetIndex];

    const newItems = [...items];
    const tempOrder = item.order;
    item.order = swapItem.order;
    swapItem.order = tempOrder;
    newItems[index] = swapItem;
    newItems[targetIndex] = item;

    setItems(newItems);

    try {
      await Promise.all([
        fetch(`/api/admin/gallery/${item.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: item.order }),
        }),
        fetch(`/api/admin/gallery/${swapItem.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: swapItem.order }),
        }),
      ]);
      toast({ title: "Order Updated", type: "success" });
    } catch (e) {
      toast({ title: "Failed to save reorder", type: "error" });
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirmItem) return;
    const id = deleteConfirmItem.id;
    try {
      const res = await fetch(`/api/admin/gallery/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        setItems(items.filter((i) => i.id !== id));
        toast({
          title: "Deleted",
          description: "Image removed from gallery.",
          type: "info",
        });
      } else {
        toast({
          title: "Delete Failed",
          description: data.error || "Could not delete.",
          type: "error",
        });
      }
    } catch (err) {
      toast({ title: "Error", description: "Network error.", type: "error" });
    } finally {
      setDeleteConfirmItem(null);
    }
  };

  const filteredItems = items.filter((item) => {
    if (filterCategory === "ALL") return true;
    return item.category === filterCategory;
  });

  return (
    <div className="space-y-6">
      {/* Hidden File Input for Card Replacement */}
      <input
        type="file"
        ref={replaceInputRef}
        className="hidden"
        accept="image/jpeg,image/png,image/webp,image/avif"
        onChange={(e) => handleFileUpload(e, "replace", replacingItemId || undefined)}
      />

      {/* Control Bar: Categories Filter & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
        <div className="flex flex-wrap gap-2">
          {["ALL", "WOMEN", "MEN", "EDITORIAL", "STREETWEAR"].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                filterCategory === cat
                  ? "bg-brand-500 text-white shadow-md shadow-brand-500/20"
                  : "bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700"
              }`}
            >
              {cat === "ALL" ? "All Photos" : cat}
            </button>
          ))}
        </div>

        <button
          onClick={openAddModal}
          className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold shadow-md shadow-brand-500/20 flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Gallery Image</span>
        </button>
      </div>

      {/* Grid of Gallery Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredItems.map((item, index) => (
          <div
            key={item.id}
            className={`group rounded-3xl bg-zinc-900 border transition-all overflow-hidden flex flex-col justify-between ${
              item.isActive
                ? "border-zinc-800 hover:border-zinc-700 shadow-xl"
                : "border-zinc-800/50 opacity-60 bg-zinc-950"
            }`}
          >
            {/* Image Preview Container */}
            <div className="relative aspect-[4/5] bg-zinc-950 overflow-hidden">
              <Image
                src={item.imageUrl}
                alt={item.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />

              {/* Status Pill */}
              <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border ${
                    item.isActive
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                      : "bg-zinc-800/80 text-zinc-400 border-zinc-700"
                  }`}
                >
                  {item.isActive ? "Active" : "Disabled"}
                </span>

                <span className="px-2 py-1 rounded-full bg-zinc-950/80 backdrop-blur-md text-zinc-300 text-[10px] font-mono border border-zinc-800">
                  Pos: {item.order}
                </span>
              </div>

              {/* Quick Actions Hover Overlay */}
              <div className="absolute inset-0 bg-zinc-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 z-10 p-4">
                <button
                  onClick={() => openEditModal(item)}
                  title="Edit details"
                  className="p-2.5 rounded-xl bg-white text-zinc-950 hover:bg-brand-500 hover:text-white transition-colors shadow-lg"
                >
                  <Edit3 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    setReplacingItemId(item.id);
                    replaceInputRef.current?.click();
                  }}
                  title="Replace image file"
                  className="p-2.5 rounded-xl bg-zinc-800 text-white hover:bg-zinc-700 transition-colors shadow-lg flex items-center gap-1 text-xs font-bold"
                >
                  <Upload className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setDeleteConfirmItem(item)}
                  title="Delete image"
                  className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white transition-colors shadow-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content & Metadata */}
            <div className="p-4 space-y-3">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-400">
                    {item.category}
                  </span>
                  {item.shoeModel && (
                    <span className="text-[10px] font-mono text-zinc-400 truncate">
                      {item.shoeModel}
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-bold text-white mt-1 truncate">{item.title}</h3>
                {item.description && (
                  <p className="text-xs text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
                    {item.description}
                  </p>
                )}
                {item.link && (
                  <div className="flex items-center gap-1 text-[11px] text-zinc-500 mt-1 font-mono truncate">
                    <LinkIcon className="w-3 h-3 text-brand-500 shrink-0" />
                    <span>{item.link}</span>
                  </div>
                )}
              </div>

              {/* Bottom Row: Toggle & Reorder Buttons */}
              <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleToggleActive(item)}
                  className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors ${
                    item.isActive
                      ? "text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20"
                      : "text-zinc-400 bg-zinc-800 hover:bg-zinc-700"
                  }`}
                >
                  {item.isActive ? (
                    <ToggleRight className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <ToggleLeft className="w-4 h-4 text-zinc-500" />
                  )}
                  <span>{item.isActive ? "Enabled" : "Disabled"}</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleMoveOrder(item, "up")}
                    disabled={index === 0}
                    className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30"
                    title="Move earlier"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleMoveOrder(item, "down")}
                    disabled={index === filteredItems.length - 1}
                    className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30"
                    title="Move later"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="p-12 text-center rounded-3xl bg-zinc-900 border border-zinc-800 space-y-3">
          <ImageIcon className="w-10 h-10 text-zinc-600 mx-auto" />
          <p className="text-sm font-bold text-white">No images in this category</p>
          <p className="text-xs text-zinc-400">Click &quot;+ Add Gallery Image&quot; to upload a new lookbook photograph.</p>
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl animate-scaleIn max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">
                  {editingItem ? "Edit Lookbook Image" : "Add Lookbook Image"}
                </h3>
                <p className="text-xs text-zinc-400">
                  Configure photo details, tags, and display position.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Image Upload / Preview Area */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Gallery Photograph
                </label>

                <div className="space-y-3">
                  {form.imageUrl ? (
                    <div className="relative aspect-video rounded-2xl bg-zinc-950 border border-zinc-800 overflow-hidden group">
                      <Image
                        src={form.imageUrl}
                        alt="Preview"
                        fill
                        className="object-contain"
                      />
                      <div className="absolute inset-0 bg-zinc-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-4 py-2 rounded-xl bg-white text-zinc-950 text-xs font-bold hover:bg-brand-500 hover:text-white transition-colors"
                        >
                          Change File
                        </button>
                        <button
                          type="button"
                          onClick={() => setForm((prev) => ({ ...prev, imageUrl: "" }))}
                          className="px-4 py-2 rounded-xl bg-rose-500/20 text-rose-400 text-xs font-bold hover:bg-rose-500 hover:text-white transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-zinc-800 hover:border-brand-500/60 rounded-2xl p-6 text-center cursor-pointer transition-colors space-y-2 bg-zinc-950/50"
                    >
                      {uploading ? (
                        <div className="flex flex-col items-center justify-center gap-2 py-4">
                          <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
                          <p className="text-xs font-bold text-zinc-300">Uploading & Optimizing...</p>
                        </div>
                      ) : (
                        <>
                          <div className="w-10 h-10 rounded-2xl bg-brand-500/10 text-brand-400 flex items-center justify-center mx-auto">
                            <Upload className="w-5 h-5" />
                          </div>
                          <p className="text-xs font-bold text-white">Click to upload photo</p>
                          <p className="text-[10px] text-zinc-500">
                            JPEG, PNG, WebP, AVIF up to 5MB
                          </p>
                        </>
                      )}
                    </div>
                  )}

                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    onChange={(e) => handleFileUpload(e, "form")}
                  />

                  {/* Or Manual URL Input */}
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      value={form.imageUrl}
                      onChange={(e) => setForm((prev) => ({ ...prev, imageUrl: e.target.value }))}
                      placeholder="Or paste direct image URL (https://...)"
                      className="flex-1 px-4 py-2 text-xs rounded-xl border border-zinc-800 bg-zinc-950 text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                </div>
              </div>

              {/* Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Image Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g. Paris Runway FW26 — Carbon Stride"
                    className="w-full px-4 py-2.5 text-xs rounded-xl border border-zinc-800 bg-zinc-950 text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Category Tag
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-2.5 text-xs rounded-xl border border-zinc-800 bg-zinc-950 text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                  >
                    <option value="WOMEN">Women&apos;s Runway & Track</option>
                    <option value="MEN">Men&apos;s Street & Atelier</option>
                    <option value="EDITORIAL">Editorial & Backstage</option>
                    <option value="STREETWEAR">Streetwear & Culture</option>
                  </select>
                </div>
              </div>

              {/* Shoe Model & Optional Link/CTA */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Featured Footwear Model (Optional)
                  </label>
                  <input
                    type="text"
                    value={form.shoeModel}
                    onChange={(e) => setForm((prev) => ({ ...prev, shoeModel: e.target.value }))}
                    placeholder="e.g. VELOCE NITRO-CARBON 01"
                    className="w-full px-4 py-2.5 text-xs rounded-xl border border-zinc-800 bg-zinc-950 text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Optional CTA / Product Link
                  </label>
                  <input
                    type="text"
                    value={form.link}
                    onChange={(e) => setForm((prev) => ({ ...prev, link: e.target.value }))}
                    placeholder="e.g. /shop or /product/veloce-carbon-strider"
                    className="w-full px-4 py-2.5 text-xs rounded-xl border border-zinc-800 bg-zinc-950 text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Editorial Caption / Description (Optional)
                </label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Styling notes, photographer credits, or location details..."
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-zinc-800 bg-zinc-950 text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              {/* Position & Active Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Sort Order / Position
                  </label>
                  <input
                    type="number"
                    value={form.order}
                    onChange={(e) => setForm((prev) => ({ ...prev, order: Number(e.target.value) }))}
                    className="w-full px-4 py-2.5 text-xs rounded-xl border border-zinc-800 bg-zinc-950 text-white font-mono focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>

                <div className="flex items-center gap-3 pt-6">
                  <input
                    type="checkbox"
                    id="isActiveCheck"
                    checked={form.isActive}
                    onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                    className="w-4 h-4 rounded border-zinc-700 text-brand-500 focus:ring-brand-500"
                  />
                  <label htmlFor="isActiveCheck" className="text-xs font-semibold text-white cursor-pointer">
                    Enable & Display in Public Gallery
                  </label>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-xs font-semibold text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold shadow-md shadow-brand-500/20 disabled:opacity-50 flex items-center gap-2"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingItem ? "Save Changes" : "Add to Gallery"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/85 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-5 shadow-2xl animate-scaleIn">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">Confirm Image Deletion</h4>
                <p className="text-xs text-zinc-400">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-950 p-4 rounded-2xl border border-zinc-800/80">
              Are you sure you want to delete this image?
              <br />
              <strong className="text-white mt-1 block">&ldquo;{deleteConfirmItem.title}&rdquo;</strong>
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmItem(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-md shadow-rose-500/20"
              >
                Delete Image
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
