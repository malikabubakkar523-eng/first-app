"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import { useLiveSync } from "@/lib/useLiveSync";

export interface ShopBannerData {
  id: string;
  badge: string | null;
  heading: string;
  subtitle: string | null;
  imageUrl: string;
  videoUrl?: string | null;
  mediaType: "image" | "video" | string;
  ctaText: string | null;
  ctaLink: string | null;
  isActive: boolean;
}

export function ShopPageBanner({
  initialBanner,
  productCount = 0,
}: {
  initialBanner?: ShopBannerData | null;
  productCount?: number;
}) {
  const [banner, setBanner] = useState<ShopBannerData | null>(
    initialBanner || {
      id: "default",
      badge: "NEW ARRIVALS • SPRING/SUMMER 2026",
      heading: "FRESH STYLES. BOLD MOVES.",
      subtitle:
        "Step into the new season with premium comfort and effortless style. High performance meets runway aesthetics.",
      imageUrl: "/images/shop-banner.png",
      videoUrl: null,
      mediaType: "image",
      ctaText: "SHOP NEW ARRIVALS",
      ctaLink: "/shop?sort=newest",
      isActive: true,
    }
  );

  // Live Sync: updates immediately when Admin saves new video or image
  useLiveSync("SHOP_BANNER", async () => {
    try {
      const res = await fetch("/api/content/shop-banner", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.banner) {
          setBanner(data.banner);
        }
      }
    } catch (e) {
      // ignore
    }
  });

  if (!banner || !banner.isActive) return null;

  const isVideo = (banner.mediaType === "video" || !!banner.videoUrl) && !!banner.videoUrl;

  return (
    <div className="relative w-full overflow-hidden bg-zinc-950 text-white min-h-[260px] sm:min-h-[340px] lg:min-h-[380px] flex items-center border-b border-zinc-200 dark:border-zinc-800">
      {/* Background Media Layer */}
      <div className="absolute inset-0 z-0">
        {isVideo ? (
          <video
            key={banner.videoUrl || ""}
            src={banner.videoUrl || ""}
            poster={banner.imageUrl || undefined}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            className="w-full h-full object-cover object-center"
          />
        ) : (
          <Image
            src={banner.imageUrl || "/images/shop-banner.png"}
            alt={banner.heading}
            fill
            priority
            sizes="100vw"
            className="object-cover object-right md:object-center opacity-90 brightness-95 dark:brightness-90"
          />
        )}

        {/* High-contrast gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/90 via-zinc-950/60 md:via-zinc-950/35 to-transparent z-[1] pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-zinc-950/70 to-transparent z-[1] pointer-events-none" />
      </div>

      {/* Foreground Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-8 sm:py-12">
        <div className="max-w-xl space-y-3 sm:space-y-4">
          {banner.badge && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/80 backdrop-blur-md text-brand-400 text-[11px] font-bold uppercase tracking-wider border border-zinc-700/80 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-brand-500" />
              <span>{banner.badge}</span>
            </div>
          )}

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-black text-white tracking-tight leading-[1.08] whitespace-pre-line">
            {banner.heading}
          </h1>

          {banner.subtitle && (
            <p className="text-xs sm:text-sm text-zinc-200 sm:text-zinc-300 leading-relaxed max-w-md">
              {banner.subtitle}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href={banner.ctaLink || "/shop?sort=newest"}
              className="px-6 py-2.5 sm:px-7 sm:py-3 rounded-full bg-white text-zinc-950 hover:bg-zinc-100 text-xs font-bold shadow-xl hover:scale-105 transition-all flex items-center gap-2"
            >
              <span>{banner.ctaText || "SHOP NEW ARRIVALS"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <span className="text-xs font-mono text-zinc-300">
              {productCount} {productCount === 1 ? "Pair" : "Pairs Available"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
