"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
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
  Layers,
  ArrowRight,
  Play,
} from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";

export interface HeroBannerType {
  id: string;
  heading: string;
  subtitle: string | null;
  badge: string | null;
  imageUrl: string;
  videoUrl?: string | null;
  mediaType?: string | null; // "image" | "video"
  ctaText: string | null;
  ctaLink: string | null;
  order: number;
  isActive: boolean;
  createdAt: string;
}

export function AdminHeroManager({ initialBanners }: { initialBanners: HeroBannerType[] }) {
  const [banners, setBanners] = useState<HeroBannerType[]>(initialBanners);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<HeroBannerType | null>(null);
  const [previewBanner, setPreviewBanner] = useState<HeroBannerType | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<HeroBannerType | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const [replacingItemId, setReplacingItemId] = useState<string | null>(null);

  const { toast } = useToast();

  const [form, setForm] = useState({
    heading: "",
    subtitle: "",
    badge: "SPRING / SUMMER 2026 ARCHIVE",
    imageUrl: "",
    videoUrl: "",
    mediaType: "image" as "image" | "video",
    ctaText: "SHOP THE COLLECTION",
    ctaLink: "/shop",
    order: 0,
    isActive: true,
  });

  const openAddModal = () => {
    setEditingBanner(null);
    setForm({
      heading: "",
      subtitle: "",
      badge: "SPRING / SUMMER 2026 ARCHIVE",
      imageUrl: "",
      videoUrl: "",
      mediaType: "image",
      ctaText: "SHOP THE COLLECTION",
      ctaLink: "/shop",
      order: banners.length + 1,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (banner: HeroBannerType) => {
    setEditingBanner(banner);
    setForm({
      heading: banner.heading,
      subtitle: banner.subtitle || "",
      badge: banner.badge || "SPRING / SUMMER 2026 ARCHIVE",
      imageUrl: banner.imageUrl,
      videoUrl: banner.videoUrl || "",
      mediaType: (banner.mediaType === "video" || !!banner.videoUrl) ? "video" : "image",
      ctaText: banner.ctaText || "SHOP THE COLLECTION",
      ctaLink: banner.ctaLink || "/shop",
      order: banner.order,
      isActive: banner.isActive,
    });
    setIsModalOpen(true);
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    target: "form-image" | "form-video" | "replace",
    itemId?: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith("video/") || file.name.match(/\.(mp4|webm|mov|ogg|mkv)$/i);
    const maxSize = isVideo ? 60 * 1024 * 1024 : 15 * 1024 * 1024;

    if (file.size > maxSize) {
      toast({
        title: "File Too Large",
        description: isVideo
          ? "Video size must be under 60MB."
          : "Image size must be under 15MB for optimal speed.",
        type: "error",
      });
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    if (target === "form-video") {
      setUploadingVideo(true);
    } else {
      setUploading(true);
    }

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (res.ok && data.success) {
        if (target === "form-image") {
          setForm((prev) => ({ ...prev, imageUrl: data.url }));
          toast({
            title: "Image Uploaded",
            description: "File uploaded and ready.",
            type: "success",
          });
        } else if (target === "form-video") {
          setForm((prev) => ({ ...prev, videoUrl: data.url, mediaType: "video" }));
          toast({
            title: "Background Video Uploaded",
            description: "Video file processed and ready for hero playback.",
            type: "success",
          });
        } else if (target === "replace" && itemId) {
          const patchRes = await fetch(`/api/admin/hero/${itemId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageUrl: data.url }),
          });
          if (patchRes.ok) {
            setBanners((prev) =>
              prev.map((b) => (b.id === itemId ? { ...b, imageUrl: data.url } : b))
            );
            toast({
              title: "Hero Media Replaced",
              description: "New hero visual is now live.",
              type: "success",
            });
          }
        }
      } else {
        toast({
          title: "Upload Failed",
          description: data.error || "Could not upload media file.",
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
      setUploadingVideo(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (videoInputRef.current) videoInputRef.current.value = "";
      if (replaceInputRef.current) replaceInputRef.current.value = "";
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.mediaType === "image" && !form.imageUrl) {
      toast({
        title: "Image Required",
        description: "Please upload an image from your device.",
        type: "error",
      });
      return;
    }

    if (form.mediaType === "video" && !form.videoUrl) {
      toast({
        title: "Video Required",
        description: "Please upload a video from your device.",
        type: "error",
      });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        heading: form.heading?.trim() || "VELOCE PERFORMANCE ATELIER",
        ctaText: form.ctaText?.trim() || "SHOP THE COLLECTION",
        ctaLink: form.ctaLink?.trim() || "/shop",
        imageUrl: form.imageUrl || "/images/shop-banner.png",
      };

      if (editingBanner) {
        // PATCH
        const res = await fetch(`/api/admin/hero/${editingBanner.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setBanners(
            banners.map((b) => (b.id === editingBanner.id ? { ...b, ...payload } : b))
          );
          toast({
            title: "Success",
            description: "Hero slide updated successfully!",
            type: "success",
          });
          setIsModalOpen(false);
        } else {
          toast({
            title: "Update Failed",
            description: data.error || "Could not update slide.",
            type: "error",
          });
        }
      } else {
        // POST
        const res = await fetch("/api/admin/hero", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setBanners([data.banner, ...banners]);
          toast({
            title: "Created",
            description: "New hero slide added to homepage!",
            type: "success",
          });
          setIsModalOpen(false);
        } else {
          toast({
            title: "Creation Failed",
            description: data.error || "Could not save hero slide.",
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

  const handleToggleActive = async (banner: HeroBannerType) => {
    const newStatus = !banner.isActive;
    try {
      const res = await fetch(`/api/admin/hero/${banner.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: newStatus }),
      });
      if (res.ok) {
        setBanners(
          banners.map((b) => (b.id === banner.id ? { ...b, isActive: newStatus } : b))
        );
        toast({
          title: newStatus ? "Hero Slide Enabled" : "Hero Slide Disabled",
          description: `Slide is now ${newStatus ? "visible on" : "hidden from"} homepage.`,
          type: "info",
        });
      }
    } catch (e) {
      toast({ title: "Error", description: "Failed to update status.", type: "error" });
    }
  };

  const handleMoveOrder = async (banner: HeroBannerType, direction: "up" | "down") => {
    const currentIndex = banners.findIndex((b) => b.id === banner.id);
    if (currentIndex === -1) return;
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= banners.length) return;

    const newBanners = [...banners];
    const swapItem = newBanners[targetIndex];
    newBanners[currentIndex] = swapItem;
    newBanners[targetIndex] = banner;

    // Recalculate orders
    const updatedWithOrders = newBanners.map((item, idx) => ({ ...item, order: idx + 1 }));
    setBanners(updatedWithOrders);

    try {
      await Promise.all([
        fetch(`/api/admin/hero/${banner.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: targetIndex + 1 }),
        }),
        fetch(`/api/admin/hero/${swapItem.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: currentIndex + 1 }),
        }),
      ]);
      toast({ title: "Order Updated", description: "Hero slide positions synced.", type: "info" });
    } catch (err) {
      toast({ title: "Error", description: "Could not save reordering.", type: "error" });
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirmItem) return;
    const { id } = deleteConfirmItem;
    try {
      const res = await fetch(`/api/admin/hero/${id}`, { method: "DELETE" });
      if (res.ok) {
        setBanners(banners.filter((b) => b.id !== id));
        toast({
          title: "Deleted",
          description: "Hero slide removed.",
          type: "success",
        });
        setDeleteConfirmItem(null);
      } else {
        toast({ title: "Delete Failed", description: "Could not remove slide.", type: "error" });
      }
    } catch (e) {
      toast({ title: "Error", description: "Network error.", type: "error" });
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-500 animate-pulse" />
            <h2 className="text-base font-bold text-white tracking-wide">
              Homepage Hero & Background Video Carousel
            </h2>
          </div>
          <p className="text-xs text-zinc-400">
            Control the hero banners and background videos displayed at the top of the storefront.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span>View Live Site</span>
          </Link>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold shadow-lg shadow-brand-500/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Hero Slide (Image / Video)</span>
          </button>
        </div>
      </div>

      {/* Hidden File Input for in-place Image Replace */}
      <input
        type="file"
        ref={replaceInputRef}
        className="hidden"
        accept="image/*"
        onChange={(e) => handleFileUpload(e, "replace", replacingItemId || undefined)}
      />

      {/* Banners List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {banners.map((banner, index) => {
          const isVideo = (banner.mediaType === "video" || !!banner.videoUrl) && !!banner.videoUrl;

          return (
            <div
              key={banner.id}
              className={`rounded-3xl border transition-all duration-300 overflow-hidden bg-zinc-950 flex flex-col justify-between ${
                banner.isActive
                  ? "border-zinc-800 hover:border-zinc-700 shadow-md"
                  : "border-zinc-800/40 opacity-60 bg-zinc-950/40"
              }`}
            >
              {/* Visual Banner Preview Thumbnail */}
              <div className="relative aspect-[16/9] w-full bg-zinc-900 overflow-hidden group">
                {isVideo ? (
                  <video
                    src={banner.videoUrl || ""}
                    poster={banner.imageUrl || undefined}
                    muted
                    loop
                    playsInline
                    autoPlay
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Image
                    src={banner.imageUrl || "/images/shop-banner.png"}
                    alt={banner.heading}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}

                {/* Dark Gradient Overlay for preview readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent pointer-events-none" />

                {/* Slide Status & Media Badges */}
                <div className="absolute top-3.5 left-3.5 flex items-center gap-2 z-10">
                  <span className="px-2.5 py-1 rounded-full bg-zinc-950/80 backdrop-blur-md text-[10px] font-bold text-white font-mono border border-zinc-800">
                    Slide #{index + 1}
                  </span>
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
                  {banner.isActive ? (
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 backdrop-blur-md text-[10px] font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      Active
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-400 text-[10px] font-semibold">
                      Disabled
                    </span>
                  )}
                </div>

                {/* Heading & Subtitle preview */}
                <div className="absolute bottom-3 left-4 right-4 z-10 space-y-1 text-left">
                  {banner.badge && (
                    <span className="text-[9px] font-extrabold uppercase tracking-widest text-brand-400">
                      {banner.badge}
                    </span>
                  )}
                  <h4 className="text-sm sm:text-base font-bold text-white line-clamp-1">
                    {banner.heading}
                  </h4>
                </div>

                {/* Hover Quick Actions */}
                <div className="absolute inset-0 bg-zinc-950/70 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2.5 z-20">
                  <button
                    onClick={() => setPreviewBanner(banner)}
                    title="Live Homepage Simulation"
                    className="p-2.5 rounded-xl bg-white text-zinc-950 hover:bg-brand-500 hover:text-white transition-colors shadow-lg"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openEditModal(banner)}
                    title="Edit Slide Details"
                    className="p-2.5 rounded-xl bg-zinc-800 text-white hover:bg-zinc-700 transition-colors shadow-lg"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmItem(banner)}
                    title="Delete slide"
                    className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white transition-colors shadow-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Slide Metadata & Action Bar */}
              <div className="p-4 space-y-3 bg-zinc-900">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <div>
                    <span className="font-mono text-zinc-500 text-[11px]">CTA: </span>
                    <span className="font-bold text-white">{banner.ctaText || "None"}</span>
                  </div>
                  <div className="font-mono text-[11px] text-zinc-500 truncate max-w-[160px]">
                    Link: {banner.ctaLink || "/shop"}
                  </div>
                </div>

                {/* Bottom Row: Toggle & Reorder Buttons */}
                <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleToggleActive(banner)}
                    className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors ${
                      banner.isActive
                        ? "text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20"
                        : "text-zinc-400 bg-zinc-800 hover:bg-zinc-700"
                    }`}
                  >
                    {banner.isActive ? (
                      <ToggleRight className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <ToggleLeft className="w-4 h-4 text-zinc-500" />
                    )}
                    <span>{banner.isActive ? "Active on Homepage" : "Disabled"}</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleMoveOrder(banner, "up")}
                      disabled={index === 0}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30"
                      title="Move slide earlier"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleMoveOrder(banner, "down")}
                      disabled={index === banners.length - 1}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30"
                      title="Move slide later"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {banners.length === 0 && (
        <div className="p-12 text-center rounded-3xl bg-zinc-900 border border-zinc-800 space-y-3">
          <Layers className="w-10 h-10 text-zinc-600 mx-auto" />
          <p className="text-sm font-bold text-white">No custom hero slides configured</p>
          <p className="text-xs text-zinc-400">
            The homepage will use default high-performance fallback shoes until you add custom slides or background videos.
          </p>
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl animate-scaleIn max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">
                  {editingBanner ? "Edit Hero Banner Slide" : "Add New Hero Banner Slide"}
                </h3>
                <p className="text-xs text-zinc-400">
                  Configure background visual (Image or Video), typography, and CTA button.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              {/* Media Type Selector (Image vs Video) */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-2">
                  Hero Background Media Type *
                </label>
                <div className="grid grid-cols-2 gap-3 p-1.5 bg-zinc-950 rounded-2xl border border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, mediaType: "image" }))}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      form.mediaType === "image"
                        ? "bg-brand-500 text-white shadow-md shadow-brand-500/20"
                        : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                    }`}
                  >
                    <ImageIcon className="w-4 h-4" />
                    <span>Image Background</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, mediaType: "video" }))}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      form.mediaType === "video"
                        ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
                        : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                    }`}
                  >
                    <Film className="w-4 h-4" />
                    <span>Video Background (MP4 / WebM)</span>
                  </button>
                </div>
              </div>

              {/* Video Media Controls */}
              {form.mediaType === "video" ? (
                <div className="space-y-3 p-4 rounded-2xl bg-zinc-950/60 border border-purple-500/20">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-purple-300">
                      Background Video Source *
                    </label>
                    <span className="text-[10px] text-zinc-500">MP4, WebM, QuickTime up to 60MB</span>
                  </div>

                  {form.videoUrl ? (
                    <div className="relative aspect-video rounded-2xl bg-zinc-950 border border-zinc-800 overflow-hidden group">
                      <video
                        src={form.videoUrl}
                        controls
                        muted
                        loop
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setForm((prev) => ({ ...prev, videoUrl: "" }))}
                          className="px-3 py-1.5 rounded-lg bg-rose-500/80 text-white text-[10px] font-bold hover:bg-rose-600 transition-colors shadow-lg"
                        >
                          Remove Video
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => videoInputRef.current?.click()}
                      className="border-2 border-dashed border-purple-500/30 hover:border-purple-500/80 rounded-2xl p-6 text-center cursor-pointer transition-colors space-y-2 bg-purple-500/5"
                    >
                      {uploadingVideo ? (
                        <div className="flex flex-col items-center justify-center gap-2 py-4">
                          <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
                          <p className="text-xs font-bold text-zinc-300">Uploading Video...</p>
                        </div>
                      ) : (
                        <>
                          <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-300 flex items-center justify-center mx-auto">
                            <Video className="w-5 h-5" />
                          </div>
                          <p className="text-xs font-bold text-white">Click to upload background video file</p>
                          <p className="text-[10px] text-zinc-500">
                            Supports direct .mp4, .webm, .mov files
                          </p>
                        </>
                      )}
                    </div>
                  )}

                  <input
                    type="file"
                    ref={videoInputRef}
                    className="hidden"
                    accept="video/mp4,video/webm,video/ogg,video/quicktime,video/*"
                    onChange={(e) => handleFileUpload(e, "form-video")}
                  />

                  <div className="pt-1">
                    <input
                      type="url"
                      value={form.videoUrl}
                      onChange={(e) => setForm((prev) => ({ ...prev, videoUrl: e.target.value }))}
                      placeholder="Or paste direct video stream / CDN URL (https://...mp4)"
                      className="w-full px-4 py-2.5 text-xs rounded-xl border border-zinc-800 bg-zinc-950 text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>

                  {/* Optional Poster Image for Video */}
                  <div className="pt-2 border-t border-zinc-800/80">
                    <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                      Fallback Poster Image (Optional, for instant mobile loading)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={form.imageUrl}
                        onChange={(e) => setForm((prev) => ({ ...prev, imageUrl: e.target.value }))}
                        placeholder="Poster image URL (e.g. /images/shop-banner.png)"
                        className="flex-1 px-3 py-2 text-xs rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-300 focus:outline-none focus:ring-1 focus:ring-brand-500"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold shrink-0"
                      >
                        Upload Poster
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Image Upload Area */
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Hero Image Visual *
                  </label>

                  <div className="space-y-3">
                    {form.imageUrl ? (
                      <div className="relative aspect-video rounded-2xl bg-zinc-950 border border-zinc-800 overflow-hidden group">
                        <Image
                          src={form.imageUrl}
                          alt="Hero Preview"
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-zinc-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-4 py-2 rounded-xl bg-white text-zinc-950 text-xs font-bold hover:bg-brand-500 hover:text-white transition-colors"
                          >
                            Change Image
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
                            <p className="text-xs font-bold text-zinc-300">Uploading Image...</p>
                          </div>
                        ) : (
                          <>
                            <div className="w-10 h-10 rounded-2xl bg-brand-500/10 text-brand-400 flex items-center justify-center mx-auto">
                              <Upload className="w-5 h-5" />
                            </div>
                            <p className="text-xs font-bold text-white">Click to upload hero image</p>
                            <p className="text-[10px] text-zinc-500">
                              Recommended: 1920x1080 WebP/PNG/JPEG under 15MB
                            </p>
                          </>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <input
                        type="url"
                        value={form.imageUrl}
                        onChange={(e) => setForm((prev) => ({ ...prev, imageUrl: e.target.value }))}
                        placeholder="Or paste direct hero image URL (https://...)"
                        className="flex-1 px-4 py-2 text-xs rounded-xl border border-zinc-800 bg-zinc-950 text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Hidden file input for image upload */}
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/jpeg,image/png,image/webp,image/avif"
                onChange={(e) => handleFileUpload(e, "form-image")}
              />

              {/* Badge & Heading */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Badge / Tag
                  </label>
                  <input
                    type="text"
                    value={form.badge}
                    onChange={(e) => setForm((prev) => ({ ...prev, badge: e.target.value }))}
                    placeholder="SPRING / SUMMER 2026 ARCHIVE"
                    className="w-full px-4 py-2.5 text-xs rounded-xl border border-zinc-800 bg-zinc-950 text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Main Hero Headline *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.heading}
                    onChange={(e) => setForm((prev) => ({ ...prev, heading: e.target.value }))}
                    placeholder="ENGINEERED PROPULSION. TAILORED FORM."
                    className="w-full px-4 py-2.5 text-xs rounded-xl border border-zinc-800 bg-zinc-950 text-white font-bold focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
              </div>

              {/* Subtitle */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Hero Subtitle / Description
                </label>
                <textarea
                  rows={2}
                  value={form.subtitle}
                  onChange={(e) => setForm((prev) => ({ ...prev, subtitle: e.target.value }))}
                  placeholder="Step into the apex of international footwear. Supercritical nitrogen foam fused with aerospace carbon plates."
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-zinc-800 bg-zinc-950 text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              {/* CTA Text & Link */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Button CTA Text
                  </label>
                  <input
                    type="text"
                    value={form.ctaText}
                    onChange={(e) => setForm((prev) => ({ ...prev, ctaText: e.target.value }))}
                    placeholder="SHOP THE COLLECTION"
                    className="w-full px-4 py-2.5 text-xs rounded-xl border border-zinc-800 bg-zinc-950 text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Button Link Destination
                  </label>
                  <input
                    type="text"
                    value={form.ctaLink}
                    onChange={(e) => setForm((prev) => ({ ...prev, ctaLink: e.target.value }))}
                    placeholder="/shop or /category/road-racing"
                    className="w-full px-4 py-2.5 text-xs rounded-xl border border-zinc-800 bg-zinc-950 text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
              </div>

              {/* Order & Active */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Slide Position
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
                    id="isHeroActiveCheck"
                    checked={form.isActive}
                    onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                    className="w-4 h-4 rounded border-zinc-700 text-brand-500 focus:ring-brand-500"
                  />
                  <label htmlFor="isHeroActiveCheck" className="text-xs font-semibold text-white cursor-pointer">
                    Display as Active Slide on Homepage
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
                  disabled={saving || uploading || uploadingVideo}
                  className="px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold shadow-md shadow-brand-500/20 disabled:opacity-50 flex items-center gap-2"
                >
                  {(saving || uploading || uploadingVideo) && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingBanner ? "Save Slide" : "Launch Hero Slide"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Interactive Full Preview Modal */}
      {previewBanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-zinc-950/90 backdrop-blur-xl animate-fadeIn">
          <div className="relative w-full max-w-5xl bg-zinc-950 rounded-3xl border border-zinc-800 overflow-hidden shadow-2xl text-white">
            <button
              onClick={() => setPreviewBanner(null)}
              className="absolute top-4 right-4 z-30 w-9 h-9 rounded-full bg-zinc-900/80 text-white flex items-center justify-center hover:bg-white hover:text-zinc-950 transition-colors border border-zinc-800"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Simulating Homepage Hero Render */}
            <div className="relative min-h-[460px] sm:min-h-[540px] flex items-center p-8 sm:p-14 overflow-hidden">
              {((previewBanner.mediaType === "video" || !!previewBanner.videoUrl) && !!previewBanner.videoUrl) ? (
                <video
                  src={previewBanner.videoUrl || ""}
                  poster={previewBanner.imageUrl || undefined}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                />
              ) : (
                <Image
                  src={previewBanner.imageUrl || "/images/shop-banner.png"}
                  alt={previewBanner.heading}
                  fill
                  className="object-cover pointer-events-none"
                />
              )}

              <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent pointer-events-none" />

              <div className="relative z-10 max-w-xl space-y-4">
                {previewBanner.badge && (
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/90 text-brand-400 text-[11px] font-bold border border-zinc-800 backdrop-blur-md">
                    <Sparkles className="w-3 h-3 text-brand-500" />
                    <span>{previewBanner.badge}</span>
                  </div>
                )}

                <h1 className="text-3xl sm:text-5xl font-display font-black tracking-tight leading-tight">
                  {previewBanner.heading}
                </h1>

                {previewBanner.subtitle && (
                  <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-md">
                    {previewBanner.subtitle}
                  </p>
                )}

                <div className="pt-2">
                  <span className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white text-zinc-950 text-xs font-bold shadow-xl">
                    <span>{previewBanner.ctaText || "SHOP THE COLLECTION"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </div>
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
                <h4 className="text-base font-bold text-white">Confirm Hero Slide Deletion</h4>
                <p className="text-xs text-zinc-400">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-950 p-4 rounded-2xl border border-zinc-800/80">
              Are you sure you want to delete this hero banner?
              <br />
              <strong className="text-white mt-1 block">&ldquo;{deleteConfirmItem.heading}&rdquo;</strong>
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
                Delete Hero Slide
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
