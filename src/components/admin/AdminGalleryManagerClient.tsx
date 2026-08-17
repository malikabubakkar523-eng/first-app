"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import {
  Plus,
  Trash2,
  Edit3,
  Image as ImageIcon,
  Video,
  Film,
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
  Layers,
} from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";

export interface GalleryItemType {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  videoUrl?: string | null;
  mediaType?: string | null; // "image" | "video"
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
  const [previewItem, setPreviewItem] = useState<GalleryItemType | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<GalleryItemType | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("ALL");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const { toast } = useToast();

  const [form, setForm] = useState({
    title: "",
    category: "ALL",
    imageUrl: "",
    videoUrl: "",
    mediaType: "image" as "image" | "video",
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
      category: "ALL",
      imageUrl: "",
      videoUrl: "",
      mediaType: "image",
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
      videoUrl: item.videoUrl || "",
      mediaType: (item.mediaType === "video" || !!item.videoUrl) ? "video" : "image",
      description: item.description || "",
      shoeModel: item.shoeModel || "",
      link: item.link || "",
      order: item.order,
      isActive: item.isActive,
    });
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "video") => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = type === "video";
    const maxSize = isVideo ? 60 * 1024 * 1024 : 15 * 1024 * 1024;

    if (file.size > maxSize) {
      toast({
        title: "File Too Large",
        description: isVideo ? "Video must be under 60MB." : "Image must be under 15MB.",
        type: "error",
      });
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    if (isVideo) setUploadingVideo(true);
    else setUploadingImage(true);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (res.ok && data.success) {
        if (isVideo) {
          setForm((prev) => ({ ...prev, videoUrl: data.url, mediaType: "video" }));
          toast({
            title: "Gallery Video Uploaded",
            description: "Video is ready for gallery display.",
            type: "success",
          });
        } else {
          setForm((prev) => ({ ...prev, imageUrl: data.url }));
          toast({
            title: "Gallery Image Uploaded",
            description: "Image uploaded and applied.",
            type: "success",
          });
        }
      } else {
        toast({
          title: "Upload Failed",
          description: data.error || "Could not upload file.",
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
      setUploadingImage(false);
      setUploadingVideo(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (videoInputRef.current) videoInputRef.current.value = "";
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title) {
      toast({
        title: "Validation Error",
        description: "Title is required.",
        type: "error",
      });
      return;
    }

    if (form.mediaType === "image" && !form.imageUrl) {
      toast({
        title: "Validation Error",
        description: "Image is required for image gallery item.",
        type: "error",
      });
      return;
    }

    if (form.mediaType === "video" && !form.videoUrl) {
      toast({
        title: "Validation Error",
        description: "Please upload a video or enter video URL.",
        type: "error",
      });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        imageUrl: form.imageUrl || "/images/shop-banner.png",
      };

      if (editingItem) {
        const res = await fetch(`/api/admin/gallery/${editingItem.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setItems(items.map((i) => (i.id === editingItem.id ? { ...i, ...payload } : i)));
          toast({
            title: "Success",
            description: "Gallery item updated successfully!",
            type: "success",
          });
          setIsModalOpen(false);
        } else {
          toast({
            title: "Update Failed",
            description: data.error || "Could not update gallery item.",
            type: "error",
          });
        }
      } else {
        const res = await fetch("/api/admin/gallery", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setItems([data.item, ...items]);
          toast({
            title: "Created",
            description: "New item added to lookbook gallery!",
            type: "success",
          });
          setIsModalOpen(false);
        } else {
          toast({
            title: "Creation Failed",
            description: data.error || "Could not save gallery item.",
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
          title: newStatus ? "Item Published" : "Item Hidden",
          description: `Gallery item is now ${newStatus ? "visible" : "hidden"}.`,
          type: "info",
        });
      }
    } catch (e) {
      toast({ title: "Error", description: "Failed to update status.", type: "error" });
    }
  };

  const handleMoveOrder = async (item: GalleryItemType, direction: "up" | "down") => {
    const currentIndex = items.findIndex((i) => i.id === item.id);
    if (currentIndex === -1) return;
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const newItems = [...items];
    const swapItem = newItems[targetIndex];
    newItems[currentIndex] = swapItem;
    newItems[targetIndex] = item;

    const updatedWithOrders = newItems.map((it, idx) => ({ ...it, order: idx + 1 }));
    setItems(updatedWithOrders);

    try {
      await Promise.all([
        fetch(`/api/admin/gallery/${item.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: targetIndex + 1 }),
        }),
        fetch(`/api/admin/gallery/${swapItem.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: currentIndex + 1 }),
        }),
      ]);
      toast({ title: "Order Updated", description: "Positions synced.", type: "info" });
    } catch (err) {
      toast({ title: "Error", description: "Could not save reordering.", type: "error" });
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirmItem) return;
    const { id } = deleteConfirmItem;
    try {
      const res = await fetch(`/api/admin/gallery/${id}`, { method: "DELETE" });
      if (res.ok) {
        setItems(items.filter((i) => i.id !== id));
        toast({
          title: "Deleted",
          description: "Gallery item removed.",
          type: "success",
        });
        setDeleteConfirmItem(null);
      } else {
        toast({ title: "Delete Failed", description: "Could not remove item.", type: "error" });
      }
    } catch (e) {
      toast({ title: "Error", description: "Network error.", type: "error" });
    }
  };

  const filteredItems = items.filter(
    (item) => filterCategory === "ALL" || item.category.toUpperCase() === filterCategory.toUpperCase()
  );

  return (
    <div className="space-y-8">
      {/* Top Banner Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-500 animate-pulse" />
            <h2 className="text-base font-bold text-white tracking-wide">
              Lookbook Gallery Media Management (Image & Video)
            </h2>
          </div>
          <p className="text-xs text-zinc-400">
            Showcase customer on-feet styling, product lifestyle shoots, and cinematic action videos.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold shadow-lg shadow-brand-500/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Gallery Item (Image / Video)</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {["ALL", "MEN", "WOMEN", "STREETWEAR", "RUNNING", "EDITORIAL"].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
              filterCategory === cat
                ? "bg-white text-zinc-950 shadow-md"
                : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Gallery Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredItems.map((item, index) => {
          const isVideo = (item.mediaType === "video" || !!item.videoUrl) && !!item.videoUrl;

          return (
            <div
              key={item.id}
              className={`group rounded-3xl border transition-all duration-300 overflow-hidden bg-zinc-950 flex flex-col justify-between ${
                item.isActive
                  ? "border-zinc-800 hover:border-zinc-700 shadow-md"
                  : "border-zinc-800/40 opacity-60 bg-zinc-950/40"
              }`}
            >
              {/* Media Thumbnail Container */}
              <div className="relative aspect-[3/4] w-full bg-zinc-900 overflow-hidden">
                {isVideo ? (
                  <video
                    src={item.videoUrl || ""}
                    poster={item.imageUrl || undefined}
                    muted
                    loop
                    playsInline
                    autoPlay
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Image
                    src={item.imageUrl || "/images/shop-banner.png"}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/30 to-transparent pointer-events-none" />

                {/* Badges */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
                  {isVideo ? (
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 backdrop-blur-md text-[10px] font-bold">
                      <Film className="w-3 h-3" />
                      <span>VIDEO</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 backdrop-blur-md text-[10px] font-bold">
                      <ImageIcon className="w-3 h-3" />
                      <span>IMAGE</span>
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded-full bg-zinc-900/90 text-zinc-300 text-[10px] font-mono border border-zinc-700">
                    {item.category}
                  </span>
                </div>

                {/* Bottom Details */}
                <div className="absolute bottom-3 left-3 right-3 z-10 space-y-0.5">
                  <h4 className="text-sm font-bold text-white line-clamp-1">{item.title}</h4>
                  {item.shoeModel && (
                    <p className="text-[11px] text-brand-400 font-medium line-clamp-1">{item.shoeModel}</p>
                  )}
                </div>

                {/* Hover Action Overlay */}
                <div className="absolute inset-0 bg-zinc-950/70 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 z-20">
                  <button
                    onClick={() => setPreviewItem(item)}
                    title="Preview Item"
                    className="p-2.5 rounded-xl bg-white text-zinc-950 hover:bg-brand-500 hover:text-white transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openEditModal(item)}
                    title="Edit Item"
                    className="p-2.5 rounded-xl bg-zinc-800 text-white hover:bg-zinc-700 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmItem(item)}
                    title="Delete Item"
                    className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Bottom Reorder & Status Footer */}
              <div className="p-3 bg-zinc-900 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleToggleActive(item)}
                  className={`flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-lg transition-colors ${
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
                  <span className="text-[11px]">{item.isActive ? "Active" : "Hidden"}</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleMoveOrder(item, "up")}
                    disabled={index === 0}
                    className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleMoveOrder(item, "down")}
                    disabled={index === items.length - 1}
                    className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="p-12 text-center rounded-3xl bg-zinc-900 border border-zinc-800 space-y-3">
          <Layers className="w-10 h-10 text-zinc-600 mx-auto" />
          <p className="text-sm font-bold text-white">No lookbook gallery items found</p>
          <p className="text-xs text-zinc-400">Click &ldquo;Add Gallery Item&rdquo; to add photos or videos to the gallery.</p>
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl animate-scaleIn max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">
                  {editingItem ? "Edit Gallery Item" : "Add Lookbook Gallery Item"}
                </h3>
                <p className="text-xs text-zinc-400">Choose Image or Video format for this lookbook item.</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Media Type Selector */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-2">Media Type *</label>
                <div className="grid grid-cols-2 gap-3 p-1.5 bg-zinc-950 rounded-2xl border border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, mediaType: "image" }))}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      form.mediaType === "image"
                        ? "bg-brand-500 text-white shadow-md"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    <ImageIcon className="w-4 h-4" />
                    <span>Image</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, mediaType: "video" }))}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      form.mediaType === "video"
                        ? "bg-purple-600 text-white shadow-md"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    <Film className="w-4 h-4" />
                    <span>Video (MP4 / WebM)</span>
                  </button>
                </div>
              </div>

              {/* Video Controls */}
              {form.mediaType === "video" ? (
                <div className="space-y-3 p-4 rounded-2xl bg-zinc-950/70 border border-purple-500/30">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-purple-300">Video File / URL *</label>
                    <span className="text-[10px] text-zinc-500">MP4, WebM up to 60MB</span>
                  </div>

                  {form.videoUrl ? (
                    <div className="relative aspect-video rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden">
                      <video src={form.videoUrl} controls muted loop className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, videoUrl: "" }))}
                        className="absolute top-2 right-2 px-2.5 py-1 rounded bg-rose-500/80 text-white text-[10px] font-bold"
                      >
                        Remove Video
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => videoInputRef.current?.click()}
                      className="border-2 border-dashed border-purple-500/30 hover:border-purple-500/80 rounded-xl p-5 text-center cursor-pointer space-y-1.5 bg-purple-500/5"
                    >
                      {uploadingVideo ? (
                        <Loader2 className="w-6 h-6 text-purple-400 animate-spin mx-auto" />
                      ) : (
                        <>
                          <Video className="w-6 h-6 text-purple-400 mx-auto" />
                          <p className="text-xs font-bold text-white">Click to upload gallery video</p>
                        </>
                      )}
                    </div>
                  )}

                  <input
                    type="file"
                    ref={videoInputRef}
                    className="hidden"
                    accept="video/*"
                    onChange={(e) => handleFileUpload(e, "video")}
                  />

                  <input
                    type="url"
                    value={form.videoUrl || ""}
                    onChange={(e) => setForm((prev) => ({ ...prev, videoUrl: e.target.value }))}
                    placeholder="Or enter direct video stream URL (https://...mp4)"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-zinc-800 bg-zinc-950 text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
              ) : (
                /* Image Controls */
                <div className="space-y-3 p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800">
                  <label className="block text-xs font-semibold text-zinc-300">Image Visual *</label>
                  {form.imageUrl ? (
                    <div className="relative aspect-video rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden group">
                      <Image src={form.imageUrl} alt="Preview" fill className="object-cover" />
                      <div className="absolute inset-0 bg-zinc-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3 py-1.5 rounded-lg bg-white text-zinc-950 text-xs font-bold"
                        >
                          Change
                        </button>
                        <button
                          type="button"
                          onClick={() => setForm((prev) => ({ ...prev, imageUrl: "" }))}
                          className="px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-400 text-xs font-bold"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-zinc-800 hover:border-brand-500/60 rounded-xl p-5 text-center cursor-pointer space-y-1.5 bg-zinc-950/50"
                    >
                      {uploadingImage ? (
                        <Loader2 className="w-6 h-6 text-brand-500 animate-spin mx-auto" />
                      ) : (
                        <>
                          <Upload className="w-6 h-6 text-brand-400 mx-auto" />
                          <p className="text-xs font-bold text-white">Click to upload photo</p>
                        </>
                      )}
                    </div>
                  )}

                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, "image")}
                  />

                  <input
                    type="text"
                    value={form.imageUrl}
                    onChange={(e) => setForm((prev) => ({ ...prev, imageUrl: e.target.value }))}
                    placeholder="Or enter direct image URL (https://...)"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-zinc-800 bg-zinc-950 text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
              )}

              {/* Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="E.g. Milan Fashion Week On-Feet"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-zinc-800 bg-zinc-950 text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-zinc-800 bg-zinc-950 text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                  >
                    <option value="ALL">ALL</option>
                    <option value="MEN">MEN</option>
                    <option value="WOMEN">WOMEN</option>
                    <option value="STREETWEAR">STREETWEAR</option>
                    <option value="RUNNING">RUNNING</option>
                    <option value="EDITORIAL">EDITORIAL</option>
                  </select>
                </div>
              </div>

              {/* Shoe Model & Link */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Shoe Model / Tag</label>
                  <input
                    type="text"
                    value={form.shoeModel}
                    onChange={(e) => setForm((prev) => ({ ...prev, shoeModel: e.target.value }))}
                    placeholder="E.g. VELOCE Carbon Prototype X"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-zinc-800 bg-zinc-950 text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Shop Product Link</label>
                  <input
                    type="text"
                    value={form.link}
                    onChange={(e) => setForm((prev) => ({ ...prev, link: e.target.value }))}
                    placeholder="/shop or /product/slug"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-zinc-800 bg-zinc-950 text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Caption / Story</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Styled with oversized trench and tailored track trousers."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-zinc-800 bg-zinc-950 text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="galleryActiveCheck"
                  checked={form.isActive}
                  onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                  className="w-4 h-4 rounded border-zinc-700 text-brand-500 focus:ring-brand-500"
                />
                <label htmlFor="galleryActiveCheck" className="text-xs font-semibold text-white cursor-pointer">
                  Visible in public Lookbook Gallery
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || uploadingImage || uploadingVideo}
                  className="px-5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold disabled:opacity-50 flex items-center gap-2"
                >
                  {(saving || uploadingImage || uploadingVideo) && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingItem ? "Save Changes" : "Add to Gallery"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/90 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
            <button
              onClick={() => setPreviewItem(null)}
              className="absolute top-4 right-4 z-30 w-8 h-8 rounded-full bg-zinc-950/80 text-white flex items-center justify-center hover:bg-white hover:text-zinc-950 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="relative aspect-[3/4] w-full bg-zinc-950">
              {((previewItem.mediaType === "video" || !!previewItem.videoUrl) && !!previewItem.videoUrl) ? (
                <video
                  src={previewItem.videoUrl || ""}
                  poster={previewItem.imageUrl || undefined}
                  autoPlay
                  controls
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <Image src={previewItem.imageUrl} alt={previewItem.title} fill className="object-cover" />
              )}
            </div>

            <div className="p-6 space-y-2">
              <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-brand-400">
                {previewItem.category}
              </span>
              <h3 className="text-base font-bold text-white">{previewItem.title}</h3>
              {previewItem.shoeModel && <p className="text-xs text-brand-400">{previewItem.shoeModel}</p>}
              {previewItem.description && <p className="text-xs text-zinc-300">{previewItem.description}</p>}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirmItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/85 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-4 shadow-2xl animate-scaleIn">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Delete Gallery Item</h4>
                <p className="text-[11px] text-zinc-400">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-zinc-300">
              Are you sure you want to remove &ldquo;<strong>{deleteConfirmItem.title}</strong>&rdquo;?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmItem(null)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
