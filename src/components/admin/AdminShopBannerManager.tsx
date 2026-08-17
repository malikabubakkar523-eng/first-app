"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Image as ImageIcon,
  Video,
  Film,
  Sparkles,
  ExternalLink,
  Upload,
  Loader2,
  Check,
  Eye,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";

export interface ShopBannerType {
  id: string;
  badge: string | null;
  heading: string;
  subtitle: string | null;
  imageUrl: string;
  videoUrl?: string | null;
  mediaType: "image" | "video";
  ctaText: string | null;
  ctaLink: string | null;
  isActive: boolean;
}

export function AdminShopBannerManager({ initialBanner }: { initialBanner: ShopBannerType }) {
  const [form, setForm] = useState<ShopBannerType>(initialBanner);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "image" | "video"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = type === "video";
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
            title: "Shop Video Uploaded",
            description: "Video uploaded and ready for Shop page playback.",
            type: "success",
          });
        } else {
          setForm((prev) => ({ ...prev, imageUrl: data.url }));
          toast({
            title: "Shop Banner Image Uploaded",
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
      if (imageInputRef.current) imageInputRef.current.value = "";
      if (videoInputRef.current) videoInputRef.current.value = "";
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

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
        heading: form.heading?.trim() || "FRESH STYLES. BOLD MOVES.",
        ctaText: form.ctaText?.trim() || "SHOP NEW ARRIVALS",
        ctaLink: form.ctaLink?.trim() || "/shop",
        imageUrl: form.imageUrl || "/images/shop-banner.png",
      };

      const res = await fetch("/api/admin/shop-banner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setForm(data.banner);
        toast({
          title: "Saved Successfully",
          description: "Shop page banner is now updated live!",
          type: "success",
        });
      } else {
        toast({
          title: "Save Failed",
          description: data.error || "Could not save shop banner.",
          type: "error",
        });
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

  const isVideo = form.mediaType === "video" && !!form.videoUrl;

  return (
    <div className="space-y-8">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-500 animate-pulse" />
            <h2 className="text-base font-bold text-white tracking-wide">
              Shop Page Top Banner Media Management
            </h2>
          </div>
          <p className="text-xs text-zinc-400">
            Customize the top banner of the Shop catalog page with high-res Image or full cinematic Video background.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/shop"
            target="_blank"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span>View Live Shop</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Media & Content Configuration Form */}
        <div className="lg:col-span-7 bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <form onSubmit={handleSave} className="space-y-6">
            {/* Media Type Selector */}
            <div>
              <label className="block text-xs font-bold text-zinc-200 uppercase tracking-wider mb-2">
                Banner Media Type *
              </label>
              <div className="grid grid-cols-2 gap-3 p-1.5 bg-zinc-950 rounded-2xl border border-zinc-800">
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, mediaType: "image" }))}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all ${
                    form.mediaType === "image"
                      ? "bg-brand-500 text-white shadow-md shadow-brand-500/20"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                  }`}
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>Image Banner</span>
                </button>

                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, mediaType: "video" }))}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all ${
                    form.mediaType === "video"
                      ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                  }`}
                >
                  <Film className="w-4 h-4" />
                  <span>Video Banner (MP4 / WebM)</span>
                </button>
              </div>
            </div>

            {/* Video Controls */}
            {form.mediaType === "video" ? (
              <div className="space-y-4 p-5 rounded-2xl bg-zinc-950/70 border border-purple-500/30">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-purple-300">
                    Background Video File / Stream *
                  </label>
                  <span className="text-[10px] text-zinc-500">MP4, WebM, MOV up to 60MB</span>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => videoInputRef.current?.click()}
                    disabled={uploadingVideo}
                    className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
                  >
                    {uploadingVideo ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    <span>{form.videoUrl ? "Replace Video File" : "Upload Video File"}</span>
                  </button>

                  {form.videoUrl && (
                    <button
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, videoUrl: "" }))}
                      className="px-4 py-2.5 rounded-xl bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white text-xs font-bold transition-colors"
                    >
                      Remove Video
                    </button>
                  )}
                </div>

                <input
                  type="file"
                  ref={videoInputRef}
                  className="hidden"
                  accept="video/mp4,video/webm,video/ogg,video/quicktime,video/*"
                  onChange={(e) => handleFileUpload(e, "video")}
                />

                <div>
                  <input
                    type="url"
                    value={form.videoUrl || ""}
                    onChange={(e) => setForm((prev) => ({ ...prev, videoUrl: e.target.value }))}
                    placeholder="Or enter direct video stream URL (https://...mp4)"
                    className="w-full px-4 py-2.5 text-xs rounded-xl border border-zinc-800 bg-zinc-950 text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                {/* Optional Fallback Poster */}
                <div className="pt-3 border-t border-zinc-800/80">
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1.5">
                    Poster / Fallback Image (Shown while video loads)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={form.imageUrl}
                      onChange={(e) => setForm((prev) => ({ ...prev, imageUrl: e.target.value }))}
                      placeholder="/images/shop-banner.png"
                      className="flex-1 px-3 py-2 text-xs rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-300 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                    <button
                      type="button"
                      onClick={() => imageInputRef.current?.click()}
                      className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold shrink-0"
                    >
                      Upload Poster
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Image Controls */
              <div className="space-y-4 p-5 rounded-2xl bg-zinc-950/70 border border-zinc-800">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-zinc-200">
                    Banner Background Image *
                  </label>
                  <span className="text-[10px] text-zinc-500">1920x600 WebP/PNG/JPEG</span>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
                  >
                    {uploadingImage ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    <span>{form.imageUrl ? "Replace Image File" : "Upload Image File"}</span>
                  </button>

                  {form.imageUrl && form.imageUrl !== "/images/shop-banner.png" && (
                    <button
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, imageUrl: "/images/shop-banner.png" }))}
                      className="px-4 py-2.5 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white text-xs font-semibold transition-colors"
                    >
                      Reset to Default
                    </button>
                  )}
                </div>

                <div>
                  <input
                    type="text"
                    value={form.imageUrl}
                    onChange={(e) => setForm((prev) => ({ ...prev, imageUrl: e.target.value }))}
                    placeholder="Or enter direct image URL (https://...)"
                    className="w-full px-4 py-2.5 text-xs rounded-xl border border-zinc-800 bg-zinc-950 text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
              </div>
            )}

            <input
              type="file"
              ref={imageInputRef}
              className="hidden"
              accept="image/*"
              onChange={(e) => handleFileUpload(e, "image")}
            />

            {/* Typography & CTA Fields */}
            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Badge Tagline
                </label>
                <input
                  type="text"
                  value={form.badge || ""}
                  onChange={(e) => setForm((prev) => ({ ...prev, badge: e.target.value }))}
                  placeholder="NEW ARRIVALS • SPRING/SUMMER 2026"
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-zinc-800 bg-zinc-950 text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Banner Headline *
                </label>
                <input
                  type="text"
                  required
                  value={form.heading}
                  onChange={(e) => setForm((prev) => ({ ...prev, heading: e.target.value }))}
                  placeholder="FRESH STYLES. BOLD MOVES."
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-zinc-800 bg-zinc-950 text-white font-bold focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Banner Subtitle / Description
                </label>
                <textarea
                  rows={2}
                  value={form.subtitle || ""}
                  onChange={(e) => setForm((prev) => ({ ...prev, subtitle: e.target.value }))}
                  placeholder="Step into the new season with premium comfort and effortless style..."
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-zinc-800 bg-zinc-950 text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Button CTA Text
                  </label>
                  <input
                    type="text"
                    value={form.ctaText || ""}
                    onChange={(e) => setForm((prev) => ({ ...prev, ctaText: e.target.value }))}
                    placeholder="SHOP NEW ARRIVALS"
                    className="w-full px-4 py-2.5 text-xs rounded-xl border border-zinc-800 bg-zinc-950 text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Button Destination Link
                  </label>
                  <input
                    type="text"
                    value={form.ctaLink || ""}
                    onChange={(e) => setForm((prev) => ({ ...prev, ctaLink: e.target.value }))}
                    placeholder="/shop?sort=newest"
                    className="w-full px-4 py-2.5 text-xs rounded-xl border border-zinc-800 bg-zinc-950 text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-4 border-t border-zinc-800 flex items-center justify-end">
              <button
                type="submit"
                disabled={saving || uploadingImage || uploadingVideo}
                className="px-7 py-3 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold shadow-lg shadow-brand-500/20 disabled:opacity-50 flex items-center gap-2 transition-all hover:scale-105"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                <span>Save & Publish Shop Banner</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Live Interactive Storefront Simulation Preview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-brand-500" />
              <span>Live Simulation Preview</span>
            </span>
            <span className="text-[10px] text-zinc-500">How it appears on /shop</span>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-2xl relative min-h-[360px] flex items-center p-6 sm:p-8 text-white">
            {/* Background Media */}
            {isVideo ? (
              <video
                key={form.videoUrl || ""}
                src={form.videoUrl || ""}
                poster={form.imageUrl || undefined}
                autoPlay
                muted
                loop
                playsInline
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              />
            ) : (
              <Image
                src={form.imageUrl || "/images/shop-banner.png"}
                alt={form.heading}
                fill
                className="object-cover pointer-events-none"
              />
            )}

            {/* Contrast Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 md:via-zinc-950/40 to-transparent pointer-events-none" />

            {/* Content Preview */}
            <div className="relative z-10 max-w-sm space-y-3">
              {form.badge && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-900/90 text-brand-400 text-[10px] font-bold border border-zinc-800 backdrop-blur-md">
                  <Sparkles className="w-3 h-3 text-brand-500" />
                  <span>{form.badge}</span>
                </div>
              )}

              <h3 className="text-2xl font-display font-black tracking-tight leading-tight">
                {form.heading}
              </h3>

              {form.subtitle && (
                <p className="text-xs text-zinc-300 leading-relaxed line-clamp-3">
                  {form.subtitle}
                </p>
              )}

              {form.ctaText && (
                <div className="pt-1">
                  <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-zinc-950 text-xs font-bold shadow-xl">
                    <span>{form.ctaText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              )}
            </div>

            {/* Media Type Badge Indicator */}
            <div className="absolute top-4 right-4 z-20">
              {form.mediaType === "video" ? (
                <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 backdrop-blur-md text-[10px] font-bold">
                  <Film className="w-3 h-3" />
                  <span>VIDEO BANNER</span>
                </span>
              ) : (
                <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 backdrop-blur-md text-[10px] font-bold">
                  <ImageIcon className="w-3 h-3" />
                  <span>IMAGE BANNER</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
