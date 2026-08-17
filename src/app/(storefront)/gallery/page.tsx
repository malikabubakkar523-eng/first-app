import React from "react";
import { db } from "@/lib/db";
import { GalleryClient } from "@/components/storefront/GalleryClient";
import { Sparkles, Camera } from "lucide-react";

export const revalidate = 0;

export default async function GalleryPage() {
  let items: any[] = [];
  try {
    items = await db.galleryItem.findMany({
      where: { isActive: true },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });
  } catch (error) {
    console.warn("⚠️ GalleryPage data query fallback:", error);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
      {/* Header Banner */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-brand-500 text-xs font-bold uppercase tracking-wider">
          <Camera className="w-3.5 h-3.5" />
          <span>SS26 LOOKBOOK & RUNWAY ARCHIVE</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-display font-black tracking-tight text-zinc-900 dark:text-white">
          Style & Performance Gallery
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
          Explore how tastemakers, marathon runners, and fashion icons style VELOCE silhouettes across Paris runways, Brooklyn tracks, and Tuscan streets.
        </p>
      </div>

      {/* Main Gallery Items */}
      <GalleryClient initialItems={items} />
    </div>
  );
}
